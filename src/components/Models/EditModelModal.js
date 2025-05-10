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
  Textarea,
  Select,
  Grid,
  GridItem,
  FormHelperText,
  useToast,
} from '@chakra-ui/react';
import axios from 'axios';

// Shared settings (consider moving to a constants file)
const API_BASE_URL = 'https://productmarketing-ai-f0e989e4e1ad.herokuapp.com';
const genderOptions = ["female", "male", "non-binary", "other"];
const bodyTypeOptions = ["average", "athletic", "plus size", "petite", "other"];
const skinToneOptions = ["fair", "light", "olive", "medium", "tan", "dark", "ebony", "other"];
const hairColorOptions = ["black", "brown", "blonde", "red", "grey", "other"];

export default function EditModelModal({ isOpen, onClose, model, onSaveSuccess }) {
  const [formData, setFormData] = useState({ ...model });
  const [isSaving, setIsSaving] = useState(false);
  const toast = useToast();

  // Update local form state when the model prop changes (e.g., after a save and refetch)
  useEffect(() => {
    if (model) {
      setFormData({
        name: model.name || '',
        description: model.description || '',
        tags: Array.isArray(model.tags) ? model.tags.join(', ') : '', // Join tags array into string for input
        gender: model.gender || '',
        body_type: model.body_type || '',
        hair: model.hair || '',
        skin_tone: model.skin_tone || ''
        // Note: is_favorite is not handled here as per requirements
      });
    }
  }, [model]);

  const getAuthConfig = useCallback(() => {
    const token = localStorage.getItem('authToken');
    if (!token) {
      toast({ title: "Authentication Error", description: "Please log in.", status: "error", duration: 3000 });
      return null;
    }
    return { headers: { Authorization: `Bearer ${token}` } };
  }, [toast]);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
  };

  const handleSave = async () => {
    const config = getAuthConfig();
    if (!config || !model?.id) return;

    setIsSaving(true);

    // Prepare payload - only include fields the form manages
    const payload = {
      name: formData.name.trim() || undefined, // Send undefined if empty to potentially clear?
      description: formData.description.trim() || undefined, // Or maybe only send if different from original?
      tags: formData.tags.split(',').map(tag => tag.trim()).filter(tag => tag !== ''),
      gender: formData.gender || undefined,
      body_type: formData.body_type || undefined,
      hair: formData.hair.trim() || undefined,
      skin_tone: formData.skin_tone || undefined,
    };

    // Filter out undefined fields to avoid accidentally clearing values if not intended
    Object.keys(payload).forEach(key => payload[key] === undefined && delete payload[key]);

    if (Object.keys(payload).length === 0) {
        toast({ title: "No Changes", description: "No changes detected to save.", status: "info", duration: 2000 });
        setIsSaving(false);
        onClose();
        return;
    }

    try {
      await axios.put(`${API_BASE_URL}/api/model-images/${model.id}`, payload, config);
      toast({ title: "Update Successful", status: "success", duration: 2000 });
      onSaveSuccess(); // Trigger refetch on the detail page
      onClose(); // Close the modal
    } catch (err) {
      console.error("Error updating model:", err);
      const errorMsg = err.response?.data?.message || "Failed to update model details";
      toast({ title: "Update Failed", description: errorMsg, status: "error", duration: 3000 });
    } finally {
      setIsSaving(false);
    }
  };

  // Handle closing: Reset state (although useEffect covers it, explicit reset is good practice)
  const handleClose = () => {
    if (model) {
        setFormData({
            name: model.name || '',
            description: model.description || '',
            tags: Array.isArray(model.tags) ? model.tags.join(', ') : '',
            gender: model.gender || '',
            body_type: model.body_type || '',
            hair: model.hair || '',
            skin_tone: model.skin_tone || ''
          });
    }
    onClose();
  };

  return (
    <Modal isOpen={isOpen} onClose={handleClose} isCentered size="2xl">
      <ModalOverlay />
      <ModalContent>
        <ModalHeader>Edit Model Details</ModalHeader>
        <ModalCloseButton isDisabled={isSaving} />
        <ModalBody pb={6}>
          <VStack spacing={4} align="stretch">
            {/* Name */}
             <FormControl>
                <FormLabel fontSize="sm">Model Name</FormLabel>
                <Input
                  name="name"
                  placeholder="Enter a name for the model"
                  value={formData.name}
                  onChange={handleChange}
                  isDisabled={isSaving}
                  size="sm"
                />
              </FormControl>

            {/* Attributes (Gender, Body, Skin, Hair) */}
            <Grid templateColumns="repeat(4, 1fr)" gap={4}>
              <GridItem>
                <FormControl>
                  <FormLabel fontSize="sm">Gender</FormLabel>
                  <Select
                    name="gender"
                    placeholder="Select..."
                    value={formData.gender}
                    onChange={handleChange}
                    isDisabled={isSaving}
                    size="sm"
                  >
                    <option value="">Clear</option> {/* Option to clear value */}
                    {genderOptions.map(opt => <option key={opt} value={opt}>{opt}</option>)}
                  </Select>
                </FormControl>
              </GridItem>
              <GridItem>
                <FormControl>
                  <FormLabel fontSize="sm">Body Type</FormLabel>
                  <Select
                    name="body_type"
                    placeholder="Select..."
                    value={formData.body_type}
                    onChange={handleChange}
                    isDisabled={isSaving}
                    size="sm"
                  >
                    <option value="">Clear</option>
                    {bodyTypeOptions.map(opt => <option key={opt} value={opt}>{opt}</option>)}
                  </Select>
                </FormControl>
              </GridItem>
              <GridItem>
                <FormControl>
                  <FormLabel fontSize="sm">Skin Tone</FormLabel>
                  <Select
                    name="skin_tone"
                    placeholder="Select..."
                    value={formData.skin_tone}
                    onChange={handleChange}
                    isDisabled={isSaving}
                    size="sm"
                  >
                     <option value="">Clear</option>
                    {skinToneOptions.map(opt => <option key={opt} value={opt}>{opt}</option>)}
                  </Select>
                </FormControl>
              </GridItem>
              <GridItem>
                <FormControl>
                  <FormLabel fontSize="sm">Hair</FormLabel>
                  <Select
                    name="hair"
                    placeholder="Select..."
                    value={formData.hair}
                    onChange={handleChange}
                    isDisabled={isSaving}
                    size="sm"
                  >
                    <option value="">Clear</option>
                    {hairColorOptions.map(opt => <option key={opt} value={opt}>{opt}</option>)}
                  </Select>
                </FormControl>
              </GridItem>
            </Grid>

            {/* Description */}
            <FormControl>
              <FormLabel fontSize="sm">Description</FormLabel>
              <Textarea
                name="description"
                placeholder="Add any notes about the model or pose..."
                value={formData.description}
                onChange={handleChange}
                isDisabled={isSaving}
                rows={3}
                size="sm"
              />
            </FormControl>

            {/* Tags */}
            <FormControl>
              <FormLabel fontSize="sm">Tags</FormLabel>
              <Input
                name="tags"
                placeholder="E.g., studio, female, full-body, casual"
                value={formData.tags}
                onChange={handleChange}
                isDisabled={isSaving}
                size="sm"
              />
              <FormHelperText>Separate tags with commas.</FormHelperText>
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