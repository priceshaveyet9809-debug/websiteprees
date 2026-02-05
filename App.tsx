import React, { useState, useEffect, useRef, Suspense } from 'react';
import { Menu, X, Youtube, Twitter, Facebook, ArrowRight, Camera, Home, Mail, MessageCircle, Sparkles, Zap, ShieldCheck, Clock, Layers, MapPin, Sparkle, Star, Phone, Instagram } from 'lucide-react';
import { BrandLogo } from './components/BrandLogo';
import PackageCard from './components/PackageCard';
import { ServiceItem } from './types';
import { LONG_FORM_VIDEOS, SHORT_FORM_VIDEOS, PACKAGES, CONTACT_INFO } from './data';

// --- LAZY LOADED COMPONENTS ---
const VideoMarquee = React.lazy(() => import('./components/VideoMarquee'));
const About = React.lazy(() => import('./components/About'));
const PrivacyPolicy = React.lazy(() => import('./components/PrivacyPolicy'));
const AIChat = React.lazy(() => import('./components/AIChat').then(module => ({ default: module.AIChat })));

// --- ICONS ---
// Simple TikTok Icon Component
const TikTokIcon = ({ size = 24, className = "" }) => (
  <svg 
    width={size} 
    height={size} 
    viewBox="0 0 24 24" 
    fill="none" 
    stroke="currentColor" 
    strokeWidth="2" 
    strokeLinecap="round" 
    strokeLinejoin="round" 
    className={className}
  >
    <path d="M9 12a4 4 0 1 0 4 4V4a5 5 0 0 0 5 5" />
  </svg>
);

// --- SUB-COMPONENT: BEFORE/AFTER SLIDER (Optimized) ---
const BeforeAfterSlider: React.FC<{ before: string; after: string }> = ({ before, after }) => {
  const containerRef = useRef<HTMLDivElement>(null);
  const clipRef = useRef<HTMLDivElement>(null);
  const handleRef = useRef<HTMLDivElement>(null);
  const lastX = useRef<number>(0);
  const rafId = useRef<number | null>(null);

  const updatePosition = () => {
    if (!containerRef.current || !clipRef.current || !handleRef.current) return;
    const rect = containerRef.current.getBoundingClientRect();
    const position = ((lastX.current - rect.left) / rect.width) * 100;
    const clamped = Math.max(0, Math.min(100, position));
    
    clipRef.current.style.clipPath = `inset(0 ${100 - clamped}% 0 0)`;
    handleRef.current.style.left = `${clamped}%`;
    rafId.current = null;
  };

  const handleMove = (clientX: number) => {
    lastX.current = clientX;
    if (rafId.current === null) {
      rafId.current = requestAnimationFrame(updatePosition);
    }
  };

  return (
    <div 
      ref={containerRef}
      className="relative w-full h-full overflow-hidden cursor-col-resize select-none group touch-pan-y" 
      onMouseMove={(e) => handleMove(e.clientX)} 
      onTouchMove={(e) => handleMove(e.touches[0].clientX)}
    >
      <img src={after} alt="After" loading="lazy" decoding="async" className="absolute inset-0 w-full h-full object-cover pointer-events-none select-none" />
      <div 
        ref={clipRef}
        className="absolute inset-0 w-full h-full overflow-hidden pointer-events-none select-none" 
        style={{ clipPath: 'inset(0 50% 0 0)', willChange: 'clip-path' }}
      >
        <img src={before} alt="Before" loading="lazy" decoding="async" className="absolute inset-0 w-full h-full object-cover" />
      </div>
      <div 
        ref={handleRef}
        className="absolute top-0 bottom-0 w-1 bg-white shadow-xl z-10" 
        style={{ left: '50%', willChange: 'left' }}
      >
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-8 h-8 bg-white rounded-full flex items-center justify-center shadow-lg border border-gray-200 transition-transform group-hover:scale-110">
          <div className="flex gap-1"><div className="w-1 h-3 bg-orange-500 rounded-full"></div><div className="w-1 h-3 bg-orange-500 rounded-full"></div></div>
        </div>
      </div>
    </div>
  );
};

