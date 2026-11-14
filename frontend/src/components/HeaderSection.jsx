import React, { useRef, useEffect } from 'react';
import { Box, Heading, Text, useColorModeValue } from '@chakra-ui/react';
import gsap from 'gsap';

const HeaderSection = () => {
  const headerRef = useRef(null);

  useEffect(() => {
    if (headerRef.current) {
      gsap.fromTo(
        headerRef.current,
        { y: -100, opacity: 0 },
        { y: 0, opacity: 1, duration: 0.6, ease: 'power2.out' }
      );
    }
  }, []);

  return (
    <Box
      ref={headerRef}
      position="fixed"
      top={0}
      left={0}
      right={0}
      zIndex={1000}
      textAlign="center"
      py={4}
      px={8}
      bgGradient="linear(to-r, blue.500, purple.500)"
      border="none"
      borderBottom="1px solid"
      borderColor="rgba(106, 90, 205, 0.3)"
      boxShadow="0 4px 20px rgba(106, 90, 205, 0.3)"
      backdropFilter="blur(10px)"
      overflow="hidden"
      _before={{
        content: '""',
        position: 'absolute',
        top: 0,
        left: 0,
        right: 0,
        height: '3px',
        background: 'linear-gradient(90deg, #4A90E2 0%, #6A5ACD 50%, #8B5CF6 100%)',
        backgroundSize: '200% 100%',
        animation: 'gradient 3s ease infinite'
      }}
    >
      <Heading
        as="h2"
        size="xl"
        mb={2}
        fontWeight="700"
        color="white"
        textShadow="0 2px 10px rgba(0, 0, 0, 0.3)"
        letterSpacing="-0.5px"
      >
        地毯价格计算器
      </Heading>
      <Text 
        fontSize="md" 
        color="whiteAlpha.900"
        fontWeight="500"
        mb={1}
      >
        输入尺寸，选择产品，快速获取报价
      </Text>
      <Text 
        fontSize="xs" 
        color="whiteAlpha.800" 
        fontWeight="600"
        letterSpacing="1px"
      >
        映绸家具
      </Text>
      
      <style>
        {`
          @keyframes gradient {
            0% { background-position: 0% 50%; }
            50% { background-position: 100% 50%; }
            100% { background-position: 0% 50%; }
          }
        `}
      </style>
    </Box>
  );
};

export default HeaderSection;