import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Sparkles, Image as ImageIcon, BarChart3, Wand2 } from 'lucide-react';
import { useTextSelection } from '@/hooks/use-text-selection';
import DiagramGenerator from '../diagram/DiagramGenerator';
import PolishDialog from './PolishDialog';
import ImageGenerator from './ImageGenerator';

const FloatingMenu: React.FC = () => {
  const { text, rect } = useTextSelection();
  const [isDiagramOpen, setIsDiagramOpen] = useState(false);
  const [isPolishOpen, setIsPolishOpen] = useState(false);
  const [isImageOpen, setIsImageOpen] = useState(false);

  if (!rect || !text) return null;

  return (
    <>
      <AnimatePresence>
        <motion.div
          initial={{ opacity: 0, y: 10, scale: 0.9 }}
          animate={{ opacity: 1, y: 0, scale: 1 }}
          exit={{ opacity: 0, scale: 0.9 }}
          className="fixed z-50 flex items-center gap-1 p-1 bg-white border-2 border-gray-900 shadow-[4px_4px_0_#2C3E50] rounded-xl overflow-hidden"
          style={{
            top: rect.top - 60,
            left: rect.left + rect.width / 2,
            translateX: '-50%',
          }}
        >
          <button 
            className="flex items-center gap-2 px-3 py-1.5 hover:bg-clay-primary/10 rounded-lg transition-colors group"
            onClick={() => setIsPolishOpen(true)}
          >
            <Sparkles className="w-4 h-4 text-clay-primary group-hover:animate-pulse" />
            <span className="text-xs font-bold text-gray-700">润色</span>
          </button>
          <div className="w-[2px] h-4 bg-gray-100 mx-1" />
          <button 
            className="flex items-center gap-2 px-3 py-1.5 hover:bg-clay-secondary/10 rounded-lg transition-colors group"
            onClick={() => setIsDiagramOpen(true)}
          >
            <BarChart3 className="w-4 h-4 text-clay-secondary" />
            <span className="text-xs font-bold text-gray-700">生成图表</span>
          </button>
          <div className="w-[2px] h-4 bg-gray-100 mx-1" />
          <button 
            className="flex items-center gap-2 px-3 py-1.5 hover:bg-clay-accent/10 rounded-lg transition-colors group"
            onClick={() => setIsImageOpen(true)}
          >
            <ImageIcon className="w-4 h-4 text-clay-accent" />
            <span className="text-xs font-bold text-gray-700">AI 配图</span>
          </button>
        </motion.div>
      </AnimatePresence>

      <DiagramGenerator 
        isOpen={isDiagramOpen}
        onClose={() => setIsDiagramOpen(false)}
        selectedText={text}
      />

      <PolishDialog 
        isOpen={isPolishOpen}
        onClose={() => setIsPolishOpen(false)}
        originalText={text}
      />

      <ImageGenerator 
        isOpen={isImageOpen}
        onClose={() => setIsImageOpen(false)}
        selectedText={text}
      />
    </>
  );
};

export default FloatingMenu;
