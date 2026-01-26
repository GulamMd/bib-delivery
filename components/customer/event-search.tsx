"use client"

import { useState, useEffect } from "react"
import { Input } from "@/components/ui/input"
import { Button } from "@/components/ui/button"
import { Card, CardContent } from "@/components/ui/card"
import { Search, MapPin, Calendar, ArrowRight, Loader2 } from "lucide-react"

export function EventSearch() {
  const [events, setEvents] = useState<any[]>([])
  const [loading, setLoading] = useState(true)
  const [search, setSearch] = useState("")

  useEffect(() => {
    fetchEvents()
  }, [])

  const fetchEvents = async () => {
    try {
      const res = await fetch("/api/events")
      const data = await res.json()
      if (data.success) {
        setEvents(data.events)
      }
    } catch (e) {
      console.error(e)
    } finally {
      setLoading(false)
    }
  }

  const filteredEvents = events.filter(e => 
    e.name.toLowerCase().includes(search.toLowerCase()) || 
    e.venue.toLowerCase().includes(search.toLowerCase())
  )

  const handleFindBib = () => {
    // Scroll to top or trigger the link mobile flow
    window.scrollTo({ top: 0, behavior: 'smooth' })
    // In a real app, this might pre-fill a form or filter the query
  }

  return (
    <section className="space-y-6 pt-10 border-t border-dashed border-border mt-10">
      <div className="flex flex-col md:flex-row justify-between items-end gap-4">
        <div>
          <h2 className="text-2xl font-bold tracking-tight">Find Your Event</h2>
          <p className="text-muted-foreground">Search through upcoming events supported by BibGo.</p>
        </div>
        <div className="relative w-full md:w-72">
           <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
           <Input 
             className="pl-9" 
             placeholder="Search events..." 
             value={search}
             onChange={e => setSearch(e.target.value)}
           />
        </div>
      </div>

      {loading ? (
        <div className="flex justify-center p-12"><Loader2 className="animate-spin text-primary" /></div>
      ) : (
        <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
          {filteredEvents.map(event => (
            <Card key={event._id} className="overflow-hidden hover:shadow-lg transition-shadow group border-border/60">
               {/* Event Image Placeholder / Color Banner */}
               <div className="h-32 bg-gradient-to-r from-blue-500/10 to-purple-500/10 relative">
                  <div className="absolute inset-0 bg-secondary/30" />
                  {/* If we had an image, <img src={event.image} ... /> */}
                  <div className="absolute bottom-4 left-4 font-bold text-3xl opacity-10 select-none">RUN</div>
               </div>
               <CardContent className="p-6">
                 <h3 className="font-bold text-xl mb-2 group-hover:text-primary transition-colors">{event.name}</h3>
                 
                 <div className="space-y-3 mb-6">
                   <div className="flex items-center gap-2 text-sm text-muted-foreground">
                      <Calendar className="w-4 h-4 text-primary" />
                      {new Date(event.date).toLocaleDateString(undefined, { dateStyle: 'long' })}
                   </div>
                   <div className="flex items-center gap-2 text-sm text-muted-foreground">
                      <MapPin className="w-4 h-4 text-primary" />
                      <span className="line-clamp-1">{event.venue}</span>
                   </div>
                 </div>

                 <Button className="w-full bg-secondary text-secondary-foreground hover:bg-secondary/80" onClick={handleFindBib}>
                    Find My Bib <ArrowRight className="w-4 h-4 ml-2" />
                 </Button>
               </CardContent>
            </Card>
          ))}
          {filteredEvents.length === 0 && !loading && (
             <div className="col-span-full text-center py-10 text-muted-foreground">
               No events found matching "{search}"
             </div>
          )}
        </div>
      )}
    </section>
  )
}
