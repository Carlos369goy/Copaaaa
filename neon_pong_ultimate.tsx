import React, { useState, useEffect, useRef } from 'react';
import { 
  Play, 
  Users, 
  Globe, 
  Volume2, 
  VolumeX, 
  RotateCcw, 
  ArrowLeft, 
  Copy, 
  Check, 
  Cpu, 
  ShieldAlert, 
  Zap, 
  Gamepad2, 
  Trophy, 
  Flame, 
  Clock, 
  Sparkles,
  ChevronRight,
  UserCheck
} from 'lucide-react';
import { initializeApp } from 'firebase/app';
import { 
  getAuth, 
  signInAnonymously, 
  signInWithCustomToken, 
  onAuthStateChanged 
} from 'firebase/auth';
import { 
  getFirestore, 
  doc, 
  setDoc, 
  onSnapshot, 
  updateDoc, 
  getDoc,
  collection,
  query,
  getDocs
} from 'firebase/firestore';

// --- CONFIGURAÇÃO DO FIREBASE (Vindo do ambiente) ---
const firebaseConfig = typeof __firebase_config !== 'undefined' 
  ? JSON.parse(__firebase_config) 
  : {
      apiKey: "",
      authDomain: "mock-project.firebaseapp.com",
      projectId: "mock-project",
      storageBucket: "mock-project.appspot.com",
      messagingSenderId: "000000000000",
      appId: "1:000000000000:web:000000000000"
    };

const app = initializeApp(firebaseConfig);
const auth = getAuth(app);
const db = getFirestore(app);
const appId = typeof __app_id !== 'undefined' ? __app_id : 'neon-pong-ultimate';

// Constantes lógicas do jogo (Área virtual do canvas)
const V_WIDTH = 800;
const V_HEIGHT = 500;
const PADDLE_HEIGHT_DEFAULT = 90;
const PADDLE_WIDTH = 14;
const BALL_SIZE = 10;
const MAX_SCORE = 7; // Reduzido ligeiramente para partidas mais dinâmicas e competitivas

