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
    <div ref={boxRef} className="relative">
      <button
        type="button"
        className="w-full h-11 px-3 rounded-lg border border-gray-300 bg-white flex items-center justify-between hover:border-purple-500 transition-colors"
        onClick={()=>setOpen(v=>!v)}
      >
        <span style={{ fontFamily:`"${current.css}", sans-serif` }} className="font-semibold">{current.label}</span>
        <svg className={`w-4 h-4 transition-transform ${open ? 'rotate-180' : ''}`} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
          <path d="M6 9l6 6 6-6"/>
        </svg>
      </button>

      {open && (
        <div className="absolute left-0 right-0 mt-2 max-h-80 bg-white border border-gray-300 rounded-xl shadow-2xl overflow-auto z-50 animate-in fade-in slide-in-from-top-2 duration-200">
          {FONTS.map(f => (
            <button
              key={f.css}
              type="button"
              onClick={() => { onChange(f.css); setOpen(false); }}
              className={`w-full p-3 flex items-center gap-3 hover:bg-purple-50 transition-colors ${f.css===value ? 'bg-purple-100' : ''}`}
            >
              <div className="w-8 h-8 rounded-lg border border-gray-200 flex items-center justify-center text-lg font-bold" style={{fontFamily:`"${f.css}", sans-serif`}}>
                {f.demo}
              </div>
              <div className="text-left">
                <div className="font-semibold text-sm">{f.label}</div>
                <div className="text-xs opacity-60" style={{fontFamily:`"${f.css}", sans-serif`}}>Artist • Title</div>
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
    <div className="min-h-screen bg-gradient-to-br from-purple-50 via-white to-blue-50">
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=Poppins:wght@300;400;500;600;700&family=IBM+Plex+Mono:wght@400;500;600;700&family=DM+Sans:wght@400;500;600;700&family=Inter:wght@400;600;700&family=Bebas+Neue&family=Barlow+Condensed:wght@600;700&family=Oswald:wght@500;700&family=Montserrat+Alternates:wght@600;700&family=Nunito+Sans:wght@600;700&family=Archivo:wght@600;700&family=Space+Grotesk:wght@600;700&family=Playfair+Display:wght@700&family=Raleway:wght@600;700&family=Rubik:wght@600;700&display=swap');
        
        body {
          font-family: 'Poppins', sans-serif;
        }
        
        @keyframes spin {
          to { transform: rotate(360deg); }
        }
        @keyframes pulse-slow {
          0%, 100% { opacity: 1; }
          50% { opacity: 0.5; }
        }
        .animate-spin { animation: spin 1s linear infinite; }
        .animate-pulse-slow { animation: pulse-slow 2s ease-in-out infinite; }
      `}</style>

      <main className="max-w-7xl mx-auto px-6 py-12">
        <header className="flex items-center justify-between mb-12">
          <h1 className="text-5xl font-bold bg-gradient-to-r from-purple-600 to-blue-600 bg-clip-text text-transparent" style={{fontFamily: 'Poppins'}}>
            Artwork Generator
          </h1>
          {history.length > 0 && mode === 'gen' && (
            <button className="px-4 py-2 text-sm font-medium text-purple-600 hover:bg-purple-50 rounded-lg transition-colors" style={{fontFamily: 'Poppins'}}>
              History ({history.length})
            </button>
          )}
        </header>

        {mode==='gen' && (
          <>
            <section className="bg-white rounded-2xl shadow-lg border border-gray-200 p-8 mb-8">
              <div className="flex gap-4">
                <input
                  className="flex-1 text-xl px-4 py-3 rounded-xl border-0 bg-white focus:outline-none focus:ring-0 transition-all"
                  style={{fontFamily: 'Poppins', fontWeight: 400, boxShadow: 'none'}}
                  placeholder="Describe the vibe of your artwork..."
                  value={prompt}
                  onChange={e=>setPrompt(e.target.value)}
                  onKeyDown={e => e.key === 'Enter' && onGenerate()}
                />
                <button 
                  className="px-8 py-3 rounded-full bg-gradient-to-r from-purple-600 to-blue-600 text-white font-semibold hover:shadow-lg hover:scale-105 transition-all disabled:opacity-50 disabled:hover:scale-100"
                  style={{fontFamily: 'Poppins'}}
                  onClick={onGenerate}
                  disabled={isLoading}
                >
                  {isLoading ? 'Generating...' : 'Generate'}
                </button>
              </div>
            </section>

            <div className="flex items-end gap-4 mb-4">
              <div className="font-bold text-gray-700" style={{fontFamily: 'IBM Plex Mono'}}>Add Prompts:</div>
              <div className="flex gap-2">
                {[
                  {key:'genre', label:'💿 Genre'},
                  {key:'mood', label:'🙂 Mood'},
                  {key:'style', label:'🖌️ Style'},
                  {key:'texture', label:'🌫️ Texture'}
                ].map(t => (
                  <button
                    key={t.key}
                    className={`px-4 py-2 rounded-lg font-semibold transition-all ${
                      activeTab===t.key 
                        ? 'bg-gradient-to-r from-purple-600 to-blue-600 text-white shadow-md' 
                        : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                    }`}
                    style={{fontFamily: 'IBM Plex Mono'}}
                    onClick={()=>setActiveTab(t.key)}
                  >
                    {t.label}
                  </button>
                ))}
              </div>
            </div>

            <div className="flex flex-wrap gap-2 mb-8">
              {PROMPTS[activeTab].map(v => (
                <button
                  key={v}
                  className={`px-4 py-2 rounded-lg text-sm font-medium transition-all ${
                    picks[activeTab].includes(v)
                      ? 'bg-gray-900 text-white shadow-md hover:scale-105'
                      : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                  }`}
                  style={{fontFamily: 'IBM Plex Mono'}}
                  onClick={()=>toggle(v)}
                >
                  + {v}
                </button>
              ))}
            </div>

            {isLoading && (
              <div className="flex flex-col items-center justify-center h-64 border-2 border-dashed border-purple-300 rounded-2xl bg-purple-50">
                <div className="w-16 h-16 border-4 border-purple-200 border-t-purple-600 rounded-full animate-spin mb-4" />
                <p className="text-purple-600 font-medium animate-pulse-slow">Creating your artwork...</p>
              </div>
            )}

            {!isLoading && images.length>0 && (
              <section>
                <h3 className="text-xl font-semibold mb-4">Today</h3>
                <div className="grid grid-cols-4 gap-6">
                  {images.map((src,i)=>(
                    <div
                      key={i}
                      className="aspect-square rounded-xl overflow-hidden cursor-pointer group relative shadow-md hover:shadow-2xl transition-all hover:scale-105"
                      onClick={()=>{
                        setSelected({ src, prompt: assembledPrompt(prompt, picks) });
                        setMode('edit');
                      }}
                    >
                      <img src={src} className="w-full h-full object-cover" alt="" />
                      <div className="absolute inset-0 bg-gradient-to-t from-black/60 to-transparent opacity-0 group-hover:opacity-100 transition-opacity flex items-end p-4">
                        <span className="text-white font-medium text-sm">Click to edit</span>
                      </div>
                    </div>
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
    </div>
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
  
  const [titlePos, setTitlePos] = useState({ x: 0.5, y: 0.85 });
  const [artistPos, setArtistPos] = useState({ x: 0.5, y: 0.92 });
  const [dragging, setDragging] = useState(null);
  
  const [titleStroke, setTitleStroke] = useState(0);
  const [titleShadow, setTitleShadow] = useState(0);
  const [titleOpacity, setTitleOpacity] = useState(100);
  const [artistStroke, setArtistStroke] = useState(0);
  const [artistShadow, setArtistShadow] = useState(0);
  const [artistOpacity, setArtistOpacity] = useState(100);
  
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
    
    ctx.filter = `brightness(${brightness}%) contrast(${contrast}%) saturate(${saturation}%) blur(${blur}px)`;
    ctx.clearRect(0,0,W,H);
    ctx.drawImage(img,0,0,W,H);
    ctx.filter = 'none';

    const titleSize = size;
    const artistSize = Math.round(size*0.6);
    ctx.textBaseline = 'middle';
    ctx.textAlign = 'center';

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
    <div className="flex">
      <div className="flex-1 px-6 py-12" style={{marginRight: '384px'}}>
        <button
          className="mb-4 px-4 py-2 rounded-lg bg-white border border-gray-300 hover:bg-gray-50 flex items-center gap-2 transition-colors"
          onClick={onClose}
        >
          <svg className="w-5 h-5" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
            <path d="M19 12H5M12 19l-7-7 7-7"/>
          </svg>
          Back to Generator
        </button>

        <div 
          ref={previewRef}
          className="relative w-full max-w-2xl mx-auto aspect-square rounded-xl shadow-2xl overflow-hidden bg-white"
          style={{ cursor: dragging ? 'grabbing' : 'default' }}
        >
          <canvas ref={canvasRef} className="w-full h-full" width={W} height={H} />
          
          {showSafeZone && (
            <div className="absolute inset-[5%] border-2 border-dashed border-white/30 pointer-events-none rounded-lg" />
          )}
          
          {title && (
            <div
              className="absolute w-8 h-8 -ml-4 -mt-4 rounded-full bg-purple-600 border-2 border-white shadow-lg cursor-grab hover:scale-110 transition-transform flex items-center justify-center"
              style={{ left: `${titlePos.x * 100}%`, top: `${titlePos.y * 100}%` }}
              onMouseDown={(e) => handleMouseDown(e, 'title')}
            >
              <span className="text-white text-xs font-bold">T</span>
            </div>
          )}
          
          {artist && (
            <div
              className="absolute w-8 h-8 -ml-4 -mt-4 rounded-full bg-blue-600 border-2 border-white shadow-lg cursor-grab hover:scale-110 transition-transform flex items-center justify-center"
              style={{ left: `${artistPos.x * 100}%`, top: `${artistPos.y * 100}%` }}
              onMouseDown={(e) => handleMouseDown(e, 'artist')}
            >
              <span className="text-white text-xs font-bold">A</span>
            </div>
          )}
        </div>
      </div>

      <aside className="w-96 bg-white border-l border-gray-200 p-6 flex flex-col fixed right-0 top-0 h-screen overflow-y-auto">
        <div className="text-sm text-gray-500 mb-4 pb-4 border-b border-gray-200" style={{fontFamily: 'IBM Plex Mono', lineHeight: '1.5'}}>
          {data.prompt || '—'}
        </div>

        <div className="flex gap-2 mb-6">
          {['text', 'effects', 'filters'].map(panel => (
            <button
              key={panel}
              className={`flex-1 px-3 py-2 rounded-lg text-sm font-medium transition-all ${
                activePanel === panel
                  ? 'bg-purple-600 text-white'
                  : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
              }`}
              style={{fontFamily: 'IBM Plex Mono'}}
              onClick={() => setActivePanel(panel)}
            >
              {panel.charAt(0).toUpperCase() + panel.slice(1)}
            </button>
          ))}
        </div>

        <div className="flex-1">{activePanel === 'text' && (
          <div className="space-y-4">
            <div>
              <label className="block text-sm font-medium mb-2">Release Title</label>
              <input 
                className="w-full px-3 py-2 rounded-lg border border-gray-300 focus:border-purple-500 focus:ring-2 focus:ring-purple-200 outline-none"
                placeholder="Release Title"
                value={title}
                onChange={e=>setTitle(e.target.value)}
              />
            </div>

            <div>
              <label className="block text-sm font-medium mb-2">Artist Name</label>
              <input 
                className="w-full px-3 py-2 rounded-lg border border-gray-300 focus:border-purple-500 focus:ring-2 focus:ring-purple-200 outline-none"
                placeholder="Artist Name"
                value={artist}
                onChange={e=>setArtist(e.target.value)}
              />
            </div>

            <div>
              <label className="block text-sm font-medium mb-2">Font Family</label>
              <FontPicker value={font} onChange={setFont} />
            </div>

            <div className="flex gap-3">
              <div className="flex-1">
                <label className="block text-sm font-medium mb-2">Title Color</label>
                <input 
                  type="color"
                  className="w-full h-10 rounded-lg border border-gray-300 cursor-pointer"
                  value={titleColor}
                  onChange={e=>setTitleColor(e.target.value)}
                />
              </div>
              <div className="flex-1">
                <label className="block text-sm font-medium mb-2">Artist Color</label>
                <input 
                  type="color"
                  className="w-full h-10 rounded-lg border border-gray-300 cursor-pointer"
                  value={artistColor}
                  onChange={e=>setArtistColor(e.target.value)}
                />
              </div>
            </div>

            <div>
              <label className="block text-sm font-medium mb-2">Font Size</label>
              <select
                className="w-full h-11 px-3 rounded-lg border border-gray-300 bg-white"
                value={size}
                onChange={e=>setSize(parseInt(e.target.value,10))}
              >
                {FONT_SIZES.map(opt => (
                  <option key={opt.value} value={opt.value}>{opt.label}</option>
                ))}
              </select>
            </div>

            <div className="flex items-center gap-2">
              <input 
                type="checkbox"
                id="safeZone"
                checked={showSafeZone}
                onChange={e=>setShowSafeZone(e.target.checked)}
                className="w-4 h-4 rounded border-gray-300 text-purple-600 focus:ring-purple-500"
              />
              <label htmlFor="safeZone" className="text-sm font-medium">Show safe zone</label>
            </div>

            <div className="mt-4 p-3 bg-purple-50 border border-purple-200 rounded-lg text-sm text-purple-800">
              💡 <strong>Tip:</strong> Drag the purple (T) and blue (A) handles to reposition text
            </div>
          </div>
        )}

        {activePanel === 'effects' && (
          <div className="space-y-4">
            <div className="border-b border-gray-200 pb-4">
              <h4 className="font-semibold mb-3">Title Effects</h4>
              
              <div className="space-y-3">
                <div>
                  <label className="flex justify-between text-sm mb-1">
                    <span>Stroke</span>
                    <span className="text-gray-500">{titleStroke}px</span>
                  </label>
                  <input 
                    type="range"
                    min="0"
                    max="20"
                    value={titleStroke}
                    onChange={e=>setTitleStroke(Number(e.target.value))}
                    className="w-full accent-purple-600"
                  />
                </div>

                <div>
                  <label className="flex justify-between text-sm mb-1">
                    <span>Shadow</span>
                    <span className="text-gray-500">{titleShadow}px</span>
                  </label>
                  <input 
                    type="range"
                    min="0"
                    max="30"
                    value={titleShadow}
                    onChange={e=>setTitleShadow(Number(e.target.value))}
                    className="w-full accent-purple-600"
                  />
                </div>

                <div>
                  <label className="flex justify-between text-sm mb-1">
                    <span>Opacity</span>
                    <span className="text-gray-500">{titleOpacity}%</span>
                  </label>
                  <input 
                    type="range"
                    min="0"
                    max="100"
                    value={titleOpacity}
                    onChange={e=>setTitleOpacity(Number(e.target.value))}
                    className="w-full accent-purple-600"
                  />
                </div>
              </div>
            </div>

            <div>
              <h4 className="font-semibold mb-3">Artist Effects</h4>
              
              <div className="space-y-3">
                <div>
                  <label className="flex justify-between text-sm mb-1">
                    <span>Stroke</span>
                    <span className="text-gray-500">{artistStroke}px</span>
                  </label>
                  <input 
                    type="range"
                    min="0"
                    max="20"
                    value={artistStroke}
                    onChange={e=>setArtistStroke(Number(e.target.value))}
                    className="w-full accent-purple-600"
                  />
                </div>

                <div>
                  <label className="flex justify-between text-sm mb-1">
                    <span>Shadow</span>
                    <span className="text-gray-500">{artistShadow}px</span>
                  </label>
                  <input 
                    type="range"
                    min="0"
                    max="30"
                    value={artistShadow}
                    onChange={e=>setArtistShadow(Number(e.target.value))}
                    className="w-full accent-purple-600"
                  />
                </div>

                <div>
                  <label className="flex justify-between text-sm mb-1">
                    <span>Opacity</span>
                    <span className="text-gray-500">{artistOpacity}%</span>
                  </label>
                  <input 
                    type="range"
                    min="0"
                    max="100"
                    value={artistOpacity}
                    onChange={e=>setArtistOpacity(Number(e.target.value))}
                    className="w-full accent-purple-600"
                  />
                </div>
              </div>
            </div>
          </div>
        )}

        {activePanel === 'filters' && (
          <div className="space-y-4">
            <div>
              <label className="flex justify-between text-sm mb-1">
                <span>Brightness</span>
                <span className="text-gray-500">{brightness}%</span>
              </label>
              <input 
                type="range"
                min="0"
                max="200"
                value={brightness}
                onChange={e=>setBrightness(Number(e.target.value))}
                className="w-full accent-purple-600"
              />
            </div>

            <div>
              <label className="flex justify-between text-sm mb-1">
                <span>Contrast</span>
                <span className="text-gray-500">{contrast}%</span>
              </label>
              <input 
                type="range"
                min="0"
                max="200"
                value={contrast}
                onChange={e=>setContrast(Number(e.target.value))}
                className="w-full accent-purple-600"
              />
            </div>

            <div>
              <label className="flex justify-between text-sm mb-1">
                <span>Saturation</span>
                <span className="text-gray-500">{saturation}%</span>
              </label>
              <input 
                type="range"
                min="0"
                max="200"
                value={saturation}
                onChange={e=>setSaturation(Number(e.target.value))}
                className="w-full accent-purple-600"
              />
            </div>

            <div>
              <label className="flex justify-between text-sm mb-1">
                <span>Blur</span>
                <span className="text-gray-500">{blur}px</span>
              </label>
              <input 
                type="range"
                min="0"
                max="10"
                value={blur}
                onChange={e=>setBlur(Number(e.target.value))}
                className="w-full accent-purple-600"
              />
            </div>

            <button 
              className="w-full px-4 py-2 rounded-lg bg-gray-100 hover:bg-gray-200 text-sm font-medium transition-colors"
              onClick={()=>{
                setBrightness(100);
                setContrast(100);
                setSaturation(100);
                setBlur(0);
              }}
            >
              Reset Filters
            </button>
          </div>
        )}

        </div>

        <div className="mt-auto pt-6 border-t border-gray-200">
          <button 
            className="w-full px-6 py-3 rounded-full bg-gradient-to-r from-purple-600 to-blue-600 text-white font-semibold hover:shadow-lg hover:scale-105 transition-all"
            style={{fontFamily: 'Poppins'}}
            onClick={downloadPNG}
          >
            🚀 Upscale & Download
          </button>
        </div>
      </aside>
    </div>
  );
}
