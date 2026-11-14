// 尺寸数据解析工具
// 用于处理从外部文件加载的地毯尺寸表数据

/**
 * 解析尺寸表文本数据
 * @param {string} text - 从文件加载的原始文本数据
 * @returns {Array} 解析后的尺寸数据数组
 */
export const parseSizeData = (text) => {
  if (!text || typeof text !== 'string') {
    console.error('Invalid text data provided');
    return [];
  }

  try {
    const lines = text.split('\n').filter((line) => line.trim() !== '');
    const parsedData = [];

    lines.forEach((line) => {
      const trimmedLine = line.trim();
      if (!trimmedLine) return;

      // 解析格式：尺寸,商品名称
      const parts = trimmedLine.split(',').map((item) => item.trim());
      
      if (parts.length >= 2) {
        const size = parts[0];
        const product = parts[1];

        if (size && product) {
          parsedData.push({
            size,
            product,
            raw: trimmedLine
          });
        }
      }
    });

    return parsedData;
  } catch (error) {
    console.error('Error parsing size data:', error);
    return [];
  }
};

/**
 * 按商品分组尺寸数据
 * @param {Array} sizeData - 解析后的尺寸数据
 * @returns {Object} 按商品分组的尺寸数据
 */
export const groupByProduct = (sizeData) => {
  if (!Array.isArray(sizeData)) {
    console.error('Invalid size data array');
    return {};
  }

  const grouped = {};

  sizeData.forEach((item) => {
    const { product, size } = item;
    
    if (!grouped[product]) {
      grouped[product] = [];
    }

    grouped[product].push(size);
  });

  return grouped;
};

/**
 * 按尺寸分组商品数据
 * @param {Array} sizeData - 解析后的尺寸数据
 * @returns {Object} 按尺寸分组的商品数据
 */
export const groupBySize = (sizeData) => {
  if (!Array.isArray(sizeData)) {
    console.error('Invalid size data array');
    return {};
  }

  const grouped = {};

  sizeData.forEach((item) => {
    const { size, product } = item;
    
    if (!grouped[size]) {
      grouped[size] = [];
    }

    // 避免重复添加相同的商品
    if (!grouped[size].includes(product)) {
      grouped[size].push(product);
    }
  });

  return grouped;
};

/**
 * 获取所有唯一的尺寸
 * @param {Array} sizeData - 解析后的尺寸数据
 * @returns {Array} 唯一尺寸数组
 */
export const getUniqueSizes = (sizeData) => {
  if (!Array.isArray(sizeData)) {
    console.error('Invalid size data array');
    return [];
  }

  const sizes = new Set();
  
  sizeData.forEach((item) => {
    if (item.size) {
      sizes.add(item.size);
    }
  });

  return Array.from(sizes).sort((a, b) => {
    // 按数字大小排序
    const parseSize = (size) => {
      const match = size.match(/(\d+)\*(\d+)/);
      if (match) {
        return parseInt(match[1]) * parseInt(match[2]);
      }
      return 0;
    };
    return parseSize(a) - parseSize(b);
  });
};

/**
 * 获取所有唯一的商品
 * @param {Array} sizeData - 解析后的尺寸数据
 * @returns {Array} 唯一商品数组
 */
export const getUniqueProducts = (sizeData) => {
  if (!Array.isArray(sizeData)) {
    console.error('Invalid size data array');
    return [];
  }

  const products = new Set();
  
  sizeData.forEach((item) => {
    if (item.product) {
      products.add(item.product);
    }
  });

  return Array.from(products).sort();
};

/**
 * 查找指定尺寸的所有商品
 * @param {Array} sizeData - 解析后的尺寸数据
 * @param {string} targetSize - 目标尺寸
 * @returns {Array} 商品列表
 */
export const findProductsBySize = (sizeData, targetSize) => {
  if (!Array.isArray(sizeData) || !targetSize) {
    return [];
  }

  return sizeData
    .filter((item) => item.size === targetSize)
    .map((item) => item.product);
};

/**
 * 查找指定商品的所有尺寸
 * @param {Array} sizeData - 解析后的尺寸数据
 * @param {string} targetProduct - 目标商品
 * @returns {Array} 尺寸列表
 */
export const findSizesByProduct = (sizeData, targetProduct) => {
  if (!Array.isArray(sizeData) || !targetProduct) {
    return [];
  }

  return sizeData
    .filter((item) => item.product === targetProduct)
    .map((item) => item.size);
};

/**
 * 验证尺寸格式是否正确
 * @param {string} size - 尺寸字符串
 * @returns {boolean} 是否为有效格式
 */
export const isValidSizeFormat = (size) => {
  if (!size || typeof size !== 'string') {
    return false;
  }

  // 验证格式：数字*数字
  const sizePattern = /^\d+\*\d+$/;
  return sizePattern.test(size.trim());
};

/**
 * 从文件URL加载尺寸数据
 * @param {string} fileUrl - 文件URL
 * @returns {Promise<Array>} 解析后的尺寸数据
 */
export const loadSizeDataFromFile = async (fileUrl) => {
  try {
    const response = await fetch(fileUrl);
    
    if (!response.ok) {
      throw new Error(`Failed to load file: ${response.status} ${response.statusText}`);
    }

    const text = await response.text();
    return parseSizeData(text);
  } catch (error) {
    console.error('Error loading size data from file:', error);
    throw error;
  }
};

/**
 * 获取尺寸数据统计信息
 * @param {Array} sizeData - 解析后的尺寸数据
 * @returns {Object} 统计信息
 */
export const getSizeDataStats = (sizeData) => {
  if (!Array.isArray(sizeData)) {
    return {
      totalRecords: 0,
      uniqueSizes: 0,
      uniqueProducts: 0
    };
  }

  return {
    totalRecords: sizeData.length,
    uniqueSizes: getUniqueSizes(sizeData).length,
    uniqueProducts: getUniqueProducts(sizeData).length
  };
};

export default {
  parseSizeData,
  groupByProduct,
  groupBySize,
  getUniqueSizes,
  getUniqueProducts,
  findProductsBySize,
  findSizesByProduct,
  isValidSizeFormat,
  loadSizeDataFromFile,
  getSizeDataStats
};