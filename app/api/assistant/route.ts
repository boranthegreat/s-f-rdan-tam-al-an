import { NextRequest, NextResponse } from "next/server";
import { trackedCurrencies } from "@/data/currencies";
import type { AssistantMessage, CoinMarket, CurrencyRate, GoldRate, WeatherForecast } from "@/types";

type MarketContext = {
  coins: CoinMarket[];
  rates: CurrencyRate[];
  gold: GoldRate | null;
  weather: WeatherForecast | null;
};

const casualSuggestions = [
  "Merhaba nasılsın?",
  "Adın ne?",
  "Instagram adresin ne?",
  "Hello, how are you?"
];

export async function POST(request: NextRequest) {
  try {
    const body = (await request.json()) as { messages?: AssistantMessage[] };
    const messages = (body.messages ?? []).slice(-8);
    const question = messages.at(-1)?.content?.trim() ?? "";

    if (!question) {
      return NextResponse.json({
        answer: "Ne aramamı istersin? Coin, döviz, altın veya hava durumu sorabilirsin.",
        mode: "local",
        suggestions: casualSuggestions
      });
    }

    const needsMarketData = shouldLoadMarketContext(question);
    const shouldLoadContext = Boolean(process.env.OPENAI_API_KEY) || needsMarketData;
    const context = shouldLoadContext ? await loadMarketContext(request.nextUrl.origin) : emptyMarketContext();
    const aiAnswer = await askOpenAi(messages, context);

    return NextResponse.json({
      answer: aiAnswer ?? (await buildLocalAnswer(question, context)),
      mode: aiAnswer ? "ai" : "local",
      suggestions: casualSuggestions
    });
  } catch {
    return NextResponse.json(
      {
        message: "Yapay zeka asistanı yanıtı oluşturulamadı."
      },
      { status: 500 }
    );
  }
}

async function loadMarketContext(origin: string): Promise<MarketContext> {
  const [coins, rates, gold, weather] = await Promise.all([
    safeFetch<CoinMarket[]>(`${origin}/api/coins`, []),
    safeFetch<CurrencyRate[]>(`${origin}/api/currency/rates?base=USD`, []),
    safeFetch<GoldRate | null>(`${origin}/api/gold`, null),
    safeFetch<WeatherForecast | null>(
      `${origin}/api/weather/forecast?id=745044&name=Istanbul&country=Turkey&latitude=41.0138&longitude=28.9497`,
      null
    )
  ]);

  return {
    coins,
    rates,
    gold,
    weather
  };
}

async function safeFetch<T>(url: string, fallback: T): Promise<T> {
  try {
    const response = await fetch(url, { cache: "no-store" });
    if (!response.ok) {
      return fallback;
    }
    return (await response.json()) as T;
  } catch {
    return fallback;
  }
}

async function askOpenAi(messages: AssistantMessage[], context: MarketContext): Promise<string | null> {
  const apiKey = process.env.OPENAI_API_KEY;
  if (!apiKey) {
    return null;
  }

  try {
    const response = await fetch("https://api.openai.com/v1/responses", {
      method: "POST",
      headers: {
        Authorization: `Bearer ${apiKey}`,
        "Content-Type": "application/json"
      },
      body: JSON.stringify({
        model: process.env.OPENAI_MODEL ?? "gpt-4o-mini",
        input: [
          {
            role: "system",
            content:
              "Sen BorAI adında, BoranTheGreat sitesinin çok dilli genel amaçlı yapay zeka asistanısın. Kullanıcının sorduğu soruya geçiştirmeden, doğrudan ve net cevap ver. Matematik, fizik, yazılım, tarih, genel kültür, günlük sohbet, planlama, metin yazma, çeviri, finans ve hava durumu dahil her konuda yardım et. Bilmediğin veya güncel doğrulama gerektiren yerde bunu dürüstçe söyle ve yine de uygulanabilir bir cevap ver. Instagram adresi sorulursa sadece boranthegreat olarak yanıtla. Finans sorularında verileri bağlamdan kullan ve yatırım tavsiyesi verme."
          },
          {
            role: "user",
            content: `Canlı site bağlamı:\n${JSON.stringify(summarizeContext(context), null, 2)}`
          },
          ...messages.map((message) => ({
            role: message.role,
            content: message.content
          }))
        ],
        max_output_tokens: 420
      })
    });

    if (!response.ok) {
      return null;
    }

    const data = (await response.json()) as OpenAiResponse;
    return extractOpenAiText(data);
  } catch {
    return null;
  }
}

type OpenAiResponse = {
  output_text?: string;
  output?: Array<{
    content?: Array<{
      text?: string;
      type?: string;
    }>;
  }>;
};

function extractOpenAiText(data: OpenAiResponse): string | null {
  if (data.output_text?.trim()) {
    return data.output_text.trim();
  }

  const text = data.output
    ?.flatMap((item) => item.content ?? [])
    .map((content) => content.text)
    .filter(Boolean)
    .join("\n")
    .trim();

  return text || null;
}

function summarizeContext(context: MarketContext) {
  return {
    coins: context.coins.map((coin) => ({
      symbol: coin.symbol.toUpperCase(),
      name: coin.name,
      priceUsd: coin.current_price,
      change24h: coin.price_change_percentage_24h,
      volume: coin.total_volume,
      marketCap: coin.market_cap
    })),
    currencies: context.rates.map((rate) => ({
      code: rate.code,
      name: rate.name,
      perUsd: rate.rate
    })),
    gold: context.gold,
    weather: context.weather
      ? {
          city: context.weather.city.name,
          country: context.weather.city.country,
          temperature: context.weather.current.temperature,
          windSpeed: context.weather.current.windSpeed,
          humidity: context.weather.current.humidity,
          precipitationProbability: context.weather.current.precipitationProbability
        }
      : null
  };
}

