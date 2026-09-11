draughts-pdn-parser
===============

Javascript PDN (Portable Draughts Notation) Parser

This is a browser-only library: it is loaded via a `<script>` tag and exposes a `PDNParser` global (`window.PDNParser`).

## Installation

```
npm install
```

This installs the development tooling (build and test) only — it is not required to use the library itself.

## Usage

Build the bundle (see below), then load it directly in a page:

```html
<script src="dist/draughts-pdn-parser.min.js"></script>
<script>
    var parser = new PDNParser(pdnText);

    console.log(parser.getGameCount());

    var game = parser.parse(1); // PDNObject for the first game

    game.getTagPair('White');   // e.g. "Alice"
    game.getTagPair('Black');   // e.g. "Bob"
    game.getMoves();            // list of parsed moves
    game.getGameTermination();  // e.g. "1-0"

    if (game.hasFEN()) {
        game.getFENTurnColor(); // "W" or "B"
        game.getFENList('WP');  // white pawn positions
        game.getFENList('WK');  // white king positions
        game.getFENList('BP');  // black pawn positions
        game.getFENList('BK');  // black king positions
    }
</script>
```

## Build

The browser bundle is built with [esbuild](https://esbuild.github.io/), orchestrated by [gulp](https://gulpjs.com/):

```
npm run build
```

This generates, in `dist/`:
- `draughts-pdn-parser.js` — unminified bundle
- `draughts-pdn-parser.min.js` — minified bundle

## Test

Tests use Node's built-in test runner:

```
npm test
```

## License

GPL-3.0
