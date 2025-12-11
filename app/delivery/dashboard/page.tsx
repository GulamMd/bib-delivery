"use client"

import { useEffect, useState } from "react"
import { useRouter } from "next/navigation"
import { Button } from "@/components/ui/button"
import { Card, CardContent } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { MapPin, Navigation, PackageCheck, CheckCircle } from "lucide-react"

export default function DeliveryDashboard() {
  const router = useRouter()
  const [tasks, setTasks] = useState<any[]>([])
  const [loading, setLoading] = useState(true)

  // Action State
  const [activeOrder, setActiveOrder] = useState<any>(null)
  const [actionType, setActionType] = useState<"PICKUP" | "DELIVER" | null>(null)
  const [code, setCode] = useState("") // PIN or OTP

  useEffect(() => {
    fetchTasks()
  }, [])

  const fetchTasks = async () => {
     try {
        const token = localStorage.getItem("token")
        if (!token) return router.push("/delivery/login")
        const res = await fetch("/api/orders/manage", { headers: { Authorization: `Bearer ${token}` } })
        const data = await res.json()
        if (data.success) setTasks(data.orders)
     } catch(e) {} finally { setLoading(false) }
  }

  const handleAction = async () => {
    try {
      const token = localStorage.getItem("token")
      const payload: any = { action: actionType }
      if (actionType === "PICKUP") payload.pin = code
      if (actionType === "DELIVER") payload.otp = code

      const res = await fetch(`/api/orders/${activeOrder._id}/actions`, {
        method: "POST",
        body: JSON.stringify(payload),
        headers: { "Content-Type": "application/json", Authorization: `Bearer ${token}` }
      })
      
      const data = await res.json()
      if (data.success) {
        alert("Success!")
        setActiveOrder(null)
        setActionType(null)
        setCode("")
        fetchTasks()
      } else {
        alert(data.error)
      }
    } catch(e) {
      alert("Error")
    }
  }

  if (activeOrder) {
    return (
      <div className="min-h-screen bg-gray-50 p-6 flex items-center justify-center">
         <Card className="w-full max-w-md">
            <CardContent className="pt-6 space-y-4">
              <h2 className="text-xl font-bold">{actionType === "PICKUP" ? "Enter Pickup PIN" : "Enter Delivery OTP"}</h2>
              <p className="text-sm text-muted-foreground">Order #{activeOrder._id.slice(-6)}</p>
              <Input 
                placeholder={actionType === "PICKUP" ? "Ask Organizer for PIN" : "Ask Customer for OTP"} 
                className="text-center text-lg tracking-widest"
                value={code}
                onChange={e => setCode(e.target.value)}
              />
              <div className="flex gap-2">
                <Button className="flex-1" onClick={handleAction}>Confirm</Button>
                <Button variant="secondary" onClick={() => { setActiveOrder(null); setCode("") }}>Cancel</Button>
              </div>
            </CardContent>
         </Card>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gray-50 pb-20">
       <header className="bg-primary text-primary-foreground p-4 sticky top-0 z-10">
         <div className="flex justify-between items-center">
           <h1 className="font-bold text-lg">Delivery Partner</h1>
           <Button variant="ghost" size="sm" onClick={() => router.push("/")}>Logout</Button>
         </div>
       </header>

       <main className="p-4 space-y-4">
          <h2 className="font-semibold text-muted-foreground">Assigned Tasks ({tasks.length})</h2>
          
          {tasks.map(task => (
            <Card key={task._id} className="relative">
              <CardContent className="p-4 space-y-2">
                 <div className="flex justify-between">
                    <span className="font-bold">#{task._id.slice(-6)}</span>
                    <span className="text-xs px-2 py-1 bg-secondary rounded">{task.status}</span>
                 </div>
                 
                 <div className="text-sm flex gap-2">
                   <MapPin className="w-4 h-4 text-muted-foreground" />
                   <p>{task.deliveryAddress.street}, {task.deliveryAddress.zip}</p>
                 </div>
                 
                 <div className="text-sm flex gap-2">
                   <Navigation className="w-4 h-4 text-muted-foreground" />
                   <a href={`https://www.google.com/maps/search/?api=1&query=${task.deliveryAddress.location?.lat},${task.deliveryAddress.location?.lng}`} target="_blank" className="text-primary underline">
                     Open in Maps
                   </a>
                 </div>

                 <div className="pt-4 flex gap-2">
                    {task.status === "Assigned" && (
                      <Button className="w-full" onClick={() => { setActiveOrder(task); setActionType("PICKUP") }}>
                        <PackageCheck className="mr-2 w-4 h-4" /> Confirm Pickup
                      </Button>
                    )}
                    {(task.status === "Picked From Organizer" || task.status === "Out For Delivery") && (
                      <Button className="w-full" onClick={() => { setActiveOrder(task); setActionType("DELIVER") }}>
                        <CheckCircle className="mr-2 w-4 h-4" /> Complete Delivery
                      </Button>
                    )}
                    {task.status === "Delivered" && (
                       <Button variant="secondary" disabled className="w-full opacity-50">Completed</Button>
                    )}
                 </div>
              </CardContent>
            </Card>
          ))}
       </main>
    </div>
  )
}
