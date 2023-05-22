import { ComponentPublicInstance } from 'vue';
import { ComponentMeta } from '../types';
import { AnyControllable } from './types';

type BuiltinProps = keyof ComponentPublicInstance;

type AnyComponent = {
  new (...args: any[]): any;
};

type ExtractProperty<Component extends AnyComponent> = Exclude<
  keyof InstanceType<Component>,
  BuiltinProps
>;

export type ArgTypes<Component extends AnyComponent = AnyComponent> = Partial<
  Record<ExtractProperty<Component>, AnyControllable>
>;

function safeObject(obj: any): any {
  if (!obj || typeof obj !== 'object') {
    obj = {};
  }
  return obj;
}

function extractComponentMeta(
  Component: AnyComponent,
): Pick<ComponentMeta, 'props' | 'events' | 'slots'> {
  const { __docgenInfo } = Component as any;
  safeObject(__docgenInfo);
  safeObject(__docgenInfo.props);
  safeObject(__docgenInfo.events);
  safeObject(__docgenInfo.slots);
  return __docgenInfo;
}

/**
 * Generates recommended settings for a given component
 * @param Component - Component
 * @returns Recommended setting
 */
export function generateArgTypes<Component extends AnyComponent>(
  Component: Component,
): ArgTypes<Component> {
  const { props } = extractComponentMeta(Component);
  const argTypes: ArgTypes = {};
  props.forEach(({ name, type, values }) => {
    if (values && values.length) {
      argTypes[name] = {
        control: 'select',
        options: values,
      };
    } else if (type.name === 'string') {
      argTypes[name] = {
        control: 'text',
      };
    } else if (type.name === 'boolean') {
      argTypes[name] = {
        control: 'boolean',
      };
    } else if (type.name === 'number') {
      argTypes[name] = {
        control: {
          type: 'number',
        },
      };
    } else if (type.name === 'Date') {
      argTypes[name] = {
        control: 'date',
      };
    }
  });
  return argTypes;
}

/**
 * Generates recommended settings for a given component
 * @param Component - Component
 * @returns Recommended setting
 */
export function defineArgTypes<Component extends AnyComponent>(
  Component: Component,
): ArgTypes<Component>;

/**
 * Generates recommended settings for a given component
 * @param Component - Component
 * @param argTypes - Settings you want to override, if any
 * @returns Recommended setting
 */
export function defineArgTypes<Component extends AnyComponent>(
  Component: Component,
  overrides: ArgTypes<Component>,
): ArgTypes<Component>;

export function defineArgTypes<Component extends AnyComponent>(
  Component: Component,
  overrides?: ArgTypes<Component>,
): ArgTypes<Component> {
  const argTypes = generateArgTypes(Component);
  if (overrides) {
    Object.assign(argTypes, overrides);
  }

  return argTypes;
}
