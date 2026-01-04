"use client"

import { useEffect, useState } from "react"
import { Navbar } from "@/components/navbar"
import { Footer } from "@/components/footer"
import { Card, CardContent } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Github, Award, Code2, GitCommit, ExternalLink, Loader2 } from "lucide-react"

interface Contributor {
  login: string
  id: number
  avatar_url: string
  html_url: string
  contributions: number
  name?: string
}

// Manual badges for special contributors
const specialBadges: Record<string, string[]> = {
  // Add GitHub usernames here to give them special badges
  "PRODHOSH": ["Web Developer", "Core Contributor"]
}

export default function ContributorsPage() {
  const [contributors, setContributors] = useState<Contributor[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(false)

  useEffect(() => {
    async function fetchContributors() {
      try {
        // GitHub repository details
        const GITHUB_OWNER = "IITMBSTamilCommunity"
        const GITHUB_REPO = "bsprep"
        
        const response = await fetch(
          `https://api.github.com/repos/${GITHUB_OWNER}/${GITHUB_REPO}/contributors`,
          {
            headers: {
              'Accept': 'application/vnd.github.v3+json',
            },
          }
        )

        if (!response.ok) throw new Error("Failed to fetch")

        const data = await response.json()
        setContributors(data)
      } catch (err) {
        console.error("Error fetching contributors:", err)
        setError(true)
      } finally {
        setLoading(false)
      }
    }

    fetchContributors()
  }, [])

  const getRankBadge = (rank: number) => {
    if (rank === 1) return { icon: "🥇", color: "from-yellow-500 to-yellow-600", text: "#1" }
    if (rank === 2) return { icon: "🥈", color: "from-slate-400 to-slate-500", text: "#2" }
    if (rank === 3) return { icon: "🥉", color: "from-orange-600 to-orange-700", text: "#3" }
    return { icon: "", color: "from-slate-600 to-slate-700", text: `#${rank}` }
  }

  const isTopContributor = (rank: number) => rank <= 3

  return (
    <div className="min-h-screen">
      <Navbar isAuthenticated={false} />

      {/* Hero Section */}
      <section className="relative pt-32 pb-20 overflow-hidden">
        <div className="container mx-auto px-4 sm:px-6 lg:px-8 max-w-7xl">
          <div className="text-center mb-6">
            <div className="inline-flex items-center gap-3 bg-white/5 backdrop-blur-sm border border-slate-800 rounded-full px-6 py-3 mb-8">
              <Code2 className="w-5 h-5 text-[#51b206]" />
              <span className="text-slate-300 text-sm font-medium">Open Source Project</span>
            </div>
            
            <h1 className="text-5xl md:text-6xl font-bold mb-6">
              <span className="bg-gradient-to-r from-white to-slate-400 bg-clip-text text-transparent">
                Contributors
              </span>
            </h1>
            
            <p className="text-xl text-slate-400 max-w-2xl mx-auto mb-3">
              People who build and improve BSPrep
            </p>
            
            <p className="text-sm text-slate-500">
              Contributions are based on commits to the BSPrep repository
            </p>
          </div>
        </div>
      </section>

      {/* Contributors Section */}
      <section className="py-12 pb-20">
        <div className="container mx-auto px-4 sm:px-6 lg:px-8 max-w-7xl">
          {loading && (
            <div className="flex flex-col items-center justify-center py-20">
              <Loader2 className="w-12 h-12 text-[#51b206] animate-spin mb-4" />
              <p className="text-slate-400">Loading contributors...</p>
            </div>
          )}

          {error && (
            <div className="text-center py-20">
              <div className="bg-red-500/10 border border-red-500/20 rounded-xl p-8 max-w-md mx-auto">
                <p className="text-slate-300 mb-2">Unable to load contributors right now</p>
                <p className="text-slate-500 text-sm">Please try again later</p>
              </div>
            </div>
          )}

          {!loading && !error && contributors.length === 0 && (
            <div className="text-center py-20">
              <p className="text-slate-400">No contributors found</p>
            </div>
          )}

          {!loading && !error && contributors.length > 0 && (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
              {contributors.map((contributor, index) => {
                const rank = index + 1
                const rankBadge = getRankBadge(rank)
                const isTop = isTopContributor(rank)
                const badges = specialBadges[contributor.login] || []

                return (
                  <Card
                    key={contributor.id}
                    className={`group relative bg-black/80 backdrop-blur-sm border-slate-800 hover:border-[#51b206]/50 transition-all duration-300 hover:scale-105 hover:shadow-xl hover:shadow-[#51b206]/10 ${
                      isTop ? 'ring-2 ring-[#51b206]/30' : ''
                    }`}
                  >
                    <CardContent className="p-6">
                      {/* Rank Badge */}
                      <div className="absolute -top-3 -right-3 z-10">
                        <div className={`bg-gradient-to-br ${rankBadge.color} text-white text-xs font-bold px-3 py-1.5 rounded-full shadow-lg flex items-center gap-1`}>
                          {rankBadge.icon && <span>{rankBadge.icon}</span>}
                          <span>{rankBadge.text}</span>
                        </div>
                      </div>

                      {/* Avatar */}
                      <div className="relative mb-4">
                        <div className={`w-24 h-24 mx-auto rounded-full overflow-hidden ring-4 ${
                          isTop ? 'ring-[#51b206]/50' : 'ring-slate-700/50'
                        } group-hover:ring-[#51b206] transition-all`}>
                          <img
                            src={contributor.avatar_url}
                            alt={`${contributor.login}'s avatar`}
                            className="w-full h-full object-cover"
                          />
                        </div>
                      </div>

                      {/* Info */}
                      <div className="text-center mb-4">
                        <h3 className="text-lg font-bold text-white mb-1 truncate">
                          {contributor.login}
                        </h3>
                        
                        {/* Contribution Count */}
                        <div className="flex items-center justify-center gap-1.5 text-[#51b206] mb-3">
                          <GitCommit className="w-4 h-4" />
                          <span className="text-sm font-semibold">
                            {contributor.contributions.toLocaleString()} commits
                          </span>
                        </div>

                        {/* Special Badges */}
                        {badges.length > 0 && (
                          <div className="flex flex-wrap gap-2 justify-center mb-3">
                            {badges.map((badge, i) => (
                              <span
                                key={i}
                                className="inline-flex items-center gap-1 text-xs bg-[#3e3098]/20 text-[#3e3098] border border-[#3e3098]/30 px-2 py-1 rounded-full"
                              >
                                <Award className="w-3 h-3" />
                                {badge}
                              </span>
                            ))}
                          </div>
                        )}
                      </div>

                      {/* GitHub Link */}
                      <a
                        href={contributor.html_url}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="w-full"
                      >
                        <Button
                          variant="outline"
                          className="w-full border-slate-700 hover:border-[#51b206] hover:bg-[#51b206]/10 text-slate-300 hover:text-white transition-all group/btn"
                        >
                          <Github className="w-4 h-4 mr-2" />
                          View Profile
                          <ExternalLink className="w-3 h-3 ml-auto opacity-0 group-hover/btn:opacity-100 transition-opacity" />
                        </Button>
                      </a>
                    </CardContent>
                  </Card>
                )
              })}
            </div>
          )}

          {/* Become a Contributor CTA */}
          {!loading && !error && contributors.length > 0 && (
            <div className="mt-16 text-center">
              <div className="bg-gradient-to-br from-[#3e3098]/20 to-[#51b206]/20 border border-slate-800 rounded-2xl p-12 max-w-3xl mx-auto">
                <h3 className="text-2xl font-bold text-white mb-4">
                  Want to contribute?
                </h3>
                <p className="text-slate-400 mb-6">
                  BSPrep is open source! Check out our GitHub repository and start contributing today.
                </p>
                <a
                  href="https://github.com/IITMBSTamilCommunity/bsprep"
                  target="_blank"
                  rel="noopener noreferrer"
                >
                  <Button className="bg-[#51b206] hover:bg-[#51b206]/90 text-white px-8 py-6 text-lg rounded-full">
                    <Github className="w-5 h-5 mr-2" />
                    View on GitHub
                  </Button>
                </a>
              </div>
            </div>
          )}
        </div>
      </section>

      <Footer />
    </div>
  )
}
