import { useState, useEffect, useMemo, useCallback, useRef } from 'react';
// eslint-disable-next-line no-unused-vars -- `motion` is used via JSX member expressions (<motion.div>), which this config's plain no-unused-vars doesn't detect
import { motion, MotionConfig, useScroll, useTransform } from 'framer-motion';
import { Menu, X, Calendar as CalendarIcon, MapPin, Users, Mail, Facebook, Instagram, Image as ImageIcon, Scale, HandHeart, Sprout, Landmark, FileDown, CheckCircle, ArrowLeft, PhoneCall as PhoneCallIcon, ChevronLeft, ChevronRight, Moon, Star, Info } from 'lucide-react';
import { ZariProgress } from './motifs/ZariProgress.jsx';
import { HouseboatCrossing } from './motifs/HouseboatCrossing.jsx';
import { MuralLineArt } from './motifs/MuralLineArt.jsx';

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

// --- ASTRONOMICAL & CALENDAR ENGINE  ---
export class PanchangEngine {
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
    const noonDate = new Date(date.getFullYear(), date.getMonth(), date.getDate(), 12, 0, 0);
    const jd = this.getJulianDay(noonDate);
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
    const sunriseDate = new Date(date.getFullYear(), date.getMonth(), date.getDate(), 6, 0, 0);
    const jd = this.getJulianDay(sunriseDate);
    const ayanamsa = this.getAyanamsa(jd);
    const sunLong = this.normalize(this.getSunLongitude(jd) - ayanamsa);
    const moonLong = this.normalize(this.getMoonLongitude(jd) - ayanamsa);
    const tithiVal = this.getTithi(sunLong, moonLong);
    const nakshatraVal = this.getNakshatra(moonLong);
    const tithiIndex = Math.floor(tithiVal);
    const nakshatraIndex = Math.floor(nakshatraVal);
    const solarData = this.getMalayalamDate(date);

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

// --- SHARED: quiet, single-purpose scroll reveal (opacity only, once) ---
const EASE = [0.16, 1, 0.3, 1];

const Reveal = ({ children, className = '', delay = 0, y = 22, ...rest }) => (
  <motion.div
    className={className}
    initial={{ opacity: 0, y }}
    whileInView={{ opacity: 1, y: 0 }}
    viewport={{ once: true, amount: 0.2 }}
    transition={{ duration: 0.8, delay, ease: EASE }}
    {...rest}
  >
    {children}
  </motion.div>
);

// Staggered reveal for grids/lists: wrap the group with <Stagger>, each
// child with <StaggerItem>.
const staggerContainerVariants = {
  hidden: {},
  visible: { transition: { staggerChildren: 0.09, delayChildren: 0.05 } },
};
const staggerItemVariants = {
  hidden: { opacity: 0, y: 20 },
  visible: { opacity: 1, y: 0, transition: { duration: 0.6, ease: EASE } },
};
const Stagger = ({ children, className = '' }) => (
  <motion.div className={className} variants={staggerContainerVariants} initial="hidden" whileInView="visible" viewport={{ once: true, amount: 0.15 }}>
    {children}
  </motion.div>
);
const StaggerItem = ({ children, className = '', ...rest }) => (
  <motion.div className={className} variants={staggerItemVariants} {...rest}>
    {children}
  </motion.div>
);

// --- CALENDAR HELPER COMPONENTS ---
const CalendarModal = ({ isOpen, onClose, data }) => {
  useEffect(() => {
    if (!isOpen) return;
    const handleKeyDown = (e) => { if (e.key === 'Escape') onClose(); };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [isOpen, onClose]);

  if (!isOpen || !data) return null;

  return (
    <div
      className="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-ink/70 backdrop-blur-md animate-fade-in"
      onClick={onClose}
      role="presentation"
    >
      <div
        className="bg-cream rounded-2xl shadow-2xl w-full max-w-md overflow-hidden relative border border-gold/20 animate-scale-in font-body"
        onClick={(e) => e.stopPropagation()}
        role="dialog"
        aria-modal="true"
        aria-label="Calendar day details"
      >
        <div className="h-40 bg-backwater relative p-6 flex flex-col justify-end overflow-hidden">
          <div className="absolute top-0 right-0 w-32 h-32 bg-gold/10 rounded-full blur-2xl -mr-10 -mt-10"></div>
          <button onClick={onClose} className="absolute top-4 right-4 p-2 bg-ink/20 hover:bg-ink/40 text-ivory rounded-full transition-colors z-10"><X size={22} /></button>
          <h2 className="text-6xl font-display font-bold text-ivory tracking-tight">{data.date.getDate()}</h2>
          <p className="text-ivory/80 font-medium tracking-wide text-xl">{data.date.toLocaleString('default', { month: 'long' })} {data.date.getFullYear()}</p>
          <div className="text-ivory/60 text-base mt-1 flex items-center gap-2"><span>{data.date.toLocaleString('default', { weekday: 'long' })}</span></div>
        </div>

        <div className="p-6 space-y-6 max-h-[60vh] overflow-y-auto custom-scrollbar">
          <div className="flex items-center justify-between p-5 bg-gold/10 rounded-xl border border-gold/20">
            <div>
              <p className="text-sm font-semibold text-gold-dark mb-1">Malayalam Date</p>
              <h3 className="text-3xl font-bold text-ink font-accent italic">{data.panchang.solar.month.ml} {data.panchang.solar.day}</h3>
              <p className="text-lg text-ink/70 font-medium">{data.panchang.solar.month.en} {data.panchang.solar.day}</p>
            </div>
            <div className="h-14 w-14 bg-gold/15 rounded-full flex items-center justify-center text-gold-dark shrink-0"><span className="text-xl font-bold">കൊ</span></div>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div className="p-4 bg-ink/[0.03] rounded-lg border border-ink/10">
              <div className="flex items-center gap-2 mb-2 text-gold-dark"><Star size={16} /><span className="text-xs font-semibold">Nakshatra</span></div>
              <p className="font-semibold text-ink text-base">{data.panchang.nakshatraName.ml}</p>
              <p className="text-sm text-ink/50">{data.panchang.nakshatraName.en}</p>
            </div>
            <div className="p-4 bg-ink/[0.03] rounded-lg border border-ink/10">
              <div className="flex items-center gap-2 mb-2 text-backwater"><Moon size={16} /><span className="text-xs font-semibold">Tithi</span></div>
              <p className="font-semibold text-ink text-base">{data.panchang.tithiName.ml}</p>
              <p className="text-sm text-ink/50">{data.panchang.tithiName.en}</p>
            </div>
          </div>

          {data.events.length > 0 ? (
            <div>
              <h4 className="text-sm font-semibold text-ink/40 mb-4 flex items-center gap-2"><span className="w-4 h-[1px] bg-ink/15"></span>Special events<span className="flex-1 h-[1px] bg-ink/15"></span></h4>
              <div className="space-y-3">
                {data.events.map((evt, i) => (
                  <div key={i} className="flex items-start gap-3 p-4 rounded-lg bg-ink/[0.03] border border-ink/10">
                    <span className={`mt-1.5 w-2.5 h-2.5 rounded-full flex-shrink-0 ${evt.type === 'major' ? 'bg-gold' : 'bg-backwater'}`}></span>
                    <div><span className="text-base font-semibold text-ink block">{evt.name}</span>{evt.desc && <span className="text-sm text-ink/50 block mt-1">{evt.desc}</span>}</div>
                  </div>
                ))}
              </div>
            </div>
          ) : (
            <div className="text-center py-6 text-ink/40 text-base font-accent italic">No major festivals today</div>
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
  const [fbFeedVisible, setFbFeedVisible] = useState(() => typeof IntersectionObserver === 'undefined');
  const fbFeedRef = useRef(null);
  const heroRef = useRef(null);
  const { scrollYProgress: heroScroll } = useScroll({ target: heroRef, offset: ['start start', 'end start'] });
  const heroImageY = useTransform(heroScroll, [0, 1], ['0%', '22%']);

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
    const node = fbFeedRef.current;
    if (!node || typeof IntersectionObserver === 'undefined') return;
    const observer = new IntersectionObserver((entries) => {
      if (entries[0].isIntersecting) {
        setFbFeedVisible(true);
        observer.disconnect();
      }
    }, { rootMargin: '200px' });
    observer.observe(node);
    return () => observer.disconnect();
  }, []);

  const handleNextImage = useCallback((e) => {
    if (e) e.stopPropagation();
    setSelectedImageIndex((prev) => (prev + 1) % fullGalleryImages.length);
  }, [fullGalleryImages.length]);
  const handlePrevImage = useCallback((e) => {
    if (e) e.stopPropagation();
    setSelectedImageIndex((prev) => (prev - 1 + fullGalleryImages.length) % fullGalleryImages.length);
  }, [fullGalleryImages.length]);

  useEffect(() => {
    const handleKeyDown = (e) => {
      if (e.key === 'Escape' && showMembershipModal) { setShowMembershipModal(false); return; }
      if (selectedImageIndex === null) return;
      if (e.key === 'ArrowRight') handleNextImage(e);
      else if (e.key === 'ArrowLeft') handlePrevImage(e);
      else if (e.key === 'Escape') setSelectedImageIndex(null);
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [selectedImageIndex, handleNextImage, handlePrevImage, showMembershipModal]);

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
    if (typeof window.history.pushState === 'function') {
      window.history.pushState(null, '', href);
    }
    // scroll-mt-24 on each section handles the fixed-nav offset, so a plain
    // scrollIntoView lands correctly whether the nav is in its tall
    // (unscrolled) or short (scrolled) state.
    if (currentView === 'gallery') {
      setCurrentView('home');
      setTimeout(() => {
        const element = document.querySelector(href);
        if (element) {
          element.scrollIntoView({ behavior: 'smooth', block: 'start' });
        }
      }, 100);
    } else {
      const element = document.querySelector(href);
      if (element) {
        element.scrollIntoView({ behavior: 'smooth', block: 'start' });
      }
    }
    setIsMenuOpen(false);
  };

  const isDarkText = scrolled || currentView === 'gallery';
  const getNavbarBg = () => {
    if (scrolled) return 'bg-cream/95 backdrop-blur-sm border-b border-gold/15 py-3';
    if (currentView === 'gallery') return 'bg-cream border-b border-gold/15 py-5';
    return 'bg-transparent py-6';
  };

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
    <MotionConfig reducedMotion="user">
    <div className="font-body text-ink bg-cream selection:bg-gold/30 selection:text-ink w-full max-w-[100vw] overflow-x-hidden min-h-screen flex flex-col">
      <style>{`
        @keyframes fadeIn { from { opacity: 0; } to { opacity: 1; } }
        @keyframes scaleIn { from { transform: scale(0.95); opacity: 0; } to { transform: scale(1); opacity: 1; } }
        .animate-fade-in { animation: fadeIn 0.4s ease-out forwards; }
        .animate-scale-in { animation: scaleIn 0.5s cubic-bezier(0.16, 1, 0.3, 1) forwards; }
        .custom-scrollbar::-webkit-scrollbar { width: 6px; }
        .custom-scrollbar::-webkit-scrollbar-track { background: transparent; }
        .custom-scrollbar::-webkit-scrollbar-thumb { background: #A97A1F55; border-radius: 10px; }
        .custom-scrollbar::-webkit-scrollbar-thumb:hover { background: #A97A1F99; }
      `}</style>

      <ZariProgress />

      {/* Navigation */}
      <nav className={`fixed w-full z-50 transition-all duration-300 ${getNavbarBg()}`}>
        <div className="container mx-auto px-4 md:px-8 flex justify-between items-center">
          <div className="flex items-center gap-3 cursor-pointer" onClick={(e) => handleNavigation(e, '#home')}>
            <div className="w-10 h-10 md:w-11 md:h-11 rounded-full overflow-hidden border border-gold/60 shadow-sm bg-cream shrink-0">
              <img src={logoImage} alt="KKS Logo" className="w-full h-full object-cover" />
            </div>
            <div className={`text-lg md:text-xl font-display font-bold tracking-tight ${isDarkText ? 'text-ink' : 'text-ivory'}`}>
              KKS <span className={`hidden sm:inline font-medium opacity-80`}>Bhubaneswar</span>
            </div>
          </div>
          <div className="hidden lg:flex gap-9 items-center">
            {navLinks.map((link) => (
              <a key={link.name} href={link.href} onClick={(e) => handleNavigation(e, link.href)} className={`text-sm font-medium transition-colors hover:text-gold cursor-pointer whitespace-nowrap ${isDarkText ? 'text-ink/80' : 'text-ivory/90'}`}>
                {link.name}
              </a>
            ))}
          </div>
          <button onClick={toggleMenu} className={`lg:hidden ${isDarkText ? 'text-ink' : 'text-ivory'} p-2`} aria-label={isMenuOpen ? 'Close menu' : 'Open menu'}>
            {isMenuOpen ? <X size={26} /> : <Menu size={26} />}
          </button>
        </div>
        <div className={`lg:hidden absolute top-full left-0 w-full bg-cream shadow-xl border-t border-gold/15 flex flex-col items-center gap-4 overflow-hidden transition-all duration-300 ease-in-out ${isMenuOpen ? 'max-h-96 opacity-100 py-6' : 'max-h-0 opacity-0 py-0'}`}>
            {navLinks.map((link) => (
              <a key={link.name} href={link.href} onClick={(e) => handleNavigation(e, link.href)} className="text-ink font-medium text-lg hover:text-gold cursor-pointer whitespace-nowrap">
                {link.name}
              </a>
            ))}
        </div>
      </nav>

      {/* VIEW LOGIC */}
      {currentView === 'home' ? (
        <>
          {/* Hero Section */}
          <section id="home" className="relative min-h-screen flex items-center pt-20 overflow-hidden" ref={heroRef}>
            <div className="absolute inset-0 z-0 bg-ink">
              <motion.img src={`agm.jpg`} alt="Kerala Boat Race" style={{ y: heroImageY }} className="absolute inset-0 w-full h-full object-cover opacity-50 scale-110" />
              <div className="absolute inset-0 bg-gradient-to-t from-ink via-ink/70 to-ink/30"></div>
              <div className="absolute inset-0 bg-gradient-to-r from-ink/60 via-transparent to-backwater/30"></div>
            </div>
            <div className="container mx-auto px-4 md:px-6 relative z-20 text-center md:text-left">
              <motion.div
                className="md:w-2/3 lg:w-1/2 mx-auto md:mx-0"
                variants={staggerContainerVariants}
                initial="hidden"
                animate="visible"
              >
                <motion.span variants={staggerItemVariants} className="inline-block py-1.5 px-4 rounded-full border border-gold/50 text-gold-light text-xs font-medium tracking-wide mb-7 backdrop-blur-sm">Est. 1966</motion.span>
                <h1 className="text-4xl md:text-5xl lg:text-6xl font-display font-extrabold text-ivory leading-[1.08] mb-6 tracking-tight">
                  <motion.span variants={staggerItemVariants} className="block">A little piece of Kerala</motion.span>
                  <motion.span variants={staggerItemVariants} className="block">in the heart of Odisha</motion.span>
                </h1>
                <motion.p variants={staggerItemVariants} className="text-lg md:text-xl text-ivory/75 mb-10 leading-relaxed max-w-lg mx-auto md:mx-0">
                  The foremost Malayali cultural and social organization in Bhubaneswar — preserving our heritage and fostering cultural integration since 1966.
                </motion.p>
                <motion.div variants={staggerItemVariants} className="flex flex-col sm:flex-row gap-4 justify-center md:justify-start">
                  <button onClick={handleMembershipClick} className="bg-gold hover:bg-gold-dark text-ink px-8 py-4 rounded-full font-display font-bold text-base transition-colors">
                    Become a member
                  </button>
                  <button onClick={(e) => handleNavigation(e, '#events')} className="text-ivory border border-ivory/30 hover:border-ivory/60 px-8 py-4 rounded-full font-display font-semibold text-base transition-colors">
                    Explore events
                  </button>
                </motion.div>
              </motion.div>
            </div>
          </section>

          {/* About Section */}
          <section className="py-24 md:py-36 relative overflow-hidden">
            <MuralLineArt className="hidden lg:block absolute top-10 right-8 w-28 h-36 opacity-70" />
            <div id="about" className="container mx-auto px-4 md:px-6 scroll-mt-24">
              <div className="flex flex-col lg:flex-row gap-16 lg:gap-24 items-center">
                <div className="lg:w-1/2 relative w-full">
                  <div className="absolute -top-4 -left-4 w-full h-full border border-gold/40 rounded-2xl hidden sm:block" aria-hidden="true"></div>
                  <div className="grid grid-cols-2 gap-4 relative">
                    <motion.img
                      src={`kathakali.jpg`} alt="Kathakali"
                      className="rounded-2xl shadow-lg w-full h-40 md:h-64 object-cover"
                      loading="lazy"
                      initial={{ opacity: 0, y: 10, scale: 0.95 }}
                      whileInView={{ opacity: 1, y: 32, scale: 1 }}
                      viewport={{ once: true, amount: 0.4 }}
                      transition={{ duration: 0.9, ease: EASE }}
                    />
                    <motion.img
                      src={`onam sadya.jpg`} alt="Onam Sadhya"
                      className="rounded-2xl shadow-lg w-full h-40 md:h-64 object-cover"
                      loading="lazy"
                      initial={{ opacity: 0, y: 10, scale: 0.95 }}
                      whileInView={{ opacity: 1, y: 0, scale: 1 }}
                      viewport={{ once: true, amount: 0.4 }}
                      transition={{ duration: 0.9, delay: 0.15, ease: EASE }}
                    />
                  </div>
                </div>
                <Reveal className="lg:w-1/2">
                  <p className="font-accent italic text-xl text-gold-dark mb-3">About the society</p>
                  <h2 className="text-3xl md:text-4xl font-display font-bold text-ink mb-6 leading-tight">Unity in diversity, rooted in tradition</h2>
                  <div className="space-y-6 text-ink/70 leading-relaxed max-w-md">
                    <p>To bring the Malayali families in Bhubaneswar closer, a few visionary members of the community established the <span className="font-semibold text-ink">Kerala Kala Samiti in 1966</span>.</p>
                    <p>Our mission is to integrate and uphold the rich culture of Kerala while linking with the great culture of Odisha. We act impartially, without influence from political or religious groups.</p>
                  </div>
                </Reveal>
              </div>
            </div>
          </section>

          {/* Mission Section */}
          <section className="py-24 bg-ink text-ivory">
            <div id="mission" className="container mx-auto px-4 md:px-6 scroll-mt-24">
               <Reveal className="max-w-2xl mb-10">
                <p className="font-accent italic text-xl text-gold-light mb-3">Why we exist</p>
                <h2 className="text-3xl md:text-4xl font-display font-bold mb-4">What guides us</h2>
                <p className="text-ivory/60">Guided by principles of dignity, integrity, and cultural pride, we strive to build a stronger community.</p>
               </Reveal>
               <Stagger className="grid md:grid-cols-2 md:gap-x-16 border-t border-ivory/10">
                 {[
                    { icon: HandHeart, title: "Dignity & welfare", desc: "To promote India's dignity and integrity in terms of social life. We focus on social welfare initiatives that uplift our members and the surrounding community." },
                    { icon: Landmark, title: "Cultural integration", desc: "To link the rich culture of Kerala with the great culture of Odisha. We facilitate a cultural exchange that honors both traditions." },
                    { icon: Scale, title: "Impartiality", desc: "To act impartially without political or religious influence. We give extreme consideration to the welfare of society as a whole." },
                    { icon: Users, title: "Community support", desc: "To help needy Malayalis in Bhubaneswar and serve as a link to the Oriya community in Kerala. We perform charity irrespective of caste or creed." },
                    { icon: Sprout, title: "Future generations", desc: "To connect with the next generation, transmitting Kerala's rich culture and heritage through Malayalam classes and youth activities." },
                    { icon: CalendarIcon, title: "Regular activities", desc: "To organize cultural programs, picnics, medical camps, and sports, and to celebrate major festivals that foster friendship and goodwill." },
                 ].map((item, i) => (
                   <StaggerItem key={item.title} className={`flex gap-5 py-8 border-b border-ivory/10 ${i % 2 === 0 ? 'md:pr-10' : 'md:pl-10'}`}>
                      <item.icon size={22} className="text-gold-light shrink-0 mt-1" />
                      <div>
                        <h3 className="text-lg font-display font-semibold text-ivory mb-2">{item.title}</h3>
                        <p className="text-ivory/55 text-sm leading-relaxed">{item.desc}</p>
                      </div>
                   </StaggerItem>
                 ))}
               </Stagger>
            </div>
          </section>

          {/* Cultural Link Section */}
          <section className="relative bg-backwater py-0">
            <div className="grid md:grid-cols-2 h-auto md:h-[600px] relative">
              <motion.div
                className="relative group overflow-hidden h-96 md:h-full"
                initial={{ opacity: 0, x: -40 }}
                whileInView={{ opacity: 1, x: 0 }}
                viewport={{ once: true, amount: 0.3 }}
                transition={{ duration: 0.9, ease: EASE }}
              >
                <img src="kerala-backwaters.jpg" alt="Kerala Backwaters" className="w-full h-full object-cover transition-transform duration-1000 group-hover:scale-105" loading="lazy" />
                <div className="absolute inset-0 bg-ink/40 group-hover:bg-ink/25 transition-colors flex flex-col justify-center items-center text-center p-8">
                  <h3 className="text-4xl md:text-5xl font-display font-bold text-ivory mb-2 tracking-wide">Kerala</h3>
                  <p className="text-gold-light font-medium uppercase tracking-widest text-sm">God's Own Country</p>
                </div>
              </motion.div>
              <motion.div
                className="relative group overflow-hidden h-96 md:h-full bg-ink"
                initial={{ opacity: 0, x: 40 }}
                whileInView={{ opacity: 1, x: 0 }}
                viewport={{ once: true, amount: 0.3 }}
                transition={{ duration: 0.9, ease: EASE }}
              >
                <img src="1-rajarani-temple-bhubaneshwar-odisha-2-state-hero.jpg" alt="Odisha Konark Temple" className="w-full h-full object-cover transition-transform duration-1000 group-hover:scale-105" onError={(e) => { if (e.target.src !== "https://upload.wikimedia.org/wikipedia/commons/thumb/4/47/Konark_Sun_Temple_-_Odisha.jpg/800px-Konark_Sun_Temple_-_Odisha.jpg") { e.target.src = "https://upload.wikimedia.org/wikipedia/commons/thumb/4/47/Konark_Sun_Temple_-_Odisha.jpg/800px-Konark_Sun_Temple_-_Odisha.jpg"; } }} />
                <div className="absolute inset-0 bg-ink/40 group-hover:bg-ink/25 transition-colors flex flex-col justify-center items-center text-center p-8">
                  <h3 className="text-4xl md:text-5xl font-display font-bold text-ivory mb-2 tracking-wide">Odisha</h3>
                  <p className="text-gold-light font-medium uppercase tracking-widest text-sm">The Soul of India</p>
                </div>
              </motion.div>

              <motion.div
                className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 z-40 w-32 h-32 md:w-44 md:h-44 bg-ivory/10 backdrop-blur-md rounded-full border border-gold/50 flex items-center justify-center p-4 text-center shadow-2xl"
                initial={{ opacity: 0, scale: 0.7 }}
                whileInView={{ opacity: 1, scale: 1 }}
                viewport={{ once: true, amount: 0.5 }}
                transition={{ duration: 0.6, delay: 0.5, ease: EASE }}
              >
                <div className="bg-ink rounded-full w-full h-full flex items-center justify-center border border-gold/60">
                  <div className="text-ivory">
                    <p className="text-xs uppercase font-semibold text-gold-light mb-1 tracking-widest">Bridging</p>
                    <span className="font-accent italic text-2xl md:text-3xl">&amp;</span>
                    <p className="text-xs uppercase font-semibold text-gold-light mt-1 tracking-widest">Cultures</p>
                  </div>
                </div>
              </motion.div>
            </div>
          </section>

          {/* EVENTS & CALENDAR SECTION */}
          <section className="relative py-24 overflow-hidden bg-cream border-y border-gold/15">
            <div id="events" className="container mx-auto px-4 md:px-6 relative z-10 scroll-mt-24">
              <Reveal className="max-w-2xl mb-10">
                <p className="font-accent italic text-xl text-gold-dark mb-3">What's happening</p>
                <h2 className="text-3xl md:text-4xl font-display font-bold text-ink">Latest news &amp; events</h2>
              </Reveal>
              <div className="grid grid-cols-1 lg:grid-cols-[380px_1fr] gap-6 items-start">
                <div className="flex flex-col items-center w-full">
                  <h3 className="text-xl font-display font-semibold text-ink mb-4 flex items-center gap-2 self-start">
                    <Facebook size={20} className="text-backwater" /> Community feed
                  </h3>
                  <div ref={fbFeedRef} className="w-full max-w-[375px] bg-white rounded-xl overflow-hidden border border-gold/20 shadow-sm" style={{ minHeight: 800 }}>
                    {fbFeedVisible ? (
                      <iframe
                        src={`https://www.facebook.com/plugins/page.php?href=${encodedFbUrl}&tabs=timeline&width=375&height=800&small_header=false&adapt_container_width=true&hide_cover=false&show_facepile=true&appId`}
                        width="100%"
                        height="800"
                        style={{border:'none', overflow:'hidden', maxWidth: '100%'}}
                        scrolling="no"
                        frameBorder="0"
                        allowFullScreen={true}
                        title="Facebook Timeline Feed"
                        loading="lazy"
                      ></iframe>
                    ) : (
                      <div className="flex items-center justify-center h-[800px] text-ink/30 text-sm animate-pulse">Loading community feed…</div>
                    )}
                  </div>
                </div>
                <div className="flex flex-col items-center w-full h-full">
                  <h3 className="text-xl font-display font-semibold text-ink mb-4 flex items-center gap-2 self-start">
                    <CalendarIcon size={20} className="text-gold-dark" /> Malayalam calendar
                  </h3>
                  <div className="w-full bg-white border border-gold/15 shadow-sm rounded-3xl overflow-hidden h-full flex flex-col">
                    <div className="bg-backwater text-ivory p-6 flex justify-between items-center">
                      <button onClick={() => changeMonth(-1)} className="p-2 hover:bg-backwater-light rounded-full transition-colors" aria-label="Previous month"><ChevronLeft /></button>
                      <div className="text-center">
                        <h2 className="text-2xl font-display font-bold">{currentDate.toLocaleString('default', { month: 'long' })}</h2>
                        <p className="text-ivory/60">{currentDate.getFullYear()}</p>
                      </div>
                      <button onClick={() => changeMonth(1)} className="p-2 hover:bg-backwater-light rounded-full transition-colors" aria-label="Next month"><ChevronRight /></button>
                    </div>
                    <p className="text-xs text-ink/50 flex items-center gap-1.5 px-4 py-2 bg-gold/10 border-b border-gold/15">
                      <Info size={13} className="shrink-0" /> Dates and festival days are approximate (calculated locally) — please confirm important dates with an authoritative Panchangam.
                    </p>
                    <div className="p-4 bg-cream flex-grow">
                       <div className="grid grid-cols-7 mb-2 text-center text-xs font-semibold text-backwater uppercase tracking-widest">
                          {WEEKDAYS.map(d => <div key={d}>{d}</div>)}
                       </div>
                       <div className="grid grid-cols-7 gap-1 bg-gold/10 border border-gold/10 h-full min-h-[400px]">
                          {calendarData.map((data, idx) => {
                            const today = isToday(data.date);
                            const hasMajor = data.events.some(e => e.type === 'major');
                            const firstEvent = data.events.length > 0 ? data.events[0].name : null;

                            return (
                              <div
                                key={idx}
                                onClick={() => setSelectedDay(data)}
                                role="button"
                                tabIndex={0}
                                aria-label={`${data.date.toDateString()}${firstEvent ? `, ${firstEvent}` : ''}`}
                                onKeyDown={(e) => { if (e.key === 'Enter' || e.key === ' ') { e.preventDefault(); setSelectedDay(data); } }}
                                className={`min-h-[80px] p-1 bg-white cursor-pointer hover:bg-gold/5 transition-colors flex flex-col justify-between ${!data.isCurrentMonth ? 'text-ink/20' : ''} ${today ? 'bg-gold/10 ring-1 ring-gold z-10' : ''} ${hasMajor && data.isCurrentMonth ? 'bg-gold/5' : ''}`}
                              >
                                <div className="flex justify-between items-start">
                                  <span className={`text-sm font-bold ${today ? 'text-gold-dark' : 'text-ink/70'}`}>{data.date.getDate()}</span>
                                  {data.panchang && (
                                    <div className="flex flex-col items-end">
                                      <span className="text-[9px] font-semibold text-backwater leading-tight">
                                        {data.panchang.solar.month.en.substring(0,3)} {data.panchang.solar.day}
                                      </span>
                                      <span className="text-[8px] text-ink/30 leading-tight hidden sm:block">
                                        {data.panchang.nakshatraName.en}
                                      </span>
                                    </div>
                                  )}
                                </div>
                                <div className="mt-1">
                                  {firstEvent && (
                                    <div className={`text-[9px] sm:text-[10px] font-semibold truncate leading-tight rounded px-1 py-0.5 ${hasMajor ? 'bg-gold/20 text-gold-dark' : 'bg-backwater/10 text-backwater'}`}>
                                      {firstEvent}
                                    </div>
                                  )}
                                  {!firstEvent && (
                                    <div className="flex gap-0.5 mt-1">
                                      {data.events.map((e, i) => (
                                        <div key={i} className={`w-1.5 h-1.5 rounded-full ${e.type === 'major' ? 'bg-gold' : 'bg-backwater'}`}></div>
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
          <section className="py-24 bg-cream">
            <div id="gallery" className="container mx-auto px-4 md:px-6 scroll-mt-24">
               <Reveal className="flex flex-col md:flex-row justify-between items-start md:items-end mb-10">
                 <div className="text-left mb-6 md:mb-0">
                  <p className="font-accent italic text-xl text-gold-dark mb-3">Our memories</p>
                  <h2 className="text-3xl font-display font-bold text-ink">Life at Kala Samiti</h2>
                 </div>
                 <button onClick={() => { setCurrentView('gallery'); window.scrollTo({ top: 0, behavior: "smooth" }); }} className="hidden md:flex items-center gap-2 px-6 py-2.5 border border-ink/20 hover:border-gold rounded-full text-sm font-medium transition-colors"><ImageIcon size={16} /> View all photos</button>
               </Reveal>
               <Stagger className="grid grid-cols-2 md:grid-cols-4 gap-4">
                  {fullGalleryImages.slice(0, 9).map((img, index) => (
                    <StaggerItem
                      key={img.id}
                      className={`relative rounded-2xl overflow-hidden group shadow-sm cursor-pointer ${index === 0 ? 'col-span-2 row-span-2' : 'col-span-1 row-span-1 aspect-video'}`}
                      onClick={() => setSelectedImageIndex(index)}
                      role="button"
                      tabIndex={0}
                      aria-label={`View ${img.alt}`}
                      onKeyDown={(e) => { if (e.key === 'Enter' || e.key === ' ') { e.preventDefault(); setSelectedImageIndex(index); } }}
                    >
                      <img src={img.src} className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-105" alt={img.alt} loading={index === 0 ? undefined : 'lazy'} />
                    </StaggerItem>
                  ))}
               </Stagger>
               <div className="mt-8 text-center md:hidden">
                 <button onClick={() => { setCurrentView('gallery'); window.scrollTo({ top: 0, behavior: "smooth" }); }} className="bg-ink text-ivory px-8 py-3 rounded-full font-semibold">View all photos</button>
               </div>
            </div>
          </section>

          {/* Membership Banner */}
          <section className="py-24 bg-backwater text-ivory relative overflow-hidden">
             <div className="absolute inset-0 opacity-[0.07]" style={{ backgroundImage: 'radial-gradient(#C89A42 1px, transparent 1px)', backgroundSize: '28px 28px' }}></div>
             <HouseboatCrossing />
             <Reveal id="membership" className="container mx-auto px-4 md:px-6 relative z-10 text-center scroll-mt-24">
               <h2 className="text-3xl md:text-5xl font-display font-bold mb-8">Become a part of our family</h2>
               <button onClick={handleMembershipClick} className="bg-gold hover:bg-gold-dark text-ink px-8 py-3.5 rounded-full font-display font-bold inline-flex items-center gap-2 transition-colors"><FileDown size={20} /> Apply for membership</button>
             </Reveal>
          </section>
        </>
      ) : (
        /* Full Gallery Page */
        <section className="min-h-screen bg-cream pt-28 pb-20">
          <div className="container mx-auto px-4 md:px-6">
            <div className="flex items-center gap-4 mb-10">
              <button onClick={() => setCurrentView('home')} className="w-12 h-12 rounded-full bg-white border border-gold/20 shadow-sm flex items-center justify-center hover:border-gold text-ink" aria-label="Back to home"><ArrowLeft size={22} /></button>
              <div><p className="font-accent italic text-gold-dark mb-0.5">Gallery</p><h2 className="text-3xl font-display font-bold text-ink">All memories ({fullGalleryImages.length})</h2></div>
            </div>
            <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-5 gap-4">
               {fullGalleryImages.map((img, index) => (
                 <div
                   key={img.id}
                   className="relative aspect-square rounded-xl overflow-hidden group shadow-sm hover:shadow-md cursor-pointer"
                   onClick={() => setSelectedImageIndex(index)}
                   role="button"
                   tabIndex={0}
                   aria-label={`View ${img.alt}`}
                   onKeyDown={(e) => { if (e.key === 'Enter' || e.key === ' ') { e.preventDefault(); setSelectedImageIndex(index); } }}
                 >
                   <img src={img.src} alt={img.alt} className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-110" loading="lazy" />
                 </div>
               ))}
            </div>
          </div>
        </section>
      )}

      {/* Footer */}
      <footer className="bg-ink text-ivory/60 py-16">
         <div id="contact" className="container mx-auto px-4 md:px-6 scroll-mt-24">
          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-12 border-b border-ivory/10 pb-12">
            <div>
               <div className="flex items-center gap-3 mb-6">
                <div className="w-10 h-10 rounded-full overflow-hidden border border-gold/50 bg-cream shrink-0"><img src={logoImage} alt="KKS Logo" className="w-full h-full object-cover"/></div>
                <span className="text-xl font-display font-bold text-ivory">KKS Bhubaneswar</span>
                <svg width="10" height="16" viewBox="0 0 10 16" fill="none" className="flame-flicker" aria-hidden="true">
                  <path d="M5 0C5 5 1 6 1 10C1 13 3 16 5 16C7 16 9 13 9 10C9 6 5 5 5 0Z" fill="#C89A42" opacity="0.9" />
                </svg>
              </div>
              <p className="mb-6 text-sm leading-relaxed">A non-profit, cultural organization contributing to cultural integration and social service in Odisha since 1966.</p>
              <div className="flex gap-4">
                <a href="https://www.facebook.com/keralakalasamitibbsr" className="w-10 h-10 rounded-full bg-ivory/10 flex items-center justify-center hover:bg-gold hover:text-ink transition-colors"><Facebook size={18} /></a>
                <a href="https://www.instagram.com/keralakalasamiti/" className="w-10 h-10 rounded-full bg-ivory/10 flex items-center justify-center hover:bg-gold hover:text-ink transition-colors"><Instagram size={18} /></a>
              </div>
            </div>
            <div>
              <h3 className="text-ivory font-display font-semibold mb-6">Quick links</h3>
              <ul className="space-y-3 text-sm">
                <li><a href="#home" onClick={(e) => handleNavigation(e, '#home')} className="hover:text-gold-light transition-colors cursor-pointer">Our history</a></li>
                <li><a href="#" className="hover:text-gold-light transition-colors">Executive committee</a></li>
                <li><a href="#" className="hover:text-gold-light transition-colors">Life members list</a></li>
                <li><a href="#events" onClick={(e) => handleNavigation(e, '#events')} className="hover:text-gold-light transition-colors cursor-pointer">News &amp; circulars</a></li>
              </ul>
            </div>
            <div>
              <h3 className="text-ivory font-display font-semibold mb-6">Contact us</h3>
              <ul className="space-y-4 text-sm">
                <li className="flex items-start gap-3"><MapPin size={18} className="text-gold-light mt-1 shrink-0" /><span>Kerala Kala Samiti Hall,<br />Unit-4, Bhubaneswar,<br />Odisha - 751001</span></li>
                <li className="flex items-center gap-3"><PhoneCallIcon size={18} className="text-gold-light shrink-0" /><span>+91 98275 75106</span></li>
                <li className="flex items-center gap-3"><Mail size={18} className="text-gold-light shrink-0" /><span>secretarykksbbsr@gmail.com</span></li>
              </ul>
            </div>
          </div>
          <div className="pt-8 text-center text-xs text-ivory/35 flex flex-col md:flex-row justify-between items-center gap-4">
            <p>&copy; 2025 Kerala Kala Samiti, Bhubaneswar. All rights reserved.</p>
            <p className="font-accent italic">Designed with respect for tradition.</p>
          </div>
        </div>
      </footer>

      {/* Modals: Membership & Calendar Details */}
      {showMembershipModal && (
        <div
          className="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-ink/60 backdrop-blur-sm animate-fade-in"
          onClick={() => setShowMembershipModal(false)}
          role="presentation"
        >
           <div
             className="bg-cream rounded-2xl shadow-2xl p-8 max-w-md w-full relative animate-scale-in font-body"
             onClick={(e) => e.stopPropagation()}
             role="dialog"
             aria-modal="true"
             aria-label="Membership form downloaded"
           >
             <button onClick={() => setShowMembershipModal(false)} className="absolute top-4 right-4 text-ink/40 hover:text-ink transition-colors"><X size={22} /></button>
             <div className="flex flex-col items-center text-center">
               <div className="w-16 h-16 bg-backwater/10 text-backwater rounded-full flex items-center justify-center mb-6"><CheckCircle size={30} /></div>
               <h3 className="text-2xl font-display font-bold text-ink mb-2">Form downloaded</h3>
               <p className="text-ink/60 mb-6 leading-relaxed">Please print and fill out the form. <br/><span className="font-semibold text-ink">Submit the filled up form to any association member.</span></p>
               <button onClick={() => setShowMembershipModal(false)} className="bg-ink hover:bg-backwater text-ivory font-semibold py-3 px-8 rounded-full w-full transition-colors">Okay, got it</button>
             </div>
           </div>
        </div>
      )}

      {/* Calendar Details Modal */}
      <CalendarModal isOpen={!!selectedDay} onClose={() => setSelectedDay(null)} data={selectedDay} />

      {/* Lightbox Slider */}
      {selectedImageIndex !== null && (
        <div className="fixed inset-0 z-[110] flex items-center justify-center bg-ink/95 backdrop-blur-md animate-fade-in" onClick={() => setSelectedImageIndex(null)}>
          <button onClick={() => setSelectedImageIndex(null)} className="absolute top-4 right-4 text-ivory/70 hover:text-ivory transition-colors p-2 z-[120]" aria-label="Close"><X size={30} /></button>
          <button onClick={handlePrevImage} className="absolute left-4 top-1/2 -translate-y-1/2 text-ivory/70 hover:text-ivory bg-ivory/10 hover:bg-ivory/20 rounded-full p-2 transition-colors z-[120]" aria-label="Previous image"><ChevronLeft size={36} /></button>
          <div className="relative max-h-[90vh] max-w-[90vw]" onClick={(e) => e.stopPropagation()}>
            <img key={selectedImageIndex} src={fullGalleryImages[selectedImageIndex].src} className="max-h-[90vh] max-w-[90vw] object-contain rounded-lg shadow-2xl animate-scale-in" alt={fullGalleryImages[selectedImageIndex].alt} />
          </div>
          <button onClick={handleNextImage} className="absolute right-4 top-1/2 -translate-y-1/2 text-ivory/70 hover:text-ivory bg-ivory/10 hover:bg-ivory/20 rounded-full p-2 transition-colors z-[120]" aria-label="Next image"><ChevronRight size={36} /></button>
        </div>
      )}

    </div>
    </MotionConfig>
  );
};

export default App;
