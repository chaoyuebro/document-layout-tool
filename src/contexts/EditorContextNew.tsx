import React, { createContext, useContext, useState, ReactNode, useCallback, useEffect } from 'react';
import { Article } from '../types/article';
import { Platform } from '../types/platform';
import { supabase } from '@/lib/supabase';
import { toast } from 'sonner';

interface Project {
  id: string;
  title: string;
  source_content: string;
  active_platform: string;
  ai_cards: any;
  card_images: any;
  updated_at: string;
}

interface EditorContextType {
  article: Article;
  activePlatform: Platform;
  setActivePlatform: (platform: Platform) => void;
  setSource: (source: string) => void;
  setPlatforms: (platforms: Platform[]) => void;
  updateMeta: (meta: Partial<Article['meta']>) => void;
  // 用于全局触发小红书导出
  onXHSExport?: () => void;
  registerXHSExport: (fn: () => void) => void;
  
  // 记忆功能扩展
  currentProjectId: string | null;
  historyList: Project[];
  isSaving: boolean;
  saveProject: (data?: Partial<Project>) => Promise<void>;
  loadProject: (id: string) => Promise<void>;
  deleteProject: (id: string) => Promise<void>;
  createNewProject: () => void;
  refreshHistory: () => Promise<void>;
  
  // AI 状态共享
  aiCards: any[] | null;
  setAiCards: (cards: any[] | null) => void;
  cardImages: Record<number, string>;
  setCardImages: (images: Record<number, string>) => void;
}

const defaultArticle: Article = {
  id: '1',
  source: '',
  meta: {
    platforms: ['zhihu'], // 默认选中导出平台
    theme: 'nintendo_clay',
    createdAt: new Date(),
    updatedAt: new Date(),
  },
  assets: {
    diagrams: [],
    images: [],
  },
};

const EditorContext = createContext<EditorContextType | undefined>(undefined);

export const EditorProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
  const [article, setArticle] = useState<Article>(defaultArticle);
  const [activePlatform, setActivePlatform] = useState<Platform>('zhihu');
  const [onXHSExport, setOnXHSExport] = useState<(() => void) | undefined>(undefined);
  
  // AI 资产状态
  const [aiCards, setAiCards] = useState<any[] | null>(null);
  const [cardImages, setCardImages] = useState<Record<number, string>>({});

  // 记忆功能状态
  const [currentProjectId, setCurrentProjectId] = useState<string | null>(null);
  const [historyList, setHistoryList] = useState<Project[]>([]);
  const [isSaving, setIsSaving] = useState(false);

  const registerXHSExport = useCallback((fn: () => void) => {
    setOnXHSExport(() => fn);
  }, []);

  // 刷新历史记录
  const refreshHistory = useCallback(async () => {
    try {
      const { data, error } = await supabase
        .from('projects')
        .select('*')
        .order('updated_at', { ascending: false });
      
      if (error) throw error;
      setHistoryList(data || []);
    } catch (err) {
      console.error('获取历史记录失败:', err);
    }
  }, []);

  // 初始化加载历史
  useEffect(() => {
    refreshHistory();
  }, [refreshHistory]);

  // 创建新项目
  const createNewProject = useCallback(() => {
    setCurrentProjectId(null);
    setArticle(defaultArticle);
    setActivePlatform('zhihu');
    setAiCards(null);
    setCardImages({});
  }, []);

  // 加载项目
  const loadProject = useCallback(async (id: string) => {
    try {
      const { data, error } = await supabase
        .from('projects')
        .select('*')
        .eq('id', id)
        .single();
      
      if (error) throw error;
      if (data) {
        setCurrentProjectId(data.id);
        setArticle({
          id: data.id,
          source: data.source_content || '',
          meta: {
            title: data.title,
            platforms: ['zhihu'], 
            theme: 'nintendo_clay',
            createdAt: new Date(data.created_at),
            updatedAt: new Date(data.updated_at),
          },
          assets: { diagrams: [], images: [] }
        });
        setActivePlatform(data.active_platform as Platform);
        
        // 关键修复：从数据库恢复 AI 卡片和图片
        setAiCards(data.ai_cards || null);
        setCardImages(data.card_images || {});
        
        toast.success(`已加载项目：${data.title}`);
      }
    } catch (err) {
      console.error('加载项目失败:', err);
      toast.error('加载项目失败');
    }
  }, []);

  // 删除项目
  const deleteProject = useCallback(async (id: string) => {
    if (!confirm('确定要删除这个项目吗？此操作不可撤销。')) return;
    
    try {
      const { error } = await supabase
        .from('projects')
        .delete()
        .eq('id', id);
      
      if (error) throw error;
      
      toast.success('项目已成功从史册中抹除');
      
      if (currentProjectId === id) {
        createNewProject();
      }
      
      await refreshHistory();
    } catch (err) {
      console.error('删除项目失败:', err);
      toast.error('删除项目失败');
    }
  }, [currentProjectId, createNewProject, refreshHistory]);

  // 保存项目
  const saveProject = useCallback(async (extraData?: Partial<Project>) => {
    if (!article.source.trim() && !currentProjectId) return;
    
    setIsSaving(true);
    const titleMatch = article.source.match(/^# (.*)/m);
    const title = titleMatch ? titleMatch[1] : (article.meta.title || '未命名炼金项目');

    try {
      const projectData = {
        title,
        source_content: article.source,
        active_platform: activePlatform,
        ai_cards: aiCards,       // 包含 AI 卡片
        card_images: cardImages, // 包含 AI 图片 URL
        updated_at: new Date().toISOString(),
        ...extraData
      };

      if (currentProjectId) {
        const { error } = await supabase
          .from('projects')
          .update(projectData)
          .eq('id', currentProjectId);
        if (error) throw error;
      } else {
        const { data, error } = await supabase
          .from('projects')
          .insert([projectData])
          .select()
          .single();
        if (error) throw error;
        if (data) setCurrentProjectId(data.id);
      }
      
      await refreshHistory();
    } catch (err) {
      console.error('同步云端失败:', err);
    } finally {
      setIsSaving(false);
    }
  }, [article.source, article.meta.title, activePlatform, currentProjectId, aiCards, cardImages, refreshHistory]);

  const setSource = (source: string) => {
    setArticle((prev) => ({
      ...prev,
      source,
      meta: { ...prev.meta, updatedAt: new Date() },
    }));
  };

  const setPlatforms = (platforms: Platform[]) => {
    setArticle((prev) => ({
      ...prev,
      meta: { ...prev.meta, platforms, updatedAt: new Date() },
    }));
  };

  const updateMeta = (meta: Partial<Article['meta']>) => {
    setArticle((prev) => ({
      ...prev,
      meta: { ...prev.meta, ...meta, updatedAt: new Date() },
    }));
  };

  return (
    <EditorContext.Provider value={{ 
      article, 
      activePlatform, 
      setActivePlatform, 
      setSource, 
      setPlatforms, 
      updateMeta,
      onXHSExport,
      registerXHSExport,
      currentProjectId,
      historyList,
      isSaving,
      saveProject,
      loadProject,
      deleteProject,
      createNewProject,
      refreshHistory,
      aiCards,
      setAiCards,
      cardImages,
      setCardImages
    }}>
      {children}
    </EditorContext.Provider>
  );
};

export const useEditor = () => {
  const context = useContext(EditorContext);
  if (context === undefined) {
    throw new Error('useEditor must be used within an EditorProvider');
  }
  return context;
};
