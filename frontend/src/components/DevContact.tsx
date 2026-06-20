const LINKS = [
  { label: 'LinkedIn', href: 'https://linkedin.com/in/adityandar' },
  { label: 'Threads', href: 'https://www.threads.com/@adityandar.jpg' },
  { label: 'TikTok', href: 'https://tiktok.com/@yahadityak' },
]

export function DevContact() {
  return (
    <div className="mt-5 pt-3 border-t-2 border-black text-[10px] font-medium text-gray-500">
      <span className="mr-1">Dev</span>
      {LINKS.map((link, i) => (
        <span key={link.label}>
          <a href={link.href} target="_blank" rel="noopener noreferrer" className="underline hover:text-black">
            {link.label}
          </a>
          {i < LINKS.length - 1 && <span className="mx-1">·</span>}
        </span>
      ))}
    </div>
  )
}
