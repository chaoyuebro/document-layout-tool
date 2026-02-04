/**
 * 图片代理服务
 * 用于绕过CORS限制，并实现智能缓存和转存机制
 */
import axios from 'axios';

interface CachedImageData {
  base64: string;
  mimeType: string;
  size: number;
  cachedAt: string;
  expiresAt: string;
  originalUrl: string;
}

export class ImageProxyService {
  private static readonly TIMEOUT = 30000; // 30秒超时
  private static readonly CACHE_DURATION = 24 * 60 * 60 * 1000; // 24小时缓存
  private static cache: Map<string, CachedImageData> = new Map();

  /**
   * 智能下载图片：通过Vite后端代理API下载
   * @param imageUrl 火山方舟临时URL
   * @param forceRefresh 是否强制刷新缓存
   * @returns Base64编码的图片数据
   */
  static async smartDownload(imageUrl: string, forceRefresh: boolean = false): Promise<{
    base64: string;
    mimeType: string;
    size: number;
    fromCache: boolean;
  }> {
    const cacheKey = this.generateCacheKey(imageUrl);
    
    // 1. 检查缓存
    if (!forceRefresh) {
      const cached = this.getFromCache(cacheKey);
      if (cached) {
        console.log('📦 从缓存获取图片');
        return {
          ...cached,
          fromCache: true
        };
      }
    }

    try {
      console.log('🔄 开始通过后端API代理下载图片...');
      
      // 2. 调用Vite后端代理API
      const response = await axios.get('/api/proxy/image', {
        params: { url: imageUrl },
        timeout: this.TIMEOUT
      });

      if (!response.data.success) {
        throw new Error(response.data.error || '代理下载失败');
      }

      const { base64, mimeType, size } = response.data.data;

      // 3. 缓存数据
      const cacheData: CachedImageData = {
        base64,
        mimeType,
        size,
        cachedAt: new Date().toISOString(),
        expiresAt: new Date(Date.now() + this.CACHE_DURATION).toISOString(),
        originalUrl: imageUrl
      };
      
      this.cache.set(cacheKey, cacheData);
      console.log(`✅ 图片代理下载并缓存完成: ${base64.length} 字符`);

      return {
        base64: cacheData.base64,
        mimeType: cacheData.mimeType,
        size: cacheData.size,
        fromCache: false
      };

    } catch (error) {
      console.error('❌ 图片代理下载失败:', error);
      throw new Error(`图片代理下载失败: ${(error as Error).message}`);
    }
  }

  /**
   * 生成缓存键
   */
  private static generateCacheKey(url: string): string {
    // 使用URL的哈希值作为缓存键
    return btoa(url).slice(0, 32);
  }

  /**
   * 从缓存获取数据
   */
  private static getFromCache(key: string): Omit<CachedImageData, 'originalUrl'> | null {
    const cached = this.cache.get(key);
    if (!cached) return null;

    // 检查是否过期
    const now = Date.now();
    const expiresAt = new Date(cached.expiresAt).getTime();
    
    if (now > expiresAt) {
      console.log('⏰ 缓存已过期，删除:', key);
      this.cache.delete(key);
      return null;
    }

    const { originalUrl, ...dataWithoutUrl } = cached;
    return dataWithoutUrl;
  }

  /**
   * 清理过期缓存
   */
  static cleanupExpiredCache(): number {
    const now = Date.now();
    let cleanedCount = 0;
    
    for (const [key, data] of this.cache.entries()) {
      const expiresAt = new Date(data.expiresAt).getTime();
      if (now > expiresAt) {
        this.cache.delete(key);
        cleanedCount++;
      }
    }
    
    console.log(`🧹 清理了 ${cleanedCount} 个过期缓存`);
    return cleanedCount;
  }

  /**
   * 获取缓存统计信息
   */
  static getCacheStats(): { total: number; expired: number; valid: number } {
    const now = Date.now();
    let expired = 0;
    let valid = 0;
    
    for (const data of this.cache.values()) {
      const expiresAt = new Date(data.expiresAt).getTime();
      if (now > expiresAt) {
        expired++;
      } else {
        valid++;
      }
    }
    
    return {
      total: this.cache.size,
      expired,
      valid
    };
  }

  // 保留原有方法以保持向后兼容
  static async downloadAsBase64(imageUrl: string) {
    const result = await this.smartDownload(imageUrl);
    return {
      base64: result.base64,
      mimeType: result.mimeType,
      size: result.size
    };
  }

  static async downloadAsBlobUrl(imageUrl: string): Promise<string> {
    try {
      const result = await this.smartDownload(imageUrl);
      const byteCharacters = atob(result.base64);
      const byteNumbers = new Array(byteCharacters.length);
      
      for (let i = 0; i < byteCharacters.length; i++) {
        byteNumbers[i] = byteCharacters.charCodeAt(i);
      }
      
      const byteArray = new Uint8Array(byteNumbers);
      const blob = new Blob([byteArray], { type: result.mimeType });
      return URL.createObjectURL(blob);
    } catch (error) {
      console.error('Blob URL生成失败:', error);
      throw error;
    }
  }

  static async batchDownload(imageUrls: string[]): Promise<Array<{
    index: number;
    base64: string;
    mimeType: string;
    size: number;
  }>> {
    const results: Array<{
      index: number;
      base64: string;
      mimeType: string;
      size: number;
    }> = [];

    const CONCURRENT_LIMIT = 3;
    const chunks = this.chunkArray(imageUrls, CONCURRENT_LIMIT);

    for (const chunk of chunks) {
      const promises = chunk.map(async (url, index) => {
        try {
          const result = await this.smartDownload(url);
          return {
            index: chunk.indexOf(url),
            base64: result.base64,
            mimeType: result.mimeType,
            size: result.size
          };
        } catch (error) {
          console.error(`第${index}张图片下载失败:`, error);
          return null;
        }
      });

      const chunkResults = await Promise.all(promises);
      results.push(...chunkResults.filter(Boolean) as any[]);
    }

    return results;
  }

  private static chunkArray<T>(array: T[], chunkSize: number): T[][] {
    const chunks: T[][] = [];
    for (let i = 0; i < array.length; i += chunkSize) {
      chunks.push(array.slice(i, i + chunkSize));
    }
    return chunks;
  }

  static cleanupBlobUrls(blobUrls: string[]): void {
    blobUrls.forEach(url => {
      try {
        URL.revokeObjectURL(url);
      } catch (error) {
        console.warn('清理Blob URL失败:', error);
      }
    });
  }
}

export default ImageProxyService;