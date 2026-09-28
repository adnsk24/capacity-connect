import React, { useState, useEffect, useRef, useCallback } from "react"
import { ChevronLeft, ChevronRight } from "lucide-react"

export interface FeaturedSlide {
  id: string
  title: string
  subtitle: string
  image: string
  alt: string
}

export const FEATURED_SLIDES: FeaturedSlide[] = [
  {
    id: "weather-forecasting",
    title: "National Weather Forecasting Operations",
    subtitle: "India Meteorological Department \u2022 Observational & Numerical Weather Prediction",
    image: "/images/home-carousel/weather-forecasting.jpg",
    alt: "IMD national weather forecasting operations center with meteorologists analyzing observational and numerical weather prediction models",
  },
  {
    id: "satellite-meteorology",
    title: "Satellite Meteorology",
    subtitle: "INSAT Satellite Data \u2022 Cloud Analysis & Interpretation",
    image: "/images/home-carousel/satellite-meteorology.jpg",
    alt: "INSAT satellite meteorology and cloud analysis over the Indian subcontinent",
  },
  {
    id: "doppler-radar",
    title: "Doppler Weather Radar",
    subtitle: "Radar Observation \u2022 Severe Weather Detection & Analysis",
    image: "/images/home-carousel/doppler-radar.jpg",
    alt: "Doppler weather radar observation facility for severe weather detection and convective storm analysis",
  },
  {
    id: "cyclone-warning",
    title: "Cyclone Monitoring & Warning",
    subtitle: "Cyclone Tracking \u2022 Forecasting & Early Warning",
    image: "/images/home-carousel/cyclone-warning.jpg",
    alt: "Cyclone monitoring, storm tracking, and meteorological early warning operations",
  },
  {
    id: "meteorological-instruments",
    title: "Meteorological Instruments & AWS",
    subtitle: "Surface Observations \u2022 Automatic Weather Stations",
    image: "/images/home-carousel/meteorological-instruments.jpg",
    alt: "Surface meteorological instruments, Stevenson screen, and automatic weather station observatory enclosure",
  },
  {
    id: "climate-services",
    title: "Climate Services",
    subtitle: "Climate Monitoring \u2022 Seasonal Outlook & Climate Information",
    image: "/images/home-carousel/climate-services.jpg",
    alt: "Climate services, monsoon monitoring, and seasonal meteorological information",
  },
]

interface FeaturedCarouselProps {
  slides?: FeaturedSlide[]
  autoPlayIntervalMs?: number
  className?: string
}

