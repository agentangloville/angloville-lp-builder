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
   SYSTEM PROMPT
   ═══════════════════════════════════════════════ */
function buildSystemPrompt(lang, selectedColors) {
  const colorList = selectedColors.length
    ? `Use these brand colors in the design:\n${selectedColors.map(c => `- ${c.hex} (${c.name}) — ${c.use}`).join("\n")}`
    : "Use a clean, modern color palette.";

  const langInstruction = {
    pl: "All UI text and content must be in Polish.",
    en: "All UI text and content must be in English.",
    it: "All UI text and content must be in Italian.",
  }[lang];

  return `You are an expert landing page designer for Angloville — a language travel company.

Your task: Build a SINGLE, self-contained HTML landing page ready to paste into WordPress Elementor HTML widget.

## CRITICAL WORDPRESS RULES
- NO <html>, <head>, <body>, <!DOCTYPE> tags — output ONLY the content
- NO top navigation / header menu — WordPress has its own
- NO footer — WordPress has its own
- All CSS must be INLINE on elements or in a single <style> tag at the top
- All images must be inline <img> tags with easy-to-find placeholder comments
- For EVERY image, add a comment like: <!-- IMAGE: hero-banner | wymiar: 1200x600px --> right before the <img> tag
- Use placeholder images: <img src="https://placehold.co/1200x600/232323/FCD23A?text=HERO+1200x600" alt="..." style="width:100%;...">
- The placehold.co URL must show the required dimensions in the image itself
- For the contact form, use ONLY this placeholder: [contact-form-7 id="XXXX" title="Formularz"]
- Wrap the form shortcode in a styled container div

## DESIGN SYSTEM
${colorList}

Font: Use Google Fonts 'Funnel Sans' (import via <link> tag at the very top of output).
Headings: bold, large, dark color.
Body text: #475569 or #232323, line-height 1.7.

## LAYOUT
- Max content width: 1140px, centered with margin: 0 auto
- Sections alternate white and light gray (#F5F5F5) backgrounds
- Cards: subtle shadows, rounded corners 14px
- CTA buttons: brand yellow (#FCD23A) background with dark text, or dark bg with yellow text
- Mobile responsive using flexbox/grid, stack on <768px

## COMPONENTS
- Hero: full-width background image with gradient overlay, big headline, CTA button
- Benefits/Features: icon + text cards in grid
- Timeline/Itinerary: numbered steps with descriptions (if travel product)
- Pricing: cards side by side with "recommended" badge option
- Inclusions: ✓ and ✗ lists
- FAQ: <details><summary> accordion
- CTA sections: full-width colored background, centered text + button
- Stats bar: big numbers in a row (opinions, years, participants)
- Image gallery: CSS grid with rounded corners

## IMAGE PLACEHOLDERS
For each image slot, output:
<!-- IMAGE: [description] | wymiar: [width]x[height]px | zmień src poniżej -->
<img src="https://placehold.co/[width]x[height]/232323/FCD23A?text=[description]+[width]x[height]" alt="[description]" style="width:100%; height:auto; border-radius:14px; display:block;">

This makes it trivial to find and replace images in the HTML.

## LANGUAGE
${langInstruction}

## OUTPUT FORMAT
Return ONLY the HTML code. No markdown fences, no explanation, no preamble.
Start directly with <link> or <style> tag, then the content divs.`;
}

/* ═══════════════════════════════════════════════
   PARSE IMAGES FROM HTML
   ═══════════════════════════════════════════════ */
