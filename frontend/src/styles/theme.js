// 简约低饱和度主题配色方案
import { extendTheme } from '@chakra-ui/react';

const theme = extendTheme({
  colors: {
    // 主色调 - 低饱和度灰色系
    gray: {
      50: '#FAFAFA',    // 极浅灰背景
      100: '#F5F5F5',   // 浅灰背景
      200: '#E8E8E8',   // 边框色
      300: '#D0D0D0',   // 分割线
      400: '#A0A0A0',   // 次要文字
      500: '#7A7A7A',   // 普通文字
      600: '#5A5A5A',   // 主要文字
      700: '#404040',   // 标题文字
      800: '#2A2A2A',   // 深色文字
      900: '#1A1A1A',   // 最深色
    },
    
    // 品牌色 - 低饱和度蓝绿色
    brand: {
      50: '#F0F7F7',    // 极淡背景
      100: '#E1F2F2',   // 淡背景
      200: '#C3E5E5',   // 边框背景
      300: '#A5D8D8',   // 悬停背景
      400: '#87CBCE',   // 次要按钮
      500: '#5FA8AA',   // 主品牌色（柔和蓝绿）
      600: '#4A8A8C',   // 深品牌色
      700: '#356C6E',   // 更深品牌色
      800: '#254E50',   // 深品牌文字
      900: '#1A3637',   // 最深品牌色
    },
    
    // 替换鲜艳的橙色为柔和的蓝绿色
    blue: {
      50: '#F0F7F7',
      100: '#E1F2F2',
      200: '#C3E5E5',
      300: '#A5D8D8',
      400: '#87CBCE',
      500: '#5FA8AA',
      600: '#4A8A8C',
      700: '#356C6E',
      800: '#254E50',
      900: '#1A3637',
    },
    
    // 绿色系 - 低饱和度
    green: {
      50: '#F0F7F0',
      100: '#E1F2E1',
      200: '#C3E5C3',
      300: '#A5D8A5',
      400: '#87CB87',
      500: '#5FA85F',
      600: '#4A8A4A',
      700: '#356C35',
      800: '#254E25',
      900: '#1A361A',
    },
    
    // 紫色系 - 低饱和度
    purple: {
      50: '#F5F3F7',
      100: '#EDE7F2',
      200: '#DACFEB',
      300: '#C7B7E4',
      400: '#B4A5DB',
      500: '#8B7DB8',
      600: '#6F6294',
      700: '#534770',
      800: '#39304F',
      900: '#252137',
    },
    
    // 红色系 - 低饱和度
    red: {
      50: '#FFF5F5',
      100: '#FFE5E5',
      200: '#FECBCB',
      300: '#FDB1B1',
      400: '#FC9696',
      500: '#E66666',
      600: '#B85252',
      700: '#8B3E3E',
      800: '#5D2A2A',
      900: '#2F1515',
    },
    
    // 橙色系 - 低饱和度（保留但大幅降低饱和度）
    orange: {
      50: '#F9F5F0',
      100: '#F1EAD8',
      200: '#E6D4B0',
      300: '#DBBE88',
      400: '#D0A860',
      500: '#C49238',
      600: '#9D752C',
      700: '#765820',
      800: '#4F3C14',
      900: '#281E0A',
    },
    
    // 黄色系 - 低饱和度
    yellow: {
      50: '#FEFDF0',
      100: '#FEF9E0',
      200: '#FEF2C0',
      300: '#FEEAA0',
      400: '#FEE280',
      500: '#FEDA60',
      600: '#CBAD4C',
      700: '#9D8038',
      800: '#6F5324',
      900: '#412610',
    }
  },
  
  // 字体设置
  fonts: {
    heading: 'Inter, -apple-system, BlinkMacSystemFont, "Segoe UI", system-ui, sans-serif',
    body: 'Inter, -apple-system, BlinkMacSystemFont, "Segoe UI", system-ui, sans-serif',
  },
  
  // 配置
  config: {
    initialColorMode: 'light',
    useSystemColorMode: false,
  },
  
  // 组件默认样式 - 简约风格
  components: {
    Button: {
      defaultProps: {
        colorScheme: 'brand',
        borderRadius: '6px', // 更小的圆角
        fontWeight: '500',
      },
      baseStyle: {
        transition: 'all 0.2s ease-in-out',
      }
    },
    Card: {
      defaultProps: {
        variant: 'outline',
        borderRadius: '8px',
        boxShadow: '0 1px 3px rgba(0, 0, 0, 0.05)', // 更轻的阴影
      },
    },
    Input: {
      defaultProps: {
        borderRadius: '6px',
        borderColor: 'gray.200',
        focusBorderColor: 'brand.500',
      },
    },
    Table: {
      defaultProps: {
        variant: 'simple',
        colorScheme: 'gray',
      },
    },
    Modal: {
      defaultProps: {
        borderRadius: '12px',
      },
    },
    Alert: {
      defaultProps: {
        borderRadius: '6px',
      },
    },
    Badge: {
      defaultProps: {
        borderRadius: '4px',
        fontWeight: '500',
      },
    }
  },
  
  // 全局样式
  styles: {
    global: {
      body: {
        bg: 'gray.50',
        color: 'gray.700',
        lineHeight: '1.6',
      },
      // 滚动条样式 - 更简洁
      '::-webkit-scrollbar': {
        width: '6px',
        height: '6px',
      },
      '::-webkit-scrollbar-track': {
        background: 'gray.100',
      },
      '::-webkit-scrollbar-thumb': {
        background: 'gray.300',
        borderRadius: '3px',
      },
      '::-webkit-scrollbar-thumb:hover': {
        background: 'gray.400',
      },
    },
  }
});

export default theme;