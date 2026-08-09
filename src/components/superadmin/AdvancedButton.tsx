import { useState, type ReactNode, type ButtonHTMLAttributes } from 'react'
import { Loader2, Check, X } from 'lucide-react'

type ButtonVariant = 'primary' | 'danger' | 'success' | 'ghost' | 'outline'
type ButtonSize = 'sm' | 'md' | 'lg'

interface AdvancedButtonProps extends Omit<ButtonHTMLAttributes<HTMLButtonElement>, 'onClick'> {
  variant?: ButtonVariant
  size?: ButtonSize
  loading?: boolean
  success?: boolean
  error?: boolean
  icon?: ReactNode
  onClick?: () => void | Promise<void>
  debounceMs?: number
  tooltip?: string
  shortcut?: string
}

const variantStyles: Record<ButtonVariant, string> = {
  primary: 'text-white font-semibold shadow-flat hover:shadow-hover active:shadow-flat',
  danger: 'text-white font-semibold shadow-flat hover:shadow-hover active:shadow-flat',
  success: 'text-white font-semibold shadow-flat hover:shadow-hover active:shadow-flat',
  ghost: 'text-gray-600 font-medium hover:bg-gray-100',
  outline: 'text-gray-600 font-medium border border-gray-200 hover:bg-gray-50',
}

const variantBgs: Record<ButtonVariant, string> = {
  primary: '#1A5C7A',
  danger: '#DC2626',
  success: '#059669',
  ghost: 'transparent',
  outline: 'transparent',
}

const sizeStyles: Record<ButtonSize, string> = {
  sm: 'px-3 py-1.5 text-[11px] rounded-lg gap-1.5 min-h-[36px]',
  md: 'px-4 py-2 text-[12px] rounded-lg gap-2 min-h-[40px]',
  lg: 'px-5 py-2.5 text-[13px] rounded-xl gap-2 min-h-[44px]',
}

export default function AdvancedButton({
  variant = 'primary',
  size = 'md',
  loading = false,
  success = false,
  error = false,
  icon,
  onClick,
  debounceMs = 400,
  tooltip,
  shortcut,
  disabled,
  children,
  className = '',
  style,
  ...rest
}: AdvancedButtonProps) {
  const [clicked, setClicked] = useState(false)
  const [lastClick, setLastClick] = useState(0)

  const handleClick = async () => {
    if (loading || success || error || disabled) return
    
    // Debounce
    const now = Date.now()
    if (now - lastClick < debounceMs) return
    setLastClick(now)

    // Micro-scale animation
    setClicked(true)
    setTimeout(() => setClicked(false), 150)

    if (onClick) {
      await onClick()
    }
  }

  const showSpinner = loading
  const showSuccess = success && !loading
  const showError = error && !loading

  return (
    <button
      onClick={handleClick}
      disabled={disabled || loading}
      title={tooltip}
      className={`
        inline-flex items-center justify-center relative
        transition-all duration-200 select-none
        ${variantStyles[variant]}
        ${sizeStyles[size]}
        ${disabled || loading ? 'opacity-60 cursor-not-allowed' : 'cursor-pointer active:scale-95'}
        ${clicked ? 'scale-95' : ''}
        ${showSuccess ? 'scale-[1.02]' : ''}
        ${showError ? 'animate-shake' : ''}
        ${className}
      `}
      style={{
        background: variant === 'primary' || variant === 'danger' || variant === 'success'
          ? variantBgs[variant]
          : undefined,
        ...style,
      }}
      {...rest}
    >
      {/* Loading spinner */}
      {showSpinner && (
        <Loader2 size={size === 'sm' ? 11 : 13} className="animate-spin shrink-0" />
      )}

      {/* Success check */}
      {showSuccess && (
        <Check size={size === 'sm' ? 11 : 13} className="shrink-0 animate-pop-in" />
      )}

      {/* Error X */}
      {showError && (
        <X size={size === 'sm' ? 11 : 13} className="shrink-0" />
      )}

      {/* Icon (hidden during loading/success/error) */}
      {!showSpinner && !showSuccess && !showError && icon}

      {/* Label */}
      {showSpinner ? 'Processing...' : showSuccess ? 'Done!' : showError ? 'Failed' : children}

      {/* Keyboard shortcut badge */}
      {shortcut && !loading && (
        <kbd className="ml-1.5 px-1 py-0.5 text-[8px] rounded bg-black/10 text-gray-500 font-mono">
          {shortcut}
        </kbd>
      )}
    </button>
  )
}

