import React, { useState, useEffect } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import api from '../api';
import {
  Container,
  Paper,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Typography,
  CircularProgress,
  Box,
  Button,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  TextField,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
  Alert
} from '@mui/material';

function Rentals() {
  const location = useLocation();
  const navigate = useNavigate();
  const selectedCar = location.state?.selectedCar;
  const fromCarsPage = location.state?.fromCarsPage;

  const [rentals, setRentals] = useState([]);
  const [cars, setCars] = useState([]);
  const [customers, setCustomers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [openDialog, setOpenDialog] = useState(false);
  const [error, setError] = useState('');
  const [newRental, setNewRental] = useState({
    carId: selectedCar?.carId ?? '',
    customerId: '',
    rentDate: '',
    returnDate: ''
  });

  useEffect(() => {
    const fetchData = async () => {
      try {
        const [rentalsResponse, carsResponse, customersResponse] = await Promise.all([
          api.get('/rentals/getall'),
          api.get('/cars/getdetail'),
          api.get('/customers/getall')
        ]);

        setRentals(rentalsResponse.data.data);
        setCars(carsResponse.data.data);
        setCustomers(customersResponse.data.data);
        setLoading(false);

        // Eğer Cars sayfasından yönlendirme yapıldıysa dialog'u otomatik aç
        if (fromCarsPage && selectedCar) {
          setOpenDialog(true);
        }
      } catch (error) {
        console.error('Veri çekme hatası:', error);
        setLoading(false);
      }
    };

    fetchData();
  }, [fromCarsPage, selectedCar]);

  const handleDialogOpen = () => {
    setOpenDialog(true);
    setError('');
    setNewRental(prev => ({
      ...prev,
      carId: '',
      customerId: '',
      rentDate: '',
      returnDate: ''
    }));
  };

  const handleDialogClose = () => {
    setOpenDialog(false);
    setError('');
    setNewRental({
      carId: '',
      customerId: '',
      rentDate: '',
      returnDate: ''
    });
  };

  const handleInputChange = (event) => {
    const { name, value } = event.target;
    setNewRental(prev => ({
      ...prev,
      [name]: value
    }));
  };

  const validateDates = () => {
    const rentDate = new Date(newRental.rentDate);
    const returnDate = new Date(newRental.returnDate);
    const today = new Date();
    today.setHours(0, 0, 0, 0);

    if (rentDate < today) {
      setError('Kiralama tarihi bugünden önce olamaz');
      return false;
    }

    if (returnDate < rentDate) {
      setError('Dönüş tarihi kiralama tarihinden önce olamaz');
      return false;
    }

    return true;
  };

  const handleSubmit = async () => {
    if (!newRental.carId || !newRental.customerId || !newRental.rentDate || !newRental.returnDate) {
      setError('Lütfen tüm alanları doldurun');
      return;
    }

    if (!validateDates()) {
      return;
    }

    try {
      // Kiralama bilgilerini doğrula
      const selectedCar = cars.find(car => car.carId === newRental.carId);
      
      // Ödeme sayfasına yönlendir
      navigate('/payment', {
        state: {
          selectedCar,
          rentalDetails: newRental
        }
      });
      
      handleDialogClose();
    } catch (error) {
      console.error('Kiralama işlemi hatası:', error);
      setError('Kiralama işlemi başarısız oldu. Lütfen tekrar deneyin.');
    }
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
      <Box display="flex" justifyContent="space-between" alignItems="center" mb={4}>
        <Typography variant="h4" component="h1">
          Kiralamalar
        </Typography>
        <Button variant="contained" color="primary" onClick={handleDialogOpen}>
          Yeni Kiralama
        </Button>
      </Box>

      <TableContainer component={Paper}>
        <Table>
          <TableHead>
            <TableRow>
              <TableCell>Araç</TableCell>
              <TableCell>Müşteri</TableCell>
              <TableCell>Kiralama Tarihi</TableCell>
              <TableCell>Dönüş Tarihi</TableCell>
            </TableRow>
          </TableHead>
          <TableBody>
            {rentals.map((rental) => (
              <TableRow key={rental.id}>
                <TableCell>
                  {cars.find(car => car.carId === rental.carId)?.brandName || 'Bilinmiyor'}
                </TableCell>
                <TableCell>
                  {customers.find(customer => customer.id === rental.customerId)?.companyName || 'Bilinmiyor'}
                </TableCell>
                <TableCell>{new Date(rental.rentDate).toLocaleDateString()}</TableCell>
                <TableCell>
                  {rental.returnDate ? new Date(rental.returnDate).toLocaleDateString() : 'Teslim edilmedi'}
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </TableContainer>

      <Dialog open={openDialog} onClose={handleDialogClose} maxWidth="sm" fullWidth>
        <DialogTitle>Yeni Kiralama</DialogTitle>
        <DialogContent>
          {error && (
            <Alert severity="error" sx={{ mb: 2, mt: 2 }}>
              {error}
            </Alert>
          )}
          
          <FormControl fullWidth sx={{ mt: 2 }}>
            <InputLabel>Araç</InputLabel>
            <Select
              name="carId"
              value={newRental.carId}
              label="Araç"
              onChange={handleInputChange}
            >
              {cars.map((car) => (
                <MenuItem key={car.carId} value={car.carId}>
                  {car.brandName} - {car.description}
                </MenuItem>
              ))}
            </Select>
          </FormControl>

          <FormControl fullWidth sx={{ mt: 2 }}>
            <InputLabel>Müşteri</InputLabel>
            <Select
              name="customerId"
              value={newRental.customerId}
              label="Müşteri"
              onChange={handleInputChange}
            >
              {customers.map((customer) => (
                <MenuItem key={customer.customerId} value={customer.customerId}>
                  {customer.companyName}
                </MenuItem>
              ))}
            </Select>
          </FormControl>

          <TextField
            fullWidth
            label="Kiralama Tarihi"
            type="date"
            name="rentDate"
            value={newRental.rentDate}
            onChange={handleInputChange}
            sx={{ mt: 2 }}
            InputLabelProps={{ shrink: true }}
          />

          <TextField
            fullWidth
            label="Dönüş Tarihi"
            type="date"
            name="returnDate"
            value={newRental.returnDate}
            onChange={handleInputChange}
            sx={{ mt: 2 }}
            InputLabelProps={{ shrink: true }}
          />
        </DialogContent>
        <DialogActions>
          <Button onClick={handleDialogClose}>İptal</Button>
          <Button onClick={handleSubmit} variant="contained" color="primary">
            Devam Et
          </Button>
        </DialogActions>
      </Dialog>
    </Container>
  );
}

export default Rentals;
