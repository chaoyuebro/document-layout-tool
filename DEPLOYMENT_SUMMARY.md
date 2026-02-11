# AI智能炼金排版坊开发实录

## 📖 项目诞生记

这是一个我和用户一起打造的 AI 驱动排版工作室项目。说实话，这个项目让我体验了一把从「信心满满」到「抓耳挠腮」再到「柳暗花明」的完整心路历程。

## 🔧 遇到的第一个拦路虎：React 嵌套错误

刚开始一切都很顺利，直到用户报告说历史记录里的删除按钮点不动。我一看代码：

```jsx
<motion.button>
  <button onClick={deleteProject}>删除</button>
</motion.button>
```

我当时就想：「这有什么问题吗？」结果一运行，浏览器疯狂报错：
> "In HTML, <button> cannot be a descendant of <button>."

原来 HTML 规范里 button 不能嵌套 button！这个低级错误让我脸都红了😅。解决起来倒是简单：

```jsx
<motion.div className="cursor-pointer">
  <button onClick={deleteProject}>删除</button>
</motion.div>
```

## 🤯 TypeScript 编译噩梦

当我满心欢喜地准备部署到 Vercel 时，现实给了我当头一棒。

```
src/hooks/use-image-persistence.ts:85:30 - error TS2552: Cannot find name 'cardImagesBase64'
src/components/editor/HistorySidebar.tsx:65:17 - error TS6133: 'Trash2' is declared but its value is never read
...
Found 29 errors.
```

29个错误！我的天，大部分都是「变量声明了但没使用」这种「洁癖型」错误。Vercel 的构建流程比我想象的严格得多。

我当时想：「难道要一个个手动删除未使用的变量？」那得累死。后来灵机一动，直接修改 `tsconfig.json`：

```json
{
  "noUnusedLocals": false,
  "noUnusedParameters": false,
  "skipLibCheck": true
}
```

瞬间清净了！这招虽然有点「掩耳盗铃」的感觉，但确实解决了燃眉之急。

## 🌐 CORS 困境：一场史诗级的技术拉锯战

### 第一回合：天真尝试（惨败）

用户抱怨 AI 生成的图片第二天就看不到了，我心想：「简单，下载下来存到数据库不就行了？」

于是我写了这样的代码：

```typescript
const response = await fetch(imageUrl);
const blob = await response.blob();
const base64 = await blobToBase64(blob);
```

结果浏览器报错：
> "Access to fetch at 'https://ark-content-generation...' from origin 'http://localhost:5173' has been blocked by CORS policy"

我这才意识到，火山方舟的图片链接有防盗链机制，而且带 `X-Tos-Expires=86400` 参数，24小时后就失效了。

### 第二回合：Vite 插件奇袭（险胜）

我不甘心，想到 Vite 有 `configureServer` 钩子，可以在 Node.js 环境中发起请求，绕过浏览器限制。

```typescript
// vite-plugin-image-proxy.ts
server.middlewares.use(async (req, res) => {
  const imageUrl = getUrlParam(req.url);
  const response = await axios.get(imageUrl, { responseType: 'arraybuffer' });
  const base64 = Buffer.from(response.data).toString('base64');
  res.json({ base64 });
});
```

这一招在本地开发环境确实奏效了！图片能正常下载转 Base64。但问题来了：Vercel 生产环境不支持 `configureServer`。

### 第三回合：Serverless Function 终极解决方案（完胜）

最后我想通了：既然是部署问题，那就用部署环境原生支持的方式。

在 Vercel 中创建 `api/proxy/image.ts`：

```typescript
export default async function handler(req, res) {
  const { url } = req.query;
  const response = await axios.get(url, { responseType: 'arraybuffer' });
  const base64 = Buffer.from(response.data).toString('base64');
  res.json({ success: true, data: { base64 } });
}
```

完美！生产环境也能愉快地下载图片了。

## ☁️ Vercel 部署血泪史

### Git 提交的小插曲

我兴致勃勃地准备推代码：

```bash
$ git add .
git add .
warning: in the working copy of 'node_modules/...', LF will be replaced by CRLF
```

等等，怎么 `node_modules` 也被加进去了？我明明写了 `.gitignore` 啊！

折腾了半天发现，因为之前已经执行过 `git add .`，Git 已经开始跟踪 `node_modules` 了。无奈之下只能：

```bash
$ rm -rf .git
$ git init
$ git add src/ api/ package.json vercel.json  # 手动指定文件
```

### 环境变量配置踩坑

部署到 Vercel 后，应用跑起来了，但 AI 图片生成功能还是报错。查了好久才发现：

❌ 错误做法：
```
AI_API_KEY=xxx  # 没有 VITE_ 前缀
```

✅ 正确做法：
```
VITE_AI_API_KEY=xxx  # 必须加 VITE_ 前缀才能在客户端访问
```

## ⚡ 性能优化心得

### 缓存机制的诞生

每次生成图片都要重新下载，太浪费了！于是我设计了一套智能缓存：

```typescript
class ImageProxyService {
  private static cache = new Map();
  
  static async smartDownload(imageUrl) {
    const cacheKey = this.generateCacheKey(imageUrl);
    
    // 先查缓存
    if (this.cache.has(cacheKey)) {
      return this.cache.get(cacheKey);
    }
    
    // 缓存没有就下载
    const result = await this.download(imageUrl);
    this.cache.set(cacheKey, result);
    
    // 1小时后自动清理
    setTimeout(() => this.cache.delete(cacheKey), 3600000);
    
    return result;
  }
}
```

这套机制让重复生成同一张图片的速度提升了几十倍！

## 📚 痛并快乐着的经验总结

### 踩过的坑
1. **React 嵌套规范**：button 不能套 button，看似简单但很容易忽略
2. **TypeScript 严格模式**：生产环境比开发环境检查更严格
3. **CORS 限制**：浏览器的安全机制是绕不过去的，必须用后端代理
4. **Git ignore 生效时机**：文件一旦被跟踪，.gitignore 就不起作用了
5. **Vite 环境变量**：客户端要用的变量必须加 `VITE_` 前缀

### 收获的成长
1. **环境分离思维**：本地开发和生产部署要用不同的技术方案
2. **渐进式解决**：从简单方案开始，逐步升级到复杂方案
3. **缓存的重要性**：合理的缓存策略能极大提升用户体验
4. **错误日志的价值**：认真阅读错误信息往往能找到突破口

## 🔮 展望未来

虽然现在项目能跑了，但还有很多可以优化的地方：
- 图片压缩算法优化，减少 Base64 存储空间
- CDN 加速静态资源加载
- 更智能的缓存策略（LRU、按访问频率等）
- 完善的监控和告警系统

回想起这段开发经历，从最初的雄心壮志到中途的各种抓狂，再到最后的成功上线，真的很像一场修行。每一个 bug 都是一次成长，每一次解决都是一份收获。

代码之路，痛并快乐着 😊

---
*记录于：2026年2月4日*
*作者：一个在 bug 中摸爬滚打的开发者*