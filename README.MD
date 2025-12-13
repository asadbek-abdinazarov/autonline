## AutOnline Platform

Qulay va zamonaviy haydovchilik imtihoniga tayyorgarlik platformasi.

### Xususiyatlar
- Mavzular bo‘limi: qisqa/uzun nomlar uchun qulay karta dizayni
- Testlar: mavzu bo‘yicha savollar
- Yangiliklar bo‘limi
- Foydalanuvchi profili va to‘lov tarixi


### Papkalar tuzilmasi (qisqacha)
- `app/` – Next.js routing va sahifalar
- `components/` – UI komponentlar
- `hooks/` – custom hook’lar
- `lib/` – util va API yordamchi funksiyalar

### Deployment

#### GitHub Actions CI/CD

Loyiha GitHub Actions orqali avtomatik deploy qilinadi. `master` branch'ga push qilinganda avtomatik ravishda Docker image build qilinadi va serverni yangilanadi.

##### GitHub Secrets sozlash

GitHub repository Settings > Secrets and variables > Actions bo'limiga quyidagi secrets'larni qo'shing:

- `DEPLOY_HOST` - Server IP yoki hostname (masalan: `192.168.1.100` yoki `example.com`)
- `DEPLOY_USER` - SSH user (masalan: `root`, `ubuntu`)
- `DEPLOY_SSH_KEY` - SSH private key (tug'ri formatda, yangi qatorlar bilan)
- `DEPLOY_PORT` - SSH port (ixtiyoriy, default: `22`)
- `DEPLOY_PATH` - Serverda loyiha joylashgan path (masalan: `/var/www/autonline-platform`)
- `NEXT_PUBLIC_API_BASE_URL` - Backend API URL (production uchun, masalan: `https://api.example.com`)

##### SSH Key yaratish

Agar SSH key yo'q bo'lsa:

```bash
ssh-keygen -t ed25519 -C "github-actions"
```

Public key'ni serverga qo'shing:

```bash
ssh-copy-id -i ~/.ssh/id_ed25519.pub user@your-server
```

Private key'ni GitHub Secrets'ga qo'shing.

##### Server sozlash

Serverni Docker bilan sozlash kerak:

```bash
# Docker o'rnatish (Ubuntu/Debian)
sudo apt update
sudo apt install -y docker.io docker-compose
sudo systemctl enable docker
sudo systemctl start docker

# Docker Compose o'rnatish (agar kerak bo'lsa)
sudo curl -L "https://github.com/docker/compose/releases/latest/download/docker-compose-$(uname -s)-$(uname -m)" -o /usr/local/bin/docker-compose
sudo chmod +x /usr/local/bin/docker-compose
```

##### Manual Deployment

Agar GitHub Actions ishlamasa, manual deploy qilish:

```bash
# Docker image build qilish
docker build -t autonline-platform:latest .

# Container'ni ishga tushirish
docker run -d \
  --name autonline-platform \
  --restart unless-stopped \
  -p 3000:3000 \
  -e NODE_ENV=production \
  -e NEXT_PUBLIC_API_BASE_URL=https://api.example.com \
  autonline-platform:latest
```

Yoki docker-compose bilan:

```bash
docker-compose up -d
```

##### Container boshqarish

```bash
# Container'ni ko'rish
docker ps

# Log'larni ko'rish
docker logs autonline-platform

# Container'ni to'xtatish
docker stop autonline-platform

# Container'ni o'chirish
docker rm autonline-platform

# Image'ni yangilash
docker pull autonline-platform:latest
docker-compose up -d
```

### Litsenziya
Bu loyiha shaxsiy/proyekt ehtiyojlari uchun mo‘ljallangan.




