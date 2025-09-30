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

// === NEW: tabs + per-category prompt options
const TABS = ['genre', 'mood', 'style', 'texture'];

const PROMPTS = {
  genre: ['Hip Hop','Indie Rock','EDM','Lo-Fi','Afrobeat','Pop','Indie Pop','Synthwave','Afrobeats','Metalcore','Neo-Soul'],
  mood: ['Dreamy','Dark & Moody','Energetic','Nostalgic','Uplifting','Aggressive','Mellow','Epic / Cinematic'],
  style: ['Photographic','Illustration','Collage','Vaporwave','Minimal','Oil Paint','3D Render','Graffiti'],
  texture: ['Grainy Film','Clean Digital','Distressed','Neon Glow','Pastel','High Contrast B&W']
};

function assembledPrompt(text, picksByCat){
  const flat = TABS.flatMap(cat => picksByCat[cat]);
  const on = flat.join(', ');
  return [text, on].filter(Boolean).join(' — ');
}

// simple client-side placeholder generator to avoid CORS during MVP
function placeholderDataUrl(seed, label='Art'){
  const size = 1024;
  const c = document.createElement('canvas');
  c.width = size; c.height = size;
  const ctx = c.getContext('2d');
  const g = ctx.createLinearGradient(0,0,size,size);
  g.addColorStop(0, `hsl(${(seed*73)%360} 70% 90%)`);
  g.addColorStop(1, `hsl(${(seed*137)%360} 70% 70%)`);
  ctx.fillStyle = g; ctx.fillRect(0,0,size,size);
  ctx.fillStyle = 'rgba(0,0,0,.35)';
  ctx.fillRect(0, size/2-52, size, 104);
  ctx.fillStyle = 'white';
  ctx.font = '700 64px Poppins, sans-serif';
  ctx.textAlign = 'center';
  ctx.textBaseline = 'middle';
  ctx.fillText(`${label} ${seed}`, size/2, size/2);
  return c.toDataURL('image/png');
}

// text position within safe area (no dragging)
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
  const [activeTab, setActiveTab] = useState('genre'); // NEW: tabs
  const [picks,setPicks] = useState({ genre:[], mood:[], style:[], texture:[] }); // NEW: per-category
  const [images,setImages] = useState([]); // dataURLs
  const [selected,setSelected] = useState(null);

  // toggle pill in the currently active tab
  const toggle = (value) => {
    setPicks(p => {
      const cur = p[activeTab];
      const next = cur.includes(value) ? cur.filter(x => x!==value) : [...cur, value];
      return { ...p, [activeTab]: next };
    });
  };

  async function onGenerate(){
    // optional: log to API (not required for MVP)
    fetch('/api/generate', {
      method:'POST',
      headers:{'Content-Type':'application/json'},
      body: JSON.stringify({ prompt, pills: picks })
    }).catch(()=>{});
    // create 4 placeholders
    const arr = [1,2,3,4].map(i => placeholderDataUrl(i, 'Art'));
    setImages(arr);
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

            {/* Tabs */}
            <div className="row" style={{marginTop:20, gap:16, alignItems:'flex-end'}}>
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

            {/* Pills for active tab only */}
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

            {images.length>0 && (
              <section style={{marginTop:24}}>
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
          <Editor data={selected} goBack={()=>setMode('gen')} />
        )}
      </main>
    </>
  )
}

