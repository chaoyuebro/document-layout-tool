import { Platform } from '@/types/platform';

/**
 * 知乎转换器：保持 Markdown 纯净，重点处理代码块和公式
 */
export const transformToZhihu = (html: string): string => {
  // 知乎对 HTML 有严格限制，通常我们导出时直接给 MD 源码，
  // 这里的 HTML 转换主要用于预览
  return html;
};
