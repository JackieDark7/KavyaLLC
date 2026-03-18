import { useState, useEffect, useRef } from "react";

// ─── Intersection Observer Hook ───
function useInView(options = {}) {
  const ref = useRef(null);
  const [isInView, setIsInView] = useState(false);
  useEffect(() => {
    const el = ref.current;
    if (!el) return;
    const observer = new IntersectionObserver(
      ([entry]) => { if (entry.isIntersecting) setIsInView(true); },
      { threshold: 0.15, ...options }
    );
    observer.observe(el);
    return () => observer.disconnect();
  }, []);
  return [ref, isInView];
}

// ─── Staggered Children Hook ───
function useStagger(isInView, count, delay = 120) {
  const [visible, setVisible] = useState(Array(count).fill(false));
  useEffect(() => {
    if (!isInView) return;
    const timers = [];
    for (let i = 0; i < count; i++) {
      timers.push(setTimeout(() => {
        setVisible(prev => { const n = [...prev]; n[i] = true; return n; });
      }, i * delay));
    }
    return () => timers.forEach(clearTimeout);
  }, [isInView]);
  return visible;
}

// ─── Smooth Parallax ───
function useParallax(speed = 0.3) {
  const ref = useRef(null);
  const [offset, setOffset] = useState(0);
  useEffect(() => {
    let ticking = false;
    const onScroll = () => {
      if (!ticking) {
        requestAnimationFrame(() => {
          if (ref.current) {
            const rect = ref.current.getBoundingClientRect();
            const center = rect.top + rect.height / 2 - window.innerHeight / 2;
            setOffset(center * speed);
          }
          ticking = false;
        });
        ticking = true;
      }
    };
    window.addEventListener("scroll", onScroll, { passive: true });
    return () => window.removeEventListener("scroll", onScroll);
  }, [speed]);
  return [ref, offset];
}

// ─── Cursor Glow ───
function CursorGlow() {
  const [pos, setPos] = useState({ x: -200, y: -200 });
  const [isMobile, setIsMobile] = useState(false);
  useEffect(() => {
    setIsMobile(window.matchMedia("(max-width: 900px)").matches || "ontouchstart" in window);
    const move = (e) => setPos({ x: e.clientX, y: e.clientY });
    window.addEventListener("mousemove", move);
    return () => window.removeEventListener("mousemove", move);
  }, []);
  if (isMobile) return null;
  return (
    <div style={{
      position: "fixed", top: 0, left: 0, width: "100vw", height: "100vh",
      pointerEvents: "none", zIndex: 9999,
      background: `radial-gradient(600px circle at ${pos.x}px ${pos.y}px, rgba(207,175,115,0.10), transparent 60%)`
    }} />
  );
}

// ─── Gold Divider ───
function GoldLine({ width = "80px", style = {} }) {
  return (
    <div style={{
      width, height: "1px",
      background: "linear-gradient(90deg, transparent, #CFAF73, transparent)",
      margin: "0 auto", ...style
    }} />
  );
}

// ─── Nav ───
function Nav() {
  const [scrolled, setScrolled] = useState(false);
  const [menuOpen, setMenuOpen] = useState(false);
  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 60);
    window.addEventListener("scroll", onScroll, { passive: true });
    return () => window.removeEventListener("scroll", onScroll);
  }, []);

  const scrollTo = (id) => {
    setMenuOpen(false);
    document.getElementById(id)?.scrollIntoView({ behavior: "smooth" });
  };

  const links = [
    { label: "About", id: "about" },
    { label: "Services", id: "services" },
    { label: "Process", id: "process" },
    { label: "Custom Projects", id: "packages" },
    { label: "Contact", id: "contact" },
  ];

  return (
    <>
      <style>{`
        .nav-wrap {
          position: fixed; top: 0; left: 0; right: 0; z-index: 1000;
          padding: ${scrolled ? "16px 40px" : "28px 40px"};
          background: ${scrolled ? "rgba(8,14,20,0.92)" : "transparent"};
          backdrop-filter: ${scrolled ? "blur(20px)" : "none"};
          border-bottom: ${scrolled ? "1px solid rgba(207,175,115,0.1)" : "none"};
          transition: all 0.5s cubic-bezier(0.16,1,0.3,1);
          display: flex; justify-content: space-between; align-items: center;
        }
        .nav-logo { font-family: 'Cormorant Garamond', serif; font-size: 22px; letter-spacing: 6px; color: #CFAF73; text-transform: uppercase; cursor: pointer; font-weight: 300; position: relative; z-index: 1001; }
        .nav-links { display: flex; gap: 36px; align-items: center; }
        .nav-link { font-family: 'Montserrat', sans-serif; font-size: 11px; letter-spacing: 3px; text-transform: uppercase; color: rgba(235,228,218,0.6); cursor: pointer; transition: color 0.3s; position: relative; background: none; border: none; padding: 0; }
        .nav-link:hover { color: #CFAF73; }
        .nav-link::after { content: ''; position: absolute; bottom: -4px; left: 50%; width: 0; height: 1px; background: #CFAF73; transition: all 0.3s; transform: translateX(-50%); }
        .nav-link:hover::after { width: 100%; }
        .nav-cta { font-family: 'Montserrat', sans-serif; font-size: 11px; letter-spacing: 2px; text-transform: uppercase; color: #080E14; background: linear-gradient(135deg, #CFAF73, #E8D5A3); padding: 10px 24px; border: none; cursor: pointer; transition: all 0.3s; }
        .nav-cta:hover { transform: translateY(-1px); box-shadow: 0 4px 20px rgba(207,175,115,0.3); }
        .hamburger { display: none; background: none; border: none; cursor: pointer; padding: 8px; position: relative; z-index: 1002; }
        .hamburger span { display: block; width: 24px; height: 1px; background: #EBE4DA; margin: 6px 0; transition: all 0.3s; }
        .mobile-menu { display: none; }
        @media (max-width: 900px) {
          .nav-wrap { padding: ${scrolled ? "14px 20px" : "20px 20px"}; background: rgba(8,14,20,0.85); backdrop-filter: blur(16px); }
          .nav-links { display: none; }
          .hamburger { display: block; }
          .mobile-menu { display: ${menuOpen ? "flex" : "none"}; position: fixed; top: 0; left: 0; right: 0; bottom: 0; background: rgba(8,14,20,0.97); backdrop-filter: blur(20px); flex-direction: column; justify-content: center; align-items: center; gap: 32px; z-index: 1001; }
          .mobile-menu button { font-family: 'Cormorant Garamond', serif; font-size: 28px; color: #EBE4DA; background: none; border: none; cursor: pointer; letter-spacing: 4px; padding: 8px 0; }
          .mobile-menu button:hover { color: #CFAF73; }
        }
      `}</style>
      <nav className="nav-wrap">
        <div className="nav-logo" onClick={() => window.scrollTo({ top: 0, behavior: "smooth" })}>Kavya</div>
        <div className="nav-links">
          {links.map(l => <button key={l.id} className="nav-link" onClick={() => scrollTo(l.id)}>{l.label}</button>)}
          <button className="nav-cta" onClick={() => scrollTo("contact")}>Book a Consultation</button>
        </div>
        <button className="hamburger" onClick={() => setMenuOpen(!menuOpen)}>
          <span style={menuOpen ? { transform: "rotate(45deg) translate(5px,5px)" } : {}} />
          <span style={menuOpen ? { opacity: 0 } : {}} />
          <span style={menuOpen ? { transform: "rotate(-45deg) translate(5px,-5px)" } : {}} />
        </button>
      </nav>
      <div className="mobile-menu">
        {links.map(l => <button key={l.id} onClick={() => scrollTo(l.id)}>{l.label}</button>)}
      </div>
    </>
  );
}

