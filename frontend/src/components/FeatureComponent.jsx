import React, { useState, useEffect, useRef } from "react";
import {
  Box,
  Button,
  Text,
  VStack,
  HStack,
  Badge,
  Divider,
  IconButton,
  useToast
} from "@chakra-ui/react";
import { FaPlus, FaMinus, FaUndo } from "react-icons/fa";
import gsap from "gsap";

const FeatureComponent = () => {
  const [count, setCount] = useState(0);
  const [history, setHistory] = useState([]);
  
  const containerRef = useRef(null);
  const countRef = useRef(null);
  const toast = useToast();

  useEffect(() => {
    if (containerRef.current) {
      gsap.fromTo(
        containerRef.current,
        { opacity: 0, y: 30 },
        { opacity: 1, y: 0, duration: 0.5, ease: "power2.out" }
      );
    }
  }, []);

  useEffect(() => {
    if (countRef.current) {
      gsap.fromTo(
        countRef.current,
        { scale: 1.3, color: "#FFA500" },
        { scale: 1, color: "#2D3748", duration: 0.3, ease: "back.out(1.7)" }
      );
    }
  }, [count]);

  const handleIncrement = () => {
    const newCount = count + 1;
    setCount(newCount);
    setHistory([...history, { action: "增加", value: newCount, time: new Date().toLocaleTimeString() }]);
    
    toast({
      title: "计数已增加",
      description: `当前计数：${newCount}`,
      status: "success",
      duration: 1500,
      isClosable: true,
      position: "top-right"
    });
  };

  const handleDecrement = () => {
    if (count > 0) {
      const newCount = count - 1;
      setCount(newCount);
      setHistory([...history, { action: "减少", value: newCount, time: new Date().toLocaleTimeString() }]);
      
      toast({
        title: "计数已减少",
        description: `当前计数：${newCount}`,
        status: "info",
        duration: 1500,
        isClosable: true,
        position: "top-right"
      });
    } else {
      toast({
        title: "无法减少",
        description: "计数已为最小值",
        status: "warning",
        duration: 1500,
        isClosable: true,
        position: "top-right"
      });
    }
  };

  const handleReset = () => {
    setCount(0);
    setHistory([]);
    
    toast({
      title: "计数已重置",
      description: "所有数据已清除",
      status: "info",
      duration: 2000,
      isClosable: true,
      position: "top-right"
    });
  };

  return (
    <Box
      ref={containerRef}
      p={8}
      bg="white"
      borderRadius="12px"
      boxShadow="0 2px 8px rgba(0, 0, 0, 0.08)"
      border="1px solid"
      borderColor="gray.200"
      maxW="500px"
      mx="auto"
    >
      <VStack spacing={6} align="stretch">
        <HStack justify="center" spacing={3}>
          <Text fontSize="2xl" fontWeight="600" color="gray.700">
            计数器
          </Text>
          <Badge colorScheme="orange" fontSize="md" px={3} py={1}>
            功能演示
          </Badge>
        </HStack>

        <Divider />

        <Box
          p={6}
          bg="gray.50"
          borderRadius="8px"
          textAlign="center"
        >
          <Text fontSize="sm" color="gray.600" mb={2}>
            当前计数
          </Text>
          <Text
            ref={countRef}
            fontSize="5xl"
            fontWeight="700"
            color="gray.800"
          >
            {count}
          </Text>
        </Box>

        <HStack spacing={3} justify="center">
          <IconButton
            icon={<FaMinus />}
            colorScheme="red"
            size="lg"
            onClick={handleDecrement}
            aria-label="减少计数"
            _hover={{ transform: "translateY(-2px)", boxShadow: "md" }}
            transition="all 0.2s"
          />
          
          <Button
            leftIcon={<FaPlus />}
            colorScheme="orange"
            size="lg"
            onClick={handleIncrement}
            px={8}
            _hover={{ transform: "translateY(-2px)", boxShadow: "md" }}
            transition="all 0.2s"
          >
            增加计数
          </Button>
          
          <IconButton
            icon={<FaUndo />}
            colorScheme="gray"
            variant="outline"
            size="lg"
            onClick={handleReset}
            aria-label="重置计数"
            _hover={{ transform: "translateY(-2px)", boxShadow: "md" }}
            transition="all 0.2s"
          />
        </HStack>

        {history.length > 0 && (
          <>
            <Divider />
            
            <Box>
              <Text fontSize="sm" fontWeight="600" color="gray.700" mb={3}>
                操作历史
              </Text>
              <VStack
                spacing={2}
                align="stretch"
                maxH="200px"
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
                {history.slice().reverse().map((item, index) => (
                  <Box
                    key={index}
                    p={2}
                    bg="gray.50"
                    borderRadius="6px"
                    fontSize="xs"
                  >
                    <HStack justify="space-between">
                      <Text color="gray.600">
                        {item.action}至 <strong>{item.value}</strong>
                      </Text>
                      <Text color="gray.500">{item.time}</Text>
                    </HStack>
                  </Box>
                ))}
              </VStack>
            </Box>
          </>
        )}
      </VStack>
    </Box>
  );
};

export default FeatureComponent;