function parseImagesFromHtml(html) {
  const imgs = [];
  const regex = /<img\s[^>]*>/gi;
  let match;
  while ((match = regex.exec(html)) !== null) {
    const tag = match[0];
    const srcMatch = tag.match(/src=["']([^"']+)["']/i);
    const altMatch = tag.match(/alt=["']([^"']*?)["']/i);
    const widthMatch = tag.match(/width[:=]["']?\s*(\d+)/i);
    const heightMatch = tag.match(/height[:=]["']?\s*(\d+)/i);
    const styleMatch = tag.match(/style=["']([^"']*?)["']/i);
    let w = widthMatch ? widthMatch[1] : null;
    let h = heightMatch ? heightMatch[1] : null;
    if (!w && styleMatch) {
      const sw = styleMatch[1].match(/width\s*:\s*(\d+)px/);
      if (sw) w = sw[1];
    }
    if (!h && styleMatch) {
      const sh = styleMatch[1].match(/height\s*:\s*(\d+)px/);
      if (sh) h = sh[1];
    }
    // try to extract from placehold.co URL
    if (srcMatch) {
      const phMatch = srcMatch[1].match(/placehold\.co\/(\d+)x(\d+)/);
      if (phMatch) { w = w || phMatch[1]; h = h || phMatch[2]; }
    }
    // try to get comment above
    const beforeTag = html.substring(Math.max(0, match.index - 200), match.index);
    const commentMatch = beforeTag.match(/<!--\s*IMAGE:\s*([^|]*?)(?:\|[^>]*)?\s*-->\s*$/i);
    const label = commentMatch ? commentMatch[1].trim() : (altMatch ? altMatch[1] : `Obraz ${imgs.length + 1}`);
    if (srcMatch) {
      imgs.push({
        id: imgs.length,
        originalSrc: srcMatch[1],
        newSrc: "",
        alt: altMatch ? altMatch[1] : "",
        label,
        width: w || "auto",
        height: h || "auto",
        fullTag: tag,
      });
    }
  }
  return imgs;
}

/* ═══════════════════════════════════════════════
   UI ATOMS
   ═══════════════════════════════════════════════ */
function StepBadge({ n }) {
  return (
    <span style={{
      display: "inline-flex", alignItems: "center", justifyContent: "center",
      width: 28, height: 28, borderRadius: "50%", background: "#FCD23A",
      color: "#232323", fontSize: 13, fontWeight: 800, flexShrink: 0,
    }}>{n}</span>
  );
}

function Chevron({ open }) {
  return (
    <svg width="20" height="20" viewBox="0 0 20 20" fill="none"
      style={{ transition: "transform 0.25s ease", transform: open ? "rotate(180deg)" : "rotate(0)" }}>
      <path d="M5 7.5L10 12.5L15 7.5" stroke="#94a3b8" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
    </svg>
  );
}

function Collapse({ step, title, tag, tagColor, defaultOpen, children }) {
  const [open, setOpen] = useState(defaultOpen ?? false);
  return (
    <div style={{ background: "#fff", borderRadius: 14, border: "1px solid #e8e8e8", overflow: "hidden", marginBottom: 12 }}>
      <button onClick={() => setOpen(!open)}
        style={{ width: "100%", display: "flex", alignItems: "center", gap: 12, padding: "18px 24px", background: "none", border: "none", cursor: "pointer", fontFamily: "inherit" }}>
        <StepBadge n={step} />
        <span style={{ fontSize: 16, fontWeight: 700, color: "#232323" }}>{title}</span>
        {tag && <span style={{ fontSize: 12, fontWeight: 600, color: tagColor || "#428BCA", marginLeft: 4 }}>{tag}</span>}
        <span style={{ marginLeft: "auto" }}><Chevron open={open} /></span>
      </button>
      <div style={{
        maxHeight: open ? 5000 : 0, opacity: open ? 1 : 0, overflow: "hidden",
        transition: "max-height 0.35s ease, opacity 0.25s ease, padding 0.3s ease",
        padding: open ? "0 24px 24px" : "0 24px 0",
      }}>{children}</div>
    </div>
  );
}

function ColorSwatch({ color, selected, onToggle }) {
  return (
    <button onClick={onToggle} title={`${color.name}\n${color.use}`} style={{
      width: 42, height: 42, borderRadius: 10, border: selected ? "3px solid #232323" : "2px solid #e0e0e0",
      background: color.hex, cursor: "pointer", position: "relative",
      boxShadow: selected ? "0 0 0 2px #FCD23A" : "none", transition: "all 0.15s", flexShrink: 0,
    }}>
      {selected && <span style={{
        position: "absolute", top: -4, right: -4, width: 16, height: 16, borderRadius: "50%",
        background: "#232323", color: "#FCD23A", fontSize: 10, fontWeight: 800,
        display: "flex", alignItems: "center", justifyContent: "center",
      }}>✓</span>}
    </button>
  );
}

function TabButton({ active, children, onClick }) {
  return (
    <button onClick={onClick} style={{
      padding: "8px 16px", borderRadius: 8, border: "none", fontSize: 13, fontWeight: 600,
      cursor: "pointer", fontFamily: "inherit", transition: "all 0.15s",
      background: active ? "#232323" : "transparent", color: active ? "#FCD23A" : "#777",
    }}>{children}</button>
  );
}

/* ═══════════════════════════════════════════════
   IMAGE REPLACER PANEL
   ═══════════════════════════════════════════════ */
function ImageReplacer({ html, onHtmlUpdate }) {
  const [images, setImages] = useState([]);
  const [outputHtml, setOutputHtml] = useState("");
  const [copied, setCopied] = useState(false);
  const [previewDevice, setPreviewDevice] = useState("desktop");
  const iframeRef = useRef(null);

  useEffect(() => {
    if (html) {
      setImages(parseImagesFromHtml(html));
      setOutputHtml("");
    }
  }, [html]);

  const updateImageSrc = (id, newSrc) => {
    setImages(prev => prev.map(img => img.id === id ? { ...img, newSrc } : img));
  };

  const generateUpdatedHtml = () => {
    let updated = html;
    images.forEach(img => {
      if (img.newSrc.trim()) {
        updated = updated.split(img.originalSrc).join(img.newSrc.trim());
      }
    });
    setOutputHtml(updated);
    if (onHtmlUpdate) onHtmlUpdate(updated);
  };

  const handleCopy = () => {
    navigator.clipboard.writeText(outputHtml || html);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const hasChanges = images.some(i => i.newSrc.trim());
  const iW = previewDevice === "mobile" ? 390 : previewDevice === "tablet" ? 768 : "100%";

  return (
    <div>
      {images.length === 0 ? (
        <div style={{ padding: 40, textAlign: "center", color: "#999" }}>
          <span style={{ fontSize: 40, display: "block", marginBottom: 12 }}>🖼</span>
          Wklej HTML po lewej — tutaj pojawią się obrazy do podmiany
        </div>
      ) : (
        <>
          <div style={{ fontSize: 12, color: "#888", marginBottom: 16, padding: "0 4px" }}>
            Znaleziono <strong style={{ color: "#232323" }}>{images.length}</strong> obrazów. Wklej nowe URLe i kliknij „Generuj HTML".
          </div>

          <div style={{ display: "flex", flexDirection: "column", gap: 12, marginBottom: 20 }}>
            {images.map((img, idx) => (
              <div key={img.id} style={{
                background: "#fff", border: "1px solid #e8e8e8", borderRadius: 12,
                padding: 16, display: "flex", gap: 14, alignItems: "flex-start",
              }}>
                {/* Thumbnail */}
                <div style={{
                  width: 100, minWidth: 100, height: 70, borderRadius: 8, overflow: "hidden",
                  background: "#f0f0f0", border: "1px solid #e0e0e0", flexShrink: 0,
                  display: "flex", alignItems: "center", justifyContent: "center",
                }}>
                  <img
                    src={img.newSrc.trim() || img.originalSrc}
                    alt={img.alt}
                    style={{ width: "100%", height: "100%", objectFit: "cover" }}
                    onError={e => { e.target.style.display = "none"; e.target.parentElement.innerHTML = '<span style="font-size:24px">🖼</span>'; }}
                  />
                </div>

                {/* Info + input */}
                <div style={{ flex: 1, minWidth: 0 }}>
                  <div style={{ display: "flex", alignItems: "center", gap: 8, marginBottom: 6, flexWrap: "wrap" }}>
                    <span style={{ fontSize: 13, fontWeight: 700, color: "#232323" }}>#{idx + 1} {img.label}</span>
                    <span style={{
                      fontSize: 10, fontWeight: 700, padding: "2px 8px", borderRadius: 5,
                      background: "#f0f0f0", color: "#666", letterSpacing: 0.5,
                    }}>{img.width}×{img.height}px</span>
                  </div>

                  <div style={{
                    fontSize: 11, color: "#999", marginBottom: 8,
                    overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap", maxWidth: "100%",
                  }} title={img.originalSrc}>
                    Obecny: {img.originalSrc}
                  </div>

                  <input
                    type="text" placeholder="Wklej nowy URL obrazu..."
                    value={img.newSrc}
                    onChange={e => updateImageSrc(img.id, e.target.value)}
                    style={{
                      width: "100%", padding: "8px 12px", borderRadius: 8,
                      border: "1.5px solid #e0e0e0", fontSize: 12, fontFamily: "'Funnel Sans', sans-serif",
                      background: img.newSrc.trim() ? "#f0fdf4" : "#fafafa",
                      transition: "border-color 0.2s",
                    }}
                  />
                </div>
              </div>
            ))}
          </div>

          {/* Generate button */}
          <button
            onClick={generateUpdatedHtml}
            disabled={!hasChanges}
            style={{
              width: "100%", padding: "14px 24px", borderRadius: 10, border: "none",
              background: hasChanges ? "#232323" : "#ccc", color: hasChanges ? "#FCD23A" : "#888",
              fontSize: 14, fontWeight: 800, cursor: hasChanges ? "pointer" : "not-allowed",
              fontFamily: "inherit", marginBottom: 16, transition: "all 0.2s",
            }}
          >
            🔄  Generuj HTML z nowymi obrazami
          </button>

          {/* Output section */}
          {outputHtml && (
            <div style={{ borderTop: "1px solid #e8e8e8", paddingTop: 20 }}>
              <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: 12 }}>
                <span style={{ fontSize: 14, fontWeight: 700, color: "#232323" }}>Wynik</span>
                <div style={{ display: "flex", gap: 8, alignItems: "center" }}>
                  <div style={{ display: "flex", gap: 2, background: "#f0f0f0", borderRadius: 8, padding: 3 }}>
                    {[["desktop", "🖥"], ["tablet", "⬜"], ["mobile", "📱"]].map(([d, ic]) => (
                      <button key={d} onClick={() => setPreviewDevice(d)} style={{
                        padding: "4px 8px", borderRadius: 5, border: "none", fontSize: 12,
                        background: previewDevice === d ? "#fff" : "transparent", cursor: "pointer",
                        boxShadow: previewDevice === d ? "0 1px 3px rgba(0,0,0,0.1)" : "none",
                      }}>{ic}</button>
                    ))}
                  </div>
                  <button onClick={handleCopy} style={{
                    padding: "7px 16px", borderRadius: 8, border: "1.5px solid #e0e0e0",
                    background: "#fff", color: "#232323", fontSize: 12, fontWeight: 600,
                    cursor: "pointer", fontFamily: "inherit",
                  }}>{copied ? "✓ Skopiowano!" : "📋 Kopiuj HTML"}</button>
                </div>
              </div>

              {/* Preview */}
              <div style={{
                width: iW, maxWidth: "100%", margin: "0 auto", background: "#fff",
                borderRadius: 10, border: "1px solid #e0e0e0", overflow: "hidden",
                transition: "width 0.3s ease",
              }}>
                <div style={{
                  display: "flex", gap: 6, padding: "8px 12px",
                  background: "#fafafa", borderBottom: "1px solid #eee",
                }}>
                  <span style={{ width: 10, height: 10, borderRadius: "50%", background: "#ff5f57" }} />
                  <span style={{ width: 10, height: 10, borderRadius: "50%", background: "#febc2e" }} />
                  <span style={{ width: 10, height: 10, borderRadius: "50%", background: "#28c840" }} />
                </div>
                <iframe ref={iframeRef} srcDoc={outputHtml} title="Preview"
                  style={{ width: "100%", border: "none", minHeight: 500 }}
                  sandbox="allow-scripts allow-same-origin" />
              </div>
            </div>
          )}
        </>
      )}
    </div>
  );
}

/* ═══════════════════════════════════════════════
   MAIN APP
   ═══════════════════════════════════════════════ */
export default function LandingPageBuilder() {
  // Top-level mode
  const [topTab, setTopTab] = useState("generator"); // generator | replacer

  // Generator state
  const [lang, setLang] = useState("pl");
  const [pageMode, setPageMode] = useState("refresh");
  const [source, setSource] = useState("");
  const [referenceLp, setReferenceLp] = useState("");
  const [selectedColors, setSelectedColors] = useState(BRAND_COLORS.primary.map(c => c.hex));
  const [instructions, setInstructions] = useState("");
  const [status, setStatus] = useState("idle");
  const [progress, setProgress] = useState("");
  const [generatedHtml, setGeneratedHtml] = useState("");
  const [error, setError] = useState("");

  // Result view state
  const [resultTab, setResultTab] = useState("preview"); // preview | code | editor
  const [previewDevice, setPreviewDevice] = useState("desktop");
  const [copied, setCopied] = useState(false);
  const [editableHtml, setEditableHtml] = useState("");
  const iframeRef = useRef(null);
  const editorRef = useRef(null);

  // Replacer state
  const [replacerHtml, setReplacerHtml] = useState("");

  const allColors = useMemo(() => [
    ...BRAND_COLORS.primary, ...BRAND_COLORS.companion,
    ...BRAND_COLORS.supplementary, ...BRAND_COLORS.text,
  ], []);

  const toggleColor = (hex) => {
    setSelectedColors(prev => prev.includes(hex) ? prev.filter(h => h !== hex) : [...prev, hex]);
  };

  useEffect(() => {
    if (generatedHtml) setEditableHtml(generatedHtml);
  }, [generatedHtml]);

  /* ─── GENERATE ─── */
  const handleGenerate = useCallback(async () => {
    if (!source.trim()) return;
    setStatus("loading"); setError(""); setGeneratedHtml(""); setResultTab("preview");

    const steps = ["Analizuję treści...", "Projektuję sekcje...", "Generuję kod HTML...", "Finalizuję..."];
    let i = 0; setProgress(steps[0]);
    const iv = setInterval(() => { i++; if (i < steps.length) setProgress(steps[i]); }, 4000);

    try {
      const selColors = allColors.filter(c => selectedColors.includes(c.hex));
      const systemPrompt = buildSystemPrompt(lang, selColors);

      let userMsg = "";
      if (pageMode === "refresh") {
        userMsg = `Oto kod źródłowy istniejącej strony. Zachowaj CAŁĄ treść (teksty, ceny, daty, URLe) ale przebuduj design na nowoczesny, zgodny z wytycznymi:\n\n${source}`;
      } else {
        userMsg = `Stwórz nowy landing page na podstawie tych notatek / briefu:\n\n${source}`;
        if (referenceLp.trim()) {
          userMsg += `\n\n---\n\nOto HTML referencyjnego landing page. Wzoruj się na jego UKŁADZIE i ILOŚCI TEKSTU (nie kopiuj treści, tylko strukturę sekcji):\n\n${referenceLp}`;
        }
      }
      if (instructions) userMsg += `\n\nDodatkowe instrukcje: ${instructions}`;

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
      if (!resp.ok) {
        const e = await resp.json().catch(() => ({}));
        throw new Error(e?.error?.message || `API error ${resp.status}`);
      }

      const data = await resp.json();
      let html = data.content.filter(b => b.type === "text").map(b => b.text).join("")
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

  const handleDownload = useCallback((html) => {
    const blob = new Blob([html || generatedHtml], { type: "text/html" });
    const a = document.createElement("a");
    a.href = URL.createObjectURL(blob);
    a.download = "landing-page.html";
    a.click();
  }, [generatedHtml]);

  const handleCopy = useCallback((html) => {
    navigator.clipboard.writeText(html || generatedHtml);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  }, [generatedHtml]);

  const handleReset = useCallback(() => {
    setSource(""); setStatus("idle"); setGeneratedHtml(""); setError(""); setProgress("");
    setEditableHtml(""); setReferenceLp("");
  }, []);

  const applyEditorChanges = useCallback(() => {
    setGeneratedHtml(editableHtml);
    setResultTab("preview");
  }, [editableHtml]);

  const currentHtml = resultTab === "editor" ? editableHtml : generatedHtml;

  /* ═══════════════════════════════════════════════
     RESULT VIEW
     ═══════════════════════════════════════════════ */
  if (status === "done") {
    const iW = previewDevice === "mobile" ? 390 : previewDevice === "tablet" ? 768 : "100%";
    return (
      <div style={S.page}>
        {/* Header */}
        <header style={S.resHeader}>
          <div style={S.resHeaderInner}>
            <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
              <span style={S.logoBadge}>LP</span>
              <span style={{ fontSize: 18, fontWeight: 800, color: "#232323" }}>
                Landing Page <span style={S.yt}>Builder</span>
              </span>
            </div>
            <div style={{ display: "flex", gap: 6, flexWrap: "wrap", alignItems: "center" }}>
              {/* Result tabs */}
              <div style={{ display: "flex", gap: 2, background: "#f0f0f0", borderRadius: 8, padding: 3 }}>
                <TabButton active={resultTab === "preview"} onClick={() => setResultTab("preview")}>👁 Podgląd</TabButton>
                <TabButton active={resultTab === "code"} onClick={() => setResultTab("code")}>{"</>"} Kod HTML</TabButton>
                <TabButton active={resultTab === "editor"} onClick={() => setResultTab("editor")}>✏️ Edytor</TabButton>
              </div>

              {/* Device switcher — only in preview */}
              {resultTab === "preview" && (
                <div style={{ display: "flex", gap: 2, background: "#f0f0f0", borderRadius: 8, padding: 3 }}>
                  {[["desktop", "🖥"], ["tablet", "⬜"], ["mobile", "📱"]].map(([d, ic]) => (
                    <button key={d} onClick={() => setPreviewDevice(d)}
                      style={previewDevice === d ? S.pillAct : S.pillBtn}>{ic}</button>
                  ))}
                </div>
              )}

              <button onClick={() => handleCopy(currentHtml)} style={S.btnOut}>
                {copied ? "✓ Skopiowano!" : "📋 Kopiuj"}
              </button>
              <button onClick={() => handleDownload(currentHtml)} style={S.btnY}>⬇ Pobierz</button>
              <button onClick={handleReset} style={S.btnG}>✕ Nowy</button>
            </div>
          </div>
        </header>

        <main style={{ flex: 1, display: "flex", justifyContent: "center", padding: "24px 20px", background: "#F0F0F0" }}>
          {/* PREVIEW TAB */}
          {resultTab === "preview" && (
            <div style={{
              width: iW, maxWidth: "100%", background: "#fff", borderRadius: 14,
              border: "1px solid #e0e0e0", overflow: "hidden", display: "flex", flexDirection: "column",
              boxShadow: "0 8px 40px rgba(0,0,0,0.07)", transition: "width 0.3s ease", margin: "0 auto",
            }}>
              <div style={S.bBar}>
                <span style={{ ...S.dot, background: "#ff5f57" }} />
                <span style={{ ...S.dot, background: "#febc2e" }} />
                <span style={{ ...S.dot, background: "#28c840" }} />
                <span style={{ fontSize: 12, color: "#aaa", marginLeft: 10, fontWeight: 500 }}>Podgląd — gotowe do Elementora</span>
              </div>
              <iframe ref={iframeRef} srcDoc={generatedHtml} title="Preview"
                style={{ flex: 1, width: "100%", border: "none", minHeight: "calc(100vh - 150px)" }}
                sandbox="allow-scripts allow-same-origin" />
            </div>
          )}

          {/* CODE TAB */}
          {resultTab === "code" && (
            <div style={{ width: "100%", maxWidth: 1100, margin: "0 auto" }}>
              <div style={{
                background: "#1e1e2e", borderRadius: 14, overflow: "hidden",
                border: "1px solid #333", boxShadow: "0 8px 40px rgba(0,0,0,0.2)",
              }}>
                <div style={{
                  display: "flex", alignItems: "center", justifyContent: "space-between",
                  padding: "10px 16px", background: "#16161e", borderBottom: "1px solid #333",
                }}>
                  <div style={{ display: "flex", gap: 6 }}>
                    <span style={{ width: 11, height: 11, borderRadius: "50%", background: "#ff5f57" }} />
                    <span style={{ width: 11, height: 11, borderRadius: "50%", background: "#febc2e" }} />
                    <span style={{ width: 11, height: 11, borderRadius: "50%", background: "#28c840" }} />
                  </div>
                  <span style={{ fontSize: 11, color: "#666", fontFamily: "monospace" }}>landing-page.html</span>
                  <button onClick={() => handleCopy(generatedHtml)} style={{
                    padding: "4px 12px", borderRadius: 6, border: "1px solid #444",
                    background: "#2a2a3a", color: "#ccc", fontSize: 11, cursor: "pointer", fontFamily: "inherit",
                  }}>{copied ? "✓" : "Kopiuj"}</button>
                </div>
                <pre style={{
                  padding: 20, margin: 0, color: "#cdd6f4", fontSize: 12,
                  lineHeight: 1.6, fontFamily: "'SF Mono', Menlo, Consolas, monospace",
                  overflow: "auto", maxHeight: "calc(100vh - 200px)", whiteSpace: "pre-wrap",
                  wordBreak: "break-all",
                }}>{generatedHtml}</pre>
              </div>
            </div>
          )}

          {/* EDITOR TAB */}
          {resultTab === "editor" && (
            <div style={{ width: "100%", maxWidth: 1100, margin: "0 auto", display: "flex", flexDirection: "column", gap: 12 }}>
              <div style={{
                display: "flex", alignItems: "center", justifyContent: "space-between",
                background: "#fff", padding: "12px 20px", borderRadius: 10, border: "1px solid #e8e8e8",
              }}>
                <span style={{ fontSize: 13, color: "#666" }}>
                  ✏️ Edytuj HTML bezpośrednio. Kliknij „Zastosuj" aby odświeżyć podgląd.
                </span>
                <div style={{ display: "flex", gap: 8 }}>
                  <button onClick={() => { setEditableHtml(generatedHtml); }} style={{
                    padding: "7px 14px", borderRadius: 8, border: "1.5px solid #e0e0e0",
                    background: "#fff", color: "#666", fontSize: 12, fontWeight: 600,
                    cursor: "pointer", fontFamily: "inherit",
                  }}>↺ Reset</button>
                  <button onClick={applyEditorChanges} style={{
                    padding: "7px 18px", borderRadius: 8, border: "none",
                    background: "#232323", color: "#FCD23A", fontSize: 12, fontWeight: 800,
                    cursor: "pointer", fontFamily: "inherit",
                  }}>✓ Zastosuj zmiany</button>
                </div>
              </div>
              <div style={{
                borderRadius: 14, overflow: "hidden", border: "1px solid #333",
                background: "#1e1e2e", boxShadow: "0 8px 40px rgba(0,0,0,0.2)",
              }}>
                <textarea
                  ref={editorRef}
                  value={editableHtml}
                  onChange={e => setEditableHtml(e.target.value)}
                  spellCheck={false}
                  style={{
                    width: "100%", minHeight: "calc(100vh - 250px)", padding: 20,
                    background: "#1e1e2e", color: "#cdd6f4", border: "none", resize: "vertical",
                    fontSize: 12, lineHeight: 1.6, fontFamily: "'SF Mono', Menlo, Consolas, monospace",
                    outline: "none",
                  }}
                />
              </div>
            </div>
          )}
        </main>
      </div>
    );
  }

  /* ═══════════════════════════════════════════════
     INPUT VIEW
     ═══════════════════════════════════════════════ */
  return (
    <div style={S.page}>
      <div style={{ ...S.container, maxWidth: topTab === "replacer" ? 1100 : 720 }}>
        {/* Title + top tabs */}
        <div style={{ textAlign: "center", marginBottom: 32 }}>
          <h1 style={S.title}>Landing Page <span style={S.yt}>Builder</span></h1>
          <p style={{ ...S.sub, marginBottom: 20 }}>Wygeneruj landing page gotowy do wklejenia w Elementor HTML widget</p>

          <div style={{ display: "inline-flex", gap: 2, background: "#e8e8e8", borderRadius: 10, padding: 4 }}>
            <button onClick={() => setTopTab("generator")} style={{
              padding: "10px 24px", borderRadius: 8, border: "none", fontSize: 14, fontWeight: 700,
              cursor: "pointer", fontFamily: "inherit", transition: "all 0.15s",
              background: topTab === "generator" ? "#232323" : "transparent",
              color: topTab === "generator" ? "#FCD23A" : "#777",
            }}>🚀 Generator</button>
            <button onClick={() => setTopTab("replacer")} style={{
              padding: "10px 24px", borderRadius: 8, border: "none", fontSize: 14, fontWeight: 700,
              cursor: "pointer", fontFamily: "inherit", transition: "all 0.15s",
              background: topTab === "replacer" ? "#232323" : "transparent",
              color: topTab === "replacer" ? "#FCD23A" : "#777",
            }}>🖼 Podmiana obrazów</button>
          </div>
        </div>

        {/* ═══ GENERATOR TAB ═══ */}
        {topTab === "generator" && (
          <>
            {/* Step 1: Language */}
            <div style={{ ...S.card, marginBottom: 12 }}>
              <div style={S.sh}>
                <StepBadge n={1} />
                <span style={S.st}>Język strony</span>
                <span style={{ marginLeft: "auto", fontSize: 11, fontWeight: 700, letterSpacing: 2, textTransform: "uppercase", color: "#999" }}>
                  {lang === "pl" ? "angloville.pl" : lang === "en" ? "angloville.com" : "angloville.it"}
                </span>
              </div>
              <div style={{ display: "flex", gap: 8 }}>
                {[["pl", "🇵🇱", "Polski"], ["en", "🇬🇧", "English"], ["it", "🇮🇹", "Italiano"]].map(([code, flag, label]) => (
                  <button key={code} onClick={() => setLang(code)} style={{
                    ...S.langCard, borderColor: lang === code ? "#232323" : "#e8e8e8",
                    background: lang === code ? "#fafafa" : "#fff",
                  }}>
                    {lang === code && <span style={S.chk}>✓</span>}
                    <span style={{ fontSize: 24 }}>{flag}</span>
                    <span style={{ fontSize: 13, fontWeight: 700, color: "#232323" }}>{label}</span>
                  </button>
                ))}
              </div>
            </div>

            {/* Step 2: Mode */}
            <div style={{ ...S.card, marginBottom: 12 }}>
              <div style={S.sh}>
                <StepBadge n={2} />
                <span style={S.st}>Typ strony</span>
                <span style={{ fontSize: 12, color: "#999", marginLeft: "auto" }}>Nowa czy odświeżenie?</span>
              </div>
              <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 10 }}>
                <button onClick={() => setPageMode("refresh")} style={{
                  ...S.modeCard, borderColor: pageMode === "refresh" ? "#232323" : "#e8e8e8",
                  background: pageMode === "refresh" ? "#fafafa" : "#fff",
                }}>
                  {pageMode === "refresh" && <span style={S.chk}>✓</span>}
                  <span style={{ fontSize: 22 }}>🔄</span>
                  <span style={{ fontSize: 14, fontWeight: 700, color: "#232323" }}>Odśwież istniejącą</span>
                  <span style={{ fontSize: 12, color: "#888", lineHeight: 1.4 }}>Wklej kod źródłowy — AI przebuduje design zachowując treść</span>
                </button>
                <button onClick={() => setPageMode("new")} style={{
                  ...S.modeCard, borderColor: pageMode === "new" ? "#232323" : "#e8e8e8",
                  background: pageMode === "new" ? "#fafafa" : "#fff",
                }}>
                  {pageMode === "new" && <span style={S.chk}>✓</span>}
                  <span style={{ fontSize: 22 }}>✨</span>
                  <span style={{ fontSize: 14, fontWeight: 700, color: "#232323" }}>Nowa strona</span>
                  <span style={{ fontSize: 12, color: "#888", lineHeight: 1.4 }}>Wklej notatki / brief — AI stworzy stronę od zera</span>
                </button>
              </div>
            </div>

            {/* Step 3: Source / Brief */}
            <div style={{ ...S.card, marginBottom: 12 }}>
              <div style={S.sh}>
                <StepBadge n={3} />
                <span style={S.st}>{pageMode === "refresh" ? "Kod źródłowy" : "Notatki / brief"}</span>
                <span style={{ fontSize: 12, fontWeight: 600, color: "#ef4444", marginLeft: 4 }}>Wymagane</span>
              </div>
              <textarea value={source} onChange={e => setSource(e.target.value)}
                placeholder={pageMode === "refresh"
                  ? "Otwórz stronę → Ctrl+U (view-source) → Ctrl+A → Ctrl+C → Wklej tutaj..."
                  : "Wklej notatki z Google Docs, brief produktu, opis sekcji, teksty, ceny, terminy...\n\nnp.:\n- Nagłówek: Kalifornia 18-40\n- Opis: 14 dni językowej immersji...\n- Cena: 17 449 zł (pokój 2os)\n- Termin: 13-27 września 2026\n- Sekcje: hero, plan podróży, cennik, FAQ, formularz"}
                style={S.ta} disabled={status === "loading"} />
              <div style={S.tipRow}>
                <span style={{ fontSize: 14 }}>💡</span>
                <span style={{ fontSize: 12, color: "#999" }}>
                  {pageMode === "refresh"
                    ? "Ctrl+U na stronie → zaznacz wszystko → wklej. AI zachowa całą treść."
                    : "Im więcej szczegółów, tym lepszy wynik. Wklej teksty, ceny, daty."}
                </span>
              </div>
            </div>

            {/* Step 3b: Reference LP (only for new page) */}
            {pageMode === "new" && (
              <Collapse step={"3b"} title="Referencyjny landing page" tag="Optional" defaultOpen={false}>
                <p style={{ fontSize: 12, color: "#888", marginBottom: 12, lineHeight: 1.5 }}>
                  Wklej HTML istniejącego landing page, na którego <strong>układzie i ilości tekstu</strong> ma bazować nowa strona. AI zachowa strukturę sekcji, ale wstawi nowe treści z Twojego briefu.
                </p>
                <textarea value={referenceLp} onChange={e => setReferenceLp(e.target.value)}
                  placeholder="Wklej HTML referencyjnego landing page (Ctrl+U na stronie → kopiuj kod)..."
                  style={{ ...S.ta, minHeight: 120 }} />
              </Collapse>
            )}

            {/* Step 4: Colors */}
            <Collapse step={4} title="Kolory brandowe" tag="Optional" defaultOpen={true}>
              <p style={{ fontSize: 12, color: "#888", marginBottom: 14, lineHeight: 1.5 }}>
                Kliknij kolory, które mają być użyte na stronie. Domyślnie wybrane są kolory podstawowe Angloville.
              </p>
              <div style={{ marginBottom: 16 }}>
                <div style={S.colorLabel}>GAMA PODSTAWOWA</div>
                <div style={{ display: "flex", gap: 8, flexWrap: "wrap" }}>
                  {BRAND_COLORS.primary.map(c => (
                    <ColorSwatch key={c.hex} color={c} selected={selectedColors.includes(c.hex)} onToggle={() => toggleColor(c.hex)} />
                  ))}
                </div>
              </div>
              <div style={{ marginBottom: 16 }}>
                <div style={S.colorLabel}>GAMA TOWARZYSZĄCA</div>
                <div style={{ display: "flex", gap: 8, flexWrap: "wrap" }}>
                  {BRAND_COLORS.companion.map(c => (
                    <ColorSwatch key={c.hex} color={c} selected={selectedColors.includes(c.hex)} onToggle={() => toggleColor(c.hex)} />
                  ))}
                </div>
              </div>
              <div style={{ marginBottom: 16 }}>
                <div style={S.colorLabel}>GAMA UZUPEŁNIAJĄCA</div>
                <div style={{ display: "flex", gap: 8, flexWrap: "wrap" }}>
                  {BRAND_COLORS.supplementary.map(c => (
                    <ColorSwatch key={c.hex} color={c} selected={selectedColors.includes(c.hex)} onToggle={() => toggleColor(c.hex)} />
                  ))}
                </div>
              </div>
              <div>
                <div style={S.colorLabel}>KOLORY TEKSTOWE</div>
                <div style={{ display: "flex", gap: 8, flexWrap: "wrap" }}>
                  {BRAND_COLORS.text.map(c => (
                    <ColorSwatch key={c.hex} color={c} selected={selectedColors.includes(c.hex)} onToggle={() => toggleColor(c.hex)} />
                  ))}
                </div>
              </div>
              {selectedColors.length > 0 && (
                <div style={{ marginTop: 16, display: "flex", gap: 4, flexWrap: "wrap", alignItems: "center" }}>
                  <span style={{ fontSize: 12, color: "#999", marginRight: 6 }}>Wybrane:</span>
                  {selectedColors.map(hex => (
                    <span key={hex} style={{
                      display: "inline-flex", alignItems: "center", gap: 5,
                      padding: "3px 10px 3px 6px", borderRadius: 6,
                      background: "#f5f5f5", fontSize: 11, fontWeight: 600, color: "#555",
                    }}>
                      <span style={{ width: 14, height: 14, borderRadius: 4, background: hex, display: "inline-block", border: "1px solid rgba(0,0,0,0.1)" }} />
                      {hex}
                    </span>
                  ))}
                </div>
              )}
            </Collapse>

            {/* Step 5: Additional instructions */}
            <div style={{ ...S.card, marginBottom: 12 }}>
              <div style={{ display: "flex", alignItems: "center", gap: 12, marginBottom: 16 }}>
                <StepBadge n={5} />
                <span style={S.st}>Dodatkowe instrukcje</span>
                <span style={{ marginLeft: "auto", fontSize: 12, color: "#999", fontWeight: 500 }}>Optional — AI zastosuje</span>
              </div>
              <textarea value={instructions} onChange={e => setInstructions(e.target.value)}
                placeholder="np. Hero ze zdjęciem plaży, duży nagłówek z ceną, sekcja 'Dlaczego warto' z 4 kartami, timeline z planem podróży..."
                style={{ ...S.ta, minHeight: 80 }} />
            </div>

            {/* Info box */}
            <div style={{
              background: "#fff", borderRadius: 12, border: "1px solid #e8e8e8",
              padding: "16px 20px", marginBottom: 16,
              display: "flex", gap: 12, alignItems: "flex-start",
            }}>
              <span style={{ fontSize: 18, marginTop: 1 }}>ℹ️</span>
              <div style={{ fontSize: 12, color: "#666", lineHeight: 1.6 }}>
                <strong style={{ color: "#232323" }}>Wynik gotowy do WordPress:</strong> Bez menu i stopki (masz swoje w WP).
                Zdjęcia jako placeholdery z wymiarami px — łatwe do podmiany.
                Formularz jako shortcode <code style={{ background: "#f5f5f5", padding: "1px 5px", borderRadius: 4 }}>[contact-form-7]</code>.
              </div>
            </div>

            {/* Generate button */}
            <button onClick={handleGenerate}
              disabled={!source.trim() || status === "loading"}
              style={{
                ...S.genBtn,
                opacity: !source.trim() || status === "loading" ? 0.5 : 1,
                cursor: !source.trim() || status === "loading" ? "not-allowed" : "pointer",
              }}>
              {status === "loading" ? (
                <span style={{ display: "flex", alignItems: "center", justifyContent: "center", gap: 10 }}>
                  <span style={S.spin} />{progress}
                </span>
              ) : "🚀  Generuj landing page"}
            </button>

            {status === "error" && <div style={S.err}><strong>Błąd:</strong> {error}</div>}
          </>
        )}

        {/* ═══ REPLACER TAB ═══ */}
        {topTab === "replacer" && (
          <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 16, alignItems: "start" }}>
            {/* Left: paste HTML */}
            <div style={{ ...S.card, position: "sticky", top: 20 }}>
              <div style={{ display: "flex", alignItems: "center", gap: 10, marginBottom: 14 }}>
                <span style={{ fontSize: 20 }}>📄</span>
                <span style={{ fontSize: 16, fontWeight: 700, color: "#232323" }}>Wklej HTML strony</span>
              </div>
              <p style={{ fontSize: 12, color: "#888", marginBottom: 12, lineHeight: 1.5 }}>
                Wklej gotowy HTML (np. wygenerowany wcześniej). System znajdzie wszystkie obrazy i pozwoli Ci podmienić ich URLe.
              </p>
              <textarea
                value={replacerHtml}
                onChange={e => setReplacerHtml(e.target.value)}
                placeholder="Wklej tutaj cały kod HTML strony..."
                style={{ ...S.ta, minHeight: 400, fontSize: 11, fontFamily: "'SF Mono', Menlo, Consolas, monospace" }}
              />
              {replacerHtml && (
                <button onClick={() => setReplacerHtml("")} style={{
                  marginTop: 8, padding: "6px 14px", borderRadius: 8, border: "1.5px solid #e0e0e0",
                  background: "#fff", color: "#999", fontSize: 12, cursor: "pointer", fontFamily: "inherit",
                }}>✕ Wyczyść</button>
              )}
            </div>

            {/* Right: image list */}
            <div>
              <ImageReplacer html={replacerHtml} />
            </div>
          </div>
        )}
      </div>

      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=Funnel+Sans:wght@300;400;500;600;700;800&display=swap');
        * { box-sizing: border-box; margin: 0; padding: 0; }
        body { font-family: 'Funnel Sans', -apple-system, sans-serif; background: #F0F0F0; }
        @keyframes spin { to { transform: rotate(360deg); } }
        textarea:focus, input:focus { outline: none; border-color: #FCD23A !important; box-shadow: 0 0 0 3px rgba(252,210,58,0.18) !important; }
        button:hover { filter: brightness(0.97); }
        code { font-family: 'SF Mono', Menlo, monospace; font-size: 11px; }
        ::-webkit-scrollbar { width: 8px; height: 8px; }
        ::-webkit-scrollbar-track { background: transparent; }
        ::-webkit-scrollbar-thumb { background: #ccc; border-radius: 4px; }
        ::-webkit-scrollbar-thumb:hover { background: #aaa; }
      `}</style>
    </div>
  );
}

/* ═══════════════════════════════════════════════
   STYLES
   ═══════════════════════════════════════════════ */
const S = {
  page: { minHeight: "100vh", background: "#F0F0F0", fontFamily: "'Funnel Sans',-apple-system,sans-serif", display: "flex", flexDirection: "column" },
  container: { margin: "0 auto", padding: "44px 20px 60px", width: "100%", transition: "max-width 0.3s ease" },
  title: { fontSize: 34, fontWeight: 800, color: "#232323", margin: "0 0 8px", lineHeight: 1.2 },
  sub: { fontSize: 15, color: "#777", margin: 0 },
  yt: { background: "#FCD23A", padding: "2px 12px", borderRadius: 7, color: "#232323" },
  card: { background: "#fff", borderRadius: 14, border: "1px solid #e8e8e8", padding: 24 },
  sh: { display: "flex", alignItems: "center", gap: 12, marginBottom: 18 },
  st: { fontSize: 16, fontWeight: 700, color: "#232323" },
  langCard: {
    flex: 1, position: "relative", display: "flex", flexDirection: "column", alignItems: "center", gap: 6,
    padding: "16px 12px", borderRadius: 12, border: "2px solid #e8e8e8", cursor: "pointer",
    fontFamily: "inherit", textAlign: "center", transition: "all 0.15s", background: "#fff",
  },
  modeCard: {
    position: "relative", display: "flex", flexDirection: "column", alignItems: "flex-start", gap: 4,
    padding: "18px 18px", borderRadius: 12, border: "2px solid #e8e8e8", cursor: "pointer",
    fontFamily: "inherit", textAlign: "left", transition: "all 0.15s", background: "#fff",
  },
  chk: {
    position: "absolute", top: 10, right: 10, width: 22, height: 22, borderRadius: "50%",
    background: "#FCD23A", color: "#232323", fontSize: 12, fontWeight: 800,
    display: "flex", alignItems: "center", justifyContent: "center",
  },
  ta: {
    width: "100%", minHeight: 160, padding: 16, borderRadius: 10,
    border: "1.5px solid #e0e0e0", background: "#fafafa", color: "#232323",
    fontSize: 14, fontFamily: "'Funnel Sans',sans-serif", lineHeight: 1.6,
    resize: "vertical", transition: "border-color 0.2s, box-shadow 0.2s",
  },
  tipRow: { marginTop: 10, display: "flex", alignItems: "center", gap: 6 },
  colorLabel: {
    fontSize: 10, fontWeight: 700, letterSpacing: 2, textTransform: "uppercase",
    color: "#999", marginBottom: 8,
  },
  genBtn: {
    width: "100%", padding: "17px 24px", borderRadius: 12, border: "none",
    background: "#232323", color: "#FCD23A", fontSize: 16, fontWeight: 800,
    cursor: "pointer", fontFamily: "inherit", transition: "opacity 0.2s", marginTop: 8,
  },
  spin: {
    display: "inline-block", width: 18, height: 18,
    border: "2.5px solid rgba(252,210,58,0.3)", borderTopColor: "#FCD23A",
    borderRadius: "50%", animation: "spin 0.8s linear infinite",
  },
  err: {
    padding: "14px 18px", borderRadius: 10, background: "#fff5f5",
    border: "1px solid #fecaca", color: "#b91c1c", fontSize: 13, marginTop: 12,
  },
  resHeader: { background: "#fff", borderBottom: "1px solid #e8e8e8", position: "sticky", top: 0, zIndex: 50 },
  resHeaderInner: { maxWidth: 1400, margin: "0 auto", padding: "12px 24px", display: "flex", alignItems: "center", justifyContent: "space-between", gap: 12, flexWrap: "wrap" },
  logoBadge: { display: "inline-flex", alignItems: "center", justifyContent: "center", width: 32, height: 32, borderRadius: 8, background: "#FCD23A", color: "#232323", fontSize: 13, fontWeight: 800 },
  bBar: { display: "flex", alignItems: "center", gap: 8, padding: "10px 16px", background: "#fafafa", borderBottom: "1px solid #eee" },
  dot: { width: 11, height: 11, borderRadius: "50%", display: "inline-block" },
  pillBtn: { padding: "6px 12px", borderRadius: 6, border: "none", background: "transparent", fontSize: 14, cursor: "pointer", fontFamily: "inherit" },
  pillAct: { padding: "6px 12px", borderRadius: 6, border: "none", background: "#fff", fontSize: 14, cursor: "pointer", fontFamily: "inherit", boxShadow: "0 1px 3px rgba(0,0,0,0.1)" },
  btnY: { padding: "9px 20px", borderRadius: 8, border: "none", background: "#FCD23A", color: "#232323", fontSize: 13, fontWeight: 700, cursor: "pointer", fontFamily: "inherit" },
  btnOut: { padding: "9px 20px", borderRadius: 8, border: "1.5px solid #e0e0e0", background: "#fff", color: "#232323", fontSize: 13, fontWeight: 600, cursor: "pointer", fontFamily: "inherit" },
  btnG: { padding: "9px 16px", borderRadius: 8, border: "none", background: "transparent", color: "#999", fontSize: 13, fontWeight: 600, cursor: "pointer", fontFamily: "inherit" },
};
