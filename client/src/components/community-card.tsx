import { Community, getPlatformColor, getPlatformIcon, CommunityVisibility } from "@/lib/mock-data";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardFooter, CardHeader } from "@/components/ui/card";
import { Star, ExternalLink, MoreHorizontal, Hexagon, Globe, User, Pin } from "lucide-react";
import { cn } from "@/lib/utils";

const getVisibilityInfo = (visibility: CommunityVisibility) => {
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

interface CommunityCardProps {
  community: Community;
  onClick?: () => void;
  disableHoverScale?: boolean;
}

export function CommunityCard({ community, onClick, disableHoverScale = false }: CommunityCardProps) {
  const PlatformIcon = getPlatformIcon(community.platform);
  const platformStyle = getPlatformColor(community.platform);

  return (
    <Card 
      className={cn(
        "h-[380px] bg-[#0A0A0A] overflow-hidden flex flex-col group relative rounded-3xl border border-[#222] shadow-xl cursor-pointer transition-transform duration-300",
        !disableHoverScale && "hover:scale-[1.02]"
      )}
      onClick={onClick}
    >
      {/* Visibility Badge - Highlighted at top */}
      {(() => {
        const visibilityInfo = getVisibilityInfo(community.visibility);
        const VisibilityIcon = visibilityInfo.icon;
        return (
          <div className={cn("absolute top-0 left-0 right-0 flex items-center justify-center gap-1.5 py-1.5 text-[10px] font-bold uppercase tracking-wider border-b z-20", visibilityInfo.className)}>
            <VisibilityIcon className="h-3 w-3" />
            {visibilityInfo.label}
          </div>
        );
      })()}

      {/* Top highlight bar */}
      <div className={cn("absolute top-7 left-0 right-0 h-[2px] opacity-0 group-hover:opacity-100 transition-opacity duration-300 bg-[#FFC400] shadow-[0_0_10px_#FFC400]")} />

      {/* Decorative corner */}
      <div className="absolute -top-6 -right-6 w-12 h-12 bg-white/5 rotate-45 group-hover:bg-[#FFC400]/20 transition-colors"></div>

      {/* Pinned Ribbon Badge */}
      {community.isPinned && (
        <div className="absolute -top-1 -right-1 z-30">
          <div className="relative">
            {/* Ribbon flap */}
            <div className="bg-[#FFC400] text-black px-3 py-1.5 pr-4 rounded-bl-lg shadow-lg flex items-center gap-1.5 transform rotate-0">
              <Pin className="h-3.5 w-3.5 fill-current" />
              <span className="text-[11px] font-bold uppercase tracking-wider">Pinned</span>
            </div>
            {/* Folded corner effect */}
            <div className="absolute -bottom-1.5 right-0 w-0 h-0 border-l-[6px] border-l-transparent border-t-[6px] border-t-[#CC9E00]"></div>
          </div>
        </div>
      )}

      <CardHeader className="pb-3 pt-10 px-6 flex flex-row items-start justify-between gap-4 relative z-10">
        <div className="flex items-center gap-4">
          <div className="relative">
            <div className="h-14 w-14 rounded-2xl bg-[#151515] border border-[#333] flex items-center justify-center shadow-lg group-hover:border-[#FFC400] group-hover:shadow-[0_0_15px_rgba(255,196,0,0.3)] transition-all overflow-hidden">
              {community.imageUrl ? (
                <img 
                  src={community.imageUrl} 
                  alt={community.name}
                  className="w-full h-full object-cover"
                />
              ) : (
                <span className="text-xl font-bold text-white font-heading">{community.name.substring(0, 2).toUpperCase()}</span>
              )}
            </div>
            <div className={cn("absolute -bottom-2 -right-2 h-6 w-6 rounded-full bg-[#0A0A0A] border border-[#333] flex items-center justify-center text-[10px]", 
              community.platform === 'WhatsApp' ? 'text-green-500' : 
              community.platform === 'Discord' ? 'text-indigo-400' : 
              community.platform === 'Telegram' ? 'text-blue-400' : 
              'text-pink-500'
            )}>
              <PlatformIcon className="h-3.5 w-3.5" />
            </div>
          </div>
          <div className="flex flex-col">
            <h3 className="font-bold text-lg leading-tight text-white group-hover:text-[#FFC400] transition-colors line-clamp-1 uppercase tracking-wide" title={community.name}>
              {community.name}
            </h3>
            <div className="flex items-center gap-2 mt-2">
              <Badge variant="outline" className="text-[10px] px-2 py-0.5 h-5 font-bold border-[#333] bg-[#151515] text-gray-400 uppercase tracking-wider rounded-none">
                {community.platform}
              </Badge>
              {community.isActive && (
                <span className="flex items-center gap-1.5 text-[10px] text-[#FFC400] font-bold uppercase tracking-wider">
                  <span className="relative flex h-2 w-2">
                    <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-[#FFC400] opacity-75"></span>
                    <span className="relative inline-flex rounded-full h-2 w-2 bg-[#FFC400]"></span>
                  </span>
                  Active
                </span>
              )}
            </div>
          </div>
        </div>
      </CardHeader>

      <CardContent className="px-6 py-3 flex-1 flex flex-col relative z-10 min-h-0">
        <div className="flex items-center gap-4 mb-4 text-xs text-gray-500">
          <div className="flex items-center gap-1.5">
            <Star className="h-3.5 w-3.5 text-[#FFC400] fill-[#FFC400]" />
            <span className="font-mono text-white">{community.rating} <span className="text-gray-600">({community.reviewCount})</span></span>
          </div>
        </div>

        <p className="text-sm text-gray-400 line-clamp-2 leading-relaxed font-medium h-[40px] whitespace-pre-line">
          {community.description}
        </p>

        <div className="flex flex-wrap gap-2 mt-auto pt-4">
          {community.tags.map((tag) => (
            <span key={tag} className="text-[10px] px-2 py-1 bg-[#151515] text-gray-400 border border-[#333] group-hover:border-[#FFC400]/40 transition-colors uppercase font-bold tracking-wider rounded-lg">
              #{tag}
            </span>
          ))}
        </div>
      </CardContent>

      <CardFooter className="px-6 py-5 bg-[#050505] border-t border-[#222] flex gap-3 relative z-10">
        <Button 
          className="flex-1 bg-[#FFC400] hover:bg-[#FFD84D] text-black font-bold uppercase tracking-wider rounded-xl shadow-[0_0_20px_rgba(255,196,0,0.2)] hover:shadow-[0_0_30px_rgba(255,196,0,0.4)] transition-all duration-300 group/btn"
          onClick={(e) => {
            e.stopPropagation();
            if (community.inviteLink) {
              window.open(community.inviteLink, '_blank', 'noopener,noreferrer');
            }
          }}
        >
          Join Group
          <ExternalLink className="ml-2 h-3.5 w-3.5 opacity-70 group-hover/btn:opacity-100" />
        </Button>
        <Button 
          variant="ghost" 
          size="icon" 
          className="text-gray-500 hover:text-[#FFC400] hover:bg-[#1A1A1A] rounded-xl border border-transparent hover:border-[#FFC400]/20"
          onClick={(e) => {
            e.stopPropagation();
            if (navigator.share) {
              navigator.share({
                title: community.name,
                text: `Check out ${community.name} on Campus Communities Hub!`,
                url: community.inviteLink || window.location.href,
              });
            } else {
              navigator.clipboard.writeText(community.inviteLink || window.location.href);
            }
          }}
        >
          <MoreHorizontal className="h-4 w-4" />
        </Button>
      </CardFooter>
    </Card>
  );
}
