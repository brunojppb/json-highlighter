import { highlight } from './format';
import { render } from './render';

const JSON_CONTENT_TYPE = /^(application|text)\/([\w.-]+\+)?json$/i;

// Bigger files make too many DOM nodes and freeze the tab.
const MAX_BYTES = 10 * 1024 * 1024;

const isJsonDocument = (): boolean =>
  JSON_CONTENT_TYPE.test(document.contentType) ||
  (location.protocol === 'file:' && /\.json$/i.test(location.pathname));

// Chrome shows raw JSON inside a single <pre> in the body.
const readSource = (): string | undefined =>
  document.querySelector('body > pre')?.textContent ?? undefined;

const main = (): void => {
  if (!isJsonDocument()) return;
  const source = readSource();
  if (!source || source.length > MAX_BYTES) return;
  try {
    render(source, highlight(source));
  } catch (error) {
    // Invalid JSON or a render failure: keep Chrome's own view.
    console.warn('[JSON Highlighter] Skipped this page:', error);
  }
};

main();
