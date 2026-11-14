import React, { useState, useEffect, useRef } from 'react';
import { Box, Text, HStack, Badge } from '@chakra-ui/react';
import CountUp from 'react-countup';
import { FaChartLine } from 'react-icons/fa';
import gsap from 'gsap';

const UsageCounter = () => {
  const [count, setCount] = useState(() => {
    const stored = localStorage.getItem('calculationCount');
    return stored ? parseInt(stored, 10) : 25;
  });
  
  const containerRef = useRef(null);
  const prevCountRef = useRef(count);

  useEffect(() => {
    if (containerRef.current) {
      gsap.fromTo(containerRef.current,
        { x: 50, opacity: 0 },
        { x: 0, opacity: 1, duration: 0.8, ease: 'power3.out', delay: 0.3 }
      );
    }
  }, []);

  useEffect(() => {
    if (!localStorage.getItem('calculationCount')) {
      localStorage.setItem('calculationCount', '25');
    }

    const handleUpdate = () => {
      const stored = localStorage.getItem('calculationCount');
      if (stored) {
        const newValue = parseInt(stored, 10);
        if (newValue !== count) {
          prevCountRef.current = count;
          setCount(newValue);
          
          if (containerRef.current) {
            gsap.fromTo(containerRef.current, 
              { scale: 1.05, borderColor: '#ED8936' },
              { scale: 1, borderColor: '#E2E8F0', duration: 0.4, ease: 'power2.out' }
            );
          }
        }
      }
    };

    window.addEventListener('calculationUpdated', handleUpdate);
    window.addEventListener('storage', handleUpdate);

    return () => {
      window.removeEventListener('calculationUpdated', handleUpdate);
      window.removeEventListener('storage', handleUpdate);
    };
  }, [count]);

  return (
    <Box
      ref={containerRef}
      position="fixed"
      top={{ base: "20px", md: "20px" }}
      right={{ base: "16px", md: "32px" }}
      zIndex={900}
      bg="white"
      backdropFilter="blur(12px)"
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
        borderColor: 'orange.300'
      }}
    >
      <HStack spacing={3}>
        <Box 
          color="orange.500" 
          animation="pulse 3s infinite ease-in-out"
          sx={{
            '@keyframes pulse': {
              '0%': { transform: 'scale(1)', opacity: 0.8 },
              '50%': { transform: 'scale(1.1)', opacity: 1 },
              '100%': { transform: 'scale(1)', opacity: 0.8 },
            }
          }}
        >
          <FaChartLine size={18} />
        </Box>
        
        <Text 
          fontSize="sm" 
          fontWeight="600" 
          color="gray.700"
          display={{ base: "none", sm: "block" }}
        >
          累计计算
        </Text>
        
        <Badge 
          colorScheme="orange" 
          variant="subtle" 
          borderRadius="full" 
          px={3}
          py={1}
          fontSize="sm"
          fontWeight="bold"
        >
          <CountUp
            start={prevCountRef.current}
            end={count}
            duration={1.5}
            separator=","
            preserveValue={true}
          />
          <Text as="span" ml={1} fontSize="xs" fontWeight="normal">次</Text>
        </Badge>
      </HStack>
    </Box>
  );
};

export default UsageCounter;