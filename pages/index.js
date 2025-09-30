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

// placeholder thumbnails (client-side)
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
    setImages([]); // clear
    // Optional: you can show a loading message/spinner in state if you want
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

            {/* ↑ MORE VERTICAL PADDING BEFORE TABS */}
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

            {/* Pills for active tab */}
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
  const W = 900, H = 900, SAFE = 0.05; // 5% safe zone
  const canvasRef = useRef(null);
  const [img, setImg] = useState(null);

  const [artist,setArtist] = useState('');
  const [title,setTitle]   = useState('');
  const [font,setFont]     = useState(FONTS[0].css);
  const [size,setSize]     = useState(120);
  const [color,setColor]   = useState('#0F1222');
  const [align,setAlign]   = useState('center'); // left|center|right
  const [vpos,setVpos]     = useState('bottom'); // top|middle|bottom

// load image with CORS + proxy fallback
useEffect(()=>{
  let stopped = false;

  async function load(){
    try {
      let src = data.src;

      // If not a data URL, try CORS first. If that still taints, we’ll proxy.
      if (!src.startsWith('data:')) {
        // Try direct CORS load
        const testImg = new Image();
        testImg.crossOrigin = 'anonymous';
        const direct = await new Promise((resolve, reject)=>{
          testImg.onload = ()=>resolve({ok:true, img:testImg});
          testImg.onerror = ()=>reject(new Error('direct-load-failed'));
          testImg.src = src + (src.includes('?') ? '&' : '?') + 'corsfix=' + Date.now();
        }).catch(()=>({ok:false}));

        if (!direct?.ok) {
          // Use proxy → returns data URL
          const resp = await fetch(`/api/proxy-image?url=${encodeURIComponent(src)}`);
          const json = await resp.json();
          if (!resp.ok || !json?.dataUrl) throw new Error('proxy-failed');
          src = json.dataUrl;
        }
      }

      const i = new Image();
      i.crossOrigin = 'anonymous';
      i.onload = ()=>{ if(!stopped) setImg(i); };
      i.onerror = ()=>{ console.warn('image load failed'); };
      i.src = src;
    } catch (e) {
      console.error('Image load error', e);
      alert('Could not load the image for export. Try generating again.');
    }
  }

  load();
  return ()=>{ stopped = true; }
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
    const {x:tx,y:ty,sx,sy,sw} = computeXY({align, vpos, W, H, inset:SAFE, textW:titleW, lineH, isTitle:true});
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

  // robust export at 3000x3000
  async function downloadPNG(){
    try {
      if (document.fonts?.ready) await document.fonts.ready;

      const OUT = 3000;
      const out = document.createElement('canvas');
      out.width = OUT; out.height = OUT;
      const ctx = out.getContext('2d');

      // base image
      ctx.drawImage(img, 0, 0, OUT, OUT);

      // scale preview->export
      const scale = OUT / W;
      const bigSize = Math.round(size * scale);

      ctx.textBaseline = 'top';
      ctx.fillStyle = color;

      // TITLE
      ctx.font = `${bigSize}px "${font}"`;
      const lineH = bigSize*1.1;
      const titleW = ctx.measureText(title).width;
      const {x:tx,y:ty,sx,sy,sw} = computeXY({
        align, vpos, W:OUT, H:OUT, inset:SAFE, textW:titleW, lineH, isTitle:true
      });
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

      out.toBlob((blob)=>{
        if(!blob) return alert('Export failed.');
        const url = URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.href = url;
        a.download = 'ditto-cover-3000.png';
        document.body.appendChild(a);
        a.click();
        a.remove();
        URL.revokeObjectURL(url);
      }, 'image/png');
    } catch(err){
      console.error(err);
      alert('Could not export. Check the console for details.');
    }
  }

  return (
    <section className="editor">
      {/* Close/back button anchored above top-right */}
      <button className="closeBtn" onClick={onClose} aria-label="Close editor and go back">
        <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
          <path d="M18 6L6 18M6 6l12 12"/>
        </svg>
      </button>

      <div className="preview">
        <canvas ref={canvasRef} className="canvas" width={W} height={H} />
        <div className="safe" />
      </div>

      <aside className="rightcol panel">
        <div className="sideTitle">Text Prompt:</div>
        <div className="sideBox">{data.prompt || '—'}</div>

        <div className="sideTitle">Add Text:</div>
        <input className="control" placeholder="Artist Name" value={artist} onChange={e=>setArtist(e.target.value)} />
        <div style={{height:12}} />
        <input className="control" placeholder="Release Title" value={title} onChange={e=>setTitle(e.target.value)} />

        <div className="sideTitle">Typography</div>
        <select className="control" value={font} onChange={e=>setFont(e.target.value)}>
          {FONTS.map(f => <option key={f.css} value={f.css}>{f.label}</option>)}
        </select>

        <div className="row2" style={{marginTop:12}}>
          <input type="color" className="color control" value={color} onChange={e=>setColor(e.target.value)} />
          <input type="number" min="24" max="300" step="2" className="control" value={size} onChange={e=>setSize(parseInt(e.target.value||'0',10))} />
        </div>

        <div className="row3" style={{marginTop:12}}>
          {['left','center','right'].map(a => (
            <button key={a} className={'aln'+(a===align?' alnOn':'')} onClick={()=>setAlign(a)} aria-label={`Align ${a}`}>
              {a==='left' && (<svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M3 6h18M3 12h12M3 18h18"/></svg>)}
              {a==='center' && (<svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M3 6h18M6 12h12M3 18h18"/></svg>)}
              {a==='right' && (<svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M3 6h18M9 12h12M3 18h18"/></svg>)}
            </button>
          ))}
          {['top','middle','bottom'].map(p => (
            <button key={p} className={'aln'+(p===vpos?' alnOn':'')} onClick={()=>setVpos(p)} aria-label={`Vertical ${p}`}>
              {p==='top' && (<svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M12 5v14M8 9l4-4 4 4"/></svg>)}
              {p==='middle' && (<svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M12 3v18M8 12l4-4 4 4M8 12l4 4 4-4"/></svg>)}
              {p==='bottom' && (<svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M12 19V5M8 15l4 4 4-4"/></svg>)}
            </button>
          ))}
        </div>

        <div style={{height:16}} />
        <button className="btn btnPrimary" onClick={downloadPNG}>Upscale & Download</button>
      </aside>
    </section>
  )
}

