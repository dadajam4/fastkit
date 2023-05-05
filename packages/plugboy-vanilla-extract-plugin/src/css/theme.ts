import { Tokens, ThemeVars, Contract, MapLeafNodes } from './types';
import { createThemeContract, globalStyle } from '@vanilla-extract/css';
import { assignVars } from './utils';

export function createGlobalTheme<ThemeTokens extends Tokens>(
  layerName: string,
  selector: string,
  tokens: ThemeTokens,
): ThemeVars<ThemeTokens>;
export function createGlobalTheme<ThemeContract extends Contract>(
  layerName: string,
  selector: string,
  themeContract: ThemeContract,
  tokens: MapLeafNodes<ThemeContract, string>,
): void;
export function createGlobalTheme(
  layerName: string,
  selector: string,
  arg2: any,
  arg3?: any,
): any {
  const shouldCreateVars = Boolean(!arg3);

  const themeVars = shouldCreateVars
    ? createThemeContract(arg2)
    : (arg2 as ThemeVars<any>);

  const tokens = shouldCreateVars ? arg2 : arg3;

  globalStyle(selector, {
    '@layer': {
      [layerName]: {
        vars: assignVars(themeVars, tokens),
      },
    },
  });

  // appendCss(
  //   {
  //     type: 'global',
  //     selector: selector,
  //     rule: { vars: assignVars(themeVars, tokens) },
  //   },
  //   getFileScope(),
  // );

  if (shouldCreateVars) {
    return themeVars;
  }
}
