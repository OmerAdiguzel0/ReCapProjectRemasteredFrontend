import axios from 'axios';

const BASE_URL = 'http://localhost:7108/api';

// Request Interceptor
axios.interceptors.request.use(
    config => {
        const token = localStorage.getItem('token');
        if (token) {
            config.headers.Authorization = `Bearer ${token}`;
        }
        console.log('API İsteği:', {
            url: config.url,
            method: config.method,
            data: config.data,
            headers: config.headers
        });
        return config;
    },
    error => {
        console.error('Request Error:', error);
        return Promise.reject(error);
    }
);

// Response Interceptor
axios.interceptors.response.use(
    response => {
        console.log('API Yanıtı:', {
            status: response.status,
            data: response.data,
            headers: response.headers
        });
        return response;
    },
    error => {
        console.error('Response Error:', {
            status: error.response?.status,
            data: error.response?.data,
            message: error.message
        });
        return Promise.reject(error);
    }
);

class Api {
    async login(credentials) {
        try {
            // Email'i düzenle
            const loginData = {
                email: credentials.email.trim().toLowerCase(),
                password: credentials.password
            };

            console.log('Login isteği gönderiliyor:', {
                email: loginData.email,
                password: '********'
            });

            const response = await axios.post(`${BASE_URL}/auth/login`, loginData);
            
            console.log('Login yanıtı:', {
                success: response.data.success,
                message: response.data.message,
                hasData: !!response.data.data
            });

            return response;
        } catch (error) {
            console.error('Login error:', {
                status: error.response?.status,
                message: error.response?.data?.message,
                error: error.message
            });
            throw error;
        }
    }

    register(userData) {
        return axios.post(`${BASE_URL}/auth/register`, userData);
    }

    getCarDetails() {
        return axios.get(`${BASE_URL}/cars/detail`);
    }

    getCarDetail() {
        return this.getCarDetails();
    }

    getAllBrands() {
        return axios.get(`${BASE_URL}/brands/getall`);
    }

    getAllColors() {
        return axios.get(`${BASE_URL}/colors/getall`);
    }

    getCarImages(carId) {
        return axios.get(`${BASE_URL}/carimages/getbycarid?carId=${carId}`);
    }

    getRentals() {
        return axios.get(`${BASE_URL}/rentals`);
    }

    addRental(rental) {
        return axios.post(`${BASE_URL}/rentals`, rental);
    }

    // Brand (Marka) işlemleri
    addBrand(brand) {
        return axios.post(`${BASE_URL}/brands/add`, brand);
    }

    updateBrand(brand) {
        return axios.post(`${BASE_URL}/brands/update`, brand);
    }

    deleteBrand(brand) {
        return axios.post(`${BASE_URL}/brands/delete`, brand);
    }

    // Color (Renk) işlemleri
    addColor(color) {
        return axios.post(`${BASE_URL}/colors/add`, color);
    }

    updateColor(color) {
        return axios.post(`${BASE_URL}/colors/update`, color);
    }

    deleteColor(color) {
        return axios.post(`${BASE_URL}/colors/delete`, color);
    }

    // Car (Araba) işlemleri
    getAllCars() {
        return axios.get(`${BASE_URL}/cars`);
    }

    getCarById(id) {
        return axios.get(`${BASE_URL}/cars/${id}`);
    }

    getCarsByBrand(brandId) {
        return axios.get(`${BASE_URL}/cars/brand/${brandId}`);
    }

    getCarsByColor(colorId) {
        return axios.get(`${BASE_URL}/cars/color/${colorId}`);
    }

    addCar(car) {
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

            console.log('Araba ekleme isteği gönderiliyor:', {
                url: `${BASE_URL}/cars`,
                method: 'POST',
                data: carData
            });

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
    }

    updateCar(car) {
        return axios.post(`${BASE_URL}/cars/update`, car);
    }

    deleteCar(car) {
        return axios.post(`${BASE_URL}/cars/delete`, car);
    }
}

const api = new Api();
export default api;