export type Language = 'uz' | 'ru' | 'en';
export type ThemeMode = 'light' | 'dark';

export interface DocumentItem {
  name: string;
  note: string;
  requiredBy: string;
  checked?: boolean;
}

export interface LegalStep {
  step: number;
  title: string;
  desc: string;
}

export interface RegionInfo {
  id: string;
  name: string;
  nameRu: string;
  nameEn: string;
  lat: number;
  lng: number;
  zoom: number;
}

export interface LegalLocation {
  id: string;
  region: string;
  name: string;
  nameRu?: string;
  nameEn?: string;
  type: 'notary' | 'traffic_police' | 'dxm' | 'cadastre' | 'fhdyo' | 'court';
  lat: number;
  lng: number;
  address: string;
  hours: string;
  phone: string;
  buses: string[];
  services: string[];
}

export interface BusStop {
  name: string;
  lat: number;
  lng: number;
}

export interface BusRoute {
  id: string;
  region: string;
  name: string;
  color: string;
  interval: string;
  stops: BusStop[];
}

export interface LiveBus {
  id: string;
  routeId: string;
  routeName: string;
  lat: number;
  lng: number;
  bearing: number;
  speedKmH: number;
  nextStop: string;
  etaMinutes: number;
  color: string;
  segmentIndex?: number;
  progress?: number;
  status?: 'moving' | 'at_stop';
  direction?: 1 | -1;
  waitTimer?: number;
}

export interface LegalConsultationResult {
  title: string;
  shortSummary: string;
  voiceScript?: string;
  documents: DocumentItem[];
  steps: LegalStep[];
  approxFees?: string;
  warnings?: string[];
  targetLocationType?: string;
  targetLocationId?: string;
  locationName: string;
  address: string;
  region?: string;
  lat?: number;
  lng?: number;
  buses: string[];
  transitAdvice: string;
  source?: string;
  durationMs?: number;
}

export interface ChatMessage {
  id: string;
  sender: 'user' | 'ai';
  text: string;
  timestamp: string;
  consultationData?: LegalConsultationResult;
}
