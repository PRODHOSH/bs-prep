import { WhatsAppChatPage } from "@/components/chat/whatsapp-chat-page"

export default function AdminChatsPage() {
  return (
    <WhatsAppChatPage
      title="Admin Chats"
      subtitle="Monitor all group conversations and personal direct chats."
      homeHref="/admin"
      homeLabel="Back to Dashboard"
      onboardingHref={null}
      headerTheme="dark"
    />
  )
}
