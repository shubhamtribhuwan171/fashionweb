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
  CheckboxGroup,
  Checkbox,
  Stack,
  FormHelperText
} from '@chakra-ui/react';
import { FaUpload } from 'react-icons/fa';
import axios from 'axios';

// TODO: Move to config or central place
const API_BASE_URL = 'https://productmarketing-ai-f0e989e4e1ad.herokuapp.com';

// TODO: Replace with actual workspace ID from context/state management
const getMockWorkspaceId = () => '95d29ad4-47fa-48ee-85cb-cbf762eb400a';

// Define predefined pose tags
const poseTagOptions = ["standing", "sitting", "action", "relaxed", "full body", "upper body", "profile", "dynamic"];

export default function UploadPoseModal({ isOpen, onClose, onUploadSuccess }) {
  const [uploading, setUploading] = useState(false);
  const [poseName, setPoseName] = useState('');
  const [selectedFile, setSelectedFile] = useState(null);
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

  const handleFileChange = (event) => {
    if (event.target.files && event.target.files[0]) {
      setSelectedFile(event.target.files[0]);
    } else {
      setSelectedFile(null);
    }
  };

  const triggerFileInput = () => {
    fileInputRef.current?.click();
  };

  const handleClose = () => {
    setPoseName('');
    setSelectedFile(null);
    setSelectedPredefinedTags([]);
    setCustomTagsString('');
    setUploading(false);
    if (fileInputRef.current) fileInputRef.current.value = '';
    onClose();
  };

  const handleUpload = async () => {
    if (!selectedFile || !currentWorkspaceId) {
      toast({ title: "Upload Error", description: "Please select a file.", status: "warning", duration: 3000 });
      return;
    }
    const config = getAuthConfig();
    if (!config) return;

    setUploading(true);

    // Prepare FormData correctly
    const formData = new FormData();
    formData.append('poseImage', selectedFile);     // The image file
    formData.append('workspace_id', currentWorkspaceId); // Workspace ID in body (snake_case)
    if (poseName.trim()) {
      formData.append('name', poseName.trim());     // Optional name in body
    }

    // Combine and prepare tags
    const customTags = customTagsString.split(',').map(tag => tag.trim()).filter(tag => tag !== '');
    const finalTags = [...new Set([...selectedPredefinedTags, ...customTags])]; // Combine and ensure unique

    if (finalTags.length > 0) {
      formData.append('tags', JSON.stringify(finalTags));
    }
    // TODO: Add description, is_favorite if needed for poses later

    const url = `${API_BASE_URL}/api/poses`;
    console.log("Uploading pose to URL:", url, "with FormData keys:", [...formData.keys()]); // Log keys

    try {
      await axios.post(url, formData, {
        headers: {
          ...config.headers,
          // Axios handles Content-Type for FormData
        },
      });
      toast({ title: "Pose Upload Successful", status: "success", duration: 2000 });
      onUploadSuccess();
      handleClose();
    } catch (err) {
      console.error("Error uploading pose:", err);
      const errorMsg = err.response?.data?.message || err.message || "Failed to upload pose image";
      toast({ title: "Upload Failed", description: errorMsg, status: "error", duration: 4000 });
      setUploading(false);
    }
  };

  return (
    <Modal isOpen={isOpen} onClose={handleClose} isCentered size="lg">
      <ModalOverlay />
      <ModalContent>
        <ModalHeader>Upload New Pose</ModalHeader>
        <ModalCloseButton />
        <ModalBody pb={6}>
          <VStack spacing={4} align="stretch">
            <FormControl isRequired>
              <FormLabel fontSize="sm">Pose Image File</FormLabel>
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

            <FormControl>
              <FormLabel fontSize="sm">Pose Name (Optional)</FormLabel>
              <Input
                placeholder="Enter a name for the pose"
                value={poseName}
                onChange={(e) => setPoseName(e.target.value)}
                isDisabled={uploading}
                size="sm"
              />
            </FormControl>

            <FormControl>
                <FormLabel fontSize="sm">Common Tags (Optional)</FormLabel>
                <CheckboxGroup
                    colorScheme='purple'
                    value={selectedPredefinedTags}
                    onChange={setSelectedPredefinedTags}
                 >
                    <Stack spacing={[1, 3]} direction={['column', 'row']} wrap="wrap">
                        {poseTagOptions.map(tag => (
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
                    placeholder="E.g., dynamic, contrapposto"
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
          <Button variant="ghost" mr={3} onClick={handleClose} isDisabled={uploading}>Cancel</Button>
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
            Upload Pose
          </Button>
        </ModalFooter>
      </ModalContent>
    </Modal>
  );
} 