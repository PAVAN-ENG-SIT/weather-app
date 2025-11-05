// Weather App JavaScript
class WeatherApp {
    constructor() {
        this.apiKey = 'your_api_key_here'; // Replace with your OpenWeatherMap API key
        this.apiUrl = 'https://api.openweathermap.org/data/2.5/weather';
        this.forecastUrl = 'https://api.openweathermap.org/data/2.5/forecast';
        
        this.initializeElements();
        this.bindEvents();
        this.setupDefaultCity();
    }

    initializeElements() {
        // Main elements
        this.cityInput = document.getElementById('cityInput');
        this.searchBtn = document.getElementById('searchBtn');
        this.errorMessage = document.getElementById('errorMessage');
        this.loadingSpinner = document.getElementById('loadingSpinner');
        this.weatherDisplay = document.getElementById('weatherDisplay');
        
        // Weather display elements
        this.weatherIcon = document.getElementById('weatherIcon');
        this.temperature = document.getElementById('temperature');
        this.weatherDescription = document.getElementById('weatherDescription');
        this.cityName = document.getElementById('cityName');
        this.currentDate = document.getElementById('currentDate');
        
        // Weather details
        this.humidity = document.getElementById('humidity');
        this.windSpeed = document.getElementById('windSpeed');
        this.visibility = document.getElementById('visibility');
        this.feelsLike = document.getElementById('feelsLike');
        
        // Forecast elements
        this.currentWeatherIcon = document.getElementById('currentWeatherIcon');
        this.currentTemp = document.getElementById('currentTemp');
        this.eveningWeatherIcon = document.getElementById('eveningWeatherIcon');
        this.eveningTemp = document.getElementById('eveningTemp');
        this.nightWeatherIcon = document.getElementById('nightWeatherIcon');
        this.nightTemp = document.getElementById('nightTemp');
        
        this.weatherCard = document.querySelector('.weather-card');
    }

    bindEvents() {
        // Enhanced search button click with ripple effect
        this.searchBtn.addEventListener('click', (e) => {
            this.createRippleEffect(e, this.searchBtn);
            this.searchWeather();
        });
        
        // Enhanced Enter key press
        this.cityInput.addEventListener('keypress', (e) => {
            if (e.key === 'Enter') {
                this.searchWeather();
            }
        });
        
        // Add input validation with real-time feedback
        this.cityInput.addEventListener('input', () => {
            this.hideError();
            this.handleInputChange();
        });
        
        // Add focus/blur effects
        this.cityInput.addEventListener('focus', () => {
            this.cityInput.parentElement.style.transform = 'scale(1.02)';
        });
        
        this.cityInput.addEventListener('blur', () => {
            this.cityInput.parentElement.style.transform = 'scale(1)';
        });
        
        // Add click animations to interactive elements
        this.setupInteractiveElements();
    }
    
    setupInteractiveElements() {
        // Add click handlers to detail items
        const detailItems = document.querySelectorAll('.detail-item');
        detailItems.forEach(item => {
            item.addEventListener('click', (e) => {
                this.createRippleEffect(e, item);
                this.animateDetailItem(item);
            });
        });
        
        // Add click handler to weather icon
        this.weatherIcon.addEventListener('click', () => {
            this.animateWeatherIcon();
        });
        
        // Add click handler to temperature
        this.temperature.addEventListener('click', () => {
            this.toggleTemperatureUnit();
        });
        
        // Add click handler to forecast items
        const forecastItems = document.querySelectorAll('.forecast-item');
        forecastItems.forEach(item => {
            item.addEventListener('click', (e) => {
                this.createRippleEffect(e, item);
            });
        });
    }
    
    createRippleEffect(event, element) {
        const ripple = document.createElement('span');
        const rect = element.getBoundingClientRect();
        const size = Math.max(rect.width, rect.height);
        const x = event.clientX - rect.left - size / 2;
        const y = event.clientY - rect.top - size / 2;
        
        ripple.style.width = ripple.style.height = size + 'px';
        ripple.style.left = x + 'px';
        ripple.style.top = y + 'px';
        ripple.classList.add('ripple-effect');
        
        element.style.position = 'relative';
        element.style.overflow = 'hidden';
        element.appendChild(ripple);
        
        setTimeout(() => {
            ripple.remove();
        }, 600);
    }
    
