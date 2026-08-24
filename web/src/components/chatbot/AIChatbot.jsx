import React, { useState, useEffect, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Bot, Send, X, Sparkles } from 'lucide-react';
import { AIAvatarIllustration } from '../illustrations/AIAvatarIllustration';
import { chatService } from '../../services/chatService';

const SUGGESTED_QUESTIONS = [
  "How many bedrooms does this property have?",
  "Is this property furnished?",
  "What amenities are included?",
  "What is the monthly rent?",
  "Is it currently available?",
  "Tell me about this property."
];

export const AIChatbot = ({ property, isOpen, onClose }) => {
  const [messages, setMessages] = useState([]);
  const [input, setInput] = useState('');
  const [loading, setLoading] = useState(false);
  const messagesEndRef = useRef(null);

  const propertyId = property?._id || property?.propertyId || property?.id;

  // Initialize welcome message when opened for a property
  useEffect(() => {
    if (isOpen && property) {
      setMessages([
        {
          id: 'welcome-1',
          sender: 'ai',
          text: `Hello! I am your AI Property Concierge. Ask me anything specifically about **"${property.title}"**.`,
          timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
        }
      ]);
    }
  }, [isOpen, propertyId]);

  // Auto-scroll to latest message
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages, loading]);

  const handleSend = async (textToSend) => {
    const questionText = textToSend || input;
    if (!questionText.trim() || loading || !propertyId) return;

    const userMessage = {
      id: Date.now().toString(),
      sender: 'user',
      text: questionText.trim(),
      timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
    };

    setMessages((prev) => [...prev, userMessage]);
    if (!textToSend) setInput('');
    setLoading(true);

    try {
      // POST /api/v1/properties/:id/chat (RFC-003-B)
      const res = await chatService.askPropertyAI({
        propertyId,
        question: questionText.trim()
      });

      const aiMessage = {
        id: (Date.now() + 1).toString(),
        sender: 'ai',
        text: res.answer || 'Here is the relevant details regarding this property.',
        timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
      };

      setMessages((prev) => [...prev, aiMessage]);
    } catch (err) {
      const errorText = err.status === 429
        ? "You've reached the temporary AI question limit. Please try again later."
        : (err.message || 'Apologies, I encountered a temporary connection issue. Please try asking again.');

      setMessages((prev) => [
        ...prev,
        {
          id: (Date.now() + 1).toString(),
          sender: 'ai',
          text: errorText,
          timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
        }
      ]);
    } finally {
      setLoading(false);
    }
  };

  return (
    <AnimatePresence>
      {isOpen && (
        <motion.div
          initial={{ opacity: 0, y: 30, scale: 0.95 }}
          animate={{ opacity: 1, y: 0, scale: 1 }}
          exit={{ opacity: 0, y: 30, scale: 0.95 }}
          transition={{ duration: 0.25 }}
          className="fixed bottom-4 right-4 z-50 w-full max-w-md bg-white dark:bg-dark-card border border-slate-200 dark:border-dark-border rounded-3xl shadow-2xl overflow-hidden flex flex-col h-[550px] max-h-[85vh]"
        >
          {/* Drawer Header */}
          <div className="bg-gradient-to-r from-slate-900 to-slate-800 text-white p-4 flex items-center justify-between border-b border-slate-700">
            <div className="flex items-center gap-3">
              <AIAvatarIllustration size="sm" isTyping={loading} />
              <div className="flex flex-col">
                <div className="flex items-center gap-1.5 font-bold text-sm text-white">
                  <span>Haven AI Concierge</span>
                  <Sparkles className="w-3.5 h-3.5 text-amber-400" />
                </div>
                <span className="text-[11px] text-slate-300 truncate max-w-[210px]">
                  Property: {property?.title || 'Selected Residence'}
                </span>
              </div>
            </div>

            <button
              onClick={onClose}
              className="p-1.5 rounded-full text-slate-400 hover:text-white hover:bg-slate-700 transition-colors"
            >
              <X className="w-5 h-5" />
            </button>
          </div>

          {/* Messages Feed */}
          <div className="flex-1 p-4 overflow-y-auto flex flex-col gap-3.5 bg-slate-50/50 dark:bg-slate-950/40">
            {messages.map((msg) => (
              <div
                key={msg.id}
                className={`flex gap-2.5 max-w-[85%] ${
                  msg.sender === 'user' ? 'ml-auto flex-row-reverse' : 'mr-auto'
                }`}
              >
                {msg.sender === 'ai' && (
                  <div className="w-7 h-7 rounded-full bg-brand-500 text-white flex items-center justify-center text-xs shrink-0 mt-1">
                    <Bot className="w-4 h-4" />
                  </div>
                )}
                <div
                  className={`p-3.5 rounded-2xl text-xs sm:text-sm leading-relaxed ${
                    msg.sender === 'user'
                      ? 'bg-brand-500 text-white rounded-tr-none shadow-md'
                      : 'bg-white dark:bg-slate-800 text-slate-800 dark:text-slate-100 rounded-tl-none border border-slate-200/80 dark:border-slate-700 shadow-sm'
                  }`}
                >
                  <p>{msg.text}</p>
                  <span
                    className={`block text-[10px] mt-1 text-right ${
                      msg.sender === 'user' ? 'text-emerald-100' : 'text-slate-400'
                    }`}
                  >
                    {msg.timestamp}
                  </span>
                </div>
              </div>
            ))}

            {/* Typing Indicator */}
            {loading && (
              <div className="flex items-center gap-2.5 mr-auto">
                <AIAvatarIllustration size="sm" isTyping={true} />
                <div className="px-4 py-3 rounded-2xl bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 flex items-center gap-1.5 text-slate-400 text-xs font-semibold">
                  <span className="w-2 h-2 rounded-full bg-brand-500 animate-bounce" />
                  <span className="w-2 h-2 rounded-full bg-brand-500 animate-bounce [animation-delay:0.2s]" />
                  <span className="w-2 h-2 rounded-full bg-brand-500 animate-bounce [animation-delay:0.4s]" />
                  <span className="ml-1">Querying property AI...</span>
                </div>
              </div>
            )}
            <div ref={messagesEndRef} />
          </div>

          {/* Suggested Quick Questions */}
          <div className="px-3 py-2 bg-slate-100/70 dark:bg-slate-900/70 border-t border-slate-200 dark:border-dark-border overflow-x-auto flex gap-1.5 no-scrollbar">
            {SUGGESTED_QUESTIONS.map((q, idx) => (
              <button
                key={idx}
                disabled={loading}
                onClick={() => handleSend(q)}
                className="whitespace-nowrap px-3 py-1 rounded-full text-[11px] font-semibold bg-white dark:bg-slate-800 text-slate-700 dark:text-slate-300 border border-slate-200 dark:border-slate-700 hover:border-brand-500 hover:text-brand-500 dark:hover:text-brand-400 transition-all shrink-0"
              >
                {q}
              </button>
            ))}
          </div>

          {/* Input Box */}
          <form
            onSubmit={(e) => {
              e.preventDefault();
              handleSend();
            }}
            className="p-3 bg-white dark:bg-dark-card border-t border-slate-200 dark:border-dark-border flex items-center gap-2"
          >
            <input
              type="text"
              value={input}
              onChange={(e) => setInput(e.target.value)}
              placeholder="Ask AI about rent, beds, furnished..."
              className="flex-1 py-2.5 px-4 rounded-xl text-xs sm:text-sm bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-700 text-slate-900 dark:text-slate-100 placeholder-slate-400 focus:outline-none focus:border-brand-500"
            />
            <button
              type="submit"
              disabled={!input.trim() || loading}
              className="p-2.5 rounded-xl bg-brand-500 text-white disabled:opacity-40 hover:bg-brand-600 transition-colors shadow-md shadow-brand-500/20"
            >
              <Send className="w-4 h-4" />
            </button>
          </form>
        </motion.div>
      )}
    </AnimatePresence>
  );
};
