import { BusRoute, LegalLocation, RegionInfo } from '../types';

export const UZBEKISTAN_REGIONS: RegionInfo[] = [
  { id: "tashkent", name: "Toshkent shahri", nameRu: "г. Ташкент", nameEn: "Tashkent City", lat: 41.3111, lng: 69.2797, zoom: 13 },
  { id: "andijon", name: "Andijon viloyati", nameRu: "Андижанская область", nameEn: "Andijan Region", lat: 40.7821, lng: 72.3442, zoom: 13 },
  { id: "samarkand", name: "Samarqand viloyati", nameRu: "Самаркандская область", nameEn: "Samarkand Region", lat: 39.6542, lng: 66.9597, zoom: 13 },
  { id: "fergana", name: "Farg'ona viloyati", nameRu: "Ферганская область", nameEn: "Fergana Region", lat: 40.3864, lng: 71.7864, zoom: 13 },
  { id: "namangan", name: "Namangan viloyati", nameRu: "Наманганская область", nameEn: "Namangan Region", lat: 40.9983, lng: 71.6726, zoom: 13 },
  { id: "bukhara", name: "Buxoro viloyati", nameRu: "Бухарская область", nameEn: "Bukhara Region", lat: 39.7747, lng: 64.4286, zoom: 13 },
  { id: "kashkadarya", name: "Qashqadaryo viloyati (Qarshi)", nameRu: "Кашкадарьинская область (Карши)", nameEn: "Kashkadarya (Karshi)", lat: 38.8606, lng: 65.7891, zoom: 13 },
  { id: "surkhandarya", name: "Surxondaryo viloyati (Termiz)", nameRu: "Сурхандарьинская область (Термез)", nameEn: "Surkhandarya (Termez)", lat: 37.2242, lng: 67.2783, zoom: 13 },
  { id: "khorezm", name: "Xorazm viloyati (Urganch)", nameRu: "Хорезмская область (Ургенч)", nameEn: "Khorezm (Urgench)", lat: 41.5562, lng: 60.6317, zoom: 13 },
  { id: "navoi", name: "Navoiy viloyati", nameRu: "Навоийская область", nameEn: "Navoi Region", lat: 40.0844, lng: 65.3792, zoom: 13 },
  { id: "jizzakh", name: "Jizzax viloyati", nameRu: "Джизакская область", nameEn: "Jizzakh Region", lat: 40.1158, lng: 67.8422, zoom: 13 },
  { id: "syrdarya", name: "Sirdaryo viloyati (Guliston)", nameRu: "Сырдарьинская область (Гулистан)", nameEn: "Syrdarya (Gulistan)", lat: 40.4897, lng: 68.7847, zoom: 13 },
  { id: "karakalpakstan", name: "Qoraqalpog'iston Respublikasi (Nukus)", nameRu: "Республика Каракалпакстан (Нукус)", nameEn: "Karakalpakstan (Nukus)", lat: 42.4602, lng: 59.6166, zoom: 13 },
  { id: "tashkent_region", name: "Toshkent viloyati (Nurafshon/Chirchiq)", nameRu: "Ташкентская область (Нурафшон)", nameEn: "Tashkent Region", lat: 41.0500, lng: 69.3500, zoom: 12 },
];

