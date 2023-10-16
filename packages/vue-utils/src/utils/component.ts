import {
  DefineComponent,
  VNodeChild,
  PropType,
  ComponentCustomOptions,
  ref,
  h,
} from 'vue';
import type { defineSlots } from './slots';

export type ExtractComponentPropTypes<
  C extends {
    setup?: DefineComponent<any>['setup'];
  },
> = Parameters<NonNullable<C['setup']>>[0];

interface RawSlotsSettings {
  [key: string]: any;
}

type ResolveRawSlots<R extends RawSlotsSettings> = {
  [K in keyof R]?: (prop: R[K]) => VNodeChild;
};

/**
 * Define properties for slots for tsx support
 *
 * @deprecated This functionality has been moved to {@link defineSlots} with Vue 3.3 slots type support. It may be removed in the next minor version.
 */
export function defineSlotsProps<R extends RawSlotsSettings>() {
  return undefined as unknown as {
    'v-slots': PropType<ResolveRawSlots<R>>;
  };
}

export function isComponentCustomOptions(
  Component: unknown,
): Component is ComponentCustomOptions {
  return (
    (!!Component && typeof Component === 'object') ||
    typeof Component === 'function'
  );
}

type AnyComponentConstructor = { new (): any };

export type ComponentInstanceType<
  ComponentConstructor extends AnyComponentConstructor,
> = InstanceType<ComponentConstructor>;

/**
 * API for referenceable component constructors
 */
export type ReferencedComponentAPI<
  ComponentConstructor extends AnyComponentConstructor,
> = {
  /** component instance */
  get instance(): ComponentInstanceType<ComponentConstructor> | undefined;

  /**
   * Ensure component instances are retrieved
   *
   * @throws Throws an exception if the instance is not retained
   */
  ensureInstance(): ComponentInstanceType<ComponentConstructor>;
};

/**
 * Component constructor with reference
 *
 * @see {@link ReferencedComponentAPI}
 */
export type ReferencedComponent<
  ComponentConstructor extends AnyComponentConstructor,
> = ComponentConstructor & ReferencedComponentAPI<ComponentConstructor>;

/**
 * Creating a referenceable component constructor
 * @param Ctor - component constructor
 * @returns Component constructor with reference
 *
 * @see {@link ReferencedComponent}
 */
export function componentRef<
  ComponentConstructor extends AnyComponentConstructor,
>(Ctor: ComponentConstructor): ReferencedComponent<ComponentConstructor> {
  const _ref = ref<ComponentInstanceType<ComponentConstructor>>();
  const _ReferencedComponent: ReferencedComponent<ComponentConstructor> = ((
    props: any,
    ctx: any,
  ) => {
    return h(
      Ctor,
      {
        ...props,
        ref: (source: any) => {
          _ref.value = source;
        },
      },
      ctx.slots,
    );
  }) as any;

  Object.defineProperty(_ReferencedComponent, 'instance', {
    get: () => _ref.value,
    enumerable: true,
  });

  _ReferencedComponent.ensureInstance = () => {
    const instance = _ref.value;
    if (!instance) {
      const name = Ctor.name ? `(${Ctor.name})` : '';
      throw new Error(
        `The component instance${name} was not found. The ref may not be properly set within the render hook.`,
      );
    }
    return instance;
  };

  return _ReferencedComponent;
}

/** Extend the component's public IF with a specified type argument */
export type ExposedComponent<
  Exposed extends Record<string, any>,
  ComponentConstructor extends AnyComponentConstructor,
> = ComponentConstructor & {
  new (): Exposed;
};

/**
 * Utility API to supplement type information for components
 */
export type TypedComponentAPI<
  ComponentConstructor extends AnyComponentConstructor,
> = {
  /**
   * Get a new constructor that extends the component's public IF type
   *
   * This is a support method for the inability to infer `expose()` in a jsx expression.
   */
  $expose<Exposed extends Record<string, any>>(): TypedComponent<
    ExposedComponent<Exposed, ComponentConstructor>
  >;
  /**
   * Creating a referenceable component constructor
   * @returns Component constructor with reference
   *
   * @see {@link componentRef}
   * @see {@link ReferencedComponent}
   */
  $ref(): ReferencedComponent<ComponentConstructor>;
};

/**
 * Constructor with component type information extension API already set up
 *
 * @see {@link TypedComponentAPI}
 */
export type TypedComponent<
  ComponentConstructor extends AnyComponentConstructor,
> = ComponentConstructor & TypedComponentAPI<ComponentConstructor>;

/**
 * Set up a utility API for type information extension in the component constructor
 *
 * @param Ctor - Component constructor
 * @returns Constructor with utility API already set up
 */
export function defineTypedComponent<
  ComponentConstructor extends AnyComponentConstructor,
>(Ctor: ComponentConstructor) {
  const api: TypedComponentAPI<ComponentConstructor> = {
    $expose: () => _TypedComponent,
    $ref: () => componentRef(Ctor),
  };

  const _TypedComponent = new Proxy(
    Ctor as TypedComponent<ComponentConstructor>,
    {
      get(target, propertyKey, receiver) {
        const apiProp = (api as any)[propertyKey];
        if (apiProp) return apiProp;
        return Reflect.get(target, propertyKey, receiver);
      },
    },
  );

  return _TypedComponent;
}
