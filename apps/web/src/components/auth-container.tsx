import  { PropsWithChildren } from 'react'
import useAuth from '../hooks/useAuth'
import { UserRole } from '@teamapp/api/schema'

function AuthContainer({requiredRole,children}: {requiredRole?:UserRole}&PropsWithChildren) {

  const { isAuthorized } = useAuth()

  if (requiredRole && !isAuthorized(requiredRole)) {
    return null
  }

  return (
    <>
    {children}
    </>
  )
}

export default AuthContainer  