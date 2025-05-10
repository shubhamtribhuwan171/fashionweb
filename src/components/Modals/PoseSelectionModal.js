import React, { useState, useEffect, useCallback, useMemo } from 'react';
import {
  Modal,
  ModalOverlay,
  ModalContent,
  ModalHeader,
  ModalBody,
  ModalCloseButton,
  SimpleGrid,
  Button,
  Text,
  Box,
  Input, 
  InputGroup,
  InputLeftElement,
  Center,
  Icon,
  Image,
  useToast,
  Spinner,
  Alert,
  AlertIcon,
  ModalFooter,
  Tabs, TabList, Tab, TabPanel,
  Flex
} from '@chakra-ui/react';
import { FiSearch } from 'react-icons/fi';
import axios from 'axios';
import PoseCard from '../Poses/PoseCard';

// TODO: Move to config
const API_BASE_URL = 'https://productmarketing-ai-f0e989e4e1ad.herokuapp.com';
// TODO: Replace with actual workspace ID from context/state management
const getMockWorkspaceId = () => '95d29ad4-47fa-48ee-85cb-cbf762eb400a';
const GLOBAL_WORKSPACE_ID = '11111111-2222-3333-4444-555555555555'; // Added Global Workspace ID

// Remove mock data
// const mockPoses = [...];

