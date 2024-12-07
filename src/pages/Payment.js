import React, { useState, useEffect } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import api from '../api';
import {
  Container,
  Paper,
  Typography,
  TextField,
  Button,
  Box,
  Alert,
  Stepper,
  Step,
  StepLabel,
  Grid,
  CircularProgress
} from '@mui/material';

function Payment() {
  const location = useLocation();
  const navigate = useNavigate();
  const { selectedCar, rentalDetails } = location.state || {};
  const [activeStep, setActiveStep] = useState(0);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState(false);

  // Findeks puanı state'i
  const [findeksScore, setFindeksScore] = useState(null);

  // Kredi kartı bilgileri state'i
  const [cardInfo, setCardInfo] = useState({
    cardNumber: '',
    cardHolder: '',
    expiryDate: '',
    cvv: ''
  });

  useEffect(() => {
    if (!selectedCar || !rentalDetails) {
      navigate('/cars');
    }
    // Kullanıcının findeks puanını getir
    fetchUserFindeksScore();
  }, [navigate, selectedCar, rentalDetails]);

  const fetchUserFindeksScore = async () => {
    try {
      // TODO: Gerçek API endpoint'i ile değiştirilecek
      const response = await api.get('/users/findeks-score');
      setFindeksScore(response.data.data);
    } catch (error) {
      console.error('Findeks puanı getirme hatası:', error);
      setError('Findeks puanı alınamadı');
    }
  };

  const handleCardInfoChange = (event) => {
    const { name, value } = event.target;
    setCardInfo(prev => ({
      ...prev,
      [name]: value
    }));
  };

  const validateCardInfo = () => {
    if (!cardInfo.cardNumber || cardInfo.cardNumber.length !== 16) {
      setError('Geçerli bir kart numarası giriniz');
      return false;
    }
    if (!cardInfo.cardHolder) {
      setError('Kart sahibi adını giriniz');
      return false;
    }
    if (!cardInfo.expiryDate || !cardInfo.expiryDate.match(/^(0[1-9]|1[0-2])\/([0-9]{2})$/)) {
      setError('Geçerli bir son kullanma tarihi giriniz (AA/YY)');
      return false;
    }
    if (!cardInfo.cvv || cardInfo.cvv.length !== 3) {
      setError('Geçerli bir CVV giriniz');
      return false;
    }
    return true;
  };

  const handlePayment = async () => {
    if (!validateCardInfo()) return;

    setLoading(true);
    setError('');

    try {
      // Findeks puanı kontrolü
      if (findeksScore < selectedCar.minFindeksScore) {
        setError(`Bu aracı kiralamak için minimum ${selectedCar.minFindeksScore} findeks puanına sahip olmalısınız. Mevcut puanınız: ${findeksScore}`);
        setLoading(false);
        return;
      }

      // Ödeme simülasyonu
      await new Promise(resolve => setTimeout(resolve, 2000));

      // Kiralama işlemini gerçekleştir
      await api.post('/rentals/add', rentalDetails);

      setSuccess(true);
      setActiveStep(2);

      // 3 saniye sonra ana sayfaya yönlendir
      setTimeout(() => {
        navigate('/');
      }, 3000);

    } catch (error) {
      console.error('Ödeme hatası:', error);
      setError('Ödeme işlemi sırasında bir hata oluştu');
    } finally {
      setLoading(false);
    }
  };

  const steps = ['Findeks Kontrolü', 'Ödeme', 'Tamamlandı'];

  return (
    <Container maxWidth="md" sx={{ mt: 4, mb: 4 }}>
      <Paper elevation={3} sx={{ p: 4 }}>
        <Stepper activeStep={activeStep} sx={{ mb: 4 }}>
          {steps.map((label) => (
            <Step key={label}>
              <StepLabel>{label}</StepLabel>
            </Step>
          ))}
        </Stepper>

        {error && (
          <Alert severity="error" sx={{ mb: 2 }}>
            {error}
          </Alert>
        )}

        {success ? (
          <Alert severity="success" sx={{ mb: 2 }}>
            Ödeme başarıyla tamamlandı! Ana sayfaya yönlendiriliyorsunuz...
          </Alert>
        ) : (
          <Box>
            {activeStep === 0 && (
              <Box sx={{ mb: 4 }}>
                <Typography variant="h6" gutterBottom>
                  Findeks Puanı Kontrolü
                </Typography>
                {findeksScore !== null ? (
                  <Typography>
                    Findeks Puanınız: {findeksScore}
                    {findeksScore >= selectedCar.minFindeksScore ? (
                      <Alert severity="success" sx={{ mt: 2 }}>
                        Findeks puanınız yeterli! Ödeme adımına geçebilirsiniz.
                      </Alert>
                    ) : (
                      <Alert severity="error" sx={{ mt: 2 }}>
                        Üzgünüz, findeks puanınız bu araç için yetersiz.
                        Minimum gereken puan: {selectedCar.minFindeksScore}
                      </Alert>
                    )}
                  </Typography>
                ) : (
                  <CircularProgress />
                )}
                {findeksScore >= selectedCar.minFindeksScore && (
                  <Button
                    variant="contained"
                    onClick={() => setActiveStep(1)}
                    sx={{ mt: 2 }}
                  >
                    Devam Et
                  </Button>
                )}
              </Box>
            )}

            {activeStep === 1 && (
              <Grid container spacing={2}>
                <Grid item xs={12}>
                  <Typography variant="h6" gutterBottom>
                    Ödeme Bilgileri
                  </Typography>
                </Grid>
                <Grid item xs={12}>
                  <TextField
                    fullWidth
                    label="Kart Numarası"
                    name="cardNumber"
                    value={cardInfo.cardNumber}
                    onChange={handleCardInfoChange}
                    inputProps={{ maxLength: 16 }}
                  />
                </Grid>
                <Grid item xs={12}>
                  <TextField
                    fullWidth
                    label="Kart Sahibi"
                    name="cardHolder"
                    value={cardInfo.cardHolder}
                    onChange={handleCardInfoChange}
                  />
                </Grid>
                <Grid item xs={6}>
                  <TextField
                    fullWidth
                    label="Son Kullanma Tarihi (AA/YY)"
                    name="expiryDate"
                    value={cardInfo.expiryDate}
                    onChange={handleCardInfoChange}
                    inputProps={{ maxLength: 5 }}
                  />
                </Grid>
                <Grid item xs={6}>
                  <TextField
                    fullWidth
                    label="CVV"
                    name="cvv"
                    value={cardInfo.cvv}
                    onChange={handleCardInfoChange}
                    inputProps={{ maxLength: 3 }}
                  />
                </Grid>
                <Grid item xs={12}>
                  <Button
                    fullWidth
                    variant="contained"
                    onClick={handlePayment}
                    disabled={loading}
                    sx={{ mt: 2 }}
                  >
                    {loading ? <CircularProgress size={24} /> : 'Ödemeyi Tamamla'}
                  </Button>
                </Grid>
              </Grid>
            )}
          </Box>
        )}
      </Paper>
    </Container>
  );
}

export default Payment;
