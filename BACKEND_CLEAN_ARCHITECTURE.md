# Backend Clean Architecture Yapısı

## 📁 Proje Yapısı

```
backend/
├── src/
│   ├── dto/                          # Data Transfer Objects
│   │   ├── request/                  # İstek DTO'ları
│   │   │   ├── AuthRequestDTO.ts
│   │   │   ├── VehicleRequestDTO.ts
│   │   │   └── AnalysisRequestDTO.ts
│   │   └── response/                 # Yanıt DTO'ları
│   │       ├── AuthResponseDTO.ts
│   │       ├── AnalysisResponseDTO.ts
│   │       └── ApiResponseDTO.ts
│   │
│   ├── repositories/                 # Repository Katmanı (DB Abstraction)
│   │   ├── BaseRepository.ts         # Temel repository sınıfı
│   │   ├── UserRepository.ts
│   │   ├── VehicleReportRepository.ts
│   │   ├── VehicleGarageRepository.ts
│   │   └── index.ts
│   │
│   ├── mappers/                      # Entity ↔ DTO Dönüşümleri
│   │   ├── UserMapper.ts
│   │   ├── VehicleMapper.ts
│   │   ├── AnalysisMapper.ts
│   │   └── index.ts
│   │
│   ├── exceptions/                   # Özel Exception Sınıfları
│   │   ├── BaseException.ts
│   │   ├── HttpExceptions.ts
│   │   ├── BusinessExceptions.ts
│   │   └── index.ts
│   │
│   ├── constants/                    # Sabit Değerler
│   │   ├── ApiConstants.ts
│   │   ├── CreditPricing.ts
│   │   ├── ErrorMessages.ts
│   │   └── index.ts
│   │
│   ├── utils/                        # Yardımcı Fonksiyonlar
│   │   ├── ResponseHelper.ts
│   │   ├── ValidationHelper.ts
│   │   ├── FileHelper.ts
│   │   └── index.ts
│   │
│   ├── services/                     # İş Mantığı Katmanı
│   │   ├── aiService.ts
│   │   ├── paintAnalysisService.ts
│   │   ├── damageDetectionService.ts
│   │   └── ...
│   │
│   ├── controllers/                  # Controller Katmanı
│   │   ├── authController.ts
│   │   ├── vehicleController.ts
│   │   └── ...
│   │
│   ├── routes/                       # Route Tanımlamaları
│   │   ├── auth.ts
│   │   ├── vehicle.ts
│   │   └── ...
│   │
│   ├── middleware/                   # Middleware'ler
│   │   ├── auth.ts
│   │   ├── errorHandler.ts
│   │   └── notFound.ts
│   │
│   └── index.ts                      # Ana uygulama giriş noktası
│
├── prisma/                           # Prisma ORM
│   ├── schema.prisma
│   └── migrations/
│
├── uploads/                          # Dosya yüklemeleri
├── models/                           # AI modelleri
├── package.json
└── tsconfig.json
```

## 🏗️ Katman Sorumlulukları

### 1. **DTO (Data Transfer Objects)**
- **Amaç**: API ile iletişimde kullanılan veri yapıları
- **Sorumluluk**: Request/Response data structure tanımlaması
- **Bağımlılık**: YOKTUR (Hiçbir katmana bağımlı değil)

```typescript
// dto/request/AuthRequestDTO.ts
export interface LoginRequestDTO {
  email: string;
  password: string;
}
```

### 2. **Repository**
- **Amaç**: Veritabanı işlemlerini soyutlar
- **Sorumluluk**: CRUD işlemleri, sorgu optimizasyonu
- **Bağımlılık**: Prisma Client
- **Prensip**: Database abstraction, değiştirilebilirlik

```typescript
// repositories/UserRepository.ts
export class UserRepository extends BaseRepository<User> {
  async findByEmail(email: string): Promise<User | null> {
    return await this.prisma.user.findUnique({ where: { email } });
  }
}
```

### 3. **Mapper**
- **Amaç**: Entity ve DTO arasında dönüşüm
- **Sorumluluk**: Data transformation
- **Bağımlılık**: DTO, Entity
- **Prensip**: Separation of concerns

```typescript
// mappers/UserMapper.ts
export class UserMapper {
  static toUserInfoDTO(user: User): UserInfoDTO {
    return {
      id: user.id,
      email: user.email,
      // ... hassas bilgiler hariç
    };
  }
}
```

### 4. **Exception**
- **Amaç**: Hata yönetimi
- **Sorumluluk**: Özel exception sınıfları
- **Bağımlılık**: YOKTUR
- **Prensip**: Standardize error handling

```typescript
// exceptions/BusinessExceptions.ts
export class InsufficientCreditsException extends BaseException {
  constructor(message: string = 'Yetersiz kredi') {
    super(message, 402);
  }
}
```

