import { createContext, useContext, useState, useEffect } from 'react'
import { createUserWithEmailAndPassword, getAuth, onIdTokenChanged, signInWithEmailAndPassword, signOut, signInWithPopup, GithubAuthProvider, linkWithPopup } from "firebase/auth"
import nookies from 'nookies';
import { parseCookies } from 'nookies'
import app from "@/lib/firebase"
import { useRouter } from 'next/router';
import { GithubService } from '@/lib/github';

export const AuthContext = createContext({
  user: null,
  signIn: async () => { },
  signUp: async () => { },
  signOut: async () => { }
});

const auth = getAuth(app);
const provider = new GithubAuthProvider();

export function AuthUserProvider({ children }) {

  const [user, setUser] = useState(null)
  const router = useRouter()

  useEffect(() => {
    return onIdTokenChanged(auth, async (user) => {
      if (user) {
        const token = await user.getIdToken();
        setUser(user)
        nookies.set(undefined, 'token', token, { path: '/' });
      } else {
        setUser(null)
        nookies.set(undefined, 'token', '', { path: '/' });
      }
    })
  }, [])

  const githubSignIn = async () => {
    const result = await signInWithPopup(auth, provider)
    await GithubService.uploadGithubAccessToken(result)
    router.push("/dashboard")
  }

  const signIn = async (email, password) => {
    try {
      await signInWithEmailAndPassword(auth, email, password);
      router.push("/dashboard");
      return true;
    } catch (error) {
      console.error(error);
    }
  }

  const signUp = async (email, password) => {
    try {
      await createUserWithEmailAndPassword(auth, email, password);
      router.push("/dashboard");
      return true;
    } catch (error) {
      console.error(error);
    }
  }

  const logout = async () => {
    try{
      await signOut(auth)
      router.push("/")
    } catch (error){
      console.error(error)
    }
  }

  const isUserSignedIn = () => {
    return parseCookies().token !== "";
  }

  const linkGithubAccount = async () => {
    return await linkWithPopup(auth.currentUser, provider)
  }

  return <AuthContext.Provider value={{user, signUp, signIn, githubSignIn, linkGithubAccount, logout, isUserSignedIn}}>{children}</AuthContext.Provider>;
}

export const useAuth = () => useContext(AuthContext)
