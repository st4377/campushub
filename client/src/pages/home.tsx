import { Layout } from "@/components/layout";
import { CommunityCard } from "@/components/community-card";
import { Filters, FilterState } from "@/components/filters";
import { MOCK_COMMUNITIES, Community, getPlatformIcon } from "@/lib/mock-data";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Search, SlidersHorizontal, Zap, Filter, Hexagon, X, ExternalLink, Users, Star } from "lucide-react";
import { Sheet, SheetContent, SheetTrigger } from "@/components/ui/sheet";
import generatedHero from "@assets/generated_images/abstract_dark_neon_network_background.png";
import { useState, useRef, useMemo, useCallback } from "react";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription, DialogFooter } from "@/components/ui/dialog";
import { Badge } from "@/components/ui/badge";
import { cn } from "@/lib/utils";
import { useQuery } from "@tanstack/react-query";

interface ApprovedCommunity {
  id: string;
  adminTagId: string;
  name: string;
  platform: string;
  memberCount: number;
  description: string;
  tags: string[];
  rating: number;
  reviewCount: number;
  isActive: boolean;
  isPinned: boolean;
  category: string;
  inviteLink: string;
  visibility: string;
  imageUrl: string | null;
  approvedAt: string;
  bumpedAt: string | null;
}

const initialFilters: FilterState = {
  visibility: [],
  platforms: [],
  categories: [],
};

