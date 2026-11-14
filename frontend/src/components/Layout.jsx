import React from "react";
import {
  Box,
  Flex,
  Heading,
  Text,
  VStack,
  Divider,
  Table,
  Thead,
  Tbody,
  Tr,
  Th,
  Td,
  Badge,
  HStack,
  useColorModeValue
} from "@chakra-ui/react";
import { FaWeight, FaCalculator } from "react-icons/fa";

const Layout = ({ children, selectedProduct, totalPrice, totalArea, dimensionsValue }) => {
  const bgColor = useColorModeValue("white", "gray.800");
  const borderColor = useColorModeValue("gray.200", "gray.700");
  const textColor = useColorModeValue("gray.700", "white");
  const subtextColor = useColorModeValue("gray.600", "gray.400");

  // 模拟价格数据（根据选中产品动态显示）
  const prices = {
    "1号": "¥40/㎡",
    "2号": "¥80/㎡",
    "3号": "¥100/㎡",
    "4号": "¥80/㎡"
  };

  // 重量数据
  const weights = {
    "1号": "2.2公斤/平",
    "2号": "2.3公斤和3公斤/平",
    "3号": "3公斤/平"
  };

  // 计算实际重量（基于面积）
  const calculateWeight = (productNum, area) => {
    if (!area || area <= 0) return "-";
    
    const weightMap = {
      "1号": 2.2,
      "2号": 2.3,
      "3号": 3.0
    };
    
    const weight = weightMap[productNum];
    if (!weight) return "-";
    
    return `${(weight * area).toFixed(2)}公斤`;
  };

  return (
    <Flex direction="row" minHeight="100vh">
      {/* 主内容区域 */}
      <Box flex={1} p={4}>
        {children}
      </Box>

      {/* 右侧板块 */}
      <Box
        width="300px"
        p={6}
        borderLeft="1px"
        borderColor={borderColor}
        bg={bgColor}
        position="sticky"
        top="160px"
        alignSelf="flex-start"
        maxHeight="calc(100vh - 180px)"
        overflowY="auto"
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
        <VStack spacing={6} align="stretch">
          {/* 价格结果区域 */}
          <Box>
            <HStack spacing={3} mb={4}>
              <FaCalculator color="#FFA500" size={20} />
              <Heading size="md" fontFamily="'ZCOOL XiaoWei', sans-serif" color={textColor}>
                价格结果
              </Heading>
              <Badge colorScheme="orange" fontSize="xs">
                实时显示
              </Badge>
            </HStack>
            <Divider mb={4} />
            
            {selectedProduct ? (
              <VStack spacing={3} align="stretch">
                <Box
                  p={4}
                  bg="orange.50"
                  borderRadius="8px"
                  border="1px solid"
                  borderColor="orange.200"
                >
                  <Text fontSize="sm" color={subtextColor} mb={1}>
                    当前选择
                  </Text>
                  <Text fontSize="md" fontWeight="600" color={textColor} noOfLines={2}>
                    {selectedProduct.name}
                  </Text>
                  <HStack spacing={2} mt={2}>
                    <Badge colorScheme="green" fontSize="xs">
                      {selectedProduct.price}元/㎡
                    </Badge>
                    {selectedProduct.maxWidth && (
                      <Badge colorScheme="orange" fontSize="xs">
                        最大{selectedProduct.maxWidth}cm
                      </Badge>
                    )}
                  </HStack>
                </Box>
                
                {totalArea > 0 && (
                  <Box
                    p={4}
                    bg="gray.50"
                    borderRadius="8px"
                    border="1px solid"
                    borderColor={borderColor}
                  >
                    <HStack justify="space-between" mb={2}>
                      <Text fontSize="sm" color={subtextColor}>
                        总面积
                      </Text>
                      <Text fontSize="md" fontWeight="600" color={textColor}>
                        {totalArea.toFixed(2)} ㎡
                      </Text>
                    </HStack>
                    <Divider my={2} />
                    <HStack justify="space-between">
                      <Text fontSize="sm" color={subtextColor}>
                        预估总价
                      </Text>
                      <Text fontSize="xl" fontWeight="700" color="red.500">
                        ¥{totalPrice ? totalPrice.toFixed(2) : "0.00"}
                      </Text>
                    </HStack>
                  </Box>
                )}
              </VStack>
            ) : (
              <Box
                py={8}
                textAlign="center"
                color="gray.400"
                border="1px dashed"
                borderColor="gray.300"
                borderRadius="8px"
              >
                <Text fontSize="sm">
                  请在左侧选择产品
                </Text>
              </Box>
            )}
          </Box>

          {/* 重量计算区域 */}
          <Box>
            <HStack spacing={3} mb={4}>
              <FaWeight color="#6A5ACD" size={20} />
              <Heading size="md" fontFamily="'ZCOOL XiaoWei', sans-serif" color={textColor}>
                重量计算
              </Heading>
              <Badge colorScheme="purple" fontSize="xs">
                参考数据
              </Badge>
            </HStack>
            <Divider mb={4} />
            
            <Box
              overflowX="auto"
              border="1px solid"
              borderColor={borderColor}
              borderRadius="8px"
            >
              <Table variant="simple" size="sm">
                <Thead bg="purple.50">
                  <Tr>
                    <Th textAlign="center" color="purple.700">型号</Th>
                    <Th textAlign="center" color="purple.700">单位重量</Th>
                  </Tr>
                </Thead>
                <Tbody>
                  {Object.entries(weights).map(([key, value]) => (
                    <Tr key={key} _hover={{ bg: "purple.50" }}>
                      <Td textAlign="center" fontWeight="600" color={textColor}>
                        {key}
                      </Td>
                      <Td textAlign="center" color={subtextColor}>
                        {value}
                      </Td>
                    </Tr>
                  ))}
                </Tbody>
              </Table>
            </Box>

            {/* 实际重量计算（如果有选中产品和面积） */}
            {selectedProduct && totalArea > 0 && (
              <Box
                mt={4}
                p={4}
                bg="purple.50"
                borderRadius="8px"
                border="1px solid"
                borderColor="purple.200"
              >
                <Text fontSize="sm" color={subtextColor} mb={2}>
                  预估总重量
                </Text>
                <HStack justify="space-between">
                  <Text fontSize="sm" color="purple.700">
                    基于当前面积 {totalArea.toFixed(2)} ㎡
                  </Text>
                  <Text fontSize="lg" fontWeight="700" color="purple.600">
                    {calculateWeight(
                      selectedProduct.name.split(".")[0] + "号",
                      totalArea
                    )}
                  </Text>
                </HStack>
                <Text fontSize="xs" color="gray.500" mt={2}>
                  * 实际重量可能因材料密度而有所差异
                </Text>
              </Box>
            )}
          </Box>

          {/* 说明提示 */}
          <Box
            p={3}
            bg="blue.50"
            borderRadius="8px"
            border="1px solid"
            borderColor="blue.200"
          >
            <Text fontSize="xs" color="blue.700" fontWeight="500">
              💡 提示
            </Text>
            <Text fontSize="xs" color="gray.600" mt={1}>
              重量数据为参考值，具体以实际产品为准。2号产品有两种密度可选（2.3公斤/平和3公斤/平）。
            </Text>
          </Box>
        </VStack>
      </Box>
    </Flex>
  );
};

export default Layout;