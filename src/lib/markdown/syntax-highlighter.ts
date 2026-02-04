import Prism from 'prismjs';
import 'prismjs/components/prism-typescript';
import 'prismjs/components/prism-javascript';
import 'prismjs/components/prism-markdown';
import 'prismjs/components/prism-json';
import 'prismjs/components/prism-bash';
import 'prismjs/components/prism-css';
import 'prismjs/components/prism-python';

/**
 * 包装 Prism.js 语法高亮功能
 */
export const highlightCode = (code: string, lang: string): string => {
  const grammar = Prism.languages[lang] || Prism.languages.markdown;
  return Prism.highlight(code, grammar, lang);
};
