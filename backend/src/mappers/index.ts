/**
 * Mapper Katmanı - Index
 * 
 * Clean Architecture - Mapper Layer (Dönüşüm Katmanı)
 * 
 * Tüm mapper sınıflarının merkezi export noktası.
 * 
 * Bu dosya sayesinde diğer katmanlar mapper'ları şu şekilde import edebilir:
 * import { UserMapper, VehicleMapper, AnalysisMapper } from '@/mappers';
 * 
 * Mapper'lar, Entity ↔ DTO dönüşümlerini yapar:
 * - UserMapper: User entity ↔ UserInfoDTO
 * - VehicleMapper: VehicleGarage entity ↔ Vehicle Response DTO
 * - AnalysisMapper: AI Results ↔ Analysis Response DTOs
 * 
 * Spring Framework'teki ModelMapper package'ına benzer yapı.
 */

// Tüm mapper sınıflarını export et
export { UserMapper } from './UserMapper';
export { VehicleMapper } from './VehicleMapper';
export { AnalysisMapper } from './AnalysisMapper';

