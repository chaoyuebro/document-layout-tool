/**
 * Vite 后端代理插件
 * 用于在开发环境中代理图片下载请求，绕过CORS限制
 */
import type { Plugin } from 'vite';
export declare function imageProxyPlugin(): Plugin;
export default imageProxyPlugin;
