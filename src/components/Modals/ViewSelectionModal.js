import React, { useState, useEffect } from 'react';
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
  // useRadio, // No longer using radio
  // useRadioGroup, // No longer using radio group
  Text,
  Icon,
  Spinner,
  Center,
  Checkbox, // Added Checkbox
  useColorModeValue, // Added for styling
  Input,
  InputGroup,
  InputLeftElement,
} from '@chakra-ui/react';
import { getMockViews } from '../../data/mockData';
import { FiCamera, FiSearch } from 'react-icons/fi';

// Updated Card to use Checkbox for multi-select
function ViewCard({ view, onSelect, isSelected }) {
  const cardBg = useColorModeValue('white', 'gray.700');
  const selectedBorderColor = useColorModeValue('blue.500', 'blue.300');

  return (
    <Box
      as="label" // Keep as label for accessibility with checkbox
      borderWidth="1px"
      borderRadius="lg"
      overflow="hidden"
      bg={cardBg}
      p={4}
      cursor="pointer"
      onClick={() => onSelect(view.id, !isSelected)} // Toggle selection on card click
      borderColor={isSelected ? selectedBorderColor : 'transparent'}
      boxShadow={isSelected ? 'outline' : 'md'}
      transition="all 0.2s"
      _hover={{ transform: 'scale(1.03)', shadow: 'lg' }}
      position="relative" // For checkbox positioning
      display="flex" // Use flex for layout
      flexDirection="column"
      alignItems="center"
      justifyContent="center"
      minH="150px" // Adjust height if needed
    >
       <Checkbox
        isChecked={isSelected}
        position="absolute"
        top={2}
        right={2}
        colorScheme="blue"
        onChange={(e) => {
            e.stopPropagation(); // Prevent card click when checkbox changes
            onSelect(view.id, e.target.checked);
        }}
        aria-label={`Select ${view.name}`}
      />
      <Icon as={FiCamera} boxSize={6} mb={2} />
      <Text fontSize="md" fontWeight="bold" textAlign="center">{view.name}</Text>
      <Text fontSize="sm" color="gray.500" textAlign="center">{view.description}</Text>
    </Box>
  );
}

// Updated Modal Component for multi-select
function ViewSelectionModal({ isOpen, onClose, onSelectViews, initialSelectedIds = [] }) {
  const [views, setViews] = useState([]);
  const [loading, setLoading] = useState(false);
  const [selectedViewIds, setSelectedViewIds] = useState(new Set(initialSelectedIds)); // Use Set for IDs
  const [allViews, setAllViews] = useState([]); // Keep a copy of all fetched views
  const [searchTerm, setSearchTerm] = useState('');

  // Fetch views asynchronously
  useEffect(() => {
    let isMounted = true;
    if (isOpen) {
      setLoading(true);
      getMockViews()
        .then(data => {
          if (isMounted) {
            const fetchedViews = data || [];
            setViews(fetchedViews);
            setAllViews(fetchedViews); // Store all views
            setSelectedViewIds(new Set(initialSelectedIds)); // Reset selection based on prop
          }
        })
        .catch(err => {
            console.error("Error fetching views for modal:", err);
             if (isMounted) {
                 setViews([]);
                 setAllViews([]);
             }
        })
        .finally(() => {
           if (isMounted) setLoading(false);
        });
    }
    return () => { isMounted = false; };
  }, [isOpen, initialSelectedIds]); // Re-run if initial IDs change

  // Handle selection/deselection of a view ID
  const handleSelect = (viewId, shouldSelect) => {
      setSelectedViewIds(prevIds => {
          const newIds = new Set(prevIds);
          if (shouldSelect) {
              newIds.add(viewId);
          } else {
              // Prevent removing the last selected view if needed (optional)
              // if (newIds.size > 1) {
              //    newIds.delete(viewId);
              // } else {
              //    // Maybe show a toast? "At least one view must be selected"
              // }
               newIds.delete(viewId); // Allow deselecting all for now
          }
          return newIds;
      });
  }

  // Confirm selection and pass back the array of full view objects
  const handleConfirmSelection = () => {
      const selectedIdsArray = Array.from(selectedViewIds);
      // Find the full view objects corresponding to the selected IDs
      const selectedFullViews = allViews.filter(view => selectedIdsArray.includes(view.id));
      onSelectViews(selectedFullViews); // Pass the array of objects back
      onClose();
  };

  const modalBg = useColorModeValue('gray.50', 'gray.800');
  const footerBg = useColorModeValue('white', 'gray.800');

  const filteredItems = views.filter(view => 
    view.name.toLowerCase().includes(searchTerm.toLowerCase())
  );

  return (
    <Modal isOpen={isOpen} onClose={onClose} size="4xl" scrollBehavior="inside" isCentered>
      <ModalOverlay />
      <ModalContent borderRadius="xl" bg={modalBg}>
        <ModalHeader 
          fontSize="lg" 
          fontWeight="semibold"
          borderBottomWidth="1px"
          borderColor="gray.100"
          py={4} px={6}
        >
          Select Camera Views (Choose one or more)
        </ModalHeader>
        <ModalCloseButton top={4} right={4} />
        <ModalBody pt={4} pb={6} px={6}>
           <InputGroup mb={5}>
                <InputLeftElement pointerEvents="none">
                    <Icon as={FiSearch} color="gray.400" />
                </InputLeftElement>
                <Input 
                    placeholder="Search views..." 
                    value={searchTerm} 
                    onChange={(e) => setSearchTerm(e.target.value)} 
                    borderRadius="md"
                />
           </InputGroup>
          {loading ? (
            <Center h="200px"><Spinner size="xl" /></Center>
          ) : filteredItems.length > 0 ? (
            <SimpleGrid columns={{ base: 2, sm: 3, md: 4 }} spacing={5}>
              {filteredItems.map((view) => (
                <ViewCard
                  key={view.id}
                  view={view}
                  onSelect={handleSelect}
                  isSelected={selectedViewIds.has(view.id)}
                />
              ))}
            </SimpleGrid>
          ) : (
             <Center py={5}><Text>No views found{searchTerm ? ' matching "' + searchTerm + '"' : ''}.</Text></Center>
          )}
        </ModalBody>

        <ModalFooter borderTopWidth="1px" bg={footerBg}>
          <Text mr="auto" fontSize="sm" color={useColorModeValue('gray.600', 'gray.400')}>
            {selectedViewIds.size} selected
          </Text>
          <Button variant="ghost" mr={3} onClick={onClose}>
            Cancel
          </Button>
          <Button
            colorScheme="purple"
            onClick={handleConfirmSelection}
            isDisabled={selectedViewIds.size === 0} // Disable if none selected
            >
            Confirm Views ({selectedViewIds.size})
          </Button>
        </ModalFooter>
      </ModalContent>
    </Modal>
  );
}

export default ViewSelectionModal;