export default function PoseSelectionModal({ isOpen, onClose, onSelectPose }) {
  const toast = useToast();
  const [searchTerm, setSearchTerm] = useState('');
  const [poses, setPoses] = useState([]); // State for fetched poses
  const [selectedPoseInternal, setSelectedPoseInternal] = useState(null); 
  const [isLoading, setIsLoading] = useState(false); // Add loading state
  const [error, setError] = useState(null); // Add error state
  const [tabIndex, setTabIndex] = useState(0); // For controlling tabs
  const currentWorkspaceId = getMockWorkspaceId();

  // Auth Helper
  const getAuthConfig = useCallback(() => {
    const token = localStorage.getItem('authToken');
    if (!token) {
      toast({ title: "Authentication Error", description: "Please log in.", status: "error", duration: 3000 });
      return null;
    }
    return { headers: { Authorization: `Bearer ${token}` } };
  }, [toast]);

  // Fetch Poses
  const fetchPoses = useCallback(async () => {
    setIsLoading(true);
    setError(null);
    const config = getAuthConfig();
    if (!currentWorkspaceId || !config) {
      setError("Workspace ID or Authentication missing.");
      setIsLoading(false);
      setPoses([]);
      return;
    }

    try {
      const [privateRes, publicRes] = await Promise.all([
        axios.get(`${API_BASE_URL}/api/poses`, { ...config, params: { workspaceId: currentWorkspaceId } }),
        axios.get(`${API_BASE_URL}/api/poses`, { ...config, params: { workspaceId: GLOBAL_WORKSPACE_ID } })
      ]);
      const privatePoses = (privateRes.data || []).map(p => ({ ...p, visibility: 'private' }));
      const publicPoses = (publicRes.data || []).map(p => ({ ...p, visibility: 'public' }));
      setPoses([...privatePoses, ...publicPoses]);
    } catch (err) {
      console.error("Error fetching poses:", err);
      const errorMsg = err.response?.data?.message || "Failed to load poses";
      setError(errorMsg);
      setPoses([]);
      // Toast might be excessive here if modal stays open, rely on Alert
      // toast({ title: "Error Loading Poses", description: errorMsg, status: "error", duration: 3000 });
    } finally {
      setIsLoading(false);
    }
  }, [currentWorkspaceId, getAuthConfig]);

  // Fetch when modal opens
  useEffect(() => {
    if (isOpen) {
        setSelectedPoseInternal(null); // Reset internal selection
        setSearchTerm(''); // Reset search
        fetchPoses(); // Fetch data
    }
  }, [isOpen, fetchPoses]);

  const handleSelect = (pose) => {
    setSelectedPoseInternal(pose); // Store the whole pose object temporarily
  };

  const handleConfirmSelection = () => {
    if (selectedPoseInternal) {
        onSelectPose(selectedPoseInternal.id); // Pass only the ID back
        onClose(); 
    }
  };

  // Filter based on fetched poses
  const filteredPoses = useMemo(() => {
    return poses.filter(pose => 
      (pose.name || 'Unnamed Pose').toLowerCase().includes(searchTerm.toLowerCase()) &&
      (tabIndex === 0 || 
       (tabIndex === 1 && pose.visibility === 'public') || 
       (tabIndex === 2 && pose.visibility === 'private'))
    );
  }, [poses, searchTerm, tabIndex]);

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
          Select Pose
        </ModalHeader>
        <ModalCloseButton top={4} right={4} />
        <ModalBody pt={4} pb={6} px={6}>
          <Flex mb={5} justifyContent="space-between" alignItems="center" wrap="wrap" gap={4}>
            {/* Tabs on the left */}
            <Tabs onChange={(index) => setTabIndex(index)} variant="soft-rounded" colorScheme="purple" flexShrink={0}>
              <TabList>
                <Tab>All</Tab>
                <Tab>Public</Tab>
                <Tab>Private</Tab>
              </TabList>
            </Tabs>

            {/* Search input on the right */}
            <InputGroup maxW="300px" minW="200px" flexGrow={1} justifyContent="flex-end">
              <InputLeftElement pointerEvents="none">
                <Icon as={FiSearch} color="gray.400" />
              </InputLeftElement>
              <Input 
                placeholder="Search poses..." 
                value={searchTerm} 
                onChange={(e) => setSearchTerm(e.target.value)} 
                borderRadius="md"
              />
            </InputGroup>
          </Flex>
          
          {isLoading ? (
            <Center py={5}><Spinner /></Center> // Show spinner when loading
          ) : error ? (
            <Alert status="error"> {/* Show error message */}
              <AlertIcon />
              {error}
            </Alert>
          ) : filteredPoses.length > 0 ? (
            // Use SimpleGrid and map PoseCard
            <SimpleGrid columns={{ base: 2, sm: 3, md: 4, lg: 5 }} spacing={4}> 
              {filteredPoses.map((pose) => (
                <Box 
                  key={pose.id} 
                  onClick={() => handleSelect(pose)} 
                  borderWidth="2px" // Use border to indicate selection
                  borderRadius="lg"
                  borderColor={selectedPoseInternal?.id === pose.id ? 'purple.400' : 'transparent'}
                  cursor="pointer"
                  _hover={{ shadow: 'md' }}
                  overflow="hidden" // Ensure PoseCard fits
                >
                  {/* PoseCard doesn't need onDelete here */}
                  <PoseCard pose={pose} /> 
                </Box>
              ))}
            </SimpleGrid>
          ) : (
             <Center py={5}>
               <Text>
                {searchTerm 
                  ? "No poses match your current filters."
                  : tabIndex === 1 ? "No public poses available."
                  : tabIndex === 2 ? "No private poses available."
                  : "No poses available."}
               </Text>
             </Center>
          )}
        </ModalBody>
        <ModalFooter borderTopWidth="1px" borderColor="gray.100" px={6} py={4}>
          <Button variant="ghost" mr={3} onClick={onClose}>Cancel</Button>
          {/* Apply futuristic style to Select button */}
          <Button 
            onClick={handleConfirmSelection} // Use confirmation handler
            isDisabled={!selectedPoseInternal} // Check internal state
            // Apply gradient style
            bgGradient="linear(to-r, teal.400, purple.500, blue.500)"
            color="white"
            fontWeight="semibold"
            _hover={{
              bgGradient: "linear(to-r, teal.500, purple.600, blue.600)",
              boxShadow: "lg",
              transform: "translateY(-3px) scale(1.03)",
            }}
            _active={{
              bgGradient: "linear(to-r, teal.600, purple.700, blue.700)",
              transform: "translateY(-1px) scale(1.00)"
            }}
            boxShadow="md"
            transition="all 0.25s cubic-bezier(.08,.52,.52,1)"
            borderRadius="md"
          >
            Select Pose
          </Button>
        </ModalFooter>
      </ModalContent>
    </Modal>
  );
} 