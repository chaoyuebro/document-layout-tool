import React from 'react';
import PhoneFrame from '../preview/PhoneFrame';

interface RendererProps {
  content: string;
}

const WeChatRenderer: React.FC<RendererProps> = ({ content }) => {
  return (
    <div 
      className="wechat-content p-4"
      style={{ fontFamily: 'system-ui, -apple-system, sans-serif' }}
      dangerouslySetInnerHTML={{ __html: content }}
    />
  );
};

export default WeChatRenderer;
