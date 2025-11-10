"use client"

import type { PlatformAPI, Message, Contact, AuthConfig } from "./types"

export class MessengerAPI implements PlatformAPI {
  private accessToken: string | null = null
  private pageId: string | null = null

  async authenticate(config: AuthConfig): Promise<boolean> {
    try {
      // Facebook Messenger Platform API
      this.accessToken = config.accessToken
      this.pageId = config.pageId

      // Verify token and page access
      const response = await fetch(`https://graph.facebook.com/v18.0/${this.pageId}?access_token=${this.accessToken}`)

      if (response.ok) {
        console.log("Messenger API authenticated successfully")
        return true
      }

      throw new Error("Authentication failed")
    } catch (error) {
      console.error("Messenger authentication error:", error)
      return false
    }
  }

  async getMessages(limit = 50): Promise<Message[]> {
    if (!this.accessToken || !this.pageId) {
      throw new Error("Not authenticated")
    }

    try {
      // Get conversations
      const response = await fetch(
        `https://graph.facebook.com/v18.0/${this.pageId}/conversations?limit=${limit}&access_token=${this.accessToken}`,
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
              platform: "messenger",
              contactId: msg.from?.id,
              messageType: msg.attachments ? "media" : "text",
              status: "delivered",
            })
          })
        }
      }

      return messages.sort((a, b) => new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime())
    } catch (error) {
      console.error("Error fetching Messenger messages:", error)
      return []
    }
  }

  async sendMessage(contactId: string, content: string): Promise<boolean> {
    if (!this.accessToken) {
      throw new Error("Not authenticated")
    }

    try {
      const response = await fetch(`https://graph.facebook.com/v18.0/me/messages?access_token=${this.accessToken}`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          recipient: { id: contactId },
          message: { text: content },
          messaging_type: "RESPONSE",
        }),
      })

      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`)
      }

      console.log("Messenger message sent successfully")
      return true
    } catch (error) {
      console.error("Error sending Messenger message:", error)
      return false
    }
  }

  async getContacts(): Promise<Contact[]> {
    if (!this.accessToken || !this.pageId) {
      throw new Error("Not authenticated")
    }

    try {
      const response = await fetch(
        `https://graph.facebook.com/v18.0/${this.pageId}/conversations?access_token=${this.accessToken}`,
      )

      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`)
      }

      const data = await response.json()

      return (
        data.data?.map((conversation: any) => ({
          id: conversation.participants?.data?.[0]?.id || conversation.id,
          name: conversation.participants?.data?.[0]?.name || "Messenger User",
          avatar: `https://graph.facebook.com/${conversation.participants?.data?.[0]?.id}/picture?access_token=${this.accessToken}`,
          platform: "messenger",
          isOnline: false,
          lastSeen: conversation.updated_time,
        })) || []
      )
    } catch (error) {
      console.error("Error fetching Messenger contacts:", error)
      return []
    }
  }

  async markAsRead(messageId: string): Promise<boolean> {
    if (!this.accessToken) {
      throw new Error("Not authenticated")
    }

    try {
      const response = await fetch(`https://graph.facebook.com/v18.0/me/messages?access_token=${this.accessToken}`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          recipient: { id: messageId },
          sender_action: "mark_seen",
        }),
      })

      return response.ok
    } catch (error) {
      console.error("Error marking Messenger message as read:", error)
      return false
    }
  }

  // Handle webhook for real-time messages
  handleWebhook(payload: any): Message | null {
    try {
      const entry = payload.entry?.[0]
      const messaging = entry?.messaging?.[0]
      const message = messaging?.message

      if (!message) return null

      return {
        id: message.mid,
        content: message.text || message.attachments?.[0]?.payload?.url || "Media message",
        sender: "contact",
        timestamp: new Date(messaging.timestamp).toISOString(),
        platform: "messenger",
        contactId: messaging.sender?.id,
        messageType: message.text ? "text" : "media",
        status: "delivered",
      }
    } catch (error) {
      console.error("Error processing Messenger webhook:", error)
      return null
    }
  }
}
