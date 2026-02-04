import React, { useState } from 'react';
import { Excalidraw } from "@excalidraw/excalidraw";

const HandDrawnCanvas: React.FC = () => {
  return (
    <div className="h-[400px] w-full border-2 border-gray-100 rounded-2xl overflow-hidden shadow-clay-inner bg-white">
      <Excalidraw 
        initialData={{
          appState: {
            viewBackgroundColor: "#ffffff",
            currentItemStrokeColor: "#2C3E50",
            currentItemFontFamily: 1, // Cascadia or Comic Sans
          }
        }}
      />
    </div>
  );
};

export default HandDrawnCanvas;
