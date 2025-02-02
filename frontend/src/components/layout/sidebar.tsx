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
  PanelLeftClose,
  PanelLeftOpen,
} from "lucide-react"
import Link from "next/link"
import { usePathname } from "next/navigation"
import {
  Collapsible,
  CollapsibleContent,
  CollapsibleTrigger,
} from "@/components/ui/collapsible"
import { motion } from "framer-motion"
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "@/components/ui/tooltip"

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
      className={cn(
        "relative border-r border-border/40 bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60",
        "transition-all duration-200 ease-in-out",
        className
      )}
      initial={{ width: 280 }}
      animate={{ width: isCollapsed ? 80 : 280 }}
      transition={{ duration: 0.2 }}
    >
      <TooltipProvider delayDuration={0}>
        <Tooltip>
          <TooltipTrigger asChild>
            <Button
              variant="ghost"
              size="icon"
              className={cn(
                "absolute -right-3 top-6 z-40",
                "h-6 w-6 rounded-full",
                "border border-border/50",
                "bg-background hover:bg-accent/50",
                "transition-all duration-200 ease-in-out",
                "focus-visible:ring-2 focus-visible:ring-accent",
                "hover:scale-110"
              )}
              onClick={() => setIsCollapsed(!isCollapsed)}
            >
              <motion.div
                animate={{ rotate: isCollapsed ? 0 : 180 }}
                transition={{ duration: 0.2 }}
              >
                {isCollapsed ? (
                  <PanelLeftOpen className="h-3 w-3" />
                ) : (
                  <PanelLeftClose className="h-3 w-3" />
                )}
              </motion.div>
              <span className="sr-only">Toggle Sidebar</span>
            </Button>
          </TooltipTrigger>
          <TooltipContent side="right" className="text-xs">
            {isCollapsed ? "Expand sidebar" : "Collapse sidebar"}
          </TooltipContent>
        </Tooltip>
      </TooltipProvider>

      <ScrollArea 
        className={cn(
          "h-full",
          "py-6 px-2",
          "transition-all duration-200"
        )}
      >
        <div className="space-y-4 py-4">
          <div className="px-2">
            <nav className="grid gap-1">
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
                            "w-full justify-between",
                            "px-3 py-2",
                            "transition-colors duration-200",
                            "hover:bg-accent/50",
                            pathname.startsWith("/reports") && "bg-accent/60"
                          )}
                        >
                          <div className="flex items-center gap-3">
                            <item.icon className="h-4 w-4" />
                            <span className="text-sm font-medium">{item.name}</span>
                          </div>
                          <motion.div
                            animate={{ rotate: isReportsOpen ? 180 : 0 }}
                            transition={{ duration: 0.2 }}
                          >
                            <ChevronDown className="h-4 w-4" />
                          </motion.div>
                        </Button>
                      </CollapsibleTrigger>
                      <CollapsibleContent className="space-y-1 px-6 py-2">
                        {item.children.map((child) => (
                          <TooltipProvider key={child.name} delayDuration={0}>
                            <Tooltip>
                              <TooltipTrigger asChild>
                                <Link
                                  href={child.href}
                                  className={cn(
                                    "flex flex-col gap-1",
                                    "rounded-lg px-4 py-3",
                                    "transition-all duration-200",
                                    "hover:bg-accent/50",
                                    pathname === child.href && "bg-accent/60"
                                  )}
                                >
                                  <div className="flex items-center gap-3">
                                    <child.icon className="h-4 w-4" />
                                    <span className="text-sm font-medium">{child.name}</span>
                                  </div>
                                  {child.description && (
                                    <span className="text-xs text-muted-foreground line-clamp-2 pl-7">
                                      {child.description}
                                    </span>
                                  )}
                                </Link>
                              </TooltipTrigger>
                              <TooltipContent side="right" className="text-xs">
                                {child.description}
                              </TooltipContent>
                            </Tooltip>
                          </TooltipProvider>
                        ))}
                      </CollapsibleContent>
                    </Collapsible>
                  ) : (
                    <TooltipProvider key={item.name} delayDuration={0}>
                      <Tooltip>
                        <TooltipTrigger asChild>
                          <Link
                            href="/reports"
                            className={cn(
                              "flex items-center justify-center",
                              "rounded-lg p-2",
                              "transition-all duration-200",
                              "hover:bg-accent/50",
                              pathname.startsWith("/reports") && "bg-accent/60"
                            )}
                          >
                            <item.icon className="h-5 w-5" />
                          </Link>
                        </TooltipTrigger>
                        <TooltipContent side="right" className="text-xs">
                          {item.name}
                        </TooltipContent>
                      </Tooltip>
                    </TooltipProvider>
                  )
                }
                return (
                  <TooltipProvider key={item.name} delayDuration={0}>
                    <Tooltip>
                      <TooltipTrigger asChild>
                        <Link
                          href={item.href}
                          className={cn(
                            "flex items-center gap-3",
                            "rounded-lg px-4 py-2",
                            "transition-all duration-200",
                            "hover:bg-accent/50",
                            pathname === item.href && "bg-accent/60",
                            isCollapsed ? "justify-center px-2" : "justify-start"
                          )}
                        >
                          <item.icon className={cn(
                            "transition-all duration-200",
                            isCollapsed ? "h-5 w-5" : "h-4 w-4"
                          )} />
                          {!isCollapsed && <span className="text-sm font-medium">{item.name}</span>}
                        </Link>
                      </TooltipTrigger>
                      <TooltipContent side="right" className="text-xs">
                        {isCollapsed ? item.name : undefined}
                      </TooltipContent>
                    </Tooltip>
                  </TooltipProvider>
                )
              })}
            </nav>
          </div>
        </div>
      </ScrollArea>
    </motion.div>
  )
} 