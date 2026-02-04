import { Platform } from '@/types/platform';
import { useEditor } from '@/contexts/EditorContext';
import { useMarkdownProcessor } from '@/hooks/use-markdown-processor';
import { copyToClipboard, copyHtmlToClipboard } from '@/lib/utils/clipboard';
import { saveAs } from 'file-saver';
import JSZip from 'jszip';
import html2canvas from 'html2canvas';

export const useExport = () => {
  const { article } = useEditor();
  const processedResults = useMarkdownProcessor(article.source);

  /**
   * 导出到指定平台
   */
  const exportToPlatform = async (platform: Platform) => {
    const content = processedResults[platform];
    
    switch (platform) {
      case 'wechat':
        return await copyHtmlToClipboard(content);
      
      case 'zhihu':
        // 知乎通常直接复制 Markdown 源码
        return await copyToClipboard(article.source);
      
      case 'feishu':
        return await copyToClipboard(content);
      
      case 'xiaohongshu':
        // 小红书需要特殊处理图片导出
        return false;
      
      default:
        return false;
    }
  };

  /**
   * 下载 Markdown 文件
   */
  const downloadMarkdown = () => {
    const blob = new Blob([article.source], { type: 'text/markdown;charset=utf-8' });
    saveAs(blob, `${article.meta.title || 'untitled'}.md`);
  };

  return {
    exportToPlatform,
    downloadMarkdown,
  };
};
