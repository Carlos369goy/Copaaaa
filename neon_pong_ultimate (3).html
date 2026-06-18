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
  UserCheck,
  Wind,
  Orbit,
  Dices,
  Layers
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
  getDocs
} from 'firebase/firestore';

// --- CONFIGURAÇÃO DO FIREBASE ---
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

// Constantes lógicas do jogo (Espaço de coordenadas virtuais)
const V_WIDTH = 800;
const V_HEIGHT = 500;
const PADDLE_HEIGHT_DEFAULT = 90;
const PADDLE_WIDTH = 14;
const BALL_SIZE = 10;
const MAX_SCORE = 7; 

export default function App() {
  // --- ESTADOS DO UTILIZADOR E SISTEMA ---
  const [user, setUser] = useState(null);
  const [playerName, setPlayerName] = useState('CyberPlayer');
  const [isEditingName, setIsEditingName] = useState(false);
  const [soundEnabled, setSoundEnabled] = useState(true);
  const [gameMode, setGameMode] = useState(null); // 'ia', 'local', 'online'
  
  // Modos de Jogo Expandidos
  const [subMode, setSubMode] = useState('classico'); 
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
  
  // Referências físicas estáveis
  const p1Y = useRef(V_HEIGHT / 2 - PADDLE_HEIGHT_DEFAULT / 2);
  const p2Y = useRef(V_HEIGHT / 2 - PADDLE_HEIGHT_DEFAULT / 2);
  const p1Height = useRef(PADDLE_HEIGHT_DEFAULT);
  const p2Height = useRef(PADDLE_HEIGHT_DEFAULT);
  
  // Velocidades anteriores para cálculo de spin
  const p1PrevY = useRef(p1Y.current);
  const p2PrevY = useRef(p2Y.current);
  const p1SpeedY = useRef(0);
  const p2SpeedY = useRef(0);

  // Motor de Múltiplas Bolas
  const balls = useRef([]); 
  const particles = useRef([]); // Faíscas de colisão
  const obstacles = useRef([]); // Obstáculos para o modo Caos e Buracos Negros
  const portals = useRef([]); // Portais quânticos

  // Grelha Deformável Avançada (Warp Grid para efeitos de onda de choque)
  const gridNodes = useRef([]);
  const gridSpacing = 40;

  // Variável do Modo Ventania
  const windForce = useRef(0); 
  const windTimer = useRef(0);

  const keysPressed = useRef({});
  const screenShake = useRef(0);
  const audioCtxRef = useRef(null);

  // --- REFERÊNCIAS DE SEGURANÇA CONTRA FECHOS OBSOLETOS (STALE CLOSURES) ---
  const stateRefs = useRef({
    playerName,
    difficulty,
    subMode,
    gameMode,
    isHost,
    score,
    gameState
  });

  useEffect(() => {
    stateRefs.current = {
      playerName,
      difficulty,
      subMode,
      gameMode,
      isHost,
      score,
      gameState
    };
  }, [playerName, difficulty, subMode, gameMode, isHost, score, gameState]);

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
        console.error("Erro na autenticação anónima:", error);
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

  // --- AUTO-FOCO AUTOMÁTICO NO INÍCIO ---
  useEffect(() => {
    if (gameState === 'playing') {
      const timer = setTimeout(() => {
        canvasRef.current?.focus();
      }, 150);
      return () => clearTimeout(timer);
    }
  }, [gameState]);

  // --- INICIALIZAR GRELHA DEFORMÁVEL ---
  const initWarpGrid = () => {
    const nodes = [];
    for (let x = 0; x <= V_WIDTH; x += gridSpacing) {
      for (let y = 0; y <= V_HEIGHT; y += gridSpacing) {
        nodes.push({
          x: x,
          y: y,
          ox: x, // x original
          oy: y, // y original
          vx: 0,
          vy: 0
        });
      }
    }
    gridNodes.current = nodes;
  };

  // Provoca uma distorção na grelha no ponto (x,y)
  const triggerGridExplosion = (cx, cy, force) => {
    gridNodes.current.forEach(node => {
      const dx = node.x - cx;
      const dy = node.y - cy;
      const distSq = dx * dx + dy * dy;
      const dist = Math.sqrt(distSq);
      
      if (dist < 180 && dist > 0) {
        // Direção de propagação
        const factor = (180 - dist) / 180;
        const push = factor * force;
        node.vx += (dx / dist) * push;
        node.vy += (dy / dist) * push;
      }
    });
  };

  // Atualiza posições físicas da grelha (Efeito mola/amortecimento)
  const updateWarpGrid = () => {
    const springK = 0.08; // Força elástica de retorno
    const damping = 0.88; // Atrito físico

    gridBoundaryConstraint(); // Restringe bordas virtuais
    
    obstacles.current.forEach(obs => {
      if (obs.type === 'gravity_well') {
        const pulseStrength = 3 + Math.sin(Date.now() * 0.01) * 2.5;
        gridAttract(obs.x, obs.y, 140, pulseSpeed(0.005) * 5 + pulse);
      }
    });

    gridAttractUpdate();
  };

  const loadLeaderboard = async () => {
    try {
      const lbCol = collection(db, 'artifacts', appId, 'public', 'data', 'leaderboard');
      const snap = await getDocs(lbCol);
      const list = [];
      snap.forEach(doc => {
        list.push({ id: doc.id, ...doc.data() });
      });
      list.sort((a, b) => b.score - a.score);
      setLeaderboard(list.slice(0, 6)); 
    } catch (e) {
      console.warn("Erro ao obter líderes:", e);
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
          name: stateRefs.current.playerName,
          score: finalScore,
          date: Date.now()
        }, { merge: true });
        loadLeaderboard();
      }
    } catch (e) {
      console.warn("Erro ao guardar pontos:", e);
    }
  };

  // --- SINTETIZADOR DE EFEITOS SONOROS (WEB AUDIO) ---
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
        osc.frequency.setValueAtTime(170, ctx.currentTime);
        osc.frequency.exponentialRampToValueAtTime(360, ctx.currentTime + 0.1);
        gain.gain.setValueAtTime(0.18, ctx.currentTime);
        gain.gain.exponentialRampToValueAtTime(0.01, ctx.currentTime + 0.1);
        osc.start();
        osc.stop(ctx.currentTime + 0.1);
      } else if (type === 'wall') {
        osc.type = 'sine';
        osc.frequency.setValueAtTime(110, ctx.currentTime);
        osc.frequency.exponentialRampToValueAtTime(160, ctx.currentTime + 0.08);
        gain.gain.setValueAtTime(0.1, ctx.currentTime);
        gain.gain.exponentialRampToValueAtTime(0.01, ctx.currentTime + 0.08);
        osc.start();
        osc.stop(ctx.currentTime + 0.08);
      } else if (type === 'score') {
        osc.type = 'sawtooth';
        osc.frequency.setValueAtTime(260, ctx.currentTime);
        osc.frequency.exponentialRampToValueAtTime(520, ctx.currentTime + 0.25);
        gain.gain.setValueAtTime(0.12, ctx.currentTime);
        gain.gain.exponentialRampToValueAtTime(0.01, ctx.currentTime + 0.25);
        osc.start();
        osc.stop(ctx.currentTime + 0.25);
      } else if (type === 'teleport') {
        osc.type = 'sine';
        osc.frequency.setValueAtTime(500, ctx.currentTime);
        osc.frequency.exponentialRampToValueAtTime(180, ctx.currentTime + 0.2);
        gain.gain.setValueAtTime(0.15, ctx.currentTime);
        gain.gain.exponentialRampToValueAtTime(0.01, ctx.currentTime + 0.2);
        osc.start();
        osc.stop(ctx.currentTime + 0.2);
      } else if (type === 'gameover') {
        osc.type = 'sawtooth';
        osc.frequency.setValueAtTime(350, ctx.currentTime);
        osc.frequency.linearRampToValueAtTime(80, ctx.currentTime + 0.5);
        gain.gain.setValueAtTime(0.18, ctx.currentTime);
        gain.gain.exponentialRampToValueAtTime(0.01, ctx.currentTime + 0.6);
        osc.start();
        osc.stop(ctx.currentTime + 0.6);
      }
    } catch (e) {
      console.warn("Problema de áudio:", e);
    }
  };

  // --- GERADOR DE PARTÍCULAS DE ALTA VELOCIDADE ---
  const createParticles = (x, y, color, speedMultiplier = 1) => {
    const count = 18; // Mais partículas para maior impacto visual
    for (let i = 0; i < count; i++) {
      particles.current.push({
        x: x,
        y: y,
        vx: (Math.random() - 0.5) * 8 * speedMultiplier,
        vy: (Math.random() - 0.5) * 8 * speedMultiplier,
        radius: Math.random() * 3.5 + 1.2,
        alpha: 1,
        color: color,
        decay: Math.random() * 0.02 + 0.012,
        gravity: 0.06 // Toque de física gravitacional para faíscas que caem
      });
    }
  };

  // --- COMPORTAMENTO DA GRELHA ---
  const gridAttractUpdate = () => {
    const springK = 0.07;
    const damping = 0.86;
    gridNodes.current.forEach(node => {
      // Força de atração à sua origem
      const ax = (node.ox - node.x) * springK;
      const ay = (node.oy - node.y) * springK;
      node.vx = (node.vx + ax) * damping;
      node.vy = (node.vy + ay) * damping;
      node.x += node.vx;
      node.y += node.vy;
    });
  };

  const gridBoundaryConstraint = () => {
    gridNodes.current.forEach(node => {
      if (node.ox === 0 || node.ox === V_WIDTH || node.oy === 0 || node.oy === V_HEIGHT) {
        node.x = node.ox;
        node.y = node.oy;
        node.vx = 0;
        node.vy = 0;
      }
    });
  };

  const gridAttract = (cx, cy, radius, strength) => {
    gridNodes.current.forEach(node => {
      const dx = cx - node.x;
      const dy = cy - node.y;
      const dist = Math.sqrt(dx * dx + dy * dy);
      if (dist < radius && dist > 0) {
        const pull = (1 - (dist / radius)) * strength;
        node.vx += (dx / dist) * pull;
        node.vy += (dy / dist) * pull;
      }
    });
  };

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
        p1Height: p1Height.current,
        p2Height: p2Height.current,
        balls: balls.current,
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
        setErrorMessage('A sala selecionada está cheia!');
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
      setSubMode(data.subMode); 
      setGameState('playing');
      resetBalls();
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
        p1Height.current = data.p1Height || PADDLE_HEIGHT_DEFAULT;
        p2Height.current = data.p2Height || PADDLE_HEIGHT_DEFAULT;
        
        if (data.balls) {
          balls.current = data.balls;
        }
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
      console.error("Erro no Listener Firestore:", err);
    });

    networkIntervalRef.current = setInterval(async () => {
      try {
        const currentIsHost = stateRefs.current.isHost;
        const currentScore = stateRefs.current.score;
        if (currentIsHost) {
          await updateDoc(roomRef, {
            hostY: p1Y.current,
            p1Height: p1Height.current,
            p2Height: p2Height.current,
            balls: balls.current,
            hostScore: currentScore.p1,
            clientScore: currentScore.p2,
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
    }, 45);

    return () => {
      unsubscribe();
      if (networkIntervalRef.current) clearInterval(networkIntervalRef.current);
    };
  }, [roomId, gameMode]);

  // --- CONFIGURAR MODOS ESPECIAIS ---
  const setupGameModifiers = () => {
    particles.current = [];
    portals.current = [];
    p1Height.current = PADDLE_HEIGHT_DEFAULT;
    p2Height.current = PADDLE_HEIGHT_DEFAULT;
    initWarpGrid(); // Inicializa a grelha de deformação
    
    if (subMode === 'caos') {
      obstacles.current = [
        { x: V_WIDTH / 2, y: V_HEIGHT / 3, r: 24, pulse: 0, type: 'bouncer' },
        { x: V_WIDTH / 2, y: (V_HEIGHT / 3) * 2, r: 24, pulse: Math.PI, type: 'bouncer' }
      ];
      setActivePowerUpMsg('Campo de Força: Obstáculos de ricochete ativos!');
    } 
    else if (subMode === 'gravidade') {
      obstacles.current = [
        { x: V_WIDTH / 2, y: V_HEIGHT / 2, r: 35, pulse: 0, type: 'gravity_well' }
      ];
      setActivePowerUpMsg('Efeito Singularidade: Buraco Negro central atrai a bola!');
    } 
    else if (subMode === 'portais') {
      portals.current = [
        { x: V_WIDTH * 0.3, y: 40, w: 10, h: 60, targetIdx: 1, color: '#06b6d4' },
        { x: V_WIDTH * 0.7, y: V_HEIGHT - 100, w: 10, h: 60, targetIdx: 0, color: '#ec4899' }
      ];
      setActivePowerUpMsg('Distorção Espacial: Portais ativados!');
    } 
    else if (subMode === 'ventania') {
      windForce.current = 0;
      windTimer.current = 0;
      setActivePowerUpMsg('Frente Meteorológica: Ventos laterais dinâmicos!');
    } 
    else {
      obstacles.current = [];
      setActivePowerUpMsg('');
    }

    if (subMode === 'sobrevivencia') {
      setSurvivalTime(0);
      setActivePowerUpMsg('Sobrevivência: As raquetes encolhem a cada 8 segundos!');
      if (survivalTimerRef.current) clearInterval(survivalTimerRef.current);
      survivalTimerRef.current = setInterval(() => {
        setSurvivalTime(prev => {
          const next = prev + 1;
          if (next % 8 === 0) {
            p1Height.current = Math.max(35, p1Height.current - 12);
            p2Height.current = Math.max(35, p2Height.current - 12);
            setActivePowerUpMsg('Aviso: Raquetes Encolheram!');
            playSound('wall');
          }
          return next;
        });
      }, 1000);
    }
  };

  const resetBalls = () => {
    balls.current = [];
    const numBalls = stateRefs.current.subMode === 'duasbolas' ? 2 : 1;
    
    for (let i = 0; i < numBalls; i++) {
      const dirX = Math.random() > 0.5 ? 1 : -1;
      const dirY = (Math.random() > 0.5 ? 1 : -1) * (Math.random() * 0.5 + 0.8);
      
      let baseSpeed = 5.2;
      if (stateRefs.current.subMode === 'sobrevivencia') baseSpeed = 6.5;
      if (stateRefs.current.gameMode === 'ia' && stateRefs.current.difficulty === 'impossivel') baseSpeed = 7.5;

      const offset = i * 40;

      balls.current.push({
        id: i,
        x: V_WIDTH / 2,
        y: V_HEIGHT / 2 - 20 + offset,
        vx: dirX * baseSpeed,
        vy: dirY * baseSpeed,
        color: i === 0 ? '#a855f7' : '#22c55e', 
        trail: []
      });
    }
  };

  // --- ESCUTADORES DE TECLADO ---
  useEffect(() => {
    const handleKeyDown = (e) => {
      const key = e.key;
      keysPressed.current[key] = true;
      keysPressed.current[key.toLowerCase()] = true; 
      
      if (['ArrowUp', 'ArrowDown', ' ', 'w', 's', 'W', 'S'].includes(key)) {
        e.preventDefault();
      }
    };

    const handleKeyUp = (e) => {
      const key = e.key;
      keysPressed.current[key] = false;
      keysPressed.current[key.toLowerCase()] = false;
    };

    window.addEventListener('keydown', handleKeyDown);
    window.addEventListener('keyup', handleKeyUp);
    return () => {
      window.removeEventListener('keydown', handleKeyDown);
      window.removeEventListener('keyup', handleKeyUp);
    };
  }, []);

  // --- FÍSICA E JOGABILIDADE ---
  const updatePhysics = () => {
    const currentSubMode = stateRefs.current.subMode;
    const currentGameMode = stateRefs.current.gameMode;
    const currentIsHost = stateRefs.current.isHost;
    const currentDifficulty = stateRefs.current.difficulty;

    // Preservar posições anteriores para o cálculo de spin
    const p1Prev = p1Y.current;
    const p2Prev = p2Y.current;

    const paddleSpeed = 8.5;

    if (screenShake.current > 0) {
      screenShake.current -= 0.12;
    }

    if (currentSubMode === 'ventania') {
      windTimer.current += 1;
      if (windTimer.current % 180 === 0) {
        windForce.current = (Math.random() - 0.5) * 0.28; 
        setActivePowerUpMsg(
          windForce.current > 0 
            ? 'Vento forte de Leste (➔) ativo!' 
            : 'Vento forte de Oeste (➔) ativo!'
        );
      }
    }

    // Atualização física da grelha de distorção
    updateWarpGrid();

    // Partículas em loop reverso para prevenir saltos de índice
    for (let i = particles.current.length - 1; i >= 0; i--) {
      const p = particles.current[i];
      p.x += p.vx;
      p.y += p.vy;
      p.vy += p.gravity; // Aplica gravidade nas faíscas
      p.alpha -= p.decay;
      if (p.alpha <= 0) {
        particles.current.splice(i, 1);
      }
    }

    // --- MOVIMENTO DO JOGADOR 1 (ESQUERDA) ---
    if (currentGameMode !== 'online' || currentIsHost) {
      const wPressed = keysPressed.current['w'] || keysPressed.current['W'];
      const sPressed = keysPressed.current['s'] || keysPressed.current['S'];
      
      const acceptArrowsForP1 = currentGameMode === 'ia' || currentSubMode === 'sobrevivencia';
      const p1Up = wPressed || (acceptArrowsForP1 && keysPressed.current['ArrowUp']);
      const p1Down = sPressed || (acceptArrowsForP1 && keysPressed.current['ArrowDown']);

      if (p1Up) {
        p1Y.current = Math.max(0, p1Y.current - paddleSpeed);
      }
      if (p1Down) {
        p1Y.current = Math.min(V_HEIGHT - p1Height.current, p1Y.current + paddleSpeed);
      }
    }

    // --- MOVIMENTO DO JOGADOR 2 (DIREITA) ---
    if (currentGameMode === 'local') {
      if (keysPressed.current['ArrowUp']) {
        p2Y.current = Math.max(0, p2Y.current - paddleSpeed);
      }
      if (keysPressed.current['ArrowDown']) {
        p2Y.current = Math.min(V_HEIGHT - p2Height.current, p2Y.current + paddleSpeed);
      }
    } else if (currentGameMode === 'ia') {
      let targetSpeed = 5;
      let errorChance = 0.15;
      
      if (currentDifficulty === 'facil') {
        targetSpeed = 3;
        errorChance = 0.35;
      } else if (currentDifficulty === 'impossivel') {
        targetSpeed = 9;
        errorChance = 0.02;
      }

      const paddleCenter = p2Y.current + p2Height.current / 2;
      
      let primaryBall = balls.current[0];
      if (balls.current.length > 1) {
        const b0 = balls.current[0];
        const b1 = balls.current[1];
        if (b0 && b1) {
          primaryBall = b0.x > b1.x ? b0 : b1; 
        }
      }

      if (primaryBall) {
        const targetY = primaryBall.y + (Math.sin(Date.now() * 0.005) * (currentDifficulty === 'facil' ? 40 : 10));
        if (primaryBall.x > V_WIDTH * (currentDifficulty === 'facil' ? 0.5 : 0.2)) {
          if (Math.random() > errorChance) {
            if (targetY < paddleCenter - 15) {
              p2Y.current = Math.max(0, p2Y.current - targetSpeed);
            } else if (targetY > paddleCenter + 15) {
              p2Y.current = Math.min(V_HEIGHT - p2Height.current, p2Y.current + targetSpeed);
            }
          }
        }
      }
    } else if (currentGameMode === 'online' && !currentIsHost) {
      if (keysPressed.current['w'] || keysPressed.current['W'] || keysPressed.current['ArrowUp']) {
        p2Y.current = Math.max(0, p2Y.current - paddleSpeed);
      }
      if (keysPressed.current['s'] || keysPressed.current['S'] || keysPressed.current['ArrowDown']) {
        p2Y.current = Math.min(V_HEIGHT - p2Height.current, p2Y.current + paddleSpeed);
      }
    }

    // Calcular velocidade real para o efeito de Spin
    p1SpeedY.current = p1Y.current - p1Prev;
    p2SpeedY.current = p2Y.current - p2Prev;

    // --- FÍSICA E COLISÃO DAS BOLAS (Host ou Solo) ---
    if (currentGameMode !== 'online' || currentIsHost) {
      const ballsToKeep = [];
      let p1Scored = false;
      let p2Scored = false;

      balls.current.forEach((ball) => {
        if (currentSubMode === 'ventania') {
          ball.vx += windForce.current;
        }

        if (currentSubMode === 'gravidade') {
          obstacles.current.forEach(obs => {
            if (obs.type === 'gravity_well') {
              const dx = obs.x - ball.x;
              const dy = obs.y - ball.y;
              const dist = Math.sqrt(dx * dx + dy * dy);
              if (dist > 15) {
                const force = 22 / (dist * 0.1); // Força gravitacional um pouco maior para impacto visual
                ball.vx += (dx / dist) * force * 0.055;
                ball.vy += (dy / dist) * force * 0.055;
                
                // Distorção subtil contínua na grelha no centro do buraco negro
                triggerGridExplosion(obs.x, obs.y, -0.4);
              }
            }
          });
        }

        ball.x += ball.vx;
        ball.y += ball.vy;

        if (!ball.trail) ball.trail = [];
        ball.trail.push({ x: ball.x, y: ball.y });
        if (ball.trail.length > 12) ball.trail.shift(); // Rastro mais longo e fluido

        // Colisão Parede Teto / Chão
        if (ball.y <= BALL_SIZE || ball.y >= V_HEIGHT - BALL_SIZE) {
          ball.vy = -ball.vy * 1.01;
          ball.y = ball.y <= BALL_SIZE ? BALL_SIZE : V_HEIGHT - BALL_SIZE;
          playSound('wall');
          createParticles(ball.x, ball.y, ball.color, 0.7);
          triggerGridExplosion(ball.x, ball.y, 4); // Distorção da grelha na parede
        }

        // Colisão Portais
        if (currentSubMode === 'portais') {
          portals.current.forEach((port) => {
            if (
              ball.x + BALL_SIZE >= port.x &&
              ball.x - BALL_SIZE <= port.x + port.w &&
              ball.y + BALL_SIZE >= port.y &&
              ball.y - BALL_SIZE <= port.y + port.h
            ) {
              const destination = portals.current[port.targetIdx];
              if (destination) {
                triggerGridExplosion(ball.x, ball.y, 8); // Onda de choque na entrada
                ball.x = destination.x + (ball.vx > 0 ? 30 : -30);
                ball.y = destination.y + (port.h / 2);
                playSound('teleport');
                createParticles(ball.x, ball.y, '#c084fc', 1.2);
                triggerGridExplosion(ball.x, ball.y, 10); // Onda de choque na saída
                screenShake.current = 1.8;
              }
            }
          });
        }

        // Colisão Obstáculos Modo Caos
        if (currentSubMode === 'caos') {
          obstacles.current.forEach(obs => {
            obs.pulse += 0.04;
            const currentRadius = obs.r + Math.sin(obs.pulse) * 4;
            const dx = ball.x - obs.x;
            const dy = ball.y - obs.y;
            const distance = Math.sqrt(dx * dx + dy * dy);

            if (distance < currentRadius + BALL_SIZE) {
              const nx = dx / distance;
              const ny = dy / distance;
              const dot = ball.vx * nx + ball.vy * ny;
              
              ball.vx = (ball.vx - 2 * dot * nx) * 1.03;
              ball.vy = (ball.vy - 2 * dot * ny) * 1.03;

              ball.x = obs.x + nx * (currentRadius + BALL_SIZE + 2);
              ball.y = obs.y + ny * (currentRadius + BALL_SIZE + 2);

              playSound('teleport');
              createParticles(ball.x, ball.y, '#facc15', 1);
              triggerGridExplosion(ball.x, ball.y, 12); // Deformação de grelha
              screenShake.current = 1.2;
            }
          });
        }

        // Colisão Raquete Esquerda (P1)
        if (ball.x - BALL_SIZE <= PADDLE_WIDTH + 15) {
          if (ball.x >= 15) {
            if (ball.y >= p1Y.current && ball.y <= p1Y.current + p1Height.current) {
              const relativeIntersectY = (p1Y.current + (p1Height.current / 2)) - ball.y;
              const normalizedIntersectY = relativeIntersectY / (p1Height.current / 2);
              
              const bounceAngle = normalizedIntersectY * (Math.PI / 2.8);
              const speed = Math.sqrt(ball.vx * ball.vx + ball.vy * ball.vy) * 1.05;

              ball.vx = Math.abs(Math.cos(bounceAngle) * speed);
              ball.vy = -Math.sin(bounceAngle) * speed + (p1SpeedY.current * 0.35);

              ball.x = PADDLE_WIDTH + 16;
              playSound('hit');
              createParticles(ball.x, ball.y, '#06b6d4', 1.1);
              triggerGridExplosion(ball.x, ball.y, 14); // Distorção forte na grelha
              screenShake.current = 2.0;
            }
          }
        }

        // Colisão Raquete Direita (P2)
        if (ball.x + BALL_SIZE >= V_WIDTH - PADDLE_WIDTH - 15) {
          if (ball.x <= V_WIDTH - 15) {
            if (ball.y >= p2Y.current && ball.y <= p2Y.current + p2Height.current) {
              const relativeIntersectY = (p2Y.current + (p2Height.current / 2)) - ball.y;
              const normalizedIntersectY = relativeIntersectY / (p2Height.current / 2);
              
              const bounceAngle = normalizedIntersectY * (Math.PI / 2.8);
              const speed = Math.sqrt(ball.vx * ball.vx + ball.vy * ball.vy) * 1.05;

              ball.vx = -Math.abs(Math.cos(bounceAngle) * speed);
              ball.vy = -Math.sin(bounceAngle) * speed + (p2SpeedY.current * 0.35);

              ball.x = V_WIDTH - PADDLE_WIDTH - 16;
              playSound('hit');
              createParticles(ball.x, ball.y, '#ec4899', 1.1);
              triggerGridExplosion(ball.x, ball.y, 14); // Distorção forte na grelha
              screenShake.current = 2.0;
            }
          }
        }

        // Verificar Saída de Campo (Golo)
        if (ball.x < 0) {
          p2Scored = true;
          createParticles(0, ball.y, '#ec4899', 1.8);
          triggerGridExplosion(40, ball.y, 25); // Onda de choque de golo massiva
          screenShake.current = 4.5;
          playSound('score');
        } else if (ball.x > V_WIDTH) {
          p1Scored = true;
          createParticles(V_WIDTH, ball.y, '#06b6d4', 1.8);
          triggerGridExplosion(V_WIDTH - 40, ball.y, 25); // Onda de choque de golo massiva
          screenShake.current = 4.5;
          playSound('score');
        } else {
          ballsToKeep.push(ball);
        }
      });

      balls.current = ballsToKeep;

      if (p1Scored) {
        if (currentSubMode === 'sobrevivencia') {
          endSurvivalGame();
        } else {
          setScore(prev => {
            const next = { ...prev, p1: prev.p1 + 1 };
            if (next.p1 >= MAX_SCORE) {
              setGameState('gameover');
              setWinner(stateRefs.current.playerName || 'Jogador 1');
              playSound('gameover');
              if (currentGameMode === 'ia') {
                const baseScore = currentDifficulty === 'impossivel' ? 2000 : (currentDifficulty === 'normal' ? 1000 : 400);
                saveScoreToLeaderboard(baseScore);
              }
            }
            return next;
          });
        }
      }

      if (p2Scored) {
        if (currentSubMode === 'sobrevivencia') {
          endSurvivalGame();
        } else {
          setScore(prev => {
            const next = { ...prev, p2: prev.p2 + 1 };
            if (next.p2 >= MAX_SCORE) {
              setGameState('gameover');
              const finalWinner = currentGameMode === 'ia' ? 'IA Cibernética' : 'Jogador 2';
              setWinner(finalWinner);
              playSound('gameover');
            }
            return next;
          });
        }
      }

      if (balls.current.length === 0 || p1Scored || p2Scored) {
        resetBalls();
      }
    }
  };

  const endSurvivalGame = () => {
    setGameState('gameover');
    setWinner('Fim da Corrida');
    playSound('gameover');
    if (survivalTimerRef.current) clearInterval(survivalTimerRef.current);
    const scoreEarned = survivalTime * 12;
    saveScoreToLeaderboard(scoreEarned);
  };

  // --- RENDERIZAÇÃO GRÁFICA ULTRA CYBERPUNK NO CANVAS ---
  const draw = () => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    ctx.save();
    
    // Efeito Screen Shake (Tremores de ecrã dinâmicos nas colisões e golos)
    if (screenShake.current > 0) {
      const dx = (Math.random() - 0.5) * screenShake.current * 5;
      const dy = (Math.random() - 0.5) * screenShake.current * 5;
      ctx.translate(dx, dy);
    }

    // 1. Limpeza de Fundo com Degradê Profundo e Vinheta Escura
    const bgGrad = ctx.createRadialGradient(V_WIDTH / 2, V_HEIGHT / 2, 50, V_WIDTH / 2, V_HEIGHT / 2, V_WIDTH * 0.6);
    bgGrad.addColorStop(0, '#090d22');
    bgGrad.addColorStop(1, '#020208');
    ctx.fillStyle = bgGrad;
    ctx.fillRect(0, 0, V_WIDTH, V_HEIGHT);

    // 2. Renderizar Grelha Deformável Avançada (Warping Grid) com Conexões de Linhas Suaves
    ctx.strokeStyle = 'rgba(79, 70, 229, 0.12)';
    ctx.lineWidth = 1;
    
    // Desenhar linhas horizontais da grelha ligando os nós deformados
    const cols = V_WIDTH / gridSpacing + 1;
    const rows = V_HEIGHT / gridSpacing + 1;

    for (let r = 0; r < rows; r++) {
      ctx.beginPath();
      for (let c = 0; r * cols + c < gridNodes.current.length && c < cols; c++) {
        const node = gridNodes.current[r * cols + c];
        if (c === 0) {
          ctx.moveTo(node.x, node.y);
        } else {
          ctx.lineTo(node.x, node.y);
        }
      }
      ctx.stroke();
    }

    // Desenhar linhas verticais da grelha
    for (let c = 0; c < cols; c++) {
      ctx.beginPath();
      for (let r = 0; r < rows; r++) {
        const idx = r * cols + c;
        if (idx < gridNodes.current.length) {
          const node = gridNodes.current[idx];
          if (r === 0) {
            ctx.moveTo(node.x, node.y);
          } else {
            ctx.lineTo(node.x, node.y);
          }
        }
      }
      ctx.stroke();
    }

    // 3. Linha Divisória Central de Campo Néon
    ctx.strokeStyle = 'rgba(99, 102, 241, 0.22)';
    ctx.lineWidth = 4;
    ctx.setLineDash([12, 10]);
    ctx.beginPath();
    ctx.moveTo(V_WIDTH / 2, 0);
    ctx.lineTo(V_WIDTH / 2, V_HEIGHT);
    ctx.stroke();
    ctx.setLineDash([]);

    // 4. Renderizar Obstáculos Especiais e Efeitos de Buracos Negros
    obstacles.current.forEach(obs => {
      if (obs.type === 'gravity_well') {
        const rad = obs.r + Math.sin(Date.now() * 0.005) * 6;
        
        // Efeito de acreção de buraco negro holográfico com várias camadas
        const grad = ctx.createRadialGradient(obs.x, obs.y, 4, obs.x, obs.y, rad);
        grad.addColorStop(0, '#000000');
        grad.addColorStop(0.35, '#1e1b4b');
        grad.addColorStop(0.65, '#4f46e5');
        grad.addColorStop(0.9, 'rgba(168, 85, 247, 0.35)');
        grad.addColorStop(1, 'rgba(79, 70, 229, 0)');
        
        ctx.fillStyle = grad;
        ctx.beginPath();
        ctx.arc(obs.x, obs.y, rad * 1.2, 0, Math.PI * 2);
        ctx.fill();

        // Anel de luz neon pulsante
        ctx.strokeStyle = '#8b5cf6';
        ctx.shadowColor = '#6366f1';
        ctx.shadowBlur = 25;
        ctx.lineWidth = 3;
        ctx.stroke();
        ctx.shadowBlur = 0;

        // Desenhar partículas de acreção a girar em torno do buraco negro
        ctx.strokeStyle = 'rgba(168, 85, 247, 0.5)';
        ctx.lineWidth = 1.5;
        ctx.beginPath();
        ctx.arc(obs.x, obs.y, rad * 0.8, (Date.now() * 0.002) % (Math.PI * 2), ((Date.now() * 0.002) + Math.PI * 1.2) % (Math.PI * 2));
        ctx.stroke();
      } else {
        // Obstáculos normais do Modo Caos (Estilo Cristais de Plasma Amarelo)
        const rad = obs.r + Math.sin(obs.pulse) * 3;
        const grad = ctx.createRadialGradient(obs.x, obs.y, 2, obs.x, obs.y, rad);
        grad.addColorStop(0, '#fffbeb');
        grad.addColorStop(0.4, '#fbbf24');
        grad.addColorStop(1, 'rgba(217, 119, 6, 0)');

        ctx.fillStyle = grad;
        ctx.beginPath();
        ctx.arc(obs.x, obs.y, rad * 1.1, 0, Math.PI * 2);
        ctx.fill();

        // Anel exterior néon
        ctx.strokeStyle = '#f59e0b';
        ctx.shadowColor = '#fbbf24';
        ctx.shadowBlur = 15;
        ctx.lineWidth = 2.5;
        ctx.stroke();
        ctx.shadowBlur = 0;
      }
    });

    // 5. Renderizar Portais Espaciais de Dobra Quântica
    if (stateRefs.current.subMode === 'portais') {
      portals.current.forEach(port => {
        ctx.save();
        ctx.shadowBlur = 20;
        ctx.shadowColor = port.color;
        
        // Degradê holográfico interno no portal
        const portGrad = ctx.createLinearGradient(port.x, port.y, port.x + port.w, port.y);
        portGrad.addColorStop(0, '#ffffff');
        portGrad.addColorStop(0.5, port.color);
        portGrad.addColorStop(1, '#1e1b4b');
        
        ctx.fillStyle = portGrad;
        ctx.beginPath();
        ctx.roundRect(port.x, port.y, port.w, port.h, 6);
        ctx.fill();
        
        // Moldura néon do portal
        ctx.strokeStyle = '#ffffff';
        ctx.lineWidth = 1.5;
        ctx.stroke();
        ctx.restore();
      });
    }

    // 6. Renderizar Partículas de Colisão com Rasto de Faísca
    particles.current.forEach(p => {
      ctx.save();
      ctx.globalAlpha = p.alpha;
      ctx.fillStyle = p.color;
      ctx.beginPath();
      // Desenha as faíscas como pequenos traços esticados na direção do seu vetor de velocidade
      const speed = Math.sqrt(p.vx * p.vx + p.vy * p.vy);
      if (speed > 1) {
        ctx.moveTo(p.x, p.y);
        ctx.lineTo(p.x - (p.vx / speed) * 8, p.y - (p.vy / speed) * 8);
        ctx.strokeStyle = p.color;
        ctx.lineWidth = p.radius;
        ctx.stroke();
      } else {
        ctx.arc(p.x, p.y, p.radius, 0, Math.PI * 2);
        ctx.fill();
      }
      ctx.restore();
    });

    // 7. Renderizar Bolas Ultra-Néon com Rasto Volumétrico de Plasma
    balls.current.forEach((ball) => {
      if (ball.trail && ball.trail.length > 1) {
        // Renderizar rasto contínuo e elegante (Ribbon Trail)
        ctx.save();
        ctx.beginPath();
        ctx.moveTo(ball.trail[0].x, ball.trail[0].y);
        for (let idx = 1; idx < ball.trail.length; idx++) {
          ctx.lineTo(ball.trail[idx].x, ball.trail[idx].y);
        }
        ctx.strokeStyle = ball.color;
        ctx.lineWidth = BALL_SIZE * 1.5;
        ctx.lineCap = 'round';
        ctx.lineJoin = 'round';
        
        // Efeito de atenuação com opacidade graduada
        const trailGrad = ctx.createLinearGradient(
          ball.trail[0].x, ball.trail[0].y,
          ball.x, ball.y
        );
        trailGrad.addColorStop(0, 'rgba(168, 85, 247, 0)');
        trailGrad.addColorStop(1, ball.color);
        
        ctx.strokeStyle = trailGrad;
        ctx.globalAlpha = 0.55;
        ctx.stroke();
        ctx.restore();
      }

      // Brilho intenso da bola principal (Core & Glow)
      ctx.save();
      ctx.shadowBlur = 25;
      ctx.shadowColor = ball.color;
      
      // Degradê radial para dar efeito de esfera 3D néon
      const ballGrad = ctx.createRadialGradient(ball.x - 3, ball.y - 3, 1, ball.x, ball.y, BALL_SIZE);
      ballGrad.addColorStop(0, '#ffffff'); // Núcleo brilhante quente
      ballGrad.addColorStop(0.4, ball.color);
      ballGrad.addColorStop(1, '#1e1b4b');
      
      ctx.fillStyle = ballGrad;
      ctx.beginPath();
      ctx.arc(ball.x, ball.y, BALL_SIZE, 0, Math.PI * 2);
      ctx.fill();
      ctx.restore();
    });

    // 8. Renderizar Raquetes Néon com Efeito de Vidro e Moldura de Força
    // Raquete Esquerda (Cyan)
    ctx.save();
    ctx.shadowBlur = 24;
    ctx.shadowColor = '#06b6d4';
    
    // Corpo de vidro ciano com reflexo de luz superior
    const p1Grad = ctx.createLinearGradient(15, p1Y.current, 15 + PADDLE_WIDTH, p1Y.current);
    p1Grad.addColorStop(0, '#22d3ee');
    p1Grad.addColorStop(0.4, '#06b6d4');
    p1Grad.addColorStop(1, '#083344');
    
    ctx.fillStyle = p1Grad;
    ctx.beginPath();
    ctx.roundRect(15, p1Y.current, PADDLE_WIDTH, p1Height.current, 6);
    ctx.fill();
    
    // Borda brilhante néon
    ctx.strokeStyle = 'rgba(255, 255, 255, 0.45)';
    ctx.lineWidth = 1.5;
    ctx.stroke();
    ctx.restore();

    // Raquete Direita (Rosa)
    ctx.save();
    ctx.shadowBlur = 24;
    ctx.shadowColor = '#ec4899';
    
    const p2Grad = ctx.createLinearGradient(
      V_WIDTH - PADDLE_WIDTH - 15, p2Y.current,
      V_WIDTH - 15, p2Y.current
    );
    p2Grad.addColorStop(0, '#f472b6');
    p2Grad.addColorStop(0.4, '#ec4899');
    p2Grad.addColorStop(1, '#500724');
    
    ctx.fillStyle = p2Grad;
    ctx.beginPath();
    ctx.roundRect(V_WIDTH - PADDLE_WIDTH - 15, p2Y.current, PADDLE_WIDTH, p2Height.current, 6);
    ctx.fill();
    
    ctx.strokeStyle = 'rgba(255, 255, 255, 0.45)';
    ctx.lineWidth = 1.5;
    ctx.stroke();
    ctx.restore();

    // 9. EFEITO DE FILTRO CRT & SCANLINES DE MONITOR RETRO (Filtro Gráfico Overlay)
    ctx.restore(); // Restaura transformações do tremor de ecrã para fixar scanlines estáticas
    
    // Desenha linhas de varrimento de fósforo CRT pretas ultra subtis
    ctx.save();
    ctx.fillStyle = 'rgba(0, 0, 0, 0.07)';
    for (let y = 0; y < V_HEIGHT; y += 3) {
      ctx.fillRect(0, y, V_WIDTH, 1.5);
    }
    
    // Efeito de vinheta de luz nas bordas (Vignette)
    const vignetteGrad = ctx.createRadialGradient(V_WIDTH / 2, V_HEIGHT / 2, V_WIDTH * 0.35, V_WIDTH / 2, V_HEIGHT / 2, V_WIDTH * 0.72);
    vignetteGrad.addColorStop(0, 'rgba(0,0,0,0)');
    vignetteGrad.addColorStop(1, 'rgba(0, 0, 0, 0.65)');
    ctx.fillStyle = vignetteGrad;
    ctx.fillRect(0, 0, V_WIDTH, V_HEIGHT);
    ctx.restore();
  };

  // --- LOOP DO JOGO PRINCIPAL ---
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
  }, [gameState]);

  const startGame = (mode) => {
    setGameMode(mode);
    setScore({ p1: 0, p2: 0 });
    setWinner(null);
    p1Y.current = V_HEIGHT / 2 - PADDLE_HEIGHT_DEFAULT / 2;
    p2Y.current = V_HEIGHT / 2 - PADDLE_HEIGHT_DEFAULT / 2;
    setupGameModifiers();
    resetBalls();
    
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
      console.error("Falha ao copiar:", err);
    }
  };

  return (
    <div className="min-h-screen bg-slate-950 text-white flex flex-col justify-between font-sans select-none overflow-hidden relative">
      
      {/* Efeitos Néon de Luz Ambiente Flutuante nas Bordas */}
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
            <p className="text-xs text-slate-400 font-mono">Batalha Retro & Modos de Jogo v3.3</p>
          </div>
        </div>

        {/* Nome do Jogador & Tabela de Líderes */}
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
            onClick={() => {
              loadLeaderboard();
              setShowLeaderboard(!showLeaderboard);
            }}
            className={`p-2.5 rounded-lg border transition ${showLeaderboard ? 'bg-indigo-600 text-white border-indigo-400' : 'bg-slate-900 border-slate-800 hover:bg-slate-800 text-slate-400 hover:text-white'}`}
            title="Tabela de Classificação"
          >
            <Trophy className="w-5 h-5" />
          </button>

          <button 
            onClick={() => setSoundEnabled(!soundEnabled)} 
            className="p-2.5 rounded-lg bg-slate-900 hover:bg-slate-800 border border-slate-800 hover:border-slate-700 transition"
            title="Sons do jogo"
          >
            {soundEnabled ? <Volume2 className="w-5 h-5 text-cyan-400" /> : <VolumeX className="w-5 h-5 text-slate-500" />}
          </button>
        </div>
      </header>

      {/* --- CONTEÚDO PRINCIPAL --- */}
      <main className="flex-1 flex flex-col items-center justify-center p-4 relative z-10">
        
        {/* Painel de Classificação (Overlay) */}
        {showLeaderboard && (
          <div className="absolute inset-0 bg-slate-950/90 flex items-center justify-center z-50 p-4 animate-fade-in">
            <div className="bg-slate-900 border border-slate-800 max-w-md w-full rounded-2xl p-6 shadow-2xl space-y-6">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <Trophy className="w-6 h-6 text-yellow-400" />
                  <h3 className="text-xl font-bold">Top Players Globais</h3>
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
                  <p className="text-slate-500 text-sm text-center py-6">Sem pontuações guardadas.</p>
                ) : (
                  leaderboard.map((player, index) => (
                    <div 
                      key={player.id} 
                      className={`flex items-center justify-between p-3 rounded-xl border font-mono ${index === 0 ? 'bg-yellow-950/20 border-yellow-500/30' : 'bg-slate-950/40 border-slate-900'}`}
                    >
                      <div className="flex items-center gap-3">
                        <span className={`w-6 h-6 rounded-md flex items-center justify-center text-xs font-bold ${index === 0 ? 'bg-yellow-500 text-black' : 'bg-slate-800 text-slate-300'}`}>
                          {index + 1}
                        </span>
                        <span className="font-bold text-sm text-slate-100 uppercase">{player.name}</span>
                      </div>
                      <div className="flex items-center gap-2">
                        <span className="text-xs text-slate-400">PONTOS:</span>
                        <span className="text-cyan-400 font-bold">{player.score}</span>
                      </div>
                    </div>
                  ))
                )}
              </div>
              <p className="text-[10px] text-slate-500 text-center uppercase tracking-wider">Ganha pontos ao bater a IA ou no modo de Sobrevivência</p>
            </div>
          </div>
        )}

        {/* --- MENU PRINCIPAL --- */}
        {gameState === 'menu' && (
          <div className="max-w-4xl w-full grid grid-cols-1 md:grid-cols-12 gap-6 animate-fade-in">
            
            {/* Esquerda: Seletor de Modo e Modos de Jogo */}
            <div className="md:col-span-7 bg-slate-900/60 border border-slate-800/80 p-6 rounded-2xl shadow-2xl backdrop-blur-xl flex flex-col justify-between space-y-6">
              <div className="space-y-4">
                <div className="space-y-1">
                  <span className="text-xs font-semibold tracking-widest text-cyan-400 uppercase bg-cyan-950/50 px-3 py-1 rounded-full border border-cyan-900/30">
                    Modulador Neuronal
                  </span>
                  <h2 className="text-3xl font-black">Modos de Batalha</h2>
                </div>

                {/* Grelha de Modos Expandida */}
                <div className="grid grid-cols-2 sm:grid-cols-4 gap-2 p-1.5 bg-slate-950 border border-slate-800/60 rounded-xl">
                  <button 
                    onClick={() => setSubMode('classico')}
                    className={`py-2 px-1 text-xs font-bold rounded-lg transition ${subMode === 'classico' ? 'bg-cyan-600 text-white' : 'text-slate-400 hover:text-white'}`}
                  >
                    Clássico
                  </button>
                  <button 
                    onClick={() => setSubMode('caos')}
                    className={`py-2 px-1 text-xs font-bold rounded-lg transition ${subMode === 'caos' ? 'bg-yellow-600 text-white' : 'text-slate-400 hover:text-white'}`}
                  >
                    Caos
                  </button>
                  <button 
                    onClick={() => setSubMode('sobrevivencia')}
                    className={`py-2 px-1 text-xs font-bold rounded-lg transition ${subMode === 'sobrevivencia' ? 'bg-pink-600 text-white' : 'text-slate-400 hover:text-white'}`}
                  >
                    Time Attack
                  </button>
                  <button 
                    onClick={() => setSubMode('ventania')}
                    className={`py-2 px-1 text-xs font-bold rounded-lg transition ${subMode === 'ventania' ? 'bg-teal-600 text-white' : 'text-slate-400 hover:text-white'}`}
                  >
                    Ventania
                  </button>
                  <button 
                    onClick={() => setSubMode('duasbolas')}
                    className={`py-2 px-1 text-xs font-bold rounded-lg transition col-span-1 ${subMode === 'duasbolas' ? 'bg-emerald-600 text-white' : 'text-slate-400 hover:text-white'}`}
                  >
                    2x Bolas
                  </button>
                  <button 
                    onClick={() => setSubMode('gravidade')}
                    className={`py-2 px-1 text-xs font-bold rounded-lg transition col-span-1 ${subMode === 'gravidade' ? 'bg-indigo-600 text-white' : 'text-slate-400 hover:text-white'}`}
                  >
                    Buraco Negro
                  </button>
                  <button 
                    onClick={() => setSubMode('portais')}
                    className={`py-2 px-1 text-xs font-bold rounded-lg transition col-span-2 ${subMode === 'portais' ? 'bg-fuchsia-600 text-white' : 'text-slate-400 hover:text-white'}`}
                  >
                    Portais Quânticos
                  </button>
                </div>

                {/* Exibição Inteligente da Descrição de cada Modo */}
                <div className="p-4 bg-slate-950/50 rounded-xl border border-slate-850 text-sm space-y-1 min-h-[76px]">
                  {subMode === 'classico' && (
                    <>
                      <p className="font-bold text-slate-100 flex items-center gap-1.5"><Flame className="w-4 h-4 text-cyan-400" /> Clássico Puro</p>
                      <p className="text-xs text-slate-400">A física lendária com aceleração contínua e efeito "spin" adicionado ao bater em movimento.</p>
                    </>
                  )}
                  {subMode === 'caos' && (
                    <>
                      <p className="font-bold text-slate-100 flex items-center gap-1.5"><Sparkles className="w-4 h-4 text-yellow-400" /> Campos Gravitacionais</p>
                      <p className="text-xs text-slate-400">Obstáculos centrais repelem e alteram o rumo de cada golo inesperadamente!</p>
                    </>
                  )}
                  {subMode === 'sobrevivencia' && (
                    <>
                      <p className="font-bold text-slate-100 flex items-center gap-1.5"><Clock className="w-4 h-4 text-pink-500" /> Corrida Contra o Relógio</p>
                      <p className="text-xs text-slate-400">Tente manter a bola ativa. As raquetes encolhem 12 pixels a cada 8 segundos de jogo!</p>
                    </>
                  )}
                  {subMode === 'ventania' && (
                    <>
                      <p className="font-bold text-slate-100 flex items-center gap-1.5"><Wind className="w-4 h-4 text-teal-400" /> Ventos Laterais</p>
                      <p className="text-xs text-slate-400">Forças eólicas variáveis sopram pela arena virtual, empurrando as trajetórias da bola.</p>
                    </>
                  )}
                  {subMode === 'duasbolas' && (
                    <>
                      <p className="font-bold text-slate-100 flex items-center gap-1.5"><Dices className="w-4 h-4 text-emerald-400" /> Modo Divisão Celular</p>
                      <p className="text-xs text-slate-400">Duas bolas ativas simultaneamente na arena. Atenção e coordenação duplicadas!</p>
                    </>
                  )}
                  {subMode === 'gravidade' && (
                    <>
                      <p className="font-bold text-slate-100 flex items-center gap-1.5"><Orbit className="w-4 h-4 text-indigo-400" /> Colapso Estelar</p>
                      <p className="text-xs text-slate-400">Um buraco negro massivo no centro atrai permanentemente a bola com forças de maré.</p>
                    </>
                  )}
                  {subMode === 'portais' && (
                    <>
                      <p className="font-bold text-slate-100 flex items-center gap-1.5"><Layers className="w-4 h-4 text-fuchsia-400" /> Portais Espaciais</p>
                      <p className="text-xs text-slate-400">Atravesse os portais brilhantes no campo para teletransportar a bola de surpresa para o adversário.</p>
                    </>
                  )}
                </div>
              </div>

              {/* Botões para Iniciar Partida */}
              <div className="space-y-2 pt-2">
                <button 
                  onClick={() => startGame('ia')}
                  className="w-full flex items-center justify-between p-4 bg-slate-850/70 hover:bg-slate-800 border border-slate-800 hover:border-cyan-500/40 rounded-xl transition group duration-200"
                >
                  <div className="flex items-center gap-3 text-left">
                    <div className="p-2.5 bg-cyan-950 text-cyan-400 rounded-lg group-hover:scale-105 transition">
                      <Cpu className="w-5 h-5" />
                    </div>
                    <div>
                      <div className="font-extrabold text-slate-100 text-sm">Combate contra Inteligência Artificial</div>
                      <div className="text-[11px] text-slate-400 font-mono">Controlos: Usa as SETAS ou W/S para guiar a raquete esquerda</div>
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
                      <div className="font-extrabold text-slate-100 text-sm">Batalha Local no Teclado</div>
                      <div className="text-[11px] text-slate-400 font-mono">Jogue no mesmo dispositivo [W/S] (Esquerda) vs [SETAS] (Direita)</div>
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
                      <div className="font-extrabold text-slate-100 text-sm">Lobby P2P Online</div>
                      <div className="text-[11px] text-slate-400 font-mono">Desafia os teus amigos à distância via Firestore</div>
                    </div>
                  </div>
                  <ChevronRight className="w-5 h-5 text-slate-500 group-hover:text-indigo-400" />
                </button>
              </div>
            </div>

            {/* Direita: Top Players & Teclado */}
            <div className="md:col-span-5 flex flex-col gap-6">
              <div className="bg-slate-900/60 border border-slate-800 p-6 rounded-2xl flex-1 flex flex-col justify-between">
                <div className="space-y-4">
                  <div className="flex items-center justify-between border-b border-slate-800 pb-3">
                    <h3 className="font-black text-sm tracking-widest text-slate-300 uppercase flex items-center gap-2">
                      <Trophy className="w-4 h-4 text-yellow-500 animate-bounce" /> Hall de Campeões
                    </h3>
                    <span className="text-[10px] font-mono text-indigo-400 font-semibold bg-indigo-950/40 px-2 py-0.5 rounded-full border border-indigo-900/30">PONTOS</span>
                  </div>
                  <div className="space-y-2">
                    {leaderboard.slice(0, 5).map((player, index) => (
                      <div key={player.id} className="flex items-center justify-between text-xs font-mono py-1.5 border-b border-slate-900/30">
                        <span className="text-slate-400 uppercase font-bold flex gap-2">
                          <span className="text-indigo-400">{index + 1}.</span> {player.name}
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
                  <p className="font-bold text-slate-400 uppercase mb-1">Controlos:</p>
                  <p>• <span className="text-cyan-400">Solo (vs IA / Sobrevivência):</span> Podes usar as <span className="text-cyan-400 font-semibold">Setas (Cima/Baixo)</span> ou <span className="text-cyan-400 font-semibold">W / S</span>.</p>
                  <p>• <span className="text-pink-500">Local (1v1):</span> Jogador Esquerda usa <span className="text-cyan-400 font-semibold">W / S</span>, Jogador Direita usa as <span className="text-pink-400 font-semibold">Setas (▲ / ▼)</span>.</p>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* --- ECRÃ DE CONFIGURAÇÃO (ONLINE) --- */}
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
                      Criar Sala no Modo ({subMode.toUpperCase()})
                    </button>

                    <div className="relative flex py-2 items-center">
                      <div className="flex-grow border-t border-slate-800"></div>
                      <span className="flex-shrink mx-4 text-slate-500 font-mono text-xs">OU INTRODUZA CÓDIGO</span>
                      <div className="flex-grow border-t border-slate-800"></div>
                    </div>

                    <div className="space-y-2">
                      <label className="text-xs font-semibold text-slate-400 font-mono">CÓDIGO DE ACESSO</label>
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
                          Conectar
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
                    <p className="text-sm text-slate-400">Ligando com protocolo seguro...</p>
                  </div>
                )}

                {roomStatus === 'waiting' && (
                  <div className="space-y-6 text-center py-4">
                    <div className="space-y-2">
                      <p className="text-sm text-slate-400">Envie este código ao seu adversário</p>
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
                      <p className="text-sm text-cyan-400 animate-pulse">A aguardar oponente conectar...</p>
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

        {/* --- TELA DE JOGO ATIVO --- */}
        {gameState === 'playing' && (
          <div className="w-full max-w-4xl flex flex-col items-center space-y-4 animate-scale-up animate-fade-in">
            
            <div className="w-full flex items-center justify-between px-6 py-3 bg-slate-900/60 border border-slate-900 rounded-2xl backdrop-blur-md">
              <div className="flex items-center gap-3">
                <span className="w-3 h-3 rounded-full bg-cyan-400 animate-ping"></span>
                <span className="font-mono text-xs tracking-widest text-cyan-400 uppercase font-semibold">
                  {gameMode === 'ia' ? `VS IA - ${difficulty.toUpperCase()}` : gameMode === 'local' ? '1V1 LOCAL' : 'PARTIDA ONLINE'} ({subMode.toUpperCase()})
                </span>
              </div>

              {subMode === 'sobrevivencia' ? (
                <div className="flex items-center gap-2 font-mono text-xl font-bold text-pink-400 animate-pulse">
                  <Clock className="w-5 h-5" />
                  <span>SOBREVIVIDO: {survivalTime}s</span>
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
                <ArrowLeft className="w-3.5 h-3.5" /> Sair
              </button>
            </div>

            {activePowerUpMsg && (
              <div className="w-full text-center py-1 bg-indigo-950/20 border border-indigo-900/30 rounded-lg text-xs font-mono text-slate-300 animate-pulse">
                {activePowerUpMsg}
              </div>
            )}

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
                  IMPOSSÍVEL
                </button>
              </div>
            )}

            <div className="relative w-full aspect-[8/5] bg-slate-950 border border-slate-800 rounded-2xl shadow-2xl overflow-hidden">
              <canvas 
                ref={canvasRef}
                width={V_WIDTH}
                height={V_HEIGHT}
                tabIndex={0}
                className="w-full h-full block focus:outline-none focus:ring-1 focus:ring-cyan-500/30"
              />

              {/* Botões Táteis Responsivos de Controle */}
              <div className="absolute inset-0 pointer-events-none flex justify-between">
                
                {/* Toques da Esquerda (P1 se não for cliente) */}
                {(gameMode !== 'online' || isHost) && (
                  <div className="w-1/3 h-full pointer-events-auto flex flex-col justify-between p-4">
                    <button 
                      onTouchStart={() => { keysPressed.current['w'] = true; }}
                      onTouchEnd={() => { keysPressed.current['w'] = false; }}
                      className="w-16 h-16 bg-slate-900/40 active:bg-cyan-500/30 border border-slate-800 rounded-full flex items-center justify-center text-cyan-400 font-bold"
                    >
                      ▲
                    </button>
                    <button 
                      onTouchStart={() => { keysPressed.current['s'] = true; }}
                      onTouchEnd={() => { keysPressed.current['s'] = false; }}
                      className="w-16 h-16 bg-slate-900/40 active:bg-cyan-500/30 border border-slate-800 rounded-full flex items-center justify-center text-cyan-400 font-bold"
                    >
                      ▼
                    </button>
                  </div>
                )}

                {/* Toques da Direita (P2) */}
                {(gameMode === 'local' || (gameMode === 'online' && !isHost)) && (
                  <div className="w-1/3 h-full pointer-events-auto flex flex-col justify-between items-end p-4">
                    <button 
                      onTouchStart={() => { 
                        if (gameMode === 'local') keysPressed.current['ArrowUp'] = true;
                        else keysPressed.current['w'] = true; 
                      }}
                      onTouchEnd={() => { 
                        if (gameMode === 'local') keysPressed.current['ArrowUp'] = false;
                        else keysPressed.current['w'] = false; 
                      }}
                      className="w-16 h-16 bg-slate-900/40 active:bg-pink-500/30 border border-slate-800 rounded-full flex items-center justify-center text-pink-400 font-bold"
                    >
                      ▲
                    </button>
                    <button 
                      onTouchStart={() => { 
                        if (gameMode === 'local') keysPressed.current['ArrowDown'] = true;
                        else keysPressed.current['s'] = true; 
                      }}
                      onTouchEnd={() => { 
                        if (gameMode === 'local') keysPressed.current['ArrowDown'] = false;
                        else keysPressed.current['s'] = false; 
                      }}
                      className="w-16 h-16 bg-slate-900/40 active:bg-pink-500/30 border border-slate-800 rounded-full flex items-center justify-center text-pink-400 font-bold"
                    >
                      ▼
                    </button>
                  </div>
                )}
              </div>
            </div>

            <p className="text-xs text-slate-500 font-mono text-center">
              Meta da partida: {MAX_SCORE} golos. No telemóvel use os comandos circulares integrados nas laterais.
            </p>
          </div>
        )}

        {/* --- ECRÃ DE FIM DE JOGO --- */}
        {gameState === 'gameover' && (
          <div className="max-w-md w-full bg-slate-900/90 border-2 border-indigo-500/40 p-8 rounded-2xl shadow-2xl text-center space-y-6 animate-scale-up">
            <div className="space-y-2">
              <span className="text-xs font-semibold tracking-widest text-indigo-400 uppercase bg-indigo-950/60 px-3 py-1 rounded-full border border-indigo-900/30">
                Partida Encerrada
              </span>
              <h2 className="text-4xl font-black text-transparent bg-clip-text bg-gradient-to-r from-yellow-400 via-orange-500 to-pink-500 uppercase">
                {winner}
              </h2>
            </div>

            {subMode === 'sobrevivencia' ? (
              <div className="bg-slate-950 py-4 rounded-xl border border-slate-800 flex flex-col items-center justify-center space-y-1">
                <span className="text-xs text-slate-400 font-mono">TEMPO DE RESISTÊNCIA</span>
                <span className="text-pink-400 font-mono text-3xl font-black">{survivalTime}s</span>
                <span className="text-[10px] text-green-400 font-mono">PONTOS CONQUISTADOS: {survivalTime * 12}</span>
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
                  <RotateCcw className="w-5 h-5" /> Revanche Imediata
                </button>
              )}

              <button 
                onClick={quitToMenu}
                className="w-full py-3 bg-slate-850 hover:bg-slate-800 border border-slate-700/60 font-semibold rounded-xl transition"
              >
                Voltar ao Menu Principal
              </button>
            </div>
          </div>
        )}
      </main>

      {/* --- RODAPÉ --- */}
      <footer className="px-6 py-4 border-t border-slate-900 bg-slate-950 text-slate-500 text-xs flex flex-col md:flex-row items-center justify-between gap-2 z-10">
        <div>
          <span>Mapeamento de Efeito Angular • Multi-balls Engine • Conexão P2P Ativa</span>
        </div>
        <div className="flex gap-4 font-mono text-[10px]">
          <span>© 2026 NEON PONG ULTIMATE</span>
        </div>
      </footer>
    </div>
  );
}