// ─── Hero ───
function Hero() {
  const [loaded, setLoaded] = useState(false);
  const [parallaxRef, offset] = useParallax(0.2);
  useEffect(() => { setTimeout(() => setLoaded(true), 200); }, []);

  return (
    <section ref={parallaxRef} style={{
      height: "100vh", display: "flex", flexDirection: "column",
      justifyContent: "center", alignItems: "center", position: "relative",
      overflow: "hidden", background: "#080E14"
    }}>
      <style>{`
        @keyframes shimmer { 0%,100% { background-position: -200% center; } 50% { background-position: 200% center; } }
        @keyframes breathe { 0%,100% { opacity: 0.3; } 50% { opacity: 0.6; } }
        @keyframes floatUp { from { opacity: 0; transform: translateY(30px); } to { opacity: 1; transform: translateY(0); } }
        @keyframes letterReveal { 
          0% { opacity: 0; transform: translateY(60px) rotateX(40deg); filter: blur(12px); } 
          50% { filter: blur(2px); }
          100% { opacity: 1; transform: translateY(0) rotateX(0deg); filter: blur(0px); } 
        }
        @keyframes luminance {
          0%, 100% { color: #EBE4DA; text-shadow: 0 0 0px transparent; }
          50% { color: #F5E6C8; text-shadow: 0 0 30px rgba(207,175,115,0.3), 0 0 60px rgba(207,175,115,0.1); }
        }
        @keyframes lineExtend {
          0% { transform: scaleX(0); opacity: 0; }
          100% { transform: scaleX(1); opacity: 1; }
        }
        .kavya-letter {
          display: inline-block;
          opacity: 0;
          color: #EBE4DA;
          animation: letterReveal 1.4s cubic-bezier(0.16, 1, 0.3, 1) forwards, luminance 5s ease-in-out 2.8s infinite;
          transform-origin: center bottom;
        }
        .title-line-left, .title-line-right {
          position: absolute;
          top: 50%;
          height: 1px;
          width: clamp(30px, 6vw, 80px);
          background: linear-gradient(90deg, transparent, rgba(207,175,115,0.35));
          transform: scaleX(0);
          animation: lineExtend 1s cubic-bezier(0.16, 1, 0.3, 1) 1.6s forwards;
        }
        .title-line-left {
          right: calc(100% + clamp(12px, 2vw, 28px));
          background: linear-gradient(90deg, transparent, rgba(207,175,115,0.35));
          transform-origin: right center;
        }
        .title-line-right {
          left: calc(100% + clamp(12px, 2vw, 28px));
          background: linear-gradient(270deg, transparent, rgba(207,175,115,0.35));
          transform-origin: left center;
        }
        .hero-ornament { position: absolute; border: 1px solid rgba(207,175,115,0.08); pointer-events: none; }
        .hero-ornament-top { position: absolute; border: 1px solid rgba(207,175,115,0.08); pointer-events: none; }
        .hero-star { position: absolute; width: 2px; height: 2px; background: rgba(207,175,115,0.3); border-radius: 50%; animation: breathe 4s ease-in-out infinite; }
        @media (max-width: 900px) {
          .hero-ornament-top { display: none; }
          .hero-ornament { width: 50px !important; height: 50px !important; }
        }
      `}</style>

      {/* Ambient grain */}
      <div style={{
        position: "absolute", inset: 0, opacity: 0.03,
        backgroundImage: `url("data:image/svg+xml,%3Csvg viewBox='0 0 256 256' xmlns='http://www.w3.org/2000/svg'%3E%3Cfilter id='noise'%3E%3CfeTurbulence type='fractalNoise' baseFrequency='0.9' numOctaves='4' stitchTiles='stitch'/%3E%3C/filter%3E%3Crect width='100%25' height='100%25' filter='url(%23noise)'/%3E%3C/svg%3E")`,
        backgroundSize: "128px"
      }} />

      {/* Decorative corner frames */}
      <div className="hero-ornament-top" style={{ top: 100, left: 40, width: 80, height: 80, borderRight: "none", borderBottom: "none" }} />
      <div className="hero-ornament-top" style={{ top: 100, right: 40, width: 80, height: 80, borderLeft: "none", borderBottom: "none" }} />
      <div className="hero-ornament" style={{ bottom: 40, left: 40, width: 80, height: 80, borderRight: "none", borderTop: "none" }} />
      <div className="hero-ornament" style={{ bottom: 40, right: 40, width: 80, height: 80, borderLeft: "none", borderTop: "none" }} />

      {/* Floating stars */}
      {[
        { top: "15%", left: "20%", delay: "0s" }, { top: "25%", right: "15%", delay: "1.5s" },
        { top: "70%", left: "12%", delay: "0.8s" }, { bottom: "20%", right: "25%", delay: "2.2s" },
        { top: "45%", left: "8%", delay: "3s" }, { top: "35%", right: "8%", delay: "1s" },
      ].map((s, i) => <div key={i} className="hero-star" style={{ ...s, animationDelay: s.delay }} />)}

      {/* Radial glow */}
      <div style={{
        position: "absolute", top: "40%", left: "50%", transform: `translate(-50%, calc(-50% + ${offset}px))`,
        width: "800px", height: "800px",
        background: "radial-gradient(ellipse, rgba(207,175,115,0.06) 0%, transparent 70%)",
        pointerEvents: "none"
      }} />

      {/* Content */}
      <div style={{
        textAlign: "center", position: "relative", zIndex: 2,
        transform: `translateY(${offset}px)`,
        padding: "0 24px"
      }}>
        {/* Small pre-title */}
        <div style={{
          fontFamily: "'Montserrat', sans-serif", fontSize: "11px", letterSpacing: "6px",
          textTransform: "uppercase", color: "rgba(207,175,115,0.7)", marginBottom: "32px",
          fontWeight: 500,
          opacity: loaded ? 1 : 0, transform: loaded ? "translateY(0)" : "translateY(15px)",
          transition: "all 1s cubic-bezier(0.16,1,0.3,1) 0.3s"
        }}>
          Website Copy & Website Development
        </div>

        {/* Main title */}
        <div style={{ position: "relative", display: "inline-block", margin: "0 0 12px" }}>
          {/* Decorative flanking lines */}
          <div className="title-line-left" />
          <div className="title-line-right" />
          <h1 style={{
            fontFamily: "'Cormorant Garamond', serif", fontWeight: 300,
            fontSize: "clamp(52px, 10vw, 120px)", lineHeight: 1,
            margin: 0, position: "relative", perspective: "600px"
          }}>
            {"Kavya".split("").map((letter, i) => (
              <span key={i} className="kavya-letter" style={{
                animationDelay: `${0.5 + i * 0.18}s, ${2.8 + i * 0.4}s`,
              }}>{letter}</span>
            ))}
          </h1>
        </div>

        {/* Shimmer line under title */}
        <div style={{
          width: loaded ? "120px" : "0px", height: "1px", margin: "20px auto 28px",
          background: "linear-gradient(90deg, transparent, #CFAF73, transparent)",
          transition: "width 1.5s cubic-bezier(0.16,1,0.3,1) 0.9s"
        }} />

        {/* Tagline */}
        <p style={{
          fontFamily: "'Cormorant Garamond', serif", fontSize: "clamp(18px, 2.5vw, 26px)",
          fontWeight: 300, fontStyle: "italic", color: "rgba(235,228,218,0.7)",
          letterSpacing: "2px", margin: "0 0 48px",
          opacity: loaded ? 1 : 0, transform: loaded ? "translateY(0)" : "translateY(20px)",
          transition: "all 1s cubic-bezier(0.16,1,0.3,1) 1.1s"
        }}>
          Words that work. Stories that connect.
        </p>

        {/* CTA */}
        <button onClick={() => document.getElementById("contact")?.scrollIntoView({ behavior: "smooth" })} style={{
          fontFamily: "'Montserrat', sans-serif", fontSize: "11px", letterSpacing: "4px",
          textTransform: "uppercase", background: "transparent", color: "#CFAF73",
          border: "1px solid rgba(207,175,115,0.4)", padding: "16px 40px", cursor: "pointer",
          opacity: loaded ? 1 : 0, transform: loaded ? "translateY(0)" : "translateY(15px)",
          transition: "all 1s cubic-bezier(0.16,1,0.3,1) 1.4s"
        }}
        onMouseEnter={e => { e.target.style.background = "rgba(207,175,115,0.1)"; e.target.style.borderColor = "#CFAF73"; }}
        onMouseLeave={e => { e.target.style.background = "transparent"; e.target.style.borderColor = "rgba(207,175,115,0.4)"; }}
        >
          Begin the Work
        </button>
      </div>

      {/* Scroll indicator */}
      <div style={{
        position: "absolute", bottom: 40, left: "50%", transform: "translateX(-50%)",
        display: "flex", flexDirection: "column", alignItems: "center", gap: 8,
        opacity: loaded ? 0.4 : 0, transition: "opacity 1.5s ease 2s"
      }}>
        <div style={{
          width: "1px", height: "40px",
          background: "linear-gradient(to bottom, #CFAF73, transparent)"
        }} />
        <span style={{
          fontFamily: "'Montserrat', sans-serif", fontSize: "9px",
          letterSpacing: "3px", color: "#CFAF73", textTransform: "uppercase"
        }}>Scroll</span>
      </div>
    </section>
  );
}

