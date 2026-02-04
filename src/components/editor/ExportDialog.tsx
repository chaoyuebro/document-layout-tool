import React from 'react';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { ClayButton } from '../ui/clay-button';
import { useExport } from '@/hooks/use-export';
import { useEditor } from '@/contexts/EditorContext';
import { Share2, Download, Copy, CheckCircle2, Loader2 } from 'lucide-react';
import { motion } from 'framer-motion';
import { toast } from 'sonner';
import { cn } from '@/lib/utils';

const ExportDialog: React.FC = () => {
  const { article, setPlatforms, onXHSExport } = useEditor();
  const { exportToPlatform, downloadMarkdown } = useExport();
  const [isExporting, setIsExporting] = React.useState(false);
  const selectedPlatforms = article.meta.platforms;

  const platforms = [
    { id: 'zhihu', name: '知乎', color: '#0084FF' },
    { id: 'wechat', name: '公众号', color: '#07C160' },
    { id: 'xiaohongshu', name: '小红书', color: '#FF2442' },
    { id: 'feishu', name: '飞书', color: '#3370FF' },
  ];

  const togglePlatform = (id: string) => {
    if (selectedPlatforms.includes(id as any)) {
      setPlatforms(selectedPlatforms.filter((p) => p !== id));
    } else {
      setPlatforms([...selectedPlatforms, id as any]);
    }
  };

  const handlePlatformExport = async (platformId: string) => {
    setIsExporting(true);
    const success = await exportToPlatform(platformId as any);
    if (success) {
      toast.success(`成功复制到 ${platformId} 剪贴板`, {
        description: '现在你可以直接去对应平台编辑器粘贴了。',
      });
    } else {
      toast.error('导出失败', {
        description: '请检查浏览器剪贴板权限。',
      });
    }
    setIsExporting(false);
  };

  const handleBatchExport = async () => {
    if (selectedPlatforms.length === 0) {
      toast.error('请至少选择一个导出平台');
      return;
    }
    
    setIsExporting(true);
    for (const p of selectedPlatforms) {
      if (p === 'xiaohongshu') {
        if (onXHSExport) {
          onXHSExport();
        } else {
          toast.error('请先切换到小红书预览界面再导出图片');
        }
        continue;
      }
      await exportToPlatform(p);
    }
    toast.success('所选平台（非图片类）已依次复制到剪贴板');
    setIsExporting(false);
  };

  const handleDownload = () => {
    downloadMarkdown();
    toast.success('文件下载成功', {
      description: 'Markdown 源码已保存到本地。',
    });
  };

  return (
    <Dialog>
      <DialogTrigger asChild>
        <ClayButton variant="primary" className="flex items-center gap-2">
          <Share2 className="w-4 h-4" />
          立即导出
        </ClayButton>
      </DialogTrigger>
      <DialogContent className="sm:max-w-md bg-clay-bg border-4 border-white rounded-[32px] shadow-clay-lg">
        <DialogHeader>
          <DialogTitle className="text-2xl font-black text-gray-900 text-center mb-4">选择导出方式</DialogTitle>
        </DialogHeader>
        <div className="flex flex-col gap-3 py-1">
          {/* 导出平台选择 */}
          <div className="space-y-2">
            <h4 className="text-[10px] font-black text-gray-400 uppercase tracking-widest px-2">选择分发平台</h4>
            <div className="grid grid-cols-2 gap-3">
              {platforms.map((p) => {
                const isSelected = selectedPlatforms.includes(p.id as any);
                return (
                  <button
                    key={p.id}
                    onClick={() => togglePlatform(p.id)}
                    className={cn(
                      "flex items-center gap-3 p-3 rounded-2xl border-2 transition-all text-left",
                      isSelected 
                        ? "bg-white border-clay-primary shadow-clay" 
                        : "bg-gray-50 border-transparent text-gray-400"
                    )}
                  >
                    <div 
                      className={cn(
                        "w-8 h-8 rounded-xl flex items-center justify-center font-black text-white shadow-sm",
                        isSelected ? "scale-110" : "opacity-50"
                      )}
                      style={{ backgroundColor: p.color }}
                    >
                      {p.name[0]}
                    </div>
                    <div className="flex-1">
                      <p className={cn("text-xs font-black", isSelected ? "text-gray-900" : "text-gray-400")}>{p.name}</p>
                      <p className="text-[8px] opacity-60 line-clamp-1">{isSelected ? '已选中' : '待激活'}</p>
                    </div>
                    {isSelected && <CheckCircle2 className="w-4 h-4 text-clay-primary" />}
                  </button>
                );
              })}
            </div>
            
            <ClayButton 
              variant="primary" 
              className="w-full h-12"
              disabled={isExporting || selectedPlatforms.length === 0}
              onClick={handleBatchExport}
            >
              {isExporting ? <Loader2 className="w-4 h-4 animate-spin" /> : <Share2 className="w-4 h-4" />}
              批量复制选定平台
            </ClayButton>
          </div>

          <div className="h-[2px] bg-gray-100 my-1" />

          {/* 文件下载 */}
          <div className="space-y-3">
            <h4 className="text-[10px] font-black text-gray-400 uppercase tracking-widest px-2">保存到本地</h4>
            <button
              onClick={handleDownload}
              className="w-full flex items-center justify-between p-4 bg-clay-secondary/10 rounded-2xl border-2 border-clay-secondary/20 hover:bg-clay-secondary/20 transition-all group"
            >
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 bg-clay-secondary rounded-xl flex items-center justify-center text-white shadow-clay">
                  <Download className="w-5 h-5" />
                </div>
                <div className="text-left">
                  <p className="font-bold text-gray-800">下载 Markdown</p>
                  <p className="text-[10px] text-gray-500">包含所有源码内容</p>
                </div>
              </div>
            </button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
};

export default ExportDialog;
