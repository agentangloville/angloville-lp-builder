import { useState, useRef, useCallback, useEffect, useMemo } from "react";

/* ═══════════════════════════════════════════════
   BRAND COLORS
═══════════════════════════════════════════════ */
const BRAND_COLORS = {
  primary: [
    { hex: "#FCD23A", name: "Golden Horizon", use: "CTA, akcenty, ikony" },
    { hex: "#428BCA", name: "Blue Voyage", use: "Linki, nagłówki, tła sekcji" },
    { hex: "#232323", name: "Urban Shadow", use: "Tekst, tło kontrast" },
    { hex: "#F5F5F5", name: "Morning Mist", use: "Tła, podkłady" },
  ],
  companion: [
    { hex: "#FFF372", name: "Sunbeam Glow", use: "Jasne akcenty, radość" },
    { hex: "#B4DBFF", name: "Icy Breeze", use: "Subtelne podkreślenia" },
    { hex: "#0F0F0F", name: "Midnight Ink", use: "Mocne tła, elegancja" },
    { hex: "#FAFAFA", name: "Soft Cloud", use: "Neutralne tła" },
  ],
  supplementary: [
    { hex: "#6065FF", name: "Electric Indigo", use: "Energia, młodość" },
    { hex: "#FFABC3", name: "Candy Blossom", use: "Ciepło, lekkość" },
    { hex: "#FF5540", name: "Coral Punch", use: "Dynamika, uwaga" },
    { hex: "#FE5940", name: "Sunset Orange", use: "Ciepło, przygoda" },
    { hex: "#FF5B23", name: "Tangerine Flame", use: "Energia, CTA alt" },
    { hex: "#62ADE5", name: "Crystal Aqua", use: "Spokój, zaufanie" },
    { hex: "#CF28CC", name: "Lavender Glow", use: "Kreatywność" },
    { hex: "#E8AC48", name: "Golden Dusk", use: "Ciepło, premium" },
  ],
  text: [
    { hex: "#E14030", name: "Crimson Pulse", use: "Urgency, uwaga" },
    { hex: "#000141", name: "Midnight Indigo", use: "Elegancja" },
    { hex: "#E21212", name: "Alert Red", use: "Ostrzeżenia" },
    { hex: "#737372", name: "Stone Gray", use: "Tekst drugorzędny" },
  ],
};

/* ═══════════════════════════════════════════════
   SYSTEM PROMPT — MOBILE FIRST
═══════════════════════════════════════════════ */
function buildSystemPrompt(lang, selectedColors) {
  const colorList = selectedColors.length
    ? `Use these brand colors:\n${selectedColors.map((c) => `- ${c.hex} (${c.name}) — ${c.use}`).join("\n")}`
    : "Use Angloville brand: #FCD23A (yellow CTA), #428BCA (blue), #232323 (dark text), #F5F5F5 (light bg).";

  const langInstruction = {
    pl: "All UI text and content must be in Polish.",
    en: "All UI text and content must be in English.",
    it: "All UI text and content must be in Italian.",
  }[lang];

  return `You are an expert landing page designer for Angloville — a language travel company.
Output: SINGLE self-contained HTML block, paste-ready for WordPress Elementor HTML widget.

## WORDPRESS RULES
- NO <html>, <head>, <body>, <!DOCTYPE> — output ONLY content divs
- NO top navigation, NO footer (WordPress provides these)
- All CSS inside ONE <style> tag at the very top of output
- All JS (if any) in ONE <script> tag at the very bottom
- Contact form: use ONLY shortcode placeholder → <div class="form-wrap">[contact-form-7 id="XXXX" title="Formularz"]</div>

## MOBILE-FIRST DESIGN — CRITICAL
Angloville traffic: 90% MOBILE, 10% DESKTOP.
Design MOBILE first. Desktop is an enhancement, not the baseline.

MOBILE (primary — 390px viewport):
- Single-column layout everywhere
- Font: body min 16px, H1 min 28px, H2 min 22px
- Line height 1.65 for comfortable mobile reading
- CTA buttons: width:100%, min-height:54px, font-size:17px, border-radius:12px — must be easy to tap
- Images: width:100%; height:auto always
- Section padding: 44px 20px (vertical / horizontal)
- Hero: min-height:92vh, H1 visible above the fold, CTA button visible without scrolling
- All cards and features: stack vertically (1 column)
- Form inputs: width:100%, height:48px, font-size:16px (prevents iOS auto-zoom — critical!)
- Spacing between elements: generous, never cramped
- No horizontal scroll under any circumstance

DESKTOP (secondary — min-width:768px, max-content-width:1140px):
- Multi-column grids (2–3 cols) with CSS grid or flexbox
- Section padding: 80px 40px
- max-width: 1140px centered
- Side-by-side layouts where meaningful
Use @media (min-width: 768px) { } for ALL desktop enhancements.
NEVER use fixed pixel widths — use %, flex, grid only.

## DESIGN SYSTEM
${colorList}

Font: Google Fonts 'Funnel Sans' — add <link href="https://fonts.googleapis.com/css2?family=Funnel+Sans:wght@400;500;600;700;800&display=swap" rel="stylesheet"> at very top.
Headings: font-weight:800, color:#232323
Body: color:#475569, line-height:1.7
Cards: box-shadow: 0 2px 20px rgba(0,0,0,0.07), border-radius:16px
CTA primary: background:#FCD23A, color:#232323, font-weight:800
CTA secondary: background:#232323, color:#FCD23A, font-weight:800

## IMAGE PLACEHOLDERS — ALWAYS USE EXACT PIXEL DIMENSIONS
Standard sizes (use these exact values — never "auto"):
- Hero banner: 1200×675px
- Section background: 1200×500px
- Product/card image: 600×400px
- Gallery photo: 800×600px
- Square thumbnail: 400×400px
- Avatar / testimonial: 80×80px
- Icon: 80×80px
- Logo badge: 200×80px

For EVERY <img> tag, use EXACTLY this format:
<!-- IMAGE: [short description] | wymiar: [W]x[H]px | zmień src poniżej -->
<img src="https://placehold.co/[W]x[H]/232323/FCD23A?text=[label]+[W]x[H]" alt="[description]" style="width:100%;height:auto;display:block;border-radius:14px;">

NEVER omit the <!-- IMAGE: --> comment. NEVER use width:auto or height:auto as the only size info.

## SECTIONS TO INCLUDE (adapt to content)
1. Hero — full-width bg image with gradient overlay, H1, subtitle, CTA button(s)
2. Trust bar — stats: liczba uczestników, lata doświadczenia, ocena Google (4.8★ z 1900+ opinii)
3. Program overview — what participants do, schedule highlights
4. Benefits — 3–4 feature cards (icon + title + description)
5. Itinerary / Timeline — numbered steps (if travel product)
6. Pricing — 1–3 pricing cards, "most popular" badge
7. Inclusions — ✓ included / ✗ not included lists
8. Testimonials / Social proof — 2–3 quotes
9. FAQ — <details><summary> accordion (min 4 questions)
10. CTA section — full-width colored bg, headline, button
11. Contact form — [contact-form-7] shortcode in styled container

## LANGUAGE
${langInstruction}

## OUTPUT
Return ONLY the HTML. No markdown fences, no preamble, no explanation.
Start directly with <link> (Google Fonts) then <style> then content divs.`;
}

