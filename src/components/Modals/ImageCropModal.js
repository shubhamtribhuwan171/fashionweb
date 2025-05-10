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
  Box,
  useToast,
  VStack,
  Text,
  Center
} from '@chakra-ui/react';
import ReactCrop, { centerCrop, makeAspectCrop } from 'react-image-crop';
import 'react-image-crop/dist/ReactCrop.css';

// Helper function to generate a download for the cropped image
function downloadCroppedImage(image, crop, fileName) {
  if (!crop || !image) {
    console.error('Crop or image not available for download.');
    return;
  }

  const canvas = document.createElement('canvas');
  const scaleX = image.naturalWidth / image.width;
  const scaleY = image.naturalHeight / image.height;
  
  canvas.width = crop.width * scaleX;
  canvas.height = crop.height * scaleY;
  
  const ctx = canvas.getContext('2d');

  if (!ctx) {
    console.error('Failed to get canvas context');
    return;
  }

  // Ensure crop coordinates are not negative
  const cropX = Math.max(0, crop.x * scaleX);
  const cropY = Math.max(0, crop.y * scaleY);
  const cropWidth = crop.width * scaleX;
  const cropHeight = crop.height * scaleY;


  ctx.drawImage(
    image,
    cropX,
    cropY,
    cropWidth,
    cropHeight,
    0,
    0,
    cropWidth,
    cropHeight
  );

  return new Promise((resolve, reject) => {
    canvas.toBlob((blob) => {
      if (!blob) {
        console.error('Canvas is empty');
        reject(new Error('Canvas is empty'));
        return;
      }
      const fileUrl = window.URL.createObjectURL(blob);
      const link = document.createElement('a');
      link.href = fileUrl;
      link.download = fileName || 'cropped-image.png';
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      window.URL.revokeObjectURL(fileUrl);
      resolve();
    }, 'image/png');
  });
}


export default function ImageCropModal({ isOpen, onClose, imageUrl, imageName = 'cropped-image.png', fixedAspect }) {
  const toast = useToast();
  const imgRef = useRef(null);
  const [crop, setCrop] = useState(); // Default crop state (e.g., { unit: '%', width: 50, height: 50, x: 25, y: 25 })
  const [completedCrop, setCompletedCrop] = useState(null); // For storing the final crop
  const [isLoading, setIsLoading] = useState(false);

  const onImageLoad = useCallback((e) => {
    const { width, height, naturalWidth, naturalHeight } = e.currentTarget;
    if (fixedAspect) {
        // Center crop with aspect ratio
        const newCrop = centerCrop(
          makeAspectCrop(
            {
              unit: '%',
              width: 90, // Initial width percentage
            },
            fixedAspect,
            naturalWidth / naturalHeight // Image's aspect ratio
          ),
          width,
          height
        );
        setCrop(newCrop);
        setCompletedCrop(newCrop); // Also set completed crop initially
    } else {
        // Center crop without fixed aspect (e.g. 50% of image dimensions)
        const newCrop = centerCrop(
            makeAspectCrop(
              {
                unit: '%',
                width: 50,
                height: 50,
              },
              undefined, // no aspect ratio
              width,
              height
            ),
            width,
            height
          );
          setCrop(newCrop);
          setCompletedCrop(newCrop); // Also set completed crop initially
    }
  }, [fixedAspect]);

  const handleCropAndDownload = async () => {
    if (!completedCrop || !imgRef.current) {
      toast({
        title: 'Error',
        description: 'Please select a crop area first.',
        status: 'error',
        duration: 3000,
        isClosable: true,
      });
      return;
    }
    setIsLoading(true);
    try {
      await downloadCroppedImage(imgRef.current, completedCrop, imageName);
      toast({
        title: 'Success',
        description: 'Cropped image downloaded.',
        status: 'success',
        duration: 2000,
        isClosable: true,
      });
      onClose(); // Close modal on success
    } catch (error) {
      console.error('Error cropping image:', error);
      toast({
        title: 'Cropping Failed',
        description: 'Could not download the cropped image. Please try again.',
        status: 'error',
        duration: 3000,
        isClosable: true,
      });
    } finally {
      setIsLoading(false);
    }
  };
  
  // Reset crop when modal is opened with a new image or closed
  React.useEffect(() => {
    if (isOpen) {
      setCrop(undefined); // Reset crop
      setCompletedCrop(null);
      // If there's an image and imgRef.current is set, trigger onImageLoad
      // This helps re-center crop if image source changes or modal re-opens
      if (imageUrl && imgRef.current) {
          // Check if image is already loaded
          if (imgRef.current.complete && imgRef.current.naturalWidth > 0) {
              onImageLoad({ currentTarget: imgRef.current });
          } else {
            // If not loaded, the onLoad handler will trigger it
          }
      }
    }
  }, [isOpen, imageUrl, onImageLoad]);


  return (
    <Modal isOpen={isOpen} onClose={onClose} size="xl" isCentered>
      <ModalOverlay />
      <ModalContent mx={4}>
        <ModalHeader>Crop Image</ModalHeader>
        <ModalCloseButton />
        <ModalBody>
          {imageUrl ? (
            <VStack spacing={4}>
              <Center maxH="70vh" overflow="hidden">
                 <ReactCrop
                    crop={crop}
                    onChange={(c, pc) => setCrop(c)} // c is pixel crop, pc is percent crop
                    onComplete={(c) => setCompletedCrop(c)} // Store final crop for download
                    aspect={fixedAspect} // Optional: e.g., 16 / 9, 1 (for square), or leave undefined for freeform
                    // minWidth={100} // Optional: minimum crop width
                    // minHeight={100} // Optional: minimum crop height
                    // ruleOfThirds // Optional: shows rule of thirds lines
                  >
                    <img
                      ref={imgRef}
                      src={imageUrl}
                      alt="Crop preview"
                      style={{ maxHeight: '65vh', objectFit: 'contain' }}
                      onLoad={onImageLoad}
                      crossOrigin="anonymous" // Important for cross-origin images if served from different domain for canvas
                    />
                  </ReactCrop>
              </Center>
              <Text fontSize="sm" color="gray.500">
                Select an area to crop. Then click "Crop & Download".
              </Text>
            </VStack>
          ) : (
            <Text>No image to display for cropping.</Text>
          )}
        </ModalBody>
        <ModalFooter>
          <Button variant="ghost" onClick={onClose} mr={3} isDisabled={isLoading}>
            Cancel
          </Button>
          <Button
            colorScheme="purple"
            onClick={handleCropAndDownload}
            isLoading={isLoading}
            isDisabled={!completedCrop || !imageUrl}
          >
            Crop & Download
          </Button>
        </ModalFooter>
      </ModalContent>
    </Modal>
  );
} 