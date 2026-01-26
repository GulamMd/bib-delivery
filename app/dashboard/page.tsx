"use client"

import { BibList } from "@/components/customer/bib-list"
import { EventSearch } from "@/components/customer/event-search"
import { DashboardHeader } from "@/components/layout/dashboard-header"

export default function DashboardPage() {
  return (
    <div className="min-h-screen bg-background pb-24">
       <DashboardHeader />

       <main className="max-w-7xl mx-auto px-6 py-8 space-y-8">
         <BibList />
         <EventSearch />
       </main>
    </div>
  )
}
