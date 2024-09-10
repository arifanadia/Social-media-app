import React from 'react'
import { Navigate, Outlet } from 'react-router-dom'

const AuthLayout = () => {
  const isAuthenticated = false
  return (
    <>
      {
        isAuthenticated ? (
          <Navigate to="/" />
        ) : (
          <>
            <section className='flex flex-1 justify-center flex-col items-center py-10'>
              <Outlet />
            </section>
          </>

        )
      }
    </>
  )
}

export default AuthLayout