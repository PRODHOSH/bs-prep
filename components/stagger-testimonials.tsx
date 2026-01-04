"use client"

import { useEffect, useRef } from "react"
import Image from "next/image"

interface Testimonial {
  quote: string
  author: string
  role: string
  image: string
}

const testimonials: Testimonial[] = [
  {
    quote: "The mentorship program helped me understand complex Data Science concepts that I was struggling with. The community support is amazing!",
    author: "Priya Sharma",
    role: "Data Science Student",
    image: "https://api.dicebear.com/7.x/avataaars/svg?seed=Priya"
  },
  {
    quote: "From struggling with assignments to topping my semester - this platform made all the difference. The study materials are top-notch!",
    author: "Rahul Kumar",
    role: "BS Degree Student",
    image: "https://api.dicebear.com/7.x/avataaars/svg?seed=Rahul"
  },
  {
    quote: "I love how the GPA calculator helps me plan my grades. The tools section is incredibly useful for all IITM BS students!",
    author: "Ananya Patel",
    role: "Foundation Level",
    image: "https://api.dicebear.com/7.x/avataaars/svg?seed=Ananya"
  },
  {
    quote: "The leaderboard feature keeps me motivated to practice more quizzes. Competing with peers has improved my performance significantly!",
    author: "Arjun Reddy",
    role: "Diploma Student",
    image: "https://api.dicebear.com/7.x/avataaars/svg?seed=Arjun"
  },
  {
    quote: "Best decision I made was joining this platform. The mentors are always available to clear doubts and guide us through difficult topics.",
    author: "Sneha Iyer",
    role: "Data Science Student",
    image: "https://api.dicebear.com/7.x/avataaars/svg?seed=Sneha"
  },
  {
    quote: "The weekly live sessions and recorded lectures have been game-changers for my studies. I can learn at my own pace now!",
    author: "Karthik Menon",
    role: "Degree Student",
    image: "https://api.dicebear.com/7.x/avataaars/svg?seed=Karthik"
  }
]

export function StaggerTestimonials() {
  const scrollerRef = useRef<HTMLDivElement>(null)

  useEffect(() => {
    const scroller = scrollerRef.current
    if (!scroller) return

    let animationId: number

    const scroll = () => {
      if (scroller.scrollLeft >= scroller.scrollWidth / 2) {
        scroller.scrollLeft = 0
      } else {
        scroller.scrollLeft += 0.5
      }
      animationId = requestAnimationFrame(scroll)
    }

    animationId = requestAnimationFrame(scroll)

    return () => cancelAnimationFrame(animationId)
  }, [])

  return (
    <div className="relative w-full py-20 md:py-28 overflow-hidden">
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 mb-12">
        <div className="text-center">
          <h2 className="text-3xl md:text-5xl font-bold text-white mb-4">
            What Students Say
          </h2>
          <p className="text-slate-400 text-lg">
            Join thousands of students transforming their learning journey
          </p>
        </div>
      </div>

      <div 
        ref={scrollerRef}
        className="flex gap-6 overflow-hidden"
        style={{
          maskImage: "linear-gradient(to right, transparent, black 10%, black 90%, transparent)",
          WebkitMaskImage: "linear-gradient(to right, transparent, black 10%, black 90%, transparent)"
        }}
      >
        {/* First set */}
        <div className="flex gap-6 shrink-0">
          {testimonials.map((testimonial, idx) => (
            <div
              key={idx}
              className={`bg-black/80 backdrop-blur-sm border border-slate-800 rounded-2xl p-6 w-[400px] h-[280px] shrink-0 hover:border-[#51b206]/50 transition-all duration-300 flex flex-col ${
                idx % 2 === 0 ? "mt-0" : "mt-12"
              }`}
            >
              <div className="flex items-start gap-4 mb-4">
                <div className="relative w-12 h-12 rounded-full overflow-hidden bg-[#3e3098]/20 ring-2 ring-[#3e3098]/50">
                  <Image
                    src={testimonial.image}
                    alt={testimonial.author}
                    fill
                    className="object-cover"
                  />
                </div>
                <div>
                  <p className="font-semibold text-white">{testimonial.author}</p>
                  <p className="text-sm text-[#51b206]">{testimonial.role}</p>
                </div>
              </div>
              <p className="text-slate-300 leading-relaxed text-sm flex-1">"{testimonial.quote}"</p>
              <div className="flex gap-1 mt-4">
                {[...Array(5)].map((_, i) => (
                  <svg
                    key={i}
                    className="w-5 h-5 text-[#51b206]"
                    fill="currentColor"
                    viewBox="0 0 20 20"
                  >
                    <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" />
                  </svg>
                ))}
              </div>
            </div>
          ))}
        </div>

        {/* Duplicate set for infinite scroll */}
        <div className="flex gap-6 shrink-0">
          {testimonials.map((testimonial, idx) => (
            <div
              key={`dup-${idx}`}
              className={`bg-black/80 backdrop-blur-sm border border-slate-800 rounded-2xl p-6 w-[400px] h-[280px] shrink-0 hover:border-[#51b206]/50 transition-all duration-300 flex flex-col ${
                idx % 2 === 0 ? "mt-0" : "mt-12"
              }`}
            >
              <div className="flex items-start gap-4 mb-4">
                <div className="relative w-12 h-12 rounded-full overflow-hidden bg-[#3e3098]/20 ring-2 ring-[#3e3098]/50">
                  <Image
                    src={testimonial.image}
                    alt={testimonial.author}
                    fill
                    className="object-cover"
                  />
                </div>
                <div>
                  <p className="font-semibold text-white">{testimonial.author}</p>
                  <p className="text-sm text-[#51b206]">{testimonial.role}</p>
                </div>
              </div>
              <p className="text-slate-300 leading-relaxed text-sm flex-1">"{testimonial.quote}"</p>
              <div className="flex gap-1 mt-4">
                {[...Array(5)].map((_, i) => (
                  <svg
                    key={i}
                    className="w-5 h-5 text-[#51b206]"
                    fill="currentColor"
                    viewBox="0 0 20 20"
                  >
                    <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" />
                  </svg>
                ))}
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  )
}
