import React, { useState } from 'react';
import { Box, VStack, Button, Link as ChakraLink, Divider, Flex, Text, Icon, Badge, Menu, MenuButton, MenuList, MenuItem, Avatar, IconButton } from '@chakra-ui/react';
import { NavLink as RouterNavLink, useNavigate, useLocation } from 'react-router-dom';
import { FiHome, FiLayers, FiPlusSquare, FiGrid, FiBox, FiSettings, FiLogOut, FiChevronDown, FiChevronUp, FiBriefcase, FiPlus, FiCompass, FiStar, FiShoppingBag, FiUser, FiGift, FiMessageSquare, FiThumbsUp, FiCheck, FiMeh } from 'react-icons/fi';

// Custom NavLink style for active state
const activeLinkStyle = {
  backgroundColor: 'white',
  color: 'gray.800', // Darker text for active item
  fontWeight: 'semibold',
  borderRadius: 'md', // Slightly less rounded corners
  boxShadow: 'sm', // Subtle shadow for active item
};

const baseLinkStyle = {
  display: 'flex',
  alignItems: 'center',
  padding: '0.75rem 1.5rem',
  borderRadius: 'md', // Match active style
  color: 'gray.600', // Medium gray for inactive text
  _hover: {
    backgroundColor: 'whiteAlpha.500', // Subtle white hover
    color: 'gray.800',
  },
};

// Nested link style for sub-items
const nestedLinkStyle = {
  display: 'flex',
  alignItems: 'center',
  padding: '0.5rem 0.5rem 0.5rem 3rem',
  color: 'gray.600',
  borderRadius: 'md',
  _hover: {
    backgroundColor: 'whiteAlpha.500',
    color: 'gray.800',
  },
};

const nestedActiveLinkStyle = {
  backgroundColor: 'white', // White background for active nested
  color: 'gray.800',
  fontWeight: 'semibold',
  boxShadow: 'sm',
};

function SidebarNavLink({ to, icon, children, badge }) {
  return (
    <ChakraLink
      as={RouterNavLink}
      to={to}
      style={({ isActive }) => ({ ...baseLinkStyle, ...(isActive ? activeLinkStyle : {}) })}
      _focus={{ boxShadow: 'none' }}
      width="100%"
    >
      <Icon as={icon} mr={3} w={5} h={5} />
      {children}
      {badge && (
        <Badge ml="auto" colorScheme="purple" variant="solid" fontSize="xs"> {/* Changed badge color */}
          {badge}
        </Badge>
      )}
    </ChakraLink>
  );
}

function NestedNavLink({ to, children }) {
  return (
    <ChakraLink
      as={RouterNavLink}
      to={to}
      style={({ isActive }) => ({ ...nestedLinkStyle, ...(isActive ? nestedActiveLinkStyle : {}) })}
      _focus={{ boxShadow: 'none' }}
      width="100%"
      borderRadius="md"
    >
      {children}
    </ChakraLink>
  );
}

function CollapsibleSection({ icon, title, children, isOpenByDefault = false }) {
  const [isOpen, setIsOpen] = useState(isOpenByDefault);
  
  return (
    <Box width="100%" mb={2}>
      <Button
        onClick={() => setIsOpen(!isOpen)}
        variant="ghost"
        justifyContent="flex-start"
        width="100%"
        py={2}
        px={4}
        leftIcon={<Icon as={icon} mr={2} />}
        rightIcon={<Icon as={FiChevronDown} transform={isOpen ? 'rotate(180deg)' : 'rotate(0)'} transition="transform 0.2s" />}
        borderRadius="md"
        color="gray.600" // Match inactive text color
        _hover={{ bg: 'whiteAlpha.500' }} // Match hover style
      >
        {title}
      </Button>
      <Box
        height={isOpen ? 'auto' : '0'}
        overflow="hidden"
        transition="height 0.2s"
        ml={2}
        mt={isOpen ? 2 : 0}
      >
        {children}
      </Box>
    </Box>
  );
}

// Section Header Component
function SectionHeader({ title }) {
  return (
    <Text
      fontSize="xs"
      fontWeight="semibold"
      color="gray.500"
      textTransform="uppercase"
      letterSpacing="wider"
      px={4}
      py={2}
      mt={4}
      mb={1}
    >
      {title}
    </Text>
  );
}

