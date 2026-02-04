# AI 炼金排版坊 V3.0 实施计划
## 🎯 项目概览

**核心目标**：打造一个"瑞士军刀"式的排版工具，将单一内容自动转换为 4 个平台的原生格式：
- **知乎/掘金**：Markdown 原教旨主义，极客风格，代码高亮
- **微信公众号**：沉浸式 HTML，内联 CSS，精致阅读体验
- **小红书**：视觉冲击力，自动切片为图片卡片
- **飞书文档**：结构化知识，Callout 块，文档风格

**UI 风格**：任天堂粘土风（Nintendo Clay）—— 圆润、高饱和度、3D 悬浮按钮，消除工具的冰冷感

**架构模式**：SaaS 模式，后端代理所有 AI 请求（前端不暴露 API Key）

---

## 📋 项目范围

### ✅ MVP 必须包含（v3.0）
1. 多平台选择界面（复选框）
2. 统一 Markdown 源码编辑器 + 实时预览
3. Tab 切换式预览系统（4 个平台）
4. 各平台专属渲染器（精准格式适配）
5. "选中文字生成配图"交互框架
6. 手绘风格图表生成（iPad 笔记风）
7. 各平台基础导出功能
8. 任天堂粘土风 UI 主题
9. 后端 API 接口结构

### ⏭️ 延后版本（未来迭代）
- 小红书复杂贴纸系统（v3.1）
- 多账号自动发布 API（v3.2）
- 高级图表编辑工具
- 实时协作功能
- 移动端 App

---

## 🏗️ 技术架构

### 前端技术栈
- **框架**：React 19 + TypeScript + Vite
- **UI 组件**：Shadcn/UI（已安装）
- **样式**：TailwindCSS + 自定义粘土风主题
- **状态管理**：React Context API + TanStack Query
- **Markdown 处理**：
  - `marked` 或 `markdown-it`（解析）
  - `prismjs`（代码高亮）
  - `katex`（LaTeX 数学公式）
- **图表生成**：
  - `mermaid`（流程图）
  - `excalidraw`（手绘风格）
- **导出**：
  - `html2canvas` 或 `dom-to-image`（生成图片）
  - `jszip`（打包小红书导出）

### 后端需求
- **API 代理端点**（需要实现）：
  - `/api/ai/enhance-content` - 文本优化
  - `/api/ai/generate-diagram` - 图表生成
  - `/api/ai/generate-image` - 视觉资产
  - `/api/export/wechat` - 微信 HTML 导出
  - `/api/export/xiaohongshu` - 小红书切片

---

## 📁 文件结构规划

