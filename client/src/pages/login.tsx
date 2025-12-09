import { useState, useRef, useEffect, useMemo } from "react";
import { Link, useLocation } from "wouter";
import { Eye, EyeOff, Mail, Lock, Hexagon, User, Code, Music, DollarSign, Utensils, Home, Laugh, Gamepad2, BookOpen, Camera, Palette } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Checkbox } from "@/components/ui/checkbox";
import { motion, useSpring, useMotionValue, useTransform } from "framer-motion";
import { toast } from "sonner";
import { useAuth } from "@/context/auth";

interface NodeData {
  id: number;
  x: number;
  y: number;
  icon: React.ComponentType<{ className?: string }>;
  size: number;
  delay: number;
  speed: number;
}

interface NetworkAnimationProps {
  mousePosition: { x: number; y: number };
  containerWidth: number;
  containerHeight: number;
}

function NetworkAnimation({ mousePosition, containerWidth, containerHeight }: NetworkAnimationProps) {
  const [time, setTime] = useState(0);
  
  const nodes: NodeData[] = useMemo(() => [
    { id: 1, x: 20, y: 15, icon: Code, size: 48, delay: 0, speed: 1.2 },
    { id: 2, x: 75, y: 20, icon: Music, size: 40, delay: 0.5, speed: 0.8 },
    { id: 3, x: 15, y: 45, icon: DollarSign, size: 36, delay: 1, speed: 1.5 },
    { id: 4, x: 80, y: 50, icon: Utensils, size: 44, delay: 0.3, speed: 1.1 },
    { id: 5, x: 50, y: 35, icon: Home, size: 52, delay: 0.7, speed: 0.9 },
    { id: 6, x: 30, y: 70, icon: Laugh, size: 38, delay: 1.2, speed: 1.3 },
    { id: 7, x: 70, y: 75, icon: Gamepad2, size: 42, delay: 0.2, speed: 1.0 },
    { id: 8, x: 45, y: 85, icon: BookOpen, size: 34, delay: 0.8, speed: 1.4 },
    { id: 9, x: 85, y: 35, icon: Camera, size: 36, delay: 0.4, speed: 1.2 },
    { id: 10, x: 25, y: 25, icon: Palette, size: 40, delay: 0.6, speed: 0.7 },
  ], []);

  const connections = useMemo(() => [
    [0, 4], [1, 4], [2, 5], [3, 4], [4, 6], [4, 7],
    [5, 7], [6, 7], [1, 8], [0, 9], [9, 2], [3, 8],
    [1, 3], [5, 6], [2, 4]
  ], []);

  useEffect(() => {
    const interval = setInterval(() => {
      setTime(t => t + 0.02);
    }, 50);
    return () => clearInterval(interval);
  }, []);

  const getNodePosition = (node: NodeData, mouseX: number, mouseY: number) => {
    const baseX = (node.x / 100) * containerWidth;
    const baseY = (node.y / 100) * containerHeight;
    
    const floatX = Math.sin(time * node.speed + node.delay) * 15;
    const floatY = Math.cos(time * node.speed * 0.8 + node.delay) * 12;
    
    const centerX = containerWidth / 2;
    const centerY = containerHeight / 2;
    const dx = mouseX - centerX;
    const dy = mouseY - centerY;
    const parallaxFactor = 0.03 * (node.size / 50);
    const parallaxX = dx * parallaxFactor;
    const parallaxY = dy * parallaxFactor;
    
    return {
      x: baseX + floatX + parallaxX,
      y: baseY + floatY + parallaxY
    };
  };

  const nodePositions = nodes.map(node => 
    getNodePosition(node, mousePosition.x, mousePosition.y)
  );

  return (
    <div className="absolute inset-0 overflow-hidden">
      <svg className="absolute inset-0 w-full h-full" style={{ zIndex: 1 }}>
        <defs>
          <linearGradient id="lineGradient" x1="0%" y1="0%" x2="100%" y2="0%">
            <stop offset="0%" stopColor="#FFC400" stopOpacity="0.6" />
            <stop offset="50%" stopColor="#FF8C00" stopOpacity="0.8" />
            <stop offset="100%" stopColor="#FFC400" stopOpacity="0.6" />
          </linearGradient>
          <filter id="glow">
            <feGaussianBlur stdDeviation="3" result="coloredBlur"/>
            <feMerge>
              <feMergeNode in="coloredBlur"/>
              <feMergeNode in="SourceGraphic"/>
            </feMerge>
          </filter>
        </defs>
        
        {connections.map(([from, to], idx) => {
          const fromPos = nodePositions[from];
          const toPos = nodePositions[to];
          const pulseOffset = (time * 2 + idx * 0.5) % 1;
          
          return (
            <g key={`connection-${idx}`}>
              <line
                x1={fromPos.x}
                y1={fromPos.y}
                x2={toPos.x}
                y2={toPos.y}
                stroke="url(#lineGradient)"
                strokeWidth="1.5"
                opacity={0.3 + Math.sin(time + idx) * 0.15}
                filter="url(#glow)"
              />
              <circle
                cx={fromPos.x + (toPos.x - fromPos.x) * pulseOffset}
                cy={fromPos.y + (toPos.y - fromPos.y) * pulseOffset}
                r="3"
                fill="#FFC400"
                opacity={0.8}
                filter="url(#glow)"
              />
            </g>
          );
        })}
      </svg>

      {nodes.map((node, idx) => {
        const pos = nodePositions[idx];
        const Icon = node.icon;
        const distanceFromMouse = Math.sqrt(
          Math.pow(mousePosition.x - pos.x, 2) + 
          Math.pow(mousePosition.y - pos.y, 2)
        );
        const isNearMouse = distanceFromMouse < 120;
        const glowIntensity = isNearMouse ? 1 : 0.4;
        
        return (
          <motion.div
            key={node.id}
            className="absolute"
            initial={{ opacity: 0, scale: 0 }}
            animate={{ 
              opacity: 1, 
              scale: 1,
              x: pos.x - node.size / 2,
              y: pos.y - node.size / 2,
            }}
            transition={{ 
              opacity: { delay: node.delay * 0.3, duration: 0.5 },
              scale: { delay: node.delay * 0.3, duration: 0.5, type: "spring" },
              x: { duration: 0.1, ease: "linear" },
              y: { duration: 0.1, ease: "linear" },
            }}
            style={{ zIndex: 2 }}
          >
            <div 
              className="relative flex items-center justify-center rounded-2xl transition-all duration-300"
              style={{
                width: node.size,
                height: node.size,
                background: `linear-gradient(135deg, rgba(255, 196, 0, ${0.15 + glowIntensity * 0.15}) 0%, rgba(255, 140, 0, ${0.1 + glowIntensity * 0.1}) 100%)`,
                border: `2px solid rgba(255, 196, 0, ${0.3 + glowIntensity * 0.4})`,
                boxShadow: isNearMouse 
                  ? `0 0 ${30 + glowIntensity * 20}px rgba(255, 196, 0, ${0.4 + glowIntensity * 0.3}), inset 0 0 20px rgba(255, 196, 0, 0.1)`
                  : `0 0 15px rgba(255, 196, 0, 0.2)`,
                transform: isNearMouse ? 'scale(1.15)' : 'scale(1)',
              }}
            >
              <div
                style={{ 
                  width: node.size * 0.5, 
                  height: node.size * 0.5,
                  color: isNearMouse ? '#FFC400' : 'rgba(0, 0, 0, 0.7)',
                  filter: isNearMouse ? 'drop-shadow(0 0 8px rgba(255, 196, 0, 0.8))' : 'none',
                  transition: 'all 0.3s',
                }}
              >
                <Icon className="w-full h-full" />
              </div>
            </div>
            
            <motion.div
              className="absolute rounded-full"
              style={{
                width: node.size + 20,
                height: node.size + 20,
                left: -10,
                top: -10,
                border: '1px solid rgba(255, 196, 0, 0.2)',
                borderRadius: '16px',
              }}
              animate={{
                scale: [1, 1.2, 1],
                opacity: [0.3, 0, 0.3],
              }}
              transition={{
                duration: 2 + node.delay,
                repeat: Infinity,
                ease: "easeInOut",
              }}
            />
          </motion.div>
        );
      })}

      <motion.div
        className="absolute rounded-full pointer-events-none"
        style={{
          width: 200,
          height: 200,
          left: mousePosition.x - 100,
          top: mousePosition.y - 100,
          background: 'radial-gradient(circle, rgba(255, 196, 0, 0.08) 0%, transparent 70%)',
          zIndex: 0,
        }}
        animate={{
          scale: [1, 1.1, 1],
        }}
        transition={{
          duration: 2,
          repeat: Infinity,
          ease: "easeInOut",
        }}
      />
    </div>
  );
}

