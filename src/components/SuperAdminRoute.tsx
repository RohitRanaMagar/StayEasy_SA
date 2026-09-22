import { Navigate } from 'react-router-dom'

interface SuperAdminRouteProps {
  children: React.ReactNode
}

export function SuperAdminRoute({ children }: SuperAdminRouteProps) {
  const token = localStorage.getItem('superAdminToken') || sessionStorage.getItem('superAdminToken')
  const userType = localStorage.getItem('userType') || sessionStorage.getItem('userType')

  if (!token || userType !== 'superadmin') {
    return <Navigate to="/superadmin/login" replace />
  }

  return <>{children}</>
}
