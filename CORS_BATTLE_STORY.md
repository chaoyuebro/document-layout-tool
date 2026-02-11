# 第八课：与 CORS 的生死搏斗

## 序章：平静下的暗流涌动

那是一个看似平常的下午，用户突然告诉我："AI 生成的图片第二天就看不到了。"

我心里咯噔一下——这可不是小事。图片丢失意味着用户辛辛苦苦生成的内容转眼就没了，这体验简直糟糕透顶。

"简单，下载下来存数据库不就得了？"我心想，立马动手写代码。

## 第一回合：天真者的惨败

```typescript
// 我的天真想法
const response = await fetch(imageUrl);
const blob = await response.blob();
const base64 = await blobToBase64(blob);
```

代码写完运行，浏览器给了我一个响亮的耳光：

> "Access to fetch at 'https://ark-content-generation...' from origin 'http://localhost:5173' has been blocked by CORS policy"

我当时就懵了。CORS？什么鬼？我不是在自己电脑上跑的好好的吗？

查了资料才知道，原来火山方舟的图片链接做了防盗链处理，而且还带了个 `X-Tos-Expires=86400` 参数——24小时后链接就失效了！

这下麻烦大了。不仅要解决 CORS 问题，还得想办法让图片永久可用。

## 第二回合：Vite 插件的奇思妙想

我不甘心，开始琢磨：既然浏览器有 CORS 限制，那我在 Node.js 环境里下载不就行了？

说干就干，我写了第一个版本的 Vite 插件：

```typescript
// vite-plugin-image-proxy.ts
export function imageProxyPlugin(): Plugin {
  return {
    name: 'vite-plugin-image-proxy',
    configureServer(server) {
      server.middlewares.use(async (req, res) => {
        const imageUrl = getUrlParam(req.url);
        // 在 Node.js 环境中下载，没有 CORS 限制！
        const response = await axios.get(imageUrl, { 
          responseType: 'arraybuffer' 
        });
        const base64 = Buffer.from(response.data).toString('base64');
        res.json({ base64 });
      });
    }
  };
}
```

嘿，你还别说，这一招还真管用！本地开发环境下，图片能正常下载转 Base64 了。

我得意地以为问题解决了，直到准备部署到 Vercel...

## 第三回合：生产环境的当头棒喝

Vercel 部署时我才意识到：`configureServer` 这个钩子只在开发环境生效，生产环境根本不认识它！

那一刻我真的想砸键盘。本地跑得好好的，为什么生产环境就不行？

冷静下来想想，其实道理很简单：Vercel 是 Serverless 架构，根本没有传统意义上的"服务器"概念。

## 第四回合：Serverless Function 的救赎

既然 Vercel 不给我用 `configureServer`，那我就用它原生支持的方式——Serverless Function。

在 `api/proxy/image.ts` 里写下：

```typescript
import type { VercelRequest, VercelResponse } from '@vercel/node';

export default async function handler(req: VercelRequest, res: VercelResponse) {
  const { url } = req.query;
  
  try {
    // 在 Vercel 的 Serverless 环境中下载图片
    const response = await axios.get(url as string, {
      responseType: 'arraybuffer',
      timeout: 10000
    });
    
    const base64 = Buffer.from(response.data).toString('base64');
    
    return res.status(200).json({
      success: true,
      data: { base64 }
    });
  } catch (error) {
    return res.status(500).json({
      success: false,
      error: (error as Error).message
    });
  }
}
```

部署上去一测试——成了！终于在生产环境也能愉快地下载图片了。

## 尾声：痛并快乐着的成长

回顾整个过程，从最初的天真想法，到 Vite 插件的巧妙 workaround，再到 Serverless Function 的正道直行，每一步都是一次学习和成长。

最大的收获是明白了：**开发不能只考虑 happy path，必须考虑各种环境差异和限制条件。**

现在每当有人问我怎么解决 CORS 问题时，我都会告诉他们这个故事——有时候解决问题的关键不是技术有多高深，而是思路要灵活，要懂得因地制宜。

毕竟，代码的世界里没有标准答案，只有最适合的解决方案 😊

---
*写于：与 CORS 斗智斗勇的那个下午*
*感悟：每个 bug 都是一堂课，每次解决都是一次成长*