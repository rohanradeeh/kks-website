import React, { useState, useEffect, useMemo, useCallback } from 'react';
import { Menu, X, Calendar as CalendarIcon, MapPin, Users, Heart, ArrowRight, Mail, Phone, Facebook, Instagram, Twitter, ExternalLink, Image as ImageIcon, Scale, HandHeart, Sprout, Landmark, FileDown, CheckCircle, ArrowLeft, PhoneCall as PhoneCallIcon, ChevronLeft, ChevronRight, Moon, Star, Sun, Info } from 'lucide-react';

// --- CONFIGURATION ---
const logoImage = "KeralaKalaSamitiLogo.jpg";
const membershipPdf = "KKS_MEMBERSHIP_FORM.pdf";
const facebookPageUrl = "https://www.facebook.com/keralakalasamitibbsr/"; 
const encodedFbUrl = encodeURIComponent(facebookPageUrl);
const baseUrl = "./";

// --- NAVIGATION LINKS ---
const navLinks = [
  { name: 'Home', href: '#home' },
  { name: 'About Us', href: '#about' },
  { name: 'Mission', href: '#mission' }, 
  { name: 'Events', href: '#events' },
  { name: 'Gallery', href: '#gallery' },
  { name: 'Membership', href: '#membership' },
  { name: 'Contact', href: '#contact' },
];

// --- ASTRONOMICAL & CALENDAR ENGINE (Panchang) ---
class PanchangEngine {
  constructor() {
    this.deg2rad = Math.PI / 180;
    this.rad2deg = 180 / Math.PI;
  }

  normalize(angle) {
    angle = angle % 360;
    return angle < 0 ? angle + 360 : angle;
  }

  getJulianDay(date) {
    return (date.getTime() / 86400000) - (date.getTimezoneOffset() / 1440) + 2440587.5;
  }

  getAyanamsa(jd) {
    const t = (jd - 2451545.0) / 36525;
    return 24.103388 + 1.28195 * t; 
  }

  getSunLongitude(jd) {
    const n = jd - 2451545.0;
    let L = 280.460 + 0.9856474 * n;
    let g = 357.528 + 0.9856003 * n;
    L = this.normalize(L);
    g = this.normalize(g) * this.deg2rad;
    let lambda = L + 1.915 * Math.sin(g) + 0.020 * Math.sin(2 * g);
    return this.normalize(lambda);
  }

  getMoonLongitude(jd) {
    const n = jd - 2451545.0;
    let L = 218.316 + 13.176396 * n;
    let M = 134.963 + 13.064993 * n;
    let F = 93.272 + 13.229350 * n;
    let l = L + 6.289 * Math.sin(M * this.deg2rad);
    l -= 1.274 * Math.sin((L - 2 * F) * this.deg2rad);
    return this.normalize(l);
  }

  getTithi(sunLong, moonLong) {
    let diff = moonLong - sunLong;
    if (diff < 0) diff += 360;
    return diff / 12;
  }

  getNakshatra(moonLong) {
    return this.normalize(moonLong) / 13.333333;
  }

  getMalayalamDate(date) {
    const jd = this.getJulianDay(date);
    const ayanamsa = this.getAyanamsa(jd);
    const sunLongTropical = this.getSunLongitude(jd);
    const sunLongSidereal = this.normalize(sunLongTropical - ayanamsa);
    
    const sign = Math.floor(sunLongSidereal / 30);
    const degreeInSign = sunLongSidereal % 30;
    const day = Math.floor(degreeInSign) + 1;

    const months = [
      { en: 'Medam', ml: 'മേടം' }, { en: 'Edavam', ml: 'ഇടവം' }, { en: 'Midhunam', ml: 'മിഥുനം' },
      { en: 'Karkidakam', ml: 'കർക്കിടകം' }, { en: 'Chingam', ml: 'ചിങ്ങം' }, { en: 'Kanni', ml: 'കന്നി' },
      { en: 'Thulam', ml: 'തുലാം' }, { en: 'Vrischikam', ml: 'വൃശ്ചികം' }, { en: 'Dhanu', ml: 'ധനു' },
      { en: 'Makaram', ml: 'മകരം' }, { en: 'Kumbham', ml: 'കുംഭം' }, { en: 'Meenam', ml: 'മീനം' }
    ];
    const safeSign = Math.max(0, Math.min(11, sign));
    return { month: months[safeSign], day: day, signIndex: safeSign, sunLongSidereal };
  }

  getLunarMonthIndex(sunSignIndex, tithiIndex) {
    const isShukla = tithiIndex < 15;
    return isShukla ? (sunSignIndex + 1) % 12 : sunSignIndex % 12;
  }

  getPanchang(date) {
    const jd = this.getJulianDay(date);
    const ayanamsa = this.getAyanamsa(jd);
    const sunLong = this.normalize(this.getSunLongitude(jd) - ayanamsa);
    const moonLong = this.normalize(this.getMoonLongitude(jd) - ayanamsa);
    const tithiVal = this.getTithi(sunLong, moonLong);
    const nakshatraVal = this.getNakshatra(moonLong);
    const tithiIndex = Math.floor(tithiVal);
    const nakshatraIndex = Math.floor(nakshatraVal);
    const solarData = this.getMalayalamDate(date);
    const lunarMonthIdx = this.getLunarMonthIndex(solarData.signIndex, tithiIndex);
    
    return {
      tithiIndex, 
      tithiName: this.getTithiName(tithiIndex),
      nakshatraIndex, 
      nakshatraName: this.getNakshatraName(nakshatraIndex),
      solar: solarData
    };
  }

