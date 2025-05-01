import React from 'react';
import {
  Heading,
  Text,
  VStack,
  Box,
  SimpleGrid,
  Stat,
  StatLabel,
  StatNumber,
  StatHelpText,
  Button,
  HStack,
  Icon,
  Divider,
  Link as ChakraLink,
  useColorModeValue,
} from '@chakra-ui/react';
import { Link as RouterLink } from 'react-router-dom'; // For navigation
import { FaTshirt, FaPlus, FaPalette, FaLayerGroup, FaHistory } from 'react-icons/fa'; // Icons

// Mock data for recent activity
const mockRecentActivity = [
  { id: 1, type: 'generate', description: 'Visualized "Cyberpunk Jacket Look"' , timestamp: '2 hours ago' },
  { id: 2, type: 'collection', description: 'Created collection "Summer Vibes 2024"' , timestamp: '1 day ago' },
  { id: 3, type: 'garment', description: 'Added garment "Classic White T-Shirt"' , timestamp: '3 days ago' },
  { id: 4, type: 'generate', description: 'Visualized "Elegant Evening Gown"' , timestamp: '5 days ago' },
];

// Simple helper to get icon based on activity type
const getActivityIcon = (type) => {
  switch (type) {
    case 'generate': return FaPalette;
    case 'collection': return FaLayerGroup;
    case 'garment': return FaTshirt;
    default: return FaHistory;
  }
};

export default function DashboardHomePage() {
  const cardBg = useColorModeValue('white', 'gray.700');
  const subtleText = useColorModeValue('gray.600', 'gray.400');

  // Mock stats (would come from actual data later)
  const stats = {
    generations: 15,
    collections: 4,
    garments: 5,
  };

  return (
    <VStack spacing={8} align="stretch">
      <Heading size="lg">Welcome back!</Heading>

      {/* Quick Actions */}
      <Box>
        <Heading size="md" mb={4}>Quick Actions</Heading>
        <HStack spacing={4}>
          {/* Update links to match current app structure */}
          <Button as={RouterLink} to="/app/create" leftIcon={<FaPlus />} colorScheme="blue">
            Visualize New Look
          </Button>
          {/* Assuming Add Garment happens on the Products page via modal */}
          <Button as={RouterLink} to="/app/products" leftIcon={<FaTshirt />} variant="outline">
            Manage Garments
          </Button>
           {/* Assuming New Collection happens on the Collections page via modal */}
           <Button as={RouterLink} to="/app/collections" leftIcon={<FaLayerGroup />} variant="outline">
            Manage Collections
          </Button>
        </HStack>
      </Box>

      <Divider />

      {/* Stats Overview */}
      <Box>
        <Heading size="md" mb={4}>Overview</Heading>
        <SimpleGrid columns={{ base: 1, md: 3 }} spacing={6}>
          <Stat p={4} borderWidth="1px" borderRadius="lg" bg={cardBg}>
            <StatLabel display="flex" alignItems="center">
              {/* Updated Icon */}
              <Icon as={FaPalette} mr={2} /> Visualized Looks 
            </StatLabel>
            <StatNumber>{stats.generations}</StatNumber>
            <StatHelpText>Created so far</StatHelpText>
          </Stat>
          <Stat p={4} borderWidth="1px" borderRadius="lg" bg={cardBg}>
            <StatLabel display="flex" alignItems="center">
              <Icon as={FaLayerGroup} mr={2} /> Collections
            </StatLabel>
            <StatNumber>{stats.collections}</StatNumber>
            <StatHelpText>Organized sets</StatHelpText>
          </Stat>
          <Stat p={4} borderWidth="1px" borderRadius="lg" bg={cardBg}>
            <StatLabel display="flex" alignItems="center">
              <Icon as={FaTshirt} mr={2} /> Base Garments
            </StatLabel>
            <StatNumber>{stats.garments}</StatNumber>
            <StatHelpText>Available items</StatHelpText>
          </Stat>
        </SimpleGrid>
      </Box>

      <Divider />

      {/* Recent Activity */}
      <Box>
         <Heading size="md" mb={4}>Recent Activity</Heading>
         <VStack spacing={3} align="stretch" borderWidth="1px" borderRadius="lg" p={4} bg={cardBg}>
          {mockRecentActivity.length > 0 ? (
            mockRecentActivity.map((activity) => (
              <HStack key={activity.id} spacing={3}>
                <Icon as={getActivityIcon(activity.type)} color={subtleText} />
                <Text fontSize="sm" flex={1}>{activity.description}</Text>
                <Text fontSize="xs" color={subtleText}>{activity.timestamp}</Text>
              </HStack>
            ))
          ) : (
            <Text color={subtleText}>No recent activity to display.</Text>
          )}
        </VStack>
      </Box>

    </VStack>
  );
} 