"use client"

import { useState, useRef, useEffect } from "react"
import { useRouter } from "next/navigation"
import { motion, AnimatePresence } from "framer-motion"
import { PlatformIcon } from "@/components/platform-icon"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import {
  ArrowLeft,
  Send,
  Paperclip,
  Mic,
  ImageIcon,
  Phone,
  Video,
  MoreHorizontal,
  Check,
  CheckCheck,
  X,
} from "lucide-react"
import { useLocalStorage } from "@/hooks/use-local-storage"
import { apiManager } from "@/lib/api/manager"

interface ChatMessage {
  id: string
  content: string
  sender: "user" | "contact"
  timestamp: string
  status: "sent" | "delivered" | "read" | "failed"
}

interface ChatData {
  id: string
  platform: "whatsapp" | "instagram" | "telegram" | "messenger"
  contact: {
    name: string
    avatar: string
    initials: string
    status: "online" | "offline" | "typing"
    lastSeen?: string
  }
  messages: ChatMessage[]
}

export function ChatView({ chatId }: { chatId: string }) {
  const router = useRouter()
  const [newMessage, setNewMessage] = useState("")
  const messagesEndRef = useRef<HTMLDivElement>(null)
  const [isTyping, setIsTyping] = useState(false)
  const [chatData, setChatData] = useLocalStorage<ChatData | null>(`onecell_chat_${chatId}`, null)

  // Initialize chat data if not exists
  useEffect(() => {
    if (!chatData) {
      const initialChatData: ChatData = {
        id: chatId,
        platform:
          chatId === "1" || chatId === "5"
            ? "whatsapp"
            : chatId === "2" || chatId === "6"
              ? "instagram"
              : chatId === "3"
                ? "telegram"
                : "messenger",
        contact: {
          name:
            chatId === "1"
              ? "Sarah Johnson"
              : chatId === "2"
                ? "Photography Club"
                : chatId === "3"
                  ? "Tech News"
                  : chatId === "4"
                    ? "Work Team"
                    : chatId === "5"
                      ? "Mom"
                      : "Travel Inspiration",
          avatar: "/placeholder.svg?height=48&width=48",
          initials:
            chatId === "1"
              ? "SJ"
              : chatId === "2"
                ? "PC"
                : chatId === "3"
                  ? "TN"
                  : chatId === "4"
                    ? "WT"
                    : chatId === "5"
                      ? "M"
                      : "TI",
          status: chatId === "1" ? "online" : chatId === "3" ? "online" : "offline",
          lastSeen: chatId === "1" ? undefined : "2 hours ago",
        },
        messages: [
          {
            id: "m1",
            content: "Hey there! How's your day going?",
            sender: "contact",
            timestamp: "10:30 AM",
            status: "read",
          },
          {
            id: "m2",
            content: "Pretty good! Just working on that project we discussed.",
            sender: "user",
            timestamp: "10:32 AM",
            status: "read",
          },
          {
            id: "m3",
            content: "That's great to hear! How's the progress?",
            sender: "contact",
            timestamp: "10:33 AM",
            status: "read",
          },
          {
            id: "m4",
            content: "Coming along nicely. I should have something to show you by tomorrow.",
            sender: "user",
            timestamp: "10:35 AM",
            status: "delivered",
          },
          {
            id: "m5",
            content: "Looking forward to it! Let me know if you need any help.",
            sender: "contact",
            timestamp: "10:36 AM",
            status: "read",
          },
        ],
      }
      setChatData(initialChatData)
    }
  }, [chatId, chatData, setChatData])

  // Scroll to bottom of messages
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" })
  }, [chatData?.messages])

  // Simulate typing indicator
  useEffect(() => {
    if (chatData?.contact.status === "typing") {
      setIsTyping(true)
    } else {
      setIsTyping(false)
    }
  }, [chatData?.contact.status])

  const handleSendMessage = async () => {
    if (newMessage.trim() === "" || !chatData) return

    const newMsg: ChatMessage = {
      id: `m${chatData.messages.length + 1}`,
      content: newMessage,
      sender: "user",
      timestamp: new Date().toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" }),
      status: "sent",
    }

    // Add message to local state immediately
    setChatData({
      ...chatData,
      messages: [...chatData.messages, newMsg],
    })

    setNewMessage("")

    // Try to send via API if platform is connected
    try {
      const success = await apiManager.sendMessage(
        chatData.platform,
        chatData.contact.name, // This should be the actual contact ID
        newMessage,
      )

      if (success) {
        // Update message status to delivered
        setChatData((prev) =>
          prev
            ? {
                ...prev,
                messages: prev.messages.map((msg) => (msg.id === newMsg.id ? { ...msg, status: "delivered" } : msg)),
              }
            : null,
        )
      } else {
        // Update message status to failed
        setChatData((prev) =>
          prev
            ? {
                ...prev,
                messages: prev.messages.map((msg) => (msg.id === newMsg.id ? { ...msg, status: "failed" } : msg)),
              }
            : null,
        )
      }
    } catch (error) {
      console.error("Error sending message:", error)
      // Update message status to failed
      setChatData((prev) =>
        prev
          ? {
              ...prev,
              messages: prev.messages.map((msg) => (msg.id === newMsg.id ? { ...msg, status: "failed" } : msg)),
            }
          : null,
      )
    }
  }

  const getStatusIcon = (status: string) => {
    switch (status) {
      case "sent":
        return <Check className="h-3 w-3 text-gray-400" />
      case "delivered":
        return <CheckCheck className="h-3 w-3 text-gray-400" />
      case "read":
        return <CheckCheck className="h-3 w-3 text-blue-500" />
      case "failed":
        return <X className="h-3 w-3 text-red-500" />
      default:
        return null
    }
  }

  if (!chatData) {
    return <div className="flex items-center justify-center h-full">Loading...</div>
  }

  return (
    <div className="h-full flex flex-col">
      {/* Chat header */}
      <motion.div
        initial={{ opacity: 0, y: -10 }}
        animate={{ opacity: 1, y: 0 }}
        className="p-4 border-b border-gray-100 dark:border-gray-800 backdrop-blur-xl bg-white/95 dark:bg-gray-900/95 flex items-center shadow-sm"
      >
        <Button
          variant="ghost"
          size="icon"
          onClick={() => router.push("/inbox")}
          className="mr-3 rounded-full hover:bg-gray-100 dark:hover:bg-gray-800"
        >
          <ArrowLeft className="h-5 w-5" />
        </Button>

        <div className="relative">
          <Avatar className="h-12 w-12 ring-2 ring-white dark:ring-gray-800 shadow-md">
            <AvatarImage src={chatData.contact.avatar || "/placeholder.svg"} alt={chatData.contact.name} />
            <AvatarFallback className="bg-gradient-to-br from-blue-500 to-purple-600 text-white font-semibold">
              {chatData.contact.initials}
            </AvatarFallback>
          </Avatar>

          {chatData.contact.status === "online" && (
            <div className="absolute -bottom-0.5 -right-0.5 w-4 h-4 bg-green-500 rounded-full border-2 border-white dark:border-gray-800" />
          )}
        </div>

        <div className="ml-4 flex-1">
          <div className="flex items-center">
            <span className="font-semibold text-lg">{chatData.contact.name}</span>
            <div className="ml-2">
              <PlatformIcon platform={chatData.platform} size="sm" />
            </div>
          </div>
          <p className="text-sm text-gray-500">
            {chatData.contact.status === "online"
              ? "Online"
              : chatData.contact.status === "typing"
                ? "Typing..."
                : `Last seen ${chatData.contact.lastSeen || "recently"}`}
          </p>
        </div>

        <div className="flex gap-2">
          <Button variant="ghost" size="icon" className="rounded-full hover:bg-gray-100 dark:hover:bg-gray-800">
            <Phone className="h-5 w-5" />
          </Button>
          <Button variant="ghost" size="icon" className="rounded-full hover:bg-gray-100 dark:hover:bg-gray-800">
            <Video className="h-5 w-5" />
          </Button>
          <Button variant="ghost" size="icon" className="rounded-full hover:bg-gray-100 dark:hover:bg-gray-800">
            <MoreHorizontal className="h-5 w-5" />
          </Button>
        </div>
      </motion.div>

      {/* Messages */}
      <div className="flex-1 overflow-y-auto p-4 space-y-4 bg-gradient-to-b from-gray-50/50 to-gray-100/50 dark:from-gray-950/50 dark:to-gray-900/50">
        <AnimatePresence>
          {chatData.messages.map((message, index) => (
            <motion.div
              key={message.id}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.3, delay: index * 0.05 }}
              className={`flex ${message.sender === "user" ? "justify-end" : "justify-start"}`}
            >
              <div
                className={`max-w-[75%] rounded-3xl px-5 py-3 shadow-sm ${
                  message.sender === "user"
                    ? "bg-gradient-to-r from-blue-500 to-purple-600 text-white rounded-br-lg"
                    : "bg-white dark:bg-gray-800 rounded-bl-lg border border-gray-100 dark:border-gray-700"
                }`}
              >
                <p className="text-sm leading-relaxed">{message.content}</p>
                <div
                  className={`flex items-center justify-end gap-1 mt-2 ${message.sender === "user" ? "text-blue-100" : "text-gray-500"}`}
                >
                  <span className="text-xs">{message.timestamp}</span>
                  {message.sender === "user" && getStatusIcon(message.status)}
                </div>
              </div>
            </motion.div>
          ))}
        </AnimatePresence>

        {isTyping && (
          <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="flex justify-start">
            <div className="bg-white dark:bg-gray-800 rounded-3xl rounded-bl-lg px-5 py-3 border border-gray-100 dark:border-gray-700 shadow-sm">
              <div className="flex space-x-1">
                {[0, 1, 2].map((i) => (
                  <motion.div
                    key={i}
                    animate={{ y: [0, -8, 0] }}
                    transition={{ repeat: Number.POSITIVE_INFINITY, duration: 1.2, delay: i * 0.2 }}
                    className="w-2 h-2 rounded-full bg-gray-400"
                  />
                ))}
              </div>
            </div>
          </motion.div>
        )}

        <div ref={messagesEndRef} />
      </div>

      {/* Message input */}
      <motion.div
        initial={{ opacity: 0, y: 10 }}
        animate={{ opacity: 1, y: 0 }}
        className="p-4 border-t border-gray-100 dark:border-gray-800 backdrop-blur-xl bg-white/95 dark:bg-gray-900/95"
      >
        <div className="flex items-center gap-3">
          <Button variant="ghost" size="icon" className="text-gray-500 hover:text-blue-500 rounded-full">
            <Paperclip className="h-5 w-5" />
          </Button>
          <Button variant="ghost" size="icon" className="text-gray-500 hover:text-blue-500 rounded-full">
            <ImageIcon className="h-5 w-5" />
          </Button>

          <div className="flex-1 relative">
            <Input
              value={newMessage}
              onChange={(e) => setNewMessage(e.target.value)}
              placeholder="Type a message..."
              className="rounded-3xl bg-gray-100 dark:bg-gray-800 border-0 px-5 py-3 h-12 focus:ring-2 focus:ring-blue-500/20 transition-all duration-200"
              onKeyDown={(e) => {
                if (e.key === "Enter" && !e.shiftKey) {
                  e.preventDefault()
                  handleSendMessage()
                }
              }}
            />
          </div>

          {newMessage.trim() === "" ? (
            <Button variant="ghost" size="icon" className="text-gray-500 hover:text-blue-500 rounded-full">
              <Mic className="h-5 w-5" />
            </Button>
          ) : (
            <motion.div
              initial={{ scale: 0 }}
              animate={{ scale: 1 }}
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
            >
              <Button
                onClick={handleSendMessage}
                size="icon"
                className="bg-gradient-to-r from-blue-500 to-purple-600 hover:from-blue-600 hover:to-purple-700 text-white rounded-full h-12 w-12 shadow-lg"
              >
                <Send className="h-5 w-5" />
              </Button>
            </motion.div>
          )}
        </div>
      </motion.div>
    </div>
  )
}