async function buildLocalAnswer(question: string, context: MarketContext): Promise<string> {
  const lower = question.toLocaleLowerCase("tr-TR");
  const casualAnswer = answerEverydayConversation(lower);
  if (casualAnswer) {
    return casualAnswer;
  }

  const coin = findCoin(lower, context.coins);
  const currency = findCurrency(lower, context.rates);
  const mathResult = trySolveMath(question);

  if (lower.includes("altin") || lower.includes("gold") || lower.includes("xau")) {
    if (!context.gold) {
      return "Altın verisi şu anda alınamadı. Biraz sonra tekrar deneyebilirsin.";
    }

    return `Gram altın yaklaşık ${formatTry(context.gold.gramTry)}, ons altın ${formatUsd(context.gold.ounceUsd)} seviyesinde. Kaynak: ${context.gold.source}. Bilgilendirme amaçlıdır, yatırım tavsiyesi değildir.`;
  }

  if (coin) {
    const direction = coin.price_change_percentage_24h >= 0 ? "artıda" : "ekside";
    return `${coin.name} (${coin.symbol.toUpperCase()}) şu anda ${formatUsd(coin.current_price)}. 24 saatlik değişim ${formatPercentValue(coin.price_change_percentage_24h)} ve ${direction}. Hacim ${formatFullNumber(coin.total_volume)}, piyasa değeri ${formatFullNumber(coin.market_cap)}.`;
  }

  if (currency) {
    return `USD bazında ${currency.code} kuru ${formatPlain(currency.rate)} seviyesinde. Takip edilen dövizler: ${trackedCurrencies.map((item) => item.code).join(", ")}.`;
  }

  if (mathResult) {
    return mathResult;
  }

  const physicsAnswer = answerPhysics(lower);
  if (physicsAnswer) {
    return physicsAnswer;
  }

  const programmingAnswer = answerProgramming(lower, question);
  if (programmingAnswer) {
    return programmingAnswer;
  }

  const practicalAnswer = answerPracticalRequest(lower, question);
  if (practicalAnswer) {
    return practicalAnswer;
  }

  const learningAnswer = answerLearning(lower, question);
  if (learningAnswer) {
    return learningAnswer;
  }

  const generalAnswer = answerGeneralQuestion(lower, question);
  if (generalAnswer) {
    return generalAnswer;
  }

  const liveKnowledgeAnswer = await answerFromWikipedia(question, lower);
  if (liveKnowledgeAnswer) {
    return liveKnowledgeAnswer;
  }

  if (lower.includes("hava") || lower.includes("sicak") || lower.includes("istanbul")) {
    if (!context.weather) {
      return "Hava durumu verisi şu anda alınamadı. Şehir arama ekranından tekrar deneyebilirsin.";
    }

    return `${context.weather.city.name} için hava ${Math.round(context.weather.current.temperature)}°C. Nem %${context.weather.current.humidity}, rüzgar ${Math.round(context.weather.current.windSpeed)} km/s, yağış ihtimali %${context.weather.current.precipitationProbability}.`;
  }

  const topCoins = context.coins
    .slice(0, 3)
    .map((item) => `${item.symbol.toUpperCase()} ${formatUsd(item.current_price)} (${formatPercentValue(item.price_change_percentage_24h)})`)
    .join(", ");
  const goldText = context.gold ? ` Gram altın ${formatTry(context.gold.gramTry)}.` : "";

  return buildHelpfulFallback(question, topCoins, goldText);
}

function answerEverydayConversation(lower: string): string | null {
  const instagramHandle = "boranthegreat";
  const normalized = lower
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .replace(/[¿?!.،،]/g, "")
    .trim();

  const language =
    /merhaba|selam|nasilsin|naber|adin|adresi|adresin|tesekkur|sagol|gorusuruz/.test(normalized)
      ? "tr"
      : /hola|buenos|gracias|como estas|quien eres/.test(normalized)
      ? "es"
      : /bonjour|salut|merci|comment ca va|qui es tu/.test(normalized)
        ? "fr"
        : /hallo|guten|danke|wie geht|wer bist/.test(normalized)
          ? "de"
          : /привет|здравствуй|как дела|кто ты|инстаграм/.test(lower)
            ? "ru"
            : /مرحبا|اهلا|كيف حالك|ما اسمك|انستغرام/.test(lower)
              ? "ar"
              : /hello|hi|hey|how are you|what is your name|who are you/.test(normalized)
                ? "en"
                : "tr";

  const asksInstagram =
    normalized.includes("instagram") ||
    normalized.includes("insta") ||
    lower.includes("instagram") ||
    lower.includes("انستغرام") ||
    lower.includes("инстаграм");

  if (asksInstagram) {
    return {
      tr: `Instagram adresi: ${instagramHandle}`,
      en: `Instagram address: ${instagramHandle}`,
      es: `Instagram: ${instagramHandle}`,
      fr: `Instagram : ${instagramHandle}`,
      de: `Instagram: ${instagramHandle}`,
      ru: `Instagram: ${instagramHandle}`,
      ar: `Instagram: ${instagramHandle}`
    }[language];
  }

  const asksName =
    normalized.includes("adin ne") ||
    normalized.includes("adın ne") ||
    normalized.includes("ismin ne") ||
    normalized.includes("kimsin") ||
    normalized.includes("what is your name") ||
    normalized.includes("your name") ||
    normalized.includes("who are you") ||
    normalized.includes("quien eres") ||
    normalized.includes("como te llamas") ||
    normalized.includes("qui es tu") ||
    normalized.includes("comment tu tappelles") ||
    normalized.includes("wer bist") ||
    normalized.includes("wie heisst") ||
    lower.includes("как тебя зовут") ||
    lower.includes("кто ты") ||
    lower.includes("ما اسمك");

  if (asksName) {
    return {
      tr: "Ben BorAI. Finans, hava durumu, günlük sohbet, matematik, yazılım ve genel konularda yardımcı olabilirim.",
      en: "I am BorAI. I can help with daily chat, finance, weather, math, coding, and general questions.",
      es: "Soy BorAI. Puedo ayudar con conversación diaria, finanzas, clima, matemáticas, programación y preguntas generales.",
      fr: "Je suis BorAI. Je peux aider pour les conversations quotidiennes, la finance, la météo, les maths, le code et les questions générales.",
      de: "Ich bin BorAI. Ich helfe bei Alltagssprache, Finanzen, Wetter, Mathe, Programmierung und allgemeinen Fragen.",
      ru: "Я BorAI. Могу помочь с обычным общением, финансами, погодой, математикой, кодом и общими вопросами.",
      ar: "أنا BorAI. أستطيع المساعدة في المحادثة اليومية والمال والطقس والرياضيات والبرمجة والأسئلة العامة."
    }[language];
  }

  const greets =
    /\b(merhaba|selam|sa|slm|günaydın|gunaydin|iyi aksamlar|iyi akşamlar|hello|hi|hey|hola|bonjour|salut|hallo|привет|здравствуй)\b/.test(
      normalized
    ) ||
    /مرحبا|اهلا|أهلا/.test(lower);
  const asksHow =
    normalized.includes("nasilsin") ||
    normalized.includes("nasılsın") ||
    normalized.includes("naber") ||
    normalized.includes("how are you") ||
    normalized.includes("como estas") ||
    normalized.includes("comment ca va") ||
    normalized.includes("wie geht") ||
    lower.includes("как дела") ||
    lower.includes("كيف حالك");

  if (greets || asksHow) {
    return {
      tr: "Merhaba, iyiyim ve hazırım. Sen nasılsın? İstersen sohbet edebiliriz, istersen coin, döviz, altın, hava durumu veya herhangi bir konuda yardımcı olayım.",
      en: "Hello, I am doing well and ready to help. How are you? We can chat, or I can help with markets, weather, coding, math, or anything else.",
      es: "Hola, estoy bien y listo para ayudar. ¿Tú cómo estás? Podemos conversar o puedo ayudarte con mercados, clima, código, matemáticas o cualquier tema.",
      fr: "Bonjour, je vais bien et je suis prêt à aider. Et toi ? On peut discuter, ou je peux t'aider avec les marchés, la météo, le code, les maths ou autre chose.",
      de: "Hallo, mir geht es gut und ich bin bereit zu helfen. Wie geht es dir? Wir können chatten, oder ich helfe mit Märkten, Wetter, Code, Mathe oder anderen Themen.",
      ru: "Привет, у меня всё хорошо, я готов помочь. Как ты? Можем просто поговорить или обсудить рынки, погоду, код, математику и любые другие темы.",
      ar: "مرحباً، أنا بخير وجاهز للمساعدة. كيف حالك؟ يمكننا الدردشة أو أساعدك في الأسواق والطقس والبرمجة والرياضيات أو أي موضوع آخر."
    }[language];
  }

  const thanks =
    /\b(tesekkur|teşekkür|sagol|sağol|thanks|thank you|gracias|merci|danke)\b/.test(normalized) ||
    /شكرا|спасибо/.test(lower);

  if (thanks) {
    return {
      tr: "Rica ederim, her zaman. Başka bir şey sormak istersen buradayım.",
      en: "You are welcome. I am here if you want to ask anything else.",
      es: "De nada. Estoy aquí si quieres preguntar algo más.",
      fr: "Avec plaisir. Je suis là si tu veux demander autre chose.",
      de: "Gern geschehen. Ich bin da, wenn du noch etwas fragen möchtest.",
      ru: "Пожалуйста. Я здесь, если хочешь спросить что-то ещё.",
      ar: "على الرحب والسعة. أنا هنا إذا أردت أن تسأل عن أي شيء آخر."
    }[language];
  }

  const goodbye =
    /\b(gorusuruz|görüşürüz|bye|goodbye|adios|au revoir|tschuss|tschüss)\b/.test(normalized) ||
    /مع السلامة|пока/.test(lower);

  if (goodbye) {
    return {
      tr: "Görüşürüz. Ne zaman istersen tekrar yazabilirsin.",
      en: "Goodbye. You can come back anytime.",
      es: "Adiós. Puedes volver cuando quieras.",
      fr: "Au revoir. Tu peux revenir quand tu veux.",
      de: "Tschüss. Du kannst jederzeit wiederkommen.",
      ru: "Пока. Возвращайся в любое время.",
      ar: "إلى اللقاء. يمكنك العودة في أي وقت."
    }[language];
  }

  return null;
}

