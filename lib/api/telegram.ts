"use client"

import type { PlatformAPI, Message, Contact, AuthConfig } from "./types"

export class TelegramAPI implements PlatformAPI {
  private botToken: string | null = null
  private apiUrl = "https://api.telegram.org/bot"
  private offset = 0

  async authenticate(config: AuthConfig): Promise<boolean> {
    try {
      this.botToken = config.botToken

      if (!this.botToken) {
        throw new Error("Bot token is required")
      }

      // Verify bot token
      const response = await fetch(`${this.apiUrl}${this.botToken}/getMe`)

      if (response.ok) {
        const data = await response.json()
        if (data.ok) {
          console.log("Telegram Bot authenticated successfully:", data.result.username)
          return true
        }
      }

      throw new Error("Authentication failed")
    } catch (error) {
      console.error("Telegram authentication error:", error)
      return false
    }
  }

  async getMessages(limit = 50): Promise<Message[]> {
    if (!this.botToken) {
      throw new Error("Not authenticated")
    }

    try {
      const response = await fetch(`${this.apiUrl}${this.botToken}/getUpdates?offset=${this.offset}&limit=${limit}`)

      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`)
      }

      const data = await response.json()

      if (!data.ok) {
        throw new Error("Telegram API error: " + data.description)
      }

      const messages: Message[] = data.result
        .map((update: any) => {
          const message = update.message || update.edited_message
          if (!message) return null

          // Update offset for next request
          this.offset = Math.max(this.offset, update.update_id + 1)

          return {
            id: message.message_id.toString(),
            content: message.text || message.caption || "Media message",
            sender: message.from?.is_bot ? "user" : "contact",
            timestamp: new Date(message.date * 1000).toISOString(),
            platform: "telegram" as const,
            contactId: message.from?.id?.toString(),
            messageType: message.text ? "text" : "media",
            status: "delivered",
          }
        })
        .filter(Boolean)

      return messages
    } catch (error) {
      console.error("Error fetching Telegram messages:", error)
      return []
    }
  }

  async sendMessage(contactId: string, content: string): Promise<boolean> {
    if (!this.botToken) {
      throw new Error("Not authenticated")
    }

    try {
      const response = await fetch(`${this.apiUrl}${this.botToken}/sendMessage`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          chat_id: contactId,
          text: content,
          parse_mode: "HTML",
        }),
      })

      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`)
      }

      const data = await response.json()

      if (data.ok) {
        console.log("Telegram message sent successfully")
        return true
      } else {
        throw new Error("Telegram API error: " + data.description)
      }
    } catch (error) {
      console.error("Error sending Telegram message:", error)
      return false
    }
  }

  async getContacts(): Promise<Contact[]> {
    // Telegram Bot API doesn't provide a way to get all contacts
    // Contacts are discovered through incoming messages
    return []
  }

  async markAsRead(messageId: string): Promise<boolean> {
    // Telegram Bot API doesn't have a mark as read functionality
    // Read receipts are handled automatically by the client
    return true
  }

  // Set webhook for real-time message updates
  async setWebhook(webhookUrl: string): Promise<boolean> {
    if (!this.botToken) {
      throw new Error("Not authenticated")
    }

    try {
      const response = await fetch(`${this.apiUrl}${this.botToken}/setWebhook`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          url: webhookUrl,
          allowed_updates: ["message", "edited_message"],
        }),
      })

      const data = await response.json()
      return data.ok
    } catch (error) {
      console.error("Error setting Telegram webhook:", error)
      return false
    }
  }

  // Handle webhook updates
  handleWebhook(payload: any): Message | null {
    try {
      const message = payload.message || payload.edited_message
      if (!message) return null

      return {
        id: message.message_id.toString(),
        content: message.text || message.caption || "Media message",
        sender: "contact",
        timestamp: new Date(message.date * 1000).toISOString(),
        platform: "telegram",
        contactId: message.from?.id?.toString(),
        messageType: message.text ? "text" : "media",
        status: "delivered",
      }
    } catch (error) {
      console.error("Error processing Telegram webhook:", error)
      return null
    }
  }
}
