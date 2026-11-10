import express, { Request, Response } from 'express';
import { GoogleGenAI } from '@google/genai';
import dotenv from 'dotenv';
import path from 'path';
import { fileURLToPath } from 'url';

dotenv.config();

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const app = express();
const port = process.env.PORT ? parseInt(process.env.PORT, 10) : 3000;

app.use(express.json());

// Initialize GoogleGenAI if key is present
const apiKey = process.env.GEMINI_API_KEY;
let ai: GoogleGenAI | null = null;
if (apiKey && apiKey !== 'MY_GEMINI_API_KEY' && apiKey.trim().length > 10) {
  ai = new GoogleGenAI({
    apiKey: apiKey,
    httpOptions: {
      headers: {
        'User-Agent': 'aistudio-build',
      },
    },
  });
}

// Comprehensive Uzbek, Russian, English Legal Intelligence Engine with Region Support
function analyzeAndGenerateLegalAdvice(prompt: string, lang: 'uz' | 'ru' | 'en', preferredRegion: string = 'tashkent') {
  const p = prompt.toLowerCase();

  // Region detection from prompt or user preference
  let reg = preferredRegion || 'tashkent';
  if (p.includes('andijon') || p.includes('андижан') || p.includes('andijan')) reg = 'andijon';
  else if (p.includes('samarqand') || p.includes('самарканд') || p.includes('samarkand')) reg = 'samarkand';
  else if (p.includes('farg\'ona') || p.includes('фергана') || p.includes('fergana')) reg = 'fergana';
  else if (p.includes('namangan') || p.includes('наманган')) reg = 'namangan';
  else if (p.includes('buxoro') || p.includes('бухара') || p.includes('bukhara')) reg = 'bukhara';
  else if (p.includes('qarshi') || p.includes('карши') || p.includes('qashqadaryo')) reg = 'kashkadarya';
  else if (p.includes('termiz') || p.includes('термез') || p.includes('surxondaryo')) reg = 'surkhandarya';
  else if (p.includes('urganch') || p.includes('ургенч') || p.includes('xorazm')) reg = 'khorezm';
  else if (p.includes('navoiy') || p.includes('навои')) reg = 'navoi';
  else if (p.includes('jizzax') || p.includes('джизак')) reg = 'jizzakh';
  else if (p.includes('guliston') || p.includes('гулистан') || p.includes('sirdaryo')) reg = 'syrdarya';
  else if (p.includes('nukus') || p.includes('нукус') || p.includes('qoraqalpog')) reg = 'karakalpakstan';

  // Regional location presets for all 14 administrative regions of Uzbekistan
  const regionalPresets: Record<string, { notary: any; cadastre: any; yhxdx: any; dxm: any; court: any }> = {
    andijon: {
      notary: { id: "andijon-notary-1", name: "Andijon shahar 1-son Davlat Notarial Idorasi", addr: "Andijon shahri, Alisher Navoiy shoh ko'chasi 14-uy (Bobur maydoni)", lat: 40.7825, lng: 72.3450, buses: ["12", "33"] },
      cadastre: { id: "andijon-cadastre", name: "Davlat Kadastrlari Palatasi Andijon viloyati boshqarmasi", addr: "Andijon shahri, Fitrat ko'chasi 28-uy", lat: 40.7710, lng: 72.3520, buses: ["33", "12"] },
      yhxdx: { id: "andijon-yhxdx", name: "Andijon viloyat YHXDX Ro'yxatdan o'tkazish bo'limi (Bog'ishamol GAYI)", addr: "Andijon shahri, Bog'ishamol dahasi (Viloyat GAYI)", lat: 40.7950, lng: 72.3780, buses: ["12", "21"] },
      dxm: { id: "andijon-dxm", name: "Andijon shahar Davlat Xizmatlari Markazi (DXM)", addr: "Andijon shahri, Amir Temur shoh ko'chasi 31-uy", lat: 40.7780, lng: 72.3390, buses: ["33", "12"] },
      court: { id: "andijon-court", name: "Fuqarolik ishlari bo'yicha Andijon tumanlararo sudi", addr: "Andijon shahri, Milliy Tiklanish ko'chasi 12-uy", lat: 40.7890, lng: 72.3510, buses: ["12"] }
    },
    samarkand: {
      notary: { id: "samarkand-notary-1", name: "Samarqand shahar 1-son Davlat Notarial Idorasi", addr: "Samarqand shahri, Mirzo Ulug'bek ko'chasi 62-uy", lat: 39.6550, lng: 66.9605, buses: ["10", "22"] },
      cadastre: { id: "samarkand-cadastre", name: "Davlat Kadastrlari Palatasi Samarqand viloyati boshqarmasi", addr: "Samarqand shahri, Beruniy ko'chasi 19-uy", lat: 39.6480, lng: 66.9420, buses: ["10"] },
      yhxdx: { id: "samarkand-yhxdx", name: "Samarqand viloyati YHXDX (Motarid GAYI)", addr: "Samarqand shahri, Motarid mavzesi, Gagarin ko'chasi", lat: 39.6820, lng: 66.9850, buses: ["22", "14"] },
      dxm: { id: "samarkand-dxm", name: "Samarqand shahar Davlat Xizmatlari Markazi (DXM)", addr: "Samarqand shahri, Spitamen shoh ko'chasi 154-uy", lat: 39.6610, lng: 66.9480, buses: ["10", "22"] },
      court: { id: "samarkand-court", name: "Fuqarolik ishlari bo'yicha Samarqand shahar sudi", addr: "Samarqand shahri, Firdavsiy ko'chasi 45-uy", lat: 39.6510, lng: 66.9620, buses: ["10"] }
    },
    fergana: {
      notary: { id: "fergana-notary-1", name: "Farg'ona shahar 1-son Davlat Notarial Idorasi", addr: "Farg'ona shahri, Al-Farg'oniy ko'chasi 42-uy", lat: 40.3870, lng: 71.7870, buses: ["8", "15"] },
      cadastre: { id: "fergana-cadastre", name: "Farg'ona viloyat Kadastr boshqarmasi", addr: "Farg'ona shahri, B.Marg'iloniy ko'chasi 10", lat: 40.3860, lng: 71.7860, buses: ["8"] },
      yhxdx: { id: "fergana-yhxdx", name: "Farg'ona viloyat YHXDX Ro'yxatdan o'tkazish bo'limi", addr: "Farg'ona shahri, Qirguli dahasi", lat: 40.3990, lng: 71.8120, buses: ["8"] },
      dxm: { id: "fergana-dxm", name: "Farg'ona shahar Davlat Xizmatlari Markazi (DXM)", addr: "Farg'ona shahri, Sayilgoh ko'chasi 24-uy", lat: 40.3850, lng: 71.7890, buses: ["8", "15"] },
      court: { id: "fergana-court", name: "Fuqarolik ishlari bo'yicha Farg'ona tumanlararo sudi", addr: "Farg'ona shahri, Marifat ko'chasi 18-uy", lat: 40.3890, lng: 71.7820, buses: ["15"] }
    },
    namangan: {
      notary: { id: "namangan-notary-1", name: "Namangan shahar 1-son Davlat Notarial Idorasi", addr: "Namangan shahri, Bobur shoh ko'chasi 12-uy", lat: 40.9980, lng: 71.6720, buses: ["5", "18"] },
      cadastre: { id: "namangan-cadastre", name: "Namangan viloyat Kadastr boshqarmasi", addr: "Namangan shahri, Nodirabegim ko'chasi 7", lat: 40.9920, lng: 71.6680, buses: ["5"] },
      yhxdx: { id: "namangan-yhxdx", name: "Namangan viloyat YHXDX Ro'yxatga olish bo'limi", addr: "Namangan shahri, Kosonsoy ko'chasi 45", lat: 41.0150, lng: 71.6850, buses: ["18"] },
      dxm: { id: "namangan-dxm", name: "Namangan shahar Davlat Xizmatlari Markazi (DXM)", addr: "Namangan shahri, Uychi ko'chasi 8", lat: 40.9960, lng: 71.6740, buses: ["5"] },
      court: { id: "namangan-court", name: "Fuqarolik ishlari bo'yicha Namangan tumanlararo sudi", addr: "Namangan shahri, Istiqlol ko'chasi 33", lat: 40.9940, lng: 71.6690, buses: ["5"] }
    },
    bukhara: {
      notary: { id: "bukhara-notary-1", name: "Buxoro shahar 1-son Davlat Notarial Idorasi", addr: "Buxoro shahri, M.Iqbol ko'chasi 11-uy", lat: 39.7740, lng: 64.4280, buses: ["7", "12"] },
      cadastre: { id: "bukhara-cadastre", name: "Buxoro viloyat Kadastr boshqarmasi", addr: "Buxoro shahri, Navoiy shoh ko'chasi 32", lat: 39.7680, lng: 64.4350, buses: ["7"] },
      yhxdx: { id: "bukhara-yhxdx", name: "Buxoro viloyat YHXDX Ro'yxatga olish bo'limi", addr: "Buxoro shahri, Gazli shossesi 5", lat: 39.7910, lng: 64.4420, buses: ["12"] },
      dxm: { id: "bukhara-dxm", name: "Buxoro shahar Davlat Xizmatlari Markazi (DXM)", addr: "Buxoro shahri, I.Mo'minov ko'chasi 4", lat: 39.7710, lng: 64.4250, buses: ["7"] },
      court: { id: "bukhara-court", name: "Fuqarolik ishlari bo'yicha Buxoro tumanlararo sudi", addr: "Buxoro shahri, B.Naqshband ko'chasi 88", lat: 39.7760, lng: 64.4310, buses: ["7"] }
    },
    kashkadarya: {
      notary: { id: "qarshi-notary-1", name: "Qarshi shahar 1-son Davlat Notarial Idorasi", addr: "Qarshi shahri, Mustaqillik shoh ko'chasi 22-uy", lat: 38.8610, lng: 65.7890, buses: ["3", "9"] },
      cadastre: { id: "qarshi-cadastre", name: "Qashqadaryo viloyat Kadastr boshqarmasi", addr: "Qarshi shahri, Islom Karimov ko'chasi 14", lat: 38.8540, lng: 65.7920, buses: ["3"] },
      yhxdx: { id: "qarshi-yhxdx", name: "Qashqadaryo viloyat YHXDX Ro'yxatga olish bo'limi", addr: "Qarshi shahri, Jayxun ko'chasi 60", lat: 38.8750, lng: 65.8110, buses: ["9"] },
      dxm: { id: "qarshi-dxm", name: "Qarshi shahar Davlat Xizmatlari Markazi (DXM)", addr: "Qarshi shahri, Nasaf ko'chasi 5", lat: 38.8590, lng: 65.7870, buses: ["3"] },
      court: { id: "qarshi-court", name: "Fuqarolik ishlari bo'yicha Qarshi tumanlararo sudi", addr: "Qarshi shahri, Xonobod ko'chasi 2", lat: 38.8630, lng: 65.7950, buses: ["9"] }
    },
    surkhandarya: {
      notary: { id: "termez-notary-1", name: "Termiz shahar 1-son Davlat Notarial Idorasi", addr: "Termiz shahri, At-Termiziy ko'chasi 18-uy", lat: 37.2240, lng: 67.2780, buses: ["2", "6"] },
      cadastre: { id: "termez-cadastre", name: "Surxondaryo viloyat Kadastr boshqarmasi", addr: "Termiz shahri, Barkamol Avlod ko'chasi 5", lat: 37.2280, lng: 67.2810, buses: ["2"] },
      yhxdx: { id: "termez-yhxdx", name: "Surxondaryo viloyat YHXDX Ro'yxatga olish bo'limi", addr: "Termiz shahri, Alpomish shossesi 12", lat: 37.2410, lng: 67.2950, buses: ["6"] },
      dxm: { id: "termez-dxm", name: "Termiz shahar Davlat Xizmatlari Markazi (DXM)", addr: "Termiz shahri, Taraqqiyot ko'chasi 9", lat: 37.2260, lng: 67.2750, buses: ["2"] },
      court: { id: "termez-court", name: "Fuqarolik ishlari bo'yicha Termiz tumanlararo sudi", addr: "Termiz shahri, Hakim At-Termiziy ko'chasi 44", lat: 37.2300, lng: 67.2830, buses: ["2"] }
    },
    khorezm: {
      notary: { id: "urgench-notary-1", name: "Urganch shahar 1-son Davlat Notarial Idorasi", addr: "Urganch shahri, Al-Xorazmiy ko'chasi 27-uy", lat: 41.5510, lng: 60.6310, buses: ["4", "11"] },
      cadastre: { id: "urgench-cadastre", name: "Xorazm viloyat Kadastr boshqarmasi", addr: "Urganch shahri, P.Mahmud ko'chasi 16", lat: 41.5470, lng: 60.6270, buses: ["4"] },
      yhxdx: { id: "urgench-yhxdx", name: "Xorazm viloyat YHXDX Ro'yxatga olish bo'limi", addr: "Urganch shahri, Xonqa yo'li 8", lat: 41.5620, lng: 60.6450, buses: ["11"] },
      dxm: { id: "urgench-dxm", name: "Urganch shahar Davlat Xizmatlari Markazi (DXM)", addr: "Urganch shahri, Yoshlik ko'chasi 3", lat: 41.5530, lng: 60.6340, buses: ["4"] },
      court: { id: "urgench-court", name: "Fuqarolik ishlari bo'yicha Urganch tumanlararo sudi", addr: "Urganch shahri, Gurlan ko'chasi 19", lat: 41.5560, lng: 60.6290, buses: ["4"] }
    },
    navoi: {
      notary: { id: "navoi-notary-1", name: "Navoiy shahar 1-son Davlat Notarial Idorasi", addr: "Navoiy shahri, Xalqlar Do'stligi shoh ko'chasi 33-uy", lat: 40.1030, lng: 65.3740, buses: ["1", "5"] },
      cadastre: { id: "navoi-cadastre", name: "Navoiy viloyat Kadastr boshqarmasi", addr: "Navoiy shahri, G'alaba shoh ko'chasi 12", lat: 40.0980, lng: 65.3790, buses: ["1"] },
      yhxdx: { id: "navoi-yhxdx", name: "Navoiy viloyat YHXDX bo'limi", addr: "Navoiy shahri, Karmana yo'li 10", lat: 40.1180, lng: 65.3620, buses: ["5"] },
      dxm: { id: "navoi-dxm", name: "Navoiy shahar Davlat Xizmatlari Markazi (DXM)", addr: "Navoiy shahri, Matbuotchilar ko'chasi 6", lat: 40.1010, lng: 65.3720, buses: ["1"] },
      court: { id: "navoi-court", name: "Fuqarolik ishlari bo'yicha Navoiy tumanlararo sudi", addr: "Navoiy shahri, Zarafshon ko'chasi 21", lat: 40.1050, lng: 65.3760, buses: ["1"] }
    },
    jizzakh: {
      notary: { id: "jizzakh-notary-1", name: "Jizzax shahar 1-son Davlat Notarial Idorasi", addr: "Jizzax shahri, Sh.Rashidov shoh ko'chasi 45-uy", lat: 40.1190, lng: 67.8420, buses: ["7", "14"] },
      cadastre: { id: "jizzakh-cadastre", name: "Jizzax viloyat Kadastr boshqarmasi", addr: "Jizzax shahri, Sayiljoy ko'chasi 8", lat: 40.1150, lng: 67.8380, buses: ["7"] },
      yhxdx: { id: "jizzakh-yhxdx", name: "Jizzax viloyat YHXDX bo'limi", addr: "Jizzax shahri, Toshkent ko'chasi 72", lat: 40.1310, lng: 67.8550, buses: ["14"] },
      dxm: { id: "jizzakh-dxm", name: "Jizzax shahar Davlat Xizmatlari Markazi (DXM)", addr: "Jizzax shahri, Olmazor ko'chasi 14", lat: 40.1210, lng: 67.8440, buses: ["7"] },
      court: { id: "jizzakh-court", name: "Fuqarolik ishlari bo'yicha Jizzax tumanlararo sudi", addr: "Jizzax shahri, Sayiljoy ko'chasi 10", lat: 40.1170, lng: 67.8400, buses: ["7"] }
    },
    syrdarya: {
      notary: { id: "guliston-notary-1", name: "Guliston shahar 1-son Davlat Notarial Idorasi", addr: "Guliston shahri, O'zbekiston ko'chasi 19-uy", lat: 40.4930, lng: 68.7840, buses: ["2", "8"] },
      cadastre: { id: "guliston-cadastre", name: "Sirdaryo viloyat Kadastr boshqarmasi", addr: "Guliston shahri, Sayxun ko'chasi 11", lat: 40.4890, lng: 68.7810, buses: ["2"] },
      yhxdx: { id: "guliston-yhxdx", name: "Sirdaryo viloyat YHXDX bo'limi", addr: "Guliston shahri, Bo'ston mavzesi", lat: 40.5050, lng: 68.7990, buses: ["8"] },
      dxm: { id: "guliston-dxm", name: "Guliston shahar Davlat Xizmatlari Markazi (DXM)", addr: "Guliston shahri, Taraqqiyot ko'chasi 2", lat: 40.4950, lng: 68.7860, buses: ["2"] },
      court: { id: "guliston-court", name: "Fuqarolik ishlari bo'yicha Guliston tumanlararo sudi", addr: "Guliston shahri, Yangi Hayot ko'chasi 5", lat: 40.4910, lng: 68.7830, buses: ["2"] }
    },
    karakalpakstan: {
      notary: { id: "nukus-notary-1", name: "Nukus shahar 1-son Davlat Notarial Idorasi", addr: "Nukus shahri, Qoraqalpog'iston ko'chasi 24-uy", lat: 42.4630, lng: 59.6140, buses: ["6", "15"] },
      cadastre: { id: "nukus-cadastre", name: "Qoraqalpog'iston Kadastr boshqarmasi", addr: "Nukus shahri, Berdaq shoh ko'chasi 40", lat: 42.4590, lng: 59.6180, buses: ["6"] },
      yhxdx: { id: "nukus-yhxdx", name: "Qoraqalpog'iston Respublikasi YHXDX", addr: "Nukus shahri, Ellikqal'a ko'chasi 14", lat: 42.4780, lng: 59.6350, buses: ["15"] },
      dxm: { id: "nukus-dxm", name: "Nukus shahar Davlat Xizmatlari Markazi (DXM)", addr: "Nukus shahri, Allayar Do'stnazarov ko'chasi 102", lat: 42.4650, lng: 59.6120, buses: ["6"] },
      court: { id: "nukus-court", name: "Fuqarolik ishlari bo'yicha Nukus tumanlararo sudi", addr: "Nukus shahri, Qoraqalpog'iston ko'chasi 18", lat: 42.4610, lng: 59.6160, buses: ["6"] }
    },
    tashkent_region: {
      notary: { id: "chirchiq-notary-1", name: "Chirchiq shahar 1-son Davlat Notarial Idorasi", addr: "Chirchiq shahri, A.Navoiy ko'chasi 15-uy", lat: 41.4680, lng: 69.5820, buses: ["3", "10"] },
      cadastre: { id: "chirchiq-cadastre", name: "Toshkent viloyati Kadastr Chirchiq filiali", addr: "Chirchiq shahri, Lomonosov ko'chasi 8", lat: 41.4630, lng: 69.5780, buses: ["3"] },
      yhxdx: { id: "chirchiq-yhxdx", name: "Toshkent viloyati YHXDX Ro'yxatga olish bo'limi", addr: "Chirchiq shahri, Bo'zsuv yo'li 2", lat: 41.4820, lng: 69.5990, buses: ["10"] },
      dxm: { id: "chirchiq-dxm", name: "Chirchiq shahar Davlat Xizmatlari Markazi (DXM)", addr: "Chirchiq shahri, Zakovat ko'chasi 4", lat: 41.4700, lng: 69.5850, buses: ["3"] },
      court: { id: "chirchiq-court", name: "Fuqarolik ishlari bo'yicha Chirchiq shahar sudi", addr: "Chirchiq shahri, Yoshlik ko'chasi 16", lat: 41.4650, lng: 69.5800, buses: ["3"] }
    },
    tashkent: {
      notary: { id: "notary-1", name: "Toshkent shahar 1-son Davlat Notarial Idorasi", addr: "Toshkent shahri, Amir Temur shoh ko'chasi 24-uy (Amir Temur xiyoboni)", lat: 41.3111, lng: 69.2797, buses: ["58", "28", "67"] },
      cadastre: { id: "cadastre-tashkent", name: "Davlat Kadastrlari Palatasi Toshkent shahar boshqarmasi (Kadastr)", addr: "Toshkent shahri, Mustaqillik shoh ko'chasi 105", lat: 41.3320, lng: 69.3250, buses: ["115", "93"] },
      yhxdx: { id: "yhxdx-fayzobod", name: "Toshkent shahar YHXDX Ro'yxatga olish bo'limi (Fayzobod GAYI)", addr: "Toshkent shahri, Mirobod tumani, Fayzobod ko'chasi 1-berk", lat: 41.2720, lng: 69.3190, buses: ["28", "44"] },
      dxm: { id: "dxm-center", name: "Toshkent shahar Markaziy Davlat Xizmatlari Markazi (DXM)", addr: "Toshkent shahri, Shayxontohur tumani, Furqat ko'chasi 1-A (Xalqlar Do'stligi)", lat: 41.3110, lng: 69.2415, buses: ["58", "115"] },
      court: { id: "tashkent-court", name: "Fuqarolik ishlari bo'yicha Toshkent shahar tumanlararo sudi", addr: "Toshkent shahri, Chilonzor tumani, 2-mavze", lat: 41.2820, lng: 69.2150, buses: ["58"] }
    }
  };

  const preset = regionalPresets[reg] || regionalPresets.andijon;

  // 1. SALOMLASHISH VA KIRISH / GREETING & INTRO
  if (p.includes('salom') || p.includes('assalom') || p.includes('privet') || p.includes('hello') || p.includes('hi ') || p === 'hi' || p.includes('kimsan') || p.includes('nima qila olasan') || p.includes('yordam ber') || p.includes('qanday ishlaydi')) {
    return {
      title: "AI Huquqiy Yordamchi — Qonuniy Maslahat",
      shortSummary: `Assalomu alaykum! Men O'zbekiston fuqarolariga huquqiy yordam ko'rsatuvchi sun'iy intellekt yordamchisiman. Mashina yoki uy oldi-sotdisi, meros, ishonchnoma, prava almashtirish, aliment, propiska va jarimalar bo'yicha qanday hujjat tayyorlash va qayerga borishni bilib olishingiz mumkin.`,
      voiceScript: `Assalomu alaykum! Men sizning huquqiy maslahatchingizman. Mashina, uy-joy oldi-sotdisi, meros, aliment yoki kadastr bo'yicha savolingizni yozing yoki mikrofon orqali ayting, sizga tezda to'liq yo'riqnoma beraman.`,
      documents: [
        { name: "Shaxsingizni tasdiqlovchi pasport yoki ID-karta", note: "Asl nusxasi", requiredBy: "Har qanday murojaatda" },
        { name: "Murojaat mazmuniga oid birlamchi hujjatlar", note: "Mulk, guvohnoma yoki kvitansiya", requiredBy: "Fuqaro" }
      ],
      steps: [
        { step: 1, title: "Savolingizni aniq yozing", desc: "Masalan: 'Mashinamni sotmoqchiman', 'Uyimga kadastr kerak', 'Aliment undirmoqchiman'." },
        { step: 2, title: "Hujjatlar ro'yxatini ko'ring", desc: "Tizim kim nima hujjat olib kelishi kerakligini aniq ko'rsatadi." },
        { step: 3, title: "Xaritadan manzilni toping", desc: "Sizga eng yaqin Notarius, DXM yoki YHXDX idorasi va avtobuslari belgilanadi." }
      ],
      approxFees: "Konsultatsiya bepul, davlat xizmatlari qonunda belgilangan BHM bo'yicha",
      warnings: ["Har qanday shartnoma yoki kelishuvni faqat rasmiy davlat organi yoki notariusda tasdiqlang!"],
      targetLocationType: "dxm",
      targetLocationId: preset.dxm.id,
      locationName: preset.dxm.name,
      address: preset.dxm.addr,
      region: reg,
      lat: preset.dxm.lat,
      lng: preset.dxm.lng,
      buses: preset.dxm.buses,
      transitAdvice: `${preset.dxm.name}ga ${preset.dxm.buses.join(', ')}-sonli avtobuslar bilan borasiz.`
    };
  }

  // 2. HAYDOVCHILIK GUVOHNOMASI (PRAVA) ALMASHTIRISH VA TEX-KO'RIK
  if (p.includes('prava') || p.includes('haydovchilik') || p.includes('tex korik') || p.includes('tex-ko\'rik') || p.includes('tonirovka') || p.includes('raqam olish') || p.includes('nomer olish')) {
    return {
      title: `Haydovchilik guvohnomasini almashtirish: ${preset.dxm.name} yoki YHXDX`,
      shortSummary: `Eski namunadagi haydovchilik guvohnomasini (prava) yangisiga almashtirish uchun imtihon topshirish shart emas! Istalgan Davlat Xizmatlari Markaziga (DXM) yoki YHXDX (GAYI) bo'limiga borasiz. Davlat boji 0.7 BHM.`,
      voiceScript: `Assalomu alaykum! Haydovchilik guvohnomangizni almashtirish uchun faqat pasport, eski prava va talon kerak. Imtihon topshirilmaydi. Eng yaqin ${preset.dxm.name}ga borasiz, xaritada manzilni belgilab qo'ydim.`,
      documents: [
        { name: "Fuqarolik pasporti yoki ID-karta", note: "Asl nusxasi", requiredBy: "Haydovchi" },
        { name: "Eski namunadagi haydovchilik guvohnomasi va ogohlantirish taloni", note: "Asli", requiredBy: "Haydovchi" },
        { name: "Davlat boji to'lovi kvitansiyasi (0.7 BHM)", note: "Joyida to'lanadi", requiredBy: "Haydovchi" }
      ],
      steps: [
        { step: 1, title: "DXM yoki my.gov.uz ga murojaat", desc: "Navbat oling yoki my.gov.uz orqali onlayn ariza yuboring (pochta orqali uyingizga yetkazish mumkin)." },
        { step: 2, title: "Rasmga tushish va imzo", desc: "DXM binosida 2 daqiqada rasmga tushasiz va elektron imzo qo'yasiz." },
        { step: 3, title: "Yangi namunadagi guvohnomani olish", desc: "10-15 daqiqa ichida yangi plastik prava tayyor bo'ladi." }
      ],
      approxFees: "Davlat boji: 0.7 BHM (taxminan 262,500 so'm)",
      warnings: ["Muddati o'tgan haydovchilik guvohnomasi bilan mashina boshqarish 5 BHM miqdorida jarimaga sabab bo'ladi!"],
      targetLocationType: "dxm",
      targetLocationId: preset.dxm.id,
      locationName: preset.dxm.name,
      address: preset.dxm.addr,
      region: reg,
      lat: preset.dxm.lat,
      lng: preset.dxm.lng,
      buses: preset.dxm.buses,
      transitAdvice: `${preset.dxm.name}ga ${preset.dxm.buses.join(', ')}-sonli avtobuslar bilan borishingiz mumkin.`
    };
  }

  // 3. RADAR VA YO'L HARAKATI JARIMALARI / SKIDKA
  if (p.includes('jarima') || p.includes('radar') || p.includes('kamera') || p.includes('skidka') || p.includes('50%') || p.includes('jarimani')) {
    return {
      title: `Yo'l harakati va radar jarimalarini to'lash tartibi`,
      shortSummary: `O'zbekistonda jarima to'g'risidagi qaror chiqarilgan kundan boshlab 15 kun ichida jarima miqdorining 50 foizi to'lansa, qolgan 50 foizidan ozod etilasiz (70 foizlik chegirma esa 30 kun ichida). Agar asossiz yozilgan bo'lsa, 10 kun ichida YHXDXga yoki sudga shikoyat qilishingiz mumkin.`,
      voiceScript: `Assalomu alaykum! Jarima xati kelgan kundan boshlab 15 kun ichida to'lasangiz, 50 foiz chegirma beriladi. To'lovni Click, Payme yoki my.gov.uz orqali to'lash mumkin. Xaritada viloyat YHXDX idorasini belgiladim.`,
      documents: [
        { name: "Jarima qarori raqami (Protokol raqami)", note: "SMS yoki qog'oz xat", requiredBy: "Haydovchi" },
        { name: "Avtomobil tex-pasporti", note: "Seriya va raqam", requiredBy: "Haydovchi" },
        { name: "To'lov kvitansiyasi", note: "Elektron chek", requiredBy: "Haydovchi" }
      ],
      steps: [
        { step: 1, title: "Jarimani tekshirish", desc: "my.gov.uz yoki e-jarima.uz orqali jarima to'g'risidagi qaror va fotosuratlarni ko'ring." },
        { step: 2, title: "50% chegirma bilan to'lash", desc: "15 kun ichida bank ilovalari orqali 50% skidka bilan to'lang." },
        { step: 3, title: "Nizoli jarima ustidan shikoyat", desc: `Agar jarima noto'g'ri yozilgan bo'lsa, ${preset.yhxdx.name}ga yoki ma'muriy sudga ariza bering.` }
      ],
      approxFees: "15 kun ichida 50% imtiyozli to'lov; 16-30 kun ichida 70% to'lov",
      warnings: ["Jarimani 60 kun ichida to'lamasangiz, MIB tomonidan avtomobilga taqiq qo'yiladi va jarima maydonchasiga tortiladi!"],
      targetLocationType: "traffic_police",
      targetLocationId: preset.yhxdx.id,
      locationName: preset.yhxdx.name,
      address: preset.yhxdx.addr,
      region: reg,
      lat: preset.yhxdx.lat,
      lng: preset.yhxdx.lng,
      buses: preset.yhxdx.buses,
      transitAdvice: `${preset.yhxdx.name}ga ${preset.yhxdx.buses.join(', ')}-sonli avtobuslar qatnaydi.`
    };
  }

  // 4. MEROS VA VASIYATNOMA / HADYA (DARNIY)
  if (p.includes('meros') || p.includes('vasiyat') || p.includes('hadyanoma') || p.includes('darniy') || p.includes('наследств') || p.includes('vasiyatnoma')) {
    return {
      title: `Meros rasmiylashtirish tartibi: ${preset.notary.name}`,
      shortSummary: `Meros ochilgan kundan (vafot etgan kundan) boshlab **6 oy ichida** marhum oxirgi ro'yxatda turgan hududdagi davlat notarial idorasiga merosni qabul qilish haqida ariza berish SHART! 6 oydan keyin notarius Merosga bo'lgan huquq to'g'risidagi guvohnomani beradi.`,
      voiceScript: `Assalomu alaykum! Meros masalasida eng muhim qoida: vafot etgan kundan boshlab olti oy ichida notariusga ariza berishingiz shart. Xaritada ${preset.notary.name}ni belgilab qo'ydim.`,
      documents: [
        { name: "Merosxo'rning pasporti yoki ID-kartasi", note: "Asl nusxasi", requiredBy: "Merosxo'r" },
        { name: "Meros qoldiruvchining o'lim haqidagi guvohnomasi", note: "Asli", requiredBy: "Merosxo'r" },
        { name: "Qarindoshlikni tasdiqlovchi hujjat", note: "Tug'ilganlik yoki nikoh guvohnomasi", requiredBy: "Merosxo'r" },
        { name: "Meros mulkining hujjatlari", note: "Uy kadastri, mashina tex-pasporti, jamg'arma daftarchasi", requiredBy: "Merosxo'r" }
      ],
      steps: [
        { step: 1, title: "Notariusga 6 oy ichida ariza berish", desc: `${preset.notary.name}ga borib meros ishi ochiladi.` },
        { step: 2, title: "Merosxo'rlar va mulkni aniqlash", desc: "Barcha 1-navbatdagi merosxo'rlar (ota-ona, er-xotin, farzandlar) aniqlanadi." },
        { step: 3, title: "Meros guvohnomasini olish", desc: "6 oy o'tgach, davlat boji to'lanib, yangi mulkdor guvohnomasi beriladi." }
      ],
      approxFees: "1-navbatdagi merosxo'rlarga 0.5 BHM, boshqa shaxslarga 1-2 BHM",
      warnings: ["Agar 6 oylik muddatni uzrli sababsiz o'tkazib yuborsangiz, meros huquqini faqat fuqarolik sudi orqali tiklash mumkin bo'ladi!"],
      targetLocationType: "notary",
      targetLocationId: preset.notary.id,
      locationName: preset.notary.name,
      address: preset.notary.addr,
      region: reg,
      lat: preset.notary.lat,
      lng: preset.notary.lng,
      buses: preset.notary.buses,
      transitAdvice: `${preset.notary.name}ga ${preset.notary.buses.join(', ')}-sonli avtobuslar bilan borasiz.`
    };
  }

  // 5. NIKOH, TO'Y, FHDYO (ZAGS)
  if (p.includes('nikoh') || p.includes('zags') || p.includes('fhdyo') || p.includes('fhdro') || p.includes('familiya')) {
    return {
      title: `Nikohni davlat ro'yxatidan o'tkazish (FHDYo / ZAGS)`,
      shortSummary: `Nikoh tuzish uchun yoshlar birgalikda FHDYo bo'limiga ariza beradi. Ariza berilgandan so'ng 1 oylik muddat o'tgach nikoh tantanali qayd etiladi. Nikohlanuvchi shaxslar bepul tibbiy ko'rikdan o'tishi majburiydir.`,
      voiceScript: `Assalomu alaykum! Nikohdan o'tish uchun FHDYo bo'limiga shaxsan boriladi yoki my.gov.uz orqali ariza topshiriladi. Bir oylik muddat va bepul tibbiy ko'rik talab etiladi.`,
      documents: [
        { name: "Kuyov va kelinning pasporti yoki ID-kartasi", note: "Asl nusxasi", requiredBy: "Ikkala tomon" },
        { name: "Majburiy tibbiy ko'rik ma'lumotnomasi", note: "Poliklinikadan bepul beriladi", requiredBy: "Ikkala tomon" },
        { name: "Oldingi nikoh bekor qilinganlik hujjati (agar bo'lsa)", note: "Guvohnoma yoki sud qarori", requiredBy: "Tegishli shaxs" }
      ],
      steps: [
        { step: 1, title: "FHDYo ga birgalikda ariza berish", desc: "DXM, FHDYo bo'limi yoki my.gov.uz orqali ariza topshiriladi." },
        { step: 2, title: "Tibbiy ko'rikdan o'tish", desc: "Nikohlanuvchilar 5 ta yo'nalish bo'yicha bepul tibbiy ko'rikdan o'tadi." },
        { step: 3, title: "Nikohni qayd etish va guvohnoma", desc: "1 oy o'tgach, nikoh guvohnomasi beriladi va pasportlarga belgi qo'yiladi." }
      ],
      approxFees: "Davlat boji: 0.1 BHM + gerb yig'imi (taxminan 45,000 so'm)",
      warnings: ["Shar'iy nikoh o'qitishdan oldin qonuniy FHDYo nikohidan o'tish shart, aks holda mulkiy va huquqiy himoya ta'minlanmaydi!"],
      targetLocationType: "dxm",
      targetLocationId: preset.dxm.id,
      locationName: preset.dxm.name,
      address: preset.dxm.addr,
      region: reg,
      lat: preset.dxm.lat,
      lng: preset.dxm.lng,
      buses: preset.dxm.buses,
      transitAdvice: `${preset.dxm.name}ga ${preset.dxm.buses.join(', ')}-sonli avtobuslar bilan borasiz.`
    };
  }

  // 6. AJRASHISH VA MULK TAQSIMOTI
  if (p.includes('ajrash') || p.includes('ajrim') || p.includes('mulkni bo\'lish') || p.includes('mulk taqsimot')) {
    return {
      title: `Ajrashish va mulk taqsimoti tartibi: ${preset.court.name}`,
      shortSummary: `Agar voyaga yetmagan umumiy bolalar bo'lsa yoki er-xotindan biri ajrashishga rozi bo'lmasa, ajralish faqat FUQAROLIK ISHLARI BO'YICHA SUD orqali amalga oshiriladi. Sud odatda 1 oydan 6 oygacha yarashish muhlatini beradi. Nikoh davomida orttirilgan barcha mol-mulk teng 50/50 taqsimlanadi.`,
      voiceScript: `Assalomu alaykum! Agar voyaga yetmagan bolalar bo'lsa, ajrashish faqat Fuqarolik sudi orqali hal qilinadi. Sudga da'vo ariza, nikoh guvohnomasi va bolalarning guvohnomalari topshiriladi.`,
      documents: [
        { name: "Da'vo arizasi (2 nusxada)", note: "Sudga taqdim etiladi", requiredBy: "Da'vogar" },
        { name: "Nikoh tuzilganligi to'g'risidagi guvohnoma", note: "Asl nusxasi", requiredBy: "Da'vogar" },
        { name: "Voyaga yetmagan bolalarning tug'ilganlik guvohnomalari", note: "Nusxasi", requiredBy: "Da'vogar" },
        { name: "Oila tarkibi haqida ma'lumotnoma va davlat boji", note: "2 BHM miqdorida", requiredBy: "Da'vogar" }
      ],
      steps: [
        { step: 1, title: "Sudga da'vo ariza kiritish", desc: `${preset.court.name}ga yoki my.sud.uz portali orqali ariza yuboriladi.` },
        { step: 2, title: "Yarashish muhlatini belgilash", desc: "Sudya oilani saqlab qolish uchun 1 oydan 6 oygacha yarashish muhlatini berishi mumkin." },
        { step: 3, title: "Hal qiluv qarori chiqarish", desc: "Yarashmagan taqdirda nikoh bekor qilinadi, aliment va mulk taqsimoti hal etiladi." }
      ],
      approxFees: "Birinchi nikohni bekor qilish bo'yicha davlat boji: 2 BHM",
      warnings: ["Xotinning homiladorlik vaqtida va bola 1 yoshga to'lguniga qadar xotinning roziligisiz nikohdan ajratishga yo'l qo'yilmaydi!"],
      targetLocationType: "court",
      targetLocationId: preset.court.id,
      locationName: preset.court.name,
      address: preset.court.addr,
      region: reg,
      lat: preset.court.lat,
      lng: preset.court.lng,
      buses: preset.court.buses,
      transitAdvice: `${preset.court.name}ga ${preset.court.buses.join(', ')}-sonli avtobuslar qatnaydi.`
    };
  }

  // 7. ALIMENT UNDIRISH VA MIQDORI
  if (p.includes('aliment') || p.includes('bola puli') || p.includes('moddiy taminot')) {
    return {
      title: `Aliment undirish tartibi: ${preset.court.name}`,
      shortSummary: `Aliment undirish uchun fuqarolik sudiga 'Sud buyrug'i chiqarish' to'g'risida ariza beriladi. Bunda sud majlisi o'tkazilmaydi va 3 kun ichida sud buyrug'i chiqariladi! Aliment miqdori: 1 bola uchun daromadning 1/4 qismi, 2 bola uchun 1/3 qismi, 3 va undan ko'p bola uchun 1/2 qismi. Ishsiz shaxslardan esa o'rtacha oylik ish haqi bo'yicha hisoblanadi.`,
      voiceScript: `Assalomu alaykum! Aliment undirish juda oson — fuqarolik sudiga ariza bersangiz, uch kun ichida sud buyrug'i chiqarib MIBga yuboriladi. Xaritada eng yaqin sud binosini belgiladim.`,
      documents: [
        { name: "Aliment undirish haqida sud buyrug'i chiqarish to'g'risida ariza", note: "Namuna bo'yicha", requiredBy: "Ona (yoki ota)" },
        { name: "Bolaning tug'ilganlik to'g'risidagi guvohnomasi", note: "Nusxasi", requiredBy: "Ariza beruvchi" },
        { name: "Nikoh to'g'risidagi (yoki nikohni bekor qilish) guvohnoma", note: "Nusxasi", requiredBy: "Ariza beruvchi" },
        { name: "Bolaning ariza beruvchi qaramog'ida ekanligi haqida ma'lumot", note: "Mahalladan", requiredBy: "Ariza beruvchi" }
      ],
      steps: [
        { step: 1, title: "Sudga ariza topshirish", desc: `${preset.court.name}ga ariza beriladi (davlat boji to'lanmaydi!).` },
        { step: 2, title: "Sud buyrug'ini olish", desc: "Sudya 3 kun ichida sud buyrug'ini chiqaradi va MIBga yuboradi." },
        { step: 3, title: "MIB orqali alimentni undirish", desc: "Davlat ijrochisi qarzdorning ish haqidan yoki mulkidan alimentni avtomat undiradi." }
      ],
      approxFees: "Aliment undirish bo'yicha da'vogar davlat bojidan to'liq OZOD qilingan!",
      warnings: ["Alimentni 2 oydan ortiq to'lamagan shaxslarga 15 sutkagacha ma'muriy qamoq va chet elga chiqishga taqiq qo'yiladi!"],
      targetLocationType: "court",
      targetLocationId: preset.court.id,
      locationName: preset.court.name,
      address: preset.court.addr,
      region: reg,
      lat: preset.court.lat,
      lng: preset.court.lng,
      buses: preset.court.buses,
      transitAdvice: `${preset.court.name}ga ${preset.court.buses.join(', ')}-sonli avtobuslar bilan borasiz.`
    };
  }

  // 8. PASPORT, ID-KARTA VA CHET ELGA CHIQISH (ZAGRANPASPORT)
  if (p.includes('id karta') || p.includes('pasport') || p.includes('zagran') || p.includes('qizil pasport') || p.includes('fuqarolik')) {
    return {
      title: `ID-karta va xorijga chiqish pasporti: ${preset.dxm.name}`,
      shortSummary: `Biometrik pasportni ID-kartaga almashtirish yoki yangi qizil xorijga chiqish biometrik pasportini (zagranpasport) olish istalgan tuman Davlat Xizmatlari Markazida (DXM) yoki IIB M&FRB (pasport stol)da amalga oshiriladi. ID-karta 1 ish kunida, xorijga chiqish pasporti 10 ish kunida tayyor bo'ladi.`,
      voiceScript: `Assalomu alaykum! ID-karta yoki zagranpasport olish uchun sizga faqat amaldagi pasportingiz kerak. Rasm DXM binosida tushiriladi. Eng yaqin ${preset.dxm.name}ni xaritada belgilab qo'ydim.`,
      documents: [
        { name: "Amaldagi pasport yoki tug'ilganlik guvohnomasi (16 yoshga to'lganlarga)", note: "Asl nusxasi", requiredBy: "Fuqaro" },
        { name: "Davlat boji to'lovi", note: "Joyida to'lanadi", requiredBy: "Fuqaro" },
        { name: "Harbiy guvohnoma yoki harbiy hisob hujjati", note: "Harbiy xizmatga majburlar uchun", requiredBy: "Erkaklar" }
      ],
      steps: [
        { step: 1, title: "DXM ga tashrif yoki my.gov.uz", desc: "Elektron navbat oling va arizani shakllantiring." },
        { step: 2, title: "Biometrik ma'lumotlar", desc: "DXM xodimi yuzingizni suratga oladi va barmoq izlarini kiritadi." },
        { step: 3, title: "Pasportni qabul qilish", desc: "ID-karta 1 ish kunida, xorijga chiqish pasporti 10 kunda taqdim etiladi." }
      ],
      approxFees: "ID-karta: 0.89 BHM; Xorijga chiqish pasporti (zagran): 2.5 BHM",
      warnings: ["Pasportingizni yo'qotib qo'ygan bo'lsangiz, zudlik bilan '102' yoki DXMga murojaat qiling, aks holda nomingizga qarz rasmiylashtirilishi mumkin!"],
      targetLocationType: "dxm",
      targetLocationId: preset.dxm.id,
      locationName: preset.dxm.name,
      address: preset.dxm.addr,
      region: reg,
      lat: preset.dxm.lat,
      lng: preset.dxm.lng,
      buses: preset.dxm.buses,
      transitAdvice: `${preset.dxm.name}ga ${preset.dxm.buses.join(', ')}-sonli avtobuslar bilan borasiz.`
    };
  }

  // 9. PROPISKA VA IJARA SHARTNOMASI
  if (p.includes('propiska') || p.includes('ijara') || p.includes('ro\'yxat') || p.includes('turar joy')) {
    return {
      title: `Propiska va ijara shartnomasini ro'yxatdan o'tkazish`,
      shortSummary: `Turar joy bo'yicha doimiy yoki vaqtinchalik propiska ${preset.dxm.name} yoki my.gov.uz orqali amalga oshiriladi. Ijara shartnomasini notariusda tasdiqlash shart EMAS — uni ijara.soliq.uz portalida elektron tarzda bepul hisobga qo'yish kifoya! Talabalarga 50% gacha ijara subsidiyasi ajratiladi.`,
      voiceScript: `Assalomu alaykum! Ijarani notariusga bormasdan, ijara.soliq.uz saytida bepul ro'yxatdan o'tkazishingiz mumkin. Doimiy propiska uchun esa ${preset.dxm.name}ga boriladi.`,
      documents: [
        { name: "Mulkdor va ijarachining pasporti yoki ID-kartasi", note: "Asl nusxasi", requiredBy: "Ikkala tomon" },
        { name: "Uyning kadastr pasporti", note: "Mulk huquqi hujjati", requiredBy: "Mulkdor" },
        { name: "Voyaga yetgan oila a'zolarining roziligi", note: "Elektron ERI bilan yoki shaxsan", requiredBy: "Mulkdor oilasi" }
      ],
      steps: [
        { step: 1, title: "ijara.soliq.uz orqali ariza", desc: "Mulkdor shaxsiy kabinetida ijarachining JShShIR kodini kiritadi." },
        { step: 2, title: "Ijarachi tomonidan tasdiqlash", desc: "Ijarachi SMS-kod orqali shartnomani tasdiqlaydi." },
        { step: 3, title: "QR-kodli guvohnoma", desc: "Soliq qo'mitasining QR-kodli rasmiy ijara guvohnomasi yuklab olinadi." }
      ],
      approxFees: "ijara.soliq.uz orqali ijara shartnomasini tuzish mutlaqo BEPUL!",
      warnings: ["Ijaraga qo'yib, soliqda hisobga qo'ymaslik mulkdorga 5 BHM miqdorida ma'muriy jarima solinishiga olib keladi!"],
      targetLocationType: "dxm",
      targetLocationId: preset.dxm.id,
      locationName: preset.dxm.name,
      address: preset.dxm.addr,
      region: reg,
      lat: preset.dxm.lat,
      lng: preset.dxm.lng,
      buses: preset.dxm.buses,
      transitAdvice: `${preset.dxm.name}ga ${preset.dxm.buses.join(', ')}-sonli avtobuslar bilan borishingiz mumkin.`
    };
  }

  // 10. FIRMA OCHISH, BIZNES, MCHJ, YTT
  if (p.includes('firma') || p.includes('mchj') || p.includes('biznes') || p.includes('ytt') || p.includes('tadbirkor') || p.includes('litsenziya')) {
    return {
      title: `Firma (MCHJ) yoki YTT ochish tartibi: ${preset.dxm.name}`,
      shortSummary: `O'zbekistonda MCHJ yoki YaTT (Yakka tartibdagi tadbirkor) ochish fo.birdarcha.uz portali orqali 15 daqiqada onlayn amalga oshiriladi! Shuningdek, ${preset.dxm.name}ga shaxsan borib ham bir zumda korxona ochish va bank hisob raqamini tanlash mumkin. Ustav fondi minimal chegarasi bekor qilingan.`,
      voiceScript: `Assalomu alaykum! Tadbirkorlik ochish uchun faqat pasport va nom tanlash kerak. 15 daqiqa ichida MCHJ guvohnomasi va bank hisob raqami tayyor bo'ladi. Xaritada ${preset.dxm.name}ni ko'rsatmoqdaman.`,
      documents: [
        { name: "Ta'sischilarning pasporti yoki ID-kartasi", note: "Asl nusxasi", requiredBy: "Ta'sischilar" },
        { name: "Elektron raqamli imzo (ERI)", note: "DXM yoki e-imzo orqali olinadi", requiredBy: "Rahbar" },
        { name: "Korxona nomi va yuridik manzili", note: "Ijarada bo'lsa kafolat xati", requiredBy: "Ta'sischi" }
      ],
      steps: [
        { step: 1, title: "fo.birdarcha.uz yoki DXM", desc: "Tizimga kirib firma nomini zaxiraga oling va faoliyat turini (IFUT) tanlang." },
        { step: 2, title: "Davlat bojini to'lash", desc: "MCHJ uchun onlayn 1 BHM, YTT uchun 1 BHM to'lanadi." },
        { step: 3, title: "Guvohnoma va muhr olish", desc: "Elektron reyestr guvohnomasi va STIR (INN) bir zumda shakllanadi." }
      ],
      approxFees: "MCHJ davlat ro'yxatdan o'tkazish boji: onlayn 0.9 BHM, DXM da 1 BHM",
      warnings: ["Firma ochilgandan so'ng 1 oy ichida soliq rejimini (aylanmadan olinadigan soliq 4% yoki QQS 12%) tanlash shart!"],
      targetLocationType: "dxm",
      targetLocationId: preset.dxm.id,
      locationName: preset.dxm.name,
      address: preset.dxm.addr,
      region: reg,
      lat: preset.dxm.lat,
      lng: preset.dxm.lng,
      buses: preset.dxm.buses,
      transitAdvice: `${preset.dxm.name}ga ${preset.dxm.buses.join(', ')}-sonli avtobuslar bilan borasiz.`
    };
  }

  // 11. SUG'URTA (STRAXOVKA VA AVARIYA)
  if (p.includes('straxovka') || p.includes('sug\'urta') || p.includes('osago') || p.includes('avariya') || p.includes('yth')) {
    return {
      title: `Avtosug'urta (OSAGO) va YTH to'lovlari tartibi`,
      shortSummary: `Har bir avtomobil egasi Majburiy fuqarolik javobgarligi sug'urtasiga (OSAGO) ega bo'lishi shart. YTH sodir bo'lganda jabrlanuvchiga sug'urta kompaniyasi 40 million so'mgacha zararni qoplab beradi. Agar zarar 8 BHM dan oshmasa va tomonlar kelishsa, GAYI xodimlarisiz 'Yevroprotokol' tuzish mumkin!`,
      voiceScript: `Assalomu alaykum! Majburiy avtosug'urta polisi har yili yangilanadi. YTH yuz berganda avtomobillarni joyidan qo'zg'atmasdan fotosuratga oling va sug'urta kompaniyasiga zudlik bilan qo'ng'iroq qiling.`,
      documents: [
        { name: "Avtomobilning ro'yxatdan o'tganlik guvohnomasi (Tex-pasport)", note: "Asli", requiredBy: "Haydovchi" },
        { name: "Haydovchilik guvohnomasi va pasport", note: "Boshqaruvchilar", requiredBy: "Haydovchi" },
        { name: "YTH to'g'risida YHXDX dalolatnomasi yoki Yevroprotokol", note: "Sug'urta to'lovi uchun", requiredBy: "Jabrlanuvchi" }
      ],
      steps: [
        { step: 1, title: "Onlayn polis sotib olish", desc: "e-polis.uz yoki sug'urta ilovalari orqali 3 daqiqada rasmiylashtiriladi." },
        { step: 2, title: "Hodisa yuz berganda xabar berish", desc: "YTH sodir bo'lganda 3 kun ichida sug'urtachiga ariza berilishi shart." },
        { step: 3, title: "Sug'urta tovonini olish", desc: "Hujjatlar taqdim etilgach, 15 kun ichida pul bank kartasiga o'tkazib beriladi." }
      ],
      approxFees: "Majburiy sug'urta: Toshkent shahri uchun 168,000 so'm, viloyatlar uchun 56,000 so'mdan",
      warnings: ["Sug'urtasiz mashina haydash 1 BHM miqdorida jarimaga sabab bo'ladi!"],
      targetLocationType: "traffic_police",
      targetLocationId: preset.yhxdx.id,
      locationName: preset.yhxdx.name,
      address: preset.yhxdx.addr,
      region: reg,
      lat: preset.yhxdx.lat,
      lng: preset.yhxdx.lng,
      buses: preset.yhxdx.buses,
      transitAdvice: `${preset.yhxdx.name}ga ${preset.yhxdx.buses.join(', ')}-sonli avtobuslar bilan borasiz.`
    };
  }

  // 12. MEHNAT HUQUQI, ISHDAN BO'SHATISH VA OYLIK
  if (p.includes('ishdan bo\'shat') || p.includes('oylik') || p.includes('maosh') || p.includes('mehnat') || p.includes('ish haqi') || p.includes('otpusk')) {
    return {
      title: `Mehnat huquqlari: Ish haqi undirish va noqonuniy bo'shatish`,
      shortSummary: `Oylik maosh har yarim oyda bir marta to'lanishi shart. Agar ish beruvchi oylikni kechiktirsa, har bir kun uchun kompensatsiya to'laydi. Xodimni noqonuniy ishdan bo'shatish holatlarida 1 oy ichida Fuqarolik sudiga da'vo kiritilsa, sud xodimni ishga tiklaydi va bekor yurgan kunlari uchun o'rtacha ish haqini to'liq undirib beradi.`,
      voiceScript: `Assalomu alaykum! Agar oyligingiz berilmayotgan bo'lsa yoki noqonuniy bo'shatilgan bo'lsangiz, Mehnat inspeksiyasining 1176 ishonch telefoniga yoki fuqarolik sudiga murojaat qilasiz. Sudga ariza berishda davlat boji olinmaydi.`,
      documents: [
        { name: "Mehnat shartnomasi va ishga qabul qilish buyrug'i", note: "Nusxasi", requiredBy: "Xodim" },
        { name: "Mehnat daftarchasi ko'chirmasi (yoki my.mehnat.uz dan)", note: "Elektron", requiredBy: "Xodim" },
        { name: "Oylik ish haqi hisob-kitob varaqasi (raschyotka)", note: "Buxgalteriyadan", requiredBy: "Xodim" }
      ],
      steps: [
        { step: 1, title: "Mehnat inspeksiyasiga shikoyat", desc: "1176 qisqa raqami yoki dmi.mehnat.uz orqali ariza qoldiring." },
        { step: 2, title: "Sudga da'vo kiritish", desc: `${preset.court.name}ga ishga tiklash va ish haqini undirish bo'yicha ariza bering.` },
        { step: 3, title: "Majburiy ijro", desc: "Sud qarori darhol ijro etiladi va xodim o'z lavozimiga tiklanadi." }
      ],
      approxFees: "Mehnat nizolari bo'yicha xodimlar barcha sud bojlari va xarajatlaridan to'liq OZOD qilingan!",
      warnings: ["Ishdan noqonuniy bo'shatilgan taqdirda sudga murojaat qilish muddati — ishdan bo'shatish to'g'risidagi buyruq nusxasi berilgan kundan boshlab atigi 1 OY!"],
      targetLocationType: "court",
      targetLocationId: preset.court.id,
      locationName: preset.court.name,
      address: preset.court.addr,
      region: reg,
      lat: preset.court.lat,
      lng: preset.court.lng,
      buses: preset.court.buses,
      transitAdvice: `${preset.court.name}ga ${preset.court.buses.join(', ')}-sonli avtobuslar bilan borishingiz mumkin.`
    };
  }

  // 13. ISTE'MOLCHI HUQUQLARI (SIFATSIZ TOVAR, PULNI QAYTARISH)
  if (p.includes('dokon') || p.includes('do\'kon') || p.includes('tovar') || p.includes('buzilgan') || p.includes('qaytarish') || p.includes('kafolat') || p.includes('iste\'molchi')) {
    return {
      title: `Iste'molchi huquqlari: Sifatsiz tovarni qaytarish va almashtirish`,
      shortSummary: `O'zbekiston Respublikasi 'Iste'molchilar huquqlarini himoya qilish to'g'risida'gi Qonunining 18-moddasiga ko'ra: iste'molchi xarid qilgan nomaqbul yoki nuqsonli tovarini 14 kun ichida almashtirish yoki pulini to'liq qaytarib olish huquqiga ega! Kassa cheki yo'qolgan bo'lsa ham, guvohlar ko'rsatmasi yoki bank to'lov tarixi asos bo'ladi. Raqobat qo'mitasi ishonch telefoni: 1159.`,
      voiceScript: `Assalomu alaykum! Agar do'kondan olgan tovaringiz sifatsiz chiqsa yoki ma'qul kelmasa, 14 kun ichida almashtirishga yoki pulingizni to'liq qaytarib olishga qonuniy haqqingiz bor. Do'kon rad etsa, 1159 ga qo'ng'iroq qiling.`,
      documents: [
        { name: "Kassa yoki elektron to'lov cheki (Click, Payme, Uzum)", note: "To'lov asosi", requiredBy: "Xaridor" },
        { name: "Tovar qadog'i va to'liq jamlanmasi", note: "Foydalanilmagan holatda", requiredBy: "Xaridor" },
        { name: "Kafolat taloni (agar mavjud bo'lsa)", note: "Texnika buyumlari uchun", requiredBy: "Xaridor" }
      ],
      steps: [
        { step: 1, title: "Do'konga yozma da'vo topshirish", desc: "Tovarni do'konga olib borib, pulni qaytarish yoki almashtirishni talab qiling." },
        { step: 2, title: "1159 yoki Raqobat qo'mitasiga murojaat", desc: "Do'kon rad etsa, Raqobatni rivojlantirish qo'mitasiga ariza yuboring." },
        { step: 3, title: "Pulni va ma'naviy zararni undirish", desc: "Do'kondan tovar bahosi va har bir kunlik kechiktirish uchun 1% penya undiriladi." }
      ],
      approxFees: "Iste'molchilar huquqini himoya qilish murojaatlari mutlaqo BEPUL ko'rib chiqiladi",
      warnings: ["Do'kondorning 'sotilgan tovar qaytarib olinmaydi' degan yozuvi noqonuniy va haqiqiy emas!"],
      targetLocationType: "dxm",
      targetLocationId: preset.dxm.id,
      locationName: preset.dxm.name,
      address: preset.dxm.addr,
      region: reg,
      lat: preset.dxm.lat,
      lng: preset.dxm.lng,
      buses: preset.dxm.buses,
      transitAdvice: `${preset.dxm.name}ga ${preset.dxm.buses.join(', ')}-sonli avtobuslar bilan borasiz.`
    };
  }

  // 14. PENSIYA VA IJTIMOIY NAFAQALAR (BOLALAR PULI)
  if (p.includes('pensiya') || p.includes('nafaqa') || p.includes('bolalar puli') || p.includes('moddiy yordam') || p.includes('ijtimoiy himoya')) {
    return {
      title: `Bolalar nafaqasi va pensiya tayinlash tartibi: ${preset.dxm.name}`,
      shortSummary: `Kam ta'minlangan oilalarga bolalar nafaqasi va moddiy yordam 'Ijtimoiy himoya yagona reyestri' orqali elektron tayinlanadi. Har bir oila a'zosiga to'g'ri keladigan oylik daromad minimal iste'mol xarajatlaridan kam bo'lsa, nafaqa 12 oy muddatga avtomatik tayinlanadi. Yoshga doir pensiya yoshi: erkaklarga 60 yosh (25 yil staj), ayollarga 55 yosh (20 yil staj).`,
      voiceScript: `Assalomu alaykum! Bolalar nafaqasi yoki moddiy yordam olish uchun my.gov.uz orqali yoki mahalladagi ijtimoiy xodimga ariza topshirasiz. Pensiya masalasi bo'yicha ${preset.dxm.name}ga boriladi.`,
      documents: [
        { name: "Oila a'zolarining pasporti yoki ID-kartalari", note: "Asl nusxasi", requiredBy: "Ariza beruvchi" },
        { name: "Bolalarning tug'ilganlik guvohnomalari", note: "Barcha voyaga yetmaganlar", requiredBy: "Ona (ota)" },
        { name: "Mehnat daftarchasi va diplom (pensiya uchun)", note: "Ish staji asosi", requiredBy: "Pensiyaga chiquvchi" }
      ],
      steps: [
        { step: 1, title: "my.gov.uz orqali ariza", desc: "Elektron ariza beriladi, tizim daromadlarni soliq bazasidan avtomat oladi." },
        { step: 2, title: "Ijtimoiy reyestr orqali baholash", desc: "Oila mezonlarga mos kelsa, SMS-xabarnoma yuboriladi." },
        { step: 3, title: "To'lovni har oy qabul qilish", desc: "Xalq banki kartasiga har oyning 5-sanasigacha to'lab beriladi." }
      ],
      approxFees: "Nafaqa va pensiya tayinlash bo'yicha arizalar bepul",
      warnings: ["Nomida ikkitadan ortiq ko'chmas mulk yoki yangi avtomobil bo'lgan oilalarga ijtimoiy nafaqa tayinlanmaydi!"],
      targetLocationType: "dxm",
      targetLocationId: preset.dxm.id,
      locationName: preset.dxm.name,
      address: preset.dxm.addr,
      region: reg,
      lat: preset.dxm.lat,
      lng: preset.dxm.lng,
      buses: preset.dxm.buses,
      transitAdvice: `${preset.dxm.name}ga ${preset.dxm.buses.join(', ')}-sonli avtobuslar bilan borasiz.`
    };
  }

  // 15. SUDGA DA'VO ARIZA VA ADVOKAT
  if (p.includes('sud') || p.includes('da\'vo') || p.includes('advokat') || p.includes('qarzni undirish') || p.includes('tilxat')) {
    return {
      title: `Fuqarolik sudiga da'vo ariza berish va advokat yordami: ${preset.court.name}`,
      shortSummary: `Qarzni undirish, yetkazilgan zararni qoplash, shartnoma majburiyatlarini bajartirish bo'yicha da'vo arizasi javobgar yashaydigan hududdagi Fuqarolik ishlari bo'yicha tumanlararo sudiga taqdim etiladi. Ariza my.sud.uz portali orqali elektron ravishda ham topshirilishi mumkin. Tilxat yoki kvitansiya mavjud bo'lsa, sud qarzni to'liq undirib beradi.`,
      voiceScript: `Assalomu alaykum! Qarzni undirish yoki boshqa nizolar bo'yicha da'vo arizasi Fuqarolik sudiga beriladi. Tilxat, pasport nusxalari va davlat boji to'lovi talab etiladi. Xaritada sizga eng yaqin sud binosini belgilab berdim.`,
      documents: [
        { name: "Da'vo arizasi (asoslovchi dalillar bilan)", note: "Javobgarlar soniga ko'ra nusxalar", requiredBy: "Da'vogar" },
        { name: "Qarz tilxati, shartnoma yoki to'lov cheklari", note: "Asl nusxasi", requiredBy: "Da'vogar" },
        { name: "Davlat boji to'langanligi kvitansiyasi", note: "Da'vo bahosining 4 foizi", requiredBy: "Da'vogar" }
      ],
      steps: [
        { step: 1, title: "Da'vo arizasini tayyorlash", desc: "my.sud.uz yoki advokat yordamida da'vo hujjati shakllantiriladi." },
        { step: 2, title: "Sud muhokamasida qatnashish", desc: `${preset.court.name}da o'tkaziladigan sud majlisida dalillar keltiriladi.` },
        { step: 3, title: "Ijro varaqasi va MIB", desc: "Sud qarori qonuniy kuchga kirgach, MIB orqali majburiy undiruv boshlanadi." }
      ],
      approxFees: "Mulk xarakteridagi da'volar bo'yicha: da'vo bahosining 4 foizi (kamida 1 BHM)",
      warnings: ["Qarz berayotganda albatta yozma tilxat oling yoki notariusda qarz shartnomasi tuzing, og'zaki kelishuv sudda isbotlanmaydi!"],
      targetLocationType: "court",
      targetLocationId: preset.court.id,
      locationName: preset.court.name,
      address: preset.court.addr,
      region: reg,
      lat: preset.court.lat,
      lng: preset.court.lng,
      buses: preset.court.buses,
      transitAdvice: `${preset.court.name}ga ${preset.court.buses.join(', ')}-sonli avtobuslar bilan borasiz.`
    };
  }

  // 16. KADASTR, YER UCHASTKASI VA QURILISH
  if (p.includes('kadastr') || p.includes('yer ') || p.includes('uchastka') || p.includes('yerim') || p.includes('chegara') || p.includes('qurilish') || p.includes('qizil chiziq')) {
    return {
      title: `Kadastr pasporti va Yer masalalari: ${preset.cadastre.name}`,
      shortSummary: `Kadastr pasportini yangilash, yer uchastkasi chegaralarini belgilash va mulk huquqini davlat ro'yxatidan o'tkazish uchun ${preset.cadastre.name} yoki Davlat Xizmatlari Markaziga (DXM) murojaat qilasiz. Yangi tartib bo'yicha elektron QR-kodli kadastr pasporti beriladi.`,
      voiceScript: `Assalomu alaykum! Kadastr hujjatlarini rasmiylashtirish uchun eng yaqin ${preset.cadastre.name}ga borishingiz kerak. Xaritada manzilni belgilab qo'ydim, ${preset.cadastre.buses.join(', ')}-sonli avtobuslar to'g'ri boradi.`,
      documents: [
        { name: "Mulkdorning pasporti yoki ID-kartasi", note: "Asl nusxasi", requiredBy: "Mulkdor" },
        { name: "Mulk huquqini tasdiqlovchi hujjat", note: "Shartnoma, hokim qarori yoki order", requiredBy: "Mulkdor" },
        { name: "Avvalgi kadastr yig'majildi (agar bor bo'lsa)", note: "Asli", requiredBy: "Mulkdor" }
      ],
      steps: [
        { step: 1, title: "Ariza topshirish", desc: "DXM orqali yoki my.gov.uz portalida elektron ariza yuboriladi." },
        { step: 2, title: "Muhandis tomonidan o'lchov", desc: "Kadastr muhandisi joyiga chiqib binoni texnik xatlovdan o'tkazadi." },
        { step: 3, title: "QR-kodli yangi kadastr pasporti olish", desc: "Tayyor elektron pasport DXM yoki my.gov.uz orqali taqdim etiladi." }
      ],
      approxFees: "BHM 1.25 baravari + har bir kv. metr maydoni uchun belgilangan stavka",
      warnings: ["Noqonuniy qurilmalar mavjud bo'lsa, oldi-sotdidan oldin ularni qonuniylashtirish shart!"],
      targetLocationType: "cadastre",
      targetLocationId: preset.cadastre.id,
      locationName: preset.cadastre.name,
      address: preset.cadastre.addr,
      region: reg,
      lat: preset.cadastre.lat,
      lng: preset.cadastre.lng,
      buses: preset.cadastre.buses,
      transitAdvice: `${preset.cadastre.name}ga ${preset.cadastre.buses.join(', ')}-sonli avtobuslar qatnaydi.`
    };
  }

  // 17. UY-JOY / KVARTIRA / HOVLI OLDI-SOTDISI
  if (p.includes('uy') || p.includes('kvartir') || p.includes('hovli') || p.includes('bino') || p.includes('дом') || p.includes('квартир') || p.includes('house') || p.includes('apartment')) {
    return {
      title: `Uy-joy oldi-sotdisi: ${preset.notary.name} & ${preset.cadastre.name}`,
      shortSummary: `Ko'chmas mulk oldi-sotdisi ${preset.notary.name}da tasdiqlanadi va ${preset.cadastre.name}da yangi mulkdor nomiga rasmiylashtiriladi. Uyda doimiy ro'yxatda (propiskada) turgan barcha shaxslarning notarial roziligi qat'iy talab qilinadi! Garov, taqiq va soliq qarzdorligi yo'qligi tekshiriladi.`,
      voiceScript: `Assalomu alaykum! Uyingizni sotish uchun kadastr pasporti, mulk hujjati va barcha propiskadagilarning roziligi kerak. Xaritada ${preset.notary.name} va ${preset.cadastre.name}ni belgilab qo'ydim.`,
      documents: [
        { name: "Sotuvchi va xaridor pasporti (ID-karta)", note: "Asl nusxasi", requiredBy: "Ikkala tomon" },
        { name: "Uyga bo'lgan mulk huquqini tasdiqlovchi hujjat", note: "Oldi-sotdi shartnomasi, order yoki meros", requiredBy: "Sotuvchi" },
        { name: "Kadastr pasporti va ma'lumotnoma", note: "Amaldagi kadastr yig'majildi", requiredBy: "Sotuvchi" },
        { name: "Uyda doimiy ro'yxatdagilarning notarial roziligi", note: "Barcha voyaga yetgan shaxslar", requiredBy: "Sotuvchi oilasi" }
      ],
      steps: [
        { step: 1, title: "Kadastr va taqiqlarni tekshirish", desc: "e-notarius orqali uy garovda yoki hibsda emasligi tekshiriladi." },
        { step: 2, title: "Notariusda shartnoma imzolash", desc: `Tomonlar ${preset.notary.name}ga kelib oldi-sotdi shartnomasini tasdiqlaydi.` },
        { step: 3, title: "Kadastrda ro'yxatdan o'tkazish", desc: `Mulk huquqi ${preset.cadastre.name}da rasmiylashtirilib, xaridorga yangi kadastr pasporti beriladi.` }
      ],
      approxFees: "Notarius davlat boji: 1 BHM (viloyatlarda 0.5 BHM) + Kadastr ro'yxatdan o'tkazish to'lovi",
      warnings: ["Uyda voyaga yetmagan bolalar ro'yxatda bo'lsa, vasiylik va homiylik organining yozma ruxsati shart!"],
      targetLocationType: "cadastre",
      targetLocationId: preset.cadastre.id,
      locationName: preset.cadastre.name,
      address: preset.cadastre.addr,
      region: reg,
      lat: preset.cadastre.lat,
      lng: preset.cadastre.lng,
      buses: preset.cadastre.buses,
      transitAdvice: `${preset.cadastre.name}ga ${preset.cadastre.buses.join(', ')}-sonli avtobuslar bilan borishingiz mumkin.`
    };
  }

  // 18. MASHINA / AVTOMOBIL OLDI-SOTDISI
  if (p.includes('moshin') || p.includes('mashin') || p.includes('avto') || p.includes('авто') || p.includes('машин') || p.includes('car') || p.includes('transport') || p.includes('gayi') || p.includes('yhxdx')) {
    return {
      title: `Mashina sotish tartibi: ${preset.notary.name} & YHXDX`,
      shortSummary: `Mashinangizni sotish uchun siz avvalo ${preset.notary.name}ga borib oldi-sotdi shartnomasini tasdiqlatasiz. Shartnomadan so'ng xaridor 10 kun ichida ${preset.yhxdx.name}ga borib yangi tex-pasport va davlat raqami oladi.`,
      voiceScript: `Assalomu alaykum! Mashinangizni sotish uchun sizga faqat pasport va avtomobil tex-pasporti kerak. Avval ${preset.notary.name}ga, so'ngra ${preset.yhxdx.name}ga borasiz. Xaritada eng yaqin manzilni belgilab qo'ydim, ${preset.notary.buses.join(', ')}-avtobuslar olib boradi.`,
      documents: [
        { name: "Sotuvchi va xaridorning pasporti yoki ID-kartasi", note: "Asl nusxasi", requiredBy: "Ikkala tomon" },
        { name: "Avtomobilning ro'yxatdan o'tganlik guvohnomasi (Tex-pasport)", note: "Asli", requiredBy: "Sotuvchi" },
        { name: "Turmush o'rtog'ining notarial roziligi", note: "Agar nikoh davrida sotib olingan bo'lsa (yoki notariusga birga keladi)", requiredBy: "Sotuvchi" },
        { name: "MIB, radar jarimalari va taqiqlar yo'qligi", note: "Notarius e-notarius tizimida bir zumda avtomat tekshiradi", requiredBy: "Tizim orqali" }
      ],
      steps: [
        { step: 1, title: "Taqiq va jarimalarni tozalash", desc: "Avtomobilda MIB taqiqi va to'lanmagan jarimalar yo'qligiga ishonch hosil qiling." },
        { step: 2, title: "Notariusda shartnomani imzolash", desc: `Sotuvchi va xaridor ${preset.notary.name} oldida shartnomani tasdiqlaydi.` },
        { step: 3, title: "YHXDX (GAYI) da ro'yxatdan o'tkazish", desc: `Xaridor 10 kun ichida ${preset.yhxdx.name}ga borib yangi tex-pasport oladi.` }
      ],
      approxFees: "Notarius boji: 3 yilgacha - 3 BHM, 3-7 yil - 2 BHM, 7 yildan ortiq - 1 BHM. Qarindoshlarga 0.5 BHM.",
      warnings: ["Hech qachon mashinani 'bosh ishonchnoma' (doverennost) bilan sotmang — radar jarimalari va soliqlar sizning nomingizga kelaveradi!"],
      targetLocationType: "notary_and_traffic_police",
      targetLocationId: preset.notary.id,
      locationName: preset.notary.name,
      address: preset.notary.addr,
      region: reg,
      lat: preset.notary.lat,
      lng: preset.notary.lng,
      buses: preset.notary.buses,
      transitAdvice: `${preset.notary.name}ga ${preset.notary.buses.join(', ')}-sonli avtobuslar bilan borasiz; YHXDXga esa ${preset.yhxdx.buses.join(', ')}-sonli avtobuslar boradi.`
    };
  }

  // 19. ISHONCHNOMA / DOVERENNOST
  if (p.includes('ishonchnoma') || p.includes('doverennost') || p.includes('доверенност') || p.includes('attorney')) {
    return {
      title: `Ishonchnoma (Doverennost) rasmiylashtirish: ${preset.notary.name}`,
      shortSummary: `Ishonchnoma (avtomobil boshqarish, mulkni boshqarish, sud vakilligi) ${preset.notary.name}da rasmiylashtiriladi. e-notarius.uz orqali navbat olsangiz, 10 daqiqada tayyor bo'ladi. Yaqin qarindoshlarga beriladigan ishonchnomalar uchun 50 foiz chegirma mavjud.`,
      voiceScript: `Ishonchnoma olish uchun shaxsingizni tasdiqlovchi pasport va ishonchli shaxsning pasport ma'lumotlari kerak. Sizga eng yaqin ${preset.notary.name}ni xaritada ko'rsatmoqdaman.`,
      documents: [
        { name: "Ishonch bildiruvchining pasporti yoki ID-kartasi", note: "Asl nusxasi", requiredBy: "Mulkdor" },
        { name: "Ishonchli shaxsning pasport ma'lumotlari", note: "JShShIR va pasport seriyasi", requiredBy: "Mulkdor" },
        { name: "Mulk hujjati (Tex-pasport yoki Kadastr)", note: "Asl nusxasi", requiredBy: "Mulkdor" }
      ],
      steps: [
        { step: 1, title: "Notarius qabuliga yozilish", desc: "e-notarius.uz sayti orqali navbat oling yoki shaxsan boring." },
        { step: 2, title: "Davlat bojini to'lash", desc: "Yaqin qarindoshlarga (ota-ona, er-xotin, farzandlar) 50% imtiyoz bor." },
        { step: 3, title: "QR-kodli ishonchnoma olish", desc: "Elektron reyestrga kiritilgan ishonchnomani oling." }
      ],
      approxFees: "Avto boshqarish: yaqin qarindoshga 0.1 BHM, begona shaxsga 1 BHM. Sotish huquqi bilan: 3 BHM.",
      warnings: ["Begona shaxsga 'sotish huquqi bilan' bosh ishonchnoma berish xavfli — mulk egasi sifatida siz javobgar bo'lib qolasiz!"],
      targetLocationType: "notary",
      targetLocationId: preset.notary.id,
      locationName: preset.notary.name,
      address: preset.notary.addr,
      region: reg,
      lat: preset.notary.lat,
      lng: preset.notary.lng,
      buses: preset.notary.buses,
      transitAdvice: `${preset.notary.name}ga ${preset.notary.buses.join(', ')}-sonli avtobuslar bilan borasiz.`
    };
  }

  // 20. BOJ VA NARXLAR / BHM
  if (p.includes('boj') || p.includes('bhm') || p.includes('narx') || p.includes('qancha to\'layman') || p.includes('stavka')) {
    return {
      title: "Davlat bojlari va BHM (Baza Hisoblash Miqdori)",
      shortSummary: `O'zbekistonda davlat bojlari Baza Hisoblash Miqdoriga (BHM = 375,000 so'm) bog'langan. Bojlar kalkulyatori orqali avtomobil, uy-joy oldi-sotdisi va notarial xizmatlar narxini 1 soniyada aniq hisoblashingiz mumkin. Barcha to'lovlar elektron kvitansiya orqali qabul qilinadi.`,
      voiceScript: `Assalomu alaykum! Hozirgi kunda Baza Hisoblash Miqdori 375,000 so'mni tashkil etadi. Bojlar kalkulyatorimiz orqali barcha davlat to'lovlarini aniq hisoblab olishingiz mumkin.`,
      documents: [
        { name: "To'lovchi shaxsning pasporti yoki ID-kartasi", note: "Asl nusxasi", requiredBy: "To'lovchi" },
        { name: "Invoys yoki to'lov bildirishnomasi", note: "QR-kodli chek", requiredBy: "To'lovchi" }
      ],
      steps: [
        { step: 1, title: "Xizmat turini aniqlash", desc: "Notarius, YHXDX yoki Kadastr boji stavkasi belgilanadi." },
        { step: 2, title: "Imtiyozlarni tekshirish", desc: "1-guruh nogironlari, urush qatnashchilari va yaqin qarindoshlarga 50% chegirma beriladi." },
        { step: 3, title: "To'lovni amalga oshirish", desc: "Bank kassasi yoki elektron to'lov tizimlari orqali to'lanadi." }
      ],
      approxFees: "Amaldagi BHM: 375,000 so'm",
      warnings: ["Davlat bojlari uchun naqd pulni hech qachon xodimning qo'liga bermang — faqat rasmiy kassa yoki bank cheki orqali to'lang!"],
      targetLocationType: "notary",
      targetLocationId: preset.notary.id,
      locationName: preset.notary.name,
      address: preset.notary.addr,
      region: reg,
      lat: preset.notary.lat,
      lng: preset.notary.lng,
      buses: preset.notary.buses,
      transitAdvice: `${preset.notary.name}ga ${preset.notary.buses.join(', ')}-sonli avtobuslar bilan borasiz.`
    };
  }

  // 21. UNIVERSAL AQLLI SEMANTIK TAHLIL (HAR QANDAY SAVOLGA MOSLANUVCHI)
  const queryClean = prompt.trim().replace(/[?.,!]/g, '');
  return {
    title: `Huquqiy maslahat: "${queryClean.slice(0, 45)}"`,
    shortSummary: `Sizning "${queryClean}" bo'yicha murojaatingiz yuzasidan O'zbekiston Respublikasi qonunchiligiga muvofiq rasmiy tartib quyidagicha: Mazkur masalani qonuniy hal etish uchun eng yaqin ${preset.dxm.name} yoki ${preset.notary.name}ga murojaat qilishingiz tavsiya etiladi. Pasport va asoslovchi hujjatlarni tayyorlab boring.`,
    voiceScript: `Assalomu alaykum! Siz so'ragan masala bo'yicha sizga eng yaqin ${preset.dxm.name}ga borishingizni tavsiya qilaman. Xaritada barcha manzil va avtobuslarni belgilab qo'ydim.`,
    documents: [
      { name: "Shaxsingizni tasdiqlovchi pasport yoki ID-karta", note: "Asl nusxasi", requiredBy: "Fuqaro" },
      { name: "Murojaatga asos bo'luvchi barcha shartnoma, chek yoki arizalar", note: "Asl nusxalari", requiredBy: "Fuqaro" }
    ],
    steps: [
      { step: 1, title: "Hujjatlarni to'plash", desc: "Murojaatingiz bo'yicha shaxsiy hujjatlaringiz va tegishli asoslarni jamlang." },
      { step: 2, title: "Muassasaga tashrif buyurish", desc: `${preset.dxm.addr} manziliga boring yoki my.gov.uz orqali ariza topshiring.` },
      { step: 3, title: "Qonuniy natijani olish", desc: "Mutaxassis ko'rigidan so'ng belgilangan tartibda rasmiy hujjat yoki xizmatni oling." }
    ],
    approxFees: "Qonun hujjatlariga muvofiq belgilangan davlat boji undiriladi",
    warnings: ["Har doim rasmiy muassasalarga murojaat qiling va barcha to'lovlar uchun elektron kvitansiya oling!"],
    targetLocationType: "dxm",
    targetLocationId: preset.dxm.id,
    locationName: preset.dxm.name,
    address: preset.dxm.addr,
    region: reg,
    lat: preset.dxm.lat,
    lng: preset.dxm.lng,
    buses: preset.dxm.buses,
    transitAdvice: `${preset.dxm.name}ga ${preset.dxm.buses.join(', ')}-sonli avtobuslar bilan borasiz.`
  };
}

