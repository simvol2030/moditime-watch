# Session-15: Import/Export v2 — Roadmap Final

## 16 Tasks in 5 Blocks

### Block 1: Image Pipeline (Task 1)
1. **sharp + WebP pipeline, media serving, upload API**
   - Install sharp
   - Create `$lib/server/media/image-processor.ts` (resize, WebP, thumbnails)
   - Create `$lib/server/media/storage.ts` (file management)
   - Create upload endpoint `POST /admin/api/upload`
   - Configure SvelteKit to serve from `data/media/images/`

### Block 2: Image Components + Integration (Tasks 2-5)
2. **ImageUpload.svelte** — single image upload component with preview
3. **ImageGalleryUpload.svelte** — multi-image upload with reorder + main flag
4. **Integrate into Brands + Categories** edit forms (logo_url, image_url)
5. **Integrate into Products + Cities** edit forms (product_images, hero_image_url)

### Block 3: Missing Exports (Tasks 6-7)
6. **Export Categories** — `/admin/export/categories/+server.ts`
7. **Export Filters + City Articles** — `/admin/export/filters/+server.ts`, `/admin/export/city_articles/+server.ts`

### Block 4: Import with Images (Tasks 8-10)
8. **ZIP upload support** — detect ZIP files, extract CSV + images
9. **Image processing during import** — process extracted images through pipeline
10. **Cascade import** — auto-create brands/categories if referenced but missing

### Block 5: Filters CRUD (Tasks 11-16)
11. **Filters list page** — `/admin/filters/+page.svelte` (list filter_attributes)
12. **Filter create/edit** — `/admin/filters/new/`, `/admin/filters/[id]/` with filter_values management
13. **Product-filter assignment** — add filter UI to product edit page
14. **Filter management polish** — validation, ordering, delete cascading
15. **Build + verify** — full build, TypeScript check, audit
16. **Commit + push**

## Execution Order
1 → 2,3 → 4,5 → 6,7 → 8,9,10 → 11,12 → 13,14 → 15,16

## Storage
- Images: `data/media/images/{entity}/{slug}-{hash}.webp`
- Thumbnails: `data/media/images/{entity}/{slug}-{hash}-thumb.webp`
- Served via: `/media/images/...` route
