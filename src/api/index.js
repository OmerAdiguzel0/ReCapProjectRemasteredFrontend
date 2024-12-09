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
            const response = await axios.post(`${BASE_URL}/auth/login`, credentials);
            
            if (response.data.success) {
                const userData = response.data.data;
                localStorage.setItem('token', userData.token);
                
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
            throw error;
        }
    },

    register: (userData) => {
        return axios.post(`${BASE_URL}/auth/register`, userData);
    },

    getCarDetails: () => {
        return axios.get(`${BASE_URL}/cars/detail`);
    },

    getCarDetail: () => {
        return api.getCarDetails();
    },

    getAllBrands: () => {
        return axios.get(`${BASE_URL}/brands/getall`);
    },

    getAllColors: () => {
        return axios.get(`${BASE_URL}/colors/getall`);
    },

    getCarImages: (carId) => {
        return axios.get(`${BASE_URL}/carimages/getbycarid?carId=${carId}`);
    },

    getRentals: () => {
        return axios.get(`${BASE_URL}/rentals`);
    },

    addRental: (rental) => {
        return axios.post(`${BASE_URL}/rentals`, rental);
    },

    // Brand (Marka) işlemleri
    addBrand: (brand) => {
        return axios.post(`${BASE_URL}/brands/add`, brand);
    },

    updateBrand: (brand) => {
        return axios.post(`${BASE_URL}/brands/update`, brand);
    },

    deleteBrand: (brand) => {
        return axios.post(`${BASE_URL}/brands/delete`, brand);
    },

    // Color (Renk) işlemleri
    addColor: (color) => {
        return axios.post(`${BASE_URL}/colors/add`, color);
    },

    updateColor: (color) => {
        return axios.post(`${BASE_URL}/colors/update`, color);
    },

    deleteColor: (color) => {
        return axios.post(`${BASE_URL}/colors/delete`, color);
    },

    // Car (Araba) işlemleri
    getAllCars: () => {
        return axios.get(`${BASE_URL}/cars`);
    },

    getCarById: (id) => {
        return axios.get(`${BASE_URL}/cars/${id}`);
    },

    getCarsByBrand: (brandId) => {
        return axios.get(`${BASE_URL}/cars/brand/${brandId}`);
    },

    getCarsByColor: (colorId) => {
        return axios.get(`${BASE_URL}/cars/color/${colorId}`);
    },

    addCar: async (car) => {
        try {
            // Veri dönüşümü ve validasyon
            if (!car.brandId || !car.colorId || !car.modelYear || !car.dailyPrice || !car.description) {
                throw new Error('Tüm alanları doldurun');
            }

            const carData = {
                carId: 0,
                brandId: parseInt(car.brandId),
                colorId: parseInt(car.colorId),
                modelYear: parseInt(car.modelYear),
                dailyPrice: parseFloat(car.dailyPrice),
                description: car.description?.trim() || '',
                minFindeksScore: car.minFindeksScore ? parseInt(car.minFindeksScore) : 500
            };

            // Validasyon kontrolleri
            if (isNaN(carData.brandId) || carData.brandId <= 0) {
                throw new Error('Geçerli bir marka seçin');
            }
            if (isNaN(carData.colorId) || carData.colorId <= 0) {
                throw new Error('Geçerli bir renk seçin');
            }
            if (isNaN(carData.modelYear) || carData.modelYear < 1900) {
                throw new Error('Geçerli bir model yılı girin');
            }
            if (isNaN(carData.dailyPrice) || carData.dailyPrice <= 0) {
                throw new Error('Geçerli bir fiyat girin');
            }

            return axios.post(`${BASE_URL}/cars`, carData, {
                headers: {
                    'Content-Type': 'application/json',
                    'Accept': 'application/json'
                }
            });
        } catch (error) {
            console.error('Araba ekleme hatası:', error);
            throw error;
        }
    },

    updateCar: (car) => {
        return axios.post(`${BASE_URL}/cars/update`, car);
    },

    deleteCar: (car) => {
        return axios.post(`${BASE_URL}/cars/delete`, car);
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