function emptyMarketContext(): MarketContext {
  return {
    coins: [],
    rates: [],
    gold: null,
    weather: null
  };
}

function shouldLoadMarketContext(question: string) {
  const lower = question.toLocaleLowerCase("tr-TR");
  return [
    "btc",
    "eth",
    "sol",
    "bnb",
    "xrp",
    "trx",
    "coin",
    "kripto",
    "dolar",
    "euro",
    "usd",
    "eur",
    "gbp",
    "try",
    "altin",
    "gold",
    "hava",
    "sicak",
    "weather",
    "yagis",
    "ruzgar"
  ].some((keyword) => lower.includes(keyword));
}

function answerProgramming(lower: string, originalQuestion: string): string | null {
  if (lower.includes("kod yaz") || lower.includes("ornek kod") || lower.includes("component") || lower.includes("fonksiyon")) {
    return `Kod yazarken en saglam yol sudur: once girdileri ve ciktilari belirle, sonra kucuk bir fonksiyon veya component olustur, ardindan hata durumlarini test et. Sordugun konu: "${originalQuestion}". Hangi dil veya framework istedigini yazarsan direkt ornek kod da uretebilirim.`;
  }

  if (lower.includes("bug") || lower.includes("hata") || lower.includes("calismiyor") || lower.includes("çalışmıyor")) {
    return "Hata cozmek icin su sirayla ilerle: 1. Konsoldaki tam hata mesajini oku, 2. Hatanin dosya ve satirini bul, 3. Son yaptigin degisikligi kontrol et, 4. Hatayi kucuk bir ornekte tekrar uret, 5. Tek bir degisiklik yapip yeniden dene. Hata mesajini paylasirsan daha net cozerim.";
  }

  if (lower.includes("algoritma")) {
    return "Algoritma, bir problemi cozmek icin izlenen adimlar dizisidir. Iyi algoritma net girdiler alir, beklenen ciktiyi uretir, gereksiz tekrar yapmaz ve okunabilir olur. Ornek: listedeki en buyuk sayiyi bulmak icin ilk sayiyi en buyuk kabul eder, sonra tum listeyi tek tek karsilastirirsin.";
  }

  if (lower.includes("frontend")) {
    return "Frontend, kullanicinin gordugu ve etkilesime girdigi arayuz katmanidir. HTML icerigi, CSS tasarimi, JavaScript/TypeScript etkilesimi yonetir. Modern frontend'de React, Next.js, Vue veya Svelte gibi araclar kullanilir.";
  }

  if (lower.includes("backend")) {
    return "Backend, verileri isleyen, API saglayan, veritabaniyla konusan ve is kurallarini calistiran sunucu tarafidir. Node.js, Python, Go, Java veya .NET ile yazilabilir. Guvenlik, performans ve veri dogrulama backend'in ana sorumluluklarindandir.";
  }

  return null;
}

