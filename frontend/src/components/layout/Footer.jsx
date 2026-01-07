import { Link } from 'react-router-dom'
import { Github, Twitter, Mail } from 'lucide-react'

const Footer = () => {
  return (
    <footer className="border-t border-white/5 bg-black/40 backdrop-blur-xl mt-auto pt-16 pb-8">
      <div className="container mx-auto px-6">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-12 mb-12">
          {/* Brand Column */}
          <div className="space-y-4">
            <Link to="/" className="flex items-center space-x-2">
              <span className="text-2xl font-bold bg-clip-text text-transparent bg-gradient-to-r from-white to-white/60">
                Movieo
              </span>
            </Link>
            <p className="text-zinc-400 text-sm leading-relaxed">
              Your ultimate tracking companion for Movies, TV Shows, Anime, and Manga. Discover new worlds today.
            </p>
            <div className="flex space-x-4">
              <a href="#" className="text-zinc-400 hover:text-white transition-colors"><Github className="h-5 w-5" /></a>
              <a href="#" className="text-zinc-400 hover:text-white transition-colors"><Twitter className="h-5 w-5" /></a>
              <a href="#" className="text-zinc-400 hover:text-white transition-colors"><Mail className="h-5 w-5" /></a>
            </div>
          </div>

          {/* Quick Links */}
          <div>
            <h3 className="text-white font-semibold mb-6">Discovery</h3>
            <ul className="space-y-4 text-sm text-zinc-400">
              <li><Link to="/" className="hover:text-primary transition-colors">Trending Now</Link></li>
              <li><Link to="/explore?type=movie" className="hover:text-primary transition-colors">Movies</Link></li>
              <li><Link to="/explore?type=tv" className="hover:text-primary transition-colors">TV Series</Link></li>
              <li><Link to="/explore?type=anime" className="hover:text-primary transition-colors">Anime</Link></li>
            </ul>
          </div>

          {/* Community */}
          <div>
            <h3 className="text-white font-semibold mb-6">Community</h3>
            <ul className="space-y-4 text-sm text-zinc-400">
              <li><Link to="/register" className="hover:text-primary transition-colors">Join For Free</Link></li>
              <li><Link to="/login" className="hover:text-primary transition-colors">Sign In</Link></li>
              <li><a href="#" className="hover:text-primary transition-colors">Discord Server</a></li>
              <li><a href="#" className="hover:text-primary transition-colors">Help Center</a></li>
            </ul>
          </div>

          {/* Legal */}
          <div>
            <h3 className="text-white font-semibold mb-6">Legal</h3>
            <ul className="space-y-4 text-sm text-zinc-400">
              <li><a href="#" className="hover:text-primary transition-colors">Terms of Service</a></li>
              <li><a href="#" className="hover:text-primary transition-colors">Privacy Policy</a></li>
              <li><a href="#" className="hover:text-primary transition-colors">Cookie Policy</a></li>
              <li><a href="#" className="hover:text-primary transition-colors">DMCA</a></li>
            </ul>
          </div>
        </div>

        <div className="border-t border-white/5 pt-8 flex flex-col md:flex-row justify-between items-center space-y-4 md:space-y-0 text-xs text-zinc-500">
          <p>© {new Date().getFullYear()} Movieo. All rights reserved.</p>
          <div className="flex space-x-6">
            <span>Made with ❤️ for cinema lovers</span>
          </div>
        </div>
      </div>
    </footer>
  )
}

export default Footer


