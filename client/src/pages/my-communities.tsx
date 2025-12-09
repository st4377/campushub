import { useEffect, useState, useRef } from "react";
import { useLocation } from "wouter";
import { motion } from "framer-motion";
import { Hexagon, Plus, CheckCircle, Trash2, ArrowLeft, Pencil, Upload, X, Image as ImageIcon, MessageSquare } from "lucide-react";
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
  bumpedAt?: string | null;
}


export default function MyCommunities() {
  const [, setLocation] = useLocation();
  const { user, isLoading } = useAuth();
  const queryClient = useQueryClient();
  
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

  const { data: userCommunities, isLoading: communitiesLoading } = useQuery({
    queryKey: ["user-communities", user?.id],
    queryFn: async () => {
      const response = await fetch(`/api/user/communities/${user?.id}`);
      if (!response.ok) throw new Error("Failed to fetch communities");
      const data = await response.json();
      return { 
        active: data.active as UserCommunity[], 
        deleted: data.deleted as UserCommunity[]
      };
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

  useEffect(() => {
    if (!isLoading && !user) {
      toast.error("Please log in to manage your communities");
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

  return (
    <Layout hideFooter>
      <div className="min-h-[calc(100vh-64px)] bg-[#1a1a1a]">
        <div className="max-w-5xl mx-auto p-4 lg:p-8">
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

            <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 mb-8">
              <div>
                <h1 className="text-2xl lg:text-3xl font-bold text-white">My Communities</h1>
                <p className="text-gray-400 mt-1">Manage your approved and active communities</p>
              </div>
              <Button
                onClick={() => setLocation("/list-community")}
                className="bg-[#FFC400] hover:bg-[#FFD700] text-black rounded-lg w-full sm:w-auto"
              >
                <Plus className="w-4 h-4 mr-2" />
                List New Community
              </Button>
            </div>

            <div className="grid grid-cols-2 gap-4 mb-8">
              <div className="bg-[#111] rounded-lg border border-green-500/20 p-4 lg:p-5">
                <div className="flex items-center gap-4">
                  <div className="w-12 h-12 rounded-xl bg-green-500/20 flex items-center justify-center">
                    <CheckCircle className="w-6 h-6 text-green-400" />
                  </div>
                  <div>
                    <p className="text-gray-400 text-sm">Active Communities</p>
                    <p className="text-2xl lg:text-3xl font-bold text-white">{userCommunities?.active?.length || 0}</p>
                  </div>
                </div>
              </div>
              <div className="bg-[#111] rounded-lg border border-gray-500/20 p-4 lg:p-5">
                <div className="flex items-center gap-4">
                  <div className="w-12 h-12 rounded-xl bg-gray-500/20 flex items-center justify-center">
                    <Trash2 className="w-6 h-6 text-gray-400" />
                  </div>
                  <div>
                    <p className="text-gray-400 text-sm">Deleted Communities</p>
                    <p className="text-2xl lg:text-3xl font-bold text-white">{userCommunities?.deleted?.length || 0}</p>
                  </div>
                </div>
              </div>
            </div>

            
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
                <div className="bg-[#111] rounded-lg border border-[#2a2a2a] p-12 text-center">
                  <div className="w-20 h-20 rounded-full bg-[#2a2a2a] flex items-center justify-center mx-auto mb-4">
                    <Hexagon className="w-10 h-10 text-gray-500" />
                  </div>
                  <h3 className="text-lg font-semibold text-white mb-2">No Active Communities</h3>
                  <p className="text-gray-400 mb-6">Your approved communities will appear here for you to manage</p>
                  <Button
                    onClick={() => setLocation("/list-community")}
                    className="bg-[#FFC400] hover:bg-[#FFD700] text-black rounded-lg"
                  >
                    List Your First Community
                  </Button>
                </div>
              ) : (
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  {userCommunities.active.map((community, index) => (
                    <motion.div
                      key={community.id}
                      initial={{ opacity: 0, y: 10 }}
                      animate={{ opacity: 1, y: 0 }}
                      transition={{ delay: index * 0.05 }}
                      className="relative hover:scale-[1.02] transition-transform duration-300"
                      whileHover={{ scale: 1.02 }}
                    >
                      <CommunityCard
                        community={{
                          ...community,
                          imageUrl: community.imageUrl || undefined,
                        } as Community}
                        disableHoverScale
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
                          variant="outline"
                          onClick={(e) => {
                            e.stopPropagation();
                            handleOpenDelete(community);
                          }}
                          className="bg-[#333] hover:bg-red-800 border-[#444] hover:border-red-800 text-white rounded-lg h-8 px-3 transition-colors"
                        >
                          <Trash2 className="w-3.5 h-3.5" />
                        </Button>
                      </div>
                    </motion.div>
                  ))}
                </div>
              )}
            </div>

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
                        <div className="flex items-center gap-4">
                          <div className={`w-12 h-12 rounded-xl flex items-center justify-center overflow-hidden flex-shrink-0 grayscale ${
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
                              <MessageSquare className={`w-6 h-6 ${getPlatformColor(community.platform)}`} />
                            )}
                          </div>
                          <div className="flex-1 min-w-0">
                            <div className="flex items-center gap-2">
                              <h3 className="font-semibold text-gray-400 truncate line-through">{community.name}</h3>
                              <span className="text-xs font-medium text-gray-500">
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
          </motion.div>
        </div>

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
              <div>
                <Label htmlFor="edit-image" className="text-sm font-medium text-gray-400 mb-2 block">
                  Community Logo
                </Label>
                <div className="flex items-center gap-4">
                  {previewImage ? (
                    <div className="relative w-20 h-20 rounded-xl overflow-hidden border-2 border-[#FFC400]/30">
                      <img src={previewImage} alt="Preview" className="w-full h-full object-cover" />
                      <button
                        onClick={handleRemoveImage}
                        className="absolute top-1 right-1 p-1 bg-red-500 rounded-full hover:bg-red-600 transition-colors"
                      >
                        <X className="w-3 h-3 text-white" />
                      </button>
                    </div>
                  ) : (
                    <div className="w-20 h-20 rounded-xl border-2 border-dashed border-[#333] flex items-center justify-center bg-[#111]">
                      <ImageIcon className="w-8 h-8 text-gray-500" />
                    </div>
                  )}
                  <div>
                    <input
                      ref={fileInputRef}
                      type="file"
                      accept="image/jpeg,image/png,image/webp,image/gif"
                      onChange={handleImageUpload}
                      className="hidden"
                      id="edit-image-upload"
                    />
                    <label htmlFor="edit-image-upload">
                      <Button
                        type="button"
                        variant="outline"
                        size="sm"
                        className="border-[#333] text-gray-300 hover:bg-[#2a2a2a] cursor-pointer"
                        disabled={isUploading}
                        asChild
                      >
                        <span>
                          {isUploading ? (
                            <>
                              <div className="animate-spin rounded-full h-4 w-4 border-t-2 border-b-2 border-white mr-2"></div>
                              Uploading...
                            </>
                          ) : (
                            <>
                              <Upload className="w-4 h-4 mr-2" />
                              Upload New
                            </>
                          )}
                        </span>
                      </Button>
                    </label>
                    <p className="text-xs text-gray-500 mt-1">Max 2MB, JPEG/PNG/WebP/GIF</p>
                  </div>
                </div>
              </div>

              <div>
                <Label htmlFor="edit-name" className="text-sm font-medium text-gray-400 mb-2 block">
                  Community Name
                </Label>
                <Input
                  id="edit-name"
                  value={editForm.name}
                  onChange={(e) => setEditForm({ ...editForm, name: e.target.value })}
                  className="bg-[#111] border-[#333] text-white focus:border-[#FFC400]"
                  placeholder="Enter community name"
                />
              </div>

              <div>
                <Label htmlFor="edit-link" className="text-sm font-medium text-gray-400 mb-2 block">
                  Invite Link
                </Label>
                <Input
                  id="edit-link"
                  value={editForm.inviteLink}
                  onChange={(e) => setEditForm({ ...editForm, inviteLink: e.target.value })}
                  className="bg-[#111] border-[#333] text-white focus:border-[#FFC400]"
                  placeholder="https://..."
                />
              </div>

              <div>
                <Label htmlFor="edit-tags" className="text-sm font-medium text-gray-400 mb-2 block">
                  Tags (comma-separated)
                </Label>
                <Input
                  id="edit-tags"
                  value={editForm.tags}
                  onChange={(e) => setEditForm({ ...editForm, tags: e.target.value })}
                  className="bg-[#111] border-[#333] text-white focus:border-[#FFC400]"
                  placeholder="study, learning, coding"
                />
              </div>

              <div className="flex gap-3 pt-2">
                <Button
                  variant="outline"
                  onClick={() => setEditDialogOpen(false)}
                  className="flex-1 border-[#333] text-gray-300 hover:bg-[#2a2a2a]"
                >
                  Cancel
                </Button>
                <Button
                  onClick={handleSaveEdit}
                  disabled={editMutation.isPending}
                  className="flex-1 bg-[#FFC400] hover:bg-[#FFD700] text-black"
                >
                  {editMutation.isPending ? "Saving..." : "Save Changes"}
                </Button>
              </div>
            </div>
          </DialogContent>
        </Dialog>

        <Dialog open={deleteDialogOpen} onOpenChange={setDeleteDialogOpen}>
          <DialogContent className="bg-[#1a1a1a] border-[#333] rounded-3xl max-w-md p-0 overflow-hidden">
            <div className="p-6 bg-gradient-to-r from-red-500/20 to-red-900/10">
              <DialogHeader>
                <DialogTitle className="text-xl font-bold text-white">Delete Community</DialogTitle>
                <DialogDescription className="text-gray-400">
                  This will remove the community from public view
                </DialogDescription>
              </DialogHeader>
            </div>

            <div className="p-6">
              <div className="bg-red-500/10 border border-red-500/30 rounded-xl p-4 mb-6">
                <p className="text-red-300 text-sm">
                  Are you sure you want to delete <span className="font-bold">{deletingCommunity?.name}</span>? 
                  It will be removed from the public directory but kept in your deletion history.
                </p>
              </div>

              <div className="flex gap-3">
                <Button
                  variant="outline"
                  onClick={() => setDeleteDialogOpen(false)}
                  className="flex-1 border-[#333] text-gray-300 hover:bg-[#2a2a2a]"
                >
                  Cancel
                </Button>
                <Button
                  onClick={handleConfirmDelete}
                  disabled={deleteMutation.isPending}
                  className="flex-1 bg-red-600 hover:bg-red-700 text-white"
                >
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
