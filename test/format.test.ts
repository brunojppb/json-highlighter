import { describe, expect, it } from 'vitest';
import { format, highlight, tokenize } from '../src/format';

const text = (tokens: { text: string }[]): string => tokens.map((t) => t.text).join('');

describe('tokenize', () => {
  it('marks strings before a colon as keys', () => {
    expect(tokenize('{"a":"b"}')).toEqual([
      { kind: 'punct', text: '{' },
      { kind: 'key', text: '"a"' },
      { kind: 'punct', text: ':' },
      { kind: 'string', text: '"b"' },
      { kind: 'punct', text: '}' },
    ]);
  });

  it('classifies literals and numbers', () => {
    const kinds = tokenize('[true, false, null, -1.5e3]')
      .filter((t) => t.kind !== 'punct')
      .map((t) => t.kind);
    expect(kinds).toEqual(['boolean', 'boolean', 'null', 'number']);
  });

  it('keeps escaped quotes inside strings', () => {
    expect(tokenize('"a\\"b"')).toEqual([{ kind: 'string', text: '"a\\"b"' }]);
  });

  it('throws on unknown characters', () => {
    expect(() => tokenize('{x}')).toThrow(SyntaxError);
  });
});

describe('format', () => {
  it('matches JSON.stringify indentation', () => {
    const value = { a: [1, 2, { b: null }], c: {}, d: [], e: 'x, y: z' };
    const source = JSON.stringify(value);
    expect(text(format(tokenize(source)))).toBe(JSON.stringify(value, null, 2));
  });

  it('keeps large numbers exactly as written', () => {
    expect(text(highlight('[12345678901234567890]'))).toBe('[\n  12345678901234567890\n]');
  });
});

describe('highlight', () => {
  it('rejects invalid JSON', () => {
    expect(() => highlight('{"a":1,}')).toThrow();
  });
});
