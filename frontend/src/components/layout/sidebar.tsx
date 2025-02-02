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
  Home,
  ChevronDown,
} from "lucide-react"
import Link from "next/link"
import { usePathname } from "next/navigation"
import {
  Collapsible,
  CollapsibleContent,
  CollapsibleTrigger,
} from "@/components/ui/collapsible"
import { motion } from "framer-motion"

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
  const [isReportsOpen, setIsReportsOpen] = React.useState(
    pathname.startsWith("/reports")
  )

  const navigation = [
    {
      name: "Home",
      href: "/",
      icon: Home,
    },
    {
      name: "Reports",
      icon: FileText,
      children: [
        {
          name: "All Reports",
          href: "/reports",
          icon: FileText,
          description: "View and manage your generated reports",
        },
        {
          name: "New Report",
          href: "/reports/new",
          icon: PlusCircle,
          description: "Generate a new AI-powered report",
        },
      ],
    },
    {
      name: "Settings",
      href: "/settings",
      icon: Settings,
    },
  ]

  return (
    <motion.div 
      className={cn("relative", className)}
      animate={{ width: isCollapsed ? 60 : 200 }}
      transition={{ duration: 0.2 }}
    >
      <Button
        variant="ghost"
        size="icon"
        className="absolute right-[-12px] top-7 z-20 h-6 w-6 rounded-full bg-muted hover:bg-muted-foreground/10"
        onClick={() => setIsCollapsed(!isCollapsed)}
      >
        <motion.div
          animate={{ rotate: isCollapsed ? 0 : 180 }}
          transition={{ duration: 0.2 }}
        >
          <ChevronLeft className="h-4 w-4" />
        </motion.div>
        <span className="sr-only">Toggle Sidebar</span>
      </Button>

      <ScrollArea className="h-full py-6">
        <div className="space-y-4 py-4">
          <div className="px-3 py-2">
            <div className="space-y-1">
              <nav className="grid gap-1 px-2">
                {navigation.map((item, index) => {
                  if (item.children) {
                    return !isCollapsed ? (
                      <Collapsible
                        key={item.name}
                        open={isReportsOpen}
                        onOpenChange={setIsReportsOpen}
                      >
                        <CollapsibleTrigger asChild>
                          <Button
                            variant="ghost"
                            className={cn(
                              "w-full justify-between px-3",
                              pathname.startsWith("/reports") && "bg-muted"
                            )}
                          >
                            <div className="flex items-center gap-3">
                              <item.icon className="h-4 w-4" />
                              <span>{item.name}</span>
                            </div>
                            <motion.div
                              animate={{ rotate: isReportsOpen ? 180 : 0 }}
                              transition={{ duration: 0.2 }}
                            >
                              <ChevronDown className="h-4 w-4" />
                            </motion.div>
                          </Button>
                        </CollapsibleTrigger>
                        <CollapsibleContent className="space-y-1 px-8 py-1.5">
                          {item.children.map((child) => (
                            <Link
                              key={child.name}
                              href={child.href}
                              className={cn(
                                "flex flex-col gap-1 rounded-lg px-3 py-2 text-sm transition-all hover:bg-muted",
                                pathname === child.href && "bg-muted"
                              )}
                            >
                              <div className="flex items-center gap-3">
                                <child.icon className="h-4 w-4" />
                                <span>{child.name}</span>
                              </div>
                              {child.description && (
                                <span className="text-xs text-muted-foreground">
                                  {child.description}
                                </span>
                              )}
                            </Link>
                          ))}
                        </CollapsibleContent>
                      </Collapsible>
                    ) : (
                      <Link
                        key={item.name}
                        href="/reports"
                        className={cn(
                          "flex items-center justify-center rounded-lg p-2 text-sm transition-all hover:bg-muted",
                          pathname.startsWith("/reports") && "bg-muted"
                        )}
                      >
                        <item.icon className="h-4 w-4" />
                      </Link>
                    )
                  }
                  return (
                    <Link
                      key={item.name}
                      href={item.href}
                      className={cn(
                        "flex items-center gap-3 rounded-lg px-3 py-2 text-sm transition-all hover:bg-muted",
                        pathname === item.href && "bg-muted",
                        isCollapsed ? "justify-center px-2" : "justify-start px-3"
                      )}
                    >
                      <item.icon className="h-4 w-4" />
                      {!isCollapsed && <span>{item.name}</span>}
                    </Link>
                  )
                })}
              </nav>
            </div>
          </div>
        </div>
      </ScrollArea>
    </motion.div>
  )
} 