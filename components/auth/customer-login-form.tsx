"use client"

import { useState } from "react"
import { useRouter } from "next/navigation"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card"
import { ArrowRight, Loader2, Smartphone, ShieldCheck } from "lucide-react"

export function CustomerLoginForm() {
  const router = useRouter()
  const [step, setStep] = useState<"MOBILE" | "OTP">("MOBILE")
  const [mobile, setMobile] = useState("")
  const [otp, setOtp] = useState("")
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState("")

  const handleSendOtp = async (e: React.FormEvent) => {
    e.preventDefault()
    setLoading(true)
    setError("")
    
    try {
      const res = await fetch("/api/auth/send-otp", {
        method: "POST",
        body: JSON.stringify({ mobile }),
        headers: { "Content-Type": "application/json" },
      })
      const data = await res.json()
      
      if (res.ok) {
        setStep("OTP")
        if (data.debug_otp) console.log("OTP:", data.debug_otp)
      } else {
        setError(data.error || "Failed to send OTP")
      }
    } catch (err) {
      setError("Network error")
    } finally {
      setLoading(false)
    }
  }

  const handleVerifyOtp = async (e: React.FormEvent) => {
    e.preventDefault()
    setLoading(true)
    setError("")

    try {
      const res = await fetch("/api/auth/verify-otp", {
        method: "POST",
        body: JSON.stringify({ mobile, otp }),
        headers: { "Content-Type": "application/json" },
      })
      const data = await res.json()

      if (res.ok) {
        localStorage.setItem("token", data.token)
        localStorage.setItem("user", JSON.stringify(data.user))
        router.push("/dashboard") 
      } else {
        setError(data.error || "Invalid OTP")
      }
    } catch (err) {
      setError("Network error")
    } finally {
      setLoading(false)
    }
  }

  return (
    <Card className="glass shadow-2xl border-white/20 dark:border-white/10 overflow-hidden">
      <div className="h-2 bg-gradient-to-r from-indigo-500 via-purple-500 to-pink-500" />
      <CardHeader className="space-y-1 pb-4">
        <CardTitle className="text-2xl font-bold text-center">
          {step === "MOBILE" ? "Get Started" : "Verify Mobile"}
        </CardTitle>
        <CardDescription className="text-center">
          {step === "MOBILE" ? "Enter your mobile number to access your bibs" : `We sent an OTP to ${mobile}`}
        </CardDescription>
      </CardHeader>
      <CardContent className="pb-6">
        {step === "MOBILE" ? (
          <form onSubmit={handleSendOtp} className="space-y-6">
            <div className="space-y-2">
              <div className="relative">
                 <Smartphone className="absolute left-3 top-3 h-5 w-5 text-muted-foreground" />
                 <Input
                  type="tel"
                  placeholder="Mobile Number"
                  value={mobile}
                  onChange={(e) => setMobile(e.target.value)}
                  required
                  className="pl-10 h-11 text-lg bg-background/50 border-input/50 focus:border-primary transition-all"
                />
              </div>
            </div>
            {error && <p className="text-sm text-destructive text-center bg-destructive/10 p-2 rounded">{error}</p>}
            <Button type="submit" className="w-full h-11 text-base font-semibold shadow-lg shadow-indigo-500/20" disabled={loading}>
              {loading ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : "Continue"}
              {!loading && <ArrowRight className="ml-2 h-4 w-4" />}
            </Button>
          </form>
        ) : (
          <form onSubmit={handleVerifyOtp} className="space-y-6">
            <div className="space-y-2">
               <div className="relative">
                 <ShieldCheck className="absolute left-3 top-3 h-5 w-5 text-muted-foreground" />
                 <Input
                  type="text"
                  placeholder="0000"
                  value={otp}
                  onChange={(e) => setOtp(e.target.value)}
                  required
                  className="pl-10 h-11 text-lg tracking-[0.5em] text-center bg-background/50 border-input/50 focus:border-primary transition-all font-mono"
                  maxLength={4}
                />
               </div>
            </div>
            {error && <p className="text-sm text-destructive text-center bg-destructive/10 p-2 rounded">{error}</p>}
            <Button type="submit" className="w-full h-11 text-base font-semibold shadow-lg shadow-indigo-500/20" disabled={loading}>
              {loading ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : "Verify & Login"}
            </Button>
            <Button 
              variant="ghost" 
              className="w-full text-xs text-muted-foreground hover:text-primary" 
              onClick={() => setStep("MOBILE")}
              type="button"
            >
              Entered wrong number?
            </Button>
          </form>
        )}
      </CardContent>
    </Card>
  )
}
