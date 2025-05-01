import React, { useState } from "react";
import { Link } from "react-router-dom";
import {
  Box,
  Button,
  Container,
  Heading,
  Text,
  VStack,
  HStack,
  Icon,
  SimpleGrid,
  useColorModeValue,
  Flex,
  Spacer,
  Collapse,
  chakra,
  Image,
  Divider,
  Tag,
} from "@chakra-ui/react";
import { motion } from "framer-motion";
import {
  FaPalette,
  FaMagic,
  FaTshirt,
  FaUsers,
  FaShieldAlt,
  FaPlayCircle,
} from "react-icons/fa";

/* --------------------------------------------------
 * Motion wrappers
 * --------------------------------------------------*/
const MotionBox = motion(Box);
const GradientText = (props) => (
  <chakra.span
    bgGradient="linear(to-r, #6a11cb, #2575fc)"
    bgClip="text"
    {...props}
  />
);

/* --------------------------------------------------
 * Re‑usable sub‑components
 * --------------------------------------------------*/
const NavLink = ({ children }) => (
  <Button variant="ghost" fontWeight={500} _hover={{ bg: "transparent", color: "blue.400" }}>
    {children}
  </Button>
);

const SectionHeading = ({ kicker, title }) => (
  <VStack spacing={3} textAlign="center" mb={{ base: 12, md: 16 }}>
    {kicker && (
      <Tag size="sm" colorScheme="blue" variant="subtle" rounded="full">
        {kicker}
      </Tag>
    )}
    <Heading fontSize={{ base: "2xl", md: "4xl" }} fontWeight="bold">
      {title}
    </Heading>
  </VStack>
);

const FeatureCard = ({ icon, title, children, iconBg, iconColor, textColor }) => (
  <MotionBox
    p={8}
    bg={useColorModeValue('white', 'gray.800')}
    rounded="xl"
    shadow="lg"
    whileHover={{ translateY: -6, boxShadow: "0 12px 32px rgba(0,0,0,.1)" }}
    transition="0.35s ease"
  >
    <Flex
      w={14}
      h={14}
      align="center"
      justify="center"
      rounded="full"
      bg={iconBg}
      color={iconColor}
      mb={6}
    >
      <Icon as={icon} w={7} h={7} />
    </Flex>
    <Heading as="h3" fontSize="lg" mb={2}>{title}</Heading>
    <Text color={textColor}>{children}</Text>
  </MotionBox>
);

const MetricCard = ({ value, label }) => (
  <VStack px={6} py={4} spacing={0}>
    <Heading fontSize="5xl" color="blue.500" lineHeight="1">{value}</Heading>
    <Text>{label}</Text>
  </VStack>
);

const FaqItem = ({ q, a, boxBg, textColor }) => {
  const [open, setOpen] = useState(false);
  return (
    <Box
      w="full"
      p={4}
      bg={boxBg}
      rounded="md"
      shadow="sm"
      onClick={() => setOpen(!open)}
      cursor="pointer"
      mb={3}
    >
      <Flex align="center">
        <Text fontWeight={600}>{q}</Text>
        <Spacer />
        <Icon as={FaPlayCircle} transform={open ? "rotate(90deg)" : "rotate(0)"} />
      </Flex>
      <Collapse in={open} animateOpacity>
        <Text mt={3} color={textColor}>{a}</Text>
      </Collapse>
    </Box>
  );
};

/* --------------------------------------------------
 * Main Landing Page
 * --------------------------------------------------*/
