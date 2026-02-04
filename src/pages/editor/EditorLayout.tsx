import React from 'react';
import PlatformSelector from './PlatformSelector';
import SourceEditor from './SourceEditor';
import PreviewTabs from './PreviewTabs';
import FloatingMenu from '@/components/editor/FloatingMenu';
import ExportDialog from '@/components/editor/ExportDialog';
import HistorySidebar from '@/components/editor/HistorySidebar';
import { motion } from 'framer-motion';

const EditorLayout: React.FC = () => {
  return (
    <div className="flex h-screen bg-clay-bg overflow-hidden">
      {/* 左侧历史记录栏 */}
      <HistorySidebar />

      <div className="flex-1 flex flex-col p-6 relative overflow-y-auto clay-scrollbar">
        <FloatingMenu />
        {/* 装饰性背景球 */}
        <div className="fixed top-[-50px] left-[-50px] w-64 h-64 bg-clay-primary/10 rounded-full blur-3xl -z-10 animate-pulse" />
        <div className="fixed bottom-[-100px] right-[-100px] w-96 h-96 bg-clay-secondary/10 rounded-full blur-3xl -z-10" />
        <div className="fixed top-[20%] right-[10%] w-32 h-32 bg-clay-accent/15 rounded-full blur-2xl -z-10 animate-bounce" style={{ animationDuration: '4s' }} />
        <div className="fixed bottom-[30%] left-[5%] w-48 h-48 bg-clay-purple/10 rounded-full blur-3xl -z-10" />

        <header className="max-w-[1800px] w-full mx-auto flex flex-col md:flex-row justify-between items-center gap-6 mb-8">
        <motion.div 
          initial={{ x: -20, opacity: 0 }}
          animate={{ x: 0, opacity: 1 }}
          className="flex items-center gap-4"
        >
          <div className="w-12 h-12 bg-clay-primary rounded-2xl shadow-[0_6px_0_#D64545] flex items-center justify-center text-white text-2xl font-black">
            A
          </div>
          <div>
            <h1 className="text-4xl font-black tracking-tight flex items-baseline gap-2">
              <span className="text-gray-900">AI 炼金</span>
              <span className="text-clay-primary">排版坊</span>
            </h1>
            <div className="flex gap-2 mt-1">
              <span className="px-3 py-0.5 clay-title-badge text-[11px] font-black text-gray-900 tracking-wider italic bg-amber-300 font-serif">
                炼金大师 · 灵感工坊
              </span>
              <span className="text-xs text-gray-400 font-medium ml-2">匠心排版，多端齐发</span>
            </div>
          </div>
        </motion.div>
        
        <div className="flex items-center gap-6">
          <motion.div
            initial={{ y: -20, opacity: 0 }}
            animate={{ y: 0, opacity: 1 }}
            transition={{ delay: 0.2 }}
          >
            <PlatformSelector />
          </motion.div>
          <ExportDialog />
        </div>
      </header>
      
      <main className="max-w-[1800px] w-full mx-auto grid grid-cols-1 lg:grid-cols-2 gap-8 h-[calc(100vh-180px)]">
        {/* 左侧：源码编辑区 */}
        <motion.section 
          initial={{ scale: 0.95, opacity: 0 }}
          animate={{ scale: 1, opacity: 1 }}
          transition={{ delay: 0.3 }}
          className="clay-card p-0 flex flex-col group overflow-hidden"
        >
          <div className="p-4 border-b-2 border-gray-100 flex justify-between items-center bg-gray-50/50">
            <h2 className="text-sm font-black text-gray-500 uppercase tracking-widest flex items-center gap-2">
              <div className="w-2 h-2 rounded-full bg-clay-primary animate-pulse"></div>
              Editor Source
            </h2>
            <div className="flex gap-1.5">
              <div className="w-3 h-3 rounded-full bg-gray-200"></div>
              <div className="w-3 h-3 rounded-full bg-gray-200"></div>
              <div className="w-3 h-3 rounded-full bg-gray-200"></div>
            </div>
          </div>
          <SourceEditor />
        </motion.section>

        {/* 右侧：预览容器 */}
        <motion.section 
          initial={{ scale: 0.95, opacity: 0 }}
          animate={{ scale: 1, opacity: 1 }}
          transition={{ delay: 0.4 }}
          className="clay-card p-0 flex flex-col group overflow-hidden"
        >
          <div className="p-4 border-b-2 border-gray-100 flex justify-between items-center bg-gray-50/50">
            <h2 className="text-sm font-black text-gray-500 uppercase tracking-widest flex items-center gap-2">
              <div className="w-2 h-2 rounded-full bg-clay-secondary"></div>
              Magic Preview
            </h2>
            <div className="flex gap-2">
              <div className="h-2 w-12 bg-gray-100 rounded-full"></div>
            </div>
          </div>
          <PreviewTabs />
        </motion.section>
      </main>
      </div>
    </div>
  );
};

export default EditorLayout;
