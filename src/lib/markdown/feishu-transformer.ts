/**
 * 飞书转换器：处理飞书特有的 Callout 块等结构
 */
export const transformToFeishu = (html: string): string => {
  let transformed = html;

  // 转换自定义的 Callout 语法 (例如：> ⚠️ 警告) 为飞书风格的模拟样式
  transformed = transformed.replace(
    /<blockquote>\s*<p>\s*(⚠️|💡|✅|❌)\s*/g,
    (match, icon) => {
      const colors = {
        '⚠️': '#FFFBE6', // 警告黄
        '💡': '#E6F7FF', // 提示蓝
        '✅': '#F6FFED', // 成功绿
        '❌': '#FFF1F0', // 错误红
      };
      const borderColor = {
        '⚠️': '#FFE58F',
        '💡': '#91D5FF',
        '✅': '#B7EB8F',
        '❌': '#FFA39E',
      };
      // @ts-ignore
      return `<blockquote style="background-color: ${colors[icon]}; border: 1px solid ${borderColor[icon]}; border-left: 4px solid ${borderColor[icon]}; border-radius: 8px; padding: 12px; margin: 16px 0;"><p style="margin: 0; display: flex; align-items: center; gap: 8px;"><span>${icon}</span>`;
    }
  );

  return transformed;
};
