import { describe, it, expect } from 'vitest';
import { Project } from 'ts-morph';
import { extractMetaDocPartsFromJSDocComment } from '../doc';

/**
 * Build one interface method with the given doc comment body and read its
 * parts back.
 *
 * The method is nested inside an interface on purpose: that indents the
 * comment to `   * `, which is where the source span and the stripped text
 * differ most visibly.
 */
function partsFor(lines: string[]) {
  const project = new Project({ useInMemoryFileSystem: true });
  const file = project.createSourceFile(
    'probe.ts',
    [
      'export interface Api {',
      '  /**',
      ...lines.map((line) => (line ? `   * ${line}` : '   *')),
      '   */',
      '  method(): void;',
      '  other(): void;',
      '}',
    ].join('\n'),
  );
  return extractMetaDocPartsFromJSDocComment(
    file
      .getInterfaceOrThrow('Api')
      .getMethodOrThrow('method')
      .getJsDocs()[0]
      .getComment(),
  );
}

const BODY = ['Opening line.', '', '```ts', 'const a = 1;', '```'];

describe('extractMetaDocPartsFromJSDocComment', () => {
  it('strips the comment syntax when there is no link', () => {
    expect(partsFor(BODY).map((part) => part.text)).toEqual([
      'Opening line.\n\n```ts\nconst a = 1;\n```',
    ]);
  });

  it('strips it just the same when the comment contains a link', () => {
    // A comment with a link comes back from ts-morph as nodes rather than as
    // an already-stripped string. Reading the source span instead of the
    // node's own text used to leak `/**` and every ` * ` prefix into the
    // documentation -- which markdown then read as bullets, shattering any
    // fenced block inside it.
    const parts = partsFor([
      '{@link Api.other other}, and then some',
      ...BODY.slice(1),
    ]);

    expect(parts.map((part) => part.text)).toEqual([
      '',
      '{@link Api.other other}',
      ', and then some\n\n```ts\nconst a = 1;\n```',
    ]);
  });

  it('never lets comment syntax through, link or not', () => {
    const withLink = partsFor([
      '{@link Api.other other} opens it',
      ...BODY.slice(1),
    ]);
    const withoutLink = partsFor(['Plain opens it', ...BODY.slice(1)]);

    for (const parts of [withLink, withoutLink]) {
      for (const { text, link } of parts) {
        if (link) continue;
        expect(text).not.toMatch(/\/\*\*/);
        expect(text).not.toMatch(/^\s*\*\s/m);
      }
    }
  });

  it('keeps the link readable in the flattened text and structured beside it', () => {
    const parts = partsFor(['See {@link Api.other other}.']);
    const linkPart = parts.find((part) => part.link);

    expect(linkPart?.text).toBe('{@link Api.other other}');
    expect(linkPart?.link).toMatchObject({ name: 'other', url: 'Api.other' });
  });
});
