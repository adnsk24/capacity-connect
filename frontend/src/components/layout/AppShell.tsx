import React from "react"
import { Outlet } from "react-router-dom"
import { Navbar } from "./Navbar"
import { Footer } from "./Footer"

export const AppShell: React.FC = () => {
  return (
    <div className="min-h-screen flex flex-col bg-[#F7F9FC] text-slate-900 antialiased">
      <Navbar />
      <main className="flex-1 flex flex-col">
        <Outlet />
      </main>
      <Footer />
    </div>
  )
}
