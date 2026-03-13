-- Run this in your Supabase SQL editor (Dashboard → SQL Editor → New query)

create table if not exists kb_sections (
  id uuid primary key default gen_random_uuid(),
  title text not null,
  subtitle text not null,
  sort_order integer not null default 0,
  created_at timestamptz default now()
);

create table if not exists kb_tools (
  id uuid primary key default gen_random_uuid(),
  section_id uuid references kb_sections(id) on delete set null,
  name text not null,
  slug text not null unique,
  icon text not null default '◎',
  tagline text not null default '',
  steps jsonb not null default '[]',
  tips jsonb not null default '[]',
  notes jsonb not null default '[]',
  published boolean not null default true,
  sort_order integer not null default 0,
  created_at timestamptz default now(),
  updated_at timestamptz default now()
);

-- Auto-update updated_at
create or replace function update_updated_at()
returns trigger as $$
begin new.updated_at = now(); return new; end;
$$ language plpgsql;

create trigger kb_tools_updated_at
  before update on kb_tools
  for each row execute function update_updated_at();

-- Public read access (KB is public)
alter table kb_sections enable row level security;
alter table kb_tools enable row level security;

create policy "public read sections" on kb_sections for select using (true);
create policy "public read tools"    on kb_tools    for select using (published = true);

