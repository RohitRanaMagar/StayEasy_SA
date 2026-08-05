import { Navigate, useLocation } from 'react-router-dom'
import { useSuperAdminStore } from './superadmin/superAdminStore'

interface SuperAdminRouteProps {
  children: React.ReactNode
}

export function SuperAdminRoute({ children }: SuperAdminRouteProps) {
  const token = localStorage.getItem('superAdminToken') || sessionStorage.getItem('superAdminToken')
  const tempToken = localStorage.getItem('tempToken')|| sessionStorage.getItem('tempToken')
  const userType = localStorage.getItem('userType')|| sessionStorage.getItem('userType')
  const isProfileComplete = useSuperAdminStore(s => s.isProfileComplete)
  const location = useLocation()

  const isProfilePage = location.pathname === '/superadmin/profile'

  // If user has tempToken but no full token, force them to profile (but not if already there)
  if (tempToken && !token && !isProfilePage) {
    return <Navigate to="/superadmin/profile" replace />
  }

  // Allow profile page access with tempToken (before full auth)
  if (tempToken && !token && isProfilePage) {
    return <>{children}</>
  }

  // If no token at all, redirect to login
  if (!token || userType !== 'superadmin') {
    return <Navigate to="/superadmin/login" replace />
  }

  // If profile not complete and NOT on profile page, redirect to profile
  if (!isProfileComplete && !isProfilePage) {
    return <Navigate to="/superadmin/profile" replace />
  }

  return <>{children}</>
}
