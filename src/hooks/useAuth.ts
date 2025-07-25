import { useState, useEffect } from 'react'
import { User, AuthState } from '../types'
import { mockStaff } from '../lib/mockData'

export const useAuth = () => {
  const [authState, setAuthState] = useState<AuthState>({
    user: null,
    isLoading: true,
    isAuthenticated: false
  })

  useEffect(() => {
    const savedUser = localStorage.getItem('repotomo_user')
    if (savedUser) {
      const user = JSON.parse(savedUser)
      setAuthState({
        user,
        isLoading: false,
        isAuthenticated: true
      })
    } else {
      setAuthState(prev => ({ ...prev, isLoading: false }))
    }
  }, [])

  const login = async (email: string, password: string) => {
    setAuthState(prev => ({ ...prev, isLoading: true }))
    
    await new Promise(resolve => setTimeout(resolve, 1000))
    
    let staff
    if (email.includes('admin') || email.includes('manager')) {
      staff = mockStaff.find(s => s.role === 'MANAGER')
    } else {
      staff = mockStaff.find(s => s.role === 'STAFF')
    }
    
    const user: User = {
      id: staff?.id || '1',
      email,
      staff
    }
    
    localStorage.setItem('repotomo_user', JSON.stringify(user))
    setAuthState({
      user,
      isLoading: false,
      isAuthenticated: true
    })
  }

  const loginAsStaff = async (staffId: string) => {
    const staff = mockStaff.find(s => s.id === staffId)
    if (staff) {
      const user: User = {
        id: staff.id,
        email: `${staff.staff_id}@demo.com`,
        staff
      }
      
      localStorage.setItem('repotomo_user', JSON.stringify(user))
      setAuthState({
        user,
        isLoading: false,
        isAuthenticated: true
      })
    }
  }

  const logout = async () => {
    localStorage.removeItem('repotomo_user')
    setAuthState({
      user: null,
      isLoading: false,
      isAuthenticated: false
    })
  }

  return {
    ...authState,
    login,
    logout,
    loginAsStaff
  }
}