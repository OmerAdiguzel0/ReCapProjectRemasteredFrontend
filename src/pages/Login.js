import React, { useState } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import api from '../api';
import {
  Container,
  Paper,
  Typography,
  TextField,
  Button,
  Box,
  Alert,
  Avatar
} from '@mui/material';
import PersonIcon from '@mui/icons-material/Person';

function Login() {
  const navigate = useNavigate();
  const location = useLocation();
  const returnUrl = location.state?.returnUrl || '/';
  const [formData, setFormData] = useState({
    email: '',
    password: ''
  });
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  const handleInputChange = (event) => {
    const { name, value } = event.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
  };

  const handleSubmit = async (event) => {
    event.preventDefault();
    setLoading(true);
    setError('');
    
    try {
        console.log('Login attempt with:', formData);
        const response = await api.login(formData);
        
        if (response.data.success) {
            navigate(returnUrl);
        } else {
            setError(response.data.message || 'Giriş başarısız');
        }
    } catch (error) {
        console.error('Login error:', error);
        setError(error.response?.data?.message || 'Giriş yapılırken bir hata oluştu');
    } finally {
        setLoading(false);
    }
  };

  return (
    <Container maxWidth="sm" sx={{ mt: 8 }}>
      <Paper elevation={3} sx={{ p: 4 }}>
        <Box sx={{ display: 'flex', flexDirection: 'column', alignItems: 'center', mb: 3 }}>
          <Avatar 
            sx={{ 
              width: 80, 
              height: 80, 
              bgcolor: 'primary.main',
              mb: 2
            }}
          >
            <PersonIcon sx={{ fontSize: 50 }} />
          </Avatar>
          <Typography variant="h4" component="h1" align="center" gutterBottom>
            Kullanıcı Girişi
          </Typography>
        </Box>

        {error && (
          <Alert severity="error" sx={{ mb: 2 }}>
            {error}
          </Alert>
        )}

        <form onSubmit={handleSubmit}>
          <TextField
            fullWidth
            label="E-posta"
            name="email"
            type="email"
            value={formData.email}
            onChange={handleInputChange}
            margin="normal"
            required
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
          />

          <Button
            type="submit"
            variant="contained"
            color="primary"
            fullWidth
            size="large"
            sx={{ mt: 3 }}
            disabled={loading}
          >
            {loading ? 'Giriş Yapılıyor...' : 'Giriş Yap'}
          </Button>
        </form>
      </Paper>
    </Container>
  );
}

export default Login;
