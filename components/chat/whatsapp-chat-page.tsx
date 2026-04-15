"use client"

import { useEffect, useMemo, useRef, useState } from "react"
import Link from "next/link"
import {
  ArrowLeft,
  CheckCheck,
  Loader2,
  MessageCircle,
  MessagesSquare,
  Search,
  SendHorizonal,
  Users,
  UserRound,
} from "lucide-react"

type Conversation = {
  id: string
  kind: "group" | "direct"
  title: string
  subtitle: string
  course_id: string
  last_message: string
  last_message_at: string | null
  last_sender_name: string | null
  last_sender_role: "student" | "mentor" | "admin" | null
}

type ThreadMessage = {
  id: string
  sender_id: string
  sender_role: "student" | "mentor" | "admin"
  sender_name: string
  message: string
  created_at: string
}

type ThreadResponse = {
  conversation: {
    id: string
    kind: "group" | "direct"
    title: string
    subtitle: string
    course_id: string
  }
  messages: ThreadMessage[]
}

type InboxResponse = {
  viewer_role: "student" | "mentor" | "admin"
  needs_mentor_subject: boolean
  conversations: Conversation[]
}

type WhatsAppChatPageProps = {
  title: string
  subtitle: string
  homeHref: string
  homeLabel: string
  onboardingHref?: string | null
}

function formatListTime(value: string | null): string {
  if (!value) {
    return ""
  }

  const date = new Date(value)
  const now = new Date()
  const diff = now.getTime() - date.getTime()

  if (diff < 1000 * 60 * 60 * 24) {
    return date.toLocaleTimeString("en-IN", { hour: "2-digit", minute: "2-digit", hour12: true })
  }

  return date.toLocaleDateString("en-IN", { day: "numeric", month: "short" })
}

function formatMessageTime(value: string): string {
  return new Date(value).toLocaleString("en-IN", {
    day: "numeric",
    month: "short",
    hour: "2-digit",
    minute: "2-digit",
    hour12: true,
  })
}

