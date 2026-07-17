declare global {
  /**
   * Whether the code is running in a development context.
   *
   * @remarks
   * - `stub`: always `true`.
   * - published `build`: replaced with a runtime check of the consumer's
   *   environment (`process.env.NODE_ENV === 'development'` or
   *   `import.meta.env.DEV === true`), so the branch is evaluated at the
   *   consumer's runtime rather than eliminated.
   */
  const __PLUGBOY_DEV__: boolean;

  /**
   * The bundle is in stub mode.
   *
   * @remarks In stub mode, source code is executed in the source directory. This flag is available because of the different way of loading files in relative paths.
   */
  const __PLUGBOY_STUB__: boolean;
}

// The declarations below mirror the subset of Vite's `vite/client` module
// declarations that Plugboy is compatible with, so that source that already
// targets Vite type-checks the same way under Plugboy. Only imports Plugboy
// actually handles are declared here:
// - CSS is processed via `@tsdown/css` (side-effect imports and CSS Modules).
// - Static assets resolve to a `string` default export (rolldown default).
// - `?raw` resolves to the file contents as a `string` (Plugboy's raw loader).
//
// Vite-only features without a Plugboy loader are intentionally omitted so the
// types never imply support that does not exist: `?url` / `?inline`,
// `?worker` / `?sharedworker`, `*.wasm?init`, `vite/modulepreload-polyfill`,
// and the `vite:preloadError` event. Use `__PLUGBOY_DEV__` instead of
// `import.meta.env`, which Plugboy does not type on the source side.

// CSS modules
type CSSModuleClasses = { readonly [key: string]: string };

declare module '*.module.css' {
  const classes: CSSModuleClasses;
  export default classes;
}
declare module '*.module.scss' {
  const classes: CSSModuleClasses;
  export default classes;
}
declare module '*.module.sass' {
  const classes: CSSModuleClasses;
  export default classes;
}
declare module '*.module.less' {
  const classes: CSSModuleClasses;
  export default classes;
}
declare module '*.module.styl' {
  const classes: CSSModuleClasses;
  export default classes;
}
declare module '*.module.stylus' {
  const classes: CSSModuleClasses;
  export default classes;
}
declare module '*.module.pcss' {
  const classes: CSSModuleClasses;
  export default classes;
}
declare module '*.module.sss' {
  const classes: CSSModuleClasses;
  export default classes;
}

// CSS
declare module '*.css' {}
declare module '*.scss' {}
declare module '*.sass' {}
declare module '*.less' {}
declare module '*.styl' {}
declare module '*.stylus' {}
declare module '*.pcss' {}
declare module '*.sss' {}

// Built-in asset types
// see `src/node/constants.ts`

// images
declare module '*.apng' {
  const src: string;
  export default src;
}
declare module '*.bmp' {
  const src: string;
  export default src;
}
declare module '*.png' {
  const src: string;
  export default src;
}
declare module '*.jpg' {
  const src: string;
  export default src;
}
declare module '*.jpeg' {
  const src: string;
  export default src;
}
declare module '*.jfif' {
  const src: string;
  export default src;
}
declare module '*.pjpeg' {
  const src: string;
  export default src;
}
declare module '*.pjp' {
  const src: string;
  export default src;
}
declare module '*.gif' {
  const src: string;
  export default src;
}
declare module '*.svg' {
  const src: string;
  export default src;
}
declare module '*.ico' {
  const src: string;
  export default src;
}
declare module '*.webp' {
  const src: string;
  export default src;
}
declare module '*.avif' {
  const src: string;
  export default src;
}
declare module '*.cur' {
  const src: string;
  export default src;
}
declare module '*.jxl' {
  const src: string;
  export default src;
}

// media
declare module '*.mp4' {
  const src: string;
  export default src;
}
declare module '*.webm' {
  const src: string;
  export default src;
}
declare module '*.ogg' {
  const src: string;
  export default src;
}
declare module '*.mp3' {
  const src: string;
  export default src;
}
declare module '*.wav' {
  const src: string;
  export default src;
}
declare module '*.flac' {
  const src: string;
  export default src;
}
declare module '*.aac' {
  const src: string;
  export default src;
}
declare module '*.opus' {
  const src: string;
  export default src;
}
declare module '*.mov' {
  const src: string;
  export default src;
}
declare module '*.m4a' {
  const src: string;
  export default src;
}
declare module '*.vtt' {
  const src: string;
  export default src;
}

// fonts
declare module '*.woff' {
  const src: string;
  export default src;
}
declare module '*.woff2' {
  const src: string;
  export default src;
}
declare module '*.eot' {
  const src: string;
  export default src;
}
declare module '*.ttf' {
  const src: string;
  export default src;
}
declare module '*.otf' {
  const src: string;
  export default src;
}

// other
declare module '*.webmanifest' {
  const src: string;
  export default src;
}
declare module '*.pdf' {
  const src: string;
  export default src;
}
declare module '*.txt' {
  const src: string;
  export default src;
}

// `?raw` — file contents as a string (Plugboy raw loader)
declare module '*?raw' {
  const src: string;
  export default src;
}

export {};
