import React, { useState, useEffect } from "react";
import {
  Box,
  VStack,
  HStack,
  Input,
  Select,
  Button,
  Flex,
  Text,
  Heading,
  Divider,
  Badge,
  useToast,
  SimpleGrid,
  Image,
  IconButton,
  Tabs,
  TabList,
  TabPanels,
  Tab,
  TabPanel
} from "@chakra-ui/react";
import { ChromePicker } from "react-color";
import { useDropzone } from "react-dropzone";
import { FaSave, FaUndo, FaPalette, FaFont, FaImage, FaCog } from "react-icons/fa";
import { useNavigate } from "react-router-dom";

const AdminPanel = () => {
  const [config, setConfig] = useState({
    text: "默认文本",
    font: "Arial",
    size: "16px",
    color: "#000000",
    bgColor: "#FFFFFF",
    image: null,
  });

  const toast = useToast();
  const navigate = useNavigate();

  useEffect(() => {
    const savedConfig = JSON.parse(localStorage.getItem("adminConfig")) || {
      text: "默认文本",
      font: "Arial",
      size: "16px",
      color: "#000000",
      bgColor: "#FFFFFF",
      image: null,
    };
    setConfig(savedConfig);
  }, []);

  const saveConfig = () => {
    localStorage.setItem("adminConfig", JSON.stringify(config));
    toast({
      title: "配置已保存",
      description: "所有设置已成功保存到本地存储",
      status: "success",
      duration: 3000,
      isClosable: true,
      position: "top-right"
    });
  };

  const resetConfig = () => {
    const defaultConfig = {
      text: "默认文本",
      font: "Arial",
      size: "16px",
      color: "#000000",
      bgColor: "#FFFFFF",
      image: null,
    };
    setConfig(defaultConfig);
    localStorage.setItem("adminConfig", JSON.stringify(defaultConfig));
    toast({
      title: "配置已重置",
      description: "所有设置已恢复为默认值",
      status: "info",
      duration: 3000,
      isClosable: true,
      position: "top-right"
    });
  };

  const handleLogout = () => {
    toast({
      title: "已退出登录",
      status: "info",
      duration: 2000,
      isClosable: true,
      position: "top-right"
    });
    navigate("/login");
  };

  const { getRootProps, getInputProps, isDragActive } = useDropzone({
    accept: {
      'image/*': ['.png', '.jpg', '.jpeg', '.gif', '.webp']
    },
    maxFiles: 1,
    onDrop: (acceptedFiles) => {
      if (acceptedFiles.length > 0) {
        const file = acceptedFiles[0];
        const reader = new FileReader();
        reader.onload = () => {
          setConfig({ ...config, image: reader.result });
          toast({
            title: "图片上传成功",
            description: `已上传 ${file.name}`,
            status: "success",
            duration: 2000,
            isClosable: true,
            position: "top-right"
          });
        };
        reader.readAsDataURL(file);
      }
    },
    onDropRejected: () => {
      toast({
        title: "上传失败",
        description: "请上传有效的图片文件",
        status: "error",
        duration: 2000,
        isClosable: true,
        position: "top-right"
      });
    }
  });

  const removeImage = () => {
    setConfig({ ...config, image: null });
    toast({
      title: "图片已移除",
      status: "info",
      duration: 2000,
      isClosable: true,
      position: "top-right"
    });
  };

  return (
    <Box bg={config.bgColor} minH="100vh" p={8}>
      <VStack spacing={8} align="stretch" maxW="1200px" mx="auto">
        {/* 头部 */}
        <Flex justify="space-between" align="center">
          <HStack spacing={3}>
            <FaCog size={32} color="#FFA500" />
            <Heading size="lg" fontFamily="'ZCOOL XiaoWei', sans-serif" color={config.color}>
              后台管理系统
            </Heading>
            <Badge colorScheme="orange" fontSize="sm" px={3} py={1}>
              配置中心
            </Badge>
          </HStack>
          <HStack spacing={3}>
            <Button
              leftIcon={<FaSave />}
              colorScheme="orange"
              onClick={saveConfig}
              _hover={{ transform: 'translateY(-2px)', boxShadow: 'lg' }}
              transition="all 0.2s"
            >
              保存配置
            </Button>
            <Button
              leftIcon={<FaUndo />}
              colorScheme="gray"
              variant="outline"
              onClick={resetConfig}
            >
              重置
            </Button>
            <Button
              colorScheme="red"
              variant="outline"
              onClick={handleLogout}
            >
              退出登录
            </Button>
          </HStack>
        </Flex>

        <Divider />

        {/* 配置面板 */}
        <Tabs colorScheme="orange" variant="soft-rounded">
          <TabList>
            <Tab><FaFont style={{ marginRight: '8px' }} /> 文字与字体</Tab>
            <Tab><FaPalette style={{ marginRight: '8px' }} /> 颜色配置</Tab>
            <Tab><FaImage style={{ marginRight: '8px' }} /> 图片管理</Tab>
          </TabList>

          <TabPanels>
            {/* 文字与字体配置 */}
            <TabPanel>
              <VStack spacing={6} align="stretch">
                <Box
                  bg="white"
                  p={6}
                  borderRadius="12px"
                  boxShadow="0 2px 8px rgba(0, 0, 0, 0.08)"
                  border="1px solid"
                  borderColor="gray.200"
                >
                  <Text fontSize="md" fontWeight="600" mb={4} color="gray.700">
                    文本内容编辑
                  </Text>
                  <Input
                    value={config.text}
                    onChange={(e) => setConfig({ ...config, text: e.target.value })}
                    placeholder="输入要显示的文本"
                    size="lg"
                    bg="gray.50"
                    border="1px solid"
                    borderColor="gray.200"
                    _hover={{ borderColor: 'orange.300' }}
                    _focus={{
                      borderColor: 'orange.500',
                      boxShadow: '0 0 0 1px #FFA500',
                      bg: 'white'
                    }}
                  />
                </Box>

                <SimpleGrid columns={{ base: 1, md: 2 }} spacing={6}>
                  <Box
                    bg="white"
                    p={6}
                    borderRadius="12px"
                    boxShadow="0 2px 8px rgba(0, 0, 0, 0.08)"
                    border="1px solid"
                    borderColor="gray.200"
                  >
                    <Text fontSize="md" fontWeight="600" mb={4} color="gray.700">
                      字体选择
                    </Text>
                    <Select
                      value={config.font}
                      onChange={(e) => setConfig({ ...config, font: e.target.value })}
                      size="lg"
                      bg="gray.50"
                      border="1px solid"
                      borderColor="gray.200"
                      _hover={{ borderColor: 'orange.300' }}
                      _focus={{
                        borderColor: 'orange.500',
                        boxShadow: '0 0 0 1px #FFA500',
                        bg: 'white'
                      }}
                    >
                      <option value="Arial">Arial</option>
                      <option value="Times New Roman">Times New Roman</option>
                      <option value="Courier New">Courier New</option>
                      <option value="Georgia">Georgia</option>
                      <option value="Verdana">Verdana</option>
                      <option value="'ZCOOL XiaoWei', cursive">'ZCOOL XiaoWei' (中文)</option>
                    </Select>
                  </Box>

                  <Box
                    bg="white"
                    p={6}
                    borderRadius="12px"
                    boxShadow="0 2px 8px rgba(0, 0, 0, 0.08)"
                    border="1px solid"
                    borderColor="gray.200"
                  >
                    <Text fontSize="md" fontWeight="600" mb={4} color="gray.700">
                      字体大小
                    </Text>
                    <Select
                      value={config.size}
                      onChange={(e) => setConfig({ ...config, size: e.target.value })}
                      size="lg"
                      bg="gray.50"
                      border="1px solid"
                      borderColor="gray.200"
                      _hover={{ borderColor: 'orange.300' }}
                      _focus={{
                        borderColor: 'orange.500',
                        boxShadow: '0 0 0 1px #FFA500',
                        bg: 'white'
                      }}
                    >
                      <option value="12px">12px (小)</option>
                      <option value="14px">14px (较小)</option>
                      <option value="16px">16px (标准)</option>
                      <option value="18px">18px (较大)</option>
                      <option value="20px">20px (大)</option>
                      <option value="24px">24px (特大)</option>
                    </Select>
                  </Box>
                </SimpleGrid>

                {/* 预览区域 */}
                <Box
                  bg="white"
                  p={6}
                  borderRadius="12px"
                  boxShadow="0 2px 8px rgba(0, 0, 0, 0.08)"
                  border="1px solid"
                  borderColor="gray.200"
                >
                  <Text fontSize="md" fontWeight="600" mb={4} color="gray.700">
                    预览效果
                  </Text>
                  <Box
                    p={6}
                    bg="gray.50"
                    borderRadius="8px"
                    textAlign="center"
                  >
                    <Text
                      fontFamily={config.font}
                      fontSize={config.size}
                      color={config.color}
                    >
                      {config.text}
                    </Text>
                  </Box>
                </Box>
              </VStack>
            </TabPanel>

            {/* 颜色配置 */}
            <TabPanel>
              <SimpleGrid columns={{ base: 1, md: 2 }} spacing={6}>
                <Box
                  bg="white"
                  p={6}
                  borderRadius="12px"
                  boxShadow="0 2px 8px rgba(0, 0, 0, 0.08)"
                  border="1px solid"
                  borderColor="gray.200"
                >
                  <Text fontSize="md" fontWeight="600" mb={4} color="gray.700">
                    文字颜色
                  </Text>
                  <Flex justify="center">
                    <ChromePicker
                      color={config.color}
                      onChangeComplete={(color) => setConfig({ ...config, color: color.hex })}
                    />
                  </Flex>
                  <Box mt={4} p={3} bg="gray.50" borderRadius="8px">
                    <Text fontSize="sm" color="gray.600">
                      当前颜色: <strong>{config.color}</strong>
                    </Text>
                  </Box>
                </Box>

                <Box
                  bg="white"
                  p={6}
                  borderRadius="12px"
                  boxShadow="0 2px 8px rgba(0, 0, 0, 0.08)"
                  border="1px solid"
                  borderColor="gray.200"
                >
                  <Text fontSize="md" fontWeight="600" mb={4} color="gray.700">
                    背景颜色
                  </Text>
                  <Flex justify="center">
                    <ChromePicker
                      color={config.bgColor}
                      onChangeComplete={(color) => setConfig({ ...config, bgColor: color.hex })}
                    />
                  </Flex>
                  <Box mt={4} p={3} bg="gray.50" borderRadius="8px">
                    <Text fontSize="sm" color="gray.600">
                      当前颜色: <strong>{config.bgColor}</strong>
                    </Text>
                  </Box>
                </Box>
              </SimpleGrid>
            </TabPanel>

            {/* 图片管理 */}
            <TabPanel>
              <VStack spacing={6} align="stretch">
                <Box
                  bg="white"
                  p={6}
                  borderRadius="12px"
                  boxShadow="0 2px 8px rgba(0, 0, 0, 0.08)"
                  border="1px solid"
                  borderColor="gray.200"
                >
                  <Text fontSize="md" fontWeight="600" mb={4} color="gray.700">
                    图片上传
                  </Text>
                  <Flex
                    {...getRootProps()}
                    border="2px dashed"
                    borderColor={isDragActive ? "orange.400" : "gray.300"}
                    borderRadius="8px"
                    p={8}
                    justify="center"
                    align="center"
                    cursor="pointer"
                    bg={isDragActive ? "orange.50" : "gray.50"}
                    _hover={{ borderColor: "orange.400", bg: "orange.50" }}
                    transition="all 0.2s"
                    direction="column"
                  >
                    <input {...getInputProps()} />
                    <FaImage size={48} color={isDragActive ? "#FFA500" : "#CBD5E0"} />
                    <Text mt={4} fontSize="md" color="gray.600" textAlign="center">
                      {isDragActive
                        ? "放开鼠标即可上传"
                        : "拖拽图片到此处或点击上传"}
                    </Text>
                    <Text fontSize="sm" color="gray.500" mt={2}>
                      支持 PNG、JPG、JPEG、GIF、WEBP 格式
                    </Text>
                  </Flex>
                </Box>

                {config.image && (
                  <Box
                    bg="white"
                    p={6}
                    borderRadius="12px"
                    boxShadow="0 2px 8px rgba(0, 0, 0, 0.08)"
                    border="1px solid"
                    borderColor="gray.200"
                  >
                    <Flex justify="space-between" align="center" mb={4}>
                      <Text fontSize="md" fontWeight="600" color="gray.700">
                        当前图片
                      </Text>
                      <Button
                        colorScheme="red"
                        variant="outline"
                        size="sm"
                        onClick={removeImage}
                      >
                        移除图片
                      </Button>
                    </Flex>
                    <Flex justify="center">
                      <Image
                        src={config.image}
                        alt="上传的图片"
                        maxH="400px"
                        objectFit="contain"
                        borderRadius="8px"
                        boxShadow="md"
                      />
                    </Flex>
                  </Box>
                )}
              </VStack>
            </TabPanel>
          </TabPanels>
        </Tabs>

        {/* 底部提示 */}
        <Box
          bg="blue.50"
          p={4}
          borderRadius="8px"
          border="1px solid"
          borderColor="blue.200"
        >
          <Text fontSize="sm" color="blue.700" fontWeight="500">
            💡 使用提示
          </Text>
          <Text fontSize="xs" color="gray.600" mt={2}>
            1. 修改配置后请点击"保存配置"按钮保存更改
          </Text>
          <Text fontSize="xs" color="gray.600">
            2. 所有配置数据存储在浏览器本地存储中
          </Text>
          <Text fontSize="xs" color="gray.600">
            3. 点击"重置"可恢复默认配置
          </Text>
        </Box>
      </VStack>
    </Box>
  );
};

export default AdminPanel;