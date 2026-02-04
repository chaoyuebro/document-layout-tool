import React, { useState } from 'react';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { ClayButton } from '../ui/clay-button';
import { Sparkles, ArrowRight, CheckCircle2, Loader2, AlertCircle } from 'lucide-react';
import { useEditor } from '@/contexts/EditorContext';
import { motion } from 'framer-motion';
import { aiService } from '@/lib/api/ai-service';
import { toast } from 'sonner';

interface PolishDialogProps {
  isOpen: boolean;
  onClose: () => void;
  originalText: string;
}

const PolishDialog: React.FC<PolishDialogProps> = ({ isOpen, onClose, originalText }) => {
  const [loading, setLoading] = useState(false);
  const [enhancedText, setEnhancedText] = useState<string | null>(null);
  const { setSource, article } = useEditor();

  const handleEnhance = async () => {
    setLoading(true);
    try {
      const result = await aiService.enhanceContent(originalText, article.meta.platforms[0] || 'general');
      setEnhancedText(result.enhanced);
      if (result.suggestions && result.suggestions.length > 0) {
        toast.info(`AI 建议：${result.suggestions[0]}`);
      }
    } catch (error) {
      console.error('AI 润色失败:', error);
      toast.error('AI 施法失败，请检查后端服务是否开启');
    } finally {
      setLoading(false);
    }
  };

  const handleApply = () => {
    if (enhancedText) {
      const newSource = article.source.replace(originalText, enhancedText);
      setSource(newSource);
      onClose();
    }
  };

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-xl bg-clay-bg border-4 border-white rounded-[32px] shadow-clay-lg">
        <DialogHeader>
          <DialogTitle className="text-2xl font-black text-gray-900 flex items-center gap-2">
            <Sparkles className="w-6 h-6 text-clay-primary" />
            AI 炼金润色
          </DialogTitle>
        </DialogHeader>

        <div className="py-4 space-y-4">
          <div className="grid grid-cols-1 gap-4">
            <div className="space-y-2">
              <span className="text-[10px] font-black text-gray-400 uppercase tracking-widest px-1">原始文本</span>
              <div className="p-4 bg-white rounded-2xl border-2 border-gray-50 text-sm text-gray-500 italic">
                {originalText}
              </div>
            </div>

            {enhancedText && (
              <motion.div 
                initial={{ opacity: 0, x: 20 }}
                animate={{ opacity: 1, x: 0 }}
                className="space-y-2"
              >
                <div className="flex items-center gap-2 px-1">
                  <ArrowRight className="w-3 h-3 text-clay-primary" />
                  <span className="text-[10px] font-black text-clay-primary uppercase tracking-widest">炼金成果</span>
                </div>
                <div className="p-4 bg-white rounded-2xl border-4 border-clay-primary/20 shadow-clay text-sm text-gray-900 font-medium">
                  {enhancedText}
                </div>
              </motion.div>
            )}
          </div>

          <div className="pt-4 flex gap-3">
            {!enhancedText ? (
              <ClayButton 
                className="w-full h-14" 
                disabled={loading}
                onClick={handleEnhance}
              >
                {loading ? <Loader2 className="w-5 h-5 animate-spin" /> : "开始润色"}
              </ClayButton>
            ) : (
              <>
                <ClayButton variant="secondary" className="flex-1" onClick={() => setEnhancedText(null)}>重新生成</ClayButton>
                <ClayButton variant="primary" className="flex-1 flex items-center justify-center gap-2" onClick={handleApply}>
                  <CheckCircle2 className="w-4 h-4" />
                  应用修改
                </ClayButton>
              </>
            )}
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
};

export default PolishDialog;