-- Admin write (service role key used server-side, so anon can't write)
-- Writes go through Next.js API routes that check ADMIN_PASSWORD

-- ── Seed data ──────────────────────────────────────────────────────────────

insert into kb_sections (id, title, subtitle, sort_order) values
  ('11111111-0000-0000-0000-000000000001', 'Design Tools',      'Creative generation and ideation',         1),
  ('11111111-0000-0000-0000-000000000002', 'Production Tools',  'Prepare assets for handoff and manufacturing', 2),
  ('11111111-0000-0000-0000-000000000003', 'Marketing Tools',   'Campaign and commercial imagery',          3),
  ('11111111-0000-0000-0000-000000000004', 'Utilities',         'Analysis and specification tools',         4);

insert into kb_tools (section_id, name, slug, icon, tagline, steps, tips, notes, sort_order) values
(
  '11111111-0000-0000-0000-000000000001',
  'Sketch to Image', 'sketch-to-image', '✏',
  'Turn a rough sketch or layer into a polished rendered image',
  '["Open or create the Photoshop document containing your sketch","Make sure the sketch layer is active or visible","Select Sketch to Image from the Workflows tool grid","Write a prompt describing the desired output — be specific about style, materials, and mood","Choose your output format (SVG for vector, PNG for raster)","Click Generate — the result appears as a new layer in your document"]',
  '["The more specific your prompt, the better the result. Instead of ''a jacket'', try ''a structured bomber jacket in matte black nylon with contrast topstitching''","Describe the style reference you want — editorial, technical flat, photorealistic, fashion illustration","Use the Additional Details field to specify background color, lighting direction, or perspective","Nano Banana 3 tends to produce more refined outputs for complex garments and textures"]',
  '["Your sketch acts as a structural guide — the AI respects your composition and proportions while rendering it in the style you describe"]',
  1
),
(
  '11111111-0000-0000-0000-000000000001',
  'Create Variation', 'create-variation', '⟳',
  'Generate multiple creative alternatives from an existing design or image',
  '["Open the document with the design you want to vary","Make sure the target layer is active","Select Create Variation from the tool grid","In the Additional Details field, describe what you want to change — colorway, fabric texture, silhouette, or surface pattern","Leave the field empty to let the AI explore freely","Click Generate — each run produces a new variation as a separate layer"]',
  '["Use this tool to rapidly explore colorways for a single design — run it several times with different hex codes or material descriptions","Describe what should stay the same as well as what should change: ''same silhouette, different surface — try a boucle texture''","Stack your favourite variations as layers to compare side by side","Combine with the Recolor tool for precise color control after generating the variation"]',
  '["Each generation is independent — variations are not ranked or sorted automatically"]',
  2
),
(
  '11111111-0000-0000-0000-000000000001',
  'Edit with AI', 'edit-with-ai', '✦',
  'Inpaint or modify a selected region of your image using a text prompt',
  '["In Photoshop, create a selection or mask over the area you want to edit","Make the target layer active","Select Edit with AI from the tool grid","Write an Edit Prompt describing what should replace or fill the selected area","Click Generate — the selected region is replaced while the rest of the image is preserved"]',
  '["Be explicit about what should appear in the edited region — ''replace with a draped chiffon collar in ivory'' works better than ''change the neckline''","Keep your selection tight around the area you want to change — a loose selection may affect surrounding pixels","Use this tool to swap buttons, change necklines, add embellishments, or fix problem areas","Run multiple generations on the same selection to get different interpretations"]',
  '["Edit with AI respects the boundaries of your selection — it will not alter pixels outside the masked area"]',
  3
),
(
  '11111111-0000-0000-0000-000000000001',
  'Recolor', 'recolor', '◉',
  'Apply a specific color to a design layer with precision',
  '["Open the design you want to recolor","Make the target layer active","Select Recolor from the tool grid","Enter the target hex color code in the Target Color field","Optionally add a description in Additional Details to guide how the color is applied","Click Generate"]',
  '["Use exact hex codes from your brand or client color spec for accuracy","Add material context — ''deep burgundy on a matte wool surface'' produces a different result than the same hex without context","Use Additional Details to specify which elements should be recolored when a design has multiple components","Pair with Create Variation to first generate silhouette options, then apply your colorway"]',
  '["Recolor works best on designs with clear tonal separation between components"]',
  4
),
(
  '11111111-0000-0000-0000-000000000001',
  'Asset Generator', 'asset-generator', '▦',
  'Generate standalone product, pattern, or design assets from a text prompt',
  '["Select Asset Generator from the tool grid","In the prompt field, describe the asset in detail","Use Additional Details for style, mood, format, or usage context","Select your output format","Click Generate — the asset appears as a new layer"]',
  '["Treat this like a brief to a designer — include category, style, intended use, and constraints","For pattern generation, describe the repeat structure, scale, and color palette","For product mockups, describe the product type, angle, background, and lighting","SVG output is ideal for patterns and flat graphics that need to be scalable"]',
  '["Asset Generator creates original assets from scratch — it does not modify existing layers in your document"]',
  5
),
(
  '11111111-0000-0000-0000-000000000001',
  'Packaging', 'packaging', '⬡',
  'Generate packaging concepts and mockups from a prompt',
  '["Select Packaging from the tool grid","Describe the packaging type, material, and brand aesthetic in the prompt field","Add structural or printing requirements in Additional Details","Click Generate"]',
  '["Include the product category — ''luxury fragrance box in textured black with gold foil'' works far better than just ''packaging''","Describe printing finish requirements — embossed, debossed, spot UV, foil stamping","Use the output for client presentations and concept approvals before moving to production artwork","Pair with Die Line to move from concept to production-ready structure"]',
  '["Generated packaging is a concept visual — it is not a production-ready die cut file without further processing with the Die Line tool"]',
  6
),
(
  '11111111-0000-0000-0000-000000000002',
  'Extract Product', 'extract-product', '⊡',
  'Isolate a product or garment from its background',
  '["Open the image containing the product you want to extract","Make the layer active","Select Extract Product from the tool grid","Set the target color if you want to match the product to a specific color context","Set the background color if you want to preview it against a specific backdrop","Click Generate — the extracted product appears on a clean or transparent background"]',
  '["Use white or light neutral backgrounds for cleaner extractions on complex garments","Fill in the target and background color fields even if using defaults — it helps the AI understand context","Run extraction before using Create Variation or Recolor to avoid processing background pixels","For e-commerce, extract to transparent PNG so the product can be placed on any background"]',
  '["Complex backgrounds with similar colors to the product may require manual mask cleanup after extraction"]',
  1
),
(
  '11111111-0000-0000-0000-000000000002',
  'Convert to Line Art', 'convert-to-line-art', '◻',
  'Convert raster artwork into clean, production-ready SVG vector paths',
  '["Open the Photoshop document with the artwork you want to trace","Make the target layer active — works best on high-contrast artwork with clear edges","Select Convert to Line Art from the tool grid","Configure trace settings: adjust Threshold to control which pixels are treated as foreground, set Simplify to control path smoothness, set Min Area to filter out noise","Toggle between Fill and Stroke output modes depending on your intended use","Click Generate — the SVG is written back into your document"]',
  '["Threshold controls sensitivity — lower values trace fewer details, higher values pick up more edge information. Start at the default and adjust from there","Simplify (RDP tolerance) controls anchor point density. Lower = more detail, higher = smoother curves","Min Area filters out small specks and noise — increase it if you are getting unwanted small shapes","Fill mode is best for solid silhouette shapes. Stroke mode is best for outline drawings and technical flats"]',
  '["Convert to Line Art uses a boundary trace algorithm with Catmull-Rom spline smoothing — it produces production-ready SVG paths, not bitmap traces","For best results, ensure your source artwork has clean edges and sufficient contrast between foreground and background"]',
  2
),
(
  '11111111-0000-0000-0000-000000000002',
  'Die Line', 'die-line', '◈',
  'Generate die cut lines for packaging and printed collateral',
  '["Select Die Line from the tool grid","Describe the packaging structure — box type, dimensions, fold requirements, and special structural features","Add manufacturing notes in Additional Details — material thickness, bleed requirements, print process","Click Generate"]',
  '["Be precise about dimensions — include unit (mm or inches) and provide all three dimensions","Specify the box construction type: tuck end, auto-bottom, sleeve, rigid, mailer, etc.","Include material notes if you know the substrate — corrugated, folding boxboard, kraft","Use the generated die line as a structural starting point and have a production specialist review before printing"]',
  '["Die lines generated by Kenna AI are concept structures for design review. Always have production artwork validated by a structural packaging engineer before going to print"]',
  3
),
(
  '11111111-0000-0000-0000-000000000003',
  'Virtual Try-On', 'virtual-try-on', '👕',
  'Composite a garment or product onto a model image',
  '["Open the image containing the garment you want to visualize on a model","Make the garment layer active","Select Virtual Try-On from the tool grid","Describe the model context — gender presentation, pose, environment, and styling notes","Add environment and additional prompt details to control the scene","Click Generate — the try-on composite appears as a new layer"]',
  '["Describe the model and scene specifically — ''female model, standing, outdoor urban environment, natural light'' produces more usable results than leaving it blank","Include styling context — ''styled with straight-leg jeans and white sneakers'' helps the AI compose the full look","Use for pitch decks, buyer presentations, and trend direction materials before committing to a photoshoot","Run several generations to get variety in pose and expression"]',
  '["Virtual Try-On generates concept imagery. Final commercial photography should be produced professionally for published campaigns"]',
  1
),
(
  '11111111-0000-0000-0000-000000000003',
  'Brand Removal', 'brand-removal', '⊘',
  'Remove existing brand marks, logos, or text from a product image',
  '["Open the image containing the brand element you want to remove","Select Brand Removal from the tool grid","Click Generate — the tool identifies and removes brand marks automatically, filling the area with contextually appropriate content"]',
  '["Works best on flat, clean surfaces — logos on complex textures may require touch-up","Use to create clean reference images from competitor research materials","Combine with Recolor afterwards to adapt the cleaned product image to your colorway","Run multiple times if the first pass leaves artifacts — each generation takes a different approach"]',
  '["Use Brand Removal only on images you have the right to modify. Do not use to reproduce or copy another brand''s products"]',
  2
),
(
  '11111111-0000-0000-0000-000000000004',
  'Color Extractor', 'color-extractor', '◎',
  'Identify dominant colors in any image and map them to Pantone values',
  '["Select Color Extractor from the tool grid","Click the upload area to select an image file — supports JPEG and PNG","Once a file is selected, the file name appears with a Change option","Click Extract Colors — the plugin decodes the image, identifies the six most dominant colors, and maps each to its nearest Pantone match","Results appear as a palette showing hex codes and Pantone names","Click the copy icon next to any hex code to copy it to your clipboard","Click the copy icon next to the Pantone name to copy the Pantone specification"]',
  '["Use on reference images, trend photos, or competitor products to extract a working palette instantly","Copy hex codes directly into the Recolor tool to apply extracted colors to your own designs","Copy Pantone values directly into tech packs, color spec sheets, or briefs to manufacturers","For the most accurate Pantone mapping, use well-lit, minimally filtered photography","Run on multiple reference images to build a cohesive palette across a collection"]',
  '["Color extraction runs entirely inside the plugin — your images are never uploaded to a server","Pantone matching uses LAB color space distance — results represent the closest available Pantone Coated match","The plugin extracts six dominant colors per image. For complex palettes, use representative reference crops"]',
  1
);
