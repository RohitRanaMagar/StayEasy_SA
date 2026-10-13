import { useCallback, useEffect, useState } from 'react'
import { Navigate } from 'react-router-dom'
import { Plus } from 'lucide-react'
import CreateTenantWizard from '../../components/CreateTenantWizard'
import { getAllProperties } from '../../services/pmsApi'
import type { GeneralInfoResponse } from '../../types/pms'

function hasStoredToken(): boolean {
  try {
    return Boolean(localStorage.getItem('token') || sessionStorage.getItem('token'))
  } catch {
    return false
  }
}

export default function MyPropertiesPage() {
  const [properties, setProperties] = useState<GeneralInfoResponse[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [wizardOpen, setWizardOpen] = useState(false)

  const fetchProperties = useCallback(async () => {
    if (!hasStoredToken()) {
      setLoading(false)
      return
    }
    setLoading(true)
    setError(null)
    try {
      const list = await getAllProperties()
      setProperties(list)
    } catch {
      setError('Could not load properties. Please try again.')
    } finally {
      setLoading(false)
    }
  }, [])

  useEffect(() => {
    fetchProperties()
  }, [fetchProperties])

  if (!hasStoredToken()) {
    return <Navigate to="/host/login" replace />
  }

  const handleCloseWizard = () => {
    setWizardOpen(false)
    fetchProperties()
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="mx-auto max-w-5xl px-4 py-8">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-2xl font-semibold text-gray-900">My Properties</h1>
            <p className="mt-1 text-sm text-gray-500">Manage your properties and create new ones.</p>
          </div>
          <button
            type="button"
            onClick={() => setWizardOpen(true)}
            className="inline-flex items-center gap-2 rounded-lg bg-blue-600 px-4 py-2 text-sm font-medium text-white hover:bg-blue-700 transition-colors"
          >
            <Plus size={16} />
            Create Property
          </button>
        </div>

        {loading ? (
          <div className="mt-8 flex items-center justify-center rounded-xl border border-gray-200 bg-white py-16">
            <div className="text-center">
              <div className="mx-auto mb-3 h-6 w-6 animate-spin rounded-full border-2 border-gray-200 border-t-blue-600" />
              <p className="text-sm text-gray-500">Loading properties...</p>
            </div>
          </div>
        ) : error ? (
          <div className="mt-8 rounded-xl border border-red-200 bg-red-50 px-4 py-6 text-center">
            <p className="text-sm text-red-700">{error}</p>
            <button
              type="button"
              onClick={fetchProperties}
              className="mt-3 rounded-lg border border-red-200 bg-white px-4 py-2 text-sm font-medium text-red-700 hover:bg-red-100 transition-colors"
            >
              Try again
            </button>
          </div>
        ) : properties.length === 0 ? (
          <div className="mt-8 rounded-xl border border-gray-200 bg-white px-4 py-16 text-center">
            <p className="text-sm font-medium text-gray-900">No properties yet</p>
            <p className="mt-1 text-sm text-gray-500">Create your first property to get started.</p>
            <button
              type="button"
              onClick={() => setWizardOpen(true)}
              className="mt-4 inline-flex items-center gap-2 rounded-lg bg-blue-600 px-4 py-2 text-sm font-medium text-white hover:bg-blue-700 transition-colors"
            >
              <Plus size={16} />
              Create Property
            </button>
          </div>
        ) : (
          <div className="mt-8 grid gap-4 sm:grid-cols-2">
            {properties.map((property) => (
              <div key={property.id} className="rounded-xl border border-gray-200 bg-white p-5 shadow-sm">
                <div className="flex items-start justify-between gap-3">
                  <div>
                    <h2 className="text-base font-semibold text-gray-900">{property.name}</h2>
                    {property.type && (
                      <span className="mt-1 inline-block rounded-full bg-blue-50 px-2.5 py-0.5 text-xs font-medium text-blue-700">
                        {property.type}
                      </span>
                    )}
                  </div>
                </div>
                {property.description && (
                  <p className="mt-2 line-clamp-2 text-sm text-gray-500">{property.description}</p>
                )}
                <div className="mt-3 flex items-center gap-4 text-xs text-gray-500">
                  <span>{property.total_rooms} rooms</span>
                  {property.email && <span>{property.email}</span>}
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      <CreateTenantWizard open={wizardOpen} onClose={handleCloseWizard} />
    </div>
  )
}
