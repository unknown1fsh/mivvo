# Frontend Clean Architecture Yapısı

## 📁 Proje Yapısı

```
frontend/
├── app/                              # Next.js App Router (Pages)
│   ├── (auth)/
│   │   ├── login/
│   │   └── register/
│   ├── dashboard/
│   ├── vehicle/
│   │   ├── damage-analysis/
│   │   ├── paint-analysis/
│   │   ├── engine-sound-analysis/
│   │   └── comprehensive-expertise/
│   └── ...
│
├── components/                       # UI Components (ZERO LOGIC)
│   ├── layout/
│   │   ├── Header.tsx
│   │   ├── Footer.tsx
│   │   └── Sidebar.tsx
│   ├── features/
│   │   ├── VehicleCard.tsx
│   │   ├── AnalysisResult.tsx
│   │   └── ...
│   └── ui/
│       ├── Button.tsx
│       ├── Input.tsx
│       └── ...
│
├── services/                         # Service Layer (ALL LOGIC HERE)
│   ├── apiClient.ts                  # Base HTTP client
│   ├── authService.ts                # Authentication logic
│   ├── vehicleGarageService.ts       # Vehicle management logic
│   ├── damageAnalysisService.ts      # Damage analysis logic
│   ├── paintAnalysisService.ts       # Paint analysis logic
│   ├── comprehensiveExpertiseService.ts # Comprehensive expertise logic
│   └── index.ts
│
├── hooks/                            # Custom React Hooks (STATE MANAGEMENT)
│   ├── useAuth.ts
│   ├── useDamageAnalysis.ts
│   ├── useFileUpload.ts
│   └── ...
│
├── types/                            # TypeScript Type Definitions
│   ├── common.ts
│   ├── user.ts
│   ├── vehicle.ts
│   ├── report.ts
│   └── damageAnalysis.ts
│
├── utils/                            # Utility Functions
│   ├── dateUtils.ts
│   ├── fileUtils.ts
│   ├── formatting.ts
│   └── validation.ts
│
├── constants/                        # Constants
│   ├── apiEndpoints.ts
│   ├── formValidation.ts
│   └── uiConstants.ts
│
└── lib/                              # Third-party integrations
    ├── api.ts
    └── stores.ts
```

## 🏗️ Katman Sorumlulukları

### 1. **Services (TÜM LOGIC BURADA)**

#### Sorumluluklar:
- ✅ API çağrıları
- ✅ Data transformation
- ✅ Business logic
- ✅ Error handling
- ✅ Data formatting
- ✅ Calculations

#### Örnek Servis:

```typescript
// services/damageAnalysisService.ts
class DamageAnalysisService {
  async analyze(request: DamageAnalysisRequest): Promise<DamageAnalysisResponse> {
    // ✅ Form data oluşturma (LOGIC)
    const formData = new FormData();
    formData.append('image', request.image);
    
    // ✅ API çağrısı (LOGIC)
    const response = await apiClient.post('/api/damage-analysis', formData);
    
    // ✅ Error handling (LOGIC)
    if (!response.success) {
      throw new Error(response.error);
    }
    
    return response.data;
  }

  // ✅ Yardımcı metodlar (LOGIC)
  calculateTotalCost(areas: DamageArea[]): number {
    return areas.reduce((total, area) => total + area.cost, 0);
  }

  // ✅ Formatting (LOGIC)
  formatSeverity(severity: string): string {
    const labels = { low: 'Düşük', medium: 'Orta', high: 'Yüksek' };
    return labels[severity] || severity;
  }
}

export const damageAnalysisService = new DamageAnalysisService();
```

### 2. **Components (ZERO LOGIC - SADECE UI)**

