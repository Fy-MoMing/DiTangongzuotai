import React, { useState } from 'react';
import {
  Box,
  Input,
  Button,
  Text,
  HStack,
  VStack,
  useToast,
  InputGroup,
  InputRightElement,
  Badge,
  Tooltip
} from '@chakra-ui/react';
import { FaArrowRight, FaMagic, FaEraser, FaInfoCircle } from 'react-icons/fa';

/**
 * DimensionParser 组件
 * 用于解析形如 '103+177*252+113' 的尺寸算式
 * 输出格式为 '总宽*总长' (例如 '280*365')
 */
const DimensionParser = ({ onParseResult }) => {
  const [expression, setExpression] = useState('');
  const toast = useToast();

  const handleParse = () => {
    if (!expression.trim()) {
      toast({
        title: '请输入算式',
        status: 'warning',
        duration: 2000,
        isClosable: true,
        position: 'top-right'
      });
      return;
    }

    try {
      // 1. 预处理：移除所有空格
      const cleanExpr = expression.replace(/\s/g, '');
      
      // 2. 验证格式：仅允许数字、加号、乘号、点
      if (!/^[\d\+\.\*]+$/.test(cleanExpr)) {
        throw new Error('包含无效字符，仅支持数字、+、*、.');
      }

      // 3. 按 * 分割维度 (例如：宽*长)
      // 支持多维度，不限于2个
      const parts = cleanExpr.split('*');
      
      // 4. 计算每个维度的总和
      const results = parts.map(part => {
        // 防止空字符串导致错误 (例如 100*)
        if (!part) return 0;
        
        // 分割加法部分并求和
        const sum = part.split('+').reduce((acc, curr) => {
          if (!curr) return acc;
          const num = parseFloat(curr);
          if (isNaN(num)) throw new Error('数字格式错误');
          return acc + num;
        }, 0);
        
        // 处理浮点数精度问题，保留2位小数并转回数字（去除多余0）
        return parseFloat(sum.toFixed(2));
      });

      // 5. 重新组合为字符串
      const resultString = results.join('*');

      toast({
        title: '解析成功',
        description: `${expression} = ${resultString}`,
        status: 'success',
        duration: 2000,
        isClosable: true,
        position: 'top-right'
      });

      // 调用父组件回调，传递解析结果
      if (onParseResult) {
        onParseResult(resultString);
      }
      
    } catch (error) {
      console.error(error);
      toast({
        title: '解析失败',
        description: '格式错误，请使用如: 103+177*252+113',
        status: 'error',
        duration: 3000,
        isClosable: true,
        position: 'top-right'
      });
    }
  };

  const handleKeyPress = (e) => {
    if (e.key === 'Enter') {
      handleParse();
    }
  };

  const handleClear = () => {
    setExpression('');
  };

  return (
    <Box 
      bg="white" 
      p={5} 
      borderRadius="12px" 
      boxShadow="0 2px 8px rgba(0, 0, 0, 0.08)"
      border="1px solid"
      borderColor="gray.200"
      mb={6}
      transition="all 0.2s"
      _hover={{ boxShadow: "0 4px 12px rgba(0, 0, 0, 0.12)" }}
    >
      <HStack spacing={2} mb={3} justify="space-between">
        <HStack>
          <FaMagic color="#805AD5" />
          <Text fontSize="md" fontWeight="600" color="gray.700">
            智能尺寸算式解析
          </Text>
          <Badge colorScheme="purple" fontSize="xs" borderRadius="full" px={2}>NEW</Badge>
        </HStack>
        <Tooltip label="支持输入如 '100+50*200+30' 的算式，自动计算为 '150*230'" placement="top">
          <Box as="span" color="gray.400" cursor="help">
            <FaInfoCircle size={14} />
          </Box>
        </Tooltip>
      </HStack>
      
      <VStack spacing={3} align="stretch">
        <HStack spacing={2}>
          <InputGroup size="md">
            <Input
              placeholder="输入算式，如: 103+177*252+113"
              value={expression}
              onChange={(e) => setExpression(e.target.value)}
              onKeyPress={handleKeyPress}
              bg="gray.50"
              border="1px solid"
              borderColor="gray.200"
              _focus={{
                borderColor: 'purple.500',
                boxShadow: '0 0 0 1px #805AD5',
                bg: 'white'
              }}
              borderRadius="md"
            />
            {expression && (
              <InputRightElement width="3rem">
                <Button 
                  h="1.75rem" 
                  size="sm" 
                  onClick={handleClear} 
                  variant="ghost" 
                  color="gray.400"
                  _hover={{ color: "red.500", bg: "red.50" }}
                  aria-label="清空输入"
                >
                  <FaEraser />
                </Button>
              </InputRightElement>
            )}
          </InputGroup>
          <Button 
            leftIcon={<FaArrowRight />} 
            colorScheme="purple" 
            onClick={handleParse}
            px={6}
            shadow="sm"
            _hover={{ transform: 'translateY(-1px)', shadow: 'md' }}
            _active={{ transform: 'translateY(0)' }}
          >
            解析
          </Button>
        </HStack>
        
        <Text fontSize="xs" color="gray.500">
          <Text as="span" fontWeight="600" color="purple.600">支持格式：</Text> 
          宽分段+宽分段*长分段+长分段 (例如：103+177*252+113 → 280*365)
        </Text>
      </VStack>
    </Box>
  );
};

export default DimensionParser;