// ─── About ───
function About() {
  const [ref, inView] = useInView();
  const stagger = useStagger(inView, 4, 200);

  return (
    <section id="about" ref={ref} style={{
      padding: "clamp(80px,12vw,160px) clamp(24px,6vw,80px)",
      background: "#0A1018", position: "relative", overflow: "hidden"
    }}>
      <style>{`
        .about-grid { display: grid; grid-template-columns: 1fr 1fr; gap: 80px; max-width: 1200px; margin: 0 auto; align-items: center; }
        @media (max-width: 900px) { .about-grid { grid-template-columns: 1fr; gap: 48px; } }
      `}</style>

      {/* Ambient glow */}
      <div style={{
        position: "absolute", top: "-20%", right: "-10%", width: "600px", height: "600px",
        background: "radial-gradient(ellipse, rgba(207,175,115,0.04), transparent 70%)",
        pointerEvents: "none"
      }} />

      <div className="about-grid">
        {/* Left - Title */}
        <div>
          <div style={{
            opacity: stagger[0] ? 1 : 0, transform: stagger[0] ? "translateY(0)" : "translateY(40px)",
            transition: "all 1s cubic-bezier(0.16,1,0.3,1)"
          }}>
            <span style={{
              fontFamily: "'Montserrat', sans-serif", fontSize: "11px",
              letterSpacing: "5px", textTransform: "uppercase", color: "#CFAF73"
            }}>About Us</span>
            <h2 style={{
              fontFamily: "'Cormorant Garamond', serif", fontSize: "clamp(40px,5vw,64px)",
              fontWeight: 300, color: "#EBE4DA", lineHeight: 1.15, marginTop: 16
            }}>
              What Is<br /><em style={{ fontStyle: "italic", color: "#CFAF73" }}>Kavya?</em>
            </h2>
            <GoldLine width="60px" style={{ margin: "28px 0" }} />
          </div>

          <div style={{
            display: "flex", flexDirection: "column", gap: 20,
            marginTop: 12,
            opacity: stagger[1] ? 1 : 0, transform: stagger[1] ? "translateY(0)" : "translateY(30px)",
            transition: "all 1s cubic-bezier(0.16,1,0.3,1)"
          }}>
            {[
              "Language shaped with intention and care",
              "Precision-driven editing with an artistic lens",
              "Globally informed, culturally nuanced perspective",
              "Ideal for brands that value elegance, intelligence, and credibility"
            ].map((item, i) => (
              <div key={i} style={{
                display: "flex", alignItems: "flex-start", gap: 16
              }}>
                <span style={{ color: "#CFAF73", fontSize: "8px", marginTop: 8, flexShrink: 0 }}>◆</span>
                <span style={{
                  fontFamily: "'Montserrat', sans-serif", fontSize: "13px",
                  color: "rgba(235,228,218,0.65)", letterSpacing: "0.5px", lineHeight: 1.7, fontWeight: 500
                }}>{item}</span>
              </div>
            ))}
          </div>
        </div>

        {/* Right - Description */}
        <div>
          <p style={{
            fontFamily: "'Cormorant Garamond', serif", fontSize: "clamp(20px,2.2vw,26px)",
            fontWeight: 300, fontStyle: "italic", color: "rgba(235,228,218,0.5)",
            lineHeight: 1.8, marginBottom: 32,
            opacity: stagger[2] ? 1 : 0, transform: stagger[2] ? "translateY(0)" : "translateY(30px)",
            transition: "all 1s cubic-bezier(0.16,1,0.3,1)"
          }}>
            "Kavya is the Sanskrit tradition of elevated literary expression—where language is intentional, rhythmic, and exact."
          </p>
          <p style={{
            fontFamily: "'Montserrat', sans-serif", fontSize: "15px",
            color: "rgba(235,228,218,0.6)", lineHeight: 1.9, letterSpacing: "0.3px",
            opacity: stagger[3] ? 1 : 0, transform: stagger[3] ? "translateY(0)" : "translateY(30px)",
            transition: "all 1s cubic-bezier(0.16,1,0.3,1)"
          }}>
            Kavya LLC applies this philosophy to modern communication. We help brands shape language that is polished, culturally aware, and strategically effective—because words should do more than fill space; they should resonate.
          </p>
        </div>
      </div>
    </section>
  );
}

