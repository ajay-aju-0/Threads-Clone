import React, { useState } from 'react'
import SignupCard from '../components/SignupCard'
import { useRecoilValue } from 'recoil'
import authScreenAtom from '../atoms/authAtom'
import LoginCard from '../components/LoginCard'

const AuthPage = () => {
    const authScreenState = useRecoilValue(authScreenAtom);
    const [ value, setValue ] = useState()
  return (
    <div>
        { authScreenState === "login" ? <LoginCard /> : <SignupCard />}
    </div>
  )
}

export default AuthPage