export const FeaturedCarousel: React.FC<FeaturedCarouselProps> = ({
  slides = FEATURED_SLIDES,
  autoPlayIntervalMs = 5000,
  className = "",
}) => {
  const [activeIndex, setActiveIndex] = useState(0)
  const [direction, setDirection] = useState<"next" | "prev">("next")
  const [isPaused, setIsPaused] = useState(false)
  const [prefersReducedMotion, setPrefersReducedMotion] = useState(false)

  const touchStartX = useRef<number | null>(null)
  const touchStartY = useRef<number | null>(null)
  const containerRef = useRef<HTMLDivElement>(null)

  // Listen for prefers-reduced-motion media query
  useEffect(() => {
    if (typeof window === "undefined" || typeof window.matchMedia !== "function") return

    try {
      const mediaQuery = window.matchMedia("(prefers-reduced-motion: reduce)")
      setPrefersReducedMotion(mediaQuery.matches)

      const handler = (e: MediaQueryListEvent) => {
        setPrefersReducedMotion(e.matches)
      }

      if (mediaQuery.addEventListener) {
        mediaQuery.addEventListener("change", handler)
        return () => mediaQuery.removeEventListener("change", handler)
      } else if (mediaQuery.addListener) {
        // Fallback for older browsers
        mediaQuery.addListener(handler)
        return () => mediaQuery.removeListener(handler)
      }
    } catch {
      // Ignored in test/restricted environments
    }
  }, [])

  // Go to next slide
  const goToNext = useCallback(() => {
    setDirection("next")
    setActiveIndex((prev) => (prev + 1) % slides.length)
  }, [slides.length])

  // Go to previous slide
  const goToPrev = useCallback(() => {
    setDirection("prev")
    setActiveIndex((prev) => (prev - 1 + slides.length) % slides.length)
  }, [slides.length])

  // Go to a specific slide index
  const goToSlide = useCallback((index: number) => {
    setDirection(index >= activeIndex ? "next" : "prev")
    setActiveIndex(index)
  }, [activeIndex])

  // Autoplay timer: resets whenever activeIndex changes or pause state changes
  useEffect(() => {
    if (isPaused || autoPlayIntervalMs <= 0) return

    const timer = setInterval(() => {
      goToNext()
    }, autoPlayIntervalMs)

    return () => clearInterval(timer)
  }, [activeIndex, isPaused, autoPlayIntervalMs, goToNext])

  // Keyboard navigation
  const handleKeyDown = (e: React.KeyboardEvent<HTMLDivElement>) => {
    if (e.key === "ArrowLeft") {
      e.preventDefault()
      goToPrev()
    } else if (e.key === "ArrowRight") {
      e.preventDefault()
      goToNext()
    } else if (e.key === "Home") {
      e.preventDefault()
      goToSlide(0)
    } else if (e.key === "End") {
      e.preventDefault()
      goToSlide(slides.length - 1)
    }
  }

  // Touch handlers for mobile swipe
  const handleTouchStart = (e: React.TouchEvent<HTMLDivElement>) => {
    touchStartX.current = e.touches[0].clientX
    touchStartY.current = e.touches[0].clientY
  }

  const handleTouchEnd = (e: React.TouchEvent<HTMLDivElement>) => {
    if (touchStartX.current === null || touchStartY.current === null) return

    const deltaX = e.changedTouches[0].clientX - touchStartX.current
    const deltaY = e.changedTouches[0].clientY - touchStartY.current

    // Only trigger if horizontal swipe is dominant and exceeds threshold (40px)
    if (Math.abs(deltaX) > 40 && Math.abs(deltaX) > Math.abs(deltaY)) {
      if (deltaX < 0) {
        goToNext()
      } else {
        goToPrev()
      }
    }

    touchStartX.current = null
    touchStartY.current = null
  }

  return (
    <div
      ref={containerRef}
      className={`relative z-10 w-full h-[220px] sm:h-[260px] md:h-[280px] rounded-2xl overflow-hidden border-2 border-white shadow-lg bg-slate-900 group select-none focus:outline-none focus-visible:ring-2 focus-visible:ring-[#062B73] ${className}`}
      tabIndex={0}
      role="region"
      aria-roledescription="carousel"
      aria-label="Featured Meteorology Operations"
      aria-live="polite"
      onKeyDown={handleKeyDown}
      onMouseEnter={() => setIsPaused(true)}
      onMouseLeave={() => setIsPaused(false)}
      onFocus={() => setIsPaused(true)}
      onBlur={() => setIsPaused(false)}
      onTouchStart={handleTouchStart}
      onTouchEnd={handleTouchEnd}
    >
      {/* Slides Container */}
      <div className="relative w-full h-full overflow-hidden">
        {slides.map((slide, index) => {
          const isActive = index === activeIndex

          // Transition classes: fade + subtle horizontal motion unless reduced motion
          let transformClass = "translate-x-0"
          if (!isActive) {
            transformClass = direction === "next" ? "-translate-x-3" : "translate-x-3"
          }

          const motionStyle = prefersReducedMotion
            ? "transition-none transform-none"
            : "transition-all duration-500 ease-out"

          return (
            <div
              key={slide.id}
              role="group"
              aria-roledescription="slide"
              aria-label={`${index + 1} of ${slides.length}: ${slide.title}`}
              aria-hidden={!isActive}
              className={`absolute inset-0 w-full h-full ${
                isActive
                  ? `opacity-100 z-10 ${transformClass}`
                  : `opacity-0 pointer-events-none z-0 ${transformClass}`
              } ${motionStyle}`}
            >
              <img
                src={slide.image}
                alt={slide.alt}
                loading={index === 0 ? "eager" : "lazy"}
                fetchPriority={index === 0 ? "high" : "auto"}
                draggable={false}
                className="w-full h-full object-cover object-center"
              />

              {/* Bottom text overlay gradient */}
              <div className="absolute inset-x-0 bottom-0 bg-gradient-to-t from-black/85 via-black/45 to-transparent px-3 sm:px-4 pt-8 pb-7 sm:pb-8 text-white pointer-events-none">
                <div className="pr-4">
                  <div className="text-xs sm:text-sm font-bold tracking-wide text-white drop-shadow-md">
                    {slide.title}
                  </div>
                  <div className="text-[11px] sm:text-[11.5px] text-slate-200 mt-0.5 line-clamp-1 drop-shadow-sm">
                    {slide.subtitle}
                  </div>
                </div>
              </div>
            </div>
          )
        })}
      </div>

      {/* Navigation Controls: Previous Button */}
      <button
        type="button"
        onClick={goToPrev}
        aria-label="Previous featured content"
        className="absolute left-2 sm:left-3 top-1/2 -translate-y-1/2 z-20 w-8 h-8 sm:w-9 sm:h-9 rounded-full bg-black/40 hover:bg-black/75 text-white flex items-center justify-center transition-all duration-200 backdrop-blur-xs border border-white/20 hover:border-white/40 shadow-sm focus:outline-none focus-visible:ring-2 focus-visible:ring-white cursor-pointer active:scale-95"
      >
        <ChevronLeft className="w-4 h-4 sm:w-5 sm:h-5" />
      </button>

      {/* Navigation Controls: Next Button */}
      <button
        type="button"
        onClick={goToNext}
        aria-label="Next featured content"
        className="absolute right-2 sm:right-3 top-1/2 -translate-y-1/2 z-20 w-8 h-8 sm:w-9 sm:h-9 rounded-full bg-black/40 hover:bg-black/75 text-white flex items-center justify-center transition-all duration-200 backdrop-blur-xs border border-white/20 hover:border-white/40 shadow-sm focus:outline-none focus-visible:ring-2 focus-visible:ring-white cursor-pointer active:scale-95"
      >
        <ChevronRight className="w-4 h-4 sm:w-5 sm:h-5" />
      </button>

      {/* Pagination Dots */}
      <div
        className="absolute bottom-2 sm:bottom-2.5 left-1/2 -translate-x-1/2 z-20 flex items-center gap-1.5"
        role="tablist"
        aria-label="Featured content pagination"
      >
        {slides.map((slide, index) => {
          const isActive = index === activeIndex
          return (
            <button
              key={slide.id}
              type="button"
              role="tab"
              aria-selected={isActive}
              aria-label={`Go to featured content ${index + 1}: ${slide.title}`}
              onClick={() => goToSlide(index)}
              className={`h-2 rounded-full transition-all duration-300 focus:outline-none focus-visible:ring-2 focus-visible:ring-white cursor-pointer ${
                isActive
                  ? "w-6 bg-white shadow-xs"
                  : "w-2 bg-white/50 hover:bg-white/80"
              }`}
            />
          )
        })}
      </div>
    </div>
  )
}
