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
        className={`relative w-full max-w-5xl h-auto min-h-[520px] md:min-h-[600px] overflow-hidden shadow-2xl flex flex-col md:flex-row rounded-[32px] md:rounded-[48px] ${
          isDark
            ? "bg-[#12131a]/95 border-white/5 text-white shadow-black/80"
            : "bg-white border-slate-200 text-slate-900 shadow-slate-200"
        } border`}
      >
        {/* Left pane: Visual / Brand representation */}
        <div className="w-full md:w-[45%] bg-gradient-to-br from-[#1d1f2f] to-[#0d0e14] p-8 md:p-12 relative flex flex-col justify-between overflow-hidden shrink-0 border-b md:border-b-0 md:border-r border-white/5">
          <div className="absolute top-0 right-0 w-80 h-80 bg-[#4AC4FE]/10 blur-[80px] -mr-20 -mt-20" />
          <div className="absolute bottom-0 left-0 w-80 h-80 bg-indigo-500/10 blur-[80px] -ml-20 -mb-20" />

          <div className="relative z-10 space-y-6">
            <div className="w-14 h-14 md:w-16 md:h-16 rounded-2xl bg-white/5 backdrop-blur-xl flex items-center justify-center border border-white/10 shadow-lg">
              <img
                src="https://static.wikia.nocookie.net/ftv/images/a/a6/Imagedskvjndkv.png/revision/latest?cb=20260430103502&path-prefix=vi"
                className="w-10 h-10 object-contain"
                alt="Vplay"
                referrerPolicy="no-referrer"
              />
            </div>
            <div className="space-y-3">
              <h1 className="text-3xl md:text-4xl font-extrabold text-white tracking-tight leading-tight uppercase font-google">
                VPLAY TV_
              </h1>
              <p className="text-white/60 text-xs md:text-sm font-medium leading-relaxed max-w-xs">
                Ứng dụng truyền hình giải trí thế hệ mới. Đăng nhập để thưởng thức hàng trăm kênh chất lượng cao chuẩn 4K siêu mượt.
              </p>
            </div>
          </div>

          <div className="relative z-10 mt-8 md:mt-0">
            <div className="p-5 rounded-2xl border border-white/5 bg-white/[0.02] backdrop-blur-md space-y-3">
              <div className="flex items-center gap-2.5">
                <div className="w-8 h-8 rounded-lg bg-amber-500/15 flex items-center justify-center text-amber-500">
                  <Sparkles size={16} />
                </div>
                <h4 className="text-white font-bold text-xs uppercase tracking-wider">Tài khoản Vplay Live</h4>
              </div>
              <p className="text-white/50 text-[11px] leading-relaxed font-medium">
                Mở tài khoản Vplay miễn phí để lưu danh sách kênh yêu thích, cá nhân hóa hồ sơ và xem luồng trực tiếp không giới hạn.
              </p>
              
              <div className="flex flex-col gap-2 p-2.5 rounded-xl bg-black/40 border border-white/5">
                <div className="flex justify-between items-center text-[11px]">
                  <span className="text-white/40 font-semibold uppercase">Email dùng thử</span>
                  <span className="text-amber-400 font-bold font-mono">guest@vplay.vn</span>
                </div>
                <div className="flex justify-between items-center text-[11px]">
                  <span className="text-white/40 font-semibold uppercase">Mật khẩu</span>
                  <span className="text-amber-400 font-bold font-mono">123456</span>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Right pane: Actual Sign-In & Sign-Up Form */}
        <div className="flex-1 p-6 sm:p-10 md:p-14 overflow-y-auto flex items-center">
          <div className="w-full max-w-md mx-auto space-y-6">
            
            {/* Mode Switcher */}
            <div className={`p-1 flex rounded-xl border ${isDark ? "bg-black/30 border-white/5" : "bg-slate-100 border-slate-200"}`}>
              <button
                type="button"
                onClick={() => { setMode("signIn"); setError(""); }}
                className={`flex-1 py-2 rounded-lg text-xs font-bold transition-all flex items-center justify-center gap-2 ${
                  mode === "signIn"
                    ? (isDark ? "bg-white/10 text-[#4AC4FE] shadow-sm" : "bg-white text-slate-900 shadow-sm")
                    : (isDark ? "text-slate-400 hover:text-white" : "text-slate-500 hover:text-slate-800")
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
                    ? (isDark ? "bg-white/10 text-[#4AC4FE] shadow-sm" : "bg-white text-slate-900 shadow-sm")
                    : (isDark ? "text-slate-400 hover:text-white" : "text-slate-500 hover:text-slate-800")
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
                    className="absolute right-4 text-slate-400 hover:text-[#4AC4FE] transition-colors"
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
                className="w-full bg-[#4AC4FE] hover:bg-[#39ade8] text-black font-extrabold text-xs tracking-widest py-4 rounded-xl mt-4 cursor-pointer transition-all active:scale-[0.98] disabled:opacity-50 uppercase shadow-lg shadow-[#4AC4FE]/10 flex items-center justify-center gap-2"
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
                  className={`inline-flex items-center gap-1.5 text-xs font-bold transition-colors py-2 px-4 rounded-xl border ${
                    isDark
                      ? "bg-amber-500/10 border-amber-500/20 text-amber-400 hover:bg-amber-500/15"
                      : "bg-amber-50 border-amber-200 text-amber-700 hover:bg-amber-100"
                  }`}
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
              className={`w-full h-12 flex items-center justify-center gap-3 text-xs font-bold transition-all border rounded-xl active:scale-[0.98] cursor-pointer ${
                isDark
                  ? "bg-[#111111] border-white/5 text-white hover:bg-[#161616]"
                  : "bg-white border-slate-200 text-slate-800 hover:bg-slate-50"
              }`}
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
