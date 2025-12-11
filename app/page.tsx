import { CustomerLoginForm } from "@/components/auth/customer-login-form";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import { ArrowRight, Box, MapPin, Truck } from "lucide-react";

export default function Home() {
  return (
    <main className="min-h-screen flex flex-col relative overflow-hidden bg-background">
      {/* Abstract Background Shapes */}
      <div className="absolute top-0 left-0 w-full h-full overflow-hidden -z-10 opacity-30 pointer-events-none">
         <div className="absolute -top-[20%] -left-[10%] w-[50%] h-[50%] rounded-full bg-blue-500 blur-[120px] mix-blend-multiply filter animate-blob" />
         <div className="absolute top-[20%] -right-[10%] w-[50%] h-[50%] rounded-full bg-purple-500 blur-[120px] mix-blend-multiply filter animate-blob animation-delay-2000" />
         <div className="absolute -bottom-[20%] left-[20%] w-[50%] h-[50%] rounded-full bg-pink-500 blur-[120px] mix-blend-multiply filter animate-blob animation-delay-4000" />
      </div>

      <nav className="flex justify-between items-center p-6 max-w-7xl mx-auto w-full z-10">
        <div className="font-bold text-2xl tracking-tight text-primary">RunDeliv.</div>
        <div className="flex gap-4 text-sm font-medium">
             <Link href="/organizer/login" className="hover:text-primary transition-colors">Organizers</Link>
             <Link href="/delivery/login" className="hover:text-primary transition-colors">Partners</Link>
        </div>
      </nav>

      <section className="flex-1 flex flex-col md:flex-row items-center justify-center gap-12 px-6 py-12 max-w-7xl mx-auto w-full z-10">
        
        {/* Hero Text */}
        <div className="flex-1 space-y-8 text-center md:text-left">
          <div className="space-y-4">
             <div className="inline-flex items-center rounded-full border px-2.5 py-0.5 text-xs font-semibold transition-colors focus:outline-none focus:ring-2 focus:ring-ring focus:ring-offset-2 border-transparent bg-secondary text-secondary-foreground hover:bg-secondary/80">
                🚀 Fast & Reliable
             </div>
             <h1 className="text-5xl md:text-7xl font-extrabold tracking-tight leading-tight">
               Marathon Bibs, <br/>
               <span className="text-gradient">Delivered to You.</span>
             </h1>
             <p className="text-lg text-muted-foreground max-w-xl mx-auto md:mx-0">
               Skip the expo lines. Use our secure platform to get your race kit delivered directly to your doorstep with real-time tracking.
             </p>
          </div>
          
          <div className="flex flex-col sm:flex-row gap-4 justify-center md:justify-start">
             <div className="flex items-center gap-2 text-sm font-medium text-muted-foreground">
                <Box className="w-5 h-5 text-primary" /> Secure Handling
             </div>
             <div className="flex items-center gap-2 text-sm font-medium text-muted-foreground">
                <Truck className="w-5 h-5 text-primary" /> Fast Delivery
             </div>
             <div className="flex items-center gap-2 text-sm font-medium text-muted-foreground">
                <MapPin className="w-5 h-5 text-primary" /> Real-time Tracking
             </div>
          </div>
        </div>

        {/* Login Card */}
        <div className="flex-1 w-full max-w-md">
           <CustomerLoginForm />
        </div>

      </section>

      <footer className="py-6 text-center text-sm text-muted-foreground border-t bg-white/50 dark:bg-black/20 backdrop-blur-sm">
        <p>&copy; 2025 RunDeliv Platform. All rights reserved.</p>
      </footer>
    </main>
  );
}
