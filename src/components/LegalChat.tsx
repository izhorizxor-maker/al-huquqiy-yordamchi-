import React, { useState, useRef, useEffect } from 'react';
import { ChatMessage, Language, LegalConsultationResult } from '../types';
import { translations } from '../translations';
import { COMMON_LEGAL_PROCEDURES } from '../data/mockData';
import { voiceService } from '../services/voiceService';
import { LegalConsultationCard } from './LegalConsultationCard';
import {
  Send,
  Mic,
  MicOff,
  Volume2,
  Sparkles,
  Bot,
  User,
  HelpCircle
} from 'lucide-react';

interface LegalChatProps {
  language: Language;
  onSendQuery: (query: string) => Promise<LegalConsultationResult | null>;
  onViewOnMap: (result: LegalConsultationResult) => void;
}

export const LegalChat: React.FC<LegalChatProps> = ({
  language,
  onSendQuery,
  onViewOnMap,
}) => {
  const t = translations[language];
  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const [inputText, setInputText] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isMicActive, setIsMicActive] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);

  // Initial welcome greeting
  useEffect(() => {
    if (messages.length === 0) {
      setMessages([
        {
          id: 'welcome',
          sender: 'ai',
          text: t.voiceTestGreet,
          timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
        },
      ]);
    }
  }, [language]);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages, isSubmitting]);

  const handleSubmit = async (textToSend?: string) => {
    const query = (textToSend || inputText).trim();
    if (!query || isSubmitting) return;

    setInputText('');
    const userMsg: ChatMessage = {
      id: `user-${Date.now()}`,
      sender: 'user',
      text: query,
      timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
    };

    setMessages(prev => [...prev, userMsg]);
    setIsSubmitting(true);

    try {
      const result = await onSendQuery(query);
      if (result) {
        const aiMsg: ChatMessage = {
          id: `ai-${Date.now()}`,
          sender: 'ai',
          text: result.shortSummary,
          timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
          consultationData: result,
        };
        setMessages(prev => [...prev, aiMsg]);

        // Speak gentle voice script
        if (result.voiceScript) {
          voiceService.speak(result.voiceScript, language);
        }
      }
    } catch (err) {
      console.error(err);
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleVoiceInput = () => {
    if (isMicActive) {
      voiceService.stopListening();
      setIsMicActive(false);
      return;
    }

    voiceService.stop();
    setIsMicActive(true);

    voiceService.listen(
      language,
      (transcript) => {
        setIsMicActive(false);
        setInputText(transcript);
        handleSubmit(transcript);
      },
      (err) => {
        setIsMicActive(false);
        console.warn('Speech error:', err);
      },
      () => {
        setIsMicActive(false);
      }
    );
  };

  return (
    <div className="flex flex-col h-[740px] bg-white dark:bg-slate-900 rounded-3xl border border-slate-200 dark:border-slate-800 shadow-xl overflow-hidden">
      {/* Quick Topic Chips Header */}
      <div className="p-3 bg-slate-50 dark:bg-slate-800/60 border-b border-slate-200 dark:border-slate-800 flex items-center gap-2 overflow-x-auto no-scrollbar">
        <span className="text-xs font-bold text-slate-500 whitespace-nowrap flex items-center gap-1">
          <HelpCircle className="w-3.5 h-3.5 text-blue-600" />
          {t.quickPromptsTitle}
        </span>
        {COMMON_LEGAL_PROCEDURES.map((proc) => (
          <button
            key={proc.id}
            onClick={() => handleSubmit(proc.prompt)}
            className="px-3 py-1.5 rounded-xl bg-white dark:bg-slate-700 text-slate-800 dark:text-slate-200 border border-slate-200 dark:border-slate-600 hover:border-emerald-500 hover:text-emerald-600 text-xs font-semibold whitespace-nowrap transition-colors shadow-2xs"
          >
            {proc.title}
          </button>
        ))}
      </div>

      {/* Messages Scroll Area */}
      <div className="flex-1 overflow-y-auto p-4 sm:p-6 space-y-5">
        {messages.map((msg) => (
          <div
            key={msg.id}
            className={`flex flex-col ${msg.sender === 'user' ? 'items-end' : 'items-start'}`}
          >
            <div className="flex items-start gap-2.5 max-w-3xl">
              {msg.sender === 'ai' && (
                <div className="w-9 h-9 rounded-xl bg-gradient-to-tr from-blue-700 to-indigo-600 text-white flex items-center justify-center flex-shrink-0 shadow-sm mt-1">
                  <Bot className="w-5 h-5" />
                </div>
              )}

              <div className="space-y-3 w-full">
                {/* Text Bubble */}
                <div
                  className={`p-4 rounded-2xl ${
                    msg.sender === 'user'
                      ? 'bg-blue-600 text-white rounded-br-none shadow-md ml-auto text-sm'
                      : 'bg-slate-100 dark:bg-slate-800/80 text-slate-900 dark:text-slate-100 rounded-bl-none border border-slate-200/80 dark:border-slate-700 text-sm'
                  }`}
                >
                  <p className="leading-relaxed">{msg.text}</p>
                  <div className="flex items-center justify-between gap-4 mt-2 pt-1 text-[11px] opacity-75">
                    <span>{msg.timestamp}</span>
                    {msg.sender === 'ai' && (
                      <button
                        onClick={() => voiceService.speak(msg.text, language)}
                        className="hover:underline flex items-center gap-1 font-semibold"
                      >
                        <Volume2 className="w-3.5 h-3.5" />
                        <span>{t.readAloud}</span>
                      </button>
                    )}
                  </div>
                </div>

                {/* If AI message contains full legal consultation breakdown */}
                {msg.consultationData && (
                  <LegalConsultationCard
                    data={msg.consultationData}
                    language={language}
                    onViewOnMap={() => onViewOnMap(msg.consultationData!)}
                  />
                )}
              </div>

              {msg.sender === 'user' && (
                <div className="w-9 h-9 rounded-xl bg-slate-800 text-white flex items-center justify-center flex-shrink-0 shadow-sm mt-1">
                  <User className="w-5 h-5" />
                </div>
              )}
            </div>
          </div>
        ))}

        {/* Loading Spinner */}
        {isSubmitting && (
          <div className="flex items-start gap-2.5 max-w-xl">
            <div className="w-9 h-9 rounded-xl bg-gradient-to-tr from-blue-700 to-indigo-600 text-white flex items-center justify-center flex-shrink-0 animate-pulse">
              <Bot className="w-5 h-5" />
            </div>
            <div className="p-4 rounded-2xl bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300 rounded-bl-none text-xs flex items-center gap-3">
              <Sparkles className="w-4 h-4 text-emerald-500 animate-spin" />
              <span>{t.loadingAi}</span>
            </div>
          </div>
        )}

        <div ref={messagesEndRef} />
      </div>

      {/* Input Form Bar */}
      <div className="p-4 bg-slate-50 dark:bg-slate-800/80 border-t border-slate-200 dark:border-slate-800">
        <form
          onSubmit={(e) => {
            e.preventDefault();
            handleSubmit();
          }}
          className="flex items-center gap-2"
        >
          {/* Speech Mic Button */}
          <button
            type="button"
            onClick={handleVoiceInput}
            title={t.voiceBtnHold}
            className={`p-3 rounded-2xl transition-all shadow-sm ${
              isMicActive
                ? 'bg-red-500 text-white animate-pulse ring-4 ring-red-300'
                : 'bg-white dark:bg-slate-700 text-slate-700 dark:text-slate-200 border border-slate-200 dark:border-slate-600 hover:text-emerald-600'
            }`}
          >
            {isMicActive ? <MicOff className="w-5 h-5" /> : <Mic className="w-5 h-5" />}
          </button>

          {/* Text input */}
          <input
            type="text"
            value={inputText}
            onChange={(e) => setInputText(e.target.value)}
            placeholder={isMicActive ? t.voiceListening : t.searchPlaceholder}
            disabled={isSubmitting}
            className="flex-1 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-700 rounded-2xl px-4 py-3 text-sm text-slate-900 dark:text-white placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-blue-500 shadow-xs"
          />

          {/* Submit Button */}
          <button
            type="submit"
            disabled={!inputText.trim() || isSubmitting}
            className="px-5 py-3 rounded-2xl bg-blue-600 hover:bg-blue-700 disabled:opacity-50 text-white font-bold text-xs sm:text-sm flex items-center gap-2 transition-all shadow-md"
          >
            <span>{t.askAiBtn}</span>
            <Send className="w-4 h-4" />
          </button>
        </form>
      </div>
    </div>
  );
};
