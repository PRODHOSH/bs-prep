import { LegalPage } from "@/components/legal-page"
import { CONTACT_EMAIL } from "@/lib/legal"

const mail = <a href={`mailto:${CONTACT_EMAIL}`}>{CONTACT_EMAIL}</a>

const sections = [
  {
    title: "Overview",
    body: "BSPrep fees give you access to digital content and live classes as soon as your enrollment is confirmed. This policy explains what happens when you need to raise a payment issue and how any approved refund is paid.",
  },
  {
    title: "How payments work",
    body: "Every payment on BSPrep is processed by Razorpay. We never see or store your card, UPI or banking details. Your payment receipt and payment ID come from Razorpay and are also sent to your registered email.",
  },
  {
    title: "When fees are not refundable",
    body: "Once your enrollment is confirmed and you have access to the course, the fee is not refundable for change of mind, inability to attend live classes, or dissatisfaction with the course. Please review the course details and syllabus before you pay.",
  },
  {
    title: "Payment issues we will fix",
    body: "If you were charged twice for the same course, or the amount was debited but your enrollment was not activated, tell us. We verify the payment with Razorpay and either activate your enrollment or approve a refund. Transactions that fail at the bank are normally reversed automatically by your bank or Razorpay.",
  },
  {
    title: "How refunds are paid",
    body: "Approved refunds are issued only through Razorpay and are returned to the original payment method used for the purchase. We cannot refund to a different account, wallet or person. Once a refund is initiated, it usually reaches you in 5 to 7 business days, depending on your bank or card issuer.",
  },
  {
    title: "Platform and gateway charges",
    body: "Platform and payment-gateway charges added to a transaction are not refunded, even when the course fee is.",
  },
  {
    title: "How to raise an issue",
    body: (
      <>
        Email {mail} from your registered email address with your name, the course, the Razorpay payment ID and a screenshot of the payment if you have one. We review every request and reply by email.
      </>
    ),
  },
]

export default function RefundPolicyPage() {
  return (
    <LegalPage
      title="Refund policy"
      sections={sections}
      callout={{
        eyebrow: "In short",
        title: "Refunds go through Razorpay only",
        text: (
          <>
            Any approved refund is returned to your original payment method through <strong>Razorpay</strong>. Platform and payment-gateway charges are not refunded. For any issue, contact <a href={`mailto:${CONTACT_EMAIL}`}>{CONTACT_EMAIL}</a>.
          </>
        ),
      }}
      contact={{ heading: "Had a payment issue?", email: CONTACT_EMAIL }}
    />
  )
}
