import React from "react";
import { Box, Text } from "@chakra-ui/react";

const CounterDisplay = () => {
  return (
    <Box
      w={{ base: '90%', md: '400px' }}
      h="120px"
      borderRadius="24px"
      bgGradient="linear(135deg, #667eea 0%, #764ba2 100%)"
      boxShadow="0 10px 30px rgba(102, 126, 234, 0.4)"
      display="flex"
      flexDirection="column"
      alignItems="center"
      justifyContent="center"
      p={6}
      color="white"
      position="relative"
      overflow="hidden"
      transition="all 0.4s cubic-bezier(0.175, 0.885, 0.32, 1.275)"
      _hover={{
        transform: 'scale(1.05) translateY(-5px)',
        boxShadow: '0 15px 40px rgba(102, 126, 234, 0.6)',
      }}
      _before={{
        content: '""',
        position: 'absolute',
        top: '-50%',
        left: '-50%',
        width: '200%',
        height: '200%',
        background: 'radial-gradient(circle, rgba(255,255,255,0.1) 0%, transparent 70%)',
        animation: 'rotate 10s linear infinite',
      }}
    >
      <Text
        fontSize={{ base: 'sm', md: 'md' }}
        fontWeight="600"
        letterSpacing="wider"
        textTransform="uppercase"
        opacity={0.9}
        mb={2}
      >
        累计服务统计
      </Text>
      <Text
        fontSize={{ base: '3xl', md: '4xl' }}
        fontWeight="800"
        fontFamily="'Bungee', 'Inter', sans-serif"
        textShadow="0 2px 10px rgba(0, 0, 0, 0.3)"
        letterSpacing="tight"
      >
        计算次数 5000+
      </Text>
      
      <style>
        {`
          @keyframes rotate {
            0% {
              transform: rotate(0deg);
            }
            100% {
              transform: rotate(360deg);
            }
          }
        `}
      </style>
    </Box>
  );
};

export default CounterDisplay;