function Editor({ data }){
  const W = 900, H = 900, SAFE = 0.10;
  const canvasRef = useRef(null);
  const [img, setImg] = useState(null);

  const [artist,setArtist] = useState('');
  const [title,setTitle]   = useState('');
  const [font,setFont]     = useState(FONTS[0].css);
  const [size,setSize]     = useState(120);
  const [color,setColor]   = useState('#0F1222');
  const [align,setAlign]   = useState('center'); // left|center|right
  const [vpos,setVpos]     = useState('bottom'); // top|middle|bottom

  // load image
  useEffect(()=>{
    const i = new Image();
    i.onload = ()=> setImg(i);
    i.src = data.src;
  },[data.src]);

  // draw preview
  useEffect(()=>{
    if(!canvasRef.current || !img) return;
    const ctx = canvasRef.current.getContext('2d');
    ctx.clearRect(0,0,W,H);
    ctx.drawImage(img,0,0,W,H);

    const lineH = size*1.1;
    ctx.textBaseline = 'top';
    ctx.fillStyle = color;

    // TITLE
    ctx.font = `${size}px "${font}"`;
    const titleW = ctx.measureText(title).width;
    const {x:tx,y:ty,sx,sy,sw,sh} = computeXY({align, vpos, W, H, inset:SAFE, textW:titleW, lineH, isTitle:true});
    let textXTitle = tx;
    if(align==='center'){ textXTitle = sx + (sw - titleW)/2; }
    if(align==='right'){  textXTitle = sx + (sw - titleW);  }
    if (title) ctx.fillText(title, textXTitle, ty);

    // ARTIST
    if (artist){
      const aSize = Math.round(size*0.6);
      ctx.font = `${aSize}px "${font}"`;
      const newLineH = aSize*1.2;
      const aW = ctx.measureText(artist).width;
      let ax = sx;
      if(align==='center') ax = sx + (sw - aW)/2;
      if(align==='right')  ax = sx + (sw - aW);
      const ay = (vpos==='bottom') ? (ty + newLineH*1.6) : (ty + newLineH*1.2);
      ctx.fillText(artist, ax, ay);
    }
  },[img, artist, title, font, size, color, align, vpos]);

  function downloadPNG(){
    // export at 3000x3000
    const out = document.createElement('canvas');
    out.width = 3000; out.height = 3000;
    const ctx = out.getContext('2d');

    ctx.drawImage(img, 0,0, out.width, out.height);

    const scale = out.width / W;
    const bigSize = Math.round(size * scale);
    ctx.textBaseline = 'top';
    ctx.fillStyle = color;

    // TITLE
    ctx.font = `${bigSize}px "${font}"`;
    const lineH = bigSize*1.1;
    const titleW = ctx.measureText(title).width;
    const {x:tx,y:ty,sx,sy,sw,sh} = computeXY({align, vpos, W:out.width, H:out.height, inset:SAFE, textW:titleW, lineH, isTitle:true});
    let textXTitle = tx;
    if(align==='center'){ textXTitle = sx + (sw - titleW)/2; }
    if(align==='right'){  textXTitle = sx + (sw - titleW);  }
    if (title) ctx.fillText(title, textXTitle, ty);

    // ARTIST
    if (artist){
      const aSize = Math.round(bigSize*0.6);
      ctx.font = `${aSize}px "${font}"`;
      const newLineH = aSize*1.2;
      const aW = ctx.measureText(artist).width;
      let ax = sx;
      if(align==='center') ax = sx + (sw - aW)/2;
      if(align==='right')  ax = sx + (sw - aW);
      const ay = (vpos==='bottom') ? (ty + newLineH*1.6) : (ty + newLineH*1.2);
      ctx.fillText(artist, ax, ay);
    }

    const link = document.createElement('a');
    link.href = out.toDataURL('image/png');
    link.download = 'ditto-cover-3000.png';
    link.click();
  }

  return (
    <section className="editor">
      <div className="preview">
        <canvas ref={canvasRef} className="canvas" width={W} height={H} />
        <div className="safe" />
      </div>
      <aside className="rightcol">
        <div className="sideTitle">Text Prompt:</div>
        <div className="sideBox">{data.prompt || '—'}</div>

        <div className="sideTitle">Add Text:</div>
        <input className="select" placeholder="Artist Name" value={artist} onChange={e=>setArtist(e.target.value)} />
        <div style={{height:8}} />
        <input className="select" placeholder="Release Title" value={title} onChange={e=>setTitle(e.target.value)} />

        <div className="sideTitle">Typography</div>
        <select className="select" value={font} onChange={e=>setFont(e.target.value)}>
          {FONTS.map(f => <option key={f.css} value={f.css}>{f.label}</option>)}
        </select>
        <div className="row2" style={{marginTop:8}}>
          <input type="color" className="color" value={color} onChange={e=>setColor(e.target.value)} />
          <input type="number" min="24" max="300" step="2" className="number" value={size} onChange={e=>setSize(parseInt(e.target.value||'0',10))} />
        </div>
        <div className="row3" style={{marginTop:8}}>
          {['left','center','right'].map(a => (
            <div key={a} className={'radio'+(a===align?' radioOn':'')} onClick={()=>setAlign(a)}>{a[0].toUpperCase()}</div>
          ))}
          {['top','middle','bottom'].map(p => (
            <div key={p} className={'radio'+(p===vpos?' radioOn':'')} onClick={()=>setVpos(p)}>{p[0].toUpperCase()}</div>
          ))}
        </div>
        <div style={{height:16}} />
        <button className="btn btnPrimary" onClick={downloadPNG}>Upscale & Download</button>
      </aside>
    </section>
  )
}
