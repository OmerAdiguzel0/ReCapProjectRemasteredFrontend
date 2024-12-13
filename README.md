# ReCap Project - Frontend

## 🚀 Proje Açıklaması
Bu proje, araç kiralama sisteminin frontend tarafını oluşturan, **React** ve **Material-UI** ile geliştirilmiş modern bir web uygulamasıdır. Kullanıcı dostu arayüzü ve responsive tasarımı ile hem masaüstü hem de mobil cihazlarda optimum kullanım sağlar.

---

## 📦 Proje Yapısı
```
frontend/
├── src/
│   ├── api/          # API istekleri
│   ├── components/   # Yeniden kullanılabilir bileşenler
│   ├── context/      # Context API tanımlamaları
│   ├── pages/        # Sayfa bileşenleri
│   ├── utils/        # Yardımcı fonksiyonlar
│   └── App.js        # Ana uygulama bileşeni
```

---

## 🛠 Teknolojiler
- **React 18**
- **Material-UI (MUI)**
- **React Router v6**
- **Axios**
- **JWT-Decode**
- **Date-FNS**
- **React Context API**

---

## ⚙️ Kurulum

1. Projeyi klonlayın:
   ```bash
   git clone https://github.com/OmerAdiguzel0/ReCapProjectRemasteredFrontend.git
   ```

2. Bağımlılıkları yükleyin:
   ```bash
   cd frontend
   npm install
   ```

3. Geliştirme sunucusunu başlatın:
   ```bash
   npm start
   ```

---

## 📱 Sayfalar ve Özellikler

### **Ana Sayfa**
- Öne çıkan araçlar
- Hızlı arama
- Kategori filtreleme
- Responsive slider

### **Araç Listeleme**
- Detaylı filtreleme
- Sıralama seçenekleri
- Araç kartları
- Sayfalama

### **Araç Detay**
- Araç görselleri galerisi
- Teknik özellikler
- Fiyat bilgisi
- Kiralama formu

### **Kullanıcı Profili**
- Profil bilgileri düzenleme
- Profil fotoğrafı yükleme
- Şifre değiştirme
- Kiralama geçmişi

### **Admin Paneli**
- Araç yönetimi
- Kullanıcı yönetimi
- İstatistikler
- Sistem ayarları

---

## 🔒 Güvenlik ve Kimlik Doğrulama

### **JWT Yönetimi**
```javascript
// api/index.js
axios.interceptors.request.use(
    config => {
        const token = localStorage.getItem('token');
        if (token) {
            config.headers.Authorization = `Bearer ${token}`;
        }
        return config;
    }
);
```

### **Korumalı Rotalar**
```javascript
// components/ProtectedRoute.js
function ProtectedRoute({ children, requiredRole }) {
    const userLoggedIn = isLoggedIn() && checkTokenExpiration();

    if (!userLoggedIn) {
        return <Navigate to="/login" />;
    }

    if (requiredRole === 'admin' && !isAdmin()) {
        return <Navigate to="/" />;
    }

    return children;
}
```

---

## 🎨 Tema ve Stil Yönetimi

### **Tema Konfigürasyonu**
```javascript
// context/ThemeContext.js
const theme = createTheme({
    palette: {
        primary: {
            main: '#1976d2',
        },
        secondary: {
            main: '#dc004e',
        },
    },
});
```

### **Responsive Tasarım**
- Mobile-first yaklaşım
- Breakpoint yönetimi
- Esnek grid sistemi

---

## 📡 API Entegrasyonu

### **API İstekleri**
```javascript
// api/index.js
const api = {
    getCars: async () => {
        return await axios.get(`${BASE_URL}/cars`);
    },
    rentCar: async (rentalData) => {
        return await axios.post(`${BASE_URL}/rentals`, rentalData);
    }
    // ... diğer API çağrıları
};
```

---

## 🔄 State Yönetimi

### **Context Kullanımı**
```javascript
// context/AuthContext.js
export const AuthProvider = ({ children }) => {
    const [user, setUser] = useState(null);
    const [loading, setLoading] = useState(true);

    // ... auth logic

    return (
        <AuthContext.Provider value={{ user, login, logout }}>
            {children}
        </AuthContext.Provider>
    );
};
```

---

## 📊 Form Yönetimi
- Form validasyonu
- Hata mesajları
- Async form submission
- File upload

---

## 🌐 Dil Desteği
- Türkçe arayüz
- Çoklu dil desteğine hazır yapı
- Tarih ve para birimi formatlaması

---

## 🔍 SEO Optimizasyonu
- Meta tag yönetimi
- Semantic HTML kullanımı
- Performans optimizasyonu

---

## 📱 Progressive Web App (PWA)
- Offline kullanım
- App-like deneyim
- Push notifications (opsiyonel)

---

## 🚀 Performans Optimizasyonu
- Lazy loading
- Code splitting
- Image optimization
- Caching stratejileri

---

## 🧪 Test

### **Test Çalıştırma**
```bash
# Unit testleri çalıştır
npm test

# Test coverage raporu
npm test -- --coverage
```

---

## 📦 Build ve Deploy

### **Production Build**
```bash
npm run build
```

### **Build'i Sunma**
```bash
serve -s build
```

---

## 📄 Lisans
Bu proje **MIT lisansı** altında lisanslanmıştır.

---


