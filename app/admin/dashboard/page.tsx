"use client"

import { useEffect, useState } from "react"
import { useRouter } from "next/navigation"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Loader2, Truck, User } from "lucide-react"

export default function AdminDashboard() {
  const router = useRouter()
  const [orders, setOrders] = useState<any[]>([])
  const [loading, setLoading] = useState(true)
  
  // Delivery Person Assign State
  // For demo, we are just inputting ID or selecting from a Mock list.
  // Ideally, we fetch users with role='delivery'. I'll just put a text input for ID for now.
  const [assignOrderId, setAssignOrderId] = useState<string | null>(null)
  const [deliveryPersonId, setDeliveryPersonId] = useState("")

  useEffect(() => {
    fetchOrders()
  }, [])

  const fetchOrders = async () => {
    try {
       const token = localStorage.getItem("token")
       if (!token) return router.push("/admin/login")

       const res = await fetch("/api/orders/manage", {
         headers: { Authorization: `Bearer ${token}` }
       })
       const data = await res.json()
       if (data.success) {
         setOrders(data.orders)
       } else {
         if (data.error === "Forbidden") router.push("/")
       }
    } catch(e) {} finally {
      setLoading(false)
    }
  }

  const handleAssign = async () => {
    if (!assignOrderId || !deliveryPersonId) return;
    try {
      const token = localStorage.getItem("token")
      const res = await fetch("/api/orders/manage", {
        method: "POST",
        body: JSON.stringify({ orderId: assignOrderId, deliveryPersonId }),
        headers: { 
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}` 
        }
      })
      if (res.ok) {
        setAssignOrderId(null)
        setDeliveryPersonId("")
        fetchOrders()
      } else {
        alert("Failed to assign")
      }
    } catch(e) {}
  }

  return (
    <div className="min-h-screen bg-background p-6">
       <div className="max-w-6xl mx-auto space-y-6">
         <div className="flex justify-between items-center">
            <h1 className="text-3xl font-bold tracking-tight">Admin Dashboard</h1>
            <Button variant="outline" onClick={() => router.push("/")}>Logout</Button>
         </div>
         
         <div className="grid gap-6">
            <Card className="border border-border shadow-sm">
              <CardHeader><CardTitle>Manage Orders</CardTitle></CardHeader>
              <CardContent>
                {loading ? <div className="flex justify-center p-8"><Loader2 className="animate-spin text-primary" /></div> : (
                   <div className="space-y-4">
                     {orders.map((order) => (
                       <div key={order._id} className="flex flex-col md:flex-row justify-between items-start md:items-center p-4 border border-border rounded-xl shadow-sm bg-card transition-all hover:border-primary/50">
                         <div>
                            <p className="font-bold">Order #{order._id.slice(-6)}</p>
                            <p className="text-sm text-muted-foreground">{order.customer?.name || "Customer"} - {order.deliveryAddress.street}, {order.deliveryAddress.zip}</p>
                            <p className="text-xs mt-1">Status: <span className="font-semibold">{order.status}</span></p>
                         </div>
                         <div className="mt-4 md:mt-0 flex items-center gap-4">
                            {order.deliveryPerson ? (
                              <div className="text-sm text-right">
                                <p className="font-medium text-primary flex items-center gap-1">
                                   <Truck className="w-3 h-3" /> {order.deliveryPerson.name}
                                </p>
                                <p className="text-xs text-muted-foreground">{order.deliveryPerson.mobile}</p>
                              </div>
                            ) : (
                              <div className="flex items-center gap-2">
                                 {assignOrderId === order._id ? (
                                   <>
                                     <input 
                                       className="border rounded px-2 py-1 text-sm w-32" 
                                       placeholder="Deliv Person ID" 
                                       value={deliveryPersonId}
                                       onChange={e => setDeliveryPersonId(e.target.value)}
                                     />
                                     <Button size="sm" onClick={handleAssign}>Save</Button>
                                     <Button size="sm" variant="ghost" onClick={() => setAssignOrderId(null)}>X</Button>
                                   </>
                                 ) : (
                                   <Button size="sm" onClick={() => setAssignOrderId(order._id)}>Assign</Button>
                                 )}
                              </div>
                            )}
                         </div>
                       </div>
                     ))}
                     {orders.length === 0 && <p className="text-muted-foreground">No orders found.</p>}
                   </div>
                )}
              </CardContent>
            </Card>
         </div>
       </div>
    </div>
  )
}
