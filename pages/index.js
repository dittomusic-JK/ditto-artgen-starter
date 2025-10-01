import Head from 'next/head'
import { useEffect, useRef, useState } from 'react'

const FONTS = [
  {label:'DM Sans', css:'DM Sans'},
  {label:'Inter', css:'Inter'},
  {label:'Poppins', css:'Poppins'},
  {label:'Bebas Neue', css:'Bebas Neue'},
  {label:'Barlow Condensed', css:'Barlow Condensed'},
  {label:'Oswald', css:'Oswald'},
  {label:'Montserrat Alternates', css:'Montserrat Alternates'},
  {label:'Nunito Sans', css:'Nunito Sans'},
  {label:'Archivo', css:'Archivo'},
  {label:'Space Grotesk', css:'Space Grotesk'}
];

const FONT_SIZES = [
  { label: "Tiny", value: 48 },
  { label: "X-Small", value: 64 },
  { label: "Small", value: 84 },
  { label: "Medium", value: 112 },
  { label: "Large", value: 144 },
  { label: "X-Large", value: 180 },
  { label: "Huge", value: 220 }
];

const TABS = ['genre', 'mood', 'style', 'texture'];
const PROMPTS = {
  genre: [
    'Hip Hop','Indie Rock','EDM','Lo-Fi','Afrobeat','Pop','Indie Pop','Synthwave',
    'Afrobeats','Metalcore','Neo-Soul',
    'R&B / Soul','Punk Rock','Folk / Acoustic','Trap','Jazz Fusion','Reggaeton',
    'Country / Americana','Grunge','House / Techno','Gospel / Spiritual','Drill'
  ],
  mood: [
    'Dreamy','Dark & Moody','Energetic','Nostalgic','Uplifting','Aggressive','Mellow','Epic / Cinematic',
    'Melancholic','Euphoric','Raw / Unpolished','Hopeful','Haunting','Introspective','Rebellious','Playful','Futuristic','Romantic','Chill / Relaxed'
  ],
  style: [
    'Photographic','Illustration','Collage','Vaporwave','Minimal','Oil Paint','3D Render','Graffiti',
    'Surrealism','Abstract Shapes','Anime / Manga Inspired','Retro Comic Book','Psychedelic','Ink Sketch / Line Art','Watercolor','Stencil / Street Art','Cyberpunk','Retro Futurism','Mixed Media'
  ],
  texture: [
    'Grainy Film','Clean Digital','Distressed','Neon Glow','Pastel','High Contrast B&W',
    'VHS Static','Paper Collage / Cutout','Torn Paper','Spray Paint / Airbrush','Metallic / Chrome','Velvet / Fabric Grain','Photocopy / Zine Print','Motion Blur','Pixelated / 8-bit','Holographic / Iridescent','Smoke / Mist Overlay'
  ]
};

function assembledPrompt(text, picksByCat){
  const flat = TABS.flatMap(cat => picksByCat[cat]);
  const on = flat.join(', ');
  return [text, on].filter(Boolean).join(' — ');
}

function computeXY({align, vpos, W, H, inset, textW, lineH, isTitle}){
  const sx = W*inset, sy = H*inset, sw = W*(1-inset*2), sh = H*(1-inset*2);
  const yTop = sy + (isTitle ? lineH*0.2 : lineH*1.4);
  const yMid = sy + sh/2 - lineH/2;
  const yBot = sy + sh - (isTitle ? lineH*2.0 : lineH*0.9);
  let x = sx;
  if (align==='center') x = sx + (sw - textW)/2;
  if (align==='right')  x = sx + (sw - textW);
  const y = vpos==='top' ? yTop : (vpos==='middle' ? yMid : yBot);
  return {x,y, sx,sy,sw,sh};
}