### 5. **Utils**
- **Amaç**: Yardımcı fonksiyonlar
- **Sorumluluk**: Validation, file ops, response formatting
- **Bağımlılık**: Minimal
- **Prensip**: Reusability, single responsibility

```typescript
// utils/ResponseHelper.ts
export class ResponseHelper {
  static success<T>(res: Response, data: T): void {
    res.status(200).json({ success: true, data });
  }
}
```

### 6. **Service**
- **Amaç**: İş mantığı
- **Sorumluluk**: Business logic, orchestration
- **Bağımlılık**: Repository, Mapper, External APIs
- **Prensip**: Business logic encapsulation

```typescript
// services/damageAnalysisService.ts
export class DamageAnalysisService {
  constructor(
    private vehicleReportRepo: VehicleReportRepository,
    private aiService: AIService
  ) {}

  async analyze(request: DamageAnalysisRequestDTO): Promise<DamageAnalysisResponseDTO> {
    // 1. Validate
    // 2. Call AI
    // 3. Save to DB
    // 4. Return DTO
  }
}
```

### 7. **Controller**
- **Amaç**: HTTP request handling
- **Sorumluluk**: Request validation, response formatting
- **Bağımlılık**: Service, ResponseHelper
- **Prensip**: Thin controllers, delegate to services

```typescript
// controllers/damageAnalysisController.ts
export const analyzeDamage = asyncHandler(async (req, res) => {
  const result = await damageAnalysisService.analyze(req.body);
  ResponseHelper.success(res, result);
});
```

## 🔄 Data Flow (Veri Akışı)

```
HTTP Request
    ↓
Controller (Request validation)
    ↓
Service (Business logic)
    ↓
Repository (Database operations)
    ↓
Mapper (Entity → DTO)
    ↓
Controller (Response)
    ↓
HTTP Response
```

## ✅ Clean Code Prensipleri

### 1. **Single Responsibility Principle (SRP)**
- Her sınıf/fonksiyon tek bir işten sorumlu
- Controller sadece HTTP handling
- Service sadece business logic
- Repository sadece DB operations

### 2. **Dependency Inversion Principle (DIP)**
- Üst seviye modüller alt seviye modüllere bağımlı değil
- Repository → Prisma (değiştirilebilir)
- Service → Repository interface (değiştirilebilir)

### 3. **Don't Repeat Yourself (DRY)**
- BaseRepository ile kod tekrarı önlendi
- ResponseHelper ile standart response'lar
- Constants ile hard-coded değerler önlendi

### 4. **Separation of Concerns**
- DTO: Data structure
- Service: Business logic
- Controller: HTTP handling
- Repository: Data access

## 🎯 Kullanım Örnekleri

### Yeni Bir Analiz Servisi Ekleme

1. **DTO Oluştur**
```typescript
// dto/request/NewAnalysisRequestDTO.ts
export interface NewAnalysisRequestDTO {
  vehicleId: number;
  // ... fields
}
```

2. **Response DTO Oluştur**
```typescript
// dto/response/NewAnalysisResponseDTO.ts
export interface NewAnalysisResponseDTO {
  id: number;
  result: any;
  // ... fields
}
```

3. **Service Oluştur**
```typescript
// services/newAnalysisService.ts
export class NewAnalysisService {
  async analyze(request: NewAnalysisRequestDTO): Promise<NewAnalysisResponseDTO> {
    // Business logic
  }
}
```

4. **Controller Oluştur**
```typescript
// controllers/newAnalysisController.ts
export const analyzeNew = asyncHandler(async (req, res) => {
  const result = await newAnalysisService.analyze(req.body);
  ResponseHelper.success(res, result);
});
```

5. **Route Ekle**
```typescript
// routes/newAnalysis.ts
router.post('/analyze', authenticate, analyzeNew);
```

## 📚 Best Practices

1. **Her zaman DTO kullan** - Direkt entity döndürme
2. **Repository pattern kullan** - Direkt Prisma kullanma
3. **Exception fırlat** - Error handling için
4. **ResponseHelper kullan** - Standart response format
5. **Validation Helper kullan** - Input validation
6. **Constants kullan** - Hard-coded değerler yerine
7. **Async/await kullan** - Callback hell'den kaçın
8. **TypeScript types kullan** - any kullanma

## 🔐 Güvenlik

1. **Authentication Middleware** - Her protected route'da
2. **Input Validation** - Her request için
3. **Error Sanitization** - Production'da detay verme
4. **Rate Limiting** - API abuse önleme
5. **File Type Validation** - Upload'larda
6. **SQL Injection Prevention** - Prisma ORM kullan

## 🚀 Performans

1. **Eager Loading** - N+1 query önleme
2. **Pagination** - Büyük data setleri için
3. **Caching** - Sık kullanılan veriler için
4. **Async Processing** - AI analizleri için
5. **Connection Pooling** - Database bağlantıları

