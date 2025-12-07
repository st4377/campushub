import { Layout } from "@/components/layout";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { CheckCircle, XCircle, Clock, Users, ExternalLink, RefreshCw, Shield, Lock, LogIn } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { useState } from "react";

interface PendingCommunity {
  id: string;
  name: string;
  platform: string;
  memberCount: number;
  description: string;
  tags: string[];
  category: string;
  inviteLink: string;
  visibility: string;
  imageUrl: string | null;
  submittedBy: string | null;
  submittedAt: string;
}

export default function AdminApprovals() {
  const { toast } = useToast();
  const queryClient = useQueryClient();
  const [adminPassword, setAdminPassword] = useState("");
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [passwordInput, setPasswordInput] = useState("");
  const [rejectDialogOpen, setRejectDialogOpen] = useState(false);
  const [rejectingCommunityId, setRejectingCommunityId] = useState<string | null>(null);
  const [rejectionReason, setRejectionReason] = useState("");

  const handleLogin = async () => {
    if (!passwordInput.trim()) {
      toast({
        title: "Error",
        description: "Please enter the admin password",
        variant: "destructive",
      });
      return;
    }
    
    try {
      const response = await fetch("/api/admin/pending", {
        headers: {
          "Authorization": `Bearer ${passwordInput}`,
        },
      });
      
      if (response.ok) {
        setAdminPassword(passwordInput);
        setIsAuthenticated(true);
        toast({
          title: "Success",
          description: "Admin access granted",
        });
      } else {
        toast({
          title: "Access Denied",
          description: "Invalid admin password",
          variant: "destructive",
        });
      }
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to authenticate",
        variant: "destructive",
      });
    }
  };

  const { data, isLoading, error, refetch } = useQuery({
    queryKey: ["pending-communities", adminPassword],
    queryFn: async () => {
      const response = await fetch("/api/admin/pending", {
        headers: {
          "Authorization": `Bearer ${adminPassword}`,
        },
      });
      if (!response.ok) throw new Error("Failed to fetch pending communities");
      const data = await response.json();
      return data.communities as PendingCommunity[];
    },
    enabled: isAuthenticated,
  });

  const approveMutation = useMutation({
    mutationFn: async (id: string) => {
      const response = await fetch(`/api/admin/approve/${id}`, {
        method: "POST",
        headers: {
          "Authorization": `Bearer ${adminPassword}`,
        },
      });
      if (!response.ok) throw new Error("Failed to approve community");
      return response.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["pending-communities"] });
      queryClient.invalidateQueries({ queryKey: ["approved-communities"] });
      toast({
        title: "Approved",
        description: "Community has been approved and is now live.",
      });
    },
    onError: () => {
      toast({
        title: "Error",
        description: "Failed to approve community.",
        variant: "destructive",
      });
    },
  });

  const rejectMutation = useMutation({
    mutationFn: async ({ id, reason }: { id: string; reason: string }) => {
      const response = await fetch(`/api/admin/reject/${id}`, {
        method: "POST",
        headers: {
          "Authorization": `Bearer ${adminPassword}`,
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ reason }),
      });
      if (!response.ok) throw new Error("Failed to reject community");
      return response.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["pending-communities"] });
      setRejectDialogOpen(false);
      setRejectingCommunityId(null);
      setRejectionReason("");
      toast({
        title: "Rejected",
        description: "Community has been rejected.",
      });
    },
    onError: () => {
      toast({
        title: "Error",
        description: "Failed to reject community.",
        variant: "destructive",
      });
    },
  });

  const handleOpenRejectDialog = (id: string) => {
    setRejectingCommunityId(id);
    setRejectionReason("");
    setRejectDialogOpen(true);
  };

  const handleConfirmReject = () => {
    if (rejectingCommunityId) {
      rejectMutation.mutate({ id: rejectingCommunityId, reason: rejectionReason });
    }
  };

  const getVisibilityBadge = (visibility: string) => {
    switch (visibility) {
      case "boys-only":
        return <Badge className="bg-blue-500/20 text-blue-400 border-blue-500/30">Boys Only</Badge>;
      case "girls-only":
        return <Badge className="bg-pink-500/20 text-pink-400 border-pink-500/30">Girls Only</Badge>;
      default:
        return <Badge className="bg-green-500/20 text-green-400 border-green-500/30">Public</Badge>;
    }
  };

  const getPlatformBadge = (platform: string) => {
    const colors: Record<string, string> = {
      WhatsApp: "bg-green-500/20 text-green-400 border-green-500/30",
      Telegram: "bg-blue-400/20 text-blue-400 border-blue-400/30",
      Discord: "bg-indigo-500/20 text-indigo-400 border-indigo-500/30",
      Instagram: "bg-pink-500/20 text-pink-400 border-pink-500/30",
    };
    return <Badge className={colors[platform] || "bg-gray-500/20 text-gray-400 border-gray-500/30"}>{platform}</Badge>;
  };

  if (!isAuthenticated) {
    return (
      <Layout>
        <div className="container px-4 md:px-6 py-16 max-w-md mx-auto">
          <Card className="bg-white border-black/10 rounded-3xl shadow-2xl">
            <CardHeader className="text-center pb-2">
              <div className="w-16 h-16 bg-[#FFC400]/20 rounded-full flex items-center justify-center mx-auto mb-4">
                <Lock className="w-8 h-8 text-[#FFC400]" />
              </div>
              <CardTitle className="text-2xl font-black uppercase tracking-tight text-black">Admin Access</CardTitle>
              <CardDescription className="text-black/60">
                Enter the admin password to access the approval dashboard
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-6 pt-4">
              <div>
                <Input
                  type="password"
                  placeholder="Enter admin password"
                  value={passwordInput}
                  onChange={(e) => setPasswordInput(e.target.value)}
                  onKeyDown={(e) => e.key === "Enter" && handleLogin()}
                  className="bg-gray-50 border-black/20 h-12 text-black placeholder:text-black/40 focus:border-[#FFC400] rounded-2xl"
                />
              </div>
              <Button
                onClick={handleLogin}
                className="w-full bg-black hover:bg-gray-800 text-white font-bold uppercase tracking-wider h-12 rounded-2xl"
              >
                <LogIn className="mr-2 h-5 w-5" />
                Access Dashboard
              </Button>
            </CardContent>
          </Card>
        </div>
      </Layout>
    );
  }

  return (
    <Layout>
      <div className="container px-4 md:px-6 py-16 max-w-6xl mx-auto">
        <div className="mb-12 flex items-center justify-between">
          <div>
            <div className="flex items-center gap-3 mb-4">
              <div className="w-12 h-12 bg-[#FFC400]/20 rounded-full flex items-center justify-center">
                <Shield className="w-6 h-6 text-[#FFC400]" />
              </div>
              <h1 className="text-4xl font-black font-heading uppercase tracking-tight text-black">Admin Dashboard</h1>
            </div>
            <p className="text-lg text-black/70">Review and approve community submissions</p>
          </div>
          <div className="flex gap-3">
            <Button
              variant="outline"
              onClick={() => {
                setIsAuthenticated(false);
                setAdminPassword("");
                setPasswordInput("");
              }}
              className="border-black/20 gap-2"
            >
              <Lock className="h-4 w-4" />
              Logout
            </Button>
            <Button
              variant="outline"
              onClick={() => refetch()}
              className="border-black/20 gap-2"
            >
              <RefreshCw className="h-4 w-4" />
              Refresh
            </Button>
          </div>
        </div>

        {isLoading ? (
          <div className="flex items-center justify-center py-20">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-black"></div>
          </div>
        ) : error ? (
          <Card className="bg-red-50 border-red-200">
            <CardContent className="py-10 text-center">
              <p className="text-red-600">Failed to load pending communities. Please try again.</p>
            </CardContent>
          </Card>
        ) : data && data.length === 0 ? (
          <Card className="bg-white border-black/10 rounded-3xl">
            <CardContent className="py-20 text-center">
              <Clock className="w-16 h-16 text-black/20 mx-auto mb-6" />
              <h3 className="text-2xl font-bold text-black uppercase mb-2">No Pending Submissions</h3>
              <p className="text-black/60">All communities have been reviewed. Check back later!</p>
            </CardContent>
          </Card>
        ) : (
          <div className="space-y-6">
            <div className="flex items-center gap-3 bg-[#FFC400]/10 p-4 rounded-2xl border border-[#FFC400]/30">
              <Clock className="h-5 w-5 text-[#FFC400]" />
              <span className="font-bold text-black">
                {data?.length} pending submission{data?.length !== 1 ? "s" : ""} awaiting review
              </span>
            </div>

            {data?.map((community) => (
              <Card key={community.id} className="bg-white border-black/10 rounded-3xl overflow-hidden shadow-lg">
                <CardHeader className="bg-gradient-to-r from-[#0A0A0A] to-[#1A1A1A] text-white p-6">
                  <div className="flex items-start justify-between">
                    <div className="flex items-start gap-4">
                      {community.imageUrl && (
                        <div className="w-16 h-16 rounded-xl overflow-hidden flex-shrink-0 border-2 border-[#333]">
                          <img 
                            src={community.imageUrl} 
                            alt={community.name}
                            className="w-full h-full object-cover"
                          />
                        </div>
                      )}
                      <div>
                        <CardTitle className="text-2xl font-bold uppercase tracking-wide flex items-center gap-3">
                          {community.name}
                          {getPlatformBadge(community.platform)}
                        </CardTitle>
                        <CardDescription className="text-gray-400 mt-2">
                          Submitted on {new Date(community.submittedAt).toLocaleDateString("en-US", {
                            year: "numeric",
                            month: "long",
                            day: "numeric",
                            hour: "2-digit",
                            minute: "2-digit",
                          })}
                        </CardDescription>
                      </div>
                    </div>
                    {getVisibilityBadge(community.visibility)}
                  </div>
                </CardHeader>
                <CardContent className="p-6 space-y-6">
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <div>
                      <h4 className="text-xs font-bold uppercase tracking-widest text-black/50 mb-2">Category</h4>
                      <p className="text-black font-medium">{community.category}</p>
                    </div>
                    <div>
                      <h4 className="text-xs font-bold uppercase tracking-widest text-black/50 mb-2">Member Count</h4>
                      <p className="text-black font-medium flex items-center gap-2">
                        <Users className="h-4 w-4" />
                        {community.memberCount.toLocaleString()}
                      </p>
                    </div>
                  </div>

                  <div>
                    <h4 className="text-xs font-bold uppercase tracking-widest text-black/50 mb-2">Description</h4>
                    <p className="text-black/80">{community.description}</p>
                  </div>

                  <div>
                    <h4 className="text-xs font-bold uppercase tracking-widest text-black/50 mb-2">Tags</h4>
                    <div className="flex flex-wrap gap-2">
                      {community.tags.map((tag: string) => (
                        <span
                          key={tag}
                          className="px-3 py-1 bg-black/5 text-black/70 text-sm rounded-full border border-black/10"
                        >
                          #{tag}
                        </span>
                      ))}
                    </div>
                  </div>

                  <div>
                    <h4 className="text-xs font-bold uppercase tracking-widest text-black/50 mb-2">Invite Link</h4>
                    <a
                      href={community.inviteLink}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="text-blue-600 hover:text-blue-800 flex items-center gap-2 break-all"
                    >
                      {community.inviteLink}
                      <ExternalLink className="h-4 w-4 flex-shrink-0" />
                    </a>
                  </div>

                  <div className="flex gap-4 pt-4 border-t border-black/10">
                    <Button
                      onClick={() => approveMutation.mutate(community.id)}
                      disabled={approveMutation.isPending || rejectMutation.isPending}
                      className="flex-1 bg-green-600 hover:bg-green-700 text-white font-bold uppercase tracking-wider rounded-xl h-12"
                    >
                      <CheckCircle className="mr-2 h-5 w-5" />
                      Approve
                    </Button>
                    <Button
                      onClick={() => handleOpenRejectDialog(community.id)}
                      disabled={approveMutation.isPending || rejectMutation.isPending}
                      variant="outline"
                      className="flex-1 border-red-300 text-red-600 hover:bg-red-50 font-bold uppercase tracking-wider rounded-xl h-12"
                    >
                      <XCircle className="mr-2 h-5 w-5" />
                      Reject
                    </Button>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        )}

        <Dialog open={rejectDialogOpen} onOpenChange={setRejectDialogOpen}>
          <DialogContent className="bg-white rounded-3xl max-w-md shadow-2xl border-0 p-8">
            <DialogHeader>
              <DialogTitle className="text-2xl font-black uppercase tracking-tight text-black text-center">Reject Community</DialogTitle>
              <DialogDescription className="text-black/70 mt-3 text-center">
                Please provide a reason for rejection. This will be shown to the user.
              </DialogDescription>
            </DialogHeader>
            <div className="mt-6">
              <Textarea
                placeholder="Enter rejection reason (e.g., Invalid invite link, Inappropriate content, Duplicate community...)"
                value={rejectionReason}
                onChange={(e) => setRejectionReason(e.target.value)}
                className="bg-gray-50 border-black/20 min-h-[100px] text-black placeholder:text-black/40 focus:border-red-400 rounded-2xl"
              />
            </div>
            <div className="flex gap-3 justify-center items-center mx-auto w-full mt-6">
              <Button
                type="button"
                variant="outline"
                onClick={() => setRejectDialogOpen(false)}
                disabled={rejectMutation.isPending}
                className="border-black/30 text-black hover:bg-gray-100 font-bold uppercase tracking-wider px-8 rounded-2xl h-12"
              >
                Cancel
              </Button>
              <Button
                type="button"
                onClick={handleConfirmReject}
                disabled={rejectMutation.isPending}
                className="bg-red-600 hover:bg-red-700 text-white font-bold uppercase tracking-wider px-8 rounded-2xl h-12"
              >
                {rejectMutation.isPending ? "Rejecting..." : "Confirm Reject"}
              </Button>
            </div>
          </DialogContent>
        </Dialog>
      </div>
    </Layout>
  );
}