// --- SERVICES DATA ---
const services: ServiceItem[] = [
  {
    title: 'Photography Editing',
    description: 'HDR merging, sky replacement, and architectural retouching for flawless property imagery.',
    icon: <Camera className="text-orange-500" size={32} />,
    image: 'https://images.unsplash.com/photo-1542038784456-1ea8e935640e?q=80&w=1470&auto=format&fit=crop',
    type: 'standard'
  },
  {
    title: 'Video Editing + AI',
    description: 'AI-driven construction visualization and high-end cinematic property storytelling.',
    icon: <Zap className="text-pink-500" size={32} />,
    videoUrl: 'https://assets.mixkit.co/videos/preview/mixkit-construction-site-of-a-building-at-sunset-18860-large.mp4',
    type: 'video'
  },
  {
    title: 'Virtual Staging',
    description: 'Transforming empty spaces into fully furnished luxury homes with realistic 3D staging.',
    icon: <Home className="text-red-500" size={32} />,
    beforeImage: 'https://images.unsplash.com/photo-1600566752355-35792bedcfea?q=80&w=1000&auto=format&fit=crop',
    afterImage: 'https://images.unsplash.com/photo-1600607687939-ce8a6c25118c?q=80&w=1000&auto=format&fit=crop',
    type: 'comparison'
  }
];

