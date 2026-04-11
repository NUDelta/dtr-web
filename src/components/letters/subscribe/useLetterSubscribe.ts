'use client'

import { useForm } from '@tanstack/react-form-nextjs'
import { useEffect, useId, useRef, useState } from 'react'
import { toast } from 'sonner'
import { letterSubscribePayloadSchema } from '@/lib/letters/subscribe'
import {
  DEFAULT_SUBSCRIBE_ERROR,
  parseSubscribeResponse,
} from './utils'

const emailSchema = letterSubscribePayloadSchema.shape.email

export function useLetterSubscribe() {
  const [open, setOpen] = useState(false)
  const [hasSubscribed, setHasSubscribed] = useState(false)
  const [submitError, setSubmitError] = useState<string | null>(null)

  const inputRef = useRef<HTMLInputElement | null>(null)
  const formId = useId()
  const emailId = useId()
  const fieldErrorId = useId()
  const formMessageId = useId()

  const form = useForm({
    defaultValues: {
      email: '',
    },
    onSubmit: async ({ value, formApi }) => {
      setSubmitError(null)

      const payload = letterSubscribePayloadSchema.parse(value)

      try {
        const response = await fetch('/api/letters/subscribe', {
          method: 'POST',
          headers: {
            'Accept': 'application/json',
            'Content-Type': 'application/json',
          },
          body: JSON.stringify(payload),
        })

        const result = await parseSubscribeResponse(response)

        if (!response.ok || !result.ok) {
          const errorMessage = result.ok ? DEFAULT_SUBSCRIBE_ERROR : result.error
          setSubmitError(errorMessage)
          toast.error(errorMessage)
          return
        }

        formApi.reset()
        setOpen(false)
        setHasSubscribed(true)
        toast.success('You’re subscribed to future letters.')
      }
      catch {
        setSubmitError(DEFAULT_SUBSCRIBE_ERROR)
        toast.error(DEFAULT_SUBSCRIBE_ERROR)
      }
    },
  })

  useEffect(() => {
    if (!open) {
      return
    }

    const focusTimer = window.setTimeout(() => {
      inputRef.current?.focus()
    }, 50)

    return () => {
      window.clearTimeout(focusTimer)
    }
  }, [open])

  function openForm() {
    setSubmitError(null)
    setOpen(true)
  }

  function closeForm() {
    setSubmitError(null)
    form.reset()
    setOpen(false)
  }

  function clearSubmitError() {
    setSubmitError(null)
  }

  return {
    emailId,
    fieldErrorId,
    form,
    formId,
    formMessageId,
    hasSubscribed,
    inputRef,
    open,
    openForm,
    closeForm,
    clearSubmitError,
    submitError,
    emailSchema,
  }
}
