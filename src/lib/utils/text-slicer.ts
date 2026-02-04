/**
 * 文本切片工具：将 Markdown 按 H2 标题进行逻辑分割
 */
export const sliceContentByH2 = (markdown: string): string[] => {
  if (!markdown) return [];

  // 使用正则表达式匹配 H2 标题
  const sections = markdown.split(/^(?=## )/m);
  
  // 过滤掉空字符串并修剪
  return sections.map(s => s.trim()).filter(s => s.length > 0);
};

/**
 * 限制每张卡片的字符数，如果超过则进一步拆分
 */
export const smartSlice = (sections: string[], maxChars: number = 300): string[] => {
  const finalSections: string[] = [];

  sections.forEach(section => {
    if (section.length <= maxChars) {
      finalSections.push(section);
    } else {
      // 如果单节太长，按段落进一步拆分
      const paragraphs = section.split('\n\n');
      let currentChunk = '';
      
      paragraphs.forEach(para => {
        if ((currentChunk + para).length <= maxChars) {
          currentChunk += (currentChunk ? '\n\n' : '') + para;
        } else {
          if (currentChunk) finalSections.push(currentChunk);
          currentChunk = para;
        }
      });
      
      if (currentChunk) finalSections.push(currentChunk);
    }
  });

  return finalSections;
};
