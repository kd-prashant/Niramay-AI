"use client";

import React, { useState, useEffect, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { MessageSquare, X, Send, Bot, User, Loader2, Sparkles, Sprout } from 'lucide-react';
import { useLanguage } from '@/context/LanguageContext';
import ReactMarkdown from 'react-markdown';
import remarkGfm from 'remark-gfm';

interface Message {
  role: 'bot' | 'user';
  text: string;
}

export default function AIChatAssistant({ scanContext }: { scanContext?: string }) {
  const { t, language } = useLanguage();
  const [isOpen, setIsOpen] = useState(false);
  const [message, setMessage] = useState('');
  const [chat, setChat] = useState<Message[]>([
    { role: 'bot', text: language === 'HI' ? "नमस्ते! मैं आपका निरामय एआई प्लांट डॉक्टर हूं। मैं आपकी कैसे मदद कर सकता हूं?" : "Hello! I am your Niramay AI Plant Doctor. How can I help you today?" }
  ]);
  const [isTyping, setIsTyping] = useState(false);
  const scrollRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (scrollRef.current) {
      scrollRef.current.scrollTop = scrollRef.current.scrollHeight;
    }
  }, [chat]);

  const handleSend = async () => {
    if (!message.trim()) return;

    const userMsg = message;
    setChat(prev => [...prev, { role: 'user', text: userMsg }]);
    setMessage('');
    setIsTyping(true);

    try {
      console.log("Assistant: Sending request to", process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8000');
      const response = await fetch(`${process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8000'}/chat`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          message: userMsg,
          disease_context: scanContext,
          language: language
        })
      });

      if (!response.ok) {
        const errorData = await response.json().catch(() => ({}));
        throw new Error(errorData.detail || `Server error: ${response.status}`);
      }

      const data = await response.json();
      if (data.success) {
        setChat(prev => [...prev, { role: 'bot', text: data.response }]);
      }
    } catch (error: any) {
      console.error("Chat Assistant Error:", error);
      setChat(prev => [...prev, { role: 'bot', text: `⚠️ ERROR: ${error.message || "Failed to connect to the brain."}` }]);
    } finally {
      setIsTyping(false);
    }
  };

  return (
    <>
      {/* Floating Button */}
      <motion.button
        whileHover={{ scale: 1.1, rotate: 5 }}
        whileTap={{ scale: 0.9 }}
        onClick={() => setIsOpen(true)}
        className="fixed bottom-10 right-10 z-[100] w-20 h-20 rounded-full bg-veridian-500 text-white shadow-[0_20px_40px_-10px_rgba(34,197,94,0.5)] flex items-center justify-center group border-4 border-white/20 overflow-hidden"
      >
        <div className="absolute inset-0 bg-gradient-to-tr from-white/20 to-transparent pointer-events-none" />
        <MessageSquare size={32} className="relative z-10" />
        {scanContext && (
            <motion.div 
                initial={{ scale: 0 }} 
                animate={{ scale: 1 }} 
                className="absolute top-2 right-2 w-5 h-5 bg-red-500 rounded-full border-2 border-white"
            />
        )}
      </motion.button>

      {/* Chat Window */}
      <AnimatePresence>
        {isOpen && (
          <motion.div
            initial={{ opacity: 0, scale: 0.9, y: 50 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.9, y: 50 }}
            className="fixed bottom-32 right-10 z-[100] w-[450px] max-h-[700px] h-[70vh] bg-zinc-900/90 backdrop-blur-3xl border border-white/10 rounded-[48px] shadow-[0_50px_100px_-20px_rgba(0,0,0,0.5)] overflow-hidden flex flex-col"
          >
            {/* Header */}
            <div className="p-8 bg-veridian-500/10 border-b border-white/5 flex items-center justify-between">
              <div className="flex items-center gap-4">
                <div className="w-14 h-14 rounded-2xl bg-veridian-500 flex items-center justify-center text-white shadow-lg">
                    <Bot size={28} />
                </div>
                <div>
                  <h3 className="text-xl font-black tracking-tighter leading-none mb-1">PLANT DOCTOR</h3>
                  <div className="flex items-center gap-2">
                    <div className="w-2 h-2 rounded-full bg-green-500 animate-pulse" />
                    <span className="text-[10px] font-black uppercase tracking-widest text-white/40">Active Consultation</span>
                  </div>
                </div>
              </div>
              <button 
                onClick={() => setIsOpen(false)}
                className="p-3 bg-white/5 hover:bg-white/10 rounded-full text-white/40 hover:text-white transition-all"
              >
                <X size={20} />
              </button>
            </div>

            {/* Scan Context Banner */}
            {scanContext && (
                <div className="px-8 py-3 bg-blue-500/10 border-b border-white/5 flex items-center gap-3">
                    <Sparkles size={14} className="text-blue-500" />
                    <span className="text-[10px] font-black uppercase tracking-[0.2em] text-blue-500/80">Diagnostic Context Synced: {scanContext}</span>
                </div>
            )}

            {/* Messages */}
            <div ref={scrollRef} className="flex-grow overflow-y-auto p-8 pr-4 space-y-8 scroll-smooth markdown-chat-container">
              {chat.map((msg, idx) => (
                <motion.div
                  initial={{ opacity: 0, x: msg.role === 'bot' ? -10 : 10 }}
                  animate={{ opacity: 1, x: 0 }}
                  key={idx}
                  className={`flex items-start gap-4 ${msg.role === 'user' ? 'flex-row-reverse' : ''}`}
                >
                  <div className={`w-10 h-10 rounded-xl flex items-center justify-center flex-shrink-0 ${msg.role === 'bot' ? 'bg-veridian-500 text-white' : 'bg-white/5 text-white/40'}`}>
                    {msg.role === 'bot' ? <Sprout size={20} /> : <User size={20} />}
                  </div>
                  <div className={`max-w-[80%] p-6 rounded-[30px] leading-relaxed text-sm ${
                    msg.role === 'bot' 
                      ? 'bg-zinc-800/80 text-white/90 rounded-tl-lg border border-white/5' 
                      : 'bg-veridian-500 text-white rounded-tr-lg shadow-lg shadow-veridian-500/20 font-bold'
                  }`}>
                    {msg.role === 'bot' ? (
                      <div className="markdown-chat prose prose-invert prose-sm max-w-none">
                        <ReactMarkdown remarkPlugins={[remarkGfm]}>
                          {msg.text}
                        </ReactMarkdown>
                      </div>
                    ) : (
                      msg.text
                    )}
                  </div>
                </motion.div>
              ))}
              {isTyping && (
                <div className="flex items-center gap-4">
                    <div className="w-10 h-10 rounded-xl bg-veridian-500 text-white flex items-center justify-center">
                        <Loader2 className="animate-spin" size={20} />
                    </div>
                    <div className="px-6 py-4 bg-white/5 rounded-full">
                        <div className="flex gap-1">
                            <motion.div animate={{ opacity: [0, 1, 0] }} transition={{ repeat: Infinity, duration: 1 }} className="w-1.5 h-1.5 bg-white/20 rounded-full" />
                            <motion.div animate={{ opacity: [0, 1, 0] }} transition={{ repeat: Infinity, duration: 1, delay: 0.2 }} className="w-1.5 h-1.5 bg-white/20 rounded-full" />
                            <motion.div animate={{ opacity: [0, 1, 0] }} transition={{ repeat: Infinity, duration: 1, delay: 0.4 }} className="w-1.5 h-1.5 bg-white/20 rounded-full" />
                        </div>
                    </div>
                </div>
              )}
            </div>

            {/* Input */}
            <div className="p-8 bg-black/40 border-t border-white/5">
              <div className="relative group">
                <input
                  type="text"
                  placeholder={language === 'HI' ? "क्या आपके कोई प्रश्न हैं?..." : "Do you have any questions?..."}
                  value={message}
                  onChange={(e) => setMessage(e.target.value)}
                  onKeyPress={(e) => e.key === 'Enter' && handleSend()}
                  className="w-full bg-white/5 border border-white/10 group-focus-within:border-veridian-500/50 rounded-full py-6 pl-8 pr-20 outline-none transition-all font-bold text-white placeholder:text-white/20"
                />
                <button
                   onClick={handleSend}
                   disabled={isTyping}
                   className="absolute right-3 top-1/2 -translate-y-1/2 w-14 h-14 bg-veridian-500 text-white rounded-full flex items-center justify-center hover:scale-110 active:scale-95 transition-all shadow-lg disabled:opacity-50"
                >
                  <Send size={24} />
                </button>
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </>
  );
}
