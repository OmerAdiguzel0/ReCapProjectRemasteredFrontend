import React, { useState } from 'react';
import {
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Button,
  TextField,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
  Grid,
  Box,
  IconButton,
  ImageList,
  ImageListItem,
  ImageListItemBar,
} from '@mui/material';
import DeleteIcon from '@mui/icons-material/Delete';
import AddPhotoAlternateIcon from '@mui/icons-material/AddPhotoAlternate';
import api from '../api';

function UpdateCarForm({ open, onClose, car, brands, colors, onUpdate }) {
  const [formData, setFormData] = useState({
    brandId: car.brandId,
    colorId: car.colorId,
    modelYear: car.modelYear,
    dailyPrice: car.dailyPrice,
    description: car.description,
    minFindeksScore: car.minFindeksScore,
  });
  const [selectedFile, setSelectedFile] = useState(null);
  const [currentImages, setCurrentImages] = useState(car.imagePaths || []);
  const fileInputRef = React.useRef();

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
  };

  const handleFileSelect = (event) => {
    const file = event.target.files[0];
    if (file) {
      setSelectedFile(file);
    }
  };

  const handleDeleteImage = async (imagePath) => {
    try {
        // Backend'e silme isteği gönder
        await api.deleteCarImageByPath(imagePath);
        
        // Başarılı olursa UI'dan kaldır
        setCurrentImages(prev => prev.filter(path => path !== imagePath));
    } catch (error) {
        console.error('Error deleting image:', error);
        // Hata durumunda kullanıcıya bilgi ver
        // Eğer bir error state'iniz varsa onu kullanabilirsiniz
        alert('Resim silinirken bir hata oluştu');
    }
  };

  const handleSubmit = () => {
    const updateData = new FormData();
    
    // Form verilerini ekle
    updateData.append('carId', car.carId);
    updateData.append('brandId', formData.brandId);
    updateData.append('colorId', formData.colorId);
    updateData.append('modelYear', formData.modelYear);
    updateData.append('dailyPrice', formData.dailyPrice);
    updateData.append('description', formData.description);
    updateData.append('minFindeksScore', formData.minFindeksScore);

    // Yeni resim varsa ekle
    if (selectedFile) {
        updateData.append('ImagePath', selectedFile);
    }

    // Mevcut resimleri ekle
    updateData.append('imagePaths', JSON.stringify(currentImages));

    onUpdate(updateData);
  };

  return (
    <Dialog open={open} onClose={onClose} maxWidth="md" fullWidth>
      <DialogTitle>Araç Güncelle</DialogTitle>
      <DialogContent>
        <Grid container spacing={2} sx={{ mt: 1 }}>
          {/* Mevcut form alanları */}
          <Grid item xs={12} sm={6}>
            <FormControl fullWidth>
              <InputLabel>Marka</InputLabel>
              <Select
                name="brandId"
                value={formData.brandId}
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

          <Grid item xs={12} sm={6}>
            <FormControl fullWidth>
              <InputLabel>Renk</InputLabel>
              <Select
                name="colorId"
                value={formData.colorId}
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

          <Grid item xs={12} sm={6}>
            <TextField
              fullWidth
              label="Model Yılı"
              name="modelYear"
              type="number"
              value={formData.modelYear}
              onChange={handleInputChange}
            />
          </Grid>

          <Grid item xs={12} sm={6}>
            <TextField
              fullWidth
              label="Günlük Ücret"
              name="dailyPrice"
              type="number"
              value={formData.dailyPrice}
              onChange={handleInputChange}
            />
          </Grid>

          <Grid item xs={12}>
            <TextField
              fullWidth
              label="Açıklama"
              name="description"
              multiline
              rows={3}
              value={formData.description}
              onChange={handleInputChange}
            />
          </Grid>

          <Grid item xs={12} sm={6}>
            <TextField
              fullWidth
              label="Minimum Findeks Puanı"
              name="minFindeksScore"
              type="number"
              value={formData.minFindeksScore}
              onChange={handleInputChange}
            />
          </Grid>

          {/* Mevcut Resimler */}
          <Grid item xs={12}>
            <Box sx={{ mb: 2 }}>
              <ImageList sx={{ maxHeight: 200 }} cols={3} rowHeight={164}>
                {currentImages.map((imagePath, index) => (
                  <ImageListItem key={index}>
                    <img
                      src={`http://localhost:7108${imagePath}`}
                      alt={`Car Image ${index + 1}`}
                      loading="lazy"
                      style={{ height: '100%', objectFit: 'cover' }}
                    />
                    <ImageListItemBar
                      actionIcon={
                        <IconButton
                          sx={{ color: 'rgba(255, 255, 255, 0.54)' }}
                          onClick={() => handleDeleteImage(imagePath)}
                        >
                          <DeleteIcon />
                        </IconButton>
                      }
                    />
                  </ImageListItem>
                ))}
              </ImageList>
            </Box>
          </Grid>

          {/* Yeni Resim Ekleme */}
          <Grid item xs={12}>
            <input
              type="file"
              accept="image/*"
              onChange={handleFileSelect}
              ref={fileInputRef}
              style={{ display: 'none' }}
            />
            <Button
              variant="outlined"
              startIcon={<AddPhotoAlternateIcon />}
              onClick={() => fileInputRef.current?.click()}
              fullWidth
            >
              Yeni Resim Ekle
            </Button>
            {selectedFile && (
              <Box sx={{ mt: 1 }}>
                Seçilen dosya: {selectedFile.name}
              </Box>
            )}
          </Grid>
        </Grid>
      </DialogContent>
      <DialogActions>
        <Button onClick={onClose}>İptal</Button>
        <Button onClick={handleSubmit} variant="contained" color="primary">
          Güncelle
        </Button>
      </DialogActions>
    </Dialog>
  );
}

export default UpdateCarForm; 