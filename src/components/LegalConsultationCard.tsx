import React, { useState } from 'react';
import { Language, LegalConsultationResult } from '../types';
import { translations } from '../translations';
import { voiceService } from '../services/voiceService';
import {
  Volume2,
  MapPin,
  CheckCircle2,
  AlertCircle,
  ArrowRight,
  Bus,
  Share2
} from 'lucide-react';

interface LegalConsultationCardProps {
  data: LegalConsultationResult;
  language: Language;
  onViewOnMap: () => void;
}

export const LegalConsultationCard: React.FC<LegalConsultationCardProps> = ({
  data,
  language,
  onViewOnMap,
}) => {
  const t = translations[language];
  const [copied, setCopied] = useState(false);

  const handleReadFull = () => {
    const fullText = `${data.title}. ${data.shortSummary}. Boradigan manzil: ${data.locationName}, ${data.address}.`;
    voiceService.speak(fullText, language);
  };

  const handleShare = () => {
    const shareText = `${data.title}\n${data.shortSummary}\n\nManzil: ${data.locationName} (${data.address})\nAvtobuslar: ${data.buses.join(', ')}`;
    if (navigator.share) {
      navigator.share({
        title: data.title,
        text: shareText,
        url: window.location.href,
      }).catch(() => {});
    } else {
      navigator.clipboard.writeText(shareText);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    }
  };

  return (
    <div className="bg-white dark:bg-slate-900 rounded-2xl p-5 shadow-md border border-slate-200 dark:border-slate-800 space-y-4">
      {/* Title & Speech Button */}
      <div className="flex items-start justify-between gap-3 pb-3 border-b border-slate-100 dark:border-slate-800">
        <div>
          <span className="text-[11px] font-bold text-emerald-600 dark:text-emerald-400 bg-emerald-50 dark:bg-emerald-950/40 px-2 py-0.5 rounded-md">
            Huquqiy Yo'riqnoma
          </span>
          <h3 className="font-bold text-slate-900 dark:text-white text-base mt-1">
            {data.title}
          </h3>
        </div>

        <div className="flex items-center gap-1.5 flex-shrink-0">
          <button
            onClick={handleReadFull}
            title={t.readAloud}
            className="p-2 rounded-xl bg-amber-500 hover:bg-amber-600 text-white font-medium text-xs flex items-center gap-1 transition-colors shadow-xs"
          >
            <Volume2 className="w-4 h-4" />
            <span className="hidden sm:inline">Eshitish</span>
          </button>
          <button
            onClick={handleShare}
            className="p-2 rounded-xl bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-300 hover:bg-slate-200 text-xs transition-colors"
          >
            <Share2 className="w-4 h-4" />
          </button>
        </div>
      </div>

      {/* 1. Qayerga borish kerak (Manzil) */}
      <div className="p-3.5 bg-blue-50/70 dark:bg-blue-950/30 rounded-xl border border-blue-200/80 dark:border-blue-900 text-xs space-y-1">
        <span className="font-bold text-blue-800 dark:text-blue-300 flex items-center gap-1.5">
          <MapPin className="w-4 h-4 text-blue-600" />
          Qayerga borasiz:
        </span>
        <div className="font-semibold text-slate-900 dark:text-white text-sm">
          {data.locationName}
        </div>
        <div className="text-slate-600 dark:text-slate-300">
          {data.address}
        </div>
        <div className="text-emerald-700 dark:text-emerald-400 font-medium pt-1 flex items-center gap-1">
          <Bus className="w-3.5 h-3.5" />
          <span>Qatnovchi avtobuslar: {data.buses.join(', ')}-sonli yo'nalishlar</span>
        </div>
      </div>

      {/* 2. Kerakli hujjatlar (Sodda ro'yxat) */}
      <div className="space-y-1.5">
        <span className="text-xs font-bold text-slate-700 dark:text-slate-300 uppercase tracking-wider block">
          Kerakli hujjatlar:
        </span>
        <div className="space-y-1.5">
          {data.documents.slice(0, 4).map((doc, idx) => (
            <div
              key={idx}
              className="p-2.5 bg-slate-50 dark:bg-slate-800/60 rounded-xl border border-slate-200/70 dark:border-slate-800 text-xs flex items-center justify-between gap-2"
            >
              <div className="flex items-center gap-2">
                <CheckCircle2 className="w-4 h-4 text-emerald-600 flex-shrink-0" />
                <span className="font-medium text-slate-800 dark:text-slate-200">{doc.name}</span>
              </div>
              <span className="text-[10px] text-slate-500 bg-slate-200/70 dark:bg-slate-700 px-1.5 py-0.5 rounded flex-shrink-0">
                {doc.requiredBy}
              </span>
            </div>
          ))}
        </div>
      </div>

      {/* 3. Muhim eslatma */}
      {data.warnings && data.warnings.length > 0 && (
        <div className="p-3 bg-amber-50 dark:bg-amber-950/30 rounded-xl border border-amber-200 dark:border-amber-900/60 text-xs text-amber-900 dark:text-amber-200 flex items-start gap-2">
          <AlertCircle className="w-4 h-4 text-amber-600 flex-shrink-0 mt-0.5" />
          <span className="leading-relaxed font-medium">
            {data.warnings[0]}
          </span>
        </div>
      )}

      {/* Primary Action Button: View on Map */}
      <button
        onClick={onViewOnMap}
        className="w-full py-3 px-4 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white font-bold text-sm flex items-center justify-center gap-2 transition-all shadow-sm"
      >
        <span>Xaritada manzilni ko'rish</span>
        <ArrowRight className="w-4 h-4" />
      </button>
    </div>
  );
};
