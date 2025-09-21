# 🔒 Güvenli Git Push Rehberi

## ✅ Bu Commit'te Değişen Dosyalar

### 📝 Commit Edilecek Dosyalar:
- `.gitignore` → .env dosyalarını ignore ediyor
- `README.md` → Kurulum talimatları güncellendi
- `backend/env.example` → Template dosya (şifreler yok)
- `frontend/.env.example` → Template dosya (şifreler yok) 
- `package.json` → Local development script'leri
- `LOCAL_DEVELOPMENT.md` → Local geliştirme kılavuzu
- `VERCEL_SECURITY_GUIDE.md` → Deployment kılavuzu
- `deploy-safe.ps1/sh` → Deployment güvenlik script'leri
- `env.production.example` → Production template

### ❌ Commit EDİLMEYECEK Dosyalar:
- `backend/.env` → Git ignore ediyor (local şifreler var)
- `frontend/.env` → Git ignore ediyor (local config)

## 🔍 Push Öncesi Kontrol

```bash
# 1. Status kontrol - .env dosyaları görünmemeli
git status

# 2. Hangi dosyalar commit edilecek kontrol et
git diff --cached

# 3. .env dosyalarının ignore edildiğini kontrol et
git check-ignore backend/.env
git check-ignore frontend/.env
```

## ✅ Güvenli Commit Komutu

```bash
# Sadece güvenli dosyaları add et
git add .gitignore README.md package.json LOCAL_DEVELOPMENT.md
git add backend/env.example frontend/.env.example 
git add VERCEL_SECURITY_GUIDE.md deploy-safe.*
git add env.production.example

# Commit message
git commit -m "feat: Local development environment setup

- Add .env.example templates for each developer
- Update .gitignore to protect local .env files  
- Add local development guide (LOCAL_DEVELOPMENT.md)
- Add Vercel deployment security guide
- Update README with proper setup instructions
- Add development scripts to package.json

Each developer now creates their own .env with their DB password"

# Push
git push origin master
```

## 🎯 Bu Push Sonrası Arkadaşınız:

1. ✅ `git pull` yapabilir güvenle
2. ✅ `cp backend/env.example backend/.env` ile kendi .env'ini oluşturur  
3. ✅ Kendi database şifresini .env'e yazar
4. ✅ Vercel deployment'ı etkilenmez
5. ✅ Kimsenin local .env'i başkasını etkilemez

## 🚨 Eğer Hata Yaparsanız:

```bash
# Son commit'i geri al (henüz push etmediyseniz)
git reset --soft HEAD~1

# Specific dosyayı unstage et
git reset HEAD backend/.env
```

---
✅ **Bu rehber sayesinde safe push yapabilirsiniz!**