import { Badge } from "@/components/ui/badge";
import { mapCategoryToDisplay } from "@/lib/category-mapper";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardFooter, CardHeader } from "@/components/ui/card";
import { CheckCircle, XCircle, ExternalLink, Pencil, Pin, PinOff, Trash2, Globe, User, MessageCircle, Hash } from "lucide-react";
import { cn } from "@/lib/utils";

type CommunityVisibility = "public" | "boys-only" | "girls-only";

const getVisibilityInfo = (visibility: string) => {
  switch (visibility) {
    case "public":
      return { label: "Public", icon: Globe, className: "bg-[#FFC400] text-black border-[#FFC400]" };
    case "boys-only":
      return { label: "Boys Only", icon: User, className: "bg-black text-white border-black" };
    case "girls-only":
      return { label: "Girls Only", icon: User, className: "bg-gray-700 text-white border-gray-700" };
    default:
      return { label: "Public", icon: Globe, className: "bg-[#FFC400] text-black border-[#FFC400]" };
  }
};

const getPlatformColor = () => {
  return "text-black bg-[#FFC400] border-[#FFC400]";
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
    <Card className="min-h-[420px] bg-white overflow-hidden flex flex-col group relative rounded-2xl border-2 border-[#FFC400]/30 shadow-lg hover:border-[#FFC400] hover:shadow-xl transition-all">
      <div className={cn("absolute top-0 left-0 right-0 flex items-center justify-center gap-2 py-2 text-xs font-bold uppercase tracking-wider border-b z-20", visibilityInfo.className)}>
        <VisibilityIcon className="h-4 w-4" />
        {visibilityInfo.label}
      </div>

      {isPinned && (
        <div className="absolute top-8 right-3 z-30">
          <Badge className="bg-[#FFC400] text-black text-xs font-bold px-2.5 py-1 flex items-center gap-1.5 shadow-md">
            <Pin className="h-3.5 w-3.5 fill-current" />
            PINNED
          </Badge>
        </div>
      )}

      <CardHeader className="pb-3 pt-12 px-5 flex flex-row items-start gap-4 relative z-10">
        <div className="h-16 w-16 rounded-xl bg-gray-100 border-2 border-[#FFC400]/30 flex items-center justify-center shadow-md overflow-hidden flex-shrink-0">
          {community.imageUrl ? (
            <img 
              src={community.imageUrl} 
              alt={community.name}
              className="w-full h-full object-cover"
            />
          ) : (
            <span className="text-lg font-bold text-gray-600">{community.name.substring(0, 2).toUpperCase()}</span>
          )}
        </div>
        <div className="flex-1 min-w-0">
          <h3 className="font-bold text-lg leading-tight text-gray-900 line-clamp-1 uppercase tracking-wide" title={community.name}>
            {community.name}
          </h3>
          <div className="flex items-center gap-2 mt-2 flex-wrap">
            <Badge className={cn("text-xs px-2.5 py-0.5 font-bold uppercase tracking-wider border", getPlatformColor())}>
              {community.platform}
            </Badge>
            {community.adminTagId && (
              <Badge className="bg-[#FFC400] text-black text-xs px-2.5 py-0.5 font-mono tracking-wider border border-[#FFC400] shadow-sm">
                {community.adminTagId}
              </Badge>
            )}
          </div>
        </div>
      </CardHeader>

      <CardContent className="px-5 py-3 flex-1 flex flex-col relative z-10 min-h-0">
        <div className="flex items-center gap-4 text-sm text-gray-600 mb-3">
          <span className="text-gray-600 truncate font-medium">{mapCategoryToDisplay(community.category)}</span>
        </div>

        <p className="text-sm text-gray-700 line-clamp-3 leading-relaxed mb-3 whitespace-pre-line">
          {community.description}
        </p>

        <div className="flex flex-wrap gap-1.5 mt-auto">
          {community.tags.map((tag) => (
            <span key={tag} className="text-xs px-2.5 py-1 bg-gray-100 text-gray-700 border border-gray-200 rounded-full uppercase font-medium tracking-wider">
              #{tag}
            </span>
          ))}
        </div>

        <a
          href={community.inviteLink}
          target="_blank"
          rel="noopener noreferrer"
          className="text-sm text-blue-600 hover:text-blue-800 flex items-center gap-1.5 mt-3 truncate font-medium"
          onClick={(e) => e.stopPropagation()}
        >
          <ExternalLink className="h-4 w-4 flex-shrink-0" />
          <span className="truncate">{community.inviteLink}</span>
        </a>
      </CardContent>

      <CardFooter className="px-4 py-4 bg-gray-50 border-t border-gray-200 relative z-10">
        {variant === "pending" ? (
          <div className="flex gap-2 w-full">
            <Button
              onClick={(e) => { e.stopPropagation(); onEdit?.(); }}
              disabled={isLoading}
              variant="outline"
              size="sm"
              className="flex-1 border-[#FFC400] text-[#B8860B] hover:bg-[#FFC400]/10 font-bold uppercase tracking-wider text-xs h-10 rounded-lg"
            >
              <Pencil className="h-4 w-4 mr-1.5" />
              Edit
            </Button>
            <Button
              onClick={(e) => { e.stopPropagation(); onApprove?.(); }}
              disabled={isLoading}
              size="sm"
              className="flex-1 bg-green-600 hover:bg-green-700 text-white font-bold uppercase tracking-wider text-xs h-10 rounded-lg"
            >
              <CheckCircle className="h-4 w-4 mr-1.5" />
              Approve
            </Button>
            <Button
              onClick={(e) => { e.stopPropagation(); onReject?.(); }}
              disabled={isLoading}
              variant="outline"
              size="sm"
              className="flex-1 border-red-400 text-red-600 hover:bg-red-50 font-bold uppercase tracking-wider text-xs h-10 rounded-lg"
            >
              <XCircle className="h-4 w-4 mr-1.5" />
              Reject
            </Button>
          </div>
        ) : (
          <div className="flex gap-3 w-full">
            <Button
              onClick={(e) => { e.stopPropagation(); onPin?.(); }}
              disabled={isLoading}
              variant="outline"
              size="sm"
              className={cn(
                "flex-1 font-bold uppercase tracking-wider text-xs h-10 rounded-lg",
                isPinned 
                  ? "border-[#FFC400] text-[#B8860B] bg-[#FFC400]/20 hover:bg-[#FFC400]/30" 
                  : "border-gray-300 text-gray-600 hover:bg-gray-100 hover:text-gray-900"
              )}
            >
              {isPinned ? (
                <>
                  <PinOff className="h-4 w-4 mr-1.5" />
                  Unpin
                </>
              ) : (
                <>
                  <Pin className="h-4 w-4 mr-1.5" />
                  Pin
                </>
              )}
            </Button>
            <Button
              onClick={(e) => { e.stopPropagation(); onDelete?.(); }}
              disabled={isLoading}
              variant="outline"
              size="sm"
              className="flex-1 border-red-400 text-red-600 hover:bg-red-50 font-bold uppercase tracking-wider text-xs h-10 rounded-lg"
            >
              <Trash2 className="h-4 w-4 mr-1.5" />
              Delete
            </Button>
          </div>
        )}
      </CardFooter>
    </Card>
  );
}
