// HIZLI LOCALSTORAGE TEMİZLEME SCRIPT'İ
// Bu script'i browser console'da çalıştırın

console.log('🧹 localStorage temizleniyor...');

// Tüm auth verilerini temizle
localStorage.removeItem('auth_token');
localStorage.removeItem('user');
localStorage.removeItem('refresh_token');
localStorage.removeItem('globalVehicleImages');

// Diğer potansiyel bozuk verileri de temizle
Object.keys(localStorage).forEach(key => {
  if (key.includes('auth') || key.includes('token') || key.includes('user')) {
    localStorage.removeItem(key);
  }
});

console.log('✅ localStorage başarıyla temizlendi!');
console.log('🔄 Sayfa yenileniyor...');

// Sayfayı yenile
setTimeout(() => {
  window.location.reload();
}, 1000);
