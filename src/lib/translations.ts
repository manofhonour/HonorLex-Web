export interface Translation {
  // Common UI
  brand_title: string;
  brand_subtitle: string;
  readability_label: string;
  readability_empty: string;
  flesch_ease: string;
  sentences: string;
  words: string;
  export_title: string;
  export_select_format: string;
  export_plain_text: string;
  export_word_doc: string;
  export_toast_success: string;
  autosaved_toast: string;
  activity_logs: string;
  working_mode: string;
  off_mode: string;
  on_mode: string;
  system_env_api_warning: string;
  ethical_notice_title: string;
  ethical_notice_desc: string;
  static_demo_title: string;
  static_demo_desc: string;
  static_demo_cta: string;

  // Tabs
  tab_polisher: string;
  tab_coach: string;
  tab_suggestor: string;
  tab_auditor: string;
  tab_scanner: string;
  tab_hub: string;
  tab_chat: string;

  // Footer
  footer_text: string;

  // Activity Drawer
  archive_title: string;
  drawer_local_prefix: string;
  drawer_cloud_prefix: string;
  activity_log_storage: string;
  activity_deleted_warn: string;
  no_saved_records: string;
  no_records_explanation: string;
  restore_cta: string;
  cloud_locked_title: string;
  cloud_locked_desc: string;
  cloud_benefits_title: string;
  cloud_benefit_1: string;
  cloud_benefit_2: string;
  cloud_benefit_3: string;
  cloud_benefit_prompt: string;
  placeholder_search_archive: string;
  loading_from_cloud: string;
  cloud_empty_title: string;
  cloud_empty_desc: string;
  edit_record_title: string;
  delete_record_title: string;
  restore_from_cloud: string;
  cloud_securely_connected: string;
  font_normal: string;
  font_large: string;
  font_xlarge: string;
  font_scale_label: string;
  text_cleared: string;
}

