# Traumatology Formula Guide

A formula-first, source-attributed learning webapp built from the supplied course PPTX and DOCX files. It is an independent static PWA; the Office sources remain outside this repository.

## Data layers

- `src/data/raw-sources.json`: deterministic paragraph/slide extraction with SHA-256 source manifest and locators.
- `src/data/reviewed-records.json`: canonical names, normalized ingredients, contexts, explicit relationships, and quiz mappings.
- `src/data/catalog.json`: generated runtime catalog with computed exact-containment evidence.
- `src/data/catalog-report.json` and `src/data/exclusions.json`: coverage and exclusion audit.

Rebuild with `npm run data:refresh` after installing `requirements.txt`. Run `npm run check` for data validation, TypeScript, lint, unit tests, and static production export. Run `npm run test:e2e` after installing Playwright Chromium.

## Public deployment

The GitHub Actions workflow exports Next.js with repository-aware base paths and deploys `out/` to GitHub Pages.

## Clinical notice

All clinical statements are attributed educational source content. This app is not diagnostic and does not provide prescribing guidance.