export default function Home(){
  const [mode,setMode] = useState('gen'); // 'gen' | 'edit'
  const [prompt,setPrompt] = useState('');
  const [activeTab, setActiveTab] = useState('genre');
  const [picks,setPicks] = useState({ genre:[], mood:[], style:[], texture:[] });
  const [images,setImages] = useState([]);
  const [isLoading, setIsLoading] = useState(false);
  const [selected,setSelected] = useState(null);

  const toggle = (value) => {
    setPicks(p => {
      const cur = p[activeTab];
      const next = cur.includes(value) ? cur.filter(x => x!==value) : [...cur, value];
      return { ...p, [activeTab]: next };
    });
  };

  async function onGenerate(){
    try {
      setIsLoading(true);
      setImages([]);
      const resp = await fetch('/api/generate', {
        method:'POST',
        headers:{'Content-Type':'application/json'},
        body: JSON.stringify({ prompt, pills: picks })
      });
      const data = await resp.json();
      if (!resp.ok) throw new Error(data?.error || 'Generation failed');
      setImages(data.images || []);
    } catch (e) {
      alert(e.message || 'Something went wrong generating images.');
    } finally {
      setIsLoading(false);
    }
  }

  return (
    <>
      <Head>
        <title>Ditto Artwork Generator</title>
        <link rel="preconnect" href="https://fonts.gstatic.com" crossOrigin="" />
        <link href="https://fonts.googleapis.com/css2?family=DM+Sans:wght@400;700&family=Inter:wght@400;700&family=Poppins:wght@600;700&family=Bebas+Neue&family=Barlow+Condensed:wght@600&family=Oswald:wght@500;700&family=Montserrat+Alternates:wght@600&family=Nunito+Sans:wght@600&family=Archivo:wght@600&family=Space+Grotesk:wght@600&display=swap" rel="stylesheet" />
      </Head>

      <main className="wrap">
        <div className="header">
          <div className="title">Artwork Generator</div>
        </div>

        {mode==='gen' && (
          <>
            <section className="card">
              <div className="promptGrid">
                <input className="input" placeholder="Describe the vibe of your artwork..." value={prompt} onChange={e=>setPrompt(e.target.value)} />
                <button className="btn btnPrimary" onClick={onGenerate}>Generate</button>
              </div>
            </section>

            <div className="mtXL" />

            {/* Tabs */}
            <div className="row" style={{gap:16, alignItems:'flex-end'}}>
              <div style={{font:'700 16px/24px "IBM Plex Mono", ui-monospace'}}>Add Prompts:</div>
              <div className="tabs">
                {[
                  {key:'genre',   label:'💿 Genre'},
                  {key:'mood',    label:'🙂 Mood'},
                  {key:'style',   label:'🖌️ Style'},
                  {key:'texture', label:'🌫️ Texture'}
                ].map(t => (
                  <button
                    key={t.key}
                    className={'tab' + (activeTab===t.key ? ' tabOn' : '')}
                    onClick={()=>setActiveTab(t.key)}
                  >
                    {t.label}
                  </button>
                ))}
              </div>
            </div>

            {/* Pills */}
            <div className="pills">
              {PROMPTS[activeTab].map(v => (
                <div
                  key={v}
                  className={'pill' + (picks[activeTab].includes(v) ? ' pillOn' : '')}
                  onClick={()=>toggle(v)}
                >
                  + {v}
                </div>
              ))}
            </div>

            {/* Loading / results */}
            {isLoading && (
              <div className="loadingWrap">
                <div className="spinner" />
              </div>
            )}

            {!isLoading && images.length>0 && (
              <section className="mtL">
                <div style={{font:'600 20px/30px Poppins', margin:'16px 0'}}>Today</div>
                <div className="grid">
                  {images.map((src,i)=>(
                    <img
                      key={i}
                      src={src}
                      className="thumb"
                      onClick={()=>{
                        setSelected({ src, prompt: assembledPrompt(prompt, picks) });
                        setMode('edit');
                      }}
                    />
                  ))}
                </div>
              </section>
            )}
          </>
        )}

        {mode==='edit' && selected && (
          <Editor data={selected} onClose={()=>setMode('gen')} />
        )}
      </main>
    </>
  )
}

