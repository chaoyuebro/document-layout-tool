export interface Diagram {
  id: string;
  type: 'mermaid' | 'excalidraw';
  style: DiagramStyle;
  content: string | object;
  sourceText: string; // 生成它的原始文本
  position: number; // 在源文本中的位置
}

export type DiagramStyle = 'handdrawn' | 'minimal' | 'blueprint';
