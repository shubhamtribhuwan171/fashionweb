import React from 'react';
import { Box, Heading } from '@chakra-ui/react';

function DashboardPage() {
  return (
    <Box>
      <Heading as="h1" size="xl" mb={6}>Dashboard</Heading>
      {/* Content for Dashboard page goes here */}
      <p>Overview of your recent activity and garments.</p>
    </Box>
  );
}

export default DashboardPage; 