```
/workspace/thread/
├── src/
│   ├── pages/
│   │   ├── Index.tsx (重定向到 /editor)
│   │   ├── editor/
│   │   │   ├── index.tsx (主编辑器页面)
│   │   │   ├── EditorLayout.tsx (布局：源码 + 预览)
│   │   │   ├── PlatformSelector.tsx (平台选择器 UI)
│   │   │   ├── SourceEditor.tsx (Markdown 输入区)
│   │   │   └── PreviewTabs.tsx (平台预览 Tab 容器)
│   │   └── NotFound.tsx (已存在)
│   │
│   ├── components/
│   │   ├── editor/
│   │   │   ├── ToolBar.tsx (顶部操作栏)
│   │   │   ├── FloatingMenu.tsx (选中文字后的悬浮菜单)
│   │   │   ├── ExportDialog.tsx (导出弹窗)
│   │   │   └── DiagramStylePicker.tsx (图表风格选择器)
│   │   │
│   │   ├── renderers/
│   │   │   ├── ZhihuRenderer.tsx (Markdown → 知乎 HTML)
│   │   │   ├── WeChatRenderer.tsx (Markdown → 公众号 HTML)
│   │   │   ├── FeishuRenderer.tsx (Markdown → 飞书文档)
│   │   │   └── XiaohongshuRenderer.tsx (Markdown → 图片卡片)
│   │   │
│   │   ├── preview/
│   │   │   ├── PhoneFrame.tsx (iPhone 14 模拟器)
│   │   │   ├── DesktopFrame.tsx (桌面浏览器模拟器)
│   │   │   └── CardPreview.tsx (小红书卡片画廊)
│   │   │
│   │   ├── diagram/
│   │   │   ├── DiagramGenerator.tsx (LLM → Mermaid/Excalidraw)
│   │   │   ├── MermaidRenderer.tsx (渲染 Mermaid 图表)
│   │   │   └── HandDrawnCanvas.tsx (Excalidraw 集成)
│   │   │
│   │   └── ui/ (已存在的 Shadcn 组件 + 自定义)
│   │       └── clay-button.tsx (新增：粘土风按钮)
│   │
│   ├── lib/
│   │   ├── markdown/
│   │   │   ├── parser.ts (统一 Markdown 解析器)
│   │   │   ├── zhihu-transformer.ts (知乎特定规则)
│   │   │   ├── wechat-transformer.ts (内联 CSS 注入)
│   │   │   ├── feishu-transformer.ts (Callout 转换)
│   │   │   └── syntax-highlighter.ts (Prism.js 包装)
│   │   │
│   │   ├── export/
│   │   │   ├── wechat-exporter.ts (HTML + Base64 图片)
│   │   │   ├── zhihu-exporter.ts (纯 Markdown)
│   │   │   ├── feishu-exporter.ts (飞书 Markdown 方言)
│   │   │   └── xiaohongshu-exporter.ts (图片 + 文本切片)
│   │   │
│   │   ├── api/
│   │   │   ├── client.ts (API 客户端封装)
│   │   │   ├── ai-service.ts (AI 端点)
│   │   │   └── export-service.ts (导出端点)
│   │   │
│   │   └── utils/
│   │       ├── text-selection.ts (文本选择辅助)
│   │       ├── image-utils.ts (图片处理)
│   │       └── clipboard.ts (剪贴板复制)
│   │
│   ├── hooks/
│   │   ├── use-editor-state.ts (全局编辑器状态)
│   │   ├── use-platform-selector.ts (平台选择逻辑)
│   │   ├── use-markdown-processor.ts (Markdown 处理)
│   │   ├── use-text-selection.ts (选择跟踪)
│   │   └── use-export.ts (导出逻辑)
│   │
│   ├── contexts/
│   │   └── EditorContext.tsx (全局编辑器上下文)
│   │
│   ├── types/
│   │   ├── article.ts (文章数据结构)
│   │   ├── platform.ts (平台类型)
│   │   ├── diagram.ts (图表类型)
│   │   └── export.ts (导出类型)
│   │
│   └── styles/
│       ├── nintendo-clay.css (任天堂粘土风主题)
│       └── platform-themes.css (各平台专属样式)
```

---

## 🎨 UI 设计系统 - 任天堂粘土风主题

### 色彩系统
```css
/* 粘土风配色 */
--clay-primary: #FF6B6B;      /* 珊瑚红 */
--clay-secondary: #4ECDC4;    /* 青绿色 */
--clay-accent: #FFE66D;       /* 阳光黄 */
--clay-purple: #A8DADC;       /* 柔和紫 */
--clay-bg: #F8F9FA;           /* 浅背景 */
--clay-surface: #FFFFFF;      /* 纯白卡片 */

/* 平台配色 */
--zhihu-blue: #0084FF;
--wechat-green: #07C160;
--xiaohongshu-red: #FF2442;
--feishu-blue: #3370FF;
```

### 按钮样式特征
- **圆角**：`border-radius: 16px`
- **3D 效果**：`box-shadow: 0 4px 0 rgba(0,0,0,0.1)`
- **悬停动画**：向上抬起 2px，阴影扩大
- **按下状态**：压下效果

### 组件特性
- 所有卡片：`border-radius: 20px`
- 悬浮阴影：`box-shadow: 0 8px 24px rgba(0,0,0,0.08)`
- 平滑过渡：`transition: all 0.3s cubic-bezier(0.4, 0, 0.2, 1)`

---

## 📝 实施步骤

### 第一阶段：基础与 UI 结构（第 1-2 天）

#### 步骤 1.1：搭建任天堂粘土风主题
**创建/修改文件**：
- `src/styles/nintendo-clay.css`
- `src/components/ui/clay-button.tsx`
- `tailwind.config.ts`（扩展主题）