export const INITIAL_LEGAL_LOCATIONS: LegalLocation[] = [
  // --- ANDIJON VILOYATI ---
  {
    id: "andijon-notary-1",
    region: "andijon",
    name: "Andijon shahar 1-son Davlat Notarial Idorasi",
    nameRu: "Андижанская городская государственная нотариальная контора №1",
    type: "notary",
    lat: 40.7825,
    lng: 72.3450,
    address: "Andijon shahri, Alisher Navoiy shoh ko'chasi 14-uy (Mo'ljal: Bobur maydoni)",
    hours: "09:00 - 18:00 (Dushanba - Juma), 09:00 - 15:00 (Shanba)",
    phone: "+998 (74) 223-45-12",
    buses: ["12", "33", "5"],
    services: [
      "Avtomobil oldi-sotdi shartnomasi",
      "Uy-joy va yer oldi-sotdisi",
      "Ishonchnoma va hadyanoma",
      "Merosga bo'lgan huquq to'g'risida guvohnoma"
    ]
  },
  {
    id: "andijon-cadastre",
    region: "andijon",
    name: "Davlat Kadastrlari Palatasi Andijon viloyati boshqarmasi (Kadastr)",
    nameRu: "Палата государственных кадастров Андижанской области",
    type: "cadastre",
    lat: 40.7710,
    lng: 72.3520,
    address: "Andijon shahri, Fitrat ko'chasi 28-uy",
    hours: "09:00 - 18:00 (Dush-Juma)",
    phone: "+998 (74) 226-78-90",
    buses: ["33", "12"],
    services: [
      "Uy-joy kadastr pasportini tayyorlash",
      "Yer uchastkalari chegaralarini o'lchash",
      "Ko'chmas mulk huquqini davlat ro'yxatidan o'tkazish"
    ]
  },
  {
    id: "andijon-yhxdx",
    region: "andijon",
    name: "Andijon viloyat YHXDX Ro'yxatdan o'tkazish bo'limi (Bog'ishamol GAYI)",
    nameRu: "Регистрационный отдел СБДД Андижанской области (Богишамол)",
    type: "traffic_police",
    lat: 40.7950,
    lng: 72.3780,
    address: "Andijon shahri, Bog'ishamol dahasi, Bobur shoh ko'chasi (Viloyat GAYI)",
    hours: "09:00 - 18:00 (Seshanba - Shanba)",
    phone: "+998 (74) 224-10-02",
    buses: ["12", "21"],
    services: [
      "Yangi avto tex-pasport berish",
      "Davlat raqam belgilarini rasmiylashtirish",
      "Avtotransportni texnik ko'rikdan o'tkazish",
      "Radar va MIB taqiqlari"
    ]
  },
  {
    id: "andijon-dxm",
    region: "andijon",
    name: "Andijon shahar Davlat Xizmatlari Markazi (DXM)",
    nameRu: "Центр Государственных Услуг г. Андижан",
    type: "dxm",
    lat: 40.7780,
    lng: 72.3390,
    address: "Andijon shahri, Milliy Tiklanish ko'chasi 45-uy",
    hours: "09:00 - 18:00 (Dush-Juma)",
    phone: "+998 (74) 225-11-48",
    buses: ["33", "5"],
    services: [
      "Kadastr ro'yxatidan o'tkazish",
      "Propiska va ID-karta",
      "Elektron raqamli imzo (ERI)"
    ]
  },

  // --- SAMARQAND VILOYATI ---
  {
    id: "samarkand-notary-1",
    region: "samarkand",
    name: "Samarqand shahar 1-son Davlat Notarial Idorasi",
    nameRu: "Самаркандская городская государственная нотариальная контора №1",
    type: "notary",
    lat: 39.6550,
    lng: 66.9605,
    address: "Samarqand shahri, Mirzo Ulug'bek ko'chasi 62-uy (Registon yaqinida)",
    hours: "09:00 - 18:00",
    phone: "+998 (66) 233-54-12",
    buses: ["10", "22"],
    services: [
      "Avtomobil va uy-joy oldi-sotdisi",
      "Ishonchnoma berish",
      "Meros guvohnomalari"
    ]
  },
  {
    id: "samarkand-yhxdx",
    region: "samarkand",
    name: "Samarqand viloyati YHXDX Ro'yxatdan o'tkazish bo'limi (Motarid GAYI)",
    nameRu: "Отдел регистрации СБДД Самаркандской области (Мотарид)",
    type: "traffic_police",
    lat: 39.6820,
    lng: 66.9850,
    address: "Samarqand shahri, Motarid mavzesi, Gagarin ko'chasi",
    hours: "09:00 - 18:00 (Sesh-Shanba)",
    phone: "+998 (66) 221-02-02",
    buses: ["22", "14"],
    services: [
      "Avtomobil ro'yxatga olish va qayta ro'yxatlash",
      "Tex-pasport va davlat raqami"
    ]
  },
  {
    id: "samarkand-cadastre",
    region: "samarkand",
    name: "Davlat Kadastrlari Palatasi Samarqand viloyati boshqarmasi",
    nameRu: "Палата государственных кадастров Самаркандской области",
    type: "cadastre",
    lat: 39.6480,
    lng: 66.9420,
    address: "Samarqand shahri, Beruniy ko'chasi 19-uy",
    hours: "09:00 - 18:00",
    phone: "+998 (66) 231-15-44",
    buses: ["10"],
    services: [
      "Ko'chmas mulk kadastr pasporti",
      "Yer uchastkalari davlat ro'yxati"
    ]
  },

  // --- FARG'ONA VILOYATI ---
  {
    id: "fergana-notary-1",
    region: "fergana",
    name: "Farg'ona shahar 1-son Davlat Notarial Idorasi",
    nameRu: "Ферганская городская нотариальная контора №1",
    type: "notary",
    lat: 40.3870,
    lng: 71.7870,
    address: "Farg'ona shahri, Al-Farg'oniy ko'chasi 42-uy",
    hours: "09:00 - 18:00",
    phone: "+998 (73) 244-12-30",
    buses: ["8", "15"],
    services: ["Oldi-sotdi shartnomalari", "Ishonchnoma"]
  },
  {
    id: "fergana-yhxdx",
    region: "fergana",
    name: "Farg'ona viloyat YHXDX Ro'yxatdan o'tkazish bo'limi",
    nameRu: "Отдел регистрации СБДД Ферганской области",
    type: "traffic_police",
    lat: 40.3990,
    lng: 71.8120,
    address: "Farg'ona shahri, Qirguli dahasi, Marg'iloniy ko'chasi",
    hours: "09:00 - 18:00",
    phone: "+998 (73) 222-10-02",
    buses: ["8"],
    services: ["Avtomobil tex-pasporti", "Davlat raqamlari"]
  },

  // --- NAMANGAN VILOYATI ---
  {
    id: "namangan-notary-1",
    region: "namangan",
    name: "Namangan shahar 1-son Davlat Notarial Idorasi",
    nameRu: "Наманганская городская нотариальная контора №1",
    type: "notary",
    lat: 40.9990,
    lng: 71.6730,
    address: "Namangan shahri, Bobur shoh ko'chasi 15-uy",
    hours: "09:00 - 18:00",
    phone: "+998 (69) 226-50-20",
    buses: ["4", "19"],
    services: ["Oldi-sotdi", "Ishonchnoma", "Kadastr tasdiqlash"]
  },
  {
    id: "namangan-yhxdx",
    region: "namangan",
    name: "Namangan viloyat YHXDX Avto ro'yxatga olish bo'limi",
    nameRu: "Регистрационный отдел СБДД Наманганской области",
    type: "traffic_police",
    lat: 41.0150,
    lng: 71.6920,
    address: "Namangan shahri, Kosonsoy ko'chasi",
    hours: "09:00 - 18:00",
    phone: "+998 (69) 234-10-02",
    buses: ["4"],
    services: ["Avto qayta ro'yxatlash", "Texnik ko'rik"]
  },

  // --- BUXORO VILOYATI ---
  {
    id: "bukhara-notary-1",
    region: "bukhara",
    name: "Buxoro shahar 1-son Davlat Notarial Idorasi",
    nameRu: "Бухарская городская государственная нотариальная контора №1",
    type: "notary",
    lat: 39.7750,
    lng: 64.4290,
    address: "Buxoro shahri, M.Iqbol ko'chasi 11-uy",
    hours: "09:00 - 18:00",
    phone: "+998 (65) 223-14-11",
    buses: ["7", "11"],
    services: ["Avto va uy-joy oldi-sotdisi", "Ishonchnoma"]
  },
  {
    id: "bukhara-yhxdx",
    region: "bukhara",
    name: "Buxoro viloyati YHXDX Ro'yxatdan o'tkazish bo'limi",
    nameRu: "Регистрационный отдел СБДД Бухарской области",
    type: "traffic_police",
    lat: 39.7890,
    lng: 64.4550,
    address: "Buxoro shahri, G'ijduvon shoh ko'chasi",
    hours: "09:00 - 18:00",
    phone: "+998 (65) 224-02-02",
    buses: ["7"],
    services: ["Yangi tex-pasport", "Davlat raqamlari"]
  },

  // --- QASHQADARYO (QARSHI) ---
  {
    id: "qarshi-notary-1",
    region: "kashkadarya",
    name: "Qarshi shahar 1-son Davlat Notarial Idorasi",
    nameRu: "Каршинская государственная нотариальная контора №1",
    type: "notary",
    lat: 38.8610,
    lng: 65.7900,
    address: "Qarshi shahri, Mustaqillik shoh ko'chasi 22-uy",
    hours: "09:00 - 18:00",
    phone: "+998 (75) 221-18-20",
    buses: ["3", "17"],
    services: ["Notarial shartnomalar"]
  },
  {
    id: "qarshi-yhxdx",
    region: "kashkadarya",
    name: "Qashqadaryo viloyat YHXDX Ro'yxatdan o'tkazish bo'limi",
    nameRu: "Регистрационный отдел СБДД Кашкадарьинской области",
    type: "traffic_police",
    lat: 38.8750,
    lng: 65.8150,
    address: "Qarshi shahri, Jayxun ko'chasi (Qarshi GAYI)",
    hours: "09:00 - 18:00",
    phone: "+998 (75) 225-10-02",
    buses: ["3"],
    services: ["Tex-pasport", "Davlat raqamlari"]
  },

  // --- SURXONDARYO (TERMIZ) ---
  {
    id: "termiz-notary-1",
    region: "surkhandarya",
    name: "Termiz shahar 1-son Davlat Notarial Idorasi",
    nameRu: "Термезская городская нотариальная контора №1",
    type: "notary",
    lat: 37.2250,
    lng: 67.2790,
    address: "Termiz shahri, At-Termiziy shoh ko'chasi 34-uy",
    hours: "09:00 - 18:00",
    phone: "+998 (76) 224-30-10",
    buses: ["5", "12"],
    services: ["Notarial xizmatlar"]
  },

  // --- XORAZM (URGANCH) ---
  {
    id: "urganch-notary-1",
    region: "khorezm",
    name: "Urganch shahar 1-son Davlat Notarial Idorasi",
    nameRu: "Ургенчская государственная нотариальная контора №1",
    type: "notary",
    lat: 41.5570,
    lng: 60.6320,
    address: "Urganch shahri, Al-Xorazmiy shoh ko'chasi 16-uy",
    hours: "09:00 - 18:00",
    phone: "+998 (62) 228-44-10",
    buses: ["1", "9"],
    services: ["Oldi-sotdi", "Ishonchnoma"]
  },
  {
    id: "urganch-yhxdx",
    region: "khorezm",
    name: "Xorazm viloyat YHXDX Ro'yxatdan o'tkazish bo'limi",
    nameRu: "Отдел регистрации СБДД Хорезмской области",
    type: "traffic_police",
    lat: 41.5720,
    lng: 60.6550,
    address: "Urganch shahri, Xonqa yo'li (GAYI)",
    hours: "09:00 - 18:00",
    phone: "+998 (62) 224-02-02",
    buses: ["1"],
    services: ["Tex-pasport berish"]
  },

  // --- QORAQALPOG'ISTON (NUKUS) ---
  {
    id: "nukus-notary-1",
    region: "karakalpakstan",
    name: "Nukus shahar 1-son Davlat Notarial Idorasi",
    nameRu: "Нукусская государственная нотариальная контора №1",
    type: "notary",
    lat: 42.4610,
    lng: 59.6170,
    address: "Nukus shahri, Qoraqalpog'iston ko'chasi 50-uy",
    hours: "09:00 - 18:00",
    phone: "+998 (61) 222-12-88",
    buses: ["6", "18"],
    services: ["Mulk va avto shartnomalari"]
  },

  // --- NAVOIY VILOYATI ---
  {
    id: "navoi-notary-1",
    region: "navoi",
    name: "Navoiy shahar 1-son Davlat Notarial Idorasi",
    nameRu: "Навоийская городская нотариальная контора №1",
    type: "notary",
    lat: 40.0850,
    lng: 65.3800,
    address: "Navoiy shahri, Xalqlar Do'stligi shoh ko'chasi 12-uy",
    hours: "09:00 - 18:00",
    phone: "+998 (79) 223-10-50",
    buses: ["2", "7"],
    services: ["Notarial xizmatlar"]
  },

  // --- JIZZAX VILOYATI ---
  {
    id: "jizzakh-notary-1",
    region: "jizzakh",
    name: "Jizzax shahar 1-son Davlat Notarial Idorasi",
    nameRu: "Джизакская государственная нотариальная контора №1",
    type: "notary",
    lat: 40.1165,
    lng: 67.8430,
    address: "Jizzax shahri, Sh.Rashidov shoh ko'chasi 45-uy",
    hours: "09:00 - 18:00",
    phone: "+998 (72) 226-11-22",
    buses: ["10", "4"],
    services: ["Notarial shartnomalar"]
  },

  // --- SIRDARYO (GULISTON) ---
  {
    id: "guliston-notary-1",
    region: "syrdarya",
    name: "Guliston shahar 1-son Davlat Notarial Idorasi",
    nameRu: "Гулистанская государственная нотариальная контора №1",
    type: "notary",
    lat: 40.4905,
    lng: 68.7850,
    address: "Guliston shahri, O'zbekiston ko'chasi 8-uy",
    hours: "09:00 - 18:00",
    phone: "+998 (67) 225-22-10",
    buses: ["3", "5"],
    services: ["Notariat xizmatlari"]
  },

  // --- TOSHKENT SHAHRI ---
  {
    id: "notary-1",
    region: "tashkent",
    name: "Toshkent shahar 1-son Davlat Notarial Idorasi",
    nameRu: "Ташкентская городская государственная нотариальная контора №1",
    type: "notary",
    lat: 41.3111,
    lng: 69.2797,
    address: "Toshkent shahri, Amir Temur shoh ko'chasi 24-uy (Amir Temur xiyoboni)",
    hours: "09:00 - 18:00 (Dushanba - Juma), 09:00 - 15:00 (Shanba)",
    phone: "+998 (71) 233-14-52",
    buses: ["58", "28", "67", "93"],
    services: [
      "Avtomobil oldi-sotdi shartnomasi",
      "Uy-joy va kvartira oldi-sotdisi",
      "Bosh ishonchnoma va boshqarish huquqi",
      "Meros va hadyanoma guvohnomalari"
    ]
  },
  {
    id: "yhxdx-fayzobod",
    region: "tashkent",
    name: "Toshkent shahar YHXDX Avto-mototransport ro'yxatga olish bo'limi (Fayzobod GAYI)",
    nameRu: "Регистрационно-экзаменационный отдел СБДД (Файзабад)",
    type: "traffic_police",
    lat: 41.2720,
    lng: 69.3190,
    address: "Toshkent shahri, Mirobod tumani, Fayzobod ko'chasi 1-berk (GAYI)",
    hours: "09:00 - 18:00 (Seshanba - Shanba)",
    phone: "+998 (71) 256-43-11",
    buses: ["28", "44"],
    services: [
      "Avtomobilga yangi tex-pasport berish",
      "Davlat raqam belgilarini rasmiylashtirish",
      "Texnik ko'rikdan o'tkazish",
      "Taqiq va jarimalarni yechish"
    ]
  },
  {
    id: "cadastre-tashkent",
    region: "tashkent",
    name: "Davlat Kadastrlari Palatasi Toshkent shahar boshqarmasi (Kadastr)",
    nameRu: "Палата государственных кадастров г. Ташкент",
    type: "cadastre",
    lat: 41.3320,
    lng: 69.3250,
    address: "Toshkent shahri, Mirzo Ulug'bek tumani, Mustaqillik shoh ko'chasi 105",
    hours: "09:00 - 18:00 (Dush-Juma)",
    phone: "+998 (71) 267-34-12",
    buses: ["115", "93"],
    services: [
      "Uy-joy kadastr pasportini tayyorlash",
      "Mulk huquqini davlat ro'yxatidan o'tkazish",
      "Yer uchastkalari chegaralarini belgilash"
    ]
  },
  {
    id: "dxm-center",
    region: "tashkent",
    name: "Toshkent shahar Markaziy Davlat Xizmatlari Markazi (DXM)",
    nameRu: "Центральный Центр Государственных Услуг (ЦГУ)",
    type: "dxm",
    lat: 41.3110,
    lng: 69.2415,
    address: "Toshkent shahri, Shayxontohur tumani, Furqat ko'chasi 1-A (Xalqlar Do'stligi)",
    hours: "09:00 - 18:00 (Dushanba - Juma)",
    phone: "+998 (71) 203-60-00 (Call-center: 1148)",
    buses: ["58", "115"],
    services: [
      "Kadastr pasporti va ro'yxatdan o'tkazish",
      "Elektron raqamli imzo (ERI)",
      "Doimiy va vaqtinchalik propiska",
      "Yuridik va jismoniy shaxslarni ro'yxatga olish"
    ]
  }
];

