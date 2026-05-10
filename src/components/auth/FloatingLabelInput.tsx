import type { InputHTMLAttributes } from 'react'

type FloatingLabelInputProps = {
  id: string
  label: string
  error?: string
} & InputHTMLAttributes<HTMLInputElement>

export function FloatingLabelInput({
  id,
  label,
  error,
  ...inputProps
}: FloatingLabelInputProps) {
  const hasValue = Boolean(inputProps.value)

  return (
    <div className="floating-input">
      <div className={`field ${error ? 'field-error' : ''}`}>
        <input id={id} placeholder=" " aria-invalid={Boolean(error)} {...inputProps} />
        <label className={hasValue ? 'label-floated' : ''} htmlFor={id}>
          {label}
        </label>
      </div>
      {error ? <p className="field-error-text">{error}</p> : null}
    </div>
  )
}
