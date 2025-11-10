import { ChatView } from "@/components/chat-view"
import { AppLayout } from "@/components/app-layout"

export default function ChatPage({ params }: { params: { id: string } }) {
  return (
    <AppLayout>
      <ChatView chatId={params.id} />
    </AppLayout>
  )
}
