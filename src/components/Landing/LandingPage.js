import React, { useState, useRef, useEffect } from "react";
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
  Tag,
  Slider,
  SliderTrack,
  SliderFilledTrack,
  SliderThumb,
  Stat,
  StatLabel,
  StatNumber,
  Link as ChakraLink,
} from "@chakra-ui/react";
import { motion, AnimatePresence } from "framer-motion";
import {
  FaPlayCircle,
  FaFacebookF,
  FaTwitter,
  FaLinkedinIn,
} from "react-icons/fa";
import { ArrowForwardIcon, ChevronDownIcon, ChevronRightIcon, AddIcon, MinusIcon } from "@chakra-ui/icons";

/* --------------------------------------------------
 * Motion + Style helpers
 * --------------------------------------------------*/
const MotionBox = motion(Box);
const MotionImage = motion(Image);
const MotionText = motion(Text);
const GradientText = (props) => (
  <chakra.span bgGradient="linear(to-r, #4F46E5, #2575FC)" bgClip="text" {...props} />
);

/* --------------------------------------------------
 * Gamma-style Colors (approximations)
 * --------------------------------------------------*/
const primaryBlue = "#3B82F6";
const darkBlue = "#1E3A8A";
const lightBlueBg = "#EFF6FF";
const veryLightBlueBg = "#F9FAFB";
const textPrimary = "#1F2937";
const textSecondary = "#6B7280";
const borderGray = "#D1D5DB";
const accentOrange = "#F97316";

// New Dark theme colors for FAQ/Footer sections
// const darkSectionBg = "gray.900"; // No longer primary for FAQ/Footer, sectionBgBlue will be used
const textOnDark = "gray.300"; // Retained for potential use, but footer will adapt more specifically
const headingOnDark = "whiteAlpha.900"; // Retained for dark mode headings
// const subtleTextOnDark = "gray.500"; // Will be replaced by more specific footer watermark color

/* --------------------------------------------------
 * Sub‑components - Redesigned for Gamma style
 * --------------------------------------------------*/
const NavLink = ({ href, children, onClick, color, isScrolled }) => (
  <ChakraLink 
    href={href} 
    onClick={onClick} 
    fontWeight="medium"
    color={color || textSecondary}
    _hover={{ 
      textDecoration: "none", 
      color: primaryBlue
    }}
    px={3}
    py={2}
    transition="color 0.3s ease-in-out"
  >
    {children}
  </ChakraLink>
);

const SectionHeading = ({ kicker, title, description, align = "center", kickerColorScheme = "blue" }) => (
  <VStack spacing={4} textAlign={align} mb={{ base: 10, md: 12 }} w="full">
    {kicker && (
      <Tag size="md" colorScheme={kickerColorScheme} variant="subtle" rounded="full" fontWeight="medium">
        {kicker}
      </Tag>
    )}
    <Heading as="h2" fontSize={{ base: "2xl", md: "4xl" }} fontWeight="bold" color={textPrimary} lineHeight="1.2">
      {title}
    </Heading>
    {description && <Text fontSize={{ base: "md", md: "lg" }} color={textSecondary} maxW="2xl" mx={align === "center" ? "auto" : "none"}>{description}</Text>}
  </VStack>
);

const FeatureCard = ({ children, imageSrc, imageAlt = "Feature Illustration" }) => {
  const cardBg = useColorModeValue("white", "gray.700");
  const placeholderIllustrationOuterBg = useColorModeValue("blue.100", "blue.800");
  const placeholderIllustrationTextColor = useColorModeValue("blue.600", "blue.200");
  
  return (
    <Flex
      p={{base: 5, md: 6}}
      bg={cardBg}
      rounded="xl"
      shadow="lg"
      alignItems="center"
      transition="0.2s ease-out"
      _hover={{ transform: "translateY(-4px)", shadow: "xl" }}
      h="100%"
    >
      <Box 
        w={{ base: "140px" }}
        h={{ base: "140px" }}
        bg={placeholderIllustrationOuterBg}
        rounded="lg" 
        mr={8}
        display="flex"
        alignItems="center"
        justifyContent="center"
        overflow="hidden"
      >
        {imageSrc ? <Image src={imageSrc} alt={imageAlt} objectFit="cover" w="100%" h="100%" /> : <Text fontSize="xs" color={placeholderIllustrationTextColor}>Illust.</Text>}
      </Box>
      <Box flex="1">
        <Text fontSize="xs" color={textSecondary}>
          {children}
        </Text>
      </Box>
    </Flex>
);
};

