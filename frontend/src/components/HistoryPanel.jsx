import React, { useEffect, useRef } from 'react';
import {
  Box,
  VStack,
  HStack,
  Text,
  Button,
  IconButton,
  Divider,
  useToast,
  Flex,
  Badge,
  Heading
} from '@chakra-ui/react';
import { DeleteIcon, RepeatIcon, TimeIcon } from '@chakra-ui/icons';
import { FaHistory, FaTrash } from 'react-icons/fa';
import gsap from 'gsap';
import { cardFadeInAnimation, listItemSlideInAnimation, buttonHoverAnimation } from '../styles/animations';

const HistoryPanel = ({ historyRecords, onApply, onDelete, onClear }) => {
  const toast = useToast();
  const panelRef = useRef(null);
  const itemsRef = useRef([]);

  useEffect(() => {
    if (panelRef.current) {
      cardFadeInAnimation(panelRef.current, 0.2);
    }
  }, []);

  useEffect(() => {
    if (itemsRef.current.length > 0) {
      listItemSlideInAnimation(itemsRef.current);
    }
  }, [historyRecords]);

  const handleApply = (record, index) => {
    onApply(record);
    toast({
      title: '历史记录已应用',
      description: '计算器已还原到该记录状态',
      status: 'success',
      duration: 2000,
      isClosable: true,
      position: 'top-right'
    });
  };

  const handleDelete = (index) => {
    onDelete(index);
    toast({
      title: '记录已删除',
      status: 'info',
      duration: 2000,
      isClosable: true,
      position: 'top-right'
    });
  };

  const handleClear = () => {
    if (historyRecords.length === 0) {
      toast({
        title: '没有历史记录',
        description: '当前没有可清除的记录',
        status: 'warning',
        duration: 2000,
        isClosable: true,
        position: 'top-right'
      });
      return;
    }

    if (window.confirm('确定要清除所有历史记录吗？此操作不可撤销。')) {
      onClear();
      toast({
        title: '已清除所有记录',
        status: 'success',
        duration: 2000,
        isClosable: true,
        position: 'top-right'
      });
    }
  };

  return (
    <Box
      ref={panelRef}
      bg="white"
      borderRadius="12px"
      boxShadow="0 2px 8px rgba(0, 0, 0, 0.08)"
      border="1px solid"
      borderColor="gray.200"
      p={8}
      mt={10}
    >
      <Flex justify="space-between" align="center" mb={6}>
        <HStack spacing={3}>
          <FaHistory color="#FFA500" size={24} />
          <Heading size="md" color="gray.700">
            历史计算记录
          </Heading>
          <Badge colorScheme="orange" fontSize="sm">
            自动保存
          </Badge>
        </HStack>
        <Button
          leftIcon={<FaTrash />}
          colorScheme="red"
          variant="outline"
          size="sm"
          onClick={handleClear}
          _hover={{ bg: 'red.50' }}
        >
          清除记录
        </Button>
      </Flex>

      <Divider mb={6} />

      {historyRecords.length === 0 ? (
        <VStack spacing={4} py={12} color="gray.400">
          <FaHistory size={64} opacity={0.3} />
          <Text fontSize="lg" fontWeight="500">
            暂无历史记录
          </Text>
          <Text fontSize="sm" textAlign="center" maxW="400px">
            所有的计算结果将自动保存到历史记录
          </Text>
        </VStack>
      ) : (
        <VStack
          spacing={4}
          maxH="500px"
          overflowY="auto"
          css={{
            '&::-webkit-scrollbar': {
              width: '8px'
            },
            '&::-webkit-scrollbar-track': {
              background: '#f1f1f1',
              borderRadius: '10px'
            },
            '&::-webkit-scrollbar-thumb': {
              background: '#FFA500',
              borderRadius: '10px'
            },
            '&::-webkit-scrollbar-thumb:hover': {
              background: '#ff8c00'
            }
          }}
        >
          {historyRecords.map((record, index) => (
            <Box
              key={index}
              ref={el => itemsRef.current[index] = el}
              w="100%"
              p={4}
              bg="gray.50"
              borderRadius="8px"
              border="1px solid"
              borderColor="gray.200"
              transition="all 0.2s"
              _hover={{
                bg: 'orange.50',
                borderColor: 'orange.300',
                transform: 'translateX(4px)'
              }}
            >
              <Flex justify="space-between" align="flex-start">
                <VStack align="stretch" spacing={2} flex={1}>
                  <Text fontWeight="600" color="gray.700" fontSize="md">
                    {record.productName}
                  </Text>
                  <Text fontSize="sm" color="gray.600">
                    尺寸: {record.dimensions}
                  </Text>
                  <HStack spacing={4}>
                    <Text fontSize="lg" fontWeight="700" color="red.500">
                      总价: ¥{record.totalPrice}
                    </Text>
                    <HStack spacing={1} color="gray.500">
                      <TimeIcon boxSize={3} />
                      <Text fontSize="xs">{record.time}</Text>
                    </HStack>
                  </HStack>
                </VStack>

                <HStack spacing={2}>
                  <IconButton
                    icon={<RepeatIcon />}
                    colorScheme="orange"
                    variant="ghost"
                    size="sm"
                    aria-label="应用记录"
                    title="应用到计算器"
                    onClick={() => handleApply(record, index)}
                    onMouseEnter={(e) => buttonHoverAnimation(e.currentTarget, true)}
                    onMouseLeave={(e) => buttonHoverAnimation(e.currentTarget, false)}
                  />
                  <IconButton
                    icon={<DeleteIcon />}
                    colorScheme="red"
                    variant="ghost"
                    size="sm"
                    aria-label="删除记录"
                    title="删除记录"
                    onClick={() => handleDelete(index)}
                    onMouseEnter={(e) => buttonHoverAnimation(e.currentTarget, true)}
                    onMouseLeave={(e) => buttonHoverAnimation(e.currentTarget, false)}
                  />
                </HStack>
              </Flex>
            </Box>
          ))}
        </VStack>
      )}
    </Box>
  );
};

export default HistoryPanel;