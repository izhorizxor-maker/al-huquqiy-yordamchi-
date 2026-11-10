import React, { useState, useEffect } from 'react';
import { Language, LegalConsultationResult, ThemeMode } from './types';
import { translations } from './translations';
import { Header } from './components/Header';
import { LegalMap } from './components/LegalMap';
import { LegalChat } from './components/LegalChat';
import { VoiceRoom } from './components/VoiceRoom';
import { FeeCalculatorModal } from './components/FeeCalculatorModal';
import { UZBEKISTAN_REGIONS } from './data/mockData';
import { voiceService } from './services/voiceService';
import {
  Map,
  MessageSquare,
  Mic,
  Calculator,
  Search,
  ArrowRight,
  PhoneCall,
  ExternalLink,
  MapPin,
  Volume2
} from 'lucide-react';

export default function App() {
  const [language, setLanguage] = useState<Language>('uz');
  const [theme, setTheme] = useState<ThemeMode>(() => {
    if (typeof window !== 'undefined') {
      return (localStorage.getItem('theme') as ThemeMode) || 'light';
    }
    return 'light';
  });

  const [activeTab, setActiveTab] = useState<'map' | 'chat' | 'voice' | 'calculator'>('map');
  const [selectedRegionId, setSelectedRegionId] = useState<string>('andijon');
  const [currentConsultation, setCurrentConsultation] = useState<LegalConsultationResult | null>(null);

  // Search state for Map view
  const [mapSearchText, setMapSearchText] = useState('');
  const [isMapSearching, setIsMapSearching] = useState(false);

  const t = translations[language];

  // Apply dark mode class to root HTML
  useEffect(() => {
    const root = document.documentElement;
    if (theme === 'dark') {
      root.classList.add('dark');
      localStorage.setItem('theme', 'dark');
    } else {
      root.classList.remove('dark');
      localStorage.setItem('theme', 'light');
    }
  }, [theme]);

  // Submit legal query to server API
  const handleLegalQuery = async (queryText: string): Promise<LegalConsultationResult | null> => {
    if (!queryText.trim()) return null;

    try {
      const response = await fetch('/api/legal-consult', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          prompt: queryText,
          language: language,
          region: selectedRegionId,
        }),
      });

      if (!response.ok) {
        throw new Error('Failed to consult legal API');
      }

      const data: LegalConsultationResult = await response.json();
      setCurrentConsultation(data);

      if (data.region) {
        setSelectedRegionId(data.region);
      }

      // Gentle female voice playback
      if (data.voiceScript) {
        voiceService.speak(data.voiceScript, language);
      }

      return data;
    } catch (err) {
      console.warn('Backend API request error:', err);
      return null;
    }
  };

  const handleMapSearch = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!mapSearchText.trim() || isMapSearching) return;
    setIsMapSearching(true);
    await handleLegalQuery(mapSearchText);
    setIsMapSearching(false);
  };

  return (
    <div className="min-h-screen bg-slate-50 dark:bg-slate-950 text-slate-900 dark:text-slate-100 transition-colors duration-200 flex flex-col font-sans">
      {/* Top Header */}
      <Header
        language={language}
        onLanguageChange={setLanguage}
        theme={theme}
        onThemeToggle={() => setTheme(prev => (prev === 'light' ? 'dark' : 'light'))}
        onOpenCalculator={() => setActiveTab('calculator')}
      />

      {/* Main Content Area */}
      <main className="flex-1 max-w-6xl mx-auto w-full px-4 sm:px-6 py-5 space-y-5">
        {/* Clean, Simple Top Navigation Tabs */}
        <div className="flex items-center justify-between gap-2 border-b border-slate-200 dark:border-slate-800 pb-2">
          <div className="flex items-center gap-1 sm:gap-2">
            <button
              onClick={() => setActiveTab('map')}
              className={`py-2 px-3 sm:px-4 rounded-xl text-xs sm:text-sm font-bold flex items-center gap-1.5 transition-all ${
                activeTab === 'map'
                  ? 'bg-blue-600 text-white shadow-sm'
                  : 'bg-white dark:bg-slate-900 text-slate-600 dark:text-slate-400 border border-slate-200 dark:border-slate-800 hover:text-slate-900 dark:hover:text-white'
              }`}
            >
              <Map className="w-4 h-4" />
              <span>Xarita va Manzillar</span>
            </button>

            <button
              onClick={() => setActiveTab('chat')}
              className={`py-2 px-3 sm:px-4 rounded-xl text-xs sm:text-sm font-bold flex items-center gap-1.5 transition-all ${
                activeTab === 'chat'
                  ? 'bg-blue-600 text-white shadow-sm'
                  : 'bg-white dark:bg-slate-900 text-slate-600 dark:text-slate-400 border border-slate-200 dark:border-slate-800 hover:text-slate-900 dark:hover:text-white'
              }`}
            >
              <MessageSquare className="w-4 h-4" />
              <span>Huquqiy Chat</span>
            </button>

            <button
              onClick={() => setActiveTab('voice')}
              className={`py-2 px-3 sm:px-4 rounded-xl text-xs sm:text-sm font-bold flex items-center gap-1.5 transition-all ${
                activeTab === 'voice'
                  ? 'bg-emerald-600 text-white shadow-sm ring-2 ring-emerald-300'
                  : 'bg-emerald-50 dark:bg-emerald-950/40 text-emerald-700 dark:text-emerald-300 border border-emerald-200 dark:border-emerald-800'
              }`}
            >
              <Mic className="w-4 h-4" />
              <span>Ovozli Muloqot</span>
            </button>

            <button
              onClick={() => setActiveTab('calculator')}
              className={`py-2 px-3 sm:px-4 rounded-xl text-xs sm:text-sm font-bold flex items-center gap-1.5 transition-all ${
                activeTab === 'calculator'
                  ? 'bg-blue-600 text-white shadow-sm'
                  : 'bg-white dark:bg-slate-900 text-slate-600 dark:text-slate-400 border border-slate-200 dark:border-slate-800 hover:text-slate-900 dark:hover:text-white'
              }`}
            >
              <Calculator className="w-4 h-4" />
              <span className="hidden sm:inline">Bojlar</span>
            </button>
          </div>

          {/* Quick Active Region Badge */}
          <div className="hidden md:flex items-center gap-1.5 text-xs text-slate-500 font-semibold">
            <MapPin className="w-3.5 h-3.5 text-red-500" />
            <span>Tanlangan hudud:</span>
            <span className="text-slate-900 dark:text-white font-bold">
              {UZBEKISTAN_REGIONS.find(r => r.id === selectedRegionId)?.name || 'Andijon viloyati'}
            </span>
          </div>
        </div>

        {/* ================= VIEW 1: MAP (ALOHIDA BO'LIM) ================= */}
        {activeTab === 'map' && (
          <div className="space-y-4 animate-in fade-in duration-200">
            {/* Simple Search Bar for Map */}
            <form onSubmit={handleMapSearch} className="flex gap-2">
              <div className="relative flex-1">
                <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
                <input
                  type="text"
                  value={mapSearchText}
                  onChange={(e) => setMapSearchText(e.target.value)}
                  placeholder="Masalan: Men mashinamni sotayabman qayerga boray?"
                  className="w-full bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-xl pl-10 pr-4 py-2.5 text-xs sm:text-sm text-slate-900 dark:text-white placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-blue-500 shadow-2xs"
                />
              </div>
              <button
                type="submit"
                disabled={isMapSearching}
                className="px-5 py-2.5 bg-blue-600 hover:bg-blue-700 text-white font-bold text-xs sm:text-sm rounded-xl transition-colors flex items-center gap-1.5 shadow-2xs whitespace-nowrap"
              >
                <span>{isMapSearching ? 'Izlanmoqda...' : 'Topish'}</span>
                <ArrowRight className="w-4 h-4" />
              </button>
            </form>

            {/* Full Map Canvas */}
            <LegalMap
              language={language}
              highlightedResult={currentConsultation}
              selectedRegionId={selectedRegionId}
              onRegionChange={setSelectedRegionId}
              onSelectLocation={(loc) => {
                const speech = `${loc.name}. Manzil: ${loc.address}. Qatnovchi avtobuslar: ${loc.buses.join(', ')}.`;
                voiceService.speak(speech, language);
              }}
            />
          </div>
        )}

        {/* ================= VIEW 2: CHAT (ALOHIDA BO'LIM) ================= */}
        {activeTab === 'chat' && (
          <div className="animate-in fade-in duration-200">
            <LegalChat
              language={language}
              onSendQuery={handleLegalQuery}
              onViewOnMap={(result) => {
                setCurrentConsultation(result);
                if (result.region) setSelectedRegionId(result.region);
                setActiveTab('map');
              }}
            />
          </div>
        )}

        {/* ================= VIEW 3: OVOZLI MULOQOT (ALOHIDA BO'LIM) ================= */}
        {activeTab === 'voice' && (
          <div className="animate-in fade-in duration-200 max-w-3xl mx-auto">
            <VoiceRoom
              language={language}
              onSendQuery={handleLegalQuery}
              onViewOnMap={(result) => {
                setCurrentConsultation(result);
                if (result.region) setSelectedRegionId(result.region);
                setActiveTab('map');
              }}
            />
          </div>
        )}

        {/* ================= VIEW 4: BOJ HISOB-KITOBLARI (ALOHIDA BO'LIM) ================= */}
        {activeTab === 'calculator' && (
          <div className="animate-in fade-in duration-200 max-w-2xl mx-auto">
            <FeeCalculatorModal
              isOpen={true}
              onClose={() => setActiveTab('map')}
              language={language}
            />
          </div>
        )}
      </main>

      {/* Official Government Hotlines Footer */}
      <footer className="mt-auto border-t border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 py-4 text-xs text-slate-500 dark:text-slate-400">
        <div className="max-w-6xl mx-auto px-4 sm:px-6 flex flex-col sm:flex-row items-center justify-between gap-3">
          <div className="flex items-center gap-4 text-xs font-semibold">
            <a href="tel:1008" className="flex items-center gap-1 hover:text-blue-600">
              <PhoneCall className="w-3.5 h-3.5 text-blue-600" />
              <span>Adliya: 1008</span>
            </a>
            <a href="tel:1148" className="flex items-center gap-1 hover:text-emerald-600">
              <PhoneCall className="w-3.5 h-3.5 text-emerald-600" />
              <span>DXM: 1148</span>
            </a>
            <a href="tel:102" className="flex items-center gap-1 hover:text-indigo-600">
              <PhoneCall className="w-3.5 h-3.5 text-indigo-600" />
              <span>YHXDX: 102</span>
            </a>
          </div>

          <div className="flex items-center gap-3">
            <a href="https://e-notarius.uz" target="_blank" rel="noopener noreferrer" className="hover:underline flex items-center gap-1">
              <span>e-notarius.uz</span>
              <ExternalLink className="w-3 h-3" />
            </a>
            <span>·</span>
            <a href="https://my.gov.uz" target="_blank" rel="noopener noreferrer" className="hover:underline flex items-center gap-1">
              <span>my.gov.uz</span>
              <ExternalLink className="w-3 h-3" />
            </a>
          </div>
        </div>
      </footer>
    </div>
  );
}