function Editor({ data, onClose }){
  const W = 900, H = 900, SAFE = 0.05;
  const canvasRef = useRef(null);
  const [img, setImg] = useState(null);

  const [title,setTitle]   = useState('');
  const [artist,setArtist] = useState('');
  const [font,setFont]     = useState(FONTS[0].css);

  const [titleColor,setTitleColor]   = useState('#0F1222');
  const [artistColor,setArtistColor] = useState('#0F1222');

  const [size,setSize] = useState(FONT_SIZES[3].value); // shared size preset

  const [align,setAlign] = useState('center');
  const [vpos,setVpos]   = useState('bottom');

  useEffect(()=>{
    const i = new Image();
    i.crossOrigin = "anonymous";
    i.onload = ()=> setImg(i);
    i.src = data.src;
  },[data.src]);

  useEffect(()=>{
    if(!canvasRef.current || !img) return;
    const ctx = canvasRef.current.getContext('2d');
    ctx.clearRect(0,0,W,H);
    ctx.drawImage(img,0,0,W,H);

    const titleSize = size;
    const artistSize = Math.round(size*0.6);

    ctx.textBaseline = 'top';

    // Title
    ctx.fillStyle = titleColor;
    ctx.font = `${titleSize}px "${font}"`;
    const titleW = ctx.measureText(title).width;
    const {x:tx,y:ty,sx,sy,sw} = computeXY({align, vpos, W, H, inset:SAFE, textW:titleW, lineH:titleSize*1.1, isTitle:true});
    let textXTitle = tx;
    if(align==='center') textXTitle = sx + (sw - titleW)/2;
    if(align==='right')  textXTitle = sx + (sw - titleW);
    if (title) ctx.fillText(title, textXTitle, ty);

    // Artist
    if (artist){
      ctx.fillStyle = artistColor;
      ctx.font = `${artistSize}px "${font}"`;
      const aW = ctx.measureText(artist).width;
      let ax = sx;
      if(align==='center') ax = sx + (sw - aW)/2;
      if(align==='right')  ax = sx + (sw - aW);
      const ay = (vpos==='bottom') ? (ty + artistSize*1.2*1.6) : (ty + artistSize*1.2*1.2);
      ctx.fillText(artist, ax, ay);
    }
  },[img, title, artist, font, size, titleColor, artistColor, align, vpos]);

  async function downloadPNG(){
    const OUT = 3000;
    const out = document.createElement('canvas');
    out.width = OUT; out.height = OUT;
    const ctx = out.getContext('2d');

    ctx.drawImage(img,0,0,OUT,OUT);

    const titleSizeBig = Math.round(size * (OUT/W));
    const artistSizeBig = Math.round(size*0.6 * (OUT/W));

    ctx.textBaseline = 'top';

    ctx.fillStyle = titleColor;
    ctx.font = `${titleSizeBig}px "${font}"`;
    const titleW = ctx.measureText(title).width;
    const {x:tx,y:ty,sx,sy,sw} = computeXY({align, vpos, W:OUT, H:OUT, inset:SAFE, textW:titleW, lineH:titleSizeBig*1.1, isTitle:true});
    let textXTitle = tx;
    if(align==='center') textXTitle = sx + (sw - titleW)/2;
    if(align==='right')  textXTitle = sx + (sw - titleW);
    if (title) ctx.fillText(title, textXTitle, ty);

    if (artist){
      ctx.fillStyle = artistColor;
      ctx.font = `${artistSizeBig}px "${font}"`;
      const aW = ctx.measureText(artist).width;
      let ax = sx;
      if(align==='center') ax = sx + (sw - aW)/2;
      if(align==='right')  ax = sx + (sw - aW);
      const ay = (vpos==='bottom') ? (ty + artistSizeBig*1.2*1.6) : (ty + artistSizeBig*1.2*1.2);
      ctx.fillText(artist, ax, ay);
    }

    out.toBlob((blob) => {
      if (!blob) return alert('Export failed.');
      const url = URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = 'ditto-cover-3000.png';
      a.click();
      URL.revokeObjectURL(url);
    }, 'image/png');
  }

  return (
    <section className="editor">
      <button className="closeBtn" onClick={onClose}>
        <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
          <path d="M18 6L6 18M6 6l12 12"/>
        </svg>
      </button>

      <div className="preview">
        <canvas ref={canvasRef} className="canvas" width={W} height={H} />
        <div className="safe" />
      </div>

      <aside className="rightcol panel">
        <div style={{ 
  font:'500 14px/20px "IBM Plex Mono", ui-monospace', 
  color:'var(--sub)', 
  margin:'8px 0 16px' 
}}>
  {data.prompt || '—'}
</div>


        <div className="sideTitle">Add Text:</div>
        <input className="control" placeholder="Artist Name" value={artist} onChange={e=>setArtist(e.target.value)} />
        <div style={{height:12}} />
        <input className="control" placeholder="Release Title" value={title} onChange={e=>setTitle(e.target.value)} />

       <div className="sideTitle">Typography</div>

{/* Row 1: Font family full width */}
<select
  className="control mt8"
  value={font}
  onChange={e=>setFont(e.target.value)}
>
  {FONTS.map(f => (
    <option
      key={f.css}
      value={f.css}
      style={{ fontFamily:`"${f.css}", sans-serif` }}
    >
      {f.label}
    </option>
  ))}
</select>

{/* Row 2: Colours + Font size */}
<div className="row mt8" style={{gap:12}}>
  <div className="rowColors">
    <div className="colorSwatch">
      <input
        type="color"
        className="colorInput"
        value={titleColor}
        onChange={e=>setTitleColor(e.target.value)}
        aria-label="Title colour"
      />
    </div>
    <div className="colorSwatch">
      <input
        type="color"
        className="colorInput"
        value={artistColor}
        onChange={e=>setArtistColor(e.target.value)}
        aria-label="Artist colour"
      />
    </div>
  </div>

  <select
    className="control"
    style={{flex:1}}
    value={size}
    onChange={e=>setSize(parseInt(e.target.value,10))}
    aria-label="Font size"
  >
    {FONT_SIZES.map(opt => (
      <option key={opt.value} value={opt.value}>{opt.label}</option>
    ))}
  </select>
</div>

{/* Row 3: Alignment options */}
<div className="row" style={{marginTop:12, gap:12}}>
  {/* Horizontal align group */}
  <div className="alnGroup">
    {['left','center','right'].map(a => (
      <button
        key={a}
        className={a===align ? 'alnOn' : ''}
        onClick={()=>setAlign(a)}
        aria-label={`Align ${a}`}
      >
        {a==='left' && (<svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M3 6h18M3 12h12M3 18h18"/></svg>)}
        {a==='center' && (<svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M3 6h18M6 12h12M3 18h18"/></svg>)}
        {a==='right' && (<svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M3 6h18M9 12h12M3 18h18"/></svg>)}
      </button>
    ))}
  </div>

  {/* Vertical align group */}
  <div className="alnGroup">
    {['top','middle','bottom'].map(p => (
      <button
        key={p}
        className={p===vpos ? 'alnOn' : ''}
        onClick={()=>setVpos(p)}
        aria-label={`Vertical ${p}`}
      >
        {p==='top' && (<svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M12 5v14M8 9l4-4 4 4"/></svg>)}
        {p==='middle' && (<svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M12 3v18M8 12l4-4 4 4M8 12l4 4 4-4"/></svg>)}
        {p==='bottom' && (<svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M12 19V5M8 15l4 4 4-4"/></svg>)}
      </button>
    ))}
  </div>
</div>


<div style={{height:16}} />
<button className="btn btnGradient btnBlock" onClick={downloadPNG}>
  Upscale & Download
</button>

</aside>
</section>

  )
}