function answerPracticalRequest(lower: string, originalQuestion: string): string | null {
  if (lower.includes("mail yaz") || lower.includes("e-posta yaz") || lower.includes("email yaz")) {
    return `Konu: Kisa ve net bilgilendirme\n\nMerhaba,\n\n${cleanTopic(originalQuestion)} hakkinda sizinle iletisime gecmek istiyorum. Konuyu netlestirmek ve uygun bir sonraki adimi belirlemek icin musait oldugunuzda geri donus yapabilir misiniz?\n\nTesekkur ederim.\n\nSaygilar.`;
  }

  if (lower.includes("mesaj yaz") || lower.includes("dm yaz") || lower.includes("whatsapp")) {
    return `Kisa mesaj onerisi: "Merhaba, ${cleanTopic(originalQuestion)} konusunda sana ulasmak istedim. Musait oldugunda kisaca konusabilir miyiz?"`;
  }

  if (lower.includes("acikla") || lower.includes("açıkla") || lower.includes("anlat")) {
    const topic = cleanTopic(originalQuestion);
    return `${topic} konusunu net anlatalim: once temel tanimi bilmek gerekir, sonra nerede kullanildigina bakilir, en son da basit bir ornekle pekistirilir. Kisa cevap: ${topic}, baglama gore anlam kazanan bir konudur; iyi anlamak icin "ne ise yarar, hangi parcalardan olusur, gercek hayatta nerede gorulur" sorularini sormak en dogru yoldur.`;
  }

  if (lower.includes("karsilastir") || lower.includes("karşılaştır") || lower.includes("farki ne") || lower.includes("farkı ne")) {
    return `Karsilastirma yaparken en net yontem: 1. Amaclarini ayir, 2. Avantajlarini yaz, 3. Zayif noktalarini yaz, 4. Hangi durumda hangisinin daha iyi oldugunu belirt. Sordugun konu "${originalQuestion}". Genel kural: daha basit, daha ucuz ve ihtiyaci karsilayan secenek kisa vadede; daha olceklenebilir ve guvenilir secenek uzun vadede daha mantiklidir.`;
  }

  if (lower.includes("kompozisyon") || lower.includes("paragraf yaz") || lower.includes("yazi yaz") || lower.includes("yazı yaz")) {
    const topic = cleanTopic(originalQuestion);
    return `${topic}\n\nBu konu gunumuzde onemli cunku insanlarin dusunme, karar verme ve uretme bicimini dogrudan etkiler. Basarili olmak icin once temel bilgiyi anlamak, sonra bu bilgiyi gercek hayattaki orneklerle birlestirmek gerekir. Sonuc olarak ${topic}, sadece teorik bir baslik degil, dogru kullanildiginda pratik fayda saglayan bir alandir.`;
  }

  if (lower.includes("ingilizceye cevir") || lower.includes("ingilizceye çevir")) {
    const text = originalQuestion.replace(/.*(?:ingilizceye cevir|ingilizceye çevir)[:\s]*/i, "").trim();
    return text ? `English: ${simpleTranslateToEnglish(text)}` : "Cevirecegim metni de yazarsan dogrudan Ingilizce karsiligini verebilirim.";
  }

  if (lower.includes("turkceye cevir") || lower.includes("türkçeye çevir")) {
    const text = originalQuestion.replace(/.*(?:turkceye cevir|türkçeye çevir)[:\s]*/i, "").trim();
    return text ? `Turkce: ${simpleTranslateToTurkish(text)}` : "Cevirecegim metni de yazarsan dogrudan Turkce karsiligini verebilirim.";
  }

  if (lower.includes("listele") || lower.includes("madde madde")) {
    const topic = cleanTopic(originalQuestion);
    return `${topic} icin kisa liste:\n1. Ana hedefi belirle.\n2. En onemli 3 parcayi sec.\n3. Gereksiz detaylari ele.\n4. Ilk uygulanabilir adimi at.\n5. Sonucu kontrol edip iyilestir.`;
  }

  return null;
}

function answerLearning(lower: string, originalQuestion: string): string | null {
  if (lower.includes("nasil ogren") || lower.includes("nasıl öğren") || lower.includes("ogrenmek") || lower.includes("öğrenmek")) {
    return `Ogrenmek icin en iyi yol: 1. Temel kavramlari oku, 2. Kucuk bir uygulama yap, 3. Hata alinca nedenini arastir, 4. Not tut, 5. Her gun kisa tekrar yap. "${originalQuestion}" icin 7 gunluk mini plan: temel kavram, basit ornek, pratik, hata cozumleri, kucuk proje, tekrar, kendi anlatiminla ozet.`;
  }

  if (lower.includes("plan") || lower.includes("program hazirla") || lower.includes("program hazırla")) {
    return `Basit plan: Bugun hedefi netlestir, yarin ilk calisan surumu yap, sonraki gun eksikleri listele, dorduncu gun tasarim ve kaliteyi toparla, besinci gun test et ve yayinlamaya hazirla. Sordugun konu "${originalQuestion}" oldugu icin once kucuk basla, sonra detay ekle.`;
  }

  if (lower.includes("ozetle") || lower.includes("özetle")) {
    return "Ozetleme icin metni ana fikir, destekleyici noktalar ve sonuc diye ayir. Bana ozetlememi istedigin metni gonderirsen kisa, orta veya maddeli ozet haline getirebilirim.";
  }

  if (lower.includes("cevir") || lower.includes("çevir") || lower.includes("translate")) {
    return "Ceviri yapabilirim. Bana metni ve hedef dili yaz: ornegin 'Bunu Ingilizceye cevir: ...'. Kisa, dogal veya resmi ton secenegiyle cevirebilirim.";
  }

  return null;
}

