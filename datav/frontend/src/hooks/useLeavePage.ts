// Copyright 2023 xObserve.io Team

import { useEffect } from 'react'
import { unstable_usePrompt, useLocation } from 'react-router-dom'
import { useBeforeUnload } from 'react-use'

export const useLeavePageConfirm = (
  isConfirm = true,
  message = 'Changes not saved, are you sure to leave this page?',
) => {
  // SPA pages switch
  unstable_usePrompt({ when: isConfirm, message })

  // browser pages action
  useBeforeUnload(isConfirm, message)
  // const location = useLocation()
  // useEffect(() => {
  //     if (isConfirm && !window.confirm(message)) {
  //         return
  //     };
  // }, [message, location]);
}
