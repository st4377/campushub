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
  category: string;
  inviteLink: string;
  visibility: string;
  imageUrl: string | null;
  approvedAt: string;
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
  }, []);

  const handleResetFilters = useCallback(() => {
    setFilters(initialFilters);
  }, []);

  const filteredCommunities = useMemo(() => {
    let result = allCommunities;

    // Apply search filter
    if (activeSearch.trim()) {
      const query = activeSearch.toLowerCase().replace(/^#/, '');
      result = result.filter((community) => {
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

        <div className="container relative z-10 px-4 md:px-6 py-20 md:py-32 flex flex-col items-center text-center">
          <div className="inline-flex items-center border border-black/40 bg-black/10 px-4 py-1.5 text-xs font-bold text-black mb-8 backdrop-blur-md uppercase tracking-widest">
            <Zap className="mr-2 h-3 w-3 fill-black" />
            <span>The #1 Community Directory for SRM</span>
          </div>
          
          <h1 className="text-5xl md:text-7xl font-black font-heading tracking-tighter text-black mb-8 max-w-5xl uppercase leading-none drop-shadow-lg">
            Find your <span className="text-black inline-block relative">tribe<svg className="absolute w-full h-3 -bottom-1 left-0 text-black opacity-60" viewBox="0 0 100 10" preserveAspectRatio="none"><path d="M0 5 Q 50 10 100 5" stroke="currentColor" strokeWidth="3" fill="none" /></svg></span> on campus.
          </h1>
          
          <p className="text-lg md:text-xl text-black/70 max-w-2xl mb-12 font-medium leading-relaxed">
            Discover and join thousands of WhatsApp, Telegram, and Discord communities. 
            <span className="text-black/90"> No login required</span> to browse.
          </p>

          <div className="w-full max-w-2xl relative group">
            <div className="absolute -inset-1 bg-gradient-to-r from-black via-black to-gray-600 rounded-full opacity-30 group-hover:opacity-50 blur-2xl transition duration-500"></div>
            <div className="relative flex items-center bg-gradient-to-r from-white to-gray-100 rounded-full border border-black/40 shadow-2xl h-16 px-2">
              <div className="h-full w-14 flex items-center justify-center">
                 <Search className="h-6 w-6 text-black/60 group-focus-within:text-black transition-colors" />
              </div>
              <Input 
                placeholder="SEARCH COMMUNITIES... (e.g. trading, dance, hostel)" 
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                onKeyDown={handleKeyDown}
                className="h-full pl-6 pr-4 bg-transparent border-none text-lg focus-visible:ring-0 focus-visible:ring-offset-0 placeholder:text-black/50 placeholder:uppercase placeholder:font-bold text-black font-medium rounded-none uppercase tracking-wide"
              />
              <div className="p-2">
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
      <div className="container px-4 md:px-6 py-16" ref={communityGridRef}>
        <div className="flex flex-col md:flex-row gap-10">
          
          {/* Sidebar - Desktop */}
          <aside className="hidden md:block w-72 flex-shrink-0">
            <div className="sticky top-28 max-h-[calc(100vh-8rem)] flex flex-col">
              <div className="flex items-center justify-between mb-6 border-b border-black/20 pb-4 flex-shrink-0">
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
              <div className="p-6 rounded-3xl border border-[#333] bg-[#0A0A0A] shadow-lg overflow-y-auto flex-1 scrollbar-thin scrollbar-thumb-[#333] scrollbar-track-transparent">
                <Filters 
                  filters={filters}
                  onFilterChange={handleFilterChange}
                  onReset={handleResetFilters}
                />
              </div>
            </div>
          </aside>

          {/* Mobile Filter Toggle */}
          <div className="md:hidden flex items-center justify-between mb-8">
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
          <div className="flex-1">
            <div className="flex items-center justify-between mb-8 bg-gradient-to-r from-yellow-50 to-yellow-100 p-4 border-l-4 border-black rounded-2xl">
              <div className="flex items-center gap-3">
                <p className="text-sm text-black/70 font-medium uppercase tracking-wide">
                  Showing <span className="text-black font-bold">{filteredCommunities.length}</span> Results
                </p>
                {activeSearch && (
                  <div className="flex items-center gap-2 bg-black/10 px-3 py-1 rounded-full">
                    <span className="text-xs font-bold text-black uppercase">"{activeSearch}"</span>
                    <button 
                      onClick={() => { setSearchQuery(""); setActiveSearch(""); }}
                      className="text-black/60 hover:text-black transition-colors"
                    >
                      <X className="h-3 w-3" />
                    </button>
                  </div>
                )}
              </div>
              <div className="flex items-center gap-3">
                 <span className="text-sm text-black/60 font-bold uppercase tracking-wider hidden sm:inline">Sort by:</span>
                 <select className="bg-white border border-black/20 rounded-xl text-xs px-3 py-2 focus:outline-none focus:border-black text-black font-bold uppercase tracking-wide cursor-pointer hover:border-black transition-colors">
                    <option value="popular">Most Popular</option>
                    <option value="newest">Newest</option>
                    <option value="rating">Top Rated</option>
                 </select>
              </div>
            </div>
            
            {filteredCommunities.length > 0 ? (
              <div className={cn("community-grid", {
                "grid-cols-2": filteredCommunities.length <= 2,
                "grid-cols-3": filteredCommunities.length >= 3,
              })}>
                {filteredCommunities.map((community) => (
                  <CommunityCard 
                    key={community.id}
                    community={community} 
                    onClick={() => handleOpenModal(community)}
                  />
                ))}
              </div>
            ) : (
              <div className="flex flex-col items-center justify-center py-20 text-center">
                <div className="h-20 w-20 rounded-full bg-black/5 flex items-center justify-center mb-6">
                  <Search className="h-10 w-10 text-black/30" />
                </div>
                <h3 className="text-xl font-bold text-black mb-2 uppercase">No communities found</h3>
                <p className="text-black/60 max-w-md">
                  We couldn't find any communities matching "{activeSearch}". Try a different search term or browse all communities.
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
            {filteredCommunities.length > 0 && (
              <div className="mt-16 flex justify-center">
                <Button variant="outline" className="border-black/30 px-10 py-7 text-sm hover:bg-black hover:text-white hover:border-black text-black font-bold uppercase tracking-widest rounded-2xl transition-all group relative overflow-hidden shadow-lg hover:shadow-[0_0_25px_rgba(0,0,0,0.2)]">
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
          className="bg-[#0A0A0A] border-[#333] text-white max-w-2xl p-0 overflow-hidden rounded-3xl"
        >
          {selectedCommunity && (
            <>
              <div className="relative h-32 bg-gradient-to-r from-[#FFC400] to-[#FF8C00] flex items-end p-6">
                <div className="absolute -bottom-10 left-6 flex items-end gap-4">
                  <div className="h-24 w-24 rounded-2xl bg-[#151515] border-4 border-[#0A0A0A] flex items-center justify-center shadow-xl overflow-hidden">
                    {selectedCommunity.imageUrl ? (
                      <img 
                        src={selectedCommunity.imageUrl} 
                        alt={selectedCommunity.name}
                        className="w-full h-full object-cover"
                      />
                    ) : (
                      <span className="text-3xl font-bold text-white font-heading">{selectedCommunity.name.substring(0, 2).toUpperCase()}</span>
                    )}
                  </div>
                </div>
              </div>
              
              <div className="pt-12 px-6 pb-8">
                <div className="flex justify-between items-start mb-6">
                  <div>
                    <h2 className="text-2xl font-bold font-heading uppercase tracking-wide text-white flex items-center gap-3">
                      {selectedCommunity.name}
                      <Badge variant="outline" className="text-xs px-2 py-0.5 border-[#FFC400] text-[#FFC400] bg-[#FFC400]/10">
                        {selectedCommunity.platform}
                      </Badge>
                    </h2>
                    <div className="flex items-center gap-4 mt-2 text-sm text-gray-400">
                      <span className="flex items-center gap-1.5">
                        <Users className="h-4 w-4" /> {selectedCommunity.memberCount.toLocaleString()} Members
                      </span>
                      <span className="flex items-center gap-1.5 text-[#FFC400]">
                        <Star className="h-4 w-4 fill-[#FFC400]" /> {selectedCommunity.rating} ({selectedCommunity.reviewCount} reviews)
                      </span>
                    </div>
                  </div>
                  <div className="flex flex-col items-end gap-3">
                    {selectedCommunity.adminTagId && (
                      <span className="text-sm font-mono text-white tracking-wider">
                        Tag ID: {selectedCommunity.adminTagId}
                      </span>
                    )}
                    {selectedCommunity.isActive && (
                      <span className="flex items-center gap-1.5 text-xs text-[#FFC400] font-bold uppercase tracking-wider bg-[#FFC400]/10 px-3 py-1 rounded-full border border-[#FFC400]/20">
                        <span className="relative flex h-2 w-2">
                          <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-[#FFC400] opacity-75"></span>
                          <span className="relative inline-flex rounded-full h-2 w-2 bg-[#FFC400]"></span>
                        </span>
                        Active Now
                      </span>
                    )}
                  </div>
                </div>

                <p className="text-gray-300 leading-relaxed mb-8 text-lg">
                  {selectedCommunity.description}
                  <br/><br/>
                  Join our community to connect with like-minded students, participate in events, and grow your network at SRM.
                </p>

                <div className="flex flex-wrap gap-2 mb-8">
                  {selectedCommunity.tags.map((tag) => (
                    <span key={tag} className="text-xs px-3 py-1.5 bg-[#151515] text-gray-300 border border-[#333] rounded-lg uppercase font-bold tracking-wide">
                      #{tag}
                    </span>
                  ))}
                </div>

                <div className="flex gap-4">
                  <Button 
                    className="flex-1 h-12 bg-[#FFC400] hover:bg-[#FFD84D] text-black font-bold uppercase tracking-wider rounded-xl text-base shadow-lg hover:shadow-[#FFC400]/20 transition-all"
                    onClick={() => {
                      if (selectedCommunity?.inviteLink) {
                        window.open(selectedCommunity.inviteLink, '_blank', 'noopener,noreferrer');
                      }
                    }}
                  >
                    Join Group Now
                    <ExternalLink className="ml-2 h-4 w-4" />
                  </Button>
                  <Button 
                    variant="outline" 
                    className="h-12 px-6 border-[#333] hover:bg-[#1A1A1A] hover:text-white hover:border-[#FFC400] rounded-xl"
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