function WorkspaceSelector({ currentWorkspace, userWorkspaces = [], onAddWorkspace, onSwitchWorkspace, isLoading, userInfo }) {
  const current = currentWorkspace;
  // Filter out the "Global Asset Library"
  const workspaces = userWorkspaces.filter(ws => ws.name !== "Global Asset Library");

  if (isLoading) {
    return (
      <Button w="full" variant="ghost" mb={6} isLoading={true} justifyContent="flex-start" px={3} py={2} h="auto" borderRadius="md">Loading...</Button>
    );
  }

  if (!current) {
    return (
       <Button w="full" variant="ghost" mb={6} justifyContent="flex-start" px={3} py={2} h="auto" borderRadius="md" onClick={onAddWorkspace}>
           No Workspace Found
       </Button>
    );
  }
  
  return (
    <Menu placement="bottom-start" >
      {({ isOpen }) => (
        <>
          <MenuButton 
            as={Button}
            w="full" 
            variant="ghost" 
            mb={6} 
            _hover={{ bg: 'whiteAlpha.500' }}
            _active={{ bg: 'whiteAlpha.700' }}
            textAlign="left"
            px={3}
            py={2} // Adjusted padding
            h="auto"
            borderRadius="md"
            position="relative" // Needed for absolute positioning of arrow
            isDisabled={isLoading} // Disable button while loading
          >
            <Flex align="center" w="full">
              {/* Avatar Icon */}
              <Avatar 
                icon={<Icon as={FiBriefcase} color="white" />}
                size="md" // Slightly larger avatar
                mr={3} 
                bg="gray.600" 
                borderRadius="md" // Match button radius
              /> 
              {/* Text Content */}
              <VStack align="start" spacing={0} flex="1" overflow="hidden">
                <Text fontWeight="semibold" fontSize="sm" color="gray.700" isTruncated>
                  {current.name}
                </Text>
              </VStack>
              {/* Arrow Icon - Positioned absolutely */}
              <Icon 
                as={isOpen ? FiChevronUp : FiChevronDown} 
                position="absolute" 
                right={3} 
                bottom={2} // Position below text
                color="gray.500" 
              />
            </Flex>
          </MenuButton>
          <MenuList zIndex="popover" minWidth="220px"> {/* Ensure minimum width */} 
            {workspaces.map((ws) => (
              <MenuItem 
                key={ws.id} 
                onClick={() => onSwitchWorkspace(ws.id)} 
                py={2} // Vertical padding for menu items
              >
                <Flex align="center" w="full">
                  <Avatar 
                    icon={<Icon as={FiBriefcase} color="white" />}
                    size="sm" 
                    mr={3} 
                    bg="gray.400" 
                    borderRadius="md"
                  />
                  <VStack align="start" spacing={0} flex="1" overflow="hidden">
                    <Text fontWeight="medium" fontSize="sm" color="gray.800" isTruncated>
                      {ws.name}
                    </Text>
                  </VStack>
                  {ws.id === current.id && (
                    <Icon as={FiCheck} color="purple.500" ml={3} />
                  )}
                </Flex>
              </MenuItem>
            ))}
            <Divider />
            <MenuItem 
              icon={<Icon as={FiPlus} />} 
              onClick={onAddWorkspace}
              py={2}
            >
              Add Workspace
            </MenuItem>
          </MenuList>
        </>
      )}
    </Menu>
  );
}