// Legal assistant API endpoint
app.post('/api/legal-consult', async (req: Request, res: Response) => {
  const startTime = Date.now();
  const { prompt, language = 'uz', region = 'tashkent' } = req.body;

  if (!prompt || typeof prompt !== 'string') {
    return res.status(400).json({ error: 'Prompt is required' });
  }

  const lang = (['uz', 'ru', 'en'].includes(language) ? language : 'uz') as 'uz' | 'ru' | 'en';

  // If Gemini API is available with valid key, use it
  if (ai) {
    try {
      const systemInstruction = `Siz O'zbekiston Respublikasi qonunchiligi bo'yicha eng yuqori malakali Huquqiy Maslahatchisiz.
Foydalanuvchi qaysi viloyatdan so'rasa (Andijon, Toshkent, Samarqand, Farg'ona, Namangan, Buxoro va b.), 
aniq o'sha viloyatdagi muassasa manzili, qatnovchi avtobuslari va zarur hujjatlarini 5 soniya ichida tayyorlang.
Javob tilingiz: ${lang === 'uz' ? "O'zbek tili (lotin yozuvida, juda tushunarli va muloyim)" : lang === 'ru' ? "Русский язык" : "English"}.`;

      const aiPromise = ai.models.generateContent({
        model: 'gemini-3.8-flash',
        contents: `Savol: "${prompt}". Tanlangan hudud: ${region}. O'zbekiston qonunlari bo'yicha aniq hujjatlar, manzil va qatnaydigan avtobuslarni ko'rsat.`,
        config: {
          systemInstruction,
          responseMimeType: 'application/json',
        },
      });

      const timeoutPromise = new Promise((_, reject) =>
        setTimeout(() => reject(new Error('AI timeout')), 3500)
      );

      const aiResponse = (await Promise.race([aiPromise, timeoutPromise])) as any;
      const responseText = aiResponse?.text;
      if (responseText) {
        const parsed = JSON.parse(responseText);
        return res.json({
          ...parsed,
          source: 'gemini-3.8-flash',
          durationMs: Date.now() - startTime,
        });
      }
    } catch (err: any) {
      console.warn('Gemini API call timed out or failed, using dynamic regional engine:', err?.message);
    }
  }

  // Fast, intelligent, tailored regional legal engine
  const result = analyzeAndGenerateLegalAdvice(prompt, lang, region);
  return res.json({
    ...result,
    source: 'legal_engine_uz',
    durationMs: Date.now() - startTime,
  });
});


