/**
 * 缓存管理服务
 * 负责定期清理过期缓存，优化内存使用
 */
import { ImageProxyService } from './image-proxy-service';

export class CacheManager {
  private static cleanupInterval: NodeJS.Timeout | null = null;
  private static readonly CLEANUP_INTERVAL = 60 * 60 * 1000; // 每小时清理一次

  /**
   * 启动自动清理定时器
   */
  static startAutoCleanup(): void {
    if (this.cleanupInterval) {
      console.log('⚠️ 缓存清理定时器已在运行');
      return;
    }

    console.log('🚀 启动缓存自动清理服务');
    
    this.cleanupInterval = setInterval(() => {
      try {
        const statsBefore = ImageProxyService.getCacheStats();
        const cleaned = ImageProxyService.cleanupExpiredCache();
        const statsAfter = ImageProxyService.getCacheStats();
        
        console.log(`🧹 缓存清理报告: 
  清理前: ${statsBefore.total}项 (${statsBefore.valid}有效, ${statsBefore.expired}过期)
  清理了: ${cleaned}项
  清理后: ${statsAfter.total}项 (${statsAfter.valid}有效, ${statsAfter.expired}过期)`);
      } catch (error) {
        console.error('❌ 缓存清理失败:', error);
      }
    }, this.CLEANUP_INTERVAL);
  }

  /**
   * 停止自动清理定时器
   */
  static stopAutoCleanup(): void {
    if (this.cleanupInterval) {
      clearInterval(this.cleanupInterval);
      this.cleanupInterval = null;
      console.log('⏹️ 缓存自动清理服务已停止');
    }
  }

  /**
   * 手动触发清理
   */
  static manualCleanup(): { 
    cleaned: number; 
    stats: { total: number; expired: number; valid: number } 
  } {
    const statsBefore = ImageProxyService.getCacheStats();
    const cleaned = ImageProxyService.cleanupExpiredCache();
    const statsAfter = ImageProxyService.getCacheStats();
    
    return {
      cleaned,
      stats: statsAfter
    };
  }

  /**
   * 获取当前缓存状态
   */
  static getCacheStatus(): {
    stats: { total: number; expired: number; valid: number };
    autoCleanupEnabled: boolean;
    nextCleanupIn: number;
  } {
    return {
      stats: ImageProxyService.getCacheStats(),
      autoCleanupEnabled: !!this.cleanupInterval,
      nextCleanupIn: this.cleanupInterval ? this.CLEANUP_INTERVAL : 0
    };
  }
}

// 应用启动时自动启动缓存清理
if (typeof window === 'undefined') {
  // 在Node.js环境中自动启动（如果是后端服务）
  CacheManager.startAutoCleanup();
}

export default CacheManager;