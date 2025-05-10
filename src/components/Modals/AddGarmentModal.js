import React, { useState, useEffect } from 'react';
import {
  Modal,
  ModalOverlay,
  ModalContent,
  ModalHeader,
  ModalFooter,
  ModalBody,
  ModalCloseButton,
  Button,
  FormControl,
  FormLabel,
  Input,
  VStack,
  useToast,
  Select,
  Spacer,
  Flex,
  Image,
  Box,
  Textarea,
  CheckboxGroup,
  Checkbox,
  Stack,
  FormHelperText,
  Switch
} from '@chakra-ui/react';

const garmentTagOptions = ["basics", "cotton", "denim", "formal", "casual", "summer", "winter", "outerwear", "athletic"];

export default function AddGarmentModal({ isOpen, onClose, onAddGarmentWithUpload }) {
  const toast = useToast();
  const [name, setName] = useState('');
  const [imageFile, setImageFile] = useState(null);
  const [previewUrl, setPreviewUrl] = useState(null);
  const [isLoading, setIsLoading] = useState(false);
  const [garmentType, setGarmentType] = useState('top');
  const [description, setDescription] = useState('');
  const [isFavorite, setIsFavorite] = useState(false);
  const [selectedPredefinedTags, setSelectedPredefinedTags] = useState([]);
  const [customTagsString, setCustomTagsString] = useState('');

  useEffect(() => {
    if (!imageFile) {
      setPreviewUrl(null);
      return;
    }
    const objectUrl = URL.createObjectURL(imageFile);
    setPreviewUrl(objectUrl);

    return () => URL.revokeObjectURL(objectUrl);
  }, [imageFile]);

  const handleFileChange = (e) => {
    if (e.target.files && e.target.files[0]) {
      setImageFile(e.target.files[0]);
    } else {
      setImageFile(null);
    }
  };

  const handleSave = async () => {
    if (!name.trim() || !imageFile) {
      toast({ title: 'Please provide both a name and an image file.', status: 'warning', duration: 3000 });
      return;
    }

    setIsLoading(true);

    const customTags = customTagsString.split(',').map(tag => tag.trim()).filter(tag => tag !== '');
    const finalTags = [...new Set([...selectedPredefinedTags, ...customTags])];

    const garmentData = {
      name: name.trim(),
      imageFile: imageFile,
      garmentType,
      description: description.trim(),
      tags: finalTags,
      is_favorite: isFavorite
    };

    console.log('Attempting to add garment with upload:', garmentData);

    try {
      await onAddGarmentWithUpload(garmentData);
      handleClose();
    } catch (error) {
      console.error("Error in add garment process (modal perspective):", error);
      toast({ title: 'Failed to Add Garment', description: error.message || 'An unexpected error occurred.', status: 'error', duration: 5000 });
    } finally {
      setIsLoading(false);
    }
  };

  const handleClose = () => {
      setName('');
      setImageFile(null);
      setGarmentType('top');
      setDescription('');
      setIsFavorite(false);
      setSelectedPredefinedTags([]);
      setCustomTagsString('');
      setPreviewUrl(null);
      setIsLoading(false);
      onClose();
  }

  return (
    <Modal isOpen={isOpen} onClose={handleClose} size="xl" isCentered>
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
          Add New Apparel Item
        </ModalHeader>
        <ModalCloseButton top={4} right={4} />
        <ModalBody py={6} px={6}>
          <VStack spacing={5}>
            <FormControl isRequired>
              <FormLabel fontSize="sm" fontWeight="medium">Reference Image</FormLabel>
              <Input
                type="file"
                accept="image/png, image/jpeg, image/webp"
                onChange={handleFileChange}
                p={1.5}
                borderRadius="md"
                isDisabled={isLoading}
                size="sm"
              />
            </FormControl>
            {previewUrl && (
              <Box mt={2} mb={2} borderWidth="1px" borderRadius="md" p={2} maxW="200px" mx="auto">
                <Image src={previewUrl} alt="Image Preview" maxH="150px" borderRadius="sm" />
              </Box>
            )}

            <FormControl isRequired>
              <FormLabel fontSize="sm" fontWeight="medium">Apparel Name</FormLabel>
              <Input
                placeholder="e.g., Black Cotton Hoodie"
                value={name}
                onChange={(e) => setName(e.target.value)}
                borderRadius="md"
                isDisabled={isLoading}
                size="sm"
              />
            </FormControl>
            <FormControl isRequired>
              <FormLabel fontSize="sm" fontWeight="medium">Garment Type</FormLabel>
              <Select value={garmentType} onChange={(e) => setGarmentType(e.target.value)} isDisabled={isLoading} size="sm">
                <option value="top">Top</option>
                <option value="bottom">Bottom</option>
                <option value="other">Other</option>
              </Select>
            </FormControl>

            <FormControl>
              <FormLabel fontSize="sm" fontWeight="medium">Description (Optional)</FormLabel>
              <Textarea
                placeholder="e.g., Heavyweight cotton, slightly oversized fit"
                value={description}
                onChange={(e) => setDescription(e.target.value)}
                isDisabled={isLoading}
                rows={2}
                size="sm"
              />
            </FormControl>

             <FormControl>
                <FormLabel fontSize="sm" fontWeight="medium">Common Tags (Optional)</FormLabel>
                <CheckboxGroup
                    colorScheme='blue'
                    value={selectedPredefinedTags}
                    onChange={setSelectedPredefinedTags}
                 >
                    <Stack spacing={[1, 3]} direction={['column', 'row']} wrap="wrap">
                        {garmentTagOptions.map(tag => (
                            <Checkbox key={tag} value={tag} isDisabled={isLoading} size="sm">
                                {tag}
                            </Checkbox>
                        ))}
                    </Stack>
                </CheckboxGroup>
            </FormControl>
            <FormControl>
                <FormLabel fontSize="sm" fontWeight="medium">Other Tags (Optional)</FormLabel>
                <Input
                    placeholder="e.g., vintage, graphic-print"
                    value={customTagsString}
                    onChange={(e) => setCustomTagsString(e.target.value)}
                    isDisabled={isLoading}
                    size="sm"
                />
                <FormHelperText>Separate custom tags with commas.</FormHelperText>
            </FormControl>

            <FormControl display="flex" alignItems="center">
                <FormLabel htmlFor="is-favorite" mb="0" fontSize="sm" fontWeight="medium">
                    Mark as Favorite?
                </FormLabel>
                <Switch 
                    id="is-favorite" 
                    isChecked={isFavorite} 
                    onChange={(e) => setIsFavorite(e.target.checked)} 
                    isDisabled={isLoading} 
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
            <Button variant="ghost" mr={3} onClick={handleClose} isDisabled={isLoading}>
              Cancel
            </Button>
            <Button 
              onClick={handleSave} 
              isLoading={isLoading}
              isDisabled={isLoading || !name.trim() || !imageFile}
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
              Add Apparel
            </Button>
          </Flex>
        </ModalFooter>
      </ModalContent>
    </Modal>
  );
} 