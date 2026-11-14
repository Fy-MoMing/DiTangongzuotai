import React, { useState, useEffect, useRef } from "react";
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
} from "@chakra-ui/react";
import { SearchIcon } from "@chakra-ui/icons";
import { FaTag, FaTimes } from "react-icons/fa";
import gsap from "gsap";
import {
  inputFocusAnimation,
  dropdownAnimation,
  buttonHoverAnimation,
  listItemSlideInAnimation
} from "../styles/animations";

const ProductSearch = ({ products, onSelectProduct, selectedProduct, customPrice, onCustomPriceChange, dimensionsValue }) => {
  const [searchTerm, setSearchTerm] = useState("");
  const [showResults, setShowResults] = useState(false);
  const [filteredProducts, setFilteredProducts] = useState([]);
  const [selectedQuickBtn, setSelectedQuickBtn] = useState(null);
  const [priceInput, setPriceInput] = useState("");
  const [showCopyOptions, setShowCopyOptions] = useState(null);
  const [selectedType, setSelectedType] = useState("");
  const [selectedColor, setSelectedColor] = useState("");
  const [selectedBorder, setSelectedBorder] = useState("无黑边");

  const toast = useToast();
  const inputRef = useRef(null);
  const resultsRef = useRef(null);
  const quickBtnsRef = useRef([]);

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
    if (resultsRef.current) {
      dropdownAnimation(resultsRef.current, showResults);
    }
  }, [showResults]);

  useEffect(() => {
    if (showResults && filteredProducts.length > 0) {
      const resultItems = resultsRef.current?.querySelectorAll(".result-item");
      if (resultItems && resultItems.length > 0) {
        listItemSlideInAnimation(Array.from(resultItems));
      }
    }
  }, [showResults, filteredProducts]);

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
      title: "产品已选择",
      description: product.name,
      status: "success",
      duration: 2000,
      isClosable: true,
      position: "top-right"
    });
  };

  const handleQuickSelect = (product, index) => {
    if (!product.custom) {
      toast({
        title: "该产品不支持定制",
        status: "warning",
        duration: 2000,
        isClosable: true,
        position: "top-right"
      });
      return;
    }

    setSelectedQuickBtn(index);
    handleSelectProduct(product);
    
    if (index === 0 || index === 1 || index === 2 || index === 3) {
      setShowCopyOptions(index);
      if (index === 0) {
        setSelectedType("条纹");
        setSelectedColor("灰色");
        setSelectedBorder("无黑边");
      } else if (index === 1) {
        setSelectedType("菱形");
        setSelectedColor("深灰色");
        setSelectedBorder("无黑边");
      } else if (index === 2) {
        setSelectedType("硬丝");
        setSelectedColor("灰色");
        setSelectedBorder("无黑边");
      } else if (index === 3) {
        setSelectedType("平面");
        setSelectedColor("深红色");
        setSelectedBorder("无黑边");
      }
    } else {
      setShowCopyOptions(null);
    }
  };

  const handleClearSearch = () => {
    setSearchTerm("");
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
    } else if (value === "") {
      setPriceInput("");
      onCustomPriceChange && onCustomPriceChange(0);
    }
  };

  const handleClearPrice = () => {
    setPriceInput("");
    if (onCustomPriceChange) {
      onCustomPriceChange(0);
    }
    
    if (document.activeElement instanceof HTMLElement) {
      document.activeElement.blur();
    }
    
    toast({
      title: "已清除自定义价格",
      description: "将使用产品默认价格",
      status: "info",
      duration: 2000,
      isClosable: true,
      position: "top-right"
    });
  };

  const handleCopyFormat = () => {
    if (!selectedColor) {
      toast({
        title: "请选择颜色",
        status: "warning",
        duration: 2000,
        isClosable: true,
        position: "top-right"
      });
      return;
    }
    
    if (!selectedBorder) {
      toast({
        title: "请选择黑边",
        status: "warning",
        duration: 2000,
        isClosable: true,
        position: "top-right"
      });
      return;
    }
    
    if (!selectedType) {
      toast({
        title: "请选择类型",
        status: "warning",
        duration: 2000,
        isClosable: true,
        position: "top-right"
      });
      return;
    }
    
    if (!dimensionsValue || dimensionsValue.trim() === "") {
      toast({
        title: "请先在右侧输入尺寸",
        description: "请在右侧尺寸计算器中填写尺寸（如：100*50）",
        status: "warning",
        duration: 2000,
        isClosable: true,
        position: "top-right"
      });
      return;
    }
    
    const allDimensions = dimensionsValue
      .split("\n")
      .map(d => d.trim())
      .filter(d => d)
      .join(", ");
    
    const copyText = `${selectedType}${selectedColor}${allDimensions}${selectedBorder}`;
    
    navigator.clipboard.writeText(copyText).then(() => {
      toast({
        title: "复制成功",
        description: copyText,
        status: "success",
        duration: 3000,
        isClosable: true,
        position: "top-right"
      });
    }).catch(() => {
      toast({
        title: "复制失败",
        description: "请手动复制",
        status: "error",
        duration: 2000,
        isClosable: true,
        position: "top-right"
      });
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
    document.addEventListener("mousedown", handleClickOutside);
    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
    };
  }, []);

  useEffect(() => {
    const handleKeyPress = (e) => {
      if (e.target.tagName === "INPUT" || e.target.tagName === "TEXTAREA") {
        return;
      }
      
      const key = e.key;
      if (/^[1-8]$/.test(key)) {
        const displayIndex = parseInt(key, 10) - 1;
        const allowedIndices = [0, 1, 2, 3, 6, 7, 13, 15];
        
        if (displayIndex < allowedIndices.length) {
          const actualIndex = allowedIndices[displayIndex];
          const product = products[actualIndex];
          
          if (product) {
            handleQuickSelect(product, actualIndex);
          }
        }
      }
    };
    
    window.addEventListener("keydown", handleKeyPress);
    return () => {
      window.removeEventListener("keydown", handleKeyPress);
    };
  }, [products]);

  return (
    <VStack spacing={6} align="stretch">
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
              onFocus={(e) => inputFocusAnimation(e.currentTarget, true)}
              onBlur={(e) => inputFocusAnimation(e.currentTarget, false)}
              bg="gray.50"
              border="1px solid"
              borderColor="gray.200"
              _hover={{ borderColor: "orange.300" }}
              _focus={{
                borderColor: "orange.500",
                boxShadow: "0 0 0 1px #FFA500"
              }}
              pr={searchTerm ? "40px" : "12px"}
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
                "&::-webkit-scrollbar": {
                  width: "6px"
                },
                "&::-webkit-scrollbar-track": {
                  background: "#f1f1f1"
                },
                "&::-webkit-scrollbar-thumb": {
                  background: "#FFA500",
                  borderRadius: "3px"
                }
              }}
            >
              {filteredProducts.map((product, index) => (
                <Flex
                  key={index}
                  className="result-item"
                  p={3}
                  cursor="pointer"
                  borderBottom="1px solid"
                  borderColor="gray.100"
                  _last={{ borderBottom: "none" }}
                  _hover={{ bg: "orange.50" }}
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
              onFocus={(e) => inputFocusAnimation(e.currentTarget, true)}
              onBlur={(e) => inputFocusAnimation(e.currentTarget, false)}
              bg="gray.50"
              border="1px solid"
              borderColor="gray.200"
              type="number"
              min="0"
              max="9999"
              step="0.01"
              _hover={{ borderColor: "orange.300" }}
              _focus={{
                borderColor: "orange.500",
                boxShadow: "0 0 0 1px #FFA500",
                bg: "white"
              }}
              pr={priceInput ? "40px" : "12px"}
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
              0: "条纹",
              1: "菱形方格",
              2: "硬丝",
              3: "平面",
              6: "流星毯",
              7: "丝圈",
              13: "宽条纹",
              15: "硅藻泥"
            };
            
            if (!allowedIndices.includes(index)) {
              return null;
            }
            
            return (
              <Button
                key={index}
                ref={el => quickBtnsRef.current[index] = el}
                size="sm"
                variant={selectedQuickBtn === index ? "solid" : "outline"}
                colorScheme={selectedQuickBtn === index ? "orange" : "gray"}
                onClick={() => handleQuickSelect(product, index)}
                isDisabled={!product.custom}
                onMouseEnter={(e) => !product.custom || buttonHoverAnimation(e.currentTarget, true)}
                onMouseLeave={(e) => !product.custom || buttonHoverAnimation(e.currentTarget, false)}
                _disabled={{
                  bg: "gray.100",
                  color: "gray.400",
                  cursor: "not-allowed"
                }}
              >
                {labelMap[index]}
              </Button>
            );
          })}
        </Flex>
        <Text fontSize="13px" color="gray.500" mt={2} textAlign="center">
          点击按钮或按数字键1-8快速选择产品
        </Text>
      </Box>

      {showCopyOptions !== null && (showCopyOptions === 0 || showCopyOptions === 1 || showCopyOptions === 2 || showCopyOptions === 3) && (
        <Box
          pt={4}
          borderTop="1px dashed"
          borderColor="gray.200"
        >
          <Text fontSize="15px" fontWeight="500" mb={3} color="gray.700">
            快速复制样式文本
          </Text>
          
          <VStack spacing={4} align="stretch">
            <Box>
              <Text fontSize="13px" fontWeight="500" mb={2} color="gray.600">
                类型：
              </Text>
              <Flex flexWrap="wrap" gap={2}>
                {showCopyOptions === 0 && (
                  <Button
                    size="sm"
                    variant={selectedType === "条纹" ? "solid" : "outline"}
                    colorScheme={selectedType === "条纹" ? "purple" : "gray"}
                    onClick={() => setSelectedType("条纹")}
                  >
                    条纹
                  </Button>
                )}
                {showCopyOptions === 1 && (
                  <>
                    <Button
                      size="sm"
                      variant={selectedType === "菱形" ? "solid" : "outline"}
                      colorScheme={selectedType === "菱形" ? "purple" : "gray"}
                      onClick={() => setSelectedType("菱形")}
                    >
                      菱形
                    </Button>
                    <Button
                      size="sm"
                      variant={selectedType === "方格" ? "solid" : "outline"}
                      colorScheme={selectedType === "方格" ? "purple" : "gray"}
                      onClick={() => setSelectedType("方格")}
                    >
                      方格
                    </Button>
                  </>
                )}
                {showCopyOptions === 2 && (
                  <Button
                    size="sm"
                    variant={selectedType === "硬丝" ? "solid" : "outline"}
                    colorScheme={selectedType === "硬丝" ? "purple" : "gray"}
                    onClick={() => setSelectedType("硬丝")}
                  >
                    硬丝
                  </Button>
                )}
                {showCopyOptions === 3 && (
                  <Button
                    size="sm"
                    variant={selectedType === "平面" ? "solid" : "outline"}
                    colorScheme={selectedType === "平面" ? "purple" : "gray"}
                    onClick={() => setSelectedType("平面")}
                  >
                    平面
                  </Button>
                )}
              </Flex>
            </Box>

            <Box>
              <Text fontSize="13px" fontWeight="500" mb={2} color="gray.600">
                颜色：
              </Text>
              <Flex flexWrap="wrap" gap={2}>
                {showCopyOptions === 0 && (
                  <>
                    <Button
                      size="sm"
                      variant={selectedColor === "灰色" ? "solid" : "outline"}
                      colorScheme={selectedColor === "灰色" ? "purple" : "gray"}
                      onClick={() => setSelectedColor("灰色")}
                    >
                      灰色
                    </Button>
                    <Button
                      size="sm"
                      variant={selectedColor === "深红色" ? "solid" : "outline"}
                      colorScheme={selectedColor === "深红色" ? "purple" : "gray"}
                      onClick={() => setSelectedColor("深红色")}
                    >
                      深红色
                    </Button>
                    <Button
                      size="sm"
                      variant={selectedColor === "大红色" ? "solid" : "outline"}
                      colorScheme={selectedColor === "大红色" ? "purple" : "gray"}
                      onClick={() => setSelectedColor("大红色")}
                    >
                      大红色
                    </Button>
                  </>
                )}
                {showCopyOptions === 1 && (
                  <>
                    <Button
                      size="sm"
                      variant={selectedColor === "深灰色" ? "solid" : "outline"}
                      colorScheme={selectedColor === "深灰色" ? "purple" : "gray"}
                      onClick={() => setSelectedColor("深灰色")}
                    >
                      深灰色
                    </Button>
                    <Button
                      size="sm"
                      variant={selectedColor === "深红色" ? "solid" : "outline"}
                      colorScheme={selectedColor === "深红色" ? "purple" : "gray"}
                      onClick={() => setSelectedColor("深红色")}
                    >
                      深红色
                    </Button>
                    <Button
                      size="sm"
                      variant={selectedColor === "大红色" ? "solid" : "outline"}
                      colorScheme={selectedColor === "大红色" ? "purple" : "gray"}
                      onClick={() => setSelectedColor("大红色")}
                    >
                      大红色
                    </Button>
                    <Button
                      size="sm"
                      variant={selectedColor === "咖色" ? "solid" : "outline"}
                      colorScheme={selectedColor === "咖色" ? "purple" : "gray"}
                      onClick={() => setSelectedColor("咖色")}
                    >
                      咖色
                    </Button>
                  </>
                )}
                {showCopyOptions === 2 && (
                  <>
                    <Button
                      size="sm"
                      variant={selectedColor === "灰色" ? "solid" : "outline"}
                      colorScheme={selectedColor === "灰色" ? "purple" : "gray"}
                      onClick={() => setSelectedColor("灰色")}
                    >
                      灰色
                    </Button>
                    <Button
                      size="sm"
                      variant={selectedColor === "深红色" ? "solid" : "outline"}
                      colorScheme={selectedColor === "深红色" ? "purple" : "gray"}
                      onClick={() => setSelectedColor("深红色")}
                    >
                      深红色
                    </Button>
                  </>
                )}
                {showCopyOptions === 3 && (
                  <>
                    <Button
                      size="sm"
                      variant={selectedColor === "深红色" ? "solid" : "outline"}
                      colorScheme={selectedColor === "深红色" ? "purple" : "gray"}
                      onClick={() => setSelectedColor("深红色")}
                    >
                      深红色
                    </Button>
                    <Button
                      size="sm"
                      variant={selectedColor === "灰色" ? "solid" : "outline"}
                      colorScheme={selectedColor === "灰色" ? "purple" : "gray"}
                      onClick={() => setSelectedColor("灰色")}
                    >
                      灰色
                    </Button>
                  </>
                )}
              </Flex>
            </Box>

            <Box>
              <Text fontSize="13px" fontWeight="500" mb={2} color="gray.600">
                尺寸：
              </Text>
            <Box
              p={3}
              bg="blue.50"
              borderRadius="8px"
              border="1px solid"
              borderColor="blue.200"
            >
              <Text fontSize="13px" color="blue.700" fontWeight="500">
                💡 使用右侧尺寸计算器的值
              </Text>
              <Text fontSize="12px" color="gray.600" mt={1}>
                {dimensionsValue && dimensionsValue.trim() 
                  ? `当前尺寸: ${dimensionsValue.split("\n").map(d => d.trim()).filter(d => d).join(", ")}` 
                  : "请在右侧输入尺寸"}
              </Text>
            </Box>
            </Box>

            <Box>
              <Text fontSize="13px" fontWeight="500" mb={2} color="gray.600">
                黑边：
              </Text>
              <Flex flexWrap="wrap" gap={2}>
                <Button
                  size="sm"
                  variant={selectedBorder === "无黑边" ? "solid" : "outline"}
                  colorScheme={selectedBorder === "无黑边" ? "purple" : "gray"}
                  onClick={() => setSelectedBorder("无黑边")}
                >
                  无黑边
                </Button>
                <Button
                  size="sm"
                  variant={selectedBorder === "四周黑边" ? "solid" : "outline"}
                  colorScheme={selectedBorder === "四周黑边" ? "purple" : "gray"}
                  onClick={() => setSelectedBorder("四周黑边")}
                >
                  四周黑边
                </Button>
              </Flex>
            </Box>

            <Button
              colorScheme="orange"
              size="md"
              onClick={handleCopyFormat}
              w="100%"
            >
              复制文本
            </Button>
          </VStack>
        </Box>
      )}
    </VStack>
  );
};

export default ProductSearch;