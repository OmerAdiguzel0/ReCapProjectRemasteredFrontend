import React, { useState } from 'react';
import {
  Container,
  Paper,
  Typography,
  TextField,
  Button,
  Box,
  Alert,
  CircularProgress
} from '@mui/material';
import api, { BASE_URL } from '../api';

function FindeksCalculator() {
  const [formData, setFormData] = useState({
    tckn: '',
    birthYear: ''
  });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const [findeksScore, setFindeksScore] = useState(null);

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setSuccess('');
    setFindeksScore(null);

    try {
        setLoading(true);
        // Findeks puanını hesapla
        const response = await api.findeks.calculate(formData);
        
        if (response.data.success) {
            const calculatedScore = response.data.data;
            setFindeksScore(calculatedScore);
            
            // Kullanıcı bilgilerini al
            const userStr = localStorage.getItem('user');
            if (userStr) {
                const user = JSON.parse(userStr);
                // Hesaplanan puanı kullanıcıya kaydet
                await api.findeks.updateScore(user.id, calculatedScore);
                setSuccess('Findeks puanınız hesaplandı ve profilinize kaydedildi');
            }
        } else {
            setError(response.data.message);
        }
    } catch (error) {
        setError(error.response?.data?.message || 'Findeks puanı hesaplanırken bir hata oluştu');
    } finally {
        setLoading(false);
    }
  };

  return (
    <Container maxWidth="sm" sx={{ mt: 4 }}>
      <Paper elevation={3} sx={{ p: 4 }}>
        <Typography variant="h4" component="h1" align="center" gutterBottom>
          Findeks Puanı Hesapla
        </Typography>

        {error && (
          <Alert severity="error" sx={{ mb: 2 }}>
            {error}
          </Alert>
        )}

        {success && (
          <Alert severity="success" sx={{ mb: 2 }}>
            {success}
          </Alert>
        )}

        <form onSubmit={handleSubmit}>
          <TextField
            fullWidth
            label="TCKN"
            name="tckn"
            value={formData.tckn}
            onChange={handleInputChange}
            margin="normal"
            required
            inputProps={{
              maxLength: 11,
              pattern: "[0-9]*"
            }}
          />

          <TextField
            fullWidth
            label="Doğum Yılı"
            name="birthYear"
            value={formData.birthYear}
            onChange={handleInputChange}
            margin="normal"
            required
            inputProps={{
              maxLength: 4,
              pattern: "[0-9]*"
            }}
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
            {loading ? <CircularProgress size={24} /> : 'Hesapla'}
          </Button>
        </form>

        {findeksScore !== null && (
          <Box sx={{ mt: 4, textAlign: 'center' }}>
            <Typography variant="h5" gutterBottom>
              Findeks Puanınız
            </Typography>
            <Typography variant="h3" color="primary">
              {findeksScore}
            </Typography>
            <Typography variant="body2" color="text.secondary" sx={{ mt: 1 }}>
              Bu puan kredi geçmişiniz ve diğer faktörler göz önünde bulundurularak hesaplanmıştır.
            </Typography>
          </Box>
        )}
      </Paper>
    </Container>
  );
}

export default FindeksCalculator; 