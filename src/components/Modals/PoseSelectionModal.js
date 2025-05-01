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
  Image,
  useRadio,
  useRadioGroup,
  VStack,
  Text,
  Spinner,
  Center,
} from '@chakra-ui/react';
import { getMockPoses } from '../../data/mockData'; // Assuming poses are fetched here

// Custom Radio Card for selection
function PoseCard(props) {
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
          bg: 'teal.600',
          color: 'white',
          borderColor: 'teal.600',
        }}
        _focus={{
          boxShadow: 'outline',
        }}
        px={5}
        py={3}
        textAlign="center"
      >
        <Image src={props.pose.imageUrl} alt={props.pose.name} boxSize="100px" objectFit="cover" mx="auto" mb={2} borderRadius="md" />
        <Text fontSize="sm">{props.pose.name}</Text>
      </Box>
    </Box>
  );
}

function PoseSelectionModal({ isOpen, onClose, onSelectPose }) {
  const [poses, setPoses] = useState([]);
  const [loading, setLoading] = useState(false);
  const [selectedPoseId, setSelectedPoseId] = useState(null);

  useEffect(() => {
    let isMounted = true;
    if (isOpen) {
      setLoading(true);
      setSelectedPoseId(null);
      getMockPoses()
        .then(data => {
          if (isMounted) setPoses(data || []);
        })
        .catch(err => {
          console.error("Error fetching poses for modal:", err);
          if (isMounted) setPoses([]);
        })
        .finally(() => {
          if (isMounted) setLoading(false);
        });
    }
    return () => { isMounted = false; };
  }, [isOpen]);

  const { getRootProps, getRadioProps } = useRadioGroup({
    name: 'pose',
    onChange: setSelectedPoseId,
  });

  const group = getRootProps();

  const handleSelect = () => {
    const selectedPose = poses.find(p => p.id === selectedPoseId);
    if (selectedPose) {
      onSelectPose(selectedPose);
    }
    onClose(); // Close modal after selection
  };

  return (
    <Modal isOpen={isOpen} onClose={onClose} size="xl">
      <ModalOverlay />
      <ModalContent>
        <ModalHeader>Select Pose</ModalHeader>
        <ModalCloseButton />
        <ModalBody>
          {loading ? (
            <Center py={5}><Spinner /></Center>
          ) : (
            <SimpleGrid columns={{ base: 2, md: 3 }} spacing={4} {...group}>
              {poses.length > 0 ? (
                poses.map((pose) => {
                  const radio = getRadioProps({ value: pose.id });
                  return <PoseCard key={pose.id} pose={pose} {...radio} />;
                })
              ) : (
                <Center py={5}><Text>No poses found.</Text></Center>
              )}
            </SimpleGrid>
          )}
        </ModalBody>

        <ModalFooter>
          <Button variant="ghost" mr={3} onClick={onClose}>
            Cancel
          </Button>
          <Button colorScheme="teal" onClick={handleSelect} isDisabled={!selectedPoseId}>
            Select Pose
          </Button>
        </ModalFooter>
      </ModalContent>
    </Modal>
  );
}

export default PoseSelectionModal; 