export const BUS_ROUTES: BusRoute[] = [
  // --- TASHKENT ROUTES ---
  {
    id: "58",
    region: "tashkent",
    name: "Avtobus №58 (Chorsu — DXM — Markaziy Notarius — Sergeli)",
    color: "#2563eb",
    interval: "6-8 daqiqa",
    stops: [
      { name: "Chorsu Bozori (Bosh bekat)", lat: 41.3275, lng: 69.2390 },
      { name: "Xalqlar Do'stligi (DXM Markazi)", lat: 41.3110, lng: 69.2415 },
      { name: "Oliy Majlis va Milliy Bog'", lat: 41.3090, lng: 69.2480 },
      { name: "Shota Rustaveli chorrahasi", lat: 41.2950, lng: 69.2620 },
      { name: "Amir Temur xiyoboni (1-Notarius)", lat: 41.3111, lng: 69.2797 },
      { name: "Yunusobod 12-mavze", lat: 41.3550, lng: 69.2880 }
    ]
  },
  {
    id: "28",
    region: "tashkent",
    name: "Avtobus №28 (Ibn Sino — Shota Rustaveli — Fayzobod YHXDX)",
    color: "#059669",
    interval: "7-10 daqiqa",
    stops: [
      { name: "Ibn Sino mavzesi", lat: 41.3390, lng: 69.1750 },
      { name: "Bunyodkor shoh ko'chasi", lat: 41.2850, lng: 69.2150 },
      { name: "Yakkasaroy DXM & Notariat", lat: 41.2830, lng: 69.2550 },
      { name: "Mirobod Tumani Markazi", lat: 41.2980, lng: 69.2720 },
      { name: "Fayzobod YHXDX (Avto ro'yxatga olish)", lat: 41.2720, lng: 69.3190 }
    ]
  },
  {
    id: "44",
    region: "tashkent",
    name: "Avtobus №44 (Shimoliy Vokzal — Fayzobod GAYI / Tex-ko'rik)",
    color: "#ea580c",
    interval: "8-12 daqiqa",
    stops: [
      { name: "Shimoliy Vokzal maydoni", lat: 41.2925, lng: 69.2850 },
      { name: "Sarakul ko'chasi", lat: 41.2860, lng: 69.2960 },
      { name: "Fayzobod massivi", lat: 41.2780, lng: 69.3050 },
      { name: "Fayzobod YHXDX (Avto-mototransport)", lat: 41.2720, lng: 69.3190 }
    ]
  },
  {
    id: "115",
    region: "tashkent",
    name: "Avtobus №115 (Chilonzor YHXDX — DXM — Mirzo Ulug'bek Kadastr)",
    color: "#8b5cf6",
    interval: "9-12 daqiqa",
    stops: [
      { name: "Chilonzor YHXDX bo'limi", lat: 41.2750, lng: 69.2050 },
      { name: "Novza (Davlat Xizmatlari Markazi)", lat: 41.2920, lng: 69.2280 },
      { name: "Markaziy DXM (Furqat ko'chasi)", lat: 41.3110, lng: 69.2415 },
      { name: "Navoiy shoh ko'chasi", lat: 41.3210, lng: 69.2540 },
      { name: "Mirzo Ulug'bek Kadastr boshqarmasi", lat: 41.3320, lng: 69.3250 }
    ]
  },

  // --- ANDIJON ROUTES ---
  {
    id: "12",
    region: "andijon",
    name: "Avtobus №12 (Andijon Vokzali — Bobur maydoni — 1-Notarius — Bog'ishamol YHXDX)",
    color: "#2563eb",
    interval: "5-7 daqiqa",
    stops: [
      { name: "Andijon Temiryo'l Vokzali", lat: 40.7850, lng: 72.3380 },
      { name: "Bobur xiyoboni (1-son Notarius)", lat: 40.7825, lng: 72.3450 },
      { name: "Eski shahar bozori", lat: 40.7760, lng: 72.3550 },
      { name: "Bog'ishamol YHXDX (GAYI)", lat: 40.7950, lng: 72.3780 }
    ]
  },
  {
    id: "33",
    region: "andijon",
    name: "Avtobus №33 (Yangi Bozor — DXM — Kadastr palatasi — Oltinko'l yo'li)",
    color: "#059669",
    interval: "6-8 daqiqa",
    stops: [
      { name: "Yangi Bozor majmuasi", lat: 40.7650, lng: 72.3300 },
      { name: "Andijon shahar DXM", lat: 40.7780, lng: 72.3390 },
      { name: "Viloyat Kadastr boshqarmasi", lat: 40.7710, lng: 72.3520 },
      { name: "Viloyat Kasalxonasi", lat: 40.7680, lng: 72.3650 }
    ]
  },

  // --- SAMARQAND ROUTES ---
  {
    id: "10",
    region: "samarkand",
    name: "Avtobus №10 (Vokzal — Registon — 1-son Notarius — Kadastr)",
    color: "#2563eb",
    interval: "6-9 daqiqa",
    stops: [
      { name: "Samarqand Vokzali", lat: 39.6750, lng: 66.9200 },
      { name: "Universitet xiyoboni", lat: 39.6600, lng: 66.9480 },
      { name: "Mirzo Ulug'bek (1-Notarius)", lat: 39.6550, lng: 66.9605 },
      { name: "Beruniy (Kadastr boshqarmasi)", lat: 39.6480, lng: 66.9420 }
    ]
  },
  {
    id: "22",
    region: "samarkand",
    name: "Avtobus №22 (Siyob bozori — Registon — Motarid YHXDX GAYI)",
    color: "#059669",
    interval: "7-10 daqiqa",
    stops: [
      { name: "Siyob bozori", lat: 39.6620, lng: 66.9750 },
      { name: "Registon maydoni", lat: 39.6545, lng: 66.9755 },
      { name: "Gagarin shoh ko'chasi", lat: 39.6680, lng: 66.9790 },
      { name: "Motarid YHXDX (GAYI)", lat: 39.6820, lng: 66.9850 }
    ]
  },

  // --- FARG'ONA ROUTES ---
  {
    id: "8",
    region: "fergana",
    name: "Avtobus №8 (Marg'ilon Vokzali — Al-Farg'oniy — 1-Notarius — Qirguli YHXDX)",
    color: "#2563eb",
    interval: "6-8 daqiqa",
    stops: [
      { name: "Marg'ilon temiryo'l vokzali", lat: 40.4500, lng: 71.7250 },
      { name: "Farg'ona Markaziy stadioni", lat: 40.4050, lng: 71.7700 },
      { name: "Al-Farg'oniy (1-son Notarius)", lat: 40.3870, lng: 71.7870 },
      { name: "Qirguli dahasi (Viloyat YHXDX)", lat: 40.3990, lng: 71.8120 }
    ]
  },
  {
    id: "15",
    region: "fergana",
    name: "Avtobus №15 (Farg'ona DXM — Sayilgoh — Sud binosi — Aeroport)",
    color: "#059669",
    interval: "7-9 daqiqa",
    stops: [
      { name: "Farg'ona shahar DXM", lat: 40.3850, lng: 71.7890 },
      { name: "Mustaqillik ko'chasi", lat: 40.3880, lng: 71.7840 },
      { name: "Fuqarolik sudi binosi", lat: 40.3890, lng: 71.7820 },
      { name: "Farg'ona xalqaro aeroporti", lat: 40.3620, lng: 71.7450 }
    ]
  },

  // --- NAMANGAN ROUTES ---
  {
    id: "5",
    region: "namangan",
    name: "Avtobus №5 (Chorsu bozori — Bobur bog'i — 1-Notarius — Kadastr)",
    color: "#2563eb",
    interval: "5-7 daqiqa",
    stops: [
      { name: "Namangan Chorsu bozori", lat: 41.0020, lng: 71.6620 },
      { name: "Bobur shoh ko'chasi (1-Notarius)", lat: 40.9980, lng: 71.6720 },
      { name: "Nodirabegim (Kadastr boshqarmasi)", lat: 40.9920, lng: 71.6680 },
      { name: "Namangan shahar DXM", lat: 40.9960, lng: 71.6740 }
    ]
  },
  {
    id: "18",
    region: "namangan",
    name: "Avtobus №18 (Temiryo'l Vokzali — Kosonsoy yo'li — Viloyat YHXDX)",
    color: "#ea580c",
    interval: "8-10 daqiqa",
    stops: [
      { name: "Namangan Vokzali", lat: 40.9850, lng: 71.6500 },
      { name: "Navoiy ko'chasi", lat: 40.9980, lng: 71.6650 },
      { name: "Kosonsoy shoh ko'chasi (YHXDX GAYI)", lat: 41.0150, lng: 71.6850 }
    ]
  },

  // --- BUXORO ROUTES ---
  {
    id: "7",
    region: "bukhara",
    name: "Avtobus №7 (Ark qal'asi — Labi Hovuz — 1-Notarius — Kadastr)",
    color: "#2563eb",
    interval: "6-8 daqiqa",
    stops: [
      { name: "Ark qo'rg'oni", lat: 39.7780, lng: 64.4110 },
      { name: "Labi Hovuz maydoni", lat: 39.7730, lng: 64.4200 },
      { name: "M.Iqbol ko'chasi (1-Notarius)", lat: 39.7740, lng: 64.4280 },
      { name: "Navoiy ko'chasi (Kadastr)", lat: 39.7680, lng: 64.4350 }
    ]
  },
  {
    id: "12",
    region: "bukhara",
    name: "Avtobus №12 (Karvon bozori — Gazli shossesi — Viloyat YHXDX)",
    color: "#059669",
    interval: "7-10 daqiqa",
    stops: [
      { name: "Karvon bozori", lat: 39.7620, lng: 64.4500 },
      { name: "Buxoro shahar DXM", lat: 39.7710, lng: 64.4250 },
      { name: "Gazli shossesi (YHXDX GAYI)", lat: 39.7910, lng: 64.4420 }
    ]
  }
];

