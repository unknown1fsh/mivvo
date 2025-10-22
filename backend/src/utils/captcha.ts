import axios from 'axios'

export async function verifyCaptcha(token: string): Promise<boolean> {
  try {
    const response = await axios.post(
      'https://www.google.com/recaptcha/api/siteverify',
      null,
      {
        params: {
          secret: process.env.RECAPTCHA_SECRET_KEY,
          response: token
        }
      }
    )
    
    return response.data.success && response.data.score >= 0.5
  } catch (error) {
    console.error('CAPTCHA verification error:', error)
    return false
  }
}
