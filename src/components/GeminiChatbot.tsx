import React, { useState, useRef, useEffect } from 'react';
import { 
  Send, 
  Trash2, 
  User, 
  Bot, 
  Sparkles, 
  RefreshCw,
  Sliders, 
  MessageSquare, 
  GraduationCap, 
  Lightbulb, 
  BookOpen, 
  ShieldCheck,
  Cpu, 
  HelpCircle,
  Copy,
  Check
} from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';

interface Message {
  id: string;
  role: 'user' | 'assistant';
  content: string;
  timestamp: string;
}

interface ChatbotRole {
  id: string;
  nameEn: string;
  nameTr: string;
  descriptionEn: string;
  descriptionTr: string;
  systemInstruction: string;
}

interface GeminiChatbotProps {
  lang: 'en' | 'tr';
  isStaticMode: boolean;
}

const CHATBOT_ROLES: ChatbotRole[] = [
  {
    id: 'academic_editor',
    nameEn: 'Elite Academic Editor',
    nameTr: 'Akademik Metin Editörü',
    descriptionEn: 'Focuses on formality, clarity, passive/active voice, cohesion, and professional Applied Linguistics phrasing.',
    descriptionTr: 'Resmiyet, netlik, etken/edilgen dengesi, tutarlılık ve profesyonel akademik anlatıma odaklanır.',
    systemInstruction: `You are an elite, highly critical Academic Editor for ELT (English Language Teaching) and Applied Linguistics manuscripts. 
Your goal is to help scholars elevate their academic writing. Focus on formal register, lexical density, hedging, active/passive voice balance, and transition clarity.
Avoid overly creative, dramatic, or colloquial phrasings. Structure suggestions precisely, and explain the grammatical transitions clearly. Match the user's language preferred (Turkish or English).`
  },
  {
    id: 'sla_theorist',
    nameEn: 'SLA Theoretical Advisor',
    nameTr: 'SLA Kuramsal Danışman',
    descriptionEn: 'Helps ground your paper into sociocultural theory, cognitive SLA models, translanguaging, or motivational frameworks.',
    descriptionTr: 'Makalenizi sosyokültürel teori, bilişsel SLA modelleri, translanguaging veya motivasyonel çerçevelere oturtmanıza yardımcı olur.',
    systemInstruction: `You are a Senior Applied Linguistics Professor specializing in SLA (Second Language Acquisition) theories.
Help the scholar ground their research into proper frameworks (e.g., Sociocultural Theory, Vygotskian scaffolding, Krashen's Input, Swain's Output, Schmidt's Noticing, Translanguaging, Norton's investment model, TBLT, CLT, CA).
Identify key constructs, guide theoretical integration, and critique conceptual alignment. Be scholarly, encouraging, and authoritative in both English and Turkish.`
  },
  {
    id: 'methodologist',
    nameEn: 'Research Methodologist',
    nameTr: 'Araştırma Yöntem Bilimci',
    descriptionEn: 'Advises on Qualitative, Quantitative, Mixed-Methods research designs, participant selection, and variables alignment.',
    descriptionTr: 'Nitel, Nicel, Karma desenler, örneklem seçimi ve değişken analizi hususlarında rehberlik eder.',
    systemInstruction: `You are an academic Methodologist in Applied Linguistics. Your job is to analyze and review research designs, instruments, and procedures.
Advise on Quantitative analysis (surveys, SPSS, pre/post tests, ANOVAs), Qualitative analysis (thematic coding, interview protocols, discourse analysis, class logs), or Mixed-Methods approaches.
Critique sample size validity, instrument credibility, and flag severe generalization scope mismatches. Match user language (Turkish or English).`
  },
  {
    id: 'citation_guardian',
    nameEn: 'Reference & Citation Guard',
    nameTr: 'Kaynak Gösterim Uzmanı',
    descriptionEn: 'Assists with APA 7th, Harvard, or Chicago style formatting, integrity review, and citation placement.',
    descriptionTr: 'APA 7, Harvard veya Chicago formatlama stilleri, biçimsel bütünlük ve kaynak tırnak yerleşimi hususlarında destek sunar.',
    systemInstruction: `You are an absolute citation formatting and bibliometrics expert specializing in APA 7th edition, Harvard, or Chicago citation guidelines for ELT Journals.
Help scholars format in-text citations, compile accurate references lists, correct typical errors (such as et al. misuse, retrieval URL formatting, or italic rules), and ensure absolute adherence to ethical standards. Match user language (Turkish or English).`
  }
];

