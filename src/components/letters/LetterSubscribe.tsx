'use client'

import LetterSubscribeDialog from './subscribe/LetterSubscribeDialog'
import LetterSubscribeTrigger from './subscribe/LetterSubscribeTrigger'
import { useLetterSubscribe } from './subscribe/useLetterSubscribe'

export default function LetterSubscribe() {
  const subscribe = useLetterSubscribe()

  return (
    <>
      <LetterSubscribeTrigger
        hasSubscribed={subscribe.hasSubscribed}
        onOpen={subscribe.openForm}
        open={subscribe.open}
        formId={subscribe.formId}
      />
      <LetterSubscribeDialog subscribe={subscribe} />
    </>
  )
}
