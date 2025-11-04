/**
 * Mock Data Factory
 * 
 * Test için mock data oluşturan factory fonksiyonları
 */

/**
 * Test kullanıcı kayıt verisi
 */
export function mockRegisterData() {
  return {
    email: 'newuser@example.com',
    password: 'password123',
    firstName: 'New',
    lastName: 'User',
    phone: '+905551234567',
  };
}

/**
 * Test kullanıcı giriş verisi
 */
export function mockLoginData(email: string = 'test@example.com', password: string = 'password123') {
  return {
    email,
    password,
  };
}

/**
 * Test profil güncelleme verisi
 */
export function mockProfileUpdateData() {
  return {
    firstName: 'Updated',
    lastName: 'Name',
    phone: '+905559876543',
  };
}

/**
 * Test şifre değiştirme verisi
 */
export function mockChangePasswordData() {
  return {
    currentPassword: 'password123',
    newPassword: 'newpassword123',
  };
}

/**
 * Test araç bilgisi
 */
export function mockVehicleInfo() {
  return {
    plate: '34ABC123',
    brand: 'Toyota',
    model: 'Corolla',
    year: 2020,
    color: 'White',
    mileage: 50000,
  };
}

/**
 * Test araç garaj verisi
 */
export function mockVehicleGarageData() {
  return {
    plate: '34ABC123',
    brand: 'Toyota',
    model: 'Corolla',
    year: 2020,
    color: 'White',
    mileage: 50000,
    vin: '1HGBH41JXMN109186',
    fuelType: 'Benzin',
    transmission: 'Otomatik',
    engineSize: '1.6',
    bodyType: 'Sedan',
    doors: 4,
    seats: 5,
    notes: 'Test araç notu',
    isDefault: false,
  };
}

/**
 * Test rapor oluşturma verisi
 */
export function mockCreateReportData(reportType: string = 'DAMAGE_ASSESSMENT') {
  return {
    reportType,
    vehiclePlate: '34ABC123',
    vehicleBrand: 'Toyota',
    vehicleModel: 'Corolla',
    vehicleYear: 2020,
    vehicleColor: 'White',
    mileage: 50000,
  };
}

/**
 * Test VIN decode verisi
 */
export function mockVINData() {
  return {
    vin: '1HGBH41JXMN109186',
  };
}

/**
 * Test iletişim formu verisi
 */
export function mockContactData() {
  return {
    name: 'Test User',
    email: 'contact@example.com',
    phone: '+905551234567',
    company: 'Test Company',
    subject: 'Test Subject',
    message: 'Test message content',
    inquiryType: 'GENERAL',
  };
}

/**
 * Test kariyer başvuru verisi
 */
export function mockCareerApplicationData() {
  return {
    name: 'Test Applicant',
    email: 'applicant@example.com',
    phone: '+905551234567',
    position: 'Software Engineer',
    department: 'Engineering',
    experience: 2,
    education: 'Bachelor',
    coverLetter: 'Test cover letter',
    linkedIn: 'https://linkedin.com/in/test',
    portfolio: 'https://portfolio.test.com',
  };
}

/**
 * Test ödeme verisi
 */
export function mockPaymentData() {
  return {
    amount: 100,
    paymentMethod: 'CREDIT_CARD',
  };
}

/**
 * Test admin kullanıcı güncelleme verisi
 */
export function mockAdminUserUpdateData() {
  return {
    role: 'ADMIN',
    isActive: true,
    credits: 1000,
  };
}

/**
 * Test rapor durumu güncelleme verisi
 */
export function mockReportStatusUpdateData() {
  return {
    status: 'COMPLETED',
    notes: 'Test admin notes',
  };
}

/**
 * Test servis fiyatlandırma verisi
 */
export function mockServicePricingData() {
  return {
    serviceType: 'DAMAGE_ASSESSMENT',
    basePrice: 50,
    isActive: true,
  };
}

/**
 * Fake image buffer oluşturur (test için)
 */
export function createFakeImageBuffer(): Buffer {
  // Minimal valid PNG header
  const pngHeader = Buffer.from([
    0x89, 0x50, 0x4E, 0x47, 0x0D, 0x0A, 0x1A, 0x0A,
    0x00, 0x00, 0x00, 0x0D, 0x49, 0x48, 0x44, 0x52,
    0x00, 0x00, 0x00, 0x01, 0x00, 0x00, 0x00, 0x01,
    0x08, 0x06, 0x00, 0x00, 0x00, 0x1F, 0x15, 0xC4,
    0x89, 0x00, 0x00, 0x00, 0x0A, 0x49, 0x44, 0x41,
    0x54, 0x78, 0x9C, 0x63, 0x00, 0x01, 0x00, 0x00,
    0x05, 0x00, 0x01, 0x0D, 0x0A, 0x2D, 0xB4, 0x00,
    0x00, 0x00, 0x00, 0x49, 0x45, 0x4E, 0x44, 0xAE,
    0x42, 0x60, 0x82
  ]);
  return pngHeader;
}

/**
 * Fake audio buffer oluşturur (test için)
 */
export function createFakeAudioBuffer(): Buffer {
  // Minimal valid WAV header
  const wavHeader = Buffer.alloc(44);
  wavHeader.write('RIFF', 0);
  wavHeader.writeUInt32LE(36, 4);
  wavHeader.write('WAVE', 8);
  wavHeader.write('fmt ', 12);
  wavHeader.writeUInt32LE(16, 16);
  wavHeader.writeUInt16LE(1, 20);
  wavHeader.writeUInt16LE(1, 22);
  wavHeader.writeUInt32LE(44100, 24);
  wavHeader.writeUInt32LE(88200, 28);
  wavHeader.writeUInt16LE(2, 32);
  wavHeader.writeUInt16LE(16, 34);
  wavHeader.write('data', 36);
  wavHeader.writeUInt32LE(0, 40);
  return wavHeader;
}

