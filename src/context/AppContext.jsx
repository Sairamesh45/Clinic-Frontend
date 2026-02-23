import { createContext, useMemo, useState } from 'react'

export const AppContext = createContext(null)

export function AppProvider({ children }) {
  const [activeSection, setActiveSection] = useState('Dashboard')
  const [viewDate] = useState(() => new Date())

  const value = useMemo(
    () => ({
      activeSection,
      setActiveSection,
      viewDate,
    }),
    [activeSection, viewDate],
  )

  return <AppContext.Provider value={value}>{children}</AppContext.Provider>
}
