"use client"

import type { PlatformAPI, Message, Contact, AuthConfig } from "./types"

export class WhatsAppAPI implements PlatformAPI {
  private accessToken: string | null = null
  private phoneNumberId: string | null = null
  private webhookVerifyToken: string = process.env.NEXT_PUBLIC_WHATSAPP_WEBHOOK_VERIFY_TOKEN || "your_verify_token"

  async authenticate(config: AuthConfig): Promise<boolean> {
    try {
      // WhatsApp Business API authentication
      this.accessToken = config.accessToken
      this.phoneNumberId = config.phoneNumberId

      // Verify the token by making a test API call
      const response = await fetch(`https://graph.facebook.com/v18.0/${this.phoneNumberId}`, {
        headers: {
          Authorization: `Bearer ${this.accessToken}`,
        },
      })

      if (response.ok) {
        console.log("WhatsApp API authenticated successfully")
        return true
      }

      throw new Error("Authentication failed")
    } catch (error) {
      console.error("WhatsApp authentication error:", error)
      return false
    }
  }

  async getMessages(limit = 50): Promise<Message[]> {
    if (!this.accessToken || !this.phoneNumberId) {
      throw new Error("Not authenticated")
    }

    try {
      // Note: WhatsApp Business API doesn't provide message history retrieval
      // This would typically require webhook integration for real-time messages
      const response = await fetch(`https://graph.facebook.com/v18.0/${this.phoneNumberId}/messages?limit=${limit}`, {
        headers: {
          Authorization: `Bearer ${this.accessToken}`,
        },
      })

      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`)
      }

      const data = await response.json()

      return (
        data.data?.map((msg: any) => ({
          id: msg.id,
          content: msg.text?.body || msg.image?.caption || "Media message",
          sender: msg.from === this.phoneNumberId ? "user" : "contact",
          timestamp: new Date(msg.timestamp * 1000).toISOString(),
          platform: "whatsapp" as const,
          contactId: msg.from,
          messageType: msg.type,
          status: msg.status || "sent",
        })) || []
      )
    } catch (error) {
      console.error("Error fetching WhatsApp messages:", error)
      return []
    }
  }

  async sendMessage(contactId: string, content: string): Promise<boolean> {
    if (!this.accessToken || !this.phoneNumberId) {
      throw new Error("Not authenticated")
    }

    try {
      const response = await fetch(`https://graph.facebook.com/v18.0/${this.phoneNumberId}/messages`, {
        method: "POST",
        headers: {
          Authorization: `Bearer ${this.accessToken}`,
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          messaging_product: "whatsapp",
          to: contactId,
          type: "text",
          text: {
            body: content,
          },
        }),
      })

      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`)
      }

      const result = await response.json()
      console.log("WhatsApp message sent:", result)
      return true
    } catch (error) {
      console.error("Error sending WhatsApp message:", error)
      return false
    }
  }

  async getContacts(): Promise<Contact[]> {
    // WhatsApp Business API doesn't provide contact list
    // Contacts are typically managed through webhook events
    return []
  }

  async markAsRead(messageId: string): Promise<boolean> {
    if (!this.accessToken || !this.phoneNumberId) {
      throw new Error("Not authenticated")
    }

    try {
      const response = await fetch(`https://graph.facebook.com/v18.0/${this.phoneNumberId}/messages`, {
        method: "POST",
        headers: {
          Authorization: `Bearer ${this.accessToken}`,
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          messaging_product: "whatsapp",
          status: "read",
          message_id: messageId,
        }),
      })

      return response.ok
    } catch (error) {
      console.error("Error marking WhatsApp message as read:", error)
      return false
    }
  }

  // Webhook handler for incoming messages
  handleWebhook(payload: any): Message | null {
    try {
      const entry = payload.entry?.[0]
      const change = entry?.changes?.[0]
      const message = change?.value?.messages?.[0]

      if (!message) return null

      return {
        id: message.id,
        content: message.text?.body || message.image?.caption || "Media message",
        sender: "contact",
        timestamp: new Date(message.timestamp * 1000).toISOString(),
        platform: "whatsapp",
        contactId: message.from,
        messageType: message.type,
        status: "delivered",
      }
    } catch (error) {
      console.error("Error processing WhatsApp webhook:", error)
      return null
    }
  }
}
