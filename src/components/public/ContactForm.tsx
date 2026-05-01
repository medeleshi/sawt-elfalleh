// src/components/public/ContactForm.tsx
'use client'

import { useActionState, useEffect, useRef } from 'react'
import { submitContactAction, type ContactFormState } from '@/actions/contact-form.actions'

const INITIAL_STATE: ContactFormState = { status: 'idle' }

export default function ContactForm() {
  const [state, action, isPending] = useActionState(submitContactAction, INITIAL_STATE)
  const formRef = useRef<HTMLFormElement>(null)

  // Reset form on success
  useEffect(() => {
    if (state.status === 'success') {
      formRef.current?.reset()
    }
  }, [state.status])

  const fields = state.status === 'validation' ? state.fields : {}

  return (
    <form ref={formRef} action={action} className="contact-form" noValidate dir="rtl">
      {/* Success banner */}
      {state.status === 'success' && (
        <div className="contact-form__success" role="alert">
          <span>✅</span>
          <span>تم إرسال رسالتك بنجاح! سنتواصل معك قريباً.</span>
        </div>
      )}

      {/* Error banner */}
      {state.status === 'error' && (
        <div className="contact-form__error" role="alert">
          <span>⚠️</span>
          <span>{state.error}</span>
        </div>
      )}

      {/* Name */}
      <div className="contact-form__field">
        <label htmlFor="cf-name" className="contact-form__label">
          الاسم الكامل <span aria-hidden>*</span>
        </label>
        <input
          id="cf-name"
          name="name"
          type="text"
          autoComplete="name"
          placeholder="محمد بن علي"
          className={`contact-form__input ${fields.name ? 'contact-form__input--error' : ''}`}
          disabled={isPending}
          aria-describedby={fields.name ? 'cf-name-err' : undefined}
        />
        {fields.name && (
          <p id="cf-name-err" className="contact-form__field-error">{fields.name}</p>
        )}
      </div>

      {/* Email */}
      <div className="contact-form__field">
        <label htmlFor="cf-email" className="contact-form__label">
          البريد الإلكتروني <span aria-hidden>*</span>
        </label>
        <input
          id="cf-email"
          name="email"
          type="email"
          autoComplete="email"
          placeholder="example@email.com"
          className={`contact-form__input ${fields.email ? 'contact-form__input--error' : ''}`}
          disabled={isPending}
          aria-describedby={fields.email ? 'cf-email-err' : undefined}
          dir="ltr"
        />
        {fields.email && (
          <p id="cf-email-err" className="contact-form__field-error">{fields.email}</p>
        )}
      </div>

      {/* Message */}
      <div className="contact-form__field">
        <label htmlFor="cf-message" className="contact-form__label">
          رسالتك <span aria-hidden>*</span>
        </label>
        <textarea
          id="cf-message"
          name="message"
          rows={5}
          placeholder="اكتب رسالتك هنا..."
          className={`contact-form__input contact-form__textarea ${fields.message ? 'contact-form__input--error' : ''}`}
          disabled={isPending}
          aria-describedby={fields.message ? 'cf-msg-err' : undefined}
        />
        {fields.message && (
          <p id="cf-msg-err" className="contact-form__field-error">{fields.message}</p>
        )}
      </div>

      <button
        type="submit"
        className="contact-form__submit"
        disabled={isPending}
      >
        {isPending ? (
          <>
            <span className="contact-form__spinner" aria-hidden />
            جاري الإرسال...
          </>
        ) : (
          'إرسال الرسالة'
        )}
      </button>
    </form>
  )
}
