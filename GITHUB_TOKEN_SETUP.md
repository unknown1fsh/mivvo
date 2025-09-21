# 🔑 GitHub Personal Access Token Setup Rehberi

## 🚨 Sorun
Collaborator olarak eklendikten sonra hala 403 hatası alıyorsanız, authentication sorunu var.

## ✅ Çözüm: Personal Access Token Oluşturun

### 1️⃣ **GitHub'da Token Oluşturun**

1. **GitHub'a giriş yapın**: https://github.com
2. **Sağ üst profil** → **Settings**
3. **Sol menüde**: **Developer settings**
4. **Personal access tokens** → **Tokens (classic)**
5. **Generate new token** → **Generate new token (classic)**

### 2️⃣ **Token Ayarları**

```
Token name: Mivvo Development
Expiration: 90 days (veya No expiration)

Permissions (Scopes):
☑️ repo (Full control of private repositories)
☑️ workflow (Update GitHub Action workflows)
```

### 3️⃣ **Token'ı Kopyalayın**
⚠️ **ÖNEMLİ**: Token'ı hemen kopyalayın, bir daha göremezsiniz!

### 4️⃣ **Git'e Token'ı Ekleyin**

Şimdi push yapmayı deneyin:
```bash
git push origin master
```

**Username sorarsa**: `ercanerguler-design`  
**Password sorarsa**: **Token'ı yapıştırın** (şifre değil!)

### 5️⃣ **Token'ı Kalıcı Olarak Kaydet**

Push başarılı olduktan sonra Windows Credential Manager'a otomatik kaydedilir.

## 🔧 **Alternatif: SSH Key Setup**

Token istemezseniz SSH key de kullanabilirsiniz:

```bash
# SSH key oluşturun
ssh-keygen -t ed25519 -C "ercanerguler.design@gmail.com"

# Public key'i kopyalayın
cat ~/.ssh/id_ed25519.pub

# GitHub Settings → SSH Keys → Add SSH Key'e yapıştırın

# Remote URL'i SSH'a çevirin
git remote set-url origin git@github.com:unknown1fsh/mivvo.git
```

## 🚀 **Hızlı Test**

Token/SSH setup'tan sonra test edin:
```bash
# Authentication test
git ls-remote origin

# Push test  
git push origin master
```

## 🆘 **Hala Çalışmıyorsa**

1. **Collaborator rolünüzü kontrol edin**: Repository Settings'de "Write" yetkisi var mı?
2. **Cache temizleyin**: `git credential-manager-core erase`  
3. **Browser'da GitHub'a giriş yapın**: Session aktif mi?

---
💡 **En kolay çözüm**: Personal Access Token oluşturup kullanmak!