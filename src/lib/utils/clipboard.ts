/**
 * 剪贴板辅助工具
 */
export const copyToClipboard = async (text: string): Promise<boolean> => {
  try {
    await navigator.clipboard.writeText(text);
    return true;
  } catch (err) {
    console.error('Failed to copy: ', err);
    return false;
  }
};

/**
 * 复制富文本 (HTML) 到剪贴板，用于微信公众号
 */
export const copyHtmlToClipboard = async (html: string): Promise<boolean> => {
  try {
    const blob = new Blob([html], { type: 'text/html' });
    const textBlob = new Blob([html], { type: 'text/plain' });
    const data = [new ClipboardItem({ 'text/html': blob, 'text/plain': textBlob })];
    await navigator.clipboard.write(data);
    return true;
  } catch (err) {
    console.error('Failed to copy HTML: ', err);
    return false;
  }
};
