import type { WrittenResponse } from '@fastkit/vue-page';
import type { ServerResponse } from 'node:http';
import type { IncomingMessage } from 'connect';

export type {
  WrittenResponse,
  WriteResponseFn,
  RedirectFn,
} from '@fastkit/vue-page';

export interface Rendered extends WrittenResponse {
  html: string;
  htmlAttrs: string;
  headTags: string;
  body: string;
  bodyAttrs: string;
  initialState: any;
  dependencies: string[];
}

export interface RendererOptions {
  /* Client manifest. Required for preloading. */
  manifest?: Record<string, string[]>;
  /* Add prelaod link tags for JS and CSS assets */
  preload?: boolean;
  /* Override index.html template */
  template?: string;
  /* Skip SSR and only return the default index.html */
  skip?: boolean;
  // [key: string]: any;
  request?: IncomingMessage;
  response?: ServerResponse;
  initialState?: any;
}

export interface Renderer {
  (url: string | URL, options?: RendererOptions): Promise<
    Rendered | WrittenResponse
  >;
}

export interface SSRPageDescriptor {
  headTags?: string;
  htmlAttrs?: string;
  bodyAttrs?: string;
  body?: string;
}
