import { Link, useNavigate, useLocation } from 'react-router-dom'
import { useState, useRef, useEffect } from 'react'
import { useSelector, useDispatch } from 'react-redux'
import { logout } from '../../store/slices/authSlice'
import { authService } from '../../services/authService'
import Button from '../common/Button'
import { Search, Home, Compass, List, User, Settings, LogOut, Menu, X } from 'lucide-react'
import * as Dialog from '@radix-ui/react-dialog'
import { gsap } from 'gsap'
import { ScrollTrigger } from 'gsap/ScrollTrigger'
import { useGSAP } from '@gsap/react'

gsap.registerPlugin(ScrollTrigger)

const Header = () => {
  const navigate = useNavigate()
  const location = useLocation()
  const dispatch = useDispatch()
  const { isAuthenticated, user } = useSelector((state) => state.auth)
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false)

  const headerRef = useRef(null)
  const containerRef = useRef(null)
  const logoTextRef = useRef(null)

  useGSAP(() => {
    // ScrollTrigger Animation
    const tl = gsap.timeline({
      scrollTrigger: {
        trigger: document.body, // Track the whole page scroll
        start: 'top top',
        end: '+=300', // Animate over 300px of scrolling for smoother feel
        scrub: 1, // Softer scrub
      }
    })

    // Animate Container
    tl.fromTo(containerRef.current,
      {
        width: '100%',
        borderRadius: '0px',
        maxWidth: '100%',
        backgroundColor: 'rgba(0, 0, 0, 0)',
        border: '1px solid rgba(255, 255, 255, 0)',
        paddingLeft: '2rem', // px-8 = 2rem
        paddingRight: '2rem'
      },
      {
        width: '85%', // Slightly wider than 70% for better tablet look
        maxWidth: '60rem', // max-w-5xl
        borderRadius: '9999px',
        backgroundColor: 'rgba(0, 0, 0, 0.85)',
        backdropFilter: 'blur(20px)',
        boxShadow: '0 25px 50px -12px rgba(0, 0, 0, 0.5)',
        border: '1px solid rgba(255, 255, 255, 0.05)', // Subtle border for definition
        height: '4rem',
        paddingLeft: '1.5rem',
        paddingRight: '1.5rem',
        // margins handled by parent flex container
        transformOrigin: 'center top',
        ease: 'power2.out' // Smoother ease
      }, 0)

    // Animate Header Wrapper Spacing
    tl.fromTo(headerRef.current,
      {
        paddingTop: '0rem',
        paddingBottom: '0rem',
      },
      {
        paddingTop: '1.5rem', // More top spacing when scrolled
        paddingBottom: '0.5rem',
        backgroundColor: 'transparent',
        ease: 'power2.out'
      }, 0)

    // Animate Logo Text - Smooth fade out
    tl.to(logoTextRef.current, {
      width: 0,
      opacity: 0,
      paddingLeft: 0,
      margin: 0,
      duration: 0.2,
    }, 0)

  }, [])

  const handleLogout = async () => {
    try {
      await authService.logout()
    } catch (error) {
      console.error('Logout error:', error)
    } finally {
      dispatch(logout())
      localStorage.removeItem('user')
      localStorage.removeItem('token')
      navigate('/')
    }
  }

  const isActive = (path) => location.pathname === path

  const NavLink = ({ to, icon: Icon, label }) => (
    <Link
      to={to}
      className={`flex items-center space-x-2 px-4 py-2 transition-all duration-300 rounded-full ${isActive(to)
        ? 'bg-primary/20 text-primary font-medium'
        : 'text-muted-foreground hover:text-foreground hover:bg-white/5'
        }`}
    >
      <Icon className="h-4 w-4" />
      <span>{label}</span>
    </Link>
  )

  return (
    <>
      <header ref={headerRef} className="fixed top-0 left-0 right-0 z-[99999] flex justify-center py-0 transition-none">
        <div
          ref={containerRef}
          className="flex items-center justify-between px-4 sm:px-6 md:px-8 w-full h-16 sm:h-20 md:h-24 bg-transparent transition-none mx-auto"
        >
          {/* Logo */}
          <div className="flex items-center justify-start shrink-0">
            <Link to="/" className="flex items-center space-x-2 group" onClick={() => setMobileMenuOpen(false)}>
              <div className="h-7 w-7 sm:h-8 sm:w-8 bg-primary flex items-center justify-center transform group-hover:rotate-12 transition-transform duration-300 rounded-lg sm:rounded-xl">
                <span className="text-black font-bold text-lg sm:text-xl">M</span>
              </div>
              <div ref={logoTextRef} className="overflow-hidden whitespace-nowrap hidden sm:block">
                <span className="text-lg sm:text-xl font-bold bg-clip-text text-transparent bg-gradient-to-r from-white to-white/60 ml-2">
                  Movieo
                </span>
              </div>
            </Link>
          </div>

          {/* Desktop Navigation - Hidden on mobile/tablet */}
          <nav className="hidden lg:flex items-center p-1.5 bg-transparent justify-center space-x-1 flex-1">
            <NavLink to="/" icon={Home} label="Home" />

            {/* Explore Dropdown */}
            <div className="relative group">
              <button className="flex items-center space-x-2 px-4 py-2 text-muted-foreground hover:text-foreground hover:bg-white/5 rounded-full transition-all duration-300">
                <Compass className="h-4 w-4" />
                <span>Explore</span>
              </button>

              {/* Dropdown Content */}
              <div className="absolute top-full left-1/2 -translate-x-1/2 pt-2 opacity-0 invisible group-hover:opacity-100 group-hover:visible transition-all duration-300 transform group-hover:translate-y-0 translate-y-2 w-48">
                <div className="bg-black/90 backdrop-blur-xl border border-white/10 rounded-xl overflow-hidden shadow-2xl p-1">
                  <Link to="/explore/movie" className="block px-4 py-2.5 text-sm text-zinc-400 hover:text-white hover:bg-white/10 rounded-lg transition-colors">
                    Movies
                  </Link>
                  <Link to="/explore/tv" className="block px-4 py-2.5 text-sm text-zinc-400 hover:text-white hover:bg-white/10 rounded-lg transition-colors">
                    TV Shows
                  </Link>
                  <Link to="/explore/anime" className="block px-4 py-2.5 text-sm text-zinc-400 hover:text-white hover:bg-white/10 rounded-lg transition-colors">
                    Anime
                  </Link>
                  <Link to="/explore/manga" className="block px-4 py-2.5 text-sm text-zinc-400 hover:text-white hover:bg-white/10 rounded-lg transition-colors">
                    Manga & Manhwa
                  </Link>
                </div>
              </div>
            </div>

            <NavLink to="/search" icon={Search} label="Search" />
          </nav>

          {/* Desktop Right Actions - Hidden on mobile/tablet */}
          <div className="hidden lg:flex items-center justify-end space-x-4 shrink-0">
            {isAuthenticated ? (
              <div className="flex items-center space-x-3 bg-white/5 p-1 px-2 border border-white/10 rounded-full">
                <Link to={`/profile/${user?.id || user?._id}`} className="flex items-center space-x-2 px-2">
                  <div className="h-8 w-8 overflow-hidden border border-white/20 relative rounded-full">
                    {user?.avatar ? (
                      <img
                        src={user.avatar.startsWith('http') ? user.avatar : `http://localhost:5000${user.avatar}`}
                        alt={user.username}
                        className="w-full h-full object-cover"
                      />
                    ) : (
                      <div className="w-full h-full bg-gradient-to-br from-primary to-purple-600 flex items-center justify-center text-black text-xs font-bold">
                        {user?.username?.[0]?.toUpperCase() || 'U'}
                      </div>
                    )}
                  </div>
                  <span className="text-sm font-medium text-zinc-200">
                    {user?.username}
                  </span>
                </Link>
                <div className="h-6 w-px bg-white/10"></div>
                <div className="flex items-center space-x-1 pr-1">
                  <Link to="/library" className="p-2 hover:bg-white/10 text-muted-foreground hover:text-primary transition-colors">
                    <List className="h-4 w-4" />
                  </Link>
                  <Link to="/settings" className="p-2 hover:bg-white/10 text-muted-foreground hover:text-white transition-colors">
                    <Settings className="h-4 w-4" />
                  </Link>
                  <button onClick={handleLogout} className="p-2 hover:bg-red-500/10 text-muted-foreground hover:text-red-500 transition-colors">
                    <LogOut className="h-4 w-4" />
                  </button>
                </div>
              </div>
            ) : (
              <>
                <Button variant="ghost" onClick={() => navigate('/login')} className="hover:text-white">
                  Log In
                </Button>
                <Button onClick={() => navigate('/register')} className="bg-primary hover:bg-primary/90 text-black font-bold px-6 shadow-lg shadow-primary/25">
                  Sign Up
                </Button>
              </>
            )}
          </div>

          {/* Mobile/Tablet Hamburger Menu Button */}
          <Dialog.Root open={mobileMenuOpen} onOpenChange={setMobileMenuOpen}>
            <Dialog.Trigger asChild>
              <button className="lg:hidden p-2 text-white hover:bg-white/10 rounded-lg transition-colors">
                <Menu className="h-6 w-6" />
                <span className="sr-only">Open menu</span>
              </button>
            </Dialog.Trigger>
            <Dialog.Portal>
              <Dialog.Overlay className="fixed inset-0 z-[100000] bg-black/80 backdrop-blur-sm" />
              <Dialog.Content className="fixed top-0 right-0 z-[100001] h-full w-[280px] sm:w-[320px] bg-zinc-900/95 backdrop-blur-xl border-l border-white/10 shadow-2xl p-6 overflow-y-auto">
                <div className="flex items-center justify-between mb-8">
                  <h2 className="text-xl font-bold text-white">Menu</h2>
                  <Dialog.Close asChild>
                    <button className="p-2 text-white hover:bg-white/10 rounded-lg transition-colors">
                      <X className="h-6 w-6" />
                      <span className="sr-only">Close menu</span>
                    </button>
                  </Dialog.Close>
                </div>
                
                <nav className="space-y-2">
                  <Link
                    to="/"
                    onClick={() => setMobileMenuOpen(false)}
                    className={`flex items-center gap-3 px-4 py-3 rounded-lg transition-colors ${
                      isActive('/') ? 'bg-primary/20 text-primary' : 'text-zinc-300 hover:bg-white/10 hover:text-white'
                    }`}
                  >
                    <Home className="h-5 w-5" />
                    <span className="font-medium">Home</span>
                  </Link>

                  <div className="space-y-1">
                    <div className="flex items-center gap-3 px-4 py-3 text-zinc-300">
                      <Compass className="h-5 w-5" />
                      <span className="font-medium">Explore</span>
                    </div>
                    <div className="pl-11 space-y-1">
                      <Link
                        to="/explore/movie"
                        onClick={() => setMobileMenuOpen(false)}
                        className="block px-4 py-2 text-sm text-zinc-400 hover:text-white hover:bg-white/5 rounded-lg transition-colors"
                      >
                        Movies
                      </Link>
                      <Link
                        to="/explore/tv"
                        onClick={() => setMobileMenuOpen(false)}
                        className="block px-4 py-2 text-sm text-zinc-400 hover:text-white hover:bg-white/5 rounded-lg transition-colors"
                      >
                        TV Shows
                      </Link>
                      <Link
                        to="/explore/anime"
                        onClick={() => setMobileMenuOpen(false)}
                        className="block px-4 py-2 text-sm text-zinc-400 hover:text-white hover:bg-white/5 rounded-lg transition-colors"
                      >
                        Anime
                      </Link>
                      <Link
                        to="/explore/manga"
                        onClick={() => setMobileMenuOpen(false)}
                        className="block px-4 py-2 text-sm text-zinc-400 hover:text-white hover:bg-white/5 rounded-lg transition-colors"
                      >
                        Manga & Manhwa
                      </Link>
                    </div>
                  </div>

                  <Link
                    to="/search"
                    onClick={() => setMobileMenuOpen(false)}
                    className={`flex items-center gap-3 px-4 py-3 rounded-lg transition-colors ${
                      isActive('/search') ? 'bg-primary/20 text-primary' : 'text-zinc-300 hover:bg-white/10 hover:text-white'
                    }`}
                  >
                    <Search className="h-5 w-5" />
                    <span className="font-medium">Search</span>
                  </Link>

                  {isAuthenticated ? (
                    <>
                      <div className="border-t border-white/10 my-4"></div>
                      <Link
                        to={`/profile/${user?.id || user?._id}`}
                        onClick={() => setMobileMenuOpen(false)}
                        className={`flex items-center gap-3 px-4 py-3 rounded-lg transition-colors ${
                          isActive(`/profile/${user?.id || user?._id}`) ? 'bg-primary/20 text-primary' : 'text-zinc-300 hover:bg-white/10 hover:text-white'
                        }`}
                      >
                        <User className="h-5 w-5" />
                        <span className="font-medium">Profile</span>
                      </Link>
                      <Link
                        to="/library"
                        onClick={() => setMobileMenuOpen(false)}
                        className={`flex items-center gap-3 px-4 py-3 rounded-lg transition-colors ${
                          isActive('/library') ? 'bg-primary/20 text-primary' : 'text-zinc-300 hover:bg-white/10 hover:text-white'
                        }`}
                      >
                        <List className="h-5 w-5" />
                        <span className="font-medium">Library</span>
                      </Link>
                      <Link
                        to="/settings"
                        onClick={() => setMobileMenuOpen(false)}
                        className={`flex items-center gap-3 px-4 py-3 rounded-lg transition-colors ${
                          isActive('/settings') ? 'bg-primary/20 text-primary' : 'text-zinc-300 hover:bg-white/10 hover:text-white'
                        }`}
                      >
                        <Settings className="h-5 w-5" />
                        <span className="font-medium">Settings</span>
                      </Link>
                      <button
                        onClick={() => {
                          setMobileMenuOpen(false)
                          handleLogout()
                        }}
                        className="w-full flex items-center gap-3 px-4 py-3 rounded-lg text-red-400 hover:bg-red-500/10 hover:text-red-300 transition-colors"
                      >
                        <LogOut className="h-5 w-5" />
                        <span className="font-medium">Logout</span>
                      </button>
                    </>
                  ) : (
                    <>
                      <div className="border-t border-white/10 my-4"></div>
                      <Button
                        variant="ghost"
                        onClick={() => {
                          setMobileMenuOpen(false)
                          navigate('/login')
                        }}
                        className="w-full justify-start hover:text-white"
                      >
                        Log In
                      </Button>
                      <Button
                        onClick={() => {
                          setMobileMenuOpen(false)
                          navigate('/register')
                        }}
                        className="w-full bg-primary hover:bg-primary/90 text-black font-bold"
                      >
                        Sign Up
                      </Button>
                    </>
                  )}
                </nav>
              </Dialog.Content>
            </Dialog.Portal>
          </Dialog.Root>
        </div>
      </header>
    </>
  )
}

export default Header


