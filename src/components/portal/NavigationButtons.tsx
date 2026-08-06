import { ArrowLeft, ArrowRight, Loader } from 'lucide-react'

interface NavigationButtonsProps {
  onBack?: () => void
  onNext?: () => void
  backLabel?: string
  nextLabel?: string
  loading?: boolean
}

export default function NavigationButtons({
  onBack, onNext,
  backLabel = 'Previous Step',
  nextLabel = 'Next Step',
  loading = false,
}: NavigationButtonsProps) {
  return (
    <div className="navigation-buttons">
      {onBack ? (
        <button onClick={onBack} disabled={loading} className="btn-back">
          <ArrowLeft size={16} /> {backLabel}
        </button>
      ) : <div />}

      <div className="navigation-buttons-right">
        {onNext && (
          <button onClick={onNext} disabled={loading} className="btn-next">
            {loading ? <Loader size={16} className="spin" /> : null}
            {loading ? 'Saving...' : nextLabel}
            {loading ? null : <ArrowRight size={16} />}
          </button>
        )}
      </div>
    </div>
  )
}
