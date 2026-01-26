"use client"
import { BibList } from "@/components/customer/bib-list"
import { Button } from "@/components/ui/button"
import { LogOut, LayoutDashboard, UserCircle2 } from "lucide-react"
import { useRouter } from "next/navigation"

export default function DashboardPage() {
  const router = useRouter()
  
  const logout = () => {
    localStorage.removeItem("token")
    localStorage.removeItem("user")
    router.push("/")
  }

  return (
    <div className="min-h-screen bg-background pb-24">
       <header className="bg-background/80 backdrop-blur-md sticky top-0 z-20 border-b border-border">
         <div className="max-w-5xl mx-auto px-6 py-4 flex justify-between items-center">
           <div className="flex items-center gap-2">
             <div className="h-8 w-8 bg-primary rounded-lg flex items-center justify-center text-primary-foreground font-bold">B</div>
             <h1 className="font-bold text-xl tracking-tight text-foreground">Dashboard</h1>
           </div>
           <div className="flex gap-4">
             <div className="hidden md:flex items-center gap-2 px-3 py-1 bg-secondary rounded-full text-sm font-medium">
               <UserCircle2 className="w-4 h-4" /> Guest
             </div>
             <Button variant="ghost" size="sm" onClick={logout} className="text-muted-foreground hover:text-destructive">
               <LogOut className="w-4 h-4 mr-2" /> Logout
             </Button>
           </div>
         </div>
       </header>

       <main className="max-w-5xl mx-auto px-6 py-8">
         <BibList />
       </main>
    </div>
  )
}
