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
    Spinner
} from '@chakra-ui/react';
import { useNavigate, Link as RouterLink } from 'react-router-dom';
import axios from 'axios';
import { FaEnvelope, FaLock, FaUser } from 'react-icons/fa';

// TODO: Move this to a config file or environment variable
const API_BASE_URL = 'https://productmarketing-ai-f0e989e4e1ad.herokuapp.com';

function SignupPage() {
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const navigate = useNavigate();
  const toast = useToast();

  const bgColor = useColorModeValue('gray.50', 'gray.900');
  const formBgColor = useColorModeValue('white', 'gray.700');
  const textColor = useColorModeValue('gray.600', 'gray.300');
  const headingColor = useColorModeValue('gray.700', 'white');
  const linkColor = useColorModeValue('purple.500', 'purple.300');

  const handleSubmit = async (e) => {
    e.preventDefault();
    setIsLoading(true);

    try {
      const payload = { email, password };
      if (name) {
        payload.name = name;
      }

      const response = await axios.post(`${API_BASE_URL}/api/auth/signup`, payload);

      if (response.status === 201 && response.data) { // Check for 201 Created
        toast({
          title: 'Signup Successful.',
          description: response.data.message || "You can now log in.",
          status: 'success',
          duration: 3000,
          isClosable: true,
          position: 'top',
        });
        navigate('/login', { replace: true }); // Redirect to login page
      } else {
        throw new Error(response.data?.message || 'Signup failed: Invalid response from server.');
      }
    } catch (error) {
      console.error('Signup failed:', error);
      let errorMessage = "An unexpected error occurred.";

      if (error.response) {
        errorMessage = error.response.data?.message || errorMessage;
      } else if (error.request) {
        errorMessage = "No response from server. Please check your connection.";
      } else {
        errorMessage = error.message;
      }

      toast({
        title: 'Signup Failed.',
        description: errorMessage,
        status: 'error',
        duration: 5000,
        isClosable: true,
        position: 'top',
      });
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <Flex minH="100vh" align="center" justify="center" bg={bgColor}>
      <Flex
        direction="column"
        bg={formBgColor}
        p={{ base: 6, md: 12 }}
        rounded="lg"
        shadow="xl"
        w="full"
        maxW="450px"
      >
        <Heading as="h1" size="xl" mb={4} color={headingColor} fontWeight="bold" textAlign="center">
          Create Account
        </Heading>
        <Text mb={8} color={textColor} textAlign="center">
          Get started by creating your new account.
        </Text>

        <VStack as="form" spacing={5} onSubmit={handleSubmit} align="stretch">
          <FormControl>
            <FormLabel fontSize="sm">Full Name (Optional)</FormLabel>
            <InputGroup>
               <InputLeftElement pointerEvents='none'>
                 <Icon as={FaUser} color='gray.300' />
               </InputLeftElement>
               <Input
                 type="text"
                 placeholder="Your full name"
                 value={name}
                 onChange={(e) => setName(e.target.value)}
                 borderRadius="md"
                 size="lg"
                 isDisabled={isLoading}
               />
            </InputGroup>
          </FormControl>
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
                 placeholder="Choose a strong password"
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
            loadingText="Creating Account..."
            mt={4}
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
            {isLoading ? <Spinner size="sm" /> : 'Sign Up'}
          </Button>
        </VStack>

        <Text mt={8} textAlign="center" color={textColor}>
          Already have an account?{' '}
          <Link as={RouterLink} to="/login" color={linkColor} fontWeight="medium">
            Log In
          </Link>
        </Text>
      </Flex>
    </Flex>
  );
}

export default SignupPage; 