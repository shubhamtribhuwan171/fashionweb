import React, { useState, useEffect, useContext } from 'react';
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
  Spinner,
  Alert,
  AlertIcon,
  Center,
  Skeleton,
  SkeletonText,
} from '@chakra-ui/react';
import { Link as RouterLink } from 'react-router-dom'; // For navigation
import { FaTshirt, FaPlus, FaPalette, FaLayerGroup, FaHistory, FaMagic, FaImage, FaBoxOpen } from 'react-icons/fa'; // Icons
import { usePageHeader } from '../components/Layout/DashboardLayout'; // Import the custom hook

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

const API_BASE_URL = 'https://productmarketing-ai-f0e989e4e1ad.herokuapp.com'; // TODO: Move to config

// Placeholder for your API fetching logic
// Replace this with your actual API client call
const fetchWorkspaceSummary = async (workspaceId) => {
  // --- REAL IMPLEMENTATION using fetch API ---
  const apiUrl = `${API_BASE_URL}/api/workspaces/${workspaceId}/summary`;

  try {
    // Get the auth token from localStorage
    const token = localStorage.getItem('authToken'); 
    if (!token) {
      // Handle missing token scenario - perhaps redirect to login or show error
      console.error("Authentication token not found in localStorage.");
      throw new Error("Authentication required. Please log in.");
    }

    const headers = {
      'Content-Type': 'application/json',
      'Authorization': `Bearer ${token}`, // Use the retrieved token
    };

    const response = await fetch(apiUrl, {
      method: 'GET',
      headers: headers,
    });

    if (!response.ok) {
      // Handle specific HTTP error statuses if needed
      console.error(`API Error: ${response.status} ${response.statusText}`);
      throw new Error(`Failed to fetch summary. Status: ${response.status}`);
    }

    const data = await response.json();
    return data; // Should match the expected { looks_created_count, collections_count, ... } structure

  } catch (error) {
    console.error('Network or fetch error:', error);
    // Re-throw the error so the calling useEffect can catch it
    throw new Error(error.message || 'Failed to connect to the server.');
  }
  // --- END REAL IMPLEMENTATION ---
};

// --- Skeleton Stat Card --- 
const SkeletonStatCard = () => (
  <Box p={4} borderWidth="1px" borderRadius="lg" >
    <Skeleton height="20px" width="100px" mb={2} />
    <Skeleton height="36px" width="60px" mb={2}/>
    <Skeleton height="16px" width="80px" />
  </Box>
);

