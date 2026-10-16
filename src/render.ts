import type { Token } from './format';

// Dracula palette (draculatheme.com). Dracula has no light variant, so it ignores the system color scheme.
const STYLES = `
:root {
  color-scheme: dark;
  --jh-bg: #282a36; --jh-fg: #f8f8f2; --jh-muted: #f8f8f2; --jh-border: #44475a;
  --jh-key: #8be9fd; --jh-string: #f1fa8c; --jh-number: #bd93f9;
  --jh-boolean: #bd93f9; --jh-null: #bd93f9; --jh-toolbar: #21222c; --jh-accent: #ff79c6;
}
body { margin: 0; background: var(--jh-bg); color: var(--jh-fg); }
.jh-toolbar {
  position: sticky; top: 0; display: flex; gap: 8px; padding: 8px 16px;
  background: var(--jh-toolbar); border-bottom: 1px solid var(--jh-border);
  font: 13px system-ui, sans-serif;
}
.jh-toolbar button {
  font: inherit; color: var(--jh-fg); background: var(--jh-bg);
  border: 1px solid var(--jh-border); border-radius: 6px; padding: 4px 10px; cursor: pointer;
}
.jh-toolbar button[aria-pressed="true"] { border-color: var(--jh-accent); color: var(--jh-accent); }
.jh-code {
  margin: 0; padding: 16px; white-space: pre-wrap; word-break: break-word;
  font: 13px/1.5 ui-monospace, SFMono-Regular, Menlo, Consolas, monospace;
}
.jh-key { color: var(--jh-key); }
.jh-string { color: var(--jh-string); }
.jh-number { color: var(--jh-number); }
.jh-boolean { color: var(--jh-boolean); }
.jh-null { color: var(--jh-null); }
.jh-punct { color: var(--jh-muted); }
`;

// textContent only, never innerHTML: the JSON comes from any site.
const tokenNode = (t: Token): Node => {
  if (t.kind === 'space') return document.createTextNode(t.text);
  const span = document.createElement('span');
  span.className = `jh-${t.kind}`;
  span.textContent = t.text;
  return span;
};

const codeBlock = (tokens: readonly Token[]): HTMLPreElement => {
  const pre = document.createElement('pre');
  pre.className = 'jh-code';
  const fragment = document.createDocumentFragment();
  tokens.forEach((t) => fragment.appendChild(tokenNode(t)));
  pre.appendChild(fragment);
  return pre;
};

const rawBlock = (source: string): HTMLPreElement => {
  const pre = document.createElement('pre');
  pre.className = 'jh-code';
  pre.textContent = source;
  pre.hidden = true;
  return pre;
};

const toggleButton = (label: string, pressed: boolean): HTMLButtonElement => {
  const button = document.createElement('button');
  button.type = 'button';
  button.textContent = label;
  button.setAttribute('aria-pressed', String(pressed));
  return button;
};

/** Replaces the page body with the highlighted JSON and a Pretty/Raw toggle. */
export const render = (source: string, tokens: readonly Token[]): void => {
  const style = document.createElement('style');
  style.textContent = STYLES;
  document.head.appendChild(style);

  const pretty = codeBlock(tokens);
  const raw = rawBlock(source);
  const prettyButton = toggleButton('Pretty', true);
  const rawButton = toggleButton('Raw', false);

  const show = (showPretty: boolean): void => {
    pretty.hidden = !showPretty;
    raw.hidden = showPretty;
    prettyButton.setAttribute('aria-pressed', String(showPretty));
    rawButton.setAttribute('aria-pressed', String(!showPretty));
  };
  prettyButton.addEventListener('click', () => show(true));
  rawButton.addEventListener('click', () => show(false));

  const toolbar = document.createElement('div');
  toolbar.className = 'jh-toolbar';
  toolbar.append(prettyButton, rawButton);

  document.body.replaceChildren(toolbar, pretty, raw);
};