export default function LandingPage() {
  const bgColor = useColorModeValue("gray.50", "gray.900");
  const textColor = useColorModeValue("gray.600", "gray.400");
  const headingColor = useColorModeValue("gray.800", "white");
  const headerBg = useColorModeValue("white", "gray.800");
  const heroTextColor = useColorModeValue("gray.700", "gray.300");
  const featureIconBg = useColorModeValue("blue.50", "blue.900");
  const featureIconColor = useColorModeValue("blue.600", "blue.300");
  const integrationBoxBg = useColorModeValue('gray.100','gray.700');
  const integrationSectionBg = useColorModeValue("white", "gray.800");
  const metricsSectionBg = useColorModeValue("gray.100", "gray.800");
  const faqItemBg = useColorModeValue("white", "gray.800");
  const faqItemTextColor = useColorModeValue("gray.600", "gray.400");
  const footerBg = useColorModeValue("gray.900", "gray.900");
  const footerTextColor = "gray.400";

  return (
    <Box fontFamily="'Poppins', sans-serif" bg={bgColor}>
      {/* HEADER */}
      <Flex as="header" align="center" py={4} px={8} bg={headerBg}
            shadow="sm" position="sticky" top={0} zIndex={10}>
        <Heading size="md"><GradientText>AI Fashion Studio</GradientText></Heading>
        <Spacer />
        <HStack spacing={6} display={{ base: "none", md: "flex" }}>
          <NavLink>Features</NavLink>
          <NavLink>Integrations</NavLink>
          <NavLink>Security</NavLink>
          <NavLink>Pricing</NavLink>
          <Button as={Link} to="/login" colorScheme="blue"> 
            Login / Sign Up 
          </Button>
        </HStack>
      </Flex>

      {/* HERO */}
      <Box position="relative" overflow="hidden" _before={{
        content: '""',
        position: 'absolute',
        top: '-40%',
        left: '-20%',
        w: '140%',
        h: '140%',
        bg: 'radial-gradient(circle at center, rgba(106,17,203,0.3), transparent 60%)',
        filter: 'blur(120px)'
      }}>
        <Container maxW="container.lg" textAlign="center" py={{ base: 24, md: 32 }}>
          <Heading fontSize={{ base: "4xl", md: "6xl" }} fontWeight="bold" mb={6} lineHeight="1.1">
            Organize your <GradientText>Creativity</GradientText> —
            from idea to <GradientText>runway‑ready</GradientText> in minutes.
          </Heading>
          <Text fontSize={{ base: "lg", md: "2xl" }} color={heroTextColor}
                maxW="2xl" mx="auto" mb={10}>
            Our AI transforms sketches and prompts into high‑fidelity fashion imagery, saving weeks of design iteration.
          </Text>
          <HStack spacing={4} justify="center">
            <Button as={Link} to="/login" size="lg" colorScheme="blue" px={8}> 
              Try Now
            </Button>
            <Button size="lg" variant="ghost" leftIcon={<FaPlayCircle />}>Watch Demo</Button>
          </HStack>
          {/* Mockup Image Placeholder */}
          <MotionBox
            mt={16}
            rounded="2xl"
            bg={useColorModeValue("gray.200", "gray.700")}
            h={{ base: 64, md: 96 }}
            display="flex" alignItems="center" justifyContent="center"
            color={useColorModeValue("gray.500", "gray.400")}
            fontWeight="medium"
            whileInView={{ opacity: 1, y: 0 }} initial={{ opacity: 0, y: 40 }}
          >
            [Product mockup]
          </MotionBox>
        </Container>
      </Box>

      {/* FEATURES */}
      <Container maxW="container.lg" py={{ base: 24, md: 32 }}>
        <SectionHeading kicker="How it works" title={<><GradientText>Three steps</GradientText> to runway glory</>} />
        <SimpleGrid columns={{ base: 1, md: 3 }} spacing={10}>
          <FeatureCard icon={FaTshirt} title="Upload or pick a garment" iconBg={featureIconBg} iconColor={featureIconColor} textColor={textColor}>
            Start with our curated base pieces or add your own sketches and patterns.
          </FeatureCard>
          <FeatureCard icon={FaPalette} title="Describe your vibe" iconBg={featureIconBg} iconColor={featureIconColor} textColor={textColor}>
            Use natural language to set style, silhouette, fabric, palette and scene.
          </FeatureCard>
          <FeatureCard icon={FaMagic} title="Generate & iterate" iconBg={featureIconBg} iconColor={featureIconColor} textColor={textColor}>
            AI produces multiple looks in seconds—refine until it's perfect.
          </FeatureCard>
        </SimpleGrid>
      </Container>

      {/* INTEGRATIONS */}
      <Box bg={integrationSectionBg}>
        <Container maxW="container.lg" py={{ base: 20, md: 28 }}>
          <SectionHeading kicker="Plug & play" title="Integrate with your favourite design stack" />
          <SimpleGrid columns={{ base: 3, md: 6 }} spacing={10} alignItems="center">
            {['figma', 'photoshop', 'illustrator', 'slack', 'shopify', 'google'].map((logo) => (
              <Box key={logo} bg={integrationBoxBg} rounded="lg" h={16} display="flex" alignItems="center" justifyContent="center">
                <Text>{logo}</Text>{/* Replace with <Image src={...}/> */}
              </Box>
            ))}
          </SimpleGrid>
        </Container>
      </Box>

      {/* SECURITY */}
      <Container maxW="container.lg" py={{ base: 24, md: 32 }}>
        <SectionHeading kicker="Enterprise‑grade" title="Your designs stay yours" />
        <SimpleGrid columns={{ base: 1, md: 2 }} spacing={12}>
          <FeatureCard icon={FaShieldAlt} title="Private by default" iconBg={featureIconBg} iconColor={featureIconColor} textColor={textColor}>
            Every prompt and output is encrypted at rest—share publicly only when you decide.
          </FeatureCard>
          <FeatureCard icon={FaShieldAlt} title="GDPR & SOC 2 ready" iconBg={featureIconBg} iconColor={featureIconColor} textColor={textColor}>
            We follow the strictest compliance standards so agencies and brands can sleep easy.
          </FeatureCard>
        </SimpleGrid>
      </Container>

      {/* METRICS CTA */}
      <Box bg={metricsSectionBg} py={{ base: 20, md: 24 }} textAlign="center">
        <Heading fontSize={{ base: "2xl", md: "4xl" }} mb={6}>Grow faster with AI Fashion Studio</Heading>
        <SimpleGrid columns={{ base: 1, md: 3 }}>
          <MetricCard value="26%" label="Higher launch velocity" />
          <MetricCard value="20×" label="Cost saved per collection" />
          <MetricCard value="360%" label="ROI within first 90 days" />
        </SimpleGrid>
        <Button mt={10} size="lg" colorScheme="blue" px={10}>Get Started</Button>
      </Box>

      {/* FAQ */}
      <Container maxW="container.md" py={{ base: 24, md: 32 }}>
        <SectionHeading title="Questions? We've got answers" />
        <FaqItem q="Do I own the visuals?" a="Yes, every paid generation grants you full commercial rights." boxBg={faqItemBg} textColor={faqItemTextColor} />
        <FaqItem q="How many free credits do I get?" a="10 to begin with—enough for 50 idea iterations." boxBg={faqItemBg} textColor={faqItemTextColor} />
        <FaqItem q="Can I cancel anytime?" a="Absolutely. No contracts, no hidden fees." boxBg={faqItemBg} textColor={faqItemTextColor} />
      </Container>

      {/* FOOTER */}
      <Box bg={footerBg} color={footerTextColor} py={12}>
        <Container maxW="container.lg">
          <SimpleGrid columns={{ base: 1, md: 3 }} spacing={8} textAlign={{ base: "center", md: "left" }} mb={10}>
            <VStack align={{ base: "center", md: "flex-start" }}>
              <Heading size="md" color="white">AI Fashion Studio</Heading>
              <Text>Design at the speed of imagination.</Text>
            </VStack>
            <VStack>
              <Text fontWeight={600} color="white">Product</Text>
              <Text>Features</Text>
              <Text>Pricing</Text>
              <Text>Security</Text>
            </VStack>
            <VStack>
              <Text fontWeight={600} color="white">Company</Text>
              <Text>About</Text>
              <Text>Careers</Text>
              <Text>Contact</Text>
            </VStack>
          </SimpleGrid>
          <Divider borderColor="gray.700" />
          <Text pt={6} textAlign="center">© {new Date().getFullYear()} Nyx Solutions. All rights reserved.</Text>
        </Container>
      </Box>
    </Box>
  );
} 