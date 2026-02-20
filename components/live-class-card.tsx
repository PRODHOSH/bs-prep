"use client";

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Calendar, Clock, Video } from "lucide-react";

interface LiveClassCardProps {
  subject: string;
  topic: string;
  meetingLink: string;
  time: string;
  date: string;
}

export function LiveClassCard({
  subject,
  topic,
  meetingLink,
  time,
  date,
}: LiveClassCardProps) {
  const getStatus = () => {
    const now = new Date();
    const classDate = new Date(date);
    const [hours, minutes] = time.split(":").map(Number);
    classDate.setHours(hours, minutes, 0, 0);

    const diffMs = classDate.getTime() - now.getTime();
    const diffMins = Math.floor(diffMs / 60000);

    if (diffMins < -60) return "completed";
    if (diffMins <= 15 && diffMins >= -60) return "live";
    return "upcoming";
  };

  const status = getStatus();

  const statusColors = {
    upcoming: "bg-blue-100 text-blue-700",
    live: "bg-green-100 text-green-700",
    completed: "bg-gray-100 text-gray-700",
  };

  const formatDate = (dateStr: string) => {
    const d = new Date(dateStr);
    return d.toLocaleDateString("en-US", {
      weekday: "short",
      month: "short",
      day: "numeric",
    });
  };

  return (
    <Card className="bg-white border border-gray-200 hover:border-gray-400 transition-all">
      <CardHeader className="pb-3">
        <div className="flex items-start justify-between mb-3">
          <Badge className={statusColors[status]}>
            {status === "live" ? "● LIVE" : status.toUpperCase()}
          </Badge>
        </div>
        <div className="space-y-3">
          <div>
            <div className="text-sm font-bold text-black mb-1">Course:</div>
            <div className="text-base font-semibold text-gray-800">{subject}</div>
          </div>
          <div>
            <div className="text-sm font-bold text-black mb-1">Topic:</div>
            <div className="text-base text-gray-800 leading-snug">{topic}</div>
          </div>
        </div>
      </CardHeader>
      <CardContent>
        <div className="space-y-3">
          <div className="flex items-center gap-2 text-gray-600 text-sm">
            <Calendar className="h-4 w-4" />
            <span>{formatDate(date)}</span>
          </div>
          <div className="flex items-center gap-2 text-gray-600 text-sm">
            <Clock className="h-4 w-4" />
            <span>{time}</span>
          </div>
          {meetingLink && (
            <Button
              className="w-full bg-black text-white hover:bg-black/90 font-semibold mt-2"
              onClick={() => window.open(meetingLink, "_blank")}
              disabled={status === "completed"}
            >
              <Video className="h-4 w-4 mr-2" />
              {status === "live" ? "Join Now" : "Join Meeting"}
            </Button>
          )}
        </div>
      </CardContent>
    </Card>
  );
}
