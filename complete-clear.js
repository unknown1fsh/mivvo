// KESIN ÇÖZÜM - localStorage Temizleme Script'i
// Bu script'i browser console'da çalıştırın

console.log('🧹 localStorage tamamen temizleniyor...');

// Tüm localStorage'ı temizle
localStorage.clear();

// Session storage'ı da temizle
sessionStorage.clear();

// Cookie'leri de temizle (eğer varsa)
document.cookie.split(";").forEach(function(c) { 
  document.cookie = c.replace(/^ +/, "").replace(/=.*/, "=;expires=" + new Date().toUTCString() + ";path=/"); 
});

console.log('✅ Tüm storage temizlendi!');
console.log('🔄 Sayfa yenileniyor...');

// Sayfayı yenile
setTimeout(() => {
  window.location.href = '/login';
}, 1000);
