import React, { useState } from 'react';
import { Box, Heading, Input, Button, VStack, FormControl, FormLabel, useToast } from '@chakra-ui/react';
import { useNavigate } from 'react-router-dom';
import axios from 'axios'; // Import axios

// TODO: Move this to a config file or environment variable
const API_BASE_URL = 'https://productmarketing-ai-f0e989e4e1ad.herokuapp.com';

function LoginPage({ onLoginSuccess }) {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [isLoading, setIsLoading] = useState(false); // Add loading state
  const navigate = useNavigate();
  const toast = useToast();

  const handleSubmit = async (e) => { // Make function async
    e.preventDefault();
    setIsLoading(true); // Start loading
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
        // Optionally store user info if needed globally later
        // localStorage.setItem('userInfo', JSON.stringify(response.data.user));

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
    <Box 
      display="flex" 
      alignItems="center" 
      justifyContent="center" 
      height="100vh" 
      bg="gray.50"
    >
      <Box 
        p={8} 
        maxWidth="400px" 
        borderWidth={1} 
        borderRadius={8} 
        boxShadow="lg" 
        bg="white"
      >
        <VStack as="form" spacing={6} onSubmit={handleSubmit}>
          <Heading as="h2" size="lg" textAlign="center">
            Login
          </Heading>
          <FormControl isRequired>
            <FormLabel>Email address</FormLabel>
            <Input 
              type="email" 
              placeholder="Enter your email" 
              value={email}
              onChange={(e) => setEmail(e.target.value)}
            />
          </FormControl>
          <FormControl isRequired>
            <FormLabel>Password</FormLabel>
            <Input 
              type="password" 
              placeholder="Enter your password" 
              value={password}
              onChange={(e) => setPassword(e.target.value)}
            />
          </FormControl>
          <Button 
            type="submit" 
            colorScheme="teal" 
            width="full" 
            size="lg"
            isLoading={isLoading} // Show loading spinner on button
            loadingText="Logging in..." // Text while loading
          >
            Log In
          </Button>
        </VStack>
      </Box>
    </Box>
  );
}

export default LoginPage; 