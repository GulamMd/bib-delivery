"use client";

import { useEffect, useState } from "react";
import { useParams, useRouter } from "next/navigation";
import { 
  CheckCircle2, 
  MapPin, 
  Package, 
  Truck, 
  User, 
  Phone,
  Copy,
  ChevronLeft,
  Clock
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import dynamic from "next/dynamic";
import { calculateDeliveryFee } from "@/lib/pricing"; 

const TrackingMap = dynamic(() => import("./TrackingMap"), { ssr: false, loading: () => <div className="h-full w-full bg-muted animate-pulse flex items-center justify-center">Loading Map...</div> });

// Mapping OrderStatuses to UI steps
const STEPS = [
  { status: "Order Created", label: "Order Placed", icon: Package, description: "We have received your order." },
  { status: "Assigned", label: "Agent Assigned", icon: User, description: "A delivery partner has been assigned." },
  { status: "Picked From Organizer", label: "In Transit", icon: Truck, description: "Order picked up from organizer." },
  { status: "Out For Delivery", label: "Out for Delivery", icon: MapPin, description: "Agent is near your location." },
  { status: "Delivered", label: "Delivered", icon: CheckCircle2, description: "Package delivered successfully." },
];

export default function TrackingPage() {
  const params = useParams();
  const router = useRouter();
  const [order, setOrder] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  const fetchOrder = async () => {
    try {
      const token = localStorage.getItem("token");
      if (!token) {
        router.push("/auth/login"); // Redirect if not logged in
        return;
      }
      
      const res = await fetch(`/api/orders/${params.id}`, {
        headers: { Authorization: `Bearer ${token}` }
      });
      
      if (!res.ok) {
        if (res.status === 401) router.push("/auth/login");
        throw new Error("Failed to fetch order");
      }

      const data = await res.json();
      if (data.success) {
        setOrder(data.order);
      } else {
        setError(data.error || "Could not load order details");
      }
    } catch (e) {
      setError("Something went wrong");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchOrder();
    const interval = setInterval(fetchOrder, 10000); // Poll every 10s
    return () => clearInterval(interval);
  }, [params.id]);

  if (loading) return (
    <div className="min-h-screen flex items-center justify-center bg-background">
      <div className="flex flex-col items-center gap-4">
        <div className="w-10 h-10 border-4 border-primary border-t-transparent rounded-full animate-spin" />
        <p className="text-muted-foreground animate-pulse">Tracking your order...</p>
      </div>
    </div>
  );

  if (error || !order) return (
    <div className="min-h-screen flex flex-col items-center justify-center gap-4 p-4 text-center">
       <p className="text-destructive font-bold text-lg">{error || "Order not found"}</p>
       <Button onClick={() => router.push("/dashboard")}>Back to Dashboard</Button>
    </div>
  );

  // Determine active step index
  // Note: API returns status strings that might not match exactly if enum changed, be careful.
  // OrderSchema: CREATED, ASSIGNED, PICKED_FROM_ORGANIZER, OUT_FOR_DELIVERY, DELIVERED
  const currentStepIndex = STEPS.findIndex(s => s.status === order.status) !== -1 
    ? STEPS.findIndex(s => s.status === order.status) 
    : 0; 
  // If status is CANCELLED or FAILED, we might need special handling.
  const isCancelled = order.status === "Cancelled";
  const isFailed = order.status === "Delivery Failed";

  return (
    <div className="min-h-screen bg-muted/30 pb-12">
      {/* Header */}
      <header className="sticky top-0 z-10 bg-background/80 backdrop-blur-md border-b border-border shadow-sm">
        <div className="max-w-5xl mx-auto px-4 h-16 flex items-center justify-between">
            <Button variant="ghost" size="sm" onClick={() => router.push("/dashboard")} className="-ml-2">
                <ChevronLeft className="w-4 h-4 mr-1" /> Back
            </Button>
            <div className="font-semibold text-lg">Tracking Order</div>
            <div className="w-16" /> {/* Spacer */}
        </div>
      </header>

      <main className="max-w-5xl mx-auto p-4 md:p-8 space-y-8">
        
        {/* Order ID & Status Banner */}
        <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
            <div>
                 <h1 className="text-3xl font-bold tracking-tight">Order #{order._id.slice(-6).toUpperCase()}</h1>
                 <p className="text-muted-foreground text-sm flex items-center gap-2 mt-1">
                    <Clock className="w-3.5 h-3.5" /> Placed on {new Date(order.createdAt).toLocaleDateString()} at {new Date(order.createdAt).toLocaleTimeString()}
                 </p>
            </div>
            {isCancelled ? (
                <span className="inline-flex items-center rounded-full border px-4 py-1 text-sm font-semibold transition-colors focus:outline-none focus:ring-2 focus:ring-ring focus:ring-offset-2 border-transparent bg-destructive text-destructive-foreground hover:bg-destructive/80 text-lg">Cancelled</span>
            ) : isFailed ? (
                <span className="inline-flex items-center rounded-full border px-4 py-1 text-sm font-semibold transition-colors focus:outline-none focus:ring-2 focus:ring-ring focus:ring-offset-2 border-transparent bg-destructive text-destructive-foreground hover:bg-destructive/80 text-lg">Delivery Failed</span>
            ) : (
                <span className="inline-flex items-center rounded-full border px-4 py-1 text-sm font-semibold transition-colors focus:outline-none focus:ring-2 focus:ring-ring focus:ring-offset-2 border-transparent bg-primary text-primary-foreground hover:bg-primary/80 text-lg bg-green-600 hover:bg-green-700">
                    {order.status}
                </span>
            )}
        </div>

        <div className="grid lg:grid-cols-3 gap-8">
            
            {/* Left Column: Map & Timeline */}
            <div className="lg:col-span-2 space-y-6">
                
                {/* Map Card */}
                <Card className="overflow-hidden border-border shadow-sm">
                    <div className="h-[350px] w-full bg-muted relative">
                        <TrackingMap 
                            deliveryLocation={order.deliveryAddress.location} 
                            driverLocation={null} // TODO: Add driver location if available in order schema/updates
                        />
                         <div className="absolute bottom-4 left-4 right-4 bg-background/90 backdrop-blur border border-border p-3 rounded-lg shadow-lg flex items-center gap-3 max-w-sm">
                             <MapPin className="w-5 h-5 text-red-500 shrink-0" />
                             <div className="text-sm truncate">
                                 <p className="font-medium text-foreground">Delivery Address</p>
                                 <p className="text-muted-foreground truncate" title={order.deliveryAddress.street + ", " + order.deliveryAddress.city}>
                                     {order.deliveryAddress.street}, {order.deliveryAddress.city}
                                 </p>
                             </div>
                         </div>
                    </div>
                </Card>

                {/* Timeline Card */}
                <Card className="border-border shadow-sm">
                    <CardHeader>
                        <CardTitle>Delivery Progress</CardTitle>
                    </CardHeader>
                    <CardContent>
                        <div className="relative pl-6 border-l-2 border-muted space-y-8 my-2">
                             {STEPS.map((step, idx) => {
                                 const isCompleted = idx <= currentStepIndex;
                                 const isCurrent = idx === currentStepIndex;
                                 return (
                                     <div key={idx} className={`relative ${isCompleted ? 'opacity-100' : 'opacity-40'}`}>
                                         {/* Dot */}
                                         <div className={`absolute -left-[31px] top-0 w-4 h-4 rounded-full border-2 
                                            ${isCompleted ? 'bg-primary border-primary' : 'bg-background border-muted-foreground'}
                                            ${isCurrent ? 'ring-4 ring-primary/20 scale-110' : ''}
                                            transition-all
                                         `}>
                                            {isCompleted && <CheckCircle2 className="w-3 h-3 text-primary-foreground absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2" />}
                                         </div>
                                         
                                         <div className="flex items-start gap-4">
                                            <div className={`p-2 rounded-lg ${isCurrent ? 'bg-primary/10 text-primary' : 'bg-muted text-muted-foreground'}`}>
                                                <step.icon className="w-5 h-5" />
                                            </div>
                                            <div>
                                                <h4 className={`font-semibold ${isCurrent && 'text-primary'}`}>{step.label}</h4>
                                                <p className="text-sm text-muted-foreground">{step.description}</p>
                                                {/* Show timestamp if available in history? (Skipped for simplicity) */}
                                            </div>
                                         </div>
                                     </div>
                                 )
                             })}
                        </div>
                    </CardContent>
                </Card>
            </div>

            {/* Right Column: Details */}
            <div className="space-y-6">
                
                {/* OTP Card */}
                {!isCancelled && !isFailed && order.status !== "Delivered" && (
                    <Card className="bg-primary text-primary-foreground border-none shadow-lg shadow-primary/20 relative overflow-hidden">
                        <div className="absolute top-0 right-0 p-8 opacity-10">
                             <Package className="w-32 h-32" />
                        </div>
                        <CardHeader>
                            <CardTitle className="text-lg opacity-90">Secure Delivery OTP</CardTitle>
                            <CardDescription className="text-primary-foreground/70">Share this with the delivery partner upon arrival.</CardDescription>
                        </CardHeader>
                        <CardContent>
                             <div className="flex items-center justify-between bg-primary-foreground/10 rounded-lg p-4 backdrop-blur-sm">
                                  <span className="font-mono text-3xl font-bold tracking-widest">{order.deliveryOtp}</span>
                                  <Button 
                                    size="icon" 
                                    variant="ghost" 
                                    className="hover:bg-primary-foreground/20 text-primary-foreground"
                                    onClick={() => navigator.clipboard.writeText(order.deliveryOtp)}
                                  >
                                      <Copy className="w-5 h-5" />
                                  </Button>
                             </div>
                        </CardContent>
                    </Card>
                )}

                {/* Delivery Agent Card */}
                {order.deliveryPerson ? (
                    <Card>
                        <CardHeader>
                             <CardTitle className="text-base">
                                {order.status === "Delivered" ? "Delivered By" : "Delivery Partner"}
                             </CardTitle>
                        </CardHeader>
                        <CardContent className="flex items-center gap-4">
                            <div className="w-12 h-12 bg-muted rounded-full flex items-center justify-center">
                                <User className="w-6 h-6 text-muted-foreground" />
                            </div>
                            <div className="flex-1 overflow-hidden">
                                <p className="font-bold truncate">{order.deliveryPerson.name}</p>
                                <p className="text-sm text-muted-foreground">Bib Delivery Agent</p>
                            </div>
                            {order.status !== "Delivered" && (
                              <a href={`tel:${order.deliveryPerson.mobile}`}>
                                  <Button size="icon" variant="outline" className="rounded-full">
                                      <Phone className="w-4 h-4" />
                                  </Button>
                              </a>
                            )}
                        </CardContent>
                    </Card>
                ) : (
                    <Card>
                        <CardContent className="py-6 text-center text-muted-foreground text-sm">
                            {order.status === "Delivered" ? (
                                <div className="flex flex-col items-center gap-2">
                                    <CheckCircle2 className="w-8 h-8 text-green-600" />
                                    <p className="font-medium text-foreground">Order delivered successfully</p>
                                </div>
                            ) : isCancelled ? (
                                <p>This order was cancelled.</p>
                            ) : isFailed ? (
                                <p>Delivery attempt failed.</p>
                            ) : (
                                <p>Delivery partner will be assigned shortly.</p>
                            )}
                        </CardContent>
                    </Card>
                )}

                {/* Order Items Summary */}
                <Card>
                    <CardHeader>
                        <CardTitle className="text-base">Order Items</CardTitle>
                    </CardHeader>
                    <CardContent className="p-0">
                         <div className="h-[200px] overflow-auto">
                            <div className="divide-y divide-border">
                                {order.items.map((item: any, i: number) => (
                                    <div key={i} className="p-4 flex gap-4 hover:bg-muted/30 transition-colors">
                                        <div className="w-12 h-12 bg-muted rounded flex items-center justify-center text-xs font-bold text-muted-foreground shrink-0">
                                            BIB
                                        </div>
                                        <div>
                                            <p className="font-medium text-sm">{item.eventName}</p>
                                            <p className="text-xs text-muted-foreground">Bib #{item.bibNumber}</p>
                                        </div>
                                    </div>
                                ))}
                            </div>
                         </div>
                         <div className="p-4 border-t border-border bg-muted/20 space-y-2 text-sm">
                             <div className="flex justify-between">
                                 <span className="text-muted-foreground">Delivery Fee</span>
                                 <span>₹{order.deliveryFee}</span>
                             </div>
                             <div className="flex justify-between font-bold pt-2 border-t border-border/50">
                                 <span>Total</span>
                                 <span>₹{order.deliveryFee}</span>
                             </div>
                             <div className="flex justify-between text-xs text-muted-foreground pt-1">
                                 <span>Payment Method</span>
                                 <span>{order.paymentMethod}</span>
                             </div>
                         </div>
                    </CardContent>
                </Card>

            </div>
        </div>
      </main>
    </div>
  );
}
