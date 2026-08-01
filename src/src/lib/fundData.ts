// Shared mutual fund data access — every calculator imports from here so
// there's exactly one fetch pattern and one cache, instead of each page
// re-querying Firestore independently.

import { db } from "./firebase";
import { collection, getDocs, query, limit } from "firebase/firestore";

export interface FundRecord {
  category: string;
  fundCode: string | number | null;
  schemeName: string;
  isin: string | null;
  nav: number | null;
  schemeType: string | null;
  inceptionDate: string | null;
  ageYears: number | null;
  aumCr: number | null;
  expenseRatio: number | null;
  metrics: Record<string, number>;
}

const CACHE_KEY = "nw_fund_cache_v1";
const CACHE_TTL_MS = 10 * 60 * 1000; // 10 minutes — keeps calculators snappy without going stale for long

let memoryCache: FundRecord[] | null = null;

/** Fetches all funds once, cached in memory + sessionStorage for 10 minutes. */
export async function getAllFunds(): Promise<FundRecord[]> {
  if (memoryCache) return memoryCache;

  try {
    const raw = sessionStorage.getItem(CACHE_KEY);
    if (raw) {
      const parsed = JSON.parse(raw);
      if (Date.now() - parsed.fetchedAt < CACHE_TTL_MS) {
        memoryCache = parsed.funds;
        return memoryCache!;
      }
    }
  } catch {
    // sessionStorage unavailable or corrupted — fall through to a fresh fetch
  }

  const snap = await getDocs(collection(db, "mutualFunds"));
  const funds = snap.docs.map((d) => d.data() as FundRecord);
  memoryCache = funds;

  try {
    sessionStorage.setItem(CACHE_KEY, JSON.stringify({ fetchedAt: Date.now(), funds }));
  } catch {
    // storage full or unavailable — not critical, in-memory cache still works for this page
  }

  return funds;
}

/**
 * Loads funds progressively: calls onFirstBatch quickly with ~50 records so
 * the UI can render right away, then calls onComplete once the full dataset
 * (all ~2,700+ records) has loaded in the background. If a fresh cache
 * already exists, both callbacks fire immediately with the full data.
 */
export async function getFundsProgressive(
  onFirstBatch: (funds: FundRecord[]) => void,
  onComplete: (funds: FundRecord[]) => void
): Promise<void> {
  if (memoryCache) {
    onFirstBatch(memoryCache);
    onComplete(memoryCache);
    return;
  }

  try {
    const raw = sessionStorage.getItem(CACHE_KEY);
    if (raw) {
      const parsed = JSON.parse(raw);
      if (Date.now() - parsed.fetchedAt < CACHE_TTL_MS) {
        memoryCache = parsed.funds;
        onFirstBatch(memoryCache!);
        onComplete(memoryCache!);
        return;
      }
    }
  } catch {
    // fall through to a fresh fetch
  }

  // Quick first batch — 50 records, so the page has something to show
  // almost instantly instead of a blank loading state for several seconds.
  try {
    const firstSnap = await getDocs(query(collection(db, "mutualFunds"), limit(50)));
    onFirstBatch(firstSnap.docs.map((d) => d.data() as FundRecord));
  } catch {
    // if this fails, the full fetch below will still run and report the real state
  }

  const full = await getAllFunds();
  onComplete(full);

export function getCategories(funds: FundRecord[]): string[] {
  return Array.from(new Set(funds.map((f) => f.category))).sort();
}

export function fundsInCategory(funds: FundRecord[], category: string): FundRecord[] {
  return funds.filter((f) => f.category === category);
}

/** Best-available annualized return for a fund, preferring 3Yr CAGR. */
export function fundReturn(fund: FundRecord): number | null {
  const r =
    fund.metrics?.["CAGR:3 Yr"] ??
    fund.metrics?.["SIP Returns:3 Yr"] ??
    fund.metrics?.["CAGR:5 Yr"] ??
    fund.metrics?.["SIP Returns:5 Yr"];
  return typeof r === "number" && !isNaN(r) ? r : null;
}

export function averageReturn(funds: FundRecord[], categories: string[]): number | null {
  const vals = funds
    .filter((f) => categories.includes(f.category))
    .map(fundReturn)
    .filter((v): v is number => v !== null);
  if (!vals.length) return null;
  return vals.reduce((a, b) => a + b, 0) / vals.length;
}

export function topFundsByReturn(funds: FundRecord[], categories: string[], n = 10): FundRecord[] {
  return funds
    .filter((f) => categories.includes(f.category) && fundReturn(f) !== null)
    .sort((a, b) => (fundReturn(b) ?? 0) - (fundReturn(a) ?? 0))
    .slice(0, n);
}
