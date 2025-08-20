import { useEffect } from 'react'
import { useDispatch, useSelector } from 'react-redux'
import { getMe } from '../store/authSlice'
import { selectCurrentToken, selectCurrentUser } from '../store/authSlice'

const AuthInit = ({ children }) => {
  const dispatch = useDispatch()
  const token = useSelector(selectCurrentToken)
  const user = useSelector(selectCurrentUser)

  useEffect(() => {
    // Nếu có token nhưng chưa có thông tin user, gọi getMe
    if (token && !user) {
      dispatch(getMe())
    }
  }, [dispatch, token, user])

  return children
}

export default AuthInit
