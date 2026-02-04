import { useState, useCallback, useEffect } from 'react';
import { parseMarkdown } from '@/lib/markdown/parser';
import { transformToZhihu } from '@/lib/markdown/zhihu-transformer';
import { transformToWeChat } from '@/lib/markdown/wechat-transformer';
import { transformToFeishu } from '@/lib/markdown/feishu-transformer';
import { Platform } from '@/types/platform';

export const useMarkdownProcessor = (source: string) => {
  const [results, setResults] = useState<Record<Platform, string>>({
    zhihu: '',
    wechat: '',
    xiaohongshu: '',
    feishu: '',
  });

  const processSource = useCallback(async (src: string) => {
    const baseHtml = await parseMarkdown(src);

    setResults({
      zhihu: transformToZhihu(baseHtml),
      wechat: transformToWeChat(baseHtml),
      feishu: transformToFeishu(baseHtml),
      xiaohongshu: baseHtml, // 小红书后续由专门的 Renderer 处理切片
    });
  }, []);

  useEffect(() => {
    const timer = setTimeout(() => {
      processSource(source);
    }, 300); // 300ms 防抖

    return () => clearTimeout(timer);
  }, [source, processSource]);

  return results;
};
