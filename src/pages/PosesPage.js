import React, { useState, useEffect, useCallback } from 'react';
import {
  Box,
  Heading,
  Button,
  SimpleGrid,
  Spinner,
  Alert,
  AlertIcon,
  useToast,
  Center,
  useDisclosure,
  Flex,
  Skeleton,
  VStack,
  Card,
  CardBody,
  Image,
  CardFooter,
  Link as ChakraLink,
  Text,
  AspectRatio,
  useColorModeValue,
  HStack,
  Tag,
  Tabs, TabList, TabPanels, Tab, TabPanel
} from '@chakra-ui/react';
import { FaPlus, FaTrash, FaEdit } from 'react-icons/fa';
import axios from 'axios';
import UploadPoseModal from '../components/Poses/UploadPoseModal';
import EditPoseModal from '../components/Poses/EditPoseModal';
import { usePageHeader } from '../components/Layout/DashboardLayout';
import { useNavigate, Link as RouterLink } from 'react-router-dom';

// TODO: Move to config or central place
const API_BASE_URL = 'https://productmarketing-ai-f0e989e4e1ad.herokuapp.com';

// TODO: Replace with actual workspace ID from context/state management
const getMockWorkspaceId = () => '95d29ad4-47fa-48ee-85cb-cbf762eb400a';

// Global workspace for built-in (public) poses
const GLOBAL_WORKSPACE_ID = '11111111-2222-3333-4444-555555555555';

// Skeleton Card Component (matches PoseCard structure)
const SkeletonPoseCard = () => (
  <Box borderWidth="1px" borderRadius="lg" overflow="hidden" p={3}>
    <Skeleton height="150px" />
    <VStack mt={2} spacing={1}>
        <Skeleton height="10px" width="80%" />
        <Skeleton height="20px" width="50%" />
    </VStack>
  </Box>
);

