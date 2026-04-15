import { WhatsAppChatPage } from "@/components/chat/whatsapp-chat-page"

export default function DashboardChatsPage() {
  return (
    <WhatsAppChatPage
      title="Chat Hub"
      subtitle="Subject groups and personal mentor chats in one place."
      homeHref="/dashboard"
      homeLabel="Back to Dashboard"
    />
  )
}
