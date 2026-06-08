-- Generate SKUs for existing products without one
-- SKU format: first 3 chars of category name + first 3 chars of brand name (or GEN) + 5-digit product id
UPDATE "Product" p
SET sku = (
  SELECT UPPER(SUBSTRING(c.name, 1, 3)) || COALESCE(UPPER(SUBSTRING(b.name, 1, 3)), 'GEN') || LPAD(CAST(p.id AS text), 5, '0')
  FROM "Category" c
  LEFT JOIN "Brand" b ON b.id = p."brandId"
  WHERE c.id = p."categoryId"
)
WHERE p.sku IS NULL;
