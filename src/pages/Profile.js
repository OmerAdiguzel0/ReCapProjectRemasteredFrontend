import React, { useState, useEffect } from 'react';
import {
  Container,
  Paper,
  Typography,
  Grid,
  Avatar,
  Box,
  Divider,
  Card,
  CardContent,
  Button,
  TextField,
  Alert,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Switch
} from '@mui/material';
import { getUser } from '../utils/auth';
import PersonIcon from '@mui/icons-material/Person';
import EmailIcon from '@mui/icons-material/Email';
import AdminPanelSettingsIcon from '@mui/icons-material/AdminPanelSettings';
import LockIcon from '@mui/icons-material/Lock';
import api from '../api';
import { useTheme } from '../context/ThemeContext';
import DarkModeIcon from '@mui/icons-material/DarkMode';
import LightModeIcon from '@mui/icons-material/LightMode';

function Profile() {
  const [user, setUser] = useState(null);
  const [openPasswordDialog, setOpenPasswordDialog] = useState(false);
  const [passwordData, setPasswordData] = useState({
    currentPassword: '',
    newPassword: '',
    confirmPassword: ''
  });
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const { darkMode, toggleDarkMode } = useTheme();
  const userStr = localStorage.getItem('user');

  useEffect(() => {
    const userData = getUser();
    setUser(userData);
  }, []);

  const handlePasswordChange = (e) => {
    const { name, value } = e.target;
    setPasswordData(prev => ({
      ...prev,
      [name]: value
    }));
  };

  const handlePasswordSubmit = async () => {
    try {
      setError('');
      
      // Validasyon kontrolleri
      if (!passwordData.currentPassword || !passwordData.newPassword || !passwordData.confirmPassword) {
        setError('Tüm alanları doldurunuz');
        return;
      }

      if (passwordData.newPassword !== passwordData.confirmPassword) {
        setError('Yeni şifreler eşleşmiyor');
        return;
      }

      if (passwordData.newPassword.length < 6) {
        setError('Yeni şifre en az 6 karakter olmalıdır');
        return;
      }

      // API isteği
      const response = await api.changePassword({
        currentPassword: passwordData.currentPassword,
        newPassword: passwordData.newPassword
      });

      if (response.data.success) {
        setSuccess('Şifreniz başarıyla güncellendi');
        setOpenPasswordDialog(false);
        // Form verilerini temizle
        setPasswordData({
          currentPassword: '',
          newPassword: '',
          confirmPassword: ''
        });
      } else {
        setError(response.data.message);
      }
    } catch (error) {
      setError(error.response?.data?.message || 'Şifre değiştirme işlemi başarısız oldu');
    }
  };

  if (!user) {
    return null;
  }

  return (
    <Container maxWidth="md" sx={{ mt: 4 }}>
      {success && (
        <Alert severity="success" sx={{ mb: 2 }}>
          {success}
        </Alert>
      )}

      <Paper elevation={3} sx={{ p: 4 }}>
        <Box sx={{ display: 'flex', alignItems: 'center', mb: 4 }}>
          <Avatar
            sx={{
              width: 100,
              height: 100,
              bgcolor: 'primary.main',
              fontSize: '2.5rem',
              mr: 3
            }}
          >
            {user.firstName.charAt(0)}
          </Avatar>
          <Box>
            <Typography variant="h4" gutterBottom>
              {user.firstName} {user.lastName}
            </Typography>
            <Typography variant="subtitle1" color="textSecondary">
              {user.isAdmin ? 'Admin Kullanıcı' : 'Normal Kullanıcı'}
            </Typography>
          </Box>
        </Box>

        <Divider sx={{ my: 3 }} />

        <Grid container spacing={3}>
          <Grid item xs={12}>
            <Card>
              <CardContent>
                <Typography variant="h6" gutterBottom>
                  Kullanıcı Bilgileri
                </Typography>
                
                <Grid container spacing={2}>
                  <Grid item xs={12}>
                    <Box sx={{ display: 'flex', alignItems: 'center', mb: 2 }}>
                      <PersonIcon sx={{ mr: 2, color: 'primary.main' }} />
                      <Box>
                        <Typography variant="subtitle2" color="textSecondary">
                          Ad Soyad
                        </Typography>
                        <Typography variant="body1">
                          {user.firstName} {user.lastName}
                        </Typography>
                      </Box>
                    </Box>
                  </Grid>

                  <Grid item xs={12}>
                    <Box sx={{ display: 'flex', alignItems: 'center', mb: 2 }}>
                      <EmailIcon sx={{ mr: 2, color: 'primary.main' }} />
                      <Box>
                        <Typography variant="subtitle2" color="textSecondary">
                          E-posta
                        </Typography>
                        <Typography variant="body1">
                          {user.email}
                        </Typography>
                      </Box>
                    </Box>
                  </Grid>

                  <Grid item xs={12}>
                    <Box sx={{ display: 'flex', alignItems: 'center' }}>
                      <AdminPanelSettingsIcon sx={{ mr: 2, color: 'primary.main' }} />
                      <Box>
                        <Typography variant="subtitle2" color="textSecondary">
                          Kullanıcı Tipi
                        </Typography>
                        <Typography variant="body1">
                          {user.isAdmin ? 'Admin Kullanıcı' : 'Normal Kullanıcı'}
                        </Typography>
                      </Box>
                    </Box>
                  </Grid>
                </Grid>

                <Grid item xs={12}>
                  <Box sx={{ display: 'flex', alignItems: 'center', mt: 3 }}>
                    <LockIcon sx={{ mr: 2, color: 'primary.main' }} />
                    <Box sx={{ flexGrow: 1 }}>
                      <Typography variant="subtitle2" color="textSecondary">
                        Şifre Yönetimi
                      </Typography>
                      <Typography variant="body2" color="textSecondary">
                        Hesabınızın güvenliği için şifrenizi düzenli olarak değiştirin
                      </Typography>
                    </Box>
                    <Button 
                      variant="outlined" 
                      color="primary"
                      onClick={() => setOpenPasswordDialog(true)}
                    >
                      Şifre Değiştir
                    </Button>
                  </Box>
                </Grid>

                {userStr && (
                  <Grid item xs={12}>
                    <Box sx={{ display: 'flex', alignItems: 'center', mt: 3 }}>
                      <LightModeIcon sx={{ mr: 2, color: 'primary.main' }} />
                      <Box sx={{ flexGrow: 1 }}>
                        <Typography variant="subtitle2" color="textSecondary">
                          Tema Ayarları
                        </Typography>
                        <Typography variant="body2" color="textSecondary">
                          Koyu tema kullanımını buradan açıp kapatabilirsiniz
                        </Typography>
                      </Box>
                      <Switch
                        checked={darkMode}
                        onChange={toggleDarkMode}
                        icon={<LightModeIcon />}
                        checkedIcon={<DarkModeIcon />}
                      />
                    </Box>
                  </Grid>
                )}
              </CardContent>
            </Card>
          </Grid>
        </Grid>
      </Paper>

      {/* Şifre Değiştirme Dialog'u */}
      <Dialog 
        open={openPasswordDialog} 
        onClose={() => {
          setOpenPasswordDialog(false);
          setError('');
          setPasswordData({
            currentPassword: '',
            newPassword: '',
            confirmPassword: ''
          });
        }}
      >
        <DialogTitle>Şifre Değiştir</DialogTitle>
        <DialogContent>
          {error && (
            <Alert severity="error" sx={{ mb: 2 }}>
              {error}
            </Alert>
          )}
          
          <TextField
            fullWidth
            margin="dense"
            label="Mevcut Şifre"
            type="password"
            name="currentPassword"
            value={passwordData.currentPassword}
            onChange={handlePasswordChange}
          />
          
          <TextField
            fullWidth
            margin="dense"
            label="Yeni Şifre"
            type="password"
            name="newPassword"
            value={passwordData.newPassword}
            onChange={handlePasswordChange}
          />
          
          <TextField
            fullWidth
            margin="dense"
            label="Yeni Şifre (Tekrar)"
            type="password"
            name="confirmPassword"
            value={passwordData.confirmPassword}
            onChange={handlePasswordChange}
          />
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setOpenPasswordDialog(false)}>İptal</Button>
          <Button onClick={handlePasswordSubmit} variant="contained">
            Şifreyi Güncelle
          </Button>
        </DialogActions>
      </Dialog>
    </Container>
  );
}

export default Profile; 