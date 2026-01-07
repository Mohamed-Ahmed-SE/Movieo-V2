import { createContext, useContext } from 'react'
import { useSelector, useDispatch } from 'react-redux'
import { openModal, closeModal } from '../store/slices/uiSlice'

const ModalContext = createContext()

export const ModalProvider = ({ children }) => {
  return <ModalContext.Provider value={{}}>{children}</ModalContext.Provider>
}

export const useModal = () => {
  const dispatch = useDispatch()
  const modals = useSelector((state) => state.ui.modals)

  return {
    modals,
    openModal: (modalName) => dispatch(openModal({ modalName })),
    closeModal: (modalName) => dispatch(closeModal({ modalName })),
  }
}


