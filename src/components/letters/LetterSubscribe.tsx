'use client'

import LetterSubscribeInlineForm from './subscribe/LetterSubscribeInlineForm'
import LetterSubscribeTrigger from './subscribe/LetterSubscribeTrigger'
import { useLetterSubscribe } from './subscribe/useLetterSubscribe'

export default function LetterSubscribe() {
  const subscribe = useLetterSubscribe()

  if (subscribe.hasSubscribed) {
    return (
      <LetterSubscribeTrigger
        hasSubscribed={subscribe.hasSubscribed}
        onClose={subscribe.closeForm}
        onOpen={subscribe.openForm}
        open={subscribe.open}
        formId={subscribe.formId}
      />
    )
  }

  return (
    <div className={`not-prose flex items-center gap-2 ${subscribe.open ? 'w-full sm:w-auto' : ''}`}>
      <LetterSubscribeTrigger
        hasSubscribed={subscribe.hasSubscribed}
        onClose={subscribe.closeForm}
        onOpen={subscribe.openForm}
        open={subscribe.open}
        formId={subscribe.formId}
      />
      <LetterSubscribeInlineForm subscribe={subscribe} />
    </div>
  )
}
