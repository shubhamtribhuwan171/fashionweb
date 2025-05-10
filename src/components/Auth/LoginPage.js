import React, { useState } from 'react';
import {
    Box,
    Heading,
    Input,
    Button,
    VStack,
    FormControl,
    FormLabel,
    useToast,
    Flex,
    Text,
    Link,
    Icon,
    InputGroup,
    InputLeftElement,
    useColorModeValue,
    Image
} from '@chakra-ui/react';
import { useNavigate, Link as RouterLink } from 'react-router-dom';
import axios from 'axios';
import { FaEnvelope, FaLock } from 'react-icons/fa';

// TODO: Move this to a config file or environment variable
const API_BASE_URL = 'https://productmarketing-ai-f0e989e4e1ad.herokuapp.com';

function LoginPage({ onLoginSuccess }) {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const navigate = useNavigate();
  const toast = useToast();

  // --- Theme Colors (adjust if needed) ---
  const bgColor = useColorModeValue('gray.50', 'gray.900'); // Background for the whole page
  const formBgColor = useColorModeValue('white', 'gray.700'); // Background for the form side
  const graphicBgColor = useColorModeValue('#5647d7', '#3b308a'); // Example purple background for graphic side (similar to image)
  const textColor = useColorModeValue('gray.600', 'gray.300');
  const headingColor = useColorModeValue('gray.700', 'white');
  const linkColor = useColorModeValue('purple.500', 'purple.300');

  const handleSubmit = async (e) => {
    e.preventDefault();
    setIsLoading(true);
    console.log('Attempting login with:', { email, password });

    try {
      // --- Actual API call ---
      const response = await axios.post(`${API_BASE_URL}/api/auth/login`, {
        email: email,
        password: password,
      });

      // Assuming the API returns data like: { message: "...", user: {...}, token: "..." }
      if (response.data && response.data.token) {
        console.log('Login successful:', response.data.message);
        console.log('User:', response.data.user);

        // Store token in localStorage
        localStorage.setItem('authToken', response.data.token);
        // Store user info as well
        if (response.data.user) {
            localStorage.setItem('userInfo', JSON.stringify(response.data.user));
        }

        onLoginSuccess(); // Update auth state in App.js (or wherever needed)
        toast({
          title: 'Login Successful.',
          description: response.data.message || "Welcome back!",
          status: 'success',
          duration: 3000,
          isClosable: true,
          position: 'top',
        });
        navigate('/app/dashboard', { replace: true }); // Navigate to dashboard
      } else {
        // Handle cases where the API responds 2xx but doesn't include the expected data
        throw new Error('Login failed: Invalid response from server.');
      }
    } catch (error) {
      console.error('Login failed:', error);
      let errorMessage = "Invalid email or password."; // Default error

      if (error.response) {
        // The request was made and the server responded with a status code
        // that falls out of the range of 2xx
        console.error('Error response data:', error.response.data);
        console.error('Error response status:', error.response.status);
        errorMessage = error.response.data?.message || errorMessage; // Use server message if available
      } else if (error.request) {
        // The request was made but no response was received
        console.error('Error request:', error.request);
        errorMessage = "No response from server. Please check your connection.";
      } else {
        // Something happened in setting up the request that triggered an Error
        console.error('Error message:', error.message);
        errorMessage = error.message;
      }

      toast({
        title: 'Login Failed.',
        description: errorMessage,
        status: 'error',
        duration: 5000,
        isClosable: true,
        position: 'top',
      });
    } finally {
      setIsLoading(false); // Stop loading regardless of outcome
    }
  };

  return (
    <Flex minH="100vh" bg={bgColor}>
      {/* Left Side: Form */}
      <Flex
        flex={1} // Takes up half the space
        align="center"
        justify="center"
        direction="column"
        bg={formBgColor}
        p={{ base: 6, md: 12 }}
      >
        <Box w="full" maxW="450px">
            {/* Logo Placeholder - Add your Logo component here */}
            {/* <YourLogoComponent mb={8} /> */}
             <Heading as="h1" size="xl" mb={4} color={headingColor} fontWeight="bold">
                Sign In
            </Heading>
            <Text mb={8} color={textColor}>
                Welcome back! Please enter your details.
            </Text>

            <VStack as="form" spacing={5} onSubmit={handleSubmit} align="stretch">
              <FormControl isRequired>
                <FormLabel fontSize="sm">Email address</FormLabel>
                <InputGroup>
                   <InputLeftElement pointerEvents='none'>
                     <Icon as={FaEnvelope} color='gray.300' />
                   </InputLeftElement>
                   <Input
                     type="email"
                     placeholder="your.email@example.com"
                     value={email}
                     onChange={(e) => setEmail(e.target.value)}
                     borderRadius="md"
                     size="lg"
                     isDisabled={isLoading}
                   />
                </InputGroup>
              </FormControl>
              <FormControl isRequired>
                <FormLabel fontSize="sm">Password</FormLabel>
                 <InputGroup>
                   <InputLeftElement pointerEvents='none'>
                      <Icon as={FaLock} color='gray.300' />
                   </InputLeftElement>
                   <Input
                     type="password"
                     placeholder="Enter your password"
                     value={password}
                     onChange={(e) => setPassword(e.target.value)}
                     borderRadius="md"
                     size="lg"
                     isDisabled={isLoading}
                   />
                </InputGroup>
              </FormControl>
              <Button
                type="submit"
                width="full"
                size="lg"
                isLoading={isLoading}
                loadingText="Signing In..."
                mt={4}
                // Apply gradient from theme
                bgGradient="linear(to-r, teal.400, purple.500, blue.500)"
                color="white"
                fontWeight="semibold"
                _hover={{
                  bgGradient: "linear(to-r, teal.500, purple.600, blue.600)",
                  boxShadow: "lg",
                }}
                _active={{
                  bgGradient: "linear(to-r, teal.600, purple.700, blue.700)",
                }}
                borderRadius="md"
              >
                Sign In
              </Button>
            </VStack>

            <Text mt={6} textAlign="center" color={textColor}>
                Don't have an account?{' '}
                <Link as={RouterLink} to="/signup" color={linkColor} fontWeight="medium">
                    Sign Up
                </Link>
            </Text>
        </Box>
      </Flex>

      {/* Right Side: Graphic/Visual */}
      <Flex
        flex={1}
        display={{ base: 'none', md: 'flex' }}
        align="center"
        justify="center"
        direction="column"
        bgGradient="linear(to-br, blue.200, purple.300)"
        p={12}
        position="relative"
        textAlign="center"
      >
        <Image 
          src="/IMG1.png" 
          alt="AI fashion model creation graphic"
          objectFit="contain"
          maxH="65vh"
          maxW="85%"
          mb={8}
        />
        <Heading size="lg" fontWeight="bold" color="whiteAlpha.900" mb={3}>
            Create Your Vision
         </Heading>
         <Text fontSize="md" color="whiteAlpha.800" maxW="md">
            Generate stunning model photoshoots with your apparel in seconds using AI.
         </Text>
      </Flex>
    </Flex>
  );
}

export default LoginPage; 