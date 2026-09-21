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
      // Longer than the summary cap, so that a link to it has to be cut short.
      'export interface Big {',
      ...Array.from({ length: 30 }, (_, index) => `  member${index}: string;`),
      '}',
      'export interface Api {',
      '  /**',
      ...lines.map((line) => (line ? `   * ${line}` : '   *')),
      '   */',
      '  method(): void;',
      '  /** The other one. */',
      '  other(): void;',
      '  /** Points at {@link Api.other other}. */',
      '  nested(): void;',
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

/** The single link part of a one-line comment. */
function linkPartFor(line: string) {
  const part = partsFor([line]).find((candidate) => candidate.link);
  if (!part) {
    throw new Error(`no link part was extracted from: ${line}`);
  }
  return part;
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
    expect(linkPart?.link).toMatchObject({
      name: 'other',
      target: 'Api.other',
    });
  });
});

describe('link targets', () => {
  it('leaves `url` unset for a symbol reference', () => {
    // `url` promises somewhere a consumer can navigate to. A symbol reference
    // is not that, and handing one over as a url produced a dead anchor.
    const { link } = linkPartFor('See {@link Api.other other}.');

    expect(link?.url).toBeUndefined();
    expect(link?.target).toBe('Api.other');
  });

  it('still sets `url` for a real URL', () => {
    const { link } = linkPartFor('See {@link https://example.com/a Label}.');

    expect(link).toMatchObject({
      name: 'Label',
      url: 'https://example.com/a',
    });
    expect(link?.target).toBeUndefined();
  });

  it('falls back to the reference when the tag carries no label', () => {
    // `{@link Api}` has a name but no text, which used to leave `name` empty.
    const { link } = linkPartFor('See {@link Api}.');

    expect(link?.name).toBe('Api');
    expect(link?.target).toBe('Api');
  });
});

describe('link summaries', () => {
  it('previews the declaration a reference resolves to', () => {
    const { link } = linkPartFor('See {@link Api.other other}.');

    expect(link?.summary).toMatchObject({
      text: 'other(): void;',
      description: 'The other one.',
    });
    expect(link?.summary?.external).toBeUndefined();
  });

  it('collapses a nested link in the preview to its label', () => {
    // A preview is one level deep, so it has nowhere to hang a link of its
    // own -- and resolving one would recurse forever between two symbols that
    // reference each other.
    const { link } = linkPartFor('See {@link Api.nested nested}.');

    expect(link?.summary?.description).toBe('Points at other.');
  });

  it('caps a long declaration and says that it did', () => {
    const { link } = linkPartFor('See {@link Big}.');
    const summary = link?.summary;

    expect(summary?.truncated).toBe(true);
    expect(summary?.text.split('\n')).toHaveLength(20);
  });

  it('marks a declaration that lives outside the project', () => {
    const { link } = linkPartFor('See {@link Promise}.');

    expect(link?.summary?.external).toBe(true);
  });

  it('leaves the summary off when the reference does not resolve', () => {
    const { link } = linkPartFor('See {@link Nope.gone x}.');

    expect(link?.target).toBe('Nope.gone');
    expect(link?.summary).toBeUndefined();
  });
});
