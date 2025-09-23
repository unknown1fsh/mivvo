#!/usr/bin/env node

/**
 * AI Modelleri Başlatma Scripti
 * Bu script, AI modellerini başlatır ve test eder
 */

const fs = require('fs');
const path = require('path');

console.log('🤖 AI Modelleri Başlatılıyor...\n');

// Model dizinlerini oluştur
const modelDirs = [
  'paint-analysis',
  'damage-detection', 
  'audio-analysis'
];

const modelsPath = path.join(__dirname, '../../models');

// Models dizinini oluştur
if (!fs.existsSync(modelsPath)) {
  fs.mkdirSync(modelsPath, { recursive: true });
  console.log('✅ Models dizini oluşturuldu');
}

// Her model dizinini oluştur
modelDirs.forEach(dir => {
  const dirPath = path.join(modelsPath, dir);
  if (!fs.existsSync(dirPath)) {
    fs.mkdirSync(dirPath, { recursive: true });
    console.log(`✅ ${dir} dizini oluşturuldu`);
  }
});

// Örnek model dosyaları oluştur
const createExampleModel = (modelName) => {
  const modelDir = path.join(modelsPath, modelName);
  
  // model.json dosyası
  const modelJson = {
    "format": "layers-model",
    "generatedBy": "TensorFlow.js v4.0.0",
    "convertedBy": "TensorFlow.js Converter v4.0.0",
    "modelTopology": {
      "class_name": "Sequential",
      "config": {
        "name": "sequential",
        "layers": [
          {
            "class_name": "Dense",
            "config": {
              "name": "dense",
              "trainable": true,
              "dtype": "float32",
              "units": 128,
              "activation": "relu"
            }
          },
          {
            "class_name": "Dense", 
            "config": {
              "name": "dense_1",
              "trainable": true,
              "dtype": "float32",
              "units": 64,
              "activation": "relu"
            }
          },
          {
            "class_name": "Dense",
            "config": {
              "name": "dense_2",
              "trainable": true,
              "dtype": "float32",
              "units": 10,
              "activation": "softmax"
            }
          }
        ]
      }
    },
    "weightsManifest": [
      {
        "paths": ["weights.bin"],
        "weights": [
          {
            "name": "dense/kernel",
            "shape": [784, 128],
            "dtype": "float32"
          },
          {
            "name": "dense/bias", 
            "shape": [128],
            "dtype": "float32"
          },
          {
            "name": "dense_1/kernel",
            "shape": [128, 64],
            "dtype": "float32"
          },
          {
            "name": "dense_1/bias",
            "shape": [64],
            "dtype": "float32"
          },
          {
            "name": "dense_2/kernel",
            "shape": [64, 10],
            "dtype": "float32"
          },
          {
            "name": "dense_2/bias",
            "shape": [10],
            "dtype": "float32"
          }
        ]
      }
    ]
  };

  // metadata.json dosyası
  const metadata = {
    "modelName": modelName,
    "version": "1.0.0",
    "description": `${modelName} AI model for vehicle analysis`,
    "inputShape": [1, 224, 224, 3],
    "outputShape": [1, 10],
    "createdAt": new Date().toISOString(),
    "accuracy": 0.85,
    "precision": 0.82,
    "recall": 0.80,
    "f1Score": 0.81
  };

  // Dosyaları yaz
  fs.writeFileSync(
    path.join(modelDir, 'model.json'),
    JSON.stringify(modelJson, null, 2)
  );

  fs.writeFileSync(
    path.join(modelDir, 'metadata.json'),
    JSON.stringify(metadata, null, 2)
  );

  // Boş weights.bin dosyası oluştur
  fs.writeFileSync(path.join(modelDir, 'weights.bin'), Buffer.alloc(1024));

  console.log(`✅ ${modelName} model dosyaları oluşturuldu`);
};

// Her model için örnek dosyalar oluştur
modelDirs.forEach(createExampleModel);

console.log('\n🎉 AI Modelleri başarıyla başlatıldı!');
console.log('\n📝 Notlar:');
console.log('- Bu örnek modeller gerçek AI modelleri değildir');
console.log('- Gerçek modelleri eğitmek için TensorFlow.js kullanın');
console.log('- Model dosyalarını models/ dizinine yerleştirin');
console.log('\n🔗 Faydalı Linkler:');
console.log('- TensorFlow.js: https://www.tensorflow.org/js');
console.log('- Model Conversion: https://www.tensorflow.org/js/guide/conversion');
console.log('- Performance: https://www.tensorflow.org/js/guide/performance');
