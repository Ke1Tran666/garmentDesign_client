/**
 * In-memory Cache Manager with TTL (Time To Live).
 * Dùng để cache dữ liệu GET từ Backend (mặc định 10 giây).
 * Giúp điều hướng mượt mà, 0ms lag, và tự động dọn dẹp khi có thao tác ghi (POST/PATCH/DELETE).
 */

class CacheManager {
  constructor() {
    this.cache = new Map();
  }

  /**
   * Lấy dữ liệu từ cache nếu còn trong thời hạn TTL (mặc định 10.000ms = 10s)
   * @param {string} key
   * @returns {any|null}
   */
  get(key) {
    const entry = this.cache.get(key);
    if (!entry) return null;

    const isExpired = Date.now() - entry.timestamp > entry.ttl;
    if (isExpired) {
      this.cache.delete(key);
      return null;
    }

    return entry.data;
  }

  /**
   * Lưu dữ liệu vào cache
   * @param {string} key
   * @param {any} data
   * @param {number} [ttl=10000] - Thời gian sống tính theo milliseconds (mặc định 10s)
   */
  set(key, data, ttl = 10000) {
    this.cache.set(key, {
      data,
      timestamp: Date.now(),
      ttl,
    });
  }

  /**
   * Xóa một key cụ thể hoặc các key bắt đầu bằng tiền tố (pattern prefix)
   * Ví dụ: invalidate("service-orders") sẽ xóa toàn bộ key liên quan đến service orders.
   * @param {string} keyOrPrefix
   */
  invalidate(keyOrPrefix) {
    if (!keyOrPrefix) return;

    for (const key of this.cache.keys()) {
      if (key === keyOrPrefix || key.startsWith(keyOrPrefix)) {
        this.cache.delete(key);
      }
    }
  }

  /**
   * Xóa sạch toàn bộ cache
   */
  clear() {
    this.cache.clear();
  }
}

export const cacheManager = new CacheManager();
