import React, { useState } from "react";
import {
  Box,
  Input,
  Button,
  VStack,
  Alert,
  AlertIcon,
  Heading,
  Text,
  InputGroup,
  InputLeftElement,
  InputRightElement,
  IconButton,
  useToast,
  Flex,
  Divider
} from "@chakra-ui/react";
import { useNavigate } from "react-router-dom";
import { FaUser, FaLock, FaEye, FaEyeSlash } from "react-icons/fa";

const LoginPage = ({ onLogin }) => {
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  
  const navigate = useNavigate();
  const toast = useToast();

  const handleLogin = () => {
    setError("");
    
    if (!username.trim() || !password.trim()) {
      setError("请输入用户名和密码");
      return;
    }

    setIsLoading(true);

    setTimeout(() => {
      if (username === "123" && password === "123123") {
        onLogin();
        toast({
          title: "登录成功",
          description: "欢迎进入后台管理系统",
          status: "success",
          duration: 2000,
          isClosable: true,
          position: "top-right"
        });
        navigate("/admin");
      } else {
        setError("用户名或密码错误");
        toast({
          title: "登录失败",
          description: "用户名或密码错误",
          status: "error",
          duration: 2000,
          isClosable: true,
          position: "top-right"
        });
      }
      setIsLoading(false);
    }, 500);
  };

  const handleKeyPress = (e) => {
    if (e.key === "Enter") {
      handleLogin();
    }
  };

  return (
    <Box
      minH="100vh"
      display="flex"
      alignItems="center"
      justifyContent="center"
      bg="gray.50"
      px={4}
    >
      <Box
        maxW="400px"
        w="100%"
        bg="white"
        borderRadius="12px"
        boxShadow="0 4px 16px rgba(0, 0, 0, 0.1)"
        p={8}
      >
        <VStack spacing={6} align="stretch">
          <Box textAlign="center">
            <Heading size="lg" color="orange.500" mb={2}>
              后台管理系统
            </Heading>
            <Text fontSize="sm" color="gray.600">
              请登录以继续
            </Text>
          </Box>

          <Divider />

          {error && (
            <Alert status="error" borderRadius="8px">
              <AlertIcon />
              {error}
            </Alert>
          )}

          <Box>
            <Text fontSize="sm" fontWeight="500" mb={2} color="gray.700">
              用户名
            </Text>
            <InputGroup>
              <InputLeftElement pointerEvents="none">
                <FaUser color="gray" />
              </InputLeftElement>
              <Input
                placeholder="请输入用户名"
                value={username}
                onChange={(e) => setUsername(e.target.value)}
                onKeyPress={handleKeyPress}
                bg="gray.50"
                border="1px solid"
                borderColor="gray.200"
                _hover={{ borderColor: "orange.300" }}
                _focus={{
                  borderColor: "orange.500",
                  boxShadow: "0 0 0 1px #FFA500",
                  bg: "white"
                }}
              />
            </InputGroup>
          </Box>

          <Box>
            <Text fontSize="sm" fontWeight="500" mb={2} color="gray.700">
              密码
            </Text>
            <InputGroup>
              <InputLeftElement pointerEvents="none">
                <FaLock color="gray" />
              </InputLeftElement>
              <Input
                type={showPassword ? "text" : "password"}
                placeholder="请输入密码"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                onKeyPress={handleKeyPress}
                bg="gray.50"
                border="1px solid"
                borderColor="gray.200"
                _hover={{ borderColor: "orange.300" }}
                _focus={{
                  borderColor: "orange.500",
                  boxShadow: "0 0 0 1px #FFA500",
                  bg: "white"
                }}
              />
              <InputRightElement>
                <IconButton
                  size="sm"
                  variant="ghost"
                  icon={showPassword ? <FaEyeSlash /> : <FaEye />}
                  onClick={() => setShowPassword(!showPassword)}
                  aria-label={showPassword ? "隐藏密码" : "显示密码"}
                />
              </InputRightElement>
            </InputGroup>
          </Box>

          <Button
            colorScheme="orange"
            size="lg"
            w="100%"
            onClick={handleLogin}
            isLoading={isLoading}
            loadingText="登录中..."
            _hover={{ transform: "translateY(-2px)", boxShadow: "lg" }}
            transition="all 0.2s"
          >
            登录
          </Button>

          <Flex justify="center" mt={2}>
            <Text fontSize="xs" color="gray.500">
              默认账号: 123 / 123123
            </Text>
          </Flex>
        </VStack>
      </Box>
    </Box>
  );
};

export default LoginPage;