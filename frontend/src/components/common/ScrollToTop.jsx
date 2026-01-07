import { useEffect } from 'react'
import { useLocation } from 'react-router-dom'

const ScrollToTop = () => {
    const { pathname } = useLocation()

    useEffect(() => {
        window.scrollTo({ top: 0, left: 0, behavior: 'auto' })
    }, [pathname])

    // Also handle any direct navigation clicks
    useEffect(() => {
        const handleClick = (e) => {
            // Check if it's a Link or navigation element
            const link = e.target.closest('a[href]')
            if (link && link.getAttribute('href')?.startsWith('/')) {
                // Small delay to ensure route change happens first
                setTimeout(() => {
                    window.scrollTo({ top: 0, left: 0, behavior: 'auto' })
                }, 100)
            }
        }

        document.addEventListener('click', handleClick)
        return () => document.removeEventListener('click', handleClick)
    }, [])

    return null
}

export default ScrollToTop
