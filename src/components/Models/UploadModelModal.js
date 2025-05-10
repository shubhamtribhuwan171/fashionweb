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
  HStack,
  Text,
  Icon,
  useToast,
  Textarea,
  FormHelperText,
  Select,
  Grid,
  GridItem
} from '@chakra-ui/react';
import { FaUpload, FaPlus } from 'react-icons/fa';
import axios from 'axios';

// TODO: Move to config or central place
const API_BASE_URL = 'https://productmarketing-ai-f0e989e4e1ad.herokuapp.com';

// TODO: Replace with actual workspace ID from context/state management
const getMockWorkspaceId = () => '95d29ad4-47fa-48ee-85cb-cbf762eb400a';

// Define options for Select components
const genderOptions = ["female", "male", "non-binary", "other"];
const bodyTypeOptions = ["average", "athletic", "plus size", "petite", "other"];
const skinToneOptions = ["fair", "light", "olive", "medium", "tan", "dark", "ebony", "other"];

export default function UploadModelModal({ isOpen, onClose, onUploadSuccess }) {
  const [uploading, setUploading] = useState(false);
  const [modelName, setModelName] = useState('');
  const [selectedFile, setSelectedFile] = useState(null);
  const [description, setDescription] = useState('');
  const [tagsString, setTagsString] = useState('');
  const [gender, setGender] = useState('');
  const [bodyType, setBodyType] = useState('');
  const [hair, setHair] = useState('');
  const [skinTone, setSkinTone] = useState('');
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
    setModelName('');
    setSelectedFile(null);
    setDescription('');
    setTagsString('');
    setGender('');
    setBodyType('');
    setHair('');
    setSkinTone('');
    setUploading(false);
    if (fileInputRef.current) fileInputRef.current.value = '';
    onClose();
  };

  // Handle Upload
  const handleUpload = async () => {
    if (!selectedFile || !currentWorkspaceId) {
      toast({ title: "Upload Error", description: "Please select a file.", status: "warning", duration: 3000 });
      return;
    }
    const config = getAuthConfig();
    if (!config) return;

    setUploading(true);

    const formData = new FormData();
    formData.append('image', selectedFile);
    formData.append('workspaceId', currentWorkspaceId);
    if (modelName.trim()) {
      formData.append('name', modelName.trim());
    }
    if (description.trim()) {
      formData.append('description', description.trim());
    }
    const tags = tagsString.split(',').map(tag => tag.trim()).filter(tag => tag !== '');
    if (tags.length > 0) {
      formData.append('tags', JSON.stringify(tags));
    }
    if (gender) {
      formData.append('gender', gender);
    }
    if (bodyType) {
      formData.append('body_type', bodyType);
    }
    if (hair.trim()) {
      formData.append('hair', hair.trim());
    }
    if (skinTone) {
      formData.append('skin_tone', skinTone);
    }

    try {
      await axios.post(`${API_BASE_URL}/api/model-images/upload`, formData, {
        headers: {
          ...config.headers,
          'Content-Type': 'multipart/form-data',
        },
      });
      toast({ title: "Upload Successful", status: "success", duration: 2000 });
      onUploadSuccess(); // Call the callback to refresh the list
      handleClose(); // Close modal and reset state
    } catch (err) {
      console.error("Error uploading model:", err);
      const errorMsg = err.response?.data?.message || "Failed to upload model image";
      toast({ title: "Upload Failed", description: errorMsg, status: "error", duration: 3000 });
      setUploading(false); // Keep modal open on error
    }
  };

  return (
    <Modal isOpen={isOpen} onClose={handleClose} isCentered size="2xl">
      <ModalOverlay />
      <ModalContent>
        <ModalHeader>Upload New Model Image</ModalHeader>
        <ModalCloseButton />
        <ModalBody pb={6}>
          <VStack spacing={4} align="stretch">
            <Grid templateColumns="repeat(2, 1fr)" gap={4}>
              <GridItem>
                <FormControl isRequired>
                  <FormLabel fontSize="sm">Model Image File</FormLabel>
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
              </GridItem>
              <GridItem>
                <FormControl>
                  <FormLabel fontSize="sm">Model Name (Optional)</FormLabel>
                  <Input
                    placeholder="E.g., Sitting Pose, Studio Lighting"
                    value={modelName}
                    onChange={(e) => setModelName(e.target.value)}
                    isDisabled={uploading}
                    size="sm"
                  />
                </FormControl>
              </GridItem>
            </Grid>

            <Grid templateColumns="repeat(4, 1fr)" gap={4}>
              <GridItem>
                <FormControl>
                  <FormLabel fontSize="sm">Gender (Optional)</FormLabel>
                  <Select 
                    placeholder="Select..."
                    value={gender}
                    onChange={(e) => setGender(e.target.value)}
                    isDisabled={uploading}
                    size="sm"
                  >
                    {genderOptions.map(opt => <option key={opt} value={opt}>{opt}</option>)}
                  </Select>
                </FormControl>
              </GridItem>
              <GridItem>
                <FormControl>
                  <FormLabel fontSize="sm">Body Type (Optional)</FormLabel>
                  <Select 
                    placeholder="Select..."
                    value={bodyType}
                    onChange={(e) => setBodyType(e.target.value)}
                    isDisabled={uploading}
                    size="sm"
                  >
                    {bodyTypeOptions.map(opt => <option key={opt} value={opt}>{opt}</option>)}
                  </Select>
                </FormControl>
              </GridItem>
              <GridItem>
                <FormControl>
                  <FormLabel fontSize="sm">Skin Tone (Optional)</FormLabel>
                  <Select 
                    placeholder="Select..."
                    value={skinTone}
                    onChange={(e) => setSkinTone(e.target.value)}
                    isDisabled={uploading}
                    size="sm"
                  >
                    {skinToneOptions.map(opt => <option key={opt} value={opt}>{opt}</option>)}
                  </Select>
                </FormControl>
              </GridItem>
              <GridItem>
                <FormControl>
                  <FormLabel fontSize="sm">Hair (Optional)</FormLabel>
                  <Input
                    placeholder="E.g., blonde, long"
                    value={hair}
                    onChange={(e) => setHair(e.target.value)}
                    isDisabled={uploading}
                    size="sm"
                  />
                </FormControl>
              </GridItem>
            </Grid>

            <FormControl>
              <FormLabel fontSize="sm">Description (Optional)</FormLabel>
              <Textarea
                placeholder="Add any notes about the model or pose..."
                value={description}
                onChange={(e) => setDescription(e.target.value)}
                isDisabled={uploading}
                rows={2}
                size="sm"
              />
            </FormControl>

            <FormControl>
              <FormLabel fontSize="sm">Tags (Optional)</FormLabel>
              <Input
                placeholder="E.g., studio, female, full-body, casual"
                value={tagsString}
                onChange={(e) => setTagsString(e.target.value)}
                isDisabled={uploading}
                size="sm"
              />
              <FormHelperText>Separate tags with commas.</FormHelperText>
            </FormControl>
          </VStack>
        </ModalBody>
        <ModalFooter>
          <Button variant="ghost" mr={3} onClick={handleClose} isDisabled={uploading}>
            Cancel
          </Button>
          <Button
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
            onClick={handleUpload}
            isLoading={uploading}
            isDisabled={!selectedFile || uploading}
          >
            Upload
          </Button>
        </ModalFooter>
      </ModalContent>
    </Modal>
  );
} 