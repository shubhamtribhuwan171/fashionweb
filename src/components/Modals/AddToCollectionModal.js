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
    <Modal isOpen={isOpen} onClose={onClose} size="lg" scrollBehavior="inside">
      <ModalOverlay />
      <ModalContent>
        <ModalHeader>Add Look to Collection</ModalHeader>
        <ModalCloseButton />
        <ModalBody pb={6}>
          {loading ? (
            <Center py={5}><Spinner /></Center>
          ) : ( 
            <VStack spacing={4} align="stretch">
              {!createMode && (
                <>
                  <Text fontWeight="medium">Select Existing Collection:</Text>
                  {collections.length > 0 ? (
                    // Use Box for scrolling instead of VStack directly
                    <Box maxHeight="200px" overflowY="auto" borderWidth="1px" borderRadius="md" p={2}>
                      <RadioGroup onChange={setSelectedCollectionId} value={selectedCollectionId}>
                        <VStack align="stretch" spacing={2}> 
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
                  <Button variant="link" size="sm" onClick={() => setCreateMode(true)} isDisabled={saving}>
                    Or Create New Collection...
                  </Button>
                </>
              )}
              
              {createMode && (
                <>
                   <Text fontWeight="medium">Create New Collection:</Text>
                   <Input 
                    placeholder="New collection name..." 
                    value={newCollectionName}
                    onChange={(e) => setNewCollectionName(e.target.value)}
                    isDisabled={saving}
                   />
                   <Button variant="link" size="sm" onClick={() => setCreateMode(false)} isDisabled={saving}>
                    Cancel
                  </Button>
                </>
              )}
            </VStack>
          )}
        </ModalBody>

        <ModalFooter>
          <Button variant="ghost" mr={3} onClick={onClose} isDisabled={saving}>
            Cancel
          </Button>
          <Button 
            colorScheme="blue" 
            onClick={handleSave}
            isLoading={saving}
            loadingText={createMode ? "Creating..." : "Adding..."}
            isDisabled={loading || saving || (createMode ? !newCollectionName.trim() : !selectedCollectionId)}
          >
            {createMode ? 'Create & Add' : 'Add to Collection'}
          </Button>
        </ModalFooter>
      </ModalContent>
    </Modal>
  );
} 