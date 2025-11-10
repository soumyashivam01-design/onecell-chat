"use client"

import { useState, useEffect } from "react"
import { useRouter } from "next/navigation"
import { motion, AnimatePresence } from "framer-motion"
import { PlatformIcon } from "@/components/platform-icon"
import { Button } from "@/components/ui/button"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { Badge } from "@/components/ui/badge"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { useLocalStorage } from "@/hooks/use-local-storage"
import { Clock, Check, CheckCheck } from "lucide-react"
import { apiManager } from "@/lib/api/manager"
import type { Message as APIMessage } from "@/lib/api/types"

interface Message {
  id: string
  platform: "whatsapp" | "instagram" | "telegram" | "messenger"
  sender: {
    name: string
    avatar: string
    initials: string
  }
  lastMessage: string
  time: string
  unread: number
  isOnline: boolean
  messageStatus: "sent" | "delivered" | "read"
}

export function UnifiedInbox() {
  const router = useRouter()
  const [activeTab, setActiveTab] = useState<string>("all")
  const [messages, setMessages] = useLocalStorage<Message[]>("onecell_messages", [
    {
      id: "1",
      platform: "whatsapp",
      sender: {
        name: "Sarah Johnson",
        avatar: "/placeholder.svg?height=48&width=48",
        initials: "SJ",
      },
      lastMessage: "Are we still meeting for coffee tomorrow? ☕",
      time: "2m ago",
      unread: 2,
      isOnline: true,
      messageStatus: "delivered",
    },
    {
      id: "2",
      platform: "instagram",
      sender: {
        name: "Photography Club",
        avatar: "/placeholder.svg?height=48&width=48",
        initials: "PC",
      },
      lastMessage: "New photo challenge: Urban landscapes 📸",
      time: "15m ago",
      unread: 0,
      isOnline: false,
      messageStatus: "read",
    },
    {
      id: "3",
      platform: "telegram",
      sender: {
        name: "Tech News",
        avatar: "/placeholder.svg?height=48&width=48",
        initials: "TN",
      },
      lastMessage: "Apple announces new MacBook Pro with M3 chip 💻",
      time: "1h ago",
      unread: 1,
      isOnline: true,
      messageStatus: "sent",
    },
    {
      id: "4",
      platform: "messenger",
      sender: {
        name: "Work Team",
        avatar: "/placeholder.svg?height=48&width=48",
        initials: "WT",
      },
      lastMessage: "Meeting rescheduled to 3pm 📅",
      time: "3h ago",
      unread: 0,
      isOnline: false,
      messageStatus: "read",
    },
    {
      id: "5",
      platform: "whatsapp",
      sender: {
        name: "Mom",
        avatar: "/placeholder.svg?height=48&width=48",
        initials: "M",
      },
      lastMessage: "Don't forget to call your sister on her birthday 🎂",
      time: "Yesterday",
      unread: 0,
      isOnline: false,
      messageStatus: "read",
    },
    {
      id: "6",
      platform: "instagram",
      sender: {
        name: "Travel Inspiration",
        avatar: "/placeholder.svg?height=48&width=48",
        initials: "TI",
      },
      lastMessage: "Check out these amazing destinations for your next trip! ✈️",
      time: "Yesterday",
      unread: 0,
      isOnline: false,
      messageStatus: "read",
    },
  ])

  const [apiMessages, setApiMessages] = useState<APIMessage[]>([])
  const [isLoadingMessages, setIsLoadingMessages] = useState(false)

  useEffect(() => {
    const loadMessages = async () => {
      setIsLoadingMessages(true)
      try {
        await apiManager.loadSavedAuthentications()
        const messages = await apiManager.getAllMessages(50)
        setApiMessages(messages)
      } catch (error) {
        console.error("Error loading messages:", error)
      } finally {
        setIsLoadingMessages(false)
      }
    }

    loadMessages()

    // Listen for new messages
    const handleNewMessages = (event: CustomEvent) => {
      setApiMessages((prev) => [...event.detail, ...prev])
    }

    window.addEventListener("newMessages", handleNewMessages as EventListener)

    return () => {
      window.removeEventListener("newMessages", handleNewMessages as EventListener)
    }
  }, [])

  const allMessages = [
    ...messages,
    ...apiMessages.map((msg) => ({
      id: msg.id,
      platform: msg.platform,
      sender: {
        name: msg.contactId, // You might want to resolve this to actual names
        avatar: "/placeholder.svg?height=48&width=48",
        initials: msg.contactId.slice(0, 2).toUpperCase(),
      },
      lastMessage: msg.content,
      time: new Date(msg.timestamp).toLocaleTimeString(),
      unread: msg.status !== "read" ? 1 : 0,
      isOnline: false,
      messageStatus: msg.status || "delivered",
    })),
  ]

  const filteredMessages =
    activeTab === "all" ? allMessages : allMessages.filter((message) => message.platform === activeTab)
  const totalUnread = messages.reduce((sum, message) => sum + message.unread, 0)

  const getStatusIcon = (status: string) => {
    switch (status) {
      case "sent":
        return <Check className="h-3 w-3 text-gray-400" />
      case "delivered":
        return <CheckCheck className="h-3 w-3 text-gray-400" />
      case "read":
        return <CheckCheck className="h-3 w-3 text-blue-500" />
      default:
        return <Clock className="h-3 w-3 text-gray-400" />
    }
  }

  return (
    <div className="h-full flex flex-col">
      <div className="p-6">
        <motion.div
          initial={{ opacity: 0, y: -10 }}
          animate={{ opacity: 1, y: 0 }}
          className="flex items-center justify-between mb-6"
        >
          <div>
            <h1 className="text-3xl font-bold bg-gradient-to-r from-gray-900 to-gray-600 dark:from-white dark:to-gray-300 bg-clip-text text-transparent">
              Messages
            </h1>
            {totalUnread > 0 && <p className="text-sm text-gray-500 mt-1">{totalUnread} unread messages</p>}
          </div>
        </motion.div>

        <Tabs defaultValue="all" value={activeTab} onValueChange={setActiveTab} className="w-full">
          <TabsList className="grid grid-cols-5 mb-6 bg-gray-100 dark:bg-gray-800/50 rounded-2xl p-1">
            <TabsTrigger value="all" className="rounded-xl font-medium">
              All
            </TabsTrigger>
            <TabsTrigger value="whatsapp" className="rounded-xl">
              <PlatformIcon platform="whatsapp" size="sm" />
            </TabsTrigger>
            <TabsTrigger value="instagram" className="rounded-xl">
              <PlatformIcon platform="instagram" size="sm" />
            </TabsTrigger>
            <TabsTrigger value="telegram" className="rounded-xl">
              <PlatformIcon platform="telegram" size="sm" />
            </TabsTrigger>
            <TabsTrigger value="messenger" className="rounded-xl">
              <PlatformIcon platform="messenger" size="sm" />
            </TabsTrigger>
          </TabsList>

          <TabsContent value={activeTab} className="mt-0">
            {isLoadingMessages && (
              <div className="flex items-center justify-center py-8">
                <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-500"></div>
                <span className="ml-2 text-gray-500">Loading messages...</span>
              </div>
            )}
            <div className="space-y-3">
              <AnimatePresence>
                {filteredMessages.map((message, index) => (
                  <motion.div
                    key={message.id}
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, y: -20 }}
                    transition={{ duration: 0.3, delay: index * 0.05 }}
                    whileHover={{ scale: 1.02 }}
                    whileTap={{ scale: 0.98 }}
                  >
                    <Button
                      variant="ghost"
                      className={`w-full flex items-center p-4 rounded-2xl transition-all duration-300 ${
                        message.unread > 0
                          ? "bg-gradient-to-r from-blue-50 to-purple-50 dark:from-blue-900/20 dark:to-purple-900/20 border border-blue-200/30 dark:border-blue-700/30"
                          : "hover:bg-gray-50 dark:hover:bg-gray-800/50"
                      } backdrop-blur-sm`}
                      onClick={() => router.push(`/chat/${message.id}`)}
                    >
                      <div className="relative">
                        <Avatar className="h-14 w-14 ring-2 ring-white dark:ring-gray-800 shadow-lg">
                          <AvatarImage src={message.sender.avatar || "/placeholder.svg"} alt={message.sender.name} />
                          <AvatarFallback className="bg-gradient-to-br from-blue-500 to-purple-600 text-white font-semibold">
                            {message.sender.initials}
                          </AvatarFallback>
                        </Avatar>

                        {/* Online indicator */}
                        {message.isOnline && (
                          <div className="absolute -bottom-0.5 -right-0.5 w-4 h-4 bg-green-500 rounded-full border-2 border-white dark:border-gray-800" />
                        )}

                        {/* Platform indicator */}
                        <div className="absolute -top-1 -right-1">
                          <PlatformIcon platform={message.platform} size="sm" />
                        </div>
                      </div>

                      <div className="ml-4 flex-1 text-left">
                        <div className="flex justify-between items-start mb-1">
                          <span
                            className={`font-semibold text-lg ${message.unread > 0 ? "text-gray-900 dark:text-white" : "text-gray-800 dark:text-gray-200"}`}
                          >
                            {message.sender.name}
                          </span>
                          <div className="flex items-center gap-2">
                            <span className="text-sm text-gray-500">{message.time}</span>
                            {getStatusIcon(message.messageStatus)}
                          </div>
                        </div>
                        <p
                          className={`text-sm line-clamp-2 ${message.unread > 0 ? "text-gray-700 dark:text-gray-300 font-medium" : "text-gray-600 dark:text-gray-400"}`}
                        >
                          {message.lastMessage}
                        </p>
                      </div>

                      {message.unread > 0 && (
                        <motion.div initial={{ scale: 0 }} animate={{ scale: 1 }} className="ml-3">
                          <Badge className="bg-gradient-to-r from-blue-500 to-purple-600 text-white border-0 h-6 min-w-6 flex items-center justify-center rounded-full text-xs font-bold">
                            {message.unread}
                          </Badge>
                        </motion.div>
                      )}
                    </Button>
                  </motion.div>
                ))}
              </AnimatePresence>
            </div>
          </TabsContent>
        </Tabs>
      </div>
    </div>
  )
}