export const COMMON_LEGAL_PROCEDURES = [
  {
    id: "car",
    title: "Avtomobil oldi-sotdisi",
    desc: "Notarial shartnoma, YHXDX (GAYI) da ro'yxatdan o'tkazish va davlat raqami olish tartibi",
    docsCount: 5,
    prompt: "Men mashinamni bir insonga sotayabman qayerga murojaat qilay va nima hujjat kerak?"
  },
  {
    id: "kadastr",
    title: "Kadastr pasporti va Yer",
    desc: "Kadastr yig'majildi, yer chegaralarini o'lchash va ko'chmas mulkni ro'yxatga qo'yish",
    docsCount: 4,
    prompt: "Kadastr pasportini qanday olaman va eng yaqin kadastr qayerda?"
  },
  {
    id: "house",
    title: "Uy-joy / Kvartira oldi-sotdisi",
    desc: "Kadastr tekshiruvi, oila a'zolarining roziligi, notarial tasdiqlash va mulk huquqi",
    docsCount: 6,
    prompt: "Uy yoki kvartira oldi-sotdisi uchun qanday hujjatlar kerak?"
  },
  {
    id: "power_of_attorney",
    title: "Ishonchnoma (Doverennost)",
    desc: "Avtomobil boshqarish, mulkni boshqarish va sud vakilligi ishonchnomasi",
    docsCount: 3,
    prompt: "Bosh ishonchnoma (Doverennost) berish tartibi qanday?"
  },
  {
    id: "inheritance",
    title: "Meros va hadyanoma (Darniy)",
    desc: "Vasiyatnoma, merosga kirishish 6 oylik muddati va yaqin qarindoshlarga hadya qilish",
    docsCount: 4,
    prompt: "Meros va hadyanoma qanday rasmiylashtiriladi?"
  }
];