// ─── Services ───
function Services() {
  const [ref, inView] = useInView();
  const stagger = useStagger(inView, 5, 180);
  const [expandedService, setExpandedService] = useState(null);

  const services = [
    {
      title: "Website & App Development",
      subtitle: "Design that performs",
      bullets: ["Custom-built websites & applications", "Carefully crafted with creative intentionality", "Elegant interfaces, seamless user experience, & digital presence", "Domain set up", "Integrated AI Automation"],
      icon: "⬡"
    },
    {
      title: "Website Copy",
      subtitle: "Your first digital impression",
      bullets: ["Home page messaging that clearly communicates your value", "About pages that tell your story with authenticity & purpose", "Service pages that explain your offerings with clarity & persuasion", "Calls-to-action that guide visitors toward the next step"],
      icon: "✦"
    },
    {
      title: "Brand Messaging & Voice",
      subtitle: "Building identity through language",
      bullets: ["Brand voice & tone definition", "Core messaging pillars", "Audience-aligned positioning", "Messaging frameworks for consistent communication"],
      icon: "◈"
    },
    {
      title: "Narrative & Voice Architecture",
      subtitle: "Deep strategic foundation",
      bullets: ["The story your brand is telling", "The emotional & intellectual tone of your messaging", "Language patterns that define your voice", "Narrative structures that create clarity and cohesion", "Brand voice guide", "Tone & language principles", "Messaging architecture", "Voice examples & applications"],
      icon: "❖"
    },
    {
      title: "Marketing & Campaign Copy",
      subtitle: "Words that inspire action",
      bullets: ["Email campaigns and newsletters", "Launch messaging", "Advertising and promotional copy", "Sales-driven messaging for marketing initiatives"],
      icon: "✧"
    },
    {
      title: "Copyediting & Proofreading",
      subtitle: "Polished meets precision",
      bullets: ["Line and stylistic editing", "Grammar, clarity, & flow refinement", "Brand voice consistency", "Academic & professional editing"],
      icon: "◇"
    }
  ];

  return (
    <section id="services" ref={ref} style={{
      padding: "clamp(80px,12vw,160px) clamp(24px,6vw,80px)",
      background: "#080E14", position: "relative"
    }}>
      <style>{`
        .service-card {
          border: 1px solid rgba(207,175,115,0.1); padding: 40px; cursor: pointer;
          transition: all 0.5s cubic-bezier(0.16,1,0.3,1); position: relative; overflow: hidden;
          background: rgba(207,175,115,0.02);
        }
        .service-card:hover { border-color: rgba(207,175,115,0.3); background: rgba(207,175,115,0.04); transform: translateY(-4px); }
        .service-card::before { content: ''; position: absolute; top: 0; left: 0; right: 0; height: 1px; background: linear-gradient(90deg, transparent, rgba(207,175,115,0.3), transparent); transform: scaleX(0); transition: transform 0.6s; }
        .service-card:hover::before { transform: scaleX(1); }
        .services-grid { display: grid; grid-template-columns: repeat(auto-fit, minmax(320px, 1fr)); gap: 24px; max-width: 1200px; margin: 0 auto; }
        @media (max-width: 700px) { 
          .services-grid { grid-template-columns: 1fr; }
          .service-card { padding: 28px 24px; }
        }
      `}</style>

      <div style={{ textAlign: "center", marginBottom: 80 }}>
        <span style={{
          fontFamily: "'Montserrat', sans-serif", fontSize: "11px", letterSpacing: "5px",
          textTransform: "uppercase", color: "#CFAF73",
          opacity: stagger[0] ? 1 : 0, transition: "opacity 0.8s ease"
        }}>What We Offer</span>
        <h2 style={{
          fontFamily: "'Cormorant Garamond', serif", fontSize: "clamp(36px,5vw,56px)",
          fontWeight: 300, color: "#EBE4DA", margin: "16px 0 0", lineHeight: 1.2,
          opacity: stagger[0] ? 1 : 0, transform: stagger[0] ? "translateY(0)" : "translateY(25px)",
          transition: "all 1s cubic-bezier(0.16,1,0.3,1)"
        }}>Services</h2>
        <GoldLine width="60px" style={{ marginTop: 24 }} />
      </div>

      <div className="services-grid">
        {services.map((s, i) => (
          <div key={i} className="service-card"
            onClick={() => setExpandedService(expandedService === i ? null : i)}
            style={{
              opacity: stagger[Math.min(i + 1, 4)] ? 1 : 0,
              transform: stagger[Math.min(i + 1, 4)] ? "translateY(0)" : "translateY(40px)",
              transition: `all 0.8s cubic-bezier(0.16,1,0.3,1) ${i * 0.1}s`
            }}
          >
            <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start" }}>
              <div>
                <span style={{ color: "#CFAF73", fontSize: "20px", display: "block", marginBottom: 16 }}>{s.icon}</span>
                <h3 style={{
                  fontFamily: "'Cormorant Garamond', serif", fontSize: "24px",
                  fontWeight: 400, color: "#EBE4DA", margin: "0 0 8px"
                }}>{s.title}</h3>
                <p style={{
                  fontFamily: "'Montserrat', sans-serif", fontSize: "11px",
                  letterSpacing: "2px", textTransform: "uppercase",
                  color: "rgba(207,175,115,0.6)", margin: 0
                }}>{s.subtitle}</p>
              </div>
              <span style={{
                color: "rgba(207,175,115,0.4)", fontSize: "18px",
                transform: expandedService === i ? "rotate(45deg)" : "rotate(0deg)",
                transition: "transform 0.3s"
              }}>+</span>
            </div>
            <div style={{
              maxHeight: expandedService === i ? "400px" : "0",
              overflow: "hidden", transition: "max-height 0.5s cubic-bezier(0.16,1,0.3,1)"
            }}>
              <div style={{ display: "flex", flexDirection: "column", gap: 10, marginTop: 20 }}>
                {s.bullets.map((b, j) => (
                  <div key={j} style={{ display: "flex", alignItems: "flex-start", gap: 12 }}>
                    <span style={{ color: "#CFAF73", fontSize: "6px", marginTop: 7, flexShrink: 0 }}>●</span>
                    <span style={{
                      fontFamily: "'Montserrat', sans-serif", fontSize: "13px",
                      color: "rgba(235,228,218,0.55)", lineHeight: 1.7
                    }}>{b}</span>
                  </div>
                ))}
              </div>
            </div>
          </div>
        ))}
      </div>
    </section>
  );
}

