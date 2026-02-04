import axios from 'axios';
import { ImageProxyService } from '@/lib/services/image-proxy-service';

// 从环境变量读取配置
const API_CONFIG = {
  apiUrl: import.meta.env.VITE_AI_API_URL || 'https://ark.cn-beijing.volces.com/api/v3',
  apiKey: import.meta.env.VITE_AI_API_KEY || '',
  model: import.meta.env.VITE_AI_MODEL || 'doubao-seed-1-8-251228',
  imageModel: import.meta.env.VITE_AI_IMAGE_MODEL || '', // 新增图片模型配置
};

const client = axios.create({
  baseURL: API_CONFIG.apiUrl,
  headers: {
    'Content-Type': 'application/json',
    'Authorization': `Bearer ${API_CONFIG.apiKey}`,
  },
});

export const aiService = {
  /**
   * 润色文本 - 兼容 OpenAI/火山方舟 格式
   */
  enhanceContent: async (text: string, platform: string) => {
    const response = await client.post('/chat/completions', {
      model: API_CONFIG.model,
      messages: [
        {
          role: 'system',
          content: `你是一个专业的文案排版专家。请根据用户提供的文本，针对${platform}平台进行润色，使其更具吸引力、更符合平台风格，同时保持原意。请直接返回润色后的正文内容。`
        },
        {
          role: 'user',
          content: text
        }
      ]
    });
    
    return {
      enhanced: response.data.choices[0].message.content,
      suggestions: []
    };
  },

  /**
   * 全文智能排版 - 将纯文本转换为结构化的 Markdown
   */
  smartTypeset: async (text: string) => {
    const response = await client.post('/chat/completions', {
      model: API_CONFIG.model,
      messages: [
        {
          role: 'system',
          content: `你是一个专业的文章排版大师。你的任务是将用户提供的杂乱纯文本转换为结构精美、逻辑清晰的 Markdown 格式。
要求：
1. 识别并添加合适的标题（H1, H2, H3）。
2. 对核心关键词进行**加粗**。
3. 使用列表（有序或无序）整理要点。
4. 提取文中的金句并使用引用块（>）标识。
5. 保持原文意思不变，但可以进行微小的语感修饰。
请直接返回排版后的 Markdown 内容。`
        },
        {
          role: 'user',
          content: text
        }
      ]
    });
    
    return response.data.choices[0].message.content;
  },

  /**
   * 根据文本生成图表代码
   */
  generateDiagram: async (text: string, style: string = 'handdrawn') => {
    const response = await client.post('/chat/completions', {
      model: API_CONFIG.model,
      messages: [
        {
          role: 'system',
          content: `你是一个 Mermaid 图表生成专家。请将用户提供的描述转换为合法的 Mermaid 代码。风格要求：${style}。只返回代码块内容，不要任何解释。`
        },
        {
          role: 'user',
          content: text
        }
      ]
    });

    const content = response.data.choices[0].message.content.replace(/```mermaid\n?|```/g, '').trim();
    return { content };
  },

  /**
   * 生成 AI 配图提示词与建议 (专为小红书优化)
   */
  generateImagePrompt: async (text: string) => {
    const response = await client.post('/chat/completions', {
      model: API_CONFIG.model,
      messages: [
        {
          role: 'system',
          content: `你是一个极简风格的视觉记录师（Visual Notetaker）。请根据用户输入的文字内容，创作一张【手绘逻辑说明图】的生图提示词。

要求：
1. **核心文字集成**：图片中必须包含文案中的核心关键词（如 "Agent Skill" 或其对应的中文）。**特别要求：请在图中书写中文文字**。请在 Prompt 中明确要求将这些中文文字以手绘艺术字的形式写在画面显眼位置。
2. **视觉风格**：
   - 风格：简洁、可爱、富有亲和力的手绘笔记风格。
   - 媒介：看起来像是用 iPad Pro 在 Procreate 或 GoodNotes 上绘制的草图。
   - 线条：柔和的墨水线条，带有真实的压力感和轻微的抖动。
   - 元素：使用简单的手绘几何框、箭头、火柴人、小灯泡、齿轮等逻辑符号。
   - 配色：清新且对比分明的配色（如浅灰背景配明黄高光，或白底配科技蓝线条），保持平面感。
3. **内容映射**：
   - 必须根据文案的【逻辑关系】来构思画面（例如“核心支撑”就画成一个地基或底座）。
   - 严禁套用固定的科技枢纽模板。

请严格按照以下格式输出：
【主题】提取的核心主题
【英文Prompt】完整英文描述（必须包含中文文字嵌入指令，例如: The Chinese text "..." is written in a cute hand-drawn style. Ensure the characters are correct Chinese Hanzi.）
【中文Prompt】完整中文描述
【视觉建议】说明画面中各元素如何体现文案逻辑`
        },
        {
          role: 'user',
          content: text
        }
      ]
    });

    return response.data.choices[0].message.content;
  },

  /**
   * 生成 AI 配图 (基于生成的提示词)
   */
  generateImage: async (text: string) => {
    if (!API_CONFIG.imageModel) {
      // 如果没有配置图片模型，则先尝试生成提示词供用户参考，并抛出友好错误
      const smartPromptInfo = await aiService.generateImagePrompt(text);
      console.group('🎨 AI 生图提示词记录 (未配置模型)');
      console.log('原始文本:', text);
      console.log('生成建议:', smartPromptInfo);
      console.groupEnd();
      throw new Error(`未配置图片模型 ID (VITE_AI_IMAGE_MODEL)。建议提示词：\n\n${smartPromptInfo}`);
    }

    // 1. 先调用 smart prompt 专家进行提示词扩充
    const smartPromptInfo = await aiService.generateImagePrompt(text);
    
    // 从返回的结构中提取英文 Prompt 进行绘图
    const englishPromptMatch = smartPromptInfo.match(/【英文Prompt】([\s\S]*?)(?=\n【|$)/);
    const finalPrompt = englishPromptMatch ? englishPromptMatch[1].trim() : text;

    // 打印精美的日志记录
    console.group('🚀 炼金引擎：生图任务发起');
    console.log('%c[原始文案]', 'color: #9e9e9e; font-weight: bold', text);
    console.log('%c[智绘建议]', 'color: #4caf50; font-weight: bold', smartPromptInfo);
    console.log('%c[最终 Prompt]', 'color: #2196f3; font-weight: bold', finalPrompt);
    console.log('%c[目标模型]', 'color: #ff9800; font-weight: bold', API_CONFIG.imageModel);
    console.groupEnd();

    try {
      // 尝试调用绘图接口 (适配火山方舟图像生成格式)
      const response = await client.post('/images/generations', {
        model: API_CONFIG.imageModel || 'doubao-seedream-4-5-251128', 
        prompt: finalPrompt,
        sequential_image_generation: "disabled",
        response_format: "url",
        size: "2K",
        stream: false,
        watermark: true
      });
      
      const imageUrl = response.data.data[0].url;
      
      // 🔥 使用智能代理下载（带缓存机制）
      console.log('📥 开始智能代理下载图片...');
      const proxyResult = await ImageProxyService.smartDownload(imageUrl);
      console.log(`✅ 图片代理下载完成 ${proxyResult.fromCache ? '(来自缓存)' : '(新鲜下载)'}`);
      
      return { 
        imageUrl: imageUrl,
        base64: proxyResult.base64,
        mimeType: proxyResult.mimeType,
        size: proxyResult.size,
        fromCache: proxyResult.fromCache,
        promptInfo: smartPromptInfo
      };
    } catch (e) {
      // 如果不支持绘图，则只返回生成的结构化提示词
      return {
        imageUrl: null,
        promptInfo: smartPromptInfo
      };
    }
  },

  /**
   * 小红书卡片智能创意生成
   */
  generateXHSCards: async (text: string) => {
    const response = await client.post('/chat/completions', {
      model: API_CONFIG.model,
      messages: [
        {
          role: 'system',
          content: `你是一个专业的知识博主与 AI 视觉设计专家。请将用户提供的文本拆分为 3-6 张精美的小红书卡片内容。
要求：
1. 每张卡片包含一个【标题】和【正文】。
2. 语言风格：严谨、专业、干货满满。虽然发布在小红书，但要避免过度活泼和滥用 Emoji，保持 AI 技术分享的严肃性和权威感。
3. 结构：逻辑清晰，每张卡片专注于一个核心知识点。
4. 返回格式必须是 JSON 数组：[{"title": "...", "content": "..."}, ...]`
        },
        {
          role: 'user',
          content: text
        }
      ]
      // 移除强制 JSON 模式，改用更通用的提示词和手动解析，以提高兼容性
    });

    try {
      const content = response.data.choices[0].message.content;
      console.log('AI Raw Content:', content);
      
      // 更强大的 JSON 提取逻辑：寻找第一个 [ 和最后一个 ]
      let jsonStr = '';
      const startBracket = content.indexOf('[');
      const endBracket = content.lastIndexOf(']');
      
      if (startBracket !== -1 && endBracket !== -1 && endBracket > startBracket) {
        jsonStr = content.substring(startBracket, endBracket + 1);
      } else {
        // 尝试寻找对象形式 { ... }
        const startObj = content.indexOf('{');
        const endObj = content.lastIndexOf('}');
        if (startObj !== -1 && endObj !== -1 && endObj > startObj) {
          jsonStr = content.substring(startObj, endObj + 1);
        } else {
          jsonStr = content.replace(/```json\n?|```/g, '').trim();
        }
      }

      const parsed = JSON.parse(jsonStr);
      
      // 兼容性处理：有些模型会把数组包装在对象里，如 { "cards": [...] } 或 { "data": [...] }
      let cardsArray: any[] = [];
      if (Array.isArray(parsed)) {
        cardsArray = parsed;
      } else if (parsed.cards && Array.isArray(parsed.cards)) {
        cardsArray = parsed.cards;
      } else if (parsed.data && Array.isArray(parsed.data)) {
        cardsArray = parsed.data;
      } else if (typeof parsed === 'object') {
        const keys = Object.keys(parsed);
        if (keys.length === 1 && Array.isArray(parsed[keys[0]])) {
          cardsArray = parsed[keys[0]];
        }
      }
      
      // 确保返回的是非空数组，如果解析出空数组且原文有内容，则尝试按 H2 拆分作为兜底
      if (cardsArray.length === 0 && text.trim()) {
        console.warn('AI 返回了空卡片数组，执行兜底拆分逻辑');
        return text.split(/^(?=## )/m).map(s => ({
          title: s.startsWith('## ') ? s.split('\n')[0].replace('## ', '').trim() : '知识点',
          content: s.replace(/^## .*\n/, '').trim()
        }));
      }

      return cardsArray;
    } catch (e) {
      console.error('解析 AI 卡片 JSON 失败:', e, 'Raw Content:', response.data.choices[0].message.content);
      throw new Error('AI 返回内容无法解析，请重试');
    }
  }
};
