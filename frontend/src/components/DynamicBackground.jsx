import React from 'react';
import { Box } from '@chakra-ui/react';

const DynamicBackground = () => {
  return (
    <Box
      position="fixed"
      top={0}
      left={0}
      width="100vw"
      height="100vh"
      zIndex={-1}
      overflow="hidden"
      pointerEvents="none"
      bgGradient="linear(135deg, #FAFAFA 0%, #F5F5F5 50%, #E8E8E8 100%)"
      _dark={{
        bgGradient: "linear(135deg, #1A1A1A 0%, #2A2A2A 50%, #3A3A3A 100%)"
      }}
      transition="background 0.3s ease-in-out"
    >
      <Box
        position="absolute"
        top="-20%"
        left="-10%"
        width="40vw"
        height="40vw"
        maxW="500px"
        maxH="500px"
        borderRadius="50%"
        background="radial-gradient(circle, rgba(255, 165, 0, 0.03) 0%, transparent 70%)"
        filter="blur(60px)"
        transform="translate3d(0,0,0)"
        _dark={{
          background: "radial-gradient(circle, rgba(255, 165, 0, 0.02) 0%, transparent 70%)"
        }}
      />

      <Box
        position="absolute"
        bottom="-15%"
        right="-5%"
        width="45vw"
        height="45vw"
        maxW="600px"
        maxH="600px"
        borderRadius="50%"
        background="radial-gradient(circle, rgba(106, 90, 205, 0.04) 0%, transparent 70%)"
        filter="blur(70px)"
        transform="translate3d(0,0,0)"
        _dark={{
          background: "radial-gradient(circle, rgba(106, 90, 205, 0.02) 0%, transparent 70%)"
        }}
      />
    </Box>
  );
};

export default DynamicBackground;