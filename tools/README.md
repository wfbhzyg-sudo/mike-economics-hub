# Chapterize tooling

`tools/chapterize.mjs` turns a PPTX or PDF into <=20-page chapter PDFs for the
library reader, with a manifest that keeps every chapter page mapped back to its
canonical source page.

```sh
node tools/chapterize.mjs \
  --source "/path/Unit.pptx" \
  --chapters chapters.json \
  --out outputs/chapter-bundles/<run>/<unit> \
  --title "AP Macro 2.1" \
  --unit macro-unit-2 \
  --python /path/to/python-with-pptx \
  --compress web
```

`chapters.json` uses 1-based source pages:

```json
[{"id":"ch-01","title":"Demand","from":1,"to":16}]
```

Behavior:

- PPTX hidden slides (`show="0"`) are made visible in a temporary copy before
  LibreOffice converts it, so hidden slides are retained and page numbers keep
  matching slide numbers.
- Every chapter must be <=20 pages (the upload limit enforced by
  `homework-server/files.mjs`).
- `--compress web` rewrites each chapter with Ghostscript at 72 dpi photos,
  78% JPEG and preserved annotations; vector text stays searchable. Other
  profiles: `none`, `screen`, `ebook`, `printer`.
- Outputs: `chapters/*.pdf`, `manifest.json`, `chapter-validation.json`,
  `library-unit.json` (resources carry `pageMap`).
- The reader selects a resource whose `topicId` matches the open topic first,
  then falls back to the unit's first resource of that kind. This lets one unit
  hold one compressed chapter per topic while annotations stay canonical.
