import React from 'react';

interface DesktopFrameProps {
  children: React.ReactNode;
  title?: string;
}

const DesktopFrame: React.FC<DesktopFrameProps> = ({ children, title = 'AI Typesetting Studio' }) => {
  return (
    <div className="flex flex-col h-full bg-white rounded-xl shadow-clay border-2 border-gray-100 overflow-hidden">
      <div className="bg-gray-100 px-4 py-2 flex items-center gap-4">
        <div className="flex gap-1.5">
          <div className="w-2.5 h-2.5 rounded-full bg-red-400"></div>
          <div className="w-2.5 h-2.5 rounded-full bg-yellow-400"></div>
          <div className="w-2.5 h-2.5 rounded-full bg-green-400"></div>
        </div>
        <div className="flex-1 bg-white rounded-md px-3 py-0.5 text-[10px] text-gray-400 font-medium truncate">
          https://alchemy-studio.ai/preview/{title.toLowerCase().replace(/\s+/g, '-')}
        </div>
      </div>
      <div className="flex-1 overflow-y-auto p-8 clay-scrollbar bg-white">
        <div className="max-w-3xl mx-auto">
          {children}
        </div>
      </div>
    </div>
  );
};

export default DesktopFrame;
