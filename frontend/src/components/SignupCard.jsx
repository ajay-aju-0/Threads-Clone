import {
	Flex,
	Box,
	FormControl,
	FormLabel,
	Input,
	InputGroup,
	HStack,
	InputRightElement,
	Stack,
	Button,
	Heading,
	Text,
	useColorModeValue,
	Link
} from "@chakra-ui/react";
import { ViewIcon, ViewOffIcon } from "@chakra-ui/icons";
import { useState } from "react";
import { useRecoilState, useSetRecoilState } from "recoil";
import authScreenAtom from "../atoms/authAtom";
import useShowToast from "../hooks/useShowToast";
import userAtom from "../atoms/userAtom";

const SignupCard = () => {
    const [showPassword, setShowPassword] = useState(false);
    const [showConfirmPassword, setShowConfirmPassword] = useState(false);
    const setAuthScreen = useSetRecoilState(authScreenAtom);
    const showToast = useShowToast();

    const setUser = useSetRecoilState(userAtom);

    const [ inputs, setInputs ] = useState({
        fullname: "",
        username: "",
        email: "",
        password: "",
        confirmPassword: ""
    })

    const onInputChange = async(e) => {
        setInputs({
            ...inputs,
            [e.target.name]:e.target.value
        });
    }

    const handleSignup = async() => {
        try {
            const res = await fetch("/api/users/signup",{
                method: "POST",
                headers: {
                    "Content-Type":"application/json"
                },
                body: JSON.stringify(inputs)
            })

            const data = await res.json();
            if(data.error) {
                showToast("Error", data.error, "error");
                return;
            }
            localStorage.setItem("user-threads",JSON.stringify(data));
            setUser(data);

        } catch (error) {
            showToast("Error",error.message,"error");
        }
    }
  return (
    <Flex align={"center"} justify={"center"}>
			<Stack spacing={4} mx={"auto"} maxW={"lg"} py={0} px={6}>
				<Stack align={"center"}>
					<Heading fontSize={"4xl"} textAlign={"center"}>
						Sign up
					</Heading>
				</Stack>
				<Box rounded={"lg"} bg={useColorModeValue("white", "gray.dark")} boxShadow={"lg"} p={8}>
					<Stack spacing={4}>
						<HStack>
							<Box>
								<FormControl isRequired>
									<FormLabel>Full name</FormLabel>
									<Input
										type='text'
                                        name="fullname"
										value={inputs.fullname}
                                        onChange={onInputChange} 
									/>
								</FormControl>
							</Box>
							<Box>
								<FormControl isRequired>
									<FormLabel>Username</FormLabel>
									<Input
										type='text'
                                        name="username"
										value={inputs.username}
                                        onChange={onInputChange} 
									/>
								</FormControl>
							</Box>
						</HStack>
						<FormControl isRequired>
							<FormLabel>Email address</FormLabel>
							<Input
								type='email'
                                name="email"
								value={inputs.email}
                                onChange={onInputChange} 
							/>
						</FormControl>
						<FormControl isRequired>
							<FormLabel>Password</FormLabel>
							<InputGroup>
								<Input
									type={showPassword ? "text" : "password"}
                                    name="password"
                                    value={inputs.password}
                                    onChange={onInputChange}	
								/>
								<InputRightElement h={"full"}>
									<Button
										variant={"ghost"}
										onClick={() => {setShowPassword((showPassword) => !showPassword)}}
									>
										{showPassword ? <ViewIcon /> : <ViewOffIcon />}
									</Button>
								</InputRightElement>
							</InputGroup>
						</FormControl>
                        <FormControl isRequired>
							<FormLabel>Confirm Password</FormLabel>
							<InputGroup>
								<Input
									type={showConfirmPassword ? "text" : "password"}
                                    name="confirmPassword"
                                    value={inputs.confirmPassword}
                                    onChange={onInputChange}	
								/>
								<InputRightElement h={"full"}>
									<Button
										variant={"ghost"}
										onClick={() => {setShowConfirmPassword((showConfirmPassword) => !showConfirmPassword)}}
									>
										{showConfirmPassword ? <ViewIcon /> : <ViewOffIcon />}
									</Button>
								</InputRightElement>
							</InputGroup>
						</FormControl>
						<Stack spacing={10} pt={2}>
							<Button
								loadingText='Submitting'
								size='lg'
								bg={useColorModeValue("gray.600", "gray.700")}
								color={"white"}
								_hover={{
									bg: useColorModeValue("gray.700", "gray.800"),
								}}
								onClick={handleSignup}
							>
								Sign up
							</Button>
						</Stack>
						<Stack pt={6}>
							<Text align={"center"}>
								Already a user?{" "}
								<Link color={"blue.400"} onClick={() => setAuthScreen("login")}>
									Login
								</Link>
							</Text>
						</Stack>
					</Stack>
				</Box>
			</Stack>
		</Flex>
  )
}

export default SignupCard