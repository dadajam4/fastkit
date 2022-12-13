import type { RouteRecordName } from 'vue-router';

export interface ExtractedPage {
  name: string;
  path: string;
  props?: boolean;
  children?: ExtractedPage[];
  // customBlock?: PagesCustomBlock;
  // rawRoute: string;
}

export interface VotExtractedPage {
  name?: RouteRecordName;
  path: string;
  dynamicParams?: string[];
}
