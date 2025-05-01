import React, { useState, useEffect, useCallback } from 'react';
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
} from '@chakra-ui/react';
import { FaSearch } from 'react-icons/fa'; // Add search icon
// Corrected import paths
import StyleCard from '../components/Styles/StyleCard';
// Use mock data function for assets
import { getMockAssets } from '../data/mockData'; 

export default function GenerationsPage() {
  const [assets, setAssets] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [sortBy, setSortBy] = useState('date_desc'); // Default sort
  // Add state for filtering if needed, e.g., by base garment
  // const [filterByGarment, setFilterByGarment] = useState(''); 
  const navigate = useNavigate();

  // Fetch assets, potentially filtering/sorting client-side for mock data
  const fetchAssets = useCallback(async () => {
    setIsLoading(true);
    try {
      // Pass filter/sort params if the mock/API supports them
      // For now, fetching all workspace assets
      const data = await getMockAssets({ 
        // workspaceId: currentWorkspaceId, // Need to get this from context/state later
        // Add other potential params like liked:true for a liked page
      }); 

      // Client-side filtering/sorting for mock data
      let filteredData = [...(data || [])];

      // Filter by search term (prompt)
      if (searchTerm) {
        filteredData = filteredData.filter(asset => 
          asset.prompt?.toLowerCase().includes(searchTerm.toLowerCase())
        );
      }
      
      // --- Add garment filtering logic here if needed --- 
      // Example: 
      // if (filterByGarment) {
      //   filteredData = filteredData.filter(asset => asset.product_id === filterByGarment);
      // }

      // Sort data
      if (sortBy === 'date_desc') {
        filteredData.sort((a, b) => new Date(b.created_at) - new Date(a.created_at));
      } else if (sortBy === 'date_asc') {
        filteredData.sort((a, b) => new Date(a.created_at) - new Date(b.created_at));
      } 
      // Add name sort if needed (asset API doesn't have name, maybe sort by prompt?)
      // else if (sortBy === 'name_asc') {
      //   filteredData.sort((a, b) => a.prompt.localeCompare(b.prompt));
      // }

      setAssets(filteredData);
    } catch (error) {
      console.error("Error fetching assets:", error);
      setAssets([]); 
    } finally {
      setIsLoading(false);
    }
  // Add filterByGarment to dependencies if implemented
  }, [searchTerm, sortBy]); 

  // Fetch on mount and when filters/sort change
  useEffect(() => {
    const debounceFetch = setTimeout(() => {
        fetchAssets();
    }, 300); // Debounce search
    return () => clearTimeout(debounceFetch);
  }, [fetchAssets]);

  const handleVisualizeClick = () => {
    navigate('/app/create-style'); // Correct navigation path
  };

  return (
    <VStack spacing={6} align="stretch">
      <HStack justifyContent="space-between">
        <Box>
          <Heading size="lg">My Looks</Heading>
          <Text color="gray.500">View and manage your visualized looks.</Text>
        </Box>
        <Button colorScheme="blue" onClick={handleVisualizeClick}>Visualize New Look</Button>
      </HStack>

      {/* Filter/Sort Controls */}
      <HStack spacing={4} wrap="wrap"> 
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
            <option value="date_asc">Oldest First</option>
        </Select>
      </HStack>

      {isLoading ? (
          <Center py={10}>
            <Spinner size="xl" />
          </Center>
      ) : assets.length > 0 ? (
          <SimpleGrid columns={{ base: 1, sm: 2, md: 3, lg: 4 }} spacing={6}> {/* Adjusted grid columns */}
            {assets.map((asset) => (
              <StyleCard 
                key={asset.id} 
                style={asset}
              />
            ))}
          </SimpleGrid>
      ) : (
          <Center py={10}>
            <Text color="gray.500">No looks visualized yet. Click 'Visualize New Look' to start.</Text>
          </Center>
      )}
    </VStack>
  );
} 