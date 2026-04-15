import { WhatsAppChatPage } from "@/components/chat/whatsapp-chat-page"

export default function MentorChatsPage() {
  return (
    <WhatsAppChatPage
      title="Mentor Chats"
      subtitle="Subject groups and direct student chats in one place."
      homeHref="/mentor"
      homeLabel="Back to Mentor Home"
      onboardingHref={null}
    />
  )
}
