import React, { useState, useEffect, useRef, Suspense, lazy } from 'react';
import {
  Box,
  Container,
  Grid,
  VStack,
  HStack,
  Input,
  Button,
  Text,
  useToast,
  InputGroup,
  InputRightElement,
  Badge,
  Card,
  CardBody,
  Divider,
  Spinner,
  Center
} from '@chakra-ui/react';
import { FaCalculator, FaArrowRight, FaMagic } from 'react-icons/fa';
import gsap from 'gsap';

const SizeCalculator = lazy(() => import('../components/SizeCalculator'));
const ProductSearch = lazy(() => import('../components/ProductSearch'));
const DynamicBackground = lazy(() => import('../components/DynamicBackground'));

const cardFadeInAnimation = (element, delay = 0) => {
  if (!element) return;
  gsap.fromTo(element, 
    { opacity: 0, y: 20 },
    { opacity: 1, y: 0, duration: 0.5, delay: delay, ease: 'power2.out' }
  );
};

const LoadingFallback = () => (
  <Center minH="400px">
    <VStack spacing={4}>
      <Spinner thickness="4px" speed="0.65s" emptyColor="gray.200" color="orange.500" size="xl" />
      <Box fontSize="md" color="gray.600">加载中...</Box>
    </VStack>
  </Center>
);

const DimensionParser = ({ onParseResult }) => {
  const [expression, setExpression] = useState('');
  const toast = useToast();

  const handleParse = () => {
    if (!expression.trim()) {
      toast({
        title: '请输入算式',
        status: 'warning',
        duration: 2000,
        isClosable: true,
        position: 'top-right'
      });
      return;
    }

    try {
      const cleanExpr = expression.replace(/\s/g, '');
      
      if (!/^[\d\+\.\*]+$/.test(cleanExpr)) {
        throw new Error('包含无效字符');
      }

      const parts = cleanExpr.split('*');
      
      const results = parts.map(part => {
        const sum = part.split('+').reduce((acc, curr) => {
          const num = parseFloat(curr);
          if (isNaN(num)) throw new Error('数字格式错误');
          return acc + num;
        }, 0);
        return parseFloat(sum.toFixed(2));
      });

      const resultString = results.join('*');

      toast({
        title: '解析成功',
        description: `${expression} = ${resultString}`,
        status: 'success',
        duration: 2000,
        isClosable: true,
        position: 'top-right'
      });

      onParseResult(resultString);
    } catch (error) {
      toast({
        title: '解析失败',
        description: '请输入正确的格式，如: 103+177*252+113',
        status: 'error',
        duration: 3000,
        isClosable: true,
        position: 'top-right'
      });
    }
  };

  const handleKeyPress = (e) => {
    if (e.key === 'Enter') {
      handleParse();
    }
  };

  return (
    <Box 
      bg="white" 
      p={5} 
      borderRadius="12px" 
      boxShadow="0 2px 8px rgba(0, 0, 0, 0.08)"
      border="1px solid"
      borderColor="gray.200"
      mb={6}
    >
      <HStack spacing={2} mb={3}>
        <FaMagic color="#805AD5" />
        <Text fontSize="md" fontWeight="600" color="gray.700">
          智能尺寸算式解析
        </Text>
        <Badge colorScheme="purple" fontSize="xs">NEW</Badge>
      </HStack>
      <HStack spacing={2}>
        <InputGroup size="md">
          <Input
            placeholder="输入算式，如: 103+177*252+113"
            value={expression}
            onChange={(e) => setExpression(e.target.value)}
            onKeyPress={handleKeyPress}
            bg="gray.50"
            border="1px solid"
            borderColor="gray.200"
            _focus={{
              borderColor: 'purple.500',
              boxShadow: '0 0 0 1px #805AD5'
            }}
          />
          <InputRightElement width="4.5rem">
            <Button h="1.75rem" size="sm" onClick={() => setExpression('')} variant="ghost" color="gray.400">
              清空
            </Button>
          </InputRightElement>
        </InputGroup>
        <Button 
          leftIcon={<FaArrowRight />} 
          colorScheme="purple" 
          onClick={handleParse}
          px={6}
        >
          解析并填入
        </Button>
      </HStack>
      <Text fontSize="xs" color="gray.500" mt={2}>
        支持格式：宽分段+宽分段*长分段+长分段 (例如：103+177*252+113 → 280*365)
      </Text>
    </Box>
  );
};

