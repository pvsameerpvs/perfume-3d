"use client";

import React, { useState, useEffect, useRef } from "react";
import Image from "next/image";
import { 
  motion, 
  AnimatePresence, 
  useScroll, 
  useTransform, 
  useSpring,
  useInView
} from "framer-motion";
import { 
  ShoppingBag, 
  Menu, 
  X, 
  Star, 
  Phone, 
  Mail, 
  Check, 
  ArrowRight, 
  Sparkles, 
  Droplet, 
  Compass, 
  ShieldCheck, 
  Award, 
  Clock, 
  Heart,
  Plus,
  Minus,
  Trash2,
  Send
} from "lucide-react";

// Types
interface CartItem {
  id: string;
  name: string;
  price: number;
  size: string;
  image: string;
  quantity: number;
}

export default function Home() {
  // Cart State
  const [cart, setCart] = useState<CartItem[]>([]);
  const [isCartOpen, setIsCartOpen] = useState(false);
  
  // Mobile Navigation State
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  
  // Active Sticky Experience Section
  const [activeExperience, setActiveExperience] = useState(0);
  
  // Custom Size selection in details
  const [selectedSize, setSelectedSize] = useState("100 ML");
  
  // Note visualizer active state
  const [hoveredNote, setHoveredNote] = useState<string | null>(null);

  // Form State
  const [formData, setFormData] = useState({ name: "", phone: "", message: "" });
  const [formSubmitted, setFormSubmitted] = useState(false);
  
  // Refs for scroll elements
  const containerRef = useRef<HTMLDivElement>(null);
  const heroRef = useRef<HTMLDivElement>(null);
  const detailsRef = useRef<HTMLDivElement>(null);
  const experienceRef = useRef<HTMLDivElement>(null);
  const packagingRef = useRef<HTMLDivElement>(null);
  const ctaRef = useRef<HTMLDivElement>(null);
  
  // Framer motion scroll triggers
  const { scrollYProgress } = useScroll();
  const scaleProgress = useSpring(scrollYProgress, { stiffness: 100, damping: 30 });
  
  // Hero Frame Scroll Animation
  
  const [currentFrame, setCurrentFrame] = useState(66);
  const startFrame = 75;
  const endFrame = 181;
  const prevBatchRef = useRef(0);
  
  // Global scroll drives frame animation across entire page (skip first 45 frames)
  useEffect(() => {
    const unsub = scrollYProgress.onChange((latest) => {
      const frame = Math.round(startFrame + latest * (endFrame - startFrame));
      setCurrentFrame(Math.min(endFrame, Math.max(startFrame, frame)));
    });
    return () => unsub();
  }, [scrollYProgress]);
  
  // Preload nearby frames for smooth animation
  useEffect(() => {
    const batch = Math.floor((currentFrame - startFrame) / 10);
    if (batch !== prevBatchRef.current) {
      prevBatchRef.current = batch;
      const start = Math.max(startFrame, currentFrame - 8);
      const end = Math.min(endFrame, currentFrame + 8);
      for (let i = start; i <= end; i++) {
        const preloadImg = new window.Image();
        preloadImg.src = `/images/herosection/ezgif-frame-${String(i).padStart(3, '0')}.png`;
      }
    }
  }, [currentFrame]);
  
  // Details Scroll reveal
  const detailsInView = useInView(detailsRef, { once: false, amount: 0.2 });
  
  // Sticky experience tracking scroll position
  const { scrollYProgress: expScrollProgress } = useScroll({
    target: experienceRef,
    offset: ["start start", "end end"]
  });
  
  // Horizontal parallax for packaging section
  const { scrollYProgress: packScrollProgress } = useScroll({
    target: packagingRef,
    offset: ["start end", "end start"]
  });
  
  const packBottleX = useTransform(packScrollProgress, [0, 1], [-40, 40]);
  const packBoxX = useTransform(packScrollProgress, [0, 1], [40, -40]);

  // Update experience step based on scroll percent
  useEffect(() => {
    return expScrollProgress.onChange((latest) => {
      if (latest < 0.33) {
        setActiveExperience(0);
      } else if (latest < 0.66) {
        setActiveExperience(1);
      } else {
        setActiveExperience(2);
      }
    });
  }, [expScrollProgress]);

  // Cart Handlers
  const addToCart = (product: { id: string; name: string; price: number; image: string }, size: string = "100 ML") => {
    setCart((prevCart) => {
      const existingItem = prevCart.find((item) => item.id === product.id && item.size === size);
      if (existingItem) {
        return prevCart.map((item) => 
          item.id === product.id && item.size === size 
            ? { ...item, quantity: item.quantity + 1 }
            : item
        );
      }
      return [...prevCart, { ...product, size, quantity: 1 }];
    });
    setIsCartOpen(true);
  };

  const updateQuantity = (id: string, size: string, delta: number) => {
    setCart((prevCart) => 
      prevCart.map((item) => {
        if (item.id === id && item.size === size) {
          const newQty = item.quantity + delta;
          return newQty > 0 ? { ...item, quantity: newQty } : null;
        }
        return item;
      }).filter((item): item is CartItem => item !== null)
    );
  };

  const removeFromCart = (id: string, size: string) => {
    setCart((prevCart) => prevCart.filter((item) => !(item.id === id && item.size === size)));
  };

  const cartTotal = cart.reduce((total, item) => total + item.price * item.quantity, 0);

  // WhatsApp checkout message formatter
  const handleWhatsAppCheckout = () => {
    if (cart.length === 0) return;
    
    let message = `Hello RIHU Perfume! I would like to place an order for the following premium fragrances:\n\n`;
    cart.forEach((item, index) => {
      message += `${index + 1}. *${item.name}* (${item.size}) - Qty: ${item.quantity} - AED ${item.price * item.quantity}\n`;
    });
    message += `\n*Total Amount:* AED ${cartTotal}\n\n`;
    message += `Please confirm my order and send details. Thank you!`;
    
    const encodedText = encodeURIComponent(message);
    window.open(`https://wa.me/971501234567?text=${encodedText}`, "_blank");
  };

  // WhatsApp Single Product Order
  const handleSingleProductWhatsApp = (name: string, size: string, price: number) => {
    const message = `Hello RIHU Perfume! I am interested in purchasing *${name}* (${size}) for AED ${price}. Please share ordering details.`;
    const encodedText = encodeURIComponent(message);
    window.open(`https://wa.me/971501234567?text=${encodedText}`, "_blank");
  };

  // Form Submit Handler
  const handleFormSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!formData.name || !formData.phone) return;
    
    // Simulate premium submit
    setFormSubmitted(true);
    setTimeout(() => {
      setFormData({ name: "", phone: "", message: "" });
    }, 3000);
  };

  // Smooth scroll helper
  const scrollToSection = (id: string) => {
    setIsMobileMenuOpen(false);
    const element = document.getElementById(id);
    if (element) {
      element.scrollIntoView({ behavior: "smooth" });
    }
  };

  return (
    <>
      {/* Full-page Frame Background — animates across entire scroll */}
      <div className="fixed inset-0 w-full h-full z-0">
        <img
          src={`/images/herosection/ezgif-frame-${String(currentFrame).padStart(3, '0')}.png`}
          alt=""
          className="w-full h-full object-cover"
          draggable={false}
        />
      </div>
      {/* Dark overlay for content readability across all sections */}
      
      <div ref={containerRef} className="relative w-full overflow-hidden">
        {/* Global Smoke Background effect */}
        <div className="smoke-overlay" />
        
        {/* Golden spotlight glows */}
        <div className="glow-spotlight glow-gold w-[500px] h-[500px] top-[10%] left-[-10%]" />
        <div className="glow-spotlight glow-gold w-[600px] h-[600px] top-[40%] right-[-10%]" />
        <div className="glow-spotlight glow-gold w-[500px] h-[500px] bottom-[15%] left-[20%]" />

      {/* Progress Scroll Bar at the top */}
      <motion.div 
        className="fixed top-0 left-0 right-0 h-[2px] bg-gradient-to-r from-[#c5a059] via-[#e5d5b7] to-[#b8975a] origin-left z-50"
        style={{ scaleX: scrollYProgress }}
      />

      {/* ================= HEADER SECTION ================= */}
      <header className="fixed top-0 left-0 w-full z-40 bg-[#030303]/70 backdrop-blur-md border-b border-[#c5a059]/10 transition-all duration-300">
        <div className="max-w-7xl mx-auto px-6 h-20 flex items-center justify-between">
          {/* Logo */}
          <button 
            onClick={() => scrollToSection("home")}
            className="text-2xl font-black tracking-[0.25em] text-[#e6dfd3] font-serif hover:opacity-85 transition-opacity"
          >
            RIHU
          </button>

          {/* Desktop Navigation Links */}
          <nav className="hidden lg:flex items-center gap-8">
            {[
              { label: "Home", target: "home" },
              { label: "About", target: "about" },
              { label: "Details", target: "details" },
              { label: "Collection", target: "collection" },
              { label: "Notes", target: "notes" },
              { label: "Why RIHU", target: "why-rihu" },
              { label: "Contact", target: "contact" }
            ].map((link) => (
              <button
                key={link.target}
                onClick={() => scrollToSection(link.target)}
                className="text-xs uppercase tracking-[0.2em] font-medium text-[#d8d2c4] hover:text-[#c5a059] transition-colors duration-300"
              >
                {link.label}
              </button>
            ))}
          </nav>

          {/* Header Actions */}
          <div className="flex items-center gap-4">
            {/* Cart Button */}
            <button
              onClick={() => setIsCartOpen(true)}
              className="relative p-2.5 text-[#d8d2c4] hover:text-[#c5a059] transition-colors rounded-full hover:bg-white/5"
              aria-label="Shopping Cart"
            >
              <ShoppingBag className="w-5 h-5" />
              {cart.length > 0 && (
                <motion.span 
                  initial={{ scale: 0 }}
                  animate={{ scale: 1 }}
                  className="absolute -top-0.5 -right-0.5 w-4 h-4 bg-[#c5a059] text-black text-[9px] font-bold rounded-full flex items-center justify-center"
                >
                  {cart.reduce((s, i) => s + i.quantity, 0)}
                </motion.span>
              )}
            </button>

            {/* CTA Button */}
           

            {/* Mobile Hamburger Button */}
            <button
              onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
              className="lg:hidden p-2 text-[#d8d2c4] hover:text-[#c5a059] transition-colors"
              aria-label="Toggle Menu"
            >
              {isMobileMenuOpen ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
            </button>
          </div>
        </div>
      </header>

      {/* Mobile Hamburger Menu Overlay */}
      <AnimatePresence>
        {isMobileMenuOpen && (
          <motion.div
            initial={{ opacity: 0, y: -20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -20 }}
            transition={{ duration: 0.4, ease: [0.16, 1, 0.3, 1] }}
            className="fixed inset-0 z-30 pt-24 pb-8 px-6 bg-[#030303]/95 backdrop-blur-xl flex flex-col justify-between lg:hidden border-b border-[#c5a059]/15"
          >
            <div className="flex flex-col gap-6 items-center justify-center flex-grow">
              {[
                { label: "Home", target: "home" },
                { label: "About", target: "about" },
                { label: "Details", target: "details" },
                { label: "Collection", target: "collection" },
                { label: "Notes", target: "notes" },
                { label: "Why RIHU", target: "why-rihu" },
                { label: "Contact", target: "contact" }
              ].map((link, idx) => (
                <motion.button
                  key={link.target}
                  initial={{ opacity: 0, y: 15 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: idx * 0.05 }}
                  onClick={() => scrollToSection(link.target)}
                  className="text-lg font-serif tracking-[0.15em] text-[#e6dfd3] hover:text-[#c5a059] transition-colors duration-300"
                >
                  {link.label}
                </motion.button>
              ))}
            </div>
            
            <div className="flex flex-col gap-4 mt-auto">
              <button
                onClick={() => {
                  scrollToSection("collection");
                  setIsMobileMenuOpen(false);
                }}
                className="btn-gold w-full text-center"
              >
                Order Now
              </button>
            </div>
          </motion.div>
        )}
      </AnimatePresence>


      {/* ================= 2. SCROLL FRAME HERO SECTION ================= */}
      <section 
        id="home" 
        ref={heroRef}
        className="relative h-[300vh] z-10"
      >
        {/* Sticky container — stays fixed while scrolling through the hero */}
        <div className="sticky top-0 w-full h-screen overflow-hidden">

          {/* Simple brand overlay centered */}
          <div className="absolute inset-0 flex items-center justify-center">
            <div className="text-center">
              <p className="text-xs uppercase tracking-[0.3em] text-[#c5a059] font-semibold mb-4 [text-shadow:0_2px_8px_rgba(0,0,0,0.8)]">
                Premium Luxury Fragrance
              </p>
              <h1 className="text-6xl sm:text-7xl xl:text-8xl font-bold font-serif leading-tight [text-shadow:0_4px_16px_rgba(0,0,0,0.9)]">
                <span className="gold-gradient-text">RIHU</span> <br/>
                <span className="text-white">Perfume</span>
              </h1>
            </div>
          </div>

          {/* Scroll indicator */}
          <div className="absolute bottom-10 left-1/2 -translate-x-1/2 z-20">
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 0.7 }}
              transition={{ delay: 1, duration: 1 }}
              className="flex items-center gap-3 text-xs tracking-[0.2em] uppercase text-[#c5a059]/70 animate-bounce cursor-pointer"
              onClick={() => scrollToSection("details")}
            >
              <span>Scroll to Explore</span>
              <ArrowRight className="w-3.5 h-3.5 rotate-90" />
            </motion.div>
          </div>

        </div>
      </section>


      {/* ================= 3. PRODUCT DETAIL + PRICE SECTION ================= */}
      <section 
        id="details" 
        ref={detailsRef}
        className="relative section-padding border-t border-[#c5a059]/5 z-10"
      >
        <div className="max-w-7xl mx-auto px-6">
          <div className="text-center max-w-3xl mx-auto mb-16">
            <motion.p 
              initial={{ opacity: 0 }}
              whileInView={{ opacity: 1 }}
              viewport={{ once: true }}
              className="text-xs uppercase tracking-[0.25em] text-[#c5a059] mb-3"
            >
              Luxury Captured In Every Drop
            </motion.p>
            <motion.h2 
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.8 }}
              className="text-4xl sm:text-5xl font-bold font-serif mb-6 text-white"
            >
              RIHU <span className="gold-gradient-text">Signature</span> Perfume
            </motion.h2>
            <motion.p 
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ delay: 0.2, duration: 0.8 }}
              className="text-[#d8d2c4] text-lg font-light leading-relaxed"
            >
              RIHU Signature Perfume is designed for people who want their fragrance to speak before they do. It blends deep warmth, refined freshness, and lasting elegance into one unforgettable scent.
            </motion.p>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-12 gap-12 lg:gap-20 items-center">
            
            {/* Product Image Side with Parallax/Scroll Scale */}
            <motion.div 
              initial={{ opacity: 0, x: -50 }}
              whileInView={{ opacity: 1, x: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 1 }}
              className="lg:col-span-5 flex justify-center"
            >
              <div className="relative w-full max-w-[380px] aspect-[4/5] rounded-sm overflow-hidden bg-[#070707] border border-[#c5a059]/10 group">
                <div className="absolute inset-0 bg-gradient-to-t from-black via-transparent to-transparent z-10" />
                <Image
                  src="/images/rihu_perfume_hero.png"
                  alt="RIHU Signature Perfume Detail"
                  fill
                  className="object-cover transition-transform duration-700 group-hover:scale-105"
                  sizes="(max-w-7xl) 100vw, 40vw"
                />
                
                {/* Floating tags */}
                <div className="absolute bottom-6 left-6 z-20">
                  <span className="text-[10px] uppercase tracking-[0.25em] bg-black/80 backdrop-blur-md text-[#c5a059] border border-[#c5a059]/30 px-3.5 py-1.5 font-bold">
                    Masterpiece Scent
                  </span>
                </div>
              </div>
            </motion.div>

            {/* Product Details & Price Card Side */}
            <div className="lg:col-span-7 flex flex-col justify-center">
              <motion.div
                initial={{ opacity: 0, x: 50 }}
                whileInView={{ opacity: 1, x: 0 }}
                viewport={{ once: true }}
                transition={{ duration: 1 }}
                className="space-y-6"
              >
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  {[
                    { label: "Product Name", value: "RIHU Signature" },
                    { label: "Size", value: "100 ML" },
                    { label: "Type", value: "Eau De Parfum" },
                    { label: "Longevity", value: "Long Lasting (12+ Hours)" },
                    { label: "Style", value: "Luxury, Elegant, Bold" },
                    { label: "Best For", value: "Daily Wear, Evening Events, Special Occasions" }
                  ].map((detail, idx) => (
                    <motion.div 
                      key={detail.label}
                      initial={{ opacity: 0, y: 15 }}
                      whileInView={{ opacity: 1, y: 0 }}
                      viewport={{ once: true }}
                      transition={{ delay: idx * 0.08 }}
                      className="border-b border-[#c5a059]/10 pb-3 flex flex-col"
                    >
                      <span className="text-[10px] uppercase tracking-[0.15em] text-[#c5a059] mb-1 font-semibold">{detail.label}</span>
                      <span className="text-[#e6dfd3] text-sm tracking-wide font-medium">{detail.value}</span>
                    </motion.div>
                  ))}
                </div>

                {/* Pricing Card (Glassmorphic) */}
                <motion.div 
                  initial={{ opacity: 0, scale: 0.95 }}
                  whileInView={{ opacity: 1, scale: 1 }}
                  viewport={{ once: true }}
                  transition={{ delay: 0.4 }}
                  className="glass-card p-6 md:p-8 rounded-sm mt-8 relative overflow-hidden"
                >
                  <div className="absolute top-0 right-0 w-24 h-24 bg-[#c5a059]/5 rounded-bl-full pointer-events-none" />
                  
                  <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-6">
                    <div>
                      <span className="text-[10px] uppercase tracking-[0.2em] text-[#c5a059] font-bold block mb-1">Launch Offer Price</span>
                      <div className="flex items-baseline gap-3">
                        <span className="text-4xl font-bold text-white font-serif tracking-wide">AED 149</span>
                        <span className="text-sm line-through text-[#d8d2c4]/50">AED 299</span>
                      </div>
                      <p className="text-[11px] text-[#e5d5b7]/70 italic mt-2">
                        *Limited launch price for premium fragrance lovers.
                      </p>
                    </div>

                    <div className="flex flex-col sm:flex-row gap-3 w-full md:w-auto">
                      <button
                        onClick={() => addToCart({ id: "rihu-signature", name: "RIHU Signature", price: 149, image: "/images/rihu_perfume_hero.png" })}
                        className="btn-gold text-center !py-3 !px-7 flex-grow justify-center"
                      >
                        Add to Cart
                      </button>
                      <button
                        onClick={() => handleSingleProductWhatsApp("RIHU Signature", "100 ML", 149)}
                        className="btn-whatsapp text-center !py-3 !px-7 flex-grow justify-center"
                      >
                        Order on WhatsApp
                      </button>
                    </div>
                  </div>
                </motion.div>
              </motion.div>
            </div>
            
          </div>
        </div>
      </section>


      {/* ================= 4. ABOUT RIHU SECTION ================= */}
      <section id="about" className="relative section-padding overflow-hidden z-10">
        {/* Background ambient gold lines */}
        <div className="absolute inset-0 z-0 pointer-events-none opacity-[0.03]">
          <svg className="w-full h-full" viewBox="0 0 100 100" preserveAspectRatio="none">
            <line x1="0" y1="20" x2="100" y2="25" stroke="#c5a059" strokeWidth="0.1" />
            <line x1="0" y1="60" x2="100" y2="55" stroke="#c5a059" strokeWidth="0.1" />
            <line x1="20" y1="0" x2="25" y2="100" stroke="#c5a059" strokeWidth="0.1" />
            <line x1="80" y1="0" x2="75" y2="100" stroke="#c5a059" strokeWidth="0.1" />
          </svg>
        </div>

        <div className="max-w-7xl mx-auto px-6 relative z-10">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-16 items-center">
            
            {/* Storytelling Content */}
            <div className="space-y-8">
              <div className="space-y-4">
                <span className="text-xs uppercase tracking-[0.3em] text-[#c5a059] font-bold block">Our Philosophy</span>
                <h2 className="text-4xl sm:text-5xl font-bold font-serif leading-tight">
                  About <span className="gold-gradient-text">RIHU</span>
                </h2>
              </div>
              
              <div className="h-0.5 w-16 bg-gradient-to-r from-[#c5a059] to-transparent" />
              
              <p className="text-[#d8d2c4] text-lg font-light leading-relaxed max-w-xl">
                RIHU is crafted for those who believe fragrance is more than a scent — it is a signature. With rich notes, long-lasting freshness, and a luxurious feel, RIHU brings elegance to every moment.
              </p>
              
              <div className="glass-card p-6 border-l-2 border-l-[#c5a059] max-w-lg">
                <p className="text-[#e5d5b7] italic font-serif text-xl tracking-wide">
                  &ldquo;Not just worn. Remembered.&rdquo;
                </p>
              </div>

              <div className="grid grid-cols-3 gap-6 pt-4">
                {[
                  { value: "100%", label: "Pure Oils" },
                  { value: "12h+", label: "Longevity" },
                  { value: "UAE", label: "Crafted" }
                ].map((stat) => (
                  <div key={stat.label} className="text-center sm:text-left">
                    <div className="text-2xl font-bold font-serif text-[#c5a059]">{stat.value}</div>
                    <div className="text-[10px] uppercase tracking-[0.15em] text-[#d8d2c4]/65 mt-1">{stat.label}</div>
                  </div>
                ))}
              </div>
            </div>

            {/* Minimal Luxury Story Layout Graphic */}
            <motion.div 
              initial={{ opacity: 0, scale: 0.95 }}
              whileInView={{ opacity: 1, scale: 1 }}
              viewport={{ once: true }}
              transition={{ duration: 1.2 }}
              className="relative flex justify-center items-center h-[350px] sm:h-[450px]"
            >
              {/* Outer gold ring */}
              <div className="absolute w-[280px] sm:w-[360px] h-[280px] sm:h-[360px] rounded-full border border-[#c5a059]/10 flex items-center justify-center">
                <div className="absolute w-[240px] sm:w-[320px] h-[240px] sm:h-[320px] rounded-full border border-dashed border-[#c5a059]/5 animate-[spin_100s_linear_infinite]" />
              </div>
              
              {/* Inner storytelling core card */}
              <div className="glass-card p-8 rounded-sm text-center max-w-[280px] sm:max-w-[340px] z-10">
                <Sparkles className="w-6 h-6 text-[#c5a059] mx-auto mb-4 animate-pulse" />
                <h3 className="text-lg font-serif tracking-[0.15em] text-white mb-3">The Signature Creed</h3>
                <p className="text-xs text-[#d8d2c4]/70 leading-relaxed font-light">
                  We blend deep tradition with modern sophistication. Our team gathers rare natural essences to ensure every single splash of RIHU becomes an everlasting signature memory.
                </p>
              </div>
            </motion.div>

          </div>
        </div>
      </section>


      {/* ================= 5. LUXURY EXPERIENCE SECTION (STICKY SCROLL) ================= */}
      <section 
        id="experience" 
        ref={experienceRef} 
        className="relative min-h-[180vh] z-10 border-t border-b border-[#c5a059]/5"
      >
        <div className="sticky top-0 left-0 w-full h-screen flex flex-col justify-center overflow-hidden">
          <div className="max-w-7xl mx-auto px-6 w-full grid grid-cols-1 lg:grid-cols-2 gap-12 items-center">
            
            {/* Left: Sticky Perfume Bottle Graphic with shifting glows */}
            <div className="flex justify-center items-center relative h-[300px] sm:h-[450px] lg:h-[550px] order-2 lg:order-1">
              
              {/* Shifting radial glow based on experience slide */}
              <div className={`absolute w-[250px] sm:w-[400px] h-[250px] sm:h-[400px] rounded-full filter blur-[80px] transition-all duration-1000 ${
                activeExperience === 0 
                  ? "bg-[#c5a059]/10" 
                  : activeExperience === 1 
                  ? "bg-[#e5d5b7]/10 scale-105" 
                  : "bg-[#8c6d30]/15 scale-95"
              }`} />
              
              {/* Spinning compass outline */}
              <div className="absolute w-[260px] sm:w-[380px] h-[260px] sm:h-[380px] border border-[#c5a059]/5 rounded-full flex items-center justify-center animate-[spin_80s_linear_infinite]">
                <div className="w-1.5 h-1.5 rounded-full bg-[#c5a059]/20 absolute top-0" />
                <div className="w-1.5 h-1.5 rounded-full bg-[#c5a059]/20 absolute bottom-0" />
              </div>

              {/* Perfume Bottle Image inside Sticky Experience */}
              <div className="relative w-[180px] sm:w-[260px] h-[280px] sm:h-[420px] z-10">
                <Image
                  src="/images/rihu_perfume_hero.png"
                  alt="RIHU Sticky Experience bottle"
                  fill
                  className={`object-contain transition-all duration-1000 ${
                    activeExperience === 0
                      ? "rotate-0 scale-100"
                      : activeExperience === 1
                      ? "-rotate-[4deg] scale-[1.03]"
                      : "rotate-[3deg] scale-[0.97]"
                  }`}
                  sizes="(max-w-7xl) 100vw, 30vw"
                />
              </div>

              {/* Phase Indicators */}
              <div className="absolute left-6 bottom-4 lg:bottom-12 flex flex-col gap-2 z-20">
                {[0, 1, 2].map((idx) => (
                  <div key={idx} className="flex items-center gap-3">
                    <div className={`h-[2px] transition-all duration-500 ${
                      activeExperience === idx ? "w-8 bg-[#c5a059]" : "w-3 bg-white/15"
                    }`} />
                    <span className={`text-[9px] uppercase tracking-widest transition-colors duration-500 ${
                      activeExperience === idx ? "text-[#c5a059] font-bold" : "text-white/30"
                    }`}>
                      Phase 0{idx + 1}
                    </span>
                  </div>
                ))}
              </div>
            </div>

            {/* Right: Experience cards switching by scroll */}
            <div className="order-1 lg:order-2 space-y-6">
              <div className="mb-8">
                <span className="text-xs uppercase tracking-[0.3em] text-[#c5a059] font-bold block mb-2">The Sensory Journey</span>
                <h2 className="text-4xl sm:text-5xl font-bold font-serif text-white">
                  The Experience <br/>of <span className="gold-gradient-text">RIHU</span>
                </h2>
              </div>

              {/* Cards wrapper */}
              <div className="relative h-[250px] md:h-[320px] flex items-center">
                <AnimatePresence mode="wait">
                  {activeExperience === 0 && (
                    <motion.div
                      key="exp-0"
                      initial={{ opacity: 0, x: 30 }}
                      animate={{ opacity: 1, x: 0 }}
                      exit={{ opacity: 0, x: -30 }}
                      transition={{ duration: 0.6 }}
                      className="glass-card p-8 rounded-sm w-full relative"
                    >
                      <div className="w-10 h-10 rounded-full bg-[#c5a059]/10 flex items-center justify-center mb-5 text-[#c5a059]">
                        <Droplet className="w-5 h-5" />
                      </div>
                      <h3 className="text-2xl font-serif text-white mb-3">First Impression</h3>
                      <p className="text-[#d8d2c4] font-light leading-relaxed">
                        Fresh, smooth, and instantly elegant. A burst of vibrant, hand-selected citrus notes coupled with subtle, delicate luxury spices to immediately capture the room.
                      </p>
                    </motion.div>
                  )}

                  {activeExperience === 1 && (
                    <motion.div
                      key="exp-1"
                      initial={{ opacity: 0, x: 30 }}
                      animate={{ opacity: 1, x: 0 }}
                      exit={{ opacity: 0, x: -30 }}
                      transition={{ duration: 0.6 }}
                      className="glass-card p-8 rounded-sm w-full relative"
                    >
                      <div className="w-10 h-10 rounded-full bg-[#c5a059]/10 flex items-center justify-center mb-5 text-[#c5a059]">
                        <Compass className="w-5 h-5" />
                      </div>
                      <h3 className="text-2xl font-serif text-white mb-3">After a Few Minutes</h3>
                      <p className="text-[#d8d2c4] font-light leading-relaxed">
                        Warm notes begin to open with depth and confidence. The heart transitions into majestic Turkish rose, warm golden amber, and deep comforting musk that define your sophisticated character.
                      </p>
                    </motion.div>
                  )}

                  {activeExperience === 2 && (
                    <motion.div
                      key="exp-2"
                      initial={{ opacity: 0, x: 30 }}
                      animate={{ opacity: 1, x: 0 }}
                      exit={{ opacity: 0, x: -30 }}
                      transition={{ duration: 0.6 }}
                      className="glass-card p-8 rounded-sm w-full relative"
                    >
                      <div className="w-10 h-10 rounded-full bg-[#c5a059]/10 flex items-center justify-center mb-5 text-[#c5a059]">
                        <Award className="w-5 h-5" />
                      </div>
                      <h3 className="text-2xl font-serif text-white mb-3">Lasting Effect</h3>
                      <p className="text-[#d8d2c4] font-light leading-relaxed">
                        A memorable fragrance trail that stays refined and luxurious. The deep base of rare oud, rich vanilla, and warm, mysterious woody notes linger beautifully for hours on your skin and clothes.
                      </p>
                    </motion.div>
                  )}
                </AnimatePresence>
              </div>
            </div>

          </div>
        </div>
      </section>


      {/* ================= 6. SIGNATURE COLLECTION SECTION ================= */}
      <section 
        id="collection" 
        className="relative section-padding z-10 border-b border-[#c5a059]/5"
      >
        <div className="max-w-7xl mx-auto px-6">
          <div className="text-center max-w-3xl mx-auto mb-16">
            <span className="text-xs uppercase tracking-[0.3em] text-[#c5a059] font-bold block mb-3">Curated Elite Blends</span>
            <h2 className="text-4xl sm:text-5xl font-bold font-serif text-white">
              Signature <span className="gold-gradient-text">Collection</span>
            </h2>
            <div className="h-0.5 w-12 bg-[#c5a059] mx-auto mt-4" />
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            {[
              {
                id: "rihu-classic",
                name: "RIHU Classic",
                desc: "Long-lasting luxury fragrance for everyday elegance.",
                price: 99,
                originalPrice: 199,
                image: "/images/rihu_classic.png",
                badge: "Signature Classic"
              },
              {
                id: "rihu-noir",
                name: "RIHU Noir",
                desc: "Deep, bold, and mysterious scent for confident personalities.",
                price: 129,
                originalPrice: 249,
                image: "/images/rihu_noir.png",
                badge: "Deep & Mysterious"
              },
              {
                id: "rihu-gold",
                name: "RIHU Gold",
                desc: "A rich premium fragrance made for special occasions.",
                price: 149,
                originalPrice: 299,
                image: "/images/rihu_gold.png",
                badge: "Royal Special"
              }
            ].map((prod, idx) => (
              <motion.div
                key={prod.id}
                initial={{ opacity: 0, y: 40 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ delay: idx * 0.15, duration: 0.8 }}
                className="glass-card flex flex-col h-full rounded-sm group overflow-hidden border border-[#c5a059]/10"
              >
                {/* Product Card Image container */}
                <div className="relative aspect-[1/1] w-full bg-[#080808] overflow-hidden">
                  <div className="absolute inset-0 bg-gradient-to-t from-[#030303] via-transparent to-transparent z-10" />
                  <Image
                    src={prod.image}
                    alt={prod.name}
                    fill
                    className="object-cover transition-transform duration-700 group-hover:scale-105"
                    sizes="(max-w-7xl) 100vw, 30vw"
                  />
                  
                  {/* Badge overlay */}
                  <span className="absolute top-4 left-4 z-20 text-[9px] uppercase tracking-[0.2em] bg-black/85 border border-[#c5a059]/30 text-[#c5a059] px-2.5 py-1 font-bold">
                    {prod.badge}
                  </span>
                </div>

                {/* Info and price container */}
                <div className="p-6 flex-grow flex flex-col justify-between space-y-4">
                  <div className="space-y-2">
                    <h3 className="text-xl font-serif text-white group-hover:text-[#c5a059] transition-colors duration-300">
                      {prod.name}
                    </h3>
                    <p className="text-xs text-[#d8d2c4]/70 leading-relaxed font-light min-h-[36px]">
                      {prod.desc}
                    </p>
                  </div>

                  <div className="champagne-divider !my-2" />

                  <div className="flex items-center justify-between">
                    <div>
                      <span className="text-[10px] text-[#c5a059] block uppercase tracking-wider font-semibold">Special Price</span>
                      <div className="flex items-center gap-2">
                        <span className="text-lg font-bold font-serif text-white">AED {prod.price}</span>
                        <span className="text-xs line-through text-[#d8d2c4]/40">AED {prod.originalPrice}</span>
                      </div>
                    </div>
                    
                    <button
                      onClick={() => addToCart({ id: prod.id, name: prod.name, price: prod.price, image: prod.image })}
                      className="btn-outline !py-2 !px-4 !text-[10px]"
                    >
                      Add to Cart
                    </button>
                  </div>
                </div>
              </motion.div>
            ))}
          </div>
        </div>
      </section>


      {/* ================= 7. FRAGRANCE NOTES SECTION ================= */}
      <section 
        id="notes" 
        className="relative section-padding overflow-hidden z-10"
      >
        <div className="max-w-7xl mx-auto px-6 relative z-10">
          <div className="text-center max-w-3xl mx-auto mb-16">
            <span className="text-xs uppercase tracking-[0.3em] text-[#c5a059] font-bold block mb-3">Olfactory Symphony</span>
            <h2 className="text-4xl sm:text-5xl font-bold font-serif text-white">
              A Scent That <span className="gold-gradient-text">Defines</span> You
            </h2>
            <div className="champagne-divider !my-4 !w-24 mx-auto" />
            <p className="text-sm text-[#d8d2c4]/80 font-light leading-relaxed max-w-xl mx-auto mt-2">
              RIHU blends deep, warm, and refreshing notes to create a perfume that leaves a memorable impression wherever you go.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            {[
              {
                id: "top",
                title: "Top Notes",
                sub: "First 15-30 Minutes",
                ingredients: "Fresh Citrus, Soft Spice",
                desc: "The refreshing introduction. Handpicked Sicilian lemons, wild bergamot, and a whisper of delicate cardamon rise immediately upon spraying to greet the air.",
                icon: <Droplet className="w-6 h-6 text-[#c5a059]" />,
                bg: "rgba(197,160,89,0.03)"
              },
              {
                id: "heart",
                title: "Heart Notes",
                sub: "Subsequent 3-4 Hours",
                ingredients: "Turkish Rose, Amber, Musk",
                desc: "The defining soul. Shifting gently into full-bloom Damascus rose, deep resinous warm amber, and sensual musk that forms the elegant heart of the cologne.",
                icon: <Heart className="w-6 h-6 text-[#c5a059]" />,
                bg: "rgba(229,213,183,0.03)"
              },
              {
                id: "base",
                title: "Base Notes",
                sub: "Lasting 12+ Hours",
                ingredients: "Cambodian Oud, Vanilla, Woody Notes",
                desc: "The mysterious signature trail. Premium aged organic Cambodian oud, sweet Madagascan vanilla, and dry warm cedarwood that leaves an unforgettable print.",
                icon: <Sparkles className="w-6 h-6 text-[#c5a059]" />,
                bg: "rgba(140,109,48,0.04)"
              }
            ].map((note, idx) => (
              <motion.div
                key={note.id}
                initial={{ opacity: 0, y: 30 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ delay: idx * 0.15, duration: 0.8 }}
                onMouseEnter={() => setHoveredNote(note.id)}
                onMouseLeave={() => setHoveredNote(null)}
                style={{ background: note.bg }}
                className="glass-card p-8 rounded-sm border border-[#c5a059]/15 flex flex-col justify-between space-y-6 relative overflow-hidden group"
              >
                {/* Glowing Background Glow on Hover */}
                <div className={`absolute inset-0 bg-[#c5a059]/5 opacity-0 transition-opacity duration-500 pointer-events-none ${
                  hoveredNote === note.id ? "opacity-100" : ""
                }`} />

                <div className="space-y-4 relative z-10">
                  <div className="flex items-center justify-between">
                    <div className="w-12 h-12 rounded-sm border border-[#c5a059]/20 flex items-center justify-center bg-black/50">
                      {note.icon}
                    </div>
                    <span className="text-[10px] uppercase tracking-[0.25em] text-[#c5a059] font-bold">
                      {note.sub}
                    </span>
                  </div>
                  
                  <div className="space-y-1">
                    <h3 className="text-2xl font-serif text-white">{note.title}</h3>
                    <p className="text-sm font-serif font-bold text-[#c5a059] tracking-wider">{note.ingredients}</p>
                  </div>
                  
                  <p className="text-xs text-[#d8d2c4]/75 font-light leading-relaxed">
                    {note.desc}
                  </p>
                </div>

                <div className="w-full relative z-10 pt-4 flex items-center justify-between text-[10px] uppercase tracking-[0.2em] text-[#c5a059] font-bold border-t border-[#c5a059]/10">
                  <span>Rare Essence</span>
                  <div className="w-2 h-2 rounded-full bg-[#c5a059] animate-pulse" />
                </div>
              </motion.div>
            ))}
          </div>
        </div>
      </section>


      {/* ================= 8. WHY CHOOSE RIHU SECTION ================= */}
      <section 
        id="why-rihu" 
        className="relative section-padding z-10 border-t border-b border-[#c5a059]/5"
      >
        <div className="max-w-7xl mx-auto px-6">
          <div className="text-center max-w-3xl mx-auto mb-16">
            <span className="text-xs uppercase tracking-[0.3em] text-[#c5a059] font-bold block mb-3">The Mark of Distinction</span>
            <h2 className="text-4xl sm:text-5xl font-bold font-serif text-white">
              Why Choose <span className="gold-gradient-text">RIHU</span>?
            </h2>
            <div className="h-0.5 w-12 bg-[#c5a059] mx-auto mt-4" />
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {[
              {
                title: "Long-Lasting Premium Fragrance",
                desc: "Engineered with maximum oil concentrations of organic Eaux De Parfum, assuring 12+ hours of lingering presence.",
                icon: <Clock className="w-5 h-5" />
              },
              {
                title: "Elegant and Luxurious Aroma",
                desc: "An incredible aromatic balance that radiates power, confidence, refinement, and a highly sophisticated aesthetic.",
                icon: <Sparkles className="w-5 h-5" />
              },
              {
                title: "Perfect for Daily & Events",
                desc: "Extremely versatile, transitioning seamlessly from busy boardroom meetings to elite nighttime special events.",
                icon: <Compass className="w-5 h-5" />
              },
              {
                title: "Crafted for Confident Minds",
                desc: "For leaders, dreamers, and personalities who demand their unique sensory footprint is registered instantly.",
                icon: <Award className="w-5 h-5" />
              },
              {
                title: "Premium Black Packaging",
                desc: "Housed in dense octagonal obsidian-styled glassware with heavy knurled golden caps, packed in refined boxes.",
                icon: <ShieldCheck className="w-5 h-5" />
              },
              {
                title: "Memorable Impressions",
                desc: "A breathtaking trail formulated by global master perfumers, ensuring you leave an indelible mark.",
                icon: <Heart className="w-5 h-5" />
              }
            ].map((point, idx) => (
              <motion.div
                key={point.title}
                initial={{ opacity: 0, scale: 0.95 }}
                whileInView={{ opacity: 1, scale: 1 }}
                viewport={{ once: true }}
                transition={{ delay: idx * 0.08, duration: 0.6 }}
                className="glass-card p-6 rounded-sm border border-[#c5a059]/10 relative group"
              >
                <div className="absolute inset-0 bg-[#c5a059]/5 opacity-0 group-hover:opacity-100 transition-opacity duration-300 pointer-events-none" />
                
                <div className="flex items-start gap-4">
                  <div className="w-10 h-10 rounded-sm border border-[#c5a059]/20 bg-[#0c0c0c] flex items-center justify-center text-[#c5a059] flex-shrink-0 group-hover:scale-105 transition-transform duration-300">
                    {point.icon}
                  </div>
                  <div className="space-y-2">
                    <h3 className="text-base font-serif text-white tracking-wide group-hover:text-[#c5a059] transition-colors duration-300">
                      {point.title}
                    </h3>
                    <p className="text-xs text-[#d8d2c4]/70 leading-relaxed font-light">
                      {point.desc}
                    </p>
                  </div>
                </div>
              </motion.div>
            ))}
          </div>
        </div>
      </section>


      {/* ================= 9. PREMIUM PACKAGING SECTION ================= */}
      <section 
        id="packaging" 
        ref={packagingRef}
        className="relative section-padding overflow-hidden z-10"
      >
        <div className="max-w-7xl mx-auto px-6 relative z-10">
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-12 lg:gap-20 items-center">
            
            {/* Description side */}
            <div className="lg:col-span-5 space-y-6">
              <span className="text-xs uppercase tracking-[0.3em] text-[#c5a059] font-bold block">Artisanal Unboxing</span>
              <h2 className="text-4xl sm:text-5xl font-bold font-serif leading-tight">
                Luxury From <br/>
                <span className="gold-gradient-text">Bottle to Box</span>
              </h2>
              <div className="h-0.5 w-16 bg-[#c5a059]" />
              <p className="text-[#d8d2c4] text-base font-light leading-relaxed">
                Every detail of RIHU is designed to feel premium — from the bold black bottle to the refined packaging. It is made to look elegant on your dressing table and unforgettable in your daily routine.
              </p>
              
              <ul className="space-y-3 pt-2">
                {[
                  "Rich textured velvet-matte luxury cardboard box",
                  "Elegant hand-pressed real gold foil trim design",
                  "Heavy crystalline octagonal thick-walled glass bottle",
                  "Secure precision knurled textured golden metal cap"
                ].map((item) => (
                  <li key={item} className="flex items-center gap-3 text-xs text-[#e5d5b7]/90 font-light">
                    <div className="w-1.5 h-1.5 rounded-full bg-[#c5a059]" />
                    <span>{item}</span>
                  </li>
                ))}
              </ul>
            </div>

            {/* Visual display box & bottle with parallax horizontally */}
            <div className="lg:col-span-7 flex justify-center items-center relative h-[400px] sm:h-[550px] w-full">
              {/* Gold glow behind pack */}
              <div className="absolute w-[300px] sm:w-[450px] h-[300px] sm:h-[450px] rounded-full bg-[#c5a059]/10 blur-[80px] z-0" />
              
              {/* Packaging Scene Container */}
              <div className="relative w-full h-full max-w-[500px]">
                <motion.div
                  style={{ x: packBoxX }}
                  className="absolute left-[5%] top-[10%] w-[85%] h-[80%] z-10"
                >
                  <Image
                    src="/images/rihu_packaging.png"
                    alt="RIHU Premium Packaging Box and Bottle set"
                    fill
                    className="object-contain filter drop-shadow-[0_20px_40px_rgba(0,0,0,0.85)]"
                    sizes="(max-w-7xl) 100vw, 40vw"
                  />
                </motion.div>
              </div>
            </div>

          </div>
        </div>
      </section>


      {/* ================= 10. REVIEW / TRUST SECTION ================= */}
      <section 
        id="reviews" 
        className="relative section-padding z-10 border-t border-b border-[#c5a059]/5"
      >
        <div className="max-w-7xl mx-auto px-6">
          <div className="text-center max-w-3xl mx-auto mb-16">
            <span className="text-xs uppercase tracking-[0.3em] text-[#c5a059] font-bold block mb-3">Honored Customer Voice</span>
            <h2 className="text-4xl sm:text-5xl font-bold font-serif text-white">
              Loved for Its <span className="gold-gradient-text">Lasting</span> Impression
            </h2>
            <div className="h-0.5 w-12 bg-[#c5a059] mx-auto mt-4" />
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            {[
              {
                author: "Sarah Al-Mansoori",
                role: "Fragrance Connoisseur",
                text: "RIHU feels elegant, bold, and very long lasting. I sprayed it in the morning and by evening, the beautiful woody notes were still strongly present. Simply spectacular.",
                rating: 5
              },
              {
                author: "Marcus Vance",
                role: "Executive Manager",
                text: "The fragrance smells incredibly premium and is perfect for evening wear. It has a mysterious, smoky aura that immediately gets noticed. The knurled gold cap is gorgeous.",
                rating: 5
              },
              {
                author: "Layla Hassan",
                role: "Lifestyle Blogger",
                text: "The packaging and the scent both feel so luxurious. It stands out like a beautiful design object on my vanity. The rose and amber opening notes are warm and absolute perfection.",
                rating: 5
              }
            ].map((review, idx) => (
              <motion.div
                key={review.author}
                initial={{ opacity: 0, y: 30 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ delay: idx * 0.15, duration: 0.8 }}
                className="glass-card p-8 rounded-sm border border-[#c5a059]/10 flex flex-col justify-between h-full relative"
              >
                {/* Small quote decoration */}
                <div className="text-5xl text-[#c5a059]/10 font-serif absolute top-4 left-6 pointer-events-none">&ldquo;</div>
                
                <div className="space-y-4 relative z-10">
                  {/* Stars */}
                  <div className="flex gap-1.5 text-[#c5a059]">
                    {Array.from({ length: review.rating }).map((_, i) => (
                      <Star key={i} className="w-4 h-4 fill-[#c5a059]" />
                    ))}
                  </div>
                  
                  <p className="text-sm text-[#d8d2c4]/90 font-light leading-relaxed italic">
                    &ldquo;{review.text}&rdquo;
                  </p>
                </div>
                
                <div className="champagne-divider !my-4" />

                <div className="flex items-center gap-3 relative z-10">
                  <div className="w-9 h-9 rounded-full bg-gradient-to-r from-[#c5a059] to-[#8c6d30] flex items-center justify-center font-bold text-xs text-black">
                    {review.author[0]}
                  </div>
                  <div>
                    <h4 className="text-sm font-serif text-white font-semibold">{review.author}</h4>
                    <span className="text-[9px] uppercase tracking-widest text-[#c5a059] font-medium">{review.role}</span>
                  </div>
                </div>
              </motion.div>
            ))}
          </div>
        </div>
      </section>


      {/* ================= 11. CTA SECTION ================= */}
      <section 
        ref={ctaRef}
        className="relative section-padding overflow-hidden z-10 border-b border-[#c5a059]/5"
      >
        {/* Soft moving golden rays overlay */}
        <div className="absolute inset-0 bg-[radial-gradient(circle_at_center,rgba(197,160,89,0.06)_0%,transparent_60%)] pointer-events-none" />
        
        <div className="max-w-4xl mx-auto px-6 text-center relative z-10 py-12">
          
          <motion.div
            initial={{ opacity: 0, scale: 0.95 }}
            whileInView={{ opacity: 1, scale: 1 }}
            viewport={{ once: true }}
            transition={{ duration: 1 }}
            className="space-y-8"
          >
            <Sparkles className="w-8 h-8 text-[#c5a059] mx-auto animate-pulse" />
            
            <h2 className="text-5xl sm:text-6xl font-bold font-serif leading-tight">
              Experience Luxury <br/>in <span className="gold-gradient-text">Every Drop</span>
            </h2>
            
            <p className="text-[#d8d2c4] text-lg font-light max-w-xl mx-auto leading-relaxed">
              Discover the power of a fragrance that speaks before you do. Claim your signature today.
            </p>

            <div className="flex flex-col sm:flex-row gap-4 justify-center items-center pt-4">
              <button
                onClick={() => handleWhatsAppCheckout()}
                className="btn-gold !py-3.5 !px-8 text-center justify-center w-full sm:w-auto"
              >
                Order Now on WhatsApp
              </button>
              <button
                onClick={() => scrollToSection("collection")}
                className="btn-outline !py-3.5 !px-8 text-center justify-center w-full sm:w-auto"
              >
                View Collection
              </button>
            </div>
          </motion.div>
          
        </div>
      </section>


      {/* ================= 12. CONTACT SECTION ================= */}
      <section 
        id="contact" 
        className="relative section-padding z-10"
      >
        <div className="max-w-7xl mx-auto px-6">
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-12 lg:gap-20 items-stretch">
            
            {/* Contact Information card */}
            <div className="lg:col-span-5 flex flex-col justify-between space-y-12">
              <div className="space-y-6">
                <span className="text-xs uppercase tracking-[0.3em] text-[#c5a059] font-bold block">Exclusive Service</span>
                <h2 className="text-4xl sm:text-5xl font-bold font-serif text-white leading-tight">
                  Get in <span className="gold-gradient-text">Touch</span>
                </h2>
                <p className="text-[#d8d2c4] font-light leading-relaxed max-w-sm">
                  For orders, custom gifting, corporate enquiries, or customized scent requests, contact our boutique team today.
                </p>
              </div>

              <div className="space-y-6 pt-4">
                <a 
                  href="https://wa.me/971501234567" 
                  target="_blank" 
                  rel="noopener noreferrer" 
                  className="flex items-center gap-4 group cursor-pointer"
                >
                  <div className="w-10 h-10 rounded-sm border border-[#c5a059]/20 bg-[#0a0a0a] flex items-center justify-center text-[#c5a059] group-hover:border-[#c5a059] transition-all duration-300">
                    <Phone className="w-4 h-4" />
                  </div>
                  <div>
                    <span className="text-[10px] uppercase tracking-widest text-[#c5a059] font-semibold block mb-0.5">WhatsApp Orders</span>
                    <span className="text-sm font-medium text-white group-hover:text-[#c5a059] transition-colors">+971 50 123 4567</span>
                  </div>
                </a>

                <a 
                  href="mailto:info@rihuperfume.com" 
                  className="flex items-center gap-4 group cursor-pointer"
                >
                  <div className="w-10 h-10 rounded-sm border border-[#c5a059]/20 bg-[#0a0a0a] flex items-center justify-center text-[#c5a059] group-hover:border-[#c5a059] transition-all duration-300">
                    <Mail className="w-4 h-4" />
                  </div>
                  <div>
                    <span className="text-[10px] uppercase tracking-widest text-[#c5a059] font-semibold block mb-0.5">General Enquiries</span>
                    <span className="text-sm font-medium text-white group-hover:text-[#c5a059] transition-colors">info@rihuperfume.com</span>
                  </div>
                </a>
              </div>

              <div className="text-[10px] uppercase tracking-[0.2em] text-[#d8d2c4]/40 font-light">
                RIHU Perfumes Ltd. Boutique, Jumeirah, Dubai, UAE
              </div>
            </div>

            {/* Interactive Contact Form Card */}
            <div className="lg:col-span-7">
              <div className="glass-card p-8 sm:p-10 rounded-sm h-full relative overflow-hidden">
                <AnimatePresence mode="wait">
                  {!formSubmitted ? (
                    <motion.form 
                      key="contact-form"
                      initial={{ opacity: 1 }}
                      exit={{ opacity: 0 }}
                      onSubmit={handleFormSubmit}
                      className="space-y-6"
                    >
                      <h3 className="text-2xl font-serif text-white tracking-wide mb-6">Enquiry & Bespoke Orders</h3>
                      
                      <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
                        <div>
                          <label className="luxury-label">Your Name</label>
                          <input
                            type="text"
                            required
                            placeholder="e.g. Sameer"
                            value={formData.name}
                            onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                            className="luxury-input"
                          />
                        </div>
                        
                        <div>
                          <label className="luxury-label">Phone Number</label>
                          <input
                            type="tel"
                            required
                            placeholder="e.g. +971 50 123 4567"
                            value={formData.phone}
                            onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
                            className="luxury-input"
                          />
                        </div>
                      </div>

                      <div>
                        <label className="luxury-label">Message / Order details</label>
                        <textarea
                          rows={4}
                          placeholder="What fragrance would you like to enquire about or order?"
                          value={formData.message}
                          onChange={(e) => setFormData({ ...formData, message: e.target.value })}
                          className="luxury-input resize-none"
                        />
                      </div>

                      <button
                        type="submit"
                        className="btn-gold w-full text-center py-4 flex items-center justify-center gap-2"
                      >
                        <span>Send Enquiry</span>
                        <Send className="w-4 h-4" />
                      </button>
                    </motion.form>
                  ) : (
                    <motion.div 
                      key="form-success"
                      initial={{ opacity: 0, scale: 0.95 }}
                      animate={{ opacity: 1, scale: 1 }}
                      exit={{ opacity: 0 }}
                      className="h-full flex flex-col items-center justify-center text-center space-y-6 py-12"
                    >
                      <div className="w-16 h-16 rounded-full border-2 border-[#c5a059] flex items-center justify-center text-[#c5a059] bg-[#c5a059]/10 animate-bounce">
                        <Check className="w-8 h-8" />
                      </div>
                      
                      <div className="space-y-2">
                        <h3 className="text-3xl font-serif text-white">Enquiry Received</h3>
                        <p className="text-sm text-[#c5a059] font-medium uppercase tracking-wider">With Luxury & Elegance</p>
                      </div>

                      <p className="text-xs text-[#d8d2c4]/70 max-w-sm leading-relaxed">
                        Thank you, *{formData.name}*. Our dedicated boutique representative will reach out to you via phone or WhatsApp shortly.
                      </p>
                    </motion.div>
                  )}
                </AnimatePresence>
              </div>
            </div>

          </div>
        </div>
      </section>


      {/* ================= 13. FOOTER ================= */}
      <footer className="border-t border-[#c5a059]/10 pt-16 pb-8 z-10 relative">
        <div className="max-w-7xl mx-auto px-6">
          <div className="grid grid-cols-1 md:grid-cols-4 gap-12 mb-12">
            
            {/* Column 1: Brand details */}
            <div className="space-y-4 col-span-1 md:col-span-2">
              <h3 className="text-2xl font-black tracking-[0.25em] text-white font-serif">RIHU</h3>
              <p className="text-xs text-[#d8d2c4]/70 leading-relaxed font-light max-w-sm">
                Luxury fragrance crafted for elegance and confidence. We believe scent is an intimate signature that marks your identity.
              </p>
            </div>

            {/* Column 2: Navigation Links */}
            <div>
              <h4 className="text-xs uppercase tracking-[0.2em] text-[#c5a059] font-bold mb-4">Explore</h4>
              <ul className="space-y-2.5">
                {[
                  { label: "Home", target: "home" },
                  { label: "About", target: "about" },
                  { label: "Collection", target: "collection" },
                  { label: "Contact", target: "contact" }
                ].map((link) => (
                  <li key={link.target}>
                    <button
                      onClick={() => scrollToSection(link.target)}
                      className="text-xs text-[#d8d2c4]/65 hover:text-[#c5a059] transition-colors"
                    >
                      {link.label}
                    </button>
                  </li>
                ))}
              </ul>
            </div>

            {/* Column 3: Legal/Boutique */}
            <div>
              <h4 className="text-xs uppercase tracking-[0.2em] text-[#c5a059] font-bold mb-4">Boutique hours</h4>
              <ul className="space-y-2 text-xs text-[#d8d2c4]/65 font-light">
                <li>Monday - Friday: 10:00 AM - 10:00 PM</li>
                <li>Saturday - Sunday: 11:00 AM - 11:00 PM</li>
                <li className="text-[#c5a059] font-medium mt-3">Jumeirah boutique, Dubai</li>
              </ul>
            </div>

          </div>

          <div className="champagne-divider" />

          {/* Bottom Copyright details */}
          <div className="flex flex-col sm:flex-row justify-between items-center gap-4 text-[10px] text-[#d8d2c4]/45 uppercase tracking-widest font-light">
            <span>© 2026 RIHU Perfume. All Rights Reserved.</span>
            <span>Crafted with pure luxury in Dubai</span>
          </div>
        </div>
      </footer>


      {/* ================= SHOPPING CART DRAWER ================= */}
      <AnimatePresence>
        {isCartOpen && (
          <>
            {/* Drawer Backdrop */}
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={() => setIsCartOpen(false)}
              className="fixed inset-0 z-50 bg-black/75 backdrop-blur-sm"
            />

            {/* Drawer Panel */}
            <motion.div
              initial={{ x: "100%" }}
              animate={{ x: 0 }}
              exit={{ x: "100%" }}
              transition={{ type: "tween", duration: 0.45, ease: [0.16, 1, 0.3, 1] }}
              className="fixed right-0 top-0 bottom-0 z-50 w-full max-w-md bg-[#050505] border-l border-[#c5a059]/15 flex flex-col justify-between shadow-[0_0_50px_rgba(0,0,0,0.9)]"
            >
              {/* Drawer Header */}
              <div className="p-6 border-b border-[#c5a059]/15 flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <ShoppingBag className="w-5 h-5 text-[#c5a059]" />
                  <h3 className="text-lg font-serif text-white tracking-wide">Your Luxury Bag</h3>
                </div>
                <button
                  onClick={() => setIsCartOpen(false)}
                  className="p-1.5 text-[#d8d2c4] hover:text-[#c5a059] transition-colors rounded-full hover:bg-white/5"
                >
                  <X className="w-5 h-5" />
                </button>
              </div>

              {/* Drawer Items List */}
              <div className="flex-grow p-6 overflow-y-auto space-y-4">
                {cart.length === 0 ? (
                  <div className="h-full flex flex-col items-center justify-center text-center space-y-4 py-12">
                    <ShoppingBag className="w-12 h-12 text-[#c5a059]/30 stroke-[1]" />
                    <div className="space-y-1">
                      <p className="text-sm text-white font-serif">Your shopping bag is empty</p>
                      <p className="text-[11px] text-[#d8d2c4]/50">Explore our signature collection to add elegance.</p>
                    </div>
                    <button
                      onClick={() => {
                        setIsCartOpen(false);
                        scrollToSection("collection");
                      }}
                      className="btn-outline !py-2.5 !px-5 !text-[10px]"
                    >
                      Browse Collection
                    </button>
                  </div>
                ) : (
                  cart.map((item) => (
                    <motion.div
                      key={`${item.id}-${item.size}`}
                      layout
                      className="glass-card p-4 rounded-sm flex gap-4 border border-[#c5a059]/10 relative group"
                    >
                      <div className="relative w-20 h-20 bg-[#080808] border border-[#c5a059]/10 flex-shrink-0">
                        <Image
                          src={item.image}
                          alt={item.name}
                          fill
                          className="object-cover"
                          sizes="80px"
                        />
                      </div>
                      
                      <div className="flex-grow flex flex-col justify-between">
                        <div>
                          <div className="flex justify-between items-start gap-2">
                            <h4 className="text-sm font-serif text-white font-semibold line-clamp-1">{item.name}</h4>
                            <button
                              onClick={() => removeFromCart(item.id, item.size)}
                              className="text-[#d8d2c4]/40 hover:text-[#c5a059] p-0.5 transition-colors"
                              aria-label="Remove"
                            >
                              <Trash2 className="w-3.5 h-3.5" />
                            </button>
                          </div>
                          <span className="text-[10px] text-[#c5a059] uppercase tracking-wider font-semibold">{item.size} | Eau De Parfum</span>
                        </div>

                        <div className="flex items-center justify-between pt-2">
                          <div className="flex items-center border border-[#c5a059]/20 bg-black/40">
                            <button
                              onClick={() => updateQuantity(item.id, item.size, -1)}
                              className="p-1 text-[#d8d2c4]/70 hover:text-[#c5a059] transition-colors"
                              aria-label="Decrease"
                            >
                              <Minus className="w-3 h-3" />
                            </button>
                            <span className="px-2 text-xs text-white font-medium">{item.quantity}</span>
                            <button
                              onClick={() => updateQuantity(item.id, item.size, 1)}
                              className="p-1 text-[#d8d2c4]/70 hover:text-[#c5a059] transition-colors"
                              aria-label="Increase"
                            >
                              <Plus className="w-3 h-3" />
                            </button>
                          </div>
                          <span className="text-sm font-serif font-bold text-white">AED {item.price * item.quantity}</span>
                        </div>
                      </div>
                    </motion.div>
                  ))
                )}
              </div>

              {/* Drawer Footer Summary & Checkout */}
              {cart.length > 0 && (
                <div className="p-6 border-t border-[#c5a059]/15 bg-[#070707] space-y-4">
                  <div className="space-y-2">
                    <div className="flex justify-between items-baseline text-xs text-[#d8d2c4]/65">
                      <span>Subtotal</span>
                      <span>AED {cartTotal}</span>
                    </div>
                    <div className="flex justify-between items-baseline text-xs text-[#d8d2c4]/65">
                      <span>Shipping (UAE Boutique)</span>
                      <span className="text-[#c5a059] font-medium">Complimentary</span>
                    </div>
                    <div className="champagne-divider !my-2" />
                    <div className="flex justify-between items-baseline">
                      <span className="text-sm font-serif text-white uppercase tracking-wider">Total</span>
                      <span className="text-lg font-serif font-bold text-[#c5a059]">AED {cartTotal}</span>
                    </div>
                  </div>

                  <div className="flex flex-col gap-2">
                    <button
                      onClick={() => handleWhatsAppCheckout()}
                      className="btn-gold w-full text-center py-3.5 flex items-center justify-center gap-2"
                    >
                      <span>Checkout via WhatsApp</span>
                      <Phone className="w-4 h-4" />
                    </button>
                    <button
                      onClick={() => setIsCartOpen(false)}
                      className="text-[10px] text-center text-[#d8d2c4]/50 hover:text-white uppercase tracking-widest py-2 transition-colors"
                    >
                      Continue Exploring
                    </button>
                  </div>
                </div>
              )}
            </motion.div>
          </>
        )}
      </AnimatePresence>
    </div>
  </>
  );
}
