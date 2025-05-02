import React, { useState, useEffect, useCallback, useContext } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  Box,
  Heading,
  Text,
  Button,
  SimpleGrid,
  VStack,
  HStack,
  Select,
  Input,
  InputGroup,
  InputLeftElement,
  useDisclosure, // Keep for potential future modals
  Spinner,
  Center,
  useToast, // Import useToast
  Skeleton, // Added
  SkeletonText, // Added
  Alert, // Added
  AlertIcon // Added
} from '@chakra-ui/react';
import { FaSearch } from 'react-icons/fa'; // Add search icon
// Corrected import paths
import StyleCard from '../components/Styles/StyleCard';
// Use mock data function for assets
import { getMockAssets } from '../data/mockData';
import axios from 'axios'; // Import axios
import { useInfiniteQuery } from '@tanstack/react-query'; // Use @tanstack/react-query
import { usePageHeader } from '../components/Layout/DashboardLayout'; // Import hook
// Import the new StyledSelect component
import StyledSelect from '../components/Common/StyledSelect';

// TODO: Replace with actual workspace ID from context/state management
const getMockWorkspaceId = () => '95d29ad4-47fa-48ee-85cb-cbf762eb400a';

// TODO: Move to config
const API_BASE_URL = 'https://productmarketing-ai-f0e989e4e1ad.herokuapp.com';
const PAGE_LIMIT = 20; // Number of assets per page

// Skeleton Card Component (matches StyleCard structure)
const SkeletonStyleCard = () => (
  <Box borderWidth="1px" borderRadius="lg" overflow="hidden" p={3}>
    <Skeleton height="200px" /> {/* Adjust height based on StyleCard image */}
    <SkeletonText mt="4" noOfLines={2} spacing="4" skeletonHeight="2" />
  </Box>
);

// --- API Fetching function for React Query --- 
const fetchMyAssets = async ({ pageParam = 0, queryKey }) => {
  const [_key, workspaceId, config] = queryKey;
  if (!workspaceId || !config) throw new Error("Workspace or Auth missing");
  
  console.log(`Fetching my assets for workspace ${workspaceId}, offset: ${pageParam}`);
  const { data } = await axios.get(`${API_BASE_URL}/api/assets`, {
    ...config,
    params: {
      limit: PAGE_LIMIT,
      offset: pageParam,
      workspaceId: workspaceId,
    }
  });
  return {
    assets: data.assets || [],
    nextOffset: (data.assets?.length === PAGE_LIMIT) ? pageParam + PAGE_LIMIT : undefined,
    totalCount: data.totalCount
  };
};

export default function GenerationsPage() {
  const { setHeader } = usePageHeader(); // Use hook

  useEffect(() => {
    setHeader('My Creations', 'Your generated styles and visualizations.'); // Updated header title
    return () => setHeader('', ''); // Clear on unmount
  }, [setHeader]);

  const [assets, setAssets] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [sortBy, setSortBy] = useState('date_desc'); // Default sort
  // Add state for filtering if needed, e.g., by base garment
  // const [filterByGarment, setFilterByGarment] = useState(''); 
  const [offset, setOffset] = useState(0);
  const [totalCount, setTotalCount] = useState(0);
  const navigate = useNavigate();
  const toast = useToast();
  const currentWorkspaceId = getMockWorkspaceId();

  const getAuthConfig = useCallback(() => {
    const token = localStorage.getItem('authToken');
    if (!token) {
        toast({ title: "Authentication Error", description: "Please log in.", status: "error" });
        return null;
    }
    return { headers: { Authorization: `Bearer ${token}` } };
  }, [toast]);

  const authConfig = getAuthConfig(); // Get config once

  const {
    data,
    error: queryError,
    fetchNextPage,
    hasNextPage,
    isFetching,
    isFetchingNextPage,
    status
  } = useInfiniteQuery({
      queryKey: ['myAssets', currentWorkspaceId, authConfig],
      queryFn: fetchMyAssets,
      getNextPageParam: (lastPage) => lastPage.nextOffset,
      enabled: !!currentWorkspaceId && !!authConfig, // Only run if workspace and auth are available
      onError: (err) => {
          toast({ title: "Error Loading Looks", description: err.message, status: "error" });
      },
      initialPageParam: 0 // Ensure initial page param is set
  });

  // Flatten pages for display
  const allAssets = data?.pages.flatMap(page => page.assets) || [];
  
  // Show loading if status is loading OR if the query is enabled but has no pages yet (and not errored)
  const isLoadingInitial = status === 'loading' || (status !== 'error' && !!currentWorkspaceId && !!authConfig && !data?.pages?.length); 
  const numSkeletons = 12;

  const handleVisualizeClick = () => {
    navigate('/app/create'); // Navigate to the main create page
  };

  return (
    <VStack spacing={6} align="stretch">
      {/* --- Header Removed ---
      <HStack justifyContent="space-between">
        <Box>
          <Heading size="lg">My Looks</Heading>
          <Text color="gray.500">Your generated styles and visualizations.</Text>
        </Box>
        <Button 
          leftIcon={<Icon as={FiPlus} />} 
          colorScheme="gray" 
          bg="gray.800"
          color="white"
          onClick={onCreateStyle}
          _hover={{ bg: "gray.700" }}
        >
          Create Style
        </Button>
      </HStack>
      */}

      {/* Filter/Sort Controls */}
      <HStack spacing={4} wrap="wrap" justifyContent="flex-end">
        <StyledSelect
          placeholder="Sort by..."
          maxWidth={{ base: '100%', md: '200px' }}
          // value={sortBy} // Pass value if state is managed
          // onChange={(e) => setSortBy(e.target.value)} // Pass onChange if state is managed
        >
          <option value="date_desc">Newest First</option>
          <option value="date_asc">Oldest First</option>
        </StyledSelect>
      </HStack>

      {!currentWorkspaceId || !authConfig ? (
          <Alert status="warning"><AlertIcon />Please select a workspace and ensure you are logged in.</Alert>
       ) : isLoadingInitial ? (
         // Skeleton Grid
         <SimpleGrid columns={{ base: 1, sm: 2, md: 3, lg: 4 }} spacing={6}>
           {Array.from({ length: numSkeletons }).map((_, index) => (
             <SkeletonStyleCard key={index} />
           ))}
         </SimpleGrid>
       ) : queryError ? (
        <Alert status="error">
          <AlertIcon />
          Error loading your looks: {queryError?.message || 'Unknown error'}
        </Alert>
      ) : allAssets.length > 0 ? (
        <>
          <SimpleGrid columns={{ base: 1, sm: 2, md: 3, lg: 4 }} spacing={6}>
            {allAssets.map(asset => (
              <StyleCard key={asset.id} style={asset} />
            ))}
          </SimpleGrid>
          {/* Load More Button */}
          <Center mt={8}>
             {hasNextPage && (
                <Button
                  onClick={() => fetchNextPage()}
                  isLoading={isFetchingNextPage}
                  loadingText="Loading..."
                >
                  Load More
                </Button>
              )}
            {!hasNextPage && <Text fontSize="sm" color="gray.500">No more looks to load.</Text>}
          </Center>
        </>
      ) : (
        <Center py={10}>
          <Text color="gray.500">No looks visualized yet. Click 'Visualize New Look' to start.</Text>
        </Center>
      )}
    </VStack>
  );
} 