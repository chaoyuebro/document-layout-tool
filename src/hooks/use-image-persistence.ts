/**
 * 图片持久化Hook
 * 提供图片下载、Base64转换和数据库存储功能
 */
import { useState, useCallback } from 'react';
import { toast } from 'sonner';
import { ImagePersistenceService } from '@/lib/services/image-persistence-service';
import { useEditor } from '@/contexts/EditorContext';

export const useImagePersistence = () => {
  const [isPersisting, setIsPersisting] = useState(false);
  const {
    cardImages,
    cardImagesBase64,
    setCardImagesBase64,
    cardImagesMetadata,
    setCardImagesMetadata,
    saveProject
  } = useEditor();

  /**
   * 批量持久化所有当前图片
   */
  const persistAllImages = useCallback(async () => {
    if (Object.keys(cardImages).length === 0) {
      toast.info('当前没有可持久化的图片');
      return;
    }

    setIsPersisting(true);
    const toastId = toast.loading(`正在持久化 ${Object.keys(cardImages).length} 张图片...`);

    try {
      // 1. 批量下载并转换为Base64
      const persistedData = await ImagePersistenceService.batchPersistImages(cardImages);

      // 2. 准备存储数据
      const base64Images: Record<number, string> = {};
      const metadata: Record<number, { mimeType: string; size: number; originalUrl?: string }> = {};

      Object.entries(persistedData).forEach(([indexStr, data]) => {
        const index = parseInt(indexStr);
        base64Images[index] = data.base64;
        metadata[index] = {
          mimeType: data.mimeType,
          size: data.size,
          originalUrl: data.originalUrl
        };
      });

      // 3. 更新状态
      setCardImagesBase64(base64Images);
      setCardImagesMetadata(metadata);

      // 4. 保存到数据库
      await saveProject({
        card_images_base64: base64Images,
        card_images_metadata: metadata
      });

      toast.success(`✅ 成功持久化 ${Object.keys(persistedData).length} 张图片！`, { id: toastId });

    } catch (error) {
      console.error('批量持久化失败:', error);
      toast.error(`持久化失败: ${(error as Error).message}`, { id: toastId });
    } finally {
      setIsPersisting(false);
    }
  }, [cardImages, setCardImagesBase64, setCardImagesMetadata, saveProject]);

  /**
   * 持久化单张图片
   */
  const persistSingleImage = useCallback(async (index: number) => {
    const imageUrl = cardImages[index];
    if (!imageUrl) {
      toast.error('该卡片没有图片');
      return;
    }

    const toastId = toast.loading(`正在持久化第 ${index + 1} 张图片...`);

    try {
      const persistedData = await ImagePersistenceService.persistImage(imageUrl, index);

      // 更新状态
      const newBase64 = { ...cardImagesBase64, [index]: persistedData.base64 };
      const newMetadata = {
        ...cardImagesMetadata, [index]: {
          mimeType: persistedData.mimeType,
          size: persistedData.size,
          originalUrl: persistedData.originalUrl
        }
      };

      setCardImagesBase64(newBase64);
      setCardImagesMetadata(newMetadata);

      // 保存到数据库
      await saveProject({
        card_images_base64: { [index]: persistedData.base64 },
        card_images_metadata: {
          [index]: {
            mimeType: persistedData.mimeType,
            size: persistedData.size,
            originalUrl: persistedData.originalUrl
          }
        }
      });

      toast.success(`第 ${index + 1} 张图片持久化成功！`, { id: toastId });

    } catch (error) {
      console.error(`第 ${index + 1} 张图片持久化失败:`, error);
      toast.error(`持久化失败: ${(error as Error).message}`, { id: toastId });
    }
  }, [cardImages, setCardImagesBase64, setCardImagesMetadata, saveProject]);

  /**
   * 从Base64数据生成预览URL
   */
  const generatePreviewUrl = useCallback((base64Data: string, mimeType: string = 'image/jpeg') => {
    return ImagePersistenceService.generatePreviewUrl(base64Data, mimeType);
  }, []);

  return {
    isPersisting,
    persistAllImages,
    persistSingleImage,
    generatePreviewUrl
  };
};