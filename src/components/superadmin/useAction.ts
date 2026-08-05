import { useState, useCallback, useRef } from 'react'

type ActionState = 'idle' | 'loading' | 'success' | 'error'

interface UseActionOptions {
  onSuccess?: () => void
  onError?: (err: unknown) => void
  duration?: number // ms to show success/error state before resetting
  debounceMs?: number // minimum time between clicks
}

interface UseActionReturn {
  state: ActionState
  loading: boolean
  success: boolean
  error: boolean
  message: string
  execute: (fn: () => Promise<void> | void) => Promise<void>
  reset: () => void
}

export function useAction(options: UseActionOptions = {}): UseActionReturn {
  const {
    onSuccess,
    onError,
    duration = 1500,
    debounceMs = 500,
  } = options

  const [state, setState] = useState<ActionState>('idle')
  const [message, setMessage] = useState('')
  const timerRef = useRef<ReturnType<typeof setTimeout> | null>(null)
  const lastClickRef = useRef(0)
  const mountedRef = useRef(true)

  const reset = useCallback(() => {
    setState('idle')
    setMessage('')
  }, [])

  const execute = useCallback(async (fn: () => Promise<void> | void) => {
    // Debounce: prevent rapid clicks
    const now = Date.now()
    if (now - lastClickRef.current < debounceMs) return
    lastClickRef.current = now

    // Clear any existing timer
    if (timerRef.current) clearTimeout(timerRef.current)

    setState('loading')
    setMessage('')

    try {
      await fn()
      if (!mountedRef.current) return
      setState('success')
      setMessage('Done!')
      onSuccess?.()
      timerRef.current = setTimeout(() => {
        if (mountedRef.current) reset()
      }, duration)
    } catch (err) {
      if (!mountedRef.current) return
      setState('error')
      setMessage(err instanceof Error ? err.message : 'Something went wrong')
      onError?.(err)
      timerRef.current = setTimeout(() => {
        if (mountedRef.current) reset()
      }, duration)
    }
  }, [debounceMs, duration, onSuccess, onError, reset])

  return {
    state,
    loading: state === 'loading',
    success: state === 'success',
    error: state === 'error',
    message,
    execute,
    reset,
  }
}
