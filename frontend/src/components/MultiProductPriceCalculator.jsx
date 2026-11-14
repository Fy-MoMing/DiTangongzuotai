import React, { useState, useEffect, useRef } from "react";
import {
  Modal,
  ModalOverlay,
  ModalContent,
  ModalHeader,
  ModalFooter,
  ModalBody,
  ModalCloseButton,
  Box,
  Button,
  Input,
  Text,
  VStack,
  HStack,
  Select,
  Badge,
  Divider,
  useToast,
  IconButton,
  Flex,
  Table,
  Thead,
  Tbody,
  Tr,
  Th,
  Td
} from "@chakra-ui/react";
import { FaPlus, FaTrash, FaCalculator, FaCopy } from "react-icons/fa";
import gsap from "gsap";
import {
  buttonHoverAnimation,
  cardFadeInAnimation,
  inputFocusAnimation
} from "../styles/animations";

const MultiProductPriceCalculator = ({ isOpen, onClose, products: productList = [], initialProducts = [] }) => {
  const [products, setProducts] = useState([
    { id: 1, productName: "", width: "", length: "", quantity: 1, unitPrice: 0, totalPrice: 0 }
  ]);
  const [grandTotal, setGrandTotal] = useState(0);

  const toast = useToast();
  const containerRef = useRef(null);
  const itemsRef = useRef([]);

  // 初始化时如果有外部传入的产品数据，则使用外部数据
  useEffect(() => {
    if (isOpen && initialProducts && initialProducts.length > 0) {
      const formattedProducts = initialProducts.map((product, index) => ({
        id: product.id || index + 1,
        productName: product.productName || product.name || "",
        width: product.width || "",
        length: product.length || "",
        quantity: product.quantity || 1,
        unitPrice: product.unitPrice || 0,
        totalPrice: product.totalPrice || 0
      }));
      setProducts(formattedProducts);
      
      toast({
        title: "产品已添加",
        description: `已添加 ${formattedProducts.length} 个产品`,
        status: "success",
        duration: 2000,
        isClosable: true,
        position: "top-right"
      });
    }
  }, [isOpen, initialProducts]);

  useEffect(() => {
    if (isOpen && containerRef.current) {
      cardFadeInAnimation(containerRef.current, 0.1);
    }
  }, [isOpen]);

  useEffect(() => {
    if (isOpen && itemsRef.current.length > 0) {
      gsap.fromTo(
        itemsRef.current,
        { opacity: 0, x: -20 },
        { opacity: 1, x: 0, duration: 0.3, stagger: 0.1, ease: "power2.out" }
      );
    }
  }, [products, isOpen]);

  // 计算单价（根据宽度规则）
  const calculateUnitPrice = (width, productName) => {
    const numWidth = parseFloat(width);
    if (isNaN(numWidth) || numWidth <= 0) return 0;

    // 检查是否是1号产品
    const isProduct1 = productName && productName.includes("1.");

    if (isProduct1) {
      // 1号产品特殊规则：宽度<70时为45元/㎡，宽度>=70时为40元/㎡
      if (numWidth < 70) {
        return 45;
      }
      return 40; // 宽度>=70时的默认价格
    }

    // 其他产品根据名称匹配价格
    if (productName) {
      const match = productName.match(/^(\d+)\./);
      if (match) {
        const productNum = parseInt(match[1]);
        const priceMap = {
          2: 80,
          3: 100,
          4: 80,
          6: 40,
          7: 110,
          8: 95,
          9: 90,
          10: 60,
          11: 40,
          12: 80,
          13: 100,
          14: 40,
          15: 80,
          16: 50,
          17: 80,
          18: 80,
          123: 85
        };
        return priceMap[productNum] || 0;
      }
    }

    return 0;
  };

  // 更新产品信息
  const updateProduct = (id, field, value) => {
    setProducts(
      products.map((product) => {
        if (product.id === id) {
          const updatedProduct = { ...product, [field]: value };

          // 如果修改了产品名称、宽度、长度或数量，重新计算价格
          if (field === "productName" || field === "width" || field === "length" || field === "quantity") {
            const width = field === "width" ? value : product.width;
            const length = field === "length" ? value : product.length;
            const quantity = field === "quantity" ? value : product.quantity;
            const productName = field === "productName" ? value : product.productName;

            const unitPrice = calculateUnitPrice(width, productName);
            const numWidth = parseFloat(width) || 0;
            const numLength = parseFloat(length) || 0;
            const numQuantity = parseInt(quantity) || 1;

            const area = (numWidth * numLength) / 10000; // 转换为平方米
            const totalPrice = area * unitPrice * numQuantity;

            updatedProduct.unitPrice = unitPrice;
            updatedProduct.totalPrice = totalPrice;
          }

          return updatedProduct;
        }
        return product;
      })
    );
  };

  // 添加新产品
  const addProduct = () => {
    const newId = products.length > 0 ? Math.max(...products.map(p => p.id)) + 1 : 1;
    setProducts([
      ...products,
      { id: newId, productName: "", width: "", length: "", quantity: 1, unitPrice: 0, totalPrice: 0 }
    ]);

    toast({
      title: "产品已添加",
      status: "success",
      duration: 1500,
      isClosable: true,
      position: "top-right"
    });
  };

  // 删除产品
  const removeProduct = (id) => {
    if (products.length === 1) {
      toast({
        title: "至少保留一个产品",
        status: "warning",
        duration: 2000,
        isClosable: true,
        position: "top-right"
      });
      return;
    }

    setProducts(products.filter((product) => product.id !== id));
    toast({
      title: "产品已删除",
      status: "info",
      duration: 1500,
      isClosable: true,
      position: "top-right"
    });
  };

  // 计算总价
  useEffect(() => {
    const total = products.reduce((sum, product) => sum + (product.totalPrice || 0), 0);
    setGrandTotal(total);
  }, [products]);

  // 复制总价
  const copyGrandTotal = () => {
    const totalText = `总价格：${Math.floor(grandTotal)}元`;
    navigator.clipboard.writeText(totalText).then(() => {
      toast({
        title: "总价已复制",
        description: totalText,
        status: "success",
        duration: 2000,
        isClosable: true,
        position: "top-right"
      });
    }).catch(() => {
      toast({
        title: "复制失败",
        status: "error",
        duration: 2000,
        isClosable: true,
        position: "top-right"
      });
    });
  };

  // 清空所有产品
  const clearAll = () => {
    setProducts([
      { id: 1, productName: "", width: "", length: "", quantity: 1, unitPrice: 0, totalPrice: 0 }
    ]);
    toast({
      title: "已清空所有产品",
      status: "info",
      duration: 2000,
      isClosable: true,
      position: "top-right"
    });
  };

  return (
    <Modal isOpen={isOpen} onClose={onClose} size="6xl" scrollBehavior="inside">
      <ModalOverlay />
      <ModalContent ref={containerRef}>
        <ModalHeader>
          <HStack spacing={3}>
            <FaCalculator color="#FFA500" size={24} />
            <Text>多产品价格计算器</Text>
            <Badge colorScheme="purple" fontSize="sm">
              批量计算
            </Badge>
          </HStack>
        </ModalHeader>
        <ModalCloseButton />

        <ModalBody>
          <VStack spacing={6} align="stretch">
            <Box
              overflowX="auto"
              border="1px solid"
              borderColor="gray.200"
              borderRadius="8px"
            >
              <Table size="sm" variant="simple">
                <Thead bg="gray.50">
                  <Tr>
                    <Th textAlign="center" width="30%">产品名称</Th>
                    <Th textAlign="center" width="12%">宽度(cm)</Th>
                    <Th textAlign="center" width="12%">长度(cm)</Th>
                    <Th textAlign="center" width="10%">数量</Th>
                    <Th textAlign="center" width="12%">单价(元/㎡)</Th>
                    <Th textAlign="center" width="14%">小计(元)</Th>
                    <Th textAlign="center" width="10%">操作</Th>
                  </Tr>
                </Thead>
                <Tbody>
                  {products.map((product, index) => (
                    <Tr 
                      key={product.id} 
                      ref={el => itemsRef.current[index] = el}
                      _hover={{ bg: "orange.50" }}
                    >
                      <Td>
                        <Select
                          placeholder="选择产品"
                          value={product.productName}
                          onChange={(e) => updateProduct(product.id, "productName", e.target.value)}
                          size="sm"
                          onFocus={(e) => inputFocusAnimation(e.currentTarget, true)}
                          onBlur={(e) => inputFocusAnimation(e.currentTarget, false)}
                        >
                          {productList.map((p, i) => (
                            <option key={i} value={p.name}>
                              {p.name}
                            </option>
                          ))}
                        </Select>
                      </Td>
                      <Td>
                        <Input
                          placeholder="宽度"
                          value={product.width}
                          onChange={(e) => updateProduct(product.id, "width", e.target.value)}
                          type="number"
                          size="sm"
                          textAlign="center"
                          onFocus={(e) => inputFocusAnimation(e.currentTarget, true)}
                          onBlur={(e) => inputFocusAnimation(e.currentTarget, false)}
                        />
                      </Td>
                      <Td>
                        <Input
                          placeholder="长度"
                          value={product.length}
                          onChange={(e) => updateProduct(product.id, "length", e.target.value)}
                          type="number"
                          size="sm"
                          textAlign="center"
                          onFocus={(e) => inputFocusAnimation(e.currentTarget, true)}
                          onBlur={(e) => inputFocusAnimation(e.currentTarget, false)}
                        />
                      </Td>
                      <Td>
                        <Input
                          placeholder="数量"
                          value={product.quantity}
                          onChange={(e) => updateProduct(product.id, "quantity", e.target.value)}
                          type="number"
                          min="1"
                          size="sm"
                          textAlign="center"
                          onFocus={(e) => inputFocusAnimation(e.currentTarget, true)}
                          onBlur={(e) => inputFocusAnimation(e.currentTarget, false)}
                        />
                      </Td>
                      <Td textAlign="center">
                        <HStack spacing={1} justify="center">
                          <Text fontWeight="600">¥{product.unitPrice}</Text>
                          {product.unitPrice === 45 && product.productName.includes("1.") && parseFloat(product.width) < 70 && (
                            <Badge colorScheme="purple" fontSize="xs">&lt;70cm</Badge>
                          )}
                        </HStack>
                      </Td>
                      <Td textAlign="center">
                        <Text fontWeight="700" color="red.500">
                          ¥{product.totalPrice > 0 ? product.totalPrice.toFixed(2) : "0.00"}
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
                          onMouseEnter={(e) => buttonHoverAnimation(e.currentTarget, true)}
                          onMouseLeave={(e) => buttonHoverAnimation(e.currentTarget, false)}
                        />
                      </Td>
                    </Tr>
                  ))}
                </Tbody>
              </Table>
            </Box>

            <Flex justify="space-between" align="center">
              <Button
                leftIcon={<FaPlus />}
                colorScheme="blue"
                size="md"
                onClick={addProduct}
                onMouseEnter={(e) => buttonHoverAnimation(e.currentTarget, true)}
                onMouseLeave={(e) => buttonHoverAnimation(e.currentTarget, false)}
              >
                添加产品
              </Button>

              <Button
                colorScheme="gray"
                variant="outline"
                size="md"
                onClick={clearAll}
              >
                清空
              </Button>
            </Flex>

            <Divider />

            <Box
              p={5}
              bg="orange.50"
              borderRadius="8px"
              border="2px solid"
              borderColor="orange.300"
            >
              <Flex justify="space-between" align="center">
                <VStack align="start" spacing={1}>
                  <Text fontSize="sm" color="gray.600">
                    总计产品数量: {products.length} 个
                  </Text>
                  <Text fontSize="sm" color="gray.600">
                    总计数量: {products.reduce((sum, p) => sum + (parseInt(p.quantity) || 0), 0)} 件
                  </Text>
                </VStack>
                <HStack spacing={4}>
                  <VStack align="end" spacing={0}>
                    <Text fontSize="sm" color="gray.600">
                      总价格
                    </Text>
                    <Text fontSize="3xl" fontWeight="700" color="red.500">
                      ¥{grandTotal.toFixed(2)}
                    </Text>
                  </VStack>
                  <IconButton
                    icon={<FaCopy />}
                    colorScheme="orange"
                    size="md"
                    onClick={copyGrandTotal}
                    aria-label="复制总价"
                    isDisabled={grandTotal === 0}
                    onMouseEnter={(e) => buttonHoverAnimation(e.currentTarget, true)}
                    onMouseLeave={(e) => buttonHoverAnimation(e.currentTarget, false)}
                  />
                </HStack>
              </Flex>
            </Box>

            <Box
              p={3}
              bg="blue.50"
              borderRadius="8px"
              border="1px solid"
              borderColor="blue.200"
            >
              <Text fontSize="xs" color="blue.700" fontWeight="500">
                💡 使用提示
              </Text>
              <Text fontSize="xs" color="gray.600" mt={1}>
                1. 选择产品后自动计算单价（1号产品：宽度&lt;70cm为45元/㎡，宽度≥70cm为40元/㎡）
              </Text>
              <Text fontSize="xs" color="gray.600">
                2. 输入宽度、长度和数量后自动计算小计和总价
              </Text>
              <Text fontSize="xs" color="gray.600">
                3. 点击复制按钮可快速复制总价格
              </Text>
            </Box>
          </VStack>
        </ModalBody>

        <ModalFooter>
          <Button colorScheme="gray" mr={3} onClick={onClose}>
            关闭
          </Button>
        </ModalFooter>
      </ModalContent>
    </Modal>
  );
};

export default MultiProductPriceCalculator;