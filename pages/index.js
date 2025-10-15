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
  { label:'Bungee', css:'Bungee', demo:'Aa' },
  { label:'Righteous', css:'Righteous', demo:'Aa' },
  { label:'Permanent Marker', css:'Permanent Marker', demo:'Aa' },
  { label:'Fredoka One', css:'Fredoka One', demo:'Aa' },
  { label:'Black Ops One', css:'Black Ops One', demo:'Aa' },
  { label:'Londrina Solid', css:'Londrina Solid', demo:'Aa' },
  { label:'Alfa Slab One', css:'Alfa Slab One', demo:'Aa' },
  { label:'Pacifico', css:'Pacifico', demo:'Aa' },
  { label:'Dancing Script', css:'Dancing Script', demo:'Aa' },
  { label:'Caveat', css:'Caveat', demo:'Aa' },
  { label:'Indie Flower', css:'Indie Flower', demo:'Aa' },
  { label:'Shadows Into Light', css:'Shadows Into Light', demo:'Aa' },
  { label:'Amatic SC', css:'Amatic SC', demo:'Aa' },
  { label:'Satisfy', css:'Satisfy', demo:'Aa' },
];

const FONT_SIZES = [32, 40, 48, 56, 64, 72, 84, 96, 112, 128, 144, 160, 180, 200, 220, 240];

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
        <div className="absolute left-0 right-0 mt-2 max-h-80 bg-white border border-gray-300 rounded-xl shadow-2xl overflow-auto z-50">
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
  const [showHistory, setShowHistory] = useState(false);
  
  const [userStatus, setUserStatus] = useState(null);
  const [showUpgradeModal, setShowUpgradeModal] = useState(false);
  const [usageLoading, setUsageLoading] = useState(true);

  useEffect(() => {
    fetchUserStatus();
  }, []);

  async function fetchUserStatus() {
    try {
      setUsageLoading(true);
      await new Promise(resolve => setTimeout(resolve, 500));
      
                    const mockStatus = {
        user_id: 123,
        subscription: {
          product_code: 'professional', // Change to 'artist' or 'label-five' to see different badges
          name: 'Professional',
          tier: 'Professional'
        },
        usage: {
          current_month: '2025-10',
          generations_used: 12,
          generations_limit: 30,
          generations_remaining: 18,
          resets_at: '2025-11-01T00:00:00Z'
        },
        can_generate: true
      };
      
      setUserStatus(mockStatus);
    } catch (error) {
      console.error('Failed to fetch user status:', error);
    } finally {
      setUsageLoading(false);
    }
  }

  const toggle = (value) => {
    setPicks(p => {
      const cur = p[activeTab];
      const next = cur.includes(value) ? cur.filter(x => x!==value) : [...cur, value];
      return { ...p, [activeTab]: next };
    });
  };

  async function onGenerate(){
    if (userStatus && userStatus.usage.generations_remaining === 0) {
      setShowUpgradeModal(true);
      return;
    }

    try {
      setIsLoading(true);
      setImages([]);
      
      // Get auth token for production (uncomment when deploying)
      // const token = await getAuthTokenFromParent();
      
      const resp = await fetch('/api/generate', {
        method:'POST',
        headers: {
          'Content-Type':'application/json',
          // 'Authorization': `Bearer ${token}`, // Uncomment for production
        },
        body: JSON.stringify({ prompt, pills: picks })
      });
      
      const data = await resp.json();
      
      if (!resp.ok) {
        if (resp.status === 429) {
          // Limit reached
          setShowUpgradeModal(true);
          throw new Error(data.message || 'Generation limit reached');
        }
        throw new Error(data?.error || 'Generation failed');
      }
      
      const generatedImages = data.images || [];
      setImages(generatedImages);
      
      setHistory(prev => [{
        timestamp: Date.now(),
        prompt: assembledPrompt(prompt, picks),
        images: generatedImages
      }, ...prev].slice(0, 10));
      
      // Update usage counter after successful generation
      if (userStatus) {
        setUserStatus(prev => ({
          ...prev,
          usage: {
            ...prev.usage,
            generations_used: prev.usage.generations_used + 1,
            generations_remaining: prev.usage.generations_remaining - 1
          },
          can_generate: prev.usage.generations_remaining - 1 > 0
        }));
      }
      
      // Optionally refresh from server to ensure accuracy
      // await fetchUserStatus();
      
    } catch (e) {
      alert(e.message || 'Something went wrong generating images.');
    } finally {
      setIsLoading(false);
    }
  }

  if (mode === 'edit' && selected) {
    return <Editor data={selected} onClose={()=>setMode('gen')} />;
  }

  const isLimitReached = userStatus && userStatus.usage.generations_remaining === 0;
  const isRunningLow = userStatus && userStatus.usage.generations_remaining <= 3 && userStatus.usage.generations_remaining > 0;

  return (
    <div className="min-h-screen bg-gradient-to-br from-purple-50 via-white to-blue-50">
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=IBM+Plex+Mono:wght@400;500;600;700&family=DM+Sans:wght@400;500;600;700&family=Inter:wght@400;600;700&family=Poppins:wght@400;600;700&family=Bebas+Neue&family=Barlow+Condensed:wght@600;700&family=Oswald:wght@500;700&family=Montserrat+Alternates:wght@600;700&family=Nunito+Sans:wght@600;700&family=Archivo:wght@600;700&family=Space+Grotesk:wght@600;700&family=Playfair+Display:wght@700&family=Raleway:wght@600;700&family=Rubik:wght@600;700&family=Bungee&family=Righteous&family=Permanent+Marker&family=Fredoka+One&family=Black+Ops+One&family=Londrina+Solid:wght@400;900&family=Alfa+Slab+One&family=Pacifico&family=Dancing+Script:wght@400;700&family=Caveat:wght@400;700&family=Indie+Flower&family=Shadows+Into+Light&family=Amatic+SC:wght@400;700&family=Satisfy&display=swap');
        
        @font-face {
          font-family: 'Satoshi';
          src: url('/assets/fonts/Satoshi-Regular.woff2') format('woff2');
          font-weight: 400;
          font-display: swap;
        }
        @font-face {
          font-family: 'Satoshi';
          src: url('/assets/fonts/Satoshi-Bold.woff2') format('woff2');
          font-weight: 700;
          font-display: swap;
        }
        
        body {
          font-family: 'Satoshi', 'DM Sans', sans-serif;
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

      <main className="max-w-7xl mx-auto px-4 sm:px-6 py-6 sm:py-12">
        <header className="flex flex-col items-center justify-center mb-6 sm:mb-12 gap-4">
          <h1 className="text-4xl sm:text-6xl font-bold text-black text-center" style={{fontFamily: 'Satoshi', fontWeight: 700}}>
            Artwork Generator
          </h1>
          
          {userStatus && !usageLoading && (
            <div className="flex flex-col items-center gap-3 w-full max-w-md">
              <div className="w-full px-4 py-3 bg-white rounded-xl border border-gray-200 shadow-sm">
                <div className="flex items-center justify-between mb-2">
                  <span className="text-sm font-medium text-gray-700">
                    {userStatus.usage.generations_remaining} / {userStatus.usage.generations_limit} generations left
                  </span>
                  <span 
                    className="px-3 py-1 text-xs font-bold rounded uppercase"
                    style={{
                      fontFamily: 'Poppins',
                      fontWeight: 700,
                      letterSpacing: '-0.4px',
                      color: '#000000',
                      backgroundColor: 
                        userStatus.subscription.product_code === 'artist' ? '#aa00ff' :
                        userStatus.subscription.product_code === 'professional' ? '#00ff99' :
                        userStatus.subscription.product_code.includes('label') ? '#F6C443' :
                        '#aa00ff'
                    }}
                  >
                    {userStatus.subscription.product_code === 'artist' ? 'STARTER' :
                     userStatus.subscription.product_code === 'professional' ? 'PRO' :
                     userStatus.subscription.product_code.includes('label') && userStatus.subscription.product_code !== 'label-unlimited' ? 'LABELS' :
                     userStatus.subscription.product_code === 'label-unlimited' ? 'DITTO PLUS' :
                     userStatus.subscription.name.toUpperCase()}
                  </span>
                </div>
                
                <div className="w-full bg-gray-200 rounded-full h-2 overflow-hidden">
                  <div 
                    className={`h-full transition-all duration-500 ${
                      isLimitReached ? 'bg-red-500' : 
                      isRunningLow ? 'bg-orange-500' : 
                      'bg-gradient-to-r from-purple-600 to-blue-600'
                    }`}
                    style={{ 
                      width: `${(userStatus.usage.generations_remaining / userStatus.usage.generations_limit) * 100}%` 
                    }}
                  />
                </div>
                
                {isRunningLow && (
                  <div className="text-xs text-orange-600 mt-2 flex items-center gap-1">
                    <span>⚠️</span>
                    <span>Running low! Resets {new Date(userStatus.usage.resets_at).toLocaleDateString()}</span>
                  </div>
                )}
              </div>
            </div>
          )}
          
          {history.length > 0 && (
            <button 
              className={`px-4 py-2 text-sm font-medium rounded-lg transition-colors ${
                showHistory 
                  ? 'bg-purple-600 text-white' 
                  : 'text-purple-600 hover:bg-purple-50'
              }`}
              style={{fontFamily: 'Satoshi'}}
              onClick={() => setShowHistory(!showHistory)}
            >
              {showHistory ? 'Hide History' : `History (${history.length})`}
            </button>
          )}
        </header>

        <section className="bg-white rounded-2xl shadow-lg border border-gray-200 p-4 sm:p-8 mb-6 sm:mb-8">
          <div className="flex flex-col sm:flex-row gap-3 sm:gap-4">
            <input
              className="flex-1 text-lg sm:text-xl px-4 py-3 rounded-xl border-0 bg-white focus:outline-none focus:ring-0 transition-all"
              style={{fontFamily: 'Satoshi', fontWeight: 400, boxShadow: 'none'}}
              placeholder="Describe the vibe..."
              value={prompt}
              onChange={e=>setPrompt(e.target.value)}
              onKeyDown={e => e.key === 'Enter' && !isLimitReached && onGenerate()}
            />
            <button 
              className="px-6 sm:px-8 py-3 rounded-full bg-gradient-to-r from-purple-600 to-blue-600 text-white font-semibold hover:shadow-lg hover:scale-105 transition-all disabled:opacity-50 disabled:hover:scale-100 disabled:cursor-not-allowed sm:whitespace-nowrap"
              style={{fontFamily: 'Poppins'}}
              onClick={onGenerate}
              disabled={isLoading || isLimitReached}
            >
              {isLoading ? 'Generating...' : 'Generate'}
            </button>
          </div>
          
          {isLimitReached && (
            <div className="mt-4 p-4 bg-gradient-to-r from-orange-50 to-red-50 border border-orange-200 rounded-xl">
              <div className="flex items-start gap-3">
                <span className="text-2xl">🚫</span>
                <div className="flex-1">
                  <h3 className="font-semibold text-orange-900 mb-1">Monthly Limit Reached</h3>
                  <p className="text-sm text-orange-700 mb-3">
                    You've used all <strong>{userStatus.usage.generations_limit} generations</strong> for this month.
                  </p>
                  <div className="flex gap-2">
                    <button 
                      className="px-4 py-2 bg-orange-600 text-white text-sm font-semibold rounded-lg hover:bg-orange-700 transition-colors"
                      style={{fontFamily: 'Satoshi'}}
                      onClick={() => setShowUpgradeModal(true)}
                    >
                      See Upgrade Options
                    </button>
                    <div className="px-3 py-2 bg-white/80 text-xs text-gray-600 rounded-lg flex items-center gap-1.5">
                      <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
                      </svg>
                      Resets {new Date(userStatus.usage.resets_at).toLocaleDateString('en-US', { month: 'short', day: 'numeric' })}
                    </div>
                  </div>
                </div>
              </div>
            </div>
          )}
        </section>

        <div className="flex flex-col sm:flex-row sm:items-end gap-3 sm:gap-4 mb-4">
          <div className="font-bold text-gray-700 text-sm sm:text-base" style={{fontFamily: '"IBM Plex Mono", Satoshi, sans-serif'}}>Add Prompts:</div>
          <div className="flex gap-2 overflow-x-auto pb-2 sm:pb-0">
            {[
              {key:'genre', label:'💿 Genre'},
              {key:'mood', label:'🙂 Mood'},
              {key:'style', label:'🖌️ Style'},
              {key:'texture', label:'🌫️ Texture'}
            ].map(t => (
              <button
                key={t.key}
                className={`px-3 sm:px-4 py-2 rounded-lg font-semibold transition-all whitespace-nowrap text-sm sm:text-base ${
                  activeTab===t.key 
                    ? 'bg-gradient-to-r from-purple-600 to-blue-600 text-white shadow-md' 
                    : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                }`}
                style={{fontFamily: '"IBM Plex Mono", Satoshi, sans-serif'}}
                onClick={()=>setActiveTab(t.key)}
              >
                {t.label}
              </button>
            ))}
          </div>
        </div>

        <div className="flex flex-wrap gap-2 mb-6 sm:mb-8">
          {PROMPTS[activeTab].map(v => (
            <button
              key={v}
              className={`px-3 sm:px-4 py-2 rounded-lg text-xs sm:text-sm font-medium transition-all ${
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
            <h3 className="text-lg sm:text-xl font-semibold mb-4">Today</h3>
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 sm:gap-6">
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
                  <div className="absolute inset-0 bg-gradient-to-t from-black/60 to-transparent opacity-0 group-hover:opacity-100 transition-opacity flex items-end p-3 sm:p-4">
                    <span className="text-white font-medium text-xs sm:text-sm">Click to edit</span>
                  </div>
                </div>
              ))}
            </div>
          </section>
        )}

        {showHistory && history.length > 0 && (
          <section className="mt-12">
            <h3 className="text-lg sm:text-xl font-semibold mb-4 flex items-center gap-2">
              <span>Previous Generations</span>
              <button 
                onClick={() => setHistory([])}
                className="text-sm text-red-600 hover:text-red-700 font-normal"
              >
                Clear All
              </button>
            </h3>
            
            {history.map((gen) => (
              <div key={gen.timestamp} className="mb-8">
                <div className="flex items-center justify-between mb-3">
                  <p className="text-sm text-gray-600" style={{fontFamily: '"IBM Plex Mono", Satoshi, sans-serif'}}>
                    {new Date(gen.timestamp).toLocaleString()}
                  </p>
                  <p className="text-xs text-gray-500 italic line-clamp-1 max-w-md">
                    {gen.prompt}
                  </p>
                </div>
                <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 sm:gap-6">
                  {gen.images.map((src, i) => (
                    <div
                      key={i}
                      className="aspect-square rounded-xl overflow-hidden cursor-pointer group relative shadow-md hover:shadow-2xl transition-all hover:scale-105"
                      onClick={() => {
                        setSelected({ src, prompt: gen.prompt });
                        setMode('edit');
                      }}
                    >
                      <img src={src} className="w-full h-full object-cover" alt="" />
                      <div className="absolute inset-0 bg-gradient-to-t from-black/60 to-transparent opacity-0 group-hover:opacity-100 transition-opacity flex items-end p-3 sm:p-4">
                        <span className="text-white font-medium text-xs sm:text-sm">Click to edit</span>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            ))}
          </section>
        )}
      </main>

      {showUpgradeModal && userStatus && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4" onClick={() => setShowUpgradeModal(false)}>
          <div className="bg-white rounded-2xl max-w-lg w-full p-6 shadow-2xl" onClick={e => e.stopPropagation()}>
            <div className="text-center">
              <div className="text-6xl mb-4">🚀</div>
              <h2 className="text-2xl font-bold mb-2" style={{fontFamily: 'Satoshi'}}>Upgrade for More Generations</h2>
              <p className="text-gray-600 mb-6">
                You've reached your limit. Unlock more creativity!
              </p>
              
              <div className="space-y-3 mb-6">
                <div className="p-4 bg-gradient-to-r from-purple-50 to-blue-50 border-2 border-purple-200 rounded-xl text-left">
                  <div className="flex items-center justify-between mb-2">
                    <div className="font-bold text-purple-900 text-lg">Professional</div>
                    <span className="px-2.5 py-1 bg-purple-600 text-white text-xs font-bold rounded-full">6X MORE</span>
                  </div>
                  <div className="text-3xl font-bold text-purple-600 mb-1">30 <span className="text-base font-normal text-gray-600">generations/month</span></div>
                  <div className="text-sm text-purple-700 font-medium">Perfect for active creators</div>
                </div>
              </div>
              
              <div className="flex gap-3">
                <button
                  className="flex-1 px-4 py-3 bg-gray-100 text-gray-700 font-semibold rounded-lg hover:bg-gray-200 transition-colors"
                  style={{fontFamily: 'Satoshi'}}
                  onClick={() => setShowUpgradeModal(false)}
                >
                  Maybe Later
                </button>
                <button
                  className="flex-1 px-4 py-3 bg-gradient-to-r from-purple-600 to-blue-600 text-white font-semibold rounded-lg hover:shadow-lg transition-all"
                  style={{fontFamily: 'Satoshi'}}
                  onClick={() => setShowUpgradeModal(false)}
                >
                  Upgrade Now
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

function Editor({ data, onClose }){
  const W = 900, H = 900;
  const canvasRef = useRef(null);
  const previewRef = useRef(null);
  const [img, setImg] = useState(null);

  const [title,setTitle] = useState('');
  const [artist,setArtist] = useState('');
  const [font,setFont] = useState(FONTS[0].css);
  const [titleColor,setTitleColor] = useState('#FFFFFF');
  const [artistColor,setArtistColor] = useState('#FFFFFF');
  const [titleSize,setTitleSize] = useState(112);
  const [artistSize,setArtistSize] = useState(72);
  
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

  const handleTouchStart = (e, type) => {
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

  const handleTouchMove = useCallback((e) => {
    if (!dragging || !previewRef.current) return;
    
    const touch = e.touches[0];
    if (!touch) return;
    
    const rect = previewRef.current.getBoundingClientRect();
    const x = Math.max(0, Math.min(1, (touch.clientX - rect.left) / rect.width));
    const y = Math.max(0, Math.min(1, (touch.clientY - rect.top) / rect.height));
    
    if (dragging === 'title') setTitlePos({ x, y });
    if (dragging === 'artist') setArtistPos({ x, y });
  }, [dragging]);

  const handleMouseUp = useCallback(() => {
    setDragging(null);
  }, []);

  const handleTouchEnd = useCallback(() => {
    setDragging(null);
  }, []);

  useEffect(() => {
    if (dragging) {
      document.addEventListener('mousemove', handleMouseMove);
      document.addEventListener('mouseup', handleMouseUp);
      document.addEventListener('touchmove', handleTouchMove);
      document.addEventListener('touchend', handleTouchEnd);
      return () => {
        document.removeEventListener('mousemove', handleMouseMove);
        document.removeEventListener('mouseup', handleMouseUp);
        document.removeEventListener('touchmove', handleTouchMove);
        document.removeEventListener('touchend', handleTouchEnd);
      };
    }
  }, [dragging, handleMouseMove, handleMouseUp, handleTouchMove, handleTouchEnd]);

  useEffect(()=>{
    if(!canvasRef.current || !img) return;
    
    const ctx = canvasRef.current.getContext('2d');
    
    ctx.filter = `brightness(${brightness}%) contrast(${contrast}%) saturate(${saturation}%) blur(${blur}px)`;
    ctx.clearRect(0,0,W,H);
    ctx.drawImage(img,0,0,W,H);
    ctx.filter = 'none';

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
        ctx.font = `700 ${titleSize}px "${font}", sans-serif`;
        ctx.strokeText(title, tx, ty);
      }
      
      ctx.fillStyle = titleColor;
      ctx.font = `700 ${titleSize}px "${font}", sans-serif`;
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
        ctx.font = `600 ${artistSize}px "${font}", sans-serif`;
        ctx.strokeText(artist, ax, ay);
      }
      
      ctx.fillStyle = artistColor;
      ctx.font = `600 ${artistSize}px "${font}", sans-serif`;
      ctx.fillText(artist, ax, ay);
      
      ctx.shadowColor = 'transparent';
      ctx.shadowBlur = 0;
      ctx.globalAlpha = 1;
    }
  },[img, title, artist, font, titleSize, artistSize, titleColor, artistColor, titlePos, artistPos, titleStroke, titleShadow, titleOpacity, artistStroke, artistShadow, artistOpacity, brightness, contrast, saturation, blur]);

  function downloadPNG(){
    const OUT = 3000;
    const out = document.createElement('canvas');
    out.width = OUT; out.height = OUT;
    const ctx = out.getContext('2d');

    const scale = OUT / W;
    ctx.filter = `brightness(${brightness}%) contrast(${contrast}%) saturate(${saturation}%) blur(${blur * scale}px)`;
    ctx.drawImage(img,0,0,OUT,OUT);
    ctx.filter = 'none';

    const titleSizeBig = titleSize * scale;
    const artistSizeBig = artistSize * scale;
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
        ctx.font = `700 ${titleSizeBig}px "${font}", sans-serif`;
        ctx.strokeText(title, tx, ty);
      }
      
      ctx.fillStyle = titleColor;
      ctx.font = `700 ${titleSizeBig}px "${font}", sans-serif`;
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
        ctx.font = `600 ${artistSizeBig}px "${font}", sans-serif`;
        ctx.strokeText(artist, ax, ay);
      }
      
      ctx.fillStyle = artistColor;
      ctx.font = `600 ${artistSizeBig}px "${font}", sans-serif`;
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
    <div className="flex flex-col lg:flex-row min-h-screen bg-gradient-to-br from-purple-50 via-white to-blue-50">
      <div className="flex-1 px-4 sm:px-6 py-4 sm:py-6 lg:mr-96">
        <button
          className="mb-4 px-4 py-2 rounded-lg bg-white border border-gray-300 hover:bg-gray-50 flex items-center gap-2 transition-colors text-sm sm:text-base shadow-sm"
          onClick={onClose}
        >
          <svg className="w-4 h-4 sm:w-5 sm:h-5" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
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
              className="absolute w-6 h-6 sm:w-8 sm:h-8 -ml-3 sm:-ml-4 -mt-3 sm:-mt-4 rounded-full bg-purple-600 border-2 border-white shadow-lg cursor-grab hover:scale-110 transition-transform flex items-center justify-center"
              style={{ left: `${titlePos.x * 100}%`, top: `${titlePos.y * 100}%`, touchAction: 'none' }}
              onMouseDown={(e) => handleMouseDown(e, 'title')}
              onTouchStart={(e) => handleTouchStart(e, 'title')}
            >
              <span className="text-white text-xs font-bold">T</span>
            </div>
          )}
          
          {artist && (
            <div
              className="absolute w-6 h-6 sm:w-8 sm:h-8 -ml-3 sm:-ml-4 -mt-3 sm:-mt-4 rounded-full bg-blue-600 border-2 border-white shadow-lg cursor-grab hover:scale-110 transition-transform flex items-center justify-center"
              style={{ left: `${artistPos.x * 100}%`, top: `${artistPos.y * 100}%`, touchAction: 'none' }}
              onMouseDown={(e) => handleMouseDown(e, 'artist')}
              onTouchStart={(e) => handleTouchStart(e, 'artist')}
            >
              <span className="text-white text-xs font-bold">A</span>
            </div>
          )}
        </div>
      </div>

      <aside className="w-full lg:w-96 bg-white border-t lg:border-t-0 lg:border-l border-gray-200 p-4 sm:p-6 flex flex-col lg:fixed lg:right-0 lg:top-0 lg:h-screen overflow-y-auto">
        <div className="text-xs sm:text-sm text-gray-500 mb-4 pb-4 border-b border-gray-200" style={{fontFamily: '"IBM Plex Mono", Satoshi, sans-serif', lineHeight: '1.5'}}>
          {data.prompt || '—'}
        </div>

        <div className="flex gap-2 mb-6">
          {['text', 'effects', 'filters'].map(panel => (
            <button
              key={panel}
              className={`flex-1 px-2 sm:px-3 py-2 rounded-lg text-xs sm:text-sm font-medium transition-all ${
                activePanel === panel
                  ? 'bg-purple-600 text-white'
                  : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
              }`}
              style={{fontFamily: '"IBM Plex Mono", Satoshi, sans-serif'}}
              onClick={() => setActivePanel(panel)}
            >
              {panel.charAt(0).toUpperCase() + panel.slice(1)}
            </button>
          ))}
        </div>

        <div className="flex-1">
          {activePanel === 'text' && (
            <div className="space-y-4">
              <div className="relative">
                <input 
                  className="w-full px-3 pt-6 pb-2 rounded-lg border border-gray-300 focus:border-purple-500 focus:ring-2 focus:ring-purple-200 outline-none peer"
                  placeholder=" "
                  value={title}
                  onChange={e=>setTitle(e.target.value)}
                  id="title-input"
                />
                <label 
                  htmlFor="title-input"
                  className="absolute left-3 top-2 text-xs font-semibold text-gray-600 transition-all peer-placeholder-shown:top-4 peer-placeholder-shown:text-base peer-placeholder-shown:font-medium peer-placeholder-shown:text-gray-400 peer-focus:top-2 peer-focus:text-xs peer-focus:font-semibold peer-focus:text-purple-600"
                >
                  Release Title
                </label>
              </div>

              <div className="relative">
                <input 
                  className="w-full px-3 pt-6 pb-2 rounded-lg border border-gray-300 focus:border-purple-500 focus:ring-2 focus:ring-purple-200 outline-none peer"
                  placeholder=" "
                  value={artist}
                  onChange={e=>setArtist(e.target.value)}
                  id="artist-input"
                />
                <label 
                  htmlFor="artist-input"
                  className="absolute left-3 top-2 text-xs font-semibold text-gray-600 transition-all peer-placeholder-shown:top-4 peer-placeholder-shown:text-base peer-placeholder-shown:font-medium peer-placeholder-shown:text-gray-400 peer-focus:top-2 peer-focus:text-xs peer-focus:font-semibold peer-focus:text-purple-600"
                >
                  Artist Name
                </label>
              </div>

              <div>
                <label className="block text-sm font-medium mb-2">Font Family</label>
                <FontPicker value={font} onChange={setFont} />
              </div>

              <div className="space-y-3">
                <div className="flex gap-3">
                  <div className="flex-1">
                    <label className="block text-xs font-semibold mb-1.5 whitespace-nowrap">Title Color</label>
                    <input 
                      type="color"
                      className="w-full h-11 rounded-lg border border-gray-300 cursor-pointer"
                      value={titleColor}
                      onChange={e=>setTitleColor(e.target.value)}
                    />
                  </div>
                  <div className="flex-1">
                    <label className="block text-xs font-semibold mb-1.5 whitespace-nowrap">Title Size</label>
                    <select
                      className="w-full h-11 px-3 rounded-lg border border-gray-300 bg-white text-sm font-medium"
                      value={titleSize}
                      onChange={e=>setTitleSize(parseInt(e.target.value,10))}
                    >
                      {FONT_SIZES.map(size => (
                        <option key={size} value={size}>{size}px</option>
                      ))}
                    </select>
                  </div>
                </div>

                <div className="flex gap-3">
                  <div className="flex-1">
                    <label className="block text-xs font-semibold mb-1.5 whitespace-nowrap">Artist Color</label>
                    <input 
                      type="color"
                      className="w-full h-11 rounded-lg border border-gray-300 cursor-pointer"
                      value={artistColor}
                      onChange={e=>setArtistColor(e.target.value)}
                    />
                  </div>
                  <div className="flex-1">
                    <label className="block text-xs font-semibold mb-1.5 whitespace-nowrap">Artist Size</label>
                    <select
                      className="w-full h-11 px-3 rounded-lg border border-gray-300 bg-white text-sm font-medium"
                      value={artistSize}
                      onChange={e=>setArtistSize(parseInt(e.target.value,10))}
                    >
                      {FONT_SIZES.map(size => (
                        <option key={size} value={size}>{size}px</option>
                      ))}
                    </select>
                  </div>
                </div>
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
            style={{fontFamily: 'Satoshi'}}
            onClick={downloadPNG}
          >
            🚀 Upscale & Download
          </button>
        </div>
      </aside>
    </div>
  );
}
