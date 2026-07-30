"use client";

import { useEffect, useRef } from "react";
import { useRouter, usePathname } from "next/navigation";
import { createClient } from "@/lib/supabase/client";
import { driver } from "driver.js";
import "driver.js/dist/driver.css";

function waitForEl(id: string, cb: () => void, maxMs = 8000) {
  const start = Date.now();
  const check = setInterval(() => {
    if (document.getElementById(id)) {
      clearInterval(check);
      cb();
    } else if (Date.now() - start > maxMs) {
      clearInterval(check);
      cb(); // give up waiting, call anyway
    }
  }, 150);
}

export function TourProvider() {
  const router = useRouter();
  const pathname = usePathname();
  const tourStarted = useRef(false);

  useEffect(() => {
    const initTour = async () => {
      const isCompleted = localStorage.getItem("bsprep_tour_completed");
      if (isCompleted === "true" || tourStarted.current) return;

      const supabase = createClient();
      const {
        data: { user },
      } = await supabase.auth.getUser();

      if (!user || pathname !== "/dashboard") return;

      tourStarted.current = true;

      waitForEl("tour-dashboard-welcome", () => {
        const driverObj = driver({
          showProgress: true,
          allowClose: true,
          doneBtnText: "FINISH TOUR",
          nextBtnText: "NEXT →",
          prevBtnText: "← PREV",
          onDestroyStarted: () => {
            if (
              !driverObj.hasNextStep() ||
              confirm("Are you sure you want to skip the tour?")
            ) {
              localStorage.setItem("bsprep_tour_completed", "true");
              driverObj.destroy();
            }
          },
          popoverClass: "driverjs-theme-premium",
          steps: [
            // 1 — Welcome to BSPrep (center popover)
            {
              popover: {
                title: "WELCOME TO BSPREP",
                description: "Your all-in-one platform for acing the IITM BS degree. Let us show you around real quick!",
                side: "bottom",
                align: "center",
              },
            },
            // 2 — Sidebar
            {
              element: "#tour-sidebar-full",
              popover: {
                title: "THE SIDEBAR",
                description: "This is your control center. Navigate through courses, live sessions, study resources, and tools like the GPA calculator from here. Scroll down to see everything!",
                side: "right",
                align: "start",
              },
            },
            // 3 — Dashboard Content
            {
              element: "#tour-dashboard-full",
              popover: {
                title: "YOUR DASHBOARD",
                description: "Your upcoming live classes and enrolled courses will appear here. You're all set to start learning!",
                side: "left",
                align: "start",
                onNextClick: () => {
                  localStorage.setItem("bsprep_tour_completed", "true");
                  driverObj.moveNext();
                },
              },
            },
          ],
        });

        driverObj.drive();
      });
    };

    initTour();
  }, [pathname, router]);

  return null;
}

