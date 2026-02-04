/**
 * Vite 后端代理插件
 * 用于在开发环境中代理图片下载请求，绕过CORS限制
 */
import type { Plugin } from 'vite';
import axios from 'axios';

export function imageProxyPlugin(): Plugin {
  return {
    name: 'vite-plugin-image-proxy',
    configureServer(server) {
      server.middlewares.use(async (req, res, next) => {
        // 只处理 /api/proxy/image 请求
        if (!req.url?.startsWith('/api/proxy/image')) {
          return next();
        }

        try {
          // 解析查询参数
          const url = new URL(req.url, `http://${req.headers.host}`);
          const imageUrl = url.searchParams.get('url');

          if (!imageUrl) {
            res.statusCode = 400;
            res.end(JSON.stringify({ error: '缺少图片URL参数' }));
            return;
          }

          console.log('🔄 [后端代理] 开始下载图片:', imageUrl);

          // 使用Node.js环境的axios下载图片（无CORS限制）
          const response = await axios.get(imageUrl, {
            responseType: 'arraybuffer',
            timeout: 30000,
            headers: {
              'User-Agent': 'Mozilla/5.0 (compatible; AI-Studio/1.0)'
            }
          });

          // 获取MIME类型
          const contentType = response.headers['content-type'] || 'image/jpeg';
          const mimeType = contentType.split(';')[0];

          // 转换为Base64
          const base64 = Buffer.from(response.data).toString('base64');

          console.log(`✅ [后端代理] 图片下载成功: ${base64.length} 字符, ${mimeType}`);

          // 返回JSON响应
          res.setHeader('Content-Type', 'application/json');
          res.setHeader('Access-Control-Allow-Origin', '*');
          res.statusCode = 200;
          res.end(JSON.stringify({
            success: true,
            data: {
              base64,
              mimeType,
              size: Buffer.from(response.data).length,
              originalUrl: imageUrl
            }
          }));

        } catch (error) {
          console.error('❌ [后端代理] 图片下载失败:', error);
          res.statusCode = 500;
          res.end(JSON.stringify({
            success: false,
            error: (error as Error).message
          }));
        }
      });
    }
  };
}

export default imageProxyPlugin;
