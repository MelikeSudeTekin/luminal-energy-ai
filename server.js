const express = require('express');
const cors = require('cors');
const dotenv = require('dotenv');
const { OpenAI } = require('openai');
const path = require('path');

// Load environment variables
dotenv.config();

const app = express();
const PORT = process.env.PORT || 3000;

// Middleware
app.use(cors());
app.use(express.json());

// Serve frontend static files
app.use(express.static(path.join(__dirname, 'public')));

// Initialize OpenAI API client if key exists
const apiKey = process.env.OPENAI_API_KEY;
let openai = null;
let isSimulationMode = false;

if (apiKey && apiKey.trim() !== '') {
  try {
    openai = new OpenAI({ apiKey: apiKey });
    console.log('OpenAI API client successfully initialized.');
  } catch (error) {
    console.error('Error initializing OpenAI client, entering Simulation Mode:', error.message);
    isSimulationMode = true;
  }
} else {
  console.warn('WARNING: OPENAI_API_KEY is not defined in the environment. Entering Simulation Mode.');
  isSimulationMode = true;
}

// System Persona definition
const SYSTEM_PROMPT = `
Sen "Luminal Energy" adında modern ve yenilikçi bir güneş enerjisi ve akıllı enerji çözümleri firmasının uzman yapay zeka danışmanısın.
Adın "Solarix".
Müşterilere karşı son derece kibar, profesyonel, bilgilendirici ve ikna edici bir üslupla konuşmalısın.
Görevlerin:
1. Kullanıcılara güneş panelleri, akıllı invertörler, lityum batarya sistemleri, net-metering (mahsuplaşma), karbon ayak izi azaltma ve güneş enerjisi teşvikleri hakkında teknik ve genel bilgiler vermek.
2. Web sitesinde bulunan "Güneş Enerjisi Tasarruf Hesaplayıcı" modülünü kullanmalarını teşvik etmek (sayfanın ortasında yer alır, fatura ve çatı alanı ile hesaplama yapar).
3. Luminal Energy'nin anahtar teslim kurulum hizmetleri sunduğunu, mühendislik (EPC), yasal izinler ve kurulum süreçlerinin tamamını üstlendiğini belirtmek.
4. Yanıtlarını markdown biçiminde, okunması kolay (kalın yazılar, listeler, kısa paragraflar) şekilde biçimlendirmek.
5. Sorulara Türkçe olarak yanıt vermek. Sektör dışındaki genel sorular sorulduğunda, konuyu kibarca güneş enerjisi ve akıllı ev sistemleri gibi Luminal Energy'nin uzmanlık alanlarına geri getirmek.
`;

// Helper: Smart simulation response generator for fallback mode
function generateSimulationResponse(messages) {
  const lastMessage = messages[messages.length - 1].content.toLowerCase();
  
  let reply = '';
  
  if (lastMessage.includes('merhaba') || lastMessage.includes('selam') || lastMessage.includes('hey')) {
    reply = `Merhaba! Ben **Solarix**, Luminal Energy akıllı enerji asistanınız. ☀️

Güneş enerjisi sistemleri, çatınıza uygun çözümler, maliyet hesaplamaları veya sürdürülebilirlik hakkında öğrenmek istediğiniz her şeyi bana sorabilirsiniz. 

Size nasıl yardımcı olabilirim?`;
  } else if (lastMessage.includes('tasarruf') || lastMessage.includes('hesapla') || lastMessage.includes('fatura') || lastMessage.includes('maliyet')) {
    reply = `Güneş enerjisi yatırımları, elektrik faturalarınızı **%80 ila %100 oranında** azaltabilir! 

Detaylı bir analiz için web sayfamızda bulunan **"Solar Tasarruf Hesaplayıcı"** aracını kullanabilirsiniz. Çatı alanınızı ve aylık elektrik faturanızı girerek aşağıdaki verileri anında görebilirsiniz:
* 📉 Tahmini Aylık Kazanç
* 🌲 Yıllık Kurtarılan Ağaç Sayısı
* ⏱️ Yatırım Geri Dönüş (Amortisman) Süresi

Genel olarak, Türkiye koşullarında 10 kWp gücünde standart bir konut sisteminin kurulum maliyeti yaklaşık **$6,000 - $9,000** arasındadır ve kendisini **4-6 yıl** içinde amorti eder. 

Daha detaylı bir teklif ister misiniz?`;
  } else if (lastMessage.includes('panel') || lastMessage.includes('verim') || lastMessage.includes('monokristal')) {
    reply = `Luminal Energy olarak projelerimizde en yüksek verimliliğe sahip **N-Type Monokristal Perc** güneş panellerini kullanıyoruz. 

Bu panellerin öne çıkan özellikleri:
* **Yüksek Verimlilik:** %22'nin üzerinde verim oranı sunarak bulutlu havalarda bile yüksek üretim yaparlar.
* **Uzun Ömür:** 25 yıl boyunca minimum %85 performans garantisi vardır.
* **Estetik Görünüm:** Tamamen siyah (All-Black) tasarımları sayesinde çatınızda modern ve şık bir duruş sergilerler.

İhtiyacınıza göre monokristal panel teknolojimiz ve kurulum detayları hakkında bilgi verebilirim.`;
  } else if (lastMessage.includes('batarya') || lastMessage.includes('depolama') || lastMessage.includes('akü') || lastMessage.includes('lityum')) {
    reply = `Elektrik kesintilerinden etkilenmemek ve geceleri de güneş enerjisi kullanmak için **Luminal Smart Wall (Lityum Demir Fosfat - LiFePO4)** batarya depolama çözümlerimizi sunuyoruz.

**Neden Lityum Batarya?**
1. **Güvenlik:** LiFePO4 hücre kimyası en güvenli depolama teknolojisidir, aşırı ısınma yapmaz.
2. **Kullanım Ömrü:** 6000+ döngü ömrü ile **10 ila 15 yıl** sorunsuz çalışır.
3. **Akıllı Yönetim:** Akıllı invertörlerimizle entegre çalışarak şebeke elektriğinin pahalı olduğu saatlerde bataryayı devreye sokar.

Eviniz veya iş yeriniz için kaç kWh kapasiteli bir depolama düşündüğünüzü analiz edebiliriz.`;
  } else if (lastMessage.includes('kurulum') || lastMessage.includes('izin') || lastMessage.includes('başvuru') || lastMessage.includes('nasıl')) {
    reply = `Luminal Energy ile güneş enerjisine geçiş süreci tamamen **anahtar teslimdir**. Sizin yerinize tüm süreci yönetiyoruz:

1. **Keşif ve Tasarım (1-3 Gün):** Mühendislerimiz çatınızı 3D olarak tarar ve gölgeleme analizlerini yapar.
2. **Yasal İzinler (60-90 Gün):** Dağıtım şirketi ile yapılacak çağrı mektubu ve onay süreçlerini biz takip ederiz.
3. **Kurulum ve Kabul (3-5 Gün):** Fiziksel panel montajı, kablolama ve invertör bağlantıları uzman ekiplerimizce tamamlanır.
4. **Devreye Alma:** Kabul işlemlerinin ardından sisteminiz elektrik üretmeye başlar!

Süreci başlatmak adına ücretsiz bir keşif randevusu oluşturmak ister misiniz?`;
  } else {
    reply = `Güneş enerjisi ve akıllı enerji çözümlerimiz hakkında sorduğunuz soruyu memnuniyetle yanıtlamak isterim. 

*(Not: Şu anda **Simülasyon Modu** aktif olduğu için bu genel cevabı görüyorsunuz. OpenAI API anahtarınızı '.env' dosyasına eklediğinizde Solarix AI tam kapasiteyle tüm sorularınızı yapay zeka gücüyle cevaplayacaktır.)*

Güneş panelleri, batarya depolama sistemleri, yasal izin süreçleri veya solar tasarruf hesaplayıcımız hakkında bilgi almak için yukarıdaki anahtar kelimeleri içeren sorular yöneltebilirsiniz!`;
  }

  return {
    role: 'assistant',
    content: reply
  };
}

