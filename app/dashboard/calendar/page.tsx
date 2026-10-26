"use client"

import { useState, useEffect, useMemo } from "react"
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
    <div className="p-6 md:p-10 max-w-7xl mx-auto min-h-screen bg-white">
      <div className="flex flex-col md:flex-row items-start md:items-center justify-between mb-8 gap-4">
        <div>
          <h1 className="text-3xl md:text-4xl font-black tracking-tight text-[#0a192f] uppercase mb-2">Live Class Calendar</h1>
          <p className="text-gray-500 font-medium text-sm">Schedule for your enrolled courses and upcoming exams.</p>
        </div>
        
        <div className="flex items-center gap-4">
          <button 
            onClick={goToToday}
            className="px-4 py-2 text-sm font-bold bg-gray-100 hover:bg-gray-200 text-[#0a192f] rounded-lg transition-colors uppercase"
          >
            Today
          </button>
          <div className="flex items-center bg-gray-50 rounded-lg border border-gray-200 p-1">
            <button onClick={prevMonth} className="p-2 hover:bg-white rounded-md transition-colors text-gray-600">
              <ChevronLeft className="w-5 h-5" />
            </button>
            <span className="w-32 text-center font-bold text-[#0a192f] uppercase tracking-wide">
              {format(currentDate, "MMM yyyy")}
            </span>
            <button onClick={nextMonth} className="p-2 hover:bg-white rounded-md transition-colors text-gray-600">
              <ChevronRight className="w-5 h-5" />
            </button>
          </div>
        </div>
      </div>

      {loading ? (
        <div className="h-[600px] flex items-center justify-center border border-gray-200 rounded-2xl bg-gray-50">
          <div className="animate-spin w-8 h-8 border-2 border-[#e5e7eb] border-t-[#0a192f] rounded-full" />
        </div>
      ) : (
        <div className="border border-gray-200 rounded-2xl shadow-sm bg-white overflow-x-auto">
          <div className="min-w-[768px]">
            {/* Day Headers */}
            <div className="grid grid-cols-7 border-b border-gray-200 bg-gray-50/50">
              {['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'].map((day) => (
                <div key={day} className="p-2 md:p-4 text-center text-xs font-bold text-gray-500 uppercase tracking-wider">
                  {day}
                </div>
              ))}
            </div>

            {/* Calendar Grid */}
            <div className="grid grid-cols-7 auto-rows-fr">
              {calendarDays.map((day, dayIdx) => {
                const dateString = format(day, "yyyy-MM-dd")
                const dayEvents = allEvents.filter(e => e.date === dateString)
                const isCurrentMonth = isSameMonth(day, monthStart)
                const isToday = isSameDay(day, new Date())

                return (
                  <div 
                    key={day.toString()} 
                    className={`
                      min-h-[100px] md:min-h-[120px] p-1.5 md:p-2 border-b border-r border-gray-100 transition-colors
                      ${!isCurrentMonth ? "bg-gray-50/50 text-gray-400" : "bg-white"}
                      ${dayIdx % 7 === 6 ? "border-r-0" : ""}
                    `}
                  >
                    <div className="flex justify-between items-start mb-1 md:mb-2">
                      <span className={`
                        text-xs md:text-sm font-bold w-6 h-6 md:w-7 md:h-7 flex items-center justify-center rounded-full
                        ${isToday ? "bg-[#0a192f] text-white" : isCurrentMonth ? "text-gray-900" : "text-gray-400"}
                      `}>
                        {format(day, "d")}
                      </span>
                    </div>
                    
                    <div className="space-y-1.5 flex flex-col items-start overflow-y-auto max-h-[80px] md:max-h-[100px] no-scrollbar">
                      {dayEvents.map((evt, i) => (
                        <button
                          key={i}
                          onClick={() => setSelectedEvent(evt)}
                          className={`
                            w-full text-left text-[10px] md:text-xs px-1.5 md:px-2 py-1 md:py-1.5 rounded-md font-bold truncate transition-transform hover:scale-[1.02]
                            ${evt.isExam 
                              ? "bg-red-50 text-red-700 border border-red-100" 
                              : "bg-blue-50 text-blue-700 border border-blue-100"}
                          `}
                        >
                          <div className="truncate">{evt.isExam ? evt.topic : evt.course}</div>
                          {!evt.isExam && <div className="text-[9px] md:text-[10px] font-medium opacity-80 truncate">{evt.time}</div>}
                        </button>
                      ))}
                    </div>
                  </div>
                )
              })}
            </div>
          </div>
        </div>
      )}

      {/* Event Details Modal */}
      <Dialog open={!!selectedEvent} onOpenChange={(open) => !open && setSelectedEvent(null)}>
        <DialogContent className="sm:max-w-md bg-white border border-gray-100 shadow-2xl rounded-2xl">
          {selectedEvent && (
            <>
              <DialogHeader>
                <DialogTitle className="text-xl font-black uppercase text-[#0a192f] flex items-center gap-2">
                  {selectedEvent.isExam ? (
                    <CalendarIcon className="w-5 h-5 text-red-500" />
                  ) : (
                    <Video className="w-5 h-5 text-blue-500" />
                  )}
                  {selectedEvent.course}
                </DialogTitle>
                <DialogDescription className="font-medium text-gray-500 pt-2 text-base">
                  {selectedEvent.topic}
                </DialogDescription>
              </DialogHeader>
              
              <div className="grid gap-4 py-4">
                <div className="flex items-center gap-3 text-sm font-bold text-gray-700">
                  <div className="w-8 h-8 rounded-full bg-gray-100 flex items-center justify-center">
                    <CalendarIcon className="w-4 h-4 text-gray-500" />
                  </div>
                  {format(parseISO(selectedEvent.date), "EEEE, MMMM do, yyyy")}
                </div>
                <div className="flex items-center gap-3 text-sm font-bold text-gray-700">
                  <div className="w-8 h-8 rounded-full bg-gray-100 flex items-center justify-center">
                    <Clock className="w-4 h-4 text-gray-500" />
                  </div>
                  {selectedEvent.time}
                </div>
              </div>

              {selectedEvent.meetingLink && (
                <div className="pt-4 flex flex-col gap-2">
                  <a
                    href={selectedEvent.meetingLink}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="flex items-center justify-center gap-2 w-full bg-[#0a192f] text-white py-3 rounded-xl font-bold uppercase tracking-wider text-sm hover:bg-[#112a52] transition-colors"
                  >
                    Join Live Class
                    <ExternalLink className="w-4 h-4" />
                  </a>
                </div>
              )}
            </>
          )}
        </DialogContent>
      </Dialog>
    </div>
  )
}
