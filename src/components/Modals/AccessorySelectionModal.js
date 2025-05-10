import React, { useState, useEffect, useMemo, useCallback } from 'react';
import {
  Modal,
  ModalOverlay,
  ModalContent,
  ModalHeader,
  ModalFooter,
  ModalBody,
  ModalCloseButton,
  Button,
  SimpleGrid,
  Box,
  Image,
  Text,
  VStack,
  HStack,
  Select,
  Tag,
  Spinner,
  Center,
  useColorModeValue,
  Checkbox,
  Input,
  InputGroup,
  InputLeftElement,
  Icon,
  useToast,
  Flex,
  AspectRatio,
  Tabs, TabList, Tab, TabPanel
} from '@chakra-ui/react';
import { FiSearch } from 'react-icons/fi';
import axios from 'axios';

// TODO: Move to config
const API_BASE_URL = 'https://productmarketing-ai-f0e989e4e1ad.herokuapp.com';

// TODO: Replace with actual workspace ID from context/state management
const getMockWorkspaceId = () => '95d29ad4-47fa-48ee-85cb-cbf762eb400a';

// Define accessory categories (match API documentation)
const ACCESSORY_CATEGORIES = ['hats', 'bags', 'jewelry', 'shoes', 'scarves', 'other'];

// Card component specifically for multi-selection within the modal
const SelectableAccessoryCard = ({ accessory, onSelect, isSelected }) => {
  const cardBg = useColorModeValue('white', 'gray.700');
  const selectedBorderColor = useColorModeValue('blue.500', 'blue.300');
  const imageUrl = accessory.storage_url || 'https://via.placeholder.com/120?text=Acc';

  return (
    <Box
      borderWidth={isSelected ? "2px" : "1px"}
      borderRadius="lg"
      overflow="hidden"
      bg={cardBg}
      cursor="pointer"
      onClick={() => onSelect(accessory.id, !isSelected)}
      borderColor={isSelected ? selectedBorderColor : 'transparent'}
      boxShadow={isSelected ? 'outline' : 'sm'}
      transition="all 0.2s ease-in-out"
      _hover={{ shadow: 'md', borderColor: isSelected ? selectedBorderColor : 'gray.300' }}
      position="relative"
    >
       <Checkbox
        position="absolute"
        top={1}
        right={1}
        isChecked={isSelected}
        onChange={(e) => {
            e.stopPropagation(); // Prevent card click
            onSelect(accessory.id, e.target.checked);
        }}
        colorScheme="blue"
        size="lg"
        aria-label={`Select ${accessory.name || 'accessory'}`}
      />
      <AspectRatio ratio={1}>
        <Box p={2}> {/* Padding around image */} 
            <Image 
                src={imageUrl} 
                alt={accessory.name || 'Accessory'} 
                objectFit="contain" // Use contain for accessories 
                boxSize="100%" // Let AspectRatio control size
            />
        </Box>
      </AspectRatio>
      <Box p={2} textAlign="center">
        <Text fontSize="xs" fontWeight="medium" noOfLines={1}>{accessory.name || 'Untitled'}</Text>
        <Tag size="xs" colorScheme="cyan" mt={1}>{accessory.category}</Tag>
      </Box>
    </Box>
  );
};

