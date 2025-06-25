import { Loader2 } from "lucide-react"

interface LoaderProps {
  className?: string
  size?: number
}

export default function Loader({ className = "", size = 40 }: LoaderProps) {
  return (
    <Loader2
      className={`animate-spin text-purple-600 ${className}`}
      size={size}
    />
  )
}
