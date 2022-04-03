export interface ExtractedPage {
  name: string;
  path: string;
  props?: boolean;
  children?: ExtractedPage[];
  // customBlock?: PagesCustomBlock;
  // rawRoute: string;
}

export interface VotExtractedPage extends ExtractedPage {
  fullPath: string;
  dynamicParams?: string[];
  children?: VotExtractedPage[];
}
