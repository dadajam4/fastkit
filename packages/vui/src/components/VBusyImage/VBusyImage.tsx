import './VBusyImage.scss';

import {
  defineComponent,
  HTMLAttributes,
  ImgHTMLAttributes,
  PropType,
  computed,
  ref,
  watch,
  onMounted,
  onBeforeUnmount,
  CSSProperties,
} from 'vue';
import { IN_WINDOW, loadImage } from '@fastkit/helpers';
import { defineSlotsProps } from '@fastkit/vue-utils';

export declare type ImgHTMLAttributesPropOptions = {
  [K in keyof ImgHTMLAttributes]-?: PropType<ImgHTMLAttributes[K]>;
};

const IMAGE_ATTRS = [
  'alt',
  'crossorigin',
  'decoding',
  'sizes',
  'src',
  'srcset',
  'usemap',
] as const;

export function splitAttrs(attrs: ImgHTMLAttributes): {
  el: HTMLAttributes;
  img: ImgHTMLAttributes;
} {
  const el: HTMLAttributes = { ...attrs };
  const img: ImgHTMLAttributes = {};

  for (const ATTR of IMAGE_ATTRS) {
    const value = attrs[ATTR];
    if (value != null) {
      img[ATTR] = value as any;
    }
  }

  return {
    el,
    img,
  };
}

export type BusyImageLoadState = 'pending' | 'loading' | 'loaded' | 'error';

export type BusyImageSizeValue = number | string;

const NUMBERISH_PROP = [Number, String] as PropType<BusyImageSizeValue>;

const DEFAULT_HEIGHT = 150;

const resolveBusyImageSizeValue = (
  source?: BusyImageSizeValue,
): string | undefined => {
  if (source == null) return;
  return isNaN(source as number) ? String(source) : `${source}px`;
};

export interface BusyImageRect {
  width?: string;
  height?: string;
}

export interface BusyImageRects {
  placeholder: BusyImageRect;
  main: BusyImageRect;
}

/**
 * 画像表示用コンポーネント
 * <img /> タグのように振る舞うが、ローディング表示や、表示サイズの調整など、ちょっといい感じにやるためのコンポーネント
 */
export const VBusyImage = defineComponent({
  name: 'VBusyImage',
  props: {
    ...(undefined as unknown as ImgHTMLAttributesPropOptions),
    aspectRatio: String,
    width: NUMBERISH_PROP,
    height: NUMBERISH_PROP,
    cover: Boolean,
    ...defineSlotsProps<{
      default: void;
    }>(),
  },
  emits: {
    load: (ev: Event) => true,
    error: (ev: Event) => true,
  },
  setup(props, ctx) {
    const loadStateRef = ref<BusyImageLoadState>(
      props.cover && isAvailableSrc(ctx.attrs.src as any)
        ? 'loading'
        : 'pending',
    );
    const attrsRef = computed(() => splitAttrs(ctx.attrs));
    const isPendingRef = computed(() => loadStateRef.value === 'pending');
    const isLoadingRef = computed(() => loadStateRef.value === 'loading');
    const isLoadedRef = computed(() => loadStateRef.value === 'loaded');
    const isErrorRef = computed(() => loadStateRef.value === 'error');
    const classesRef = computed(() => [
      `v-busy-image--${loadStateRef.value}`,
      {
        'v-busy-image--cover': props.cover,
        'v-busy-image--clickable': typeof ctx.attrs.onClick === 'function',
      },
    ]);
    const nodeRef = ref<HTMLImageElement>();
    const coverImageRef = ref<HTMLImageElement>();
    const rectsRef = computed<BusyImageRects>(() => {
      const placeholder: BusyImageRect = {};
      const main: BusyImageRect = {};
      const { cover } = props;
      let { width, height } = props;

      if (height == null && cover) {
        height = DEFAULT_HEIGHT;
      }

      if (width == null && cover) {
        width = height;
      }

      width = resolveBusyImageSizeValue(width);
      height = resolveBusyImageSizeValue(height);

      main.width = width;
      main.height = height;

      placeholder.width = width;
      placeholder.height = height;

      if (placeholder.height == null) {
        placeholder.height = resolveBusyImageSizeValue(DEFAULT_HEIGHT);
      }

      if (placeholder.width == null) {
        placeholder.width = placeholder.height;
      }

      return {
        placeholder,
        main,
      };
    });

    const currentRectRef = computed<BusyImageRect>(() =>
      isLoadedRef.value ? rectsRef.value.main : rectsRef.value.placeholder,
    );

    const stylesRef = computed<CSSProperties>(() => {
      const { value: coverImage } = coverImageRef;
      const coverSrc = coverImage && coverImage.src;
      const styles: CSSProperties = {
        ...currentRectRef.value,
      };
      if (coverSrc) {
        styles.backgroundImage = `url(${coverSrc})`;
      }
      return styles;
    });

    let booted = false;

    watch(
      () => ctx.attrs.src as string | null | undefined,
      (value) => {
        coverImageRef.value = undefined;
        if (isAvailableSrc(value)) {
          loadStateRef.value = 'loading';
          if (props.cover) {
            loadImage(value)
              .then((image) => {
                coverImageRef.value = image;
                setManualState('load');
              })
              .catch((err) => {
                setManualState('error');
              });
          }
        } else {
          loadStateRef.value = 'pending';
        }
      },
      { immediate: IN_WINDOW },
    );

    const setManualState = (loadType: 'load' | 'error') => {
      loadStateRef.value = loadType === 'load' ? 'loaded' : 'error';

      const ev = new Event(loadType, {
        bubbles: false,
        cancelable: false,
        composed: false,
      });

      ctx.emit(loadType as any, ev);
    };

    onMounted(() => {
      if (booted || props.cover) return;

      const image = nodeRef.value;
      if (!image) return;

      const loadType = imageIsReady(image);

      if (loadType) {
        setManualState(loadType);
      }
    });

    onBeforeUnmount(() => {
      coverImageRef.value = undefined;
    });

    const handleLoad = (ev: Event) => {
      booted = true;
      loadStateRef.value = 'loaded';
      ctx.emit('load', ev);
    };

    const handleError = (ev: Event) => {
      booted = true;
      loadStateRef.value = 'error';
      ctx.emit('error', ev);
    };

    ctx.expose({
      state: loadStateRef,
      isPending: isPendingRef,
      isLoading: isLoadingRef,
      isLoaded: isLoadedRef,
      isError: isErrorRef,
    });

    return () => {
      const { el: elAttrs, img: imgAttrs } = attrsRef.value;
      const styles = stylesRef.value;
      const children = ctx.slots.default && ctx.slots.default();

      return (
        <span
          class={['v-busy-image', classesRef.value]}
          {...elAttrs}
          style={styles}>
          {!props.cover && (
            <img
              key="img"
              ref={nodeRef}
              class="v-busy-image__node"
              {...imgAttrs}
              onLoad={handleLoad}
              onError={handleError}
            />
          )}
          {!!children && <span class="v-busy-image__slot">{children}</span>}
        </span>
      );
    };
  },
});

function imageIsReady(image: HTMLImageElement): 'load' | 'error' | false {
  if (!image.complete) return false;
  return image.naturalWidth + image.naturalHeight > 0 ? 'load' : 'error';
}

function isAvailableSrc(src: string | null | undefined): src is string {
  return typeof src === 'string' && src !== '';
}
