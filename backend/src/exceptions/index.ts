/**
 * Exception Katmanı - Index
 * 
 * Clean Architecture - Exception Layer (Hata Yönetim Katmanı)
 * 
 * Tüm custom exception sınıflarının merkezi export noktası.
 * 
 * Bu dosya sayesinde diğer katmanlar exception'ları şu şekilde import edebilir:
 * import { 
 *   NotFoundException, 
 *   UnauthorizedException, 
 *   InsufficientCreditsException 
 * } from '@/exceptions';
 * 
 * Exception hiyerarşisi:
 * 
 * BaseException (abstract)
 * ├── HTTP Exceptions (standart HTTP hataları)
 * │   ├── BadRequestException (400)
 * │   ├── UnauthorizedException (401)
 * │   ├── ForbiddenException (403)
 * │   ├── NotFoundException (404)
 * │   ├── ConflictException (409)
 * │   ├── ValidationException (422)
 * │   ├── InternalServerException (500)
 * │   └── ServiceUnavailableException (503)
 * │
 * └── Business Exceptions (iş mantığı hataları)
 *     ├── InsufficientCreditsException (402)
 *     ├── AIServiceException (503)
 *     ├── FileUploadException (400)
 *     ├── FileNotFoundException (404)
 *     ├── InvalidFileTypeException (400)
 *     ├── PaymentException (402)
 *     ├── DatabaseException (500)
 *     ├── EmailAlreadyExistsException (409)
 *     ├── InvalidCredentialsException (401)
 *     ├── AccountInactiveException (403)
 *     ├── VINNotFoundException (404)
 *     ├── ReportNotFoundException (404)
 *     ├── VehicleNotFoundException (404)
 *     └── PlateAlreadyExistsException (409)
 * 
 * Kullanım:
 * Service katmanında: throw new InsufficientCreditsException('Bakiyeniz yetersiz');
 * ErrorHandler middleware: exception.statusCode ile HTTP status döndürür
 */

// Base Exception (Tüm exception'ların parent'ı)
export { BaseException } from './BaseException';

// HTTP Exceptions (Standart HTTP hataları)
export {
  BadRequestException,
  UnauthorizedException,
  ForbiddenException,
  NotFoundException,
  ConflictException,
  ValidationException,
  InternalServerException,
  ServiceUnavailableException,
} from './HttpExceptions';

// Business Exceptions (İş mantığı hataları - Uygulamaya özel)
export {
  InsufficientCreditsException,
  AIServiceException,
  FileUploadException,
  FileNotFoundException,
  InvalidFileTypeException,
  PaymentException,
  DatabaseException,
  EmailAlreadyExistsException,
  InvalidCredentialsException,
  AccountInactiveException,
  VINNotFoundException,
  ReportNotFoundException,
  VehicleNotFoundException,
  PlateAlreadyExistsException,
} from './BusinessExceptions';
