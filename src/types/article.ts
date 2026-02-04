import { Platform } from './platform';
import { Diagram } from './diagram';

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