const MetricCard = ({ value, label }) => (
  <VStack bg={useColorModeValue("white", "gray.700")} p={6} rounded="lg" shadow="md" spacing={1} textAlign="center">
    <Heading fontSize={{base: "3xl", md: "4xl"}} color={primaryBlue} lineHeight={1}>{value}</Heading>
    <Text fontWeight="medium" color={textSecondary}>{label}</Text>
  </VStack>
);

const FaqItem = ({ q, a }) => {
  const [open, setOpen] = useState(false);
  const faqItemBackground = useColorModeValue("gray.100", "gray.700");
  const faqQuestionColor = textPrimary;
  const faqAnswerColor = textSecondary;
  const faqIconColor = textSecondary;

  return (
    <Box
      w="full"
      bg={faqItemBackground}
      rounded="xl"
      onClick={() => setOpen(!open)}
      cursor="pointer"
      mb={3}
      shadow="sm"
      overflow="hidden"
    >
      <Flex align="center" p={5}>
        <Text fontWeight="medium" color={faqQuestionColor} flex="1" mr={4}>{q}</Text>
        <Flex 
          as="button" 
          aria-label={open ? "Collapse question" : "Expand question"}
          alignItems="center" 
          justifyContent="center" 
          w="28px" h="28px" 
          rounded="full" 
          bg={useColorModeValue("gray.200", "gray.600")}
          _hover={{bg: useColorModeValue("gray.300", "gray.500")}} 
          color={faqIconColor}
        >
          <Icon as={open ? MinusIcon : AddIcon} boxSize={3} />
        </Flex>
      </Flex>
      <Collapse in={open} animateOpacity>
        <Box p={5} borderTopWidth="1px" borderColor={useColorModeValue("gray.200", "gray.600")}>
          <Text fontSize="sm" color={faqAnswerColor}>{a}</Text>
        </Box>
      </Collapse>
    </Box>
  );
};

const ROICalculator = () => {
  const [skus, setSkus] = useState(100);
  const costPerShoot = 40;
  const clipzyCost = 0.8;
  const timePerShoot = 3;
  const clipzyTime = 0.05;

  const dollarsSaved = ((costPerShoot - clipzyCost) * skus * 12).toLocaleString();
  const hoursSaved = ((timePerShoot - clipzyTime) * skus).toLocaleString();

  return (
    <Box w="full" bg={useColorModeValue("white", "gray.700")} p={{base:6, md:10}} rounded="xl" shadow="xl">
      <Heading size="lg" mb={2} color={textPrimary}>Instant savings snapshot</Heading>
      <Text color={textSecondary} mb={6}>Drag to match your monthly SKU volume and see the potential savings with Clipzy.</Text>
      <Slider defaultValue={100} min={10} max={1000} step={10} onChange={setSkus} mb={8} colorScheme="blue">
        <SliderTrack bg="blue.100">
          <SliderFilledTrack bg={primaryBlue} />
        </SliderTrack>
        <SliderThumb boxSize={6} bg="white" shadow="md" borderColor={primaryBlue} borderWidth={2} />
      </Slider>
      <Stat mb={8} textAlign="center">
        <StatLabel fontWeight="medium" color={textSecondary}>Monthly SKUs</StatLabel>
        <StatNumber fontSize="4xl" color={primaryBlue}>{skus}</StatNumber>
      </Stat>
      <SimpleGrid columns={{ base: 1, md: 2 }} spacing={8}>
        <VStack bg={useColorModeValue("blue.50", "blue.800")} p={5} rounded="lg" textAlign="center">
          <Heading size="2xl" color={primaryBlue}>${dollarsSaved}</Heading>
          <Text color={textSecondary} fontWeight="medium">saved per year</Text>
        </VStack>
        <VStack bg={useColorModeValue("blue.50", "blue.800")} p={5} rounded="lg" textAlign="center">
          <Heading size="2xl" color={primaryBlue}>{hoursSaved}h</Heading>
          <Text color={textSecondary} fontWeight="medium">hours freed monthly</Text>
        </VStack>
      </SimpleGrid>
    </Box>
  );
};