const Calculator = () => {
  const [selectedProduct, setSelectedProduct] = useState(null);
  const [customPrice, setCustomPrice] = useState(0);
  const [dimensions, setDimensions] = useState('');
  const pageRef = useRef(null);

  const PRODUCTS = [
    { name: "1.映绸进门垫防滑吸水家用加厚地垫宾馆酒店走廊地毯门厅加厚毯子", price: 40, custom: true, options: { types: ["条纹"], colors: ["灰色", "深红", "大红"], edges: ["无黑边", "单边黑边"] } },
    { name: "2.高端定制加厚地垫家用酒店大门口迎宾门垫脚垫防滑地毯入户垫门厅", price: 80, custom: true, options: { types: ["花形", "方格"], colors: ["深灰色", "深红色", "大红", "黑色"], edges: ["无黑边", "单边黑边"] } },
    { name: "3.防水免洗入户门垫塑料定制地毯除尘家商用防滑垫地垫进门脚垫裁剪", price: 100, custom: true, options: { types: [], colors: ["灰色", "深红色"], edges: ["无黑边", "单边黑边"] } },
    { name: "4.平面高级感入户防滑地垫吸水门口地毯门前脚垫除尘地毯走廊地毯", price: 80, custom: true },
    { name: "5.高端入户门地垫高弹防水地毯大门口室外防滑地垫进门地毯门前脚垫", price: 0, custom: false },
    { name: "6.防滑出入平安吸水门垫入户吉祥如意字大门口地毯加厚吸水防滑垫", price: 40, custom: true },
    { name: "7.流星地毯加厚入户进门地垫吸水防滑垫耐磨高质量过道走廊除尘地毯", price: 110, custom: true },
    { name: "8.定制丝圈入户门垫裁剪防滑垫塑料脚垫地毯家用防水加厚门厅地垫 最宽1.2米", price: 95, custom: true, maxWidth: 120 },
    { name: "9.方块进门入户防滑地垫加厚门口地毯吸水脚垫走廊地毯玄关门前地垫", price: 90, custom: true },
    { name: "10.加厚门厅地毯防滑垫吸水地垫大门口入户门商场公司进门垫脚垫", price: 60, custom: true },
    { name: "11.映绸走廊红地毯玄关地毯定制商用地垫大面积防滑吸水满铺进门地垫", price: 40, custom: true },
    { name: "12.加厚入户门地毯吸水防滑地垫走廊厕所门口脚垫门厅地毯地垫门垫", price: 80, custom: true },
    { name: "13.防水走廊长地毯丝圈硬材质耐磨脚垫地垫大门口酒店过道地毯家用", price: 100, custom: true },
    { name: "14.宽条纹地垫入户门垫门口卫生间吸水垫卧室防滑毯厨房地垫吸水地毯", price: 50, custom: true },
    { name: "15.方格加厚地垫家用酒店大门口地毯门垫脚垫防滑地毯入户垫门厅地垫", price: 80, custom: true },
    { name: "16.硅藻泥定制浴室门口吸水地毯防滑入户进门地垫走廊玄关耐脏地毯", price: 50, custom: true },
    { name: "17.欢迎光临门垫酒店大门地垫加厚防滑门垫蹭脚垫地垫吸水防滑垫", price: 80, custom: true },
    { name: "18.菱形纹欢迎光临出入平安地毯迎宾门垫商铺酒店宾馆大门口地垫脚垫", price: 80, custom: true },
    { name: "19.映绸塑料丝圈地垫入户门垫塑料出入平安垫子进门防滑欢迎光临地毯", price: 0, custom: false },
    { name: "20.高档丝圈入户门口地垫门外脚垫欢迎光临门垫进门家用出入平安耐脏", price: 0, custom: false },
    { name: "21.菠萝纹定制地毯防滑吸水家用加厚地垫", price: 60, custom: true, options: { types: ["菠萝纹"], colors: ["黄色", "棕色", "米色"], edges: ["无黑边", "单边黑边", "四周黑边"] } },
    { name: "22.菠萝纹高端防滑吸水地垫", price: 60, custom: true, options: { types: ["菠萝纹"], colors: ["黄色", "棕色", "米色", "深灰色"], edges: ["无黑边", "单边黑边", "四周黑边"] } },
    { name: "123.定制高端地毯门垫防滑吸水耐磨家用商用入户门地垫走廊地毯", price: 85, custom: true, options: { types: ["现代简约", "欧式花纹"], colors: ["深灰色", "米色", "深蓝色", "酒红色"], edges: ["无黑边", "单边黑边", "四周黑边"] }, maxWidth: 150 }
  ];

  useEffect(() => {
    if (pageRef.current) {
      cardFadeInAnimation(pageRef.current);
    }
  }, []);

  const handleProductSelect = (product) => {
    setSelectedProduct(product);
  };

  const handleDimensionsChange = (value) => {
    setDimensions(value);
  };

  const handleParseResult = (resultString) => {
    const textareas = document.querySelectorAll('textarea');
    let targetTextarea = null;
    
    textareas.forEach(textarea => {
      if (textarea.placeholder && textarea.placeholder.includes('宽*长')) {
        targetTextarea = textarea;
      }
    });

    if (targetTextarea) {
      const currentValue = targetTextarea.value;
      const newValue = currentValue ? `${currentValue}\n${resultString}` : resultString;
      
      const nativeInputValueSetter = Object.getOwnPropertyDescriptor(window.HTMLTextAreaElement.prototype, "value").set;
      nativeInputValueSetter.call(targetTextarea, newValue);
      
      const event = new Event('input', { bubbles: true });
      targetTextarea.dispatchEvent(event);
      
      setDimensions(newValue);
    } else {
      setDimensions(prev => prev ? `${prev}\n${resultString}` : resultString);
    }
  };

  return (
    <Box position="relative" minH="100vh" pb="80px">
      <Suspense fallback={<LoadingFallback />}>
        <DynamicBackground />
      </Suspense>
      
      <Box 
        bg="transparent" 
        minH="100vh" 
        py={8}
        pt="40px"
        ref={pageRef}
        position="relative"
        zIndex={1}
      >
        <Container maxW="container.xl">
          <Grid
            templateColumns={{ base: '1fr', lg: 'repeat(2, 1fr)' }}
            gap={8}
          >
            <VStack spacing={8} align="stretch">
              <DimensionParser onParseResult={handleParseResult} />

              <Box
                bg="white"
                borderRadius="12px"
                boxShadow="0 2px 8px rgba(0, 0, 0, 0.08)"
                border="1px solid"
                borderColor="gray.200"
                p={8}
              >
                <Suspense fallback={<LoadingFallback />}>
                  <ProductSearch
                    products={PRODUCTS}
                    onSelectProduct={handleProductSelect}
                    selectedProduct={selectedProduct}
                    customPrice={customPrice}
                    onCustomPriceChange={setCustomPrice}
                    dimensionsValue={dimensions}
                  />
                </Suspense>
              </Box>
            </VStack>

            <Box
              bg="white"
              borderRadius="12px"
              boxShadow="0 2px 8px rgba(0, 0, 0, 0.08)"
              border="1px solid"
              borderColor="gray.200"
              p={8}
            >
              <Suspense fallback={<LoadingFallback />}>
                <SizeCalculator
                  selectedProduct={selectedProduct}
                  customPrice={customPrice}
                  onDimensionsChange={handleDimensionsChange}
                  value={dimensions} 
                />
              </Suspense>
            </Box>
          </Grid>
        </Container>
      </Box>
    </Box>
  );
};

export default Calculator;