import React from 'react';
import DesktopFrame from '../preview/DesktopFrame';

interface RendererProps {
  content: string;
}

const ZhihuRenderer: React.FC<RendererProps> = ({ content }) => {
  return (
    <div 
      className="prose prose-sm max-w-none"
      dangerouslySetInnerHTML={{ __html: content }}
    />
  );
};

export default ZhihuRenderer;
