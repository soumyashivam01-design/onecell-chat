"use client"

import type { PlatformAPI, Message, Contact, AuthConfig } from "./types"

export class InstagramAPI implements PlatformAPI {
  private accessToken: string | null = null
  private pageId: string | null = null

  async authenticate(config: AuthConfig): Promise<boolean> {
    try {
      // Instagram Basic Display API or Instagram Graph API
      this.accessToken = config.accessToken
      this.pageId = config.pageId

      // Verify token
      const response = await fetch(`https://graph.facebook.com/v18.0/me?access_token=${this.accessToken}`)

      if (response.ok) {
        console.log("Instagram API authenticated successfully")
        return true
      }

      throw new Error("Authentication failed")
    } catch (error) {
      console.error("Instagram authentication error:", error)
      return false
    }
  }

  async getMessages(limit = 50): Promise<Message[]> {
    if (!this.accessToken || !this.pageId) {
      throw new Error("Not authenticated")
    }

    try {
      // Get Instagram conversations
      const response = await fetch(
        `https://graph.facebook.com/v18.0/${this.pageId}/conversations?platform=instagram&limit=${limit}&access_token=${this.accessToken}`,
      )

      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`)
      }

      const data = await response.json()
      const messages: Message[] = []

      // Fetch messages for each conversation
      for (const conversation of data.data || []) {
        const messagesResponse = await fetch(
          `https://graph.facebook.com/v18.0/${conversation.id}/messages?access_token=${this.accessToken}`,
        )

        if (messagesResponse.ok) {
          const messagesData = await messagesResponse.json()

          messagesData.data?.forEach((msg: any) => {
            messages.push({
              id: msg.id,
              content: msg.message || msg.attachments?.[0]?.name || "Media message",
              sender: msg.from?.id === this.pageId ? "user" : "contact",
              timestamp: msg.created_time,
              platform: "instagram",
              contactId: msg.from?.id,
              messageType: msg.attachments ? "media" : "text",
              status: "delivered",
            })
          })
        }
      }

      return messages.sort((a, b) => new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime())
    } catch (error) {
      console.error("Error fetching Instagram messages:", error)
      return []
    }
  }

  async sendMessage(contactId: string, content: string): Promise<boolean> {
    if (!this.accessToken || !this.pageId) {
      throw new Error("Not authenticated")
    }

    try {
      const response = await fetch(`https://graph.facebook.com/v18.0/${this.pageId}/messages`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          recipient: { id: contactId },
          message: { text: content },
          access_token: this.accessToken,
        }),
      })

      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`)
      }

      console.log("Instagram message sent successfully")
      return true
    } catch (error) {
      console.error("Error sending Instagram message:", error)
      return false
    }
  }

  async getContacts(): Promise<Contact[]> {
    if (!this.accessToken || !this.pageId) {
      throw new Error("Not authenticated")
    }

    try {
      const response = await fetch(
        `https://graph.facebook.com/v18.0/${this.pageId}/conversations?platform=instagram&access_token=${this.accessToken}`,
      )

      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`)
      }

      const data = await response.json()

      return (
        data.data?.map((conversation: any) => ({
          id: conversation.participants?.data?.[0]?.id || conversation.id,
          name: conversation.participants?.data?.[0]?.name || "Instagram User",
          avatar: conversation.participants?.data?.[0]?.profile_pic || "/placeholder.svg",
          platform: "instagram",
          isOnline: false,
          lastSeen: conversation.updated_time,
        })) || []
      )
    } catch (error) {
      console.error("Error fetching Instagram contacts:", error)
      return []
    }
  }

  async markAsRead(messageId: string): Promise<boolean> {
    // Instagram doesn't provide a direct API for marking messages as read
    // This would typically be handled through webhook confirmations
    return true
  }
}
