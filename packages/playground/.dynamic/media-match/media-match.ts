// @ts-nocheck
/* eslint-disable */
/**
 * This is auto generated file.
 * Do not edit !!!
 *
 * @see: https://github.com/dadajam4/fastkit/tree/main/packages/media-match
 */

export type MediaMatchKey = 'xs' | 'smAndDown' | 'narrow' | 'smAndUp' | 'sm' | 'mdAndDown' | 'mdAndUp' | 'wide' | 'md' | 'lg' | 'xxs';

export interface MediaMatch {
  key: MediaMatchKey;
  condition: string;
  description: string;
}

export const mediaMatches: MediaMatch[] = [
  {
    "key": "xs",
    "condition": "all and (max-width:575px)",
    "description": "Phone (Narrow)"
  },
  {
    "key": "smAndDown",
    "condition": "all and (max-width:767px)",
    "description": "<= 767px"
  },
  {
    "key": "narrow",
    "condition": "all and (max-width:767px)",
    "description": "Alias for 'smAndDown'"
  },
  {
    "key": "smAndUp",
    "condition": "all and (min-width:576px)",
    "description": ">= 576px"
  },
  {
    "key": "sm",
    "condition": "all and (min-width:576px) and (max-width:767px)",
    "description": "Phone"
  },
  {
    "key": "mdAndDown",
    "condition": "all and (max-width:1023px)",
    "description": "<= 1023px"
  },
  {
    "key": "mdAndUp",
    "condition": "all and (min-width:768px)",
    "description": ">= 768px"
  },
  {
    "key": "wide",
    "condition": "all and (min-width:768px)",
    "description": "Alias for 'mdAndUp'"
  },
  {
    "key": "md",
    "condition": "all and (min-width:768px) and (max-width:1023px)",
    "description": "Console or Tablet"
  },
  {
    "key": "lg",
    "condition": "all and (min-width:1024px)",
    "description": "Console (Wide)"
  },
  {
    "key": "xxs",
    "condition": "(max-width:320px)",
    "description": "Very narrow device"
  }
];