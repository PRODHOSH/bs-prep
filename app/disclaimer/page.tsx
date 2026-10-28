import { LegalPage } from "@/components/legal-page"

const sections = [
  {
    title: "General information only",
    body: "The content provided on BSPrep — including study materials, notes, quizzes, videos, and mentorship resources — is intended for general informational and educational purposes only. It does not constitute official academic advice, and should not be treated as such.",
  },
  {
    title: "No affiliation with IIT Madras",
    body: "BSPrep is an independent, student-led initiative. We are not affiliated with, endorsed by, sponsored by, or officially connected to IIT Madras, the IITM BS Degree program, or any of their faculties or departments. Any mention of \"IITM BS\" or \"IIT Madras\" on this platform refers solely to the publicly known academic program, not to any institutional association.",
  },
  {
    title: "No guarantee of results",
    body: "We do not guarantee any specific academic results, exam scores, qualifier passing outcomes, or degree admissions. Individual performance depends entirely on personal effort, consistency, understanding, and factors beyond our platform's control. Past student experiences shared on BSPrep are illustrative and not indicative of guaranteed outcomes.",
  },
  {
    title: "Mentor & tutor content",
    body: "Mentors on BSPrep are students or recent alumni of the IITM BS program who share their personal knowledge and experience. They are not official IIT Madras faculty or certified academic instructors. Their guidance reflects personal perspective and should be verified against official IITM sources.",
  },
  {
    title: "Accuracy of content",
    body: "While we work hard to keep our study materials and platform information accurate and current, we make no warranties regarding the completeness, reliability, or accuracy of any content. The IITM BS program syllabus and exam patterns may change — always refer to the official IITM BS portal for the most current information.",
  },
  {
    title: "Third-party links & services",
    body: "Our platform may reference or link to external websites, tools, or services such as Zoom, Google Meet, YouTube, or other resources. BSPrep is not responsible for the content, accuracy, availability, or privacy practices of any third-party platforms.",
  },
  {
    title: "Platform availability",
    body: "We do not guarantee uninterrupted, error-free, or continuous access to BSPrep. Scheduled maintenance, technical issues, or circumstances beyond our control may temporarily affect availability. We are not liable for any inconvenience or loss arising from such interruptions.",
  },
  {
    title: "Community content",
    body: "Opinions, strategies, tips, or advice shared by community members within BSPrep forums or discussions represent the views of individual users — not the official position of BSPrep. Users are encouraged to independently verify information before acting on it.",
  },
  {
    title: "Changes to this disclaimer",
    body: "BSPrep reserves the right to modify this disclaimer at any time. Updates will be reflected on this page with a revised date. Continued use of the platform after changes have been posted constitutes your acceptance of the updated disclaimer.",
  },
]

export default function DisclaimerPage() {
  return <LegalPage title="Disclaimer" sections={sections} contact={{ heading: "Have a question or concern?", email: "support@bsprep.in" }} />
}
