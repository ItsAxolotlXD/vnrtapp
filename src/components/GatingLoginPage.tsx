import React, { useState, FormEvent } from "react";
import { motion, AnimatePresence } from "motion/react";
import { 
  signInWithEmailAndPassword, 
  createUserWithEmailAndPassword, 
  GoogleAuthProvider, 
  signInWithPopup, 
  updateProfile 
} from "firebase/auth";
import { auth } from "../firebase";
import { Lock, Mail, Eye, EyeOff, Sparkles, AlertCircle, LogIn, UserPlus, HelpCircle } from "lucide-react";

interface GatingLoginPageProps {
  isDark: boolean;
  onEnterGuestMode?: () => void;
}

const showToast = (message: string, type: "success" | "error" | "info" | "warning" = "success") => {
  window.dispatchEvent(new CustomEvent("vplay-toast", { detail: { message, type } }));
};

export default function GatingLoginPage({ isDark, onEnterGuestMode }: GatingLoginPageProps) {
  const [mode, setMode] = useState<"signIn" | "signUp">("signIn");
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault();
    setError("");
    setLoading(true);

    const emailInput = username.includes("@") ? username : `${username}@vplay.vn`;

    try {
      if (mode === "signIn") {
        try {
          await signInWithEmailAndPassword(auth, emailInput, password);
          showToast("Đăng nhập thành công", "success");
        } catch (signInErr: any) {
          // If the demo account fails to log in because it does not exist yet, auto-provision it.
          const isDemoAccount = 
            (emailInput === "guest@vplay.vn" && password === "123456") ||
            (emailInput === "vplaybeta@vplay.vn" && (password === "vplaybeta" || password === "123456"));

          if (isDemoAccount && (
            signInErr.code === "auth/invalid-credential" || 
            signInErr.code === "auth/user-not-found" ||
            signInErr.code === "auth/wrong-password"
          )) {
            try {
              const userCred = await createUserWithEmailAndPassword(auth, emailInput, password);
              await updateProfile(userCred.user, { 
                displayName: "Tài khoản Vplay Beta",
                photoURL: "https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?w=100&h=100&fit=crop"
              });
              showToast("Đăng nhập dùng thử thành công", "success");
              return;
            } catch (autoCreateErr) {
              console.error("Auto demo account creation failed", autoCreateErr);
              throw signInErr; // throw original sign-in error if auto-creation also fails
            }
          } else {
            throw signInErr;
          }
        }
      } else {
        // Sign Up Mode
        if (password.length < 6) {
          setError("Mật khẩu phải có độ dài từ 6 ký tự trở lên.");
          setLoading(false);
          return;
        }
        if (password !== confirmPassword) {
          setError("Xác nhận mật khẩu không trùng khớp.");
          setLoading(false);
          return;
        }

        const userCred = await createUserWithEmailAndPassword(auth, emailInput, password);
        
        // Default display name to "Tài khoản Vplay"
        await updateProfile(userCred.user, { 
          displayName: "Tài khoản Vplay",
          photoURL: "https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?w=100&h=100&fit=crop"
        });

        showToast("Đăng ký tài khoản thành công!", "success");
      }
    } catch (err: any) {
      console.error("Gating Auth Error:", err);
      const code = err.code;
      if (
        code === "auth/invalid-credential" ||
        code === "auth/wrong-password" ||
        code === "auth/user-not-found"
      ) {
        setError("Tên đăng nhập hoặc mật khẩu không chính xác.");
      } else if (code === "auth/email-already-in-use") {
        setError("Email hoặc tên tài khoản này đã được sử dụng.");
      } else if (code === "auth/invalid-email") {
        setError("Định dạng email hoặc tài khoản không hợp lệ.");
      } else if (code === "auth/too-many-requests") {
        setError("Tài khoản bị tạm khóa do đăng nhập sai quá nhiều lần. Vui lòng thử lại sau.");
      } else if (code === "auth/network-request-failed") {
        setError("Lỗi kết nối mạng. Vui lòng kiểm tra lại đường truyền internet.");
      } else {
        setError(err.message || "Không thể thực hiện. Vui lòng thử lại sau.");
      }
      showToast(mode === "signIn" ? "Đăng nhập thất bại" : "Đăng ký thất bại", "error");
    } finally {
      setLoading(false);
    }
  };

  const handleGoogleLogin = async () => {
    setError("");
    setLoading(true);
    try {
      const provider = new GoogleAuthProvider();
      const userCred = await signInWithPopup(auth, provider);
      
      // If new Google user, check/set default display name as "Tài khoản Vplay" if they don't have one
      if (userCred.user && !userCred.user.displayName) {
        await updateProfile(userCred.user, { displayName: "Tài khoản Vplay" });
      }
      showToast("Đăng nhập bằng Google thành công", "success");
    } catch (err: any) {
      if (err.code !== "auth/popup-closed-by-user" && err.code !== "auth/cancelled-popup-request") {
        showToast("Đăng nhập không thành công", "error");
        console.error("Google Auth Error:", err);
        setError("Lỗi đăng nhập Google: " + (err.message || "Vui lòng thử lại sau."));
      }
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className={`fixed inset-0 z-[9999] flex items-center justify-center p-4 md:p-8 ${
      isDark ? "bg-[#090a0f]" : "bg-slate-50"
    } overflow-hidden font-sans`}>
      {/* Background radial effects */}
      <div className="absolute top-[-10%] left-[-10%] w-[50%] h-[50%] rounded-full bg-indigo-500/10 blur-[150px] pointer-events-none select-none" />
      <div className="absolute bottom-[-10%] right-[-10%] w-[50%] h-[50%] rounded-full bg-[#4AC4FE]/10 blur-[150px] pointer-events-none select-none" />

      <motion.div
        initial={{ opacity: 0, scale: 0.95, y: 15 }}
        animate={{ opacity: 1, scale: 1, y: 0 }}
        transition={{ type: "spring", damping: 25, stiffness: 180 }}
        className={`relative w-full max-w-3xl h-auto min-h-[440px] md:min-h-[480px] overflow-hidden flex flex-col md:flex-row rounded-[24px] md:rounded-[36px] ${
          isDark
            ? "bg-[#12131a]/95 border-white/20 text-white shadow-[0_24px_50px_-12px_rgba(0,0,0,0.8),_inset_0_1.5px_0_0_rgba(255,255,255,0.4),_inset_0_0_0_1px_rgba(255,255,255,0.12)]"
            : "bg-white/95 border-slate-300 text-slate-900 shadow-[0_24px_50px_-12px_rgba(15,23,42,0.12),_inset_0_1.5px_0_0_rgba(255,255,255,0.9),_inset_0_0_0_1px_rgba(255,255,255,0.5)]"
        } border`}
      >
        {/* Left pane: Visual / Brand representation - hidden on mobile to fit modern phone heights */}
        <div className="hidden md:flex md:w-[42%] bg-gradient-to-br from-[#1d1f2f] to-[#0d0e14] p-6 md:p-8 relative flex-col justify-center overflow-hidden shrink-0 border-r border-white/5">
          <div className="absolute top-0 right-0 w-80 h-80 bg-[#4AC4FE]/10 blur-[80px] -mr-20 -mt-20" />
          <div className="absolute bottom-0 left-0 w-80 h-80 bg-indigo-500/10 blur-[80px] -ml-20 -mb-20" />

          <div className="relative z-10 space-y-5">
            <div className="w-12 h-12 rounded-2xl bg-white/5 backdrop-blur-xl flex items-center justify-center border border-white/10 shadow-lg">
              <img
                src="https://static.wikia.nocookie.net/ftv/images/a/a6/Imagedskvjndkv.png/revision/latest?cb=20260430103502&path-prefix=vi"
                className="w-8 h-8 object-contain"
                alt="Vplay"
                referrerPolicy="no-referrer"
              />
            </div>
            <div className="space-y-3">
              <h1 className="text-2xl md:text-3xl font-extrabold text-white tracking-tight leading-tight uppercase font-google">
                Chào mừng đến với <span className="bg-gradient-to-r from-violet-400 via-purple-400 to-indigo-400 bg-clip-text text-transparent font-black">Vplay</span>
              </h1>
              <p className="text-white/60 text-xs md:text-sm font-medium leading-relaxed">
                Nền tảng ứng dụng truyền hình thế hệ mới. Vui lòng đăng nhập vào tài khoản Vplay để thưởng thức hàng trăm kênh chất lượng cao chuẩn HD siêu nét và siêu mượt
              </p>
            </div>
          </div>
        </div>

        {/* Right pane: Actual Sign-In & Sign-Up Form */}
        <div className="flex-1 p-5 sm:p-6 md:p-8 overflow-y-auto flex items-center">
          <div className="w-full max-w-md mx-auto space-y-6">
            
            {/* Mobile Header: only visible on screens < md */}
            <div className="flex flex-col items-center text-center space-y-2 md:hidden mb-2 animate-fadeIn">
              <div className={`w-10 h-10 rounded-xl flex items-center justify-center border shadow-md ${
                isDark ? "bg-white/5 border-white/10" : "bg-black/5 border-slate-100"
              }`}>
                <img
                  src="https://static.wikia.nocookie.net/ftv/images/a/a6/Imagedskvjndkv.png/revision/latest?cb=20260430103502&path-prefix=vi"
                  className="w-6 h-6 object-contain"
                  alt="Vplay Logo"
                  referrerPolicy="no-referrer"
                />
              </div>
              <h1 className={`text-lg font-bold tracking-tight uppercase ${isDark ? "text-white" : "text-slate-900"}`}>
                Chào mừng đến với <span className="bg-gradient-to-r from-violet-400 via-purple-400 to-indigo-400 bg-clip-text text-transparent font-black">Vplay</span>
              </h1>
            </div>

            {/* Mode Switcher */}
            <div className="p-1 flex rounded-xl border bg-white/5 border-white/10 backdrop-blur-md">
              <button
                type="button"
                onClick={() => { setMode("signIn"); setError(""); }}
                className={`flex-1 py-2 rounded-lg text-xs font-bold transition-all flex items-center justify-center gap-2 ${
                  mode === "signIn"
                    ? "bg-white/20 text-white border border-white/20 shadow-inner"
                    : "text-white/60 hover:text-white"
                }`}
              >
                <LogIn size={14} />
                Đăng nhập
              </button>
              <button
                type="button"
                onClick={() => { setMode("signUp"); setError(""); }}
                className={`flex-1 py-2 rounded-lg text-xs font-bold transition-all flex items-center justify-center gap-2 ${
                  mode === "signUp"
                    ? "bg-white/20 text-white border border-white/20 shadow-inner"
                    : "text-white/60 hover:text-white"
                }`}
              >
                <UserPlus size={14} />
                Tạo tài khoản
              </button>
            </div>

            <div>
              <h2 className="text-2xl font-black tracking-tight uppercase">
                {mode === "signIn" ? "Đăng nhập tài khoản" : "Tạo tài khoản mới"}
              </h2>
              <p className={`text-xs font-semibold ${isDark ? "text-slate-400" : "text-slate-500"} mt-1.5`}>
                {mode === "signIn" 
                  ? "Vui lòng nhập thông tin để truy cập hệ thống truyền hình Vplay."
                  : "Đăng ký nhanh bằng email để có trải nghiệm xem TV 4K tốt nhất."}
              </p>
            </div>

            {error && (
              <motion.div
                initial={{ scale: 0.95, opacity: 0 }}
                animate={{ scale: 1, opacity: 1 }}
                className="p-3.5 bg-red-500/10 border border-red-500/20 text-red-500 rounded-xl text-xs font-bold flex items-center gap-2.5"
              >
                <AlertCircle size={16} className="shrink-0" />
                <span className="leading-snug">{error}</span>
              </motion.div>
            )}

            <form onSubmit={handleSubmit} className="space-y-4">
              <div className="space-y-2">
                <label className={`text-[10px] font-bold uppercase tracking-wider opacity-60 ml-1 ${
                  isDark ? "text-white" : "text-slate-900"
                }`}>
                  Tên đăng nhập / Email
                </label>
                <div className={`relative flex items-center rounded-2xl overflow-hidden transition-all ${
                  isDark ? "bg-white/5 border-white/5" : "bg-black/5 border-slate-200"
                } border`}>
                  <Mail size={16} className="absolute left-4 opacity-40" />
                  <input
                    required
                    type="text"
                    value={username}
                    onChange={(e) => setUsername(e.target.value)}
                    placeholder="Nhập tài khoản hoặc email của bạn..."
                    className="w-full pl-11 pr-4 py-3.5 bg-transparent outline-none text-sm font-medium placeholder-slate-500 focus:placeholder-slate-400"
                  />
                </div>
              </div>

              <div className="space-y-2">
                <label className={`text-[10px] font-bold uppercase tracking-wider opacity-60 ml-1 ${
                  isDark ? "text-white" : "text-slate-900"
                }`}>
                  Mật khẩu
                </label>
                <div className={`relative flex items-center rounded-2xl overflow-hidden transition-all ${
                  isDark ? "bg-white/5 border-white/5" : "bg-black/5 border-slate-200"
                } border`}>
                  <Lock size={16} className="absolute left-4 opacity-40" />
                  <input
                    required
                    type={showPassword ? "text" : "password"}
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    placeholder="Nhập mật khẩu truy cập..."
                    className="w-full pl-11 pr-12 py-3.5 bg-transparent outline-none text-sm font-medium placeholder-slate-500 focus:placeholder-slate-400"
                  />
                  <button
                    type="button"
                    onClick={() => setShowPassword(!showPassword)}
                    className="absolute right-4 text-slate-400 hover:text-white transition-colors"
                  >
                    {showPassword ? <EyeOff size={16} /> : <Eye size={16} />}
                  </button>
                </div>
              </div>

              {mode === "signUp" && (
                <div className="space-y-2 animate-fadeIn">
                  <label className={`text-[10px] font-bold uppercase tracking-wider opacity-60 ml-1 ${
                    isDark ? "text-white" : "text-slate-900"
                  }`}>
                    Xác nhận mật khẩu
                  </label>
                  <div className={`relative flex items-center rounded-2xl overflow-hidden transition-all ${
                    isDark ? "bg-white/5 border-white/5" : "bg-black/5 border-slate-200"
                  } border`}>
                    <Lock size={16} className="absolute left-4 opacity-40" />
                    <input
                      required
                      type={showPassword ? "text" : "password"}
                      value={confirmPassword}
                      onChange={(e) => setConfirmPassword(e.target.value)}
                      placeholder="Nhập lại mật khẩu để xác thực..."
                      className="w-full pl-11 pr-4 py-3.5 bg-transparent outline-none text-sm font-medium placeholder-slate-500 focus:placeholder-slate-400"
                    />
                  </div>
                </div>
              )}

              <button
                type="submit"
                disabled={loading}
                className="w-full bg-white/10 hover:bg-white/20 border border-white/20 text-white font-extrabold text-[11px] tracking-widest py-4 rounded-xl mt-4 cursor-pointer transition-all disabled:opacity-50 uppercase shadow-lg flex items-center justify-center gap-2 backdrop-blur-md"
              >
                {loading ? (
                  <>
                    <div className="w-4 h-4 rounded-full border-2 border-black border-t-transparent animate-spin" />
                    <span>Đang xử lý...</span>
                  </>
                ) : (
                  <span>{mode === "signIn" ? "Đăng nhập hệ thống" : "Tạo tài khoản"}</span>
                )}
              </button>
            </form>

            {/* Use Guest Mode Options */}
            {onEnterGuestMode && (
              <div className="pt-2 text-center">
                <button
                  type="button"
                  onClick={onEnterGuestMode}
                  className="inline-flex items-center gap-1.5 text-xs font-bold transition-all py-2 px-4 rounded-xl border bg-white/5 border-white/10 text-white hover:bg-white/10 backdrop-blur-md"
                >
                  <HelpCircle size={14} />
                  Sử dụng tài khoản đăng xuất (Xem giới hạn)
                </button>
                <p className="text-[10px] opacity-40 mt-1">
                  * Trực tiếp truyền hình yêu cầu đăng nhập. Bạn có thể duyệt ứng dụng.
                </p>
              </div>
            )}

            <div className="flex items-center gap-4 py-1">
              <div className={`flex-1 h-[1px] ${isDark ? "bg-white/5" : "bg-slate-200"}`} />
              <span className="text-[9px] font-bold uppercase opacity-30 tracking-[0.2em] whitespace-nowrap">Hoặc tiếp tục với</span>
              <div className={`flex-1 h-[1px] ${isDark ? "bg-white/5" : "bg-slate-200"}`} />
            </div>

            <button
              type="button"
              onClick={handleGoogleLogin}
              disabled={loading}
              className="w-full h-12 flex items-center justify-center gap-3 text-xs font-bold transition-all bg-white/5 hover:bg-white/10 border border-white/10 text-white backdrop-blur-md rounded-xl cursor-pointer"
            >
              <img
                src="https://www.gstatic.com/firebasejs/ui/2.0.0/images/smartlock/icon_google.svg"
                className="w-5 h-5"
                alt="Google"
              />
              Đăng nhập với Google
            </button>
          </div>
        </div>
      </motion.div>
    </div>
  );
}
