import Header from './Header'
import Footer from './Footer'
import GuestActionModal from '../common/GuestActionModal'
import { useSelector } from 'react-redux'

const Layout = ({ children }) => {
  const guestActionModalOpen = useSelector((state) => state.ui.modals.guestAction)
  const { isAuthenticated } = useSelector((state) => state.auth)

  return (
    <div className="min-h-screen flex flex-col">
      {isAuthenticated && <Header />}
      <main className="flex-1">{children}</main>
      <Footer />
      <GuestActionModal open={guestActionModalOpen} />
    </div>
  )
}

export default Layout