function answerGeneralQuestion(lower: string, originalQuestion: string): string | null {
  const facts = [
    {
      keys: ["yapay zeka", "artificial intelligence"],
      answer:
        "Yapay zeka, bilgisayarlarin veri kullanarak ogrenme, tahmin yapma, metin uretme, gorsel tanima veya karar destekleme gibi insan benzeri isleri yapmasini saglayan teknolojiler butunudur. En yaygin alanlari makine ogrenmesi, derin ogrenme ve dogal dil islemedir."
    },
    {
      keys: ["makine ogrenmesi", "machine learning"],
      answer:
        "Makine ogrenmesi, bilgisayarin acikca tek tek programlanmadan verilerden oruntu ogrenmesidir. Ornek olarak fiyat tahmini, spam filtreleme, oneriler ve goruntu tanima verilebilir."
    },
    {
      keys: ["html"],
      answer:
        "HTML web sayfasinin iskeletidir. Baslik, paragraf, link, resim, form gibi icerik yapilarini tanimlar. CSS gorunumu, JavaScript ise etkilesimi ekler."
    },
    {
      keys: ["css"],
      answer:
        "CSS web sayfasinin tasarimini belirler. Renk, bosluk, yazi tipi, grid, animasyon ve responsive davranislar CSS ile ayarlanir."
    },
    {
      keys: ["javascript", "js"],
      answer:
        "JavaScript web sayfalarina etkilesim katan programlama dilidir. Buton tiklamalari, API istekleri, formlar, animasyonlar ve modern frontend uygulamalari genellikle JavaScript veya TypeScript ile yazilir."
    },
    {
      keys: ["typescript", "ts"],
      answer:
        "TypeScript, JavaScript'in tip guvenligi eklenmis halidir. Kod yazarken hatalari daha erken yakalamaya, buyuk projelerde daha duzenli calismaya yardim eder."
    },
    {
      keys: ["next.js", "nextjs", "next js"],
      answer:
        "Next.js React tabanli bir web framework'udur. App Router, server component, API route, SEO, dosya bazli routing ve deploy kolayligi gibi ozellikler sunar."
    },
    {
      keys: ["react"],
      answer:
        "React, arayuzleri component mantigiyla olusturmaya yarayan JavaScript kutuphanesidir. Sayfadaki parcalari tekrar kullanilabilir componentlere bolerek uygulama gelistirmeyi kolaylastirir."
    },
    {
      keys: ["evrim"],
      answer:
        "Evrim, canli topluluklarinin nesiller boyunca genetik ozelliklerinin degismesi surecidir. Dogal secilim, mutasyon, genetik suruklenme ve gen akisi bu surecte rol oynar."
    },
    {
      keys: ["fotosentez"],
      answer:
        "Fotosentez, bitkilerin ve bazi mikroorganizmalarin isik enerjisini kullanarak karbondioksit ve sudan glikoz uretmesi surecidir. Yan urun olarak oksijen aciga cikar."
    },
    {
      keys: ["atom"],
      answer:
        "Atom, maddenin kimyasal ozelliklerini tasiyan temel birimidir. Cekirdekte proton ve neutron, cevrede elektronlar bulunur."
    },
    {
      keys: ["kuantum", "dolaniklik", "dolanıklık"],
      answer:
        "Kuantum dolaniklik, iki veya daha fazla parcacigin durumlarinin birbirine bagli hale gelmesidir. Parcaciklar uzak mesafede olsa bile birinin olcumu digeri hakkinda bilgi verir. Bu, klasik fizikteki gunluk sezgilerimize ters gelir ve kuantum bilgisayarlar ile kuantum iletisim gibi alanlarin temel fikirlerinden biridir."
    },
    {
      keys: ["dunya", "dünya"],
      answer:
        "Dunya, Gunes Sistemi'nde yasam oldugu bilinen tek gezegendir. Gunes'e uzaklik bakimindan ucuncu siradadir ve atmosferi, su dongusu, manyetik alani yasam icin kritik oneme sahiptir."
    },
    {
      keys: ["osmanli", "osmanlı"],
      answer:
        "Osmanli Devleti, 1299 civarinda kurulan ve 1922'ye kadar varligini surduren cok uluslu bir imparatorluktu. Anadolu, Balkanlar, Orta Dogu ve Kuzey Afrika'da uzun sure etkili oldu."
    },
    {
      keys: ["turkiye", "türkiye"],
      answer:
        "Turkiye, Avrupa ile Asya arasinda yer alan, baskenti Ankara olan bir cumhuriyettir. Jeopolitik konumu, tarihi mirasi ve cesitli iklimleriyle one cikar."
    },
    {
      keys: ["einstein", "albert einstein"],
      answer:
        "Albert Einstein, 1879-1955 yillari arasinda yasamis Alman dogumlu teorik fizikcidir. Ozel ve genel gorelilik teorileriyle modern fizigin en onemli isimlerinden biri oldu. E = mc2 denklemiyle kutle ve enerji arasindaki iliskiyi acikladi; 1921 Nobel Fizik Odulu'nu fotoelektrik etki aciklamasi sayesinde kazandi."
    },
    {
      keys: ["ataturk", "atatürk", "mustafa kemal"],
      answer:
        "Mustafa Kemal Ataturk, Turkiye Cumhuriyeti'nin kurucusu ve ilk cumhurbaskanidir. 1881'de Selanik'te dogdu, Kurtulus Savasi'na liderlik etti ve 1923'te Cumhuriyet'in ilaninda merkezi rol oynadi. Egitim, hukuk, ekonomi ve toplumsal yasamda cok sayida reform yapti."
    },
    {
      keys: ["nikola tesla", "tesla kimdir"],
      answer:
        "Nikola Tesla, alternatif akim sistemleri, elektrik motorlari ve kablosuz enerji fikirleriyle taninan mucit ve elektrik muhendisidir. Modern elektrik dagitim sistemlerinin gelisiminde cok buyuk etkisi vardir."
    },
    {
      keys: ["python nedir", "python"],
      answer:
        "Python, okunabilir soz dizimiyle taninan genel amacli bir programlama dilidir. Web gelistirme, veri analizi, yapay zeka, otomasyon ve bilimsel hesaplama gibi alanlarda yaygin kullanilir."
    }
  ];

  const matched = facts.find((fact) => fact.keys.some((key) => lower.includes(key)));
  if (matched) {
    return matched.answer;
  }

  const extraFacts = [
    {
      keys: ["iklim degisikligi", "iklim değişikliği", "global warming", "kuresel isinma", "küresel ısınma"],
      answer:
        "Iklim degisikligi, atmosferdeki sera gazlarinin artmasi nedeniyle sicaklik, yagis, deniz seviyesi ve ekstrem hava olaylarinda uzun vadeli degisimler olmasidir. Baslica nedenler fosil yakit kullanimi, ormansizlasma ve sanayi kaynakli emisyonlardir. Cozum icin temiz enerji, verimlilik ve dogal alanlari koruma onemlidir."
    },
    {
      keys: ["blokzincir", "blockchain"],
      answer:
        "Blockchain, islemlerin bloklar halinde kaydedildigi ve bu bloklarin kriptografik olarak birbirine baglandigi dagitik kayit sistemidir. Tek bir merkeze bagli olmadan kayitlarin dogrulanabilmesi en onemli avantajidir."
    },
    {
      keys: ["veritabani", "database", "sql"],
      answer:
        "Veritabani, verileri duzenli sekilde saklamak ve sorgulamak icin kullanilir. SQL sistemleri tablo ve iliski mantigiyla calisir; NoSQL sistemler belge, anahtar-deger veya grafik gibi daha esnek veri modelleri sunar."
    },
    {
      keys: ["api"],
      answer:
        "API, iki yazilim sisteminin birbiriyle konusmasini saglayan arayuzdur. Frontend API'ye istek atar, backend veri isler ve genellikle JSON cevabi dondurur."
    },
    {
      keys: ["seo"],
      answer:
        "SEO, bir sitenin arama motorlarinda daha iyi gorunmesi icin yapilan iyilestirmelerdir. Basliklar, hiz, mobil uyum, kaliteli icerik, meta aciklamalar ve temiz URL yapisi temel parcalardir."
    },
    {
      keys: ["enflasyon"],
      answer:
        "Enflasyon, mal ve hizmetlerin genel fiyat seviyesinin zamanla artmasidir. Paranin satin alma gucu azalir. Talep artisi, uretim maliyetleri, kur hareketleri ve para arzi enflasyonu etkileyebilir."
    },
    {
      keys: ["faiz"],
      answer:
        "Faiz, paranin zaman degerini ifade eder. Borc alan taraf odedigi ek bedeli faiz olarak verir. Merkez bankasi faizleri ekonomi uzerinde talep, kredi, kur ve enflasyon beklentilerini etkilemek icin kullanabilir."
    },
    {
      keys: ["protein", "karbonhidrat", "beslenme"],
      answer:
        "Beslenmede protein kas ve doku onarimi icin, karbonhidrat enerji icin, yaglar hormon ve hucre sagligi icin onemlidir. Saglik durumuna gore uzman gorusu almak en dogrusudur."
    }
  ];

  const extraMatched = extraFacts.find((fact) => fact.keys.some((key) => lower.includes(key)));
  if (extraMatched) {
    return extraMatched.answer;
  }

  const capitalAnswer = answerCapitalQuestion(lower);
  if (capitalAnswer) {
    return capitalAnswer;
  }

  if (lower.includes("kod") || lower.includes("program") || lower.includes("hata")) {
    return `Bunu yazilim problemi gibi dusunursek once hedefi netlestir, sonra hatayi kucuk parcalara bol: girdi ne, beklenen cikti ne, gercek cikti ne? Bana kodu veya hata mesajini yazarsan adim adim cozerim. Sordugun sey: "${originalQuestion}"`;
  }

  if (lower.includes("fikir") || lower.includes("oner") || lower.includes("öner") || lower.includes("tavsiye")) {
    return "Fikir: Kisisel bir hedef takip uygulamasi yapabilirsin. Kullanici gunluk hedefini girer, ilerleme yuzdesini gorur, seri yakaladiginda rozet kazanir ve haftalik grafikle performansini izler. Bunu finans sitene de baglayabilirsin: kullanici butce hedefi, birikim hedefi ve piyasa watchlist'ini ayni panelde takip eder.";
  }

  if (lower.includes("nasil") || lower.includes("nasıl")) {
    if (lower.includes("web") || lower.includes("site")) {
      return "Bir web sitesi yapmak icin: 1. Amaci belirle, 2. Sayfa yapisini ciz, 3. Next.js veya benzeri bir framework kur, 4. Componentleri ve tasarimi yaz, 5. API veya verileri bagla, 6. Mobil uyumlulugu test et, 7. Vercel gibi bir platforma deploy et. Basit baslamak icin tek sayfalik bir ana ekran, sonra navbar ve alt sayfalar eklemek en rahat yoldur.";
    }

    return `Bunu yapmak icin pratik yol: once hedefi netlestir, sonra isi 3-5 kucuk adima bol, ilk calisan surumu yap, test et ve iyilestir. Sordugun konu "${originalQuestion}". En iyi sonuc icin once temel mantigi kur, sonra detay ve gorunum ekle.`;
  }

  if (lower.includes("nedir") || lower.includes("ne demek")) {
    const topic = cleanTopic(originalQuestion);
    return `${topic} hakkinda kisaca: Bu kavrami anlamak icin once hangi alanda kullanildigina bakmak gerekir. Genel olarak bir kavramin tanimi, ne ise yaradigi, nerede kullanildigi ve basit bir ornekle aciklanmasi en saglam yoldur. Istersen "${topic}" konusunu daha detayli anlatabilirim.`;
  }

  return null;
}

