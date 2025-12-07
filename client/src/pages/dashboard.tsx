import { useEffect, useState } from "react";
import { useLocation } from "wouter";
import { motion } from "framer-motion";
import { User, Mail, Calendar, Users, Plus, LogOut, Settings, ChevronRight, Hexagon } from "lucide-react";
import { Button } from "@/components/ui/button";
import { toast } from "sonner";
import { Layout } from "@/components/layout";

interface UserData {
  id: string;
  fullName: string;
  email: string;
  createdAt?: string;
}

export default function Dashboard() {
  const [, setLocation] = useLocation();
  const [user, setUser] = useState<UserData | null>(null);

  useEffect(() => {
    const userData = localStorage.getItem("user");
    if (!userData) {
      toast.error("Please log in to access your dashboard");
      setLocation("/login");
      return;
    }
    try {
      setUser(JSON.parse(userData));
    } catch {
      localStorage.removeItem("user");
      setLocation("/login");
    }
  }, [setLocation]);

  const handleLogout = () => {
    localStorage.removeItem("user");
    toast.success("Logged out successfully");
    setLocation("/");
  };

  const handleListCommunity = () => {
    setLocation("/list-community");
  };

  if (!user) {
    return (
      <div className="min-h-screen bg-black flex items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-[#FFC400]"></div>
      </div>
    );
  }

  const getInitials = (name: string) => {
    return name
      .split(" ")
      .map((n) => n[0])
      .join("")
      .toUpperCase()
      .slice(0, 2);
  };

  return (
    <Layout>
      <div className="min-h-screen bg-black">
        <div className="container mx-auto px-4 py-8 max-w-6xl">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5 }}
          >
            <div className="bg-gradient-to-br from-[#1a1a1a] to-[#0d0d0d] rounded-3xl border border-[#333] overflow-hidden">
              <div className="relative h-32 bg-gradient-to-r from-[#FFC400]/20 via-[#FF8C00]/20 to-[#FFC400]/20">
                <div className="absolute inset-0 opacity-30">
                  {[...Array(20)].map((_, i) => (
                    <div
                      key={i}
                      className="absolute rounded-full bg-[#FFC400]"
                      style={{
                        width: `${Math.random() * 4 + 2}px`,
                        height: `${Math.random() * 4 + 2}px`,
                        left: `${Math.random() * 100}%`,
                        top: `${Math.random() * 100}%`,
                        opacity: Math.random() * 0.5 + 0.2,
                      }}
                    />
                  ))}
                </div>
              </div>

              <div className="px-8 pb-8">
                <div className="flex flex-col md:flex-row md:items-end gap-6 -mt-16">
                  <motion.div
                    initial={{ scale: 0.8, opacity: 0 }}
                    animate={{ scale: 1, opacity: 1 }}
                    transition={{ delay: 0.2, duration: 0.4 }}
                    className="relative"
                  >
                    <div className="w-32 h-32 rounded-2xl bg-gradient-to-br from-[#FFC400] to-[#FF8C00] flex items-center justify-center text-4xl font-bold text-black shadow-2xl border-4 border-[#1a1a1a]">
                      {getInitials(user.fullName)}
                    </div>
                    <div className="absolute -bottom-2 -right-2 w-8 h-8 bg-green-500 rounded-full border-4 border-[#1a1a1a]"></div>
                  </motion.div>

                  <div className="flex-1">
                    <h1 className="text-3xl md:text-4xl font-bold text-white font-heading">
                      Welcome, {user.fullName.split(" ")[0]}!
                    </h1>
                    <p className="text-gray-400 mt-1 flex items-center gap-2">
                      <Mail className="w-4 h-4" />
                      {user.email}
                    </p>
                  </div>

                  <div className="flex gap-3">
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={handleLogout}
                      className="border-[#333] text-gray-400 hover:text-white hover:border-[#FFC400]/50 rounded-xl"
                    >
                      <LogOut className="w-4 h-4 mr-2" />
                      Logout
                    </Button>
                  </div>
                </div>
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mt-8">
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.3, duration: 0.4 }}
                className="bg-gradient-to-br from-[#1a1a1a] to-[#0d0d0d] rounded-2xl border border-[#333] p-6"
              >
                <div className="flex items-center gap-4">
                  <div className="w-12 h-12 rounded-xl bg-[#6B5CE7]/20 flex items-center justify-center">
                    <Hexagon className="w-6 h-6 text-[#6B5CE7]" />
                  </div>
                  <div>
                    <p className="text-gray-400 text-sm">Communities Listed</p>
                    <p className="text-2xl font-bold text-white">0</p>
                  </div>
                </div>
              </motion.div>

              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.4, duration: 0.4 }}
                className="bg-gradient-to-br from-[#1a1a1a] to-[#0d0d0d] rounded-2xl border border-[#333] p-6"
              >
                <div className="flex items-center gap-4">
                  <div className="w-12 h-12 rounded-xl bg-[#FF6B35]/20 flex items-center justify-center">
                    <Calendar className="w-6 h-6 text-[#FF6B35]" />
                  </div>
                  <div>
                    <p className="text-gray-400 text-sm">Member Since</p>
                    <p className="text-2xl font-bold text-white">Today</p>
                  </div>
                </div>
              </motion.div>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mt-8">
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.6, duration: 0.4 }}
                className="bg-gradient-to-br from-[#1a1a1a] to-[#0d0d0d] rounded-2xl border border-[#333] p-6"
              >
                <h2 className="text-xl font-bold text-white mb-4 flex items-center gap-2">
                  <Plus className="w-5 h-5 text-[#FFC400]" />
                  Quick Actions
                </h2>
                <div className="space-y-3">
                  <button
                    onClick={handleListCommunity}
                    className="w-full flex items-center justify-between p-4 rounded-xl bg-[#FFC400]/10 border border-[#FFC400]/30 hover:border-[#FFC400] transition-all group"
                  >
                    <div className="flex items-center gap-3">
                      <div className="w-10 h-10 rounded-lg bg-[#FFC400]/20 flex items-center justify-center">
                        <Plus className="w-5 h-5 text-[#FFC400]" />
                      </div>
                      <div className="text-left">
                        <p className="font-semibold text-white">List a Community</p>
                        <p className="text-sm text-gray-400">Share your community with others</p>
                      </div>
                    </div>
                    <ChevronRight className="w-5 h-5 text-gray-400 group-hover:text-[#FFC400] transition-colors" />
                  </button>

                  <button
                    onClick={() => setLocation("/")}
                    className="w-full flex items-center justify-between p-4 rounded-xl bg-[#6B5CE7]/10 border border-[#6B5CE7]/30 hover:border-[#6B5CE7] transition-all group"
                  >
                    <div className="flex items-center gap-3">
                      <div className="w-10 h-10 rounded-lg bg-[#6B5CE7]/20 flex items-center justify-center">
                        <Users className="w-5 h-5 text-[#6B5CE7]" />
                      </div>
                      <div className="text-left">
                        <p className="font-semibold text-white">Browse Communities</p>
                        <p className="text-sm text-gray-400">Discover new groups to join</p>
                      </div>
                    </div>
                    <ChevronRight className="w-5 h-5 text-gray-400 group-hover:text-[#6B5CE7] transition-colors" />
                  </button>
                </div>
              </motion.div>

              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.7, duration: 0.4 }}
                className="bg-gradient-to-br from-[#1a1a1a] to-[#0d0d0d] rounded-2xl border border-[#333] p-6"
              >
                <h2 className="text-xl font-bold text-white mb-4 flex items-center gap-2">
                  <Settings className="w-5 h-5 text-[#FFC400]" />
                  Account Settings
                </h2>
                <div className="space-y-4">
                  <div className="flex items-center justify-between p-4 rounded-xl bg-black/30 border border-[#333]">
                    <div className="flex items-center gap-3">
                      <User className="w-5 h-5 text-gray-400" />
                      <div>
                        <p className="text-sm text-gray-400">Full Name</p>
                        <p className="text-white font-medium">{user.fullName}</p>
                      </div>
                    </div>
                  </div>
                  <div className="flex items-center justify-between p-4 rounded-xl bg-black/30 border border-[#333]">
                    <div className="flex items-center gap-3">
                      <Mail className="w-5 h-5 text-gray-400" />
                      <div>
                        <p className="text-sm text-gray-400">Email Address</p>
                        <p className="text-white font-medium">{user.email}</p>
                      </div>
                    </div>
                  </div>
                </div>
              </motion.div>
            </div>
          </motion.div>
        </div>
      </div>
    </Layout>
  );
}
