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
  SimpleGrid,
  Box,
  useRadio,
  useRadioGroup,
  Text,
  Spinner,
  Center,
} from '@chakra-ui/react';
import { getMockMoods } from '../../data/mockData'; // Assuming moods are fetched here

// Custom Radio Card for selection
function MoodCard(props) {
  const { getInputProps, getRadioProps } = useRadio(props);
  const input = getInputProps();
  const checkbox = getRadioProps();

  return (
    <Box as="label">
      <input {...input} />
      <Box
        {...checkbox}
        cursor="pointer"
        borderWidth="1px"
        borderRadius="md"
        boxShadow="md"
        _checked={{
          bg: 'purple.600',
          color: 'white',
          borderColor: 'purple.600',
        }}
        _focus={{
          boxShadow: 'outline',
        }}
        px={5}
        py={3}
        textAlign="center"
      >
        <Text fontSize="md" fontWeight="bold">{props.mood.name}</Text>
        <Text fontSize="sm" color="gray.500">{props.mood.description}</Text>
      </Box>
    </Box>
  );
}

function MoodSelectionModal({ isOpen, onClose, onSelectMood }) {
  const [moods, setMoods] = useState([]);
  const [loading, setLoading] = useState(false);
  const [selectedMoodId, setSelectedMoodId] = useState(null);

  useEffect(() => {
    let isMounted = true;
    if (isOpen) {
      setLoading(true);
      setSelectedMoodId(null);
      getMockMoods()
        .then(data => {
          if (isMounted) setMoods(data || []);
        })
        .catch(err => {
          console.error("Error fetching moods for modal:", err);
          if (isMounted) setMoods([]);
        })
        .finally(() => {
          if (isMounted) setLoading(false);
        });
    }
    return () => { isMounted = false; };
  }, [isOpen]);

  const { getRootProps, getRadioProps } = useRadioGroup({
    name: 'mood',
    onChange: setSelectedMoodId,
  });

  const group = getRootProps();

  const handleSelect = () => {
    const selectedMood = moods.find(m => m.id === selectedMoodId);
    if (selectedMood) {
      onSelectMood(selectedMood);
    }
    onClose(); // Close modal after selection
  };

  return (
    <Modal isOpen={isOpen} onClose={onClose} size="lg">
      <ModalOverlay />
      <ModalContent>
        <ModalHeader>Select Mood</ModalHeader>
        <ModalCloseButton />
        <ModalBody>
          {loading ? (
            <Center py={5}><Spinner /></Center>
          ) : (
            <SimpleGrid columns={{ base: 1, md: 2 }} spacing={4} {...group}>
              {moods.length > 0 ? (
                moods.map((mood) => {
                  const radio = getRadioProps({ value: mood.id });
                  return <MoodCard key={mood.id} mood={mood} {...radio} />;
                })
              ) : (
                <Center py={5}><Text>No moods found.</Text></Center>
              )}
            </SimpleGrid>
          )}
        </ModalBody>

        <ModalFooter>
          <Button variant="ghost" mr={3} onClick={onClose}>
            Cancel
          </Button>
          <Button colorScheme="purple" onClick={handleSelect} isDisabled={!selectedMoodId}>
            Select Mood
          </Button>
        </ModalFooter>
      </ModalContent>
    </Modal>
  );
}

export default MoodSelectionModal; 