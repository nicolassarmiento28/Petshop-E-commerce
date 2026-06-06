# Brand Assignment Migration

## Problem
Most products in the DB have `brandId = null`. The admin Brands panel shows inaccurate product counts because brand-to-product associations are missing.

## Approach
Create a migration script (`backend/prisma/seed-brands.ts`) that:

1. **Scans all products** in the DB (seed + scraper)
2. **Matches brands** by searching product names against a curated brand list
3. **Creates missing brands** in the `Brand` table
4. **Updates `brandId`** on matched products
5. **Handles edge cases**: false positives (short/common words), products with no clear brand

## Brand Mapping
~80+ brands identified from product names. Multi-word brands matched first to avoid partial matches. Brands with names <4 chars validated manually.

## Execution
Single-use migration: `npx ts-node prisma/seed-brands.ts`
Run once, then admin panel shows accurate brand counts.
