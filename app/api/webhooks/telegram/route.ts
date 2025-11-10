import { type NextRequest, NextResponse } from "next/server"
import { TelegramAPI } from "@/lib/api/telegram"

const telegramAPI = new TelegramAPI()

export async function POST(request: NextRequest) {
  try {
    const body = await request.json()

    // Process incoming Telegram update
    const message = telegramAPI.handleWebhook(body)

    if (message) {
      console.log("New Telegram message:", message)

      // Store message or emit event for real-time updates
    }

    return NextResponse.json({ success: true })
  } catch (error) {
    console.error("Telegram webhook error:", error)
    return NextResponse.json({ error: "Internal server error" }, { status: 500 })
  }
}
