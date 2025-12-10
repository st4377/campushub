import { Link, useLocation } from "wouter";
import { Search, Menu, X, PlusCircle, LogIn, Hexagon, LayoutDashboard } from "lucide-react";
import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Sheet, SheetContent, SheetTrigger } from "@/components/ui/sheet";
import { useAuth } from "@/context/auth";

interface LayoutProps {
  children: React.ReactNode;
  hideFooter?: boolean;
}

export function Layout({ children, hideFooter = false }: LayoutProps) {
  const [location] = useLocation();
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const { user } = useAuth();

  const isActive = (path: string) => location === path;

  return (
    <div className="min-h-screen flex flex-col bg-gradient-to-b from-[#FFB700] to-[#FF8C00] font-sans text-foreground selection:bg-black/30 selection:text-white">
      {/* Navigation */}
      <header className="sticky top-0 z-50 w-full border-b border-black/20 bg-white/10 backdrop-blur-xl">
        {/* Desktop Layout: 3-column grid - only on large screens */}
        <div className="container hidden lg:grid lg:grid-cols-[1fr_auto_1fr] h-16 items-center px-4 lg:px-6">
          {/* Left: Logo */}
          <a href="/" className="flex items-center gap-2 justify-self-start transition-opacity hover:opacity-90 group cursor-pointer no-underline">
            <div className="relative flex h-9 w-9 items-center justify-center">
              <Hexagon className="absolute h-9 w-9 text-black fill-black/10 group-hover:fill-black/20 transition-colors" strokeWidth={1.5} />
              <span className="relative z-10 text-lg font-bold text-black group-hover:text-gray-700 transition-colors">C</span>
            </div>
            <span className="font-heading text-xl font-bold tracking-tight uppercase text-black">
              CampusHub
            </span>
          </a>

          {/* Center: Nav Links */}
          <nav className="flex items-center justify-center gap-6">
            <Link href="/" className={`text-sm font-bold uppercase tracking-wide transition-colors hover:text-black whitespace-nowrap ${isActive('/') ? 'text-black' : 'text-black/60'}`}>Browse</Link>
            <Link href="/about" className={`text-sm font-bold uppercase tracking-wide transition-colors hover:text-black whitespace-nowrap ${isActive('/about') ? 'text-black' : 'text-black/60'}`}>About</Link>
            <Link href="/faq" className={`text-sm font-bold uppercase tracking-wide transition-colors hover:text-black whitespace-nowrap ${isActive('/faq') ? 'text-black' : 'text-black/60'}`}>FAQ</Link>
          </nav>

          {/* Right: CTA Buttons */}
          <div className="flex items-center gap-3 justify-self-end">
            <Link href="/list-community">
              <Button variant="outline" className="border-black/30 bg-black/10 backdrop-blur-sm text-black hover:bg-black hover:text-white hover:border-black font-bold uppercase tracking-wider rounded-full transition-all duration-300 text-xs px-4">
                <PlusCircle className="mr-2 h-4 w-4" />
                List Community
              </Button>
            </Link>
            {user ? (
              <Link href="/dashboard">
                <Button variant="outline" className="border-black/30 text-black hover:bg-black/10 hover:text-black hover:border-black font-bold uppercase tracking-wider rounded-full text-xs px-4">
                  <LayoutDashboard className="mr-2 h-4 w-4" />
                  Dashboard
                </Button>
              </Link>
            ) : (
              <Link href="/login">
                <Button variant="outline" className="border-black/30 text-black hover:bg-black/10 hover:text-black hover:border-black font-bold uppercase tracking-wider rounded-full text-xs px-4">
                  <LogIn className="mr-2 h-4 w-4" />
                  Log In
                </Button>
              </Link>
            )}
          </div>
        </div>

        {/* Mobile/Tablet Layout - shows on small and medium screens */}
        <div className="container flex lg:hidden h-16 items-center justify-between px-4">
          {/* Mobile Logo */}
          <a href="/" className="flex items-center gap-2 transition-opacity hover:opacity-90 group cursor-pointer no-underline">
            <div className="relative flex h-9 w-9 items-center justify-center">
              <Hexagon className="absolute h-9 w-9 text-black fill-black/10 group-hover:fill-black/20 transition-colors" strokeWidth={1.5} />
              <span className="relative z-10 text-lg font-bold text-black group-hover:text-gray-700 transition-colors">C</span>
            </div>
            <span className="font-heading text-xl font-bold tracking-tight uppercase text-black">
              CampusHub
            </span>
          </a>

          {/* Mobile Menu Toggle */}
          <Sheet>
            <SheetTrigger asChild>
              <Button variant="ghost" size="icon" className="text-black hover:text-gray-700">
                <Menu className="h-6 w-6" />
                <span className="sr-only">Toggle menu</span>
              </Button>
            </SheetTrigger>
            <SheetContent side="right" className="w-[300px] border-l border-black/10 bg-yellow-50 p-0">
              <div className="flex flex-col h-full p-6">
                <div className="flex items-center justify-between mb-8">
                  <span className="font-heading text-xl font-bold uppercase text-black">Menu</span>
                  {/* Close button is handled by Sheet */}
                </div>
                <nav className="flex flex-col gap-6">
                  <Link href="/" className="text-lg font-bold uppercase hover:text-black/70 tracking-wide text-black">Browse Communities</Link>
                  <Link href="/about" className="text-lg font-bold uppercase hover:text-black/70 tracking-wide text-black">About</Link>
                  <Link href="/faq" className="text-lg font-bold uppercase hover:text-black/70 tracking-wide text-black">FAQ</Link>
                </nav>
                <div className="mt-auto flex flex-col gap-4">
                  <Link href="/list-community">
                    <Button className="w-full bg-black hover:bg-gray-800 text-white font-bold uppercase rounded-full">List Community</Button>
                  </Link>
                  {user ? (
                    <Link href="/dashboard">
                      <Button variant="outline" className="w-full border-black/30 text-black font-bold uppercase hover:border-black hover:text-black rounded-full">
                        <LayoutDashboard className="mr-2 h-4 w-4" />
                        Dashboard
                      </Button>
                    </Link>
                  ) : (
                    <Link href="/login">
                      <Button variant="outline" className="w-full border-black/30 text-black font-bold uppercase hover:border-black hover:text-black rounded-full">Log In</Button>
                    </Link>
                  )}
                </div>
              </div>
            </SheetContent>
          </Sheet>
        </div>
      </header>

      <main className="flex-1 bg-background">
        {children}
      </main>

      {!hideFooter && (
      <footer className="border-t border-white/10 bg-black py-12">
        <div className="container px-4 md:px-6">
          <div className="grid gap-8 md:grid-cols-4">
            <div className="space-y-4">
              <h4 className="text-lg font-bold font-heading uppercase tracking-wider text-white flex items-center gap-2">
                 <Hexagon className="h-5 w-5 text-[#FFC400] fill-[#FFC400]/20" />
                 CampusHub
              </h4>
              <p className="text-sm text-gray-400 leading-relaxed">
                The central hub for all college communities. Find WhatsApp, Telegram, and Discord groups for your campus.
              </p>
            </div>
            <div>
              <h4 className="mb-4 text-sm font-bold uppercase tracking-widest text-[#FFC400]">Platform</h4>
              <ul className="space-y-2 text-sm text-gray-400">
                <li><Link href="/" className="hover:text-white transition-colors">Browse</Link></li>
                <li><Link href="/list-community" className="hover:text-white transition-colors">List Community</Link></li>
                <li><Link href="/about" className="hover:text-white transition-colors">About</Link></li>
              </ul>
            </div>
            <div>
              <h4 className="mb-4 text-sm font-bold uppercase tracking-widest text-[#FFC400]">Legal</h4>
              <ul className="space-y-2 text-sm text-gray-400">
                <li><a href="#" className="hover:text-white transition-colors">Terms of Service</a></li>
                <li><a href="#" className="hover:text-white transition-colors">Privacy Policy</a></li>
                <li><a href="#" className="hover:text-white transition-colors">Guidelines</a></li>
              </ul>
            </div>
            <div>
              <h4 className="mb-4 text-sm font-bold uppercase tracking-widest text-[#FFC400]">Connect</h4>
              <div className="flex gap-4">
                {/* Instagram */}
                <div className="h-10 w-10 flex items-center justify-center rounded-none border border-white/20 hover:border-[#FFC400] hover:bg-[#FFC400]/10 hover:text-[#FFC400] transition-all cursor-pointer text-gray-400">
                   <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><rect width="20" height="20" x="2" y="2" rx="5" ry="5"/><path d="M16 11.37A4 4 0 1 1 12.63 8 4 4 0 0 1 16 11.37z"/><line x1="17.5" x2="17.51" y1="6.5" y2="6.5"/></svg>
                </div>
                {/* WhatsApp */}
                <div className="h-10 w-10 flex items-center justify-center rounded-none border border-white/20 hover:border-[#FFC400] hover:bg-[#FFC400]/10 hover:text-[#FFC400] transition-all cursor-pointer text-gray-400">
                   <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="currentColor"><path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 01-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 01-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 012.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0012.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L.057 24l6.305-1.654a11.882 11.882 0 005.683 1.448h.005c6.554 0 11.89-5.335 11.893-11.893a11.821 11.821 0 00-3.48-8.413z"/></svg>
                </div>
              </div>
            </div>
          </div>
          <div className="mt-12 border-t border-white/20 pt-8 text-center text-xs text-gray-500 uppercase tracking-wider">
            <p>&copy; 2025 Campus Communities Hub</p>
          </div>
        </div>
      </footer>
      )}
    </div>
  );
}