const AccessorySelectionModal = ({ isOpen, onClose, onSelectAccessories, initialSelectedIds = [] }) => {
  const [accessories, setAccessories] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState(null);
  const [selectedAccessoryIds, setSelectedAccessoryIds] = useState(new Set(initialSelectedIds));
  const [searchTerm, setSearchTerm] = useState('');
  const [filterCategory, setFilterCategory] = useState('');
  const [tabIndex, setTabIndex] = useState(0);
  const toast = useToast();
  const currentWorkspaceId = getMockWorkspaceId();
  const GLOBAL_WORKSPACE_ID = '11111111-2222-3333-4444-555555555555';

  const bgColor = useColorModeValue('gray.50', 'gray.800');
  const headerBg = useColorModeValue('white', 'gray.800');
  const footerBg = useColorModeValue('white', 'gray.800');

  const getAuthConfig = useCallback(() => {
    const token = localStorage.getItem('authToken');
    if (!token) {
        toast({ title: "Authentication Error", description: "Please log in.", status: "error" });
        return null;
    }
    return { headers: { Authorization: `Bearer ${token}` } };
  }, [toast]);

  const fetchAccessoriesForModal = useCallback(async (category = '') => {
    setIsLoading(true);
    setError(null);
    const config = getAuthConfig();
    if (!currentWorkspaceId || !config) {
      setError("Workspace ID or Authentication missing.");
      setIsLoading(false);
      setAccessories([]);
      return;
    }

    const params = {};
    if (category) {
      params.category = category;
    }

    try {
      const [privateRes, publicRes] = await Promise.all([
        axios.get(`${API_BASE_URL}/api/accessory-images`, { ...config, params: { ...params, workspaceId: currentWorkspaceId } }),
        axios.get(`${API_BASE_URL}/api/accessory-images`, { ...config, params: { ...params, workspaceId: GLOBAL_WORKSPACE_ID } })
      ]);
      const privateAccessories = (privateRes.data || []).map(a => ({ ...a, visibility: 'private' }));
      const publicAccessories = (publicRes.data || []).map(a => ({ ...a, visibility: 'public' }));
      setAccessories([...privateAccessories, ...publicAccessories]);
    } catch (err) {
      console.error("Error fetching accessories for modal:", err);
      const errorMsg = err.response?.data?.message || "Failed to load accessories";
      setError(errorMsg);
      setAccessories([]);
      toast({ title: "Error Loading Accessories", description: errorMsg, status: "error", duration: 3000 });
    } finally {
      setIsLoading(false);
    }
  }, [currentWorkspaceId, getAuthConfig, toast]);

  useEffect(() => {
    if (isOpen) {
        fetchAccessoriesForModal(filterCategory);
    }
  }, [isOpen, initialSelectedIds, fetchAccessoriesForModal, filterCategory]);

  const filteredAccessories = useMemo(() => {
    return accessories.filter(acc => 
        (acc.name || 'Untitled').toLowerCase().includes(searchTerm.toLowerCase()) &&
        (!filterCategory || acc.category === filterCategory) &&
        (tabIndex === 0 || 
         (tabIndex === 1 && acc.visibility === 'public') || 
         (tabIndex === 2 && acc.visibility === 'private'))
    );
  }, [accessories, searchTerm, filterCategory, tabIndex]);

  const handleSelect = (accessoryId, shouldSelect) => {
      setSelectedAccessoryIds(prevIds => {
          const newIds = new Set(prevIds);
          if (shouldSelect) {
              newIds.add(accessoryId);
          } else {
              newIds.delete(accessoryId);
          }
          return newIds;
      });
  }

  const handleConfirmSelection = () => {
      const selectedIdsArray = Array.from(selectedAccessoryIds);
      const selectedFullAccessories = accessories.filter(acc => selectedIdsArray.includes(acc.id));
      onSelectAccessories(selectedFullAccessories);
      onClose();
  }

  return (
    <Modal isOpen={isOpen} onClose={onClose} size="4xl" scrollBehavior="inside" isCentered>
      <ModalOverlay />
      <ModalContent borderRadius="xl" maxH="85vh">
        <ModalHeader 
          fontSize="lg" 
          fontWeight="semibold"
          borderBottomWidth="1px"
          borderColor="gray.100"
          py={4} px={6}
        >
          Select Accessories
        </ModalHeader>
        <ModalCloseButton top={4} right={4} />
        <ModalBody pt={4} pb={6} px={6} overflowY="auto">
          <Flex mb={5} justifyContent="space-between" alignItems="center" wrap="wrap" gap={4}>
            {/* Tabs on the left */}
            <Tabs onChange={(index) => setTabIndex(index)} variant="soft-rounded" colorScheme="purple" flexShrink={0}>
              <TabList>
                <Tab>All</Tab>
                <Tab>Public</Tab>
                <Tab>Private</Tab>
              </TabList>
            </Tabs>

            {/* Search and Filter on the right */}
            <Flex gap={4} wrap="wrap" justifyContent="flex-end" flexGrow={1}>
              <InputGroup maxW="250px" minW="200px"> 
                <InputLeftElement pointerEvents="none">
                  <Icon as={FiSearch} color="gray.400" />
                </InputLeftElement>
                <Input 
                  placeholder="Search accessories by name..." 
                  value={searchTerm} 
                  onChange={(e) => setSearchTerm(e.target.value)} 
                  borderRadius="md"
                />
              </InputGroup>
              <Select 
                placeholder="Filter by Category" 
                value={filterCategory}
                onChange={(e) => setFilterCategory(e.target.value)}
                borderRadius="md"
                maxW="200px"
              >
                <option value="">All Categories</option>
                {ACCESSORY_CATEGORIES.map(cat => (
                  <option key={cat} value={cat}>{cat.charAt(0).toUpperCase() + cat.slice(1)}</option>
                ))}
              </Select>
            </Flex>
          </Flex>

          {isLoading ? (
            <Center py={5}><Spinner size="xl" /></Center>
          ) : error ? (
             <Center py={5}><Text color="red.500">{error}</Text></Center>
          ) : filteredAccessories.length > 0 ? (
            <SimpleGrid columns={{ base: 2, sm: 3, md: 4, lg: 5 }} spacing={4}>
              {filteredAccessories.map((acc) => (
                <SelectableAccessoryCard
                  key={acc.id}
                  accessory={acc}
                  onSelect={handleSelect}
                  isSelected={selectedAccessoryIds.has(acc.id)}
                />
              ))}
            </SimpleGrid>
          ) : (
             <Center py={5}>
                 <Text>
                    {(() => {
                        if (searchTerm || filterCategory) return "No accessories match your current filters.";
                        if (tabIndex === 1) return "No public accessories available.";
                        if (tabIndex === 2) return "No private accessories available.";
                        return "No accessories available.";
                    })()}
                 </Text>
             </Center>
          )}
        </ModalBody>
        <ModalFooter borderTopWidth="1px" bg={footerBg}>
          <Text mr="auto" fontSize="sm" color={useColorModeValue('gray.600', 'gray.400')}>
            {selectedAccessoryIds.size} selected
          </Text>
          <Button variant="ghost" mr={3} onClick={onClose}>Cancel</Button>
          <Button 
            colorScheme="purple"
            onClick={handleConfirmSelection}
          >
            Confirm Selection ({selectedAccessoryIds.length})
          </Button>
        </ModalFooter>
      </ModalContent>
    </Modal>
  );
};

export default AccessorySelectionModal; 