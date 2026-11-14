import React, { useState, useEffect } from "react";
import {
  Box,
  VStack,
  Input,
  Button,
  Text,
  Alert,
  AlertIcon,
  Badge,
  HStack,
  Divider,
  useToast
} from "@chakra-ui/react";
import { FaSearch } from "react-icons/fa";

const SizeRecommendation = () => {
  const [userSize, setUserSize] = useState("");
  const [recommendations, setRecommendations] = useState([]);
  const [sizePriceList, setSizePriceList] = useState([]);
  const [loading, setLoading] = useState(true);
  const toast = useToast();

  useEffect(() => {
    const loadSizeData = () => {
      try {
        const data = [
          { size: "60*90", price: 18.8, product: "条纹" },
          { size: "80*120", price: 28.8, product: "条纹" },
          { size: "120*150", price: 68, product: "条纹" },
          { size: "120*180", price: 78, product: "条纹" },
          { size: "90*150", price: 49, product: "条纹" },
          { size: "120*200", price: 88, product: "条纹" },
          { size: "60*120", price: 25.8, product: "条纹" },
          { size: "100*120", price: 42.8, product: "条纹" },
          { size: "90*200", price: 68, product: "条纹" },
          { size: "50*80", price: 13.9, product: "条纹" },
          { size: "60*90", price: 39, product: "菱形方格" },
          { size: "80*120", price: 69, product: "菱形方格" },
          { size: "90*150", price: 98, product: "菱形方格" },
          { size: "120*150", price: 135, product: "菱形方格" },
          { size: "120*180", price: 158, product: "菱形方格" },
          { size: "120*200", price: 178, product: "菱形方格" },
          { size: "60*120", price: 54, product: "菱形方格" },
          { size: "90*200", price: 135, product: "菱形方格" },
          { size: "50*80", price: 29, product: "菱形方格" },
          { size: "100*120", price: 95, product: "菱形方格" },
          { size: "90*180", price: 125, product: "菱形方格" },
          { size: "120*300", price: 268, product: "菱形方格" },
          { size: "160*200", price: 238, product: "菱形方格" },
          { size: "160*240", price: 288, product: "菱形方格" },
          { size: "180*200", price: 268, product: "菱形方格" },
          { size: "180*240", price: 318, product: "菱形方格" },
          { size: "180*300", price: 398, product: "菱形方格" },
          { size: "200*300", price: 438, product: "菱形方格" },
          { size: "90*100", price: 65, product: "菱形方格" },
          { size: "120*120", price: 118, product: "菱形方格" },
          { size: "120*240", price: 215, product: "菱形方格" },
          { size: "160*300", price: 358, product: "菱形方格" },
          { size: "80*100", price: 65, product: "菱形方格" },
          { size: "80*130", price: 75, product: "菱形方格" },
          { size: "80*160", price: 98, product: "菱形方格" },
          { size: "90*120", price: 78, product: "菱形方格" },
          { size: "120*160", price: 145, product: "菱形方格" },
          { size: "60*90", price: 48, product: "硬丝" },
          { size: "80*120", price: 75, product: "硬丝" },
          { size: "90*150", price: 118, product: "硬丝" },
          { size: "90*200", price: 162, product: "硬丝" },
          { size: "100*120", price: 108, product: "硬丝" },
          { size: "120*150", price: 162, product: "硬丝" },
          { size: "120*180", price: 195, product: "硬丝" },
          { size: "120*200", price: 216, product: "硬丝" },
          { size: "50*80", price: 38, product: "硬丝" },
          { size: "60*120", price: 65, product: "硬丝" },
          { size: "90*180", price: 145, product: "硬丝" },
          { size: "120*300", price: 324, product: "硬丝" },
          { size: "160*200", price: 288, product: "硬丝" },
          { size: "160*240", price: 345, product: "硬丝" },
          { size: "180*200", price: 324, product: "硬丝" },
          { size: "180*240", price: 388, product: "硬丝" },
          { size: "200*300", price: 538, product: "硬丝" },
          { size: "90*100", price: 81, product: "硬丝" },
          { size: "120*120", price: 128, product: "硬丝" },
          { size: "120*240", price: 258, product: "硬丝" },
          { size: "160*300", price: 432, product: "硬丝" },
          { size: "180*300", price: 485, product: "硬丝" },
          { size: "50*80", price: 29, product: "平面" },
          { size: "60*90", price: 39, product: "平面" },
          { size: "80*120", price: 69, product: "平面" },
          { size: "90*150", price: 98, product: "平面" },
          { size: "120*150", price: 135, product: "平面" },
          { size: "120*180", price: 158, product: "平面" },
          { size: "120*200", price: 178, product: "平面" },
          { size: "40*60", price: 11, product: "硅藻泥" },
          { size: "40*120", price: 16, product: "硅藻泥" },
          { size: "50*80", price: 18, product: "硅藻泥" },
          { size: "60*90", price: 24, product: "硅藻泥" },
          { size: "60*120", price: 32, product: "硅藻泥" },
          { size: "60*150", price: 39, product: "硅藻泥" },
          { size: "80*120", price: 43, product: "硅藻泥" },
          { size: "100*120", price: 54, product: "硅藻泥" },
          { size: "120*150", price: 81, product: "硅藻泥" },
          { size: "120*180", price: 97, product: "硅藻泥" },
          { size: "120*200", price: 108, product: "硅藻泥" },
          { size: "50*80", price: 39, product: "流星毯" },
          { size: "60*90", price: 54, product: "流星毯" },
          { size: "60*120", price: 69, product: "流星毯" },
          { size: "80*120", price: 96, product: "流星毯" },
          { size: "90*100", price: 88, product: "流星毯" },
          { size: "90*150", price: 135, product: "流星毯" },
          { size: "90*180", price: 162, product: "流星毯" },
          { size: "90*200", price: 179, product: "流星毯" },
          { size: "100*120", price: 118, product: "流星毯" },
          { size: "120*120", price: 144, product: "流星毯" },
          { size: "120*150", price: 178, product: "流星毯" },
          { size: "120*180", price: 216, product: "流星毯" },
          { size: "120*200", price: 238, product: "流星毯" },
          { size: "120*240", price: 288, product: "流星毯" },
          { size: "120*300", price: 358, product: "流星毯" },
          { size: "40*60", price: 18, product: "流星毯" },
          { size: "40*60", price: 10, product: "宽条纹" },
          { size: "50*80", price: 13.8, product: "宽条纹" },
          { size: "60*90", price: 18.8, product: "宽条纹" },
          { size: "60*120", price: 25.8, product: "宽条纹" },
          { size: "80*120", price: 28.8, product: "宽条纹" },
          { size: "90*150", price: 49, product: "宽条纹" },
          { size: "90*200", price: 68, product: "宽条纹" },
          { size: "100*120", price: 42.8, product: "宽条纹" },
          { size: "120*150", price: 68, product: "宽条纹" },
          { size: "120*180", price: 78, product: "宽条纹" },
          { size: "120*200", price: 88, product: "宽条纹" },
          { size: "120*240", price: 108, product: "宽条纹" },
          { size: "120*300", price: 132, product: "宽条纹" },
          { size: "40*60", price: 19, product: "丝圈" },
          { size: "60*90", price: 43, product: "丝圈" },
          { size: "60*120", price: 58, product: "丝圈" },
          { size: "80*120", price: 76, product: "丝圈" },
          { size: "100*120", price: 96, product: "丝圈" },
          { size: "120*120", price: 115, product: "丝圈" },
          { size: "120*150", price: 144, product: "丝圈" },
          { size: "120*180", price: 172, product: "丝圈" },
          { size: "120*200", price: 192, product: "丝圈" },
          { size: "120*250", price: 240, product: "丝圈" },
          { size: "120*300", price: 288, product: "丝圈" }
        ];

        setSizePriceList(data);
        setLoading(false);

        toast({
          title: "数据加载成功",
          description: `已加载 ${data.length} 条尺寸数据`,
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
          description: "无法加载尺寸价格数据，请稍后重试",
          status: "error",
          duration: 3000,
          isClosable: true,
          position: "top-right"
        });
      }
    };

    loadSizeData();
  }, []);

  const handleRecommendation = () => {
    if (!userSize.trim()) {
      toast({
        title: "请输入尺寸",
        description: "格式：宽*长（如：90*100）",
        status: "warning",
        duration: 2000,
        isClosable: true,
        position: "top-right"
      });
      return;
    }

    const [inputWidth, inputHeight] = userSize.split("*").map(Number);
    if (isNaN(inputWidth) || isNaN(inputHeight)) {
      setRecommendations([{ text: "请输入有效尺寸（如：90*100）", isError: true }]);
      return;
    }

    const exactMatches = [];
    const closeMatches = [];

    sizePriceList.forEach((item) => {
      const [width, height] = item.size.split("*").map(Number);
      const widthDiff = Math.abs(width - inputWidth);
      const heightDiff = Math.abs(height - inputHeight);

      if (width === inputWidth && height === inputHeight) {
        exactMatches.push({
          ...item,
          isExact: true
        });
      } else if (widthDiff < 4 && heightDiff < 4 && (widthDiff > 0 || heightDiff > 0)) {
        closeMatches.push({
          ...item,
          difference: Math.max(widthDiff, heightDiff),
          isExact: false
        });
      }
    });

    const allMatches = [...exactMatches, ...closeMatches];

    if (allMatches.length > 0) {
      setRecommendations(allMatches);
      toast({
        title: "找到匹配尺寸",
        description: `共找到 ${allMatches.length} 个匹配结果`,
        status: "success",
        duration: 2000,
        isClosable: true,
        position: "top-right"
      });
    } else {
      setRecommendations([{ text: "无接近尺寸", isError: false }]);
      toast({
        title: "未找到匹配",
        description: "请尝试其他尺寸",
        status: "info",
        duration: 2000,
        isClosable: true,
        position: "top-right"
      });
    }
  };

  if (loading) {
    return (
      <Box textAlign="center" py={12}>
        <Text fontSize="lg" color="gray.500">
          加载尺寸数据中...
        </Text>
      </Box>
    );
  }

  return (
    <Box
      maxW="600px"
      mx="auto"
      p={6}
      bg="white"
      borderRadius="12px"
      boxShadow="0 2px 8px rgba(0, 0, 0, 0.08)"
      border="1px solid"
      borderColor="gray.200"
    >
      <VStack spacing={5} align="stretch">
        <Box>
          <Text fontSize="15px" fontWeight="600" mb={3} color="gray.700">
            尺寸推荐查询
          </Text>
          <HStack spacing={3}>
            <Input
              placeholder="输入尺寸（如：90*100）"
              value={userSize}
              onChange={(e) => setUserSize(e.target.value)}
              onKeyPress={(e) => {
                if (e.key === "Enter") {
                  handleRecommendation();
                }
              }}
              bg="gray.50"
              border="1px solid"
              borderColor="gray.200"
              _hover={{ borderColor: "orange.300" }}
              _focus={{
                borderColor: "orange.500",
                boxShadow: "0 0 0 1px #FFA500",
                bg: "white"
              }}
              size="md"
            />
            <Button
              leftIcon={<FaSearch />}
              colorScheme="orange"
              onClick={handleRecommendation}
              size="md"
              px={6}
            >
              查询
            </Button>
          </HStack>
          <Text fontSize="13px" color="gray.500" mt={2}>
            格式：宽*长（单位：厘米）
          </Text>
        </Box>

        <Divider />

        {recommendations.length > 0 && (
          <Box>
            <Text fontSize="14px" fontWeight="600" mb={3} color="gray.700">
              推荐结果
            </Text>
            <VStack spacing={3} align="stretch">
              {recommendations.map((item, index) => {
                if (item.isError || item.text) {
                  return (
                    <Alert
                      key={index}
                      status={item.isError ? "warning" : "info"}
                      borderRadius="8px"
                      fontSize="14px"
                    >
                      <AlertIcon />
                      {item.text}
                    </Alert>
                  );
                }

                return (
                  <Box
                    key={index}
                    p={4}
                    bg={item.isExact ? "green.50" : "blue.50"}
                    borderRadius="8px"
                    border="1px solid"
                    borderColor={item.isExact ? "green.200" : "blue.200"}
                    _hover={{
                      bg: item.isExact ? "green.100" : "blue.100",
                      transform: "translateX(4px)"
                    }}
                    transition="all 0.2s"
                  >
                    <HStack justify="space-between" mb={2}>
                      <HStack spacing={2}>
                        <Badge
                          colorScheme={item.isExact ? "green" : "blue"}
                          fontSize="xs"
                          px={2}
                          py={1}
                        >
                          {item.size}
                        </Badge>
                        {item.isExact && (
                          <Badge colorScheme="green" fontSize="xs">
                            ✓ 完全匹配
                          </Badge>
                        )}
                        {!item.isExact && item.difference && (
                          <Badge colorScheme="blue" fontSize="xs">
                            差值 {item.difference}cm
                          </Badge>
                        )}
                      </HStack>
                      <Badge colorScheme="red" fontSize="sm" px={3} py={1}>
                        ¥{item.price}
                      </Badge>
                    </HStack>
                    <Text fontSize="13px" color="gray.700">
                      商品：
                      <Text as="span" fontWeight="600" ml={1}>
                        {item.product}
                      </Text>
                    </Text>
                  </Box>
                );
              })}
            </VStack>
          </Box>
        )}

        {recommendations.length === 0 && (
          <Box
            py={8}
            textAlign="center"
            color="gray.400"
            border="1px dashed"
            borderColor="gray.300"
            borderRadius="8px"
          >
            <Text fontSize="md" fontWeight="500" mb={2}>
              请输入尺寸查询
            </Text>
            <Text fontSize="sm">
              输入尺寸后将显示匹配的尺寸及价格信息
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
          <Text fontSize="13px" color="blue.700" fontWeight="500">
            💡 使用提示
          </Text>
          <Text fontSize="12px" color="gray.600" mt={1}>
            • 输入格式：宽*长（如：90*100）
          </Text>
          <Text fontSize="12px" color="gray.600">
            • 系统会推荐完全匹配或宽度、高度差值均小于4厘米的尺寸
          </Text>
          <Text fontSize="12px" color="gray.600">
            • 当前数据库包含 {sizePriceList.length} 条尺寸记录
          </Text>
        </Box>
      </VStack>
    </Box>
  );
};

export default SizeRecommendation;