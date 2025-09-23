# 🤖 AI Model Entegrasyonu Rehberi

Bu rehber, Mivvo Expertiz uygulamasına gerçek AI modellerinin nasıl entegre edileceğini açıklar.

## 📋 İçindekiler

1. [Genel Bakış](#genel-bakış)
2. [Kurulum](#kurulum)
3. [AI Servisi](#ai-servisi)
4. [Model Yapısı](#model-yapısı)
5. [API Endpoints](#api-endpoints)
6. [Test Etme](#test-etme)
7. [Performans Optimizasyonu](#performans-optimizasyonu)
8. [Sorun Giderme](#sorun-giderme)

## 🎯 Genel Bakış

Mivvo Expertiz uygulaması artık gerçek AI modelleri ile çalışmaktadır:

- **TensorFlow.js** modelleri için yerel AI analizi
- **OpenAI Vision API** ile gelişmiş görüntü analizi
- **Fallback simülasyon** sistemi
- **Performans monitoring** ve hata yönetimi

## 🚀 Kurulum

### 1. Bağımlılıkları Yükle

```bash
cd backend
npm install @tensorflow/tfjs-node
```

### 2. Environment Variables

`.env` dosyanıza şu değişkenleri ekleyin:

```env
# AI Services Configuration
OPENAI_API_KEY=your-openai-api-key
TENSORFLOW_MODEL_PATH=./models
AI_MODEL_CONFIDENCE_THRESHOLD=0.7
AI_MODEL_TIMEOUT=30000
AI_MODEL_RETRY_COUNT=3
```

### 3. AI Modellerini Başlat

```bash
node src/scripts/initAIModels.js
```

## 🧠 AI Servisi

### AIService Sınıfı

`backend/src/services/aiService.ts` dosyası ana AI servisini içerir:

```typescript
import { AIService } from '../services/aiService';

// Boya analizi
const paintResult = await AIService.analyzePaint(imagePath, angle);

// Hasar tespiti
const damageAreas = await AIService.detectDamage(imagePath);

// Motor sesi analizi
const engineResult = await AIService.analyzeEngineSound(audioPath, vehicleInfo);

// OpenAI Vision API
const openaiResult = await AIService.analyzeWithOpenAI(imagePath, 'paint');
```

### Model Yükleme

AI modelleri otomatik olarak yüklenir:

```typescript
// Model yolları
const modelBasePath = path.join(__dirname, '../../models');

// Boya analizi modeli
this.paintModel = await tf.loadLayersModel(`file://${modelBasePath}/paint-analysis/model.json`);
```

## 📁 Model Yapısı

```
backend/models/
├── paint-analysis/
│   ├── model.json          # Model mimarisi
│   ├── weights.bin         # Model ağırlıkları
│   └── metadata.json       # Model metadata
├── damage-detection/
│   ├── model.json
│   ├── weights.bin
│   └── metadata.json
└── audio-analysis/
    ├── model.json
    ├── weights.bin
    └── metadata.json
```

### Model Formatı

Modeller **TensorFlow.js** formatında olmalıdır:

```bash
# Python modelini TensorFlow.js'e çevir
tensorflowjs_converter --input_format=tf_saved_model \
  --output_format=tfjs_graph_model \
  --signature_name=serving_default \
  --saved_model_tags=serve \
  ./saved_model ./tfjs_model
```

## 🔌 API Endpoints

### AI Analiz Endpoints

```bash
# AI servis durumu
GET /api/ai-analysis/status

# Gelişmiş AI analizi (OpenAI Vision)
POST /api/ai-analysis/advanced
{
  "imagePath": "/path/to/image.jpg",
  "analysisType": "paint|damage|general"
}

# Hasar tespiti
POST /api/ai-analysis/damage-detection
{
  "imagePath": "/path/to/image.jpg"
}

# AI analiz geçmişi
GET /api/ai-analysis/history?page=1&limit=10&type=paint
```

### AI Test Endpoints

```bash
# AI servis testi
GET /api/ai-test/status

# Boya analizi testi
POST /api/ai-test/paint
{
  "imagePath": "/path/to/image.jpg",
  "angle": "front"
}

# Hasar tespiti testi
POST /api/ai-test/damage
{
  "imagePath": "/path/to/image.jpg"
}

# Motor sesi analizi testi
POST /api/ai-test/engine
{
  "audioPath": "/path/to/audio.wav",
  "vehicleInfo": {...}
}

# OpenAI Vision API testi
POST /api/ai-test/openai
{
  "imagePath": "/path/to/image.jpg",
  "analysisType": "general"
}

# Kapsamlı AI testi
POST /api/ai-test/comprehensive
{
  "imagePath": "/path/to/image.jpg",
  "audioPath": "/path/to/audio.wav",
  "vehicleInfo": {...}
}
```

## 🧪 Test Etme

### 1. AI Servis Testi

```bash
curl -X GET http://localhost:3001/api/ai-test/status \
  -H "Authorization: Bearer YOUR_JWT_TOKEN"
```

### 2. Boya Analizi Testi

```bash
curl -X POST http://localhost:3001/api/ai-test/paint \
  -H "Authorization: Bearer YOUR_JWT_TOKEN" \
  -H "Content-Type: application/json" \
  -d '{
    "imagePath": "/path/to/car-image.jpg",
    "angle": "front"
  }'
```

### 3. Kapsamlı Test

```bash
curl -X POST http://localhost:3001/api/ai-test/comprehensive \
  -H "Authorization: Bearer YOUR_JWT_TOKEN" \
  -H "Content-Type: application/json" \
  -d '{
    "imagePath": "/path/to/car-image.jpg",
    "audioPath": "/path/to/engine-sound.wav",
    "vehicleInfo": {
      "make": "Toyota",
      "model": "Corolla",
      "year": 2020
    }
  }'
```

## ⚡ Performans Optimizasyonu

### 1. Model Optimizasyonu

```typescript
// Model quantization
const quantizedModel = await tf.quantization.quantizeModel(model);

// Model pruning
const prunedModel = await tf.pruning.pruneModel(model, 0.1);
```

### 2. Bellek Yönetimi

```typescript
// Tensor'ları temizle
tensor.dispose();
prediction.dispose();

// Bellek kullanımını kontrol et
const memoryInfo = tf.memory();
console.log('Memory usage:', memoryInfo);
```

### 3. Caching

```typescript
// Model sonuçlarını cache'le
const cacheKey = `analysis_${imageHash}`;
const cachedResult = await redis.get(cacheKey);

if (cachedResult) {
  return JSON.parse(cachedResult);
}
```

## 🔧 Sorun Giderme

### 1. Model Yükleme Hatası

```bash
# Model dosyalarını kontrol et
ls -la backend/models/paint-analysis/

# Model formatını doğrula
node -e "console.log(require('./models/paint-analysis/model.json'))"
```

### 2. TensorFlow.js Hatası

```bash
# TensorFlow.js versiyonunu kontrol et
npm list @tensorflow/tfjs-node

# Node.js versiyonunu kontrol et
node --version
```

### 3. OpenAI API Hatası

```bash
# API key'i kontrol et
echo $OPENAI_API_KEY

# API limitlerini kontrol et
curl -H "Authorization: Bearer $OPENAI_API_KEY" \
  https://api.openai.com/v1/usage
```

### 4. Performans Sorunları

```typescript
// Model yükleme süresini ölç
const startTime = Date.now();
await AIService.initialize();
const loadTime = Date.now() - startTime;
console.log(`Model loading time: ${loadTime}ms`);

// Inference süresini ölç
const inferenceStart = Date.now();
const result = await AIService.analyzePaint(imagePath, angle);
const inferenceTime = Date.now() - inferenceStart;
console.log(`Inference time: ${inferenceTime}ms`);
```

## 📊 Monitoring

### 1. Performans Metrikleri

```typescript
// AI servis performansını izle
const metrics = {
  modelLoadTime: loadTime,
  inferenceTime: inferenceTime,
  memoryUsage: tf.memory(),
  accuracy: result.confidence,
  timestamp: new Date().toISOString()
};
```

### 2. Hata Takibi

```typescript
// Hataları logla
try {
  const result = await AIService.analyzePaint(imagePath, angle);
} catch (error) {
  console.error('AI analysis error:', {
    error: error.message,
    imagePath,
    angle,
    timestamp: new Date().toISOString()
  });
}
```

## 🚀 Gelecek Geliştirmeler

### 1. Yeni Modeller
- [ ] 3D araç analizi
- [ ] Video analizi
- [ ] Çoklu sensör füzyonu
- [ ] Real-time analiz

### 2. Optimizasyonlar
- [ ] Model quantization
- [ ] Edge deployment
- [ ] Federated learning
- [ ] AutoML integration

### 3. Özellikler
- [ ] Model versioning
- [ ] A/B testing
- [ ] Auto-retraining
- [ ] Performance dashboard

## 📚 Kaynaklar

- [TensorFlow.js Documentation](https://www.tensorflow.org/js)
- [Model Conversion Guide](https://www.tensorflow.org/js/guide/conversion)
- [Performance Optimization](https://www.tensorflow.org/js/guide/performance)
- [OpenAI Vision API](https://platform.openai.com/docs/guides/vision)
- [Node.js TensorFlow.js](https://github.com/tensorflow/tfjs-node)

## 🤝 Katkıda Bulunma

1. Fork edin
2. Feature branch oluşturun (`git checkout -b feature/ai-enhancement`)
3. Commit edin (`git commit -m 'Add AI model integration'`)
4. Push edin (`git push origin feature/ai-enhancement`)
5. Pull Request oluşturun

## 📄 Lisans

Bu proje MIT lisansı altında lisanslanmıştır.
