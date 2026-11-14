import React, { useState, useEffect, useRef, memo } from 'react';
import {
  Box,
  Input,
  InputGroup,
  InputLeftElement,
  VStack,
  HStack,
  Text,
  Button,
  Badge,
  Flex,
  useToast
} from '@chakra-ui/react';
import { SearchIcon } from '@chakra-ui/icons';
import { FaTag, FaTimes } from 'react-icons/fa';
import gsap from 'gsap';

const ProductSearch = memo(({ products, onSelectProduct, selectedProduct, customPrice, onCustomPriceChange, dimensionsValue }) => {
  const [searchTerm, setSearchTerm] = useState('');
  const [showResults, setShowResults] = useState(false);
  const [filteredProducts, setFilteredProducts] = useState([]);
  const [selectedQuickBtn, setSelectedQuickBtn] = useState(null);
  const [priceInput, setPriceInput] = useState('');

  const toast = useToast();
  const inputRef = useRef(null);
  const resultsRef = useRef(null);

  useEffect(() => {
    if (selectedProduct) {
      setSearchTerm(selectedProduct.name);
    }
  }, [selectedProduct]);

  useEffect(() => {
    if (customPrice > 0) {
      setPriceInput(customPrice.toString());
    }
  }, [customPrice]);

  useEffect(() => {
    if (searchTerm.trim().length === 0) {
      setShowResults(false);
      setFilteredProducts([]);
      return;
    }

    const filtered = products.filter(product =>
      product.name.toLowerCase().includes(searchTerm.toLowerCase())
    );

    setFilteredProducts(filtered);
    setShowResults(true);
  }, [searchTerm, products]);

  useEffect(() => {
    if (resultsRef.current && showResults) {
      gsap.fromTo(
        resultsRef.current,
        { opacity: 0, y: -10 },
        { opacity: 1, y: 0, duration: 0.3, ease: 'power2.out' }
      );
    }
  }, [showResults]);

  const handleSearchChange = (e) => {
    setSearchTerm(e.target.value);
  };

  const handleSelectProduct = (product) => {
    setSearchTerm(product.name);
    setShowResults(false);
    onSelectProduct(product);

    const productIndex = products.findIndex(p => p.name === product.name);
    setSelectedQuickBtn(productIndex);

    toast({
      title: '产品已选择',
      description: product.name,
      status: 'success',
      duration: 2000,
      isClosable: true,
      position: 'top-right'
    });
  };

  const handleQuickSelect = (product, index) => {
    if (!product.custom) {
      toast({
        title: '该产品不支持定制',
        status: 'warning',
        duration: 2000,
        isClosable: true,
        position: 'top-right'
      });
      return;
    }

    setSelectedQuickBtn(index);
    handleSelectProduct(product);
  };

  const handleClearSearch = () => {
    setSearchTerm('');
    setShowResults(false);
    setSelectedQuickBtn(null);
    onSelectProduct(null);
  };

  const handlePriceChange = (e) => {
    const value = e.target.value;
    
    if (value && parseFloat(value) < 0) {
      return;
    }
    
    setPriceInput(value);
    
    const price = parseFloat(value);
    if (!isNaN(price) && price > 0) {
      onCustomPriceChange && onCustomPriceChange(price);
    } else if (value === '') {
      setPriceInput('');
      onCustomPriceChange && onCustomPriceChange(0);
    }
  };

  const handleClearPrice = () => {
    setPriceInput('');
    if (onCustomPriceChange) {
      onCustomPriceChange(0);
    }
    
    if (document.activeElement instanceof HTMLElement) {
      document.activeElement.blur();
    }
    
    toast({
      title: '已清除自定义价格',
      description: '将使用产品默认价格',
      status: 'info',
      duration: 2000,
      isClosable: true,
      position: 'top-right'
    });
  };

  const handleClickOutside = (e) => {
    if (
      inputRef.current &&
      !inputRef.current.contains(e.target) &&
      resultsRef.current &&
      !resultsRef.current.contains(e.target)
    ) {
      setShowResults(false);
    }
  };

  useEffect(() => {
    document.addEventListener('mousedown', handleClickOutside);
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, []);

  useEffect(() => {
    const handleKeyPress = (e) => {
      if (e.target.tagName === 'INPUT' || e.target.tagName === 'TEXTAREA') {
        return;
      }
      
      const key = e.key;
      if (/^[1-8]$/.test(key)) {
        const keyNumber = parseInt(key, 10);
        const allowedIndices = [0, 1, 2, 3, 6, 7, 13, 15];
        
        if (keyNumber >= 1 && keyNumber <= allowedIndices.length) {
          const productIndex = allowedIndices[keyNumber - 1];
          const product = products[productIndex];
          
          if (product) {
            handleQuickSelect(product, productIndex);
          }
        }
      }
    };
    
    window.addEventListener('keydown', handleKeyPress);
    return () => {
      window.removeEventListener('keydown', handleKeyPress);
    };
  }, [products]);

  return (
    <VStack spacing={6} align="stretch" className="w-full">
      <Box>
        <Text fontSize="15px" fontWeight="500" mb={2} color="gray.700">
          地毯类型
        </Text>
        <Box position="relative" ref={inputRef}>
          <InputGroup>
            <InputLeftElement pointerEvents="none">
              <SearchIcon color="gray.400" />
            </InputLeftElement>
            <Input
              placeholder="输入产品名称搜索..."
              value={searchTerm}
              onChange={handleSearchChange}
              bg="gray.50"
              border="1px solid"
              borderColor="gray.200"
              _hover={{ borderColor: 'orange.300' }}
              _focus={{
                borderColor: 'orange.500',
                boxShadow: '0 0 0 1px #FFA500'
              }}
              pr={searchTerm ? '40px' : '12px'}
            />
            {searchTerm && (
              <Box
                position="absolute"
                right="12px"
                top="50%"
                transform="translateY(-50%)"
                cursor="pointer"
                onClick={handleClearSearch}
                zIndex={2}
              >
                <FaTimes color="#999" />
              </Box>
            )}
          </InputGroup>

          {showResults && filteredProducts.length > 0 && (
            <Box
              ref={resultsRef}
              position="absolute"
              top="calc(100% + 4px)"
              left={0}
              right={0}
              bg="white"
              border="1px solid"
              borderColor="gray.200"
              borderRadius="8px"
              boxShadow="0 4px 12px rgba(0, 0, 0, 0.1)"
              maxH="300px"
              overflowY="auto"
              zIndex={1000}
              css={{
                '&::-webkit-scrollbar': {
                  width: '6px'
                },
                '&::-webkit-scrollbar-track': {
                  background: '#f1f1f1'
                },
                '&::-webkit-scrollbar-thumb': {
                  background: '#FFA500',
                  borderRadius: '3px'
                }
              }}
            >
              {filteredProducts.map((product, index) => (
                <Flex
                  key={index}
                  p={3}
                  cursor="pointer"
                  borderBottom="1px solid"
                  borderColor="gray.100"
                  _last={{ borderBottom: 'none' }}
                  _hover={{ bg: 'orange.50' }}
                  onClick={() => handleSelectProduct(product)}
                  justify="space-between"
                  align="center"
                >
                  <Text fontSize="14px" flex={1}>
                    {product.name}
                  </Text>
                  <HStack spacing={2}>
                    {product.custom ? (
                      <Badge colorScheme="green" fontSize="xs">
                        {product.price}元/㎡
                      </Badge>
                    ) : (
                      <Badge colorScheme="red" fontSize="xs">
                        不支持定制
                      </Badge>
                    )}
                    {product.maxWidth && (
                      <Badge colorScheme="orange" fontSize="xs">
                        最大{product.maxWidth}cm
                      </Badge>
                    )}
                  </HStack>
                </Flex>
              ))}
            </Box>
          )}
        </Box>
      </Box>

      <Box
        pt={4}
        borderTop="1px dashed"
        borderColor="gray.200"
      >
        <Text fontSize="15px" fontWeight="500" mb={2} color="gray.700">
          自定义价格 (可选)
        </Text>
        <Box position="relative">
          <InputGroup>
            <InputLeftElement pointerEvents="none">
              <Text fontSize="14px" color="gray.500">¥</Text>
            </InputLeftElement>
            <Input
              placeholder="输入自定义单价 (元/㎡)"
              value={priceInput}
              onChange={handlePriceChange}
              bg="gray.50"
              border="1px solid"
              borderColor="gray.200"
              type="number"
              min="0"
              max="9999"
              step="0.01"
              _hover={{ borderColor: 'orange.300' }}
              _focus={{
                borderColor: 'orange.500',
                boxShadow: '0 0 0 1px #FFA500',
                bg: 'white'
              }}
              pr={priceInput ? '40px' : '12px'}
              fontSize="14px"
            />
            {priceInput && (
              <Box
                position="absolute"
                right="12px"
                top="50%"
                transform="translateY(-50%)"
                cursor="pointer"
                onClick={handleClearPrice}
                zIndex={2}
              >
                <FaTimes color="#999" />
              </Box>
            )}
          </InputGroup>
          <Text fontSize="13px" color="gray.500" mt={2}>
            自定义价格将覆盖产品默认价格
          </Text>
        </Box>
      </Box>

      <Box
        pt={4}
        borderTop="1px dashed"
        borderColor="gray.200"
      >
        <HStack spacing={3} mb={3}>
          <FaTag color="#FFA500" />
          <Text fontSize="15px" fontWeight="500" color="gray.700">
            快速选择产品
          </Text>
        </HStack>
        <Flex flexWrap="wrap" gap={2}>
          {products.map((product, index) => {
            const allowedIndices = [0, 1, 2, 3, 6, 7, 13, 15];
            const labelMap = {
              0: '条纹',
              1: '菱形方格',
              2: '硬丝',
              3: '平面',
              6: '流星毯',
              7: '丝圈',
              13: '宽条纹',
              15: '硅藻泥'
            };
            
            if (!allowedIndices.includes(index)) {
              return null;
            }
            
            return (
              <Button
                key={index}
                size="sm"
                variant={selectedQuickBtn === index ? 'solid' : 'outline'}
                colorScheme={selectedQuickBtn === index ? 'orange' : 'gray'}
                onClick={() => handleQuickSelect(product, index)}
                isDisabled={!product.custom}
                _disabled={{
                  bg: 'gray.100',
                  color: 'gray.400',
                  cursor: 'not-allowed'
                }}
              >
                {labelMap[index]}
              </Button>
            );
          })}
        </Flex>
        <Text fontSize="13px" color="gray.500" mt={2} textAlign="center">
          点击按钮快速选择产品
        </Text>
      </Box>
    </VStack>
  );
}, (prevProps, nextProps) => {
  return (
    prevProps.selectedProduct === nextProps.selectedProduct &&
    prevProps.customPrice === nextProps.customPrice &&
    prevProps.dimensionsValue === nextProps.dimensionsValue &&
    prevProps.products.length === nextProps.products.length
  );
});

ProductSearch.displayName = 'ProductSearch';

export default ProductSearch;