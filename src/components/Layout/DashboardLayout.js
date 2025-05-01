import React from 'react';
import { Box, Flex } from '@chakra-ui/react';
import Sidebar from './Sidebar';

function DashboardLayout({ children, logout }) {
  return (
    <Flex height="100vh" bg="gray.50">
      {/* Sidebar */}
      <Sidebar logout={logout} />

      {/* Main Content Area */}
      <Box flex="1" p={8} overflowY="auto">
        {children} {/* This is where the routed page components will render */}
      </Box>
    </Flex>
  );
}

export default DashboardLayout; 