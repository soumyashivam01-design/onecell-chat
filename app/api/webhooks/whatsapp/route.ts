import { type NextRequest, NextResponse } from "next/server"
import { WhatsAppAPI } from "@/lib/api/whatsapp"

const whatsappAPI = new WhatsAppAPI()

export async function GET(request: NextRequest) {
  const searchParams = request.nextUrl.searchParams
  const mode = searchParams.get("hub.mode")
  const token = searchParams.get("hub.verify_token")
  const challenge = searchParams.get("hub.challenge")

  // Verify webhook
  if (mode === "subscribe" && token === process.env.WHATSAPP_WEBHOOK_VERIFY_TOKEN) {
    console.log("WhatsApp webhook verified")
    return new NextResponse(challenge)
  }

  return new NextResponse("Forbidden", { status: 403 })
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json()

    // Process incoming WhatsApp message
    const message = whatsappAPI.handleWebhook(body)

    if (message) {
      // Store message in local storage or emit event
      console.log("New WhatsApp message:", message)

      // You could emit a server-sent event here for real-time updates
      // or store in a database if available
    }

    return NextResponse.json({ success: true })
  } catch (error) {
    console.error("WhatsApp webhook error:", error)
    return NextResponse.json({ error: "Internal server error" }, { status: 500 })
  }
}
