import { useEffect, useState } from "react";
import { useLocation } from "wouter";
import { motion, AnimatePresence } from "framer-motion";
import { User, Mail, Calendar, Users, Plus, LogOut, Settings, ChevronRight, Hexagon, Clock, CheckCircle, XCircle, FileText, ExternalLink, Tag, Eye, Globe, Link2, MessageSquare, Shield, Bell, Palette, Home, Menu } from "lucide-react";
import { Button } from "@/components/ui/button";
import { toast } from "sonner";
import { Layout } from "@/components/layout";
import { useAuth } from "@/context/auth";
import { useQuery } from "@tanstack/react-query";
import { Badge } from "@/components/ui/badge";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from "@/components/ui/dialog";

interface Submission {
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
  status: "pending" | "approved" | "rejected";
  rejectionReason?: string;
  submittedAt?: string;
  approvedAt?: string;
  rejectedAt?: string;
}

type ActiveSection = "account" | "communities";

export default function Dashboard() {
  const [, setLocation] = useLocation();
  const { user, logout, isLoading } = useAuth();
  const [selectedSubmission, setSelectedSubmission] = useState<Submission | null>(null);
  const [activeSection, setActiveSection] = useState<ActiveSection>("account");
  const [isMobileSidebarOpen, setIsMobileSidebarOpen] = useState(false);
  const [isEmailRevealed, setIsEmailRevealed] = useState(false);

  const { data: submissionsData, isLoading: submissionsLoading } = useQuery({
    queryKey: ["user-submissions", user?.id],
    queryFn: async () => {
      const response = await fetch(`/api/user/submissions/${user?.id}`);
      if (!response.ok) throw new Error("Failed to fetch submissions");
      const data = await response.json();
      return data.submissions as Submission[];
    },
    enabled: !!user?.id,
  });

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

  const getStatusBadge = (status: string) => {
    switch (status) {
      case "pending":
        return (
          <Badge className="bg-yellow-500/20 text-yellow-400 border-yellow-500/30">
            <Clock className="w-3 h-3 mr-1" />
            Pending
          </Badge>
        );
      case "approved":
        return (
          <Badge className="bg-green-500/20 text-green-400 border-green-500/30">
            <CheckCircle className="w-3 h-3 mr-1" />
            Approved
          </Badge>
        );
      case "rejected":
        return (
          <Badge className="bg-red-500/20 text-red-400 border-red-500/30">
            <XCircle className="w-3 h-3 mr-1" />
            Rejected
          </Badge>
        );
      default:
        return null;
    }
  };

  const getPlatformColor = (platform: string) => {
    const colors: Record<string, string> = {
      WhatsApp: "text-green-400",
      Telegram: "text-blue-400",
      Discord: "text-indigo-400",
      Instagram: "text-pink-400",
    };
    return colors[platform] || "text-gray-400";
  };

  const approvedCount = submissionsData?.filter(s => s.status === "approved").length || 0;
  const pendingCount = submissionsData?.filter(s => s.status === "pending").length || 0;
  const totalSubmissions = submissionsData?.length || 0;

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
      {/* User Profile Mini */}
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

      {/* Navigation */}
      <nav className="flex-1 p-3">
        <div className="mb-4">
          <p className="px-3 text-xs font-semibold text-gray-500 uppercase tracking-wider mb-2">
            User Settings
          </p>
          <button
            onClick={() => {
              setActiveSection("account");
              setIsMobileSidebarOpen(false);
            }}
            className={`w-full flex items-center gap-3 px-3 py-2 rounded-lg text-sm font-medium transition-all ${
              activeSection === "account"
                ? "bg-[#FFC400]/10 text-[#FFC400]"
                : "text-gray-400 hover:text-white hover:bg-[#2a2a2a]"
            }`}
          >
            <User className="w-4 h-4" />
            My Account
          </button>
          <button
            onClick={() => {
              setActiveSection("communities");
              setIsMobileSidebarOpen(false);
            }}
            className={`w-full flex items-center gap-3 px-3 py-2 rounded-lg text-sm font-medium transition-all ${
              activeSection === "communities"
                ? "bg-[#FFC400]/10 text-[#FFC400]"
                : "text-gray-400 hover:text-white hover:bg-[#2a2a2a]"
            }`}
          >
            <FileText className="w-4 h-4" />
            My Communities
            {pendingCount > 0 && (
              <span className="ml-auto bg-yellow-500 text-black text-xs font-bold px-1.5 py-0.5 rounded-full">
                {pendingCount}
              </span>
            )}
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

      {/* Logout Button */}
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
          {/* Desktop Sidebar */}
          <motion.aside
            initial={{ x: -20, opacity: 0 }}
            animate={{ x: 0, opacity: 1 }}
            transition={{ duration: 0.3 }}
            className="hidden lg:flex w-60 min-h-[calc(100vh-64px)] bg-[#111] border-r border-[#2a2a2a] flex-col sticky top-16"
          >
            <SidebarContent />
          </motion.aside>

          {/* Mobile Sidebar Overlay */}
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

          {/* Main Content */}
          <main className="flex-1 p-4 lg:p-8">
            <div className="max-w-4xl mx-auto">
              {/* Mobile Header with Menu Toggle */}
              <div className="lg:hidden flex items-center gap-4 mb-6">
                <button
                  onClick={() => setIsMobileSidebarOpen(true)}
                  className="p-2 rounded-lg bg-[#111] border border-[#2a2a2a] text-gray-400 hover:text-white transition-colors"
                >
                  <Menu className="w-5 h-5" />
                </button>
                <div className="flex-1">
                  <h1 className="text-xl font-bold text-white">
                    {activeSection === "account" ? "My Account" : "My Communities"}
                  </h1>
                </div>
              </div>

              <AnimatePresence mode="wait">
                {activeSection === "account" ? (
                  <motion.div
                    key="account"
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, y: -10 }}
                    transition={{ duration: 0.2 }}
                  >
                    {/* Header - Desktop only */}
                    <h1 className="hidden lg:block text-2xl font-bold text-white mb-6">My Account</h1>

                    {/* Profile Card Container */}
                    <div className="bg-[#111] rounded-lg border border-[#2a2a2a] overflow-hidden mb-6">
                      {/* Profile Banner */}
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

                      {/* Profile Info */}
                      <div className="px-4 lg:px-6 pb-6">
                        <div className="flex flex-col sm:flex-row sm:items-end sm:justify-between gap-4 -mt-10 lg:-mt-12">
                          <div className="flex items-end gap-4">
                            {/* Avatar */}
                            <div className="w-20 h-20 lg:w-24 lg:h-24 rounded-full bg-gradient-to-br from-[#FFC400] to-[#FF8C00] flex items-center justify-center text-2xl lg:text-3xl font-bold text-black border-4 border-[#111] shadow-xl flex-shrink-0">
                              {getInitials(user.fullName)}
                            </div>
                            <div className="pb-2 pt-12 lg:pt-14">
                              <h2 className="text-lg lg:text-xl font-bold text-white flex items-center gap-2 flex-wrap">
                                <span className="break-words">{user.fullName}</span>
                                <span className="text-gray-500">•••</span>
                              </h2>
                              <div className="flex items-center gap-2 mt-1">
                                <div className="w-3 h-3 rounded-full bg-green-500 flex-shrink-0"></div>
                                <span className="text-sm text-gray-400">Online</span>
                              </div>
                            </div>
                          </div>
                          <Button
                            variant="outline"
                            size="sm"
                            className="border-[#FFC400] text-[#FFC400] hover:bg-[#FFC400]/10 rounded-lg w-full sm:w-auto"
                          >
                            Edit User Profile
                          </Button>
                        </div>
                      </div>
                    </div>

                    {/* Account Details Container */}
                    <div className="bg-[#111] rounded-lg border border-[#2a2a2a] overflow-hidden">
                      <div className="p-4 lg:p-6 space-y-1">
                        {/* Display Name */}
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
                            className="bg-[#2a2a2a] text-white hover:bg-[#3a3a3a] rounded-lg flex-shrink-0"
                          >
                            Edit
                          </Button>
                        </div>

                        {/* Email */}
                        <div className="flex items-center justify-between py-4 border-b border-[#2a2a2a]">
                          <div className="flex-1 min-w-0 mr-4">
                            <p className="text-xs font-semibold text-gray-400 uppercase tracking-wider mb-1">
                              Email
                            </p>
                            <p className="text-white font-medium truncate">
                              {isEmailRevealed ? (
                                <>
                                  {user.email}{" "}
                                  <button 
                                    onClick={() => setIsEmailRevealed(false)}
                                    className="text-[#FFC400] text-sm hover:underline"
                                  >
                                    Hide
                                  </button>
                                </>
                              ) : (
                                <>
                                  {maskEmail(user.email)}{" "}
                                  <button 
                                    onClick={() => setIsEmailRevealed(true)}
                                    className="text-[#FFC400] text-sm hover:underline"
                                  >
                                    Reveal
                                  </button>
                                </>
                              )}
                            </p>
                          </div>
                          <Button
                            variant="secondary"
                            size="sm"
                            className="bg-[#2a2a2a] text-white hover:bg-[#3a3a3a] rounded-lg flex-shrink-0"
                          >
                            Edit
                          </Button>
                        </div>

                        {/* Member Since */}
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

                    {/* Stats Container */}
                    <div className="grid grid-cols-2 gap-4 mt-6">
                      <div className="bg-[#111] rounded-lg border border-[#2a2a2a] p-4 lg:p-5">
                        <div className="flex items-center gap-3 lg:gap-4">
                          <div className="w-10 h-10 lg:w-12 lg:h-12 rounded-xl bg-[#FFC400]/20 flex items-center justify-center">
                            <Hexagon className="w-5 h-5 lg:w-6 lg:h-6 text-[#FFC400]" />
                          </div>
                          <div>
                            <p className="text-gray-400 text-xs lg:text-sm">Communities Listed</p>
                            <p className="text-xl lg:text-2xl font-bold text-white">{approvedCount}</p>
                          </div>
                        </div>
                      </div>
                      <div className="bg-[#111] rounded-lg border border-[#2a2a2a] p-4 lg:p-5">
                        <div className="flex items-center gap-3 lg:gap-4">
                          <div className="w-10 h-10 lg:w-12 lg:h-12 rounded-xl bg-[#6B5CE7]/20 flex items-center justify-center">
                            <Clock className="w-5 h-5 lg:w-6 lg:h-6 text-[#6B5CE7]" />
                          </div>
                          <div>
                            <p className="text-gray-400 text-xs lg:text-sm">Pending Approvals</p>
                            <p className="text-xl lg:text-2xl font-bold text-white">{pendingCount}</p>
                          </div>
                        </div>
                      </div>
                    </div>
                  </motion.div>
                ) : (
                  <motion.div
                    key="communities"
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, y: -10 }}
                    transition={{ duration: 0.2 }}
                  >
                    {/* Header */}
                    <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 mb-6">
                      <h1 className="hidden lg:block text-2xl font-bold text-white">My Communities</h1>
                      <Button
                        onClick={handleListCommunity}
                        className="bg-[#FFC400] hover:bg-[#FFD700] text-black rounded-lg w-full sm:w-auto"
                      >
                        <Plus className="w-4 h-4 mr-2" />
                        List New Community
                      </Button>
                    </div>

                    {/* Communities Container */}
                    <div className="bg-[#111] rounded-lg border border-[#2a2a2a] overflow-hidden">
                      {submissionsLoading ? (
                        <div className="flex items-center justify-center py-16">
                          <div className="animate-spin rounded-full h-8 w-8 border-t-2 border-b-2 border-[#FFC400]"></div>
                        </div>
                      ) : !submissionsData || submissionsData.length === 0 ? (
                        <div className="text-center py-16 px-4">
                          <div className="w-16 h-16 rounded-full bg-[#2a2a2a] flex items-center justify-center mx-auto mb-4">
                            <FileText className="w-8 h-8 text-gray-500" />
                          </div>
                          <p className="text-gray-400 font-medium">No communities yet</p>
                          <p className="text-gray-500 text-sm mt-1">List your first community to see it here</p>
                          <Button
                            onClick={handleListCommunity}
                            className="mt-4 bg-[#FFC400] hover:bg-[#FFD700] text-black rounded-lg"
                          >
                            <Plus className="w-4 h-4 mr-2" />
                            List a Community
                          </Button>
                        </div>
                      ) : (
                        <div className="divide-y divide-[#2a2a2a]">
                          {submissionsData.map((submission, index) => (
                            <motion.div
                              key={submission.id}
                              initial={{ opacity: 0 }}
                              animate={{ opacity: 1 }}
                              transition={{ delay: index * 0.05 }}
                              onClick={() => setSelectedSubmission(submission)}
                              className="p-4 hover:bg-[#1a1a1a] cursor-pointer transition-colors group"
                            >
                              <div className="flex items-center gap-3 lg:gap-4">
                                {/* Community Icon */}
                                <div className={`w-10 h-10 lg:w-12 lg:h-12 rounded-xl flex items-center justify-center overflow-hidden flex-shrink-0 ${
                                  submission.platform === "WhatsApp" ? "bg-green-500/20" :
                                  submission.platform === "Telegram" ? "bg-blue-500/20" :
                                  submission.platform === "Discord" ? "bg-indigo-500/20" :
                                  "bg-pink-500/20"
                                }`}>
                                  {submission.imageUrl ? (
                                    <img 
                                      src={submission.imageUrl} 
                                      alt={submission.name}
                                      className="w-full h-full object-cover"
                                    />
                                  ) : (
                                    <MessageSquare className={`w-5 h-5 lg:w-6 lg:h-6 ${getPlatformColor(submission.platform)}`} />
                                  )}
                                </div>

                                {/* Community Info */}
                                <div className="flex-1 min-w-0">
                                  <div className="flex items-center gap-2">
                                    <h3 className="font-semibold text-white truncate">{submission.name}</h3>
                                    <span className={`text-xs font-medium hidden sm:inline ${getPlatformColor(submission.platform)}`}>
                                      {submission.platform}
                                    </span>
                                  </div>
                                  <p className="text-sm text-gray-500 truncate">{submission.category}</p>
                                </div>

                                {/* Status */}
                                <div className="flex items-center gap-2 lg:gap-3 flex-shrink-0">
                                  {getStatusBadge(submission.status)}
                                  <ChevronRight className="w-5 h-5 text-gray-500 group-hover:text-white transition-colors hidden sm:block" />
                                </div>
                              </div>

                              {/* Rejection Reason */}
                              {submission.status === "rejected" && submission.rejectionReason && (
                                <div className="mt-3 ml-13 lg:ml-16 p-3 bg-red-500/10 border border-red-500/20 rounded-lg">
                                  <p className="text-sm text-red-400">
                                    <span className="font-medium">Rejection reason:</span> {submission.rejectionReason}
                                  </p>
                                </div>
                              )}
                            </motion.div>
                          ))}
                        </div>
                      )}
                    </div>

                    {/* Summary Stats */}
                    {totalSubmissions > 0 && (
                      <div className="grid grid-cols-3 gap-3 lg:gap-4 mt-6">
                        <div className="bg-[#111] rounded-lg border border-[#2a2a2a] p-3 lg:p-4 text-center">
                          <p className="text-xl lg:text-2xl font-bold text-white">{totalSubmissions}</p>
                          <p className="text-xs lg:text-sm text-gray-400">Total</p>
                        </div>
                        <div className="bg-[#111] rounded-lg border border-green-500/20 p-3 lg:p-4 text-center">
                          <p className="text-xl lg:text-2xl font-bold text-green-400">{approvedCount}</p>
                          <p className="text-xs lg:text-sm text-gray-400">Approved</p>
                        </div>
                        <div className="bg-[#111] rounded-lg border border-yellow-500/20 p-3 lg:p-4 text-center">
                          <p className="text-xl lg:text-2xl font-bold text-yellow-400">{pendingCount}</p>
                          <p className="text-xs lg:text-sm text-gray-400">Pending</p>
                        </div>
                      </div>
                    )}
                  </motion.div>
                )}
              </AnimatePresence>
            </div>
          </main>
        </div>

        {/* Submission Detail Modal */}
        <Dialog open={!!selectedSubmission} onOpenChange={() => setSelectedSubmission(null)}>
          <DialogContent className="bg-[#1a1a1a] border-[#333] rounded-3xl max-w-lg p-0 overflow-hidden max-h-[90vh] overflow-y-auto">
            {selectedSubmission && (
              <>
                <div className={`p-6 ${
                  selectedSubmission.status === "rejected"
                    ? "bg-gradient-to-r from-red-500/20 to-red-900/10"
                    : selectedSubmission.status === "approved"
                    ? "bg-gradient-to-r from-green-500/20 to-green-900/10"
                    : "bg-gradient-to-r from-yellow-500/20 to-yellow-900/10"
                }`}>
                  <div className="flex items-start gap-4">
                    <div className={`w-14 h-14 rounded-2xl flex items-center justify-center overflow-hidden flex-shrink-0 ${
                      selectedSubmission.platform === "WhatsApp" ? "bg-green-500/30" :
                      selectedSubmission.platform === "Telegram" ? "bg-blue-500/30" :
                      selectedSubmission.platform === "Discord" ? "bg-indigo-500/30" :
                      "bg-pink-500/30"
                    }`}>
                      {selectedSubmission.imageUrl ? (
                        <img 
                          src={selectedSubmission.imageUrl} 
                          alt={selectedSubmission.name}
                          className="w-full h-full object-cover"
                        />
                      ) : (
                        <MessageSquare className={`w-7 h-7 ${getPlatformColor(selectedSubmission.platform)}`} />
                      )}
                    </div>
                    <div className="flex-1 min-w-0">
                      <DialogHeader>
                        <DialogTitle className="text-xl font-bold text-white text-left truncate">
                          {selectedSubmission.name}
                        </DialogTitle>
                        <DialogDescription className="text-gray-400 text-left">
                          {selectedSubmission.category} • {selectedSubmission.platform}
                        </DialogDescription>
                      </DialogHeader>
                      <div className="mt-2">
                        {getStatusBadge(selectedSubmission.status)}
                      </div>
                    </div>
                  </div>
                </div>

                <div className="p-6 space-y-5">
                  {/* Description */}
                  <div>
                    <h4 className="text-sm font-semibold text-gray-400 uppercase tracking-wider mb-2 flex items-center gap-2">
                      <FileText className="w-4 h-4" />
                      Description
                    </h4>
                    <p className="text-white text-sm leading-relaxed whitespace-pre-wrap">
                      {selectedSubmission.description}
                    </p>
                  </div>

                  {/* Details Grid */}
                  <div className="grid grid-cols-2 gap-4">
                    <div className="p-3 rounded-xl bg-black/30 border border-[#333]">
                      <div className="flex items-center gap-2 text-gray-400 mb-1">
                        <Globe className="w-4 h-4" />
                        <span className="text-xs uppercase tracking-wider">Visibility</span>
                      </div>
                      <p className="text-white font-medium capitalize">{selectedSubmission.visibility}</p>
                    </div>
                    <div className="p-3 rounded-xl bg-black/30 border border-[#333]">
                      <div className="flex items-center gap-2 text-gray-400 mb-1">
                        <Users className="w-4 h-4" />
                        <span className="text-xs uppercase tracking-wider">Members</span>
                      </div>
                      <p className="text-white font-medium">{selectedSubmission.memberCount || "Not specified"}</p>
                    </div>
                  </div>

                  {/* Tags */}
                  {selectedSubmission.tags && selectedSubmission.tags.length > 0 && (
                    <div>
                      <h4 className="text-sm font-semibold text-gray-400 uppercase tracking-wider mb-2 flex items-center gap-2">
                        <Tag className="w-4 h-4" />
                        Tags
                      </h4>
                      <div className="flex flex-wrap gap-2">
                        {selectedSubmission.tags.map((tag, i) => (
                          <span key={i} className="px-3 py-1 bg-[#FFC400]/10 text-[#FFC400] text-xs rounded-full border border-[#FFC400]/20">
                            {tag}
                          </span>
                        ))}
                      </div>
                    </div>
                  )}

                  {/* Invite Link */}
                  <div>
                    <h4 className="text-sm font-semibold text-gray-400 uppercase tracking-wider mb-2 flex items-center gap-2">
                      <Link2 className="w-4 h-4" />
                      Invite Link
                    </h4>
                    <div className="p-3 rounded-xl bg-black/30 border border-[#333] flex items-center gap-2">
                      <p className="text-white text-sm truncate flex-1">{selectedSubmission.inviteLink}</p>
                      <a 
                        href={selectedSubmission.inviteLink} 
                        target="_blank" 
                        rel="noopener noreferrer"
                        className="p-2 hover:bg-[#FFC400]/20 rounded-lg transition-colors flex-shrink-0"
                      >
                        <ExternalLink className="w-4 h-4 text-[#FFC400]" />
                      </a>
                    </div>
                  </div>

                  {/* Rejection Reason */}
                  {selectedSubmission.status === "rejected" && selectedSubmission.rejectionReason && (
                    <div className="p-4 rounded-xl bg-red-500/10 border border-red-500/30">
                      <h4 className="text-sm font-semibold text-red-400 uppercase tracking-wider mb-2 flex items-center gap-2">
                        <XCircle className="w-4 h-4" />
                        Rejection Reason
                      </h4>
                      <p className="text-red-300 text-sm">
                        {selectedSubmission.rejectionReason}
                      </p>
                    </div>
                  )}
                </div>
              </>
            )}
          </DialogContent>
        </Dialog>
      </div>
    </Layout>
  );
}
