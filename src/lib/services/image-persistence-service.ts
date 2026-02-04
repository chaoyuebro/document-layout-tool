/**
 * 图片持久化服务
 * 负责将远程图片下载并存储为Base64格式到数据库
 */
import { ImageDownloader, StoredImageData } from '../utils/image-downloader';
import { supabase } from '@/lib/supabase';
import { toast } from 'sonner';

export class ImagePersistenceService {
  /**
   * 将远程图片URL持久化为Base64并存储
   * @param imageUrl 远程图片URL
   * @param cardIndex 卡片索引
   * @returns 存储的图片数据
   */
  static async persistImage(imageUrl: string, cardIndex: number): Promise<StoredImageData> {
    try {
      console.log(`🔄 开始持久化第 ${cardIndex + 1} 张图片:`, imageUrl);
      
      // 1. 下载图片为Base64
      const base64Data = await ImageDownloader.downloadAsBase64(imageUrl);
      console.log(`✅ 图片下载完成，Base64长度:`, base64Data.length);
      
      // 2. 获取图片元数据
      const metadata = await this.getImageMetadata(base64Data, imageUrl);
      
      // 3. 创建存储数据对象
      const storedData: StoredImageData = {
        id: `${Date.now()}-${cardIndex}`,
        base64: base64Data,
        mimeType: metadata.mimeType,
        originalUrl: imageUrl,
        createdAt: new Date().toISOString(),
        size: base64Data.length
      };
      
      console.log(`💾 图片持久化完成:`, storedData);
      return storedData;
      
    } catch (error) {
      console.error(`❌ 第 ${cardIndex + 1} 张图片持久化失败:`, error);
      throw new Error(`图片持久化失败: ${(error as Error).message}`);
    }
  }

  /**
   * 批量持久化多张图片
   * @param imageUrls 图片URL数组
   * @returns 持久化的图片数据数组
   */
  static async batchPersistImages(imageUrls: Record<number, string>): Promise<Record<number, StoredImageData>> {
    const results: Record<number, StoredImageData> = {};
    
    const promises = Object.entries(imageUrls).map(async ([indexStr, url]) => {
      const index = parseInt(indexStr);
      try {
        const storedData = await this.persistImage(url, index);
        results[index] = storedData;
        toast.success(`第 ${index + 1} 张图片已持久化`);
      } catch (error) {
        console.error(`第 ${index + 1} 张图片持久化失败:`, error);
        toast.error(`第 ${index + 1} 张图片持久化失败`);
      }
    });
    
    await Promise.allSettled(promises);
    return results;
  }

  /**
   * 从Base64数据生成可预览的Blob URL
   * @param base64Data Base64图片数据
   * @param mimeType MIME类型
   * @returns Blob URL
   */
  static generatePreviewUrl(base64Data: string, mimeType: string = 'image/jpeg'): string {
    return ImageDownloader.base64ToBlobUrl(base64Data, mimeType);
  }

  /**
   * 清理过期的Blob URL（避免内存泄漏）
   * @param blobUrls Blob URL数组
   */
  static cleanupBlobUrls(blobUrls: string[]): void {
    blobUrls.forEach(url => {
      try {
        URL.revokeObjectURL(url);
      } catch (error) {
        console.warn('清理Blob URL失败:', error);
      }
    });
  }

  /**
   * 获取图片元数据
   * @param base64Data Base64数据
   * @param originalUrl 原始URL
   * @returns 图片元数据
   */
  private static async getImageMetadata(base64Data: string, originalUrl: string): Promise<{ 
    mimeType: string; 
    size: number; 
    width?: number; 
    height?: number 
  }> {
    return new Promise((resolve, reject) => {
      const img = new Image();
      img.onload = () => {
        resolve({
          mimeType: 'image/jpeg',
          size: base64Data.length,
          width: img.naturalWidth,
          height: img.naturalHeight
        });
      };
      img.onerror = reject;
      img.src = `data:image/jpeg;base64,${base64Data}`;
    });
  }

  /**
   * 压缩并持久化图片（节省存储空间）
   * @param imageUrl 原始图片URL
   * @param cardIndex 卡片索引
   * @param quality 压缩质量 (0-1)
   * @returns 压缩后的存储数据
   */
  static async persistCompressedImage(
    imageUrl: string, 
    cardIndex: number, 
    quality: number = 0.8
  ): Promise<StoredImageData> {
    try {
      // 1. 下载原始图片
      const originalBase64 = await ImageDownloader.downloadAsBase64(imageUrl);
      
      // 2. 压缩图片
      const compressedBase64 = await ImageDownloader.compressBase64(originalBase64, quality);
      
      // 3. 获取元数据
      const metadata = await this.getImageMetadata(compressedBase64, imageUrl);
      
      // 4. 创建存储对象
      const storedData: StoredImageData = {
        id: `${Date.now()}-${cardIndex}-compressed`,
        base64: compressedBase64,
        mimeType: metadata.mimeType,
        originalUrl: imageUrl,
        createdAt: new Date().toISOString(),
        size: compressedBase64.length
      };
      
      console.log(`📊 压缩效果: ${originalBase64.length} -> ${compressedBase64.length} bytes`);
      return storedData;
      
    } catch (error) {
      console.error('图片压缩持久化失败:', error);
      throw error;
    }
  }
}

export default ImagePersistenceService;