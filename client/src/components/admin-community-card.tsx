import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardFooter, CardHeader } from "@/components/ui/card";
import { CheckCircle, XCircle, Users, ExternalLink, Pencil, Pin, PinOff, Trash2, Globe, User, MessageCircle, Hash } from "lucide-react";
import { cn } from "@/lib/utils";

type CommunityVisibility = "public" | "boys-only" | "girls-only";

const getVisibilityInfo = (visibility: string) => {
  switch (visibility) {
    case "public":
      return { label: "Public", icon: Globe, className: "bg-green-500/20 text-green-400 border-green-500/30" };
    case "boys-only":
      return { label: "Boys Only", icon: User, className: "bg-blue-500/20 text-blue-400 border-blue-500/30" };
    case "girls-only":
      return { label: "Girls Only", icon: User, className: "bg-pink-500/20 text-pink-400 border-pink-500/30" };
    default:
      return { label: "Public", icon: Globe, className: "bg-green-500/20 text-green-400 border-green-500/30" };
  }
};

const getPlatformColor = (platform: string) => {
  switch (platform) {
    case "WhatsApp":
      return "text-green-500 bg-green-500/10 border-green-500/30";
    case "Discord":
      return "text-indigo-400 bg-indigo-500/10 border-indigo-500/30";
    case "Telegram":
      return "text-blue-400 bg-blue-500/10 border-blue-500/30";
    case "Instagram":
      return "text-pink-500 bg-pink-500/10 border-pink-500/30";
    default:
      return "text-gray-400 bg-gray-500/10 border-gray-500/30";
  }
};