function answerCapitalQuestion(lower: string): string | null {
  if (!lower.includes("baskenti") && !lower.includes("başkenti") && !lower.includes("capital")) {
    return null;
  }

  const capitals: Array<{ keys: string[]; country: string; capital: string }> = [
    { keys: ["turkiye", "türkiye", "turkey"], country: "Turkiye", capital: "Ankara" },
    { keys: ["fransa", "france"], country: "Fransa", capital: "Paris" },
    { keys: ["almanya", "germany"], country: "Almanya", capital: "Berlin" },
    { keys: ["italya", "italy"], country: "Italya", capital: "Roma" },
    { keys: ["ispanya", "spain"], country: "Ispanya", capital: "Madrid" },
    { keys: ["ingiltere", "birlesik krallik", "united kingdom", "uk"], country: "Birlesik Krallik", capital: "Londra" },
    { keys: ["amerika", "abd", "usa", "united states"], country: "ABD", capital: "Washington, DC" },
    { keys: ["japonya", "japan"], country: "Japonya", capital: "Tokyo" },
    { keys: ["cin", "çin", "china"], country: "Cin", capital: "Pekin" },
    { keys: ["rusya", "russia"], country: "Rusya", capital: "Moskova" }
  ];

  const matched = capitals.find((item) => item.keys.some((key) => lower.includes(key)));
  return matched ? `${matched.country} baskenti ${matched.capital}.` : null;
}

type WikiSearchResponse = [string, string[], string[], string[]];

type WikiSummaryResponse = {
  title?: string;
  extract?: string;
  description?: string;
  content_urls?: {
    desktop?: {
      page?: string;
    };
  };
};

