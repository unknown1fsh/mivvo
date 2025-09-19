// Browser Console'da çalıştırın:
// localStorage.clear();
// console.log('LocalStorage temizlendi');

// Veya sadece auth verilerini temizlemek için:
localStorage.removeItem('auth_token');
localStorage.removeItem('user');
localStorage.removeItem('refresh_token');
console.log('Auth verileri temizlendi');
