import React, { useState, useEffect, useRef, memo } from 'react';
import {
  Box,
  VStack,
  Textarea,
  Text,
  Table,
  Thead,
  Tbody,
  Tr,
  Th,
  Td,
  Badge,
  HStack,
  Flex,
  Button,
  useToast,
  Alert,
  AlertIcon,
  IconButton,
  Divider
} from '@chakra-ui/react';
import { FaEdit, FaCopy, FaCheckCircle, FaPlus, FaTrash } from 'react-icons/fa';

const LINK_TEXT_MAP = {
  '1号链接': '条纹',
  '2号链接': '菱形方格',
  '3号链接': '硬丝',
  '4号链接': '平面',
  '7号链接': '流星毯',
  '8号链接': '丝圈',
  '14号链接': '宽条纹',
  '16号链接': '硅藻泥'
};

const SIZE_PRICE_LIST = [
  { size: '60*90', price: 18.8, link: '1号链接' },
  { size: '80*120', price: 28.8, link: '1号链接' },
  { size: '120*150', price: 68, link: '1号链接' },
  { size: '120*180', price: 78, link: '1号链接' },
  { size: '90*150', price: 49, link: '1号链接' },
  { size: '120*200', price: 88, link: '1号链接' },
  { size: '60*120', price: 25.8, link: '1号链接' },
  { size: '100*120', price: 42.8, link: '1号链接' },
  { size: '90*200', price: 68, link: '1号链接' },
  { size: '50*80', price: 13.9, link: '1号链接' },
  { size: '60*90', price: 39, link: '2号链接' },
  { size: '80*120', price: 69, link: '2号链接' },
  { size: '90*150', price: 98, link: '2号链接' },
  { size: '120*150', price: 135, link: '2号链接' },
  { size: '120*180', price: 158, link: '2号链接' },
  { size: '120*200', price: 178, link: '2号链接' },
  { size: '60*120', price: 54, link: '2号链接' },
  { size: '90*200', price: 135, link: '2号链接' },
  { size: '50*80', price: 29, link: '2号链接' },
  { size: '100*120', price: 95, link: '2号链接' },
  { size: '90*180', price: 125, link: '2号链接' },
  { size: '120*300', price: 268, link: '2号链接' },
  { size: '160*200', price: 238, link: '2号链接' },
  { size: '160*240', price: 288, link: '2号链接' },
  { size: '180*200', price: 268, link: '2号链接' },
  { size: '180*240', price: 318, link: '2号链接' },
  { size: '180*300', price: 398, link: '2号链接' },
  { size: '200*300', price: 438, link: '2号链接' },
  { size: '90*100', price: 65, link: '2号链接' },
  { size: '120*120', price: 118, link: '2号链接' },
  { size: '120*240', price: 215, link: '2号链接' },
  { size: '160*300', price: 358, link: '2号链接' },
  { size: '80*100', price: 65, link: '2号链接' },
  { size: '80*130', price: 75, link: '2号链接' },
  { size: '80*160', price: 98, link: '2号链接' },
  { size: '90*120', price: 78, link: '2号链接' },
  { size: '120*160', price: 145, link: '2号链接' },
  { size: '60*90', price: 48, link: '3号链接' },
  { size: '80*120', price: 75, link: '3号链接' },
  { size: '90*150', price: 118, link: '3号链接' },
  { size: '90*200', price: 162, link: '3号链接' },
  { size: '100*120', price: 108, link: '3号链接' },
  { size: '120*150', price: 162, link: '3号链接' },
  { size: '120*180', price: 195, link: '3号链接' },
  { size: '120*200', price: 216, link: '3号链接' },
  { size: '50*80', price: 38, link: '3号链接' },
  { size: '60*120', price: 65, link: '3号链接' },
  { size: '90*180', price: 145, link: '3号链接' },
  { size: '120*300', price: 324, link: '3号链接' },
  { size: '160*200', price: 288, link: '3号链接' },
  { size: '160*240', price: 345, link: '3号链接' },
  { size: '180*200', price: 324, link: '3号链接' },
  { size: '180*240', price: 388, link: '3号链接' },
  { size: '200*300', price: 538, link: '3号链接' },
  { size: '90*100', price: 81, link: '3号链接' },
  { size: '120*120', price: 128, link: '3号链接' },
  { size: '120*240', price: 258, link: '3号链接' },
  { size: '160*300', price: 432, link: '3号链接' },
  { size: '180*300', price: 485, link: '3号链接' },
  { size: '50*80', price: 29, link: '4号链接' },
  { size: '60*90', price: 39, link: '4号链接' },
  { size: '80*120', price: 69, link: '4号链接' },
  { size: '90*150', price: 98, link: '4号链接' },
  { size: '120*150', price: 135, link: '4号链接' },
  { size: '120*180', price: 158, link: '4号链接' },
  { size: '120*200', price: 178, link: '4号链接' },
  { size: '50*80', price: 39, link: '7号链接' },
  { size: '60*90', price: 54, link: '7号链接' },
  { size: '60*120', price: 69, link: '7号链接' },
  { size: '80*120', price: 96, link: '7号链接' },
  { size: '90*100', price: 88, link: '7号链接' },
  { size: '90*150', price: 135, link: '7号链接' },
  { size: '90*180', price: 162, link: '7号链接' },
  { size: '90*200', price: 179, link: '7号链接' },
  { size: '100*120', price: 118, link: '7号链接' },
  { size: '120*120', price: 144, link: '7号链接' },
  { size: '120*150', price: 178, link: '7号链接' },
  { size: '120*180', price: 216, link: '7号链接' },
  { size: '120*200', price: 238, link: '7号链接' },
  { size: '120*240', price: 288, link: '7号链接' },
  { size: '120*300', price: 358, link: '7号链接' },
  { size: '40*60', price: 18, link: '7号链接' },
  { size: '40*60', price: 19, link: '8号链接' },
  { size: '60*90', price: 43, link: '8号链接' },
  { size: '60*120', price: 58, link: '8号链接' },
  { size: '80*120', price: 76, link: '8号链接' },
  { size: '100*120', price: 96, link: '8号链接' },
  { size: '120*120', price: 115, link: '8号链接' },
  { size: '120*150', price: 144, link: '8号链接' },
  { size: '120*180', price: 172, link: '8号链接' },
  { size: '120*200', price: 192, link: '8号链接' },
  { size: '120*250', price: 240, link: '8号链接' },
  { size: '120*300', price: 288, link: '8号链接' },
  { size: '40*60', price: 12, link: '14号链接' },
  { size: '50*80', price: 20, link: '14号链接' },
  { size: '60*90', price: 27, link: '14号链接' },
  { size: '60*120', price: 36, link: '14号链接' },
  { size: '80*120', price: 48, link: '14号链接' },
  { size: '90*150', price: 68, link: '14号链接' },
  { size: '90*200', price: 90, link: '14号链接' },
  { size: '100*120', price: 60, link: '14号链接' },
  { size: '120*150', price: 90, link: '14号链接' },
  { size: '120*180', price: 108, link: '14号链接' },
  { size: '120*200', price: 120, link: '14号链接' },
  { size: '120*240', price: 144, link: '14号链接' },
  { size: '120*300', price: 180, link: '14号链接' },
  { size: '40*60', price: 50, link: '16号链接' },
  { size: '40*120', price: 50, link: '16号链接' },
  { size: '50*80', price: 50, link: '16号链接' },
  { size: '60*90', price: 50, link: '16号链接' },
  { size: '60*120', price: 50, link: '16号链接' },
  { size: '60*150', price: 50, link: '16号链接' },
  { size: '80*120', price: 50, link: '16号链接' },
  { size: '100*120', price: 50, link: '16号链接' },
  { size: '120*150', price: 50, link: '16号链接' },
  { size: '120*180', price: 50, link: '16号链接' },
  { size: '120*200', price: 50, link: '16号链接' }
];