interface PendingCommunity {
  id: string;
  adminTagId: string | null;
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

interface ApprovedCommunity {
  id: string;
  adminTagId: string | null;
  name: string;
  platform: string;
  memberCount: number;
  description: string;
  tags: string[];
  category: string;
  inviteLink: string;
  visibility: string;
  imageUrl: string | null;
  userId: string | null;
  isPinned: boolean;
  approvedAt: string;
}

interface AdminCommunityCardProps {
  community: PendingCommunity | ApprovedCommunity;
  variant: "pending" | "approved";
  onApprove?: () => void;
  onReject?: () => void;
  onEdit?: () => void;
  onPin?: () => void;
  onDelete?: () => void;
  isLoading?: boolean;
}

export function AdminCommunityCard({
  community,
  variant,
  onApprove,
  onReject,
  onEdit,
  onPin,
  onDelete,
  isLoading = false,
}: AdminCommunityCardProps) {
  const visibilityInfo = getVisibilityInfo(community.visibility);
  const VisibilityIcon = visibilityInfo.icon;
  const isPinned = variant === "approved" && (community as ApprovedCommunity).isPinned;

  return (
    <Card className="h-[340px] bg-[#0A0A0A] overflow-hidden flex flex-col group relative rounded-2xl border border-[#222] shadow-lg hover:border-[#333] transition-colors">
      <div className={cn("absolute top-0 left-0 right-0 flex items-center justify-center gap-1.5 py-1 text-[9px] font-bold uppercase tracking-wider border-b z-20", visibilityInfo.className)}>
        <VisibilityIcon className="h-2.5 w-2.5" />
        {visibilityInfo.label}
      </div>

      {isPinned && (
        <div className="absolute top-5 right-2 z-30">
          <Badge className="bg-[#FFC400] text-black text-[9px] font-bold px-1.5 py-0.5 flex items-center gap-1">
            <Pin className="h-2.5 w-2.5 fill-current" />
            PINNED
          </Badge>
        </div>
      )}

      <CardHeader className="pb-2 pt-8 px-4 flex flex-row items-start gap-3 relative z-10">
        <div className="h-12 w-12 rounded-xl bg-[#151515] border border-[#333] flex items-center justify-center shadow-md overflow-hidden flex-shrink-0">
          {community.imageUrl ? (
            <img 
              src={community.imageUrl} 
              alt={community.name}
              className="w-full h-full object-cover"
            />
          ) : (
            <span className="text-sm font-bold text-white">{community.name.substring(0, 2).toUpperCase()}</span>
          )}
        </div>
        <div className="flex-1 min-w-0">
          <h3 className="font-bold text-sm leading-tight text-white line-clamp-1 uppercase tracking-wide" title={community.name}>
            {community.name}
          </h3>
          <div className="flex items-center gap-1.5 mt-1.5 flex-wrap">
            <Badge className={cn("text-[9px] px-1.5 py-0 h-4 font-bold uppercase tracking-wider border", getPlatformColor(community.platform))}>
              {community.platform}
            </Badge>
            {community.adminTagId && (
              <Badge className="bg-[#FFC400]/20 text-[#FFC400] text-[9px] px-1.5 py-0 h-4 font-mono tracking-wider border border-[#FFC400]/30">
                {community.adminTagId}
              </Badge>
            )}
          </div>
        </div>
      </CardHeader>

      <CardContent className="px-4 py-2 flex-1 flex flex-col relative z-10 min-h-0">
        <div className="flex items-center gap-3 text-[10px] text-gray-500 mb-2">
          <div className="flex items-center gap-1">
            <Users className="h-3 w-3 text-gray-600" />
            <span className="font-mono">{community.memberCount.toLocaleString()}</span>
          </div>
          <span className="text-gray-600">|</span>
          <span className="text-gray-400 truncate">{community.category}</span>
        </div>

        <p className="text-xs text-gray-400 line-clamp-2 leading-relaxed mb-2">
          {community.description}
        </p>

        <div className="flex flex-wrap gap-1 mt-auto">
          {community.tags.slice(0, 2).map((tag) => (
            <span key={tag} className="text-[9px] px-1.5 py-0.5 bg-[#151515] text-gray-500 border border-[#333] uppercase font-medium tracking-wider">
              #{tag}
            </span>
          ))}
          {community.tags.length > 2 && (
            <span className="text-[9px] px-1.5 py-0.5 bg-[#151515] text-gray-600 border border-[#333]">
              +{community.tags.length - 2}
            </span>
          )}
        </div>

        <a
          href={community.inviteLink}
          target="_blank"
          rel="noopener noreferrer"
          className="text-[10px] text-blue-400 hover:text-blue-300 flex items-center gap-1 mt-2 truncate"
          onClick={(e) => e.stopPropagation()}
        >
          <ExternalLink className="h-3 w-3 flex-shrink-0" />
          <span className="truncate">{community.inviteLink}</span>
        </a>
      </CardContent>

      <CardFooter className="px-3 py-3 bg-[#050505] border-t border-[#222] relative z-10">
        {variant === "pending" ? (
          <div className="flex gap-2 w-full">
            <Button
              onClick={(e) => { e.stopPropagation(); onEdit?.(); }}
              disabled={isLoading}
              variant="outline"
              size="sm"
              className="flex-1 border-[#FFC400]/50 text-[#FFC400] hover:bg-[#FFC400]/10 font-bold uppercase tracking-wider text-[10px] h-8 rounded-lg"
            >
              <Pencil className="h-3 w-3 mr-1" />
              Edit
            </Button>
            <Button
              onClick={(e) => { e.stopPropagation(); onApprove?.(); }}
              disabled={isLoading}
              size="sm"
              className="flex-1 bg-green-600 hover:bg-green-700 text-white font-bold uppercase tracking-wider text-[10px] h-8 rounded-lg"
            >
              <CheckCircle className="h-3 w-3 mr-1" />
              OK
            </Button>
            <Button
              onClick={(e) => { e.stopPropagation(); onReject?.(); }}
              disabled={isLoading}
              variant="outline"
              size="sm"
              className="flex-1 border-red-400/50 text-red-400 hover:bg-red-500/10 font-bold uppercase tracking-wider text-[10px] h-8 rounded-lg"
            >
              <XCircle className="h-3 w-3 mr-1" />
              No
            </Button>
          </div>
        ) : (
          <div className="flex gap-2 w-full">
            <Button
              onClick={(e) => { e.stopPropagation(); onPin?.(); }}
              disabled={isLoading}
              variant="outline"
              size="sm"
              className={cn(
                "flex-1 font-bold uppercase tracking-wider text-[10px] h-8 rounded-lg",
                isPinned 
                  ? "border-[#FFC400] text-[#FFC400] bg-[#FFC400]/10 hover:bg-[#FFC400]/20" 
                  : "border-[#333] text-gray-400 hover:bg-[#1A1A1A] hover:text-white"
              )}
            >
              {isPinned ? (
                <>
                  <PinOff className="h-3 w-3 mr-1" />
                  Unpin
                </>
              ) : (
                <>
                  <Pin className="h-3 w-3 mr-1" />
                  Pin
                </>
              )}
            </Button>
            <Button
              onClick={(e) => { e.stopPropagation(); onDelete?.(); }}
              disabled={isLoading}
              variant="outline"
              size="sm"
              className="flex-1 border-red-400/50 text-red-400 hover:bg-red-500/10 font-bold uppercase tracking-wider text-[10px] h-8 rounded-lg"
            >
              <Trash2 className="h-3 w-3 mr-1" />
              Delete
            </Button>
          </div>
        )}
      </CardFooter>
    </Card>
  );
}
