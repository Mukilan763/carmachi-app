export const setCity = (city: string) => {
    localStorage.setItem('carmachi_city', city);
    window.dispatchEvent(new Event('location-updated'));
};

export const getCity = (): string => {
    return localStorage.getItem('carmachi_city') || 'Chennai';
};

export const detectLocation = async () => {
    if (navigator.geolocation) {
        navigator.geolocation.getCurrentPosition(async (position) => {
            try {
                // Reverse geocoding using bigdatacloud free api
                const res = await fetch(`https://api.bigdatacloud.net/data/reverse-geocode-client?latitude=${position.coords.latitude}&longitude=${position.coords.longitude}&localityLanguage=en`);
                const data = await res.json();
                if (data.city || data.locality) {
                    setCity(data.city || data.locality);
                }
            } catch (e) {
                console.error('Failed to detect city:', e);
            }
        });
    }
};
