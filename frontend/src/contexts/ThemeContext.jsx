import { createContext, useContext } from 'react'

const ThemeContext = createContext()

export const ThemeProvider = ({ children }) => {
  // Dark mode only - no light mode toggle needed
  return <ThemeContext.Provider value={{ theme: 'dark' }}>{children}</ThemeContext.Provider>
}

export const useTheme = () => useContext(ThemeContext)


