import { isString } from '@fastkit/helpers';

const PARSE_RE =
  /((([a-zA-Z]+(-[a-zA-Z0-9]+){0,2})|\*)(;q=[0-1](\.[0-9]+)?)?)*/g;

export interface LanguageBase {
  code: string;
  script: string | null;
  region: string;
}

export interface ParsedLanguage extends LanguageBase {
  quality: number;
}

const isNotNullable = <T>(value: T | null | undefined): value is T => !!value;

export function parse(
  acceptLanguage: string | null | undefined,
): ParsedLanguage[] {
  const strings = (acceptLanguage || '').match(PARSE_RE);
  if (!strings) return [];
  return strings
    .map(function (m) {
      if (!m) {
        return;
      }

      const bits = m.split(';');
      const ietf = bits[0].split('-');
      const hasScript = ietf.length === 3;

      return {
        code: ietf[0],
        script: hasScript ? ietf[1] : null,
        region: hasScript ? ietf[2] : ietf[1],
        quality: bits[1] ? parseFloat(bits[1].split('=')[1]) : 1.0,
      };
    })
    .filter<ParsedLanguage>(isNotNullable)
    .sort(function (a, b) {
      return b.quality - a.quality;
    });
}

export interface PickOptions {
  loose?: boolean;
}

export function pick(
  supportedLanguages: string[] | readonly string[],
  acceptLanguages: string | undefined | null | ParsedLanguage[],
  options: PickOptions = {},
): string | null {
  if (!supportedLanguages || !supportedLanguages.length || !acceptLanguages) {
    return null;
  }

  if (isString(acceptLanguages)) {
    acceptLanguages = parse(acceptLanguages);
  }

  const supporteds = supportedLanguages.map<
    LanguageBase & { original: string }
  >((support) => {
    const bits = support.split('-');
    const hasScript = bits.length === 3;

    return {
      code: bits[0],
      script: hasScript ? bits[1] : null,
      region: hasScript ? bits[2] : bits[1],
      original: support,
    };
  });

  for (const lang of acceptLanguages) {
    const langCode = lang.code.toLowerCase();
    const langRegion = lang.region ? lang.region.toLowerCase() : lang.region;
    const langScript = lang.script ? lang.script.toLowerCase() : lang.script;

    for (const supported of supporteds) {
      const supportedCode = supported.code.toLowerCase();
      const supportedScript = supported.script
        ? supported.script.toLowerCase()
        : supported.script;
      const supportedRegion = supported.region
        ? supported.region.toLowerCase()
        : supported.region;
      if (
        langCode === supportedCode &&
        (options.loose || !langScript || langScript === supportedScript) &&
        (options.loose || !langRegion || langRegion === supportedRegion)
      ) {
        return supported.original;
      }
    }
  }

  return null;
}
