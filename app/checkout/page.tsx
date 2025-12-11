"use client"

import { useEffect, useState } from "react"
import { useRouter } from "next/navigation"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Card, CardContent, CardHeader, CardTitle, CardFooter } from "@/components/ui/card"
import { Loader2, CheckCircle, ArrowLeft, CreditCard, Wallet, MapPin } from "lucide-react"
import { cn } from "@/lib/utils"

export default function CheckoutPage() {
  const router = useRouter()
  const [items, setItems] = useState<any[]>([])
  const [loading, setLoading] = useState(false)
  const [street, setStreet] = useState("")
  const [city, setCity] = useState("Kolkata")
  const [zip, setZip] = useState("")
  const [estimate, setEstimate] = useState<{distanceKm: number, deliveryFee: number} | null>(null)
  const [orderId, setOrderId] = useState<string | null>(null)

  useEffect(() => {
    const stored = localStorage.getItem("cart_items")
    if (stored) {
      setItems(JSON.parse(stored))
    } else {
      router.push("/dashboard")
    }
  }, [router])

  const checkPrice = async () => {
    if (!zip || zip.length < 6) return
    try {
      const res = await fetch("/api/orders/estimate", {
        method: "POST",
        body: JSON.stringify({ deliveryAddress: { zip, street, city } }),
        headers: { "Content-Type": "application/json" }
      })
      const data = await res.json()
      if (data.success) {
        setEstimate(data.estimate)
      } else {
        alert(data.error || "Delivery not available in this area")
        setEstimate(null)
      }
    } catch(e) {}
  }

  const placeOrder = async () => {
    setLoading(true)
    try {
       const token = localStorage.getItem("token")
       const deliveryAddress = { street, city, zip, location: { lat: 0, lng: 0 } }
       
       const res = await fetch("/api/orders", {
        method: "POST",
        body: JSON.stringify({
          items,
          deliveryAddress,
          paymentMethod: 'COD'
        }),
        headers: { 
          "Content-Type": "application/json",
          "Authorization": `Bearer ${token}`
        }
       })
       
       const data = await res.json()
       if (data.success) {
         setOrderId(data.order._id)
         localStorage.removeItem("cart_items")
       } else {
         alert(data.error)
       }

    } catch(e) {
      alert("Failed to place order")
    } finally {
      setLoading(false)
    }
  }

  if (orderId) {
    return (
      <div className="min-h-screen flex flex-col items-center justify-center p-6 text-center space-y-6 bg-gradient-to-b from-green-50 to-white dark:from-slate-900 dark:to-slate-950">
        <div className="w-24 h-24 bg-green-100 rounded-full flex items-center justify-center mb-4 animate-in zoom-in duration-500">
             <CheckCircle className="w-12 h-12 text-green-600" />
        </div>
        <h1 className="text-4xl font-extrabold tracking-tight">Order Confirmed!</h1>
        <p className="text-muted-foreground text-lg max-w-sm">
           Your bibs are on the way. Tracking ID: <br/><span className="font-mono font-bold text-foreground">#{orderId.slice(-6)}</span>
        </p>
        <div className="grid gap-3 w-full max-w-xs pt-8">
          <Button size="lg" className="w-full shadow-lg shadow-green-500/20" onClick={() => router.push(`/tracking/${orderId}`)}>Track Order</Button>
          <Button variant="ghost" className="w-full" onClick={() => router.push("/dashboard")}>Back to Home</Button>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gray-50/50 dark:bg-slate-950 p-4 md:p-8">
      <div className="max-w-5xl mx-auto">
        <Button variant="ghost" className="mb-6 pl-0 hover:pl-2 transition-all" onClick={() => router.push("/dashboard")}>
           <ArrowLeft className="mr-2 h-4 w-4" /> Back to Dashboard
        </Button>
        
        <h1 className="text-3xl font-bold mb-8">Checkout</h1>
        
        <div className="grid md:grid-cols-3 gap-8">
          {/* Left Column: Address */}
          <div className="md:col-span-2 space-y-6">
            <Card className="border-0 shadow-lg">
               <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <MapPin className="w-5 h-5 text-primary" /> Delivery Details
                  </CardTitle>
               </CardHeader>
               <CardContent className="space-y-4">
                 <div className="grid gap-4">
                   <div className="space-y-2">
                     <label className="text-sm font-medium">Street Address</label>
                     <Input 
                       value={street} onChange={e => setStreet(e.target.value)} 
                       placeholder="Flat No, Building, Street Area" 
                       className="h-11 bg-muted/50"
                     />
                   </div>
                   <div className="grid grid-cols-2 gap-4">
                     <div className="space-y-2">
                       <label className="text-sm font-medium">City</label>
                       <Input value={city} disabled className="h-11 bg-muted" />
                     </div>
                     <div className="space-y-2">
                       <label className="text-sm font-medium">PIN Code</label>
                       <Input 
                         value={zip} onChange={e => setZip(e.target.value)} 
                         placeholder="700xxx" 
                         onBlur={checkPrice} 
                         className="h-11 bg-muted/50"
                         maxLength={6}
                       />
                     </div>
                   </div>
                 </div>
               </CardContent>
            </Card>

            <Card className="border-0 shadow-lg opacity-50 relative overflow-hidden">
               <div className="absolute inset-0 bg-gray-100/50 z-10 flex items-center justify-center font-bold text-muted-foreground">
                 Card Payment (Coming Soon)
               </div>
               <CardHeader><CardTitle className="flex items-center gap-2"><CreditCard className="w-5 h-5" /> Payment Method</CardTitle></CardHeader>
               <CardContent>
                  <div className="flex gap-4">
                     <div className="border p-4 rounded flex flex-col items-center gap-2 w-32 bg-secondary">
                        <Wallet className="w-6 h-6" />
                        <span className="text-xs font-bold">COD</span>
                     </div>
                  </div>
               </CardContent>
            </Card>
          </div>

          {/* Right Column: Order Summary */}
          <div className="md:col-span-1">
             <Card className="sticky top-6 border-0 shadow-xl bg-slate-900 text-white dark:bg-slate-800">
                <CardHeader className="border-b border-white/10 pb-4">
                   <CardTitle>Order Summary</CardTitle>
                </CardHeader>
                <CardContent className="pt-6 space-y-4">
                   {items.map((item, idx) => (
                     <div key={idx} className="flex justify-between text-sm">
                       <span className="text-slate-300">BIB {item.bibNumber}</span>
                       <span className="font-mono">₹ --</span>
                     </div>
                   ))}
                   
                   <div className="border-t border-white/10 pt-4 space-y-2">
                      <div className="flex justify-between text-sm">
                         <span className="text-slate-400">Delivery Fee</span>
                         <span className={cn(estimate ? "text-white" : "text-slate-500 italic")}>
                           {estimate ? `₹${estimate.deliveryFee}` : "Enter PIN"}
                         </span>
                      </div>
                      <div className="flex justify-between text-xl font-bold pt-2">
                         <span>Total</span>
                         <span>₹{estimate ? estimate.deliveryFee : 0}</span>
                      </div>
                   </div>
                </CardContent>
                <CardFooter>
                   <Button 
                      className="w-full h-12 text-lg bg-white text-black hover:bg-gray-100 shadow-lg shadow-white/10"
                      disabled={!estimate || !street || loading}
                      onClick={placeOrder}
                   >
                      {loading ? <Loader2 className="animate-spin" /> : "Confirm Order"}
                   </Button>
                </CardFooter>
             </Card>
          </div>
        </div>
      </div>
    </div>
  )
}
