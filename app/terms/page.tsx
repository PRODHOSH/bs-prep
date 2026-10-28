import Link from "next/link"
import { LegalPage } from "@/components/legal-page"

const sections = [
  {
    title: "Agreement to terms",
    body: "By accessing or using BSPrep, you agree to be bound by these Terms & Conditions. If you do not agree with any part of these terms, please do not use our platform.",
  },
  {
    title: "About BSPrep",
    body: "BSPrep is a student-led, independent coaching and mentorship platform created to help students prepare for the IIT Madras BS Degree Qualifier examinations. We are not affiliated with, endorsed by, or officially connected to IIT Madras or the IITM BS Degree program in any capacity.",
  },
  {
    title: "Service description",
    body: "We provide coaching sessions, mentorship, study materials, practice quizzes, recorded resources, community access, and related academic support — all specifically designed for IITM BS Qualifier preparation.",
  },
  {
    title: "User accounts",
    body: "You must provide accurate and complete information when creating an account. You are responsible for maintaining the confidentiality of your credentials and for all activities that occur under your account. Notify us immediately at support@bsprep.in if you suspect unauthorized access.",
  },
  {
    title: "Acceptable use",
    body: "You agree not to: violate any applicable laws or regulations; share, redistribute, or resell paid platform content; post harmful, abusive, or misleading material; attempt to gain unauthorized access to any part of the platform; or use the platform for any purpose other than personal academic preparation.",
  },
  {
    title: "Payments and refunds",
    body: (
      <>
        All payments are processed securely through Razorpay. Refunds, where approved, are issued only through Razorpay to your original payment method. Platform and payment-gateway charges are not refunded. Once enrollment is confirmed and access is granted, fees are not refundable for change of mind, inability to attend or dissatisfaction. The full rules are in our <Link href="/refund-policy">refund policy</Link>. For any payment issue, write to <a href="mailto:contact@bsprep.in">contact@bsprep.in</a>.
      </>
    ),
  },
  {
    title: "Intellectual property",
    body: "All study materials, videos, notes, quizzes, branding, and platform content are the exclusive property of BSPrep and protected by applicable intellectual property laws. Unauthorized reproduction, distribution, or commercial use of any content is strictly prohibited.",
  },
  {
    title: "Privacy",
    body: "Your use of BSPrep is also governed by our Privacy Policy, which describes how we collect, use, and protect your personal data. By using our platform, you consent to the practices described in that policy.",
  },
  {
    title: "No guarantees",
    body: "We do not guarantee specific academic results, exam scores, or admission outcomes. Results depend entirely on individual effort, consistency, and factors outside our control. BSPrep provides support tools — success requires your commitment.",
  },
  {
    title: "Platform availability",
    body: "We strive to maintain continuous access to the platform, but we do not guarantee uninterrupted or error-free service. Scheduled maintenance, technical issues, or unforeseen circumstances may temporarily affect availability.",
  },
  {
    title: "Certificates & verification",
    body: "Any certificates, completion letters, or verification documents issued by BSPrep must be used honestly and lawfully. Falsification or misuse of such documents is strictly prohibited and may result in immediate account termination.",
  },
  {
    title: "Account termination",
    body: "BSPrep reserves the right to suspend or permanently terminate accounts that violate these Terms, engage in harmful behaviour, or misuse platform resources — without prior notice and without liability.",
  },
  {
    title: "Student ambassador program",
    body: "Participants in the BSPrep Student Ambassador Program agree to additional terms communicated at the time of enrollment. Ambassador activities must not damage the reputation of BSPrep or its partners. Ambassadors may not make commitments or promises on behalf of BSPrep without prior written approval from the BSPrep team.",
  },
  {
    title: "Governing law",
    body: "These terms are governed by the laws of India. Any dispute that cannot be resolved by writing to us first will be subject to the courts of India.",
  },
  {
    title: "Changes to terms",
    body: "We may update these Terms & Conditions from time to time. Continued use of the platform after changes are posted constitutes your acceptance of the revised terms. We recommend reviewing this page periodically.",
  },
]

export default function TermsPage() {
  return (
    <LegalPage
      title="Terms & conditions"
      sections={sections}
      callout={{
        eyebrow: "Refunds",
        title: "Refunds go through Razorpay only",
        text: (
          <>
            Approved refunds are returned to your original payment method through <strong>Razorpay</strong>. Platform and payment-gateway charges are not refunded. For any payment issue, email <a href="mailto:contact@bsprep.in">contact@bsprep.in</a>. Read the full <Link href="/refund-policy">refund policy</Link>.
          </>
        ),
      }}
      contact={{ heading: "Questions about these terms?", email: "support@bsprep.in" }}
    />
  )
}
