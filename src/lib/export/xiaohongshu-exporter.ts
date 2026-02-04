import html2canvas from 'html2canvas';
import JSZip from 'jszip';
import { saveAs } from 'file-saver';
import { toast } from 'sonner';

/**
 * 将指定 DOM 元素列表导出为图片并打包成 ZIP
 */
export const exportCardsAsZip = async (
  containerRef: React.RefObject<HTMLDivElement>,
  filename: string = 'xiaohongshu-cards'
) => {
  if (!containerRef.current) return;

  const cardElements = containerRef.current.querySelectorAll('.xhs-card');
  console.log(`找到 ${cardElements.length} 张卡片进行导出`);
  
  if (cardElements.length === 0) {
    toast.error('未找到可导出的卡片内容');
    return;
  }

  const promise = async () => {
    const zip = new JSZip();
    
    for (let i = 0; i < cardElements.length; i++) {
      try {
        const canvas = await html2canvas(cardElements[i] as HTMLElement, {
          scale: 2, 
          useCORS: true,
          backgroundColor: '#ffffff', // 明确背景色
          logging: false,
          allowTaint: true,
          // 彻底解决 oklch 报错：注入全局 CSS 覆盖所有可能导致崩溃的 oklch 变量
          onclone: (doc) => {
            const style = doc.createElement('style');
            style.innerHTML = `
              * {
                /* 强制将所有 Tailwind 可能注入的 oklch 变量降级为 hex/rgb */
                --tw-ring-color: rgba(0,0,0,0.1) !important;
                --tw-ring-offset-shadow: 0 0 #0000 !important;
                --tw-ring-shadow: 0 0 #0000 !important;
                --tw-shadow: 0 0 #0000 !important;
                --tw-shadow-colored: 0 0 #0000 !important;
                
                /* 覆盖核心颜色属性 */
                outline-color: #e2e8f0 !important;
                border-color: #e2e8f0 !important;
              }
              /* 强制背景色为 HEX，html2canvas 才能解析 */
              .xhs-card {
                background-color: #ffffff !important;
                color: #252525 !important;
              }
            `;
            doc.head.appendChild(style);

            const allElements = doc.querySelectorAll('*');
            allElements.forEach((el) => {
              const element = el as HTMLElement;
              const styles = window.getComputedStyle(element);
              
              // 关键：检查并替换 computedStyle 里的 oklch 字符串
              if (styles.backgroundColor.includes('oklch')) element.style.backgroundColor = '#ffffff';
              if (styles.color.includes('oklch')) element.style.color = '#252525';
              if (styles.borderColor.includes('oklch')) element.style.borderColor = '#e2e2e2';
              
              // 彻底移除所有 -- 开头的 CSS 变量，html2canvas 会在尝试解析这些变量值时因为包含 oklch 而崩溃
              const inlineStyle = element.style;
              for (let j = inlineStyle.length - 1; j >= 0; j--) {
                const prop = inlineStyle[j];
                if (prop.startsWith('--')) {
                  inlineStyle.removeProperty(prop);
                }
              }
            });
          }
        });
        
        const imgData = canvas.toDataURL('image/jpeg', 0.9);
        const base64Data = imgData.split(',')[1]; // 更稳妥的 base64 提取方式
        zip.file(`card-${i + 1}.jpg`, base64Data, { base64: true });
      } catch (err) {
        console.error(`渲染第 ${i+1} 张卡片失败:`, err);
        throw new Error(`渲染第 ${i+1} 张卡片失败`);
      }
    }

    const content = await zip.generateAsync({ type: 'blob' });
    saveAs(content, `${filename}.zip`);
    return { name: filename };
  };

  toast.promise(promise(), {
    loading: `正在施展魔法生成 ${cardElements.length} 张卡片...`,
    success: (data) => `导出成功！${data.name}.zip 已开始下载`,
    error: '图片生成失败，请重试',
  });
};
