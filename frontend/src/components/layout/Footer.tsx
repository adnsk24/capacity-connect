import React from "react"

export const Footer: React.FC = () => {
  return (
    <footer className="border-t border-slate-200 bg-white py-6">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 flex flex-col md:flex-row items-center justify-between gap-4">
        <div className="flex items-center gap-2">
          <div className="w-6 h-6 rounded bg-[#1557A6] flex items-center justify-center flex-shrink-0">
            <svg width="12" height="12" viewBox="0 0 24 24" fill="none" className="text-white">
              <circle cx="12" cy="12" r="3" fill="currentColor"/>
              <path d="M12 2v4M12 18v4M2 12h4M18 12h4" stroke="currentColor" strokeWidth="2" strokeLinecap="round"/>
            </svg>
          </div>
          <span className="text-[13px] font-semibold text-slate-700">Capacity Connect</span>
          <span className="text-slate-300">·</span>
          <span className="text-[13px] text-slate-500">Digital Capacity Building &amp; Learning Management Portal</span>
        </div>
        <div className="text-[12px] text-slate-400 text-center md:text-right">
          <div>India Meteorological Department · Ministry of Earth Sciences · Govt. of India</div>
          <div className="mt-0.5">Built on PostgreSQL · FastAPI · React · Zero cost infrastructure</div>
        </div>
      </div>
    </footer>
  )
}
