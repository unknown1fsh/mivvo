// Environment variables debug scripti
console.log('🔍 Environment Variables Debug:');
console.log('NODE_ENV:', process.env.NODE_ENV);
console.log('NEXT_PUBLIC_API_URL:', process.env.NEXT_PUBLIC_API_URL);
console.log('RAILWAY_PUBLIC_DOMAIN:', process.env.RAILWAY_PUBLIC_DOMAIN);
console.log('RAILWAY_PRIVATE_DOMAIN:', process.env.RAILWAY_PRIVATE_DOMAIN);

// API Client debug
import { apiClient } from './services/apiClient';
console.log('API Client Base URL:', apiClient.baseURL);

// Test API call
console.log('🧪 Testing API call...');
apiClient.get('/api/health')
  .then(response => {
    console.log('✅ API Health Check Success:', response.data);
  })
  .catch(error => {
    console.error('❌ API Health Check Failed:', error.message);
  });