    animateDetailItem(item) {
        item.style.transform = 'scale(0.95)';
        setTimeout(() => {
            item.style.transform = '';
        }, 150);
    }
    
    animateWeatherIcon() {
        this.weatherIcon.style.animation = 'none';
        setTimeout(() => {
            this.weatherIcon.style.animation = 'bounce 0.6s ease';
        }, 10);
    }
    
    toggleTemperatureUnit() {
        // Toggle between Celsius and Fahrenheit
        const currentTemp = this.temperature.textContent;
        if (currentTemp.includes('°C')) {
            const celsius = parseFloat(currentTemp);
            const fahrenheit = (celsius * 9/5) + 32;
            this.animateNumberChange(this.temperature, currentTemp, `${Math.round(fahrenheit)}°F`);
        } else {
            const fahrenheit = parseFloat(currentTemp);
            const celsius = (fahrenheit - 32) * 5/9;
            this.animateNumberChange(this.temperature, currentTemp, `${Math.round(celsius)}°C`);
        }
    }
    
    handleInputChange() {
        const value = this.cityInput.value.trim();
        if (value.length > 0) {
            this.searchBtn.style.opacity = '1';
            this.searchBtn.style.transform = 'scale(1)';
        }
    }
    
    animateNumberChange(element, oldValue, newValue) {
        element.style.transform = 'scale(0.8)';
        element.style.opacity = '0.5';
        
        setTimeout(() => {
            element.textContent = newValue;
            element.style.transform = 'scale(1.1)';
            element.style.opacity = '1';
            
            setTimeout(() => {
                element.style.transform = 'scale(1)';
            }, 200);
        }, 150);
    }

    setupDefaultCity() {
        // Set default city to London
        this.searchWeatherByCity('London');
    }

    async searchWeather() {
        const city = this.cityInput.value.trim();
        if (!city) {
            this.showError('Please enter a city name');
            return;
        }
        
        await this.searchWeatherByCity(city);
    }

    async searchWeatherByCity(city) {
        this.showLoading();
        this.hideError();
        
        try {
            // Get current weather
            const currentWeather = await this.fetchWeatherData(city);
            if (!currentWeather) return;
            
            // Get forecast data
            const forecastData = await this.fetchForecastData(city);
            
            // Update UI
            this.updateWeatherDisplay(currentWeather);
            if (forecastData) {
                this.updateForecastDisplay(forecastData);
            }
            
            this.hideLoading();
            this.showWeatherDisplay();
            
        } catch (error) {
            console.error('Error fetching weather data:', error);
            this.hideLoading();
            this.showError('Failed to fetch weather data. Please try again.');
        }
    }

    async fetchWeatherData(city) {
        try {
            // For demo purposes, we'll use mock data
            // In production, replace with actual API call:
            // const response = await fetch(`${this.apiUrl}?q=${city}&appid=${this.apiKey}&units=metric`);
            // const data = await response.json();
            
            // Mock data for demonstration
            const mockWeatherData = this.generateMockWeatherData(city);
            return mockWeatherData;
            
        } catch (error) {
            console.error('API Error:', error);
            throw error;
        }
    }

    async fetchForecastData(city) {
        try {
            // Mock forecast data
            return this.generateMockForecastData();
        } catch (error) {
            console.error('Forecast API Error:', error);
            return null;
        }
    }

    generateMockWeatherData(city) {
        const weatherConditions = [
            { main: 'Clear', description: 'clear sky', icon: 'clean sun.webp' },
            { main: 'Clouds', description: 'few clouds', icon: 'clouds and sun.png' },
            { main: 'Clouds', description: 'scattered clouds', icon: 'cloudy weather3.avif' },
            { main: 'Rain', description: 'light rain', icon: 'rain.png' },
            { main: 'Snow', description: 'light snow', icon: 'snow .png' },
            { main: 'Mist', description: 'mist', icon: 'mist.png' }
        ];
        
        const randomCondition = weatherConditions[Math.floor(Math.random() * weatherConditions.length)];
        
        return {
            name: city,
            main: {
                temp: Math.floor(Math.random() * 30) + 5, // 5-35°C
                feels_like: Math.floor(Math.random() * 30) + 5,
                humidity: Math.floor(Math.random() * 40) + 40, // 40-80%
            },
            weather: [randomCondition],
            wind: {
                speed: Math.floor(Math.random() * 15) + 2 // 2-17 km/h
            },
            visibility: Math.floor(Math.random() * 5) + 8 // 8-13 km
        };
    }

