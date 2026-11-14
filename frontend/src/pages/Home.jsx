import React, { useState, useEffect, useRef } from 'react';
import { Box, Button, Heading, Text, VStack } from '@chakra-ui/react';
import { useNavigate } from 'react-router-dom';
import * as THREE from 'three';
import gsap from 'gsap';

const Home = () => {
  const [count, setCount] = useState(25);
  const navigate = useNavigate();
  const mountRef = useRef(null);
  const headingRef = useRef(null);
  const buttonRef = useRef(null);
  const containerRef = useRef(null);
  const countRef = useRef(null);

  // 实时更新计算次数（从localStorage获取真实数据）
  useEffect(() => {
    const storedCount = localStorage.getItem('calculationCount');
    if (storedCount) {
      setCount(parseInt(storedCount));
    } else {
      // 如果localStorage中没有值，初始化为25
      localStorage.setItem('calculationCount', '25');
      setCount(25);
    }

    const handleStorageChange = () => {
      const newCount = localStorage.getItem('calculationCount');
      if (newCount) {
        const parsedCount = parseInt(newCount);
        if (parsedCount !== count) {
          setCount(parsedCount);
          if (countRef.current) {
            gsap.fromTo(
              countRef.current,
              { scale: 1.3, color: '#FFD700' },
              { scale: 1, color: '#FDE047', duration: 0.6, ease: 'back.out(1.7)' }
            );
          }
        }
      }
    };

    window.addEventListener('storage', handleStorageChange);
    window.addEventListener('calculationUpdated', handleStorageChange);

    return () => {
      window.removeEventListener('storage', handleStorageChange);
      window.removeEventListener('calculationUpdated', handleStorageChange);
    };
  }, [count]);

  // Three.js 粒子动画背景
  useEffect(() => {
    if (!mountRef.current) return;

    const scene = new THREE.Scene();
    const camera = new THREE.PerspectiveCamera(75, window.innerWidth / window.innerHeight, 0.1, 1000);
    const renderer = new THREE.WebGLRenderer({ alpha: true, antialias: true });
    
    renderer.setSize(window.innerWidth, window.innerHeight);
    renderer.setPixelRatio(window.devicePixelRatio);
    mountRef.current.appendChild(renderer.domElement);

    camera.position.z = 50;

    // 创建粒子系统
    const particleCount = 3000;
    const particles = new THREE.BufferGeometry();
    const particleMaterial = new THREE.PointsMaterial({
      size: 0.15,
      transparent: true,
      opacity: 0.8,
      vertexColors: true,
      blending: THREE.AdditiveBlending
    });

    const positions = new Float32Array(particleCount * 3);
    const colors = new Float32Array(particleCount * 3);
    const velocities = new Float32Array(particleCount * 3);

    const colorPalette = [
      new THREE.Color(0x4FD1C5),
      new THREE.Color(0x319795),
      new THREE.Color(0xFFA500),
      new THREE.Color(0x6A5ACD),
      new THREE.Color(0xFF69B4)
    ];

    for (let i = 0; i < particleCount; i++) {
      positions[i * 3] = (Math.random() - 0.5) * 200;
      positions[i * 3 + 1] = (Math.random() - 0.5) * 200;
      positions[i * 3 + 2] = (Math.random() - 0.5) * 100;

      const color = colorPalette[Math.floor(Math.random() * colorPalette.length)];
      colors[i * 3] = color.r;
      colors[i * 3 + 1] = color.g;
      colors[i * 3 + 2] = color.b;

      velocities[i * 3] = (Math.random() - 0.5) * 0.02;
      velocities[i * 3 + 1] = (Math.random() - 0.5) * 0.02;
      velocities[i * 3 + 2] = (Math.random() - 0.5) * 0.01;
    }

    particles.setAttribute('position', new THREE.BufferAttribute(positions, 3));
    particles.setAttribute('color', new THREE.BufferAttribute(colors, 3));
    const particleSystem = new THREE.Points(particles, particleMaterial);
    scene.add(particleSystem);

    // 动画循环
    let animationId;
    const animate = () => {
      animationId = requestAnimationFrame(animate);

      const positions = particleSystem.geometry.attributes.position.array;

      for (let i = 0; i < particleCount; i++) {
        positions[i * 3] += velocities[i * 3];
        positions[i * 3 + 1] += velocities[i * 3 + 1];
        positions[i * 3 + 2] += velocities[i * 3 + 2];

        if (Math.abs(positions[i * 3]) > 100) velocities[i * 3] *= -1;
        if (Math.abs(positions[i * 3 + 1]) > 100) velocities[i * 3 + 1] *= -1;
        if (Math.abs(positions[i * 3 + 2]) > 50) velocities[i * 3 + 2] *= -1;
      }

      particleSystem.geometry.attributes.position.needsUpdate = true;
      particleSystem.rotation.y += 0.0005;

      renderer.render(scene, camera);
    };
    animate();

    // 响应式调整
    const handleResize = () => {
      camera.aspect = window.innerWidth / window.innerHeight;
      camera.updateProjectionMatrix();
      renderer.setSize(window.innerWidth, window.innerHeight);
    };
    window.addEventListener('resize', handleResize);

    return () => {
      window.removeEventListener('resize', handleResize);
      cancelAnimationFrame(animationId);
      if (mountRef.current && renderer.domElement) {
        mountRef.current.removeChild(renderer.domElement);
      }
      renderer.dispose();
      particles.dispose();
      particleMaterial.dispose();
    };
  }, []);

  // 页面加载动画
  useEffect(() => {
    if (headingRef.current && buttonRef.current && containerRef.current) {
      gsap.fromTo(
        containerRef.current,
        { opacity: 0 },
        { opacity: 1, duration: 0.8, ease: 'power2.out' }
      );

      gsap.fromTo(
        headingRef.current,
        { opacity: 0, y: -50, scale: 0.8 },
        { 
          opacity: 1, 
          y: 0, 
          scale: 1, 
          duration: 1, 
          ease: 'back.out(1.7)', 
          delay: 0.3 
        }
      );

      gsap.fromTo(
        buttonRef.current,
        { opacity: 0, y: 50 },
        { 
          opacity: 1, 
          y: 0, 
          duration: 0.8, 
          ease: 'power2.out', 
          delay: 0.6 
        }
      );
    }
  }, []);

  // 数字变动动画
  useEffect(() => {
    if (countRef.current) {
      gsap.fromTo(
        countRef.current,
        { scale: 1.2, color: '#FFD700' },
        { scale: 1, color: '#FDE047', duration: 0.5, ease: 'back.out(1.7)' }
      );
    }
  }, [count]);

  const handleStartClick = () => {
    gsap.to(containerRef.current, {
      opacity: 0,
      scale: 0.95,
      duration: 0.5,
      ease: 'power2.in',
      onComplete: () => {
        navigate('/calculator');
      }
    });
  };

  return (
    <Box position="relative" minH="100vh" overflow="hidden">
      {/* Three.js 粒子背景 */}
      <Box
        ref={mountRef}
        position="fixed"
        top="0"
        left="0"
        width="100%"
        height="100%"
        zIndex="0"
        bg="linear-gradient(135deg, #0a0a0a 0%, #1a1a2e 50%, #16213e 100%)"
      />

      {/* 内容区域 */}
      <VStack
        ref={containerRef}
        spacing={8}
        textAlign="center"
        px={6}
        zIndex="1"
        position="relative"
        minH="100vh"
        justify="center"
      >
        <Heading
          ref={headingRef}
          fontSize={{ base: '3xl', md: '5xl', lg: '6xl' }}
          color="white"
          fontWeight="700"
          textShadow="0 0 20px rgba(79, 209, 197, 0.5), 0 0 40px rgba(106, 90, 205, 0.3)"
          lineHeight="1.3"
          maxW="900px"
          _hover={{ 
            transform: 'scale(1.05)', 
            textShadow: '0 0 30px rgba(79, 209, 197, 0.8), 0 0 50px rgba(106, 90, 205, 0.5)' 
          }}
          transition="all 0.3s ease"
          cursor="default"
        >
          已服务计算次数{' '}
          <Text 
            ref={countRef}
            as="span" 
            color="yellow.300" 
            fontSize={{ base: '4xl', md: '6xl', lg: '7xl' }}
            display="inline-block"
          >
            {count}
          </Text>{' '}
          次
        </Heading>

        <Text
          fontSize={{ base: 'md', md: 'xl' }}
          color="whiteAlpha.900"
          fontWeight="500"
          maxW="600px"
          textShadow="0 2px 10px rgba(0, 0, 0, 0.5)"
        >
          专业的地毯价格计算服务，快速、准确、便捷
        </Text>

        <Button
          ref={buttonRef}
          size="lg"
          fontSize="xl"
          px={12}
          py={7}
          borderRadius="full"
          bg="transparent"
          color="white"
          border="2px solid"
          borderColor="whiteAlpha.800"
          onClick={handleStartClick}
          _hover={{ 
            transform: 'scale(1.08)', 
            bg: 'rgba(255, 255, 255, 0.1)',
            borderColor: 'white',
            boxShadow: '0 8px 24px rgba(255, 255, 255, 0.3)'
          }}
          _active={{ 
            transform: 'scale(0.98)' 
          }}
          transition="all 0.3s ease"
          fontWeight="600"
        >
          开始使用
        </Button>

        <Text
          fontSize="sm"
          color="whiteAlpha.700"
          fontWeight="500"
          mt={4}
          textShadow="0 2px 8px rgba(0, 0, 0, 0.5)"
        >
          点击按钮进入地毯价格计算器
        </Text>
      </VStack>

      {/* 底部标识 */}
      <Box
        position="absolute"
        bottom="20px"
        left="50%"
        transform="translateX(-50%)"
        fontSize="xs"
        color="whiteAlpha.700"
        fontWeight="600"
        letterSpacing="1px"
        textShadow="0 2px 8px rgba(0, 0, 0, 0.5)"
        zIndex="1"
      >
        By 映绸家居
      </Box>
    </Box>
  );
};

export default Home;