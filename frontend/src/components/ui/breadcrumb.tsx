import React from "react"
import { Link } from "react-router-dom"
import { ChevronRight, Home } from "lucide-react"

export interface BreadcrumbItem {
  label: string
  href?: string
}

interface BreadcrumbProps {
  items: BreadcrumbItem[]
}

export const Breadcrumb: React.FC<BreadcrumbProps> = ({ items }) => {
  return (
    <nav className="flex items-center text-xs text-slate-500 space-x-1.5 py-1">
      <Link
        to="/"
        className="flex items-center hover:text-blue-600 transition-colors"
      >
        <Home className="h-3.5 w-3.5" />
      </Link>
      {items.map((item, index) => {
        const isLast = index === items.length - 1
        return (
          <React.Fragment key={index}>
            <ChevronRight className="h-3 w-3 text-slate-400 shrink-0" />
            {item.href && !isLast ? (
              <Link
                to={item.href}
                className="hover:text-blue-600 transition-colors font-medium truncate max-w-[200px]"
              >
                {item.label}
              </Link>
            ) : (
              <span className="font-semibold text-slate-800 truncate max-w-[240px]">
                {item.label}
              </span>
            )}
          </React.Fragment>
        )
      })}
    </nav>
  )
}