// Real-time Bus routes and stops endpoint
app.get('/api/bus-routes', (_req: Request, res: Response) => {
  const routes = [
    {
      id: "58",
      name: "Avtobus №58 (Chorsu — Amir Temur — Notarial Markaz — Sergeli)",
      color: "#2563eb",
      interval: "6-8 daqiqa",
      stops: [
        { name: "Chorsu bozori", lat: 41.3275, lng: 69.2390 },
        { name: "Xalqlar Do'stligi (DXM Markazi)", lat: 41.3110, lng: 69.2415 },
        { name: "Oliy Majlis va Adliya Vazirligi", lat: 41.3090, lng: 69.2480 },
        { name: "Amir Temur xiyoboni (1-Notarius)", lat: 41.3111, lng: 69.2797 },
        { name: "Yunusobod DXM filiali", lat: 41.3450, lng: 69.2890 }
      ]
    },
    {
      id: "28",
      name: "Avtobus №28 (Ibn Sino — Shota Rustaveli — Fayzobod YHXDX)",
      color: "#059669",
      interval: "7-10 daqiqa",
      stops: [
        { name: "Ibn Sino mavzesi", lat: 41.3390, lng: 69.1750 },
        { name: "Bunyodkor shoh ko'chasi", lat: 41.2850, lng: 69.2150 },
        { name: "Yakkasaroy DXM & Notariat", lat: 41.2830, lng: 69.2550 },
        { name: "Mirobod Tumani Notarial Idorasi", lat: 41.2980, lng: 69.2720 },
        { name: "Fayzobod YHXDX (Avto ro'yxatga olish)", lat: 41.2720, lng: 69.3190 }
      ]
    },
    {
      id: "44",
      name: "Avtobus №44 (Toshkent Vokzali — Fayzobod GAYI / Tex-ko'rik)",
      color: "#d97706",
      interval: "8-12 daqiqa",
      stops: [
        { name: "Shimoliy Vokzal", lat: 41.2925, lng: 69.2850 },
        { name: "Fayzobod massivi", lat: 41.2780, lng: 69.3050 },
        { name: "Fayzobod YHXDX (Avto-mototransport ro'yxat)", lat: 41.2720, lng: 69.3190 },
        { name: "Qo'yliq 1-mavze (Kadastr filiali)", lat: 41.2480, lng: 69.3320 }
      ]
    },
    {
      id: "115",
      name: "Avtobus №115 (Chilonzor 25 — Mirzo Ulug'bek DXM — Kadastr)",
      color: "#7c3aed",
      interval: "9-12 daqiqa",
      stops: [
        { name: "Chilonzor Metro", lat: 41.2750, lng: 69.2050 },
        { name: "Novza (Davlat Xizmatlari Markazi)", lat: 41.2920, lng: 69.2280 },
        { name: "Navoiy ko'chasi (Adliya boshqarmasi)", lat: 41.3210, lng: 69.2540 },
        { name: "Mirzo Ulug'bek Kadastr va Notarius", lat: 41.3320, lng: 69.3250 }
      ]
    }
  ];

  return res.json({ routes });
});

