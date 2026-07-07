import { Navigate, Outlet } from 'react-router-dom'

interface PrivateRouteProps {
  children?: React.ReactNode
}

function isTokenExpired(token: string): boolean {
  try {
    const payload = JSON.parse(atob(token.split('.')[1].replace(/-/g, '+').replace(/_/g, '/')))
    return typeof payload.exp !== 'number' || payload.exp * 1000 <= Date.now()
  } catch {
    return true
  }
}

const PrivateRoute = ({ children }: PrivateRouteProps) => {
  const token = localStorage.getItem('admin_token')
  if (!token || isTokenExpired(token)) {
    localStorage.removeItem('admin_token')
    return <Navigate to="/admin" replace />
  }
  return children ? <>{children}</> : <Outlet />
}

export default PrivateRoute