#### Sorumluluklar:
- ✅ UI rendering
- ✅ Event triggering
- ✅ Props handling
- ❌ API calls (Service'e delege et)
- ❌ Data transformation (Service'e delege et)
- ❌ Calculations (Service'e delege et)

#### ❌ YANLIŞ Kullanım:

```typescript
// ❌ Component'te logic var
function DamageAnalysisPage() {
  const [data, setData] = useState(null);

  const analyze = async (image: File) => {
    // ❌ FormData oluşturma component'te
    const formData = new FormData();
    formData.append('image', image);
    
    // ❌ API çağrısı direkt component'te
    const response = await fetch('/api/damage-analysis', {
      method: 'POST',
      body: formData
    });
    
    // ❌ Data transformation component'te
    const result = await response.json();
    setData(result);
  };

  return <button onClick={() => analyze(image)}>Analiz Et</button>;
}
```

#### ✅ DOĞRU Kullanım:

```typescript
// ✅ Component sadece UI ve service çağrısı
import { damageAnalysisService } from '@/services';

function DamageAnalysisPage() {
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(false);

  const handleAnalyze = async (image: File) => {
    try {
      setLoading(true);
      
      // ✅ TÜM LOGIC SERVICE'TE
      const result = await damageAnalysisService.analyze({ image });
      
      setData(result);
    } catch (error) {
      console.error(error);
    } finally {
      setLoading(false);
    }
  };

  // ✅ SADECE UI RENDER
  return (
    <div>
      <FileUpload onUpload={handleAnalyze} disabled={loading} />
      {data && <AnalysisResult data={data} />}
    </div>
  );
}
```

### 3. **Hooks (STATE MANAGEMENT)**

#### Sorumluluklar:
- ✅ State management
- ✅ Side effects
- ✅ Reusable logic
- ✅ Service orchestration

#### Örnek Hook:

```typescript
// hooks/useDamageAnalysis.ts
export function useDamageAnalysis() {
  const [result, setResult] = useState<DamageAnalysisResponse | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const analyze = async (image: File) => {
    try {
      setLoading(true);
      setError(null);
      
      // ✅ Service'i çağır
      const data = await damageAnalysisService.analyze({ image });
      
      setResult(data);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Hata oluştu');
    } finally {
      setLoading(false);
    }
  };

  return { result, loading, error, analyze };
}

// Kullanım
function MyComponent() {
  const { result, loading, error, analyze } = useDamageAnalysis();
  
  return (
    <button onClick={() => analyze(file)} disabled={loading}>
      {loading ? 'Analiz ediliyor...' : 'Analiz Et'}
    </button>
  );
}
```

## 🔄 Data Flow (Component → Service → API)

```
User Action (onClick, onSubmit)
    ↓
Component Event Handler
    ↓
Service Method Call
    ↓
API Client (HTTP Request)
    ↓
Backend API
    ↓
API Client (HTTP Response)
    ↓
Service (Data Transform)
    ↓
Component (setState)
    ↓
UI Update
```

## ✅ Clean Code Prensipleri

### 1. **Zero Logic in Components**
```typescript
// ❌ YANLIŞ
function VehicleList() {
  const [vehicles, setVehicles] = useState([]);
  
  useEffect(() => {
    // ❌ API çağrısı component'te
    fetch('/api/vehicles')
      .then(res => res.json())
      .then(data => setVehicles(data));
  }, []);
}

// ✅ DOĞRU
function VehicleList() {
  const [vehicles, setVehicles] = useState([]);
  
  useEffect(() => {
    // ✅ Service kullan
    vehicleGarageService.getAll()
      .then(data => setVehicles(data));
  }, []);
}
```

### 2. **All Formatting in Services**
```typescript
// ❌ YANLIŞ - Component'te formatting
function DamageCard({ severity }: { severity: string }) {
  // ❌ Formatting logic component'te
  const label = severity === 'low' ? 'Düşük' : 
                severity === 'medium' ? 'Orta' : 'Yüksek';
  
  return <span>{label}</span>;
}

// ✅ DOĞRU - Service'te formatting
function DamageCard({ severity }: { severity: string }) {
  // ✅ Service formatting metodunu kullan
  const label = damageAnalysisService.formatSeverity(severity);
  
  return <span>{label}</span>;
}
```

### 3. **All Calculations in Services**
```typescript
// ❌ YANLIŞ - Component'te calculation
function RepairCostTotal({ damages }: { damages: DamageArea[] }) {
  // ❌ Calculation logic component'te
  const total = damages.reduce((sum, d) => sum + d.cost, 0);
  
  return <div>Toplam: {total} TL</div>;
}

// ✅ DOĞRU - Service'te calculation
function RepairCostTotal({ damages }: { damages: DamageArea[] }) {
  // ✅ Service calculation metodunu kullan
  const total = damageAnalysisService.calculateTotalCost(damages);
  
  return <div>Toplam: {total} TL</div>;
}
```

## 🎯 Servis Yazma Kuralları

### 1. **Her Servis Bir Class**
```typescript
class MyService {
  private readonly endpoint = '/api/my-endpoint';
  
  async getData(): Promise<MyData> {
    // Implementation
  }
}

export const myService = new MyService();
```

### 2. **Her Metod Async**
```typescript
class VehicleService {
  // ✅ Async method
  async getById(id: number): Promise<Vehicle> {
    const response = await apiClient.get(`/api/vehicles/${id}`);
    if (!response.success) throw new Error(response.error);
    return response.data;
  }
}
```

### 3. **Error Handling Her Zaman**
```typescript
class AnalysisService {
  async analyze(data: any): Promise<any> {
    const response = await apiClient.post('/api/analyze', data);
    
    // ✅ Error check
    if (!response.success || !response.data) {
      throw new Error(response.error || 'Analiz başarısız');
    }
    
    return response.data;
  }
}
```

### 4. **Helper Methods**
```typescript
class DamageAnalysisService {
  // Public API method
  async analyze(data: any): Promise<any> { ... }
  
  // ✅ Helper methods for UI
  formatSeverity(severity: string): string { ... }
  getSeverityColor(severity: string): string { ... }
  calculateTotalCost(areas: DamageArea[]): number { ... }
}
```

## 📚 Best Practices

### 1. **Component'ler Sadece UI**
- ✅ JSX render
- ✅ Event handling
- ✅ Props passing
- ❌ API calls
- ❌ Data transformation
- ❌ Business logic

### 2. **Service'ler Tüm Logic**
- ✅ API communication
- ✅ Data transformation
- ✅ Error handling
- ✅ Formatting
- ✅ Calculations
- ✅ Validation

### 3. **Hooks State Management**
- ✅ useState
- ✅ useEffect
- ✅ Custom hooks
- ✅ Service orchestration

### 4. **Types Everywhere**
- ✅ Request types
- ✅ Response types
- ✅ Component props types
- ❌ any kullanma

## 🚀 Örnek Akış

### Hasar Analizi Akışı:

```typescript
// 1. SERVICE
// services/damageAnalysisService.ts
class DamageAnalysisService {
  async analyze(image: File): Promise<DamageAnalysisResponse> {
    const formData = new FormData();
    formData.append('image', image);
    
    const response = await apiClient.post('/api/damage-analysis', formData);
    if (!response.success) throw new Error(response.error);
    
    return response.data;
  }
  
  calculateTotalCost(areas: DamageArea[]): number {
    return areas.reduce((sum, area) => sum + area.estimatedCost, 0);
  }
}

// 2. HOOK (Optional, for reusability)
// hooks/useDamageAnalysis.ts
export function useDamageAnalysis() {
  const [result, setResult] = useState(null);
  const [loading, setLoading] = useState(false);
  
  const analyze = async (image: File) => {
    setLoading(true);
    try {
      const data = await damageAnalysisService.analyze(image);
      setResult(data);
    } finally {
      setLoading(false);
    }
  };
  
  return { result, loading, analyze };
}

// 3. COMPONENT (Pure UI)
// app/vehicle/damage-analysis/page.tsx
export default function DamageAnalysisPage() {
  const { result, loading, analyze } = useDamageAnalysis();
  
  const handleFileSelect = async (file: File) => {
    await analyze(file);
  };
  
  return (
    <div>
      <FileUpload onFileSelect={handleFileSelect} disabled={loading} />
      {loading && <Spinner />}
      {result && (
        <AnalysisResult 
          data={result}
          totalCost={damageAnalysisService.calculateTotalCost(result.damageAreas)}
        />
      )}
    </div>
  );
}
```

## 🔐 Güvenlik

1. **Token Management** - apiClient'ta otomatik
2. **Input Validation** - Service'lerde
3. **Error Sanitization** - Kullanıcıya güvenli mesajlar
4. **File Validation** - Upload'lardan önce

## ⚡ Performans

1. **Memoization** - React.memo, useMemo
2. **Lazy Loading** - Dynamic imports
3. **Code Splitting** - Next.js otomatik
4. **Caching** - Service katmanında

