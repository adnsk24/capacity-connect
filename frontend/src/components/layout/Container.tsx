import React from "react"

export interface ContainerProps {
  children: React.ReactNode
  className?: string
  id?: string
}

export const Container: React.FC<ContainerProps> = ({ children, className = "", id }) => {
  return (
    <div
      id={id}
      className={`w-full max-w-[1360px] mx-auto px-4 sm:px-6 md:px-10 xl:px-[60px] ${className}`}
    >
      {children}
    </div>
  )
}