// ─── Process ───
function Process() {
  const [ref, inView] = useInView();
  const stagger = useStagger(inView, 5, 250);

  const steps = [
    { num: "01", title: "Listening", desc: "Understanding your voice, values, and audience" },
    { num: "02", title: "Composition", desc: "Writing or refining with structure and rhythm" },
    { num: "03", title: "Refinement", desc: "Editing for clarity, tone, and impact" },
    { num: "04", title: "Completion", desc: "Clean, confident copy ready for use" },
  ];

  return (
    <section id="process" ref={ref} style={{
      padding: "clamp(80px,12vw,160px) clamp(24px,6vw,80px)",
      background: "linear-gradient(180deg, #0C1219, #080E14)",
      position: "relative"
    }}>
      <style>{`
        .process-grid { display: grid; grid-template-columns: repeat(4, 1fr); gap: 1px; max-width: 1100px; margin: 0 auto; background: rgba(207,175,115,0.08); }
        .process-step { background: #0A1018; padding: 48px 32px; text-align: center; position: relative; transition: all 0.5s; }
        .process-step:hover { background: rgba(207,175,115,0.04); }
        @media (max-width: 900px) { .process-grid { grid-template-columns: 1fr 1fr; } }
        @media (max-width: 550px) { .process-grid { grid-template-columns: 1fr; } }
      `}</style>

      <div style={{ textAlign: "center", marginBottom: 80 }}>
        <span style={{
          fontFamily: "'Montserrat', sans-serif", fontSize: "11px", letterSpacing: "5px",
          textTransform: "uppercase", color: "#CFAF73",
          opacity: stagger[0] ? 1 : 0, transition: "opacity 0.8s"
        }}>How We Work</span>
        <h2 style={{
          fontFamily: "'Cormorant Garamond', serif", fontSize: "clamp(36px,5vw,56px)",
          fontWeight: 300, color: "#EBE4DA", margin: "16px 0 0",
          opacity: stagger[0] ? 1 : 0, transform: stagger[0] ? "translateY(0)" : "translateY(25px)",
          transition: "all 1s cubic-bezier(0.16,1,0.3,1)"
        }}>The Kavya Process</h2>
        <GoldLine width="60px" style={{ marginTop: 24 }} />
      </div>

      <div className="process-grid">
        {steps.map((s, i) => (
          <div key={i} className="process-step" style={{
            opacity: stagger[i + 1] ? 1 : 0,
            transform: stagger[i + 1] ? "translateY(0)" : "translateY(30px)",
            transition: `all 0.8s cubic-bezier(0.16,1,0.3,1)`
          }}>
            <span style={{
              fontFamily: "'Cormorant Garamond', serif", fontSize: "48px",
              fontWeight: 200, color: "rgba(207,175,115,0.15)", display: "block", marginBottom: 16
            }}>{s.num}</span>
            <h3 style={{
              fontFamily: "'Cormorant Garamond', serif", fontSize: "22px",
              fontWeight: 400, color: "#CFAF73", margin: "0 0 12px"
            }}>{s.title}</h3>
            <p style={{
              fontFamily: "'Montserrat', sans-serif", fontSize: "13px",
              color: "rgba(235,228,218,0.5)", lineHeight: 1.7, margin: 0
            }}>{s.desc}</p>
          </div>
        ))}
      </div>
    </section>
  );
}