**任务**：
1. 定义粘土风颜色的 CSS 变量
2. 创建带 3D 效果的自定义按钮组件
3. 在 Tailwind 配置中添加自定义动画
4. 测试按钮的悬停/激活状态

#### 步骤 1.2：创建编辑器布局
**创建文件**：
- `src/pages/editor/index.tsx`
- `src/pages/editor/EditorLayout.tsx`
- `src/contexts/EditorContext.tsx`
- `src/types/article.ts`

**任务**：
1. 创建分栏布局（左侧源码，右侧预览）
2. 实现 EditorContext 全局状态管理
3. 定义 Article 类型结构：
   ```typescript
   interface Article {
     id: string;
     source: string; // Markdown 源码
     meta: {
       title?: string;
       platforms: Platform[];
       theme: 'nintendo_clay';
       createdAt: Date;
       updatedAt: Date;
     };
     assets: {
       diagrams: Diagram[];
       images: string[];
     };
   }
   ```

#### 步骤 1.3：平台选择器组件
**创建文件**：
- `src/pages/editor/PlatformSelector.tsx`
- `src/hooks/use-platform-selector.ts`

**任务**：
1. 创建复选框网格（带平台图标）
2. 实现多选逻辑
3. 添加平台颜色指示器
4. 在上下文中存储选择

---

### 第二阶段：Markdown 处理管道（第 3-4 天）

#### 步骤 2.1：核心 Markdown 解析器
**创建文件**：
- `src/lib/markdown/parser.ts`
- `src/lib/markdown/syntax-highlighter.ts`
- `src/hooks/use-markdown-processor.ts`

**需要安装的依赖**：
```bash
pnpm add marked prismjs highlight.js katex
pnpm add -D @types/marked @types/prismjs
```

**任务**：
1. 配置 `marked` 自定义渲染器
2. 集成 Prism.js 代码高亮
3. 添加 KaTeX 数学公式支持
4. 创建统一处理 Hook

#### 步骤 2.2：平台专属转换器
**创建文件**：
- `src/lib/markdown/zhihu-transformer.ts`
- `src/lib/markdown/wechat-transformer.ts`
- `src/lib/markdown/feishu-transformer.ts`

**任务**：
1. **知乎**：保持 Markdown 纯净，添加代码块主题
2. **公众号**：将所有 Markdown 转为内联 CSS 的 HTML
   - 标题 → 带特定字体的 `<h1>`
   - 列表 → 带自定义项目符号的 `<ul>`
   - 引用 → 带左边框的彩色框
3. **飞书**：转换 `> ⚠️` → Callout 块（前缀 Emoji）

---

### 第三阶段：平台渲染器（第 5-7 天）

#### 步骤 3.1：源码编辑器组件
**创建文件**：
- `src/pages/editor/SourceEditor.tsx`

**依赖**：
```bash
pnpm add @uiw/react-textarea-code-editor
```

**任务**：
1. 创建带 Markdown 语法高亮的文本区
2. 添加自动保存功能
3. 实现行号显示
4. 添加键盘快捷键（Ctrl+B 加粗等）

#### 步骤 3.2：预览 Tab 容器
**创建文件**：
- `src/pages/editor/PreviewTabs.tsx`
- `src/components/preview/PhoneFrame.tsx`
- `src/components/preview/DesktopFrame.tsx`

**任务**：
1. 创建 Tab 切换 UI（使用 Radix Tabs）
2. 仅渲染激活的 Tab（性能优化）
3. 为 Tab 添加平台图标

#### 步骤 3.3：各平台渲染器
**创建文件**：
- `src/components/renderers/ZhihuRenderer.tsx`
- `src/components/renderers/WeChatRenderer.tsx`
- `src/components/renderers/FeishuRenderer.tsx`
- `src/components/renderers/XiaohongshuRenderer.tsx`

**各渲染器任务**：

**A. 知乎渲染器**：
- 渲染纯 Markdown HTML
- 应用 Prism.js 代码块主题
- 支持 LaTeX 公式
- 桌面框架包装

**B. 公众号渲染器**：
- 用 iPhone 14 框架包装（375x812px 视口）
- 为所有元素应用内联 CSS
- 本地图片转 Base64
- 正确处理换行（中文文本）
- 代码块过长时添加横向滚动

