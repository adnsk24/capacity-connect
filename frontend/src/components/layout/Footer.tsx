import React from "react"
import { Link } from "react-router-dom"
import { Container } from "./Container"

export const Footer: React.FC = () => {
  return (
    <footer className="w-full relative bg-[#2857B5] text-white overflow-hidden border-t-4 border-[#062B73]">
      {/* Background Decorative Meteorological Contour Rings (Matching Reference Screenshot) */}
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

      {/* Main 4-Column Footer Content aligned strictly to the Global Container */}
      <div className="relative z-10 w-full py-14 lg:py-16">
        <Container>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-[1.2fr_1fr_1fr_1.2fr] gap-10 lg:gap-[60px] items-start">
            {/* COLUMN 1: Real IMD Logo + Portal Identity + Visitor Counter */}
            <div className="space-y-4">
              <div className="flex items-center gap-3.5">
                <img
                  src="/branding/IMD_logo.png"
                  alt="India Meteorological Department Emblem"
                  className="h-16 w-auto object-contain bg-white/95 rounded p-1 shadow-md"
                />
                <div>
                  <div className="text-[17px] font-extrabold tracking-tight text-white leading-tight">
                    CAPACITY CONNECT
                  </div>
                  <div className="text-[12px] font-bold text-blue-100 leading-tight mt-0.5">
                    India Meteorological Department
                  </div>
                  <div className="text-[10px] text-blue-200/90 leading-tight">
                    Ministry of Earth Sciences
                  </div>
                </div>
              </div>

              <p className="text-[13px] text-blue-100 leading-relaxed font-normal">
                Digital Capacity Building &amp; Learning Management Portal engineered for meteorological professionals, observational cadres, and operational forecasting specialists across India.
              </p>

              {/* Connect Pill Button (Matches Reference Screenshot) */}
              <div>
                <a
                  href="#about"
                  className="inline-flex items-center justify-center px-4 py-1.5 rounded-full border border-white/70 text-white hover:bg-white hover:text-[#2857B5] text-xs font-bold transition-colors"
                >
                  Connect on Portal
                </a>
              </div>

              {/* Visitor Counter */}
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

            {/* COLUMN 2: Capacity Connect */}
            <div className="space-y-3">
              <h4 className="text-[15px] font-bold tracking-wide uppercase text-white border-b border-white/20 pb-1.5">
                CAPACITY CONNECT
              </h4>
              <ul className="space-y-2 text-[14px] text-blue-100 font-normal">
                <li>
                  <a href="#about" className="hover:text-white hover:underline transition-colors">
                    About Us
                  </a>
                </li>
                <li>
                  <Link to="/courses" className="hover:text-white hover:underline transition-colors">
                    Courses
                  </Link>
                </li>
                <li>
                  <a href="#learning" className="hover:text-white hover:underline transition-colors">
                    Learning
                  </a>
                </li>
                <li>
                  <a href="#competency" className="hover:text-white hover:underline transition-colors">
                    Competency
                  </a>
                </li>
                <li>
                  <a href="#resources" className="hover:text-white hover:underline transition-colors">
                    Resources
                  </a>
                </li>
              </ul>
            </div>

            {/* COLUMN 3: Useful Links */}
            <div className="space-y-3">
              <h4 className="text-[15px] font-bold tracking-wide uppercase text-white border-b border-white/20 pb-1.5">
                USEFUL LINKS
              </h4>
              <ul className="space-y-2 text-[14px] text-blue-100 font-normal">
                <li>
                  <Link to="/health" className="hover:text-white hover:underline transition-colors">
                    Help
                  </Link>
                </li>
                <li>
                  <a href="#about" className="hover:text-white hover:underline transition-colors">
                    FAQ
                  </a>
                </li>
                <li>
                  <a href="#about" className="hover:text-white hover:underline transition-colors">
                    Accessibility
                  </a>
                </li>
                <li>
                  <a href="#about" className="hover:text-white hover:underline transition-colors">
                    Contact
                  </a>
                </li>
                <li>
                  <a href="#about" className="hover:text-white hover:underline transition-colors">
                    Privacy
                  </a>
                </li>
              </ul>
            </div>

            {/* COLUMN 4: Platform */}
            <div className="space-y-3">
              <h4 className="text-[15px] font-bold tracking-wide uppercase text-white border-b border-white/20 pb-1.5">
                PLATFORM
              </h4>
              <ul className="space-y-2 text-[14px] text-blue-100 font-normal">
                <li>
                  <Link to="/login" className="hover:text-white hover:underline transition-colors">
                    Trainee
                  </Link>
                </li>
                <li>
                  <Link to="/login" className="hover:text-white hover:underline transition-colors">
                    Trainer
                  </Link>
                </li>
                <li>
                  <Link to="/login" className="hover:text-white hover:underline transition-colors">
                    Admin
                  </Link>
                </li>
                <li>
                  <Link to="/courses" className="hover:text-white hover:underline transition-colors">
                    Assessments
                  </Link>
                </li>
                <li>
                  <Link to="/courses" className="hover:text-white hover:underline transition-colors">
                    Certificates
                  </Link>
                </li>
                <li>
                  <Link to="/login" className="hover:text-white hover:underline transition-colors">
                    Notifications
                  </Link>
                </li>
              </ul>
            </div>
          </div>
        </Container>
      </div>

      {/* ======================================================== */}
      {/* 23. BOTTOM COPYRIGHT BAR (Height ~65–75px, Dark Blue)     */}
      {/* ======================================================== */}
      <div className="w-full bg-[#163B82] min-h-[68px] flex items-center text-[13px] text-blue-200 border-t border-blue-900/60 py-4">
        <Container className="flex flex-col md:flex-row items-center justify-between gap-3 text-center md:text-left">
          <div>
            &copy; {new Date().getFullYear()} Capacity Connect — Digital Capacity Building &amp; Learning Management Portal. All rights reserved.
          </div>
          <div className="flex flex-wrap items-center justify-center gap-5 text-[13px] font-medium text-blue-100">
            <a href="#about" className="hover:text-white transition-colors">Terms and Conditions</a>
            <span className="text-blue-400">|</span>
            <a href="#about" className="hover:text-white transition-colors">Privacy Policy</a>
            <span className="text-blue-400">|</span>
            <a href="#about" className="hover:text-white transition-colors">Accessibility</a>
          </div>
        </Container>
      </div>
    </footer>
  )
}
