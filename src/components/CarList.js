const handleBrandChange = async (brandId) => {
    console.group('🔍 Brand Filter Operation Details');
    try {
        setLoading(true);
        console.log('🎯 Initial Parameters:', {
            brandId,
            type: typeof brandId,
            selectedBrand: selectedBrand,
            currentCarsCount: cars.length
        });
        
        setSelectedBrand(brandId);
        
        if (brandId) {
            console.group('📡 API Request Details');
            const url = `${BASE_URL}/cars/getall/brand/${brandId}`;
            console.log('🌐 Request URL:', url);
            console.log('📤 Request Headers:', {
                Authorization: `Bearer ${localStorage.getItem('token')}`,
                'Content-Type': 'application/json'
            });
            
            const response = await axios.get(url);
            console.group('📥 API Response Details');
            console.log('Status:', response.status);
            console.log('Headers:', response.headers);
            console.log('Full Response:', response);
            console.log('Response Data Structure:', {
                success: response.data?.success,
                message: response.data?.message,
                dataType: typeof response.data?.data,
                isArray: Array.isArray(response.data?.data),
                dataLength: response.data?.data?.length
            });
            
            if (response.data?.data) {
                console.log('First Item Sample:', response.data.data[0]);
            }
            console.groupEnd(); // API Response Details
            console.groupEnd(); // API Request Details
            
            if (response.data.success) {
                const carData = response.data.data || [];
                console.group('🚗 Filtered Cars Data');
                console.log('Total Cars Found:', carData.length);
                console.log('Data Sample:', carData.slice(0, 2));
                console.log('Data Structure:', {
                    hasData: carData.length > 0,
                    fields: carData[0] ? Object.keys(carData[0]) : 'No fields available'
                });
                console.groupEnd();
                
                setCars(carData);
                console.log('✅ State Updated with New Cars');
            } else {
                console.warn('⚠️ API Response Not Successful:', {
                    message: response.data.message,
                    fullResponse: response.data
                });
                toast.error(response.data.message || 'Arabalar getirilemedi');
            }
        } else {
            console.group('🔄 Fetching All Cars');
            const response = await api.getCarDetails();
            console.log('All Cars Response:', {
                success: response.success,
                dataLength: response.data?.length,
                sample: response.data?.slice(0, 2)
            });
            
            if (response.success) {
                const carData = response.data || [];
                console.log('📊 Setting All Cars:', {
                    count: carData.length,
                    sample: carData.slice(0, 2)
                });
                setCars(carData);
            }
            console.groupEnd(); // Fetching All Cars
        }
    } catch (error) {
        console.group('❌ Error Details');
        console.error('Error Type:', error.constructor.name);
        console.error('Error Message:', error.message);
        console.error('Stack Trace:', error.stack);
        console.error('Request Config:', {
            url: error.config?.url,
            method: error.config?.method,
            headers: error.config?.headers,
            params: error.config?.params
        });
        console.error('Response Data:', {
            status: error.response?.status,
            statusText: error.response?.statusText,
            data: error.response?.data,
            headers: error.response?.headers
        });
        console.groupEnd(); // Error Details
        
        toast.error('Arabalar getirilirken bir hata oluştu');
    } finally {
        setLoading(false);
        console.log('🏁 Operation Completed:', {
            finalCarsCount: cars.length,
            selectedBrand: selectedBrand,
            loading: false
        });
        console.groupEnd(); // Brand Filter Operation Details
    }
};

const handleColorChange = async (colorId) => {
    console.group('Color Filter Operation');
    try {
        setLoading(true);
        setSelectedColor(colorId);
        console.log('Selected Color ID:', colorId);
        
        if (colorId) {
            console.log('Fetching cars for color:', colorId);
            const url = `${BASE_URL}/cars/getcarsbycolorid?colorId=${colorId}`;
            console.log('Request URL:', url);
            
            const response = await axios.get(url);
            console.log('Cars API Response:', response.data);
            
            if (response.data.success) {
                const carData = response.data.data || [];
                console.log('Filtered cars count:', carData.length);
                console.log('Filtered cars data:', carData);
                setCars(carData);
            } else {
                console.error('Error from API:', response.data.message);
                toast.error(response.data.message || 'Arabalar getirilemedi');
            }
        } else {
            console.log('No color selected, fetching all cars');
            const response = await api.getCarDetails();
            console.log('All Cars Response:', response);
            
            if (response.success) {
                const carData = response.data || [];
                console.log('Total cars count:', carData.length);
                setCars(carData);
            }
        }
    } catch (error) {
        console.error('Error in handleColorChange:', error);
        console.error('Error details:', {
            message: error.message,
            response: error.response?.data,
            stack: error.stack,
            url: error.config?.url
        });
        toast.error('Arabalar getirilirken bir hata oluştu');
    } finally {
        setLoading(false);
        console.groupEnd();
    }
}; 