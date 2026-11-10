import React, { useState } from 'react';
import { Language } from '../types';
import { translations } from '../translations';
import { Calculator, X, Info } from 'lucide-react';

interface FeeCalculatorModalProps {
  isOpen: boolean;
  onClose: () => void;
  language: Language;
}

export const FeeCalculatorModal: React.FC<FeeCalculatorModalProps> = ({
  isOpen,
  onClose,
  language,
}) => {
  const t = translations[language];
  const BHM = 412000; // 1 BHM in UZS

  const [category, setCategory] = useState<'car' | 'house' | 'attorney'>('car');
  const [carAge, setCarAge] = useState<'new' | 'mid' | 'old'>('mid');
  const [isCloseRelative, setIsCloseRelative] = useState<boolean>(false);
  const [houseLocation, setHouseLocation] = useState<'tashkent' | 'region'>('tashkent');
  const [attorneyType, setAttorneyType] = useState<'drive' | 'sell'>('sell');

  if (!isOpen) return null;

  // Calculation logic
  let totalBhmMultiplier = 1;
  let breakdownDetails: { label: string; amount: number }[] = [];

  if (category === 'car') {
    if (isCloseRelative) {
      totalBhmMultiplier = 0.5;
    } else {
      if (carAge === 'new') totalBhmMultiplier = 3.0; // Under 3 years
      else if (carAge === 'mid') totalBhmMultiplier = 2.0; // 3 to 7 years
      else totalBhmMultiplier = 1.0; // Over 7 years
    }

    const notaryFee = totalBhmMultiplier * BHM;
    const plateFee = 1.5 * BHM;
    const regFee = 0.7 * BHM;

    breakdownDetails = [
      { label: "Notarius davlat boji", amount: notaryFee },
      { label: "Yangi davlat raqam belgisi (YHXDX)", amount: plateFee },
      { label: "Yangi Tex-pasport guvohnomasi", amount: regFee },
    ];
  } else if (category === 'house') {
    if (isCloseRelative) {
      totalBhmMultiplier = 0.5;
    } else {
      totalBhmMultiplier = houseLocation === 'tashkent' ? 1.0 : 0.5;
    }

    const notaryFee = totalBhmMultiplier * BHM;
    const cadastreRegFee = 1.2 * BHM;

    breakdownDetails = [
      { label: "Notarius davlat boji", amount: notaryFee },
      { label: "Kadastr ro'yxatdan o'tkazish xizmati", amount: cadastreRegFee },
    ];
  } else {
    // Power of attorney
    if (attorneyType === 'sell') {
      totalBhmMultiplier = isCloseRelative ? 1.0 : 3.0;
    } else {
      totalBhmMultiplier = isCloseRelative ? 0.1 : 1.0;
    }

    const notaryFee = totalBhmMultiplier * BHM;
    const blankFee = 0.1 * BHM;

    breakdownDetails = [
      { label: "Ishonchnoma davlat boji", amount: notaryFee },
      { label: "Gerbli maxsus blanka va e-notarius to'lovi", amount: blankFee },
    ];
  }

  const grandTotal = breakdownDetails.reduce((acc, curr) => acc + curr.amount, 0);

  return (
    <div className="fixed inset-0 z-[2000] flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-sm animate-in fade-in duration-200">
      <div className="bg-white dark:bg-slate-900 w-full max-w-xl rounded-3xl p-6 shadow-2xl border border-slate-200 dark:border-slate-800 space-y-5">
        {/* Header */}
        <div className="flex items-center justify-between pb-3 border-b border-slate-100 dark:border-slate-800">
          <div className="flex items-center gap-2.5">
            <div className="w-10 h-10 rounded-xl bg-blue-600 text-white flex items-center justify-center shadow-md">
              <Calculator className="w-5 h-5" />
            </div>
            <div>
              <h3 className="font-bold text-slate-900 dark:text-white text-base sm:text-lg">
                {t.calcTitle}
              </h3>
              <p className="text-xs text-slate-500">{t.calcCurrentBHM}</p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-1.5 rounded-lg text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 hover:bg-slate-100 dark:hover:bg-slate-800"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Category selector */}
        <div className="grid grid-cols-3 gap-2 p-1 bg-slate-100 dark:bg-slate-800 rounded-xl">
          <button
            onClick={() => setCategory('car')}
            className={`py-2 px-3 rounded-lg text-xs font-bold transition-all ${
              category === 'car'
                ? 'bg-white dark:bg-slate-700 text-slate-900 dark:text-white shadow-sm'
                : 'text-slate-600 dark:text-slate-400'
            }`}
          >
            🚗 {t.calcCarSale}
          </button>
          <button
            onClick={() => setCategory('house')}
            className={`py-2 px-3 rounded-lg text-xs font-bold transition-all ${
              category === 'house'
                ? 'bg-white dark:bg-slate-700 text-slate-900 dark:text-white shadow-sm'
                : 'text-slate-600 dark:text-slate-400'
            }`}
          >
            🏠 {t.calcHouseSale}
          </button>
          <button
            onClick={() => setCategory('attorney')}
            className={`py-2 px-3 rounded-lg text-xs font-bold transition-all ${
              category === 'attorney'
                ? 'bg-white dark:bg-slate-700 text-slate-900 dark:text-white shadow-sm'
                : 'text-slate-600 dark:text-slate-400'
            }`}
          >
            📜 {t.calcPowerOfAttorney}
          </button>
        </div>

        {/* Dynamic Form Options */}
        <div className="space-y-4 text-xs">
          {category === 'car' && (
            <div>
              <label className="font-semibold text-slate-700 dark:text-slate-300 block mb-1.5">
                {t.calcCarYear}
              </label>
              <div className="grid grid-cols-3 gap-2">
                <button
                  type="button"
                  onClick={() => setCarAge('new')}
                  className={`p-2.5 rounded-xl border text-center font-semibold ${
                    carAge === 'new'
                      ? 'border-blue-600 bg-blue-50 dark:bg-blue-950/40 text-blue-600'
                      : 'border-slate-200 dark:border-slate-800 text-slate-600 dark:text-slate-400'
                  }`}
                >
                  3 yilgacha (Yangi)
                </button>
                <button
                  type="button"
                  onClick={() => setCarAge('mid')}
                  className={`p-2.5 rounded-xl border text-center font-semibold ${
                    carAge === 'mid'
                      ? 'border-blue-600 bg-blue-50 dark:bg-blue-950/40 text-blue-600'
                      : 'border-slate-200 dark:border-slate-800 text-slate-600 dark:text-slate-400'
                  }`}
                >
                  3 yildan 7 yilgacha
                </button>
                <button
                  type="button"
                  onClick={() => setCarAge('old')}
                  className={`p-2.5 rounded-xl border text-center font-semibold ${
                    carAge === 'old'
                      ? 'border-blue-600 bg-blue-50 dark:bg-blue-950/40 text-blue-600'
                      : 'border-slate-200 dark:border-slate-800 text-slate-600 dark:text-slate-400'
                  }`}
                >
                  7 yildan ortiq
                </button>
              </div>
            </div>
          )}

          {category === 'house' && (
            <div>
              <label className="font-semibold text-slate-700 dark:text-slate-300 block mb-1.5">
                Mulk joylashgan hudud:
              </label>
              <div className="grid grid-cols-2 gap-2">
                <button
                  type="button"
                  onClick={() => setHouseLocation('tashkent')}
                  className={`p-2.5 rounded-xl border text-center font-semibold ${
                    houseLocation === 'tashkent'
                      ? 'border-blue-600 bg-blue-50 dark:bg-blue-950/40 text-blue-600'
                      : 'border-slate-200 dark:border-slate-800 text-slate-600'
                  }`}
                >
                  Toshkent shahri
                </button>
                <button
                  type="button"
                  onClick={() => setHouseLocation('region')}
                  className={`p-2.5 rounded-xl border text-center font-semibold ${
                    houseLocation === 'region'
                      ? 'border-blue-600 bg-blue-50 dark:bg-blue-950/40 text-blue-600'
                      : 'border-slate-200 dark:border-slate-800 text-slate-600'
                  }`}
                >
                  Viloyatlar / Tumanlar
                </button>
              </div>
            </div>
          )}

          {category === 'attorney' && (
            <div>
              <label className="font-semibold text-slate-700 dark:text-slate-300 block mb-1.5">
                Ishonchnoma vakolati turi:
              </label>
              <div className="grid grid-cols-2 gap-2">
                <button
                  type="button"
                  onClick={() => setAttorneyType('sell')}
                  className={`p-2.5 rounded-xl border text-center font-semibold ${
                    attorneyType === 'sell'
                      ? 'border-blue-600 bg-blue-50 dark:bg-blue-950/40 text-blue-600'
                      : 'border-slate-200 dark:border-slate-800 text-slate-600'
                  }`}
                >
                  Sotish huquqi bilan (Bosh ishonchnoma)
                </button>
                <button
                  type="button"
                  onClick={() => setAttorneyType('drive')}
                  className={`p-2.5 rounded-xl border text-center font-semibold ${
                    attorneyType === 'drive'
                      ? 'border-blue-600 bg-blue-50 dark:bg-blue-950/40 text-blue-600'
                      : 'border-slate-200 dark:border-slate-800 text-slate-600'
                  }`}
                >
                  Faqat boshqarish huquqi
                </button>
              </div>
            </div>
          )}

          {/* Relationship toggle */}
          <div>
            <label className="font-semibold text-slate-700 dark:text-slate-300 block mb-1.5">
              {t.calcRelationship}
            </label>
            <div className="grid grid-cols-2 gap-2">
              <button
                type="button"
                onClick={() => setIsCloseRelative(false)}
                className={`p-2.5 rounded-xl border text-center font-semibold ${
                  !isCloseRelative
                    ? 'border-emerald-600 bg-emerald-50 dark:bg-emerald-950/40 text-emerald-700 dark:text-emerald-300'
                    : 'border-slate-200 dark:border-slate-800 text-slate-600'
                }`}
              >
                {t.calcRelNone}
              </button>
              <button
                type="button"
                onClick={() => setIsCloseRelative(true)}
                className={`p-2.5 rounded-xl border text-center font-semibold ${
                  isCloseRelative
                    ? 'border-emerald-600 bg-emerald-50 dark:bg-emerald-950/40 text-emerald-700 dark:text-emerald-300'
                    : 'border-slate-200 dark:border-slate-800 text-slate-600'
                }`}
              >
                {t.calcRelClose}
              </button>
            </div>
          </div>
        </div>

        {/* Calculation Result Breakdown */}
        <div className="p-4 bg-slate-50 dark:bg-slate-800/60 rounded-2xl border border-slate-200 dark:border-slate-700/60 space-y-2">
          <span className="text-xs font-semibold text-slate-500 uppercase tracking-wider block">
            To'lovlar taqsimoti:
          </span>
          {breakdownDetails.map((item, idx) => (
            <div key={idx} className="flex justify-between text-xs text-slate-700 dark:text-slate-300">
              <span>{item.label}</span>
              <span className="font-semibold">{item.amount.toLocaleString()} so'm</span>
            </div>
          ))}

          <div className="pt-2 mt-2 border-t border-slate-200 dark:border-slate-700 flex justify-between items-baseline">
            <span className="font-bold text-slate-900 dark:text-white text-sm">
              {t.calcResultTotal}
            </span>
            <span className="font-extrabold text-base sm:text-lg text-emerald-600 dark:text-emerald-400">
              {grandTotal.toLocaleString()} so'm
            </span>
          </div>
        </div>

        {/* Note */}
        <div className="flex items-start gap-2 text-[11px] text-slate-500 dark:text-slate-400">
          <Info className="w-3.5 h-3.5 text-blue-500 flex-shrink-0 mt-0.5" />
          <span>
            Davlat bojlari O'zbekiston Respublikasi «Davlat boji to'g'risida»gi Qonuni asosida hisoblangan.
          </span>
        </div>
      </div>
    </div>
  );
};
