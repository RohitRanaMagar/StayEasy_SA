import { X } from 'lucide-react'
import HostPortalPageNew from '../pages/HostPortalPageNew'

interface CreateTenantWizardProps {
  open: boolean
  onClose: () => void
}

export default function CreateTenantWizard({ open, onClose }: CreateTenantWizardProps) {
  if (!open) return null

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50" onClick={onClose}>
      <div
        className="relative bg-white rounded-2xl shadow-2xl w-full max-w-4xl max-h-[90vh] flex flex-col animate-in zoom-in-95 fade-in duration-200"
        onClick={e => e.stopPropagation()}
      >
        <div className="flex items-center justify-between px-6 py-4 border-b border-gray-200">
          <div>
            <h2 className="text-lg font-semibold text-gray-900">Create New Tenant</h2>
            <p className="text-xs text-gray-500">Set up a new property with the onboarding wizard</p>
          </div>
          <button
            onClick={onClose}
            className="p-2 rounded-lg hover:bg-gray-100 transition-colors"
            aria-label="Close wizard"
          >
            <X size={18} className="text-gray-500" />
          </button>
        </div>
        <div className="flex-1 overflow-y-auto">
          <HostPortalPageNew />
        </div>
      </div>
    </div>
  )
}
