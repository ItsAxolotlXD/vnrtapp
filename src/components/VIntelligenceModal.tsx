import React, { useState, useEffect, useRef } from "react";
import { motion, AnimatePresence } from "motion/react";
import { Brain, X, Send, Sparkles, Bot, Clock, RotateCcw } from "lucide-react";

interface Message {
  role: "user" | "assistant";
  content: string;
  time: string;
}

interface VIntelligenceModalProps {
  isOpen: boolean;
  onClose: () => void;
  isDark: boolean;
}

export default function VIntelligenceModal({ isOpen, onClose, isDark }: VIntelligenceModalProps) {
  const [messages, setMessages] = useState<Message[]>([
    {
      role: "assistant",
      content: "Xin chào! Tôi là **V-Intelligence** - Trợ lý Trí tuệ Nhân tạo thế hệ mới của Vplay, tích hợp trực tiếp từ Google Gemini.\n\nTôi có thể hỗ trợ gì cho trải nghiệm xem truyền hình và giải trí của bạn hôm nay?",
      time: new Date().toLocaleTimeString("vi-VN", { hour: "2-digit", minute: "2-digit" }),
    },
  ]);
  const [inputMsg, setInputMsg] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const scrollRef = useRef<HTMLDivElement>(null);

  // Auto scroll to bottom
  useEffect(() => {
    if (scrollRef.current) {
      scrollRef.current.scrollTop = scrollRef.current.scrollHeight;
    }
  }, [messages, isLoading]);

  // Handle send message
  const handleSendMessage = async (customPrompt?: string) => {
    const promptToSend = customPrompt || inputMsg.trim();
    if (!promptToSend || isLoading) return;

    if (!customPrompt) {
      setInputMsg("");
    }

    const newUserMessage: Message = {
      role: "user",
      content: promptToSend,
      time: new Date().toLocaleTimeString("vi-VN", { hour: "2-digit", minute: "2-digit" }),
    };

    setMessages((prev) => [...prev, newUserMessage]);
    setIsLoading(true);

    try {
      const response = await fetch("/api/vplay/ai", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        // Pass complete chat history to the API for premium multi-turn dialogs
        body: JSON.stringify({
          prompt: promptToSend,
          history: messages.map(m => ({
            role: m.role,
            content: m.content
          }))
        }),
      });

      const data = await response.json();
      const replyText = data.text || "Xin lỗi, V-Intelligence không nhận diện được phản hồi từ hệ thống.";

      const newAIMessage: Message = {
        role: "assistant",
        content: replyText,
        time: new Date().toLocaleTimeString("vi-VN", { hour: "2-digit", minute: "2-digit" }),
      };

      setMessages((prev) => [...prev, newAIMessage]);
    } catch (err: any) {
      console.error("V-Intelligence call failed:", err);
      const errorMessage: Message = {
        role: "assistant",
        content: "Oops! V-Intelligence đang mất kết nối với trung tâm dữ liệu Gemini. Quý khách vui lòng thử lại sau giây lát hoặc kiểm tra cài đặt mạng.",
        time: new Date().toLocaleTimeString("vi-VN", { hour: "2-digit", minute: "2-digit" }),
      };
      setMessages((prev) => [...prev, errorMessage]);
    } finally {
      setIsLoading(false);
    }
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault();
      handleSendMessage();
    }
  };

  const clearChat = () => {
    setMessages([
      {
        role: "assistant",
        content: "Trò chuyện đã được làm mới. Hãy cho tôi biết nếu có bất kỳ thắc mắc nào khác về Vplay, kênh truyền hình, hay tin công nghệ nhé!",
        time: new Date().toLocaleTimeString("vi-VN", { hour: "2-digit", minute: "2-digit" }),
      },
    ]);
  };

  const suggestions = [
    "Vplay có những kênh nào nổi bật?",
    "Hướng dẫn sử dụng tính năng Multiview",
    "Trực tiếp bóng đá hôm nay chiếu kênh nào?",
    "Thời tiết ngày mai tại Hà Nội ra sao?",
  ];

  return (
    <AnimatePresence>
      {isOpen && (
        <div className="fixed inset-0 z-[10000] flex items-center justify-center p-4 select-none">
          {/* Backdrop blur overlay */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={onClose}
            className="absolute inset-0 bg-black/85 backdrop-blur-md"
          />

          {/* Dialog content Container */}
          <motion.div
            initial={{ scale: 0.9, opacity: 0, y: 20 }}
            animate={{ scale: 1, opacity: 1, y: 0 }}
            exit={{ scale: 0.9, opacity: 0, y: 20 }}
            transition={{ type: "spring", damping: 25, stiffness: 350 }}
            className={`relative w-full max-w-2xl h-[580px] rounded-[36px] overflow-hidden flex flex-col border border-white/10 ${
              isDark 
                ? "bg-[#141416]/96 text-white shadow-[0_32px_80px_rgba(0,0,0,0.8)]" 
                : "bg-slate-900/96 text-white shadow-[0_32px_80px_rgba(0,0,0,0.85)]"
            } popup-3d-dark`}
          >
            {/* Header with Glowing AI Design */}
            <div className="px-6 py-4 border-b border-white/5 bg-gradient-to-r from-indigo-950/40 via-purple-950/20 to-black/30 flex items-center justify-between shrink-0">
              <div className="flex items-center gap-3">
                <div className="relative">
                  <div className="absolute inset-0 bg-[#4AC4FE]/20 rounded-full blur-md animate-pulse" />
                  <div className="w-10 h-10 rounded-full bg-gradient-to-tr from-[#4AC4FE] via-indigo-500 to-purple-600 flex items-center justify-center text-white shadow-[0_0_12px_rgba(74,196,254,0.4)] relative border border-white/20">
                    <Brain size={20} className="stroke-[2]" />
                  </div>
                </div>
                <div>
                  <div className="flex items-center gap-1.5">
                    <h3 className="font-sans font-bold text-[15px] text-white tracking-tight flex items-center gap-1">
                      V-Intelligence 
                    </h3>
                    <span className="bg-[#4AC4FE]/10 border border-[#4AC4FE]/20 text-[#4AC4FE] px-1.5 py-0.5 rounded-full text-[8.5px] font-black tracking-wider uppercase">
                      Gemini
                    </span>
                  </div>
                  <p className="text-[10px] text-white/45 font-medium tracking-tight">Trợ lý Trí tuệ Nhân tạo Vplay</p>
                </div>
              </div>

              <div className="flex items-center gap-1.5">
                <button
                  onClick={clearChat}
                  title="Xóa lịch sử hội thoại"
                  className="p-2 cursor-pointer rounded-full bg-white/5 hover:bg-white/10 text-white/60 hover:text-white transition-all"
                >
                  <RotateCcw size={16} />
                </button>
                <button
                  onClick={onClose}
                  className="p-2 cursor-pointer rounded-full bg-white/5 hover:bg-white/10 text-white/60 hover:text-[#4AC4FE] transition-all"
                >
                  <X size={16} />
                </button>
              </div>
            </div>

            {/* Chat Body Container with Messages */}
            <div 
              ref={scrollRef}
              className="flex-1 overflow-y-auto p-5 space-y-4 no-scrollbar bg-[#0d0d0f]/20 flex flex-col"
            >
              {messages.map((msg, i) => {
                const isAI = msg.role === "assistant";
                return (
                  <div
                    key={`msg-${i}`}
                    className={`flex gap-3 max-w-[85%] ${isAI ? "self-start" : "self-end flex-row-reverse"}`}
                  >
                    {isAI ? (
                      <div className="w-8 h-8 rounded-full bg-[#18181b] border border-white/10 flex items-center justify-center shrink-0 self-end text-[#4AC4FE] shadow-sm">
                        <Bot size={15} />
                      </div>
                    ) : (
                      <div className="w-8 h-8 rounded-full bg-[#4AC4FE]/20 border border-[#4AC4FE]/40 flex items-center justify-center shrink-0 self-end text-[#4AC4FE] shadow-sm">
                        <Sparkles size={14} />
                      </div>
                    )}

                    <div className="flex flex-col space-y-1">
                      <div
                        className={`px-4 py-3 rounded-[20px] text-xs font-medium leading-relaxed font-sans whitespace-pre-wrap ${
                          isAI
                            ? "bg-white/5 border border-white/5 text-white/90 rounded-bl-none shadow-[0_2px_8px_rgba(0,0,0,0.15)]"
                            : "bg-[#4AC4FE]/10 border border-[#4AC4FE]/30 text-white rounded-br-none shadow-[0_2px_8px_rgba(74,196,254,0.05)]"
                        }`}
                      >
                        {formatMarkdown(msg.content)}
                      </div>
                      <span className="text-[9px] text-white/30 px-1 self-end flex items-center gap-1 font-mono">
                        <Clock size={9} />
                        {msg.time}
                      </span>
                    </div>
                  </div>
                );
              })}

              {/* Chat loader */}
              {isLoading && (
                <div className="flex gap-3 max-w-[80%] self-start">
                  <div className="w-8 h-8 rounded-full bg-[#18181b] border border-white/10 flex items-center justify-center shrink-0 self-end animate-pulse text-[#4AC4FE]">
                    <Bot size={15} />
                  </div>
                  <div className="px-4 py-3 bg-white/5 border border-white/5 text-white/90 rounded-[20px] rounded-bl-none flex items-center gap-1.5 shadow-sm">
                    <span className="w-1.5 h-1.5 rounded-full bg-[#4AC4FE] animate-ping" />
                    <span className="w-1.5 h-1.5 rounded-full bg-[#4AC4FE] animate-ping [animation-delay:0.2s]" />
                    <span className="w-1.5 h-1.5 rounded-full bg-[#4AC4FE] animate-ping [animation-delay:0.4s]" />
                    <span className="text-[10px] text-white/60 font-medium pl-1">V-Intelligence đang suy nghĩ...</span>
                  </div>
                </div>
              )}
            </div>

            {/* Suggested Chipset Questions (horizontal container) */}
            <div className="px-5 py-2.5 bg-black/10 flex gap-2 overflow-x-auto no-scrollbar border-t border-white/5 shrink-0">
              {suggestions.map((sug, idx) => (
                <button
                  key={`suggestion-${idx}`}
                  onClick={() => handleSendMessage(sug)}
                  disabled={isLoading}
                  className="px-3 py-1.5 rounded-full bg-white/[0.03] hover:bg-[#4AC4FE]/10 border border-white/5 hover:border-[#4AC4FE]/20 text-white/80 hover:text-[#4AC4FE] text-[10.5px] font-bold tracking-tight shrink-0 transition-all select-none cursor-pointer disabled:opacity-40"
                >
                  {sug}
                </button>
              ))}
            </div>

            {/* Messaging Input Area */}
            <div className="p-4 bg-gradient-to-t from-[#0e0e10] to-[#121214]/90 border-t border-white/5 flex items-center gap-3 shrink-0">
              <textarea
                value={inputMsg}
                onChange={(e) => setInputMsg(e.target.value)}
                onKeyDown={handleKeyDown}
                placeholder="Nhập câu hỏi của bạn tại đây cho V-Intelligence..."
                rows={1}
                className="flex-1 bg-white/5 hover:bg-white/[0.08] focus:bg-white/[0.08] transition-colors rounded-2xl px-4 py-3 text-xs text-white placeholder-white/20 border border-white/5 focus:border-[#4AC4FE]/50 outline-none resize-none no-scrollbar font-medium font-sans"
              />
              <button
                onClick={() => handleSendMessage()}
                disabled={!inputMsg.trim() || isLoading}
                className={`w-10 h-10 rounded-xl flex items-center justify-center transition-all shrink-0 cursor-pointer ${
                  inputMsg.trim() && !isLoading
                    ? "bg-[#4AC4FE] text-slate-950 shadow-[0_4px_12px_rgba(74,196,254,0.3)] hover:scale-[1.08]"
                    : "bg-white/5 text-white/30 cursor-not-allowed"
                }`}
              >
                <Send size={15} className="stroke-[2.5]" />
              </button>
            </div>
          </motion.div>
        </div>
      )}
    </AnimatePresence>
  );
}

// Basic Formatter for local inline bold elements
function formatMarkdown(text: string): React.ReactNode {
  if (!text) return "";
  const parts = text.split(/(\*\*.*?\*\*)/g);
  return parts.map((part, index) => {
    if (part.startsWith("**") && part.endsWith("**")) {
      return (
        <strong key={index} className="font-extrabold text-white text-[12.5px]">
          {part.slice(2, -2)}
        </strong>
      );
    }
    return part;
  });
}
