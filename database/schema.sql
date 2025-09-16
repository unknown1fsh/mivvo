-- Mivvo Expertiz Uygulaması Veritabanı Şeması
-- MySQL 8.0 için optimize edilmiş

USE mivvo_expertiz;

-- Kullanıcılar tablosu
CREATE TABLE users (
    id INT PRIMARY KEY AUTO_INCREMENT,
    email VARCHAR(255) UNIQUE NOT NULL,
    password_hash VARCHAR(255) NOT NULL,
    first_name VARCHAR(100) NOT NULL,
    last_name VARCHAR(100) NOT NULL,
    phone VARCHAR(20),
    role ENUM('user', 'admin', 'expert') DEFAULT 'user',
    is_active BOOLEAN DEFAULT TRUE,
    email_verified BOOLEAN DEFAULT FALSE,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    INDEX idx_email (email),
    INDEX idx_role (role)
);

-- Kullanıcı kredi bakiyeleri
CREATE TABLE user_credits (
    id INT PRIMARY KEY AUTO_INCREMENT,
    user_id INT NOT NULL,
    balance DECIMAL(10,2) DEFAULT 0.00,
    total_purchased DECIMAL(10,2) DEFAULT 0.00,
    total_used DECIMAL(10,2) DEFAULT 0.00,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE,
    INDEX idx_user_id (user_id)
);

-- Kredi işlemleri (satın alma ve kullanım)
CREATE TABLE credit_transactions (
    id INT PRIMARY KEY AUTO_INCREMENT,
    user_id INT NOT NULL,
    transaction_type ENUM('purchase', 'usage', 'refund') NOT NULL,
    amount DECIMAL(10,2) NOT NULL,
    description TEXT,
    reference_id VARCHAR(100), -- Ödeme referansı veya işlem ID'si
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE,
    INDEX idx_user_id (user_id),
    INDEX idx_type (transaction_type),
    INDEX idx_created_at (created_at)
);

-- Araç expertiz raporları
CREATE TABLE vehicle_reports (
    id INT PRIMARY KEY AUTO_INCREMENT,
    user_id INT NOT NULL,
    vehicle_plate VARCHAR(20),
    vehicle_brand VARCHAR(100),
    vehicle_model VARCHAR(100),
    vehicle_year INT,
    vehicle_color VARCHAR(50),
    mileage INT,
    report_type ENUM('full', 'paint_analysis', 'damage_assessment', 'value_estimation') NOT NULL,
    status ENUM('pending', 'processing', 'completed', 'failed') DEFAULT 'pending',
    ai_analysis_data JSON, -- AI analiz sonuçları
    expert_notes TEXT,
    total_cost DECIMAL(10,2) NOT NULL,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE,
    INDEX idx_user_id (user_id),
    INDEX idx_status (status),
    INDEX idx_report_type (report_type),
    INDEX idx_created_at (created_at)
);

-- Yüklenen resimler
CREATE TABLE vehicle_images (
    id INT PRIMARY KEY AUTO_INCREMENT,
    report_id INT NOT NULL,
    image_url VARCHAR(500) NOT NULL,
    image_type ENUM('exterior', 'interior', 'engine', 'damage', 'paint') NOT NULL,
    file_size INT,
    upload_date TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    ai_processed BOOLEAN DEFAULT FALSE,
    FOREIGN KEY (report_id) REFERENCES vehicle_reports(id) ON DELETE CASCADE,
    INDEX idx_report_id (report_id),
    INDEX idx_image_type (image_type)
);

-- AI analiz sonuçları detayları
CREATE TABLE ai_analysis_results (
    id INT PRIMARY KEY AUTO_INCREMENT,
    report_id INT NOT NULL,
    analysis_type VARCHAR(100) NOT NULL, -- 'paint_condition', 'damage_detection', 'value_estimation' vb.
    confidence_score DECIMAL(5,2), -- 0-100 arası güven skoru
    result_data JSON NOT NULL, -- Detaylı analiz sonuçları
    processing_time_ms INT,
    model_version VARCHAR(50),
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (report_id) REFERENCES vehicle_reports(id) ON DELETE CASCADE,
    INDEX idx_report_id (report_id),
    INDEX idx_analysis_type (analysis_type)
);

-- Servis fiyatlandırması
CREATE TABLE service_pricing (
    id INT PRIMARY KEY AUTO_INCREMENT,
    service_name VARCHAR(100) NOT NULL,
    service_type ENUM('paint_analysis', 'damage_assessment', 'value_estimation', 'full_report') NOT NULL,
    base_price DECIMAL(10,2) NOT NULL,
    currency VARCHAR(3) DEFAULT 'TRY',
    is_active BOOLEAN DEFAULT TRUE,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    INDEX idx_service_type (service_type),
    INDEX idx_is_active (is_active)
);

-- Sistem ayarları
CREATE TABLE system_settings (
    id INT PRIMARY KEY AUTO_INCREMENT,
    setting_key VARCHAR(100) UNIQUE NOT NULL,
    setting_value TEXT,
    setting_type ENUM('string', 'number', 'boolean', 'json') DEFAULT 'string',
    description TEXT,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
);

-- Ödeme işlemleri
CREATE TABLE payments (
    id INT PRIMARY KEY AUTO_INCREMENT,
    user_id INT NOT NULL,
    amount DECIMAL(10,2) NOT NULL,
    currency VARCHAR(3) DEFAULT 'TRY',
    payment_method ENUM('credit_card', 'bank_transfer', 'digital_wallet') NOT NULL,
    payment_status ENUM('pending', 'completed', 'failed', 'refunded') DEFAULT 'pending',
    payment_provider VARCHAR(50), -- 'iyzico', 'paypal' vb.
    transaction_id VARCHAR(200),
    reference_number VARCHAR(100),
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE,
    INDEX idx_user_id (user_id),
    INDEX idx_payment_status (payment_status),
    INDEX idx_transaction_id (transaction_id)
);

-- Varsayılan servis fiyatları
INSERT INTO service_pricing (service_name, service_type, base_price) VALUES
('Boya Analizi', 'paint_analysis', 25.00),
('Hasar Değerlendirmesi', 'damage_assessment', 35.00),
('Değer Tahmini', 'value_estimation', 20.00),
('Tam Expertiz Raporu', 'full_report', 75.00);

-- Varsayılan sistem ayarları
INSERT INTO system_settings (setting_key, setting_value, setting_type, description) VALUES
('min_credit_purchase', '50', 'number', 'Minimum kredi satın alma tutarı'),
('max_credit_purchase', '5000', 'number', 'Maksimum kredi satın alma tutarı'),
('credit_to_try_rate', '1', 'number', '1 kredi = 1 TL'),
('ai_processing_timeout', '300', 'number', 'AI işlem timeout süresi (saniye)'),
('max_image_size_mb', '10', 'number', 'Maksimum resim boyutu (MB)'),
('supported_image_formats', '["jpg", "jpeg", "png", "webp"]', 'json', 'Desteklenen resim formatları');
