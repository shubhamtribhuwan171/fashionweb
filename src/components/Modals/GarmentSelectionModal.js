import React, { useState, useEffect } from 'react';
import {
  Modal,
  ModalOverlay,
  ModalContent,
  ModalHeader,
  Image,
  ModalFooter,
  ModalBody,
  ModalCloseButton,
  SimpleGrid,
  Button,
  Spinner,
  Text,
  Box,
  Input, 
  useDisclosure, 
  Center, 
  useColorModeValue,
  AspectRatio,
} from '@chakra-ui/react';
// Correct import path
import { getMockProducts } from '../../data/mockData'; 

// Simple clickable card specifically for the modal
function SelectableGarmentCard({ garment, onSelect }) {
    // Use reference_image_url from mockData structure
    const imageUrl = garment.reference_image_url || 'https://via.placeholder.com/150?text=No+Image'; 
    return (
        <Box 
            borderWidth="1px" 
            borderRadius="lg" 
            overflow="hidden" 
            p={3} 
            bg={useColorModeValue('white', 'gray.700')} 
            _hover={{ shadow: 'md', cursor: 'pointer', borderColor: 'blue.400' }} 
            onClick={() => onSelect(garment)} // Pass the whole garment object
            textAlign="center"
        >
            <AspectRatio ratio={1}>
                <Image 
                    src={imageUrl} 
                    alt={garment.name} 
                    borderRadius="md" 
                    objectFit="cover" 
                    mx="auto" 
                    mb={2} 
                />
            </AspectRatio>
            <Text fontSize="xs" fontWeight="medium" noOfLines={1}>{garment.name}</Text>
        </Box>
    );
}

export default function GarmentSelectionModal({ isOpen, onClose, onSelectGarment }) {
  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(false);
  const [searchTerm, setSearchTerm] = useState(''); 

  useEffect(() => {
    let isMounted = true;
    if (isOpen) {
      setLoading(true);
      setSearchTerm(''); // Reset search on open
      getMockProducts() // Use imported function
        .then(data => {
          if (isMounted) setProducts(data || []);
        })
        .catch(err => {
            console.error("Error fetching products for modal:", err);
             if (isMounted) setProducts([]);
        })
        .finally(() => {
           if (isMounted) setLoading(false);
        });
    }
    return () => { isMounted = false; };
  }, [isOpen]); 

  const handleSelect = (product) => {
    onSelectGarment(product); // Pass the full product object back
    onClose(); 
  };

  const filteredProducts = products.filter(p => 
    p.name.toLowerCase().includes(searchTerm.toLowerCase())
  );

  return (
    <Modal isOpen={isOpen} onClose={onClose} size="3xl" scrollBehavior="inside"> {/* Increased size */}
      <ModalOverlay />
      <ModalContent>
        <ModalHeader>Select a Base Garment</ModalHeader>
        <ModalCloseButton />
        <ModalBody pb={6}>
           <Input 
              placeholder="Search garments..." 
              value={searchTerm} 
              onChange={(e) => setSearchTerm(e.target.value)} 
              mb={4} 
            />
          {loading ? (
            <Center py={5}><Spinner /></Center>
          ) : filteredProducts.length > 0 ? (
            <SimpleGrid columns={{ base: 2, sm: 3, md: 4 }} spacing={4}>
              {filteredProducts.map((product) => (
                <SelectableGarmentCard 
                    key={product.id} 
                    garment={product} 
                    onSelect={handleSelect} 
                />
              ))}
            </SimpleGrid>
          ) : (
             <Center py={5}><Text>No garments found{searchTerm ? ' matching "' + searchTerm + '"' : ''}.</Text></Center>
          )}
        </ModalBody>
        {/* Footer removed for simplicity, selection happens on card click */}
      </ModalContent>
    </Modal>
  );
} 