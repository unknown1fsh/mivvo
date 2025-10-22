// Admin kullanıcısının role değerini kontrol et ve güncelle
import { PrismaClient } from '@prisma/client'

const prisma = new PrismaClient()

async function checkAndUpdateAdminRole() {
  try {
    // Tüm kullanıcıları listele
    const users = await prisma.user.findMany({
      select: {
        id: true,
        email: true,
        role: true,
        firstName: true,
        lastName: true
      }
    })
    
    console.log('Tüm kullanıcılar:')
    users.forEach(user => {
      console.log(`ID: ${user.id}, Email: ${user.email}, Role: ${user.role}, Name: ${user.firstName} ${user.lastName}`)
    })
    
    // Admin kullanıcısını bul ve güncelle
    const adminUser = await prisma.user.findFirst({
      where: {
        OR: [
          { email: 'admin@example.com' },
          { email: 'admin@mivvo.com' },
          { role: 'ADMIN' }
        ]
      }
    })
    
    if (adminUser) {
      console.log(`\nAdmin kullanıcı bulundu: ${adminUser.email}, Role: ${adminUser.role}`)
      
      // Role'ü ADMIN olarak güncelle
      if (adminUser.role !== 'ADMIN') {
        await prisma.user.update({
          where: { id: adminUser.id },
          data: { role: 'ADMIN' }
        })
        console.log('Admin role güncellendi!')
      } else {
        console.log('Admin role zaten doğru!')
      }
    } else {
      console.log('\nAdmin kullanıcı bulunamadı!')
      
      // Yeni admin kullanıcı oluştur
      const newAdmin = await prisma.user.create({
        data: {
          email: 'admin@mivvo.com',
          passwordHash: '$2b$10$92IXUNpkjO0rOQ5byMi.Ye4oKoEa3Ro9llC/.og/at2.uheWG/igi', // password
          firstName: 'Admin',
          lastName: 'User',
          role: 'ADMIN',
          isActive: true,
          emailVerified: true
        }
      })
      
      console.log(`Yeni admin kullanıcı oluşturuldu: ${newAdmin.email}`)
    }
    
  } catch (error) {
    console.error('Hata:', error)
  } finally {
    await prisma.$disconnect()
  }
}

checkAndUpdateAdminRole()