**C. 飞书渲染器**：
- 桌面框架（更宽布局）
- 引用转为飞书 Callout 样式：
  ```
  > ⚠️ 警告 → 黄色 Callout 框
  > 💡 提示 → 蓝色 Callout 框
  > ✅ 成功 → 绿色 Callout 框
  ```
- 添加文档风格内边距

**D. 小红书渲染器**：
- 初始版本：显示"自动切片进行中..."
- 显示生成的卡片列表（3:4 比例缩略图）
- 可点击预览完整卡片

---

### 第四阶段：视觉增强 - 图表生成（第 8-10 天）

#### 步骤 4.1：文本选择检测
**创建文件**：
- `src/hooks/use-text-selection.ts`
- `src/lib/utils/text-selection.ts`
- `src/components/editor/FloatingMenu.tsx`

**任务**：
1. 检测源码编辑器中的文本选择
2. 选中时显示悬浮弹出菜单
3. 将弹出框定位在选中文本附近
4. 添加"✨ 生成配图"按钮

#### 步骤 4.2：图表生成服务
**创建文件**：
- `src/components/diagram/DiagramGenerator.tsx`
- `src/components/diagram/DiagramStylePicker.tsx`
- `src/lib/api/ai-service.ts`

**依赖**：
```bash
pnpm add mermaid @excalidraw/excalidraw
```

**任务**：
1. 创建后端 AI 服务客户端
2. 将选中文本发送到 `/api/ai/generate-diagram`
3. 后端返回 Mermaid 代码或 Excalidraw JSON
4. 提供风格选择器（iPad 手绘、极简、蓝图）

#### 步骤 4.3：图表渲染
**创建文件**：
- `src/components/diagram/MermaidRenderer.tsx`
- `src/components/diagram/HandDrawnCanvas.tsx`

**任务**：
1. **Mermaid**：用手绘主题渲染
   ```javascript
   mermaid.initialize({ 
     theme: 'base',
     themeVariables: {
       primaryColor: '#FFE5D9',
       primaryTextColor: '#2C3E50',
       primaryBorderColor: '#FF6B6B',
       lineColor: '#4ECDC4',
       fontFamily: 'Comic Sans MS'
     }
   });
   ```
2. **Excalidraw**：嵌入 Excalidraw 组件用于编辑
3. 转为 SVG/PNG 以嵌入内容
4. 在源码编辑器光标位置插入

---

### 第五阶段：小红书自动切片（第 11-12 天）

#### 步骤 5.1：内容分割
**创建文件**：
- `src/lib/export/xiaohongshu-exporter.ts`
- `src/lib/utils/text-slicer.ts`

**任务**：
1. 按 H2 标题解析 Markdown
2. 创建段落：[封面、第 1 节、第 2 节...]
3. 限制每卡文字（最多 150 个中文字符）
4. 从内容中提取关键图片

#### 步骤 5.2：卡片设计与生成
**创建文件**：
- `src/components/preview/CardPreview.tsx`
- `src/lib/export/card-generator.ts`

**依赖**：
```bash
pnpm add html2canvas
```

**任务**：
1. 设计卡片模板（1080x1440px）：
   - **封面**：标题 + 渐变背景 + Emoji
   - **内容卡**：
     - 白色背景带圆角
     - 大号文字（28px）
     - 可选图片
     - 页码指示器
2. 使用 html2canvas 将 DOM 渲染为 PNG
3. 添加精致装饰（角落贴纸）

#### 步骤 5.3：预览画廊
**任务**：
1. 以画廊视图显示卡片（3 列）
2. 点击放大
3. 下载全部为 ZIP 按钮

---

### 第六阶段：导出功能（第 13-14 天）

#### 步骤 6.1：导出对话框
**创建文件**：
- `src/components/editor/ExportDialog.tsx`
- `src/hooks/use-export.ts`

**任务**：
1. 创建带平台导出选项的弹窗
2. 显示导出格式预览
3. 添加复制/下载按钮

#### 步骤 6.2：平台导出器
**创建文件**：
- `src/lib/export/wechat-exporter.ts`
- `src/lib/export/zhihu-exporter.ts`
- `src/lib/export/feishu-exporter.ts`

