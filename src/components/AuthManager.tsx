import { useState, useEffect } from 'react';
import { 
  onAuthStateChanged, 
  signInWithPopup, 
  signOut, 
  User
} from 'firebase/auth';
import { doc, setDoc } from 'firebase/firestore';
import { auth, googleProvider, githubProvider } from '../lib/firebase';
import { db } from '../lib/firebase';
import { 
  UserCircle2, 
  LogOut, 
  CheckCircle2, 
  AlertCircle, 
  Loader2, 
  Cloud, 
  Github
} from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';

interface AuthManagerProps {
  onUserUpdate: (user: User | null) => void;
  lang: 'en' | 'tr';
}

const authTranslations = {
  en: {
    loading: 'Cloud...',
    signIn: 'Sign In',
    anonymous: 'Scholarly Writer',
    activeCloudStorage: 'Active Cloud Repository',
    cloudStorageDesc: 'Save all your polisher drafts, rigorous peer-review filters, and bibliographies cleanly; access them across all your devices!',
    logOut: 'Sign Out',
    connectAccount: 'Connect Scholarly Account',
    connectDesc: 'Sign in to safely backup and preserve your drafts, article analyses, and critical filter texts in the cloud.',
    signInWithGoogle: 'Sign in with Google',
    signInWithGithub: 'Sign in with GitHub',
    securityNotice: '🔒 Fast & secure sign in. No password required.',
    googleSuccess: 'Signed in with Google:',
    githubSuccess: 'Signed in with GitHub:',
    googleError: 'Google sign-in failed.',
    githubError: 'GitHub sign-in failed.',
    popupBlocked: 'Sign-in popup was blocked by your browser. Please allow popups.',
    cancelled: 'Sign-in cancelled.',
    loggedOutSuccess: 'Successfully signed out.',
    emailInUse: 'An account already exists with the same email but a different sign-in method.'
  },
  tr: {
    loading: 'Bulut...',
    signIn: 'Giriş Yap',
    anonymous: 'Seçkin Yazar',
    activeCloudStorage: 'Bulut Kayıt Deposu Aktif',
    cloudStorageDesc: 'Polisaj sonuçlarınızı, kritik peer-review süzgeçlerinizi ve kaynakçalarınızı dilediğiniz kadar kaydedebilir; cihazlar arası senkronize edebilirsiniz!',
    logOut: 'Giriş Çıkışı',
    connectAccount: 'Akademik Hesaba Bağlanın',
    connectDesc: 'Çalışmalarınızı, makale analizlerinizi ve kritik süzgeç metinlerinizi bulutta yedekleyip korumak için giriş yapın.',
    signInWithGoogle: 'Google ile Giriş Yap',
    signInWithGithub: 'GitHub ile Giriş Yap',
    securityNotice: '🔒 Hızlı ve güvenli giriş. Şifre gerektirmez.',
    googleSuccess: 'Google ile giriş yapıldı:',
    githubSuccess: 'GitHub ile giriş yapıldı:',
    googleError: 'Google ile giriş başarısız.',
    githubError: 'GitHub ile giriş başarısız.',
    popupBlocked: 'Giriş penceresi tarayıcı tarafından engellendi. Lütfen pop-up engelleyicisini kapatın.',
    cancelled: 'Giriş işlemi iptal edildi.',
    loggedOutSuccess: 'Başarıyla çıkış yaptınız.',
    emailInUse: 'Bu e-posta adresi ile ilişkili farklı bir giriş yöntemi (örneğin Google) zaten mevcut.'
  }
};

