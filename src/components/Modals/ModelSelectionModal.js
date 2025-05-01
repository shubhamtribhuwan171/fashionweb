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
  Input,
  InputGroup,
  InputLeftElement,
  Icon,
} from '@chakra-ui/react';
import { FiSearch } from 'react-icons/fi';
// Correct import path
import { getMockModels } from '../../data/mockData';

const ModelCard = ({ model, onSelect, isSelected }) => {
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
      onClick={() => onSelect(model)}
      borderColor={isSelected ? selectedBorderColor : 'transparent'}
      boxShadow={isSelected ? 'outline' : 'md'}
      transition="all 0.2s"
      _hover={{ transform: 'scale(1.03)', shadow: 'lg' }}
    >
      <Image src={model.imageUrl} alt={model.name} borderRadius="md" mb={3} objectFit="cover" boxSize="150px" mx="auto" />
      <VStack align="start" spacing={1}>
        <Text fontWeight="bold" fontSize="lg">{model.name}</Text>
        {/* Display relevant details from mock if available */}
        {/* <Text fontSize="sm" color={useColorModeValue('gray.600', 'gray.400')}>
          Age: {model.age} | Ethnicity: {model.ethnicity}
        </Text> */}
        {/* <HStack spacing={1} wrap="wrap">
            {model.tags?.map(tag => <Tag size="sm" key={tag} colorScheme="teal">{tag}</Tag>)} 
        </HStack> */}
      </VStack>
    </Box>
  );
};

const ModelSelectionModal = ({ isOpen, onClose, onSelectModel }) => {
  const [models, setModels] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState(null);
  const [selectedModelInternal, setSelectedModelInternal] = useState(null);
  const [searchTerm, setSearchTerm] = useState('');

  // Filters (placeholders, add state if needed)
  // const [ethnicityFilter, setEthnicityFilter] = useState('');
  // const [ageFilter, setAgeFilter] = useState(''); 

  const bgColor = useColorModeValue('gray.50', 'gray.800');
  const headerBg = useColorModeValue('white', 'gray.800');
  const footerBg = useColorModeValue('white', 'gray.800');

  useEffect(() => {
    const fetchModels = async () => {
      setIsLoading(true);
      setError(null);
      try {
        const fetchedModels = await getMockModels();
        setModels(fetchedModels || []); // Ensure it's an array
      } catch (err) {
        console.error("Error fetching models:", err);
        setError('Failed to load models.');
        setModels([]); // Clear on error
      } finally {
        setIsLoading(false);
      }
    };

    if (isOpen) {
        fetchModels();
        setSelectedModelInternal(null); // Reset selection when modal opens
    }
  }, [isOpen]);

  // Placeholder filter logic
  const filteredModels = useMemo(() => {
    // Add filtering logic here based on state variables like ethnicityFilter, ageFilter
    return models.filter(model => 
      model.name.toLowerCase().includes(searchTerm.toLowerCase())
    );
  }, [models, searchTerm]); // Add filter states to dependency array if implemented

  const handleSelect = (model) => {
      setSelectedModelInternal(model);
  }

  const handleConfirmSelection = () => {
    if (selectedModelInternal) {
        onSelectModel(selectedModelInternal);
        onClose();
    }
  };

  return (
    <Modal isOpen={isOpen} onClose={onClose} size="3xl" scrollBehavior="inside" isCentered>
      <ModalOverlay />
      <ModalContent borderRadius="xl">
        <ModalHeader 
          fontSize="lg" 
          fontWeight="semibold"
          borderBottomWidth="1px"
          borderColor="gray.100"
          py={4} px={6}
        >
          Select Model
        </ModalHeader>
        <ModalCloseButton top={4} right={4} />
        <ModalBody pt={4} pb={6} px={6}>
           <InputGroup mb={5}>
                <InputLeftElement pointerEvents="none">
                    <Icon as={FiSearch} color="gray.400" />
                </InputLeftElement>
                <Input 
                    placeholder="Search models..." 
                    value={searchTerm} 
                    onChange={(e) => setSearchTerm(e.target.value)} 
                    borderRadius="md"
                />
           </InputGroup>
          {isLoading ? (
            <Center py={5}>
              <Spinner size="xl" />
            </Center>
          ) : error ? (
             <Center py={5}>
               <Text color="red.500">{error}</Text>
             </Center>
          ) : filteredModels.length > 0 ? (
            <SimpleGrid columns={{ base: 2, sm: 3, md: 4 }} spacing={5}>
              {filteredModels.map((model) => (
                <ModelCard
                  key={model.id}
                  model={model}
                  onSelect={handleSelect}
                  isSelected={selectedModelInternal?.id === model.id}
                />
              ))}
            </SimpleGrid>
          ) : (
             <Center py={5}><Text>No items found{searchTerm ? ' matching "' + searchTerm + '"' : ''}.</Text></Center>
          )}
        </ModalBody>

        <ModalFooter borderTopWidth="1px" bg={footerBg}>
          <Button variant="ghost" mr={3} onClick={onClose}>Cancel</Button>
          <Button colorScheme="blue" onClick={handleConfirmSelection} isDisabled={!selectedModelInternal}>
            Select Model
          </Button>
        </ModalFooter>
      </ModalContent>
    </Modal>
  );
};

export default ModelSelectionModal; 