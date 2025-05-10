import React, { useState, useEffect, useCallback, useContext } from 'react';
import {
  Box,
  Heading,
  VStack,
  FormControl,
  FormLabel,
  Input,
  Button,
  useToast,
  Text, // Removed
  Spinner,
  Alert,
  AlertIcon,
  SimpleGrid,
  HStack,
  Icon
} from '@chakra-ui/react';
import axios from 'axios';
import { FiUser, FiBriefcase, FiDollarSign } from 'react-icons/fi';
import { usePageHeader } from '../components/Layout/DashboardLayout'; // Import hook

// TODO: Move to config
const API_BASE_URL = 'https://productmarketing-ai-f0e989e4e1ad.herokuapp.com';

export default function SettingsPage() {
  const { setHeader } = usePageHeader(); // Use hook
  const toast = useToast();

  // --- State --- 
  const [profileData, setProfileData] = useState({ name: '', email: '' });
  const [workspaceData, setWorkspaceData] = useState({ id: null, name: '', credits: 0 });
  const [isLoading, setIsLoading] = useState({ profile: true, workspace: true });
  const [error, setError] = useState({ profile: null, workspace: null });
  
  const [isProfileSaving, setIsProfileSaving] = useState(false);
  // const [isWorkspaceSaving, setIsWorkspaceSaving] = useState(false); // REMOVED

  // --- Auth Helper --- 
  const getAuthConfig = useCallback(() => {
    const token = localStorage.getItem('authToken');
    if (!token) {
      toast({ title: "Authentication Error", description: "Please log in.", status: "error", duration: 3000, isClosable: true });
      return null;
    }
    return { headers: { Authorization: `Bearer ${token}` } };
  }, [toast]);

  // --- Fetch Data --- 
  useEffect(() => {
    const fetchProfile = async () => {
      const config = getAuthConfig();
      if (!config) {
        setError(prev => ({ ...prev, profile: "Authentication required." }));
        setIsLoading(prev => ({ ...prev, profile: false }));
        return;
      }
      try {
        const response = await axios.get(`${API_BASE_URL}/api/profile`, config);
        setProfileData({ name: response.data.name || '', email: response.data.email || '' });
        setError(prev => ({ ...prev, profile: null }));
      } catch (err) {
        console.error("Error fetching profile:", err);
        setError(prev => ({ ...prev, profile: err.response?.data?.message || "Failed to load profile." }));
      } finally {
        setIsLoading(prev => ({ ...prev, profile: false }));
      }
    };

    const fetchWorkspaces = async () => {
      const config = getAuthConfig();
      if (!config) {
        setError(prev => ({ ...prev, workspace: "Authentication required." }));
        setIsLoading(prev => ({ ...prev, workspace: false }));
        return;
      }
      try {
        const response = await axios.get(`${API_BASE_URL}/api/workspaces`, config);
        // TODO: Implement proper logic to select the *current* workspace.
        if (response.data && response.data.length > 0) {
            const currentWs = response.data[0]; 
            setWorkspaceData({ id: currentWs.id, name: currentWs.name || '', credits: currentWs.credits || 0 });
            setError(prev => ({ ...prev, workspace: null }));
        } else {
             setError(prev => ({ ...prev, workspace: "No workspaces found for this user." }));
        }
      } catch (err) {
        console.error("Error fetching workspaces:", err);
        setError(prev => ({ ...prev, workspace: err.response?.data?.message || "Failed to load workspace data." }));
      } finally {
        setIsLoading(prev => ({ ...prev, workspace: false }));
      }
    };

    fetchProfile();
    fetchWorkspaces();

  }, [getAuthConfig]); // Rerun if auth changes

  useEffect(() => {
    setHeader('Settings', 'Manage your profile and workspace details.'); // Set header
    return () => setHeader('', ''); // Clear on unmount
  }, [setHeader]);

  // --- Save Handlers --- 
  const handleProfileSave = async () => {
    const config = getAuthConfig();
    if (!config) return;

    setIsProfileSaving(true);
    try {
      const payload = { name: profileData.name }; 
      await axios.put(`${API_BASE_URL}/api/profile`, payload, config);
      
      // --- Update localStorage --- 
      const storedUserInfo = localStorage.getItem('userInfo');
      if (storedUserInfo) {
          try {
              const currentUserInfo = JSON.parse(storedUserInfo);
              // Update only the name field
              currentUserInfo.name = profileData.name; 
              localStorage.setItem('userInfo', JSON.stringify(currentUserInfo));
              console.log("Updated userInfo in localStorage with new name.");
          } catch (parseError) {
              console.error("Failed to parse/update userInfo in localStorage:", parseError);
          }
      }
      // -------

      toast({ title: 'Profile updated.', status: 'success', duration: 3000, isClosable: true });
    } catch (err) {
        console.error("Error saving profile:", err);
        toast({ title: 'Failed to update profile', description: err.response?.data?.message || "An error occurred.", status: 'error', duration: 3000, isClosable: true });
    } finally {
        setIsProfileSaving(false);
    }
  };

  // Helper to render loading/error states for a section
  const renderSectionState = (sectionLoading, sectionError, children) => {
    if (sectionLoading) {
        return <Spinner />;
    }
    if (sectionError) {
        return <Alert status="error"><AlertIcon />{sectionError}</Alert>;
    }
    return children;
  };

  return (
    <Box>
      {/* --- Header Removed ---
      <VStack spacing={1} align="stretch" mb={8}>
        <Heading size="lg">Settings</Heading>
        <Text color="gray.500">Manage your profile and workspace details.</Text>
      </VStack>
      */}
      
      {/* Use SimpleGrid for side-by-side layout on medium+ screens */} 
      <SimpleGrid columns={{ base: 1, md: 2 }} spacing={8} align="start">

        {/* --- Personal Information Card --- */} 
        <Box borderWidth="1px" borderRadius="lg" p={6} height="100%"> 
            {/* Add icon to heading */}
            <HStack mb={4}>
                <Icon as={FiUser} w={5} h={5} color="gray.500"/>
                <Heading size="md">Personal Information</Heading>
            </HStack>
            {isLoading.profile ? (
                <Spinner />
            ) : error.profile ? (
                <Alert status="error"><AlertIcon />{error.profile}</Alert>
            ) : (
                // Use VStack within the card for vertical layout of controls
                <VStack spacing={4} align="stretch">
                    <FormControl id="profile-name">
                        <FormLabel>Name</FormLabel>
                        <Input 
                          type="text" 
                          value={profileData.name} 
                          onChange={(e) => setProfileData(prev => ({ ...prev, name: e.target.value }))} 
                        />
                    </FormControl>
                    <FormControl id="profile-email" isReadOnly>
                        <FormLabel>Email Address</FormLabel>
                        <Input type="email" value={profileData.email} /> 
                    </FormControl>
                    {/* Spacer to push button down if needed, or adjust VStack props */}
                    <Box flexGrow={1} /> 
                    {/* Style the Save Profile button */}
                    <Button 
                      // colorScheme="purple" // Remove default
                      onClick={handleProfileSave}
                      isLoading={isProfileSaving}
                      alignSelf="flex-end"
                      mt={4} // Add some margin top
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
                      Save Profile
                    </Button>
                </VStack>
            )}
        </Box>

        {/* --- Workspace Settings Card --- */} 
        <Box borderWidth="1px" borderRadius="lg" p={6} height="100%">
             {/* Add icon to heading */}
             <HStack mb={4}>
                 <Icon as={FiBriefcase} w={5} h={5} color="gray.500"/>
                 <Heading size="md">Workspace</Heading> {/* Changed heading slightly */} 
             </HStack>
            {isLoading.workspace ? (
                <Spinner />
            ) : error.workspace ? (
                <Alert status="error"><AlertIcon />{error.workspace}</Alert>
            ) : (
                 // Use VStack within the card for vertical layout of controls
                 <VStack spacing={4} align="stretch">
                    {/* Workspace Name - Display Only */}
                    <FormControl id="workspace-name" isReadOnly>
                        <FormLabel>Current Workspace</FormLabel>
                        {/* Display name using Text component */}
                        <Text fontSize="lg" fontWeight="medium" p={2} pl={0} mt={1}>
                            {workspaceData.name || '-'}
                        </Text>
                    </FormControl>
                    {/* Credits - Display Only */} 
                    <FormControl id="workspace-credits" isReadOnly>
                        <FormLabel>
                             <HStack spacing={2}>
                                 <Icon as={FiDollarSign} w={4} h={4} color="gray.500"/> 
                                 <Text>Available Credits</Text> 
                             </HStack>
                        </FormLabel>
                        <Text fontSize="lg" fontWeight="medium" p={2} pl={0}>
                            {workspaceData.credits}
                        </Text>
                    </FormControl>
                     {/* Save Button REMOVED */} 
                 </VStack>
            )}
        </Box>

        {/* Removed Password Section */} 
        {/* Removed Billing Section Placeholder */} 

      </SimpleGrid>
    </Box>
  );
} 