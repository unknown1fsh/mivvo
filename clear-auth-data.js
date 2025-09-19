// Browser'da localStorage'ı temizlemek için bu script'i çalıştırın
// Developer Tools > Console'da çalıştırın

console.log('Auth verileri temizleniyor...');

// Tüm auth verilerini temizle
localStorage.removeItem('auth_token');
localStorage.removeItem('user');
localStorage.removeItem('refresh_token');

// Diğer potansiyel verileri de temizle
localStorage.removeItem('globalVehicleImages');
localStorage.removeItem('auth_token_backup');

console.log('✅ Auth verileri başarıyla temizlendi!');
console.log('Sayfayı yenileyin ve tekrar giriş yapmayı deneyin.');

// Sayfayı yenile
window.location.reload();
