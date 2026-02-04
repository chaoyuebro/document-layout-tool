import React, { useEffect, useRef } from 'react';
import mermaid from 'mermaid';

interface MermaidRendererProps {
  chart: string;
}

const MermaidRenderer: React.FC<MermaidRendererProps> = ({ chart }) => {
  const containerRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    mermaid.initialize({
      startOnLoad: true,
      theme: 'base',
      themeVariables: {
        primaryColor: '#FFE5D9',
        primaryTextColor: '#2C3E50',
        primaryBorderColor: '#FF6B6B',
        lineColor: '#4ECDC4',
        fontFamily: 'ui-monospace, SFMono-Regular, Menlo, Monaco, Consolas, monospace',
      },
    });

    if (containerRef.current) {
      containerRef.current.removeAttribute('data-processed');
      mermaid.contentLoaded();
    }
  }, [chart]);

  return (
    <div className="mermaid bg-white p-6 rounded-xl border-2 border-gray-100 flex justify-center overflow-auto shadow-clay-inner" ref={containerRef}>
      {chart}
    </div>
  );
};

export default MermaidRenderer;
