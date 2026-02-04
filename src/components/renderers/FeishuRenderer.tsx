import React from 'react';
import DesktopFrame from '../preview/DesktopFrame';

interface RendererProps {
  content: string;
}

const FeishuRenderer: React.FC<RendererProps> = ({ content }) => {
  return (
    <div 
      className="feishu-prose"
      style={{ fontFamily: 'Inter, -apple-system, sans-serif' }}
      dangerouslySetInnerHTML={{ __html: content }}
    />
  );
};

export default FeishuRenderer;