async function answerFromWikipedia(question: string, lower: string): Promise<string | null> {
  if (isPersonalOrActionOnlyQuestion(lower)) {
    return null;
  }

  const topic = extractKnowledgeTopic(question);
  if (!topic || topic.length < 2) {
    return null;
  }

  const language = "tr";
  const searchUrl = `https://${language}.wikipedia.org/w/api.php?action=opensearch&namespace=0&limit=1&format=json&search=${encodeURIComponent(topic)}`;
  const searchData = await fetchWithTimeout<WikiSearchResponse>(searchUrl, 2500);
  const title = searchData?.[1]?.[0] ?? topic;

  if (!title) {
    return null;
  }

  const summaryUrl = `https://${language}.wikipedia.org/api/rest_v1/page/summary/${encodeURIComponent(title)}`;
  const summary = await fetchWithTimeout<WikiSummaryResponse>(summaryUrl, 2500);
  const extract = summary?.extract?.trim();

  if (!extract || extract.length < 40) {
    return null;
  }

  const shortExtract = extract.length > 700 ? `${extract.slice(0, 700).trim()}...` : extract;
  const source = summary?.content_urls?.desktop?.page ? `\nKaynak: ${summary.content_urls.desktop.page}` : "";
  return `${summary?.title ?? title}: ${shortExtract}${source}`;
}

async function fetchWithTimeout<T>(url: string, timeoutMs: number): Promise<T | null> {
  const controller = new AbortController();
  const timeout = windowlessSetTimeout(() => controller.abort(), timeoutMs);

  try {
    const response = await fetch(url, {
      headers: {
        accept: "application/json"
      },
      signal: controller.signal,
      cache: "force-cache",
      next: { revalidate: 86400 }
    });

    if (!response.ok) {
      return null;
    }

    return (await response.json()) as T;
  } catch {
    return null;
  } finally {
    clearTimeout(timeout);
  }
}

function windowlessSetTimeout(callback: () => void, timeoutMs: number) {
  return setTimeout(callback, timeoutMs);
}

function buildHelpfulFallback(question: string, topCoins: string, goldText: string) {
  const topic = cleanTopic(question);
  const marketText = topCoins ? `\n\nPiyasa ozeti: ${topCoins}.${goldText}` : goldText ? `\n\n${goldText.trim()}` : "";

  if (question.toLocaleLowerCase("tr-TR").includes("kimdir")) {
    return `${topic} sorusu bir kisi hakkinda bilgi istiyor. Su an elimde bu kisi icin dogrulanmis yerel bilgi yoksa isim, tarih veya olay uydurmam dogru olmaz. Net ilerlemek icin BorAI bu tip sorularda once canli bilgi kaynagina bakar; kaynak erisimi yoksa en guvenli cevap sudur: kisinin kim oldugunu, hangi alanda tanindigini, en onemli eserlerini/olaylarini ve tarihlerini dogrulanmis kaynaktan kontrol etmek gerekir. Sinirsiz genel bilgi cevabi icin OPENAI_API_KEY eklenirse BorAI bu sorulari dogrudan modelle yanitlar.${marketText}`;
  }

  if (question.toLocaleLowerCase("tr-TR").includes("nedir") || question.toLocaleLowerCase("tr-TR").includes("ne demek")) {
    return `${topic} icin net cerceve: Bu kavrami anlamanin en kisa yolu tanim, kullanim alani ve ornek seklinde bakmaktir. Tanim: ${topic}, sorudaki baglama gore aciklanmasi gereken ana kavramdir. Kullanim: genellikle konuyu siniflandirmak, karar vermek veya bir problemi cozmek icin kullanilir. Ornek: once temel anlamini ogrenip sonra gercek bir durumda nasil calistigini test edersin.${marketText}`;
  }

  return `${topic} hakkinda net cevap: Bu soruda once ana kavrami, sonra sonucu ve uygulanacak adimi ayirmak gerekir. Kisa yol soyle: 1. Konunun tanimini netlestir. 2. Elindeki bilgileri listele. 3. En guclu ihtimali sec. 4. Sonucu bir ornekle test et. Benim yorumum: "${topic}" icin en mantikli baslangic, konuyu kucuk parcalara bolmek ve ilk uygulanabilir adimi hemen denemektir.${marketText}`;
}

function cleanTopic(question: string) {
  return question
    .replace(/\?/g, "")
    .replace(/\bnedir\b/gi, "")
    .replace(/\bne demek\b/gi, "")
    .replace(/\bne\b/gi, "")
    .trim() || "Bu konu";
}

function extractKnowledgeTopic(question: string) {
  return cleanTopic(question)
    .replace(/\bkimdir\b/gi, "")
    .replace(/\bneredir\b/gi, "")
    .replace(/\bnasil\b/gi, "")
    .replace(/\bnasıl\b/gi, "")
    .replace(/\bacikla\b/gi, "")
    .replace(/\baçıkla\b/gi, "")
    .replace(/\banlat\b/gi, "")
    .replace(/\bhakkinda\b/gi, "")
    .replace(/\bhakkında\b/gi, "")
    .replace(/\s+/g, " ")
    .trim();
}

function isPersonalOrActionOnlyQuestion(lower: string) {
  return [
    "adın",
    "adin",
    "instagram",
    "merhaba",
    "selam",
    "nasılsın",
    "nasilsin",
    "mail yaz",
    "mesaj yaz",
    "cevir",
    "çevir"
  ].some((keyword) => lower.includes(keyword));
}

function simpleTranslateToEnglish(text: string) {
  const dictionary: Record<string, string> = {
    merhaba: "hello",
    selam: "hi",
    nasılsın: "how are you",
    nasilsin: "how are you",
    iyiyim: "I am fine",
    tesekkur: "thank you",
    teşekkür: "thank you",
    hava: "weather",
    bugun: "today",
    bugün: "today",
    yarin: "tomorrow",
    yarın: "tomorrow",
    para: "money",
    site: "website",
    yardim: "help",
    yardım: "help"
  };

  return translateWordByWord(text, dictionary);
}

function simpleTranslateToTurkish(text: string) {
  const dictionary: Record<string, string> = {
    hello: "merhaba",
    hi: "selam",
    "how are you": "nasılsın",
    thanks: "teşekkürler",
    "thank you": "teşekkürler",
    weather: "hava durumu",
    today: "bugün",
    tomorrow: "yarın",
    money: "para",
    website: "site",
    help: "yardım"
  };

  return translateWordByWord(text, dictionary);
}

function translateWordByWord(text: string, dictionary: Record<string, string>) {
  const lowerText = text.toLocaleLowerCase("tr-TR").trim();
  if (dictionary[lowerText]) {
    return dictionary[lowerText];
  }

  return text
    .split(/(\s+)/)
    .map((part) => dictionary[part.toLocaleLowerCase("tr-TR")] ?? part)
    .join("");
}

