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
    upcoming: "bg-gray-500 text-white",
    live: "bg-green-500 text-white",
    completed: "bg-gray-400 text-gray-200",
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
    <Card className="bg-gradient-to-br from-gray-900 to-black border-gray-700 text-white">
      <CardHeader>
        <div className="flex items-start justify-between">
          <div className="flex-1">
            <CardTitle className="text-xl font-bold bg-gradient-to-r from-white to-gray-400 bg-clip-text text-transparent">{subject}</CardTitle>
            <p className="text-gray-400 mt-1">{topic}</p>
          </div>
          <Badge className={statusColors[status]}>
            {status === "live" ? "● LIVE" : status.toUpperCase()}
          </Badge>
        </div>
      </CardHeader>
      <CardContent>
        <div className="space-y-3">
          <div className="flex items-center gap-2 text-gray-300">
            <Calendar className="h-4 w-4" />
            <span>{formatDate(date)}</span>
          </div>
          <div className="flex items-center gap-2 text-gray-300">
            <Clock className="h-4 w-4" />
            <span>{time}</span>
          </div>
          {meetingLink && (
            <Button
              className="w-full bg-[#E8E889] text-black hover:bg-[#d4d477] font-semibold mt-2"
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
