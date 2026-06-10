import { createContext, useContext, useMemo } from 'react'
import { DEFAULT_DATA } from './data'

const DataContext = createContext(DEFAULT_DATA)

/**
 * Provides the 8M dataset to the component tree.
 * Host apps can inject their own content via `data` — a shallow merge
 * over DEFAULT_DATA, so any subset of keys can be overridden.
 */
export function DataProvider({ data, children }) {
  const value = useMemo(
    () => (data ? { ...DEFAULT_DATA, ...data } : DEFAULT_DATA),
    [data],
  )
  return <DataContext.Provider value={value}>{children}</DataContext.Provider>
}

/** Read the active 8M dataset. */
export function useData() {
  return useContext(DataContext)
}
