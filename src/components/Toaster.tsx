import { useEffect, useState } from 'react'
import { Check } from 'lucide-react'
import { useToast } from '@/stores/toast-store'

export function Toaster() {
  const msg = useToast((s) => s.msg)
  const id = useToast((s) => s.id)
  const [visible, setVisible] = useState(false)

  useEffect(() => {
    if (!id) return
    setVisible(true)
    const t = setTimeout(() => setVisible(false), 1900)
    return () => clearTimeout(t)
  }, [id])

  if (!visible) return null
  return (
    <div
      className="fixed left-1/2 -translate-x-1/2 z-[80] flex items-center gap-1.5 px-3.5 py-2 rounded-full bg-text-primary text-surface text-[12px] font-medium shadow-lg animate-slide-up"
      style={{ bottom: 'calc(env(safe-area-inset-bottom) + 88px)' }}
    >
      <Check size={13} />{msg}
    </div>
  )
}
