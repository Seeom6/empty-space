import { useState, useEffect, useCallback } from 'react'
import { debounce } from '../utils'
import { SEARCH_CONFIG } from '../constants'

interface UseSearchReturn {
  searchTerm: string
  debouncedSearchTerm: string
  setSearchTerm: (term: string) => void
  clearSearch: () => void
  isSearching: boolean
}

export const useSearch = (initialValue: string = ''): UseSearchReturn => {
  const [searchTerm, setSearchTermState] = useState(initialValue)
  const [debouncedSearchTerm, setDebouncedSearchTerm] = useState(initialValue)
  const [isSearching, setIsSearching] = useState(false)

  // Debounced search term update
  const debouncedUpdate = useCallback(
    debounce((term: string) => {
      setDebouncedSearchTerm(term)
      setIsSearching(false)
    }, SEARCH_CONFIG.debounceMs),
    []
  )

  // Update search term
  const setSearchTerm = useCallback((term: string) => {
    setSearchTermState(term)
    setIsSearching(term.length >= SEARCH_CONFIG.minSearchLength)
    debouncedUpdate(term)
  }, [debouncedUpdate])

  // Clear search
  const clearSearch = useCallback(() => {
    setSearchTermState('')
    setDebouncedSearchTerm('')
    setIsSearching(false)
  }, [])

  // Initialize debounced term
  useEffect(() => {
    if (initialValue) {
      debouncedUpdate(initialValue)
    }
  }, [initialValue, debouncedUpdate])

  return {
    searchTerm,
    debouncedSearchTerm,
    setSearchTerm,
    clearSearch,
    isSearching
  }
}