  getNakshatraName(index) {
    const stars = [
      { en: 'Ashwathi', ml: 'അശ്വതി' }, { en: 'Bharani', ml: 'ഭരണി' }, { en: 'Karthika', ml: 'കാർത്തിക' },
      { en: 'Rohini', ml: 'രോഹിണി' }, { en: 'Makayiram', ml: 'മകയിരം' }, { en: 'Thiruvathira', ml: 'തിരുവാതിര' },
      { en: 'Punartham', ml: 'പുണർതം' }, { en: 'Pooyam', ml: 'പൂയം' }, { en: 'Ayilyam', ml: 'ആയില്യം' },
      { en: 'Makam', ml: 'മകം' }, { en: 'Pooram', ml: 'പൂരം' }, { en: 'Uthram', ml: 'ഉത്രം' },
      { en: 'Atham', ml: 'അത്തം' }, { en: 'Chithira', ml: 'ചിത്തിര' }, { en: 'Chothi', ml: 'ചോതി' },
      { en: 'Vishakham', ml: 'വിശാഖം' }, { en: 'Anizham', ml: 'അനിഴം' }, { en: 'Thrikketta', ml: 'തൃക്കേട്ട' },
      { en: 'Moolam', ml: 'മൂലം' }, { en: 'Pooradam', ml: 'പൂരാടം' }, { en: 'Uthradam', ml: 'ഉത്രാടം' },
      { en: 'Thiruvonam', ml: 'തിരുവോണം' }, { en: 'Avittam', ml: 'അവിട്ടം' }, { en: 'Chathayam', ml: 'ചതയം' },
      { en: 'Pooruruttathi', ml: 'പൂരുരുട്ടാതി' }, { en: 'Uthrattathi', ml: 'ഉത്രട്ടാതി' }, { en: 'Revathi', ml: 'രേവതി' }
    ];
    return stars[index % 27] || { en: 'Unknown', ml: 'Unknown' };
  }

  getTithiName(index) {
    const names = [
      "Prathama", "Dwitiya", "Tritiya", "Chaturthi", "Panchami", 
      "Shashti", "Saptami", "Ashtami", "Navami", "Dashami", 
      "Ekadashi", "Dwadashi", "Trayodashi", "Chaturdashi", "Pournami/Amavasi"
    ];
    const idx = index % 15;
    const isShukla = index < 15;
    const name = names[idx];
    const mlNames = [
      "പ്രഥമ", "ദ്വിതീയ", "തൃതീയ", "ചതുർത്ഥി", "പഞ്ചമി",
      "ഷഷ്ഠി", "സപ്തമി", "അഷ്ടമി", "നവമി", "ദശമി",
      "ഏകാദശി", "ദ്വാദശി", "ത്രയോദശി", "ചതുർദശി"
    ];
    let ml = "";
    if (idx < 14) ml = mlNames[idx];
    else ml = (index === 14) ? "പൗർണ്ണമി" : "അമാവാസി"; 

    return { name, isShukla, en: name, ml };
  }
}

const engine = new PanchangEngine();

// --- CALENDAR HELPER COMPONENTS ---
const CalendarModal = ({ isOpen, onClose, data }) => {
  if (!isOpen || !data) return null;

  return (
    <div 
      className="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-black/70 backdrop-blur-md animate-fade-in"
      onClick={onClose}
    >
      <div 
        className="bg-white rounded-2xl shadow-2xl w-full max-w-md overflow-hidden relative border border-slate-200 animate-scale-in"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="h-40 bg-gradient-to-br from-emerald-600 to-teal-700 relative p-6 flex flex-col justify-end overflow-hidden">
          <div className="absolute top-0 right-0 w-32 h-32 bg-white/10 rounded-full blur-2xl -mr-10 -mt-10"></div>
          <button onClick={onClose} className="absolute top-4 right-4 p-2 bg-black/20 hover:bg-black/40 text-white rounded-full transition-colors z-10"><X size={24} /></button>
          <h2 className="text-6xl font-bold text-white tracking-tight drop-shadow-md">{data.date.getDate()}</h2>
          <p className="text-emerald-100 font-medium tracking-wide text-xl">{data.date.toLocaleString('default', { month: 'long' })} {data.date.getFullYear()}</p>
          <div className="text-emerald-200/90 text-base mt-1 flex items-center gap-2"><span>{data.date.toLocaleString('default', { weekday: 'long' })}</span></div>
        </div>

        <div className="p-6 space-y-6 max-h-[60vh] overflow-y-auto custom-scrollbar">
          <div className="flex items-center justify-between p-5 bg-emerald-50 rounded-xl border border-emerald-100 shadow-sm">
            <div>
              <p className="text-sm font-bold text-emerald-600 uppercase tracking-wider mb-1">Malayalam Date</p>
              <h3 className="text-3xl font-bold text-emerald-950 font-serif">{data.panchang.solar.month.ml} {data.panchang.solar.day}</h3>
              <p className="text-lg text-emerald-700 font-medium">{data.panchang.solar.month.en} {data.panchang.solar.day}</p>
            </div>
            <div className="h-14 w-14 bg-emerald-100 rounded-full flex items-center justify-center text-emerald-600"><span className="text-xl font-bold">കൊ</span></div>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div className="p-4 bg-slate-50 rounded-lg border border-slate-100">
              <div className="flex items-center gap-2 mb-2 text-amber-500"><Star size={16} /><span className="text-xs font-bold uppercase tracking-wider">Nakshatra</span></div>
              <p className="font-semibold text-slate-800 text-base">{data.panchang.nakshatraName.ml}</p>
              <p className="text-sm text-slate-500">{data.panchang.nakshatraName.en}</p>
            </div>
            <div className="p-4 bg-slate-50 rounded-lg border border-slate-100">
              <div className="flex items-center gap-2 mb-2 text-blue-500"><Moon size={16} /><span className="text-xs font-bold uppercase tracking-wider">Tithi</span></div>
              <p className="font-semibold text-slate-800 text-base">{data.panchang.tithiName.ml}</p>
              <p className="text-sm text-slate-500">{data.panchang.tithiName.en}</p>
            </div>
          </div>

          {data.events.length > 0 ? (
            <div>
              <h4 className="text-sm font-bold text-slate-400 uppercase tracking-wider mb-4 flex items-center gap-2"><span className="w-4 h-[1px] bg-slate-200"></span>Special Events<span className="flex-1 h-[1px] bg-slate-200"></span></h4>
              <div className="space-y-3">
                {data.events.map((evt, i) => (
                  <div key={i} className="flex items-start gap-3 p-4 rounded-lg bg-slate-50 border border-slate-100">
                    <span className={`mt-1.5 w-2.5 h-2.5 rounded-full flex-shrink-0 ${evt.type === 'major' ? 'bg-amber-500 animate-pulse' : 'bg-emerald-500'}`}></span>
                    <div><span className="text-base font-bold text-slate-800 block">{evt.name}</span>{evt.desc && <span className="text-sm text-slate-500 block mt-1">{evt.desc}</span>}</div>
                  </div>
                ))}
              </div>
            </div>
          ) : (
            <div className="text-center py-6 text-slate-400 text-base italic">No major festivals today</div>
          )}
        </div>
      </div>
    </div>
  );
};

