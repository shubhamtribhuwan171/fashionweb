import React, { useState, useEffect, useMemo } from 'react';
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
} from '@chakra-ui/react';
// Correct import path
import { getMockAccessories } from '../../data/mockData'; 

const AccessoryCard = ({ accessory, onSelect, isSelected }) => {
  const cardBg = useColorModeValue('white', 'gray.700');
  const selectedBorderColor = useColorModeValue('blue.500', 'blue.300');

  return (
    <Box
      borderWidth="1px"
      borderRadius="lg"
      overflow="hidden"
      bg={cardBg}
      p={4}
      cursor="pointer"
      onClick={() => onSelect(accessory.id, !isSelected)} // Pass ID and new state
      borderColor={isSelected ? selectedBorderColor : 'transparent'}
      boxShadow={isSelected ? 'outline' : 'md'}
      transition="all 0.2s"
      _hover={{ transform: 'scale(1.03)', shadow: 'lg' }}
      position="relative" // Needed for checkbox positioning
    >
      <Checkbox
        isChecked={isSelected}
        position="absolute"
        top={2}
        right={2}
        colorScheme="blue"
        onChange={(e) => {
            e.stopPropagation(); // Prevent card click when checkbox is clicked
            onSelect(accessory.id, e.target.checked);
        }}
        aria-label={`Select ${accessory.name}`}
      />
      <Image src={accessory.imageUrl} alt={accessory.name} borderRadius="md" mb={3} objectFit="cover" boxSize="120px" mx="auto" />
      <VStack align="start" spacing={1}>
        <Text fontWeight="bold" fontSize="md">{accessory.name}</Text>
        {/* Display relevant details if available */}
        {/* <Text fontSize="sm" color={useColorModeValue('gray.600', 'gray.400')}>
          Category: {accessory.category}
        </Text>
        <HStack spacing={1} wrap="wrap">
            {accessory.tags?.map(tag => <Tag size="sm" key={tag} colorScheme="purple">{tag}</Tag>)} 
        </HStack> */}
      </VStack>
    </Box>
  );
};

const AccessorySelectionModal = ({ isOpen, onClose, onSelectAccessories, initialSelectedIds = [] }) => {
  const [accessories, setAccessories] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState(null);
  const [selectedAccessoryIds, setSelectedAccessoryIds] = useState(new Set(initialSelectedIds));

  // Filters (placeholder)
  // const [categoryFilter, setCategoryFilter] = useState('');

  const bgColor = useColorModeValue('gray.50', 'gray.800');
  const headerBg = useColorModeValue('white', 'gray.800');
  const footerBg = useColorModeValue('white', 'gray.800');

  useEffect(() => {
    const fetchAccessories = async () => {
      setIsLoading(true);
      setError(null);
      try {
        const fetchedAccessories = await getMockAccessories();
        setAccessories(fetchedAccessories || []); // Ensure array
      } catch (err) {
        console.error("Error fetching accessories:", err);
        setError('Failed to load accessories.');
        setAccessories([]); // Clear on error
      } finally {
        setIsLoading(false);
      }
    };

    if (isOpen) {
        fetchAccessories();
        setSelectedAccessoryIds(new Set(initialSelectedIds)); // Reset selection based on prop when modal opens
    }
  }, [isOpen, initialSelectedIds]);

  // Placeholder filter logic
  const filteredAccessories = useMemo(() => {
    // Add filter logic here
    return accessories;
  }, [accessories]); // Add filter states to dependency array if implemented

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
      onSelectAccessories(selectedFullAccessories); // Pass array of selected accessory objects
      onClose();
  };

  return (
    <Modal isOpen={isOpen} onClose={onClose} size="4xl" scrollBehavior="inside">
      <ModalOverlay />
      <ModalContent bg={bgColor}>
        <ModalHeader borderBottomWidth="1px" bg={headerBg}>Select Accessories (Optional)</ModalHeader>
        <ModalCloseButton />
        <ModalBody pt={6}>
          {/* Filter Placeholder */}
          {/* <HStack spacing={4} mb={6}>
            <Select placeholder="Filter by Category" ... />
            <Button>Clear Filter</Button>
          </HStack> */}

          {isLoading ? (
            <Center h="200px">
              <Spinner size="xl" />
            </Center>
          ) : error ? (
             <Center h="200px">
               <Text color="red.500">{error}</Text>
             </Center>
          ) : (
            <SimpleGrid columns={{ base: 1, sm: 2, md: 3, lg: 4 }} spacing={5}>
              {filteredAccessories.length > 0 ? (
                   filteredAccessories.map((acc) => (
                    <AccessoryCard
                      key={acc.id}
                      accessory={acc}
                      onSelect={handleSelect}
                      isSelected={selectedAccessoryIds.has(acc.id)}
                    />
                  ))
              ) : (
                 <Text gridColumn="1 / -1" textAlign="center" py={10}>No accessories found.</Text>
              )} 
            </SimpleGrid>
          )}
        </ModalBody>

        <ModalFooter borderTopWidth="1px" bg={footerBg}>
          <Text mr="auto" fontSize="sm" color={useColorModeValue('gray.600', 'gray.400')}>
            {selectedAccessoryIds.size} selected
          </Text>
          <Button variant="ghost" mr={3} onClick={onClose}>Cancel</Button>
          <Button colorScheme="blue" onClick={handleConfirmSelection}>
            Confirm Selection
          </Button>
        </ModalFooter>
      </ModalContent>
    </Modal>
  );
};

export default AccessorySelectionModal; 