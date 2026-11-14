import React, { useState, useEffect } from "react";
import {
  Box,
  Table,
  Thead,
  Tbody,
  Tr,
  Th,
  Td,
  Text,
  VStack,
  HStack,
  Badge,
  Divider,
  Input,
  Select,
  Spinner,
  Flex,
  useToast
} from "@chakra-ui/react";
import { FaTable, FaSearch } from "react-icons/fa";

const SizePriceTable = () => {
  const [sizePriceData, setSizePriceData] = useState([]);
  const [filteredData, setFilteredData] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState("");
  const [selectedProduct, setSelectedProduct] = useState("all");
  const toast = useToast();

  useEffect(() => {
    const loadData = () => {
      try {
        const data = [
          { product: "条纹", size: "60*90", price: 18.8 },
          { product: "条纹", size: "80*120", price: 28.8 },
          { product: "条纹", size: "120*150", price: 68 },
          { product: "条纹", size: "120*180", price: 78 },
          { product: "条纹", size: "90*150", price: 49 },
          { product: "条纹", size: "120*200", price: 88 },
          { product: "条纹", size: "60*120", price: 25.8 },
          { product: "条纹", size: "100*120", price: 42.8 },
          { product: "条纹", size: "90*200", price: 68 },
          { product: "条纹", size: "50*80", price: 13.9 },
          { product: "菱形方格", size: "60*90", price: 39 },
          { product: "菱形方格", size: "80*120", price: 69 },
          { product: "菱形方格", size: "90*150", price: 98 },
          { product: "菱形方格", size: "120*150", price: 135 },
          { product: "菱形方格", size: "120*180", price: 158 },
          { product: "菱形方格", size: "120*200", price: 178 },
          { product: "菱形方格", size: "60*120", price: 54 },
          { product: "菱形方格", size: "90*200", price: 135 },
          { product: "菱形方格", size: "50*80", price: 29 },
          { product: "菱形方格", size: "100*120", price: 95 },
          { product: "菱形方格", size: "90*180", price: 125 },
          { product: "菱形方格", size: "120*300", price: 268 },
          { product: "菱形方格", size: "160*200", price: 238 },
          { product: "菱形方格", size: "160*240", price: 288 },
          { product: "菱形方格", size: "180*200", price: 268 },
          { product: "菱形方格", size: "180*240", price: 318 },
          { product: "菱形方格", size: "180*300", price: 398 },
          { product: "菱形方格", size: "200*300", price: 438 },
          { product: "菱形方格", size: "90*100", price: 65 },
          { product: "菱形方格", size: "120*120", price: 118 },
          { product: "菱形方格", size: "120*240", price: 215 },
          { product: "菱形方格", size: "160*300", price: 358 },
          { product: "菱形方格", size: "80*100", price: 65 },
          { product: "菱形方格", size: "80*130", price: 75 },
          { product: "菱形方格", size: "80*160", price: 98 },
          { product: "菱形方格", size: "90*120", price: 78 },
          { product: "菱形方格", size: "120*160", price: 145 },
          { product: "硬丝", size: "60*90", price: 48 },
          { product: "硬丝", size: "80*120", price: 75 },
          { product: "硬丝", size: "90*150", price: 118 },
          { product: "硬丝", size: "90*200", price: 162 },
          { product: "硬丝", size: "100*120", price: 108 },
          { product: "硬丝", size: "120*150", price: 162 },
          { product: "硬丝", size: "120*180", price: 195 },
          { product: "硬丝", size: "120*200", price: 216 },
          { product: "硬丝", size: "50*80", price: 38 },
          { product: "硬丝", size: "60*120", price: 65 },
          { product: "硬丝", size: "90*180", price: 145 },
          { product: "硬丝", size: "120*300", price: 324 },
          { product: "硬丝", size: "160*200", price: 288 },
          { product: "硬丝", size: "160*240", price: 345 },
          { product: "硬丝", size: "180*200", price: 324 },
          { product: "硬丝", size: "180*240", price: 388 },
          { product: "硬丝", size: "200*300", price: 538 },
          { product: "硬丝", size: "90*100", price: 81 },
          { product: "硬丝", size: "120*120", price: 128 },
          { product: "硬丝", size: "120*240", price: 258 },
          { product: "硬丝", size: "160*300", price: 432 },
          { product: "硬丝", size: "180*300", price: 485 },
          { product: "平面", size: "50*80", price: 29 },
          { product: "平面", size: "60*90", price: 39 },
          { product: "平面", size: "80*120", price: 69 },
          { product: "平面", size: "90*150", price: 98 },
          { product: "平面", size: "120*150", price: 135 },
          { product: "平面", size: "120*180", price: 158 },
          { product: "平面", size: "120*200", price: 178 },
          { product: "硅藻泥", size: "40*60", price: 11 },
          { product: "硅藻泥", size: "40*120", price: 16 },
          { product: "硅藻泥", size: "50*80", price: 18 },
          { product: "硅藻泥", size: "60*90", price: 24 },
          { product: "硅藻泥", size: "60*120", price: 32 },
          { product: "硅藻泥", size: "60*150", price: 39 },
          { product: "硅藻泥", size: "80*120", price: 43 },
          { product: "硅藻泥", size: "100*120", price: 54 },
          { product: "硅藻泥", size: "120*150", price: 81 },
          { product: "硅藻泥", size: "120*180", price: 97 },
          { product: "硅藻泥", size: "120*200", price: 108 },
          { product: "流星毯", size: "50*80", price: 39 },
          { product: "流星毯", size: "60*90", price: 54 },
          { product: "流星毯", size: "60*120", price: 69 },
          { product: "流星毯", size: "80*120", price: 96 },
          { product: "流星毯", size: "90*100", price: 88 },
          { product: "流星毯", size: "90*150", price: 135 },
          { product: "流星毯", size: "90*180", price: 162 },
          { product: "流星毯", size: "90*200", price: 179 },
          { product: "流星毯", size: "100*120", price: 118 },
          { product: "流星毯", size: "120*120", price: 144 },
          { product: "流星毯", size: "120*150", price: 178 },
          { product: "流星毯", size: "120*180", price: 216 },
          { product: "流星毯", size: "120*200", price: 238 },
          { product: "流星毯", size: "120*240", price: 288 },
          { product: "流星毯", size: "120*300", price: 358 },
          { product: "流星毯", size: "40*60", price: 18 },
          { product: "宽条纹", size: "40*60", price: 12 },
          { product: "宽条纹", size: "50*80", price: 20 },
          { product: "宽条纹", size: "60*90", price: 27 },
          { product: "宽条纹", size: "60*120", price: 36 },
          { product: "宽条纹", size: "80*120", price: 48 },
          { product: "宽条纹", size: "90*150", price: 68 },
          { product: "宽条纹", size: "90*200", price: 90 },
          { product: "宽条纹", size: "100*120", price: 60 },
          { product: "宽条纹", size: "120*150", price: 90 },
          { product: "宽条纹", size: "120*180", price: 108 },
          { product: "宽条纹", size: "120*200", price: 120 },
          { product: "宽条纹", size: "120*240", price: 144 },
          { product: "宽条纹", size: "120*300", price: 180 },
          { product: "丝圈", size: "40*60", price: 19 },
          { product: "丝圈", size: "60*90", price: 43 },
          { product: "丝圈", size: "60*120", price: 58 },
          { product: "丝圈", size: "80*120", price: 76 },
          { product: "丝圈", size: "100*120", price: 96 },
          { product: "丝圈", size: "120*120", price: 115 },
          { product: "丝圈", size: "120*150", price: 144 },
          { product: "丝圈", size: "120*180", price: 172 },
          { product: "丝圈", size: "120*200", price: 192 },
          { product: "丝圈", size: "120*250", price: 240 },
          { product: "丝圈", size: "120*300", price: 288 }
        ];

        setSizePriceData(data);
        setFilteredData(data);
        setLoading(false);

        toast({
          title: "数据加载成功",
          description: `已加载 ${data.length} 条尺寸价格数据`,
          status: "success",
          duration: 2000,
          isClosable: true,
          position: "top-right"
        });
      } catch (error) {
        console.error("Failed to load size data:", error);
        setLoading(false);
        toast({
          title: "数据加载失败",
          description: "无法加载尺寸价格数据",
          status: "error",
          duration: 3000,
          isClosable: true,
          position: "top-right"
        });
      }
    };

    loadData();
  }, []);

  useEffect(() => {
    let filtered = sizePriceData;

    if (selectedProduct !== "all") {
      filtered = filtered.filter(item => item.product === selectedProduct);
    }

    if (searchTerm.trim()) {
      filtered = filtered.filter(item =>
        item.size.includes(searchTerm.trim()) ||
        item.product.includes(searchTerm.trim())
      );
    }

    setFilteredData(filtered);
  }, [searchTerm, selectedProduct, sizePriceData]);

  const uniqueProducts = [...new Set(sizePriceData.map(item => item.product))];

  if (loading) {
    return (
      <Box textAlign="center" py={12}>
        <Spinner size="xl" color="orange.500" thickness="4px" />
        <Text fontSize="lg" color="gray.500" mt={4}>
          加载尺寸价格数据中...
        </Text>
      </Box>
    );
  }

  return (
    <Box
      maxW="1200px"
      mx="auto"
      p={6}
      bg="white"
      borderRadius="12px"
      boxShadow="0 2px 8px rgba(0, 0, 0, 0.08)"
      border="1px solid"
      borderColor="gray.200"
    >
      <VStack spacing={5} align="stretch">
        <HStack spacing={3} mb={2}>
          <FaTable color="#FFA500" size={24} />
          <Text fontSize="lg" fontWeight="600" color="gray.700">
            尺寸价格表
          </Text>
          <Badge colorScheme="orange" fontSize="sm">
            {filteredData.length} 条数据
          </Badge>
        </HStack>

        <Divider />

        <Flex gap={4} flexWrap="wrap">
          <Box flex="1" minW="200px">
            <Text fontSize="sm" fontWeight="500" mb={2} color="gray.700">
              搜索尺寸或商品
            </Text>
            <Input
              placeholder="输入尺寸（如：120*150）或商品名称"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              bg="gray.50"
              border="1px solid"
              borderColor="gray.200"
              _hover={{ borderColor: "orange.300" }}
              _focus={{
                borderColor: "orange.500",
                boxShadow: "0 0 0 1px #FFA500",
                bg: "white"
              }}
              leftElement={<FaSearch color="gray.400" />}
            />
          </Box>

          <Box flex="1" minW="200px">
            <Text fontSize="sm" fontWeight="500" mb={2} color="gray.700">
              按商品筛选
            </Text>
            <Select
              value={selectedProduct}
              onChange={(e) => setSelectedProduct(e.target.value)}
              bg="gray.50"
              border="1px solid"
              borderColor="gray.200"
              _hover={{ borderColor: "orange.300" }}
              _focus={{
                borderColor: "orange.500",
                boxShadow: "0 0 0 1px #FFA500",
                bg: "white"
              }}
            >
              <option value="all">全部商品</option>
              {uniqueProducts.map((product, index) => (
                <option key={index} value={product}>
                  {product}
                </option>
              ))}
            </Select>
          </Box>
        </Flex>

        <Box
          overflowX="auto"
          border="1px solid"
          borderColor="gray.200"
          borderRadius="8px"
          maxH="600px"
          overflowY="auto"
          css={{
            "&::-webkit-scrollbar": {
              width: "8px",
              height: "8px"
            },
            "&::-webkit-scrollbar-track": {
              background: "#f1f1f1"
            },
            "&::-webkit-scrollbar-thumb": {
              background: "#FFA500",
              borderRadius: "4px"
            }
          }}
        >
          <Table variant="simple" size="sm">
            <Thead bg="gray.50" position="sticky" top={0} zIndex={1}>
              <Tr>
                <Th textAlign="center">商品</Th>
                <Th textAlign="center">尺寸 (cm)</Th>
                <Th textAlign="center">价格 (元)</Th>
              </Tr>
            </Thead>
            <Tbody>
              {filteredData.map((item, index) => (
                <Tr key={index} _hover={{ bg: "orange.50" }}>
                  <Td textAlign="center">
                    <Badge colorScheme="purple" fontSize="xs" px={2} py={1}>
                      {item.product}
                    </Badge>
                  </Td>
                  <Td textAlign="center" fontWeight="500">
                    {item.size}
                  </Td>
                  <Td textAlign="center">
                    <Text fontWeight="600" color="red.500">
                      ¥{item.price}
                    </Text>
                  </Td>
                </Tr>
              ))}
            </Tbody>
          </Table>
        </Box>

        {filteredData.length === 0 && (
          <Box
            py={8}
            textAlign="center"
            color="gray.400"
            border="1px dashed"
            borderColor="gray.300"
            borderRadius="8px"
          >
            <Text fontSize="md" fontWeight="500" mb={2}>
              未找到匹配数据
            </Text>
            <Text fontSize="sm">
              请尝试调整搜索条件或筛选条件
            </Text>
          </Box>
        )}

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
            • 可通过搜索框快速查找特定尺寸或商品
          </Text>
          <Text fontSize="xs" color="gray.600">
            • 支持按商品类型筛选，方便对比价格
          </Text>
          <Text fontSize="xs" color="gray.600">
            • 表格支持滚动查看更多数据
          </Text>
        </Box>
      </VStack>
    </Box>
  );
};

export default SizePriceTable;