// ═══════════════════════════════════════════════════════════════
// Advanced Confirm Modal
// ═══════════════════════════════════════════════════════════════

interface ConfirmDialogProps {
  open: boolean
  onClose: () => void
  onConfirm: () => Promise<void> | void
  title: string
  message: string
  confirmLabel?: string
  cancelLabel?: string
  variant?: 'danger' | 'primary' | 'success'
  icon?: ReactNode
  details?: string
}

export function ConfirmDialog({
  open, onClose, onConfirm,
  title, message,
  confirmLabel = 'Confirm',
  cancelLabel = 'Cancel',
  variant = 'danger',
  icon,
  details,
}: ConfirmDialogProps) {
  const [loading, setLoading] = useState(false)
  const [success, setSuccess] = useState(false)
  const [error, setError] = useState(false)

  if (!open) return null

  const handleConfirm = async () => {
    setLoading(true)
    setError(false)
    try {
      await onConfirm()
      setSuccess(true)
      setTimeout(() => {
        setLoading(false)
        setSuccess(false)
        onClose()
      }, 800)
    } catch (error) {
      console.error('ConfirmDialog onConfirm error:', error)
      setError(true)
      setLoading(false)
      setTimeout(() => setError(false), 2000)
    }
  }

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/40 backdrop-blur-sm animate-fade-in" onClick={onClose}>
      <div className="bg-white rounded-lg shadow-modal border border-gray-100 w-full max-w-sm animate-scale-in" onClick={e => e.stopPropagation()}>
        <div className="p-5">
          <div className="flex items-center gap-3 mb-3">
            <div className={`w-10 h-10 rounded-lg flex items-center justify-center animate-bounce-in ${
              variant === 'danger' ? 'bg-red-50' : variant === 'success' ? 'bg-emerald-50' : 'bg-blue-50'
            }`}>
              {icon || (
                variant === 'danger'
                  ? <X size={18} className="text-red-500" />
                  : <Check size={18} className="text-emerald-500" />
              )}
            </div>
            <div>
              <h3 className="text-sm font-bold text-gray-900">{title}</h3>
              <p className="text-[12px] text-gray-500 mt-0.5">{message}</p>
            </div>
          </div>

          {details && (
            <div className="mb-3 p-2.5 bg-amber-50 rounded-lg border border-amber-100">
              <p className="text-[11px] text-amber-700">{details}</p>
            </div>
          )}

          {error && (
            <div className="mb-3 p-2.5 bg-red-50 rounded-lg border border-red-100 animate-shake">
              <p className="text-[11px] text-red-600 font-medium">Action failed. Please try again.</p>
            </div>
          )}

          {success && (
            <div className="mb-3 p-2.5 bg-emerald-50 rounded-lg border border-emerald-100 animate-pop-in">
              <p className="text-[11px] text-emerald-600 font-medium flex items-center gap-1">
                <Check size={13} /> Completed successfully!
              </p>
            </div>
          )}

          <div className="flex items-center gap-2 justify-end mt-4">
            <button
              onClick={onClose}
              disabled={loading || success}
              className="px-3 py-2 text-[11px] font-medium text-gray-600 border border-gray-200 rounded-lg hover:bg-gray-50 transition-colors disabled:opacity-50"
            >
              {cancelLabel}
            </button>
            <button
              onClick={handleConfirm}
              disabled={loading || success}
              className="px-3 py-2 text-[11px] font-semibold text-white rounded-lg transition-all duration-200 flex items-center gap-1.5 disabled:opacity-60 active:scale-[0.97]"
              style={{
                background: loading
                  ? '#6B7280'
                  : variant === 'danger'
                    ? '#DC2626'
                    : variant === 'success'
                      ? '#059669'
                      : '#1A5C7A'
              }}
            >
              {loading ? (
                <>
                  <Loader2 size={12} className="animate-spin" />
                  Processing...
                </>
              ) : success ? (
                <>
                  <Check size={12} />
                  Done!
                </>
              ) : confirmLabel}
            </button>
          </div>
        </div>
      </div>
    </div>
  )
}

