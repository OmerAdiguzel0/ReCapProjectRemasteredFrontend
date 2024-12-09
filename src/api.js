import axios from 'axios';

const BASE_URL = 'http://localhost:7108/api';

// Request Interceptor
axios.interceptors.request.use(
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
axios.interceptors.response.use(
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
            console.log('Login attempt with:', credentials);
            
            const response = await axios.post(`${BASE_URL}/auth/login`, {
                email: credentials.email,
                password: credentials.password
            });
            
            if (response.data.success) {
                const userData = response.data.data;
                
                // Token işlemleri
                const token = userData.token;
                localStorage.setItem('token', token);
                
                // Headers güncelleme
                axios.defaults.headers.common['Authorization'] = `Bearer ${token}`;

                // User data storage
                const userToStore = {
                    id: userData.userId,
                    email: userData.email,
                    firstName: userData.firstName,
                    lastName: userData.lastName,
                    isAdmin: userData.isAdmin,
                    profileImagePath: userData.profileImagePath,
                    claims: userData.claims
                };
                
                localStorage.setItem('user', JSON.stringify(userToStore));
            }
            
            return response;
        } catch (error) {
            console.error('Login error:', error);
            console.error('Error details:', {
                message: error.message,
                response: error.response?.data
            });
            throw error;
        }
    },
    register: (userData) => axios.post(`${BASE_URL}/auth/register`, userData),

    // Kullanıcı ve rol işlemleri
    getAllUsers: () => axios.get(`${BASE_URL}/users/getall`),
    getAllRoles: () => axios.get(`${BASE_URL}/users/roles`),
    deleteUser: (userId) => axios.delete(`${BASE_URL}/users/${userId}`),
    addRole: (roleName) => axios.post(`${BASE_URL}/users/roles`, { name: roleName }),
    deleteRole: (roleId) => axios.delete(`${BASE_URL}/users/roles/${roleId}`),
    updateUserRole: (userId, roleId) => axios.put(`${BASE_URL}/users/role/${userId}`, { roleId: roleId }),
    updateRole: (roleId, roleName) => axios.put(`${BASE_URL}/users/roles/${roleId}`, { name: roleName }),

    // Araba işlemleri
    getAllCars: () => axios.get(`${BASE_URL}/cars`),
    getCarDetails: () => axios.get(`${BASE_URL}/cars/detail`),
    addCar: async (carData) => {
        try {
            console.group('Car Add Operation');
            console.log('Initial Data:', carData);

            // Önce arabayı ekle
            const carResponse = await axios.post(`${BASE_URL}/cars`, {
                brandId: parseInt(carData.brandId),
                colorId: parseInt(carData.colorId),
                modelYear: parseInt(carData.modelYear),
                dailyPrice: parseFloat(carData.dailyPrice),
                description: carData.description.trim(),
                minFindeksScore: parseInt(carData.minFindeksScore) || 500
            });

            console.log('Car Add Response:', carResponse.data);

            if (!carResponse.data.success) {
                throw new Error(carResponse.data.message || 'Araba eklenemedi');
            }

            // Eğer resim varsa, resmi yükle
            if (carData.image) {
                console.log('Uploading image for car:', carResponse.data.data.carId);
                
                const formData = new FormData();
                formData.append('ImagePath', carData.image);
                formData.append('carId', carResponse.data.data.carId);

                const imageResponse = await axios.post(`${BASE_URL}/carimages/add`, formData, {
                    headers: {
                        'Content-Type': 'multipart/form-data'
                    }
                });

                console.log('Image Upload Response:', imageResponse.data);

                if (!imageResponse.data.success) {
                    console.error('Image upload failed:', imageResponse.data.message);
                }
            }

            return carResponse;
        } catch (error) {
            console.error('Car Add Error:', error);
            throw error;
        } finally {
            console.groupEnd();
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
            const response = await axios.put(`${BASE_URL}/cars/${carId}`, carData);

            // Eğer yeni resim varsa, resmi yükle
            const imageFile = updateData.get('ImagePath');
            if (imageFile) {
                const imageFormData = new FormData();
                imageFormData.append('ImagePath', imageFile);
                imageFormData.append('carId', carId);
                
                await axios.post(`${BASE_URL}/carimages/add`, imageFormData, {
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
    deleteCar: async (carId) => {
        try {
            // Önce arabanın resimlerini kontrol et
            const carImagesResponse = await axios.get(`${BASE_URL}/carimages/getbycarid?carId=${carId}`);
            const images = carImagesResponse.data.data || [];
            
            // Özel yüklenmiş resimleri sil (default olmayan)
            for (const image of images) {
                if (!image.imagePath.toLowerCase().includes('default.jpg')) {
                    await axios.post(`${BASE_URL}/carimages/delete`, { id: image.carImageId });
                }
            }

            // Arabayı sil - DELETE metodu kullan
            const response = await axios.delete(`${BASE_URL}/cars/${carId}`);

            if (!response.data.success) {
                throw new Error(response.data.message || 'Araba silinemedi');
            }

            return response;
        } catch (error) {
            console.error('Car delete error:', error);
            console.error('Error details:', {
                message: error.message,
                response: error.response?.data,
                stack: error.stack
            });
            throw error;
        }
    },

    // Araba resmi işlemleri
    uploadCarImage: async (file, carId) => {
        const formData = new FormData();
        formData.append('ImagePath', file);
        formData.append('carId', carId);
        return axios.post(`${BASE_URL}/carimages/add`, formData, {
            headers: { 'Content-Type': 'multipart/form-data' }
        });
    },
    getCarImages: (carId) => axios.get(`${BASE_URL}/carimages/getbycarid?carId=${carId}`),
    deleteCarImage: async (imageId) => {
        try {
            return await axios.delete(`${BASE_URL}/carimages/${imageId}`);
        } catch (error) {
            console.error('Image delete error:', error);
            throw error;
        }
    },
    deleteCarImageByPath: async (imagePath) => {
        try {
            return await axios.delete(`${BASE_URL}/carimages/deleteByPath`, {
                data: { imagePath }
            });
        } catch (error) {
            console.error('Error deleting image by path:', error);
            throw error;
        }
    },

    // Marka işlemleri
    getAllBrands: () => axios.get(`${BASE_URL}/brands/getall`),
    addBrand: (brandName) => axios.post(`${BASE_URL}/brands/add`, { 
        brandId: 0, 
        brandName: brandName.trim() 
    }),
    updateBrand: (brandId, brandName) => axios.post(`${BASE_URL}/brands/update`, { 
        brandId: parseInt(brandId), 
        brandName: brandName.trim() 
    }),
    deleteBrand: (brandId) => axios.delete(`${BASE_URL}/brands/${brandId}`),

    // Renk işlemleri
    getAllColors: () => axios.get(`${BASE_URL}/colors/getall`),
    addColor: (colorName) => axios.post(`${BASE_URL}/colors/add`, { 
        colorId: 0, 
        colorName: colorName.trim() 
    }),
    updateColor: (colorId, colorName) => axios.post(`${BASE_URL}/colors/update`, { 
        colorId: parseInt(colorId), 
        colorName: colorName.trim() 
    }),
    deleteColor: (colorId) => axios.delete(`${BASE_URL}/colors/${colorId}`),

    // Admin işlemleri
    // ...

    changePassword: async (passwordData) => {
        try {
            return await axios.post(`${BASE_URL}/users/changepassword`, passwordData);
        } catch (error) {
            console.error('Password change error:', error);
            throw error;
        }
    },

    // Profil fotoğrafı işlemleri
    uploadProfileImage: async (file) => {
        const formData = new FormData();
        formData.append('file', file);
        return await axios.post(`${BASE_URL}/users/profile-image`, formData, {
            headers: {
                'Content-Type': 'multipart/form-data'
            }
        });
    },

    deleteProfileImage: async () => {
        return await axios.delete(`${BASE_URL}/users/profile-image`);
    },

    getProfileImage: async () => {
        return await axios.get(`${BASE_URL}/users/profile-image`);
    }
};

export default api;
