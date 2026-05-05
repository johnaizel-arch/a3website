import { useState, useEffect, useMemo, type JSXElementConstructor, type ReactElement, type ReactNode, type ReactPortal } from 'react';
import { 
  Menu, X,  Calculator,
  ArrowRight, PieChart, ShieldCheck,
TrendingUp, Search, Sparkles, Loader2, ArrowUpRight, ArrowLeft
} from 'lucide-react';
import { supabase } from "./lib/supabase";


// --- GEMINI API CONFIGURATION ---
const apiKey = import.meta.env.VITE_OPENROUTER_API_KEY;
const MODEL = "poolside/laguna-xs.2:free";

const callLaguna = async (prompt: string, systemInstruction = "") => {
  let delay = 1000;

  for (let i = 0; i < 5; i++) {
    try {
      const response = await fetch("https://openrouter.ai/api/v1/chat/completions", {
        method: "POST",
        headers: {
          Authorization: `Bearer ${apiKey}`, // ✅ FIXED
          "Content-Type": "application/json",
          "HTTP-Referer": window.location.origin, // better than hardcoded localhost
          "X-Title": "My App"
        },
        body: JSON.stringify({
          model: MODEL,
          messages: [
            {
              role: "system",
              content: systemInstruction || "You are a helpful assistant."
            },
            {
              role: "user",
              content: prompt
            }
          ]
        })
      });

      if (!response.ok) {
        const errText = await response.text(); // 👈 helpful debug
        throw new Error(`API request failed: ${errText}`);
      }

      const data = await response.json();
      return data.choices?.[0]?.message?.content || "";

    } catch (error) {
      if (i === 4) throw error;
      await new Promise(resolve => setTimeout(resolve, delay));
      delay *= 2;
    }
  }
};

// --- UTILITY COMPONENTS ---

const Modal = ({ isOpen, onClose, title, children }: { isOpen: boolean; onClose: () => void; title: string; children: ReactNode }) => {
  if (!isOpen) return null;
  return (
    <div className="fixed inset-0 z-[100] flex items-center justify-center p-4">
      <div className="absolute inset-0 bg-zinc-950/80 backdrop-blur-sm" onClick={onClose} />
      <div className="relative bg-white w-full max-w-2xl rounded-[2.5rem] shadow-2xl overflow-hidden animate-in zoom-in-95 duration-300">
        <div className="px-8 py-6 border-b border-zinc-100 flex justify-between items-center bg-zinc-50/50">
          <h3 className="font-serif text-2xl italic text-zinc-950">{title}</h3>
          <button onClick={onClose} className="p-2 hover:bg-zinc-200 rounded-full transition-colors">
            <X size={20} />
          </button>
        </div>
        <div className="p-8 max-h-[80vh] overflow-y-auto">
          {children}
        </div>
      </div>
    </div>
  );
};

// --- AI POWERED COMPONENTS ---

