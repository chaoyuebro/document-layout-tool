import React, { useState } from 'react';
import { useEditor } from '@/contexts/EditorContext';
import { useMarkdownProcessor } from '@/hooks/use-markdown-processor';
import { cn } from '@/lib/utils';
import { motion, AnimatePresence } from 'framer-motion';
import ZhihuRenderer from '@/components/renderers/ZhihuRenderer';
import WeChatRenderer from '@/components/renderers/WeChatRenderer';
import FeishuRenderer from '@/components/renderers/FeishuRenderer';
import CardPreview from '@/components/preview/CardPreview';
import { Platform } from '@/types/platform';

const PreviewTabs: React.FC = () => {
  const { activePlatform } = useEditor();
  const { article } = useEditor();
  const processedResults = useMarkdownProcessor(article.source);

  const renderContent = () => {
    const content = processedResults[activePlatform];

    switch (activePlatform) {
      case 'zhihu':
        return <ZhihuRenderer content={content} />;
      case 'wechat':
        return <WeChatRenderer content={content} />;
      case 'feishu':
        return <FeishuRenderer content={content} />;
      case 'xiaohongshu':
        return <CardPreview />;
      default:
        return <div className="p-8 text-center text-gray-400">该平台预览正在开发中...</div>;
    }
  };

  return (
    <div className="flex-1 flex flex-col overflow-hidden">
      <AnimatePresence mode="wait">
        <motion.div
          key={activePlatform}
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          transition={{ duration: 0.2 }}
          className="h-full w-full flex justify-center"
        >
          {/* 手机模型 (仅限微信公众号) */}
          {activePlatform === 'wechat' ? (
            <div className="p-4 w-full flex justify-center bg-gray-50/30">
              <div className="h-[700px] w-[380px] border-[8px] border-gray-900 rounded-[3rem] shadow-[0_20px_50px_rgba(0,0,0,0.1)] bg-white relative overflow-hidden">
                <div className="absolute top-0 left-1/2 -translate-x-1/2 w-32 h-6 bg-gray-900 rounded-b-2xl z-50 flex items-center justify-center">
                  <div className="w-10 h-1 bg-gray-800 rounded-full" />
                </div>
                <div className="h-full w-full overflow-y-auto clay-scrollbar pt-8">
                  {renderContent()}
                </div>
              </div>
            </div>
          ) : (
            /* 全屏展开预览 (小红书/知乎/飞书) - 去掉套娃，让组件自适应容器 */
            <div className="h-full w-full">
              {renderContent()}
            </div>
          )}
        </motion.div>
      </AnimatePresence>
    </div>
  );
};

export default PreviewTabs;
