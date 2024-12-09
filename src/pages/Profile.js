import React, { useState, useEffect, useRef } from 'react';
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
  Switch,
  IconButton
} from '@mui/material';
import { getUser } from '../utils/auth';
import PersonIcon from '@mui/icons-material/Person';
import EmailIcon from '@mui/icons-material/Email';
import AdminPanelSettingsIcon from '@mui/icons-material/AdminPanelSettings';
import LockIcon from '@mui/icons-material/Lock';
import api from '../api';
import DeleteIcon from '@mui/icons-material/Delete';
import EditIcon from '@mui/icons-material/Edit';

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
  const userStr = localStorage.getItem('user');
  const [profileImage, setProfileImage] = useState(null);
  const fileInputRef = useRef(null);

  useEffect(() => {
    const userData = getUser();
    setUser(userData);
  }, []);

  useEffect(() => {
    const fetchProfileImage = async () => {
        try {
            // Önce localStorage'dan kontrol et
            const userStr = localStorage.getItem('user');
            if (userStr) {
                const user = JSON.parse(userStr);
                if (user.profileImagePath) {
                    console.log('Profile image found in localStorage:', user.profileImagePath);
                    setProfileImage(`http://localhost:7108/${user.profileImagePath}`);
                    return;
                }
            }

            // Eğer localStorage'da yoksa API'den getir
            console.log('Fetching profile image from API...');
            const response = await api.getProfileImage();
            console.log('API Response:', response.data);

            if (response.data.success && response.data.data) {
                const imagePath = response.data.data;
                console.log('Setting profile image:', imagePath);
                setProfileImage(`http://localhost:7108/${imagePath}`);
                
                // localStorage'ı güncelle
                if (userStr) {
                    const user = JSON.parse(userStr);
                    user.profileImagePath = imagePath;
                    localStorage.setItem('user', JSON.stringify(user));
                    console.log('Updated user in localStorage:', user);
                }
            }
        } catch (error) {
            console.error('Profil fotoğrafı yüklenirken hata:', error);
            setError('Profil fotoğrafı yüklenirken bir hata oluştu');
        }
    };

    fetchProfileImage();
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

  const handleImageUpload = async (event) => {
    const file = event.target.files[0];
    if (!file) return;

    try {
        console.log('Yüklenecek dosya:', file);
        console.log('Dosya boyutu:', file.size, 'bytes');
        console.log('Dosya tipi:', file.type);

        const response = await api.uploadProfileImage(file);
        console.log('Upload response:', response);

        if (response.data.success) {
            const newImagePath = response.data.data;
            console.log('Yeni resim yolu:', newImagePath);
            setProfileImage(`http://localhost:7108/${newImagePath}`);
            setSuccess('Profil fotoğrafı başarıyla güncellendi');

            // localStorage'daki user bilgisini güncelle
            const userStr = localStorage.getItem('user');
            if (userStr) {
                const user = JSON.parse(userStr);
                user.profileImagePath = newImagePath;
                localStorage.setItem('user', JSON.stringify(user));
                console.log('User bilgisi güncellendi:', user);
            }

            // Navbar'ı yenilemek için bir event yayınla
            window.dispatchEvent(new Event('profileImageUpdate'));
        }
    } catch (error) {
        console.error('Profil fotoğrafı yükleme hatası:', error);
        console.error('Hata detayı:', error.response?.data);
        setError(error.response?.data?.message || 'Profil fotoğrafı yüklenirken bir hata oluştu');
    }
  };

  const handleDeleteImage = async () => {
    try {
        const response = await api.deleteProfileImage();
        if (response.data.success) {
            setProfileImage(null);
            setSuccess('Profil fotoğrafı başarıyla silindi');

            // localStorage'daki user bilgisini güncelle
            const userStr = localStorage.getItem('user');
            if (userStr) {
                const user = JSON.parse(userStr);
                user.profileImagePath = null;
                localStorage.setItem('user', JSON.stringify(user));
            }

            // Navbar'ı güncellemek için event yayınla
            window.dispatchEvent(new Event('profileImageUpdate'));
        }
    } catch (error) {
        setError(error.response?.data?.message || 'Profil fotoğrafı silinirken bir hata oluştu');
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
          <Box sx={{ position: 'relative' }}>
            <Avatar
              sx={{
                width: 100,
                height: 100,
                bgcolor: 'primary.main',
                fontSize: '2.5rem',
                cursor: 'pointer'
              }}
              src={profileImage}
              onClick={() => fileInputRef.current?.click()}
            >
              {!profileImage && user.firstName.charAt(0)}
            </Avatar>
            <input
              type="file"
              ref={fileInputRef}
              style={{ display: 'none' }}
              accept="image/*"
              onChange={handleImageUpload}
            />
            {profileImage && (
              <IconButton
                sx={{
                  position: 'absolute',
                  right: -10,
                  bottom: -10,
                  bgcolor: 'background.paper'
                }}
                size="small"
                onClick={handleDeleteImage}
              >
                <DeleteIcon />
              </IconButton>
            )}
            <IconButton
              sx={{
                position: 'absolute',
                right: -10,
                top: -10,
                bgcolor: 'background.paper'
              }}
              size="small"
              onClick={() => fileInputRef.current?.click()}
            >
              <EditIcon />
            </IconButton>
          </Box>
          <Box sx={{ ml: 3 }}>
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