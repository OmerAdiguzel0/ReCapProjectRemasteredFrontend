const [yeniAraba, setYeniAraba] = useState({
    brandId: '',
    colorId: '',
    modelYear: '',
    dailyPrice: '',
    description: '',
    minFindeksScore: 500
});

const arabaEkle = async () => {
    try {
        setError(null);
        setSuccess(null);

        // Form validasyonu
        if (!yeniAraba.brandId || !yeniAraba.colorId || !yeniAraba.modelYear || 
            !yeniAraba.dailyPrice || !yeniAraba.description) {
            setError('Tüm alanları doldurun');
            return;
        }

        // Veri dönüşümü
        const carData = {
            carId: 0,
            brandId: parseInt(yeniAraba.brandId),
            colorId: parseInt(yeniAraba.colorId),
            modelYear: parseInt(yeniAraba.modelYear),
            dailyPrice: parseFloat(yeniAraba.dailyPrice),
            description: yeniAraba.description.trim(),
            minFindeksScore: yeniAraba.minFindeksScore ? parseInt(yeniAraba.minFindeksScore) : 500
        };

        console.log('Gönderilecek veri:', carData);

        const response = await api.addCar(carData);
        console.log('API yanıtı:', response);

        if (response.data.success) {
            setSuccess('Araba başarıyla eklendi');
            setYeniAraba({
                brandId: '',
                colorId: '',
                modelYear: '',
                dailyPrice: '',
                description: '',
                minFindeksScore: 500
            });
            await veriGetir();
        } else {
            setError(response.data.message);
        }
    } catch (error) {
        console.error('Araba ekleme hatası:', error);
        if (error.response?.data?.errors) {
            const errorMessages = Object.values(error.response.data.errors)
                .flat()
                .join(', ');
            setError(errorMessages);
        } else {
            setError(error.response?.data?.message || 'Bir hata oluştu');
        }
    }
};

const arabaGuncelle = async (carId) => {
    try {
        if (!editingCar.brandId || !editingCar.colorId || !editingCar.modelYear || 
            !editingCar.dailyPrice || !editingCar.description) {
            setError('Lütfen tüm alanları doldurun');
            return;
        }

        const response = await api.updateCar(carId, editingCar);
        
        if (response.data.success) {
            setSuccess('Araç başarıyla güncellendi');
            setEditingCarId(null);
            setEditingCar({
                brandId: '',
                colorId: '',
                modelYear: '',
                dailyPrice: '',
                description: '',
                minFindeksScore: 500
            });
            // Verileri yenile
            await veriGetir();
        } else {
            setError(response.data.message || 'Güncelleme başarısız oldu');
        }
    } catch (error) {
        console.error('Güncelleme hatası:', error);
        setError(error.response?.data?.message || 'Güncelleme sırasında bir hata oluştu');
    }
}; 