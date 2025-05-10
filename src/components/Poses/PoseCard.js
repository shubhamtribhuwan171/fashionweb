import React from 'react';
import {
  Box,
  Image,
  useColorModeValue,
  AspectRatio,
  Text,
  VStack,
  Tag
} from '@chakra-ui/react';

export default function PoseCard({ pose }) {
  const cardBg = useColorModeValue('white', 'gray.800');
  const imageUrl = pose.storage_url || 'https://via.placeholder.com/150?text=No+Pose';

  return (
    <Box 
      borderWidth="1px" 
      borderRadius="lg" 
      overflow="hidden" 
      bg={cardBg} 
      _hover={{ shadow: 'md' }} 
    >
      <AspectRatio ratio={1}> 
        <Image
          src={imageUrl}
          alt={pose.name || 'Pose Image'}
          objectFit="contain"
          p={2}
        />
      </AspectRatio>
      
      <VStack p={2} spacing={1} align="center">
        {pose.name && (
          <Text fontSize="xs" fontWeight="medium" isTruncated w="full" textAlign="center">
            {pose.name}
          </Text>
        )}
        {pose.visibility && (
          <Tag size="xs" variant="subtle" colorScheme={pose.visibility === 'public' ? 'blue' : 'green'}>
            {pose.visibility === 'public' ? 'Public' : 'Private'}
          </Tag>
        )}
      </VStack>
    </Box>
  );
} 