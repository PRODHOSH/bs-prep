"use client"

import { useEffect, useRef } from "react"
import Image from "next/image"
import { MessageCircle } from "lucide-react"

interface Testimonial {
  quote: string
  author: string
  role: string
  image: string
}

const testimonials: Testimonial[] = [
  {
    quote: "The mentorship program helped me understand complex Data Science concepts. Being a Tamil student, having support in my language made a huge difference!",
    author: "Kavitha",
    role: "Diploma Student",
    image: "https://api.dicebear.com/7.x/personas/svg?seed=Kavitha"
  },
  {
    quote: "From struggling with assignments to topping my semester — this platform made all the difference. Tamil students especially will find this super helpful!",
    author: "Karthikeyan",
    role: "Qualifier Student",
    image: "https://api.dicebear.com/7.x/personas/svg?seed=Karthikeyan"
  },
  {
    quote: "I love how the GPA Predictor helps me plan my grades. The tools section is incredibly useful for all IITM BS students!",
    author: "Vignesh",
    role: "Foundation Student",
    image: "https://api.dicebear.com/7.x/personas/svg?seed=Vignesh"
  },
  {
    quote: "The Tamil content is a blessing. As a native Tamil speaker, I finally feel like I can grasp the material deeply. Highly recommend to all Tamil students!",
    author: "Meenakshi",
    role: "Diploma Student",
    image: "https://api.dicebear.com/7.x/personas/svg?seed=Meenakshi"
  },
  {
    quote: "Best decision I made was joining this platform. The mentors are always available and the Tamil resources made studying so much more comfortable.",
    author: "Murugesan",
    role: "Foundation Student",
    image: "https://api.dicebear.com/7.x/personas/svg?seed=Murugesan"
  },
  {
    quote: "The weekly live sessions and recorded lectures have been game-changers. As a Tamil student, having content in my language helped me learn at my own pace!",
    author: "Priya",
    role: "Qualifier Student",
    image: "https://api.dicebear.com/7.x/personas/svg?seed=Priya"
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
    <div className="relative w-full py-20 sm:py-32 overflow-hidden bg-transparent text-black font-semibold">
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 mb-16 md:mb-24">
        <div className="text-center">
          <div className="inline-flex items-center gap-2 px-5 py-2 rounded-full text-xs font-bold tracking-widest mb-8 text-[#0a192f] bg-[#0a192f]/10">
            <MessageCircle className="w-4 h-4" /> TESTIMONIALS
          </div>
          <h2 className="text-4xl sm:text-5xl md:text-6xl font-black uppercase tracking-tight mb-6 leading-[1.1]">
            WHAT STUDENTS <br />
            <span className="text-[#0a192f]">SAY ABOUT US</span>
          </h2>
          <p className="text-sm sm:text-base font-medium text-black/70 leading-relaxed max-w-2xl mx-auto">
            Join thousands of students transforming their learning journey.
          </p>
        </div>
      </div>

      <div 
        ref={scrollerRef}
        className="flex gap-6 overflow-hidden pb-10"
        style={{
          maskImage: "linear-gradient(to right, transparent, black 5%, black 95%, transparent)",
          WebkitMaskImage: "linear-gradient(to right, transparent, black 5%, black 95%, transparent)"
        }}
      >
        {/* First set */}
        <div className="flex gap-6 shrink-0 items-center">
          {testimonials.map((testimonial, idx) => (
            <div
              key={idx}
              className={`bg-white rounded-3xl p-8 w-[350px] md:w-[420px] shrink-0 shadow-lg shadow-black/5 hover:-translate-y-2 transition-all duration-300 flex flex-col ring-1 ring-black/5 ${
                idx % 2 === 0 ? "mt-0" : "mt-12"
              }`}
            >
              <div className="flex items-start gap-4 mb-6">
                <div className="relative w-14 h-14 rounded-full bg-[#0a192f]/5 shrink-0 overflow-hidden ring-2 ring-white shadow-sm">
                  <Image
                    src={testimonial.image}
                    alt={testimonial.author}
                    fill
                    className="object-cover"
                  />
                </div>
                <div>
                  <p className="tracking-tight text-xl leading-tight mb-1 uppercase font-black">{testimonial.author}</p>
                  <p className="text-xs font-bold tracking-widest text-black/50 uppercase">{testimonial.role}</p>
                </div>
              </div>
              <p className="text-black/80 leading-relaxed text-sm font-medium flex-1 min-h-[100px]">"{testimonial.quote}"</p>
              <div className="flex gap-1 mt-6">
                {[...Array(5)].map((_, i) => (
                  <svg
                    key={i}
                    className="w-5 h-5 text-[#0a192f]"
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
        <div className="flex gap-6 shrink-0 items-center">
          {testimonials.map((testimonial, idx) => (
            <div
              key={`dup-${idx}`}
              className={`bg-white rounded-3xl p-8 w-[350px] md:w-[420px] shrink-0 shadow-lg shadow-black/5 hover:-translate-y-2 transition-all duration-300 flex flex-col ring-1 ring-black/5 ${
                idx % 2 === 0 ? "mt-0" : "mt-12"
              }`}
            >
              <div className="flex items-start gap-4 mb-6">
                <div className="relative w-14 h-14 rounded-full bg-[#0a192f]/5 shrink-0 overflow-hidden ring-2 ring-white shadow-sm">
                  <Image
                    src={testimonial.image}
                    alt={testimonial.author}
                    fill
                    className="object-cover"
                  />
                </div>
                <div>
                  <p className="tracking-tight text-xl leading-tight mb-1 uppercase font-black">{testimonial.author}</p>
                  <p className="text-xs font-bold tracking-widest text-black/50 uppercase">{testimonial.role}</p>
                </div>
              </div>
              <p className="text-black/80 leading-relaxed text-sm font-medium flex-1 min-h-[100px]">"{testimonial.quote}"</p>
              <div className="flex gap-1 mt-6">
                {[...Array(5)].map((_, i) => (
                  <svg
                    key={i}
                    className="w-5 h-5 text-[#0a192f]"
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
