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
  CheckboxGroup,
  Checkbox,
  Stack,
  Flex,
  Wrap,
  WrapItem,
  Tabs, TabList, Tab, TabPanel
} from '@chakra-ui/react';
import { FiSearch } from 'react-icons/fi';
import axios from 'axios';
import ModelCard from '../../components/Models/ModelCard';

// TODO: Move to config
const API_BASE_URL = 'https://productmarketing-ai-f0e989e4e1ad.herokuapp.com';

// TODO: Replace with actual workspace ID from context/state management
const getMockWorkspaceId = () => '95d29ad4-47fa-48ee-85cb-cbf762eb400a';
const GLOBAL_WORKSPACE_ID = '11111111-2222-3333-4444-555555555555';

const ModelSelectionModal = ({ isOpen, onClose, onSelectModel }) => {
  const [models, setModels] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState(null);
  const [selectedModelInternal, setSelectedModelInternal] = useState(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedGenders, setSelectedGenders] = useState([]);
  const [selectedBodyTypes, setSelectedBodyTypes] = useState([]);
  const [tabIndex, setTabIndex] = useState(0);
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
      const [privateRes, publicRes] = await Promise.all([
        axios.get(`${API_BASE_URL}/api/model-images`, { ...config, params: { workspaceId: currentWorkspaceId } }),
        axios.get(`${API_BASE_URL}/api/model-images`, { ...config, params: { workspaceId: GLOBAL_WORKSPACE_ID } })
      ]);
      const privateModels = (privateRes.data || []).map(m => ({ ...m, visibility: 'private' }));
      const publicModels = (publicRes.data || []).map(m => ({ ...m, visibility: 'public' }));
      setModels([...privateModels, ...publicModels]);
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
      (model.name || 'Untitled Model').toLowerCase().includes(searchTerm.toLowerCase()) &&
      (selectedGenders.length === 0 || selectedGenders.includes(model.gender)) &&
      (selectedBodyTypes.length === 0 || selectedBodyTypes.includes(model.body_type)) &&
      (tabIndex === 0 || 
       (tabIndex === 1 && model.visibility === 'public') || 
       (tabIndex === 2 && model.visibility === 'private'))
    );
  }, [models, searchTerm, selectedGenders, selectedBodyTypes, tabIndex]); 

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
        <Image
          src={imageUrl}
          alt={model.name || 'Model'}
          objectFit="cover"
          objectPosition="top"
          width="100%"
          height="200px"
        />
        <Box p={2} textAlign="center">
          <Text fontSize="xs" fontWeight="medium" noOfLines={1}>{model.name || 'Untitled Model'}</Text>
        </Box>
      </Box>
    );
  };

  // derive filter options dynamically
  const genderOptions = useMemo(() => Array.from(new Set(models.map(m => m.gender).filter(Boolean))), [models]);
  const bodyTypeOptions = useMemo(() => Array.from(new Set(models.map(m => m.body_type).filter(Boolean))), [models]);

  return (
    <Modal isOpen={isOpen} onClose={onClose} size="6xl" scrollBehavior="inside" isCentered>
      <ModalOverlay />
      <ModalContent borderRadius="xl" maxW="90vw">
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
          <Flex direction={{ base: 'column', md: 'row' }} gap={6}>
            {/* Sidebar: Filters */}
            <Box flex={{ base: 'auto', md: '0 0 200px' }} pr={4} borderRight="1px solid" borderColor={useColorModeValue('gray.200','gray.600')}>
              <VStack align="start" spacing={6}>
                <Text fontSize="md" fontWeight="semibold">Filters</Text>
                {/* Gender Filter (clickable tags) */}
                <Box w="full">
                  <Text fontSize="sm" fontWeight="medium" mb={2}>Gender</Text>
                  <Wrap spacing={2}>
                    {genderOptions.map(g => (
                      <WrapItem key={g}>
                        <Tag
                          size="sm"
                          variant={selectedGenders.includes(g) ? 'solid' : 'outline'}
                          colorScheme="purple"
                          cursor="pointer"
                          onClick={() => {
                            if (selectedGenders.includes(g)) {
                              setSelectedGenders(prev => prev.filter(x => x !== g));
                            } else {
                              setSelectedGenders(prev => [...prev, g]);
                            }
                          }}
                        >
                          {g}
                        </Tag>
                      </WrapItem>
                    ))}
                  </Wrap>
                </Box>
                {/* Body Type Filter (clickable tags) */}
                <Box w="full">
                  <Text fontSize="sm" fontWeight="medium" mb={2}>Body Type</Text>
                  <Wrap spacing={2}>
                    {bodyTypeOptions.map(bt => (
                      <WrapItem key={bt}>
                        <Tag
                          size="sm"
                          variant={selectedBodyTypes.includes(bt) ? 'solid' : 'outline'}
                          colorScheme="teal"
                          cursor="pointer"
                          onClick={() => {
                            if (selectedBodyTypes.includes(bt)) {
                              setSelectedBodyTypes(prev => prev.filter(x => x !== bt));
                            } else {
                              setSelectedBodyTypes(prev => [...prev, bt]);
                            }
                          }}
                        >
                          {bt}
                        </Tag>
                      </WrapItem>
                    ))}
                  </Wrap>
                </Box>
              </VStack>
            </Box>
            {/* Left: Search and Model Cards */}
            <Box flex={{ base: 'auto', md: '0 0 40%' }} maxH={{ base: 'auto', md: '60vh' }} overflowY={{ md: 'auto' }}>
              <Tabs onChange={(index) => setTabIndex(index)} variant="soft-rounded" colorScheme="purple" mb={4}>
                <TabList>
                  <Tab>All</Tab>
                  <Tab>Public</Tab>
                  <Tab>Private</Tab>
                </TabList>
              </Tabs>
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
                <Center py={5}><Text color="red.500">Error: {error}</Text></Center>
              ) : filteredModels.length === 0 ? (
                <Center py={5}>
                  <Text>
                    {searchTerm || selectedGenders.length > 0 || selectedBodyTypes.length > 0 
                      ? "No models match your current filters."
                      : tabIndex === 1 ? "No public models available."
                      : tabIndex === 2 ? "No private models available."
                      : "No models available."
                    }
                  </Text>
                </Center>
              ) : (
                <SimpleGrid columns={{ base: 1, sm: 2, md: 2, lg:3 }} spacing={4}>
                  {filteredModels.map((model) => (
                    <SelectableModelCard
                      key={model.id}
                      model={model}
                      onSelect={handleSelect}
                      isSelected={selectedModelInternal?.id === model.id}
                    />
                  ))}
                </SimpleGrid>
              )}
            </Box>
            {/* Right: Preview Pane */}
            <Box flex={1} bg={bgColor} p={4} borderRadius="md" borderWidth="1px" borderColor={useColorModeValue('gray.200','gray.600')}>
              {selectedModelInternal ? (
                <VStack spacing={4} align="center">
                  <Image
                    src={selectedModelInternal.storage_url}
                    alt={selectedModelInternal.name || 'Model'}
                    objectFit="contain"
                    width="100%"
                    maxH="60vh"
                    borderRadius="md"
                  />
                  <Text fontSize="md" fontWeight="medium">{selectedModelInternal.name}</Text>
                </VStack>
              ) : (
                <Center h="100%">
                  <Text color="gray.500">Select a model to preview</Text>
                </Center>
              )}
            </Box>
          </Flex>
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