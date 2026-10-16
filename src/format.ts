export type TokenKind = 'key' | 'string' | 'number' | 'boolean' | 'null' | 'punct' | 'space';

export interface Token {
  readonly kind: TokenKind;
  readonly text: string;
}

// Sticky flag: each match must start where the last one ended, so unknown input fails fast.
const TOKEN_RE = /"(?:[^"\\]|\\.)*"|-?\d+(?:\.\d+)?(?:[eE][+-]?\d+)?|true|false|null|[{}[\],:]|\s+/y;

const kindOf = (text: string): TokenKind => {
  if (text.startsWith('"')) return 'string';
  if (text === 'true' || text === 'false') return 'boolean';
  if (text === 'null') return 'null';
  if (/^[{}[\],:]$/.test(text)) return 'punct';
  return 'number';
};

/** Splits JSON text into tokens, without whitespace. Throws on invalid input. */
export const tokenize = (source: string): Token[] => {
  const raw: Token[] = [];
  const re = new RegExp(TOKEN_RE);
  while (re.lastIndex < source.length) {
    const start = re.lastIndex;
    const match = re.exec(source);
    if (!match) throw new SyntaxError(`Unexpected character at position ${start}`);
    const text = match[0];
    if (!/^\s+$/.test(text)) raw.push({ kind: kindOf(text), text });
  }
  // A string directly before a colon is an object key.
  return raw.map((t, i) =>
    t.kind === 'string' && raw[i + 1]?.text === ':' ? { kind: 'key', text: t.text } : t,
  );
};

const isOpen = (t?: Token): boolean => t?.text === '{' || t?.text === '[';
const isClose = (t?: Token): boolean => t?.text === '}' || t?.text === ']';

/** Adds indentation and line breaks between tokens. Keeps empty containers on one line. */
export const format = (tokens: readonly Token[], indentUnit = '  '): Token[] => {
  const newline = (depth: number): Token => ({ kind: 'space', text: `\n${indentUnit.repeat(depth)}` });
  let depth = 0;
  return tokens.flatMap((t, i) => {
    if (isOpen(t)) {
      if (isClose(tokens[i + 1])) return [t];
      depth += 1;
      return [t, newline(depth)];
    }
    if (isClose(t)) {
      if (isOpen(tokens[i - 1])) return [t];
      depth -= 1;
      return [newline(depth), t];
    }
    if (t.text === ',') return [t, newline(depth)];
    if (t.text === ':') return [t, { kind: 'space', text: ' ' }];
    return [t];
  });
};

/** Validates the JSON text, then returns formatted tokens. Throws on invalid JSON. */
export const highlight = (source: string): Token[] => {
  JSON.parse(source);
  return format(tokenize(source.trim()));
};
