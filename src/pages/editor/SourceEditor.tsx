import React, { useState } from 'react';
import CodeEditor from '@uiw/react-textarea-code-editor';
import { useEditor } from '@/contexts/EditorContext';
import { motion } from 'framer-motion';
import { Wand2, Loader2 } from 'lucide-react';
import { aiService } from '@/lib/api/ai-service';
import { toast } from 'sonner';

const SourceEditor: React.FC = () => {
  const { article, setSource } = useEditor();
  const [isTypesetting, setIsTypesetting] = useState(false);

  const handleSmartTypeset = async () => {
    if (!article.source.trim()) {
      toast.error('请先输入一点文本内容');
      return;
    }
    
    setIsTypesetting(true);
    const promise = aiService.smartTypeset(article.source);
    
    toast.promise(promise, {
      loading: '正在施展排版魔法...',
      success: (data) => {
        setSource(data);
        return '排版炼金完成！';
      },
      error: '排版失败，请检查网络或配置',
    });

    try {
      await promise;
    } catch (e) {
      console.error(e);
    } finally {
      setIsTypesetting(false);
    }
  };

  return (
    <div className="flex-1 overflow-hidden flex flex-col relative group">
      {/* 智能排版悬浮按钮 */}
      <motion.button
        whileHover={{ scale: 1.05 }}
        whileTap={{ scale: 0.95 }}
        onClick={handleSmartTypeset}
        disabled={isTypesetting}
        className="absolute bottom-16 right-6 z-10 flex items-center gap-2 px-4 py-2 bg-clay-primary text-white font-black rounded-xl shadow-clay hover:shadow-clay-hover transition-all disabled:opacity-50"
      >
        {isTypesetting ? <Loader2 className="w-4 h-4 animate-spin" /> : <Wand2 className="w-4 h-4" />}
        <span className="text-xs uppercase tracking-widest">智能炼金排版</span>
      </motion.button>

      <CodeEditor
        value={article.source}
        language="markdown"
        placeholder="在这里输入你的 Markdown 秘籍..."
        onChange={(evn) => setSource(evn.target.value)}
        padding={20}
        style={{
          fontSize: 16,
          backgroundColor: 'transparent',
          fontFamily: 'ui-monospace, SFMono-Regular, Menlo, Monaco, Consolas, "Liberation Mono", "Courier New", monospace',
          flex: 1,
          overflow: 'auto',
        }}
        className="clay-scrollbar"
      />
      <div className="p-3 bg-gray-50/50 border-t border-gray-100 flex justify-between items-center text-[10px] font-bold text-gray-400 uppercase tracking-tighter">
        <span>Chars: {article.source.length}</span>
        <span>Lines: {article.source.split('\n').length}</span>
      </div>
    </div>
  );
};

export default SourceEditor;
