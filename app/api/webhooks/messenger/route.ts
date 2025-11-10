import { type NextRequest, NextResponse } from "next/server"
import { MessengerAPI } from "@/lib/api/messenger"

const messengerAPI = new MessengerAPI()

export async function GET(request: NextRequest) {
  const searchParams = request.nextUrl.searchParams
  const mode = searchParams.get("hub.mode")
  const token = searchParams.get("hub.verify_token")
  const challenge = searchParams.get("hub.challenge")

  // Verify webhook
  if (mode === "subscribe" && token === process.env.MESSENGER_WEBHOOK_VERIFY_TOKEN) {
    console.log("Messenger webhook verified")
    return new NextResponse(challenge)
  }

  return new NextResponse("Forbidden", { status: 403 })
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json()

    // Process incoming Messenger message
    const message = messengerAPI.handleWebhook(body)

    if (message) {
      console.log("New Messenger message:", message)

      // Store message or emit event for real-time updates
    }

    return NextResponse.json({ success: true })
  } catch (error) {
    console.error("Messenger webhook error:", error)
    return NextResponse.json({ error: "Internal server error" }, { status: 500 })
  }
}
