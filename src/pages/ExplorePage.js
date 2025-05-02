import React, { useState, useEffect, useCallback, useContext } from 'react';
import {
  Box,
  Heading,
  Text,
  SimpleGrid,
  VStack,
  HStack,
  Input,
  InputGroup,
  InputLeftElement,
  Select,
  Button, // Import Button for pagination
  useDisclosure, // Keep for potential future modals
  Spinner,
  Center,
  Icon,
  Alert,
  AlertIcon,
  Skeleton, // Added
  SkeletonText // Added
} from '@chakra-ui/react';
import { FaSearch } from 'react-icons/fa'; // Use FaSearch if FiSearch isn't found
import { FiSearch } from 'react-icons/fi'; // Correct import for FiSearch
import axios from 'axios'; // Import axios
// Corrected import paths
import StyleCard from '../components/Styles/StyleCard';
import { useInfiniteQuery } from '@tanstack/react-query'; // Use @tanstack/react-query
// import { useInView } from 'react-intersection-observer'; // Removed
import { usePageHeader } from '../components/Layout/DashboardLayout'; // Import hook

// TODO: Move to config
const API_BASE_URL = 'https://productmarketing-ai-f0e989e4e1ad.herokuapp.com';
const PAGE_LIMIT = 24; // Number of items per page

// Skeleton Card Component (matches StyleCard structure)
const SkeletonStyleCard = () => (
  <Box borderWidth="1px" borderRadius="lg" overflow="hidden" p={3}>
    <Skeleton height="200px" /> {/* Adjust height based on StyleCard image */}
    <SkeletonText mt="4" noOfLines={2} spacing="4" skeletonHeight="2" />
  </Box>
);

// --- API Fetching function for React Query --- 
const fetchPublicAssets = async ({ pageParam = 0 }) => {
  console.log("Fetching public assets, offset:", pageParam);
  const { data } = await axios.get(`${API_BASE_URL}/api/assets/public`, {
    params: {
      limit: PAGE_LIMIT,
      offset: pageParam,
      // Add search query here if implementing server-side search
    }
  });
  // API returns { assets: [], totalCount: number, limit: number, offset: number }
  // We need to return the assets and the next offset
  return {
    assets: data.assets || [],
    nextOffset: (data.assets?.length === PAGE_LIMIT) ? pageParam + PAGE_LIMIT : undefined,
    totalCount: data.totalCount
  };
};

export default function ExplorePage() {
  const { setHeader } = usePageHeader(); // Use hook
  const [searchTerm, setSearchTerm] = useState('');
  // const { ref, inView } = useInView(); // Removed

  const {
    data,
    error,
    fetchNextPage,
    hasNextPage,
    isFetching,
    isFetchingNextPage,
    status
  } = useInfiniteQuery({
    queryKey: ['publicAssets'],
    queryFn: fetchPublicAssets,
    getNextPageParam: (lastPage) => lastPage.nextOffset,
    initialPageParam: 0 // Ensure initial page param is set if upgrading react-query
  });

  // Fetch next page when the trigger element is in view - REMOVED
  // useEffect(() => {
  //   if (inView && hasNextPage) {
  //     console.log("Triggering fetch next page...");
  //     fetchNextPage();
  //   }
  // }, [inView, fetchNextPage, hasNextPage]);

  // Client-side filtering (if server-side search not implemented)
  const filteredAssets = data?.pages.flatMap(page => page.assets).filter(asset =>
    (asset.prompt || '').toLowerCase().includes(searchTerm.toLowerCase())
  ) || [];

  // Show loading if status is loading OR if query is not errored and has no pages yet
  const isLoadingInitial = status === 'loading' || (status !== 'error' && !data?.pages?.length);
  const numSkeletons = 12;

  useEffect(() => {
    setHeader('Explore Styles', 'Discover looks shared by the community.'); // Updated header title
    return () => setHeader('', ''); // Clear on unmount
  }, [setHeader]);

  return (
    <VStack spacing={6} align="stretch">
      {/* --- Header Removed ---
      <HStack justifyContent="space-between">
          <Box>
             <Heading size="lg">Explore Public Styles</Heading>
             <Text color="gray.500">Discover looks shared by the community.</Text>
          </Box>
      </HStack>
      */}

      {/* Loading State */}
      {isLoadingInitial ? (
         <SimpleGrid columns={{ base: 1, sm: 2, md: 3, lg: 4 }} spacing={6}>
           {Array.from({ length: numSkeletons }).map((_, index) => (
             <SkeletonStyleCard key={index} />
           ))}
         </SimpleGrid>
      ) : status === 'error' ? (
        <Alert status="error">
            <AlertIcon />
            Error fetching styles: {error.message}
        </Alert>
      ) : filteredAssets.length > 0 ? (
         <>
            <SimpleGrid columns={{ base: 1, sm: 2, md: 3, lg: 4 }} spacing={6}>
            {filteredAssets.map(asset => (
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
              {!hasNextPage && <Text fontSize="sm" color="gray.500">No more styles to load.</Text>}
            </Center>
         </>
      ) : (
         <Center p={10} borderWidth="1px" borderRadius="md" borderStyle="dashed">
            <Heading size="md" color="gray.500">
                No public styles found{searchTerm ? ` matching "${searchTerm}"` : ''}.
            </Heading>
         </Center>
      )}
    </VStack>
  );
} 