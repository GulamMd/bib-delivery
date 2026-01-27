"use client"

import { useState, useEffect } from "react"
import { useRouter } from "next/navigation"
import { Button } from "@/components/ui/button"
import { UserCircle2, LogOut, ChevronDown, User, Settings, LayoutDashboard } from "lucide-react"
import { motion, AnimatePresence } from "framer-motion"
import { ProfileDialog } from "@/components/customer/profile-dialog"

export function DashboardHeader() {
  const router = useRouter()
  const [user, setUser] = useState<any>(null)
  const [loading, setLoading] = useState(true)
  const [menuOpen, setMenuOpen] = useState(false)
  const [profileOpen, setProfileOpen] = useState(false)

  useEffect(() => {
    fetchUser()
  }, [])

  const fetchUser = async () => {
    try {
      const token = localStorage.getItem("token")
      if (!token) return;

      const res = await fetch("/api/user", {
        headers: { Authorization: `Bearer ${token}` }
      })
      const data = await res.json()
      if (data.success) {
        setUser(data.user)
        localStorage.setItem("user", JSON.stringify(data.user))
      }
    } catch (e) {
      console.error(e)
    } finally {
      setLoading(false)
    }
  }

  const logout = () => {
    localStorage.removeItem("token")
    localStorage.removeItem("user")
    router.push("/")
  }

  return (
    <>
      <header className="bg-background/80 backdrop-blur-md sticky top-0 z-40 border-b border-border shadow-sm">
        <div className="max-w-7xl mx-auto px-6 py-4 flex justify-between items-center">
          
          {/* Logo Section */}
          <div className="flex items-center gap-2 cursor-pointer" onClick={() => router.push("/dashboard")}>
            <div className="h-9 w-9 bg-gradient-to-br from-primary to-purple-600 rounded-lg flex items-center justify-center text-primary-foreground font-bold shadow-lg">
              B
            </div>
            <span className="font-bold text-xl tracking-tight hidden md:block">
              BibGo <span className="text-primary font-normal text-sm ml-1">Dashboard</span>
            </span>
          </div>

          {/* User Menu */}
          <div className="relative">
             <Button 
               variant="ghost" 
               className="flex items-center gap-2 pl-2 pr-3 py-1 bg-secondary/50 hover:bg-secondary rounded-full border border-transparent hover:border-border transition-all"
               onClick={() => setMenuOpen(!menuOpen)}
             >
               <div className="w-8 h-8 rounded-full bg-primary/20 flex items-center justify-center text-primary font-bold">
                 {user?.name ? user.name.charAt(0).toUpperCase() : <UserCircle2 className="w-5 h-5" />}
               </div>
               <div className="flex flex-col items-start text-xs text-left hidden sm:block">
                  <span className="font-semibold text-sm">{user?.name || "Guest"}</span>
               </div>
               <ChevronDown className={`w-3 h-3 text-muted-foreground transition-transform ${menuOpen ? "rotate-180" : ""}`} />
             </Button>

             <AnimatePresence>
               {menuOpen && (
                 <>
                   <div className="fixed inset-0 z-40" onClick={() => setMenuOpen(false)} />
                   <motion.div
                     initial={{ opacity: 0, scale: 0.95, y: 10 }}
                     animate={{ opacity: 1, scale: 1, y: 0 }}
                     exit={{ opacity: 0, scale: 0.95, y: 10 }}
                     className="absolute right-0 top-full mt-2 w-56 rounded-xl border border-border bg-card shadow-xl z-50 overflow-hidden"
                   >
                     <div className="p-3 border-b text-sm">
                        <p className="font-medium truncate">{user?.name || "Guest User"}</p>
                        <p className="text-xs text-muted-foreground truncate">{user?.email || (user?.mobile ? `+${user.mobile}` : "No details")}</p>
                     </div>
                     <div className="p-1">
                        <button 
                          onClick={() => { setProfileOpen(true); setMenuOpen(false); }}
                          className="w-full text-left px-3 py-2 text-sm rounded-lg hover:bg-secondary flex items-center gap-2 transition-colors"
                        >
                           <User className="w-4 h-4 text-muted-foreground" /> My Profile
                        </button>
                        <div className="h-px bg-border my-1" />
                        <button 
                          onClick={logout}
                          className="w-full text-left px-3 py-2 text-sm rounded-lg hover:bg-destructive/10 text-destructive flex items-center gap-2 transition-colors"
                        >
                           <LogOut className="w-4 h-4" /> Logout
                        </button>
                     </div>
                   </motion.div>
                 </>
               )}
             </AnimatePresence>
          </div>
        </div>
      </header>

      <ProfileDialog 
        open={profileOpen} 
        onOpenChange={setProfileOpen} 
        user={user} 
        onUpdate={fetchUser} 
      />
    </>
  )
}
