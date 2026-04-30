import { forwardRef } from 'react'
import { cn } from '@/lib/utils/cn'

interface FormFieldProps extends React.InputHTMLAttributes<HTMLInputElement> {
  label: string
  error?: string
  hint?: string
}

/**
 * Labeled input with error and hint text.
 * Works with react-hook-form via ref forwarding.
 */
const FormField = forwardRef<HTMLInputElement, FormFieldProps>(
  ({ label, error, hint, className, id, ...props }, ref) => {
    const fieldId = id ?? label

    return (
      <div className="space-y-1.5">
        <label
          htmlFor={fieldId}
          className="block text-sm font-medium text-foreground"
        >
          {label}
          {props.required && (
            <span className="mr-1 text-destructive" aria-hidden>
              *
            </span>
          )}
        </label>

        <input
          ref={ref}
          id={fieldId}
          className={cn(
            'flex h-10 w-full rounded-lg border border-input bg-background px-3 py-2 text-sm text-foreground',
            'placeholder:text-muted-foreground',
            'transition-shadow focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-1',
            'disabled:cursor-not-allowed disabled:opacity-50',
            error && 'border-destructive focus-visible:ring-destructive/40',
            className
          )}
          aria-describedby={
            error ? `${fieldId}-error` : hint ? `${fieldId}-hint` : undefined
          }
          aria-invalid={!!error}
          {...props}
        />

        {hint && !error && (
          <p id={`${fieldId}-hint`} className="text-xs text-muted-foreground">
            {hint}
          </p>
        )}

        {error && (
          <p
            id={`${fieldId}-error`}
            role="alert"
            className="text-xs text-destructive"
          >
            {error}
          </p>
        )}
      </div>
    )
  }
)
FormField.displayName = 'FormField'

export default FormField