function trySolveMath(question: string): string | null {
  const normalized = question
    .toLocaleLowerCase("tr-TR")
    .replaceAll(",", ".")
    .replace(/\barti\b/g, "+")
    .replace(/\beksi\b/g, "-")
    .replace(/\bcarpi\b/g, "*")
    .replace(/\bçarpı\b/g, "*")
    .replace(/\bbolu\b/g, "/")
    .replace(/\bbölü\b/g, "/")
    .replace(/\bkac\b/g, "")
    .replace(/\bkaç\b/g, "")
    .replace(/\bnedir\b/g, "")
    .replace(/\?/g, "")
    .replace(/\s+ise.*$/g, "")
    .trim();

  const equation = normalized.match(/^([a-z])\s*([+\-*/])\s*([\d.]+)\s*=\s*([\d.]+)$/);
  if (equation) {
    const [, variable, operator, rawNumber, rawResult] = equation;
    const number = Number(rawNumber);
    const result = Number(rawResult);
    if (Number.isFinite(number) && Number.isFinite(result)) {
      const value =
        operator === "+"
          ? result - number
          : operator === "-"
            ? result + number
            : operator === "*"
              ? result / number
              : result * number;
      return `${variable} = ${formatPlain(value)}.`;
    }
  }

  const linear = normalized.match(/^([\d.]+)\s*([a-z])\s*([+\-])\s*([\d.]+)\s*=\s*([\d.]+)$/);
  if (linear) {
    const [, rawCoefficient, variable, operator, rawNumber, rawResult] = linear;
    const coefficient = Number(rawCoefficient);
    const number = Number(rawNumber);
    const result = Number(rawResult);
    if (Number.isFinite(coefficient) && coefficient !== 0 && Number.isFinite(number) && Number.isFinite(result)) {
      const value = operator === "+" ? (result - number) / coefficient : (result + number) / coefficient;
      return `${variable} = ${formatPlain(value)}.`;
    }
  }

  const expression = normalized.match(/[-+*/().\d\s^]+/)?.[0]?.trim();
  if (!expression || expression.length < 3 || !/[+\-*/^]/.test(expression)) {
    return null;
  }

  const result = evaluateExpression(expression);
  return result === null ? null : `Sonuc: ${formatPlain(result)}.`;
}

function evaluateExpression(expression: string): number | null {
  const tokens = expression.replace(/\s+/g, "").match(/\d+(?:\.\d+)?|[+\-*/^()]/g);
  if (!tokens) {
    return null;
  }

  const values: number[] = [];
  const operators: string[] = [];
  const precedence: Record<string, number> = { "+": 1, "-": 1, "*": 2, "/": 2, "^": 3 };

  function applyOperator() {
    const operator = operators.pop();
    const right = values.pop();
    const left = values.pop();
    if (!operator || left === undefined || right === undefined) {
      return false;
    }

    const value =
      operator === "+"
        ? left + right
        : operator === "-"
          ? left - right
          : operator === "*"
            ? left * right
            : operator === "/"
              ? left / right
              : left ** right;

    values.push(value);
    return Number.isFinite(value);
  }

  for (const token of tokens) {
    if (/^\d/.test(token)) {
      values.push(Number(token));
    } else if (token === "(") {
      operators.push(token);
    } else if (token === ")") {
      while (operators.at(-1) && operators.at(-1) !== "(") {
        if (!applyOperator()) {
          return null;
        }
      }
      if (operators.pop() !== "(") {
        return null;
      }
    } else {
      while (operators.at(-1) && operators.at(-1) !== "(" && precedence[operators.at(-1) ?? ""] >= precedence[token]) {
        if (!applyOperator()) {
          return null;
        }
      }
      operators.push(token);
    }
  }

  while (operators.length) {
    if (!applyOperator()) {
      return null;
    }
  }

  return values.length === 1 ? values[0] : null;
}

function answerPhysics(question: string): string | null {
  if (question.includes("newton") || question.includes("f=ma") || question.includes("kuvvet") || question.includes("ivme")) {
    return "Newton'un ikinci yasasi F = m * a seklindedir. Yani net kuvvet, kutle ile ivmenin carpimina esittir. Ornek: 2 kg kutle 3 m/s² ivmelenirse kuvvet 6 N olur.";
  }

  if (question.includes("enerji") || question.includes("kinetik")) {
    return "Kinetik enerji hareket enerjisidir ve formulu E = 1/2 * m * v² seklindedir. Kutle kg, hiz m/s ise sonuc joule cinsinden bulunur.";
  }

  if (question.includes("ohm") || question.includes("voltaj") || question.includes("direnc") || question.includes("akim")) {
    return "Ohm yasasi V = I * R seklindedir. V voltaj, I akim, R direnc anlamina gelir.";
  }

  if (question.includes("yer cekimi") || question.includes("yerçekimi") || question.includes("gravit")) {
    return "Yer cekimi, kutlelerin birbirini cekmesiyle olusan temel etkidir. Dunya yuzeyinde ortalama yer cekimi ivmesi yaklasik 9.81 m/s² kabul edilir.";
  }

  return null;
}

function findCoin(question: string, coins: CoinMarket[]) {
  return coins.find((coin) => question.includes(coin.symbol.toLocaleLowerCase("tr-TR")) || question.includes(coin.name.toLocaleLowerCase("tr-TR")));
}

function findCurrency(question: string, rates: CurrencyRate[]) {
  return rates.find((rate) => question.includes(rate.code.toLocaleLowerCase("tr-TR")) || question.includes(rate.name.toLocaleLowerCase("tr-TR")));
}

function formatUsd(value: number) {
  const absValue = Math.abs(value);
  return new Intl.NumberFormat("tr-TR", {
    style: "currency",
    currency: "USD",
    minimumFractionDigits: 2,
    maximumFractionDigits: absValue < 1 ? 8 : absValue < 100 ? 6 : 4
  }).format(value);
}

function formatTry(value: number) {
  const absValue = Math.abs(value);
  return new Intl.NumberFormat("tr-TR", {
    style: "currency",
    currency: "TRY",
    minimumFractionDigits: 2,
    maximumFractionDigits: absValue < 1 ? 8 : absValue < 100 ? 6 : 4
  }).format(value);
}

function formatFullNumber(value: number) {
  return new Intl.NumberFormat("tr-TR", { maximumFractionDigits: 8 }).format(value);
}

function formatPlain(value: number) {
  return new Intl.NumberFormat("tr-TR", { maximumFractionDigits: 8 }).format(value);
}

function formatPercentValue(value: number) {
  return `${value >= 0 ? "+" : ""}${formatPlain(value)}%`;
}
