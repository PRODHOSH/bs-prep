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
    quote: "The mentorship program helped me understand complex Data Science concepts. Being a Tamil student, having support in my language made a huge difference!",
    author: "Harshini",
    role: "Diploma Student",
    image: "https://api.dicebear.com/7.x/personas/svg?seed=Harshini"
  },
  {
    quote: "From struggling with assignments to topping my semester — this platform made all the difference. Tamil students especially will find this super helpful!",
    author: "Sachin",
    role: "Qualifier Student",
    image: "https://api.dicebear.com/7.x/personas/svg?seed=Sachin"
  },
  {
    quote: "I love how the GPA Predictor helps me plan my grades. The tools section is incredibly useful for all IITM BS students!",
    author: "Harish",
    role: "Foundation Student",
    image: "https://api.dicebear.com/7.x/personas/svg?seed=Harish"
  },
  {
    quote: "The Tamil content is a blessing. As a native Tamil speaker, I finally feel like I can grasp the material deeply. Highly recommend to all Tamil students!",
    author: "Arjun Reddy",
    role: "Diploma Student",
    image: "https://api.dicebear.com/7.x/personas/svg?seed=ArjunReddy"
  },
  {
    quote: "Best decision I made was joining this platform. The mentors are always available and the Tamil resources made studying so much more comfortable.",
    author: "Sneha Iyer",
    role: "Foundation Student",
    image: "https://api.dicebear.com/7.x/personas/svg?seed=SnehaIyer"
  },
  {
    quote: "The weekly live sessions and recorded lectures have been game-changers. As a Tamil student, having content in my language helped me learn at my own pace!",
    author: "Siddu Kumar",
    role: "Qualifier Student",
    image: "https://api.dicebear.com/7.x/personas/svg?seed=SidduKumar"
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
    <div className="relative w-full py-12 md:py-16 overflow-hidden">
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 mb-8">
        <div className="text-center">
          <h2 className="text-3xl md:text-5xl font-bold text-black mb-4">
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
              className={`bg-white border border-gray-200 rounded-2xl p-6 w-[400px] h-[280px] shrink-0 hover:border-gray-300 hover:shadow-lg transition-all duration-300 flex flex-col ${
                idx % 2 === 0 ? "mt-0" : "mt-12"
              }`}
            >
              <div className="flex items-start gap-4 mb-4">
                <div className="relative w-12 h-12 rounded-full overflow-hidden bg-gray-100 ring-2 ring-gray-200">
                  <Image
                    src={testimonial.image}
                    alt={testimonial.author}
                    fill
                    className="object-cover"
                  />
                </div>
                <div>
                  <p className="font-semibold text-black">{testimonial.author}</p>
                  <p className="text-sm text-[#51b206]">{testimonial.role}</p>
                </div>
              </div>
              <p className="text-gray-700 leading-relaxed text-sm flex-1">"{testimonial.quote}"</p>
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
              className={`bg-white border border-gray-200 rounded-2xl p-6 w-[400px] h-[280px] shrink-0 hover:border-gray-300 hover:shadow-lg transition-all duration-300 flex flex-col ${
                idx % 2 === 0 ? "mt-0" : "mt-12"
              }`}
            >
              <div className="flex items-start gap-4 mb-4">
                <div className="relative w-12 h-12 rounded-full overflow-hidden bg-gray-100 ring-2 ring-gray-200">
                  <Image
                    src={testimonial.image}
                    alt={testimonial.author}
                    fill
                    className="object-cover"
                  />
                </div>
                <div>
                  <p className="font-semibold text-black">{testimonial.author}</p>
                  <p className="text-sm text-[#51b206]">{testimonial.role}</p>
                </div>
              </div>
              <p className="text-gray-700 leading-relaxed text-sm flex-1">"{testimonial.quote}"</p>
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
