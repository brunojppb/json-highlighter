<p align="center"><img src="icons/icon.svg" width="96" alt="JSON Highlighter icon"></p>

# JSON Highlighter

A small Chrome extension that formats and colors JSON documents. Open a JSON URL or a local `.json` file, and the extension shows it with indentation and the [Dracula](https://draculatheme.com) colors.

## Features

- **Formats the JSON.** The extension indents objects and arrays by two spaces. It keeps empty `{}` and `[]` on one line.
- **Colors each part.** Keys, strings, numbers, booleans and `null` each get a Dracula color.
- **Keeps your numbers.** The extension colors the original text, not a parsed copy. A number like `12345678901234567890` keeps every digit.
- **Shows the raw text.** The **Raw** button shows the text exactly as the server sent it.
- **Leaves other pages alone.** The extension acts only on JSON documents. If the JSON is not valid, Chrome shows the page as usual.
- **Asks for no permissions.** The extension makes no network requests and stores no data.

## Colors

| Part | Color |
| --- | --- |
| Keys | Cyan `#8be9fd` |
| Strings | Yellow `#f1fa8c` |
| Numbers, booleans, `null` | Purple `#bd93f9` |
| Punctuation | Foreground `#f8f8f2` |
| Background | `#282a36` |

## Install

The extension is not on the Chrome Web Store. Build it and load it by hand:

```bash
git clone git@github.com:brunojppb/json-highlighter.git
cd json-highlighter
npm install
npm run build
```

Then, in Chrome:

1. Open `chrome://extensions`.
2. Turn on **Developer mode** (top right).
3. Click **Load unpacked** and select the `json-highlighter` folder.
4. To view local `.json` files, open the extension **Details** and turn on **Allow access to file URLs**.

## Development

| Command | What it does |
| --- | --- |
| `npm run build` | Bundles `src/content.ts` into `dist/content.js` with esbuild. |
| `npm run watch` | Rebuilds on each change. |
| `npm test` | Runs the unit tests with Vitest. |
| `npm run typecheck` | Checks types with `tsc`. |

After a rebuild, click the reload icon on the extension card in `chrome://extensions`. Then reload the JSON tab.

## How it works

The content script runs on every page, but it stops early unless one of these is true:

- The page has a JSON content type: `application/json`, `text/json`, or a `+json` type such as `application/ld+json`.
- The page is a local file whose name ends in `.json`.

Chrome shows raw JSON inside a `<pre>` element. The script reads that text and checks it with `JSON.parse`. Then it splits the original text into tokens, adds indentation, and builds the page. The script sets all text through `textContent`, so JSON from a website cannot inject HTML.

### Project layout

```
manifest.json       Chrome extension manifest (Manifest V3)
icons/              Extension icon: SVG source and PNG sizes
src/content.ts      Decides if the page is JSON, then starts the work
src/format.ts       Splits JSON text into tokens and indents them
src/render.ts       Builds the highlighted page and the Dracula styles
test/format.test.ts Unit tests for the tokenizer and the formatter
```

## Limits

- The extension skips files over 10 MB, because a large file makes too many DOM nodes and freezes the tab.
- Dracula is a dark theme, so the page stays dark in light mode too.
