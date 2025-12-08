import { useEffect, useState } from "react";
import { useLocation } from "wouter";
import { motion } from "framer-motion";
import { Zap, ArrowLeft, Clock, Rocket } from "lucide-react";
import { Button } from "@/components/ui/button";
import { toast } from "sonner";
import { Layout } from "@/components/layout";
import { useAuth } from "@/context/auth";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";

interface UserCommunity {
  id: string;
  name: string;
  platform: string;
  category: string;
  description: string;
  inviteLink: string;
  tags: string[];
  visibility: string;
  memberCount: number;
  imageUrl?: string | null;
  adminTagId?: string;
  bumpedAt?: string | null;
}

interface BumpStatus {
  lastBumpAt: string | null;
  lastBumpCommunityId: string | null;
  canBump: boolean;
  nextAvailableAt: string | null;
  hoursRemaining: number | null;
}

export default function Boost() {
  const [, setLocation] = useLocation();
  const { user, isLoading } = useAuth();
  const queryClient = useQueryClient();

  const { data: userCommunities, isLoading: communitiesLoading } = useQuery({
    queryKey: ["user-communities", user?.id],
    queryFn: async () => {
      const response = await fetch(`/api/user/communities/${user?.id}`);
      if (!response.ok) throw new Error("Failed to fetch communities");
      const data = await response.json();
      return { 
        active: data.active as UserCommunity[], 
        bumpStatus: data.bumpStatus as BumpStatus
      };
    },
    enabled: !!user?.id,
  });

  const bumpMutation = useMutation({
    mutationFn: async (communityId: string) => {
      const response = await fetch(`/api/user/communities/${communityId}/bump`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ userId: user?.id }),
      });
      const data = await response.json();
      if (!response.ok) {
        throw new Error(data.error || "Failed to bump community");
      }
      return data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["user-communities", user?.id] });
      queryClient.invalidateQueries({ queryKey: ["approved-communities"] });
      toast.success("Community bumped to the top!");
    },
    onError: (error: Error) => {
      toast.error(error.message);
    },
  });

  const handleBump = (communityId: string) => {
    bumpMutation.mutate(communityId);
  };

  const getInitials = (name: string) => {
    return name
      .split(" ")
      .map((n) => n[0])
      .join("")
      .toUpperCase()
      .slice(0, 2);
  };

  useEffect(() => {
    if (!isLoading && !user) {
      toast.error("Please log in to bump your communities");
      setLocation("/login");
    }
  }, [user, isLoading, setLocation]);

  if (isLoading || !user) {
    return (
      <div className="min-h-screen bg-black flex items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-[#FFC400]"></div>
      </div>
    );
  }

  const activeCommunities = userCommunities?.active || [];
  const bumpStatus = userCommunities?.bumpStatus;
  const currentlyBumpedId = bumpStatus?.lastBumpCommunityId;

  const [countdown, setCountdown] = useState({ hours: 0, minutes: 0, seconds: 0 });

  useEffect(() => {
    if (!bumpStatus?.nextAvailableAt || bumpStatus.canBump) return;

    const calculateTimeLeft = () => {
      const nextAvailable = new Date(bumpStatus.nextAvailableAt!).getTime();
      const now = Date.now();
      const diff = Math.max(0, nextAvailable - now);

      const hours = Math.floor(diff / (1000 * 60 * 60));
      const minutes = Math.floor((diff % (1000 * 60 * 60)) / (1000 * 60));
      const seconds = Math.floor((diff % (1000 * 60)) / 1000);

      setCountdown({ hours, minutes, seconds });
    };

    calculateTimeLeft();
    const interval = setInterval(calculateTimeLeft, 1000);

    return () => clearInterval(interval);
  }, [bumpStatus?.nextAvailableAt, bumpStatus?.canBump]);

  const formatTime = (num: number) => num.toString().padStart(2, '0');

  return (
    <Layout hideFooter>
      <div className="min-h-[calc(100vh-64px)] bg-[#0a0a0f]">
        <div className="max-w-5xl mx-auto p-6 lg:p-10">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.3 }}
          >
            <div className="flex items-center gap-4 mb-8">
              <Button
                variant="ghost"
                size="sm"
                onClick={() => setLocation("/dashboard")}
                className="text-gray-400 hover:text-white text-base"
              >
                <ArrowLeft className="w-5 h-5 mr-2" />
                Back to Dashboard
              </Button>
            </div>

            <div className="text-center mb-12">
              <motion.div
                initial={{ scale: 0.9, opacity: 0 }}
                animate={{ scale: 1, opacity: 1 }}
                transition={{ delay: 0.1 }}
                className="inline-flex items-center justify-center w-24 h-24 rounded-full bg-gradient-to-br from-[#FFC400]/20 to-[#FF8C00]/20 border border-[#FFC400]/30 mb-6"
                style={{
                  boxShadow: "0 0 50px rgba(255, 196, 0, 0.25), inset 0 0 25px rgba(255, 196, 0, 0.1)"
                }}
              >
                <Rocket className="w-12 h-12 text-[#FFC400]" />
              </motion.div>
              <h1 className="text-4xl lg:text-5xl font-bold text-white mb-3">
                <span className="bg-gradient-to-r from-[#FFC400] to-[#FF8C00] bg-clip-text text-transparent">
                  Bump Center
                </span>
              </h1>
              <p className="text-gray-400 text-lg max-w-lg mx-auto">
                Bump your community to the top of the homepage for 24 hours
              </p>
            </div>

            {bumpStatus && (
              <motion.div
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.2 }}
                className={`rounded-2xl p-6 mb-10 border ${
                  bumpStatus.canBump
                    ? "bg-gradient-to-r from-[#FFC400]/10 to-[#FF8C00]/5 border-[#FFC400]/30"
                    : "bg-gradient-to-r from-gray-800/50 to-gray-900/50 border-gray-700"
                }`}
                style={bumpStatus.canBump ? {
                  boxShadow: "0 0 40px rgba(255, 196, 0, 0.1)"
                } : {}}
              >
                <div className="flex items-center gap-5">
                  <div className={`w-14 h-14 rounded-xl flex items-center justify-center ${
                    bumpStatus.canBump
                      ? "bg-[#FFC400]/20"
                      : "bg-gray-700/50"
                  }`}>
                    {bumpStatus.canBump ? (
                      <Zap className="w-7 h-7 text-[#FFC400]" />
                    ) : (
                      <Clock className="w-7 h-7 text-gray-400" />
                    )}
                  </div>
                  <div className="flex-1">
                    {bumpStatus.canBump ? (
                      <>
                        <p className="text-[#FFC400] font-bold text-lg">Bump Available</p>
                        <p className="text-gray-400 text-base">Select a community below to bump it to the top</p>
                      </>
                    ) : (
                      <>
                        <p className="text-gray-300 font-bold text-lg">Bump on Cooldown</p>
                        <p className="text-gray-500 text-base">Next bump available soon</p>
                      </>
                    )}
                  </div>
                  {!bumpStatus.canBump && (
                    <div className="flex items-center gap-1 bg-gray-900/80 px-4 py-3 rounded-xl border border-gray-700">
                      <div className="flex items-center gap-1 font-mono text-2xl font-bold">
                        <span className="text-[#FFC400] bg-gray-800 px-2 py-1 rounded">{formatTime(countdown.hours)}</span>
                        <span className="text-gray-500">:</span>
                        <span className="text-[#FFC400] bg-gray-800 px-2 py-1 rounded">{formatTime(countdown.minutes)}</span>
                        <span className="text-gray-500">:</span>
                        <span className="text-[#FFC400] bg-gray-800 px-2 py-1 rounded">{formatTime(countdown.seconds)}</span>
                      </div>
                    </div>
                  )}
                </div>
              </motion.div>
            )}

            {communitiesLoading ? (
              <div className="flex items-center justify-center py-20">
                <div className="animate-spin rounded-full h-10 w-10 border-t-2 border-b-2 border-[#FFC400]"></div>
              </div>
            ) : activeCommunities.length === 0 ? (
              <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                transition={{ delay: 0.3 }}
                className="bg-[#111118] rounded-2xl border border-gray-800 p-16 text-center"
              >
                <div className="w-24 h-24 rounded-full bg-gray-800 flex items-center justify-center mx-auto mb-6">
                  <Zap className="w-12 h-12 text-gray-600" />
                </div>
                <h3 className="text-xl font-bold text-white mb-3">No Communities to Bump</h3>
                <p className="text-gray-500 text-base mb-8">Get your communities approved first to bump them</p>
                <Button
                  onClick={() => setLocation("/list-community")}
                  className="bg-[#FFC400] hover:bg-[#FFD700] text-black font-bold rounded-xl px-8 py-3 text-base"
                >
                  List a Community
                </Button>
              </motion.div>
            ) : (
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
                {activeCommunities.map((community, index) => {
                  const isBumped = community.id === currentlyBumpedId && !bumpStatus?.canBump;
                  
                  return (
                    <motion.div
                      key={community.id}
                      initial={{ opacity: 0, y: 20 }}
                      animate={{ opacity: 1, y: 0 }}
                      transition={{ delay: 0.1 + index * 0.05 }}
                      className={`relative group rounded-2xl p-6 border transition-all duration-300 ${
                        isBumped
                          ? "bg-gradient-to-br from-[#FFC400]/10 to-[#FF8C00]/5 border-[#FFC400]/40"
                          : "bg-[#111118] border-gray-800 hover:border-[#FFC400]/30"
                      }`}
                      style={isBumped ? {
                        boxShadow: "0 0 30px rgba(255, 196, 0, 0.15)"
                      } : {}}
                    >
                      {isBumped && (
                        <div className="absolute -top-3 -right-3 px-3 py-1 bg-[#FFC400] text-black text-sm font-bold rounded-full flex items-center gap-1.5">
                          <Zap className="w-4 h-4" />
                          BUMPED
                        </div>
                      )}
                      
                      <div className="flex items-center gap-4 mb-5">
                        <div className="w-16 h-16 rounded-xl overflow-hidden flex-shrink-0 border-2 border-gray-700">
                          {community.imageUrl ? (
                            <img 
                              src={community.imageUrl} 
                              alt={community.name}
                              className="w-full h-full object-cover"
                            />
                          ) : (
                            <div className="w-full h-full bg-gradient-to-br from-[#FFC400]/20 to-[#FF8C00]/20 flex items-center justify-center">
                              <span className="text-xl font-bold text-[#FFC400]">
                                {getInitials(community.name)}
                              </span>
                            </div>
                          )}
                        </div>
                        
                        <div className="flex-1 min-w-0">
                          <h3 className="font-bold text-white truncate text-lg">
                            {community.name}
                          </h3>
                          <p className="text-base text-[#FFC400]/80 font-mono">
                            #{community.adminTagId || "---"}
                          </p>
                        </div>
                      </div>

                      <button
                        onClick={() => handleBump(community.id)}
                        disabled={!bumpStatus?.canBump || bumpMutation.isPending || isBumped}
                        className={`w-full py-3.5 px-5 rounded-xl font-bold text-base transition-all duration-300 flex items-center justify-center gap-2.5 ${
                          isBumped
                            ? "bg-[#FFC400]/20 text-[#FFC400] cursor-default border border-[#FFC400]/30"
                            : bumpStatus?.canBump
                              ? "bg-gradient-to-r from-[#FFC400] to-[#FF8C00] text-black hover:from-[#FFD700] hover:to-[#FFA500] cursor-pointer"
                              : "bg-gray-800 text-gray-500 cursor-not-allowed border border-gray-700"
                        }`}
                        style={bumpStatus?.canBump && !isBumped ? {
                          boxShadow: "0 0 25px rgba(255, 196, 0, 0.4), 0 0 50px rgba(255, 196, 0, 0.15)"
                        } : {}}
                      >
                        <Zap className={`w-5 h-5 ${bumpStatus?.canBump && !isBumped ? "animate-pulse" : ""}`} />
                        {bumpMutation.isPending ? (
                          "Bumping..."
                        ) : isBumped ? (
                          "Currently Bumped"
                        ) : bumpStatus?.canBump ? (
                          "Bump Now"
                        ) : (
                          "On Cooldown"
                        )}
                      </button>
                    </motion.div>
                  );
                })}
              </div>
            )}

            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ delay: 0.5 }}
              className="mt-12 p-6 rounded-2xl bg-[#111118] border border-gray-800"
            >
              <h3 className="text-base font-bold text-gray-300 mb-3 flex items-center gap-2">
                <Zap className="w-5 h-5 text-[#FFC400]" />
                How Bump Works
              </h3>
              <ul className="text-sm text-gray-500 space-y-2">
                <li>You can bump one community at a time</li>
                <li>24-hour cooldown between bumps</li>
                <li>Bumping a new community replaces the previous bump</li>
              </ul>
            </motion.div>
          </motion.div>
        </div>
      </div>
    </Layout>
  );
}
