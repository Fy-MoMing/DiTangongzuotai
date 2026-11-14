import React, { useState, useEffect, useRef } from 'react';
import { Box, Text, HStack, Badge } from '@chakra-ui/react';
import { WiDaySunny, WiCloudy, WiRain, WiSnow, WiFog, WiThunderstorm } from 'react-icons/wi';
import gsap from 'gsap';

const getWeatherIcon = (weather) => {
  if (!weather) return WiDaySunny;
  if (weather.includes('晴')) return WiDaySunny;
  if (weather.includes('云') || weather.includes('阴')) return WiCloudy;
  if (weather.includes('雨')) return WiRain;
  if (weather.includes('雪')) return WiSnow;
  if (weather.includes('雾') || weather.includes('霾')) return WiFog;
  if (weather.includes('雷')) return WiThunderstorm;
  return WiDaySunny;
};

const getWeatherColor = (weather) => {
  if (!weather) return 'orange';
  if (weather.includes('晴')) return 'orange';
  if (weather.includes('云') || weather.includes('阴')) return 'gray';
  if (weather.includes('雨')) return 'blue';
  if (weather.includes('雪')) return 'cyan';
  if (weather.includes('雾') || weather.includes('霾')) return 'yellow';
  if (weather.includes('雷')) return 'purple';
  return 'orange';
};

const Weather = () => {
  const [weatherData, setWeatherData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const containerRef = useRef(null);
  
  // 固定城市为石家庄市
  const CITY_NAME = '石家庄市';

  const fetchWeatherByCity = (city) => {
    if (!window.AMap) { 
      setError('地图 API 未加载'); 
      setLoading(false); 
      return; 
    }
    const AMap = window.AMap;
    AMap.plugin('AMap.Weather', () => {
      const weather = new AMap.Weather();
      weather.getLive(city, (err, data) => {
        if (err || !data) { 
          setError('获取天气失败'); 
          setLoading(false); 
          return; 
        }
        setWeatherData({ 
          city: data.city, 
          weather: data.weather, 
          temperature: data.temperature, 
          windDirection: data.windDirection, 
          windPower: data.windPower, 
          humidity: data.humidity 
        });
        setError(null);
        setLoading(false);
      });
    });
  };

  useEffect(() => {
    // 直接加载固定城市的天气，移除定位逻辑
    let retryTimer;
    let canceled = false;
    const deadline = Date.now() + 10000;
    const loadWeather = () => {
      if (canceled) return;
      if (!window.AMap) { 
        if (Date.now() >= deadline) {
          setError('天气暂时不可用');
          setLoading(false);
          return;
        }
        retryTimer = setTimeout(loadWeather, 500);
        return; 
      }
      fetchWeatherByCity(CITY_NAME);
    };
    loadWeather();

    // 每15分钟自动刷新天气数据
    const intervalId = setInterval(() => {
      if (window.AMap) {
        fetchWeatherByCity(CITY_NAME);
      }
    }, 15 * 60 * 1000);

    return () => {
      canceled = true;
      clearTimeout(retryTimer);
      clearInterval(intervalId);
    };
  }, []);

  useEffect(() => {
    if (containerRef.current) {
      gsap.fromTo(containerRef.current,
        { y: 50, opacity: 0 },
        { y: 0, opacity: 1, duration: 0.8, ease: 'power3.out', delay: 0.5 }
      );
    }
  }, []);

  if (loading) {
    return (
      <Box
        ref={containerRef}
        position="fixed"
        bottom="16px"
        left="16px"
        zIndex={900}
        bg="white"
        borderRadius="full"
        px={4}
        py={3}
        boxShadow="0 4px 20px rgba(0, 0, 0, 0.08)"
        border="1px solid"
        borderColor="gray.200"
        userSelect="none"
      >
        <Text fontSize="sm" color="gray.500">天气加载中...</Text>
      </Box>
    );
  }

  if (error || !weatherData) return null;

  const WeatherIcon = getWeatherIcon(weatherData.weather);
  const colorScheme = getWeatherColor(weatherData.weather);

  return (
    <Box
      ref={containerRef}
      position="fixed"
      bottom="16px"
      left="16px"
      zIndex={900}
      bg="white"
      borderRadius="full"
      px={5}
      py={3}
      boxShadow="0 4px 20px rgba(0, 0, 0, 0.08)"
      border="1px solid"
      borderColor="gray.200"
      userSelect="none"
      transition="all 0.3s ease"
      _hover={{
        transform: 'translateY(-2px)',
        boxShadow: '0 8px 24px rgba(0, 0, 0, 0.12)',
        borderColor: `${colorScheme}.300`
      }}
    >
      <HStack spacing={3}>
        <Box color={`${colorScheme}.500`} fontSize="xl">
          <WeatherIcon size={22} />
        </Box>
        <Text fontSize="sm" fontWeight="600" color="gray.700" display={{ base: 'none', sm: 'block' }}>
          {weatherData.city}
        </Text>
        <Badge colorScheme={colorScheme} variant="subtle" borderRadius="full" px={3} py={1} fontSize="sm" fontWeight="bold">
          {weatherData.weather}
        </Badge>
        <Text fontSize="sm" fontWeight="700" color="gray.700">
          {weatherData.temperature}°C
        </Text>
      </HStack>
    </Box>
  );
};

export default Weather;
