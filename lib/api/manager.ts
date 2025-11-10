"use client"

import { WhatsAppAPI } from "./whatsapp"
import { InstagramAPI } from "./instagram"
import { TelegramAPI } from "./telegram"
import { MessengerAPI } from "./messenger"
import type { PlatformAPI, Message, Contact, AuthConfig } from "./types"

export class APIManager {
  private apis: Map<string, PlatformAPI> = new Map()
  private authenticatedPlatforms: Set<string> = new Set()

  constructor() {
    this.apis.set("whatsapp", new WhatsAppAPI())
    this.apis.set("instagram", new InstagramAPI())
    this.apis.set("telegram", new TelegramAPI())
    this.apis.set("messenger", new MessengerAPI())
  }

  async authenticatePlatform(platform: string, config: AuthConfig): Promise<boolean> {
    const api = this.apis.get(platform)
    if (!api) {
      throw new Error(`Platform ${platform} not supported`)
    }

    try {
      const success = await api.authenticate(config)
      if (success) {
        this.authenticatedPlatforms.add(platform)
        // Store auth config in localStorage for persistence
        localStorage.setItem(`onecell_auth_${platform}`, JSON.stringify(config))
      }
      return success
    } catch (error) {
      console.error(`Authentication failed for ${platform}:`, error)
      return false
    }
  }

  async getAllMessages(limit = 50): Promise<Message[]> {
    const allMessages: Message[] = []

    for (const [platform, api] of this.apis) {
      if (this.authenticatedPlatforms.has(platform)) {
        try {
          const messages = await api.getMessages(limit)
          allMessages.push(...messages)
        } catch (error) {
          console.error(`Error fetching messages from ${platform}:`, error)
        }
      }
    }

    // Sort by timestamp (newest first)
    return allMessages.sort((a, b) => new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime())
  }

  async getMessagesByPlatform(platform: string, limit = 50): Promise<Message[]> {
    const api = this.apis.get(platform)
    if (!api || !this.authenticatedPlatforms.has(platform)) {
      return []
    }

    try {
      return await api.getMessages(limit)
    } catch (error) {
      console.error(`Error fetching messages from ${platform}:`, error)
      return []
    }
  }

  async sendMessage(platform: string, contactId: string, content: string): Promise<boolean> {
    const api = this.apis.get(platform)
    if (!api || !this.authenticatedPlatforms.has(platform)) {
      throw new Error(`Platform ${platform} not authenticated`)
    }

    try {
      return await api.sendMessage(contactId, content)
    } catch (error) {
      console.error(`Error sending message via ${platform}:`, error)
      return false
    }
  }

  async getAllContacts(): Promise<Contact[]> {
    const allContacts: Contact[] = []

    for (const [platform, api] of this.apis) {
      if (this.authenticatedPlatforms.has(platform)) {
        try {
          const contacts = await api.getContacts()
          allContacts.push(...contacts)
        } catch (error) {
          console.error(`Error fetching contacts from ${platform}:`, error)
        }
      }
    }

    return allContacts
  }

  async markAsRead(platform: string, messageId: string): Promise<boolean> {
    const api = this.apis.get(platform)
    if (!api || !this.authenticatedPlatforms.has(platform)) {
      return false
    }

    try {
      return await api.markAsRead(messageId)
    } catch (error) {
      console.error(`Error marking message as read on ${platform}:`, error)
      return false
    }
  }

  isAuthenticated(platform: string): boolean {
    return this.authenticatedPlatforms.has(platform)
  }

  getAuthenticatedPlatforms(): string[] {
    return Array.from(this.authenticatedPlatforms)
  }

  async disconnectPlatform(platform: string): Promise<void> {
    this.authenticatedPlatforms.delete(platform)
    localStorage.removeItem(`onecell_auth_${platform}`)
  }

  // Load saved authentication configs on initialization
  async loadSavedAuthentications(): Promise<void> {
    const platforms = ["whatsapp", "instagram", "telegram", "messenger"]

    for (const platform of platforms) {
      const savedConfig = localStorage.getItem(`onecell_auth_${platform}`)
      if (savedConfig) {
        try {
          const config = JSON.parse(savedConfig)
          await this.authenticatePlatform(platform, config)
        } catch (error) {
          console.error(`Error loading saved auth for ${platform}:`, error)
          localStorage.removeItem(`onecell_auth_${platform}`)
        }
      }
    }
  }

  // Real-time message polling
  startPolling(intervalMs = 30000): void {
    setInterval(async () => {
      try {
        const newMessages = await this.getAllMessages(10)
        if (newMessages.length > 0) {
          // Emit event for new messages
          window.dispatchEvent(
            new CustomEvent("newMessages", {
              detail: newMessages,
            }),
          )
        }
      } catch (error) {
        console.error("Error during message polling:", error)
      }
    }, intervalMs)
  }
}

// Singleton instance
export const apiManager = new APIManager()
