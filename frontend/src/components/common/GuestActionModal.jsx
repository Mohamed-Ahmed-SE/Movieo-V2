import { useDispatch } from 'react-redux'
import { useNavigate } from 'react-router-dom'
import { closeModal } from '../../store/slices/uiSlice'
import Modal from './Modal'
import Button from './Button'

const GuestActionModal = ({ open, onOpenChange, action = 'perform this action' }) => {
  const dispatch = useDispatch()
  const navigate = useNavigate()

  const handleClose = () => {
    dispatch(closeModal({ modalName: 'guestAction' }))
    if (onOpenChange) onOpenChange(false)
  }

  const handleSignUp = () => {
    handleClose()
    navigate('/register')
  }

  const handleLogin = () => {
    handleClose()
    navigate('/login')
  }

  return (
    <Modal
      open={open}
      onOpenChange={handleClose}
      title="Sign In Required"
      className="max-w-md"
    >
      <div className="space-y-4">
        <p className="text-muted-foreground">
          You need to be signed in to {action}. Create an account to track your progress,
          build watchlists, rate content, and customize your experience.
        </p>
        <div className="flex flex-col sm:flex-row gap-3">
          <Button onClick={handleSignUp} className="flex-1">
            Sign Up
          </Button>
          <Button onClick={handleLogin} variant="outline" className="flex-1">
            Log In
          </Button>
        </div>
      </div>
    </Modal>
  )
}

export default GuestActionModal


