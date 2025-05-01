import React, { useState } from 'react';
import {
  Box,
  Heading,
  Tabs,
  TabList,
  TabPanels,
  Tab,
  TabPanel,
  VStack,
  FormControl,
  FormLabel,
  Input,
  Button,
  useToast,
  Divider,
  Text,
  InputGroup,
  InputRightElement,
  IconButton
} from '@chakra-ui/react';
import { ViewIcon, ViewOffIcon } from '@chakra-ui/icons';

function SettingsPage() {
  const toast = useToast();

  // --- State for Profile Settings ---
  const [profileName, setProfileName] = useState('Mock User'); // Load from actual user data later
  const [profileEmail, setProfileEmail] = useState('user@example.com'); // Load from actual user data later
  const [currentPassword, setCurrentPassword] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [showCurrentPass, setShowCurrentPass] = useState(false);
  const [showNewPass, setShowNewPass] = useState(false);
  const [showConfirmPass, setShowConfirmPass] = useState(false);
  const [isProfileSaving, setIsProfileSaving] = useState(false);
  const [isPasswordSaving, setIsPasswordSaving] = useState(false);

  // --- State for Workspace Settings ---
  const [workspaceName, setWorkspaceName] = useState('My Fashion Workspace'); // Load from actual workspace data later
  const [isWorkspaceSaving, setIsWorkspaceSaving] = useState(false);

  const handleProfileSave = async () => {
    setIsProfileSaving(true);
    console.log('Saving profile:', { name: profileName, email: profileEmail });
    // Simulate API call
    await new Promise(res => setTimeout(res, 1000));
    setIsProfileSaving(false);
    toast({
      title: 'Profile updated.',
      status: 'success',
      duration: 3000,
      isClosable: true,
    });
  };

  const handlePasswordChange = async () => {
    if (newPassword !== confirmPassword) {
      toast({
        title: 'New passwords do not match.',
        status: 'error',
        duration: 3000,
        isClosable: true,
      });
      return;
    }
    if (!currentPassword || !newPassword) {
        toast({
          title: 'Please fill in all password fields.',
          status: 'warning',
          duration: 3000,
          isClosable: true,
        });
        return;
    }

    setIsPasswordSaving(true);
    console.log('Changing password...'); // Don't log passwords!
    // Simulate API call
    await new Promise(res => setTimeout(res, 1500));
    setIsPasswordSaving(false);
     toast({
       title: 'Password updated successfully.', // In real app, check for API success
       status: 'success',
       duration: 3000,
       isClosable: true,
     });
     // Clear password fields
     setCurrentPassword('');
     setNewPassword('');
     setConfirmPassword('');
  };

  const handleWorkspaceSave = async () => {
    setIsWorkspaceSaving(true);
    console.log('Saving workspace:', { name: workspaceName });
    // Simulate API call
    await new Promise(res => setTimeout(res, 1000));
    setIsWorkspaceSaving(false);
    toast({
      title: 'Workspace updated.',
      status: 'success',
      duration: 3000,
      isClosable: true,
    });
  };

  return (
    <Box>
      <Heading as="h1" size="xl" mb={6}>Settings</Heading>

      <Tabs variant="soft-rounded" colorScheme="blue">
        <TabList mb={4}>
          <Tab>Profile</Tab>
          <Tab>Workspace</Tab>
          {/* Add more tabs as needed (e.g., Billing, API Keys) */}
          <Tab isDisabled>Billing</Tab> 
        </TabList>

        <TabPanels>
          {/* --- Profile Tab --- */}
          <TabPanel>
            <VStack spacing={6} align="stretch">
              <Box borderWidth="1px" borderRadius="lg" p={6}>
                  <Heading size="md" mb={4}>Personal Information</Heading>
                  <VStack spacing={4}>
                      <FormControl id="profile-name">
                          <FormLabel>Name</FormLabel>
                          <Input 
                            type="text" 
                            value={profileName} 
                            onChange={(e) => setProfileName(e.target.value)} 
                          />
                      </FormControl>
                      <FormControl id="profile-email">
                          <FormLabel>Email Address</FormLabel>
                          <Input type="email" value={profileEmail} isReadOnly // Usually email is not directly changeable
                           /> 
                      </FormControl>
                      <Button 
                        colorScheme="blue" 
                        onClick={handleProfileSave}
                        isLoading={isProfileSaving}
                        alignSelf="flex-end"
                      >
                        Save Profile
                      </Button>
                  </VStack>
              </Box>

              <Divider />

               <Box borderWidth="1px" borderRadius="lg" p={6}>
                  <Heading size="md" mb={4}>Change Password</Heading>
                  <VStack spacing={4}>
                      <FormControl id="current-password">
                          <FormLabel>Current Password</FormLabel>
                          <InputGroup>
                            <Input 
                                type={showCurrentPass ? 'text' : 'password'} 
                                value={currentPassword}
                                onChange={(e) => setCurrentPassword(e.target.value)}
                            />
                             <InputRightElement>
                                <IconButton 
                                    h="1.75rem" size="sm" onClick={() => setShowCurrentPass(!showCurrentPass)}
                                    icon={showCurrentPass ? <ViewOffIcon /> : <ViewIcon />}
                                    aria-label={showCurrentPass ? 'Hide password' : 'Show password'}
                                />
                            </InputRightElement>
                          </InputGroup>
                      </FormControl>
                      <FormControl id="new-password">
                          <FormLabel>New Password</FormLabel>
                           <InputGroup>
                              <Input 
                                type={showNewPass ? 'text' : 'password'} 
                                value={newPassword}
                                onChange={(e) => setNewPassword(e.target.value)}
                              />
                              <InputRightElement>
                                <IconButton 
                                    h="1.75rem" size="sm" onClick={() => setShowNewPass(!showNewPass)}
                                    icon={showNewPass ? <ViewOffIcon /> : <ViewIcon />}
                                    aria-label={showNewPass ? 'Hide password' : 'Show password'}
                                />
                              </InputRightElement>
                            </InputGroup>
                      </FormControl>
                      <FormControl id="confirm-password">
                          <FormLabel>Confirm New Password</FormLabel>
                          <InputGroup>
                             <Input 
                                type={showConfirmPass ? 'text' : 'password'} 
                                value={confirmPassword}
                                onChange={(e) => setConfirmPassword(e.target.value)}
                             />
                             <InputRightElement>
                                <IconButton 
                                    h="1.75rem" size="sm" onClick={() => setShowConfirmPass(!showConfirmPass)}
                                    icon={showConfirmPass ? <ViewOffIcon /> : <ViewIcon />}
                                    aria-label={showConfirmPass ? 'Hide password' : 'Show password'}
                                />
                             </InputRightElement>
                          </InputGroup>
                      </FormControl>
                       <Button 
                        colorScheme="blue" 
                        variant="outline"
                        onClick={handlePasswordChange}
                        isLoading={isPasswordSaving}
                        alignSelf="flex-end"
                      >
                        Update Password
                      </Button>
                  </VStack>
              </Box>
            </VStack>
          </TabPanel>

          {/* --- Workspace Tab --- */}
          <TabPanel>
              <Box borderWidth="1px" borderRadius="lg" p={6}>
                   <Heading size="md" mb={4}>Workspace Settings</Heading>
                   <VStack spacing={4} align="stretch">
                      <FormControl id="workspace-name">
                          <FormLabel>Workspace Name</FormLabel>
                          <Input 
                            type="text" 
                            value={workspaceName}
                            onChange={(e) => setWorkspaceName(e.target.value)}
                          />
                      </FormControl>
                      {/* Add other workspace settings here - e.g., invite members, manage roles (future) */}
                       <Button 
                        colorScheme="blue" 
                        onClick={handleWorkspaceSave}
                        isLoading={isWorkspaceSaving}
                        alignSelf="flex-end"
                      >
                        Save Workspace Settings
                      </Button>
                   </VStack>
              </Box>
          </TabPanel>

          {/* --- Billing Tab (Placeholder) --- */}
          <TabPanel>
            <Box borderWidth="1px" borderRadius="lg" p={6}>
                 <Heading size="md" mb={4}>Billing</Heading>
                 <Text color="gray.500">Billing management features are not yet available.</Text>
                 {/* Placeholder for plan details, payment methods, invoices etc. */}
            </Box>
          </TabPanel>

        </TabPanels>
      </Tabs>
    </Box>
  );
}

export default SettingsPage; 