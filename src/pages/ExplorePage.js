import React, { useState, useEffect, useCallback } from 'react';
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
  useDisclosure, // Keep for potential future modals
  Spinner,
  Center,
} from '@chakra-ui/react';
import { FaSearch } from 'react-icons/fa'; // Add search icon
// Corrected import paths
import StyleCard from '../components/Styles/StyleCard'; 
import { getMockPublicAssets } from '../data/mockData'; 

export default function ExplorePage() {
  const [publicAssets, setPublicAssets] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [sortBy, setSortBy] = useState('date_desc'); // Default sort

  // Fetch public assets (simplified for now, filters applied client-side)
  const fetchAssets = useCallback(async () => {
    setIsLoading(true);
    try {
      // Mock API call - filtering/sorting might happen here in real API
      const data = await getMockPublicAssets({ search: searchTerm }); 
      // Apply client-side sorting for mock
      let sortedData = [...(data || [])];
      if (sortBy === 'date_desc') {
        sortedData.sort((a, b) => new Date(b.created_at) - new Date(a.created_at));
      } else if (sortBy === 'date_asc') {
        sortedData.sort((a, b) => new Date(a.created_at) - new Date(b.created_at));
      } // Add popularity sort logic if needed (e.g., based on like_count)
      
      setPublicAssets(sortedData);
    } catch (error) {
      console.error("Error fetching public assets:", error);
      setPublicAssets([]); 
    } finally {
      setIsLoading(false);
    }
  }, [searchTerm, sortBy]); // Refetch if search term or sort order changes

  useEffect(() => {
    // Initial fetch or refetch when dependencies change
    const debounceFetch = setTimeout(() => {
        fetchAssets();
    }, 300); // Add a small debounce to search input

    return () => clearTimeout(debounceFetch);

  }, [fetchAssets]);

  return (
    <VStack spacing={6} align="stretch">
      <Box>
        <Heading size="lg">Explore Public Looks</Heading>
        <Text color="gray.500">Discover looks visualized by the community.</Text>
      </Box>

      {/* Filter/Sort Controls */}
      <HStack spacing={4} wrap="wrap"> {/* Allow wrapping on smaller screens */}
        <InputGroup maxW={{ base: '100%', md: '300px' }}>
          <InputLeftElement pointerEvents="none">
            <FaSearch color="gray.300" />
          </InputLeftElement>
          <Input 
            placeholder="Search by prompt..." 
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
          />
        </InputGroup>
        <Select 
          placeholder="Sort by..." 
          maxWidth={{ base: '100%', md: '200px' }} 
          value={sortBy}
          onChange={(e) => setSortBy(e.target.value)}
        >
          <option value="date_desc">Newest First</option>
          {/* <option value="popularity">Most Popular</option> */}
          <option value="date_asc">Oldest First</option>
        </Select>
        {/* Add other filters if needed */}
      </HStack>

      {isLoading ? (
        <Center py={10}>
          <Spinner size="xl" />
        </Center>
      ) : publicAssets.length > 0 ? (
        <SimpleGrid columns={{ base: 1, sm: 2, md: 3, lg: 4 }} spacing={6}> {/* Adjusted grid columns */}
          {publicAssets.map((asset) => (
            <StyleCard 
              key={asset.id} 
              style={asset} 
            />
          ))}
        </SimpleGrid>
      ) : (
         <Center py={10}>
            <Text color="gray.500">No public looks found matching your criteria.</Text>
         </Center>
      )}
    </VStack>
  );
} 