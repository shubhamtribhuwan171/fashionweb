import React, { useState, useRef, useCallback } from 'react';
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
  HStack,
  Text,
  Icon,
  useToast,
  Textarea,
  CheckboxGroup,
  Checkbox,
  Stack,
  FormHelperText
} from '@chakra-ui/react';
import { FaUpload, FaPlus } from 'react-icons/fa';
import axios from 'axios';

// TODO: Move to config or central place
const API_BASE_URL = 'https://productmarketing-ai-f0e989e4e1ad.herokuapp.com';

// TODO: Replace with actual workspace ID from context/state management
const getMockWorkspaceId = () => '95d29ad4-47fa-48ee-85cb-cbf762eb400a';

// Define accessory categories (match API documentation)
const ACCESSORY_CATEGORIES = ['hats', 'bags', 'jewelry', 'shoes', 'scarves', 'other'];

// <<< Define predefined accessory tags
const accessoryTagOptions = ["metallic", "leather", "casual", "formal", "summer", "winter", "simple", "statement"];

export default function UploadAccessoryModal({ isOpen, onClose, onUploadSuccess }) {
  const [uploading, setUploading] = useState(false);
  const [accessoryName, setAccessoryName] = useState('');
  const [selectedFile, setSelectedFile] = useState(null);
  const [selectedCategory, setSelectedCategory] = useState('');
  const [description, setDescription] = useState('');
  const [selectedPredefinedTags, setSelectedPredefinedTags] = useState([]);
  const [customTagsString, setCustomTagsString] = useState('');
  const fileInputRef = useRef(null);
  const toast = useToast();
  const currentWorkspaceId = getMockWorkspaceId(); // Use placeholder

  const getAuthConfig = useCallback(() => {
    const token = localStorage.getItem('authToken');
    if (!token) {
      toast({ title: "Authentication Error", description: "Please log in.", status: "error", duration: 3000 });
      return null;
    }
    return { headers: { Authorization: `Bearer ${token}` } };
  }, [toast]);

  // Handle File Selection
  const handleFileChange = (event) => {
    if (event.target.files && event.target.files[0]) {
      setSelectedFile(event.target.files[0]);
    } else {
      setSelectedFile(null);
    }
  };

  // Trigger hidden file input click
  const triggerFileInput = () => {
    fileInputRef.current?.click();
  };

  // Reset state on close
  const handleClose = () => {
    setAccessoryName('');
    setSelectedFile(null);
    setSelectedCategory('');
    setDescription('');
    setSelectedPredefinedTags([]);
    setCustomTagsString('');
    setUploading(false);
    if (fileInputRef.current) fileInputRef.current.value = '';
    onClose();
  };

  // Handle Upload
  const handleUpload = async () => {
    if (!selectedFile || !selectedCategory || !currentWorkspaceId) {
      toast({ title: "Upload Error", description: "Please select a file and category.", status: "warning", duration: 3000 });
      return;
    }
    const config = getAuthConfig();
    if (!config) return;

    setUploading(true);

    const formData = new FormData();
    formData.append('image', selectedFile);
    formData.append('workspaceId', currentWorkspaceId);
    formData.append('category', selectedCategory);
    if (accessoryName.trim()) {
      formData.append('name', accessoryName.trim());
    }
    if (description.trim()) {
      formData.append('description', description.trim());
    }

    // <<< Combine and add tags
    const customTags = customTagsString.split(',').map(tag => tag.trim()).filter(tag => tag !== '');
    const finalTags = [...new Set([...selectedPredefinedTags, ...customTags])];
    if (finalTags.length > 0) {
      formData.append('tags', JSON.stringify(finalTags));
    }

    try {
      await axios.post(`${API_BASE_URL}/api/accessory-images/upload`, formData, {
        headers: {
          ...config.headers,
          'Content-Type': 'multipart/form-data',
        },
      });
      toast({ title: "Upload Successful", status: "success", duration: 2000 });
      onUploadSuccess();
      handleClose();
    } catch (err) {
      console.error("Error uploading accessory:", err);
      const errorMsg = err.response?.data?.message || "Failed to upload accessory image";
      toast({ title: "Upload Failed", description: errorMsg, status: "error", duration: 3000 });
      setUploading(false);
    }
  };

  return (
    <Modal isOpen={isOpen} onClose={handleClose} isCentered size="xl">
      <ModalOverlay />
      <ModalContent>
        <ModalHeader>Upload New Accessory Image</ModalHeader>
        <ModalCloseButton />
        <ModalBody pb={6}>
          <VStack spacing={4} align="stretch">
            <FormControl isRequired>
              <FormLabel fontSize="sm">Accessory Image File</FormLabel>
              <Input
                type="file"
                accept="image/png, image/jpeg, image/webp"
                onChange={handleFileChange}
                ref={fileInputRef}
                style={{ display: 'none' }}
                isDisabled={uploading}
                pt={1}
              />
              <HStack>
                <Button
                  leftIcon={<Icon as={FaUpload}/>}
                  onClick={triggerFileInput}
                  variant="outline"
                  isDisabled={uploading}
                  flexShrink={0}
                  size="sm"
                >
                  Choose File
                </Button>
                {selectedFile && <Text fontSize="sm" noOfLines={1} flex={1}>{selectedFile.name}</Text>}
              </HStack>
            </FormControl>

            <HStack spacing={4}>
                <FormControl flex={1}>
                  <FormLabel fontSize="sm">Accessory Name (Optional)</FormLabel>
                  <Input
                    placeholder="E.g., Red Leather Handbag"
                    value={accessoryName}
                    onChange={(e) => setAccessoryName(e.target.value)}
                    isDisabled={uploading}
                    size="sm"
                  />
                </FormControl>
                <FormControl isRequired flex={1}>
                  <FormLabel fontSize="sm">Category</FormLabel>
                  <Select
                    placeholder="Select category"
                    value={selectedCategory}
                    onChange={(e) => setSelectedCategory(e.target.value)}
                    isDisabled={uploading}
                    size="sm"
                  >
                    {ACCESSORY_CATEGORIES.map(cat => (
                      <option key={cat} value={cat}>{cat.charAt(0).toUpperCase() + cat.slice(1)}</option>
                    ))}
                  </Select>
                </FormControl>
            </HStack>

            <FormControl>
              <FormLabel fontSize="sm">Description (Optional)</FormLabel>
              <Textarea
                placeholder="Add any notes about the accessory..."
                value={description}
                onChange={(e) => setDescription(e.target.value)}
                isDisabled={uploading}
                rows={2}
                size="sm"
              />
            </FormControl>

            <FormControl>
                <FormLabel fontSize="sm">Common Tags (Optional)</FormLabel>
                <CheckboxGroup
                    colorScheme='teal'
                    value={selectedPredefinedTags}
                    onChange={setSelectedPredefinedTags}
                 >
                    <Stack spacing={[1, 3]} direction={['column', 'row']} wrap="wrap">
                        {accessoryTagOptions.map(tag => (
                            <Checkbox key={tag} value={tag} isDisabled={uploading} size="sm">
                                {tag}
                            </Checkbox>
                        ))}
                    </Stack>
                </CheckboxGroup>
            </FormControl>

            <FormControl>
                <FormLabel fontSize="sm">Other Tags (Optional)</FormLabel>
                <Input
                    placeholder="E.g., vintage, gold-buckle"
                    value={customTagsString}
                    onChange={(e) => setCustomTagsString(e.target.value)}
                    isDisabled={uploading}
                    size="sm"
                />
                <FormHelperText>Separate custom tags with commas.</FormHelperText>
            </FormControl>

          </VStack>
        </ModalBody>
        <ModalFooter>
          <Button variant="ghost" mr={3} onClick={handleClose} isDisabled={uploading}>
            Cancel
          </Button>
          <Button
            onClick={handleUpload}
            isLoading={uploading}
            isDisabled={!selectedFile || !selectedCategory || uploading}
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
            Upload Accessory
          </Button>
        </ModalFooter>
      </ModalContent>
    </Modal>
  );
} 