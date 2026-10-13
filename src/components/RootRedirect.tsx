import { Navigate } from 'react-router-dom'

function storedValue(key: string): string | null {
  return localStorage.getItem(key) ?? sessionStorage.getItem(key)
}

export default function RootRedirect() {
  const token = storedValue('token')
  const userType = storedValue('userType')

  if (token && userType === 'superadmin') {
    return <Navigate to="/superadmin" replace />
  }
  if (token) {
    return <Navigate to="/host/my-properties" replace />
  }
  return <Navigate to="/login" replace />
}
