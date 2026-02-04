export type Platform = 'zhihu' | 'wechat' | 'xiaohongshu' | 'feishu';

export interface PlatformConfig {
  id: Platform;
  name: string;
  icon: string;
  color: string;
  description: string;
}
