import * as React from "react"
import { cn } from "@/lib/utils"
import { Button } from "@/components/ui/button"
import { ScrollArea } from "@/components/ui/scroll-area"
import {
  ChevronLeft,
  ChevronRight,
  FileText,
  PlusCircle,
  Settings,
  Home
} from "lucide-react"
import Link from "next/link"
import { usePathname } from "next/navigation"

interface SidebarProps extends React.HTMLAttributes<HTMLDivElement> {
  isCollapsed: boolean
  setIsCollapsed: (collapsed: boolean) => void
}

export function Sidebar({ 
  className, 
  isCollapsed,
  setIsCollapsed
}: SidebarProps) {
  const pathname = usePathname()

  const navigation = [
    {
      name: "Dashboard",
      href: "/",
      icon: Home,
    },
    {
      name: "Reports",
      href: "/reports",
      icon: FileText,
    },
    {
      name: "New Report",
      href: "/reports/new",
      icon: PlusCircle,
    },
    {
      name: "Settings",
      href: "/settings",
      icon: Settings,
    },
  ]

  return (
    <div className={cn("relative", className)}>
      <Button
        variant="ghost"
        size="icon"
        className="absolute right-[-12px] top-7 z-20 h-6 w-6 rounded-full bg-muted"
        onClick={() => setIsCollapsed(!isCollapsed)}
      >
        {isCollapsed ? (
          <ChevronRight className="h-4 w-4" />
        ) : (
          <ChevronLeft className="h-4 w-4" />
        )}
        <span className="sr-only">Toggle Sidebar</span>
      </Button>
      <div
        className={cn(
          "pb-12 transition-all duration-300 ease-in-out",
          isCollapsed ? "w-[60px]" : "w-[200px]"
        )}
      >
        <div className="space-y-4 py-4">
          <div className="px-3 py-2">
            <div className="mt-3 space-y-1">
              <nav className="grid gap-1 px-2">
                {navigation.map((item, index) => (
                  <Link
                    key={item.name}
                    href={item.href}
                    className={cn(
                      "flex items-center gap-3 rounded-lg px-3 py-2 text-sm transition-all hover:text-primary",
                      pathname === item.href ? "bg-muted" : "transparent",
                      isCollapsed ? "justify-center" : "justify-start"
                    )}
                  >
                    <item.icon className="h-4 w-4" />
                    {!isCollapsed && <span>{item.name}</span>}
                  </Link>
                ))}
              </nav>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
} 