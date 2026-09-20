import type { WrittenResponse, PageResponseDraft } from '@fastkit/vue-page';
import type { VotRuntimeContext } from './adapter';

export type {
  WrittenResponse,
  WriteResponseFn,
  RedirectFn,
  PageResponseDraft,
  VuePageServerContext,
} from '@fastkit/vue-page';

/**
 * A completed render.
 *
 * Built on {@link PageResponseDraft} rather than {@link WrittenResponse}: its
 * `headers` is a `Headers`, so a multi-value header survives the trip out of
 * the renderer. `Set-Cookie` is the one that matters -- collapsing it into a
 * `Record<string, string>` here is what used to force cookies to be written
 * straight to the Node response instead.
 */
export interface Rendered extends PageResponseDraft {
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
  /** The incoming request, as a web-standard `Request`. */
  request?: Request;
  /** The response being assembled for this render. */
  response?: PageResponseDraft;
  /** A handle on the transport the request arrived over. */
  runtime?: VotRuntimeContext;
  initialState?: any;
}

export interface Renderer {
  (
    url: string | URL,
    options?: RendererOptions,
  ): Promise<Rendered | PageResponseDraft>;
}

export interface SSRPageDescriptor {
  headTags?: string;
  htmlAttrs?: string;
  bodyAttrs?: string;
  body?: string;
}
