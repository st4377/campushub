import { useState, useRef, useEffect } from "react";
import { Link, useLocation } from "wouter";
import { Eye, EyeOff, Mail, Lock, Hexagon } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Checkbox } from "@/components/ui/checkbox";
import { motion, useSpring } from "framer-motion";
import { toast } from "sonner";

interface BlobCharacterProps {
  mousePosition: { x: number; y: number };
  centerX: number;
  centerY: number;
}

function TwoCharacters({ mousePosition, centerX, centerY }: BlobCharacterProps) {
  const springConfig = { stiffness: 300, damping: 20 };
  
  const orangePupilX = useSpring(0, springConfig);
  const orangePupilY = useSpring(0, springConfig);
  const purplePupilX = useSpring(0, springConfig);
  const purplePupilY = useSpring(0, springConfig);

  useEffect(() => {
    const maxPupilMove = 10;
    const maxDistance = 400;
    
    const orangePos = { x: centerX - 80, y: centerY + 60 };
    const purplePos = { x: centerX + 30, y: centerY - 40 };

    const calcPupil = (charX: number, charY: number) => {
      const dx = mousePosition.x - charX;
      const dy = mousePosition.y - charY;
      const distance = Math.sqrt(dx * dx + dy * dy);
      const factor = Math.min(distance / maxDistance, 1);
      return {
        x: (dx / (distance || 1)) * maxPupilMove * factor,
        y: (dy / (distance || 1)) * maxPupilMove * factor
      };
    };

    const orange = calcPupil(orangePos.x, orangePos.y);
    orangePupilX.set(orange.x);
    orangePupilY.set(orange.y);

    const purple = calcPupil(purplePos.x, purplePos.y);
    purplePupilX.set(purple.x);
    purplePupilY.set(purple.y);
  }, [mousePosition, centerX, centerY, orangePupilX, orangePupilY, purplePupilX, purplePupilY]);

  return (
    <motion.div
      initial={{ opacity: 0, y: 30 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.6, ease: "easeOut" }}
      className="absolute"
      style={{
        left: centerX - 160,
        top: centerY - 140,
      }}
    >
      <svg width="360" height="320" viewBox="0 0 360 320" fill="none">
        {/* Purple Rectangle - Tall, positioned to the left (rendered first, so it's behind) */}
        <g transform="translate(40, 0)">
          <path
            d="M 15 0 
               L 115 0 
               Q 130 0 130 15 
               L 130 235 
               Q 130 250 115 250 
               L 15 250 
               Q 0 250 0 235 
               L 0 15 
               Q 0 0 15 0 Z"
            fill="#6B5CE7"
          />
          {/* Left eye */}
          <motion.g style={{ x: purplePupilX, y: purplePupilY }}>
            <circle cx="45" cy="90" r="8" fill="#1a1a1a" />
            <circle cx="42" cy="86" r="2.5" fill="white" />
          </motion.g>
          {/* Right eye */}
          <motion.g style={{ x: purplePupilX, y: purplePupilY }}>
            <circle cx="85" cy="90" r="8" fill="#1a1a1a" />
            <circle cx="82" cy="86" r="2.5" fill="white" />
          </motion.g>
        </g>

        {/* Orange Blob - Semi-circle (rendered second, so it overlaps purple) */}
        <g transform="translate(0, 60)">
          <path
            d="M 20 240 
               A 120 120 0 0 1 260 240 
               L 20 240 Z"
            fill="#FF6B35"
          />
          {/* Left eye */}
          <motion.g style={{ x: orangePupilX, y: orangePupilY }}>
            <circle cx="95" cy="190" r="10" fill="#1a1a1a" />
            <circle cx="92" cy="186" r="3" fill="white" />
          </motion.g>
          {/* Right eye */}
          <motion.g style={{ x: orangePupilX, y: orangePupilY }}>
            <circle cx="185" cy="190" r="10" fill="#1a1a1a" />
            <circle cx="182" cy="186" r="3" fill="white" />
          </motion.g>
        </g>
      </svg>
    </motion.div>
  );
}

