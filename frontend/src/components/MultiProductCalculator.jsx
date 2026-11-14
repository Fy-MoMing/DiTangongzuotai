import React, { useState, useEffect, useRef } from 'react';
import {
  Box,
  VStack,
  HStack,
  Button,
  Table,
  Thead,
  Tbody,
  Tr,
  Th,
  Td,
  Text,
  Badge,
  IconButton,
  Divider,
  useToast,
  Flex,
  Select,
  Input
} from '@chakra-ui/react';
import { FaPlus, FaTrash, FaShoppingCart, FaCheckCircle } from 'react-icons/fa';
import gsap from 'gsap';
import {
  cardFadeInAnimation,
  buttonHoverAnimation,
  listItemSlideInAnimation
} from '../styles/animations';

const MultiProductCalculator = ({ products }) => {
  const [selectedProducts, setSelectedProducts] = useState([]);
  const [selectedProduct, setSelectedProduct] = useState('');
  const [customDimensions, setCustomDimensions] = useState('');
  const [customPrice, setCustomPrice] = useState('');

  const toast = useToast();
  const containerRef = useRef(null);
  const tableRef = useRef(null);

  useEffect(() => {
    if (containerRef.current) {
      cardFadeInAnimation(containerRef.current, 0.2);
    }
  }, []);

  useEffect(() => {
    if (tableRef.current && selectedProducts.length > 0) {
      const rows = tableRef.current.querySelectorAll('tbody tr');
      listItemSlideInAnimation(Array.from(rows));
    }
  }, [selectedProducts]);

  const parseDimensions = (input) => {
    if (!input.trim()) return [];
    const lines = input.split('\n');
    const parsed = [];

    lines.forEach(line => {
      const trimmed = line.trim();
      if (!trimmed || !trimmed.includes('*')) return;

      const parts = trimmed.split('*');
      if (parts.length !== 2) return;

      const width = parseInt(parts[0]) || 0;
      const length = parseInt(parts[1]) || 0;

      if (width > 0 && length > 0) {
        parsed.push({ width, length, raw: trimmed });
      }
    });

    return parsed;
  };

  const calculateProductPrice = (dimensions, pricePerSqm) => {
    const parsedDims = parseDimensions(dimensions);
    if (parsedDims.length === 0) return 0;

    let totalArea = 0;
    parsedDims.forEach(dim => {
      totalArea += (dim.width * dim.length) / 10000;
    });

    return totalArea * pricePerSqm;
  };

  const addProduct = () => {
    if (!selectedProduct && !customPrice) {
      toast({
        title: '请选择产品或输入自定义价格',
        status: 'warning',
        duration: 2000,
        isClosable: true,
        position: 'top-right'
      });
      return;
    }

    if (!customDimensions.trim()) {
      toast({
        title: '请输入尺寸',
        description: '格式：宽*长，每行一个尺寸',
        status: 'warning',
        duration: 2000,
        isClosable: true,
        position: 'top-right'
      });
      return;
    }

    const parsedDims = parseDimensions(customDimensions);
    if (parsedDims.length === 0) {
      toast({
        title: '尺寸格式错误',
        description: '请使用正确格式：宽*长（如：100*150）',
        status: 'error',
        duration: 2000,
        isClosable: true,
        position: 'top-right'
      });
      return;
    }

    const product = products.find(p => p.name === selectedProduct);
    const pricePerSqm = customPrice ? parseFloat(customPrice) : (product ? product.price : 0);

    if (pricePerSqm <= 0) {
      toast({
        title: '价格无效',
        description: '请选择产品或输入有效的自定义价格',
        status: 'error',
        duration: 2000,
        isClosable: true,
        position: 'top-right'
      });
      return;
    }

    const totalPrice = calculateProductPrice(customDimensions, pricePerSqm);
    const totalArea = parsedDims.reduce((sum, dim) => sum + (dim.width * dim.length) / 10000, 0);

    const newProduct = {
      id: Date.now(),
      name: product ? product.name : '自定义产品',
      dimensions: customDimensions,
      pricePerSqm: pricePerSqm,
      totalArea: totalArea,
      totalPrice: totalPrice,
      quantity: parsedDims.length
    };

    setSelectedProducts([...selectedProducts, newProduct]);
    setCustomDimensions('');
    setCustomPrice('');
    setSelectedProduct('');

    toast({
      title: '产品已添加',
      description: `已添加 ${newProduct.quantity} 个尺寸`,
      status: 'success',
      duration: 2000,
      isClosable: true,
      position: 'top-right',
      icon: <FaCheckCircle />
    });
  };

  const removeProduct = (id) => {
    setSelectedProducts(selectedProducts.filter(p => p.id !== id));
    toast({
      title: '产品已移除',
      status: 'info',
      duration: 2000,
      isClosable: true,
      position: 'top-right'
    });
  };

  const clearAll = () => {
    if (selectedProducts.length === 0) {
      toast({
        title: '列表为空',
        status: 'warning',
        duration: 2000,
        isClosable: true,
        position: 'top-right'
      });
      return;
    }

    if (window.confirm('确定要清空所有产品吗？')) {
      setSelectedProducts([]);
      toast({
        title: '已清空列表',
        status: 'success',
        duration: 2000,
        isClosable: true,
        position: 'top-right'
      });
    }
  };

  const grandTotal = selectedProducts.reduce((sum, p) => sum + p.totalPrice, 0);
  const totalQuantity = selectedProducts.reduce((sum, p) => sum + p.quantity, 0);

  return (
    <Box ref={containerRef} p={6}>
      <VStack spacing={6} align="stretch">
        <HStack spacing={3} mb={2}>
          <FaShoppingCart color="#FFA500" size={24} />
          <Text fontSize="lg" fontWeight="600" color="gray.700">
            多产品批量计算
          </Text>
          <Badge colorScheme="orange" fontSize="xs">
            批量管理
          </Badge>
        </HStack>

        <Divider />

        <Box
          p={6}
          bg="gray.50"
          borderRadius="12px"
          border="1px solid"
          borderColor="gray.200"
        >
          <VStack spacing={4} align="stretch">
            <Box>
              <Text fontSize="14px" fontWeight="500" mb={2} color="gray.700">
                选择产品
              </Text>
              <Select
                placeholder="选择产品（可选）"
                value={selectedProduct}
                onChange={(e) => setSelectedProduct(e.target.value)}
                bg="white"
                border="1px solid"
                borderColor="gray.200"
                _hover={{ borderColor: 'orange.300' }}
                _focus={{
                  borderColor: 'orange.500',
                  boxShadow: '0 0 0 1px #FFA500'
                }}
              >
                {products.map((product, index) => (
                  <option key={index} value={product.name}>
                    {product.name} - ¥{product.price}/㎡
                  </option>
                ))}
              </Select>
            </Box>

            <Box>
              <Text fontSize="14px" fontWeight="500" mb={2} color="gray.700">
                自定义价格（可选，元/㎡）
              </Text>
              <Input
                type="number"
                placeholder="输入自定义价格，覆盖产品价格"
                value={customPrice}
                onChange={(e) => setCustomPrice(e.target.value)}
                bg="white"
                border="1px solid"
                borderColor="gray.200"
                _hover={{ borderColor: 'orange.300' }}
                _focus={{
                  borderColor: 'orange.500',
                  boxShadow: '0 0 0 1px #FFA500'
                }}
                min="0"
              />
            </Box>

            <Box>
              <Text fontSize="14px" fontWeight="500" mb={2} color="gray.700">
                输入尺寸（每行一个，格式：宽*长）
              </Text>
              <Input
                as="textarea"
                placeholder="例如：&#10;100*150&#10;120*180"
                value={customDimensions}
                onChange={(e) => setCustomDimensions(e.target.value)}
                bg="white"
                border="1px solid"
                borderColor="gray.200"
                _hover={{ borderColor: 'orange.300' }}
                _focus={{
                  borderColor: 'orange.500',
                  boxShadow: '0 0 0 1px #FFA500'
                }}
                minH="100px"
                resize="vertical"
              />
            </Box>

            <Button
              leftIcon={<FaPlus />}
              colorScheme="orange"
              size="md"
              onClick={addProduct}
              onMouseEnter={(e) => buttonHoverAnimation(e.currentTarget, true)}
              onMouseLeave={(e) => buttonHoverAnimation(e.currentTarget, false)}
            >
              添加到列表
            </Button>
          </VStack>
        </Box>

        {selectedProducts.length > 0 && (
          <>
            <Flex justify="space-between" align="center">
              <Text fontSize="16px" fontWeight="600" color="gray.700">
                已添加产品列表
              </Text>
              <Button
                leftIcon={<FaTrash />}
                colorScheme="red"
                variant="outline"
                size="sm"
                onClick={clearAll}
              >
                清空列表
              </Button>
            </Flex>

            <Box
              ref={tableRef}
              overflowX="auto"
              border="1px solid"
              borderColor="gray.200"
              borderRadius="8px"
            >
              <Table variant="simple" size="sm">
                <Thead bg="gray.50">
                  <Tr>
                    <Th>产品名称</Th>
                    <Th textAlign="center">数量</Th>
                    <Th textAlign="center">单价</Th>
                    <Th textAlign="center">总面积</Th>
                    <Th textAlign="center">总价</Th>
                    <Th textAlign="center">操作</Th>
                  </Tr>
                </Thead>
                <Tbody>
                  {selectedProducts.map((product) => (
                    <Tr key={product.id} _hover={{ bg: 'orange.50' }}>
                      <Td>
                        <Text fontSize="sm" fontWeight="500" noOfLines={1}>
                          {product.name}
                        </Text>
                      </Td>
                      <Td textAlign="center">
                        <Badge colorScheme="blue" fontSize="xs">
                          {product.quantity} 张
                        </Badge>
                      </Td>
                      <Td textAlign="center">
                        <Text fontSize="sm" fontWeight="500">
                          ¥{product.pricePerSqm}/㎡
                        </Text>
                      </Td>
                      <Td textAlign="center">
                        <Text fontSize="sm">
                          {product.totalArea.toFixed(2)} ㎡
                        </Text>
                      </Td>
                      <Td textAlign="center">
                        <Text fontSize="sm" fontWeight="600" color="red.500">
                          ¥{product.totalPrice.toFixed(2)}
                        </Text>
                      </Td>
                      <Td textAlign="center">
                        <IconButton
                          icon={<FaTrash />}
                          colorScheme="red"
                          variant="ghost"
                          size="sm"
                          onClick={() => removeProduct(product.id)}
                          aria-label="删除产品"
                        />
                      </Td>
                    </Tr>
                  ))}
                </Tbody>
              </Table>
            </Box>

            <Box
              p={5}
              bg="orange.50"
              borderRadius="8px"
              border="1px solid"
              borderColor="orange.200"
            >
              <VStack spacing={3} align="stretch">
                <Flex justify="space-between" align="center">
                  <Text fontSize="14px" color="gray.600">
                    总数量:
                  </Text>
                  <Text fontSize="16px" fontWeight="600">
                    {totalQuantity} 张
                  </Text>
                </Flex>

                <Divider />

                <Flex justify="space-between" align="center">
                  <Text fontSize="16px" fontWeight="600" color="gray.700">
                    合计总价:
                  </Text>
                  <Text fontSize="24px" fontWeight="700" color="red.500">
                    ¥{grandTotal.toFixed(2)}
                  </Text>
                </Flex>
              </VStack>
            </Box>
          </>
        )}

        {selectedProducts.length === 0 && (
          <Box
            py={12}
            textAlign="center"
            color="gray.400"
            border="1px dashed"
            borderColor="gray.300"
            borderRadius="8px"
          >
            <FaShoppingCart size={48} opacity={0.3} style={{ margin: '0 auto' }} />
            <Text fontSize="lg" fontWeight="500" mt={4}>
              暂无产品
            </Text>
            <Text fontSize="sm" mt={2}>
              请添加产品开始批量计算
            </Text>
          </Box>
        )}
      </VStack>
    </Box>
  );
};

export default MultiProductCalculator;