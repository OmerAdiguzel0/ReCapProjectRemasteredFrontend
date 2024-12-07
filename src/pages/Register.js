import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import api from '../api';
import {
  Container,
  Paper,
  Typography,
  TextField,
  Button,
  Alert,
} from '@mui/material';

function Register() {
  const navigate = useNavigate();
  const [formData, setFormData] = useState({
    firstName: '',
    lastName: '',
    email: '',
    password: '',
    confirmPassword: ''
  });
  const [error, setError] = useState('');

  const handleInputChange = (event) => {
    const { name, value } = event.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
  };

  const handleSubmit = async (event) => {
    event.preventDefault();
    setError('');

    // Validasyonlar
    if (!formData.email || !formData.password || !formData.firstName || !formData.lastName) {
      setError('Lütfen tüm alanları doldurun');
      return;
    }

    if (formData.password !== formData.confirmPassword) {
      setError('Şifreler eşleşmiyor');
      return;
    }

    if (formData.password.length < 6) {
      setError('Şifre en az 6 karakter olmalıdır');
      return;
    }

    try {
      const userData = {
        email: formData.email,
        password: formData.password,
        firstName: formData.firstName,
        lastName: formData.lastName
      };

      console.log('Kayıt isteği gönderiliyor:', userData);
      const response = await api.register(userData);
      console.log('Kayıt yanıtı:', response);
      
      if (response.data && response.data.success) {
        // Token ve kullanıcı bilgilerini kaydet
        localStorage.setItem('token', response.data.data.token);
        localStorage.setItem('userEmail', response.data.data.email);
        localStorage.setItem('userId', response.data.data.userId);
        localStorage.setItem('userType', 'user');
        
        // Başarılı kayıt sonrası yönlendirme
        navigate('/cars');
      } else {
        setError(response.data.message || 'Kayıt işlemi başarısız oldu.');
      }
    } catch (error) {
      console.error('Kayıt hatası:', error);
      if (error.message === 'Network Error') {
        setError('Sunucuya bağlanılamadı. Lütfen internet bağlantınızı kontrol edin.');
      } else {
        setError(error.message || 'Kayıt işlemi başarısız oldu. Lütfen daha sonra tekrar deneyin.');
      }
    }
  };

  return (
    <Container maxWidth="sm" sx={{ mt: 8 }}>
      <Paper elevation={3} sx={{ p: 4 }}>
        <Typography variant="h4" component="h1" align="center" gutterBottom>
          Kayıt Ol
        </Typography>

        {error && (
          <Alert severity="error" sx={{ mb: 2 }}>
            {error}
          </Alert>
        )}

        <form onSubmit={handleSubmit} noValidate>
          <TextField
            fullWidth
            label="Ad"
            name="firstName"
            value={formData.firstName}
            onChange={handleInputChange}
            margin="normal"
            required
            autoComplete="given-name"
          />

          <TextField
            fullWidth
            label="Soyad"
            name="lastName"
            value={formData.lastName}
            onChange={handleInputChange}
            margin="normal"
            required
            autoComplete="family-name"
          />

          <TextField
            fullWidth
            label="E-posta"
            name="email"
            type="email"
            value={formData.email}
            onChange={handleInputChange}
            margin="normal"
            required
            autoComplete="email"
          />

          <TextField
            fullWidth
            label="Şifre"
            name="password"
            type="password"
            value={formData.password}
            onChange={handleInputChange}
            margin="normal"
            required
            helperText="En az 6 karakter olmalıdır"
            autoComplete="new-password"
          />

          <TextField
            fullWidth
            label="Şifre Tekrar"
            name="confirmPassword"
            type="password"
            value={formData.confirmPassword}
            onChange={handleInputChange}
            margin="normal"
            required
            autoComplete="new-password"
          />

          <Button
            type="submit"
            variant="contained"
            color="primary"
            fullWidth
            size="large"
            sx={{ mt: 3 }}
          >
            Kayıt Ol
          </Button>

          <Button
            variant="text"
            color="primary"
            fullWidth
            size="large"
            sx={{ mt: 1 }}
            onClick={() => navigate('/login')}
          >
            Zaten hesabın var mı? Giriş yap
          </Button>
        </form>
      </Paper>
    </Container>
  );
}

export default Register;
