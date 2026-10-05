# Luminal Energy

## AI Destekli Güneş Enerjisi Danışmanlık ve Tasarruf Platformu

Luminal Energy, güneş enerjisi sistemleri hakkında kullanıcıları bilgilendirmek, tahmini enerji tasarrufu ve yatırım geri dönüşü hakkında analiz sunmak ve yapay zeka destekli bir danışmanlık deneyimi sağlamak amacıyla geliştirilmiş modern bir web uygulamasıdır.

Platform içerisinde Solarix AI adlı yapay zeka danışmanı, solar tasarruf hesaplayıcı ve güneş enerjisi sistemlerine ait teknik bilgiler bir arada sunulmaktadır.

## Projenin Amacı

Projenin temel amacı, güneş enerjisine geçiş yapmak isteyen kullanıcıların ihtiyaç duyabileceği temel bilgileri tek bir platform üzerinden sunmaktır.

Kullanıcılar:

- Güneş paneli teknolojileri hakkında bilgi edinebilir.
- Akıllı hibrit invertör ve lityum batarya sistemlerini inceleyebilir.
- Aylık elektrik faturası ve çatı alanına göre tahmini solar sistem analizi yapabilir.
- Öngörülen yıllık elektrik üretimini inceleyebilir.
- Tahmini aylık tasarruf ve yatırım geri dönüş süresini görebilir.
- Solarix AI üzerinden güneş enerjisi hakkında sorular sorabilir.

## Temel Özellikler

### Solar Enerji Bilgilendirme

Platformda farklı güneş enerjisi bileşenleri hakkında teknik bilgiler sunulmaktadır.

İçerikte:

- Monokristal N-Type güneş panelleri
- Akıllı hibrit invertörler
- LiFePO4 lityum enerji depolama sistemleri

gibi sistemler hakkında özellik ve teknik bilgiler yer almaktadır.

### Solar Tasarruf Hesaplayıcı

Kullanıcıdan temel enerji tüketimi ve çatı alanı bilgileri alınarak tahmini bir solar sistem analizi oluşturulur.

Hesaplayıcı:

- Aylık elektrik faturası
- Kullanılabilir çatı alanı
- Önerilen sistem gücü
- Tahmini yıllık elektrik üretimi
- Tahmini aylık tasarruf
- Çevresel katkı
- Yatırımın tahmini geri dönüş süresi

gibi değerleri kullanıcıya sunmaktadır.

### Solarix AI Danışmanı

Solarix AI, güneş enerjisi konusunda kullanıcıların sorularını yanıtlamak amacıyla projeye entegre edilmiş yapay zeka danışmanıdır.

Kullanıcılar:

- Güneş panellerinin kullanım ömrü
- Güneş enerjisi kurulum süreçleri
- Batarya depolama sistemleri
- Güneş panellerinin farklı hava koşullarındaki üretimi
- Enerji verimliliği
- Yatırım ve amortisman

gibi konularda Solarix AI ile iletişim kurabilir.

OpenAI API anahtarı yapılandırıldığında sistem gerçek yapay zeka yanıtları üretmek üzere tasarlanmıştır. API anahtarı bulunmadığında ise uygulama simülasyon modunda çalışarak önceden hazırlanmış solar enerji yanıtlarını kullanabilir.

## Kullanılan Teknolojiler

### Frontend

- HTML5
- CSS3
- JavaScript
- Font Awesome
- Google Fonts

### Backend

- Node.js
- Express.js
- dotenv
- CORS

### Yapay Zeka

- OpenAI API
- Solarix AI

## Proje Yapısı

luminal-energy-ai/
│
├── public/
│   ├── index.html
│   ├── style.css
│   └── app.js
│
├── server.js
├── package.json
├── package-lock.json
├── .env.example
├── .gitignore
└── README.md

## Çalışma Mantığı

Kullanıcı
   |
   v
Web Arayüzü
   |
   +----------------------+
   |                      |
   v                      v
Solar Hesaplayıcı      Solarix AI
                          |
                          v
                    Express Backend
                          |
                          v
                      OpenAI API

Frontend tarafındaki kullanıcı işlemleri JavaScript ile yönetilir. Solarix AI istekleri backend üzerinden işlenir ve OpenAI API ile iletişim kurulur.

API anahtarı bulunmadığında uygulama simülasyon moduna geçerek solar enerji konusunda hazırlanmış cevapları kullanır.

## Kurulum

Projeyi bilgisayarınıza klonladıktan sonra proje klasörüne gidin.

git clone https://github.com/MelikeSudeTekin/luminal-energy-ai.git

cd luminal-energy-ai

Gerekli paketleri yükleyin.

npm install

## Ortam Değişkenleri

Projenin çalışması için .env dosyası oluşturulabilir.

.env.example dosyasındaki yapı kullanılarak gerekli ortam değişkenleri tanımlanmalıdır.

Örnek:

OPENAI_API_KEY=your_api_key_here

Gerçek API anahtarı .env içerisinde tutulmalı ve GitHub'a yüklenmemelidir.

## Uygulamayı Çalıştırma

Gerekli bağımlılıkları yükledikten sonra:

node server.js

komutu ile backend sunucusu çalıştırılabilir.

Daha sonra uygulama, sunucunun kullandığı yerel adres üzerinden tarayıcıda açılabilir.

## Güvenlik

OpenAI API anahtarının frontend tarafında paylaşılmasını önlemek amacıyla API iletişimi backend üzerinden gerçekleştirilecek şekilde tasarlanmıştır.

.env dosyası .gitignore içerisinde tutulmaktadır ve GitHub repository'sine gönderilmemektedir.

node_modules klasörü de repository içerisinde tutulmamakta, gerekli paketler npm install komutu ile yeniden oluşturulmaktadır.

## Geliştirme Alanları

Projenin ilerleyen aşamalarında aşağıdaki özellikler eklenebilir:

- Gerçek güneşlenme ve hava durumu verilerinin sisteme dahil edilmesi
- Bölgesel enerji üretim tahminleri
- Kullanıcı hesabı ve geçmiş hesaplamaların saklanması
- Gerçek zamanlı enerji üretim paneli
- Gelişmiş yatırım ve amortisman analizi
- Solar sistem teklif oluşturma özelliği
- Daha kapsamlı yapay zeka danışmanlığı
- Mobil uygulama entegrasyonu

## Proje Durumu

Proje, güneş enerjisi çözümleri ve yapay zeka destekli danışmanlık deneyimini tek bir web uygulamasında birleştiren bir prototip olarak geliştirilmiştir.

## Geliştirici

Melike Sude Tekin

Yapay Zeka Operatörlüğü öğrencisi olarak yapay zeka, web teknolojileri ve gerçek dünya problemlerine yönelik yazılım çözümleri üzerine çalışmalar yapıyorum.

## Lisans

Bu proje eğitim ve portföy amacıyla geliştirilmiştir.
