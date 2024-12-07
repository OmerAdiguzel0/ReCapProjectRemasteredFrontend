import axios from 'axios';

// Axios instance oluştur
const axiosInstance = axios.create({
  baseURL: 'http://localhost:7108/api',
  headers: {
    'Content-Type': 'application/json'
  }
});

// Request Interceptor
axiosInstance.interceptors.request.use(
  config => {
    const token = localStorage.getItem('token');
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  error => {
    return Promise.reject(error);
  }
);

// Response Interceptor
axiosInstance.interceptors.response.use(
  response => response,
  error => {
    if (error.response?.status === 401) {
      localStorage.removeItem('token');
      localStorage.removeItem('user');
      window.location.href = '/login';
    }
    return Promise.reject(error);
  }
);

const api = {
  // Auth işlemleri
  login: async (credentials) => {
    try {
        console.group('Login Process');
        console.log('Login attempt with:', { email: credentials.email });
        
        const response = await axiosInstance.post('/auth/login', credentials);
        console.log('Login response:', response.data);
        
        if (response.data.success) {
            const userData = response.data.data;
            console.log('User data:', userData);
            console.log('Claims:', userData.claims);
            
            // Token işlemleri
            const token = userData.token;
            console.log('Token received:', !!token);
            localStorage.setItem('token', token);
            
            // Claims kontrolü
            const roleClaim = userData.claims?.find(
                c => c.type === "http://schemas.microsoft.com/ws/2008/06/identity/claims/role"
            );
            console.log('Role claim:', roleClaim);

            // User data storage
            const userToStore = {
                id: userData.id,
                email: userData.email,
                firstName: userData.firstName,
                lastName: userData.lastName,
                claims: userData.claims
            };
            console.log('Storing user data:', userToStore);
            localStorage.setItem('user', JSON.stringify(userToStore));

            // Headers güncelleme
            axiosInstance.defaults.headers.common['Authorization'] = `Bearer ${token}`;
            console.log('Authorization header updated');
        }
        
        return response;
    } catch (error) {
        console.error('Login error:', error);
        console.error('Error details:', {
            message: error.message,
            response: error.response?.data
        });
        throw error;
    } finally {
        console.groupEnd();
    }
  },
  register: (userData) => axiosInstance.post('/auth/register', userData),

  // Kullanıcı ve rol işlemleri
  getAllUsers: () => axiosInstance.get('/users/getall'),
  getAllRoles: () => axiosInstance.get('/users/roles'),
  deleteUser: (userId) => axiosInstance.delete(`/users/${userId}`),
  addRole: (roleName) => axiosInstance.post('/users/roles', { name: roleName }),
  deleteRole: (roleId) => axiosInstance.delete(`/users/roles/${roleId}`),
  updateUserRole: (userId, roleId) => axiosInstance.put(`/users/role/${userId}`, { roleId: roleId }),
  updateRole: (roleId, roleName) => axiosInstance.put(`/users/roles/${roleId}`, { name: roleName }),

  // Araba işlemleri
  getAllCars: () => axiosInstance.get('/cars'),
  getCarDetails: () => axiosInstance.get('/cars/detail'),
  addCar: async (carData) => {
    try {
        console.group('Car Add Operation');
        console.log('Initial Data:', carData);

        // Önce arabayı ekle
        const carResponse = await axiosInstance.post('/cars', {
            brandId: parseInt(carData.brandId) || 0,
            colorId: parseInt(carData.colorId) || 0,
            modelYear: parseInt(carData.modelYear) || new Date().getFullYear(),
            dailyPrice: parseFloat(carData.dailyPrice) || 0,
            description: (carData.description || '').trim(),
            minFindeksScore: parseInt(carData.minFindeksScore) || 500
        });

        console.log('Car Add Response:', carResponse.data);

        if (!carResponse.data.success) {
            throw new Error(carResponse.data.message || 'Araba eklenemedi');
        }

        // Resim yükleme işlemi
        if (carData.image && carResponse.data.data?.carId) {
            console.group('Image Upload');
            try {
                const formData = new FormData();
                formData.append('ImagePath', carData.image);
                formData.append('carId', carResponse.data.data.carId);

                console.log('Image Upload Data:', {
                    fileName: carData.image.name,
                    fileSize: carData.image.size,
                    fileType: carData.image.type,
                    carId: carResponse.data.data.carId
                });

                const imageResponse = await axiosInstance.post('/carimages/add', formData, {
                    headers: {
                        'Content-Type': 'multipart/form-data'
                    }
                });

                if (!imageResponse.data.success) {
                    console.error('Image upload failed:', imageResponse.data.message);
                    throw new Error(imageResponse.data.message);
                }

                console.log('Image Upload Response:', imageResponse.data);
            } catch (imageError) {
                console.error('Image Upload Error:', imageError);
                throw imageError; // Resim yükleme hatasını yukarı fırlat
            } finally {
                console.groupEnd();
            }
        }

        console.groupEnd();
        return carResponse;
    } catch (error) {
        console.error('Operation Failed:', error);
        throw error;
    }
  },
  updateCar: async (carId, updateData) => {
    try {
        console.log('Updating car:', carId, updateData);

        // FormData'yı normal bir objeye dönüştür
        const carData = {
            carId: carId,
            brandId: parseInt(updateData.get('brandId')),
            colorId: parseInt(updateData.get('colorId')),
            modelYear: parseInt(updateData.get('modelYear')),
            dailyPrice: parseFloat(updateData.get('dailyPrice')),
            description: updateData.get('description'),
            minFindeksScore: parseInt(updateData.get('minFindeksScore')),
            imagePaths: JSON.parse(updateData.get('imagePaths') || '[]')
        };

        // Önce araç bilgilerini güncelle
        const response = await axiosInstance.put(`/cars/${carId}`, carData);

        // Eğer yeni resim varsa, resmi yükle
        const imageFile = updateData.get('ImagePath');
        if (imageFile) {
            const imageFormData = new FormData();
            imageFormData.append('ImagePath', imageFile);
            imageFormData.append('carId', carId);
            
            await axiosInstance.post('/carimages/add', imageFormData, {
                headers: {
                    'Content-Type': 'multipart/form-data'
                }
            });
        }

        return response;
    } catch (error) {
        console.error('Car update error:', error);
        throw error;
    }
  },
  deleteCar: (carId) => axiosInstance.delete(`/cars/${carId}`),

  // Araba resmi işlemleri
  uploadCarImage: async (file, carId) => {
    const formData = new FormData();
    formData.append('ImagePath', file);
    formData.append('carId', carId);
    return axiosInstance.post('/carimages/add', formData, {
      headers: { 'Content-Type': 'multipart/form-data' }
    });
  },
  getCarImages: (carId) => axiosInstance.get(`/carimages/getbycarid?carId=${carId}`),
  deleteCarImage: (imageId) => axiosInstance.delete(`/carimages/${imageId}`),
  deleteCarImageByPath: async (imagePath) => {
    try {
        return await axiosInstance.delete('/carimages/deleteByPath', {
            data: { imagePath }
        });
    } catch (error) {
        console.error('Error deleting image:', error);
        throw error;
    }
  },

  // Marka işlemleri
  getAllBrands: () => axiosInstance.get('/brands/getall'),
  addBrand: (brandName) => axiosInstance.post('/brands/add', { 
    brandId: 0, 
    brandName: brandName.trim() 
  }),
  updateBrand: (brandId, brandName) => axiosInstance.post('/brands/update', { 
    brandId: parseInt(brandId), 
    brandName: brandName.trim() 
  }),
  deleteBrand: (brandId) => {
    return axiosInstance.delete(`/brands/${brandId}`);
  },

  // Renk işlemleri
  getAllColors: () => axiosInstance.get('/colors/getall'),
  addColor: (colorName) => axiosInstance.post('/colors/add', { 
    colorId: 0, 
    colorName: colorName.trim() 
  }),
  updateColor: (colorId, colorName) => axiosInstance.post('/colors/update', { 
    colorId: parseInt(colorId), 
    colorName: colorName.trim() 
  }),
  deleteColor: (colorId) => axiosInstance.delete(`/colors/${colorId}`),

  // Admin işlemleri
  // ...

  changePassword: async (passwordData) => {
    try {
      return await axiosInstance.post('/users/changepassword', passwordData);
    } catch (error) {
      console.error('Password change error:', error);
      throw error;
    }
  },
};

export default api;