**依赖**：
```bash
pnpm add jszip file-saver
```

**导出格式**：

**A. 公众号**：
- 输出：内联 CSS 的 HTML 字符串
- 所有图片转为 Base64
- 复制到剪贴板 → 直接粘贴到公众号编辑器
- 包含 CSS 重置以避免冲突

**B. 知乎**：
- 输出：纯 Markdown 文本
- 图片转为图片 URL（先上传到 CDN）
- LaTeX 公式用 `$$...$$` 格式
- 复制到剪贴板 → 粘贴到知乎编辑器

**C. 飞书**：
- 输出：飞书方言 Markdown
- Callout 块使用飞书语法
- 表格格式调整
- 复制到剪贴板

**D. 小红书**：
- 输出：ZIP 文件包含：
  - `1.jpg`, `2.jpg`, ...（卡片图片）
  - `caption.txt`（带 hashtag 的文案）
- 自动生成带 Emoji 和标签的文案

#### 步骤 6.3：剪贴板与下载
**创建文件**：
- `src/lib/utils/clipboard.ts`

**任务**：
1. 实现文本格式的剪贴板复制
2. 实现文件格式的下载
3. 显示成功 Toast 通知

---

### 第七阶段：后端 API 集成（第 15-16 天）

#### 步骤 7.1：API 客户端设置
**创建文件**：
- `src/lib/api/client.ts`
- `src/lib/api/ai-service.ts`
- `src/lib/api/export-service.ts`

**任务**：
1. 创建带错误处理的 axios/fetch 包装
2. 添加认证请求拦截器（如需要）
3. 实现重试逻辑
4. 添加加载状态

#### 步骤 7.2：后端端点（文档）
**创建后端 API 规范文档**：
```markdown
## 需要的后端端点

### 1. POST /api/ai/enhance-content
请求：
{
  "text": string,
  "targetPlatform": "zhihu" | "wechat" | "xiaohongshu" | "feishu",
  "enhancementType": "grammar" | "seo" | "readability"
}
响应：
{
  "enhanced": string,
  "suggestions": string[]
}

### 2. POST /api/ai/generate-diagram
请求：
{
  "text": string,
  "style": "handdrawn" | "minimal" | "blueprint",
  "diagramType": "flowchart" | "sequence" | "mindmap"
}
响应：
{
  "type": "mermaid" | "excalidraw",
  "content": string | object
}

### 3. POST /api/export/xiaohongshu
请求：
{
  "markdown": string,
  "style": "cute" | "minimal" | "magazine"
}
响应：
{
  "cards": [
    { "imageUrl": string, "caption": string }
  ],
  "zipUrl": string
}
```

**注意**：
- 所有端点需要后端实现
- 前端应优雅处理 API 失败
- 开发时添加 Mock 响应（无后端情况）

---

### 第八阶段：打磨与测试（第 17-18 天）

#### 步骤 8.1：UI 打磨
**任务**：
1. 为所有异步操作添加加载骨架
2. Tab 切换添加平滑过渡
3. 实现键盘快捷键指南
4. 为所有按钮添加工具提示
5. 测试响应式布局（MVP 仅桌面端）

#### 步骤 8.2：错误处理
**修改文件**：
- 所有 API 服务文件
- 所有导出函数

**任务**：
1. 为所有异步操作添加 try-catch 块
2. 显示用户友好的错误消息
3. 为失败渲染实现降级 UI
4. 添加错误边界组件

#### 步骤 8.3：性能优化
**任务**：
1. 懒加载平台渲染器
2. Markdown 处理防抖（300ms）
3. 记忆化昂贵计算
4. 按路由代码分割

#### 步骤 8.4：用户测试
**任务**：
1. 测试完整工作流：输入 → 选择平台 → 预览 → 导出
2. 测试各种 Markdown 特性：
   - 标题（H1-H6）
   - 列表（有序、无序、嵌套）
   - 代码块（多种语言）
   - 表格
   - 图片
   - 链接
   - 引用
   - 数学公式
3. 用不同文本样本测试图表生成
4. 测试各平台导出
5. 验证跨浏览器剪贴板功能

---

## 🔐 安全考虑

