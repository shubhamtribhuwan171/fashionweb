import React from 'react';
import { Box, VStack, Heading, Button, Link as ChakraLink, Divider } from '@chakra-ui/react';
import { NavLink as RouterNavLink, useNavigate } from 'react-router-dom';

// Custom NavLink style for active state
const activeLinkStyle = {
  backgroundColor: 'teal.600',
  color: 'white',
  fontWeight: 'bold',
};

const baseLinkStyle = {
  display: 'block',
  padding: '0.75rem 1.5rem',
  borderRadius: 'md',
  _hover: {
    backgroundColor: 'teal.500',
    color: 'white',
  },
};

function SidebarNavLink({ to, children }) {
  return (
    <ChakraLink
      as={RouterNavLink}
      to={to}
      style={({ isActive }) => ({ ...baseLinkStyle, ...(isActive ? activeLinkStyle : {}) })}
      _focus={{ boxShadow: 'none' }}
      width="100%"
    >
      {children}
    </ChakraLink>
  );
}

function Sidebar({ logout }) {
  const navigate = useNavigate();

  const handleLogout = () => {
    logout(); // Call the logout function passed from App.js
    navigate('/', { replace: true }); // Redirect to landing page
  };

  return (
    <Box 
      w="250px" 
      bg="teal.700" 
      color="gray.100" 
      p={4}
      display="flex"
      flexDirection="column"
      height="100%"
    >
      <Heading as="h2" size="lg" mb={8} textAlign="center" color="white">
        AI Fashion
      </Heading>
      
      <VStack spacing={2} align="stretch" flexGrow={1}>
        <SidebarNavLink to="/app/dashboard">Dashboard</SidebarNavLink>
        <SidebarNavLink to="/app/generations">My Looks</SidebarNavLink>
        <SidebarNavLink to="/app/create-style">Create Style</SidebarNavLink>
        <SidebarNavLink to="/app/collections">Collections</SidebarNavLink>
        <SidebarNavLink to="/app/products">Base Garments</SidebarNavLink>
        <SidebarNavLink to="/app/explore">Explore</SidebarNavLink>
        <SidebarNavLink to="/app/settings">Settings</SidebarNavLink>
      </VStack>

      {/* Logout Button at the bottom */}
      <Divider my={4} borderColor="teal.600" />
      <Button 
        onClick={handleLogout} 
        colorScheme="red" 
        variant="solid" 
        width="full"
      >
        Logout
      </Button>
    </Box>
  );
}

export default Sidebar; 