const PREDEFINED_SIZES = {
  '1号链接': ['60*90', '80*120', '120*150', '120*180', '90*150', '120*200', '60*120', '100*120', '90*200', '50*80'],
  '2号链接': ['60*90', '80*120', '90*150', '120*150', '120*180', '120*200', '60*120', '90*200', '50*80', '120*100', '90*180', '120*300', '160*200', '160*240', '180*200', '180*240', '180*300', '200*300', '90*100', '120*120', '120*240', '160*300', '80*100', '80*130', '80*160', '90*120', '120*160'],
  '3号链接': ['60*90', '80*120', '90*150', '90*200', '120*100', '120*150', '120*180', '120*200', '50*80', '60*120', '90*180', '120*300', '160*200', '160*240', '180*200', '180*240', '200*300', '90*100', '120*120', '120*240', '160*300', '180*300'],
  '4号链接': ['50*80', '60*90', '80*120', '90*150', '120*150', '120*180', '120*200'],
  '7号链接': ['50*80', '60*90', '60*120', '80*120', '90*100', '90*150', '90*180', '90*200', '100*120', '120*120', '120*150', '120*180', '120*200', '120*240', '120*300', '40*60'],
  '8号链接': ['40*60', '60*90', '60*120', '80*120', '100*120', '120*120', '120*150', '120*180', '120*200', '120*250', '120*300'],
  '14号链接': ['40*60', '50*80', '60*90', '60*120', '80*120', '90*150', '90*200', '100*120', '120*150', '120*180', '120*200', '120*240', '120*300'],
  '16号链接': ['40*60', '40*120', '50*80', '60*90', '60*120', '60*150', '80*120', '100*120', '120*150', '120*180', '120*200']
};