    generateMockForecastData() {
        return {
            list: [
                {
                    dt_txt: new Date().toISOString(),
                    main: { temp: Math.floor(Math.random() * 30) + 5 },
                    weather: [{ icon: 'clean sun.webp' }]
                },
                {
                    dt_txt: new Date(Date.now() + 6 * 60 * 60 * 1000).toISOString(),
                    main: { temp: Math.floor(Math.random() * 30) + 5 },
                    weather: [{ icon: 'cloudy weather3.avif' }]
                },
                {
                    dt_txt: new Date(Date.now() + 12 * 60 * 60 * 1000).toISOString(),
                    main: { temp: Math.floor(Math.random() * 30) + 5 },
                    weather: [{ icon: 'mist.png' }]
                }
            ]
        };
    }

    updateWeatherDisplay(data) {
        // Animate temperature change with counter
        this.animateCounter(this.temperature, 0, Math.round(data.main.temp), `${Math.round(data.main.temp)}°C`);
        
        // Animate description with fade
        this.animateTextChange(this.weatherDescription, data.weather[0].description);
        
        // Animate city name
        this.animateTextChange(this.cityName, data.name);
        
        // Update date
        this.currentDate.textContent = new Date().toLocaleDateString('en-US', {
            weekday: 'long',
            year: 'numeric',
            month: 'long',
            day: 'numeric'
        });

        // Update weather icon with animation
        this.updateWeatherIcon(data.weather[0].description, data.weather[0].main);
        
        // Animate weather details with counter
        this.animateCounter(this.humidity, 0, data.main.humidity, `${data.main.humidity}%`, 50);
        this.animateCounter(this.windSpeed, 0, data.wind.speed, `${data.wind.speed} km/h`, 30);
        this.animateCounter(this.visibility, 0, data.visibility, `${data.visibility} km`, 50);
        this.animateCounter(this.feelsLike, 0, Math.round(data.main.feels_like), `${Math.round(data.main.feels_like)}°C`, 50);
        
        // Update background with smooth transition
        this.updateWeatherBackground(data.weather[0].main);
        
        // Add entrance animation
        this.animateWeatherCardEntrance();
    }
    
    animateCounter(element, start, end, finalText, duration = 1000) {
        const range = end - start;
        const increment = range / (duration / 16); // 60fps
        let current = start;
        
        const timer = setInterval(() => {
            current += increment;
            if ((increment > 0 && current >= end) || (increment < 0 && current <= end)) {
                element.textContent = finalText;
                clearInterval(timer);
                element.style.animation = 'countUp 0.5s ease-out';
            } else {
                const rounded = Math.round(current);
                if (finalText.includes('%')) {
                    element.textContent = `${rounded}%`;
                } else if (finalText.includes('km/h')) {
                    element.textContent = `${rounded} km/h`;
                } else if (finalText.includes('km')) {
                    element.textContent = `${rounded} km`;
                } else if (finalText.includes('°C')) {
                    element.textContent = `${rounded}°C`;
                }
            }
        }, 16);
    }
    
    animateTextChange(element, newText) {
        element.style.opacity = '0';
        element.style.transform = 'translateY(-10px)';
        
        setTimeout(() => {
            element.textContent = newText;
            element.style.opacity = '1';
            element.style.transform = 'translateY(0)';
        }, 200);
    }
    
    animateWeatherCardEntrance() {
        this.weatherCard.style.animation = 'none';
        setTimeout(() => {
            this.weatherCard.style.animation = 'cardEntrance 0.6s ease-out';
        }, 10);
    }

    updateWeatherIcon(description, main) {
        const iconMapping = {
            'clear sky': 'images/clean sun.webp',
            'few clouds': 'images/clouds and sun.png',
            'scattered clouds': 'images/cloudy weather3.avif',
            'broken clouds': 'images/cloudy weather3.avif',
            'overcast clouds': 'images/cloudy weather3.avif',
            'light rain': 'images/rain.png',
            'moderate rain': 'images/rain.png',
            'heavy rain': 'images/rain.png',
            'light snow': 'images/snow .png',
            'moderate snow': 'images/snow .png',
            'heavy snow': 'images/snow .png',
            'mist': 'images/mist.png',
            'fog': 'images/mist.png',
            'haze': 'images/mist.png'
        };
        
        const iconPath = iconMapping[description] || iconMapping[main.toLowerCase()] || 'images/clean sun.webp';
        
        // Animate icon change
        this.weatherIcon.style.transform = 'scale(0) rotate(180deg)';
        this.weatherIcon.style.opacity = '0';
        
        setTimeout(() => {
            this.weatherIcon.src = iconPath;
            this.weatherIcon.alt = description;
            this.weatherIcon.style.transform = 'scale(1) rotate(0deg)';
            this.weatherIcon.style.opacity = '1';
        }, 200);
    }

