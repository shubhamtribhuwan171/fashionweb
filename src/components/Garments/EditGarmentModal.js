import React, { useState, useEffect, useCallback } from 'react';
import {
  Modal,
  ModalOverlay,
  ModalContent,
  ModalHeader,
  ModalFooter,
  ModalBody,
  ModalCloseButton,
  Button,Flex,
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
  Switch
} from '@chakra-ui/react';
import axios from 'axios';

// Shared settings
const API_BASE_URL = 'https://productmarketing-ai-f0e989e4e1ad.herokuapp.com';
const garmentTagOptions = ["basics", "cotton", "denim", "formal", "casual", "summer", "winter", "outerwear", "athletic"];

export default function EditGarmentModal({ isOpen, onClose, garment, onSaveSuccess }) {
  // State for form fields
  const [name, setName] = useState('');
  const [description, setDescription] = useState('');
  const [garmentType, setGarmentType] = useState('top');
  const [selectedPredefinedTags, setSelectedPredefinedTags] = useState([]);
  const [customTagsString, setCustomTagsString] = useState('');
  const [isFavorite, setIsFavorite] = useState(false);
  const [isSaving, setIsSaving] = useState(false);
  const toast = useToast();

  // Load data into form state when garment prop changes
  useEffect(() => {
    if (garment) {
      setName(garment.name || '');
      setDescription(garment.description || '');
      setGarmentType(garment.garment_type || 'other'); // Default to 'other' if null/undefined
      setIsFavorite(garment.is_favorite || false);

      // Separate existing tags
      const predefined = [];
      const custom = [];
      if (Array.isArray(garment.tags)) {
        garment.tags.forEach(tag => {
          if (garmentTagOptions.includes(tag)) {
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
        setDescription('');
        setGarmentType('top');
        setIsFavorite(false);
        setSelectedPredefinedTags([]);
        setCustomTagsString('');
    }
  }, [garment]);

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
    if (!config || !garment?.id) return;

    setIsSaving(true);

    // Combine tags
    const customTags = customTagsString.split(',').map(tag => tag.trim()).filter(tag => tag !== '');
    const finalTags = [...new Set([...selectedPredefinedTags, ...customTags])];

    // Prepare payload
    const payload = {
      name: name.trim() || undefined,
      description: description.trim() || undefined,
      garment_type: garmentType,
      tags: finalTags.length > 0 ? finalTags : undefined,
      is_favorite: isFavorite,
    };

    // Filter out undefined (except boolean is_favorite which should always be sent? Check API)
    // For now, let's assume sending undefined for strings is okay, but always send boolean/garment_type.
    Object.keys(payload).forEach(key => (key !== 'is_favorite' && key !== 'garment_type' && payload[key] === undefined) && delete payload[key]);

     // Check if any actual changes were made compared to the original garment prop
     let hasChanges = false;
     if (payload.name !== (garment.name || undefined)) hasChanges = true;
     if (payload.description !== (garment.description || undefined)) hasChanges = true;
     if (payload.garment_type !== (garment.garment_type || 'other')) hasChanges = true;
     if (payload.is_favorite !== (garment.is_favorite || false)) hasChanges = true;
     const originalTags = garment.tags || [];
     if (JSON.stringify(payload.tags?.sort()) !== JSON.stringify(originalTags.sort())) hasChanges = true;
 
     if (!hasChanges) {
         toast({ title: "No Changes", description: "No changes detected to save.", status: "info", duration: 2000 });
         setIsSaving(false);
         onClose();
         return;
     }

    try {
      await axios.put(`${API_BASE_URL}/api/products/${garment.id}`, payload, config);
      toast({ title: "Update Successful", status: "success", duration: 2000 });
      onSaveSuccess();
      onClose();
    } catch (err) {
      console.error("Error updating garment:", err);
      const errorMsg = err.response?.data?.message || "Failed to update garment details";
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
      <ModalContent borderRadius="xl">
        <ModalHeader
          fontSize="lg"
          fontWeight="semibold"
          borderBottomWidth="1px"
          borderColor="gray.100"
          py={4}
          px={6}
        >
          Edit Apparel Item
        </ModalHeader>
        <ModalCloseButton isDisabled={isSaving} top={4} right={4} />
        <ModalBody py={6} px={6}>
          <VStack spacing={5}>
            {/* Name and Type */}
            <FormControl isRequired>
              <FormLabel fontSize="sm" fontWeight="medium">Apparel Name</FormLabel>
              <Input
                placeholder="e.g., Black Cotton Hoodie"
                value={name}
                onChange={(e) => setName(e.target.value)}
                borderRadius="md"
                isDisabled={isSaving}
                size="sm"
              />
            </FormControl>
            <FormControl isRequired>
              <FormLabel fontSize="sm" fontWeight="medium">Garment Type</FormLabel>
              <Select value={garmentType} onChange={(e) => setGarmentType(e.target.value)} isDisabled={isSaving} size="sm">
                <option value="top">Top</option>
                <option value="bottom">Bottom</option>
                <option value="other">Other</option>
              </Select>
            </FormControl>

            {/* Description */}
            <FormControl>
              <FormLabel fontSize="sm" fontWeight="medium">Description</FormLabel>
              <Textarea
                placeholder="e.g., Heavyweight cotton, slightly oversized fit"
                value={description}
                onChange={(e) => setDescription(e.target.value)}
                isDisabled={isSaving}
                rows={3}
                size="sm"
              />
            </FormControl>

            {/* Tags */}
            <FormControl>
                <FormLabel fontSize="sm" fontWeight="medium">Common Tags</FormLabel>
                <CheckboxGroup
                    colorScheme='blue'
                    value={selectedPredefinedTags}
                    onChange={setSelectedPredefinedTags}
                 >
                    <Stack spacing={[1, 3]} direction={['column', 'row']} wrap="wrap">
                        {garmentTagOptions.map(tag => (
                            <Checkbox key={tag} value={tag} isDisabled={isSaving} size="sm">
                                {tag}
                            </Checkbox>
                        ))}
                    </Stack>
                </CheckboxGroup>
            </FormControl>
            <FormControl>
                <FormLabel fontSize="sm" fontWeight="medium">Other Tags</FormLabel>
                <Input
                    placeholder="e.g., vintage, graphic-print"
                    value={customTagsString}
                    onChange={(e) => setCustomTagsString(e.target.value)}
                    isDisabled={isSaving}
                    size="sm"
                />
                <FormHelperText>Separate custom tags with commas.</FormHelperText>
            </FormControl>

            {/* Is Favorite */}
            <FormControl display="flex" alignItems="center">
                <FormLabel htmlFor="edit-is-favorite" mb="0" fontSize="sm" fontWeight="medium">
                    Mark as Favorite?
                </FormLabel>
                <Switch
                    id="edit-is-favorite"
                    isChecked={isFavorite}
                    onChange={(e) => setIsFavorite(e.target.checked)}
                    isDisabled={isSaving}
                    colorScheme="purple"
                />
            </FormControl>
          </VStack>
        </ModalBody>

        <ModalFooter
          borderTopWidth="1px"
          borderColor="gray.100"
          px={6}
          py={4}
        >
          <Flex justify="flex-end" width="full">
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
          </Flex>
        </ModalFooter>
      </ModalContent>
    </Modal>
  );
} 