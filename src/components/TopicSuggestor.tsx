import React, { useState, useEffect } from 'react';
import { 
  Sparkles, 
  BookOpen, 
  ArrowRight, 
  RotateCcw, 
  CheckCircle2, 
  AlertTriangle, 
  Copy, 
  Edit, 
  ListChecks, 
  RefreshCw, 
  History, 
  Plus, 
  Trash2, 
  HelpCircle, 
  Check, 
  ExternalLink,
  Save,
  Search,
  Eye,
  Info
} from 'lucide-react';

interface TopicSuggestorProps {
  isStatic?: boolean;
  lang: 'en' | 'tr';
}

interface ProposalCard {
  id: string;
  topic: string;
  title: string;
  rationale: string;
  studyType: string;
  participants: string;
  feasibility: string;
  ethical: string;
  primaryRQ: string;
  supportingRQs: string[];
  keywords: string[];
}

interface HistoryEntry {
  timestamp: string;
  idea: string;
  selectedCard: ProposalCard | null;
  cards: ProposalCard[];
  whatChanged?: string;
}

export default function TopicSuggestor({ isStatic = false, lang }: TopicSuggestorProps) {
  // Input fields
  const [idea, setIdea] = useState('');
  const [answers, setAnswers] = useState({
    studyInterest: '',
    classroomIssue: '',
    audienceGroup: '',
    sampleSize: '',
    participantCharacteristics: '',
    researchSetting: '',
    researchLocation: '',
    languagesInvolved: '',
    preferredMethod: '',
    dataSources: '',
    timeLimitations: '',
    accessLimitations: '',
    theoreticalPerspective: '',
    preferredOutcome: '',
    excludedTopics: ''
  });

  const [expandedQuestions, setExpandedQuestions] = useState(false);

  // Core generated directions
  const [cards, setCards] = useState<ProposalCard[]>([]);
  const [activeCardId, setActiveCardId] = useState<string | null>(null);
  
  // Refinement states
  const [showRefinement, setShowRefinement] = useState(false);
  const [newInfoDraft, setNewInfoDraft] = useState('');
  const [whatChangedMsg, setWhatChangedMsg] = useState('');
  
  // Loading and error indicators
  const [isGenerating, setIsGenerating] = useState(false);
  const [errorText, setErrorText] = useState('');
  
  // Title editing alternatives
  const [editingTitleCardId, setEditingTitleCardId] = useState<string | null>(null);
  const [titleAlternatives, setTitleAlternatives] = useState<Array<{ style: string, title: string }>>([]);
  const [isLoadingTitles, setIsLoadingTitles] = useState(false);
  const [isManualTitleEdit, setIsManualTitleEdit] = useState(false);
  
  // RQ editing alternatives
  const [editingRQ, setEditingRQ] = useState<{ cardId: string, index: number, original: string } | null>(null);
  const [rqAlternatives, setRqAlternatives] = useState<Array<{ question: string, explanation: string }>>([]);
  const [isLoadingRQs, setIsLoadingRQs] = useState(false);
  const [isManualRQEdit, setIsManualRQEdit] = useState(false);
  const [manualRQText, setManualRQText] = useState('');

  // Alignment check result
  const [alignmentResult, setAlignmentResult] = useState<{ status: string, warnings: string[] } | null>(null);
  const [isCheckingAlignment, setIsCheckingAlignment] = useState(false);

  // ELT Theoretical Framework Alignment result
  const [eltAlignmentResult, setEltAlignmentResult] = useState<{
    status: string;
    frameworks: Array<{ name: string; roleDescription: string }>;
    justification: string;
    scopeMismatches: string[];
    suggestions: string[];
  } | null>(null);
  const [isCheckingEltAlignment, setIsCheckingEltAlignment] = useState(false);

  // History entries
  const [history, setHistory] = useState<HistoryEntry[]>([]);
  const [showHistoryModal, setShowHistoryModal] = useState(false);

  // Notification Feed / Tooltips
  const [copyStatus, setCopyStatus] = useState<string | null>(null);

  // Local Storage trigger for persistence
  useEffect(() => {
    const savedSuggestorHistory = localStorage.getItem('honorlex_suggestor_history');
    if (savedSuggestorHistory) {
      try {
        setHistory(JSON.parse(savedSuggestorHistory));
      } catch (err) {
        console.warn("Failed to load suggestor history from local storage.");
      }
    }

    const savedState = localStorage.getItem('honorlex_suggestor__current_state');
    if (savedState) {
      try {
        const parsed = JSON.parse(savedState);
        if (parsed.idea) setIdea(parsed.idea);
        if (parsed.answers) setAnswers(parsed.answers);
        if (parsed.cards) setCards(parsed.cards);
        if (parsed.activeCardId) setActiveCardId(parsed.activeCardId);
      } catch (err) {
        console.warn("Could not reload active suggestor states.");
      }
    }
  }, []);

  const saveCurrentStateLocal = (currentCards: ProposalCard[], currentActiveId: string | null) => {
    localStorage.setItem('honorlex_suggestor__current_state', JSON.stringify({
      idea,
      answers,
      cards: currentCards,
      activeCardId: currentActiveId
    }));
  };

  const persistHistory = (newHistory: HistoryEntry[]) => {
    setHistory(newHistory);
    localStorage.setItem('honorlex_suggestor_history', JSON.stringify(newHistory));
  };

  // Helper translations for specific fields
  const trText = {
    starting_idea_title: "1. İlk Araştırma Fikriniz",
    starting_idea_label: "Erken aşamadaki araştırma fikrinizi istediğiniz detay düzeyinde açıklayın:",
    starting_idea_placeholder: "Örn: Lise düzeyinde hazırlık okuyan öğrencilerin translanguaging pratikleri üzerine bir çalışma yapmak istiyorum. Sınıf içi etkileşimi gözlemleyebilirim...",
    guiding_title: "2. İpuçları ve Kılavuz Sorular (Opsiyonel)",
    guiding_subtitle: "Kullanıcıların bu alanların tümünü doldurması kesinlikle zorunlu değildir. İstediklerinizi boş bırakabilirsiniz.",
    generate_cta: "Araştırma Önerileri Oluştur",
    generating: "Araştırma Yolları Hesaplanıyor...",
    directions_title: "3. Önerilen Araştırma Yolları",
    directions_desc: "Girdi parametrelerinize göre formüle edilmiş 3 ile 5 arası derinlemesine akademik konsept kartı aşağıdadır. İncelemek istediğiniz taslağı seçin.",
    editor_title: "4. Başlık ve Araştırma Sorusu Düzenleyicisi",
    editor_desc: "Seçili araştırmanın başlığını, odak noktalarını ve mülakat/anket sorularını optimize edin, manuel de düzenleyebilirsiniz.",
    refine_title: "5. Yeni Bilgi Ekleme & İyileştirme",
    refine_desc: "Ana fikrinize yeni faktörler, kısıtlamalar ekleyerek önerileri bütünsel olarak yeniden koordine edin.",
    alignment_title: "6. Uyum ve Fizibilite Analizi",
    alignment_desc: "Metodoloji, örneklem büyüklüğü, başlık ve araştırma soruları arasındaki bilimsel tutarlılığı değerlendirin.",
    check_alignment_cta: "Uyum ve Tutarlılık Kontrolü Başlat",
    checking_alignment: "Akademik tutarlılık analiz ediliyor...",
    elt_alignment_title: "7. ELT Kuramsal Uyum ve Kapsam Kontrolü",
    elt_alignment_desc: "Seçili araştırma konunuzu standart ELT ve Uygulamalı Dilbilim kuramsal çerçeveleriyle (örn. Sosyokültürel Teori, SLA modelleri) çapraz sorgulayın, kuramsal uyumu analiz edin ve kapsam uyuşmazlıklarını saptayın.",
    check_elt_alignment_cta: "ELT Kuramsal Uyum Kontrolü Başlat",
    checking_elt_alignment: "ELT kuramsal odağı ve kapsamı analiz ediliyor...",
    elt_frameworks_label: "Örtüşen Kuramsal Çerçeveler",
    elt_scope_mismatch_label: "Kapsam/Sınır Uyuşmazlıkları",
    elt_suggestions_label: "Öneriler ve Geliştirme Yolları",
    elt_justification_label: "Teorik Yapı Değerlendirmesi ve Gerekçe",
    elt_status_fully: "Tam Kuramsal Uyum",
    elt_status_partially: "Kısmi Kuramsal Uyum",
    elt_status_mismatch: "Kapsam/Teorik Uyuşmazlığı Saptandı",
    reset_confirm: "Tüm çalışmayı sıfırlamak ve yeni bir araştırma konusuna başlamak istediğinize emin misiniz?",
    reset_cta: "Sıfırla",
    copy_success: "Kopyalandı!",
    copy_proposal: "Tüm Öneriyi Kopyala",
    copy_title: "Başlığı Kopyala",
    copy_rq: "Soruyu Kopyala",
    history_label: "Geçmiş Öneriler",
    history_empty: "Kayıtlı konu geçmişi bulunmamaktadır.",
    ethics_feasibility_check: "Fizibilite ve Etik Ön Değerlendirmesi",
    change_title_cta: "Başlığı Değiştir",
    edit_manually_cta: "Manuel Düzenle",
    generate_alternatives_cta: "Yapay Zeka ile Alternatifler Üret",
    change_rq_cta: "Değiştir",
    back_to_cards: "Önerilere Geri Dön",
    add_info_panel_btn: "Yeni Bilgi / Veri Ekle",
    what_changed_label: "Önceki öneriye göre ne değişti?",
    interest_changed_warning: "⚠️ Dikkat: Temel odak noktanız, katılımcı veya araştırma ortamınız önemli ölçüde değişti! Önceki araştırma soruları ve başlıklar tamamen sıfırlanarak yeni odağınıza göre baştan yapılandırıldı.",
    concept_card: "Araştırma Kartı",
    study_type_label: "Önerilen Desene Göre Çalışma Tipi:",
    sample_label: "Katılımcı / Veri Kaynağı:",
    rationale_label: "Kritik Akademik Gerekçe:",
    feasibility_caution_label: "Uygulanabilirlik Notu:",
    ethics_label: "Etik / Erişim Hususları:",
    primary_rq_label: "Birincil Araştırma Sorusu (Primary RQ):",
    sub_rq_label: "Destekleyici Araştırma Soruları:",
    keywords_label: "Önerilen Anahtar Kelimeler:",
    mismatch_bad: "❌ Ciddi Uyumsuzluk Tespit Edildi",
    mismatch_warn: "⚠️ Detaylandırılması Gereken Hususlar",
    mismatch_good: "✅ Kusursuz Akademik Hizalama",
    how_to_study_q: "Ne üzerinde çalışmak istiyorsunuz?",
    problem_q: "Sizi ilgilendiren sorun, durum veya sınıf meselesi nedir?",
    participants_q: "Çalışmaya kimler katılabilir?",
    sample_size_q: "Yaklaşık katılımcı sayısı nedir?",
    participants_char_q: "Katılımcı özellikleri nelerdir?",
    edu_level_q: "Eğitim seviyesi veya araştırma ortamı nedir?",
    location_q: "Ülke, şehir, okul tipi veya araştırma mekanı?",
    languages_q: "Dahil olan dil(ler)?",
    method_q: "Olası araştırma yöntemi tercihiniz?",
    data_sources_q: "Kullanılabilecek veri kaynakları nelerdir?",
    time_q: "Zaman sınırlamaları?",
    access_q: "Erişim kısıtlamaları veya kurum izin durumları?",
    theory_q: "Tercih ettiğiniz teorik perspektif?",
    contribution_q: "Öngörülen akademik katkı?",
    excluded_q: "Çalışmak istemediğiniz başlıklar/konular nelerdir?",
    what_changed_placeholder: "Ek mülakat verisi ekledim, katılımcı sayısını 80'e çıkardım vb."
  };

  const enText = {
    starting_idea_title: "1. Your Starting Idea",
    starting_idea_label: "Describe your early research idea in any level of detail:",
    starting_idea_placeholder: "e.g., I want to study how high school prep students utilize translanguaging during EFL group projects. I can observe 2 classrooms...",
    guiding_title: "2. Optional Guiding Questions",
    guiding_subtitle: "Answering these fields is strictly optional. Skip any questions you do not wish to answer.",
    generate_cta: "Generate Research Directions",
    generating: "Mapping Research Directions...",
    directions_title: "3. Suggested Research Directions",
    directions_desc: "Based on your focus criteria, the system drafted 3 to 5 realistic research concept cards. Choose one to open and customize inside the editor below.",
    editor_title: "4. Title and Research Question Editor",
    editor_desc: "Optimize questions, change title registers, or modify text manually. All local modifications instantly update coherence checks.",
    refine_title: "5. Add New Information",
    refine_desc: "Introduce secondary constraints or contextual facts to regenerate the proposal structures holistically.",
    alignment_title: "6. Alignment and Feasibility Check",
    alignment_desc: "Measure conceptual coherence between the suggested titles, setting, data scope, and proposed research questions.",
    check_alignment_cta: "Check Alignment & Consistency",
    checking_alignment: "Executing alignment audit checks...",
    elt_alignment_title: "7. ELT Theoretical Alignment Audit",
    elt_alignment_desc: "Cross-reference your active research topic against standard ELT and Applied Linguistics theoretical frameworks (e.g., Sociocultural Theory, SLA models) to evaluate theoretical suitability and flag any scope mismatches.",
    check_elt_alignment_cta: "Check ELT Theoretical Alignment",
    checking_elt_alignment: "Auditing ELT frameworks & scope boundaries...",
    elt_frameworks_label: "Matched Theoretical Frameworks",
    elt_scope_mismatch_label: "Socio-Theoretical Scope Mismatches",
    elt_suggestions_label: "Actionable Refinement Recommendations",
    elt_justification_label: "Theoretical Layout Justification & Scholarly Critique",
    elt_status_fully: "Fully Theory-Aligned",
    elt_status_partially: "Partially Aligned",
    elt_status_mismatch: "Theoretical/Scope Mismatch Detected",
    reset_confirm: "Are you sure you want to reset the current workspace and wipe active state cards? This cannot be undone.",
    reset_cta: "Reset Workspace",
    copy_success: "Copied!",
    copy_proposal: "Copy Full Proposal",
    copy_title: "Copy Title",
    copy_rq: "Copy RQ",
    history_label: "Topic Planning History",
    history_empty: "No topic plans recorded in active session.",
    ethics_feasibility_check: "Feasibility & Ethics Safeguards",
    change_title_cta: "Change Title",
    edit_manually_cta: "Edit Manually",
    generate_alternatives_cta: "Generate Alternatives",
    change_rq_cta: "Change",
    back_to_cards: "Back to Directions",
    add_info_panel_btn: "Refine / Add New Data",
    what_changed_label: "What changed? (Brief summary for tracking)",
    interest_changed_warning: "⚠️ Focus Shuffled: The primary interest area, participant group, or research setting was substantially updated. To prevent logical mismatch, previous draft options and research questions have been fully regenerated.",
    concept_card: "Research Card",
    study_type_label: "Proposed Study Design Type:",
    sample_label: "Participant Cohort / Data Source:",
    rationale_label: "Underlying Scholarly Rationale:",
    feasibility_caution_label: "Feasibility Review:",
    ethics_label: "Ethics & Access Safeguard:",
    primary_rq_label: "Primary Research Question (Primary RQ):",
    sub_rq_label: "Supporting Research Questions:",
    keywords_label: "Suggested Keywords:",
    mismatch_bad: "❌ Concept/Method Mismatch Identified",
    mismatch_warn: "⚠️ Minor Adjustments Indicated",
    mismatch_good: "✅ Cohesive Academic Alignment",
    how_to_study_q: "What are you interested in studying?",
    problem_q: "What problem, situation, or classroom issue interests you?",
    participants_q: "Who might participate?",
    sample_size_q: "Approximate participant number",
    participants_char_q: "Participant characteristics",
    edu_level_q: "Educational level or setting",
    location_q: "Country, city, school type, or research location",
    languages_q: "Language(s) involved",
    method_q: "Possible research method",
    data_sources_q: "Available data sources",
    time_q: "Time limitations",
    access_q: "Access limitations",
    theory_q: "Preferred theoretical perspective",
    contribution_q: "Preferred research outcome or contribution",
    excluded_q: "Topics you do not want to study",
    what_changed_placeholder: "e.g., Incremented target cohort to 80, narrowed focused setting to public universities, etc."
  };

  const t = lang === 'tr' ? trText : enText;

  // Trigger main generation
  const handleGenerate = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!idea.trim() && !Object.values(answers).some(val => val.trim())) {
      setErrorText(lang === 'tr' ? "Lütfen en az bir araştırma fikri veya kılavuz soru cevabı girin." : "Please provide at least a starting idea or a guiding answer field.");
      return;
    }

    setIsGenerating(true);
    setErrorText('');
    setAlignmentResult(null);

    // Call API route
    try {
      const resp = await fetch('/api/suggestor/generate', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ idea, answers, lang })
      });

      if (!resp.ok) {
        throw new Error(`Server returned error status: ${resp.status}`);
      }

      const data = await resp.json();
      if (data.cards && data.cards.length > 0) {
        setCards(data.cards);
        setActiveCardId(data.cards[0].id);
        
        // Save to state history
        const updatedHistory = [
          {
            timestamp: new Date().toLocaleTimeString(),
            idea,
            selectedCard: data.cards[0],
            cards: data.cards,
            whatChanged: whatChangedMsg || undefined
          },
          ...history
        ];
        persistHistory(updatedHistory);
        saveCurrentStateLocal(data.cards, data.cards[0].id);
      } else {
        throw new Error("No suggestion cards returned.");
      }
    } catch (err: any) {
      setErrorText(lang === 'tr' ? `Oluşturma başarısız oldu: ${err.message}` : `Generation failed: ${err.message}`);
    } finally {
      setIsGenerating(false);
    }
  };

  // Perform title change
  const handleChangeTitleTrigger = async (card: ProposalCard) => {
    setIsLoadingTitles(true);
    setEditingTitleCardId(card.id);
    setIsManualTitleEdit(false);
    try {
      const resp = await fetch('/api/suggestor/change-title', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          title: card.title,
          topic: card.topic,
          studyType: card.studyType,
          lang
        })
      });
      const data = await resp.json();
      if (data.alternatives) {
        setTitleAlternatives(data.alternatives);
      }
    } catch (err) {
      console.error(err);
    } finally {
      setIsLoadingTitles(false);
    }
  };

  // Apply selected title alternative
  const handleApplyTitle = (newTitle: string) => {
    setCards(prev => {
      const updated = prev.map(c => c.id === editingTitleCardId ? { ...c, title: newTitle } : c);
      // Run auto trigger alignment check or clear
      setAlignmentResult(null);
      saveCurrentStateLocal(updated, activeCardId);
      return updated;
    });
    setEditingTitleCardId(null);
    setTitleAlternatives([]);
  };

  // Apply manual title edit
  const handleSaveManualTitle = (newTitle: string) => {
    setCards(prev => {
      const updated = prev.map(c => c.id === activeCardId ? { ...c, title: newTitle } : c);
      setAlignmentResult(null);
      saveCurrentStateLocal(updated, activeCardId);
      return updated;
    });
    setIsManualTitleEdit(false);
    setEditingTitleCardId(null);
  };

  // Trigger RQ change
  const handleChangeRQTrigger = async (card: ProposalCard, index: number, original_q: string) => {
    setIsLoadingRQs(true);
    setEditingRQ({ cardId: card.id, index, original: original_q });
    setIsManualRQEdit(false);
    setManualRQText(original_q);
    try {
      const resp = await fetch('/api/suggestor/change-rq', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          question: original_q,
          title: card.title,
          studyType: card.studyType,
          lang
        })
      });
      const data = await resp.json();
      if (data.alternatives) {
        setRqAlternatives(data.alternatives);
      }
    } catch (err) {
      console.error(err);
    } finally {
      setIsLoadingRQs(false);
    }
  };

  const handleApplyRQAlternative = (newRQ: string) => {
    if (!editingRQ) return;
    const { cardId, index } = editingRQ;
    setCards(prev => {
      const updated = prev.map(c => {
        if (c.id !== cardId) return c;
        if (index === -1) {
          return { ...c, primaryRQ: newRQ };
        } else {
          const sub = [...c.supportingRQs];
          sub[index] = newRQ;
          return { ...c, supportingRQs: sub };
        }
      });
      setAlignmentResult(null);
      saveCurrentStateLocal(updated, activeCardId);
      return updated;
    });
    setEditingRQ(null);
    setRqAlternatives([]);
  };

  const handleApplyManualRQ = () => {
    if (!editingRQ) return;
    const { cardId, index } = editingRQ;
    setCards(prev => {
      const updated = prev.map(c => {
        if (c.id !== cardId) return c;
        if (index === -1) {
          return { ...c, primaryRQ: manualRQText };
        } else {
          const sub = [...c.supportingRQs];
          sub[index] = manualRQText;
          return { ...c, supportingRQs: sub };
        }
      });
      setAlignmentResult(null);
      saveCurrentStateLocal(updated, activeCardId);
      return updated;
    });
    setEditingRQ(null);
    setIsManualRQEdit(false);
  };

  // Trigger interactive refinement
  const handleRegenerateWithRefinement = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newInfoDraft.trim()) return;

    setIsGenerating(true);
    setErrorText('');
    setAlignmentResult(null);

    // Conjoin new info draft to first idea/answers contextually
    const conjoinedIdea = idea + "\n\n[Additional / Revised details added by user]:\n" + newInfoDraft;
    
    // Check if interest area changed substantially
    // Basic heuristic: check if any fields in answers differ greatly from starting answers
    const hasCoreSubjectShift = newInfoDraft.toLowerCase().includes('change topic') || 
                                newInfoDraft.toLowerCase().includes('different study') ||
                                newInfoDraft.toLowerCase().includes('konuyu değiştir') ||
                                newInfoDraft.toLowerCase().includes('yeni konu');

    try {
      const resp = await fetch('/api/suggestor/generate', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ 
          idea: conjoinedIdea, 
          answers, 
          lang 
        })
      });

      if (!resp.ok) throw new Error("Server error during refinement generation.");
      const data = await resp.json();

      if (data.cards && data.cards.length > 0) {
        setIdea(prev => prev + "\n- " + newInfoDraft);
        setCards(data.cards);
        setActiveCardId(data.cards[0].id);
        setWhatChangedMsg(newInfoDraft);
        setShowRefinement(false);
        setNewInfoDraft('');

        if (hasCoreSubjectShift) {
          alert(t.interest_changed_warning);
        }

        // Add history record for revised proposal
        const updatedHistory = [
          {
            timestamp: `${new Date().toLocaleTimeString()} (Refined)`,
            idea: conjoinedIdea,
            selectedCard: data.cards[0],
            cards: data.cards,
            whatChanged: newInfoDraft
          },
          ...history
        ];
        persistHistory(updatedHistory);
        saveCurrentStateLocal(data.cards, data.cards[0].id);
      }
    } catch (err: any) {
      setErrorText(err.message);
    } finally {
      setIsGenerating(false);
    }
  };

  const handleCheckAlignmentTrigger = async () => {
    const activeCard = cards.find(c => c.id === activeCardId);
    if (!activeCard) return;

    setIsCheckingAlignment(true);
    setAlignmentResult(null);
    try {
      const resp = await fetch('/api/suggestor/check-alignment', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          idea,
          topic: activeCard.topic,
          title: activeCard.title,
          studyType: activeCard.studyType,
          participants: activeCard.participants,
          primaryRQ: activeCard.primaryRQ,
          supportingRQs: activeCard.supportingRQs,
          lang
        })
      });
      const data = await resp.json();
      if (data.status) {
        setAlignmentResult({
          status: data.status,
          warnings: data.warnings || []
        });
      }
    } catch (err) {
      console.error("Coherence checker connection error:", err);
    } finally {
      setIsCheckingAlignment(false);
    }
  };

  const handleCheckEltAlignmentTrigger = async () => {
    const activeCard = cards.find(c => c.id === activeCardId);
    if (!activeCard) return;

    setIsCheckingEltAlignment(true);
    setEltAlignmentResult(null);
    try {
      const resp = await fetch('/api/suggestor/check-elt-alignment', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          idea,
          topic: activeCard.topic,
          title: activeCard.title,
          studyType: activeCard.studyType,
          participants: activeCard.participants,
          primaryRQ: activeCard.primaryRQ,
          supportingRQs: activeCard.supportingRQs,
          lang
        })
      });
      const data = await resp.json();
      if (data.status) {
        setEltAlignmentResult({
          status: data.status,
          frameworks: data.frameworks || [],
          justification: data.justification || '',
          scopeMismatches: data.scopeMismatches || [],
          suggestions: data.suggestions || []
        });
      }
    } catch (err) {
      console.error("ELT theoretical alignment checker connection error:", err);
    } finally {
      setIsCheckingEltAlignment(false);
    }
  };

  // Reset helper
  const handleResetWorkspace = () => {
    if (window.confirm(t.reset_confirm)) {
      setIdea('');
      setAnswers({
        studyInterest: '',
        classroomIssue: '',
        audienceGroup: '',
        sampleSize: '',
        participantCharacteristics: '',
        researchSetting: '',
        researchLocation: '',
        languagesInvolved: '',
        preferredMethod: '',
        dataSources: '',
        timeLimitations: '',
        accessLimitations: '',
        theoreticalPerspective: '',
        preferredOutcome: '',
        excludedTopics: ''
      });
      setCards([]);
      setActiveCardId(null);
      setWhatChangedMsg('');
      setAlignmentResult(null);
      localStorage.removeItem('honorlex_suggestor__current_state');
    }
  };

  // Load history record
  const handleLoadHistory = (entry: HistoryEntry) => {
    if (window.confirm(lang === 'tr' ? "Bu geçmiş kaydı yüklemek ve mevcut kartları değiştirmek istiyor musunuz?" : "Do you want to load this history record and replace your current cards?")) {
      setIdea(entry.idea);
      setCards(entry.cards);
      if (entry.selectedCard) {
        setActiveCardId(entry.selectedCard.id);
      } else if (entry.cards.length > 0) {
        setActiveCardId(entry.cards[0].id);
      }
      if (entry.whatChanged) {
        setWhatChangedMsg(entry.whatChanged);
      } else {
        setWhatChangedMsg('');
      }
      setAlignmentResult(null);
      setShowHistoryModal(false);
    }
  };

  // Clipboard Copiers
  const copyToClipboard = (text: string, label: string) => {
    navigator.clipboard.writeText(text);
    setCopyStatus(label);
    setTimeout(() => setCopyStatus(null), 2000);
  };

  const getFullProposalText = (c: ProposalCard) => {
    return `[RESEARCH PROPOSAL SUMMARY]
Topic: ${c.topic}
Title: ${c.title}
Study Type: ${c.studyType}
Participants / Data Source: ${c.participants}
Theoretical Rationale: ${c.rationale}
Feasibility Review: ${c.feasibility}
Ethics & Access: ${c.ethical}

Primary Research Question:
${c.primaryRQ}

Supporting Research Questions:
${c.supportingRQs.map((rq, idx) => `${idx + 1}. ${rq}`).join('\n')}

Keywords: ${c.keywords.join(', ')}
`;
  };

  const activeCard = cards.find(c => c.id === activeCardId);

  return (
    <div className="space-y-8 max-w-7xl mx-auto px-4 py-3" id="topic-suggestor-workspace">
      
      {/* Upper header section */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 border-b border-slate-800 pb-5" id="suggestor-top-bar">
        <div>
          <h2 className="text-2xl font-display font-medium text-slate-100 flex items-center gap-3">
            <Sparkles className="h-6 w-6 text-indigo-400" />
            {lang === 'tr' ? "Konu ve Araştırma Sorusu Önerici" : "Topic Suggestor Workspace"}
          </h2>
          <p className="text-xs text-slate-400 mt-1 max-w-2xl">
            {lang === 'tr' 
              ? "Çatallı akademik fikirlerinizi uygulabilir yüksek lisans/doktora düzeyinde araştırma yönelimlerine, metodolojilere ve uyumlu araştırma sorularına dönüştürün."
              : "Map unstructured research hunches into compliant applied linguistics designs, feasible titles, and aligned questioning sequences."}
          </p>
        </div>

        <div className="flex items-center gap-2 self-start md:self-auto" id="suggestor-actions">
          <button
            onClick={() => setShowHistoryModal(true)}
            className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg border border-slate-800 bg-slate-900/40 text-xs text-slate-300 hover:bg-slate-800 hover:text-white transition"
            id="history-logs-btn"
          >
            <History className="h-3.5 w-3.5" />
            {t.history_label} ({history.length})
          </button>
          
          <button
            onClick={handleResetWorkspace}
            className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg border border-red-950/40 bg-red-950/10 text-xs text-red-400 hover:bg-red-950/20 transition hover:border-red-900"
            id="reset-workspace-btn"
          >
            <RotateCcw className="h-3.5 w-3.5" />
            {t.reset_cta}
          </button>
        </div>
      </div>

      {cards.length === 0 ? (
        /* Empty/Entry Phase visual workspace layout */
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8" id="suggestor-entry-grid">
          
          {/* Main Open Idea box */}
          <div className="lg:col-span-2 space-y-6" id="left-setup-column">
            <div className="p-6 rounded-xl border border-slate-800/80 bg-slate-900/20 backdrop-blur-sm shadow-xl space-y-4">
              <h3 className="text-sm font-display font-medium text-slate-200 uppercase tracking-widest flex items-center gap-2">
                <span className="flex h-5 w-5 items-center justify-center rounded-sm bg-indigo-505/10 text-[10px] border border-indigo-500/20 text-indigo-400">1</span>
                {t.starting_idea_title}
              </h3>
              
              <div className="space-y-1.5">
                <label className="text-xs text-slate-400">{t.starting_idea_label}</label>
                <textarea
                  value={idea}
                  onChange={(e) => setIdea(e.target.value)}
                  placeholder={t.starting_idea_placeholder}
                  className="w-full h-44 rounded-lg bg-slate-950/50 p-4 border border-slate-800/60 text-slate-200 text-sm focus:outline-none focus:border-indigo-500/50 font-sans leading-relaxed resize-none focus:ring-1 focus:ring-indigo-500/20"
                />
              </div>

              {/* Advanced toggle guiding Qs inline */}
              <div className="border-t border-slate-800/40 pt-4" id="guiding-questions-collapse">
                <button
                  type="button"
                  onClick={() => setExpandedQuestions(!expandedQuestions)}
                  className="flex items-center gap-2 text-xs font-semibold text-indigo-400 hover:text-indigo-300 transition"
                >
                  <Plus className={`h-3 w-3 transform transition-transform ${expandedQuestions ? 'rotate-45' : ''}`} />
                  {lang === 'tr' ? "Detaylı Kılavuz Alanları Göster/Gizle (Opsiyonel)" : "Toggle Optional Guiding Prompt Inputs"}
                </button>

                {expandedQuestions && (
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mt-4 animate-fadeIn" id="inline-guiding-props">
                    <div className="space-y-1">
                      <label className="text-[11px] text-slate-400 block">{t.how_to_study_q}</label>
                      <input
                        type="text"
                        value={answers.studyInterest}
                        onChange={(e) => setAnswers(prev => ({ ...prev, studyInterest: e.target.value }))}
                        className="w-full rounded-md bg-slate-950/40 border border-slate-850 p-2 text-xs text-slate-200 focus:outline-none"
                      />
                    </div>

                    <div className="space-y-1">
                      <label className="text-[11px] text-slate-400 block">{t.problem_q}</label>
                      <input
                        type="text"
                        value={answers.classroomIssue}
                        onChange={(e) => setAnswers(prev => ({ ...prev, classroomIssue: e.target.value }))}
                        className="w-full rounded-md bg-slate-950/40 border border-slate-850 p-2 text-xs text-slate-200 focus:outline-none"
                      />
                    </div>

                    <div className="space-y-1">
                      <label className="text-[11px] text-slate-400 block">{t.participants_q}</label>
                      <input
                        type="text"
                        value={answers.audienceGroup}
                        onChange={(e) => setAnswers(prev => ({ ...prev, audienceGroup: e.target.value }))}
                        className="w-full rounded-md bg-slate-950/40 border border-slate-850 p-2 text-xs text-slate-200 focus:outline-none"
                      />
                    </div>

                    <div className="space-y-1">
                      <label className="text-[11px] text-slate-400 block">{t.sample_size_q}</label>
                      <input
                        type="text"
                        value={answers.sampleSize}
                        onChange={(e) => setAnswers(prev => ({ ...prev, sampleSize: e.target.value }))}
                        placeholder="e.g. 15, 200, unknown"
                        className="w-full rounded-md bg-slate-950/40 border border-slate-850 p-2 text-xs text-slate-200 focus:outline-none"
                      />
                    </div>

                    <div className="space-y-1">
                      <label className="text-[11px] text-slate-400 block">{t.edu_level_q}</label>
                      <input
                        type="text"
                        value={answers.researchSetting}
                        onChange={(e) => setAnswers(prev => ({ ...prev, researchSetting: e.target.value }))}
                        className="w-full rounded-md bg-slate-950/40 border border-slate-850 p-2 text-xs text-slate-200 focus:outline-none"
                      />
                    </div>

                    <div className="space-y-1">
                      <label className="text-[11px] text-slate-400 block">{t.location_q}</label>
                      <input
                        type="text"
                        value={answers.researchLocation}
                        onChange={(e) => setAnswers(prev => ({ ...prev, researchLocation: e.target.value }))}
                        className="w-full rounded-md bg-slate-950/40 border border-slate-850 p-2 text-xs text-slate-200 focus:outline-none"
                      />
                    </div>

                    <div className="space-y-1">
                      <label className="text-[11px] text-slate-400 block">{t.method_q}</label>
                      <input
                        type="text"
                        value={answers.preferredMethod}
                        onChange={(e) => setAnswers(prev => ({ ...prev, preferredMethod: e.target.value }))}
                        placeholder="qualitative, surveys, mixed etc"
                        className="w-full rounded-md bg-slate-950/40 border border-slate-850 p-2 text-xs text-slate-200 focus:outline-none"
                      />
                    </div>

                    <div className="space-y-1">
                      <label className="text-[11px] text-slate-400 block">{t.excluded_q}</label>
                      <input
                        type="text"
                        value={answers.excludedTopics}
                        onChange={(e) => setAnswers(prev => ({ ...prev, excludedTopics: e.target.value }))}
                        className="w-full rounded-md bg-slate-950/40 border border-slate-850 p-2 text-xs text-slate-200 focus:outline-none"
                      />
                    </div>
                  </div>
                )}
              </div>

              {errorText && (
                <div className="p-3 bg-red-950/20 border border-red-900/30 rounded-lg text-xs text-red-400 flex items-center gap-2">
                  <AlertTriangle className="h-4 w-4 shrink-0" />
                  {errorText}
                </div>
              )}

              <button
                onClick={handleGenerate}
                disabled={isGenerating}
                className="w-full flex items-center justify-center gap-2 bg-gradient-to-r from-indigo-600 to-indigo-700 hover:from-indigo-500 hover:to-indigo-600 active:scale-[0.99] disabled:opacity-50 text-white font-medium text-sm py-3 px-4 rounded-lg shadow-lg hover:shadow-indigo-550/20 transition duration-150"
                id="generate-directions-trigger"
              >
                {isGenerating ? (
                  <>
                    <RefreshCw className="h-4 w-4 animate-spin" />
                    {t.generating}
                  </>
                ) : (
                  <>
                    <Sparkles className="h-4 w-4" />
                    {t.generate_cta}
                  </>
                )}
              </button>
            </div>
          </div>

          {/* Right Column details & tips */}
          <div className="space-y-6" id="right-info-sidebar">
            <div className="p-6 rounded-xl border border-slate-800/80 bg-slate-950/20 shadow-xl space-y-4">
              <h4 className="text-xs font-semibold text-slate-300 uppercase tracking-wider flex items-center gap-1.5">
                <BookOpen className="h-4 w-4 text-emerald-400" />
                {lang === 'tr' ? "Akademik Alan Kapsamı" : "Default Academic Scope"}
              </h4>
              <p className="text-xs text-slate-400 leading-relaxed">
                {lang === 'tr'
                  ? "Sistem öncelikli olarak ELT, yabancı dil eğitimi, uygulamalı dilbilim, sınıf içi söylem analizi, eleştirel söylem (CDA/CLA), yarı yapılandırılmış durum incelemeleri ve tez yapılarına odaklanmaktadır."
                  : "Optimized for ELT protocols, Applied Linguistics niches, Translanguaging theories, Classroom Discourse, Mixed methods designs, and APA compliant framing."}
              </p>

              <div className="border-t border-slate-800/40 pt-3" />

              <h4 className="text-xs font-semibold text-slate-300 uppercase tracking-wider flex items-center gap-1.5">
                <Check className="h-4 w-4 text-indigo-400" />
                {lang === 'tr' ? "En İyi Sonuçlar İçin İpuçları" : "Best Practice Tips"}
              </h4>
              <ul className="space-y-2 text-xs text-slate-400">
                <li className="flex items-start gap-1.5">
                  <span className="text-indigo-400 shrink-0">•</span>
                  {lang === 'tr' 
                    ? "Bilgi eksikliğinden korkmayın. Sistem eksik kısımları makul boşluklarla dolduracaktır." 
                    : "Embrace gaps; the generator constructs feasible clusters around partial contexts."}
                </li>
                <li className="flex items-start gap-1.5">
                  <span className="text-indigo-400 shrink-0">•</span>
                  {lang === 'tr'
                    ? "Varsa hedef katılımcı sayınızı 'approximate participant number' kısmına belirtin."
                    : "Specify quantitative counts to trigger precise helper warning flags."}
                </li>
              </ul>
            </div>
          </div>
        </div>
      ) : (
        /* Results visual layout phase */
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8" id="suggestor-active-workspace">
          
          {/* List of Suggestion Options (Concept Cards) */}
          <div className="lg:col-span-4 space-y-4" id="cards-navigation-column">
            <h3 className="text-xs font-semibold text-slate-400 uppercase tracking-wider px-1">
              {t.directions_title}
            </h3>

            <div className="space-y-3" id="navigation-concept-cards-group">
              {cards.map((c, index) => {
                const isActive = c.id === activeCardId;
                return (
                  <div
                    key={c.id}
                    onClick={() => {
                      setActiveCardId(c.id);
                      setAlignmentResult(null);
                    }}
                    className={`p-4 rounded-xl border transition cursor-pointer text-left ${
                      isActive 
                        ? 'bg-slate-900/50 border-indigo-500/50 shadow-md ring-1 ring-indigo-500/10' 
                        : 'bg-slate-950/20 border-slate-800/80 hover:border-slate-700 hover:bg-slate-900/20'
                    }`}
                  >
                    <div className="flex items-center justify-between gap-2 mb-1">
                      <span className="text-[10px] uppercase font-mono tracking-widest text-indigo-400 bg-indigo-950/40 px-1.5 py-0.5 rounded">
                        {c.studyType}
                      </span>
                      <span className="text-[10px] text-slate-500">#{index + 1}</span>
                    </div>

                    <h4 className="text-xs font-display font-medium text-slate-200 line-clamp-2">
                      {c.title}
                    </h4>

                    <p className="text-[11px] text-slate-400 mt-2 line-clamp-2 italic">
                      {c.topic}
                    </p>
                  </div>
                );
              })}
            </div>

            {/* Quick manual triggers */}
            <div className="pt-4 border-t border-slate-800/40" id="bottom-coordinating-actions">
              <button
                onClick={() => setShowRefinement(true)}
                className="w-full flex items-center justify-center gap-1.5 py-2 px-3 rounded-lg border border-indigo-550/30 bg-indigo-950/15 text-xs text-indigo-300 hover:bg-indigo-950/35 transition"
                id="refine-topic-flow-btn"
              >
                <Plus className="h-3.5 w-3.5" />
                {t.add_info_panel_btn}
              </button>
            </div>
          </div>

          {/* Active Card Content, Refinement and Safe Editor Pane */}
          <div className="lg:col-span-8 space-y-6" id="workspace-document-viewer">
            {activeCard ? (
              <div className="space-y-6" id="active-proposal-scaffold">
                
                {/* Proposal Section Details Card */}
                <div className="p-6 rounded-xl border border-slate-800/80 bg-slate-900/20 backdrop-blur-sm shadow-xl space-y-6">
                  
                  {/* Title editor section */}
                  <div className="space-y-2" id="title-editor-module">
                    <div className="flex items-center justify-between gap-4">
                      <span className="text-[10px] uppercase font-mono tracking-widest text-indigo-400">
                        {t.concept_card} ({activeCard.studyType})
                      </span>

                      {/* Title copy button */}
                      <button
                        onClick={() => copyToClipboard(activeCard.title, "title")}
                        className="p-1 px-1.5 rounded-md hover:bg-slate-800/60 text-[11px] text-slate-400 flex items-center gap-1 transition"
                      >
                        {copyStatus === "title" ? <Check className="h-3 w-3 text-emerald-400" /> : <Copy className="h-3 w-3" />}
                        {copyStatus === "title" ? t.copy_success : t.copy_title}
                      </button>
                    </div>

                    {isManualTitleEdit ? (
                      <div className="space-y-2">
                        <textarea
                          defaultValue={activeCard.title}
                          id="manual-title-input-field"
                          rows={2}
                          className="w-full rounded-md bg-slate-950/80 p-3 border border-indigo-505/30 text-sm focus:outline-none focus:border-indigo-500/50 font-sans text-slate-200"
                        />
                        <div className="flex gap-2">
                          <button
                            onClick={() => {
                              const el = document.getElementById('manual-title-input-field') as HTMLTextAreaElement;
                              if (el) handleSaveManualTitle(el.value);
                            }}
                            className="bg-indigo-600 hover:bg-indigo-500 text-xs px-3 py-1.5 rounded text-white"
                          >
                            {lang === 'tr' ? "Kaydet" : "Save"}
                          </button>
                          <button
                            onClick={() => setIsManualTitleEdit(false)}
                            className="bg-slate-800 hover:bg-slate-700 text-xs px-3 py-1.5 rounded text-slate-300"
                          >
                            {lang === 'tr' ? "İptal" : "Cancel"}
                          </button>
                        </div>
                      </div>
                    ) : (
                      <h3 className="text-lg font-display font-medium text-slate-100 tracking-tight leading-relaxed">
                        {activeCard.title}
                      </h3>
                    )}

                    <div className="flex flex-wrap gap-2 pt-1" id="title-editorial-controls">
                      <button
                        onClick={() => handleChangeTitleTrigger(activeCard)}
                        disabled={isLoadingTitles}
                        className="px-2.5 py-1 rounded bg-slate-900 hover:bg-slate-800 border border-slate-800 text-[11px] text-slate-300 flex items-center gap-1"
                      >
                        <RefreshCw className={`h-3 w-3 ${isLoadingTitles ? 'animate-spin' : ''}`} />
                        {t.change_title_cta}
                      </button>
                      
                      <button
                        onClick={() => setIsManualTitleEdit(true)}
                        className="px-2.5 py-1 rounded bg-slate-900 hover:bg-slate-800 border border-slate-800 text-[11px] text-slate-300 flex items-center gap-1"
                      >
                        <Edit className="h-3 w-3" />
                        {t.edit_manually_cta}
                      </button>
                    </div>

                    {editingTitleCardId === activeCard.id && titleAlternatives.length > 0 && (
                      <div className="p-4 bg-slate-950/60 border border-slate-800 rounded-lg space-y-3 mt-3 animate-fadeIn">
                        <span className="text-[11px] font-semibold text-slate-300 uppercase block tracking-wider">
                          {lang === 'tr' ? "Bilimsel Ton Alternatifleri:" : "Alternate Scholarly Emphasis Registers:"}
                        </span>
                        <div className="space-y-2">
                          {titleAlternatives.map((alt, idx) => (
                            <div 
                              key={idx} 
                              className="p-2.5 rounded bg-slate-900/50 hover:bg-slate-800/50 border border-slate-800/40 cursor-pointer flex flex-col gap-0.5 justify-start text-left"
                              onClick={() => handleApplyTitle(alt.title)}
                            >
                              <span className="text-[9px] font-mono uppercase tracking-widest text-indigo-400">
                                {alt.style}
                              </span>
                              <span className="text-xs text-slate-200">
                                {alt.title}
                              </span>
                            </div>
                          ))}
                        </div>
                      </div>
                    )}
                  </div>

                  <div className="border-t border-slate-800/40 my-4" />

                  {/* Proposal Metadata Grid details */}
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-xs leading-relaxed text-slate-300" id="metadata-fields-grid">
                    <div className="space-y-1">
                      <span className="text-[11px] text-slate-400 block">{t.study_type_label}</span>
                      <span className="font-semibold text-slate-100 uppercase font-mono">{activeCard.studyType}</span>
                    </div>

                    <div className="space-y-1">
                      <span className="text-[11px] text-slate-400 block">{t.sample_label}</span>
                      <span className="font-semibold text-slate-100">{activeCard.participants}</span>
                    </div>

                    <div className="md:col-span-2 space-y-1">
                      <span className="text-[11px] text-slate-400 block">{t.rationale_label}</span>
                      <p className="text-slate-300">{activeCard.rationale}</p>
                    </div>
                  </div>

                  {/* Ethics and Feasibility details panel */}
                  <div className="p-4 rounded-xl bg-slate-950/40 border border-slate-800 space-y-3" id="feasibility-safeguards-display">
                    <h4 className="text-[11px] uppercase font-bold tracking-widest text-slate-300 flex items-center gap-1.5">
                      <Info className="h-4 w-4 text-amber-500" />
                      {t.ethics_feasibility_check}
                    </h4>

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-xs font-sans">
                      <div className="space-y-1">
                        <span className="text-slate-400 block">{t.feasibility_caution_label}</span>
                        <p className="text-slate-300 italic">{activeCard.feasibility}</p>
                      </div>

                      <div className="space-y-1">
                        <span className="text-slate-400 block">{t.ethics_label}</span>
                        <p className="text-slate-300 italic">{activeCard.ethical}</p>
                      </div>
                    </div>
                  </div>

                  {/* Scientific Research Questions Section (The Core Editor) */}
                  <div className="space-y-4" id="questions-authoring-box">
                    <div className="flex items-center justify-between border-b border-slate-800 pb-2">
                      <h4 className="text-xs font-semibold uppercase tracking-widest text-slate-200">
                        {lang === 'tr' ? "Araştırma Soruları Editörü" : "Research Question Editor Suite"}
                      </h4>
                    </div>

                    {/* Primary RQ Block */}
                    <div className="p-3 bg-slate-950/20 border border-slate-850 rounded-lg space-y-2">
                      <div className="flex items-start justify-between gap-4">
                        <div className="space-y-0.5">
                          <span className="text-[9px] font-mono text-indigo-400 uppercase tracking-widest block">
                            {t.primary_rq_label}
                          </span>
                          <span className="text-xs font-medium text-slate-200 block">
                            {activeCard.primaryRQ}
                          </span>
                        </div>

                        <div className="flex gap-1.5 shrink-0">
                          <button
                            onClick={() => handleChangeRQTrigger(activeCard, -1, activeCard.primaryRQ)}
                            className="px-2 py-0.5 rounded border border-slate-800 bg-slate-900 text-[10px] text-slate-400 hover:text-indigo-400 transition"
                          >
                            {t.change_rq_cta}
                          </button>
                          
                          <button
                            onClick={() => copyToClipboard(activeCard.primaryRQ, "prq")}
                            className="p-1 rounded text-slate-500 hover:text-white hover:bg-slate-800 transition"
                          >
                            {copyStatus === "prq" ? <Check className="h-3 w-3 text-emerald-400" /> : <Copy className="h-3.5 w-3.5" />}
                          </button>
                        </div>
                      </div>
                    </div>

                    {/* Supporting RQs list */}
                    <div className="space-y-2" id="sub-rqs-editor-list">
                      <span className="text-[10px] uppercase tracking-wider text-slate-400 block">
                        {t.sub_rq_label}
                      </span>

                      {activeCard.supportingRQs.map((rq, idx) => (
                        <div key={idx} className="p-2.5 bg-slate-950/10 border border-slate-850/50 rounded-md flex items-center justify-between gap-4">
                          <span className="text-xs text-slate-300">
                            SRQ {idx + 1}: {rq}
                          </span>

                          <div className="flex items-center gap-1 shrink-0">
                            <button
                              onClick={() => handleChangeRQTrigger(activeCard, idx, rq)}
                              className="px-2 py-0.5 rounded border border-slate-800 bg-slate-900 text-[10px] text-slate-400 hover:text-indigo-400 transition"
                            >
                              {t.change_rq_cta}
                            </button>
                            
                            <button
                              onClick={() => copyToClipboard(rq, `srq-${idx}`)}
                              className="p-1 rounded text-slate-500 hover:text-white hover:bg-slate-850/50 transition"
                            >
                              {copyStatus === `srq-${idx}` ? <Check className="h-3 w-3 text-emerald-300" /> : <Copy className="h-3 w-3" />}
                            </button>
                          </div>
                        </div>
                      ))}
                    </div>

                    {/* RQ alternatives loader */}
                    {editingRQ && (
                      <div className="p-4 bg-slate-950/80 border border-indigo-505/20 rounded-xl space-y-4 animate-fadeIn">
                        <div className="flex items-center justify-between">
                          <span className="text-[10px] uppercase font-mono tracking-widest text-indigo-400 block">
                            {lang === 'tr' ? "Alternatif Soru Kurguları:" : "Methodological Re-Formulations:"}
                          </span>

                          <button
                            onClick={() => setIsManualRQEdit(!isManualRQEdit)}
                            className="text-[10px] text-slate-400 hover:text-white underline transition"
                          >
                            {isManualRQEdit ? (lang === 'tr' ? "Önerilere Dön" : "Suggestions Mode") : (lang === 'tr' ? "Serbest Yazım" : "Free Writing")}
                          </button>
                        </div>

                        {isManualRQEdit ? (
                          <div className="space-y-2">
                            <input
                              type="text"
                              value={manualRQText}
                              onChange={(e) => setManualRQText(e.target.value)}
                              className="w-full rounded bg-slate-900 border border-slate-800 p-2 text-xs text-slate-200"
                            />
                            <div className="flex gap-2">
                              <button
                                onClick={handleApplyManualRQ}
                                className="bg-indigo-600 px-3 py-1 rounded text-xs text-white"
                              >
                                {lang === 'tr' ? "Onayla" : "Confirm"}
                              </button>
                              <button
                                onClick={() => setEditingRQ(null)}
                                className="bg-slate-800 px-3 py-1 rounded text-xs text-slate-300"
                              >
                                {lang === 'tr' ? "Kapat" : "Close"}
                              </button>
                            </div>
                          </div>
                        ) : isLoadingRQs ? (
                          <div className="text-center py-2 text-xs text-slate-400 flex items-center justify-center gap-1">
                            <RefreshCw className="h-3 block w-3 animate-spin text-indigo-400" />
                            {lang === 'tr' ? "Sorular analiz ediliyor..." : "Sifting alternatives..."}
                          </div>
                        ) : (
                          <div className="space-y-2">
                            {rqAlternatives.map((alt, aidx) => (
                              <div
                                key={aidx}
                                onClick={() => handleApplyRQAlternative(alt.question)}
                                className="p-3 bg-slate-900/50 hover:bg-slate-800 border border-slate-800/40 rounded-lg cursor-pointer text-left flex flex-col gap-1.5 transition"
                              >
                                <span className="text-xs text-slate-200 font-sans font-medium">{alt.question}</span>
                                <span className="text-[10px] text-emerald-400 bg-emerald-950/30 px-2 py-0.5 rounded self-start font-mono">
                                  {alt.explanation}
                                </span>
                              </div>
                            ))}
                          </div>
                        )}
                      </div>
                    )}
                  </div>

                  <div className="border-t border-slate-800/40 my-4" />

                  {/* Keywords section */}
                  <div className="space-y-2" id="keywords-container">
                    <span className="text-[10px] uppercase font-mono tracking-widest text-slate-400 block">
                      {t.keywords_label}
                    </span>
                    <div className="flex flex-wrap gap-2">
                      {activeCard.keywords.map((kw, kidx) => (
                        <span key={kidx} className="text-[11px] bg-slate-950/60 border border-slate-850 px-2 py-1 rounded-md text-slate-300">
                          #{kw}
                        </span>
                      ))}
                    </div>
                  </div>

                  <div className="border-t border-slate-800/40 my-4" />

                  {/* Proposal Exporter Action bar layout */}
                  <div className="flex flex-wrap gap-2 justify-between" id="copier-proposal-row">
                    <button
                      onClick={() => copyToClipboard(getFullProposalText(activeCard), "proposal")}
                      className="flex items-center gap-2 px-4 py-2 rounded-lg bg-indigo-600 hover:bg-indigo-500 text-xs text-white font-medium shadow-md transition"
                    >
                      {copyStatus === "proposal" ? <Check className="h-4 w-4" /> : <Copy className="h-4 w-4" />}
                      {copyStatus === "proposal" ? t.copy_success : t.copy_proposal}
                    </button>
                  </div>
                </div>

                {/* Alignment and Feasibility section */}
                <div className="p-6 rounded-xl border border-slate-800/80 bg-slate-900/10 backdrop-blur-sm shadow-xl space-y-4">
                  <h3 className="text-sm font-display font-medium text-slate-200 uppercase tracking-widest flex items-center gap-2">
                    <span className="flex h-5 w-5 items-center justify-center rounded-sm bg-indigo-505/10 text-[10px] border border-indigo-500/20 text-indigo-400">6</span>
                    {t.alignment_title}
                  </h3>
                  
                  <p className="text-xs text-slate-400">
                    {t.alignment_desc}
                  </p>

                  <button
                    onClick={handleCheckAlignmentTrigger}
                    disabled={isCheckingAlignment}
                    className="w-full relative overflow-hidden flex items-center justify-center gap-2 border border-indigo-550/30 bg-indigo-950/20 text-indigo-300 font-medium text-xs py-2 px-4 rounded-lg hover:bg-indigo-950/45 transition duration-150"
                  >
                    {isCheckingAlignment ? (
                      <>
                        <RefreshCw className="h-4 w-4 animate-spin" />
                        {t.checking_alignment}
                      </>
                    ) : (
                      <>
                        <ListChecks className="h-4 w-4" />
                        {t.check_alignment_cta}
                      </>
                    )}
                  </button>

                  {alignmentResult && (
                    <div className="p-4 bg-slate-950/80 border border-slate-800 rounded-lg space-y-3 animate-fadeIn" id="alignment-results-node">
                      <div className="flex items-center gap-2">
                        {alignmentResult.status === "aligned" ? (
                          <div className="flex items-center gap-1.5 text-xs font-bold text-emerald-400 uppercase tracking-wider">
                            <CheckCircle2 className="h-4 w-4" />
                            {t.mismatch_good}
                          </div>
                        ) : alignmentResult.status === "needs_refinement" ? (
                          <div className="flex items-center gap-1.5 text-xs font-bold text-amber-500 uppercase tracking-wider">
                            <AlertTriangle className="h-4 w-4" />
                            {t.mismatch_warn}
                          </div>
                        ) : (
                          <div className="flex items-center gap-1.5 text-xs font-bold text-red-500 uppercase tracking-wider">
                            <AlertTriangle className="h-4 w-4 animate-bounce" />
                            {t.mismatch_bad}
                          </div>
                        )}
                      </div>

                      <div className="space-y-1.5 pt-1">
                        {alignmentResult.warnings.map((warn, widx) => (
                          <p key={widx} className="text-xs text-slate-300 leading-relaxed pl-3 border-l-2 border-slate-800">
                            {warn}
                          </p>
                        ))}
                      </div>
                    </div>
                  )}
                </div>

                {/* Section 7 -- ELT Theoretical Alignment Audit */}
                <div className="p-6 rounded-xl border border-slate-800/80 bg-slate-900/10 backdrop-blur-sm shadow-xl space-y-4">
                  <h3 className="text-sm font-display font-medium text-slate-200 uppercase tracking-widest flex items-center gap-2">
                    <span className="flex h-5 w-5 items-center justify-center rounded-sm bg-indigo-505/10 text-[10px] border border-indigo-500/20 text-indigo-400">7</span>
                    {t.elt_alignment_title}
                  </h3>
                  
                  <p className="text-xs text-slate-400">
                    {t.elt_alignment_desc}
                  </p>

                  <button
                    onClick={handleCheckEltAlignmentTrigger}
                    disabled={isCheckingEltAlignment}
                    className="w-full relative overflow-hidden flex items-center justify-center gap-2 border border-indigo-550/30 bg-indigo-950/20 text-indigo-300 font-medium text-xs py-2 px-4 rounded-lg hover:bg-indigo-950/45 transition duration-150"
                  >
                    {isCheckingEltAlignment ? (
                      <>
                        <RefreshCw className="h-4 w-4 animate-spin text-indigo-400" />
                        {t.checking_elt_alignment}
                      </>
                    ) : (
                      <>
                        <BookOpen className="h-4 w-4 text-indigo-400" />
                        {t.check_elt_alignment_cta}
                      </>
                    )}
                  </button>

                  {eltAlignmentResult && (
                    <div className="p-5 bg-slate-950/90 border border-slate-800/80 rounded-xl space-y-4 animate-fadeIn" id="elt-alignment-results">
                      {/* Status indicator badge */}
                      <div className="flex items-center gap-2 border-b border-slate-800/60 pb-3">
                        {eltAlignmentResult.status === "fully_aligned" ? (
                          <span className="inline-flex items-center gap-1.5 px-3 py-1 text-[11px] font-bold text-emerald-400 bg-emerald-950/40 border border-emerald-900/40 uppercase tracking-wider rounded-full">
                            <CheckCircle2 className="h-3.5 w-3.5" />
                            {t.elt_status_fully}
                          </span>
                        ) : eltAlignmentResult.status === "partially_aligned" ? (
                          <span className="inline-flex items-center gap-1.5 px-3 py-1 text-[11px] font-bold text-amber-500 bg-amber-950/40 border border-amber-900/40 uppercase tracking-wider rounded-full">
                            <AlertTriangle className="h-3.5 w-3.5" />
                            {t.elt_status_partially}
                          </span>
                        ) : (
                          <span className="inline-flex items-center gap-1.5 px-3 py-1 text-[11px] font-bold text-red-500 bg-red-950/40 border border-red-900/40 uppercase tracking-wider rounded-full">
                            <AlertTriangle className="h-3.5 w-3.5 animate-pulse" />
                            {t.elt_status_mismatch}
                          </span>
                        )}
                      </div>

                      {/* Map of Matched Theoretical Frameworks */}
                      {eltAlignmentResult.frameworks && eltAlignmentResult.frameworks.length > 0 && (
                        <div className="space-y-2">
                          <span className="text-[10px] uppercase font-mono tracking-wider font-semibold text-slate-400 block">
                            {t.elt_frameworks_label}
                          </span>
                          <div className="space-y-2">
                            {eltAlignmentResult.frameworks.map((fw, fwidx) => (
                              <div key={fwidx} className="p-3 bg-slate-900/75 border border-slate-850 rounded-lg space-y-1">
                                <span className="text-xs font-sans font-semibold text-indigo-300 block">
                                  {fw.name}
                                </span>
                                <p className="text-[11px] text-slate-300 leading-relaxed font-sans">
                                  {fw.roleDescription}
                                </p>
                              </div>
                            ))}
                          </div>
                        </div>
                      )}

                      {/* Theoretical layout justification text */}
                      {eltAlignmentResult.justification && (
                        <div className="space-y-1">
                          <span className="text-[10px] uppercase font-mono tracking-wider font-semibold text-slate-400 block">
                            {t.elt_justification_label}
                          </span>
                          <p className="text-xs text-slate-300 leading-relaxed bg-slate-905/40 p-3 rounded-lg border border-slate-850 font-sans italic">
                            "{eltAlignmentResult.justification}"
                          </p>
                        </div>
                      )}

                      {/* Scope mismatches & flags warnings */}
                      {eltAlignmentResult.scopeMismatches && eltAlignmentResult.scopeMismatches.length > 0 ? (
                        <div className="space-y-2">
                          <span className="text-[10px] uppercase font-mono tracking-wider font-semibold text-amber-500 block">
                            {t.elt_scope_mismatch_label}
                          </span>
                          <div className="space-y-1.5 pl-1">
                            {eltAlignmentResult.scopeMismatches.map((mismatch, midx) => (
                              <div key={midx} className="flex gap-2 p-2.5 bg-red-950/20 border border-red-900/30 rounded-lg text-xs text-red-300 font-sans leading-relaxed">
                                <AlertTriangle className="h-4 w-4 text-red-400 shrink-0 mt-0.5" />
                                <span>{mismatch}</span>
                              </div>
                            ))}
                          </div>
                        </div>
                      ) : (
                        <div className="p-2.5 bg-emerald-950/25 border border-emerald-900/20 rounded-lg text-[11px] text-emerald-400 font-sans">
                          ✓ {lang === 'tr' ? "Herhangi bir kuramsal kapsam uyuşmazlığı saptanmadı." : "No theoretical scope mismatches identified."}
                        </div>
                      )}

                      {/* Suggestions list */}
                      {eltAlignmentResult.suggestions && eltAlignmentResult.suggestions.length > 0 && (
                        <div className="space-y-2 pt-1 border-t border-slate-850">
                          <span className="text-[10px] uppercase font-mono tracking-wider font-semibold text-indigo-400 block">
                            {t.elt_suggestions_label}
                          </span>
                          <ul className="space-y-1.5 list-disc pl-4 text-xs text-slate-300 leading-relaxed">
                            {eltAlignmentResult.suggestions.map((sug, sidx) => (
                              <li key={sidx} className="font-sans">
                                {sug}
                              </li>
                            ))}
                          </ul>
                        </div>
                      )}
                    </div>
                  )}
                </div>
              </div>
            ) : (
              <div className="text-center py-16 text-slate-500 text-sm">
                Select a research proposal card from the left panel to begin.
              </div>
            )}
          </div>
        </div>
      )}

      {/* Refinement Add Information Overlay Panel */}
      {showRefinement && (
        <div className="fixed inset-0 z-50 bg-slate-950/85 backdrop-blur-md flex items-center justify-center p-4 animate-fadeIn" id="refinement-modal">
          <div className="bg-slate-900 border border-slate-800 p-6 rounded-xl max-w-lg w-full space-y-4 shadow-2xl relative">
            <h3 className="text-sm font-display font-medium text-slate-200 uppercase tracking-widest flex items-center gap-1.5">
              <Sparkles className="h-4 w-4 text-indigo-400" />
              {t.refine_title}
            </h3>
            
            <p className="text-xs text-slate-400">
              {t.refine_desc}
            </p>

            <form onSubmit={handleRegenerateWithRefinement} className="space-y-4">
              <div className="space-y-1.5">
                <label className="text-xs text-slate-400 font-semibold">{t.starting_idea_label}</label>
                <textarea
                  value={newInfoDraft}
                  onChange={(e) => setNewInfoDraft(e.target.value)}
                  placeholder={t.what_changed_placeholder}
                  className="w-full h-32 rounded bg-slate-950/50 p-3 border border-slate-800 text-xs text-slate-200 focus:outline-none focus:border-indigo-505"
                  required
                />
              </div>

              <div className="flex justify-end gap-2 text-xs">
                <button
                  type="button"
                  onClick={() => setShowRefinement(false)}
                  className="px-3 py-1.5 bg-slate-800 rounded text-slate-300"
                >
                  {lang === 'tr' ? "Vazgeç" : "Cancel"}
                </button>
                <button
                  type="submit"
                  disabled={isGenerating}
                  className="px-3 py-1.5 bg-indigo-600 rounded text-white flex items-center gap-1"
                >
                  {isGenerating ? <RefreshCw className="h-3 w-3 animate-spin" /> : null}
                  {lang === 'tr' ? "Yeniden Oluştur" : "Regenerate Directions"}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* History planning session Overlay Modal */}
      {showHistoryModal && (
        <div className="fixed inset-0 z-50 bg-slate-950/85 backdrop-blur-md flex items-center justify-center p-4" id="history-modal">
          <div className="bg-slate-900 border border-slate-800 p-6 rounded-xl max-w-2xl w-full space-y-4 shadow-2xl relative max-h-[80vh] overflow-y-auto">
            <h3 className="text-sm font-display font-medium text-slate-200 uppercase tracking-widest flex items-center gap-1.5">
              <History className="h-4 w-4 text-indigo-400" />
              {t.history_label}
            </h3>

            {history.length === 0 ? (
              <div className="text-center py-8 text-xs text-slate-500">
                {t.history_empty}
              </div>
            ) : (
              <div className="space-y-3">
                {history.map((entry, idx) => (
                  <div key={idx} className="p-4 bg-slate-950/40 border border-slate-850 rounded-lg flex flex-col md:flex-row justify-between gap-4 items-start md:items-center">
                    <div className="space-y-1 text-left">
                      <span className="text-[10px] text-slate-500 font-mono block">
                        {entry.timestamp}
                      </span>
                      <p className="text-xs text-slate-300 line-clamp-2">
                        {entry.idea}
                      </p>
                      {entry.whatChanged && (
                        <span className="text-[10px] text-indigo-400 italic block">
                          {lang === 'tr' ? "Düzeltme:" : "Refined:"} {entry.whatChanged}
                        </span>
                      )}
                    </div>
                    
                    <button
                      onClick={() => handleLoadHistory(entry)}
                      className="px-3 py-1 bg-indigo-950/40 text-[11px] font-semibold text-indigo-400 hover:bg-indigo-950/80 rounded transition inline-flex items-center gap-1"
                    >
                      <Eye className="h-3 w-3" />
                      {lang === 'tr' ? "Geri Yükle" : "Recall"}
                    </button>
                  </div>
                ))}
              </div>
            )}

            <div className="flex justify-end pt-2 border-t border-slate-800">
              <button
                id="close-history-modal"
                onClick={() => setShowHistoryModal(false)}
                className="px-4 py-1.5 bg-slate-800 text-xs rounded text-slate-300 hover:text-white"
              >
                {lang === 'tr' ? "Kapat" : "Close"}
              </button>
            </div>
          </div>
        </div>
      )}

    </div>
  );
}
