/** Footer trust card: payments are handled by Razorpay. Same shape as the preferred-source card. */
export function RazorpayBadge({ className = "" }: { className?: string }) {
  return (
    <div className={`flex w-full max-w-sm items-center gap-3 rounded-2xl border border-black/10 bg-white px-4 py-3 shadow-sm ${className}`}>
      <span className="grid size-10 shrink-0 place-items-center rounded-xl bg-[#f4f4f4]">
        <img src="/logos/razorpay.svg" alt="" width={20} height={20} className="size-5" />
      </span>
      <span className="min-w-0 normal-case">
        <span className="block text-sm font-bold leading-tight text-black">Payments secured by Razorpay</span>
        <span className="block text-xs font-medium text-black/55">PCI-DSS compliant gateway</span>
      </span>
    </div>
  )
}