export default function App() {
  // --- ESTADOS DO UTILIZADOR E SISTEMA ---
  const [user, setUser] = useState(null);
  const [playerName, setPlayerName] = useState('CyberPlayer');
  const [isEditingName, setIsEditingName] = useState(false);
  const [soundEnabled, setSoundEnabled] = useState(true);
  const [gameMode, setGameMode] = useState(null); // 'ia', 'local', 'online'
  const [subMode, setSubMode] = useState('classico'); // 'classico', 'caos', 'sobrevivencia'
  const [difficulty, setDifficulty] = useState('normal'); // 'facil', 'normal', 'impossivel'
  
  // --- TABELA DE CLASSIFICAÇÃO ---
  const [leaderboard, setLeaderboard] = useState([]);
  const [showLeaderboard, setShowLeaderboard] = useState(false);

  // --- ESTADO ONLINE ---
  const [roomId, setRoomId] = useState('');
  const [inputRoomId, setInputRoomId] = useState('');
  const [isHost, setIsHost] = useState(false);
  const [roomStatus, setRoomStatus] = useState('idle'); // 'idle', 'creating', 'waiting', 'playing', 'disconnected'
  const [copied, setCopied] = useState(false);
  const [errorMessage, setErrorMessage] = useState('');

  // --- ESTADOS DO JOGO ---
  const [gameState, setGameState] = useState('menu'); // 'menu', 'setup', 'playing', 'gameover'
  const [score, setScore] = useState({ p1: 0, p2: 0 });
  const [winner, setWinner] = useState(null);
  const [survivalTime, setSurvivalTime] = useState(0);
  const [activePowerUpMsg, setActivePowerUpMsg] = useState('');

  // --- REFERÊNCIAS ---
  const canvasRef = useRef(null);
  const gameLoopRef = useRef(null);
  const networkIntervalRef = useRef(null);
  const survivalTimerRef = useRef(null);
  
  // Referências físicas
  const p1Y = useRef(V_HEIGHT / 2 - PADDLE_HEIGHT_DEFAULT / 2);
  const p2Y = useRef(V_HEIGHT / 2 - PADDLE_HEIGHT_DEFAULT / 2);
  const p1Height = useRef(PADDLE_HEIGHT_DEFAULT);
  const p2Height = useRef(PADDLE_HEIGHT_DEFAULT);
  
  // Velocidade anterior para calcular efeito (spin)
  const p1PrevY = useRef(p1Y.current);
  const p2PrevY = useRef(p2Y.current);
  const p1SpeedY = useRef(0);
  const p2SpeedY = useRef(0);

  const ballX = useRef(V_WIDTH / 2);
  const ballY = useRef(V_HEIGHT / 2);
  const ballVX = useRef(5);
  const ballVY = useRef(5);
  const ballTrail = useRef([]); // Guarda posições anteriores para efeito rastro
  const particles = useRef([]); // Faíscas de colisão
  const obstacles = useRef([]); // Obstáculos para o modo Caos
  
  const keysPressed = useRef({});
  const screenShake = useRef(0);
  const audioCtxRef = useRef(null);

  // --- AUTENTICAÇÃO DO FIREBASE ---
  useEffect(() => {
    const initAuth = async () => {
      try {
        if (typeof __initial_auth_token !== 'undefined' && __initial_auth_token) {
          await signInWithCustomToken(auth, __initial_auth_token);
        } else {
          await signInAnonymously(auth);
        }
      } catch (error) {
        console.error("Erro na autenticação:", error);
      }
    };
    initAuth();

    const unsubscribe = onAuthStateChanged(auth, (usr) => {
      if (usr) {
        setUser(usr);
        loadLeaderboard();
      }
    });
    return () => unsubscribe();
  }, []);

  // --- REQUISITAR TABELA DE LÍDERES ---
  const loadLeaderboard = async () => {
    try {
      // Regra 2: Sem consultas complexas de ordenação no Firestore para evitar quebra por falta de índice.
      // Lemos tudo e ordenamos em memória local.
      const lbCol = collection(db, 'artifacts', appId, 'public', 'data', 'leaderboard');
      const snap = await getDocs(lbCol);
      const list = [];
      snap.forEach(doc => {
        list.push({ id: doc.id, ...doc.data() });
      });
      // Ordena por pontuação/vitórias decrescente
      list.sort((a, b) => b.score - a.score);
      setLeaderboard(list.slice(0, 7)); // Top 7
    } catch (e) {
      console.warn("Erro ao carregar classificação:", e);
    }
  };

  const saveScoreToLeaderboard = async (finalScore) => {
    if (!user) return;
    try {
      const playerDocRef = doc(db, 'artifacts', appId, 'public', 'data', 'leaderboard', user.uid);
      const snap = await getDoc(playerDocRef);
      let currentBest = 0;
      if (snap.exists()) {
        currentBest = snap.data().score || 0;
      }
      if (finalScore > currentBest) {
        await setDoc(playerDocRef, {
          name: playerName,
          score: finalScore,
          date: Date.now()
        }, { merge: true });
        loadLeaderboard();
      }
    } catch (e) {
      console.warn("Não foi possível salvar pontuação:", e);
    }
  };

  // --- GERADOR DE EFEITOS SONOROS (WEB AUDIO SYNTH) ---
  const playSound = (type) => {
    if (!soundEnabled) return;
    try {
      if (!audioCtxRef.current) {
        audioCtxRef.current = new (window.AudioContext || window.webkitAudioContext)();
      }
      const ctx = audioCtxRef.current;
      if (ctx.state === 'suspended') ctx.resume();

      const osc = ctx.createOscillator();
      const gain = ctx.createGain();
      osc.connect(gain);
      gain.connect(ctx.destination);

      if (type === 'hit') {
        osc.type = 'triangle';
        osc.frequency.setValueAtTime(180, ctx.currentTime);
        osc.frequency.exponentialRampToValueAtTime(380, ctx.currentTime + 0.12);
        gain.gain.setValueAtTime(0.2, ctx.currentTime);
        gain.gain.exponentialRampToValueAtTime(0.01, ctx.currentTime + 0.12);
        osc.start();
        osc.stop(ctx.currentTime + 0.12);
      } else if (type === 'wall') {
        osc.type = 'sine';
        osc.frequency.setValueAtTime(120, ctx.currentTime);
        osc.frequency.exponentialRampToValueAtTime(180, ctx.currentTime + 0.1);
        gain.gain.setValueAtTime(0.12, ctx.currentTime);
        gain.gain.exponentialRampToValueAtTime(0.01, ctx.currentTime + 0.1);
        osc.start();
        osc.stop(ctx.currentTime + 0.1);
      } else if (type === 'score') {
        osc.type = 'sawtooth';
        osc.frequency.setValueAtTime(300, ctx.currentTime);
        osc.frequency.exponentialRampToValueAtTime(600, ctx.currentTime + 0.3);
        gain.gain.setValueAtTime(0.15, ctx.currentTime);
        gain.gain.exponentialRampToValueAtTime(0.01, ctx.currentTime + 0.35);
        osc.start();
        osc.stop(ctx.currentTime + 0.35);
      } else if (type === 'teleport') {
        osc.type = 'sine';
        osc.frequency.setValueAtTime(600, ctx.currentTime);
        osc.frequency.exponentialRampToValueAtTime(200, ctx.currentTime + 0.25);
        gain.gain.setValueAtTime(0.15, ctx.currentTime);
        gain.gain.exponentialRampToValueAtTime(0.01, ctx.currentTime + 0.25);
        osc.start();
        osc.stop(ctx.currentTime + 0.25);
      } else if (type === 'gameover') {
        osc.type = 'sawtooth';
        osc.frequency.setValueAtTime(400, ctx.currentTime);
        osc.frequency.linearRampToValueAtTime(100, ctx.currentTime + 0.6);
        gain.gain.setValueAtTime(0.2, ctx.currentTime);
        gain.gain.exponentialRampToValueAtTime(0.01, ctx.currentTime + 0.75);
        osc.start();
        osc.stop(ctx.currentTime + 0.75);
      }
    } catch (e) {
      console.warn(e);
    }
  };

  // --- GERADOR DE PARTÍCULAS ---
  const createParticles = (x, y, color) => {
    const count = 16;
    for (let i = 0; i < count; i++) {
      particles.current.push({
        x: x,
        y: y,
        vx: (Math.random() - 0.5) * 8,
        vy: (Math.random() - 0.5) * 8,
        radius: Math.random() * 3 + 1.5,
        alpha: 1,
        color: color,
        decay: Math.random() * 0.03 + 0.015
      });
    }
  };

  // --- CONTROLO DO TECLADO ---
  useEffect(() => {
    const handleKeyDown = (e) => {
      keysPressed.current[e.key] = true;
      if (['ArrowUp', 'ArrowDown', ' ', 'w', 's'].includes(e.key)) {
        e.preventDefault();
      }
    };
    const handleKeyUp = (e) => {
      keysPressed.current[e.key] = false;
    };

    window.addEventListener('keydown', handleKeyDown);
    window.addEventListener('keyup', handleKeyUp);
    return () => {
      window.removeEventListener('keydown', handleKeyDown);
      window.removeEventListener('keyup', handleKeyUp);
    };
  }, []);

  // --- MULTIJOGADOR ONLINE (SALAS FIRESTORE) ---
  const createOnlineRoom = async () => {
    if (!user) return;
    setRoomStatus('creating');
    const newRoomId = Math.random().toString(36).substring(2, 7).toUpperCase();
    const roomRef = doc(db, 'artifacts', appId, 'public', 'data', 'rooms', newRoomId);
    
    try {
      await setDoc(roomRef, {
        roomId: newRoomId,
        hostId: user.uid,
        hostName: playerName,
        clientId: null,
        clientName: '',
        hostY: p1Y.current,
        clientY: p2Y.current,
        ballX: ballX.current,
        ballY: ballY.current,
        ballVX: ballVX.current,
        ballVY: ballVY.current,
        hostScore: 0,
        clientScore: 0,
        subMode: subMode,
        status: 'waiting',
        lastUpdated: Date.now()
      });
      
      setRoomId(newRoomId);
      setIsHost(true);
      setRoomStatus('waiting');
    } catch (err) {
      console.error(err);
      setErrorMessage('Erro ao criar sala online.');
      setRoomStatus('idle');
    }
  };

  const joinOnlineRoom = async (targetId) => {
    if (!user || !targetId) return;
    const cleanId = targetId.trim().toUpperCase();
    setRoomStatus('creating');
    
    const roomRef = doc(db, 'artifacts', appId, 'public', 'data', 'rooms', cleanId);
    
    try {
      const snap = await getDoc(roomRef);
      if (!snap.exists()) {
        setErrorMessage('Sala não encontrada!');
        setRoomStatus('idle');
        return;
      }
      
      const data = snap.data();
      if (data.status !== 'waiting') {
        setErrorMessage('Sala cheia ou jogo já iniciado!');
        setRoomStatus('idle');
        return;
      }

      await updateDoc(roomRef, {
        clientId: user.uid,
        clientName: playerName,
        status: 'playing',
        lastUpdated: Date.now()
      });

      setRoomId(cleanId);
      setIsHost(false);
      setRoomStatus('playing');
      setGameMode('online');
      setSubMode(data.subMode); // Sincroniza o modo de jogo do Host
      setGameState('playing');
      resetBall();
    } catch (err) {
      console.error(err);
      setErrorMessage('Erro ao tentar entrar na sala.');
      setRoomStatus('idle');
    }
  };

  // Sincronização em tempo real (Regras 1, 2 e 3)
  useEffect(() => {
    if (!roomId || !user || gameMode !== 'online') return;

    const roomRef = doc(db, 'artifacts', appId, 'public', 'data', 'rooms', roomId);

    const unsubscribe = onSnapshot(roomRef, (snapshot) => {
      if (!snapshot.exists()) {
        setRoomStatus('disconnected');
        setGameState('gameover');
        return;
      }
      
      const data = snapshot.data();
      
      if (data.status === 'playing' && roomStatus === 'waiting') {
        setRoomStatus('playing');
        setGameState('playing');
      }

      if (isHost) {
        p2Y.current = data.clientY;
      } else {
        p1Y.current = data.hostY;
        ballX.current = data.ballX;
        ballY.current = data.ballY;
        setScore({ p1: data.hostScore, p2: data.clientScore });
        
        if (data.hostScore >= MAX_SCORE) {
          setGameState('gameover');
          setWinner(data.hostName || 'Anfitrião');
          playSound('gameover');
        } else if (data.clientScore >= MAX_SCORE) {
          setGameState('gameover');
          setWinner(data.clientName || 'Convidado');
          playSound('gameover');
        }
      }
    }, (err) => {
      console.error("Erro Firestore:", err);
    });

    networkIntervalRef.current = setInterval(async () => {
      try {
        if (isHost) {
          await updateDoc(roomRef, {
            hostY: p1Y.current,
            ballX: ballX.current,
            ballY: ballY.current,
            hostScore: score.p1,
            clientScore: score.p2,
            lastUpdated: Date.now()
          });
        } else {
          await updateDoc(roomRef, {
            clientY: p2Y.current,
            lastUpdated: Date.now()
          });
        }
      } catch (e) {
        console.warn(e);
      }
    }, 40);

    return () => {
      unsubscribe();
      if (networkIntervalRef.current) clearInterval(networkIntervalRef.current);
    };
  }, [roomId, isHost, gameMode, score]);

  // --- CONFIGURAR MODOS ESPECIAIS ---
  const setupGameModifiers = () => {
    particles.current = [];
    ballTrail.current = [];
    p1Height.current = PADDLE_HEIGHT_DEFAULT;
    p2Height.current = PADDLE_HEIGHT_DEFAULT;
    
    // Configurar Obstáculos se for Modo Caos
    if (subMode === 'caos') {
      obstacles.current = [
        { x: V_WIDTH / 2, y: V_HEIGHT / 3, r: 24, pulse: 0 },
        { x: V_WIDTH / 2, y: (V_HEIGHT / 3) * 2, r: 24, pulse: Math.PI }
      ];
      setActivePowerUpMsg('Campo de Força Ativo: Cuidado com a gravidade central!');
    } else {
      obstacles.current = [];
    }

    // Cronómetro do Modo Sobrevivência
    if (subMode === 'sobrevivencia') {
      setSurvivalTime(0);
      setActivePowerUpMsg('Time Attack: Desvie e aguente a velocidade da bola!');
      if (survivalTimerRef.current) clearInterval(survivalTimerRef.current);
      survivalTimerRef.current = setInterval(() => {
        setSurvivalTime(prev => {
          const next = prev + 1;
          // Encolher raquetes progressivamente a cada 8 segundos para aumentar a dificuldade
          if (next % 8 === 0) {
            p1Height.current = Math.max(35, p1Height.current - 12);
            p2Height.current = Math.max(35, p2Height.current - 12);
            setActivePowerUpMsg('Alerta de Sobrevivência: Raquetes Encolheram!');
            playSound('wall');
          }
          return next;
        });
      }, 1000);
    }
  };

  const resetBall = () => {
    ballX.current = V_WIDTH / 2;
    ballY.current = V_HEIGHT / 2;
    const dirX = Math.random() > 0.5 ? 1 : -1;
    const dirY = Math.random() > 0.5 ? 1 : -1;
    
    // Velocidades iniciais adaptativas ao modo
    let baseSpeed = 5.5;
    if (subMode === 'sobrevivencia') baseSpeed = 7;
    if (gameMode === 'ia' && difficulty === 'impossivel') baseSpeed = 7.5;

    ballVX.current = dirX * baseSpeed;
    ballVY.current = dirY * (Math.random() * 3 + baseSpeed - 2);
    ballTrail.current = [];
  };

  // --- FÍSICA E JOGABILIDADE MELHORADA ---
  const updatePhysics = () => {
    // Calcular velocidade real das raquetes para aplicar efeito "Spin"
    p1SpeedY.current = p1Y.current - p1PrevY.current;
    p2SpeedY.current = p2Y.current - p2PrevY.current;
    p1PrevY.current = p1Y.current;
    p2PrevY.current = p2Y.current;

    const paddleSpeed = 8.5;

    // Redução do efeito Screen Shake
    if (screenShake.current > 0) {
      screenShake.current -= 0.1;
    }

    // Atualização de partículas
    particles.current.forEach((p, i) => {
      p.x += p.vx;
      p.y += p.vy;
      p.alpha -= p.decay;
      if (p.alpha <= 0) particles.current.splice(i, 1);
    });

    // Movimento do Jogador 1 (Esquerda)
    if (gameMode !== 'online' || isHost) {
      if (keysPressed.current['w'] || keysPressed.current['W']) {
        p1Y.current = Math.max(0, p1Y.current - paddleSpeed);
      }
      if (keysPressed.current['s'] || keysPressed.current['S']) {
        p1Y.current = Math.min(V_HEIGHT - p1Height.current, p1Y.current + paddleSpeed);
      }
    }

    // Movimento do Jogador 2 (Direita)
    if (gameMode === 'local') {
      if (keysPressed.current['ArrowUp']) {
        p2Y.current = Math.max(0, p2Y.current - paddleSpeed);
      }
      if (keysPressed.current['ArrowDown']) {
        p2Y.current = Math.min(V_HEIGHT - p2Height.current, p2Y.current + paddleSpeed);
      }
    } else if (gameMode === 'ia') {
      // IA Melhorada com previsão de trajetória e reação atrasada baseada na dificuldade
      let targetSpeed = 5;
      let errorChance = 0.15;
      
      if (difficulty === 'facil') {
        targetSpeed = 3;
        errorChance = 0.35;
      } else if (difficulty === 'impossivel') {
        targetSpeed = 9;
        errorChance = 0.02;
      }

      const paddleCenter = p2Y.current + p2Height.current / 2;
      // Adiciona flutuação no seguimento da bola para parecer humana
      const targetY = ballY.current + (Math.sin(Date.now() * 0.005) * (difficulty === 'facil' ? 40 : 10));

      if (ballX.current > V_WIDTH * (difficulty === 'facil' ? 0.5 : 0.2)) {
        if (Math.random() > errorChance) {
          if (targetY < paddleCenter - 15) {
            p2Y.current = Math.max(0, p2Y.current - targetSpeed);
          } else if (targetY > paddleCenter + 15) {
            p2Y.current = Math.min(V_HEIGHT - p2Height.current, p2Y.current + targetSpeed);
          }
        }
      }
    } else if (gameMode === 'online' && !isHost) {
      if (keysPressed.current['w'] || keysPressed.current['W'] || keysPressed.current['ArrowUp']) {
        p2Y.current = Math.max(0, p2Y.current - paddleSpeed);
      }
      if (keysPressed.current['s'] || keysPressed.current['S'] || keysPressed.current['ArrowDown']) {
        p2Y.current = Math.min(V_HEIGHT - p2Height.current, p2Y.current + paddleSpeed);
      }
    }

    // Movimento da Bola (Calculado no Host ou Offline)
    if (gameMode !== 'online' || isHost) {
      ballX.current += ballVX.current;
      ballY.current += ballVY.current;

      // Adiciona posição atual ao rastro
      ballTrail.current.push({ x: ballX.current, y: ballY.current });
      if (ballTrail.current.length > 8) ballTrail.current.shift();

      // Colisão com as Paredes Superior/Inferior
      if (ballY.current <= BALL_SIZE || ballY.current >= V_HEIGHT - BALL_SIZE) {
        ballVY.current = -ballVY.current * 1.01; // ligeira aceleração
        ballY.current = ballY.current <= BALL_SIZE ? BALL_SIZE : V_HEIGHT - BALL_SIZE;
        playSound('wall');
        createParticles(ballX.current, ballY.current, '#a855f7');
      }

      // --- Modo Caos: Colisão com Obstáculos Centrais ---
      if (subMode === 'caos') {
        obstacles.current.forEach(obs => {
          // Atualiza pulsação estética
          obs.pulse += 0.05;
          const currentRadius = obs.r + Math.sin(obs.pulse) * 4;

          const dx = ballX.current - obs.x;
          const dy = ballY.current - obs.y;
          const distance = Math.sqrt(dx * dx + dy * dy);

          if (distance < currentRadius + BALL_SIZE) {
            // Reflexão física circular realista
            const nx = dx / distance;
            const ny = dy / distance;
            
            // Produto escalar
            const dot = ballVX.current * nx + ballVY.current * ny;
            
            // Nova direção refletida
            ballVX.current = (ballVX.current - 2 * dot * nx) * 1.05;
            ballVY.current = (ballVY.current - 2 * dot * ny) * 1.05;

            // Empurrar bola para fora
            ballX.current = obs.x + nx * (currentRadius + BALL_SIZE + 2);
            ballY.current = obs.y + ny * (currentRadius + BALL_SIZE + 2);

            playSound('teleport');
            createParticles(ballX.current, ballY.current, '#fbbf24');
            screenShake.current = 1.5;
          }
        });
      }

      // Colisão Raquete Esquerda (Jogador 1 - Cyan)
      if (ballX.current - BALL_SIZE <= PADDLE_WIDTH + 15) {
        if (ballX.current >= 15) {
          if (ballY.current >= p1Y.current && ballY.current <= p1Y.current + p1Height.current) {
            const relativeIntersectY = (p1Y.current + (p1Height.current / 2)) - ballY.current;
            const normalizedIntersectY = relativeIntersectY / (p1Height.current / 2);
            
            // Ângulo de ricochete
            const bounceAngle = normalizedIntersectY * (Math.PI / 2.8);
            const speed = Math.sqrt(ballVX.current * ballVX.current + ballVY.current * ballVY.current) * 1.05;

            ballVX.current = Math.abs(Math.cos(bounceAngle) * speed);
            
            // Efeito Spin da Raquete (Aplica força vertical com base no movimento)
            ballVY.current = -Math.sin(bounceAngle) * speed + (p1SpeedY.current * 0.3);

            ballX.current = PADDLE_WIDTH + 16;
            playSound('hit');
            createParticles(ballX.current, ballY.current, '#06b6d4');
            screenShake.current = 2.5;
          }
        }
      }

      // Colisão Raquete Direita (Jogador 2 - Rosa)
      if (ballX.current + BALL_SIZE >= V_WIDTH - PADDLE_WIDTH - 15) {
        if (ballX.current <= V_WIDTH - 15) {
          if (ballY.current >= p2Y.current && ballY.current <= p2Y.current + p2Height.current) {
            const relativeIntersectY = (p2Y.current + (p2Height.current / 2)) - ballY.current;
            const normalizedIntersectY = relativeIntersectY / (p2Height.current / 2);
            
            const bounceAngle = normalizedIntersectY * (Math.PI / 2.8);
            const speed = Math.sqrt(ballVX.current * ballVX.current + ballVY.current * ballVY.current) * 1.05;

            ballVX.current = -Math.abs(Math.cos(bounceAngle) * speed);
            
            // Efeito Spin da Raquete
            ballVY.current = -Math.sin(bounceAngle) * speed + (p2SpeedY.current * 0.3);

            ballX.current = V_WIDTH - PADDLE_WIDTH - 16;
            playSound('hit');
            createParticles(ballX.current, ballY.current, '#ec4899');
            screenShake.current = 2.5;
          }
        }
      }

      // Lógica de Golo / Ponto Marcado
      if (ballX.current < 0) {
        // P2 pontua
        createParticles(0, ballY.current, '#ec4899');
        screenShake.current = 5;
        
        if (subMode === 'sobrevivencia') {
          // No modo sobrevivência contra IA, perder a bola termina a corrida
          endSurvivalGame();
        } else {
          setScore(prev => {
            const next = { ...prev, p2: prev.p2 + 1 };
            if (next.p2 >= MAX_SCORE) {
              setGameState('gameover');
              const finalWinner = gameMode === 'ia' ? 'IA Cibernética' : 'Jogador 2';
              setWinner(finalWinner);
              playSound('gameover');
            } else {
              playSound('score');
              resetBall();
            }
            return next;
          });
        }
      } else if (ballX.current > V_WIDTH) {
        // P1 pontua
        createParticles(V_WIDTH, ballY.current, '#06b6d4');
        screenShake.current = 5;

        setScore(prev => {
          const next = { ...prev, p1: prev.p1 + 1 };
          if (next.p1 >= MAX_SCORE) {
            setGameState('gameover');
            setWinner(playerName || 'Jogador 1');
            playSound('gameover');
            // Salvar na Tabela de Líderes se ganhou à IA no impossível/normal ou sob condições normais
            if (gameMode === 'ia') {
              const baseScore = difficulty === 'impossivel' ? 1500 : (difficulty === 'normal' ? 750 : 300);
              saveScoreToLeaderboard(baseScore);
            }
          } else {
            playSound('score');
            resetBall();
          }
          return next;
        });
      }
    }
  };

  const endSurvivalGame = () => {
    setGameState('gameover');
    setWinner('Tempo Esgotado');
    playSound('gameover');
    if (survivalTimerRef.current) clearInterval(survivalTimerRef.current);
    // Salva tempo como pontuação
    const scoreEarned = survivalTime * 10;
    saveScoreToLeaderboard(scoreEarned);
  };

  // --- RENDERIZAÇÃO ESTILO CYBERPUNK ---
  const draw = () => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    // Aplicar efeito Screen Shake no Canvas
    ctx.save();
    if (screenShake.current > 0) {
      const dx = (Math.random() - 0.5) * screenShake.current * 4;
      const dy = (Math.random() - 0.5) * screenShake.current * 4;
      ctx.translate(dx, dy);
    }

    // Fundo Escuro Espacial / Cyberpunk
    ctx.fillStyle = '#020617';
    ctx.fillRect(0, 0, V_WIDTH, V_HEIGHT);

    // Grelha de Fundo Futurista
    ctx.strokeStyle = 'rgba(99, 102, 241, 0.04)';
    ctx.lineWidth = 1;
    for (let x = 0; x < V_WIDTH; x += 40) {
      ctx.beginPath();
      ctx.moveTo(x, 0);
      ctx.lineTo(x, V_HEIGHT);
      ctx.stroke();
    }
    for (let y = 0; y < V_HEIGHT; y += 40) {
      ctx.beginPath();
      ctx.moveTo(0, y);
      ctx.lineTo(V_WIDTH, y);
      ctx.stroke();
    }

    // Linha Central Neon Divisória
    ctx.strokeStyle = 'rgba(99, 102, 241, 0.18)';
    ctx.lineWidth = 3;
    ctx.setLineDash([10, 10]);
    ctx.beginPath();
    ctx.moveTo(V_WIDTH / 2, 0);
    ctx.lineTo(V_WIDTH / 2, V_HEIGHT);
    ctx.stroke();
    ctx.setLineDash([]); // Reset line dash

    // --- Desenhar Obstáculos do Modo Caos ---
    if (subMode === 'caos') {
      obstacles.current.forEach(obs => {
        const rad = obs.r + Math.sin(obs.pulse) * 3;
        const grad = ctx.createRadialGradient(obs.x, obs.y, 2, obs.x, obs.y, rad);
        grad.addColorStop(0, 'rgba(253, 224, 71, 0.9)');
        grad.addColorStop(0.5, 'rgba(234, 179, 8, 0.4)');
        grad.addColorStop(1, 'rgba(234, 179, 8, 0)');

        ctx.fillStyle = grad;
        ctx.beginPath();
        ctx.arc(obs.x, obs.y, rad, 0, Math.PI * 2);
        ctx.fill();

        // Anel exterior néon
        ctx.strokeStyle = '#facc15';
        ctx.shadowColor = '#eab308';
        ctx.shadowBlur = 10;
        ctx.lineWidth = 1.5;
        ctx.stroke();
        ctx.shadowBlur = 0;
      });
    }

    // --- Desenhar Partículas ---
    particles.current.forEach(p => {
      ctx.save();
      ctx.globalAlpha = p.alpha;
      ctx.fillStyle = p.color;
      ctx.beginPath();
      ctx.arc(p.x, p.y, p.radius, 0, Math.PI * 2);
      ctx.fill();
      ctx.restore();
    });

    // --- Desenhar Rastro da Bola (Motion Blur Trail) ---
    ballTrail.current.forEach((pos, idx) => {
      ctx.save();
      ctx.globalAlpha = (idx + 1) / (ballTrail.current.length * 2.5);
      ctx.fillStyle = '#c084fc';
      ctx.beginPath();
      ctx.arc(pos.x, pos.y, BALL_SIZE * 0.9, 0, Math.PI * 2);
      ctx.fill();
      ctx.restore();
    });

    // --- Raquetes Néon com Brilho Superior ---
    ctx.shadowBlur = 18;

    // Jogador Esquerda (Cyan)
    ctx.fillStyle = '#06b6d4';
    ctx.shadowColor = '#06b6d4';
    ctx.beginPath();
    ctx.roundRect(15, p1Y.current, PADDLE_WIDTH, p1Height.current, 6);
    ctx.fill();

    // Jogador Direita (Rosa)
    ctx.fillStyle = '#ec4899';
    ctx.shadowColor = '#ec4899';
    ctx.beginPath();
    ctx.roundRect(V_WIDTH - PADDLE_WIDTH - 15, p2Y.current, PADDLE_WIDTH, p2Height.current, 6);
    ctx.fill();

    // Bola (Roxa Ultra Néon)
    ctx.fillStyle = '#a855f7';
    ctx.shadowColor = '#a855f7';
    ctx.beginPath();
    ctx.arc(ballX.current, ballY.current, BALL_SIZE, 0, Math.PI * 2);
    ctx.fill();

    // Reset de sombras para evitar lag de rendering
    ctx.shadowBlur = 0;
    ctx.restore();
  };

  // --- LOOP DO JOGO ---
  useEffect(() => {
    if (gameState !== 'playing') return;

    const loop = () => {
      updatePhysics();
      draw();
      gameLoopRef.current = requestAnimationFrame(loop);
    };

    gameLoopRef.current = requestAnimationFrame(loop);

    return () => {
      if (gameLoopRef.current) cancelAnimationFrame(gameLoopRef.current);
    };
  }, [gameState, gameMode, difficulty, subMode, isHost]);

  const startGame = (mode) => {
    setGameMode(mode);
    setScore({ p1: 0, p2: 0 });
    setWinner(null);
    p1Y.current = V_HEIGHT / 2 - PADDLE_HEIGHT_DEFAULT / 2;
    p2Y.current = V_HEIGHT / 2 - PADDLE_HEIGHT_DEFAULT / 2;
    setupGameModifiers();
    resetBall();
    
    if (mode === 'online') {
      setGameState('setup');
    } else {
      setGameState('playing');
    }
  };

  const quitToMenu = () => {
    if (survivalTimerRef.current) clearInterval(survivalTimerRef.current);
    setGameState('menu');
    setGameMode(null);
    setRoomStatus('idle');
    setRoomId('');
    setInputRoomId('');
    loadLeaderboard();
  };

  // --- SISTEMA DE CÓPIA ROBUSTO (COMPATÍVEL COM IFRAMES) ---
  const copyRoomCode = () => {
    try {
      const tempTextArea = document.createElement('textarea');
      tempTextArea.value = roomId;
      document.body.appendChild(tempTextArea);
      tempTextArea.select();
      document.execCommand('copy');
      document.body.removeChild(tempTextArea);
      
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    } catch (err) {
      console.error("Falha ao copiar código:", err);
    }
  };

  return (
    <div className="min-h-screen bg-slate-950 text-white flex flex-col justify-between font-sans select-none overflow-hidden relative">
      
      {/* Luz Néon Flutuante de Fundo (Estética Cyberpunk) */}
      <div className="absolute top-0 left-1/4 w-96 h-96 bg-cyan-500/5 rounded-full blur-3xl pointer-events-none"></div>
      <div className="absolute bottom-0 right-1/4 w-96 h-96 bg-pink-500/5 rounded-full blur-3xl pointer-events-none"></div>

      {/* --- CABEÇALHO --- */}
      <header className="px-6 py-4 border-b border-slate-900 bg-slate-950/80 backdrop-blur-md flex items-center justify-between z-10">
        <div className="flex items-center gap-3">
          <div className="p-2 bg-gradient-to-tr from-cyan-500 to-indigo-600 rounded-lg border border-cyan-400/30">
            <Gamepad2 className="w-6 h-6 animate-pulse text-cyan-200" />
          </div>
          <div>
            <h1 className="text-xl font-black tracking-widest bg-gradient-to-r from-cyan-400 via-indigo-400 to-pink-500 bg-clip-text text-transparent">
              NEON PONG ULTIMATE
            </h1>
            <p className="text-xs text-slate-400 font-mono">Batalha Retro & Modos de Jogo v3.0</p>
          </div>
        </div>

        {/* Nome do Jogador e Som */}
        <div className="flex items-center gap-3">
          <div className="hidden sm:flex items-center gap-2 bg-slate-900/60 px-3 py-1.5 rounded-lg border border-slate-800">
            {isEditingName ? (
              <input
                type="text"
                value={playerName}
                onChange={(e) => setPlayerName(e.target.value)}
                onBlur={() => setIsEditingName(false)}
                onKeyDown={(e) => e.key === 'Enter' && setIsEditingName(false)}
                className="bg-transparent border-b border-cyan-500 focus:outline-none text-xs font-semibold text-cyan-400 w-24 uppercase"
                autoFocus
              />
            ) : (
              <div className="flex items-center gap-1.5 cursor-pointer" onClick={() => setIsEditingName(true)}>
                <UserCheck className="w-3.5 h-3.5 text-cyan-400" />
                <span className="text-xs font-mono font-bold text-slate-200 uppercase">{playerName}</span>
              </div>
            )}
          </div>

          <button 
            onClick={() => setShowLeaderboard(!showLeaderboard)}
            className={`p-2.5 rounded-lg border transition ${showLeaderboard ? 'bg-indigo-600 text-white border-indigo-400' : 'bg-slate-900 border-slate-800 hover:bg-slate-800 text-slate-400 hover:text-white'}`}
            title="Tabela de Líderes"
          >
            <Trophy className="w-5 h-5" />
          </button>

          <button 
            onClick={() => setSoundEnabled(!soundEnabled)} 
            className="p-2.5 rounded-lg bg-slate-900 hover:bg-slate-800 border border-slate-800 hover:border-slate-700 transition"
            title="Ativar/Desativar som"
          >
            {soundEnabled ? <Volume2 className="w-5 h-5 text-cyan-400" /> : <VolumeX className="w-5 h-5 text-slate-500" />}
          </button>
        </div>
      </header>

      {/* --- CONTEÚDO PRINCIPAL --- */}
      <main className="flex-1 flex flex-col items-center justify-center p-4 relative z-10">
        
        {/* Painel Flutuante de Classificação (Overlay) */}
        {showLeaderboard && (
          <div className="absolute inset-0 bg-slate-950/90 flex items-center justify-center z-50 p-4">
            <div className="bg-slate-900 border border-slate-800 max-w-md w-full rounded-2xl p-6 shadow-2xl animate-scale-up space-y-6">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <Trophy className="w-6 h-6 text-yellow-400" />
                  <h3 className="text-xl font-bold tracking-tight">Top Players Globais</h3>
                </div>
                <button 
                  onClick={() => setShowLeaderboard(false)}
                  className="px-3 py-1 bg-slate-850 hover:bg-slate-800 text-xs text-slate-400 hover:text-white rounded-lg transition"
                >
                  Fechar
                </button>
              </div>

              <div className="space-y-2">
                {leaderboard.length === 0 ? (
                  <p className="text-slate-500 text-sm text-center py-6">Ainda não existem pontuações enviadas.</p>
                ) : (
                  leaderboard.map((player, index) => (
                    <div 
                      key={player.id} 
                      className={`flex items-center justify-between p-3 rounded-xl border font-mono ${index === 0 ? 'bg-yellow-950/20 border-yellow-500/30' : index === 1 ? 'bg-slate-800/40 border-slate-700' : 'bg-slate-950/40 border-slate-900'}`}
                    >
                      <div className="flex items-center gap-3">
                        <span className={`w-6 h-6 rounded-md flex items-center justify-center text-xs font-bold ${index === 0 ? 'bg-yellow-500 text-black' : 'bg-slate-800 text-slate-300'}`}>
                          {index + 1}
                        </span>
                        <span className="font-bold text-sm tracking-wide text-slate-100 uppercase">{player.name}</span>
                      </div>
                      <div className="flex items-center gap-2">
                        <span className="text-xs text-slate-400">PONTOS:</span>
                        <span className="text-cyan-400 font-bold">{player.score}</span>
                      </div>
                    </div>
                  ))
                )}
              </div>
              <p className="text-[10px] text-slate-500 text-center uppercase tracking-wider">Pontuações salvas ao vencer a IA ou no modo Sobrevivência</p>
            </div>
          </div>
        )}

        {/* --- MENU PRINCIPAL --- */}
        {gameState === 'menu' && (
          <div className="max-w-4xl w-full grid grid-cols-1 md:grid-cols-12 gap-6 animate-fade-in">
            
            {/* Esquerda: Configuração e Modos de Jogo */}
            <div className="md:col-span-7 bg-slate-900/60 border border-slate-800/80 p-6 rounded-2xl shadow-2xl backdrop-blur-xl flex flex-col justify-between space-y-6">
              <div className="space-y-4">
                <div className="space-y-2">
                  <span className="text-xs font-semibold tracking-widest text-cyan-400 uppercase bg-cyan-950/50 px-3 py-1 rounded-full border border-cyan-900/30">
                    Sintonizador de Jogo
                  </span>
                  <h2 className="text-3xl font-black">Selecione o Modificador</h2>
                </div>

                {/* Alternador de Modos de Jogo */}
                <div className="grid grid-cols-3 gap-2 p-1.5 bg-slate-950 border border-slate-800/60 rounded-xl">
                  <button 
                    onClick={() => setSubMode('classico')}
                    className={`py-2 px-3 text-xs font-bold rounded-lg transition-all duration-150 flex items-center justify-center gap-1.5 ${subMode === 'classico' ? 'bg-cyan-600 text-white shadow-md' : 'text-slate-400 hover:text-white'}`}
                  >
                    <Flame className="w-3.5 h-3.5" /> Clássico
                  </button>
                  <button 
                    onClick={() => setSubMode('caos')}
                    className={`py-2 px-3 text-xs font-bold rounded-lg transition-all duration-150 flex items-center justify-center gap-1.5 ${subMode === 'caos' ? 'bg-yellow-600 text-white shadow-md' : 'text-slate-400 hover:text-white'}`}
                  >
                    <Sparkles className="w-3.5 h-3.5" /> Caos
                  </button>
                  <button 
                    onClick={() => setSubMode('sobrevivencia')}
                    className={`py-2 px-3 text-xs font-bold rounded-lg transition-all duration-150 flex items-center justify-center gap-1.5 ${subMode === 'sobrevivencia' ? 'bg-pink-600 text-white shadow-md' : 'text-slate-400 hover:text-white'}`}
                  >
                    <Clock className="w-3.5 h-3.5" /> Sobrevivência
                  </button>
                </div>

                {/* Painel Descritivo do Modo Ativo */}
                <div className="p-4 bg-slate-950/50 rounded-xl border border-slate-850/80 text-sm space-y-1">
                  {subMode === 'classico' && (
                    <>
                      <p className="font-bold text-slate-100 flex items-center gap-1.5"><Flame className="w-4 h-4 text-cyan-400" /> Clássico Retro-Futurista</p>
                      <p className="text-xs text-slate-400">A física lendária com aceleração contínua e efeito "spin" adicionado ao bater em movimento nas raquetes.</p>
                    </>
                  )}
                  {subMode === 'caos' && (
                    <>
                      <p className="font-bold text-slate-100 flex items-center gap-1.5"><Sparkles className="w-4 h-4 text-yellow-400" /> Forças Gravíticas & Desvios</p>
                      <p className="text-xs text-slate-400">Campos magnéticos no centro do campo repelem e distorcem a rota da bola sem aviso!</p>
                    </>
                  )}
                  {subMode === 'sobrevivencia' && (
                    <>
                      <p className="font-bold text-slate-100 flex items-center gap-1.5"><Clock className="w-4 h-4 text-pink-500" /> Time Attack Contra-Relógio</p>
                      <p className="text-xs text-slate-400">Tente manter a bola em jogo o maior tempo possível. As raquetes encolhem progressivamente a cada 8 segundos!</p>
                    </>
                  )}
                </div>
              </div>

              {/* Botões de Início de Partida */}
              <div className="space-y-2 pt-4">
                <button 
                  onClick={() => startGame('ia')}
                  className="w-full flex items-center justify-between p-4 bg-slate-850/70 hover:bg-slate-800 border border-slate-800 hover:border-cyan-500/40 rounded-xl transition group duration-200"
                >
                  <div className="flex items-center gap-3 text-left">
                    <div className="p-2.5 bg-cyan-950 text-cyan-400 rounded-lg group-hover:scale-105 transition">
                      <Cpu className="w-5 h-5" />
                    </div>
                    <div>
                      <div className="font-extrabold text-slate-100 text-sm">Combate contra IA</div>
                      <div className="text-[11px] text-slate-400">Três dificuldades para desafiar</div>
                    </div>
                  </div>
                  <ChevronRight className="w-5 h-5 text-slate-500 group-hover:text-cyan-400" />
                </button>

                <button 
                  onClick={() => startGame('local')}
                  className="w-full flex items-center justify-between p-4 bg-slate-850/70 hover:bg-slate-800 border border-slate-800 hover:border-pink-500/40 rounded-xl transition group duration-200"
                >
                  <div className="flex items-center gap-3 text-left">
                    <div className="p-2.5 bg-pink-950 text-pink-400 rounded-lg group-hover:scale-105 transition">
                      <Users className="w-5 h-5" />
                    </div>
                    <div>
                      <div className="font-extrabold text-slate-100 text-sm">Batalha Local (1v1)</div>
                      <div className="text-[11px] text-slate-400">Dois jogadores no mesmo ecrã/teclado</div>
                    </div>
                  </div>
                  <ChevronRight className="w-5 h-5 text-slate-500 group-hover:text-pink-400" />
                </button>

                <button 
                  onClick={() => startGame('online')}
                  className="w-full flex items-center justify-between p-4 bg-gradient-to-r from-indigo-950/60 to-purple-950/60 hover:from-indigo-900/60 hover:to-purple-900/60 border border-indigo-900/50 hover:border-indigo-500 rounded-xl transition group duration-200"
                >
                  <div className="flex items-center gap-3 text-left">
                    <div className="p-2.5 bg-indigo-950 text-indigo-400 rounded-lg group-hover:scale-105 transition">
                      <Globe className="w-5 h-5" />
                    </div>
                    <div>
                      <div className="font-extrabold text-slate-100 text-sm">Guerra Online P2P</div>
                      <div className="text-[11px] text-slate-400">Salas privadas sincronizadas via Firestore</div>
                    </div>
                  </div>
                  <ChevronRight className="w-5 h-5 text-slate-500 group-hover:text-indigo-400" />
                </button>
              </div>
            </div>

            {/* Direita: Top Players & Teclado */}
            <div className="md:col-span-5 flex flex-col gap-6">
              {/* Tabela Rápida de Líderes */}
              <div className="bg-slate-900/60 border border-slate-800 p-6 rounded-2xl flex-1 flex flex-col justify-between">
                <div className="space-y-4">
                  <div className="flex items-center justify-between border-b border-slate-800 pb-3">
                    <h3 className="font-black text-sm tracking-widest text-slate-300 uppercase flex items-center gap-2">
                      <Trophy className="w-4 h-4 text-yellow-500 animate-bounce" /> Top Players
                    </h3>
                    <span className="text-[10px] font-mono text-indigo-400 font-semibold bg-indigo-950/40 px-2 py-0.5 rounded-full border border-indigo-900/30">SCORE</span>
                  </div>
                  <div className="space-y-2">
                    {leaderboard.slice(0, 4).map((player, index) => (
                      <div key={player.id} className="flex items-center justify-between text-xs font-mono py-1.5 border-b border-slate-900/40">
                        <span className="text-slate-400 uppercase font-bold flex gap-2">
                          <span className="text-indigo-500">{index + 1}.</span> {player.name}
                        </span>
                        <span className="text-cyan-400 font-bold">{player.score}</span>
                      </div>
                    ))}
                    {leaderboard.length === 0 && (
                      <p className="text-[11px] text-slate-500 py-6 text-center">Nenhum registo de campeão ainda.</p>
                    )}
                  </div>
                </div>

                <div className="pt-4 border-t border-slate-850 space-y-2 text-[11px] text-slate-500 font-mono">
                  <p className="font-bold text-slate-400 uppercase mb-1">Mapeamento de Teclas:</p>
                  <p>• Jogador Esquerda: <span className="text-cyan-400 bg-slate-950 px-1.5 py-0.5 rounded border border-slate-800">W</span> e <span className="text-cyan-400 bg-slate-950 px-1.5 py-0.5 rounded border border-slate-800">S</span></p>
                  <p>• Jogador Direita: <span className="text-pink-500 bg-slate-950 px-1.5 py-0.5 rounded border border-slate-800">▲</span> e <span className="text-pink-500 bg-slate-950 px-1.5 py-0.5 rounded border border-slate-800">▼</span></p>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* --- CONFIGURAÇÃO DE JOGO (IA OU ONLINE) --- */}
        {gameState === 'setup' && (
          <div className="max-w-md w-full bg-slate-900/80 border border-slate-800 p-8 rounded-2xl shadow-2xl animate-fade-in space-y-6">
            <div className="flex items-center gap-2">
              <button 
                onClick={quitToMenu}
                className="p-1.5 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-400 hover:text-white transition"
              >
                <ArrowLeft className="w-5 h-5" />
              </button>
              <h2 className="text-2xl font-bold">Configuração da Partida</h2>
            </div>

            {gameMode === 'online' && (
              <div className="space-y-6">
                {roomStatus === 'idle' && (
                  <div className="space-y-4">
                    <button 
                      onClick={createOnlineRoom}
                      className="w-full py-3 bg-indigo-600 hover:bg-indigo-500 font-semibold rounded-xl transition shadow-lg shadow-indigo-600/30 active:scale-[0.98]"
                    >
                      Criar Nova Sala ({subMode.toUpperCase()})
                    </button>

                    <div className="relative flex py-2 items-center">
                      <div className="flex-grow border-t border-slate-800"></div>
                      <span className="flex-shrink mx-4 text-slate-500 font-mono text-xs">OU CONECTAR A ALGUÉM</span>
                      <div className="flex-grow border-t border-slate-800"></div>
                    </div>

                    <div className="space-y-2">
                      <label className="text-xs font-semibold text-slate-400 font-mono">CÓDIGO DA SALA (5 CARACTERES)</label>
                      <div className="flex gap-2">
                        <input 
                          type="text" 
                          placeholder="EX: BG45K"
                          value={inputRoomId}
                          onChange={(e) => setInputRoomId(e.target.value)}
                          className="flex-1 px-4 py-3 bg-slate-950 border border-slate-800 rounded-xl focus:outline-none focus:border-indigo-500 uppercase font-mono tracking-widest text-center"
                        />
                        <button 
                          onClick={() => joinOnlineRoom(inputRoomId)}
                          className="px-6 bg-slate-800 hover:bg-slate-700 hover:text-white font-semibold rounded-xl transition border border-slate-700"
                        >
                          Entrar
                        </button>
                      </div>
                    </div>

                    {errorMessage && (
                      <div className="p-3 bg-red-950/40 border border-red-900/50 text-red-400 rounded-xl text-sm flex items-center gap-2">
                        <ShieldAlert className="w-4 h-4 shrink-0" />
                        <span>{errorMessage}</span>
                      </div>
                    )}
                  </div>
                )}

                {roomStatus === 'creating' && (
                  <div className="py-8 flex flex-col items-center justify-center space-y-3">
                    <div className="w-8 h-8 border-4 border-indigo-500 border-t-transparent rounded-full animate-spin"></div>
                    <p className="text-sm text-slate-400">Ligar aos servidores neurais...</p>
                  </div>
                )}

                {roomStatus === 'waiting' && (
                  <div className="space-y-6 text-center py-4">
                    <div className="space-y-2">
                      <p className="text-sm text-slate-400">Partilhe este código para convidar um oponente</p>
                      <div className="flex items-center justify-center gap-2 bg-slate-950 border border-slate-800 px-6 py-4 rounded-xl font-mono text-3xl font-extrabold tracking-wider text-indigo-400 relative group">
                        {roomId}
                        <button 
                          onClick={copyRoomCode}
                          className="absolute right-3 p-2 rounded-lg bg-slate-900 hover:bg-slate-800 text-slate-400 hover:text-white transition"
                        >
                          {copied ? <Check className="w-5 h-5 text-green-400" /> : <Copy className="w-5 h-5" />}
                        </button>
                      </div>
                    </div>

                    <div className="flex flex-col items-center gap-3">
                      <div className="w-6 h-6 border-3 border-cyan-400 border-t-transparent rounded-full animate-spin"></div>
                      <p className="text-sm text-cyan-400 animate-pulse">A aguardar ligação...</p>
                    </div>

                    <button 
                      onClick={quitToMenu}
                      className="w-full py-2.5 bg-slate-800 hover:bg-slate-700 text-sm font-semibold rounded-lg transition"
                    >
                      Cancelar e Sair
                    </button>
                  </div>
                )}
              </div>
            )}
          </div>
        )}

        {/* --- ECRÃ DE JOGO ATIVO --- */}
        {gameState === 'playing' && (
          <div className="w-full max-w-4xl flex flex-col items-center space-y-4 animate-scale-up">
            
            {/* Placar Informativo */}
            <div className="w-full flex items-center justify-between px-6 py-3 bg-slate-900/60 border border-slate-900 rounded-2xl backdrop-blur-md">
              <div className="flex items-center gap-3">
                <span className="w-3 h-3 rounded-full bg-cyan-400 animate-ping"></span>
                <span className="font-mono text-xs tracking-widest text-cyan-400 uppercase font-semibold">
                  {gameMode === 'ia' ? `VS IA - ${difficulty.toUpperCase()}` : gameMode === 'local' ? '1V1 LOCAL' : 'PARTIDA ONLINE'} ({subMode.toUpperCase()})
                </span>
              </div>

              {/* Placar principal ou tempo de sobrevivência */}
              {subMode === 'sobrevivencia' ? (
                <div className="flex items-center gap-2 font-mono text-xl font-bold text-pink-400 animate-pulse">
                  <Clock className="w-5 h-5" />
                  <span>TEMPO: {survivalTime}s</span>
                </div>
              ) : (
                <div className="flex items-center gap-8 font-mono text-3xl font-black">
                  <span className="text-cyan-400">{score.p1}</span>
                  <span className="text-slate-600">:</span>
                  <span className="text-pink-500">{score.p2}</span>
                </div>
              )}

              <button 
                onClick={quitToMenu}
                className="flex items-center gap-1.5 px-3 py-1.5 bg-slate-800/80 hover:bg-red-950 hover:text-red-400 rounded-lg text-xs font-semibold text-slate-400 border border-slate-700/50 hover:border-red-900/50 transition duration-150"
              >
                <ArrowLeft className="w-3.5 h-3.5" /> Desistir
              </button>
            </div>

            {/* Mensagem Ativa de Power-up */}
            {activePowerUpMsg && (
              <div className="w-full text-center py-1 bg-indigo-950/20 border border-indigo-900/30 rounded-lg text-xs font-mono text-slate-300 animate-pulse">
                {activePowerUpMsg}
              </div>
            )}

            {/* Dificuldade Seletor Rápido se for vs IA */}
            {gameMode === 'ia' && (
              <div className="flex gap-2 text-xs font-mono">
                <button 
                  onClick={() => setDifficulty('facil')} 
                  className={`px-3 py-1 rounded border ${difficulty === 'facil' ? 'bg-cyan-950 border-cyan-400 text-cyan-400' : 'bg-slate-900 border-slate-800 text-slate-400'}`}
                >
                  FÁCIL
                </button>
                <button 
                  onClick={() => setDifficulty('normal')} 
                  className={`px-3 py-1 rounded border ${difficulty === 'normal' ? 'bg-indigo-950 border-indigo-400 text-indigo-400' : 'bg-slate-900 border-slate-800 text-slate-400'}`}
                >
                  NORMAL
                </button>
                <button 
                  onClick={() => setDifficulty('impossivel')} 
                  className={`px-3 py-1 rounded border ${difficulty === 'impossivel' ? 'bg-pink-950 border-pink-400 text-pink-400 animate-pulse' : 'bg-slate-900 border-slate-800 text-slate-400'}`}
                >
                  IA CIBERNÉTICA
                </button>
              </div>
            )}

            {/* Canvas Principal */}
            <div className="relative w-full aspect-[8/5] bg-slate-950 border border-slate-800 rounded-2xl shadow-2xl overflow-hidden">
              <canvas 
                ref={canvasRef}
                width={V_WIDTH}
                height={V_HEIGHT}
                className="w-full h-full block"
              />

              {/* Controlos Táteis se Móvel */}
              <div className="absolute inset-0 pointer-events-none md:hidden flex justify-between">
                <div className="w-1/3 h-full pointer-events-auto flex flex-col justify-between p-4">
                  <button 
                    onTouchStart={() => { keysPressed.current['w'] = true; }}
                    onTouchEnd={() => { keysPressed.current['w'] = false; }}
                    className="w-16 h-16 bg-slate-900/40 active:bg-cyan-500/20 border border-slate-800 rounded-full flex items-center justify-center text-cyan-400 font-bold"
                  >
                    ▲
                  </button>
                  <button 
                    onTouchStart={() => { keysPressed.current['s'] = true; }}
                    onTouchEnd={() => { keysPressed.current['s'] = false; }}
                    className="w-16 h-16 bg-slate-900/40 active:bg-cyan-500/20 border border-slate-800 rounded-full flex items-center justify-center text-cyan-400 font-bold"
                  >
                    ▼
                  </button>
                </div>

                {gameMode === 'local' && (
                  <div className="w-1/3 h-full pointer-events-auto flex flex-col justify-between items-end p-4">
                    <button 
                      onTouchStart={() => { keysPressed.current['ArrowUp'] = true; }}
                      onTouchEnd={() => { keysPressed.current['ArrowUp'] = false; }}
                      className="w-16 h-16 bg-slate-900/40 active:bg-pink-500/20 border border-slate-800 rounded-full flex items-center justify-center text-pink-400 font-bold"
                    >
                      ▲
                    </button>
                    <button 
                      onTouchStart={() => { keysPressed.current['ArrowDown'] = true; }}
                      onTouchEnd={() => { keysPressed.current['ArrowDown'] = false; }}
                      className="w-16 h-16 bg-slate-900/40 active:bg-pink-500/20 border border-slate-800 rounded-full flex items-center justify-center text-pink-400 font-bold"
                    >
                      ▼
                    </button>
                  </div>
                )}
              </div>
            </div>
          </div>
        )}

        {/* --- ECRÃ DE FIM DE JOGO --- */}
        {gameState === 'gameover' && (
          <div className="max-w-md w-full bg-slate-900/90 border-2 border-indigo-500/40 p-8 rounded-2xl shadow-2xl text-center space-y-6 animate-scale-up">
            <div className="space-y-2">
              <span className="text-xs font-semibold tracking-widest text-indigo-400 uppercase bg-indigo-950/60 px-3 py-1 rounded-full border border-indigo-900/30">
                Resultado do Match
              </span>
              <h2 className="text-4xl font-black text-transparent bg-clip-text bg-gradient-to-r from-yellow-400 via-orange-500 to-pink-500 uppercase">
                {winner}
              </h2>
            </div>

            {subMode === 'sobrevivencia' ? (
              <div className="bg-slate-950 py-4 rounded-xl border border-slate-800 flex flex-col items-center justify-center space-y-1">
                <span className="text-xs text-slate-400 font-mono">TEMPO AGUENTADO</span>
                <span className="text-pink-400 font-mono text-3xl font-black">{survivalTime}s</span>
                <span className="text-[10px] text-green-400 font-mono">PONTUAÇÃO SALVA: {survivalTime * 10}pts</span>
              </div>
            ) : (
              <div className="bg-slate-950 py-4 rounded-xl border border-slate-800 flex justify-center items-center gap-6 font-mono text-3xl font-bold">
                <span className="text-cyan-400">{score.p1}</span>
                <span className="text-slate-600">-</span>
                <span className="text-pink-400">{score.p2}</span>
              </div>
            )}

            <div className="space-y-3">
              {gameMode !== 'online' && (
                <button 
                  onClick={() => startGame(gameMode)}
                  className="w-full py-3 bg-indigo-600 hover:bg-indigo-500 font-semibold rounded-xl transition flex items-center justify-center gap-2"
                >
                  <RotateCcw className="w-5 h-5" /> Desafiar Novamente
                </button>
              )}

              <button 
                onClick={quitToMenu}
                className="w-full py-3 bg-slate-850 hover:bg-slate-800 border border-slate-700/60 font-semibold rounded-xl transition"
              >
                Voltar ao Terminal Principal
              </button>
            </div>
          </div>
        )}
      </main>

      {/* --- RODAPÉ --- */}
      <footer className="px-6 py-4 border-t border-slate-900 bg-slate-950 text-slate-500 text-xs flex flex-col md:flex-row items-center justify-between gap-2 z-10">
        <div>
          <span>Motor Física 2D Neon • Conexão P2P Firebase • Spin de Raquete Ativado</span>
        </div>
        <div className="flex gap-4 font-mono text-[10px]">
          <span>© 2026 NEON PONG INC.</span>
        </div>
      </footer>
    </div>
  );
}