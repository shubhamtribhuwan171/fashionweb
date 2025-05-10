import React, { useState, useRef, useEffect } from 'react';
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
  VStack,
  HStack,
  Textarea,
  Text,
  Spinner,
  Slider,
  SliderTrack,
  SliderFilledTrack,
  SliderThumb,
  useColorModeValue,
} from '@chakra-ui/react';
import { FaBrush, FaEraser } from 'react-icons/fa'; // Example icons

export default function MaskEditorModal({ isOpen, onClose, imageUrl, assetName, onGenerate }) {
  const [prompt, setPrompt] = useState('');
  const [brushSize, setBrushSize] = useState(20);
  const [isLoadingImage, setIsLoadingImage] = useState(true);
  const canvasRef = useRef(null); // For displaying the original image
  const maskCanvasRef = useRef(null); // For drawing the mask
  const imageRef = useRef(null); // To hold the loaded image object

  // Drawing state
  const [isDrawing, setIsDrawing] = useState(false);
  const [currentTool, setCurrentTool] = useState('brush'); // 'brush' or 'eraser'
  const [lastPosition, setLastPosition] = useState({ x: 0, y: 0 });

  const canvasBgColor = useColorModeValue('gray.100', 'gray.700');

  useEffect(() => {
    if (isOpen && imageUrl) {
      console.log('[MaskEditorModal] useEffect - Modal open, imageUrl:', imageUrl);
      setIsLoadingImage(true);
      const img = new window.Image();
      img.crossOrigin = "Anonymous";
      img.src = imageUrl;
      
      img.onload = () => {
        console.log('[MaskEditorModal] img.onload - Image loaded successfully:', img.src);
        imageRef.current = img;
        setIsLoadingImage(false); // Set loading to false BEFORE initializing canvases
        initializeCanvases(img);
      };
      img.onerror = (errorEvent) => {
        console.error("[MaskEditorModal] img.onerror - Failed to load image:", img.src, errorEvent);
        setIsLoadingImage(false);
        // TODO: Show an error message to the user in the modal
      };
    } else if (!isOpen) {
      console.log('[MaskEditorModal] useEffect - Modal closed, clearing canvases.');
      clearCanvas(canvasRef.current);
      clearCanvas(maskCanvasRef.current);
    }
  }, [isOpen, imageUrl]);

  const initializeCanvases = (img) => {
    const mainCanvas = canvasRef.current;
    const mCanvas = maskCanvasRef.current;
    if (!mainCanvas || !mCanvas || !img) {
      console.error('[MaskEditorModal] initializeCanvases - Aborting: mainCanvas, mCanvas, or img is null.');
      return;
    }

    console.log('[MaskEditorModal] initializeCanvases - Image natural W/H:', img.naturalWidth, img.naturalHeight);

    const aspectRatio = img.naturalWidth / img.naturalHeight;
    const container = mainCanvas.parentElement; // The Box holding the canvases
    if (!container) {
      console.error('[MaskEditorModal] initializeCanvases - Aborting: mainCanvas.parentElement is null.');
      return;
    }
    console.log('[MaskEditorModal] initializeCanvases - Container offset W/H:', container.offsetWidth, container.offsetHeight);
    
    let canvasWidth = container.offsetWidth;
    let canvasHeight = container.offsetWidth / aspectRatio;

    if (canvasHeight > container.offsetHeight) {
        canvasHeight = container.offsetHeight;
        canvasWidth = container.offsetHeight * aspectRatio;
    }
    console.log('[MaskEditorModal] initializeCanvases - Calculated display W/H:', canvasWidth, canvasHeight);
    
    // Set dimensions for both canvases
    [mainCanvas, mCanvas].forEach(cv => {
        cv.width = img.naturalWidth; // Draw at original resolution
        cv.height = img.naturalHeight;
        // Style for display (scaling down to fit)
        cv.style.width = `${canvasWidth}px`;
        cv.style.height = `${canvasHeight}px`;
    });
    
    const mainCtx = mainCanvas.getContext('2d');
    console.log('[MaskEditorModal] initializeCanvases - Drawing image to main canvas...');
    mainCtx.drawImage(img, 0, 0, mainCanvas.width, mainCanvas.height);
    console.log('[MaskEditorModal] initializeCanvases - Image drawn to main canvas.');

    const maskCtx = mCanvas.getContext('2d');
    maskCtx.clearRect(0, 0, mCanvas.width, mCanvas.height); // Ensure mask is clear initially
    
    console.log("[MaskEditorModal] Canvases initialized. Image on main, mask ready.");
  };
  
  const clearCanvas = (canvas) => {
    if (canvas) {
        const ctx = canvas.getContext('2d');
        ctx.clearRect(0, 0, canvas.width, canvas.height);
    }
  };

  const getMousePos = (canvas, evt) => {
    if (!canvas) return { x: 0, y: 0 };
    const rect = canvas.getBoundingClientRect();
    // Adjust for the intrinsic resolution vs. displayed size
    const scaleX = canvas.width / rect.width;
    const scaleY = canvas.height / rect.height;
    return {
      x: (evt.clientX - rect.left) * scaleX,
      y: (evt.clientY - rect.top) * scaleY
    };
  };

  const startDrawing = (e) => {
    // Use e.nativeEvent for React synthetic events to get clientX/Y
    const pos = getMousePos(maskCanvasRef.current, e.nativeEvent || e);
    setLastPosition(pos);
    setIsDrawing(true);
    // Prevent default touch behavior like scrolling when drawing
    if (e.preventDefault) e.preventDefault();
  };

  const draw = (e) => {
    if (!isDrawing || !maskCanvasRef.current) return;
    const maskCtx = maskCanvasRef.current.getContext('2d');
    const currentPos = getMousePos(maskCanvasRef.current, e.nativeEvent || e);

    maskCtx.beginPath();
    maskCtx.moveTo(lastPosition.x, lastPosition.y);
    maskCtx.lineTo(currentPos.x, currentPos.y);
    maskCtx.lineWidth = brushSize;
    maskCtx.lineCap = 'round';
    maskCtx.lineJoin = 'round';

    if (currentTool === 'brush') {
      maskCtx.globalCompositeOperation = 'source-over';
      // For the mask, the color itself isn't critical, but its alpha channel is.
      // Using a semi-transparent black for user visibility.
      // The OpenAI API docs specify: "Transparent areas (alpha value of 0) indicate where the image should be edited"
      // So, when we "brush", we are making parts of the mask OPAQUE, meaning these parts WILL NOT be edited by AI.
      // If you want the brush to define THE AREA TO BE EDITED, then this logic is inverted or the mask is inverted later.
      // Let's assume the brush marks the area TO KEEP (opaque in mask), and clear areas are for editing.
      // To make the brush define the editable area, you'd draw with full transparency or a specific color interpreted later.
      // For now, let's draw with black. White/transparent areas of the mask will be edited.
      maskCtx.strokeStyle = 'rgba(0, 0, 0, 1)'; // Opaque black for parts to keep from original
    } else if (currentTool === 'eraser') {
      maskCtx.globalCompositeOperation = 'destination-out'; // Erases drawn mask parts, making them transparent
    }
    maskCtx.stroke();
    setLastPosition(currentPos);
    if (e.preventDefault) e.preventDefault();
  };

  const stopDrawing = () => {
    setIsDrawing(false);
  };

  const handleGenerate = () => {
    if (!maskCanvasRef.current) {
      console.error("Mask canvas not ready.");
      // TODO: Show error to user
      return;
    }
    // The mask sent to OpenAI should have transparent areas where edits are desired.
    // Our current drawing makes brushed areas opaque (black).
    // If the API expects transparent areas to be edited, our current mask is correct:
    // - Areas the user *draws on* with the brush become opaque (black) -> these pixels are taken from the original image.
    // - Areas the user *erases* or *doesn't touch* remain transparent -> these pixels are editable by the AI.
    const maskDataUrl = maskCanvasRef.current.toDataURL('image/png');
    onGenerate(maskDataUrl, prompt);
  };

  const handleSetTool = (tool) => {
    setCurrentTool(tool);
  }

  return (
    <Modal isOpen={isOpen} onClose={onClose} size="4xl" scrollBehavior="inside">
      <ModalOverlay />
      <ModalContent mx={{ base: 2, md: 4}}>
        <ModalHeader>AI Mask Edit: {assetName}</ModalHeader>
        <ModalCloseButton />
        <ModalBody pb={6}>
          <VStack spacing={4} align="stretch">
            <Box
              position="relative"
              border="1px solid"
              borderColor="gray.300"
              rounded="md"
              h={{ base: "350px", md: "550px" }} // Adjusted height
              bg={canvasBgColor}
              display="flex"
              alignItems="center"
              justifyContent="center"
              overflow="hidden" // Ensure canvases don't overflow the box
              userSelect="none" // Prevent text selection during drawing
            >
              {isLoadingImage && <Spinner size="xl" />}
              <canvas
                ref={canvasRef}
                style={{
                  display: isLoadingImage ? 'none' : 'block',
                  // maxWidth: '100%', // Controlled by JS now
                  // maxHeight: '100%',// Controlled by JS now
                  objectFit: 'contain', // Should still apply if parent Box forces aspect
                }}
              />
              <canvas
                ref={maskCanvasRef}
                style={{
                  display: isLoadingImage ? 'none' : 'block',
                  position: 'absolute',
                  top: 0, // Positioned by JS based on parent alignment
                  left: 0, // Positioned by JS
                  touchAction: 'none', // Important for touch devices
                  cursor: 'crosshair'
                }}
                onMouseDown={startDrawing}
                onMouseMove={draw}
                onMouseUp={stopDrawing}
                onMouseLeave={stopDrawing} // Stop drawing if mouse leaves canvas bounds
                // For touch events
                onTouchStart={startDrawing}
                onTouchMove={draw}
                onTouchEnd={stopDrawing}
                onTouchCancel={stopDrawing}
              />
            </Box>

            <HStack spacing={4} justify="center" wrap="wrap">
              <Button 
                leftIcon={<FaBrush />} 
                onClick={() => handleSetTool('brush')} 
                size="sm" 
                colorScheme={currentTool === 'brush' ? 'purple' : 'gray'}
                variant={currentTool === 'brush' ? 'solid' : 'outline'}
              >
                Brush
              </Button>
              <Button 
                leftIcon={<FaEraser />} 
                onClick={() => handleSetTool('eraser')} 
                size="sm"
                colorScheme={currentTool === 'eraser' ? 'purple' : 'gray'}
                variant={currentTool === 'eraser' ? 'solid' : 'outline'}
              >
                Eraser
              </Button>
              <Box w={{base: "full", sm: "150px"}}>
                <Text fontSize="xs" mb={1} textAlign={{base: "center", sm: "left"}}>Brush Size: {brushSize}</Text>
                <Slider
                  aria-label="brush-size-slider"
                  value={brushSize} // Controlled component
                  min={2}
                  max={100}
                  onChange={(val) => setBrushSize(val)}
                >
                  <SliderTrack>
                    <SliderFilledTrack bg="purple.500" />
                  </SliderTrack>
                  <SliderThumb />
                </Slider>
              </Box>
            </HStack>

            <Textarea
              placeholder="Describe the entire desired final picture (e.g., 'A woman wearing a futuristic silver dress'). The mask will indicate what parts of the original image to keep."
              value={prompt}
              onChange={(e) => setPrompt(e.target.value)}
              rows={3}
            />
          </VStack>
        </ModalBody>

        <ModalFooter>
          <Button variant="ghost" mr={3} onClick={onClose}>
            Cancel
          </Button>
          <Button 
            colorScheme="purple" 
            onClick={handleGenerate} 
            isDisabled={isLoadingImage || !imageRef.current} // Disable if image not loaded
          >
            Generate
          </Button>
        </ModalFooter>
      </ModalContent>
    </Modal>
  );
} 