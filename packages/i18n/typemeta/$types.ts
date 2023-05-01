import { extractMeta } from '@fastkit/ts-tiny-meta';

import { I18nComponentStatic, I18nComponent } from '../src';

export const ComponentStaticMeta = extractMeta<I18nComponentStatic>();

export const ComponentMeta = extractMeta<I18nComponent>();