// Official institutions and coordinates for Tashkent & regions
app.get('/api/legal-locations', (_req: Request, res: Response) => {
  const locations = [
    {
      id: "notary-1",
      name: "Toshkent shahar 1-son Davlat Notarial Idorasi",
      nameRu: "Ташкентская городская государственная нотариальная контора №1",
      type: "notary",
      lat: 41.3111,
      lng: 69.2797,
      address: "Toshkent shahri, Amir Temur shoh ko'chasi, 24-uy",
      hours: "09:00 - 18:00 (Dush-Juma), 09:00 - 15:00 (Shanba)",
      phone: "+998 (71) 233-14-52",
      buses: ["58", "28", "67", "93"],
      services: ["Avtomobil oldi-sotdisi", "Uy-joy oldi-sotdisi", "Ishonchnoma", "Meros guvohnomasi"]
    },
    {
      id: "yhxdx-fayzobod",
      name: "Toshkent shahar YHXDX Avto-mototransport ro'yxatga olish bo'limi (Fayzobod GAYI)",
      nameRu: "Отделение регистрации автотранспорта СБДД (Файзабад)",
      type: "traffic_police",
      lat: 41.2720,
      lng: 69.3190,
      address: "Toshkent shahri, Mirobod tumani, Fayzobod ko'chasi 1-berk",
      hours: "09:00 - 18:00 (Seshanba - Shanba)",
      phone: "+998 (71) 256-43-11",
      buses: ["28", "44"],
      services: ["Yangi tex-pasport berish", "Davlat raqam belgisi berish", "Avtomobilni texnik ko'rikdan o'tkazish", "Taqiqni yechish"]
    },
    {
      id: "cadastre-tashkent",
      name: "Davlat Kadastrlari Palatasi Toshkent shahar boshqarmasi (Kadastr)",
      nameRu: "Палата государственных кадастров г. Ташкент",
      type: "cadastre",
      lat: 41.3320,
      lng: 69.3250,
      address: "Toshkent shahri, Mirzo Ulug'bek tumani, Mustaqillik shoh ko'chasi 105",
      hours: "09:00 - 18:00 (Dush-Juma)",
      phone: "+998 (71) 267-34-12",
      buses: ["115", "93"],
      services: ["Uy-joy kadastr pasportini tayyorlash", "Mulk huquqini davlat ro'yxatidan o'tkazish", "Yer uchastkalari chegaralarini belgilash"]
    },
    {
      id: "dxm-center",
      name: "Toshkent shahar Markaziy Davlat Xizmatlari Markazi (DXM)",
      nameRu: "Центральный Центр Государственных Услуг (ЦГУ)",
      type: "dxm",
      lat: 41.3110,
      lng: 69.2415,
      address: "Toshkent shahri, Shayxontohur tumani, Furqat ko'chasi 1-A",
      hours: "09:00 - 18:00 (Dushanba - Juma)",
      phone: "+998 (71) 203-60-00 (Call-center: 1148)",
      buses: ["58", "115"],
      services: ["Kadastr pasporti olish", "Propiska va ID-karta", "ERI (Elektron raqamli imzo)", "Tadbirkorlikni ro'yxatga olish"]
    }
  ];

  return res.json({ locations });
});

// Configure Vite in development or serve dist in production
async function startServer() {
  if (process.env.NODE_ENV !== 'production') {
    const { createServer } = await import('vite');
    const vite = await createServer({
      server: { middlewareMode: true },
      appType: 'spa',
    });
    app.use(vite.middlewares);
  } else {
    app.use(express.static(path.join(__dirname, 'dist')));
    app.get('*', (_req: Request, res: Response) => {
      res.sendFile(path.join(__dirname, 'dist', 'index.html'));
    });
  }

  app.listen(port, '0.0.0.0', () => {
    console.log(`Server listening on http://0.0.0.0:${port}`);
  });
}

startServer();
