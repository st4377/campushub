import { Layout } from "@/components/layout";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { CheckCircle2, ShieldCheck, Users2, Zap, Hexagon } from "lucide-react";
import generatedHero from "@assets/generated_images/abstract_dark_neon_network_background.png";

export default function About() {
  return (
    <Layout>
      <div className="relative py-24 md:py-40 overflow-hidden bg-gradient-to-br from-[#FFC400] via-[#FFB700] to-[#FFA500]">
        {/* Decorative elements */}
        <div className="absolute inset-0 opacity-20">
          <svg className="w-full h-full" viewBox="0 0 1200 800">
            <defs>
              <linearGradient id="accent-gradient" x1="0%" y1="0%" x2="100%" y2="100%">
                <stop offset="0%" stopColor="#000000" />
                <stop offset="100%" stopColor="#333333" />
              </linearGradient>
            </defs>
            <circle cx="100" cy="100" r="150" fill="url(#accent-gradient)" opacity="0.1" />
            <circle cx="1100" cy="700" r="200" fill="url(#accent-gradient)" opacity="0.1" />
          </svg>
        </div>
        
        <div className="absolute inset-0 z-0">
          <img 
            src={generatedHero} 
            alt="Background" 
            className="h-full w-full object-cover opacity-10 mix-blend-multiply"
          />
          <div className="absolute inset-0 bg-gradient-to-b from-[#FFC400]/50 via-transparent to-[#FFC400]/50" />
        </div>

        <div className="container relative z-10 px-4 md:px-6 text-center max-w-4xl mx-auto">
          <div className="inline-flex items-center justify-center w-16 h-16 mb-8 bg-black text-[#FFC400] relative rounded-xl shadow-lg">
            <Hexagon className="h-8 w-8 fill-[#FFC400] text-[#FFC400] absolute" />
          </div>
          
          <h1 className="text-5xl md:text-7xl font-black font-heading tracking-tighter mb-8 uppercase leading-none text-black">
            Connecting Campus. <br/>
            <span className="text-black/80">One Group at a Time.</span>
          </h1>
          <p className="text-xl text-black/70 leading-relaxed mb-12 max-w-2xl mx-auto font-medium">
            CampusHub is the central directory for all student communities. Whether you're looking for study buddies,
            trading tips, or just want to know what's for dinner at the mess, we've got a group for that.
          </p>
        </div>
      </div>

      <div className="container px-4 md:px-6 pb-32 -mt-16 relative z-20">
        <div className="grid md:grid-cols-3 gap-8">
          <Card className="bg-white border-black/10 rounded-3xl relative overflow-hidden group shadow-xl hover:shadow-2xl transition-all duration-300 hover:-translate-y-2">
            <div className="absolute top-0 left-0 w-1 h-full bg-transparent group-hover:bg-gradient-to-b group-hover:from-[#FFC400] group-hover:to-[#FF8C00] transition-all duration-300"></div>
            <CardContent className="pt-10 text-center px-8 pb-10">
              <div className="mx-auto mb-6 h-16 w-16 bg-[#FFC400] border border-black/10 flex items-center justify-center text-black shadow-lg group-hover:shadow-[0_0_20px_rgba(255,196,0,0.5)] transition-all rounded-2xl">
                <Zap className="h-8 w-8" />
              </div>
              <h3 className="text-2xl font-bold mb-4 uppercase tracking-wide text-black">Instant Access</h3>
              <p className="text-black/60 leading-relaxed">
                No sign-up required to browse or search. Find the invite link and join instantly.
              </p>
            </CardContent>
          </Card>

          <Card className="bg-white border-black/10 rounded-3xl relative overflow-hidden group shadow-xl hover:shadow-2xl transition-all duration-300 hover:-translate-y-2">
            <div className="absolute top-0 left-0 w-1 h-full bg-transparent group-hover:bg-gradient-to-b group-hover:from-[#FFC400] group-hover:to-[#FF8C00] transition-all duration-300"></div>
            <CardContent className="pt-10 text-center px-8 pb-10">
              <div className="mx-auto mb-6 h-16 w-16 bg-[#FFC400] border border-black/10 flex items-center justify-center text-black shadow-lg group-hover:shadow-[0_0_20px_rgba(255,196,0,0.5)] transition-all rounded-2xl">
                <Users2 className="h-8 w-8" />
              </div>
              <h3 className="text-2xl font-bold mb-4 uppercase tracking-wide text-black">All Platforms</h3>
              <p className="text-black/60 leading-relaxed">
                We aggregate WhatsApp, Telegram, Discord, and Instagram communities in one place.
              </p>
            </CardContent>
          </Card>

          <Card className="bg-white border-black/10 rounded-3xl relative overflow-hidden group shadow-xl hover:shadow-2xl transition-all duration-300 hover:-translate-y-2">
            <div className="absolute top-0 left-0 w-1 h-full bg-transparent group-hover:bg-gradient-to-b group-hover:from-[#FFC400] group-hover:to-[#FF8C00] transition-all duration-300"></div>
            <CardContent className="pt-10 text-center px-8 pb-10">
              <div className="mx-auto mb-6 h-16 w-16 bg-[#FFC400] border border-black/10 flex items-center justify-center text-black shadow-lg group-hover:shadow-[0_0_20px_rgba(255,196,0,0.5)] transition-all rounded-2xl">
                <ShieldCheck className="h-8 w-8" />
              </div>
              <h3 className="text-2xl font-bold mb-4 uppercase tracking-wide text-black">Community Verified</h3>
              <p className="text-black/60 leading-relaxed">
                Community-driven ratings and reviews help you avoid spam and inactive groups.
              </p>
            </CardContent>
          </Card>
        </div>

        <div className="mt-32 border border-black/10 bg-white rounded-3xl relative overflow-hidden shadow-2xl">
           <div className="absolute top-0 left-0 w-1 h-full bg-gradient-to-b from-[#FFC400] to-[#FF8C00] rounded-l-3xl"></div>
           <div className="absolute top-0 right-0 p-12 opacity-5">
              <Zap className="w-96 h-96 text-black" />
           </div>
           <div className="relative z-10 p-12 md:p-20 text-center">
             <h2 className="text-4xl md:text-5xl font-black font-heading mb-6 uppercase tracking-tight text-black">Ready to grow your community?</h2>
             <p className="text-black/60 mb-10 text-xl max-w-3xl mx-auto">
               List your WhatsApp group, Discord server, or Telegram channel today and reach thousands of students.
             </p>
             <Button size="lg" className="bg-black hover:bg-gray-800 text-[#FFC400] font-black text-lg px-10 py-8 uppercase tracking-wider rounded-full shadow-[0_0_30px_rgba(0,0,0,0.3)] hover:shadow-[0_0_40px_rgba(0,0,0,0.5)] transition-all">
               List Your Community
             </Button>
           </div>
        </div>
      </div>
    </Layout>
  );
}
