import { useEffect, useState, useRef } from "react";
import { useLocation } from "wouter";
import { motion, AnimatePresence } from "framer-motion";
import { User, Mail, Calendar, Users, Plus, LogOut, Settings, ChevronRight, Hexagon, Clock, CheckCircle, XCircle, FileText, ExternalLink, Tag, Eye, Globe, Link2, MessageSquare, Shield, Bell, Palette, Home, Menu, Pencil, Trash2, Upload, X, Image as ImageIcon } from "lucide-react";
import { Button } from "@/components/ui/button";
import { toast } from "sonner";
import { Layout } from "@/components/layout";
import { useAuth } from "@/context/auth";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { Badge } from "@/components/ui/badge";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { CommunityCard } from "@/components/community-card";
import { Community } from "@/lib/mock-data";

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
  rating: number;
  reviewCount: number;
  isActive: boolean;
  userId: string | null;
  approvedAt: string;
  deletedAt?: string | null;
}

type ActiveSection = "account" | "communities";

export default function Dashboard() {
  const [, setLocation] = useLocation();
  const { user, logout, isLoading } = useAuth();
  const queryClient = useQueryClient();
  const [selectedSubmission, setSelectedSubmission] = useState<Submission | null>(null);
  const [activeSection, setActiveSection] = useState<ActiveSection>("account");
  const [isMobileSidebarOpen, setIsMobileSidebarOpen] = useState(false);
  const [isEmailRevealed, setIsEmailRevealed] = useState(false);
  
  const [editDialogOpen, setEditDialogOpen] = useState(false);
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
  const [editingCommunity, setEditingCommunity] = useState<UserCommunity | null>(null);
  const [deletingCommunity, setDeletingCommunity] = useState<UserCommunity | null>(null);
  const [editForm, setEditForm] = useState({
    name: "",
    inviteLink: "",
    tags: "",
    imageUrl: null as string | null,
  });
  const [isUploading, setIsUploading] = useState(false);
  const [previewImage, setPreviewImage] = useState<string | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

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

  const { data: userCommunities, isLoading: communitiesLoading } = useQuery({
    queryKey: ["user-communities", user?.id],
    queryFn: async () => {
      const response = await fetch(`/api/user/communities/${user?.id}`);
      if (!response.ok) throw new Error("Failed to fetch communities");
      const data = await response.json();
      return { active: data.active as UserCommunity[], deleted: data.deleted as UserCommunity[] };
    },
    enabled: !!user?.id,
  });

  const editMutation = useMutation({
    mutationFn: async ({ id, updates }: { id: string; updates: { name?: string; inviteLink?: string; tags?: string[]; imageUrl?: string | null } }) => {
      const response = await fetch(`/api/user/communities/${id}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ userId: user?.id, ...updates }),
      });
      if (!response.ok) {
        const error = await response.json();
        throw new Error(error.error || "Failed to update community");
      }
      return response.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["user-communities", user?.id] });
      queryClient.invalidateQueries({ queryKey: ["approved-communities"] });
      toast.success("Community updated successfully");
      setEditDialogOpen(false);
      setEditingCommunity(null);
    },
    onError: (error: Error) => {
      toast.error(error.message);
    },
  });

  const deleteMutation = useMutation({
    mutationFn: async (id: string) => {
      const response = await fetch(`/api/user/communities/${id}`, {
        method: "DELETE",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ userId: user?.id }),
      });
      if (!response.ok) {
        const error = await response.json();
        throw new Error(error.error || "Failed to delete community");
      }
      return response.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["user-communities", user?.id] });
      queryClient.invalidateQueries({ queryKey: ["approved-communities"] });
      toast.success("Community removed from public view");
      setDeleteDialogOpen(false);
      setDeletingCommunity(null);
    },
    onError: (error: Error) => {
      toast.error(error.message);
    },
  });

  const handleOpenEdit = (community: UserCommunity) => {
    setEditingCommunity(community);
    setEditForm({
      name: community.name,
      inviteLink: community.inviteLink,
      tags: community.tags.join(", "),
      imageUrl: community.imageUrl || null,
    });
    setPreviewImage(community.imageUrl || null);
    setEditDialogOpen(true);
  };

  const handleOpenDelete = (community: UserCommunity) => {
    setDeletingCommunity(community);
    setDeleteDialogOpen(true);
  };

  const handleSaveEdit = () => {
    if (!editingCommunity) return;
    
    const tagsArray = editForm.tags
      .split(",")
      .map((tag) => tag.trim())
      .filter((tag) => tag.length > 0);
    
    editMutation.mutate({
      id: editingCommunity.id,
      updates: {
        name: editForm.name,
        inviteLink: editForm.inviteLink,
        tags: tagsArray,
        imageUrl: editForm.imageUrl,
      },
    });
  };

  const handleConfirmDelete = () => {
    if (!deletingCommunity) return;
    deleteMutation.mutate(deletingCommunity.id);
  };

  const handleImageUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    if (file.size > 2 * 1024 * 1024) {
      toast.error("File too large. Maximum size is 2MB.");
      return;
    }

    const allowedTypes = ["image/jpeg", "image/png", "image/webp", "image/gif"];
    if (!allowedTypes.includes(file.type)) {
      toast.error("Invalid file type. Only JPEG, PNG, WebP, and GIF are allowed.");
      return;
    }

    setIsUploading(true);
    const formData = new FormData();
    formData.append("image", file);

    try {
      const response = await fetch("/api/upload/community-image", {
        method: "POST",
        body: formData,
      });

      if (!response.ok) {
        const error = await response.json();
        throw new Error(error.error || "Failed to upload image");
      }

      const data = await response.json();
      setEditForm({ ...editForm, imageUrl: data.imageUrl });
      setPreviewImage(data.imageUrl);
      toast.success("Image uploaded");
    } catch (error) {
      toast.error(error instanceof Error ? error.message : "Failed to upload image");
    } finally {
      setIsUploading(false);
    }
  };

  const handleRemoveImage = () => {
    setEditForm({ ...editForm, imageUrl: null });
    setPreviewImage(null);
    if (fileInputRef.current) {
      fileInputRef.current.value = "";
    }
  };

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
                            <div className="w-20 h-20 lg:w-24 lg:h-24 rounded-full bg-gradient-to-br from-[#FFC400] to-[#FF8C00] flex items-center justify-center text-2xl lg:text-3xl font-bold text-black border-[3px] border-black shadow-xl flex-shrink-0 ring-2 ring-[#111]">
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

                    {/* Active Communities Section */}
                    <div className="mb-8">
                      <h2 className="text-lg font-bold text-white mb-4 flex items-center gap-2">
                        <CheckCircle className="w-5 h-5 text-green-400" />
                        Active Communities
                      </h2>
                      
                      {communitiesLoading ? (
                        <div className="flex items-center justify-center py-16">
                          <div className="animate-spin rounded-full h-8 w-8 border-t-2 border-b-2 border-[#FFC400]"></div>
                        </div>
                      ) : !userCommunities?.active || userCommunities.active.length === 0 ? (
                        <div className="bg-[#111] rounded-lg border border-[#2a2a2a] p-8 text-center">
                          <div className="w-16 h-16 rounded-full bg-[#2a2a2a] flex items-center justify-center mx-auto mb-4">
                            <Hexagon className="w-8 h-8 text-gray-500" />
                          </div>
                          <p className="text-gray-400 font-medium">No active communities</p>
                          <p className="text-gray-500 text-sm mt-1">Your approved communities will appear here</p>
                        </div>
                      ) : (
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                          {userCommunities.active.map((community, index) => (
                            <motion.div
                              key={community.id}
                              initial={{ opacity: 0, y: 10 }}
                              animate={{ opacity: 1, y: 0 }}
                              transition={{ delay: index * 0.05 }}
                              className="relative"
                            >
                              <CommunityCard
                                community={{
                                  ...community,
                                  imageUrl: community.imageUrl || undefined,
                                } as Community}
                              />
                              <div className="absolute top-10 right-4 flex gap-2 z-30">
                                <Button
                                  size="sm"
                                  onClick={(e) => {
                                    e.stopPropagation();
                                    handleOpenEdit(community);
                                  }}
                                  className="bg-[#FFC400] hover:bg-[#FFD700] text-black rounded-lg h-8 px-3"
                                >
                                  <Pencil className="w-3.5 h-3.5 mr-1" />
                                  Edit
                                </Button>
                                <Button
                                  size="sm"
                                  variant="destructive"
                                  onClick={(e) => {
                                    e.stopPropagation();
                                    handleOpenDelete(community);
                                  }}
                                  className="bg-red-600 hover:bg-red-700 text-white rounded-lg h-8 px-3"
                                >
                                  <Trash2 className="w-3.5 h-3.5" />
                                </Button>
                              </div>
                            </motion.div>
                          ))}
                        </div>
                      )}
                    </div>

                    {/* Pending/Rejected Submissions Section */}
                    {submissionsData && submissionsData.filter(s => s.status !== "approved").length > 0 && (
                      <div className="mb-8">
                        <h2 className="text-lg font-bold text-white mb-4 flex items-center gap-2">
                          <Clock className="w-5 h-5 text-yellow-400" />
                          Submission Status
                        </h2>
                        <div className="bg-[#111] rounded-lg border border-[#2a2a2a] overflow-hidden">
                          <div className="divide-y divide-[#2a2a2a]">
                            {submissionsData.filter(s => s.status !== "approved").map((submission, index) => (
                              <motion.div
                                key={submission.id}
                                initial={{ opacity: 0 }}
                                animate={{ opacity: 1 }}
                                transition={{ delay: index * 0.05 }}
                                onClick={() => setSelectedSubmission(submission)}
                                className="p-4 hover:bg-[#1a1a1a] cursor-pointer transition-colors group"
                              >
                                <div className="flex items-center gap-3 lg:gap-4">
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
                                  <div className="flex-1 min-w-0">
                                    <div className="flex items-center gap-2">
                                      <h3 className="font-semibold text-white truncate">{submission.name}</h3>
                                      <span className={`text-xs font-medium hidden sm:inline ${getPlatformColor(submission.platform)}`}>
                                        {submission.platform}
                                      </span>
                                    </div>
                                    <p className="text-sm text-gray-500 truncate">{submission.category}</p>
                                  </div>
                                  <div className="flex items-center gap-2 lg:gap-3 flex-shrink-0">
                                    {getStatusBadge(submission.status)}
                                    <ChevronRight className="w-5 h-5 text-gray-500 group-hover:text-white transition-colors hidden sm:block" />
                                  </div>
                                </div>
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
                        </div>
                      </div>
                    )}

                    {/* Deleted Communities Section */}
                    {userCommunities?.deleted && userCommunities.deleted.length > 0 && (
                      <div className="mb-8">
                        <h2 className="text-lg font-bold text-white mb-4 flex items-center gap-2">
                          <Trash2 className="w-5 h-5 text-gray-400" />
                          Deleted Communities
                          <span className="text-xs font-normal text-gray-500 ml-2">(Read-only history)</span>
                        </h2>
                        <div className="bg-[#111] rounded-lg border border-[#2a2a2a] overflow-hidden">
                          <div className="divide-y divide-[#2a2a2a]">
                            {userCommunities.deleted.map((community, index) => (
                              <motion.div
                                key={community.id}
                                initial={{ opacity: 0 }}
                                animate={{ opacity: 1 }}
                                transition={{ delay: index * 0.05 }}
                                className="p-4 opacity-60"
                              >
                                <div className="flex items-center gap-3 lg:gap-4">
                                  <div className={`w-10 h-10 lg:w-12 lg:h-12 rounded-xl flex items-center justify-center overflow-hidden flex-shrink-0 grayscale ${
                                    community.platform === "WhatsApp" ? "bg-green-500/20" :
                                    community.platform === "Telegram" ? "bg-blue-500/20" :
                                    community.platform === "Discord" ? "bg-indigo-500/20" :
                                    "bg-pink-500/20"
                                  }`}>
                                    {community.imageUrl ? (
                                      <img 
                                        src={community.imageUrl} 
                                        alt={community.name}
                                        className="w-full h-full object-cover"
                                      />
                                    ) : (
                                      <MessageSquare className={`w-5 h-5 lg:w-6 lg:h-6 ${getPlatformColor(community.platform)}`} />
                                    )}
                                  </div>
                                  <div className="flex-1 min-w-0">
                                    <div className="flex items-center gap-2">
                                      <h3 className="font-semibold text-gray-400 truncate line-through">{community.name}</h3>
                                      <span className={`text-xs font-medium hidden sm:inline text-gray-500`}>
                                        {community.platform}
                                      </span>
                                    </div>
                                    <p className="text-sm text-gray-600 truncate">{community.category}</p>
                                  </div>
                                  <div className="flex items-center gap-2 flex-shrink-0">
                                    <Badge className="bg-gray-500/20 text-gray-400 border-gray-500/30">
                                      <Trash2 className="w-3 h-3 mr-1" />
                                      Deleted {community.deletedAt ? formatDate(community.deletedAt) : ""}
                                    </Badge>
                                  </div>
                                </div>
                              </motion.div>
                            ))}
                          </div>
                        </div>
                      </div>
                    )}

                    {/* Summary Stats */}
                    <div className="grid grid-cols-3 gap-3 lg:gap-4">
                      <div className="bg-[#111] rounded-lg border border-green-500/20 p-3 lg:p-4 text-center">
                        <p className="text-xl lg:text-2xl font-bold text-green-400">{userCommunities?.active?.length || 0}</p>
                        <p className="text-xs lg:text-sm text-gray-400">Active</p>
                      </div>
                      <div className="bg-[#111] rounded-lg border border-yellow-500/20 p-3 lg:p-4 text-center">
                        <p className="text-xl lg:text-2xl font-bold text-yellow-400">{pendingCount}</p>
                        <p className="text-xs lg:text-sm text-gray-400">Pending</p>
                      </div>
                      <div className="bg-[#111] rounded-lg border border-gray-500/20 p-3 lg:p-4 text-center">
                        <p className="text-xl lg:text-2xl font-bold text-gray-400">{userCommunities?.deleted?.length || 0}</p>
                        <p className="text-xs lg:text-sm text-gray-400">Deleted</p>
                      </div>
                    </div>
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

        {/* Edit Community Dialog */}
        <Dialog open={editDialogOpen} onOpenChange={setEditDialogOpen}>
          <DialogContent className="bg-[#1a1a1a] border-[#333] rounded-3xl max-w-lg p-0 overflow-hidden">
            <div className="p-6 bg-gradient-to-r from-[#FFC400]/20 to-[#FF8C00]/10">
              <DialogHeader>
                <DialogTitle className="text-xl font-bold text-white">Edit Community</DialogTitle>
                <DialogDescription className="text-gray-400">
                  Update your community details. Only name, invite link, logo, and tags can be edited.
                </DialogDescription>
              </DialogHeader>
            </div>
            
            <div className="p-6 space-y-5">
              <div className="space-y-2">
                <Label htmlFor="edit-name" className="text-sm font-semibold text-gray-400 uppercase tracking-wider">
                  Community Name
                </Label>
                <Input
                  id="edit-name"
                  value={editForm.name}
                  onChange={(e) => setEditForm({ ...editForm, name: e.target.value })}
                  className="bg-black/30 border-[#333] text-white placeholder:text-gray-500 focus:border-[#FFC400] rounded-xl"
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="edit-link" className="text-sm font-semibold text-gray-400 uppercase tracking-wider">
                  Invite/Join Link
                </Label>
                <Input
                  id="edit-link"
                  value={editForm.inviteLink}
                  onChange={(e) => setEditForm({ ...editForm, inviteLink: e.target.value })}
                  className="bg-black/30 border-[#333] text-white placeholder:text-gray-500 focus:border-[#FFC400] rounded-xl"
                />
              </div>

              <div className="space-y-2">
                <Label className="text-sm font-semibold text-gray-400 uppercase tracking-wider">
                  Logo/Icon
                </Label>
                <div className="flex items-center gap-4">
                  {previewImage ? (
                    <div className="relative">
                      <div className="w-16 h-16 rounded-xl overflow-hidden border border-[#333]">
                        <img src={previewImage} alt="Preview" className="w-full h-full object-cover" />
                      </div>
                      <button
                        onClick={handleRemoveImage}
                        className="absolute -top-2 -right-2 w-5 h-5 bg-red-500 rounded-full flex items-center justify-center text-white hover:bg-red-600"
                      >
                        <X className="w-3 h-3" />
                      </button>
                    </div>
                  ) : (
                    <div className="w-16 h-16 rounded-xl border-2 border-dashed border-[#333] flex items-center justify-center">
                      <ImageIcon className="w-6 h-6 text-gray-500" />
                    </div>
                  )}
                  <div>
                    <input
                      ref={fileInputRef}
                      type="file"
                      accept="image/jpeg,image/png,image/webp,image/gif"
                      onChange={handleImageUpload}
                      className="hidden"
                    />
                    <Button
                      type="button"
                      variant="outline"
                      onClick={() => fileInputRef.current?.click()}
                      disabled={isUploading}
                      className="border-[#333] text-gray-300 hover:bg-[#2a2a2a] rounded-lg"
                    >
                      {isUploading ? (
                        <>
                          <div className="animate-spin rounded-full h-4 w-4 border-t-2 border-b-2 border-white mr-2"></div>
                          Uploading...
                        </>
                      ) : (
                        <>
                          <Upload className="w-4 h-4 mr-2" />
                          Upload Image
                        </>
                      )}
                    </Button>
                    <p className="text-xs text-gray-500 mt-1">Max 2MB. JPEG, PNG, WebP, GIF</p>
                  </div>
                </div>
              </div>

              <div className="space-y-2">
                <Label htmlFor="edit-tags" className="text-sm font-semibold text-gray-400 uppercase tracking-wider">
                  Tags (comma-separated)
                </Label>
                <Input
                  id="edit-tags"
                  value={editForm.tags}
                  onChange={(e) => setEditForm({ ...editForm, tags: e.target.value })}
                  placeholder="e.g., study, coding, networking"
                  className="bg-black/30 border-[#333] text-white placeholder:text-gray-500 focus:border-[#FFC400] rounded-xl"
                />
              </div>

              <div className="flex gap-3 pt-4">
                <Button
                  variant="outline"
                  onClick={() => setEditDialogOpen(false)}
                  disabled={editMutation.isPending}
                  className="flex-1 border-[#333] text-gray-300 hover:bg-[#2a2a2a] rounded-xl"
                >
                  Cancel
                </Button>
                <Button
                  onClick={handleSaveEdit}
                  disabled={editMutation.isPending}
                  className="flex-1 bg-[#FFC400] hover:bg-[#FFD700] text-black font-bold rounded-xl"
                >
                  {editMutation.isPending ? "Saving..." : "Save Changes"}
                </Button>
              </div>
            </div>
          </DialogContent>
        </Dialog>

        {/* Delete Community Dialog */}
        <Dialog open={deleteDialogOpen} onOpenChange={setDeleteDialogOpen}>
          <DialogContent className="bg-[#1a1a1a] border-[#333] rounded-3xl max-w-md p-0 overflow-hidden">
            <div className="p-6 bg-gradient-to-r from-red-500/20 to-red-900/10">
              <DialogHeader>
                <DialogTitle className="text-xl font-bold text-white">Delete Community</DialogTitle>
                <DialogDescription className="text-gray-400">
                  This will remove your community from the public homepage and browse pages. The community will be moved to your deleted history.
                </DialogDescription>
              </DialogHeader>
            </div>
            
            <div className="p-6">
              {deletingCommunity && (
                <div className="p-4 rounded-xl bg-red-500/10 border border-red-500/30 mb-6">
                  <p className="text-white font-medium">{deletingCommunity.name}</p>
                  <p className="text-gray-400 text-sm">{deletingCommunity.platform} • {deletingCommunity.category}</p>
                </div>
              )}
              
              <div className="flex gap-3">
                <Button
                  variant="outline"
                  onClick={() => setDeleteDialogOpen(false)}
                  disabled={deleteMutation.isPending}
                  className="flex-1 border-[#333] text-gray-300 hover:bg-[#2a2a2a] rounded-xl"
                >
                  Cancel
                </Button>
                <Button
                  onClick={handleConfirmDelete}
                  disabled={deleteMutation.isPending}
                  className="flex-1 bg-red-600 hover:bg-red-700 text-white font-bold rounded-xl"
                >
                  <Trash2 className="w-4 h-4 mr-2" />
                  {deleteMutation.isPending ? "Deleting..." : "Delete Community"}
                </Button>
              </div>
            </div>
          </DialogContent>
        </Dialog>
      </div>
    </Layout>
  );
}