export const translations: { [lang: string]: any } = {
  en: {
    // Common UI
    brand_title: "HonorLex",
    brand_subtitle: "ELT & Applied Linguistics Writing Suite, Semantic Thesaurus, & Reference Auditor",
    readability_label: "Readability",
    readability_empty: "Empty Editor",
    flesch_ease: "Flesch Ease",
    sentences: "Sentences",
    words: "Words",
    export_title: "Export Manuscript",
    export_select_format: "Select Format",
    export_plain_text: "Plain Text (.txt)",
    export_word_doc: "Word Document (.doc)",
    export_toast_success: "Manuscript exported successfully!",
    autosaved_toast: "Draft auto-saved successfully",
    activity_logs: "Activity Logs",
    working_mode: "Working Mode",
    off_mode: "Local (Offline)",
    on_mode: "Gemini AI Mode",
    system_env_api_warning: "System Environment & API Warning",
    ethical_notice_title: "Reference Integrity & Ethics Assurance Notice",
    ethical_notice_desc: "HonorLex checks bibliographic metadata against available public metadata sources when possible. It helps identify citation errors and possible fabrication risks, but it does not guarantee academic integrity, factual accuracy, or source quality.",
    static_demo_title: "Static Landing & Demo Mode (Standalone Preview)",
    static_demo_desc: "You are viewing the static frontend host of HonorLex on GitHub Pages. Real-time Gemini AI polish and live metadata database verifications are simulated in this static environment. To experience full verification with active databases and actual AI, visit our deployed version:",
    static_demo_cta: "Go to Full-Stack AI Version →",

    // Tabs
    tab_polisher: "Manuscript Polisher",
    tab_coach: "ELT Writing Coach",
    tab_suggestor: "Topic Suggestor",
    tab_auditor: "Citation Auditor",
    tab_scanner: "Bibliography Scanner",
    tab_hub: "Scholarly Hub & Manuals",
    tab_chat: "AI Copilot Chat",

    // Footer
    footer_text: "HonorLex • Styled with Tailwind CSS, configured with Vite, & orchestrated server-side by Antigravity Agents. Privacy guaranteed: zero permanent database logging.",

    // Activity Drawer
    archive_title: "Academic Archive Suite",
    drawer_local_prefix: "Local History",
    drawer_cloud_prefix: "Cloud Archive",
    activity_log_storage: "Local Session Memory",
    activity_deleted_warn: "Your last 10 scholarly analyses are temporarily stored in browser memory. They reset when you close the session.",
    no_saved_records: "No Saved Records",
    no_records_explanation: "Text polishing, bibliography scans, and metadata analyses will appear here as you perform them.",
    restore_cta: "Restore",
    cloud_locked_title: "CLOUD ARCHIVE LOCKED",
    cloud_locked_desc: "Sign in to securely and permanently save your manuscript drafts, editor reports, and validated reference metadata without limits!",
    cloud_benefits_title: "✨ Cloud Privileges:",
    cloud_benefit_1: "• Infinite storage with zero time limit",
    cloud_benefit_2: "• Load instantly on any device, anytime",
    cloud_benefit_3: "• Custom tags & researcher notes per record",
    cloud_benefit_prompt: "Create a profile instantly using the 'Sign In' button in the header.",
    placeholder_search_archive: "Search archived files...",
    loading_from_cloud: "Loading from scientific repository...",
    cloud_empty_title: "CLOUD IS EMPTY",
    cloud_empty_desc: "No cloud-saved outputs visible. Successful operations will autosave, or you can manually backup with custom titles from your local history!",
    edit_record_title: "Edit Record",
    delete_record_title: "Permanently Delete from Cloud",
    restore_from_cloud: "Restore from Cloud",
    cloud_securely_connected: "Cloud Archive Securely Connected",
    font_normal: "Normal File Scale",
    font_large: "Large File Scale",
    font_xlarge: "Extra-Large File Scale",
    font_scale_label: "FontSize Level",
    text_cleared: "Workspace cleared successfully.",

    // General terms
    cancel: "Cancel",
    save: "Save To Cloud",
    save_permanent: "Permanently Save",
    cloud_save_title: "Academic Draft Title:",
    cloud_save_placeholder: "e.g., Introduction Revision v2",
    cloud_save_notes: "Observations / Notes (Optional):",
    cloud_save_notes_placeholder: "Add context notes, related journals or tasks here...",
    edit_cloud_title: "Edit Cloud Record",
    edit_cloud_subtitle: "Update archive title or researcher observations.",
    title: "Title",
    observation_notes: "Observation Notes",
    back: "Go Back",
    save_changes: "Save Changes",
    delete_confirm: "Are you sure you want to permanently delete this record from the Cloud archive? This action cannot be undone.",
    clear_logs_cta: "Clear Workspace Logs",
    working_state_indicator: "Gemini 3.5 Live Connection",
    operating_offline_banner: "Offline / No Web API Required",
    working_mode_title: "Work Mode:"
  },
  tr: {
    // Common UI
    brand_title: "HonorLex",
    brand_subtitle: "ELT & Uygulamalı Dilbilim Yazım Havuzu, Semantik Eş Anlamlılar ve Kaynakça Denetici",
    readability_label: "Okunabilirlik",
    readability_empty: "Boş Editör",
    flesch_ease: "Flesch Kolaylık",
    sentences: "Cümle Sayısı",
    words: "Kelime Sayısı",
    export_title: "Çalışmayı Dışa Aktar",
    export_select_format: "Format Seçin",
    export_plain_text: "Düz Metin (.txt)",
    export_word_doc: "Word Belgesi (.doc)",
    export_toast_success: "Çalışma başarıyla dışa aktarıldı!",
    autosaved_toast: "Çalışma otomatik olarak kaydedildi",
    activity_logs: "İşlem Geçmişi",
    working_mode: "Çalışma Modu",
    off_mode: "⚡ Yerel (Çevrimdışı)",
    on_mode: "🤖 Gemini AI Modu",
    system_env_api_warning: "Sistem Ortamı ve API Uyarısı",
    ethical_notice_title: "Kaynak Güvenilirliği & Etik Güvence Bildirimi",
    ethical_notice_desc: "HonorLex, bibliyografik meta verileri mümkün olduğunda açık kamu kaynakları üzerinden denetler. Atıf hatalarını ve olası sahte kaynak risklerini tespit etmeye yardımcı olur, ancak akademik bütünlük, olgusal doğruluk veya kaynak kalitesini doğrudan garanti etmez.",
    static_demo_title: "Statik Tanıtım & Çevrimdışı Önizleme",
    static_demo_desc: "Şu an HonorLex uygulamasının statik arayüz sürümünü görüntülüyorsunuz. Gerçek zamanlı Gemini AI iyileştirmeleri ve canlı kaynak meta veri sorguları bu statik ortamda canlandırılmaktadır. Canlı veri analizi ve gerçek yapay zeka deneyimi için çalışan sürümümüzü ziyaret edin:",
    static_demo_cta: "Cloud Run AI Sürümüne Git →",

    // Tabs
    tab_polisher: "Metin İyileştirici",
    tab_coach: "ELT Yazım Danışmanı",
    tab_suggestor: "Konu ve Araştırma Sorusu Önerici",
    tab_auditor: "Atıf Denetleyicisi",
    tab_scanner: "Kaynak Listesi Tarayıcı",
    tab_hub: "Akademik Merkez & Kılavuzlar",
    tab_chat: "Yapay Zeka Sohbeti",

    // Footer
    footer_text: "HonorLex • Tailwind CSS kullanılarak tasarlanmış, Vite ile yapılandırılmış ve sunucu tarafında Antigravity Ajanları tarafından koordine edilmiştir. Gizlilik garantilidir: kalıcı veritabanı kaydı tutulmaz.",

    // Activity Drawer
    archive_title: "Akademik Arşiv Paketi",
    drawer_local_prefix: "Yerel Geçmiş",
    drawer_cloud_prefix: "Bulut Arşivi",
    activity_log_storage: "Yerel Seans Hafızası",
    activity_deleted_warn: "Son 10 bilimsel analiziniz tarayıcı belleğinde geçici olarak saklanır. Oturumu kapattığınızda sıfırlanır.",
    no_saved_records: "Kayıt Bulunmamaktadır",
    no_records_explanation: "Metin iyileştirme, kaynakça denetimi ve veri analizleriniz yapıldıkça burada listelenecektir.",
    restore_cta: "Yükle",
    cloud_locked_title: "BULUT ARŞİVİ KİLİTLİ",
    cloud_locked_desc: "Yazı taslaklarınızı, editör raporlarınızı ve doğrulanan kaynakçalarınızı limitsiz ve kalıcı olarak kaydetmek için giriş yapın!",
    cloud_benefits_title: "✨ Bulutun Ayrıcalıkları:",
    cloud_benefit_1: "• Süre sınırı olmadan sonsuz saklama",
    cloud_benefit_2: "• İstediğin an, dilediğin cihazdan anında geri yükleme",
    cloud_benefit_3: "• Kayıtlara özel bilimsel etiket & not ekleme",
    cloud_benefit_prompt: "Header alanındaki 'Giriş Yap' butonu ile anında profil oluşturabilirsiniz.",
    placeholder_search_archive: "Arşivlenen kayıtlarda arayın...",
    loading_from_cloud: "Bilimsel depodan yükleniyor...",
    cloud_empty_title: "BULUT BOMBOŞ",
    cloud_empty_desc: "Henüz buluta kaydedilmiş akademik çıktı görünmüyor. Sol taraftan işlem yapıldığında otomatik kaydolur ya da yerel geçmişten 'Buluta Yedekle' butonuyla kendi özel adınızla ekleyebilirsiniz!",
    edit_record_title: "Kaydı Düzenle",
    delete_record_title: "Buluttan Kalıcı Olarak Sil",
    restore_from_cloud: "Buluttan Geri Yükle",
    cloud_securely_connected: "Bulut Arşivi Güvenle Bağlandı",
    font_normal: "Normal Yazı Puntosu",
    font_large: "Büyük Yazı Puntosu",
    font_xlarge: "Çok Büyük Yazı Puntosu",
    font_scale_label: "Metin Boyutu",
    text_cleared: "Çalışma alanı başarıyla temizlendi.",

    // General terms
    cancel: "Vazgeç",
    save: "Buluta Yedekle",
    save_permanent: "Kayıt Edin",
    cloud_save_title: "Akademik Taslak Başlığı:",
    cloud_save_placeholder: "Örn: Giriş Revizyonu v2 (Bilimsel Akış)",
    cloud_save_notes: "Gözlem / Notlar (Opsiyonel):",
    cloud_save_notes_placeholder: "Metniniz, atıflarınız veya sonraki çalışmalar için ek notlar...",
    edit_cloud_title: "Bulut Kaydını Düzenle",
    edit_cloud_subtitle: "Arşiv ismini veya gözlem notlarınızı yenileyin.",
    title: "Başlık",
    observation_notes: "Gözlem Notları",
    back: "Geri",
    save_changes: "Değişiklikleri Kaydet",
    delete_confirm: "Bu kaydı bulut deposundan kalıcı olarak silmek istediğinize emin misiniz? Bu işlem geri alınamaz.",
    clear_logs_cta: "Yerel Geçmişi Temizle",
    working_state_indicator: "Gemini 3.5 Canlı Bağlantısı",
    operating_offline_banner: "Çevrimdışı / Web API Gerekmez",
    working_mode_title: "Çalışma Modu:"
  }
};
