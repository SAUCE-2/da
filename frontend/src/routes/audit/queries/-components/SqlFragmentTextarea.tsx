import { Textarea } from '@/components/ui/textarea'
import { trimFragmentBoundaries } from '@/lib/format-sql'

type SqlFragmentTextareaProps = {
  value: string
  onChange: (value: string) => void
  placeholder?: string
  className?: string
}

export function SqlFragmentTextarea({
  value,
  onChange,
  placeholder,
  className,
}: SqlFragmentTextareaProps) {
  function handleBlur() {
    if (!value.trim()) {
      return
    }

    const trimmed = trimFragmentBoundaries(value)
    if (trimmed !== value) {
      onChange(trimmed)
    }
  }

  return (
    <Textarea
      value={value}
      onChange={(event) => onChange(event.target.value)}
      onBlur={handleBlur}
      className={className}
      placeholder={placeholder}
    />
  )
}
