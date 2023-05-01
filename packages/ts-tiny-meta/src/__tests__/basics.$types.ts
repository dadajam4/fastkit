import { extractMeta } from '@fastkit/ts-tiny-meta';

import {
  CONST_STR,
  CONST_STR_ALIAS,
  STR_TYPE,
  TEMPLATE_STR,
  CONST_TEMPLATE_STR,
  NUM,
  SYMBOL,
  SYMBOL_TYPE,
  CONST_DATE,
  DATE_TYPE,
  ARRAY,
  CONST_ARRAY,
  CONST_ARRAY_ITEM,
  ARRAY_TYPE,
  CONST_ARRAY_TYPE,
  CONST_ARRAY_TYPE_ITEM,
  OBJECT_ARRAY_TYPE,
  INLINE_UNION_TYPE,
  ALIAS_UNION_TYPE,
  OBJECT_TYPE,
  CLASS,
  OBJECT,
  FUNCTION,
  CALL_EXPRESSION,
  ARROW_FUNCTION,
  ARROW_FUNCTION_TYPE,
  INTERFACE,
  HAS_CALL_SIGUNATURE_INTERFACE,
  HAS_NEW_SIGUNATURE_INTERFACE,
  HAS_SIGUNATURE_INTERFACE,
  INTERFACE_KEYOF,
  INTERFACE_QUERY,
  RECORD_TYPE,
  INTERSECTION_TYPE,
  PROMISE_TYPE,
  GENERIC_FUNCTION,
} from './basics';

// import { VButton } from './components/VButton';
// import { VuiService } from './service';

export const _CONST_STR = extractMeta(CONST_STR);
export const _CONST_STR_ALIAS = extractMeta<CONST_STR_ALIAS>();
export const _STR_TYPE = extractMeta<STR_TYPE>();
export const _TEMPLATE_STR = extractMeta(TEMPLATE_STR);
export const _CONST_TEMPLATE_STR = extractMeta(CONST_TEMPLATE_STR);
export const _NUM = extractMeta(NUM);
export const _SYMBOL = extractMeta(SYMBOL);
export const _SYMBOL_TYPE = extractMeta<SYMBOL_TYPE>();
export const _CONST_DATE = extractMeta(CONST_DATE);
export const _DATE_TYPE = extractMeta<DATE_TYPE>();
export const _ARRAY = extractMeta(ARRAY);
export const _CONST_ARRAY = extractMeta(CONST_ARRAY);
export const _CONST_ARRAY_ITEM = extractMeta<CONST_ARRAY_ITEM>();
export const _ARRAY_TYPE = extractMeta<ARRAY_TYPE>();
export const _CONST_ARRAY_TYPE = extractMeta<CONST_ARRAY_TYPE>();
export const _CONST_ARRAY_TYPE_ITEM = extractMeta<CONST_ARRAY_TYPE_ITEM>();
export const _OBJECT_ARRAY_TYPE = extractMeta<OBJECT_ARRAY_TYPE>();
export const _INLINE_UNION_TYPE = extractMeta<INLINE_UNION_TYPE>();
export const _ALIAS_UNION_TYPE = extractMeta<ALIAS_UNION_TYPE>();
export const _OBJECT_TYPE = extractMeta<OBJECT_TYPE>();
export const _CLASS = extractMeta(CLASS);
export const _OBJECT = extractMeta(OBJECT);
export const _FUNCTION = extractMeta(FUNCTION);
export const _CALL_EXPRESSION = extractMeta(CALL_EXPRESSION);
export const _ARROW_FUNCTION = extractMeta(ARROW_FUNCTION);
export const _ARROW_FUNCTION_TYPE = extractMeta<ARROW_FUNCTION_TYPE>();
export const _INTERFACE = extractMeta<INTERFACE>();
export const _HAS_CALL_SIGUNATURE_INTERFACE =
  extractMeta<HAS_CALL_SIGUNATURE_INTERFACE>();
export const _HAS_NEW_SIGUNATURE_INTERFACE =
  extractMeta<HAS_NEW_SIGUNATURE_INTERFACE>();
export const _HAS_SIGUNATURE_INTERFACE =
  extractMeta<HAS_SIGUNATURE_INTERFACE>();
export const _INTERFACE_KEYOF = extractMeta<INTERFACE_KEYOF>();
export const _INTERFACE_QUERY = extractMeta<INTERFACE_QUERY>();
export const _RECORD_TYPE = extractMeta<RECORD_TYPE>();
export const _INTERSECTION_TYPE = extractMeta<INTERSECTION_TYPE>();
export const _PROMISE_TYPE = extractMeta<PROMISE_TYPE>();
export const _GENERIC_FUNCTION = extractMeta(GENERIC_FUNCTION);
// export const _VButton = extractMeta(VButton);
// export const _VuiService = extractMeta(VuiService);
