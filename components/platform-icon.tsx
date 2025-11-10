import { MessageCircle, Instagram, Send, MessageSquare } from "lucide-react"

type Platform = "whatsapp" | "instagram" | "telegram" | "messenger"

interface PlatformIconProps {
  platform: Platform
  size?: "sm" | "md" | "lg"
}

export function PlatformIcon({ platform, size = "md" }: PlatformIconProps) {
  const sizeClass = {
    sm: "h-4 w-4",
    md: "h-6 w-6",
    lg: "h-8 w-8",
  }

  const containerSize = {
    sm: "p-1.5",
    md: "p-2",
    lg: "p-3",
  }

  const getIconByPlatform = () => {
    switch (platform) {
      case "whatsapp":
        return (
          <div className={`${containerSize[size]} bg-gradient-to-br from-green-400 to-green-600 rounded-xl shadow-lg`}>
            <MessageCircle className={`${sizeClass[size]} text-white`} />
          </div>
        )
      case "instagram":
        return (
          <div className={`${containerSize[size]} bg-gradient-to-br from-pink-500 to-purple-600 rounded-xl shadow-lg`}>
            <Instagram className={`${sizeClass[size]} text-white`} />
          </div>
        )
      case "telegram":
        return (
          <div className={`${containerSize[size]} bg-gradient-to-br from-blue-400 to-blue-600 rounded-xl shadow-lg`}>
            <Send className={`${sizeClass[size]} text-white`} />
          </div>
        )
      case "messenger":
        return (
          <div className={`${containerSize[size]} bg-gradient-to-br from-blue-500 to-cyan-500 rounded-xl shadow-lg`}>
            <MessageSquare className={`${sizeClass[size]} text-white`} />
          </div>
        )
      default:
        return (
          <div className={`${containerSize[size]} bg-gradient-to-br from-gray-400 to-gray-600 rounded-xl shadow-lg`}>
            <MessageCircle className={`${sizeClass[size]} text-white`} />
          </div>
        )
    }
  }

  return getIconByPlatform()
}