// ─── Custom Projects ───
function Packages() {
  const [ref, inView] = useInView();
  const stagger = useStagger(inView, 3, 250);

  return (
    <section id="packages" ref={ref} style={{
      padding: "clamp(80px,12vw,160px) clamp(24px,6vw,80px)",
      background: "#080E14", position: "relative"
    }}>
      <div style={{
        maxWidth: "800px", margin: "0 auto", textAlign: "center"
      }}>
        <span style={{
          fontFamily: "'Montserrat', sans-serif", fontSize: "11px", letterSpacing: "5px",
          textTransform: "uppercase", color: "#CFAF73",
          opacity: stagger[0] ? 1 : 0, transition: "opacity 0.8s"
        }}>Tailored to You</span>
        <h2 style={{
          fontFamily: "'Cormorant Garamond', serif", fontSize: "clamp(36px,5vw,56px)",
          fontWeight: 300, color: "#EBE4DA", margin: "16px 0 0", lineHeight: 1.2,
          opacity: stagger[0] ? 1 : 0, transform: stagger[0] ? "translateY(0)" : "translateY(25px)",
          transition: "all 1s cubic-bezier(0.16,1,0.3,1)"
        }}>Custom Projects</h2>
        <GoldLine width="60px" style={{ marginTop: 24 }} />

        <div style={{
          marginTop: 48, border: "1px solid rgba(207,175,115,0.12)",
          padding: "clamp(40px,5vw,64px)", background: "rgba(207,175,115,0.02)",
          opacity: stagger[1] ? 1 : 0, transform: stagger[1] ? "translateY(0)" : "translateY(30px)",
          transition: "all 1s cubic-bezier(0.16,1,0.3,1)"
        }}>
          <p style={{
            fontFamily: "'Cormorant Garamond', serif", fontSize: "clamp(20px,2.5vw,28px)",
            fontWeight: 300, fontStyle: "italic", color: "rgba(235,228,218,0.7)",
            lineHeight: 1.7, margin: "0 0 24px"
          }}>
            Some projects require a tailored approach.
          </p>
          <p style={{
            fontFamily: "'Montserrat', sans-serif", fontSize: "15px",
            color: "rgba(235,228,218,0.55)", lineHeight: 1.9, letterSpacing: "0.3px",
            margin: "0 0 40px"
          }}>
            If your needs fall outside the services listed above, custom engagements are available tailored to you. Let's discuss how we can craft the perfect solution for your brand.
          </p>

          <GoldLine width="40px" style={{ marginBottom: 40 }} />

          <button
            onClick={() => document.getElementById("contact")?.scrollIntoView({ behavior: "smooth" })}
            style={{
              fontFamily: "'Montserrat', sans-serif", fontSize: "11px", letterSpacing: "4px",
              textTransform: "uppercase", background: "linear-gradient(135deg, #CFAF73, #E8D5A3)",
              color: "#080E14", border: "none", padding: "18px 44px", cursor: "pointer",
              transition: "all 0.4s",
              opacity: stagger[2] ? 1 : 0, transform: stagger[2] ? "translateY(0)" : "translateY(15px)",
            }}
            onMouseEnter={e => { e.target.style.transform = "translateY(-2px)"; e.target.style.boxShadow = "0 8px 30px rgba(207,175,115,0.25)"; }}
            onMouseLeave={e => { e.target.style.transform = "translateY(0)"; e.target.style.boxShadow = "none"; }}
          >
            Book a Consultation
          </button>
        </div>
      </div>
    </section>
  );
}

