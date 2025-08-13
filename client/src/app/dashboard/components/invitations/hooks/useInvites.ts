import { useState, useCallback, useMemo } from 'react'
import { InviteCode, InviteFilters, UseInvitesReturn } from '../types'
import { mockInviteCodes } from '../mockData'
import { filterInvites, calculateInviteStats, generateId, generateInviteCode } from '../utils'

export const useInvites = (): UseInvitesReturn => {
  const [invites, setInvites] = useState<InviteCode[]>(mockInviteCodes)
  const [filters, setFiltersState] = useState<InviteFilters>({
    search: '',
    status: 'all',
    department: 'all',
    role: 'all',
    dateRange: 'all'
  })
  const [isLoading, setIsLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)

  // Memoized filtered invites
  const filteredInvites = useMemo(() => {
    return filterInvites(invites, filters)
  }, [invites, filters])

  // Memoized statistics
  const stats = useMemo(() => {
    return calculateInviteStats(invites)
  }, [invites])

  // Filter update handler
  const setFilters = useCallback((newFilters: Partial<InviteFilters>) => {
    setFiltersState(prev => ({ ...prev, ...newFilters }))
  }, [])

  // Create invite
  const createInvite = useCallback((newInvite: Omit<InviteCode, 'id' | 'createdAt' | 'code'>) => {
    try {
      setIsLoading(true)
      setError(null)
      
      const invite: InviteCode = {
        ...newInvite,
        id: generateId(),
        code: generateInviteCode(),
        createdAt: new Date().toISOString().split('T')[0],
        status: 'active'
      }
      
      setInvites(prev => [invite, ...prev])
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to create invite')
    } finally {
      setIsLoading(false)
    }
  }, [])

  // Revoke invite
  const revokeInvite = useCallback((id: string) => {
    try {
      setIsLoading(true)
      setError(null)
      
      setInvites(prev => 
        prev.map(invite => 
          invite.id === id 
            ? { ...invite, status: 'revoked' as const }
            : invite
        )
      )
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to revoke invite')
    } finally {
      setIsLoading(false)
    }
  }, [])

  // Resend invite
  const resendInvite = useCallback((id: string) => {
    try {
      setIsLoading(true)
      setError(null)
      
      // In a real app, this would trigger an email resend
      // For now, we'll just update the created date
      setInvites(prev => 
        prev.map(invite => 
          invite.id === id 
            ? { ...invite, createdAt: new Date().toISOString().split('T')[0] }
            : invite
        )
      )
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to resend invite')
    } finally {
      setIsLoading(false)
    }
  }, [])

  // Refresh invites (for future API integration)
  const refreshInvites = useCallback(async () => {
    try {
      setIsLoading(true)
      setError(null)
      
      // Future: API call to refresh data
      // const data = await fetchInvites()
      // setInvites(data)
      
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to refresh invites')
    } finally {
      setIsLoading(false)
    }
  }, [])

  return {
    invites,
    filteredInvites,
    stats,
    filters,
    isLoading,
    error,
    actions: {
      setFilters,
      createInvite,
      revokeInvite,
      resendInvite,
      refreshInvites
    }
  }
}
