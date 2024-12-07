import React, { useState, useRef, useEffect } from 'react';
import api from '../../api';
import {
  Container,
  Paper,
  Typography,
  TextField,
  Button,
  Box,
  Alert,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
  Grid,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  IconButton,
  Tabs,
  Tab,
  CircularProgress
} from '@mui/material';
import DeleteIcon from '@mui/icons-material/Delete';
import EditIcon from '@mui/icons-material/Edit';
import './AdminDashboard.css';
import axios from 'axios';
import CloudUploadIcon from '@mui/icons-material/CloudUpload';
import UpdateCarForm from '../../components/UpdateCarForm';
import { isAdmin } from '../../utils/auth';
import { useNavigate } from 'react-router-dom';

function AdminDashboard() {
  // State tanımlamaları
  const [activeTab, setActiveTab] = useState(0);
  const [error, setError] = useState(null);
  const [success, setSuccess] = useState(null);
  const [loading, setLoading] = useState(false);
  const [selectedFile, setSelectedFile] = useState(null);
  const fileInputRef = useRef(null);
  
  // Veri state'leri
  const [cars, setCars] = useState([]);
  const [brands, setBrands] = useState([]);
  const [colors, setColors] = useState([]);
  const [users, setUsers] = useState([]);
  const [roles, setRoles] = useState([]);

  // Form state'leri
  const [yeniAraba, setYeniAraba] = useState({
    brandId: '',
    colorId: '',
    modelYear: '',
    dailyPrice: '',
    description: '',
    minFindeksScore: 500
  });

  const [yeniMarka, setYeniMarka] = useState({
    brandName: ''
  });

  const [yeniRenk, setYeniRenk] = useState({
    colorName: ''
  });

  const [yeniRol, setYeniRol] = useState({
    name: ''
  });

  // State tanımlamalarına ekle
  const [editingColorId, setEditingColorId] = useState(null);
  const [editingColorName, setEditingColorName] = useState('');
  const [editingBrandId, setEditingBrandId] = useState(null);
  const [editingBrandName, setEditingBrandName] = useState('');
  const [editingRoleId, setEditingRoleId] = useState(null);
  const [editingRoleName, setEditingRoleName] = useState('');
  const [editingCarId, setEditingCarId] = useState(null);
  const [editingCar, setEditingCar] = useState({
    brandId: '',
    colorId: '',
    modelYear: '',
    dailyPrice: '',
    description: '',
    minFindeksScore: 500
  });
  const [updateFormOpen, setUpdateFormOpen] = useState(false);
  const [selectedCar, setSelectedCar] = useState(null);

  const navigate = useNavigate();

  // Tab değiştirme işleyicisi
  const handleTabChange = (event, newValue) => {
    setActiveTab(newValue);
    setError(null);
    setSuccess(null);
  };

  // Verileri getirme fonksiyonları
  const veriGetir = async () => {
    try {
        setLoading(true);
        setError(null);

        const [carsResponse, brandsResponse, colorsResponse, usersResponse, rolesResponse] = 
            await Promise.all([
                api.getCarDetails(),
                api.getAllBrands(),
                api.getAllColors(),
                api.getAllUsers(),
                api.getAllRoles()
            ]);

        if (!isAdmin()) {
            throw new Error('Yetkiniz yok');
        }

        // Başarılı yanıtları state'e kaydet
        if (carsResponse.data.success) {
            setCars(prevCars => {
                // Sadece değişen verileri güncelle
                const newCars = carsResponse.data.data;
                if (JSON.stringify(prevCars) !== JSON.stringify(newCars)) {
                    return newCars;
                }
                return prevCars;
            });
        }

        if (brandsResponse.data.success) setBrands(brandsResponse.data.data);
        if (colorsResponse.data.success) setColors(colorsResponse.data.data);
        if (usersResponse.data.success) setUsers(usersResponse.data.data);
        if (rolesResponse.data.success) setRoles(rolesResponse.data.data);

    } catch (error) {
        console.error('Veri getirme hatası:', error);
        setError(error.response?.data?.message || 'Veriler yüklenirken bir hata oluştu');
        if (!isAdmin()) {
            navigate('/login');
        }
    } finally {
        setLoading(false);
    }
  };

  // Marka işlemleri
  const markaEkle = async () => {
    try {
      if (!yeniMarka.brandName.trim()) {
        setError('Marka adı boş olamaz');
        return;
      }

      const response = await api.addBrand(yeniMarka.brandName);
      if (response.data.success) {
        setSuccess('Marka başarıyla eklendi');
        setYeniMarka({ brandName: '' });
        await veriGetir();
      } else {
        setError(response.data.message);
      }
    } catch (error) {
      console.error('Marka ekleme hatası:', error);
      setError(error.response?.data?.message || 'Marka eklenirken bir hata oluştu');
    }
  };

  const markaSil = async (brandId) => {
    try {
        if (!window.confirm('Bu markayı silmek istediğinizden emin misiniz?')) {
            return;
        }

        setLoading(true);
        const response = await api.deleteBrand(brandId);
        
        if (response.data.success) {
            setSuccess('Marka başarıyla silindi');
            await veriGetir();
        } else {
            setError(response.data.message || 'Marka silinirken bir hata oluştu');
        }
    } catch (error) {
        console.error('Marka silme hatası:', error);
        setError(error.response?.data?.message || 'Marka silinirken bir hata oluştu');
    } finally {
        setLoading(false);
    }
  };

  const markaGuncelle = async (brandId, brandName) => {
    try {
      if (!brandName || !brandName.trim()) {
        setError('Marka adı boş olamaz');
        return;
      }

      const response = await api.updateBrand(brandId, brandName.trim());
      if (response.data.success) {
        setSuccess('Marka başarıyla güncellendi');
        setEditingBrandId(null);
        setEditingBrandName('');
        await veriGetir();
      } else {
        setError(response.data.message);
      }
    } catch (error) {
      console.error('Marka güncelleme hatası:', error);
      setError(error.response?.data?.message || 'Marka güncellenirken bir hata oluştu');
    }
  };

  // Renk işlemleri
  const renkEkle = async () => {
    try {
      if (!yeniRenk.colorName.trim()) {
        setError('Renk adı boş olamaz');
        return;
      }

      const response = await api.addColor(yeniRenk.colorName);
      if (response.data.success) {
        setSuccess('Renk başarıyla eklendi');
        setYeniRenk({ colorName: '' });
        await veriGetir();
      } else {
        setError(response.data.message);
      }
    } catch (error) {
      console.error('Renk ekleme hatası:', error);
      setError(error.response?.data?.message || 'Renk eklenirken bir hata oluştu');
    }
  };

  const renkSil = async (colorId) => {
    try {
      // Silme işlemi öncesi kullanıcıya onay soralım
      if (!window.confirm('Bu rengi silmek istediğinizden emin misiniz?')) {
        return;
      }

      const response = await api.deleteColor(colorId);
      if (response.data.success) {
        setSuccess('Renk başarıyla silindi');
        await veriGetir();
      } else {
        setError(response.data.message);
      }
    } catch (error) {
      console.error('Renk silme hatası:', error);
      setError(error.response?.data?.message || 'Renk silinirken bir hata oluştu');
    }
  };

  const renkGuncelle = async (colorId, colorName) => {
    try {
      if (!colorName || !colorName.trim()) {
        setError('Renk adı boş olamaz');
        return;
      }

      const response = await api.updateColor(colorId, colorName.trim());
      if (response.data.success) {
        setSuccess('Renk başarıyla güncellendi');
        setEditingColorId(null);
        setEditingColorName('');
        await veriGetir();
      } else {
        setError(response.data.message);
      }
    } catch (error) {
      console.error('Renk güncelleme hatası:', error);
      setError(error.response?.data?.message || 'Renk güncellenirken bir hata oluştu');
    }
  };

  // Rol işlemleri
  const rolEkle = async () => {
    try {
      const response = await api.addRole(yeniRol.name);
      if (response.data.success) {
        setSuccess('Rol başarıyla eklendi');
        setYeniRol({ name: '' });
        await veriGetir();
      } else {
        setError(response.data.message);
      }
    } catch (error) {
      setError('Rol eklenirken bir hata oluştu');
    }
  };

  const rolSil = async (roleId) => {
    try {
      const response = await api.deleteRole(roleId);
      if (response.data.success) {
        setSuccess('Rol başarıyla silindi');
        await veriGetir();
      } else {
        setError(response.data.message);
      }
    } catch (error) {
      setError('Rol silinirken bir hata oluştu');
    }
  };

  // Kullanıcı rol güncelleme
  const kullaniciRolGuncelle = async (userId, roleId) => {
    try {
      const response = await api.updateUserRole(userId, roleId);
      if (response.data.success) {
        setSuccess('Kullanıcı rolü güncellendi');
        await veriGetir();
      } else {
        setError(response.data.message);
      }
    } catch (error) {
      setError('Rol güncellenirken bir hata oluştu');
    }
  };

  // Dosya seçme işleyicisi
  const handleFileSelect = (event) => {
    const file = event.target.files[0];
    if (file) {
        console.log('Seçilen dosya:', file);
        setSelectedFile(file);
    }
  };

  // Input değişiklik işleyicisi
  const handleInputChange = (event) => {
    const { name, value } = event.target;
    setYeniAraba(prev => ({
      ...prev,
      [name]: value
    }));
  };

  // Araba silme işleyicisi
  const handleDelete = async (carId) => {
    try {
      const response = await api.deleteCar(carId);
      if (response.data.success) {
        setSuccess('Araba başarıyla silindi');
        await veriGetir();
      } else {
        setError(response.data.message || 'Araba silinirken bir hata oluştu');
      }
    } catch (error) {
      console.error('Silme hatası:', error);
      setError('Araba silinirken bir hata oluştu');
    }
  };

  // Araba ekleme fonksiyonu
  const arabaEkle = async () => {
    try {
      setError(null);
      setSuccess(null);
      setLoading(true);

      // Form validasyonu
      if (!yeniAraba.brandId || !yeniAraba.colorId || !yeniAraba.modelYear || 
          !yeniAraba.dailyPrice || !yeniAraba.description) {
        setError('Lütfen tüm alanları doldurun');
        return;
      }

      // Sayısal değerlerin kontrolü
      if (isNaN(parseFloat(yeniAraba.dailyPrice)) || parseFloat(yeniAraba.dailyPrice) <= 0) {
        setError('Geçerli bir fiyat giriniz');
        return;
      }

      if (isNaN(parseInt(yeniAraba.modelYear)) || parseInt(yeniAraba.modelYear) < 1900) {
        setError('Geçerli bir model yılı giriniz');
        return;
      }

      // Araba verisi hazırla
      const arabaData = {
        brandId: yeniAraba.brandId,
        colorId: yeniAraba.colorId,
        modelYear: yeniAraba.modelYear,
        dailyPrice: yeniAraba.dailyPrice,
        description: yeniAraba.description.trim(),
        minFindeksScore: yeniAraba.minFindeksScore || 500,
        image: selectedFile
      };

      console.log('Gönderilecek araba verisi:', arabaData);

      const response = await api.addCar(arabaData);
      
      if (response.data.success) {
        setSuccess('Araba başarıyla eklendi');
        
        // Formu temizle
        setYeniAraba({
          brandId: '',
          colorId: '',
          modelYear: '',
          dailyPrice: '',
          description: '',
          minFindeksScore: 500
        });
        setSelectedFile(null);
        if (fileInputRef.current) {
          fileInputRef.current.value = '';
        }

        // Verileri yenile
        await veriGetir();
      } else {
        setError(response.data.message || 'Araba eklenirken bir hata oluştu');
      }
    } catch (error) {
      console.error('Araba ekleme hatası:', error);
      setError(error.message || 'Araba eklenirken bir hata oluştu');
    } finally {
      setLoading(false);
    }
  };

  // Renk düzenleme moduna geçiş fonksiyonu
  const handleEditColorClick = (color) => {
    setEditingColorId(color.colorId);
    setEditingColorName(color.colorName);
  };

  // Renk düzenleme iptal fonksiyonu
  const handleCancelEditColor = () => {
    setEditingColorId(null);
    setEditingColorName('');
  };

  // Marka düzenleme fonksiyonları
  const handleEditBrandClick = (brand) => {
    setEditingBrandId(brand.brandId);
    setEditingBrandName(brand.brandName);
  };

  const handleCancelEditBrand = () => {
    setEditingBrandId(null);
    setEditingBrandName('');
  };

  // Kullanıcı silme işlemi
  const kullaniciSil = async (userId) => {
    try {
      if (!window.confirm('Bu kullanıcıyı silmek istediğinizden emin misiniz?')) {
        return;
      }

      const response = await api.deleteUser(userId);
      if (response.data.success) {
        setSuccess('Kullanıcı başarıyla silindi');
        await veriGetir();
      } else {
        setError(response.data.message);
      }
    } catch (error) {
      console.error('Kullanıcı silme hatası:', error);
      setError(error.response?.data?.message || 'Kullanıcı silinirken bir hata oluştu');
    }
  };

  // Rol düzenleme fonksiyonları
  const handleEditRoleClick = (role) => {
    setEditingRoleId(role.id);
    setEditingRoleName(role.name);
  };

  const handleCancelEditRole = () => {
    setEditingRoleId(null);
    setEditingRoleName('');
  };

  // Rol güncelleme fonksiyonu
  const rolGuncelle = async (roleId, roleName) => {
    try {
      if (!roleName || !roleName.trim()) {
        setError('Rol adı boş olamaz');
        return;
      }

      const response = await api.updateRole(roleId, roleName.trim());
      if (response.data.success) {
        setSuccess('Rol başarıyla güncellendi');
        setEditingRoleId(null);
        setEditingRoleName('');
        await veriGetir();
      } else {
        setError(response.data.message);
      }
    } catch (error) {
      console.error('Rol güncelleme hatası:', error);
      setError(error.response?.data?.message || 'Rol güncellenirken bir hata oluştu');
    }
  };

  // Düzenleme modunu aç
  const handleEditClick = (car) => {
    // Mevcut araç bilgilerini ve resmini al
    const currentCar = {
        ...car,
        brandId: brands.find(b => b.brandName === car.brandName)?.brandId,
        colorId: colors.find(c => c.colorName === car.colorName)?.colorId,
        imagePaths: car.imagePaths || []
    };
    setSelectedCar(currentCar);
    setUpdateFormOpen(true);
  };

  // Güncelleme işlemi
  const handleUpdate = async (updateData) => {
    try {
        setError(null);
        setLoading(true);

        const response = await api.updateCar(selectedCar.carId, updateData);
        
        if (response.data.success) {
            setSuccess('Araç başarıyla güncellendi');
            // Verileri hemen yenile
            await veriGetir();
            // Modal'ı kapat
            setUpdateFormOpen(false);
            setSelectedCar(null);
        } else {
            setError(response.data.message || 'Güncelleme başarısız oldu');
        }
    } catch (error) {
        console.error('Güncelleme hatası:', error);
        setError(error.response?.data?.message || 'Güncelleme sırasında bir hata oluştu');
    } finally {
        setLoading(false);
    }
  };

  // Araba silme fonksiyonu
  const arabaSil = async (carId) => {
    try {
        if (!window.confirm('Bu arabayı silmek istediğinizden emin misiniz?')) {
            return;
        }

        setLoading(true);
        const response = await api.deleteCar(carId);
        if (response.data.success) {
            setSuccess('Araba başarıyla silindi');
            await veriGetir();
        } else {
            setError(response.data.message);
        }
    } catch (error) {
        console.error('Araba silme hatası:', error);
        setError(error.response?.data?.message || 'Araba silinirken bir hata oluştu');
    } finally {
        setLoading(false);
    }
};

  useEffect(() => {
    const loadData = async () => {
        await veriGetir();
    };
    loadData();
  }, []); // Sadece component mount olduğunda çalışsın

  return (
    <Container maxWidth="lg" sx={{ mt: 4 }}>
      {loading && (
        <Box
          sx={{
            position: 'fixed',
            top: 0,
            left: 0,
            right: 0,
            bottom: 0,
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            backgroundColor: 'rgba(255, 255, 255, 0.7)',
            zIndex: 9999,
          }}
        >
          <CircularProgress />
        </Box>
      )}

      <Typography variant="h4" gutterBottom>
        Admin Dashboard
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

      <Box sx={{ borderBottom: 1, borderColor: 'divider', mb: 3 }}>
        <Tabs value={activeTab} onChange={handleTabChange}>
          <Tab label="Arabalar" />
          <Tab label="Markalar" />
          <Tab label="Renkler" />
          <Tab label="Kullanıcılar" />
          <Tab label="Roller" />
        </Tabs>
      </Box>

      {/* Arabalar Sekmesi */}
      {activeTab === 0 && (
        <Box>
          {/* Yeni Araba Ekleme Formu */}
          <Paper elevation={3} sx={{ p: 3, mb: 4 }}>
            <Typography variant="h6" gutterBottom>
              Yeni Araba Ekle
            </Typography>
            <Grid container spacing={2}>
              {/* Marka Seçimi */}
              <Grid item xs={12} sm={6}>
                <FormControl fullWidth>
                  <InputLabel>Marka</InputLabel>
                  <Select
                    name="brandId"
                    value={yeniAraba.brandId}
                    onChange={handleInputChange}
                    label="Marka"
                  >
                    {brands.map((brand) => (
                      <MenuItem key={brand.brandId} value={brand.brandId}>
                        {brand.brandName}
                      </MenuItem>
                    ))}
                  </Select>
                </FormControl>
              </Grid>

              {/* Renk Seçimi */}
              <Grid item xs={12} sm={6}>
                <FormControl fullWidth>
                  <InputLabel>Renk</InputLabel>
                  <Select
                    name="colorId"
                    value={yeniAraba.colorId}
                    onChange={handleInputChange}
                    label="Renk"
                  >
                    {colors.map((color) => (
                      <MenuItem key={color.colorId} value={color.colorId}>
                        {color.colorName}
                      </MenuItem>
                    ))}
                  </Select>
                </FormControl>
              </Grid>

              {/* Model Yılı */}
              <Grid item xs={12} sm={6}>
                <TextField
                  fullWidth
                  label="Model Yılı"
                  name="modelYear"
                  type="number"
                  value={yeniAraba.modelYear}
                  onChange={handleInputChange}
                  inputProps={{ min: "1900", max: new Date().getFullYear() + 1 }}
                />
              </Grid>

              {/* Günlük Fiyat */}
              <Grid item xs={12} sm={6}>
                <TextField
                  fullWidth
                  label="Günlük Fiyat"
                  name="dailyPrice"
                  type="number"
                  value={yeniAraba.dailyPrice}
                  onChange={handleInputChange}
                  inputProps={{ min: "0" }}
                />
              </Grid>

              {/* Açıklama */}
              <Grid item xs={12}>
                <TextField
                  fullWidth
                  label="Açıklama"
                  name="description"
                  multiline
                  rows={3}
                  value={yeniAraba.description}
                  onChange={handleInputChange}
                />
              </Grid>

              {/* Findeks Puanı */}
              <Grid item xs={12} sm={6}>
                <TextField
                  fullWidth
                  label="Minimum Findeks Puan"
                  name="minFindeksScore"
                  type="number"
                  value={yeniAraba.minFindeksScore}
                  onChange={handleInputChange}
                  inputProps={{ min: "0", max: "1900" }}
                />
              </Grid>

              {/* Resim Yükleme */}
              <Grid item xs={12} sm={6}>
                <input
                  type="file"
                  accept="image/*"
                  onChange={handleFileSelect}
                  ref={fileInputRef}
                  style={{ display: 'none' }}
                />
                <Button
                  variant="outlined"
                  fullWidth
                  onClick={() => fileInputRef.current?.click()}
                  startIcon={<CloudUploadIcon />}
                >
                  Resim Seç
                </Button>
                {selectedFile && (
                  <Typography variant="caption" display="block" sx={{ mt: 1 }}>
                    Seçilen dosya: {selectedFile.name}
                  </Typography>
                )}
              </Grid>

              {/* Ekleme Butonu */}
              <Grid item xs={12}>
                <Button
                  variant="contained"
                  color="primary"
                  onClick={arabaEkle}
                  fullWidth
                >
                  Araba Ekle
                </Button>
              </Grid>
            </Grid>
          </Paper>

          {/* Arabalar Tablosu */}
          <TableContainer component={Paper}>
            <Table>
              <TableHead>
                <TableRow>
                  <TableCell>Resim</TableCell>
                  <TableCell>Marka</TableCell>
                  <TableCell>Model</TableCell>
                  <TableCell>Renk</TableCell>
                  <TableCell>Model Yılı</TableCell>
                  <TableCell>Günlük Fiyat</TableCell>
                  <TableCell>Findeks Puanı</TableCell>
                  <TableCell>İşlemler</TableCell>
                </TableRow>
              </TableHead>
              <TableBody>
                {cars.map((car) => (
                  <TableRow key={car.carId}>
                    <TableCell>
                      <img
                        src={car.imagePaths && car.imagePaths.length > 0 
                          ? `http://localhost:7108${car.imagePaths[0]}` 
                          : 'http://localhost:7108/Uploads/Images/default.jpg'}
                        alt={car.description}
                        style={{ width: 100, height: 60, objectFit: 'cover' }}
                        onError={(e) => {
                          e.target.src = 'http://localhost:7108/Uploads/Images/default.jpg';
                        }}
                      />
                    </TableCell>
                    <TableCell>
                      {editingCarId === car.carId ? (
                        <FormControl fullWidth>
                          <Select
                            value={editingCar.brandId}
                            onChange={(e) => setEditingCar({...editingCar, brandId: e.target.value})}
                          >
                            {brands.map((brand) => (
                              <MenuItem key={brand.brandId} value={brand.brandId}>
                                {brand.brandName}
                              </MenuItem>
                            ))}
                          </Select>
                        </FormControl>
                      ) : (
                        car.brandName
                      )}
                    </TableCell>
                    <TableCell>
                      {editingCarId === car.carId ? (
                        <TextField
                          fullWidth
                          value={editingCar.description}
                          onChange={(e) => setEditingCar({...editingCar, description: e.target.value})}
                          size="small"
                        />
                      ) : (
                        car.description
                      )}
                    </TableCell>
                    <TableCell>
                      {editingCarId === car.carId ? (
                        <FormControl fullWidth>
                          <Select
                            value={editingCar.colorId}
                            onChange={(e) => setEditingCar({...editingCar, colorId: e.target.value})}
                          >
                            {colors.map((color) => (
                              <MenuItem key={color.colorId} value={color.colorId}>
                                {color.colorName}
                              </MenuItem>
                            ))}
                          </Select>
                        </FormControl>
                      ) : (
                        car.colorName
                      )}
                    </TableCell>
                    <TableCell>
                      {editingCarId === car.carId ? (
                        <TextField
                          type="number"
                          fullWidth
                          value={editingCar.modelYear}
                          onChange={(e) => setEditingCar({...editingCar, modelYear: e.target.value})}
                          size="small"
                          inputProps={{ min: "1900", max: new Date().getFullYear() + 1 }}
                        />
                      ) : (
                        car.modelYear
                      )}
                    </TableCell>
                    <TableCell>
                      {editingCarId === car.carId ? (
                        <TextField
                          type="number"
                          fullWidth
                          value={editingCar.dailyPrice}
                          onChange={(e) => setEditingCar({...editingCar, dailyPrice: e.target.value})}
                          size="small"
                          inputProps={{ min: "0" }}
                        />
                      ) : (
                        `${car.dailyPrice} TL`
                      )}
                    </TableCell>
                    <TableCell>
                      {editingCarId === car.carId ? (
                        <TextField
                          type="number"
                          fullWidth
                          value={editingCar.minFindeksScore}
                          onChange={(e) => setEditingCar({...editingCar, minFindeksScore: e.target.value})}
                          size="small"
                          inputProps={{ min: "0", max: "1900" }}
                        />
                      ) : (
                        car.minFindeksScore
                      )}
                    </TableCell>
                    <TableCell>
                      {editingCarId === car.carId ? (
                        <>
                          <Button
                            onClick={() => handleUpdate(car.carId)}
                            color="primary"
                            size="small"
                            sx={{ mr: 1 }}
                          >
                            Kaydet
                          </Button>
                          <Button
                            onClick={() => setEditingCarId(null)}
                            color="secondary"
                            size="small"
                          >
                            İptal
                          </Button>
                        </>
                      ) : (
                        <>
                          <IconButton onClick={() => handleEditClick(car)} color="primary">
                            <EditIcon />
                          </IconButton>
                          <IconButton onClick={() => arabaSil(car.carId)} color="error">
                            <DeleteIcon />
                          </IconButton>
                        </>
                      )}
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </TableContainer>
        </Box>
      )}

      {/* Markalar Sekmesi */}
      {activeTab === 1 && (
        <Box>
          <Paper elevation={3} sx={{ p: 3, mb: 4 }}>
            <Typography variant="h6" gutterBottom>
              Yeni Marka Ekle
            </Typography>
            <Grid container spacing={2}>
              <Grid item xs={12}>
                <TextField
                  fullWidth
                  label="Marka Adı"
                  value={yeniMarka.brandName}
                  onChange={(e) => setYeniMarka({ brandName: e.target.value })}
                />
              </Grid>
              <Grid item xs={12}>
                <Button
                  variant="contained"
                  color="primary"
                  onClick={markaEkle}
                  fullWidth
                >
                  Marka Ekle
                </Button>
              </Grid>
            </Grid>
          </Paper>

          <TableContainer component={Paper}>
            <Table>
              <TableHead>
                <TableRow>
                  <TableCell>Marka Adı</TableCell>
                  <TableCell>İşlemler</TableCell>
                </TableRow>
              </TableHead>
              <TableBody>
                {brands.map((brand) => (
                  <TableRow key={brand.brandId}>
                    <TableCell>
                      {editingBrandId === brand.brandId ? (
                        <TextField
                          fullWidth
                          value={editingBrandName}
                          onChange={(e) => setEditingBrandName(e.target.value)}
                          size="small"
                        />
                      ) : (
                        brand.brandName
                      )}
                    </TableCell>
                    <TableCell>
                      {editingBrandId === brand.brandId ? (
                        <>
                          <Button
                            onClick={() => markaGuncelle(brand.brandId, editingBrandName)}
                            color="primary"
                            size="small"
                            sx={{ mr: 1 }}
                          >
                            Kaydet
                          </Button>
                          <Button
                            onClick={handleCancelEditBrand}
                            color="secondary"
                            size="small"
                          >
                            İptal
                          </Button>
                        </>
                      ) : (
                        <>
                          <IconButton onClick={() => handleEditBrandClick(brand)} color="primary">
                            <EditIcon />
                          </IconButton>
                          <IconButton onClick={() => markaSil(brand.brandId)} color="error">
                            <DeleteIcon />
                          </IconButton>
                        </>
                      )}
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </TableContainer>
        </Box>
      )}

      {/* Renkler Sekmesi */}
      {activeTab === 2 && (
        <Box>
          <Paper elevation={3} sx={{ p: 3, mb: 4 }}>
            <Typography variant="h6" gutterBottom>
              Yeni Renk Ekle
            </Typography>
            <Grid container spacing={2}>
              <Grid item xs={12}>
                <TextField
                  fullWidth
                  label="Renk Adı"
                  value={yeniRenk.colorName}
                  onChange={(e) => setYeniRenk({ colorName: e.target.value })}
                />
              </Grid>
              <Grid item xs={12}>
                <Button
                  variant="contained"
                  color="primary"
                  onClick={renkEkle}
                  fullWidth
                >
                  Renk Ekle
                </Button>
              </Grid>
            </Grid>
          </Paper>

          <TableContainer component={Paper}>
            <Table>
              <TableHead>
                <TableRow>
                  <TableCell>Renk Adı</TableCell>
                  <TableCell>İşlemler</TableCell>
                </TableRow>
              </TableHead>
              <TableBody>
                {colors.map((color) => (
                  <TableRow key={color.colorId}>
                    <TableCell>
                      {editingColorId === color.colorId ? (
                        <TextField
                          fullWidth
                          value={editingColorName}
                          onChange={(e) => setEditingColorName(e.target.value)}
                          size="small"
                        />
                      ) : (
                        color.colorName
                      )}
                    </TableCell>
                    <TableCell>
                      {editingColorId === color.colorId ? (
                        <>
                          <Button
                            onClick={() => renkGuncelle(color.colorId, editingColorName)}
                            color="primary"
                            size="small"
                            sx={{ mr: 1 }}
                          >
                            Kaydet
                          </Button>
                          <Button
                            onClick={handleCancelEditColor}
                            color="secondary"
                            size="small"
                          >
                            İptal
                          </Button>
                        </>
                      ) : (
                        <>
                          <IconButton onClick={() => handleEditColorClick(color)} color="primary">
                            <EditIcon />
                          </IconButton>
                          <IconButton onClick={() => renkSil(color.colorId)} color="error">
                            <DeleteIcon />
                          </IconButton>
                        </>
                      )}
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </TableContainer>
        </Box>
      )}

      {/* Kullanıcılar Sekmesi */}
      {activeTab === 3 && (
        <TableContainer component={Paper}>
          <Table>
            <TableHead>
              <TableRow>
                <TableCell>E-posta</TableCell>
                <TableCell>Ad</TableCell>
                <TableCell>Soyad</TableCell>
                <TableCell>Rol</TableCell>
                <TableCell>İşlemler</TableCell>
              </TableRow>
            </TableHead>
            <TableBody>
              {users.map((user) => (
                <TableRow key={user.id}>
                  <TableCell>{user.email}</TableCell>
                  <TableCell>{user.firstName}</TableCell>
                  <TableCell>{user.lastName}</TableCell>
                  <TableCell>
                    <FormControl fullWidth>
                      <Select
                        value={user.roleId || ''}
                        onChange={(e) => kullaniciRolGuncelle(user.id, e.target.value)}
                      >
                        {roles.map((role) => (
                          <MenuItem key={role.id} value={role.id}>
                            {role.name}
                          </MenuItem>
                        ))}
                      </Select>
                    </FormControl>
                  </TableCell>
                  <TableCell>
                    <IconButton 
                      onClick={() => kullaniciSil(user.id)} 
                      color="error"
                      disabled={user.roleId === roles.find(r => r.name === 'admin')?.id}
                    >
                      <DeleteIcon />
                    </IconButton>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </TableContainer>
      )}

      {/* Roller Sekmesi */}
      {activeTab === 4 && (
        <Box>
          <Paper elevation={3} sx={{ p: 3, mb: 4 }}>
            <Typography variant="h6" gutterBottom>
              Yeni Rol Ekle
            </Typography>
            <Grid container spacing={2}>
              <Grid item xs={12}>
                <TextField
                  fullWidth
                  label="Rol Adı"
                  value={yeniRol.name}
                  onChange={(e) => setYeniRol({ name: e.target.value })}
                />
              </Grid>
              <Grid item xs={12}>
                <Button
                  variant="contained"
                  color="primary"
                  onClick={rolEkle}
                  fullWidth
                >
                  Rol Ekle
                </Button>
              </Grid>
            </Grid>
          </Paper>

          <TableContainer component={Paper}>
            <Table>
              <TableHead>
                <TableRow>
                  <TableCell>Rol Adı</TableCell>
                  <TableCell>İşlemler</TableCell>
                </TableRow>
              </TableHead>
              <TableBody>
                {roles.map((role) => (
                  <TableRow key={role.id}>
                    <TableCell>
                      {editingRoleId === role.id ? (
                        <TextField
                          fullWidth
                          value={editingRoleName}
                          onChange={(e) => setEditingRoleName(e.target.value)}
                          size="small"
                        />
                      ) : (
                        role.name
                      )}
                    </TableCell>
                    <TableCell>
                      {editingRoleId === role.id ? (
                        <>
                          <Button
                            onClick={() => rolGuncelle(role.id, editingRoleName)}
                            color="primary"
                            size="small"
                            sx={{ mr: 1 }}
                          >
                            Kaydet
                          </Button>
                          <Button
                            onClick={handleCancelEditRole}
                            color="secondary"
                            size="small"
                          >
                            İptal
                          </Button>
                        </>
                      ) : (
                        <>
                          <IconButton 
                            onClick={() => handleEditRoleClick(role)} 
                            color="primary"
                            disabled={role.name === 'admin' || role.name === 'user'}
                          >
                            <EditIcon />
                          </IconButton>
                          <IconButton 
                            onClick={() => rolSil(role.id)} 
                            color="error"
                            disabled={role.name === 'admin' || role.name === 'user'}
                          >
                            <DeleteIcon />
                          </IconButton>
                        </>
                      )}
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </TableContainer>
        </Box>
      )}

      {updateFormOpen && selectedCar && (
        <UpdateCarForm
            open={updateFormOpen}
            onClose={() => {
                setUpdateFormOpen(false);
                setSelectedCar(null);
            }}
            car={selectedCar}
            brands={brands}
            colors={colors}
            onUpdate={handleUpdate}
        />
      )}
    </Container>
  );
}

export default AdminDashboard;
