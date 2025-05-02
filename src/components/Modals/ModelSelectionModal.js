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
  Input,
  InputGroup,
  InputLeftElement,
  Icon,
  useToast,
  AspectRatio,
} from '@chakra-ui/react';
import { FiSearch } from 'react-icons/fi';
import axios from 'axios';
import ModelCard from '../../components/Models/ModelCard';

// TODO: Move to config
const API_BASE_URL = 'https://productmarketing-ai-f0e989e4e1ad.herokuapp.com';

// TODO: Replace with actual workspace ID from context/state management
const getMockWorkspaceId = () => '95d29ad4-47fa-48ee-85cb-cbf762eb400a';

const ModelSelectionModal = ({ isOpen, onClose, onSelectModel }) => {
  const [models, setModels] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState(null);
  const [selectedModelInternal, setSelectedModelInternal] = useState(null);
  const [searchTerm, setSearchTerm] = useState('');
  const toast = useToast();
  const currentWorkspaceId = getMockWorkspaceId();

  // Filters (placeholders, add state if needed)
  // const [ethnicityFilter, setEthnicityFilter] = useState('');
  // const [ageFilter, setAgeFilter] = useState(''); 

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

  const fetchModelsForModal = useCallback(async () => {
    setIsLoading(true);
    setError(null);
    const config = getAuthConfig();
    if (!currentWorkspaceId || !config) {
        setError("Workspace ID or Authentication missing.");
        setIsLoading(false);
        setModels([]);
        return;
    }

    try {
      const response = await axios.get(`${API_BASE_URL}/api/model-images`, {
        ...config,
        params: { workspaceId: currentWorkspaceId }
      });
      setModels(response.data || []);
    } catch (err) {
      console.error("Error fetching models for modal:", err);
      const errorMsg = err.response?.data?.message || "Failed to load models";
      setError(errorMsg);
      setModels([]);
      toast({ title: "Error Loading Models", description: errorMsg, status: "error", duration: 3000 });
    } finally {
      setIsLoading(false);
    }
  }, [currentWorkspaceId, getAuthConfig, toast]);

  useEffect(() => {
    if (isOpen) {
        fetchModelsForModal();
        setSelectedModelInternal(null);
    }
  }, [isOpen, fetchModelsForModal]);

  const filteredModels = useMemo(() => {
    return models.filter(model => 
      (model.name || 'Untitled Model').toLowerCase().includes(searchTerm.toLowerCase())
    );
  }, [models, searchTerm]); 

  const handleSelect = (model) => {
      setSelectedModelInternal(model);
  }

  const handleConfirmSelection = () => {
    if (selectedModelInternal) {
        onSelectModel(selectedModelInternal);
        onClose();
    }
  };

  const SelectableModelCard = ({ model, onSelect, isSelected }) => {
    const cardBg = useColorModeValue('white', 'gray.700');
    const selectedBorderColor = useColorModeValue('blue.500', 'blue.300');
    const imageUrl = model.storage_url || 'https://via.placeholder.com/150?text=Model';

    return (
      <Box
        borderWidth={isSelected ? "2px" : "1px"}
        borderRadius="lg"
        overflow="hidden"
        bg={cardBg}
        cursor="pointer"
        onClick={() => onSelect(model)}
        borderColor={isSelected ? selectedBorderColor : 'transparent'}
        boxShadow={isSelected ? 'outline' : 'sm'}
        transition="all 0.2s ease-in-out"
        _hover={{ shadow: 'md', borderColor: isSelected ? selectedBorderColor : 'gray.300' }}
      >
        <AspectRatio ratio={1}>
           <Box>
            <Image 
              src={imageUrl} 
              alt={model.name || 'Model'} 
              objectFit="cover" 
            />
           </Box>
        </AspectRatio>
        <Box p={2} textAlign="center">
          <Text fontSize="xs" fontWeight="medium" noOfLines={1}>{model.name || 'Untitled Model'}</Text>
        </Box>
      </Box>
    );
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
                    placeholder="Search models by name..." 
                    value={searchTerm} 
                    onChange={(e) => setSearchTerm(e.target.value)} 
                    borderRadius="md"
                />
           </InputGroup>
          {isLoading ? (
            <Center py={5}><Spinner size="xl" /></Center>
          ) : error ? (
             <Center py={5}><Text color="red.500">{error}</Text></Center>
          ) : filteredModels.length > 0 ? (
            <SimpleGrid columns={{ base: 2, sm: 3, md: 4, lg: 5 }} spacing={4}> 
              {filteredModels.map((model) => (
                <SelectableModelCard
                  key={model.id}
                  model={model}
                  onSelect={handleSelect}
                  isSelected={selectedModelInternal?.id === model.id}
                />
              ))}
            </SimpleGrid>
          ) : (
             <Center py={5}><Text>No models found{searchTerm ? ' matching "' + searchTerm + '"' : ''}.</Text></Center>
          )}
        </ModalBody>

        <ModalFooter borderTopWidth="1px" bg={footerBg}>
          <Button variant="ghost" mr={3} onClick={onClose}>Cancel</Button>
          <Button 
            colorScheme="purple"
            onClick={handleConfirmSelection}
            isDisabled={!selectedModelInternal}
          >
            Select Model
          </Button>
        </ModalFooter>
      </ModalContent>
    </Modal>
  );
};

export default ModelSelectionModal; 