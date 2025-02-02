"use client"

import { useState } from "react"
import { Sidebar } from "./sidebar"
import { SparklesCore } from "@/components/ui/sparkles"

interface MainLayoutProps {
  children: React.ReactNode
}

export function MainLayout({ children }: MainLayoutProps) {
  const [isCollapsed, setIsCollapsed] = useState(false)

  return (
    <div className="relative min-h-screen">
      {/* Background sparkles effect */}
      <div className="fixed inset-0 h-screen w-full bg-black">
        <SparklesCore
          id="tsparticlesfullpage"
          background="transparent"
          minSize={0.6}
          maxSize={1.4}
          particleDensity={100}
          className="h-full w-full"
          particleColor="#FFFFFF"
        />
      </div>

      <div className="relative flex h-screen overflow-hidden">
        {/* Sidebar */}
        <div className="h-full bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60">
          <Sidebar isCollapsed={isCollapsed} setIsCollapsed={setIsCollapsed} />
        </div>

        {/* Main content */}
        <main className="flex-1 overflow-y-auto bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60">
          <div className="container mx-auto p-8">
            {children}
          </div>
        </main>
      </div>
    </div>
  )
} 