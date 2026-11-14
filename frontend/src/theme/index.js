import { extendTheme } from '@chakra-ui/react';

// 简约主题配置 - 蓝白灰配色方案
const theme = extendTheme({
  colors: {
    // 品牌色彩系统 - 蓝白灰配色
    brand: {
      // 主色系
      white: '#FFFFFF',
      gray: {
        50: '#F9FAFB',
        100: '#F3F4F6',
        200: '#E5E7EB',
        300: '#D1D5DB',
        400: '#9CA3AF',
        500: '#6B7280',
        600: '#4B5563',
        700: '#374151',
        800: '#1F2937',
        900: '#111827',
      },
      // 蓝色系列
      blue: {
        50: '#EFF6FF',
        100: '#DBEAFE',
        200: '#BFDBFE',
        300: '#93C5FD',
        400: '#60A5FA',
        500: '#3B82F6', // 主蓝色
        600: '#2563EB',
        700: '#1D4ED8',
        800: '#1E40AF',
        900: '#1E3A8A',
      },
      // 中性色
      dark: '#333333',
      light: '#666666',
      border: '#E5E7EB',
      shadow: 'rgba(0, 0, 0, 0.05)',
    },
  },
  
  // 字体系统
  fonts: {
    heading: 'Inter, -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif',
    body: 'Inter, -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif',
  },
  
  // 字体大小
  fontSizes: {
    xs: '12px',
    sm: '14px',
    md: '16px',
    lg: '18px',
    xl: '20px',
    '2xl': '24px',
    '3xl': '30px',
    '4xl': '36px',
    '5xl': '48px',
  },
  
  // 字体粗细
  fontWeights: {
    normal: 400,
    medium: 500,
    semibold: 600,
    bold: 700,
  },
  
  // 间距
  space: {
    1: '0.25rem',
    2: '0.5rem',
    3: '0.75rem',
    4: '1rem',
    5: '1.25rem',
    6: '1.5rem',
    8: '2rem',
    10: '2.5rem',
    12: '3rem',
    16: '4rem',
    20: '5rem',
    24: '6rem',
  },
  
  // 圆角
  radii: {
    none: '0',
    sm: '0.125rem',
    base: '0.25rem',
    md: '0.375rem',
    lg: '0.5rem',
    xl: '0.75rem',
    '2xl': '1rem',
    full: '9999px',
  },
  
  // 阴影
  shadows: {
    xs: '0 1px 2px 0 rgba(0, 0, 0, 0.05)',
    sm: '0 1px 3px 0 rgba(0, 0, 0, 0.1), 0 1px 2px 0 rgba(0, 0, 0, 0.06)',
    base: '0 4px 6px -1px rgba(0, 0, 0, 0.1), 0 2px 4px -1px rgba(0, 0, 0, 0.06)',
    md: '0 10px 15px -3px rgba(0, 0, 0, 0.1), 0 4px 6px -2px rgba(0, 0, 0, 0.05)',
    lg: '0 20px 25px -5px rgba(0, 0, 0, 0.1), 0 10px 10px -5px rgba(0, 0, 0, 0.04)',
  },
  
  // 组件样式
  components: {
    // 按钮组件 - 简约设计
    Button: {
      baseStyle: {
        fontWeight: '500',
        borderRadius: 'md',
        transition: 'all 0.2s ease-in-out',
        _focus: {
          boxShadow: 'none',
        },
      },
      variants: {
        solid: {
          bg: 'brand.blue.500',
          color: 'brand.white',
          _hover: {
            bg: 'brand.blue.600',
            transform: 'translateY(-1px)',
            boxShadow: 'sm',
          },
          _active: {
            bg: 'brand.blue.700',
            transform: 'translateY(0)',
          },
        },
        outline: {
          borderColor: 'brand.blue.500',
          color: 'brand.blue.500',
          _hover: {
            bg: 'brand.blue.50',
            borderColor: 'brand.blue.600',
          },
        },
        ghost: {
          color: 'brand.blue.500',
          _hover: {
            bg: 'brand.blue.50',
          },
        },
      },
      defaultProps: {
        size: 'md',
        variant: 'solid',
      },
    },
    
    // 输入框组件 - 简约设计
    Input: {
      baseStyle: {
        field: {
          borderRadius: 'md',
          borderColor: 'brand.border',
          bg: 'brand.white',
          _hover: {
            borderColor: 'brand.blue.300',
          },
          _focus: {
            borderColor: 'brand.blue.500',
            boxShadow: `0 0 0 1px ${'brand.blue.500'}`,
            bg: 'brand.white',
          },
        },
      },
      variants: {
        outline: {
          field: {
            bg: 'brand.white',
          },
        },
      },
      defaultProps: {
        variant: 'outline',
      },
    },
    
    // 文本域组件 - 简约设计
    Textarea: {
      baseStyle: {
        borderRadius: 'md',
        borderColor: 'brand.border',
        bg: 'brand.white',
        _hover: {
          borderColor: 'brand.blue.300',
        },
        _focus: {
          borderColor: 'brand.blue.500',
          boxShadow: `0 0 0 1px ${'brand.blue.500'}`,
          bg: 'brand.white',
        },
      },
      variants: {
        outline: {
          bg: 'brand.white',
        },
      },
      defaultProps: {
        variant: 'outline',
      },
    },
    
    // 卡片组件 - 简约设计
    Card: {
      baseStyle: {
        container: {
          bg: 'brand.white',
          borderRadius: 'lg',
          boxShadow: 'xs',
          borderColor: 'brand.border',
          _hover: {
            boxShadow: 'sm',
            borderColor: 'brand.blue.200',
          },
        },
      },
    },
    
    // 标签页组件 - 简约设计
    Tabs: {
      variants: {
        'soft-rounded': {
          tab: {
            borderRadius: 'full',
            fontWeight: '500',
            color: 'brand.gray.500',
            _selected: {
              bg: 'brand.blue.500',
              color: 'brand.white',
            },
            _hover: {
              bg: 'brand.blue.50',
              color: 'brand.blue.600',
            },
          },
        },
      },
    },
    
    // 徽章组件 - 简约设计
    Badge: {
      baseStyle: {
        fontWeight: '500',
        fontSize: 'xs',
        borderRadius: 'full',
      },
      variants: {
        solid: {
          bg: 'brand.blue.500',
          color: 'brand.white',
        },
        sublte: {
          bg: 'brand.blue.50',
          color: 'brand.blue.700',
        },
      },
    },
    
    // 表格组件 - 简约设计
    Table: {
      baseStyle: {
        th: {
          fontWeight: '600',
          fontSize: 'sm',
          textTransform: 'none',
          color: 'brand.dark',
          borderColor: 'brand.border',
          bg: 'brand.gray.50',
        },
        td: {
          fontSize: 'sm',
          color: 'brand.dark',
          borderColor: 'brand.border',
        },
      },
    },
    
    // 分割线组件 - 简约设计
    Divider: {
      baseStyle: {
        borderColor: 'brand.border',
      },
    },
    
    // 选择器组件 - 简约设计
    Select: {
      baseStyle: {
        field: {
          borderRadius: 'md',
          borderColor: 'brand.border',
          bg: 'brand.white',
          _hover: {
            borderColor: 'brand.blue.300',
          },
          _focus: {
            borderColor: 'brand.blue.500',
            boxShadow: `0 0 0 1px ${'brand.blue.500'}`,
            bg: 'brand.white',
          },
        },
      },
      variants: {
        outline: {
          field: {
            bg: 'brand.white',
          },
        },
      },
      defaultProps: {
        variant: 'outline',
      },
    },
  },
  
  // 全局样式
  styles: {
    global: {
      body: {
        bg: 'brand.white',
        color: 'brand.dark',
        fontFamily: 'body',
        lineHeight: '1.6',
        WebkitFontSmoothing: 'antialiased',
        MozOsxFontSmoothing: 'grayscale',
      },
      '*::placeholder': {
        color: 'brand.gray.400',
      },
      '*, *::before, *::after': {
        borderColor: 'brand.border',
      },
      // 自定义滚动条样式
      '::-webkit-scrollbar': {
        width: '6px',
        height: '6px',
      },
      '::-webkit-scrollbar-track': {
        bg: 'brand.gray.100',
      },
      '::-webkit-scrollbar-thumb': {
        bg: 'brand.blue.400',
        borderRadius: '3px',
        _hover: {
          bg: 'brand.blue.500',
        },
      },
    },
  },
  
  // 默认配置
  config: {
    initialColorMode: 'light',
    useSystemColorMode: false,
  },
});

export default theme;