/* --------------------------------------------------
 * Main Landing Page - Gamma Style
 * --------------------------------------------------*/
export default function LandingPage() {
  const heroRef = useRef(null);
  const howRef = useRef(null);
  const whyRef = useRef(null);
  const faqRef = useRef(null);
  const examplesRef = useRef(null);

  const scrollTo = (ref) => ref.current?.scrollIntoView({ behavior: "smooth" });

  const pageBg = useColorModeValue(veryLightBlueBg, "gray.900");
  const sectionBgLight = useColorModeValue("white", "gray.800");
  const sectionBgBlue = useColorModeValue(lightBlueBg, "gray.800");

  const navBg = useColorModeValue("white", "gray.800");
  const heroIllustBg = useColorModeValue("blue.100", "blue.800");
  const heroIllustColor = useColorModeValue("blue.600", "blue.200");
  const exampleCardBg = useColorModeValue("white", "gray.700"); // For static examples (if any)
  const marqueeCardBg = useColorModeValue("white", "gray.700"); // Hoisted for marquee cards

  // Animated gradient for Hero Image Box
  const animatedGradientLight = "linear-gradient(-45deg, #DBEAFE, #EDE9FE, #CFFAFE, #DBEAFE)";
  const animatedGradientDark = "linear-gradient(-45deg, #1e40af, #5b21b6, #0e7490, #1e40af)";
  const heroAnimatedGradient = useColorModeValue(animatedGradientLight, animatedGradientDark);

  // State for hero image animation
  const [heroImageIndex, setHeroImageIndex] = useState(0);
  const heroImages = ["/IM0.png", "/IM1.png", "/IM3.png"]; // Updated image sequence
  const heroTexts = [ // Corresponding text phrases - IMPROVED
    "Choose Your Model.",
    "Upload Your Outfit.",
    "See It Come to Life—Instantly."
  ];

  // Effect for hero image cycling
  useEffect(() => {
    const imageInterval = setInterval(() => {
      setHeroImageIndex((prevIndex) => (prevIndex + 1) % heroImages.length);
    }, 4000); // Change image every 4 seconds
    return () => clearInterval(imageInterval);
  }, [heroImages.length]);

  // State for scroll-based navbar changes
  const [isScrolled, setIsScrolled] = useState(false);

  // Effect for scroll listener
  useEffect(() => {
    const handleScroll = () => {
      if (window.scrollY > 10) {
        setIsScrolled(true);
      } else {
        setIsScrolled(false);
      }
    };
    window.addEventListener("scroll", handleScroll);
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  // Dynamic navbar properties based on scroll state
  const dynamicNavBg = isScrolled ? navBg : "transparent";
  const dynamicNavShadow = isScrolled ? "sm" : "none";
  
  // Colors are now consistent for transparent and earlier scrolled state
  const logoColor = primaryBlue; 
  const linkColor = textSecondary;

  return (
    <Box 
      fontFamily="'Poppins', sans-serif" 
      bg={pageBg} 
      color={textPrimary} 
      minH="100vh" 
      display="flex"
      flexDirection="column"
    >
      <Flex 
        as="header" 
        align="center" 
        py={3} 
        px={{ base: 4, md: 8 }} 
        bg={dynamicNavBg}
        shadow={dynamicNavShadow}
        position="sticky" 
        top={0} 
        zIndex={20}
        transition="background-color 0.3s ease-in-out, box-shadow 0.3s ease-in-out"
      >
        <Heading size="md" color={logoColor} fontWeight="bold" transition="color 0.3s ease-in-out">Clipzy</Heading>
        <Spacer display={{ base: "none", md: "block"}} />
        <HStack spacing={1} display={{ base: "none", md: "flex" }} mx="auto">
          <NavLink href="#examples" onClick={() => scrollTo(examplesRef)} color={linkColor} isScrolled={isScrolled}>Examples</NavLink>
          <NavLink href="#why" onClick={() => scrollTo(whyRef)} color={linkColor} isScrolled={isScrolled}>Why Clipzy</NavLink>
          <NavLink href="#faq" onClick={() => scrollTo(faqRef)} color={linkColor} isScrolled={isScrolled}>FAQ</NavLink>
        </HStack>
        <Spacer />
        <HStack spacing={3}>
          <Button 
            as={Link} 
            to="/login" 
            colorScheme="blue"
            variant="solid"
            size="sm" 
            fontWeight="medium"
            transition="background-color 0.3s ease-in-out, color 0.3s ease-in-out"
          >
            Try Free
          </Button>
        </HStack>
      </Flex>

      <Box ref={heroRef} bg={sectionBgLight} py={{ base: 16, md: 24 }}>
        <Container maxW="container.xl">
          <Flex direction={{ base: "column-reverse", md: "row" }} alignItems="center" gap={12}>
            <VStack flex="1" alignItems={{base: "center", md: "flex-start"}} textAlign={{base: "center", md: "left"}} spacing={6}>
              <Heading as="h1" fontSize={{ base: "3xl", sm: "4xl", md: "5xl", lg: "6xl" }} fontWeight="extrabold" color={textPrimary} lineHeight="1.1">
                Studio‑grade fashion images in <chakra.span color={primaryBlue}>90&nbsp;seconds.</chakra.span>
          </Heading>
              <Text fontSize={{ base: "lg", md: "xl" }} color={textSecondary} maxW="lg">
                Upload.&nbsp;Pick a vibe.&nbsp;Download.&nbsp;That fast. Clipzy transforms your product shots effortlessly.
          </Text>
              <HStack spacing={4} pt={4}>
                <Button as={Link} to="/login" size="lg" colorScheme="blue" px={8}>Start Free</Button>
          </HStack>
            </VStack>
            <Box 
              flex="1" 
              w="full" 
              h={{ base: "300px", sm:"350px", md: "450px", lg: "500px" }}
              rounded="xl" 
              shadow="lg" 
              position="relative"
              overflow="hidden"
              style={{
                background: heroAnimatedGradient,
                backgroundSize: "400% 400%",
              }}
              animate={{
                backgroundPosition: ["0% 50%", "100% 50%", "0% 50%"],
              }}
              transition={{
                duration: 15,
                ease: "linear",
                repeat: Infinity,
                repeatType: "loop",
              }}
            >
              <AnimatePresence initial={false} mode="wait">
                <MotionImage
                  key={heroImages[heroImageIndex]}
                  src={heroImages[heroImageIndex]}
                  alt={
                    heroImageIndex === 0 ? "Model inspiration for fashion design" :
                    heroImageIndex === 1 ? "Beige trench coat product image" :
                    "AI generated model wearing beige trench coat"
                  }
                  position="absolute"
                  top={0}
                  left={0}
                  width="100%"
                  height="100%"
                  objectFit={(heroImageIndex === 0 || heroImageIndex === 2) ? "contain" : "cover"}
                  initial={{
                    opacity: 0, 
                    scale: (heroImageIndex === 0 || heroImageIndex === 2) ? 0.95 : 1.05,
                    boxShadow: "0 0 0px rgba(255,255,255,0)" // Initial no shadow for all
                  }}
                  animate={{
                    opacity: 1, 
                    scale: (heroImageIndex === 0 || heroImageIndex === 2) ? 0.9 : 1.0,
                    // Apply magic shadow animation only for the final image (index 2)
                    boxShadow: heroImageIndex === 2 
                      ? ["0 0 0px rgba(255,255,255,0)", "0 0 50px 25px rgba(255,255,200,0.6)", "0 0 0px rgba(255,255,255,0)"] 
                      : "0 0 0px rgba(255,255,255,0)" 
                  }}
                  exit={{
                    opacity: 0, 
                    scale: (heroImageIndex === 0 || heroImageIndex === 2) ? 0.95 : 1.05,
                    boxShadow: "0 0 0px rgba(255,255,255,0)" // Ensure exit also has no shadow
                  }}
                  transition={{
                    duration: 0.8, 
                    ease: "easeInOut",
                    // Specific transition for boxShadow if it's the final image
                    boxShadow: heroImageIndex === 2 
                      ? { duration: 0.7, times: [0, 0.5, 1], ease: "linear" } 
                      : { duration: 0.1 } // Quick transition for non-glowing images
                  }}
                />
              </AnimatePresence>
              
              {/* Animated Text Overlay */}
              <Box 
                position="absolute" 
                bottom="20px" 
                left="20px" 
                right="20px"
                zIndex={1}
              >
                <AnimatePresence initial={false} mode="wait">
                  <MotionText
                    key={heroTexts[heroImageIndex]}
                    fontSize={{ base: "lg", md: "xl" }}
                    fontWeight="semibold"
                    color="white"
                    bg="blackAlpha.600"
                    px={4}
                    py={2}
                    rounded="md"
                    display="inline-block"
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, y: -20 }}
                    transition={{ duration: 0.5, ease: "easeInOut" }}
                  >
                    {heroTexts[heroImageIndex]}
                  </MotionText>
                </AnimatePresence>
              </Box>

            </Box>
          </Flex>
        </Container>
      </Box>

      {/* EXAMPLES - Updated to Horizontal Scroll Marquee */}
      <Box 
        id="examples"
        ref={examplesRef}
        bg={sectionBgBlue}
        py={{ base: 16, md: 24 }}
        overflow="hidden" // Keep this to hide the actual overflow
        position="relative" 
        sx={{ // Added sx prop for mask
          WebkitMaskImage: "linear-gradient(to right, transparent 0%, black 15%, black 85%, transparent 100%)", // Wider fade (15%)
          maskImage: "linear-gradient(to right, transparent 0%, black 15%, black 85%, transparent 100%)", // Wider fade (15%)
        }}
      >
        <Container maxW="container.xxl" px={0}>
          <SectionHeading title="Before ➜ After Visuals" description="See the Clipzy transformation in action." kicker="Visual Proof" />
          
          {(() => { 
            const images = Array.from({ length: 8 }, (_, i) => `/I${i + 1}.png`);
            const cardWidth = 345; 
            const marginRight = 24; 
            const totalWidthOfOneSet = (cardWidth + marginRight) * images.length;
            const animationDuration = 25; // Reduced from 40 to 25 seconds

            return (
              <MotionBox
                display="flex"
                w="max-content" 
                initial={{ x: 0 }}
                animate={{ x: -totalWidthOfOneSet }}
                transition={{
                  duration: animationDuration, // Use updated duration
                  ease: "linear",
                  repeat: Infinity,
                }}
              >
                {[...images, ...images].map((src, index) => (
                  <Box
                    key={index} // Unique key for each element
                    w={`${cardWidth}px`} // Changed from minW to w
                    h="auto" // Adjust height automatically based on image aspect ratio
                    bg={marqueeCardBg} // Use hoisted variable
                    rounded="xl" 
                    shadow="lg" 
                    overflow="hidden"
                    mr={`${marginRight}px`}
                  >
                    <Image src={src} alt={`Example ${index % images.length + 1}`} w="full" />
              </Box>
            ))}
              </MotionBox>
            );
          })()}

        </Container>
      </Box>

      <Box id="how" ref={howRef} bg={sectionBgLight} py={{ base: 16, md: 24 }}>
        <Container maxW="container.lg">
          <SectionHeading kicker="Workflow" title="3 Quick Steps to Stunning Visuals" description="Our intuitive process makes professional fashion imagery accessible to everyone." />
          <SimpleGrid columns={{ base: 1, md: 3 }} spacing={8} alignItems="stretch">
            <FeatureCard imageSrc="/P1.png">
              Upload any product photo. Flatlay, hanger, or CAD - we see it all.
            </FeatureCard>
            <FeatureCard imageSrc="/P2.png">
              Choose model type, pose, scene & extras easily.
            </FeatureCard>
            <FeatureCard imageSrc="/P3.png">
              Generate 8 looks instantly. Refine or export for campaigns.
            </FeatureCard>
          </SimpleGrid>
        </Container>
      </Box>

      <MotionBox 
        id="why" 
        ref={whyRef} 
        py={{ base: 16, md: 24 }}
        style={{
          background: heroAnimatedGradient,
          backgroundSize: "400% 400%",
        }}
        animate={{
          backgroundPosition: ["0% 50%", "100% 50%", "0% 50%"],
        }}
        transition={{
          duration: 15,
          ease: "linear",
          repeat: Infinity,
          repeatType: "loop",
        }}
      >
        <Container maxW="container.lg">
          <SectionHeading kicker="The Clipzy Edge" title="What Makes Us Different?" description="Discover the unique advantages that set Clipzy apart from traditional solutions."/>
          <SimpleGrid columns={{ base: 1, md: 3 }} spacing={8} alignItems="stretch">
            <FeatureCard title="Pattern‑Lock Precision" imageSrc="https://placehold.co/80x80/A5B4FC/1E293B?text=A">
              Your intricate graphics and patterns stay razor‑sharp and true‑to‑form, even on complex folds.
            </FeatureCard>
            <FeatureCard title="Multi‑Piece Looks" imageSrc="https://placehold.co/80x80/A5B4FC/1E293B?text=B">
              Effortlessly layer tops, bottoms, and accessories in a single shot for complete outfits.
          </FeatureCard>
            <FeatureCard title="Batch & Webhook Power" imageSrc="https://placehold.co/80x80/A5B4FC/1E293B?text=C">
              Process up to 500 SKUs overnight and get them auto‑delivered via webhook integration.
          </FeatureCard>
        </SimpleGrid>
      </Container>
      </MotionBox>

      <Box bg={sectionBgLight} py={{ base: 16, md: 24 }}>
        <Container maxW="container.md">
           <SectionHeading title="Calculate Your Savings" description="See how much time and money Clipzy can save your brand."/>
          <ROICalculator />
        </Container>
      </Box>

      <MotionBox 
        py={{ base: 16, md: 24 }} 
        textAlign="center"
        style={{
          background: heroAnimatedGradient,
          backgroundSize: "400% 400%",
        }}
        animate={{
          backgroundPosition: ["0% 50%", "100% 50%", "0% 50%"],
        }}
        transition={{
          duration: 15,
          ease: "linear",
          repeat: Infinity,
          repeatType: "loop",
        }}
      >
        <Container maxW="container.lg">
          <SectionHeading 
            title={<>Brands Ship Faster & Save More with <GradientText>Clipzy</GradientText></>} 
            description="Join leading brands transforming their visual content workflow."
          />
          <SimpleGrid columns={{ base: 1, sm: 2, md: 3 }} spacing={8} mt={8}>
            <MetricCard value="+26%" label="Conversion Uplift" />
            <MetricCard value="-20×" label="Cost Per Asset" />
            <MetricCard value="360%" label="Typical 90‑Day ROI" />
          </SimpleGrid>
          <Button as={Link} to="/login" mt={12} size="lg" colorScheme="blue" px={10}>Start Your Free Trial</Button>
      </Container>
      </MotionBox>

      <MotionBox 
        id="faq" 
        ref={faqRef} 
        py={{ base: 16, md: 24 }}
        style={{
          background: heroAnimatedGradient,
          backgroundSize: "400% 400%",
        }}
        animate={{
          backgroundPosition: ["0% 50%", "100% 50%", "0% 50%"],
        }}
        transition={{
          duration: 15,
          ease: "linear",
          repeat: Infinity,
          repeatType: "loop",
        }}
      >
        <Container maxW="container.lg">
          <Box bg={useColorModeValue("white", "gray.700")} p={{base: 8, md:12}} rounded="2xl" shadow="2xl">
            <Flex direction={{ base: "column", lg: "row" }} gap={{base: 10, lg: 16}}>
              <VStack flex={{lg: "0 0 300px"}} alignItems={{base: "center", lg: "flex-start"}} spacing={6} textAlign={{base: "center", lg: "left"}} mb={{base: 8, lg: 0}}>
                <Heading as="h2" fontSize={{ base: "3xl", md: "4xl" }} fontWeight="bold" color={textPrimary}>
                  Frequently Asked Questions
                </Heading>
                <Text color={textSecondary} fontSize="lg">
                  Get answers to commonly asked questions.
                </Text>
                <Button 
                  size="md" 
                  variant="solid"
                  bg={useColorModeValue("gray.100", "gray.700")}
                  color={textPrimary}
                  _hover={{bg: useColorModeValue("gray.200", "gray.600")}} 
                  rounded="full" 
                  px={6}
                  leftIcon={<ArrowForwardIcon transform="rotate(-45deg)" />}
                  alignSelf={{base: "center", lg: "flex-start"}}
                >
                  Contact Us
                </Button>
              </VStack>
              <VStack flex={{lg: 1}} spacing={4} w="full">
                <FaqItem q="Do I own the visuals generated with Clipzy?" a="Absolutely. All paid renders grant you full commercial rights to use the visuals as you see fit." />
                <FaqItem q="How many free credits do I get when I sign up?" a="You'll receive five free image generation credits and two motion loop credits to explore Clipzy's capabilities." />
                <FaqItem q="Can I cancel my subscription at any time?" a="Yes, you can cancel your subscription anytime. There are no long‑term contracts or hidden cancellation fees." />
                <FaqItem q="What kind of image files can I upload?" a="Clipzy works best with clear front-facing shots of your garments (flatlays, on hangers, or mannequins) or clean CAD files. JPG, PNG, and WEBP are supported." />
                <FaqItem q="Is there a free trial available?" a="Yes, we offer a free trial so you can experience the power of Clipzy firsthand before committing. Sign up to get started!" />
              </VStack>
            </Flex>
          </Box>
        </Container>
      </MotionBox>

      {/* FOOTER - BuzzAbout Style on sectionBgBlue */}
      <MotionBox 
        color={useColorModeValue(textSecondary, textOnDark)} 
        pt={{base: 16, md: 20}} 
        pb={10} 
        flexGrow={1}
        style={{
          background: heroAnimatedGradient,
          backgroundSize: "400% 400%",
        }}
        animate={{
          backgroundPosition: ["0% 50%", "100% 50%", "0% 50%"],
        }}
        transition={{
          duration: 15,
          ease: "linear",
          repeat: Infinity,
          repeatType: "loop",
        }}
      >
        <Container maxW="container.lg" position="relative">
          {/* CTA before main footer links */}
          <VStack spacing={5} mb={{base:12, md:20}} textAlign="center">
            <Heading as="h3" fontSize={{base: "2xl", md:"3xl"}} fontWeight="bold" color={useColorModeValue(textPrimary, headingOnDark)}>Ready to Revolutionize Your Fashion Workflow?</Heading>
            <Button 
              variant="solid" 
              bg={useColorModeValue("white", "gray.200")}
              color={useColorModeValue("gray.800", "gray.800")} // Ensure text is dark on light buttons
              _hover={{bg: useColorModeValue("gray.100", "gray.300")}} 
              rounded="full" 
              px={8} 
              py={6} // Make button a bit taller
              size="lg"
              fontWeight="medium"
              leftIcon={<ArrowForwardIcon transform="rotate(-45deg)" />}
              as={Link} to="/login"
            >
              Try for Free
            </Button>
          </VStack>

          {/* Link Columns */}
          <Flex 
            direction={{ base: "column", sm: "row" }} 
            justifyContent="space-between" 
            alignItems={{base: "center", sm: "flex-start"}}
            textAlign={{ base: "center", sm: "left" }}
            mb={16} // Increased margin bottom
            position="relative" 
            zIndex="1"
            gap={{base:10, sm: 8}} // Responsive gap
          >
            <VStack align={{ base: "center", sm: "flex-start" }} spacing={3} flex={1} minW="150px">
              <Text fontWeight="semibold" fontSize="md" color={useColorModeValue(textPrimary, headingOnDark)} mb={1}>About Us</Text>
              <ChakraLink href="#why" onClick={() => scrollTo(whyRef)} fontSize="sm" color={useColorModeValue(textSecondary, "whiteAlpha.700")} _hover={{color:primaryBlue, textDecoration:"underline"}}>Features</ChakraLink>
              <ChakraLink href="#" fontSize="sm" color={useColorModeValue(textSecondary, "whiteAlpha.700")} _hover={{color:primaryBlue, textDecoration:"underline"}}>Pricing</ChakraLink>
              <ChakraLink href="#" fontSize="sm" color={useColorModeValue(textSecondary, "whiteAlpha.700")} _hover={{color:primaryBlue, textDecoration:"underline"}}>Blog</ChakraLink>
            </VStack>
            <VStack align={{ base: "center", sm: "flex-start" }} spacing={3} flex={1} minW="150px">
              <Text fontWeight="semibold" fontSize="md" color={useColorModeValue(textPrimary, headingOnDark)} mb={1}>Contact Us</Text>
              <ChakraLink href="#" fontSize="sm" color={useColorModeValue(textSecondary, "whiteAlpha.700")} _hover={{color:primaryBlue, textDecoration:"underline"}}>LinkedIn</ChakraLink>
              <ChakraLink href="#" fontSize="sm" color={useColorModeValue(textSecondary, "whiteAlpha.700")} _hover={{color:primaryBlue, textDecoration:"underline"}}>Twitter</ChakraLink>
              <ChakraLink href="#" fontSize="sm" color={useColorModeValue(textSecondary, "whiteAlpha.700")} _hover={{color:primaryBlue, textDecoration:"underline"}}>Support</ChakraLink>
            </VStack>
            <VStack align={{ base: "center", sm: "flex-start" }} spacing={3} flex={1} minW="150px">
              <Text fontWeight="semibold" fontSize="md" color={useColorModeValue(textPrimary, headingOnDark)} mb={1}>Legal</Text>
              <ChakraLink as={Link} to="/privacy-policy" fontSize="sm" color={useColorModeValue(textSecondary, "whiteAlpha.700")} _hover={{color:primaryBlue, textDecoration:"underline"}}>Privacy Policy</ChakraLink>
              <ChakraLink as={Link} to="/terms-of-service" fontSize="sm" color={useColorModeValue(textSecondary, "whiteAlpha.700")} _hover={{color:primaryBlue, textDecoration:"underline"}}>Terms of Service</ChakraLink>
            </VStack>
          </Flex>
          
          {/* Copyright */}
          <Box            
            borderTopWidth="1px"
            borderColor={useColorModeValue(borderGray, "gray.700")} // Adjusted border for sectionBgBlue
            pt={8}
            textAlign="center"
          >
            <Text fontSize="sm" color={useColorModeValue(textSecondary, "gray.400")}>© {new Date().getFullYear()} Clipzy (by Nyx Solutions). All rights reserved.</Text>
          </Box>

          {/* CLIPZY Watermark - Now at the bottom of the flow */}
          <Heading
            as="div"
            fontSize={{ base: "100px", sm: "150px", md: "200px", lg: "220px"}}
            lineHeight="0.7" // Tighter line height for large text
            fontWeight="extrabold"
            color={useColorModeValue("blue.200", "whiteAlpha.100")} // Made color less subtle
            userSelect="none"
            opacity={useColorModeValue(0.3, 0.15)} // Increased opacity
            textAlign="center"
            w="full"
            whiteSpace="nowrap"
            mt={4} // Adjusted margin top to a fixed smaller value
            // overflow="hidden" // Consider if text should be clipped by container bounds
          >
            CLIPZY
          </Heading>

        </Container>
      </MotionBox>
    </Box>
  );
} 
