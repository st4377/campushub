import { useEffect, useState } from "react";
import { useLocation } from "wouter";
import { motion } from "framer-motion";
import { Clock, CheckCircle, XCircle, FileText, ExternalLink, Tag, Globe, Users, Link2, MessageSquare, ArrowLeft, ChevronRight } from "lucide-react";
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

export default function SubmissionStatus() {
  const [, setLocation] = useLocation();
  const { user, isLoading } = useAuth();
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
      toast.error("Please log in to view your submissions");
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

  const formatDate = (dateString?: string) => {
    if (!dateString) return "Recently";
    return new Date(dateString).toLocaleDateString("en-US", {
      month: "short",
      day: "numeric",
      year: "numeric"
    });
  };

  const pendingSubmissions = submissionsData?.filter(s => s.status === "pending") || [];
  const approvedSubmissions = submissionsData?.filter(s => s.status === "approved") || [];
  const rejectedSubmissions = submissionsData?.filter(s => s.status === "rejected") || [];

  return (
    <Layout hideFooter>
      <div className="min-h-[calc(100vh-64px)] bg-[#1a1a1a]">
        <div className="max-w-4xl mx-auto p-4 lg:p-8">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.3 }}
          >
            <div className="flex items-center gap-4 mb-6">
              <Button
                variant="ghost"
                size="sm"
                onClick={() => setLocation("/dashboard")}
                className="text-gray-400 hover:text-white"
              >
                <ArrowLeft className="w-4 h-4 mr-2" />
                Back to Dashboard
              </Button>
            </div>

            <div className="flex items-center justify-between mb-8">
              <div>
                <h1 className="text-2xl lg:text-3xl font-bold text-white">Submission Status</h1>
                <p className="text-gray-400 mt-1">Track the approval status of all your community submissions</p>
              </div>
              <Button
                onClick={() => setLocation("/list-community")}
                className="bg-[#FFC400] hover:bg-[#FFD700] text-black rounded-lg hidden sm:flex"
              >
                Submit New Community
              </Button>
            </div>

            <div className="grid grid-cols-3 gap-4 mb-8">
              <div className="bg-[#111] rounded-lg border border-yellow-500/20 p-4 text-center">
                <p className="text-2xl lg:text-3xl font-bold text-yellow-400">{pendingSubmissions.length}</p>
                <p className="text-sm text-gray-400">Pending</p>
              </div>
              <div className="bg-[#111] rounded-lg border border-green-500/20 p-4 text-center">
                <p className="text-2xl lg:text-3xl font-bold text-green-400">{approvedSubmissions.length}</p>
                <p className="text-sm text-gray-400">Approved</p>
              </div>
              <div className="bg-[#111] rounded-lg border border-red-500/20 p-4 text-center">
                <p className="text-2xl lg:text-3xl font-bold text-red-400">{rejectedSubmissions.length}</p>
                <p className="text-sm text-gray-400">Rejected</p>
              </div>
            </div>

            {submissionsLoading ? (
              <div className="flex items-center justify-center py-16">
                <div className="animate-spin rounded-full h-8 w-8 border-t-2 border-b-2 border-[#FFC400]"></div>
              </div>
            ) : !submissionsData || submissionsData.length === 0 ? (
              <div className="bg-[#111] rounded-lg border border-[#2a2a2a] p-12 text-center">
                <div className="w-20 h-20 rounded-full bg-[#2a2a2a] flex items-center justify-center mx-auto mb-4">
                  <FileText className="w-10 h-10 text-gray-500" />
                </div>
                <h3 className="text-lg font-semibold text-white mb-2">No Submissions Yet</h3>
                <p className="text-gray-400 mb-6">You haven't submitted any communities for approval</p>
                <Button
                  onClick={() => setLocation("/list-community")}
                  className="bg-[#FFC400] hover:bg-[#FFD700] text-black rounded-lg"
                >
                  Submit Your First Community
                </Button>
              </div>
            ) : (
              <div className="space-y-6">
                {pendingSubmissions.length > 0 && (
                  <div>
                    <h2 className="text-lg font-bold text-white mb-4 flex items-center gap-2">
                      <Clock className="w-5 h-5 text-yellow-400" />
                      Pending Review ({pendingSubmissions.length})
                    </h2>
                    <div className="bg-[#111] rounded-lg border border-[#2a2a2a] overflow-hidden">
                      <div className="divide-y divide-[#2a2a2a]">
                        {pendingSubmissions.map((submission, index) => (
                          <motion.div
                            key={submission.id}
                            initial={{ opacity: 0 }}
                            animate={{ opacity: 1 }}
                            transition={{ delay: index * 0.05 }}
                            onClick={() => setSelectedSubmission(submission)}
                            className="p-4 hover:bg-[#1a1a1a] cursor-pointer transition-colors group"
                          >
                            <div className="flex items-center gap-4">
                              <div className={`w-12 h-12 rounded-xl flex items-center justify-center overflow-hidden flex-shrink-0 ${
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
                                  <MessageSquare className={`w-6 h-6 ${getPlatformColor(submission.platform)}`} />
                                )}
                              </div>
                              <div className="flex-1 min-w-0">
                                <div className="flex items-center gap-2">
                                  <h3 className="font-semibold text-white truncate">{submission.name}</h3>
                                  <span className={`text-xs font-medium ${getPlatformColor(submission.platform)}`}>
                                    {submission.platform}
                                  </span>
                                </div>
                                <p className="text-sm text-gray-500">{submission.category}</p>
                              </div>
                              <div className="flex items-center gap-3 flex-shrink-0">
                                {getStatusBadge(submission.status)}
                                <ChevronRight className="w-5 h-5 text-gray-500 group-hover:text-white transition-colors" />
                              </div>
                            </div>
                          </motion.div>
                        ))}
                      </div>
                    </div>
                  </div>
                )}

                {approvedSubmissions.length > 0 && (
                  <div>
                    <h2 className="text-lg font-bold text-white mb-4 flex items-center gap-2">
                      <CheckCircle className="w-5 h-5 text-green-400" />
                      Approved ({approvedSubmissions.length})
                    </h2>
                    <div className="bg-[#111] rounded-lg border border-[#2a2a2a] overflow-hidden">
                      <div className="divide-y divide-[#2a2a2a]">
                        {approvedSubmissions.map((submission, index) => (
                          <motion.div
                            key={submission.id}
                            initial={{ opacity: 0 }}
                            animate={{ opacity: 1 }}
                            transition={{ delay: index * 0.05 }}
                            onClick={() => setSelectedSubmission(submission)}
                            className="p-4 hover:bg-[#1a1a1a] cursor-pointer transition-colors group"
                          >
                            <div className="flex items-center gap-4">
                              <div className={`w-12 h-12 rounded-xl flex items-center justify-center overflow-hidden flex-shrink-0 ${
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
                                  <MessageSquare className={`w-6 h-6 ${getPlatformColor(submission.platform)}`} />
                                )}
                              </div>
                              <div className="flex-1 min-w-0">
                                <div className="flex items-center gap-2">
                                  <h3 className="font-semibold text-white truncate">{submission.name}</h3>
                                  <span className={`text-xs font-medium ${getPlatformColor(submission.platform)}`}>
                                    {submission.platform}
                                  </span>
                                </div>
                                <p className="text-sm text-gray-500">{submission.category}</p>
                              </div>
                              <div className="flex items-center gap-3 flex-shrink-0">
                                {getStatusBadge(submission.status)}
                                <ChevronRight className="w-5 h-5 text-gray-500 group-hover:text-white transition-colors" />
                              </div>
                            </div>
                          </motion.div>
                        ))}
                      </div>
                    </div>
                  </div>
                )}

                {rejectedSubmissions.length > 0 && (
                  <div>
                    <h2 className="text-lg font-bold text-white mb-4 flex items-center gap-2">
                      <XCircle className="w-5 h-5 text-red-400" />
                      Rejected ({rejectedSubmissions.length})
                    </h2>
                    <div className="bg-[#111] rounded-lg border border-[#2a2a2a] overflow-hidden">
                      <div className="divide-y divide-[#2a2a2a]">
                        {rejectedSubmissions.map((submission, index) => (
                          <motion.div
                            key={submission.id}
                            initial={{ opacity: 0 }}
                            animate={{ opacity: 1 }}
                            transition={{ delay: index * 0.05 }}
                            onClick={() => setSelectedSubmission(submission)}
                            className="p-4 hover:bg-[#1a1a1a] cursor-pointer transition-colors group"
                          >
                            <div className="flex items-center gap-4">
                              <div className={`w-12 h-12 rounded-xl flex items-center justify-center overflow-hidden flex-shrink-0 ${
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
                                  <MessageSquare className={`w-6 h-6 ${getPlatformColor(submission.platform)}`} />
                                )}
                              </div>
                              <div className="flex-1 min-w-0">
                                <div className="flex items-center gap-2">
                                  <h3 className="font-semibold text-white truncate">{submission.name}</h3>
                                  <span className={`text-xs font-medium ${getPlatformColor(submission.platform)}`}>
                                    {submission.platform}
                                  </span>
                                </div>
                                <p className="text-sm text-gray-500">{submission.category}</p>
                              </div>
                              <div className="flex items-center gap-3 flex-shrink-0">
                                {getStatusBadge(submission.status)}
                                <ChevronRight className="w-5 h-5 text-gray-500 group-hover:text-white transition-colors" />
                              </div>
                            </div>
                            {submission.rejectionReason && (
                              <div className="mt-3 ml-16 p-3 bg-red-500/10 border border-red-500/20 rounded-lg">
                                <p className="text-sm text-red-400">
                                  <span className="font-medium">Reason:</span> {submission.rejectionReason}
                                </p>
                              </div>
                            )}
                          </motion.div>
                        ))}
                      </div>
                    </div>
                  </div>
                )}
              </div>
            )}
          </motion.div>
        </div>

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
                  <div className="overflow-hidden">
                    <h4 className="text-sm font-semibold text-gray-400 uppercase tracking-wider mb-2 flex items-center gap-2">
                      <FileText className="w-4 h-4" />
                      Description
                    </h4>
                    <p className="text-white text-sm leading-relaxed whitespace-pre-wrap break-words overflow-wrap-anywhere" style={{ wordBreak: 'break-word', overflowWrap: 'anywhere' }}>
                      {selectedSubmission.description}
                    </p>
                  </div>

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

                  <div className="overflow-hidden">
                    <h4 className="text-sm font-semibold text-gray-400 uppercase tracking-wider mb-2 flex items-center gap-2">
                      <Link2 className="w-4 h-4" />
                      Invite Link
                    </h4>
                    <div className="p-3 rounded-xl bg-black/30 border border-[#333] flex items-center gap-2 min-w-0">
                      <p className="text-white text-sm flex-1 min-w-0 break-all">{selectedSubmission.inviteLink}</p>
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