export default function PosesPage() {
  const { setHeader } = usePageHeader();
  const cardBg = useColorModeValue('white', 'gray.800');
  const textColor = useColorModeValue('gray.600', 'gray.400');
  const [poses, setPoses] = useState([]);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState(null);
  const [tabIndex, setTabIndex] = useState(0);
  const toast = useToast();
  const currentWorkspaceId = getMockWorkspaceId();
  const { isOpen: isUploadModalOpen, onOpen: onOpenUploadModal, onClose: onCloseUploadModal } = useDisclosure();
  const { isOpen: isEditModalOpen, onOpen: onOpenEditModal, onClose: onCloseEditModal } = useDisclosure();
  const [selectedPose, setSelectedPose] = useState(null);
  const numSkeletons = 12;
  const navigate = useNavigate();

  // Set Header
  useEffect(() => {
    setHeader('Poses', 'Manage reusable pose images.');
    return () => setHeader('', '');
  }, [setHeader]);

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
      // Fetch both private and public poses
      const [privateRes, publicRes] = await Promise.all([
        axios.get(`${API_BASE_URL}/api/poses`, {...config, params: { workspaceId: currentWorkspaceId }}),
        axios.get(`${API_BASE_URL}/api/poses`, {...config, params: { workspaceId: GLOBAL_WORKSPACE_ID }})
      ]);
      const privatePoses = privateRes.data || [];
      const publicPoses = publicRes.data || [];
      // Tag each with visibility
      setPoses([
        ...privatePoses.map(p => ({...p, visibility: 'private'})),
        ...publicPoses.map(p => ({...p, visibility: 'public'}))
      ]);
    } catch (err) {
      console.error("Error fetching poses:", err);
      const errorMsg = err.response?.data?.message || "Failed to load poses";
      setError(errorMsg);
      setPoses([]);
      toast({ title: "Error Loading Poses", description: errorMsg, status: "error", duration: 3000 });
    } finally {
      setIsLoading(false);
    }
  }, [currentWorkspaceId, getAuthConfig, toast]);

  useEffect(() => {
    fetchPoses();
  }, [fetchPoses]);

  // Handle Delete
  const handleDelete = async (poseId) => {
    if (!window.confirm('Are you sure you want to delete this pose image?')) return;
    
    const config = getAuthConfig();
    if (!config) return;

    // Optimistic UI update
    const originalPoses = [...poses];
    setPoses(prevPoses => prevPoses.filter(p => p.id !== poseId));

    try {
      await axios.delete(`${API_BASE_URL}/api/poses/${poseId}`, config);
      toast({ title: "Pose Deleted", status: "info", duration: 2000 });
    } catch (err) {
      console.error("Error deleting pose:", err);
      const errorMsg = err.response?.data?.message || "Failed to delete pose image";
      setError(errorMsg); // Show error in alert perhaps?
      toast({ title: "Delete Failed", description: errorMsg, status: "error", duration: 3000 });
      setPoses(originalPoses); // Revert UI on error
    }
  };

  // Callback for successful upload
  const handleUploadSuccess = () => {
    fetchPoses(); // Refresh the list
  };

  // Function to open the edit modal
  const handleEditClick = (pose) => {
    setSelectedPose(pose);
    onOpenEditModal();
  };

  // Callback for successful save from edit modal
  const handleSaveSuccess = () => {
    fetchPoses(); // Refresh list after edit
  };

  // Filter poses based on the selected tab
  const filteredPoses = poses.filter(pose => {
    if (tabIndex === 1) return pose.visibility === 'public';
    if (tabIndex === 2) return pose.visibility === 'private';
    return true; // tabIndex === 0 (All)
  });

  return (
    <VStack spacing={6} align="stretch">
      {/* Button aligned to the right, Tabs to the left */}
      <Flex mb={0} align="center" justifyContent="space-between">
        {/* Tabs for filtering */}
        <Tabs onChange={(index) => setTabIndex(index)} variant="soft-rounded" colorScheme="purple">
          <TabList>
            <Tab>All</Tab>
            <Tab>Public</Tab>
            <Tab>Private</Tab>
          </TabList>
        </Tabs>

        <Button 
          leftIcon={<FaPlus />} 
          onClick={onOpenUploadModal}
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
          Upload Pose
        </Button>
      </Flex>

      {isLoading ? (
        <SimpleGrid columns={{ base: 2, sm: 3, md: 4, lg: 5, xl: 6 }} spacing={6}>
          {Array.from({ length: numSkeletons }).map((_, index) => (
            <SkeletonPoseCard key={index} />
          ))}
        </SimpleGrid>
      ) : error ? (
        <Alert status="error" mb={4}>
          <AlertIcon />
          Error loading poses: {error}
        </Alert>
      ) : filteredPoses.length > 0 ? (
        <SimpleGrid columns={{ base: 2, sm: 3, md: 4, lg: 5, xl: 6 }} spacing={6}>
          {filteredPoses.map((pose) => (
            <Card
              key={pose.id}
              bg={cardBg}
              shadow="md"
              borderRadius="lg"
              overflow="hidden"
              _hover={{ shadow: 'lg', transform: 'translateY(-2px)', transition: 'all 0.2s' }}
            >
              <CardBody p={0}>
                <RouterLink to={`/app/poses/${pose.id}`} style={{ textDecoration: 'none' }}>
                  <AspectRatio ratio={1}>
                    <Image
                      src={pose.thumbnail_url || pose.storage_url || 'https://via.placeholder.com/150?text=No+Pose'}
                      alt={pose.name || `Pose ${pose.id}`}
                      objectFit="cover"
                      objectPosition="top"
                      fallbackSrc="https://via.placeholder.com/150?text=Loading..."
                    />
                  </AspectRatio>
                  <Box p={2} textAlign="center">
                    <Text fontSize="sm" fontWeight="medium" noOfLines={1} title={pose.name || 'Unnamed Pose'}>{pose.name || 'Unnamed Pose'}</Text>
                    {/* Visibility Badge */}
                    <Box mt={1}>
                      <Tag size="sm" variant="subtle" colorScheme={pose.visibility === 'public' ? 'blue' : 'green'}>
                        {pose.visibility === 'public' ? 'Public' : 'Private'}
                      </Tag>
                    </Box>
                  </Box>
                </RouterLink>
              </CardBody>
            </Card>
          ))}
        </SimpleGrid>
      ) : (
        <Center p={10} borderWidth="1px" borderRadius="md" borderStyle="dashed">
          <Heading size="md" color="gray.500">
            {tabIndex === 0 && "No poses found."}
            {tabIndex === 1 && "No public poses found."}
            {tabIndex === 2 && "No private poses found."}
          </Heading>
        </Center>
      )}

      <UploadPoseModal
        isOpen={isUploadModalOpen}
        onClose={onCloseUploadModal}
        onUploadSuccess={handleUploadSuccess}
      />
      {selectedPose && (
        <EditPoseModal
            isOpen={isEditModalOpen}
            onClose={onCloseEditModal}
            pose={selectedPose}
            onSaveSuccess={handleSaveSuccess}
        />
      )}
    </VStack>
  );
}
