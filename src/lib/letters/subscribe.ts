import { z } from 'zod'

export const letterSubscribePayloadSchema = z.object({
  email: z.email('Enter a valid email address.'),
})

export type LetterSubscribePayload = z.infer<typeof letterSubscribePayloadSchema>

export const letterSubscribeResponseSchema = z.discriminatedUnion('ok', [
  z.object({ ok: z.literal(true) }),
  z.object({
    ok: z.literal(false),
    error: z.string(),
  }),
])

export type LetterSubscribeResponse = z.infer<typeof letterSubscribeResponseSchema>
