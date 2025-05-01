import React, { useState } from 'react';
import { Box, Heading, Input, Button, VStack, FormControl, FormLabel, useToast } from '@chakra-ui/react';
import { useNavigate } from 'react-router-dom';

function LoginPage({ onLoginSuccess }) {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const navigate = useNavigate();
  const toast = useToast();

  const handleSubmit = (e) => {
    e.preventDefault();
    // Simulate successful login for any input
    console.log('Attempting login with:', { email, password }); 
    
    // --- Replace with actual API call later --- 
    const isLoginSuccessful = true; // Assume success for now

    if (isLoginSuccessful) {
      onLoginSuccess(); // Update auth state in App.js
      toast({
        title: 'Login Successful.',
        description: "Welcome back!",
        status: 'success',
        duration: 3000,
        isClosable: true,
        position: 'top',
      });
      navigate('/app/dashboard', { replace: true }); // Navigate to dashboard
    } else {
      toast({
        title: 'Login Failed.',
        description: "Invalid credentials (placeholder).",
        status: 'error',
        duration: 5000,
        isClosable: true,
        position: 'top',
      });
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
          <Button type="submit" colorScheme="teal" width="full" size="lg">
            Log In
          </Button>
        </VStack>
      </Box>
    </Box>
  );
}

export default LoginPage; 