export default function AuthManager({ onUserUpdate, lang }: AuthManagerProps) {
  const t = authTranslations[lang];
  const [currentUser, setCurrentUser] = useState<User | null>(null);
  const [authLoading, setAuthLoading] = useState<boolean>(true);
  const [isOpen, setIsOpen] = useState<boolean>(false);
  
  const [errorStr, setErrorStr] = useState<string | null>(null);
  const [successStr, setSuccessStr] = useState<string | null>(null);
  const [submitting, setSubmitting] = useState<boolean>(false);

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, async (user) => {
      setCurrentUser(user);
      onUserUpdate(user);
      setAuthLoading(false);

      if (user) {
        // Sync user profile in Firestore
        try {
          const userDocRef = doc(db, 'users', user.uid);
          await setDoc(userDocRef, {
            email: user.email,
            displayName: user.displayName || user.email?.split('@')[0] || 'Seçkin Yazar',
            updatedAt: new Date().toISOString()
          }, { merge: true });
        } catch (err) {
          console.error('Failed syncing user profile with Firestore:', err);
        }
      }
    });
    return () => unsubscribe();
  }, [onUserUpdate]);

  const handleGoogleSignIn = async () => {
    setErrorStr(null);
    setSuccessStr(null);
    setSubmitting(true);
    try {
      const result = await signInWithPopup(auth, googleProvider);
      setSuccessStr(`${t.googleSuccess} ${result.user.displayName || result.user.email}`);
      setTimeout(() => {
        setIsOpen(false);
        setSuccessStr(null);
      }, 1500);
    } catch (err: any) {
      console.error('Google Sign-In Error:', err);
      let errMsg = err.message || t.googleError;
      if (err.code === 'auth/popup-blocked') {
        errMsg = t.popupBlocked;
      } else if (err.code === 'auth/cancelled-popup-request') {
        errMsg = t.cancelled;
      }
      setErrorStr(errMsg);
    } finally {
      setSubmitting(false);
    }
  };

  const handleGithubSignIn = async () => {
    setErrorStr(null);
    setSuccessStr(null);
    setSubmitting(true);
    try {
      const result = await signInWithPopup(auth, githubProvider);
      setSuccessStr(`${t.githubSuccess} ${result.user.displayName || result.user.email}`);
      setTimeout(() => {
        setIsOpen(false);
        setSuccessStr(null);
      }, 1500);
    } catch (err: any) {
      console.error('GitHub Sign-In Error:', err);
      let errMsg = err.message || t.githubError;
      if (err.code === 'auth/popup-blocked') {
        errMsg = t.popupBlocked;
      } else if (err.code === 'auth/cancelled-popup-request') {
        errMsg = t.cancelled;
      } else if (err.code === 'auth/account-exists-with-different-credential') {
        errMsg = t.emailInUse;
      }
      setErrorStr(errMsg);
    } finally {
      setSubmitting(false);
    }
  };

  const handleLogActiveOut = async () => {
    try {
      await signOut(auth);
      setSuccessStr(t.loggedOutSuccess);
      setTimeout(() => {
        setIsOpen(false);
        setSuccessStr(null);
      }, 1000);
    } catch (err: any) {
      console.error('Sign Out Error:', err);
    }
  };

  return (
    <div className="relative inline-block font-sans" id="auth_manager_root">
      {/* Trigger Button */}
      {authLoading ? (
        <div className="p-2 flex items-center gap-1.5 bg-slate-900 border border-slate-800 rounded-xl text-xs text-slate-450">
          <Loader2 className="w-3.5 h-3.5 animate-spin" />
          <span className="text-[10px] font-mono">{t.loading}</span>
        </div>
      ) : currentUser ? (
        <button
          onClick={() => setIsOpen(!isOpen)}
          id="auth_trigger_user"
          className="flex items-center gap-2 px-3.5 py-1.8 bg-gradient-to-r from-cyan-950/60 to-slate-900 border border-cyan-550/40 rounded-xl text-xs font-bold text-cyan-400 hover:border-cyan-500/60 transition cursor-pointer shadow-md select-none shrink-0"
        >
          <Cloud className="w-4 h-4 text-cyan-400 shrink-0" />
          <span className="max-w-[100px] truncate font-sans font-medium">
            {currentUser.displayName || currentUser.email?.split('@')[0] || t.anonymous}
          </span>
          <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse shrink-0" />
        </button>
      ) : (
        <button
          onClick={() => {
            setIsOpen(!isOpen);
            setErrorStr(null);
            setSuccessStr(null);
          }}
          id="auth_trigger_guest"
          className="flex items-center gap-2 px-3.5 py-1.8 bg-slate-900/85 hover:bg-slate-850 hover:border-slate-700 border border-slate-800 rounded-xl text-xs font-bold text-slate-350 cursor-pointer transition select-none shadow-md shrink-0"
        >
          <UserCircle2 className="w-4 h-4 text-slate-450 shrink-0" />
          <span>{t.signIn}</span>
        </button>
      )}

      {/* Popover Card */}
      <AnimatePresence>
        {isOpen && (
          <>
            <div className="fixed inset-0 z-40 bg-slate-950/20" onClick={() => setIsOpen(false)} />
            
            <motion.div
              initial={{ opacity: 0, y: 12, scale: 0.96 }}
              animate={{ opacity: 1, y: 0, scale: 1 }}
              exit={{ opacity: 0, y: 12, scale: 0.96 }}
              className="absolute right-0 mt-2.5 w-80 bg-slate-950 border border-slate-900/90 rounded-2xl p-5 shadow-2xl z-50 space-y-4"
              id="auth_popover_card"
            >
              {/* Signed In State */}
              {currentUser ? (
                <div className="space-y-4">
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 rounded-full bg-cyan-950 border border-cyan-800 flex items-center justify-center font-display font-extrabold text-cyan-400">
                      {currentUser.displayName?.substring(0, 2).toUpperCase() || currentUser.email?.substring(0, 2).toUpperCase() || 'U'}
                    </div>
                    <div className="min-w-0">
                      <h4 className="text-xs font-bold text-slate-100 truncate">
                        {currentUser.displayName || t.anonymous}
                      </h4>
                      <p className="text-[10px] text-slate-400 truncate">{currentUser.email}</p>
                    </div>
                  </div>

                  <div className="p-3 bg-cyan-950/15 border border-cyan-900/30 rounded-xl space-y-1.5">
                    <span className="text-[9px] font-mono font-bold text-cyan-400 uppercase tracking-wide flex items-center gap-1">
                      <Cloud className="w-3.5 h-3.5 text-cyan-400" />
                      {t.activeCloudStorage}
                    </span>
                    <p className="text-[10.5px] text-slate-300 font-sans leading-relaxed">
                      {t.cloudStorageDesc}
                    </p>
                  </div>

                  {successStr && (
                    <div className="p-2.5 bg-emerald-950/30 border border-emerald-900/40 text-[10.5px] text-emerald-400 rounded-xl flex items-center gap-2">
                      <CheckCircle2 className="w-3.5 h-3.5 shrink-0" />
                      <span>{successStr}</span>
                    </div>
                  )}

                  <div className="border-t border-slate-900/60 pt-3 flex items-center justify-between">
                    <span className="text-[10px] text-slate-500 font-mono">ID: {currentUser.uid.substring(0, 6)}...</span>
                    <button
                      onClick={handleLogActiveOut}
                      className="px-3 py-1.5 bg-rose-955/20 hover:bg-rose-955/35 border border-rose-900/40 text-rose-400 hover:text-rose-300 transition rounded-xl text-[10.5px] font-bold flex items-center gap-1.5 cursor-pointer"
                    >
                      <LogOut className="w-3.5 h-3.5" />
                      {t.logOut}
                    </button>
                  </div>
                </div>
              ) : (
                /* Unauthenticated Providers List Only */
                <div className="space-y-4">
                  <div className="space-y-1">
                    <div className="text-xs font-display font-extrabold text-slate-200 uppercase tracking-wide">
                      {t.connectAccount}
                    </div>
                    <p className="text-[10.5px] text-slate-400 leading-relaxed font-sans">
                      {t.connectDesc}
                    </p>
                  </div>

                  <div className="space-y-2 pt-1">
                    {/* Google Button */}
                    <button
                      type="button"
                      disabled={submitting}
                      onClick={handleGoogleSignIn}
                      className="w-full py-2.5 bg-white hover:bg-slate-50 text-slate-900 text-xs font-bold rounded-xl transition flex items-center justify-center gap-2 cursor-pointer shadow-sm border border-slate-200"
                    >
                      <svg className="w-4 h-4 shrink-0" viewBox="0 0 24 24">
                        <path
                          fill="#4285F4"
                          d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"
                        />
                        <path
                          fill="#34A853"
                          d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"
                        />
                        <path
                          fill="#FBBC05"
                          d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.06H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.94l2.85-2.22.81-.63z"
                        />
                        <path
                          fill="#EA4335"
                          d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.06l3.66 2.84c.87-2.6 3.3-4.52 6.16-4.52z"
                        />
                      </svg>
                      <span className="font-sans">{t.signInWithGoogle}</span>
                    </button>

                    {/* GitHub Button */}
                    <button
                      type="button"
                      disabled={submitting}
                      onClick={handleGithubSignIn}
                      className="w-full py-2.5 bg-slate-900 hover:bg-slate-850 text-white text-xs font-bold rounded-xl transition border border-slate-800 flex items-center justify-center gap-2 cursor-pointer shadow-md"
                    >
                      <Github className="w-4 h-4 shrink-0 text-slate-100" />
                      <span className="font-sans">{t.signInWithGithub}</span>
                    </button>
                  </div>

                  {errorStr && (
                    <div className="p-2.5 bg-rose-955/20 border border-rose-900/35 text-[10px] text-rose-450 rounded-xl flex items-center gap-2">
                      <AlertCircle className="w-3.5 h-3.5 shrink-0" />
                      <span className="leading-tight font-sans">{errorStr}</span>
                    </div>
                  )}

                  {successStr && (
                    <div className="p-2.5 bg-emerald-950/20 border border-emerald-900/35 text-[10px] text-emerald-400 rounded-xl flex items-center gap-2">
                      <CheckCircle2 className="w-3.5 h-3.5 shrink-0" />
                      <span className="font-sans">{successStr}</span>
                    </div>
                  )}

                  <div className="text-[10px] text-center text-slate-500 font-sans border-t border-slate-900/50 pt-2 bg-transparent select-none animate-pulse">
                    {t.securityNotice}
                  </div>
                </div>
              )}
            </motion.div>
          </>
        )}
      </AnimatePresence>
    </div>
  );
}
