import { useEffect, useRef, useState, useCallback } from 'react';

const FONTS = [
  { label:'DM Sans', css:'DM Sans', demo:'Aa' },
  { label:'Inter', css:'Inter', demo:'Aa' },
  { label:'Poppins', css:'Poppins', demo:'Aa' },
  { label:'Bebas Neue', css:'Bebas Neue', demo:'Aa' },
  { label:'Barlow Condensed', css:'Barlow Condensed', demo:'Aa' },
  { label:'Oswald', css:'Oswald', demo:'Aa' },
  { label:'Montserrat Alternates', css:'Montserrat Alternates', demo:'Aa' },
  { label:'Nunito Sans', css:'Nunito Sans', demo:'Aa' },
  { label:'Archivo', css:'Archivo', demo:'Aa' },
  { label:'Space Grotesk', css:'Space Grotesk', demo:'Aa' },
  { label:'Playfair Display', css:'Playfair Display', demo:'Aa' },
  { label:'Raleway', css:'Raleway', demo:'Aa' },
  { label:'Rubik', css:'Rubik', demo:'Aa' },
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

function FontPicker({ value, onChange }) {
  const [open, setOpen] = useState(false);
  const boxRef = useRef(null);
  const current = FONTS.find(f => f.css === value) || FONTS[0];

  const close = useCallback((e)=>{
    if(!boxRef.current?.contains(e.target)) setOpen(false);
  },[]);

  useEffect(()=>{
    document.addEventListener('mousedown', close);
    return ()=> document.removeEventListener('mousedown', close);
  },[close]);

  return (
    <div ref={boxRef} className="fontSelect">
      <button
        type="button"
        className="control fontSelectButton"
        onClick={()=>setOpen(v=>!v)}
        style={{ fontFamily: `"${current.css}", sans-serif`, fontWeight: 600 }}
      >
        {current.label}
        <span className="chev">▼</span>
      </button>

      {open && (
        <div className="fontMenu">
          {FONTS.map(f => (
            <button
              key={f.css}
              type="button"
              onClick={() => { onChange(f.css); setOpen(false); }}
              className={`fontItem ${f.css===value ? 'isSelected' : ''}`}
            >
              <div className="fontSample" style={{ fontFamily: `"${f.css}", sans-serif` }}>
                {f.demo}
              </div>
              <div className="fontName" style={{ fontFamily: `"${f.css}", sans-serif` }}>
                {f.label}
              </div>
            </button>
          ))}
        </div>
      )}
    </div>
  );
}

export default function Home(){
  const [mode,setMode] = useState('gen');
  const [prompt,setPrompt] = useState('');
  const [activeTab, setActiveTab] = useState('genre');
  const [picks,setPicks] = useState({ genre:[], mood:[], style:[], texture:[] });
  const [images,setImages] = useState([]);
  const [isLoading, setIsLoading] = useState(false);
  const [selected,setSelected] = useState(null);
  const [history, setHistory] = useState([]);

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
      
      const generatedImages = data.images || [];
      setImages(generatedImages);
      
      setHistory(prev => [{
        timestamp: Date.now(),
        prompt: assembledPrompt(prompt, picks),
        images: generatedImages
      }, ...prev].slice(0, 10));
      
    } catch (e) {
      alert(e.message || 'Something went wrong generating images.');
    } finally {
      setIsLoading(false);
    }
  }

  return (
    <main className="wrap">
      <div className="header">
        <div className="title">Artwork Generator</div>
        {history.length > 0 && mode === 'gen' && (
          <button className="btn" style={{fontSize:14}}>
            History ({history.length})
          </button>
        )}
      </div>

      {mode==='gen' && (
        <>
          <section className="card">
            <div className="promptGrid">
              <input
                className="input"
                placeholder="Describe the vibe of your artwork..."
                value={prompt}
                onChange={e=>setPrompt(e.target.value)}
                onKeyDown={e => e.key === 'Enter' && onGenerate()}
              />
              <button className="btn btnPrimary" onClick={onGenerate} disabled={isLoading}>
                {isLoading ? 'Generating...' : 'Generate'}
              </button>
            </div>
          </section>

          <div className="mtXL" />

          <div className="row" style={{gap:16, alignItems:'flex-end'}}>
            <div style={{font:'700 16px/24px "IBM Plex Mono", ui-monospace'}}>Add Prompts:</div>
            <div className="tabs">
              {[
                {key:'genre', label:'💿 Genre'},
                {key:'mood', label:'🙂 Mood'},
                {key:'style', label:'🖌️ Style'},
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
  );
}

function Editor({ data, onClose }){
  const W = 900, H = 900, SAFE = 0.05;
  const canvasRef = useRef(null);
  const previewRef = useRef(null);
  const [img, setImg] = useState(null);

  const [title,setTitle] = useState('');
  const [artist,setArtist] = useState('');
  const [font,setFont] = useState(FONTS[0].css);
  const [titleColor,setTitleColor] = useState('#FFFFFF');
  const [artistColor,setArtistColor] = useState('#FFFFFF');
  const [size,setSize] = useState(FONT_SIZES[3].value);
  
  // Draggable positions (0-1 normalized)
  const [titlePos, setTitlePos] = useState({ x: 0.5, y: 0.85 });
  const [artistPos, setArtistPos] = useState({ x: 0.5, y: 0.92 });
  const [dragging, setDragging] = useState(null);
  
  // Text effects
  const [titleStroke, setTitleStroke] = useState(0);
  const [titleShadow, setTitleShadow] = useState(0);
  const [titleOpacity, setTitleOpacity] = useState(100);
  const [artistStroke, setArtistStroke] = useState(0);
  const [artistShadow, setArtistShadow] = useState(0);
  const [artistOpacity, setArtistOpacity] = useState(100);
  
  // Image filters
  const [brightness, setBrightness] = useState(100);
  const [contrast, setContrast] = useState(100);
  const [saturation, setSaturation] = useState(100);
  const [blur, setBlur] = useState(0);
  
  const [showSafeZone, setShowSafeZone] = useState(true);
  const [activePanel, setActivePanel] = useState('text');

  useEffect(()=>{
    const i = new Image();
    i.crossOrigin = "anonymous";
    i.onload = ()=> setImg(i);
    i.src = data.src;
  },[data.src]);

  const handleMouseDown = (e, type) => {
    if (!previewRef.current) return;
    setDragging(type);
    e.preventDefault();
  };

  const handleMouseMove = useCallback((e) => {
    if (!dragging || !previewRef.current) return;
    
    const rect = previewRef.current.getBoundingClientRect();
    const x = Math.max(0, Math.min(1, (e.clientX - rect.left) / rect.width));
    const y = Math.max(0, Math.min(1, (e.clientY - rect.top) / rect.height));
    
    if (dragging === 'title') setTitlePos({ x, y });
    if (dragging === 'artist') setArtistPos({ x, y });
  }, [dragging]);

  const handleMouseUp = useCallback(() => {
    setDragging(null);
  }, []);

  useEffect(() => {
    if (dragging) {
      document.addEventListener('mousemove', handleMouseMove);
      document.addEventListener('mouseup', handleMouseUp);
      return () => {
        document.removeEventListener('mousemove', handleMouseMove);
        document.removeEventListener('mouseup', handleMouseUp);
      };
    }
  }, [dragging, handleMouseMove, handleMouseUp]);

  useEffect(()=>{
    if(!canvasRef.current || !img) return;
    const ctx = canvasRef.current.getContext('2d');
    
    // Apply filters
    ctx.filter = `brightness(${brightness}%) contrast(${contrast}%) saturate(${saturation}%) blur(${blur}px)`;
    ctx.clearRect(0,0,W,H);
    ctx.drawImage(img,0,0,W,H);
    ctx.filter = 'none';

    const titleSize = size;
    const artistSize = Math.round(size*0.6);
    ctx.textBaseline = 'middle';
    ctx.textAlign = 'center';

    // Title
    if (title) {
      const tx = titlePos.x * W;
      const ty = titlePos.y * H;
      
      ctx.globalAlpha = titleOpacity / 100;
      
      if (titleShadow > 0) {
        ctx.shadowColor = 'rgba(0,0,0,0.8)';
        ctx.shadowBlur = titleShadow;
        ctx.shadowOffsetX = titleShadow / 2;
        ctx.shadowOffsetY = titleShadow / 2;
      }
      
      if (titleStroke > 0) {
        ctx.strokeStyle = '#000000';
        ctx.lineWidth = titleStroke;
        ctx.font = `700 ${titleSize}px "${font}"`;
        ctx.strokeText(title, tx, ty);
      }
      
      ctx.fillStyle = titleColor;
      ctx.font = `700 ${titleSize}px "${font}"`;
      ctx.fillText(title, tx, ty);
      
      ctx.shadowColor = 'transparent';
      ctx.shadowBlur = 0;
      ctx.globalAlpha = 1;
    }

    // Artist
    if (artist) {
      const ax = artistPos.x * W;
      const ay = artistPos.y * H;
      
      ctx.globalAlpha = artistOpacity / 100;
      
      if (artistShadow > 0) {
        ctx.shadowColor = 'rgba(0,0,0,0.8)';
        ctx.shadowBlur = artistShadow;
        ctx.shadowOffsetX = artistShadow / 2;
        ctx.shadowOffsetY = artistShadow / 2;
      }
      
      if (artistStroke > 0) {
        ctx.strokeStyle = '#000000';
        ctx.lineWidth = artistStroke;
        ctx.font = `600 ${artistSize}px "${font}"`;
        ctx.strokeText(artist, ax, ay);
      }
      
      ctx.fillStyle = artistColor;
      ctx.font = `600 ${artistSize}px "${font}"`;
      ctx.fillText(artist, ax, ay);
      
      ctx.shadowColor = 'transparent';
      ctx.shadowBlur = 0;
      ctx.globalAlpha = 1;
    }
  },[img, title, artist, font, size, titleColor, artistColor, titlePos, artistPos, titleStroke, titleShadow, titleOpacity, artistStroke, artistShadow, artistOpacity, brightness, contrast, saturation, blur]);

  async function downloadPNG(){
    const OUT = 3000;
    const out = document.createElement('canvas');
    out.width = OUT; out.height = OUT;
    const ctx = out.getContext('2d');

    const scale = OUT / W;
    ctx.filter = `brightness(${brightness}%) contrast(${contrast}%) saturate(${saturation}%) blur(${blur * scale}px)`;
    ctx.drawImage(img,0,0,OUT,OUT);
    ctx.filter = 'none';

    const titleSizeBig = titleSize * scale;
    const artistSizeBig = Math.round(size*0.6) * scale;
    ctx.textBaseline = 'middle';
    ctx.textAlign = 'center';

    if (title) {
      const tx = titlePos.x * OUT;
      const ty = titlePos.y * OUT;
      ctx.globalAlpha = titleOpacity / 100;
      
      if (titleShadow > 0) {
        ctx.shadowColor = 'rgba(0,0,0,0.8)';
        ctx.shadowBlur = titleShadow * scale;
        ctx.shadowOffsetX = (titleShadow / 2) * scale;
        ctx.shadowOffsetY = (titleShadow / 2) * scale;
      }
      
      if (titleStroke > 0) {
        ctx.strokeStyle = '#000000';
        ctx.lineWidth = titleStroke * scale;
        ctx.font = `700 ${titleSizeBig}px "${font}"`;
        ctx.strokeText(title, tx, ty);
      }
      
      ctx.fillStyle = titleColor;
      ctx.font = `700 ${titleSizeBig}px "${font}"`;
      ctx.fillText(title, tx, ty);
      ctx.shadowColor = 'transparent';
      ctx.shadowBlur = 0;
      ctx.globalAlpha = 1;
    }

    if (artist) {
      const ax = artistPos.x * OUT;
      const ay = artistPos.y * OUT;
      ctx.globalAlpha = artistOpacity / 100;
      
      if (artistShadow > 0) {
        ctx.shadowColor = 'rgba(0,0,0,0.8)';
        ctx.shadowBlur = artistShadow * scale;
        ctx.shadowOffsetX = (artistShadow / 2) * scale;
        ctx.shadowOffsetY = (artistShadow / 2) * scale;
      }
      
      if (artistStroke > 0) {
        ctx.strokeStyle = '#000000';
        ctx.lineWidth = artistStroke * scale;
        ctx.font = `600 ${artistSizeBig}px "${font}"`;
        ctx.strokeText(artist, ax, ay);
      }
      
      ctx.fillStyle = artistColor;
      ctx.font = `600 ${artistSizeBig}px "${font}"`;
      ctx.fillText(artist, ax, ay);
      ctx.shadowColor = 'transparent';
      ctx.shadowBlur = 0;
      ctx.globalAlpha = 1;
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
      <div 
        ref={previewRef}
        className="preview"
        style={{ cursor: dragging ? 'grabbing' : 'default' }}
      >
        <button className="closeBtn" onClick={onClose} aria-label="Close">
          <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
            <path d="M18 6L6 18M6 6l12 12" />
          </svg>
        </button>
        
        <canvas ref={canvasRef} className="canvas" width={W} height={H} />
        
        {showSafeZone && <div className="safe" />}
        
        {/* Draggable title handle */}
        {title && (
          <div
            style={{
              position:'absolute',
              left: `${titlePos.x * 100}%`,
              top: `${titlePos.y * 100}%`,
              width: 32,
              height: 32,
              marginLeft: -16,
              marginTop: -16,
              borderRadius: '50%',
              background: 'linear-gradient(135deg, #823FF3, #3928ED)',
              border: '2px solid white',
              boxShadow: '0 4px 12px rgba(0,0,0,0.2)',
              cursor: 'grab',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              color: 'white',
              fontWeight: 'bold',
              fontSize: 12,
              userSelect: 'none'
            }}
            onMouseDown={(e) => handleMouseDown(e, 'title')}
          >
            T
          </div>
        )}
        
        {/* Draggable artist handle */}
        {artist && (
          <div
            style={{
              position:'absolute',
              left: `${artistPos.x * 100}%`,
              top: `${artistPos.y * 100}%`,
              width: 32,
              height: 32,
              marginLeft: -16,
              marginTop: -16,
              borderRadius: '50%',
              background: 'linear-gradient(135deg, #0400ff, #8800ff)',
              border: '2px solid white',
              boxShadow: '0 4px 12px rgba(0,0,0,0.2)',
              cursor: 'grab',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              color: 'white',
              fontWeight: 'bold',
              fontSize: 12,
              userSelect: 'none'
            }}
            onMouseDown={(e) => handleMouseDown(e, 'artist')}
          >
            A
          </div>
        )}
      </div>

      <aside className="rightcol panel">
        <div style={{ 
          font:'500 14px/20px "IBM Plex Mono", ui-monospace', 
          color:'var(--sub)', 
          marginBottom: 16
        }}>
          {data.prompt || '—'}
        </div>

        {/* Panel Tabs */}
        <div className="tabs" style={{marginBottom:24}}>
          {['text', 'effects', 'filters'].map(panel => (
            <button
              key={panel}
              className={'tab' + (activePanel === panel ? ' tabOn' : '')}
              onClick={() => setActivePanel(panel)}
            >
              {panel.charAt(0).toUpperCase() + panel.slice(1)}
            </button>
          ))}
        </div>

        {activePanel === 'text' && (
          <>
            <div className="sideTitle">Add Text:</div>
            <input 
              className="control" 
              placeholder="Artist Name" 
              value={artist} 
              onChange={e=>setArtist(e.target.value)} 
            />
            <div style={{height:12}} />
            <input 
              className="control" 
              placeholder="Release Title" 
              value={title} 
              onChange={e=>setTitle(e.target.value)} 
            />

            <div className="sideTitle">Typography</div>
            <FontPicker value={font} onChange={setFont} />

            <div className="row mt8" style={{gap:12}}>
              <div className="rowColors">
                <div className="colorSwatch">
                  <input
                    type="color"
                    className="colorInput"
                    value={titleColor}
                    onChange={e=>setTitleColor(e.target.value)}
                    aria-label="Title color"
                  />
                </div>
                <div className="colorSwatch">
                  <input
                    type="color"
                    className="colorInput"
                    value={artistColor}
                    onChange={e=>setArtistColor(e.target.value)}
                    aria-label="Artist color"
                  />
                </div>
              </div>

              <select
                className="control"
                style={{flex:1}}
                value={size}
                onChange={e=>setSize(parseInt(e.target.value,10))}
              >
                {FONT_SIZES.map(opt => (
                  <option key={opt.value} value={opt.value}>{opt.label}</option>
                ))}
              </select>
            </div>

            <div style={{marginTop:16}}>
              <label style={{display:'flex', alignItems:'center', gap:8, cursor:'pointer'}}>
                <input 
                  type="checkbox"
                  checked={showSafeZone}
                  onChange={e=>setShowSafeZone(e.target.checked)}
                  style={{width:16, height:16}}
                />
                <span style={{font:'400 14px/20px Poppins'}}>Show safe zone</span>
              </label>
            </div>

            <div style={{marginTop:16, padding:12, background:'#F7F7FF', borderRadius:8, fontSize:12, lineHeight:'18px', color:'var(--sub)'}}>
              💡 <strong>Tip:</strong> Drag the purple (T) and blue (A) handles on the preview to reposition your text anywhere!
            </div>
          </>
        )}

        {activePanel === 'effects' && (
          <>
            <div className="sideTitle">Title Effects</div>
            
            <div style={{marginBottom:16}}>
              <div style={{display:'flex', justifyContent:'space-between', marginBottom:4, fontSize:14}}>
                <span>Stroke</span>
                <span style={{color:'var(--muted)'}}>{titleStroke}px</span>
              </div>
              <input 
                type="range"
                min="0"
                max="20"
                value={titleStroke}
                onChange={e=>setTitleStroke(Number(e.target.value))}
                style={{width:'100%'}}
              />
            </div>

            <div style={{marginBottom:16}}>
              <div style={{display:'flex', justifyContent:'space-between', marginBottom:4, fontSize:14}}>
                <span>Shadow</span>
                <span style={{color:'var(--muted)'}}>{titleShadow}px</span>
              </div>
              <input 
                type="range"
                min="0"
                max="30"
                value={titleShadow}
                onChange={e=>setTitleShadow(Number(e.target.value))}
                style={{width:'100%'}}
              />
            </div>

            <div style={{marginBottom:24}}>
              <div style={{display:'flex', justifyContent:'space-between', marginBottom:4, fontSize:14}}>
                <span>Opacity</span>
                <span style={{color:'var(--muted)'}}>{titleOpacity}%</span>
              </div>
              <input 
                type="range"
                min="0"
                max="100"
                value={titleOpacity}
                onChange={e=>setTitleOpacity(Number(e.target.value))}
                style={{width:'100%'}}
              />
            </div>

            <div className="sideTitle">Artist Effects</div>
            
            <div style={{marginBottom:16}}>
              <div style={{display:'flex', justifyContent:'space-between', marginBottom:4, fontSize:14}}>
                <span>Stroke</span>
                <span style={{color:'var(--muted)'}}>{artistStroke}px</span>
              </div>
              <input 
                type="range"
                min="0"
                max="20"
                value={artistStroke}
                onChange={e=>setArtistStroke(Number(e.target.value))}
                style={{width:'100%'}}
              />
            </div>

            <div style={{marginBottom:16}}>
              <div style={{display:'flex', justifyContent:'space-between', marginBottom:4, fontSize:14}}>
                <span>Shadow</span>
                <span style={{color:'var(--muted)'}}>{artistShadow}px</span>
              </div>
              <input 
                type="range"
                min="0"
                max="30"
                value={artistShadow}
                onChange={e=>setArtistShadow(Number(e.target.value))}
                style={{width:'100%'}}
              />
            </div>

            <div>
              <div style={{display:'flex', justifyContent:'space-between', marginBottom:4, fontSize:14}}>
                <span>Opacity</span>
                <span style={{color:'var(--muted)'}}>{artistOpacity}%</span>
              </div>
              <input 
                type="range"
                min="0"
                max="100"
                value={artistOpacity}
                onChange={e=>setArtistOpacity(Number(e.target.value))}
                style={{width:'100%'}}
              />
            </div>
          </>
        )}

        {activePanel === 'filters' && (
          <>
            <div className="sideTitle">Image Adjustments</div>
            
            <div style={{marginBottom:16}}>
              <div style={{display:'flex', justifyContent:'space-between', marginBottom:4, fontSize:14}}>
                <span>Brightness</span>
                <span style={{color:'var(--muted)'}}>{brightness}%</span>
              </div>
              <input 
                type="range"
                min="0"
                max="200"
                value={brightness}
                onChange={e=>setBrightness(Number(e.target.value))}
                style={{width:'100%'}}
              />
            </div>

            <div style={{marginBottom:16}}>
              <div style={{display:'flex', justifyContent:'space-between', marginBottom:4, fontSize:14}}>
                <span>Contrast</span>
                <span style={{color:'var(--muted)'}}>{contrast}%</span>
              </div>
              <input 
                type="range"
                min="0"
                max="200"
                value={contrast}
                onChange={e=>setContrast(Number(e.target.value))}
                style={{width:'100%'}}
              />
            </div>

            <div style={{marginBottom:16}}>
              <div style={{display:'flex', justifyContent:'space-between', marginBottom:4, fontSize:14}}>
                <span>Saturation</span>
                <span style={{color:'var(--muted)'}}>{saturation}%</span>
              </div>
              <input 
                type="range"
                min="0"
                max="200"
                value={saturation}
                onChange={e=>setSaturation(Number(e.target.value))}
                style={{width:'100%'}}
              />
            </div>

            <div style={{marginBottom:16}}>
              <div style={{display:'flex', justifyContent:'space-between', marginBottom:4, fontSize:14}}>
                <span>Blur</span>
                <span style={{color:'var(--muted)'}}>{blur}px</span>
              </div>
              <input 
                type="range"
                min="0"
                max="10"
                value={blur}
                onChange={e=>setBlur(Number(e.target.value))}
                style={{width:'100%'}}
              />
            </div>

            <button 
              className="btn btnBlock"
              onClick={()=>{
                setBrightness(100);
                setContrast(100);
                setSaturation(100);
                setBlur(0);
              }}
              style={{fontSize:14}}
            >
              Reset All Filters
            </button>
          </>
        )}

        <div style={{marginTop:24, paddingTop:24, borderTop:'1px solid var(--border)'}}>
          <button 
            className="btn btnGradient btnBlock"
            onClick={downloadPNG}
          >
            🚀 Upscale & Download
          </button>
        </div>
      </aside>
    </section>
  );
}
