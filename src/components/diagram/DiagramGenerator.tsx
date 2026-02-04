import React, { useState } from 'react';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { ClayButton } from '../ui/clay-button';
import { Loader2, Sparkles, PenTool, Layout, AlertCircle } from 'lucide-react';
import MermaidRenderer from './MermaidRenderer';
import { aiService } from '@/lib/api/ai-service';
import { toast } from 'sonner';

interface DiagramGeneratorProps {
  isOpen: boolean;
  onClose: () => void;
  selectedText: string;
}

const DiagramGenerator: React.FC<DiagramGeneratorProps> = ({ isOpen, onClose, selectedText }) => {
  const [loading, setLoading] = useState(false);
  const [style, setStyle] = useState<'handdrawn' | 'minimal'>('handdrawn');
  const [generatedCode, setGeneratedCode] = useState<string | null>(null);

  const handleGenerate = async () => {
    setLoading(true);
    try {
      const result = await aiService.generateDiagram(selectedText, style);
      // 后端返回 content 字段包含 mermaid 代码
      setGeneratedCode(result.content);
      toast.success('图表炼成成功！');
    } catch (error) {
      console.error('图表生成失败:', error);
      toast.error('图表生成失败，请检查后端服务');
    } finally {
      setLoading(false);
    }
  };

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-2xl bg-clay-bg border-4 border-white rounded-[32px] shadow-clay-lg">
        <DialogHeader>
          <DialogTitle className="text-2xl font-black text-gray-900 flex items-center gap-2">
            <Sparkles className="w-6 h-6 text-clay-secondary" />
            AI 图表生成
          </DialogTitle>
        </DialogHeader>
        
        <div className="py-6 space-y-6">
          <div className="bg-white p-4 rounded-2xl border-2 border-gray-50 shadow-clay-inner">
            <p className="text-[10px] font-black text-gray-400 uppercase tracking-widest mb-2">选中的原始文本</p>
            <p className="text-sm italic text-gray-600">"{selectedText}"</p>
          </div>

          <div className="flex gap-4">
            <button 
              onClick={() => setStyle('handdrawn')}
              className={`flex-1 p-4 rounded-2xl border-2 transition-all flex flex-col items-center gap-2 ${style === 'handdrawn' ? 'bg-white border-clay-secondary shadow-clay' : 'bg-gray-50 border-transparent text-gray-400 opacity-60'}`}
            >
              <PenTool className="w-6 h-6" />
              <span className="font-bold text-xs text-gray-900">手绘风格</span>
            </button>
            <button 
              onClick={() => setStyle('minimal')}
              className={`flex-1 p-4 rounded-2xl border-2 transition-all flex flex-col items-center gap-2 ${style === 'minimal' ? 'bg-white border-clay-secondary shadow-clay' : 'bg-gray-50 border-transparent text-gray-400 opacity-60'}`}
            >
              <Layout className="w-6 h-6" />
              <span className="font-bold text-xs text-gray-900">极简架构</span>
            </button>
          </div>

          {generatedCode ? (
            <div className="space-y-4 animate-in fade-in slide-in-from-bottom-4">
              <MermaidRenderer chart={generatedCode} />
              <div className="flex gap-3">
                <ClayButton variant="secondary" className="flex-1" onClick={() => setGeneratedCode(null)}>重新生成</ClayButton>
                <ClayButton variant="primary" className="flex-1" onClick={onClose}>插入到编辑器</ClayButton>
              </div>
            </div>
          ) : (
            <ClayButton 
              className="w-full h-16 text-lg" 
              disabled={loading}
              onClick={handleGenerate}
            >
              {loading ? (
                <div className="flex items-center gap-2">
                  <Loader2 className="w-5 h-5 animate-spin" />
                  正在施展炼金术...
                </div>
              ) : "立即生成图表"}
            </ClayButton>
          )}
        </div>
      </DialogContent>
    </Dialog>
  );
};

export default DiagramGenerator;
