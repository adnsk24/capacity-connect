import React, { useState } from "react"
import { Outlet } from "react-router-dom"
import { TrainerSidebar } from "./TrainerSidebar"
import { TraineeTopBar } from "./TraineeTopBar"

export const TrainerLayout: React.FC = () => {
  const [sidebarOpen, setSidebarOpen] = useState(false)

  return (
    <div className="min-h-screen bg-[#F7F9FC] flex text-slate-900">
      {/* Sidebar Navigation */}
      <TrainerSidebar isOpen={sidebarOpen} onClose={() => setSidebarOpen(false)} />

      {/* Main Content Area */}
      <div className="flex-1 flex flex-col min-w-0 lg:pl-60">
        <TraineeTopBar onToggleSidebar={() => setSidebarOpen((prev) => !prev)} />
        <main className="flex-1 p-5 sm:p-6 max-w-7xl w-full mx-auto cc-fade-in">
          <Outlet />
        </main>
      </div>
    </div>
  )
}
