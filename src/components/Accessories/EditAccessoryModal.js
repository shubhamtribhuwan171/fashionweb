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
  FormControl,
  FormLabel,
  Input,
  Select,
  Textarea,
  CheckboxGroup,
  Checkbox,
  Stack,
  FormHelperText,
  useToast,
  HStack, // Added for layout
} from '@chakra-ui/react';
import axios from 'axios';

// Shared settings
const API_BASE_URL = 'https://productmarketing-ai-f0e989e4e1ad.herokuapp.com';
const ACCESSORY_CATEGORIES = ['hats', 'bags', 'jewelry', 'shoes', 'scarves', 'other'];
const accessoryTagOptions = ["metallic", "leather", "casual", "formal", "summer", "winter", "simple", "statement"];

export default function EditAccessoryModal({ isOpen, onClose, accessory, onSaveSuccess }) {
  // State for form fields
  const [name, setName] = useState('');
  const [category, setCategory] = useState('');
  const [description, setDescription] = useState('');
  const [selectedPredefinedTags, setSelectedPredefinedTags] = useState([]);
  const [customTagsString, setCustomTagsString] = useState('');
  const [isSaving, setIsSaving] = useState(false);
  const toast = useToast();

  // Load data into form state when accessory prop changes
  useEffect(() => {
    if (accessory) {
      setName(accessory.name || '');
      setCategory(accessory.category || '');
      setDescription(accessory.description || '');

      // Separate existing tags
      const predefined = [];
      const custom = [];
      if (Array.isArray(accessory.tags)) {
        accessory.tags.forEach(tag => {
          if (accessoryTagOptions.includes(tag)) {
            predefined.push(tag);
          } else {
            custom.push(tag);
          }
        });
      }
      setSelectedPredefinedTags(predefined);
      setCustomTagsString(custom.join(', '));
    } else {
        setName('');
        setCategory('');
        setDescription('');
        setSelectedPredefinedTags([]);
        setCustomTagsString('');
    }
  }, [accessory]);

  const getAuthConfig = useCallback(() => {
    const token = localStorage.getItem('authToken');
    if (!token) {
      toast({ title: "Authentication Error", description: "Please log in.", status: "error", duration: 3000 });
      return null;
    }
    return { headers: { Authorization: `Bearer ${token}` } };
  }, [toast]);

  const handleSave = async () => {
    const config = getAuthConfig();
    if (!config || !accessory?.id) return;
    if (!category) { // Category is required
        toast({ title: "Validation Error", description: "Category is required.", status: "warning", duration: 3000 });
        return;
    }

    setIsSaving(true);

    // Combine tags
    const customTags = customTagsString.split(',').map(tag => tag.trim()).filter(tag => tag !== '');
    const finalTags = [...new Set([...selectedPredefinedTags, ...customTags])];

    const payload = {
      name: name.trim() || undefined,
      category: category, // Always send category as it's required
      description: description.trim() || undefined,
      tags: finalTags.length > 0 ? finalTags : undefined,
    };

    Object.keys(payload).forEach(key => payload[key] === undefined && delete payload[key]);

    // Check if any actual changes were made compared to the original accessory prop
    let hasChanges = false;
    if (payload.name !== (accessory.name || undefined)) hasChanges = true;
    if (payload.category !== accessory.category) hasChanges = true;
    if (payload.description !== (accessory.description || undefined)) hasChanges = true;
    const originalTags = accessory.tags || [];
    if (JSON.stringify(payload.tags?.sort()) !== JSON.stringify(originalTags.sort())) hasChanges = true;

    if (!hasChanges) {
        toast({ title: "No Changes", description: "No changes detected to save.", status: "info", duration: 2000 });
        setIsSaving(false);
        onClose();
        return;
    }

    try {
      await axios.put(`${API_BASE_URL}/api/accessory-images/${accessory.id}`, payload, config);
      toast({ title: "Update Successful", status: "success", duration: 2000 });
      onSaveSuccess();
      onClose();
    } catch (err) {
      console.error("Error updating accessory:", err);
      const errorMsg = err.response?.data?.message || "Failed to update accessory details";
      toast({ title: "Update Failed", description: errorMsg, status: "error", duration: 3000 });
    } finally {
      setIsSaving(false);
    }
  };

  const handleClose = () => {
    onClose();
  };

  return (
    <Modal isOpen={isOpen} onClose={handleClose} isCentered size="xl">
      <ModalOverlay />
      <ModalContent>
        <ModalHeader>Edit Accessory Details</ModalHeader>
        <ModalCloseButton isDisabled={isSaving} />
        <ModalBody pb={6}>
          <VStack spacing={4} align="stretch">
            {/* Name & Category */}
            <HStack spacing={4}>
                 <FormControl flex={1}>
                  <FormLabel fontSize="sm">Accessory Name</FormLabel>
                  <Input
                    placeholder="Enter a name for the accessory"
                    value={name}
                    onChange={(e) => setName(e.target.value)}
                    isDisabled={isSaving}
                    size="sm"
                  />
                </FormControl>
                <FormControl isRequired flex={1}>
                  <FormLabel fontSize="sm">Category</FormLabel>
                  <Select
                    placeholder="Select category"
                    value={category}
                    onChange={(e) => setCategory(e.target.value)}
                    isDisabled={isSaving}
                    size="sm"
                  >
                    {ACCESSORY_CATEGORIES.map(cat => (
                      <option key={cat} value={cat}>{cat.charAt(0).toUpperCase() + cat.slice(1)}</option>
                    ))}
                  </Select>
                </FormControl>
            </HStack>

             {/* Description */}
            <FormControl>
              <FormLabel fontSize="sm">Description</FormLabel>
              <Textarea
                placeholder="Add any notes about the accessory..."
                value={description}
                onChange={(e) => setDescription(e.target.value)}
                isDisabled={isSaving}
                rows={3}
                size="sm"
              />
            </FormControl>

            {/* Predefined Tags */}
            <FormControl>
                <FormLabel fontSize="sm">Common Tags</FormLabel>
                <CheckboxGroup
                    colorScheme='teal'
                    value={selectedPredefinedTags}
                    onChange={setSelectedPredefinedTags}
                 >
                    <Stack spacing={[1, 3]} direction={['column', 'row']} wrap="wrap">
                        {accessoryTagOptions.map(tag => (
                            <Checkbox key={tag} value={tag} isDisabled={isSaving} size="sm">
                                {tag}
                            </Checkbox>
                        ))}
                    </Stack>
                </CheckboxGroup>
            </FormControl>

            {/* Custom Tags */}
            <FormControl>
                <FormLabel fontSize="sm">Other Tags</FormLabel>
                <Input
                    placeholder="E.g., vintage, gold-buckle"
                    value={customTagsString}
                    onChange={(e) => setCustomTagsString(e.target.value)}
                    isDisabled={isSaving}
                    size="sm"
                />
                <FormHelperText>Separate custom tags with commas.</FormHelperText>
            </FormControl>
          </VStack>
        </ModalBody>

        <ModalFooter>
          <Button variant="ghost" mr={3} onClick={handleClose} isDisabled={isSaving}>
            Cancel
          </Button>
          <Button
            colorScheme="blue"
            onClick={handleSave}
            isLoading={isSaving}
          >
            Save Changes
          </Button>
        </ModalFooter>
      </ModalContent>
    </Modal>
  );
} 