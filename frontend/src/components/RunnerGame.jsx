import React, { useEffect, useRef, useState } from 'react';
import { Box, Button, Text, VStack, HStack, Badge } from '@chakra-ui/react';

const RunnerGame = () => {
  const canvasRef = useRef(null);
  const [gameOver, setGameOver] = useState(false);
  const [score, setScore] = useState(0);
  const [highScore, setHighScore] = useState(0);
  const playerRef = useRef({ x: 50, y: 200, width: 30, height: 30, speed: 5, velocityY: 0, isJumping: false });
  const obstaclesRef = useRef([]);
  const animationIdRef = useRef(null);
  const gameStateRef = useRef({ gameOver: false, score: 0 });

  // 初始化游戏
  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    
    const ctx = canvas.getContext('2d');
    const gravity = 0.5;
    const jumpPower = -12;
    const groundY = canvas.height - 50;

    // 重置玩家位置
    playerRef.current.y = groundY - playerRef.current.height;
    playerRef.current.velocityY = 0;
    playerRef.current.isJumping = false;

    const gameLoop = () => {
      if (gameStateRef.current.gameOver) return;

      // 清空画布
      ctx.clearRect(0, 0, canvas.width, canvas.height);

      // 绘制地面
      ctx.fillStyle = '#8B7355';
      ctx.fillRect(0, groundY, canvas.width, canvas.height - groundY);

      // 绘制天空背景
      const gradient = ctx.createLinearGradient(0, 0, 0, canvas.height);
      gradient.addColorStop(0, '#87CEEB');
      gradient.addColorStop(1, '#E0F6FF');
      ctx.fillStyle = gradient;
      ctx.fillRect(0, 0, canvas.width, groundY);

      // 应用重力
      playerRef.current.velocityY += gravity;
      playerRef.current.y += playerRef.current.velocityY;

      // 地面碰撞检测
      if (playerRef.current.y > groundY - playerRef.current.height) {
        playerRef.current.y = groundY - playerRef.current.height;
        playerRef.current.velocityY = 0;
        playerRef.current.isJumping = false;
      }

      // 边界限制
      if (playerRef.current.x < 0) playerRef.current.x = 0;
      if (playerRef.current.x > canvas.width - playerRef.current.width) {
        playerRef.current.x = canvas.width - playerRef.current.width;
      }
      if (playerRef.current.y < 0) playerRef.current.y = 0;

      // 绘制角色（蓝色方块）
      ctx.fillStyle = '#4299E1';
      ctx.fillRect(
        playerRef.current.x,
        playerRef.current.y,
        playerRef.current.width,
        playerRef.current.height
      );

      // 角色边框
      ctx.strokeStyle = '#2B6CB0';
      ctx.lineWidth = 2;
      ctx.strokeRect(
        playerRef.current.x,
        playerRef.current.y,
        playerRef.current.width,
        playerRef.current.height
      );

      // 绘制障碍物
      ctx.fillStyle = '#E53E3E';
      obstaclesRef.current.forEach((obstacle) => {
        ctx.fillRect(obstacle.x, obstacle.y, obstacle.width, obstacle.height);
        ctx.strokeStyle = '#C53030';
        ctx.lineWidth = 2;
        ctx.strokeRect(obstacle.x, obstacle.y, obstacle.width, obstacle.height);
      });

      // 更新障碍物位置
      updateObstacles(groundY);

      // 检测碰撞
      if (checkCollision()) {
        gameStateRef.current.gameOver = true;
        setGameOver(true);
        
        // 更新最高分
        if (gameStateRef.current.score > highScore) {
          setHighScore(gameStateRef.current.score);
        }
        
        ctx.fillStyle = 'rgba(0, 0, 0, 0.7)';
        ctx.fillRect(0, 0, canvas.width, canvas.height);
        ctx.fillStyle = 'white';
        ctx.font = 'bold 40px Arial';
        ctx.textAlign = 'center';
        ctx.fillText('Game Over!', canvas.width / 2, canvas.height / 2 - 20);
        ctx.font = '20px Arial';
        ctx.fillText(`得分: ${gameStateRef.current.score}`, canvas.width / 2, canvas.height / 2 + 20);
        return;
      }

      // 更新分数
      gameStateRef.current.score++;
      setScore(gameStateRef.current.score);

      // 绘制分数
      ctx.fillStyle = '#2D3748';
      ctx.font = 'bold 20px Arial';
      ctx.textAlign = 'left';
      ctx.fillText(`得分: ${gameStateRef.current.score}`, 20, 30);

      animationIdRef.current = requestAnimationFrame(gameLoop);
    };

    // 键盘控制
    const handleKeyDown = (e) => {
      if (gameStateRef.current.gameOver) return;

      switch (e.key) {
        case 'ArrowUp':
        case ' ':
          // 跳跃
          if (!playerRef.current.isJumping) {
            playerRef.current.velocityY = jumpPower;
            playerRef.current.isJumping = true;
          }
          e.preventDefault();
          break;
        case 'ArrowDown':
          // 快速下降
          if (playerRef.current.isJumping) {
            playerRef.current.velocityY += 2;
          }
          e.preventDefault();
          break;
        case 'ArrowLeft':
          playerRef.current.x -= playerRef.current.speed * 2;
          e.preventDefault();
          break;
        case 'ArrowRight':
          playerRef.current.x += playerRef.current.speed * 2;
          e.preventDefault();
          break;
        default:
          break;
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    
    // 开始游戏
    animationIdRef.current = requestAnimationFrame(gameLoop);

    return () => {
      if (animationIdRef.current) {
        cancelAnimationFrame(animationIdRef.current);
      }
      window.removeEventListener('keydown', handleKeyDown);
    };
  }, [gameOver, highScore]);

  // 更新障碍物
  const updateObstacles = (groundY) => {
    // 随机生成障碍物
    if (Math.random() < 0.015) {
      const height = 30 + Math.random() * 40;
      obstaclesRef.current.push({
        x: 800,
        y: groundY - height,
        width: 30,
        height: height,
        speed: 3 + Math.random() * 2,
      });
    }

    // 移动障碍物
    obstaclesRef.current.forEach((obstacle) => {
      obstacle.x -= obstacle.speed;
    });

    // 移除屏幕外的障碍物
    while (obstaclesRef.current.length > 0 && obstaclesRef.current[0].x < -30) {
      obstaclesRef.current.shift();
    }
  };

  // 检测碰撞
  const checkCollision = () => {
    return obstaclesRef.current.some(
      (obstacle) =>
        playerRef.current.x < obstacle.x + obstacle.width &&
        playerRef.current.x + playerRef.current.width > obstacle.x &&
        playerRef.current.y < obstacle.y + obstacle.height &&
        playerRef.current.y + playerRef.current.height > obstacle.y
    );
  };

  // 重新开始游戏
  const restartGame = () => {
    playerRef.current = { 
      x: 50, 
      y: 200, 
      width: 30, 
      height: 30, 
      speed: 5,
      velocityY: 0,
      isJumping: false
    };
    obstaclesRef.current = [];
    gameStateRef.current = { gameOver: false, score: 0 };
    setGameOver(false);
    setScore(0);
  };

  return (
    <Box p={4}>
      <VStack spacing={4} align="stretch">
        <HStack justify="space-between" align="center">
          <Text fontSize="2xl" fontWeight="bold" color="orange.500">
            🏃 跑酷小游戏
          </Text>
          <HStack spacing={4}>
            <Badge colorScheme="blue" fontSize="lg" px={3} py={1}>
              得分: {score}
            </Badge>
            <Badge colorScheme="purple" fontSize="lg" px={3} py={1}>
              最高分: {highScore}
            </Badge>
          </HStack>
        </HStack>

        <Box
          border="2px solid"
          borderColor="gray.300"
          borderRadius="md"
          overflow="hidden"
          boxShadow="lg"
        >
          <canvas
            ref={canvasRef}
            width={800}
            height={400}
            style={{ display: 'block', width: '100%', height: 'auto' }}
          />
        </Box>

        <VStack spacing={3} align="stretch">
          <Box
            bg="orange.50"
            p={4}
            borderRadius="md"
            border="1px solid"
            borderColor="orange.200"
          >
            <Text fontSize="sm" fontWeight="600" color="orange.700" mb={2}>
              🎮 游戏说明
            </Text>
            <VStack align="stretch" spacing={1} fontSize="sm" color="gray.700">
              <Text>⬆️ 上箭头 / 空格：跳跃</Text>
              <Text>⬇️ 下箭头：快速下降</Text>
              <Text>⬅️ 左箭头：向左移动</Text>
              <Text>➡️ 右箭头：向右移动</Text>
              <Text mt={2} color="orange.600" fontWeight="500">
                💡 提示：躲避红色障碍物，存活越久得分越高！
              </Text>
            </VStack>
          </Box>

          {gameOver && (
            <Button
              colorScheme="orange"
              size="lg"
              onClick={restartGame}
              w="100%"
              _hover={{ transform: 'translateY(-2px)', boxShadow: 'lg' }}
              transition="all 0.2s"
            >
              🔄 重新开始
            </Button>
          )}
        </VStack>
      </VStack>
    </Box>
  );
};

export default RunnerGame;