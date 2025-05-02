import React from 'react';
import { Select, Icon, Box } from '@chakra-ui/react';
import { FiChevronDown } from 'react-icons/fi';

// Remove TypeScript syntax
const StyledSelect = ({ options, children, placeholder, value, onChange, ...rest }) => {
  return (
    <Box position="relative" {...rest}> {/* Move width/maxWidth props here if needed */}
      <Select
        placeholder={placeholder}
        value={value}
        onChange={onChange}
        // Apply futuristic styling
        borderColor="gray.300" // Start with a subtle border
        bg="white" // Keep background light for readability
        color="gray.700"
        fontWeight="medium"
        icon={<Icon as={FiChevronDown} />} // Custom dropdown icon
        iconColor="gray.500"
        transition="all 0.25s cubic-bezier(.08,.52,.52,1)"
        borderRadius="md"
        boxShadow="sm" // Subtle initial shadow
        // Remove width/maxWidth from here as they should apply to the container Box
        _hover={{
          borderColor: 'purple.400', // Use a gradient color for hover border
          boxShadow: 'md', // Slightly larger shadow
          transform: 'scale(1.02)', // Subtle scale effect
        }}
        _focus={{
          borderColor: 'blue.500', // Use another gradient color for focus border
          boxShadow: 'outline', // Standard Chakra focus outline
          outline: 'none',
        }}
        // Spread remaining props intended for Select itself if any were specifically for it
        // {...rest} // Removed from here, moved to outer Box
      >
        {/* Render options if provided as a prop */}
        {options?.map(option => (
          <option key={option.value} value={option.value}>
            {option.label}
          </option>
        ))}
        {/* Render children if passed directly (e.g., <option>) */}
        {children}
      </Select>
    </Box>
  );
};

export default StyledSelect; 