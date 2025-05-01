import React from 'react';
import { Box, Flex } from '@chakra-ui/react';
import Sidebar from './Sidebar';
import TopBar from './TopBar';

function DashboardLayout({ children, logout }) {
  return (
    <Flex height="100vh" bg="white">
      {/* Sidebar */}
      <Sidebar logout={logout} />

      {/* Main Content Area Wrapper */}
      <Flex flex="1" direction="column">
        {/* Top Bar */}
        <TopBar logout={logout} />
        
        {/* Page Content */}
        <Box 
          as="main" 
          flex="1" 
          p={8} 
          overflowY="auto" 
          bg="gray.50"
        >
          {children} {/* Routed page components render here */}
        </Box>
      </Flex>
    </Flex>
  );
}

export default DashboardLayout; 