const AuditAssistant = () => {
  const [query, setQuery] = useState("");
  const [answer, setAnswer] = useState("");
  const [isLoading, setIsLoading] = useState(false);

  const askAuditor = async () => {
    if (!query) return;
    setIsLoading(true);
    try {
      const systemInstruction = "You are an expert AI Audit Assistant for A3 Accounting in the Philippines. Provide precise, legally-aware (focused on BIR regulations), and executive-ready answers.";
      const result = await callLaguna(query, systemInstruction);
      setAnswer(result);
    } catch (err) {
      setAnswer("Our systems are currently conducting high-level reconciliations. Please try again shortly.");
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="space-y-6">
      <div className="relative">
        <textarea 
          className="w-full p-6 rounded-[2rem] bg-zinc-50 border border-zinc-200 outline-none focus:border-[#B08D57] transition-all font-light text-sm min-h-[120px]"
          placeholder="Ask a technical accounting question (e.g., 'What are the 8% flat tax rate requirements for professionals?')..."
          value={query}
          onChange={(e) => setQuery(e.target.value)}
        />
        <button 
          onClick={askAuditor}
          disabled={isLoading || !query}
          className="absolute bottom-4 right-4 p-4 bg-zinc-950 text-white rounded-2xl hover:bg-[#B08D57] transition-all disabled:opacity-30"
        >
          {isLoading ? <Loader2 className="animate-spin" size={20} /> : <ArrowUpRight size={20} />}
        </button>
      </div>
      
      {answer && (
        <div className="p-6 bg-[#B08D57]/5 border border-[#B08D57]/10 rounded-[2rem] animate-in slide-in-from-bottom-2">
          <p className="text-[10px] uppercase tracking-widest font-bold text-[#B08D57] mb-3 flex items-center gap-2">
            <Sparkles size={12} /> A3 Audit Response
          </p>
          <div className="text-zinc-700 text-sm leading-relaxed whitespace-pre-wrap font-light">{answer}</div>
          <p className="mt-4 text-[9px] text-zinc-400 italic">Disclaimer: AI generated advice. Consult with an A3 Principal regarding BIR compliance.</p>
        </div>
      )}
    </div>
  );
};

const TaxEstimator = () => {
  const [income, setIncome] = useState(500000);
  const [deductions, setDeductions] = useState(50000);
  const [aiAdvice, setAiAdvice] = useState("");
  const [isLoading, setIsLoading] = useState(false);

  // Simplified PH Corporate Tax Simulation
  const estimatedTax = useMemo(() => {
    const taxable = Math.max(0, income - deductions);
    return taxable * 0.25; 
  }, [income, deductions]);

  const formatPHP = (val: number | bigint) => {
    return new Intl.NumberFormat('en-PH', {
      style: 'currency',
      currency: 'PHP',
      maximumFractionDigits: 0
    }).format(val);
  };

  const generateAiStrategy = async () => {
    setIsLoading(true);
    try {
      const prompt = `My business in the Philippines has an annual gross income of ₱${income} and total deductions of ₱${deductions}. My estimated corporate tax is ₱${estimatedTax}. Suggest 3 high-level tax optimization strategies specifically relevant to Philippine BIR regulations.`;
      const systemInstruction = "You are a Senior Tax Strategist at A3 Accounting Philippines. Provide elite, professional advice.";
      const result = await callLaguna(prompt, systemInstruction);
      setAiAdvice(result);
    } catch (err) {
      setAiAdvice("Consultant currently unavailable. Please contact A3 directly for your tax strategy.");
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="space-y-6">
      <div className="space-y-2">
        <label className="text-[10px] uppercase tracking-widest font-bold text-zinc-400">Annual Gross Income (₱)</label>
        <input 
          type="range" min="100000" max="5000000" step="100000" 
          value={income} onChange={(e) => setIncome(Number(e.target.value))}
          className="w-full accent-[#B08D57]"
        />
        <div className="flex justify-between font-mono text-xs text-zinc-500">
          <span>₱100k</span>
          <span className="text-zinc-900 font-bold">{formatPHP(income)}</span>
          <span>₱5M</span>
        </div>
      </div>
      
      <div className="space-y-2">
        <label className="text-[10px] uppercase tracking-widest font-bold text-zinc-400">Total Deductions (₱)</label>
        <input 
          type="number" 
          value={deductions} onChange={(e) => setDeductions(Number(e.target.value))}
          className="w-full border-b border-zinc-200 py-2 outline-none focus:border-[#B08D57] font-serif text-lg"
        />
      </div>

      <div className="bg-[#B08D57]/5 p-6 rounded-3xl border border-[#B08D57]/10 text-center">
        <p className="text-[10px] uppercase tracking-[0.3em] font-bold text-[#B08D57] mb-2">Estimated Liability</p>
        <p className="text-4xl font-serif text-zinc-950">{formatPHP(estimatedTax)}</p>
      </div>

      <div className="pt-4">
        {!aiAdvice ? (
          <button 
            onClick={generateAiStrategy}
            disabled={isLoading}
            className="w-full py-4 rounded-2xl bg-zinc-950 text-white text-[11px] uppercase tracking-[0.2em] font-bold flex items-center justify-center gap-2 hover:bg-[#B08D57] transition-all disabled:opacity-50"
          >
            {isLoading ? <Loader2 className="animate-spin" size={16} /> : <Sparkles size={16} />}
            Generate ✨ PH Tax Strategy
          </button>
        ) : (
          <div className="p-6 rounded-3xl bg-zinc-50 border border-zinc-100 animate-in fade-in slide-in-from-top-4">
            <div className="flex items-center gap-2 mb-4 text-[#B08D57]">
              <Sparkles size={14} />
              <span className="text-[10px] uppercase tracking-widest font-bold">A3 Intelligence Report</span>
            </div>
            <p className="text-sm text-zinc-600 leading-relaxed whitespace-pre-wrap font-light">{aiAdvice}</p>
            <button onClick={() => setAiAdvice("")} className="mt-4 text-[10px] font-bold text-zinc-400 hover:text-zinc-950 transition-colors uppercase tracking-widest">Reset Advice</button>
          </div>
        )}
      </div>
    </div>
  );
};

// --- NAVIGATION COMPONENT ---

type NavigationProps = {
  currentPage: string;
  navigateTo: (pageId: string) => void;
  scrolled: boolean;
  onSearch: () => void;
};

const Navigation = ({ currentPage, navigateTo, scrolled, onSearch }: NavigationProps) => {
  const [isOpen, setIsOpen] = useState(false);
  const isDarkPage = currentPage === 'services';
  const isLegalPage = ['terms', 'privacy'].includes(currentPage);

  const links = [
    { id: 'home', label: 'Home' },
    { id: 'about', label: 'About' },
    { id: 'services', label: 'Services' },
    { id: 'testimonials', label: 'Clients' },
    { id: 'resources', label: 'Resources' },
    { id: 'faq', label: 'FAQ' },
    { id: 'contact', label: 'Contact' }
  ];

  const handleNav = (id: string) => {
    navigateTo(id);
    setIsOpen(false);
  };

  const getLinkColor = (linkId: string) => {
    const isActive = currentPage === linkId;
    if (scrolled || isLegalPage) {
      if (isActive) return 'bg-zinc-950 text-white shadow-lg';
      return 'text-zinc-500 hover:text-zinc-950 hover:bg-zinc-100/80';
    }
    if (isDarkPage) {
      if (isActive) return 'bg-white text-zinc-950 shadow-lg';
      return 'text-zinc-400 hover:text-white hover:bg-white/10';
    }
    if (isActive) return 'bg-zinc-950 text-white shadow-lg';
    return 'text-zinc-500 hover:text-zinc-950 hover:bg-zinc-100/50';
  };

  return (
    <>
      <div className="fixed top-0 left-0 right-0 z-50 px-4 pt-4 pointer-events-none">
        <nav className={`mx-auto max-w-7xl rounded-2xl transition-all duration-500 pointer-events-auto ${
          scrolled || isLegalPage
            ? 'bg-white/95 backdrop-blur-md shadow-xl border border-zinc-200/50 py-2'
            : (isDarkPage ? 'bg-transparent py-4' : 'bg-transparent py-4')
        }`}>
          <div className="px-6 flex justify-between items-center">
            <div className="flex items-center cursor-pointer group" onClick={() => handleNav('home')}>
              <div className={`w-10 h-10 rounded-xl flex items-center justify-center mr-3 transition-colors duration-500 shadow-xl ${
                (isDarkPage && !scrolled && !isLegalPage) ? 'bg-white' : 'bg-zinc-950'
              }`}>
                <Calculator className={`h-5 w-5 ${(isDarkPage && !scrolled && !isLegalPage) ? 'text-zinc-950' : 'text-white'}`} />
              </div>
              <span className={`font-serif font-bold text-2xl tracking-tighter transition-colors duration-500 ${
                (isDarkPage && !scrolled && !isLegalPage) ? 'text-white' : 'text-zinc-950'
              }`}>
                A3<span className="text-[#B08D57] italic">Accounting</span>
              </span>
            </div>
            
            <div className={`hidden lg:flex space-x-1 items-center px-2 py-1.5 rounded-full border transition-all duration-500 ${
              (isDarkPage && !scrolled && !isLegalPage) 
                ? 'bg-white/10 border-white/10' 
                : 'bg-white/40 border-zinc-200/50'
            }`}>
              {links.map((link) => (
                <button
                  key={link.id}
                  onClick={() => handleNav(link.id)}
                  className={`px-5 py-2 rounded-full text-[10px] uppercase tracking-[0.2em] font-bold transition-all duration-300 ${getLinkColor(link.id)}`}
                >
                  {link.label}
                </button>
              ))}
              <button 
                onClick={onSearch}
                className={`p-2 rounded-full transition-all duration-300 ${
                  (isDarkPage && !scrolled && !isLegalPage) ? 'text-white hover:bg-white/10' : 'text-zinc-500 hover:bg-zinc-100 hover:text-zinc-950'
                }`}
              >
                <Search size={16} />
              </button>
            </div>

            <div className="hidden lg:block">
              <button 
                onClick={() => handleNav('contact')}
                className={`px-8 py-3 rounded-full text-[10px] uppercase tracking-[0.2em] font-bold transition-all duration-500 shadow-lg ${
                  (isDarkPage && !scrolled && !isLegalPage) ? 'bg-white text-zinc-950 hover:bg-[#B08D57] hover:text-white' : 'bg-[#B08D57] hover:bg-zinc-950 text-white'
                }`}
              >
                Get a Quote
              </button>
            </div>

            <button 
              onClick={() => setIsOpen(!isOpen)} 
              className={`lg:hidden p-3 rounded-full shadow-md border transition-all duration-500 ${
                (isDarkPage && !scrolled && !isLegalPage) ? 'bg-zinc-800 border-zinc-700 text-white' : 'bg-white border-zinc-100'
              }`}
            >
              {isOpen ? <X size={20} /> : <Menu size={20} />}
            </button>
          </div>
        </nav>
      </div>

      {isOpen && (
        <div className="fixed inset-0 z-[60] bg-zinc-950/40 backdrop-blur-md lg:hidden pt-28 px-4">
          <div className="bg-white rounded-[2rem] p-6 flex flex-col gap-3 shadow-2xl animate-in fade-in zoom-in-95 duration-300">
            {links.map((link) => (
              <button
                key={link.id}
                onClick={() => handleNav(link.id)}
                className={`w-full text-left px-6 py-4 rounded-xl text-lg font-medium transition-all ${
                  currentPage === link.id ? 'bg-zinc-950 text-white shadow-lg' : 'text-zinc-600 hover:bg-zinc-50'
                }`}
              >
                {link.label}
              </button>
            ))}
          </div>
        </div>
      )}
    </>
  );
};

// --- LEGAL COMPONENT ---

const LegalView = ({ title, lastUpdated, content, onReturn }: { title: string; lastUpdated: string; content: { title: string; text: string }[]; onReturn: () => void }) => (
  <div className="bg-[#FAF9F6] min-h-screen pt-40 pb-24">
    <div className="max-w-4xl mx-auto px-6">
      <button 
        onClick={onReturn}
        className="flex items-center gap-2 text-[10px] uppercase tracking-[0.3em] font-bold text-zinc-400 hover:text-[#B08D57] transition-all mb-12 group"
      >
        <ArrowLeft size={14} className="group-hover:-translate-x-1 transition-transform" /> Back to Firm
      </button>

      <div className="mb-16 border-b border-zinc-200 pb-12">
        <p className="text-[#B08D57] text-[10px] uppercase tracking-[0.4em] font-bold mb-4">Official Document</p>
        <h1 className="font-serif text-5xl md:text-7xl text-zinc-950 mb-6">{title}</h1>
        <p className="text-zinc-400 text-xs uppercase tracking-widest font-bold">Revision: {lastUpdated}</p>
      </div>

      <div className="space-y-16">
        {content.map((section: { title: string | number | bigint | boolean | ReactElement<unknown, string | JSXElementConstructor<any>> | Iterable<ReactNode> | ReactPortal | Promise<string | number | bigint | boolean | ReactPortal | ReactElement<unknown, string | JSXElementConstructor<any>> | Iterable<ReactNode> | null | undefined> | null | undefined; text: string | number | bigint | boolean | ReactElement<unknown, string | JSXElementConstructor<any>> | Iterable<ReactNode> | ReactPortal | Promise<string | number | bigint | boolean | ReactPortal | ReactElement<unknown, string | JSXElementConstructor<any>> | Iterable<ReactNode> | null | undefined> | null | undefined; }, idx: number) => (
          <div key={idx} className="space-y-6 animate-in fade-in slide-in-from-bottom-4" style={{ animationDelay: `${idx * 100}ms` }}>
            <h3 className="font-serif text-2xl text-zinc-950 italic flex items-center gap-4">
              <span className="w-8 h-px bg-zinc-200" /> {section.title}
            </h3>
            <div className="text-zinc-600 font-light leading-relaxed text-lg whitespace-pre-wrap pl-12">
              {section.text}
            </div>
          </div>
        ))}
      </div>
    </div>
  </div>
);

// --- PAGE SECTIONS ---

const SectionHeading = ({ badge, title, subtitle, light = false }: { badge: string; title: string; subtitle: string; light?: boolean }) => (
  <div className="text-center mb-20 animate-in fade-in slide-in-from-bottom-4 duration-700">
    <p className={`text-[#B08D57] text-[10px] uppercase tracking-[0.4em] font-bold mb-4 ${light ? 'text-[#D4AF37]' : ''}`}>
      {badge}
    </p>
    <h2 className={`font-serif text-4xl md:text-5xl lg:text-6xl tracking-tight ${light ? 'text-white' : 'text-zinc-950'}`}>
      {title} <span className={`italic font-light ${light ? 'text-zinc-500' : 'text-zinc-400'}`}>{subtitle}</span>
    </h2>
  </div>
);

interface HomeProps {
  navigateTo: (section: string) => void;
  onOpenTool: (tool: string) => void;
}

const Home = ({ navigateTo, onOpenTool }: HomeProps) => (
  <div className="animate-in fade-in duration-1000">
    <div className="relative pt-20 pb-32 lg:pt-40 lg:pb-52 overflow-hidden">
      <div className="absolute top-0 left-1/2 -translate-x-1/2 w-full h-full max-w-6xl opacity-10 pointer-events-none">
        <div className="absolute top-20 right-0 w-96 h-96 bg-[#B08D57] rounded-full blur-[120px]" />
        <div className="absolute bottom-20 left-0 w-80 h-80 bg-zinc-400 rounded-full blur-[100px]" />
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
        <div className="flex flex-col lg:flex-row items-center gap-16 lg:gap-24">
          <div className="lg:w-3/5 text-center lg:text-left">
            <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full border border-[#B08D57]/20 bg-[#B08D57]/5 text-[#B08D57] text-[10px] uppercase tracking-widest font-bold mb-10">
              <ShieldCheck size={14} className="text-[#B08D57]" /> Certified Gold-Standard Accounting
            </div>
            <h1 className="font-serif text-5xl md:text-7xl lg:text-8xl text-zinc-950 leading-[0.95] tracking-tight mb-8">
              Precision is our <br/>
              <span className="italic font-light text-zinc-400">masterpiece.</span>
            </h1>
            <p className="text-lg md:text-xl text-zinc-500 mb-12 max-w-xl mx-auto lg:mx-0 leading-relaxed font-light">
              Architecting financial stability in the Philippines through meticulous bookkeeping, strategic tax planning, and expert corporate consulting.
            </p>
            <div className="flex flex-col sm:flex-row gap-4 justify-center lg:justify-start">
              <button 
                onClick={() => navigateTo('contact')}
                className="flex items-center justify-center px-10 py-5 text-[11px] uppercase tracking-[0.2em] font-bold rounded-full text-white bg-zinc-950 hover:bg-[#B08D57] transition-all duration-500 shadow-2xl group"
              >
                Start Partnership
                <ArrowRight className="ml-3 h-4 w-4 opacity-50 group-hover:translate-x-1 transition-transform" />
              </button>
              <button 
                onClick={() => onOpenTool('tax')}
                className="flex items-center justify-center px-10 py-5 border border-zinc-200 text-[11px] uppercase tracking-[0.2em] font-bold rounded-full text-zinc-900 bg-white hover:bg-zinc-50 transition-all duration-500 shadow-sm"
              >
                Tax Estimator
              </button>
            </div>
          </div>

          <div className="lg:w-2/5 w-full relative">
            <div className="aspect-[3/4] rounded-[3rem] overflow-hidden shadow-[0_50px_100px_-20px_rgba(0,0,0,0.2)] border border-white/50 relative">
              <img 
                src="https://images.unsplash.com/photo-1554224155-6726b3ff858f?auto=format&fit=crop&q=80" 
                className="object-cover w-full h-full grayscale hover:grayscale-0 transition-all duration-1000 scale-105" 
                alt="Executive Office" 
              />
              <div className="absolute inset-0 bg-gradient-to-t from-zinc-950/80 via-transparent to-transparent" />
              <div className="absolute bottom-12 left-10 text-white">
                <p className="font-serif text-3xl italic mb-1">A3 Reliability</p>
                <p className="text-[10px] uppercase tracking-[0.4em] text-zinc-400">Est. Precision Standards</p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  </div>
);

const About = () => (
  <div className="py-32 max-w-7xl mx-auto px-6 animate-in fade-in">
    <SectionHeading badge="The Firm" title="Legacy of" subtitle="Excellence." />
    <div className="grid grid-cols-1 lg:grid-cols-2 gap-20 items-center">
      <div className="space-y-8">
        <p className="text-2xl font-serif italic text-zinc-600 leading-relaxed">
          Founded on the principles of absolute fiscal transparency, A3 Accounting serves as the backbone for the Philippines' most ambitious enterprises.
        </p>
        <div className="space-y-6 text-zinc-500 font-light leading-relaxed">
          <p>We don't just process numbers; we architect financial systems that withstand market volatility. Our team consists of veteran CPAs and strategic advisors dedicated to the fine art of precision.</p>
          <div className="grid grid-cols-2 gap-8 pt-8">
            <div>
              <p className="text-4xl font-serif text-zinc-950 mb-2">15+</p>
              <p className="text-[10px] uppercase tracking-widest font-bold">Years Experience</p>
            </div>
            <div>
              <p className="text-4xl font-serif text-zinc-950 mb-2">2k+</p>
              <p className="text-[10px] uppercase tracking-widest font-bold">Audits Completed</p>
            </div>
          </div>
        </div>
      </div>
      <div className="bg-zinc-100 rounded-[3rem] aspect-square overflow-hidden">
        <img src="https://images.unsplash.com/photo-1497366754035-f200968a6e72?auto=format&fit=crop&q=80" className="w-full h-full object-cover grayscale" alt="Firm Interior" />
      </div>
    </div>
  </div>
);

const Services = () => {
  const services = [
    { title: "BIR Tax Compliance", desc: "Advanced liability optimization and local regulatory filing management.", icon: <ShieldCheck /> },
    { title: "Forensic Bookkeeping", desc: "Meticulous verification of assets with ledger-perfect accuracy.", icon: <PieChart /> },
    { title: "Executive Consulting", desc: "High-level fiscal advisory for mergers, acquisitions, and scaling.", icon: <TrendingUp /> },
    { title: "AI-Enhanced Auditing", desc: "Combining machine precision with human expert oversight.", icon: <Sparkles /> }
  ];

  return (
    <div className="bg-zinc-950 py-32">
      <div className="max-w-7xl mx-auto px-6">
        <SectionHeading badge="Expertise" title="Strategic" subtitle="Solutions." light />
        <div className="grid grid-cols-1 md:grid-cols-2 gap-12">
          {services.map((s, i) => (
            <div key={i} className="p-12 rounded-[2.5rem] border border-zinc-800 hover:border-[#B08D57] transition-all group">
              <div className="w-12 h-12 rounded-2xl bg-white/5 flex items-center justify-center text-[#B08D57] mb-8 group-hover:bg-[#B08D57] group-hover:text-white transition-all">
                {s.icon}
              </div>
              <h3 className="text-white font-serif text-2xl italic mb-4">{s.title}</h3>
              <p className="text-zinc-500 font-light leading-relaxed">{s.desc}</p>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};

const Testimonials = () => (
  <div className="py-32 max-w-7xl mx-auto px-6 text-center">
    <SectionHeading badge="Recognition" title="Trusted by" subtitle="Leaders." />
    <div className="max-w-4xl mx-auto italic font-serif text-3xl text-zinc-500 leading-snug">
      "A3 Accounting didn't just fix our ledgers; they transformed our entire perspective on growth. Their precision is unmatched in the industry."
      <div className="mt-12 not-italic">
        <p className="text-zinc-950 text-base font-bold uppercase tracking-widest">— Marcus Thorne, CEO Nexa Capital</p>
      </div>
    </div>
  </div>
);

const Resources = ({ onOpenTool }: { onOpenTool: (tool: string) => void }) => (
  <div className="py-32 max-w-7xl mx-auto px-6">
    <SectionHeading badge="Knowledge" title="A3 Intelligence" subtitle="Hub." />
    <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
      <div className="lg:col-span-2 bg-[#B08D57]/5 p-12 rounded-[3rem] flex flex-col justify-between">
        <div>
          <h3 className="font-serif text-3xl italic mb-6">Interactive AI Audit Assistant</h3>
          <p className="text-zinc-500 font-light mb-8 max-w-md">Our proprietary intelligence layer provides instant insights into complex tax codes and fiscal regulations.</p>
        </div>
        <button onClick={() => onOpenTool('audit')} className="self-start flex items-center gap-2 px-8 py-4 bg-zinc-950 text-white rounded-full text-[10px] uppercase tracking-widest font-bold">
          Launch Assistant <ArrowUpRight size={14} />
        </button>
      </div>
      <div className="bg-zinc-100 p-12 rounded-[3rem] flex flex-col justify-between border border-zinc-200">
        <div>
          <h3 className="font-serif text-3xl italic mb-6">Tax Estimator</h3>
          <p className="text-zinc-500 font-light mb-8">Quickly evaluate potential corporate liabilities.</p>
        </div>
        <button onClick={() => onOpenTool('tax')} className="self-start flex items-center gap-2 px-8 py-4 border border-zinc-300 rounded-full text-[10px] uppercase tracking-widest font-bold">
          Open Tool
        </button>
      </div>
    </div>
  </div>
);

const FAQ = () => {
  const faqs = [
    { q: "How does A3 handle data security?", a: "We utilize 256-bit AES encryption and siloed database architectures to ensure zero data intermingling." },
    { q: "Can I integrate my existing ERP?", a: "Yes, our team specializes in seamless bridge-building between modern ERPs and our proprietary analysis models." },
    { q: "Is the AI tool legally binding?", a: "The AI provides high-level strategic insights. Formal filings are always reviewed by a human A3 Principal." }
  ];

  return (
    <div className="py-32 max-w-3xl mx-auto px-6">
      <SectionHeading badge="Support" title="Common" subtitle="Inquiries." />
      <div className="space-y-8">
        {faqs.map((f, i) => (
          <div key={i} className="pb-8 border-b border-zinc-100">
            <h4 className="font-serif text-xl italic mb-4">{f.q}</h4>
            <p className="text-zinc-500 font-light leading-relaxed">{f.a}</p>
          </div>
        ))}
      </div>
    </div>
  );
};




const Contact = () => {
  const [name, setName] = useState<string>("");
  const [company, setCompany] = useState<string>("");
  const [email, setEmail] = useState<string>(""); // ✅ NEW
  const [message, setMessage] = useState<string>("");

  const [loading, setLoading] = useState<boolean>(false);
  const [success, setSuccess] = useState<boolean>(false);

 const handleSubmit = async () => {
  if (!name || !email || !message) {
    alert("Please fill in all required fields.");
    return;
  }

  setLoading(true);
  setSuccess(false);

  const data = {
    name: name.trim(),
    company: company?.trim() || "",
    email: email.trim(),
    message: message.trim(),
  };

  try {
    // 1. Save to DB
    const { error: dbError } = await supabase
      .from("enquiries")
      .insert([data]);

    if (dbError) throw dbError;

    // 2. Call Edge Function
    const res = await fetch(
  "https://nlraggbhknralavpouws.supabase.co/functions/v1/send-enquiry-email",
  {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify({
      name: name ?? "",
      company: company ?? "",
      email: email ?? "",
      message: message ?? "",
    }),
  }
);

    // 🔥 SAFE RESPONSE HANDLING (prevents JSON crash)
    const text = await res.text(); // always safe first

    let result;
    try {
      result = text ? JSON.parse(text) : {};
    } catch (e) {
      throw new Error("Server returned invalid JSON: " + text);
    }

    if (!res.ok) {
      throw new Error(result?.error || "Email function failed");
    }

    setSuccess(true);
    setName("");
    setCompany("");
    setEmail("");
    setMessage("");

  } catch (err) {
    console.error("Submit error:", err);
    alert(err instanceof Error ? err.message : "Failed to send enquiry");
  } finally {
    setLoading(false);
  }
};

  return (
    <div className="py-40 max-w-3xl mx-auto px-6 text-center animate-in fade-in slide-in-from-bottom-8">
      <SectionHeading
        badge="Connect"
        title="Start your"
        subtitle="Transformation."
      />

      <div className="space-y-12">
        {/* NAME + COMPANY */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-8 text-left">
          <div className="space-y-2">
            <label className="text-[10px] uppercase tracking-widest font-bold text-zinc-400">
              Full Name
            </label>
            <input
              className="w-full bg-transparent border-b border-zinc-200 py-3 outline-none focus:border-[#B08D57] transition-all font-serif italic text-2xl"
              placeholder="Julian Vance"
              value={name}
              onChange={(e) => setName(e.target.value)}
            />
          </div>

          <div className="space-y-2">
            <label className="text-[10px] uppercase tracking-widest font-bold text-zinc-400">
              Company
            </label>
            <input
              className="w-full bg-transparent border-b border-zinc-200 py-3 outline-none focus:border-[#B08D57] transition-all font-serif italic text-2xl"
              placeholder="Nexa Capital"
              value={company}
              onChange={(e) => setCompany(e.target.value)}
            />
          </div>
        </div>

        {/* EMAIL FIELD ✅ NEW */}
        <div className="space-y-2 text-left">
          <label className="text-[10px] uppercase tracking-widest font-bold text-zinc-400">
            Email Address
          </label>
          <input
            type="email"
            className="w-full bg-transparent border-b border-zinc-200 py-3 outline-none focus:border-[#B08D57] transition-all font-serif italic text-2xl"
            placeholder="you@company.com"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
          />
        </div>

        {/* MESSAGE */}
        <div className="space-y-2 text-left">
          <label className="text-[10px] uppercase tracking-widest font-bold text-zinc-400">
            Project Brief
          </label>
          <textarea
            className="w-full bg-transparent border-b border-zinc-200 py-3 outline-none focus:border-[#B08D57] transition-all font-serif italic text-xl min-h-[100px]"
            placeholder="How can we architect your success?"
            value={message}
            onChange={(e) => setMessage(e.target.value)}
          />
        </div>

        {/* SUBMIT */}
        <button
          onClick={handleSubmit}
          disabled={loading}
          className="w-full py-6 rounded-full bg-zinc-950 text-white text-[11px] uppercase tracking-[0.4em] font-bold hover:bg-[#B08D57] transition-all duration-700 shadow-2xl disabled:opacity-50"
        >
          {loading ? "Sending..." : "Send Formal Inquiry"}
        </button>

        {success && (
          <p className="text-green-500 text-sm mt-4">
            Inquiry sent successfully.
          </p>
        )}
      </div>
    </div>
  );
};

// --- MAIN APPLICATION CONTROLLER ---

export default function WebsiteApp() {
  const [currentPage, setCurrentPage] = useState('home');
  const [scrolled, setScrolled] = useState(false);
  const [isSearchOpen, setIsSearchOpen] = useState(false);
  const [activeTool, setActiveTool] = useState<string | null>(null);

  useEffect(() => {
    window.scrollTo({ top: 0, behavior: 'smooth' });
    const handleScroll = () => setScrolled(window.scrollY > 50);
    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, [currentPage]);

  const renderContent = () => {
    const commonProps = { navigateTo: setCurrentPage, onOpenTool: (tool: string) => setActiveTool(tool) };

    switch (currentPage) {
      case 'home': return <Home {...commonProps} />;
      case 'about': return <About />;
      case 'services': return <Services />;
      case 'testimonials': return <Testimonials />;
      case 'resources': return <Resources {...commonProps} />;
      case 'faq': return <FAQ />;
      case 'contact': return <Contact />;
      case 'terms': 
        return (
          <LegalView 
            title="Terms of Service" 
            lastUpdated="April 2024"
            onReturn={() => setCurrentPage('home')}
            content={[
              { title: "Service Engagement", text: "By engaging A3 Accounting, you agree to our professional protocols and fee structures as detailed in your specific Client Engagement Letter. All services are performed with meticulous care and regulatory compliance." },
              { title: "Client Obligations", text: "To maintain the integrity of our financial architecture, clients must provide full disclosure of all relevant fiscal data. Delay in data delivery may impact audit timelines and reporting precision." },
              { title: "Intellectual Property", text: "All proprietary accounting models, custom scripts, and strategic framework documents provided by A3 remain the intellectual property of the firm, licensed exclusively for your use during our partnership." },
              { title: "Digital Tools", text: "Our AI Audit Assistant and Tax Estimator tools are intended for preliminary insights. Formal financial decisions should only be executed following a direct review by an A3 Certified Principal." }
            ]}
          />
        );
      case 'privacy':
        return (
          <LegalView 
            title="Privacy Policy" 
            lastUpdated="April 2024"
            onReturn={() => setCurrentPage('home')}
            content={[
              { title: "Data Sovereignty", text: "Your financial data is treated with absolute confidentiality. We implement siloed database architectures to ensure that no client data ever intermingles with another firm's records." },
              { title: "Encryption Standards", text: "All documents uploaded to our platform are protected by 256-bit AES encryption at rest and TLS 1.3 in transit. Our infrastructure is continuously monitored for unauthorized access attempts." },
              { title: "AI Privacy Protocol", text: "Queries made to our AI Audit Assistant are processed in a zero-retention environment. We do not use your proprietary financial data to train external large language models." },
              { title: "Third-Party Disclosure", text: "A3 Accounting does not sell, trade, or rent client information to any third party. Disclosure only occurs when legally mandated by government authorities or for necessary regulatory audits." }
            ]}
          />
        );
      default: return <Home {...commonProps} />;
    }
  };

  return (
    <div
  className="min-h-screen bg-[#FAF9F6] font-sans selection:bg-[#B08D57]/30 selection:text-zinc-900"
  style={{ zoom: "115%" }}
>
      <Navigation 
        currentPage={currentPage} 
        navigateTo={setCurrentPage} 
        scrolled={scrolled} 
        onSearch={() => setIsSearchOpen(true)} 
      />
      
      <main>
        {renderContent()}
      </main>

      <footer className="bg-zinc-950 text-white pt-32 pb-16">
        <div className="max-w-7xl mx-auto px-6">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-20 mb-20">
             <div className="space-y-6">
               <div className="flex items-center">
                  <Calculator className="h-6 w-6 text-[#B08D57] mr-3" />
                  <span className="font-serif font-bold text-3xl tracking-tighter">A3<span className="text-[#B08D57] italic">Accounting</span></span>
               </div>
               <p className="text-zinc-500 font-light leading-relaxed max-w-xs">
                 Elite financial architecture for modern businesses and high-growth founders.
               </p>
             </div>
             <div className="space-y-6">
               <h4 className="text-[10px] uppercase tracking-[0.4em] font-bold text-zinc-400">Headquarters</h4>
               <p className="text-zinc-300 font-light">4th Floor, PC Building, Perez Blvd,<br/>Dagupan City, Philippines</p>
             </div>
             <div className="space-y-6">
               <h4 className="text-[10px] uppercase tracking-[0.4em] font-bold text-zinc-400">Legal & Transparency</h4>
               <div className="flex flex-col gap-3">
                  <button onClick={() => setCurrentPage('terms')} className="text-zinc-500 hover:text-[#B08D57] text-sm text-left transition-colors">Terms of Service</button>
                  <button onClick={() => setCurrentPage('privacy')} className="text-zinc-500 hover:text-[#B08D57] text-sm text-left transition-colors">Privacy Policy</button>
               </div>
             </div>
          </div>
          <div className="border-t border-zinc-900 pt-16 flex flex-col md:flex-row justify-between items-center gap-6">
            <p className="text-[10px] uppercase tracking-widest font-bold text-zinc-600">&copy; {new Date().getFullYear()} A3 Accounting Office. All Rights Reserved.</p>
          </div>
        </div>
      </footer>

      {/* SEARCH OVERLAY */}
      {isSearchOpen && (
        <div className="fixed inset-0 z-[110] bg-zinc-950/95 backdrop-blur-xl animate-in fade-in duration-300 flex flex-col items-center pt-32 px-4">
          <button onClick={() => setIsSearchOpen(false)} className="absolute top-10 right-10 text-white/50 hover:text-white">
            <X size={32} />
          </button>
          <div className="w-full max-w-3xl">
            <div className="relative">
              <Search className="absolute left-6 top-1/2 -translate-y-1/2 text-[#B08D57]" size={24} />
              <input 
                autoFocus
                type="text" 
                placeholder="Search resources, services..."
                className="w-full bg-transparent border-b border-white/20 py-8 pl-20 pr-6 text-3xl font-serif text-white outline-none focus:border-[#B08D57] transition-all"
              />
            </div>
          </div>
        </div>
      )}

      {/* TOOL MODALS */}
      <Modal isOpen={activeTool === 'tax'} onClose={() => setActiveTool(null)} title="PH Corporate Tax Estimator ✨">
        <TaxEstimator />
      </Modal>

      <Modal isOpen={activeTool === 'audit'} onClose={() => setActiveTool(null)} title="A3 Virtual Audit Assistant ✨">
        <AuditAssistant />
      </Modal>
    </div>
    
  );
}