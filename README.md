# AERA

AERA is a production-ready perfume manufacturing SaaS built with React, TypeScript, TailwindCSS, and Supabase.

## Architecture

- Frontend: React + Vite + TypeScript
- Hosting: Vercel
- Database + Auth + RLS: Supabase
- Inventory model: manufacturing
  - `materials` are the real stock
  - `products` are virtual and consume materials through BOM

This schema includes:

- materials
- products
- product_materials
- purchases
- sales
- sale_items
- RLS policies for every table
- `create_sale_with_consumption(jsonb)` to validate and consume materials during sales
