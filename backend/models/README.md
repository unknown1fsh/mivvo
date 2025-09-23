# AI Models Directory

Bu dizin, Mivvo Expertiz uygulaması için AI modellerini içerir.

## Model Yapısı

```
models/
├── paint-analysis/
│   ├── model.json
│   ├── weights.bin
│   └── metadata.json
├── damage-detection/
│   ├── model.json
│   ├── weights.bin
│   └── metadata.json
├── audio-analysis/
│   ├── model.json
│   ├── weights.bin
│   └── metadata.json
└── README.md
```

## Model Türleri

### 1. Boya Analizi Modeli (paint-analysis)
- **Amaç**: Araç boya kalitesi, çizik, pas, oksidasyon tespiti
- **Input**: 224x224x3 RGB resim
- **Output**: Boya durumu, kalite skoru, hasar tespiti
- **Format**: TensorFlow.js model

### 2. Hasar Tespit Modeli (damage-detection)
- **Amaç**: Araç hasarlarını tespit etme ve sınıflandırma
- **Input**: 224x224x3 RGB resim
- **Output**: Hasar alanları, türü, şiddeti
- **Format**: TensorFlow.js model

### 3. Ses Analizi Modeli (audio-analysis)
- **Amaç**: Motor sesi analizi ve arıza tespiti
- **Input**: Spektrogram (128x128x1)
- **Output**: Motor sağlığı, RPM analizi, frekans analizi
- **Format**: TensorFlow.js model

## Model Eğitimi

### Veri Hazırlığı
1. **Resim Verileri**: Araç fotoğrafları, farklı açılar, ışık koşulları
2. **Ses Verileri**: Motor sesleri, farklı RPM'ler, arızalı/sağlıklı motorlar
3. **Etiketleme**: Uzman tarafından manuel etiketleme

### Eğitim Süreci
1. Veri ön işleme ve augmentasyon
2. Model mimarisi seçimi
3. Transfer learning uygulama
4. Hyperparameter optimizasyonu
5. Model değerlendirme ve validasyon

## Model Deployment

### TensorFlow.js Dönüşümü
```bash
# Python modelini TensorFlow.js'e çevir
tensorflowjs_converter --input_format=tf_saved_model \
  --output_format=tfjs_graph_model \
  --signature_name=serving_default \
  --saved_model_tags=serve \
  ./saved_model ./tfjs_model
```

### Model Yükleme
```typescript
// AIService.ts içinde
this.paintModel = await tf.loadLayersModel(`file://${modelBasePath}/paint-analysis/model.json`);
```

## Performans Metrikleri

### Boya Analizi
- **Accuracy**: >90%
- **Precision**: >85%
- **Recall**: >88%
- **F1-Score**: >86%

### Hasar Tespiti
- **mAP@0.5**: >0.85
- **mAP@0.75**: >0.75
- **Inference Time**: <500ms

### Ses Analizi
- **Accuracy**: >88%
- **Precision**: >85%
- **Recall**: >82%
- **F1-Score**: >83%

## Model Güncelleme

### Otomatik Güncelleme
- Haftalık performans kontrolü
- Yeni veri ile retraining
- A/B testing ile model karşılaştırması

### Manuel Güncelleme
- Admin paneli üzerinden model yükleme
- Version control ve rollback
- Performans monitoring

## Güvenlik

### Model Güvenliği
- Model dosyalarının şifrelenmesi
- API key koruması
- Rate limiting

### Veri Güvenliği
- Kullanıcı verilerinin anonimleştirilmesi
- GDPR uyumluluğu
- Veri saklama politikaları

## Monitoring

### Performans İzleme
- Model accuracy tracking
- Inference time monitoring
- Error rate analysis
- User feedback collection

### Alerts
- Model performance degradation
- High error rates
- System resource usage
- Security incidents

## Gelecek Geliştirmeler

### Yeni Modeller
- [ ] 3D araç analizi
- [ ] Video analizi
- [ ] Çoklu sensör füzyonu
- [ ] Real-time analiz

### Optimizasyonlar
- [ ] Model quantization
- [ ] Edge deployment
- [ ] Federated learning
- [ ] AutoML integration

## Kaynaklar

- [TensorFlow.js Documentation](https://www.tensorflow.org/js)
- [Model Conversion Guide](https://www.tensorflow.org/js/guide/conversion)
- [Performance Optimization](https://www.tensorflow.org/js/guide/performance)
- [Model Deployment Best Practices](https://www.tensorflow.org/js/guide/deployment)
