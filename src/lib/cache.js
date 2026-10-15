// TTL cache - tracks hits/misses for /api/cache/stats
export class TtlCache {
  constructor(ttlSeconds) {
    this.ttlSeconds = ttlSeconds;
    this.entries = new Map();
    this.hits = 0;
    this.misses = 0;
  }

  // Each lookup counts as either one hit or one miss
  get(key) {
    const entry = this.entries.get(key);

    if (entry && entry.expiresAt > Date.now()) {
      this.hits += 1;
      return entry.value;
    }

    // expired entries count as a miss and get cleared out
    if (entry) {
      this.entries.delete(key);
    }
    this.misses += 1;
    return undefined;
  }

  set(key, value) {
    this.entries.set(key, { value, expiresAt: Date.now() + this.ttlSeconds * 1000 });
  }

  stats() {
    // only counts entries that are still valid
    const now = Date.now();
    let entries = 0;
    for (const entry of this.entries.values()) {
      if (entry.expiresAt > now) {
        entries += 1;
      }
    }

    return { entries, hits: this.hits, misses: this.misses, ttlSeconds: this.ttlSeconds };
  }
}