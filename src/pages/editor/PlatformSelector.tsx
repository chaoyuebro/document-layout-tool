import React from 'react';
import { Platform, PlatformConfig } from '@/types/platform';
import { useEditor } from '@/contexts/EditorContext';
import { cn } from '@/lib/utils';
import { motion, AnimatePresence } from 'framer-motion';

const platforms: PlatformConfig[] = [
  { id: 'zhihu', name: '知乎', icon: 'Z', color: '#0084FF', description: '极客风 Markdown' },
  { id: 'wechat', name: '公众号', icon: 'W', color: '#07C160', description: '内联 CSS HTML' },
  { id: 'xiaohongshu', name: '小红书', icon: 'X', color: '#FF2442', description: '图片切片卡片' },
  { id: 'feishu', name: '飞书', icon: 'F', color: '#3370FF', description: 'Callout 结构化' },
];

const PlatformSelector: React.FC = () => {
  const { activePlatform, setActivePlatform } = useEditor();

  return (
    <div className="flex bg-white/50 backdrop-blur-sm p-2 rounded-[24px] border-2 border-white shadow-clay-inner gap-2">
      {platforms.map((platform) => {
        const isSelected = activePlatform === platform.id;
        return (
          <motion.button
            key={platform.id}
            onClick={() => setActivePlatform(platform.id)}
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
            className={cn(
              "relative flex flex-col items-center justify-center w-20 h-20 rounded-[20px] transition-all duration-300 overflow-hidden",
              isSelected 
                ? "bg-white shadow-clay border-2 border-current" 
                : "bg-transparent text-gray-300 hover:text-gray-400"
            )}
            style={{ 
              color: isSelected ? platform.color : undefined,
              borderColor: isSelected ? platform.color : 'transparent'
            }}
          >
            <AnimatePresence>
              {isSelected && (
                <motion.div 
                  initial={{ opacity: 0, scale: 0 }}
                  animate={{ opacity: 0.1, scale: 2 }}
                  exit={{ opacity: 0, scale: 0 }}
                  className="absolute inset-0 rounded-full"
                  style={{ backgroundColor: platform.color }}
                />
              )}
            </AnimatePresence>
            
            <span 
              className={cn(
                "text-2xl font-black mb-1 transition-transform",
                isSelected ? "scale-110" : "scale-100"
              )}
            >
              {platform.icon}
            </span>
            <span className="text-[10px] font-black uppercase tracking-tighter">
              {platform.name}
            </span>

            {isSelected && (
              <motion.div 
                layoutId="active-dot"
                className="absolute top-1 right-1 w-2 h-2 rounded-full"
                style={{ backgroundColor: platform.color }}
              />
            )}
          </motion.button>
        );
      })}
    </div>
  );
};

export default PlatformSelector;
