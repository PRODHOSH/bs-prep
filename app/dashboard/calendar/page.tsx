"use client"

import { useState, useEffect, useMemo } from "react"
import { SkCalendarGrid } from "@/components/dashboard/skeleton"
import { 
  format, 
  addMonths, 
  subMonths, 
  startOfMonth, 
  endOfMonth, 
  startOfWeek, 
  endOfWeek, 
  isSameMonth, 
  isSameDay, 
  eachDayOfInterval,
  parseISO
} from "date-fns"
import { ChevronLeft, ChevronRight, Calendar as CalendarIcon, Clock, ExternalLink, Video } from "lucide-react"
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
} from "@/components/ui/dialog"
import { IconTile, PageHeader, btnGhost, btnPrimary } from "@/components/dashboard/ui"
import { cn } from "@/lib/utils"

// Hardcoded dates as requested
const HARDCODED_EVENTS = [
  {
    id: "quiz-2",
    course: "EXAM",
    topic: "Quiz 2",
    date: "2026-08-16",
    time: "14:00 - 17:00",
    isExam: true,
  },
  {
    id: "end-term",
    course: "EXAM",
    topic: "End Term",
    date: "2026-09-13",
    time: "09:00 / 14:00 (Check Hall Ticket)",
    isExam: true,
  }
]

export default function CalendarPage() {
  const [currentDate, setCurrentDate] = useState(new Date())
  const [classes, setClasses] = useState<any[]>([])
  const [loading, setLoading] = useState(true)
  const [selectedEvent, setSelectedEvent] = useState<any | null>(null)

  useEffect(() => {
    const fetchClasses = async () => {
      try {
        const res = await fetch("/api/live-classes")
        const data = await res.json()
        if (data.classes) {
          setClasses(data.classes)
        }
      } catch (err) {
        console.error("Failed to fetch live classes", err)
      } finally {
        setLoading(false)
      }
    }
    fetchClasses()
  }, [])

  // Combine fetched classes with hardcoded events
  const allEvents = useMemo(() => {
    return [...classes, ...HARDCODED_EVENTS]
  }, [classes])

  // Calendar logic
  const monthStart = startOfMonth(currentDate)
  const monthEnd = endOfMonth(monthStart)
  const startDate = startOfWeek(monthStart)
  const endDate = endOfWeek(monthEnd)

  const calendarDays = eachDayOfInterval({
    start: startDate,
    end: endDate
  })

  const nextMonth = () => setCurrentDate(addMonths(currentDate, 1))
  const prevMonth = () => setCurrentDate(subMonths(currentDate, 1))
  const goToToday = () => setCurrentDate(new Date())

  return (
    <div className="space-y-6">
      <PageHeader
        title="Calendar"
        description="Live classes for your courses and upcoming exams."
        actions={
          <>
            <button onClick={goToToday} className={btnGhost}>Today</button>
            <div className="flex items-center rounded-xl border bg-card">
              <button onClick={prevMonth} aria-label="Previous month" className="grid size-10 place-items-center rounded-l-xl text-muted-foreground hover:bg-muted">
                <ChevronLeft className="size-4" />
              </button>
              <span className="w-28 text-center text-sm font-bold">{format(currentDate, "MMM yyyy")}</span>
              <button onClick={nextMonth} aria-label="Next month" className="grid size-10 place-items-center rounded-r-xl text-muted-foreground hover:bg-muted">
                <ChevronRight className="size-4" />
              </button>
            </div>
          </>
        }
      />

      {loading ? (
        <SkCalendarGrid />
      ) : (
        <div className="overflow-hidden rounded-2xl border bg-card">
          <div className="overflow-x-auto">
            <div className="min-w-[768px]">
              <div className="grid grid-cols-7 border-b bg-muted/50">
                {["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"].map((day) => (
                  <div key={day} className="p-3 text-center text-xs font-semibold text-muted-foreground">{day}</div>
                ))}
              </div>

              <div className="grid auto-rows-fr grid-cols-7">
                {calendarDays.map((day, dayIdx) => {
                  const dateString = format(day, "yyyy-MM-dd")
                  const dayEvents = allEvents.filter((e) => e.date === dateString)
                  const isCurrentMonth = isSameMonth(day, monthStart)
                  const isToday = isSameDay(day, new Date())

                  return (
                    <div
                      key={day.toString()}
                      className={cn(
                        "min-h-[7rem] border-b border-r p-2",
                        !isCurrentMonth && "bg-muted/40",
                        dayIdx % 7 === 6 && "border-r-0",
                      )}
                    >
                      <span
                        className={cn(
                          "mb-1.5 grid size-7 place-items-center rounded-full text-xs font-bold",
                          isToday ? "bg-primary text-primary-foreground" : isCurrentMonth ? "text-foreground" : "text-muted-foreground/60",
                        )}
                      >
                        {format(day, "d")}
                      </span>

                      <div className="flex max-h-[5.5rem] flex-col gap-1 overflow-y-auto">
                        {dayEvents.map((evt, i) => (
                          <button
                            key={i}
                            onClick={() => setSelectedEvent(evt)}
                            className={cn(
                              "w-full truncate rounded-md px-2 py-1 text-left text-[11px] font-semibold transition-opacity hover:opacity-80",
                              evt.isExam ? "bg-destructive/10 text-destructive" : "bg-primary/10 text-primary",
                            )}
                          >
                            <span className="block truncate">{evt.isExam ? evt.topic : evt.course}</span>
                            {!evt.isExam && <span className="block truncate font-medium opacity-80">{evt.time}</span>}
                          </button>
                        ))}
                      </div>
                    </div>
                  )
                })}
              </div>
            </div>
          </div>
        </div>
      )}

      <Dialog open={!!selectedEvent} onOpenChange={(open) => !open && setSelectedEvent(null)}>
        <DialogContent className="rounded-2xl border bg-card sm:max-w-md">
          {selectedEvent && (
            <>
              <DialogHeader>
                <DialogTitle className="flex items-center gap-3 text-lg font-bold">
                  <IconTile icon={selectedEvent.isExam ? CalendarIcon : Video} tone={selectedEvent.isExam ? "pink" : "primary"} />
                  {selectedEvent.course}
                </DialogTitle>
                <DialogDescription className="pt-1 text-sm text-muted-foreground">{selectedEvent.topic}</DialogDescription>
              </DialogHeader>

              <ul className="space-y-3 py-2 text-sm font-medium">
                <li className="flex items-center gap-3">
                  <CalendarIcon className="size-4 text-muted-foreground" />
                  {format(parseISO(selectedEvent.date), "EEEE, MMMM do, yyyy")}
                </li>
                <li className="flex items-center gap-3">
                  <Clock className="size-4 text-muted-foreground" />
                  {selectedEvent.time}
                </li>
              </ul>

              {selectedEvent.meetingLink && (
                <a href={selectedEvent.meetingLink} target="_blank" rel="noopener noreferrer" className={cn(btnPrimary, "w-full")}>
                  Join live class <ExternalLink className="size-4" />
                </a>
              )}
            </>
          )}
        </DialogContent>
      </Dialog>
    </div>
  )
}
