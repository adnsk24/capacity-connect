import React from "react"
import { Link } from "react-router-dom"
import { Container } from "./Container"

export const Footer: React.FC = () => {
  return (
    <footer className="w-full relative bg-[#2857B5] text-white overflow-hidden border-t-4 border-[#062B73]">
      {/* Background Decorative Meteorological Contour Rings (Matching Reference Screenshots 2 & 3) */}
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

      {/* Main 5-Column Footer Content aligned strictly to the Global Container */}
      <div className="relative z-10 w-full py-12 lg:py-16">
        <Container>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-12 gap-8 lg:gap-10 items-start">
            {/* COLUMN 1: Real IMD Logo + Portal Identity + Visitor Counter (span 4) */}
            <div className="lg:col-span-4 space-y-4">
              <div className="flex items-center gap-3.5">
                <img
                  src="/branding/IMD_logo.png"
                  alt="India Meteorological Department Emblem"
                  className="h-16 w-auto object-contain bg-white/95 rounded-md p-1 shadow-md"
                />
                <div>
                  <div className="text-[17px] font-extrabold tracking-tight text-white leading-tight">
                    CAPACITY CONNECT
                  </div>
                  <div className="text-[12px] font-bold text-blue-100 leading-tight mt-0.5">
                    India Meteorological Department
                  </div>
                  <div className="text-[11px] text-blue-200/90 leading-tight">
                    Digital Capacity Building &amp; Learning Management Portal
                  </div>
                </div>
              </div>

              {/* Connect Pill Button (Matches Reference Screenshot 2 & 3) */}
              <div>
                <a
                  href="#about"
                  className="inline-flex items-center justify-center px-4 py-1.5 rounded-full border border-white/70 text-white hover:bg-white hover:text-[#2857B5] text-xs font-bold transition-colors"
                >
                  Connect on Social Media
                </a>
              </div>

              {/* Last Updated Pill (Matches Reference Screenshot 2 & 3) */}
              <div className="inline-block px-3.5 py-1 rounded-full bg-white/15 text-blue-100 text-xs font-medium">
                Last Updated: September 28, 2026
              </div>

              {/* Visitor Counter (Matches Reference Screenshot 2 & 3) */}
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

            {/* COLUMN 2: Capacity Connect (span 2) */}
            <div className="lg:col-span-2 space-y-3">
              <h4 className="text-[14px] font-bold tracking-wide uppercase text-white border-b border-white/20 pb-1.5">
                Capacity Connect
              </h4>
              <ul className="space-y-2 text-[13px] text-blue-100 font-normal">
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

            {/* COLUMN 3: Useful Links (span 2) */}
            <div className="lg:col-span-2 space-y-3">
              <h4 className="text-[14px] font-bold tracking-wide uppercase text-white border-b border-white/20 pb-1.5">
                Useful Links
              </h4>
              <ul className="space-y-2 text-[13px] text-blue-100 font-normal">
                <li>
                  <a href="#about" className="hover:text-white hover:underline transition-colors">
                    Events
                  </a>
                </li>
                <li>
                  <a href="#about" className="hover:text-white hover:underline transition-colors">
                    Press Release
                  </a>
                </li>
                <li>
                  <a href="#about" className="hover:text-white hover:underline transition-colors">
                    Videos
                  </a>
                </li>
                <li>
                  <a href="#about" className="hover:text-white hover:underline transition-colors">
                    Ask Our Expert
                  </a>
                </li>
                <li>
                  <a href="#about" className="hover:text-white hover:underline transition-colors">
                    Photos
                  </a>
                </li>
              </ul>
            </div>

            {/* COLUMN 4: Help & Support (span 2) */}
            <div className="lg:col-span-2 space-y-3">
              <h4 className="text-[14px] font-bold tracking-wide uppercase text-white border-b border-white/20 pb-1.5">
                Help &amp; Support
              </h4>
              <ul className="space-y-2 text-[13px] text-blue-100 font-normal">
                <li>
                  <a href="#about" className="hover:text-white hover:underline transition-colors">
                    FAQ
                  </a>
                </li>
                <li>
                  <Link to="/health" className="hover:text-white hover:underline transition-colors">
                    Help
                  </Link>
                </li>
                <li>
                  <a href="#about" className="hover:text-white hover:underline transition-colors">
                    Contact Us
                  </a>
                </li>
                <li>
                  <Link to="/login" className="hover:text-white hover:underline transition-colors">
                    Trainee Portal
                  </Link>
                </li>
                <li>
                  <Link to="/login" className="hover:text-white hover:underline transition-colors">
                    Trainer Portal
                  </Link>
                </li>
              </ul>
            </div>

            {/* COLUMN 5: Connect with Us + Official Emblem Badge (span 2) */}
            <div className="lg:col-span-2 space-y-3">
              <h4 className="text-[14px] font-bold tracking-wide uppercase text-white border-b border-white/20 pb-1.5">
                Connect with Us
              </h4>
              <div className="space-y-1.5 text-[12px] text-blue-100 font-normal leading-relaxed">
                <div className="font-semibold text-white">India Meteorological Department</div>
                <div>Mausam Bhavan, Lodhi Road, New Delhi - 110003 INDIA</div>
                <div className="pt-1">
                  <strong className="text-white">Helpline Number:</strong> 10505
                </div>
                <div>
                  <strong className="text-white">Email:</strong> capacity.connect@imd.gov.in
                </div>
              </div>

              {/* National Portal of India india.gov.in badge */}
              <div className="pt-2">
                <a
                  href="https://www.india.gov.in"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="inline-block bg-white rounded p-1 border border-white/40 shadow-xs hover:opacity-90 transition-opacity"
                  title="National Portal of India"
                >
                  <div className="flex items-center gap-1.5 px-2 py-0.5 text-[#062B73]">
                    <span className="text-xs font-mono font-bold">🇮🇳 india.gov.in</span>
                  </div>
                </a>
              </div>
            </div>
          </div>
        </Container>
      </div>

      {/* ======================================================== */}
      {/* 16. BOTTOM COPYRIGHT BAR (Dark Blue Strip)                */}
      {/* Matches exact reference screenshot 2 & 3                  */}
      {/* ======================================================== */}
      <div className="w-full bg-[#163B82] min-h-[58px] flex items-center text-[12px] text-blue-200 border-t border-blue-900/60 py-3.5">
        <Container className="flex flex-col md:flex-row items-center justify-between gap-3 text-center md:text-left">
          <div className="space-y-0.5">
            <div>
              &copy; {new Date().getFullYear()} - Copyright India Meteorological Department, Government of India. All rights reserved.
            </div>
            <div className="text-[11px] text-blue-300">
              The information provided on this website is sourced from official IMD capacity frameworks.
            </div>
          </div>
          <div className="flex flex-wrap items-center justify-center gap-4 text-[12.5px] font-medium text-blue-100">
            <a href="#about" className="hover:text-white transition-colors">Terms and Conditions</a>
            <span className="text-blue-400">|</span>
            <a href="#about" className="hover:text-white transition-colors">Feedback</a>
            <span className="text-blue-400">|</span>
            <a href="#about" className="hover:text-white transition-colors">Accessibility</a>
          </div>
        </Container>
      </div>
    </footer>
  )
}
