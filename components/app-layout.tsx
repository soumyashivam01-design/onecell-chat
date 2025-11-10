"use client"

import type React from "react"
import { useState, useEffect } from "react"
import { usePathname, useRouter } from "next/navigation"
import { MessageSquare, Settings, Search, X, Menu, Moon, Sun, Sparkles } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { useTheme } from "next-themes"
import { motion, AnimatePresence } from "framer-motion"
import { useMobile } from "@/hooks/use-mobile"
import { useLocalStorage } from "@/hooks/use-local-storage"

interface AppLayoutProps {
  children: React.ReactNode
}

export function AppLayout({ children }: AppLayoutProps) {
  const [isSearchOpen, setIsSearchOpen] = useState(false)
  const [isSidebarOpen, setIsSidebarOpen] = useState(false)
  const [searchQuery, setSearchQuery] = useLocalStorage("onecell_search_query", "")
  const pathname = usePathname()
  const router = useRouter()
  const { theme, setTheme } = useTheme()
  const isMobile = useMobile()

  useEffect(() => {
    if (isMobile) {
      setIsSidebarOpen(false)
    }
  }, [pathname, isMobile])

  const navItems = [
    {
      name: "Messages",
      path: "/inbox",
      icon: <MessageSquare className="h-5 w-5" />,
      gradient: "from-blue-500 to-purple-600",
    },
    {
      name: "Settings",
      path: "/settings",
      icon: <Settings className="h-5 w-5" />,
      gradient: "from-gray-500 to-gray-700",
    },
  ]

  const handleSearch = (query: string) => {
    setSearchQuery(query)
    // In a real app, this would trigger search functionality
    console.log("Searching for:", query)
  }

  return (
    <div className="flex h-screen bg-gradient-to-br from-gray-50 to-gray-100 dark:from-gray-950 dark:to-gray-900">
      {/* Mobile sidebar toggle */}
      {isMobile && (
        <motion.button
          whileHover={{ scale: 1.05 }}
          whileTap={{ scale: 0.95 }}
          onClick={() => setIsSidebarOpen(!isSidebarOpen)}
          className="fixed top-4 left-4 z-50 p-3 rounded-2xl bg-white/90 dark:bg-gray-800/90 backdrop-blur-lg shadow-lg border border-white/20 dark:border-gray-700/30"
        >
          <motion.div animate={{ rotate: isSidebarOpen ? 90 : 0 }} transition={{ duration: 0.2 }}>
            {isSidebarOpen ? <X size={20} /> : <Menu size={20} />}
          </motion.div>
        </motion.button>
      )}

      {/* Sidebar */}
      <AnimatePresence>
        {(!isMobile || isSidebarOpen) && (
          <motion.div
            initial={{ x: isMobile ? -320 : 0, opacity: isMobile ? 0 : 1 }}
            animate={{ x: 0, opacity: 1 }}
            exit={{ x: -320, opacity: 0 }}
            transition={{ type: "spring", stiffness: 300, damping: 30 }}
            className={`${
              isMobile ? "fixed inset-y-0 left-0 z-40" : ""
            } w-[320px] backdrop-blur-2xl bg-white/90 dark:bg-gray-900/90 border-r border-white/20 dark:border-gray-700/30 flex flex-col shadow-2xl`}
          >
            <div className="p-6">
              <motion.div
                initial={{ opacity: 0, y: -10 }}
                animate={{ opacity: 1, y: 0 }}
                className="flex items-center mb-10"
              >
                <div className="relative">
                  <div className="absolute inset-0 bg-gradient-to-r from-blue-500 to-purple-600 rounded-2xl blur-lg opacity-30" />
                  <div className="relative bg-gradient-to-r from-blue-500 to-purple-600 p-3 rounded-2xl">
                    <Sparkles className="h-6 w-6 text-white" />
                  </div>
                </div>
                <h1 className="text-2xl font-bold ml-3 bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent">
                  OneCell
                </h1>
              </motion.div>

              <nav className="space-y-2">
                {navItems.map((item, index) => (
                  <motion.div
                    key={item.path}
                    initial={{ opacity: 0, x: -20 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ delay: index * 0.1 }}
                  >
                    <Button
                      variant={pathname === item.path ? "default" : "ghost"}
                      className={`w-full justify-start h-12 rounded-2xl transition-all duration-300 ${
                        pathname === item.path
                          ? `bg-gradient-to-r ${item.gradient} text-white shadow-lg hover:shadow-xl`
                          : "hover:bg-gray-100 dark:hover:bg-gray-800/50"
                      }`}
                      onClick={() => router.push(item.path)}
                    >
                      <motion.div whileHover={{ scale: 1.1 }} whileTap={{ scale: 0.9 }} className="flex items-center">
                        {item.icon}
                        <span className="ml-3 font-medium">{item.name}</span>
                      </motion.div>
                    </Button>
                  </motion.div>
                ))}
              </nav>
            </div>

            <div className="mt-auto p-6 border-t border-gray-200/30 dark:border-gray-700/30">
              <Button
                variant="ghost"
                className="w-full justify-start h-12 rounded-2xl hover:bg-gray-100 dark:hover:bg-gray-800/50 transition-all duration-300"
                onClick={() => setTheme(theme === "dark" ? "light" : "dark")}
              >
                <motion.div whileHover={{ rotate: 180 }} transition={{ duration: 0.3 }}>
                  {theme === "dark" ? <Sun className="h-5 w-5 mr-3" /> : <Moon className="h-5 w-5 mr-3" />}
                </motion.div>
                <span className="font-medium">{theme === "dark" ? "Light Mode" : "Dark Mode"}</span>
              </Button>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Main content */}
      <div className="flex-1 flex flex-col overflow-hidden">
        {/* Header */}
        <header className="h-20 flex items-center justify-between px-6 backdrop-blur-2xl bg-white/90 dark:bg-gray-900/90 border-b border-white/20 dark:border-gray-700/30 shadow-lg">
          <div className="flex-1 max-w-2xl">
            <AnimatePresence mode="wait">
              {!isSearchOpen ? (
                <motion.div
                  initial={{ opacity: 0, scale: 0.9 }}
                  animate={{ opacity: 1, scale: 1 }}
                  exit={{ opacity: 0, scale: 0.9 }}
                  key="search-button"
                >
                  <Button
                    variant="ghost"
                    className="rounded-2xl bg-gray-100 dark:bg-gray-800/50 hover:bg-gray-200 dark:hover:bg-gray-700/50 transition-all duration-300 px-6 h-12"
                    onClick={() => setIsSearchOpen(true)}
                  >
                    <Search className="h-5 w-5 mr-3 text-gray-500" />
                    <span className="text-gray-500">Search messages...</span>
                  </Button>
                </motion.div>
              ) : (
                <motion.div
                  initial={{ opacity: 0, scale: 0.9 }}
                  animate={{ opacity: 1, scale: 1 }}
                  exit={{ opacity: 0, scale: 0.9 }}
                  key="search-input"
                  className="flex items-center"
                >
                  <div className="relative flex-1">
                    <Search className="absolute left-4 top-1/2 transform -translate-y-1/2 h-5 w-5 text-gray-400" />
                    <Input
                      placeholder="Search across all conversations..."
                      className="pl-12 pr-4 rounded-2xl bg-gray-100 dark:bg-gray-800/50 border-0 h-12 focus:ring-2 focus:ring-blue-500/20"
                      autoFocus
                      value={searchQuery}
                      onChange={(e) => handleSearch(e.target.value)}
                    />
                  </div>
                  <Button
                    variant="ghost"
                    size="icon"
                    onClick={() => setIsSearchOpen(false)}
                    className="ml-3 rounded-2xl hover:bg-gray-100 dark:hover:bg-gray-800/50 h-12 w-12"
                  >
                    <X className="h-5 w-5" />
                  </Button>
                </motion.div>
              )}
            </AnimatePresence>
          </div>
        </header>

        {/* Content */}
        <main className="flex-1 overflow-auto">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.4 }}
            className="h-full"
          >
            {children}
          </motion.div>
        </main>
      </div>
    </div>
  )
}