// API Chat Endpoint
app.post('/api/chat', async (req, res) => {
  try {
    const { messages } = req.body;

    if (!messages || !Array.isArray(messages)) {
      return res.status(400).json({ error: 'Geçersiz mesaj formatı. "messages" bir dizi olmalıdır.' });
    }

    // Proactively check configuration state dynamically
    const currentApiKey = process.env.OPENAI_API_KEY;
    const actualSimulation = isSimulationMode || !currentApiKey || currentApiKey.trim() === '';

    if (actualSimulation) {
      // Return smart simulation output
      // Simulate network latency (500ms - 1000ms) for realistic UX
      await new Promise(resolve => setTimeout(resolve, 800));
      const mockReply = generateSimulationResponse(messages);
      return res.json({
        success: true,
        message: mockReply,
        simulation: true
      });
    }

    // Call actual OpenAI API
    // Reinitialize client if key was added runtime after app boot
    if (!openai && currentApiKey) {
      openai = new OpenAI({ apiKey: currentApiKey });
    }

    // Build the request payload prepended with the custom SYSTEM prompt
    const formattedMessages = [
      { role: 'system', content: SYSTEM_PROMPT },
      ...messages.map(msg => ({
        role: msg.role === 'user' ? 'user' : 'assistant',
        content: msg.content
      }))
    ];

    const response = await openai.chat.completions.create({
      model: 'gpt-4o-mini',
      messages: formattedMessages,
      temperature: 0.7,
      max_tokens: 800
    });

    const reply = response.choices[0].message;

    return res.json({
      success: true,
      message: {
        role: 'assistant',
        content: reply.content
      },
      simulation: false
    });

  } catch (error) {
    console.error('OpenAI API Call Error:', error);
    
    // In case OpenAI errors out (e.g. Quota exceeded or invalid API key), fallback to simulation with error message context
    return res.json({
      success: true,
      message: {
        role: 'assistant',
        content: `⚠️ **API Bağlantı Hatası:** OpenAI API çağrısı sırasında bir sorun oluştu (${error.message || 'Bilinmeyen Hata'}).

**Simülasyon Modu Cevabı:**
${generateSimulationResponse(req.body.messages).content}`
      },
      simulation: true
    });
  }
});

// Fallback all other GET requests to Serve index.html
app.get('*', (req, res) => {
  res.sendFile(path.join(__dirname, 'public', 'index.html'));
});

// Start Server
app.listen(PORT, () => {
  console.log(`===================================================`);
  console.log(` Luminal Energy Server running on port ${PORT}`);
  console.log(` Web App: http://localhost:${PORT}`);
  console.log(` Environment Mode: ${apiKey ? 'OpenAI Live' : 'Simulation Mode (No API Key)'}`);
  console.log(`===================================================`);
});