export default function DashboardHomePage() {
  // --- Use the context hook ---
  const { setHeader } = usePageHeader();

  // --- Set header on mount ---
  useEffect(() => {
    setHeader('Welcome back!', 'Overview of your workspace'); // Set title and subtitle
    // Cleanup function to clear header when component unmounts (optional)
    return () => setHeader('', '');
  }, [setHeader]);

  // --- Move hook calls and variable definitions here, BEFORE ActionCard --- 
  const cardBg = useColorModeValue('white', 'gray.700');
  const hoverBg = useColorModeValue('gray.100', 'gray.600'); // Hover background for cards
  const subtleText = useColorModeValue('gray.600', 'gray.400');
  const iconColor = useColorModeValue('purple.500', 'purple.300'); // Changed from blue

  // --- State for Stats ---
  const [stats, setStats] = useState({
    looks_created_count: 0,
    collections_count: 0,
    base_garments_count: 0,
  });
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState(null);

  // --- TODO: Get currentWorkspaceId ---
  // Replace this with how you get the workspace ID in your app
  // e.g., from context, props, or URL params
  const currentWorkspaceId = '95d29ad4-47fa-48ee-85cb-cbf762eb400a'; // Example ID

  // --- Fetch data on mount ---
  useEffect(() => {
    if (!currentWorkspaceId) {
      setError("Workspace ID is missing.");
      setIsLoading(false);
      return;
    }

    const loadSummary = async () => {
      setIsLoading(true);
      setError(null);
      try {
        const summaryData = await fetchWorkspaceSummary(currentWorkspaceId);
        setStats(summaryData);
      } catch (err) {
        console.error("Error fetching workspace summary:", err);
        setError(err.message || "Failed to load dashboard summary.");
      } finally {
        setIsLoading(false);
      }
    };

    loadSummary();
  }, [currentWorkspaceId]); // Re-run if workspaceId changes

  // --- Action Card Structure - Defined INSIDE the component ---
  const ActionCard = ({ to, icon, title, ...rest }) => (
    <VStack
      as={RouterLink} // Make the whole card a link
      to={to}
      p={5} // Increased padding
      bg={cardBg} // Now has access to cardBg
      borderWidth="1px"
      borderColor={useColorModeValue('gray.200', 'gray.600')} // Keep this specific one if needed, or use a variable
      borderRadius="lg"
      spacing={3}
      alignItems="center"
      justifyContent="center"
      textAlign="center"
      minH="130px" // Ensure consistent height
      transition="all 0.2s ease-in-out"
      _hover={{
        transform: 'translateY(-3px)',
        shadow: 'md',
        bg: hoverBg, // Now has access to hoverBg
        borderColor: useColorModeValue('gray.300', 'gray.500'), // Keep this specific one if needed
      }}
      {...rest}
    >
      <Icon 
        as={icon} 
        boxSize={8} 
        color={iconColor} 
        transition="transform 0.2s ease-in-out"
        _groupHover={{ transform: 'scale(1.15)' }} // Scale icon on card hover
      /> 
      <Text fontWeight="medium" fontSize="sm">
        {title}
      </Text>
    </VStack>
  );

  return (
    <VStack spacing={8} align="stretch">
      {/* --- Heading removed from here --- */}
      {/* <Heading size="lg">Welcome back!</Heading> */}

      {/* --- New Quick Actions Section --- */}
      <Box>
        <Heading size="md" mb={4}>Quick Actions</Heading>
        <SimpleGrid columns={{ base: 1, sm: 2, md: 3, lg: 5 }} spacing={5}> 
          {/* Card 1: Visualize from Text */}
          <ActionCard 
            to="/app/create" 
            icon={FaMagic} 
            title="Visualize from Text"
            state={{ initialMode: 'text' }}
          />
          {/* Card 2: Visualize with Garment -> Apparel */}
          <ActionCard 
            to="/app/create" // Link to create
            icon={FaTshirt} 
            title="Visualize with Apparel" // Updated title
            state={{ initialMode: 'garment' }}
          />
          {/* Card 3: Visualize from Image */}
          <ActionCard 
            to="/app/create" // Link to create
            icon={FaImage} 
            title="Visualize from Image"
            state={{ initialMode: 'image' }}
          />
          {/* Card 4: Manage Garments -> Manage Closet */}
          <ActionCard 
            to="/app/products" 
            icon={FaBoxOpen} // Changed icon
            title="Manage Closet" // Changed title
          />
          {/* Card 5: Manage Collections */}
          <ActionCard 
            to="/app/collections" 
            icon={FaLayerGroup} 
            title="Manage Collections"
          />
        </SimpleGrid>
      </Box>

      <Divider />

      {/* Stats Overview */}
      <Box>
        <Heading size="md" mb={4}>Overview</Heading>
        {isLoading ? (
          <SimpleGrid columns={{ base: 1, md: 3 }} spacing={6}>
             <SkeletonStatCard />
             <SkeletonStatCard />
             <SkeletonStatCard />
          </SimpleGrid>
        ) : error ? (
          <Alert status="error">
            <AlertIcon />
            {error}
          </Alert>
        ) : (
        <SimpleGrid columns={{ base: 1, md: 3 }} spacing={6}>
          <Stat as={Box} p={5} borderWidth="1px" borderRadius="lg" bg={cardBg} 
            transition="all 0.2s ease-in-out"
            _hover={{ transform: 'translateY(-3px)', shadow: 'md', bg: hoverBg }}
          >
            <StatLabel display="flex" alignItems="center" mb={2} fontSize="sm">
              <Icon as={FaPalette} mr={2} /> Visualized Looks 
            </StatLabel>
              <StatNumber fontSize="3xl">{stats.looks_created_count}</StatNumber> 
            <StatHelpText fontSize="xs">Created so far</StatHelpText>
          </Stat>
          <Stat as={Box} p={5} borderWidth="1px" borderRadius="lg" bg={cardBg}
            transition="all 0.2s ease-in-out"
            _hover={{ transform: 'translateY(-3px)', shadow: 'md', bg: hoverBg }}
          >
            <StatLabel display="flex" alignItems="center" mb={2} fontSize="sm">
              <Icon as={FaLayerGroup} mr={2} /> Collections
            </StatLabel>
              <StatNumber fontSize="3xl">{stats.collections_count}</StatNumber>
            <StatHelpText fontSize="xs">Organized sets</StatHelpText>
          </Stat>
          <Stat as={Box} p={5} borderWidth="1px" borderRadius="lg" bg={cardBg}
            transition="all 0.2s ease-in-out"
            _hover={{ transform: 'translateY(-3px)', shadow: 'md', bg: hoverBg }}
          >
            <StatLabel display="flex" alignItems="center" mb={2} fontSize="sm">
              <Icon as={FaTshirt} mr={2} /> Virtual Closet Items
            </StatLabel>
              <StatNumber fontSize="3xl">{stats.base_garments_count}</StatNumber>
            <StatHelpText fontSize="xs">Available items</StatHelpText>
          </Stat>
        </SimpleGrid>
        )}
      </Box>

      <Divider />

      {/* Recent Activity - REMOVED */}
      {/* 
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
      */}

    </VStack>
  );
} 