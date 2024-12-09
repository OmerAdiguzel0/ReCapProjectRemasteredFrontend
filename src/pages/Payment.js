import React, { useState, useEffect } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import {
  Container,
  Paper,
  Typography,
  Grid,
  TextField,
  Button,
  Box,
  Alert,
  Card,
  CardContent,
  Divider,
  CircularProgress
} from '@mui/material';
import CreditCardIcon from '@mui/icons-material/CreditCard';
import PaymentIcon from '@mui/icons-material/Payment';
import ReceiptIcon from '@mui/icons-material/Receipt';
import DownloadIcon from '@mui/icons-material/Download';
import CheckCircleIcon from '@mui/icons-material/CheckCircle';
import api from '../api/index';
import jsPDF from 'jspdf';
import 'jspdf-autotable';
import { format } from 'date-fns';
import { tr } from 'date-fns/locale';

function Payment() {
  const location = useLocation();
  const navigate = useNavigate();
  const { selectedCar, rentalDetails } = location.state || {};
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState(false);
  const [paymentCompleted, setPaymentCompleted] = useState(false);
  const [invoiceData, setInvoiceData] = useState(null);
  const [user, setUser] = useState(null);

  // Kredi kartı bilgileri için state
  const [cardInfo, setCardInfo] = useState({
    cardNumber: '',
    cardHolder: '',
    expiryMonth: '',
    expiryYear: '',
    cvv: ''
  });

  useEffect(() => {
    // Kullanıcı ve araç bilgilerini kontrol et
    const userStr = localStorage.getItem('user');
    if (!userStr || !selectedCar || !rentalDetails) {
      navigate('/cars');
      return;
    }

    // Kullanıcı bilgilerini set et
    setUser(JSON.parse(userStr));
  }, [selectedCar, rentalDetails, navigate]);

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    
    // Kart numarası için sadece rakam girişi
    if (name === 'cardNumber') {
      const cleaned = value.replace(/\D/g, '');
      if (cleaned.length <= 16) {
        setCardInfo(prev => ({ ...prev, [name]: cleaned }));
      }
      return;
    }

    // CVV için sadece rakam girişi
    if (name === 'cvv') {
      const cleaned = value.replace(/\D/g, '');
      if (cleaned.length <= 3) {
        setCardInfo(prev => ({ ...prev, [name]: cleaned }));
      }
      return;
    }

    // Ay seçimi kontrolü
    if (name === 'expiryMonth') {
      const cleaned = value.replace(/\D/g, '');
      if (cleaned === '' || (parseInt(cleaned) >= 1 && parseInt(cleaned) <= 12)) {
        setCardInfo(prev => ({ ...prev, [name]: cleaned }));
      }
      return;
    }

    // Yıl seçimi kontrolü
    if (name === 'expiryYear') {
      const cleaned = value.replace(/\D/g, '');
      if (cleaned.length <= 2) {
        setCardInfo(prev => ({ ...prev, [name]: cleaned }));
      }
      return;
    }

    setCardInfo(prev => ({ ...prev, [name]: value }));
  };

  const validateForm = () => {
    if (!cardInfo.cardNumber || cardInfo.cardNumber.length !== 16) {
      setError('Geçerli bir kart numarası giriniz');
      return false;
    }
    if (!cardInfo.cardHolder.trim()) {
      setError('Kart sahibi adını giriniz');
      return false;
    }
    if (!cardInfo.expiryMonth || !cardInfo.expiryYear) {
      setError('Geçerli bir son kullanma tarihi giriniz');
      return false;
    }
    if (!cardInfo.cvv || cardInfo.cvv.length !== 3) {
      setError('Geçerli bir CVV giriniz');
      return false;
    }
    return true;
  };

  const handleSubmit = async () => {
    if (!validateForm()) return;
    if (!user) {
      setError('Kullanıcı bilgileri bulunamadı');
      return;
    }

    setLoading(true);
    setError('');

    try {
      // Ödeme simülasyonu
      await new Promise(resolve => setTimeout(resolve, 2000));

      // Kiralama verilerini hazırla
      const rentalData = {
        carId: selectedCar.carId,
        customerId: parseInt(user.id),
        rentDate: rentalDetails.rentDate,
        returnDate: rentalDetails.returnDate
      };

      console.log('Gönderilen kiralama verileri:', rentalData);

      // Kiralama işlemini kaydet
      const response = await api.addRental(rentalData);
      console.log('Kiralama yanıtı:', response);

      if (response.data.success) {
        setSuccess(true);
        setPaymentCompleted(true);
        
        // Fatura verilerini hazırla
        setInvoiceData({
          invoiceNumber: `INV-${Date.now()}`,
          date: new Date().toLocaleDateString('tr-TR'),
          rental: rentalDetails,
          car: selectedCar,
          payment: {
            cardNumber: '**** **** **** ' + cardInfo.cardNumber.slice(-4),
            cardHolder: cardInfo.cardHolder,
            amount: rentalDetails.totalPrice
          }
        });
      } else {
        setError(response.data.message || 'Ödeme işlemi başarısız oldu');
      }
    } catch (error) {
      console.error('Ödeme hatası:', error);
      setError(error.response?.data?.message || 'Bir hata oluştu. Lütfen tekrar deneyin.');
    } finally {
      setLoading(false);
    }
  };

  const handleDownloadInvoice = () => {
    // PDF oluştur
    const doc = new jsPDF();
    
    // Fatura başlığı
    doc.setFontSize(20);
    doc.text('ARAÇ KİRALAMA FATURASI', 105, 20, { align: 'center' });
    
    // Fatura numarası ve tarih
    doc.setFontSize(10);
    doc.text(`Fatura No: ${invoiceData.invoiceNumber}`, 20, 40);
    doc.text(`Tarih: ${invoiceData.date}`, 20, 45);
    
    // Logo veya şirket bilgileri (opsiyonel)
    doc.setFontSize(12);
    doc.text('RentACar', 150, 40);
    doc.setFontSize(8);
    doc.text('www.rentacar.com', 150, 45);
    doc.text('info@rentacar.com', 150, 50);
    doc.text('Tel: +90 555 555 55 55', 150, 55);

    // Müşteri Bilgileri
    doc.setFontSize(12);
    doc.text('MÜŞTERİ BİLGİLERİ', 20, 70);
    doc.setFontSize(10);
    doc.text(`Ad Soyad: ${cardInfo.cardHolder}`, 20, 80);
    doc.text(`Kart No: ${invoiceData.payment.cardNumber}`, 20, 85);

    // Araç Bilgileri
    doc.setFontSize(12);
    doc.text('ARAÇ BİLGİLERİ', 20, 100);
    
    const araçBilgileri = [
      ['Marka/Model', selectedCar.brandName],
      ['Açıklama', selectedCar.description],
      ['Renk', selectedCar.colorName],
      ['Model Yılı', selectedCar.modelYear.toString()]
    ];

    doc.autoTable({
      startY: 105,
      head: [['Özellik', 'Detay']],
      body: araçBilgileri,
      theme: 'grid',
      styles: { fontSize: 10 },
      headStyles: { fillColor: [66, 139, 202] }
    });

    // Kiralama Detayları
    doc.setFontSize(12);
    doc.text('KİRALAMA DETAYLARI', 20, doc.lastAutoTable.finalY + 20);

    const kiralamaBilgileri = [
      ['Başlangıç Tarihi', format(new Date(rentalDetails.rentDate), 'dd MMMM yyyy', { locale: tr })],
      ['Dönüş Tarihi', format(new Date(rentalDetails.returnDate), 'dd MMMM yyyy', { locale: tr })],
      ['Kiralama Süresi', `${Math.ceil((new Date(rentalDetails.returnDate) - new Date(rentalDetails.rentDate)) / (1000 * 60 * 60 * 24))} Gün`],
      ['Günlük Ücret', `${selectedCar.dailyPrice} TL`],
      ['Toplam Tutar', `${rentalDetails.totalPrice} TL`]
    ];

    doc.autoTable({
      startY: doc.lastAutoTable.finalY + 25,
      head: [['', 'Detay']],
      body: kiralamaBilgileri,
      theme: 'grid',
      styles: { fontSize: 10 },
      headStyles: { fillColor: [66, 139, 202] }
    });

    // Alt Bilgi
    doc.setFontSize(10);
    doc.text('Bu bir elektronik faturadır.', 20, doc.lastAutoTable.finalY + 20);
    doc.text('İyi yolculuklar dileriz!', 20, doc.lastAutoTable.finalY + 25);

    // PDF'i indir
    doc.save(`fatura-${invoiceData.invoiceNumber}.pdf`);
  };

  if (!user || !selectedCar || !rentalDetails) {
    return (
      <Box display="flex" justifyContent="center" alignItems="center" minHeight="80vh">
        <CircularProgress />
      </Box>
    );
  }

  return (
    <Container maxWidth="lg" sx={{ mt: 4, mb: 4 }}>
      <Grid container spacing={4}>
        <Grid item xs={12} md={8}>
          <Paper elevation={3} sx={{ p: 4 }}>
            {paymentCompleted ? (
              // Ödeme Başarılı Ekranı
              <Box sx={{ textAlign: 'center', py: 4 }}>
                <CheckCircleIcon sx={{ fontSize: 80, color: 'success.main', mb: 2 }} />
                <Typography variant="h4" gutterBottom color="success.main">
                  Ödeme Başarılı!
                </Typography>
                <Typography variant="body1" sx={{ mb: 4 }}>
                  Kiralama işleminiz başarıyla tamamlandı.
                </Typography>
                
                <Button
                  variant="contained"
                  color="primary"
                  startIcon={<DownloadIcon />}
                  onClick={handleDownloadInvoice}
                  sx={{ mb: 2 }}
                >
                  Faturayı İndir
                </Button>
                
                <Button
                  variant="outlined"
                  color="primary"
                  onClick={() => navigate('/')}
                  sx={{ ml: 2 }}
                >
                  Ana Sayfaya Dön
                </Button>
              </Box>
            ) : (
              // Ödeme Formu (mevcut form kodları)
              <>
                <Typography variant="h4" gutterBottom>
                  Ödeme Bilgileri
                </Typography>

                {error && (
                  <Alert severity="error" sx={{ mb: 2 }}>
                    {error}
                  </Alert>
                )}

                <Grid container spacing={3}>
                  <Grid item xs={12}>
                    <TextField
                      fullWidth
                      label="Kart Numarası"
                      name="cardNumber"
                      value={cardInfo.cardNumber}
                      onChange={handleInputChange}
                      placeholder="1234 5678 9012 3456"
                      InputProps={{
                        startAdornment: <CreditCardIcon sx={{ mr: 1, color: 'text.secondary' }} />
                      }}
                    />
                  </Grid>

                  <Grid item xs={12}>
                    <TextField
                      fullWidth
                      label="Kart Sahibi"
                      name="cardHolder"
                      value={cardInfo.cardHolder}
                      onChange={handleInputChange}
                      placeholder="AD SOYAD"
                    />
                  </Grid>

                  <Grid item xs={12} sm={6}>
                    <Grid container spacing={2}>
                      <Grid item xs={6}>
                        <TextField
                          fullWidth
                          label="Ay"
                          name="expiryMonth"
                          value={cardInfo.expiryMonth}
                          onChange={handleInputChange}
                          placeholder="MM"
                        />
                      </Grid>
                      <Grid item xs={6}>
                        <TextField
                          fullWidth
                          label="Yıl"
                          name="expiryYear"
                          value={cardInfo.expiryYear}
                          onChange={handleInputChange}
                          placeholder="YY"
                        />
                      </Grid>
                    </Grid>
                  </Grid>

                  <Grid item xs={12} sm={6}>
                    <TextField
                      fullWidth
                      label="CVV"
                      name="cvv"
                      value={cardInfo.cvv}
                      onChange={handleInputChange}
                      placeholder="123"
                    />
                  </Grid>
                </Grid>

                <Button
                  variant="contained"
                  color="primary"
                  fullWidth
                  size="large"
                  onClick={handleSubmit}
                  disabled={loading || success}
                  startIcon={loading ? <CircularProgress size={20} /> : <PaymentIcon />}
                  sx={{ mt: 4 }}
                >
                  {loading ? 'İşleminiz Gerçekleştiriliyor...' : `${rentalDetails.totalPrice} TL Öde`}
                </Button>
              </>
            )}
          </Paper>
        </Grid>

        {/* Sağ taraf - Kiralama Özeti */}
        <Grid item xs={12} md={4}>
          <Card>
            <CardContent>
              <Typography variant="h6" gutterBottom>
                Kiralama Özeti
              </Typography>
              <Divider sx={{ mb: 2 }} />

              <Box sx={{ mb: 2 }}>
                <Typography variant="subtitle2" color="text.secondary">
                  Araç
                </Typography>
                <Typography variant="body1">
                  {selectedCar.brandName} - {selectedCar.description}
                </Typography>
              </Box>

              <Box sx={{ mb: 2 }}>
                <Typography variant="subtitle2" color="text.secondary">
                  Kiralama Tarihi
                </Typography>
                <Typography variant="body1">
                  {new Date(rentalDetails.rentDate).toLocaleDateString('tr-TR')}
                </Typography>
              </Box>

              <Box sx={{ mb: 2 }}>
                <Typography variant="subtitle2" color="text.secondary">
                  Dönüş Tarihi
                </Typography>
                <Typography variant="body1">
                  {new Date(rentalDetails.returnDate).toLocaleDateString('tr-TR')}
                </Typography>
              </Box>

              <Box sx={{ mb: 2 }}>
                <Typography variant="subtitle2" color="text.secondary">
                  Kiralama Süresi
                </Typography>
                <Typography variant="body1">
                  {Math.ceil((new Date(rentalDetails.returnDate) - new Date(rentalDetails.rentDate)) / (1000 * 60 * 60 * 24))} Gün
                </Typography>
              </Box>

              <Divider sx={{ my: 2 }} />

              <Box sx={{ mb: 2 }}>
                <Typography variant="subtitle2" color="text.secondary">
                  Günlük Ücret
                </Typography>
                <Typography variant="body1">
                  {selectedCar.dailyPrice} TL
                </Typography>
              </Box>

              <Box>
                <Typography variant="h6" color="primary">
                  Toplam Tutar
                </Typography>
                <Typography variant="h4" color="primary" sx={{ fontWeight: 'bold' }}>
                  {rentalDetails.totalPrice} TL
                </Typography>
              </Box>
            </CardContent>
          </Card>
        </Grid>
      </Grid>
    </Container>
  );
}

export default Payment;
