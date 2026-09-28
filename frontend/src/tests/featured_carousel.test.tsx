import { describe, it, expect, vi, beforeEach, afterEach } from "vitest"
import { render, screen, fireEvent, act } from "@testing-library/react"
import { MemoryRouter } from "react-router-dom"
import { QueryClient, QueryClientProvider } from "@tanstack/react-query"
import {
  FeaturedCarousel,
} from "../components/home/FeaturedCarousel"
import { HomePage } from "../pages/HomePage"

const createTestQueryClient = () =>
  new QueryClient({
    defaultOptions: {
      queries: { retry: false, gcTime: 0 },
    },
  })

describe("Capacity Connect — Featured Content Carousel Test Suite", () => {
  beforeEach(() => {
    vi.useFakeTimers()
  })

  afterEach(() => {
    vi.useRealTimers()
  })

  it("renders slide 1 initially with accurate title, subtitle, and image", () => {
    render(<FeaturedCarousel />)

    // Slide 1 title and subtitle
    expect(
      screen.getByText("National Weather Forecasting Operations")
    ).toBeDefined()
    expect(
      screen.getByText(
        /India Meteorological Department • Observational & Numerical Weather Prediction/i
      )
    ).toBeDefined()

    // 6 pagination dots
    const dots = screen.getAllByRole("tab")
    expect(dots).toHaveLength(6)
    expect(dots[0].getAttribute("aria-selected")).toBe("true")
    expect(dots[1].getAttribute("aria-selected")).toBe("false")
  })

  it("advances to next slide when Next button is clicked", () => {
    render(<FeaturedCarousel />)

    const nextBtn = screen.getByLabelText("Next featured content")
    fireEvent.click(nextBtn)

    expect(screen.getByText("Satellite Meteorology")).toBeDefined()
    expect(
      screen.getByText(/INSAT Satellite Data • Cloud Analysis & Interpretation/i)
    ).toBeDefined()

    const dots = screen.getAllByRole("tab")
    expect(dots[1].getAttribute("aria-selected")).toBe("true")
  })

  it("wraps to slide 6 when Previous button is clicked from slide 1", () => {
    render(<FeaturedCarousel />)

    const prevBtn = screen.getByLabelText("Previous featured content")
    fireEvent.click(prevBtn)

    expect(screen.getByText("Climate Services")).toBeDefined()
    expect(
      screen.getByText(
        /Climate Monitoring • Seasonal Outlook & Climate Information/i
      )
    ).toBeDefined()

    const dots = screen.getAllByRole("tab")
    expect(dots[5].getAttribute("aria-selected")).toBe("true")
  })

  it("navigates directly to clicked slide via pagination dot", () => {
    render(<FeaturedCarousel />)

    const dots = screen.getAllByRole("tab")
    // Click on Doppler Weather Radar (slide 3, index 2)
    fireEvent.click(dots[2])

    expect(screen.getByText("Doppler Weather Radar")).toBeDefined()
    expect(
      screen.getByText(/Radar Observation • Severe Weather Detection & Analysis/i)
    ).toBeDefined()
    expect(dots[2].getAttribute("aria-selected")).toBe("true")
  })

  it("automatically advances slide every 5 seconds (5000ms)", () => {
    render(<FeaturedCarousel />)

    expect(
      screen.getByText("National Weather Forecasting Operations")
    ).toBeDefined()

    // Advance 5 seconds
    act(() => {
      vi.advanceTimersByTime(5000)
    })

    expect(screen.getByText("Satellite Meteorology")).toBeDefined()

    // Advance another 5 seconds
    act(() => {
      vi.advanceTimersByTime(5000)
    })

    expect(screen.getByText("Doppler Weather Radar")).toBeDefined()
  })

  it("pauses autoplay on mouse hover and resumes when mouse leaves", () => {
    render(<FeaturedCarousel />)
    const carouselRegion = screen.getByRole("region", {
      name: /Featured Meteorology Operations/i,
    })

    // Hover over carousel
    fireEvent.mouseEnter(carouselRegion)

    // Advance time by 5 seconds while hovered
    act(() => {
      vi.advanceTimersByTime(5000)
    })

    // Should NOT have advanced
    expect(
      screen.getByText("National Weather Forecasting Operations")
    ).toBeDefined()

    // Mouse leave
    fireEvent.mouseLeave(carouselRegion)

    // Advance time after mouse leave
    act(() => {
      vi.advanceTimersByTime(5000)
    })

    // Now it advances
    expect(screen.getByText("Satellite Meteorology")).toBeDefined()
  })

  it("resets autoplay timer upon manual interaction", () => {
    render(<FeaturedCarousel />)

    // Wait 3 seconds
    act(() => {
      vi.advanceTimersByTime(3000)
    })

    // Manually click next -> now on slide 2
    const nextBtn = screen.getByLabelText("Next featured content")
    fireEvent.click(nextBtn)
    expect(screen.getByText("Satellite Meteorology")).toBeDefined()

    // Wait another 3 seconds (total 6s from start, but only 3s from manual interaction)
    act(() => {
      vi.advanceTimersByTime(3000)
    })

    // Still on slide 2 because timer was reset to 5s
    expect(screen.getByText("Satellite Meteorology")).toBeDefined()

    // Wait 2 more seconds (total 5s from manual interaction)
    act(() => {
      vi.advanceTimersByTime(2000)
    })

    // Now moves to slide 3
    expect(screen.getByText("Doppler Weather Radar")).toBeDefined()
  })

  it("supports keyboard navigation via ArrowLeft, ArrowRight, Home, and End", () => {
    render(<FeaturedCarousel />)
    const carouselRegion = screen.getByRole("region", {
      name: /Featured Meteorology Operations/i,
    })

    // Press ArrowRight -> slide 2
    fireEvent.keyDown(carouselRegion, { key: "ArrowRight" })
    expect(screen.getByText("Satellite Meteorology")).toBeDefined()

    // Press ArrowLeft -> slide 1
    fireEvent.keyDown(carouselRegion, { key: "ArrowLeft" })
    expect(
      screen.getByText("National Weather Forecasting Operations")
    ).toBeDefined()

    // Press End -> slide 6
    fireEvent.keyDown(carouselRegion, { key: "End" })
    expect(screen.getByText("Climate Services")).toBeDefined()

    // Press Home -> slide 1
    fireEvent.keyDown(carouselRegion, { key: "Home" })
    expect(
      screen.getByText("National Weather Forecasting Operations")
    ).toBeDefined()
  })

  it("supports touch swipe left to advance and swipe right to go back", () => {
    render(<FeaturedCarousel />)
    const carouselRegion = screen.getByRole("region", {
      name: /Featured Meteorology Operations/i,
    })

    // Swipe left (deltaX = -60) -> Next
    fireEvent.touchStart(carouselRegion, {
      touches: [{ clientX: 100, clientY: 50 }],
    })
    fireEvent.touchEnd(carouselRegion, {
      changedTouches: [{ clientX: 40, clientY: 50 }],
    })

    expect(screen.getByText("Satellite Meteorology")).toBeDefined()

    // Swipe right (deltaX = +60) -> Prev
    fireEvent.touchStart(carouselRegion, {
      touches: [{ clientX: 40, clientY: 50 }],
    })
    fireEvent.touchEnd(carouselRegion, {
      changedTouches: [{ clientX: 100, clientY: 50 }],
    })

    expect(
      screen.getByText("National Weather Forecasting Operations")
    ).toBeDefined()
  })

  it("renders seamlessly on HomePage without altering surrounding structure", () => {
    const queryClient = createTestQueryClient()
    render(
      <QueryClientProvider client={queryClient}>
        <MemoryRouter>
          <HomePage />
        </MemoryRouter>
      </QueryClientProvider>
    )

    // Hero title & subtitle
    expect(screen.getByText("CAPACITY CONNECT")).toBeDefined()
    expect(
      screen.getByText("Digital Capacity Building & Learning Management Portal")
    ).toBeDefined()

    // Carousel present with slide 1
    expect(
      screen.getByRole("region", {
        name: /Featured Meteorology Operations/i,
      })
    ).toBeDefined()
    expect(
      screen.getByText("National Weather Forecasting Operations")
    ).toBeDefined()

    // Other homepage sections remain intact
    expect(screen.getByText("Meteorological Learning")).toBeDefined()
  })
})
