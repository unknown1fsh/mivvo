// Admin kullanıcısının şifresini test için güncelle
import { PrismaClient } from '@prisma/client'
import bcrypt from 'bcryptjs'

const prisma = new PrismaClient()

async function updateAdminPassword() {
  try {
    // Admin kullanıcısını bul
    const adminUser = await prisma.user.findFirst({
      where: {
        email: 'slmsrcncnr@gmail.com',
        role: 'ADMIN'
      }
    })
    
    if (adminUser) {
      console.log(`Admin kullanıcı bulundu: ${adminUser.email}`)
      
      // Şifreyi "password" olarak güncelle
      const hashedPassword = await bcrypt.hash('password', 10)
      
      await prisma.user.update({
        where: { id: adminUser.id },
        data: { passwordHash: hashedPassword }
      })
      
      console.log('Admin şifresi "password" olarak güncellendi!')
      console.log('Test için kullanın:')
      console.log('- Email: slmsrcncnr@gmail.com')
      console.log('- Şifre: password')
    } else {
      console.log('Admin kullanıcı bulunamadı!')
    }
    
  } catch (error) {
    console.error('Hata:', error)
  } finally {
    await prisma.$disconnect()
  }
}

updateAdminPassword()
