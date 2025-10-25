'use client'

import { AppProgressBar as ProgressBar } from 'next-nprogress-bar'

const RouterTransition = () => {
  return (
    <ProgressBar
      color="#f5ed9c"
      height="4px"
      options={{ showSpinner: false }}
      aria-hidden="true"
    />
  )
}

export default RouterTransition