    updateWeatherBackground(condition) {
        // Remove existing weather classes
        this.weatherCard.classList.remove('sunny', 'cloudy', 'rainy', 'snowy', 'misty');
        
        // Add appropriate weather class
        const weatherClass = condition.toLowerCase();
        if (weatherClass.includes('clear')) {
            this.weatherCard.classList.add('sunny');
        } else if (weatherClass.includes('cloud')) {
            this.weatherCard.classList.add('cloudy');
        } else if (weatherClass.includes('rain')) {
            this.weatherCard.classList.add('rainy');
        } else if (weatherClass.includes('snow')) {
            this.weatherCard.classList.add('snowy');
        } else if (weatherClass.includes('mist') || weatherClass.includes('fog') || weatherClass.includes('haze')) {
            this.weatherCard.classList.add('misty');
        }
    }

    updateForecastDisplay(forecastData) {
        if (!forecastData || !forecastData.list) return;
        
        const forecasts = forecastData.list.slice(0, 3);
        
        forecasts.forEach((forecast, index) => {
            const temp = Math.round(forecast.main.temp);
            const iconPath = `images/${forecast.weather[0].icon || 'clean sun.webp'}`;
            
            switch(index) {
                case 0:
                    this.currentTemp.textContent = `${temp}°`;
                    this.currentWeatherIcon.src = iconPath;
                    break;
                case 1:
                    this.eveningTemp.textContent = `${temp}°`;
                    this.eveningWeatherIcon.src = iconPath;
                    break;
                case 2:
                    this.nightTemp.textContent = `${temp}°`;
                    this.nightWeatherIcon.src = iconPath;
                    break;
            }
        });
    }

    showLoading() {
        this.loadingSpinner.classList.add('show');
        this.weatherDisplay.classList.remove('show');
        this.weatherCard.style.pointerEvents = 'none';
    }

    hideLoading() {
        this.loadingSpinner.classList.remove('show');
        this.weatherCard.style.pointerEvents = 'auto';
    }

    showWeatherDisplay() {
        this.weatherDisplay.classList.add('show');
        // Add staggered animation to detail items
        const detailItems = document.querySelectorAll('.detail-item');
        detailItems.forEach((item, index) => {
            setTimeout(() => {
                item.style.animation = 'slideInUp 0.5s ease-out';
            }, index * 100);
        });
    }

    showError(message) {
        this.errorMessage.textContent = message;
        this.errorMessage.classList.add('show');
        
        // Auto-hide error after 5 seconds
        setTimeout(() => {
            this.hideError();
        }, 5000);
    }

    hideError() {
        this.errorMessage.classList.remove('show');
    }
}

// Utility functions
function formatDate(timestamp) {
    return new Date(timestamp * 1000).toLocaleDateString('en-US', {
        weekday: 'short',
        month: 'short',
        day: 'numeric'
    });
}

function getWeatherEmoji(condition) {
    const emojiMap = {
        'clear sky': '☀️',
        'few clouds': '⛅',
        'scattered clouds': '⛅',
        'broken clouds': '☁️',
        'overcast clouds': '☁️',
        'light rain': '🌦️',
        'moderate rain': '🌧️',
        'heavy rain': '⛈️',
        'light snow': '🌨️',
        'moderate snow': '🌨️',
        'heavy snow': '❄️',
        'mist': '🌫️',
        'fog': '🌫️',
        'haze': '🌫️'
    };
    
    return emojiMap[condition] || '🌤️';
}

