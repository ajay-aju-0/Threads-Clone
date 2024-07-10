import { Navigate, Route, Routes, useLocation } from "react-router-dom";
import { Box, Container } from "@chakra-ui/react"
import Header from "./components/Header";
import HomePage from "./pages/HomePage";
import PostPage from "./pages/PostPage";
import UserPage from "./pages/UserPage";
import CreatePost from "./components/CreatePost";
import AuthPage from "./pages/AuthPage";
import { useRecoilValue } from "recoil";
import userAtom from "./atoms/userAtom"
import UpdateProfilePage from "./pages/UpdateProfilePage";
import ChatPage from "./pages/ChatPage";
import SettingsPage from "./pages/SettingsPage";

function App() {
    const user = useRecoilValue(userAtom);
    const { pathname } = useLocation();
  return (
    <Box position={"relative"} w='full'>
        <Container maxW={pathname === "/" ? { base: "620px", md: "900px" } : "620px"}>
            <Header />
            <Routes>
                <Route path='/' element={user ? <HomePage /> : <Navigate to='/auth' />} />
                <Route path='/auth' element={!user ? <AuthPage /> : <Navigate to='/' />} />
                <Route path='/update' element={user ? <UpdateProfilePage /> : <Navigate to='/auth' />} />
                <Route path='/:username' element={user ? (<><UserPage /><CreatePost /></>) : (<UserPage />)}/>
                <Route path='/:username/post/:pid' element={<PostPage />} />
                <Route path='/chat' element={<ChatPage />} />
                <Route path='/settings' element={<SettingsPage />} />
            </Routes>
        </Container>
    </Box>
  )
}

export default App