// ─── Testimonial / Pull Quote ───
function PullQuote() {
  const [ref, inView] = useInView();
  return (
    <section ref={ref} style={{
      padding: "clamp(80px,10vw,140px) clamp(24px,6vw,80px)",
      background: "linear-gradient(135deg, rgba(207,175,115,0.06), rgba(207,175,115,0.02))",
      textAlign: "center", position: "relative", overflow: "hidden"
    }}>
      <div style={{
        position: "absolute", top: "50%", left: "50%", transform: "translate(-50%,-50%)",
        fontFamily: "'Cormorant Garamond', serif", fontSize: "300px", fontWeight: 200,
        color: "rgba(207,175,115,0.04)", lineHeight: 1, pointerEvents: "none",
        userSelect: "none"
      }}>"</div>
      <blockquote style={{
        fontFamily: "'Cormorant Garamond', serif",
        fontSize: "clamp(24px,3.5vw,42px)", fontWeight: 300, fontStyle: "italic",
        color: "#EBE4DA", lineHeight: 1.6, maxWidth: "900px", margin: "0 auto",
        position: "relative", zIndex: 1,
        opacity: inView ? 1 : 0, transform: inView ? "translateY(0)" : "translateY(30px)",
        transition: "all 1.2s cubic-bezier(0.16,1,0.3,1)"
      }}>
        Words matter because they don't just speak — they <span style={{ color: "#CFAF73" }}>sell</span>.
      </blockquote>
    </section>
  );
}