1. **前端不暴露 API Key**：所有 AI 请求通过后端代理
2. **输入消毒**：渲染前消毒 Markdown 以防 XSS
3. **速率限制**：后端实现用户级速率限制
4. **内容验证**：验证导出内容大小限制

---

## 📊 数据模型

### TypeScript 接口

```typescript
// src/types/platform.ts
export type Platform = 'zhihu' | 'wechat' | 'xiaohongshu' | 'feishu';

export interface PlatformConfig {
  id: Platform;
  name: string;
  icon: string;
  color: string;
  description: string;
}

// src/types/article.ts
export interface Article {
  id: string;
  source: string; // Markdown 源码
  meta: ArticleMeta;
  assets: ArticleAssets;
}

export interface ArticleMeta {
  title?: string;
  platforms: Platform[];
  theme: 'nintendo_clay';
  createdAt: Date;
  updatedAt: Date;
}

export interface ArticleAssets {
  diagrams: Diagram[];
  images: string[];
}

// src/types/diagram.ts
export interface Diagram {
  id: string;
  type: 'mermaid' | 'excalidraw';
  style: DiagramStyle;
  content: string | object;
  sourceText: string; // 生成它的原始文本
  position: number; // 在源文本中的位置
}

export type DiagramStyle = 'handdrawn' | 'minimal' | 'blueprint';

// src/types/export.ts
export interface ExportResult {
  platform: Platform;
  format: 'html' | 'markdown' | 'zip' | 'images';
  content: string | Blob;
  filename?: string;
}
```

---

## 🧪 测试策略

### 单元测试
- Markdown 转换器（各平台）
- 文本切片逻辑
- 剪贴板工具

### 集成测试
- 端到端：输入 Markdown → 预览 → 导出
- 图表生成流程
- 多平台导出

### 手动测试清单
- [ ] 平台选择器多选工作正常
- [ ] 源码编辑器接受 Markdown 输入
- [ ] 所有 4 个预览 Tab 正确渲染
- [ ] 知乎：代码块高亮显示
- [ ] 公众号：应用内联 CSS，显示 iPhone 框架
- [ ] 飞书：引用转为 Callout
- [ ] 小红书：生成正确尺寸的卡片
- [ ] 文本选择触发悬浮菜单
- [ ] 图表生成在正确位置插入
- [ ] 各平台导出对话框打开
- [ ] 复制到剪贴板工作正常
- [ ] 小红书 ZIP 下载工作正常
- [ ] 错误状态正确显示
- [ ] 异步操作显示加载状态

---

## 📦 依赖汇总

### 需要安装的新依赖
```bash
# Markdown 处理
pnpm add marked prismjs highlight.js katex

# 图表库
pnpm add mermaid @excalidraw/excalidraw

# 代码编辑器
pnpm add @uiw/react-textarea-code-editor

# 导出工具
pnpm add html2canvas jszip file-saver

# 类型定义
pnpm add -D @types/marked @types/prismjs
```

### 已安装
- React 19 + TypeScript
- Shadcn/UI 组件
- TanStack Query
- Framer Motion
- Tailwind CSS

---

## 🚀 部署考虑

### 前端
- 构建命令：`pnpm run build`
- 环境变量：
  - `VITE_API_BASE_URL`：后端 API 端点

### 后端（单独实现）
- 第 7 阶段文档化的必需端点
- AI 服务的 API 密钥管理
- 用户级速率限制
- 生成图片的文件存储

---

## 📈 成功指标

### MVP 完成标准
1. ✅ 用户可输入 Markdown 内容
2. ✅ 用户可选择多个目标平台
3. ✅ 各平台预览正确渲染
4. ✅ 用户可从选中文本生成手绘图表
5. ✅ 用户可导出平台原生格式的内容
6. ✅ 小红书自动切片生成卡片
7. ✅ UI 遵循任天堂粘土风设计系统
8. ✅ 前端不暴露 API 密钥

### 用户体验目标
- 输入到预览：< 500ms（典型文章长度）
- 图表生成：< 5s
- 导出操作：< 2s（不含大图片生成）
- 零手动格式化，平台自动适配

---

## 🔄 未来增强（MVP 后）

### V3.1 功能
- 高级小红书贴纸库
- 自定义图表编辑
- 常见内容类型模板库
- 批处理

