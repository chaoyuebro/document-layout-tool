import React, { useState } from 'react';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { ClayButton } from '../ui/clay-button';
import { Loader2, ImageIcon, Sparkles, Download, CheckCircle2 } from 'lucide-react';
import { aiService } from '@/lib/api/ai-service';
import { toast } from 'sonner';
import { motion } from 'framer-motion';

interface ImageGeneratorProps {
  isOpen: boolean;
  onClose: () => void;
  selectedText: string;
}

const ImageGenerator: React.FC<ImageGeneratorProps> = ({ isOpen, onClose, selectedText }) => {
  const [loading, setLoading] = useState(false);
  const [imageUrl, setImageUrl] = useState<string | null>(null);
  const [promptInfo, setPromptInfo] = useState<string | null>(null);

  const handleGenerate = async () => {
    setLoading(true);
    setImageUrl(null);
    setPromptInfo(null);
    try {
      const result = await aiService.generateImage(selectedText);
      setImageUrl(result.imageUrl);
      setPromptInfo(result.promptInfo);
      toast.success('AI 视觉灵感炼成成功！');
    } catch (error) {
      console.error('图片生成失败:', error);
      toast.error('配图生成失败，请检查后端服务');
    } finally {
      setLoading(false);
    }
  };

  const handleInsert = () => {
    if (imageUrl) {
      // 这里可以根据需要实现插入逻辑，例如在编辑器插入 ![AI Image](url)
      toast.success('已复制图片链接，你可以直接粘贴到编辑器');
      navigator.clipboard.writeText(`![AI 配图](${imageUrl})`);
      onClose();
    }
  };

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-md bg-clay-bg border-4 border-white rounded-[32px] shadow-clay-lg">
        <DialogHeader>
          <DialogTitle className="text-2xl font-black text-gray-900 flex items-center gap-2">
            <ImageIcon className="w-6 h-6 text-clay-accent" />
            AI 创意配图
          </DialogTitle>
        </DialogHeader>

        <div className="py-4 space-y-4">
          <div className="bg-white p-4 rounded-2xl border-2 border-gray-50 shadow-clay-inner">
            <p className="text-[10px] font-black text-gray-400 uppercase tracking-widest mb-1">灵感来源</p>
            <p className="text-xs text-gray-600 italic line-clamp-2">"{selectedText}"</p>
          </div>

          {(imageUrl || promptInfo) ? (
            <motion.div 
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              className="space-y-4"
            >
              {imageUrl && (
                <div className="relative aspect-square rounded-2xl overflow-hidden border-4 border-white shadow-clay">
                  <img src={imageUrl} alt="AI Generated" className="w-full h-full object-cover" />
                </div>
              )}

              {promptInfo && (
                <div className="p-4 bg-white/80 rounded-2xl border-2 border-amber-100 space-y-3 text-sm">
                  {promptInfo.split('\n').map((line, i) => {
                    if (line.startsWith('【')) {
                      return <p key={i} className="font-black text-clay-primary mt-2 first:mt-0">{line}</p>;
                    }
                    return <p key={i} className="text-gray-600 text-xs leading-relaxed">{line}</p>;
                  })}
                </div>
              )}

              <div className="flex gap-3">
                <ClayButton variant="secondary" className="flex-1" onClick={() => { setImageUrl(null); setPromptInfo(null); }}>重新生成</ClayButton>
                {imageUrl && (
                  <ClayButton variant="primary" className="flex-1 flex items-center justify-center gap-2" onClick={handleInsert}>
                    <CheckCircle2 className="w-4 h-4" />
                    插入图片
                  </ClayButton>
                )}
              </div>
            </motion.div>
          ) : (
            <ClayButton 
              className="w-full h-24 flex flex-col gap-2" 
              disabled={loading}
              onClick={handleGenerate}
            >
              {loading ? (
                <Loader2 className="w-6 h-6 animate-spin" />
              ) : (
                <>
                  <Sparkles className="w-6 h-6 text-yellow-300" />
                  <span className="text-lg">生成视觉灵感</span>
                </>
              )}
            </ClayButton>
          )}
        </div>
      </DialogContent>
    </Dialog>
  );
};

export default ImageGenerator;
