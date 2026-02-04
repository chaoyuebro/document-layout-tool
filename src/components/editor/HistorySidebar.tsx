import React from 'react';
import { useEditor } from '@/contexts/EditorContext';
import { Clock, Plus, FileText, CloudUpload, Loader2, Trash2 } from 'lucide-react';
import { cn } from '@/lib/utils';
import { motion, AnimatePresence } from 'framer-motion';

const HistorySidebar: React.FC = () => {
  const { historyList, loadProject, createNewProject, currentProjectId, isSaving, saveProject, deleteProject } = useEditor();

  return (
    <div className="w-64 h-full bg-white/50 backdrop-blur-md border-r-2 border-gray-100 flex flex-col overflow-hidden">
      <div className="p-4 border-b-2 border-gray-100 space-y-3">
        <button
          onClick={createNewProject}
          className="w-full py-2.5 bg-clay-primary text-white rounded-xl shadow-clay flex items-center justify-center gap-2 text-sm font-black hover:-translate-y-0.5 active:translate-y-0 transition-all"
        >
          <Plus className="w-4 h-4" />
          开启新炼金
        </button>
        
        <button
          onClick={() => saveProject()}
          disabled={isSaving}
          className="w-full py-2 border-2 border-clay-primary text-clay-primary rounded-xl flex items-center justify-center gap-2 text-xs font-black hover:bg-clay-primary/5 disabled:opacity-50 transition-all"
        >
          {isSaving ? <Loader2 className="w-3.5 h-3.5 animate-spin" /> : <CloudUpload className="w-3.5 h-3.5" />}
          {isSaving ? '同步中...' : '同步至云端'}
        </button>
      </div>

      <div className="flex-1 overflow-y-auto clay-scrollbar p-2">
        <div className="px-3 mb-2 flex items-center gap-2">
          <Clock className="w-3 h-3 text-gray-400" />
          <span className="text-[10px] font-black text-gray-400 uppercase tracking-widest">炼金史册</span>
        </div>

        <div className="space-y-1">
          <AnimatePresence>
            {historyList.map((project) => (
              <motion.div
                key={project.id}
                initial={{ x: -10, opacity: 0 }}
                animate={{ x: 0, opacity: 1 }}
                onClick={() => loadProject(project.id)}
                className={cn(
                  "w-full p-3 rounded-xl flex flex-col gap-1 text-left transition-all group relative overflow-hidden cursor-pointer",
                  currentProjectId === project.id 
                    ? "bg-white shadow-clay border-2 border-clay-primary/20" 
                    : "hover:bg-white/80 border-2 border-transparent"
                )}
              >
                <div className="flex items-center gap-2">
                  <FileText className={cn("w-3.5 h-3.5", currentProjectId === project.id ? "text-clay-primary" : "text-gray-400")} />
                  <span className={cn(
                    "text-xs font-bold truncate pr-6",
                    currentProjectId === project.id ? "text-gray-900" : "text-gray-600 group-hover:text-gray-900"
                  )}>
                    {project.title}
                  </span>
                </div>
                <div className="text-[10px] text-gray-400 font-medium pl-5">
                  {new Date(project.updated_at).toLocaleString('zh-CN', { month: 'numeric', day: 'numeric', hour: '2-digit', minute: '2-digit' })}
                </div>

                <button
                  onClick={(e) => {
                    e.stopPropagation();
                    deleteProject(project.id);
                  }}
                  className="absolute right-2 top-1/2 -translate-y-1/2 p-2 text-gray-300 hover:text-clay-primary opacity-0 group-hover:opacity-100 transition-all rounded-lg hover:bg-clay-primary/5"
                  title="删除项目"
                >
                  <Trash2 className="w-3.5 h-3.5" />
                </button>
                
                {currentProjectId === project.id && (
                  <motion.div 
                    layoutId="active-indicator"
                    className="absolute left-0 top-0 bottom-0 w-1 bg-clay-primary"
                  />
                )}
              </motion.div>
            ))}
          </AnimatePresence>
          
          {historyList.length === 0 && (
            <div className="py-12 text-center text-gray-400">
              <Clock className="w-8 h-8 mx-auto mb-2 opacity-10" />
              <p className="text-[10px] font-black uppercase tracking-tighter">尚无炼金记录</p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default HistorySidebar;
