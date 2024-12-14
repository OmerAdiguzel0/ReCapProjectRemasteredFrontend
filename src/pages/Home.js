import React, { useState, useEffect } from 'react';
import { Container, Typography, Paper, Grid, Button, Card, CardContent, CardMedia, CircularProgress, Box, IconButton } from '@mui/material';
import { useNavigate } from 'react-router-dom';
import DirectionsCarIcon from '@mui/icons-material/DirectionsCar';
import KeyIcon from '@mui/icons-material/Key';
import api from '../api';
import ArrowBackIosNewIcon from '@mui/icons-material/ArrowBackIosNew';
import ArrowForwardIosIcon from '@mui/icons-material/ArrowForwardIos';

function Home() {
  const navigate = useNavigate();
  const [cars, setCars] = useState([]);
  const [loading, setLoading] = useState(true);
  const [carImages, setCarImages] = useState({});
  const [error, setError] = useState(null);
  const [currentImageIndexes, setCurrentImageIndexes] = useState({});

  useEffect(() => {
    const fetchData = async () => {
      try {
        setLoading(true);
        console.log('Veri getirme başladı...');
        
        const carsResponse = await api.getCarDetails();
        console.log('Cars Response:', carsResponse);
        
        if (!carsResponse.data.success) {
          console.error('Cars API error:', carsResponse.data.message);
          return;
        }

        const carsData = carsResponse.data.data;
        setCars(carsData);

        // Her araç için başlangıç indeksini 0 olarak ayarla
        const initialIndexes = {};
        carsData.forEach(car => {
          initialIndexes[car.carId] = 0;
        });
        setCurrentImageIndexes(initialIndexes);

        // Resim verilerini getir
        const imagePromises = carsData.map(car => 
          api.getCarImages(car.carId)
            .then(res => ({ carId: car.carId, images: res.data.data }))
            .catch(err => {
              console.error(`Araba ${car.carId} için resim getirme hatası:`, err);
              return { carId: car.carId, images: [] };
            })
        );
        
        const carImagesResults = await Promise.all(imagePromises);
        const imagesMap = {};
        carImagesResults.forEach(result => {
          imagesMap[result.carId] = result.images;
        });
        setCarImages(imagesMap);
        
      } catch (error) {
        console.error('Veri getirme hatası:', error);
        setError('Veriler alınırken bir hata oluştu');
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, []);

  const getCarImageUrl = (car) => {
    if (car.imagePaths && car.imagePaths.length > 0) {
      const currentIndex = currentImageIndexes[car.carId] || 0;
      return `http://localhost:7108${car.imagePaths[currentIndex]}`;
    }
    return 'http://localhost:7108/Uploads/Images/default.jpg';
  };

  const handlePrevImage = (carId) => {
    setCurrentImageIndexes(prev => {
        const maxIndex = cars.find(c => c.carId === carId)?.imagePaths?.length - 1 || 0;
        return {
            ...prev,
            [carId]: prev[carId] > 0 ? prev[carId] - 1 : maxIndex
        };
    });
  };

  const handleNextImage = (carId) => {
    setCurrentImageIndexes(prev => {
        const maxIndex = cars.find(c => c.carId === carId)?.imagePaths?.length - 1 || 0;
        return {
            ...prev,
            [carId]: prev[carId] < maxIndex ? prev[carId] + 1 : 0
        };
    });
  };

  useEffect(() => {
    const sliderInterval = setInterval(() => {
        cars.forEach(car => {
            if (car.imagePaths?.length > 1) {
                handleNextImage(car.carId);
            }
        });
    }, 3000);

    return () => clearInterval(sliderInterval);
  }, [cars]);

  const handleRentClick = (car) => {
    navigate('/rental-details', { 
        state: { 
            selectedCar: car
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
      <Paper elevation={3} sx={{ p: 4, textAlign: 'center', mb: 4 }}>
        <Typography variant="h3" component="h1" gutterBottom>
          Hoş Geldiniz
        </Typography>
        <Typography variant="h5" color="textSecondary" paragraph>
          En uygun fiyatlarla araç kiralama hizmetimizden yararlanın.
        </Typography>
        
        <Grid container spacing={4} sx={{ mt: 4 }}>
          <Grid item xs={12} md={6}>
            <Paper elevation={2} sx={{ p: 3 }}>
              <DirectionsCarIcon sx={{ fontSize: 60, color: 'primary.main' }} />
              <Typography variant="h5" gutterBottom sx={{ mt: 2 }}>
                Araçlarımız
              </Typography>
              <Typography paragraph>
                Geniş araç filomuzdan size en uygun aracı seçin.
              </Typography>
              <Button 
                variant="contained" 
                color="primary"
                onClick={() => navigate('/cars')}
              >
                Tüm Araçları Görüntüle
              </Button>
            </Paper>
          </Grid>
          
          <Grid item xs={12} md={6}>
            <Paper elevation={2} sx={{ p: 3 }}>
              <KeyIcon sx={{ fontSize: 60, color: 'primary.main' }} />
              <Typography variant="h5" gutterBottom sx={{ mt: 2 }}>
                Kiralama
              </Typography>
              <Typography paragraph>
                Hızlı ve kolay kiralama işlemi ile aracınızı hemen kiralayın.
              </Typography>
              <Button 
                variant="contained" 
                color="primary"
                onClick={() => navigate('/rentals')}
              >
                Kiralama Yap
              </Button>
            </Paper>
          </Grid>
        </Grid>
      </Paper>

      <Typography variant="h4" gutterBottom sx={{ mt: 6, mb: 4, textAlign: 'center' }}>
        Öne Çıkan Araçlarımız
      </Typography>

      <Grid container spacing={4}>
        {cars.slice(0, 3).map((car) => (
          <Grid item key={car.carId} xs={12} sm={6} md={4}>
            <Card>
              <Box sx={{ position: 'relative' }}>
                <CardMedia
                  component="img"
                  height="200"
                  image={getCarImageUrl(car)}
                  alt={car.description}
                  sx={{ objectFit: "cover" }}
                  onError={(e) => {
                    e.target.src = 'http://localhost:7108/Uploads/Images/default.jpg';
                  }}
                />
                {car.imagePaths && car.imagePaths.length > 1 && (
                  <>
                    <IconButton
                      sx={{
                        position: 'absolute',
                        left: 8,
                        top: '50%',
                        transform: 'translateY(-50%)',
                        bgcolor: 'rgba(255, 255, 255, 0.7)',
                        '&:hover': {
                          bgcolor: 'rgba(255, 255, 255, 0.9)',
                        },
                      }}
                      onClick={() => handlePrevImage(car.carId)}
                    >
                      <ArrowBackIosNewIcon />
                    </IconButton>
                    <IconButton
                      sx={{
                        position: 'absolute',
                        right: 8,
                        top: '50%',
                        transform: 'translateY(-50%)',
                        bgcolor: 'rgba(255, 255, 255, 0.7)',
                        '&:hover': {
                          bgcolor: 'rgba(255, 255, 255, 0.9)',
                        },
                      }}
                      onClick={() => handleNextImage(car.carId)}
                    >
                      <ArrowForwardIosIcon />
                    </IconButton>
                    <Box
                      sx={{
                        position: 'absolute',
                        bottom: 8,
                        right: 8,
                        bgcolor: 'rgba(0, 0, 0, 0.6)',
                        color: 'white',
                        px: 1,
                        borderRadius: 1,
                        fontSize: '0.875rem',
                      }}
                    >
                      {`${(currentImageIndexes[car.carId] || 0) + 1}/${car.imagePaths.length}`}
                    </Box>
                  </>
                )}
              </Box>
              <CardContent>
                <Typography gutterBottom variant="h5" component="div">
                  {car.brandName}
                </Typography>
                <Typography variant="body2" color="text.secondary">
                  Renk: {car.colorName}
                </Typography>
                <Typography variant="body2" color="text.secondary">
                  Model Yılı: {car.modelYear}
                </Typography>
                <Typography variant="h6" color="primary" sx={{ mt: 2 }}>
                  Günlük Fiyat: {car.dailyPrice} TL
                </Typography>
                <Button 
                  variant="contained" 
                  color="primary" 
                  fullWidth 
                  sx={{ mt: 2 }}
                  onClick={() => handleRentClick(car)}
                >
                  Kirala
                </Button>
              </CardContent>
            </Card>
          </Grid>
        ))}
      </Grid>
    </Container>
  );
}

export default Home;