### V3.2 功能
- 直接发布到平台（OAuth 集成）
- 多账号管理
- 分析仪表板
- 团队协作

### V3.3 功能
- AI 驱动的内容建议
- SEO 优化建议
- 不同平台版本的 A/B 测试
- 移动端 App

---

## 📝 注意事项与假设

1. **后端依赖**：许多功能（图表生成、小红书切片）需要后端 API。前端应有优雅的降级。

2. **浏览器兼容性**：目标现代浏览器（Chrome、Firefox、Safari、Edge - 最新 2 版本）。

3. **内容限制**：
   - 最大文章长度：50,000 字符
   - 每篇文章最多图片：20 张
   - 每篇文章最多图表：10 个

4. **性能**：通过防抖和记忆化，应能流畅处理实时编辑。

5. **本地化**：UI 标签用中文，但代码/注释用英文以便维护。

---

## 🎓 开发工作流

### 阶段顺序
1. **第 1-2 天**：基础（UI 结构、主题）
2. **第 3-4 天**：Markdown 管道
3. **第 5-7 天**：平台渲染器
4. **第 8-10 天**：图表生成
5. **第 11-12 天**：小红书切片
6. **第 13-14 天**：导出功能
7. **第 15-16 天**：API 集成
8. **第 17-18 天**：打磨与测试

### 每日工作流
1. 从计划创建文件开始
2. 实现核心逻辑
3. 添加 TypeScript 类型
4. 在浏览器中测试
5. 用清晰的消息提交
6. 进入下一步

### 代码审查检查点
- 第 2 阶段后（Markdown 处理）
- 第 3 阶段后（所有渲染器工作）
- 第 6 阶段后（导出完成）
- 部署前（最终审查）

---

## ✅ 验证清单

### 实施后
- [ ] 计划中的所有文件已创建
- [ ] 无 TypeScript 错误
- [ ] 所有导入正确解析
- [ ] 开发服务器无错误运行
- [ ] 各平台预览独立工作
- [ ] 导出为各平台生成正确格式
- [ ] 任天堂粘土风 UI 主题一致
- [ ] 移动端响应式（MVP 可选）
- [ ] 可访问性：键盘导航工作
- [ ] 错误边界捕获渲染错误
- [ ] 所有异步操作的加载状态
- [ ] 成功/错误 Toast 正确显示
- [ ] 浏览器控制台无错误
- [ ] 网络选项卡显示 API 调用正常
- [ ] 本地存储/上下文保留编辑器状态

---

## 🎯 实施优先级

### 高优先级（核心功能）
1. ✅ 平台选择器
2. ✅ 源码编辑器
3. ✅ 知乎渲染器（最简单）
4. ✅ 公众号渲染器
5. ✅ 基础导出（复制到剪贴板）

### 中优先级（增强功能）
6. ✅ 飞书渲染器
7. ✅ 图表生成框架
8. ✅ 悬浮选择菜单

### 低优先级（高级功能）
9. ⏭️ 小红书完整切片
10. ⏭️ 高级图表编辑
11. ⏭️ 后端集成

---

## 📞 支持与资源

### 文档参考
- [Marked.js 文档](https://marked.js.org/)
- [Prism.js 主题](https://prismjs.com/)
- [Mermaid 文档](https://mermaid.js.org/)
- [Excalidraw 库](https://docs.excalidraw.com/)
- [Shadcn/UI 组件](https://ui.shadcn.com/)

### 设计灵感
- 任天堂网站（粘土风 UI 样式）
- 小红书 App（卡片设计）
- 飞书/Lark 文档（Callout 样式）
- 微信文章模板

---

## 🎉 结论

本计划为构建 AI 炼金排版坊 V3.0 提供了全面的路线图。模块化架构确保每个组件可以独立开发和测试。分阶段方法允许在每个里程碑实现可工作的功能。

**预计 MVP 总开发时间**：18 天

**关键成功因素**：在添加高级功能之前，专注于各平台核心渲染准确性。"一份内容，多面人设"的承诺依赖于忠实的平台适配。

**下一步**：
1. 审查并批准本计划
2. 搭建开发环境
3. 开始第一阶段实施
4. 安排每日站会跟踪进度

准备开始构建！🚀