import React from 'react';
import { Box, Flex, Text, useColorModeValue } from '@chakra-ui/react';

const Header = () => {
  const bgGradient = useColorModeValue(
    'linear(to-r, blue.500, purple.600)',
    'linear(to-r, blue.600, purple.700)'
  );
  const textColor = useColorModeValue('white', 'white');
  const brandColor = useColorModeValue('yellow.300', 'yellow.200');

  return (
    <Box
      position="fixed"
      top={0}
      left={0}
      right={0}
      zIndex={1000}
      bgGradient={bgGradient}
      boxShadow="0 2px 10px rgba(0, 0, 0, 0.1)"
      transition="all 0.3s ease"
      width="100%"
    >
      <Flex
        direction="row"
        align="center"
        justify="space-between"
        maxWidth="1400px"
        mx="auto"
        px={{ base: 4, md: 8 }}
        py={3}
      >
        <Flex align="center" gap={3}>
          <Box
            w={{ base: '120px', md: '150px' }}
            h="auto"
            display="flex"
            alignItems="center"
            justifyContent="center"
            transition="transform 0.3s ease"
            _hover={{ transform: 'scale(1.05)' }}
          >
            <img
              src="https://haisnap.tos-cn-beijing.volces.com/image/1ea7b9c4-3d65-4b17-b39b-cae41ce22a84_1764725078397.jpg"
              alt="地毯价格计算器"
              style={{
                maxWidth: '100%',
                height: 'auto',
                display: 'block'
              }}
              loading="lazy"
            />
          </Box>
          <Text
            fontSize={{ base: 'xl', md: '2xl' }}
            fontWeight="700"
            color={textColor}
            letterSpacing="tight"
            display={{ base: 'none', sm: 'block' }}
          >
            地毯价格计算器
          </Text>
        </Flex>

        <Text
          fontSize={{ base: 'xs', md: 'sm' }}
          color={brandColor}
          fontWeight="600"
          letterSpacing="wider"
          fontFamily="'ZCOOL XiaoWei', cursive, -apple-system, BlinkMacSystemFont, 'Segoe UI', sans-serif"
          textShadow="0 1px 2px rgba(0, 0, 0, 0.2)"
        >
          映绸家居
        </Text>
      </Flex>
    </Box>
  );
};

export default Header;