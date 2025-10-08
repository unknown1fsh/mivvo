/**
 * Repository Katmanı - Index
 * 
 * Clean Architecture - Repository Layer (Veri Erişim Katmanı)
 * 
 * Tüm repository sınıflarının merkezi export noktası.
 * 
 * Bu dosya sayesinde diğer katmanlar repository'leri şu şekilde import edebilir:
 * import { UserRepository, VehicleReportRepository } from '@/repositories';
 * 
 * Ayrıca Prisma entity tiplerini de re-export eder, böylece:
 * import type { User, VehicleReport } from '@/repositories';
 * şeklinde kullanılabilir.
 * 
 * Spring Framework'teki Repository package'ına benzer yapı.
 */

// Repository sınıflarını export et
export { BaseRepository } from './BaseRepository';
export { UserRepository } from './UserRepository';
export { VehicleReportRepository } from './VehicleReportRepository';
export { VehicleGarageRepository } from './VehicleGarageRepository';

// Prisma entity tiplerini re-export et (kolaylık için)
// Service katmanında tip tanımlarken kullanılır
export type { User, VehicleReport, VehicleGarage } from '@prisma/client';

