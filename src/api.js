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

                    const imageResponse = await axios.post(`${BASE_URL}/carimages/add`, formData, {
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
            const response = await axios.put(`/cars/${carId}`, carData);

            // Eğer yeni resim varsa, resmi yükle
            const imageFile = updateData.get('ImagePath');
            if (imageFile) {
                const imageFormData = new FormData();
                imageFormData.append('ImagePath', imageFile);
                imageFormData.append('carId', carId);
                
                await axios.post('/carimages/add', imageFormData, {
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
    deleteCar: (carId) => axios.delete(`/cars/${carId}`),

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
    deleteCarImage: (imageId) => axios.delete(`${BASE_URL}/carimages/${imageId}`),
    deleteCarImageByPath: async (imagePath) => {
        try {
            return await axios.delete(`${BASE_URL}/carimages/deleteByPath`, {
                data: { imagePath }
            });
        } catch (error) {
            console.error('Error deleting image:', error);
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
