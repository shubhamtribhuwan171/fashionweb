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
// Import mock data functions matching the updated mockData.js
import { getMockCollections, createMockCollection, addAssetToCollection } from '../../data/mockData';

export default function AddToCollectionModal({ isOpen, onClose, styleId }) {
  const toast = useToast();
  const [collections, setCollections] = useState([]);
  const [loading, setLoading] = useState(false);
  const [saving, setSaving] = useState(false); // Separate state for saving action
  const [selectedCollectionId, setSelectedCollectionId] = useState(null);
  const [newCollectionName, setNewCollectionName] = useState('');
  const [createMode, setCreateMode] = useState(false);

  const fetchCollectionsForModal = useCallback(async () => {
    setLoading(true);
    setCreateMode(false); 
    setSelectedCollectionId(null);
    setNewCollectionName('');
    try {
        const data = await getMockCollections();
        setCollections(data || []);
    } catch (err) {
        console.error("Error fetching collections for modal:", err);
        toast({ title: "Failed to load collections", status: "error", duration: 3000});
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
    try {
      if (createMode) {
        // --- Create New Collection and Add --- 
        if (!newCollectionName.trim()) {
          toast({ title: 'Please enter a name for the new collection.', status: 'warning', duration: 3000 });
          setSaving(false);
          return;
        }
        console.log(`MOCK: Creating NEW collection: ${newCollectionName} and adding asset ${styleId}`);
        // 1. Create the collection
        const newCollection = await createMockCollection({ name: newCollectionName, initialAssetId: styleId });
        // 2. (Implicitly added via initialAssetId in mock, real API might need separate call)
        toast({ title: "Created collection and added look!", status: "success", duration: 2000 });
        onClose(); // Close modal on success

      } else {
        // --- Add to Existing Collection --- 
        if (!selectedCollectionId) {
          toast({ title: 'Please select an existing collection.', status: 'warning', duration: 3000 });
          setSaving(false);
          return;
        }
        console.log(`MOCK: Adding asset ${styleId} to EXISTING collection: ${selectedCollectionId}`);
        // Call the mock function (matching API payload)
        await addAssetToCollection(selectedCollectionId, { asset_id: styleId });
        toast({ title: "Added to collection!", status: "success", duration: 2000 });
        onClose(); // Close modal on success
      }
    } catch (error) {
        console.error("Failed operation:", error);
        toast({ title: `Failed to ${createMode ? 'create and add' : 'add to collection'}`, description: error.message, status: "error", duration: 3000 });
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
              colorScheme="blue" 
              onClick={handleSave}
              isLoading={saving}
              loadingText={createMode ? "Creating..." : "Adding..."}
              isDisabled={loading || saving || (createMode ? !newCollectionName.trim() : !selectedCollectionId)}
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