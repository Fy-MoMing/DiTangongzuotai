import React, { useState, useEffect, useRef } from 'react';
import { Box, Button, Heading, Text, VStack, keyframes } from '@chakra-ui/react';
import { useNavigate } from 'react-router-dom';
import gsap from 'gsap';

const Home = () => {
  const [gradient, setGradient] = useState('linear-gradient(135deg, #FF6B6B, #4ECDC4)');
  const navigate = useNavigate();
  const headingRef = useRef(null);
  const buttonRef = useRef(null);
  const containerRef = useRef(null);

  // 生成随机渐变色
  const generateRandomGradient = () => {
    const colors = [
      '#FF6B6B', '#4ECDC4', '#FFD166', '#06D6A0', '#118AB2', 
      '#EF476F', '#FFC43D', '#FFA500', '#6A5ACD', '#FF69B4'
    ];
    const color1 = colors[Math.floor(Math.random() * colors.length)];
    const color2 = colors[Math.floor(Math.random() * colors.length)];
    return `linear-gradient(135deg, ${color1}, ${color2})`;
  };

  // 每5秒切换一次渐变色
  useEffect(() => {
    const interval = setInterval(() => {
      setGradient(generateRandomGradient());
    }, 5000);
    return () => clearInterval(interval);
  }, []);

  // 页面加载动画
  useEffect(() => {
    if (headingRef.current && buttonRef.current && containerRef.current) {
      gsap.fromTo(
        containerRef.current,
        { opacity: 0 },
        { opacity: 1, duration: 0.8, ease: 'power2.out' }
      );

      gsap.fromTo(
        headingRef.current,
        { opacity: 0, y: -50, scale: 0.8 },
        { 
          opacity: 1, 
          y: 0, 
          scale: 1, 
          duration: 1, 
          ease: 'back.out(1.7)', 
          delay: 0.3 
        }
      );

      gsap.fromTo(
        buttonRef.current,
        { opacity: 0, y: 50 },
        { 
          opacity: 1, 
          y: 0, 
          duration: 0.8, 
          ease: 'power2.out', 
          delay: 0.6 
        }
      );

      // 数字闪烁动画
      const tl = gsap.timeline({ repeat: -1, repeatDelay: 2 });
      tl.to(headingRef.current, {
        textShadow: '0 0 20px rgba(255, 255, 255, 0.8), 0 0 40px rgba(255, 255, 255, 0.6)',
        duration: 0.5,
        ease: 'power2.inOut'
      }).to(headingRef.current, {
        textShadow: '2px 2px 8px rgba(0, 0, 0, 0.5)',
        duration: 0.5,
        ease: 'power2.inOut'
      });
    }
  }, []);

  const handleStartClick = () => {
    gsap.to(containerRef.current, {
      opacity: 0,
      scale: 0.95,
      duration: 0.5,
      ease: 'power2.in',
      onComplete: () => {
        navigate('/calculator');
      }
    });
  };

  const gradientScroll = keyframes`
    0% { background-position: 0% 0%; }
    50% { background-position: 100% 100%; }
    100% { background-position: 0% 0%; }
  `;

  const floatAnimation = keyframes`
    0%, 100% { transform: translateY(0); }
    50% { transform: translateY(-20px); }
  `;

  return (
    <Box
      ref={containerRef}
      minH="100vh"
      background={gradient}
      backgroundSize="200% 200%"
      animation={`${gradientScroll} 10s ease infinite`}
      position="relative"
      display="flex"
      alignItems="center"
      justifyContent="center"
      overflow="hidden"
      transition="background 1s ease"
    >
      {/* 装饰性光晕 */}
      <Box
        position="absolute"
        top="10%"
        left="10%"
        width="300px"
        height="300px"
        borderRadius="50%"
        background="radial-gradient(circle, rgba(255,255,255,0.2) 0%, transparent 70%)"
        filter="blur(40px)"
        animation={`${floatAnimation} 6s ease-in-out infinite`}
        pointerEvents="none"
      />
      <Box
        position="absolute"
        bottom="15%"
        right="15%"
        width="400px"
        height="400px"
        borderRadius="50%"
        background="radial-gradient(circle, rgba(255,255,255,0.15) 0%, transparent 70%)"
        filter="blur(50px)"
        animation={`${floatAnimation} 8s ease-in-out infinite`}
        animationDelay="2s"
        pointerEvents="none"
      />

      {/* 主内容区 */}
      <VStack spacing={8} textAlign="center" px={6} zIndex={1}>
        <Heading
          ref={headingRef}
          fontSize={{ base: '3xl', md: '5xl', lg: '6xl' }}
          color="white"
          fontWeight="700"
          textShadow="2px 2px 8px rgba(0, 0, 0, 0.5)"
          lineHeight="1.3"
          maxW="900px"
          _hover={{ 
            transform: 'scale(1.05)', 
            textShadow: '0 0 20px rgba(255, 255, 255, 0.8)' 
          }}
          transition="all 0.3s ease"
          cursor="default"
        >
          网站已积累服务计算次数{' '}
          <Text as="span" color="yellow.300" fontSize={{ base: '4xl', md: '6xl', lg: '7xl' }}>
            5000
          </Text>{' '}
          次
        </Heading>

        <Text
          fontSize={{ base: 'md', md: 'xl' }}
          color="whiteAlpha.900"
          fontWeight="500"
          maxW="600px"
          textShadow="1px 1px 4px rgba(0, 0, 0, 0.3)"
        >
          专业的地毯价格计算服务，快速、准确、便捷
        </Text>

        <Button
          ref={buttonRef}
          colorScheme="whiteAlpha"
          size="lg"
          fontSize="xl"
          px={12}
          py={7}
          borderRadius="full"
          bg="whiteAlpha.300"
          backdropFilter="blur(10px)"
          border="2px solid"
          borderColor="whiteAlpha.600"
          onClick={handleStartClick}
          _hover={{ 
            transform: 'scale(1.08)', 
            bg: 'whiteAlpha.400',
            boxShadow: '0 8px 24px rgba(255, 255, 255, 0.3)'
          }}
          _active={{ 
            transform: 'scale(0.98)' 
          }}
          transition="all 0.3s ease"
          fontWeight="600"
        >
          🚀 开始使用
        </Button>

        <Text
          fontSize="sm"
          color="whiteAlpha.700"
          fontWeight="500"
          mt={4}
          textShadow="1px 1px 3px rgba(0, 0, 0, 0.3)"
        >
          点击按钮进入地毯价格计算器
        </Text>
      </VStack>

      {/* 底部标识 */}
      <Box
        position="absolute"
        bottom="20px"
        left="50%"
        transform="translateX(-50%)"
        fontSize="xs"
        color="whiteAlpha.700"
        fontWeight="600"
        letterSpacing="1px"
        textShadow="1px 1px 2px rgba(0, 0, 0, 0.3)"
      >
        By HAISNAP
      </Box>
    </Box>
  );
};

export default Home;