/**
 * 微信公众号转换器：注入内联 CSS 以实现精准排版
 */
export const transformToWeChat = (html: string): string => {
  // 定义内联样式（根据粘土风或公众号常用样式）
  const styles = {
    h1: 'font-size: 24px; font-weight: bold; color: #FF6B6B; margin: 20px 0; border-bottom: 2px solid #FF6B6B; padding-bottom: 5px;',
    h2: 'font-size: 20px; font-weight: bold; color: #2C3E50; margin: 18px 0; border-left: 4px solid #4ECDC4; padding-left: 10px;',
    p: 'font-size: 16px; line-height: 1.6; color: #333; margin: 12px 0;',
    blockquote: 'border-left: 4px solid #FFE66D; background-color: #FFF9E6; padding: 10px 15px; color: #666; margin: 15px 0;',
    code: 'background-color: #F8F9FA; padding: 2px 4px; border-radius: 4px; font-family: monospace; color: #D63384;',
  };

  let transformed = html;
  
  // 简单的正则替换实现内联样式注入（后期可改用更强大的解析器）
  transformed = transformed.replace(/<h1>/g, `<h1 style="${styles.h1}">`);
  transformed = transformed.replace(/<h2>/g, `<h2 style="${styles.h2}">`);
  transformed = transformed.replace(/<p>/g, `<p style="${styles.p}">`);
  transformed = transformed.replace(/<blockquote>/g, `<blockquote style="${styles.blockquote}">`);
  transformed = transformed.replace(/<code>/g, `<code style="${styles.code}">`);

  return transformed;
};