// --- MAIN APP COMPONENT ---

const App = () => {
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const [scrolled, setScrolled] = useState(false);
  const [showMembershipModal, setShowMembershipModal] = useState(false);
  const [selectedImageIndex, setSelectedImageIndex] = useState(null); 
  const [currentView, setCurrentView] = useState('home'); 
  const [currentDate, setCurrentDate] = useState(new Date());
  const [selectedDay, setSelectedDay] = useState(null);

  const fullGalleryImages = Array.from({ length: 50 }, (_, i) => ({
    id: i,
    src: `${baseUrl}gallery/${i + 1}.jpg`, 
    alt: `Gallery Image ${i + 1}`
  }));

  useEffect(() => {
    const handleScroll = () => setScrolled(window.scrollY > 50);
    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  useEffect(() => {
    const handleKeyDown = (e) => {
      if (selectedImageIndex === null) return;
      if (e.key === 'ArrowRight') handleNextImage(e);
      else if (e.key === 'ArrowLeft') handlePrevImage(e);
      else if (e.key === 'Escape') setSelectedImageIndex(null);
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [selectedImageIndex]);

  const getEventsForDay = useCallback((date, panchang) => {
    const events = [];
    const { solar, nakshatraName, tithiIndex } = panchang;
    const mMonth = solar.month.en; 
    const star = nakshatraName.en;
    const day = solar.day;
    
    if (day === 1) {
       if (mMonth === 'Medam') events.push({ name: "Vishu", type: "major", desc: "Traditional New Year" });
       if (mMonth === 'Chingam') events.push({ name: "New Year", type: "major", desc: "Kolla Varsham" });
       if (mMonth === 'Makaram') events.push({ name: "Makaravilakku", type: "major" });
       if (mMonth === 'Karkidakam') events.push({ name: "Ramayana Masam", type: "season" });
       if (mMonth === 'Vrischikam') events.push({ name: "Mandalakala", type: "season" });
    }
    if (mMonth === 'Makaram' && day === 1) events.push({ name: "Pongal", type: "major" }); 

    if (mMonth === 'Dhanu' && star === 'Thiruvathira') events.push({ name: "Thiruvathira", type: "major" });
    if (mMonth === 'Makaram' && star === 'Pooyam') events.push({ name: "Thai Pooyam", type: "major" });
    
    if ((mMonth === 'Kumbham' || mMonth === 'Meenam') && star === 'Pooram') {
        if (date.getMonth() === 2 || (date.getMonth() === 1 && date.getDate() > 15)) {
             events.push({ name: "Attukal Pongala", type: "major" });
        }
    }
    if (mMonth === 'Medam' && star === 'Pooram') events.push({ name: "Thrissur Pooram", type: "major" });
    if (mMonth === 'Chingam' && star === 'Thiruvonam') events.push({ name: "Thiruvonam", type: "major", desc: "Onam" });
    if (mMonth === 'Chingam' && star === 'Uthradam') events.push({ name: "First Onam", type: "festival" });
    if (mMonth === 'Chingam' && star === 'Avittam') events.push({ name: "Third Onam", type: "festival" });
    if (mMonth === 'Chingam' && star === 'Rohini') events.push({ name: "Ashtami Rohini", type: "major" });
    if (mMonth === 'Vrischikam' && star === 'Karthika') events.push({ name: "Karthigai Deepam", type: "major" });
    if (mMonth === 'Kumbham' && tithiIndex === 28) events.push({ name: "Maha Shivarathri", type: "major" });
    if (mMonth === 'Karkidakam' && tithiIndex === 29) events.push({ name: "Karkidaka Vavu", type: "major" });
    if (mMonth === 'Chingam' && tithiIndex === 3) events.push({ name: "Vinayaka Chathurthi", type: "major" });

    const gDay = date.getDate();
    const gMonth = date.getMonth(); 
    if (gDay === 2 && gMonth === 9) events.push({ name: "Gandhi Jayanthi", type: "major" });
    if (gDay === 15 && gMonth === 7) events.push({ name: "Independence Day", type: "major" });
    if (gDay === 26 && gMonth === 0) events.push({ name: "Republic Day", type: "major" });
    if (gDay === 1 && gMonth === 10) events.push({ name: "Kerala Piravi", type: "major" });
    if (gDay === 14 && gMonth === 10) events.push({ name: "Children's Day", type: "festival" });
    if (gDay === 25 && gMonth === 11) events.push({ name: "Christmas", type: "major" });

    return events;
  }, []);

  const calendarData = useMemo(() => {
    const year = currentDate.getFullYear();
    const month = currentDate.getMonth();
    const firstDayOfMonth = new Date(year, month, 1);
    const lastDayOfMonth = new Date(year, month + 1, 0);
    const startingDayIndex = firstDayOfMonth.getDay(); 
    const days = [];
    
    for (let i = 0; i < startingDayIndex; i++) {
      const d = new Date(year, month, -startingDayIndex + i + 1);
      days.push({ date: d, isCurrentMonth: false });
    }
    for (let i = 1; i <= lastDayOfMonth.getDate(); i++) {
      const d = new Date(year, month, i);
      days.push({ date: d, isCurrentMonth: true });
    }
    const remainingCells = 42 - days.length;
    for (let i = 1; i <= remainingCells; i++) {
      const d = new Date(year, month + 1, i);
      days.push({ date: d, isCurrentMonth: false });
    }

    return days.map(dayObj => {
      const panchang = engine.getPanchang(dayObj.date);
      const events = getEventsForDay(dayObj.date, panchang);
      return { ...dayObj, panchang, events };
    });
  }, [currentDate, getEventsForDay]);

  const changeMonth = (offset) => setCurrentDate(new Date(currentDate.getFullYear(), currentDate.getMonth() + offset, 1));
  
  const isToday = (d) => {
    const today = new Date();
    return d.getDate() === today.getDate() && d.getMonth() === today.getMonth() && d.getFullYear() === today.getFullYear();
  };

  const WEEKDAYS = ["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"];

  const toggleMenu = () => setIsMenuOpen(!isMenuOpen);
  const handleNavigation = (e, href) => {
    e.preventDefault();
    if (currentView === 'gallery') {
      setCurrentView('home');
      setTimeout(() => {
        const element = document.querySelector(href);
        if (element) {
          const headerOffset = 15;
          const elementPosition = element.getBoundingClientRect().top;
          const offsetPosition = elementPosition + window.scrollY - headerOffset;
          window.scrollTo({ top: offsetPosition, behavior: "smooth" });
        }
      }, 100);
    } else {
      const element = document.querySelector(href);
      if (element) {
        const headerOffset = 15; 
        const elementPosition = element.getBoundingClientRect().top;
        const offsetPosition = elementPosition + window.scrollY - headerOffset;
        window.scrollTo({ top: offsetPosition, behavior: "smooth" });
      }
    }
    setIsMenuOpen(false);
  };

  const handleNextImage = (e) => {
    if (e) e.stopPropagation();
    setSelectedImageIndex((prev) => (prev + 1) % fullGalleryImages.length);
  };
  const handlePrevImage = (e) => {
    if (e) e.stopPropagation();
    setSelectedImageIndex((prev) => (prev - 1 + fullGalleryImages.length) % fullGalleryImages.length);
  };

  const getNavbarBg = () => {
    if (scrolled) return 'bg-white/95 backdrop-blur-sm shadow-md py-3';
    if (currentView === 'gallery') return 'bg-emerald-900 py-5'; 
    return 'bg-transparent py-5'; 
  };
  const isDarkText = scrolled;

  const handleMembershipClick = () => {
    const link = document.createElement('a');
    link.href = membershipPdf;
    link.download = 'KKS_MEMBERSHIP_FORM.pdf';
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    setShowMembershipModal(true);
  };

  return (
    <div className="font-sans text-gray-800 bg-stone-50 selection:bg-amber-200 selection:text-amber-900 w-full max-w-[100vw] overflow-x-hidden min-h-screen flex flex-col">
      <style>{`
        @keyframes fadeIn { from { opacity: 0; } to { opacity: 1; } }
        @keyframes scaleIn { from { transform: scale(0.95); opacity: 0; } to { transform: scale(1); opacity: 1; } }
        .animate-fade-in { animation: fadeIn 0.5s ease-out forwards; }
        .animate-scale-in { animation: scaleIn 0.7s ease-out forwards; }
        .custom-scrollbar::-webkit-scrollbar { width: 6px; }
        .custom-scrollbar::-webkit-scrollbar-track { background: #f1f5f9; }
        .custom-scrollbar::-webkit-scrollbar-thumb { background: #cbd5e1; border-radius: 10px; }
        .custom-scrollbar::-webkit-scrollbar-thumb:hover { background: #94a3b8; }
      `}</style>

      {/* Navigation */}
      <nav className={`fixed w-full z-50 transition-all duration-300 ${getNavbarBg()}`}>
        <div className="container mx-auto px-4 md:px-8 flex justify-between items-center">
          <div className="flex items-center gap-3 cursor-pointer" onClick={(e) => handleNavigation(e, '#home')}>
            <div className="w-10 h-10 md:w-12 md:h-12 rounded-full overflow-hidden border-2 border-amber-400 shadow-lg bg-white shrink-0">
              <img src={logoImage} alt="KKS Logo" className="w-full h-full object-cover" />
            </div>
            <div className={`text-lg md:text-2xl font-serif font-bold tracking-tight ${isDarkText ? 'text-emerald-900' : 'text-white'}`}>
              KKS <span className="hidden sm:inline font-sans font-normal opacity-90">Bhubaneswar</span>
            </div>
          </div>
          <div className="hidden lg:flex gap-8 items-center">
            {navLinks.map((link) => (
              <a key={link.name} href={link.href} onClick={(e) => handleNavigation(e, link.href)} className={`text-sm font-medium tracking-wide uppercase transition-colors hover:text-amber-500 cursor-pointer whitespace-nowrap ${isDarkText ? 'text-gray-700' : 'text-stone-100'}`}>
                {link.name}
              </a>
            ))}
          </div>
          <button onClick={toggleMenu} className={`lg:hidden ${isDarkText ? 'text-gray-800' : 'text-white'} p-2`}>
            {isMenuOpen ? <X size={28} /> : <Menu size={28} />}
          </button>
        </div>
        <div className={`lg:hidden absolute top-full left-0 w-full bg-white shadow-xl border-t border-gray-100 flex flex-col items-center gap-4 overflow-hidden transition-all duration-300 ease-in-out ${isMenuOpen ? 'max-h-96 opacity-100 py-4' : 'max-h-0 opacity-0 py-0'}`}>
            {navLinks.map((link) => (
              <a key={link.name} href={link.href} onClick={(e) => handleNavigation(e, link.href)} className="text-gray-700 font-medium text-lg hover:text-emerald-700 cursor-pointer whitespace-nowrap">
                {link.name}
              </a>
            ))}
        </div>
      </nav>

      {/* VIEW LOGIC */}
      {currentView === 'home' ? (
        <>
          {/* Hero Section */}
          <section id="home" className="relative min-h-screen flex items-center pt-20 overflow-hidden">
            <div className="absolute inset-0 z-0 bg-emerald-900">
              <div className="absolute inset-0 bg-gradient-to-r from-emerald-900/90 to-emerald-800/80 z-10"></div>
              <img src={`agm.jpg`} alt="Kerala Boat Race" className="absolute inset-0 w-full h-full object-cover mix-blend-overlay opacity-40" />
            </div>
            <div className="container mx-auto px-4 md:px-6 relative z-20 text-center md:text-left">
              <div className="md:w-2/3 lg:w-1/2">
                <span className="inline-block py-1 px-3 rounded-full bg-amber-500/20 text-amber-300 border border-amber-500/50 text-xs font-bold tracking-widest uppercase mb-6 backdrop-blur-sm">Est. 1966</span>
                <h1 className="text-4xl md:text-5xl lg:text-7xl font-serif font-bold text-white leading-tight mb-6">A Little Piece of <span className="text-amber-400 italic">Kerala</span> in Odisha</h1>
                <p className="text-lg md:text-xl text-stone-200 mb-8 leading-relaxed">We are the foremost Malayali Cultural and Social Organization in Bhubaneswar, dedicated to preserving our heritage and fostering cultural integration since 1966.</p>
                <div className="flex flex-col sm:flex-row gap-4 justify-center md:justify-start">
                  <button onClick={handleMembershipClick} className="bg-amber-500 hover:bg-amber-600 text-white px-8 py-4 rounded-lg font-bold text-lg transition-all shadow-lg hover:shadow-amber-500/30 flex items-center justify-center gap-2 group">
                    Become a Member <ArrowRight className="group-hover:translate-x-1 transition-transform" size={20} />
                  </button>
                  <button onClick={(e) => handleNavigation(e, '#events')} className="bg-white/10 hover:bg-white/20 backdrop-blur-md text-white border border-white/30 px-8 py-4 rounded-lg font-bold text-lg transition-all flex items-center justify-center gap-2">Explore Events</button>
                </div>
              </div>
            </div>
          </section>

          {/* About Section */}
          <section id="about" className="py-20 md:py-32 relative">
            <div className="container mx-auto px-4 md:px-6">
              <div className="flex flex-col lg:flex-row gap-16 items-center">
                <div className="lg:w-1/2 relative">
                  <div className="grid grid-cols-2 gap-4">
                    <img src={`kathakali.jpg`} alt="Kathakali" className="rounded-2xl shadow-xl w-full h-40 md:h-64 object-cover transform translate-y-8" />
                    <img src={`onam sadya.jpg`} alt="Onam Sadhya" className="rounded-2xl shadow-xl w-full h-40 md:h-64 object-cover" />
                  </div>
                  <div className="absolute -z-10 top-0 left-0 w-full h-full bg-amber-100 rounded-full blur-3xl opacity-50 transform scale-150"></div>
                </div>
                <div className="lg:w-1/2">
                  <h4 className="text-emerald-700 font-bold uppercase tracking-widest text-sm mb-2">About Our Society</h4>
                  <h2 className="text-3xl md:text-4xl font-serif font-bold text-gray-900 mb-6">Unity in Diversity, <br/> Rooted in Tradition.</h2>
                  <div className="space-y-6 text-gray-600 leading-relaxed">
                    <p>To bring the Malayali families in Bhubaneswar closer, a few visionary members of the community established the <span className="font-semibold text-emerald-800">Kerala Kala Samiti in 1966</span>.</p>
                    <p>Our mission is to integrate and uphold the rich culture of Kerala while linking with the great culture of Odisha. We act impartially, without influence from political or religious groups.</p>
                  </div>
                </div>
              </div>
            </div>
          </section>

          {/* Mission Section */}
          <section id="mission" className="py-20 bg-white">
            <div className="container mx-auto px-4 md:px-6">
               <div className="text-center max-w-3xl mx-auto mb-16">
                <h4 className="text-emerald-700 font-bold uppercase tracking-widest text-sm mb-2">Why We Exist</h4>
                <h2 className="text-3xl md:text-4xl font-serif font-bold text-gray-900 mb-4">Our Objectives</h2>
                <p className="text-gray-600">Guided by principles of dignity, integrity, and cultural pride, we strive to build a stronger community.</p>
               </div>
               <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8">
                 <div className="bg-stone-50 p-8 rounded-2xl border border-stone-100 hover:border-emerald-200 hover:shadow-lg transition-all group">
                    <div className="w-12 h-12 bg-emerald-100 text-emerald-700 rounded-xl flex items-center justify-center mb-6"><HandHeart size={24}/></div>
                    <h3 className="text-xl font-bold text-gray-900 mb-3">Dignity & Welfare</h3>
                    <p className="text-gray-600 text-sm leading-relaxed">
                      To promote India's dignity and integrity in terms of social life. We focus on social welfare initiatives that uplift our members and the surrounding community.
                    </p>
                 </div>
                 <div className="bg-stone-50 p-8 rounded-2xl border border-stone-100 hover:border-emerald-200 hover:shadow-lg transition-all group">
                    <div className="w-12 h-12 bg-amber-100 text-amber-600 rounded-xl flex items-center justify-center mb-6"><Landmark size={24}/></div>
                    <h3 className="text-xl font-bold text-gray-900 mb-3">Cultural Integration</h3>
                    <p className="text-gray-600 text-sm leading-relaxed">
                      To link the rich culture of Kerala with the great culture of Odisha. We facilitate a cultural exchange that honors both traditions.
                    </p>
                 </div>
                 <div className="bg-stone-50 p-8 rounded-2xl border border-stone-100 hover:border-emerald-200 hover:shadow-lg transition-all group">
                    <div className="w-12 h-12 bg-emerald-100 text-emerald-700 rounded-xl flex items-center justify-center mb-6"><Scale size={24}/></div>
                    <h3 className="text-xl font-bold text-gray-900 mb-3">Impartiality</h3>
                    <p className="text-gray-600 text-sm leading-relaxed">
                      To act impartially without political or religious influence. We give extreme consideration to the welfare of society as a whole.
                    </p>
                 </div>
                 <div className="bg-stone-50 p-8 rounded-2xl border border-stone-100 hover:border-emerald-200 hover:shadow-lg transition-all group">
                    <div className="w-12 h-12 bg-amber-100 text-amber-600 rounded-xl flex items-center justify-center mb-6"><Users size={24}/></div>
                    <h3 className="text-xl font-bold text-gray-900 mb-3">Community Support</h3>
                    <p className="text-gray-600 text-sm leading-relaxed">
                      To help needy Malayalis in Bhubaneswar and serve as a link to the Oriya community in Kerala. We perform charity irrespective of caste or creed.
                    </p>
                 </div>
                 <div className="bg-stone-50 p-8 rounded-2xl border border-stone-100 hover:border-emerald-200 hover:shadow-lg transition-all group">
                    <div className="w-12 h-12 bg-emerald-100 text-emerald-700 rounded-xl flex items-center justify-center mb-6"><Sprout size={24}/></div>
                    <h3 className="text-xl font-bold text-gray-900 mb-3">Future Generations</h3>
                    <p className="text-gray-600 text-sm leading-relaxed">
                      To connect with the next generation, transforming Kerala's rich culture and heritage to them through Malayalam classes and youth activities.
                    </p>
                 </div>
                 <div className="bg-stone-50 p-8 rounded-2xl border border-stone-100 hover:border-emerald-200 hover:shadow-lg transition-all group">
                    <div className="w-12 h-12 bg-amber-100 text-amber-600 rounded-xl flex items-center justify-center mb-6"><CalendarIcon size={24}/></div>
                    <h3 className="text-xl font-bold text-gray-900 mb-3">Regular Activities</h3>
                    <p className="text-gray-600 text-sm leading-relaxed">
                      To organize Cultural programs, Picnics, Medical Camps, Sports, and celebrate major festivals to foster friendship and goodwill.
                    </p>
                 </div>
               </div>
            </div>
          </section>

          {/* Cultural Link Section */}
          <section className="relative bg-emerald-900 py-0 overflow-hidden">
            <div className="grid md:grid-cols-2 h-auto md:h-[600px]">
              <div className="relative group overflow-hidden h-96 md:h-full">
                <img src="https://images.unsplash.com/photo-1506461883276-594a12b11cf3?q=80&w=2000&auto=format&fit=crop" alt="Kerala Backwaters" className="w-full h-full object-cover transition-transform duration-1000 group-hover:scale-110" />
                <div className="absolute inset-0 bg-black/40 group-hover:bg-black/20 transition-colors flex flex-col justify-center items-center text-center p-8">
                  <h3 className="text-4xl md:text-5xl font-serif font-bold text-white mb-2 tracking-wide">Kerala</h3>
                  <p className="text-amber-300 font-medium uppercase tracking-widest text-sm">God's Own Country</p>
                </div>
              </div>
              <div className="relative group overflow-hidden h-96 md:h-full bg-stone-900">
                <img src="1-rajarani-temple-bhubaneshwar-odisha-2-state-hero.jpg" alt="Odisha Konark Temple" className="w-full h-full object-cover transition-transform duration-1000 group-hover:scale-110" onError={(e) => { if (e.target.src !== "https://upload.wikimedia.org/wikipedia/commons/thumb/4/47/Konark_Sun_Temple_-_Odisha.jpg/800px-Konark_Sun_Temple_-_Odisha.jpg") { e.target.src = "https://upload.wikimedia.org/wikipedia/commons/thumb/4/47/Konark_Sun_Temple_-_Odisha.jpg/800px-Konark_Sun_Temple_-_Odisha.jpg"; } }} />
                <div className="absolute inset-0 bg-black/40 group-hover:bg-black/20 transition-colors flex flex-col justify-center items-center text-center p-8">
                  <h3 className="text-4xl md:text-5xl font-serif font-bold text-white mb-2 tracking-wide">Odisha</h3>
                  <p className="text-amber-300 font-medium uppercase tracking-widest text-sm">The Soul of India</p>
                </div>
              </div>
              <div className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 z-10 w-32 h-32 md:w-48 md:h-48 bg-white/10 backdrop-blur-md rounded-full border border-white/30 flex items-center justify-center p-4 text-center shadow-2xl">
                <div className="bg-emerald-900 rounded-full w-full h-full flex items-center justify-center border-4 border-amber-400">
                  <div className="text-white">
                    <p className="text-xs uppercase font-bold text-amber-300 mb-1">Bridging</p>
                    <span className="font-serif text-2xl md:text-3xl font-bold">&</span>
                    <p className="text-xs uppercase font-bold text-amber-300 mt-1">Cultures</p>
                  </div>
                </div>
              </div>
            </div>
          </section>

          {/* EVENTS & CALENDAR SECTION (Merged) */}
          <section id="events" className="relative py-20 overflow-hidden bg-green-100">
            <div className="container mx-auto px-4 md:px-6 relative z-10">
              <div className="text-center max-w-3xl mx-auto mb-16">
                <h2 className="text-3xl md:text-4xl font-serif font-bold text-gray-900 mb-4">Latest News & Events</h2>
                <p className="text-gray-600">Stay updated with our latest social media posts and upcoming cultural dates.</p>
              </div>

              {/* MODIFIED GRID: CALENDAR TAKES MORE SPACE */}
              <div className="grid grid-cols-1 lg:grid-cols-[380px_1fr] gap-6 items-start">
                
                {/* LEFT: Facebook Feed (Fixed 375px Max) */}
                <div className="flex flex-col items-center w-full">
                  <h3 className="text-2xl font-bold text-emerald-800 mb-6 flex items-center gap-2">
                    <Facebook className="text-blue-600" /> Community Feed
                  </h3>
                  <div className="w-full max-w-[375px] bg-white rounded-xl shadow-2xl overflow-hidden border-4 border-white">
                    <iframe 
                      src={`https://www.facebook.com/plugins/page.php?href=${encodedFbUrl}&tabs=timeline&width=375&height=800&small_header=false&adapt_container_width=true&hide_cover=false&show_facepile=true&appId`} 
                      width="100%" 
                      height="800" 
                      style={{border:'none', overflow:'hidden', maxWidth: '100%'}} 
                      scrolling="no" 
                      frameBorder="0" 
                      allowFullScreen={true} 
                      title="Facebook Timeline Feed"
                    ></iframe>
                  </div>
                </div>

                {/* RIGHT: New Malayalam Calendar (Expands to fill) */}
                <div className="flex flex-col items-center w-full h-full">
                  <h3 className="text-2xl font-bold text-emerald-800 mb-6 flex items-center gap-2">
                    <CalendarIcon className="text-amber-500" /> Malayalam Calendar
                  </h3>
                  {/* Calendar Widget - Full Width */}
                  <div className="w-full bg-white/95 backdrop-blur-xl border border-white/50 shadow-2xl rounded-3xl overflow-hidden ring-1 ring-black/5 h-full flex flex-col">
                    {/* Header */}
                    <div className="bg-emerald-800 text-white p-6 flex justify-between items-center">
                      <button onClick={() => changeMonth(-1)} className="p-2 hover:bg-emerald-700 rounded-full"><ChevronLeft /></button>
                      <div className="text-center">
                        <h2 className="text-2xl font-bold font-serif">{currentDate.toLocaleString('default', { month: 'long' })}</h2>
                        <p className="text-emerald-200">{currentDate.getFullYear()}</p>
                      </div>
                      <button onClick={() => changeMonth(1)} className="p-2 hover:bg-emerald-700 rounded-full"><ChevronRight /></button>
                    </div>
                    {/* Grid */}
                    <div className="p-4 bg-emerald-50/30 flex-grow">
                       <div className="grid grid-cols-7 mb-2 text-center text-xs font-bold text-emerald-800 uppercase tracking-widest">
                          {WEEKDAYS.map(d => <div key={d}>{d}</div>)}
                       </div>
                       <div className="grid grid-cols-7 gap-1 bg-slate-200 border border-slate-200 h-full min-h-[400px]">
                          {calendarData.map((data, idx) => {
                            const today = isToday(data.date);
                            const hasMajor = data.events.some(e => e.type === 'major');
                            const firstEvent = data.events.length > 0 ? data.events[0].name : null;
                            
                            return (
                              <div 
                                key={idx} 
                                onClick={() => setSelectedDay(data)}
                                className={`min-h-[80px] p-1 bg-white cursor-pointer hover:bg-emerald-50 transition-colors flex flex-col justify-between ${!data.isCurrentMonth ? 'text-gray-300' : ''} ${today ? 'bg-emerald-100 ring-1 ring-emerald-500 z-10' : ''} ${hasMajor && data.isCurrentMonth ? 'bg-amber-50' : ''}`}
                              >
                                <div className="flex justify-between items-start">
                                  <span className={`text-sm font-bold ${today ? 'text-emerald-700' : 'text-slate-700'}`}>{data.date.getDate()}</span>
                                  {data.panchang && (
                                    <div className="flex flex-col items-end">
                                      {/* NEW: Malayalam Month and Day */}
                                      <span className="text-[9px] font-bold text-emerald-600 leading-tight">
                                        {data.panchang.solar.month.en.substring(0,3)} {data.panchang.solar.day}
                                      </span>
                                      {/* NEW: Nakshatra (Star) Name */}
                                      <span className="text-[8px] text-gray-400 leading-tight hidden sm:block">
                                        {data.panchang.nakshatraName.en}
                                      </span>
                                    </div>
                                  )}
                                </div>
                                {/* NEW: Event Name Text directly in cell */}
                                <div className="mt-1">
                                  {firstEvent && (
                                    <div className={`text-[9px] sm:text-[10px] font-bold truncate leading-tight rounded px-1 py-0.5 ${hasMajor ? 'bg-amber-100 text-amber-800' : 'bg-emerald-100 text-emerald-800'}`}>
                                      {firstEvent}
                                    </div>
                                  )}
                                  {/* Event Dots (Fallback/Additional) */}
                                  {!firstEvent && (
                                    <div className="flex gap-0.5 mt-1">
                                      {data.events.map((e, i) => (
                                        <div key={i} className={`w-1.5 h-1.5 rounded-full ${e.type === 'major' ? 'bg-amber-500' : 'bg-emerald-400'}`}></div>
                                      ))}
                                    </div>
                                  )}
                                </div>
                              </div>
                            );
                          })}
                       </div>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </section>

          {/* Gallery Preview Section */}
          <section id="gallery" className="py-20 bg-white">
            <div className="container mx-auto px-4 md:px-6">
               <div className="flex flex-col md:flex-row justify-between items-start md:items-end mb-10">
                 <div className="text-left mb-6 md:mb-0">
                  <h4 className="text-emerald-700 font-bold uppercase tracking-widest text-sm mb-2">Our Memories</h4>
                  <h2 className="text-3xl font-serif font-bold text-gray-900">Life at Kala Samiti</h2>
                 </div>
                 <button onClick={() => { setCurrentView('gallery'); window.scrollTo({ top: 0, behavior: "smooth" }); }} className="hidden md:flex items-center gap-2 px-6 py-2 border border-gray-300 rounded-full"><ImageIcon size={18} /> View All Photos</button>
               </div>
               <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                  {fullGalleryImages.slice(0, 9).map((img, index) => (
                    <div key={img.id} className={`relative rounded-2xl overflow-hidden group shadow-md cursor-pointer ${index === 0 ? 'col-span-2 row-span-2' : 'col-span-1 row-span-1 aspect-video'}`} onClick={() => setSelectedImageIndex(index)}>
                      <img src={img.src} className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-105" alt={img.alt} />
                    </div>
                  ))}
               </div>
               <div className="mt-8 text-center md:hidden">
                 <button onClick={() => { setCurrentView('gallery'); window.scrollTo({ top: 0, behavior: "smooth" }); }} className="bg-emerald-700 text-white px-8 py-3 rounded-full font-bold shadow-lg">View All Photos</button>
               </div>
            </div>
          </section>

          {/* Membership Banner */}
          <section id="membership" className="py-20 bg-emerald-900 text-white relative overflow-hidden">
             <div className="absolute inset-0 opacity-10" style={{ backgroundImage: 'radial-gradient(#fbbf24 1px, transparent 1px)', backgroundSize: '30px 30px' }}></div>
             <div className="container mx-auto px-4 md:px-6 relative z-10 text-center">
               <h2 className="text-3xl md:text-5xl font-serif font-bold mb-6">Become a part of our Family</h2>
               <div className="flex flex-col sm:flex-row gap-4 justify-center">
                 <button onClick={handleMembershipClick} className="bg-amber-500 hover:bg-amber-600 text-white px-8 py-3 rounded-lg font-bold shadow-lg flex items-center gap-2"><FileDown size={20} /> Apply for Membership</button>
               </div>
             </div>
          </section>
        </>
      ) : (
        /* Full Gallery Page */
        <section className="min-h-screen bg-stone-50 pt-28 pb-20">
          <div className="container mx-auto px-4 md:px-6">
            <div className="flex items-center gap-4 mb-10">
              <button onClick={() => setCurrentView('home')} className="w-12 h-12 rounded-full bg-white shadow-md flex items-center justify-center hover:bg-emerald-50 text-emerald-700"><ArrowLeft size={24} /></button>
              <div><h4 className="text-emerald-700 font-bold uppercase text-xs mb-1">Gallery</h4><h2 className="text-3xl font-serif font-bold text-gray-900">All Memories ({fullGalleryImages.length})</h2></div>
            </div>
            <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-5 gap-4">
               {fullGalleryImages.map((img, index) => (
                 <div key={img.id} className="relative aspect-square rounded-xl overflow-hidden group shadow-sm hover:shadow-xl cursor-pointer" onClick={() => setSelectedImageIndex(index)}>
                   <img src={img.src} alt={img.alt} className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-110" loading="lazy" />
                 </div>
               ))}
            </div>
          </div>
        </section>
      )}

      {/* Footer */}
      <footer id="contact" className="bg-stone-900 text-stone-400 py-16">
         {/* ... (Footer code remains same) ... */}
         <div className="container mx-auto px-4 md:px-6">
          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-12 border-b border-stone-800 pb-12">
            <div>
               <div className="flex items-center gap-2 mb-6">
                <div className="w-10 h-10 rounded-full overflow-hidden border-2 border-amber-400 shadow-lg bg-white shrink-0"><img src={logoImage} alt="KKS Logo" className="w-full h-full object-cover"/></div>
                <span className="text-xl font-serif font-bold text-stone-200">KKS Bhubaneswar</span>
              </div>
              <p className="mb-6 text-sm leading-relaxed">A non-profit, cultural organization contributing to cultural integration and social service in Odisha since 1966.</p>
              <div className="flex gap-4">
                <a href="https://www.facebook.com/keralakalasamitibbsr" className="w-10 h-10 rounded-full bg-stone-800 flex items-center justify-center hover:bg-emerald-700 hover:text-white transition-all"><Facebook size={18} /></a>
                <a href="https://www.instagram.com/keralakalasamiti/" className="w-10 h-10 rounded-full bg-stone-800 flex items-center justify-center hover:bg-pink-600 hover:text-white transition-all"><Instagram size={18} /></a>
              </div>
            </div>
            <div>
              <h3 className="text-white font-bold mb-6">Quick Links</h3>
              <ul className="space-y-3 text-sm">
                <li><a href="#home" onClick={(e) => handleNavigation(e, '#home')} className="hover:text-emerald-500 transition-colors cursor-pointer">Our History</a></li>
                <li><a href="#" className="hover:text-emerald-500 transition-colors">Executive Committee</a></li>
                <li><a href="#" className="hover:text-emerald-500 transition-colors">Life Members List</a></li>
                <li><a href="#events" onClick={(e) => handleNavigation(e, '#events')} className="hover:text-emerald-500 transition-colors cursor-pointer">News & Circulars</a></li>
              </ul>
            </div>
            <div>
              <h3 className="text-white font-bold mb-6">Contact Us</h3>
              <ul className="space-y-4 text-sm">
                <li className="flex items-start gap-3"><MapPin size={18} className="text-amber-500 mt-1 shrink-0" /><span>Kerala Kala Samiti Hall,<br />Unit-4, Bhubaneswar,<br />Odisha - 751001</span></li>
                <li className="flex items-center gap-3"><PhoneCallIcon size={18} className="text-amber-500 shrink-0" /><span>+91 98275 75106</span></li>
                <li className="flex items-center gap-3"><Mail size={18} className="text-amber-500 shrink-0" /><span>secretarykksbbsr@gmail.com</span></li>
              </ul>
            </div>
          </div>
          <div className="pt-8 text-center text-xs text-stone-600 flex flex-col md:flex-row justify-between items-center gap-4">
            <p>&copy; 2025 Kerala Kala Samiti, Bhubaneswar. All rights reserved.</p>
            <p>Designed with respect for tradition.</p>
          </div>
        </div>
      </footer>

      {/* Modals: Membership & Calendar Details */}
      {showMembershipModal && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm animate-fade-in">
           <div className="bg-white rounded-2xl shadow-2xl p-8 max-w-md w-full relative transform transition-all scale-100 animate-scale-in">
             <button onClick={() => setShowMembershipModal(false)} className="absolute top-4 right-4 text-gray-400 hover:text-gray-600 transition-colors"><X size={24} /></button>
             <div className="flex flex-col items-center text-center">
               <div className="w-16 h-16 bg-green-100 text-green-600 rounded-full flex items-center justify-center mb-6"><CheckCircle size={32} /></div>
               <h3 className="text-2xl font-bold text-gray-900 mb-2">Form Downloaded!</h3>
               <p className="text-gray-600 mb-6 leading-relaxed">Please print and fill out the form. <br/><span className="font-semibold text-emerald-800">Submit the filled up form to any association member.</span></p>
               <button onClick={() => setShowMembershipModal(false)} className="bg-emerald-700 hover:bg-emerald-800 text-white font-bold py-3 px-8 rounded-lg w-full transition-colors">Okay, Got it</button>
             </div>
           </div>
        </div>
      )}

      {/* Calendar Details Modal */}
      <CalendarModal isOpen={!!selectedDay} onClose={() => setSelectedDay(null)} data={selectedDay} />

      {/* Lightbox Slider */}
      {selectedImageIndex !== null && (
        <div className="fixed inset-0 z-[110] flex items-center justify-center bg-black/90 backdrop-blur-md animate-fade-in" onClick={() => setSelectedImageIndex(null)}>
          <button onClick={() => setSelectedImageIndex(null)} className="absolute top-4 right-4 text-white/70 hover:text-white transition-colors p-2 z-[120]"><X size={32} /></button>
          <button onClick={handlePrevImage} className="absolute left-4 top-1/2 -translate-y-1/2 text-white/70 hover:text-white bg-black/30 hover:bg-black/50 rounded-full p-2 transition-all z-[120]"><ChevronLeft size={40} /></button>
          <div className="relative max-h-[90vh] max-w-[90vw]" onClick={(e) => e.stopPropagation()}>
            <img key={selectedImageIndex} src={fullGalleryImages[selectedImageIndex].src} className="max-h-[90vh] max-w-[90vw] object-contain rounded-lg shadow-2xl animate-scale-in" alt={fullGalleryImages[selectedImageIndex].alt} />
          </div>
          <button onClick={handleNextImage} className="absolute right-4 top-1/2 -translate-y-1/2 text-white/70 hover:text-white bg-black/30 hover:bg-black/50 rounded-full p-2 transition-all z-[120]"><ChevronRight size={40} /></button>
        </div>
      )}

    </div>
  );
};

export default App;