export default function Login() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [rememberMe, setRememberMe] = useState(false);
  const [mousePosition, setMousePosition] = useState({ x: 200, y: 300 });
  const [containerSize, setContainerSize] = useState({ width: 400, height: 600 });
  const [isLoading, setIsLoading] = useState(false);
  const containerRef = useRef<HTMLDivElement>(null);
  const [, setLocation] = useLocation();

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!email || !password) {
      toast.error("Please enter both email and password");
      return;
    }

    setIsLoading(true);
    
    setTimeout(() => {
      setIsLoading(false);
      toast.success("Login feature coming soon!", {
        description: "User authentication will be available shortly."
      });
    }, 1000);
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

  const handleSignUp = (e: React.MouseEvent) => {
    e.preventDefault();
    setLocation("/list-community");
    toast.info("Create an account by listing your community!", {
      description: "Sign up is part of the community listing process."
    });
  };

  // Global mouse move listener for entire page
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
      {/* Left Panel - Yellow textured background with 2 characters */}
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
        {/* Subtle noise overlay */}
        <div 
          className="absolute inset-0 opacity-[0.03]"
          style={{
            backgroundImage: `url("data:image/svg+xml,%3Csvg viewBox='0 0 200 200' xmlns='http://www.w3.org/2000/svg'%3E%3Cfilter id='noiseFilter'%3E%3CfeTurbulence type='fractalNoise' baseFrequency='0.9' numOctaves='4' stitchTiles='stitch'/%3E%3C/filter%3E%3Crect width='100%25' height='100%25' filter='url(%23noiseFilter)'/%3E%3C/svg%3E")`,
          }}
        />
        
        {/* Soft gradient overlays */}
        <div className="absolute inset-0">
          <div className="absolute top-0 left-0 w-full h-1/3 bg-gradient-to-b from-[#FFE082]/40 to-transparent"></div>
          <div className="absolute bottom-0 left-0 w-full h-1/3 bg-gradient-to-t from-[#FF8F00]/30 to-transparent"></div>
          <div className="absolute top-1/4 right-0 w-1/2 h-1/2 bg-[#FFCA28]/20 rounded-full filter blur-[100px]"></div>
          <div className="absolute bottom-1/4 left-0 w-1/2 h-1/2 bg-[#FFB300]/25 rounded-full filter blur-[100px]"></div>
        </div>
        
        {/* Abstract pattern lines */}
        <div className="absolute inset-0 opacity-[0.08]">
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

        {/* Two Characters - Orange blob and Purple rectangle */}
        <TwoCharacters 
          mousePosition={mousePosition} 
          centerX={containerSize.width / 2}
          centerY={containerSize.height / 2}
        />

      </div>

      {/* Right Panel - Black background with decorative elements and white login form card */}
      <div className="w-full lg:w-1/2 flex items-center justify-center p-8 bg-black relative overflow-hidden">
        {/* Decorative grid lines */}
        <div className="absolute inset-0 opacity-[0.07]">
          {/* Vertical lines */}
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
          {/* Horizontal lines */}
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
        
        {/* Decorative dots - fixed positions */}
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

        {/* Subtle glow effects */}
        <div className="absolute top-0 right-0 w-96 h-96 bg-[#FFC400]/5 rounded-full filter blur-[100px]"></div>
        <div className="absolute bottom-0 left-0 w-64 h-64 bg-[#FFC400]/3 rounded-full filter blur-[80px]"></div>
        
        <motion.div 
          initial={{ opacity: 0, scale: 0.85 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ 
            duration: 0.4, 
            ease: [0.34, 1.56, 0.64, 1]
          }}
          className="w-full max-w-md"
        >
          <div className="flex items-center gap-2 mb-8">
            <Link href="/" className="flex items-center gap-2 transition-opacity hover:opacity-80">
              <div className="relative flex h-10 w-10 items-center justify-center">
                <Hexagon className="absolute h-10 w-10 text-[#FFC400] fill-[#FFC400]/10" strokeWidth={1.5} />
                <span className="relative z-10 text-lg font-bold text-[#FFC400]">C</span>
              </div>
              <span className="font-heading text-xl font-bold tracking-tight uppercase text-white">
                Campus<span className="text-white/70">Hub</span>
              </span>
            </Link>
          </div>

          {/* White Card with dark text */}
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
                className="w-full h-12 bg-black hover:bg-gray-800 text-white font-bold uppercase tracking-wider rounded-xl shadow-lg hover:shadow-xl transition-all duration-300 disabled:opacity-50"
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
              <a href="#" onClick={handleSignUp} className="text-black hover:text-gray-700 font-bold transition-colors cursor-pointer">
                Sign up
              </a>
            </p>
          </div>
        </motion.div>
      </div>
    </div>
  );
}
