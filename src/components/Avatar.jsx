import clsx from 'clsx'

export default function Avatar({ name, src, size = 44 }) {
  const initials = String(name || '?')
    .split(' ')
    .filter(Boolean)
    .slice(0, 2)
    .map((s) => s[0].toUpperCase())
    .join('')

  if (src) {
    return <img alt={name} src={src} style={{ width: size, height: size }} className={clsx('rounded-full object-cover border border-slate-200')} />
  }

  return (
    <div
      style={{ width: size, height: size }}
      className="rounded-full bg-[radial-gradient(circle_at_top,rgba(250,204,21,.26),transparent_60%),linear-gradient(180deg,#0b0f19,#0b0f19)] text-gpc-yellow border border-slate-200 flex items-center justify-center font-extrabold"
    >
      {initials}
    </div>
  )
}