// ═══════════════════════════════════════════════════════════════
// Action Menu (Dropdown)
// ═══════════════════════════════════════════════════════════════

interface ActionMenuItem {
  label: string
  icon?: ReactNode
  onClick: () => void | Promise<void>
  variant?: 'default' | 'danger'
  shortcut?: string
}

interface ActionMenuProps {
  items: ActionMenuItem[]
  align?: 'left' | 'right'
  trigger?: ReactNode
}

export function ActionMenu({ items, align = 'right', trigger }: ActionMenuProps) {
  const [open, setOpen] = useState(false)
  const [loadingId, setLoadingId] = useState<string | null>(null)

  const handleItemClick = async (item: ActionMenuItem, idx: number) => {
    setLoadingId(`item-${idx}`)
    setOpen(false)
    try {
      await item.onClick()
    } finally {
      setLoadingId(null)
    }
  }

  return (
    <div className="relative">
      <button
        onClick={() => setOpen(v => !v)}
        className="p-1.5 rounded-lg hover:bg-gray-100 text-gray-400 hover:text-gray-600 transition-all duration-200 active:scale-90"
      >
        {trigger || (
          <svg width="16" height="16" viewBox="0 0 16 16" fill="none">
            <circle cx="8" cy="3" r="1.5" fill="currentColor" />
            <circle cx="8" cy="8" r="1.5" fill="currentColor" />
            <circle cx="8" cy="13" r="1.5" fill="currentColor" />
          </svg>
        )}
      </button>

      {open && (
        <>
          <div className="fixed inset-0 z-40" onClick={() => setOpen(false)} />
          <div
            className={`absolute z-50 mt-1 w-44 bg-white rounded-lg shadow-popover border border-gray-100 py-1 animate-scale-in ${
              align === 'right' ? 'right-0' : 'left-0'
            }`}
          >
            {items.map((item, idx) => (
              <button
                key={idx}
                onClick={() => handleItemClick(item, idx)}
                disabled={loadingId === `item-${idx}`}
                className={`w-full flex items-center gap-2 px-3 py-2 text-[11px] transition-colors disabled:opacity-50 ${
                  item.variant === 'danger'
                    ? 'text-red-600 hover:bg-red-50'
                    : 'text-gray-600 hover:bg-gray-50'
                }`}
              >
                {loadingId === `item-${idx}` ? (
                  <Loader2 size={13} className="animate-spin shrink-0" />
                ) : (
                  item.icon
                )}
                <span className="flex-1 text-left">{item.label}</span>
                {item.shortcut && (
                  <kbd className="text-[8px] text-gray-300 font-mono">{item.shortcut}</kbd>
                )}
              </button>
            ))}
          </div>
        </>
      )}
    </div>
  )
}

// ═══════════════════════════════════════════════════════════════
// Advanced Export Button
// ═══════════════════════════════════════════════════════════════

export function ExportButton({ onExport, label = 'Export' }: {
  onExport?: () => Promise<void> | void
  label?: string
}) {
  const [state, setState] = useState<'idle' | 'loading' | 'done'>('idle')

  const handleExport = async () => {
    if (state === 'loading') return
    setState('loading')
    try {
      await onExport?.()
      // Simulated delay
      await new Promise(r => setTimeout(r, 600))
      setState('done')
      setTimeout(() => setState('idle'), 2000)
    } catch (error) {
      console.error('ExportButton onExport error:', error)
      setState('idle')
    }
  }

  return (
    <button
      onClick={handleExport}
      disabled={state === 'loading'}
      className="flex items-center gap-1.5 px-3 py-2 border border-gray-200 rounded-lg text-[11px] text-gray-500 hover:bg-gray-50 transition-all duration-200 active:scale-[0.97] disabled:opacity-60"
    >
      {state === 'loading' ? (
        <Loader2 size={13} className="animate-spin" />
      ) : state === 'done' ? (
        <Check size={13} className="text-emerald-500 animate-pop-in" />
      ) : (
        <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="shrink-0">
          <path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4" />
          <polyline points="7 10 12 15 17 10" />
          <line x1="12" y1="15" x2="12" y2="3" />
        </svg>
      )}
      {state === 'loading' ? 'Exporting...' : state === 'done' ? 'Exported!' : label}
    </button>
  )
}