export function WhatsAppChatPage({ title, subtitle, homeHref, homeLabel, onboardingHref }: WhatsAppChatPageProps) {
  const [inbox, setInbox] = useState<InboxResponse | null>(null)
  const [selectedConversationId, setSelectedConversationId] = useState<string | null>(null)
  const [threadLoading, setThreadLoading] = useState(false)
  const [listLoading, setListLoading] = useState(true)
  const [sending, setSending] = useState(false)
  const [search, setSearch] = useState("")
  const [composer, setComposer] = useState("")
  const [messages, setMessages] = useState<ThreadMessage[]>([])
  const [threadMeta, setThreadMeta] = useState<ThreadResponse["conversation"] | null>(null)
  const [error, setError] = useState("")

  const endRef = useRef<HTMLDivElement | null>(null)

  const conversations = inbox?.conversations ?? []
  const selectedConversation = useMemo(
    () => conversations.find((item) => item.id === selectedConversationId) ?? null,
    [conversations, selectedConversationId],
  )

  const filteredConversations = useMemo(() => {
    const term = search.trim().toLowerCase()
    if (!term) {
      return conversations
    }

    return conversations.filter((conversation) => {
      return (
        conversation.title.toLowerCase().includes(term) ||
        conversation.subtitle.toLowerCase().includes(term) ||
        conversation.last_message.toLowerCase().includes(term)
      )
    })
  }, [conversations, search])

  const loadInbox = async () => {
    try {
      const response = await fetch("/api/chat/inbox", { cache: "no-store" })
      const data = (await response.json()) as InboxResponse | { error?: string }

      if (!response.ok) {
        throw new Error(data.error || "Failed to load chats")
      }

      const nextInbox = data as InboxResponse
      setInbox(nextInbox)

      if (!selectedConversationId && nextInbox.conversations.length > 0) {
        setSelectedConversationId(nextInbox.conversations[0].id)
      }

      if (selectedConversationId && !nextInbox.conversations.some((item) => item.id === selectedConversationId)) {
        setSelectedConversationId(nextInbox.conversations[0]?.id ?? null)
      }
    } catch (err: unknown) {
      setError(err instanceof Error ? err.message : "Failed to load chat inbox")
    } finally {
      setListLoading(false)
    }
  }

  const loadThread = async (conversationId: string) => {
    setThreadLoading(true)
    try {
      const response = await fetch(`/api/chat/messages?conversationId=${encodeURIComponent(conversationId)}`, {
        cache: "no-store",
      })
      const data = (await response.json()) as ThreadResponse | { error?: string }

      if (!response.ok) {
        throw new Error(data.error || "Failed to load conversation")
      }

      const thread = data as ThreadResponse
      setThreadMeta(thread.conversation)
      setMessages(thread.messages)
    } catch (err: unknown) {
      setError(err instanceof Error ? err.message : "Failed to load messages")
    } finally {
      setThreadLoading(false)
    }
  }

  const sendMessage = async () => {
    if (!selectedConversationId || !composer.trim()) {
      return
    }

    setSending(true)
    setError("")

    try {
      const response = await fetch("/api/chat/messages", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          conversationId: selectedConversationId,
          message: composer.trim(),
        }),
      })

      const data = await response.json()
      if (!response.ok) {
        throw new Error(data.error || "Failed to send message")
      }

      setComposer("")
      await Promise.all([loadThread(selectedConversationId), loadInbox()])
    } catch (err: unknown) {
      setError(err instanceof Error ? err.message : "Failed to send message")
    } finally {
      setSending(false)
    }
  }

  useEffect(() => {
    void loadInbox()
  }, [])

  useEffect(() => {
    if (!selectedConversationId) {
      setMessages([])
      setThreadMeta(null)
      return
    }

    void loadThread(selectedConversationId)

    const interval = setInterval(() => {
      if (document.visibilityState === "visible") {
        void loadThread(selectedConversationId)
        void loadInbox()
      }
    }, 20000)

    return () => clearInterval(interval)
  }, [selectedConversationId])

  useEffect(() => {
    endRef.current?.scrollIntoView({ behavior: "smooth" })
  }, [messages])

  return (
    <div className="space-y-4">
      <header className="flex items-center justify-between gap-3">
        <div>
          <h1 className="text-2xl font-bold text-slate-900 sm:text-3xl">{title}</h1>
          <p className="mt-1 text-sm text-slate-500">{subtitle}</p>
        </div>
        <Link
          href={homeHref}
          className="inline-flex h-9 items-center rounded-full border border-slate-300 bg-white px-4 text-sm font-semibold text-slate-700 transition hover:bg-slate-50"
        >
          {homeLabel}
        </Link>
      </header>

      {inbox?.needs_mentor_subject && onboardingHref ? (
        <div className="rounded-xl border border-amber-300 bg-amber-50 px-4 py-3 text-sm text-amber-800">
          Select your teaching subject before chatting with students.
          <Link href={onboardingHref} className="ml-2 font-semibold underline">
            Set subject
          </Link>
        </div>
      ) : null}

      {error ? <div className="rounded-xl border border-rose-200 bg-rose-50 px-4 py-3 text-sm text-rose-700">{error}</div> : null}

      <section className="h-[calc(100vh-13.25rem)] overflow-hidden rounded-2xl border border-[#d9e0e6] bg-[#f6f8fa] shadow-sm">
        <div className="grid h-full lg:grid-cols-[360px_minmax(0,1fr)]">
          <aside className={`${selectedConversationId ? "hidden lg:flex" : "flex"} h-full flex-col border-r border-[#d9e0e6] bg-[#ffffff]`}>
            <div className="border-b border-[#d9e0e6] bg-[#f0f2f5] px-4 py-4">
              <div className="flex items-center justify-between">
                <h2 className="text-lg font-semibold text-slate-900">Chats</h2>
                <span className="rounded-full bg-[#e2e8f0] px-2 py-0.5 text-xs font-semibold text-slate-600">
                  {conversations.length}
                </span>
              </div>
              <div className="mt-3 flex items-center rounded-lg bg-white px-3 py-2">
                <Search className="h-4 w-4 text-slate-400" />
                <input
                  type="text"
                  value={search}
                  onChange={(event) => setSearch(event.target.value)}
                  placeholder="Search chats"
                  className="ml-2 w-full bg-transparent text-sm text-slate-800 outline-none placeholder:text-slate-400"
                  suppressHydrationWarning
                />
              </div>
            </div>

            <div className="flex-1 overflow-y-auto">
              {listLoading ? (
                <div className="flex h-full items-center justify-center gap-2 text-sm text-slate-500">
                  <Loader2 className="h-4 w-4 animate-spin" /> Loading chats...
                </div>
              ) : filteredConversations.length === 0 ? (
                <div className="flex h-full flex-col items-center justify-center gap-3 px-6 text-center text-slate-500">
                  <MessagesSquare className="h-9 w-9 text-slate-400" />
                  <p className="text-sm">No chats available yet.</p>
                </div>
              ) : (
                <ul>
                  {filteredConversations.map((conversation) => {
                    const active = conversation.id === selectedConversationId
                    const isGroup = conversation.kind === "group"

                    return (
                      <li key={conversation.id}>
                        <button
                          type="button"
                          onClick={() => setSelectedConversationId(conversation.id)}
                          className={`w-full border-b border-[#eef2f5] px-4 py-3 text-left transition ${
                            active ? "bg-[#ebf5ff]" : "bg-white hover:bg-[#f8fafc]"
                          }`}
                        >
                          <div className="flex items-start gap-3">
                            <div
                              className={`flex h-11 w-11 items-center justify-center rounded-full text-white ${
                                isGroup ? "bg-[#0ea5e9]" : "bg-[#10b981]"
                              }`}
                            >
                              {isGroup ? <Users className="h-5 w-5" /> : <UserRound className="h-5 w-5" />}
                            </div>

                            <div className="min-w-0 flex-1">
                              <div className="flex items-center justify-between gap-2">
                                <p className="truncate text-sm font-semibold text-slate-900">{conversation.title}</p>
                                <span className="shrink-0 text-[11px] text-slate-400">{formatListTime(conversation.last_message_at)}</span>
                              </div>
                              <p className="mt-0.5 truncate text-xs text-slate-500">{conversation.subtitle}</p>
                              <div className="mt-1.5 flex items-center gap-1.5 text-xs text-slate-500">
                                {conversation.last_sender_role ? (
                                  <span className="rounded-full bg-slate-100 px-2 py-0.5 text-[10px] font-semibold uppercase tracking-wide text-slate-600">
                                    {conversation.last_sender_role}
                                  </span>
                                ) : null}
                                <span className="truncate">{conversation.last_message}</span>
                              </div>
                            </div>
                          </div>
                        </button>
                      </li>
                    )
                  })}
                </ul>
              )}
            </div>
          </aside>

          <div className={`${selectedConversationId ? "flex" : "hidden lg:flex"} h-full flex-col bg-[#efeae2]`}>
            {!selectedConversation ? (
              <div className="flex h-full flex-col items-center justify-center gap-3 px-8 text-center text-slate-500">
                <MessageCircle className="h-12 w-12 text-slate-400" />
                <p className="text-sm">Select a conversation to start chatting.</p>
              </div>
            ) : (
              <>
                <div className="flex items-center gap-3 border-b border-[#d9e0e6] bg-[#f0f2f5] px-4 py-3">
                  <button
                    type="button"
                    onClick={() => setSelectedConversationId(null)}
                    className="inline-flex h-8 w-8 items-center justify-center rounded-full text-slate-600 hover:bg-[#dbe4ec] lg:hidden"
                  >
                    <ArrowLeft className="h-4 w-4" />
                  </button>
                  <div
                    className={`flex h-10 w-10 items-center justify-center rounded-full text-white ${
                      threadMeta?.kind === "group" ? "bg-[#0ea5e9]" : "bg-[#10b981]"
                    }`}
                  >
                    {threadMeta?.kind === "group" ? <Users className="h-5 w-5" /> : <UserRound className="h-5 w-5" />}
                  </div>

                  <div className="min-w-0">
                    <p className="truncate text-sm font-semibold text-slate-900">{threadMeta?.title || selectedConversation.title}</p>
                    <p className="truncate text-xs text-slate-500">{threadMeta?.subtitle || selectedConversation.subtitle}</p>
                  </div>
                </div>

                <div
                  className="flex-1 overflow-y-auto px-4 py-4"
                  style={{
                    backgroundImage: "radial-gradient(circle at 1px 1px, rgba(120,120,120,0.12) 1px, transparent 0)",
                    backgroundSize: "18px 18px",
                  }}
                >
                  {threadLoading ? (
                    <div className="flex h-full items-center justify-center gap-2 text-sm text-slate-500">
                      <Loader2 className="h-4 w-4 animate-spin" /> Loading conversation...
                    </div>
                  ) : messages.length === 0 ? (
                    <div className="flex h-full items-center justify-center text-sm text-slate-500">No messages yet.</div>
                  ) : (
                    <div className="space-y-2.5">
                      {messages.map((message) => {
                        const isMine = inbox?.viewer_role === message.sender_role

                        return (
                          <div key={message.id} className={`flex ${isMine ? "justify-end" : "justify-start"}`}>
                            <div
                              className={`max-w-[86%] rounded-xl px-3 py-2 shadow-sm sm:max-w-[72%] ${
                                isMine ? "rounded-br-sm bg-[#d9fdd3] text-slate-900" : "rounded-bl-sm bg-white text-slate-900"
                              }`}
                            >
                              {!isMine ? (
                                <p className="mb-1 text-[11px] font-semibold text-emerald-700">{message.sender_name}</p>
                              ) : null}
                              <p className="whitespace-pre-wrap text-sm leading-relaxed">{message.message}</p>
                              <div className="mt-1 flex items-center justify-end gap-1 text-[10px] text-slate-500">
                                <span>{formatMessageTime(message.created_at)}</span>
                                {isMine ? <CheckCheck className="h-3 w-3 text-[#53bdeb]" /> : null}
                              </div>
                            </div>
                          </div>
                        )
                      })}
                      <div ref={endRef} />
                    </div>
                  )}
                </div>

                <div className="border-t border-[#d9e0e6] bg-[#f0f2f5] px-3 py-3">
                  <div className="flex items-end gap-2">
                    <textarea
                      value={composer}
                      onChange={(event) => setComposer(event.target.value)}
                      onKeyDown={(event) => {
                        if (event.key === "Enter" && !event.shiftKey) {
                          event.preventDefault()
                          void sendMessage()
                        }
                      }}
                      placeholder="Type a message"
                      rows={1}
                      className="max-h-36 min-h-10 flex-1 resize-y rounded-lg border border-[#d3dbe2] bg-white px-3 py-2 text-sm text-slate-900 outline-none placeholder:text-slate-400 focus:border-[#53bdeb]"
                      suppressHydrationWarning
                    />
                    <button
                      type="button"
                      onClick={() => void sendMessage()}
                      disabled={sending || !composer.trim()}
                      className="inline-flex h-10 w-10 items-center justify-center rounded-full bg-[#00a884] text-white transition hover:bg-[#02bd94] disabled:cursor-not-allowed disabled:opacity-60"
                    >
                      {sending ? <Loader2 className="h-4 w-4 animate-spin" /> : <SendHorizonal className="h-4 w-4" />}
                    </button>
                  </div>
                </div>
              </>
            )}
          </div>
        </div>
      </section>
    </div>
  )
}
