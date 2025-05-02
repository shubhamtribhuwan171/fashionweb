import React, { useState, useEffect, useCallback } from 'react';
import {
  Modal,
  ModalOverlay,
  ModalContent,
  ModalHeader,
  ModalFooter,
  ModalBody,
  ModalCloseButton,
  Button,
  VStack,
  RadioGroup,
  Radio,
  Spinner,
  Text,
  Input,
  Divider,
  useToast,
  Center,
  Box,
  Flex,
} from '@chakra-ui/react';
import axios from 'axios'; // Import axios

// TODO: Move to config
const API_BASE_URL = 'https://productmarketing-ai-f0e989e4e1ad.herokuapp.com';

export default function AddToCollectionModal({ isOpen, onClose, styleId }) {
  const toast = useToast();
  const [collections, setCollections] = useState([]);
  const [loading, setLoading] = useState(false);
  const [saving, setSaving] = useState(false); // Separate state for saving action
  const [selectedCollectionId, setSelectedCollectionId] = useState(null);
  const [newCollectionName, setNewCollectionName] = useState('');
  const [createMode, setCreateMode] = useState(false);
  const [error, setError] = useState(null); // Add error state

  const getAuthConfig = () => {
      const token = localStorage.getItem('authToken');
      if (!token) {
          toast({ title: "Authentication Error", description: "Please log in again.", status: "error" });
          setError("Authentication token not found.");
          return null;
      }
      return { headers: { Authorization: `Bearer ${token}` } };
  };

  const fetchCollectionsForModal = useCallback(async () => {
    setLoading(true);
    setCreateMode(false); 
    setSelectedCollectionId(null);
    setNewCollectionName('');
    setError(null);
    const config = getAuthConfig();
    if (!config) {
        setLoading(false);
        return;
    }

    try {
        // --- Real API call --- 
        const response = await axios.get(`${API_BASE_URL}/api/collections`, config);
        setCollections(response.data || []);
    } catch (err) {
        console.error("Error fetching collections for modal:", err);
        setError(err.response?.data?.message || "Failed to load collections.");
        toast({ title: "Failed to load collections", description: error, status: "error", duration: 3000});
        setCollections([]); // Clear on error
    } finally {
        setLoading(false);
    }
  }, [toast]);

  // Fetch collections when the modal opens
  useEffect(() => {
    if (isOpen) {
      fetchCollectionsForModal();
    }
  }, [isOpen, fetchCollectionsForModal]);

  const handleSave = async () => {
    setSaving(true);
    setError(null);
    const config = getAuthConfig();
    if (!config) {
        setSaving(false);
        return;
    }

    try {
      if (createMode) {
        // --- Create New Collection and Add --- 
        if (!newCollectionName.trim()) {
          toast({ title: 'Please enter a name for the new collection.', status: 'warning', duration: 3000 });
          setSaving(false);
          return;
        }
        console.log(`API: Creating NEW collection: ${newCollectionName} and adding asset ${styleId}`);
        // API Call to create collection with initial asset
        const payload = { name: newCollectionName.trim(), initialAssetId: styleId };
        await axios.post(`${API_BASE_URL}/api/collections`, payload, config);
        
        toast({ title: "Created collection and added look!", status: "success", duration: 2000 });
        onClose(); // Close modal on success

      } else {
        // --- Add to Existing Collection --- 
        if (!selectedCollectionId) {
          toast({ title: 'Please select an existing collection.', status: 'warning', duration: 3000 });
          setSaving(false);
          return;
        }
        console.log(`API: Adding asset ${styleId} to EXISTING collection: ${selectedCollectionId}`);
        // API Call to add asset to collection items
        const payload = { asset_id: styleId }; // API expects asset_id
        await axios.post(`${API_BASE_URL}/api/collections/${selectedCollectionId}/items`, payload, config);
        
        toast({ title: "Added to collection!", status: "success", duration: 2000 });
        onClose(); // Close modal on success
      }
    } catch (err) {
        console.error("Failed operation:", err);
        const errorMessage = err.response?.data?.message || `Failed to ${createMode ? 'create and add' : 'add to collection'}`;
        setError(errorMessage);
        toast({ title: "Operation Failed", description: errorMessage, status: "error", duration: 3000 });
    } finally {
        setSaving(false);
    }
  };

  return (
    <Modal isOpen={isOpen} onClose={onClose} size="xl" scrollBehavior="inside" isCentered>
      <ModalOverlay />
      <ModalContent borderRadius="xl">
        <ModalHeader 
          fontSize="lg" 
          fontWeight="semibold"
          borderBottomWidth="1px"
          borderColor="gray.100"
          py={4} px={6}
        >
          Add Look to Collection
        </ModalHeader>
        <ModalCloseButton top={4} right={4} />
        <ModalBody py={6} px={6}>
          {loading ? (
            <Center py={5}><Spinner /></Center>
          ) : ( 
            <VStack spacing={5} align="stretch">
              {!createMode && (
                <>
                  <Text fontWeight="medium" fontSize="sm" mb={2}>Select Existing Collection:</Text>
                  {collections.length > 0 ? (
                    <Box maxHeight="200px" overflowY="auto" borderWidth="1px" borderRadius="md" p={3}>
                      <RadioGroup onChange={setSelectedCollectionId} value={selectedCollectionId}>
                        <VStack align="stretch" spacing={3}>
                          {collections.map((col) => (
                            <Radio key={col.id} value={col.id} size="md">
                              {col.name}
                            </Radio>
                          ))}
                        </VStack>
                      </RadioGroup>
                    </Box>
                  ) : (
                    <Text fontSize="sm" color="gray.500">No collections found.</Text>
                  )}
                  <Button variant="link" size="sm" onClick={() => setCreateMode(true)} isDisabled={saving} mt={2}>
                    Or Create New Collection...
                  </Button>
                </>
              )}
              
              {createMode && (
                <>
                   <Text fontWeight="medium" fontSize="sm" mb={2}>Create New Collection:</Text>
                   <Input 
                    placeholder="New collection name..." 
                    value={newCollectionName}
                    onChange={(e) => setNewCollectionName(e.target.value)}
                    isDisabled={saving}
                    borderRadius="md"
                   />
                   <Button variant="link" size="sm" onClick={() => setCreateMode(false)} isDisabled={saving} mt={2}>
                    Cancel
                  </Button>
                </>
              )}

              {/* Display error message if any */}
              {error && (
                  <Text color="red.500" fontSize="sm">Error: {error}</Text>
              )}
            </VStack>
          )}
        </ModalBody>

        <ModalFooter
          borderTopWidth="1px"
          borderColor="gray.100"
          px={6} py={4}
        >
          <Flex justify="flex-end" width="full">
            <Button variant="ghost" mr={3} onClick={onClose} isDisabled={saving}>
              Cancel
            </Button>
            <Button 
              onClick={handleSave}
              isLoading={saving}
              loadingText={createMode ? "Creating..." : "Adding..."}
              isDisabled={loading || saving || (createMode ? !newCollectionName.trim() : !selectedCollectionId)}
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
              {createMode ? 'Create & Add' : 'Add to Collection'}
            </Button>
          </Flex>
        </ModalFooter>
      </ModalContent>
    </Modal>
  );
} 