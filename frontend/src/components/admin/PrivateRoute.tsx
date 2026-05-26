import { Navigate, Outlet } from 'react-router-dom'

interface PrivateRouteProps {
  children?: React.ReactNode
}

const PrivateRoute = ({ children }: PrivateRouteProps) => {
  const token = localStorage.getItem('admin_token')
  if (!token) return <Navigate to="/admin" replace />
  return children ? <>{children}</> : <Outlet />
}

export default PrivateRoute
