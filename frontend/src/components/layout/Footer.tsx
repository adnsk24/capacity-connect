import React from "react"
import { Link } from "react-router-dom"
import { Phone, Mail, MapPin } from "lucide-react"

export const Footer: React.FC = () => {
  return (
    <footer className="relative bg-[#214FA8] text-white overflow-hidden border-t-4 border-[#082B73]">
      {/* Background Decorative Concentric Rings (Matching Reference Screenshot) */}
      <div
        className="absolute inset-0 pointer-events-none opacity-15 overflow-hidden"
        aria-hidden="true"
      >
        <svg
          className="absolute -top-32 -left-32 w-[650px] h-[650px] text-white"
          viewBox="0 0 600 600"
          fill="none"
          stroke="currentColor"
          strokeWidth="1.5"
        >
          <circle cx="300" cy="300" r="100" />
          <circle cx="300" cy="300" r="180" />
          <circle cx="300" cy="300" r="260" />
          <circle cx="300" cy="300" r="340" />
        </svg>
        <svg
          className="absolute -bottom-48 right-0 w-[700px] h-[700px] text-white"
          viewBox="0 0 600 600"
          fill="none"
          stroke="currentColor"
          strokeWidth="1.5"
        >
          <circle cx="300" cy="300" r="120" />
          <circle cx="300" cy="300" r="220" />
          <circle cx="300" cy="300" r="320" />
        </svg>
      </div>

      <div className="relative z-10 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pt-12 pb-10">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-12 gap-8 lg:gap-10 pb-10 border-b border-blue-400/30">
          {/* COLUMN 1: Official IMD Emblem + Portal Identity + Visitor Counter (Cols 1-4) */}
          <div className="lg:col-span-4 space-y-4">
            <div className="flex items-center gap-3.5">
              <img
                src="/branding/IMD_logo.png"
                alt="India Meteorological Department Emblem"
                className="h-16 w-auto object-contain bg-white/95 rounded-sm p-1 shadow-md"
              />
              <div>
                <div className="text-[17px] font-extrabold tracking-tight text-white leading-tight">
                  CAPACITY CONNECT
                </div>
                <div className="text-[12px] font-bold text-blue-200 leading-tight mt-0.5">
                  India Meteorological Department
                </div>
                <div className="text-[10px] text-blue-100/80 leading-tight">
                  Ministry of Earth Sciences
                </div>
              </div>
            </div>

            <p className="text-[12px] text-blue-100/90 leading-relaxed">
              Digital Capacity Building &amp; Learning Management Portal engineered for meteorological professionals, observational cadres, and operational forecasting specialists across India.
            </p>

            {/* Connect on Social Media Pill Button (Matching Reference Screenshot) */}
            <div>
              <a
                href="#about"
                className="inline-flex items-center justify-center px-4 py-1.5 rounded-full border border-white/60 text-white hover:bg-white hover:text-[#214FA8] text-xs font-semibold transition-colors"
              >
                Connect on Portal &amp; Social Media
              </a>
            </div>

            {/* Last Updated Pill (Matching Reference Screenshot) */}
            <div className="inline-block px-3 py-1 rounded-full bg-blue-950/40 text-blue-100 text-[11px] font-medium border border-blue-400/30">
              Last Updated: September 28, 2026
            </div>

            {/* Government Visitor Counter (Matching Reference Screenshot) */}
            <div className="flex items-center gap-2 pt-1">
              <span className="text-xs font-bold text-blue-100">Visitor:</span>
              <div className="flex items-center gap-0.5 font-mono text-xs font-bold">
                {["4", "7", "6", "5", "5", "3", "3"].map((digit, idx) => (
                  <span
                    key={idx}
                    className="w-5 h-6 bg-black/85 text-white flex items-center justify-center rounded-2xs border border-white/20 shadow-inner"
                  >
                    {digit}
                  </span>
                ))}
              </div>
            </div>
          </div>

          {/* COLUMN 2: Capacity Connect Platform Links (Cols 5-6) */}
          <div className="lg:col-span-2 space-y-3">
            <h4 className="text-sm font-extrabold tracking-wide uppercase text-white border-b border-white/20 pb-1.5">
              Capacity Connect
            </h4>
            <ul className="space-y-2 text-[13px] text-blue-100">
              <li>
                <a href="#about" className="hover:text-white hover:underline transition-colors">
                  About Us
                </a>
              </li>
              <li>
                <Link to="/courses" className="hover:text-white hover:underline transition-colors">
                  Courses &amp; Syllabi
                </Link>
              </li>
              <li>
                <a href="#learning" className="hover:text-white hover:underline transition-colors">
                  Learning Modules
                </a>
              </li>
              <li>
                <a href="#competency" className="hover:text-white hover:underline transition-colors">
                  Competency Intelligence
                </a>
              </li>
              <li>
                <a href="#lifecycle" className="hover:text-white hover:underline transition-colors">
                  Training Lifecycle
                </a>
              </li>
              <li>
                <a href="#resources" className="hover:text-white hover:underline transition-colors">
                  Meteorological Resources
                </a>
              </li>
            </ul>
          </div>

          {/* COLUMN 3: Useful Links (Cols 7-9) */}
          <div className="lg:col-span-3 space-y-3">
            <h4 className="text-sm font-extrabold tracking-wide uppercase text-white border-b border-white/20 pb-1.5">
              Useful Links
            </h4>
            <ul className="space-y-2 text-[13px] text-blue-100">
              <li>
                <Link to="/health" className="hover:text-white hover:underline transition-colors">
                  System Health &amp; Diagnostics
                </Link>
              </li>
              <li>
                <a href="#about" className="hover:text-white hover:underline transition-colors">
                  Frequently Asked Questions (FAQ)
                </a>
              </li>
              <li>
                <a href="#about" className="hover:text-white hover:underline transition-colors">
                  Accessibility Statement
                </a>
              </li>
              <li>
                <Link to="/verify-email" className="hover:text-white hover:underline transition-colors">
                  Email Verification
                </Link>
              </li>
              <li>
                <a href="#about" className="hover:text-white hover:underline transition-colors">
                  Website Privacy Policy
                </a>
              </li>
              <li>
                <a href="#about" className="hover:text-white hover:underline transition-colors">
                  Terms &amp; Cadre Guidelines
                </a>
              </li>
            </ul>
          </div>

          {/* COLUMN 4: Institutional Connect & Headquarters (Cols 10-12) */}
          <div className="lg:col-span-3 space-y-3">
            <h4 className="text-sm font-extrabold tracking-wide uppercase text-white border-b border-white/20 pb-1.5">
              Connect with Us
            </h4>
            <div className="space-y-2.5 text-[12px] text-blue-100 leading-relaxed">
              <div className="flex items-start gap-2">
                <MapPin className="h-4 w-4 shrink-0 text-blue-300 mt-0.5" />
                <span>
                  India Meteorological Department, Mausam Bhavan, Lodhi Road, New Delhi - 110003, India
                </span>
              </div>
              <div className="flex items-center gap-2">
                <Phone className="h-4 w-4 shrink-0 text-blue-300" />
                <span>
                  <strong>Helpline:</strong> 011-24611060 / 1800-180-1717
                </span>
              </div>
              <div className="flex items-center gap-2">
                <Mail className="h-4 w-4 shrink-0 text-blue-300" />
                <span>
                  <strong>Email:</strong> capacity.connect@imd.gov.in
                </span>
              </div>
            </div>

            {/* National Portal Representation Badge */}
            <div className="pt-2">
              <div className="inline-flex items-center gap-2 bg-white text-slate-800 px-3 py-1.5 rounded text-xs font-bold shadow-xs">
                <span className="text-sm">🇮🇳</span>
                <span className="text-[11px] tracking-tight">The National Portal of India: <strong>india.gov.in</strong></span>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* ======================================================== */}
      {/* FOOTER BOTTOM BAR (Darker Blue Strip #163B82)            */}
      {/* ======================================================== */}
      <div className="bg-[#163B82] py-4 text-[12px] text-blue-200 border-t border-blue-900/50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 flex flex-col md:flex-row items-center justify-between gap-3 text-center md:text-left">
          <div>
            &copy; {new Date().getFullYear()} Capacity Connect — India Meteorological Department, Ministry of Earth Sciences. All rights reserved.
          </div>
          <div className="flex flex-wrap items-center justify-center gap-4 text-xs font-medium text-blue-100">
            <a href="#about" className="hover:text-white transition-colors">Terms and Conditions</a>
            <span className="text-blue-400">|</span>
            <a href="#about" className="hover:text-white transition-colors">Feedback</a>
            <span className="text-blue-400">|</span>
            <a href="#about" className="hover:text-white transition-colors">Accessibility</a>
          </div>
        </div>
      </div>
    </footer>
  )
}
