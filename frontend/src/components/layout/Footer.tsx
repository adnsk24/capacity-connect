import React from "react"
import { Link } from "react-router-dom"

export const Footer: React.FC = () => {
  return (
    <footer className="border-t border-slate-200 bg-white pt-10 pb-8 text-slate-600">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="grid grid-cols-1 md:grid-cols-12 gap-8 pb-8 border-b border-slate-200">
          {/* LEFT: Institutional Emblem & Branding */}
          <div className="md:col-span-6 space-y-3">
            <div className="flex items-center gap-3">
              <img
                src="/branding/IMD_logo.png"
                alt="India Meteorological Department Emblem"
                className="h-12 w-auto object-contain flex-shrink-0"
              />
              <div>
                <div className="text-[15px] font-bold text-slate-900 tracking-tight leading-tight">
                  CAPACITY CONNECT
                </div>
                <div className="text-[12px] font-semibold text-[#1557A6] leading-tight">
                  India Meteorological Department
                </div>
              </div>
            </div>
            <p className="text-[12px] text-slate-500 leading-relaxed max-w-md">
              Digital Capacity Building &amp; Learning Management Portal engineered for meteorological professionals, observational cadres, and forecasting specialists across regional meteorological centers.
            </p>
          </div>

          {/* MIDDLE: Platform Links */}
          <div className="md:col-span-3 space-y-2">
            <div className="text-[12px] font-bold uppercase tracking-wider text-slate-900">
              Platform
            </div>
            <ul className="space-y-1.5 text-[13px]">
              <li>
                <Link to="/courses" className="text-slate-600 hover:text-[#1557A6] transition-colors">
                  Courses &amp; Syllabi
                </Link>
              </li>
              <li>
                <a href="/#competency" className="text-slate-600 hover:text-[#1557A6] transition-colors">
                  Competency Framework
                </a>
              </li>
              <li>
                <a href="/#lifecycle" className="text-slate-600 hover:text-[#1557A6] transition-colors">
                  Learning Lifecycle
                </a>
              </li>
              <li>
                <a href="/#resources" className="text-slate-600 hover:text-[#1557A6] transition-colors">
                  Meteorological Resources
                </a>
              </li>
            </ul>
          </div>

          {/* RIGHT: Account & Support */}
          <div className="md:col-span-3 space-y-2">
            <div className="text-[12px] font-bold uppercase tracking-wider text-slate-900">
              Account
            </div>
            <ul className="space-y-1.5 text-[13px]">
              <li>
                <Link to="/login" className="text-slate-600 hover:text-[#1557A6] transition-colors">
                  Sign In
                </Link>
              </li>
              <li>
                <Link to="/register" className="text-slate-600 hover:text-[#1557A6] transition-colors">
                  Register Account
                </Link>
              </li>
              <li>
                <Link to="/verify-email" className="text-slate-600 hover:text-[#1557A6] transition-colors">
                  Verify Email Token
                </Link>
              </li>
              <li>
                <Link to="/health" className="text-slate-600 hover:text-[#1557A6] transition-colors">
                  Help &amp; System Health
                </Link>
              </li>
            </ul>
          </div>
        </div>

        {/* BOTTOM: Copyright & Disclaimer */}
        <div className="pt-6 flex flex-col sm:flex-row items-center justify-between text-[12px] text-slate-400 gap-3">
          <div>
            &copy; {new Date().getFullYear()} Capacity Connect — Digital Capacity Building &amp; Learning Management Portal for IMD.
          </div>
          <div className="flex items-center gap-4 text-slate-500">
            <span>Operational Cadre Portal</span>
            <span>•</span>
            <span>Version 0.1.0</span>
          </div>
        </div>
      </div>
    </footer>
  )
}