export default function App() {
  const [view, setView] = useState<'home' | 'about' | 'privacy'>('home');
  const [menuOpen, setMenuOpen] = useState(false);
  const [isScrolled, setIsScrolled] = useState(false);
  const [selectedPackage, setSelectedPackage] = useState<string | null>(null);

  useEffect(() => {
    const handleScroll = () => {
      setIsScrolled(window.scrollY > 40);
    };
    window.addEventListener('scroll', handleScroll, { passive: true });
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  const scrollTo = (id: string) => {
    setMenuOpen(false);
    if (view !== 'home') {
      setView('home');
      setTimeout(() => {
        const el = document.getElementById(id);
        if (el) el.scrollIntoView({ behavior: 'smooth' });
      }, 100);
    } else {
      const el = document.getElementById(id);
      if (el) el.scrollIntoView({ behavior: 'smooth' });
    }
  };

  const handlePackageSelect = (name: string) => {
    setSelectedPackage(name);
    scrollTo('contact');
  };

  return (
    <div className="w-full">
      <Suspense fallback={null}>
        <AIChat />
      </Suspense>
      
      {/* --- NAVIGATION BAR --- */}
      <nav 
        className={`fixed z-50 flex items-center justify-between transition-all duration-700 ease-[cubic-bezier(0.2,1,0.3,1)] left-1/2 -translate-x-1/2 transform-gpu
          ${isScrolled 
            ? 'top-4 w-[90%] md:w-[750px] h-14 rounded-full px-8 shadow-2xl bg-white/70 backdrop-blur-xl border border-white/40' 
            : 'top-0 w-full h-24 px-6 md:px-12 bg-transparent'
          }
        `}
        style={{ willChange: 'width, top, height' }}
      >
        <div className={`cursor-pointer group transition-all duration-500 ${isScrolled ? 'scale-90' : 'scale-100'}`} onClick={() => setView('home')}>
          <BrandLogo size={isScrolled ? 'sm' : 'md'} />
        </div>

        <div className="hidden md:flex items-center gap-10 text-[12px] font-bold uppercase tracking-widest text-gray-500">
          <button onClick={() => scrollTo('services')} className="hover:text-gray-900 transition-colors">Services</button>
          <button onClick={() => scrollTo('packages')} className="hover:text-gray-900 transition-colors">Pricing</button>
          <button onClick={() => scrollTo('work')} className="hover:text-gray-900 transition-colors">Portfolio</button>
          <button onClick={() => { setView('about'); window.scrollTo({top: 0, behavior: 'smooth'}); }} className={`hover:text-gray-900 transition-colors ${view === 'about' ? 'text-gray-900' : ''}`}>About</button>
          <button 
            onClick={() => scrollTo('contact')} 
            className={`transition-all duration-500 shadow-lg font-black rounded-full hover:bg-black
              ${isScrolled ? 'bg-[#0f172a] text-white px-5 py-2 text-[10px]' : 'bg-[#0f172a] text-white px-8 py-3'}
            `}
          >
            Contact
          </button>
        </div>

        <button className="md:hidden" onClick={() => setMenuOpen(!menuOpen)}>
          {menuOpen ? <X /> : <Menu />}
        </button>
      </nav>

      {/* --- MOBILE MENU --- */}
      {menuOpen && (
        <div className="fixed inset-0 z-40 bg-white pt-24 px-8 flex flex-col gap-6 md:hidden animate-in fade-in slide-in-from-top-10 duration-300">
          <button onClick={() => scrollTo('services')} className="text-3xl font-serif font-bold">Services</button>
          <button onClick={() => scrollTo('packages')} className="text-3xl font-serif font-bold">Pricing</button>
          <button onClick={() => scrollTo('work')} className="text-3xl font-serif font-bold">Portfolio</button>
          <button onClick={() => { setView('about'); setMenuOpen(false); }} className="text-3xl font-serif font-bold">About</button>
          <button onClick={() => scrollTo('contact')} className="text-3xl font-serif font-bold text-orange-600">Contact</button>
        </div>
      )}

      <Suspense fallback={<div className="min-h-screen flex items-center justify-center"><div className="w-8 h-8 border-4 border-orange-500 border-t-transparent rounded-full animate-spin"></div></div>}>
        {view === 'about' ? (
          <About onBack={() => setView('home')} />
        ) : view === 'privacy' ? (
          <PrivacyPolicy onBack={() => setView('home')} />
        ) : (
          <main className="pt-24">
            {/* --- HERO SECTION (Light/Gradient) --- */}
            <section className="relative min-h-[85vh] flex items-center justify-center text-center px-6 overflow-hidden">
              <div className="absolute top-[10%] left-[50%] -translate-x-1/2 w-[800px] h-[800px] bg-rose-200/20 rounded-full blur-[140px] pointer-events-none z-0 transform-gpu will-change-transform"></div>
              <div className="absolute top-[40%] left-[10%] -translate-x-1/2 w-[600px] h-[600px] bg-orange-200/20 rounded-full blur-[120px] pointer-events-none z-0 transform-gpu will-change-transform"></div>
              <div className="absolute bottom-[10%] right-[10%] w-[500px] h-[500px] bg-pink-200/15 rounded-full blur-[120px] pointer-events-none z-0 transform-gpu will-change-transform"></div>
              
              <div className="relative z-10 max-w-5xl mx-auto">
                <span className="inline-block py-1.5 px-6 bg-[#fff7ed]/80 backdrop-blur-sm text-[#e66c2c] border border-orange-100/50 rounded-full text-[10px] font-black tracking-[0.2em] uppercase mb-10 shadow-sm animate-bounce">High-End Post Production</span>
                <div className="mb-12">
                  <h1 className="text-7xl md:text-[140px] font-serif font-black leading-[0.85] tracking-tight text-[#0f172a] animate-in fade-in slide-in-from-bottom-8 duration-1000 drop-shadow-sm transform-gpu">
                    Architecture
                  </h1>
                  <h2 className="text-6xl md:text-[120px] font-serif font-normal leading-[0.85] tracking-tight bg-clip-text text-transparent bg-gradient-to-r from-[#e66c2c] to-[#d62d7a] animate-in fade-in slide-in-from-bottom-8 duration-1000 delay-150 drop-shadow-sm transform-gpu">
                    Meets Art.
                  </h2>
                </div>
                <p className="text-xl md:text-2xl text-gray-600 max-w-3xl mx-auto font-light leading-relaxed mb-16 px-4">
                  Elevating property listings through world-class cinematic editing and AI-driven visual enhancements.
                </p>
                <div className="flex flex-col sm:flex-row gap-8 justify-center items-center">
                  <button 
                    onClick={() => scrollTo('work')} 
                    className="group px-12 py-5 bg-gradient-to-r from-[#e66c2c] to-[#d62d7a] text-white rounded-full font-black text-lg hover:shadow-[0_20px_50px_-10px_rgba(214,45,122,0.5)] hover:-translate-y-1 transition-all flex items-center gap-3 shadow-xl transform-gpu"
                  >
                    Watch Showcase <ArrowRight className="group-hover:translate-x-2 transition-transform" />
                  </button>
                  <button 
                    onClick={() => scrollTo('contact')} 
                    className="px-12 py-5 bg-white/40 backdrop-blur-md text-[#0f172a] rounded-full font-black text-lg hover:bg-white/60 transition-all shadow-lg border border-white/60 transform-gpu"
                  >
                    Get a Quote
                  </button>
                </div>
              </div>
            </section>

            {/* --- SERVICES SECTION (Dark - New Alternating Pattern) --- */}
            <section id="services" className="py-20 md:py-32 px-6 bg-[#0f172a] reveal">
              <div className="max-w-7xl mx-auto">
                <div className="text-center mb-10 md:mb-20">
                  <h2 className="text-4xl md:text-5xl font-serif font-bold mb-4 text-white">Our Services</h2>
                  <p className="text-gray-400 max-w-xl mx-auto text-lg">Comprehensive visual solutions for luxury real estate marketing.</p>
                </div>
                <div className="grid md:grid-cols-3 gap-8 items-center">
                  {services.map((service, i) => (
                    <div key={i} className={`group relative rounded-[40px] overflow-hidden shadow-xl hover:shadow-2xl transition-all bg-[#1e293b] reveal transform-gpu ${service.type === 'video' ? 'h-[500px] md:h-[600px] md:-mt-8 z-10 shadow-[0_20px_60px_-15px_rgba(236,72,153,0.3)] ring-4 ring-white/10' : 'h-[450px] md:h-[550px]'}`} style={{ transitionDelay: `${i * 100}ms` }}>
                      {service.type === 'standard' && <img src={service.image} loading="lazy" decoding="async" className="absolute inset-0 w-full h-full object-cover opacity-60 group-hover:scale-110 transition-all duration-700" />}
                      {service.type === 'comparison' && <div className="absolute inset-0"><BeforeAfterSlider before={service.beforeImage!} after={service.afterImage!} /></div>}
                      {service.type === 'video' && <video autoPlay muted loop playsInline preload="none" className="absolute inset-0 w-full h-full object-cover opacity-60" src={service.videoUrl} />}
                      <div className="absolute inset-0 bg-gradient-to-t from-black via-black/40 to-transparent"></div>
                      <div className="absolute bottom-0 left-0 right-0 p-8 md:p-10 text-white z-20">
                        <div className="mb-4 bg-white/10 backdrop-blur-md w-14 h-14 md:w-16 md:h-16 rounded-2xl flex items-center justify-center border border-white/20">{service.icon}</div>
                        <h3 className="text-xl md:text-2xl font-bold mb-3">{service.title}</h3>
                        <p className="text-gray-300 leading-relaxed text-sm">{service.description}</p>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </section>

             {/* --- PACKAGES SECTION (Light - To make it POP) --- */}
             <section id="packages" className="py-20 md:py-32 px-6 bg-white reveal">
              <div className="max-w-7xl mx-auto text-center">
                <span className="text-rose-500 font-bold tracking-[0.3em] uppercase text-xs">Pricing & Plans</span>
                <h2 className="text-4xl md:text-7xl font-sans font-black text-[#0f172a] mt-4 mb-10 md:mb-16">Tailored Cinema Solutions</h2>
                <div className="grid lg:grid-cols-3 gap-8 items-stretch">
                  {PACKAGES.map((pkg, i) => (
                    <PackageCard 
                      key={i} 
                      pkg={pkg} 
                      onSelect={handlePackageSelect}
                    />
                  ))}
                </div>
              </div>
            </section>

            {/* --- PORTFOLIO INTRODUCTION (Darkest) --- */}
            <section id="work" className="pt-20 md:pt-32 pb-10 px-6 bg-[#020617] text-white reveal">
              <div className="max-w-5xl mx-auto text-center">
                  <span className="text-orange-500 font-bold tracking-[0.3em] uppercase text-xs mb-6 block">The Portfolio</span>
                  <h2 className="text-4xl md:text-8xl font-serif font-bold mb-8 md:mb-10 leading-none">Curated <span className="italic font-light opacity-60">Cinematic</span> Excellence.</h2>
                  <p className="text-gray-400 text-lg md:text-2xl font-light leading-relaxed max-w-3xl mx-auto mb-10 md:mb-16">
                    Explore our track record of transforming empty houses into emotional home narratives. We combine technical precision with artistic soul to deliver results that sell.
                  </p>
                  
                  {/* METALLIC STATS SECTION */}
                  <div className="flex justify-center gap-10 md:gap-24">
                    <div className="text-center">
                        <div className="text-4xl md:text-5xl font-black mb-2 bg-clip-text text-transparent bg-gradient-to-br from-white via-gray-300 to-gray-600 drop-shadow-[0_2px_10px_rgba(255,255,255,0.2)]">500+</div>
                        <div className="text-[10px] font-bold uppercase tracking-widest text-white/40">Projects Delivered</div>
                    </div>
                    <div className="w-[1px] h-12 md:h-16 bg-white/10"></div>
                    <div className="text-center">
                        <div className="text-4xl md:text-5xl font-black mb-2 bg-clip-text text-transparent bg-gradient-to-br from-white via-gray-300 to-gray-600 drop-shadow-[0_2px_10px_rgba(255,255,255,0.2)]">24h</div>
                        <div className="text-[10px] font-bold uppercase tracking-widest text-white/40">Fast Turnaround</div>
                    </div>
                  </div>
              </div>
            </section>

            {/* --- PORTFOLIO MARQUEES (Darkest) --- */}
            <section className="pb-20 md:pb-32 bg-[#020617] overflow-hidden">
              <Suspense fallback={<div className="h-40 flex items-center justify-center text-white/20">Loading Gallery...</div>}>
                <VideoMarquee title="Long-form Cinematic Tours" videos={LONG_FORM_VIDEOS} direction="left" />
                <div className="h-4 md:h-10"></div>
                <VideoMarquee title="Vertical Social Content" videos={SHORT_FORM_VIDEOS} direction="left" />
              </Suspense>
            </section>

            {/* --- POST-PRICING INTRODUCTION (White - Alternating Contrast) --- */}
            <section className="py-20 md:py-32 px-6 bg-[#f8fafc] text-[#0f172a] reveal">
              <div className="max-w-6xl mx-auto">
                <div className="grid lg:grid-cols-2 gap-12 md:gap-20 items-center">
                  <div className="reveal">
                    <span className="text-orange-500 font-bold uppercase tracking-widest text-xs mb-4 block">The Prees Standard</span>
                    <h2 className="text-3xl md:text-6xl font-serif font-bold mb-8 leading-tight">Beyond Simple <br/><span className="italic font-light opacity-80 text-gray-500">Video Editing.</span></h2>
                    <p className="text-gray-500 text-lg leading-relaxed mb-8">
                        We don't just cut clips together. We craft immersive digital experiences that transport potential buyers directly into the lifestyle offered by each property. Our process is a fusion of advanced technology and classical cinematic principles.
                    </p>
                    <ul className="space-y-6">
                        <li className="flex gap-4">
                          <div className="w-12 h-12 rounded-xl bg-gray-100 border border-gray-200 flex items-center justify-center shrink-0 text-orange-500"><ShieldCheck size={24}/></div>
                          <div><h4 className="font-bold mb-1">Quality Guaranteed</h4><p className="text-sm text-gray-500">Every project undergoes a rigorous 3-step quality review process.</p></div>
                        </li>
                        <li className="flex gap-4">
                          <div className="w-12 h-12 rounded-xl bg-gray-100 border border-gray-200 flex items-center justify-center shrink-0 text-pink-500"><Clock size={24}/></div>
                          <div><h4 className="font-bold mb-1">Punctual Delivery</h4><p className="text-sm text-gray-500">We respect your marketing timeline with precise 24-48h turnarounds.</p></div>
                        </li>
                        <li className="flex gap-4">
                          <div className="w-12 h-12 rounded-xl bg-gray-100 border border-gray-200 flex items-center justify-center shrink-0 text-blue-500"><Layers size={24}/></div>
                          <div><h4 className="font-bold mb-1">Multi-Format Strategy</h4><p className="text-sm text-gray-500">Content optimized for YouTube, Instagram, Facebook, and Web.</p></div>
                        </li>
                    </ul>
                  </div>
                  
                  {/* STACKED FEEDBACK CARDS */}
                  <div className="relative reveal delay-200 min-h-[500px] flex items-center justify-center hidden md:flex">
                    <div className="relative w-full max-w-md aspect-[4/5]">
                        {/* Background Image Card */}
                        <div className="absolute inset-0 rounded-[60px] overflow-hidden shadow-2xl transform-gpu rotate-0 z-10">
                            <img src="https://images.unsplash.com/photo-1600585154340-be6191ecdb50?w=1200&q=80" loading="lazy" decoding="async" className="w-full h-full object-cover" alt="Luxury Villa" />
                            <div className="absolute inset-0 bg-gradient-to-t from-[#0f172a] to-transparent"></div>
                        </div>

                        {/* Feedback Card 1 (Behind) */}
                        <div className="absolute -bottom-8 -right-8 w-64 p-6 bg-white/80 backdrop-blur-md border border-white/40 rounded-3xl shadow-xl transform-gpu rotate-6 z-20 flex flex-col gap-3">
                          <div className="flex text-orange-400 gap-1">
                            {[1,2,3,4,5].map(i => <Star key={i} size={14} fill="currentColor" />)}
                          </div>
                          <p className="text-gray-800 text-sm font-medium">"The detail in the color grading is absolutely unmatched. Sold in 3 days."</p>
                          <div className="flex items-center gap-2">
                            <div className="w-8 h-8 rounded-full bg-gray-200 overflow-hidden"><img src="https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=100&q=80" loading="lazy" className="w-full h-full object-cover" /></div>
                            <span className="text-xs text-gray-600 font-bold uppercase tracking-wider">David M., Broker</span>
                          </div>
                        </div>

                        {/* Feedback Card 2 (Top Left) */}
                        <div className="absolute -top-6 -left-6 w-auto max-w-[200px] p-5 bg-white rounded-3xl shadow-[0_20px_50px_rgba(0,0,0,0.1)] border border-gray-100 transform-gpu -rotate-3 z-30 animate-float hidden md:block">
                          <div className="text-4xl font-black text-[#0f172a] mb-1">100%</div>
                          <div className="text-[10px] font-bold uppercase tracking-widest text-gray-400 leading-tight">Customer<br/>Satisfaction</div>
                        </div>
                    </div>
                  </div>
                </div>
              </div>
            </section>

            {/* --- MEDIA CHANNELS (Dark - Alternating Contrast) --- */}
            <section id="media" className="py-20 md:py-32 px-6 bg-[#0f172a] overflow-hidden reveal">
              <div className="max-w-6xl mx-auto grid md:grid-cols-2 gap-8">
                
                {/* YOUTUBE CARD */}
                <div className="relative bg-white rounded-[48px] p-8 md:p-12 shadow-2xl reveal overflow-hidden group">
                  {/* Background Graphic */}
                  <div className="absolute -bottom-10 -right-10 opacity-5 transform rotate-12 transition-transform group-hover:scale-110 duration-700">
                    <Youtube size={300} strokeWidth={1} />
                  </div>

                  <div className="relative z-10 flex flex-col h-full">
                    <div className="mb-8 w-16 h-16 bg-rose-50 rounded-2xl flex items-center justify-center text-rose-500"><Youtube size={32} /></div>
                    <h3 className="text-3xl md:text-4xl font-bold text-[#0f172a] mb-4">PREES Global</h3>
                    <p className="text-gray-500 text-lg leading-relaxed mb-10">Our official channel for high-end property walkthroughs, market trends, and editing masterclasses.</p>
                    
                    {/* Stats Removed as requested */}
                    <div className="flex-grow"></div>

                    <a href={CONTACT_INFO.youtube} target="_blank" className="inline-flex items-center justify-center gap-3 px-8 py-4 bg-[#0f172a] text-white rounded-xl font-bold text-sm hover:bg-gray-800 transition-all shadow-lg w-full md:w-auto">Subscribe Now <ArrowRight size={18} /></a>
                  </div>
                </div>

                {/* INSTAGRAM CARD (Reverted from TikTok) */}
                <div className="relative bg-[#020617] rounded-[48px] p-8 md:p-12 shadow-2xl text-white reveal delay-100 overflow-hidden group border border-white/10">
                   {/* Background Graphic */}
                  <div className="absolute -bottom-10 -right-10 opacity-5 transform -rotate-12 transition-transform group-hover:scale-110 duration-700">
                     <Instagram size={300} />
                  </div>

                  <div className="relative z-10 flex flex-col h-full">
                    <div className="mb-8 w-16 h-16 bg-white/5 backdrop-blur-md border border-white/10 rounded-2xl flex items-center justify-center text-pink-500"><Instagram size={32} /></div>
                    <h3 className="text-3xl md:text-4xl font-bold mb-4">PREES Living</h3>
                    <p className="text-gray-400 text-lg leading-relaxed mb-10">Daily doses of luxury lifestyle, vertical property reveals, and viral social media editing trends.</p>
                    
                     {/* Stats Removed as requested */}
                     <div className="flex-grow"></div>

                    <a href={CONTACT_INFO.instagram} target="_blank" className="inline-flex items-center justify-center gap-3 px-8 py-4 bg-gradient-to-r from-orange-500 to-pink-600 text-white rounded-xl font-bold text-sm hover:scale-[1.02] transition-all shadow-lg w-full md:w-auto">Follow @PREES <ArrowRight size={18} /></a>
                  </div>
                </div>
              </div>
            </section>

            {/* --- CONTACT SECTION (White - Alternating Contrast) --- */}
            <section id="contact" className="py-20 md:py-32 px-6 bg-white reveal">
              <div className="max-w-4xl mx-auto text-center">
                {selectedPackage && (
                  <div className="inline-flex items-center gap-2 px-4 py-2 bg-orange-50 text-orange-600 rounded-full text-xs font-black uppercase tracking-widest mb-6 animate-bounce">
                    <Sparkle size={14} /> Inquiry for {selectedPackage} Package
                  </div>
                )}
                
                <h2 className="text-4xl md:text-7xl font-serif font-bold mb-8 text-[#0f172a]">
                  {selectedPackage ? "Let's Lock This In." : "Let's Create"} <br /> 
                  <span className="text-transparent bg-clip-text bg-gradient-to-r from-orange-500 to-pink-600">Something Extraordinary.</span>
                </h2>
                <p className="text-lg md:text-xl text-gray-500 mb-10 md:mb-16 leading-relaxed max-w-2xl mx-auto">
                  {selectedPackage 
                    ? `You've selected the ${selectedPackage} plan. Reach out now to start your journey towards cinematic excellence.` 
                    : "Ready to elevate your listing? Connect with our studio across our social channels or via direct inquiry."}
                </p>
                
                <div className="grid sm:grid-cols-2 md:grid-cols-4 gap-4 md:gap-6">
                  {/* Email */}
                  <a href={`mailto:${CONTACT_INFO.email}?subject=Inquiry for ${selectedPackage || 'Services'}`} className="flex flex-col items-center gap-4 p-6 md:p-8 rounded-3xl bg-white border border-gray-100 hover:border-orange-500 transition-all shadow-sm hover:shadow-xl group reveal" style={{transitionDelay: '0ms'}}>
                    <div className="w-14 h-14 md:w-16 md:h-16 rounded-2xl bg-orange-100 flex items-center justify-center text-orange-600 group-hover:bg-orange-600 group-hover:text-white transition-all"><Mail size={28} /></div>
                    <span className="font-bold text-[#0f172a]">Email Studio</span>
                  </a>

                  {/* TikTok (As requested in previous step for Contact Grid) */}
                  <a href={CONTACT_INFO.tiktok} target="_blank" className="flex flex-col items-center gap-4 p-6 md:p-8 rounded-3xl bg-white border border-gray-100 hover:border-black transition-all shadow-sm hover:shadow-xl group reveal" style={{transitionDelay: '100ms'}}>
                    <div className="w-14 h-14 md:w-16 md:h-16 rounded-2xl bg-gray-100 flex items-center justify-center text-black group-hover:bg-black group-hover:text-white transition-all"><TikTokIcon size={28} /></div>
                    <span className="font-bold text-[#0f172a]">TikTok</span>
                  </a>

                  {/* Facebook */}
                  <a href={CONTACT_INFO.facebook} target="_blank" className="flex flex-col items-center gap-4 p-6 md:p-8 rounded-3xl bg-white border border-gray-100 hover:border-blue-500 transition-all shadow-sm hover:shadow-xl group reveal" style={{transitionDelay: '200ms'}}>
                    <div className="w-14 h-14 md:w-16 md:h-16 rounded-2xl bg-blue-100 flex items-center justify-center text-blue-600 group-hover:bg-blue-600 group-hover:text-white transition-all"><Facebook size={28} /></div>
                    <span className="font-bold text-[#0f172a]">Facebook</span>
                  </a>

                  {/* Twitter (Replaced Instagram in Contact Grid) */}
                  <a href={CONTACT_INFO.twitter} target="_blank" className="flex flex-col items-center gap-4 p-6 md:p-8 rounded-3xl bg-white border border-gray-100 hover:border-sky-500 transition-all shadow-sm hover:shadow-xl group reveal" style={{transitionDelay: '300ms'}}>
                    <div className="w-14 h-14 md:w-16 md:h-16 rounded-2xl bg-sky-100 flex items-center justify-center text-sky-500 group-hover:bg-sky-500 group-hover:text-white transition-all"><Twitter size={28} /></div>
                    <span className="font-bold text-[#0f172a]">Twitter</span>
                  </a>
                </div>
              </div>
            </section>

            {/* --- FOOTER (Updated: removed Insta/YT, added WhatsApp) --- */}
            <footer className="py-24 px-6 md:px-12 bg-white border-t border-gray-100 reveal">
              <div className="max-w-7xl mx-auto grid grid-cols-1 md:grid-cols-12 gap-12 md:gap-8">
                
                {/* BRAND COLUMN */}
                <div className="md:col-span-5 space-y-8">
                  <h2 className="text-4xl font-bold tracking-tighter text-[#ef4444]">PREES</h2>
                  <p className="text-gray-500 text-lg leading-relaxed max-w-sm">
                    Elevating luxury real estate through cinematic storytelling. We turn properties into emotions and listings into legends.
                  </p>
                  
                  {/* Footer Socials: Only WhatsApp as requested */}
                  <div className="flex gap-4">
                    <a href={CONTACT_INFO.whatsapp} target="_blank" className="flex items-center gap-3 px-6 py-3 rounded-full bg-green-500 text-white font-bold shadow-lg hover:bg-green-600 hover:scale-105 transition-all">
                      <Phone size={20} />
                      Chat on WhatsApp
                    </a>
                  </div>
                </div>

                {/* CONTACT COLUMN */}
                <div className="md:col-span-4 space-y-6">
                  <h4 className="text-[13px] font-bold uppercase tracking-[0.2em] text-[#0f172a]">Contact</h4>
                  <div className="space-y-4">
                    <a href={`mailto:${CONTACT_INFO.email}`} className="flex items-center gap-3 text-gray-500 hover:text-red-500 transition-colors group">
                      <div className="w-6 h-6 flex items-center justify-center rounded-md bg-orange-50 text-orange-600 group-hover:bg-orange-600 group-hover:text-white transition-all">
                        <Mail size={14} />
                      </div>
                      <span className="text-base font-medium">{CONTACT_INFO.email}</span>
                    </a>
                    <div className="flex items-center gap-3 text-gray-500">
                      <div className="w-6 h-6 flex items-center justify-center rounded-md bg-orange-50 text-orange-600">
                        <MapPin size={14} />
                      </div>
                      <span className="text-base font-medium">{CONTACT_INFO.location}</span>
                    </div>
                  </div>
                </div>

                {/* COMPANY COLUMN */}
                <div className="md:col-span-3 space-y-6">
                  <h4 className="text-[13px] font-bold uppercase tracking-[0.2em] text-[#0f172a]">Company</h4>
                  <div className="flex flex-col space-y-4 text-gray-500">
                    <button onClick={() => scrollTo('work')} className="text-left font-medium hover:text-red-500 transition-colors">Work</button>
                    <button onClick={() => scrollTo('services')} className="text-left font-medium hover:text-red-500 transition-colors">Services</button>
                    <button onClick={() => { setView('about'); window.scrollTo(0,0); }} className="text-left font-medium hover:text-red-500 transition-colors">About Us</button>
                    <button onClick={() => { setView('privacy'); window.scrollTo(0,0); }} className="text-left font-medium hover:text-red-500 transition-colors">Privacy Policy</button>
                  </div>
                </div>

              </div>
            </footer>
          </main>
        )}
      </Suspense>
    </div>
  );
}