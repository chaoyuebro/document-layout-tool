import React, { useRef, useState, useMemo, useCallback, useEffect } from 'react';
import { motion } from 'framer-motion';
import { Download, Layers, Loader2, Sparkles, Wand2 } from 'lucide-react';
import { sliceContentByH2, smartSlice } from '@/lib/utils/text-slicer';
import { useEditor } from '@/contexts/EditorContext';
import { exportCardsAsZip } from '@/lib/export/xiaohongshu-exporter';
import { aiService } from '@/lib/api/ai-service';
import { toast } from 'sonner';
import { cn } from '@/lib/utils';

const CardPreview: React.FC = () => {
  const { 
    article, 
    registerXHSExport, 
    currentProjectId, 
    saveProject,
    aiCards,
    setAiCards,
    cardImages,
    setCardImages,
    cardImagesBase64,
    setCardImagesBase64,
    cardImagesMetadata,
    setCardImagesMetadata
  } = useEditor();
  
  const [isExporting, setIsExporting] = useState(false);
  const [isGenerating, setIsGenerating] = useState(false);
  const [generatingCardIndex, setGeneratingCardIndex] = useState<number | null>(null);
  const containerRef = useRef<HTMLDivElement>(null);

  // 同步状态到云端 (在关键 AI 操作完成后)
  const syncToCloud = useCallback(async () => {
    await saveProject();
  }, [saveProject]);

  // 使用 useMemo 稳定 sections 引用，防止 useEffect 无限循环
  const sections = useMemo(() => {
    if (aiCards && Array.isArray(aiCards)) {
      return aiCards.map(c => `## ${c.title || ''}\n${c.content || ''}`);
    }
    return smartSlice(sliceContentByH2(article.source));
  }, [aiCards, article.source]);

  // 检查图片是否有效，无效则重新生成
  const checkAndRegenerateImage = async (index: number, text: string) => {
    const currentUrl = cardImages[index];
    if (!currentUrl) return;
    
    try {
      // 简单检查：尝试加载图片
      const img = new Image();
      img.onload = () => console.log('图片有效');
      img.onerror = async () => {
        console.log('检测到图片失效，正在重新生成...');
        toast.info(`检测到第 ${index + 1} 张图片已失效，正在重新生成...`);
        await handleGenerateCardImage(index, text);
      };
      img.src = currentUrl;
    } catch (e) {
      console.log('图片检查失败，跳过');
    }
  };

  const handleGenerateCardImage = async (index: number, text: string) => {
    setGeneratingCardIndex(index);
    try {
      const result = await aiService.generateImage(text);
      if (result.imageUrl) {
        const newImages = { ...cardImages, [index]: result.imageUrl };
        setCardImages(newImages);
        
        // 🔥 自动持久化：如果有Base64数据，立即存储
        if (result.base64) {
          const newBase64 = { ...cardImagesBase64, [index]: result.base64 };
          const newMetadata = { ...cardImagesMetadata, [index]: { 
            mimeType: result.mimeType || 'image/jpeg', 
            size: result.size || 0,
            originalUrl: result.imageUrl 
          }};
          
          setCardImagesBase64(newBase64);
          setCardImagesMetadata(newMetadata);
          
          // 立即保存到数据库
          await saveProject({
            card_images: newImages,
            card_images_base64: newBase64,
            card_images_metadata: newMetadata
          });
          
          toast.success(`第 ${index + 1} 张卡片封面已自动生成并持久化！`);
        } else {
          // 降级：只存储URL
          await saveProject({
            card_images: newImages
          });
          toast.success(`第 ${index + 1} 张卡片封面已生成！`);
        }
      } else {
        toast.info('已为你生成生图提示词，建议手动生成图片插入');
      }
    } catch (e) {
      toast.error('配图失败');
    } finally {
      setGeneratingCardIndex(null);
    }
  };

  const handleAIEnhance = async () => {
    if (!article.source.trim()) return;
    setIsGenerating(true);
    
    try {
      // 1. 先进行排版切片
      const cards = await aiService.generateXHSCards(article.source);
      setAiCards(cards);
      toast.success('AI 排版完成，正在为您批量炼金生图...');

      // 2. 自动为所有卡片生成配图
      const newImages: Record<number, string> = {};
      const newBase64: Record<number, string> = {};
      const newMetadata: Record<number, { mimeType: string; size: number; originalUrl: string }> = {};
      
      // 并发生成
      const imagePromises = cards.map(async (card: { title: string; content: string }, index: number) => {
        try {
          const content = `## ${card.title}\n${card.content}`;
          const result = await aiService.generateImage(content);
          if (result.imageUrl) {
            newImages[index] = result.imageUrl;
            // 🔥 自动持久化Base64数据
            if (result.base64) {
              newBase64[index] = result.base64;
              newMetadata[index] = {
                mimeType: result.mimeType || 'image/jpeg',
                size: result.size || 0,
                originalUrl: result.imageUrl
              };
            }
          }
        } catch (err) {
          console.error(`第 ${index + 1} 张图片生成失败:`, err);
        }
      });

      await Promise.all(imagePromises);
      setCardImages(newImages);
      
      // 🔥 批量持久化所有Base64数据
      if (Object.keys(newBase64).length > 0) {
        setCardImagesBase64(newBase64);
        setCardImagesMetadata(newMetadata);
        
        // 一次性保存所有数据到数据库
        await saveProject({
          ai_cards: cards,
          card_images: newImages,
          card_images_base64: newBase64,
          card_images_metadata: newMetadata
        });
        
        toast.success(`AI 一键排版生图完成！(${Object.keys(newBase64).length}张已自动持久化)`);
      } else {
        // 降级：只存储URL
        setCardImages(newImages);
        await saveProject({ ai_cards: cards, card_images: newImages });
        toast.success('AI 一键排版生图完成！');
      }
    } catch (e) {
      console.error(e);
      toast.error('排版生图失败，请检查 AI 配置');
    } finally {
      setIsGenerating(false);
    }
  };

  /**
   * 仅生成/刷新封面图片 (第一张)
   */
  const handleGenerateCover = async () => {
    if (sections.length === 0) return;
    setGeneratingCardIndex(0);
    const toastId = toast.loading('正在为您重新炼制封面大片...');
    
    try {
      console.log('正在为封面生成图片，内容:', sections[0]);
      const result = await aiService.generateImage(sections[0]);
      
      if (result.imageUrl) {
        console.log('封面生成成功:', result.imageUrl);
        const newImages = { ...cardImages, [0]: result.imageUrl };
        setCardImages(newImages);
        
        // 🔥 自动持久化封面图片
        if (result.base64) {
          const newBase64 = { ...cardImagesBase64, [0]: result.base64 };
          const newMetadata = { ...cardImagesMetadata, [0]: { 
            mimeType: result.mimeType || 'image/jpeg', 
            size: result.size || 0,
            originalUrl: result.imageUrl 
          }};
          
          setCardImagesBase64(newBase64);
          setCardImagesMetadata(newMetadata);
          
          // 立即保存到数据库
          await saveProject({
            card_images: newImages,
            card_images_base64: newBase64,
            card_images_metadata: newMetadata
          });
          
          toast.success('封面图片已自动生成并持久化！', { id: toastId });
        } else {
          // 降级：只存储URL
          await saveProject({
            card_images: newImages
          });
          toast.success('封面图片已生成！', { id: toastId });
        }
      } else {
        console.warn('接口未返回图片URL，返回结果:', result);
        toast.info('已生成提示词，但未获得图片，请检查接口', { 
          id: toastId,
          description: '可以在控制台查看完整 AI 建议。'
        });
      }
    } catch (e: any) {
      console.error('封面生图彻底失败:', e);
      toast.error('封面生成失败', { 
        id: toastId,
        description: e.message || '请检查网络或 AI 模型配置' 
      });
    } finally {
      setGeneratingCardIndex(null);
    }
  };

  const handleExport = useCallback(async () => {
    setIsExporting(true);
    // @ts-ignore
    await exportCardsAsZip(containerRef, article.meta.title || 'xhs-cards');
    setIsExporting(false);
  }, [article.meta.title]); // 依赖项仅保留必要部分

  // 用于全局触发小红书导出
  useEffect(() => {
    registerXHSExport(handleExport);
  }, [registerXHSExport, handleExport]);

  if (isGenerating && (!sections || sections.length === 0)) {
    return (
      <div className="h-full flex flex-col items-center justify-center p-8 text-center bg-white/50 backdrop-blur-sm rounded-2xl border-2 border-dashed border-clay-primary/20">
        <div className="relative mb-6">
          <div className="w-20 h-20 border-4 border-clay-primary/10 border-t-clay-primary rounded-full animate-spin" />
          <Wand2 className="w-8 h-8 text-clay-primary absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 animate-pulse" />
        </div>
        <h3 className="text-xl font-black text-gray-900 mb-2">正在炼金排版...</h3>
        <p className="text-sm text-gray-500 max-w-xs mx-auto">
          AI 正在分析文案逻辑并绘制精美插画，请稍候片刻
        </p>
      </div>
    );
  }

  if (sections.length === 0) {
    return (
      <div className="h-full flex flex-col items-center justify-center text-gray-400 p-8 text-center">
        <Layers className="w-12 h-12 mb-4 opacity-20" />
        <p className="font-bold">暂无切片内容</p>
        <p className="text-xs mt-1">在编辑器中使用 ## 标题来触发自动切片</p>
      </div>
    );
  }

  return (
    <div className="h-full flex flex-col">
      <div className="flex justify-between items-center mb-6 px-2 gap-4">
        <div className="flex items-baseline gap-2">
          <h3 className="text-lg font-black text-gray-900 tracking-tight">
            XHS 卡片矩阵
          </h3>
          <span className="text-[10px] font-black text-gray-400 uppercase tracking-widest">
            {sections.length} CARDS
          </span>
        </div>
        
        <div className="flex gap-3">
          <button 
            disabled={isGenerating}
            onClick={handleGenerateCover}
            className="flex items-center gap-2 px-5 py-2.5 bg-white text-gray-700 text-xs font-black rounded-xl shadow-clay border-2 border-gray-100 hover:border-clay-primary hover:text-clay-primary transition-all group"
          >
            <Sparkles className="w-3.5 h-3.5 group-hover:animate-pulse" />
            重炼封面
          </button>

          <button 
            disabled={isGenerating}
            onClick={handleAIEnhance}
            className="flex items-center gap-2 px-6 py-2.5 bg-gray-900 text-white text-xs font-black rounded-xl shadow-clay hover:-translate-y-0.5 active:translate-y-0 disabled:opacity-50 transition-all border-2 border-gray-900"
          >
            {isGenerating ? <Loader2 className="w-4 h-4 animate-spin" /> : <Wand2 className="w-4 h-4 text-amber-400" />}
            AI 排版生图 (批量)
          </button>
        </div>
      </div>

      <div ref={containerRef} className="flex-1 overflow-y-auto clay-scrollbar grid grid-cols-1 md:grid-cols-2 gap-10 p-8 pb-32">
        {sections.map((section, index) => {
          const title = section.startsWith('## ') ? section.split('\n')[0].replace('## ', '') : '';
          const body = section.replace(/^## .*\n/, '');
          
          return (
            <motion.div
              key={index}
              initial={{ opacity: 0, y: 30 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: index * 0.05 }}
              className="xhs-card min-h-[500px] bg-white rounded-2xl border-2 border-gray-100 shadow-xl overflow-hidden flex flex-col group relative hover:border-clay-primary/50 transition-colors"
            >
              {/* 图片区域 - 优先使用Base64数据，降级使用URL */}
              <div className="aspect-[4/3] bg-gray-50 relative overflow-hidden flex items-center justify-center border-b border-gray-50">
                {/* 🔥 优先使用Base64数据 */}
                {cardImagesBase64[index] ? (
                  <img 
                    src={`data:${cardImagesMetadata[index]?.mimeType || 'image/jpeg'};base64,${cardImagesBase64[index]}`} 
                    alt="Card Cover" 
                    className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-105" 
                  />
                ) : cardImages[index] ? (
                  // 降级使用原始URL
                  <img 
                    src={cardImages[index]} 
                    alt="Card Cover" 
                    className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-105" 
                    onError={() => {
                      // URL失效时的处理
                      console.log(`图片URL失效，正在为卡片 ${index + 1} 重新生成...`);
                      checkAndRegenerateImage(index, section);
                    }}
                  />
                ) : (
                  <div className="text-center p-6">
                    <div className="w-12 h-12 mx-auto bg-white rounded-full flex items-center justify-center shadow-sm mb-3">
                      <Sparkles className="w-6 h-6 text-gray-200" />
                    </div>
                    <p className="text-[10px] text-gray-300 font-black uppercase tracking-tighter">WAITING FOR AI / 等待生图</p>
                  </div>
                )}
                
                {generatingCardIndex === index && (
                  <div className="absolute inset-0 bg-white/60 backdrop-blur-md flex flex-col items-center justify-center gap-3">
                    <Loader2 className="w-8 h-8 animate-spin text-clay-primary" />
                    <span className="text-[10px] font-black text-clay-primary animate-pulse">炼制中...</span>
                  </div>
                )}

                {/* 页码浮层 */}
                <div className="absolute top-4 right-4 bg-black/50 backdrop-blur-md text-white text-[10px] font-black px-2 py-1 rounded-md opacity-0 group-hover:opacity-100 transition-opacity flex items-center gap-1">
                  <span>{index + 1} / {sections.length}</span>
                  {cardImagesBase64[index] && (
                    <div className="flex items-center gap-1">
                      <div className="w-2 h-2 rounded-full bg-green-400 animate-pulse" title="图片已持久化"></div>
                      {/* 可以在这里添加缓存状态指示器 */}
                    </div>
                  )}
                </div>
              </div>

              {/* 文本区域 - 移除强制截断，让内容展开 */}
              <div className="p-6 flex-1 flex flex-col bg-white">
                <div className="flex-1">
                  {title && <h2 className="text-base font-black mb-3 text-gray-900 leading-tight uppercase border-l-4 border-clay-primary pl-3">{title}</h2>}
                  <div className="text-[11px] text-gray-600 leading-relaxed font-medium whitespace-pre-wrap line-clamp-none">
                    {body}
                  </div>
                </div>

                <div className="mt-6 pt-4 flex items-center justify-between border-t border-gray-50">
                  <span className="text-[8px] font-black text-gray-300 tracking-tighter italic">ALCHEMY STUDIO V3.0</span>
                  <div className="flex gap-1">
                    {Array.from({ length: sections.length }).map((_, i) => (
                      <div 
                        key={i} 
                        className={cn(
                          "w-1 h-1 rounded-full transition-all",
                          i === index ? "w-3 bg-clay-primary" : "bg-gray-100"
                        )} 
                      />
                    ))}
                  </div>
                </div>
              </div>
            </motion.div>
          );
        })}
      </div>
    </div>
  );
};

export default CardPreview;