/* ═══════════════════════════════════════════════
   IMAGE PARSER — finds <img>, inline bg, CSS bg
═══════════════════════════════════════════════ */
function parseImagesFromHtml(html) {
  const imgs = [];

  // ── 1. Find all <img> tags (including multiline) ──
  const imgRegex = /<img[\s\S]*?>/gi;
  let match;
  while ((match = imgRegex.exec(html)) !== null) {
    const tag = match[0];
    let srcMatch = tag.match(/(?<![a-zA-Z-])src=["']([^"']+)["']/i);
    if (!srcMatch) srcMatch = tag.match(/data-(?:lazy-|original-)?src=["']([^"']+)["']/i);
    if (!srcMatch) continue;
    if (srcMatch[1].startsWith("data:")) continue;

    const altMatch = tag.match(/alt=["']([^"']*?)["']/i);
    let w = null, h = null;

    const rawBefore = html.substring(0, match.index);
    const prevImgIdx = Math.max(rawBefore.lastIndexOf("<img "), rawBefore.lastIndexOf("<img\t"), rawBefore.lastIndexOf("<img\n"), rawBefore.lastIndexOf("<img>"));
    const windowStart = prevImgIdx >= 0 ? prevImgIdx : Math.max(0, match.index - 500);
    const before = html.substring(windowStart, match.index);

    const dimMatches = [...before.matchAll(/wymiar:\s*(\d+)\s*[xX×]\s*(\d+)\s*px/gi)];
    const dimComment = dimMatches.length ? dimMatches[dimMatches.length - 1] : null;
    if (dimComment) { w = dimComment[1]; h = dimComment[2]; }

    if (!w || !h) { const phMatch = srcMatch[1].match(/placehold\.co\/(\d+)\s*[xX×]\s*(\d+)/); if (phMatch) { w = w || phMatch[1]; h = h || phMatch[2]; } }
    if (!w) { const m = tag.match(/\bwidth=["'](\d+)["']/i); if (m) w = m[1]; }
    if (!h) { const m = tag.match(/\bheight=["'](\d+)["']/i); if (m) h = m[1]; }
    const styleMatch = tag.match(/style=["']([^"']*?)["']/i);
    if (styleMatch) {
      if (!w) { const m = styleMatch[1].match(/(?:^|;)\s*width\s*:\s*(\d+)px/i); if (m) w = m[1]; }
      if (!h) { const m = styleMatch[1].match(/(?:^|;)\s*height\s*:\s*(\d+)px/i); if (m) h = m[1]; }
    }
    if (!w || !h) { const fnMatch = srcMatch[1].match(/[_\-\/](\d{2,4})[xX×](\d{2,4})[_\-\.\/]/); if (fnMatch) { w = w || fnMatch[1]; h = h || fnMatch[2]; } }

    const commentMatch = before.match(/<!--\s*IMAGE:\s*([^|>\n]*?)(?:\s*\|[^>]*)?\s*-->\s*$/i);
    const label = commentMatch ? commentMatch[1].trim() : (altMatch && altMatch[1].trim()) ? altMatch[1].trim() : null;

    imgs.push({ id: imgs.length, originalSrc: srcMatch[1], newSrc: "", alt: altMatch ? altMatch[1] : "", label: label || "Obraz " + (imgs.length + 1), w: w || null, h: h || null, fullTag: tag, type: "img" });
  }

  // ── 2. Find background-image in inline styles ──
  const bgInlineRegex = /style=["'][^"']*?background(?:-image)?\s*:\s*[^;]*?url\(\s*['"]?([^'")\s]+)['"]?\s*\)/gi;
  while ((match = bgInlineRegex.exec(html)) !== null) {
    const url = match[1].trim();
    if (url.startsWith("data:") || url.startsWith("#")) continue;
    if (imgs.some((i) => i.originalSrc === url)) continue;
    const before = html.substring(Math.max(0, match.index - 300), match.index);
    const commentMatch = before.match(/<!--\s*IMAGE:\s*([^|>\n]*?)(?:\s*\|[^>]*)?\s*-->\s*$/i);
    imgs.push({ id: imgs.length, originalSrc: url, newSrc: "", alt: "", label: commentMatch ? commentMatch[1].trim() : "Tło " + (imgs.length + 1), w: null, h: null, fullTag: match[0], type: "bg" });
  }

  // ── 3. Find background-image in <style> blocks ──
  const styleBlockRegex = /<style[^>]*>([\s\S]*?)<\/style>/gi;
  let styleBlockMatch;
  while ((styleBlockMatch = styleBlockRegex.exec(html)) !== null) {
    const cssContent = styleBlockMatch[1];
    const cssBgRegex = /background(?:-image)?\s*:\s*[^;]*?url\(\s*['"]?([^'")\s]+)['"]?\s*\)/gi;
    let cssBgMatch;
    while ((cssBgMatch = cssBgRegex.exec(cssContent)) !== null) {
      const url = cssBgMatch[1].trim();
      if (url.startsWith("data:") || url.startsWith("#")) continue;
      if (imgs.some((i) => i.originalSrc === url)) continue;
      imgs.push({ id: imgs.length, originalSrc: url, newSrc: "", alt: "", label: "CSS tło " + (imgs.length + 1), w: null, h: null, fullTag: cssBgMatch[0], type: "css-bg" });
    }
  }

  return imgs;
}

/* ═══════════════════════════════════════════════
   PLACEHOLDER DETECTOR — finds spots to ADD images
   When HTML has no images at all, scan for sections
   where images would improve the page
═══════════════════════════════════════════════ */
const PLACEHOLDER_PRESETS = [
  { match: /hero|banner|header|jumbotron/i, label: "Hero — tło sekcji", w: "1200", h: "675", inject: "bg", desc: "Główny baner / tło hero" },
  { match: /about|overview|intro|who-we|o-nas/i, label: "Sekcja O nas - zdjecie", w: "600", h: "400", inject: "img", desc: "Zdjecie do sekcji informacyjnej" },
  { match: /feature|benefit|advantage|korzy/i, label: "Ikona / zdjęcie feature", w: "400", h: "400", inject: "img", desc: "Ilustracja do sekcji benefitów" },
  { match: /testimonial|opini|review|quote/i, label: "Zdjęcie autora opinii", w: "80", h: "80", inject: "img", desc: "Avatar / zdjęcie osoby" },
  { match: /cta|call-to-action|action|zapisy|contact/i, label: "CTA — tło sekcji", w: "1200", h: "500", inject: "bg", desc: "Tło sekcji z wezwaniem do akcji" },
  { match: /gallery|galeria|photo|zdj/i, label: "Galeria — zdjęcie", w: "800", h: "600", inject: "img", desc: "Zdjęcie do galerii" },
  { match: /pricing|cennik|price|pakiet/i, label: "Cennik — dekoracja", w: "600", h: "400", inject: "img", desc: "Zdjęcie do sekcji cenowej" },
  { match: /timeline|itinerary|harmonogram|plan/i, label: "Timeline — zdjęcie", w: "600", h: "400", inject: "img", desc: "Ilustracja do timeline" },
];

function detectPlaceholders(html) {
  const slots = [];
  let idCounter = 0;

  // Parse HTML with DOMParser to find sections
  const parser = new DOMParser();
  const doc = parser.parseFromString(html, "text/html");

  // Find all block elements that could be sections
  const sectionEls = doc.querySelectorAll("section, div, header, footer, main, article");
  const processed = new Set();

  sectionEls.forEach((el) => {
    // Skip tiny elements / deeply nested
    if (el.textContent.trim().length < 10) return;
    // Check class/id for section type
    const identifier = (el.className || "") + " " + (el.id || "");
    if (!identifier.trim()) return;
    if (processed.has(identifier)) return;
    processed.add(identifier);

    // Check if this element already has an image inside
    if (el.querySelector("img") || (el.getAttribute("style") || "").includes("url(")) return;

    for (const preset of PLACEHOLDER_PRESETS) {
      if (preset.match.test(identifier)) {
        // Get section heading for a better label
        const heading = el.querySelector("h1,h2,h3");
        const headingText = heading ? heading.textContent.trim().substring(0, 40) : "";

        slots.push({
          id: idCounter++,
          label: headingText ? `${preset.label} — "${headingText}"` : preset.label,
          desc: preset.desc,
          w: preset.w,
          h: preset.h,
          inject: preset.inject,
          newSrc: "",
          // Store a CSS selector to find this element later
          selector: el.id ? `#${el.id}` : el.className ? `.${el.className.split(/\s+/)[0]}` : null,
          className: el.className || "",
          tagName: el.tagName.toLowerCase(),
        });
        break; // one preset per element
      }
    }
  });

  // If we still found nothing, add generic hero + CTA slots
  if (slots.length === 0) {
    // Check if there's any div/section with a gradient background (common in AI-generated pages)
    const allEls = doc.querySelectorAll("*");
    let heroFound = false;
    allEls.forEach((el) => {
      const style = el.getAttribute("style") || "";
      const cls = (el.className || "") + " " + (el.id || "");
      if (!heroFound && (style.includes("gradient") || style.includes("min-height") || cls.match(/hero|banner/i))) {
        const heading = el.querySelector("h1,h2");
        const headingText = heading ? heading.textContent.trim().substring(0, 40) : "Hero";
        slots.push({
          id: idCounter++,
          label: `Hero tło — "${headingText}"`,
          desc: "Główny baner strony",
          w: "1200", h: "675",
          inject: "bg",
          newSrc: "",
          selector: el.id ? `#${el.id}` : el.className ? `.${el.className.split(/\s+/)[0]}` : null,
          className: el.className || "",
          tagName: el.tagName.toLowerCase(),
        });
        heroFound = true;
      }
    });

    // Always offer a generic "dodaj zdjęcie" slot
    slots.push({
      id: idCounter++,
      label: "Dodaj zdjęcie do strony",
      desc: "Wklej URL — dodamy <img> na górze sekcji body",
      w: "1200", h: "675",
      inject: "img-generic",
      newSrc: "",
      selector: null,
      className: "",
      tagName: "body",
    });
  }

  return slots;
}

function applyPlaceholders(html, slots) {
  let updated = html;

  slots.forEach((slot) => {
    if (!slot.newSrc.trim()) return;
    const src = slot.newSrc.trim();

    if (slot.inject === "bg" && slot.selector) {
      // Add background-image to the element's inline style via regex on class
      const cls = slot.className.split(/\s+/)[0];
      if (!cls) return;
      // Find the element opening tag by class and inject background-image
      const classRegex = new RegExp(`(class=["'][^"']*\\b${cls.replace(/[.*+?^${}()|[\]\\]/g, '\\$&')}\\b[^"']*["'][^>]*)(style=["'])`, "i");
      const classRegexNoStyle = new RegExp(`(class=["'][^"']*\\b${cls.replace(/[.*+?^${}()|[\]\\]/g, '\\$&')}\\b[^"']*["'])`, "i");

      if (classRegex.test(updated)) {
        // Element already has style — prepend background-image
        updated = updated.replace(classRegex, `$1$2background-image:url('${src}');background-size:cover;background-position:center;`);
      } else if (classRegexNoStyle.test(updated)) {
        // Element has no style — add one
        updated = updated.replace(classRegexNoStyle, `$1 style="background-image:url('${src}');background-size:cover;background-position:center;"`);
      }
    } else if (slot.inject === "img" && slot.selector) {
      // Insert <img> as first child of the section
      const cls = slot.className.split(/\s+/)[0];
      if (!cls) return;
      const openTagRegex = new RegExp(`(<${slot.tagName}[^>]*class=["'][^"']*\\b${cls.replace(/[.*+?^${}()|[\]\\]/g, '\\$&')}\\b[^"']*["'][^>]*>)`, "i");
      const imgTag = `<img src="${src}" alt="${slot.label}" style="width:100%;height:auto;display:block;border-radius:14px;margin-bottom:20px;">`;
      updated = updated.replace(openTagRegex, `$1\n${imgTag}`);
    } else if (slot.inject === "img-generic") {
      // Insert after opening <body> or after first <style>...</style> block
      const styleEnd = updated.lastIndexOf("</style>");
      const imgTag = `\n<img src="${src}" alt="${slot.label}" style="width:100%;height:auto;display:block;border-radius:14px;margin-bottom:20px;">\n`;
      if (styleEnd > -1) {
        const insertAt = styleEnd + "</style>".length;
        updated = updated.substring(0, insertAt) + imgTag + updated.substring(insertAt);
      } else {
        updated = imgTag + updated;
      }
    }
  });

  return updated;
}

function formatDims(w, h) {
  if (w && h) return `${w}×${h}px`;
  if (w) return `${w}×?px`;
  if (h) return `?×${h}px`;
  return null;
}

/* ═══════════════════════════════════════════════
   CMS PARSER
═══════════════════════════════════════════════ */
const TAG_META = {
  h1: { label: "Nagłówek H1", icon: "H1", color: "#7c3aed", isInput: true },
  h2: { label: "Nagłówek sekcji", icon: "H2", color: "#2563eb", isInput: true },
  h3: { label: "Podnagłówek H3", icon: "H3", color: "#0891b2", isInput: true },
  h4: { label: "Nagłówek H4", icon: "H4", color: "#0891b2", isInput: true },
  h5: { label: "Nagłówek H5", icon: "H5", color: "#64748b", isInput: true },
  h6: { label: "Nagłówek H6", icon: "H6", color: "#64748b", isInput: true },
  p:  { label: "Paragraf", icon: "P", color: "#475569", isInput: false },
  li: { label: "Punkt listy", icon: "•", color: "#059669", isInput: false },
  button: { label: "Przycisk", icon: "BTN", color: "#dc2626", isInput: true },
};

function parseCmsFromHtml(rawHtml) {
  const parser = new DOMParser();
  const doc = parser.parseFromString(rawHtml, "text/html");
  const fields = [];
  let counter = 0;

  const EDITABLE = "h1,h2,h3,h4,h5,h6,p,li,button";

  doc.querySelectorAll(EDITABLE).forEach((el) => {
    if (el.querySelectorAll(EDITABLE).length > 0) return;
    const text = el.textContent.trim();
    if (!text || text.length < 2 || text.startsWith("[") || text.startsWith("<!--")) return;

    const id = `cms${counter++}`;
    el.setAttribute("data-cms-id", id);
    fields.push({ id, tag: el.tagName.toLowerCase(), text });
  });

  return { fields, parsedHtml: doc.body.innerHTML };
}

function updateCmsField(currentHtml, id, newText) {
  const parser = new DOMParser();
  const doc = parser.parseFromString(currentHtml, "text/html");
  const el = doc.querySelector(`[data-cms-id="${id}"]`);
  if (!el) return currentHtml;
  const hasBlockKids = el.querySelectorAll("p,div,section,h1,h2,h3,h4,h5,h6,li").length > 0;
  if (!hasBlockKids && el.children.length > 0) {
    for (const node of el.childNodes) {
      if (node.nodeType === Node.TEXT_NODE && node.textContent.trim()) {
        node.textContent = newText;
        return doc.body.innerHTML;
      }
    }
  }
  el.textContent = newText;
  return doc.body.innerHTML;
}

function stripCmsIds(html) {
  return html.replace(/\s*data-cms-id="[^"]*"/g, "");
}

function groupFieldsBySection(fields) {
  const groups = [];
  let current = { title: "Sekcja 1", icon: "🏔️", fields: [] };

  fields.forEach((f) => {
    if (f.tag === "h2") {
      if (current.fields.length > 0) groups.push(current);
      current = { title: f.text.substring(0, 45), icon: "📌", fields: [f] };
    } else {
      current.fields.push(f);
    }
  });
  if (current.fields.length > 0) groups.push(current);

  if (groups.length > 0 && groups[0].icon === "🏔️") {
    const hasH1 = groups[0].fields.some((f) => f.tag === "h1");
    groups[0].title = hasH1 ? "Hero" : "Górna sekcja";
  }
  return groups;
}

/* ═══════════════════════════════════════════════
   HOOKS
═══════════════════════════════════════════════ */
function useDebounce(value, delay) {
  const [dv, setDv] = useState(value);
  useEffect(() => {
    const t = setTimeout(() => setDv(value), delay);
    return () => clearTimeout(t);
  }, [value, delay]);
  return dv;
}

/* ═══════════════════════════════════════════════
   UI ATOMS
═══════════════════════════════════════════════ */
function StepBadge({ n }) {
  return (
    <span style={{ display:"inline-flex",alignItems:"center",justifyContent:"center",width:28,height:28,borderRadius:"50%",background:"#FCD23A",color:"#232323",fontSize:13,fontWeight:800,flexShrink:0 }}>{n}</span>
  );
}

function Chevron({ open }) {
  return (
    <svg width="18" height="18" viewBox="0 0 20 20" fill="none" style={{ transition:"transform 0.25s",transform:open?"rotate(180deg)":"rotate(0)" }}>
      <path d="M5 7.5L10 12.5L15 7.5" stroke="#94a3b8" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
    </svg>
  );
}

function Collapse({ step, title, tag, tagColor, defaultOpen, children }) {
  const [open, setOpen] = useState(defaultOpen ?? false);
  return (
    <div style={{ background:"#fff",borderRadius:14,border:"1px solid #e8e8e8",overflow:"hidden",marginBottom:12 }}>
      <button onClick={() => setOpen(!open)} style={{ width:"100%",display:"flex",alignItems:"center",gap:12,padding:"18px 24px",background:"none",border:"none",cursor:"pointer",fontFamily:"inherit" }}>
        <StepBadge n={step}/>
        <span style={{ fontSize:16,fontWeight:700,color:"#232323" }}>{title}</span>
        {tag && <span style={{ fontSize:12,fontWeight:600,color:tagColor||"#428BCA",marginLeft:4 }}>{tag}</span>}
        <span style={{ marginLeft:"auto" }}><Chevron open={open}/></span>
      </button>
      <div style={{ maxHeight:open?5000:0,opacity:open?1:0,overflow:"hidden",transition:"max-height 0.35s ease,opacity 0.25s ease,padding 0.3s ease",padding:open?"0 24px 24px":"0 24px 0" }}>
        {children}
      </div>
    </div>
  );
}

function ColorSwatch({ color, selected, onToggle }) {
  return (
    <button onClick={onToggle} title={`${color.name}\n${color.use}`} style={{ width:42,height:42,borderRadius:10,border:selected?"3px solid #232323":"2px solid #e0e0e0",background:color.hex,cursor:"pointer",position:"relative",boxShadow:selected?"0 0 0 2px #FCD23A":"none",transition:"all 0.15s",flexShrink:0 }}>
      {selected && <span style={{ position:"absolute",top:-4,right:-4,width:16,height:16,borderRadius:"50%",background:"#232323",color:"#FCD23A",fontSize:10,fontWeight:800,display:"flex",alignItems:"center",justifyContent:"center" }}>✓</span>}
    </button>
  );
}

function TabBtn({ active, onClick, children }) {
  return (
    <button onClick={onClick} style={{ padding:"8px 16px",borderRadius:8,border:"none",fontSize:13,fontWeight:600,cursor:"pointer",fontFamily:"inherit",transition:"all 0.15s",background:active?"#232323":"transparent",color:active?"#FCD23A":"#777" }}>
      {children}
    </button>
  );
}

/* ═══════════════════════════════════════════════
   IMAGE REPLACER — handles existing images + placeholder slots
═══════════════════════════════════════════════ */
function ImageReplacer({ html, onHtmlUpdate }) {
  const [images, setImages] = useState([]);
  const [placeholders, setPlaceholders] = useState([]);
  const [mode, setMode] = useState("images"); // "images" | "placeholders"
  const [outputHtml, setOutputHtml] = useState("");
  const [copied, setCopied] = useState(false);
  const [previewDevice, setPreviewDevice] = useState("desktop");
  const [parseAttempted, setParseAttempted] = useState(false);

  useEffect(() => {
    if (html && html.trim()) {
      const foundImages = parseImagesFromHtml(html);
      setImages(foundImages);
      if (foundImages.length === 0) {
        setPlaceholders(detectPlaceholders(html));
        setMode("placeholders");
      } else {
        setPlaceholders([]);
        setMode("images");
      }
      setOutputHtml("");
      setParseAttempted(true);
    } else {
      setImages([]);
      setPlaceholders([]);
      setParseAttempted(false);
    }
  }, [html]);

  const updateImage = (id, newSrc) =>
    setImages((p) => p.map((img) => (img.id === id ? { ...img, newSrc } : img)));

  const updatePlaceholder = (id, newSrc) =>
    setPlaceholders((p) => p.map((s) => (s.id === id ? { ...s, newSrc } : s)));

  const generate = () => {
    let updated = html;
    if (mode === "images") {
      images.forEach((img) => {
        if (img.newSrc.trim()) updated = updated.split(img.originalSrc).join(img.newSrc.trim());
      });
    } else {
      updated = applyPlaceholders(html, placeholders);
    }
    setOutputHtml(updated);
    if (onHtmlUpdate) onHtmlUpdate(updated);
  };

  const copy = () => {
    navigator.clipboard.writeText(outputHtml || html);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const hasChanges = mode === "images"
    ? images.some((i) => i.newSrc.trim())
    : placeholders.some((s) => s.newSrc.trim());

  const iW = previewDevice === "mobile" ? 390 : previewDevice === "tablet" ? 768 : "100%";

  // Empty state — no HTML pasted yet
  if (!html || !html.trim()) {
    return (
      <div style={{ padding: 40, textAlign: "center", color: "#999" }}>
        <span style={{ fontSize: 40, display: "block", marginBottom: 12 }}>🖼</span>
        Wklej HTML po lewej — tutaj pojawią się obrazy do podmiany
      </div>
    );
  }

  // ── Render image/placeholder list ──
  const items = mode === "images" ? images : placeholders;
  const isPlaceholderMode = mode === "placeholders";

  return (
    <div>
      {/* Mode indicator */}
      {isPlaceholderMode ? (
        <div style={{ fontSize: 12, color: "#888", marginBottom: 16, padding: "12px 16px", background: "#fffbeb", border: "1px solid #fde68a", borderRadius: 10 }}>
          <strong style={{ color: "#92400e" }}>Brak obrazów w HTML</strong> — ale znaleziono <strong style={{ color: "#232323" }}>{placeholders.length}</strong> miejsc na zdjęcia.
          Wklej URLe zdjęć → system wstrzyknie je do odpowiednich sekcji.
        </div>
      ) : (
        <div style={{ fontSize: 12, color: "#888", marginBottom: 16 }}>
          Znaleziono <strong style={{ color: "#232323" }}>{images.length}</strong> obrazów
          {images.filter(i => i.type === "img").length > 0 && images.filter(i => i.type !== "img").length > 0 && (
            <span> ({images.filter(i => i.type === "img").length} × <code>&lt;img&gt;</code>, {images.filter(i => i.type !== "img").length} × tło CSS)</span>
          )}
          . Wklej nowe URLe → kliknij "Generuj HTML z nowymi obrazami".
        </div>
      )}

      <div style={{ display: "flex", flexDirection: "column", gap: 10, marginBottom: 20 }}>
        {items.map((item, idx) => {
          const isPlaceholder = isPlaceholderMode;
          const dims = isPlaceholder ? `${item.w}×${item.h}px` : formatDims(item.w, item.h);
          const typeBadge = isPlaceholder
            ? (item.inject === "bg" ? "BG" : "IMG")
            : (item.type === "bg" || item.type === "css-bg" ? "BG" : "IMG");
          const typeBadgeColor = isPlaceholder
            ? (item.inject === "bg" ? "#7c3aed" : "#428BCA")
            : (item.type === "bg" || item.type === "css-bg" ? "#7c3aed" : "#428BCA");

          return (
            <div key={item.id} style={{ background: "#fff", border: "1px solid #e8e8e8", borderRadius: 12, padding: 16, display: "flex", gap: 14, alignItems: "flex-start" }}>
              {/* Thumbnail / placeholder icon */}
              <div style={{ width: 90, minWidth: 90, height: 64, borderRadius: 8, overflow: "hidden", background: isPlaceholder ? "#f0f4ff" : "#f0f0f0", border: `1px solid ${isPlaceholder ? "#c7d2fe" : "#e0e0e0"}`, flexShrink: 0, display: "flex", alignItems: "center", justifyContent: "center" }}>
                {isPlaceholder ? (
                  item.newSrc.trim() ? (
                    <img src={item.newSrc.trim()} alt="" style={{ width: "100%", height: "100%", objectFit: "cover" }}
                      onError={(e) => { e.target.style.display = "none"; }} />
                  ) : (
                    <div style={{ textAlign: "center" }}>
                      <span style={{ fontSize: 20, display: "block" }}>{item.inject === "bg" ? "🎨" : "📸"}</span>
                      <span style={{ fontSize: 9, color: "#8b5cf6", fontWeight: 600 }}>{dims}</span>
                    </div>
                  )
                ) : (
                  <img src={item.newSrc.trim() || item.originalSrc} alt={item.alt}
                    style={{ width: "100%", height: "100%", objectFit: "cover" }}
                    onError={(e) => {
                      e.target.style.display = "none";
                      if (e.target.nextSibling) return;
                      const span = document.createElement("span");
                      span.style.fontSize = "22px";
                      span.textContent = item.type === "img" ? "🖼" : "🎨";
                      e.target.parentElement.appendChild(span);
                    }} />
                )}
              </div>
              {/* Info */}
              <div style={{ flex: 1, minWidth: 0 }}>
                <div style={{ display: "flex", alignItems: "center", gap: 8, marginBottom: 5, flexWrap: "wrap" }}>
                  <span style={{ fontSize: 10, fontWeight: 800, padding: "2px 6px", borderRadius: 4, background: typeBadgeColor, color: "#fff", letterSpacing: 0.5 }}>{typeBadge}</span>
                  {isPlaceholder && <span style={{ fontSize: 10, fontWeight: 700, padding: "2px 6px", borderRadius: 4, background: "#dbeafe", color: "#1d4ed8" }}>NOWY</span>}
                  <span style={{ fontSize: 13, fontWeight: 700, color: "#232323" }}>#{idx + 1} {item.label}</span>
                  {dims && (
                    <span style={{ fontSize: 11, fontWeight: 700, padding: "2px 8px", borderRadius: 5, background: isPlaceholder ? "#ede9fe" : "#e8f5e9", color: isPlaceholder ? "#6d28d9" : "#2e7d32", letterSpacing: 0.3 }}>
                      {isPlaceholder ? `Sugerowane: ${dims}` : dims}
                    </span>
                  )}
                  {!dims && !isPlaceholder && (
                    <span style={{ fontSize: 11, fontWeight: 700, padding: "2px 8px", borderRadius: 5, background: "#fff3e0", color: "#e65100" }}>⚠️ Brak wymiarów</span>
                  )}
                </div>
                {isPlaceholder ? (
                  <div style={{ fontSize: 11, color: "#888", marginBottom: 7 }}>{item.desc}</div>
                ) : (
                  <div style={{ fontSize: 11, color: "#bbb", marginBottom: 7, overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }} title={item.originalSrc}>
                    Obecny: {item.originalSrc.substring(0, 70)}{item.originalSrc.length > 70 ? "…" : ""}
                  </div>
                )}
                <input type="text"
                  placeholder={isPlaceholder ? "Wklej URL zdjęcia do wstawienia (https://...)…" : "Wklej nowy URL obrazu (https://...)…"}
                  value={item.newSrc}
                  onChange={(e) => isPlaceholder ? updatePlaceholder(item.id, e.target.value) : updateImage(item.id, e.target.value)}
                  style={{ width: "100%", padding: "8px 12px", borderRadius: 8, border: `1.5px solid ${item.newSrc.trim() ? "#86efac" : "#e0e0e0"}`, fontSize: 12, fontFamily: "inherit", background: item.newSrc.trim() ? "#f0fdf4" : "#fafafa", transition: "border-color 0.2s" }} />
              </div>
            </div>
          );
        })}
      </div>

      <button onClick={generate} disabled={!hasChanges}
        style={{ width: "100%", padding: "14px", borderRadius: 10, border: "none", background: hasChanges ? "#232323" : "#e0e0e0", color: hasChanges ? "#FCD23A" : "#999", fontSize: 14, fontWeight: 800, cursor: hasChanges ? "pointer" : "not-allowed", fontFamily: "inherit", marginBottom: 16 }}>
        {isPlaceholderMode ? "➕ Wstaw zdjęcia do HTML" : "🔄 Generuj HTML z nowymi obrazami"}
      </button>

      {outputHtml && (
        <div style={{ borderTop: "1px solid #e8e8e8", paddingTop: 20 }}>
          <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: 12 }}>
            <span style={{ fontSize: 14, fontWeight: 700 }}>Wynik</span>
            <div style={{ display: "flex", gap: 6, alignItems: "center" }}>
              <div style={{ display: "flex", gap: 2, background: "#f0f0f0", borderRadius: 8, padding: 3 }}>
                {[["desktop", "🖥"], ["tablet", "⬜"], ["mobile", "📱"]].map(([d, ic]) => (
                  <button key={d} onClick={() => setPreviewDevice(d)}
                    style={{ padding: "4px 8px", borderRadius: 5, border: "none", fontSize: 12, background: previewDevice === d ? "#fff" : "transparent", cursor: "pointer", boxShadow: previewDevice === d ? "0 1px 3px rgba(0,0,0,0.1)" : "none" }}>{ic}</button>
                ))}
              </div>
              <button onClick={copy}
                style={{ padding: "7px 14px", borderRadius: 8, border: "1.5px solid #e0e0e0", background: "#fff", color: "#232323", fontSize: 12, fontWeight: 600, cursor: "pointer", fontFamily: "inherit" }}>
                {copied ? "✓ Skopiowano!" : "📋 Kopiuj HTML"}
              </button>
            </div>
          </div>
          <div style={{ width: iW, maxWidth: "100%", margin: "0 auto", background: "#fff", borderRadius: 10, border: "1px solid #e0e0e0", overflow: "hidden", transition: "width 0.3s ease" }}>
            <div style={{ display: "flex", gap: 6, padding: "8px 12px", background: "#fafafa", borderBottom: "1px solid #eee" }}>
              {["#ff5f57", "#febc2e", "#28c840"].map((c) => (
                <span key={c} style={{ width: 10, height: 10, borderRadius: "50%", background: c }} />
              ))}
            </div>
            <iframe srcDoc={outputHtml} title="Preview" style={{ width: "100%", border: "none", minHeight: 500 }} sandbox="allow-scripts allow-same-origin" />
          </div>
        </div>
      )}
    </div>
  );
}

/* ═══════════════════════════════════════════════
   CMS EDITOR
═══════════════════════════════════════════════ */
function CmsEditor({ html, onSaveHtml }) {
  const [cmsHtml, setCmsHtml] = useState("");
  const [fields, setFields] = useState([]);
  const [groups, setGroups] = useState([]);
  const [openGroups, setOpenGroups] = useState({});
  const [previewDevice, setPreviewDevice] = useState("mobile");
  const [copied, setCopied] = useState(false);
  const debouncedHtml = useDebounce(cmsHtml, 350);

  useEffect(() => {
    if (!html) return;
    const { fields: f, parsedHtml } = parseCmsFromHtml(html);
    const g = groupFieldsBySection(f);
    setFields(f);
    setGroups(g);
    setCmsHtml(parsedHtml);
    const init = {};
    g.forEach((_, i) => { init[i] = true; });
    setOpenGroups(init);
  }, [html]);

  const handleChange = (id, newText) => {
    setFields((prev) => prev.map((f) => f.id === id ? { ...f, text: newText } : f));
    setCmsHtml((prev) => updateCmsField(prev, id, newText));
  };

  const handleCopy = () => {
    navigator.clipboard.writeText(stripCmsIds(cmsHtml));
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const handleSave = () => { if (onSaveHtml) onSaveHtml(stripCmsIds(cmsHtml)); };

  const toggleGroup = (i) => setOpenGroups((p) => ({ ...p, [i]: !p[i] }));

  const iW = previewDevice === "mobile" ? 390 : previewDevice === "tablet" ? 768 : "100%";

  if (!fields.length) return (
    <div style={{ display:"flex",alignItems:"center",justifyContent:"center",height:300,color:"#999" }}>
      ⏳ Parsowanie treści…
    </div>
  );

  return (
    <div style={{ display:"flex",height:"calc(100vh - 66px)",overflow:"hidden" }}>
      {/* LEFT — fields sidebar */}
      <div style={{ width:360,minWidth:360,borderRight:"1px solid #e8e8e8",background:"#fafafa",overflowY:"auto",display:"flex",flexDirection:"column" }}>
        <div style={{ padding:"16px 20px 12px",background:"#fff",borderBottom:"1px solid #e8e8e8",position:"sticky",top:0,zIndex:5 }}>
          <div style={{ fontSize:14,fontWeight:700,color:"#232323",marginBottom:2 }}>Edytuj treść</div>
          <div style={{ fontSize:12,color:"#999" }}>{fields.length} elementów w {groups.length} sekcjach</div>
        </div>

        <div style={{ padding:"12px 14px",flex:1 }}>
          {groups.map((group, gi) => (
            <div key={gi} style={{ marginBottom:10 }}>
              <button onClick={() => toggleGroup(gi)} style={{ width:"100%",display:"flex",alignItems:"center",gap:8,padding:"10px 14px",background:"#fff",border:"1px solid #e8e8e8",borderRadius:10,cursor:"pointer",fontFamily:"inherit",marginBottom:openGroups[gi]?6:0,transition:"border-radius 0.2s" }}>
                <span style={{ fontSize:15 }}>{group.icon}</span>
                <span style={{ fontSize:13,fontWeight:700,color:"#232323",flex:1,textAlign:"left",overflow:"hidden",textOverflow:"ellipsis",whiteSpace:"nowrap" }}>{group.title}</span>
                <span style={{ fontSize:11,color:"#aaa",fontWeight:500,marginRight:4 }}>{group.fields.length}</span>
                <Chevron open={!!openGroups[gi]}/>
              </button>

              {openGroups[gi] && (
                <div style={{ display:"flex",flexDirection:"column",gap:6,paddingLeft:6 }}>
                  {group.fields.map((field) => {
                    const meta = TAG_META[field.tag] || { label:"Element", icon:"?", color:"#64748b", isInput:false };
                    const isLong = field.text.length > 80;
                    return (
                      <div key={field.id} style={{ background:"#fff",border:"1px solid #eee",borderRadius:9,padding:"10px 12px" }}>
                        <div style={{ display:"flex",alignItems:"center",gap:6,marginBottom:6 }}>
                          <span style={{ fontSize:10,fontWeight:800,padding:"2px 6px",borderRadius:5,background:meta.color,color:"#fff",letterSpacing:0.5,flexShrink:0 }}>{meta.icon}</span>
                          <span style={{ fontSize:11,fontWeight:600,color:"#64748b" }}>{meta.label}</span>
                        </div>
                        {meta.isInput && !isLong ? (
                          <input type="text" value={field.text} onChange={(e) => handleChange(field.id, e.target.value)}
                            style={{ width:"100%",padding:"7px 10px",borderRadius:7,border:"1.5px solid #e0e0e0",fontSize:13,fontFamily:"inherit",color:"#232323",background:"#fafafa",outline:"none",transition:"border-color 0.2s",boxSizing:"border-box" }}
                            onFocus={(e) => e.target.style.borderColor="#FCD23A"}
                            onBlur={(e) => e.target.style.borderColor="#e0e0e0"}
                          />
                        ) : (
                          <textarea value={field.text} onChange={(e) => handleChange(field.id, e.target.value)} rows={isLong ? 3 : 2}
                            style={{ width:"100%",padding:"7px 10px",borderRadius:7,border:"1.5px solid #e0e0e0",fontSize:13,fontFamily:"inherit",color:"#232323",background:"#fafafa",outline:"none",resize:"vertical",lineHeight:1.5,transition:"border-color 0.2s",boxSizing:"border-box" }}
                            onFocus={(e) => e.target.style.borderColor="#FCD23A"}
                            onBlur={(e) => e.target.style.borderColor="#e0e0e0"}
                          />
                        )}
                      </div>
                    );
                  })}
                </div>
              )}
            </div>
          ))}

          <div style={{ margin:"8px 0 16px",padding:"10px 12px",background:"#fffbeb",border:"1px solid #fde68a",borderRadius:9,fontSize:11,color:"#92400e",lineHeight:1.5 }}>
            💡 Edycja usuwa formatowanie inline (bold, kursywa). Do zachowania formatowania użyj zakładki <strong>Kod HTML</strong>.
          </div>
        </div>
      </div>

      {/* RIGHT — live preview */}
      <div style={{ flex:1,display:"flex",flexDirection:"column",overflow:"hidden",background:"#F0F0F0" }}>
        <div style={{ display:"flex",alignItems:"center",justifyContent:"space-between",padding:"10px 20px",background:"#fff",borderBottom:"1px solid #e8e8e8",gap:10,flexShrink:0 }}>
          <span style={{ fontSize:13,fontWeight:600,color:"#232323" }}>Podgląd na żywo</span>
          <div style={{ display:"flex",gap:6,alignItems:"center" }}>
            <div style={{ display:"flex",gap:2,background:"#f0f0f0",borderRadius:8,padding:3 }}>
              {[["mobile","📱 Mobile"],["tablet","⬜ Tablet"],["desktop","🖥 Desktop"]].map(([d,ic]) => (
                <button key={d} onClick={() => setPreviewDevice(d)} style={{ padding:"5px 12px",borderRadius:6,border:"none",fontSize:12,fontWeight:600,background:previewDevice===d?"#fff":"transparent",cursor:"pointer",fontFamily:"inherit",boxShadow:previewDevice===d?"0 1px 3px rgba(0,0,0,0.12)":"none",color:previewDevice===d?"#232323":"#888",transition:"all 0.15s" }}>{ic}</button>
              ))}
            </div>
            <button onClick={handleCopy} style={{ padding:"7px 16px",borderRadius:8,border:"1.5px solid #e0e0e0",background:"#fff",color:"#232323",fontSize:12,fontWeight:600,cursor:"pointer",fontFamily:"inherit" }}>{copied?"✓ Skopiowano!":"📋 Kopiuj HTML"}</button>
            <button onClick={handleSave} style={{ padding:"7px 18px",borderRadius:8,border:"none",background:"#FCD23A",color:"#232323",fontSize:12,fontWeight:800,cursor:"pointer",fontFamily:"inherit" }}>💾 Zapisz zmiany</button>
          </div>
        </div>

        <div style={{ flex:1,overflow:"auto",padding:"20px",display:"flex",justifyContent:"center" }}>
          <div style={{ width:iW,maxWidth:"100%",background:"#fff",borderRadius:12,border:"1px solid #e0e0e0",overflow:"hidden",boxShadow:"0 4px 24px rgba(0,0,0,0.08)",transition:"width 0.3s ease",alignSelf:"flex-start" }}>
            <div style={{ display:"flex",gap:6,padding:"8px 14px",background:"#fafafa",borderBottom:"1px solid #eee",alignItems:"center" }}>
              {["#ff5f57","#febc2e","#28c840"].map((c) => <span key={c} style={{ width:10,height:10,borderRadius:"50%",background:c }}/>)}
              <span style={{ fontSize:11,color:"#bbb",marginLeft:6 }}>{iW === "100%" ? "Desktop" : `${iW}px`}</span>
            </div>
            <iframe srcDoc={debouncedHtml} title="CMS Preview" style={{ width:"100%",border:"none",minHeight:"80vh" }} sandbox="allow-scripts allow-same-origin"/>
          </div>
        </div>
      </div>
    </div>
  );
}

/* ═══════════════════════════════════════════════
   MAIN APP
═══════════════════════════════════════════════ */
export default function LandingPageBuilder() {
  const [topTab, setTopTab] = useState("generator");
  const [lang, setLang] = useState("pl");
  const [pageMode, setPageMode] = useState("refresh");
  const [source, setSource] = useState("");
  const [pageUrl, setPageUrl] = useState("");
  const [fetchStatus, setFetchStatus] = useState("idle");
  const [fetchError, setFetchError] = useState("");
  const [fetchedTitle, setFetchedTitle] = useState("");
  const [referenceLp, setReferenceLp] = useState("");
  const [selectedColors, setSelectedColors] = useState(BRAND_COLORS.primary.map((c) => c.hex));
  const [instructions, setInstructions] = useState("");
  const [status, setStatus] = useState("idle");
  const [progress, setProgress] = useState("");
  const [generatedHtml, setGeneratedHtml] = useState("");
  const [error, setError] = useState("");
  const [resultTab, setResultTab] = useState("preview");
  const [previewDevice, setPreviewDevice] = useState("mobile");
  const [copied, setCopied] = useState(false);
  const [codeView, setCodeView] = useState("");
  const iframeRef = useRef(null);
  const [replacerHtml, setReplacerHtml] = useState("");

  const allColors = useMemo(() => [
    ...BRAND_COLORS.primary, ...BRAND_COLORS.companion,
    ...BRAND_COLORS.supplementary, ...BRAND_COLORS.text,
  ], []);

  const toggleColor = (hex) =>
    setSelectedColors((p) => p.includes(hex) ? p.filter((h) => h !== hex) : [...p, hex]);

  useEffect(() => { if (generatedHtml) setCodeView(generatedHtml); }, [generatedHtml]);

  /* FETCH PAGE */
  const handleFetchPage = useCallback(async () => {
    if (!pageUrl.trim()) return;
    setFetchStatus("loading"); setFetchError(""); setFetchedTitle(""); setSource("");
    try {
      const resp = await fetch("/api/fetch-page", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ url: pageUrl }),
      });
      const data = await resp.json();
      if (!resp.ok) throw new Error(data.error);
      setSource(data.html);
      setFetchedTitle(data.title || pageUrl);
      setFetchStatus("done");
    } catch (err) {
      setFetchError(err.message);
      setFetchStatus("error");
    }
  }, [pageUrl]);

  /* GENERATE */
  const handleGenerate = useCallback(async () => {
    const hasContent = source.trim();
    if (!hasContent) return;
    setStatus("loading"); setError(""); setGeneratedHtml(""); setResultTab("preview");

    const steps = ["Analizuję treści…", "Projektuję sekcje…", "Generuję HTML…", "Finalizuję…"];
    let i = 0; setProgress(steps[0]);
    const iv = setInterval(() => { i = Math.min(i + 1, steps.length - 1); setProgress(steps[i]); }, 4000);

    try {
      const selColors = allColors.filter((c) => selectedColors.includes(c.hex));
      const systemPrompt = buildSystemPrompt(lang, selColors);

      let userMsg = "";
      if (pageMode === "refresh") {
        userMsg = `Oto kod źródłowy istniejącej strony. Zachowaj CAŁĄ treść (teksty, ceny, daty, URLe) ale przebuduj design na nowoczesny, zgodny z wytycznymi:\n\n${source}`;
      } else {
        userMsg = `Stwórz nowy landing page na podstawie tych notatek / briefu:\n\n${source}`;
        if (referenceLp.trim()) {
          userMsg += `\n\n---\nOto HTML referencyjnego LP — wzoruj się na UKŁADZIE i ilości tekstu (nie kopiuj treści):\n\n${referenceLp}`;
        }
      }
      if (instructions.trim()) userMsg += `\n\nDodatkowe instrukcje: ${instructions}`;

      const resp = await fetch("/api/generate", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          model: "claude-sonnet-4-20250514",
          max_tokens: 16000,
          system: systemPrompt,
          messages: [{ role: "user", content: userMsg }],
        }),
      });
      clearInterval(iv);
      if (!resp.ok) { const e = await resp.json().catch(() => ({})); throw new Error(e?.error?.message || `API error ${resp.status}`); }
      const data = await resp.json();
      let html = data.content.filter((b) => b.type === "text").map((b) => b.text).join("")
        .replace(/^```html?\n?/i, "").replace(/\n?```$/i, "").trim();
      if (!html.includes("<")) throw new Error("Odpowiedź nie zawiera HTML.");
      setGeneratedHtml(html);
      setStatus("done");
    } catch (err) {
      clearInterval(iv);
      setError(err.message);
      setStatus("error");
    }
    setProgress("");
  }, [source, lang, pageMode, selectedColors, instructions, allColors, referenceLp]);

  const handleDownload = useCallback(() => {
    const html = resultTab === "cms" ? generatedHtml : (codeView || generatedHtml);
    const blob = new Blob([html], { type: "text/html" });
    const a = document.createElement("a");
    a.href = URL.createObjectURL(blob);
    a.download = "landing-page.html";
    a.click();
  }, [generatedHtml, codeView, resultTab]);

  const handleCopyMain = useCallback(() => {
    const html = codeView || generatedHtml;
    navigator.clipboard.writeText(html);
    setCopied(true); setTimeout(() => setCopied(false), 2000);
  }, [generatedHtml, codeView]);

  const handleReset = useCallback(() => {
    setSource(""); setPageUrl(""); setFetchStatus("idle"); setFetchError(""); setFetchedTitle("");
    setStatus("idle"); setGeneratedHtml(""); setError(""); setProgress(""); setCodeView(""); setReferenceLp("");
  }, []);

  const canGenerate = source.trim().length > 0;

  /* ─── RESULT VIEW ─── */
  if (status === "done") {
    const iW = previewDevice === "mobile" ? 390 : previewDevice === "tablet" ? 768 : "100%";

    if (resultTab === "cms") {
      return (
        <div style={{ minHeight:"100vh",fontFamily:"'Funnel Sans',-apple-system,sans-serif",display:"flex",flexDirection:"column" }}>
          <header style={{ background:"#fff",borderBottom:"1px solid #e8e8e8",position:"sticky",top:0,zIndex:50 }}>
            <div style={{ maxWidth:1600,margin:"0 auto",padding:"12px 20px",display:"flex",alignItems:"center",justifyContent:"space-between",gap:10,flexWrap:"wrap" }}>
              <div style={{ display:"flex",alignItems:"center",gap:10 }}>
                <span style={S.logoBadge}>LP</span>
                <span style={{ fontSize:17,fontWeight:800,color:"#232323" }}>Landing Page <span style={S.yt}>Builder</span></span>
              </div>
              <div style={{ display:"flex",gap:4,background:"#f0f0f0",borderRadius:9,padding:3 }}>
                {[["preview","👁 Podgląd"],["cms","🏗️ CMS Edytor"],["code","</> Kod HTML"]].map(([t,l]) => (
                  <TabBtn key={t} active={resultTab===t} onClick={() => setResultTab(t)}>{l}</TabBtn>
                ))}
              </div>
              <div style={{ display:"flex",gap:6 }}>
                <button onClick={handleReset} style={S.btnG}>✕ Nowy</button>
              </div>
            </div>
          </header>
          <CmsEditor html={generatedHtml} onSaveHtml={(h) => { setGeneratedHtml(h); setCodeView(h); }}/>
        </div>
      );
    }

    return (
      <div style={{ minHeight:"100vh",fontFamily:"'Funnel Sans',-apple-system,sans-serif",display:"flex",flexDirection:"column" }}>
        <header style={{ background:"#fff",borderBottom:"1px solid #e8e8e8",position:"sticky",top:0,zIndex:50 }}>
          <div style={{ maxWidth:1600,margin:"0 auto",padding:"12px 20px",display:"flex",alignItems:"center",justifyContent:"space-between",gap:10,flexWrap:"wrap" }}>
            <div style={{ display:"flex",alignItems:"center",gap:10 }}>
              <span style={S.logoBadge}>LP</span>
              <span style={{ fontSize:17,fontWeight:800,color:"#232323" }}>Landing Page <span style={S.yt}>Builder</span></span>
            </div>
            <div style={{ display:"flex",gap:4,background:"#f0f0f0",borderRadius:9,padding:3 }}>
              {[["preview","👁 Podgląd"],["cms","🏗️ CMS Edytor"],["code","</> Kod HTML"]].map(([t,l]) => (
                <TabBtn key={t} active={resultTab===t} onClick={() => setResultTab(t)}>{l}</TabBtn>
              ))}
            </div>
            <div style={{ display:"flex",gap:6,alignItems:"center" }}>
              {resultTab === "preview" && (
                <div style={{ display:"flex",gap:2,background:"#f0f0f0",borderRadius:8,padding:3 }}>
                  {[["mobile","📱"],["tablet","⬜"],["desktop","🖥"]].map(([d,ic]) => (
                    <button key={d} onClick={() => setPreviewDevice(d)} style={{ padding:"5px 10px",borderRadius:6,border:"none",fontSize:13,background:previewDevice===d?"#fff":"transparent",cursor:"pointer",boxShadow:previewDevice===d?"0 1px 3px rgba(0,0,0,0.1)":"none",transition:"all 0.15s" }}>{ic}</button>
                  ))}
                </div>
              )}
              <button onClick={handleCopyMain} style={S.btnOut}>{copied?"✓ Skopiowano!":"📋 Kopiuj HTML"}</button>
              <button onClick={handleDownload} style={S.btnY}>⬇ Pobierz</button>
              <button onClick={handleReset} style={S.btnG}>✕ Nowy</button>
            </div>
          </div>
        </header>

        <main style={{ flex:1,background:"#F0F0F0",padding:"20px",display:"flex",justifyContent:"center" }}>
          {resultTab === "preview" && (
            <div style={{ width:iW,maxWidth:"100%",background:"#fff",borderRadius:14,border:"1px solid #e0e0e0",overflow:"hidden",boxShadow:"0 8px 40px rgba(0,0,0,0.07)",transition:"width 0.3s ease",display:"flex",flexDirection:"column" }}>
              <div style={S.bBar}>
                {["#ff5f57","#febc2e","#28c840"].map((c) => <span key={c} style={{ ...S.dot,background:c }}/>)}
                <span style={{ fontSize:12,color:"#aaa",marginLeft:8,fontWeight:500 }}>Podgląd — {previewDevice}</span>
              </div>
              <iframe ref={iframeRef} srcDoc={generatedHtml} title="Preview" style={{ flex:1,width:"100%",border:"none",minHeight:"calc(100vh - 140px)" }} sandbox="allow-scripts allow-same-origin"/>
            </div>
          )}
          {resultTab === "code" && (
            <div style={{ width:"100%",maxWidth:1100 }}>
              <div style={{ background:"#1e1e2e",borderRadius:14,overflow:"hidden",border:"1px solid #333",boxShadow:"0 8px 40px rgba(0,0,0,0.2)" }}>
                <div style={{ display:"flex",alignItems:"center",justifyContent:"space-between",padding:"10px 16px",background:"#16161e",borderBottom:"1px solid #333" }}>
                  <div style={{ display:"flex",gap:6 }}>{["#ff5f57","#febc2e","#28c840"].map((c) => <span key={c} style={{ width:11,height:11,borderRadius:"50%",background:c }}/>)}</div>
                  <span style={{ fontSize:11,color:"#555",fontFamily:"monospace" }}>landing-page.html</span>
                  <button onClick={handleCopyMain} style={{ padding:"4px 12px",borderRadius:6,border:"1px solid #444",background:"#2a2a3a",color:"#ccc",fontSize:11,cursor:"pointer",fontFamily:"inherit" }}>{copied?"✓":"Kopiuj"}</button>
                </div>
                <textarea value={codeView} onChange={(e) => setCodeView(e.target.value)} spellCheck={false}
                  style={{ width:"100%",minHeight:"calc(100vh - 200px)",padding:20,background:"#1e1e2e",color:"#cdd6f4",border:"none",resize:"vertical",fontSize:12,lineHeight:1.6,fontFamily:"'SF Mono',Menlo,Consolas,monospace",outline:"none",boxSizing:"border-box" }}/>
              </div>
            </div>
          )}
        </main>
      </div>
    );
  }

  /* ─── INPUT VIEW ─── */
  return (
    <div style={{ minHeight:"100vh",background:"#F0F0F0",fontFamily:"'Funnel Sans',-apple-system,sans-serif" }}>
      <div style={{ maxWidth:topTab==="replacer"?1100:720,margin:"0 auto",padding:"44px 20px 60px",width:"100%" }}>

        <div style={{ textAlign:"center",marginBottom:32 }}>
          <h1 style={{ fontSize:34,fontWeight:800,color:"#232323",margin:"0 0 8px",lineHeight:1.2 }}>
            Landing Page <span style={S.yt}>Builder</span>
          </h1>
          <p style={{ fontSize:15,color:"#777",margin:"0 0 20px" }}>Wygeneruj landing page gotowy do wklejenia w Elementor HTML widget</p>
          <div style={{ display:"inline-flex",gap:2,background:"#e8e8e8",borderRadius:10,padding:4 }}>
            {[["generator","🚀 Generator"],["replacer","🖼 Podmiana obrazów"]].map(([t,l]) => (
              <button key={t} onClick={() => setTopTab(t)} style={{ padding:"10px 24px",borderRadius:8,border:"none",fontSize:14,fontWeight:700,cursor:"pointer",fontFamily:"inherit",transition:"all 0.15s",background:topTab===t?"#232323":"transparent",color:topTab===t?"#FCD23A":"#777" }}>{l}</button>
            ))}
          </div>
        </div>

        {/* ═══ GENERATOR ═══ */}
        {topTab === "generator" && (
          <>
            {/* Step 1: Language */}
            <div style={{ ...S.card,marginBottom:12 }}>
              <div style={S.sh}>
                <StepBadge n={1}/>
                <span style={S.st}>Język strony</span>
                <span style={{ marginLeft:"auto",fontSize:11,fontWeight:700,letterSpacing:2,textTransform:"uppercase",color:"#999" }}>
                  {lang==="pl"?"angloville.pl":lang==="en"?"angloville.com":"angloville.it"}
                </span>
              </div>
              <div style={{ display:"flex",gap:8 }}>
                {[["pl","🇵🇱","Polski"],["en","🇬🇧","English"],["it","🇮🇹","Italiano"]].map(([code,flag,label]) => (
                  <button key={code} onClick={() => setLang(code)} style={{ flex:1,position:"relative",display:"flex",flexDirection:"column",alignItems:"center",gap:6,padding:"16px 12px",borderRadius:12,border:`2px solid ${lang===code?"#232323":"#e8e8e8"}`,cursor:"pointer",fontFamily:"inherit",background:lang===code?"#fafafa":"#fff",transition:"all 0.15s" }}>
                    {lang===code && <span style={S.chk}>✓</span>}
                    <span style={{ fontSize:24 }}>{flag}</span>
                    <span style={{ fontSize:13,fontWeight:700,color:"#232323" }}>{label}</span>
                  </button>
                ))}
              </div>
            </div>

            {/* Step 2: Mode */}
            <div style={{ ...S.card,marginBottom:12 }}>
              <div style={S.sh}>
                <StepBadge n={2}/>
                <span style={S.st}>Typ strony</span>
                <span style={{ fontSize:12,color:"#999",marginLeft:"auto" }}>Nowa czy odświeżenie?</span>
              </div>
              <div style={{ display:"grid",gridTemplateColumns:"1fr 1fr",gap:10 }}>
                {[
                  ["refresh","🔄","Odśwież istniejącą","Podaj URL — AI pobierze stronę i przebuduje design zachowując treść"],
                  ["new","✨","Nowa strona","Wklej notatki / brief — AI stworzy stronę od zera"],
                ].map(([mode,icon,title,desc]) => (
                  <button key={mode} onClick={() => setPageMode(mode)} style={{ position:"relative",display:"flex",flexDirection:"column",alignItems:"flex-start",gap:4,padding:"18px",borderRadius:12,border:`2px solid ${pageMode===mode?"#232323":"#e8e8e8"}`,cursor:"pointer",fontFamily:"inherit",background:pageMode===mode?"#fafafa":"#fff",transition:"all 0.15s",textAlign:"left" }}>
                    {pageMode===mode && <span style={S.chk}>✓</span>}
                    <span style={{ fontSize:22 }}>{icon}</span>
                    <span style={{ fontSize:14,fontWeight:700,color:"#232323" }}>{title}</span>
                    <span style={{ fontSize:12,color:"#888",lineHeight:1.4 }}>{desc}</span>
                  </button>
                ))}
              </div>
            </div>

            {/* Step 3: URL or Brief */}
            <div style={{ ...S.card,marginBottom:12 }}>
              <div style={S.sh}>
                <StepBadge n={3}/>
                <span style={S.st}>{pageMode==="refresh"?"URL strony do odświeżenia":"Notatki / brief"}</span>
                <span style={{ fontSize:12,fontWeight:600,color:"#ef4444",marginLeft:4 }}>Wymagane</span>
              </div>

              {pageMode === "refresh" ? (
                <>
                  <div style={{ display:"flex",gap:10,marginBottom:10 }}>
                    <input type="url" value={pageUrl} onChange={(e) => setPageUrl(e.target.value)}
                      onKeyDown={(e) => { if (e.key==="Enter") handleFetchPage(); }}
                      placeholder="https://angloville.pl/junior/"
                      style={{ flex:1,padding:"12px 16px",borderRadius:10,border:`1.5px solid ${fetchStatus==="error"?"#fca5a5":fetchStatus==="done"?"#86efac":"#e0e0e0"}`,fontSize:14,fontFamily:"inherit",background:"#fafafa",color:"#232323",outline:"none",transition:"border-color 0.2s" }}/>
                    <button onClick={handleFetchPage} disabled={!pageUrl.trim()||fetchStatus==="loading"}
                      style={{ padding:"12px 20px",borderRadius:10,border:"none",background:fetchStatus==="loading"?"#e0e0e0":"#232323",color:fetchStatus==="loading"?"#888":"#FCD23A",fontSize:13,fontWeight:800,cursor:(!pageUrl.trim()||fetchStatus==="loading")?"not-allowed":"pointer",fontFamily:"inherit",whiteSpace:"nowrap",minWidth:130 }}>
                      {fetchStatus==="loading" ? (
                        <span style={{ display:"flex",alignItems:"center",gap:8 }}><span style={S.spin}/>Pobieranie…</span>
                      ) : "📥 Pobierz stronę"}
                    </button>
                  </div>

                  {fetchStatus==="done" && source && (
                    <div style={{ display:"flex",alignItems:"center",gap:10,padding:"10px 14px",background:"#f0fdf4",border:"1px solid #86efac",borderRadius:9 }}>
                      <span style={{ fontSize:18 }}>✅</span>
                      <div>
                        <div style={{ fontSize:13,fontWeight:700,color:"#166534" }}>Pobrano pomyślnie</div>
                        <div style={{ fontSize:12,color:"#15803d" }}>{fetchedTitle} · {(source.length/1024).toFixed(0)} KB HTML</div>
                      </div>
                    </div>
                  )}
                  {fetchStatus==="error" && (
                    <div style={{ display:"flex",alignItems:"center",gap:10,padding:"10px 14px",background:"#fff5f5",border:"1px solid #fca5a5",borderRadius:9 }}>
                      <span style={{ fontSize:18 }}>❌</span>
                      <div>
                        <div style={{ fontSize:13,fontWeight:700,color:"#991b1b" }}>Błąd pobierania</div>
                        <div style={{ fontSize:12,color:"#b91c1c" }}>{fetchError}</div>
                      </div>
                    </div>
                  )}
                  {fetchStatus==="idle" && (
                    <div style={{ fontSize:12,color:"#aaa",padding:"2px 4px" }}>Wpisz URL i kliknij "Pobierz stronę" — backend pobierze HTML automatycznie.</div>
                  )}
                </>
              ) : (
                <>
                  <textarea value={source} onChange={(e) => setSource(e.target.value)} rows={8}
                    placeholder={`Wklej notatki, brief, teksty, ceny, terminy…\n\nNp.:\n- Produkt: Angloville Junior Zagranica Malta\n- Wiek: 11-18 lat\n- Termin: 13-27 lipca 2026\n- Cena: od 6 490 zł\n- Co wchodzi: opieka 24/7, 3 posiłki, zakwaterowanie, nauka przez praktykę\n- CTA: "Zapisz dziecko"\n- Sekcje: hero, plan dnia, co wchodzi, cennik, FAQ, formularz`}
                    style={{ ...S.ta,minHeight:200 }}/>
                  <div style={{ marginTop:8,display:"flex",alignItems:"center",gap:6 }}>
                    <span style={{ fontSize:14 }}>💡</span>
                    <span style={{ fontSize:12,color:"#999" }}>Im więcej szczegółów (ceny, daty, co wchodzi), tym lepszy wynik.</span>
                  </div>
                </>
              )}
            </div>

            {/* Step 3b: Reference LP (new mode only) */}
            {pageMode === "new" && (
              <Collapse step={"3b"} title="Referencyjny landing page" tag="Opcjonalne" defaultOpen={false}>
                <p style={{ fontSize:12,color:"#888",marginBottom:12,lineHeight:1.5 }}>
                  Wklej HTML istniejącego LP — AI wzoruje się na jego <strong>układzie i ilości tekstu</strong>, ale wstawia nowe treści z Twojego briefu.
                </p>
                <textarea value={referenceLp} onChange={(e) => setReferenceLp(e.target.value)} rows={5}
                  placeholder="Wklej HTML referencyjnego LP (Ctrl+U na stronie → kopiuj)…"
                  style={{ ...S.ta,minHeight:120,fontSize:12,fontFamily:"monospace" }}/>
              </Collapse>
            )}

            {/* Step 4: Colors */}
            <Collapse step={4} title="Kolory brandowe" tag="Opcjonalne" defaultOpen={true}>
              <p style={{ fontSize:12,color:"#888",marginBottom:14,lineHeight:1.5 }}>Wybierz kolory, które mają być użyte. Domyślnie zaznaczone są kolory podstawowe Angloville.</p>
              {[["GAMA PODSTAWOWA",BRAND_COLORS.primary],["GAMA TOWARZYSZĄCA",BRAND_COLORS.companion],["GAMA UZUPEŁNIAJĄCA",BRAND_COLORS.supplementary],["KOLORY TEKSTOWE",BRAND_COLORS.text]].map(([label,colors]) => (
                <div key={label} style={{ marginBottom:16 }}>
                  <div style={{ fontSize:10,fontWeight:700,letterSpacing:2,textTransform:"uppercase",color:"#999",marginBottom:8 }}>{label}</div>
                  <div style={{ display:"flex",gap:8,flexWrap:"wrap" }}>
                    {colors.map((c) => <ColorSwatch key={c.hex} color={c} selected={selectedColors.includes(c.hex)} onToggle={() => toggleColor(c.hex)}/>)}
                  </div>
                </div>
              ))}
              {selectedColors.length > 0 && (
                <div style={{ marginTop:10,display:"flex",gap:4,flexWrap:"wrap",alignItems:"center" }}>
                  <span style={{ fontSize:12,color:"#999",marginRight:4 }}>Wybrane:</span>
                  {selectedColors.map((hex) => (
                    <span key={hex} style={{ display:"inline-flex",alignItems:"center",gap:5,padding:"3px 10px 3px 6px",borderRadius:6,background:"#f5f5f5",fontSize:11,fontWeight:600,color:"#555" }}>
                      <span style={{ width:14,height:14,borderRadius:4,background:hex,display:"inline-block",border:"1px solid rgba(0,0,0,0.1)" }}/>
                      {hex}
                    </span>
                  ))}
                </div>
              )}
            </Collapse>

            {/* Step 5: Additional instructions */}
            <div style={{ ...S.card,marginBottom:12 }}>
              <div style={{ display:"flex",alignItems:"center",gap:12,marginBottom:14 }}>
                <StepBadge n={5}/>
                <span style={S.st}>Dodatkowe instrukcje</span>
                <span style={{ marginLeft:"auto",fontSize:12,color:"#999" }}>Opcjonalne</span>
              </div>
              <textarea value={instructions} onChange={(e) => setInstructions(e.target.value)} rows={3}
                placeholder="np. Hero ze zdjęciem plaży, duży nagłówek z ceną, timeline z planem dnia, 2 przyciski CTA…"
                style={{ ...S.ta,minHeight:80 }}/>
            </div>

            <div style={{ background:"#fff",borderRadius:12,border:"1px solid #e8e8e8",padding:"14px 18px",marginBottom:14,display:"flex",gap:10,alignItems:"flex-start" }}>
              <span style={{ fontSize:16,marginTop:1 }}>ℹ️</span>
              <div style={{ fontSize:12,color:"#666",lineHeight:1.6 }}>
                <strong style={{ color:"#232323" }}>Wynik gotowy do WordPress:</strong> Bez menu i stopki. Zdjęcia jako placeholdery z dokładnymi wymiarami px. Formularz jako shortcode <code style={{ background:"#f5f5f5",padding:"1px 5px",borderRadius:4 }}>[contact-form-7]</code>. Po wygenerowaniu możesz edytować treści wizualnie w zakładce <strong>🏗️ CMS Edytor</strong>.
              </div>
            </div>

            <button onClick={handleGenerate} disabled={!canGenerate||status==="loading"}
              style={{ width:"100%",padding:"17px 24px",borderRadius:12,border:"none",background:"#232323",color:"#FCD23A",fontSize:16,fontWeight:800,cursor:(!canGenerate||status==="loading")?"not-allowed":"pointer",fontFamily:"inherit",opacity:(!canGenerate||status==="loading")?0.5:1,transition:"opacity 0.2s" }}>
              {status==="loading" ? (
                <span style={{ display:"flex",alignItems:"center",justifyContent:"center",gap:10 }}>
                  <span style={S.spin}/>{progress}
                </span>
              ) : "🚀  Generuj landing page"}
            </button>

            {status==="error" && (
              <div style={{ padding:"14px 18px",borderRadius:10,background:"#fff5f5",border:"1px solid #fecaca",color:"#b91c1c",fontSize:13,marginTop:12 }}>
                <strong>Błąd:</strong> {error}
              </div>
            )}
          </>
        )}

        {/* ═══ REPLACER ═══ */}
        {topTab === "replacer" && (
          <div style={{ display:"grid",gridTemplateColumns:"1fr 1fr",gap:16,alignItems:"start" }}>
            <div style={{ ...S.card,position:"sticky",top:20 }}>
              <div style={{ display:"flex",alignItems:"center",gap:10,marginBottom:12 }}>
                <span style={{ fontSize:20 }}>📄</span>
                <span style={{ fontSize:16,fontWeight:700,color:"#232323" }}>Wklej HTML strony</span>
              </div>
              <p style={{ fontSize:12,color:"#888",marginBottom:12,lineHeight:1.5 }}>
                Wklej gotowy HTML. System znajdzie wszystkie obrazy i pokaże ich wymiary — wklej nowe URLe i wygeneruj zaktualizowany kod.
              </p>
              <textarea value={replacerHtml} onChange={(e) => setReplacerHtml(e.target.value)}
                placeholder="Wklej tutaj cały kod HTML strony…"
                style={{ ...S.ta,minHeight:380,fontSize:11,fontFamily:"'SF Mono',Menlo,monospace" }}/>
              {replacerHtml && (
                <button onClick={() => setReplacerHtml("")} style={{ marginTop:8,padding:"6px 14px",borderRadius:8,border:"1.5px solid #e0e0e0",background:"#fff",color:"#999",fontSize:12,cursor:"pointer",fontFamily:"inherit" }}>✕ Wyczyść</button>
              )}
            </div>
            <ImageReplacer html={replacerHtml}/>
          </div>
        )}
      </div>

      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=Funnel+Sans:wght@300;400;500;600;700;800&display=swap');
        * { box-sizing:border-box; margin:0; padding:0; }
        body { font-family:'Funnel Sans',-apple-system,sans-serif; background:#F0F0F0; }
        @keyframes spin { to { transform:rotate(360deg); } }
        textarea:focus,input:focus { outline:none !important; border-color:#FCD23A !important; box-shadow:0 0 0 3px rgba(252,210,58,0.18) !important; }
        ::-webkit-scrollbar { width:8px; height:8px; }
        ::-webkit-scrollbar-track { background:transparent; }
        ::-webkit-scrollbar-thumb { background:#ccc; border-radius:4px; }
        ::-webkit-scrollbar-thumb:hover { background:#aaa; }
      `}</style>
    </div>
  );
}

/* STYLES */
const S = {
  card: { background:"#fff",borderRadius:14,border:"1px solid #e8e8e8",padding:24 },
  sh: { display:"flex",alignItems:"center",gap:12,marginBottom:18 },
  st: { fontSize:16,fontWeight:700,color:"#232323" },
  ta: { width:"100%",minHeight:160,padding:16,borderRadius:10,border:"1.5px solid #e0e0e0",background:"#fafafa",color:"#232323",fontSize:14,fontFamily:"'Funnel Sans',sans-serif",lineHeight:1.6,resize:"vertical",transition:"border-color 0.2s" },
  yt: { background:"#FCD23A",padding:"2px 12px",borderRadius:7,color:"#232323" },
  chk: { position:"absolute",top:10,right:10,width:22,height:22,borderRadius:"50%",background:"#FCD23A",color:"#232323",fontSize:12,fontWeight:800,display:"flex",alignItems:"center",justifyContent:"center" },
  logoBadge: { display:"inline-flex",alignItems:"center",justifyContent:"center",width:32,height:32,borderRadius:8,background:"#FCD23A",color:"#232323",fontSize:13,fontWeight:800 },
  bBar: { display:"flex",alignItems:"center",gap:8,padding:"10px 16px",background:"#fafafa",borderBottom:"1px solid #eee" },
  dot: { width:11,height:11,borderRadius:"50%",display:"inline-block" },
  spin: { display:"inline-block",width:18,height:18,border:"2.5px solid rgba(252,210,58,0.3)",borderTopColor:"#FCD23A",borderRadius:"50%",animation:"spin 0.8s linear infinite",flexShrink:0 },
  btnY: { padding:"9px 20px",borderRadius:8,border:"none",background:"#FCD23A",color:"#232323",fontSize:13,fontWeight:700,cursor:"pointer",fontFamily:"inherit" },
  btnOut: { padding:"9px 20px",borderRadius:8,border:"1.5px solid #e0e0e0",background:"#fff",color:"#232323",fontSize:13,fontWeight:600,cursor:"pointer",fontFamily:"inherit" },
  btnG: { padding:"9px 16px",borderRadius:8,border:"none",background:"transparent",color:"#999",fontSize:13,fontWeight:600,cursor:"pointer",fontFamily:"inherit" },
};
