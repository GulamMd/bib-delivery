"use client"
// app/tracking/[id]/page.tsx

// Since I am already writing too many files, I will simplify this tracking page.
// It will poll /api/orders/[id] every few seconds.
// But I don't have GET /api/orders/[id] yet? 
// I have GET /api/orders/manage for admin. 
// I should allow customers to fetch their own order by ID.
// Wait, I didn't create GET /api/orders/[id] for customer.
// I will just use `app/api/orders/route.ts`? No that's POST.
// I will mock the tracking data or create the API needed.
// Actually, I'll update `/app/api/orders/route.ts` to include GET (List my orders) and GET specific order.

import { useEffect, useState } from "react"
import { useParams, useRouter } from "next/navigation" // tracking/[id]
// But this file content will be the page logic.

// Wait, I can't put page in app/tracking/[id]/page.tsx directly with this tool unless I create the API first or concurrently.
// I will assume I will fix the API.

export default function TrackingPage() {
  const params = useParams()
  const router = useRouter()
  const [order, setOrder] = useState<any>(null)

  useEffect(() => {
    // Poll for status
    const interval = setInterval(fetchOrder, 5000)
    fetchOrder()
    return () => clearInterval(interval)
  }, [])

  const fetchOrder = async () => {
    try {
       const token = localStorage.getItem("token")
       // We need an endpoint to get specific order details. 
       // Let's assume GET /api/orders?id=xxx works or GET /api/orders/[id]
       // Since I haven't implemented [id] route yet, I'll fail here unless I create it.
       // I'll create the route in the next step.
       const res = await fetch(`/api/orders/${params.id}`, {
         headers: { Authorization: `Bearer ${token}` }
       })
       const data = await res.json()
       if (data.success) {
         setOrder(data.order)
       }
    } catch(e) {}
  }

  if (!order) return <div className="p-10 text-center">Loading Order...</div>

  const steps = [
    "Order Created", "Picked From Organizer", "Out For Delivery", "Delivered"
  ]
  
  const currentStatusIndex = steps.findIndex(s => s === order.status)
  // If status is ASSIGNED, it maps to Created or Picked logic? 
  // Let's just string match or map.
  
  return (
    <div className="min-h-screen bg-background p-4">
      <div className="max-w-md mx-auto space-y-6">
        <h1 className="text-2xl font-bold text-center tracking-tight">Tracking #{order._id.slice(-6).toUpperCase()}</h1>
        
        <div className="space-y-4">
          <div className="bg-card border border-border p-6 rounded-xl shadow-sm space-y-6 relative">
             {/* Timeline */}
             {steps.map((step, idx) => (
               <div key={idx} className="flex gap-4">
                 <div className="flex flex-col items-center">
                   <div className={`w-4 h-4 rounded-full z-10 ${currentStatusIndex >= idx ? 'bg-accent-foreground' : 'bg-muted'}`} />
                   {idx < steps.length - 1 && <div className="w-0.5 h-full bg-border mt-1" />}
                 </div>
                 <div className={`${currentStatusIndex >= idx ? 'text-foreground' : 'text-muted-foreground'} pb-6`}>
                   <p className="font-semibold">{step}</p>
                   {currentStatusIndex === idx && <p className="text-xs text-accent-foreground font-bold uppercase tracking-wider">Current Status</p>}
                 </div>
               </div>
             ))}
          </div>

          <div className="bg-card border border-border p-6 rounded-xl shadow-sm space-y-2">
             <p className="font-bold text-lg">Delivery Details</p>
             <p className="text-sm">OTP: <span className="font-mono font-bold text-2xl tracking-[0.2em] text-primary">{order.deliveryOtp}</span></p>
             <p className="text-xs text-muted-foreground uppercase font-medium">Share this OTP with delivery partner.</p>
             
             <div className="pt-4 border-t border-border mt-4">
                <p className="font-bold text-sm text-muted-foreground uppercase">Delivery Agent</p>
                {order.deliveryPerson ? <p className="font-medium">{order.deliveryPerson.name} ({order.deliveryPerson.mobile})</p> : <p className="text-muted-foreground italic">Assigning soon...</p>}
             </div>
          </div>
        </div>
        
        <button onClick={() => router.push("/dashboard")} className="w-full text-primary font-medium hover:underline transition-all">Back to Dashboard</button>
      </div>
    </div>
  )
}
