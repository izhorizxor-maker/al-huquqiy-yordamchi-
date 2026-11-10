import React, { useState } from 'react';
import { Language, LegalConsultationResult } from '../types';
import { translations } from '../translations';
import { voiceService } from '../services/voiceService';
import {
  Mic,
  MicOff,
  Volume2,
  Square,
  Sparkles,
  MapPin,
  ArrowRight,
  Bot,
  User,
  VolumeX,
  Play
} from 'lucide-react';

interface VoiceRoomProps {
  language: Language;
  onSendQuery: (query: string) => Promise<LegalConsultationResult | null>;
  onViewOnMap: (result: LegalConsultationResult) => void;
}

interface VoiceMessage {
  id: string;
  sender: 'user' | 'ai';
  text: string;
  time: string;
  consultation?: LegalConsultationResult;
}

export const VoiceRoom: React.FC<VoiceRoomProps> = ({
  language,
  onSendQuery,
  onViewOnMap,
}) => {
  const t = translations[language];
  const [isListening, setIsListening] = useState(false);
  const [isThinking, setIsThinking] = useState(false);
  const [isSpeaking, setIsSpeaking] = useState(false);
  const [liveTranscript, setLiveTranscript] = useState('');
  const [conversation, setConversation] = useState<VoiceMessage[]>([
    {
      id: 'greet',
      sender: 'ai',
      text: t.voiceTestGreet,
      time: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
    },
  ]);

  const quickVoicePrompts = [
    t.promptCarSale,
    t.promptKadastr,
    t.promptHouseSale,
    t.promptPowerOfAttorney,
  ];

  const handleStartListen = () => {
    voiceService.stop();
    setIsSpeaking(false);
    setLiveTranscript('');
    setIsListening(true);

    voiceService.listen(
      language,
      async (transcript) => {
        setIsListening(false);
        setLiveTranscript(transcript);
        await processUserVoiceQuery(transcript);
      },
      (err) => {
        setIsListening(false);
        console.warn('Voice recognition error:', err);
      },
      () => {
        setIsListening(false);
      }
    );
  };

  const handleStopListen = () => {
    voiceService.stopListening();
    setIsListening(false);
  };

  const processUserVoiceQuery = async (queryText: string) => {
    if (!queryText.trim()) return;

    const userEntry: VoiceMessage = {
      id: `u-${Date.now()}`,
      sender: 'user',
      text: queryText,
      time: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
    };

    setConversation(prev => [...prev, userEntry]);
    setIsThinking(true);

    const result = await onSendQuery(queryText);
    setIsThinking(false);

    if (result) {
      const aiReplyText = result.voiceScript || `${result.title}. ${result.shortSummary}`;
      const aiEntry: VoiceMessage = {
        id: `ai-${Date.now()}`,
        sender: 'ai',
        text: aiReplyText,
        time: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
        consultation: result,
      };

      setConversation(prev => [...prev, aiEntry]);

      // Speak with gentle female voice
      setIsSpeaking(true);
      voiceService.speak(
        aiReplyText,
        language,
        () => setIsSpeaking(true),
        () => setIsSpeaking(false),
        () => setIsSpeaking(false)
      );
    }
  };

  const handleStopSpeaking = () => {
    voiceService.stop();
    setIsSpeaking(false);
  };

  return (
    <div className="bg-white dark:bg-slate-900 rounded-3xl border border-slate-200 dark:border-slate-800 shadow-xl p-6 sm:p-8 space-y-6">
      {/* Title & Instructions */}
      <div className="text-center max-w-2xl mx-auto space-y-2">
        <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-emerald-50 dark:bg-emerald-950/60 text-emerald-700 dark:text-emerald-300 text-xs font-bold border border-emerald-200 dark:border-emerald-800">
          <Sparkles className="w-3.5 h-3.5" />
          <span>Mayin Ovozli O'zbek Qizi</span>
        </div>
        <h2 className="text-2xl sm:text-3xl font-extrabold text-slate-900 dark:text-white">
          {t.voiceRoomTitle}
        </h2>
        <p className="text-xs sm:text-sm text-slate-500 dark:text-slate-400">
          {t.voiceRoomSubtitle}
        </p>

        {/* Test voice preview button */}
        <div className="pt-1">
          <button
            onClick={() => {
              voiceService.speak(
                "Assalomu alaykum! Men sizning mayin ovozli huquqiy maslahatchingizman. Mashina yoki uy-joy sotish bo'yicha savollaringiz bo'lsa, mikrofonni bosib bemalol so'rang.",
                language,
                () => setIsSpeaking(true),
                () => setIsSpeaking(false)
              );
            }}
            className="inline-flex items-center gap-1.5 px-3.5 py-1.5 rounded-full bg-amber-100 hover:bg-amber-200 dark:bg-amber-950/60 dark:hover:bg-amber-900 text-amber-800 dark:text-amber-300 text-xs font-bold transition-colors shadow-2xs"
          >
            <Volume2 className="w-3.5 h-3.5" />
            <span>Mayin ovoz namunasini eshitish</span>
          </button>
        </div>
      </div>

      {/* Main Interactive Mic Center */}
      <div className="flex flex-col items-center justify-center py-6 space-y-4">
        {/* Animated Visualizer Circle */}
        <div className="relative">
          {isListening && (
            <span className="absolute -inset-4 rounded-full bg-red-400/30 dark:bg-red-500/20 animate-ping pointer-events-none" />
          )}
          {isSpeaking && (
            <span className="absolute -inset-4 rounded-full bg-emerald-400/30 dark:bg-emerald-500/20 animate-pulse pointer-events-none" />
          )}

          <button
            onClick={isListening ? handleStopListen : handleStartListen}
            disabled={isThinking}
            aria-label="Toggle voice listening"
            className={`w-28 h-28 sm:w-32 sm:h-32 rounded-full flex flex-col items-center justify-center text-white shadow-2xl transition-all transform hover:scale-105 active:scale-95 ${
              isListening
                ? 'bg-red-600 ring-8 ring-red-400/30 animate-pulse'
                : isSpeaking
                ? 'bg-emerald-600 ring-8 ring-emerald-400/30'
                : 'bg-gradient-to-tr from-blue-600 via-indigo-600 to-emerald-600 hover:shadow-emerald-500/25'
            }`}
          >
            {isListening ? (
              <>
                <MicOff className="w-10 h-10 mb-1" />
                <span className="text-xs font-bold">To'xtatish</span>
              </>
            ) : isSpeaking ? (
              <>
                <Volume2 className="w-10 h-10 mb-1 animate-bounce" />
                <span className="text-xs font-bold">Gapirmoqda</span>
              </>
            ) : (
              <>
                <Mic className="w-10 h-10 mb-1" />
                <span className="text-xs font-bold">Gapirish</span>
              </>
            )}
          </button>
        </div>

        {/* Status indicator */}
        <div className="text-center">
          <p className="font-bold text-sm text-slate-800 dark:text-slate-200">
            {isListening
              ? t.voiceListening
              : isThinking
              ? t.voiceThinking
              : isSpeaking
              ? t.voiceSpeaking
              : "Mikrofonni bosing va savolingizni ayting"}
          </p>
          {liveTranscript && (
            <p className="text-xs text-slate-500 dark:text-slate-400 mt-1 italic max-w-md">
              "{liveTranscript}"
            </p>
          )}
        </div>

        {/* Audio Stop Button */}
        {isSpeaking && (
          <button
            onClick={handleStopSpeaking}
            className="px-4 py-2 rounded-xl bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 dark:hover:bg-slate-700 text-slate-700 dark:text-slate-300 text-xs font-bold flex items-center gap-1.5 transition-colors"
          >
            <Square className="w-3.5 h-3.5 fill-current" />
            <span>{t.voiceStop}</span>
          </button>
        )}
      </div>

      {/* Suggested Spoken Prompts */}
      <div className="p-4 bg-slate-50 dark:bg-slate-800/50 rounded-2xl border border-slate-200 dark:border-slate-800">
        <span className="text-xs font-bold text-slate-500 uppercase tracking-wider block mb-2">
          {t.quickPromptsTitle} (Bosing va eshiting):
        </span>
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
          {quickVoicePrompts.map((promptText, idx) => (
            <button
              key={idx}
              onClick={() => processUserVoiceQuery(promptText)}
              className="p-3 bg-white dark:bg-slate-800 hover:bg-emerald-50 dark:hover:bg-slate-700 rounded-xl border border-slate-200 dark:border-slate-700 text-left text-xs font-semibold text-slate-800 dark:text-slate-200 transition-colors flex items-center justify-between group"
            >
              <span className="line-clamp-1">{promptText}</span>
              <Play className="w-3.5 h-3.5 text-emerald-600 flex-shrink-0 group-hover:scale-110 transition-transform" />
            </button>
          ))}
        </div>
      </div>

      {/* Conversation Feed */}
      <div className="space-y-3 pt-2">
        <h3 className="text-sm font-bold text-slate-700 dark:text-slate-300">
          {t.voiceConversationHistory}:
        </h3>

        <div className="space-y-3 max-h-80 overflow-y-auto p-1">
          {conversation.map((msg) => (
            <div
              key={msg.id}
              className={`flex items-start gap-3 p-4 rounded-2xl border ${
                msg.sender === 'user'
                  ? 'bg-blue-50/70 dark:bg-blue-950/30 border-blue-200 dark:border-blue-900 ml-8'
                  : 'bg-white dark:bg-slate-800 border-slate-200 dark:border-slate-700 mr-8'
              }`}
            >
              <div className={`w-8 h-8 rounded-xl flex items-center justify-center text-white flex-shrink-0 ${
                msg.sender === 'user' ? 'bg-blue-600' : 'bg-emerald-600'
              }`}>
                {msg.sender === 'user' ? <User className="w-4 h-4" /> : <Bot className="w-4 h-4" />}
              </div>

              <div className="flex-1 space-y-2">
                <p className="text-xs sm:text-sm text-slate-800 dark:text-slate-200 leading-relaxed">
                  {msg.text}
                </p>

                {msg.consultation && (
                  <div className="flex flex-wrap items-center gap-2 pt-1 border-t border-slate-100 dark:border-slate-700">
                    <button
                      onClick={() => voiceService.speak(msg.text, language)}
                      className="px-2.5 py-1 rounded-lg bg-amber-50 dark:bg-amber-950/50 text-amber-700 dark:text-amber-300 text-xs font-semibold flex items-center gap-1 hover:bg-amber-100"
                    >
                      <Volume2 className="w-3.5 h-3.5" />
                      <span>{t.readAloud}</span>
                    </button>

                    <button
                      onClick={() => onViewOnMap(msg.consultation!)}
                      className="px-3 py-1 rounded-lg bg-emerald-600 text-white text-xs font-bold flex items-center gap-1 hover:bg-emerald-700 shadow-xs"
                    >
                      <MapPin className="w-3.5 h-3.5" />
                      <span>{t.viewOnMap} ({msg.consultation.locationName})</span>
                    </button>
                  </div>
                )}
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};
