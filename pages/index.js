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
  genre: ['Hip Hop','Indie Rock','EDM','Lo-Fi','Afrobeat','Pop','Indie Pop','Synthwave','Afrobeats','Metalcore','Neo-Soul','R&B / Soul','Punk Rock','Folk / Acoustic','Trap','Jazz Fusion','Reggaeton','Country / Americana','Grunge','House / Techno','Gospel / Spiritual','Drill'],
  mood: ['Dreamy','Dark & Moody','Energetic','Nostalgic','Uplifting','Aggressive','Mellow','Epic / Cinematic','Melancholic','Euphoric','Raw / Unpolished','Hopeful','Haunting','Introspective','Rebellious','Playful','Futuristic','Romantic','Chill / Relaxed'],
  style: ['Photographic','Illustration','Collage','Vaporwave','Minimal','Oil Paint','3D Render','Graffiti','Surrealism','Abstract Shapes','Anime / Manga Inspired','Retro Comic Book','Psychedelic','Ink Sketch / Line Art','Watercolor','Stencil / Street Art','Cyberpunk','Retro Futurism','Mixed Media'],
  texture: ['Grainy Film','Clean Digital','Distressed','Neon Glow','Pastel','High Contrast B&W','VHS Static','Paper Collage / Cutout','Torn Paper','Spray Paint / Airbrush','Metallic / Chrome','Velvet / Fabric Grain','Photocopy / Zine Print','Motion Blur','Pixelated / 8-bit','Holographic / Iridescent','Smoke / Mist Overlay']
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

            <div className="mtXL" />

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
  const W = 900, H = 900, SAFE = 0.08;
  const canvasRef = useRef(null);
  const [img, setImg] = useState(null);

  const [artist,setArtist] = useState('');
  const [title,setTitle]   = useState('');
  const [font,setFont]     = useState(FONTS[0].css);

  const [titleColor,setTitleColor]   = useState('#0F1222');
  const [artistColor,setArtistColor] = useState('#0F1222');

  const [titleSize,setTitleSize]   = useState(120);
  const [artistSize,setArtistSize] = useState(72);

  const [align,setAlign]   = useState('center');
  const [vpos,setVpos]     = useState('bottom');

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

    ctx.textBaseline = 'top';

    // Title
    ctx.fillStyle = titleColor;
    ctx.font = `${titleSize}px "${font}"`;
    const titleW = ctx.measureText(title).width;
    const {x:tx,y:ty,sx,sy,sw} = computeXY({align,vpos,W,H,inset:SAFE,textW:titleW,lineH:titleSize*1.2,isTitle:true});
    let textXTitle = tx;
    if (align==='center') textXTitle = sx + (sw - titleW)/2;
    if (align==='right')  textXTitle = sx + (sw - titleW);
    if (title) ctx.fillText(title, textXTitle, ty);

    // Artist
    ctx.fillStyle = artistColor;
    ctx.font = `${artistSize}px "${font}"`;
    const aW = ctx.measureText(artist).width;
    let ax = sx;
    if (align==='center') ax = sx + (sw - aW)/2;
    if (align==='right')  ax = sx + (sw - aW);
    const ay = (vpos==='bottom') ? (ty + artistSize*1.6) : (ty + artistSize*1.2);
    if (artist) ctx.fillText(artist, ax, ay);
  },[img, artist, title, font, titleSize, artistSize, titleColor, artistColor, align, vpos]);

  async function downloadPNG(){
    const OUT = 3000;
    const out = document.createElement('canvas');
    out.width = OUT; out.height = OUT;
    const ctx = out.getContext('2d');
    ctx.drawImage(img,0,0,OUT,OUT);

    ctx.textBaseline = 'top';

    // Title
    ctx.fillStyle = titleColor;
    ctx.font = `${Math.round(titleSize*(OUT/W))}px "${font}"`;
    const titleW = ctx.measureText(title).width;
    const {x:tx,y:ty,sx,sy,sw} = computeXY({align,vpos,W:OUT,H:OUT,inset:SAFE,textW:titleW,lineH:titleSize*1.2,isTitle:true});
    let textXTitle = tx;
    if (align==='center') textXTitle = sx + (sw - titleW)/2;
    if (align==='right')  textXTitle = sx + (sw - titleW);
    if (title) ctx.fillText(title, textXTitle, ty);

    // Artist
    ctx.fillStyle = artistColor;
    ctx.font = `${Math.round(artistSize*(OUT/W))}px "${font}"`;
    const aW = ctx.measureText(artist).width;
    let ax = sx;
    if (align==='center') ax = sx + (sw - aW)/2;
    if (align==='right')  ax = sx + (sw - aW);
    const ay = (vpos==='bottom') ? (ty + artistSize*1.6) : (ty + artistSize*1.2);
    if (artist) ctx.fillText(artist, ax, ay);

    out.toBlob((blob)=>{
      const url = URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = 'ditto-cover-3000.png';
      a.click();
      URL.revokeObjectURL(url);
    },'image/png');
  }

  return (
    <section className="editor">
      <button className="closeBtn" onClick={onClose} aria-label="Close editor and go back">
        <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M18 6L6 18M6 6l12 12"/></svg>
      </button>

      <div className="preview">
        <canvas ref={canvasRef} className="canvas" width={W} height={H} />
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
          {FONTS.map(f => (
            <option key={f.css} value={f.css} style={{ fontFamily:`"${f.css}", sans-serif` }}>
              {f.label}
            </option>
          ))}
        </select>

        {/* Colors + sizes */}
        <div className="grid4 mt8">
          <input type="color" className="colorInput" value={titleColor} onChange={e=>setTitleColor(e.target.value)} />
          <select className="miniSelect" value={titleSize} onChange={e=>setTitleSize(parseInt(e.target.value,10))}>
            {[64,72,84,96,112,128,144,160].map(s => <option key={s} value={s}>{s}pt</option>)}
          </select>
          <input type="color" className="colorInput" value={artistColor} onChange={e=>setArtistColor(e.target.value)} />
          <select className="miniSelect" value={artistSize} onChange={e=>setArtistSize(parseInt(e.target.value,10))}>
            {[36,42,48,54,60,66,72,80].map(s => <option key={s} value={s}>{s}pt</option>)}
          </select>
        </div>

        {/* Alignment buttons */}
        <div className="row3" style={{marginTop:12}}>
          {['left','center','right'].map(a => (
            <button key={a} className={'aln'+(a===align?' alnOn':'')} onClick={()=>setAlign(a)}>
              {a}
            </button>
          ))}
          {['top','middle','bottom'].map(p => (
            <button key={p} className={'aln'+(p===vpos?' alnOn':'')} onClick={()=>setVpos(p)}>
              {p}
            </button>
          ))}
        </div>

        <div style={{height:16}} />
        <button className="btn btnPrimary full" onClick={downloadPNG}>Upscale & Download</button>
      </aside>
    </section>
  )
}