function Sidebar({ logout, workspaces, currentWorkspace, onSwitchWorkspace, onAddWorkspace, isLoadingWorkspaces }) {
  const navigate = useNavigate();
  const location = useLocation();
  // const user = { name: 'User Name', email: 'user@example.com' }; // Remove placeholder

  // Retrieve and parse user info from localStorage
  const [userInfo, setUserInfo] = useState(() => {
    const storedInfo = localStorage.getItem('userInfo');
    try {
      return storedInfo ? JSON.parse(storedInfo) : null;
    } catch (error) {
      console.error("Error parsing user info from localStorage:", error);
      return null;
    }
  });

  // Optionally, listen for storage changes if needed (more advanced)
  // useEffect(() => { ... event listener for storage ... }, []);

  const handleLogout = () => {
    logout();
    navigate('/', { replace: true });
  };
  
  const handleCreateStyle = () => {
    navigate('/app/create');
  }

  const isAssetRouteActive = 
    location.pathname.includes('/app/products') || 
    location.pathname.includes('/app/models') || 
    location.pathname.includes('/app/accessories');

  const mainLinks = [
    {
      label: 'Dashboard',
      href: '/app/dashboard',
      icon: FiHome
    },
    {
      label: 'My Creations',
      href: '/app/generations',
      icon: FiLayers
    },
    {
      label: 'Explore Styles',
      href: '/app/explore',
      icon: FiCompass
    },
    {
      label: 'Collections',
      href: '/app/collections',
      icon: FiStar
    }
  ];

  const assetLinks = [
    {
      label: 'Virtual Closet',
      href: '/app/products',
      icon: FiShoppingBag
    },
    {
      label: 'Models',
      href: '/app/models',
      icon: FiUser
    },
    {
      label: 'Poses',
      href: '/app/poses',
      icon: FiMeh
    },
    {
      label: 'Accessories',
      href: '/app/accessories',
      icon: FiGift,
      badge: 'New!' // Keep badge data if needed
    }
  ];

  return (
    <Box 
      w="250px" 
      bg="gray.100" // Lighter gray background
      color="gray.600"
      p={4}
      display="flex"
      flexDirection="column"
      height="100vh"
      borderRight="1px solid"
      borderColor="gray.200"
    >

      
      <WorkspaceSelector 
        userWorkspaces={workspaces}
        currentWorkspace={currentWorkspace}
        onSwitchWorkspace={onSwitchWorkspace}
        onAddWorkspace={onAddWorkspace}
        isLoading={isLoadingWorkspaces}
        userInfo={userInfo}
      /> 
      
      <VStack spacing={1} align="stretch" flexGrow={1}> {/* Reduced spacing */} 
        <SectionHeader title="Main" />
        {mainLinks.map((link) => (
          <SidebarNavLink 
            key={link.label} 
            to={link.href} 
            icon={link.icon}
            badge={link.badge}
          >
            {link.label}
          </SidebarNavLink>
        ))}

        <SectionHeader title="Assets" />
        <CollapsibleSection
          title="View Assets"
          icon={FiBox}
          isOpenByDefault={isAssetRouteActive}
        >
          <VStack spacing={1} align="stretch" pl={0}> 
            {assetLinks.map((link) => (
              <Flex key={link.label} align="center">
                <NestedNavLink to={link.href}>
                  {link.label} 
                  {link.badge && (
                    <Badge ml="auto" colorScheme="purple" variant="solid" fontSize="xs">
                      {link.badge}
                    </Badge>
                  )}
                </NestedNavLink>
              </Flex>
            ))}
          </VStack>
        </CollapsibleSection>

      </VStack>

      {/* Create Style Button - Positioned before settings/logout */}
      <Button 
        leftIcon={<Icon as={FiPlusSquare} />}
        colorScheme="gray" // Use gray scheme for dark button
        bg="gray.800"
        color="white"
        variant="solid"
        borderRadius="md"
        width="full"
        my={4}
        onClick={handleCreateStyle}
        _hover={{ bg: "gray.700" }}
      >
        Create Style
      </Button>

      <VStack spacing={1} align="stretch" mt="auto"> {/* Push settings/user to bottom */} 
        <Divider my={2} borderColor="gray.200" />
        {/* User Info Section */}
        <Flex align="center" mt={4} width="100%" px={4} py={3} borderRadius="md" _hover={{ bg: 'whiteAlpha.500' }} cursor="pointer">
          <Avatar 
            size="sm" 
            // Use initials if available, otherwise default
            name={userInfo?.name || userInfo?.email?.substring(0, 2).toUpperCase()} // Extract initials from name or email
            // src={userInfo?.avatar_url} // Optional: Add avatar URL if available
            bg="gray.600" 
            color="white" 
            mr={3}
          />
          <VStack align="start" spacing={0} flex={1} overflow="hidden">
            <Text fontSize="sm" fontWeight="semibold" color="gray.700" noOfLines={1}>
              {userInfo?.name || 'User'} {/* Display name or 'User' */} 
            </Text>
            <Text fontSize="xs" color="gray.500" noOfLines={1}>
              {userInfo?.email || 'No email available'} {/* Display email or placeholder */} 
            </Text>
          </VStack>
          <IconButton 
            aria-label="Logout" 
            icon={<FiLogOut />} 
            variant="ghost" 
            size="sm" 
            onClick={handleLogout} 
            color="gray.600"
          />
        </Flex>
      </VStack>

    </Box>
  );
}

export default Sidebar; 