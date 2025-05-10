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
  CheckboxGroup,
  Checkbox,
  Stack,
  FormHelperText,
  useToast,
} from '@chakra-ui/react';
import axios from 'axios';

// Shared settings
const API_BASE_URL = 'https://productmarketing-ai-f0e989e4e1ad.herokuapp.com';
const poseTagOptions = ["standing", "sitting", "action", "relaxed", "full body", "upper body", "profile", "dynamic"];

export default function EditPoseModal({ isOpen, onClose, pose, onSaveSuccess }) {
  // State for form fields
  const [name, setName] = useState('');
  const [description, setDescription] = useState('');
  const [selectedPredefinedTags, setSelectedPredefinedTags] = useState([]);
  const [customTagsString, setCustomTagsString] = useState('');
  const [isSaving, setIsSaving] = useState(false);
  const toast = useToast();

  // Load data into form state when pose prop changes
  useEffect(() => {
    if (pose) {
      setName(pose.name || '');
      setDescription(pose.description || '');

      // Separate existing tags into predefined and custom
      const predefined = [];
      const custom = [];
      if (Array.isArray(pose.tags)) {
        pose.tags.forEach(tag => {
          if (poseTagOptions.includes(tag)) {
            predefined.push(tag);
          } else {
            custom.push(tag);
          }
        });
      }
      setSelectedPredefinedTags(predefined);
      setCustomTagsString(custom.join(', '));
    } else {
        // Reset if pose is null (e.g., modal closed before opening)
        setName('');
        setDescription('');
        setSelectedPredefinedTags([]);
        setCustomTagsString('');
    }
  }, [pose]);

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
    if (!config || !pose?.id) return;

    setIsSaving(true);

    // Combine tags from checkboxes and input field
    const customTags = customTagsString.split(',').map(tag => tag.trim()).filter(tag => tag !== '');
    const finalTags = [...new Set([...selectedPredefinedTags, ...customTags])];

    // Prepare payload - only send changed fields?
    // For simplicity, we send all managed fields. API should handle partial updates.
    const payload = {
      name: name.trim() || undefined,
      description: description.trim() || undefined,
      tags: finalTags.length > 0 ? finalTags : undefined, // Send tags array or undefined if empty
      // Add is_favorite later if needed for poses
    };

    // Filter out undefined fields before sending
    Object.keys(payload).forEach(key => payload[key] === undefined && delete payload[key]);

    if (Object.keys(payload).length === 0) {
        toast({ title: "No Changes", description: "No changes detected to save.", status: "info", duration: 2000 });
        setIsSaving(false);
        onClose(); // Close even if no changes
        return;
    }

    try {
      // Use the correct PUT endpoint for poses
      await axios.put(`${API_BASE_URL}/api/poses/${pose.id}`, payload, config);
      toast({ title: "Pose Update Successful", status: "success", duration: 2000 });
      onSaveSuccess(); // Trigger refetch on the list/detail page
      onClose(); // Close the modal
    } catch (err) {
      console.error("Error updating pose:", err);
      const errorMsg = err.response?.data?.message || "Failed to update pose details";
      toast({ title: "Update Failed", description: errorMsg, status: "error", duration: 3000 });
    } finally {
      setIsSaving(false);
    }
  };

  // Use the effect for resetting on prop change, handleClose just calls onClose
  const handleClose = () => {
    onClose();
  };

  return (
    <Modal isOpen={isOpen} onClose={handleClose} isCentered size="lg">
      <ModalOverlay />
      <ModalContent>
        <ModalHeader>Edit Pose Details</ModalHeader>
        <ModalCloseButton isDisabled={isSaving} />
        <ModalBody pb={6}>
          <VStack spacing={4} align="stretch">
            {/* Pose Name */}
            <FormControl>
              <FormLabel fontSize="sm">Pose Name</FormLabel>
              <Input
                placeholder="Enter a name for the pose"
                value={name}
                onChange={(e) => setName(e.target.value)}
                isDisabled={isSaving}
                size="sm"
              />
            </FormControl>

            {/* Description */}
            <FormControl>
              <FormLabel fontSize="sm">Description (Optional)</FormLabel>
              <Textarea
                placeholder="Add any notes about the pose..."
                value={description}
                onChange={(e) => setDescription(e.target.value)}
                isDisabled={isSaving}
                rows={3}
                size="sm"
              />
            </FormControl>

            {/* Predefined Tags */}
            <FormControl>
                <FormLabel fontSize="sm">Common Tags (Optional)</FormLabel>
                <CheckboxGroup
                    colorScheme='purple'
                    value={selectedPredefinedTags}
                    onChange={setSelectedPredefinedTags}
                 >
                    <Stack spacing={[1, 3]} direction={['column', 'row']} wrap="wrap">
                        {poseTagOptions.map(tag => (
                            <Checkbox key={tag} value={tag} isDisabled={isSaving} size="sm">
                                {tag}
                            </Checkbox>
                        ))}
                    </Stack>
                </CheckboxGroup>
            </FormControl>

            {/* Custom Tags */}
            <FormControl>
                <FormLabel fontSize="sm">Other Tags (Optional)</FormLabel>
                <Input
                    placeholder="E.g., dynamic, contrapposto"
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