/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState, useEffect, useRef, useCallback, ChangeEvent, FormEvent, ReactNode, useMemo } from "react";
import { 
  Calendar, Play, Pause, Radio, Info, Sun, Moon, Maximize, Volume2, VolumeX, CheckCircle2, Shield, X, Lock, Terminal, Zap, Clock, History, MousePointer2, Sliders, ChevronLeft, ChevronRight, Layers, Filter, Sparkles, Camera, Palette, Layout, MessageSquare, Eye, EyeOff, ExternalLink, Monitor, Columns, Maximize2, Circle, AlertCircle, RotateCcw, Droplet, Trophy, Film, Music, Globe, Activity, ShieldCheck, LayoutGrid, ArrowRight, ArrowLeft, TrendingUp, Star, Crown, Menu, Pin, Send, Accessibility, Navigation, LayoutTemplate, LayoutPanelLeft, Square, Smartphone, Unlock, Thermometer, Check, Plus, AppWindow, Compass, Trash2, Newspaper, Shuffle, Link, StickyNote, Bold, Italic, Underline, Droplets, Wind, CloudSun, MapPin, CloudRain, Upload, Edit, FileText, Trash, Waves, Tornado, Package,
  Home, Tv, Settings, LogIn, LogOut, Heart, Users, User, Mic, Search, Folder, FolderOpen, Pizza, Cloud, CreditCard, Gift, HelpCircle, FlaskConical as Flask, GlassWater, Grid, ArrowUp, ArrowDown, ArrowRightLeft, Bot, Hash, Brain
} from "lucide-react";
import Hls from "hls.js";
import { motion, AnimatePresence, MotionConfig } from "motion/react";
import { auth, db, handleFirestoreError, OperationType } from "./firebase";
import { signInWithEmailAndPassword, createUserWithEmailAndPassword, signOut, onAuthStateChanged, updateProfile, sendPasswordResetEmail, User as FirebaseUser, GoogleAuthProvider, signInWithPopup } from "firebase/auth";
import { doc, getDoc, setDoc, collection, getDocs, serverTimestamp, updateDoc, arrayUnion, getDocFromServer } from "firebase/firestore";

import { channels, Channel } from "./channels";
import GatingLoginPage from "./components/GatingLoginPage";

export interface ToastMessage {
  id: string;
  message: string;
  type: "success" | "error" | "info" | "warning";
}

export function showToast(message: string, type: "success" | "error" | "info" | "warning" = "success") {
  window.dispatchEvent(new CustomEvent("vplay-toast", { detail: { message, type } }));
}

const HomeIcon = ({ className, size, strokeWidth, filled }: { className?: string, size?: number | string, strokeWidth?: number, filled?: boolean }) => <Home className={className} size={size || 22} strokeWidth={strokeWidth || 1.5} fill={filled ? "currentColor" : "none"} />;
const TvIcon = ({ className, size, strokeWidth, filled }: { className?: string, size?: number | string, strokeWidth?: number, filled?: boolean }) => <Radio className={className} size={size || 22} strokeWidth={strokeWidth || 1.5} fill={filled ? "currentColor" : "none"} />;
const SettingsIcon = ({ className, size, strokeWidth, filled }: { className?: string, size?: number | string, strokeWidth?: number, filled?: boolean }) => <Settings className={className} size={size || 22} strokeWidth={strokeWidth || 1.5} fill={filled ? "currentColor" : "none"} />;
const SignInIcon = ({ className, size, strokeWidth }: { className?: string, size?: number | string, strokeWidth?: number }) => <LogIn className={className} size={size || 22} strokeWidth={strokeWidth || 1.5} />;
const SignOutIcon = ({ className, size, strokeWidth }: { className?: string, size?: number | string, strokeWidth?: number }) => <LogOut className={className} size={size || 22} strokeWidth={strokeWidth || 1.5} />;
const ExperimentalIcon = ({ className, size, strokeWidth }: { className?: string, size?: number | string, strokeWidth?: number }) => <Pizza className={className} size={size || 22} strokeWidth={strokeWidth || 1} />;
const LikeIcon = ({ className, size, filled, forceWhite, strokeWidth }: { className?: string, size?: number | string, filled?: boolean, forceWhite?: boolean, strokeWidth?: number }) => {
  const baseSize = typeof size === 'number' ? size : parseInt(String(size || '20'), 10);
  const finalSize = Math.round(baseSize * 1.35);
  const shouldBeWhite = filled || forceWhite;

  return (
    <img 
      src={filled 
        ? "https://static.wikia.nocookie.net/ftv/images/7/72/Ic_fluent_thumb_like_24_filled.png/revision/latest?cb=20260508152818&path-prefix=vi" 
        : "https://static.wikia.nocookie.net/ftv/images/a/a7/Ic_fluent_thumb_like_24_regular.png/revision/latest?cb=20260508152817&path-prefix=vi"}
      alt={filled ? "Yêu thích" : "Chưa yêu thích"}
      referrerPolicy="no-referrer"
      style={{ 
        width: `${finalSize}px`, 
        height: `${finalSize}px`,
        filter: shouldBeWhite ? 'brightness(0) invert(1)' : undefined
      }}
      className={`${className} select-none pointer-events-none object-contain ${!shouldBeWhite ? 'dark:brightness-0 dark:invert' : ''}`}
    />
  );
};
const CommunityIcon = ({ className, size, strokeWidth }: { className?: string, size?: number | string, strokeWidth?: number }) => <Users className={className} size={size || 20} strokeWidth={strokeWidth || 1.5} />;
const AccountIcon = ({ className, size, strokeWidth }: { className?: string, size?: number | string, strokeWidth?: number }) => <User className={className} size={size || 22} strokeWidth={strokeWidth || 1.5} />;
const WidgetsIcon = ({ className, size, strokeWidth }: { className?: string, size?: number | string, strokeWidth?: number }) => (
  <svg 
    width={size || 22} 
    height={size || 22} 
    viewBox="0 0 24 24" 
    fill="none" 
    stroke="currentColor" 
    strokeWidth={strokeWidth || 1.5} 
    strokeLinecap="round" 
    strokeLinejoin="round" 
    className={className}
  >
    <rect x="3" y="3" width="8" height="10" rx="2" />
    <rect x="13" y="3" width="8" height="6" rx="2" />
    <rect x="3" y="15" width="8" height="6" rx="2" />
    <rect x="13" y="11" width="8" height="10" rx="2" />
  </svg>
);
const MicIcon = ({ className, size, strokeWidth }: { className?: string, size?: number | string, strokeWidth?: number }) => <Mic className={className} size={size || 20} strokeWidth={strokeWidth || 1.5} />;
const SearchIcon = ({ className, size, strokeWidth }: { className?: string, size?: number | string, strokeWidth?: number }) => (
  <img 
    src="https://static.wikia.nocookie.net/ftv/images/d/dc/Ass_glass.svg/revision/latest?cb=20260612062405&path-prefix=vi" 
    alt="Search"
    className={`${className || ""} flex-shrink-0 object-contain [filter:brightness(0)_invert(1)] shadow-sm`} 
    style={{ width: size || 26, height: size || 26 }}
    referrerPolicy="no-referrer"
  />
);
const SearchCustomIcon = ({ className, size }: { className?: string, size?: number | string }) => (
  <img 
    src="https://static.wikia.nocookie.net/ftv/images/d/dc/Ass_glass.svg/revision/latest?cb=20260612062405&path-prefix=vi" 
    alt="Search"
    className={`${className || ""} flex-shrink-0 object-contain [filter:brightness(0)_invert(1)]`} 
    style={{ width: size || 22, height: size || 22 }}
    referrerPolicy="no-referrer"
  />
);
const FolderIcon = ({ className, size, strokeWidth }: { className?: string, size?: number | string, strokeWidth?: number }) => <FolderOpen className={className} size={size || 22} strokeWidth={strokeWidth || 1.5} />;
const WavesIcon = ({ className, size, strokeWidth }: { className?: string, size?: number | string, strokeWidth?: number }) => (
  <Waves className={className} size={size || 22} strokeWidth={strokeWidth || 1.8} />
);
const PackageIcon = ({ className, size, strokeWidth, filled }: { className?: string, size?: number | string, strokeWidth?: number, filled?: boolean }) => (
  <Package className={className} size={size || 22} strokeWidth={strokeWidth || 1.8} fill={filled ? "currentColor" : "none"} />
);
const TornadoIcon = ({ className, size, strokeWidth }: { className?: string, size?: number | string, strokeWidth?: number }) => (
  <svg 
    viewBox="0 0 24 24" 
    fill="none" 
    stroke="currentColor" 
    strokeWidth={strokeWidth || 1.8} 
    strokeLinecap="round" 
    strokeLinejoin="round" 
    className={className}
    style={{ width: size || 22, height: size || 22 }}
  >
    <path d="M12 3a9 9 0 0 1 9 9c0 2.2-1 4.5-2.5 6s-3.8 2.5-6 2.5a8.5 8.5 0 0 1-8.5-8.5c0-1.8.8-3.5 2.2-4.8s3.2-1.7 4.8-1.7a6.5 6.5 0 0 1 6.5 6.5c0 1.25-1 2.25-2.25 2.25S10.5 13.25 10.5 12c0-.5.4-.9.9-.9H12" />
    <path d="M12 6a6 6 0 0 1 5.5 4" opacity="0.8" />
    <path d="M12 8.5c1.2 0 2 1 2 2" opacity="0.6" />
  </svg>
);


// Test connection as per critical directive
// Test connection removed

const EXPERIMENTS = [
  {
    id: "quick_channel_switch",
    name: "Chuyển kênh nhanh",
    desc: "Tính năng nhập nhanh số kênh từ bàn phím điều khiển từ xa để chuyển kênh trực tiếp.",
    stability: "stable"
  },
  {
    id: "low_latency_profile",
    name: "Low Latency Profile",
    desc: "Tối ưu hóa hiệu năng ứng dụng, giảm thời gian Splash screen và cải thiện tốc độ phản hồi.",
    stability: "stable"
  },
  {
    id: "multiview_channels",
    name: "Multi-view",
    desc: "Lựa chọn xem nhiều kênh truyền hình cùng một thời điểm",
    stability: "stable"
  },
  {
    id: "PiP_experimental",
    name: "Picture in Picture",
    desc: "Hiển thị hình phát thu nhỏ của kênh đang xem khi chuyển sang trang khác hoặc cuộn xuống.",
    stability: "stable"
  },
  {
    id: "screen_recording",
    name: "Ghi màn hình",
    desc: "Cho phép ghi lại màn hình kênh truyền hình đang phát và lưu về thiết bị của bạn",
    stability: "unstable"
  },
  {
    id: "dynamic_island",
    name: "Dynamic Island",
    desc: "Thử nghiệm thay thế thanh Top bar bằng một viên thuốc Dynamic Island co giãn đàn hồi bouncy, tích hợp hiển thị giây và thanh tìm kiếm đen tối giản.",
    stability: "unstable"
  }
];

const TREATMENTS = [
  { id: "treatment1", name: "Rotating Balls", desc: "Animation with rotating elements." },
  { id: "treatment3", name: "Chasing Snake", desc: "Clean and simple loading chasing effect." }
];

const LoadingSpinner = ({ isDark, className = "w-6 h-6" }: { isDark: boolean, className?: string }) => (
  <div className={`relative ${className}`}>
    <svg 
      className="animate-spin w-full h-full" 
      viewBox="0 0 24 24" 
      fill="none" 
      xmlns="http://www.w3.org/2000/svg"
      style={{ animationDuration: '1.22s' }}
    >
      <path 
        className="opacity-100" 
        fill="none" 
        stroke="currentColor" 
        strokeWidth="3" 
        strokeLinecap="round" 
        d="M12 2C6.47715 2 2 6.47715 2 12C2 13.5997 2.37562 15.1116 3.0434 16.4527"
        style={{ color: '#4AC4FE' }}
      />
    </svg>
  </div>
);

const Tooltip = ({ text, children, position = "top", isDark, disabled }: { text: string, children: React.ReactNode, position?: "top" | "bottom" | "left" | "right", isDark: boolean, disabled?: boolean, key?: any }) => {
  const [show, setShow] = useState(false);
  const [coords, setCoords] = useState({ top: 0, left: 0 });
  const triggerRef = useRef<HTMLDivElement>(null);

  if (!text || disabled) return <>{children}</>;

  const handleMouseEnter = () => {
    if (triggerRef.current) {
      const rect = triggerRef.current.getBoundingClientRect();
      let top = 0;
      let left = 0;

      if (position === "top") {
        top = rect.top - 10;
        left = rect.left + rect.width / 2;
      } else if (position === "bottom") {
        top = rect.bottom + 10;
        left = rect.left + rect.width / 2;
      } else if (position === "left") {
        top = rect.top + rect.height / 2;
        left = rect.left - 10;
      } else if (position === "right") {
        top = rect.top + rect.height / 2;
        left = rect.right + 10;
      }
      
      setCoords({ top, left });
      setShow(true);
    }
  };

  const posClasses = {
    top: "-translate-x-1/2 -translate-y-full",
    bottom: "-translate-x-1/2",
    left: "-translate-x-full -translate-y-1/2",
    right: "-translate-y-1/2"
  };

  return (
    <div 
      ref={triggerRef}
      className="relative inline-block" 
      onMouseEnter={handleMouseEnter} 
      onMouseLeave={() => setShow(false)}
    >
      {children}
      <AnimatePresence>
        {show && (
          <motion.div
            initial={{ opacity: 0, scale: 0.9, y: position === "top" ? 10 : position === "bottom" ? -10 : 0, x: position === "left" ? 10 : position === "right" ? -10 : 0 }}
            animate={{ opacity: 1, scale: 1, y: 0, x: 0 }}
            exit={{ opacity: 0, scale: 0.9, y: position === "bottom" ? -20 : position === "top" ? 20 : 0, x: position === "right" ? -20 : position === "left" ? 20 : 0 }}
            transition={{ type: "spring", damping: 20, stiffness: 300 }}
            style={{ 
              position: 'fixed',
              top: coords.top,
              left: coords.left,
            }}
            className={`z-[9999] px-3 py-1.5 rounded-lg text-[10px] font-bold whitespace-nowrap pointer-events-none shadow-2xl border backdrop-blur-md ${posClasses[position]} ${
              isDark ? "bg-[#0a0118]/95 text-white border-white/20" : "bg-white/95 text-slate-900 border-slate-200 shadow-slate-200/50"
            }`}
          >
            {text}
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
};

const SplashScreen = ({ 
  isDark, 
  onEnter, 
  duration = 5000,
  isReinstalling = false,
  onReinstallComplete
}: { 
  isDark: boolean, 
  onEnter: () => void, 
  duration?: number,
  isReinstalling?: boolean,
  onReinstallComplete?: () => void
}) => {
  const [progress, setProgress] = useState(0);
  const [currentFile, setCurrentFile] = useState("");

  const systemFiles = [
    "vplay_core_system.bin",
    "vplay_kernel_v2.sys",
    "ui_layout_config.json",
    "channel_registry.db",
    "widget_board_schema.xml",
    "liquid_glass_engine.dll",
    "audio_synthesizer.bin",
    "experimental_labs_manifest.json",
    "user_profile_template.dat",
    "stream_provider_pipeline.sys",
    "security_sandbox_isolated.so",
    "vplay_cache_cleaner.sh",
    "system_verification_handshake.cert"
  ];

  // Keep latest callback references in refs to avoid restarting intervals/timers
  const onEnterRef = useRef(onEnter);
  const onReinstallCompleteRef = useRef(onReinstallComplete);

  useEffect(() => {
    onEnterRef.current = onEnter;
  }, [onEnter]);

  useEffect(() => {
    onReinstallCompleteRef.current = onReinstallComplete;
  }, [onReinstallComplete]);

  useEffect(() => {
    if (isReinstalling) {
      const intervalTime = 600; // 600ms * 100 = 60,000ms (1 minute)
      const timer = setInterval(() => {
        setProgress((prev) => {
          if (prev >= 100) {
            clearInterval(timer);
            if (onReinstallCompleteRef.current) {
              setTimeout(() => {
                onReinstallCompleteRef.current?.();
              }, 200);
            }
            return 100;
          }
          const next = prev + 1;
          const fileIdx = Math.min(
            Math.floor((next / 100) * systemFiles.length),
            systemFiles.length - 1
          );
          setCurrentFile(systemFiles[fileIdx]);
          return next;
        });
      }, intervalTime);

      setCurrentFile(systemFiles[0]);
      return () => clearInterval(timer);
    } else {
      const intervalTime = duration / 100;
      const timer = setInterval(() => {
        setProgress((prev) => {
          if (prev >= 100) {
            clearInterval(timer);
            return 100;
          }
          return prev + 1;
        });
      }, intervalTime);

      const enterTimeout = setTimeout(() => {
        if (onEnterRef.current) {
          onEnterRef.current();
        }
      }, duration);

      return () => {
        clearInterval(timer);
        clearTimeout(enterTimeout);
      };
    }
  }, [duration, isReinstalling]);

  const getGreeting = () => {
    const hour = new Date().getHours();
    if (hour >= 5 && hour < 10) return "Chào buổi sáng!";
    if (hour >= 10 && hour < 13) return "Chào buổi trưa!";
    if (hour >= 13 && hour < 17) return "Chào buổi chiều!";
    if (hour >= 17 && hour < 23) return "Chào buổi tối!";
    return "Chào buổi đêm!";
  };

  return (
    <motion.div
      initial={{ opacity: 1 }}
      exit={{ opacity: 1 }}
      transition={{ duration: 0 }}
      className="fixed inset-0 z-[110] flex flex-col items-center justify-center overflow-hidden bg-black"
    >
      
      <motion.div
        initial={{ scale: 0.95, opacity: 0 }}
        animate={{ scale: 1, opacity: 1 }}
        transition={{ duration: 0.5, ease: "easeOut" }}
        className="relative z-10 flex flex-col items-center gap-8"
      >
        {isReinstalling ? (
          <div className="flex flex-col items-center gap-6 text-center">
            <div className="flex flex-col items-center gap-3">
              <div className="w-12 h-12 sm:w-14 sm:h-14">
                <svg 
                  className="animate-spin w-full h-full" 
                  viewBox="0 0 24 24" 
                  fill="none" 
                  xmlns="http://www.w3.org/2000/svg"
                  style={{ animationDuration: '1.2s' }}
                >
                  <path 
                    fill="none" 
                    stroke="#FFFFFF" 
                    strokeWidth="3" 
                    strokeLinecap="round" 
                    d="M12 2C6.47715 2 2 6.47715 2 12C2 13.5997 2.37562 15.1116 3.0434 16.4527"
                  />
                </svg>
              </div>
              <div className="flex flex-col items-center gap-2 mt-2">
                <span className="text-white/50 text-xs md:text-sm tracking-wide select-none font-normal" style={{ fontFamily: "Montserrat, sans-serif" }}>
                  Vplay is erasing - This might take several minutes
                </span>
                <p className="text-white/80 text-sm md:text-base tracking-wide whitespace-nowrap font-normal" style={{ fontFamily: "Montserrat, sans-serif" }}>
                  Re-installing <span className="text-[#4AC4FE] font-normal">{currentFile}</span> - <span className="text-emerald-400 font-normal">{progress}%</span> complete
                </p>
              </div>
            </div>
          </div>
        ) : (
          <div className="flex flex-col items-center gap-6 text-center">
            <div className="flex flex-col items-center gap-3">
              <div className="w-12 h-12 sm:w-14 sm:h-14">
                <svg 
                  className="animate-spin w-full h-full" 
                  viewBox="0 0 24 24" 
                  fill="none" 
                  xmlns="http://www.w3.org/2000/svg"
                  style={{ animationDuration: '1.1s' }}
                >
                  <path 
                    fill="none" 
                    stroke="#FFFFFF" 
                    strokeWidth="3" 
                    strokeLinecap="round" 
                    d="M12 2C6.47715 2 2 6.47715 2 12C2 13.5997 2.37562 15.1116 3.0434 16.4527"
                  />
                </svg>
              </div>
              <div className="flex flex-col items-center gap-1 mt-3 select-none">
                <span className="text-white text-base sm:text-lg md:text-xl font-normal tracking-wide flex items-center justify-center gap-1.5">
                  Sản phẩm của <span className="text-white font-normal">VNRT</span>
                </span>
                <span className="text-white/60 text-xs sm:text-sm font-light tracking-wide animate-pulse">
                  Đang tải bản cập nhật
                </span>
              </div>
            </div>
          </div>
        )}
      </motion.div>
    </motion.div>
  );
};

const Sparkles2 = ({ className }: { className?: string }) => (
  <svg 
    viewBox="0 0 24 24" 
    fill="none" 
    stroke="currentColor" 
    strokeWidth="2" 
    strokeLinecap="round" 
    strokeLinejoin="round" 
    className={className}
  >
    <path d="m12 3-1.912 5.813a2 2 0 0 1-1.275 1.275L3 12l5.813 1.912a2 2 0 0 1 1.275 1.275L12 21l1.912-5.813a2 2 0 0 1 1.275-1.275L21 12l-5.813-1.912a2 2 0 0 1-1.275-1.275L12 3Z" />
    <circle cx="19" cy="5" r="2" fill="currentColor" stroke="none" />
  </svg>
);

const AdminIcon = ({ className, size, strokeWidth, filled }: { className?: string, size?: number | string, strokeWidth?: number, filled?: boolean }) => <ShieldCheck className={className} size={size || 22} strokeWidth={strokeWidth || 1.5} fill={filled ? "currentColor" : "none"} />;

const TAB_ICON_URLS: Record<string, string> = {
  "Trang chủ": "https://static.wikia.nocookie.net/ftv/images/b/bb/Vplay-liquid-home.png/revision/latest?cb=20260610090420&path-prefix=vi",
  "Live": "https://static.wikia.nocookie.net/ftv/images/c/cf/Vplay-liquid-tv.png/revision/latest?cb=20260610090420&path-prefix=vi",
  "Package": "https://static.wikia.nocookie.net/ftv/images/7/72/Vplay-liquid-package.png/revision/latest?cb=20260610090420&path-prefix=vi",
  "Cài đặt": "https://static.wikia.nocookie.net/ftv/images/6/62/Vplay-liquid-settings.png/revision/latest?cb=20260610090419&path-prefix=vi",
  "Settings (new)": "https://static.wikia.nocookie.net/ftv/images/6/62/Vplay-liquid-settings.png/revision/latest?cb=20260610090419&path-prefix=vi"
};

const baseTabs = [
  { name: "Trang chủ", icon: HomeIcon, id: "Trang chủ" },
  { name: "Tìm kiếm", icon: SearchIcon, id: "Tìm kiếm" },
  { name: "Live", icon: TvIcon, id: "Live" },
  { name: "Package", icon: PackageIcon, id: "Package" },
  { name: "Settings (new)", icon: SettingsIcon, id: "Settings (new)" },
  { name: "Quản trị", icon: AdminIcon, id: "Quản trị" },
];

function LiquidModal({ isOpen, onClose, children, isDark, title, description, liquidGlass }: { 
  isOpen: boolean, 
  onClose: () => void, 
  children?: ReactNode, 
  isDark: boolean,
  title?: string,
  description?: string,
  liquidGlass: "glassy" | "tinted"
}) {
  const [coords, setCoords] = useState({ x: 0, y: 0 });
  const [isHovered, setIsHovered] = useState(false);
  const containerRef = useRef<HTMLDivElement>(null);

  const handleMouseMove = (e: React.MouseEvent<HTMLDivElement>) => {
    if (!containerRef.current) return;
    const rect = containerRef.current.getBoundingClientRect();
    setCoords({
      x: e.clientX - rect.left,
      y: e.clientY - rect.top,
    });
  };

  return (
    <AnimatePresence>
      {isOpen && (
        <div className="fixed inset-0 z-[1000] flex items-center justify-center p-4">
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={onClose}
            className={`absolute inset-0 bg-black/45 ${liquidGlass ? "backdrop-blur-sm" : ""}`}
          />
          <motion.div
            ref={containerRef}
            onMouseMove={handleMouseMove}
            onMouseEnter={() => setIsHovered(true)}
            onMouseLeave={() => setIsHovered(false)}
            initial={{ scale: 1.12, opacity: 0, y: 0 }}
            animate={{ scale: 1, opacity: 1, y: 0 }}
            exit={{ scale: 1.12, opacity: 0, y: 0 }}
            transition={{ type: "spring", damping: 26, stiffness: 320 }}
            className="relative w-full max-w-md overflow-hidden p-[1.5px] rounded-[32px] transition-all duration-300 ease-out"
            style={{
              background: isHovered 
                ? `radial-gradient(220px circle at ${coords.x}px ${coords.y}px, rgba(255,255,255,0.85) 0%, rgba(255,255,255,0.2) 40%, rgba(255,255,255,0.05) 75%, transparent 100%), linear-gradient(135deg, rgba(255,255,255,0.3) 0%, rgba(255,255,255,0.03) 50%, rgba(255,255,255,0.15) 100%)`
                : `linear-gradient(135deg, rgba(255,255,255,0.35) 0%, rgba(255,255,255,0.05) 50%, rgba(255,255,255,0.15) 100%)`,
              boxShadow: isDark 
                ? "0 30px 70px -15px rgba(0, 0, 0, 0.85), inset 0 1px 1px rgba(255,255,255,0.15)" 
                : "0 30px 70px -15px rgba(15, 23, 42, 0.15), inset 0 1px 1px rgba(255,255,255,0.6)"
            }}
          >
            <div className={`relative w-full h-full rounded-[30.5px] p-10 text-center ${
              isDark 
                ? "bg-[#121214]/92 text-white" 
                : "bg-white/92 text-slate-850"
            } ${
              liquidGlass ? "backdrop-blur-3xl" : "backdrop-blur-none"
            }`} style={{ borderRadius: "inherit" }}>
              {title && <h3 className={`text-2xl font-bold mb-2 ${isDark ? "text-white" : "text-slate-900"}`}>{title}</h3>}
              {description && <p className={`${isDark ? "text-white/60" : "text-black/60"} text-sm leading-relaxed mb-6 font-medium`}>{description}</p>}
              {children}
            </div>
          </motion.div>
        </div>
      )}
    </AnimatePresence>
  );
}

function ShinyGlassWrapper({ 
  children, 
  isDark, 
  liquidGlass,
  className = "", 
  roundedClass = "rounded-[32px]",
  innerClass = ""
}: { 
  children: ReactNode, 
  isDark: boolean, 
  liquidGlass?: "glassy" | "tinted",
  className?: string,
  roundedClass?: string,
  innerClass?: string
}) {
  const [coords, setCoords] = useState({ x: 0, y: 0 });
  const [isHovered, setIsHovered] = useState(false);
  const containerRef = useRef<HTMLDivElement>(null);

  const handleMouseMove = (e: React.MouseEvent<HTMLDivElement>) => {
    if (!containerRef.current) return;
    const rect = containerRef.current.getBoundingClientRect();
    setCoords({
      x: e.clientX - rect.left,
      y: e.clientY - rect.top,
    });
  };

  return (
    <div
      ref={containerRef}
      onMouseMove={handleMouseMove}
      onMouseEnter={() => setIsHovered(true)}
      onMouseLeave={() => setIsHovered(false)}
      className={`relative p-[1.5px] overflow-hidden transition-all duration-300 ease-out ${roundedClass} ${className}`}
      style={{
        background: isHovered 
          ? `radial-gradient(220px circle at ${coords.x}px ${coords.y}px, rgba(255,255,255,0.85) 0%, rgba(255,255,255,0.2) 40%, rgba(255,255,255,0.05) 75%, transparent 100%), linear-gradient(135deg, rgba(255,255,255,0.3) 0%, rgba(255,255,255,0.03) 50%, rgba(255,255,255,0.15) 100%)`
          : `linear-gradient(135deg, rgba(255,255,255,0.35) 0%, rgba(255,255,255,0.05) 50%, rgba(255,255,255,0.15) 100%)`,
        boxShadow: isDark 
          ? "0 25px 60px -15px rgba(0, 0, 0, 0.85), inset 0 1px 1px rgba(255,255,255,0.15)" 
          : "0 25px 60px -15px rgba(15, 23, 42, 0.15), inset 0 1px 1px rgba(255,255,255,0.6)"
      }}
    >
      <div 
        className={`relative w-full h-full overflow-hidden ${
          innerClass || (isDark ? "bg-[#121214]/92 text-white" : "bg-white/92 text-slate-850")
        } ${liquidGlass ? "backdrop-blur-3xl" : "backdrop-blur-none"}`}
        style={{ borderRadius: "inherit" }}
      >
        {children}
      </div>
    </div>
  );
}

function FloatingTooltip({ text, show, targetRect }: { text: string, show: boolean, targetRect: DOMRect | null }) {
  return (
    <AnimatePresence>
      {show && targetRect && (
        <motion.div
          initial={{ opacity: 0, y: 10, scale: 0.8 }}
          animate={{ opacity: 1, y: 0, scale: 1 }}
          exit={{ opacity: 0, y: 10, scale: 0.8 }}
          style={{ 
            position: 'fixed', 
            top: targetRect.top - 50, 
            left: targetRect.left + (targetRect.width / 2),
            translateX: '-50%'
          }}
          className="px-4 py-2 bg-white/80 backdrop-blur-xl text-slate-900 text-[12px] font-bold rounded-2xl whitespace-nowrap pointer-events-none z-[100] shadow-[0_10px_30px_rgba(0,0,0,0.1)] border border-white/40"
        >
          {text}
          <div className="absolute top-full left-1/2 -translate-x-1/2 border-[6px] border-transparent border-t-white/80" />
        </motion.div>
      )}
    </AnimatePresence>
  );
}

function ChannelLogo({ src, alt, className, isDark, liquidGlass, status, category }: { src: string, alt: string, className?: string, isDark: boolean, liquidGlass?: "glassy" | "tinted", status?: string, category?: string }) {
  const [error, setError] = useState(false);

  if (error || !src || src === "LOGO THÊM VÀO SAU") {
    return (
      <div className={`${className || "w-full h-full"} flex flex-col items-center justify-center bg-slate-800/50 rounded-[23px] border border-slate-700/50 p-3 text-center`}>
        <TvIcon size={24} className={liquidGlass === "tinted" ? "text-black" : "text-slate-500 mb-2"} />
        <span className={`text-[10px] font-black leading-tight line-clamp-2 uppercase ${liquidGlass === "tinted" ? "text-black/80" : "text-white/80"}`}>{src === "LOGO THÊM VÀO SAU" ? "LOGO THÊM VÀO SAU" : alt}</span>
      </div>
    );
  }

  let finalSrc = src;
  if (alt === "Vietnam Today") {
    finalSrc = !isDark 
      ? "https://static.wikia.nocookie.net/ftv/images/e/ef/Vtd2.png/revision/latest/scale-to-width-down/1000?cb=20260601094937&path-prefix=vi"
      : "https://static.wikia.nocookie.net/ftv/images/7/7f/Vtd.png/revision/latest/scale-to-width-down/1000?cb=20260601094859&path-prefix=vi";
  }

  const isVTV = category === "VTV" || alt.includes("VTV");
  const isVTVcab = category === "VTVcab" || alt.includes("ON");
  const isShrunk = alt.includes("THVL") || alt.includes("Vĩnh Long") || alt.includes("QNgTV") || alt.includes("Quảng Ngãi");
  const isHTVGroup = (category === "HTV" || alt.includes("HTV")) && alt !== "HTV Thể Thao";
  const isLocalGroup = category === "Địa phương";
  const scaleClass = isVTVcab 
    ? "scale-[1.1]" 
    : isVTV
      ? "scale-[1.12]"
      : isShrunk 
        ? "scale-[1.0]" 
        : (isHTVGroup || isLocalGroup)
          ? "scale-[1.25]"
          : "scale-[1.35]";

  const isVTV5_TN = alt === "VTV5 Tây Nguyên";
  const isVTV5_TNB = alt === "VTV5 Tây Nam Bộ";

  if (isVTV5_TN || isVTV5_TNB) {
    return (
      <div className="relative w-full h-full flex flex-col items-center justify-center select-none gap-2 pt-1">
        <img 
          src={finalSrc} 
          alt={alt} 
          referrerPolicy="no-referrer"
          onError={() => setError(true)}
          className={`max-h-[65%] object-contain p-0 transition-opacity duration-300 ${scaleClass} ${status === "maintenance" ? "grayscale opacity-20" : status === "coming-soon" ? "" : ""}`} 
        />
        <span 
          className="text-[8.5px] sm:text-[10px] font-extrabold text-[#FFDF00] tracking-wider uppercase text-center whitespace-nowrap leading-none filter drop-shadow-[0_1px_2px_rgba(0,0,0,0.9)]"
          style={{ fontFamily: "Montserrat, sans-serif" }}
        >
          {isVTV5_TN ? "TÂY NGUYÊN" : "TÂY NAM BỘ"}
        </span>

        {/* Reflection */}
        <div 
          className="absolute top-[80%] left-0 right-0 h-10 pointer-events-none select-none opacity-20 flex items-start justify-center overflow-hidden z-0"
          style={{
            maskImage: "linear-gradient(to bottom, rgba(0,0,0,0.4) 0%, rgba(0,0,0,0) 60%)",
            WebkitMaskImage: "linear-gradient(to bottom, rgba(0,0,0,0.4) 0%, rgba(0,0,0,0) 60%)",
          }}
        >
          <img 
            src={finalSrc} 
            alt="" 
            referrerPolicy="no-referrer"
            className={`max-h-[65%] object-contain p-0 scale-y-[-1] blur-[3px] opacity-75 ${scaleClass} ${status === "maintenance" ? "grayscale" : ""}`} 
          />
        </div>
      </div>
    );
  }

  const shouldAddOutline = category === "HTV" || 
                           category === "Địa phương" || 
                           category === "VTVcab" || 
                           alt.toLowerCase().includes("htv") ||
                           alt.toLowerCase().includes("vtvcab") ||
                           alt.toLowerCase().includes("atv");

  return (
    <div className="relative w-full h-full flex items-center justify-center">
      <img 
        src={finalSrc} 
        alt={alt} 
        referrerPolicy="no-referrer"
        onError={() => setError(true)}
        className={`${className} object-contain p-0 transition-opacity duration-300 ${scaleClass} ${status === "maintenance" ? "grayscale opacity-20" : status === "coming-soon" ? "" : ""}`} 
        style={shouldAddOutline ? { filter: "drop-shadow(1.5px 0px 0px rgba(0,0,0,0.35)) drop-shadow(-1.5px 0px 0px rgba(0,0,0,0.35)) drop-shadow(0px 1.5px 0px rgba(0,0,0,0.35)) drop-shadow(0px -1.5px 0px rgba(0,0,0,0.35))" } : undefined}
      />
    </div>
  );
}

const getProvinceName = (fullName: string) => {
  let name = fullName.replace(/^TRUYỀN HÌNH\s+/i, "");
  return name.split("(")[0].trim();
};

const ChannelCard = React.memo(function ChannelCard({ ch, onClick, isDark, isActive, favorites, toggleFavorite, liquidGlass, className, isLiveTab, onContextMenu, useNewDesign, activeChannelName, isLargeLayout, quickSwitchEnabled, showChannelNumbers }: {
  ch: Channel,
  onClick: (targetCh?: Channel) => void,
  isDark: boolean,
  isActive?: boolean,
  favorites: string[],
  toggleFavorite: (ch: Channel) => void,
  liquidGlass: "glassy" | "tinted",
  className?: string,
  key?: string | number,
  isLiveTab?: boolean,
  onContextMenu?: (e: React.MouseEvent, ch: Channel) => void,
  useNewDesign?: boolean,
  activeChannelName?: string,
  isLargeLayout?: boolean,
  quickSwitchEnabled?: boolean,
  showChannelNumbers?: boolean
}) {
  const isMaintenance = ch.status === "maintenance";
  const isComingSoon = ch.status === "coming-soon";
  const isVTV6 = ch.name.includes("VTV6");

  const [showVTV5Dropdown, setShowVTV5Dropdown] = useState(false);

  const v5National = useMemo(() => channels.find(c => c.name === "VTV5") || ch, [ch]);
  const v5TNB = useMemo(() => channels.find(c => c.name === "VTV5 Tây Nam Bộ") || ch, [ch]);
  const v5TN = useMemo(() => channels.find(c => c.name === "VTV5 Tây Nguyên") || ch, [ch]);

  const v5Variants = useMemo(() => [
    { label: "VTV5 Quốc gia", target: v5National },
    { label: "VTV5 Tây Nam Bộ", target: v5TNB },
    { label: "VTV5 Tây Nguyên", target: v5TN }
  ], [v5National, v5TNB, v5TN]);

  const isVTV5Card = ch.name === "VTV5";
  const isActuallyActive = isActive || (isVTV5Card && (
    activeChannelName === "VTV5" ||
    activeChannelName === "VTV5 Tây Nam Bộ" ||
    activeChannelName === "VTV5 Tây Nguyên"
  ));

  const handleCardClick = (e: React.MouseEvent) => {
    if (isVTV5Card) {
      e.stopPropagation();
      e.preventDefault();
      setShowVTV5Dropdown(prev => !prev);
    } else {
      onClick();
    }
  };

  const getVTV6Days = () => {
    const target = new Date('2026-06-08T00:00:00').getTime();
    const now = new Date().getTime();
    const diff = target - now;
    return Math.floor(diff / (1000 * 60 * 60 * 24));
  };

  return (
    <div 
      onContextMenu={(e) => {
        if (onContextMenu) {
          onContextMenu(e, ch);
        }
      }}
      className={`relative group ${className || ""}`}
    >
      {/* Background glow when hover (no glow for active) */}
      <div className={`absolute -inset-1 rounded-2xl blur-lg opacity-0 group-hover:opacity-100 transition-none z-0 ${isDark ? "bg-white/2" : "bg-slate-500/5"}`} />
      
      {showVTV5Dropdown && (
        <div 
          className="fixed inset-0 z-[190]" 
          onClick={(e) => {
            e.stopPropagation();
            setShowVTV5Dropdown(false);
          }}
        />
      )}

      <AnimatePresence>
        {showVTV5Dropdown && (
          <motion.div
            initial={{ opacity: 0, scale: 0.9, y: 10 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.9, y: 10 }}
            transition={{ duration: 0.15, ease: "easeOut" }}
            className={`absolute left-1/2 -translate-x-1/2 bottom-[110%] w-[184px] rounded-2xl border p-1 border-slate-200/85 shadow-2xl z-[200] flex flex-col gap-1 backdrop-blur-md ${
              isDark 
                ? "bg-[#18181b]/95 border-white/5 text-white" 
                : "bg-white/95 border-slate-200 text-slate-800"
            }`}
            onClick={(e) => e.stopPropagation()}
          >
            {v5Variants.map((item, index) => {
              const isSelected = activeChannelName === item.target.name;
              return (
                <button
                  key={index}
                  type="button"
                  onClick={() => {
                    onClick(item.target);
                    setShowVTV5Dropdown(false);
                  }}
                  className={`w-full text-left px-3.5 py-3 text-[10px] font-black tracking-[0.05em] uppercase rounded-xl transition-all flex items-center justify-between ${
                    isSelected
                      ? "bg-[#4AC4FE]/15 text-[#4AC4FE]"
                      : isDark ? "hover:bg-white/5 text-slate-355" : "hover:bg-slate-100 text-slate-700"
                  }`}
                >
                  <span>{item.label}</span>
                  {isSelected && <Check size={13} strokeWidth={3} className="text-[#4AC4FE]" />}
                </button>
              );
            })}
          </motion.div>
        )}
      </AnimatePresence>

      <motion.button
        whileTap={{ scale: 0.98 }}
        onClick={handleCardClick}
        style={{
          backgroundImage: isDark 
            ? "repeating-linear-gradient(45deg, rgba(255,255,255,0.02) 0px, rgba(255,255,255,0.02) 1px, transparent 1px, transparent 11px), repeating-linear-gradient(-45deg, rgba(255,255,255,0.02) 0px, rgba(255,255,255,0.02) 1px, transparent 1px, transparent 11px)"
            : "repeating-linear-gradient(45deg, rgba(0,0,0,0.03) 0px, rgba(0,0,0,0.03) 1px, transparent 1px, transparent 11px), repeating-linear-gradient(-45deg, rgba(0,0,0,0.03) 0px, rgba(0,0,0,0.03) 1px, transparent 1px, transparent 11px)"
        }}
        className={`w-full ${isLiveTab ? "aspect-[1.5/1]" : "aspect-square"} p-2.5 xs:p-3 sm:p-5 flex items-center justify-center relative overflow-hidden transition-all duration-300 z-10 rounded-2xl border-[1.5px] backdrop-blur-md ${
          isDark 
            ? "bg-white/[0.07] text-white" 
            : "bg-white/65 text-slate-900"
        } ${
          isLargeLayout
            ? (isActuallyActive 
                ? "border-[#4AC4FE] shadow-[0_0_15px_rgba(74,196,254,0.35)]" 
                : (isDark ? "border-white/10 hover:border-[#4AC4FE]/40 hover:bg-white/[0.12] shadow-md" : "border-slate-200/40 hover:border-[#4AC4FE]/40 hover:bg-white/80 shadow-md"))
            : (isActuallyActive
                ? "border-[#4AC4FE] shadow-[0_0_10px_rgba(74,196,254,0.35)]"
                : (isDark ? "border-white/10 hover:border-[#4AC4FE]/40 hover:bg-white/[0.12] hover:brightness-105" : "border-slate-200/40 hover:border-[#4AC4FE]/40 hover:bg-white/80 hover:brightness-105"))
        }`}
      >

        {showChannelNumbers || quickSwitchEnabled ? (
          <div className={`absolute top-2 left-2 text-[10px] font-mono font-extrabold uppercase px-1.5 py-0.5 rounded-md z-20 shadow-sm ${
            isDark ? "bg-[#18181c]/90 text-[#4AC4FE] border border-white/5" : "bg-white/90 text-blue-600 border border-slate-200"
          }`}>
            {(() => {
              const channelIndex = channels.findIndex(c => c.name === ch.name);
              const num = channelIndex !== -1 ? channelIndex + 1 : null;
              return num ? String(num).padStart(3, '0') : "000";
            })()}
          </div>
        ) : (
          <>
            {isMaintenance && (
              <div className="absolute top-2 left-2 bg-amber-500 text-white text-[8px] font-bold px-1.5 py-0.5 rounded-md z-20 shadow-md">
                BẢO TRÌ
              </div>
            )}
            {isComingSoon && isVTV6 && (
              <div className="absolute top-2 left-2 bg-[#FF453A] text-white text-[9px] font-bold px-1.5 py-0.5 rounded-md z-20 shadow-md">
                {getVTV6Days()}d
              </div>
            )}
            {isComingSoon && !isVTV6 && (
              <div className="absolute top-2 left-2 bg-blue-500 text-white text-[8px] font-bold px-1.5 py-0.5 rounded-md z-20 shadow-md uppercase">
                SẮP RA MẮT
              </div>
            )}
          </>
        )}

        {ch.qualityBadge && (
          <div className="absolute bottom-2 left-2 bg-orange-500 text-white text-[9px] font-black px-1.5 py-0.5 rounded-md z-20 shadow-md">
            {ch.qualityBadge}
          </div>
        )}

        {isActuallyActive && (
          <div className={`absolute select-none z-[25] shadow-md flex items-center justify-center bg-[#FF453A] text-white border border-red-500/20 ${
            isLargeLayout 
              ? "bottom-2 right-2.5 py-[3.5px] px-[8px] rounded-md gap-1.5" 
              : "bottom-1 right-1 py-[2px] px-1.5 rounded-[5px] gap-1"
          }`}>
            <div className={`flex items-end justify-center ${
              isLargeLayout ? "gap-[1.2px] h-2.5 w-2.5" : "gap-[1px] h-2 w-2"
            }`}>
              <motion.span 
                animate={{ height: ["30%", "100%", "30%"] }}
                transition={{ repeat: Infinity, duration: 0.8, ease: "easeInOut", delay: 0 }}
                className={`${isLargeLayout ? "w-[1.2px]" : "w-[1px]"} bg-white rounded-full block animate-none`} 
              />
              <motion.span 
                animate={{ height: ["100%", "30%", "100%"] }}
                transition={{ repeat: Infinity, duration: 0.8, ease: "easeInOut", delay: 0.15 }}
                className={`${isLargeLayout ? "w-[1.2px]" : "w-[1px]"} bg-white rounded-full block animate-none`} 
              />
              <motion.span 
                animate={{ height: ["50%", "100%", "50%"] }}
                transition={{ repeat: Infinity, duration: 0.8, ease: "easeInOut", delay: 0.3 }}
                className={`${isLargeLayout ? "w-[1.2px]" : "w-[1px]"} bg-white rounded-full block animate-none`} 
              />
            </div>
            <span className={`${
              isLargeLayout ? "text-[8px] font-black tracking-wider" : "text-[6.5px] font-black tracking-wider"
            } uppercase leading-none`}>LIVE</span>
          </div>
        )}

        {isLargeLayout && (ch.category === "Địa phương" || ch.category === "Các kênh địa phương") && (
          <div className="absolute bottom-1.5 left-0 right-0 text-center text-[10.5px] font-extrabold uppercase tracking-widest text-black pointer-events-none select-none z-[15] px-2 truncate">
            {getProvinceName(ch.name)}
          </div>
        )}
        
        {/* Logo parent perfectly centered vertically and horizontally inside the tile with scale transition on hover */}
        <div className={`absolute inset-0 flex items-center justify-center z-10 transition-all duration-300 ${
          ch.category === "VTVcab" 
            ? (isLargeLayout ? "p-[22px]" : "p-[14px] sm:p-[18px]") 
            : (isLargeLayout 
                ? (ch.category === "Địa phương" || ch.category === "Các kênh địa phương" ? "pb-[28px] pt-[6px] px-[15px]" : "p-[15px]") 
                : "p-[5px] sm:p-[8px]")
        } ${isLargeLayout ? "scale-[0.78]" : "scale-100"}`}>
          <div className="relative w-full h-full flex items-center justify-center transition-transform duration-300 ease-out group-hover:scale-120">
            {/* Main Centered Logo */}
            <ChannelLogo 
               src={ch.logo} 
               alt={ch.name} 
               className="w-full h-full object-contain"
               isDark={useNewDesign ? false : isDark} 
               liquidGlass={liquidGlass} 
               status={ch.status} 
               category={ch.category}
             />
          </div>
        </div>
      </motion.button>
    </div>
  );
});


const AnimatedTimeBox = ({ value, label, isDark, textClassName }: { value: number, label: string, isDark: boolean, textClassName?: string }) => {
  const formattedValue = value < 0 
    ? `-${Math.abs(value).toString().padStart(2, '0')}` 
    : value.toString().padStart(2, '0');
  return (
    <div className="flex flex-col items-center select-none px-1">
      <div className="relative w-12 h-10 md:w-16 md:h-14 flex items-center justify-center overflow-hidden font-mono text-2xl md:text-3xl font-black">
        <AnimatePresence mode="popLayout">
          <motion.span
            key={formattedValue}
            initial={{ y: 22, opacity: 0 }}
            animate={{ y: 0, opacity: 1 }}
            exit={{ y: -22, opacity: 0 }}
            transition={{ type: "spring", stiffness: 350, damping: 24 }}
            className={`absolute flex items-center justify-center w-full h-full font-extrabold ${textClassName || "text-white"}`}
          >
            {formattedValue}
          </motion.span>
        </AnimatePresence>
      </div>
      <span className={`text-[10px] uppercase font-bold mt-1.5 ${isDark ? "text-slate-400" : "text-slate-500"}`}>{label}</span>
    </div>
  );
};


const Countdown = ({ targetDate, isDark }: { targetDate: string, isDark: boolean }) => {
  const [timeLeft, setTimeLeft] = useState<{ days: number, hours: number, minutes: number, seconds: number } | null>(null);

  useEffect(() => {
    const calculate = () => {
      const target = new Date(targetDate).getTime();
      const now = new Date().getTime();
      const diff = target - now;
      if (diff <= 0) {
        const absDiff = Math.abs(diff);
        const rawDays = Math.floor(absDiff / (1000 * 60 * 60 * 24));
        const rawHours = Math.floor((absDiff % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60));
        const rawMinutes = Math.floor((absDiff % (1000 * 60 * 60)) / (1000 * 60));
        const seconds = Math.floor((absDiff % (1000 * 60)) / 1000);

        return {
          days: rawDays > 0 ? -rawDays : 0,
          hours: rawHours > 0 ? -rawHours : 0,
          minutes: rawMinutes > 0 ? -rawMinutes : 0,
          seconds: seconds > 0 ? -seconds : 0
        };
      }
      return {
        days: Math.floor(diff / (1000 * 60 * 60 * 24)),
        hours: Math.floor((diff / (1000 * 60 * 60)) % 24),
        minutes: Math.floor((diff / 1000 / 60) % 60),
        seconds: Math.floor((diff / 1000) % 60)
      };
    };

    setTimeLeft(calculate());
    const timer = setInterval(() => setTimeLeft(calculate()), 1000);
    return () => clearInterval(timer);
  }, [targetDate]);

  if (!timeLeft) return null;

  return (
    <div className="flex gap-4">
      {[
        { val: timeLeft.days, unit: "Ngày" },
        { val: timeLeft.hours, unit: "Giờ" },
        { val: timeLeft.minutes, unit: "Phút" },
        { val: timeLeft.seconds, unit: "Giây" }
      ].map((item) => (
        <div key={item.unit} className="flex flex-col items-center">
          <div className={`text-4xl font-bold tracking-tighter ${isDark ? "text-white" : "text-black"}`}>
            {item.val < 0 
              ? `-${Math.abs(item.val).toString().padStart(2, '0')}` 
              : item.val.toString().padStart(2, '0')}
          </div>
          <div className="text-[10px] font-bold uppercase tracking-widest opacity-40">
            {item.unit}
          </div>
        </div>
      ))}
    </div>
  );
};

const RenderSlideContent = ({ slide }: { slide: any }) => {
  if (slide.logo) {
    const isVTVcab = slide.channel?.category === "VTVcab" || slide.tag?.includes("VTVcab") || slide.title?.includes("VTVCab");
    const logoScale = isVTVcab ? "" : "scale-[1.25] sm:scale-[1.3] md:scale-[1.35]";

    return (
      <div className={`relative w-full h-full ${slide.bgGradient || "bg-gradient-to-br from-[#131520] via-[#1a1c29] to-[#0f111a]"} flex flex-col items-center justify-center p-6 select-none overflow-hidden group`}>
        {/* Modern clean stripes backdrop detail */}
        <div className="absolute inset-0 bg-[radial-gradient(circle_at_50%_40%,rgba(255,255,255,0.035)_0%,transparent_70%)] pointer-events-none" />
        <div className="absolute inset-0 bg-[linear-gradient(45deg,rgba(255,255,255,0.01)_25%,transparent_25%,transparent_50%,rgba(255,255,255,0.01)_50%,rgba(255,255,255,0.01)_75%,transparent_75%,transparent)] bg-[size:24px_24px] opacity-15 pointer-events-none" />
        
        {/* Soft glowing aura centered matching channel brand */}
        <div 
          className="absolute w-80 h-80 rounded-full blur-[90px] opacity-40 scale-125 pointer-events-none animate-pulse"
          style={{ backgroundColor: slide.glowColor || "rgba(74, 196, 254, 0.45)" }}
        />

        {/* Crisp large channel logo with brand hover scaling */}
        <img 
          src={slide.logo} 
          alt={slide.title}
          className={`w-40 h-40 sm:w-56 sm:h-56 md:w-72 md:h-72 object-contain z-10 transition-transform duration-500 group-hover:scale-110 drop-shadow-[0_20px_48px_rgba(0,0,0,0.75)] ${logoScale}`}
          referrerPolicy="no-referrer"
        />

        {/* High contrast gradient footer fade */}
        <div className="absolute inset-x-0 bottom-0 h-1/2 bg-gradient-to-t from-black/90 via-black/35 to-transparent z-15" />
      </div>
    );
  }

  return (
    <div className="relative w-full h-full select-none overflow-hidden bg-[#0d0f17]">
      <img
        src={slide.url}
        alt={slide.title}
        className="w-full h-full object-cover transition-transform duration-700 hover:scale-105"
        referrerPolicy="no-referrer"
      />
    </div>
  );
};

function HomeContent({ 
  setActiveTab, 
  setActiveChannel, 
  isDark, 
  favorites, 
  toggleFavorite, 
  liquidGlass, 
  user, 
  onLogin, 
  slideIndex, 
  direction, 
  paginate, 
  slides, 
  bypassed,
  onChannelContextMenu,
  useNewDesign,
  activeChannelName,
  featureFlags,
  showChannelNumbers
}: {
  setActiveTab: (tab: string) => void,
  setActiveChannel: (ch: typeof channels[0]) => void,
  isDark: boolean,
  favorites: string[],
  toggleFavorite: (ch: typeof channels[0]) => void,
  liquidGlass: "glassy" | "tinted",
  user: any,
  onLogin: () => void,
  slideIndex: number,
  direction: number,
  paginate: (newDirection: number) => void,
  slides: any[],
  bypassed?: boolean,
  onChannelContextMenu?: (e: React.MouseEvent, ch: Channel) => void,
  useNewDesign?: boolean,
  activeChannelName?: string,
  featureFlags?: { [key: string]: boolean },
  showChannelNumbers?: boolean
}) {
  const [randomChannels, setRandomChannels] = useState<typeof channels>([]);
  
  useEffect(() => {
    const shuffled = [...channels].sort(() => 0.5 - Math.random());
    setRandomChannels(shuffled.slice(0, 16));
  }, []);

  const [startIndex, setStartIndex] = useState(0);

  const slideTouchStartXRef = useRef<number | null>(null);
  const handleSlideTouchStart = (e: React.TouchEvent) => {
    slideTouchStartXRef.current = e.touches[0].clientX;
  };
  const handleSlideTouchEnd = (e: React.TouchEvent) => {
    if (slideTouchStartXRef.current === null) return;
    const diff = e.changedTouches[0].clientX - slideTouchStartXRef.current;
    slideTouchStartXRef.current = null;
    if (Math.abs(diff) > 40) {
      if (diff > 0) {
        paginate(-1); // swipe right -> previous slide
      } else {
        paginate(1);  // swipe left -> next slide
      }
    }
  };

  const getItemWidthAndGap = () => {
    if (typeof window !== "undefined") {
      if (window.innerWidth < 380) return { width: 110, gap: 12 };
      if (window.innerWidth < 640) return { width: 140, gap: 16 };
      if (window.innerWidth < 1024) return { width: 185, gap: 20 };
    }
    return { width: 215, gap: 24 };
  };

  const [itemConfig, setItemConfig] = useState({ width: 215, gap: 24 });

  useEffect(() => {
    const handleResize = () => {
      setItemConfig(getItemWidthAndGap());
    };
    handleResize();
    window.addEventListener("resize", handleResize);
    return () => window.removeEventListener("resize", handleResize);
  }, []);

  const getVisibleCount = () => {
    if (itemConfig.width === 110) return 2;
    if (itemConfig.width === 140) return 2;
    if (itemConfig.width === 185) return 3;
    return 5;
  };
  const activeVisibleCount = getVisibleCount();

  const scrollPrev = () => {
    setStartIndex((prev) => Math.max(0, prev - 1));
  };
  
  const scrollNext = () => {
    const maxIdx = Math.max(0, randomChannels.length - activeVisibleCount);
    setStartIndex((prev) => Math.min(maxIdx, prev + 1));
  };

  const variants = {
    enter: (direction: number) => ({
      x: direction > 0 ? '100%' : '-100%',
      opacity: 0,
      scale: 1.1
    }),
    center: { zIndex: 1, x: 0, opacity: 1, scale: 1 },
    exit: (direction: number) => ({
      zIndex: 0,
      x: direction < 0 ? '100%' : '-100%',
      opacity: 0,
      scale: 0.9,
      transition: { duration: 0.3 }
    })
  };

  const favoriteChannels = channels.filter(ch => favorites.includes(ch.name));
  const trendingChannels = channels.slice(0, 4);

  const [timeLeft, setTimeLeft] = useState({
    days: 0,
    hours: 0,
    minutes: 0,
    seconds: 0
  });

  useEffect(() => {
    const targetDate = new Date("2026-06-08T10:00:00+07:00").getTime();

    const updateTimer = () => {
      const now = new Date().getTime();
      const diff = targetDate - now;

      if (diff <= 0) {
        const absDiff = Math.abs(diff);
        const rawDays = Math.floor(absDiff / (1000 * 60 * 60 * 24));
        const rawHours = Math.floor((absDiff % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60));
        const rawMinutes = Math.floor((absDiff % (1000 * 60 * 60)) / (1000 * 60));
        const seconds = Math.floor((absDiff % (1000 * 60)) / 1000);

        setTimeLeft({
          days: rawDays > 0 ? -rawDays : 0,
          hours: rawHours > 0 ? -rawHours : 0,
          minutes: rawMinutes > 0 ? -rawMinutes : 0,
          seconds: seconds > 0 ? -seconds : 0
        });
        return;
      }

      const days = Math.floor(diff / (1000 * 60 * 60 * 24));
      const hours = Math.floor((diff % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60));
      const minutes = Math.floor((diff % (1000 * 60 * 60)) / (1000 * 60));
      const seconds = Math.floor((diff % (1000 * 60)) / 1000);

      setTimeLeft({ days, hours, minutes, seconds });
    };

    updateTimer();
    const interval = setInterval(updateTimer, 1000);
    return () => clearInterval(interval);
  }, []);

  return (
    <div className="relative space-y-16 pb-32 w-full max-w-[1600px] 2xl:max-w-[1800px] mx-auto px-4 md:px-12">
      {/* Dynamic Hero Section */}
      <div 
        onTouchStart={handleSlideTouchStart}
        onTouchEnd={handleSlideTouchEnd}
        className="relative w-full overflow-visible py-4 select-none"
      >
        {/* Carousel 3D Track */}
        <div className="relative w-full max-w-6xl mx-auto aspect-[16/9] md:aspect-[2.2/1] overflow-visible">
          {/* Left card (Previous slide) */}
          <div 
            onClick={() => paginate(-1)}
            className="hidden md:block absolute left-[-24%] top-0 w-[74%] h-full rounded-[32px] overflow-hidden opacity-45 hover:opacity-70 transition-all duration-500 cursor-pointer pointer-events-auto transform scale-[0.88] z-10 border border-white/5 shadow-2xl"
          >
            <RenderSlideContent slide={slides[(slideIndex - 1 + slides.length) % slides.length]} />
            {/* Dark overlay for side cards */}
            <div className="absolute inset-0 bg-black/55" />
            
            {/* Chevron Left Overlay on side card */}
            <div className="absolute inset-y-0 right-4 flex items-center justify-center">
              <div className="p-2.5 rounded-full bg-white/10 backdrop-blur-md text-white border border-white/15">
                <ChevronLeft size={16} />
              </div>
            </div>
          </div>

          {/* Active middle card with Glow wrapping it */}
          <div className="absolute left-1/2 -translate-x-1/2 top-0 w-full md:w-[74%] h-full z-20 group/middle">
            {/* Glow Wrap for middle card */}
            <div className="absolute inset-[-12px] md:inset-[-24px] pointer-events-none opacity-50 blur-[35px] saturate-[220%] transition-transform duration-500 overflow-hidden select-none">
              <AnimatePresence initial={false} custom={direction}>
                {slides[slideIndex]?.logo ? (
                  <motion.div
                    key={`glow-${slideIndex}`}
                    initial={{ opacity: 0, scale: 0.8 }}
                    animate={{ opacity: 0.6, scale: 1 }}
                    exit={{ opacity: 0 }}
                    transition={{ duration: 0.45 }}
                    style={{
                      background: `radial-gradient(circle, ${slides[slideIndex].glowColor || "rgba(74, 196, 254, 0.45)"} 0%, rgba(0,0,0,0) 70%)`
                    }}
                    className="absolute inset-0 w-full h-full scale-110"
                  />
                ) : (
                  <motion.img
                    key={`glow-${slideIndex}`}
                    src={slides[slideIndex]?.url}
                    custom={direction}
                    variants={variants}
                    initial="enter"
                    animate="center"
                    exit="exit"
                    transition={{
                      x: { type: "spring", stiffness: 450, damping: 36 },
                      opacity: { duration: 0.25 },
                      scale: { duration: 0.45 }
                    }}
                    className="absolute inset-0 w-full h-full object-cover scale-[1.05]"
                    referrerPolicy="no-referrer"
                  />
                )}
              </AnimatePresence>
            </div>

            {/* Main card */}
            <div 
              onClick={() => {
                if (slides[slideIndex]?.action) {
                  slides[slideIndex].action();
                } else if (slides[slideIndex]?.channel) {
                  setActiveChannel(slides[slideIndex].channel);
                  setActiveTab("Live");
                }
              }}
              className={`w-full h-full rounded-[32px] overflow-hidden shadow-[0_24px_60px_rgba(0,0,0,0.65)] border border-white/10 relative transform scale-100 transition-all duration-500 ${
                (slides[slideIndex]?.channel || slides[slideIndex]?.action) ? "cursor-pointer group/card border-white/20 hover:border-[#4AC4FE]/40" : ""
              }`}
            >
              <AnimatePresence initial={false} custom={direction}>
                <motion.div
                  key={slideIndex}
                  custom={direction}
                  variants={variants}
                  initial="enter"
                  animate="center"
                  exit="exit"
                  transition={{
                    x: { type: "spring", stiffness: 450, damping: 36 },
                    opacity: { duration: 0.25 },
                    scale: { duration: 0.45 }
                  }}
                  className="absolute inset-0 w-full h-full"
                >
                  <RenderSlideContent slide={slides[slideIndex]} />
                </motion.div>
              </AnimatePresence>

              {/* Gradient Overlay for description text */}
              <div className="hidden md:flex absolute inset-0 bg-gradient-to-t from-black/95 via-black/30 to-transparent flex-col justify-end p-5 md:p-10 z-25 font-sans pointer-events-none">
                <motion.div
                  initial={{ opacity: 0, y: 25 }}
                  animate={{ opacity: 1, y: 0 }}
                  key={`text-${slideIndex}`}
                  className="space-y-1.5 md:space-y-3 pointer-events-auto"
                >
                  <div className="flex flex-wrap items-center gap-2 mb-1">
                    <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-white/10 backdrop-blur-md border border-white/20 text-white text-[9px] md:text-[10px] font-bold uppercase tracking-widest align-middle">
                      <span className="w-1.5 h-1.5 rounded-full bg-[#4AC4FE] animate-pulse" />
                      {slides[slideIndex]?.tag}
                    </div>
                    {slides[slideIndex]?.channel && (
                      <div className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full bg-[#4AC4FE]/20 text-[#4AC4FE] border border-[#4AC4FE]/30 text-[9px] md:text-[10px] font-extrabold uppercase tracking-widest animate-pulse">
                        <Play size={8} fill="currentColor" className="mr-0.5" /> Xem Ngay
                      </div>
                    )}
                  </div>
                  <motion.h1 
                    initial={{ opacity: 0, x: -30 }}
                    animate={{ opacity: 1, x: 0 }}
                    className="text-base xs:text-lg sm:text-2xl md:text-4xl font-black tracking-tight text-white uppercase leading-tight max-w-xl group-hover/card:text-[#4AC4FE] transition-colors"
                  >
                    {slides[slideIndex]?.title}
                  </motion.h1>
                  <p className="text-white/70 text-[10px] sm:text-xs md:text-sm font-medium max-w-lg leading-relaxed line-clamp-2 md:line-clamp-none">
                    {slides[slideIndex]?.desc}
                  </p>
                </motion.div>
              </div>
            </div>
          </div>

          {/* Right card (Next slide) */}
          <div 
            onClick={() => paginate(1)}
            className="hidden md:block absolute right-[-24%] top-0 w-[74%] h-full rounded-[32px] overflow-hidden opacity-45 hover:opacity-70 transition-all duration-500 cursor-pointer pointer-events-auto transform scale-[0.88] z-10 border border-white/5 shadow-2xl"
          >
            <RenderSlideContent slide={slides[(slideIndex + 1) % slides.length]} />
            {/* Dark overlay for side cards */}
            <div className="absolute inset-0 bg-black/55" />
            
            {/* Chevron Right Overlay on side card */}
            <div className="absolute inset-y-0 left-4 flex items-center justify-center">
              <div className="p-2.5 rounded-full bg-white/10 backdrop-blur-md text-white border border-white/15">
                <ChevronRight size={16} />
              </div>
            </div>
          </div>
        </div>

        {/* Floating Chevrons for responsive overlay */}
        <div className="md:hidden absolute inset-y-0 left-4 right-4 flex items-center justify-between pointer-events-none z-30">
          <button 
            onClick={() => paginate(-1)} 
            className="p-2.5 rounded-full bg-black/40 backdrop-blur-xl text-white border border-white/10 pointer-events-auto active:scale-90 transition-transform select-none"
          >
            <ChevronLeft size={18} />
          </button>
          <button 
            onClick={() => paginate(1)} 
            className="p-2.5 rounded-full bg-black/40 backdrop-blur-xl text-white border border-white/10 pointer-events-auto active:scale-90 transition-transform select-none"
          >
            <ChevronRight size={18} />
          </button>
        </div>
      </div>

      {/* Mobile Slide Info (shown outside the thumbnail image/box) */}
      <div className="block md:hidden px-2 -mt-4 mb-2">
        <AnimatePresence mode="wait">
          <motion.div
            key={`mob-text-${slideIndex}`}
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -10 }}
            transition={{ duration: 0.3 }}
            className="space-y-1.5"
          >
            <div className="flex items-center gap-1.5">
              <span className="px-2.5 py-0.5 rounded-full bg-[#4AC4FE]/10 text-[#4AC4FE] border border-[#4AC4FE]/20 text-[9px] font-black uppercase tracking-wider">
                {slides[slideIndex]?.tag}
              </span>
              {slides[slideIndex]?.channel && (
                <span className="flex items-center gap-1 px-2 py-0.5 rounded-full bg-red-500/10 text-red-500 border border-red-500/20 text-[9px] font-black uppercase tracking-wider animate-pulse">
                  <Play size={8} fill="currentColor" /> QUA TRỰC TIẾP
                </span>
              )}
            </div>
            <h3 className={`text-base font-black uppercase tracking-tight ${isDark ? "text-white" : "text-slate-900"}`}>
              {slides[slideIndex]?.title}
            </h3>
            <p className={`text-xs font-semibold leading-relaxed ${isDark ? "text-slate-400" : "text-slate-600"} line-clamp-3`}>
              {slides[slideIndex]?.desc}
            </p>
          </motion.div>
        </AnimatePresence>
      </div>

      {/* VTV6 Return Banner */}
      <motion.div 
        initial={{ opacity: 0, y: 20 }}
        whileInView={{ opacity: 1, y: 0 }}
        viewport={{ once: true }}
        transition={{ duration: 0.6 }}
        className={`relative p-5 md:p-8 flex flex-col md:flex-row items-center justify-between gap-6 md:gap-8 border-b ${isDark ? "border-white/5" : "border-slate-100"} pb-10 select-none max-w-6xl mx-auto w-full`}
      >
        <div className="flex flex-col sm:flex-row items-center sm:items-start gap-5 md:gap-6 flex-1 text-center sm:text-left">
          {/* Magnified VTV6 Logo */}
          <div className="relative shrink-0 flex items-center justify-center select-none">
            <img 
              src="https://static.wikia.nocookie.net/logos/images/2/21/VTV6_logo_%282026%29.png/revision/latest/scale-to-width-down/1000?cb=20260508074729&path-prefix=vi"
              alt="VTV6 Logo"
              className="w-24 md:w-32 h-auto object-contain"
              referrerPolicy="no-referrer"
            />
          </div>
          
          <div className="space-y-2 md:space-y-3 flex-1">
            <h2 className="text-lg md:text-2xl font-black tracking-tight leading-tight bg-gradient-to-r from-blue-400 via-[#4AC4FE] to-[#a855f7] bg-clip-text text-transparent">
              VTV6 - Kênh Truyền hình Thể thao chính thức trở lại!
            </h2>
            <p className={`text-xs md:text-[13px] font-medium leading-relaxed ${isDark ? "text-slate-400" : "text-slate-600"}`}>
              VTV6 - Kênh truyền hình thể thao của Đài Truyền hình Việt Nam đã chính thức lên sóng vào 09h40 - 08/06/2026. Kênh phát sóng các bản tin, chuyên mục và chương trình tường thuật về thể thao trong nước và quốc tế, với mục tiêu thúc đẩy phong trào thể thao quần chúng, thể thao học đường, thể thao chuyên nghiệp phát triển tại Việt Nam cũng như hướng đến rèn luyện, nâng cao sức khỏe cộng đồng và xây dựng con người phát triển toàn diện
            </p>
          </div>
        </div>

        {/* Watch Now & Learn More buttons */}
        <div className="flex flex-col gap-3 shrink-0 w-full sm:w-auto sm:min-w-[180px]">
          <motion.button
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.98 }}
            onClick={() => {
              const v6 = channels.find(c => c.name === "VTV6");
              if (v6) {
                setActiveChannel(v6);
                setActiveTab("Live");
              }
            }}
            className="w-full flex items-center justify-center gap-2 py-3 px-6 bg-red-600 hover:bg-red-500 text-white font-bold text-sm rounded-xl md:rounded-2xl transition-all shadow-lg shadow-red-600/30 cursor-pointer border border-red-500/20 active:scale-95 select-none"
          >
            <Play size={14} fill="currentColor" />
            Xem ngay
          </motion.button>

          <motion.a
            whileHover={{ scale: 1.03 }}
            whileTap={{ scale: 0.98 }}
            href="https://vi.wikipedia.org/wiki/VTV6"
            target="_blank"
            rel="noopener noreferrer"
            className={`w-full flex items-center justify-center gap-2 py-2.5 px-6 border ${isDark ? "border-white/10 hover:bg-white/5 text-white/80" : "border-slate-200 hover:bg-slate-50 text-slate-700"} font-bold text-xs rounded-xl md:rounded-2xl transition-all cursor-pointer select-none text-center`}
          >
            Tìm hiểu thêm
          </motion.a>
        </div>
      </motion.div>

      {/* Suggested Section - Moved up */}
      <div className="space-y-6 md:space-y-10">
        <div className="flex flex-col gap-2 px-2">
          <div className="flex items-center gap-3">
            <div className="w-8 h-8 rounded-full bg-[#4AC4FE]/10 flex items-center justify-center text-[#4AC4FE]">
              <Sparkles size={18} />
            </div>
            <h1 className={`text-xl md:text-3xl font-black tracking-tighter ${isDark ? "text-white" : "text-slate-900"}`}>
              Gợi ý cho bạn
            </h1>
          </div>
        </div>

        <div className="relative">
          {/* On Desktop/Larger Screens: Beautiful interactive sliding Carousel */}
          <div className="hidden md:block relative group/carousel">
            {/* Arrow Left */}
            {startIndex > 0 && (
              <button 
                onClick={scrollPrev}
                className={`absolute left-0 top-1/2 -translate-y-1/2 -ml-4 z-30 p-3 rounded-full shadow-lg border backdrop-blur-md transition-all active:scale-95 ${
                  isDark 
                    ? "bg-slate-900/90 border-white/10 text-white hover:bg-slate-800" 
                    : "bg-white/90 border-slate-200 text-slate-800 hover:bg-slate-50"
                }`}
              >
                <ChevronLeft size={20} />
              </button>
            )}

            {/* Arrow Right */}
            {startIndex < Math.max(0, randomChannels.length - activeVisibleCount) && (
              <button 
                onClick={scrollNext}
                className={`absolute right-0 top-1/2 -translate-y-1/2 -mr-4 z-30 p-3 rounded-full shadow-lg border backdrop-blur-md transition-all active:scale-95 ${
                  isDark 
                    ? "bg-slate-900/90 border-white/10 text-white hover:bg-slate-800" 
                    : "bg-white/90 border-slate-200 text-slate-800 hover:bg-slate-50"
                }`}
              >
                <ChevronRight size={20} />
              </button>
            )}

            {/* Carousel Viewport */}
            <div className="overflow-hidden px-1 py-4">
              <motion.div 
                animate={{ x: -startIndex * (itemConfig.width + itemConfig.gap) }}
                transition={{ type: "spring", stiffness: 220, damping: 26 }}
                className="flex font-sans"
                style={{ gap: `${itemConfig.gap}px` }}
              >
                {randomChannels.map((ch, idx) => (
                  <motion.div 
                    key={`home-random-${ch.name}-${idx}`} 
                    initial={{ opacity: 0, x: 50 }}
                    whileInView={{ opacity: 1, x: 0 }}
                    viewport={{ once: true }}
                    transition={{ type: "spring", stiffness: 100, damping: 15, delay: idx * 0.05 }}
                    style={{ width: `${itemConfig.width}px` }}
                    className="shrink-0 group relative"
                  >
                    <ChannelCard 
                      ch={ch} 
                      className="hover:scale-105"
                      onClick={(targetCh) => {
                        setActiveChannel(targetCh || ch);
                        setActiveTab("Live");
                      }} 
                      isDark={isDark} 
                      favorites={favorites} 
                      toggleFavorite={toggleFavorite} 
                      liquidGlass={liquidGlass}
                      onContextMenu={onChannelContextMenu}
                      useNewDesign={useNewDesign}
                      activeChannelName={activeChannelName}
                      quickSwitchEnabled={featureFlags?.quick_channel_switch}
                      showChannelNumbers={showChannelNumbers}
                    />
                    <div className={`mt-3 text-center text-xs font-bold truncate tracking-wide ${isDark ? "text-slate-300" : "text-slate-400"}`}>
                      {ch.name}
                    </div>
                  </motion.div>
                ))}
              </motion.div>
            </div>
          </div>

          {/* On Mobile/Tablet Screens: Perfectly responsive, horizontally scrollable rail with snap support */}
          <div className="block md:hidden">
            <div className="flex overflow-x-auto gap-4 px-1 pb-6 scrollbar-hide snap-x touch-pan-x">
              {randomChannels.map((ch, idx) => (
                <motion.div 
                  key={`home-mobile-suggested-${ch.name}-${idx}`} 
                  initial={{ opacity: 0, x: 30 }}
                  whileInView={{ opacity: 1, x: 0 }}
                  viewport={{ once: true }}
                  transition={{ type: "spring", stiffness: 100, damping: 15, delay: idx * 0.05 }}
                  className="shrink-0 w-[140px] xs:w-[155px] snap-center group relative"
                >
                  <ChannelCard 
                    ch={ch} 
                    className="hover:scale-105"
                    onClick={(targetCh) => {
                      setActiveChannel(targetCh || ch);
                      setActiveTab("Live");
                    }} 
                    isDark={isDark} 
                    favorites={favorites} 
                    toggleFavorite={toggleFavorite} 
                    liquidGlass={liquidGlass}
                    onContextMenu={onChannelContextMenu}
                    useNewDesign={useNewDesign}
                    activeChannelName={activeChannelName}
                    quickSwitchEnabled={featureFlags?.quick_channel_switch}
                    showChannelNumbers={showChannelNumbers}
                  />
                  <div className={`mt-2 text-center text-[11px] font-black truncate tracking-wide ${isDark ? "text-slate-400" : "text-slate-700"}`}>
                    {ch.name}
                  </div>
                </motion.div>
              ))}
            </div>
          </div>
        </div>
      </div>

      {/* Premium Guest Loyalty Banner - Replaced with Explore Style */}
      {!user && !bypassed && (
        <motion.div 
          initial={{ opacity: 0, y: 40 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          className={`p-4 xs:p-6 md:py-8 md:px-12 rounded-3xl md:rounded-[40px] relative overflow-hidden flex flex-col md:flex-row items-center justify-between gap-4 md:gap-8 shadow-xl transition-all border ${isDark ? "bg-[#4AC4FE]/10 border-white/5" : "bg-[#4AC4FE]/10 border-[#4AC4FE]/10"}`}
        >
          <div className="absolute top-0 right-0 w-96 h-96 bg-[#4AC4FE]/10 blur-[100px] -mr-48 -mt-48" />
          <div className="absolute bottom-0 left-0 w-64 h-64 bg-blue-500/10 blur-[80px] -ml-32 -mb-32" />
          
          <div className="relative z-10 space-y-3 md:space-y-4 text-center md:text-left flex-1">
            <div className={`inline-flex items-center gap-2 px-2.5 py-0.5 rounded-full text-[9px] md:text-[10px] font-bold uppercase tracking-[0.2em] ${isDark ? "bg-[#4AC4FE]/20 text-[#4AC4FE]" : "bg-[#4AC4FE]/10 text-[#4AC4FE]"}`}>
              <Crown size={12} /> VIP Membership
            </div>
            <h2 className={`text-xl xs:text-2xl md:text-4xl font-bold tracking-tight leading-[1.1] ${isDark ? "text-white" : "text-slate-900"}`}>
              Khám phá nhiều hơn <br /> 
              <span className="text-[#4AC4FE]">với Vplay</span>
            </h2>
            <p className={`max-w-xl font-medium text-xs md:text-base leading-relaxed ${isDark ? "text-slate-400" : "text-slate-500"}`}>
              Đăng nhập ngay vào tài khoản Vplay để có cho mình một trải nghiệm xem truyền hình tốt nhất
            </p>
          </div>
          
          <div className="relative z-10 shrink-0 w-full md:w-auto">
            <button 
              onClick={onLogin} 
              className="w-full md:w-auto btn-vibrant-3d px-6 py-3 md:px-12 md:py-5 text-xs md:text-lg font-bold tracking-widest rounded-xl md:!rounded-[24px] !border-none !bg-[#4AC4FE] hover:!bg-[#4AC4FE] shadow-[0_15px_40px_rgba(147,51,234,0.25)]"
            >
              ĐĂNG NHẬP
            </button>
          </div>
        </motion.div>
      )}

      {/* Favorites Section */}
      {favorites.length > 0 && (
        <div className="space-y-10">
          <div className="flex flex-col gap-2 px-2">
            <div className="flex items-center gap-3">
              <div className="w-8 h-8 rounded-full bg-red-500/10 flex items-center justify-center text-red-500">
                <LikeIcon size={18} />
              </div>
            <motion.h3 
              initial={{ opacity: 0, x: -40 }}
              animate={{ opacity: 1, x: 0 }}
              className={`text-3xl font-bold tracking-tighter ${isDark ? "text-white" : "text-slate-900"}`}
            >
              Truy cập nhanh
            </motion.h3>
            </div>
          </div>
          <div className="grid grid-cols-2 xs:grid-cols-3 sm:grid-cols-4 md:grid-cols-6 lg:grid-cols-8 gap-6">
            {favoriteChannels.map(ch => (
              <ChannelCard 
                key={`${ch.name}-${ch.stream}`} 
                ch={ch} 
                className="hover:scale-105"
                onClick={(targetCh) => {
                  setActiveChannel(targetCh || ch);
                  setActiveTab("Live");
                }} 
                isDark={isDark} 
                favorites={favorites} 
                toggleFavorite={toggleFavorite} 
                liquidGlass={liquidGlass}
                onContextMenu={onChannelContextMenu}
                useNewDesign={useNewDesign}
                activeChannelName={activeChannelName}
                quickSwitchEnabled={featureFlags?.quick_channel_switch}
                showChannelNumbers={showChannelNumbers}
              />
            ))}
          </div>
        </div>
      )}
    </div>
  );
}

function ExploreContent({
  isDark,
  searchQuery,
  setSearchQuery,
  setActiveChannel,
  favorites,
  toggleFavorite,
  liquidGlass,
  user,
  onLogin,
  onLogout,
  setActiveTab,
  handleOpenSettings,
  setIsDark,
  setLiquidGlass,
  setSortOrder,
  bypassed,
  loadingTreatment,
  useSidebar,
  setUseSidebar,
  isSidebarRight,
  setIsSidebarRight,
  sidebarDisplay,
  setSidebarDisplay,
  isPinningEnabled,
  setIsPinningEnabled,
  featureFlags,
  setFeatureFlags,
  setIsSidebarLocked,
  handleSearchContextMenu,
  searchFilter,
  allCustomChannels,
  searchFilterOption,
  setSearchFilterOption,
  currentTab,
  setActiveSettingsPage
}: {
  isDark: boolean,
  searchQuery: string,
  setSearchQuery: (q: string) => void,
  setActiveChannel: (ch: Channel) => void,
  favorites: string[],
  toggleFavorite: (ch: Channel) => void,
  liquidGlass: "glassy" | "tinted",
  user: any,
  onLogin: () => void,
  onLogout: () => void,
  setActiveTab: (tab: string) => void,
  handleOpenSettings: () => void,
  setIsDark: (val: boolean) => void,
  setLiquidGlass: (val: "glassy" | "tinted") => void,
  setSortOrder: (val: "az" | "za") => void,
  bypassed: boolean,
  loadingTreatment: string,
  useSidebar: boolean,
  setUseSidebar: (val: boolean) => void,
  isSidebarRight: boolean,
  setIsSidebarRight: (val: boolean) => void,
  sidebarDisplay: "float" | "attach",
  setSidebarDisplay: (val: "float" | "attach") => void,
  isPinningEnabled: boolean,
  setIsPinningEnabled: (val: boolean) => void,
  featureFlags: { [key: string]: boolean },
  setFeatureFlags: (val: any) => void,
  setIsSidebarLocked: (val: boolean) => void,
  handleSearchContextMenu: (e: React.MouseEvent) => void,
  searchFilter: "all" | "channels" | "settings" | "experiments",
  allCustomChannels?: Channel[],
  searchFilterOption?: "Tất cả kênh" | "Kênh của Vplay" | "Package của bạn",
  setSearchFilterOption?: (val: "Tất cả kênh" | "Kênh của Vplay" | "Package của bạn") => void,
  currentTab?: string,
  setActiveSettingsPage?: (page: number) => void
}) {
  return (
    <div className="flex-1 flex flex-col pt-8 overflow-y-auto scrollbar-hide pb-32">
      {searchQuery.trim() === "" ? (
        <div className="flex-1 flex flex-col justify-center items-center px-4 max-w-xl mx-auto w-full min-h-[45vh] space-y-6 md:space-y-8">
          <div className="text-center space-y-3">
            <h2 className={`text-4xl md:text-5xl font-black tracking-tighter ${isDark ? "text-white" : "text-slate-900"}`}>
              Vplay Search
            </h2>
            <p className={`text-xs md:text-sm font-semibold opacity-60 ${isDark ? "text-slate-300" : "text-slate-600"} tracking-wide uppercase`}>
              Tìm kiếm nhanh mọi kênh truyền hình, đài phát thanh và chuyên mục giải trí.
            </p>
          </div>
          <div className="w-full">
            <SearchBar 
              isDark={isDark} 
              query={searchQuery} 
              setQuery={setSearchQuery} 
              onClose={() => setSearchQuery("")} 
              liquidGlass={liquidGlass}
              onContextMenu={handleSearchContextMenu}
              searchFilterOption={searchFilterOption}
              setSearchFilterOption={setSearchFilterOption}
            />
          </div>
        </div>
      ) : (
        <div className="max-w-4xl mx-auto w-full px-4 space-y-8">
          <div className="w-full flex justify-center">
            <SearchBar 
              isDark={isDark} 
              query={searchQuery} 
              setQuery={setSearchQuery} 
              onClose={() => setSearchQuery("")} 
              liquidGlass={liquidGlass}
              onContextMenu={handleSearchContextMenu}
              searchFilterOption={searchFilterOption}
              setSearchFilterOption={setSearchFilterOption}
            />
          </div>
          <div className="w-full border-t border-slate-800/40 pt-6">
            <SearchPopup 
              isDark={isDark} 
              searchQuery={searchQuery} 
              setActiveChannel={setActiveChannel} 
              onClose={() => setSearchQuery("")} 
              favorites={favorites}
              liquidGlass={liquidGlass}
              setActiveTab={setActiveTab}
              handleOpenSettings={handleOpenSettings}
              setIsDark={setIsDark}
              setLiquidGlass={setLiquidGlass}
              onLogin={onLogin}
              onLogout={onLogout}
              setSortOrder={setSortOrder}
              loadingTreatment={loadingTreatment}
              asContent
              useSidebar={useSidebar}
              setUseSidebar={setUseSidebar}
              isSidebarRight={isSidebarRight}
              setIsSidebarRight={setIsSidebarRight}
              sidebarDisplay={sidebarDisplay}
              setSidebarDisplay={setSidebarDisplay}
              isPinningEnabled={isPinningEnabled}
              setIsPinningEnabled={setIsPinningEnabled}
              featureFlags={featureFlags}
              setFeatureFlags={setFeatureFlags}
              setIsSidebarLocked={setIsSidebarLocked}
              setSearchQuery={setSearchQuery}
              searchFilter={searchFilter}
              onContextMenu={handleSearchContextMenu}
              allCustomChannels={allCustomChannels}
              searchFilterOption={searchFilterOption}
              currentTab={currentTab}
              setActiveSettingsPage={setActiveSettingsPage}
            />
          </div>
        </div>
      )}
    </div>
  );
}


function IndividualPlayer({ channel, isMuted, volume, isDark }: { channel: Channel, isMuted: boolean, volume: number, isDark: boolean }) {
  const videoRef = useRef<HTMLVideoElement>(null);
  const hlsRef = useRef<Hls | null>(null);
  const isImageStream = channel.stream.match(/\.(png|jpg|jpeg|svg|gif|webp)/) || channel.stream.includes("Colorbars") || channel.status === "maintenance";
  const colorbarsUrl = "https://upload.wikimedia.org/wikipedia/commons/thumb/5/5b/EBU_Colorbars_HD.svg/960px-EBU_Colorbars_HD.svg.png?_=20220810032923";
  const imageUrl = channel.status === "maintenance" ? colorbarsUrl : channel.stream;

  useEffect(() => {
    if (isImageStream) {
      if (hlsRef.current) {
        hlsRef.current.destroy();
        hlsRef.current = null;
      }
      return;
    }

    const video = videoRef.current;
    if (!video) return;

    if (hlsRef.current) {
      hlsRef.current.destroy();
    }

    if (Hls.isSupported()) {
      const hls = new Hls({ enableWorker: true });
      hlsRef.current = hls;
      hls.loadSource(channel.stream);
      hls.attachMedia(video);
      hls.on(Hls.Events.MANIFEST_PARSED, () => {
        video.play().catch(() => {});
      });
    } else if (video.canPlayType('application/vnd.apple.mpegurl')) {
      video.src = channel.stream;
    }

    return () => {
      if (hlsRef.current) hlsRef.current.destroy();
    };
  }, [channel, isImageStream]);

  useEffect(() => {
    if (videoRef.current && !isImageStream) {
      videoRef.current.volume = volume;
      videoRef.current.muted = isMuted;
    }
  }, [volume, isMuted, isImageStream]);

  if (isImageStream) {
    return (
      <img 
        src={imageUrl} 
        alt={channel.name} 
        className="w-full h-full object-contain bg-black select-none" 
        referrerPolicy="no-referrer"
      />
    );
  }

  return (
    <video 
      ref={videoRef} 
      className="w-full h-full object-contain bg-black" 
      autoPlay 
      playsInline
      muted={isMuted}
    />
  );
}

function TVContent({ key, mode = "live", active, setActive, isDark, favorites, toggleFavorite, user, onLogin, isDev, liquidGlass, sortOrder, setSortOrder, showSplash, featureFlags, searchQuery, bypassed, setIsPlayerInView, loadingTreatment, currentTime, onChannelContextMenu, pinnedChannels, togglePinChannel, isTopBarVisible = true, useNewDesign, setUseNewDesign, showChannelNumbers }: { 
  key?: string,
  mode?: "live" | "realm",
  active: Channel, 
  setActive: (ch: Channel) => void, 
  isDark: boolean,
  favorites: string[],
  toggleFavorite: (ch: Channel) => void,
  user: any,
  onLogin: () => void,
  isDev?: boolean,
  liquidGlass: "glassy" | "tinted",
  sortOrder: "default" | "az" | "za",
  setSortOrder: (val: "default" | "az" | "za") => void,
  showSplash?: boolean,
  featureFlags: { [key: string]: boolean },
  searchQuery: string,
  bypassed?: boolean,
  setIsPlayerInView: (val: boolean) => void,
  loadingTreatment: string,
  currentTime: Date,
  onChannelContextMenu: (e: React.MouseEvent, ch: Channel) => void,
  pinnedChannels: Channel[],
  togglePinChannel: (ch: Channel) => void,
  isTopBarVisible?: boolean,
  useNewDesign?: boolean,
  setUseNewDesign?: (val: boolean) => void,
  showChannelNumbers?: boolean
}) {
  const videoRef = useRef<HTMLVideoElement>(null);
  const containerRef = useRef<HTMLDivElement>(null);
  const hlsRef = useRef<Hls | null>(null);
  const beepOscillatorRef = useRef<OscillatorNode | null>(null);
  const beepGainRef = useRef<GainNode | null>(null);
  const audioContextRef = useRef<AudioContext | null>(null);

  const [isMobileScheduleOpen, setIsMobileScheduleOpen] = useState(false);
  const [selectedDayOffset, setSelectedDayOffset] = useState<number>(0);
  const [isRemoteOpen, setIsRemoteOpen] = useState(false);
  const [remoteInput, setRemoteInput] = useState("");

  const [liveSubTab, setLiveSubTab] = useState<"vplay" | "custom" | "url">(mode === "realm" ? "custom" : "vplay");
  const [liveTabSection, setLiveTabSection] = useState<"channels" | "schedule" | "favorites">("channels");
  const [isLargeLayout, setIsLargeLayout] = useState<boolean>(() => {
    try {
      const saved = localStorage.getItem("vplay_is_large_layout");
      return saved ? JSON.parse(saved) : false;
    } catch {
      return false;
    }
  });

  const handleToggleLargeLayout = (val: boolean) => {
    setIsLargeLayout(val);
    try {
      localStorage.setItem("vplay_is_large_layout", JSON.stringify(val));
    } catch (e) {
      console.error(e);
    }
  };

  const parseM3U = (text: string): Channel[] => {
    const lines = text.split("\n");
    const parsedChannels: Channel[] = [];
    let currentGroup = "Kênh tự thêm";
    
    for (let i = 0; i < lines.length; i++) {
      const line = lines[i].trim();
      if (line.startsWith("#EXTINF:")) {
        let name = "Kênh không tên";
        let logo = "https://static.wikia.nocookie.net/ftv/images/e/ed/FTV_Channel.png/revision/latest?cb=20260424160410&path-prefix=vi";
        let stream = "";
        
        const commaIndex = line.lastIndexOf(",");
        if (commaIndex !== -1) {
          name = line.substring(commaIndex + 1).trim();
        }
        
        const logoMatch = line.match(/tvg-logo="([^"]+)"/) || line.match(/logo="([^"]+)"/);
        if (logoMatch && logoMatch[1]) {
          logo = logoMatch[1];
        }
        
        const groupMatch = line.match(/group-title="([^"]+)"/);
        if (groupMatch && groupMatch[1]) {
          currentGroup = groupMatch[1];
        }
        
        let nextLineIndex = i + 1;
        while (nextLineIndex < lines.length && (lines[nextLineIndex].trim() === "" || lines[nextLineIndex].trim().startsWith("#"))) {
          nextLineIndex++;
        }
        
        if (nextLineIndex < lines.length) {
          stream = lines[nextLineIndex].trim();
          if (stream) {
            parsedChannels.push({
              name: name,
              category: currentGroup || "Kênh tự thêm",
              logo: logo,
              stream: stream,
              desc: `Luồng phát tự thêm từ M3U`
            });
          }
        }
      }
    }
    return parsedChannels;
  };

  const [customPlaylists, setCustomPlaylists] = useState<{ id: string; name: string; content: string; channels: Channel[] }[]>(() => {
    const saved = localStorage.getItem("vplay_custom_playlists_v2");
    if (saved) {
      try {
        return JSON.parse(saved);
      } catch (e) {
        console.error("Failed to parse playlists", e);
      }
    }
    return Array.from({ length: 5 }).map((_, idx) => ({
      id: `list-${idx + 1}`,
      name: `Package của bạn ${idx + 1}`,
      content: "",
      channels: []
    }));
  });

  const deletePlaylist = (idx: number) => {
    if (customPlaylists.length <= 1) {
      setCustomPlaylists(prev => {
        const next = [...prev];
        next[0] = {
          id: `list-1`,
          name: `Package của bạn 1`,
          content: "",
          channels: []
        };
        localStorage.setItem("vplay_custom_playlists_v2", JSON.stringify(next));
        return next;
      });
      setCustomPage(0);
      showToast("Đã xóa sạch Package cuối cùng và đặt lại mặc định", "info");
      return;
    }

    const playlistName = customPlaylists[idx].name;
    setCustomPlaylists(prev => {
      const next = prev.filter((_, i) => i !== idx);
      localStorage.setItem("vplay_custom_playlists_v2", JSON.stringify(next));
      return next;
    });

    if (activePlaylistIdx >= idx) {
      setActivePlaylistIdx(Math.max(0, activePlaylistIdx - 1));
    }
    setCustomPage(0);
    showToast(`Đã xóa Package "${playlistName}" thành công!`, "success");
  };

  const [activePlaylistIdx, setActivePlaylistIdx] = useState<number>(0);
  const [customPage, setCustomPage] = useState<number>(0);
  const [editingPlaylistIdx, setEditingPlaylistIdx] = useState<number | null>(null);
  const [tempPlaylistName, setTempPlaylistName] = useState("");
  const [tempPlaylistContent, setTempPlaylistContent] = useState("");

  const [urlStreamInput, setUrlStreamInput] = useState("");
  const [urlStreamName, setUrlStreamName] = useState("VLC Live Stream");
  const [urlHistory, setUrlHistory] = useState<{ name: string; url: string; date: string }[]>(() => {
    const saved = localStorage.getItem("vplay_url_stream_history");
    return saved ? JSON.parse(saved) : [];
  });

  // Generate 7 days mapping from Day -3 to Day +3
  const dayOptions = useMemo(() => {
    const options = [];
    const weekdays = ["Chủ Nhật", "Thứ Hai", "Thứ Ba", "Thứ Tư", "Thứ Năm", "Thứ Sáu", "Thứ Bảy"];
    const now = new Date();
    
    for (let i = -3; i <= 3; i++) {
      const d = new Date(now);
      d.setDate(now.getDate() + i);
      const dayName = i === 0 ? "Hôm nay" : `${String(d.getDate()).padStart(2, '0')}/${String(d.getMonth() + 1).padStart(2, '0')}`;
      options.push({
        offset: i,
        label: dayName,
        desc: i === 0 ? "Hôm nay" : weekdays[d.getDay()]
      });
    }
    return options;
  }, []);

  // Generate 24-hour schedule based on dynamic channel name to look extremely realistic!
  const scheduleItems = useMemo(() => {
    return Array.from({ length: 24 }).map((_, hour) => {
      const timeStr = String(hour).padStart(2, '0') + ":00";
      return {
        time: timeStr,
        title: "Chương trình",
        hour
      };
    });
  }, []);

  const currentHour = currentTime ? currentTime.getHours() : new Date().getHours();
  const activeItemRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    // Scroll to current hour item smoothly inside the schedule sidebar
    setTimeout(() => {
      if (activeItemRef.current) {
        activeItemRef.current.scrollIntoView({
          behavior: 'smooth',
          block: 'nearest'
        });
      }
    }, 300);
  }, [active.name, currentHour]);

  // Pre-initialize and resume AudioContext on actual user interactions (clicks or touchstarts) to satisfy iOS Safari & Chrome Mobile requirements
  useEffect(() => {
    const initAndUnlockAudio = () => {
      try {
        if (!audioContextRef.current) {
          const AudioContextClass = window.AudioContext || (window as any).webkitAudioContext;
          if (AudioContextClass) {
            audioContextRef.current = new AudioContextClass();
          }
        }
        const ctx = audioContextRef.current;
        if (ctx && ctx.state === "suspended") {
          ctx.resume().catch((err) => console.log("resume failed", err));
        }
      } catch (err) {
        console.warn("Failed to unlock and resume web audio content", err);
      }
    };

    window.addEventListener("click", initAndUnlockAudio, { capture: true, passive: true });
    window.addEventListener("touchstart", initAndUnlockAudio, { capture: true, passive: true });

    return () => {
      window.removeEventListener("click", initAndUnlockAudio, { capture: true });
      window.removeEventListener("touchstart", initAndUnlockAudio, { capture: true });
    };
  }, []);

  useEffect(() => {
    const observer = new IntersectionObserver(
      ([entry]) => {
        setIsPlayerInView(entry.isIntersecting);
      },
      { threshold: 0.1 }
    );

    if (containerRef.current) {
      observer.observe(containerRef.current);
    }

    return () => {
      observer.disconnect();
    };
  }, [setIsPlayerInView]);

  const [lockPlayer, setLockPlayer] = useState(() => {
    const saved = localStorage.getItem("vplay_lock_player");
    return saved === null ? true : saved === "true";
  });
  const [isScrolledPast, setIsScrolledPast] = useState(false);

  useEffect(() => {
    localStorage.setItem("vplay_lock_player", lockPlayer.toString());
    if (!lockPlayer) {
      setIsScrolledPast(false);
    }
  }, [lockPlayer]);

  useEffect(() => {
    if (!lockPlayer) {
      setIsScrolledPast(false);
      return;
    }
    const handleScroll = () => {
      const threshold = window.innerWidth < 768 ? 100 : 320;
      if (window.scrollY > threshold) {
        setIsScrolledPast(true);
      } else {
        setIsScrolledPast(false);
      }
    };
    handleScroll();
    window.addEventListener("scroll", handleScroll, { passive: true });
    return () => window.removeEventListener("scroll", handleScroll);
  }, [lockPlayer]);

  const [isPlaying, setIsPlaying] = useState(true);
  const [isMuted, setIsMuted] = useState(false); // Default to sound ON
  const [volume, setVolume] = useState(1);
  const [levels, setLevels] = useState<Hls.Level[]>([]);
  const [currentLevel, setCurrentLevel] = useState(-1);
  const [showQualityMenu, setShowQualityMenu] = useState(false);
  const [filterType, setFilterType] = useState<string>("Tất cả");
  const [streamError, setStreamError] = useState<string | null>(null);

  useEffect(() => {
    if (streamError) {
      showToast("Lỗi luồng phát kênh", "error");
    }
  }, [streamError]);

  useEffect(() => {
    if (active.status === "maintenance") {
      showToast("Kênh hiện đang được bảo trì", "warning");
    }
  }, [active]);

  useEffect(() => {
    const handleFullscreenChange = () => {
      // Keep playing, do not pause video on exit fullscreen
    };

    document.addEventListener("fullscreenchange", handleFullscreenChange);
    document.addEventListener("webkitfullscreenchange", handleFullscreenChange);
    document.addEventListener("mozfullscreenchange", handleFullscreenChange);
    document.addEventListener("MSFullscreenChange", handleFullscreenChange);

    return () => {
      document.removeEventListener("fullscreenchange", handleFullscreenChange);
      document.removeEventListener("webkitfullscreenchange", handleFullscreenChange);
      document.removeEventListener("mozfullscreenchange", handleFullscreenChange);
      document.removeEventListener("MSFullscreenChange", handleFullscreenChange);
    };
  }, []);

  useEffect(() => {
    const video = videoRef.current;
    if (!video) return;

    const handleWebkitEndFullscreen = () => {
      // Keep playing, do not pause video on iOS exit fullscreen
    };

    video.addEventListener("webkitendfullscreen", handleWebkitEndFullscreen);
    return () => {
      video.removeEventListener("webkitendfullscreen", handleWebkitEndFullscreen);
    };
  }, [active]);

  // categories definition removed to avoid duplication

  const [showFilterMenu, setShowFilterMenu] = useState(false);
  const [showSortMenu, setShowSortMenu] = useState(false);
  const [isRecording, setIsRecording] = useState(false);
  const mediaRecorderRef = useRef<MediaRecorder | null>(null);
  const chunksRef = useRef<Blob[]>([]);

  // Multiview state
  const [isMultiview, setIsMultiview] = useState(false);
  const [multiviewCount, setMultiviewCount] = useState(4); // Default 4 channels
  const [multiviewChannels, setMultiviewChannels] = useState<(Channel | null)[]>([]);
  const [multiviewVolumes, setMultiviewVolumes] = useState<{ [key: number]: number }>({});
  const [showLayoutMenu, setShowLayoutMenu] = useState(false);

  useEffect(() => {
    if (multiviewChannels.length === 0) {
      setMultiviewChannels([active, ...Array(multiviewCount - 1).fill(null)]);
    } else {
      const newChannels = [...multiviewChannels];
      if (newChannels.length < multiviewCount) {
        setMultiviewChannels([...newChannels, ...Array(multiviewCount - newChannels.length).fill(null)]);
      } else if (newChannels.length > multiviewCount) {
        setMultiviewChannels(newChannels.slice(0, multiviewCount));
      }
    }
  }, [multiviewCount]);

  useEffect(() => {
    if (isMultiview && multiviewChannels[0]?.name !== active.name) {
      setMultiviewChannels(prev => {
        const next = [...prev];
        next[0] = active;
        return next;
      });
    }
  }, [active, isMultiview]);

  const toggleMultiview = () => {
    if (!isMultiview) {
      setMultiviewChannels([active, ...Array(multiviewCount - 1).fill(null)]);
    }
    setIsMultiview(!isMultiview);
  };

  const timeString = (currentTime || new Date()).toLocaleTimeString('vi-VN', { hour: '2-digit', minute: '2-digit', hour12: false });
  const isMaintenance = active.status === "maintenance";

  const displayChannelsList = useMemo(() => {
    if (liveSubTab === "vplay") {
      return channels;
    } else if (liveSubTab === "custom") {
      return customPlaylists[activePlaylistIdx]?.channels || [];
    } else {
      return [];
    }
  }, [liveSubTab, customPlaylists, activePlaylistIdx]);

  const filteredChannels = useMemo(() => {
    return displayChannelsList
      .filter(ch => {
        if (ch.name === "VTV5 Tây Nam Bộ" || ch.name === "VTV5 Tây Nguyên") {
          return false;
        }
        const matchesSearch = ch.name.toLowerCase().includes(searchQuery.toLowerCase());
        const matchesType = filterType === "Tất cả" 
          || (filterType === "Hoạt động" && ch.status !== "maintenance")
          || (filterType === "Bảo trì" && ch.status === "maintenance")
          || (filterType === "Thử nghiệm" && ch.name === "VTV6")
          || (filterType === "Thiết yếu" && (ch.name === "VTV1" || ch.name === "VTV5" || ch.name === "Vietnam Today" || ch.name.includes("ANTV") || ch.name.includes("QPVN")))
          || (filterType === "VTV" && ["VTV1", "VTV2", "VTV3", "VTV4", "VTV5", "VTV6", "VTV7", "VTV8", "VTV9", "VTV Cần Thơ", "Vietnam Today"].includes(ch.name))
          || (filterType === "VTVcab" && ch.name.includes("ON"))
          || (filterType === "HTV" && ch.name.startsWith("HTV"))
          || (filterType === "Các kênh địa phương" && (
               !(ch.name === "VTV1" || ch.name === "VTV5" || ch.name === "Vietnam Today" || ch.name.includes("ANTV") || ch.name.includes("QPVN")) &&
               !["VTV2", "VTV3", "VTV4", "VTV6", "VTV7", "VTV8", "VTV9", "VTV Cần Thơ"].includes(ch.name) &&
               !ch.name.includes("ON") &&
               !ch.name.startsWith("HTV")
             ))
          || ch.category === filterType;
        return matchesSearch && matchesType;
      })
      .sort((a, b) => {
        if (sortOrder === "default") return 0;
        if (sortOrder === "az") return a.name.localeCompare(b.name);
        return b.name.localeCompare(a.name);
      });
  }, [displayChannelsList, searchQuery, filterType, sortOrder]);

  const LIVE_CATEGORIES = ["Thử nghiệm", "Thiết yếu", "VTV", "VTVcab", "HTV", "Các kênh địa phương"];
  const filteredCategories = useMemo(() => {
    if (liveSubTab === "custom") {
      const cats = Array.from(new Set(filteredChannels.map(c => c.category || "Kênh tự thêm")));
      return cats.length > 0 ? cats : ["Kênh tự thêm"];
    }
    return LIVE_CATEGORIES.filter(cat => {
      if (cat === "Thử nghiệm") {
        return filteredChannels.some(c => c.name === "VTV6");
      }
      if (cat === "Thiết yếu") {
        return filteredChannels.some(c => 
          c.name === "VTV1" || 
          c.name === "VTV5" || 
          c.name === "Vietnam Today" || 
          c.name.includes("ANTV") || 
          c.name.includes("QPVN")
        );
      }
      if (cat === "VTV") {
        const vtvNames = ["VTV1", "VTV2", "VTV3", "VTV4", "VTV5", "VTV6", "VTV7", "VTV8", "VTV9", "VTV Cần Thơ", "Vietnam Today"];
        return filteredChannels.some(c => vtvNames.includes(c.name));
      }
      if (cat === "VTVcab") {
        return filteredChannels.some(c => c.name.includes("ON"));
      }
      if (cat === "HTV") {
        return filteredChannels.some(c => c.name.startsWith("HTV"));
      }
      if (cat === "Các kênh địa phương") {
        return filteredChannels.some(c => {
          const isThietYeu = c.name === "VTV1" || c.name === "VTV5" || c.name === "Vietnam Today" || c.name.includes("ANTV") || c.name.includes("QPVN");
          const isVTV = ["VTV1", "VTV2", "VTV3", "VTV4", "VTV5", "VTV6", "VTV7", "VTV8", "VTV9", "VTV Cần Thơ", "Vietnam Today"].includes(c.name);
          const isVTVcab = c.name.includes("ON");
          const isHTV = c.name.startsWith("HTV");
          return !isThietYeu && !isVTV && !isVTVcab && !isHTV;
        });
      }
      return false;
    });
  }, [filteredChannels, liveSubTab]);

  // Play 1000Hz testcard tone beep for testcard/maintenance channels
  useEffect(() => {
    const isTestcard = active.status === "maintenance" || active.stream.includes("Colorbars");
    
    if (!isTestcard || isMuted || volume === 0 || showSplash) {
      if (beepOscillatorRef.current) {
        try {
          beepOscillatorRef.current.stop();
        } catch (e) {}
        try {
          beepOscillatorRef.current.disconnect();
        } catch (e) {}
        beepOscillatorRef.current = null;
      }
      return;
    }

    try {
      if (!audioContextRef.current) {
        audioContextRef.current = new (window.AudioContext || (window as any).webkitAudioContext)();
      }
      const ctx = audioContextRef.current;
      
      // Auto-resume if suspended
      if (ctx.state === "suspended") {
        const resumeAudio = () => {
          ctx.resume().catch(() => {});
        };
        window.addEventListener("click", resumeAudio, { once: true });
        window.addEventListener("touchstart", resumeAudio, { once: true });
        ctx.resume().catch(() => {});
      }

      if (beepOscillatorRef.current) {
        if (beepGainRef.current) {
          beepGainRef.current.gain.setValueAtTime(volume * 0.12, ctx.currentTime);
        }
        return;
      }

      const osc = ctx.createOscillator();
      const gainNode = ctx.createGain();

      osc.type = "sine";
      osc.frequency.setValueAtTime(1000, ctx.currentTime); // 1000Hz pure tone
      gainNode.gain.setValueAtTime(volume * 0.12, ctx.currentTime); // 12% gain to be a clear but comfortable beep

      osc.connect(gainNode);
      gainNode.connect(ctx.destination);
      osc.start();

      beepOscillatorRef.current = osc;
      beepGainRef.current = gainNode;
    } catch (err) {
      console.error("Failed to start testcard beep generator", err);
    }

    return () => {
      if (beepOscillatorRef.current) {
        try {
          beepOscillatorRef.current.stop();
        } catch (e) {}
        try {
          beepOscillatorRef.current.disconnect();
        } catch (e) {}
        beepOscillatorRef.current = null;
      }
    };
  }, [active, isMuted, volume, showSplash]);

  useEffect(() => {
    if (!user && !isDev && !bypassed) return;
    if (showSplash) return; // Wait until sound is unblocked by user interaction
    
    // Always try to reset mute when splash is gone
    setIsMuted(false);

    const isImageStream = active.stream.match(/\.(png|jpg|jpeg|svg|gif|webp)/) || active.stream.includes("Colorbars") || active.status === "maintenance";
    if (isImageStream) {
      if (hlsRef.current) {
        hlsRef.current.destroy();
        hlsRef.current = null;
      }
      setIsPlaying(true);
      setStreamError(null);
      return;
    }

    const video = videoRef.current;
    if (!video) return;

    // Track watched channel
    if (user) {
      const userRef = doc(db, "users", user.uid);
      updateDoc(userRef, {
        watchedChannels: arrayUnion(active.name)
      }).catch(err => {
        console.warn("Could not save watched channels to Firestore:", err);
      });
    }

    video.volume = volume;
    setStreamError(null);
    let isEffectMounted = true;

    if (hlsRef.current) {
      hlsRef.current.destroy();
    }

    let hls: Hls | null = null;

    if (Hls.isSupported()) {
      hls = new Hls({
        enableWorker: true,
        lowLatencyMode: true,
        backBufferLength: 60
      });
      hlsRef.current = hls;
      hls.attachMedia(video);
      
      // Remove proxy for live streams because native HLS correctly resolves relative URLs and CDNs handle CORS.
      // The proxy was originally created for testing but breaks chunk requests.
      hls.loadSource(active.stream);

      hls.on(Hls.Events.MANIFEST_PARSED, () => {
        if (!isEffectMounted) return;
        setStreamError(null);
        setIsPlaying(true);
        const playPromise = video.play();
        if (playPromise !== undefined) {
          playPromise.catch(e => {
            if (e.name === 'AbortError') return;
            console.warn("Autoplay prevented, trying muted", e);
            video.muted = true;
            setIsMuted(true);
            video.play().catch(() => {});
          });
        }
        setLevels(hls!.levels);
        setCurrentLevel(hls!.currentLevel);
      });
      hls.on(Hls.Events.LEVEL_SWITCHED, (_, data) => {
        if (!isEffectMounted) return;
        setCurrentLevel(data.level);
      });
      hls.on(Hls.Events.ERROR, (_, data) => {
        if (!isEffectMounted) return;
        if (data.fatal) {
          switch (data.type) {
            case Hls.ErrorTypes.NETWORK_ERROR:
              setStreamError("Lỗi mạng: Không thể tải luồng phát. Vui lòng kiểm tra kết nối hoặc CORS.");
              hls!.startLoad();
              break;
            case Hls.ErrorTypes.MEDIA_ERROR:
              setStreamError("Lỗi media: Dữ liệu video không hợp lệ.");
              hls!.recoverMediaError();
              break;
            default:
              setStreamError("Lỗi không xác định khi tải kênh.");
              hls!.destroy();
              break;
          }
        }
      });
    } else if (video.canPlayType('application/vnd.apple.mpegurl')) {
      video.src = active.stream;
      const onLoadedMetadata = () => {
        if (!isEffectMounted) return;
        const playPromise = video.play();
        if (playPromise !== undefined) {
          playPromise.catch(() => {
            video.muted = true;
            setIsMuted(true);
            video.play().catch(() => {});
          });
        }
      };
      const onError = () => {
        if (!isEffectMounted) return;
        setStreamError("Trình duyệt báo lỗi khi phát luồng này.");
      };
      video.addEventListener('loadedmetadata', onLoadedMetadata);
      video.addEventListener('error', onError);
    }

    return () => {
      isEffectMounted = false;
      if (hlsRef.current) {
        hlsRef.current.destroy();
        hlsRef.current = null;
      }
      if (video) {
        video.pause();
        video.removeAttribute('src');
        video.load();
      }
    };
  }, [active, user]);

  const togglePlay = () => {
    const video = videoRef.current;
    if (!video) return;
    if (video.paused) {
      const playPromise = video.play();
      if (playPromise !== undefined) {
        playPromise.catch(e => {
          console.warn("Autoplay or resume prevented, trying muted fallback", e);
          video.muted = true;
          setIsMuted(true);
          video.play().catch(() => {});
        });
      }
      setIsPlaying(true);
      enterFullscreen();
    } else {
      video.pause();
      setIsPlaying(false);
    }
  };

  const enterFullscreen = () => {
    const container = containerRef.current;
    const video = videoRef.current;
    if (!container) {
      if (video && typeof (video as any).webkitEnterFullscreen === 'function') {
        try {
          (video as any).webkitEnterFullscreen();
        } catch (e) {
          console.warn(e);
        }
      }
      return;
    }

    if (container.requestFullscreen) {
      container.requestFullscreen().catch(() => {
        if (video && typeof (video as any).webkitEnterFullscreen === 'function') {
          try {
            (video as any).webkitEnterFullscreen();
          } catch (e) {}
        }
      });
    } else if (video && typeof (video as any).webkitEnterFullscreen === 'function') {
      try {
        (video as any).webkitEnterFullscreen();
      } catch (err) {
        console.error("webkitEnterFullscreen list failed", err);
      }
    } else if ((container as any).webkitRequestFullscreen) {
      try {
        (container as any).webkitRequestFullscreen();
      } catch (e) {}
    }
  };

  const playChannelAndEnterFullscreen = (ch: Channel) => {
    setActive(ch);
  };

  const toggleMute = () => {
    const video = videoRef.current;
    if (!video) return;
    video.muted = !video.muted;
    setIsMuted(video.muted);
  };

  const handleVolumeChange = (e: ChangeEvent<HTMLInputElement>) => {
    const val = parseFloat(e.target.value);
    setVolume(val);
    if (videoRef.current) {
      videoRef.current.volume = val;
      if (val > 0 && isMuted) {
        videoRef.current.muted = false;
        setIsMuted(false);
      } else if (val === 0 && !isMuted) {
        videoRef.current.muted = true;
        setIsMuted(true);
      }
    }
  };

  const setQuality = (level: number) => {
    if (hlsRef.current) {
      hlsRef.current.currentLevel = level;
      setShowQualityMenu(false);
    }
  };

  const toggleFullscreen = () => {
    const container = containerRef.current;
    if (!container) return;
    const video = videoRef.current;

    if (!document.fullscreenElement) {
      if (container.requestFullscreen) {
        container.requestFullscreen().catch(() => {
          if (video && typeof (video as any).webkitEnterFullscreen === 'function') {
            (video as any).webkitEnterFullscreen();
          }
        });
      } else if (video && typeof (video as any).webkitEnterFullscreen === 'function') {
        try {
          (video as any).webkitEnterFullscreen();
        } catch (err) {
          console.error("webkitEnterFullscreen list failed", err);
        }
      } else if ((container as any).webkitRequestFullscreen) {
        (container as any).webkitRequestFullscreen();
      }
    } else {
      if (document.exitFullscreen) {
        document.exitFullscreen();
      } else if ((document as any).webkitExitFullscreen) {
        (document as any).webkitExitFullscreen();
      }
    }
  };

  const toggleRecording = () => {
    if (!isRecording) {
      const video = videoRef.current;
      if (!video) return;

      try {
        // @ts-ignore - captureStream is semi-standard
        const stream = video.captureStream ? video.captureStream() : (video as any).mozCaptureStream ? (video as any).mozCaptureStream() : null;
        
        if (!stream) {
          alert("Trình duyệt không hỗ trợ ghi hình video.");
          return;
        }

        const mimeType = MediaRecorder.isTypeSupported('video/mp4') ? 'video/mp4' : 'video/webm';
        const recorder = new MediaRecorder(stream, { mimeType });
        mediaRecorderRef.current = recorder;
        chunksRef.current = [];

        recorder.ondataavailable = (e) => {
          if (e.data.size > 0) {
            chunksRef.current.push(e.data);
          }
        };

        recorder.onstop = () => {
          const blob = new Blob(chunksRef.current, { type: mimeType });
          const url = URL.createObjectURL(blob);
          const a = document.createElement('a');
          
          const date = new Date();
          const timestamp = date.getFullYear() + 
                          ('0' + (date.getMonth() + 1)).slice(-2) + 
                          ('0' + date.getDate()).slice(-2) + "_" + 
                          ('0' + date.getHours()).slice(-2) + 
                          ('0' + date.getMinutes()).slice(-2);
          
          const filename = `${active.name}_${timestamp}_vplayrec.mp4`;
          
          a.href = url;
          a.download = filename;
          document.body.appendChild(a);
          a.click();
          document.body.removeChild(a);
          URL.revokeObjectURL(url);
        };

        recorder.start();
        setIsRecording(true);
      } catch (err) {
        console.error("Recording error:", err);
        alert("Lỗi khi ghi hình. Có thể do giới hạn bảo mật (CORS) của luồng phát này.");
      }
    } else {
      if (mediaRecorderRef.current && mediaRecorderRef.current.state !== 'inactive') {
        mediaRecorderRef.current.stop();
        setIsRecording(false);
      }
    }
  };

  // categories definition removed to avoid duplication

  const [showChannelSelector, setShowChannelSelector] = useState<{ idx: number } | null>(null);
  const [channelSearch, setChannelSearch] = useState("");

  const filteredMultiviewChannels = channels.filter(c => 
    c.name.toLowerCase().includes(channelSearch.toLowerCase()) ||
    c.category.toLowerCase().includes(channelSearch.toLowerCase())
  );

  return (
    <div className="flex-1 p-0 md:p-6 w-full max-w-[1600px] 2xl:max-w-[1800px] mx-auto px-0 md:px-12 overflow-x-hidden">
      {/* Liquid Modal for Channel Selection */}
      <LiquidModal
        isOpen={!!showChannelSelector}
        onClose={() => { setShowChannelSelector(null); setChannelSearch(""); }}
        isDark={isDark}
        title="Chọn kênh Multiview"
        description="Tìm kiếm và chọn kênh truyền hình bạn muốn thêm vào lưới Multiview"
        liquidGlass={liquidGlass}
      >
        <div className="space-y-6">
          <div className={`relative group flex items-center gap-3 px-6 py-4 rounded-full overflow-hidden transition-all ${isDark ? "bg-white/5" : "bg-slate-100"}`}>
            <SearchIcon size={18} className={`transition-colors ${isDark ? "text-slate-500 group-focus-within:text-[#4AC4FE]" : "text-slate-400 group-focus-within:text-[#4AC4FE]"}`} />
            <input 
              type="text"
              placeholder="Tìm tên kênh hoặc thể loại..."
              value={channelSearch}
              onChange={(e) => setChannelSearch(e.target.value)}
              className={`bg-transparent border-none outline-none text-sm font-bold w-full placeholder-slate-500 ${isDark ? "text-white" : "text-slate-900"}`}
            />
            <div className={`absolute bottom-0 left-0 h-[2px] w-full transition-all duration-300 ${isDark ? "bg-white/10" : "bg-slate-200"} group-focus-within:bg-[#4AC4FE] group-focus-within:shadow-[0_0_10px_rgba(168,85,247,0.5)]`} />
          </div>

          <div className="max-h-[350px] overflow-y-auto px-1 space-y-2 custom-scrollbar pr-2">
            {filteredMultiviewChannels.length > 0 ? (
              filteredMultiviewChannels.map(c => (
                <button
                  key={`${c.name}-${c.stream}`}
                  onClick={() => {
                    if (showChannelSelector) {
                      setMultiviewChannels(prev => {
                        const next = [...prev];
                        next[showChannelSelector.idx] = c;
                        return next;
                      });
                      setShowChannelSelector(null);
                      setChannelSearch("");
                    }
                  }}
                  className={`w-full flex items-center gap-4 p-3 rounded-[20px] transition-all group ${isDark ? "hover:bg-white/5 text-white" : "hover:bg-slate-100 text-slate-900"}`}
                >
                  <div className={`w-10 h-10 rounded-xl flex items-center justify-center p-2 border ${isDark ? "bg-white/5 border-white/10" : "bg-white border-slate-200"}`}>
                    <img src={c.logo} alt={c.name} className="w-full h-full object-contain" referrerPolicy="no-referrer" />
                  </div>
                  <div className="flex-1 text-left">
                    <p className="font-bold text-sm leading-tight uppercase tracking-tight">{c.name}</p>
                    <p className="text-[10px] text-slate-500 font-bold uppercase tracking-widest">{c.category}</p>
                  </div>
                  <div className="p-2 rounded-full bg-[#4AC4FE]/10 text-[#4AC4FE] opacity-0 group-hover:opacity-100 transition-opacity">
                    <SignInIcon size={16} />
                  </div>
                </button>
              ))
            ) : (
              <div className="py-20 text-center space-y-4">
                <div className="inline-flex p-4 rounded-full bg-slate-500/10 text-slate-500">
                  <SearchIcon size={32} />
                </div>
                <p className="text-sm font-bold text-slate-500 uppercase tracking-widest">Không tìm thấy kênh nào</p>
              </div>
            )}
          </div>
        </div>
      </LiquidModal>

      {/* MAIN WATCH AREA WITH SIDEBAR SCHEDULE */}
      <div className={`w-full md:max-w-4xl lg:max-w-6xl xl:max-w-[1280px] mx-auto flex flex-col lg:block gap-4 md:gap-6 mb-4 md:mb-6 relative z-10 transition-all duration-300 ${
        isDark ? "bg-vplay-background md:bg-transparent text-white" : "bg-white md:bg-transparent text-black"
      } lg:pr-[344px] xl:pr-[389px] pt-0 pb-0 md:py-0 md:px-0 px-0`}>
        
        {/* VIDEO PLAYER */}
        {isScrolledPast && (
          <div className="w-full aspect-video md:hidden shrink-0" id="player-scroll-placeholder" />
        )}
        <div 
          ref={containerRef}
          className={`bg-black flex items-center justify-center border-y md:border shadow-2xl overflow-hidden group w-full transition-all duration-300 ${
            isScrolledPast 
              ? "fixed top-14 left-0 right-0 z-[120] md:sticky md:top-20 md:z-30 shadow-2xl border-b border-slate-800/40" 
              : "relative md:sticky md:top-20 md:z-30"
          } ${
            isMultiview ? "aspect-auto min-h-[300px] md:min-h-[400px]" : "aspect-video"
          } ${
            liquidGlass ? "rounded-none md:rounded-2xl" : "rounded-none md:rounded-lg"
          } ${isDark ? "border-slate-800/40 md:border-slate-800" : "border-slate-300"}`}
        >
        {!user && !isDev && !bypassed ? (
          <div className={`absolute inset-0 z-10 flex flex-col items-center justify-center bg-slate-900/40 p-6 text-center ${
            liquidGlass ? "backdrop-blur-xl" : "backdrop-blur-none"
          }`}>
            <motion.div 
              initial={{ scale: 0.8, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              className={`p-10 border shadow-2xl flex flex-col items-center space-y-6 ${
                isDark 
                  ? "bg-[#181818]/85 border-white/10 text-white" 
                  : "bg-white/80 border-black/5 text-slate-900 shadow-xl"
              } backdrop-blur-md ${
                liquidGlass ? "rounded-[40px]" : "rounded-2xl"
              }`}
            >
              <div className="p-4 rounded-full bg-[#4AC4FE]/10">
                <Lock className="h-10 w-10 text-[#4AC4FE]" />
              </div>
              <div className="space-y-1">
                <h3 className={`text-2xl font-bold ${isDark ? "text-white" : "text-slate-900"}`}>Đăng nhập để xem</h3>
                <p className={`text-sm max-w-[280px] ${isDark ? "text-slate-400" : "text-slate-500"}`}>Vui lòng đăng nhập tài khoản VPlay để có thể xem kênh trực tuyến này.</p>
              </div>
              <button 
                onClick={onLogin}
                className="btn-purple-3d w-full"
              >
                Đăng nhập ngay
              </button>
            </motion.div>
          </div>
        ) : isMultiview ? (
          <div className={`w-full h-full grid gap-2 p-2 ${
            multiviewCount <= 2 ? "grid-cols-2" : 
            multiviewCount <= 4 ? "grid-cols-2" : 
            "grid-cols-3"
          }`}>
            {multiviewChannels.map((ch, idx) => (
              <div key={`multiview-slot-${idx}-${ch?.name || 'empty'}`} className="relative aspect-video bg-slate-900 rounded-lg overflow-hidden border border-white/5 group/slot">
                {ch ? (
                  <IndividualPlayer 
                    channel={ch} 
                    isMuted={multiviewVolumes[idx] === 0 || multiviewVolumes[idx] === undefined} 
                    volume={multiviewVolumes[idx] ?? 0}
                    isDark={isDark}
                  />
                ) : (
                  <div className="absolute inset-0 flex flex-col items-center justify-center gap-4 text-slate-500">
                    <div className="p-4 rounded-full bg-white/5 border border-white/5">
                      <TvIcon size={32} />
                    </div>
                    <span className="text-[10px] font-bold uppercase tracking-widest">Trống</span>
                  </div>
                )}
                
                {/* Individual Control Bar */}
                <div className="absolute bottom-0 left-0 right-0 p-2 bg-gradient-to-t from-black/80 to-transparent opacity-0 group-hover/slot:opacity-100 transition-opacity flex items-center justify-between gap-2">
                  <div className="flex items-center gap-2 truncate">
                    {ch && <ChannelLogo src={ch.logo} alt={ch.name} className="w-5 h-5" isDark={true} />}
                    <span className="text-[10px] font-bold text-white truncate">{ch?.name || "Chọn kênh"}</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <Volume2 size={12} className="text-white opacity-60" />
                    <input 
                      type="range" min="0" max="1" step="0.1" 
                      value={multiviewVolumes[idx] ?? 0}
                      onChange={(e) => {
                        const v = parseFloat(e.target.value);
                        setMultiviewVolumes(prev => ({ ...prev, [idx]: v }));
                      }}
                      className="w-12 h-1 bg-white/20 rounded-full appearance-none accent-[#4AC4FE]"
                    />
                    <button 
                      onClick={() => setMultiviewChannels(prev => {
                        const next = [...prev];
                        next[idx] = null;
                        return next;
                      })}
                      className="p-1 rounded bg-red-500/20 text-red-500 hover:bg-red-500/40"
                    >
                      <X size={10} />
                    </button>
                  </div>
                </div>

                {/* Slot Action Button (if empty) */}
                {!ch && (
                   <div className="absolute inset-0 z-10 flex items-center justify-center opacity-0 group-hover/slot:opacity-100 transition-opacity">
                      <button 
                        onClick={() => setShowChannelSelector({ idx })}
                        className="px-6 py-2.5 bg-white text-black rounded-full font-bold text-[10px] uppercase tracking-[0.2em] shadow-xl hover:scale-110 active:scale-95 transition-all"
                      >
                        Chọn kênh
                      </button>
                   </div>
                )}
              </div>
            ))}
          </div>
        ) : (
          <>
            {active.status === "coming-soon" ? (
              <div className="absolute inset-0 w-full h-full bg-[#0a0a0a] flex flex-col items-center justify-center p-8 overflow-hidden">
                <motion.div 
                  initial={{ opacity: 0, scale: 0.9 }}
                  animate={{ opacity: 1, scale: 1 }}
                  className="relative z-10 flex flex-col items-center text-center space-y-6"
                >
                  <ChannelLogo src={active.logo} alt={active.name} className="w-48 h-48 md:w-64 md:h-64" isDark={true} />
                  <div className="space-y-1">
                    <p className="text-white/60 text-lg md:text-xl font-medium">Kênh chưa tồn tại trong hệ thống</p>
                  </div>
                </motion.div>
              </div>
            ) : (active.stream.match(/\.(png|jpg|jpeg|svg|gif|webp)/) || active.stream.includes("Colorbars") || active.status === "maintenance") ? (
              <div 
                className="relative w-full h-full flex items-center justify-center bg-black select-none cursor-pointer"
                onDoubleClick={toggleFullscreen}
              >
                <img
                  src={(active.status === "maintenance" || active.stream.includes("Colorbars")) ? "https://upload.wikimedia.org/wikipedia/commons/thumb/5/5b/EBU_Colorbars_HD.svg/960px-EBU_Colorbars_HD.svg.png?_=20220810032923" : active.stream}
                  alt={active.name}
                  className="w-full h-full object-contain select-none"
                  referrerPolicy="no-referrer"
                />
                {active.status === "maintenance" && (
                  <div className="absolute top-6 left-6 bg-red-600/90 text-white font-mono font-bold text-xs px-3 py-1 rounded tracking-widest uppercase shadow-md flex items-center gap-2 border border-red-505/20">
                    <div className="w-1.5 h-1.5 rounded-full bg-white animate-ping" />
                    MAINTENANCE
                  </div>
                )}
              </div>
            ) : (
              <video
                ref={videoRef}
                className="w-full h-full object-contain cursor-pointer"
                autoPlay
                playsInline
                muted={isMuted}
                onClick={togglePlay}
                onDoubleClick={toggleFullscreen}
              />
            )}
            
            {streamError && active.status !== "maintenance" && (
              <div className="absolute inset-0 z-20 flex flex-col items-center justify-center bg-black/90 backdrop-blur-xl p-6 text-center">
                <div className="bg-red-500/20 p-4 rounded-full mb-4 ring-2 ring-red-500/50">
                  <X className="h-10 w-10 text-red-500" />
                </div>
                <h3 className="text-xl font-bold text-white mb-2">Lỗi bảo mật (CORS)</h3>
                <p className="text-white/60 text-sm max-w-xs mb-6">
                  {streamError}
                  <br />
                  <span className="text-[10px] mt-2 block text-amber-400 opacity-60">Gợi ý: Luồng phát này chặn xem trực tiếp trên Website. Hãy cài extension "CORS Unblock" hoặc mở link trực tiếp bên dưới.</span>
                </p>
                <div className="flex flex-wrap items-center justify-center gap-3">
                  <button 
                    onClick={() => window.open(active.stream, '_blank')}
                    className="btn-purple-3d px-6 py-2 text-sm"
                  >
                    <div className="flex items-center gap-2">
                      <ExternalLink size={16} />
                      Xem link gốc
                    </div>
                  </button>
                  <button 
                    onClick={() => window.location.reload()}
                    className="px-6 py-2 bg-white/10 hover:bg-white/20 text-white rounded-xl text-sm font-bold transition-all border border-white/10"
                  >
                    Tải lại trang
                  </button>
                </div>
              </div>
            )}
            {/* Tap to Unmute Overlay */}
            {isMuted && isPlaying && !isMaintenance && (
              <button 
                onClick={toggleMute}
                className="absolute top-4 right-4 bg-black/60 backdrop-blur-md text-white px-3 py-1.5 rounded-full text-xs font-bold flex items-center gap-2 hover:bg-black/80 transition-all animate-bounce"
              >
                <VolumeX className="h-4 w-4" />
                CHẠM ĐỂ BẬT TIẾNG
              </button>
            )}
            {!isMaintenance && (
              <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-transparent to-black/40 opacity-0 group-hover:opacity-100 transition-opacity duration-300 pointer-events-none flex flex-col justify-between">
                <div className="p-4 md:p-10 pointer-events-auto">
                   <div className="flex items-center gap-4">
                      <div className="p-2 md:p-3 bg-white/10 backdrop-blur-3xl border border-white/20 rounded-xl md:rounded-2xl flex items-center justify-center">
                         <img src={active.logo} alt={active.name} className="h-6 w-6 md:h-10 md:w-10 object-contain" referrerPolicy="no-referrer" />
                      </div>
                      <div className="space-y-0.5 md:space-y-1">
                        <h4 className="text-sm md:text-lg font-bold tracking-tighter text-white uppercase">{active.name.toLowerCase().includes("hd") ? active.name : `${active.name} HD`}</h4>
                        {active.desc && (
                          <p className="text-[9px] md:text-[11px] text-white/60 font-normal uppercase tracking-wider max-w-sm">
                            {active.desc}
                          </p>
                        )}
                        <div className="flex items-center gap-2 md:gap-3">
                          <span className="text-[8px] md:text-[10px] font-bold text-[#4AC4FE] uppercase tracking-widest bg-[#4AC4FE]/10 px-1.5 md:px-2 py-0.5 rounded-md border border-[#4AC4FE]/10">{active.category}</span>
                          <div className="flex items-center gap-1 text-[8px] md:text-[10px] text-white/50 font-bold uppercase tracking-widest">
                             <div className="w-1 h-1 md:w-1.5 md:h-1.5 rounded-full bg-green-500 animate-pulse" />
                             LIVE 4K
                          </div>
                        </div>
                      </div>
                   </div>
                </div>

                <div className="p-4 md:p-10 pointer-events-auto">
                   <div className={`p-2 md:p-4 rounded-[24px] md:rounded-[32px] border border-white/10 flex items-center justify-between gap-2 md:gap-6 backdrop-blur-3xl shadow-2xl ${liquidGlass === "tinted" ? "bg-white/80" : "bg-black/30"}`}>
                      <div className="flex items-center gap-2 md:gap-3">
                         <button onClick={togglePlay} className={`p-3 md:p-4 rounded-xl md:rounded-2xl transition-all hover:scale-105 active:scale-95 ${liquidGlass === "tinted" ? "bg-black text-white" : "bg-white text-black"}`}>
                            {isPlaying ? <Pause size={20} className="md:w-6 md:h-6" fill="currentColor" /> : <Play size={20} className="md:w-6 md:h-6" fill="currentColor" />}
                         </button>
                         <div className="hidden sm:flex items-center gap-4 pl-4 border-l border-white/10">
                            <Volume2 size={20} className={liquidGlass === "tinted" ? "text-black" : "text-white"} />
                            <input 
                              type="range" min="0" max="1" step="0.1" 
                              value={volume} onChange={handleVolumeChange}
                              className="w-24 h-1.5 bg-white/20 rounded-full appearance-none cursor-pointer accent-[#4AC4FE]"
                            />
                         </div>
                      </div>

                      <div className="flex items-center gap-2 md:gap-4">
                          {featureFlags.screen_recording && (
                             <button 
                               onClick={toggleRecording}
                               className={`p-3 md:p-4 rounded-xl md:rounded-2xl border transition-all ${
                                 isRecording
                                   ? "bg-red-600 border-red-500 text-white shadow-lg animate-pulse"
                                   : liquidGlass === "tinted" ? "bg-black/5 border-black/10 text-black" : "bg-white/5 border-white/10 text-white"
                               }`}
                               title={searchQuery.trim().length > 0 ? "Search results" : (isRecording ? "Dừng ghi" : "Ghi màn hình")}
                             >
                               {isRecording ? <Square size={18} className="md:w-5 md:h-5" fill="currentColor" /> : <Circle size={18} className="md:w-5 md:h-5" fill="currentColor" />}
                             </button>
                          )}
                          {featureFlags.multiview_channels && (
                            <div className="relative">
                              <button 
                                onClick={() => setShowLayoutMenu(!showLayoutMenu)}
                                className={`p-3 md:p-4 rounded-xl md:rounded-2xl border transition-all ${
                                  isMultiview
                                    ? "bg-[#4AC4FE] border-[#4AC4FE] text-white shadow-lg"
                                    : liquidGlass === "tinted" ? "bg-black/5 border-black/10 text-black" : "bg-white/5 border-white/10 text-white"
                                }`}
                                title="Multiview"
                              >
                                <LayoutGrid size={18} className="md:w-5 md:h-5" />
                              </button>
                              <AnimatePresence>
                                {showLayoutMenu && (
                                  <motion.div 
                                    initial={{ opacity: 0, y: 10, scale: 0.95 }}
                                    animate={{ opacity: 1, y: 0, scale: 1 }}
                                    exit={{ opacity: 0, y: 10, scale: 0.95 }}
                                    className={`absolute bottom-full mb-6 right-0 min-w-[200px] md:min-w-[240px] z-50 p-4 md:p-6 space-y-4 md:space-y-6 ${
                                      isDark ? "popup-3d-dark" : "popup-3d-light"
                                    } ${liquidGlass ? "backdrop-blur-3xl" : "backdrop-blur-none"}`}
                                  >
                                    <div className="flex items-center justify-between">
                                      <span className={`text-[10px] font-bold uppercase tracking-widest ${isDark ? "text-white/40" : "text-slate-500"}`}>Enable Multiview</span>
                                      <button 
                                        onClick={toggleMultiview}
                                        className={`w-10 h-5 md:w-12 md:h-6 rounded-full transition-all relative ${isMultiview ? "bg-[#4AC4FE]" : "bg-slate-700"}`}
                                      >
                                        <motion.div 
                                          animate={{ x: isMultiview ? 22 : 4 }}
                                          className="absolute top-1 w-3 h-3 md:w-4 md:h-4 rounded-full bg-white shadow-sm"
                                        />
                                      </button>
                                    </div>
                                    <div className="space-y-3">
                                      <span className={`text-[10px] font-bold uppercase tracking-widest ${isDark ? "text-white/40" : "text-slate-500"}`}>Grid Layout</span>
                                      <div className="grid grid-cols-4 gap-2">
                                        {[2, 3, 4, 5, 6, 7, 8, 9].map(n => (
                                          <button 
                                            key={n}
                                            onClick={() => {
                                              setMultiviewCount(n);
                                              if (!isMultiview) setIsMultiview(true);
                                            }}
                                            className={`p-2 rounded-lg text-[10px] md:text-xs font-bold transition-all ${multiviewCount === n ? "bg-[#4AC4FE] text-white shadow-[0_4px_12px_rgba(147,51,234,0.3)]" : "bg-white/5 text-white/60 hover:bg-white/10"}`}
                                          >
                                            {n}
                                          </button>
                                        ))}
                                      </div>
                                    </div>
                                  </motion.div>
                                )}
                              </AnimatePresence>
                            </div>
                          )}
                          <button 
                            onClick={() => {
                              const newVal = !lockPlayer;
                              setLockPlayer(newVal);
                              showToast(`Đã ${newVal ? "bật" : "tắt"} khóa trình phát khi cuộn trang`, newVal ? "success" : "info");
                            }}
                            className={`p-3 md:p-4 rounded-xl md:rounded-2xl border transition-all ${
                              lockPlayer 
                                ? "bg-[#4AC4FE] border-[#4AC4FE] text-white shadow-lg shadow-[#4AC4FE]/20"
                                : liquidGlass === "tinted" ? "bg-black/5 border-black/10 text-black" : "bg-white/5 border-white/10 text-white"
                            }`}
                            title={lockPlayer ? "Bỏ ghim/khóa trình phát" : "Ghim/khóa trình phát khi cuộn trang"}
                          >
                            <Pin size={18} className={`md:w-5 md:h-5 transition-transform ${lockPlayer ? "rotate-45" : ""}`} />
                          </button>
                          {featureFlags.quick_channel_switch && (
                            <button 
                              onClick={() => {
                                setIsRemoteOpen(true);
                                setRemoteInput("");
                              }}
                              className={`p-3 md:p-4 rounded-xl md:rounded-2xl border transition-all ${
                                isRemoteOpen
                                  ? "bg-[#4AC4FE] border-[#4AC4FE] text-white shadow-lg shadow-[#4AC4FE]/20"
                                  : liquidGlass === "tinted" ? "bg-black/5 border-black/10 text-black animate-pulse" : "bg-white/5 border-white/10 text-white animate-pulse"
                              }`}
                              title="Chuyển kênh nhanh (Bàn phím Remote)"
                            >
                              <Smartphone size={18} className="md:w-5 md:h-5" />
                            </button>
                          )}
                          <button 
                            onClick={() => toggleFavorite(active)}
                            className={`p-3 md:p-4 rounded-xl md:rounded-2xl border transition-all ${
                              favorites.includes(active.name)
                                ? "bg-[#4AC4FE] border-[#4AC4FE] text-white shadow-lg shadow-[#4AC4FE]/20"
                                : liquidGlass === "tinted" ? "bg-black/5 border-black/10 text-black" : "bg-white/5 border-white/10 text-white"
                            }`}
                            title="Yêu thích"
                          >
                            <LikeIcon size={20} filled={favorites.includes(active.name)} forceWhite={true} />
                          </button>
                          <button 
                            onClick={toggleMultiview}
                            className={`p-3 md:p-4 rounded-xl md:rounded-2xl border transition-all ${
                              isMultiview
                                ? "bg-[#4AC4FE] border-[#4AC4FE] text-white shadow-lg shadow-[#4AC4FE]/20"
                                : liquidGlass === "tinted" ? "bg-black/5 border-black/10 text-black" : "bg-white/5 border-white/10 text-white"
                            }`}
                            title="Xếp lưới nhiều kênh (Multiview)"
                          >
                            <LayoutGrid size={18} className="md:w-5 md:h-5" />
                          </button>
                         <button onClick={toggleFullscreen} className={`p-3 md:p-4 rounded-xl md:rounded-2xl border transition-all ${liquidGlass === "tinted" ? "bg-black/5 border-black/10 text-black" : "bg-white/5 border-white/10 text-white"}`}>
                            <Maximize size={18} className="md:w-5 md:h-5" />
                         </button>
                      </div>
                   </div>
                </div>
              </div>
            )}
          </>
        )}
        </div>

        {/* LỊCH PHÁT SÓNG SECTION */}
        <div 
          className={`hidden lg:flex lg:absolute lg:top-0 lg:bottom-0 lg:right-0 lg:w-[320px] xl:w-[365px] shrink-0 flex-col p-4 md:p-5 border shadow-2xl overflow-hidden transition-all duration-300 lg:h-auto ${
            liquidGlass ? "rounded-xl md:rounded-2xl" : "rounded-lg"
          } ${
            isDark 
              ? "bg-[#181818]/60 border-slate-800 text-white backdrop-blur-md" 
              : "bg-white/85 border-slate-200 text-slate-900 backdrop-blur-md shadow-xl"
          }`}
          style={{
            minHeight: "280px"
          }}
        >
          {mode === "realm" ? (
            <div className="flex flex-col h-full overflow-hidden flex-1">
              <div className="flex items-center gap-2 pb-3 mb-4 border-b border-white/10 flex-shrink-0">
                <div className="p-1.5 rounded-lg bg-[#4AC4FE]/10 text-[#4AC4FE]">
                  <Link size={16} />
                </div>
                <span className="text-xs md:text-sm font-black uppercase tracking-wider">NHẬP LUỒNG / URL</span>
              </div>

              <div className="space-y-4 flex-shrink-0">
                <div>
                  <label className="text-[10px] font-black uppercase tracking-widest mb-1 block opacity-60">Tên luồng phát</label>
                  <input
                    type="text"
                    value={urlStreamName}
                    onChange={(e) => setUrlStreamName(e.target.value)}
                    className={`w-full px-3 py-2.5 rounded-xl text-xs font-bold border transition-all ${
                      isDark ? "bg-white/5 border-white/10 text-white focus:border-[#4AC4FE]/50" : "bg-slate-100 border-slate-200 text-slate-850 focus:border-[#4AC4FE]/50"
                    }`}
                    placeholder="Ví dụ: Kênh test, HBO..."
                  />
                </div>

                <div>
                  <label className="text-[10px] font-black uppercase tracking-widest mb-1 block opacity-60">Link luồng phát (M3U8, MP4...)</label>
                  <input
                    type="text"
                    value={urlStreamInput}
                    onChange={(e) => setUrlStreamInput(e.target.value)}
                    className={`w-full px-3 py-2.5 rounded-xl text-xs font-mono border transition-all ${
                      isDark ? "bg-white/5 border-white/10 text-white focus:border-[#4AC4FE]/50" : "bg-slate-100 border-slate-200 text-slate-850 focus:border-[#4AC4FE]/50"
                    }`}
                    placeholder="https://example.com/playlist.m3u8"
                  />
                </div>

                <button
                  onClick={() => {
                    if (!urlStreamInput.trim()) {
                      showToast("Vui lòng nhập Link luồng phát!", "error");
                      return;
                    }
                    const customChan: Channel = {
                      name: urlStreamName || "VLC Live Stream",
                      category: "Luồng trực tiếp",
                      logo: "https://static.wikia.nocookie.net/ftv/images/a/a9/Ic_vlc_icon.png/revision/latest?cb=20260424160410",
                      stream: urlStreamInput.trim(),
                      desc: `Luồng phát trực tiếp từ URL`
                    };
                    playChannelAndEnterFullscreen(customChan);
                    
                    const dateString = new Date().toLocaleString("vi-VN");
                    setUrlHistory(prev => {
                      const filtered = prev.filter(p => p.url !== urlStreamInput.trim());
                      const next = [{ name: urlStreamName || "VLC Live Stream", url: urlStreamInput.trim(), date: dateString }, ...filtered].slice(0, 5);
                      localStorage.setItem("vplay_url_stream_history", JSON.stringify(next));
                      return next;
                    });
                    
                    showToast(`Đang kết nối luồng "${urlStreamName || "VLC Stream"}"`, "success");
                  }}
                  className="w-full py-2.5 rounded-xl font-bold text-xs bg-[#4AC4FE] hover:bg-[#3bb0f0] text-white flex items-center justify-center gap-1.5 shadow-lg shadow-[#4AC4FE]/20 active:scale-95 transition-all cursor-pointer"
                >
                  <Play size={12} fill="currentColor" />
                  Phát luồng trực tiếp
                </button>
              </div>

              <div className="flex-1 mt-4 border-t border-slate-500/10 pt-4 overflow-y-auto no-scrollbar min-h-0 flex flex-col">
                <div className="flex items-center justify-between mb-2 flex-shrink-0">
                  <span className="text-[10px] font-black uppercase tracking-widest opacity-60">Lịch sử xem ({urlHistory.length})</span>
                  {urlHistory.length > 0 && (
                    <button
                      onClick={() => {
                        setUrlHistory([]);
                        localStorage.removeItem("vplay_url_stream_history");
                        showToast("Đã xóa sạch lịch sử xem URL", "info");
                      }}
                      className="text-[9px] font-bold text-red-500 hover:underline uppercase cursor-pointer"
                    >
                      Xóa
                    </button>
                  )}
                </div>

                {urlHistory.length === 0 ? (
                  <div className="flex-1 flex flex-col items-center justify-center p-4 text-center opacity-40">
                    <Link size={20} className="strokeWidth-1 pb-1" />
                    <p className="text-[10px] font-bold">Chưa có lịch sử phát URL</p>
                  </div>
                ) : (
                  <div className="space-y-1.5 overflow-y-auto pr-1 flex-1 min-h-0 custom-scrollbar">
                    {urlHistory.map((h, i) => (
                      <div
                        key={`hist-${i}`}
                        onClick={() => {
                          setUrlStreamName(h.name || "VLC Live Stream");
                          setUrlStreamInput(h.url);
                          const customChan: Channel = {
                            name: h.name || "VLC Live Stream",
                            category: "Luồng trực tiếp",
                            logo: "https://static.wikia.nocookie.net/ftv/images/a/a9/Ic_vlc_icon.png/revision/latest?cb=20260424160410",
                            stream: h.url,
                            desc: `Luồng phát trực tiếp từ URL`
                          };
                          playChannelAndEnterFullscreen(customChan);
                          showToast(`Đang kết nối luồng "${h.name || "VLC Stream"}"`, "success");
                        }}
                        className={`p-2 rounded-xl border text-left cursor-pointer transition-all flex flex-col gap-0.5 ${
                          isDark 
                            ? "bg-white/5 border-white/5 hover:bg-white/10 hover:border-white/15 text-white" 
                            : "bg-slate-50 border-slate-100 hover:bg-slate-100 hover:border-slate-200 text-slate-800"
                        }`}
                      >
                        <span className="text-xs font-bold truncate block">{h.name || "Không tên"}</span>
                        <span className="text-[10px] font-mono opacity-50 truncate block">{h.url}</span>
                        <span className="text-[8px] opacity-30 mt-0.5 self-end">{h.date}</span>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            </div>
          ) : (
            <>
              {/* Header */}
              <div className="flex items-center justify-between pb-3 mb-2 border-b border-white/10 flex-shrink-0">
                <div className="flex items-center gap-2">
                  <div className="p-1.5 rounded-lg bg-[#4AC4FE]/10 text-[#4AC4FE]">
                    <Calendar size={16} />
                  </div>
                  <span className="text-xs md:text-sm font-black uppercase tracking-wider">Lịch Phát Sóng</span>
                </div>
                <div className="flex items-center gap-1.5">
                  <span className="w-1.5 h-1.5 rounded-full bg-green-500 animate-pulse" />
                  <span className="text-[9px] font-mono font-bold uppercase tracking-widest opacity-60">
                    {selectedDayOffset === 0 ? "Hôm nay" : selectedDayOffset < 0 ? `${-selectedDayOffset} ngày trước` : `${selectedDayOffset} ngày sau`}
                  </span>
                </div>
              </div>

              {/* Day Selector */}
              <div className="flex gap-1 overflow-x-auto no-scrollbar py-1 shrink-0 mb-3 border-b border-slate-500/10">
                {dayOptions.map((opt) => {
                  const isSelected = selectedDayOffset === opt.offset;
                  return (
                    <button
                      key={`day-opt-desktop-${opt.offset}`}
                      onClick={() => setSelectedDayOffset(opt.offset)}
                      className={`flex flex-col items-center justify-center px-2 py-1 min-w-[42px] rounded-lg transition-all text-center select-none shrink-0 ${
                        isSelected
                          ? "bg-[#4AC4FE] text-slate-950 font-bold"
                          : isDark
                            ? "bg-white/5 text-white/50 hover:bg-white/10 hover:text-white"
                            : "bg-slate-100 text-slate-600 hover:bg-slate-200"
                      }`}
                    >
                      <span className="text-[9px] font-bold tracking-tight whitespace-nowrap">{opt.label}</span>
                      <span className={`text-[7px] font-medium opacity-75 ${isSelected ? "text-slate-900/80" : "text-slate-400"}`}>{opt.desc}</span>
                    </button>
                  );
                })}
              </div>

              {/* Schedule List */}
              <div className="flex-1 overflow-y-auto pr-1 space-y-2 scrollbar-thin scrollbar-thumb-white/15 scrollbar-track-transparent flex flex-col">
                {selectedDayOffset < 0 ? (
                  <div className="flex-1 flex flex-col items-center justify-center text-center p-6 space-y-3 opacity-60">
                    <div className="p-3 bg-red-500/10 rounded-full text-red-500">
                      <Calendar size={24} />
                    </div>
                    <div>
                      <p className="text-xs font-bold uppercase tracking-wider text-red-500">Đã hết hạn xem</p>
                      <p className="text-xs text-slate-400 mt-1 max-w-[200px] mx-auto">Lịch phát sóng đã hết thời hạn xem lại</p>
                    </div>
                  </div>
                ) : selectedDayOffset > 0 ? (
                  <div className="flex-1 flex flex-col items-center justify-center text-center p-6 space-y-3 opacity-60">
                    <div className="p-3 bg-amber-500/10 rounded-full text-amber-500">
                      <Calendar size={24} />
                    </div>
                    <div>
                      <p className="text-xs font-bold uppercase tracking-wider text-amber-500">Chưa cập nhật</p>
                      <p className="text-xs text-slate-400 mt-1 max-w-[200px] mx-auto">Lịch phát sóng chưa được cập nhật</p>
                    </div>
                  </div>
                ) : (
                  scheduleItems.map((item) => {
                    const isActive = item.hour === currentHour;
                    return (
                      <div
                        key={`schedule-${item.hour}`}
                        ref={isActive ? activeItemRef : null}
                        id={`schedule-item-${item.hour}`}
                        className={`flex items-start gap-4 p-2.5 rounded-xl transition-all duration-300 relative ${
                          isActive 
                            ? (isDark 
                                ? "bg-gradient-to-r from-[#4AC4FE]/20 to-transparent border border-[#4AC4FE]/30 text-white shadow-md shadow-[#4AC4FE]/5"
                                : "bg-gradient-to-r from-[#4AC4FE]/10 to-transparent border border-[#4AC4FE]/20 text-[#0c4a6e] shadow-sm")
                            : (isDark 
                                ? "hover:bg-white/5 border border-transparent text-white/70 hover:text-white"
                                : "hover:bg-slate-100 border border-transparent text-slate-600 hover:text-slate-900")
                        }`}
                      >
                        {/* Time Badge */}
                        <div className={`font-mono text-xs font-bold px-2 py-0.5 rounded-lg shrink-0 ${
                          isActive 
                            ? "bg-[#4AC4FE] text-black shadow-sm"
                            : (isDark ? "bg-white/5 text-white/50" : "bg-slate-200/60 text-slate-500")
                        }`}>
                          {item.time}
                        </div>

                        {/* Program Title */}
                        <div className="flex-1 space-y-0.5">
                          <p className={`text-[11px] sm:text-xs leading-tight font-black uppercase tracking-tight ${
                            isActive ? "text-[#4AC4FE]" : ""
                          }`}>
                            {item.title}
                          </p>
                          {isActive && (
                            <div className="flex items-center gap-1">
                              <span className="text-[8px] font-bold text-red-500 uppercase tracking-widest animate-pulse">• ĐANG PHÁT TRỰC TIẾP</span>
                            </div>
                          )}
                        </div>
                      </div>
                    );
                  })
                )}
              </div>
            </>
          )}
        </div>

      </div>

      {/* Scrollable grid, categories, playlists etc are padded on mobile to maintain beautiful spacing */}
      <div className="px-4 md:px-0 mt-4">
        {/* CHANNEL INFO */}
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-6 px-2 mt-4 md:mt-0 md:max-w-4xl lg:max-w-6xl xl:max-w-[1280px] mx-auto w-full">
        <div className="flex flex-col gap-1 md:gap-2">
          <div className="flex flex-wrap items-center gap-3 md:gap-4">
            <motion.h2 
              initial={{ opacity: 0, x: -50 }}
              animate={{ opacity: 1, x: 0 }}
              className={`text-lg md:text-2xl font-bold tracking-tighter uppercase ${isDark ? "text-white" : "text-slate-950"}`}
            >
              {active.name.toLowerCase().includes("hd") ? active.name : `${active.name} HD`}
            </motion.h2>
            <div className="flex items-center gap-2">
              {isMaintenance ? (
                <div className="bg-amber-500/10 border border-amber-500/20 text-amber-500 text-[8px] md:text-[10px] px-2 md:px-3 py-1 rounded-full font-bold tracking-widest flex items-center gap-1.5 md:gap-2">
                  <div className="h-1 w-1 md:h-1.5 md:w-1.5 rounded-full bg-amber-500"></div>
                  ĐANG BẢO TRÌ
                </div>
              ) : (
                <div className="bg-red-600 text-white text-[8px] md:text-[10px] px-2.5 md:px-3.5 py-1 rounded-full font-bold tracking-widest flex items-center gap-1.5 md:gap-2 shadow-sm shadow-red-600/35">
                  <div className="h-1 w-1 md:h-1.5 md:w-1.5 rounded-full bg-white animate-pulse"></div>
                  TRỰC TIẾP
                </div>
              )}
            </div>
          </div>
          {active.desc && (
            <p className={`text-xs md:text-[13px] font-normal tracking-wide uppercase ${isDark ? "text-slate-400" : "text-slate-500"}`}>
              {active.desc}
            </p>
          )}
        </div>
        
        <div className="flex items-center gap-2 md:gap-3">
           {/* Mobile-only Play/Pause button */}
           <button 
             onClick={togglePlay}
             className={`md:hidden p-3 rounded-xl border transition-all ${
               isDark 
                 ? "bg-white/5 border-white/10 text-white hover:bg-white/10" 
                 : "bg-white border-slate-200 text-slate-600 hover:bg-slate-50 shadow-sm"
             }`}
             title={isPlaying ? "Tạm dừng" : "Phát"}
           >
             {isPlaying ? <Pause size={16} fill="currentColor" /> : <Play size={16} fill="currentColor" />}
           </button>

           {/* Mobile-only Fullscreen button */}
           <button 
             onClick={toggleFullscreen}
             className={`md:hidden p-3 rounded-xl border transition-all ${
               isDark 
                 ? "bg-white/5 border-white/10 text-white hover:bg-white/10" 
                 : "bg-white border-slate-200 text-slate-600 hover:bg-slate-50 shadow-sm"
             }`}
             title="Phóng to"
           >
             <Maximize size={16} />
           </button>

           {/* Mobile-only Lock Player button */}
           <button 
             onClick={() => {
               const newVal = !lockPlayer;
               setLockPlayer(newVal);
               showToast(`Đã ${newVal ? "bật" : "tắt"} khóa trình phát khi cuộn trang`, newVal ? "success" : "info");
             }}
             className={`md:hidden p-3 rounded-xl border transition-all ${
               lockPlayer 
                 ? "bg-[#4AC4FE] border-[#4AC4FE] text-white shadow-lg"
                 : isDark 
                   ? "bg-white/5 border-white/10 text-white hover:bg-white/10" 
                   : "bg-white border-slate-200 text-slate-600 hover:bg-slate-50 shadow-sm"
             }`}
             title={lockPlayer ? "Khóa trình phát" : "Mở khóa trình phát"}
           >
             <Pin size={16} className={`transition-transform ${lockPlayer ? "rotate-45" : ""}`} />
           </button>

           {featureFlags.screen_recording && (
             <button 
               onClick={toggleRecording}
               className={`p-3 md:p-4 rounded-xl md:rounded-2xl border transition-all ${
                 isRecording
                   ? "bg-red-600 border-red-500 text-white shadow-lg animate-pulse"
                   : isDark ? "bg-white/5 border-white/10 text-white hover:bg-white/10" : "bg-white border-slate-200 text-slate-600 hover:bg-slate-50 shadow-sm"
               }`}
               title={isRecording ? "Dừng ghi" : "Ghi màn hình"}
             >
               {isRecording ? <Square size={16} fill="currentColor" /> : <Circle size={16} fill="currentColor" />}
             </button>
           )}
           {featureFlags.multiview_channels && (
             <button 
               onClick={toggleMultiview}
               className={`p-3 md:p-4 rounded-xl md:rounded-2xl border transition-all ${
                 isMultiview
                   ? "bg-[#4AC4FE] border-[#4AC4FE] text-white shadow-lg shadow-none"
                   : isDark ? "bg-white/5 border-white/10 text-white hover:bg-white/10" : "bg-white border-slate-200 text-slate-600 hover:bg-slate-50 shadow-sm"
               }`}
             >
               <LayoutGrid size={16} />
             </button>
           )}
           {/* Mobile-only Lịch Phát Sóng Button */}
           <button 
             onClick={() => setIsMobileScheduleOpen(true)}
             className={`md:hidden p-3 rounded-xl border transition-all ${
               isDark 
                 ? "bg-white/5 border-white/10 text-white hover:bg-white/10" 
                 : "bg-white border-slate-200 text-slate-600 hover:bg-slate-50 shadow-sm"
              }`}
              title="Lịch phát sóng"
            >
              <Clock size={16} />
            </button>
          </div>
        </div>
      {mode === "realm" && (
        <div className="mt-8 flex justify-center w-full px-2 max-w-4xl mx-auto border-b border-white/10">
          <div className="flex gap-8 justify-center">
            {[
              { id: "custom", label: "Package của bạn", icon: FolderOpen },
              { id: "url", label: "Link luồng / URL", icon: Link }
            ].map((tab) => {
              const Icon = tab.icon;
              const isActive = liveSubTab === tab.id;
              return (
                <button
                  key={tab.id}
                  onClick={() => {
                    setLiveSubTab(tab.id as any);
                    setCustomPage(0);
                  }}
                  className={`relative flex items-center gap-2 px-5 py-3 text-xs font-bold transition-all focus:outline-none ${
                    isActive
                      ? "text-[#4AC4FE]"
                      : "text-slate-400 hover:text-slate-200"
                  }`}
                >
                  <Icon size={14} className="z-10" />
                  <span className="z-10">{tab.label}</span>
                  {isActive && (
                    <motion.div
                      layoutId="liveSubTabIndicator"
                      className="absolute bottom-0 left-0 right-0 h-[2px] bg-[#4AC4FE] z-20 rounded-full"
                    />
                  )}
                </button>
              );
            })}
          </div>
        </div>
      )}

      {liveSubTab === "custom" && mode === "realm" && (
        <div className="mt-6 flex flex-col gap-4 w-full px-2 md:max-w-4xl lg:max-w-6xl xl:max-w-[1280px] mx-auto">
          <div className="flex flex-wrap items-center gap-3 justify-center">
            {customPlaylists.map((pl, idx) => {
              const isActive = activePlaylistIdx === idx;
              return (
                <div 
                  key={pl.id} 
                  className={`flex items-center gap-2 p-1.5 px-3 rounded-xl border transition-all ${
                    isActive 
                      ? "bg-[#4AC4FE]/10 border-[#4AC4FE]/25" 
                      : isDark ? "bg-white/5 border-transparent hover:bg-white/10" : "bg-slate-100 hover:bg-slate-200 border-slate-200 text-slate-800"
                  }`}
                >
                  <button
                    onClick={() => {
                      setActivePlaylistIdx(idx);
                      setCustomPage(0);
                    }}
                    className="flex items-center gap-2 text-xs font-bold transition-all"
                  >
                    <FileText size={12} className={isActive ? "text-[#4AC4FE]" : "opacity-60"} />
                    <span className={isActive ? "text-[#4AC4FE]" : isDark ? "text-slate-300" : "text-slate-700"}>
                      {pl.name || `Realm ${idx + 1}`}
                    </span>
                    <span className="opacity-50 text-[10px] bg-slate-500/15 px-1.5 py-0.5 rounded-full font-mono">
                      {pl.channels.length}
                    </span>
                  </button>
                  
                  <div className="flex items-center gap-0.5 shrink-0 ml-1.5 border-l border-white/10 pl-1.5">
                    <button
                      onClick={() => {
                        setEditingPlaylistIdx(idx);
                        setTempPlaylistName(pl.name);
                        setTempPlaylistContent(pl.content);
                      }}
                      title="Chỉnh sửa hoặc dán code M3U"
                      className={`p-1 rounded-lg hover:bg-white/10 transition-all ${isActive ? "text-[#4AC4FE]" : "text-slate-400 hover:text-white"}`}
                    >
                      <Edit size={12} />
                    </button>
                    <button
                      onClick={() => {
                        if (window.confirm(`Bạn có chắc chắn muốn xóa Realm "${pl.name || `Realm ${idx + 1}`}" không?`)) {
                          deletePlaylist(idx);
                        }
                      }}
                      title="Xóa Realm"
                      className="p-1 rounded-lg text-red-500 hover:bg-red-500/10 transition-all"
                    >
                      <Trash2 size={12} />
                    </button>
                  </div>
                </div>
              );
            })}

            {/* Toggle Giao diện lớn */}
            <button
              onClick={() => handleToggleLargeLayout(!isLargeLayout)}
              className={`flex items-center gap-2 p-1.5 px-3 rounded-xl border transition-all ${
                isLargeLayout 
                  ? "bg-[#4AC4FE] border-[#4AC4FE] text-white shadow-md font-black" 
                  : isDark ? "bg-white/5 border-transparent hover:bg-white/10 text-slate-300" : "bg-slate-100 hover:bg-slate-200 border-slate-200 text-slate-800"
              }`}
              title="Bật/Tắt Giao diện lớn (Hiển thị 2 ô kênh/dòng)"
            >
              <LayoutGrid size={12} className={isLargeLayout ? "text-white" : "text-[#4AC4FE]"} />
              <span className="text-xs font-bold">Giao diện lớn: {isLargeLayout ? "BẬT" : "TẮT"}</span>
            </button>
          </div>
        </div>
      )}

      {editingPlaylistIdx !== null && (
        <div className="fixed inset-0 z-[500] flex items-center justify-center p-4">
          <div className="absolute inset-0 bg-black/60 backdrop-blur-md z-10" onClick={() => setEditingPlaylistIdx(null)} />
          <motion.div
            initial={{ scale: 0.95, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            exit={{ scale: 0.95, opacity: 0 }}
            className={`relative w-full max-w-2xl rounded-3xl border shadow-2xl p-6 z-20 overflow-hidden flex flex-col max-h-[85vh] ${
              isDark ? "bg-[#181924] border-white/10 text-white" : "bg-white border-slate-200 text-slate-800"
            }`}
          >
            <div className="flex items-center justify-between mb-4 border-b border-white/5 pb-3">
              <h3 className="text-lg font-black tracking-tighter uppercase flex items-center gap-2 text-[#4AC4FE]">
                <Edit size={18} />
                Cài đặt Package & dán Code M3U/M3U8
              </h3>
              <button onClick={() => setEditingPlaylistIdx(null)} className="p-1.5 rounded-xl hover:bg-white/5 text-slate-400 hover:text-white">
                <X size={18} />
              </button>
            </div>

            <div className="space-y-4 overflow-y-auto pr-1 flex-1">
              <div>
                <label className="text-xs font-black uppercase tracking-wider opacity-60 mb-1.5 block">Tên Package của bạn</label>
                <input
                  type="text"
                  value={tempPlaylistName}
                  onChange={(e) => setTempPlaylistName(e.target.value)}
                  className={`w-full px-3 py-2.5 rounded-xl text-xs font-bold border ${isDark ? "bg-white/5 border-white/10 text-white" : "bg-slate-100 border-slate-200 text-slate-850"}`}
                  placeholder="Package của bạn"
                />
              </div>

              <div>
                <label className="text-xs font-black uppercase tracking-wider opacity-60 mb-1.5 block flex items-center justify-between">
                  <span>Mã danh sách (M3U / M3U8 text)</span>
                  <span className="text-[10px] text-[#4AC4FE] font-bold">Dán code m3u8</span>
                </label>
                <textarea
                  value={tempPlaylistContent}
                  onChange={(e) => setTempPlaylistContent(e.target.value)}
                  className={`w-full h-48 px-3 py-2.5 rounded-xl text-xs font-mono border whitespace-pre resize-none overflow-y-auto ${isDark ? "bg-white/5 border-white/10 text-white" : "bg-slate-100 border-slate-200 text-slate-850"}`}
                  placeholder={`#EXTM3U\n#EXTINF:-1 tvg-logo="http://logo.url" group-title="Thể thao",Kênh Thể Thao HD\nhttp://stream-link.m3u8`}
                />
              </div>

              {/* Upload file zone */}
              <div>
                <label className="text-xs font-black uppercase tracking-wider opacity-60 mb-1.5 block">Hoặc tải tập tin M3U/M3U8 từ thiết bị</label>
                <div
                  onClick={() => {
                    const el = document.getElementById("m3u-file-picker");
                    if (el) el.click();
                  }}
                  className={`border-2 border-dashed rounded-2xl p-6 text-center cursor-pointer transition-all hover:bg-white/5 flex flex-col items-center justify-center gap-2 ${
                    isDark ? "border-white/10 bg-white/5 text-slate-300" : "border-slate-300 bg-slate-50 text-slate-700"
                  }`}
                >
                  <Upload size={24} className="text-[#4AC4FE]" />
                  <p className="text-xs font-bold">Nhấn để <span className="text-[#4AC4FE]">chọn file .m3u / .m3u8</span> hoặc kéo thả vào đây</p>
                  <input
                    id="m3u-file-picker"
                    type="file"
                    accept=".m3u,.m3u8,text/plain"
                    className="hidden"
                    onChange={(e) => {
                      const file = e.target.files?.[0];
                      if (file) {
                        const filename = file.name.toLowerCase();
                        const hasM3uExtension = filename.endsWith(".m3u") || filename.endsWith(".m3u8");
                        
                        const r = new FileReader();
                        r.onload = (loaded) => {
                          const res = loaded.target?.result;
                          if (res && typeof res === "string") {
                            const trimmedRes = res.trim();
                            const hasM3uContent = trimmedRes.startsWith("#EXTM3U") || trimmedRes.includes("#EXTINF");
                            
                            if (!hasM3uExtension && !hasM3uContent) {
                              showToast("Tệp nhập vào không phải là định dạng đúng", "error");
                              return;
                            }
                            
                            try {
                              const parsed = parseM3U(res);
                              if (parsed && parsed.length > 0) {
                                setTempPlaylistContent(res);
                                showToast("Nhập tệp thành công", "success");
                              } else {
                                showToast("Nhập tệp thất bại", "error");
                              }
                            } catch (err) {
                              console.error(err);
                              showToast("Nhập tệp thất bại", "error");
                            }
                          } else {
                            showToast("Nhập tệp thất bại", "error");
                          }
                        };
                        r.onerror = () => {
                          showToast("Nhập tệp thất bại", "error");
                        };
                        r.readAsText(file);
                      }
                    }}
                  />
                </div>
              </div>
            </div>

            <div className="grid grid-cols-2 gap-3 mt-5 pt-3 border-t border-white/5">
              <button
                onClick={() => setEditingPlaylistIdx(null)}
                className={`py-3 rounded-xl font-bold text-xs ${isDark ? "bg-white/5 hover:bg-white/10" : "bg-slate-100 hover:bg-slate-250 text-slate-700"}`}
              >
                Hủy bỏ
              </button>
              <button
                onClick={() => {
                  const plIdx = editingPlaylistIdx;
                  if (plIdx === null) return;
                  setCustomPlaylists(prev => {
                    const next = [...prev];
                    const parsed = parseM3U(tempPlaylistContent);
                    next[plIdx] = {
                      ...next[plIdx],
                      name: tempPlaylistName || `Realm ${plIdx + 1}`,
                      content: tempPlaylistContent,
                      channels: parsed
                    };
                    localStorage.setItem("vplay_custom_playlists_v2", JSON.stringify(next));
                    showToast(`Đã lưu "${tempPlaylistName || `Realm ${plIdx + 1}`}" thành công!`, "success");
                    return next;
                  });
                  setEditingPlaylistIdx(null);
                  setCustomPage(0);
                }}
                className="py-3 rounded-xl font-bold text-xs bg-[#4AC4FE] text-white hover:bg-[#3bb0f0] transition-all"
              >
                Lưu cấu hình
              </button>
            </div>
          </motion.div>
        </div>
      )}

      {liveSubTab === "url" && (
        <div className="mt-8 px-2 md:max-w-4xl mx-auto w-full">
          <div className={`p-6 rounded-3xl border shadow-xl space-y-4 ${
            isDark ? "bg-[#181924]/80 border-white/5" : "bg-white/80 border-slate-200"
          }`}>
            <h3 className="text-md font-black tracking-widest uppercase text-[#4AC4FE] flex items-center gap-2">
              <Link size={16} />
              Dán URL luồng live stream trực tiếp
            </h3>
            <p className="text-xs opacity-60">Dán trực tiếp link luồng phát live M3U8, MP4, MP3... của riêng bạn để xem tức thì (giống như trên VLC Player).</p>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="text-[10px] font-black uppercase tracking-widest mb-1.5 block opacity-50">Tên luồng phát</label>
                <input
                  type="text"
                  value={urlStreamName}
                  onChange={(e) => setUrlStreamName(e.target.value)}
                  className={`w-full px-4 py-3 rounded-2xl text-xs font-bold border ${isDark ? "bg-white/5 border-white/10 text-white" : "bg-slate-100 border-slate-230 text-slate-850"}`}
                  placeholder="Ví dụ: Kênh phim HBO, luồng test..."
                />
              </div>

              <div>
                <label className="text-[10px] font-black uppercase tracking-widest mb-1.5 block opacity-50">Link luồng phát (URL)</label>
                <input
                  type="text"
                  value={urlStreamInput}
                  onChange={(e) => setUrlStreamInput(e.target.value)}
                  className={`w-full px-4 py-3 rounded-2xl text-xs font-mono border ${isDark ? "bg-white/5 border-white/10 text-white" : "bg-slate-100 border-slate-230 text-slate-850"}`}
                  placeholder="https://example.com/live/playlist.m3u8"
                />
              </div>
            </div>

            <button
              onClick={() => {
                if (!urlStreamInput.trim()) {
                  showToast("Vui lòng nhập Link luồng phát!", "error");
                  return;
                }
                const customChan: Channel = {
                  name: urlStreamName || "VLC Live Stream",
                  category: "Luồng trực tiếp",
                  logo: "https://static.wikia.nocookie.net/ftv/images/a/a9/Ic_vlc_icon.png/revision/latest?cb=20260424160410",
                  stream: urlStreamInput.trim(),
                  desc: `Luồng phát trực tiếp từ URL`
                };
                playChannelAndEnterFullscreen(customChan);
                
                // Save to history
                const dateString = new Date().toLocaleString("vi-VN");
                setUrlHistory(prev => {
                  const filtered = prev.filter(p => p.url !== urlStreamInput.trim());
                  const next = [{ name: urlStreamName, url: urlStreamInput.trim(), date: dateString }, ...filtered].slice(0, 5);
                  localStorage.setItem("vplay_url_stream_history", JSON.stringify(next));
                  return next;
                });
                
                showToast(`Đang kết nối luồng "${urlStreamName || "VLC Stream"}"`, "success");
              }}
              className="w-full py-3.5 rounded-2xl font-bold text-xs bg-[#4AC4FE] hover:bg-[#3bb0f0] text-white flex items-center justify-center gap-2 shadow-lg shadow-[#4AC4FE]/25 active:scale-95 transition-all"
            >
              <Play size={14} fill="currentColor" />
              Bắt đầu xem luồng trực tiếp
            </button>

            {urlHistory.length > 0 && (
              <div className="pt-4 border-t border-white/5">
                <div className="flex items-center justify-between mb-2">
                  <span className="text-[10px] font-black uppercase tracking-widest opacity-55">Lịch sử xem gần đây ({urlHistory.length})</span>
                  <button
                    onClick={() => {
                      setUrlHistory([]);
                      localStorage.removeItem("vplay_url_stream_history");
                      showToast("Đã xóa sạch lịch sử xem URL", "info");
                    }}
                    className="text-[9px] font-bold text-red-500 hover:underline uppercase"
                  >
                    Xóa lịch sử
                  </button>
                </div>
                <div className="space-y-2">
                  {urlHistory.map((h, hIdx) => (
                    <div
                      key={`url-hist-${hIdx}`}
                      className={`flex items-center justify-between p-2.5 rounded-xl text-xs font-bold border cursor-pointer transition-all text-left ${
                        isDark ? "bg-white/5 border-white/5 hover:bg-white/10" : "bg-slate-100 hover:bg-slate-200 border-transparent text-slate-800"
                      }`}
                      onClick={() => {
                        setUrlStreamName(h.name);
                        setUrlStreamInput(h.url);
                        const customChan: Channel = {
                          name: h.name,
                          category: "Luồng trực tiếp",
                          logo: "https://static.wikia.nocookie.net/ftv/images/a/a9/Ic_vlc_icon.png/revision/latest?cb=20260424160410",
                          stream: h.url,
                          desc: h.url
                        };
                        playChannelAndEnterFullscreen(customChan);
                        showToast(`Luồng: ${h.name}`, "info");
                      }}
                    >
                      <div className="flex items-center gap-3 min-w-0 flex-1">
                        <Clock size={12} className="opacity-50 shrink-0" />
                        <div className="truncate">
                          <p className={`font-semibold ${isDark ? "text-slate-250" : "text-slate-800"}`}>{h.name}</p>
                          <p className="text-[10px] opacity-40 font-mono truncate">{h.url}</p>
                        </div>
                      </div>
                      <span className="text-[8px] opacity-30 shrink-0 ml-3">{h.date}</span>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>
        </div>
      )}

      {/* 4 SMALL TABS IN THE LIVE TAB: CHUYỂN KÊNH, LỊCH PHÁT SÓNG, YÊU THÍCH & NHẬP SỐ */}
      {mode === "live" && (
        <div className="flex justify-center mt-6 mb-2">
          <div 
            className="p-1.5 rounded-full border flex gap-1.5 items-center flex-wrap justify-center shadow-[0_12px_32px_rgba(0,0,0,0.15),_inset_0_1px_1.5px_rgba(255,255,255,0.15)] border-white/12"
            style={{
              backdropFilter: "blur(20px)",
              WebkitBackdropFilter: "blur(20px)",
              backgroundColor: "rgba(255, 255, 255, 0.16)",
            }}
          >
            <button
              onClick={() => {
                setLiveTabSection("channels");
                setIsRemoteOpen(false);
              }}
              className={`p-3.5 rounded-full transition-all flex items-center justify-center text-xs font-extrabold active:scale-110 hover:scale-105 cursor-pointer ${
                liveTabSection === "channels" && !isRemoteOpen
                  ? "bg-[#4AC4FE] text-slate-950 shadow-lg animate-none"
                  : "text-slate-900 hover:text-black hover:bg-white/10"
              }`}
              title="KÊNH"
            >
              <Tv className="w-4 h-4" />
            </button>
            <button
              onClick={() => {
                setLiveTabSection("schedule");
                setIsRemoteOpen(false);
              }}
              className={`p-3.5 rounded-full transition-all flex items-center justify-center text-xs font-extrabold active:scale-110 hover:scale-105 cursor-pointer ${
                liveTabSection === "schedule" && !isRemoteOpen
                  ? "bg-[#4AC4FE] text-slate-950 shadow-lg animate-none"
                  : "text-slate-900 hover:text-black hover:bg-white/10"
              }`}
              title="Lịch phát sóng"
            >
              <Calendar className="w-4 h-4" />
            </button>
            <button
              onClick={() => {
                setLiveTabSection("favorites");
                setIsRemoteOpen(false);
              }}
              className={`p-3.5 rounded-full transition-all flex items-center justify-center text-xs font-extrabold active:scale-110 hover:scale-105 cursor-pointer ${
                liveTabSection === "favorites" && !isRemoteOpen
                  ? "bg-[#4AC4FE] text-slate-950 shadow-lg animate-none"
                  : "text-slate-900 hover:text-black hover:bg-white/10"
              }`}
              title="Yêu thích"
            >
              <Heart className="w-4 h-4" />
            </button>
            <button
              onClick={() => {
                setIsRemoteOpen(true);
                setRemoteInput("");
              }}
              className={`p-3.5 rounded-full transition-all flex items-center justify-center text-xs font-extrabold active:scale-110 hover:scale-105 cursor-pointer ${
                isRemoteOpen
                  ? "bg-[#4AC4FE] text-slate-950 shadow-lg animate-none"
                  : "text-slate-900 hover:text-black hover:bg-white/10"
              }`}
              title="Nhập số"
            >
               <Smartphone className="w-4 h-4" />
            </button>
          </div>
        </div>
      )}

      {mode === "live" && liveTabSection === "schedule" && (
        <div className={`mt-6 w-full p-4 md:p-6 border shadow-xl rounded-2xl ${
          isDark 
            ? "bg-[#181818]/60 border-slate-800 text-white backdrop-blur-md" 
            : "bg-white border-slate-200 text-slate-900 shadow-xl"
        }`}>
          {/* Header */}
          <div className="flex items-center justify-between pb-3 mb-4 border-b border-white/10">
            <div className="flex items-center gap-2">
              <div className="p-1.5 rounded-lg bg-[#4AC4FE]/10 text-[#4AC4FE]">
                <Calendar size={16} />
              </div>
              <span className="text-xs md:text-sm font-black uppercase tracking-wider">Lịch Phát Sóng Kênh {active.name.toLowerCase().includes("hd") ? active.name : `${active.name} HD`}</span>
            </div>
            <div className="flex items-center gap-1.5">
              <span className="w-1.5 h-1.5 rounded-full bg-green-500 animate-pulse" />
              <span className="text-[9px] font-mono font-bold uppercase tracking-widest opacity-60">
                {selectedDayOffset === 0 ? "Hôm nay" : selectedDayOffset < 0 ? `${-selectedDayOffset} ngày trước` : `${selectedDayOffset} ngày sau`}
              </span>
            </div>
          </div>

          {/* Day Selector */}
          <div className="flex gap-1 overflow-x-auto no-scrollbar py-1 shrink-0 mb-4 border-b border-slate-500/10">
            {dayOptions.map((opt) => {
              const isSelected = selectedDayOffset === opt.offset;
              return (
                <button
                  key={`day-opt-tab-${opt.offset}`}
                  onClick={() => setSelectedDayOffset(opt.offset)}
                  className={`flex flex-col items-center justify-center px-3 py-1.5 min-w-[50px] rounded-xl transition-all text-center select-none shrink-0 ${
                    isSelected
                      ? "bg-[#4AC4FE] text-slate-950 font-bold"
                      : isDark
                        ? "bg-white/5 text-white/50 hover:bg-white/10 hover:text-white"
                        : "bg-slate-100 text-slate-600 hover:bg-slate-200"
                  }`}
                >
                  <span className="text-[10px] font-bold tracking-tight whitespace-nowrap">{opt.label}</span>
                  <span className={`text-[8px] font-medium opacity-75 ${isSelected ? "text-slate-900/80" : "text-slate-400"}`}>{opt.desc}</span>
                </button>
              );
            })}
          </div>

          {/* Schedule List Grid */}
          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-3">
            {selectedDayOffset < 0 ? (
              <div className="col-span-full py-12 text-center space-y-3 opacity-60">
                <div className="inline-flex p-3 bg-red-500/10 rounded-full text-red-500">
                  <Calendar size={24} />
                </div>
                <div>
                  <p className="text-xs font-bold uppercase tracking-wider text-red-500">Đã hết hạn xem</p>
                  <p className="text-xs text-slate-400 mt-1">Lịch phát sóng đã hết thời hạn xem lại</p>
                </div>
              </div>
            ) : selectedDayOffset > 0 ? (
              <div className="col-span-full py-12 text-center space-y-3 opacity-60">
                <div className="inline-flex p-3 bg-amber-500/10 rounded-full text-amber-500">
                  <Calendar size={24} />
                </div>
                <div>
                  <p className="text-xs font-bold uppercase tracking-wider text-amber-500">Chưa cập nhật</p>
                  <p className="text-xs text-slate-400 mt-1">Lịch phát sóng chưa được cập nhật</p>
                </div>
              </div>
            ) : (
              scheduleItems.map((item) => {
                const isActive = item.hour === currentHour;
                return (
                  <div
                    key={`schedule-tab-${item.hour}`}
                    className={`flex items-start gap-4 p-3.5 rounded-xl transition-all duration-300 border ${
                      isActive 
                        ? (isDark 
                            ? "bg-gradient-to-r from-[#4AC4FE]/20 to-transparent border-[#4AC4FE]/30 text-white shadow-md shadow-[#4AC4FE]/5"
                            : "bg-gradient-to-r from-[#4AC4FE]/10 to-transparent border-[#4AC4FE]/20 text-[#0c4a6e] shadow-sm")
                        : (isDark 
                            ? "bg-white/[0.02] border-transparent text-white/70 hover:text-white hover:bg-white/[0.05]"
                            : "bg-slate-50 border-transparent text-slate-600 hover:text-slate-900 hover:bg-slate-100")
                    }`}
                  >
                    {/* Time Badge */}
                    <div className={`font-mono text-xs font-bold px-2.5 py-1 rounded-lg shrink-0 ${
                      isActive 
                        ? "bg-[#4AC4FE] text-black shadow-sm"
                        : (isDark ? "bg-white/5 text-white/50" : "bg-slate-200/60 text-slate-500")
                    }`}>
                      {item.time}
                    </div>

                    {/* Program Title */}
                    <div className="flex-1 space-y-0.5 min-w-0 text-left">
                      <p className={`text-xs leading-snug font-black uppercase tracking-tight truncate ${
                        isActive ? "text-[#4AC4FE]" : ""
                      }`}>
                        {item.title}
                      </p>
                      {isActive && (
                        <div className="flex items-center gap-1">
                          <span className="text-[8px] font-bold text-red-500 uppercase tracking-widest animate-pulse">• ĐANG PHÁT TRỰC TIẾP</span>
                        </div>
                      )}
                    </div>
                  </div>
                );
              })
            )}
          </div>
        </div>
      )}

      {/* FILTERS */}
      {liveTabSection === "channels" && (
        <div className="mt-8 md:mt-12">
          {liveSubTab === "vplay" && (
          <div className="flex flex-col md:flex-row gap-6 mb-8 w-full">
            {/* Desktop Filter Row */}
            <div className={`hidden md:flex gap-6 overflow-x-auto pb-3 md:pb-3 no-scrollbar flex-1 border-b ${isDark ? "border-white/10" : "border-slate-200"}`}>
              {["Tất cả", "Thử nghiệm", "Thiết yếu", "VTV", "VTVcab", "HTV", "Các kênh địa phương"].map((type) => (
                <button
                  key={type}
                  onClick={() => setFilterType(type)}
                  className={`relative pb-2.5 text-sm font-semibold whitespace-nowrap transition-all ${
                    filterType === type
                      ? "text-[#4AC4FE] font-black"
                      : "text-slate-400 hover:text-white"
                  }`}
                >
                  {type}
                  {filterType === type && (
                    <motion.div
                      layoutId="activeFilterTab"
                      className="absolute bottom-0 left-0 right-0 h-[3px] bg-[#4AC4FE] rounded-full"
                      transition={{ type: "spring", stiffness: 350, damping: 30 }}
                    />
                  )}
                </button>
              ))}
            </div>

            {/* Mobile Filter & Sort side-by-side dropdowns & Toggle */}
            <div className="flex md:hidden w-full flex-col gap-3 relative z-30">
              <div className="flex w-full gap-3">
                {/* Mobile Filter Dropdown */}
                <div className="relative flex-1">
                  <button
                    onClick={() => { setShowFilterMenu(!showFilterMenu); setShowSortMenu(false); }}
                    className={`w-full p-3.5 rounded-xl border transition-all flex items-center justify-between gap-2 bg-white/5 border-white/5 text-white ${liquidGlass ? "backdrop-blur-md" : ""}`}
                  >
                    <div className="flex items-center gap-2">
                      <Filter className="h-4 w-4 text-[#4AC4FE]" />
                      <span className="text-xs font-bold uppercase tracking-wider text-slate-300">Lọc</span>
                    </div>
                    <span className="text-xs font-black truncate max-w-[80px] text-[#4AC4FE]">
                      {filterType}
                    </span>
                  </button>

                  <AnimatePresence>
                    {showFilterMenu && (
                      <>
                        <div className="fixed inset-0 z-40" onClick={() => setShowFilterMenu(false)} />
                        <motion.div
                          initial={{ opacity: 0, y: 10, scale: 0.95 }}
                          animate={{ opacity: 1, y: 0, scale: 1 }}
                          exit={{ opacity: 0, y: 10, scale: 0.95 }}
                          className={`absolute top-full left-0 right-0 mt-2 p-2 border shadow-2xl bg-slate-900 border-white/10 z-50 ${liquidGlass ? "rounded-2xl backdrop-blur-3xl" : "rounded-xl"}`}
                        >
                          {["Tất cả", "Thử nghiệm", "Thiết yếu", "VTV", "VTVcab", "HTV", "Các kênh địa phương"].map((type) => (
                            <button
                              key={type}
                              onClick={() => {
                                setFilterType(type);
                                setShowFilterMenu(false);
                              }}
                              className={`w-full text-left px-4 py-2.5 rounded-xl text-xs font-bold transition-all ${
                                filterType === type 
                                  ? "bg-[#4AC4FE] text-white" 
                                  : "text-white hover:bg-white/5"
                              }`}
                            >
                              {type}
                            </button>
                          ))}
                        </motion.div>
                      </>
                    )}
                  </AnimatePresence>
                </div>

                {/* Mobile Sort Dropdown */}
                <div className="relative flex-1">
                  <button
                    onClick={() => { setShowSortMenu(!showSortMenu); setShowFilterMenu(false); }}
                    className={`w-full p-3.5 rounded-xl border transition-all flex items-center justify-between gap-2 bg-white/5 border-white/5 text-white ${liquidGlass ? "backdrop-blur-md" : ""}`}
                  >
                    <div className="flex items-center gap-2">
                      <Sliders className="h-4 w-4 text-[#4AC4FE]" />
                      <span className="text-xs font-bold uppercase tracking-wider text-slate-300">Xếp</span>
                    </div>
                    <span className="text-xs font-black truncate max-w-[80px] text-[#4AC4FE]">
                      {sortOrder === "default" ? "Mặc định" : sortOrder === "az" ? "A-Z" : "Z-A"}
                    </span>
                  </button>

                  <AnimatePresence>
                    {showSortMenu && (
                      <>
                        <div className="fixed inset-0 z-40" onClick={() => setShowSortMenu(false)} />
                        <motion.div
                          initial={{ opacity: 0, y: 10, scale: 0.95 }}
                          animate={{ opacity: 1, y: 0, scale: 1 }}
                          exit={{ opacity: 0, y: 10, scale: 0.95 }}
                          className={`absolute top-full left-0 right-0 mt-2 p-2 border shadow-2xl bg-slate-900 border-white/10 z-50 ${liquidGlass ? "rounded-2xl backdrop-blur-3xl" : "rounded-xl"}`}
                        >
                          {[
                            { id: "default", label: "Mặc định" },
                            { id: "az", label: "Sắp xếp A-Z" },
                            { id: "za", label: "Sắp xếp Z-A" }
                          ].map((opt) => (
                            <button
                              key={opt.id}
                              onClick={() => {
                                setSortOrder(opt.id as any);
                                setShowSortMenu(false);
                              }}
                              className={`w-full text-left px-4 py-2.5 rounded-xl text-xs font-bold transition-all ${
                                sortOrder === opt.id 
                                  ? "bg-[#4AC4FE] text-white" 
                                  : "text-white hover:bg-white/5"
                              }`}
                            >
                              {opt.label}
                            </button>
                          ))}
                        </motion.div>
                      </>
                    )}
                  </AnimatePresence>
                </div>
              </div>

              {/* Mobile Large Layout Toggle */}
              <button
                onClick={() => handleToggleLargeLayout(!isLargeLayout)}
                className={`w-full p-3 rounded-xl border transition-all flex items-center justify-center gap-2 ${
                  isLargeLayout
                    ? "bg-[#4AC4FE] border-[#4AC4FE] text-white shadow-lg"
                    : isDark 
                      ? "bg-slate-800/40 border-slate-700/55 text-slate-200 hover:bg-slate-800/60" 
                      : "bg-slate-100 border-slate-200 text-[#4AC4FE] hover:bg-slate-200"
                }`}
              >
                <LayoutGrid className="h-4 w-4" />
                <span className="text-xs font-black uppercase tracking-wider">Giao diện lớn: {isLargeLayout ? "BẬT" : "TẮT"}</span>
              </button>
            </div>

            <div className="hidden md:flex gap-2.5 shrink-0">
              {/* Desktop Sort Button */}
              <button
                onClick={() => {
                  if (sortOrder === "default") setSortOrder("az");
                  else if (sortOrder === "az") setSortOrder("za");
                  else setSortOrder("default");
                }}
                className={`p-3.5 md:p-3 rounded-xl border transition-all flex items-center gap-2 ${
                  isDark 
                    ? "bg-slate-800/50 border-slate-700/50 text-white" 
                    : "bg-[#4AC4FE]/5 border-[#4AC4FE]/20 text-slate-900"
                } ${liquidGlass ? "backdrop-blur-md" : ""}`}
                title={sortOrder === "default" ? "Mặc định" : sortOrder === "az" ? "Sắp xếp A-Z" : "Sắp xếp Z-A"}
              >
                <Sliders className="h-5 w-5 text-[#4AC4FE] opacity-80" />
                <span className={`text-sm font-bold ${isDark ? "text-white" : "text-slate-800"}`}>
                  {sortOrder === "default" ? "Mặc định" : sortOrder === "az" ? "A-Z" : "Z-A"}
                </span>
              </button>

              {/* Desktop Large Layout Toggle */}
              <button
                onClick={() => handleToggleLargeLayout(!isLargeLayout)}
                className={`p-3 md:p-3 rounded-xl border transition-all flex items-center gap-2 ${
                  isLargeLayout
                    ? "bg-[#4AC4FE] border-[#4AC4FE] text-white shadow-lg font-black"
                    : isDark 
                      ? "bg-slate-800/50 border-slate-700/50 text-white hover:bg-slate-800" 
                      : "bg-white border-slate-200 text-slate-900 hover:bg-slate-100 shadow-sm"
                } ${liquidGlass ? "backdrop-blur-md" : ""}`}
                title="Bật/Tắt Giao diện lớn (Hiển thị 2 ô kênh/dòng)"
              >
                <LayoutGrid className={`h-5 w-5 ${isLargeLayout ? "text-white" : "text-[#4AC4FE] opacity-80"}`} />
                <span className="text-sm font-bold">Giao diện lớn</span>
              </button>
            </div>
          </div>
        )}

        {/* CHANNEL LIST */}
        <div className="space-y-12 md:space-y-16">
          {liveSubTab === "custom" && customPlaylists[activePlaylistIdx]?.channels.length === 0 ? (
            <div className={`p-12 rounded-[40px] border-2 border-dashed flex flex-col items-center justify-center gap-4 transition-all max-w-xl mx-auto py-16 ${
              isDark ? "border-white/10 bg-[#12131c]" : "border-slate-300 bg-slate-50 text-slate-800"
            }`}>
              <div className="p-4 rounded-3xl bg-[#4AC4FE]/10 text-[#4AC4FE]">
                <FileText size={32} />
              </div>
              <div className="text-center">
                <p className="font-extrabold text-lg tracking-tight uppercase mb-1">Cá nhân hóa tivi của riêng bạn</p>
                <p className="text-xs font-semibold opacity-60 max-w-sm mx-auto">Vui lòng tải tệp .m3u, .m3u8 hoặc dán code của riêng bạn để xem trực tiếp các kênh yêu thích của bạn ngay trên vplay.</p>
              </div>
              <button
                onClick={() => {
                  setEditingPlaylistIdx(activePlaylistIdx);
                  setTempPlaylistName(customPlaylists[activePlaylistIdx].name);
                  setTempPlaylistContent("");
                }}
                className="px-6 py-3 rounded-full font-bold text-xs bg-[#4AC4FE] hover:bg-[#3bb0f0] text-white transition-all shadow-lg shadow-[#4AC4FE]/20"
              >
                Tải lên / Nhập File M3U tại đây
              </button>
            </div>
          ) : liveSubTab === "vplay" || liveSubTab === "custom" ? (
            <>
              {filteredCategories.map((cat, catIdx) => {
                let playlistChannels = liveSubTab === "custom"
                  ? filteredChannels.filter(c => c.category === cat || (!c.category && cat === "Kênh tự thêm"))
                  : (cat === "Thử nghiệm"
                      ? filteredChannels.filter(c => c.name === "VTV6")
                      : cat === "Thiết yếu" 
                          ? filteredChannels.filter(c => c.name === "VTV1" || c.name === "VTV5" || c.name === "Vietnam Today" || c.name.includes("ANTV") || c.name.includes("QPVN"))
                      : cat === "VTV"
                        ? filteredChannels.filter(c => ["VTV1", "VTV2", "VTV3", "VTV4", "VTV5", "VTV6", "VTV7", "VTV8", "VTV9", "VTV Cần Thơ", "Vietnam Today"].includes(c.name))
                        : cat === "VTVcab"
                          ? filteredChannels.filter(c => c.name.includes("ON"))
                          : cat === "HTV"
                            ? filteredChannels.filter(c => c.name.startsWith("HTV"))
                            : filteredChannels.filter(c => {
                                const isThietYeu = c.name === "VTV1" || c.name === "VTV5" || c.name === "Vietnam Today" || c.name.includes("ANTV") || c.name.includes("QPVN");
                                const isVTV = ["VTV1", "VTV2", "VTV3", "VTV4", "VTV5", "VTV6", "VTV7", "VTV8", "VTV9", "VTV Cần Thơ", "Vietnam Today"].includes(c.name);
                                const isVTVcab = c.name.includes("ON");
                                const isHTV = c.name.startsWith("HTV");
                                return !isThietYeu && !isVTV && !isVTVcab && !isHTV;
                              }));

                if (cat === "Các kênh địa phương" && liveSubTab === "vplay") {
                  const thvlChannels = playlistChannels.filter(c => c.name.toUpperCase().includes("VĨNH LONG") || c.name.toUpperCase().includes("THVL"));
                  const nonThvlChannels = playlistChannels.filter(c => !(c.name.toUpperCase().includes("VĨNH LONG") || c.name.toUpperCase().includes("THVL")));
                  playlistChannels = [...nonThvlChannels, ...thvlChannels];
                }

                const displaySubset = liveSubTab === "custom"
                  ? playlistChannels.slice(customPage * 24, (customPage + 1) * 24)
                  : playlistChannels;

                if (displaySubset.length === 0 && liveSubTab === "custom") return null;

                return (
                  <div key={`${cat}-${catIdx}`} className="space-y-6 md:space-y-8">
                    <div className="flex items-center justify-between px-2">
                      <div className="flex items-center gap-3 md:gap-4">
                        <div className="h-6 md:h-8 w-[4px] bg-[#4AC4FE] rounded-full" />
                        <div>
                          <h3 className={`text-xl md:text-3xl font-bold tracking-tighter uppercase ${isDark ? "text-white" : "text-slate-900"}`}>{cat}</h3>
                        </div>
                      </div>
                      
                      <span className={`text-[10px] font-black px-3 py-1 rounded-full ${isDark ? "bg-white/5 text-slate-400" : "bg-slate-100 text-slate-500"}`}>
                        {playlistChannels.length} Kênh
                      </span>
                    </div>

                    <div className={
                      isLargeLayout 
                        ? "grid grid-cols-2 gap-4 md:gap-8" 
                        : "grid grid-cols-3 sm:grid-cols-[repeat(auto-fill,minmax(140px,1fr))] gap-3 md:gap-6"
                    }>
                      {cat === "Phát thanh" ? (
                        <div className={`col-span-full p-12 rounded-[40px] border-2 border-dashed flex flex-col items-center justify-center gap-4 transition-all ${
                          isDark ? "border-white/10 bg-white/5 text-slate-400 hover:bg-white/10" : "border-black/5 bg-black/5 text-slate-500 hover:bg-black/[0.02]"
                        }`}>
                          <div className="p-4 rounded-3xl bg-[#4AC4FE]/10 text-[#4AC4FE]">
                            <Sparkles size={32} className="animate-pulse" strokeWidth={1.5} />
                          </div>
                          <div className="text-center">
                            <p className="font-bold text-xl tracking-tighter uppercase mb-1">Coming Soon!</p>
                            <p className="text-xs font-medium opacity-60">Tính năng đang được phát triển để mang lại trải nghiệm âm thanh tốt nhất.</p>
                          </div>
                        </div>
                      ) : (
                        displaySubset.map((ch) => (
                          <ChannelCard 
                            key={`tv-${cat}-${ch.name}-${ch.stream}`} 
                            ch={ch} 
                            onClick={(targetCh) => playChannelAndEnterFullscreen(targetCh || ch)} 
                            isDark={isDark} 
                            isActive={active.name === ch.name} 
                            favorites={favorites} 
                            toggleFavorite={toggleFavorite} 
                            liquidGlass={liquidGlass}
                            isLiveTab={true}
                            onContextMenu={onChannelContextMenu}
                            useNewDesign={useNewDesign}
                            activeChannelName={active?.name}
                            isLargeLayout={isLargeLayout}
                            quickSwitchEnabled={featureFlags.quick_channel_switch}
                            showChannelNumbers={showChannelNumbers}
                          />
                        ))
                      )}
                    </div>
                  </div>
                );
              })}

              {/* Custom M3u Paging indicators */}
              {liveSubTab === "custom" && filteredChannels.length > 24 && (
                <div className={`flex flex-col sm:flex-row items-center justify-between gap-4 p-5 rounded-3xl border mt-8 ${
                  isDark ? "bg-white/5 border-white/5" : "bg-slate-50 border-slate-200"
                }`}>
                  <span className="text-xs font-bold opacity-60">
                    Hiển thị {customPage * 24 + 1} - {Math.min((customPage + 1) * 24, filteredChannels.length)} trong tổng số {filteredChannels.length} kênh
                  </span>
                  
                  <div className="flex items-center gap-2">
                    <button
                      onClick={() => {
                        setCustomPage(p => Math.max(0, p - 1));
                        window.scrollTo({ top: 400, behavior: "smooth" });
                      }}
                      disabled={customPage === 0}
                      className="px-4 py-2.5 text-xs font-black uppercase tracking-widest rounded-xl bg-[#4AC4FE]/10 text-[#4AC4FE] disabled:opacity-30 enabled:hover:bg-[#4AC4FE]/20"
                    >
                      Trang trước
                    </button>
                    <span className="text-xs font-black min-w-[80px] text-center">
                      Trang {customPage + 1} / {Math.ceil(filteredChannels.length / 24)}
                    </span>
                    <button
                      onClick={() => {
                        setCustomPage(p => Math.min(Math.ceil(filteredChannels.length / 24) - 1, p + 1));
                        window.scrollTo({ top: 400, behavior: "smooth" });
                      }}
                      disabled={(customPage + 1) * 24 >= filteredChannels.length}
                      className="px-4 py-2.5 text-xs font-black uppercase tracking-widest rounded-xl bg-[#4AC4FE]/10 text-[#4AC4FE] disabled:opacity-30 enabled:hover:bg-[#4AC4FE]/20"
                    >
                      Trang sau
                    </button>
                  </div>
                </div>
              )}
            </>
          ) : null}
        </div>
      </div>
      )}

      {/* FAVORITES SUB-TAB CONTENT */}
      {mode === "live" && liveTabSection === "favorites" && (
        <div className="mt-8 md:mt-12 space-y-6 md:space-y-8">
          <div className="flex items-center justify-between px-2">
            <div className="flex items-center gap-3">
              <div className="h-6 md:h-8 w-[4px] bg-red-500 rounded-full" />
              <h3 className={`text-xl md:text-3xl font-extrabold tracking-tighter uppercase ${isDark ? "text-white" : "text-slate-900"}`}>
                Kênh yêu thích ({favorites.length})
              </h3>
            </div>
            <span className={`text-[10px] font-black px-3 py-1 rounded-full ${isDark ? "bg-white/5 text-slate-400" : "bg-slate-100 text-slate-500"}`}>
              {favorites.length} Kênh
            </span>
          </div>

          {channels.filter(ch => favorites.includes(ch.name)).length === 0 ? (
            <div className={`p-12 rounded-[40px] border-2 border-dashed flex flex-col items-center justify-center gap-4 transition-all max-w-xl mx-auto py-16 ${
              isDark ? "border-white/10 bg-[#181818]/30" : "border-slate-300 bg-slate-50/50"
            }`}>
              <div className="p-4 rounded-3xl bg-red-500/10 text-red-500">
                <Heart size={32} className="fill-none animate-pulse" />
              </div>
              <div className="text-center">
                <p className="font-extrabold text-lg tracking-tight uppercase mb-1">Chưa có kênh yêu thích</p>
                <p className="text-xs font-semibold opacity-60 max-w-sm mx-auto">
                  Hãy nhấn nút Trái tim (Yêu thích) ở cạnh trình phát hoặc menu chuột phải để lưu kênh vào đây để truy cập nhanh chóng.
                </p>
              </div>
            </div>
          ) : (
            <div className={
              isLargeLayout 
                ? "grid grid-cols-2 gap-4 md:gap-8" 
                : "grid grid-cols-3 sm:grid-cols-[repeat(auto-fill,minmax(140px,1fr))] gap-3 md:gap-6"
            }>
              {channels
                .filter(ch => favorites.includes(ch.name))
                .map((ch) => (
                  <ChannelCard 
                    key={`fav-tab-${ch.name}`} 
                    ch={ch} 
                    onClick={(targetCh) => playChannelAndEnterFullscreen(targetCh || ch)} 
                    isDark={isDark} 
                    isActive={active.name === ch.name} 
                    favorites={favorites} 
                    toggleFavorite={toggleFavorite} 
                    liquidGlass={liquidGlass}
                    isLiveTab={true}
                    onContextMenu={onChannelContextMenu}
                    useNewDesign={useNewDesign}
                    activeChannelName={active?.name}
                    isLargeLayout={isLargeLayout}
                    quickSwitchEnabled={featureFlags.quick_channel_switch}
                    showChannelNumbers={showChannelNumbers}
                  />
                ))}
            </div>
          )}
        </div>
      )}
      </div>

      {/* Mobile Schedule Drawer/Modal */}
      <AnimatePresence>
        {isMobileScheduleOpen && (
          <div className="fixed inset-0 z-[999] flex items-end justify-center md:hidden">
            {/* Backdrop */}
            <motion.div 
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={() => setIsMobileScheduleOpen(false)}
              className="absolute inset-0 bg-black/60 backdrop-blur-sm"
            />
            
            {/* Modal/Drawer Container */}
            <motion.div 
              initial={{ y: "100%" }}
              animate={{ y: 0 }}
              exit={{ y: "100%" }}
              transition={{ type: "spring", damping: 25, stiffness: 250 }}
              className={`relative w-full max-h-[85vh] flex flex-col rounded-t-[32px] border-t overflow-hidden shadow-2xl p-5 ${
                isDark 
                  ? "bg-[#181818]/95 border-white/10 text-white" 
                  : "bg-white/95 border-slate-200 text-slate-900 shadow-2xl"
              } backdrop-blur-3xl`}
              style={{ paddingBottom: "env(safe-area-inset-bottom, 24px)" }}
            >
              {/* Drag indicator/handle */}
              <div className="w-12 h-1.5 rounded-full bg-slate-500/30 mx-auto mb-4 shrink-0" onClick={() => setIsMobileScheduleOpen(false)} />
              
              {/* Header */}
              <div className="flex items-center justify-between pb-3 mb-4 border-b border-slate-200/10 flex-shrink-0">
                <div className="flex items-center gap-2">
                  <div className="p-1.5 rounded-lg bg-[#4AC4FE]/10 text-[#4AC4FE]">
                    {mode === "realm" ? <Link size={18} /> : <Calendar size={18} />}
                  </div>
                  <div>
                    <span className="text-sm sm:text-base font-black uppercase tracking-wider block">
                      {mode === "realm" ? "Nhập luồng / URL" : "Lịch Phát Sóng Kênh"}
                    </span>
                    <span className="text-[10px] opacity-60 font-medium block">Đang xem: {active.name.toLowerCase().includes("hd") ? active.name : `${active.name} HD`}</span>
                  </div>
                </div>
                <button 
                  onClick={() => setIsMobileScheduleOpen(false)}
                  className={`p-2 rounded-full transition-colors ${
                    isDark ? "bg-white/5 text-white/70 hover:text-white" : "bg-slate-100 text-slate-900 hover:bg-slate-200"
                  }`}
                >
                  <X size={18} />
                </button>
              </div>

              {mode === "realm" ? (
                <div className="flex-1 flex flex-col overflow-y-auto no-scrollbar space-y-4 pb-6">
                  <div className="space-y-4">
                    <div>
                      <label className="text-[10px] font-black uppercase tracking-widest mb-1 block opacity-60">Tên luồng phát</label>
                      <input
                        type="text"
                        value={urlStreamName}
                        onChange={(e) => setUrlStreamName(e.target.value)}
                        className={`w-full px-3 py-2.5 rounded-xl text-xs font-bold border transition-all ${
                          isDark ? "bg-white/5 border-white/10 text-white focus:border-[#4AC4FE]/50" : "bg-slate-100 border-slate-200 text-slate-850 focus:border-[#4AC4FE]/50"
                        }`}
                        placeholder="Ví dụ: Kênh test, HBO..."
                      />
                    </div>

                    <div>
                      <label className="text-[10px] font-black uppercase tracking-widest mb-1 block opacity-60">Link luồng phát (M3U8, MP4...)</label>
                      <input
                        type="text"
                        value={urlStreamInput}
                        onChange={(e) => setUrlStreamInput(e.target.value)}
                        className={`w-full px-3 py-2.5 rounded-xl text-xs font-mono border transition-all ${
                          isDark ? "bg-white/5 border-white/10 text-white focus:border-[#4AC4FE]/50" : "bg-slate-100 border-slate-200 text-slate-850 focus:border-[#4AC4FE]/50"
                        }`}
                        placeholder="https://example.com/playlist.m3u8"
                      />
                    </div>

                    <button
                      onClick={() => {
                        if (!urlStreamInput.trim()) {
                          showToast("Vui lòng nhập Link luồng phát!", "error");
                          return;
                        }
                        const customChan: Channel = {
                          name: urlStreamName || "VLC Live Stream",
                          category: "Luồng trực tiếp",
                          logo: "https://static.wikia.nocookie.net/ftv/images/a/a9/Ic_vlc_icon.png/revision/latest?cb=20260424160410",
                          stream: urlStreamInput.trim(),
                          desc: `Luồng phát trực tiếp từ URL`
                        };
                        playChannelAndEnterFullscreen(customChan);
                        
                        const dateString = new Date().toLocaleString("vi-VN");
                        setUrlHistory(prev => {
                          const filtered = prev.filter(p => p.url !== urlStreamInput.trim());
                          const next = [{ name: urlStreamName || "VLC Live Stream", url: urlStreamInput.trim(), date: dateString }, ...filtered].slice(0, 5);
                          localStorage.setItem("vplay_url_stream_history", JSON.stringify(next));
                          return next;
                        });
                        
                        setIsMobileScheduleOpen(false);
                        showToast(`Đang kết nối luồng "${urlStreamName || "VLC Stream"}"`, "success");
                      }}
                      className="w-full py-3 rounded-xl font-bold text-xs bg-[#4AC4FE] text-white flex items-center justify-center gap-1.5 shadow-lg shadow-[#4AC4FE]/25 active:scale-95 transition-all"
                    >
                      <Play size={12} fill="currentColor" />
                      Phát luồng trực tiếp
                    </button>
                  </div>

                  <div className="border-t border-slate-500/10 pt-4 flex-shrink-0">
                    <div className="flex items-center justify-between mb-2">
                      <span className="text-[10px] font-black uppercase tracking-widest opacity-60">Lịch sử xem ({urlHistory.length})</span>
                      {urlHistory.length > 0 && (
                        <button
                          onClick={() => {
                            setUrlHistory([]);
                            localStorage.removeItem("vplay_url_stream_history");
                            showToast("Đã xóa sạch lịch sử xem URL", "info");
                          }}
                          className="text-[9px] font-bold text-red-500 hover:underline uppercase"
                        >
                          Xóa
                        </button>
                      )}
                    </div>

                    {urlHistory.length === 0 ? (
                      <div className="flex flex-col items-center justify-center py-6 text-center opacity-40">
                        <Link size={20} className="strokeWidth-1 pb-1" />
                        <p className="text-[10px] font-bold">Chưa có lịch sử phát URL</p>
                      </div>
                    ) : (
                      <div className="space-y-1.5 max-h-[220px] overflow-y-auto pr-1">
                        {urlHistory.map((h, i) => (
                          <div
                            key={`mobile-hist-${i}`}
                            onClick={() => {
                              setUrlStreamName(h.name || "VLC Live Stream");
                              setUrlStreamInput(h.url);
                              const customChan: Channel = {
                                name: h.name || "VLC Live Stream",
                                category: "Luồng trực tiếp",
                                logo: "https://static.wikia.nocookie.net/ftv/images/a/a9/Ic_vlc_icon.png/revision/latest?cb=20260424160410",
                                stream: h.url,
                                desc: `Luồng phát trực tiếp từ URL`
                              };
                              playChannelAndEnterFullscreen(customChan);
                              setIsMobileScheduleOpen(false);
                              showToast(`Đang kết nối luồng "${h.name || "VLC Stream"}"`, "success");
                            }}
                            className={`p-2 rounded-xl border text-left cursor-pointer transition-all flex flex-col gap-0.5 ${
                              isDark 
                                ? "bg-white/5 border-white/5 hover:bg-white/10 hover:border-white/15 text-white" 
                                : "bg-slate-50 border-slate-100 hover:bg-slate-100 hover:border-slate-200 text-slate-800"
                            }`}
                          >
                            <span className="text-xs font-bold truncate block">{h.name || "Không tên"}</span>
                            <span className="text-[10px] font-mono opacity-50 truncate block">{h.url}</span>
                            <span className="text-[8px] opacity-30 mt-0.5 self-end">{h.date}</span>
                          </div>
                        ))}
                      </div>
                    )}
                  </div>
                </div>
              ) : (
                <>
                  {/* Day Selector */}
                  <div className="flex gap-1 overflow-x-auto no-scrollbar py-1 shrink-0 mb-3 border-b border-slate-500/10">
                    {dayOptions.map((opt) => {
                      const isSelected = selectedDayOffset === opt.offset;
                      return (
                        <button
                          key={`day-opt-mobile-${opt.offset}`}
                          onClick={() => setSelectedDayOffset(opt.offset)}
                          className={`flex flex-col items-center justify-center px-3 py-1 min-w-[50px] rounded-lg transition-all text-center select-none shrink-0 ${
                            isSelected
                              ? "bg-[#4AC4FE] text-slate-950 font-bold"
                              : isDark
                                ? "bg-white/5 text-white/50 hover:bg-white/10 hover:text-white"
                                : "bg-slate-100 text-slate-600 hover:bg-slate-200"
                          }`}
                        >
                          <span className="text-[10px] font-bold tracking-tight whitespace-nowrap">{opt.label}</span>
                          <span className={`text-[8px] font-medium opacity-75 ${isSelected ? "text-slate-900/80" : "text-slate-400"}`}>{opt.desc}</span>
                        </button>
                      );
                    })}
                  </div>

                  {/* Schedule List content inside mobile modal */}
                  <div className="flex-1 overflow-y-auto pr-1 space-y-2.5 pb-8 no-scrollbar scrollbar-none flex flex-col">
                    {selectedDayOffset < 0 ? (
                      <div className="flex-1 flex flex-col items-center justify-center text-center p-6 space-y-3 opacity-60">
                        <div className="p-3 bg-red-500/10 rounded-full text-red-500">
                          <Calendar size={24} />
                        </div>
                        <div>
                          <p className="text-xs font-bold uppercase tracking-wider text-red-500">Đã hết hạn xem</p>
                          <p className="text-xs text-slate-400 mt-1 max-w-[200px] mx-auto">Lịch phát sóng đã hết thời hạn xem lại</p>
                        </div>
                      </div>
                    ) : selectedDayOffset > 0 ? (
                      <div className="flex-1 flex flex-col items-center justify-center text-center p-6 space-y-3 opacity-60">
                        <div className="p-3 bg-amber-500/10 rounded-full text-amber-500">
                          <Calendar size={24} />
                        </div>
                        <div>
                          <p className="text-xs font-bold uppercase tracking-wider text-amber-500">Chưa cập nhật</p>
                          <p className="text-xs text-slate-400 mt-1 max-w-[200px] mx-auto">Lịch phát sóng chưa được cập nhật</p>
                        </div>
                      </div>
                    ) : (
                      scheduleItems.map((item) => {
                        const isActive = item.hour === currentHour;
                        return (
                          <div
                            key={`mobile-sched-${item.hour}`}
                            className={`flex items-start gap-4 p-3 rounded-2xl transition-all duration-300 relative ${
                              isActive 
                                ? (isDark 
                                    ? "bg-gradient-to-r from-[#4AC4FE]/20 to-transparent border border-[#4AC4FE]/30 text-white shadow-md shadow-[#4AC4FE]/5"
                                    : "bg-gradient-to-r from-[#4AC4FE]/10 to-transparent border border-[#4AC4FE]/20 text-[#0c4a6e] shadow-sm")
                                : (isDark 
                                    ? "hover:bg-white/5 border border-transparent text-white/70 hover:text-white"
                                    : "hover:bg-slate-50 border border-transparent text-slate-600 hover:text-slate-900")
                            }`}
                          >
                            {/* Time Badge */}
                            <div className={`font-mono text-xs font-bold px-2 py-0.5 rounded-lg shrink-0 ${
                              isActive 
                                ? "bg-[#4AC4FE] text-black shadow-sm"
                                : (isDark ? "bg-white/5 text-white/50" : "bg-slate-200 text-slate-500")
                            }`}>
                              {item.time}
                            </div>

                            {/* Program Title */}
                            <div className="flex-1 space-y-0.5 text-left">
                              <p className={`text-[11px] sm:text-xs leading-tight font-black uppercase tracking-tight ${
                                isActive ? "text-[#4AC4FE]" : ""
                              }`}>
                                {item.title}
                              </p>
                              {isActive && (
                                <div className="flex items-center gap-1">
                                  <span className="text-[9px] font-bold text-red-500 uppercase tracking-widest animate-pulse">• ĐANG PHÁT TRỰC TIẾP</span>
                                </div>
                              )}
                            </div>
                          </div>
                        );
                      })
                    )}
                  </div>
                </>
              )}
            </motion.div>
          </div>
        )}
      </AnimatePresence>

      {/* Remote Quick Channels switching Modal */}
      <AnimatePresence>
        {isRemoteOpen && (
          <div className="fixed inset-0 z-[1000] flex items-center justify-center p-4">
            {/* Backdrop: Completely transparent, zero blur, zero overlay as requested */}
            <motion.div 
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              transition={{ duration: 0.35, ease: [0.16, 1, 0.3, 1] }}
              onClick={() => setIsRemoteOpen(false)}
              className="absolute inset-0 bg-transparent cursor-pointer"
              style={{
                backdropFilter: "none",
                WebkitBackdropFilter: "none"
              }}
            />
            
            {/* Modal Keyboard Box: White overlay, thin shiny border and blur like bottom bar */}
            <motion.div 
               initial={{ scale: 1.6, opacity: 0 }}
               animate={{ scale: 1, opacity: 1 }}
               exit={{ scale: 1.6, opacity: 0 }}
               transition={{ type: "spring", stiffness: 280, damping: 26 }}
               className={`relative w-full max-w-xs rounded-[32px] border p-6 flex flex-col items-center shadow-[0_12px_32px_rgba(0,0,0,0.15),_inset_0_1px_1.5px_rgba(255,255,255,0.15)] border-white/12 ${
                 isDark ? "text-white" : "text-slate-850"
               }`}
               style={{
                 backgroundColor: "rgba(255, 255, 255, 0.16)",
                 backdropFilter: "blur(20px)",
                 WebkitBackdropFilter: "blur(20px)"
               }}
            >
              {/* Header */}
              <div className="w-full flex items-center justify-between mb-4 border-b border-slate-200/10 pb-3">
                <div className="flex items-center gap-2">
                  <Smartphone size={18} className="text-[#4AC4FE]" />
                  <span className="text-xs font-black uppercase tracking-wider">Chuyển kênh nhanh</span>
                </div>
                <button 
                  onClick={() => setIsRemoteOpen(false)}
                  className={`p-1.5 rounded-full transition-all active:scale-115 hover:scale-105 duration-200 ${
                    isDark ? "hover:bg-white/10 text-white/70" : "hover:bg-slate-100 text-slate-900"
                  }`}
                >
                  <X size={16} />
                </button>
              </div>

              {/* Digital Screen Display on Remote */}
              <div className={`w-full mb-6 p-4 rounded-2xl flex flex-col items-center justify-center font-mono ${
                isDark ? "bg-black/40 border border-white/5" : "bg-slate-100 border border-slate-200"
              }`}>
                <span className={`text-3xl font-black tracking-widest ${isDark ? "text-[#4AC4FE]" : "text-blue-600"}`}>
                  {remoteInput.padStart(3, "0")}
                </span>
                <span className={`text-[10px] font-bold mt-1.5 min-h-[14px] truncate max-w-full text-center ${isDark ? "text-slate-400" : "text-slate-500"}`}>
                  {(() => {
                    const chNum = parseInt(remoteInput, 10);
                    if (isNaN(chNum) || chNum < 1 || chNum > channels.length) {
                      return remoteInput ? "Không tìm thấy kênh" : "Nhập số kênh từ 0-9";
                    }
                    return `Mục tiêu: ${channels[chNum - 1].name}`;
                  })()}
                </span>
              </div>

              {/* Keypad Grid */}
              <div className="grid grid-cols-3 gap-3 w-full">
                {/* 1 - 9 Keys */}
                {[1, 2, 3, 4, 5, 6, 7, 8, 9].map((num) => (
                  <button
                    key={num}
                    onClick={() => {
                      if (remoteInput.length < 3) {
                        setRemoteInput(prev => prev + num);
                      }
                    }}
                    className={`h-11 rounded-full text-sm font-black flex items-center justify-center active:scale-115 hover:scale-105 transition-all duration-200 ${
                      isDark 
                        ? "bg-white/5 border border-white/10 text-white hover:bg-white/10" 
                        : "bg-slate-50 border border-slate-200 text-slate-800 hover:bg-slate-100"
                    }`}
                  >
                    {num}
                  </button>
                ))}

                {/* Clear, 0, OK */}
                <button
                  onClick={() => setRemoteInput("")}
                  className={`h-11 rounded-full text-[10px] font-black uppercase tracking-wider flex items-center justify-center active:scale-115 hover:scale-105 transition-all duration-200 bg-red-500/10 text-red-500 border border-red-500/20 hover:bg-red-500/20`}
                >
                  CLEAR
                </button>

                <button
                  onClick={() => {
                    if (remoteInput.length < 3) {
                      setRemoteInput(prev => prev + "0");
                    }
                  }}
                  className={`h-11 rounded-full text-sm font-black flex items-center justify-center active:scale-115 hover:scale-105 transition-all duration-200 ${
                    isDark 
                      ? "bg-white/5 border border-white/10 text-white hover:bg-white/10" 
                      : "bg-slate-50 border border-slate-200 text-slate-800 hover:bg-slate-100"
                  }`}
                >
                  0
                </button>

                <button
                  onClick={() => {
                    const targetNum = parseInt(remoteInput, 10);
                    if (isNaN(targetNum) || targetNum < 1 || targetNum > channels.length) {
                      showToast("Vui lòng nhập vị trí số kênh hợp lệ!", "error");
                    } else {
                      const matchedCh = channels[targetNum - 1];
                      setActive(matchedCh);
                      setIsRemoteOpen(false);
                      setRemoteInput("");
                      showToast(`Đã chuyển sang ${matchedCh.name}`, "success");
                    }
                  }}
                  className={`h-11 rounded-full text-xs font-black uppercase tracking-wider flex items-center justify-center active:scale-115 hover:scale-105 transition-all duration-200 bg-[#4AC4FE]/10 text-[#4AC4FE] border border-[#4AC4FE]/20 hover:bg-[#4AC4FE]/20 hover:text-white`}
                >
                  OK
                </button>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </div>
  );
}

const settingsSearchOptions = [
  { name: "Hồ sơ cá nhân", page: 1, desc: "Chi tiết tài khoản của bạn và chỉnh sửa tên hiển thị", match: ["hồ sơ", "ho so", "tài khoản", "tai khoan", "username", "user id", "tên", "ten", "đăng nhập", "đăng xuất", "profile"] },
  { name: "Sửa hồ sơ & Đổi tên hiển thị", page: 1, desc: "Cập nhật tên tài khoản hoặc tên khách của bạn", match: ["sửa hồ sơ", "sua ho so", "đổi tên", "doi ten", "username", "profile"] },
  { name: "Thông tin phiên bản Vplay", page: 1, desc: "Xem chi tiết phiên bản và bản phát hành ứng dụng", match: ["phiên bản", "phien ban", "version", "info", "thông tin", "thong tin"] },
  { name: "Low latency mode (Tăng hiệu năng)", page: 2, desc: "Tối ưu hóa độ trễ luồng phát trực tiếp để tăng tốc", match: ["low latency", "tăng hiệu năng", "tang hieu nang", "độ trễ", "do tre", "hiệu năng", "hieu nang"] },
  { name: "Reduce animation (Giảm hiệu ứng hoạt ảnh)", page: 2, desc: "Tắt chuyển động mượt mà để tiết kiệm hiệu năng pin", match: ["reduce animation", "giảm hiệu ứng", "giam hieu ung", "tắt animation", "tat animation", "tăng tốc", "tang toc"] },
  { name: "Thời gian hiển thị thông báo Toast", page: 2, desc: "Cài đặt thời gian hiển thị thông báo nổi trên màn hình", match: ["thời gian toast", "thoi gian toast", "toast duration", "thông báo", "thong bao", "nổi", "noi"] },
  { name: "Chế độ điều hướng (Desktop / Touch)", page: 3, desc: "Chuyển đổi giữa Sidebar máy tính và thanh điều hướng cảm ứng", match: ["chế độ điều hướng", "che do dieu huong", "sidebar", "navigation bar", "touch bar", "touch", "desktop"] },
  { name: "Liquid Glass style (Chủ đề kính)", page: 3, desc: "Tùy biến hiển thị dạng kính trong hoặc kính mờ", match: ["liquid glass", "kính trong", "kinh trong", "kính mờ", "kinh mo", "glassy", "tinted"] },
  { name: "Đồng hồ và Lịch", page: 4, desc: "Bật hoặc tắt đồng hồ, múi giờ và lịch trên topbar", match: ["đồng hồ", "dong ho", "lịch", "lich", "múi giờ", "mui gio", "định dạng", "dinh dang"] },
  { name: "Dự báo thời tiết và Vị trí địa lý", page: 4, desc: "Hiển thị thông tin nhiệt độ dựa theo vị trí định vị", match: ["thời tiết", "thoi tiet", "nhiệt độ", "nhiet do", "vị trí", "vi tri", "định vị", "dinh vi", "weather"] },
  { name: "Số lượng tab tối đa trên Bottom bar", page: 4, desc: "Thiết lập hiển thị từ 3 đến 5 tab trên thanh công cụ", match: ["tab tối đa", "tab toi da", "bottom bar", "floatbar", "toolbar", "số tab", "so tab"] },
  { name: "Vị trí và Truy cập nhanh trên Sidebar", page: 4, desc: "Đổi vị trí Sidebar trái/phải và hiển thị icon kênh yêu thích nhanh", match: ["vị trí sidebar", "vi tri sidebar", "truy cập nhanh", "truy cap nhanh", "sidebar"] },
  { name: "Kiểu thiết kế Floaty bars", page: 4, desc: "Bật chế độ chạm góc màn hình cho thanh topbar và sidebar thay vì nổi lơ lửng", match: ["floaty bars", "thanh nổi", "thanh noi", "chạm góc", "cham goc", "topbar", "sidebar", "lơ lửng", "lo lung"] },
  { name: "Cửa sổ phát mini (Picture in Picture)", page: 5, desc: "Chế độ phát ngoài cửa sổ nổi khi chuyển phòng", match: ["picture in picture", "pip", "cửa sổ", "cua so", "phát nổi", "phat noi", "mini"] },
];

function SearchPopup({ 
  isDark, 
  searchQuery, 
  setActiveChannel, 
  onClose, 
  favorites, 
  liquidGlass,
  setActiveTab,
  handleOpenSettings,
  setIsDark,
  setLiquidGlass,
  onLogin,
  onLogout,
  setSortOrder,
  loadingTreatment,
  asContent,
  useSidebar,
  setUseSidebar,
  isSidebarRight,
  setIsSidebarRight,
  sidebarDisplay,
  setSidebarDisplay,
  isPinningEnabled,
  setIsPinningEnabled,
  featureFlags,
  setFeatureFlags,
  setIsSidebarLocked,
  setSearchQuery,
  searchFilter,
  onContextMenu,
  allCustomChannels,
  searchFilterOption,
  currentTab,
  setActiveSettingsPage
}: { 
  isDark: boolean, 
  searchQuery: string, 
  setActiveChannel: (ch: typeof channels[0]) => void, 
  onClose: () => void, 
  favorites: string[], 
  liquidGlass: "glassy" | "tinted",
  setActiveTab: (tab: string) => void,
  setIsDark: (val: boolean) => void,
  setLiquidGlass: (val: "glassy" | "tinted") => void,
  onLogin: () => void,
  onLogout: () => void,
  setSortOrder: (val: "az" | "za") => void,
  loadingTreatment: string,
  asContent?: boolean,
  useSidebar?: boolean,
  setUseSidebar?: (val: boolean) => void,
  isSidebarRight?: boolean,
  setIsSidebarRight?: (val: boolean) => void,
  sidebarDisplay?: "float" | "attach",
  setSidebarDisplay?: (val: "float" | "attach") => void,
  isPinningEnabled?: boolean,
  setIsPinningEnabled?: (val: boolean) => void,
  featureFlags?: { [key: string]: boolean },
  setFeatureFlags?: (val: any) => void,
  setIsSidebarLocked?: (val: boolean) => void,
  setSearchQuery?: (val: string) => void,
  searchFilter?: "all" | "channels" | "settings" | "experiments",
  handleOpenSettings: () => void,
  onContextMenu?: (e: React.MouseEvent) => void,
  allCustomChannels?: typeof channels,
  searchFilterOption?: "Tất cả kênh" | "Kênh của Vplay" | "Package của bạn",
  currentTab?: string,
  setActiveSettingsPage?: (page: number) => void
}) {
  if (searchQuery.trim() === "" && !asContent) return null;

  const isSettingsActive = currentTab === "Settings (new)" || currentTab === "Cài đặt";

  const sourceChannels = searchFilterOption === "Kênh của Vplay"
    ? channels
    : searchFilterOption === "Package của bạn"
    ? (allCustomChannels || [])
    : [...channels, ...(allCustomChannels || [])];

  const filteredChannels = isSettingsActive
    ? []
    : (searchFilter === "all" || searchFilter === "channels" 
        ? sourceChannels.filter(ch => 
            ch.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
            (ch.category && ch.category.toLowerCase().includes(searchQuery.toLowerCase()))
          )
        : []);

  const matchedSettings = isSettingsActive
    ? settingsSearchOptions.filter(item => 
        item.name.toLowerCase().includes(searchQuery.toLowerCase()) || 
        item.desc.toLowerCase().includes(searchQuery.toLowerCase()) ||
        item.match.some(m => m.includes(searchQuery.toLowerCase()))
      )
    : [];

  const systemItems = [
    { name: "Trang chủ", type: "tab", icon: HomeIcon, action: () => setActiveTab("Trang chủ") },
    { name: "Live", type: "tab", icon: TvIcon, action: () => setActiveTab("Live") },
    { name: "Khám phá", type: "tab", icon: SearchIcon, action: () => setActiveTab("Khám phá") },
    { name: "Thử nghiệm", type: "tab", icon: ExperimentalIcon, action: () => setActiveTab("Experimental"), isExp: true },
    { name: "Phòng thí nghiệm", type: "tab", icon: ExperimentalIcon, action: () => setActiveTab("Experimental"), isExp: true },
    { name: "Cài đặt", type: "tab", icon: SettingsIcon, action: () => handleOpenSettings() },
    { name: "Quản trị", type: "tab", icon: ShieldCheck, action: () => setActiveTab("Quản trị") },
    { name: "Tài khoản", type: "tab", icon: AccountIcon, action: () => setActiveTab("Tài khoản") },
    { name: "Cộng đồng", type: "tab", icon: CommunityIcon, action: () => handleOpenSettings() },
    { name: "Nhật ký cập nhật", type: "tab", icon: Zap, action: () => setActiveTab("Update Logs") },
    
    { name: "Sidebar Trái", type: "setting", icon: Columns, action: () => setIsSidebarRight?.(false) },
    { name: "Sidebar Phải", type: "setting", icon: Columns, action: () => setIsSidebarRight?.(true) },
    { name: "Khóa Sidebar", type: "setting", icon: Lock, action: () => (setIsSidebarLocked as any)?.(true) },
    { name: "Mở khóa Sidebar", type: "setting", icon: Unlock, action: () => (setIsSidebarLocked as any)?.(false) },
    { name: "Sidebar Lơ lửng", type: "setting", icon: Layers, action: () => setSidebarDisplay?.("float") },
    { name: "Sidebar Chạm góc", type: "setting", icon: Layout, action: () => setSidebarDisplay?.("attach") },
    { name: "Hiệu ứng Liquid Glass", type: "setting", icon: Layers, action: () => setLiquidGlass(liquidGlass === "glassy" ? "tinted" : "glassy") },
    
    { name: "Bật Truy cập nhanh", type: "toggle", icon: Pin, action: () => setIsPinningEnabled?.(true) },
    { name: "Tắt Truy cập nhanh", type: "toggle", icon: Pin, action: () => setIsPinningEnabled?.(false) },
    { name: "Bật Giảm chuyển động", type: "toggle", icon: Zap, action: () => setFeatureFlags?.((prev: any) => ({ ...prev, disable_animation: true })) },
    { name: "Tắt Giảm chuyển động", type: "toggle", icon: Zap, action: () => setFeatureFlags?.((prev: any) => ({ ...prev, disable_animation: false })) },
    
    { name: "Lọc kênh VTV", type: "button", icon: Filter, action: () => { onClose(); (document.querySelector('input') as HTMLInputElement).value = "VTV"; setSearchQuery?.("VTV"); } },
    { name: "Lọc kênh Phim", type: "button", icon: Film, action: () => { onClose(); (document.querySelector('input') as HTMLInputElement).value = "Phim"; setSearchQuery?.("Phim"); } },
    { name: "Lọc kênh Bóng đá", type: "button", icon: Zap, action: () => { onClose(); (document.querySelector('input') as HTMLInputElement).value = "Bóng đá"; setSearchQuery?.("Bóng đá"); } },
    
    { name: "Cài đặt nâng cao", type: "button", icon: SettingsIcon, action: () => handleOpenSettings() },
    { name: "Quản lý kênh", type: "button", icon: ShieldCheck, action: () => setActiveTab("Quản trị") },
    { name: "Tìm kiếm mở rộng", type: "button", icon: SearchIcon, action: () => setActiveTab("Khám phá") },
    
    { name: "Đăng nhập", type: "button", icon: SignInIcon, action: onLogin },
    { name: "Đăng xuất", type: "button", icon: SignOutIcon, action: onLogout },
    { name: "Sắp xếp A-Z", type: "toggle", icon: Filter, action: () => setSortOrder("az") },
    { name: "Sắp xếp Z-A", type: "toggle", icon: Filter, action: () => setSortOrder("za") },
    
    { name: "Thời tiết hôm nay", type: "element", icon: Cloud, action: () => setActiveTab("Trang chủ") },
    { name: "Đồng hồ hệ thống", type: "element", icon: Clock, action: () => setActiveTab("Trang chủ") },
    { name: "Kênh đã ghim", type: "element", icon: Pin, action: () => setActiveTab("Live") },
    { name: "Người dùng đăng nhập", type: "element", icon: User, action: onLogin },
    { name: "Bảng điều khiển", type: "element", icon: Layout, action: () => setActiveTab("Quản trị") },
    { name: "Liên hệ hỗ trợ", type: "element", icon: Info, action: () => handleOpenSettings() },
    
    { name: "Multiview Channels", type: "experiments", icon: LayoutGrid, action: () => setActiveTab("Experimental"), isExp: true },
    { name: "Screen Recording", type: "experiments", icon: Camera, action: () => setActiveTab("Experimental"), isExp: true },
    { name: "Picture in Picture", type: "experiments", icon: Maximize2, action: () => setActiveTab("Experimental"), isExp: true },
    { name: "Rejuvenated Settings", type: "experiments", icon: SettingsIcon, action: () => setActiveTab("Experimental"), isExp: true },

    { name: "/force launch loading", type: "command", icon: Zap, action: () => {} },
    { name: "/force launch oobe", type: "command", icon: Zap, action: () => {} },
    { name: "/help", type: "command", icon: Info, action: () => {} },
    { name: "/bypass", type: "command", icon: Shield, action: () => {} },
    { name: "devmode", type: "command", icon: Terminal, action: () => {} },
  ];

  const isHelpCommand = searchQuery.trim().toLowerCase() === "/help";
  const filteredSystem = isSettingsActive
    ? []
    : systemItems.filter(item => {
        const matchesSearch = isHelpCommand 
          ? ["command", "setting", "button", "tab"].includes(item.type)
          : item.name.toLowerCase().includes(searchQuery.toLowerCase());
        
        if (!matchesSearch) return false;

        if (searchFilter === "all") return true;
        if (searchFilter === "experiments") return (item as any).isExp || item.type === "experiments";
        if (searchFilter === "settings") return !((item as any).isExp || item.type === "experiments");
        if (searchFilter === "channels") return false;
        
        return true;
      });

  const favoriteChannels = channels.filter(ch => favorites.includes(ch.name));

  const innerContent = (
    <div className={`${asContent ? "space-y-12 pb-10" : "p-4 space-y-1 max-h-[60vh] overflow-y-auto custom-scrollbar"}`}>
      {asContent && <div className={`h-[1px] w-full ${isDark ? "bg-white/10" : "bg-slate-200"}`} />}
        
        {searchQuery.trim() === "" ? (
          <div className="space-y-4">
            {favoriteChannels.length > 0 && !isSettingsActive && (
              <div className="space-y-2">
                <div className="px-4 py-2 flex items-center gap-2">
                  <LikeIcon size={12} filled={true} className="text-red-500" />
                  <p className={`text-[10px] font-bold uppercase tracking-widest ${isDark ? "text-white/40" : "text-black/60"}`}>Kênh yêu thích</p>
                </div>
                {favoriteChannels.map((ch, idx) => (
                  <button
                    key={`search-fav-${ch.name}-${idx}`}
                    onClick={() => { setActiveChannel(ch); onClose(); }}
                    className={`w-full flex items-center gap-4 p-3 rounded-[24px] transition-all hover:scale-[1.02] active:scale-[0.98] group hover:bg-black/5`}
                  >
                    <div className={`w-10 h-10 rounded-xl flex items-center justify-center border bg-slate-100 border-slate-200`}>
                      <img src={ch.logo} alt={ch.name} className="w-6 h-6 object-contain" referrerPolicy="no-referrer" />
                    </div>
                    <div className="flex-1 text-left">
                      <p className={`font-bold text-sm ${isDark ? "text-white" : "text-black"}`}>{ch.name}</p>
                    </div>
                    <ChevronRight className={`w-4 h-4 ${isDark ? "text-white/20" : "text-black/30"}`} />
                  </button>
                ))}
              </div>
            )}
            <div className={`py-8 text-center space-y-3 ${isDark ? "text-white" : "text-black"}`}>
              <img 
                src="https://static.wikia.nocookie.net/ftv/images/6/63/Search_uci.png/revision/latest?cb=20260411084053&path-prefix=vi" 
                alt="Search" 
                className="w-12 h-12 mx-auto object-contain" 
                referrerPolicy="no-referrer" 
              />
              <p className="text-sm font-bold">
                {isSettingsActive ? "Tìm kiếm cài đặt hệ thống" : "Tìm kiếm kênh chương trình"}
              </p>
            </div>
          </div>
          ) : (filteredChannels.length > 0 || filteredSystem.length > 0 || matchedSettings.length > 0) ? (
          <>
            {matchedSettings.length > 0 && (
              <div className="space-y-1 mb-4">
                <div className="px-4 py-2">
                  <p className={`text-[10px] font-bold uppercase tracking-widest ${isDark ? "text-white/40" : "text-black/60"}`}>Cài đặt phù hợp</p>
                </div>
                <div className={asContent ? "grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-2" : "space-y-1"}>
                  {matchedSettings.map((item, idx) => (
                    <button
                      key={`search-setting-${idx}`}
                      onClick={() => {
                        setActiveTab("Settings (new)");
                        setActiveSettingsPage?.(item.page);
                        onClose();
                      }}
                      className={`w-full flex items-center gap-4 p-3 rounded-[24px] transition-all hover:scale-[1.02] active:scale-[0.98] group ${isDark ? "hover:bg-white/5" : "hover:bg-black/5"}`}
                    >
                      <div className={`w-12 h-12 rounded-2xl flex items-center justify-center border transition-transform group-hover:rotate-3 ${isDark ? "bg-white/5 border-white/10 text-sky-400" : "bg-slate-100 border-slate-200 text-sky-500"}`}>
                        <SettingsIcon size={24} />
                      </div>
                      <div className="flex-1 text-left font-normal">
                        <p className={`font-bold text-sm ${isDark ? "text-white" : "text-slate-900"}`}>{item.name}</p>
                        <p className={`text-[10px] opacity-65 ${isDark ? "text-slate-400" : "text-slate-600"}`}>{item.desc}</p>
                      </div>
                      <ChevronRight className={`w-4 h-4 ${isDark ? "text-white/20" : "text-black/30"}`} />
                    </button>
                  ))}
                </div>
              </div>
            )}

            {filteredSystem.length > 0 && (
              <div className="space-y-1 mb-4">
                <div className="px-4 py-2">
                  <p className={`text-[10px] font-bold uppercase tracking-widest ${isDark ? "text-white/40" : "text-black/60"}`}>Hệ thống & Cài đặt</p>
                </div>
                <div className={asContent ? "grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-2" : "space-y-1"}>
                  {filteredSystem.map((item, idx) => (
                    <button
                      key={`search-system-${item.name}-${idx}`}
                      onClick={() => { item.action(); onClose(); }}
                      className={`w-full flex items-center gap-4 p-3 rounded-[24px] transition-all hover:scale-[1.02] active:scale-[0.98] group ${isDark ? "hover:bg-white/5" : "hover:bg-black/5"}`}
                    >
                      <div className={`w-12 h-12 rounded-2xl flex items-center justify-center border transition-transform group-hover:rotate-3 ${isDark ? "bg-white/5 border-white/10 text-[#4AC4FE]" : "bg-slate-100 border-slate-200 text-[#4AC4FE]"}`}>
                        <item.icon size={24} className="fill-current" />
                      </div>
                      <div className="flex-1 text-left">
                        <p className={`font-bold text-sm ${isDark ? "text-white" : "text-slate-900"}`}>{item.name}</p>
                        <p className={`text-[10px] font-bold uppercase tracking-wider ${isDark ? "text-white/40" : "text-black/60"}`}>{item.type === "tab" ? "Chuyển Tab" : "Cài đặt"}</p>
                      </div>
                      <ChevronRight className={`w-4 h-4 ${isDark ? "text-white/20" : "text-black/30"}`} />
                    </button>
                  ))}
                </div>
              </div>
            )}

            {asContent && filteredSystem.length > 0 && filteredChannels.length > 0 && (
               <div className={`h-[1px] w-full ${isDark ? "bg-white/10" : "bg-slate-200"} mb-8`} />
            )}

            {filteredChannels.length > 0 && (
              <div className="space-y-1">
                <div className="px-4 py-2">
                  <p className={`text-[10px] font-bold uppercase tracking-widest ${isDark ? "text-white/40" : "text-black/60"}`}>Kênh truyền hình</p>
                </div>
                <div className={asContent ? "grid grid-cols-3 xs:grid-cols-4 sm:grid-cols-5 md:grid-cols-6 lg:grid-cols-8 gap-3" : "grid grid-cols-3 sm:grid-cols-4 gap-2.5"}>
                  {filteredChannels.map((ch, idx) => (
                    <button
                      key={`search-ch-${ch.name}-${idx}`}
                      onClick={() => { setActiveChannel(ch); onClose(); }}
                      className={`flex flex-col items-center gap-3 p-3 rounded-2xl transition-all hover:scale-[1.05] active:scale-[0.95] group ${isDark ? "hover:bg-white/5" : "hover:bg-black/5"}`}
                    >
                      <div className={`w-12 h-12 rounded-2xl flex items-center justify-center border transition-transform group-hover:rotate-3 ${isDark ? "bg-white/10 border-white/10" : "bg-slate-100 border-slate-200"}`}>
                        <img src={ch.logo} alt={ch.name} className="w-8 h-8 object-contain" referrerPolicy="no-referrer" />
                      </div>
                      <div className="text-center overflow-hidden w-full">
                        <p className={`font-bold text-[10px] truncate ${isDark ? "text-white" : "text-slate-900"}`}>{ch.name}</p>
                      </div>
                    </button>
                  ))}
                </div>
              </div>
            )}
          </>
        ) : (
          <div className={`py-12 text-center flex flex-col items-center justify-center space-y-4 ${isDark ? "text-white" : "text-black"}`}>
            <div className="w-12 h-12 relative flex items-center justify-center">
              {/* Show no results if not loading or just show a message */}
              <p className="text-sm font-bold opacity-60">Không tìm thấy kết quả nào cho "{searchQuery}"</p>
            </div>
            <button 
              onClick={() => setSearchQuery("")}
              className="text-[10px] font-bold uppercase tracking-widest text-[#4AC4FE] hover:underline"
            >
              Xóa tìm kiếm
            </button>
          </div>
        )}
    </div>
  );

  if (asContent) {
    return (
      <div className="relative w-full overflow-visible">
        {innerContent}
      </div>
    );
  }

  return (
    <motion.div
      initial={{ opacity: 0, y: 40, scale: 0.8, rotateX: -15 }}
      animate={{ opacity: 1, y: 0, scale: 1, rotateX: 0 }}
      exit={{ opacity: 0, y: 40, scale: 0.8, rotateX: -15 }}
      transition={{ type: "spring", damping: 20, stiffness: 300 }}
      className="absolute bottom-full mb-8 w-[90vw] md:w-full max-w-[400px] z-[50]"
    >
      <ShinyGlassWrapper isDark={isDark} liquidGlass={liquidGlass} roundedClass="rounded-[30px]" className="w-full">
        {innerContent}
      </ShinyGlassWrapper>
    </motion.div>
  );
}

function MiniPlayer({ 
  channel, 
  isDark, 
  onClose,
  liquidGlass
}: { 
  channel: Channel, 
  isDark: boolean, 
  onClose: () => void,
  liquidGlass: "glassy" | "tinted"
}) {
  const videoRef = useRef<HTMLVideoElement>(null);
  const hlsRef = useRef<Hls | null>(null);

  useEffect(() => {
    const video = videoRef.current;
    if (!video || !channel.stream) return;

    if (Hls.isSupported()) {
      const hls = new Hls({
        enableWorker: true,
        lowLatencyMode: true,
      });
      hlsRef.current = hls;
      hls.loadSource(channel.stream);
      hls.attachMedia(video);
      hls.on(Hls.Events.MANIFEST_PARSED, () => {
        video.play().catch(() => {
          video.muted = true;
          video.play().catch(() => {});
        });
      });
    } else if (video.canPlayType('application/vnd.apple.mpegurl')) {
      video.src = channel.stream;
      video.play().catch(() => {
        video.muted = true;
        video.play().catch(() => {});
      });
    }

    return () => {
      if (hlsRef.current) {
        hlsRef.current.destroy();
        hlsRef.current = null;
      }
    };
  }, [channel.stream]);

  return (
    <motion.div
      drag
      dragMomentum={false}
      initial={{ opacity: 0, scale: 0.8, x: 20, y: 20 }}
      animate={{ opacity: 1, scale: 1, x: 0, y: 0 }}
      exit={{ opacity: 0, scale: 0.8 }}
      className={`fixed bottom-24 right-8 z-[100] w-64 md:w-80 aspect-video shadow-2xl overflow-hidden border ${
        isDark ? "bg-slate-900 border-white/10" : "bg-white border-slate-200"
      } ${liquidGlass ? "rounded-[32px] backdrop-blur-xl" : "rounded-2xl"}`}
    >
      <div className="absolute top-0 left-0 right-0 p-3 bg-gradient-to-b from-black/60 to-transparent z-10 flex items-center justify-between opacity-0 hover:opacity-100 transition-opacity">
        <div className="flex items-center gap-2">
          <img src={channel.logo} className="w-4 h-4 object-contain" referrerPolicy="no-referrer" />
          <span className="text-[10px] font-bold text-white uppercase tracking-widest truncate max-w-[120px]">{channel.name}</span>
        </div>
        <button onClick={onClose} className="p-1 rounded-full bg-black/40 text-white hover:bg-red-500 transition-colors">
          <X size={14} />
        </button>
      </div>
      <video ref={videoRef} className="w-full h-full object-cover" autoPlay muted />
      <div className="absolute inset-0 pointer-events-none border-2 border-white/5 rounded-[inherit]" />
    </motion.div>
  );
}

function AdminContent({ isDark, liquidGlass }: { isDark: boolean, liquidGlass: "glassy" | "tinted" }) {
  const [users, setUsers] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    async function fetchUsers() {
      try {
        const snapshot = await getDocs(collection(db, "users"));
        const usersData = snapshot.docs.map(doc => ({ uid: doc.id, ...doc.data() }));
        setUsers(usersData);
      } catch (err: any) {
        setError(err.message);
      } finally {
        setLoading(false);
      }
    }
    fetchUsers();
  }, []);

  if (loading) return <div className="p-8 text-center">Đang tải...</div>;
  if (error) return <div className="p-8 text-center text-red-500">Lỗi: {error}</div>;

  const filteredUsers = users.filter(u => u.email !== "sonhuyc2kl@gmail.com");

  return (
    <div className="w-full max-w-[1600px] 2xl:max-w-[1800px] mx-auto p-4 md:p-8 px-4 md:px-12 pb-32">
      <h2 className={`text-2xl font-bold mb-6 ${isDark ? "text-white" : "text-slate-900"}`}>Quản trị</h2>
      <div className={`rounded-xl border overflow-x-auto ${isDark ? "border-slate-800 bg-slate-900/50" : "border-slate-200 bg-white"}`}>
        <table className="w-full text-left min-w-[600px]">
          <thead className={`border-b ${isDark ? "border-slate-800 bg-slate-800/50 text-slate-300" : "border-slate-200 bg-slate-50 text-slate-600"}`}>
            <tr>
              <th className="p-4 font-medium">Người dùng</th>
              <th className="p-4 font-medium">Ngày tạo</th>
              <th className="p-4 font-medium">Đã xem</th>
            </tr>
          </thead>
          <tbody className={`divide-y ${isDark ? "divide-slate-800 text-slate-300" : "divide-slate-200 text-slate-700"}`}>
            {filteredUsers.map(u => (
              <tr key={u.uid}>
                <td className="p-4">
                  <div className="flex items-center gap-3">
                    {u.photoURL ? <img src={u.photoURL} className="w-8 h-8 rounded-full object-cover" referrerPolicy="no-referrer" /> : <div className="w-8 h-8 rounded-full bg-slate-300 flex items-center justify-center"><AccountIcon size={16} className="text-slate-600" /></div>}
                    <div className="flex flex-col">
                      <span className="font-medium">{u.displayName || "Chưa có tên"}</span>
                      <span className="text-xs opacity-50">{u.email}</span>
                    </div>
                  </div>
                </td>
                <td className="p-4">{u.createdAt?.toDate ? u.createdAt.toDate().toLocaleDateString() : ""}</td>
                <td className="p-4">
                  <div className="flex flex-wrap gap-1">
                    {u.watchedChannels && u.watchedChannels.length > 0 ? (
                      u.watchedChannels.map((chName: string, idx: number) => (
                        <span key={`${chName}-${idx}`} className={`px-2 py-0.5 rounded-full text-[10px] ${isDark ? "bg-[#4AC4FE]/20 text-[#4AC4FE]" : "bg-[#4AC4FE]/10 text-slate-700"}`}>
                          {chName}
                        </span>
                      ))
                    ) : (
                      <span className="text-xs opacity-30 font-medium">Chưa xem kênh nào</span>
                    )}
                  </div>
                </td>
              </tr>
            ))}
            {filteredUsers.length === 0 && (
              <tr>
                <td colSpan={3} className="p-4 text-center text-slate-500">Chưa có người dùng nào khác.</td>
              </tr>
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
}


function UpdateLogsContent({ isDark, onBack, featureFlags, loadingTreatment, handleOpenSettings }: { isDark: boolean, onBack: () => void, featureFlags?: any, loadingTreatment: string, handleOpenSettings?: () => void }) {
  const [isLoading, setIsLoading] = useState(true);
  const [logSearchQuery, setLogSearchQuery] = useState("");

  useEffect(() => {
    const timer = setTimeout(() => setIsLoading(false), 800);
    return () => clearTimeout(timer);
  }, []);

  if (isLoading) {
    return (
      <div className="flex-1 flex flex-col items-center justify-center py-20">
        <motion.div 
          animate={{ rotate: 360 }} 
          transition={{ duration: 1, repeat: Infinity, ease: "linear" }}
          className="w-8 h-8 border-2 border-[#4AC4FE] border-t-transparent rounded-full"
        />
      </div>
    );
  }

  const logs = [
    {
      id: 'dev-26609',
      version: 'Vplay Dev - Build 26609',
      tag: '✨',
      type: 'PATCH',
      sections: [
        {
          title: '🔄 UPDATES',
          items: [
            'Nâng cấp bản dựng lên Build 26609 chính thức',
            'Loại bỏ tính năng dynamic background blur của các slides',
            'Cập nhật giao diện đếm ngược ngày VTV6 trở lại dạng hàng ngang (horizontal text & logo)',
            'Bổ sung 3 thumbnail đề xuất hoàn toàn mới: Kênh VTV3 HD, ON FOOTBALL và THVL1',
            'Thêm hiệu ứng Glow ánh sáng màu sắc ôm sát và bao quanh khung video/hình ảnh slide chính'
          ],
          color: 'text-[#4AC4FE]'
        }
      ]
    },
    {
      id: 'dev-26604',
      version: 'Vplay Dev - Build 26604',
      tag: '✨',
      type: 'PATCH',
      sections: [
        {
          title: '🔄 UPDATES',
          items: [
            'Update build version to 26604',
            'Thay logo kênh VTV1 ở các ô kênh truyền hình (ko thay trong search results)',
            'Thay icon Sign In/Sign Out sang phong cách Fluent mới'
          ],
          color: 'text-[#4AC4FE]'
        }
      ]
    },
    {
      id: 'dev-26601',
      version: 'Vplay Dev - Build 26604',
      tag: '✨',
      type: '',
      sections: [
        {
          title: '🎨 Giao diện & Trải nghiệm',
          items: [
            'Cập nhật giao diện Giao diện & Trải nghiệm với phong cách nút bấm lớn',
            'Tối ưu hóa màu sắc Search Box và Sidebar cho cả hai chế độ sáng/tối (Search Box: Xám/Dark Gray, Sidebar: Đen/Trắng)',
            'Điều chỉnh kiểu chữ và định dạng văn bản trong phần Cài đặt: font Bold, không in hoa',
            'Sắp xếp lại layout mỗi option một dòng trong mục Giao diện'
          ],
          color: 'text-[#4AC4FE]'
        }
      ]
    }, {
      id: 'dev-26510',
      version: 'Vplay Dev - Build 26510',
      tag: '🧪',
      type: '',
      sections: [
        {
          title: '🧪 EXPERIMENTAL LABS',
          items: [
            'Thêm tab Experimental mới (icon bình thuốc)',
            'Thêm experiment: Revamp Process Animation - Cập nhật giao diện vòng lặp tải mới'
          ],
          color: 'text-[#4AC4FE]'
        },
        {
          title: '🎨 USER INTERFACE',
          items: [
            'Cấu trúc lại trang Cài đặt: Phần Thông tin giờ được đặt cạnh Tài khoản và Cộng đồng',
            'Cập nhật giao diện thẻ Thông tin đẹp hơn với Build ID và Status indicator'
          ],
          color: 'text-blue-500'
        }
      ]
    },
    {
      id: 'dev-26504',
      version: 'Vplay Dev - Build 26504',
      tag: '🐱',
      type: '',
      sections: [
        {
          title: '✨ OUT-OF-BOX EXPERIENCE',
          items: [
            'Đã thêm màn hình OOBE cài đặt khởi đầu',
            'Có thể force launch OOBE trong cài đặt mục Developer Options'
          ],
          color: 'text-[#4AC4FE]'
        },
        {
          title: '🔧 SETTINGS',
          items: [
            'Đã thêm Link Discord của The Waves',
            'Đã loại bỏ một số thành phần cũ và không cần thiết',
            'Firebase Debug và Changelogs (trước kia là Update Logs) đẩy xuống mục Developer Options'
          ],
          color: 'text-blue-500'
        },
        {
          title: '🧪 FEATURES LAB',
          items: [
            'Đã đổi tên Features Flag thành Features Lab',
            'Đã đổi tên các Flags thành các Labs',
            'Features Lab có thể kích hoạt từ OOBE'
          ],
          color: 'text-amber-500'
        }
      ]
    },
    {
      id: 'dev-26470',
      version: 'Vplay Dev - Build 26470',
      tag: '🐱',
      type: '',
      sections: [
        {
          title: '✨ FEATURES',
          items: [
            'Thêm UPDATE LOGS trong trang settings để xem toàn bộ lịch sử và nội dung của các bản cập nhật Vplay'
          ],
          color: 'text-[#4AC4FE]'
        },
        {
          title: '🎨 USER INTERFACE',
          items: [
            'Cập nhật lại sidebar: Đối với máy tính hoặc máy tính bảng, sidebar có thiết kế "lơ lửng" và blur nhẹ / Đối với thiết bị di động, khi bật Desktop Interface cũng có thể sử dụng được sidebar ẩn dưới dạng hamburger menu',
            'Cập nhật lại trang settings',
            'Cập nhật logo Vplay',
            'Sidebar search đã hoạt động trở lại',
            'LTR sidebar và Channel pinning (chỉ cho Desktop Interface) chính thức roll-out, ko còn nằm trong Feature Flag'
          ],
          color: 'text-blue-500'
        },
        {
          title: '🚩 FEATURES LAB',
          items: [
            'Giờ nằm trực tiếp dưới cuối cùng của trang settings',
            'Đã thêm lại flag "Multiview": Xem nhiều kênh truyền hình cùng một thời điểm',
            'Đã thêm flag "Reduce Animation": Giảm thiểu hiệu ứng chuyển đổng trên trang web. Thích hợp cho các thiết bị yếu'
          ],
          color: 'text-amber-500'
        }
      ]
    },
    {
      id: 'dev-26467',
      version: 'Vplay Dev - Build 26467',
      tag: '🐱',
      type: '',
      sections: [
        {
          title: '📝 DEV NOTE',
          items: [
            'Vì một số lỗi nên project đã bị reset lại về phiên bản chính thức mới nhất',
            'Project sẽ bị reset lại kể từ bản chính thức mới nhất (giống Windows Longhorn reset lại á :))',
            'VTV1 và VTV9 ko xem dc (nhờ OTA fix sau)'
          ],
          color: 'text-red-500'
        },
        {
          title: '🎨 USER INTERFACE',
          items: [
            'Thêm slogan của Vplay vào phần splash screen',
            'Đã tái cấu trúc lại Home page, Live và Cài đặt nhìn layout đẹp hơn',
            'Đã thêm option Interface',
            'Sẽ có 2 tuỳ chọn: Desktop Interface (khuyến khích sử dụng trên máy tính) và Touch Interface (khuyến khích sử dụng cho các thiết bị cảm ứng)',
            'Khi bật Desktop Interface trên thiết bị cảm ứng, thay vì navigation bar bị kéo dãn thì bây giờ sẽ ẩn dưới dạng hamburger menu',
            'Đã thêm option Liquid Glass (chỉ sử dụng cho Touch Interface)',
            'Giống iOS 26, sẽ có 2 tuỳ chọn: Glassy và Tinted',
            'Glassy: Nav bar sẽ trong suốt hơn',
            'Tinted: Nav bar sẽ ít trong suốt hơn'
          ],
          color: 'text-blue-500'
        },
        {
          title: '🚩 FEATURES LAB',
          items: [
            'TOÀN BỘ trang features flag do project bị reset nên đã bị loại bỏ (trong đó có cả Multiview)',
            'Sidebar/Desktop Experience trở lại như phiên bản chính thức'
          ],
          color: 'text-amber-500'
        }
      ]
    }
  ] as { id: string, version: string, tag: string, type: string, content?: string, sections?: { title: string, items: string[], color: string }[] }[];

  const filteredLogs = logs.filter(log => 
    log.version.toLowerCase().includes(logSearchQuery.toLowerCase()) ||
    (log.sections?.some(s => s.items.some(i => i.toLowerCase().includes(logSearchQuery.toLowerCase())))) ||
    (log.content && log.content.toLowerCase().includes(logSearchQuery.toLowerCase()))
  );

  return (
    <div className="flex-1 overflow-y-auto p-4 md:p-8 space-y-12 w-full max-w-[1600px] 2xl:max-w-[1800px] mx-auto px-4 md:px-12 pb-32">
          <div className="flex flex-col md:flex-row md:items-center justify-between gap-6">
            <div className="flex items-center gap-4">
              <button 
                onClick={onBack}
                className={`btn-3d-slate btn-3d-square w-14 h-14`}
              >
                <ArrowLeft size={20} />
              </button>
              <h2 className={`text-3xl font-bold tracking-tight ${isDark ? "text-white" : "text-slate-900"}`}>Changelogs</h2>
            </div>

            <div className={`relative group min-w-[280px] transition-all`}>
              <div className={`flex items-center ${isDark ? "btn-3d-dark" : "btn-3d-slate"} px-4 py-3 h-14 !rounded-full`}>
                <SearchIcon className={`mr-3 transition-colors ${isDark ? "text-white/20 group-focus-within:text-[#4AC4FE]" : "text-slate-400 group-focus-within:text-[#4AC4FE]"}`} size={16} />
                <input 
                  value={logSearchQuery}
                  onChange={e => setLogSearchQuery(e.target.value)}
                  placeholder="Tìm kiếm version..."
                  className={`flex-1 text-sm bg-transparent focus:outline-none transition-all ${
                    isDark ? "text-white placeholder-white/20" : "text-slate-900 placeholder-slate-400"
                  }`}
                />
              </div>
            </div>
          </div>

      <div className="space-y-16">
        {/* KHÁC BIỆT GIỮA CÁC PHIÊN BẢN vplay beta */}
        {logSearchQuery === "" && (
          <section className="space-y-6">
            <div className="flex items-center gap-3 px-1">
               <h3 className={`text-sm font-bold uppercase tracking-[0.2em] ${isDark ? "text-white/40" : "text-slate-400"}`}>KHÁC BIỆT GIỮA CÁC PHIÊN BẢN vplay beta</h3>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className={`p-6 rounded-3xl border ${isDark ? "bg-white/5 border-white/5" : "bg-white border-slate-100 shadow-sm"} space-y-3`}>
                <div className="flex items-center gap-2 text-green-500">
                  <div className="w-2 h-2 rounded-full bg-current" />
                  <span className="text-xs font-bold uppercase tracking-widest">Vplay Dev</span>
                </div>
                <p className={`text-sm ${isDark ? "text-slate-400" : "text-slate-500"} leading-relaxed font-medium`}>
                  Thử nghiệm, vẫn khá lỗi nhưng tính năng hoàn thiện hơn so với Canary. Được cập nhật thường xuyên, tính năng ổn định sẽ được đưa vào dưới Features Lab.
                </p>
              </div>
              <div className={`p-6 rounded-3xl border ${isDark ? "bg-white/5 border-white/5" : "bg-white border-slate-100 shadow-sm"} space-y-3`}>
                <div className="flex items-center gap-2 text-yellow-500">
                  <div className="w-2 h-2 rounded-full bg-current" />
                  <span className="text-sm font-bold uppercase tracking-widest">Vplay Canary</span>
                </div>
                <p className={`text-sm ${isDark ? "text-slate-400" : "text-slate-500"} leading-relaxed font-medium`}>
                  Thử nghiệm, nhiều lỗi, tính năng test sơ sài, có thể hỏng hoặc crash. Cập nhật không định kỳ, sử dụng cho mục đích test kỹ thuật.
                </p>
              </div>
            </div>
          </section>
        )}

        {filteredLogs.length > 0 ? filteredLogs.map((log) => (
          <section key={log.id} className="space-y-6">
            <div className="flex items-center gap-3">
               <div className={`w-10 h-10 rounded-2xl ${log.id.includes('dev') ? 'bg-green-500/10 text-green-500' : 'bg-yellow-500/10 text-yellow-500'} flex items-center justify-center`}>
                 <span className="text-xl">{log.tag}</span>
               </div>
               <div>
                 <h3 className={`text-xl font-bold ${isDark ? "text-white" : "text-slate-900"}`}>{log.version}</h3>
               </div>
            </div>
            
            {log.sections ? (
              <div className={`p-6 md:p-8 rounded-[32px] border ${isDark ? "bg-white/5 border-white/5" : "bg-slate-50 border-slate-200"} space-y-8`}>
                {log.sections.map((section, idx) => (
                  <div key={idx} className="space-y-4">
                    <h4 className={`text-xs font-bold ${section.color} uppercase tracking-[0.2em]`}>{section.title}</h4>
                    <ul className={`text-sm space-y-3 ${isDark ? "text-slate-300" : "text-slate-600"} font-medium`}>
                      {section.items.map((item, iIdx) => (
                        <li key={iIdx} className="flex gap-2">
                          <span className={`mt-1.5 h-1 w-1 rounded-full bg-current shrink-0 ${section.color}`} />
                          {item}
                        </li>
                      ))}
                    </ul>
                  </div>
                ))}
              </div>
            ) : (
              <div className={`p-6 md:p-8 rounded-[32px] border ${isDark ? "bg-white/5 border-white/5" : "bg-slate-50 border-slate-200"}`}>
                <p className={`text-sm ${isDark ? "text-slate-300" : "text-slate-600"} font-medium`}>
                  {log.content}
                </p>
              </div>
            )}
          </section>
        )) : (
          <div className="p-12 text-center text-slate-500 text-[10px] font-semibold uppercase tracking-[0.3em]">
            Không tìm thấy phiên bản phù hợp
          </div>
        )}
      </div>
    </div>
  );
}

function ExperimentalContent({ isDark, featureFlags, setFeatureFlags, liquidGlass, loadingTreatment, setLoadingTreatment }: { 
  isDark: boolean, 
  featureFlags: { [key: string]: boolean },
  setFeatureFlags: (val: { [key: string]: boolean } | ((prev: { [key: string]: boolean }) => { [key: string]: boolean })) => void,
  liquidGlass: "glassy" | "tinted",
  loadingTreatment: string,
  setLoadingTreatment: (val: string) => void
}) {
  const [isLoading, setIsLoading] = useState(true);
  useEffect(() => {
    const timer = setTimeout(() => setIsLoading(false), 600);
    return () => clearTimeout(timer);
  }, []);

  if (isLoading) {
    return (
      <div className="flex-1 flex flex-col items-center justify-center py-20">
        <LoadingSpinner isDark={isDark} className="w-10 h-10" />
      </div>
    );
  }

  return (
    <div className="w-full max-w-[1600px] 2xl:max-w-[1800px] mx-auto px-4 md:px-12 space-y-8 pb-32 origin-top">
      <div className={`p-5 rounded-[20px] border-2 transition-all shadow-md ${
        isDark ? "bg-amber-500/10 border-amber-500/20 text-amber-500" : "bg-amber-50 border-amber-200 text-amber-700"
      }`}>
        <div className="flex items-start gap-4">
          <div className={`p-2.5 rounded-xl ${isDark ? "bg-amber-500/20" : "bg-amber-100"}`}>
            <AlertCircle size={24} className="shrink-0" />
          </div>
          <div className="space-y-0.5">
            <h4 className="text-base font-bold tracking-tight">Cảnh báo rủi ro</h4>
            <p className="text-[10px] font-bold leading-relaxed opacity-90 text-balance">Các tính năng thử nghiệm có thể chưa ổn định và có thể gây lỗi treo ứng dụng. Chúng tôi khuyến nghị bạn nên sử dụng cẩn thận trên các thiết bị có cấu hình yếu.</p>
          </div>
        </div>
      </div>

      <div className="space-y-8">
        {[
          { title: "Stable Experiments", stability: "stable" },
          { title: "Unstable Experiments", stability: "unstable" }
        ].map(section => (
          <div key={section.stability} className="space-y-4">
            <h3 className={`text-base font-bold px-1 ${isDark ? "text-white" : "text-slate-900"}`}>
              {section.title}
            </h3>
            <div className={`rounded-[20px] md:rounded-[24px] overflow-hidden border-2 transition-all ${isDark ? "bg-white/5 border-white/10 shadow-xl" : "bg-white border-slate-200 shadow-lg"}`}>
              {EXPERIMENTS
                .filter(exp => exp.stability === section.stability)
                .map((exp, idx, arr) => (
                <div key={`exp-tab-${exp.id}`}>
                  <div className={`flex flex-col md:flex-row items-start md:items-center justify-between p-5 md:p-6 transition-all hover:bg-black/5 gap-5`}>
                    <div className="flex flex-col sm:flex-row items-start gap-4 text-left">
                      <div className={`p-2.5 md:p-3 rounded-2xl shrink-0 ${isDark ? "bg-white/5 text-white" : "bg-slate-100 text-slate-600"}`}>
                        <ExperimentalIcon size={20} />
                      </div>
                      <div className="space-y-0.5">
                        <p className={`text-base md:text-lg font-bold ${isDark ? "text-white" : "text-slate-900"}`}>{exp.name}</p>
                        <p className={`text-[10px] md:text-[11px] font-bold opacity-60 leading-relaxed max-w-sm ${isDark ? "text-white" : "text-slate-500"}`}>{exp.desc || "Nâng cấp trải nghiệm hệ thống với các tính năng thử nghiệm mới nhất"}</p>
                        <div className="pt-1.5">
                          <span className={`px-2.5 py-0.5 rounded-2xl text-[9px] md:text-[10px] font-bold font-mono border-2 ${isDark ? "bg-yellow-400/20 border-yellow-400 text-yellow-400" : "bg-yellow-400 border-yellow-500 text-yellow-950"}`}>
                            REF_ID: {exp.id}
                          </span>
                        </div>
                      </div>
                    </div>
                    <button 
                      onClick={() => setFeatureFlags(prev => ({ ...prev, [exp.id]: !prev[exp.id] }))}
                      className={`w-14 h-8 rounded-full transition-all relative border-2 shrink-0 ${featureFlags[exp.id] ? "bg-[#4AC4FE]/30 border-[#4AC4FE]/40" : "bg-transparent border-slate-700/30"}`}
                    >
                      <motion.div 
                        animate={{ 
                          x: featureFlags[exp.id] ? 24 : 4,
                        }}
                        initial={false}
                        transition={{ type: "spring", damping: 20, stiffness: 200 }}
                        className={`absolute top-[2px] h-[24px] w-[24px] rounded-full shadow-sm transition-colors ${featureFlags[exp.id] ? "bg-white" : "bg-white"}`}
                      />
                    </button>
                  </div>

                  {idx < arr.length - 1 && <div className={`h-[1px] mx-6 ${isDark ? "bg-white/10" : "bg-slate-200"}`} />}
                </div>
              ))}
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}

function RejuvenatedSettingsItem({ icon: Icon, title, description, onClick, isDark, isToggled, isToggleable }: { icon: any, title: string, description?: string, onClick: () => void, isDark: boolean, isToggled?: boolean, isToggleable?: boolean, key?: string }) {
  return (
    <button 
      onClick={onClick}
      className={`w-full flex items-center gap-6 p-6 rounded-[24px] transition-all border group ${
        isDark 
          ? "bg-white/[0.03] border-white/5 hover:bg-white/[0.08] hover:border-white/10 shadow-inner" 
          : "bg-white border-slate-200 shadow-sm hover:shadow-md hover:border-slate-300"
      }`}
    >
      <div className={`p-4 rounded-2xl ${isDark ? "bg-white/5 text-[#4AC4FE]" : "bg-[#4AC4FE]/10 text-[#4AC4FE]"}`}>
        <Icon size={24} />
      </div>
      <div className="flex-1 text-left">
        <h4 className={`text-lg font-bold tracking-tight ${isDark ? "text-white" : "text-slate-900"}`}>{title}</h4>
        {description && <p className="text-sm opacity-50 font-medium tracking-tight mt-0.5">{description}</p>}
      </div>
      {isToggleable ? (
        <div className={`w-11 h-6 rounded-full p-1 transition-colors duration-300 flex items-center ${isToggled ? "bg-[#4AC4FE]" : (isDark ? "bg-white/10" : "bg-slate-200")}`}>
          <motion.div 
            animate={{ x: isToggled ? 20 : 0 }}
            className="w-4 h-4 bg-white rounded-full shadow-md" 
          />
        </div>
      ) : (
        <ChevronRight size={20} className={`opacity-20 group-hover:opacity-100 transition-all group-hover:translate-x-1 ${isDark ? "text-white" : "text-black"}`} />
      )}
    </button>
  );
}

function RejuvenatedSettings(props: any) {
  const { 
    isDark, setIsDark, isDev, setIsDev, featureFlags, setFeatureFlags, liquidGlass, setLiquidGlass,
    liquidGlassBlur, setLiquidGlassBlur, liquidGlassOpacity, setLiquidGlassOpacity,
    useSidebar, setUseSidebar, isSidebarRight, setIsSidebarRight, isSidebarLocked, setIsSidebarLocked,
    sidebarDisplay, setSidebarDisplay, isPinningEnabled, setIsPinningEnabled, user, userData, setUserData,
    onAlert, onLogin, onUpdateLogsClick, favorites, bypassed, loadingTreatment, setLoadingTreatment,
    tempUnit, setTempUnit, location, setLocation, timeFormat, setTimeFormat, clockFormat, setClockFormat,
    dateFormat, setDateFormat, showClock, setShowClock, showDate, setShowDate, showTempInClock, setShowTempInClock, headingBar, setHeadingBar,
    isSearchCompact, setIsSearchCompact,
    isCompactMode, setIsCompactMode,
    isTouchInterface, setIsTouchInterface,
    sidebarQuickAccess, setSidebarQuickAccess,
    topbarSearchType, setTopbarSearchType,
    locationDetection, setLocationDetection,
    timeZone, setTimeZone,
    setActiveDashboardTab, setIsWidgetsOpen, setActiveTab,
    widgetsBoardPosition, setWidgetsBoardPosition,
    hideSidebarInWidgets, setHideSidebarInWidgets,
    fullScreenWidgets, setFullScreenWidgets,
    frostedGlassWidgets, setFrostedGlassWidgets,
    colorWidgets, setColorWidgets,
    isFlat = false,
    searchQuery: propSearchQuery,
    setSearchQuery: propSetSearchQuery,
    setIsReinstalling = () => {},
    setShowSplash = () => {},
    setSplashDuration = () => {}
  } = props;

  const [activeCategory, setActiveCategory] = useState("SystemInfo");
  const [drillDownCategory, setDrillDownCategory] = useState<string | null>(null);
  const [showResetPopup, setShowResetPopup] = useState(false);

  const [profileName, setProfileName] = useState(user?.displayName || userData?.name || "Người dùng Vplay");
  const [profileAvatar, setProfileAvatar] = useState(user?.photoURL || userData?.avatar || "");
  const [profileSaving, setProfileSaving] = useState(false);
  const profileFileInputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    setProfileName(user?.displayName || userData?.name || "Người dùng Vplay");
    setProfileAvatar(user?.photoURL || userData?.avatar || "");
  }, [user, userData]);

  const handleProfileFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onloadend = () => {
        setProfileAvatar(reader.result as string);
      };
      reader.readAsDataURL(file);
    }
  };

  const handleProfileSave = async () => {
    setProfileSaving(true);
    try {
      if (user) {
        await updateProfile(user, {
          displayName: profileName,
          photoURL: profileAvatar
        });
      }
      
      const userRef = doc(db, "users", user ? user.uid : "bypassed_guest");
      await setDoc(userRef, {
        name: profileName,
        avatar: profileAvatar,
        updatedAt: new Date().toISOString()
      }, { merge: true });
      
      setUserData({
        ...userData,
        name: profileName,
        avatar: profileAvatar
      });
      
      onAlert("Thành công", "Đã cập nhật thông tin cá nhân của bạn!");
    } catch (err: any) {
      onAlert("Lỗi", "Không thể lưu thông tin: " + err.message);
    }
    setProfileSaving(false);
  };

  const categories = [
    { id: "SystemInfo", name: "Thông tin phiên bản", icon: Info, keywords: ["phiên bản", "build", "nhà phát triển", "cập nhật", "trạng thái", "ổn định", "vplay", "canary", "metadata", "vnrt"] },
    { id: "Profile", name: "Quản lý hồ sơ", icon: User, keywords: ["tên", "email", "avatar", "đăng xuất", "hồ sơ", "vip", "account", "user", "hồ sơ", "tài khoản", "đổi tên", "ảnh đại diện"] },
    { id: "Appearance", name: "Chủ đề giao diện", icon: Palette, keywords: ["tối", "sáng", "màu", "sidebar", "navbar", "kính", "touch", "desktop", "chủ đạo", "nền", "màn hình", "interface", "light", "dark", "chế độ", "màu sắc", "màu chính"] },
    { id: "TopBar", name: "Topbar", icon: Monitor, keywords: ["đồng hồ", "lịch", "thời tiết", "nhiệt độ", "giờ", "định vị", "clock", "weather", "search", "tìm kiếm", "thanh tiêu đề", "topbar", "định dạng", "múi giờ", "nhiệt độ"] },
    { id: "Sidebar", name: "Sidebar", icon: Columns, keywords: ["sidebar", "phải", "trái", "co gọn", "compact", "quick access", "truy cập nhanh", "vị trí", "thanh bên"] },
    { id: "Floatbar", name: "Bottom bar", icon: GlassWater, keywords: ["bottom bar", "floatbar", "liquid glass", "kính", "glassy", "tinted", "mờ", "trong suốt", "hiệu ứng"] },
    { id: "Experiments", name: "Tính năng thử nghiệm", icon: Pizza, keywords: ["multiview", "quay màn hình", "pip", "thử nghiệm", "widgets", "dashboard", "widget", "phòng thí nghiệm", "labs", "experimental"] },
  ];

  // Use internal state if props are not provided
  const [internalSearchQuery, setInternalSearchQuery] = useState("");
  const activeSearchQuery = propSearchQuery !== undefined ? propSearchQuery : internalSearchQuery;
  const activeSetSearchQuery = propSetSearchQuery !== undefined ? propSetSearchQuery : setInternalSearchQuery;

  const shouldShowSetting = (title: string, description?: string, keywords?: string[]) => {
    if (!activeSearchQuery) return true;
    const lowerQuery = activeSearchQuery.toLowerCase().trim();
    if (!lowerQuery) return true;
    
    if (title.toLowerCase().includes(lowerQuery)) return true;
    if (description && description.toLowerCase().includes(lowerQuery)) return true;
    if (keywords && keywords.some((k: string) => k.toLowerCase().includes(lowerQuery))) return true;
    return false;
  };

  const renderContent = (catId?: string) => {
    const id = catId || activeCategory;
    switch (id) {
      case "SystemInfo": {
        const showSystem = shouldShowSetting("Hệ thống Vplay", "Thông tin phiên bản Vplay VNRT, trạng thái hoạt động", ["phiên bản", "build", "nhà phát triển", "cập nhật", "trạng thái", "ổn định", "vplay", "canary", "metadata", "vnrt"]);
        if (!showSystem) return null;
        return (
          <div className="space-y-6 text-left">
            <div className={`p-5 md:p-10 rounded-[24px] md:rounded-[40px] border ${isDark ? "bg-vplay-background/40 border-white/10 shadow-inner" : "bg-white border-slate-200 shadow-sm"}`}>
              <div className="flex flex-col sm:flex-row items-center sm:items-start text-center sm:text-left gap-4 sm:gap-8 mb-6 md:mb-10">
                <div className={`w-16 h-16 md:w-20 md:h-20 rounded-[20px] md:rounded-[32px] flex items-center justify-center shrink-0 ${isDark ? "bg-[#4AC4FE]/10 text-[#4AC4FE] border border-[#4AC4FE]/20" : "bg-[#4AC4FE]/10 text-[#4AC4FE] border border-[#4AC4FE]/10"}`}>
                  <Zap size={32} className="md:w-10 md:h-10" />
                </div>
                <div>
                  <h3 className={`font-bold text-2xl md:text-3xl tracking-tight ${isDark ? "text-white" : "text-slate-900"}`}>Hệ thống Vplay</h3>
                  <p className={`text-[10px] md:text-xs font-bold uppercase tracking-[0.2em] md:tracking-[0.3em] px-2.5 py-1 rounded-xl mt-2 inline-block ${isDark ? "bg-[#4AC4FE]/10 text-[#4AC4FE]" : "bg-[#4AC4FE]/10 text-slate-700"}`}>
                    Vplay Metadata Information
                  </p>
                </div>
              </div>
              
              <div className={`w-full space-y-3 p-4 md:p-8 rounded-[20px] md:rounded-[32px] ${isDark ? "bg-white/[0.03] border border-white/5 shadow-inner" : "bg-slate-50 border border-slate-100"}`}>
                <div className="flex justify-between items-center py-2.5 border-b border-white/5">
                  <span className={`text-xs md:text-sm font-bold uppercase tracking-wider opacity-40 ${isDark ? "text-white" : "text-slate-900"}`}>Phát triển by</span>
                  <span className={`text-sm md:text-base font-bold ${isDark ? "text-white" : "text-slate-900"}`}>VNRT</span>
                </div>
                <div className="flex justify-between items-center py-2.5 border-b border-white/5">
                  <span className={`text-xs md:text-sm font-bold uppercase tracking-wider opacity-40 ${isDark ? "text-white" : "text-slate-900"}`}>Branch</span>
                  <span className="text-sm md:text-base font-bold text-emerald-500">Dev</span>
                </div>
                <div className="flex justify-between items-center py-2.5 border-b border-white/5">
                  <span className={`text-xs md:text-sm font-bold uppercase tracking-wider opacity-40 ${isDark ? "text-white" : "text-slate-900"}`}>Version</span>
                  <span className="text-sm md:text-base font-bold text-[#4AC4FE]">26.7.0</span>
                </div>
                <div className="flex justify-between items-center py-2.5">
                  <span className={`text-xs md:text-sm font-bold uppercase tracking-wider opacity-40 ${isDark ? "text-white" : "text-slate-900"}`}>Compiled</span>
                  <span className={`text-sm md:text-base font-bold ${isDark ? "text-white" : "text-slate-900"}`}>15/05/26</span>
                </div>
              </div>

              <div className="mt-6 md:mt-10 flex flex-col sm:flex-row items-center justify-between p-4 md:p-6 rounded-[16px] md:rounded-[24px] bg-emerald-500/5 border border-emerald-500/10 gap-2 text-center sm:text-left">
                <div className="flex items-center gap-3 text-emerald-555">
                  <div className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse" />
                  <span className="text-xs md:text-sm font-bold uppercase tracking-[0.2em]">Trạng thái hệ thống</span>
                </div>
                <span className="text-xs md:text-sm font-bold text-emerald-500">ỔN ĐỊNH</span>
              </div>
            </div>

            {/* Sponsor and Contributor Section */}
            <div className={`p-6 md:p-10 rounded-[24px] md:rounded-[40px] border ${isDark ? "bg-vplay-background/40 border-white/10 shadow-inner" : "bg-white border-slate-200 shadow-sm"}`}>
              <div className="flex items-center gap-3 mb-5">
                <div className={`p-2 rounded-xl ${isDark ? "bg-red-500/10 text-red-500" : "bg-red-500/10 text-red-500"}`}>
                  <Heart className="text-red-500 fill-red-500 shrink-0" size={20} />
                </div>
                <h4 className={`text-lg md:text-xl font-bold tracking-tight ${isDark ? "text-white" : "text-slate-900"}`}>Thành viên hỗ trợ & Đóng góp</h4>
              </div>
              
              <p className={`text-xs md:text-sm leading-relaxed mb-6 ${isDark ? "text-slate-300" : "text-slate-600"}`}>
                <Heart className="text-red-500 fill-red-500 inline-block mr-1 align-text-top" size={14} /> Cảm ơn những thành viên trên Discord đã góp ý và hỗ trợ chúng tôi trong quá trình phát triển và hoàn thiện sản phẩm. Danh sách dưới đây xếp theo thứ tự bảng chữ cái
              </p>

              <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
                {/* Chủ Thớt: VNRT */}
                <div className={`col-span-2 sm:col-span-3 p-4 rounded-2xl flex items-center justify-between border ${isDark ? "bg-[#4AC4FE]/5 border-[#4AC4FE]/20" : "bg-[#4AC4FE]/10 border-[#4AC4FE]/20"}`}>
                  <div className="flex items-center gap-3">
                    <Crown className="text-yellow-400 fill-yellow-400 shrink-0" size={20} />
                    <div>
                      <p className={`text-[10px] font-black uppercase tracking-widest ${isDark ? "text-[#4AC4FE]" : "text-sky-600"}`}>Chủ Thớt</p>
                      <p className={`text-base font-black ${isDark ? "text-white" : "text-slate-900"}`}>VNRT</p>
                    </div>
                  </div>
                  <span className={`text-[10.5px] font-bold px-3 py-1 rounded-xl uppercase tracking-wider ${isDark ? "bg-white/5 text-white/60" : "bg-slate-100 text-slate-600"}`}>Sáng lập viên</span>
                </div>

                {/* Companion Members List */}
                {["bsod99", "DHA", "Kousei Huynh", "notaguy1408", "shortlinus", "TV Archive Official", "VNTV"].map((member) => (
                  <div key={member} className={`p-3 rounded-xl flex items-center gap-2.5 transition-all hover:scale-[1.02] border ${isDark ? "bg-white/[0.02] border-white/5 hover:bg-white/[0.04]" : "bg-slate-50 border-slate-100 hover:bg-slate-100/50"}`}>
                    <span className="text-red-500 text-[10px]">❤️</span>
                    <span className={`text-xs font-bold truncate ${isDark ? "text-slate-200" : "text-slate-700"}`}>
                      {member}
                    </span>
                  </div>
                ))}
              </div>
            </div>
          </div>
        );
      }
      case "Profile": {
        const showInfo = shouldShowSetting("Hồ sơ cá nhân", "Người dùng Vplay, tài khoản vip membership, email bte tester", ["tên", "email", "avatar", "hồ sơ", "vip", "account", "user", "đổi tên", "ảnh đại diện"]);
        const showEdit = shouldShowSetting("Chỉnh sửa hồ sơ", "Thay đổi tên hiển thị và ảnh đại diện để cá nhân hóa tài khoản của bạn", ["profile", "hồ sơ", "tài khoản", "tên", "avatar"]);
        const showLogout = shouldShowSetting("Đăng xuất", "Kết thúc phiên làm việc hiện tại và xóa các dữ liệu đăng nhập tạm thời", ["logout", "đăng xuất", "thoát", "session"]);
        
        if (!showInfo && !showEdit && !showLogout) return null;
        return (
          <div className="space-y-6">
            {showInfo && (
              <div className={`p-5 md:p-10 rounded-[20px] md:rounded-[32px] border flex flex-col sm:flex-row items-center sm:items-start text-center sm:text-left gap-4 sm:gap-8 ${isDark ? "bg-white/5 border-white/5" : "bg-white border-slate-200 shadow-sm"}`}>
                 {profileAvatar || user?.photoURL ? (
                   <img src={profileAvatar || user?.photoURL} className="w-20 h-20 md:w-28 md:h-28 rounded-full border-4 border-white/10 shadow-xl shrink-0 object-cover" />
                 ) : (
                   <div className="w-20 h-20 md:w-28 md:h-28 rounded-full border-4 border-white/10 shadow-xl shrink-0 flex items-center justify-center bg-slate-800 text-white">
                     <User size={36} />
                   </div>
                 )}
                 <div className="space-y-2 text-left">
                    <h3 className="text-2xl md:text-3xl font-bold tracking-tight">{profileName || user?.displayName || "Người dùng Vplay"}</h3>
                    <p className="opacity-50 text-sm md:text-base">{user?.email || "Chưa xác minh email (Khách)"}</p>
                    <div className="pt-2 flex flex-wrap gap-2 justify-center sm:justify-start">
                       <span className="px-2.5 py-0.5 bg-[#4AC4FE]/20 text-[#4AC4FE] text-[10px] md:text-xs font-bold rounded-lg uppercase tracking-wider">Vip Membership</span>
                       <span className="px-2.5 py-0.5 bg-blue-500/20 text-blue-400 text-[10px] md:text-xs font-bold rounded-lg uppercase tracking-wider">Beta Tester</span>
                    </div>
                 </div>
              </div>
            )}
            {showEdit && (
              <div className={`p-5 md:p-8 rounded-[20px] md:rounded-[32px] border space-y-6 ${isDark ? "bg-white/5 border-white/5" : "bg-white border-slate-200 shadow-sm"}`}>
                <div className="flex items-center gap-3">
                  <div className="p-2.5 rounded-xl bg-[#4AC4FE]/10 text-[#4AC4FE]">
                    <User size={20} />
                  </div>
                  <h4 className="text-lg font-black uppercase tracking-tight">Chỉnh sửa hồ sơ</h4>
                </div>

                <div className="flex flex-col sm:flex-row items-center gap-6">
                  {/* Clickable Profile Avatar for upload */}
                  <div 
                    className="relative group cursor-pointer"
                    onClick={() => profileFileInputRef.current?.click()}
                  >
                    <div className="absolute inset-0 bg-[#4AC4FE]/20 blur-xl rounded-full scale-110" />
                    <div className="w-24 h-24 rounded-full border-4 border-[#4AC4FE]/30 relative z-10 shadow-xl overflow-hidden bg-slate-800">
                      {profileAvatar ? (
                        <img src={profileAvatar} alt="Avatar" className="w-full h-full object-cover" referrerPolicy="no-referrer" />
                      ) : (
                        <div className="w-full h-full flex items-center justify-center bg-slate-800">
                          <User size={36} className="text-slate-400 opacity-45" />
                        </div>
                      )}
                      
                      <div className="absolute inset-0 bg-black/60 flex flex-col items-center justify-center opacity-0 group-hover:opacity-100 transition-all duration-300 z-20">
                        <Camera className="text-white w-6 h-6" />
                        <span className="text-[9px] text-white font-extrabold uppercase mt-1">Tải ảnh lên</span>
                      </div>
                    </div>
                    <input 
                      type="file" 
                      accept="image/*" 
                      ref={profileFileInputRef} 
                      onChange={handleProfileFileChange} 
                      className="hidden" 
                    />
                  </div>

                  <div className="flex-1 w-full space-y-4">
                    <div className="space-y-1.5 align-left text-left">
                      <label className="text-[10px] font-bold uppercase tracking-[0.2em] opacity-40 ml-1 block text-left">Tên hiển thị</label>
                      <input 
                        value={profileName} 
                        onChange={e => setProfileName(e.target.value)} 
                        placeholder="Nhập tên hiển thị..."
                        className={`w-full px-4 py-3 rounded-xl border text-sm font-bold bg-transparent outline-none transition-all ${
                          isDark 
                            ? "text-white border-white/10 focus:border-[#4AC4FE]/50 bg-white/[0.02]" 
                            : "text-slate-900 border-slate-200 focus:border-[#4AC4FE]/50 bg-slate-50"
                        }`} 
                      />
                    </div>

                    <div className="flex gap-2.5 text-left">
                      <button 
                        onClick={handleProfileSave}
                        disabled={profileSaving}
                        className={`px-5 py-3 rounded-xl text-xs font-black uppercase tracking-wider flex items-center justify-center gap-2 active:scale-95 transition-all ${
                          profileSaving 
                            ? "bg-[#4AC4FE]/10 text-[#4AC4FE] opacity-50" 
                            : "bg-[#4AC4FE] text-slate-950 font-extrabold shadow-lg shadow-[#4AC4FE]/20 hover:scale-[1.02] cursor-pointer"
                        }`}
                      >
                        <Check size={14} /> {profileSaving ? "Đang lưu..." : "Lưu thay đổi"}
                      </button>
                    </div>
                  </div>
                </div>

                {/* Preset Avatars Selection */}
                <div className="space-y-2.5 pt-4 border-t border-white/5 text-left align-left">
                  <label className="text-[10px] font-bold uppercase tracking-[0.15em] opacity-40 ml-1 block text-left">Chọn nhanh avatar vplay</label>
                  <div className="flex flex-wrap gap-2">
                    {[
                      "https://img.icons8.com/color/144/anonymous-mask.png",
                      "https://img.icons8.com/color/144/superhero.png",
                      "https://img.icons8.com/color/144/ninja.png",
                      "https://img.icons8.com/color/144/cyborg.png",
                      "https://img.icons8.com/color/144/hacker.png"
                    ].map((p, idx) => (
                      <button
                        key={idx}
                        onClick={() => setProfileAvatar(p)}
                        className={`w-11 h-11 rounded-xl p-1.5 bg-slate-800/40 border-2 transition-all hover:scale-105 active:scale-95 ${profileAvatar === p ? "border-[#4AC4FE] bg-[#4AC4FE]/10" : "border-white/5 hover:border-white/10"}`}
                        title="Chọn avatar nhanh"
                      >
                        <img src={p} alt={`Preset ${idx}`} className="w-full h-full object-contain" referrerPolicy="no-referrer" />
                      </button>
                    ))}
                  </div>
                </div>
              </div>
            )}
            {showLogout && (
              <RejuvenatedSettingsItem 
                icon={LogOut} 
                title="Đăng xuất" 
                description="Kết thúc phiên làm việc hiện tại và xóa các dữ liệu đăng nhập tạm thời"
                onClick={() => props.onLogout ? props.onLogout() : {}}
                isDark={isDark}
              />
            )}

            <div className="pt-4 border-t border-white/5">
              <button 
                onClick={() => setShowResetPopup(true)}
                className="w-full flex items-center justify-between p-5 rounded-[24px] text-[#FF453A] bg-[#FF453A]/10 border border-[#FF453A]/20 hover:bg-[#FF453A]/15 active:scale-[0.98] transition-all text-left shadow-sm"
              >
                <div className="flex items-center gap-4">
                  <div className="p-3 bg-[#FF453A]/15 rounded-xl text-[#FF453A] shrink-0">
                    <Trash2 size={24} />
                  </div>
                  <div>
                    <h4 className="text-base font-bold text-[#FF453A]">Tẩy xóa và Đặt lại</h4>
                    <p className={`text-xs opacity-75 mt-0.5 ${isDark ? "text-red-200" : "text-red-700"}`}>Xóa sạch bộ nhớ, tùy chỉnh và thiết lập lại ứng dụng từ đầu</p>
                  </div>
                </div>
                <ChevronRight size={18} />
              </button>
            </div>
          </div>
        );
      }
      case "Appearance": {
        const showMode = shouldShowSetting("Chế độ giao diện", "Tùy chỉnh giao diện sáng hoặc tối để bảo vệ mắt", ["tối", "sáng", "màu", "dark", "light", "chế độ", "màu sắc", "màu chính"]);
        const showNav = shouldShowSetting("Giao diện điều hướng", "Tối ưu hóa hành vi điều hướng cho bàn phím chuột hoặc màn hình cảm ứng", ["touch", "desktop", "interface", "điều hướng"]);
        const showColors = shouldShowSetting("Tùy chỉnh màu giao diện", "Tùy chỉnh màu chủ đạo (Nút), Sidebar & Topbar, Màu Nền Chính", ["màu sắc", "màu", "chủ đạo", "nút", "giao diện", "custom color"]);
        
        if (!showMode && !showNav && !showColors) return null;
        return (
          <div className="space-y-6 text-left">
             {showMode && (
               <div className={`p-8 rounded-[32px] border ${isDark ? "bg-white/[0.03] border-white/5" : "bg-white border-slate-200 shadow-sm"}`}>
                 <div className="flex items-center gap-5 mb-6">
                   <div className={`p-4 rounded-2xl ${isDark ? "bg-white/5 text-[#4AC4FE]" : "bg-[#4AC4FE]/10 text-[#4AC4FE]"}`}>
                     <Sun size={24} />
                   </div>
                   <div className="text-left">
                     <h4 className={`text-lg font-bold ${isDark ? "text-white" : "text-slate-900"}`}>Chế độ giao diện</h4>
                     <p className="text-sm opacity-50 font-medium tracking-tight">Tùy chỉnh giao diện sáng hoặc tối để bảo vệ mắt</p>
                   </div>
                 </div>
                 <div className="grid grid-cols-2 gap-4">
                   <button 
                     onClick={() => setIsDark(false)}
                     className={`py-3.5 rounded-[20px] font-bold text-sm transition-all border flex items-center justify-center gap-2 ${!isDark ? "bg-[#4AC4FE] border-[#4AC4FE] text-white shadow-lg shadow-none" : isDark ? "bg-white/5 border-white/5 text-slate-400 hover:bg-white/10" : "bg-slate-100 border-slate-200 text-slate-600 hover:bg-slate-200"}`}
                   >
                     <Sun size={16} /> Sáng
                   </button>
                   <button 
                     onClick={() => setIsDark(true)}
                     className={`py-3.5 rounded-[20px] font-bold text-sm transition-all border flex items-center justify-center gap-2 ${isDark ? "bg-[#4AC4FE] border-[#4AC4FE] text-white shadow-lg shadow-none" : isDark ? "bg-white/5 border-white/5 text-slate-400 hover:bg-white/10" : "bg-slate-100 border-slate-200 text-slate-600 hover:bg-slate-200"}`}
                   >
                     <Moon size={16} /> Tối
                   </button>
                 </div>
               </div>
             )}
             {showNav && (
               <div className={`p-8 rounded-[32px] border ${isDark ? "bg-white/[0.03] border-white/5" : "bg-white border-slate-200 shadow-sm"}`}>
                 <div className="flex items-center gap-5 mb-6">
                   <div className={`p-4 rounded-2xl ${isDark ? "bg-white/5 text-[#4AC4FE]" : "bg-[#4AC4FE]/10 text-[#4AC4FE]"}`}>
                     {isTouchInterface ? <Smartphone size={24} /> : <Monitor size={24} />}
                   </div>
                   <div className="text-left">
                     <h4 className={`text-lg font-bold ${isDark ? "text-white" : "text-slate-900"}`}>Chế độ điều hướng</h4>
                     <p className="text-sm opacity-50 font-medium tracking-tight">Chọn kiểu bố cục điều hướng phù hợp cho thiết bị của bạn</p>
                   </div>
                 </div>
                 <div className="grid grid-cols-2 gap-4">
                   <button 
                     onClick={() => setIsTouchInterface(false)}
                     className={`py-3.5 rounded-[20px] font-bold text-sm transition-all border flex items-center justify-center gap-2 ${!isTouchInterface ? "bg-[#4AC4FE] border-[#4AC4FE] text-white shadow-lg shadow-none" : isDark ? "bg-white/5 border-white/5 text-slate-400 hover:bg-white/10" : "bg-slate-100 border-slate-200 text-slate-600 hover:bg-slate-200"}`}
                   >
                     <Monitor size={16} /> Desktop (sidebar, topbar)
                   </button>
                   <button 
                     onClick={() => setIsTouchInterface(true)}
                     className={`py-3.5 rounded-[20px] font-bold text-sm transition-all border flex items-center justify-center gap-2 ${isTouchInterface ? "bg-[#4AC4FE] border-[#4AC4FE] text-white shadow-lg shadow-none" : isDark ? "bg-white/5 border-white/5 text-slate-400 hover:bg-white/10" : "bg-slate-100 border-slate-200 text-slate-600 hover:bg-slate-200"}`}
                   >
                     <Smartphone size={16} /> Touch (navigation bar)
                   </button>
                 </div>
               </div>
             )}
             {showColors && (
               <div className={`p-8 rounded-[32px] border ${isDark ? "bg-white/[0.03] border-white/5" : "bg-white border-slate-200 shadow-sm"}`}>
                 <div className="flex items-center gap-5 mb-8">
                   <div className={`p-3 rounded-2xl ${isDark ? "bg-white/5 text-[#4AC4FE]" : "bg-[#4AC4FE]/10 text-[#4AC4FE]"}`}>
                     <Palette size={24} />
                   </div>
                   <h4 className={`text-lg font-bold ${isDark ? "text-white" : "text-slate-900"}`}>Tùy chỉnh màu giao diện</h4>
                 </div>
                 <div className="grid grid-cols-2 gap-6">
                   <div className="space-y-2 text-left">
                     <label className="text-xs font-bold uppercase tracking-wider opacity-50 ml-1">Màu chủ đạo (Nút)</label>
                     <div className="flex items-center gap-3">
                       <input 
                         type="color" 
                         value={props.customColors?.primary || "#4AC4FE"} 
                         onChange={(e) => props.setCustomColors(prev => ({ ...prev, primary: e.target.value }))}
                         className="w-full h-12 rounded-[20px] cursor-pointer border-2 border-white/10 p-0.5 bg-transparent"
                       />
                     </div>
                   </div>
                   <div className="space-y-2 text-left">
                     <label className="text-xs font-bold uppercase tracking-wider opacity-50 ml-1">Sidebar & Topbar</label>
                     <div className="flex items-center gap-3">
                       <input 
                         type="color" 
                         value={props.customColors?.sidebar || "#000000"} 
                         onChange={(e) => {
                           props.setCustomColors(prev => ({ ...prev, sidebar: e.target.value, topbar: e.target.value }));
                         }}
                         className="w-full h-12 rounded-[20px] cursor-pointer border-2 border-white/10 p-0.5 bg-transparent"
                       />
                     </div>
                   </div>
                   <div className="space-y-2 col-span-2">
                     <label className="text-xs font-bold uppercase tracking-wider opacity-50 ml-1">Màu Nền Chính</label>
                     <div className="flex items-center gap-3">
                       <input 
                         type="color" 
                         value={props.customColors?.background || "#0a0118"} 
                         onChange={(e) => props.setCustomColors(prev => ({ ...prev, background: e.target.value }))}
                         className="w-full h-12 rounded-[20px] cursor-pointer border-2 border-white/10 p-0.5 bg-transparent"
                       />
                     </div>
                   </div>
                 </div>
               </div>
             )}
          </div>
        );
      }
      case "TopBar": {
        const showClockSetting = shouldShowSetting("Hiển thị Đồng hồ", "Thời gian hiện tại đang được hiển thị trên thanh tiêu đề", ["đồng hồ", "giờ", "clock", "định dạng", "múi giờ"]);
        const showDateSetting = shouldShowSetting("Hiển thị Lịch", "Ngày tháng năm hiện tại đang hiển thị cạnh đồng hồ", ["lịch", "ngày tháng", "calendar", "định dạng"]);
        const showTempSetting = shouldShowSetting("Hiển thị Thời tiết", "Nhiệt độ và trạng thái thời tiết đang hiển thị trên thanh tiêu đề", ["thời tiết", "nhiệt độ", "weather", "temp", "vị trí", "đơn vị"]);
        const showSearchSetting = shouldShowSetting("Thanh tìm kiếm Topbar", "Chọn cách thức hiển thị thanh tìm kiếm trên Header", ["tìm kiếm", "search", "topbar"]);

        if (!showClockSetting && !showDateSetting && !showTempSetting && !showSearchSetting) return null;
        return (
          <div className="space-y-6 text-left">
            {showClockSetting && (
              <>
                <RejuvenatedSettingsItem 
                  icon={Clock} 
                  title="Hiển thị Đồng hồ" 
                  description={showClock ? "Thời gian hiện tại đang được hiển thị trên thanh tiêu đề" : "Đồng hồ hiện đang được ẩn khỏi thanh tiêu đề"}
                  onClick={() => setShowClock(!showClock)}
                  isDark={isDark}
                  isToggleable={true}
                  isToggled={showClock}
                />
                {showClock && (
                  <div className={`ml-10 p-6 rounded-[24px] border space-y-6 ${isDark ? "bg-white/5 border-white/5" : "bg-white border-slate-200 shadow-sm"}`}>
                      <div className="flex items-center justify-between">
                           <span className="text-sm font-bold opacity-60">Múi giờ</span>
                           <select 
                              value={timeZone} 
                              onChange={(e) => setTimeZone(e.target.value)}
                              className={`text-sm font-bold px-4 py-2 rounded-xl border-none outline-none ${isDark ? "bg-white/10" : "bg-slate-100"}`}
                           >
                              <option value="Asia/Ho_Chi_Minh">Hanoi (GMT+7)</option>
                              <option value="Asia/Bangkok">Bangkok (GMT+7)</option>
                              <option value="Asia/Tokyo">Tokyo (GMT+9)</option>
                           </select>
                      </div>
                      <div className="flex items-center justify-between">
                           <span className="text-sm font-bold opacity-60">Định dạng giờ</span>
                           <select 
                              value={timeFormat} 
                              onChange={(e) => setTimeFormat(e.target.value as any)}
                              className={`text-sm font-bold px-4 py-2 rounded-xl border-none outline-none ${isDark ? "bg-white/10" : "bg-slate-100"}`}
                           >
                              <option value="24h">24 Giờ</option>
                              <option value="12h">12 Giờ (AM/PM)</option>
                           </select>
                      </div>
                  </div>
                )}
              </>
            )}
            {showDateSetting && (
              <>
                <RejuvenatedSettingsItem 
                  icon={Calendar} 
                  title="Hiển thị Lịch" 
                  description={showDate ? "Ngày tháng năm hiện tại đang hiển thị cạnh đồng hồ" : "Lịch hiện đang được ẩn khỏi thanh tiêu đề"}
                  onClick={() => setShowDate(!showDate)}
                  isDark={isDark}
                  isToggleable={true}
                  isToggled={showDate}
                />
                {showDate && (
                  <div className={`ml-10 p-6 rounded-[24px] border space-y-6 ${isDark ? "bg-white/5 border-white/5" : "bg-white border-slate-200 shadow-sm"}`}>
                      <div className="flex items-center justify-between">
                           <span className="text-sm font-bold opacity-60">Định dạng lịch</span>
                           <select 
                              value={dateFormat} 
                              onChange={(e) => setDateFormat(e.target.value as any)}
                              className={`text-sm font-bold px-4 py-2 rounded-xl border-none outline-none ${isDark ? "bg-white/10" : "bg-slate-100"}`}
                           >
                              <option value="dd/mm/yyyy">Ngày/Tháng/Năm</option>
                              <option value="dd/mm/yy">Ngày/Tháng/Năm (Rút gọn)</option>
                           </select>
                      </div>
                  </div>
                )}
              </>
            )}
            {showTempSetting && (
              <>
                <RejuvenatedSettingsItem 
                  icon={Cloud} 
                  title="Hiển thị Thời tiết" 
                  description={showTempInClock ? "Nhiệt độ và trạng thái thời tiết đang hiển thị trên thanh tiêu đề" : "Thông tin thời tiết hiện đang được ẩn"}
                  onClick={() => setShowTempInClock(!showTempInClock)}
                  isDark={isDark}
                  isToggleable={true}
                  isToggled={showTempInClock}
                />
                {showTempInClock && (
                  <div className={`ml-10 p-6 rounded-[24px] border space-y-6 ${isDark ? "bg-white/5 border-white/5" : "bg-white border-slate-200 shadow-sm"}`}>
                      <div className="flex items-center justify-between">
                           <span className="text-sm font-bold opacity-60">Vị trí</span>
                           <div className="flex gap-3">
                               <button 
                                  onClick={() => setLocationDetection("auto")}
                                  className={`px-4 py-2 rounded-xl text-xs font-bold transition-all ${locationDetection === "auto" ? "bg-[#4AC4FE] text-white shadow-lg shadow-none" : isDark ? "bg-white/10" : "bg-slate-100 shadow-sm"}`}
                               >
                                   Auto
                               </button>
                               <button 
                                  onClick={() => setLocationDetection("manual")}
                                  className={`px-4 py-2 rounded-xl text-xs font-bold transition-all ${locationDetection === "manual" ? "bg-[#4AC4FE] text-white shadow-lg shadow-none" : isDark ? "bg-white/10" : "bg-slate-100 shadow-sm"}`}
                               >
                                   Manual
                               </button>
                           </div>
                      </div>
                      {locationDetection === "manual" && (
                          <div className="flex items-center justify-between">
                               <span className="text-sm font-bold opacity-60">Nhập vị trí</span>
                               <input 
                                  value={location} 
                                  onChange={(e) => setLocation(e.target.value)}
                                  className={`text-sm font-bold px-4 py-2 rounded-xl border-none outline-none ${isDark ? "bg-white/10" : "bg-slate-100 shadow-inner"}`}
                               />
                          </div>
                      )}
                      <div className="flex items-center justify-between">
                           <span className="text-sm font-bold opacity-60">Đơn vị nhiệt độ</span>
                           <select 
                              value={tempUnit} 
                              onChange={(e) => setTempUnit(e.target.value as any)}
                              className={`text-sm font-bold px-4 py-2 rounded-xl border-none outline-none ${isDark ? "bg-white/10" : "bg-slate-100"}`}
                           >
                              <option value="C">Celsius (°C)</option>
                              <option value="F">Fahrenheit (°F)</option>
                           </select>
                      </div>
                  </div>
                )}
              </>
            )}
            {showSearchSetting && (
              <div className={`p-8 rounded-[32px] border ${isDark ? "bg-white/[0.03] border-white/5" : "bg-white border-slate-200 shadow-sm"}`}>
                <div className="flex items-center gap-5 mb-6">
                  <div className={`p-4 rounded-2xl ${isDark ? "bg-white/5 text-[#4AC4FE]" : "bg-[#4AC4FE]/10 text-[#4AC4FE]"}`}>
                    <Search size={24} />
                  </div>
                  <div className="text-left">
                    <h4 className={`text-lg font-bold ${isDark ? "text-white" : "text-slate-900"}`}>Diện mạo tìm kiếm</h4>
                    <p className="text-sm opacity-50 font-medium tracking-tight">Chọn cách thức hiển thị thanh tìm kiếm trên Header</p>
                  </div>
                </div>
                <div className="grid grid-cols-2 gap-4">
                  <button 
                    onClick={() => setTopbarSearchType("box")}
                    className={`py-3.5 rounded-[20px] font-bold text-sm transition-all border flex items-center justify-center gap-2 ${topbarSearchType === "box" ? "bg-[#4AC4FE] border-[#4AC4FE] text-white shadow-lg shadow-none" : isDark ? "bg-white/5 border-white/5 text-slate-400 hover:bg-white/10" : "bg-slate-100 border-slate-200 text-slate-600 hover:bg-slate-200"}`}
                  >
                    Search box
                  </button>
                  <button 
                    onClick={() => setTopbarSearchType("icon")}
                    className={`py-3.5 rounded-[20px] font-bold text-sm transition-all border flex items-center justify-center gap-2 ${topbarSearchType === "icon" ? "bg-[#4AC4FE] border-[#4AC4FE] text-white shadow-lg shadow-none" : isDark ? "bg-white/5 border-white/5 text-slate-400 hover:bg-white/10" : "bg-slate-100 border-slate-200 text-slate-600 hover:bg-slate-200"}`}
                  >
                    Search icon
                  </button>
                </div>
              </div>
            )}
          </div>
        );
      }
      case "Sidebar": {
        const showCompact = shouldShowSetting("Compact mode", "Sidebar đang được co gọn, hiển thị các biểu tượng lớn và nhãn nhỏ", ["compact", "co gọn", "sidebar"]);
        const showPosition = shouldShowSetting("Vị trí Sidebar", "Thay đổi vị trí của thanh Sidebar sang bên trái hoặc bên phải màn hình", ["sidebar", "phải", "trái", "vị trí"]);
        const showQuickAccess = shouldShowSetting("Truy cập nhanh", "Hiển thị danh sách các kênh ghim ngay trên thanh Sidebar để truy cập nhanh", ["quick access", "truy cập nhanh", "ghim", "sidebar"]);

        if (!showCompact && !showPosition && !showQuickAccess) return null;
        return (
            <div className="space-y-6 text-left">
                 {showPosition && (
                   <div className={`p-8 rounded-[32px] border ${isDark ? "bg-white/[0.03] border-white/5" : "bg-white border-slate-200 shadow-sm"}`}>
                     <div className="flex items-center gap-5 mb-6">
                       <div className={`p-4 rounded-2xl ${isDark ? "bg-white/5 text-[#4AC4FE]" : "bg-[#4AC4FE]/10 text-[#4AC4FE]"}`}>
                         <ArrowRightLeft size={24} />
                       </div>
                       <div className="text-left">
                         <h4 className={`text-lg font-bold ${isDark ? "text-white" : "text-slate-900"}`}>Vị trí Sidebar</h4>
                         <p className="text-sm opacity-50 font-medium tracking-tight">Thay đổi vị trí của thanh Sidebar sang bên trái hoặc bên phải màn hình</p>
                       </div>
                     </div>
                     <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                       <button 
                         onClick={() => setIsSidebarRight(false)}
                         className={`py-3.5 rounded-[20px] font-bold text-sm transition-all border flex items-center justify-center gap-2 ${!isSidebarRight ? "bg-[#4AC4FE] border-[#4AC4FE] text-white shadow-lg shadow-none" : isDark ? "bg-white/5 border-white/5 text-slate-400 hover:bg-white/10" : "bg-slate-100 border-slate-200 text-slate-600 hover:bg-slate-200"}`}
                       >
                         Trái
                       </button>
                       <button 
                         onClick={() => setIsSidebarRight(true)}
                         className={`py-3.5 rounded-[20px] font-bold text-sm transition-all border flex items-center justify-center gap-2 ${isSidebarRight ? "bg-[#4AC4FE] border-[#4AC4FE] text-white shadow-lg shadow-none" : isDark ? "bg-white/5 border-white/5 text-slate-400 hover:bg-white/10" : "bg-slate-100 border-slate-200 text-slate-600 hover:bg-slate-200"}`}
                       >
                         Phải
                       </button>
                     </div>
                   </div>
                 )}
                 {showQuickAccess && (
                   <RejuvenatedSettingsItem 
                    icon={Zap} 
                    title="Truy cập nhanh" 
                    description={sidebarQuickAccess ? "Hiển thị danh sách các kênh ghim ngay trên thanh Sidebar để truy cập nhanh" : "Ẩn các mục ghim để Sidebar tối giản hơn"}
                    onClick={() => setSidebarQuickAccess(!sidebarQuickAccess)}
                    isDark={isDark}
                    isToggleable={true}
                    isToggled={sidebarQuickAccess}
                  />
                 )}
            </div>
        );
      }
      case "Floatbar": {
        const showLiquidEngine = shouldShowSetting("Liquid Glass Engine", "Lựa chọn phong cách hiển thị cho Bottom bar và các cửa sổ con", ["floatbar", "liquid glass", "kính", "glassy", "tinted", "mờ", "trong suốt", "hiệu ứng"]);

        if (!showLiquidEngine) return null;
        return (
            <div className={`p-8 rounded-[32px] border ${isDark ? "bg-white/[0.03] border-white/5" : "bg-white border-slate-200 shadow-sm"}`}>
                <div className="flex items-center justify-between mb-8">
                    <div className="flex items-center gap-6">
                        <div className={`p-3 rounded-2xl ${isDark ? "bg-white/5 text-[#4AC4FE]" : "bg-[#4AC4FE]/10 text-[#4AC4FE]"}`}>
                            <GlassWater size={28} />
                        </div>
                        <div className="text-left">
                            <h4 className={`text-xl font-bold ${isDark ? "text-white" : "text-slate-900"}`}>Liquid Glass Engine</h4>
                            <p className="text-sm opacity-50 font-medium tracking-tight">Lựa chọn phong cách hiển thị cho Bottom bar và các cửa sổ con</p>
                        </div>
                    </div>
                </div>
                <div className="grid grid-cols-2 gap-6">
                    <button 
                        onClick={() => setLiquidGlass("glassy")}
                        className={`p-8 rounded-[32px] border-2 transition-all flex flex-col items-center gap-4 ${liquidGlass === "glassy" ? "border-[#4AC4FE] bg-[#4AC4FE]/10 shadow-lg shadow-none" : isDark ? "border-white/5 bg-white/5" : "border-slate-100 bg-slate-50"}`}
                    >
                         <div className="w-16 h-16 rounded-full bg-white/20 backdrop-blur-md border border-white/30 flex items-center justify-center shadow-inner">
                            <div className="w-8 h-1 bg-white/40 rounded-full" />
                         </div>
                         <span className="text-sm font-bold uppercase tracking-widest">Glassy</span>
                     </button>
                    <button 
                        onClick={() => setLiquidGlass("tinted")}
                        className={`p-8 rounded-[32px] border-2 transition-all flex flex-col items-center gap-4 ${liquidGlass === "tinted" ? "border-[#4AC4FE] bg-[#4AC4FE]/10 shadow-lg shadow-none" : isDark ? "border-white/5 bg-white/5" : "border-slate-100 bg-slate-50"}`}
                    >
                         <div className="w-16 h-16 rounded-full bg-white border border-white flex items-center justify-center shadow-md">
                            <div className="w-8 h-1 bg-black/10 rounded-full" />
                         </div>
                         <span className="text-sm font-bold uppercase tracking-widest">Tinted</span>
                    </button>
                </div>

                <div className="h-[1px] bg-slate-200 dark:bg-white/10 my-8" />
                <div className="space-y-6">
                    <div>
                        <h5 className={`text-md font-bold mb-1 ${isDark ? "text-white" : "text-slate-900"}`}>Điều chỉnh chi tiết kính</h5>
                        <p className="text-xs opacity-50 font-normal">Tùy biến riêng độ mờ nền và độ trong suốt của kính theo ý muốn</p>
                    </div>

                    {/* Blur Slider */}
                    <div className="space-y-2">
                        <div className="flex justify-between items-center">
                            <span className="text-sm font-semibold">Độ mờ cảnh nền (Blur)</span>
                            <span className="text-sm font-mono font-bold text-[#4AC4FE] bg-[#4AC4FE]/10 px-2.5 py-0.5 rounded-full">{liquidGlassBlur}px</span>
                        </div>
                        <input 
                            type="range" 
                            min="0" 
                            max="40" 
                            step="1" 
                            value={liquidGlassBlur} 
                            onChange={(e) => setLiquidGlassBlur(parseInt(e.target.value, 10))}
                            className="w-full h-1.5 bg-slate-200 dark:bg-white/10 rounded-lg appearance-none cursor-pointer accent-[#4AC4FE]"
                        />
                        <div className="flex justify-between text-[10px] opacity-40 font-semibold">
                            <span>0px (Trong suốt hoàn toàn)</span>
                            <span>40px (Mờ đục cực đại)</span>
                        </div>
                    </div>

                    {/* Opacity Slider */}
                    <div className="space-y-2">
                        <div className="flex justify-between items-center">
                            <span className="text-sm font-semibold">Độ đục nền (Opacity)</span>
                            <span className="text-sm font-mono font-bold text-[#4AC4FE] bg-[#4AC4FE]/10 px-2.5 py-0.5 rounded-full">{liquidGlassOpacity}%</span>
                        </div>
                        <input 
                            type="range" 
                            min="0" 
                            max="100" 
                            step="1" 
                            value={liquidGlassOpacity} 
                            onChange={(e) => setLiquidGlassOpacity(parseInt(e.target.value, 10))}
                            className="w-full h-1.5 bg-slate-200 dark:bg-white/10 rounded-lg appearance-none cursor-pointer accent-[#4AC4FE]"
                        />
                        <div className="flex justify-between text-[10px] opacity-40 font-semibold">
                            <span>0% (Không hiển thị nền)</span>
                            <span>100% (Đặc màu nền)</span>
                        </div>
                    </div>
                </div>
            </div>
        );
      }
      case "Experiments": {
        const showExp = shouldShowSetting("Tính năng thử nghiệm Canary", "Trải nghiệm các tính năng thử nghiệm mới nhất trên hệ thống Vplay Canary", ["experimental", "thử nghiệm", "labs", "phòng thí nghiệm", "widgets", "dashboard", "activate"]);
        if (!showExp) return null;
        return (
          <div className="space-y-6 text-left origin-top animate-in fade-in duration-300">
            <ExperimentalContent 
              isDark={isDark} 
              featureFlags={featureFlags} 
              setFeatureFlags={setFeatureFlags} 
              liquidGlass={liquidGlass} 
              loadingTreatment={loadingTreatment}
              setLoadingTreatment={setLoadingTreatment}
            />
          </div>
        );
      }
      case "WidgetsBoard": {
        const showPosition = shouldShowSetting("Vị trí Widgets board", "Cấu hình vị trí xuất hiện của bảng tiện ích (bên trái hoặc bên phải màn hình)", ["widgets", "board", "bảng tiện ích", "vị trí", "trái", "phải"]);
        const showSidebarSetting = shouldShowSetting("Ẩn sidebar trong Widgets", "Đang ẩn thanh điều khiển bên trong bảng tiện ích để tăng diện tích hiển thị", ["widgets", "sidebar", "ẩn", "thanh bên"]);
        const showFullScreen = shouldShowSetting("Chế độ toàn màn hình", "Mở bảng tiện ích dạng toàn màn hình (Full-screen mode)", ["toàn màn hình", "full-screen", "flyout", "tiện ích"]);
        const showFrosted = shouldShowSetting("Hiệu ứng Frosted Glass", "Đang bật hiệu ứng phủ mờ kính (Frosted Glass) cho toàn bộ Widgets board", ["frosted glass", "mờ kính", "kính", "text trắng"]);
        const showColorSetting = shouldShowSetting("Tô màu tiện ích", "Hiển thị màu sắc sinh động, rực rỡ riêng cho từng ô tiện ích trong bảng", ["tô màu", "màu tiện ích", "color widgets", "màu sắc"]);
        const showExpEmbed = shouldShowSetting("Experimental Features inside widgets", "Phòng thí nghiệm tiến hóa đã được di chuyển vào đây", ["thử nghiệm", "experimental", "labs", "phòng thí nghiệm"]);

        if (!showPosition && !showSidebarSetting && !showFullScreen && !showFrosted && !showColorSetting && !showExpEmbed) return null;
        return (
          <div className="space-y-6 text-left animate-in fade-in duration-300">
             {/* Position of Widgets Board */}
             {showPosition && (
               <div className={`p-8 rounded-[32px] border ${isDark ? "bg-white/[0.03] border-white/5" : "bg-white border-slate-200 shadow-sm"}`}>
                 <div className="flex items-center gap-5 mb-6">
                   <div className={`p-4 rounded-2xl ${isDark ? "bg-white/5 text-[#4AC4FE]" : "bg-[#4AC4FE]/10 text-[#4AC4FE]"}`}>
                     <LayoutGrid size={24} />
                   </div>
                   <div className="text-left">
                     <h4 className={`text-lg font-bold ${isDark ? "text-white" : "text-slate-900"}`}>Vị trí Widgets board</h4>
                     <p className="text-sm opacity-50 font-medium tracking-tight">Cấu hình vị trí xuất hiện của bảng tiện ích (bên trái hoặc bên phải màn hình)</p>
                   </div>
                 </div>
                 <div className="grid grid-cols-2 gap-4">
                   <button 
                     onClick={() => setWidgetsBoardPosition("left")}
                     className={`py-3.5 rounded-[20px] font-bold text-sm transition-all border flex items-center justify-center gap-2 ${widgetsBoardPosition === "left" ? "bg-[#4AC4FE] border-[#4AC4FE] text-white shadow-lg shadow-none" : isDark ? "bg-white/5 border-white/5 text-slate-400 hover:bg-white/10" : "bg-slate-100 border-slate-200 text-slate-600 hover:bg-slate-200"}`}
                   >
                     Trái
                   </button>
                   <button 
                     onClick={() => setWidgetsBoardPosition("right")}
                     className={`py-3.5 rounded-[20px] font-bold text-sm transition-all border flex items-center justify-center gap-2 ${widgetsBoardPosition === "right" ? "bg-[#4AC4FE] border-[#4AC4FE] text-white shadow-lg shadow-none" : isDark ? "bg-white/5 border-white/5 text-slate-400 hover:bg-white/10" : "bg-slate-100 border-slate-200 text-slate-600 hover:bg-slate-200"}`}
                   >
                     Phải
                   </button>
                 </div>
               </div>
             )}

             {/* Hide Sidebar in Widgets */}
             {showSidebarSetting && (
               <RejuvenatedSettingsItem 
                 icon={Columns} 
                 title="Ẩn sidebar trong Widgets" 
                 description={hideSidebarInWidgets ? "Đang ẩn thanh điều khiển bên trong bảng tiện ích để tăng diện tích hiển thị" : "Hiển thị đầy đủ thanh điều khiển bên trong bảng tiện ích"}
                 onClick={() => setHideSidebarInWidgets(!hideSidebarInWidgets)}
                 isDark={isDark}
                 isToggleable={true}
                 isToggled={hideSidebarInWidgets}
               />
             )}

             {/* Full Screen Mode */}
             {showFullScreen && (
               <RejuvenatedSettingsItem 
                 icon={Maximize2} 
                 title="Chế độ toàn màn hình" 
                 description={fullScreenWidgets ? "Mở bảng tiện ích dạng toàn màn hình (Full-screen mode)" : "Mở bảng tiện ích dưới dạng một cửa sổ trượt (Flyout panel)"}
                 onClick={() => setFullScreenWidgets(!fullScreenWidgets)}
                 isDark={isDark}
                 isToggleable={true}
                 isToggled={fullScreenWidgets}
               />
             )}

             {/* Hiệu ứng Frosted Glass */}
             {showFrosted && (
               <RejuvenatedSettingsItem 
                 icon={Droplet} 
                 title="Hiệu ứng Frosted Glass" 
                 description={frostedGlassWidgets ? "Đang bật hiệu ứng phủ mờ kính (Frosted Glass) cho toàn bộ Widgets board, đồng thời đổi toàn bộ text thành màu trắng" : "Bật hiệu ứng mờ kính cho toàn bộ bảng tiện ích"}
                 onClick={() => setFrostedGlassWidgets(!frostedGlassWidgets)}
                 isDark={isDark}
                 isToggleable={true}
                 isToggled={frostedGlassWidgets}
               />
             )}

             {/* Tô màu tiện ích */}
             {showColorSetting && (
               <RejuvenatedSettingsItem 
                 icon={Palette} 
                 title="Tô màu tiện ích" 
                 description={colorWidgets ? "Hiển thị màu sắc sinh động, rực rỡ riêng cho từng ô tiện ích trong bảng" : "Bảng tiện ích hiển thị với màu sắc trung tính mặc định"}
                 onClick={() => setColorWidgets(!colorWidgets)}
                 isDark={isDark}
                 isToggleable={true}
                 isToggled={colorWidgets}
               />
             )}

             {/* Experimental Features embedded inside widget settings */}
             {showExpEmbed && (
               <div className={`p-8 rounded-[32px] border ${isDark ? "bg-white/[0.03] border-white/5" : "bg-white border-slate-200 shadow-sm"} mt-8`}>
                 <div className="flex items-center gap-5 mb-8 border-b border-black/5 pb-4">
                   <div className={`p-4 rounded-2xl ${isDark ? "bg-white/5 text-amber-400" : "bg-amber-50 text-amber-600"}`}>
                     <Flask size={24} />
                   </div>
                   <div className="text-left">
                     <h4 className={`text-lg font-bold ${isDark ? "text-white" : "text-slate-900"}`}>Experimental Features (Tính năng thử nghiệm)</h4>
                     <p className="text-xs opacity-50 font-bold tracking-tight">Phòng thí nghiệm tiến hóa đã được di chuyển vào đây</p>
                   </div>
                 </div>
                 <ExperimentalContent 
                   isDark={isDark} 
                   featureFlags={featureFlags} 
                   setFeatureFlags={setFeatureFlags || (() => {})} 
                   liquidGlass={liquidGlass || "glassy"} 
                   loadingTreatment={loadingTreatment || "shimmer"}
                   setLoadingTreatment={setLoadingTreatment || (() => {})}
                 />
               </div>
             )}
          </div>
        );
      }
      default:
        return null;
    }
  };

  if (isFlat) {
    const selectedCat = drillDownCategory ? categories.find(c => c.id === drillDownCategory) : null;

    return (
      <div className="flex flex-col h-full bg-transparent">
        <div className="flex-1 overflow-y-auto scrollbar-hide px-10 pb-10">
          {activeSearchQuery ? (
            <div className="space-y-12 max-w-4xl mx-auto pt-8">
              {categories.map((cat) => {
                const content = renderContent(cat.id);
                if (!content) return null;
                return (
                  <div key={cat.id} className="space-y-6 animate-fade-in">
                    <div className="flex items-center gap-4 px-2">
                      <div className="h-4 w-[6px] bg-blue-600 rounded-full" />
                      <h3 className={`text-sm font-bold tracking-tight text-slate-400 uppercase tracking-widest`}>{cat.name}</h3>
                    </div>
                    {content}
                  </div>
                );
              })}
            </div>
          ) : drillDownCategory ? (
            <motion.div
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              className="max-w-4xl mx-auto pt-6"
            >
               <div className="flex items-center gap-4 mb-6">
                 <button 
                   onClick={() => setDrillDownCategory(null)}
                   className={`p-2.5 rounded-xl transition-all border shadow-sm ${
                     isDark 
                       ? "bg-white/10 hover:bg-white/20 text-white border-white/10" 
                       : "bg-white hover:bg-black/5 text-slate-600 border-black/5"
                   }`}
                 >
                   <ChevronLeft size={20} />
                 </button>
                 <h2 className={`text-2xl font-bold tracking-tight ${isDark ? "text-white" : "text-slate-800"}`}>
                    {selectedCat ? selectedCat.name : "Settings"}
                 </h2>
               </div>
               {renderContent(drillDownCategory)}
            </motion.div>
          ) : (
            <div className="max-w-4xl mx-auto space-y-8 pt-8">
              {/* Top Info Section */}
              <div className="flex flex-col md:flex-row gap-4 h-fit md:h-36">
                <div className={`flex-1 rounded-2xl border p-6 flex flex-col justify-between shadow-sm transition-all ${
                  isDark ? "bg-white/[0.03] border-white/10 text-white" : "bg-white border-black/5 text-slate-800"
                }`}>
                   <h3 className={`text-base font-bold ${isDark ? "text-white" : "text-slate-800"}`}>About Vplay by VNRT</h3>
                   <div className="grid grid-cols-2 gap-x-8 gap-y-1 mt-2">
                      <div className="flex justify-between items-center text-sm">
                        <span className={`${isDark ? "text-white/60" : "text-slate-400"} font-medium`}>Branch:</span>
                        <span className="text-blue-500 font-bold">Dev</span>
                      </div>
                      <div className="flex justify-between items-center text-sm">
                        <span className={`${isDark ? "text-white/60" : "text-slate-400"} font-medium`}>Version:</span>
                        <span className={`${isDark ? "text-white" : "text-slate-800"} font-bold`}>26.7.0</span>
                      </div>
                      <div className="flex justify-between items-center text-sm col-span-1">
                        <span className={`${isDark ? "text-white/60" : "text-slate-400"} font-medium whitespace-nowrap mr-2`}>Compiled:</span>
                        <span className={`${isDark ? "text-white" : "text-slate-800"} font-bold`}>19/05/26</span>
                      </div>
                   </div>
                </div>

                <div className={`flex-1 rounded-2xl border p-6 flex flex-col justify-between shadow-sm relative overflow-hidden transition-all ${
                  isDark ? "bg-white/[0.03] border-white/10 text-white" : "bg-white border-black/5 text-slate-800"
                }`}>
                   <div className="flex items-start gap-4">
                      <div className={`p-2.5 rounded-xl shrink-0 ${isDark ? "bg-white/10 text-white/60" : "bg-slate-50 text-slate-400"}`}>
                         <MessageSquare size={20} />
                      </div>
                      <div className="space-y-1">
                         <h3 className={`text-base font-bold flex items-center gap-1.5 ${isDark ? "text-white" : "text-slate-800"}`}>
                           Give Feedback! <ExternalLink size={14} className={isDark ? "text-white/40" : "text-slate-300"} />
                         </h3>
                         <p className={`text-xs font-medium leading-relaxed ${isDark ? "text-white/60" : "text-slate-400"}`}>Hãy giúp chúng tôi cải thiện Vplay. Chúng tôi luôn lắng nghe ý kiến của bạn</p>
                      </div>
                   </div>
                </div>

                <div className="flex items-center justify-center px-4">
                   <div className="flex items-center gap-1">
                      <div className="flex flex-col items-end">
                         <span className="text-4xl font-black italic tracking-tighter bg-gradient-to-br from-indigo-700 via-blue-600 to-cyan-500 bg-clip-text text-transparent leading-none">Vplay</span>
                      </div>
                   </div>
                </div>
              </div>

              {/* Categories list */}
              <div className="space-y-3">
                 {categories.map((cat) => {
                    // Skip SystemInfo in the list because it's handled by the "About" card
                    if (cat.id === "SystemInfo") return null;

                    return (
                        <button
                          key={cat.id}
                          onClick={() => setDrillDownCategory(cat.id)}
                          className={`w-full flex items-center gap-6 p-5 rounded-xl transition-all group text-left border ${
                            isDark 
                              ? "bg-white/[0.03] border-white/10 hover:border-blue-400/40 hover:bg-white/[0.08]" 
                              : "bg-white border-black/5 hover:border-blue-500/20 hover:shadow-lg"
                          }`}
                        >
                          <div className={`w-12 h-12 flex items-center justify-center rounded-xl transition-all shrink-0 ${
                            isDark ? "text-white/60 group-hover:text-blue-400" : "text-slate-400 group-hover:text-blue-500"
                          }`}>
                            {cat.id === "Profile" ? <User size={32} /> : 
                             cat.id === "Appearance" ? <Palette size={32} /> : 
                             cat.id === "TopBar" ? <Monitor size={32} /> :
                             cat.id === "Sidebar" ? <Columns size={32} /> :
                             cat.id === "Floatbar" ? <Layout size={32} /> :
                             <cat.icon size={32} />}
                          </div>
                          <div className="flex-1">
                             <h4 className={`text-base font-bold transition-colors ${
                               isDark ? "text-white group-hover:text-blue-400" : "text-slate-700 group-hover:text-slate-900"
                             }`}>
                               {cat.id === "Profile" ? "Tài khoản" : 
                                cat.id === "Appearance" ? "Chủ đề và Giao diện" : 
                                cat.id === "TopBar" ? "Topbar (Desktop mode only)" :
                                cat.id === "Sidebar" ? "Sidebar (Desktop mode only)" :
                                cat.id === "Floatbar" ? "Bottom bar (Touch mode only)" :
                                cat.id === "Experiments" ? "Experimental Features" :
                                cat.id === "WidgetsBoard" ? "Widgets board" :
                                cat.name}
                             </h4>
                             <p className={`text-xs font-medium mt-0.5 opacity-80 ${isDark ? "text-white/60" : "text-slate-400"}`}>
                                {cat.id === "Profile" ? "Quản lý hồ sơ và tài khoản Vplay" : 
                                 cat.id === "Appearance" ? "Tùy biến giao diện và trải nghiệm người dùng theo ý thích" :
                                 cat.id === "TopBar" ? "Tùy chỉnh các tính năng và hành vi của thanh điều hướng trên" :
                                 cat.id === "Sidebar" ? "Tùy chỉnh các tính năng và hành vi của thanh điều hướng bên" :
                                 cat.id === "Floatbar" ? "Tùy chỉnh các tính năng và hành vi của Bottom bar (thanh điều hướng dưới)" :
                                 cat.id === "Experiments" ? "Trải nghiệm sớm các tính năng mới sắp ra mắt của Vplay" : 
                                 cat.id === "WidgetsBoard" ? "Tùy chỉnh các tính năng và hành vi của bảng tiện ích" : "Quản lý cài đặt"}
                             </p>
                          </div>
                          <ChevronRight size={18} className={`transition-all opacity-0 group-hover:opacity-100 ${isDark ? "text-white/40 group-hover:text-blue-400" : "text-slate-300 group-hover:text-blue-500"}`} />
                        </button>
                    );
                 })}
              </div>
            </div>
          )}

          {/* Reset Confirmation Popup */}
          <AnimatePresence>
            {showResetPopup && (
              <div className="fixed inset-0 z-[1000] flex items-center justify-center p-4">
                <motion.div 
                  initial={{ opacity: 0 }} 
                  animate={{ opacity: 1 }} 
                  exit={{ opacity: 0 }} 
                  onClick={() => setShowResetPopup(false)} 
                  className="absolute inset-0 bg-black/60 backdrop-blur-sm animate-none" 
                />
                <motion.div 
                  initial={{ opacity: 0, scale: 0.9, y: 20 }} 
                  animate={{ opacity: 1, scale: 1, y: 0 }} 
                  exit={{ opacity: 0, scale: 0.9, y: 20 }} 
                  className="relative w-full max-w-md rounded-[32px]"
                >
                  <ShinyGlassWrapper isDark={isDark} roundedClass="rounded-[32px]" innerClass={`p-8 shadow-2xl relative w-full h-full flex flex-col ${isDark ? "bg-[#18181c]/92 text-white" : "bg-white/92 text-slate-800"}`}>
                    <div className="flex items-center justify-between mb-8">
                      <h3 className="text-2xl font-bold tracking-tight">Tẩy xóa & Đặt lại</h3>
                      <button 
                        onClick={() => setShowResetPopup(false)} 
                        className={`p-2 rounded-xl transition-colors ${isDark ? "hover:bg-white/10 text-white/60" : "hover:bg-black/5 text-slate-400"}`}
                      >
                        <X size={20} />
                      </button>
                    </div>

                    <div className="mx-auto w-16 h-16 bg-red-500/10 text-red-500 rounded-full flex items-center justify-center mb-6">
                      <Trash2 size={32} />
                    </div>

                    <p className={`text-sm leading-relaxed mb-8 text-center opacity-80 ${isDark ? "text-slate-300" : "text-slate-600"}`}>
                      Hành động này sẽ xóa sạch mọi dữ liệu, bao gồm các cài đặt, tùy chỉnh và thông tin tài khoản Vplay và cài đặt lại từ đầu toàn bộ thông số về mặc định. Bạn có muốn tẩy xóa và đặt lại Vplay không?
                    </p>

                    <div className="grid grid-cols-2 gap-4">
                      <button 
                        id="reset-cancel-btn" 
                        onClick={() => setShowResetPopup(false)} 
                        className={`py-3.5 rounded-2xl font-bold text-sm transition-all border ${
                          isDark ? "bg-white/5 border-white/5 text-slate-300 hover:bg-white/10" : "bg-slate-100 border-slate-200 text-slate-650 hover:bg-slate-200"
                        }`}
                      >
                        Hủy
                      </button>
                      <button 
                        id="reset-agree-btn" 
                        onClick={() => { 
                          setShowResetPopup(false); 
                          setIsReinstalling(true); 
                          setSplashDuration(60000);
                          setShowSplash(true); 
                        }} 
                        className="py-3.5 rounded-2xl font-bold text-sm transition-all bg-[#FF453A] hover:bg-red-700 text-white shadow-lg shadow-red-600/20 active:scale-[0.98]"
                      >
                        Đồng ý
                      </button>
                    </div>
                  </ShinyGlassWrapper>
                </motion.div>
              </div>
            )}
          </AnimatePresence>
        </div>
      </div>
    );
  }

  return (
    <div className={`flex flex-col h-full overflow-hidden ${frostedGlassWidgets ? "bg-transparent text-white" : (isDark ? "bg-vplay-background" : "bg-white")}`}>
      <div className={`w-full shrink-0 p-4 lg:p-6 flex flex-col gap-4 border-b z-10 ${
        frostedGlassWidgets 
          ? "bg-transparent border-white/10" 
          : (isDark ? "bg-black/20 border-white/5" : "bg-slate-50/10 border-slate-200")
      }`}>
        <div className="space-y-4">
          <div className="relative group cursor-pointer transform transition-all duration-300 hover:scale-[1.04] hover:-translate-y-0.5 active:scale-[0.98] active:translate-y-0 ease-out">
            <div className="absolute left-4 lg:left-5 top-1/2 -translate-y-1/2 pointer-events-none z-10">
              <SearchCustomIcon size={22} />
            </div>
            <input 
              type="text" 
              placeholder="Tìm cài đặt..."
              value={activeSearchQuery}
              onChange={(e) => activeSetSearchQuery(e.target.value)}
              className={`w-full h-10 lg:h-14 pl-11 lg:pl-14 pr-4 lg:pr-6 rounded-full text-xs lg:text-sm font-bold outline-none transition-all border-2 shadow-[0_4px_12px_rgba(0,0,0,0.1),_inset_0_1.5px_2px_rgba(255,255,255,0.18)] focus:shadow-[0_8px_24px_rgba(74,196,254,0.35)] ${
                frostedGlassWidgets
                  ? "bg-white/10 border-white/5 text-white placeholder:text-white/45"
                  : (isDark 
                      ? "bg-white/5 border-white/4 text-white placeholder:text-white/20" 
                      : "bg-white border-slate-200/40 focus:border-slate-300 placeholder:text-slate-300")
              }`}
            />
          </div>
        </div>

        <div className="overflow-x-auto flex flex-row gap-2 py-1 px-1 custom-scrollbar scrollbar-hide">
          {categories.map((cat) => (
            <button
              key={cat.id}
              onClick={() => setActiveCategory(cat.id)}
              className={`shrink-0 flex items-center gap-2 px-3 lg:px-4 py-2.5 transition-all relative group border-b-[3px] -mb-[12px] h-12 ${
                activeCategory === cat.id 
                  ? (frostedGlassWidgets 
                      ? "border-white text-white" 
                      : (isDark ? "border-[#4AC4FE] text-[#4AC4FE]" : "border-[#4AC4FE] text-[#4AC4FE]"))
                  : (frostedGlassWidgets
                      ? "border-transparent text-white/50 hover:text-white"
                      : (isDark ? "border-transparent text-white/40 hover:text-white" : "border-transparent text-slate-550 hover:text-slate-800"))
              }`}
            >
              <cat.icon className="w-[16px] h-[16px] shrink-0" strokeWidth={activeCategory === cat.id ? 2.5 : 1.5} />
              <span className={`text-[12px] lg:text-[13px] font-bold tracking-tight ${activeCategory === cat.id ? "font-black" : ""}`}>{cat.name}</span>
            </button>
          ))}
        </div>
      </div>

      <div className={`flex-1 overflow-y-auto p-4 md:p-12 custom-scrollbar animate-in fade-in slide-in-from-right-4 duration-500 ${
        frostedGlassWidgets 
          ? "bg-transparent text-white" 
          : (isDark ? "" : "bg-slate-50/5")
      }`}>
        <div className="max-w-4xl mx-auto align-top">
          {renderContent()}
        </div>
      </div>
    </div>
  );
}

const GlassToggle = ({ active, onToggle, isDark }: { active: boolean, onToggle: () => void, isDark: boolean }) => {
  return (
    <button
      onClick={onToggle}
      className={`w-11 h-6 rounded-full p-1 transition-colors duration-300 flex items-center relative focus:outline-none border ${
        active 
          ? "bg-sky-500 border-sky-600 shadow-[inset_0_1px_0_rgba(255,255,255,0.2)]" 
          : (isDark ? "bg-white/10 border-white/5" : "bg-slate-200 border-slate-300")
      }`}
    >
      <motion.div
        animate={{ x: active ? 20 : 0 }}
        transition={{ type: "spring", stiffness: 400, damping: 28 }}
        className="w-4 h-4 bg-white rounded-full shadow-md"
      />
    </button>
  );
};

const GlassSelect = ({ value, onChange, options, isDark }: { value: any, onChange: (val: any) => void, options: { value: any, label: string }[], isDark: boolean }) => {
  const selectBorder = isDark 
    ? "bg-[#161823] border border-white/10 text-white hover:border-white/20"
    : "bg-white border border-slate-200 text-slate-800 hover:border-slate-300";

  return (
    <div className="relative inline-block text-left">
      <select
        value={value}
        onChange={(e) => onChange(e.target.value)}
        className={`appearance-none px-5 py-2 pr-10 rounded-full font-normal text-sm outline-none transition-all cursor-pointer shadow-sm ${selectBorder}`}
      >
        {options.map((opt) => (
          <option key={opt.value} value={opt.value} className={isDark ? "bg-[#161823] text-white font-normal" : "bg-white text-slate-800 font-normal"}>
            {opt.label}
          </option>
        ))}
      </select>
      <div className="absolute right-4 top-1/2 -translate-y-1/2 pointer-events-none opacity-50">
        <ChevronRight size={14} className="rotate-90 text-inherit" />
      </div>
    </div>
  );
};

function SettingsNew(props: any) {
  const {
    isDark, setIsDark, isDev, setIsDev, featureFlags, setFeatureFlags, liquidGlass, setLiquidGlass,
    liquidGlassBlur, setLiquidGlassBlur, liquidGlassOpacity, setLiquidGlassOpacity,
    useSidebar, setUseSidebar, isSidebarRight, setIsSidebarRight, isSidebarLocked, setIsSidebarLocked,
    isPinningEnabled, setIsPinningEnabled, user, userData, setUserData, onAlert, onLogin, onLogout,
    favorites, tempUnit, setTempUnit, location, setLocation, timeFormat, setTimeFormat, clockFormat, setClockFormat,
    dateFormat, setDateFormat, showClock, setShowClock, showDate, setShowDate, showTempInClock, setShowTempInClock,
    isTouchInterface, setIsTouchInterface, sidebarQuickAccess, setSidebarQuickAccess, timeZone, setTimeZone,
    maxToolbarTabs, setMaxToolbarTabs, toastDuration, setToastDuration, locationDetection, setLocationDetection,
    toastMode, setToastMode,
    setActiveTab, settingsActivePage, setSettingsActivePage,
    floatyBars, setFloatyBars,
    showChannelNumbers, setShowChannelNumbers
  } = props;

  const [localActivePage, setLocalActivePage] = useState<number>(1);
  const activePage = settingsActivePage !== undefined ? settingsActivePage : localActivePage;
  const setActivePage = setSettingsActivePage !== undefined ? setSettingsActivePage : setLocalActivePage;
  const [settingsSearchQuery, setSettingsSearchQuery] = useState("");
  const [guestName, setGuestName] = useState(() => localStorage.getItem("vplay_guest_name") || "Khách");
  const [isEditingDisplayName, setIsEditingDisplayName] = useState(false);
  const [newDisplayName, setNewDisplayName] = useState("");

  const [profileAvatar, setProfileAvatar] = useState(() => {
    return user?.photoURL || userData?.avatar || localStorage.getItem("vplay_guest_avatar") || "";
  });
  const [profileSaving, setProfileSaving] = useState(false);
  const profileFileInputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    setNewDisplayName(user?.displayName || userData?.name || guestName);
  }, [user, userData, guestName]);

  useEffect(() => {
    setProfileAvatar(user?.photoURL || userData?.avatar || localStorage.getItem("vplay_guest_avatar") || "");
  }, [user, userData]);

  const handleProfileFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onloadend = () => {
        setProfileAvatar(reader.result as string);
      };
      reader.readAsDataURL(file);
    }
  };

  const handleProfileSave = async () => {
    setProfileSaving(true);
    try {
      if (user) {
        // Firebase Auth photoURL has a max length limit of 2048 chars. 
        // We bypass this for Base64 by storing a short placeholder in Auth, 
        // while the full avatar continues to be safely persisted in Firestore.
        const fbPhotoURL = profileAvatar && profileAvatar.length > 2000 
          ? "https://img.icons8.com/color/144/superhero.png" 
          : profileAvatar;

        await updateProfile(user, {
          displayName: newDisplayName,
          photoURL: fbPhotoURL
        });
        
        const userRef = doc(db, "users", user.uid);
        await setDoc(userRef, {
          name: newDisplayName,
          avatar: profileAvatar,
          updatedAt: new Date().toISOString()
        }, { merge: true });
        
        if (setUserData) {
          setUserData((prev: any) => ({
            ...prev,
            name: newDisplayName,
            avatar: profileAvatar
          }));
        }
        showToast("Đã cập nhật thông tin cá nhân thành công!", "success");
      } else {
        localStorage.setItem("vplay_guest_name", newDisplayName);
        localStorage.setItem("vplay_guest_avatar", profileAvatar);
        setGuestName(newDisplayName);
        if (setUserData) {
          setUserData((prev: any) => ({
            ...prev,
            name: newDisplayName,
            avatar: profileAvatar
          }));
        }
        showToast("Đã cập nhật hồ sơ khách của bạn!", "success");
      }
    } catch (err: any) {
      showToast("Không thể lưu thông tin: " + err.message, "error");
    }
    setProfileSaving(false);
  };

  const handleSaveProfile = async () => {
    if (!newDisplayName.trim()) return;
    if (user) {
      try {
        await updateProfile(user, { displayName: newDisplayName });
        if (setUserData) {
          setUserData((prev: any) => ({ ...prev, name: newDisplayName }));
        }
        showToast("đã cập nhật tên hồ sơ của bạn thành: " + newDisplayName, "success");
        setIsEditingDisplayName(false);
      } catch (err: any) {
        showToast("lỗi cập nhật tên: " + err.message, "error");
      }
    } else {
      localStorage.setItem("vplay_guest_name", newDisplayName);
      setGuestName(newDisplayName);
      if (setUserData) {
        setUserData((prev: any) => ({ ...prev, name: newDisplayName }));
      }
      showToast("đã cập nhật tên khách thành: " + newDisplayName, "success");
      setIsEditingDisplayName(false);
    }
  };

  const handleFactoryReset = () => {
    if (window.confirm("bạn có chắc chắn muốn khôi phục cài đặt gốc? toàn bộ tùy chỉnh của bạn sẽ bị xóa sạch!")) {
      localStorage.clear();
      showToast("đang đặt lại thiết lập ban đầu...", "info");
      setTimeout(() => {
        window.location.reload();
      }, 1500);
    }
  };

  const pages = [
    { num: 1, label: "Hồ sơ", icon: User },
    { num: 2, label: "Accessibility", icon: Accessibility },
    { num: 3, label: "Chủ đề giao diện", icon: Palette },
    { num: 4, label: "Toolbars", icon: LayoutGrid },
    { num: 5, label: "Thử nghiệm", icon: Pizza },
    { num: 6, label: "Phát sóng", icon: Radio }
  ];

  // Helper styles
  const cardBg = isDark
    ? "bg-[#161823]/80 border border-white/5 backdrop-blur-xl text-white shadow-[0_12px_40px_rgba(0,0,0,0.5)]"
    : "bg-white/80 border border-slate-200 backdrop-blur-md text-slate-800 shadow-[0_12px_32px_rgba(0,0,0,0.06)]";

  const buttonStyle = (active: boolean, color: string = "sky") => {
    // True bubble style has soft shadows, subtle inner reflection gloss, and active:scale-95 bounce
    const baseStyle = "px-6 py-2 rounded-full font-bold text-xs select-none uppercase tracking-wider transition-all duration-300 focus:outline-none transform hover:scale-[1.05] active:scale-92 cursor-pointer";

    if (active) {
      if (color === "blue") {
        return `${baseStyle} bg-gradient-to-b from-blue-400 to-blue-500 text-white border-t border-blue-300/40 shadow-[0_6px_12px_rgba(0,0,0,0.15),_inset_0_1.5px_2px_rgba(255,255,255,0.35)]`;
      }
      if (color === "yellow") {
        return `${baseStyle} bg-gradient-to-b from-amber-400 to-amber-500 text-slate-950 border-t border-amber-300/40 shadow-[0_6px_12px_rgba(0,0,0,0.15),_inset_0_1.5px_2px_rgba(255,255,255,0.45)]`;
      }
      if (color === "red") {
        return `${baseStyle} bg-gradient-to-b from-red-400 to-red-500 text-white border-t border-red-300/40 shadow-[0_6px_12px_rgba(0,0,0,0.15),_inset_0_1.5px_2px_rgba(255,255,255,0.35)]`;
      }
      // Standard sky style
      return `${baseStyle} bg-gradient-to-b from-sky-400 to-[#38bcfd] text-slate-950 border-t border-sky-300/40 shadow-[0_6px_12px_rgba(0,0,0,0.15),_inset_0_1.5px_2px_rgba(255,255,255,0.45)]`;
    }

    // Inactive glassy bubble style
    if (color === "blue") {
      return `${baseStyle} ${isDark ? "bg-blue-500/10 border border-blue-500/20 text-blue-400 hover:bg-blue-500/20 shadow-md" : "bg-blue-50 text-blue-600 border border-blue-100 hover:bg-blue-100/50 shadow-sm"}`;
    }
    if (color === "yellow") {
      return `${baseStyle} ${isDark ? "bg-amber-500/10 border border-amber-500/30 text-amber-400 hover:bg-amber-500/20 shadow-md" : "bg-amber-50 text-amber-700 border border-amber-100 hover:bg-amber-100/50 shadow-sm"}`;
    }
    if (color === "red") {
      return `${baseStyle} ${isDark ? "bg-red-500/10 border border-red-500/25 text-red-400 hover:bg-red-500/20 shadow-md" : "bg-red-50 text-red-600 border border-red-100 hover:bg-red-100/50 shadow-sm"}`;
    }

    return `${baseStyle} ${
      isDark 
        ? "bg-white/5 border border-white/10 text-white/80 hover:bg-white/10 hover:text-white shadow-md shadow-black/10" 
        : "bg-slate-100/80 border border-slate-200/80 text-slate-700 hover:bg-slate-200 shadow-sm"
    }`;
  };

  const renderBullet = (text: React.ReactNode) => (
    <div className="flex items-start font-normal text-sm group transition-all mt-1">
      <div className="flex-1 text-left">{text}</div>
    </div>
  );

  const matchedSettings = settingsSearchQuery.trim() === "" 
    ? [] 
    : settingsSearchOptions.filter(item => 
        item.name.toLowerCase().includes(settingsSearchQuery.toLowerCase()) || 
        item.desc.toLowerCase().includes(settingsSearchQuery.toLowerCase()) ||
        item.match.some(m => m.toLowerCase().includes(settingsSearchQuery.toLowerCase()))
      );

  return (
    <div className="w-full h-full flex flex-col md:flex-row gap-6 p-4 md:p-8 animate-in fade-in duration-300 overflow-hidden">
      {/* 5 Pages Tab bar - Desktop sidebar, Mobile floating segmented control */}
      <div className="w-full md:w-64 flex flex-col gap-4 shrink-0">
        {/* Search settings input box styled as bubble */}
        <div className={`relative flex items-center gap-2.5 h-12 md:h-14 px-5 w-full group rounded-full border cursor-pointer transform transition-all duration-300 hover:scale-[1.04] hover:-translate-y-0.5 active:scale-[0.98] active:translate-y-0 ${
          isDark 
            ? "bg-white/5 border-white/5 text-white shadow-[0_4px_12px_rgba(0,0,0,0.15),_inset_0_1.5px_2.5px_rgba(255,255,255,0.15)] focus-within:shadow-[0_8px_24px_rgba(74,196,254,0.35)]" 
            : "bg-slate-100 border-slate-200/40 text-slate-800 shadow-[0_4px_10px_rgba(0,0,0,0.06),_inset_0_1.5px_2px_rgba(255,255,255,0.4)] focus-within:shadow-[0_8px_20px_rgba(74,196,254,0.25)]"
        }`}>
          <SearchCustomIcon size={22} className={`shrink-0 transition-colors`} />
          <input
            type="text"
            value={settingsSearchQuery}
            onChange={(e) => setSettingsSearchQuery(e.target.value)}
            placeholder="Tìm cài đặt..."
            className={`bg-transparent border-none outline-none text-xs md:text-sm w-full font-bold font-google ${
              isDark ? "text-white placeholder-slate-500" : "text-slate-800 placeholder-black/35"
            }`}
          />
          {settingsSearchQuery && (
            <button onClick={() => setSettingsSearchQuery("")} className="p-1 hover:bg-black/10 rounded-full transition-all">
              <X size={14} className={isDark ? "text-slate-300/60" : "text-slate-400"} />
            </button>
          )}
        </div>

        <div className="flex md:flex-col gap-2 overflow-x-auto md:overflow-x-visible pb-3 md:pb-0 no-scrollbar">
          {pages.map((p) => {
            const isActive = activePage === p.num && settingsSearchQuery.trim() === "";
            const PageIcon = p.icon;
            return (
              <button
                key={`page-${p.num}`}
                onClick={() => {
                  setActivePage(p.num);
                  setSettingsSearchQuery("");
                }}
                className={`relative flex items-center gap-3.5 pl-6 pr-5 py-3 rounded-full text-sm font-bold transition-all shrink-0 select-none ${
                  isActive
                    ? (isDark 
                        ? "bg-white/5 text-[#4AC4FE] border border-white/10 shadow-md" 
                        : "bg-slate-100 text-sky-600 border border-slate-200/50 shadow-sm")
                    : (isDark 
                        ? "hover:bg-white/5 border border-transparent text-slate-400" 
                        : "hover:bg-slate-100/50 border border-transparent text-slate-500")
                }`}
              >
                {isActive && (
                  <motion.div 
                    layoutId="activeVerticalPill" 
                    className="absolute left-2.5 top-3.5 bottom-3.5 w-1 rounded-full bg-[#4AC4FE]"
                    transition={{ type: "spring", stiffness: 380, damping: 30 }}
                  />
                )}
                <div className={`p-1.5 rounded-full shrink-0 ${isActive ? "bg-[#4AC4FE]/10 text-[#4AC4FE]" : "bg-transparent text-current"}`}>
                   <PageIcon size={18} />
                </div>
                <span className="text-inherit">{p.label}</span>
              </button>
            );
          })}
        </div>
      </div>

      {/* Main Content Pane */}
      <div className={`flex-1 p-6 md:p-10 rounded-[32px] overflow-y-auto custom-scrollbar h-full pb-28 ${cardBg}`}>
        <AnimatePresence mode="wait">
          {settingsSearchQuery.trim() !== "" ? (
            <motion.div
              key="settings-search-results"
              initial={{ opacity: 0, y: 12 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -12 }}
              transition={{ duration: 0.25 }}
              className="space-y-8"
            >
              <div>
                <h2 className="text-xl md:text-2xl font-bold mt-1 tracking-tight text-left text-inherit">
                  Kết quả tìm kiếm cài đặt
                </h2>
                <p className="text-xs opacity-50 text-left mt-1 font-normal">
                  Tìm thấy {matchedSettings.length} cấu hình phù hợp với "{settingsSearchQuery}"
                </p>
              </div>

              <div className="space-y-4">
                {matchedSettings.length > 0 ? (
                  matchedSettings.map((item, idx) => {
                    const matchedPage = pages.find(p => p.num === item.page);
                    const PageIcon = matchedPage?.icon || SettingsIcon;
                    return (
                      <div 
                        key={`matched-setting-${idx}`}
                        className={`p-5 rounded-3xl border transition-all duration-300 flex flex-col sm:flex-row sm:items-center justify-between gap-4 text-left ${
                          isDark 
                            ? "bg-white/[0.02] border-white/5 hover:bg-white/[0.04]" 
                            : "bg-black/[0.01] border-black/5 hover:bg-black/[0.03]"
                        }`}
                      >
                        <div className="space-y-1">
                          <div className="flex items-center gap-2">
                            <span className="font-bold text-base text-inherit">{item.name}</span>
                            <span className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full text-[10px] font-bold bg-[#4AC4FE]/10 text-[#4AC4FE] border border-[#4AC4FE]/20">
                              <PageIcon size={10} />
                              {matchedPage?.label}
                            </span>
                          </div>
                          <p className="text-xs opacity-60 font-medium leading-relaxed">{item.desc}</p>
                        </div>
                        <button
                          onClick={() => {
                            setActivePage(item.page);
                            setSettingsSearchQuery("");
                          }}
                          className={`px-4 py-2 rounded-full font-bold text-xs shrink-0 select-none transition-all ${
                            isDark 
                              ? "bg-sky-400 text-black hover:bg-sky-300" 
                              : "bg-[#4AC4FE] text-black hover:bg-[#4AC4FE]/80 shadow-md shadow-sky-500/10"
                          }`}
                        >
                          Đi đến thiết lập
                        </button>
                      </div>
                    );
                  })
                ) : (
                  <div className="py-12 text-center space-y-3">
                    <div className="w-12 h-12 rounded-full bg-red-500/10 text-red-500 flex items-center justify-center mx-auto">
                      <Search size={25} />
                    </div>
                    <div className="space-y-1">
                      <p className="font-bold text-sm">Không tìm thấy kết quả</p>
                      <p className="text-xs opacity-50 max-w-xs mx-auto">Hãy thử nhập từ khóa khác như "hồ sơ", "hiệu ứng", "đồng hồ", "vị trí"...</p>
                    </div>
                  </div>
                )}
              </div>
            </motion.div>
          ) : (
            <motion.div
              key={`page-content-${activePage}`}
              initial={{ opacity: 0, y: 12 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -12 }}
              transition={{ duration: 0.25 }}
              className="space-y-8"
            >
              {/* Title block */}
              <div>
                <h2 className="text-xl md:text-2xl font-bold mt-1 tracking-tight text-left text-inherit">
                  {pages.find(p => p.num === activePage)?.label}
                </h2>
              </div>

            {/* Page 1: Profile */}
            {activePage === 1 && (
              <div className="space-y-6 animate-fade-in">
                <div>
                  <h4 className="text-xs uppercase tracking-widest opacity-40 mb-3 text-left font-bold font-mono">Tài khoản</h4>
                  <div className="space-y-3.5 pl-3">
                    {renderBullet(
                      <div className="flex items-center justify-between flex-wrap gap-2">
                        <span className="opacity-70 font-semibold">username:</span>
                        <span className="font-mono text-xs font-normal">{user?.displayName || user?.email || guestName}</span>
                      </div>
                    )}
                    {renderBullet(
                      <div className="flex items-center justify-between flex-wrap gap-2">
                        <span className="opacity-70 font-semibold">user ID:</span>
                        <span className="font-mono text-xs font-normal select-all bg-sky-500/5 px-2 py-0.5 rounded-full border border-sky-500/10">
                          {user?.uid || "Guest-VPlay"}
                        </span>
                      </div>
                    )}
                  </div>
                </div>

                {/* THE GORGEOUS PROFILE EDITOR */}
                <div className={`p-5 md:p-8 rounded-[24px] md:rounded-[32px] border space-y-6 ${isDark ? "bg-white/5 border-white/5" : "bg-white border-slate-200 shadow-sm"}`}>
                  <div className="flex items-center gap-3">
                    <div className="p-2.5 rounded-xl bg-[#4AC4FE]/10 text-[#4AC4FE]">
                      <User size={20} />
                    </div>
                    <h4 className="text-base font-black uppercase tracking-tight text-left">Chỉnh sửa hồ sơ</h4>
                  </div>

                  <div className="flex flex-col sm:flex-row items-center gap-6">
                    {/* Clickable Profile Avatar for upload */}
                    <div 
                      className="relative group cursor-pointer shrink-0"
                      onClick={() => profileFileInputRef.current?.click()}
                    >
                      <div className="absolute inset-0 bg-[#4AC4FE]/20 blur-xl rounded-full scale-110 animate-pulse" />
                      <div className="w-24 h-24 rounded-full border-4 border-[#4AC4FE]/30 relative z-10 shadow-xl overflow-hidden bg-slate-800">
                        {profileAvatar ? (
                          <img src={profileAvatar} alt="Avatar" className="w-full h-full object-cover" referrerPolicy="no-referrer" />
                        ) : (
                          <div className="w-full h-full flex items-center justify-center bg-slate-800">
                            <User size={36} className="text-slate-400 opacity-45" />
                          </div>
                        )}
                        
                        <div className="absolute inset-0 bg-black/60 flex flex-col items-center justify-center opacity-0 group-hover:opacity-100 transition-all duration-300 z-20">
                          <Camera className="text-white w-6 h-6" />
                          <span className="text-[9px] text-white font-extrabold uppercase mt-1">Tải ảnh lên</span>
                        </div>
                      </div>
                      <input 
                        type="file" 
                        accept="image/*" 
                        ref={profileFileInputRef} 
                        onChange={handleProfileFileChange} 
                        className="hidden" 
                      />
                    </div>

                    <div className="flex-1 w-full space-y-4">
                      <div className="space-y-1.5 text-left">
                        <label className="text-[10px] font-bold uppercase tracking-[0.2em] opacity-40 ml-1 block text-left">Tên hiển thị</label>
                        <input 
                          value={newDisplayName} 
                          onChange={(e) => setNewDisplayName(e.target.value)} 
                          placeholder="Nhập tên hiển thị..."
                          className={`w-full px-4 py-3 rounded-xl border text-sm font-bold bg-transparent outline-none transition-all ${
                            isDark 
                              ? "text-white border-white/10 focus:border-[#4AC4FE]/50 bg-white/[0.02]" 
                              : "text-[#1e293b] border-slate-200 focus:border-[#4AC4FE]/50 bg-slate-50"
                          }`} 
                        />
                      </div>

                      <div className="flex gap-2.5 text-left">
                        <button 
                          onClick={handleProfileSave}
                          disabled={profileSaving}
                          className={`px-5 py-2.5 rounded-xl text-xs font-black uppercase tracking-wider flex items-center justify-center gap-2 transition-all ${
                            profileSaving 
                              ? "bg-[#4AC4FE]/10 text-[#4AC4FE] opacity-50" 
                              : "bg-[#4AC4FE] text-slate-950 font-extrabold shadow-lg shadow-[#4AC4FE]/20 hover:scale-[1.03] cursor-pointer"
                          }`}
                        >
                          <Check size={14} /> {profileSaving ? "Đang lưu..." : "Lưu thay đổi"}
                        </button>
                      </div>
                    </div>
                  </div>

                  {/* Preset Avatars Selection */}
                  <div className="space-y-2.5 pt-4 border-t border-white/5 text-left">
                    <label className="text-[10px] font-bold uppercase tracking-[0.15em] opacity-40 ml-1 block text-left">Chọn nhanh avatar vplay</label>
                    <div className="flex flex-wrap gap-2">
                      {[
                        "https://img.icons8.com/color/144/anonymous-mask.png",
                        "https://img.icons8.com/color/144/superhero.png",
                        "https://img.icons8.com/color/144/ninja.png",
                        "https://img.icons8.com/color/144/cyborg.png",
                        "https://img.icons8.com/color/144/hacker.png"
                      ].map((p, idx) => (
                        <button
                          key={idx}
                          type="button"
                          onClick={() => setProfileAvatar(p)}
                          className={`w-11 h-11 rounded-xl p-1.5 bg-slate-800/40 border-2 transition-all hover:scale-110 active:scale-95 flex items-center justify-center ${profileAvatar === p ? "border-[#4AC4FE] bg-[#4AC4FE]/10" : "border-white/5 hover:border-white/10"}`}
                          title="Chọn avatar nhanh"
                        >
                          <img src={p} alt={`Preset ${idx}`} className="w-full h-full object-contain" referrerPolicy="no-referrer" />
                        </button>
                      ))}
                    </div>
                  </div>
                </div>

                <div>
                  <h4 className="text-xs uppercase tracking-widest opacity-40 mb-3 text-left font-bold font-mono">Thao tác</h4>
                  <div className="flex flex-wrap gap-3 pl-3 pt-2">
                    {user ? (
                      <button onClick={() => { onLogout(); setActiveTab("Trang chủ"); }} className={buttonStyle(false, "yellow")}>
                        Đăng xuất
                      </button>
                    ) : (
                      <button onClick={() => { onLogin(); }} className={buttonStyle(false, "sky")}>
                        Đăng nhập
                      </button>
                    )}
                    <button onClick={handleFactoryReset} className={buttonStyle(false, "red")}>
                      Khôi phục cài đặt gốc
                    </button>
                  </div>
                </div>

                <div className="pt-4 border-t border-white/5">
                  <h4 className="text-xs uppercase tracking-widest opacity-40 mb-3 text-left font-bold font-mono">Thông tin phiên bản</h4>
                  <div className="space-y-3.5 pl-3">
                    {renderBullet(
                      <div className="flex items-center justify-between">
                        <span className="opacity-70 font-semibold">Thông tin phiên bản Vplay:</span>
                        <span className="font-semibold text-xs text-sky-400">v26.7_03 Liquid Glass Edition</span>
                      </div>
                    )}
                  </div>
                </div>
              </div>
            )}

            {/* Page 2: Accessibility */}
            {activePage === 2 && (
              <div className="space-y-6">
                <div>
                  <h4 className="text-xs uppercase tracking-widest opacity-40 mb-3 text-left font-bold font-mono">Hiệu năng</h4>
                  <div className="pl-3">
                    {renderBullet(
                      <div className="flex items-center justify-between">
                        <div>
                           <p className="font-semibold text-sm text-left">Low Latency Mode</p>
                           <p className="text-xs opacity-50 text-left font-normal animate-none">Tối ưu hóa độ trễ luồng phát trực tiếp</p>
                        </div>
                        <GlassToggle
                          active={!!featureFlags.low_latency_profile}
                          onToggle={() => setFeatureFlags((prev: any) => ({ ...prev, low_latency_profile: !prev.low_latency_profile }))}
                          isDark={isDark}
                        />
                      </div>
                    )}
                  </div>
                </div>

                <div>
                  <h4 className="text-xs uppercase tracking-widest opacity-40 mb-3 text-left font-bold font-mono">Giao diện</h4>
                  <div className="pl-3">
                    {renderBullet(
                      <div className="flex items-center justify-between">
                        <div>
                           <p className="font-semibold text-sm text-left">Reduce Animation</p>
                           <p className="text-xs opacity-50 text-left font-normal animate-none">Giảm thiểu chuyển động mượt để tăng tốc độ</p>
                        </div>
                        <GlassToggle
                          active={!!featureFlags.disable_animation}
                          onToggle={() => setFeatureFlags((prev: any) => ({ ...prev, disable_animation: !prev.disable_animation }))}
                          isDark={isDark}
                        />
                      </div>
                    )}
                  </div>
                </div>

                <div>
                  <h4 className="text-xs uppercase tracking-widest opacity-40 mb-3 text-left font-bold font-mono">Thông báo</h4>
                  <div className="pl-3 space-y-4">
                    {renderBullet(
                      <div className="flex items-center justify-between flex-wrap gap-4">
                        <div className="text-left animate-none">
                           <p className="font-semibold text-sm text-left">Notification Toast Duration</p>
                           <p className="text-xs opacity-50 text-left font-normal animate-none">Thời gian hiển thị dòng thông báo nổi</p>
                        </div>
                        <GlassSelect
                          value={toastDuration}
                          onChange={(val) => setToastDuration(parseInt(val, 10))}
                          options={[
                            { value: 3000, label: "3 giây" },
                            { value: 5000, label: "5 giây" },
                            { value: 10000, label: "10 giây" }
                          ]}
                          isDark={isDark}
                        />
                      </div>
                    )}

                    {renderBullet(
                      <div className="flex items-center justify-between flex-wrap gap-4 pt-4 border-t border-white/5">
                        <div className="text-left animate-none">
                           <p className="font-semibold text-sm text-left">Notification Toast Count</p>
                           <p className="text-xs opacity-50 text-left font-normal animate-none">Số lượng thông báo hiển thị cùng lúc</p>
                        </div>
                        <div className="flex gap-2">
                          <button onClick={() => setToastMode("single")} className={buttonStyle(toastMode === "single")}>
                            1 thông báo/lần
                          </button>
                          <button onClick={() => setToastMode("stack")} className={buttonStyle(toastMode === "stack")}>
                            Chồng chất
                          </button>
                        </div>
                      </div>
                    )}
                  </div>
                </div>
              </div>
            )}

            {/* Page 3: UI Theme */}
            {activePage === 3 && (
              <div className="space-y-6">
                <div>
                  <h4 className="text-xs uppercase tracking-widest opacity-40 mb-3 text-left font-bold font-mono">Liquid Glass</h4>
                  <div className="pl-3 space-y-4">
                    {renderBullet(
                      <div className="flex flex-col gap-3 text-left">
                        <div>
                           <p className="font-semibold text-sm">Liquid Glass</p>
                           <p className="text-xs opacity-50 font-normal">Kiểu mờ đục hoặc trong sương mờ của kính phủ nền</p>
                        </div>
                        <div className="flex gap-2.5 pt-1">
                          <button
                            onClick={() => setLiquidGlass("glassy")}
                            className={buttonStyle(liquidGlass === "glassy", "sky")}
                          >
                            Kính trong
                          </button>
                          <button
                            onClick={() => setLiquidGlass("tinted")}
                            className={buttonStyle(liquidGlass === "tinted", "sky")}
                          >
                            Kính mờ
                          </button>
                        </div>
                      </div>
                    )}

                    {renderBullet(
                      <div className="pl-4 border-l-2 border-sky-500/20 py-2 space-y-5 mt-4">
                        {/* Blur Slider */}
                        <div className="space-y-2 text-left">
                          <div className="flex justify-between items-center">
                            <span className="text-xs font-semibold opacity-85">Độ mờ cảnh nền (Blur)</span>
                            <span className="text-xs font-mono font-bold text-[#4AC4FE] bg-[#4AC4FE]/10 px-2.5 py-0.5 rounded-full">{liquidGlassBlur}px</span>
                          </div>
                          <input 
                            type="range" 
                            min="0" 
                            max="40" 
                            step="1" 
                            value={liquidGlassBlur} 
                            onChange={(e) => setLiquidGlassBlur(parseInt(e.target.value, 10))}
                            className="w-full h-1 bg-slate-200 dark:bg-white/10 rounded-lg appearance-none cursor-pointer accent-[#4AC4FE]"
                          />
                        </div>

                        {/* Opacity Slider */}
                        <div className="space-y-2 text-left">
                          <div className="flex justify-between items-center">
                            <span className="text-xs font-semibold opacity-85">Độ đục nền (Opacity)</span>
                            <span className="text-xs font-mono font-bold text-[#4AC4FE] bg-[#4AC4FE]/10 px-2.5 py-0.5 rounded-full">{liquidGlassOpacity}%</span>
                          </div>
                          <input 
                            type="range" 
                            min="0" 
                            max="100" 
                            step="1" 
                            value={liquidGlassOpacity} 
                            onChange={(e) => setLiquidGlassOpacity(parseInt(e.target.value, 10))}
                            className="w-full h-1 bg-slate-200 dark:bg-white/10 rounded-lg appearance-none cursor-pointer accent-[#4AC4FE]"
                          />
                        </div>
                      </div>
                    )}
                  </div>
                </div>
              </div>
            )}

            {/* Page 4: Toolbars */}
            {activePage === 4 && (
              <div className="space-y-6">
                <div>
                  <h4 className="text-xs uppercase tracking-widest opacity-40 mb-3 text-left font-bold font-mono">Cài đặt chung</h4>
                  <div className="pl-3 space-y-4">
                    {renderBullet(
                      <div className="flex items-center justify-between">
                        <div>
                          <p className="font-semibold text-sm text-left">Đồng hồ và lịch</p>
                          <p className="text-xs opacity-50 text-left font-normal">Hiển thị đồng hồ số trên topbar</p>
                        </div>
                        <GlassToggle
                          active={showClock}
                          onToggle={() => {
                            setShowClock(!showClock);
                            setShowDate(!showClock);
                          }}
                          isDark={isDark}
                        />
                      </div>
                    )}

                    {showClock && (
                      <div className="pl-4 border-l-2 border-sky-500/20 py-2 space-y-4 mt-2">
                        {renderBullet(
                          <div className="flex items-center justify-between flex-wrap gap-2 text-left">
                            <span className="opacity-75 text-xs font-semibold">Múi giờ</span>
                            <GlassSelect
                              value={timeZone}
                              onChange={setTimeZone}
                              options={[
                                { value: "Asia/Ho_Chi_Minh", label: "Vietnam (GMT+7)" },
                                { value: "Asia/Singapore", label: "Singapore (GMT+8)" },
                                { value: "Asia/Tokyo", label: "Japan (GMT+9)" },
                                { value: "Europe/London", label: "London (GMT)" },
                                { value: "America/New_York", label: "New York (GMT-5)" }
                              ]}
                              isDark={isDark}
                            />
                          </div>
                        )}

                        {renderBullet(
                          <div className="flex items-center justify-between flex-wrap gap-2 text-left">
                            <span className="opacity-75 text-xs font-semibold">Định dạng giờ</span>
                            <div className="flex gap-2">
                              <button onClick={() => setTimeFormat("24h")} className={buttonStyle(timeFormat === "24h")}>
                                24 giờ
                              </button>
                              <button onClick={() => setTimeFormat("12h")} className={buttonStyle(timeFormat === "12h")}>
                                12 giờ
                              </button>
                            </div>
                          </div>
                        )}

                        {renderBullet(
                          <div className="flex items-center justify-between flex-wrap gap-2 text-left">
                            <span className="opacity-75 text-xs font-semibold">Định dạng lịch</span>
                            <GlassSelect
                              value={dateFormat}
                              onChange={setDateFormat}
                              options={[
                                { value: "dd/mm/yyyy", label: "Ngày/Tháng/Năm" },
                                { value: "dd/mm/yy", label: "Ngày/Tháng/Năm rút gọn" },
                                { value: "dd/mm", label: "Ngày/Tháng" }
                              ]}
                              isDark={isDark}
                            />
                          </div>
                        )}
                      </div>
                    )}

                    {renderBullet(
                      <div className="flex items-center justify-between">
                        <div>
                          <p className="font-semibold text-sm text-left">Dự báo thời tiết</p>
                          <p className="text-xs opacity-50 text-left font-normal">Hiển thị nhiệt độ của khu vực</p>
                        </div>
                        <GlassToggle
                          active={showTempInClock}
                          onToggle={() => setShowTempInClock(!showTempInClock)}
                          isDark={isDark}
                        />
                      </div>
                    )}

                    {showTempInClock && (
                      <div className="pl-4 border-l-2 border-sky-500/20 py-2 space-y-4 mt-2">
                        {renderBullet(
                          <div className="flex items-center justify-between flex-wrap gap-4 text-left">
                            <div>
                              <p className="text-xs font-semibold">Vị trí</p>
                              <p className="text-[11px] opacity-60 font-mono font-normal">Vị trí hiện tại: {location || "Chưa xác định"}</p>
                            </div>
                            <div className="flex items-center gap-2">
                              <input
                                type="text"
                                value={location}
                                onChange={(e) => setLocation(e.target.value)}
                                className={`px-4 py-1.5 text-xs rounded-full bg-black/10 border text-left ${isDark ? "border-white/10 text-white" : "border-slate-200 text-slate-800"}`}
                                placeholder="Tên thành phố..."
                              />
                              <button
                                onClick={() => {
                                  setLocationDetection("auto");
                                  showToast("Đang tự động xác định vị trí của bạn...", "info");
                                }}
                                className={buttonStyle(locationDetection === "auto", "yellow")}
                              >
                                Tự động định vị
                              </button>
                            </div>
                          </div>
                        )}

                        {renderBullet(
                          <div className="flex items-center justify-between flex-wrap gap-2 text-left">
                            <span className="opacity-75 text-xs font-semibold font-mono">Đơn vị nhiệt độ</span>
                            <div className="flex gap-2">
                              <button onClick={() => setTempUnit("C")} className={buttonStyle(tempUnit === "C")}>
                                Độ C (°C)
                              </button>
                              <button onClick={() => setTempUnit("F")} className={buttonStyle(tempUnit === "F")}>
                                Độ F (°F)
                              </button>
                            </div>
                          </div>
                        )}
                      </div>
                    )}

                    {renderBullet(
                      <div className="flex items-center justify-between">
                        <div>
                          <p className="font-semibold text-sm text-left">Chạm góc cổ điển (Floaty bars)</p>
                          <p className="text-xs opacity-50 text-left font-normal">Quay lại kiểu thiết kế chạm góc truyền thống của topbar và sidebar thay vì block nổi lơ lửng</p>
                        </div>
                        <GlassToggle
                          active={floatyBars}
                          onToggle={() => setFloatyBars(!floatyBars)}
                          isDark={isDark}
                        />
                      </div>
                    )}
                  </div>
                </div>

                <div>
                  <h4 className="text-xs uppercase tracking-widest opacity-40 mb-3 text-left font-bold font-mono">Bottom bar</h4>
                  <div className="pl-3">
                    {renderBullet(
                      <div className="flex items-center justify-between flex-wrap gap-4">
                        <div className="text-left font-normal">
                          <p className="font-semibold text-sm text-left">Tab tối đa</p>
                          <p className="text-xs opacity-50 text-left font-normal">Tùy chỉnh số lượng tab trong một trang trên Bottom bar, tối đa 5 tab</p>
                        </div>
                        <GlassSelect
                          value={maxToolbarTabs}
                          onChange={(val) => setMaxToolbarTabs(parseInt(val, 10))}
                          options={[
                            { value: 3, label: "3 tab" },
                            { value: 4, label: "4 tab" },
                            { value: 5, label: "5 tab" }
                          ]}
                          isDark={isDark}
                        />
                      </div>
                    )}
                  </div>
                </div>

                <div>
                  <h4 className="text-xs uppercase tracking-widest opacity-40 mb-3 text-left font-bold font-mono">Sidebar</h4>
                  <div className="pl-3 space-y-4">
                    {renderBullet(
                      <div className="flex items-center justify-between flex-wrap gap-4">
                        <div className="text-left font-normal">
                          <p className="font-semibold text-sm text-left">Vị trí sidebar</p>
                          <p className="text-xs opacity-50 text-left font-normal">Vị trí hiển thị của thanh điều hướng sidebar</p>
                        </div>
                        <div className="flex gap-2">
                          <button onClick={() => setIsSidebarRight(false)} className={buttonStyle(isSidebarRight === false)}>
                            Bên trái
                          </button>
                          <button onClick={() => setIsSidebarRight(true)} className={buttonStyle(isSidebarRight === true)}>
                            Bên phải
                          </button>
                        </div>
                      </div>
                    )}

                    {renderBullet(
                      <div className="flex items-center justify-between">
                        <div className="text-left font-normal">
                          <p className="font-semibold text-sm text-left">Truy cập nhanh</p>
                          <p className="text-xs opacity-50 text-left font-normal">Hiển thị danh sách kênh yêu thích dạng icon tròn trên sidebar</p>
                        </div>
                        <GlassToggle
                          active={sidebarQuickAccess}
                          onToggle={() => setSidebarQuickAccess(!sidebarQuickAccess)}
                          isDark={isDark}
                        />
                      </div>
                    )}
                  </div>
                </div>
              </div>
            )}

            {/* Page 5: Experiments */}
            {activePage === 5 && (
              <div className="space-y-6">
                <div>
                  <h4 className="text-xs uppercase tracking-widest opacity-40 mb-3 text-left font-bold font-mono">Chuyển kênh nhanh</h4>
                  <div className="pl-3">
                    {renderBullet(
                      <div className="flex items-center justify-between">
                        <div>
                          <p className="font-semibold text-sm text-left">Chuyển kênh nhanh</p>
                          <p className="text-xs opacity-50 text-left font-normal animate-none">Tính năng nhập nhanh số kênh từ bàn phím điều khiển từ xa để chuyển kênh trực tiếp.</p>
                        </div>
                        <GlassToggle
                          active={!!featureFlags.quick_channel_switch}
                          onToggle={() => setFeatureFlags((prev: any) => ({ ...prev, quick_channel_switch: !prev.quick_channel_switch }))}
                          isDark={isDark}
                        />
                      </div>
                    )}
                  </div>
                </div>

                <div className="pt-4 border-t border-white/5">
                  <h4 className="text-xs uppercase tracking-widest opacity-40 mb-3 text-left font-bold font-mono">Picture in Picture</h4>
                  <div className="pl-3">
                    {renderBullet(
                      <div className="flex items-center justify-between">
                        <div>
                          <p className="font-semibold text-sm text-left">Picture in Picture</p>
                          <p className="text-xs opacity-50 text-left font-normal animate-none">Bật cửa sổ phát mini khi điều hướng sang các phòng khác</p>
                        </div>
                        <GlassToggle
                          active={!!featureFlags.PiP_experimental}
                          onToggle={() => setFeatureFlags((prev: any) => ({ ...prev, PiP_experimental: !prev.PiP_experimental }))}
                          isDark={isDark}
                        />
                      </div>
                    )}
                  </div>
                </div>

                <div className="pt-4 border-t border-white/5">
                  <h4 className="text-xs uppercase tracking-widest opacity-40 mb-3 text-left font-bold font-mono">Dynamic Island</h4>
                  <div className="pl-3">
                    {renderBullet(
                      <div className="flex items-center justify-between">
                        <div>
                          <p className="font-semibold text-sm text-left">Thử nghiệm Dynamic Island</p>
                          <p className="text-xs opacity-50 text-left font-normal animate-none">Thay thế thanh Top bar bằng viên thuốc Dynamic Island co giãn đàn hồi tích hợp tìm kiếm.</p>
                        </div>
                        <GlassToggle
                          active={!!featureFlags.dynamic_island}
                          onToggle={() => setFeatureFlags((prev: any) => ({ ...prev, dynamic_island: !prev.dynamic_island }))}
                          isDark={isDark}
                        />
                      </div>
                    )}
                  </div>
                </div>

                <div className="pt-4 border-t border-white/5 opacity-60">
                  <h4 className="text-xs uppercase tracking-widest opacity-40 mb-3 text-left font-bold font-mono">Các tính năng khác</h4>
                  <div className="pl-3 space-y-2">
                    {renderBullet(
                      <p className="text-sm font-normal text-left">Các tính năng thử nghiệm khác (Multiview, quay màn hình, v.v.) đã chính thức trở thành tính năng chính của hệ thống và được bật mặc định!</p>
                    )}
                  </div>
                </div>
              </div>
            )}

            {/* Page 6: Broadcast Settings (Cài đặt phát sóng) */}
            {activePage === 6 && (
              <div className="space-y-6">
                <div>
                  <h4 className="text-xs uppercase tracking-widest opacity-40 mb-3 text-left font-bold font-mono">Hành vi phát sóng</h4>
                  <div className="pl-3">
                    {renderBullet(
                      <div className="flex items-center justify-between">
                        <div>
                          <p className="font-semibold text-sm text-left">Hiện số trên ô kênh</p>
                          <p className="text-xs opacity-50 text-left font-normal animate-none">Hiện số thứ tự kênh phía trên góc trái của mỗi ô kênh để dễ dàng ghi nhớ và nhập số chuyển kênh nhanh.</p>
                        </div>
                        <GlassToggle
                          active={showChannelNumbers}
                          onToggle={() => setShowChannelNumbers(!showChannelNumbers)}
                          isDark={isDark}
                        />
                      </div>
                    )}
                  </div>
                </div>
              </div>
            )}
          </motion.div>
        )}
        </AnimatePresence>
      </div>
    </div>
  );
}

function SettingsContent({ 
  isDark, 
  setIsDark, 
  isDev, 
  setIsDev, 
  featureFlags,
  setFeatureFlags,
  liquidGlass, 
  setLiquidGlass,
  liquidGlassBlur = 10,
  setLiquidGlassBlur = () => {},
  liquidGlassOpacity = 25,
  setLiquidGlassOpacity = () => {},
  useSidebar,
  setUseSidebar,
  isSidebarRight,
  setIsSidebarRight,
  isSidebarLocked,
  setIsSidebarLocked,
  sidebarDisplay,
  setSidebarDisplay,
  isPinningEnabled,
  setIsPinningEnabled,
  user,
  userData,
  setUserData,
  onAlert,
  onLogin,
  onUpdateLogsClick,
  onResetOnboarding,
  favorites,
  bypassed,
  loadingTreatment,
  setLoadingTreatment,
  tempUnit,
  setTempUnit,
  location,
  setLocation,
  timeFormat,
  setTimeFormat,
  clockFormat,
  setClockFormat,
  dateFormat,
  setDateFormat,
  showClock,
  setShowClock,
  showDate,
  setShowDate,
  showTempInClock,
  setShowTempInClock,
  headingBar,
  setHeadingBar,
  floatyBars,
  setFloatyBars
}: { 
  isDark: boolean, 
  setIsDark: (val: boolean) => void,
  isDev: boolean,
  setIsDev: (val: boolean) => void,
  featureFlags: { [key: string]: boolean },
  setFeatureFlags: (val: { [key: string]: boolean } | ((prev: { [key: string]: boolean }) => { [key: string]: boolean })) => void,
  liquidGlass: "glassy" | "tinted",
  setLiquidGlass: (val: "glassy" | "tinted") => void,
  liquidGlassBlur?: number,
  setLiquidGlassBlur?: (val: number) => void,
  liquidGlassOpacity?: number,
  setLiquidGlassOpacity?: (val: number) => void,
  useSidebar: boolean,
  setUseSidebar: (val: boolean) => void,
  isSidebarRight: boolean,
  setIsSidebarRight: (val: boolean) => void,
  isSidebarLocked: boolean,
  setIsSidebarLocked: (val: boolean) => void,
  sidebarDisplay: "float" | "attach",
  setSidebarDisplay: (val: "float" | "attach") => void,
  isPinningEnabled: boolean,
  setIsPinningEnabled: (val: boolean) => void,
  user: any,
  userData: any,
  setUserData: (val: any) => void,
  onAlert: (title: string, msg: string) => void,
  onLogin: () => void,
  onUpdateLogsClick: () => void,
  onResetOnboarding: () => void,
  favorites: string[],
  bypassed: boolean,
  loadingTreatment: string,
  setLoadingTreatment: (val: string) => void,
  tempUnit: "C" | "F",
  setTempUnit: (val: "C" | "F") => void,
  location: string,
  setLocation: (val: string) => void,
  timeFormat: "24h" | "12h",
  setTimeFormat: (val: "24h" | "12h") => void,
  clockFormat: "hh:mm:ss" | "hh:mm" | "custom",
  setClockFormat: (val: "hh:mm:ss" | "hh:mm" | "custom") => void,
  dateFormat: "dd/mm/yyyy" | "dd/mm/yy" | "dd/mm" | "custom",
  setDateFormat: (val: "dd/mm/yyyy" | "dd/mm/yy" | "dd/mm" | "custom") => void,
  showClock: boolean,
  setShowClock: (val: boolean) => void,
  showDate: boolean,
  setShowDate: (val: boolean) => void,
  showTempInClock: boolean,
  setShowTempInClock: (val: boolean) => void,
  headingBar: boolean,
  setHeadingBar: (val: boolean) => void,
  floatyBars: boolean,
  setFloatyBars: (val: boolean) => void
}) {
  const [name, setName] = useState(user?.displayName || userData?.name || "Vplay User");
  const [avatar, setAvatar] = useState(user?.photoURL || userData?.avatar || "");
  const [saving, setSaving] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    if (user) {
      setName(user.displayName || "Vplay User");
      setAvatar(user.photoURL || "");
    }
  }, [user]);

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onloadend = () => {
        setAvatar(reader.result as string);
      };
      reader.readAsDataURL(file);
    }
  };

  const handleSave = async () => {
    setSaving(true);
    try {
      if (user) {
        await updateProfile(user, {
          displayName: name,
          photoURL: avatar
        });
      }
      
      const userRef = doc(db, "users", user ? user.uid : "bypassed");
      await setDoc(userRef, {
        name,
        avatar,
        updatedAt: new Date().toISOString()
      }, { merge: true });
      
      setUserData({ name, avatar });
      onAlert("Thành công", "Đã cập nhật thông tin cá nhân của bạn!");
    } catch (err: any) {
      onAlert("Lỗi", "Không thể lưu thông tin: " + err.message);
    }
    setSaving(false);
  };
  return (
    <div className="w-full max-w-[1600px] 2xl:max-w-[1800px] mx-auto px-4 md:px-12 pb-32 space-y-6 md:space-y-8">
      {/* 1. Information Section (Top - Full Width) */}
      <div className={`p-6 md:p-12 rounded-[32px] md:rounded-[48px] border relative overflow-hidden transition-all ${isDark ? "bg-black/40 border-white/10 shadow-inner" : "bg-slate-50 border-slate-100 shadow-sm"}`}>
        <div className="absolute top-0 right-0 w-64 md:w-96 h-64 md:h-96 bg-gradient-to-br from-[#4AC4FE]/20 to-cyan-500/10 blur-[80px] md:blur-[120px] -mr-20 -mt-20 md:-mr-32 md:-mt-32" />
        
        <div className="relative z-10 grid grid-cols-1 md:grid-cols-2 gap-8 md:gap-12 items-center">
          <div className="space-y-4 md:space-y-6">
            <div className="flex items-center gap-3 md:gap-4">
              <div className="p-2.5 md:p-3 rounded-xl md:rounded-2xl bg-[#4AC4FE]/10 text-[#4AC4FE]">
                <Info size={24} className="md:w-7 md:h-7" />
              </div>
              <h3 className={`font-bold text-2xl md:text-3xl tracking-tight ${isDark ? "text-white" : "text-slate-900"}`}>Thông tin hệ thống</h3>
            </div>
            
            <div className="flex items-center gap-6 md:gap-8 py-2 md:py-4">
              <div className="relative">
                <div className="absolute inset-0 bg-[#4AC4FE]/20 blur-3xl rounded-full" />
                <img 
                  src="https://static.wikia.nocookie.net/ftv/images/a/a6/Imagedskvjndkv.png/revision/latest?cb=20260430103502&path-prefix=vi"
                  className="w-28 h-28 md:w-40 md:h-40 object-contain relative z-10 drop-shadow-[0_10px_30px_rgba(168,85,247,0.4)]"
                  alt="Vplay App Logo"
                  referrerPolicy="no-referrer"
                />
              </div>
              <div className="space-y-1 md:space-y-2">
                <h2 className="text-3xl md:text-4xl font-bold italic tracking-tighter bg-clip-text text-transparent bg-gradient-to-r from-[#4AC4FE] to-cyan-400">
                  Vplay 2026
                </h2>
                <div className="flex flex-col gap-0.5 md:gap-1">
                  <span className={`text-[9px] md:text-[10px] font-bold tracking-[0.4em] ${isDark ? "text-white/40" : "text-slate-400"}`}>June 2026 Update</span>
                  <div className="flex items-center gap-1.5 md:gap-2">
                    <span className="px-1.5 py-0.5 bg-amber-500/20 text-amber-500 text-[8px] md:text-[9px] font-bold rounded-md uppercase">26M6</span>
                    <span className="px-1.5 py-0.5 bg-cyan-500/20 text-cyan-500 text-[8px] md:text-[9px] font-bold rounded-md uppercase">Version 26.7.0</span>
                  </div>
                </div>
              </div>
            </div>
          </div>

          <div className="grid grid-cols-1 gap-3 md:gap-4">
             <div className={`p-5 md:p-6 rounded-2xl md:rounded-3xl border flex items-center justify-between group transition-all hover:border-[#4AC4FE]/30 ${isDark ? "bg-black/40 border-white/10 shadow-inner" : "bg-slate-50 border-slate-100 shadow-sm"}`}>
               <div className="flex items-center gap-3 md:gap-4">
                 <div className="w-10 h-10 md:w-12 md:h-12 rounded-xl md:rounded-2xl bg-green-500/10 flex items-center justify-center text-green-500">
                    <Activity size={20} className="md:w-6 md:h-6" />
                 </div>
                 <div>
                   <p className="text-[9px] md:text-[10px] font-bold opacity-40 tracking-wider">Phiên bản phát hành</p>
                   <p className={`text-base md:text-lg font-bold ${isDark ? "text-white" : "text-slate-900"}`}>June 2026 Update</p>
                 </div>
               </div>
               <span className="px-3 py-1.5 bg-amber-500 text-slate-900 text-[9px] md:text-[10px] font-bold rounded-lg md:rounded-xl shadow-lg shadow-amber-500/30">Version 26.7.0</span>
             </div>

             <div className="grid grid-cols-2 gap-3 md:gap-4">
                <div className={`p-4 md:p-6 rounded-2xl md:rounded-3xl border flex items-center gap-3 md:gap-4 ${isDark ? "bg-black/40 border-white/10 shadow-inner" : "bg-slate-50 border-slate-100 shadow-sm"}`}>
                   <div className="w-8 h-8 md:w-10 md:h-10 rounded-lg md:rounded-xl bg-blue-500/10 flex items-center justify-center text-blue-500">
                      <Terminal size={18} className="md:w-5 md:h-5" />
                   </div>
                   <div>
                     <p className="text-[8px] md:text-[10px] font-bold opacity-40 tracking-wider">Nhánh</p>
                     <p className={`text-sm md:text-base font-bold ${isDark ? "text-white" : "text-slate-900"}`}>Dev</p>
                   </div>
                </div>
                <div className={`p-4 md:p-6 rounded-2xl md:rounded-3xl border flex items-center gap-3 md:gap-4 ${isDark ? "bg-black/40 border-white/10 shadow-inner" : "bg-slate-50 border-slate-100 shadow-sm"}`}>
                   <div className="w-8 h-8 md:w-10 md:h-10 rounded-lg md:rounded-xl bg-amber-500/10 flex items-center justify-center text-amber-500">
                      <Zap size={18} className="md:w-5 md:h-5" />
                   </div>
                   <div>
                     <p className="text-[8px] md:text-[10px] font-bold opacity-40 tracking-wider">Bản dựng</p>
                     <p className={`text-sm md:text-base font-bold ${isDark ? "text-white" : "text-slate-900"}`}>26601</p>
                   </div>
                </div>
             </div>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 md:gap-8 items-stretch">
        {/* Profile Section */}
        <div className={`p-6 md:p-10 rounded-[32px] md:rounded-[48px] border flex flex-col transition-all ${isDark ? "bg-black/40 border-white/10 shadow-inner" : "bg-slate-50 border-slate-100 shadow-sm"}`}>
          <div className="flex items-center gap-4 mb-6 md:mb-10">
            <div className="p-2.5 md:p-3 rounded-xl md:rounded-2xl bg-[#4AC4FE]/20 text-[#4AC4FE]">
              <AccountIcon size={24} className="md:w-6 md:h-6" />
            </div>
            <h3 className={`font-bold text-xl md:text-2xl tracking-tight ${isDark ? "text-white" : "text-slate-900"}`}>Tài khoản cá nhân</h3>
          </div>

          {!user && !bypassed ? (
            <div className="flex-1 flex flex-col items-center justify-center text-center gap-8 py-4">
              <div className={`w-32 h-32 rounded-[40px] flex items-center justify-center border-4 ${isDark ? "bg-slate-800 border-slate-700" : "bg-slate-50 border-white shadow-inner"}`}>
                <AccountIcon size={64} className="text-slate-400 opacity-20" />
              </div>
              <div className="space-y-2">
                <p className={`text-xl font-bold ${isDark ? "text-white" : "text-slate-900"}`}>Chưa đăng nhập</p>
                <p className="text-sm text-slate-500 font-medium">Đăng nhập để đồng bộ dữ liệu của bạn</p>
              </div>
              <button 
                onClick={onLogin}
                className="btn-vibrant-3d w-full py-4 text-base flex items-center justify-center gap-3"
              >
                <SignInIcon size={20} /> ĐĂNG NHẬP NGAY
              </button>
            </div>
          ) : (
            <div className="space-y-8 flex-1 flex flex-col">
              {!user && (
                <div className="p-4 bg-red-500/10 border border-red-500/20 rounded-[22px] flex items-center gap-3 text-red-400 text-xs font-semibold">
                  <Info size={16} className="shrink-0" />
                  <span>Bạn đang truy cập dưới tư cách Khách. Vui lòng đăng nhập thực tế để upload ảnh đại diện có độ trong suốt và chỉnh sửa thông tin cá nhân!</span>
                </div>
              )}

              <div className="flex flex-col md:flex-row items-center gap-8">
                <div 
                  className={`relative group ${user ? "cursor-pointer" : "cursor-not-allowed"}`} 
                  onClick={() => {
                    if (!user) {
                      onAlert("Yêu cầu đăng nhập", "Chức năng thay đổi avatar và tải ảnh lên từ thiết bị chỉ khả dụng cho người dùng đã đăng nhập!");
                      return;
                    }
                    fileInputRef.current?.click();
                  }}
                >
                  <div className="absolute inset-0 bg-[#4AC4FE]/20 blur-xl rounded-full scale-125" />
                  {/* Checkerboard transparency grid background */}
                  <div className="w-28 h-28 rounded-[32px] border-4 border-white/10 relative z-10 shadow-2xl overflow-hidden bg-[linear-gradient(45deg,#ccc_25%,transparent_25%,transparent_75%,#ccc_75%,#ccc_100%),linear-gradient(45deg,#ccc_25%,white_25%,white_75%,#ccc_75%,#ccc_100%)] bg-[size:16px_16px] bg-[position:0_0,8px_8px]">
                    {avatar ? (
                      <img src={avatar} alt="Avatar" className="w-full h-full object-cover relative z-10" referrerPolicy="no-referrer" />
                    ) : (
                      <div className={`w-full h-full flex items-center justify-center ${isDark ? "bg-slate-800" : "bg-slate-100"}`}>
                        <AccountIcon size={56} className="text-slate-400 opacity-20" />
                      </div>
                    )}
                  </div>
                  {user && (
                    <div className="absolute inset-0 bg-black/60 rounded-[32px] flex flex-col items-center justify-center opacity-0 group-hover:opacity-100 transition-all duration-300 z-20">
                      <Camera className="text-white w-8 h-8" />
                    </div>
                  )}
                  <input type="file" accept="image/*" ref={fileInputRef} onChange={handleFileChange} className="hidden" />
                </div>
                
                <div className="flex-1 space-y-4 w-full">
                  <div className="space-y-2">
                    <label className="text-[10px] font-bold uppercase tracking-[0.2em] opacity-30 ml-2">Tên hiển thị</label>
                    <div className={`relative group rounded-[22px] overflow-hidden transition-all ${isDark ? "bg-white/5" : "bg-slate-50"}`}>
                      <input 
                        value={name} 
                        onChange={e => {
                          if (!user) {
                            onAlert("Yêu cầu đăng nhập", "Tính năng chỉnh sửa tên chỉ dành cho tài khoản đã đăng nhập!");
                            return;
                          }
                          setName(e.target.value);
                        }} 
                        disabled={!user}
                        placeholder={user ? "Tên của bạn..." : "Khách chưa đăng nhập..."}
                        className={`w-full px-5 py-3.5 text-base font-bold bg-transparent outline-none transition-all ${
                          isDark ? "text-white placeholder-white/20" : "text-slate-900 placeholder-slate-400"
                        } disabled:opacity-50`} 
                      />
                    </div>
                  </div>
                  <div className="flex gap-3">
                    <button 
                      onClick={() => {
                        if (!user) {
                          onAlert("Yêu cầu đăng nhập", "Vui lòng đăng nhập thực tế để lưu thay đổi thông tin cá nhân!");
                          return;
                        }
                        handleSave();
                      }} 
                      disabled={saving || !user}
                      className="btn-purple-3d flex-1 text-xs py-3 disabled:opacity-50 flex items-center justify-center gap-2 rounded-xl"
                    >
                      <CheckCircle2 size={16} /> {saving ? "Đang lưu..." : "Lưu thay đổi"}
                    </button>
                    <button 
                      onClick={() => signOut(auth)}
                      className={`p-3 rounded-xl border transition-all active:translate-y-1 ${isDark ? "bg-red-500/10 border-red-500/10 text-red-500" : "bg-red-50 border-red-100 text-red-600 shadow-xl"}`}
                    >
                      <SignOutIcon size={18} />
                    </button>
                  </div>
                </div>
              </div>

              {/* Quick Select Preset Transparent Avatars */}
              {user && (
                <div className="space-y-3 pt-4 border-t border-white/5">
                  <label className="text-[10px] font-bold uppercase tracking-[0.15em] opacity-40 ml-1">Chọn nhanh avatar Vplay trong suốt</label>
                  <div className="flex flex-wrap gap-3">
                    {[
                      "https://img.icons8.com/color/144/anonymous-mask.png",
                      "https://img.icons8.com/color/144/superhero.png",
                      "https://img.icons8.com/color/144/ninja.png",
                      "https://img.icons8.com/color/144/cyborg.png",
                      "https://img.icons8.com/color/144/hacker.png"
                    ].map((p, idx) => (
                      <button
                        key={idx}
                        onClick={() => setAvatar(p)}
                        className={`w-14 h-14 rounded-2xl p-2 bg-slate-800/40 border-2 transition-all hover:scale-105 active:scale-95 ${avatar === p ? "border-[#4AC4FE] bg-[#4AC4FE]/10" : "border-white/5 hover:border-white/10"}`}
                        title="Chọn avatar nhanh"
                      >
                        <img src={p} alt={`Preset ${idx}`} className="w-full h-full object-contain" referrerPolicy="no-referrer" />
                      </button>
                    ))}
                  </div>
                </div>
              )}
            </div>
          )}
        </div>

        {/* Community Section */}
        <div className={`p-6 md:p-10 rounded-[32px] md:rounded-[48px] border flex flex-col justify-between transition-all ${isDark ? "bg-black/40 border-white/10 shadow-inner" : "bg-slate-50 border-slate-100 shadow-sm"}`}>
          <div className="space-y-6 md:space-y-8">
            <div className="flex items-center gap-3">
              <div className="p-2 rounded-xl bg-blue-500/20 text-blue-500">
                <CommunityIcon size={20} />
              </div>
              <h3 className={`font-bold text-xl tracking-tight ${isDark ? "text-white" : "text-slate-900"}`}>Cộng đồng</h3>
            </div>

            <div className="space-y-3">
              <a 
                href="https://discord.gg/CNKFTUBSty" 
                target="_blank" 
                rel="noopener noreferrer"
                className={`flex items-center justify-between p-4 rounded-[24px] border transition-all active:scale-[0.98] group ${
                  isDark ? "bg-black/20 border-white/5 hover:bg-black/30 shadow-2xl" : "bg-slate-100/50 border-slate-100 hover:bg-slate-100 shadow-xl"
                }`}
              >
                <div className="flex items-center gap-4">
                  <div className="w-12 h-12 rounded-[18px] bg-indigo-500 text-white flex items-center justify-center shadow-lg shadow-indigo-500/20">
                    <MessageSquare size={24} />
                  </div>
                  <div>
                    <h4 className={`text-lg font-bold ${isDark ? "text-white" : "text-slate-900"}`}>THE WAVES</h4>
                    <p className={`text-[9px] opacity-60 font-bold tracking-[0.2em] leading-none mt-1`}>Official Discord</p>
                  </div>
                </div>
                <ChevronRight size={20} className="text-slate-500 group-hover:translate-x-2 transition-transform" />
              </a>

              <div className="grid grid-cols-2 gap-3">
                {[1, 2].map(num => (
                  <a 
                    key={`yt-link-${num}`}
                    href={`https://www.youtube.com/@ota${num === 1 ? 'one' : 'two'}fr253`} 
                    target="_blank" 
                    rel="noopener noreferrer"
                    className={`flex items-center gap-3 p-3.5 rounded-[20px] border text-[10px] font-bold transition-all group ${
                      isDark ? "bg-black/20 border-white/5 hover:bg-black/30 text-slate-300" : "bg-slate-100/50 border-slate-100 hover:bg-slate-100 text-slate-600 shadow-sm"
                    }`}
                  >
                    <div className="w-8 h-8 rounded-full bg-red-600 flex items-center justify-center text-white shrink-0 shadow-lg group-hover:scale-110 transition-transform">
                      <Play size={12} fill="currentColor" />
                    </div>
                    <span className="tracking-widest uppercase">YT #{num}</span>
                  </a>
                ))}
              </div>
            </div>
          </div>
        </div>
      </div>


      {/* Appearance & Experience */}
      <div className={`p-6 md:p-10 rounded-[32px] border flex flex-col transition-all w-full mt-8 ${isDark ? "bg-black/40 border-white/10 shadow-inner" : "bg-slate-50 border-slate-100 shadow-sm"}`}>
        <div className="flex flex-col md:flex-row items-center gap-3 mb-8 md:mb-10">
          <div className="p-2 md:p-3 rounded-xl md:rounded-2xl bg-[#4AC4FE]/10 text-[#4AC4FE]">
            <Palette size={24} className="md:w-6 md:h-6" />
          </div>
          <div className="text-center md:text-left">
            <h3 className={`font-bold text-xl md:text-2xl tracking-tight ${isDark ? "text-white" : "text-slate-900"}`}>Giao diện & Trải nghiệm</h3>
          </div>
        </div>

        <div className="space-y-8 md:space-y-10">
          {/* 1. Chủ đề hệ thống */}
          <div className="space-y-4 md:space-y-6">
            <div className="flex flex-col md:flex-row items-center md:items-start gap-2 px-1 text-center md:text-left">
              <Sun size={20} className="text-amber-500" />
              <div>
                <span className="text-base md:text-lg font-bold opacity-80 uppercase tracking-wider">Chủ đề hệ thống</span>
                <p className="text-xs text-slate-500 font-bold mt-0.5">Chọn cách hiển thị phù hợp cho mắt của bạn</p>
              </div>
            </div>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 md:gap-4">
              <button 
                onClick={() => setIsDark(false)}
                className={`transition-all flex items-center justify-between sm:justify-center px-4 sm:px-0 gap-3 group h-12 md:h-14 rounded-xl ${!isDark ? "btn-vibrant-3d" : isDark ? "bg-[#1f2937] border border-white/10 text-white/40" : "bg-slate-100 border border-slate-200 text-slate-400"}`}
              >
                <div className="flex items-center gap-2">
                  <Sun size={20} className={!isDark ? "text-white" : "text-slate-400 group-hover:text-amber-500"} />
                  <span className="text-sm sm:text-base font-bold opacity-80 group-hover:opacity-100 transition-opacity">Sáng</span>
                </div>
                {!isDark && (
                  <CheckCircle2 size={16} className="sm:hidden text-white" />
                )}
              </button>
              <button 
                onClick={() => setIsDark(true)}
                className={`transition-all flex items-center justify-between sm:justify-center px-4 sm:px-0 gap-3 group h-12 md:h-14 rounded-xl ${isDark ? "btn-vibrant-3d" : !isDark ? "bg-slate-100 border border-slate-200 text-slate-400" : "bg-[#1f2937] border border-white/10 text-white/40"}`}
              >
                <div className="flex items-center gap-2">
                  <Moon size={20} className={isDark ? "text-white" : "text-slate-400 group-hover:text-[#4AC4FE]"} />
                  <span className="text-sm sm:text-base font-bold opacity-80 group-hover:opacity-100 transition-opacity">Tối</span>
                </div>
                {isDark && (
                  <CheckCircle2 size={16} className="sm:hidden text-white" />
                )}
              </button>
            </div>
          </div>

          {/* 2. Kiểu giao diện */}
          <div className="space-y-4 md:space-y-6">
            <div className="flex flex-col md:flex-row items-center md:items-start gap-2 px-1 text-center md:text-left">
              <Monitor size={20} className="text-blue-500" />
              <div>
                <span className="text-base md:text-lg font-bold opacity-80 uppercase tracking-wider">Giao diện điều hướng</span>
                <p className="text-xs text-slate-500 font-bold mt-0.5">Chọn điều hướng hiển thị tốt nhất trên thiết bị của bạn</p>
              </div>
            </div>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 md:gap-4">
            <button 
              onClick={() => setUseSidebar(true)}
              className={`transition-all flex items-center justify-between sm:justify-center px-4 sm:px-0 gap-3 group h-12 md:h-14 rounded-xl ${useSidebar ? "btn-vibrant-3d" : isDark ? "bg-[#1f2937] border border-white/10 text-white/40" : "bg-slate-100 border border-slate-200 text-slate-400"}`}
            >
              <div className="flex items-center gap-2">
                <Monitor size={20} className={useSidebar ? "text-white" : "text-slate-400 group-hover:text-blue-400"} />
                <span className="text-sm sm:text-base font-bold">Desktop</span>
              </div>
              {useSidebar && <CheckCircle2 size={16} className="sm:hidden text-white" />}
            </button>
            <button 
              onClick={() => setUseSidebar(false)}
              className={`transition-all flex items-center justify-between sm:justify-center px-4 sm:px-0 gap-3 group h-12 md:h-14 rounded-xl ${!useSidebar ? "btn-vibrant-3d" : isDark ? "bg-[#1f2937] border border-white/10 text-white/40" : "bg-slate-100 border border-slate-200 text-slate-400"}`}
            >
              <div className="flex items-center gap-2">
                <Navigation size={20} className={!useSidebar ? "text-white" : "text-slate-400 group-hover:text-[#4AC4FE]"} />
                <span className="text-sm sm:text-base font-bold">Touch</span>
              </div>
              {!useSidebar && <CheckCircle2 size={16} className="sm:hidden text-white" />}
            </button>
          </div>
          </div>

          <AnimatePresence mode="popLayout">
            {/* 2a. Position & Display (Desktop only) */}
            {useSidebar && (
              <motion.div 
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: 20 }}
                className="space-y-10"
              >
                <div className="space-y-4 md:space-y-6">
                  <div className="flex flex-col md:flex-row items-center md:items-start gap-2 px-1 text-center md:text-left">
                    <Layout size={20} className="text-indigo-500" />
                    <div>
                      <span className="text-base md:text-lg font-bold opacity-80 uppercase tracking-wider">Vị trí Sidebar</span>
                      <p className="text-xs text-slate-500 font-bold mt-0.5">Chọn vị trí đặt Sidebar thuận tiện cho bạn - trái hoặc phải</p>
                    </div>
                  </div>
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 md:gap-4">
                    <button 
                      onClick={() => setIsSidebarRight(false)}
                      className={`transition-all flex items-center justify-between sm:justify-center px-4 sm:px-0 gap-3 group h-12 md:h-14 rounded-xl ${!isSidebarRight ? "btn-vibrant-3d" : isDark ? "bg-[#1f2937] border border-white/10 text-white/40" : "bg-slate-100 border border-slate-200 text-slate-400"}`}
                    >
                      <div className="flex items-center gap-2">
                        <ArrowLeft size={20} className={!isSidebarRight ? "text-white" : "text-slate-400 group-hover:text-amber-500"} />
                        <span className="text-sm sm:text-base font-bold">Bên trái</span>
                      </div>
                      {!isSidebarRight && <CheckCircle2 size={16} className="sm:hidden text-white" />}
                    </button>
                    <button 
                      onClick={() => setIsSidebarRight(true)}
                      className={`transition-all flex items-center justify-between sm:justify-center px-4 sm:px-0 gap-3 group h-12 md:h-14 rounded-xl ${isSidebarRight ? "btn-vibrant-3d" : isDark ? "bg-[#1f2937] border border-white/10 text-white/40" : "bg-slate-100 border border-slate-200 text-slate-400"}`}
                    >
                      <div className="flex items-center gap-2">
                        <ArrowRight size={20} className={isSidebarRight ? "text-white" : "text-slate-400 group-hover:text-[#4AC4FE]"} />
                        <span className="text-sm font-bold">Bên phải</span>
                      </div>
                      {isSidebarRight && <CheckCircle2 size={16} className="sm:hidden text-white" />}
                    </button>
                  </div>
                </div>

                <div className="space-y-4 md:space-y-6">
                  <div className="flex flex-col md:flex-row items-center md:items-start gap-2 px-1 text-center md:text-left">
                    <Layers size={20} className="text-cyan-500" />
                    <div>
                      <span className="text-base md:text-lg font-bold opacity-80 uppercase tracking-wider">Hiển thị Sidebar</span>
                      <p className="text-xs text-slate-500 font-bold mt-0.5">Chọn cách Sidebar hiển thị - lơ lửng hay chạm góc</p>
                    </div>
                  </div>
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 md:gap-4">
                    <button 
                      onClick={() => setSidebarDisplay("float")}
                      className={`transition-all flex items-center justify-center gap-3 group h-12 md:h-14 rounded-xl ${sidebarDisplay === "float" ? "btn-vibrant-3d" : isDark ? "bg-[#1f2937] border border-white/10 text-white/40" : "bg-slate-100 border border-slate-200 text-slate-400"}`}
                    >
                      <Layers size={20} className={sidebarDisplay === "float" ? "text-white" : "text-slate-400 group-hover:text-indigo-400"} />
                      <span className="text-base font-bold">Lơ lửng</span>
                    </button>
                    <button 
                      onClick={() => setSidebarDisplay("attach")}
                      className={`transition-all flex items-center justify-center gap-3 group h-12 md:h-14 rounded-xl ${sidebarDisplay === "attach" ? "btn-vibrant-3d" : isDark ? "bg-[#1f2937] border border-white/10 text-white/40" : "bg-slate-100 border border-slate-200 text-slate-400"}`}
                    >
                      <Square size={20} className={sidebarDisplay === "attach" ? "text-white" : "text-slate-400 group-hover:text-indigo-400"} />
                      <span className="text-base font-bold">Chạm góc</span>
                    </button>
                  </div>
                </div>
              </motion.div>
            )}

            {/* 2b. Liquid Glass */}
              <motion.div 
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: 20 }}
                className="space-y-4 md:space-y-6"
              >
                <div className="flex flex-col md:flex-row items-center md:items-start gap-2 px-1 text-center md:text-left">
                  <Droplet size={20} className="text-cyan-500" />
                  <div>
                    <span className="text-base md:text-lg font-bold opacity-80 uppercase tracking-wider">Hiệu ứng Liquid Glass</span>
                    <p className="text-xs text-slate-500 font-bold mt-0.5">Cá nhân hóa hiệu ứng phản xạ kính trên giao diện</p>
                  </div>
                </div>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 md:gap-4">
                  <button 
                    onClick={() => setLiquidGlass("glassy")}
                    className={`transition-all flex items-center justify-center gap-3 group h-12 md:h-14 rounded-xl ${liquidGlass === "glassy" ? "btn-vibrant-3d" : isDark ? "bg-[#1f2937] border border-white/10 text-white/40" : "bg-slate-100 border border-slate-200 text-slate-400"}`}
                  >
                    <Droplet size={20} className={liquidGlass === "glassy" ? "text-white" : "text-slate-400 group-hover:text-cyan-500"} />
                    <span className="text-base font-bold">Glassy</span>
                  </button>
                  <button 
                    onClick={() => setLiquidGlass("tinted")}
                    className={`transition-all flex items-center justify-center gap-3 group h-12 md:h-14 rounded-xl ${liquidGlass === "tinted" ? "btn-vibrant-3d" : isDark ? "bg-[#1f2937] border border-white/10 text-white/40" : "bg-slate-100 border border-slate-200 text-slate-400"}`}
                  >
                    <Droplet size={20} className={liquidGlass === "tinted" ? "text-white" : "text-slate-400 group-hover:text-cyan-500"} />
                    <span className="text-base font-bold">Tinted</span>
                  </button>
                </div>

                {/* Preview Image for Liquid Glass */}
                <div className="mt-4 rounded-3xl overflow-hidden border border-white/10 shadow-2xl aspect-video relative group">
                  <img 
                    src="https://substackcdn.com/image/fetch/$s_!6L_D!,f_auto,q_auto:good,fl_progressive:steep/https%3A%2F%2Fsubstack-post-media.s3.amazonaws.com%2Fpublic%2Fimages%2F1b529a92-54ae-477e-87f6-27674b483077_960x540.gif"
                    className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-110"
                    alt="Liquid Glass Preview"
                    referrerPolicy="no-referrer"
                  />
                  <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-transparent to-transparent flex items-end p-4">
                    <p className="text-[10px] font-black text-white/80 uppercase tracking-[0.3em]">Bản xem trước Giao diện</p>
                  </div>
                </div>
              </motion.div>
          </AnimatePresence>

          {/* Regular toggles grouped into one container with iOS-style dividers */}
          <div className={`rounded-[32px] overflow-hidden border-2 transition-all ${isDark ? "bg-white/5 border-white/10 shadow-xl" : "bg-slate-50 border-slate-200 shadow-sm"}`}>
            {/* 5. Ghim kênh (Truy cập nhanh) */}
            <div className={`flex flex-col sm:flex-row items-start sm:items-center justify-between p-5 md:p-8 transition-all hover:bg-black/5 gap-4`}>
              <div className="flex items-start md:items-center gap-4 md:gap-5">
                <div className="p-3 md:p-4 rounded-2xl bg-pink-500/10 text-pink-500 shrink-0">
                  <Pin size={24} className="md:w-7 md:h-7" />
                </div>
                <div className="text-left space-y-1">
                  <p className="text-base md:text-lg font-bold">Truy cập nhanh</p>
                  <p className={`text-xs md:text-sm font-bold opacity-60 leading-tight ${isDark ? "text-white" : "text-slate-500"}`}>Hiển thị các kênh thêm vào danh sách yêu thích trên Sidebar</p>
                </div>
              </div>
              <button 
                onClick={() => setIsPinningEnabled(!isPinningEnabled)}
                className={`w-14 md:w-16 h-7 md:h-8 rounded-full transition-all relative border-2 shrink-0 self-end sm:self-center ${isPinningEnabled ? "bg-[#4AC4FE]/30 border-[#4AC4FE]/40" : "bg-transparent border-slate-700/30"}`}
              >
                <motion.div 
                  animate={{ 
                    x: isPinningEnabled ? 28 : 4,
                  }}
                  initial={false}
                  transition={{ type: "spring", damping: 20, stiffness: 200 }}
                  className={`absolute top-[2px] h-[18px] md:h-[22px] w-[26px] md:w-[30px] rounded-full shadow-sm transition-colors ${isPinningEnabled ? "bg-white" : "bg-white"}`}
                />
              </button>
            </div>

            <div className={`h-[1px] mx-5 md:mx-8 ${isDark ? "bg-white/10" : "bg-slate-200"}`} />

            {/* 6. Giảm chuyển động */}
            <div className={`flex flex-col sm:flex-row items-start sm:items-center justify-between p-5 md:p-8 transition-all hover:bg-black/5 gap-4`}>
              <div className="flex items-start md:items-center gap-4 md:gap-5">
                <div className="p-3 md:p-4 rounded-2xl bg-[#4AC4FE]/10 text-[#4AC4FE] shrink-0">
                  <Zap size={24} className="md:w-7 md:h-7" />
                </div>
                <div className="text-left space-y-1">
                  <p className="text-base md:text-lg font-bold">Giảm chuyển động</p>
                  <p className={`text-xs md:text-sm font-bold opacity-60 leading-tight ${isDark ? "text-white" : "text-slate-500"}`}>Giảm các hiệu ứng chuyển động để tối ưu hiệu suất</p>
                </div>
              </div>
              <button 
                onClick={() => setFeatureFlags(prev => ({ ...prev, disable_animation: !prev.disable_animation }))}
                className={`w-14 md:w-16 h-7 md:h-8 rounded-full transition-all relative border-2 shrink-0 self-end sm:self-center ${featureFlags.disable_animation ? "bg-[#4AC4FE]/30 border-[#4AC4FE]/40" : "bg-transparent border-slate-700/30"}`}
              >
                <motion.div 
                  animate={{ 
                    x: featureFlags.disable_animation ? 28 : 4,
                  }}
                  initial={false}
                  transition={{ type: "spring", damping: 20, stiffness: 200 }}
                  className={`absolute top-[2px] h-[18px] md:h-[22px] w-[26px] md:w-[30px] rounded-full shadow-sm transition-colors ${featureFlags.disable_animation ? "bg-white" : "bg-white"}`}
                />
              </button>
            </div>

            <div className={`h-[1px] mx-5 md:mx-8 ${isDark ? "bg-white/10" : "bg-slate-200"}`} />

          </div>

          <div className="flex justify-end pt-4">
            <button 
              onClick={() => {
                setIsDark(true);
                setUseSidebar(true);
                setIsSidebarRight(false);
                setSidebarDisplay("float");
                setLiquidGlass("glassy");
                setIsPinningEnabled(true);
                setFeatureFlags(prev => ({ ...prev, disable_animation: false }));
                onAlert("Khôi phục", "Đã khôi phục cài đặt gốc mục Giao diện & Trải nghiệm!");
              }}
              className={`flex items-center gap-2 px-5 py-2.5 text-xs font-bold uppercase tracking-wider rounded-full transition-all shadow-sm active:translate-y-0.5 border ${
                isDark 
                  ? "bg-white/5 border-white/10 hover:bg-white/10 text-white/70 hover:text-white" 
                  : "bg-slate-100 border-slate-200 hover:bg-slate-200 text-slate-600 hover:text-slate-800"
              }`}
            >
              <RotateCcw size={14} className="animate-spin-once" />
              Khôi phục cài đặt gốc
            </button>
          </div>

          {/* Experimental separated block removed - moved to Thử nghiệm tab */}
        </div>
      </div>

      {/* Weather Settings */}
      <div className={`p-6 md:p-10 rounded-[32px] border flex flex-col transition-all w-full mt-6 md:mt-8 ${isDark ? "bg-black/40 border-white/10 shadow-inner" : "bg-slate-50 border-slate-100 shadow-sm"}`}>
        <div className="flex items-center gap-3 mb-8 md:mb-10">
          <div className="p-2 md:p-3 rounded-xl md:rounded-2xl bg-blue-500/10 text-blue-500">
            <Globe size={24} className="md:w-6 md:h-6" />
          </div>
          <h3 className={`font-bold text-xl md:text-2xl tracking-tight ${isDark ? "text-white" : "text-slate-900"}`}>Thời tiết</h3>
        </div>

        <div className="space-y-8">
          {/* Unit selection */}
          <div className="space-y-4">
            <div className="flex items-center gap-2">
              <Droplet size={18} className="text-cyan-500" />
              <p className="font-bold text-base opacity-80 uppercase tracking-widest leading-none">Đơn bị nhiệt độ</p>
            </div>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              <button onClick={() => setTempUnit("C")} className={`h-10 md:h-12 rounded-xl font-bold text-base transition-all ${tempUnit === "C" ? "btn-vibrant-3d" : isDark ? "bg-[#1f2937] border border-white/5 text-white/40" : "bg-black/5 border border-black/5 text-black/40"}`}>
                Độ C (°C)
              </button>
              <button onClick={() => setTempUnit("F")} className={`h-10 md:h-12 rounded-xl font-bold text-base transition-all ${tempUnit === "F" ? "btn-vibrant-3d" : isDark ? "bg-[#1f2937] border border-white/5 text-white/40" : "bg-black/5 border border-black/5 text-black/40"}`}>
                Độ F (°F)
              </button>
            </div>
          </div>

          {/* Location customization */}
          <div className="space-y-3">
            <div className="flex items-center gap-2">
              <Navigation size={18} className="text-emerald-500" />
              <p className="font-bold text-base opacity-80 uppercase tracking-widest leading-none">Vị trí tùy chỉnh</p>
            </div>
            <div className={`relative group rounded-2xl overflow-hidden transition-all ${isDark ? "bg-white/5 shadow-inner border border-white/5" : "bg-slate-100 shadow-sm border border-slate-200"}`}>
              <input 
                value={location} 
                onChange={e => setLocation(e.target.value)} 
                placeholder="Nhập tên thành phố (vd: Hanoi, Saigon)..."
                className={`w-full px-6 py-4 text-base font-bold bg-transparent outline-none transition-all ${
                  isDark ? "text-white placeholder-white/20" : "text-slate-900 placeholder-slate-400"
                }`} 
              />
            </div>
          </div>

          <div className="flex justify-end pt-4">
            <button 
              onClick={() => {
                setTempUnit("C");
                setLocation("");
                onAlert("Khôi phục", "Đã khôi phục cài đặt gốc mục Thời tiết!");
              }}
              className={`flex items-center gap-2 px-5 py-2.5 text-xs font-bold uppercase tracking-wider rounded-full transition-all shadow-sm active:translate-y-0.5 border ${
                isDark 
                  ? "bg-white/5 border-white/10 hover:bg-white/10 text-white/70 hover:text-white" 
                  : "bg-slate-100 border-slate-200 hover:bg-slate-200 text-slate-600 hover:text-slate-800"
              }`}
            >
              <RotateCcw size={14} className="animate-spin-once" />
              Khôi phục cài đặt gốc
            </button>
          </div>

        </div>
      </div>

      {/* Clock & Formatting Settings */}
      <div className={`p-6 md:p-10 rounded-[32px] border flex flex-col transition-all w-full mt-6 md:mt-8 ${isDark ? "bg-black/40 border-white/10 shadow-inner" : "bg-slate-50 border-slate-100 shadow-sm"}`}>
        <div className="flex items-center gap-3 mb-8 md:mb-10">
          <div className="p-2 md:p-3 rounded-xl md:rounded-2xl bg-amber-500/10 text-amber-500">
            <Clock size={24} className="md:w-6 md:h-6" />
          </div>
          <h3 className={`font-bold text-xl md:text-2xl tracking-tight ${isDark ? "text-white" : "text-slate-900"}`}>Đồng hồ & Thời gian</h3>
        </div>

        <div className="space-y-8">
          {/* 1. Time Format 24h vs 12h */}
          <div className="space-y-4">
            <div className="flex items-center gap-2">
              <Zap size={18} className="text-[#4AC4FE]" />
              <p className="font-bold text-base opacity-80 uppercase tracking-widest leading-none">Chế độ hiển thị</p>
            </div>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              <button 
                onClick={() => setTimeFormat("24h")}
                className={`h-10 md:h-12 rounded-xl font-bold text-base transition-all flex items-center justify-center gap-3 ${timeFormat === "24h" ? "btn-vibrant-3d" : isDark ? "bg-[#1f2937] text-white/40 border border-white/5" : "bg-black/5 text-slate-400 border border-black/5"}`}
              >
                24 Giờ
              </button>
              <button 
                onClick={() => setTimeFormat("12h")}
                className={`h-10 md:h-12 rounded-xl font-bold text-base transition-all flex items-center justify-center gap-3 ${timeFormat === "12h" ? "btn-vibrant-3d" : isDark ? "bg-[#1f2937] text-white/40 border border-white/5" : "bg-black/5 text-slate-400 border border-black/5"}`}
              >
                12 Giờ
              </button>
            </div>
          </div>

          {/* 2. Clock Format selection */}
          <div className="space-y-4">
            <div className="flex items-center gap-2">
              <Sliders size={18} className="text-blue-500" />
              <p className="font-bold text-base opacity-80 uppercase tracking-widest leading-none">Định dạng hiển thị Giờ</p>
            </div>
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-2">
              {[
                { id: "hh:mm:ss", label: "hh:mm:ss" },
                { id: "hh:mm", label: "hh:mm" },
                { id: "custom", label: "Tùy chỉnh" }
              ].map(opt => (
                <button 
                  key={opt.id}
                  onClick={() => setClockFormat(opt.id as any)}
                  className={`h-9 md:h-11 rounded-lg font-bold text-xs transition-all ${clockFormat === opt.id ? "btn-vibrant-3d" : isDark ? "bg-[#1f2937] text-white/40" : "bg-black/5 text-slate-500"}`}
                >
                  {opt.label}
                </button>
              ))}
            </div>
          </div>

          {/* 3. Date Format selection */}
          <div className="space-y-4">
            <div className="flex items-center gap-2">
              <Calendar size={18} className="text-red-500" />
              <p className="font-bold text-base opacity-80 uppercase tracking-widest leading-none">Định dạng hiển thị Ngày</p>
            </div>
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-2">
              {[
                { id: "dd/mm/yyyy", label: "dd/mm/yyyy" },
                { id: "dd/mm/yy", label: "dd/mm/yy" },
                { id: "dd/mm", label: "dd/mm" },
                { id: "custom", label: "Tùy chỉnh" }
              ].map(opt => (
                <button 
                  key={opt.id}
                  onClick={() => setDateFormat(opt.id as any)}
                  className={`h-9 md:h-11 rounded-lg font-bold text-[9px] transition-all px-1.5 ${dateFormat === opt.id ? "btn-vibrant-3d" : isDark ? "bg-[#1f2937] text-white/40" : "bg-black/5 text-slate-500"}`}
                >
                  {opt.label}
                </button>
              ))}
            </div>
          </div>

          {/* 4. Show temp in clock toggle */}
          <div className={`flex flex-col sm:flex-row items-start sm:items-center justify-between p-6 md:p-8 transition-all hover:bg-black/5 gap-4 rounded-[40px] border-2 mt-4 ${isDark ? "bg-white/5 border-white/5" : "bg-slate-50 border-slate-200 shadow-sm"}`}>
              <div className="flex items-start md:items-center gap-4">
                <div className="p-3 md:p-4 rounded-2xl bg-cyan-500/10 text-cyan-500 shrink-0">
                  <Sun size={24} className="md:w-7 md:h-7" />
                </div>
                <div className="text-left space-y-1">
                  <p className="text-base md:text-lg font-bold">Hiển thị nhiệt độ</p>
                  <p className={`text-xs md:text-sm font-bold opacity-60 leading-tight ${isDark ? "text-white" : "text-slate-500"}`}>Hiển thị nhiệt độ cạnh đồng hồ và ngày tháng tại sidebar</p>
                </div>
              </div>
              <button 
                onClick={() => setShowTempInClock(!showTempInClock)}
                className={`w-14 md:w-16 h-7 md:h-8 rounded-full transition-all relative border-2 shrink-0 self-end sm:self-center ${showTempInClock ? "bg-cyan-600/30 border-cyan-600/40" : "bg-transparent border-slate-700/30"}`}
              >
                <motion.div 
                  animate={{ 
                    x: showTempInClock ? 28 : 4,
                  }}
                  initial={false}
                  transition={{ type: "spring", damping: 20, stiffness: 200 }}
                  className={`absolute top-[2px] h-[18px] md:h-[22px] w-[26px] md:w-[30px] rounded-full shadow-sm transition-colors ${showTempInClock ? "bg-white" : "bg-white"}`}
                />
              </button>
            </div>
          
          <div className="flex justify-end pt-4">
            <button 
              onClick={() => {
                setTimeFormat("24h");
                setClockFormat("hh:mm:ss");
                setDateFormat("dd/mm/yyyy");
                setShowTempInClock(false);
                onAlert("Khôi phục", "Đã khôi phục cài đặt gốc mục Đồng hồ & Thời gian!");
              }}
              className={`flex items-center gap-2 px-5 py-2.5 text-xs font-bold uppercase tracking-wider rounded-full transition-all shadow-sm active:translate-y-0.5 border ${
                isDark 
                  ? "bg-white/5 border-white/10 hover:bg-white/10 text-white/70 hover:text-white" 
                  : "bg-slate-100 border-slate-200 hover:bg-slate-200 text-slate-600 hover:text-slate-800"
              }`}
            >
              <RotateCcw size={14} className="animate-spin-once" />
              Khôi phục cài đặt gốc
            </button>
          </div>

        </div>
      </div>

<div className="pt-12 text-center pb-24" />
    </div>
  );
}


function AuthModal({ isOpen, onClose, isDark, liquidGlass, setIsDev, setUserData, featureFlags }: { isOpen: boolean, onClose: () => void, isDark: boolean, liquidGlass: "glassy" | "tinted", setIsDev: (v: boolean) => void, setUserData: (d: any) => void, featureFlags?: any }) {
  const [coords, setCoords] = useState({ x: 0, y: 0 });
  const [isHovered, setIsHovered] = useState(false);
  const containerRef = useRef<HTMLDivElement>(null);

  const handleMouseMove = (e: React.MouseEvent<HTMLDivElement>) => {
    if (!containerRef.current) return;
    const rect = containerRef.current.getBoundingClientRect();
    setCoords({
      x: e.clientX - rect.left,
      y: e.clientY - rect.top,
    });
  };

  const [isLogin, setIsLogin] = useState(true);
  const [isForgotPassword, setIsForgotPassword] = useState(false);
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault();
    setError("");
    setSuccess("");
    
    if ((username === "special_guest" && password === "specialguest123") || (username === "vplaybeta" && password === "vplaybeta")) {
      setLoading(true);
      setTimeout(() => {
        setIsDev(true);
        setUserData({
          uid: "vplaybeta_uid",
          email: "vplaybeta@vplay.vn",
          displayName: "Vplay Beta Guest",
          role: "user"
        });
        onClose();
        setLoading(false);
      }, 1000);
      return;
    }

    if (!isForgotPassword && !isLogin && password !== confirmPassword) {
      setError("Mật khẩu xác nhận không khớp.");
      return;
    }

    if (!isForgotPassword && username.length < 3) {
      setError("Tên đăng nhập phải có ít nhất 3 ký tự.");
      return;
    }

    setLoading(true);
    try {
      const email = username.includes('@') ? username : `${username}@vplay.vn`;
      
      if (isForgotPassword) {
        await sendPasswordResetEmail(auth, email);
        setSuccess("Yêu cầu đặt lại mật khẩu đã được gửi đến email của bạn.");
      } else if (isLogin) {
        await signInWithEmailAndPassword(auth, email, password);
        showToast("Đăng nhập thành công", "success");
        onClose();
      } else {
        if (password.length < 6) {
          setError("Mật khẩu phải có ít nhất 6 ký tự.");
          setLoading(false);
          return;
        }
        const userCred = await createUserWithEmailAndPassword(auth, email, password);
        await updateProfile(userCred.user, { displayName: username.split('@')[0] });
        showToast("Đăng nhập thành công", "success");
        onClose();
      }
    } catch (err: any) {
      if (!isForgotPassword) {
        showToast("Đăng nhập không thành công", "error");
      }
      const code = err.code;
      if (code === 'auth/invalid-credential' || code === 'auth/wrong-password' || code === 'auth/user-not-found') {
        setError("Tên đăng nhập hoặc mật khẩu không chính xác.");
      } else if (code === 'auth/email-already-in-use') {
        setError("Tên đăng nhập hoặc email này đã được sử dụng.");
      } else if (code === 'auth/invalid-email') {
        setError("Định dạng email không hợp lệ.");
      } else if (code === 'auth/weak-password') {
        setError("Mật khẩu quá yếu, vui lòng chọn mật khẩu phức tạp hơn.");
      } else if (code === 'auth/operation-not-allowed') {
        setError("Đăng nhập chưa được kích hoạt trong hệ thống.");
      } else if (code === 'auth/too-many-requests') {
        setError("Tài khoản bị tạm khóa do đăng nhập sai quá nhiều lần. Vui lòng thử lại sau.");
      } else {
        console.error("Auth System Error:", err);
        setError("Đã có lỗi xảy ra: " + (err.message || "Vui lòng thử lại sau."));
      }
    } finally {
      setLoading(false);
    }
  };

  const inputClasses = `w-full px-6 py-3.5 bg-transparent outline-none transition-all ${
    isDark 
      ? "text-white placeholder-white/20" 
      : "text-slate-900 placeholder-slate-400"
  }`;

  const inputContainerClasses = `relative group rounded-full overflow-hidden transition-all ${
    isDark ? "bg-white/5" : "bg-black/5"
  }`;

  const labelClasses = `text-[10px] font-bold uppercase tracking-wider opacity-50 ml-4 ${
    isDark ? "text-white" : "text-slate-900"
  }`;

  const handleGoogleLogin = async () => {
    setError("");
    setLoading(true);
    try {
      const provider = new GoogleAuthProvider();
      await signInWithPopup(auth, provider);
      showToast("Đăng nhập thành công", "success");
      onClose();
    } catch (err: any) {
      if (err.code !== 'auth/popup-closed-by-user' && err.code !== 'auth/cancelled-popup-request') {
        showToast("Đăng nhập không thành công", "error");
        console.error("Google Auth Error:", err);
      }
      
      if (err.code === 'auth/popup-blocked') {
        setError("Cửa sổ đăng nhập bị chặn. Vui lòng cho phép hiện popup.");
      } else if (err.code === 'auth/cancelled-popup-request' || err.code === 'auth/popup-closed-by-user') {
        // User closed the popup, ignore
      } else {
        setError("Lỗi đăng nhập Google: " + (err.message || "Vui lòng thử lại sau."));
      }
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className={`fixed inset-0 z-[1000] flex items-center justify-center p-4 md:p-8 ${isOpen ? "visible" : "invisible"}`}>
      <AnimatePresence>
        {isOpen && (
          <>
            <motion.div 
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={onClose}
              className="absolute inset-0 bg-slate-950/60 backdrop-blur-sm"
            />
            <motion.div
              ref={containerRef}
              onMouseMove={handleMouseMove}
              onMouseEnter={() => setIsHovered(true)}
              onMouseLeave={() => setIsHovered(false)}
              layoutId="auth-modal"
              initial={{ scale: 0.5, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.5, opacity: 0 }}
              transition={{ type: "spring", damping: 30, stiffness: 400 }}
              className="relative w-full max-w-5xl max-h-[95vh] overflow-hidden flex flex-col md:flex-row min-h-[400px] md:min-h-[580px] rounded-[40px] md:rounded-[56px] p-[1.5px] transition-all duration-300 ease-out"
              style={{
                background: isHovered 
                  ? `radial-gradient(350px circle at ${coords.x}px ${coords.y}px, rgba(255,255,255,0.85) 0%, rgba(255,255,255,0.2) 40%, rgba(255,255,255,0.05) 75%, transparent 100%), linear-gradient(135deg, rgba(255,255,255,0.3) 0%, rgba(255,255,255,0.03) 50%, rgba(255,255,255,0.15) 100%)`
                  : `linear-gradient(135deg, rgba(255,255,255,0.35) 0%, rgba(255,255,255,0.05) 50%, rgba(255,255,255,0.15) 100%)`,
                boxShadow: isDark 
                  ? "0 40px 100px rgba(0,0,0,0.85), inset 0 1px 1px rgba(255,255,255,0.15)" 
                  : "0 40px 100px rgba(15,23,42,0.15), inset 0 1px 1px rgba(255,255,255,0.6)"
              }}
            >
              <div 
                className={`relative w-full h-full rounded-[inherit] overflow-hidden flex flex-col md:flex-row ${
                  isDark 
                    ? "bg-[#181818]/92 text-white" 
                    : "bg-white/92 text-slate-900"
                } ${liquidGlass === "glassy" ? "backdrop-blur-3xl" : "backdrop-blur-none"}`}
                style={{ borderRadius: "inherit" }}
              >
              {/* Image/Visual Side - Responsive hiding for very small screens if necessary, or just smaller height */}
              <div className="w-full md:w-[45%] h-48 md:h-auto bg-gradient-to-br from-primary to-indigo-900 p-6 md:p-12 relative flex flex-col justify-between overflow-hidden shrink-0">
                <div className="absolute top-0 right-0 w-96 h-96 bg-[#4AC4FE]/20 blur-[100px] -mr-32 -mt-32" />
                <div className="absolute bottom-0 left-0 w-96 h-96 bg-blue-500/20 blur-[100px] -ml-32 -mb-32" />
                
                <div className="relative z-10 space-y-4 md:space-y-6">
                  <div className="w-12 h-12 md:w-16 md:h-16 rounded-xl md:rounded-2xl bg-white/10 backdrop-blur-xl flex items-center justify-center border border-white/20 shadow-xl">
                    <img 
                      src="https://static.wikia.nocookie.net/ftv/images/a/a6/Imagedskvjndkv.png/revision/latest?cb=20260430103502&path-prefix=vi"
                      className="w-8 h-8 md:w-10 md:h-10 object-contain"
                      alt="Vplay"
                      referrerPolicy="no-referrer"
                    />
                  </div>
                  <div className="space-y-1 md:space-y-2">
                    <h2 className="text-2xl md:text-4xl font-bold text-white tracking-tighter leading-none">
                      {isLogin ? "Chào mừng trở lại!" : "Tham gia mạng lưới Vplay"}
                    </h2>
                    <p className="text-white/60 text-xs md:text-base font-medium leading-relaxed max-w-xs">
                      {isLogin ? "Trải nghiệm thế giới giải trí 4K không giới hạn ngay trong tầm tay bạn." : "Đăng ký tài khoản để đồng bộ hóa và nhận đề xuất cá nhân hóa từ AI."}
                    </p>
                  </div>
                </div>

                <div className="relative z-10 hidden md:block">
                   <div className={`p-6 rounded-3xl border border-white/10 bg-white/5 backdrop-blur-md shadow-2xl space-y-4`}>
                      <div className="flex items-center gap-3">
                        <div className="w-10 h-10 rounded-xl bg-amber-500/20 flex items-center justify-center text-amber-500">
                           <Sparkles size={20} />
                        </div>
                        <h4 className="text-white font-bold text-sm">Thông báo tài khoản Vplay Beta</h4>
                      </div>
                      <p className="text-white/70 text-xs leading-relaxed font-medium">
                        Vplay Beta không hỗ trợ hệ thống đăng nhập, chỉ có ở phiên bản chính thức. Bạn sẽ được phát cho một tài khoản xem truyền hình miễn phí:
                      </p>
                      <div className="flex flex-col gap-2 p-3 rounded-2xl bg-white/5 border border-white/10">
                        <div className="flex justify-between items-center px-1">
                          <span className="text-[10px] text-white/40 font-bold uppercase">Tên đăng nhập</span>
                          <span className="text-sm text-amber-400 font-bold">vplaybeta</span>
                        </div>
                        <div className="flex justify-between items-center px-1">
                          <span className="text-[10px] text-white/40 font-bold uppercase">Mật khẩu</span>
                          <span className="text-sm text-amber-400 font-bold">vplaybeta</span>
                        </div>
                      </div>
                   </div>
                </div>
              </div>

              {/* Form Side */}
              <div className="flex-1 p-6 sm:p-8 md:p-14 overflow-y-auto scrollbar-hide">
                <div className="max-w-md mx-auto space-y-8 md:space-y-10">
                  <div className="flex items-center justify-between">
                    <div>
                      <h3 className={`text-xl md:text-2xl font-bold tracking-tight ${isDark ? "text-white" : "text-slate-900"}`}>
                        {isForgotPassword ? "Quên mật khẩu" : (isLogin ? "Đăng nhập" : "Đăng ký")}
                      </h3>
                      <p className="text-slate-500 text-[11px] md:text-sm font-medium mt-1">Vui lòng điền thông tin bên dưới</p>
                    </div>
                    <button onClick={onClose} className={`p-2.5 md:p-3 rounded-full transition-colors ${isDark ? "bg-white/5 text-white hover:bg-white/10" : "bg-slate-100 text-slate-900 hover:bg-slate-200"}`}>
                       <X size={18} className="md:w-5 md:h-5" />
                    </button>
                  </div>

                  <div className="space-y-4 md:space-y-6">
                    <button 
                      type="button"
                      onClick={handleGoogleLogin}
                      disabled={loading}
                      className={`w-full h-14 md:h-16 flex items-center justify-center gap-4 text-xs md:text-sm font-bold transition-all shadow-lg active:scale-[0.98] ${
                        isDark 
                          ? "bg-[#111111] border border-white/5 text-white shadow-black/40" 
                          : "bg-white border border-slate-200 text-slate-900 shadow-slate-200/50"
                      } rounded-2xl`}
                    >
                      <img src="https://www.gstatic.com/firebasejs/ui/2.0.0/images/smartlock/icon_google.svg" className="w-5 h-5 md:w-6 md:h-6" alt="Google" />
                      Tiếp tục với Google
                    </button>

                    <div className="flex items-center gap-4">
                      <div className={`flex-1 h-[1px] ${isDark ? "bg-white/5" : "bg-slate-100"}`} />
                      <span className="text-[9px] font-bold uppercase opacity-30 tracking-[0.2em]">Hoặc với tên đăng nhập</span>
                      <div className={`flex-1 h-[1px] ${isDark ? "bg-white/5" : "bg-slate-100"}`} />
                    </div>

                    <form onSubmit={handleSubmit} className="space-y-4 md:space-y-5">
                      {error && (
                        <motion.div initial={{ scale: 0.9, opacity: 0 }} animate={{ scale: 1, opacity: 1 }} className="p-4 bg-red-500/10 border border-red-500/20 text-red-500 rounded-2xl text-[11px] font-bold text-center uppercase tracking-wider">
                          {error}
                        </motion.div>
                      )}
                      {success && (
                        <motion.div initial={{ scale: 0.9, opacity: 0 }} animate={{ scale: 1, opacity: 1 }} className="p-4 bg-emerald-500/10 border border-emerald-500/20 text-emerald-600 rounded-2xl text-[11px] font-bold text-center uppercase tracking-wider">
                          {success}
                        </motion.div>
                      )}
                      
                      <div className="space-y-2">
                        <label className={labelClasses}>Tên đăng nhập / Email</label>
                        <div className={inputContainerClasses}>
                          <input 
                            required 
                            value={username} 
                            onChange={e => setUsername(e.target.value)} 
                            className={inputClasses} 
                            placeholder="Nhập tài khoản vplay..." 
                          />
                        </div>
                      </div>

                      {!isForgotPassword && (
                        <div className="space-y-2">
                          <label className={labelClasses}>Mật khẩu</label>
                          <div className={inputContainerClasses}>
                            <input 
                              required 
                              type={showPassword ? "text" : "password"} 
                              value={password} 
                              onChange={e => setPassword(e.target.value)} 
                              className={inputClasses} 
                              placeholder="Nhập mật khẩu..." 
                            />
                            <button 
                              type="button"
                              onClick={() => setShowPassword(!showPassword)}
                              className="absolute right-6 top-1/2 -translate-y-1/2 text-slate-400 hover:text-[#4AC4FE] transition-colors"
                            >
                              {showPassword ? <EyeOff size={16} /> : <Eye size={16} />}
                            </button>
                          </div>
                        </div>
                      )}

                      {!isForgotPassword && !isLogin && (
                        <div className="space-y-2">
                          <label className={labelClasses}>Xác nhận mật khẩu</label>
                          <div className={inputContainerClasses}>
                            <input 
                              required 
                              type={showPassword ? "text" : "password"} 
                              value={confirmPassword} 
                              onChange={e => setConfirmPassword(e.target.value)} 
                              className={inputClasses} 
                              placeholder="Lặp lại mật khẩu..." 
                            />
                          </div>
                        </div>
                      )}

                      {isLogin && !isForgotPassword && (
                        <div className="text-right">
                          <button type="button" onClick={() => setIsForgotPassword(true)} className="text-[11px] font-bold text-[#4AC4FE] hover:opacity-70 transition-opacity">
                            Quên mật khẩu?
                          </button>
                        </div>
                      )}

                      <button 
                        type="submit" 
                        disabled={loading} 
                        className="btn-purple-3d w-full h-14 md:h-16 text-base md:text-lg font-bold tracking-widest disabled:opacity-50 mt-4 rounded-2xl md:rounded-3xl flex items-center justify-center gap-3"
                      >
                        {loading && <LoadingSpinner isDark={true} className="w-6 h-6 border-white" />}
                        {loading ? "ĐANG XỬ LÝ..." : (isForgotPassword ? "GỬI YÊU CẦU" : (isLogin ? "ĐĂNG NHẬP" : "ĐĂNG KÝ"))}
                      </button>
                    </form>

                    <div className="text-center">
                      <button 
                        type="button" 
                        onClick={() => {
                          setIsLogin(!isLogin);
                          setIsForgotPassword(false);
                          setError("");
                        }} 
                        className={`text-xs font-bold tracking-wide transition-colors ${isDark ? "text-white/40 hover:text-white" : "text-slate-500 hover:text-slate-900"}`}
                      >
                        {isForgotPassword ? "Quay lại trang Đăng nhập" : (isLogin ? "Chưa có tài khoản? Tham gia ngay" : "Đã có thành viên? Đăng nhập ngay")}
                      </button>
                    </div>
                  </div>
                </div>
              </div>
              </div>
            </motion.div>
          </>
        )}
      </AnimatePresence>
    </div>
  );
}


function WhatsNewPopup({ isDark, onClose, liquidGlass }: { isDark: boolean, onClose: () => void, liquidGlass: "glassy" | "tinted" }) {
  const categories = [
    {
      title: "🎨 USER INTERFACE",
      items: [
        "Update lại toàn bộ design system cho các nút và toggles theo phong cách nổi",
        "Update lại popup \"Đăng nhập/Đăng ký\"",
        "Update lại layout bố trí cho Settings",
        "Thêm đồng hồ và lịch trên sidebar và navigation pane",
        "Transition animation mới giữa các trang"
      ]
    },
    {
      title: "✨ SIDEBAR",
      items: [
        "Tái cấu trúc lại toàn bộ behaviour của sidebar",
        "Hiển thị 4 items/page với mũi tên chuyển trang",
        "Chế độ \"Idle mode\" hiển thị đồng hồ và lịch sau 5 giây"
      ]
    },
    {
      title: "🔍 KHÁM PHÁ",
      items: [
        "Tab \"Khám phá\" mới cho tìm kiếm và đề xuất",
        "Tích hợp tìm kiếm sâu cho cả kênh và cài đặt hệ thống"
      ]
    },
    {
      title: "🧪 THỬ NGHIỆM",
      items: [
        "Tab Experimental Labs riêng biệt",
        "Thử nghiệm: Multiview, Picture-in-Picture và Screen Recording"
      ]
    },
    {
      title: "🐛 BUG FIXES",
      items: [
        "Kênh VTV1 và VTV9 hiện đã có thể xem được bình thường",
        "Tối ưu hóa một số trang khi hiển thị trên thiết bị di động"
      ]
    }
  ];

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      className="fixed inset-0 z-[2000] flex items-center justify-center p-2 sm:p-4 md:p-8 backdrop-blur-2xl bg-black/60"
    >
      <motion.div
        initial={{ scale: 0.5, opacity: 0 }}
        animate={{ scale: 1, opacity: 1 }}
        exit={{ scale: 0.5, opacity: 0 }}
        transition={{ type: "spring", damping: 30, stiffness: 400 }}
        className="w-full max-w-4xl max-h-[92vh] overflow-hidden rounded-[40px] md:rounded-[56px]"
      >
        <ShinyGlassWrapper 
          isDark={isDark} 
          liquidGlass={liquidGlass} 
          roundedClass="rounded-[40px] md:rounded-[56px]" 
          innerClass={`relative w-full h-full flex flex-col overflow-hidden max-h-[92vh] ${
            isDark 
              ? "bg-[#130f26]/92 text-white" 
              : "bg-white/92 text-slate-900"
          }`}
        >
          <div className="absolute top-0 left-0 w-full h-2 bg-gradient-to-r from-[#4AC4FE] via-pink-500 to-amber-500" />
          
          <div className="p-6 md:p-12 flex flex-col flex-1 overflow-hidden space-y-6 md:space-y-8">
          <div className="flex items-start justify-between gap-4">
            <div className="space-y-1">
              <h2 className={`text-2xl sm:text-3xl md:text-5xl font-bold tracking-tighter leading-tight ${isDark ? "text-white" : "text-slate-900"}`}>
                What's new <span className="text-[#4AC4FE] block sm:inline">in Vplay Dev</span>
              </h2>
              <div className="flex items-center gap-2 flex-wrap">
                <span className="px-2 py-0.5 md:px-3 md:py-1 rounded-full bg-[#4AC4FE]/10 text-[#4AC4FE] text-[9px] md:text-[10px] font-bold tracking-widest uppercase border border-[#4AC4FE]/20">Version 26.7.0</span>
                <span className="w-1.5 h-1.5 rounded-full bg-green-500 animate-pulse" />
                <span className="text-[9px] md:text-[10px] font-bold text-slate-500 uppercase tracking-widest">Stable Beta</span>
              </div>
            </div>
            <button 
              onClick={onClose}
              className={`p-3 md:p-4 rounded-2xl md:rounded-3xl transition-all shrink-0 ${isDark ? "bg-white/5 hover:bg-white/10 text-white" : "bg-slate-100 hover:bg-slate-200 text-slate-900"}`}
            >
              <X size={20} className="md:w-6 md:h-6" />
            </button>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6 md:gap-8 overflow-y-auto pr-2 scrollbar-hide flex-1">
            {categories.map((cat, i) => (
              <motion.div 
                key={cat.title}
                initial={{ opacity: 0, x: -20 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: i * 0.1 }}
                className="space-y-3 md:space-y-4"
              >
                <h3 className="text-[11px] md:text-sm font-bold text-[#4AC4FE] tracking-[0.2em]">{cat.title}</h3>
                <ul className="space-y-2 md:space-y-3">
                  {cat.items.map((item, j) => (
                    <li key={j} className="flex items-start gap-2 md:gap-3">
                      <div className="mt-1.5 w-1.5 h-1.5 rounded-full bg-[#4AC4FE]/40 shrink-0" />
                      <p className={`text-xs md:text-sm font-medium leading-relaxed ${isDark ? "text-slate-300" : "text-slate-600"}`}>{item}</p>
                    </li>
                  ))}
                </ul>
              </motion.div>
            ))}
          </div>

          <div className="pt-4 flex flex-col md:flex-row items-center justify-between gap-6 shrink-0 mt-auto">
            <div className="flex items-center gap-3 md:gap-4 self-start md:self-center">
              <div className={`w-10 h-10 md:w-12 md:h-12 rounded-xl md:rounded-2xl flex items-center justify-center ${isDark ? "bg-white/5 border-white/10" : "bg-slate-100 border-slate-200"} border shadow-sm`}>
                <Sparkles size={18} className="text-amber-500 md:w-5 md:h-5" />
              </div>
              <div>
                <p className={`text-[9px] md:text-xs font-bold leading-none ${isDark ? "text-white/60" : "text-slate-500"}`}>TRẢI NGHIỆM ĐƯỢC CÁ NHÂN HÓA</p>
                <p className={`text-xs md:text-sm font-bold tracking-tight ${isDark ? "text-white" : "text-slate-900"}`}>Khám phá ngay phiên bản mới nhất</p>
              </div>
            </div>
            <button 
              onClick={onClose}
              className="w-full md:w-auto btn-vibrant-3d px-8 md:px-12 py-4 md:py-6 text-sm md:text-lg font-bold tracking-widest !rounded-2xl md:!rounded-3xl"
            >
              KHÁM PHÁ NGAY
            </button>
          </div>
        </div>
        </ShinyGlassWrapper>
      </motion.div>
    </motion.div>
  );
}

function SearchBar({ isDark, query, setQuery, onClose, liquidGlass, onContextMenu, searchFilterOption, setSearchFilterOption }: { 
  isDark: boolean, 
  query: string, 
  setQuery: (q: string) => void, 
  onClose: () => void, 
  liquidGlass: "glassy" | "tinted", 
  onContextMenu?: (e: React.MouseEvent) => void,
  searchFilterOption?: "Tất cả kênh" | "Kênh của Vplay" | "Package của bạn",
  setSearchFilterOption?: (val: "Tất cả kênh" | "Kênh của Vplay" | "Package của bạn") => void 
}) {
  const inputRef = useRef<HTMLInputElement>(null);
  const [isListening, setIsListening] = useState(false);
  const [showFilterDropdown, setShowFilterDropdown] = useState(false);

  useEffect(() => {
    inputRef.current?.focus();
  }, []);

  const startVoiceSearch = () => {
    const SpeechRecognition = (window as any).SpeechRecognition || (window as any).webkitSpeechRecognition;
    if (!SpeechRecognition) {
      alert("Không thể nhận diện giọng nói");
      return;
    }

    const recognition = new SpeechRecognition();
    recognition.lang = 'vi-VN';
    recognition.continuous = false;
    recognition.interimResults = false;

    recognition.onstart = () => setIsListening(true);
    recognition.onend = () => setIsListening(false);
    recognition.onerror = () => setIsListening(false);
    recognition.onresult = (event: any) => {
      const transcript = event.results[0][0].transcript;
      setQuery(transcript);
    };

    recognition.start();
  };

  const isGlassy = liquidGlass === "glassy";
  const iconColor = isGlassy ? "text-white" : "text-black";
  const placeholderColor = isGlassy ? "placeholder-white/40" : "placeholder-black/40";
  const textColor = isGlassy ? "text-white" : "text-black";

  return (
    <div 
      className={`flex items-center gap-2 md:gap-3 px-5 md:px-7 py-1.5 h-10 md:h-13 w-full max-w-2xl relative group rounded-full border cursor-pointer transform transition-all duration-300 hover:scale-[1.04] hover:-translate-y-0.5 active:scale-[0.98] active:translate-y-0 ${
        isGlassy 
          ? "bg-white/10 border-white/5 text-white shadow-[0_4px_12px_rgba(0,0,0,0.15),_inset_0_1.5px_2.5px_rgba(255,255,255,0.2)] focus-within:shadow-[0_8px_24px_rgba(74,196,254,0.35)]" 
          : isDark 
            ? "bg-slate-800/55 border-white/5 text-white shadow-[0_4px_12px_rgba(0,0,0,0.2),_inset_0_1.5px_2.5px_rgba(255,255,255,0.12)] focus-within:shadow-[0_8px_24px_rgba(74,196,254,0.35)]" 
            : "bg-slate-100 border-slate-300/20 text-slate-900 shadow-[0_4px_10px_rgba(0,0,0,0.06),_inset_0_1.5px_2px_rgba(255,255,255,0.4)] focus-within:shadow-[0_8px_20px_rgba(74,196,254,0.25)]"
      }`}
      onContextMenu={onContextMenu}
    >
      <div className="flex items-center gap-2 flex-1 overflow-hidden">
        <SearchIcon className={`h-5 w-5 md:h-6 md:w-6 ${iconColor} flex-shrink-0 transition-colors`} />
        <input
          ref={inputRef}
          type="text"
          placeholder="Tìm kiếm..."
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          onContextMenu={onContextMenu}
          className={`flex-1 bg-transparent border-none outline-none text-sm font-bold truncate font-google ${textColor} ${placeholderColor}`}
        />
      </div>
      <div className="flex items-center gap-2 shrink-0">
        <button 
          onClick={startVoiceSearch}
          className={`p-1.5 rounded-full transition-all ${isListening ? "bg-red-500 text-white animate-pulse" : `${iconColor} opacity-40 hover:opacity-100`}`}
          title="Đang nghe..."
        >
          <MicIcon size={20} className="md:w-5 md:h-5" />
        </button>
        {setSearchFilterOption && searchFilterOption && (
          <div className="relative">
            <button 
              type="button"
              onClick={() => setShowFilterDropdown(!showFilterDropdown)}
              className={`p-1.5 rounded-full transition-all ${showFilterDropdown ? "text-[#4AC4FE] bg-[#4AC4FE]/10" : `${iconColor} opacity-40 hover:opacity-100`}`}
              title="Lọc kết quả tìm kiếm"
            >
              <Filter size={18} className="md:w-5 md:h-5" />
            </button>
            <AnimatePresence>
              {showFilterDropdown && (
                <motion.div
                  initial={{ opacity: 0, y: 10, scale: 0.95 }}
                  animate={{ opacity: 1, y: 0, scale: 1 }}
                  exit={{ opacity: 0, y: 10, scale: 0.95 }}
                  className={`absolute right-0 top-full mt-2 z-50 min-w-[200px] rounded-xl border p-1 shadow-xl ${
                    isDark ? "bg-[#181818] border-white/10 text-white" : "bg-white border-slate-200 text-slate-800"
                  }`}
                >
                  {[
                    { label: "Tất cả", value: "Tất cả kênh" as const },
                    { label: "Kênh của Vplay", value: "Kênh của Vplay" as const },
                    { label: "Kênh package của bạn", value: "Package của bạn" as const }
                  ].map((opt) => {
                    const isActive = searchFilterOption === opt.value;
                    return (
                      <button
                        key={opt.value}
                        type="button"
                        onClick={() => {
                          setSearchFilterOption(opt.value);
                          setShowFilterDropdown(false);
                        }}
                        className={`w-full text-left px-4 py-2 text-xs font-bold rounded-lg transition-all flex items-center justify-between ${
                          isActive
                            ? "bg-[#4AC4FE]/10 text-[#4AC4FE]"
                            : isDark ? "hover:bg-white/5 text-slate-300" : "hover:bg-slate-100 text-slate-700"
                        }`}
                      >
                        <span>{opt.label}</span>
                        {isActive && <Check size={14} className="text-[#4AC4FE]" />}
                      </button>
                    );
                  })}
                </motion.div>
              )}
            </AnimatePresence>
          </div>
        )}
      </div>
    </div>
  );
}

function ProtectedContent({ children, user, onLogin, isDark, isDev, liquidGlass, bypassed }: { children: ReactNode, user: any, onLogin: () => void, isDark: boolean, isDev?: boolean, liquidGlass: "glassy" | "tinted", bypassed?: boolean }) {
  if (!user && !isDev && !bypassed) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[60vh] p-8 text-center space-y-6">
        <motion.div 
          initial={{ scale: 0.8, opacity: 0 }}
          animate={{ scale: 1, opacity: 1 }}
          className={`p-6 ${liquidGlass ? "rounded-full" : "rounded-xl"} ${isDark ? "bg-[#4AC4FE]/10" : "bg-[#4AC4FE]/10"}`}
        >
          <Lock className={`h-12 w-12 ${isDark ? "text-[#4AC4FE]" : "text-[#4AC4FE]"}`} />
        </motion.div>
        <div className="space-y-2">
          <h2 className={`text-2xl font-bold ${isDark ? "text-white" : "text-slate-900"}`}>Đăng nhập</h2>
          <p className={`${isDark ? "text-slate-400" : "text-slate-500"} max-w-md mx-auto`}>
            Tận hưởng và trải nghiệm đầy đủ các tính năng của Vplay ngay hôm nay!
          </p>
        </div>
        <button
          onClick={onLogin}
          className={`px-8 py-3 font-bold transition-all hover:scale-105 active:scale-95 ${
            liquidGlass ? "rounded-2xl" : "rounded-lg"
          } ${
            isDark 
              ? "bg-[#4AC4FE] hover:bg-[#4AC4FE] text-black shadow-[0_0_20px_rgba(147,51,234,0.4)]" 
              : "bg-[#4AC4FE] hover:bg-[#4AC4FE] text-black shadow-[0_0_20px_rgba(168,85,247,0.3)]"
          }`}
        >
          Đăng nhập
        </button>
      </div>
    );
  }
  return <>{children}</>;
}

function OnboardingWizard({ 
  onComplete,
  onLogin,
  isDark: currentIsDark
}: { 
  onComplete: (config: any) => void,
  onLogin: () => void,
  isDark: boolean
}) {
  const [step, setStep] = useState(0);
  const [config, setConfig] = useState({
    isDark: false, // OOBE uses light mode by default
    useSidebar: false,
    liquidGlass: "glassy",
    isSidebarRight: false,
    isPinningEnabled: false,
    featureFlags: { 
      settings_in_widgets: false,
      widgets_dashboard: false, 
      multiview_channels: false, 
      disable_animation: false, 
      screen_recording: false,
      PiP_experimental: false,
      dynamic_island: false
    }
  });
  const [showSkipPrompt, setShowSkipPrompt] = useState(false);
  const [skipPass, setSkipPass] = useState("");
  const [skipError, setSkipError] = useState(false);

  const nextStep = () => setStep(s => s + 1);
  const prevStep = () => setStep(s => s - 1);

  const steps = [
    {
      title: "Giao diện người dùng",
      description: "Bạn đang sử dụng thiết bị nào? Chúng tôi sẽ tối ưu hóa giao diện người dùng cho thiết bị của bạn",
      icon: Layout,
      color: "text-blue-500"
    }
  ];

  const handleSkip = (e?: FormEvent) => {
    e?.preventDefault();
    if (skipPass === "bypassoobe") {
      onComplete(config);
    } else {
      setSkipError(true);
      setTimeout(() => setSkipError(false), 2000);
    }
  };

  return (
    <motion.div 
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      className="fixed inset-0 z-[2000] flex items-center justify-center p-0 md:p-8"
    >
      {/* Background Image */}
      <img 
        src="https://wallpapercave.com/wp/wp3183649.png" 
        className="absolute inset-0 w-full h-full object-cover"
        alt="background"
      />
      <div className={`absolute inset-0 ${config.isDark ? "bg-slate-950/70" : "bg-white/40"} backdrop-blur-xl`} />

      <div className={`w-full h-full md:h-[600px] md:max-w-5xl rounded-none md:rounded-[40px] shadow-[0_30px_90px_rgba(0,0,0,0.3)] flex flex-col md:flex-row overflow-hidden border relative z-10 ${config.isDark ? "bg-slate-900/60 border-white/10 backdrop-blur-3xl" : "bg-white/90 border-slate-200 backdrop-blur-2xl"}`}>
        
        {/* Left Pane - Identity */}
        <div className={`hidden md:flex flex-[0.7] flex-col items-center justify-center p-12 border-r ${config.isDark ? "bg-white/5 border-white/5" : "bg-blue-50/50 border-slate-100"}`}>
          <div className="relative group flex flex-col items-center justify-center">
              <motion.div
                initial={{ scale: 0.8, opacity: 0 }}
                animate={{ scale: 1, opacity: 1 }}
                transition={{ duration: 0.5 }}
                key={step}
                className="relative"
              >
              <div className={`absolute inset-0 bg-[#4AC4FE]/20 blur-[100px] rounded-full scale-[2.5] animate-pulse`} />
              <div className="relative z-10 w-56 h-56 bg-gradient-to-br from-indigo-600 via-[#4AC4FE] to-pink-600 rounded-[64px] flex items-center justify-center shadow-[0_25px_60px_rgba(147,51,234,0.4)]">
                <div className="w-36 h-36 bg-white/10 rounded-full flex items-center justify-center backdrop-blur-md border border-white/20 shadow-inner">
                  <motion.div
                    animate={{ rotate: 360 }}
                    transition={{ duration: 15, repeat: Infinity, ease: "linear" }}
                  >
                    {step === 0 ? (
                      <Send size={100} className="text-white transform -rotate-12 drop-shadow-[0_4px_12px_rgba(255,255,255,0.3)]" fill="white" />
                    ) : (
                      (() => {
                        const Icon = steps[step].icon;
                        return <Icon size={84} className="text-white drop-shadow-[0_4px_12px_rgba(255,255,255,0.3)]" strokeWidth={1.5} />;
                      })()
                    )}
                  </motion.div>
                </div>
              </div>
            </motion.div>
          </div>
        </div>

        {/* Right Pane - Content */}
        <div className="flex-1 flex flex-col p-8 md:p-14 relative overflow-hidden">
          {/* Mobile Header Logo */}
          <div className="md:hidden flex items-center justify-center mb-10">
            <img 
              src="https://static.wikia.nocookie.net/ftv/images/a/a6/Imagedskvjndkv.png/revision/latest?cb=20260430103502&path-prefix=vi"
              className={`h-12 object-contain ${!config.isDark ? "drop-shadow-[0_2px_8px_rgba(0,0,0,0.3)]" : ""}`}
              alt="Vplay Mobile Logo"
            />
          </div>

          <div className="flex-1 flex flex-col justify-center overflow-y-auto custom-scrollbar-slim">
            <AnimatePresence mode="wait">
              <motion.div
                key={step}
                initial={{ opacity: 0, x: 50 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: -50 }}
                transition={{ type: "spring", damping: 25, stiffness: 120 }}
                className="space-y-8"
              >
                <div className="space-y-2">
                  <p className="text-[10px] font-bold text-[#4AC4FE] uppercase tracking-[0.2em]">
                    Cài đặt hệ thống
                  </p>
                  <h2 className={`text-xl md:text-3xl font-bold tracking-tight leading-tight ${config.isDark ? "text-white" : "text-slate-900"}`}>
                    {steps[step].title}
                  </h2>
                  <p className={`text-base font-medium opacity-50 max-w-md ${config.isDark ? "text-white" : "text-slate-900"}`}>
                    {steps[step].description}
                  </p>
                </div>

                <div className="py-2">
                  {step === 0 && (
                    <div className="grid grid-cols-1 gap-4">
                      {[
                        { id: true, label: "Desktop Interface", icon: Monitor, sub: "Tối ưu hóa cho chuột và phím" },
                        { id: false, label: "Touch Interface", icon: MousePointer2, sub: "Các nút lớn, mượt mà cho thiết bị cảm ứng" }
                      ].map(mode => (
                        <button
                          key={mode.id.toString()}
                          onClick={() => setConfig({ ...config, useSidebar: mode.id })}
                          className={`flex items-center gap-5 p-6 rounded-3xl border-2 transition-all ${config.useSidebar === mode.id ? "bg-[#4AC4FE] border-[#4AC4FE] text-black shadow-[0_10px_25px_rgba(147,51,234,0.3)]" : `${config.isDark ? "bg-white/5 border-transparent hover:bg-white/10" : "bg-slate-100 hover:bg-slate-200 border-transparent text-slate-900"}`}`}
                        >
                          <div className={`p-3.5 rounded-2xl ${config.useSidebar === mode.id ? "bg-white text-[#4AC4FE]" : "bg-white/10 text-slate-500"}`}><mode.icon size={24} /></div>
                          <div className="text-left">
                            <h4 className="text-base font-bold">{mode.label}</h4>
                            <p className="text-xs opacity-70">{mode.sub}</p>
                          </div>
                        </button>
                      ))}
                    </div>
                  )}
                </div>

                <div className="flex items-center justify-between pt-6 border-t border-white/10">
                  <div className="flex gap-2">
                    {steps.map((_, i) => (
                      <div key={i} className={`h-1.5 rounded-full transition-all duration-500 ${i === step ? "w-8 bg-[#4AC4FE]" : "w-1.5 bg-white/20"}`} />
                    ))}
                  </div>
                  <div className="flex gap-4">
                    {step < steps.length - 1 ? (
                      <button onClick={nextStep} className="px-8 py-2.5 bg-[#4AC4FE] hover:bg-[#4AC4FE] text-black rounded-2xl font-bold text-sm shadow-lg shadow-none transition-all active:scale-95">Tiếp theo</button>
                    ) : (
                      <button onClick={() => onComplete(config)} className="px-10 py-3 bg-gradient-to-r from-indigo-600 to-[#4AC4FE] hover:from-indigo-500 hover:to-purple-500 text-white rounded-[24px] font-bold text-sm shadow-xl shadow-none transition-all active:scale-95 hover:shadow-2xl">Bắt đầu ngay</button>
                    )}
                  </div>
                </div>
              </motion.div>
            </AnimatePresence>
          </div>
        </div>
      </div>
      
      {/* Skip button for dev */}
      <div className="fixed bottom-6 right-6 opacity-0 hover:opacity-100 transition-all group z-[2001]">
         <form onSubmit={handleSkip} className="flex items-center gap-2">
           <input 
             type="password" 
             value={skipPass}
             onChange={(e) => setSkipPass(e.target.value)}
             placeholder="Bypass..." 
             className={`w-24 px-3 py-1 text-[10px] rounded-full border bg-black/40 text-white outline-none transition-all ${skipError ? "border-red-500" : "border-white/10 focus:border-[#4AC4FE]"}`}
           />
         </form>
      </div>
    </motion.div>
  );
}

function DynamicIsland({
  searchQuery,
  setSearchQuery,
  currentTime,
  isDark,
  onMenuClick,
  user,
  handleOpenSettings,
  onOpenVIntelligence,
}: {
  searchQuery: string;
  setSearchQuery: (q: string) => void;
  currentTime: Date;
  isDark: boolean;
  onMenuClick?: () => void;
  user?: any;
  handleOpenSettings?: () => void;
  onOpenVIntelligence?: () => void;
}) {
  const [isExpanded, setIsExpanded] = useState(false);
  const [aiExpanded, setAiExpanded] = useState(false);
  const containerRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLInputElement>(null);
  const aiInputRef = useRef<HTMLInputElement>(null);
  const scrollRef = useRef<HTMLDivElement>(null);
  const [windowWidth, setWindowWidth] = useState(typeof window !== "undefined" ? window.innerWidth : 1000);

  // Synchronize window resize
  useEffect(() => {
    if (typeof window === "undefined") return;
    const handleResize = () => setWindowWidth(window.innerWidth);
    window.addEventListener("resize", handleResize);
    return () => window.removeEventListener("resize", handleResize);
  }, []);

  const [messages, setMessages] = useState<Array<{ role: "user" | "assistant", text: string }>>([
    { role: "assistant", text: "Xin chào! Tôi là Trợ lý V-Intelligence của Vplay. Hãy đặt câu hỏi hoặc yêu cầu tìm kiếm kênh truyền hình cho tôi nhé! ✨" }
  ]);
  const [aiInput, setAiInput] = useState("");
  const [aiLoading, setAiLoading] = useState(false);

  // Auto-scroll chat history
  useEffect(() => {
    if (scrollRef.current) {
      scrollRef.current.scrollTop = scrollRef.current.scrollHeight;
    }
  }, [messages, aiExpanded, aiLoading]);

  // Close on click outside
  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (containerRef.current && !containerRef.current.contains(event.target as Node)) {
        setIsExpanded(false);
        setAiExpanded(false);
      }
    }
    document.addEventListener("mousedown", handleClickOutside);
    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
    };
  }, []);

  // Listen for Escape key to close
  useEffect(() => {
    function handleKeyDown(e: KeyboardEvent) {
      if (e.key === "Escape") {
        setIsExpanded(false);
        setAiExpanded(false);
        inputRef.current?.blur();
      }
    }
    document.addEventListener("keydown", handleKeyDown);
    return () => {
      document.removeEventListener("keydown", handleKeyDown);
    };
  }, []);

  // Set focus on input element as soon as dynamic island expands or chat opens
  useEffect(() => {
    if (isExpanded && !aiExpanded) {
      const timer = setTimeout(() => {
        inputRef.current?.focus();
      }, 150);
      return () => clearTimeout(timer);
    } else if (isExpanded && aiExpanded) {
      const timer = setTimeout(() => {
        aiInputRef.current?.focus();
      }, 150);
      return () => clearTimeout(timer);
    }
  }, [isExpanded, aiExpanded]);

  const handleSendMessage = async (e?: React.FormEvent, customText?: string) => {
    if (e) e.preventDefault();
    const queryText = (customText || aiInput).trim();
    if (!queryText || aiLoading) return;

    setAiInput("");
    setMessages(prev => [...prev, { role: "user", text: queryText }]);
    setAiLoading(true);

    try {
      const history = messages.map(msg => ({
        role: msg.role === "user" ? "user" : "assistant",
        content: msg.text
      }));

      const res = await fetch("/api/vplay/ai", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ prompt: queryText, history })
      });

      const data = await res.json();
      if (data && data.text) {
        setMessages(prev => [...prev, { role: "assistant", text: data.text }]);
      } else if (data && data.error) {
        setMessages(prev => [...prev, { role: "assistant", text: `Lỗi kết nối: ${data.error}` }]);
      } else {
        setMessages(prev => [...prev, { role: "assistant", text: "Xin lỗi, V-Intelligence không nhận được phản hồi." }]);
      }
    } catch (err: any) {
      console.error(err);
      setMessages(prev => [...prev, { role: "assistant", text: `Lỗi kết nối máy chủ: ${err.message || err}` }]);
    } finally {
      setAiLoading(false);
    }
  };

  const formattedTimeWithSeconds = currentTime.toLocaleTimeString("vi-VN", {
    hour: "2-digit",
    minute: "2-digit",
    second: "2-digit",
    hour12: false,
  });

  const expandedWidth = windowWidth < 480 ? 290 : 380;
  const aiCardWidth = windowWidth < 480 ? windowWidth - 24 : 440;
  const aiCardHeight = windowWidth < 480 ? 370 : 410;

  return (
    <div className="flex justify-center w-full relative">
      <motion.div
        ref={containerRef}
        layout
        transition={{
          type: "spring",
          stiffness: 300,
          damping: 18,
          mass: 0.8,
        }}
        animate={{
          width: isExpanded ? (aiExpanded ? aiCardWidth : expandedWidth) : 132,
          height: isExpanded ? (aiExpanded ? aiCardHeight : 38) : 38,
          borderRadius: aiExpanded ? "28px" : "999px",
        }}
        onClick={() => {
          if (!isExpanded) setIsExpanded(true);
        }}
        className="bg-black text-white border border-white/12 px-4 flex flex-col justify-start shadow-[0_12px_28px_rgba(0,0,0,0.65),_inset_0_1px_1.5px_rgba(255,255,255,0.15)] cursor-pointer overflow-hidden select-none"
      >
        <AnimatePresence mode="wait">
          {!isExpanded ? (
            <motion.div
              key="compact-clock"
              initial={{ opacity: 0, scale: 0.8 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.8 }}
              className="flex items-center justify-center w-full gap-2.5 h-[36px]"
            >
              <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 shadow-[0_0_8px_#10b981] animate-pulse shrink-0" />
              <span className="font-google text-xs font-black tracking-wider text-white/95 select-none text-center">
                {formattedTimeWithSeconds}
              </span>
            </motion.div>
          ) : !aiExpanded ? (
            <motion.div
              key="expanded-search"
              initial={{ opacity: 0, x: 12 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: -12 }}
              className="flex items-center w-full gap-2.5 h-[36px]"
              onClick={(e) => e.stopPropagation()}
            >
              <div className="shrink-0">
                <SearchCustomIcon className="w-4.5 h-4.5 text-white" />
              </div>
              <input
                ref={inputRef}
                type="text"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder="Search or Ask V-Intelligence"
                className="bg-transparent text-white placeholder-white/30 text-xs font-bold font-sans outline-none w-full border-none p-0 focus:ring-0"
              />
              <div className="flex items-center gap-1.5 shrink-0">
                {/* V-Intelligence Brain Button */}
                <button
                  onClick={(e) => {
                    e.stopPropagation();
                    setAiExpanded(true);
                  }}
                  className="p-1 hover:bg-[#4AC4FE]/20 rounded-full transition-all cursor-pointer text-[#4AC4FE] hover:scale-110 flex items-center justify-center shrink-0"
                  title="Hỏi Trợ lý V-Intelligence AI"
                >
                  <Brain className="w-4 h-4" />
                </button>

                {searchQuery ? (
                  <button
                    onClick={() => {
                      setSearchQuery("");
                      inputRef.current?.focus();
                    }}
                    className="p-1 hover:bg-white/10 rounded-full transition-colors cursor-pointer text-white/60 hover:text-white flex items-center justify-center"
                  >
                    <X className="w-3.5 h-3.5" />
                  </button>
                ) : (
                  <button
                    onClick={() => setIsExpanded(false)}
                    className="p-1 hover:bg-white/10 rounded-full transition-colors cursor-pointer text-white/40 hover:text-white flex items-center justify-center"
                  >
                    <X className="w-3.5 h-3.5" />
                  </button>
                )}
              </div>
            </motion.div>
          ) : (
            // Robust fully connected nested chatbot inside Dynamic Island!
            <motion.div
              key="ai-assistant-active"
              initial={{ opacity: 0, y: -10 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -10 }}
              className="w-full h-full flex flex-col pt-3"
              onClick={(e) => e.stopPropagation()}
            >
              {/* Header */}
              <div className="flex items-center justify-between border-b border-white/10 pb-2 mb-2 px-1 text-white">
                <div className="flex items-center gap-2">
                  <div className="w-6 h-6 rounded-full bg-[#4AC4FE]/20 flex items-center justify-center text-[#4AC4FE] shadow-[0_0_8px_rgba(74,196,254,0.3)]">
                    <Brain className="w-3.5 h-3.5" />
                  </div>
                  <div className="text-left">
                    <h3 className="text-xs font-bold font-google text-white flex items-center gap-1">
                      V-Intelligence
                      <span className="text-[9px] bg-[#4AC4FE]/20 text-[#4AC4FE] px-1 rounded">Beta</span>
                    </h3>
                    <p className="text-[8px] text-white/40">Powered by Gemini AI</p>
                  </div>
                </div>

                <div className="flex items-center gap-1">
                  {/* Minimize back to normal search */}
                  <button 
                    onClick={() => setAiExpanded(false)}
                    className="p-1 hover:bg-white/10 rounded-full text-white/60 hover:text-white transition-all text-[10px] font-bold px-2 py-0.5"
                    title="Quay lại Tìm kiếm"
                  >
                    Quay lại
                  </button>
                  <button 
                    onClick={() => {
                      setAiExpanded(false);
                      setIsExpanded(false);
                    }}
                    className="p-1 hover:bg-white/10 rounded-full text-white/40 hover:text-white transition-all flex items-center justify-center"
                  >
                    <X className="w-3.5 h-3.5" />
                  </button>
                </div>
              </div>

              {/* Scrollable messages panel */}
              <div 
                ref={scrollRef}
                className="flex-1 overflow-y-auto space-y-2.5 pr-1 py-1 text-xs no-scrollbar flex flex-col"
              >
                {messages.map((msg, index) => (
                  <div 
                    key={`ai-msg-${index}`}
                    className={`flex w-full ${msg.role === "user" ? "justify-end" : "justify-start"}`}
                  >
                    <div className={`max-w-[85%] rounded-2xl px-3 py-2 leading-relaxed ${
                      msg.role === "user" 
                        ? "bg-[#4AC4FE] text-black font-semibold rounded-tr-sm text-right" 
                        : "bg-white/10 text-white/95 rounded-tl-sm text-left whitespace-pre-wrap font-sans"
                    }`}>
                      {msg.text}
                    </div>
                  </div>
                ))}

                {aiLoading && (
                  <div className="flex justify-start">
                    <div className="bg-white/10 text-white/70 rounded-2xl px-3 py-2 flex items-center gap-1">
                      <span className="w-1.5 h-1.5 rounded-full bg-[#38bcfd] animate-bounce [animation-delay:-0.3s]" />
                      <span className="w-1.5 h-1.5 rounded-full bg-[#38bcfd] animate-bounce [animation-delay:-0.15s]" />
                      <span className="w-1.5 h-1.5 rounded-full bg-[#38bcfd] animate-bounce" />
                    </div>
                  </div>
                )}
              </div>

              {/* Suggestions quick action widgets */}
              {messages.length === 1 && !aiLoading && (
                <div className="py-2 flex gap-1.5 overflow-x-auto no-scrollbar scroll-smooth shrink-0 border-t border-white/5 mt-1">
                  {[
                    "Kênh HBO hôm nay có gì?",
                    "Tìm kênh phim hoạt hình",
                    "Giới thiệu tính năng Vplay"
                  ].map((sug, sIdx) => (
                    <button
                      key={`sug-${sIdx}`}
                      onClick={() => handleSendMessage(undefined, sug)}
                      className="px-2.5 py-1 text-[10px] bg-white/5 border border-white/10 rounded-full text-white/70 hover:text-white hover:bg-white/15 transition-all whitespace-nowrap"
                    >
                      {sug}
                    </button>
                  ))}
                </div>
              )}

              {/* Form Input Footer */}
              <form onSubmit={handleSendMessage} className="flex gap-1.5 border-t border-white/10 py-2 shrink-0">
                <input
                  ref={aiInputRef}
                  type="text"
                  value={aiInput}
                  onChange={(e) => setAiInput(e.target.value)}
                  placeholder="Hỏi V-Intelligence..."
                  className="bg-white/10 rounded-full px-3.5 py-1.5 text-xs text-white placeholder-white/30 outline-none flex-1 border-none focus:ring-1 focus:ring-[#4AC4FE]"
                />
                <button
                  type="submit"
                  disabled={aiLoading}
                  className="px-3 bg-[#4AC4FE] hover:bg-[#38bcfd] text-slate-900 rounded-full font-black text-xs h-8 flex items-center justify-center transition-all disabled:opacity-50"
                >
                  Gửi
                </button>
              </form>
            </motion.div>
          )}
        </AnimatePresence>
      </motion.div>
    </div>
  );
}

function TopBar({ 
  isDark, 
  onMenuClick, 
  searchQuery, 
  setSearchQuery, 
  onSearchClick, 
  isSearchOpen, 
  currentTime, 
  weather, 
  showTempInClock, 
  showClock,
  showDate,
  getTempDisplay, 
  formatTime,
  formatDateString,
  setActiveTab,
  sidebarExpanded,
  handleSearchContextMenu,
  onContextMenu,
  isSearchCompact,
  startListening,
  isListening,
  isListeningFailed,
  activeTab,
  onSystemTrayClick,
  location = "Hanoi",
  topbarSearchType = "box",
  searchFilterOption,
  setSearchFilterOption,
  user,
  userData,
  name,
  avatar,
  isUserMenuOpen,
  setIsUserMenuOpen,
  showVersionInfo,
  setShowVersionInfo,
  handleLogin,
  handleLogout,
  handleOpenSettings,
  useSidebar = true,
  floatyBars = false
}: { 
  isDark: boolean, 
  onMenuClick: () => void, 
  searchQuery: string, 
  setSearchQuery: (q: string) => void, 
  onSearchClick: () => void, 
  isSearchOpen: boolean, 
  currentTime: Date, 
  weather: any, 
  showTempInClock: boolean, 
  showClock: boolean,
  showDate: boolean,
  getTempDisplay: () => string, 
  formatTime: (date: Date) => string,
  formatDateString: (date: Date) => string,
  setActiveTab: (tab: string) => void,
  sidebarExpanded?: boolean,
  useSidebar?: boolean,
  handleSearchContextMenu?: (e: React.MouseEvent) => void,
  onContextMenu?: (e: React.MouseEvent) => void,
  isSearchCompact?: boolean,
  startListening?: () => void,
  isListening?: boolean,
  isListeningFailed?: boolean,
  activeTab: string,
  onSystemTrayClick?: () => void,
  location?: string,
  topbarSearchType?: "box" | "icon",
  searchFilterOption?: "Tất cả kênh" | "Kênh của Vplay" | "Package của bạn",
  setSearchFilterOption?: (val: "Tất cả kênh" | "Kênh của Vplay" | "Package của bạn") => void,
  user: any,
  userData: any,
  name: string,
  avatar: string,
  isUserMenuOpen: boolean,
  setIsUserMenuOpen: (o: boolean) => void,
  showVersionInfo: boolean,
  setShowVersionInfo: (o: boolean) => void,
  handleLogin: () => void,
  handleLogout: () => void,
  handleOpenSettings: () => void,
  floatyBars?: boolean
}) {
  const [isSearchButtonExpanded, setIsSearchButtonExpanded] = React.useState(false);
  const [showTopBarFilterDropdown, setShowTopBarFilterDropdown] = React.useState(false);
  const hours = currentTime.getHours();
  const isDaytime = hours >= 5 && hours < 18;
  const WeatherIcon = isDaytime ? Sun : Moon;
  const weatherColor = isDaytime ? "text-yellow-400" : "text-blue-400";
  const dateStr = formatDateString(currentTime);

  const getSearchPlaceholder = () => {
    if (isListening) return "Speak something, I'm listening...";
    if (isListeningFailed) return "I couldn't hear you. Let's try again";
    if (activeTab === "Trang chủ") return "Search Home";
    if (activeTab === "Live") return "Search Live";
    if (activeTab === "Cài đặt") return "Search for options";
    return "Find and explore";
  };

  const isSettingsTab = activeTab === "Cài đặt" || activeTab === "Settings (new)";

  return (
    <div 
      onContextMenu={onContextMenu}
      className={`h-14 flex items-center justify-between px-6 z-[130] backdrop-blur-[3px] border ${
        floatyBars 
          ? "rounded-none border-x-0 border-t-0 shadow-[0_12px_24px_rgba(0,0,0,0.1),_inset_0_1.5px_2.5px_rgba(255,255,255,0.15)] border-b-white/[0.06]" 
          : "rounded-full border"
      } ${
        isDark 
          ? "bg-[#181818]/60 border-white/[0.06] text-white shadow-[0_6px_20px_rgba(0,0,0,0.12),_inset_0_1px_2px_rgba(255,255,255,0.12)]" 
          : "bg-white/60 border-slate-200/40 text-slate-800 shadow-[0_6px_20px_rgba(0,0,0,0.04),_inset_0_1px_2px_rgba(255,255,255,0.25)]"
      }`}
    >
      <div className="flex items-center gap-2">
        {useSidebar && (
          <Tooltip text="Thu gọn/Mở rộng sidebar" isDark={isDark} position="right">
            <button 
              onClick={onMenuClick}
              className={`p-2 rounded-xl transition-all hover:bg-white/5 ${isDark ? "text-white/80 hover:text-white" : "text-slate-600 hover:text-slate-900"}`}
            >
              <Menu size={20} />
            </button>
          </Tooltip>
        )}

        {/* Search icon next to hamburger menu */}
        {!isSettingsTab && topbarSearchType === "icon" && !isSearchButtonExpanded && (
          <Tooltip text="Tìm kiếm" isDark={isDark} position="right">
            <button 
              onClick={() => setIsSearchButtonExpanded(true)}
              className={`p-2 rounded-xl transition-all hover:bg-white/5 ${isDark ? "text-white/80 hover:text-white" : "text-slate-600 hover:text-slate-900"}`}
            >
              <Search size={20} />
            </button>
          </Tooltip>
        )}

        <div className="flex items-center gap-2 ml-1">
          <motion.img 
            src="https://static.wikia.nocookie.net/ftv/images/a/a6/Imagedskvjndkv.png/revision/latest?cb=20260430103502&path-prefix=vi" 
            alt="Logo" 
            className="w-6 h-6 object-contain"
            referrerPolicy="no-referrer"
          />
          <span className="font-bold text-sm tracking-tight hidden xs:block">Vplay</span>
        </div>
      </div>

      {!isSettingsTab ? (
        <div className="flex-1 flex justify-center mx-4 relative max-w-sm md:max-w-md lg:max-w-lg">
        {topbarSearchType === "icon" ? (
          isSearchButtonExpanded ? (
            <div 
              className={`group flex items-center gap-2.5 h-10 w-full cursor-pointer transform transition-all duration-300 hover:scale-[1.01] hover:border-[#4AC4FE]/40 active:scale-[0.99] relative rounded-full border ${
                isDark 
                  ? (isListening 
                      ? "bg-red-500/15 border-red-500 text-slate-100 shadow-[0_4px_12px_rgba(239,68,68,0.2)]" 
                      : "bg-white/10 border-white/15 text-slate-100 shadow-[0_4px_12px_rgba(0,0,0,0.15),_inset_0_1.5px_2.5px_rgba(255,255,255,0.15)] focus-within:shadow-[0_8px_24px_rgba(74,196,254,0.35)]"
                    ) 
                  : (isListening
                      ? "bg-red-500/10 border-red-500 text-slate-800 shadow-[0_4px_12px_rgba(239,68,68,0.15)]"
                      : "bg-slate-100 border-slate-300/60 text-slate-800 shadow-[0_4px_10px_rgba(0,0,0,0.06),_inset_0_1.5px_2px_rgba(255,255,255,0.4)] focus-within:shadow-[0_8px_20px_rgba(74,196,254,0.25)]"
                    )
              }`}
            >
              <SearchCustomIcon size={22} className="ml-3.5" />
              <input
                autoFocus
                type="text"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                onContextMenu={handleSearchContextMenu}
                placeholder={getSearchPlaceholder()}
                className={`flex-1 bg-transparent border-none outline-none text-sm font-medium ${isDark ? "placeholder:text-slate-100/30 text-slate-100" : "placeholder:text-slate-400 text-slate-800"}`}
              />
              {searchQuery && (
                <button onClick={() => setSearchQuery("")} className="p-1 hover:bg-black/10 rounded-full transition-all">
                  <X size={14} className={isDark ? "text-slate-300/60" : "text-slate-400"} />
                </button>
              )}

              
              {/* Collapse/Close button */}
              <button 
                onClick={() => setIsSearchButtonExpanded(false)}
                className={`p-1 mr-1.5 rounded-full hover:bg-black/10 transition-all ${isDark ? "text-slate-300/60" : "text-slate-400 hover:text-slate-900"}`}
                title="Đóng tìm kiếm"
              >
                <X size={16} />
              </button>
            </div>
          ) : null
        ) : (
          <div 
            className={`group flex items-center gap-2.5 h-10 w-full cursor-pointer transform transition-all duration-300 hover:scale-[1.01] hover:border-[#4AC4FE]/40 active:scale-[0.99] relative rounded-full border ${
              isDark 
                ? (isListening 
                    ? "bg-red-500/15 border-red-500 text-slate-100 shadow-[0_4px_12px_rgba(239,68,68,0.2)]" 
                    : "bg-white/10 border-white/15 text-slate-100 shadow-[0_4px_12px_rgba(0,0,0,0.15),_inset_0_1.5px_2.5px_rgba(255,255,255,0.15)] focus-within:shadow-[0_8px_24px_rgba(74,196,254,0.35)]"
                  ) 
                : (isListening
                    ? "bg-red-500/10 border-red-500 text-slate-800 shadow-[0_4px_12px_rgba(239,68,68,0.15)]"
                    : "bg-slate-100 border-slate-300/60 text-slate-800 shadow-[0_4px_10px_rgba(0,0,0,0.06),_inset_0_1.5px_2px_rgba(255,255,255,0.4)] focus-within:shadow-[0_8px_20px_rgba(74,196,254,0.25)]"
                  )
            }`}
          >
            <SearchCustomIcon size={22} className="ml-3.5" />
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              onContextMenu={handleSearchContextMenu}
              placeholder={getSearchPlaceholder()}
              className={`flex-1 bg-transparent border-none outline-none text-sm font-medium ${isDark ? "placeholder:text-slate-100/30 text-slate-100" : "placeholder:text-slate-400 text-slate-800"}`}
            />
            {searchQuery && (
              <button onClick={() => setSearchQuery("")} className="p-1 hover:bg-black/10 rounded-full transition-all">
                <X size={14} className={isDark ? "text-slate-300/60" : "text-slate-400"} />
              </button>
            )}
            <Tooltip text="Use microphone" isDark={isDark} position="bottom">
              <button 
                onClick={startListening}
                className={`p-2 rounded-full transition-all mr-1.5 ${isListening ? "text-red-500 animate-pulse bg-red-500/15" : (isDark ? "text-slate-100/40 hover:text-slate-200 hover:bg-black/5" : "text-slate-400 hover:text-slate-900 hover:bg-black/5")}`}>
                <Mic size={18} className={isListening ? "fill-red-500" : ""} strokeWidth={isListening ? 2.5 : 2} />
              </button>
            </Tooltip>

          </div>
        )}

        {/* Quick Search Preview */}
        <AnimatePresence>
          {searchQuery.trim().length > 0 && (
            <motion.div
              initial={{ opacity: 0, y: 10, scale: 0.95 }}
              animate={{ opacity: 1, y: 0, scale: 1 }}
              exit={{ opacity: 0, y: 10, scale: 0.95 }}
              className={`absolute top-full left-1/2 -translate-x-1/2 mt-2 w-full max-w-lg rounded-2xl shadow-2xl border p-2 z-[200] ${
                isDark ? "bg-[#181818] border-white/10 text-white" : "bg-white border-slate-200 text-slate-900"
              }`}
            >
              <div className="max-h-80 overflow-y-auto px-1 space-y-1 custom-scrollbar">
                {channels.filter(c => c.name.toLowerCase().includes(searchQuery.toLowerCase())).slice(0, 5).map(c => (
                  <button
                    key={`search-preview-${c.name}`}
                    onClick={() => {
                      setActiveTab("Live");
                      // setActiveChannel logic should be handled by App state
                      setSearchQuery("");
                    }}
                    className={`w-full flex items-center gap-3 p-2.5 rounded-xl transition-all ${isDark ? "hover:bg-white/5 font-medium" : "hover:bg-slate-100"}`}
                  >
                    <div className="w-10 h-10 rounded-lg bg-white/5 p-1.5 flex items-center justify-center border border-white/5">
                      <img src={c.logo} alt={c.name} className="w-full h-full object-contain" />
                    </div>
                    <div className="flex-1 text-left">
                      <p className="text-sm font-bold truncate uppercase tracking-tight">{c.name}</p>
                      <p className="text-[10px] opacity-40 uppercase tracking-widest">{c.category}</p>
                    </div>
                    <ArrowRight size={14} className="opacity-20" />
                  </button>
                ))}
                {channels.filter(c => c.name.toLowerCase().includes(searchQuery.toLowerCase())).length === 0 && (
                  <div className="py-8 text-center text-xs opacity-40 uppercase tracking-widest font-bold">
                    Không tìm thấy kênh nào
                  </div>
                )}
              </div>
              <button 
                onClick={() => setActiveTab("Khám phá")}
                className="w-full py-3 mt-1 text-center text-[10px] font-bold uppercase tracking-[0.2em] opacity-40 hover:opacity-100 hover:text-[#4AC4FE] transition-all border-t border-white/5"
              >
                Xem tất cả kết quả
              </button>
            </motion.div>
          )}
        </AnimatePresence>
      </div>
      ) : (
        <div className="flex-1" />
      )}

      <div className="flex items-center gap-4">
        {weather && showTempInClock && (
          <Tooltip text={`Thời tiết tại ${location}`} isDark={isDark} position="bottom">
            <div 
              onClick={onSystemTrayClick}
              className="flex items-center gap-2 mr-2 px-3 py-1 rounded-full bg-white/10 border border-white/10 cursor-pointer hover:bg-white/20 transition-all active:scale-95"
            >
              <WeatherIcon size={16} className={weatherColor} />
              <span className={`text-xs font-bold ${isDark ? "text-white/90" : "text-slate-900"}`}>{getTempDisplay()}</span>
            </div>
          </Tooltip>
        )}
        {(showClock || showDate) && (
          <div 
            onClick={onSystemTrayClick}
            className="hidden sm:flex flex-col items-end text-right leading-none mr-3 font-google cursor-pointer hover:opacity-80 transition-all active:scale-95"
          >
            {showClock && (
              <div className={`text-sm font-bold tracking-tight mb-0.5 ${isDark ? "text-white/90" : "text-slate-900"}`}>
                {formatTime(currentTime)}
              </div>
            )}
            {showDate && (
              <div className={`text-[10px] font-bold tracking-widest uppercase opacity-40 ${isDark ? "text-white" : "text-slate-600"}`}>
                {dateStr}
              </div>
            )}
          </div>
        )}

        {/* User profile picture / Account submenu in topbar */}
        <div className="relative flex items-center shrink-0">
          <Tooltip text="Tài khoản Vplay" isDark={isDark} position="bottom">
            <button
              onClick={() => setIsUserMenuOpen(!isUserMenuOpen)}
              className={`flex items-center justify-center p-1 rounded-full transition-all relative group focus:outline-none ${
                isUserMenuOpen
                  ? (isDark ? "bg-white/10" : "bg-black/5")
                  : (isDark ? "hover:bg-white/5" : "hover:bg-black/5")
              }`}
            >
              <div className={`w-9 h-9 rounded-full flex items-center justify-center border-2 overflow-hidden ${
                user 
                  ? (isDark ? "bg-[#4AC4FE]/10 border-[#4AC4FE]/25 text-[#4AC4FE]" : "bg-[#4AC4FE]/10 border-[#4AC4FE]/30 text-[#0284c7]")
                  : "bg-amber-400/10 border-white/10 text-amber-500"
              }`}>
                {user && (user.photoURL || userData?.avatar) ? (
                  <img src={user.photoURL || userData?.avatar} alt="User Avatar" className="w-full h-full object-cover" referrerPolicy="no-referrer" />
                ) : (
                  <User size={18} />
                )}
              </div>
            </button>
          </Tooltip>

          <AnimatePresence>
            {isUserMenuOpen && (
              <>
                <motion.div 
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  exit={{ opacity: 0 }}
                  className={`fixed inset-0 z-[490] ${isDark ? "bg-[#0c1020]/45" : "bg-[#e0f2fe]/40"}`} 
                  onClick={() => setIsUserMenuOpen(false)}
                />
                <motion.div
                  initial={{ opacity: 0, y: -40, scale: 0.95 }}
                  animate={{ opacity: 1, y: 0, scale: 1 }}
                  exit={{ opacity: 0, y: -40, scale: 0.95 }}
                  transition={{ type: "spring", damping: 20, stiffness: 140 }}
                  className={`absolute top-full mt-3 right-0 w-[280px] rounded-[28px] border z-[500] overflow-hidden backdrop-blur-none transition-all duration-300 ${
                    isDark 
                      ? "bg-[#12131a]/90 border-white/25 text-white shadow-[0_20px_50px_rgba(0,0,0,0.45),_inset_0_1.5px_2px_rgba(255,255,255,0.12)]" 
                      : "bg-white/92 border-slate-200/90 text-slate-800 shadow-[0_20px_45px_rgba(15,23,42,0.12),_inset_0_1.5px_2px_rgba(255,255,255,0.35)]"
                  }`}
                >
                 <div className="p-6 pb-4 flex flex-col items-center text-center">
                  {!showVersionInfo ? (
                    <>
                      <div className={`w-14 h-14 rounded-full flex items-center justify-center mb-3 border overflow-hidden bg-[linear-gradient(45deg,#ccc_25%,transparent_25%,transparent_75%,#ccc_75%,#ccc_100%),linear-gradient(45deg,#ccc_25%,white_25%,white_75%,#ccc_75%,#ccc_100%)] bg-[size:10px_10px] ${
                        isDark 
                          ? "border-[#4AC4FE]/25 text-[#4AC4FE]" 
                          : "border-[#4AC4FE]/35 text-[#0284c7]"
                      }`}>
                        {user && (user.photoURL || userData?.avatar) ? (
                          <img src={user.photoURL || userData?.avatar} alt="User Avatar" className="w-full h-full object-cover" referrerPolicy="no-referrer" />
                        ) : (
                          <User size={26} />
                        )}
                      </div>
                      <h3 className="text-base font-bold mb-0.5 tracking-tight">{user ? (userData?.name || name || user.displayName || "Thành viên") : "Khách"}</h3>
                      <p className="text-[10px] opacity-40 mb-4 font-medium tracking-tight">
                        {user ? user.email : "Đăng nhập để có trải nghiệm tốt nhất"}
                      </p>
                      {!user ? (
                        <button 
                          onClick={() => { handleLogin(); setIsUserMenuOpen(false); }}
                          className="w-full py-2.5 bg-[#4AC4FE] hover:bg-[#32bcfc] text-black rounded-[18px] font-bold text-sm transition-colors shadow-none active:scale-[0.98] mb-1 border-none outline-none cursor-pointer"
                        >
                          Đăng nhập ngay
                        </button>
                        ) : (
                          <button 
                            onClick={() => { handleLogout(); setIsUserMenuOpen(false); }}
                            className="w-full py-2.5 bg-red-500/10 hover:bg-red-500/20 text-red-500 rounded-[18px] font-bold text-sm transition-all active:scale-[0.98] mb-1 cursor-pointer"
                          >
                            Đăng xuất
                          </button>
                        )}
                    </>
                  ) : (
                    <>
                      <div className={`w-14 h-14 rounded-full flex items-center justify-center mb-3 ${isDark ? "bg-white/10" : "bg-black/5"}`}>
                        <Info size={28} className="text-[#4AC4FE]" />
                      </div>
                      <h3 className="text-base font-bold mb-0.5 tracking-tight">Thông tin Phiên bản</h3>
                      <p className="text-[10px] opacity-40 mb-4 font-medium tracking-tight">Vplay Metadata Information</p>
                      <div className={`w-full space-y-1.5 p-3 rounded-2xl ${isDark ? "bg-white/5" : "bg-black/5"}`}>
                        <div className="flex justify-between items-center text-[11px]">
                          <span className="opacity-50">Phát triển by</span>
                          <span className="font-bold">VNRT</span>
                        </div>
                        <div className="flex justify-between items-center text-[11px]">
                          <span className="opacity-50">Branch</span>
                          <span className="font-bold text-green-500">Dev</span>
                        </div>
                        <div className="flex justify-between items-center text-[11px]">
                          <span className="opacity-50">Version</span>
                          <span className="font-bold text-[#4AC4FE]">26.7.0</span>
                        </div>
                        <div className="flex justify-between items-center text-[11px]">
                          <span className="opacity-50">Compiled</span>
                          <span className="font-bold">15/05/26</span>
                        </div>
                      </div>
                      <button 
                        onClick={() => setShowVersionInfo(false)}
                        className={`w-full mt-4 py-2 rounded-xl text-[11px] font-bold transition-all cursor-pointer ${isDark ? "bg-white/5 hover:bg-white/10" : "bg-black/5 hover:bg-black/10"}`}
                      >
                        Quay lại
                      </button>
                    </>
                  )}
                </div>

                <AnimatePresence>
                  {!showVersionInfo && (
                    <motion.div
                      initial={{ opacity: 0, height: 0 }}
                      animate={{ opacity: 1, height: "auto" }}
                      exit={{ opacity: 0, height: 0 }}
                    >
                      <div className={`h-px ${isDark ? "bg-white/5" : "bg-black/5"}`} />

                      <div className="p-2.5 space-y-2">
                        {[
                          { icon: Info, label: "Phiên bản Vplay", action: () => setShowVersionInfo(true) },
                          { icon: Smartphone, label: "Quản lý hồ sơ", action: () => { handleOpenSettings(); setIsUserMenuOpen(false); } },
                          { icon: Settings, label: "Cài đặt hệ thống", action: () => { handleOpenSettings(); setIsUserMenuOpen(false); } },
                          { icon: Send, label: "Send Feedback", action: () => { window.open("https://discord.gg/CNKFTUBSty"); setIsUserMenuOpen(false); } },
                        ].map((item) => (
                          <button
                            key={`user-menu-${item.label}`}
                            onClick={item.action}
                            className={`w-full flex items-center justify-between px-3 py-2 rounded-xl transition-all group cursor-pointer ${
                              isDark ? "hover:bg-white/5 text-white" : "hover:bg-black/5 text-slate-800"
                            }`}
                          >
                            <div className="flex items-center gap-4">
                              <div className={`transition-colors ${isDark ? "text-white/40 group-hover:text-[#4AC4FE]" : "text-black/40 group-hover:text-[#4AC4FE]"}`}>
                                <item.icon size={18} strokeWidth={1.5} />
                              </div>
                              <span className={`text-[12px] font-bold tracking-tight ${isDark ? "text-white/70 group-hover:text-white" : "text-slate-700"}`}>{item.label}</span>
                            </div>
                            <ChevronRight size={12} className="opacity-20 group-hover:opacity-60 transition-all translate-x-0 group-hover:translate-x-1" />
                          </button>
                        ))}
                      </div>
                    </motion.div>
                  )}
                </AnimatePresence>
              </motion.div>
              </>
            )}
          </AnimatePresence>
        </div>
      </div>
    </div>
  );
}

function SearchContextMenu({ 
  x, 
  y, 
  onClose, 
  onSelect, 
  activeFilter, 
  isDark 
}: { 
  x: number, 
  y: number, 
  onClose: () => void, 
  onSelect: (filter: "all" | "channels" | "settings" | "experiments") => void,
  activeFilter: string,
  isDark: boolean,
  key?: any
}) {
  const menuItems = [
    { id: "all", label: "Tìm kiếm tất cả", icon: Search },
    { id: "channels", label: "Tìm kiếm kênh", icon: TvIcon },
    { id: "settings", label: "Tìm kiếm cài đặt", icon: SettingsIcon },
    { id: "experiments", label: "Tìm kiếm thử nghiệm", icon: Flask },
  ];

  return (
    <>
      <div className="fixed inset-0 z-[1000]" onClick={onClose} onContextMenu={(e) => { e.preventDefault(); onClose(); }} />
      <div
        className="fixed z-[1001] w-56 rounded-2xl border transition-all duration-300 font-bold shadow-[0_12px_32px_rgba(0,0,0,0.25)] text-black"
        style={{
          position: "fixed",
          top: y,
          left: x,
          padding: "6px",
          backgroundColor: "#ffffff",
          border: "1px solid rgba(0, 0, 0, 0.1)"
        }}
      >
        {menuItems.map((item) => {
          const Icon = item.icon;
          const isActive = activeFilter === item.id;
          return (
            <button
              key={item.id}
              onClick={() => { onSelect(item.id as any); onClose(); }}
              className={`w-full flex items-center gap-3 px-3 py-2 rounded-xl transition-all ${
                isActive 
                  ? "bg-slate-100 text-black font-extrabold" 
                  : "hover:bg-slate-100 text-slate-800 hover:text-black font-semibold"
              }`}
            >
              <Icon size={16} className="text-black" />
              <span className="text-sm">{item.label}</span>
              {isActive && <CheckCircle2 size={14} className="ml-auto text-[#4AC4FE]" />}
            </button>
          );
        })}
      </div>
    </>
  );
}

function UnifiedContextMenu({ 
  x, 
  y, 
  onClose, 
  isDark, 
  headingBar, 
  setHeadingBar, 
  useSidebar, 
  setUseSidebar, 
  showClock, 
  setShowClock, 
  showDate, 
  setShowDate, 
  showTempInClock, 
  setShowTempInClock, 
  handleOpenSettings,
  featureFlags = {}
}: {
  x: number, y: number, onClose: () => void, isDark: boolean,
  headingBar: boolean, setHeadingBar: (v: boolean) => void,
  useSidebar: boolean, setUseSidebar: (v: boolean) => void,
  showClock: boolean, setShowClock: (v: boolean) => void,
  showDate: boolean, setShowDate: (v: boolean) => void,
  showTempInClock: boolean, setShowTempInClock: (v: boolean) => void,
  handleOpenSettings: () => void,
  featureFlags?: any,
  key?: any
}) {
  const hasClockOrDate = showClock || showDate;
  
  const handleToggleTimer = () => {
    const targetState = !hasClockOrDate;
    setShowClock(targetState);
    setShowDate(targetState);
    onClose();
  };

  return (
    <>
      <div className="fixed inset-0 z-[1000]" onClick={onClose} onContextMenu={(e) => { e.preventDefault(); onClose(); }} />
      <div
        className="fixed z-[1001] w-60 rounded-2xl border transition-all duration-300 font-bold shadow-[0_12px_32px_rgba(0,0,0,0.25)] text-black"
        style={{
          position: "fixed",
          top: y,
          left: x,
          padding: "6px",
          backgroundColor: "#ffffff",
          border: "1px solid rgba(0, 0, 0, 0.1)"
        }}
      >
        {/* Section 1: UI Layout */}
        <button 
          onClick={() => { setHeadingBar(!headingBar); onClose(); }} 
          className="w-full flex items-center gap-3 px-3 py-2 rounded-xl transition-all hover:bg-slate-100 text-slate-800 hover:text-black font-semibold"
        >
          {headingBar ? <EyeOff size={16} className="text-black" /> : <Eye size={16} className="text-black" />}
          <span className="text-sm">
            {featureFlags.dynamic_island 
              ? (headingBar ? "Ẩn Dynamic Island" : "Hiện Dynamic Island")
              : (headingBar ? "Ẩn Top bar" : "Hiện Top bar")}
          </span>
        </button>

        <button 
          onClick={() => { setUseSidebar(!useSidebar); onClose(); }} 
          className="w-full flex items-center gap-3 px-3 py-2 rounded-xl transition-all hover:bg-slate-100 text-slate-800 hover:text-black font-semibold"
        >
          {useSidebar ? <Smartphone size={16} className="text-black" /> : <Columns size={16} className="text-black" />}
          <span className="text-sm">{useSidebar ? "Sử dụng Bottom bar" : "Sử dụng Sidebar"}</span>
        </button>

        <div className="h-[1px] bg-slate-200 my-1.5 mx-1" />

        {/* Section 2: Time & Weather */}
        <button 
          onClick={handleToggleTimer} 
          className="w-full flex items-center justify-between px-3 py-2 rounded-xl transition-all hover:bg-slate-100 text-slate-800 hover:text-black font-semibold"
        >
          <div className="flex items-center gap-3">
            <Clock size={16} className="text-black" />
            <span className="text-sm">{hasClockOrDate ? "Ẩn đồng hồ và lịch" : "Hiện đồng hồ và lịch"}</span>
          </div>
          {hasClockOrDate && <Check size={14} className="text-[#38bcfd]" />}
        </button>

        <button 
          onClick={() => { setShowTempInClock(!showTempInClock); onClose(); }} 
          className="w-full flex items-center justify-between px-3 py-2 rounded-xl transition-all hover:bg-slate-100 text-slate-800 hover:text-black font-semibold"
        >
          <div className="flex items-center gap-3">
            <Thermometer size={16} className="text-black" />
            <span className="text-sm">Hiện nhiệt độ</span>
          </div>
          {showTempInClock && <Check size={14} className="text-[#38bcfd]" />}
        </button>

        <div className="h-[1px] bg-slate-200 my-1.5 mx-1" />

        {/* Section 3: App Controls */}
        <button 
          onClick={() => { window.location.reload(); }} 
          className="w-full flex items-center gap-3 px-3 py-2 rounded-xl transition-all hover:bg-slate-100 text-slate-800 hover:text-black font-semibold"
        >
          <RotateCcw size={16} className="text-black" />
          <span className="text-sm">Refresh</span>
        </button>

        <button 
          onClick={() => { handleOpenSettings(); onClose(); }} 
          className="w-full flex items-center gap-3 px-3 py-2 rounded-xl transition-all hover:bg-slate-100 text-slate-800 hover:text-black font-semibold"
        >
          <SettingsIcon size={16} className="text-black" />
          <span className="text-sm">Cài đặt</span>
        </button>
      </div>
    </>
  );
}

function WordScrambleGame({ isDark }: { isDark: boolean }) {
  const [language, setLanguage] = useState<'vi' | 'en'>('vi');
  const [score, setScore] = useState(0);
  const [currentWord, setCurrentWord] = useState('');
  const [scrambled, setScrambled] = useState('');
  const [userGuess, setUserGuess] = useState('');
  const [status, setStatus] = useState<'idle' | 'correct' | 'wrong'>('idle');

  const words = {
    vi: ['máy tính', 'vplay', 'truyền hình', 'phát triển', 'ứng dụng', 'âm nhạc', 'phim ảnh', 'công nghệ', 'sáng tạo', 'tương lai'],
    en: ['computer', 'software', 'network', 'develop', 'programming', 'interface', 'canary', 'digital', 'science', 'creative']
  };

  const getRandomWord = () => {
    const list = words[language];
    const word = list[Math.floor(Math.random() * list.length)];
    setCurrentWord(word);
    setScrambled(word.split('').sort(() => Math.random() - 0.5).join(''));
    setUserGuess('');
    setStatus('idle');
  };

  useEffect(() => {
    getRandomWord();
  }, [language]);

  const checkWord = () => {
    if (userGuess.toLowerCase().trim() === currentWord.toLowerCase().trim()) {
      setStatus('correct');
      setScore(s => s + 10);
      setTimeout(getRandomWord, 1000);
    } else {
      setStatus('wrong');
    }
  };

  return (
    <div className="flex flex-col gap-3">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2">
          <div className={`w-8 h-8 rounded-xl ${isDark ? "bg-white/10" : "bg-orange-50"} flex items-center justify-center text-orange-500`}>
            <Shuffle size={16} />
          </div>
          <div>
            <p className="text-[10px] font-bold opacity-50 uppercase tracking-widest">Scramble</p>
            <p className="text-xs font-bold">Sắp xếp từ</p>
          </div>
        </div>
        <div className="flex gap-1 bg-slate-100 p-1 rounded-lg">
          <button onClick={() => setLanguage('vi')} className={`text-[8px] font-bold px-2 py-0.5 rounded-md transition-all ${language === 'vi' ? "bg-white shadow-sm text-orange-500" : "text-slate-400"}`}>VI</button>
          <button onClick={() => setLanguage('en')} className={`text-[8px] font-bold px-2 py-0.5 rounded-md transition-all ${language === 'en' ? "bg-white shadow-sm text-orange-500" : "text-slate-400"}`}>EN</button>
        </div>
      </div>
      
      <div className={`p-4 rounded-2xl ${isDark ? "bg-white/5 border-white/5" : "bg-slate-50 border-slate-100"} border text-center relative overflow-hidden`}>
        {status === 'correct' && <motion.div initial={{ scale: 0 }} animate={{ scale: 1 }} className="absolute inset-0 bg-green-500/10 flex items-center justify-center text-green-600 font-black text-xs uppercase tracking-tighter">Chính xác!</motion.div>}
        <p className="text-xl font-bold tracking-[0.3em] uppercase text-slate-800">{scrambled}</p>
      </div>

      <div className="flex gap-2">
        <input 
          value={userGuess}
          onChange={(e) => setUserGuess(e.target.value)}
          onKeyDown={(e) => e.key === 'Enter' && checkWord()}
          placeholder="Nhập từ..."
          className={`flex-1 h-10 px-3 rounded-xl border border-slate-100 outline-none text-xs font-bold focus:border-orange-500 transition-all ${status === 'wrong' ? "border-red-500 text-red-500 bg-red-50 animate-shake" : ""}`}
        />
        <button onClick={checkWord} className="w-10 h-10 rounded-xl bg-orange-500 text-white flex items-center justify-center shadow-lg shadow-orange-500/20 active:scale-95 transition-all">
          <Send size={16} />
        </button>
      </div>
      <div className="flex justify-between items-center text-[10px] font-bold text-slate-400">
        <span>Score: {score}</span>
        <button onClick={getRandomWord} className="hover:text-orange-500 transition-colors">Đổi từ khác</button>
      </div>
    </div>
  );
}

function WordChainGame({ isDark }: { isDark: boolean }) {
  const [language, setLanguage] = useState<'vi' | 'en'>('vi');
  const [history, setHistory] = useState<string[]>([]);
  const [input, setInput] = useState('');
  const [score, setScore] = useState(0);

  const startWords = {
    vi: ['vplay', 'máy tính', 'công nghệ', 'sáng tạo'],
    en: ['vplay', 'computer', 'science', 'creative']
  };

  useEffect(() => {
    setHistory([startWords[language][Math.floor(Math.random() * startWords[language].length)]]);
    setScore(0);
  }, [language]);

  const handleSend = () => {
    if (!input.trim()) return;
    const word = input.toLowerCase().trim();
    const lastWord = history[history.length - 1];
    
    // Simple validation: check last character of last word matches first character of new word
    // In VN, "Nối từ" often works with syllables, but for simplicity we'll use characters or last syllable
    const lastChar = lastWord.charAt(lastWord.length - 1);
    const firstChar = word.charAt(0);

    if (firstChar === lastChar && !history.includes(word)) {
      setHistory(h => [...h, word]);
      setScore(s => s + word.length);
      setInput('');
      // Bot reply placeholder or just score player
    } else {
      // Shaky animation or something
    }
  };

  return (
    <div className="flex flex-col gap-3">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2">
          <div className={`w-8 h-8 rounded-xl ${isDark ? "bg-white/10" : "bg-blue-50"} flex items-center justify-center text-blue-500`}>
            <Link size={16} />
          </div>
          <div>
            <p className="text-[10px] font-bold opacity-50 uppercase tracking-widest">Word Chain</p>
            <p className="text-xs font-bold">Nối từ</p>
          </div>
        </div>
        <div className="flex gap-1 bg-slate-100 p-1 rounded-lg">
          <button onClick={() => setLanguage('vi')} className={`text-[8px] font-bold px-2 py-0.5 rounded-md transition-all ${language === 'vi' ? "bg-white shadow-sm text-blue-500" : "text-slate-400"}`}>VI</button>
          <button onClick={() => setLanguage('en')} className={`text-[8px] font-bold px-2 py-0.5 rounded-md transition-all ${language === 'en' ? "bg-white shadow-sm text-blue-500" : "text-slate-400"}`}>EN</button>
        </div>
      </div>

      <div className={`h-24 overflow-y-auto px-1 py-1 custom-scrollbar space-y-1.5`}>
        {history.map((word, i) => (
          <div key={i} className={`flex items-center gap-2 ${i % 2 === 0 ? "justify-end text-right" : "justify-start text-left"}`}>
             <div className={`px-3 py-1.5 rounded-xl text-[10px] font-bold shadow-sm ${i % 2 === 0 ? "bg-blue-500 text-white" : "bg-slate-100 text-slate-700"}`}>
               {word}
             </div>
          </div>
        ))}
      </div>

      <div className="flex gap-2">
        <input 
          value={input}
          onChange={(e) => setInput(e.target.value)}
          onKeyDown={(e) => e.key === 'Enter' && handleSend()}
          placeholder={`Bắt đầu bằng '${history[history.length-1]?.charAt(history[history.length-1]?.length-1)}'...`}
          className="flex-1 h-10 px-3 rounded-xl border border-slate-100 outline-none text-xs font-bold focus:border-blue-500 transition-all"
        />
        <button onClick={handleSend} className="w-10 h-10 rounded-xl bg-blue-500 text-white flex items-center justify-center shadow-lg shadow-blue-600/20 active:scale-95 transition-all">
          <Send size={16} />
        </button>
      </div>
      <div className="text-[10px] font-bold text-slate-400">Score: {score} pts</div>
    </div>
  );
}

function StickyNotesWidget({ isDark }: { isDark: boolean }) {
  const [note, setNote] = useState(() => localStorage.getItem("vplay_sticky_note") || "Hôm nay tôi cần làm gì?");
  const [bgColor, setBgColor] = useState(() => localStorage.getItem("vplay_note_bg") || "#fef3c7");
  const [textColor, setTextColor] = useState(() => localStorage.getItem("vplay_note_txt") || "#92400e");
  const [format, setFormat] = useState({ bold: false, italic: false, underline: false });

  useEffect(() => {
    localStorage.setItem("vplay_sticky_note", note);
    localStorage.setItem("vplay_note_bg", bgColor);
    localStorage.setItem("vplay_note_txt", textColor);
  }, [note, bgColor, textColor]);

  const colors = [
    { bg: "#fef3c7", font: "#92400e" }, // Yellow
    { bg: "#dcfce7", font: "#166534" }, // Green
    { bg: "#e0f2fe", font: "#075985" }, // Blue
    { bg: "#fce7f3", font: "#9d174d" }, // Pink
    { bg: "#1f2937", font: "#ffffff" }  // Dark
  ];

  return (
    <div className="flex flex-col gap-3">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2">
          <div className={`w-8 h-8 rounded-xl ${isDark ? "bg-white/10" : "bg-yellow-50"} flex items-center justify-center text-yellow-600`}>
            <StickyNote size={16} />
          </div>
          <div>
            <p className="text-[10px] font-bold opacity-50 uppercase tracking-widest">Note</p>
            <p className="text-xs font-bold">Ghi chú nhanh</p>
          </div>
        </div>
        <div className="flex gap-3 items-center">
            <div className="flex gap-1">
              <button 
                onClick={() => setFormat(f => ({ ...f, bold: !f.bold }))}
                className={`p-1 rounded-md transition-all ${format.bold ? "bg-black/10 text-black" : "text-slate-400 hover:text-slate-600"}`}
              >
                <Bold size={12} />
              </button>
              <button 
                onClick={() => setFormat(f => ({ ...f, italic: !f.italic }))}
                className={`p-1 rounded-md transition-all ${format.italic ? "bg-black/10 text-black" : "text-slate-400 hover:text-slate-600"}`}
              >
                <Italic size={12} />
              </button>
              <button 
                onClick={() => setFormat(f => ({ ...f, underline: !f.underline }))}
                className={`p-1 rounded-md transition-all ${format.underline ? "bg-black/10 text-black" : "text-slate-400 hover:text-slate-600"}`}
              >
                <Underline size={12} />
              </button>
            </div>
            <div className="flex gap-1 items-center">
               {colors.map(c => (
                 <button 
                  key={c.bg} 
                  onClick={() => { setBgColor(c.bg); setTextColor(c.font); }} 
                  className={`w-3.5 h-3.5 rounded-full border border-black/5 shadow-sm transition-transform hover:scale-125 ${bgColor === c.bg ? "ring-2 ring-blue-500 ring-offset-2" : ""}`}
                  style={{ backgroundColor: c.bg }}
                 />
               ))}
               <div className="relative w-3.5 h-3.5 rounded-full overflow-hidden border border-black/5 shadow-sm">
                 <input 
                   type="color" 
                   value={bgColor}
                   onChange={(e) => {
                     setBgColor(e.target.value);
                     // Set a default high-contrast text color based on brightness
                     const r = parseInt(e.target.value.slice(1, 3), 16);
                     const g = parseInt(e.target.value.slice(3, 5), 16);
                     const b = parseInt(e.target.value.slice(5, 7), 16);
                     const brightness = (r * 299 + g * 587 + b * 114) / 1000;
                     setTextColor(brightness > 125 ? "#000000" : "#ffffff");
                   }}
                   className="absolute inset-0 w-[200%] h-[200%] -translate-x-1/4 -translate-y-1/4 cursor-pointer"
                 />
               </div>
            </div>
        </div>
      </div>
      
      <div 
        className="w-full h-32 rounded-2xl p-4 shadow-inner relative transition-colors duration-500"
        style={{ backgroundColor: bgColor }}
      >
        <textarea 
          value={note}
          onChange={(e) => setNote(e.target.value)}
          className={`w-full h-full bg-transparent border-none outline-none resize-none text-xs leading-relaxed ${format.bold ? "font-bold" : "font-medium"} ${format.italic ? "italic" : ""} ${format.underline ? "underline" : ""}`}
          style={{ color: textColor }}
          placeholder="Viết gì đó..."
        />
        <div className="absolute right-3 bottom-3 opacity-20">
          <Palette size={14} style={{ color: textColor }} />
        </div>
      </div>
    </div>
  );
}

function CalculatorWidget({ isDark }: { isDark: boolean }) {
  const [display, setDisplay] = useState("0");
  const [equation, setEquation] = useState("");

  const append = (val: string) => {
    if (display === "0" && val !== ".") setDisplay(val);
    else setDisplay(display + val);
  };

  const calculate = () => {
    try {
      // Basic math evaluation - safe for standard calculators
      // eslint-disable-next-line
      const result = eval(display.replace(/×/g, '*').replace(/÷/g, '/'));
      setEquation(display + " =");
      setDisplay(result.toString());
    } catch {
      setDisplay("Error");
    }
  };

  const clear = () => {
    setDisplay("0");
    setEquation("");
  };

  const buttons = [
    { label: "C", action: clear, type: "clear" },
    { label: "÷", action: () => append("÷"), type: "op" },
    { label: "×", action: () => append("×"), type: "op" },
    { label: "DEL", action: () => setDisplay(display.length > 1 ? display.slice(0, -1) : "0"), type: "clear" },
    { label: "7", action: () => append("7"), type: "num" },
    { label: "8", action: () => append("8"), type: "num" },
    { label: "9", action: () => append("9"), type: "num" },
    { label: "-", action: () => append("-"), type: "op" },
    { label: "4", action: () => append("4"), type: "num" },
    { label: "5", action: () => append("5"), type: "num" },
    { label: "6", action: () => append("6"), type: "num" },
    { label: "+", action: () => append("+"), type: "op" },
    { label: "1", action: () => append("1"), type: "num" },
    { label: "2", action: () => append("2"), type: "num" },
    { label: "3", action: () => append("3"), type: "num" },
    { label: "=", action: calculate, type: "equal" },
    { label: "0", action: () => append("0"), type: "num", colSpan: 2 },
    { label: ".", action: () => append("."), type: "num" },
  ];

  return (
    <div className={`p-4 rounded-3xl h-full flex flex-col gap-4 ${isDark ? "bg-slate-900" : "bg-white border border-slate-200 shadow-xl"}`}>
      <div className={`p-4 rounded-2xl text-right overflow-hidden ${isDark ? "bg-black/40" : "bg-slate-50"}`}>
        <p className="text-[10px] font-bold opacity-30 truncate h-4">{equation}</p>
        <p className="text-2xl font-black tracking-tighter truncate">{display}</p>
      </div>
      <div className="grid grid-cols-4 gap-2 flex-1">
        {buttons.map((btn) => (
          <button
            key={`calc-btn-${btn}`}
            onClick={btn.action}
            className={`flex items-center justify-center p-3 rounded-xl text-xs font-black transition-all active:scale-95 ${
              btn.type === "num" ? (isDark ? "bg-white/5 text-white" : "bg-slate-100 text-slate-800") :
              btn.type === "op" ? "bg-blue-600/10 text-blue-500" :
              btn.type === "equal" ? "bg-blue-600 text-white shadow-lg shadow-blue-600/20" :
              (isDark ? "bg-red-500/10 text-red-500" : "bg-red-50 text-red-500")
            } ${btn.colSpan === 2 ? "col-span-2" : ""}`}
          >
            {btn.label}
          </button>
        ))}
      </div>
    </div>
  );
}

function ScientificCalculatorWidget({ isDark }: { isDark: boolean }) {
  const [display, setDisplay] = useState("0");
  const [equation, setEquation] = useState("");

  const append = (val: string) => {
    if (display === "0" && val !== ".") setDisplay(val);
    else setDisplay(display + val);
  };

  const calculate = () => {
    try {
      const sanitized = display
        .replace(/×/g, '*')
        .replace(/÷/g, '/')
        .replace(/π/g, 'Math.PI')
        .replace(/e/g, 'Math.E')
        .replace(/sin\(/g, 'Math.sin(')
        .replace(/cos\(/g, 'Math.cos(')
        .replace(/tan\(/g, 'Math.tan(')
        .replace(/log\(/g, 'Math.log10(')
        .replace(/ln\(/g, 'Math.log(')
        .replace(/sqrt\(/g, 'Math.sqrt(')
        .replace(/\^/g, '**');

      // eslint-disable-next-line
      const result = eval(sanitized);
      setEquation(display + " =");
      setDisplay(result.toString());
    } catch {
      setDisplay("Error");
    }
  };

  const basicBtns = [
    ["sin(", "cos(", "tan(", "π"],
    ["log(", "ln(", "sqrt(", "^"],
    ["7", "8", "9", "÷"],
    ["4", "5", "6", "×"],
    ["1", "2", "3", "-"],
    ["0", ".", "=", "+"]
  ];

  return (
    <div className={`p-4 rounded-3xl h-full flex flex-col gap-3 ${isDark ? "bg-slate-900" : "bg-white border border-slate-200 shadow-xl"}`}>
      <div className={`p-3 rounded-xl text-right overflow-hidden ${isDark ? "bg-black/40" : "bg-slate-50"}`}>
        <p className="text-[10px] font-bold opacity-30 truncate h-3">{equation}</p>
        <p className="text-xl font-black tracking-tighter truncate">{display}</p>
      </div>
      <div className="grid grid-cols-4 gap-1.5 flex-1 overflow-y-auto pr-1 scrollbar-hide">
        <button onClick={() => { setDisplay("0"); setEquation(""); }} className="col-span-2 p-2 rounded-lg bg-red-500/10 text-red-500 text-[10px] font-bold uppercase">Clear</button>
        <button onClick={() => setDisplay(display.length > 1 ? display.slice(0, -1) : "0")} className="col-span-2 p-2 rounded-lg bg-slate-500/10 text-slate-500 text-[10px] font-bold uppercase">Del</button>
        {basicBtns.flat().map((btn) => (
          <button
            key={`sci-calc-btn-${btn}`}
            onClick={() => btn === "=" ? calculate() : append(btn)}
            className={`flex items-center justify-center p-2 rounded-lg text-[10px] font-bold transition-all active:scale-95 ${
              btn === "=" ? "bg-[#4AC4FE] text-white shadow-lg" :
              ["+", "-", "×", "÷", "^"].includes(btn) ? "bg-[#4AC4FE]/10 text-[#4AC4FE]" :
              isNaN(Number(btn)) && btn !== "." ? "bg-blue-600/10 text-blue-500" :
              (isDark ? "bg-white/5 text-white" : "bg-slate-100 text-slate-800")
            }`}
          >
            {btn}
          </button>
        ))}
      </div>
    </div>
  );
}

function TicTacToeGame({ isDark }: { isDark: boolean }) {
  const [board, setBoard] = useState(Array(9).fill(null));
  const [xIsNext, setXIsNext] = useState(true);
  const [mode, setMode] = useState<'selection' | 'pvp' | 'bot'>('selection');
  const [winner, setWinner] = useState<string | null>(null);

  const calculateWinner = (squares: (string | null)[]) => {
    const lines = [
      [0, 1, 2], [3, 4, 5], [6, 7, 8],
      [0, 3, 6], [1, 4, 7], [2, 5, 8],
      [0, 4, 8], [2, 4, 6],
    ];
    for (let i = 0; i < lines.length; i++) {
      const [a, b, c] = lines[i];
      if (squares[a] && squares[a] === squares[b] && squares[a] === squares[c]) {
        return squares[a];
      }
    }
    return squares.includes(null) ? null : 'Draw';
  };

  const handleClick = (i: number) => {
    if (winner || board[i]) return;
    const newBoard = board.slice();
    newBoard[i] = xIsNext ? 'X' : 'O';
    setBoard(newBoard);
    setXIsNext(!xIsNext);
    const win = calculateWinner(newBoard);
    if (win) setWinner(win);
  };

  const handleBotMove = useCallback((currentBoard: (string | null)[]) => {
    const emptyIndices = currentBoard.map((v, i) => v === null ? i : null).filter(v => v !== null) as number[];
    if (emptyIndices.length === 0) return;
    
    // Bot takes center if available
    if (currentBoard[4] === null) {
        const newBoard = currentBoard.slice();
        newBoard[4] = 'O';
        setBoard(newBoard);
        setXIsNext(true);
        const win = calculateWinner(newBoard);
        if (win) setWinner(win);
        return;
    }

    const getRandomMove = () => emptyIndices[Math.floor(Math.random() * emptyIndices.length)];
    const move = getRandomMove();
    const newBoard = currentBoard.slice();
    newBoard[move] = 'O';
    setBoard(newBoard);
    setXIsNext(true);
    const win = calculateWinner(newBoard);
    if (win) setWinner(win);
  }, []);

  useEffect(() => {
    if (mode === 'bot' && !xIsNext && !winner) {
      const timer = setTimeout(() => handleBotMove(board), 600);
      return () => clearTimeout(timer);
    }
  }, [xIsNext, mode, winner, board, handleBotMove]);

  const resetGame = () => {
    setBoard(Array(9).fill(null));
    setXIsNext(true);
    setWinner(null);
  };

  if (mode === 'selection') {
    return (
      <div className="flex flex-col items-center justify-center p-4 space-y-4 h-full">
        <div className="text-center">
            <h3 className={`text-sm font-bold ${isDark ? "text-white" : "text-slate-900"} mb-1`}>Tic Tac Toe</h3>
            <p className="text-[9px] text-slate-400 font-bold uppercase tracking-widest">Select Mode</p>
        </div>
        <div className="grid grid-cols-2 gap-3 w-full">
          <button 
            onClick={() => setMode('pvp')}
            className={`flex flex-col items-center justify-center p-4 rounded-2xl border-2 transition-all group ${isDark ? "bg-white/5 border-white/10 hover:border-blue-500 text-white" : "bg-slate-50 border-slate-100 hover:border-blue-500 text-slate-900"}`}
          >
            <Users size={20} className="mb-2 text-slate-400 group-hover:text-blue-500 transition-colors" />
            <span className="text-[9px] font-bold uppercase tracking-widest">PVP</span>
          </button>
          <button 
            onClick={() => setMode('bot')}
            className={`flex flex-col items-center justify-center p-4 rounded-2xl border-2 transition-all group ${isDark ? "bg-white/5 border-white/10 hover:border-[#4AC4FE] text-white" : "bg-slate-50 border-slate-100 hover:border-[#4AC4FE] text-slate-900"}`}
          >
            <Bot size={20} className="mb-2 text-slate-400 group-hover:text-[#4AC4FE] transition-colors" />
            <span className="text-[9px] font-bold uppercase tracking-widest">BOT</span>
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="flex flex-col items-center justify-center h-full p-2">
      <div className="flex items-center justify-between w-full mb-3 px-1">
        <p className={`text-[9px] font-bold uppercase tracking-[0.2em] ${winner ? "text-emerald-500 animate-pulse" : "text-slate-400"}`}>
            {winner ? (winner === 'Draw' ? "Draw Game" : `${winner} Wins!`) : (xIsNext ? "X Turn" : "O Turn")}
        </p>
        <button onClick={() => { setMode('selection'); resetGame(); }} className="p-1 rounded-lg hover:bg-black/5 text-slate-400 transition-colors">
           <RotateCcw size={12} />
        </button>
      </div>

      <div className="grid grid-cols-3 gap-1.5 w-full aspect-square max-h-[140px]">
        {board.map((cell, i) => (
          <button
            key={i}
            onClick={() => handleClick(i)}
            disabled={!!cell || (mode === 'bot' && !xIsNext) || !!winner}
            className={`rounded-xl flex items-center justify-center text-lg font-black transition-all ${
                cell === 'X' ? "text-blue-500" : cell === 'O' ? "text-[#4AC4FE]" : ""
            } ${isDark ? "bg-white/5" : "bg-slate-50 shadow-sm border border-black/5"}`}
          >
            {cell}
          </button>
        ))}
      </div>
      
      {winner && (
          <button 
            onClick={resetGame}
            className={`mt-3 w-full py-2 rounded-xl text-[9px] font-bold uppercase tracking-widest transition-all ${isDark ? "bg-blue-600 text-white" : "bg-blue-600 text-white shadow-lg shadow-blue-500/10"}`}
          >
            Reset Table
          </button>
      )}
    </div>
  );
}

function WidgetContainer({ 
  id,
  children, 
  isDark, 
  onRemove, 
  onContextMenu,
  isLocked,
  onResize,
  className = "",
  style = {}
}: { 
  id: string,
  children: React.ReactNode, 
  isDark: boolean, 
  onRemove?: () => void,
  onContextMenu: (e: React.MouseEvent, id: string) => void,
  isLocked?: boolean,
  key?: React.Key,
  onResize?: (id: string) => void,
  className?: string,
  style?: React.CSSProperties
}) {
  return (
    <motion.div 
      layout
      initial={{ opacity: 0, scale: 0.95 }}
      animate={{ opacity: 1, scale: 1 }}
      onContextMenu={(e) => onContextMenu(e, id)}
      style={style}
      className={`p-5 rounded-[28px] border group transition-all relative ${
        className ? className : (isDark ? "bg-white/5 border-white/10" : "bg-white border-slate-100 shadow-sm")
      }`}
    >
      {onRemove && !isLocked && (
        <div className="absolute top-4 right-4 flex items-center gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
          {onResize && (
            <button onClick={() => onResize(id)} className="p-1.5 rounded-xl hover:bg-slate-100 text-slate-400">
              <Maximize2 size={12} />
            </button>
          )}
          <button onClick={onRemove} className="p-2 rounded-xl hover:bg-red-500/10 text-red-400 hover:text-red-500 transition-colors">
            <X size={18} className="stroke-[2.5]" />
          </button>
        </div>
      )}
      {isLocked && (
        <div className="absolute top-4 right-4 text-slate-300">
          <Lock size={12} />
        </div>
      )}
      {children}
    </motion.div>
  );
}

function WidgetsDashboard({ 
  isOpen, 
  onClose, 
  isDark,
  weather,
  getTempDisplay,
  currentTime,
  formatTime,
  formatDateString,
  activeChannel,
  setActiveChannel,
  setActiveTab,
  user,
  userData,
  featureFlags,
  setFeatureFlags,
  loadingTreatment,
  setLoadingTreatment,
  isDev,
  setIsDev,
  liquidGlass,
  setLiquidGlass,
  liquidGlassBlur = 10,
  setLiquidGlassBlur = () => {},
  liquidGlassOpacity = 25,
  setLiquidGlassOpacity = () => {},
  onOpenUserMenu,
  activeDashboardTab,
  setActiveDashboardTab,
  setIsDark,
  useSidebar,
  setUseSidebar,
  isSidebarRight,
  setIsSidebarRight,
  isSidebarLocked,
  setIsSidebarLocked,
  sidebarDisplay,
  setSidebarDisplay,
  isPinningEnabled,
  setIsPinningEnabled,
  setUserData,
  onAlert,
  handleLogin,
  handleResetOnboarding,
  favorites,
  bypassed,
  tempUnit,
  setTempUnit,
  location,
  setLocation,
  timeFormat,
  setTimeFormat,
  clockFormat,
  setClockFormat,
  dateFormat,
  setDateFormat,
  showClock,
  setShowClock,
  showDate,
  setShowDate,
  showTempInClock,
  setShowTempInClock,
  headingBar,
  setHeadingBar,
  isSearchCompact,
  setIsSearchCompact,
  handleLogout,
  customColors,
  setCustomColors,
  setShowGeoPopup,
  handleGeolocation,
  searchQuery,
  setSearchQuery,
  isCompactMode,
  setIsCompactMode,
  isTouchInterface,
  setIsTouchInterface,
  floatyBars,
  setFloatyBars,
  sidebarQuickAccess,
  setSidebarQuickAccess,
  topbarSearchType,
  setTopbarSearchType,
  locationDetection,
  setLocationDetection,
  timeZone,
  setTimeZone,
  onCloseDashboard,
  widgetsBoardPosition = "left",
  setWidgetsBoardPosition,
  hideSidebarInWidgets = false,
  setHideSidebarInWidgets,
  fullScreenWidgets = false,
  setFullScreenWidgets,
  frostedGlassWidgets = false,
  setFrostedGlassWidgets,
  colorWidgets = false,
  setColorWidgets,
  setIsReinstalling = () => {},
  setShowSplash = () => {},
  setSplashDuration = () => {}
}: {
  isOpen: boolean,
  onClose: () => void, 
  isDark: boolean,
  weather: any,
  getTempDisplay: () => string,
  currentTime: Date,
  formatTime: (d: Date) => string,
  formatDateString: (d: Date) => string,
  activeChannel: any,
  setActiveChannel: (c: any) => void,
  setActiveTab: (t: string) => void,
  user?: any,
  userData?: any,
  featureFlags?: any,
  setFeatureFlags?: (f: any) => void,
  loadingTreatment?: string,
  setLoadingTreatment?: (t: string) => void,
  isDev?: boolean,
  setIsDev?: (v: boolean) => void,
  liquidGlass?: "glassy" | "tinted",
  onOpenUserMenu?: () => void,
  setLiquidGlass: (v: "glassy" | "tinted") => void,
  liquidGlassBlur?: number,
  setLiquidGlassBlur?: (v: number) => void,
  liquidGlassOpacity?: number,
  setLiquidGlassOpacity?: (v: number) => void,
  activeDashboardTab: "widgets" | "changelogs" | "labs" | "settings",
  setActiveDashboardTab: (val: "widgets" | "changelogs" | "labs" | "settings") => void,
  // Add remaining settings props needed for RejuvenatedSettings
  setIsDark: (v: boolean) => void,
  useSidebar: boolean,
  setUseSidebar: (v: boolean) => void,
  isSidebarRight: boolean,
  setIsSidebarRight: (v: boolean) => void,
  isSidebarLocked: boolean,
  setIsSidebarLocked: (v: boolean) => void,
  sidebarDisplay: "always" | "hover" | "condensed",
  setSidebarDisplay: (v: "always" | "hover" | "condensed") => void,
  isPinningEnabled: boolean,
  setIsPinningEnabled: (v: boolean) => void,
  setUserData: (d: any) => void,
  onAlert: (t: string, m: string, tp: any) => void,
  handleLogin: (u?: any) => void,
  handleResetOnboarding: () => void,
  favorites: string[],
  bypassed: boolean,
  tempUnit: "C" | "F",
  setTempUnit: (u: "C" | "F") => void,
  location: string,
  setLocation: (l: string) => void,
  timeFormat: "12h" | "24h",
  setTimeFormat: (f: "12h" | "24h") => void,
  clockFormat: "digital" | "analog",
  setClockFormat: (f: "digital" | "analog") => void,
  dateFormat: string,
  setDateFormat: (f: string) => void,
  showClock: boolean,
  setShowClock: (v: boolean) => void,
  showDate: boolean,
  setShowDate: (v: boolean) => void,
  showTempInClock: boolean,
  setShowTempInClock: (v: boolean) => void,
  headingBar: string,
  setHeadingBar: (s: string) => void,
  isSearchCompact: boolean,
  setIsSearchCompact: (v: boolean) => void,
  handleLogout: () => void,
  customColors: any,
  setCustomColors: (c: any) => void,
  setShowGeoPopup: (v: boolean) => void,
  handleGeolocation: () => void,
  searchQuery: string,
  setSearchQuery: (s: string) => void,
  isCompactMode: boolean,
  setIsCompactMode: (v: boolean) => void,
  isTouchInterface: boolean,
  setIsTouchInterface: (v: boolean) => void,
  floatyBars: boolean,
  setFloatyBars: (v: boolean) => void,
  sidebarQuickAccess: boolean,
  setSidebarQuickAccess: (v: boolean) => void,
  topbarSearchType: "minimal" | "full" | "floating",
  setTopbarSearchType: (v: "minimal" | "full" | "floating") => void,
  locationDetection: "auto" | "manual",
  setLocationDetection: (v: "auto" | "manual") => void,
  timeZone: string,
  setTimeZone: (v: string) => void,
  onCloseDashboard: () => void,
  widgetsBoardPosition?: "left" | "right",
  setWidgetsBoardPosition?: (v: "left" | "right") => void,
  hideSidebarInWidgets?: boolean,
  setHideSidebarInWidgets?: (v: boolean) => void,
  fullScreenWidgets?: boolean,
  setFullScreenWidgets?: (v: boolean) => void,
  frostedGlassWidgets?: boolean,
  setFrostedGlassWidgets?: (v: boolean) => void,
  colorWidgets?: boolean,
  setColorWidgets?: (v: boolean) => void,
  setIsReinstalling?: (v: boolean) => void,
  setShowSplash?: (v: boolean) => void,
  setSplashDuration?: (v: number) => void
}) {
  const [pinnedWidgets, setPinnedWidgets] = useState<string[]>(() => {
    const saved = localStorage.getItem("vplay_pinned_widgets");
    return saved ? JSON.parse(saved) : ["weather", "clock", "calendar", "discover"];
  });
  const [lockedWidgets, setLockedWidgets] = useState<string[]>(() => {
    const saved = localStorage.getItem("vplay_locked_widgets");
    return saved ? JSON.parse(saved) : [];
  });
  const [isPickerOpen, setIsPickerOpen] = useState(false);
  const [isPickerLoading, setIsPickerLoading] = useState(false);
  const [isDashSidebarOpen, setIsDashSidebarOpen] = useState(false);
  const [contextMenu, setContextMenu] = useState<{ x: number, y: number, id: string } | null>(null);
  const [widgetSearchQuery, setWidgetSearchQuery] = useState("");
  const [settingsSearchQuery, setSettingsSearchQuery] = useState("");
  const [pickerSearchQuery, setPickerSearchQuery] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [widgetsIconError, setWidgetsIconError] = useState(false);
  const [updatesIconError, setUpdatesIconError] = useState(false);
  const [selectedPickerWidget, setSelectedPickerWidget] = useState<any>(null);
  const [isUserMenuOpen, setIsUserMenuOpen] = useState(false);
  const [widgetSizes, setWidgetSizes] = useState<Record<string, { w: number, h: number }>>(() => {
    const saved = localStorage.getItem("vplay_widget_sizes");
    return saved ? JSON.parse(saved) : {
      discover: { w: 2, h: 1 },
      calendar: { w: 1, h: 1 },
      clock: { w: 1, h: 1 },
      weather: { w: 1, h: 1 },
      version: { w: 1, h: 1 },
      quick_settings: { w: 1, h: 1 },
      channels: { w: 1, h: 1 }
    };
  });

  useEffect(() => {
    localStorage.setItem("vplay_widget_sizes", JSON.stringify(widgetSizes));
  }, [widgetSizes]);

  useEffect(() => {
    if (isPickerOpen) {
      setIsPickerLoading(true);
      const timer = setTimeout(() => {
        setIsPickerLoading(false);
      }, 3000);
      return () => clearTimeout(timer);
    }
  }, [isPickerOpen]);

  useEffect(() => {
    if (isOpen) {
      setIsLoading(true);
      const timer = setTimeout(() => setIsLoading(false), 800);
      return () => clearTimeout(timer);
    }
  }, [isOpen, activeDashboardTab]);

  const getWidgetColorClasses = (id: string) => {
    if (!colorWidgets) return "";
    switch (id) {
      case "weather": {
        const wTemp = weather?.temp || 25;
        if (wTemp < 15) {
          return "bg-gradient-to-br from-sky-100 via-blue-50 to-white text-sky-950 border-blue-200/50 shadow-sm";
        } else if (wTemp >= 15 && wTemp < 26) {
          return "bg-gradient-to-br from-[#4AC4FE] via-sky-400 to-blue-500 text-white border-sky-300/30 shadow-md";
        } else {
          return "bg-gradient-to-br from-red-500 via-orange-500 to-amber-500 text-white border-orange-400/20 shadow-md";
        }
      }
      case "sticky_notes": {
        const noteBg = localStorage.getItem("vplay_note_bg") || "#fef3c7";
        let isLightNote = true;
        try {
          const r = parseInt(noteBg.slice(1, 3), 16) || 0;
          const g = parseInt(noteBg.slice(3, 5), 16) || 0;
          const b = parseInt(noteBg.slice(5, 7), 16) || 0;
          const brightness = (r * 299 + g * 587 + b * 114) / 1000;
          isLightNote = brightness > 125;
        } catch {
          isLightNote = true;
        }
        return `border-black/5 shadow-md ${isLightNote ? "text-slate-950" : "text-white"}`;
      }
      case "quick_settings":
        return "bg-gradient-to-br from-slate-800 via-slate-850 to-slate-900 border-slate-700/50 text-white shadow-md";
      case "discover":
        return "bg-gradient-to-br from-emerald-400 via-teal-500 to-green-600 text-white border-emerald-400/20 shadow-md shadow-emerald-500/10";
      case "calendar":
        return "bg-gradient-to-br from-red-500 via-rose-500 to-red-650 text-white border-red-500/20 shadow-md";
      case "clock":
        return "bg-gradient-to-br from-white via-slate-50 to-slate-100 text-slate-900 border-slate-200 shadow-md shadow-black/5";
      case "tictactoe":
      case "word_link":
      case "word_scramble":
        return "bg-gradient-to-br from-fuchsia-500 via-pink-500 to-red-500 text-white border-pink-500/20 shadow-md shadow-pink-500/10";
      case "version":
        return "bg-gradient-to-br from-blue-600 via-indigo-600 to-purple-700 text-white border-indigo-500/20 shadow-md shadow-indigo-500/10";
      default:
        return "";
    }
  };

  const getWidgetColorStyles = (id: string) => {
    if (!colorWidgets) return {};
    if (id === "sticky_notes") {
      const noteBg = localStorage.getItem("vplay_note_bg") || "#fef3c7";
      return { backgroundColor: noteBg };
    }
    return {};
  };

  const allAvailableWidgets = [
    { id: "clock", name: "Đồng hồ", icon: Clock, category: "M365", description: "Hiển thị thời gian hệ thống và ngày tháng chính xác nhất." },
    { id: "weather", name: "Thời tiết", icon: Cloud, category: "M365", description: "Dự báo thời tiết tại vị trí của bạn theo thời gian thực." },
    { id: "calendar", name: "Lịch", icon: Calendar, category: "Outlook", description: "Theo dõi các sự kiện và lịch trình sắp tới của bạn." },
    { id: "discover", name: "Discover", icon: Search, category: "Entertainment", description: "Tìm kiếm các kênh truyền hình, tab, cài đặt và khám phá nội dung trên Vplay." },
    { id: "quick_settings", name: "Cài đặt nhanh", icon: Sliders, category: "Entertainment", description: "Bảng điều khiển nhanh các thiết lập âm thanh và màn hình." },
    { id: "tictactoe", name: "Cờ Caro", icon: Hash, category: "Games", description: "Chơi Cờ Caro giải trí với bạn bè hoặc với Bot thông minh." },
    { id: "version", name: "Phiên bản", icon: Info, category: "Tips", description: "Thông tin chi tiết về phiên bản Vplay Canary hiện tại." },
    { id: "sticky_notes", name: "Ghi chú nhanh", icon: StickyNote, category: "M365", description: "Ghi chép nhanh các ý tưởng với định dạng văn bản đa dạng." },
    { id: "word_link", name: "Nối từ", icon: Link, category: "Games", description: "Trò chơi nối từ vựng tiếng Anh và tiếng Việt đầy thử thách." },
    { id: "word_scramble", name: "Sắp xếp từ", icon: Shuffle, category: "Games", description: "Thử thách sắp xếp các chữ cái thành từ có nghĩa." },
    { id: "calculator", name: "Máy tính", icon: Activity, category: "M365", description: "Máy tính cầm tay cơ bản cho các phép tính nhanh." },
    { id: "scientific_calculator", name: "Máy tính khoa học", icon: Flask, category: "M365", description: "Máy tính nâng cao với các hàm lượng giác và logarith." },
    { id: "channels", name: "Kênh yêu thích", icon: Tv, category: "Entertainment", description: "Danh sách các kênh truyền hình bạn xem thường xuyên nhất." }
  ];

  const toggleResize = (id: string) => {
    setWidgetSizes(prev => {
      const current = prev[id] || { w: 1, h: 1 };
      let next = { w: 1, h: 1 };
      
      if (current.w === 1 && current.h === 1) {
        next = { w: 2, h: 1 }; // -> 2x1 tile
      } else if (current.w === 2 && current.h === 1) {
        next = { w: 2, h: 2 }; // -> 2x2 tile
      } else {
        next = { w: 1, h: 1 }; // -> 1x1 tile
      }
      
      return {
        ...prev,
        [id]: next
      };
    });
  };

  const filteredPinnedWidgets = pinnedWidgets.filter(widgetId => {
    if (!widgetSearchQuery) return true;
    const widget = allAvailableWidgets.find(w => w.id === widgetId);
    return widget?.name.toLowerCase().includes(widgetSearchQuery.toLowerCase()) || 
           widget?.category.toLowerCase().includes(widgetSearchQuery.toLowerCase());
  });

  const searchResults = useMemo(() => {
    if (!widgetSearchQuery) return { widgets: [], channels: [], tabs: [], settings: [] };
    const q = widgetSearchQuery.toLowerCase();
    
    return {
      widgets: allAvailableWidgets.filter(w => !pinnedWidgets.includes(w.id) && (w.name.toLowerCase().includes(q) || w.category.toLowerCase().includes(q))),
      channels: channels.filter(c => c.name.toLowerCase().includes(q)),
      tabs: baseTabs.filter(t => t.name.toLowerCase().includes(q)),
      settings: [
        { name: "Hồ sơ cá nhân", icon: User, tab: "Cài đặt", desc: "Quản lý thông tin tài khoản Vplay" },
        { name: "Phòng thí nghiệm", icon: Pizza, tab: "Labs", desc: "Các tính năng thử nghiệm Canary" },
        { name: "Lịch sử cập nhật", icon: Newspaper, tab: "Changelogs", desc: "Xem nhật ký thay đổi phiên bản" }
      ].filter(s => s.name.toLowerCase().includes(q))
    };
  }, [widgetSearchQuery, allAvailableWidgets, channels, pinnedWidgets]);

  useEffect(() => {
    localStorage.setItem("vplay_locked_widgets", JSON.stringify(lockedWidgets));
  }, [lockedWidgets]);

  const allWidgets = [
    { id: "clock", name: "Đồng hồ", icon: Clock },
    { id: "discover", name: "Discover", icon: Search },
    { id: "calendar", name: "Lịch", icon: Calendar },
    { id: "weather", name: "Thời tiết", icon: Cloud },
    { id: "quick_settings", name: "Quick Settings", icon: Sliders },
    { id: "tictactoe", name: "Cờ Caro", icon: Hash },
    { id: "search", name: "Tìm kiếm", icon: Search },
    { id: "version", name: "Phiên bản Vplay", icon: Info },
    { id: "sticky_notes", name: "Ghi chú", icon: StickyNote },
    { id: "word_link", name: "Nối từ", icon: Link },
    { id: "word_scramble", name: "Sắp xếp từ", icon: Shuffle },
    { id: "calculator", name: "Máy tính", icon: Activity },
    { id: "scientific_calculator", name: "Máy tính khoa học", icon: Flask },
    { id: "channels", name: "Kênh truyền hình", icon: Tv },
  ];

  const removeWidget = (id: string) => {
    if (lockedWidgets.includes(id)) return;
    setPinnedWidgets(prev => prev.filter(w => w !== id));
  };

  const addWidget = (id: string) => {
    if (!pinnedWidgets.includes(id)) {
      setPinnedWidgets(prev => [...prev, id]);
    }
  };

  const handleContextMenu = (e: React.MouseEvent, id: string) => {
    e.preventDefault();
    setContextMenu({ x: e.clientX, y: e.clientY, id });
  };

  const toggleLock = (id: string) => {
    setLockedWidgets(prev => 
      prev.includes(id) ? prev.filter(w => w !== id) : [...prev, id]
    );
    setContextMenu(null);
  };

  const moveWidget = (id: string, direction: 'up' | 'down') => {
    if (lockedWidgets.includes(id)) return;
    const index = pinnedWidgets.indexOf(id);
    if (index === -1) return;
    
    const newArr = [...pinnedWidgets];
    if (direction === 'up' && index > 0) {
      [newArr[index], newArr[index - 1]] = [newArr[index - 1], newArr[index]];
    } else if (direction === 'down' && index < newArr.length - 1) {
      [newArr[index], newArr[index + 1]] = [newArr[index + 1], newArr[index]];
    }
    setPinnedWidgets(newArr);
    setContextMenu(null);
  };

  const getGreeting = () => {
    const hour = currentTime.getHours();
    if (hour >= 5 && hour < 10) return "Chào buổi sáng!";
    if (hour >= 10 && hour < 13) return "Chào buổi trưa!";
    if (hour >= 13 && hour < 17) return "Chào buổi chiều!";
    if (hour >= 17 && hour < 23) return "Chào buổi tối!";
    return "Chào buổi đêm!";
  };

  return (
    <AnimatePresence>
      {isOpen && (
        <>
          <motion.div 
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={onClose}
            className="fixed inset-0 z-[190] bg-black/10"
          />
          <motion.div
            initial={{ opacity: 0, x: fullScreenWidgets ? 0 : (widgetsBoardPosition === "right" ? 100 : -100), y: fullScreenWidgets ? 50 : 0 }}
            animate={{ opacity: 1, x: 0, y: 0 }}
            exit={{ opacity: 0, x: fullScreenWidgets ? 0 : (widgetsBoardPosition === "right" ? 100 : -100), y: fullScreenWidgets ? 50 : 0 }}
            transition={{ type: "tween", ease: "linear", duration: 0.25 }}
            style={frostedGlassWidgets ? { color: "#ffffff" } : {}}
            className={`fixed ${
              fullScreenWidgets 
                ? "inset-0 w-full max-w-none m-0 rounded-none border-0" 
                : `${
                    widgetsBoardPosition === "right" 
                      ? "right-0 md:right-4 left-auto" 
                      : "left-0 md:left-4 right-auto"
                  } top-0 md:top-4 bottom-0 md:bottom-4 w-full max-w-sm md:max-w-3xl lg:max-w-6xl md:rounded-3xl border ${frostedGlassWidgets ? "border-white/10" : "border-[rgba(0,0,0,0.05)]"}`
            } z-[1000] shadow-2xl overflow-hidden flex flex-row ${
              frostedGlassWidgets 
                ? "bg-slate-950/40 backdrop-blur-3xl text-white frosted-glass-widgets-board" 
                : "bg-[#f3f6f9] text-slate-900"
            }`}
            onClick={() => setContextMenu(null)}
          >
             {/* Sidebar (Tablet/Desktop) */}
             {!hideSidebarInWidgets && (
               <div className={`${isDashSidebarOpen ? "translate-x-0" : "-translate-x-full"} md:translate-x-0 fixed md:relative left-0 top-0 bottom-0 z-[1001] md:z-auto w-24 ${frostedGlassWidgets ? "bg-slate-950/40" : "bg-[#f0f2f5]"} flex flex-col items-center py-6 gap-6 shrink-0 transition-transform duration-300 md:transition-none border-none`}>
                <div className="flex flex-col items-center gap-6 w-full overflow-y-auto scrollbar-hide flex-1 pb-4">
                  <button 
                    onClick={() => { setActiveDashboardTab("widgets"); setIsDashSidebarOpen(false); }}
                    className={`relative w-20 h-20 flex flex-col items-center justify-center gap-1.5 rounded-2xl transition-all duration-300 group ${
                      activeDashboardTab === "widgets"
                        ? (frostedGlassWidgets 
                            ? "bg-white/10 border border-white/10 scale-105 text-white shadow-[0_8px_32px_rgba(0,0,0,0.12)] font-normal" 
                            : "bg-white border border-slate-200/60 scale-105 text-[#4AC4FE] shadow-md font-normal")
                        : (frostedGlassWidgets 
                            ? "text-white/60 hover:text-white hover:bg-white/[0.04]" 
                            : "text-slate-400 hover:text-slate-700 hover:bg-slate-100")
                    }`}
                  >
                    {activeDashboardTab === "widgets" && (
                      <motion.div 
                        layoutId="active-indicator" 
                        className={`absolute left-0 top-1/2 -translate-y-1/2 w-[4px] h-8 ${frostedGlassWidgets ? "bg-teal-300 shadow-[0_0_12px_rgba(94,234,212,0.8)]" : "bg-[#4AC4FE]"} rounded-r-md`} 
                      />
                    )}
                    {!widgetsIconError ? (
                      <img 
                        src="https://upload.wikimedia.org/wikipedia/commons/thumb/f/fa/Microsoft_Fluent_UI_%E2%80%93_ic_fluent_apps_32_color.svg/960px-Microsoft_Fluent_UI_%E2%80%93_ic_fluent_apps_32_color.svg.png?_=20241223132923" 
                        alt="Widgets" 
                        referrerPolicy="no-referrer"
                        onError={() => setWidgetsIconError(true)}
                        className={`w-7 h-7 object-contain transition-all duration-300 ${activeDashboardTab === "widgets" ? "saturate-100 opacity-100 scale-105" : "saturate-50 opacity-75 group-hover:saturate-100 group-hover:opacity-100"}`}
                      />
                    ) : (
                      <WidgetsIcon size={28} />
                    )}
                    <span className="text-[11px] font-normal tracking-tight">Widgets</span>
                  </button>

                  <button 
                    onClick={() => { setActiveDashboardTab("changelogs"); setIsDashSidebarOpen(false); }}
                    className={`relative w-20 h-20 flex flex-col items-center justify-center gap-1.5 rounded-2xl transition-all duration-300 group ${
                      activeDashboardTab === "changelogs"
                        ? (frostedGlassWidgets 
                            ? "bg-white/10 border border-white/10 scale-105 text-white shadow-[0_8px_32px_rgba(0,0,0,0.12)] font-normal" 
                            : "bg-white border border-slate-200/60 scale-105 text-[#4AC4FE] shadow-md font-normal")
                        : (frostedGlassWidgets 
                            ? "text-white/60 hover:text-white hover:bg-white/[0.04]" 
                            : "text-slate-400 hover:text-slate-700 hover:bg-slate-100")
                    }`}
                  >
                    {activeDashboardTab === "changelogs" && (
                      <motion.div 
                        layoutId="active-indicator" 
                        className={`absolute left-0 top-1/2 -translate-y-1/2 w-[4px] h-8 ${frostedGlassWidgets ? "bg-teal-300 shadow-[0_0_12px_rgba(94,234,212,0.8)]" : "bg-[#4AC4FE]"} rounded-r-md`} 
                      />
                    )}
                    {!updatesIconError ? (
                      <img 
                        src="https://img.utdstc.com/icon/97d/a7c/97da7ca8cb404c0dfdf4ae6fef15b81a54130097a8ecf24a2ce89c2addb1ba04:200" 
                        alt="Updates" 
                        referrerPolicy="no-referrer"
                        onError={() => setUpdatesIconError(true)}
                        className={`w-7 h-7 object-contain transition-all duration-300 ${activeDashboardTab === "changelogs" ? "saturate-100 opacity-100 scale-105" : "saturate-50 opacity-75 group-hover:saturate-100 group-hover:opacity-100"}`}
                      />
                    ) : (
                      <Sparkles size={28} />
                    )}
                    <span className="text-[11px] font-normal tracking-tight">Updates</span>
                  </button>

                  <div className="mt-auto w-full flex flex-col items-center gap-6">
                    {featureFlags?.settings_in_widgets && (
                       <button 
                         onClick={() => { setActiveDashboardTab("settings"); setIsDashSidebarOpen(false); }}
                         className={`relative w-20 h-20 flex flex-col items-center justify-center gap-1.5 rounded-2xl transition-all duration-300 group ${
                           activeDashboardTab === "settings"
                             ? (frostedGlassWidgets 
                                 ? "bg-white/10 border border-white/10 scale-105 text-white shadow-[0_8px_32px_rgba(0,0,0,0.12)] font-normal" 
                                 : "bg-white border border-slate-200/60 scale-105 text-[#4AC4FE] shadow-md font-normal")
                             : (frostedGlassWidgets 
                                 ? "text-white/60 hover:text-white hover:bg-white/[0.04]" 
                                 : "text-slate-400 hover:text-slate-700 hover:bg-slate-100")
                         }`}
                       >
                         {activeDashboardTab === "settings" && (
                           <motion.div 
                             layoutId="active-indicator" 
                             className={`absolute left-0 top-1/2 -translate-y-1/2 w-[4px] h-8 ${frostedGlassWidgets ? "bg-teal-300 shadow-[0_0_12px_rgba(94,234,212,0.8)]" : "bg-[#4AC4FE]"} rounded-r-md`} 
                           />
                         )}
                         <Settings size={28} className={`transition-transform duration-300 group-hover:rotate-45 ${activeDashboardTab === "settings" ? "scale-105 text-[#4AC4FE]" : ""}`} />
                         <span className="text-[11px] font-normal tracking-tight">Settings</span>
                       </button>
                    )}

                    <button 
                      onClick={() => setIsUserMenuOpen(!isUserMenuOpen)}
                      className={`w-10 h-10 rounded-full flex items-center justify-center ${frostedGlassWidgets ? "bg-white/10 text-white" : "bg-white text-[#1e293b]"} font-black text-sm shadow-md cursor-pointer hover:scale-105 transition-all overflow-hidden border-2 civic-user-button ${isUserMenuOpen ? "border-[#4AC4FE] ring-4 ring-[#4AC4FE]/20" : (frostedGlassWidgets ? "border-white/10" : "border-slate-200/50 shadow-slate-200/30")}`}
                    >
                      {user?.photoURL ? (
                          <img src={user.photoURL} className="w-full h-full object-cover" referrerPolicy="no-referrer" alt="User" />
                      ) : (
                          <User size={20} className={frostedGlassWidgets ? "text-white" : "text-slate-600"} />
                      )}
                    </button>
                  </div>
                </div>
             </div>
             )}

             {/* Backdrop for mobile sidebar */}
             {isDashSidebarOpen && (
               <div 
                 className="fixed inset-0 z-[1000] bg-black/20 md:hidden" 
                 onClick={() => setIsDashSidebarOpen(false)}
               />
             )}

             {/* Main Area */}
             <div className={`flex-1 flex flex-col h-full overflow-hidden ${frostedGlassWidgets ? "bg-white/[0.03] backdrop-blur-3xl text-white" : "bg-white/40 backdrop-blur-md"} relative`}>
                {/* Mobile Header Toggle */}
                <div className={`md:hidden p-4 flex items-center justify-between border-b ${frostedGlassWidgets ? "border-white/10 bg-slate-950/20" : "border-black/5 bg-white/50"} shrink-0`}>
                  <button 
                    onClick={() => setIsDashSidebarOpen(true)}
                    className={`p-2 rounded-xl border ${frostedGlassWidgets ? "bg-white/10 border-white/10 text-white shadow-none" : "bg-white border-black/5 shadow-sm"}`}
                  >
                    <Menu size={20} className={frostedGlassWidgets ? "text-white" : "text-slate-600"} />
                  </button>
                  <p className={`text-xs font-bold uppercase tracking-widest ${frostedGlassWidgets ? "text-white/60" : "text-slate-400"}`}>Canary Dashboard</p>
                  <div className="w-10" />
                </div>
                {/* Mini Account Menu Overlay */}
                <AnimatePresence>
                  {isUserMenuOpen && (
                    <motion.div
                      initial={{ opacity: 0, y: 40 }}
                      animate={{ opacity: 1, y: 0 }}
                      exit={{ opacity: 0, y: 150, scale: 0.85 }}
                      transition={{ type: "spring", damping: 18, stiffness: 120 }}
                      className="absolute left-[105px] bottom-6 z-[1002] w-64 rounded-[28px] shadow-2xl border border-slate-200 bg-white/95 text-slate-900 backdrop-blur-3xl overflow-hidden"
                    >
                       <div className="p-6 pb-4 flex flex-col items-center text-center">
                          <div className="w-14 h-14 rounded-full flex items-center justify-center mb-3 bg-[#4AC4FE]/10 border border-[#4AC4FE]/30 text-[#0284c7] overflow-hidden">
                            <User size={26} />
                          </div>
                          <h3 className="text-sm font-bold text-slate-900 mb-0.5 tracking-tight">{user ? (user.displayName || "Thành viên") : "Khách"}</h3>
                          <p className="text-[10px] text-slate-400 font-medium mb-4 tracking-tight">
                            {user ? user.email : "Đăng nhập để có trải nghiệm tốt nhất"}
                          </p>
                          {!user ? (
                            <button 
                              onClick={() => { handleLogin(); setIsUserMenuOpen(false); }}
                              className="w-full py-2.5 bg-[#4AC4FE] hover:bg-[#32bcfc] text-black rounded-[18px] font-bold text-xs transition-colors shadow-none active:scale-[0.98] mb-1 border-none outline-none"
                            >
                              Đăng nhập ngay
                            </button>
                          ) : (
                            <button 
                              onClick={() => { handleLogout(); setIsUserMenuOpen(false); }}
                              className="w-full py-2.5 bg-red-500/10 hover:bg-red-500/20 text-red-500 rounded-[18px] font-bold text-[#e11d48] transition-all active:scale-[0.98] mb-1 border-none outline-none"
                            >
                              Đăng xuất
                            </button>
                          )}
                       </div>
                    </motion.div>
                  )}
                </AnimatePresence>

                {isLoading ? (
                  <div className="flex-1 flex flex-col items-center justify-center">
                    <LoadingSpinner isDark={false} className="w-16 h-16" />
                  </div>
                ) : (
                  <>
                    {activeDashboardTab === "widgets" && (
                      <div className="flex-1 flex flex-col overflow-hidden">
                        {/* Header */}
                        <div className="p-4 md:p-8 pb-2 md:pb-4 flex flex-col sm:flex-row items-center justify-between gap-3">
                          <div>
                            <h2 className={`text-xl md:text-2xl font-bold tracking-tight ${frostedGlassWidgets ? "text-white" : "text-slate-800"}`}>{getGreeting()}</h2>
                          </div>
                          <div className="flex items-center gap-3 w-full sm:w-auto justify-between sm:justify-start">
                            <button 
                              onClick={() => {
                                setIsPickerLoading(true);
                                setIsPickerOpen(true);
                                setTimeout(() => {
                                  setIsPickerLoading(false);
                                }, 3000);
                              }}
                              className="flex items-center gap-2 px-3 md:px-5 py-2 md:py-2.5 bg-[#4AC4FE] text-black rounded-xl font-normal text-xs md:text-sm shadow-none hover:scale-[1.05] active:scale-95 transition-all border-none outline-none shrink-0"
                            >
                              <Pin size={16} className="rotate-45 text-black" />
                              Pin widgets
                            </button>
                            <div className="flex items-center gap-1">
                              <button onClick={onClose} className="p-2 rounded-xl hover:bg-black/5 text-slate-400 hover:text-slate-900 transition-colors" title="Close widgets">
                                <X size={22} className="stroke-[2.5]" />
                              </button>
                            </div>
                          </div>
                        </div>

                        {/* Content Area */}
                        <div className="flex-1 overflow-y-auto px-4 md:px-8 py-2 custom-scrollbar space-y-4 md:space-y-6 relative">
                          {widgetSearchQuery ? (
                             <div className="space-y-8 pb-20">
                                {searchResults.tabs.length > 0 && (
                                   <div className="space-y-3">
                                      <h3 className="text-[10px] font-bold text-slate-400 uppercase tracking-widest px-1">Tabs & Navigation</h3>
                                      <div className="grid grid-cols-2 md:grid-cols-3 gap-3">
                                         {searchResults.tabs.map(tab => (
                                            <button 
                                              key={tab.id}
                                              onClick={() => { setActiveTab(tab.id); onClose(); }}
                                              className="flex items-center gap-3 p-3 rounded-2xl bg-white border border-slate-100 hover:border-[#4AC4FE] hover:shadow-lg transition-all text-left"
                                            >
                                               <div className="w-8 h-8 rounded-xl bg-slate-50 flex items-center justify-center text-slate-500">
                                                  <tab.icon size={18} />
                                               </div>
                                               <span className="text-xs font-bold text-slate-800">{tab.name}</span>
                                            </button>
                                         ))}
                                      </div>
                                   </div>
                                )}

                                {searchResults.widgets.length > 0 && (
                                   <div className="space-y-3">
                                      <h3 className="text-[10px] font-bold text-slate-400 uppercase tracking-widest px-1">Available Widgets</h3>
                                      <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                                         {searchResults.widgets.map(w => (
                                            <div key={w.id} className="flex items-center gap-4 p-4 rounded-2xl bg-white border border-slate-100">
                                               <div className="w-10 h-10 rounded-xl bg-[#4AC4FE]/10 flex items-center justify-center text-[#4AC4FE]">
                                                  <w.icon size={20} />
                                               </div>
                                               <div className="flex-1 min-w-0">
                                                  <p className="text-xs font-bold text-slate-800 truncate">{w.name}</p>
                                                  <p className="text-[9px] text-slate-400 uppercase tracking-widest">{w.category}</p>
                                               </div>
                                               <button onClick={() => addWidget(w.id)} className="p-2 rounded-xl bg-[#4AC4FE] text-black hover:bg-[#32bcfc] active:scale-90">
                                                  <Pin size={14} className="rotate-45 text-black" />
                                               </button>
                                            </div>
                                         ))}
                                      </div>
                                   </div>
                                )}

                                {searchResults.channels.length > 0 && (
                                   <div className="space-y-3">
                                      <h3 className="text-[10px] font-bold text-slate-400 uppercase tracking-widest px-1">CHANNELS</h3>
                                      <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                                         {searchResults.channels.map(ch => (
                                            <button 
                                              key={ch.name}
                                              onClick={() => { setActiveChannel(ch); setActiveTab("Live"); onClose(); }}
                                              className="flex items-center gap-3 p-3 rounded-2xl bg-white border border-slate-100 hover:border-[#4AC4FE] hover:shadow-lg transition-all text-left"
                                            >
                                               <img src={ch.logo} className="w-10 h-10 rounded-xl object-contain bg-slate-50 p-2" referrerPolicy="no-referrer" />
                                               <div className="flex-1 min-w-0">
                                                  <p className="text-xs font-bold text-slate-800 truncate">{ch.name}</p>
                                                  <p className="text-[9px] text-slate-400 uppercase tracking-widest">LIVE NOW</p>
                                               </div>
                                            </button>
                                         ))}
                                      </div>
                                   </div>
                                )}

                                {searchResults.settings.length > 0 && (
                                   <div className="space-y-3">
                                      <h3 className="text-[10px] font-bold text-slate-400 uppercase tracking-widest px-1">Settings & Systems</h3>
                                      <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                                         {searchResults.settings.map(s => (
                                            <button 
                                              key={s.name}
                                              onClick={() => { 
                                                if (s.tab === "Labs") setActiveDashboardTab("labs");
                                                else if (s.tab === "Changelogs") setActiveDashboardTab("changelogs");
                                                else { setActiveTab(s.tab); onClose(); }
                                              }}
                                              className="flex items-center gap-3 p-4 rounded-2xl bg-white border border-slate-100 hover:border-[#4AC4FE] hover:shadow-lg transition-all text-left"
                                            >
                                               <div className="w-10 h-10 rounded-xl bg-[#4AC4FE]/10 flex items-center justify-center text-[#4AC4FE]">
                                                  <s.icon size={20} />
                                               </div>
                                               <div>
                                                  <p className="text-xs font-bold text-slate-800">{s.name}</p>
                                                  <p className="text-[9px] text-slate-400 uppercase font-medium">{s.desc}</p>
                                               </div>
                                            </button>
                                         ))}
                                      </div>
                                   </div>
                                )}

                                {searchResults.widgets.length === 0 && searchResults.channels.length === 0 && searchResults.tabs.length === 0 && searchResults.settings.length === 0 && (
                                    <div className="flex flex-col items-center justify-center py-20 text-center">
                                        <h3 className="text-sm font-bold text-slate-600 mb-1">Không có kết quả nào cho "{widgetSearchQuery}"</h3>
                                        <p className="text-[10px] text-slate-400 uppercase tracking-widest">Thử tìm kiếm với từ khóa khác</p>
                                    </div>
                                )}
                             </div>
                          ) : (
                            <>
                              {filteredPinnedWidgets.length === 0 ? (
                                <div className="flex flex-col items-center justify-center py-20 text-center space-y-4">
                                   <div className="w-16 h-16 rounded-[24px] bg-slate-50 flex items-center justify-center text-slate-200 border border-slate-100">
                                      <LayoutGrid size={32} />
                                   </div>
                                   <div>
                                      <h3 className="text-base font-bold text-slate-900 mb-1">Chưa có tiện ích nào phù hợp</h3>
                                      <p className="text-[10px] text-slate-400 max-w-[180px] mx-auto">Thử tìm kiếm với từ khóa khác</p>
                                   </div>
                                </div>
                              ) : (
                                <div className="grid grid-cols-1 md:grid-cols-2 gap-3 md:gap-5 auto-rows-min pb-20">
                                  {filteredPinnedWidgets.map(widgetId => {
                                    if (widgetId === "search") return null;
                                    const isLocked = lockedWidgets.includes(widgetId);
                                    const size = widgetSizes[widgetId] || { w: 1, h: 1 };
                                    const colSpanClass = size.w === 2 ? "md:col-span-2 col-span-1" : "md:col-span-1 col-span-1";
                                    const rowSpanClass = size.h === 2 ? "md:row-span-2 row-span-1" : "md:row-span-1 row-span-1";
                                    
                                    return (
                                        <div key={widgetId} className={`${colSpanClass} ${rowSpanClass}`}>
                                            {(() => {
                                                if (widgetId === "discover") {
                                                     return (
                                                       <WidgetContainer 
                                                         id={widgetId} 
                                                         isDark={true}
                                                         className={colorWidgets ? getWidgetColorClasses(widgetId) : "bg-gradient-to-br from-green-400 via-emerald-500 to-teal-650 text-white border-green-500/10 shadow-md"}
                                                         style={getWidgetColorStyles(widgetId)}
                                                         onRemove={() => removeWidget(widgetId)} 
                                                         onContextMenu={handleContextMenu} 
                                                         isLocked={isLocked} 
                                                         onResize={toggleResize}
                                                       >
                                                          <div className="flex flex-col justify-between h-full min-h-[140px] text-left w-full">
                                                             <div className="flex items-start justify-between">
                                                               <div className="flex items-center gap-2.5">
                                                                 <div className="w-10 h-10 rounded-2xl bg-white/10 text-white flex items-center justify-center backdrop-blur-md">
                                                                    <Search size={20} className="stroke-[2.5]" />
                                                                 </div>
                                                                 <div>
                                                                    <p className="text-sm font-black text-white leading-none">Discover</p>
                                                                    <p className="text-[9px] font-bold text-white/70 uppercase tracking-widest mt-1">Tìm kiếm & Khám phá</p>
                                                                 </div>
                                                               </div>
                                                             </div>
                                                             
                                                             <div className="mt-4 relative group overflow-visible">
                                                                <input 
                                                                  type="text"
                                                                  value={widgetSearchQuery}
                                                                  onChange={(e) => setWidgetSearchQuery(e.target.value)}
                                                                  placeholder="Tìm tiện ích, tab, cài đặt..."
                                                                  className="w-full h-11 pl-11 pr-10 bg-white/12 hover:bg-white/16 focus:bg-white/18 text-white placeholder-white/45 text-xs font-bold rounded-full border border-white/10 outline-none shadow-[0_4px_10px_rgba(0,0,0,0.15),_inset_0_1.5px_2px_rgba(255,255,255,0.15)] cursor-pointer transform transition-all duration-300 hover:scale-[1.05] hover:-translate-y-0.5 hover:shadow-lg active:scale-[0.98] active:translate-y-0 focus:scale-[1.05] focus:-translate-y-0.5 focus:shadow-[0_8px_20px_rgba(74,196,254,0.3)] duration-300 ease-out"
                                                                />
                                                                <div className="absolute left-4 top-1/2 -translate-y-1/2 pointer-events-none">
                                                                  <SearchCustomIcon size={14} />
                                                                </div>
                                                                {widgetSearchQuery && (
                                                                  <button onClick={() => setWidgetSearchQuery("")} className="absolute right-3 top-1/2 -translate-y-1/2 p-1 rounded-full hover:bg-white/10 transition-all text-white/70 hover:text-white">
                                                                    <X size={12} className="stroke-[2.5]" />
                                                                  </button>
                                                                )}
                                                             </div>
                                                          </div>
                                                       </WidgetContainer>
                                                     );
                                                   }
                                                  if (widgetId === "calendar") {
                                                    return (
                                                      <WidgetContainer 
                                                        id={widgetId} 
                                                        isDark={colorWidgets || false} 
                                                        className={getWidgetColorClasses(widgetId)}
                                                        style={getWidgetColorStyles(widgetId)}
                                                        onRemove={() => removeWidget(widgetId)} 
                                                        onContextMenu={handleContextMenu} 
                                                        isLocked={isLocked} 
                                                        onResize={toggleResize}
                                                      >
                                                        <div className="flex items-center gap-4 py-1">
                                                          <div className={`w-12 h-12 rounded-2xl ${colorWidgets ? "bg-white text-red-650 shadow-sm" : "bg-red-500 text-white shadow-lg shadow-red-500/10"} flex flex-col items-center justify-center overflow-hidden`}>
                                                            <div className={`${colorWidgets ? "bg-red-50 w-full text-red-650" : "bg-red-600/50 w-full"} text-[8px] font-bold text-center py-0.5 uppercase`}>{new Intl.DateTimeFormat('en-US', { month: 'short' }).format(currentTime)}</div>
                                                            <div className="text-xl font-bold pb-0.5">{currentTime.getDate()}</div>
                                                          </div>
                                                          <div>
                                                            <p className={`text-sm font-bold leading-none ${colorWidgets ? "text-white" : "text-slate-900"}`}>{new Intl.DateTimeFormat('vi-VN', { weekday: 'long' }).format(currentTime)}</p>
                                                            <p className={`text-[10px] font-medium mt-1 ${colorWidgets ? "text-red-100" : "text-slate-400"}`}>Không có sự kiện</p>
                                                          </div>
                                                        </div>
                                                      </WidgetContainer>
                                                    );
                                                  }
                                                  if (widgetId === "clock") {
                                                    return (
                                                      <WidgetContainer 
                                                        id={widgetId} 
                                                        isDark={false} 
                                                        className={getWidgetColorClasses(widgetId)}
                                                        style={getWidgetColorStyles(widgetId)}
                                                        onRemove={() => removeWidget(widgetId)} 
                                                        onContextMenu={handleContextMenu} 
                                                        isLocked={isLocked} 
                                                        onResize={toggleResize}
                                                      >
                                                        {(() => {
                                                          if (size.w === 1 && size.h === 1) {
                                                            // 1x1 Compact Redefined
                                                            return (
                                                              <div className="flex flex-col justify-between h-full min-h-[140px] text-left w-full h-full">
                                                                <div className="flex items-start justify-between">
                                                                  <div className="flex items-center gap-2.5">
                                                                    <div className="w-9 h-9 rounded-2xl bg-blue-500/10 text-blue-500 flex items-center justify-center shadow-inner">
                                                                      <Clock size={18} />
                                                                    </div>
                                                                    <div>
                                                                      <p className="text-[10px] font-extrabold text-slate-800 leading-none">Đồng hồ</p>
                                                                      <p className="text-[8px] font-semibold text-slate-400 uppercase tracking-widest mt-0.5">Hệ thống</p>
                                                                    </div>
                                                                  </div>
                                                                </div>
                                                                
                                                                <div className="my-2 text-left">
                                                                  <div className="text-3xl font-black text-slate-900 tracking-tighter leading-none bg-gradient-to-r from-blue-600 to-indigo-600 bg-clip-text text-transparent">
                                                                    {formatTime(currentTime)}
                                                                  </div>
                                                                </div>
                                                                
                                                                <div className="text-[9px] font-bold text-blue-600 uppercase tracking-wider bg-blue-50/70 px-2 py-1 rounded-lg w-full text-center truncate">
                                                                  {new Intl.DateTimeFormat('vi-VN', { weekday: 'short', month: 'numeric', day: 'numeric' }).format(currentTime)}
                                                                </div>
                                                              </div>
                                                            );
                                                          } else if (size.w === 2 && size.h === 1) {
                                                            // 2x1 Horizontal Desk Clock
                                                            return (
                                                              <div className="flex items-center justify-between h-full min-h-[140px] pt-1 text-left w-full h-full">
                                                                <div className="flex flex-col justify-between h-full flex-grow">
                                                                  <div className="flex items-center gap-2.5">
                                                                    <div className="w-10 h-10 rounded-[18px] bg-indigo-50 text-indigo-600 flex items-center justify-center">
                                                                      <Calendar size={20} />
                                                                    </div>
                                                                    <div>
                                                                      <p className="text-[10px] font-extrabold text-indigo-500 uppercase tracking-widest leading-none">Ngày & Giờ</p>
                                                                      <p className="text-xs font-bold text-slate-800 mt-1">
                                                                        {new Intl.DateTimeFormat('vi-VN', { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' }).format(currentTime)}
                                                                      </p>
                                                                    </div>
                                                                  </div>
                                                                  
                                                                  <div className="mt-3 text-4xl font-extrabold text-slate-900 tracking-tighter">
                                                                    {formatTime(currentTime)}
                                                                  </div>
                                                                </div>
                                                                
                                                                <div className="w-[1px] h-16 bg-slate-100 self-center mx-4 hidden md:block" />
                                                                
                                                                <div className="hidden md:flex flex-col items-center justify-center bg-gradient-to-br from-indigo-500 to-blue-600 text-white rounded-2xl p-3 shrink-0 h-24 w-28 text-center shadow-lg shadow-indigo-500/10">
                                                                  <span className="text-[9px] font-black uppercase tracking-widest text-indigo-100/80">VNRT VPLAY</span>
                                                                  <span className="text-2xl font-black italic tracking-tighter mt-1">UTC+7</span>
                                                                  <span className="text-[8px] font-semibold text-slate-200 mt-1">CANARY BUILD</span>
                                                                </div>
                                                              </div>
                                                            );
                                                          } else {
                                                            // 2x2 Large Deluxe calendar grid and clock dashboard
                                                            const greetings = () => {
                                                              const hrs = currentTime.getHours();
                                                              if (hrs < 12) return "Chào buổi sáng!";
                                                              if (hrs < 18) return "Chào buổi chiều!";
                                                              return "Chào buổi tối!";
                                                            };
                                                            
                                                            return (
                                                              <div className="flex flex-col justify-between h-full min-h-[280px] text-left w-full h-full">
                                                                {/* Header */}
                                                                <div className="flex items-start justify-between border-b border-slate-100 pb-3">
                                                                  <div className="flex items-center gap-3">
                                                                    <div className="w-11 h-11 rounded-2xl bg-indigo-600 text-white flex items-center justify-center shadow-lg shadow-indigo-600/20">
                                                                      <Clock size={20} />
                                                                    </div>
                                                                    <div>
                                                                      <h4 className="text-sm font-black text-slate-800 leading-none">{greetings()}</h4>
                                                                      <p className="text-[10px] text-slate-400 font-semibold mt-1">{new Intl.DateTimeFormat('vi-VN', { dateStyle: 'full' }).format(currentTime)}</p>
                                                                    </div>
                                                                  </div>
                                                                  <div className="flex items-center gap-1.5 px-3 py-1 rounded-full bg-slate-50 text-[10px] font-mono font-bold text-slate-500 border border-slate-100">
                                                                    <div className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse" />
                                                                    ONLINE
                                                                  </div>
                                                                </div>

                                                                {/* Large Analog feeling Time visual */}
                                                                <div className="my-4 flex flex-col justify-center items-center text-center p-3 rounded-2xl bg-gradient-to-br from-indigo-50/40 via-sky-50/20 to-white border border-slate-100/50">
                                                                  <p className="text-[9px] font-extrabold text-indigo-600 uppercase tracking-[0.25em]">Hệ thống thời gian nguyên tử</p>
                                                                  <div className="text-4xl font-black text-slate-900 tracking-tighter bg-gradient-to-r from-blue-600 to-indigo-700 bg-clip-text text-transparent my-1">
                                                                    {formatTime(currentTime)}
                                                                  </div>
                                                                  <span className="text-[9px] text-slate-400 font-semibold">Công nghệ đồng bộ tần số VNRT - 26.7.0</span>
                                                                </div>

                                                                {/* Custom formatted calendar row showing we have full grid style calendar view */}
                                                                <div>
                                                                  <p className="text-[9px] font-extrabold uppercase tracking-widest text-slate-400 mb-2 ml-1">Lịch trình 7 ngày</p>
                                                                  <div className="grid grid-cols-7 gap-1 bg-slate-50 p-1.5 rounded-2xl border border-slate-100 text-center">
                                                                    {["Hai", "Ba", "Tư", "Năm", "Sáu", "Bảy", "CN"].map((day, ix) => {
                                                                      const offset = ix - 3; // center on Wednesday
                                                                      const relativeDate = new Date(currentTime);
                                                                      relativeDate.setDate(currentTime.getDate() + offset);
                                                                      const isMain = relativeDate.getDate() === currentTime.getDate();

                                                                      return (
                                                                        <div key={day} className={`py-2 px-1 rounded-lg flex flex-col items-center justify-center ${isMain ? "bg-gradient-to-br from-blue-500 to-indigo-600 text-white shadow-md shadow-indigo-500/10 scale-110" : "text-slate-600"}`}>
                                                                          <span className={`text-[8px] font-extrabold ${isMain ? "text-blue-100" : "opacity-45"}`}>{day}</span>
                                                                          <span className="text-xs font-black mt-0.5 leading-none">{relativeDate.getDate()}</span>
                                                                        </div>
                                                                      );
                                                                    })}
                                                                  </div>
                                                                </div>
                                                              </div>
                                                            );
                                                          }
                                                        })()}
                                                      </WidgetContainer>
                                                    );
                                                  }
                                                  if (widgetId === "version") {
                                                    return (
                                                      <WidgetContainer 
                                                        id={widgetId} 
                                                        isDark={colorWidgets || false} 
                                                        className={getWidgetColorClasses(widgetId)}
                                                        style={getWidgetColorStyles(widgetId)}
                                                        onRemove={() => removeWidget(widgetId)} 
                                                        onContextMenu={handleContextMenu} 
                                                        isLocked={isLocked} 
                                                        onResize={toggleResize}
                                                      >
                                                         <div className="flex items-start gap-4 mb-3">
                                                           <div className={`w-9 h-9 rounded-2xl bg-[#4AC4FE]/10 ${colorWidgets ? "text-white" : "text-[#4AC4FE]"} flex items-center justify-center`}>
                                                              <Info size={18} />
                                                           </div>
                                                           <div>
                                                              <p className={`text-[9px] font-bold uppercase tracking-wider ${colorWidgets ? "text-white/60" : "text-slate-400"}`}>Phiên bản</p>
                                                              <p className={`text-[10px] font-bold leading-tight ${colorWidgets ? "text-white" : "text-slate-800"}`}>Vplay Canary</p>
                                                           </div>
                                                        </div>
                                                        <div className={`w-full space-y-1.5 p-3 rounded-2xl ${colorWidgets ? "bg-white/10 text-white" : "bg-black/5"}`}>
                                                          <div className="flex justify-between items-center text-[10px]">
                                                            <span className="opacity-50">Phát triển by</span>
                                                            <span className="font-bold">VNRT</span>
                                                          </div>
                                                          <div className="flex justify-between items-center text-[10px]">
                                                            <span className="opacity-50">Branch</span>
                                                            <span className={`font-bold ${isDev ? (colorWidgets ? "text-sky-300" : "text-[#4AC4FE]") : (colorWidgets ? "text-green-300" : "text-green-600")}`}>{isDev ? "Developer" : "Production"}</span>
                                                          </div>
                                                          <div className="flex justify-between items-center text-[10px]">
                                                            <span className="opacity-50">Version</span>
                                                            <span className="font-bold text-[#4AC4FE]">26.7.0</span>
                                                          </div>
                                                          <div className="flex justify-between items-center text-[10px]">
                                                            <span className="opacity-50">Compiled</span>
                                                            <span className="font-bold">15/05/26</span>
                                                          </div>
                                                         </div>
                                                       </WidgetContainer>
                                                     );
                                                  }
                                                  if (widgetId === "weather") {
                                                    const wStatus = weather?.status || "Sunny";
                                                    const isColoredDark = colorWidgets && (weather?.temp || 25) >= 15;
                                                    // Dynamic weather translations for premium feel
                                                    const translateWeather = (st: string) => {
                                                      const s = st.toLowerCase();
                                                      if (s.includes("sky") || s.includes("clear") || s.includes("sun")) return "Trời quang, Nắng rực rỡ";
                                                      if (s.includes("cloud") || s.includes("overcast")) return "Nhiều mây, Âm u";
                                                      if (s.includes("fog") || s.includes("mist")) return "Có sương mù nhẹ";
                                                      if (s.includes("drizzle") || s.includes("rain")) return "Có mưa phùn diện rộng";
                                                      if (s.includes("shower") || s.includes("heavy")) return "Có mưa rào dữ dội";
                                                      if (s.includes("storm") || s.includes("thunder")) return "Có dông & Sấm sét";
                                                      return "Thời tiết dịu mát";
                                                    };
                                                    
                                                    return (
                                                      <WidgetContainer 
                                                        id={widgetId} 
                                                        isDark={colorWidgets ? (weather?.temp || 25) >= 15 : false} 
                                                        className={getWidgetColorClasses(widgetId)}
                                                        style={getWidgetColorStyles(widgetId)}
                                                        onRemove={() => removeWidget(widgetId)} 
                                                        onContextMenu={handleContextMenu} 
                                                        isLocked={isLocked} 
                                                        onResize={toggleResize}
                                                      >
                                                        {(() => {
                                                          if (size.w === 1 && size.h === 1) {
                                                            // 1x1 Compact Redefined
                                                            return (
                                                              <div className="flex flex-col justify-between h-full min-h-[140px] text-left w-full h-full">
                                                                <div className="flex items-start justify-between">
                                                                  <div className="flex items-center gap-2.5">
                                                                    <div className={`w-9 h-9 rounded-2xl flex items-center justify-center ${isColoredDark ? "bg-white/20 text-white" : "bg-orange-500/10 text-orange-500"}`}>
                                                                      <Cloud size={18} />
                                                                    </div>
                                                                    <div>
                                                                      <p className={`text-[10px] font-extrabold leading-none ${isColoredDark ? "text-white" : "text-slate-800"}`}>Thời tiết</p>
                                                                      <p className={`text-[8px] font-semibold uppercase tracking-widest mt-0.5 ${isColoredDark ? "text-white/60" : "text-slate-400"}`}>{location || "Hanoi"}</p>
                                                                    </div>
                                                                  </div>
                                                                </div>
                                                                
                                                                <div className="flex items-center justify-between my-2">
                                                                  <div className={`text-3xl font-extrabold tracking-tighter ${isColoredDark ? "text-white" : "text-slate-900 bg-gradient-to-r from-slate-900 to-slate-700 bg-clip-text"}`}>
                                                                    {getTempDisplay()}
                                                                  </div>
                                                                  <div className={`w-10 h-10 rounded-2xl flex items-center justify-center shadow-lg animate-bounce ${isColoredDark ? "bg-white/20 text-white shadow-white/5 border border-white/10" : "bg-amber-400 text-white shadow-amber-400/20"}`} style={{ animationDuration: "3s" }}>
                                                                    <Sun size={22} />
                                                                  </div>
                                                                </div>
                                                                
                                                                <div className={`mt-1 text-[10px] font-bold uppercase tracking-wider px-2 py-0.5 rounded-lg w-fit ${isColoredDark ? "text-amber-100 bg-white/10" : "text-orange-600 bg-orange-50"}`}>
                                                                  {translateWeather(wStatus)}
                                                                </div>
                                                              </div>
                                                            );
                                                          } else if (size.w === 2 && size.h === 1) {
                                                            // 2x1 Horizontal Redefined
                                                            return (
                                                              <div className="flex items-center justify-between h-full min-h-[140px] pt-1 text-left w-full h-full">
                                                                <div className="flex flex-col justify-between h-full pr-4 flex-1">
                                                                  <div className="flex items-center gap-3">
                                                                    <div className={`w-10 h-10 rounded-2xl flex items-center justify-center shadow-sm ${isColoredDark ? "bg-white/20 text-white" : "bg-amber-100 text-amber-600"}`}>
                                                                      <Sun size={22} className="animate-spin" style={{ animationDuration: "12s" }} />
                                                                    </div>
                                                                    <div>
                                                                      <p className={`text-[10px] font-extrabold uppercase tracking-widest leading-none ${isColoredDark ? "text-white" : "text-slate-800"}`}>Thời tiết trực tiếp</p>
                                                                      <p className={`text-xs font-bold mt-1 ${isColoredDark ? "text-white/70" : "text-slate-500"}`}>{location || "Vị trí hiện tại"}</p>
                                                                    </div>
                                                                  </div>
                                                                  <div className="mt-3">
                                                                    <div className={`text-4xl font-black leading-none tracking-tighter flex items-baseline gap-1.5 ${isColoredDark ? "text-white" : "text-slate-900"}`}>
                                                                      {getTempDisplay()}
                                                                      <span className={`text-xs font-bold ${isColoredDark ? "text-white/60" : "text-slate-400"}`}>/{tempUnit === "F" ? "32°F" : "20°C"} Min</span>
                                                                    </div>
                                                                    <p className={`text-xs font-semibold mt-1 ${isColoredDark ? "text-amber-100" : "text-amber-600"}`}>{translateWeather(wStatus)}</p>
                                                                  </div>
                                                                </div>
                                                                
                                                                {/* Divider */}
                                                                <div className="w-[1px] h-16 bg-slate-100 self-center mx-4 hidden md:block" />
                                                                
                                                                {/* Micro metrics */}
                                                                <div className="hidden md:flex flex-col gap-2 shrink-0 w-36 text-right">
                                                                  <div className="p-2 rounded-xl bg-slate-50 border border-slate-100 flex items-center gap-2 justify-end">
                                                                    <div className="text-right">
                                                                      <p className="text-[8px] font-bold text-slate-400">Độ ẩm</p>
                                                                      <p className="text-[10px] font-bold text-slate-700">74% RH</p>
                                                                    </div>
                                                                    <Droplets size={12} className="text-sky-500" />
                                                                  </div>
                                                                  <div className="p-2 rounded-xl bg-slate-50 border border-slate-100 flex items-center gap-2 justify-end">
                                                                    <div className="text-right">
                                                                      <p className="text-[8px] font-bold text-slate-400">Sức gió</p>
                                                                      <p className="text-[10px] font-bold text-slate-700">12 km/h</p>
                                                                    </div>
                                                                    <Wind size={12} className="text-teal-500" />
                                                                  </div>
                                                                </div>
                                                              </div>
                                                            );
                                                          } else {
                                                            // 2x2 Full Layout with micro-radar or forecasts
                                                            return (
                                                              <div className="flex flex-col justify-between h-full min-h-[280px] text-left w-full h-full">
                                                                {/* Top Section */}
                                                                <div className="flex items-start justify-between">
                                                                  <div className="flex items-center gap-3">
                                                                    <div className="w-12 h-12 rounded-[22px] bg-gradient-to-tr from-orange-400 to-amber-300 text-white flex items-center justify-center shadow-lg shadow-orange-500/15">
                                                                      <CloudSun size={26} />
                                                                    </div>
                                                                    <div>
                                                                      <h4 className={`text-xs font-black leading-none ${isColoredDark ? "text-white" : "text-slate-800"}`}>Dự báo toàn cảnh</h4>
                                                                      <p className={`text-xs font-semibold mt-1 flex items-center gap-1 ${isColoredDark ? "text-white/70" : "text-slate-400"}`}>
                                                                        <MapPin size={10} /> {location || "Hanoi, Viet Nam"}
                                                                      </p>
                                                                    </div>
                                                                  </div>
                                                                  <span className={`text-[9px] font-extrabold uppercase px-2.5 py-0.5 rounded-full tracking-wider ${isColoredDark ? "bg-white/20 text-white" : "bg-emerald-100 text-emerald-800"}`}>
                                                                    Mới nhất
                                                                  </span>
                                                                </div>

                                                                {/* Middle Big Temperature display */}
                                                                <div className={`grid grid-cols-2 gap-4 items-center p-4 rounded-3xl border my-4 w-full ${isColoredDark ? "bg-white/10 border-white/5 text-white" : "bg-gradient-to-br from-slate-50 to-amber-50/20 border-slate-100"}`}>
                                                                  <div className="text-left">
                                                                    <p className={`text-[9px] font-extrabold uppercase tracking-widest leading-none ${isColoredDark ? "text-white/60" : "text-slate-400"}`}>Chỉ số hiện tại</p>
                                                                    <span className={`text-4xl font-black tracking-tighter leading-none mt-1 inline-block ${isColoredDark ? "text-white" : "text-slate-900"}`}>
                                                                       {getTempDisplay()}
                                                                    </span>
                                                                    <p className={`text-xs font-bold mt-1 ${isColoredDark ? "text-amber-100" : "text-amber-600"}`}>{translateWeather(wStatus)}</p>
                                                                  </div>
                                                                  {/* Secondary Stats list */}
                                                                  <div className={`space-y-1.5 text-xs font-semibold border-l pl-4 ${isColoredDark ? "text-white/70 border-white/10" : "text-slate-500 border-slate-100"}`}>
                                                                    <p className="flex justify-between"><span>Độ ẩm:</span> <span className={`font-extrabold ${isColoredDark ? "text-white" : "text-slate-800"}`}>77%</span></p>
                                                                    <p className="flex justify-between"><span>Sức gió:</span> <span className={`font-extrabold ${isColoredDark ? "text-white" : "text-slate-800"}`}>8.5m/s</span></p>
                                                                    <p className="flex justify-between"><span>Chỉ số UV:</span> <span className={`font-extrabold ${isColoredDark ? "text-white" : "text-slate-800"}`}>Cực đại 5</span></p>
                                                                    <p className="flex justify-between"><span>Tầm nhìn:</span> <span className={`font-extrabold ${isColoredDark ? "text-white" : "text-slate-800"}`}>10 km</span></p>
                                                                  </div>
                                                                </div>

                                                                {/* Bottom 3-Day Forecast */}
                                                                <div className="w-full">
                                                                  <p className={`text-[10px] font-bold uppercase tracking-wider mb-2 ml-1 ${isColoredDark ? "text-white/70" : "text-slate-400"}`}>Dự báo 3 ngày tới</p>
                                                                  <div className="grid grid-cols-3 gap-2.5">
                                                                    {[
                                                                      { day: "Thứ Sáu", temp: "26°C", status: "Mưa rào", bg: "bg-sky-50 text-sky-600 border-sky-100/50", icon: CloudRain },
                                                                      { day: "Thứ Bảy", temp: "29°C", status: "Nhiều mây", bg: "bg-slate-50 text-slate-600 border-slate-100", icon: Cloud },
                                                                      { day: "Chúa Nhật", temp: "33°C", status: "Nắng to", bg: "bg-amber-50 text-amber-600 border-amber-100/50", icon: Sun }
                                                                    ].map((fc, index) => {
                                                                      const FcIcon = fc.icon;
                                                                      const cardClass = isColoredDark ? "bg-white/10 text-white border-white/5" : fc.bg;
                                                                      return (
                                                                        <div key={index} className={`p-2 rounded-2xl border text-center flex flex-col items-center justify-between ${cardClass}`}>
                                                                          <span className="text-[9px] font-black">{fc.day}</span>
                                                                          <FcIcon size={18} className="my-1" />
                                                                          <span className="text-xs font-black">{fc.temp}</span>
                                                                          <span className="text-[8px] font-semibold opacity-80 mt-0.5 leading-none truncate w-full">{fc.status}</span>
                                                                        </div>
                                                                      );
                                                                    })}
                                                                  </div>
                                                                </div>
                                                              </div>
                                                            );
                                                          }
                                                        })()}
                                                      </WidgetContainer>
                                                    );
                                                  }
                                                  if (widgetId === "quick_settings") {
                                                    return (
                                                      <WidgetContainer 
                                                        id={widgetId} 
                                                        isDark={colorWidgets || false} 
                                                        className={getWidgetColorClasses(widgetId)}
                                                        style={getWidgetColorStyles(widgetId)}
                                                        onRemove={() => removeWidget(widgetId)} 
                                                        onContextMenu={handleContextMenu} 
                                                        isLocked={isLocked} 
                                                        onResize={toggleResize}
                                                      >
                                                        <div className="grid grid-cols-2 gap-2.5 py-0.5">
                                                           <div className={`p-3 rounded-2xl flex items-center justify-center transition-all shadow-sm cursor-pointer border ${colorWidgets ? "bg-white/10 text-white hover:bg-white/15 border-white/5" : "bg-slate-50 text-slate-500 hover:bg-slate-100 border-slate-100"}`}>
                                                              <Volume2 size={18} />
                                                           </div>
                                                           <div className={`p-3 rounded-2xl flex items-center justify-center transition-all shadow-sm cursor-pointer border ${colorWidgets ? "bg-white/10 text-white hover:bg-white/15 border-white/5" : "bg-slate-50 text-slate-500 hover:bg-slate-100 border-slate-100"}`}>
                                                              <Maximize size={18} />
                                                           </div>
                                                           <div className={`p-3 rounded-2xl flex items-center justify-center transition-all shadow-sm cursor-pointer border ${colorWidgets ? "bg-white/10 text-white hover:bg-white/15 border-white/5" : "bg-slate-50 text-slate-500 hover:bg-slate-100 border-slate-100"}`}>
                                                              <Activity size={18} />
                                                           </div>
                                                           <div className={`p-3 rounded-2xl flex items-center justify-center transition-all shadow-sm cursor-pointer border ${colorWidgets ? "bg-white/10 text-white hover:bg-white/15 border-white/5" : "bg-slate-50 text-slate-500 hover:bg-slate-100 border-slate-100"}`}>
                                                              <Zap size={18} />
                                                           </div>
                                                        </div>
                                                      </WidgetContainer>
                                                    );
                                                  }
                                                  if (widgetId === "tictactoe") {
                                                    return (
                                                      <WidgetContainer 
                                                        id={widgetId} 
                                                        isDark={colorWidgets || false} 
                                                        className={getWidgetColorClasses(widgetId)}
                                                        style={getWidgetColorStyles(widgetId)}
                                                        onRemove={() => removeWidget(widgetId)} 
                                                        onContextMenu={handleContextMenu} 
                                                        isLocked={isLocked} 
                                                        onResize={toggleResize}
                                                      >
                                                        <TicTacToeGame isDark={colorWidgets || false} />
                                                      </WidgetContainer>
                                                    );
                                                  }
                                                  if (widgetId === "channels") {
                                                    return (
                                                      <WidgetContainer id={widgetId} isDark={false} onRemove={() => removeWidget(widgetId)} onContextMenu={handleContextMenu} isLocked={isLocked} onResize={toggleResize}>
                                                        <div className="space-y-2.5 py-0.5">
                                                          {channels.slice(0, 3).map(ch => (
                                                            <button 
                                                              key={ch.name} 
                                                              onClick={() => { setActiveChannel(ch); setActiveTab("Live"); onClose(); }}
                                                              className="w-full flex items-center gap-3 p-2.5 rounded-2xl hover:bg-slate-50 transition-all text-left border border-transparent hover:border-slate-100 shadow-sm bg-white"
                                                            >
                                                              <div className="w-8 h-8 rounded-xl bg-slate-50 p-1.5 flex items-center justify-center">
                                                                <img src={ch.logo} className="w-full h-full object-contain" referrerPolicy="no-referrer" />
                                                              </div>
                                                              <div>
                                                                <span className="text-[10px] font-bold text-slate-800 block truncate max-w-[80px]">{ch.name}</span>
                                                                <span className="text-[8px] text-slate-400 font-medium">Live</span>
                                                              </div>
                                                            </button>
                                                          ))}
                                                        </div>
                                                      </WidgetContainer>
                                                    );
                                                  }
                                                  if (widgetId === "sticky_notes") {
                                                    return (
                                                      <WidgetContainer 
                                                        id={widgetId} 
                                                        isDark={colorWidgets || false} 
                                                        className={getWidgetColorClasses(widgetId)}
                                                        style={getWidgetColorStyles(widgetId)}
                                                        onRemove={() => removeWidget(widgetId)} 
                                                        onContextMenu={handleContextMenu} 
                                                        isLocked={isLocked} 
                                                        onResize={toggleResize}
                                                      >
                                                        <StickyNotesWidget isDark={colorWidgets || false} />
                                                      </WidgetContainer>
                                                    );
                                                  }
                                                  if (widgetId === "word_link") {
                                                    return (
                                                      <WidgetContainer 
                                                        id={widgetId} 
                                                        isDark={colorWidgets || false} 
                                                        className={getWidgetColorClasses(widgetId)}
                                                        style={getWidgetColorStyles(widgetId)}
                                                        onRemove={() => removeWidget(widgetId)} 
                                                        onContextMenu={handleContextMenu} 
                                                        isLocked={isLocked} 
                                                        onResize={toggleResize}
                                                      >
                                                        <WordChainGame isDark={colorWidgets || false} />
                                                      </WidgetContainer>
                                                    );
                                                  }
                                                  if (widgetId === "word_scramble") {
                                                    return (
                                                      <WidgetContainer 
                                                        id={widgetId} 
                                                        isDark={colorWidgets || false} 
                                                        className={getWidgetColorClasses(widgetId)}
                                                        style={getWidgetColorStyles(widgetId)}
                                                        onRemove={() => removeWidget(widgetId)} 
                                                        onContextMenu={handleContextMenu} 
                                                        isLocked={isLocked} 
                                                        onResize={toggleResize}
                                                      >
                                                        <WordScrambleGame isDark={colorWidgets || false} />
                                                      </WidgetContainer>
                                                    );
                                                  }
                                                  if (widgetId === "calculator") {
                                                    return (
                                                      <WidgetContainer id={widgetId} isDark={false} onRemove={() => removeWidget(widgetId)} onContextMenu={handleContextMenu} isLocked={isLocked} onResize={toggleResize}>
                                                        <CalculatorWidget isDark={false} />
                                                      </WidgetContainer>
                                                    );
                                                  }
                                                  if (widgetId === "scientific_calculator") {
                                                    return (
                                                      <WidgetContainer id={widgetId} isDark={false} onRemove={() => removeWidget(widgetId)} onContextMenu={handleContextMenu} isLocked={isLocked} onResize={toggleResize}>
                                                        <ScientificCalculatorWidget isDark={false} />
                                                      </WidgetContainer>
                                                    );
                                                  }
                                                  return null;
                                            })()}
                                        </div>
                                    );
                                  })}
                                </div>
                              )}
                            </>
                          )}
                        </div>
                      </div>
                    )}

                    {activeDashboardTab === "changelogs" && (
                      <div className="flex-1 flex flex-col overflow-hidden">
                        <div className="p-8 pb-4 flex items-center justify-between border-b border-black/5">
                          <h2 className="text-2xl font-bold tracking-tight text-slate-800">Update Logs</h2>
                          <button onClick={onClose} className="p-2 rounded-xl hover:bg-black/5 text-slate-400 transition-colors">
                            <X size={16} />
                          </button>
                        </div>
                        <div className="flex-1 overflow-y-auto px-8 py-6 custom-scrollbar">
                          <UpdateLogsContent isDark={false} onBack={() => setActiveDashboardTab("widgets")} loadingTreatment={loadingTreatment || "shimmer"} />
                        </div>
                      </div>
                    )}

                    {activeDashboardTab === "labs" && (
                      <div className="flex-1 flex flex-col overflow-hidden">
                        <div className="p-8 pb-4 flex items-center justify-between border-b border-black/5">
                          <h2 className="text-2xl font-bold tracking-tight text-slate-800">Experimental Features</h2>
                          <button onClick={onClose} className="p-2 rounded-xl hover:bg-black/5 text-slate-400 transition-colors">
                            <X size={16} />
                          </button>
                        </div>
                        <div className="flex-1 overflow-y-auto px-8 py-6 custom-scrollbar">
                          <ExperimentalContent 
                            isDark={false} 
                            featureFlags={featureFlags} 
                            setFeatureFlags={setFeatureFlags || (() => {})} 
                            liquidGlass={liquidGlass || "glassy"} 
                            loadingTreatment={loadingTreatment || "shimmer"}
                            setLoadingTreatment={setLoadingTreatment || (() => {})}
                          />
                        </div>
                      </div>
                    )}
                    
                    {activeDashboardTab === "settings" && (
                      <div className="flex-1 flex flex-col overflow-hidden">
                        <div className={`px-8 py-6 flex items-center justify-between gap-6 border-b ${
                          frostedGlassWidgets 
                            ? "border-white/10 bg-white/[0.03] backdrop-blur-3xl text-white" 
                            : "border-black/5 bg-white/50 backdrop-blur-md"
                        }`}>
                          <h2 className={`text-2xl font-bold tracking-tight ${frostedGlassWidgets ? "text-white" : "text-slate-800"}`}>Settings</h2>
                          
                          <div className="flex-1 max-w-lg mx-4">
                            <div 
                              className={`group flex items-center gap-2.5 h-10 w-full cursor-pointer transform transition-all duration-300 hover:scale-[1.05] hover:-translate-y-0.5 active:scale-[0.98] active:translate-y-0 relative rounded-full border ${
                                frostedGlassWidgets 
                                  ? "bg-white/10 border-white/5 text-slate-100 shadow-[0_4px_12px_rgba(0,0,0,0.15),_inset_0_1.5px_2.5px_rgba(255,255,255,0.15)] focus-within:shadow-[0_8px_24px_rgba(74,196,254,0.35)]" 
                                  : "bg-black/5 border-black/5 text-slate-800 shadow-[0_4px_10px_rgba(0,0,0,0.06),_inset_0_1.5px_2px_rgba(255,255,255,0.4)] focus-within:shadow-[0_8px_20px_rgba(74,196,254,0.25)]"
                              }`}
                            >
                              <SearchCustomIcon size={22} className="ml-3.5" />
                              <input 
                                type="text" 
                                placeholder="Search settings"
                                value={settingsSearchQuery}
                                onChange={(e) => setSettingsSearchQuery(e.target.value)}
                                className={`flex-1 bg-transparent border-none outline-none text-sm font-semibold h-full ${
                                  frostedGlassWidgets 
                                    ? "placeholder:text-slate-100/30 text-slate-100" 
                                    : "placeholder:text-slate-400 text-slate-800"
                                }`}
                              />
                              {settingsSearchQuery && (
                                <button onClick={() => setSettingsSearchQuery("")} className="p-1 mr-2 hover:bg-black/10 rounded-full transition-all">
                                  <X size={14} className={frostedGlassWidgets ? "text-slate-300/60" : "text-slate-400"} />
                                </button>
                              )}
                            </div>
                          </div>

                          <div className="flex items-center gap-2">
                             <button onClick={onClose} className={`p-2 rounded-xl transition-colors ${frostedGlassWidgets ? "hover:bg-white/10 text-white/60 hover:text-white" : "hover:bg-black/5 text-slate-400"}`}>
                               <X size={20} />
                             </button>
                          </div>
                        </div>
                        <div className={`flex-1 overflow-y-auto custom-scrollbar ${frostedGlassWidgets ? "bg-transparent text-white" : "bg-[#f3f6f9]"}`}>
                           <RejuvenatedSettings
                              isDark={frostedGlassWidgets || false} 
                              isFlat={true}
                              setIsDark={setIsDark} 
                              isDev={isDev || false} 
                              setIsDev={setIsDev || (() => {})} 
                              setIsReinstalling={setIsReinstalling}
                              setShowSplash={setShowSplash}
                              setSplashDuration={setSplashDuration}
                              featureFlags={featureFlags}
                              setFeatureFlags={setFeatureFlags || (() => {})}
                              liquidGlass={liquidGlass || "glassy"} 
                              setLiquidGlass={setLiquidGlass}
                              liquidGlassBlur={liquidGlassBlur}
                              setLiquidGlassBlur={setLiquidGlassBlur}
                              liquidGlassOpacity={liquidGlassOpacity}
                              setLiquidGlassOpacity={setLiquidGlassOpacity}
                              useSidebar={useSidebar}
                              setUseSidebar={setUseSidebar}
                              searchQuery={settingsSearchQuery}
                              setSearchQuery={setSettingsSearchQuery}
                              isSidebarRight={isSidebarRight}
                              setIsSidebarRight={setIsSidebarRight}
                              isSidebarLocked={isSidebarLocked}
                              setIsSidebarLocked={setIsSidebarLocked}
                              sidebarDisplay={sidebarDisplay}
                              setSidebarDisplay={setSidebarDisplay}
                              isPinningEnabled={isPinningEnabled}
                              setIsPinningEnabled={setIsPinningEnabled}
                              user={user}
                              userData={userData}
                              setUserData={setUserData}
                              onAlert={onAlert}
                              onLogin={handleLogin}
                              onUpdateLogsClick={() => setActiveDashboardTab("changelogs")}
                              onResetOnboarding={handleResetOnboarding}
                              favorites={favorites}
                              bypassed={bypassed}
                              loadingTreatment={loadingTreatment || "shimmer"}
                              setLoadingTreatment={setLoadingTreatment || (() => {})}
                              tempUnit={tempUnit}
                              setTempUnit={setTempUnit}
                              location={location}
                              setLocation={setLocation}
                              timeFormat={timeFormat}
                              setTimeFormat={setTimeFormat}
                              clockFormat={clockFormat}
                              setClockFormat={setClockFormat}
                              dateFormat={dateFormat}
                              setDateFormat={setDateFormat}
                              showClock={showClock}
                              setShowClock={setShowClock}
                              showDate={showDate}
                              setShowDate={setShowDate}
                              showTempInClock={showTempInClock}
                              setShowTempInClock={setShowTempInClock}
                              headingBar={headingBar}
                              setHeadingBar={setHeadingBar}
                              isSearchCompact={isSearchCompact}
                              setIsSearchCompact={setIsSearchCompact}
                              onLogout={handleLogout}
                              customColors={customColors}
                              setCustomColors={setCustomColors}
                              setShowGeoPopup={setShowGeoPopup}
                              handleGeolocation={handleGeolocation}
                              externalSearchQuery={searchQuery}
                              onExternalSearchClear={() => setSearchQuery("")}
                              isCompactMode={isCompactMode}
                              setIsCompactMode={setIsCompactMode}
                              isTouchInterface={isTouchInterface}
                              setIsTouchInterface={setIsTouchInterface}
                              floatyBars={floatyBars}
                              setFloatyBars={setFloatyBars}
                              sidebarQuickAccess={sidebarQuickAccess}
                              setSidebarQuickAccess={setSidebarQuickAccess}
                              topbarSearchType={topbarSearchType}
                              setTopbarSearchType={setTopbarSearchType}
                              locationDetection={locationDetection}
                              setLocationDetection={setLocationDetection}
                              timeZone={timeZone}
                              setTimeZone={setTimeZone}
                              setActiveDashboardTab={setActiveDashboardTab}
                              widgetsBoardPosition={widgetsBoardPosition}
                              setWidgetsBoardPosition={setWidgetsBoardPosition}
                              hideSidebarInWidgets={hideSidebarInWidgets}
                              setHideSidebarInWidgets={setHideSidebarInWidgets}
                              fullScreenWidgets={fullScreenWidgets}
                              setFullScreenWidgets={setFullScreenWidgets}
                              frostedGlassWidgets={frostedGlassWidgets}
                              setFrostedGlassWidgets={setFrostedGlassWidgets}
                           />
                        </div>
                      </div>
                    )}
                  </>
                )}
             </div>

             {/* Context Menu */}
             <AnimatePresence>
                {contextMenu?.id && (
                  <div
                    className="fixed z-[1002] w-48 border rounded-2xl p-1.5 flex flex-col gap-0.5 transition-all duration-300 text-slate-900 shadow-[0_12px_32px_rgba(0,0,0,0.15)]"
                    style={{ 
                      position: "fixed",
                      left: contextMenu.x, 
                      top: contextMenu.y,
                      backgroundColor: "rgba(255, 255, 255, 0.20)",
                      backdropFilter: "blur(10px)",
                      WebkitBackdropFilter: "blur(10px)",
                      border: "1px solid rgba(255, 255, 255, 0.35)"
                    }}
                    onClick={(e) => e.stopPropagation()}
                  >
                    <button onClick={() => moveWidget(contextMenu.id!, 'up')} className="w-full px-3 py-2 flex items-center gap-3 text-sm font-medium rounded-xl transition-colors hover:bg-black/10 text-slate-700 hover:text-slate-950">
                       <ArrowUp size={16} /> Move up
                    </button>
                    <button onClick={() => moveWidget(contextMenu.id!, 'down')} className="w-full px-3 py-2 flex items-center gap-3 text-sm font-medium rounded-xl transition-colors hover:bg-black/10 text-slate-700 hover:text-slate-950">
                       <ArrowDown size={16} /> Move down
                    </button>
                    <div className="h-[1px] bg-black/10 my-1.5 mx-2" />
                    <button onClick={() => toggleLock(contextMenu.id!)} className="w-full px-3 py-2 flex items-center gap-3 text-sm font-medium rounded-xl transition-colors hover:bg-black/10 text-slate-700 hover:text-slate-950">
                       {lockedWidgets.includes(contextMenu.id!) ? <Unlock size={16} /> : <Lock size={16} />} 
                       {lockedWidgets.includes(contextMenu.id!) ? "Unlock" : "Lock"}
                    </button>
                    <button onClick={() => { removeWidget(contextMenu.id); setContextMenu(null); }} className="w-full px-3 py-2 flex items-center gap-3 text-sm font-medium text-red-600 hover:bg-red-500/10 rounded-xl transition-colors">
                       <Trash2 size={16} /> Remove
                    </button>
                  </div>
                )}
             </AnimatePresence>

              <AnimatePresence>
                {isPickerOpen && (
                  <div className="fixed inset-0 z-[1100] flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm">
                    <motion.div 
                      initial={{ opacity: 0 }} 
                      animate={{ opacity: 1 }} 
                      exit={{ opacity: 0 }} 
                      className="absolute inset-0 cursor-pointer" 
                      onClick={() => setIsPickerOpen(false)} 
                    />
                    
                    <motion.div 
                      initial={{ opacity: 0, scale: 0.95, y: 15 }}
                      animate={{ opacity: 1, scale: 1, y: 0 }}
                      exit={{ opacity: 0, scale: 0.95, y: 15 }}
                      transition={{ type: "spring", duration: 0.4 }}
                      onClick={(e) => e.stopPropagation()}
                      className="relative w-full max-w-3xl h-[560px] rounded-2xl shadow-2xl flex border border-white/10 overflow-hidden bg-[#1c1c1e] text-white z-10 text-left items-center justify-center"
                    >
                      {isPickerLoading ? (
                        <LoadingSpinner isDark={true} className="w-16 h-16" />
                      ) : (
                        <motion.div 
                          className="w-full h-full flex"
                          initial={{ opacity: 0, y: 30 }}
                          animate={{ opacity: 1, y: 0 }}
                          transition={{ duration: 0.5, ease: "easeOut" }}
                        >
                          {/* Left Sidebar Content App List */}
                          <div className="w-72 border-r border-white/5 flex flex-col shrink-0 bg-[#161617] p-4 text-slate-100 text-left">
                            {/* Title */}
                            <div className="flex items-center justify-between mb-4 px-2">
                              <span className="text-sm font-normal tracking-wide text-white/95">Pin widgets</span>
                            </div>
                            
                            {/* Search Input */}
                            <div className="relative mb-4 group cursor-pointer transform transition-all duration-300 hover:scale-[1.05] hover:-translate-y-0.5 active:scale-[0.98] active:translate-y-0">
                              <div className="absolute left-3.5 top-1/2 -translate-y-1/2 pointer-events-none z-10">
                                <SearchCustomIcon size={18} />
                              </div>
                              <input 
                                type="text" 
                                value={pickerSearchQuery}
                                onChange={(e) => setPickerSearchQuery(e.target.value)}
                                placeholder="Tìm kiếm tiện ích..." 
                                className="w-full h-8 pl-9 pr-6 bg-white/5 border border-white/10 outline-none text-xs rounded-full text-white font-semibold placeholder:text-white/35 transition-all shadow-[0_4px_10px_rgba(0,0,0,0.15),_inset_0_1px_1.5px_rgba(255,255,255,0.06)] focus-within:shadow-[0_6px_15px_rgba(0,0,0,0.22)]"
                              />
                              {pickerSearchQuery && (
                                <button onClick={() => setPickerSearchQuery("")} className="absolute right-2 top-1/2 -translate-y-1/2 text-white/40 hover:text-white">
                                  <X size={12} />
                                </button>
                              )}
                            </div>

                            {/* List of Widgets */}
                            <div className="flex-1 overflow-y-auto custom-scrollbar space-y-1.5 pr-1 text-left">
                              {allAvailableWidgets
                                .filter(w => {
                                  if (pickerSearchQuery) {
                                    return w.name.toLowerCase().includes(pickerSearchQuery.toLowerCase()) || 
                                           w.category.toLowerCase().includes(pickerSearchQuery.toLowerCase());
                                  }
                                  return true;
                                })
                                .map(widget => {
                                  const isSelected = (!selectedPickerWidget && allAvailableWidgets[0].id === widget.id) || selectedPickerWidget?.id === widget.id;
                                  const isPinned = pinnedWidgets.includes(widget.id);
                                  
                                  return (
                                    <button
                                      key={widget.id}
                                      onClick={() => setSelectedPickerWidget(widget)}
                                      className={`w-full flex items-center gap-3 px-3 py-2.5 rounded-xl text-xs font-normal transition-all text-left ${
                                        isSelected 
                                          ? "bg-white/10 text-white shadow-md border-l-[3px] border-[#4AC4FE] rounded-l-none" 
                                          : "text-white/60 hover:text-white hover:bg-white/5"
                                      }`}
                                    >
                                      <div className={`w-7 h-7 rounded-lg flex items-center justify-center shrink-0 ${
                                        isSelected ? "bg-[#4AC4FE] text-black animate-pulse" : "bg-white/5 text-white/60"
                                      }`}>
                                        <widget.icon size={14} />
                                      </div>
                                      <div className="flex-1 min-w-0">
                                        <p className="truncate leading-none mb-0.5 font-normal">{widget.name}</p>
                                        <p className="text-[9px] opacity-40 leading-none font-normal">{widget.category}</p>
                                      </div>
                                      {isPinned && <CheckCircle2 size={12} className="text-[#4AC4FE] shrink-0" />}
                                    </button>
                                  );
                                })
                              }
                            </div>
                          </div>

                          {/* Right Panel Preview */}
                          <div className="flex-1 flex flex-col justify-between p-8 bg-[#222224] relative text-left">
                            <button 
                              onClick={() => setIsPickerOpen(false)} 
                              className="absolute top-4 right-4 p-2 rounded-full hover:bg-white/5 text-white/60 hover:text-white transition-colors z-10"
                            >
                              <X size={16} />
                            </button>

                            {/* Selected Widget Preview Content */}
                            {(() => {
                              const activeWidget = selectedPickerWidget || allAvailableWidgets[0];
                              if (!activeWidget) return null;
                              const Icon = activeWidget.icon;
                              const isPinned = pinnedWidgets.includes(activeWidget.id);
                              
                              return (
                                <>
                                  <div className="flex-grow flex flex-col items-center justify-center text-center p-6 gap-6 relative">
                                    <div className="space-y-1">
                                      <h2 className="text-3xl font-bold tracking-tight text-white font-google leading-none">
                                        {activeWidget.name}
                                      </h2>
                                      <p className="text-xs text-[#4AC4FE] font-bold font-mono tracking-widest uppercase opacity-70 mt-1.5">
                                        {activeWidget.category}
                                      </p>
                                    </div>

                                    {/* Large circular preview image container */}
                                    <div className="w-44 h-44 rounded-full flex items-center justify-center relative shadow-2xl bg-gradient-to-br from-white/10 to-transparent border border-white/15 overflow-hidden group">
                                       <div className="absolute inset-0 bg-[#4AC4FE]/5 opacity-0 group-hover:opacity-100 transition-opacity duration-500 rounded-full blur-xl" />
                                       
                                       {(() => {
                                         switch (activeWidget.id) {
                                           case "clock":
                                             return (
                                               <div className="flex flex-col items-center justify-center text-white space-y-2">
                                                 <Icon size={56} className="text-[#4AC4FE]" />
                                                 <span className="text-xs font-mono font-bold tracking-widest bg-white/10 px-2.5 py-1 rounded-full">
                                                   {currentTime.toLocaleTimeString()}
                                                 </span>
                                               </div>
                                             );
                                           case "weather":
                                             return (
                                               <div className="flex flex-col items-center justify-center text-white space-y-2">
                                                 <Sun size={56} className="text-amber-400 transition-transform duration-1000 animate-spin" style={{ animationDuration: '40s' }} />
                                                 <span className="text-xs font-bold tracking-wider text-[#6dd1ff]">
                                                   {getTempDisplay() !== "Not located" ? getTempDisplay() : "28°C"}
                                                 </span>
                                               </div>
                                             );
                                           case "calculator":
                                           case "scientific_calculator":
                                             return (
                                               <div className="flex flex-col items-center justify-center text-white space-y-1">
                                                 <Icon size={48} className="text-[#4AC4FE]" />
                                                 <span className="text-[10px] font-mono font-bold opacity-60">1 + 1 = 2</span>
                                               </div>
                                             );
                                           case "tictactoe":
                                             return (
                                               <div className="grid grid-cols-3 gap-1 w-16 h-16 p-1.5 bg-slate-800/60 rounded-xl border border-white/5">
                                                 <div className="flex items-center justify-center text-[10px] text-[#4AC4FE] font-bold bg-white/5 rounded">X</div>
                                                 <div className="flex items-center justify-center text-[10px] text-red-500 font-bold bg-white/5 rounded">O</div>
                                                 <span className="flex items-center justify-center text-[10px] bg-white/5 rounded"></span>
                                                 <span className="flex items-center justify-center text-[10px] bg-white/5 rounded"></span>
                                                 <div className="flex items-center justify-center text-[10px] text-[#4AC4FE] font-bold bg-white/5 rounded">X</div>
                                                 <span className="flex items-center justify-center text-[10px] bg-white/5 rounded"></span>
                                                 <span className="flex items-center justify-center text-[10px] bg-white/5 rounded"></span>
                                                 <span className="flex items-center justify-center text-[10px] bg-white/5 rounded"></span>
                                                 <div className="flex items-center justify-center text-[10px] text-red-500 font-bold bg-white/5 rounded">O</div>
                                               </div>
                                             );
                                           default:
                                             return (
                                               <div className="relative">
                                                 <div className="absolute inset-0 bg-[#4AC4FE]/10 rounded-full blur-2xl flex items-center justify-center" />
                                                 <Icon size={64} className="text-[#6dd1ff] relative" />
                                               </div>
                                             );
                                         }
                                       })()}
                                    </div>

                                    <p className="text-xs text-slate-400 font-medium max-w-sm leading-relaxed px-4 text-center">
                                      {activeWidget.description || "Thêm tiện ích này vào bảng tin của bạn."}
                                    </p>
                                  </div>

                                  {/* Action Footer Pin Button */}
                                  <div className="p-4 border-t border-white/[0.05] flex justify-center bg-black/10 rounded-2xl">
                                    <button 
                                      onClick={() => {
                                        isPinned ? removeWidget(activeWidget.id) : addWidget(activeWidget.id);
                                      }}
                                      className={`px-12 py-3 rounded-2xl flex items-center gap-3 text-xs font-bold uppercase tracking-wider transition-all active:scale-95 shadow-none ${
                                        isPinned 
                                          ? "bg-slate-700 hover:bg-slate-600 text-white border border-white/5" 
                                          : "bg-[#4AC4FE] hover:bg-[#32bcfc] text-black font-google"
                                      }`}
                                    >
                                      {isPinned ? (
                                        <CheckCircle2 size={16} className="text-white" />
                                      ) : (
                                        <Pin size={16} className="-rotate-45 text-black" />
                                      )}
                                      {isPinned ? "Ghim rồi (Unpin)" : "Ghim vào Dashboard (Pin)"}
                                    </button>
                                  </div>
                                </>
                              );
                            })()}
                          </div>
                        </motion.div>
                      )}
                    </motion.div>
                  </div>
                )}
              </AnimatePresence>
              {/* Removed old overlay placeholder to keep AST clean */}
          </motion.div>
        </>
      )}
    </AnimatePresence>
  );
}


function GeoPopup({ isOpen, onClose, isDark, onAutoSelect, onManualSelect }: {
  isOpen: boolean;
  onClose: () => void;
  isDark: boolean;
  onAutoSelect: () => void;
  onManualSelect: (city: string) => void;
}) {
  const cities = ["Hà Nội", "Hồ Chí Minh", "Đà Nẵng", "Hải Phòng", "Cần Thơ", "Nha Trang", "Huế", "Đà Lạt", "Vũng Tàu", "Bình Dương"];
  return (
    <AnimatePresence>
      {isOpen && (
        <div className="fixed inset-0 z-[1000] flex items-center justify-center p-4">
          <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} onClick={onClose} className="absolute inset-0 bg-black/60 backdrop-blur-sm" />
          <motion.div initial={{ opacity: 0, scale: 0.9, y: 20 }} animate={{ opacity: 1, scale: 1, y: 0 }} exit={{ opacity: 0, scale: 0.9, y: 20 }} className="relative w-full max-w-md rounded-[32px]">
            <ShinyGlassWrapper isDark={isDark} roundedClass="rounded-[32px]" innerClass={`p-8 shadow-2xl relative w-full h-full flex flex-col ${isDark ? "bg-[#18181c]/92 text-white" : "bg-white/92 text-slate-800"}`}>
              <div className="flex items-center justify-between mb-8">
                <h3 className="text-2xl font-bold tracking-tight">Chọn vị trí</h3>
                <button onClick={onClose} className="p-2 rounded-xl hover:bg-black/5 transition-colors"><X size={20} /></button>
              </div>
              
              <button onClick={() => { onAutoSelect(); onClose(); }} className={`w-full flex items-center gap-4 p-5 rounded-2xl mb-8 transition-all active:scale-95 ${isDark ? "bg-[#4AC4FE]/20 text-[#4AC4FE] hover:bg-[#4AC4FE]/30" : "bg-[#4AC4FE]/10 text-[#4AC4FE] hover:bg-[#4AC4FE]/10"}`}>
                <div className={`p-3 rounded-xl ${isDark ? "bg-[#4AC4FE]/20" : "bg-[#4AC4FE] text-white"}`}>
                  <Navigation size={22} />
                </div>
                <div className="text-left leading-tight">
                  <p className="font-bold text-sm">Tự động định vị</p>
                  <p className="text-[10px] opacity-60">Xác định vị trí hiện tại của bạn</p>
                </div>
              </button>

              <div className="space-y-2 max-h-64 overflow-y-auto custom-scrollbar pr-2">
                <p className="text-[10px] font-bold uppercase tracking-widest opacity-40 mb-3 px-2">Hoặc chọn thủ công</p>
                {cities.map(city => (
                  <button key={city} onClick={() => { onManualSelect(city); onClose(); }} className={`w-full text-left px-4 py-3 rounded-xl text-sm font-bold transition-all ${isDark ? "hover:bg-white/5" : "hover:bg-slate-50"}`}>
                    {city}
                  </button>
                ))}
              </div>
            </ShinyGlassWrapper>
          </motion.div>
        </div>
      )}
    </AnimatePresence>
  );
}

function App() {
  const [maxToolbarTabs, setMaxToolbarTabs] = useState<number>(() => {
    const saved = localStorage.getItem("vplay_max_toolbar_tabs");
    return saved ? parseInt(saved, 10) : 4;
  });

  const [toastDuration, setToastDuration] = useState<number>(() => {
    const saved = localStorage.getItem("vplay_toast_duration");
    return saved ? parseInt(saved, 10) : 3000;
  });

  const [toastMode, setToastMode] = useState<"single" | "stack">(() => {
    const saved = localStorage.getItem("vplay_toast_mode");
    return saved === "stack" ? "stack" : "single";
  });

  const [showChannelNumbers, setShowChannelNumbers] = useState<boolean>(() => {
    return localStorage.getItem("vplay_show_channel_numbers") === "true";
  });

  useEffect(() => {
    localStorage.setItem("vplay_max_toolbar_tabs", maxToolbarTabs.toString());
  }, [maxToolbarTabs]);

  useEffect(() => {
    localStorage.setItem("vplay_toast_duration", toastDuration.toString());
  }, [toastDuration]);

  useEffect(() => {
    localStorage.setItem("vplay_toast_mode", toastMode);
  }, [toastMode]);

  useEffect(() => {
    localStorage.setItem("vplay_show_channel_numbers", showChannelNumbers ? "true" : "false");
  }, [showChannelNumbers]);

  const [toasts, setToasts] = useState<ToastMessage[]>([]);
  const [toastQueue, setToastQueue] = useState<ToastMessage[]>([]);
  const toastDurationRef = useRef(3000);
  const toastModeRef = useRef<"single" | "stack">("single");

  useEffect(() => {
    toastDurationRef.current = toastDuration;
  }, [toastDuration]);

  useEffect(() => {
    toastModeRef.current = toastMode;
  }, [toastMode]);

  useEffect(() => {
    const handleToast = (e: Event) => {
      const customEvent = e as CustomEvent<{ message: string; type?: "success" | "error" | "info" | "warning" }>;
      if (customEvent.detail) {
        const id = Math.random().toString(36).substring(2, 9);
        const newToast: ToastMessage = {
          id,
          message: customEvent.detail.message,
          type: customEvent.detail.type || "success"
        };
        
        if (toastModeRef.current === "stack") {
          setToasts(prev => [...prev, newToast]);
          setTimeout(() => {
            setToasts(prev => prev.filter(t => t.id !== id));
          }, toastDurationRef.current);
        } else {
          setToastQueue(prev => [...prev, newToast]);
        }
      }
    };

    window.addEventListener("vplay-toast", handleToast);
    return () => {
      window.removeEventListener("vplay-toast", handleToast);
    };
  }, []);

  useEffect(() => {
    if (toastMode === "single" && toasts.length === 0 && toastQueue.length > 0) {
      const nextToast = toastQueue[0];
      setToastQueue(prev => prev.slice(1));
      setToasts([nextToast]);
      
      const timer = setTimeout(() => {
        setToasts([]);
      }, toastDuration);
      
      return () => clearTimeout(timer);
    }
  }, [toastMode, toasts, toastQueue, toastDuration]);


  const [settingsActivePage, setSettingsActivePage] = useState<number>(1);
  const [searchFilter, setSearchFilter] = useState<"all" | "channels" | "settings" | "experiments">("all");
  const [contextMenu, setContextMenu] = useState<{ x: number, y: number, type: "search" | "unified" } | null>(null);
  const [isMobileContextMenuOpen, setIsMobileContextMenuOpen] = useState(false);
  const [isUserMenuOpen, setIsUserMenuOpen] = useState(false);

  const touchTimeoutRef = useRef<NodeJS.Timeout | null>(null);
  const globalTouchStartXRef = useRef<number | null>(null);
  const globalTouchStartYRef = useRef<number | null>(null);

  const startTouchTimer = (e: React.TouchEvent) => {
    const touch = e.touches[0];
    globalTouchStartXRef.current = touch.clientX;
    globalTouchStartYRef.current = touch.clientY;

    if (window.innerWidth < 768) {
      if (touchTimeoutRef.current) clearTimeout(touchTimeoutRef.current);
      touchTimeoutRef.current = setTimeout(() => {
        if (navigator.vibrate) {
          navigator.vibrate(50);
        }
        setIsMobileContextMenuOpen(true);
      }, 600); // 600ms hold
    }
  };

  const cancelTouchTimer = () => {
    if (touchTimeoutRef.current) {
      clearTimeout(touchTimeoutRef.current);
      touchTimeoutRef.current = null;
    }
  };

  const handleGlobalTouchEnd = (e: React.TouchEvent) => {
    cancelTouchTimer();

    if (globalTouchStartXRef.current === null || globalTouchStartYRef.current === null) return;

    const endX = e.changedTouches[0].clientX;
    const endY = e.changedTouches[0].clientY;

    const diffX = endX - globalTouchStartXRef.current;
    const diffY = endY - globalTouchStartYRef.current;

    // Swipe horizontally to open sidebar
    if (Math.abs(diffX) > Math.abs(diffY) * 1.5 && Math.abs(diffX) > 80) {
      if (diffX > 0 && globalTouchStartXRef.current < 150) {
        // Swipe from left to right -> open sidebar
        if (isMobile && !isSidebarExpanded) {
          setIsSidebarExpanded(true);
        }
      }
    }

    globalTouchStartXRef.current = null;
    globalTouchStartYRef.current = null;
  };

  const navTouchStartXRef = useRef<number | null>(null);
  const handleNavTouchStart = (e: React.TouchEvent) => {
    e.stopPropagation();
    navTouchStartXRef.current = e.touches[0].clientX;
  };
  const handleNavTouchEnd = (e: React.TouchEvent) => {
    e.stopPropagation();
    if (navTouchStartXRef.current === null) return;
    const diff = e.changedTouches[0].clientX - navTouchStartXRef.current;
    navTouchStartXRef.current = null;
    if (Math.abs(diff) > 40) {
      triggerNavBounce();
      const addPages = Math.ceil(pinnedChannels.length / maxToolbarTabs);
      const totPages = 3 + addPages;
      if (diff > 0) {
        setSlideDirection(-1);
        setNavPage((prev) => (prev - 1 + totPages) % totPages);
      } else {
        setSlideDirection(1);
        setNavPage((prev) => (prev + 1) % totPages);
      }
    }
  };

  const handleSearchContextMenu = (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    if (window.innerWidth < 768) {
      setIsMobileContextMenuOpen(true);
    } else {
      setContextMenu({ x: e.clientX, y: e.clientY, type: "search" });
    }
  };

  const handleGlobalContextMenu = (e: React.MouseEvent) => {
    e.preventDefault();
    if (window.innerWidth < 768) {
      setIsMobileContextMenuOpen(true);
    } else {
      setContextMenu({ x: e.clientX, y: e.clientY, type: "unified" });
    }
  };

  const isResizing = useRef(false);
  const [showSplash, setShowSplash] = useState(false);
  const [isVIntelligenceModalOpen, setIsVIntelligenceModalOpen] = useState(false);
  const [isReinstalling, setIsReinstalling] = useState(false);
  const [splashDuration, setSplashDuration] = useState(5000);

  const settingsClickCountRef = useRef(0);
  const lastSettingsClickTimeRef = useRef(0);
  const [showForceResetPopup, setShowForceResetPopup] = useState(false);

  const handleSettingsTabClick = () => {
    const now = Date.now();
    if (now - lastSettingsClickTimeRef.current < 1500) {
      settingsClickCountRef.current += 1;
    } else {
      settingsClickCountRef.current = 1;
    }
    lastSettingsClickTimeRef.current = now;
    if (settingsClickCountRef.current >= 5) {
      settingsClickCountRef.current = 0;
      setShowForceResetPopup(true);
    }
  };
  const [showOnboarding, setShowOnboarding] = useState(false);
  const [isWidgetsOpen, setIsWidgetsOpen] = useState(false);
  const [activeDashboardTab, setActiveDashboardTab] = useState<"widgets" | "changelogs" | "labs" | "settings">("widgets");
  const [activeTab, setActiveTab] = useState("Trang chủ");
  const [navBounce, setNavBounce] = useState(false);
  const triggerNavBounce = useCallback(() => {
    setNavBounce(true);
    setTimeout(() => setNavBounce(false), 200);
  }, []);
  const [isSettingsLoading, setIsSettingsLoading] = useState(false);
  const [homeScrollY, setHomeScrollY] = useState(0);

  useEffect(() => {
    setHomeScrollY(0);
  }, [activeTab]);

  useEffect(() => {
    if (activeTab === "Cài đặt") {
      setIsSettingsLoading(true);
      const timer = setTimeout(() => {
        setIsSettingsLoading(false);
      }, 3000);
      return () => clearTimeout(timer);
    }
  }, [activeTab]);

  const [user, setUser] = useState<FirebaseUser | null>(null);
  const [userData, setUserData] = useState<any>(null);
  const [isAuthLoading, setIsAuthLoading] = useState(true);
  const [isGuestMode, setIsGuestMode] = useState(() => {
    return localStorage.getItem("vplay_guest_mode") === "true";
  });

  const [name, setName] = useState("");
  const [avatar, setAvatar] = useState("");
  const [saving, setSaving] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    if (user) {
      setName(user.displayName || "Vplay User");
      setAvatar(user.photoURL || "");
    } else {
      setName("Khách");
      setAvatar("");
    }
  }, [user]);

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onloadend = () => {
        setAvatar(reader.result as string);
      };
      reader.readAsDataURL(file);
    }
  };

  const handleSave = async () => {
    if (!user) return;
    setSaving(true);
    try {
      const userRef = doc(db, "users", user.uid);
      const updateData = {
        displayName: name,
        photoURL: avatar,
        updatedAt: serverTimestamp()
      };
      await updateDoc(userRef, updateData);
      // Update local storage or user object if needed
      // Note: Firebase auth user object is usually updated via updateProfile
      await updateProfile(user, { displayName: name, photoURL: avatar });
    } catch (error) {
      console.error("Error saving profile:", error);
    } finally {
      setSaving(false);
    }
  };

  useEffect(() => {
    setShowSplash(true);
    localStorage.setItem("vplay_onboarding_completed", "true");
  }, []);

  const handleOnboardingComplete = (config: any) => {
    setIsDark(config.isDark);
    setUseSidebar(config.useSidebar);
    setLiquidGlass(config.liquidGlass);
    setIsSidebarRight(config.isSidebarRight);
    setIsPinningEnabled(config.isPinningEnabled);
    setFeatureFlags(config.featureFlags);
    
    localStorage.setItem("vplay_sidebar", config.useSidebar.toString());
    localStorage.setItem("vplay_sidebar_right", config.isSidebarRight.toString());
    localStorage.setItem("vplay_pinning", config.isPinningEnabled.toString());
    localStorage.setItem("vplay_feature_flags", JSON.stringify(config.featureFlags));
    localStorage.setItem("vplay_onboarding_completed", "true");
    
    setShowOnboarding(false);
    
    // Start 10s automatic splash
    setSplashDuration(10000);
    setShowSplash(true);
  };
  const [lastTab, setLastTab] = useState("Trang chủ");
  const [prevTab, setPrevTab] = useState("Trang chủ");
  const [isSearchOpen, setIsSearchOpen] = useState(false);
  const [hoveredTab, setHoveredTab] = useState<string | null>(null);
  const [hoveredTabRect, setHoveredTabRect] = useState<DOMRect | null>(null);
  const [liquidGlass, setLiquidGlass] = useState<"glassy" | "tinted">("glassy");
  const [liquidGlassBlur, setLiquidGlassBlur] = useState<number>(() => {
    const saved = localStorage.getItem("vplay_liquid_glass_blur");
    return saved ? parseInt(saved, 10) : 10;
  });
  const [liquidGlassOpacity, setLiquidGlassOpacity] = useState<number>(() => {
    const saved = localStorage.getItem("vplay_liquid_glass_opacity");
    return saved ? parseInt(saved, 10) : 25;
  });

  useEffect(() => {
    localStorage.setItem("vplay_liquid_glass_blur", liquidGlassBlur.toString());
  }, [liquidGlassBlur]);

  useEffect(() => {
    localStorage.setItem("vplay_liquid_glass_opacity", liquidGlassOpacity.toString());
  }, [liquidGlassOpacity]);
  const [useSidebar, setUseSidebar] = useState(false);
  const [isSidebarRight, setIsSidebarRight] = useState(() => {
    return localStorage.getItem("vplay_sidebar_right") === "true";
  });
  const [isSidebarLocked, setIsSidebarLocked] = useState(() => {
    const saved = localStorage.getItem("vplay_sidebar_locked");
    return saved === null ? true : saved === "true";
  });
  const [showVersionInfo, setShowVersionInfo] = useState(false);
  const [menuView, setMenuView] = useState<"main" | "profile" | "version" | "feedback">("main");
  const [sidebarDisplay, setSidebarDisplay] = useState<"float" | "attach">(() => {
    const saved = localStorage.getItem("vplay_sidebar_display");
    if (saved === "float") return "attach";
    return (saved as "float" | "attach") || "attach";
  });
  const [isBroadcastingLocked, setIsBroadcastingLocked] = useState(false);
  const [isLockModalOpen, setIsLockModalOpen] = useState(false);

  const sidebarWidthDefault = 300;
const [sidebarWidth, setSidebarWidth] = useState(() => {
    const saved = localStorage.getItem("vplay_sidebar_width");
    const baseWidth = saved ? parseInt(saved, 10) : sidebarWidthDefault;
    const savedHeading = localStorage.getItem("vplay_heading_bar");
    const isHeading = savedHeading === null ? true : savedHeading === "true";
    return isHeading && baseWidth > 180 ? 180 : baseWidth;
  });

  useEffect(() => {
    localStorage.setItem("vplay_sidebar_locked", isSidebarLocked.toString());
    if (isSidebarLocked) {
      setSidebarWidth(sidebarWidthDefault);
      localStorage.setItem("vplay_sidebar_width", sidebarWidthDefault.toString());
    }
  }, [isSidebarLocked]);

  useEffect(() => {
    localStorage.setItem("vplay_sidebar_display", sidebarDisplay);
  }, [sidebarDisplay]);

  useEffect(() => {
    localStorage.setItem("vplay_sidebar_width", sidebarWidth.toString());
  }, [sidebarWidth]);

  useEffect(() => {
    const handleMouseMove = (e: MouseEvent) => {
      if (!isResizing.current || isSidebarLocked) return;
      
      let newWidth;
      if (isSidebarRight) {
        newWidth = window.innerWidth - e.clientX;
      } else {
        newWidth = e.clientX;
      }
      
      if (newWidth >= 160 && newWidth <= 600) {
        setSidebarWidth(newWidth);
      }
    };

    const handleMouseUp = () => {
      isResizing.current = false;
      document.body.style.cursor = "default";
    };

    window.addEventListener("mousemove", handleMouseMove);
    window.addEventListener("mouseup", handleMouseUp);
    return () => {
      window.removeEventListener("mousemove", handleMouseMove);
      window.removeEventListener("mouseup", handleMouseUp);
    };
  }, [isSidebarLocked, isSidebarRight]);

  const [isPinningEnabled, setIsPinningEnabled] = useState(() => {
    return localStorage.getItem("vplay_pinning") === "true";
  });

  const [isCompactMode, setIsCompactMode] = useState(true);
  const [isTouchInterface, setIsTouchInterface] = useState(() => localStorage.getItem("vplay_touch_interface") === "true");
  const [sidebarQuickAccess, setSidebarQuickAccess] = useState(() => localStorage.getItem("vplay_sidebar_quick_access") !== "false");
  const [topbarSearchType, setTopbarSearchType] = useState<"box" | "icon">(() => (localStorage.getItem("vplay_topbar_search") as any) || "box");
  const [widgetsBoardPosition, setWidgetsBoardPosition] = useState<"left" | "right">(() => (localStorage.getItem("vplay_widgets_board_position") as any) || "left");
  const [hideSidebarInWidgets, setHideSidebarInWidgets] = useState(() => localStorage.getItem("vplay_hide_sidebar_in_widgets") === "true");
  const [fullScreenWidgets, setFullScreenWidgets] = useState(() => localStorage.getItem("vplay_fullscreen_widgets") === "true");
  const [frostedGlassWidgets, setFrostedGlassWidgets] = useState(() => localStorage.getItem("vplay_frosted_glass_widgets") === "true");
  const [colorWidgets, setColorWidgets] = useState(() => localStorage.getItem("vplay_color_widgets") === "true");
  const [locationDetection, setLocationDetection] = useState<"manual" | "auto">(() => (localStorage.getItem("vplay_location_detect") as any) || "manual");
  const [timeZone, setTimeZone] = useState(() => localStorage.getItem("vplay_timezone") || "Asia/Ho_Chi_Minh");

  useEffect(() => {
    localStorage.setItem("vplay_widgets_board_position", widgetsBoardPosition);
  }, [widgetsBoardPosition]);

  useEffect(() => {
    localStorage.setItem("vplay_hide_sidebar_in_widgets", hideSidebarInWidgets.toString());
  }, [hideSidebarInWidgets]);

  useEffect(() => {
    localStorage.setItem("vplay_fullscreen_widgets", fullScreenWidgets.toString());
  }, [fullScreenWidgets]);

  useEffect(() => {
    localStorage.setItem("vplay_frosted_glass_widgets", frostedGlassWidgets.toString());
  }, [frostedGlassWidgets]);

  useEffect(() => {
    localStorage.setItem("vplay_color_widgets", colorWidgets.toString());
  }, [colorWidgets]);

  useEffect(() => {
    localStorage.setItem("vplay_compact_mode", isCompactMode.toString());
  }, [isCompactMode]);

  useEffect(() => {
    localStorage.setItem("vplay_touch_interface", isTouchInterface.toString());
  }, [isTouchInterface]);

  useEffect(() => {
    localStorage.setItem("vplay_sidebar_quick_access", sidebarQuickAccess.toString());
  }, [sidebarQuickAccess]);

  useEffect(() => {
    localStorage.setItem("vplay_topbar_search", topbarSearchType);
  }, [topbarSearchType]);

  useEffect(() => {
    localStorage.setItem("vplay_location_detect", locationDetection);
  }, [locationDetection]);

  useEffect(() => {
    localStorage.setItem("vplay_timezone", timeZone);
  }, [timeZone]);

  const [isSidebarExpanded, setIsSidebarExpanded] = useState(window.innerWidth >= 768);
  const [isMobile, setIsMobile] = useState(window.innerWidth < 768);

  useEffect(() => {
    const handleResize = () => {
      setIsMobile(window.innerWidth < 768);
    };
    window.addEventListener("resize", handleResize);
    return () => window.removeEventListener("resize", handleResize);
  }, []);

  useEffect(() => {
    localStorage.setItem("vplay_sidebar_right", isSidebarRight.toString());
  }, [isSidebarRight]);

  useEffect(() => {
    localStorage.setItem("vplay_pinning", isPinningEnabled.toString());
  }, [isPinningEnabled]);
  const [activeChannel, setActiveChannel] = useState(channels[0]);
  const useNewDesign = true;
  const setUseNewDesign = useCallback(() => {}, []);
  const [isPlayerInView, setIsPlayerInView] = useState(true);
  const [pipExplicitlyClosed, setPipExplicitlyClosed] = useState(false);
  const [sortOrder, setSortOrder] = useState<"default" | "az" | "za">("default");
  const [slideIndex, setSlideIndex] = useState(0);
  const [direction, setDirection] = useState(0);

  const [vtvProposal, setVtvProposal] = useState<typeof channels[0] | null>(null);
  const [localProposal, setLocalProposal] = useState<typeof channels[0] | null>(null);

  const rollChannelProposals = useCallback(() => {
    const vtvCabList = channels.filter(ch => (ch.category === "VTV" || ch.category === "VTVcab") && ch.name !== "VTV6" && ch.name !== "VTV6 (coming soon)" && ch.name !== "ON FOOTBALL" && ch.status !== "maintenance");
    const localList = channels.filter(ch => ch.category === "Địa phương" && ch.status !== "maintenance");

    if (vtvCabList.length > 0) {
      setVtvProposal(vtvCabList[Math.floor(Math.random() * vtvCabList.length)]);
    }
    if (localList.length > 0) {
      setLocalProposal(localList[Math.floor(Math.random() * localList.length)]);
    }
  }, []);

  useEffect(() => {
    rollChannelProposals();
  }, [rollChannelProposals]);

  useEffect(() => {
    rollChannelProposals();
  }, [slideIndex, rollChannelProposals]);

  const vtv6Channel = useMemo(() => channels.find(c => c.name === "VTV6"), []);

  const slides = useMemo(() => [
    { 
      url: "https://images.unsplash.com/photo-1593789198777-f29bc259780e?q=80&w=1200&auto=format&fit=crop", 
      title: "Ra mắt tính năng My Package", 
      desc: "Nơi bạn có thể xem các kênh truyền hình bằng file m3u/m3u8 hoặc bằng luồng URL cực thuận tiện. Trải nghiệm ngay My Package!",
      tag: "Feature Link",
      action: () => setActiveTab("Package")
    },
    { 
      url: "https://img.cand.com.vn/resize/800x800/NewFiles/Images/2023/03/30/Giai_tri_vtv-1680172145227.jpg", 
      title: "Giải trí không giới hạn", 
      desc: "Khám phá thế giới truyền hình đặc sắc cùng hơn 200+ kênh giải trí đỉnh cao hoàn toàn miễn phí.",
      tag: "Vplay Web"
    },
    { 
      url: "https://substackcdn.com/image/fetch/$s_!6L_D!,f_auto,q_auto:good,fl_progressive:steep/https%3A%2F%2Fsubstack-post-media.s3.amazonaws.com%2Fpublic%2Fimages%2F1b529a92-54ae-477e-87f6-27674b483077_960x540.gif", 
      title: "Giao diện Liquid Glass", 
      desc: "Trải nghiệm xem truyền hình tương lai với hiệu ứng kính mờ và chuyển động mượt mà đầy mê hoặc.",
      tag: "Thiết kế"
    },
    { 
      url: "https://static.wikia.nocookie.net/ftv/images/b/b6/666.png/revision/latest/scale-to-width-down/1000?cb=20260604070054&path-prefix=vi", 
      title: "Chào đón VTV6 trở lại",
      desc: "Kênh truyền hình Thể thao chuyên biệt sắp sửa quay trở lại. Hãy sẵn sàng trải nghiệm các trận đấu kịch tính và đầy cảm xúc trực tiếp cùng Vplay!",
      tag: "VTV6",
      channel: vtv6Channel || undefined,
      glowColor: "rgba(244, 63, 94, 0.75)"
    },
    { 
      url: vtvProposal?.logo || "https://static.wikia.nocookie.net/ftv/images/1/14/Imagev1.png/revision/latest/scale-to-width-down/1000?cb=20260601082104&path-prefix=vi", 
      title: vtvProposal ? `Kênh VTV & VTVCab gợi ý cho bạn: ${vtvProposal.name}` : "Kênh VTV & VTVCab gợi ý cho bạn: VTV3 HD", 
      desc: "Thưởng thức các chương trình giải trí, phim truyền hình Việt giờ vàng, thể thao sống động và phim điện ảnh đặc sắc.",
      tag: "VTV & VTVCab",
      channel: vtvProposal || undefined,
      glowColor: "rgba(220, 38, 38, 0.55)"
    },
    { 
      url: localProposal?.logo || "https://static.wikia.nocookie.net/logos/images/3/32/THVL1_logo_ident_2025.png/revision/latest/scale-to-width-down/1000?cb=20251206083051&path-prefix=vi", 
      title: localProposal ? `Kênh địa phương gợi ý cho bạn: ${localProposal.name}` : "Kênh địa phương gợi ý cho bạn: THVL1", 
      desc: "Xem các đài truyền hình địa phương được yêu thích nhất cả nước với các bộ phim bom tấn độc quyền.",
      tag: "Địa phương",
      channel: localProposal || undefined,
      glowColor: "rgba(245, 158, 11, 0.55)"
    }
  ], [vtvProposal, localProposal, vtv6Channel]);
  const [loadingTreatment, setLoadingTreatment] = useState<string>(() => {
    return localStorage.getItem("vplay_loading_treatment") || "treatment3";
  });

  useEffect(() => {
    localStorage.setItem("vplay_loading_treatment", loadingTreatment);
  }, [loadingTreatment]);

  useEffect(() => {
    if (!isUserMenuOpen) {
      const timer = setTimeout(() => setShowVersionInfo(false), 300);
      return () => clearTimeout(timer);
    }
  }, [isUserMenuOpen]);

  const [featureFlags, setFeatureFlags] = useState<{ [key: string]: boolean }>(() => {
    const saved = localStorage.getItem("vplay_feature_flags");
    const defaults = { 
      quick_channel_switch: false,
      settings_in_widgets: false,
      widgets_dashboard: false, 
      multiview_channels: false, 
      disable_animation: false, 
      screen_recording: false,
      PiP_experimental: false,
      dynamic_island: false
    };
    if (saved) {
      try {
        const parsed = JSON.parse(saved);
        return { ...defaults, ...parsed };
      } catch (e) {
        return defaults;
      }
    }
    return defaults;
  });

  useEffect(() => {
    localStorage.setItem("vplay_feature_flags", JSON.stringify(featureFlags));
  }, [featureFlags]);

  const paginate = (newDirection: number) => {
    setDirection(newDirection);
    setSlideIndex((prev) => (prev + newDirection + slides.length) % slides.length);
  };

  useEffect(() => {
    const interval = setInterval(() => {
      paginate(1);
    }, 10000);
    return () => clearInterval(interval);
  }, []);

  useEffect(() => {
    // Splash screen now requires manual click to unblock audio
  }, []);

  useEffect(() => {
    if (activeTab !== "Cài đặt") {
      setLastTab(activeTab);
    }
    if (activeTab !== "Cài đặt" && activeTab !== "Khám phá") {
      setPrevTab(activeTab);
    }
  }, [activeTab]);
  const isDark = true;
  const setIsDark = useCallback(() => {}, []);
  const [customColors, setCustomColors] = useState(() => {
    const saved = localStorage.getItem("vplay_custom_colors");
    if (saved) {
      try {
        const parsed = JSON.parse(saved);
        if (parsed.primary === "#a855f7" || !parsed.primary) {
          parsed.primary = "#4AC4FE";
        }
        if (parsed.sidebar === "#11131c" || parsed.sidebar === "#1a0121" || parsed.sidebar === "#0a0f1d" || !parsed.sidebar) {
          parsed.sidebar = "#181818";
        }
        if (parsed.topbar === "#11131c" || parsed.topbar === "#0a0118" || parsed.topbar === "#090d16" || !parsed.topbar) {
          parsed.topbar = "#181818";
        }
        if (!parsed.background || parsed.background === "var(--color-vplay-background)" || parsed.background.includes("var(")) {
          parsed.background = "#121214";
        }
        return parsed;
      } catch (e) {}
    }
    return {
      primary: "#4AC4FE",
      sidebar: "#181818",
      background: "#121214",
      topbar: "#181818"
    };
  });

  useEffect(() => {
    localStorage.setItem("vplay_custom_colors", JSON.stringify(customColors));
    // Apply colors to root
    const root = document.documentElement;
    root.style.setProperty('--vplay-primary', customColors.primary);
    root.style.setProperty('--vplay-sidebar', customColors.sidebar);
    root.style.setProperty('--vplay-background', customColors.background);
    root.style.setProperty('--vplay-topbar', customColors.sidebar); // Sync topbar with sidebar
  }, [customColors]);

  const [showGeoPopup, setShowGeoPopup] = useState(false);
  const [currentTime, setCurrentTime] = useState(new Date());
const [headingBar, setHeadingBar] = useState(() => {
    const saved = localStorage.getItem("vplay_heading_bar");
    return saved === null ? true : saved === "true";
  });
  useEffect(() => {
    localStorage.setItem("vplay_heading_bar", headingBar ? "true" : "false");
  }, [headingBar]);
  useEffect(() => {
    const handleResize = () => {
      const isMobileSize = window.innerWidth < 768;
      const isLargeSize = window.innerWidth >= 1024;
      
      if (isMobileSize) {
        // If user explicitly chose sidebar (desktop mode) on mobile, show top bar
        if (useSidebar) {
          setHeadingBar(true);
        } else {
          setHeadingBar(false);
        }
      } else if (isLargeSize) {
        setHeadingBar(true);
      }
    };
    
    window.addEventListener('resize', handleResize);
    handleResize(); // Initial check
    return () => window.removeEventListener('resize', handleResize);
  }, [useSidebar]);
  useEffect(() => {
    const timer = setInterval(() => setCurrentTime(new Date()), 1000);
    return () => clearInterval(timer);
  }, []);

  const formatTime = (date: Date) => {
    let hours = date.getHours();
    const minutes = date.getMinutes().toString().padStart(2, '0');
    const seconds = date.getSeconds().toString().padStart(2, '0');
    const ampm = hours >= 12 ? 'PM' : 'AM';
    
    if (timeFormat === "12h") {
      hours = hours % 12;
      hours = hours ? hours : 12;
    }
    
    const hStr = hours.toString().padStart(2, '0');
    
    if (clockFormat === "hh:mm") return `${hStr}:${minutes}${timeFormat === "12h" ? " " + ampm : ""}`;
    return `${hStr}:${minutes}:${seconds}${timeFormat === "12h" ? " " + ampm : ""}`;
  };

  const formatDateString = (date: Date) => {
    const d = date.getDate().toString().padStart(2, '0');
    const m = (date.getMonth() + 1).toString().padStart(2, '0');
    const yyyy = date.getFullYear();
    const yy = yyyy.toString().slice(-2);
    
    if (dateFormat === "dd/mm/yy") return `${d}/${m}/${yy}`;
    if (dateFormat === "dd/mm") return `${d}/${m}`;
    return `${d}/${m}/${yyyy}`;
  };

  const getTempDisplay = () => {
    if ((locationDetection === "auto" && !isLocationDetected) || (!location && locationDetection === "manual")) return "Not located";
    if (!weather) return "--°";
    const t = tempUnit === "F" ? (weather.temp * 9/5) + 32 : weather.temp;
    return `${Math.round(t)}°${tempUnit}`;
  };
  const [tempUnit, setTempUnit] = useState<"C" | "F">(() => (localStorage.getItem("vplay_temp_unit") as "C" | "F") || "C");
  const [location, setLocation] = useState(() => localStorage.getItem("vplay_location") || "Hanoi");
  const [weather, setWeather] = useState<{ temp: number, status: string } | null>(null);
  const [isLocationDetected, setIsLocationDetected] = useState(false);
  const [timeFormat, setTimeFormat] = useState<"24h" | "12h">(() => (localStorage.getItem("vplay_time_format") as "24h" | "12h") || "24h");
  const [clockFormat, setClockFormat] = useState<"hh:mm:ss" | "hh:mm" | "custom">(() => (localStorage.getItem("vplay_clock_format") as any) || "hh:mm:ss");
  const [dateFormat, setDateFormat] = useState<"dd/mm/yyyy" | "dd/mm/yy" | "dd/mm" | "custom">(() => (localStorage.getItem("vplay_date_format") as any) || "dd/mm/yyyy");
  const [isSearchCompact, setIsSearchCompact] = useState(() => localStorage.getItem("vplay_search_compact") === "true");
  const [showTempInClock, setShowTempInClock] = useState(() => localStorage.getItem("vplay_show_temp") === "true");
  const [showClock, setShowClock] = useState(() => localStorage.getItem("vplay_show_clock") !== "false");
  const [showDate, setShowDate] = useState(() => localStorage.getItem("vplay_show_date") !== "false");
  const [floatyBars, setFloatyBars] = useState<boolean>(() => localStorage.getItem("vplay_floaty_bars") === "true");

  useEffect(() => {
    localStorage.setItem("vplay_floaty_bars", floatyBars.toString());
  }, [floatyBars]);

  useEffect(() => {
    localStorage.setItem("vplay_show_clock", showClock.toString());
  }, [showClock]);

  useEffect(() => {
    localStorage.setItem("vplay_show_date", showDate.toString());
  }, [showDate]);

  useEffect(() => {
    localStorage.setItem("vplay_search_compact", isSearchCompact.toString());
  }, [isSearchCompact]);

  useEffect(() => {
    localStorage.setItem("vplay_temp_unit", tempUnit);
    localStorage.setItem("vplay_location", location);
    localStorage.setItem("vplay_time_format", timeFormat);
    localStorage.setItem("vplay_clock_format", clockFormat);
    localStorage.setItem("vplay_date_format", dateFormat);
    localStorage.setItem("vplay_show_temp", showTempInClock.toString());
  }, [tempUnit, location, timeFormat, clockFormat, dateFormat, showTempInClock]);

  const updateWeather = useCallback(async () => {
    try {
      const lat = location.toLowerCase().includes("hanoi") ? 21.0285 : 10.8231;
      const lon = location.toLowerCase().includes("hanoi") ? 105.8542 : 106.6297;
      const res = await fetch(`/api/weather?lat=${lat}&lon=${lon}`);
      if (!res.ok) {
        setWeather({ temp: 25, status: "N/A" });
        return;
      }
      const data = await res.json();
      if (data.current_weather) {
        setWeather({
          temp: Math.round(data.current_weather.temperature),
          status: "Sunny"
        });
      } else {
        setWeather({ temp: 25, status: "N/A" });
      }
    } catch (e) {
      console.warn("Weather service is temporarily limited:", e);
      setWeather({ temp: 25, status: "N/A" });
    }
  }, [location]);

  useEffect(() => {
    updateWeather();
    const timer = setInterval(updateWeather, 600000); // 10 mins
    return () => clearInterval(timer);
  }, [updateWeather]);

  // Track setting changes to display "Đã thay đổi cài đặt xyz" toasts
  const isFirstSettingsMount = useRef(true);
  const prevSettingsInfo = useRef({
    liquidGlass,
    useSidebar,
    isSidebarRight,
    isSidebarLocked,
    sidebarDisplay,
    isPinningEnabled,
    tempUnit,
    timeFormat,
    clockFormat,
    dateFormat,
    showTempInClock,
    showClock,
    showDate,
    loadingTreatment
  });

  useEffect(() => {
    if (isFirstSettingsMount.current) {
      isFirstSettingsMount.current = false;
      return;
    }
    const prev = prevSettingsInfo.current;

    if (prev.liquidGlass !== liquidGlass) {
      showToast(`Đã thay đổi cài đặt Phong cách kính: ${liquidGlass === "glassy" ? "Thủy tinh" : "Pha màu"}`, "info");
      prev.liquidGlass = liquidGlass;
    }
    if (prev.useSidebar !== useSidebar) {
      showToast(`Đã thay đổi cài đặt Hiển thị Sidebar: ${useSidebar ? "Bật" : "Tắt"}`, "info");
      prev.useSidebar = useSidebar;
    }
    if (prev.isSidebarRight !== isSidebarRight) {
      showToast(`Đã thay đổi cài đặt Vị trí Sidebar: ${isSidebarRight ? "Thanh bên phải" : "Thanh bên trái"}`, "info");
      prev.isSidebarRight = isSidebarRight;
    }
    if (prev.isSidebarLocked !== isSidebarLocked) {
      showToast(`Đã thay đổi cài đặt Khóa Sidebar: ${isSidebarLocked ? "Khóa cố định" : "Tự động ẩn"}`, "info");
      prev.isSidebarLocked = isSidebarLocked;
    }
    if (prev.sidebarDisplay !== sidebarDisplay) {
      showToast(`Đã thay đổi cài đặt Chế độ hiển thị Sidebar: ${sidebarDisplay === "float" ? "Nổi" : "Chắp cạnh"}`, "info");
      prev.sidebarDisplay = sidebarDisplay;
    }
    if (prev.isPinningEnabled !== isPinningEnabled) {
      showToast(`Đã thay đổi cài đặt Cho phép ghim widget: ${isPinningEnabled ? "Bật" : "Tắt"}`, "info");
      prev.isPinningEnabled = isPinningEnabled;
    }
    if (prev.tempUnit !== tempUnit) {
      showToast(`Đã thay đổi cài đặt Đơn vị nhiệt độ: °${tempUnit}`, "info");
      prev.tempUnit = tempUnit;
    }
    if (prev.timeFormat !== timeFormat) {
      showToast(`Đã thay đổi cài đặt Định dạng giờ: ${timeFormat}`, "info");
      prev.timeFormat = timeFormat;
    }
    if (prev.clockFormat !== clockFormat) {
      showToast(`Đã thay đổi cài đặt Kiểu hiển thị giờ: ${clockFormat}`, "info");
      prev.clockFormat = clockFormat;
    }
    if (prev.dateFormat !== dateFormat) {
      showToast(`Đã thay đổi cài đặt Định dạng ngày tháng: ${dateFormat}`, "info");
      prev.dateFormat = dateFormat;
    }
    if (prev.showTempInClock !== showTempInClock) {
      showToast(`Đã thay đổi cài đặt Hiển thị nhiệt độ: ${showTempInClock ? "Hiện" : "Ẩn"}`, "info");
      prev.showTempInClock = showTempInClock;
    }
    if (prev.showClock !== showClock) {
      showToast(`Đã thay đổi cài đặt Hiển thị đồng hồ: ${showClock ? "Hiện" : "Ẩn"}`, "info");
      prev.showClock = showClock;
    }
    if (prev.showDate !== showDate) {
      showToast(`Đã thay đổi cài đặt Hiển thị ngày tháng: ${showDate ? "Hiện" : "Ẩn"}`, "info");
      prev.showDate = showDate;
    }
    if (prev.loadingTreatment !== loadingTreatment) {
      showToast(`Đã thay đổi cài đặt Kiểu tải trang: ${loadingTreatment}`, "info");
      prev.loadingTreatment = loadingTreatment;
    }
  }, [
    liquidGlass, useSidebar, isSidebarRight, isSidebarLocked, sidebarDisplay,
    isPinningEnabled, tempUnit, timeFormat, clockFormat, dateFormat,
    showTempInClock, showClock, showDate, loadingTreatment
  ]);

  const [searchQuery, setSearchQuery] = useState("");
  const [searchFilterOption, setSearchFilterOption] = useState<"Tất cả kênh" | "Kênh của Vplay" | "Package của bạn">("Tất cả kênh");
  const [showModalFilterDropdown, setShowModalFilterDropdown] = useState(false);

  const allCustomChannels = useMemo(() => {
    const saved = localStorage.getItem("vplay_custom_playlists_v2");
    if (saved) {
      try {
        const parsed = JSON.parse(saved);
        if (Array.isArray(parsed)) {
          return parsed.flatMap(pl => pl.channels || []);
        }
      } catch (e) {
        console.error(e);
      }
    }
    return [];
  }, [searchQuery, activeTab]);
  const [isSearchFocused, setIsSearchFocused] = useState(false);
  const [isSearchLoading, setIsSearchLoading] = useState(false);
  const [searchResults, setSearchResults] = useState<any[]>([]);
  const [isListening, setIsListening] = useState(false);
  const [isListeningFailed, setIsListeningFailed] = useState(false);

  const handleStartListening = () => {
    const SpeechRecognition = (window as any).SpeechRecognition || (window as any).webkitSpeechRecognition;
    if (SpeechRecognition) {
      const recognition = new SpeechRecognition();
      recognition.lang = "vi-VN";
      setIsListeningFailed(false);
      recognition.onstart = () => {
        setIsListening(true);
        setIsListeningFailed(false);
      };
      recognition.onresult = (event: any) => {
        const transcript = event.results[0][0].transcript;
        setSearchQuery(transcript);
        setActiveTab("Khám phá");
      };
      recognition.onerror = () => {
        setIsListeningFailed(true);
      };
      recognition.onend = () => setIsListening(false);
      recognition.start();
    } else {
      onAlert("Lỗi", "Trình duyệt không hỗ trợ nhận diện giọng nói");
    }
  };

  const [isNavVisible, setIsNavVisible] = useState(true);
  const [isTopBarVisible, setIsTopBarVisible] = useState(true);
  const lastScrollY = useRef(0);

  useEffect(() => {
    let lastScrollTop = 0;
    const handleCaptureScroll = (e: any) => {
      if (activeTab !== "Live" && activeTab !== "Package") return;
      const target = e.target;
      if (!target || typeof target.scrollTop === "undefined") return;
      const scrollTop = target.scrollTop;
      
      if (scrollTop > lastScrollTop && scrollTop > 50) {
        setIsNavVisible(false);
      } else if (scrollTop < lastScrollTop) {
        setIsNavVisible(true);
      }
      lastScrollTop = scrollTop;
    };

    window.addEventListener("scroll", handleCaptureScroll, true);
    return () => {
      window.removeEventListener("scroll", handleCaptureScroll, true);
    };
  }, [activeTab]);

  const [navPage, setNavPage] = useState<number>(() => {
    return Number(localStorage.getItem("vplay_nav_page")) || 0;
  });
  const [slideDirection, setSlideDirection] = useState(1); // 1 = right, -1 = left
  const navTimerRef = useRef<NodeJS.Timeout | null>(null);

  const resetNavTimer = useCallback(() => {
    if (navTimerRef.current) clearTimeout(navTimerRef.current);
    // Auto-reset timer disabled to avoid disappearing items
    /*
    navTimerRef.current = setTimeout(() => {
      setNavPage(2);
    }, 10000);
    */
  }, []);

  useEffect(() => {
    localStorage.setItem("vplay_nav_page", navPage.toString());
    if (navPage !== 2) {
      resetNavTimer();
    }
  }, [navPage, resetNavTimer, activeTab]);

  useEffect(() => {
    const handleGlobalClick = () => {
      if (navPage !== 2) resetNavTimer();
    };
    window.addEventListener("mousedown", handleGlobalClick);
    window.addEventListener("touchstart", handleGlobalClick);
    return () => {
      window.removeEventListener("mousedown", handleGlobalClick);
      window.removeEventListener("touchstart", handleGlobalClick);
      if (navTimerRef.current) clearTimeout(navTimerRef.current);
    };
  }, [navPage, resetNavTimer]);

  const settingsOptions = useMemo(() => [
    { id: "SystemInfo", name: "Phiên bản hệ thống", category: "Thông tin" },
    { id: "Profile", name: "Chỉnh sửa hồ sơ", category: "Cá nhân" },
    { id: "Appearance", name: "Chủ đề giao diện", category: "Giao diện" },
    { id: "Appearance", name: "Tùy chỉnh màu chủ đạo", category: "Giao diện" },
    { id: "Appearance", name: "Cài đặt Sidebar", category: "Giao diện" },
    { id: "TopBar", name: "Đồng hồ và Lịch", category: "Thanh tiêu đề" },
    { id: "TopBar", name: "Thời tiết", category: "Thanh tiêu đề" },
    { id: "Experiments", name: "Widgets Dashboard", category: "Tính năng thử nghiệm" },
    { id: "Experiments", name: "Multiview", category: "Tính năng thử nghiệm" },
    { id: "Experiments", name: "Screen Recording", category: "Tính năng thử nghiệm" },
    { id: "Experiments", name: "Picture in Picture", category: "Tính năng thử nghiệm" },
  ], []);

  useEffect(() => {
    if (searchQuery.trim().length > 0) {
      setIsSearchLoading(true);
      const timer = setTimeout(() => {
        const query = searchQuery.toLowerCase().trim();
        const filtered = channels.filter(ch => 
          ch.name.toLowerCase().includes(query) || 
          ch.category?.toLowerCase().includes(query)
        );
        setSearchResults(filtered);
        setIsSearchLoading(false);
      }, 150);
      return () => clearTimeout(timer);
    } else {
      setSearchResults([]);
      setIsSearchLoading(false);
    }
  }, [searchQuery, channels]);

  const [showDevSettings, setShowDevSettings] = useState(false);
  const [showDevPrompt, setShowDevPrompt] = useState(false);
  const [devPass, setDevPass] = useState("");
  const [devError, setDevError] = useState(false);

  useEffect(() => {
    if (searchQuery.toLowerCase() === "/force launch loading") {
      setShowSplash(true);
      setSearchQuery("");
      setIsSearchOpen(false);
    }
    if (searchQuery.toLowerCase() === "/force launch oobe") {
      setShowOnboarding(true);
      setSearchQuery("");
      setIsSearchOpen(false);
    }
    if (searchQuery.toLowerCase() === "devmode") {
      setShowDevSettings(true);
      setSearchQuery("");
      setIsSearchOpen(false);
    }
    if (searchQuery.toLowerCase() === "/bypass") {
      setBypassed(true);
      setSearchQuery("");
      setIsSearchOpen(false);
      setCustomAlert({ title: "Bypass Active", message: "Bạn đã kích hoạt chế độ Bypass. Truy cập mọi tính năng không cần đăng nhập." });
    }
  }, [searchQuery]);

  const verifyDev = (e: FormEvent) => {
    e.preventDefault();
    if (devPass === "devunlock") {
      setIsDev(true);
      setShowDevPrompt(false);
      setDevPass("");
      setDevError(false);
    } else {
      setDevError(true);
      setDevPass("");
    }
  };

  const handleGeolocation = () => {
    if ("geolocation" in navigator) {
      navigator.geolocation.getCurrentPosition(async (position) => {
        const { latitude, longitude } = position.coords;
        try {
          const res = await fetch(`/api/geocode?lat=${latitude}&lon=${longitude}`);
          if (!res.ok) {
             onAlert("Thông báo", "Không thể lấy tên thành phố lúc này. Vui lòng thử lại sau.");
             setIsLocationDetected(false);
             return;
          }
          const data = await res.json();
          if (data.city) {
            setLocation(data.city);
            setIsLocationDetected(true);
            onAlert("Vị trí", `Đã cập nhật vị trí tự động: ${data.city}`);
          } else {
            onAlert("Thông báo", "Không thể xác định tên địa điểm tại tọa độ này.");
            setIsLocationDetected(false);
          }
        } catch (e) {
          console.warn("Geocode fetch limited:", e);
          onAlert("Thông báo", "Dịch vụ định vị đang tạm bận.");
          setIsLocationDetected(false);
        }
      }, (error) => {
        onAlert("Lỗi", "Không thể truy cập vị trí của bạn.");
        setIsLocationDetected(false);
      });
    } else {
      onAlert("Lỗi", "Trình duyệt không hỗ trợ Geolocation");
    }
  };

  const onAlert = (title: string, message: string) => {
    setCustomAlert({ title, message });
  };

  const [isAdmin, setIsAdmin] = useState(false);
  const [isDev, setIsDev] = useState(() => {
    return localStorage.getItem("vplay_dev_mode") === "true";
  });
  const [bypassed, setBypassed] = useState(false);

  useEffect(() => {
    localStorage.setItem("vplay_dev_mode", isDev.toString());
  }, [isDev]);

  useEffect(() => {
    localStorage.setItem("vplay_sidebar", useSidebar.toString());
  }, [useSidebar]);

  const [showAuthModal, setShowAuthModal] = useState(false);
  const [favorites, setFavorites] = useState<string[]>(() => {
    const saved = localStorage.getItem("vplay_favorites");
    return saved ? JSON.parse(saved) : [];
  });

  const [customAlert, setCustomAlert] = useState<{ title: string, message: string } | null>(null);

  useEffect(() => {
    localStorage.setItem("vplay_favorites", JSON.stringify(favorites));
  }, [favorites]);

  const toggleFavorite = (ch: typeof channels[0]) => {
    setFavorites(prev => {
      const exists = prev.includes(ch.name);
      if (exists) {
        showToast("Đã loại bỏ khỏi danh sách yêu thích", "info");
        return prev.filter(name => name !== ch.name);
      } else {
        showToast("Đã thêm vào danh sách yêu thích", "success");
        return [...prev, ch.name];
      }
    });
  };

  const [pinnedChannels, setPinnedChannels] = useState<Channel[]>(() => {
    const saved = localStorage.getItem("vplay_pinned_channels");
    return saved ? JSON.parse(saved) : [];
  });

  const [channelContextMenu, setChannelContextMenu] = useState<{ x: number, y: number, ch: Channel } | null>(null);

  const togglePinChannel = (ch: Channel) => {
    setPinnedChannels(prev => {
      const exists = prev.some(p => p.name === ch.name);
      let next;
      if (exists) {
        next = prev.filter(p => p.name !== ch.name);
        showToast(`Đã bỏ ghim kênh ${ch.name}`, "info");
      } else {
        next = [...prev, ch];
        showToast(`Đã ghim kênh ${ch.name}`, "success");
      }
      localStorage.setItem("vplay_pinned_channels", JSON.stringify(next));
      return next;
    });
  };

  const onChannelContextMenu = (e: React.MouseEvent, ch: Channel) => {
    e.preventDefault();
    e.stopPropagation();
    setChannelContextMenu({
      x: e.clientX,
      y: e.clientY,
      ch: ch
    });
  };

  const handleChannelSelect = (ch: typeof channels[0], keepTab = false) => {
    if (!user && !isDev && !bypassed) {
      setShowAuthModal(true);
      return;
    }
    setActiveChannel(ch);
    setPipExplicitlyClosed(false);
    if (!keepTab) {
      setActiveTab("Live");
    }
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, async (currentUser) => {
      setUser(currentUser);
      if (currentUser) {
        setIsGuestMode(false);
        localStorage.removeItem("vplay_guest_mode");
        try {
          const userRef = doc(db, "users", currentUser.uid);
          let userSnap = null;
          let hasDbError = false;
          try {
            userSnap = await getDoc(userRef);
          } catch (e) {
            console.warn("Firestore user read error, using local fallback:", e);
            hasDbError = true;
          }
          
          let role = "user";
          if (currentUser.email === "nguyentrungthu1610@gmail.com" || 
              currentUser.email === "tvbabinh1@gmail.com" ||
              currentUser.email === "abc@gmail.com" ||
              currentUser.email === "admin@vplay.vn" ||
              currentUser.displayName === "trungthu1610") {
            role = "admin";
          }
          
          if (userSnap && userSnap.exists()) {
            role = userSnap.data().role || role;
            setUserData(userSnap.data());
          } else if (currentUser.uid === "special_guest_uid") {
            // Special guest mock data
            role = "user";
            setUserData({
              uid: "special_guest_uid",
              email: "special_guest@vplay.vn",
              displayName: "Tài khoản đặc biệt",
              role: "user"
            });
          } else {
            const fallbackUserData: any = {
              uid: currentUser.uid,
              displayName: currentUser.displayName || "Tài khoản Vplay",
              photoURL: currentUser.photoURL || "",
              role: role,
              createdAt: new Date().toISOString()
            };
            if (currentUser.email) fallbackUserData.email = currentUser.email;
            setUserData(fallbackUserData);
            
            // Try to write the user profile in Firestore if database is accessible
            if (!hasDbError) {
              try {
                await setDoc(userRef, {
                  ...fallbackUserData,
                  createdAt: serverTimestamp()
                });
              } catch (e) {
                console.warn("Could not save user profile to Firestore:", e);
              }
            }
          }
          setIsAdmin(role === "admin");
        } catch (error) {
          console.error("Critical User Data Error handled gracefully:", error);
          let role = "user";
          if (currentUser.email === "nguyentrungthu1610@gmail.com" || 
              currentUser.email === "tvbabinh1@gmail.com" ||
              currentUser.email === "abc@gmail.com" ||
              currentUser.email === "admin@vplay.vn") {
            role = "admin";
          }
          setIsAdmin(role === "admin");
          setUserData({
            uid: currentUser.uid,
            email: currentUser.email || "",
            displayName: currentUser.displayName || "Tài khoản Vplay",
            photoURL: currentUser.photoURL || "",
            role: role,
            createdAt: new Date().toISOString()
          });
        }
      } else {
        setIsAdmin(false);
        setUserData(null);
      }
      setIsAuthLoading(false);
    });
    return () => unsubscribe();
  }, []);

  const handleLogin = () => {
    setIsGuestMode(false);
    localStorage.removeItem("vplay_guest_mode");
    setShowAuthModal(true);
  };

  const handleLogout = async () => {
    try {
      await signOut(auth);
      setUserData(null);
      setIsAdmin(false);
      setIsGuestMode(false);
      localStorage.removeItem("vplay_guest_mode");
      setActiveTab("Trang chủ");
    } catch (error) {
      console.error("Logout failed", error);
    }
  };

  const handleResetOnboarding = () => {
    localStorage.removeItem("vplay_onboarding_completed");
    setShowOnboarding(true);
  };

  const handleOpenSettings = () => {
    if (!isTouchInterface) {
      setIsWidgetsOpen(true);
      setActiveDashboardTab("settings");
    } else {
      setActiveTab("Cài đặt");
    }
  };

  const tabs = baseTabs.filter(t => {
    if (t.id === "Widgets" && !featureFlags.widgets_dashboard) return false;
    if (t.id === "Quản trị" && !isAdmin) return false;
    if (t.id === "Khám phá" && headingBar) return false;
    return true;
  });

  const displayTab = activeTab === "Cài đặt" ? "Settings (new)" : activeTab;

  const handleEnterApp = useCallback(() => {
    setShowSplash(false);
    try {
      const audioContext = new (window.AudioContext || (window as any).webkitAudioContext)();
      audioContext.resume();
    } catch (e) {
      console.warn("AudioContext initialization skipped or blocked by browser policies:", e);
    }
  }, []);

  const [isVTV6DialogOpen, setIsVTV6DialogOpen] = useState(false);

  useEffect(() => {
    const handleWhatsNew = async () => {
      const lastVersion = localStorage.getItem("vplay_version");
      const currentVersion = "26.7.0";
      
      if (lastVersion !== currentVersion) {
        if (currentVersion !== "26.7.0" && currentVersion !== "26603") {
          setShowWhatsNew(true);
        }
        localStorage.setItem("vplay_version", currentVersion);
      }
    };
    handleWhatsNew();
  }, []);

  const [showWhatsNew, setShowWhatsNew] = useState(false);

  const closeWhatsNew = () => {
    setShowWhatsNew(false);
  };

  if (isAuthLoading) {
    return null;
  }

  if (!user && !isGuestMode) {
    return (
      <MotionConfig 
        transition={featureFlags.disable_animation ? { duration: 0 } : (featureFlags.low_latency_profile ? { duration: 0.15, ease: "easeOut" } : undefined)}
        reducedMotion={featureFlags.disable_animation ? "always" : "user"}
      >
        <GatingLoginPage 
          isDark={isDark} 
          onEnterGuestMode={() => {
            setIsGuestMode(true);
            localStorage.setItem("vplay_guest_mode", "true");
          }} 
        />
      </MotionConfig>
    );
  }

  return (
    <MotionConfig 
      transition={featureFlags.disable_animation ? { duration: 0 } : (featureFlags.low_latency_profile ? { duration: 0.15, ease: "easeOut" } : undefined)}
      reducedMotion={featureFlags.disable_animation ? "always" : "user"}
    >
      <AnimatePresence>
        {isVTV6DialogOpen && (
          <LiquidModal 
            isOpen={isVTV6DialogOpen} 
            onClose={() => setIsVTV6DialogOpen(false)} 
            isDark={isDark} 
            liquidGlass={liquidGlass}
            title="Coming soon - VTV6 sắp trở lại!"
            description="Kênh VTV6 dự kiến trở lại vào 10h00 sáng ngày 08/6/2026 sau gần 4 năm dừng phát sóng, với mục tiêu là kênh chuyên biệt thể thao của Đài Truyền hình Việt Nam, do Trung tâm Truyền hình Thể thao quản lý. Vplay cũng đã sẵn sàng cho sự trở lại này - Mời quý khán giả đón xem!"
          >
            <div className="mt-8 flex flex-col items-center gap-6">
              <Countdown targetDate="2026-06-08T10:00:00" isDark={isDark} />
              <button 
                onClick={() => setIsVTV6DialogOpen(false)}
                className="w-full btn-vibrant-3d py-4 text-sm font-bold uppercase tracking-widest !rounded-2xl"
              >
                Đóng thông báo
              </button>
            </div>
          </LiquidModal>
        )}
        {showWhatsNew && (
          <WhatsNewPopup 
            isDark={isDark} 
            onClose={closeWhatsNew} 
            liquidGlass={liquidGlass} 
          />
        )}
        <LiquidModal 
          isOpen={isLockModalOpen} 
          onClose={() => setIsLockModalOpen(false)}
          isDark={isDark}
          liquidGlass={liquidGlass}
          title="Chúng tôi sẽ sớm trở lại..."
          description="Vplay tạm thời ngừng cung cấp dịch vụ xem truyền hình vì hiện tại các đơn vị đang siết chặt bản quyền về truyền thông. Chúng tôi sẽ sớm trở lại và có thông báo sau. Tuy nhiên các bản cập nhật giao diện, vá lỗi của Vplay Dev và Canary sẽ vẫn được phát hành. Trân trọng!"
        >
          <div className="mt-8 flex flex-col gap-3">
            <button 
              onClick={() => setIsLockModalOpen(false)} 
              className="w-full py-4 bg-[#4AC4FE] hover:bg-[#32bcfc] text-black rounded-2xl font-bold uppercase tracking-widest transition-all shadow-none active:scale-95 border-none outline-none"
            >
              Đã hiểu
            </button>
          </div>
        </LiquidModal>
      </AnimatePresence>
      <div className={`${
        isDark 
          ? "dark bg-vplay-background text-white" 
          : "bg-[#f8fafc] text-black"
      } h-screen flex font-sans transition-all duration-500 overflow-hidden ${useSidebar ? "flex-row" : "flex-col"} ${featureFlags.disable_animation ? "reduce-animations" : ""}`}
      onContextMenu={handleGlobalContextMenu}
      onTouchStart={startTouchTimer}
      onTouchEnd={handleGlobalTouchEnd}
      onTouchMove={cancelTouchTimer}
      style={{
        paddingLeft: useSidebar && !isMobile && !isSidebarRight 
          ? (isSidebarExpanded ? (isCompactMode ? 100 : sidebarWidth) + (!floatyBars ? 16 : 0) : (80 + (!floatyBars ? 16 : 0))) 
          : 0,
        paddingRight: useSidebar && !isMobile && isSidebarRight 
          ? (isSidebarExpanded ? (isCompactMode ? 100 : sidebarWidth) + (!floatyBars ? 16 : 0) : (80 + (!floatyBars ? 16 : 0))) 
          : 0,
        paddingTop: headingBar ? (featureFlags.dynamic_island ? 0 : (floatyBars ? 56 : 76)) : 0,
      }}
      >
      {!showSplash && headingBar && (
        <div 
          className={floatyBars 
            ? "fixed top-0 left-0 right-0 w-full z-[9999] transition-all duration-300"
            : "fixed top-3 left-3 right-3 md:left-4 md:right-4 z-[9999] transition-all duration-300"
          }
        >
          {featureFlags.dynamic_island ? (
            <DynamicIsland 
              searchQuery={searchQuery}
              setSearchQuery={setSearchQuery}
              currentTime={currentTime}
              isDark={isDark}
              onMenuClick={() => setIsSidebarExpanded(!isSidebarExpanded)}
              user={user}
              handleOpenSettings={handleOpenSettings}
              onOpenVIntelligence={() => setIsVIntelligenceModalOpen(true)}
            />
          ) : (
            <TopBar 
              isDark={isDark} 
              topbarSearchType={topbarSearchType}
              searchQuery={searchQuery}
              setSearchQuery={setSearchQuery}
              searchFilterOption={searchFilterOption}
              setSearchFilterOption={setSearchFilterOption}
              isSearchOpen={isSearchOpen}
              activeTab={activeTab}
              onMenuClick={() => setIsSidebarExpanded(!isSidebarExpanded)}
              sidebarExpanded={isSidebarExpanded}
              useSidebar={useSidebar && !isMobile}
              onSearchClick={() => {
                setIsSearchOpen(true);
              }}
              currentTime={currentTime}
              weather={weather}
              showTempInClock={showTempInClock}
              showClock={showClock}
              showDate={showDate}
              getTempDisplay={getTempDisplay}
              formatTime={formatTime}
              formatDateString={formatDateString}
              setActiveTab={setActiveTab}
              handleSearchContextMenu={handleSearchContextMenu}
              onContextMenu={handleGlobalContextMenu}
              isSearchCompact={isSearchCompact}
              startListening={handleStartListening}
              isListening={isListening}
              isListeningFailed={isListeningFailed}
              location={location}
              onSystemTrayClick={() => {
                setIsWidgetsOpen(true);
                setActiveDashboardTab("widgets");
              }}
              user={user}
              userData={userData}
              name={name}
              avatar={avatar}
              isUserMenuOpen={isUserMenuOpen}
              setIsUserMenuOpen={setIsUserMenuOpen}
              showVersionInfo={showVersionInfo}
              setShowVersionInfo={setShowVersionInfo}
              handleLogin={handleLogin}
              handleLogout={handleLogout}
              handleOpenSettings={handleOpenSettings}
              floatyBars={floatyBars}
            />
          )}
        </div>
      )}

      <AnimatePresence>
        {showSplash && (
          <div 
            key="splash-container" 
            onClick={isReinstalling ? undefined : handleEnterApp} 
            className={`${isReinstalling ? "z-[110]" : "cursor-pointer z-[110]"}`}
          >
            <SplashScreen 
              isDark={isDark} 
              onEnter={handleEnterApp} 
              duration={featureFlags.low_latency_profile ? 500 : splashDuration} 
              isReinstalling={isReinstalling}
              onReinstallComplete={() => {
                localStorage.clear();
                window.location.reload();
              }}
            />
          </div>
        )}
        {showOnboarding && (
          <div key="onboarding-container" className="z-[155]">
            <OnboardingWizard isDark={isDark} onComplete={handleOnboardingComplete} onLogin={handleLogin} />
          </div>
        )}
      </AnimatePresence>
      <AuthModal isOpen={showAuthModal} onClose={() => setShowAuthModal(false)} isDark={isDark} liquidGlass={liquidGlass} setIsDev={setIsDev} setUserData={setUserData} />
      
      <AnimatePresence>
        {showForceResetPopup && (
          <div className="fixed inset-0 z-[1000] flex items-center justify-center p-4">
            <motion.div 
              initial={{ opacity: 0 }} 
              animate={{ opacity: 1 }} 
              exit={{ opacity: 0 }} 
              onClick={() => setShowForceResetPopup(false)} 
              className="absolute inset-0 bg-black/60 backdrop-blur-sm" 
            />
            <motion.div 
              initial={{ opacity: 0, scale: 0.9, y: 20 }} 
              animate={{ opacity: 1, scale: 1, y: 0 }} 
              exit={{ opacity: 0, scale: 0.9, y: 20 }} 
              className="relative w-full max-w-sm rounded-[32px]"
            >
              <ShinyGlassWrapper isDark={isDark} roundedClass="rounded-[32px]" innerClass={`p-6 shadow-2xl relative w-full h-full flex flex-col ${isDark ? "bg-[#18181c]/92 text-white" : "bg-white/92 text-slate-800"}`}>
                <div className="flex items-center justify-between mb-4">
                  <h3 className="text-xl font-bold tracking-tight">Kích hoạt khẩn cấp</h3>
                  <button 
                    onClick={() => setShowForceResetPopup(false)} 
                    className={`p-1.5 rounded-xl transition-colors ${isDark ? "hover:bg-white/10 text-white/60" : "hover:bg-black/5 text-slate-400"}`}
                  >
                    <X size={18} />
                  </button>
                </div>

                <div className="mx-auto w-12 h-12 bg-red-500/10 text-red-500 rounded-full flex items-center justify-center mb-4">
                  <Trash2 size={24} />
                </div>

                <p className={`text-xs leading-relaxed mb-6 text-center opacity-85 ${isDark ? "text-slate-300" : "text-slate-600"}`} style={{ fontFamily: "Montserrat, sans-serif" }}>
                  Hệ thống chuẩn bị tẩy xóa sạch mọi tùy biến và khôi phục cài đặt gốc cấp tốc (Force Reinstall). Hệ thống sẽ tự động tải lại sau khi hoàn thành. Bạn có đồng ý tiếp tục không?
                </p>

                <div className="grid grid-cols-2 gap-3">
                  <button 
                    onClick={() => setShowForceResetPopup(false)} 
                    className={`py-2.5 rounded-xl font-bold text-xs transition-colors border ${
                      isDark ? "bg-white/5 border-white/5 text-slate-300 hover:bg-white/10" : "bg-slate-100 border-slate-200 text-slate-700 hover:bg-slate-200"
                    }`}
                  >
                    Bỏ qua
                  </button>
                  <button 
                    onClick={() => { 
                      setShowForceResetPopup(false); 
                      setIsReinstalling(true); 
                      setSplashDuration(60000); 
                      setShowSplash(true); 
                    }} 
                    className="py-2.5 rounded-xl font-bold text-xs transition-colors bg-[#FF453A] hover:bg-red-700 text-white shadow-lg shadow-red-600/20 active:scale-[0.98]"
                  >
                    Đồng ý
                  </button>
                </div>
              </ShinyGlassWrapper>
            </motion.div>
          </div>
        )}
      </AnimatePresence>

      <GeoPopup 
        isOpen={showGeoPopup} 
        onClose={() => setShowGeoPopup(false)} 
        isDark={isDark} 
        onAutoSelect={handleGeolocation}
        onManualSelect={(city) => {
          setLocation(city);
          onAlert("Vị trí", `Đã cập nhật vị trí: ${city}`);
        }}
      />

      <WidgetsDashboard 
        isOpen={isWidgetsOpen}
        onClose={() => setIsWidgetsOpen(false)}
        isDark={isDark}
        weather={weather}
        getTempDisplay={getTempDisplay}
        currentTime={currentTime}
        formatTime={formatTime}
        formatDateString={formatDateString}
        activeChannel={activeChannel}
        setActiveChannel={handleChannelSelect}
        setActiveTab={setActiveTab}
        user={user}
        userData={userData}
        featureFlags={featureFlags}
        setFeatureFlags={setFeatureFlags}
        loadingTreatment={loadingTreatment}
        setLoadingTreatment={setLoadingTreatment}
        isDev={isDev}
        setIsDev={setIsDev}
        liquidGlass={liquidGlass}
        setLiquidGlass={setLiquidGlass}
        liquidGlassBlur={liquidGlassBlur}
        setLiquidGlassBlur={setLiquidGlassBlur}
        liquidGlassOpacity={liquidGlassOpacity}
        setLiquidGlassOpacity={setLiquidGlassOpacity}
        onOpenUserMenu={() => setIsUserMenuOpen(true)}
        activeDashboardTab={activeDashboardTab}
        setActiveDashboardTab={setActiveDashboardTab}
        setIsDark={setIsDark}
        useSidebar={useSidebar}
        setUseSidebar={setUseSidebar}
        isSidebarRight={isSidebarRight}
        setIsSidebarRight={setIsSidebarRight}
        isSidebarLocked={isSidebarLocked}
        setIsSidebarLocked={setIsSidebarLocked}
        sidebarDisplay={sidebarDisplay}
        setSidebarDisplay={setSidebarDisplay}
        isPinningEnabled={isPinningEnabled}
        setIsPinningEnabled={setIsPinningEnabled}
        setUserData={setUserData}
        onAlert={onAlert}
        handleLogin={handleLogin}
        handleResetOnboarding={handleResetOnboarding}
        favorites={favorites}
        bypassed={bypassed}
        tempUnit={tempUnit}
        setTempUnit={setTempUnit}
        location={location}
        setLocation={setLocation}
        timeFormat={timeFormat}
        setTimeFormat={setTimeFormat}
        clockFormat={clockFormat}
        setClockFormat={setClockFormat}
        dateFormat={dateFormat}
        setDateFormat={setDateFormat}
        showClock={showClock}
        setShowClock={setShowClock}
        showDate={showDate}
        setShowDate={setShowDate}
        showTempInClock={showTempInClock}
        setShowTempInClock={setShowTempInClock}
        headingBar={headingBar}
        setHeadingBar={setHeadingBar}
        isSearchCompact={isSearchCompact}
        setIsSearchCompact={setIsSearchCompact}
        handleLogout={handleLogout}
        customColors={customColors}
        setCustomColors={setCustomColors}
        setShowGeoPopup={setShowGeoPopup}
        handleGeolocation={handleGeolocation}
        searchQuery={searchQuery}
        setSearchQuery={setSearchQuery}
        isCompactMode={isCompactMode}
        setIsCompactMode={setIsCompactMode}
        isTouchInterface={isTouchInterface}
        setIsTouchInterface={setIsTouchInterface}
        floatyBars={floatyBars}
        setFloatyBars={setFloatyBars}
        sidebarQuickAccess={sidebarQuickAccess}
        setSidebarQuickAccess={setSidebarQuickAccess}
        topbarSearchType={topbarSearchType}
        setTopbarSearchType={setTopbarSearchType}
        locationDetection={locationDetection}
        setLocationDetection={setLocationDetection}
        timeZone={timeZone}
        setTimeZone={setTimeZone}
        onCloseDashboard={() => setIsWidgetsOpen(false)}
        widgetsBoardPosition={widgetsBoardPosition}
        setWidgetsBoardPosition={setWidgetsBoardPosition}
        hideSidebarInWidgets={hideSidebarInWidgets}
        setHideSidebarInWidgets={setHideSidebarInWidgets}
        fullScreenWidgets={fullScreenWidgets}
        setFullScreenWidgets={setFullScreenWidgets}
        frostedGlassWidgets={frostedGlassWidgets}
        setFrostedGlassWidgets={setFrostedGlassWidgets}
        colorWidgets={colorWidgets}
        setColorWidgets={setColorWidgets}
        setIsReinstalling={setIsReinstalling}
        setShowSplash={setShowSplash}
        setSplashDuration={setSplashDuration}
      />
      
      <AnimatePresence>
        {contextMenu && contextMenu.type === "search" && (
          <SearchContextMenu 
            key="search-context-menu"
            x={contextMenu.x} 
            y={contextMenu.y} 
            isDark={isDark} 
            activeFilter={searchFilter} 
            onClose={() => setContextMenu(null)} 
            onSelect={(f) => setSearchFilter(f)} 
          />
        )}
        {contextMenu && contextMenu.type === "unified" && (
          <UnifiedContextMenu 
            key="unified-context-menu"
            x={contextMenu.x} 
            y={contextMenu.y} 
            isDark={isDark} 
            onClose={() => setContextMenu(null)} 
            headingBar={headingBar}
            setHeadingBar={setHeadingBar}
            useSidebar={useSidebar}
            setUseSidebar={setUseSidebar}
            showClock={showClock}
            setShowClock={setShowClock}
            showDate={showDate}
            setShowDate={setShowDate}
            showTempInClock={showTempInClock}
            setShowTempInClock={setShowTempInClock}
            handleOpenSettings={handleOpenSettings}
            featureFlags={featureFlags}
          />
        )}
        {channelContextMenu && (
          <>
            <div 
              className="fixed inset-0 z-[300]" 
              onClick={() => setChannelContextMenu(null)}
              onContextMenu={(e) => { e.preventDefault(); setChannelContextMenu(null); }}
            />
            <motion.div 
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.95 }}
              transition={{ duration: 0.12 }}
              className="fixed z-[310] min-w-[240px] rounded-2xl border transition-all duration-300 font-bold shadow-[0_12px_32px_rgba(0,0,0,0.25)] text-black"
              style={{
                position: "fixed",
                top: channelContextMenu.y,
                left: channelContextMenu.x,
                padding: "10px",
                backgroundColor: "#ffffff",
                border: "1px solid rgba(0, 0, 0, 0.1)"
              }}
            >
              <div className="px-3 pb-2 pt-1 border-b border-slate-200 mb-1.5 text-[10px] font-black uppercase tracking-wider text-slate-800 truncate max-w-[220px]">
                Kênh: {channelContextMenu.ch.name}
              </div>
              
              {/* Toggle Favorite Option */}
              <button
                onClick={() => {
                  toggleFavorite(channelContextMenu.ch);
                  setChannelContextMenu(null);
                }}
                className="w-full text-left truncate flex items-center gap-3 px-3 py-2.5 rounded-xl text-xs font-bold transition-colors hover:bg-slate-100 text-slate-800 hover:text-black"
              >
                <Heart size={14} className={favorites.includes(channelContextMenu.ch.name) ? "text-[#E02424] fill-[#E02424] animate-pulse" : "opacity-60 text-slate-800"} />
                {favorites.includes(channelContextMenu.ch.name) ? "Loại bỏ khỏi yêu thích" : "Thêm vào yêu thích"}
              </button>

              {/* Toggle Pin/Unpin Option */}
              <button
                onClick={() => {
                  togglePinChannel(channelContextMenu.ch);
                  setChannelContextMenu(null);
                }}
                className="w-full text-left truncate flex items-center gap-3 px-3 py-2.5 rounded-xl text-xs font-bold transition-colors hover:bg-slate-100 text-slate-800 hover:text-black"
              >
                <Pin size={14} className={pinnedChannels.some(p => p.name === channelContextMenu.ch.name) ? "text-[#4AC4FE] fill-[#4AC4FE]" : "opacity-60 text-slate-800"} />
                {pinnedChannels.some(p => p.name === channelContextMenu.ch.name) ? "Bỏ ghim khỏi sidebar/nav" : "Ghim vào sidebar/nav"}
              </button>
            </motion.div>
          </>
        )}
      </AnimatePresence>

      <AnimatePresence>
        {isMobileContextMenuOpen && (
          <div className="fixed inset-0 z-[999] flex items-end justify-center md:hidden">
            {/* Backdrop: translucent darkened mask with blur */}
            <motion.div 
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={() => setIsMobileContextMenuOpen(false)}
              className="absolute inset-0 bg-black/25 z-10 backdrop-blur-sm"
            />
            
            {/* Modal/Drawer Container: translucent background with glassmorphism (opacity 30%, blur 20px) */}
            <motion.div 
              initial={{ y: "100%" }}
              animate={{ y: 0 }}
              exit={{ y: "100%" }}
              transition={{ type: "spring", damping: 25, stiffness: 250 }}
              className={`relative w-full max-h-[85vh] flex flex-col rounded-t-[32px] border-t overflow-hidden shadow-2xl p-6 z-20 ${
                isDark 
                  ? "text-white" 
                  : "text-slate-900"
              }`}
              style={{ 
                paddingBottom: "env(safe-area-inset-bottom, 24px)",
                backgroundColor: isDark ? "rgba(15, 23, 42, 0.30)" : "rgba(255, 255, 255, 0.30)",
                backdropFilter: "blur(20px)",
                WebkitBackdropFilter: "blur(20px)",
                borderTop: isDark ? "1px solid rgba(255, 255, 255, 0.20)" : "1px solid rgba(15, 23, 42, 0.15)"
              }}
            >
              {/* Drag indicator/handle */}
              <div className="w-12 h-1.5 rounded-full bg-slate-500/30 mx-auto mb-5 shrink-0" onClick={() => setIsMobileContextMenuOpen(false)} />
              
              {/* Options list */}
              <div className="space-y-2 overflow-y-auto pr-1">
                <button 
                  onClick={() => { setHeadingBar(!headingBar); setIsMobileContextMenuOpen(false); }} 
                  className={`w-full flex items-center justify-between px-4 py-3.5 rounded-2xl border transition-all ${
                    isDark 
                      ? "bg-white/5 hover:bg-white/10 border-white/5 hover:border-white/10 text-white/90" 
                      : "bg-slate-50 hover:bg-slate-100 border-slate-100 hover:border-slate-200 text-slate-800"
                  }`}
                >
                  <div className="flex items-center gap-3">
                    {headingBar ? <EyeOff size={18} /> : <Eye size={18} />}
                    <span className="text-sm font-semibold">
                      {featureFlags.dynamic_island 
                        ? (headingBar ? "Ẩn Dynamic Island" : "Hiện Dynamic Island")
                        : (headingBar ? "Ẩn thanh trượt trên (Top bar)" : "Hiện thanh trượt trên (Top bar)")}
                    </span>
                  </div>
                  {headingBar && <Check size={16} className="text-[#4AC4FE]" />}
                </button>

                <button 
                  onClick={() => { setUseSidebar(!useSidebar); setIsMobileContextMenuOpen(false); }} 
                  className={`w-full flex items-center justify-between px-4 py-3.5 rounded-2xl border transition-all ${
                    isDark 
                      ? "bg-white/5 hover:bg-white/10 border-white/5 hover:border-white/10 text-white/90" 
                      : "bg-slate-50 hover:bg-slate-100 border-slate-100 hover:border-slate-200 text-slate-800"
                  }`}
                >
                  <div className="flex items-center gap-3">
                    {useSidebar ? <Smartphone size={18} /> : <Columns size={18} />}
                    <span className="text-sm font-semibold">{useSidebar ? "Chuyển sang thanh điều hướng ngang" : "Chuyển sang thanh điều hướng bên (Sidebar)"}</span>
                  </div>
                  {!useSidebar && <Check size={16} className="text-[#4AC4FE]" />}
                </button>

                <button 
                  onClick={() => {
                    const hasClockOrDate = showClock || showDate;
                    const targetState = !hasClockOrDate;
                    setShowClock(targetState);
                    setShowDate(targetState);
                    setIsMobileContextMenuOpen(false);
                  }} 
                  className={`w-full flex items-center justify-between px-4 py-3.5 rounded-2xl border transition-all ${
                    isDark 
                      ? "bg-white/5 hover:bg-white/10 border-white/5 hover:border-white/10 text-white/90" 
                      : "bg-slate-50 hover:bg-slate-100 border-slate-100 hover:border-slate-200 text-slate-800"
                  }`}
                >
                  <div className="flex items-center gap-3">
                    <Clock size={18} />
                    <span className="text-sm font-semibold">{(showClock || showDate) ? "Ẩn đồng hồ và lịch" : "Hiện đồng hồ và lịch"}</span>
                  </div>
                  {(showClock || showDate) && <Check size={16} className="text-[#4AC4FE]" />}
                </button>

                <button 
                  onClick={() => { setShowTempInClock(!showTempInClock); setIsMobileContextMenuOpen(false); }} 
                  className={`w-full flex items-center justify-between px-4 py-3.5 rounded-2xl border transition-all ${
                    isDark 
                      ? "bg-white/5 hover:bg-white/10 border-white/5 hover:border-white/10 text-white/90" 
                      : "bg-slate-50 hover:bg-slate-100 border-slate-100 hover:border-slate-200 text-slate-800"
                  }`}
                >
                  <div className="flex items-center gap-3">
                    <Thermometer size={18} />
                    <span className="text-sm font-semibold">Hiện độ ẩm & nhiệt độ thời tiết</span>
                  </div>
                  {showTempInClock && <Check size={16} className="text-[#4AC4FE]" />}
                </button>

                <button 
                  onClick={() => { window.location.reload(); }} 
                  className={`w-full flex items-center justify-start gap-4 px-4 py-3.5 rounded-2xl border transition-all ${
                    isDark 
                      ? "bg-white/5 hover:bg-white/10 border-white/5 hover:border-white/10 text-white/90" 
                      : "bg-slate-50 hover:bg-slate-100 border-slate-100 hover:border-slate-200 text-slate-800"
                  }`}
                >
                  <RotateCcw size={18} />
                  <span className="text-sm font-semibold">Tải lại ứng dụng</span>
                </button>

                {/* Hard Reset Feature Options */}
                <button 
                  onClick={() => { 
                    localStorage.clear(); 
                    sessionStorage.clear();
                    window.location.reload(); 
                  }} 
                  className={`w-full flex items-center justify-start gap-4 px-4 py-3.5 rounded-2xl border transition-all ${
                    isDark 
                      ? "bg-red-500/10 hover:bg-red-500/20 border-red-500/20 text-[#FF453A] font-bold" 
                      : "bg-red-50 hover:bg-red-100 border-red-100 text-red-600 font-bold"
                  }`}
                >
                  <Trash2 size={18} />
                  <span className="text-sm">Hard reset</span>
                </button>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>

      <LiquidModal
        isOpen={showDevSettings}
        onClose={() => setShowDevSettings(false)}
        isDark={isDark}
        title="Cài đặt nhà phát triển"
        description={isDev ? "Bạn đang ở chế độ nhà phát triển. Bạn có muốn tắt nó không?" : "Bạn muốn kích hoạt chế độ nhà phát triển?"}
        liquidGlass={liquidGlass}
      >
        <div className="flex flex-col gap-3">
          {!isDev ? (
            <button 
              onClick={() => { setShowDevSettings(false); setShowDevPrompt(true); }}
              className="w-full py-4 bg-[#4AC4FE]/90 hover:bg-[#4AC4FE] text-black rounded-[32px] font-bold transition-all shadow-[0_8px_24px_rgba(147,51,234,0.3)] backdrop-blur-md active:scale-95"
            >
              Kích hoạt (Yêu cầu mật khẩu)
            </button>
          ) : (
            <button 
              onClick={() => { setIsDev(false); setShowDevSettings(false); }}
              className="w-full py-4 bg-red-600/90 hover:bg-red-500 text-white rounded-[32px] font-bold transition-all shadow-[0_8px_24px_rgba(239,68,68,0.3)] backdrop-blur-md active:scale-95"
            >
              Hủy kích hoạt
            </button>
          )}
          <button 
            onClick={() => setShowDevSettings(false)}
            className={`w-full py-3 rounded-3xl font-bold transition-all ${
              isDark ? "bg-white/5 text-slate-400 hover:text-white" : "bg-black/5 text-slate-500 hover:text-slate-900"
            }`}
          >
            Đóng
          </button>
        </div>
      </LiquidModal>

      {/* Developer Mode Prompt */}
      <LiquidModal
        isOpen={showDevPrompt}
        onClose={() => { setShowDevPrompt(false); setDevPass(""); setDevError(false); }}
        isDark={isDark}
        title="Chế độ nhà phát triển"
        description="Kích hoạt tính năng nhà phát triển để truy cập vào các quyền đặc biệt. Bạn cần phải có mật khẩu dành cho nhà phát triển được chia sẻ bởi Chủ Thớt để kích hoạt"
        liquidGlass={liquidGlass}
      >
        <form onSubmit={verifyDev} className="space-y-4 text-left">
          <div className="space-y-1">
            <label className={`text-[10px] font-bold uppercase tracking-wider opacity-50 ml-4 ${isDark ? "text-white" : "text-slate-900"}`}>Mật khẩu</label>
            <div className={`relative group rounded-full overflow-hidden transition-all ${
              devError 
                ? "border-red-500 bg-red-500/5" 
                : isDark 
                  ? "bg-white/5" 
                  : "bg-black/5 mx-2"
            }`}>
              <input 
                autoFocus
                type="password" 
                value={devPass} 
                onChange={e => setDevPass(e.target.value)}
                className={`w-full px-6 py-3 bg-transparent outline-none transition-all ${
                  isDark ? "text-white placeholder-white/30" : "text-slate-900 placeholder-slate-400"
                }`}
                placeholder="••••••••"
              />
              {!devError && (
                <div className={`absolute bottom-0 left-0 h-[2px] w-full transition-all duration-300 ${isDark ? "bg-white/10" : "bg-slate-200"} group-focus-within:bg-[#4AC4FE] group-focus-within:shadow-[0_0_10px_rgba(168,85,247,0.5)]`} />
              )}
            </div>
            {devError && <p className="text-red-500 text-[10px] mt-2 font-bold text-center">Mật khẩu không chính xác!</p>}
          </div>
          
          <div className="flex flex-col gap-3 pt-2">
            <button 
              type="submit"
              className="w-full py-4 bg-primary hover:opacity-90 text-white rounded-[32px] font-bold transition-all shadow-lg shadow-primary/20 active:scale-95"
            >
              Xác nhận
            </button>
            <button 
              type="button"
              onClick={() => { setShowDevPrompt(false); setDevPass(""); setDevError(false); }}
              className={`w-full py-3 rounded-3xl font-bold transition-all ${
                isDark ? "bg-white/5 text-slate-400 hover:text-white" : "bg-black/5 text-slate-500 hover:text-slate-900"
              }`}
            >
              Hủy
            </button>
          </div>
        </form>
      </LiquidModal>

      <AnimatePresence>
        {isSearchOpen && (
          <div className="fixed inset-0 z-[1000] flex items-center justify-center p-4">
            <motion.div 
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={() => setIsSearchOpen(false)}
              className={`absolute inset-0 bg-black/60 backdrop-blur-md`}
            />
            <motion.div
              initial={{ scale: 0.9, opacity: 0, y: 20 }}
              animate={{ scale: 1, opacity: 1, y: 0 }}
              exit={{ scale: 0.9, opacity: 0, y: 20 }}
              className={`relative w-full max-w-4xl max-h-[85vh] overflow-hidden flex flex-col ${
                isDark ? "popup-3d-dark" : "popup-3d-light"
              } ${liquidGlass ? "backdrop-blur-3xl" : ""}`}
            >
              <div className="p-6 border-b border-white/5 flex items-center gap-4">
                 <div className={`flex-1 flex items-center gap-4 px-6 py-4 rounded-full border cursor-pointer transform transition-all duration-300 hover:scale-[1.03] hover:-translate-y-0.5 active:scale-[0.98] active:translate-y-0 ${
                   isDark 
                     ? "bg-white/5 border-white/5 text-white shadow-[0_4px_12px_rgba(0,0,0,0.15),_inset_0_1.5px_2.5px_rgba(255,255,255,0.15)] focus-within:shadow-[0_8px_24px_rgba(74,196,254,0.35)]" 
                     : "bg-slate-100 border-slate-200/40 text-slate-800 shadow-[0_4px_10px_rgba(0,0,0,0.06),_inset_0_1.5px_2px_rgba(255,255,255,0.4)] focus-within:shadow-[0_8px_20px_rgba(74,196,254,0.25)]"
                 }`}>
                    <SearchCustomIcon size={26} />
                    <input 
                      autoFocus
                      value={searchQuery}
                      onChange={(e) => setSearchQuery(e.target.value)}
                      placeholder="Find and explore Vplay"
                      className={`flex-1 bg-transparent border-none outline-none text-lg font-normal ${isDark ? "text-white placeholder:text-white/30" : "text-black placeholder:text-black/30"}`}
                    />
                    <div className="relative shrink-0">
                      <button 
                        type="button"
                        onClick={() => setShowModalFilterDropdown(!showModalFilterDropdown)}
                        className={`p-2 rounded-full transition-all ${showModalFilterDropdown ? "text-[#4AC4FE] bg-[#4AC4FE]/10 mr-1" : "text-[#4AC4FE]/60 hover:text-[#4AC4FE] mr-1"}`}
                        title="Bộ lọc tìm kiếm"
                      >
                        <Filter size={20} />
                      </button>
                      <AnimatePresence>
                        {showModalFilterDropdown && (
                          <motion.div
                            initial={{ opacity: 0, y: 10, scale: 0.95 }}
                            animate={{ opacity: 1, y: 0, scale: 1 }}
                            exit={{ opacity: 0, y: 10, scale: 0.95 }}
                            className={`absolute right-0 top-full mt-2 z-[300] min-w-[200px] rounded-xl border p-1 shadow-xl ${
                              isDark ? "bg-[#181818] border-white/10 text-white" : "bg-white border-slate-200 text-slate-800"
                            }`}
                          >
                            {[
                              { label: "Tất cả", value: "Tất cả kênh" as const },
                              { label: "Kênh của Vplay", value: "Kênh của Vplay" as const },
                              { label: "Kênh package của bạn", value: "Package của bạn" as const }
                            ].map((opt) => {
                              const isActive = searchFilterOption === opt.value;
                              return (
                                <button
                                  key={opt.value}
                                  type="button"
                                  onClick={() => {
                                    setSearchFilterOption(opt.value);
                                    setShowModalFilterDropdown(false);
                                  }}
                                  className={`w-full text-left px-4 py-2 text-xs font-bold rounded-lg transition-all flex items-center justify-between ${
                                    isActive
                                      ? "bg-[#4AC4FE]/10 text-[#4AC4FE]"
                                      : isDark ? "hover:bg-white/5 text-slate-300" : "hover:bg-slate-100 text-slate-700"
                                  }`}
                                >
                                  <span>{opt.label}</span>
                                  {isActive && <Check size={14} className="text-[#4AC4FE]" />}
                                </button>
                              );
                            })}
                          </motion.div>
                        )}
                      </AnimatePresence>
                    </div>
                    {searchQuery && (
                      <button onClick={() => setSearchQuery("")} className="p-1 rounded-full hover:bg-black/10">
                        <X size={16} />
                      </button>
                    )}
                 </div>
                 <button 
                  onClick={() => setIsSearchOpen(false)}
                  className={`p-4 rounded-full transition-all active:scale-90 ${isDark ? "hover:bg-white/10" : "hover:bg-black/10"}`}
                 >
                   <X size={24} />
                 </button>
              </div>
              <div className="flex-1 overflow-y-auto p-4">
                <SearchPopup 
                  isDark={isDark}
                  searchQuery={searchQuery}
                  setActiveChannel={handleChannelSelect}
                  onClose={() => {
                    setIsSearchOpen(false);
                    setSearchQuery("");
                  }}
                  favorites={favorites}
                  liquidGlass={liquidGlass}
                  setActiveTab={setActiveTab}
                  handleOpenSettings={handleOpenSettings}
                  setIsDark={setIsDark}
                  setLiquidGlass={setLiquidGlass}
                  onLogin={handleLogin}
                  onLogout={handleLogout}
                  setSortOrder={setSortOrder}
                  loadingTreatment={loadingTreatment}
                  asContent={false}
                  useSidebar={useSidebar}
                  setUseSidebar={setUseSidebar}
                  isSidebarRight={isSidebarRight}
                  setIsSidebarRight={setIsSidebarRight}
                  sidebarDisplay={sidebarDisplay}
                  setSidebarDisplay={setSidebarDisplay}
                  isPinningEnabled={isPinningEnabled}
                  setIsPinningEnabled={setIsPinningEnabled}
                  featureFlags={featureFlags}
                  setFeatureFlags={setFeatureFlags}
                  setIsSidebarLocked={setIsSidebarLocked}
                  setSearchQuery={setSearchQuery}
                  searchFilter={searchFilter}
                  allCustomChannels={allCustomChannels}
                  searchFilterOption={searchFilterOption}
                  currentTab={activeTab}
                  setActiveSettingsPage={setSettingsActivePage}
                />
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>

      <div className="flex-1 flex flex-col min-h-screen px-0 transition-all duration-500">
        <AnimatePresence>
          {useSidebar && !isMobile && (
            <div className="fixed inset-0 pointer-events-none z-[40]">
               {/* This space is reserved for the floating sidebar shadows/click-through */}
            </div>
          )}
          {isSearchOpen && (
            <motion.div 
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={() => setIsSearchOpen(false)}
              className={`fixed inset-0 z-[45] bg-black/20 ${liquidGlass ? "backdrop-blur-[2px]" : ""}`}
            />
          )}
        </AnimatePresence>

        <LiquidModal 
          isOpen={!!customAlert} 
          onClose={() => setCustomAlert(null)} 
          isDark={isDark}
          title={customAlert?.title}
          description={customAlert?.message}
          liquidGlass={liquidGlass}
        >
          <button 
            onClick={() => setCustomAlert(null)}
            className="w-full py-4 bg-[#4AC4FE]/10 hover:bg-[#4AC4FE]/20 text-[#4AC4FE] rounded-3xl font-bold transition-all active:scale-95"
          >
            Xác nhận
          </button>
        </LiquidModal>


        <div 
          onScroll={(e) => {
            const scrollTop = e.currentTarget.scrollTop;
            if (activeTab === "Trang chủ") {
              setHomeScrollY(scrollTop);
            } else if (homeScrollY !== 0) {
              setHomeScrollY(0);
            }

            // Auto hide/show bottom navigation bar on scroll down/up
            if (scrollTop > lastScrollY.current && scrollTop > 50) {
              setIsNavVisible(false);
            } else {
              setIsNavVisible(true);
            }
            lastScrollY.current = scrollTop;
          }}
          className={`flex-1 overflow-y-auto ${(displayTab === "Cài đặt" || displayTab === "Settings (new)" || displayTab === "Live") ? (useSidebar ? "pb-0" : "pb-32") : "pb-32"} flex flex-col w-full max-w-full overflow-x-hidden bg-transparent`}
        >
          <motion.div
            key={displayTab}
            initial={{ opacity: 0, y: 12 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -12 }}
            transition={{ duration: 0.3, ease: "easeOut" }}
            className={`h-full flex flex-col ${(displayTab === "Cài đặt" || displayTab === "Settings (new)" || displayTab === "Live") ? "pt-0" : "pt-4 md:pt-8"}`}
          >
              {displayTab === "Trang chủ" && (
                <HomeContent 
                  setActiveTab={setActiveTab} 
                  setActiveChannel={handleChannelSelect} 
                  isDark={isDark} 
                  favorites={favorites} 
                  toggleFavorite={toggleFavorite} 
                  liquidGlass={liquidGlass}
                  user={user}
                  onLogin={handleLogin}
                  slideIndex={slideIndex}
                  direction={direction}
                  paginate={paginate}
                  slides={slides}
                  bypassed={bypassed}
                  onChannelContextMenu={onChannelContextMenu}
                  useNewDesign={useNewDesign}
                  activeChannelName={activeChannel?.name}
                  featureFlags={featureFlags}
                  showChannelNumbers={showChannelNumbers}
                />
              )}
              {displayTab === "Tìm kiếm" && (
                <ExploreContent 
                  isDark={isDark}
                  searchQuery={searchQuery}
                  setSearchQuery={setSearchQuery}
                  setActiveChannel={handleChannelSelect}
                  favorites={favorites}
                  toggleFavorite={toggleFavorite}
                  liquidGlass={liquidGlass}
                  user={user}
                  onLogin={handleLogin}
                  onLogout={handleLogout}
                  setActiveTab={setActiveTab}
                  handleOpenSettings={handleOpenSettings}
                  setIsDark={setIsDark}
                  setLiquidGlass={setLiquidGlass}
                  setSortOrder={setSortOrder}
                  bypassed={bypassed}
                  loadingTreatment={loadingTreatment}
                  useSidebar={useSidebar}
                  setUseSidebar={setUseSidebar}
                  isSidebarRight={isSidebarRight}
                  setIsSidebarRight={setIsSidebarRight}
                  sidebarDisplay={sidebarDisplay}
                  setSidebarDisplay={setSidebarDisplay}
                  isPinningEnabled={isPinningEnabled}
                  setIsPinningEnabled={setIsPinningEnabled}
                  featureFlags={featureFlags}
                  setFeatureFlags={setFeatureFlags}
                  setIsSidebarLocked={setIsSidebarLocked}
                  handleSearchContextMenu={handleSearchContextMenu}
                  searchFilter={searchFilter}
                  allCustomChannels={allCustomChannels}
                  searchFilterOption={searchFilterOption}
                  setSearchFilterOption={setSearchFilterOption}
                  currentTab={activeTab}
                  setActiveSettingsPage={setSettingsActivePage}
                />
              )}
              {displayTab === "Live" && (
                <TVContent 
                  mode="live"
                  active={activeChannel} 
                  setActive={handleChannelSelect} 
                  isDark={isDark} 
                  favorites={favorites} 
                  toggleFavorite={toggleFavorite} 
                  user={user}
                  onLogin={handleLogin}
                  isDev={isDev}
                  liquidGlass={liquidGlass}
                  sortOrder={sortOrder}
                  setSortOrder={setSortOrder}
                  showSplash={showSplash}
                  featureFlags={featureFlags}
                  searchQuery={searchQuery}
                  bypassed={bypassed}
                  setIsPlayerInView={setIsPlayerInView}
                  loadingTreatment={loadingTreatment}
                  currentTime={currentTime}
                  onChannelContextMenu={onChannelContextMenu}
                  pinnedChannels={pinnedChannels}
                  togglePinChannel={togglePinChannel}
                  isTopBarVisible={isTopBarVisible}
                  useNewDesign={useNewDesign}
                  setUseNewDesign={setUseNewDesign}
                  showChannelNumbers={showChannelNumbers}
                />
              )}
              {displayTab === "Package" && (
                <TVContent 
                  mode="realm"
                  active={activeChannel} 
                  setActive={(ch) => handleChannelSelect(ch, true)} 
                  isDark={isDark} 
                  favorites={favorites} 
                  toggleFavorite={toggleFavorite} 
                  user={user}
                  onLogin={handleLogin}
                  isDev={isDev}
                  liquidGlass={liquidGlass}
                  sortOrder={sortOrder}
                  setSortOrder={setSortOrder}
                  showSplash={showSplash}
                  featureFlags={featureFlags}
                  searchQuery={searchQuery}
                  bypassed={bypassed}
                  setIsPlayerInView={setIsPlayerInView}
                  loadingTreatment={loadingTreatment}
                  currentTime={currentTime}
                  onChannelContextMenu={onChannelContextMenu}
                  pinnedChannels={pinnedChannels}
                  togglePinChannel={togglePinChannel}
                  isTopBarVisible={isTopBarVisible}
                  useNewDesign={useNewDesign}
                  setUseNewDesign={setUseNewDesign}
                  showChannelNumbers={showChannelNumbers}
                />
              )}
              {displayTab === "Experiments" && (
                <ExperimentalContent 
                  isDark={isDark} 
                  featureFlags={featureFlags} 
                  setFeatureFlags={setFeatureFlags} 
                  liquidGlass={liquidGlass} 
                  loadingTreatment={loadingTreatment}
                  setLoadingTreatment={setLoadingTreatment}
                />
              )}
              {displayTab === "Settings (new)" && (
                <div id="settings-tab-container-main" className="flex-1 w-full h-full min-h-[500px] flex flex-col overflow-hidden">
                  <div className="w-full h-full max-w-6xl mx-auto flex flex-col overflow-hidden">
                    <SettingsNew
                      isDark={isDark} 
                      setIsDark={setIsDark} 
                      isDev={isDev} 
                      setIsDev={setIsDev} 
                      featureFlags={featureFlags}
                      setFeatureFlags={setFeatureFlags}
                      liquidGlass={liquidGlass} 
                      setLiquidGlass={setLiquidGlass}
                      liquidGlassBlur={liquidGlassBlur}
                      setLiquidGlassBlur={setLiquidGlassBlur}
                      liquidGlassOpacity={liquidGlassOpacity}
                      setLiquidGlassOpacity={setLiquidGlassOpacity}
                      useSidebar={useSidebar}
                      setUseSidebar={setUseSidebar}
                      isSidebarRight={isSidebarRight}
                      setIsSidebarRight={setIsSidebarRight}
                      isSidebarLocked={isSidebarLocked}
                      setIsSidebarLocked={setIsSidebarLocked}
                      isPinningEnabled={isPinningEnabled}
                      setIsPinningEnabled={setIsPinningEnabled}
                      user={user}
                      userData={userData}
                      setUserData={setUserData}
                      onAlert={onAlert}
                      onLogin={handleLogin}
                      onLogout={handleLogout}
                      favorites={favorites}
                      tempUnit={tempUnit}
                      setTempUnit={setTempUnit}
                      location={location}
                      setLocation={setLocation}
                      timeFormat={timeFormat}
                      setTimeFormat={setTimeFormat}
                      clockFormat={clockFormat}
                      setClockFormat={setClockFormat}
                      dateFormat={dateFormat}
                      setDateFormat={setDateFormat}
                      showClock={showClock}
                      setShowClock={setShowClock}
                      showDate={showDate}
                      setShowDate={setShowDate}
                      showTempInClock={showTempInClock}
                      setShowTempInClock={setShowTempInClock}
                      isTouchInterface={isTouchInterface}
                      setIsTouchInterface={setIsTouchInterface}
                      sidebarQuickAccess={sidebarQuickAccess}
                      setSidebarQuickAccess={setSidebarQuickAccess}
                      locationDetection={locationDetection}
                      setLocationDetection={setLocationDetection}
                      timeZone={timeZone}
                      setTimeZone={setTimeZone}
                      maxToolbarTabs={maxToolbarTabs}
                      setMaxToolbarTabs={setMaxToolbarTabs}
                      toastDuration={toastDuration}
                      setToastDuration={setToastDuration}
                      toastMode={toastMode}
                      setToastMode={setToastMode}
                      setActiveTab={setActiveTab}
                      settingsActivePage={settingsActivePage}
                      setSettingsActivePage={setSettingsActivePage}
                      floatyBars={floatyBars}
                      setFloatyBars={setFloatyBars}
                      showChannelNumbers={showChannelNumbers}
                      setShowChannelNumbers={setShowChannelNumbers}
                    />
                  </div>
                </div>
              )}
              {displayTab === "Update Logs" && (
                <UpdateLogsContent isDark={isDark} onBack={() => handleOpenSettings()} featureFlags={featureFlags} loadingTreatment={loadingTreatment} handleOpenSettings={handleOpenSettings} />
              )}
              {displayTab === "Quản trị" && isAdmin && <AdminContent isDark={isDark} liquidGlass={liquidGlass} />}
          </motion.div>
        </div>
      </div>
      
      {/* Sidebar Redesign */}
      <AnimatePresence>
        {useSidebar && !showSplash && (
          <>
            {/* Mobile Hamburger Toggle */}
            {isMobile && !isSidebarExpanded && (
              <motion.button
                initial={{ opacity: 0, scale: 0.5 }}
                animate={{ opacity: 1, scale: 1 }}
                exit={{ opacity: 0, scale: 0.5 }}
                onClick={() => setIsSidebarExpanded(true)}
                className={`fixed top-6 z-[51] p-3.5 rounded-2xl shadow-2xl transition-all active:scale-95 ${
                  isSidebarRight ? "right-6" : "left-6"
                } ${
                  isDark ? "bg-vplay-sidebar text-white border border-white/10" : "bg-white text-slate-800 border border-slate-200"
                }`}
              >
                <Menu size={24} />
              </motion.button>
            )}

            {/* Mobile Backdrop Overlay */}
            {isMobile && isSidebarExpanded && (
              <motion.div 
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
                onClick={() => setIsSidebarExpanded(false)}
                className="fixed inset-0 bg-black/60 backdrop-blur-sm z-[48]"
              />
            )}
            
            <motion.div
              onContextMenu={handleGlobalContextMenu}
              initial={{ x: isSidebarRight ? sidebarWidth : -sidebarWidth }}
              animate={{ 
                x: 0, 
                width: isSidebarExpanded ? (isCompactMode ? 100 : sidebarWidth) : (isMobile ? "100%" : 80),
                opacity: (isMobile && !isSidebarExpanded) ? 0 : 1,
                visibility: (isMobile && !isSidebarExpanded) ? "hidden" : "visible" as any,
                scale: navBounce ? 0.97 : 1
              }}
              exit={{ x: isSidebarRight ? sidebarWidth : -sidebarWidth }}
              transition={{
                scale: { type: "spring", stiffness: 450, damping: 14 },
                default: { type: "spring", damping: 30, stiffness: 300 }
              }}
              className={`fixed z-[120] flex flex-col transition-all duration-300 overflow-visible border ${
                isMobile
                  ? (isSidebarRight ? "right-0" : "left-0")
                  : (!floatyBars ? (isSidebarRight ? "right-3 md:right-4" : "left-3 md:left-4") : (isSidebarRight ? "right-0" : "left-0"))
              } ${
                isMobile 
                  ? `${headingBar ? "top-14 h-[calc(100%-56px)]" : "top-0 h-full"} !rounded-none !m-0 !left-0 !right-0 transition-none border-none` 
                  : !floatyBars 
                    ? `h-[calc(100vh-24px)] ${headingBar ? "top-[76px] h-[calc(100vh-88px)]" : "top-3"} rounded-2xl`
                    : `top-0 h-full ${headingBar ? "pt-14" : ""} border-y-0 rounded-none shadow-2xl`
              } ${
                isDark 
                  ? `text-white ${!floatyBars && !isMobile ? "border-white/10 bg-[#181818]/60" : "bg-[#181818]/70 border-white/5 backdrop-blur-[3px]"}` 
                  : `text-slate-800 ${!floatyBars && !isMobile ? "border-slate-200/30 bg-white/60" : "bg-white/70 border-slate-200/40 backdrop-blur-[3px]"}`
              }`}
              style={{ 
                background: !floatyBars && !isMobile 
                  ? (isDark ? "rgba(24, 24, 24, 0.60)" : "rgba(255, 255, 255, 0.60)")
                  : (isDark ? "rgba(24, 24, 24, 0.72)" : "rgba(255, 255, 255, 0.72)"),
                backdropFilter: "blur(12px)",
                WebkitBackdropFilter: "blur(12px)",
                boxShadow: !floatyBars && !isMobile
                  ? (isDark 
                      ? "0 8px 30px rgba(0,0,0,0.16), inset 0 1px 2px rgba(255,255,255,0.15)" 
                      : "0 8px 30px rgba(0,0,0,0.05), inset 0 1px 2px rgba(255,255,255,0.3)")
                  : undefined
              }}
            >
              {/* Resize Handle */}
              {!isSidebarLocked && !isMobile && isSidebarExpanded && (
                <div
                  onMouseDown={() => {
                    isResizing.current = true;
                    document.body.style.cursor = 'col-resize';
                  }}
                  className={`absolute top-0 bottom-0 w-1.5 cursor-col-resize z-[60] transition-colors hover:bg-[#4AC4FE]/30 ${
                    isSidebarRight ? "-left-0.5" : "-right-0.5"
                  }`}
                />
              )}

              {/* Logo & Hamburger Section */}
              {!headingBar && (
                <div className={`p-6 ${isCompactMode ? "px-2" : ""}`}>
                  <div className={`flex items-center gap-4 h-12 ${!isSidebarExpanded || isCompactMode ? "justify-center" : ""}`}>
                    <AnimatePresence mode="wait">
                      {!isSidebarExpanded || isCompactMode ? (
                        <Tooltip text="Thu gọn/Mở rộng sidebar" isDark={isDark} position={isSidebarRight ? "left" : "right"} disabled={isSidebarExpanded && !isCompactMode}>
                          <motion.button 
                            key="collapsed-logo"
                            initial={{ opacity: 0, scale: 0.8 }}
                            animate={{ opacity: 1, scale: 1 }}
                            exit={{ opacity: 0, scale: 0.8 }}
                            onClick={() => {
                                triggerNavBounce();
                                if (isCompactMode) {
                                    setIsSidebarExpanded(!isSidebarExpanded);
                                } else {
                                    setIsSidebarExpanded(true);
                                }
                            }}
                            className="w-10 h-10 flex items-center justify-center transition-all group overflow-hidden relative"
                          >
                            <img 
                              src="https://static.wikia.nocookie.net/ftv/images/a/a6/Imagedskvjndkv.png/revision/latest?cb=20260430103502&path-prefix=vi" 
                              alt="Vplay" 
                              className="w-8 h-8 object-contain drop-shadow-lg group-hover:scale-110 transition-transform" 
                              referrerPolicy="no-referrer"
                            />
                          </motion.button>
                        </Tooltip>
                      ) : (
                        <motion.div 
                          key="expanded-logo"
                          initial={{ opacity: 0, x: -10 }}
                          animate={{ opacity: 1, x: 0 }}
                          exit={{ opacity: 0, x: -10 }}
                          className="flex items-center gap-4 w-full"
                        >
                          <Tooltip text="Thu gọn/Mở rộng sidebar" isDark={isDark} position={isSidebarRight ? "left" : "right"} disabled={isSidebarExpanded}>
                            <button 
                              onClick={() => {
                                triggerNavBounce();
                                setIsSidebarExpanded(false);
                              }}
                              className={`p-2 rounded-xl transition-all ${isDark ? "hover:bg-white/10 text-white" : "hover:bg-black/5 text-black"}`}
                            >
                              <Menu size={28} />
                            </button>
                          </Tooltip>
                          <div className="flex items-center">
                            <img 
                              src="https://static.wikia.nocookie.net/ftv/images/a/a6/Imagedskvjndkv.png/revision/latest?cb=20260430103502&path-prefix=vi" 
                              alt="Vplay" 
                              className="h-8 w-8 object-contain drop-shadow-md"
                              referrerPolicy="no-referrer"
                            />
                          </div>
                        </motion.div>
                      )}
                    </AnimatePresence>
                  </div>
                </div>
              )}

              {/* Integrated Search Bar removed as per user request (already has Explore tab) */}
              <div className="mb-4" />

              {isSidebarExpanded && !isCompactMode && user && (
                <div className={`mx-4 mb-6 p-4 rounded-2xl flex items-center gap-3 transition-all ${isDark ? "bg-white/5 border border-white/5" : "bg-white border border-slate-200"}`}>
                   <div className="relative">
                      <div className={`w-10 h-10 rounded-full flex items-center justify-center border ${
                         isDark 
                           ? "bg-[#4AC4FE]/10 border-[#4AC4FE]/25 text-[#4AC4FE]" 
                           : "bg-[#4AC4FE]/10 border-[#4AC4FE]/35 text-[#0284c7]"
                       }`}>
                          <User size={18} />
                       </div>
                      <div className="absolute -bottom-1 -right-1 w-4 h-4 rounded-full bg-emerald-500 border-2 border-[#0a0118]" />
                   </div>
                   <div className="flex-1 overflow-hidden">
                      <p className={`text-xs font-bold truncate ${isDark ? "text-white" : "text-slate-900"}`}>{user.displayName || name || "User"}</p>
                      <p className={`text-[9px] font-medium opacity-40 truncate ${isDark ? "text-white" : "text-slate-900"}`}>{user.email || "Offline profile"}</p>
                   </div>
                </div>
              )}

              {/* Navigation Items */}
              <div className={`flex-1 px-3 space-y-1 overflow-y-auto ${isCompactMode && isSidebarExpanded ? "no-scrollbar px-1.5 flex flex-col items-center" : "custom-scrollbar"}`}>
                {tabs.map((tab, idx) => {
                  const Icon = tab.icon;
                  const isCompact = isCompactMode && isSidebarExpanded;
                  const isActive = activeTab === (tab.id || tab.name) || 
                                   (tab.id === "Widgets" && isWidgetsOpen && activeDashboardTab === "widgets") ||
                                   (tab.id === "Cài đặt" && isWidgetsOpen && activeDashboardTab === "settings");
                  const isLiveTab = (tab.id || tab.name) === "Live";
                  const activeColorClass = isLiveTab ? "text-red-500" : "text-[#4AC4FE]";
                  const activeBgClass = isLiveTab 
                    ? (isDark ? "bg-red-500/10 text-red-500 border border-red-500/20" : "bg-red-500/10 text-red-500 shadow-sm") 
                    : (isDark ? "bg-white/10 text-[#4AC4FE]" : "bg-black/5 text-[#4AC4FE] shadow-sm");
                  
                  if ((tab.id || tab.name) === "Tìm kiếm" && isSidebarExpanded && !isCompact) {
                    return (
                      <div key={`side-nav-${tab.id || tab.name}-${idx}`} className="px-1.5 py-1 relative">
                        <div className={`relative flex items-center gap-2.5 px-3.5 py-1.5 h-10 w-full group rounded-full cursor-pointer transform transition-all duration-300 hover:scale-[1.06] hover:-translate-y-0.5 active:scale-[0.96] active:translate-y-0 focus-within:scale-[1.06] focus-within:-translate-y-0.5 ${
                          liquidGlass === "glassy"
                            ? "bg-white/10 text-white shadow-[0_4px_10px_rgba(0,0,0,0.15),_inset_0_1.5px_2.5px_rgba(255,255,255,0.2)] border border-white/10 focus-within:shadow-[0_8px_20px_rgba(74,196,254,0.35)]" 
                            : isDark 
                              ? "bg-slate-800/55 text-white shadow-[0_3px_8px_rgba(0,0,0,0.2),_inset_0_1.5px_2px_rgba(255,255,255,0.12)] border border-white/10 focus-within:shadow-[0_8px_20px_rgba(74,196,254,0.35)]" 
                              : "bg-slate-100/90 text-slate-900 shadow-[0_3px_8px_rgba(0,0,0,0.06),_inset_0_1.5px_2px_rgba(255,255,255,0.4)] border border-slate-300/40 focus-within:shadow-[0_8px_20px_rgba(74,196,254,0.25)]"
                        }`}>
                          <SearchCustomIcon size={14} className={`shrink-0 transition-all ${
                            isSearchFocused ? "scale-110" : ""
                          }`} />
                          <input
                            type="text"
                            placeholder="Tìm kiếm kênh..."
                            value={searchQuery}
                            onFocus={() => setIsSearchFocused(true)}
                            onBlur={() => setTimeout(() => setIsSearchFocused(false), 250)}
                            onChange={(e) => setSearchQuery(e.target.value)}
                            className={`bg-transparent border-none outline-none text-xs w-full font-bold font-google ${
                              liquidGlass === "glassy" ? "text-white placeholder-white/40" : isDark ? "text-white placeholder-slate-500" : "text-slate-900 placeholder-black/40"
                            }`}
                          />
                        </div>

                        {/* Floating sidebar search results overlay */}
                        <AnimatePresence>
                          {isSearchFocused && searchQuery.trim().length > 0 && (
                            <motion.div 
                              initial={{ opacity: 0, scale: 0.95 }}
                              animate={{ opacity: 1, scale: 1 }}
                              exit={{ opacity: 0, scale: 0.95 }}
                              className={`absolute ${isSidebarRight ? "right-[105%]" : "left-[105%]"} top-0 min-w-[280px] max-w-[320px] max-h-80 overflow-y-auto rounded-[24px] shadow-2xl border p-2 flex flex-col gap-1.5 z-[300] ${
                                isDark ? "bg-[#181924]/95 border-white/10 text-white backdrop-blur-xl" : "bg-white/95 border-slate-200 text-slate-800 backdrop-blur-xl"
                              }`}
                            >
                              <div className="text-[10px] uppercase font-bold px-3 py-1 tracking-widest text-[#4AC4FE]">
                                Kênh kết quả ({searchResults.length})
                              </div>
                              {searchResults.slice(0, 10).map((ch, sIdx) => (
                                <button
                                  key={`sidebar-inline-search-res-${ch.name}-${sIdx}`}
                                  onMouseDown={() => {
                                    setActiveChannel(ch);
                                    setActiveTab("Live");
                                    setIsSearchFocused(false);
                                  }}
                                  className={`w-full text-left flex items-center gap-3 p-2 rounded-2xl transition-all ${
                                    isDark ? "hover:bg-white/5 text-slate-300 hover:text-white" : "hover:bg-slate-100 text-slate-700 hover:text-slate-900"
                                  }`}
                                >
                                  <img src={ch.logo} className="w-8 h-8 rounded-lg object-contain bg-slate-50 p-1 shrink-0" referrerPolicy="no-referrer" />
                                  <div className="flex-1 min-w-0">
                                    <p className="text-xs font-bold truncate">{ch.name}</p>
                                    <span className="text-[9px] opacity-60 uppercase font-black tracking-wider">{ch.category}</span>
                                  </div>
                                </button>
                              ))}
                              {searchResults.length === 0 && (
                                <div className="p-4 text-center text-xs opacity-50 font-bold">
                                  Không tìm thấy kết quả
                                </div>
                              )}
                            </motion.div>
                          )}
                        </AnimatePresence>
                      </div>
                    );
                  }

                  return (
                    <Tooltip key={`side-nav-${tab.id || tab.name}-${idx}`} text={tab.name} isDark={isDark} position={isSidebarRight ? "left" : "right"} disabled={isSidebarExpanded && !isCompactMode}>
                      <button
                        onClick={() => {
                          triggerNavBounce();
                          if (tab.id === "Widgets") {
                            setIsWidgetsOpen(true);
                            setActiveDashboardTab("widgets");
                            if (isMobile) setIsSidebarExpanded(false);
                            return;
                          }
                          if (tab.id === "Cài đặt") {
                            handleSettingsTabClick();
                            if (featureFlags.settings_in_widgets) {
                              setIsWidgetsOpen(true);
                              setActiveDashboardTab("settings");
                            } else {
                              setActiveTab("Cài đặt");
                            }
                            if (isMobile) setIsSidebarExpanded(false);
                            return;
                          }
                          if (tab.id === "Experimental") {
                            setActiveTab("Experiments");
                            if (isMobile) setIsSidebarExpanded(false);
                            return;
                          }
                          if (tab.id === "Live" && isBroadcastingLocked) {
                            setIsLockModalOpen(true);
                            return;
                          }
                          setActiveTab(tab.id || tab.name);
                          if (isMobile) setIsSidebarExpanded(false);
                        }}
                        className={`transition-all relative group overflow-hidden ${
                          isCompact 
                            ? "flex-col items-center justify-center h-[80px] w-20 rounded-2xl gap-1.5 mb-1 px-1"
                            : `w-full items-center gap-4 px-4 py-2 rounded-xl h-[44px] ${!isSidebarExpanded ? "justify-center" : ""}`
                        } ${
                          isActive 
                            ? activeBgClass 
                            : (isDark ? "text-white/60 hover:text-white hover:bg-white/5" : "text-black/60 hover:text-black hover:bg-black/5")
                        } flex select-none cursor-default`}
                      >
                        {isActive && (
                          <motion.div 
                            layoutId="sidebarActivePill"
                            className={isCompact
                                ? `absolute left-0 top-1/2 -translate-y-1/2 w-[4px] h-6 ${isLiveTab ? "bg-red-500 shadow-[0_0_12px_rgba(239,68,68,0.8)]" : "bg-[#4AC4FE] shadow-[0_0_12px_rgba(232,121,249,0.8)]"} rounded-full`
                                : `absolute left-0 top-1/2 -translate-y-1/2 w-[4px] h-4 ${isLiveTab ? "bg-red-500 shadow-[0_0_12px_rgba(239,68,68,0.8)]" : "bg-[#4AC4FE] shadow-[0_0_12px_rgba(232,121,249,0.8)]"} rounded-full`
                            }
                          />
                        )}
                        <div className="relative">
                          {TAB_ICON_URLS[tab.id || tab.name] ? (
                            <img 
                              src={TAB_ICON_URLS[tab.id || tab.name]} 
                              alt={tab.name} 
                              className={`flex-shrink-0 transition-transform ${isCompact ? "h-7 w-7" : "h-5 w-5"} object-contain group-hover:scale-110`} 
                              referrerPolicy="no-referrer"
                            />
                          ) : (
                            <Icon size={isCompact ? (isActive ? 30 : 24) : 20} strokeWidth={tab.id === "Experimental" ? 1 : 1.5} className={`flex-shrink-0 transition-all ${isActive ? activeColorClass : (isDark ? "text-white/70" : "text-slate-600")} group-hover:scale-110`} />
                          )}
                          {tab.id === "Cài đặt" && !user && (
                            <div className="absolute -top-1.5 -right-1.5 w-3.5 h-3.5 bg-amber-500 text-slate-950 rounded-full flex items-center justify-center text-[9px] font-black shadow-md border border-slate-900 animate-pulse">
                              !
                            </div>
                          )}
                        </div>
                        {(isSidebarExpanded && !isCompactMode) && (
                          <span className={`font-medium text-sm whitespace-nowrap ${isActive ? `font-bold ${activeColorClass}` : ""}`}>{tab.name}</span>
                        )}
                        {(isCompact) && (
                          <span className={`text-[10px] text-center leading-tight truncate w-full ${isActive ? `font-bold ${activeColorClass}` : "font-medium opacity-60"}`}>{tab.name}</span>
                        )}
                      </button>
                    </Tooltip>
                  );
                })}

                {/* Channel Pinning Section */}
                {isPinningEnabled && sidebarQuickAccess && favorites.length > 0 && (
                  <div className="pt-4 pb-2">
                    <div className={`h-px mx-3 mb-4 ${isDark ? "bg-white/5" : "bg-slate-100"}`} />
                    {isSidebarExpanded && !isCompactMode && (
                      <span className="px-5 text-[10px] font-bold text-slate-500 uppercase tracking-widest block mb-2">Ghim Kênh</span>
                    )}
                    <div className={`space-y-1 ${isCompactMode && isSidebarExpanded ? "flex flex-col items-center" : ""}`}>
                      {Array.from(new Set(favorites)).map(favId => {
                        const channel = channels.find(c => c.name === favId);
                        if (!channel) return null;
                        const isCompact = isCompactMode && isSidebarExpanded;
                        return (
                          <button
                            key={`side-pin-${favId}`}
                            onClick={() => {
                              setActiveTab("Live");
                              setActiveChannel(channel);
                              if (isMobile) setIsSidebarExpanded(false);
                            }}
                            className={`w-full flex transition-all group ${
                                isCompact
                                    ? "flex-col items-center justify-center h-[72px] rounded-2xl gap-1 mb-2"
                                    : `items-center gap-3 px-3 py-2 rounded-lg h-[44px] ${!isSidebarExpanded ? "justify-center" : ""}`
                            } ${
                              isDark ? "text-white/60 hover:text-white hover:bg-white/5" : "text-black hover:bg-black/5"
                            }`}
                          >
                            <img 
                              src={channel.logo} 
                              alt={channel.name}
                              className={`${isCompact ? "w-8 h-8" : "w-6 h-6"} object-contain transition-transform group-hover:scale-110 ${!isDark ? "bg-white rounded-md shadow-sm border border-slate-100 p-0.5" : ""}`}
                              referrerPolicy="no-referrer"
                            />
                            {isSidebarExpanded && !isCompactMode && (
                              <span className="font-normal text-sm whitespace-nowrap overflow-hidden text-ellipsis">{channel.name}</span>
                            )}
                            {isCompact && (
                                <span className="text-[10px] font-bold text-center leading-tight truncate w-full">{channel.name}</span>
                            )}
                          </button>
                        );
                      })}
                    </div>
                  </div>
                )}
              </div>

              {/* Footer Section */}
              <div className={`p-6 mt-auto space-y-4 border-t ${isDark ? "border-white/5" : "border-slate-100"}`}>
                {isSidebarExpanded && !headingBar && (
                  <div className="flex flex-col gap-4 mb-2">
                    <div className="flex flex-col">
                      <div className="flex items-baseline gap-3">
                        <div className={`text-2xl font-bold tracking-tighter font-mono ${isDark ? "text-white" : "text-slate-900"}`}>
                          {formatTime(currentTime || new Date())}
                        </div>
                        {showTempInClock && weather && <div className={`w-[1px] h-3 self-center ${isDark ? "bg-white/10" : "bg-slate-300"} mx-1`} />}
                        {showTempInClock && weather && (
                          <div className={`text-sm font-bold flex items-center gap-1.5 self-center ${isDark ? "text-yellow-400" : "text-yellow-500"}`}>
                            <Thermometer size={14} strokeWidth={1.5} />
                            {getTempDisplay()}
                          </div>
                        )}
                      </div>
                      <div className="flex items-center gap-2">
                        <div className={`text-[10px] font-bold uppercase tracking-tight ${isDark ? "text-white/40" : "text-slate-500"}`}>
                          {formatDateString(currentTime || new Date())}
                        </div>
                      </div>
                    </div>
                  </div>
                )}
              </div>
            </motion.div>
          </>
        )}
      </AnimatePresence>

      <div className={`fixed z-50 transition-all duration-500 pointer-events-none ${
        useSidebar 
          ? "bottom-[-100%] opacity-0" 
          : isNavVisible 
            ? "bottom-3 left-0 w-full flex justify-center"
            : "bottom-[-140px] left-0 w-full flex justify-center opacity-0"
      }`}
      onContextMenu={handleGlobalContextMenu}
      >
        <motion.div 
          initial={{ y: 100, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          className="flex flex-col items-center gap-0 pointer-events-auto w-full max-w-lg px-4"
        >
          <motion.nav 
            key="bottom-nav-stable"
            initial={{ scale: 1 }}
            animate={{ scale: 1 }}
            onTouchStart={handleNavTouchStart}
            onTouchEnd={handleNavTouchEnd}
            className="flex-1 w-full flex items-center justify-between p-1 h-11 md:h-13 transform transition-all duration-500 hover:scale-[1.01] hover:-translate-y-px active:scale-[0.995] ease-out overflow-hidden relative rounded-full border shadow-[0_12px_32px_rgba(0,0,0,0.15),_inset_0_1px_1.5px_rgba(255,255,255,0.15)] border-white/12"
            style={{
              backdropFilter: "blur(20px)",
              WebkitBackdropFilter: "blur(20px)",
              backgroundColor: "rgba(255, 255, 255, 0.30)"
            }}>
            
            {/* Prev Arrow - Only shown on desktop as mobile uses gestures */}
            {!isMobile && (
              <button 
                onClick={() => {
                  triggerNavBounce();
                  const addPages = Math.ceil(pinnedChannels.length / maxToolbarTabs);
                  const totPages = 3 + addPages;
                  setSlideDirection(-1);
                  setNavPage((prev) => (prev - 1 + totPages) % totPages);
                }}
                className={`p-1.5 rounded-full hover:bg-black/5 transition-colors z-20 ${isDark ? "text-white/40" : "text-black/40"}`}
              >
                <ChevronLeft size={20} />
              </button>
            )}

            <div className="flex-1 overflow-hidden relative h-10 flex items-center justify-center w-full">
              <AnimatePresence initial={false}>
                <motion.div
                  key={`nav-page-${navPage}`}
                  initial={{ x: slideDirection * 160, opacity: 0 }}
                  animate={{ x: 0, opacity: 1 }}
                  exit={{ x: -slideDirection * 160, opacity: 0, position: "absolute", transition: { duration: 0.12 } }}
                  transition={{ type: "spring", damping: 28, stiffness: 350 }}
                  className="absolute inset-x-0 top-0 bottom-0 flex items-center justify-around w-full h-full px-4"
                >
                  {navPage === 0 && (
                    <>
                      {baseTabs.filter(t => ["Trang chủ", "Live", "Package", "Cài đặt", "Settings (new)"].includes(t.id || t.name)).map((tab) => {
                        const Icon = tab.icon;
                        const tabId = tab.id || tab.name;
                        const isActive = activeTab === tabId;
                        const isGlassy = liquidGlass === "glassy";

                        // Map tab colors individually
                        let activeColorClass = "text-slate-950 font-black scale-102";

                        return (
                          <div key={`mob-nav-${tabId}`} className="flex-1 flex justify-center p-0.5">
                            <button
                              onClick={() => {
                                triggerNavBounce();
                                if (tabId === "Live" && isBroadcastingLocked) {
                                  setIsLockModalOpen(true);
                                  return;
                                }
                                if (tabId === "Cài đặt" || tabId === "Settings (new)") {
                                  handleSettingsTabClick();
                                }
                                setActiveTab(tabId);
                              }}
                              className={`relative flex flex-col items-center justify-center px-1.5 py-0 h-8 md:h-9.5 rounded-full transition-all duration-300 group z-10 w-full ${
                                isActive 
                                  ? activeColorClass
                                  : isGlassy ? "text-white/70 hover:text-white" : liquidGlass === "tinted" ? "text-black hover:opacity-100 opacity-60" : isDark ? "text-slate-400 hover:text-white" : "text-black/80 hover:text-black"
                              }`}
                            >
                               {isActive && (
                                <motion.div
                                  layoutId="activeTabPill"
                                  className="absolute inset-0 rounded-full z-0 pointer-events-none shadow-sm"
                                  style={{
                                    backgroundColor: "rgba(255, 255, 255, 0.30)",
                                    backdropFilter: "blur(12px)",
                                    WebkitBackdropFilter: "blur(12px)"
                                  }}
                                  transition={{ type: "spring", stiffness: 480, damping: 28 }}
                                />
                              )}
                              <motion.div
                                animate={isActive ? { scale: 1.08 } : { scale: 1 }}
                                whileTap={{ scale: 0.8 }}
                                transition={
                                  isActive
                                    ? {
                                        type: "spring",
                                        stiffness: 420,
                                        damping: 12,
                                        mass: 0.8
                                      }
                                    : {
                                        type: "spring",
                                        stiffness: 300,
                                        damping: 20
                                      }
                                }
                                className="z-10 relative flex items-center justify-center"
                              >
                                <Icon 
                                  size={20}
                                  className={`h-5.5 w-5.5 flex-shrink-0 transition-colors duration-300 ${
                                    isActive 
                                      ? "text-black drop-shadow-[0_1px_1px_rgba(0,0,0,0.12)] stroke-[1.8px]" 
                                      : "text-black"
                                  }`} 
                                />
                                {tabId === "Cài đặt" && !user && (
                                  <div className="absolute -top-1 -right-1.5 w-3 h-3 bg-amber-500 text-slate-950 rounded-full flex items-center justify-center text-[8px] font-extrabold shadow-md border border-slate-900 animate-pulse z-20">
                                    !
                                  </div>
                                )}
                              </motion.div>
                            </button>
                          </div>
                        );
                      })}
                    </>
                  )}

                  {navPage === 1 && (
                    <div className="flex w-full items-center gap-2 px-2.5 h-full relative">
                      {/* Search box overlay for results */}
                      <AnimatePresence>
                        {isSearchFocused && searchQuery.trim().length > 0 && (
                          <motion.div 
                            initial={{ opacity: 0, y: 15 }}
                            animate={{ opacity: 1, y: 0 }}
                            exit={{ opacity: 0, y: 15 }}
                            className={`absolute left-0 right-0 bottom-[120%] mb-2 z-[200] max-h-72 overflow-y-auto rounded-3xl shadow-2xl border p-2 flex flex-col gap-1.5 ${
                              isDark ? "bg-[#181924]/95 border-white/10 text-white backdrop-blur-xl" : "bg-white/95 border-slate-200 text-slate-800 backdrop-blur-xl"
                            }`}
                          >
                            <div className="text-[9px] uppercase font-bold px-2 py-1 tracking-widest text-[#4AC4FE]">
                              Kênh kết quả ({searchResults.length})
                            </div>
                            {searchResults.slice(0, 10).map((ch, idx) => (
                              <button
                                key={`mob-inline-search-res-${ch.name}-${idx}`}
                                onMouseDown={() => {
                                  setActiveChannel(ch);
                                  setActiveTab("Live");
                                  setIsSearchFocused(false);
                                }}
                                className={`w-full text-left flex items-center gap-3 p-2 rounded-2xl transition-all ${
                                  isDark ? "hover:bg-white/5 text-slate-300 hover:text-white" : "hover:bg-slate-100 text-slate-705 hover:text-slate-900"
                                }`}
                              >
                                <img src={ch.logo} className="w-8 h-8 rounded-lg object-contain bg-slate-50 p-1 shrink-0" referrerPolicy="no-referrer" />
                                <div className="flex-1 min-w-0">
                                  <p className="text-xs font-bold truncate">{ch.name}</p>
                                  <span className="text-[9px] opacity-60 uppercase font-black tracking-wider">{ch.category}</span>
                                </div>
                              </button>
                            ))}
                            {searchResults.length === 0 && (
                              <div className="p-4 text-center text-xs opacity-50 font-bold">
                                Không tìm thấy kết quả
                              </div>
                            )}
                          </motion.div>
                        )}
                      </AnimatePresence>

                      <div className="flex-1 flex items-center justify-center">
                        <div className={`relative flex items-center gap-2.5 px-4 py-1.5 h-10 w-full group rounded-full border cursor-pointer transform transition-all duration-300 hover:scale-[1.04] hover:-translate-y-0.5 active:scale-[0.98] active:translate-y-0 ${
                          liquidGlass === "glassy"
                            ? "bg-white/10 border-white/5 text-white shadow-[0_4px_12px_rgba(0,0,0,0.15),_inset_0_1.5px_2.5px_rgba(255,255,255,0.2)] focus-within:shadow-[0_8px_24px_rgba(74,196,254,0.35)]" 
                            : isDark 
                              ? "bg-slate-800/55 border-white/5 text-white shadow-[0_4px_12px_rgba(0,0,0,0.2),_inset_0_1.5px_2.5px_rgba(255,255,255,0.12)] focus-within:shadow-[0_8px_24px_rgba(74,196,254,0.35)]" 
                              : "bg-slate-100 border-slate-300/20 text-slate-900 shadow-[0_4px_10px_rgba(0,0,0,0.06),_inset_0_1.5px_2px_rgba(255,255,255,0.4)] focus-within:shadow-[0_8px_20px_rgba(74,196,254,0.25)]"
                        }`}>
                          <SearchCustomIcon size={20} className={`shrink-0 transition-all ${
                            isSearchFocused ? "scale-110" : ""
                          }`} />
                          <input
                            type="text"
                            placeholder={
                              isListening 
                                ? "Đang nghe... Hãy nói đi" 
                                : isListeningFailed 
                                  ? "Gặp lỗi, chạm để thử lại"
                                  : activeTab === "Trang chủ" 
                                    ? "Tìm ở Trang chủ..." 
                                    : activeTab === "Live" 
                                      ? "Tìm kênh Live..." 
                                      : activeTab === "Khám phá" 
                                        ? "Khám phá nội dung..." 
                                        : activeTab === "Cài đặt" 
                                          ? "Tìm cài đặt..." 
                                          : "Tìm kiếm ..."
                            }
                            value={searchQuery}
                            onFocus={() => setIsSearchFocused(true)}
                            onBlur={() => setTimeout(() => setIsSearchFocused(false), 250)}
                            onChange={(e) => setSearchQuery(e.target.value)}
                            className={`bg-transparent border-none outline-none text-xs w-full font-bold font-google ${
                              liquidGlass === "glassy" ? "text-white placeholder-white/40" : isDark ? "text-white placeholder-slate-500" : "text-slate-900 placeholder-black/40"
                            }`}
                          />
                          <button
                            onClick={handleStartListening}
                            className={`p-1 rounded-full transition-all shrink-0 ${
                              isListening 
                                ? "text-red-500 animate-pulse bg-red-500/15" 
                                : (isDark ? "text-white/40 hover:text-white/80 animate-in fade-in" : "text-slate-400 hover:text-slate-800 animate-in fade-in")
                            }`}
                            title="Tìm bằng giọng nói"
                          >
                            <Mic size={14} className={isListening ? "fill-red-500" : ""} />
                          </button>
                        </div>
                      </div>

                      {isAdmin && (
                        <div className="flex-shrink-0 flex justify-center">
                          <button
                            onClick={() => setActiveTab("Quản trị")}
                            className={`p-2 rounded-full transition-all ${
                              activeTab === "Quản trị"
                                ? isDark ? "bg-[#4AC4FE]/10 text-[#4AC4FE]" : "bg-black/5 text-[#4AC4FE]"
                                : isDark ? "text-slate-400 hover:text-white" : "text-black hover:opacity-100 opacity-60"
                            }`}
                          >
                            <AdminIcon className="h-6 w-6" />
                          </button>
                        </div>
                      )}
                    </div>
                  )}

                  {navPage === 2 && (
                    <motion.div 
                      onClick={() => {
                        setIsWidgetsOpen(true);
                        setActiveDashboardTab("widgets");
                      }}
                      className="flex items-center justify-center gap-3 h-full cursor-pointer hover:opacity-85 transition-all active:scale-95"
                      initial={{ scale: 0.9, opacity: 0 }}
                      animate={{ scale: 1, opacity: 1 }}
                    >
                      {/* Clock & Date */}
                      <div className="flex flex-col items-end justify-center">
                        <div className={`text-xs md:text-sm font-extrabold tracking-tight leading-none ${isDark ? "text-white" : "text-slate-900"}`}>
                          {formatTime(currentTime || new Date())}
                        </div>
                        <div className={`text-[8.5px] font-bold tracking-wider uppercase leading-none mt-1 ${isDark ? "text-white/40" : "text-slate-500"}`}>
                          {formatDateString(currentTime || new Date())}
                        </div>
                      </div>

                      {/* Divider */}
                      {weather && (
                        <div className={`w-[1px] h-5 self-center ${isDark ? "bg-white/10" : "bg-slate-300"}`} />
                      )}

                      {/* Temperature */}
                      {weather && (
                        <div className="flex items-center gap-1">
                          <span className={`text-xs md:text-sm font-black ${isDark ? "text-[#4AC4FE]" : "text-[#4AC4FE]"}`}>
                            {getTempDisplay()}
                          </span>
                        </div>
                      )}
                    </motion.div>
                  )}

                  {navPage >= 3 && (
                    <div className="flex w-full items-center justify-around h-full px-2">
                      {pinnedChannels.slice((navPage - 3) * maxToolbarTabs, (navPage - 3) * maxToolbarTabs + maxToolbarTabs).map((channel, cIdx) => (
                        <button
                          key={`nav-pinned-channel-${channel.name}-${cIdx}`}
                          onClick={() => {
                            triggerNavBounce();
                            setActiveChannel(channel);
                            setActiveTab("Live");
                          }}
                          className="flex flex-col items-center justify-center p-1 w-14 group transition-all duration-300"
                        >
                          <div className={`w-8 h-8 rounded-full flex items-center justify-center p-1 border overflow-hidden bg-white/10 border-white/20 hover:scale-110 active:scale-95 transition-all`}>
                            <img src={channel.logo} alt={channel.name} className="w-full h-full object-contain" referrerPolicy="no-referrer" />
                          </div>
                          <span className="text-[8px] font-bold text-center truncate w-full mt-1 opacity-80 group-hover:opacity-100">
                            {channel.name}
                          </span>
                        </button>
                      ))}
                      {pinnedChannels.slice((navPage - 3) * maxToolbarTabs, (navPage - 3) * maxToolbarTabs + maxToolbarTabs).length === 0 && (
                        <span className="text-[10px] opacity-40 font-bold uppercase tracking-widest">Không có kênh ghim</span>
                      )}
                    </div>
                  )}
                </motion.div>
              </AnimatePresence>
            </div>

            {/* Next Arrow - Only shown on desktop as mobile uses gestures */}
            {!isMobile && (
              <button 
                onClick={() => {
                  triggerNavBounce();
                  const addPages = Math.ceil(pinnedChannels.length / maxToolbarTabs);
                  const totPages = 3 + addPages;
                  setSlideDirection(1);
                  setNavPage((prev) => (prev + 1) % totPages);
                }}
                className={`p-2 rounded-full hover:bg-black/5 transition-colors z-20 ${isDark ? "text-white/40" : "text-black/40"}`}
              >
                <ChevronRight size={24} />
              </button>
            )}
          </motion.nav>

          <FloatingTooltip text={hoveredTab || ""} show={!!hoveredTab} targetRect={hoveredTabRect} />
        </motion.div>
      </div>
      {activeChannel && featureFlags.PiP_experimental && !pipExplicitlyClosed && (activeTab !== "Live" || !isPlayerInView) && (
        <MiniPlayer 
          channel={activeChannel} 
          isDark={isDark} 
          onClose={() => setPipExplicitlyClosed(true)} 
          liquidGlass={liquidGlass}
        />
      )}

      {/* Floating Notification Toasts at the bottom of the screen */}
      <div className="fixed bottom-20 left-1/2 -translate-x-1/2 z-[9999] flex flex-col gap-2 w-80 max-w-[calc(100vw-2rem)] pointer-events-none">
        <AnimatePresence>
          {toasts.map((toast) => (
            <motion.div
              key={toast.id}
              initial={{ opacity: 0, y: 15, scale: 0.95 }}
              animate={{ opacity: 1, y: 0, scale: 1 }}
              exit={{ opacity: 0, y: 10, scale: 0.9, transition: { duration: 0.12 } }}
              layout
              className="pointer-events-auto px-4 py-3 rounded-2xl border flex items-start justify-between gap-3 shadow-[0_12px_32px_rgba(0,0,0,0.15),_inset_0_1px_1.5px_rgba(255,255,255,0.15)] border-white/12 text-slate-900"
              style={{
                backdropFilter: "blur(20px)",
                WebkitBackdropFilter: "blur(20px)",
                backgroundColor: "rgba(255, 255, 255, 0.30)"
              }}
            >
              <div className="flex items-start gap-2.5 min-w-0">
                <div className="shrink-0 mt-0.5">
                  {toast.type === "success" && <CheckCircle2 className="w-4 h-4 text-emerald-600" />}
                  {toast.type === "error" && <AlertCircle className="w-4 h-4 text-red-600" />}
                  {toast.type === "warning" && <Info className="w-4 h-4 text-amber-600" />}
                  {toast.type === "info" && <Info className="w-4 h-4 text-blue-600" />}
                </div>
                <div className="flex-1 text-xs font-bold leading-snug text-left break-words normal-case whitespace-normal text-slate-900">
                  {toast.message}
                </div>
              </div>
              <button
                onClick={() => setToasts(prev => prev.filter(t => t.id !== toast.id))}
                className="shrink-0 p-1 hover:bg-black/5 rounded-full transition-colors mt-0.5 text-black/40 hover:text-black"
              >
                <X className="w-3.5 h-3.5" />
              </button>
            </motion.div>
          ))}
        </AnimatePresence>
      </div>
    </div>
  </MotionConfig>
);
}

export default App;
