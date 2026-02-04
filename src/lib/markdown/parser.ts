import { Marked } from 'marked';
import { highlightCode } from './syntax-highlighter';

/**
 * 核心 Markdown 解析器配置
 */
const marked = new Marked({
  gfm: true,
  breaks: true,
});

// 自定义渲染器以支持代码高亮和其他平台特性
const renderer = {
  code(code: string, lang: string | undefined) {
    const highlighted = highlightCode(code, lang || 'text');
    return `<pre class="language-${lang}"><code class="language-${lang}">${highlighted}</code></pre>`;
  }
};

// @ts-ignore
marked.use({ renderer });

export const parseMarkdown = async (source: string): Promise<string> => {
  return await marked.parse(source);
};

export default marked;