// Initialize the app when DOM is loaded
document.addEventListener('DOMContentLoaded', () => {
    const weatherApp = new WeatherApp();
    
    // Add some interactive animations
    const weatherCard = document.querySelector('.weather-card');
    
    // Simple, clean hover effect - no 3D tilt
    weatherCard.addEventListener('mouseenter', () => {
        weatherCard.style.transition = 'all 0.3s ease';
    });
    
    weatherCard.addEventListener('mouseleave', () => {
        weatherCard.style.transition = 'all 0.3s ease';
    });
    
    // Add click ripple effect to weather card
    weatherCard.addEventListener('click', (e) => {
        const ripple = document.createElement('span');
        const rect = weatherCard.getBoundingClientRect();
        const size = Math.max(rect.width, rect.height);
        const x = e.clientX - rect.left - size / 2;
        const y = e.clientY - rect.top - size / 2;
        
        ripple.style.width = ripple.style.height = size + 'px';
        ripple.style.left = x + 'px';
        ripple.style.top = y + 'px';
        ripple.classList.add('ripple-effect');
        
        weatherCard.appendChild(ripple);
        
        setTimeout(() => {
            ripple.remove();
        }, 600);
    });
    
    // Enhanced keyboard shortcuts
    document.addEventListener('keydown', (e) => {
        // Focus search with Ctrl/Cmd + K
        if ((e.ctrlKey || e.metaKey) && e.key === 'k') {
            e.preventDefault();
            const input = document.getElementById('cityInput');
            input.focus();
            input.select();
        }
        
        // Search with Enter (already handled, but add visual feedback)
        if (e.key === 'Enter' && document.activeElement === document.getElementById('cityInput')) {
            const btn = document.getElementById('searchBtn');
            btn.style.transform = 'scale(0.9)';
            setTimeout(() => {
                btn.style.transform = '';
            }, 150);
        }
        
        // Escape to clear search
        if (e.key === 'Escape' && document.activeElement === document.getElementById('cityInput')) {
            document.getElementById('cityInput').blur();
        }
    });
    
    // Enhanced search with autocomplete suggestions
    const cityInput = document.getElementById('cityInput');
    const popularCities = ['London', 'New York', 'Tokyo', 'Paris', 'Sydney', 'Dubai', 'Mumbai', 'Singapore', 'Berlin', 'Rome', 'Madrid', 'Barcelona'];
    let suggestionsContainer = null;
    
    // Create suggestions container
    const createSuggestionsContainer = () => {
        if (!suggestionsContainer) {
            suggestionsContainer = document.createElement('div');
            suggestionsContainer.id = 'suggestionsContainer';
            suggestionsContainer.className = 'suggestions-container';
            document.querySelector('.search-section').appendChild(suggestionsContainer);
        }
        return suggestionsContainer;
    };
    
    cityInput.addEventListener('input', (e) => {
        const value = e.target.value.trim().toLowerCase();
        const container = createSuggestionsContainer();
        
        if (value.length > 0) {
            const filtered = popularCities.filter(city => 
                city.toLowerCase().startsWith(value)
            );
            
            if (filtered.length > 0) {
                container.innerHTML = filtered.slice(0, 5).map(city => 
                    `<div class="suggestion-item">${city}</div>`
                ).join('');
                
                container.style.display = 'block';
                
                // Add click handlers to suggestions
                container.querySelectorAll('.suggestion-item').forEach(item => {
                    item.addEventListener('click', () => {
                        cityInput.value = item.textContent;
                        container.style.display = 'none';
                        weatherApp.searchWeather();
                    });
                });
            } else {
                container.style.display = 'none';
            }
        } else {
            container.style.display = 'none';
        }
    });
    
    cityInput.addEventListener('focus', () => {
        const value = cityInput.value.trim();
        if (value.length > 0) {
            const container = createSuggestionsContainer();
            const filtered = popularCities.filter(city => 
                city.toLowerCase().startsWith(value.toLowerCase())
            );
            if (filtered.length > 0) {
                container.style.display = 'block';
            }
        }
    });
    
    document.addEventListener('click', (e) => {
        if (!e.target.closest('.search-section')) {
            if (suggestionsContainer) {
                suggestionsContainer.style.display = 'none';
            }
        }
    });
    
    // Enhanced weather animations based on conditions
    function addWeatherAnimations() {
        const weatherIcon = document.getElementById('weatherIcon');
        
        // Add floating animation for different weather types
        const updateWeatherAnimation = () => {
            const src = weatherIcon.src;
            if (src.includes('rain.png')) {
                weatherIcon.style.animation = 'rainFall 2s infinite ease-in-out';
            } else if (src.includes('snow')) {
                weatherIcon.style.animation = 'snowFall 3s infinite ease-in-out';
            } else if (src.includes('cloudy')) {
                weatherIcon.style.animation = 'cloudFloat 4s infinite ease-in-out';
            } else {
                weatherIcon.style.animation = 'bounce 2s infinite';
            }
        };
        
        weatherIcon.addEventListener('load', updateWeatherAnimation);
        
        // Also trigger on initial load
        if (weatherIcon.complete) {
            updateWeatherAnimation();
        }
    }
    
    addWeatherAnimations();
    
    // Add double-click to refresh weather
    weatherCard.addEventListener('dblclick', () => {
        const currentCity = document.getElementById('cityName').textContent;
        if (currentCity && currentCity !== 'Enter a city name') {
            weatherApp.searchWeatherByCity(currentCity);
            weatherCard.style.animation = 'cardEntrance 0.6s ease-out';
        }
    });
    
    // Add shake animation on error
    const originalShowError = weatherApp.showError.bind(weatherApp);
    weatherApp.showError = function(message) {
        originalShowError(message);
        weatherCard.style.animation = 'shake 0.5s ease';
        setTimeout(() => {
            weatherCard.style.animation = '';
        }, 500);
    };
    
    // Add shake animation
    const shakeStyle = document.createElement('style');
    shakeStyle.textContent = `
        @keyframes shake {
            0%, 100% { transform: translateX(0); }
            10%, 30%, 50%, 70%, 90% { transform: translateX(-10px); }
            20%, 40%, 60%, 80% { transform: translateX(10px); }
        }
    `;
    document.head.appendChild(shakeStyle);
});

