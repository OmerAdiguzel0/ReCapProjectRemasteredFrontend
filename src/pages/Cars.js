import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import api from '../api/index.js';
import {
  Container,
  Grid,
  Card,
  CardContent,
  CardMedia,
  Typography,
  Button,
  CircularProgress,
  Box,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
  TextField,
  IconButton,
} from '@mui/material';
import ArrowBackIosNewIcon from '@mui/icons-material/ArrowBackIosNew';
import ArrowForwardIosIcon from '@mui/icons-material/ArrowForwardIos';

function Cars() {
  const navigate = useNavigate();
  const [cars, setCars] = useState([]);
  const [brands, setBrands] = useState([]);
  const [colors, setColors] = useState([]);
  const [loading, setLoading] = useState(true);
  const [selectedBrand, setSelectedBrand] = useState('');
  const [selectedColor, setSelectedColor] = useState('');
  const [minPrice, setMinPrice] = useState(0);
  const [maxPrice, setMaxPrice] = useState(5000);
  const [selectedYear, setSelectedYear] = useState('');
  const [years, setYears] = useState([]);
  const [carImages, setCarImages] = useState({});
  const [error, setError] = useState(null);
  const [currentImageIndexes, setCurrentImageIndexes] = useState({});

  useEffect(() => {
    const fetchData = async () => {
      try {
        setLoading(true);
        console.log('Veri getirme başladı...');
        
        // Tüm verileri paralel olarak çekelim
        const [carsResponse, brandsResponse, colorsResponse] = await Promise.all([
          api.getCarDetails(),
          api.getAllBrands(),
          api.getAllColors()
        ]);
        
        console.log('Cars Response:', carsResponse);
        
        if (carsResponse.data.success) {
          setCars(carsResponse.data.data);
          // Her araç için başlangıç indeksini 0 olarak ayarla
          const initialIndexes = {};
          carsResponse.data.data.forEach(car => {
            initialIndexes[car.carId] = 0;
          });
          setCurrentImageIndexes(initialIndexes);
        } else {
          console.error('Arabalar getirilemedi:', carsResponse.data.message);
        }

        if (brandsResponse.data.success) setBrands(brandsResponse.data.data);
        if (colorsResponse.data.success) setColors(colorsResponse.data.data);

        // Resim verilerini getir
        const imagePromises = carsResponse.data.data.map(car => 
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

  const handlePrevImage = (carId, maxIndex) => {
    setCurrentImageIndexes(prev => ({
      ...prev,
      [carId]: prev[carId] > 0 
        ? prev[carId] - 1 
        : maxIndex // Son resme git
    }));
  };

  const handleNextImage = (carId, maxIndex) => {
    setCurrentImageIndexes(prev => ({
      ...prev,
      [carId]: prev[carId] < maxIndex 
        ? prev[carId] + 1 
        : 0 // İlk resme dön
    }));
  };

  const getCarImageUrl = (car) => {
    if (car.imagePaths && car.imagePaths.length > 0) {
      const currentIndex = currentImageIndexes[car.carId] || 0;
      return `http://localhost:7108${car.imagePaths[currentIndex]}`;
    }
    return 'http://localhost:7108/Uploads/Images/default.jpg';
  };

  const handleMinPriceChange = (event) => {
    const value = event.target.value === '' ? 0 : Number(event.target.value);
    setMinPrice(value);
  };

  const handleMaxPriceChange = (event) => {
    const value = event.target.value === '' ? maxPrice : Number(event.target.value);
    setMaxPrice(value);
  };

  const filteredCars = cars.filter(car => {
    // Marka filtresi
    const brandMatch = !selectedBrand || car.brandName === brands.find(b => b.brandId === parseInt(selectedBrand))?.brandName;
    
    // Renk filtresi
    const colorMatch = !selectedColor || car.colorName === colors.find(c => c.colorId === parseInt(selectedColor))?.colorName;
    
    // Yıl filtresi
    const yearMatch = !selectedYear || car.modelYear === parseInt(selectedYear);
    
    // Fiyat filtresi
    const priceMatch = car.dailyPrice >= minPrice && car.dailyPrice <= maxPrice;
    
    return brandMatch && colorMatch && yearMatch && priceMatch;
  });

  const handleRentClick = (car) => {
    navigate('/rentals', { 
      state: { 
        selectedCar: car,
        fromCarsPage: true
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
      <Grid container spacing={2} sx={{ mb: 4 }}>
        <Grid item xs={12} md={3}>
          <FormControl fullWidth>
            <InputLabel>Marka</InputLabel>
            <Select
              value={selectedBrand}
              label="Marka"
              onChange={(e) => setSelectedBrand(e.target.value)}
            >
              <MenuItem value="">Tümü</MenuItem>
              {brands.map((brand) => (
                <MenuItem key={brand.brandId} value={brand.brandId}>
                  {brand.brandName}
                </MenuItem>
              ))}
            </Select>
          </FormControl>
        </Grid>
        <Grid item xs={12} md={3}>
          <FormControl fullWidth>
            <InputLabel>Renk</InputLabel>
            <Select
              value={selectedColor}
              label="Renk"
              onChange={(e) => setSelectedColor(e.target.value)}
            >
              <MenuItem value="">Tümü</MenuItem>
              {colors.map((color) => (
                <MenuItem key={color.colorId} value={color.colorId}>
                  {color.colorName}
                </MenuItem>
              ))}
            </Select>
          </FormControl>
        </Grid>
        <Grid item xs={12} md={3}>
          <FormControl fullWidth>
            <InputLabel>Model Yılı</InputLabel>
            <Select
              value={selectedYear}
              label="Model Yılı"
              onChange={(e) => setSelectedYear(e.target.value)}
            >
              <MenuItem value="">Tümü</MenuItem>
              {years.map((year) => (
                <MenuItem key={year} value={year}>
                  {year}
                </MenuItem>
              ))}
            </Select>
          </FormControl>
        </Grid>
        <Grid item xs={12} md={3}>
          <Typography gutterBottom>
            Fiyat Aralığı (TL)
          </Typography>
          <Box sx={{ display: 'flex', gap: 2 }}>
            <TextField
              label="Min"
              type="number"
              value={minPrice}
              onChange={handleMinPriceChange}
              size="small"
              InputProps={{ inputProps: { min: 0 } }}
            />
            <TextField
              label="Max"
              type="number"
              value={maxPrice}
              onChange={handleMaxPriceChange}
              size="small"
              InputProps={{ inputProps: { min: minPrice } }}
            />
          </Box>
        </Grid>
      </Grid>

      <Grid container spacing={4}>
        {filteredCars.map((car) => (
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
                      onClick={() => handlePrevImage(car.carId, car.imagePaths.length - 1)}
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
                      onClick={() => handleNextImage(car.carId, car.imagePaths.length - 1)}
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

export default Cars;
