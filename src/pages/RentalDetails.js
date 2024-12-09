import React, { useState, useEffect } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import {
  Container,
  Paper,
  Typography,
  Grid,
  Card,
  CardContent,
  CardMedia,
  Button,
  Box,
  Divider,
  Alert,
  CircularProgress,
  TextField
} from '@mui/material';
import DirectionsCarIcon from '@mui/icons-material/DirectionsCar';
import PersonIcon from '@mui/icons-material/Person';
import PaymentIcon from '@mui/icons-material/Payment';
import { DatePicker } from '@mui/x-date-pickers/DatePicker';
import { LocalizationProvider } from '@mui/x-date-pickers/LocalizationProvider';
import { AdapterDateFns } from '@mui/x-date-pickers/AdapterDateFns';
import { differenceInDays, addDays, startOfDay } from 'date-fns';
import { tr } from 'date-fns/locale';
import api from '../api/index';

function RentalDetails() {
  const location = useLocation();
  const navigate = useNavigate();
  const { selectedCar } = location.state || {};
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [rentDate, setRentDate] = useState(startOfDay(new Date()));
  const [returnDate, setReturnDate] = useState(startOfDay(addDays(new Date(), 1)));
  const [totalPrice, setTotalPrice] = useState(0);
  const [userFindeksScore, setUserFindeksScore] = useState(0);

  useEffect(() => {
    const fetchUserData = async () => {
      console.log("\n=== Fetching User Data Started ===");
      
      if (!selectedCar) {
        console.log("No selected car, navigating to /cars");
        navigate('/cars');
        return;
      }

      const userStr = localStorage.getItem('user');
      console.log("User data from localStorage:", userStr);
      
      if (userStr) {
        const userData = JSON.parse(userStr);
        console.log("Parsed user data:", userData);
        setUser(userData);
        
        if (userData.id) {
          console.log("Attempting to fetch findeks score for user ID:", userData.id);
          try {
            const response = await api.getUserFindeksScore(userData.id);
            console.log("Findeks score API response:", response);
            
            if (response.data.success) {
              const score = response.data.data;
              console.log("Setting findeks score:", score);
              setUserFindeksScore(score);
            } else {
              console.error("API error:", response.data.message);
              setError('Findeks puanı alınamadı: ' + response.data.message);
            }
          } catch (error) {
            console.error("API call error:", error);
            console.error("Error details:", {
              message: error.message,
              response: error.response?.data,
              status: error.response?.status
            });
            setError('Findeks puanı alınamadı: ' + error.message);
          }
        } else {
          console.error("No user ID found in user data");
          setError('Kullanıcı ID bulunamadı');
        }
      } else {
        console.error("No user data found in localStorage");
      }
      
      console.log("=== Fetching User Data Completed ===\n");
      setLoading(false);
    };

    fetchUserData();
  }, [selectedCar, navigate]);

  useEffect(() => {
    if (rentDate && returnDate && selectedCar) {
      const days = differenceInDays(returnDate, rentDate);
      if (days >= 0) {
        setTotalPrice(days * selectedCar.dailyPrice);
        setError('');
      } else {
        setError('Dönüş tarihi kiralama tarihinden önce olamaz');
        setTotalPrice(0);
      }
    }
  }, [rentDate, returnDate, selectedCar]);

  const isPaymentDisabled = () => {
    return totalPrice <= 0 || userFindeksScore < selectedCar.minFindeksScore;
  };

  const handlePayment = () => {
    const today = startOfDay(new Date());
    
    if (userFindeksScore < selectedCar.minFindeksScore) {
      setError(`Bu aracı kiralamak için minimum ${selectedCar.minFindeksScore} findeks puanına sahip olmalısınız. 
                Mevcut puanınız: ${userFindeksScore}`);
      return;
    }

    if (rentDate < today) {
      setError('Geçmiş tarihli kiralama yapılamaz');
      return;
    }

    if (returnDate <= rentDate) {
      setError('Dönüş tarihi kiralama tarihinden sonra olmalıdır');
      return;
    }

    navigate('/payment', {
      state: {
        selectedCar,
        rentalDetails: {
          carId: selectedCar.carId,
          customerId: user.id,
          rentDate: rentDate.toISOString(),
          returnDate: returnDate.toISOString(),
          totalPrice: totalPrice
        }
      }
    });
  };

  if (loading) {
    return (
      <Box display="flex" justifyContent="center" alignItems="center" minHeight="80vh">
        <CircularProgress />
      </Box>
    );
  }

  return (
    <Container maxWidth="lg" sx={{ mt: 4 }}>
      <Paper elevation={3} sx={{ p: 4 }}>
        <Typography variant="h4" gutterBottom>
          Kiralama Detayları
        </Typography>

        {error && (
          <Alert severity="error" sx={{ mb: 2 }}>
            {error}
          </Alert>
        )}

        <Grid container spacing={4}>
          {/* Araç Bilgileri */}
          <Grid item xs={12} md={6}>
            <Card>
              <CardMedia
                component="img"
                height="300"
                image={selectedCar.imagePaths[0] ? 
                  `http://localhost:7108${selectedCar.imagePaths[0]}` : 
                  'http://localhost:7108/Uploads/Images/default.jpg'}
                alt={selectedCar.description}
                sx={{ objectFit: "cover" }}
              />
              <CardContent>
                <Box sx={{ display: 'flex', alignItems: 'center', mb: 2 }}>
                  <DirectionsCarIcon sx={{ mr: 2, color: 'primary.main' }} />
                  <Typography variant="h6">
                    Araç Bilgileri
                  </Typography>
                </Box>
                <Divider sx={{ mb: 2 }} />
                <Grid container spacing={2}>
                  <Grid item xs={6}>
                    <Typography variant="subtitle2" color="textSecondary">
                      Marka
                    </Typography>
                    <Typography variant="body1">
                      {selectedCar.brandName}
                    </Typography>
                  </Grid>
                  <Grid item xs={6}>
                    <Typography variant="subtitle2" color="textSecondary">
                      Model Yılı
                    </Typography>
                    <Typography variant="body1">
                      {selectedCar.modelYear}
                    </Typography>
                  </Grid>
                  <Grid item xs={6}>
                    <Typography variant="subtitle2" color="textSecondary">
                      Renk
                    </Typography>
                    <Typography variant="body1">
                      {selectedCar.colorName}
                    </Typography>
                  </Grid>
                  <Grid item xs={6}>
                    <Typography variant="subtitle2" color="textSecondary">
                      Günlük Ücret
                    </Typography>
                    <Typography variant="body1" color="primary">
                      {selectedCar.dailyPrice} TL
                    </Typography>
                  </Grid>
                  <Grid item xs={12}>
                    <Typography variant="subtitle2" color="textSecondary">
                      Açıklama
                    </Typography>
                    <Typography variant="body1">
                      {selectedCar.description}
                    </Typography>
                  </Grid>
                </Grid>
              </CardContent>
            </Card>
          </Grid>

          {/* Kullanıcı Bilgileri */}
          <Grid item xs={12} md={6}>
            <Card sx={{ mb: 3 }}>
              <CardContent>
                <Box sx={{ display: 'flex', alignItems: 'center', mb: 2 }}>
                  <PersonIcon sx={{ mr: 2, color: 'primary.main' }} />
                  <Typography variant="h6">
                    Kiralayan Bilgileri
                  </Typography>
                </Box>
                <Divider sx={{ mb: 2 }} />
                <Grid container spacing={2}>
                  <Grid item xs={6}>
                    <Typography variant="subtitle2" color="textSecondary">
                      Ad Soyad
                    </Typography>
                    <Typography variant="body1">
                      {user.firstName} {user.lastName}
                    </Typography>
                  </Grid>
                  <Grid item xs={6}>
                    <Typography variant="subtitle2" color="textSecondary">
                      E-posta
                    </Typography>
                    <Typography variant="body1">
                      {user.email}
                    </Typography>
                  </Grid>
                  <Grid item xs={12}>
                    <Box sx={{ 
                      display: 'flex', 
                      alignItems: 'center', 
                      mt: 1,
                      p: 2,
                      bgcolor: 'background.default',
                      borderRadius: 1
                    }}>
                      <Typography variant="subtitle2" color="textSecondary" sx={{ mr: 2 }}>
                        Findeks Puanı:
                      </Typography>
                      <Typography 
                        variant="body1" 
                        color={userFindeksScore >= selectedCar.minFindeksScore ? "success.main" : "error.main"}
                        sx={{ fontWeight: 'bold' }}
                      >
                        {userFindeksScore || 0}
                        {userFindeksScore >= selectedCar.minFindeksScore ? (
                          <span style={{ color: 'text.secondary', marginLeft: '8px', fontSize: '0.9em' }}>
                            (Yeterli)
                          </span>
                        ) : (
                          <span style={{ color: 'error.main', marginLeft: '8px', fontSize: '0.9em' }}>
                            (Yetersiz - Minimum {selectedCar.minFindeksScore} puan gerekli)
                          </span>
                        )}
                      </Typography>
                    </Box>
                  </Grid>
                </Grid>
              </CardContent>
            </Card>

            {/* Tarih seçimi ve fiyat bilgisi için yeni bir Card ekleyelim */}
            <Card sx={{ mb: 3 }}>
              <CardContent>
                <Box sx={{ display: 'flex', alignItems: 'center', mb: 2 }}>
                  <Typography variant="h6">
                    Kiralama Detayları
                  </Typography>
                </Box>
                <Divider sx={{ mb: 2 }} />
                
                <LocalizationProvider dateAdapter={AdapterDateFns} adapterLocale={tr}>
                  <Grid container spacing={2}>
                    <Grid item xs={12} sm={6}>
                      <DatePicker
                        label="Kiralama Tarihi"
                        value={rentDate}
                        onChange={(newValue) => {
                          setRentDate(startOfDay(newValue));
                        }}
                        minDate={new Date()}
                        format="dd/MM/yyyy"
                        slotProps={{
                          textField: {
                            fullWidth: true,
                            variant: "outlined"
                          }
                        }}
                      />
                    </Grid>
                    <Grid item xs={12} sm={6}>
                      <DatePicker
                        label="Dönüş Tarihi"
                        value={returnDate}
                        onChange={(newValue) => {
                          setReturnDate(startOfDay(newValue));
                        }}
                        minDate={rentDate ? addDays(rentDate, 1) : new Date()}
                        format="dd/MM/yyyy"
                        slotProps={{
                          textField: {
                            fullWidth: true,
                            variant: "outlined"
                          }
                        }}
                      />
                    </Grid>
                  </Grid>
                </LocalizationProvider>

                <Box sx={{ mt: 3 }}>
                  <Typography variant="subtitle2" color="textSecondary">
                    Kiralama Süresi
                  </Typography>
                  <Typography variant="h6">
                    {differenceInDays(returnDate, rentDate)} Gün
                  </Typography>
                </Box>

                <Box sx={{ mt: 2 }}>
                  <Typography variant="subtitle2" color="textSecondary">
                    Günlük Ücret
                  </Typography>
                  <Typography variant="h6" color="primary">
                    {selectedCar.dailyPrice} TL
                  </Typography>
                </Box>

                <Box sx={{ mt: 2 }}>
                  <Typography variant="subtitle2" color="textSecondary">
                    Toplam Tutar
                  </Typography>
                  <Typography variant="h4" color="primary" sx={{ fontWeight: 'bold' }}>
                    {totalPrice} TL
                  </Typography>
                </Box>
              </CardContent>
            </Card>

            {/* Ödeme Butonu */}
            <Button
              variant="contained"
              color="primary"
              size="large"
              fullWidth
              startIcon={<PaymentIcon />}
              onClick={handlePayment}
              disabled={isPaymentDisabled()}
              sx={{ mt: 2, py: 2 }}
            >
              {userFindeksScore < selectedCar.minFindeksScore ? (
                'Yetersiz Findeks Puanı'
              ) : (
                `Ödeme Yap (${totalPrice} TL)`
              )}
            </Button>

            {userFindeksScore < selectedCar.minFindeksScore && (
              <Typography 
                variant="body2" 
                color="error" 
                sx={{ mt: 1, textAlign: 'center' }}
              >
                * Bu aracı kiralamak için minimum {selectedCar.minFindeksScore} findeks puanına sahip olmalısınız. 
                (Mevcut puanınız: {userFindeksScore})
              </Typography>
            )}
          </Grid>
        </Grid>
      </Paper>
    </Container>
  );
}

export default RentalDetails; 