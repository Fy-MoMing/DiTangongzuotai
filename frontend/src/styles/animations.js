// GSAP动画配置和工具函数 - 精简版
import gsap from 'gsap';

// 动画配置常量
export const ANIMATION_CONFIG = {
  duration: {
    fast: 0.2,
    normal: 0.3,
    slow: 0.5
  },
  ease: {
    smooth: 'power2.out',
    bounce: 'back.out(1.7)'
  }
};

// 按钮悬停动画
export const buttonHoverAnimation = (element, isHover) => {
  if (!element) return;
  
  gsap.to(element, {
    y: isHover ? -3 : 0,
    scale: isHover ? 1.02 : 1,
    boxShadow: isHover 
      ? '0 8px 16px rgba(0, 0, 0, 0.15)' 
      : '0 2px 8px rgba(0, 0, 0, 0.08)',
    duration: ANIMATION_CONFIG.duration.normal,
    ease: ANIMATION_CONFIG.ease.smooth
  });
};

// 输入框聚焦动画
export const inputFocusAnimation = (element, isFocused) => {
  if (!element) return;
  
  gsap.to(element, {
    scale: isFocused ? 1.01 : 1,
    boxShadow: isFocused 
      ? '0 0 0 3px rgba(255, 165, 0, 0.15)' 
      : '0 0 0 0px rgba(255, 165, 0, 0)',
    duration: ANIMATION_CONFIG.duration.normal,
    ease: ANIMATION_CONFIG.ease.smooth
  });
};

// 卡片淡入动画
export const cardFadeInAnimation = (element, delay = 0) => {
  if (!element) return;
  
  gsap.fromTo(element, 
    {
      opacity: 0,
      y: 30
    },
    {
      opacity: 1,
      y: 0,
      duration: ANIMATION_CONFIG.duration.slow,
      delay: delay,
      ease: ANIMATION_CONFIG.ease.smooth
    }
  );
};

// 列表项滑入动画（保留用于多个元素批量动画）
export const listItemSlideInAnimation = (elements) => {
  if (!elements || elements.length === 0) return;
  
  gsap.fromTo(elements,
    {
      opacity: 0,
      x: -30
    },
    {
      opacity: 1,
      x: 0,
      duration: ANIMATION_CONFIG.duration.normal,
      stagger: 0.1,
      ease: ANIMATION_CONFIG.ease.smooth
    }
  );
};

// 下拉菜单动画（保留用于搜索结果）
export const dropdownAnimation = (element, show = true) => {
  if (!element) return;
  
  if (show) {
    gsap.fromTo(element,
      {
        opacity: 0,
        height: 0,
        y: -10
      },
      {
        opacity: 1,
        height: 'auto',
        y: 0,
        duration: ANIMATION_CONFIG.duration.normal,
        ease: ANIMATION_CONFIG.ease.smooth
      }
    );
  } else {
    gsap.to(element, {
      opacity: 0,
      height: 0,
      y: -10,
      duration: ANIMATION_CONFIG.duration.normal,
      ease: ANIMATION_CONFIG.ease.smooth
    });
  }
};

// 页面元素渐入动画（保留用于页面加载）
export const pageEnterAnimation = (elements) => {
  if (!elements) return;
  
  gsap.fromTo(elements,
    {
      opacity: 0,
      y: 50
    },
    {
      opacity: 1,
      y: 0,
      duration: ANIMATION_CONFIG.duration.slow,
      stagger: 0.15,
      ease: ANIMATION_CONFIG.ease.smooth
    }
  );
};

// 数字滚动动画（保留用于计数器）
export const numberCountAnimation = (element, startValue, endValue, duration = 1) => {
  if (!element) return;
  
  const obj = { value: startValue };
  
  gsap.to(obj, {
    value: endValue,
    duration: duration,
    ease: ANIMATION_CONFIG.ease.smooth,
    onUpdate: () => {
      element.textContent = Math.floor(obj.value);
    }
  });
};

// 清除所有正在进行的动画
export const killAllAnimations = () => {
  gsap.killTweensOf('*');
};

export default {
  ANIMATION_CONFIG,
  buttonHoverAnimation,
  inputFocusAnimation,
  cardFadeInAnimation,
  listItemSlideInAnimation,
  dropdownAnimation,
  pageEnterAnimation,
  numberCountAnimation,
  killAllAnimations
};