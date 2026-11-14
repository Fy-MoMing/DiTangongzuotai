import React, { useState, useEffect, useRef } from "react";
import {
  Box,
  Input,
  Text,
  Flex,
  Heading,
  VStack,
  HStack,
  Badge,
  Divider,
  useColorModeValue
} from "@chakra-ui/react";
import { FaCalculator } from "react-icons/fa";
import gsap from "gsap";
import {
  inputFocusAnimation,
  cardFadeInAnimation,
  numberCountAnimation
} from "../styles/animations";

const PriceCalculator = () => {
  const [size, setSize] = useState("");
  const [prices, setPrices] = useState({
    product1: 0,
    product2: 0,
    product3: 0,
    product4: 0,
  });

  const inputRef = useRef(null);
  const cardsRef = useRef([]);
  const containerRef = useRef(null);

  const bgColor = useColorModeValue("white", "gray.800");
  const borderColor = useColorModeValue("gray.200", "gray.700");
  const textColor = useColorModeValue("gray.700", "white");
  const subtextColor = useColorModeValue("gray.600", "gray.400");

  useEffect(() => {
    if (containerRef.current) {
      cardFadeInAnimation(containerRef.current, 0.2);
    }
  }, []);

  useEffect(() => {
    if (size) {
      const parsedSize = parseFloat(size);
      if (!isNaN(parsedSize) && parsedSize > 0) {
        const newPrices = {
          product1: parsedSize * 10,
          product2: parsedSize * 15,
          product3: parsedSize * 20,
          product4: parsedSize * 25,
        };
        setPrices(newPrices);

        cardsRef.current.forEach((card, index) => {
          if (card) {
            const priceElement = card.querySelector(".price-value");
            if (priceElement) {
              numberCountAnimation(
                priceElement,
                0,
                newPrices[`product${index + 1}`],
                0.5
              );
            }
          }
        });
      } else {
        setPrices({
          product1: 0,
          product2: 0,
          product3: 0,
          product4: 0,
        });
      }
    } else {
      setPrices({
        product1: 0,
        product2: 0,
        product3: 0,
        product4: 0,
      });
    }
  }, [size]);

  const handleInputChange = (e) => {
    const value = e.target.value;
    if (value === "" || (parseFloat(value) >= 0 && !isNaN(parseFloat(value)))) {
      setSize(value);
    }
  };

  const productConfigs = [
    { name: "1号产品", color: "orange", coefficient: 10 },
    { name: "2号产品", color: "blue", coefficient: 15 },
    { name: "3号产品", color: "purple", coefficient: 20 },
    { name: "4号产品", color: "pink", coefficient: 25 },
  ];

  return (
    <Box ref={containerRef} p={6}>
      <VStack spacing={6} align="stretch">
        <HStack spacing={3} mb={2}>
          <FaCalculator color="#FFA500" size={24} />
          <Heading
            as="h2"
            size="md"
            fontFamily="'ZCOOL XiaoWei', sans-serif"
            color={textColor}
          >
            价格自动计算器
          </Heading>
          <Badge colorScheme="orange" fontSize="xs">
            实时计算
          </Badge>
        </HStack>

        <Box>
          <Text
            fontSize="14px"
            fontWeight="500"
            mb={2}
            color={subtextColor}
          >
            输入尺寸（单位：cm）
          </Text>
          <Input
            ref={inputRef}
            type="number"
            value={size}
            onChange={handleInputChange}
            onFocus={(e) => inputFocusAnimation(e.currentTarget, true)}
            onBlur={(e) => inputFocusAnimation(e.currentTarget, false)}
            placeholder="请输入尺寸，如：100"
            bg="gray.50"
            border="1px solid"
            borderColor={borderColor}
            _hover={{ borderColor: "orange.300" }}
            _focus={{
              borderColor: "orange.500",
              boxShadow: "0 0 0 1px #FFA500",
              bg: "white",
            }}
            min="0"
            step="0.01"
            fontSize="15px"
          />
          <Text fontSize="13px" color={subtextColor} mt={2}>
            输入尺寸后自动计算各产品价格
          </Text>
        </Box>

        <Divider />

        <Box>
          <Text fontSize="15px" fontWeight="600" mb={4} color={textColor}>
            计算结果
          </Text>
          <Flex direction="row" wrap="wrap" gap={4}>
            {productConfigs.map((config, index) => (
              <Box
                key={index}
                ref={(el) => (cardsRef.current[index] = el)}
                p={5}
                border="1px"
                borderColor={borderColor}
                borderRadius="md"
                boxShadow="sm"
                flex="1"
                minW="140px"
                bg={bgColor}
                transition="all 0.2s"
                _hover={{
                  transform: "translateY(-4px)",
                  boxShadow: "md",
                  borderColor: `${config.color}.300`,
                }}
              >
                <VStack align="stretch" spacing={2}>
                  <HStack justify="space-between">
                    <Text fontSize="sm" color={subtextColor} fontWeight="500">
                      {config.name}
                    </Text>
                    <Badge colorScheme={config.color} fontSize="xs">
                      ×{config.coefficient}
                    </Badge>
                  </HStack>
                  <Text
                    className="price-value"
                    fontSize="2xl"
                    fontWeight="bold"
                    color={`${config.color}.500`}
                  >
                    ¥{prices[`product${index + 1}`].toFixed(2)}
                  </Text>
                  <Text fontSize="xs" color={subtextColor}>
                    单价: ¥{config.coefficient}/cm
                  </Text>
                </VStack>
              </Box>
            ))}
          </Flex>
        </Box>

        {!size && (
          <Box
            py={8}
            textAlign="center"
            color="gray.400"
            border="1px dashed"
            borderColor="gray.300"
            borderRadius="md"
          >
            <Text fontSize="md" fontWeight="500" mb={2}>
              请输入尺寸开始计算
            </Text>
            <Text fontSize="sm">
              输入尺寸后将自动显示1-4号产品价格
            </Text>
          </Box>
        )}
      </VStack>
    </Box>
  );
};

export default PriceCalculator;