// ─── Contact ───
function Contact() {
  const [ref, inView] = useInView();
  const stagger = useStagger(inView, 3, 250);
  const [hoveredField, setHoveredField] = useState(null);
  const [form, setForm] = useState({ name: "", email: "", company: "", message: "" });
  const [status, setStatus] = useState("idle"); // idle | sending | sent | error

  const handleChange = (field) => (e) => setForm(prev => ({ ...prev, [field]: e.target.value }));

  const handleSubmit = async () => {
    if (!form.name || !form.email || !form.message) {
      setStatus("validation");
      setTimeout(() => setStatus("idle"), 3000);
      return;
    }
    setStatus("sending");
    try {
      const res = await fetch("https://api.emailjs.com/api/v1.0/email/send", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          service_id: "service_a53jmzs",
          template_id: "template_n1uyt4w",
          user_id: "suvobNxScjJI0QDzt",
          template_params: {
            from_name: form.name,
            name: form.name,
            from_email: form.email,
            email: form.email,
            company: form.company,
            message: form.message,
          }
        })
      });
      if (res.ok) {
        setStatus("sent");
        setForm({ name: "", email: "", company: "", message: "" });
      } else {
        setStatus("error");
        setTimeout(() => setStatus("idle"), 4000);
      }
    } catch {
      setStatus("error");
      setTimeout(() => setStatus("idle"), 4000);
    }
  };

  const inputStyle = (id) => ({
    width: "100%", padding: "16px 0", background: "transparent",
    border: "none", borderBottom: `1px solid ${hoveredField === id ? "rgba(207,175,115,0.5)" : "rgba(207,175,115,0.15)"}`,
    color: "#EBE4DA", fontFamily: "'Montserrat', sans-serif", fontSize: "14px",
    letterSpacing: "0.5px", outline: "none", transition: "border-color 0.3s",
    boxSizing: "border-box"
  });

  const buttonLabel = {
    idle: "Send Inquiry",
    sending: "Sending...",
    sent: "Message Sent ✓",
    error: "Something went wrong",
    validation: "Please fill in all fields",
  }[status];

  const buttonBg = {
    idle: "linear-gradient(135deg, #CFAF73, #E8D5A3)",
    sending: "linear-gradient(135deg, #CFAF73, #E8D5A3)",
    sent: "linear-gradient(135deg, #6BBF8A, #8FD4A4)",
    error: "linear-gradient(135deg, #C97070, #D99090)",
    validation: "linear-gradient(135deg, #C97070, #D99090)",
  }[status];

  return (
    <section id="contact" ref={ref} style={{
      padding: "clamp(80px,12vw,160px) clamp(24px,6vw,80px)",
      background: "#080E14", position: "relative"
    }}>
      <style>{`
        .contact-grid { display: grid; grid-template-columns: 1fr 1fr; gap: 80px; max-width: 1100px; margin: 0 auto; align-items: start; }
        .contact-submit { align-self: flex-start; }
        @media (max-width: 900px) { 
          .contact-grid { grid-template-columns: 1fr; gap: 48px; } 
          .contact-submit { align-self: stretch !important; text-align: center; }
        }
        ::placeholder { color: rgba(235,228,218,0.3); }
      `}</style>

      <div className="contact-grid">
        <div style={{
          opacity: stagger[0] ? 1 : 0, transform: stagger[0] ? "translateY(0)" : "translateY(30px)",
          transition: "all 1s cubic-bezier(0.16,1,0.3,1)"
        }}>
          <span style={{
            fontFamily: "'Montserrat', sans-serif", fontSize: "11px", letterSpacing: "5px",
            textTransform: "uppercase", color: "#CFAF73"
          }}>Get in Touch</span>
          <h2 style={{
            fontFamily: "'Cormorant Garamond', serif", fontSize: "clamp(36px,5vw,56px)",
            fontWeight: 300, color: "#EBE4DA", margin: "16px 0 24px", lineHeight: 1.2
          }}>Begin the Work</h2>
          <p style={{
            fontFamily: "'Montserrat', sans-serif", fontSize: "15px",
            color: "rgba(235,228,218,0.5)", lineHeight: 1.8, marginBottom: 40
          }}>
            Have a project that deserves careful language? We'd love to hear about your brand, your vision, and how we can shape your message together.
          </p>

          <div style={{ display: "flex", flexDirection: "column", gap: 24 }}>
            {[
              { label: "Email", value: "consult@kavyallc.com" }
            ].map((c, i) => (
              <div key={i}>
                <span style={{
                  fontFamily: "'Montserrat', sans-serif", fontSize: "10px",
                  letterSpacing: "3px", textTransform: "uppercase", color: "rgba(207,175,115,0.5)"
                }}>{c.label}</span>
                <p style={{
                  fontFamily: "'Montserrat', sans-serif", fontSize: "14px",
                  color: "rgba(235,228,218,0.7)", margin: "4px 0 0", letterSpacing: "0.3px"
                }}>{c.value}</p>
              </div>
            ))}
          </div>
        </div>

        <div style={{
          opacity: stagger[1] ? 1 : 0, transform: stagger[1] ? "translateY(0)" : "translateY(30px)",
          transition: "all 1s cubic-bezier(0.16,1,0.3,1)"
        }}>
          {status === "sent" ? (
            <div style={{
              textAlign: "center", padding: "60px 20px",
              border: "1px solid rgba(107,191,138,0.2)", background: "rgba(107,191,138,0.04)",
              animation: "fadeSlide 0.5s ease forwards"
            }}>
              <div style={{
                fontSize: "40px", marginBottom: 20, opacity: 0.8
              }}>✓</div>
              <h3 style={{
                fontFamily: "'Cormorant Garamond', serif", fontSize: "28px",
                fontWeight: 300, color: "#EBE4DA", margin: "0 0 12px"
              }}>Thank You</h3>
              <p style={{
                fontFamily: "'Montserrat', sans-serif", fontSize: "14px",
                color: "rgba(235,228,218,0.55)", lineHeight: 1.7, margin: "0 0 28px"
              }}>Your inquiry has been received. We'll be in touch soon.</p>
              <button onClick={() => setStatus("idle")} style={{
                fontFamily: "'Montserrat', sans-serif", fontSize: "11px", letterSpacing: "3px",
                textTransform: "uppercase", background: "none", color: "rgba(207,175,115,0.6)",
                border: "1px solid rgba(207,175,115,0.2)", padding: "12px 28px", cursor: "pointer",
                transition: "all 0.3s"
              }}
              onMouseEnter={e => { e.target.style.borderColor = "rgba(207,175,115,0.5)"; e.target.style.color = "#CFAF73"; }}
              onMouseLeave={e => { e.target.style.borderColor = "rgba(207,175,115,0.2)"; e.target.style.color = "rgba(207,175,115,0.6)"; }}
              >Send Another</button>
            </div>
          ) : (
            <div style={{ display: "flex", flexDirection: "column", gap: 28 }}>
              <input type="text" placeholder="Your Name" value={form.name} onChange={handleChange("name")} style={inputStyle("name")}
                onFocus={() => setHoveredField("name")} onBlur={() => setHoveredField(null)} />
              <input type="email" placeholder="Email Address" value={form.email} onChange={handleChange("email")} style={inputStyle("email")}
                onFocus={() => setHoveredField("email")} onBlur={() => setHoveredField(null)} />
              <input type="text" placeholder="Company / Brand" value={form.company} onChange={handleChange("company")} style={inputStyle("company")}
                onFocus={() => setHoveredField("company")} onBlur={() => setHoveredField(null)} />
              <textarea placeholder="Tell us about your project..." rows={4} value={form.message} onChange={handleChange("message")} style={{
                ...inputStyle("msg"), resize: "vertical", minHeight: "100px"
              }}
                onFocus={() => setHoveredField("msg")} onBlur={() => setHoveredField(null)} />
              <button className="contact-submit" onClick={handleSubmit} disabled={status === "sending"} style={{
                fontFamily: "'Montserrat', sans-serif", fontSize: "11px", letterSpacing: "4px",
                textTransform: "uppercase", background: buttonBg,
                color: "#080E14", border: "none", padding: "18px 40px", cursor: status === "sending" ? "wait" : "pointer",
                transition: "all 0.4s", alignSelf: "flex-start", marginTop: 8,
                opacity: status === "sending" ? 0.7 : 1
              }}
              onMouseEnter={e => { if (status === "idle") { e.target.style.transform = "translateY(-2px)"; e.target.style.boxShadow = "0 8px 30px rgba(207,175,115,0.25)"; }}}
              onMouseLeave={e => { e.target.style.transform = "translateY(0)"; e.target.style.boxShadow = "none"; }}
              >
                {buttonLabel}
              </button>
            </div>
          )}
        </div>
      </div>
    </section>
  );
}

// ─── Footer ───
function Footer() {
  return (
    <footer style={{
      padding: "48px clamp(24px,6vw,80px)", background: "#060A0F",
      borderTop: "1px solid rgba(207,175,115,0.06)"
    }}>
      <div style={{ maxWidth: "1200px", margin: "0 auto", textAlign: "center" }}>
        <span style={{
          fontFamily: "'Montserrat', sans-serif", fontSize: "11px",
          letterSpacing: "1px", color: "rgba(235,228,218,0.25)"
        }}>© Kavya LLC — Copywriting & Copyediting</span>
      </div>
    </footer>
  );
}

// ─── Main App ───
export default function KavyaWebsite() {
  return (
    <div style={{ background: "#080E14", color: "#EBE4DA", minHeight: "100vh", overflowX: "hidden" }}>
      <CursorGlow />
      <Nav />
      <Hero />
      <About />
      <PullQuote />
      <Services />
      <Process />
      <Packages />
      <Contact />
      <Footer />
    </div>
  );
}
