import { useEffect, useState } from "react";
import { useLocation } from "wouter";
import { motion, AnimatePresence } from "framer-motion";
import { User, Mail, Calendar, Users, Plus, LogOut, Settings, ChevronRight, Hexagon, Clock, CheckCircle, XCircle, FileText, ExternalLink, Tag, Eye, Globe, Link2, MessageSquare } from "lucide-react";
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

export default function Dashboard() {
  const [, setLocation] = useLocation();
  const { user, logout, isLoading } = useAuth();
  const [selectedSubmission, setSelectedSubmission] = useState<Submission | null>(null);

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

  const getInitials = (name: string) => {
    return name
      .split(" ")
      .map((n) => n[0])
      .join("")
      .toUpperCase()
      .slice(0, 2);
  };

  return (
    <Layout hideFooter>
      <div className="min-h-screen bg-gradient-to-b from-[#FFB700] to-[#FF8C00]">
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
                    <p className="text-2xl font-bold text-white">{approvedCount}</p>
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

            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.8, duration: 0.4 }}
              className="bg-gradient-to-br from-[#1a1a1a] to-[#0d0d0d] rounded-2xl border border-[#333] p-6 mt-8"
            >
              <h2 className="text-xl font-bold text-white mb-6 flex items-center gap-2">
                <FileText className="w-5 h-5 text-[#FFC400]" />
                My Approvals
              </h2>
              
              {submissionsLoading ? (
                <div className="flex items-center justify-center py-8">
                  <div className="animate-spin rounded-full h-8 w-8 border-t-2 border-b-2 border-[#FFC400]"></div>
                </div>
              ) : !submissionsData || submissionsData.length === 0 ? (
                <div className="text-center py-8">
                  <div className="w-16 h-16 rounded-full bg-[#333] flex items-center justify-center mx-auto mb-4">
                    <FileText className="w-8 h-8 text-gray-500" />
                  </div>
                  <p className="text-gray-400">No submissions yet</p>
                  <p className="text-gray-500 text-sm mt-1">List a community to see its approval status here</p>
                </div>
              ) : (
                <div className="grid gap-4 md:grid-cols-2">
                  {submissionsData.map((submission, index) => (
                    <motion.div
                      key={submission.id}
                      initial={{ opacity: 0, y: 10 }}
                      animate={{ opacity: 1, y: 0 }}
                      transition={{ delay: index * 0.1, duration: 0.3 }}
                      onClick={() => setSelectedSubmission(submission)}
                      className={`p-5 rounded-2xl border cursor-pointer transition-all duration-300 hover:scale-[1.02] hover:shadow-xl group ${
                        submission.status === "rejected"
                          ? "bg-gradient-to-br from-red-500/10 to-red-900/5 border-red-500/30 hover:border-red-400/50"
                          : submission.status === "approved"
                          ? "bg-gradient-to-br from-green-500/10 to-green-900/5 border-green-500/30 hover:border-green-400/50"
                          : "bg-gradient-to-br from-yellow-500/10 to-yellow-900/5 border-yellow-500/30 hover:border-yellow-400/50"
                      }`}
                    >
                      <div className="flex items-start justify-between gap-3">
                        <div className="flex-1 min-w-0">
                          <div className="flex items-center gap-2 mb-2">
                            <div className={`w-10 h-10 rounded-xl flex items-center justify-center overflow-hidden ${
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
                                <MessageSquare className={`w-5 h-5 ${getPlatformColor(submission.platform)}`} />
                              )}
                            </div>
                            <div className="flex-1 min-w-0">
                              <h3 className="font-bold text-white truncate">{submission.name}</h3>
                              <p className="text-xs text-gray-500">{submission.category}</p>
                            </div>
                          </div>
                          
                          <div className="flex items-center gap-2 mt-3">
                            {getStatusBadge(submission.status)}
                            <span className={`text-xs font-medium ${getPlatformColor(submission.platform)}`}>
                              {submission.platform}
                            </span>
                          </div>

                          {submission.status === "rejected" && submission.rejectionReason && (
                            <div className="mt-3 p-2 bg-red-500/10 border border-red-500/20 rounded-lg">
                              <p className="text-xs text-red-400 line-clamp-2">
                                {submission.rejectionReason}
                              </p>
                            </div>
                          )}
                        </div>
                        <ChevronRight className="w-5 h-5 text-gray-500 group-hover:text-white transition-colors flex-shrink-0" />
                      </div>
                    </motion.div>
                  ))}
                </div>
              )}
            </motion.div>

            {/* Submission Detail Modal */}
            <Dialog open={!!selectedSubmission} onOpenChange={() => setSelectedSubmission(null)}>
              <DialogContent className="bg-[#1a1a1a] border-[#333] rounded-3xl max-w-lg p-0 overflow-hidden">
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
                        <div className={`w-14 h-14 rounded-2xl flex items-center justify-center overflow-hidden ${
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
                        <div className="flex-1">
                          <DialogHeader>
                            <DialogTitle className="text-xl font-bold text-white text-left">
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
                            className="p-2 hover:bg-[#FFC400]/20 rounded-lg transition-colors"
                          >
                            <ExternalLink className="w-4 h-4 text-[#FFC400]" />
                          </a>
                        </div>
                      </div>

                      {/* Status Info */}
                      {selectedSubmission.status === "rejected" && selectedSubmission.rejectionReason && (
                        <div className="p-4 rounded-xl bg-red-500/10 border border-red-500/30">
                          <h4 className="text-sm font-semibold text-red-400 uppercase tracking-wider mb-2 flex items-center gap-2">
                            <XCircle className="w-4 h-4" />
                            Rejection Reason
                          </h4>
                          <p className="text-red-300 text-sm">{selectedSubmission.rejectionReason}</p>
                        </div>
                      )}

                      {selectedSubmission.status === "approved" && (
                        <div className="p-4 rounded-xl bg-green-500/10 border border-green-500/30">
                          <h4 className="text-sm font-semibold text-green-400 uppercase tracking-wider mb-2 flex items-center gap-2">
                            <CheckCircle className="w-4 h-4" />
                            Approved
                          </h4>
                          <p className="text-green-300 text-sm">Your community is now live and visible to all users!</p>
                        </div>
                      )}

                      {selectedSubmission.status === "pending" && (
                        <div className="p-4 rounded-xl bg-yellow-500/10 border border-yellow-500/30">
                          <h4 className="text-sm font-semibold text-yellow-400 uppercase tracking-wider mb-2 flex items-center gap-2">
                            <Clock className="w-4 h-4" />
                            Pending Review
                          </h4>
                          <p className="text-yellow-300 text-sm">Your submission is being reviewed. You'll be notified once it's approved.</p>
                        </div>
                      )}
                    </div>
                  </>
                )}
              </DialogContent>
            </Dialog>
          </motion.div>
        </div>
      </div>
    </Layout>
  );
}