// Enhanced CSS animations and styles
const style = document.createElement('style');
style.textContent = `
    @keyframes rainFall {
        0%, 100% { transform: translateY(0px); }
        50% { transform: translateY(-15px); }
    }
    
    @keyframes snowFall {
        0%, 100% { transform: translateY(0px) rotate(0deg); }
        25% { transform: translateY(-10px) rotate(5deg); }
        50% { transform: translateY(-15px) rotate(0deg); }
        75% { transform: translateY(-10px) rotate(-5deg); }
    }
    
    @keyframes cloudFloat {
        0%, 100% { transform: translateX(0px) translateY(0px); }
        25% { transform: translateX(-5px) translateY(-10px); }
        50% { transform: translateX(0px) translateY(-15px); }
        75% { transform: translateX(5px) translateY(-10px); }
    }
    
    @keyframes cardEntrance {
        0% {
            opacity: 0;
            transform: translateY(30px) scale(0.9);
        }
        100% {
            opacity: 1;
            transform: translateY(0) scale(1);
        }
    }
    
    @keyframes slideInUp {
        0% {
            opacity: 0;
            transform: translateY(20px);
        }
        100% {
            opacity: 1;
            transform: translateY(0);
        }
    }
    
    .ripple-effect {
        position: absolute;
        border-radius: 50%;
        background: rgba(255, 255, 255, 0.6);
        transform: scale(0);
        animation: ripple 0.6s ease-out;
        pointer-events: none;
    }
    
    @keyframes ripple {
        to {
            transform: scale(4);
            opacity: 0;
        }
    }
    
    .suggestions-container {
        position: absolute;
        top: 100%;
        left: 0;
        right: 0;
        background: rgba(255, 255, 255, 0.15);
        backdrop-filter: blur(15px);
        -webkit-backdrop-filter: blur(15px);
        border: 2px solid rgba(255, 255, 255, 0.2);
        border-radius: 15px;
        margin-top: 10px;
        padding: 10px;
        max-height: 200px;
        overflow-y: auto;
        z-index: 1000;
        display: none;
        animation: slideInUp 0.3s ease-out;
    }
    
    .suggestion-item {
        padding: 12px 15px;
        border-radius: 10px;
        cursor: pointer;
        transition: all 0.3s ease;
        color: white;
        margin-bottom: 5px;
    }
    
    .suggestion-item:hover {
        background: rgba(16, 185, 129, 0.3);
        transform: translateX(5px);
        border-left: 3px solid var(--green);
    }
    
    .suggestion-item:last-child {
        margin-bottom: 0;
    }
    
    .search-section {
        position: relative;
    }
`;
document.head.appendChild(style);

// Export for potential module usage
if (typeof module !== 'undefined' && module.exports) {
    module.exports = WeatherApp;
}
