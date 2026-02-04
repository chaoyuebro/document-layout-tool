/**
 * 图片下载和存储工具
 * 支持将远程图片下载为 Base64 并存储到数据库
 */

export class ImageDownloader {
  /**
   * 将远程图片URL下载为Base64字符串
   * @param url 图片URL
   * @returns Base64编码的图片数据
   */
  static async downloadAsBase64(url: string): Promise<string> {
    try {
      const response = await fetch(url);
      if (!response.ok) {
        throw new Error(`HTTP ${response.status}: ${response.statusText}`);
      }
      
      const blob = await response.blob();
      return new Promise((resolve, reject) => {
        const reader = new FileReader();
        reader.onload = () => {
          const base64 = (reader.result as string).split(',')[1];
          resolve(base64);
        };
        reader.onerror = reject;
        reader.readAsDataURL(blob);
      });
    } catch (error) {
      console.error('图片下载失败:', error);
      throw new Error(`图片下载失败: ${(error as Error).message}`);
    }
  }

  /**
   * 将Base64图片数据转换为Blob URL用于预览
   * @param base64Data Base64图片数据
   * @param mimeType 图片MIME类型，默认为jpeg
   * @returns Blob URL
   */
  static base64ToBlobUrl(base64Data: string, mimeType: string = 'image/jpeg'): string {
    try {
      const byteCharacters = atob(base64Data);
      const byteNumbers = new Array(byteCharacters.length);
      for (let i = 0; i < byteCharacters.length; i++) {
        byteNumbers[i] = byteCharacters.charCodeAt(i);
      }
      const byteArray = new Uint8Array(byteNumbers);
      const blob = new Blob([byteArray], { type: mimeType });
      return URL.createObjectURL(blob);
    } catch (error) {
      console.error('Base64转Blob失败:', error);
      throw new Error('图片数据格式错误');
    }
  }

  /**
   * 批量下载图片并转换为Base64
   * @param urls 图片URL数组
   * @returns Base64数据数组
   */
  static async batchDownload(urls: string[]): Promise<string[]> {
    const promises = urls.map(url => this.downloadAsBase64(url));
    try {
      return await Promise.all(promises);
    } catch (error) {
      console.error('批量下载失败:', error);
      throw new Error(`批量下载失败: ${(error as Error).message}`);
    }
  }

  /**
   * 压缩Base64图片数据（可选）
   * @param base64Data 原始Base64数据
   * @param quality 压缩质量 (0-1)
   * @returns 压缩后的Base64数据
   */
  static async compressBase64(base64Data: string, quality: number = 0.8): Promise<string> {
    return new Promise((resolve, reject) => {
      const img = new Image();
      img.onload = () => {
        const canvas = document.createElement('canvas');
        const ctx = canvas.getContext('2d');
        if (!ctx) {
          reject(new Error('无法获取Canvas上下文'));
          return;
        }

        // 设置canvas尺寸
        canvas.width = img.width;
        canvas.height = img.height;
        
        // 绘制图片
        ctx.drawImage(img, 0, 0);
        
        // 转换为压缩后的Base64
        const compressedData = canvas.toDataURL('image/jpeg', quality);
        resolve(compressedData.split(',')[1]);
      };
      img.onerror = reject;
      img.src = `data:image/jpeg;base64,${base64Data}`;
    });
  }
}

// 类型定义
export interface StoredImageData {
  id: string;
  base64: string;
  mimeType: string;
  originalUrl?: string;
  createdAt: string;
  size: number; // 字节大小
}

export default ImageDownloader;