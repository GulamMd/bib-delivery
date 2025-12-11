"use client"

import { useState } from "react"
import { useRouter } from "next/navigation"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card"
import { Loader2, Lock, Mail } from "lucide-react"

export function StaffLoginForm({ roleLabel, redirectPath }: { roleLabel: string, redirectPath: string }) {
  const router = useRouter()
  const [email, setEmail] = useState("")
  const [password, setPassword] = useState("")
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState("")

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault()
    // ... same login logic
    setLoading(true)
    setError("")
    try {
      const res = await fetch("/api/auth/login", {
        method: "POST",
        body: JSON.stringify({ email, password }),
        headers: { "Content-Type": "application/json" }
      })
      const data = await res.json()
      if (res.ok) {
        localStorage.setItem("token", data.token)
        localStorage.setItem("user", JSON.stringify(data.user))
        router.push(redirectPath)
      } else {
        setError(data.error || "Login Failed")
      }
    } catch (err) {
      setError("Network error")
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50 p-4 relative overflow-hidden">
      {/* Background decoration */}
      <div className="absolute inset-0 bg-gradient-to-br from-indigo-50 to-slate-100 dark:from-slate-900 dark:to-slate-800 -z-10" />
      <div className="absolute top-[-10%] right-[-5%] w-96 h-96 bg-primary/10 rounded-full blur-3xl" />
      <div className="absolute bottom-[-10%] left-[-5%] w-96 h-96 bg-purple-500/10 rounded-full blur-3xl" />

      <Card className="w-full max-w-md shadow-xl border-white/20 glass">
        <CardHeader className="text-center pb-2">
          <CardTitle className="text-2xl font-bold">{roleLabel} Portal</CardTitle>
          <CardDescription>Secure login for staff and partners</CardDescription>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleLogin} className="space-y-4">
            <div className="space-y-2">
              <label className="text-sm font-medium ml-1">Email Address</label>
              <div className="relative">
                <Mail className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
                <Input type="email" value={email} onChange={e => setEmail(e.target.value)} required className="pl-10" placeholder="name@company.com" />
              </div>
            </div>
            <div className="space-y-2">
              <label className="text-sm font-medium ml-1">Password</label>
              <div className="relative">
                 <Lock className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
                 <Input type="password" value={password} onChange={e => setPassword(e.target.value)} required className="pl-10" placeholder="••••••••" />
              </div>
            </div>
            {error && <p className="text-sm text-destructive text-center bg-destructive/10 p-2 rounded">{error}</p>}
            <Button type="submit" className="w-full h-11" disabled={loading}>
              {loading ? <Loader2 className="animate-spin" /> : "Sign In"}
            </Button>
          </form>
        </CardContent>
      </Card>
      
      <div className="absolute bottom-4 text-center text-xs text-muted-foreground">
        Protected System. Unauthorized access is prohibited.
      </div>
    </div>
  )
}
