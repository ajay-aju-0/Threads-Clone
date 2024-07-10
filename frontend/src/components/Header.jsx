import { Button, Flex, Image, useColorMode } from '@chakra-ui/react'
import { AiFillHome } from "react-icons/ai";
import { RxAvatar } from "react-icons/rx";
import { FiLogOut,FiLogIn,FiUserPlus } from 'react-icons/fi';
import { MdOutlineSettings } from 'react-icons/md';
import { BsFillChatQuoteFill } from 'react-icons/bs';
import { Link, Link as RouterLink } from "react-router-dom";
import { useRecoilValue, useSetRecoilState } from 'recoil';
import useLogout from '../hooks/useLogout';
import userAtom from '../atoms/userAtom';
import authScreenAtom from '../atoms/authAtom';

const Header = () => {
    const { colorMode, toggleColorMode } = useColorMode();
    const user = useRecoilValue(userAtom);
    const logout = useLogout();
	const setAuthScreen = useSetRecoilState(authScreenAtom);

  return (
    <Flex justifyContent={"space-between"} mt={6} mb='12'>
        {user && (
				<Link as={RouterLink} to='/'>
					<AiFillHome size={24} />
				</Link>
		)}

        {!user && (
            <Link as={RouterLink} to={"/auth"} onClick={() => setAuthScreen("login")}>
                <Button size={"md"} colorScheme='blue'>Login &nbsp;<FiLogIn size={18} /></Button>
            </Link>
        )}
        <Image
				cursor={"pointer"}
				alt='logo'
				w={6}
				src={colorMode === "dark" ? "/light-logo.svg" : "/dark-logo.svg"}
				onClick={toggleColorMode}
		/>

        {user && (
            <Flex alignItems={"center"} gap={4}>
                <Link as={RouterLink} to={`/${user.username}`}>
                    <RxAvatar size={24} />
                </Link>
                <Link as={RouterLink} to={`/chat`}>
                    <BsFillChatQuoteFill size={20} />
                </Link>
                <Link as={RouterLink} to={`/settings`}>
                    <MdOutlineSettings size={20} />
                </Link>
                <Button size={"xs"} onClick={logout}>
                    <FiLogOut size={20} />
                </Button>
            </Flex>
		)}

        {!user && (
            <Link as={RouterLink} to={"/auth"} onClick={() => setAuthScreen("signup")}>
                <Button size={"md"} colorScheme='blue'><FiUserPlus size={18} /> &nbsp; Sign Up</Button>
            </Link>
        )}
    </Flex>
  )
}

export default Header