import { Language } from '../types';

export class VoiceService {
  private static instance: VoiceService;
  private synth: SpeechSynthesis | null = null;
  private recognition: any = null;
  private isSpeaking = false;
  private currentUtterance: SpeechSynthesisUtterance | null = null;

  private constructor() {
    if (typeof window !== 'undefined' && 'speechSynthesis' in window) {
      this.synth = window.speechSynthesis;
      // Preload voices
      if (this.synth.onvoiceschanged !== undefined) {
        this.synth.onvoiceschanged = () => {
          this.getAvailableVoices();
        };
      }
    }

    if (typeof window !== 'undefined') {
      const SpeechRecognition =
        (window as any).SpeechRecognition || (window as any).webkitSpeechRecognition;
      if (SpeechRecognition) {
        this.recognition = new SpeechRecognition();
        this.recognition.continuous = false;
        this.recognition.interimResults = false;
      }
    }
  }

  public static getInstance(): VoiceService {
    if (!VoiceService.instance) {
      VoiceService.instance = new VoiceService();
    }
    return VoiceService.instance;
  }

  public getAvailableVoices(): SpeechSynthesisVoice[] {
    if (!this.synth) return [];
    return this.synth.getVoices();
  }

  /**
   * Find the softest, most gentle female voice available on the device
   */
  private selectGentleFemaleVoice(language: Language): SpeechSynthesisVoice | null {
    if (!this.synth) return null;
    const voices = this.synth.getVoices();
    if (!voices || voices.length === 0) return null;

    // Female voice indicators across system languages
    const femaleKeywords = [
      'female', 'woman', 'qiz', 'girl', 'milena', 'tatyana', 'alisa',
      'samantha', 'victoria', 'karen', 'moira', 'fiona', 'anna', 'elena',
      'irina', 'zira', 'yandex', 'google', 'natural'
    ];

    // Explicit male exclusion keywords
    const maleKeywords = ['male', 'man', 'david', 'george', 'mark', 'stefan', 'pavel', 'alex', 'fred'];

    // 1. Look for Uzbek female voice if exists
    if (language === 'uz') {
      const uzVoice = voices.find(v =>
        v.lang.toLowerCase().startsWith('uz') &&
        femaleKeywords.some(kw => v.name.toLowerCase().includes(kw))
      );
      if (uzVoice) return uzVoice;

      const anyUz = voices.find(v => v.lang.toLowerCase().startsWith('uz'));
      if (anyUz) return anyUz;

      // Turkish, Russian or Google Natural female voices sound very soft and natural for Uzbek phonetics
      const softFeminine = voices.find(v =>
        (v.lang.startsWith('tr') || v.lang.startsWith('ru') || v.lang.startsWith('en')) &&
        femaleKeywords.some(kw => v.name.toLowerCase().includes(kw)) &&
        !maleKeywords.some(kw => v.name.toLowerCase().includes(kw))
      );
      if (softFeminine) return softFeminine;
    } else if (language === 'ru') {
      const ruFemale = voices.find(v =>
        v.lang.startsWith('ru') &&
        femaleKeywords.some(kw => v.name.toLowerCase().includes(kw)) &&
        !maleKeywords.some(kw => v.name.toLowerCase().includes(kw))
      );
      if (ruFemale) return ruFemale;
    } else {
      const enFemale = voices.find(v =>
        v.lang.startsWith('en') &&
        femaleKeywords.some(kw => v.name.toLowerCase().includes(kw)) &&
        !maleKeywords.some(kw => v.name.toLowerCase().includes(kw))
      );
      if (enFemale) return enFemale;
    }

    // General fallback: any non-male voice
    const fallback = voices.find(v => !maleKeywords.some(kw => v.name.toLowerCase().includes(kw)));
    return fallback || voices[0] || null;
  }

  /**
   * Speak with a gentle, soft Uzbek female tone ('mayin ovozli o'zbek qizi')
   */
  public speak(
    text: string,
    language: Language = 'uz',
    onStart?: () => void,
    onEnd?: () => void,
    onError?: (err: any) => void
  ): void {
    if (!this.synth) {
      if (onError) onError('Speech synthesis not supported');
      return;
    }

    this.stop();

    // Clean text: strip markdown characters and emojis
    const cleanText = text
      .replace(/[#*_`~>\[\]\(\)]/g, ' ')
      .replace(/[\u{1F300}-\u{1F6FF}\u{1F900}-\u{1F9FF}\u{2600}-\u{26FF}]/gu, '')
      .replace(/\s+/g, ' ')
      .trim();

    if (!cleanText) return;

    const utterance = new SpeechSynthesisUtterance(cleanText);
    this.currentUtterance = utterance;

    // Calibration for sweet, polite, gentle female voice
    utterance.pitch = 1.24; // Sweet, gentle female pitch
    utterance.rate = 0.92;  // Calm, polite pacing
    utterance.volume = 0.95;

    const selectedVoice = this.selectGentleFemaleVoice(language);
    if (selectedVoice) {
      utterance.voice = selectedVoice;
      utterance.lang = selectedVoice.lang;
    } else {
      utterance.lang = language === 'uz' ? 'uz-UZ' : language === 'ru' ? 'ru-RU' : 'en-US';
    }

    utterance.onstart = () => {
      this.isSpeaking = true;
      if (onStart) onStart();
    };

    utterance.onend = () => {
      this.isSpeaking = false;
      this.currentUtterance = null;
      if (onEnd) onEnd();
    };

    utterance.onerror = (e) => {
      this.isSpeaking = false;
      this.currentUtterance = null;
      if (onError) onError(e);
    };

    this.synth.speak(utterance);
  }

  public stop(): void {
    if (this.synth) {
      this.synth.cancel();
      this.isSpeaking = false;
      this.currentUtterance = null;
    }
  }

  public isCurrentlySpeaking(): boolean {
    return this.isSpeaking || (this.synth ? this.synth.speaking : false);
  }

  /**
   * Listen for user speech in Uzbek, Russian, or English
   */
  public listen(
    language: Language,
    onResult: (text: string) => void,
    onError: (err: any) => void,
    onEnd: () => void
  ): void {
    if (!this.recognition) {
      onError('Speech recognition is not supported in this browser');
      return;
    }

    try {
      this.recognition.abort();
    } catch (_) {}

    const langCode = language === 'uz' ? 'uz-UZ' : language === 'ru' ? 'ru-RU' : 'en-US';
    this.recognition.lang = langCode;

    this.recognition.onresult = (event: any) => {
      const transcript = event.results[0][0].transcript;
      onResult(transcript);
    };

    this.recognition.onerror = (event: any) => {
      onError(event.error);
    };

    this.recognition.onend = () => {
      onEnd();
    };

    this.recognition.start();
  }

  public stopListening(): void {
    if (this.recognition) {
      try {
        this.recognition.stop();
      } catch (_) {}
    }
  }
}

export const voiceService = VoiceService.getInstance();
