/**
 * In-memory semantic query cache.
 */

interface CacheEntry {
  result: any;
  timestamp: number;
}

/**
 * Jaccard index on character bigrams.
 */
function bigramSimilarity(a: string, b: string): number {
  if (!a || !b) return 0;
  
  const getBigrams = (str: string) => {
    const bigrams = new Set<string>();
    for (let i = 0; i < str.length - 1; i++) {
      bigrams.add(str.substring(i, i + 2));
    }
    return bigrams;
  };

  const bigramsA = getBigrams(a);
  const bigramsB = getBigrams(b);
  
  if (bigramsA.size === 0 && bigramsB.size === 0) return 1;
  if (bigramsA.size === 0 || bigramsB.size === 0) return 0;

  let intersection = 0;
  for (const bg of bigramsA) {
    if (bigramsB.has(bg)) {
      intersection++;
    }
  }

  const union = bigramsA.size + bigramsB.size - intersection;
  return intersection / union;
}

export class SemanticCache {
  private cache: Map<string, CacheEntry> = new Map();
  private readonly maxEntries: number = 200;
  private readonly ttlMs: number;

  constructor(ttlMinutes: number = 10) {
    this.ttlMs = ttlMinutes * 60 * 1000;
  }

  set(query: string, result: any): void {
    const key = query.toLowerCase().trim();
    
    if (this.cache.size >= this.maxEntries) {
      // LRU eviction (Maps iterate in insertion order)
      const firstKey = this.cache.keys().next().value;
      if (firstKey) this.cache.delete(firstKey);
    }
    
    // If it exists, delete it first to renew insertion order
    if (this.cache.has(key)) {
      this.cache.delete(key);
    }

    this.cache.set(key, {
      result,
      timestamp: Date.now()
    });
  }

  get(query: string, similarityThreshold: number = 0.75): any | null {
    const key = query.toLowerCase().trim();
    const now = Date.now();

    // 1. Exact match
    const exactMatch = this.cache.get(key);
    if (exactMatch) {
      if (now - exactMatch.timestamp > this.ttlMs) {
        this.cache.delete(key);
      } else {
        // Renew LRU
        this.cache.delete(key);
        this.cache.set(key, exactMatch);
        return exactMatch.result;
      }
    }

    // 2. Fuzzy match
    let bestScore = 0;
    let bestKey: string | null = null;
    let bestEntry: CacheEntry | null = null;

    for (const [cachedKey, entry] of this.cache.entries()) {
      if (now - entry.timestamp > this.ttlMs) {
        this.cache.delete(cachedKey);
        continue;
      }

      const score = bigramSimilarity(key, cachedKey);
      if (score > bestScore) {
        bestScore = score;
        bestKey = cachedKey;
        bestEntry = entry;
      }
    }

    if (bestScore >= similarityThreshold && bestEntry && bestKey) {
      // Renew LRU
      this.cache.delete(bestKey);
      this.cache.set(bestKey, bestEntry);
      return bestEntry.result;
    }

    return null;
  }

  clear(): void {
    this.cache.clear();
  }
}
