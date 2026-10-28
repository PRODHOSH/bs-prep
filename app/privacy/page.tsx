import { LegalPage } from "@/components/legal-page"

const sections = [
  {
    title: "Who we are",
    body: "BSPrep is a student-led platform built to help students prepare for the IIT Madras BS Degree Qualifier examinations. We are an independent initiative — not affiliated with, endorsed by, or officially connected to IIT Madras in any way. This platform is operated by students for students.",
  },
  {
    title: "Information we collect",
    body: "We may collect personal information including your full name, email address, phone number, educational institution, and course or program details. When you make a payment, transaction metadata is handled by Razorpay — we do not store your card or banking credentials on our servers.",
  },
  {
    title: "How we use your information",
    body: "Your information is used to deliver our services: processing enrollments, providing course materials, sending transactional emails (account confirmations, payment receipts, course updates, and support responses), and improving the platform. We do not sell, rent, or trade your personal data to any third party under any circumstances.",
  },
  {
    title: "Email communications",
    body: "We use Resend (a transactional email service) to send account notifications, payment receipts, course enrollment confirmations, platform announcements, and replies to support requests. You can opt out of non-essential communications by contacting us.",
  },
  {
    title: "Payment processing",
    body: "All payments, and any approved refunds, are processed securely through Razorpay, a PCI-DSS compliant payment gateway. BSPrep does not store, view, or have access to your card details or banking credentials. Razorpay's own privacy policy governs the handling of payment data.",
  },
  {
    title: "Data storage",
    body: "User accounts, course enrollments, and platform data are stored in Supabase — a secure, cloud-hosted database infrastructure. Data is protected with encrypted connections and access controls.",
  },
  {
    title: "Analytics & monitoring",
    body: "We use Google Analytics 4 to understand how users interact with the platform (pages visited, features used, session duration). We also use Google Search Console and Bing Webmaster Tools to monitor search performance — these tools collect aggregated, non-personally-identifiable data. Vercel Analytics provides anonymous page performance data.",
  },
  {
    title: "Cookies & tracking",
    body: "We use cookies to maintain your login session (Supabase authentication), store your preferences, and collect anonymous usage analytics (Google Analytics). You can view full cookie details in our Cookie Policy. Users may disable cookies through their browser settings, though this may affect login functionality.",
  },
  {
    title: "Data sharing",
    body: "We share your data only with the service providers necessary to operate BSPrep: Razorpay (payments), Supabase (data storage), Resend (transactional emails), and Google Analytics (anonymised usage data). For Student Ambassador Program participants, shipping addresses and contact details are shared with verified merchandise partners (e.g., Sticker Fever) solely for reward fulfillment. We do not share your data with advertisers, data brokers, or any unrelated third parties.",
  },
  {
    title: "Data security",
    body: "We implement security measures including HTTPS/SSL encryption, secure database access controls, and restricted admin permissions. However, no system is fully immune to security risks, and we cannot guarantee absolute security.",
  },
  {
    title: "Your rights",
    body: "You have the right to access, correct, or request deletion of your personal data. To exercise these rights or raise a data concern, contact us at support@bsprep.in. We will respond within a reasonable timeframe.",
  },
  {
    title: "Community content & public doubts",
    body: "Content posted in community spaces may be visible to other enrolled members. Doubts marked as \"Public\" by a Mentor or Admin will be visible on the publicly accessible /doubts section of BSPrep and indexed by search engines. Avoid sharing sensitive personal information publicly. BSPrep reserves the right to moderate or remove content that violates community standards.",
  },
  {
    title: "Minor students",
    body: "If students under 18 enroll in our programs, parental or guardian consent is assumed. We do not knowingly collect personal data from children under 13 without parental consent.",
  },
  {
    title: "External platforms",
    body: "Our platform may link to or integrate with external services such as Zoom, Google Meet, or YouTube. These platforms operate under their own privacy policies, and BSPrep is not responsible for their data practices.",
  },
  {
    title: "Policy updates",
    body: "We may revise this Privacy Policy from time to time. Material updates will be posted on this page with a revised date. Continued use of BSPrep after changes constitutes your acceptance of the updated policy.",
  },
]

export default function PrivacyPolicyPage() {
  return <LegalPage title="Privacy policy" sections={sections} contact={{ heading: "Questions about your data?", email: "support@bsprep.in" }} />
}