export default function Home() {
  const popularTags = ["#entertainment", "#trading", "#dance", "#food", "#coding", "#memes", "#hostel", "#events"];
  const [searchQuery, setSearchQuery] = useState("");
  const [activeSearch, setActiveSearch] = useState("");
  const [selectedCommunity, setSelectedCommunity] = useState<Community | null>(null);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [filters, setFilters] = useState<FilterState>(initialFilters);
  const [visibleCount, setVisibleCount] = useState(9);
  const communityGridRef = useRef<HTMLDivElement>(null);

  const { data: approvedCommunities, isLoading } = useQuery({
    queryKey: ["approved-communities"],
    queryFn: async () => {
      const response = await fetch("/api/communities/approved");
      if (!response.ok) throw new Error("Failed to fetch communities");
      const data = await response.json();
      return data.communities as ApprovedCommunity[];
    },
  });

  const allCommunities: Community[] = useMemo(() => {
    if (approvedCommunities && approvedCommunities.length > 0) {
      return approvedCommunities.map((c) => ({
        id: c.id,
        adminTagId: c.adminTagId,
        name: c.name,
        platform: c.platform as Community["platform"],
        memberCount: c.memberCount,
        description: c.description,
        tags: c.tags,
        rating: c.rating,
        reviewCount: c.reviewCount,
        isActive: c.isActive,
        isPinned: c.isPinned,
        bumpedAt: c.bumpedAt,
        category: c.category,
        inviteLink: c.inviteLink,
        visibility: c.visibility as Community["visibility"],
        imageUrl: c.imageUrl || undefined,
      }));
    }
    return MOCK_COMMUNITIES;
  }, [approvedCommunities]);

  const handleTagClick = (tag: string) => {
    const tagWithoutHash = tag.replace("#", "");
    setSearchQuery(tagWithoutHash);
    setActiveSearch(tagWithoutHash);
    setVisibleCount(9);
    scrollToResults();
  };

  const scrollToResults = useCallback(() => {
    setTimeout(() => {
      communityGridRef.current?.scrollIntoView({ 
        behavior: 'smooth',
        block: 'start'
      });
    }, 100);
  }, []);

  const handleSearch = useCallback(() => {
    setActiveSearch(searchQuery);
    setVisibleCount(9);
    if (searchQuery.trim()) {
      scrollToResults();
    }
  }, [searchQuery, scrollToResults]);

  const handleKeyDown = useCallback((e: React.KeyboardEvent) => {
    if (e.key === 'Enter') {
      handleSearch();
    }
  }, [handleSearch]);

  const handleFilterChange = useCallback((newFilters: FilterState) => {
    setFilters(newFilters);
    setVisibleCount(9);
  }, []);

  const handleResetFilters = useCallback(() => {
    setFilters(initialFilters);
    setVisibleCount(9);
  }, []);

  const filteredCommunities = useMemo(() => {
    let result = allCommunities;

    // Apply search filter
    if (activeSearch.trim()) {
      const isTagIdSearch = activeSearch.startsWith('#');
      const query = activeSearch.toLowerCase().replace(/^#/, '');
      
      result = result.filter((community) => {
        // If searching with #, prioritize Tag ID search
        if (isTagIdSearch) {
          const tagIdMatch = community.adminTagId?.toLowerCase().includes(query);
          if (tagIdMatch) return true;
        }
        
        const nameMatch = community.name.toLowerCase().includes(query);
        const descriptionMatch = community.description.toLowerCase().includes(query);
        const tagMatch = community.tags.some(tag => 
          tag.toLowerCase().includes(query) || 
          tag.toLowerCase().replace(/-/g, '').includes(query.replace(/-/g, ''))
        );
        const categoryMatch = community.category.toLowerCase().includes(query);
        return nameMatch || descriptionMatch || tagMatch || categoryMatch;
      });
    }

    // Apply visibility filter
    if (filters.visibility.length > 0) {
      result = result.filter((community) => {
        const communityVisibility = community.visibility?.toLowerCase().replace(/\s+/g, '-') || 'public';
        return filters.visibility.some(v => communityVisibility.includes(v));
      });
    }

    // Apply platform filter
    if (filters.platforms.length > 0) {
      result = result.filter((community) => 
        filters.platforms.includes(community.platform)
      );
    }

    // Apply category filter
    if (filters.categories.length > 0) {
      result = result.filter((community) => 
        filters.categories.includes(community.category)
      );
    }

    // Sort: pinned first, then by bump time (most recent first), then the rest
    result = [...result].sort((a, b) => {
      // Pinned communities always come first
      if (a.isPinned && !b.isPinned) return -1;
      if (!a.isPinned && b.isPinned) return 1;
      
      // Among non-pinned, sort by bumpedAt (most recent first)
      if (!a.isPinned && !b.isPinned) {
        const aBump = a.bumpedAt ? new Date(a.bumpedAt).getTime() : 0;
        const bBump = b.bumpedAt ? new Date(b.bumpedAt).getTime() : 0;
        if (aBump !== bBump) {
          return bBump - aBump; // Descending order (newest bump first)
        }
      }
      
      return 0;
    });

    return result;
  }, [activeSearch, filters, allCommunities]);

  const handleOpenModal = useCallback((community: Community) => {
    setSelectedCommunity(community);
    setIsModalOpen(true);
  }, []);

  const handleCloseModal = useCallback(() => {
    setIsModalOpen(false);
    setTimeout(() => setSelectedCommunity(null), 200);
  }, []);

  return (
    <Layout>
      {/* Hero Section */}
      <div className="relative w-full overflow-hidden border-b border-black/20">
        {/* Animated Wave Background */}
        <div className="absolute inset-0 overflow-hidden">
          <svg className="absolute top-0 right-0 w-full h-full opacity-20" viewBox="0 0 1200 120" preserveAspectRatio="none">
            <defs>
              <linearGradient id="wave-gradient" x1="0%" y1="0%" x2="100%" y2="0%">
                <stop offset="0%" stopColor="#000000" />
                <stop offset="100%" stopColor="#333333" />
              </linearGradient>
            </defs>
            <path d="M0,50 Q300,0 600,50 T1200,50 L1200,120 L0,120 Z" fill="url(#wave-gradient)" />
          </svg>
        </div>
        
        <div className="absolute inset-0 z-0">
          <img 
            src={generatedHero} 
            alt="Background" 
            className="h-full w-full object-cover opacity-10 mix-blend-darken"
          />
          <div className="absolute inset-0 bg-black/5" />
        </div>

        <div className="w-full px-4 md:px-6 py-20 md:py-32 flex flex-col items-center text-center relative z-10">
          <div className="inline-flex items-center border border-black/40 bg-black/10 px-4 py-1.5 text-xs font-bold text-black mb-8 backdrop-blur-md uppercase tracking-widest">
            <Zap className="mr-2 h-3 w-3 fill-black" />
            <span>The #1 Community Directory for SRM</span>
          </div>
          
          <h1 className="text-5xl md:text-7xl font-black font-heading tracking-tighter text-black mb-8 max-w-5xl uppercase leading-none drop-shadow-lg">
            Find your <span className="text-black inline-block relative">tribe<svg className="absolute w-full h-3 -bottom-1 left-0 text-black opacity-60" viewBox="0 0 100 10" preserveAspectRatio="none"><path d="M0 5 Q 50 10 100 5" stroke="currentColor" strokeWidth="3" fill="none" /></svg></span> on campus.
          </h1>
          
          <p className="text-lg md:text-xl text-black/70 max-w-2xl mb-12 font-medium leading-relaxed">
            Discover and join thousands of WhatsApp, Telegram, and Discord communities.
          </p>

          <div className="w-full max-w-2xl relative group">
            <div className="absolute -inset-1 bg-gradient-to-r from-black via-black to-gray-600 rounded-full opacity-30 group-hover:opacity-50 blur-2xl transition duration-500 hidden md:block"></div>
            <div className="relative flex items-center bg-gradient-to-r from-white to-gray-100 rounded-2xl md:rounded-full border border-black/40 shadow-2xl h-16 px-2 md:px-2">
              <div className="h-full w-14 flex items-center justify-center flex-shrink-0">
                 <Search className="h-6 w-6 text-black/60 group-focus-within:text-black transition-colors" />
              </div>
              <Input 
                placeholder="SEARCH COMMUNITIES..." 
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                onKeyDown={handleKeyDown}
                className="h-full flex-1 bg-transparent border-none text-base md:text-lg focus-visible:ring-0 focus-visible:ring-offset-0 placeholder:text-black/50 placeholder:uppercase placeholder:font-bold text-black font-medium rounded-none uppercase tracking-wide px-2 md:px-4 py-2 md:py-0 overflow-x-auto"
              />
              <div className="p-2 hidden md:block">
                <Button 
                  onClick={handleSearch}
                  className="h-full bg-black hover:bg-gray-800 text-white font-bold px-8 rounded-full uppercase tracking-wider transition-all shadow-[0_0_20px_rgba(0,0,0,0.3)] hover:shadow-[0_0_40px_rgba(0,0,0,0.5)]"
                >
                  Search
                </Button>
              </div>
            </div>
          </div>

          <div className="mt-10 flex flex-wrap items-center justify-center gap-3 max-w-3xl">
            {popularTags.map(tag => (
              <Button 
                key={tag} 
                variant="secondary" 
                size="sm" 
                onClick={() => handleTagClick(tag)}
                className="h-8 text-xs bg-white hover:bg-black hover:text-white text-black border border-black/30 hover:border-black rounded-full font-bold uppercase tracking-wide transition-all cursor-pointer shadow-md hover:shadow-[0_0_15px_rgba(0,0,0,0.3)]"
              >
                {tag}
              </Button>
            ))}
          </div>
        </div>
      </div>

      {/* Main Content Grid */}
      <div className="w-full px-6 lg:px-8 py-16" ref={communityGridRef}>
        <div className="flex flex-col lg:flex-row gap-6 w-full">
          
          {/* Sidebar - Desktop only (1024px+) */}
          <aside className="hidden lg:block w-80 flex-shrink-0 sticky top-0 self-start">
            <div className="flex items-center justify-between gap-2 mb-6 border-b border-black/20 pb-4">
              <h2 className="font-heading text-lg font-bold uppercase tracking-wider text-black flex items-center gap-2">
                <Hexagon className="h-4 w-4 text-black" /> Filters
              </h2>
              <Button 
                variant="ghost" 
                size="sm" 
                onClick={() => { setSearchQuery(""); setActiveSearch(""); handleResetFilters(); }}
                className="h-8 text-xs text-black/70 hover:text-black uppercase font-bold tracking-wider hover:bg-transparent"
              >
                Reset All
              </Button>
            </div>
            <div className="p-6 rounded-3xl border border-[#333] bg-[#0A0A0A] shadow-lg">
              <Filters 
                filters={filters}
                onFilterChange={handleFilterChange}
                onReset={handleResetFilters}
              />
            </div>
          </aside>

          {/* Mobile/Tablet Filter Toggle */}
          <div className="lg:hidden flex items-center justify-between mb-8">
            <h2 className="font-heading text-2xl font-bold uppercase text-black">Communities</h2>
            <Sheet>
              <SheetTrigger asChild>
                <Button variant="outline" size="sm" className="border-black/20 gap-2 bg-white text-black uppercase font-bold tracking-wider rounded-full">
                  <Filter className="h-4 w-4 text-black" />
                  Filters
                </Button>
              </SheetTrigger>
              <SheetContent side="left" className="w-[300px] bg-yellow-50 border-r border-black/10 p-6 overflow-y-auto">
                <h2 className="font-heading text-xl font-bold mb-8 uppercase text-black">Filters</h2>
                <Filters 
                  filters={filters}
                  onFilterChange={handleFilterChange}
                  onReset={handleResetFilters}
                />
              </SheetContent>
            </Sheet>
          </div>

          {/* Grid */}
          <div className="flex-1 w-full">
            <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 mb-8 bg-gradient-to-r from-yellow-50 to-yellow-100 p-4 border-l-4 border-black rounded-2xl overflow-hidden">
              <div className="flex flex-col sm:flex-row flex-wrap items-start sm:items-center gap-3 min-w-0 flex-1">
                <p className="text-sm text-black/70 font-medium uppercase tracking-wide flex-shrink-0">
                  Showing <span className="text-black font-bold">{Math.min(visibleCount, filteredCommunities.length)}</span> of <span className="text-black font-bold">{filteredCommunities.length}</span> Results
                </p>
                {activeSearch && (
                  <div className="flex items-center gap-2 bg-black/10 px-3 py-1 rounded-full max-w-[200px] min-w-0">
                    <span className="text-xs font-bold text-black uppercase truncate">"{activeSearch}"</span>
                    <button 
                      onClick={() => { setSearchQuery(""); setActiveSearch(""); }}
                      className="text-black/60 hover:text-black transition-colors flex-shrink-0"
                    >
                      <X className="h-3 w-3" />
                    </button>
                  </div>
                )}
              </div>
              <div className="flex items-center gap-3 flex-shrink-0 w-full sm:w-auto">
                 <span className="text-sm text-black/60 font-bold uppercase tracking-wider hidden sm:inline">Sort by:</span>
                 <select className="flex-1 sm:flex-none bg-white border border-black/20 rounded-xl text-xs px-3 py-2 focus:outline-none focus:border-black text-black font-bold uppercase tracking-wide cursor-pointer hover:border-black transition-colors">
                    <option value="popular">Most Popular</option>
                    <option value="newest">Newest</option>
                    <option value="rating">Top Rated</option>
                 </select>
              </div>
            </div>
            
            {filteredCommunities.length > 0 ? (
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6 w-full">
                {filteredCommunities.slice(0, visibleCount).map((community) => (
                  <CommunityCard 
                    key={community.id}
                    community={community} 
                    onClick={() => handleOpenModal(community)}
                  />
                ))}
              </div>
            ) : (
              <div className="flex flex-col items-center justify-center py-20 text-center px-4 overflow-hidden">
                <div className="h-20 w-20 rounded-full bg-black/5 flex items-center justify-center mb-6">
                  <Search className="h-10 w-10 text-black/30" />
                </div>
                <h3 className="text-xl font-bold text-black mb-2 uppercase">No communities found</h3>
                <p className="text-black/60 max-w-md break-words" style={{ wordBreak: 'break-word', overflowWrap: 'anywhere' }}>
                  We couldn't find any communities matching "{activeSearch.length > 30 ? activeSearch.substring(0, 30) + '...' : activeSearch}". Try a different search term or browse all communities.
                </p>
                <Button 
                  onClick={() => { setSearchQuery(""); setActiveSearch(""); }}
                  className="mt-6 bg-black hover:bg-gray-800 text-white rounded-full uppercase font-bold"
                >
                  Clear Search
                </Button>
              </div>
            )}

            {/* Load More */}
            {filteredCommunities.length > visibleCount && (
              <div className="mt-16 flex justify-center">
                <Button 
                  variant="outline" 
                  className="border-black/30 px-10 py-7 text-sm hover:bg-black hover:text-white hover:border-black text-black font-bold uppercase tracking-widest rounded-2xl transition-all group relative overflow-hidden shadow-lg hover:shadow-[0_0_25px_rgba(0,0,0,0.2)]"
                  onClick={() => setVisibleCount(prev => prev + 12)}
                >
                  <span className="relative z-10">Load More Communities</span>
                  <div className="absolute inset-0 bg-black/10 transform -skew-x-12 -translate-x-full group-hover:translate-x-0 transition-transform duration-500"></div>
                </Button>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Community Details Dialog with Center Pop-in Animation */}
      <Dialog open={isModalOpen} onOpenChange={(open) => !open && handleCloseModal()}>
        <DialogContent 
          className="bg-[#0A0A0A] border-[#333] text-white p-0 overflow-hidden rounded-3xl md:max-w-2xl md:max-h-[90vh] md:overflow-y-auto w-[95vw] md:w-auto md:h-auto flex flex-col md:block aspect-[1/1.5] md:aspect-auto"
        >
          {selectedCommunity && (
            <>
              <div className="relative h-20 md:h-32 bg-gradient-to-r from-[#FFC400] to-[#FF8C00] flex items-end p-3 md:p-6 flex-shrink-0">
                <div className="absolute -bottom-6 md:-bottom-10 left-3 md:left-6 flex items-end gap-2 md:gap-4">
                  <div className="h-12 w-12 md:h-24 md:w-24 rounded-lg md:rounded-2xl bg-[#151515] border-2 md:border-4 border-[#0A0A0A] flex items-center justify-center shadow-xl overflow-hidden flex-shrink-0">
                    {selectedCommunity.imageUrl ? (
                      <img 
                        src={selectedCommunity.imageUrl} 
                        alt={selectedCommunity.name}
                        className="w-full h-full object-cover"
                      />
                    ) : (
                      <span className="text-lg md:text-3xl font-bold text-white font-heading">{selectedCommunity.name.substring(0, 2).toUpperCase()}</span>
                    )}
                  </div>
                </div>
              </div>
              
              <div className="pt-6 md:pt-12 px-3 md:px-6 pb-4 md:pb-8 flex-1 overflow-y-auto flex flex-col">
                {selectedCommunity.adminTagId && (
                  <div className="flex justify-end mb-3 md:mb-4">
                    <span className="text-[8px] md:text-[10px] font-mono text-gray-500 tracking-wider">
                      ID: {selectedCommunity.adminTagId}
                    </span>
                  </div>
                )}
                
                {/* Title Section */}
                <div className="mb-4 md:mb-6">
                  <div className="flex items-start justify-between gap-2 mb-2">
                    <h2 className="text-lg md:text-2xl font-bold font-heading uppercase tracking-wide text-white leading-tight flex-1">
                      {selectedCommunity.name}
                    </h2>
                  </div>
                  <Badge variant="outline" className="text-[8px] md:text-xs px-2 py-0.5 border-[#FFC400] text-[#FFC400] bg-[#FFC400]/10 w-fit">
                    {selectedCommunity.platform}
                  </Badge>
                </div>

                {/* Meta Information Row */}
                <div className="flex flex-wrap items-center gap-3 md:gap-4 mb-4 md:mb-5 pb-4 md:pb-5 border-b border-[#222]">
                  <div className="flex items-center gap-1.5">
                    <Users className="h-3 md:h-4 w-3 md:w-4 text-gray-500 flex-shrink-0" />
                    <span className="text-[10px] md:text-xs text-gray-400 font-medium">{selectedCommunity.memberCount.toLocaleString()}</span>
                  </div>
                  <div className="flex items-center gap-1.5">
                    <Star className="h-3 md:h-4 w-3 md:w-4 fill-[#FFC400] text-[#FFC400] flex-shrink-0" />
                    <span className="text-[10px] md:text-xs text-gray-300 font-medium">{selectedCommunity.rating}</span>
                    <span className="text-[9px] md:text-xs text-gray-500">({selectedCommunity.reviewCount})</span>
                  </div>
                  {selectedCommunity.isActive && (
                    <div className="flex items-center gap-1.5 ml-auto">
                      <span className="relative flex h-1 w-1 md:h-1.5 md:w-1.5">
                        <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-[#FFC400] opacity-75"></span>
                        <span className="relative inline-flex rounded-full h-full w-full bg-[#FFC400]"></span>
                      </span>
                      <span className="text-[8px] md:text-xs text-[#FFC400] font-bold uppercase tracking-wider">Active</span>
                    </div>
                  )}
                </div>

                {/* Description */}
                <p className="text-gray-300 leading-relaxed mb-3 md:mb-6 text-[12px] md:text-base whitespace-pre-line break-words">
                  {selectedCommunity.description}
                </p>

                {/* Tags Section */}
                <div className="mb-2 md:mb-8">
                  <div className="flex flex-wrap gap-2">
                    {selectedCommunity.tags.slice(0, 4).map((tag) => (
                      <span key={tag} className="text-[9px] md:text-xs px-2.5 md:px-3 py-1 md:py-1.5 bg-[#151515] text-gray-300 border border-[#333] rounded-md md:rounded-lg uppercase font-bold tracking-wide">
                        #{tag}
                      </span>
                    ))}
                    {selectedCommunity.tags.length > 4 && (
                      <span className="text-[9px] md:text-xs px-2.5 md:px-3 py-1 md:py-1.5 bg-[#151515] text-gray-400 border border-[#333] rounded-md md:rounded-lg uppercase font-bold">
                        +{selectedCommunity.tags.length - 4}
                      </span>
                    )}
                  </div>
                </div>

                {/* CTA Buttons */}
                <div className="mt-auto pt-2 flex flex-col gap-2 md:gap-3">
                  <Button 
                    className="w-full h-9 md:h-12 bg-[#FFC400] hover:bg-[#FFD84D] text-black font-bold uppercase tracking-wider rounded-lg md:rounded-xl text-[11px] md:text-base shadow-lg hover:shadow-[#FFC400]/30 transition-all"
                    onClick={() => {
                      if (selectedCommunity?.inviteLink) {
                        window.open(selectedCommunity.inviteLink, '_blank', 'noopener,noreferrer');
                      }
                    }}
                  >
                    Join Group Now
                    <ExternalLink className="ml-1.5 md:ml-2 h-3.5 md:h-4 w-3.5 md:w-4" />
                  </Button>
                  <Button 
                    variant="outline" 
                    className="w-full h-8 md:h-10 border-[#333] text-gray-300 hover:bg-[#1A1A1A] hover:text-white hover:border-[#FFC400] rounded-lg md:rounded-xl text-[10px] md:text-sm font-medium"
                    onClick={() => {
                      if (selectedCommunity) {
                        if (navigator.share) {
                          navigator.share({
                            title: selectedCommunity.name,
                            text: `Check out ${selectedCommunity.name} on Campus Communities Hub!`,
                            url: selectedCommunity.inviteLink || window.location.href,
                          });
                        } else {
                          navigator.clipboard.writeText(selectedCommunity.inviteLink || window.location.href);
                          alert('Link copied to clipboard!');
                        }
                      }
                    }}
                  >
                    Share
                  </Button>
                </div>
              </div>
            </>
          )}
        </DialogContent>
      </Dialog>
    </Layout>
  );
}
