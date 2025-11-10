export interface Message {
  id: string
  content: string
  sender: "user" | "contact"
  timestamp: string
  platform: "whatsapp" | "instagram" | "telegram" | "messenger"
  contactId: string
  messageType?: "text" | "media" | "file" | "voice"
  status?: "sent" | "delivered" | "read" | "failed"
  attachments?: Attachment[]
}

export interface Contact {
  id: string
  name: string
  avatar?: string
  platform: "whatsapp" | "instagram" | "telegram" | "messenger"
  isOnline?: boolean
  lastSeen?: string
  phoneNumber?: string
  username?: string
}

export interface Attachment {
  id: string
  type: "image" | "video" | "audio" | "document"
  url: string
  name?: string
  size?: number
}

export interface AuthConfig {
  accessToken?: string
  botToken?: string
  phoneNumberId?: string
  pageId?: string
  appId?: string
  appSecret?: string
  webhookUrl?: string
}

export interface PlatformAPI {
  authenticate(config: AuthConfig): Promise<boolean>
  getMessages(limit?: number): Promise<Message[]>
  sendMessage(contactId: string, content: string): Promise<boolean>
  getContacts(): Promise<Contact[]>
  markAsRead(messageId: string): Promise<boolean>
}

export interface APIResponse<T> {
  success: boolean
  data?: T
  error?: string
  pagination?: {
    hasNext: boolean
    nextCursor?: string
  }
}
