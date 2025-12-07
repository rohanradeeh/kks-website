import React, { useState, useEffect } from 'react';
import { Menu, X, Calendar, MapPin, Users, Heart, ArrowRight, Mail, Phone, Facebook, Instagram, Twitter, ExternalLink, Image as ImageIcon, Scale, HandHeart, Sprout, Landmark, FileDown, CheckCircle, ArrowLeft, PhoneCall as PhoneCallIcon, ChevronLeft, ChevronRight } from 'lucide-react';

const App = () => {
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const [scrolled, setScrolled] = useState(false);
  const [showMembershipModal, setShowMembershipModal] = useState(false);
  const [selectedImageIndex, setSelectedImageIndex] = useState(null); 
  const [currentView, setCurrentView] = useState('home'); 

  // ---------------------------------------------------------------------------
  // CONFIGURATION
  // ---------------------------------------------------------------------------
  const facebookPageUrl = "https://www.facebook.com/keralakalasamitibbsr/"; 
  const encodedFbUrl = encodeURIComponent(facebookPageUrl);
  
  // Base URL for relative paths 
  const baseUrl = "./";

  // ---------------------------------------------------------------------------
  // GALLERY CONFIGURATION
  // ---------------------------------------------------------------------------
  const fullGalleryImages = Array.from({ length: 50 }, (_, i) => ({
    id: i,
    src: '${baseUrl}gallery/${i + 1}.jpg', 
    alt: 'Gallery Image ${i + 1}'
  }));

  // Handle scroll effect for navbar
  useEffect(() => {
    const handleScroll = () => {
      setScrolled(window.scrollY > 50);
    };
    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  // Handle Keyboard Navigation for Slider
  useEffect(() => {
    const handleKeyDown = (e) => {
      if (selectedImageIndex === null) return;
      
      if (e.key === 'ArrowRight') {
        handleNextImage(e);
      } else if (e.key === 'ArrowLeft') {
        handlePrevImage(e);
      } else if (e.key === 'Escape') {
        setSelectedImageIndex(null);
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [selectedImageIndex]);

  const toggleMenu = () => setIsMenuOpen(!isMenuOpen);

  const handleNavigation = (e, href) => {
    e.preventDefault();
    if (currentView === 'gallery') {
      setCurrentView('home');
      setTimeout(() => {
        const element = document.querySelector(href);
        if (element) {
          const headerOffset = 80;
          const elementPosition = element.getBoundingClientRect().top;
          const offsetPosition = elementPosition + window.scrollY - headerOffset;
          window.scrollTo({ top: offsetPosition, behavior: "smooth" });
        }
      }, 100);
    } else {
      const element = document.querySelector(href);
      if (element) {
        const headerOffset = 80; 
        const elementPosition = element.getBoundingClientRect().top;
        const offsetPosition = elementPosition + window.scrollY - headerOffset;
        window.scrollTo({ top: offsetPosition, behavior: "smooth" });
      }
    }
    setIsMenuOpen(false);
  };

  const handleMembershipClick = () => {
    const link = document.createElement('a');
    link.href = "KKS_MEMBERSHIP_FORM.pdf"; 
    link.download = 'KKS_MEMBERSHIP_FORM.pdf';
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    setShowMembershipModal(true);
  };

  // Slider Navigation Handlers
  const handleNextImage = (e) => {
    if (e) e.stopPropagation();
    setSelectedImageIndex((prev) => (prev + 1) % fullGalleryImages.length);
  };

  const handlePrevImage = (e) => {
    if (e) e.stopPropagation();
    setSelectedImageIndex((prev) => (prev - 1 + fullGalleryImages.length) % fullGalleryImages.length);
  };

  const navLinks = [
    { name: 'Home', href: '#home' },
    { name: 'About Us', href: '#about' },
    { name: 'Mission', href: '#mission' }, 
    { name: 'Events', href: '#events' },
    { name: 'Gallery', href: '#gallery' },
    { name: 'Membership', href: '#membership' },
    { name: 'Contact', href: '#contact' },
  ];

  return (
    <div className="font-sans text-gray-800 bg-stone-50 selection:bg-amber-200 selection:text-amber-900 w-full max-w-[100vw] overflow-x-hidden min-h-screen flex flex-col">
      
      {/* CUSTOM CSS ANIMATIONS (No external import needed) */}
      <style>{`
        @keyframes fadeIn {
          from { opacity: 0; }
          to { opacity: 1; }
        }
        @keyframes scaleIn {
          from { transform: scale(0.95); opacity: 0; }
          to { transform: scale(1); opacity: 1; }
        }
        /* Class for the Modal Background */
        .animate-fade-in {
          animation: fadeIn 0.5s ease-out forwards;
        }
        /* Class for the Image Switch */
        .animate-scale-in {
          animation: scaleIn 0.7s ease-out forwards;
        }
      `}</style>

      {/* Navigation */}
      <nav className={`fixed w-full z-50 transition-all duration-300 ${scrolled ? 'bg-white/95 backdrop-blur-sm shadow-md py-3' : 'bg-transparent py-5'}`}>
        <div className="container mx-auto px-4 md:px-8 flex justify-between items-center">
          <div className="flex items-center gap-3 cursor-pointer" onClick={(e) => handleNavigation(e, '#home')}>
            <div className="w-10 h-10 md:w-12 md:h-12 rounded-full overflow-hidden border-2 border-amber-400 shadow-lg bg-white shrink-0">
              <img 
                src={'KeralaKalaSamitiLogo.jpg'} 
                alt="KKS Logo" 
                className="w-full h-full object-cover"
                onError={(e) => {
                  e.target.onerror = null; 
                  e.target.style.display = 'none';
                  e.target.parentNode.classList.add('bg-emerald-700', 'flex', 'items-center', 'justify-center');
                  e.target.parentNode.innerHTML = '<span class="text-amber-100 font-bold text-xl">K</span>';
                }}
              />
            </div>
            <div className={`text-lg md:text-2xl font-serif font-bold tracking-tight ${scrolled ? 'text-emerald-900' : 'text-white'}`}>
              KKS <span className="hidden sm:inline font-sans font-normal opacity-90">Bhubaneswar</span>
            </div>
          </div>

          <div className="hidden lg:flex gap-8 items-center">
            {navLinks.map((link) => (
              <a 
                key={link.name} 
                href={link.href}
                onClick={(e) => handleNavigation(e, link.href)}
                className={`text-sm font-medium tracking-wide uppercase transition-colors hover:text-amber-500 cursor-pointer whitespace-nowrap ${scrolled ? 'text-gray-700' : 'text-stone-100'}`}
              >
                {link.name}
              </a>
            ))}
            <button 
              onClick={(e) => handleNavigation(e, '#membership')}
              className="bg-amber-500 hover:bg-amber-600 text-white px-5 py-2 rounded-full font-semibold text-sm transition-all shadow-lg hover:shadow-xl whitespace-nowrap"
            >
              Join Now
            </button>
          </div>

          <button onClick={toggleMenu} className={`lg:hidden ${scrolled ? 'text-gray-800' : 'text-white'} p-2`}>
            {isMenuOpen ? <X size={28} /> : <Menu size={28} />}
          </button>
        </div>

        {/* Mobile Menu Dropdown with smooth transition */}
        <div 
          className={`lg:hidden absolute top-full left-0 w-full bg-white shadow-xl border-t border-gray-100 flex flex-col items-center gap-4 overflow-hidden transition-all duration-300 ease-in-out ${
            isMenuOpen ? 'max-h-96 opacity-100 py-4' : 'max-h-0 opacity-0 py-0'
          }`}
        >
            {navLinks.map((link) => (
              <a 
                key={link.name} 
                href={link.href} 
                onClick={(e) => handleNavigation(e, link.href)}
                className="text-gray-700 font-medium text-lg hover:text-emerald-700 cursor-pointer whitespace-nowrap"
              >
                {link.name}
              </a>
            ))}
            <button 
              onClick={(e) => handleNavigation(e, '#membership')}
              className="bg-emerald-700 text-white px-8 py-2 rounded-full mt-2 whitespace-nowrap"
            >
              Join Now
            </button>
        </div>
      </nav>

      {/* VIEW LOGIC */}
      {currentView === 'home' ? (
        <>
          {/* Hero Section */}
          <section id="home" className="relative min-h-screen flex items-center pt-20 overflow-hidden">
            <div className="absolute inset-0 z-0 bg-emerald-900">
              <div className="absolute inset-0 bg-gradient-to-r from-emerald-900/90 to-emerald-800/80 z-10"></div>
              <div className="absolute top-[-10%] right-[-5%] w-[500px] h-[500px] rounded-full bg-amber-400/20 blur-3xl"></div>
              <div className="absolute bottom-[-10%] left-[-10%] w-[600px] h-[600px] rounded-full bg-teal-500/20 blur-3xl"></div>
              <img 
                src={'event1.jpg'} 
                alt="Kerala Boat Race" 
                className="absolute inset-0 w-full h-full object-cover mix-blend-overlay opacity-40"
              />
            </div>

            <div className="container mx-auto px-4 md:px-6 relative z-20 text-center md:text-left">
              <div className="md:w-2/3 lg:w-1/2">
                <span className="inline-block py-1 px-3 rounded-full bg-amber-500/20 text-amber-300 border border-amber-500/50 text-xs font-bold tracking-widest uppercase mb-6 backdrop-blur-sm">
                  Est. 1966
                </span>
                <h1 className="text-4xl md:text-5xl lg:text-7xl font-serif font-bold text-white leading-tight mb-6">
                  A Little Piece of <span className="text-amber-400 italic">Kerala</span> in Odisha
                </h1>
                <p className="text-lg md:text-xl text-stone-200 mb-8 leading-relaxed">
                  We are the foremost Malayali Cultural and Social Organization in Bhubaneswar, dedicated to preserving our heritage and fostering cultural integration since 1966.
                </p>
                <div className="flex flex-col sm:flex-row gap-4 justify-center md:justify-start">
                  <button 
                    onClick={handleMembershipClick}
                    className="bg-amber-500 hover:bg-amber-600 text-white px-8 py-4 rounded-lg font-bold text-lg transition-all shadow-lg hover:shadow-amber-500/30 flex items-center justify-center gap-2 group"
                  >
                    Become a Member <ArrowRight className="group-hover:translate-x-1 transition-transform" size={20} />
                  </button>
                  <button 
                    onClick={(e) => handleNavigation(e, '#events')}
                    className="bg-white/10 hover:bg-white/20 backdrop-blur-md text-white border border-white/30 px-8 py-4 rounded-lg font-bold text-lg transition-all flex items-center justify-center gap-2"
                  >
                    Explore Events
                  </button>
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
                    <img 
                      src={'kathakali.jpg'} 
                      alt="Kathakali" 
                      className="rounded-2xl shadow-xl w-full h-40 md:h-64 object-cover transform translate-y-8" 
                    />
                    <img 
                      src={'Onam celebration.jpg'} 
                      alt="Onam Sadhya" 
                      className="rounded-2xl shadow-xl w-full h-40 md:h-64 object-cover" 
                    />
                  </div>
                  <div className="absolute -z-10 top-0 left-0 w-full h-full bg-amber-100 rounded-full blur-3xl opacity-50 transform scale-150"></div>
                </div>

                <div className="lg:w-1/2">
                  <h4 className="text-emerald-700 font-bold uppercase tracking-widest text-sm mb-2">About Our Society</h4>
                  <h2 className="text-3xl md:text-4xl font-serif font-bold text-gray-900 mb-6">Unity in Diversity, <br/> Rooted in Tradition.</h2>
                  <div className="space-y-6 text-gray-600 leading-relaxed">
                    <p>
                      To bring the Malayali families in Bhubaneswar closer, a few visionary members of the community established the <span className="font-semibold text-emerald-800">Kerala Kala Samiti in 1966</span>.
                    </p>
                    <p>
                      Our mission is to integrate and uphold the rich culture of Kerala while linking with the great culture of Odisha. We act impartially, without influence from political or religious groups, giving extreme consideration to the welfare of society as a whole.
                    </p>
                  </div>
                  <div className="grid grid-cols-2 gap-8 mt-10">
                    <div className="flex flex-col gap-2">
                      <div className="w-12 h-12 bg-emerald-100 rounded-lg flex items-center justify-center text-emerald-700 mb-2">
                        <Users size={24} />
                      </div>
                      <h3 className="font-bold text-xl text-gray-900">1000+</h3>
                      <p className="text-sm text-gray-500">Active Families</p>
                    </div>
                    <div className="flex flex-col gap-2">
                      <div className="w-12 h-12 bg-amber-100 rounded-lg flex items-center justify-center text-amber-600 mb-2">
                        <Heart size={24} />
                      </div>
                      <h3 className="font-bold text-xl text-gray-900">50+ Years</h3>
                      <p className="text-sm text-gray-500">Of Service</p>
                    </div>
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
                {/* Objective Cards */}
                <div className="bg-stone-50 p-8 rounded-2xl border border-stone-100 hover:border-emerald-200 hover:shadow-lg transition-all group">
                  <div className="w-12 h-12 bg-emerald-100 text-emerald-700 rounded-xl flex items-center justify-center mb-6 group-hover:bg-emerald-700 group-hover:text-white transition-colors">
                    <HandHeart size={24} />
                  </div>
                  <h3 className="text-xl font-bold text-gray-900 mb-3">Dignity & Welfare</h3>
                  <p className="text-gray-600 text-sm leading-relaxed">
                    To promote India's dignity and integrity in terms of social life. We focus on social welfare initiatives that uplift our members and the surrounding community.
                  </p>
                </div>
                <div className="bg-stone-50 p-8 rounded-2xl border border-stone-100 hover:border-emerald-200 hover:shadow-lg transition-all group">
                  <div className="w-12 h-12 bg-amber-100 text-amber-600 rounded-xl flex items-center justify-center mb-6 group-hover:bg-amber-600 group-hover:text-white transition-colors">
                    <Landmark size={24} />
                  </div>
                  <h3 className="text-xl font-bold text-gray-900 mb-3">Cultural Integration</h3>
                  <p className="text-gray-600 text-sm leading-relaxed">
                    To link the rich culture of Kerala with the great culture of Odisha. We facilitate a cultural exchange that honors both traditions.
                  </p>
                </div>
                <div className="bg-stone-50 p-8 rounded-2xl border border-stone-100 hover:border-emerald-200 hover:shadow-lg transition-all group">
                  <div className="w-12 h-12 bg-emerald-100 text-emerald-700 rounded-xl flex items-center justify-center mb-6 group-hover:bg-emerald-700 group-hover:text-white transition-colors">
                    <Scale size={24} />
                  </div>
                  <h3 className="text-xl font-bold text-gray-900 mb-3">Impartiality</h3>
                  <p className="text-gray-600 text-sm leading-relaxed">
                    To act impartially without political or religious influence. We give extreme consideration to the welfare of society as a whole.
                  </p>
                </div>
                <div className="bg-stone-50 p-8 rounded-2xl border border-stone-100 hover:border-emerald-200 hover:shadow-lg transition-all group">
                  <div className="w-12 h-12 bg-amber-100 text-amber-600 rounded-xl flex items-center justify-center mb-6 group-hover:bg-amber-600 group-hover:text-white transition-colors">
                    <Users size={24} />
                  </div>
                  <h3 className="text-xl font-bold text-gray-900 mb-3">Community Support</h3>
                  <p className="text-gray-600 text-sm leading-relaxed">
                    To help needy Malayalis in Bhubaneswar and serve as a link to the Oriya community in Kerala. We perform charity irrespective of caste or creed.
                  </p>
                </div>
                <div className="bg-stone-50 p-8 rounded-2xl border border-stone-100 hover:border-emerald-200 hover:shadow-lg transition-all group">
                  <div className="w-12 h-12 bg-emerald-100 text-emerald-700 rounded-xl flex items-center justify-center mb-6 group-hover:bg-emerald-700 group-hover:text-white transition-colors">
                    <Sprout size={24} />
                  </div>
                  <h3 className="text-xl font-bold text-gray-900 mb-3">Future Generations</h3>
                  <p className="text-gray-600 text-sm leading-relaxed">
                    To connect with the next generation, transforming Kerala's rich culture and heritage to them through Malayalam classes and youth activities.
                  </p>
                </div>
                <div className="bg-stone-50 p-8 rounded-2xl border border-stone-100 hover:border-emerald-200 hover:shadow-lg transition-all group">
                  <div className="w-12 h-12 bg-amber-100 text-amber-600 rounded-xl flex items-center justify-center mb-6 group-hover:bg-amber-600 group-hover:text-white transition-colors">
                    <Calendar size={24} />
                  </div>
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
              {/* Kerala Side */}
              <div className="relative group overflow-hidden h-96 md:h-full">
                <img 
                  src="https://images.unsplash.com/photo-1506461883276-594a12b11cf3?q=80&w=2000&auto=format&fit=crop" 
                  alt="Kerala Backwaters" 
                  className="w-full h-full object-cover transition-transform duration-1000 group-hover:scale-110"
                />
                <div className="absolute inset-0 bg-black/40 group-hover:bg-black/20 transition-colors flex flex-col justify-center items-center text-center p-8">
                  <h3 className="text-4xl md:text-5xl font-serif font-bold text-white mb-2 tracking-wide">Kerala</h3>
                  <p className="text-amber-300 font-medium uppercase tracking-widest text-sm">God's Own Country</p>
                </div>
              </div>
              {/* Odisha Side */}
              <div className="relative group overflow-hidden h-96 md:h-full bg-stone-900">
                <img 
                  src="1-rajarani-temple-bhubaneshwar-odisha-2-state-hero.jpg" 
                  alt="Odisha Konark Temple" 
                  className="w-full h-full object-cover transition-transform duration-1000 group-hover:scale-110"
                  onError={(e) => {
                    if (e.target.src !== "https://upload.wikimedia.org/wikipedia/commons/thumb/4/47/Konark_Sun_Temple_-_Odisha.jpg/800px-Konark_Sun_Temple_-_Odisha.jpg") {
                        e.target.src = "https://upload.wikimedia.org/wikipedia/commons/thumb/4/47/Konark_Sun_Temple_-_Odisha.jpg/800px-Konark_Sun_Temple_-_Odisha.jpg";
                    }
                  }}
                />
                <div className="absolute inset-0 bg-black/40 group-hover:bg-black/20 transition-colors flex flex-col justify-center items-center text-center p-8">
                  <h3 className="text-4xl md:text-5xl font-serif font-bold text-white mb-2 tracking-wide">Odisha</h3>
                  <p className="text-amber-300 font-medium uppercase tracking-widest text-sm">The Soul of India</p>
                </div>
              </div>
              {/* Connector */}
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

          {/* Events Feed Section */}
          <section id="events" className="relative py-20 overflow-hidden bg-green-100">
            <div className="absolute inset-0 z-0">
              <img 
                src="green.jpg"
                alt="Background Pattern" 
                className="w-full h-full object-cover opacity-10"
              />
            </div>
            <div className="container mx-auto px-4 md:px-6 relative z-10">
              <div className="text-center max-w-3xl mx-auto mb-10">
                <h2 className="text-3xl md:text-4xl font-serif font-bold text-gray-900 mb-4">Latest News & Updates</h2>
                <p className="text-gray-600 mb-6">
                  Stay connected with our community. Check out the latest flyers, announcements, and posts directly from our Facebook page.
                </p>
                <a 
                  href={`${facebookPageUrl}/events`} 
                  target="_blank" 
                  rel="noreferrer"
                  className="inline-flex items-center gap-2 bg-emerald-700 hover:bg-emerald-800 text-white font-bold py-2 px-6 rounded-full transition-all"
                >
                  Visit Facebook Page <ExternalLink size={16} />
                </a>
              </div>
              <div className="flex justify-center items-center w-full">
                {/* FIX: Changed fixed width 500px to 375px max for force sizing */}
                <div className="w-full max-w-[375px] bg-white rounded-xl shadow-2xl overflow-hidden border-4 border-white transform transition-transform hover:scale-[1.01] duration-300">
                  <div className="bg-white p-4 border-b border-gray-100 flex items-center justify-between">
                    <div className="flex items-center gap-2">
                        <Facebook className="text-blue-600" size={24} />
                        <span className="font-bold text-gray-800">KKS Community Feed</span>
                    </div>
                    <div className="h-2 w-2 rounded-full bg-green-500 animate-pulse"></div>
                  </div>
                  <div className="flex justify-center bg-gray-50">
                    <iframe 
                      // FIX: Changed width to 375 directly.
                      src={`https://www.facebook.com/plugins/page.php?href=${encodedFbUrl}&tabs=timeline&width=375&height=800&small_header=false&adapt_container_width=true&hide_cover=false&show_facepile=true&appId`} 
                      width="100%" 
                      height="800" 
                      style={{border:'none', overflow:'hidden', maxWidth: '100%'}} 
                      scrolling="no" 
                      frameBorder="0" 
                      allowFullScreen={true} 
                      allow="autoplay; clipboard-write; encrypted-media; picture-in-picture; web-share"
                      title="Facebook Timeline Feed"
                    ></iframe>
                  </div>
                </div>
              </div>
              <div className="text-center mt-8 text-sm text-gray-400 italic">
                <p>* Feed updates automatically as we post on Facebook.</p>
              </div>
            </div>
          </section>

          {/* -----------------------------------------------------------------
              GALLERY PREVIEW SECTION (Visible on Home)
              FIX: 9 IMAGES (1 BIG + 8 SMALL) & 16:9 RATIO
          ------------------------------------------------------------------ */}
          <section id="gallery" className="py-20 bg-white">
            <div className="container mx-auto px-4 md:px-6">
              <div className="flex flex-col md:flex-row justify-between items-start md:items-end mb-10">
                <div className="text-left mb-6 md:mb-0">
                  <h4 className="text-emerald-700 font-bold uppercase tracking-widest text-sm mb-2">Our Memories</h4>
                  <h2 className="text-3xl font-serif font-bold text-gray-900">Life at Kala Samiti</h2>
                </div>
                <button 
                  onClick={() => {
                    setCurrentView('gallery');
                    window.scrollTo({ top: 0, behavior: "smooth" });
                  }}
                  className="hidden md:flex items-center gap-2 px-6 py-2 border border-gray-300 rounded-full hover:bg-emerald-50 hover:border-emerald-500 hover:text-emerald-700 transition-all font-medium"
                >
                  <ImageIcon size={18} /> View All Photos
                </button>
              </div>

              {/* Preview Grid (1 Big + 8 Small = 9 Images) */}
              <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                {fullGalleryImages.slice(0, 9).map((img, index) => (
                  <div 
                    key={img.id} 
                    // Use 'aspect-video' for 16:9 ratio
                    className={`relative rounded-2xl overflow-hidden group shadow-md cursor-pointer
                      ${index === 0 ? 'col-span-2 row-span-2' : 'col-span-1 row-span-1 aspect-video'}
                    `}
                    onClick={() => setSelectedImageIndex(index)}
                  >
                    <img 
                      src={img.src} 
                      className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-105" 
                      alt={img.alt} 
                    />
                    <div className="absolute inset-0 bg-black/20 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center">
                       {index === 0 && <span className="text-white bg-black/30 backdrop-blur-sm px-3 py-1 rounded-full text-sm border border-white/50">View Gallery</span>}
                    </div>
                  </div>
                ))}
              </div>

              {/* Mobile View All Button */}
              <div className="mt-8 text-center md:hidden">
                <button 
                  onClick={() => {
                    setCurrentView('gallery');
                    window.scrollTo({ top: 0, behavior: "smooth" });
                  }}
                  className="bg-emerald-700 text-white px-8 py-3 rounded-full font-bold shadow-lg"
                >
                  View All Photos
                </button>
              </div>
            </div>
          </section>

          {/* Membership Banner */}
          <section id="membership" className="py-20 bg-emerald-900 text-white relative overflow-hidden">
            <div className="absolute inset-0 opacity-10" style={{ backgroundImage: 'radial-gradient(#fbbf24 1px, transparent 1px)', backgroundSize: '30px 30px' }}></div>
            <div className="container mx-auto px-4 md:px-6 relative z-10 text-center">
              <h2 className="text-3xl md:text-5xl font-serif font-bold mb-6">Become a part of our Family</h2>
              <p className="text-emerald-100 max-w-2xl mx-auto text-lg mb-10">
                Connect with fellow Malayalis, participate in cultural events, and help us preserve our heritage for the next generation.
              </p>
              <div className="flex flex-col sm:flex-row gap-4 justify-center">
                <button 
                  onClick={handleMembershipClick}
                  className="bg-amber-500 hover:bg-amber-600 text-white px-8 py-3 rounded-lg font-bold shadow-lg transition-transform hover:-translate-y-1 flex items-center gap-2"
                >
                  <FileDown size={20} />
                  Apply for Membership
                </button>
              </div>
            </div>
          </section>
        </>
      ) : (
        /* Full Gallery Page */
        <section className="min-h-screen bg-stone-50 pt-28 pb-20">
          <div className="container mx-auto px-4 md:px-6">
            <div className="flex items-center gap-4 mb-10">
              <button 
                onClick={() => setCurrentView('home')}
                className="w-12 h-12 rounded-full bg-white shadow-md flex items-center justify-center hover:bg-emerald-50 text-emerald-700 transition-colors"
              >
                <ArrowLeft size={24} />
              </button>
              <div>
                <h4 className="text-emerald-700 font-bold uppercase tracking-widest text-xs mb-1">Gallery</h4>
                <h2 className="text-3xl font-serif font-bold text-gray-900">All Memories ({fullGalleryImages.length})</h2>
              </div>
            </div>

            <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-5 gap-4">
              {fullGalleryImages.map((img, index) => (
                <div 
                  key={img.id} 
                  className="relative aspect-square rounded-xl overflow-hidden group shadow-sm hover:shadow-xl transition-all cursor-pointer"
                  onClick={() => setSelectedImageIndex(index)}
                >
                  <img 
                    src={img.src} 
                    alt={img.alt} 
                    className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-110"
                    loading="lazy"
                  />
                  <div className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center">
                    <span className="text-white font-medium text-sm border border-white/50 px-3 py-1 rounded-full backdrop-blur-sm">View</span>
                  </div>
                </div>
              ))}
            </div>

            <div className="text-center mt-12">
               <button 
                onClick={() => {
                  setCurrentView('home');
                  setTimeout(() => window.scrollTo({ top: 0, behavior: "smooth" }), 100);
                }}
                className="text-gray-500 hover:text-emerald-700 font-medium underline"
               >
                 Back to Home
               </button>
            </div>
          </div>
        </section>
      )}

      {/* Footer */}
      <footer id="contact" className="bg-stone-900 text-stone-400 py-16">
        <div className="container mx-auto px-4 md:px-6">
          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-12 border-b border-stone-800 pb-12">
            <div>
               <div className="flex items-center gap-2 mb-6">
                <div className="w-10 h-10 rounded-full overflow-hidden border-2 border-amber-400 shadow-lg bg-white shrink-0">
                  <img 
                    src="KeralaKalaSamitiLogo.jpg"  
                    alt="KKS Logo" 
                    className="w-full h-full object-cover"
                    onError={(e) => {
                      e.target.onerror = null; 
                      e.target.style.display = 'none';
                      e.target.parentNode.classList.add('bg-emerald-700', 'flex', 'items-center', 'justify-center');
                      e.target.parentNode.innerHTML = '<span class="text-amber-100 font-bold text-xl">K</span>';
                    }}
                  />
                </div>
                <span className="text-xl font-serif font-bold text-stone-200">KKS Bhubaneswar</span>
              </div>
              <p className="mb-6 text-sm leading-relaxed">
                A non-profit, cultural organization contributing to cultural integration and social service in Odisha since 1966.
              </p>
              <div className="flex gap-4">
                <a href="https://www.facebook.com/keralakalasamitibbsr" className="w-10 h-10 rounded-full bg-stone-800 flex items-center justify-center hover:bg-emerald-700 hover:text-white transition-all">
                  <Facebook size={18} />
                </a>
                <a href="https://www.instagram.com/keralakalasamiti/" className="w-10 h-10 rounded-full bg-stone-800 flex items-center justify-center hover:bg-pink-600 hover:text-white transition-all">
                  <Instagram size={18} />
                </a>
              </div>
            </div>
            <div>
              <h3 className="text-white font-bold mb-6">Quick Links</h3>
              <ul className="space-y-3 text-sm">
                <li>
                  <a 
                    href="#home" 
                    onClick={(e) => handleNavigation(e, '#home')}
                    className="hover:text-emerald-500 transition-colors cursor-pointer"
                  >
                    Our History
                  </a>
                </li>
                <li><a href="#" className="hover:text-emerald-500 transition-colors">Executive Committee</a></li>
                <li><a href="#" className="hover:text-emerald-500 transition-colors">Life Members List</a></li>
                <li>
                  <a 
                    href="#events" 
                    onClick={(e) => handleNavigation(e, '#events')}
                    className="hover:text-emerald-500 transition-colors cursor-pointer"
                  >
                    News & Circulars
                  </a>
                </li>
              </ul>
            </div>
            <div>
              <h3 className="text-white font-bold mb-6">Contact Us</h3>
              <ul className="space-y-4 text-sm">
                <li className="flex items-start gap-3">
                  <MapPin size={18} className="text-amber-500 mt-1 shrink-0" />
                  <span>
                    Kerala Kala Samiti Hall,<br />
                    Unit-4, Bhubaneswar,<br />
                    Odisha - 751001
                  </span>
                </li>
                <li className="flex items-center gap-3">
                  <PhoneCallIcon size={18} className="text-amber-500 shrink-0" />
                  <span>+91 98275 75106</span>
                </li>
                <li className="flex items-center gap-3">
                  <Mail size={18} className="text-amber-500 shrink-0" />
                  <span>secretarykksbbsr@gmail.com</span>
                </li>
              </ul>
            </div>
          </div>
          <div className="pt-8 text-center text-xs text-stone-600 flex flex-col md:flex-row justify-between items-center gap-4">
            <p>&copy; 2025 Kerala Kala Samiti, Bhubaneswar. All rights reserved.</p>
            <p>Designed with respect for tradition.</p>
          </div>
        </div>
      </footer>

      {/* Membership Download Success Modal */}
      {showMembershipModal && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm animate-in fade-in duration-200">
           <div className="bg-white rounded-2xl shadow-2xl p-8 max-w-md w-full relative transform transition-all scale-100 animate-fade-in">
             <button 
               onClick={() => setShowMembershipModal(false)}
               className="absolute top-4 right-4 text-gray-400 hover:text-gray-600 transition-colors"
             >
               <X size={24} />
             </button>
             
             <div className="flex flex-col items-center text-center">
               <div className="w-16 h-16 bg-green-100 text-green-600 rounded-full flex items-center justify-center mb-6">
                 <CheckCircle size={32} />
               </div>
               
               <h3 className="text-2xl font-bold text-gray-900 mb-2">Form Downloaded!</h3>
               <p className="text-gray-600 mb-6 leading-relaxed">
                 Please print and fill out the form. <br/>
                 <span className="font-semibold text-emerald-800">Submit the filled up form to any association member.</span>
               </p>
               
               <button 
                 onClick={() => setShowMembershipModal(false)}
                 className="bg-emerald-700 hover:bg-emerald-800 text-white font-bold py-3 px-8 rounded-lg w-full transition-colors"
               >
                 Okay, Got it
               </button>
             </div>
           </div>
        </div>
      )}

      {/* Lightbox Modal Slider (Re-added with Smooth Animations) */}
      {selectedImageIndex !== null && (
        <div 
          className="fixed inset-0 z-[110] flex items-center justify-center bg-black/90 backdrop-blur-md animate-fade-in" 
          onClick={() => setSelectedImageIndex(null)}
        >
          {/* Close Button */}
          <button 
            onClick={() => setSelectedImageIndex(null)}
            className="absolute top-4 right-4 text-white/70 hover:text-white transition-colors p-2 z-[120]"
          >
            <X size={32} />
          </button>

          {/* Left Arrow */}
          <button
            onClick={handlePrevImage}
            className="absolute left-4 top-1/2 -translate-y-1/2 text-white/70 hover:text-white bg-black/30 hover:bg-black/50 rounded-full p-2 transition-all z-[120]"
          >
            <ChevronLeft size={40} />
          </button>

          {/* Image Container with Animation */}
          <div 
            className="relative max-h-[90vh] max-w-[90vw]" 
            onClick={(e) => e.stopPropagation()}
          >
            <img 
              key={selectedImageIndex} // Key triggers animation on change
              src={fullGalleryImages[selectedImageIndex].src} 
              className="max-h-[90vh] max-w-[90vw] object-contain rounded-lg shadow-2xl animate-scale-in" // Using custom class defined in style tag
              alt={fullGalleryImages[selectedImageIndex].alt}
            />
            <div className="absolute bottom-4 left-0 w-full text-center text-white/80 text-sm drop-shadow-md">
              {selectedImageIndex + 1} / {fullGalleryImages.length}
            </div>
          </div>

          {/* Right Arrow */}
          <button
            onClick={handleNextImage}
            className="absolute right-4 top-1/2 -translate-y-1/2 text-white/70 hover:text-white bg-black/30 hover:bg-black/50 rounded-full p-2 transition-all z-[120]"
          >
            <ChevronRight size={40} />
          </button>
        </div>
      )}
    </div>
  );
};

export default App;