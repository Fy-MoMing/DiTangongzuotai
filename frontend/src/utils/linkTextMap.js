// 链接编号与产品类型名称映射表
// 用于将链接编号转换为对应的产品类型显示文本

export const linkTextMap = {
  1: '条纹',
  2: '菱形方格',
  3: '硬丝',
  4: '平面',
  7: '流星毯',
  8: '丝圈',
  14: '宽条纹',
  16: '硅藻泥'
};

// 根据链接编号获取显示文本
export const getLinkDisplayText = (linkNumber) => {
  return linkTextMap[linkNumber] || `${linkNumber}号链接`;
};

// 获取所有支持的链接编号
export const getSupportedLinkNumbers = () => {
  return Object.keys(linkTextMap).map(Number);
};

// 检查链接编号是否有效
export const isValidLinkNumber = (linkNumber) => {
  return linkNumber in linkTextMap;
};

export default linkTextMap;