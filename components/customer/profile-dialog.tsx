"use client"

import { useState, useEffect } from "react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { motion, AnimatePresence } from "framer-motion"
import { X, User, Mail, Save, Loader2 } from "lucide-react"

interface ProfileDialogProps {
  open: boolean
  onOpenChange: (open: boolean) => void
  user: any
  onUpdate: () => void // Refresh parent data
}

export function ProfileDialog({ open, onOpenChange, user, onUpdate }: ProfileDialogProps) {
  const [formData, setFormData] = useState({
    name: "",
    email: ""
  })
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState("")

  useEffect(() => {
    if (user) {
      setFormData({
        name: user.name || "",
        email: user.email || ""
      })
    }
  }, [user])

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setLoading(true)
    setError("")

    try {
      const token = localStorage.getItem("token")
      const res = await fetch("/api/user", {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`
        },
        body: JSON.stringify(formData)
      })
      const data = await res.json()
      if (data.success) {
        onUpdate()
        onOpenChange(false)
      } else {
        setError(data.error || "Failed to update profile")
      }
    } catch (e) {
      setError("An error occurred")
    } finally {
      setLoading(false)
    }
  }

  return (
    <AnimatePresence>
      {open && (
        <>
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={() => onOpenChange(false)}
            className="fixed inset-0 bg-black/60 backdrop-blur-sm z-50"
          />
          <div className="fixed inset-0 flex items-center justify-center z-50 pointer-events-none">
            <motion.div
              initial={{ scale: 0.95, opacity: 0, y: 20 }}
              animate={{ scale: 1, opacity: 1, y: 0 }}
              exit={{ scale: 0.95, opacity: 0, y: 20 }}
              className="w-full max-w-md bg-background border border-border rounded-xl shadow-2xl overflow-hidden pointer-events-auto"
            >
              <div className="flex justify-between items-center p-6 border-b bg-secondary/20">
                <h2 className="text-xl font-bold flex items-center gap-2">
                  <User className="w-5 h-5 text-primary" /> Edit Profile
                </h2>
                <Button variant="ghost" size="sm" onClick={() => onOpenChange(false)} className="h-8 w-8 p-0 rounded-full">
                  <X className="w-4 h-4" />
                </Button>
              </div>

              <form onSubmit={handleSubmit} className="p-6 space-y-4">
                {error && <div className="p-3 text-sm text-destructive bg-destructive/10 rounded-md">{error}</div>}
                
                <div className="space-y-2">
                  <label className="text-sm font-medium flex items-center gap-2">
                    <User className="w-4 h-4 text-muted-foreground" /> Full Name
                  </label>
                  <Input 
                    value={formData.name} 
                    onChange={e => setFormData({...formData, name: e.target.value})} 
                    placeholder="John Doe" 
                  />
                </div>

                <div className="space-y-2">
                  <label className="text-sm font-medium flex items-center gap-2">
                    <Mail className="w-4 h-4 text-muted-foreground" /> Email Address
                  </label>
                  <Input 
                    type="email"
                    value={formData.email} 
                    onChange={e => setFormData({...formData, email: e.target.value})} 
                    placeholder="john@example.com" 
                  />
                </div>

                <div className="space-y-2">
                   <label className="text-sm font-medium text-muted-foreground">Mobile Number</label>
                   <div className="p-2 bg-secondary/50 rounded-md text-muted-foreground border border-transparent">
                      {user?.mobile || "N/A"} <span className="text-xs ml-2 opacity-70">(Read-only)</span>
                   </div>
                </div>

                <div className="pt-4 flex justify-end gap-2">
                  <Button type="button" variant="outline" onClick={() => onOpenChange(false)}>Cancel</Button>
                  <Button type="submit" disabled={loading} className="gap-2">
                    {loading ? <Loader2 className="w-4 h-4 animate-spin" /> : <Save className="w-4 h-4" />}
                    Save Changes
                  </Button>
                </div>
              </form>
            </motion.div>
          </div>
        </>
      )}
    </AnimatePresence>
  )
}