const WEIGHT_RULES = {
  '1': 2.2,
  '2': { default: 2.3, heavy: 3 },
  '3': 3
};

const SizeCalculator = memo(({ selectedProduct, customPrice, onCalculationComplete, onDimensionsChange, value }) => {
  const [dimensions, setDimensions] = useState(value || '');
  const [calculationResults, setCalculationResults] = useState([]);
  const [totalCount, setTotalCount] = useState(0);
  const [totalArea, setTotalArea] = useState(0);
  const [totalPrice, setTotalPrice] = useState(0);
  const [totalWeight, setTotalWeight] = useState(0);
  const [showWidthAlert, setShowWidthAlert] = useState(false);
  const [showBlackEdgeAlert, setShowBlackEdgeAlert] = useState(false);
  const [matchedLinks, setMatchedLinks] = useState([]);
  const [weight2Option, setWeight2Option] = useState('default');
  const [sizeRecommendations, setSizeRecommendations] = useState([]);
  const [useReadyMadePrice, setUseReadyMadePrice] = useState(true);
  const [multiProducts, setMultiProducts] = useState([]);
  const [showMultiProductPanel, setShowMultiProductPanel] = useState(false);

  const toast = useToast();
  const textareaRef = useRef(null);
  const prevTotalPriceRef = useRef(0);

  useEffect(() => {
    if (value !== undefined && value !== dimensions) {
      setDimensions(value);
    }
  }, [value]);

  useEffect(() => {
    calculatePrice();
  }, [dimensions, selectedProduct, customPrice, weight2Option, useReadyMadePrice]);

  useEffect(() => {
    if (prevTotalPriceRef.current === 0 && totalPrice > 0) {
      updateCalculationCount();
    }
    prevTotalPriceRef.current = totalPrice;
  }, [totalPrice]);

  useEffect(() => {
    const handleKeyDown = (e) => {
      if (e.key === 'Insert') {
        e.preventDefault();
        copyTotalPrice();
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [totalPrice, calculationResults]);

  const updateCalculationCount = () => {
    const currentCount = localStorage.getItem('calculationCount');
    const newCount = currentCount ? parseInt(currentCount, 10) + 1 : 26;
    localStorage.setItem('calculationCount', newCount.toString());
    window.dispatchEvent(new CustomEvent('calculationUpdated'));
  };

  const parseDimensions = (input) => {
    if (!input.trim()) return [];
    const lines = input.split('\n');
    const parsed = [];
    lines.forEach(line => {
      const trimmed = line.trim();
      if (!trimmed) return;
      if (!trimmed.includes('*')) {
        parsed.push({ width: 0, length: 0, valid: false, raw: trimmed, quantity: 0, displaySize: trimmed });
        return;
      }
      const parts = trimmed.split('*');
      if (parts.length === 2 || parts.length === 3) {
        const width = parseFloat(parts[0]) || 0;
        const length = parseFloat(parts[1]) || 0;
        const quantity = parts.length === 3 ? (parseInt(parts[2]) || 0) : 1;
        const displaySize = `${width}*${length}`;
        parsed.push({ width, length, valid: width > 0 && length > 0 && quantity > 0, raw: trimmed, quantity, displaySize });
      } else {
        parsed.push({ width: 0, length: 0, valid: false, raw: trimmed, quantity: 0, displaySize: trimmed });
      }
    });
    return parsed;
  };

  const getLinkDisplayText = (linkName) => LINK_TEXT_MAP[linkName] || linkName;

  const findReadyMadePrice = (width, length, productName) => {
    if (!useReadyMadePrice || !selectedProduct) return null;
    const sizeStr = `${width}*${length}`;
    let targetLink = null;
    if (productName.match(/^1\./)) targetLink = '1号链接';
    else if (productName.match(/^2\./)) targetLink = '2号链接';
    else if (productName.match(/^3\./)) targetLink = '3号链接';
    else if (productName.match(/^4\./)) targetLink = '4号链接';
    else if (productName.match(/^7\./)) targetLink = '7号链接';
    else if (productName.match(/^8\./)) targetLink = '8号链接';
    else if (productName.match(/^14\./)) targetLink = '14号链接';
    else if (productName.match(/^16\./)) targetLink = '16号链接';
    if (!targetLink) return null;
    const matchedItem = SIZE_PRICE_LIST.find(item => item.size === sizeStr && item.link === targetLink);
    return matchedItem ? matchedItem.price : null;
  };

  const findSizeRecommendations = (inputDimensions) => {
    const recommendations = [];
    inputDimensions.forEach(dim => {
      if (!dim.valid) return;
      const exactMatches = SIZE_PRICE_LIST.filter(item => item.size === `${dim.width}*${dim.length}`);
      if (exactMatches.length > 0) {
        recommendations.push({
          inputSize: dim.raw,
          recommendedSize: `${dim.width}*${dim.length}`,
          matches: exactMatches.map(match => ({ link: getLinkDisplayText(match.link), price: match.price })),
          difference: 0,
          isExactMatch: true
        });
        return;
      }
      const closeMatches = [];
      let minDiff = Infinity;
      SIZE_PRICE_LIST.forEach(item => {
        const [existWidth, existLength] = item.size.split('*').map(Number);
        const widthDiff = Math.abs(existWidth - dim.width);
        const lengthDiff = Math.abs(existLength - dim.length);
        if (lengthDiff === 0 && widthDiff < 4 && widthDiff > 0) {
          if (widthDiff < minDiff) {
            minDiff = widthDiff;
            closeMatches.length = 0;
            closeMatches.push({ size: item.size, link: getLinkDisplayText(item.link), price: item.price });
          } else if (widthDiff === minDiff) {
            closeMatches.push({ size: item.size, link: getLinkDisplayText(item.link), price: item.price });
          }
        }
      });
      if (closeMatches.length > 0) {
        const groupedMatches = closeMatches.reduce((acc, match) => {
          const existing = acc.find(item => item.size === match.size);
          if (existing) {
            existing.matches.push({ link: match.link, price: match.price });
          } else {
            acc.push({ size: match.size, matches: [{ link: match.link, price: match.price }] });
          }
          return acc;
        }, []);
        groupedMatches.forEach(group => {
          recommendations.push({ inputSize: dim.raw, recommendedSize: group.size, matches: group.matches, difference: minDiff, isExactMatch: false });
        });
      }
    });
    return recommendations;
  };

  const calculatePrice = () => {
    const parsedDimensions = parseDimensions(dimensions);
    if (parsedDimensions.length === 0) {
      setCalculationResults([]);
      setTotalCount(0);
      setTotalArea(0);
      setTotalPrice(0);
      setShowWidthAlert(false);
      setShowBlackEdgeAlert(false);
      setMatchedLinks([]);
      setSizeRecommendations([]);
      return;
    }
    setSizeRecommendations(findSizeRecommendations(parsedDimensions));
    const matched = [];
    parsedDimensions.forEach(dim => {
      if (dim.valid) {
        Object.entries(PREDEFINED_SIZES).forEach(([linkName, sizes]) => {
          if (sizes.includes(`${dim.width}*${dim.length}`)) {
            if (!matched.find(m => m.linkName === linkName && m.size === `${dim.width}*${dim.length}`)) {
              matched.push({ linkName, displayText: getLinkDisplayText(linkName), size: `${dim.width}*${dim.length}` });
            }
          }
        });
      }
    });
    setMatchedLinks(matched);
    let currentPrice = 0;
    if (customPrice && customPrice > 0) {
      currentPrice = customPrice;
    } else if (selectedProduct && selectedProduct.custom) {
      currentPrice = selectedProduct.price;
    }
    if (currentPrice === 0 && !customPrice) {
      const results = parsedDimensions.map(dim => ({ ...dim, area: dim.valid ? (dim.width * dim.length) / 10000 : 0, price: 0, error: !selectedProduct ? '请选择产品' : '不支持定制' }));
      setCalculationResults(results);
      setTotalCount(0);
      setTotalArea(0);
      setTotalPrice(0);
      setShowWidthAlert(false);
      return;
    }
    let validCount = 0;
    let sumArea = 0;
    let sumPrice = 0;
    let hasWidthError = false;
    let hasBlackEdgeWidth = false;
    const isProduct1 = selectedProduct && selectedProduct.name.match(/^1\./);
    const results = parsedDimensions.map(dim => {
      if (!dim.valid) {
        return { ...dim, area: 0, price: 0, error: '无效尺寸' };
      }
      const area = (dim.width * dim.length) / 10000;
      const maxWidth = selectedProduct?.maxWidth || 200;
      if (dim.width > maxWidth) {
        hasWidthError = true;
      }
      if (isProduct1 && (dim.width === 120 || dim.width === 200)) {
        hasBlackEdgeWidth = true;
      }
      let effectivePrice = currentPrice;
      let specialPrice = null;
      let isReadyMade = false;
      const readyMadePrice = findReadyMadePrice(dim.width, dim.length, selectedProduct?.name || '');
      if (readyMadePrice !== null) {
        effectivePrice = readyMadePrice / area;
        specialPrice = readyMadePrice;
        isReadyMade = true;
      } else if (isProduct1 && !customPrice) {
        if (dim.width < 70) {
          effectivePrice = 45;
          specialPrice = 45;
        } else {
          effectivePrice = 40;
        }
      }
      const itemQuantity = dim.quantity || 1;
      const price = isReadyMade ? (specialPrice * itemQuantity) : (area * effectivePrice * itemQuantity);
      validCount += itemQuantity;
      sumArea += area * itemQuantity;
      sumPrice += parseFloat(price.toFixed(4));
      return { ...dim, area: area * itemQuantity, price, specialPrice, isReadyMade, error: null };
    });
    setCalculationResults(results);
    setTotalCount(validCount);
    setTotalArea(sumArea);
    setTotalPrice(sumPrice);
    setShowWidthAlert(hasWidthError);
    setShowBlackEdgeAlert(hasBlackEdgeWidth);
    let calcTotalWeight = 0;
    if (selectedProduct && sumArea > 0) {
      const productNumber = selectedProduct.name.match(/^(\d+)\./)?.[1];
      if (productNumber && WEIGHT_RULES[productNumber]) {
        const weightPerSqm = productNumber === '2' ? WEIGHT_RULES[productNumber][weight2Option] : WEIGHT_RULES[productNumber];
        calcTotalWeight = sumArea * weightPerSqm;
      }
    }
    setTotalWeight(calcTotalWeight);
    if (onCalculationComplete && validCount > 0) {
      onCalculationComplete({
        productName: selectedProduct ? selectedProduct.name : '自定义价格',
        dimensions: parsedDimensions.filter(d => d.valid).map(d => `${d.raw}${d.quantity > 1 ? `*${d.quantity}` : ''}`).join(', '),
        totalPrice: Math.floor(sumPrice),
        dimensionInput: dimensions,
        productData: selectedProduct,
        customPrice: customPrice
      });
    }
    if (validCount > 0 && sumPrice > 0) {
      const validSizes = parsedDimensions.filter(dim => dim.valid).map(dim => {
        const quantityText = dim.quantity > 1 ? `*${dim.quantity}` : '';
        return `${dim.displaySize}${quantityText}`;
      }).join(', ');
      const priceText = validSizes ? `${validSizes} 价格是${Math.floor(sumPrice)}元` : `价格是${Math.floor(sumPrice)}元`;
      navigator.clipboard.writeText(priceText).then(() => {
        console.log('价格已自动复制到剪贴板');
      }).catch((err) => {
        console.error('自动复制失败:', err);
      });
    }
  };

  const handleDimensionsChange = (e) => {
    const newVal = e.target.value;
    setDimensions(newVal);
    if (onDimensionsChange) onDimensionsChange(newVal);
  };

  const addToMultiProduct = () => {
    if (!selectedProduct && (!customPrice || customPrice <= 0)) {
      toast({ title: '请选择产品或输入自定义价格', status: 'warning', duration: 2000, isClosable: true, position: 'top-right' });
      return;
    }
    if (totalCount === 0 || totalPrice === 0) {
      toast({ title: '请先计算当前产品价格', description: '输入尺寸并确保计算结果有效', status: 'warning', duration: 2000, isClosable: true, position: 'top-right' });
      return;
    }
    let productWeight = 0;
    if (selectedProduct && totalArea > 0) {
      const productNumber = selectedProduct.name.match(/^(\d+)\./)?.[1];
      if (productNumber && WEIGHT_RULES[productNumber]) {
        const weightPerSqm = productNumber === '2' ? WEIGHT_RULES[productNumber][weight2Option] : WEIGHT_RULES[productNumber];
        productWeight = totalArea * weightPerSqm;
      }
    }
    const newProduct = {
      id: Date.now(),
      productName: selectedProduct ? selectedProduct.name : '自定义产品',
      dimensions: dimensions,
      quantity: totalCount,
      totalArea: totalArea,
      totalWeight: productWeight,
      pricePerSqm: customPrice > 0 ? customPrice : (selectedProduct ? selectedProduct.price : 0),
      totalPrice: totalPrice,
      timestamp: new Date().toLocaleTimeString()
    };
    setMultiProducts([...multiProducts, newProduct]);
    setShowMultiProductPanel(true);
    updateCalculationCount();
    toast({ title: '已添加到多产品计算', description: `${newProduct.quantity} 个尺寸，总价 ¥${Math.floor(newProduct.totalPrice)}`, status: 'success', duration: 2000, isClosable: true, position: 'top-right', icon: <FaCheckCircle /> });
  };

  const removeMultiProduct = (id) => {
    setMultiProducts(multiProducts.filter(p => p.id !== id));
    toast({ title: '产品已移除', status: 'info', duration: 2000, isClosable: true, position: 'top-right' });
  };

  const clearMultiProducts = () => {
    if (window.confirm('确定要清空所有产品吗？')) {
      setMultiProducts([]);
      toast({ title: '已清空列表', status: 'success', duration: 2000, isClosable: true, position: 'top-right' });
    }
  };

  const multiProductGrandTotal = multiProducts.reduce((sum, p) => sum + p.totalPrice, 0);
  const multiProductTotalQuantity = multiProducts.reduce((sum, p) => sum + p.quantity, 0);
  const multiProductTotalArea = multiProducts.reduce((sum, p) => sum + p.totalArea, 0);
  const multiProductTotalWeight = multiProducts.reduce((sum, p) => sum + (p.totalWeight || 0), 0);

  const copyAllPrices = () => {
    if (calculationResults.length === 0) return;
    let copyText = '';
    calculationResults.forEach(result => {
      if (result.valid && !result.error && result.price > 0) {
        const quantityText = result.quantity > 1 ? `*${result.quantity}` : '';
        copyText += `${result.raw}${quantityText}=${result.price.toFixed(2)} `;
      }
    });
    copyText += `${totalCount}张 价格是${Math.floor(totalPrice)}元`;
    navigator.clipboard.writeText(copyText).then(() => {
      toast({ title: '复制成功', status: 'success', duration: 2000, isClosable: true, position: 'top-right' });
    });
  };

  const copyTotalPrice = () => {
    if (totalPrice === 0) return;
    const validSizes = calculationResults.filter(result => result.valid && !result.error).map(result => {
      const quantityText = result.quantity > 1 ? `*${result.quantity}` : '';
      return `${result.displaySize}${quantityText}`;
    }).join(', ');
    const priceText = validSizes ? `${validSizes} 价格是${Math.floor(totalPrice)}元` : `价格是${Math.floor(totalPrice)}元`;
    navigator.clipboard.writeText(priceText).then(() => {
      toast({ title: '价格已复制', status: 'success', duration: 2000, isClosable: true, position: 'top-right' });
    });
  };

  const copyMultiProductTotal = () => {
    if (multiProducts.length === 0) return;
    navigator.clipboard.writeText(`总价格是${Math.floor(multiProductGrandTotal)}元`).then(() => {
      toast({ title: '多产品总价已复制', status: 'success', duration: 2000, isClosable: true, position: 'top-right' });
    });
  };

  return (
    <VStack spacing={6} align="stretch">
      <Box>
        <HStack spacing={3} mb={3} justify="space-between">
          <HStack spacing={3}>
            <FaEdit color="#3B82F6" size={20} />
            <Text fontSize="15px" fontWeight="500" color="gray.700">尺寸输入 (厘米)</Text>
          </HStack>
          <Button size="sm" colorScheme={useReadyMadePrice ? 'green' : 'gray'} variant={useReadyMadePrice ? 'solid' : 'outline'} onClick={() => setUseReadyMadePrice(!useReadyMadePrice)}>
            {useReadyMadePrice ? '✓ 现成价格' : '已关闭现成价格'}
          </Button>
        </HStack>
        <Textarea ref={textareaRef} value={dimensions} onChange={handleDimensionsChange} placeholder="每行输入一个尺寸，格式：宽*长 或 宽*长*数量&#10;例如：&#10;120*150&#10;90*200*3" minH="140px" bg="gray.50" border="1px solid" borderColor="gray.200" _hover={{ borderColor: 'blue.300' }} _focus={{ borderColor: 'blue.500', boxShadow: '0 0 0 1px #3B82F6', bg: 'white' }} />
        <HStack justify="space-between" mt={2}>
          <Text fontSize="13px" color="gray.500">每行输入一个尺寸，格式：宽*长 或 宽*长*数量</Text>
          <Button leftIcon={<FaPlus />} size="sm" colorScheme="teal" onClick={addToMultiProduct}>添加到多产品</Button>
        </HStack>
      </Box>

      {showWidthAlert && (
        <Alert status="warning" borderRadius="8px">
          <AlertIcon />
          <Text fontSize="14px">注意：宽超过 {selectedProduct?.maxWidth || 200} 厘米 需要拼接</Text>
        </Alert>
      )}

      {showBlackEdgeAlert && (
        <Alert status="warning" borderRadius="8px" bg="orange.50" borderColor="orange.300" border="1px solid">
          <AlertIcon color="orange.500" />
          <Text fontSize="14px" fontWeight="600" color="orange.700">⚠️ 提示：此宽度需要做黑边</Text>
        </Alert>
      )}

      {sizeRecommendations.length > 0 && (
        <Alert status="info" borderRadius="8px" bg="green.50" borderColor="green.200" border="1px solid">
          <AlertIcon color="green.500" />
          <VStack align="stretch" spacing={2} w="100%">
            <Text fontSize="14px" fontWeight="600" color="green.700">💡 尺寸推荐：发现标准尺寸</Text>
            <Box>
              {sizeRecommendations.map((rec, index) => (
                <VStack key={index} align="stretch" spacing={1} mb={3}>
                  <HStack spacing={2} flexWrap="wrap">
                    <Badge colorScheme="orange" fontSize="xs" px={2} py={1}>{rec.inputSize}</Badge>
                    <Text fontSize="13px" color={rec.isExactMatch ? "green.700" : "gray.600"} fontWeight={rec.isExactMatch ? "600" : "normal"}>
                      {rec.isExactMatch ? "✓ 完全匹配" : "→ 推荐"}
                    </Text>
                    <Badge colorScheme="green" fontSize="xs" px={2} py={1}>{rec.recommendedSize}</Badge>
                    {!rec.isExactMatch && <Text fontSize="12px" color="gray.500">(差值 {rec.difference}cm)</Text>}
                  </HStack>
                  <Box pl={4}>
                    {rec.matches.map((match, idx) => (
                      <HStack key={idx} spacing={2} mb={1}>
                        <Badge colorScheme="blue" fontSize="xs" px={2} py={1}>{match.link}</Badge>
                        <Badge colorScheme="red" fontSize="xs" px={2} py={1}>¥{match.price}</Badge>
                      </HStack>
                    ))}
                  </Box>
                </VStack>
              ))}
            </Box>
          </VStack>
        </Alert>
      )}

      {calculationResults.length > 0 && (
        <Box>
          <Flex justify="space-between" align="center" mb={4}>
            <Text fontSize="15px" fontWeight="600" color="gray.700">计算结果</Text>
            {(customPrice > 0 || (selectedProduct && selectedProduct.price > 0)) && (
              <Badge colorScheme={customPrice > 0 ? "purple" : (useReadyMadePrice ? "green" : "blue")} fontSize="sm" px={3} py={1} borderRadius="full">
                {customPrice > 0 ? `自定义价格: ¥${customPrice}/㎡` : (useReadyMadePrice ? `现成价格模式` : `产品价格: ¥${selectedProduct.price}/㎡`)}
              </Badge>
            )}
          </Flex>
          <Box overflowX="auto" border="1px solid" borderColor="gray.200" borderRadius="8px">
            <Table size="sm" variant="simple">
              <Thead bg="gray.50">
                <Tr>
                  <Th textAlign="center">尺寸</Th>
                  <Th textAlign="center">数量</Th>
                  <Th textAlign="center">面积</Th>
                  <Th textAlign="center">单价</Th>
                  <Th textAlign="center">总价</Th>
                </Tr>
              </Thead>
              <Tbody>
                {calculationResults.map((result, index) => (
                  <Tr key={index} _hover={{ bg: 'blue.50' }}>
                    <Td textAlign="center" fontWeight="500">{result.displaySize || result.raw}</Td>
                    <Td textAlign="center"><Badge colorScheme="blue" fontSize="xs">{result.quantity || 1} 张</Badge></Td>
                    <Td textAlign="center">{result.valid ? `${result.area.toFixed(2)} ㎡` : <Badge colorScheme="red">无效</Badge>}</Td>
                    <Td textAlign="center">
                      {(customPrice > 0 || (selectedProduct?.price > 0)) ? (
                        <HStack spacing={1} justify="center">
                          <Text fontWeight="500">¥{result.specialPrice || customPrice || selectedProduct.price}</Text>
                          {result.isReadyMade && <Badge colorScheme="green" fontSize="xs">现成</Badge>}
                          {result.specialPrice && !result.isReadyMade && <Badge colorScheme="purple" fontSize="xs">特定</Badge>}
                        </HStack>
                      ) : '-'}
                    </Td>
                    <Td textAlign="center">
                      {result.error ? <Badge colorScheme="red">{result.error}</Badge> : <Text fontWeight="600" color="red.500">¥{result.price.toFixed(2)}</Text>}
                    </Td>
                  </Tr>
                ))}
              </Tbody>
            </Table>
          </Box>
          <VStack spacing={4} mt={6} p={5} bg="gray.50" borderRadius="8px" border="1px solid" borderColor="gray.200">
            <Flex w="100%" justify="space-between"><Text color="gray.600">总数量:</Text><Text fontWeight="600">{totalCount} 张</Text></Flex>
            <Flex w="100%" justify="space-between"><Text color="gray.600">总面积:</Text><Text fontWeight="600">{totalArea > 0 ? `${totalArea.toFixed(2)} ㎡` : '-'}</Text></Flex>
            {selectedProduct && totalArea > 0 && WEIGHT_RULES[selectedProduct.name.match(/^(\d+)\./)?.[1]] && (
              <Flex w="100%" justify="space-between" align="center">
                <Text color="gray.600">总重量:</Text>
                <HStack>
                  <Text fontWeight="600">{totalWeight > 0 ? `${totalWeight.toFixed(2)} kg` : '-'}</Text>
                  {selectedProduct.name.startsWith('2.') && (
                    <HStack spacing={1}>
                      <Button size="xs" colorScheme={weight2Option === 'default' ? 'blue' : 'gray'} onClick={() => setWeight2Option('default')}>2.3</Button>
                      <Button size="xs" colorScheme={weight2Option === 'heavy' ? 'blue' : 'gray'} onClick={() => setWeight2Option('heavy')}>3.0</Button>
                    </HStack>
                  )}
                </HStack>
              </Flex>
            )}
            <Flex w="100%" justify="space-between" pt={3} borderTop="2px solid" borderColor="blue.300" cursor={totalPrice > 0 ? 'pointer' : 'default'} onClick={totalPrice > 0 ? copyTotalPrice : undefined} _hover={totalPrice > 0 ? { bg: 'blue.50' } : {}}>
              <Text fontSize="16px" fontWeight="600" color="gray.700">总价格:</Text>
              <HStack><Text fontSize="22px" fontWeight="700" color="red.500">{totalPrice > 0 ? `¥${totalPrice.toFixed(2)}` : '-'}</Text><FaCopy color="#999" /></HStack>
            </Flex>
            {totalCount > 0 && <Button leftIcon={<FaCopy />} colorScheme="blue" w="100%" onClick={copyAllPrices}>复制所有尺寸价格</Button>}
          </VStack>
        </Box>
      )}

      {calculationResults.length === 0 && (
        <Box py={12} textAlign="center" color="gray.400" border="1px dashed" borderColor="gray.300" borderRadius="8px">
          <Text fontSize="lg" fontWeight="500">请输入尺寸</Text>
          <Text fontSize="sm">输入尺寸并选择产品以查看计算结果</Text>
        </Box>
      )}

      {showMultiProductPanel && multiProducts.length > 0 && (
        <Box p={6} bg="teal.50" borderRadius="12px" border="2px solid" borderColor="teal.200" mt={6}>
          <Flex justify="space-between" mb={4}>
            <HStack><FaPlus color="#319795" /><Text fontWeight="600" color="teal.700">多产品汇总</Text><Badge colorScheme="teal">{multiProducts.length} 个产品</Badge></HStack>
            <Button leftIcon={<FaTrash />} colorScheme="red" variant="outline" size="sm" onClick={clearMultiProducts}>清空列表</Button>
          </Flex>
          <Divider mb={4} borderColor="teal.300" />
          <Box overflowX="auto" border="1px solid" borderColor="teal.200" borderRadius="8px" bg="white">
            <Table variant="simple" size="sm">
              <Thead bg="teal.100">
                <Tr><Th>产品名称</Th><Th textAlign="center">数量</Th><Th textAlign="center">单价</Th><Th textAlign="center">总面积</Th><Th textAlign="center">重量</Th><Th textAlign="center">总价</Th><Th textAlign="center">操作</Th></Tr>
              </Thead>
              <Tbody>
                {multiProducts.map((p) => (
                  <Tr key={p.id}>
                    <Td>{p.productName}</Td>
                    <Td textAlign="center">{p.quantity}</Td>
                    <Td textAlign="center">¥{p.pricePerSqm}</Td>
                    <Td textAlign="center">{p.totalArea.toFixed(2)}</Td>
                    <Td textAlign="center">{p.totalWeight ? p.totalWeight.toFixed(2) : '-'}</Td>
                    <Td textAlign="center" fontWeight="600" color="red.500">¥{p.totalPrice.toFixed(2)}</Td>
                    <Td textAlign="center"><IconButton icon={<FaTrash />} size="sm" colorScheme="red" variant="ghost" onClick={() => removeMultiProduct(p.id)} /></Td>
                  </Tr>
                ))}
              </Tbody>
            </Table>
          </Box>
          <Box p={5} bg="white" mt={4} borderRadius="8px" border="1px solid" borderColor="teal.200">
            <VStack spacing={3}>
              <Flex w="100%" justify="space-between"><Text color="gray.600">总数量:</Text><Text fontWeight="600">{multiProductTotalQuantity} 张</Text></Flex>
              <Flex w="100%" justify="space-between"><Text color="gray.600">总面积:</Text><Text fontWeight="600">{multiProductTotalArea.toFixed(2)} ㎡</Text></Flex>
              <Flex w="100%" justify="space-between"><Text color="gray.600">总重量:</Text><Text fontWeight="600">{multiProductTotalWeight.toFixed(2)} kg</Text></Flex>
              <Divider />
              <Flex w="100%" justify="space-between" onClick={copyMultiProductTotal} cursor="pointer" _hover={{ bg: 'teal.50' }}>
                <Text fontWeight="600" color="gray.700">合计总价:</Text>
                <HStack><Text fontSize="24px" fontWeight="700" color="teal.600">¥{multiProductGrandTotal.toFixed(2)}</Text><FaCopy color="#319795" /></HStack>
              </Flex>
            </VStack>
          </Box>
        </Box>
      )}
    </VStack>
  );
}, (prev, next) => prev.selectedProduct === next.selectedProduct && prev.customPrice === next.customPrice && prev.value === next.value);

SizeCalculator.displayName = 'SizeCalculator';
export default SizeCalculator;