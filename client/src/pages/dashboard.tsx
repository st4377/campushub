import { useEffect, useState } from "react";
import { useLocation } from "wouter";
import { motion, AnimatePresence } from "framer-motion";
import { User, Mail, Calendar, Users, Plus, LogOut, Hexagon, Clock, CheckCircle, XCircle, FileText, Home, Menu, ChevronRight, Zap } from "lucide-react";
import { Button } from "@/components/ui/button";
import { toast } from "sonner";
import { Layout } from "@/components/layout";
import { useAuth } from "@/context/auth";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";

interface Submission {
  id: string;
  name: string;
  status: "pending" | "approved" | "rejected";
}

interface UserCommunity {
  id: string;
  name: string;
  isActive: boolean;
}

export default function Dashboard() {
  const [, setLocation] = useLocation();
  const { user, logout, isLoading, updateUser } = useAuth();
  const [isMobileSidebarOpen, setIsMobileSidebarOpen] = useState(false);
  const [isEmailRevealed, setIsEmailRevealed] = useState(false);
  const [isEditNameDialogOpen, setIsEditNameDialogOpen] = useState(false);
  const [editedName, setEditedName] = useState("");
  const queryClient = useQueryClient();

  const updateProfileMutation = useMutation({
    mutationFn: async (newName: string) => {
      const response = await fetch(`/api/user/profile/${user?.id}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ fullName: newName }),
      });
      if (!response.ok) {
        const error = await response.json();
        throw new Error(error.error || "Failed to update profile");
      }
      return response.json();
    },
    onSuccess: (data) => {
      if (updateUser && data.user) {
        updateUser(data.user);
      }
      toast.success("Display name updated successfully");
      setIsEditNameDialogOpen(false);
      queryClient.invalidateQueries({ queryKey: ["user-submissions"] });
    },
    onError: (error: Error) => {
      toast.error(error.message);
    },
  });

  const handleEditName = () => {
    setEditedName(user?.fullName || "");
    setIsEditNameDialogOpen(true);
  };

  const handleSaveName = () => {
    if (editedName.trim().length < 2) {
      toast.error("Name must be at least 2 characters");
      return;
    }
    updateProfileMutation.mutate(editedName.trim());
  };

  const { data: submissionsData } = useQuery({
    queryKey: ["user-submissions", user?.id],
    queryFn: async () => {
      const response = await fetch(`/api/user/submissions/${user?.id}`);
      if (!response.ok) throw new Error("Failed to fetch submissions");
      const data = await response.json();
      return data.submissions as Submission[];
    },
    enabled: !!user?.id,
  });

  const { data: userCommunities } = useQuery({
    queryKey: ["user-communities", user?.id],
    queryFn: async () => {
      const response = await fetch(`/api/user/communities/${user?.id}`);
      if (!response.ok) throw new Error("Failed to fetch communities");
      const data = await response.json();
      return { active: data.active as UserCommunity[], deleted: data.deleted as UserCommunity[] };
    },
    enabled: !!user?.id,
  });

  useEffect(() => {
    // Try to fetch current user from session (for Google OAuth redirect)
    if (!user && !isLoading) {
      fetch("/api/auth/me")
        .then(res => res.json())
        .then(data => {
          if (data.success && data.user) {
            updateUser(data.user);
          }
        })
        .catch(() => {
          // User not authenticated, redirect to login
          toast.error("Please log in to access your dashboard");
          setLocation("/login");
        });
    }
  }, [user, isLoading, setLocation, updateUser]);

  useEffect(() => {
    if (!isLoading && !user) {
      toast.error("Please log in to access your dashboard");
      setLocation("/login");
    }
  }, [user, isLoading, setLocation]);

  const handleLogout = () => {
    logout();
    toast.success("Logged out successfully");
    setLocation("/");
  };

  const handleListCommunity = () => {
    setLocation("/list-community");
  };

  if (isLoading || !user) {
    return (
      <div className="min-h-screen bg-black flex items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-[#FFC400]"></div>
      </div>
    );
  }

  const approvedCount = submissionsData?.filter(s => s.status === "approved").length || 0;
  const pendingCount = submissionsData?.filter(s => s.status === "pending").length || 0;
  const rejectedCount = submissionsData?.filter(s => s.status === "rejected").length || 0;
  const activeCommunitiesCount = userCommunities?.active?.length || 0;

  const getInitials = (name: string) => {
    return name
      .split(" ")
      .map((n) => n[0])
      .join("")
      .toUpperCase()
      .slice(0, 2);
  };

  const maskEmail = (email: string) => {
    const [localPart, domain] = email.split("@");
    if (localPart.length <= 3) {
      return `***@${domain}`;
    }
    return `${localPart.slice(0, 3)}${"*".repeat(Math.min(localPart.length - 3, 8))}@${domain}`;
  };

  const formatDate = (dateString?: string) => {
    if (!dateString) return "Recently";
    return new Date(dateString).toLocaleDateString("en-US", {
      month: "short",
      day: "numeric",
      year: "numeric"
    });
  };

  const SidebarContent = () => (
    <>
      <div className="p-4 border-b border-[#2a2a2a]">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-full bg-gradient-to-br from-[#FFC400] to-[#FF8C00] flex items-center justify-center text-sm font-bold text-black">
            {getInitials(user.fullName)}
          </div>
          <div className="flex-1 min-w-0">
            <p className="text-white font-semibold text-sm truncate">{user.fullName}</p>
          </div>
        </div>
      </div>

      <nav className="flex-1 p-3">
        <div className="mb-4">
          <p className="px-3 text-xs font-semibold text-gray-500 uppercase tracking-wider mb-2">
            Dashboard
          </p>
          <button
            onClick={() => {
              setLocation("/dashboard");
              setIsMobileSidebarOpen(false);
            }}
            className="w-full flex items-center gap-3 px-3 py-2 rounded-lg text-sm font-medium bg-[#FFC400]/10 text-[#FFC400]"
          >
            <User className="w-4 h-4" />
            Overview
          </button>
        </div>

        <div className="mb-4">
          <p className="px-3 text-xs font-semibold text-gray-500 uppercase tracking-wider mb-2">
            Manage
          </p>
          <button
            onClick={() => {
              setLocation("/submission-status");
              setIsMobileSidebarOpen(false);
            }}
            className="w-full flex items-center gap-3 px-3 py-2 rounded-lg text-sm font-medium text-gray-400 hover:text-white hover:bg-[#2a2a2a] transition-all"
          >
            <FileText className="w-4 h-4" />
            Submission Status
            {pendingCount > 0 && (
              <span className="ml-auto bg-yellow-500 text-black text-xs font-bold px-1.5 py-0.5 rounded-full">
                {pendingCount}
              </span>
            )}
          </button>
          <button
            onClick={() => {
              setLocation("/my-communities");
              setIsMobileSidebarOpen(false);
            }}
            className="w-full flex items-center gap-3 px-3 py-2 rounded-lg text-sm font-medium text-gray-400 hover:text-white hover:bg-[#2a2a2a] transition-all"
          >
            <Hexagon className="w-4 h-4" />
            My Communities
            {activeCommunitiesCount > 0 && (
              <span className="ml-auto bg-green-500/20 text-green-400 text-xs font-bold px-1.5 py-0.5 rounded-full">
                {activeCommunitiesCount}
              </span>
            )}
          </button>
          <button
            onClick={() => {
              setLocation("/boost");
              setIsMobileSidebarOpen(false);
            }}
            className="w-full flex items-center gap-3 px-3 py-2 rounded-lg text-sm font-medium text-gray-400 hover:text-white hover:bg-[#2a2a2a] transition-all group"
          >
            <Zap className="w-4 h-4 text-[#FFC400] group-hover:text-[#FFD700]" />
            <span className="bg-gradient-to-r from-[#FFC400] to-[#FF8C00] bg-clip-text text-transparent font-semibold">
              Bump
            </span>
          </button>
        </div>

        <div className="mb-4">
          <p className="px-3 text-xs font-semibold text-gray-500 uppercase tracking-wider mb-2">
            Quick Actions
          </p>
          <button
            onClick={handleListCommunity}
            className="w-full flex items-center gap-3 px-3 py-2 rounded-lg text-sm font-medium text-gray-400 hover:text-white hover:bg-[#2a2a2a] transition-all"
          >
            <Plus className="w-4 h-4" />
            List a Community
          </button>
          <button
            onClick={() => setLocation("/")}
            className="w-full flex items-center gap-3 px-3 py-2 rounded-lg text-sm font-medium text-gray-400 hover:text-white hover:bg-[#2a2a2a] transition-all"
          >
            <Home className="w-4 h-4" />
            Browse Communities
          </button>
        </div>
      </nav>

      <div className="p-3 border-t border-[#2a2a2a]">
        <button
          onClick={handleLogout}
          className="w-full flex items-center gap-3 px-3 py-2 rounded-lg text-sm font-medium text-red-400 hover:text-red-300 hover:bg-red-500/10 transition-all"
        >
          <LogOut className="w-4 h-4" />
          Log Out
        </button>
      </div>
    </>
  );

  return (
    <Layout hideFooter>
      <div className="min-h-[calc(100vh-64px)] bg-[#1a1a1a]">
        <div className="flex">
          <motion.aside
            initial={{ x: -20, opacity: 0 }}
            animate={{ x: 0, opacity: 1 }}
            transition={{ duration: 0.3 }}
            className="hidden lg:flex w-60 min-h-[calc(100vh-64px)] bg-[#111] border-r border-[#2a2a2a] flex-col sticky top-16"
          >
            <SidebarContent />
          </motion.aside>

          <AnimatePresence>
            {isMobileSidebarOpen && (
              <>
                <motion.div
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  exit={{ opacity: 0 }}
                  className="lg:hidden fixed inset-0 bg-black/60 z-40"
                  onClick={() => setIsMobileSidebarOpen(false)}
                />
                <motion.aside
                  initial={{ x: -280 }}
                  animate={{ x: 0 }}
                  exit={{ x: -280 }}
                  transition={{ type: "spring", damping: 25, stiffness: 300 }}
                  className="lg:hidden fixed left-0 top-16 bottom-0 w-64 bg-[#111] border-r border-[#2a2a2a] flex flex-col z-50"
                >
                  <SidebarContent />
                </motion.aside>
              </>
            )}
          </AnimatePresence>

          <main className="flex-1 p-4 lg:p-8">
            <div className="max-w-4xl mx-auto">
              <div className="lg:hidden flex items-center gap-4 mb-6">
                <button
                  onClick={() => setIsMobileSidebarOpen(true)}
                  className="p-2 rounded-lg bg-[#111] border border-[#2a2a2a] text-gray-400 hover:text-white transition-colors"
                >
                  <Menu className="w-5 h-5" />
                </button>
                <div className="flex-1">
                  <h1 className="text-xl font-bold text-white">Dashboard</h1>
                </div>
              </div>

              <motion.div
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.2 }}
              >
                <h1 className="hidden lg:block text-2xl font-bold text-white mb-6">Dashboard Overview</h1>

                <div className="bg-[#111] rounded-lg border border-[#2a2a2a] overflow-hidden mb-6">
                  <div className="h-20 lg:h-24 bg-gradient-to-r from-[#FFC400] via-[#FF8C00] to-[#FFC400] relative">
                    <div className="absolute inset-0 opacity-20">
                      {[...Array(12)].map((_, i) => (
                        <div
                          key={i}
                          className="absolute rounded-full bg-white"
                          style={{
                            width: `${Math.random() * 6 + 2}px`,
                            height: `${Math.random() * 6 + 2}px`,
                            left: `${Math.random() * 100}%`,
                            top: `${Math.random() * 100}%`,
                            opacity: Math.random() * 0.5 + 0.3,
                          }}
                        />
                      ))}
                    </div>
                  </div>

                  <div className="px-4 lg:px-6 pb-6">
                    <div className="flex items-end gap-4 -mt-10 lg:-mt-12">
                      <div className="w-20 h-20 lg:w-24 lg:h-24 rounded-full bg-gradient-to-br from-[#FFC400] to-[#FF8C00] flex items-center justify-center text-2xl lg:text-3xl font-bold text-black border-2 border-[#1a1a1a] shadow-xl flex-shrink-0 ring-2 ring-[#1a1a1a] relative z-10">
                        {getInitials(user.fullName)}
                      </div>
                      <div className="pb-2 pt-12 lg:pt-14">
                        <h2 className="text-lg lg:text-xl font-bold text-white flex items-center gap-2 flex-wrap">
                          <span className="break-words">{user.fullName}</span>
                        </h2>
                        <div className="flex items-center gap-2 mt-1">
                          <div className="w-3 h-3 rounded-full bg-green-500 flex-shrink-0"></div>
                          <span className="text-sm text-gray-400">Online</span>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>

                <div className="bg-[#111] rounded-lg border border-[#2a2a2a] overflow-hidden mb-6">
                  <div className="p-4 lg:p-6 space-y-1">
                    <div className="flex items-center justify-between py-4 border-b border-[#2a2a2a]">
                      <div className="flex-1 min-w-0 mr-4">
                        <p className="text-xs font-semibold text-gray-400 uppercase tracking-wider mb-1">
                          Display Name
                        </p>
                        <p className="text-white font-medium truncate">{user.fullName}</p>
                      </div>
                      <Button
                        variant="secondary"
                        size="sm"
                        onClick={handleEditName}
                        className="bg-[#2a2a2a] text-white hover:bg-[#3a3a3a] rounded-lg flex-shrink-0"
                      >
                        Edit
                      </Button>
                    </div>

                    <div className="flex items-center justify-between py-4 border-b border-[#2a2a2a]">
                      <div className="flex-1 min-w-0">
                        <p className="text-xs font-semibold text-gray-400 uppercase tracking-wider mb-1">
                          Email
                        </p>
                        <p className="text-white font-medium">
                          {isEmailRevealed ? user.email : maskEmail(user.email)}
                        </p>
                      </div>
                      <button 
                        onClick={() => setIsEmailRevealed(!isEmailRevealed)}
                        className="text-[#FFC400] text-sm hover:underline font-medium flex-shrink-0 ml-4"
                      >
                        {isEmailRevealed ? "Hide" : "Reveal"}
                      </button>
                    </div>

                    <div className="flex items-center justify-between py-4">
                      <div>
                        <p className="text-xs font-semibold text-gray-400 uppercase tracking-wider mb-1">
                          Member Since
                        </p>
                        <p className="text-white font-medium">
                          {formatDate(user.createdAt)}
                        </p>
                      </div>
                    </div>
                  </div>
                </div>

                <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
                  <div className="bg-[#111] rounded-lg border border-[#2a2a2a] p-4 lg:p-5">
                    <div className="flex items-center gap-3">
                      <div className="w-10 h-10 rounded-xl bg-[#FFC400]/20 flex items-center justify-center">
                        <Hexagon className="w-5 h-5 text-[#FFC400]" />
                      </div>
                      <div>
                        <p className="text-gray-400 text-xs">Active</p>
                        <p className="text-xl font-bold text-white">{activeCommunitiesCount}</p>
                      </div>
                    </div>
                  </div>
                  <div className="bg-[#111] rounded-lg border border-[#2a2a2a] p-4 lg:p-5">
                    <div className="flex items-center gap-3">
                      <div className="w-10 h-10 rounded-xl bg-yellow-500/20 flex items-center justify-center">
                        <Clock className="w-5 h-5 text-yellow-400" />
                      </div>
                      <div>
                        <p className="text-gray-400 text-xs">Pending</p>
                        <p className="text-xl font-bold text-white">{pendingCount}</p>
                      </div>
                    </div>
                  </div>
                  <div className="bg-[#111] rounded-lg border border-[#2a2a2a] p-4 lg:p-5">
                    <div className="flex items-center gap-3">
                      <div className="w-10 h-10 rounded-xl bg-green-500/20 flex items-center justify-center">
                        <CheckCircle className="w-5 h-5 text-green-400" />
                      </div>
                      <div>
                        <p className="text-gray-400 text-xs">Approved</p>
                        <p className="text-xl font-bold text-white">{approvedCount}</p>
                      </div>
                    </div>
                  </div>
                  <div className="bg-[#111] rounded-lg border border-[#2a2a2a] p-4 lg:p-5">
                    <div className="flex items-center gap-3">
                      <div className="w-10 h-10 rounded-xl bg-red-500/20 flex items-center justify-center">
                        <XCircle className="w-5 h-5 text-red-400" />
                      </div>
                      <div>
                        <p className="text-gray-400 text-xs">Rejected</p>
                        <p className="text-xl font-bold text-white">{rejectedCount}</p>
                      </div>
                    </div>
                  </div>
                </div>

                <h2 className="text-lg font-bold text-white mb-4">Quick Access</h2>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <motion.button
                    whileHover={{ scale: 1.02 }}
                    whileTap={{ scale: 0.98 }}
                    onClick={() => setLocation("/submission-status")}
                    className="bg-[#111] rounded-lg border border-[#2a2a2a] p-6 text-left hover:border-[#FFC400]/50 transition-colors group"
                  >
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-4">
                        <div className="w-12 h-12 rounded-xl bg-yellow-500/20 flex items-center justify-center">
                          <FileText className="w-6 h-6 text-yellow-400" />
                        </div>
                        <div>
                          <h3 className="font-semibold text-white group-hover:text-[#FFC400] transition-colors">Submission Status</h3>
                          <p className="text-sm text-gray-400">Track your community submissions</p>
                        </div>
                      </div>
                      <ChevronRight className="w-5 h-5 text-gray-500 group-hover:text-[#FFC400] transition-colors" />
                    </div>
                    {pendingCount > 0 && (
                      <div className="mt-4 p-3 bg-yellow-500/10 border border-yellow-500/20 rounded-lg">
                        <p className="text-sm text-yellow-400">
                          {pendingCount} submission{pendingCount !== 1 ? 's' : ''} awaiting review
                        </p>
                      </div>
                    )}
                  </motion.button>

                  <motion.button
                    whileHover={{ scale: 1.02 }}
                    whileTap={{ scale: 0.98 }}
                    onClick={() => setLocation("/my-communities")}
                    className="bg-[#111] rounded-lg border border-[#2a2a2a] p-6 text-left hover:border-[#FFC400]/50 transition-colors group"
                  >
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-4">
                        <div className="w-12 h-12 rounded-xl bg-green-500/20 flex items-center justify-center">
                          <Hexagon className="w-6 h-6 text-green-400" />
                        </div>
                        <div>
                          <h3 className="font-semibold text-white group-hover:text-[#FFC400] transition-colors">My Communities</h3>
                          <p className="text-sm text-gray-400">Manage your approved communities</p>
                        </div>
                      </div>
                      <ChevronRight className="w-5 h-5 text-gray-500 group-hover:text-[#FFC400] transition-colors" />
                    </div>
                    {activeCommunitiesCount > 0 && (
                      <div className="mt-4 p-3 bg-green-500/10 border border-green-500/20 rounded-lg">
                        <p className="text-sm text-green-400">
                          {activeCommunitiesCount} active communit{activeCommunitiesCount !== 1 ? 'ies' : 'y'}
                        </p>
                      </div>
                    )}
                  </motion.button>

                  <motion.button
                    whileHover={{ scale: 1.02 }}
                    whileTap={{ scale: 0.98 }}
                    onClick={() => setLocation("/boost")}
                    className="bg-gradient-to-r from-[#FFC400]/10 to-[#FF8C00]/5 rounded-lg border border-[#FFC400]/30 p-6 text-left hover:border-[#FFC400] transition-colors group"
                    style={{ boxShadow: "0 0 20px rgba(255, 196, 0, 0.1)" }}
                  >
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-4">
                        <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-[#FFC400] to-[#FF8C00] flex items-center justify-center">
                          <Zap className="w-6 h-6 text-black" />
                        </div>
                        <div>
                          <h3 className="font-semibold bg-gradient-to-r from-[#FFC400] to-[#FF8C00] bg-clip-text text-transparent">Bump Center</h3>
                          <p className="text-sm text-gray-400">Bump your community to the top</p>
                        </div>
                      </div>
                      <ChevronRight className="w-5 h-5 text-[#FFC400]" />
                    </div>
                  </motion.button>

                  <motion.button
                    whileHover={{ scale: 1.02 }}
                    whileTap={{ scale: 0.98 }}
                    onClick={handleListCommunity}
                    className="bg-[#111] rounded-lg border border-[#2a2a2a] p-6 text-left hover:border-[#FFC400]/50 transition-colors group"
                  >
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-4">
                        <div className="w-12 h-12 rounded-xl bg-yellow-500/20 flex items-center justify-center">
                          <Plus className="w-6 h-6 text-yellow-400" />
                        </div>
                        <div>
                          <h3 className="font-semibold text-white group-hover:text-[#FFC400] transition-colors">List a New Community</h3>
                          <p className="text-sm text-gray-400">Submit a new community for approval</p>
                        </div>
                      </div>
                      <ChevronRight className="w-5 h-5 text-[#FFC400]" />
                    </div>
                  </motion.button>
                </div>
              </motion.div>
            </div>
          </main>
        </div>
      </div>

      <Dialog open={isEditNameDialogOpen} onOpenChange={setIsEditNameDialogOpen}>
        <DialogContent className="bg-[#1a1a1a] border-[#2a2a2a] text-white">
          <DialogHeader>
            <DialogTitle>Edit Display Name</DialogTitle>
            <DialogDescription className="text-gray-400">
              Update your display name. This will be visible across the platform.
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-4 pt-4">
            <div className="space-y-2">
              <Label htmlFor="displayName" className="text-gray-300">Display Name</Label>
              <Input
                id="displayName"
                value={editedName}
                onChange={(e) => setEditedName(e.target.value)}
                placeholder="Enter your display name"
                className="bg-[#111] border-[#3a3a3a] text-white placeholder:text-gray-500 focus:border-[#FFC400]"
              />
            </div>
            <div className="flex gap-3 justify-end">
              <Button
                variant="outline"
                onClick={() => setIsEditNameDialogOpen(false)}
                className="border-[#3a3a3a] text-gray-300 hover:bg-[#2a2a2a]"
              >
                Cancel
              </Button>
              <Button
                onClick={handleSaveName}
                disabled={updateProfileMutation.isPending}
                className="bg-[#FFC400] text-black hover:bg-[#FFD700]"
              >
                {updateProfileMutation.isPending ? "Saving..." : "Save Changes"}
              </Button>
            </div>
          </div>
        </DialogContent>
      </Dialog>
    </Layout>
  );
}