const SUGGESTED_PROMPTS = {
  en: [
    { text: "Help me rewrite a colloquial sentence into high-level formal ELT prose.", icon: Sparkles },
    { text: "How can I integrate Vygotsky's peer-scaffolding constructs in my methodology?", icon: GraduationCap },
    { text: "Formulate a peer interview protocol for my qualitative ESL study.", icon: HelpCircle },
    { text: "Check these two journal references for any format compliance issues.", icon: BookOpen }
  ],
  tr: [
    { text: "Samimi yazılmış bir cümleyi ELT alanına uygun üst düzey akademik üsluba çevir.", icon: Sparkles },
    { text: "Araştırma yöntemime Vygotsky'nin sosyal iskelesi construct'larını nasıl entegre edebilirim?", icon: GraduationCap },
    { text: "Nitel İngilizce çalışmam için yarı yapılandırılmış görüşme formu taslağı oluştur.", icon: HelpCircle },
    { text: "Şu iki referansın APA 7 standardına uygunluğunu ve olası eksiklerini incele.", icon: BookOpen }
  ]
};

export default function GeminiChatbot({ lang, isStaticMode }: GeminiChatbotProps) {
  const [messages, setMessages] = useState<Message[]>([]);
  const [input, setInput] = useState('');
  const [selectedRoleId, setSelectedRoleId] = useState('academic_editor');
  const [selectedModel, setSelectedModel] = useState('gemini-3.5-flash');
  const [isGenerating, setIsGenerating] = useState(false);
  const [copiedId, setCopiedId] = useState<string | null>(null);

  const messagesEndRef = useRef<HTMLDivElement>(null);

  const activeRole = CHATBOT_ROLES.find(r => r.id === selectedRoleId) || CHATBOT_ROLES[0];

  // Auto-scroll on new messages
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages, isGenerating]);

  // Load chat history from localStorage on clean boot
  useEffect(() => {
    const cached = localStorage.getItem(`honorlex_chat_v1_${selectedRoleId}`);
    if (cached) {
      try {
        setMessages(JSON.parse(cached));
      } catch (e) {
        console.error("Failed to restore chat cache", e);
      }
    } else {
      // Seed initial greeting
      const greetText = lang === 'tr' 
        ? `Merhaba! Ben HonorLex ${activeRole.nameTr}. ${activeRole.descriptionTr} Konusunda size yardımcı olmaya hazırım. Bana herhangi bir soru sorabilir veya metninizi analiz ettirebilirsiniz.` 
        : `Hello! I am your HonorLex ${activeRole.nameEn}. I am ready to assist you on: ${activeRole.descriptionEn} Please pose a question, paste an excerpt, or specify your query below.`;

      setMessages([
        {
          id: 'welcome',
          role: 'assistant',
          content: greetText,
          timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
        }
      ]);
    }
  }, [selectedRoleId, lang]);

  // Save chat to localStorage whenever it changes
  const saveChatHistory = (newMsgs: Message[]) => {
    setMessages(newMsgs);
    localStorage.setItem(`honorlex_chat_v1_${selectedRoleId}`, JSON.stringify(newMsgs));
  };

  const handleClearHistory = () => {
    if (window.confirm(lang === 'tr' ? 'Bu konuşma geçmişini silmek istediğinize emin misiniz?' : 'Are you sure you want to clear your conversation history for this role?')) {
      const greetText = lang === 'tr' 
        ? `Konuşma sıfırlandı. Ben ${activeRole.nameTr}, size yardımcı olmaya hazırım.` 
        : `Conversation cleared. I am ${activeRole.nameEn}, ready to assist you.`;

      const cleared: Message[] = [
        {
          id: 'welcome-reset',
          role: 'assistant',
          content: greetText,
          timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
        }
      ];
      saveChatHistory(cleared);
    }
  };

  const executeSend = async (textToSend: string) => {
    if (!textToSend.trim() || isGenerating) return;

    const userMsg: Message = {
      id: Math.random().toString(),
      role: 'user',
      content: textToSend,
      timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
    };

    const updatedMesseges = [...messages, userMsg];
    saveChatHistory(updatedMesseges);
    setInput('');
    setIsGenerating(true);

    try {
      if (isStaticMode) {
        // High quality local simulation context
        setTimeout(() => {
          let simulatedReply = "";
          const lower = textToSend.toLowerCase();

          if (lang === 'tr') {
            simulatedReply = `[Statik Demo Modu] Merhaba! Yazdığınız konuyu inceledim ("${textToSend.slice(0, 40)}...").\n\nBu yöndeki akademik önerilerim:\n1. **Seçkin Üslup**: Belirttiğiniz ifadeleri 'investigation' yerine 'empirical exploration' veya 'critical inquiry' sözcükleriyle geliştirerek daha formal hale getirmeyi deneyin.\n2. **Kuramsal İskele**: ${activeRole.nameTr} perspektifinden, savunduğunuz argümanları son dönem (2022-2025) Applied Linguistics literatürüyle destekleyin.\n3. **Seçilen Model**: ${selectedModel} ile hızlı yanıt simüle edilmiştir. Tam sürümde gerçek yapay zeka analizi devrede olacaktır.`;
          } else {
            simulatedReply = `[Static Demo Mode] I have closely analyzed your inquiry ("${textToSend.slice(0, 40)}...").\n\nScholarly recommendations from ${activeRole.nameEn}:\n- **Structural Refinement**: Ensure clarity and robust hedging in your argument.\n- **Theoretical Connection**: Avoid informal phrasing. Consider framing this inquiry under modern second-language acquisition principles.\n- **Active Model**: Simulated using ${selectedModel} protocol. Full full-stack deployments query Gemini models in real time.`;
          }

          const modelMsg: Message = {
            id: Math.random().toString(),
            role: 'assistant',
            content: simulatedReply,
            timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
          };
          saveChatHistory([...updatedMesseges, modelMsg]);
          setIsGenerating(false);
        }, 1200);
      } else {
        // Full Server Connection
        const resp = await fetch('/api/chat', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            messages: updatedMesseges.map(m => ({ role: m.role, content: m.content })),
            roleSystemInstruction: activeRole.systemInstruction,
            model: selectedModel
          })
        });

        if (!resp.ok) {
          throw new Error("Server responded with error: " + resp.statusText);
        }

        const data = await resp.json();
        const modelMsg: Message = {
          id: Math.random().toString(),
          role: 'assistant',
          content: data.content || 'Error: Empty response from AI.',
          timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
        };
        saveChatHistory([...updatedMesseges, modelMsg]);
      }
    } catch (err: any) {
      console.error("Chat error:", err);
      const errModelMsg: Message = {
        id: Math.random().toString(),
        role: 'assistant',
        content: lang === 'tr' 
          ? `Bağlantı Hatası: Yapay zeka motoruna bağlanılamadı. Hata detayları: ${err.message || ''}. Lütfen Secrets panelinde GEMINI_API_KEY anahtarının tanımlı olduğunu kontrol edin.` 
          : `Connection Error: Unable to reach GenAI engine. System error details: ${err.message || ''}. Please verify GEMINI_API_KEY in the Secrets settings.`,
        timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
      };
      saveChatHistory([...updatedMesseges, errModelMsg]);
    } finally {
      setIsGenerating(false);
    }
  };

  const handleCopyText = (content: string, id: string) => {
    navigator.clipboard.writeText(content);
    setCopiedId(id);
    setTimeout(() => setCopiedId(null), 2000);
  };

  return (
    <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 min-h-[680px]" id="honorlex_gemini_chatbot">
      
      {/* Sidebar: Role selection, Model selection & suggestions */}
      <div className="lg:col-span-4 space-y-5">
        
        {/* Chatbot Role Switcher Card */}
        <div className="bg-slate-950/60 border border-slate-900 rounded-3xl p-5 shadow-2xl space-y-4">
          <div className="flex items-center gap-2">
            <Sliders className="w-4 h-4 text-indigo-400" />
            <h4 className="text-xs font-mono font-bold text-slate-400 uppercase tracking-widest">
              {lang === 'tr' ? 'Danışman Rolü Seç' : 'Choose Advisor Role'}
            </h4>
          </div>

          <div className="space-y-2.5">
            {CHATBOT_ROLES.map((role) => {
              const isSelected = role.id === selectedRoleId;
              return (
                <button
                  key={role.id}
                  onClick={() => setSelectedRoleId(role.id)}
                  className={`w-full text-left p-3.5 rounded-2xl border transition duration-150 cursor-pointer flex flex-col gap-1 ${
                    isSelected
                      ? 'bg-indigo-950/20 border-indigo-500/40 text-white ring-1 ring-indigo-500/10'
                      : 'bg-slate-950/40 border-slate-900 text-slate-400 hover:border-slate-800 hover:text-slate-200'
                  }`}
                >
                  <div className="flex items-center justify-between w-full">
                    <span className="text-xs font-semibold font-display flex items-center gap-1.5">
                      <GraduationCap className={`w-4 h-4 ${isSelected ? 'text-indigo-400' : 'text-slate-500'}`} />
                      {lang === 'tr' ? role.nameTr : role.nameEn}
                    </span>
                    {isSelected && (
                      <span className="h-2 w-2 rounded-full bg-indigo-400 animate-pulse" />
                    )}
                  </div>
                  <p className="text-[10px] leading-relaxed text-slate-450">
                    {lang === 'tr' ? role.descriptionTr : role.descriptionEn}
                  </p>
                </button>
              );
            })}
          </div>
        </div>

        {/* Model Parameter Card */}
        <div className="bg-slate-950/60 border border-slate-900 rounded-3xl p-5 shadow-xl space-y-4.5">
          <div className="flex items-center gap-2">
            <Cpu className="w-4 h-4 text-cyan-400" />
            <h4 className="text-xs font-mono font-bold text-slate-400 uppercase tracking-widest">
              {lang === 'tr' ? 'Akademik Kritik Modeli' : 'Academic Model Grade'}
            </h4>
          </div>

          <div className="space-y-2">
            <button
              onClick={() => setSelectedModel('gemini-3.1-pro-preview')}
              className={`w-full text-left p-3 rounded-xl border text-xs flex items-center justify-between transition cursor-pointer ${
                selectedModel === 'gemini-3.1-pro-preview'
                  ? 'bg-cyan-950/20 border-cyan-500/40 text-cyan-400'
                  : 'bg-slate-950/30 border-slate-900 text-slate-450 hover:text-slate-200'
              }`}
            >
              <div className="flex flex-col text-left">
                <span className="font-semibold">{lang === 'tr' ? 'Pro Kompleks Kritik' : 'Advanced Pro Reasoning'}</span>
                <span className="text-[9px] text-slate-500">gemini-3.1-pro-preview</span>
              </div>
              <Sparkles className="w-4 h-4 shrink-0 text-cyan-500" />
            </button>

            <button
              onClick={() => setSelectedModel('gemini-3.5-flash')}
              className={`w-full text-left p-3 rounded-xl border text-xs flex items-center justify-between transition cursor-pointer ${
                selectedModel === 'gemini-3.5-flash'
                  ? 'bg-indigo-950/20 border-indigo-500/40 text-indigo-400'
                  : 'bg-slate-950/30 border-slate-900 text-slate-450 hover:text-slate-200'
              }`}
            >
              <div className="flex flex-col text-left">
                <span className="font-semibold">{lang === 'tr' ? 'Dengeli Genel Sürüm' : 'Balanced General purpose'}</span>
                <span className="text-[9px] text-slate-500">gemini-3.5-flash</span>
              </div>
              <MessageSquare className="w-4 h-4 shrink-0 text-indigo-400" />
            </button>

            <button
              onClick={() => setSelectedModel('gemini-3.1-flash-lite')}
              className={`w-full text-left p-3 rounded-xl border text-xs flex items-center justify-between transition cursor-pointer ${
                selectedModel === 'gemini-3.1-flash-lite'
                  ? 'bg-purple-950/20 border-purple-500/40 text-purple-400'
                  : 'bg-slate-950/30 border-slate-900 text-slate-450 hover:text-slate-200'
              }`}
            >
              <div className="flex flex-col text-left">
                <span className="font-semibold">{lang === 'tr' ? 'Hızlı Lite Sürüm' : 'Fast Lite responses'}</span>
                <span className="text-[9px] text-slate-500">gemini-3.1-flash-lite</span>
              </div>
              <Sparkles className="w-4 h-4 shrink-0 text-purple-400" />
            </button>
          </div>
        </div>

      </div>

      {/* Main chat interface thread column */}
      <div className="lg:col-span-8 bg-slate-950/60 border border-slate-900 rounded-3xl flex flex-col h-[680px] overflow-hidden shadow-2xl relative">
        
        {/* Header Ribbon of Chat thread */}
        <div className="p-5 border-b border-slate-900 bg-slate-950/80 backdrop-blur-md flex items-center justify-between z-10">
          <div className="flex items-center gap-3">
            <div className="h-10 w-10 rounded-2xl bg-indigo-500/10 border border-indigo-500/20 flex items-center justify-center text-indigo-400 shrink-0">
              <Bot className="w-5 h-5 animate-pulse" />
            </div>
            <div>
              <h3 className="text-xs font-display font-black text-white uppercase tracking-wider flex items-center gap-2">
                {lang === 'tr' ? activeRole.nameTr : activeRole.nameEn}
                <span className="inline-flex items-center px-2 py-0.5 text-[8px] font-mono tracking-normal bg-slate-900 text-slate-400 border border-slate-800 rounded-full lowercase">
                  {selectedModel}
                </span>
              </h3>
              <p className="text-[10px] text-slate-500 leading-normal line-clamp-1 mt-0.5">
                {lang === 'tr' ? activeRole.descriptionTr : activeRole.descriptionEn}
              </p>
            </div>
          </div>

          <button
            onClick={handleClearHistory}
            className="p-2 text-slate-500 hover:text-red-400 transition hover:bg-red-950/10 rounded-xl cursor-pointer"
            title={lang === 'tr' ? 'Geçmişi temizle' : 'Clear chat history'}
          >
            <Trash2 className="w-4 h-4" />
          </button>
        </div>

        {/* Scrollable chat messages space */}
        <div className="flex-1 overflow-y-auto p-5 space-y-4 scrollbar-thin scrollbar-thumb-slate-900 scrollbar-track-transparent">
          <AnimatePresence initial={false}>
            {messages.map((msg) => {
              const isAI = msg.role === 'assistant';
              return (
                <motion.div
                  key={msg.id}
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  className={`flex gap-3 max-w-[85%] ${isAI ? 'mr-auto' : 'ml-auto flex-row-reverse'}`}
                >
                  <div className={`h-8 h-8 md:h-9 md:w-9 rounded-xl flex items-center justify-center shrink-0 border ${
                    isAI 
                      ? 'bg-indigo-950/50 border-indigo-550/20 text-indigo-400' 
                      : 'bg-cyan-950/50 border-cyan-550/20 text-cyan-400'
                  }`}>
                    {isAI ? <Bot className="w-4 h-4" /> : <User className="w-4 h-4" />}
                  </div>

                  <div className="space-y-1">
                    <div className={`p-4 rounded-3xl text-xs font-sans leading-relaxed whitespace-pre-wrap ${
                      isAI 
                        ? 'bg-slate-900 text-slate-200 border border-slate-850 rounded-tl-sm' 
                        : 'bg-indigo-900/10 text-slate-200 border border-indigo-500/10 rounded-tr-sm'
                    }`}>
                      {msg.content}
                    </div>
                    
                    <div className={`flex items-center gap-2 text-[9px] text-slate-500 font-mono px-1 ${
                      isAI ? 'justify-start' : 'justify-end'
                    }`}>
                      <span>{msg.timestamp}</span>
                      {isAI && (
                        <button
                          onClick={() => handleCopyText(msg.content, msg.id)}
                          className="hover:text-slate-300 transition"
                          title="Copy reply"
                        >
                          {copiedId === msg.id ? (
                            <Check className="w-3 h-3 text-emerald-400" />
                          ) : (
                            <Copy className="w-3 h-3" />
                          )}
                        </button>
                      )}
                    </div>
                  </div>
                </motion.div>
              );
            })}

            {isGenerating && (
              <motion.div
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                className="flex gap-3 max-w-[80%] mr-auto"
              >
                <div className="h-8 w-8 rounded-xl bg-indigo-950/50 border border-indigo-500/20 flex items-center justify-center text-indigo-400 shrink-0">
                  <Bot className="w-4 h-4" />
                </div>
                <div className="bg-slate-900 border border-slate-850 p-4 rounded-3xl rounded-tl-sm flex items-center gap-2">
                  <span className="w-2 h-2 rounded-full bg-indigo-400 animate-bounce" style={{ animationDelay: '0ms' }} />
                  <span className="w-2 h-2 rounded-full bg-indigo-400 animate-bounce" style={{ animationDelay: '150ms' }} />
                  <span className="w-2 h-2 rounded-full bg-indigo-400 animate-bounce" style={{ animationDelay: '300ms' }} />
                </div>
              </motion.div>
            )}
          </AnimatePresence>
          <div ref={messagesEndRef} />
        </div>

        {/* Ice-breaker suggestion labels */}
        {messages.length <= 1 && (
          <div className="px-5 pb-3">
            <span className="text-[10px] font-mono uppercase tracking-widest text-slate-500 block mb-2 font-bold select-none">
              {lang === 'tr' ? 'Popüler Başlangıç Soruları:' : 'Popular Topic Starters:'}
            </span>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
              {SUGGESTED_PROMPTS[lang].map((p, idx) => {
                const Icon = p.icon;
                return (
                  <button
                    key={idx}
                    onClick={() => setInput(p.text)}
                    className="text-left p-3 rounded-2xl bg-slate-900/30 border border-slate-900 hover:border-slate-800 text-[11px] text-slate-400 hover:text-slate-200 transition flex items-start gap-2.5 cursor-pointer"
                  >
                    <Icon className="w-4 h-4 shrink-0 text-indigo-400/80 mt-0.5" />
                    <span className="leading-snug">{p.text}</span>
                  </button>
                );
              })}
            </div>
          </div>
        )}

        {/* Form input controls footer */}
        <div className="p-4 border-t border-slate-900 bg-slate-950/80 backdrop-blur-md relative z-15">
          <form
            onSubmit={(e) => {
              e.preventDefault();
              executeSend(input);
            }}
            className="flex items-center gap-2"
          >
            <input
              type="text"
              value={input}
              onChange={(e) => setInput(e.target.value)}
              placeholder={lang === 'tr' ? 'Sorunuzu belirtiniz veya metninizi buraya yazınız...' : 'Type your academic inquiry or paste your paragraph here...'}
              className="flex-1 bg-slate-900 border border-slate-850 focus:border-indigo-505/30 focus:ring-1 focus:ring-indigo-500/20 md:text-xs text-sm text-slate-200 py-3 px-4 rounded-2xl focus:outline-none placeholder-slate-550 transition font-sans"
              disabled={isGenerating}
            />
            
            <button
              type="submit"
              disabled={!input.trim() || isGenerating}
              className="bg-indigo-600 hover:bg-indigo-550 disabled:bg-slate-900 text-white p-3 rounded-2xl disabled:text-slate-600 transition flex items-center justify-center shrink-0 cursor-pointer"
            >
              {isGenerating ? (
                <RefreshCw className="w-5 h-5 animate-spin" />
              ) : (
                <Send className="w-5 h-5" />
              )}
            </button>
          </form>
        </div>
      </div>

    </div>
  );
}
