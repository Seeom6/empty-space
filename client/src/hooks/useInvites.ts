import { useState, useEffect, useCallback } from 'react'
import { InviteCode } from '@/app/dashboard/components/invitations/types'
import { inviteApi } from '@/lib/api/invites'

interface UseInvitesParams {
  search?: string
  status?: string
  department_id?: string
  page?: number
  limit?: number
}

interface UseInvitesReturn {
  invites: InviteCode[]
  loading: boolean
  error: string | null
  total: number
  page: number
  limit: number
  stats: {
    total: number
    active: number
    used: number
    expired: number
    revoked: number
  } | null
  refetch: () => Promise<void>
  createInvite: (data: any) => Promise<void>
  revokeInvite: (code: string) => Promise<void>
}

export function useInvites(params: UseInvitesParams = {}): UseInvitesReturn {
  const [invites, setInvites] = useState<InviteCode[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [total, setTotal] = useState(0)
  const [page, setPage] = useState(params.page || 1)
  const [limit, setLimit] = useState(params.limit || 10)
  const [stats, setStats] = useState<any>(null)

  const fetchInvites = useCallback(async () => {
    try {
      setLoading(true)
      setError(null)
      
      const [invitesData, statsData] = await Promise.all([
        inviteApi.getInvites(params),
        inviteApi.getInviteStats()
      ])
      
      setInvites(invitesData.invites)
      setTotal(invitesData.total)
      setPage(invitesData.page)
      setLimit(invitesData.limit)
      setStats(statsData.data)
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to fetch invites')
      console.error('Error fetching invites:', err)
    } finally {
      setLoading(false)
    }
  }, [params])

  const createInvite = useCallback(async (data: any) => {
    try {
      setError(null)
      await inviteApi.createInvite(data)
      await fetchInvites() // Refresh the list
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to create invite')
      throw err
    }
  }, [fetchInvites])

  const revokeInvite = useCallback(async (code: string) => {
    try {
      setError(null)
      await inviteApi.revokeInvite(code)
      await fetchInvites() // Refresh the list
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to revoke invite')
      throw err
    }
  }, [fetchInvites])

  useEffect(() => {
    fetchInvites()
  }, [fetchInvites])

  return {
    invites,
    loading,
    error,
    total,
    page,
    limit,
    stats,
    refetch: fetchInvites,
    createInvite,
    revokeInvite
  }
}