export default function Login() {
  const [isFlipped, setIsFlipped] = useState(false);
  const { login } = useAuth();
  
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [rememberMe, setRememberMe] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  
  const [signupFullName, setSignupFullName] = useState("");
  const [signupEmail, setSignupEmail] = useState("");
  const [signupPassword, setSignupPassword] = useState("");
  const [showSignupPassword, setShowSignupPassword] = useState(false);
  const [isSigningUp, setIsSigningUp] = useState(false);
  
  const [mousePosition, setMousePosition] = useState({ x: 200, y: 300 });
  const [containerSize, setContainerSize] = useState({ width: 400, height: 600 });
  const containerRef = useRef<HTMLDivElement>(null);
  const [, setLocation] = useLocation();

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!email || !password) {
      toast.error("Please enter both email and password");
      return;
    }

    setIsLoading(true);
    
    try {
      const response = await fetch("/api/auth/login", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email, password }),
      });
      
      const data = await response.json();
      
      if (data.success) {
        login(data.user);
        toast.success("Welcome back!");
        setLocation("/dashboard");
      } else {
        toast.error(data.error || "Invalid email or password");
      }
    } catch (error) {
      console.error("Login error:", error);
      toast.error("Login failed. Please try again.");
    } finally {
      setIsLoading(false);
    }
  };

  const handleSignup = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!signupFullName || !signupEmail || !signupPassword) {
      toast.error("Please fill in all fields");
      return;
    }

    if (signupPassword.length < 6) {
      toast.error("Password must be at least 6 characters");
      return;
    }

    setIsSigningUp(true);
    
    try {
      const response = await fetch("/api/auth/signup", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ 
          fullName: signupFullName,
          email: signupEmail, 
          password: signupPassword 
        }),
      });
      
      const data = await response.json();
      
      if (data.success) {
        login(data.user);
        toast.success("Account created successfully!");
        setLocation("/dashboard");
      } else {
        toast.error(data.error || "Signup failed");
      }
    } catch (error) {
      console.error("Signup error:", error);
      toast.error("Signup failed. Please try again.");
    } finally {
      setIsSigningUp(false);
    }
  };

  const handleGoogleLogin = () => {
    toast.info("Google Sign-in coming soon!", {
      description: "We're working on adding Google authentication."
    });
  };

  const handleForgotPassword = (e: React.MouseEvent) => {
    e.preventDefault();
    toast.info("Password reset coming soon!", {
      description: "This feature will be available shortly."
    });
  };

  const flipToSignup = (e: React.MouseEvent) => {
    e.preventDefault();
    setIsFlipped(true);
  };

  const flipToLogin = (e: React.MouseEvent) => {
    e.preventDefault();
    setIsFlipped(false);
  };

  useEffect(() => {
    const handleGlobalMouseMove = (e: MouseEvent) => {
      if (containerRef.current) {
        const rect = containerRef.current.getBoundingClientRect();
        setMousePosition({
          x: e.clientX - rect.left,
          y: e.clientY - rect.top,
        });
      }
    };

    document.addEventListener('mousemove', handleGlobalMouseMove);
    return () => document.removeEventListener('mousemove', handleGlobalMouseMove);
  }, []);

  useEffect(() => {
    const updateSize = () => {
      if (containerRef.current) {
        setContainerSize({
          width: containerRef.current.offsetWidth,
          height: containerRef.current.offsetHeight,
        });
      }
    };
    updateSize();
    window.addEventListener('resize', updateSize);
    return () => window.removeEventListener('resize', updateSize);
  }, []);

  return (
    <div className="min-h-screen flex bg-[#FFC400]">
      <div 
        ref={containerRef}
        className="hidden lg:flex lg:w-1/2 relative items-center justify-center overflow-hidden"
        style={{
          background: `
            linear-gradient(135deg, #FFD54F 0%, #FFC400 25%, #FFB300 50%, #FFA000 75%, #FFB300 100%),
            url("data:image/svg+xml,%3Csvg viewBox='0 0 200 200' xmlns='http://www.w3.org/2000/svg'%3E%3Cfilter id='noiseFilter'%3E%3CfeTurbulence type='fractalNoise' baseFrequency='0.85' numOctaves='4' stitchTiles='stitch'/%3E%3C/filter%3E%3Crect width='100%25' height='100%25' filter='url(%23noiseFilter)'/%3E%3C/svg%3E")
          `,
          backgroundBlendMode: 'overlay',
        }}
      >
        <div 
          className="absolute inset-0 opacity-[0.03]"
          style={{
            backgroundImage: `url("data:image/svg+xml,%3Csvg viewBox='0 0 200 200' xmlns='http://www.w3.org/2000/svg'%3E%3Cfilter id='noiseFilter'%3E%3CfeTurbulence type='fractalNoise' baseFrequency='0.9' numOctaves='4' stitchTiles='stitch'/%3E%3C/filter%3E%3Crect width='100%25' height='100%25' filter='url(%23noiseFilter)'/%3E%3C/svg%3E")`,
          }}
        />
        
        <div className="absolute inset-0">
          <div className="absolute top-0 left-0 w-full h-1/3 bg-gradient-to-b from-[#FFE082]/40 to-transparent"></div>
          <div className="absolute bottom-0 left-0 w-full h-1/3 bg-gradient-to-t from-[#FF8F00]/30 to-transparent"></div>
          <div className="absolute top-1/4 right-0 w-1/2 h-1/2 bg-[#FFCA28]/20 rounded-full filter blur-[100px]"></div>
          <div className="absolute bottom-1/4 left-0 w-1/2 h-1/2 bg-[#FFB300]/25 rounded-full filter blur-[100px]"></div>
        </div>
        
        <div className="absolute inset-0 opacity-[0.06]">
          {[...Array(12)].map((_, i) => (
            <div
              key={i}
              className="absolute w-px bg-gradient-to-b from-transparent via-black to-transparent"
              style={{
                left: `${(i + 1) * 8}%`,
                height: '100%',
              }}
            />
          ))}
        </div>

        <NetworkAnimation 
          mousePosition={mousePosition} 
          containerWidth={containerSize.width}
          containerHeight={containerSize.height}
        />
        
        <motion.div 
          className="absolute bottom-8 left-8 right-8 z-10"
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 1, duration: 0.6 }}
        >
          <p className="text-black/60 text-sm font-medium text-center">
            Connect with 10+ campus communities
          </p>
        </motion.div>
      </div>

      <div className="w-full lg:w-1/2 flex items-center justify-center p-8 bg-black relative overflow-hidden">
        <div className="absolute inset-0 opacity-[0.07]">
          {[...Array(8)].map((_, i) => (
            <div
              key={`v-${i}`}
              className="absolute w-px bg-gradient-to-b from-transparent via-[#FFC400] to-transparent"
              style={{
                left: `${(i + 1) * 12}%`,
                height: '100%',
              }}
            />
          ))}
          {[...Array(6)].map((_, i) => (
            <div
              key={`h-${i}`}
              className="absolute h-px bg-gradient-to-r from-transparent via-[#FFC400] to-transparent"
              style={{
                top: `${(i + 1) * 14}%`,
                width: '100%',
              }}
            />
          ))}
        </div>
        
        <div className="absolute inset-0">
          {[
            { x: 15, y: 12, size: 3, opacity: 0.12 },
            { x: 78, y: 8, size: 4, opacity: 0.08 },
            { x: 45, y: 25, size: 2, opacity: 0.15 },
            { x: 88, y: 35, size: 3, opacity: 0.1 },
            { x: 22, y: 42, size: 5, opacity: 0.06 },
            { x: 65, y: 55, size: 2, opacity: 0.14 },
            { x: 35, y: 68, size: 4, opacity: 0.09 },
            { x: 82, y: 72, size: 3, opacity: 0.11 },
            { x: 12, y: 85, size: 2, opacity: 0.13 },
            { x: 55, y: 88, size: 4, opacity: 0.07 },
            { x: 92, y: 18, size: 3, opacity: 0.1 },
            { x: 8, y: 58, size: 2, opacity: 0.12 },
            { x: 72, y: 45, size: 5, opacity: 0.05 },
            { x: 28, y: 92, size: 3, opacity: 0.09 },
            { x: 58, y: 15, size: 2, opacity: 0.14 },
          ].map((dot, i) => (
            <div
              key={`dot-${i}`}
              className="absolute rounded-full bg-[#FFC400]"
              style={{
                width: `${dot.size}px`,
                height: `${dot.size}px`,
                left: `${dot.x}%`,
                top: `${dot.y}%`,
                opacity: dot.opacity,
              }}
            />
          ))}
        </div>

        <div className="absolute top-0 right-0 w-96 h-96 bg-[#FFC400]/5 rounded-full filter blur-[100px]"></div>
        <div className="absolute bottom-0 left-0 w-64 h-64 bg-[#FFC400]/3 rounded-full filter blur-[80px]"></div>
        
        <div className="w-full max-w-md" style={{ perspective: "1000px" }}>
          <Link href="/" className="flex items-center gap-2 mb-8 transition-opacity hover:opacity-80 cursor-pointer">
            <div className="relative flex h-10 w-10 items-center justify-center">
              <Hexagon className="absolute h-10 w-10 text-[#FFC400] fill-[#FFC400]/10" strokeWidth={1.5} />
              <span className="relative z-10 text-lg font-bold text-[#FFC400]">C</span>
            </div>
            <span className="font-heading text-xl font-bold tracking-tight uppercase text-white">
              CampusHub
            </span>
          </Link>

          <motion.div
            className="relative w-full"
            style={{ 
              transformStyle: "preserve-3d",
              minHeight: "520px",
            }}
            animate={{ rotateY: isFlipped ? 180 : 0 }}
            transition={{ duration: 0.6, ease: [0.4, 0, 0.2, 1] }}
          >
            <div 
              className="absolute w-full"
              style={{ 
                backfaceVisibility: "hidden",
                WebkitBackfaceVisibility: "hidden",
              }}
            >
              <div className="bg-white border border-gray-200 rounded-3xl p-8 shadow-[0_20px_60px_rgba(0,0,0,0.15)]">
                <h1 className="text-3xl font-bold text-gray-900 mb-2 font-heading uppercase tracking-wide">
                  Welcome back!
                </h1>
                <p className="text-gray-500 mb-8">
                  Please enter your details
                </p>

                <form className="space-y-6" onSubmit={handleLogin}>
                  <div className="space-y-2">
                    <label htmlFor="email" className="text-sm font-bold text-gray-700 uppercase tracking-wider">
                      Email
                    </label>
                    <div className="relative">
                      <Mail className="absolute left-4 top-1/2 -translate-y-1/2 h-5 w-5 text-gray-400" />
                      <Input
                        id="email"
                        type="email"
                        placeholder="Enter your email"
                        value={email}
                        onChange={(e) => setEmail(e.target.value)}
                        className="pl-12 h-12 bg-gray-50 border-gray-300 text-gray-900 placeholder:text-gray-400 rounded-xl focus:border-[#FFC400] focus:ring-[#FFC400]/30 transition-all"
                      />
                    </div>
                  </div>

                  <div className="space-y-2">
                    <label htmlFor="password" className="text-sm font-bold text-gray-700 uppercase tracking-wider">
                      Password
                    </label>
                    <div className="relative">
                      <Lock className="absolute left-4 top-1/2 -translate-y-1/2 h-5 w-5 text-gray-400" />
                      <Input
                        id="password"
                        type={showPassword ? "text" : "password"}
                        placeholder="Enter your password"
                        value={password}
                        onChange={(e) => setPassword(e.target.value)}
                        className="pl-12 pr-12 h-12 bg-gray-50 border-gray-300 text-gray-900 placeholder:text-gray-400 rounded-xl focus:border-[#FFC400] focus:ring-[#FFC400]/30 transition-all"
                      />
                      <button
                        type="button"
                        onClick={() => setShowPassword(!showPassword)}
                        className="absolute right-4 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600 transition-colors"
                      >
                        {showPassword ? <EyeOff className="h-5 w-5" /> : <Eye className="h-5 w-5" />}
                      </button>
                    </div>
                  </div>

                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      <Checkbox
                        id="remember"
                        checked={rememberMe}
                        onCheckedChange={(checked) => setRememberMe(checked as boolean)}
                        className="border-gray-300 data-[state=checked]:bg-[#FFC400] data-[state=checked]:border-[#FFC400] data-[state=checked]:text-black"
                      />
                      <label htmlFor="remember" className="text-sm text-gray-600 cursor-pointer">
                        Remember me for 30 days
                      </label>
                    </div>
                    <a href="#" onClick={handleForgotPassword} className="text-sm text-[#E6A800] hover:text-[#CC9600] transition-colors font-medium">
                      Forgot password?
                    </a>
                  </div>

                  <Button 
                    type="submit"
                    disabled={isLoading}
                    className="w-full h-12 bg-[#FFC400] hover:bg-[#E6B000] text-black font-bold uppercase tracking-wider rounded-xl shadow-lg hover:shadow-xl transition-all duration-300 disabled:opacity-50"
                  >
                    {isLoading ? "Logging in..." : "Log in"}
                  </Button>

                  <div className="relative">
                    <div className="absolute inset-0 flex items-center">
                      <div className="w-full border-t border-gray-200"></div>
                    </div>
                    <div className="relative flex justify-center text-xs uppercase">
                      <span className="bg-white px-3 text-gray-400 tracking-wider">Or continue with</span>
                    </div>
                  </div>

                  <Button 
                    type="button"
                    variant="outline"
                    onClick={handleGoogleLogin}
                    className="w-full h-12 bg-white border-gray-300 text-gray-700 hover:bg-gray-50 hover:border-gray-400 rounded-xl font-medium transition-all"
                  >
                    <svg className="w-5 h-5 mr-3" viewBox="0 0 24 24">
                      <path fill="#4285F4" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"/>
                      <path fill="#34A853" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"/>
                      <path fill="#FBBC05" d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z"/>
                      <path fill="#EA4335" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"/>
                    </svg>
                    Log in with Google
                  </Button>
                </form>

                <p className="mt-8 text-center text-gray-500 text-sm">
                  Don't have an account?{" "}
                  <button onClick={flipToSignup} className="text-black hover:text-gray-700 font-bold transition-colors cursor-pointer">
                    Sign up
                  </button>
                </p>
              </div>
            </div>

            <div 
              className="absolute w-full"
              style={{ 
                backfaceVisibility: "hidden",
                WebkitBackfaceVisibility: "hidden",
                transform: "rotateY(180deg)",
              }}
            >
              <div className="bg-white border border-gray-200 rounded-3xl p-8 shadow-[0_20px_60px_rgba(0,0,0,0.15)]">
                <h1 className="text-3xl font-bold text-gray-900 mb-2 font-heading uppercase tracking-wide">
                  Create Account
                </h1>
                <p className="text-gray-500 mb-8">
                  Join the campus community today
                </p>

                <form className="space-y-5" onSubmit={handleSignup}>
                  <div className="space-y-2">
                    <label htmlFor="fullName" className="text-sm font-bold text-gray-700 uppercase tracking-wider">
                      Full Name
                    </label>
                    <div className="relative">
                      <User className="absolute left-4 top-1/2 -translate-y-1/2 h-5 w-5 text-gray-400" />
                      <Input
                        id="fullName"
                        type="text"
                        placeholder="Enter your full name"
                        value={signupFullName}
                        onChange={(e) => setSignupFullName(e.target.value)}
                        className="pl-12 h-12 bg-gray-50 border-gray-300 text-gray-900 placeholder:text-gray-400 rounded-xl focus:border-[#FFC400] focus:ring-[#FFC400]/30 transition-all"
                      />
                    </div>
                  </div>

                  <div className="space-y-2">
                    <label htmlFor="signupEmail" className="text-sm font-bold text-gray-700 uppercase tracking-wider">
                      Email
                    </label>
                    <div className="relative">
                      <Mail className="absolute left-4 top-1/2 -translate-y-1/2 h-5 w-5 text-gray-400" />
                      <Input
                        id="signupEmail"
                        type="email"
                        placeholder="Enter your email"
                        value={signupEmail}
                        onChange={(e) => setSignupEmail(e.target.value)}
                        className="pl-12 h-12 bg-gray-50 border-gray-300 text-gray-900 placeholder:text-gray-400 rounded-xl focus:border-[#FFC400] focus:ring-[#FFC400]/30 transition-all"
                      />
                    </div>
                  </div>

                  <div className="space-y-2">
                    <label htmlFor="signupPassword" className="text-sm font-bold text-gray-700 uppercase tracking-wider">
                      Password
                    </label>
                    <div className="relative">
                      <Lock className="absolute left-4 top-1/2 -translate-y-1/2 h-5 w-5 text-gray-400" />
                      <Input
                        id="signupPassword"
                        type={showSignupPassword ? "text" : "password"}
                        placeholder="Create a password (min 6 chars)"
                        value={signupPassword}
                        onChange={(e) => setSignupPassword(e.target.value)}
                        className="pl-12 pr-12 h-12 bg-gray-50 border-gray-300 text-gray-900 placeholder:text-gray-400 rounded-xl focus:border-[#FFC400] focus:ring-[#FFC400]/30 transition-all"
                      />
                      <button
                        type="button"
                        onClick={() => setShowSignupPassword(!showSignupPassword)}
                        className="absolute right-4 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600 transition-colors"
                      >
                        {showSignupPassword ? <EyeOff className="h-5 w-5" /> : <Eye className="h-5 w-5" />}
                      </button>
                    </div>
                  </div>

                  <Button 
                    type="submit"
                    disabled={isSigningUp}
                    className="w-full h-12 bg-[#FFC400] hover:bg-[#E6B000] text-black font-bold uppercase tracking-wider rounded-xl shadow-lg hover:shadow-xl transition-all duration-300 disabled:opacity-50"
                  >
                    {isSigningUp ? "Creating account..." : "Sign up"}
                  </Button>

                  <div className="relative">
                    <div className="absolute inset-0 flex items-center">
                      <div className="w-full border-t border-gray-200"></div>
                    </div>
                    <div className="relative flex justify-center text-xs uppercase">
                      <span className="bg-white px-3 text-gray-400 tracking-wider">Or continue with</span>
                    </div>
                  </div>

                  <Button 
                    type="button"
                    variant="outline"
                    onClick={handleGoogleLogin}
                    className="w-full h-12 bg-white border-gray-300 text-gray-700 hover:bg-gray-50 hover:border-gray-400 rounded-xl font-medium transition-all"
                  >
                    <svg className="w-5 h-5 mr-3" viewBox="0 0 24 24">
                      <path fill="#4285F4" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"/>
                      <path fill="#34A853" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"/>
                      <path fill="#FBBC05" d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z"/>
                      <path fill="#EA4335" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"/>
                    </svg>
                    Sign up with Google
                  </Button>
                </form>

                <p className="mt-6 text-center text-gray-500 text-sm">
                  Already have an account?{" "}
                  <button onClick={flipToLogin} className="text-black hover:text-gray-700 font-bold transition-colors cursor-pointer">
                    Log in
                  </button>
                </p>
              </div>
            </div>
          </motion.div>
        </div>
      </div>
    </div>
  );
}
