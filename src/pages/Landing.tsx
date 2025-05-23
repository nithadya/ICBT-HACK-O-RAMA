import { motion, useScroll, useTransform, AnimatePresence } from "framer-motion";
import { Button } from "@/components/ui/button";
import { useNavigate } from "react-router-dom";
import { ArrowRight, BookOpen, Brain, Trophy, Users, Sparkles, ArrowDown, Rocket, Laptop, GraduationCap, Atom, Code, ChevronRight } from "lucide-react";
import Spline from '@splinetool/react-spline';
import { useRef, useEffect, useState } from 'react';
import Typewriter from 'typewriter-effect';
import { useAuth } from "@/context/AuthContext";

// Code-inspired grid background
const CodeGrid = () => (
  <div className="absolute inset-0 overflow-hidden">
    <div className="absolute inset-0" style={{
      backgroundImage: `
        linear-gradient(90deg, rgba(59,130,246,0.05) 1px, transparent 1px),
        linear-gradient(0deg, rgba(59,130,246,0.05) 1px, transparent 1px)
      `,
      backgroundSize: '20px 20px',
      maskImage: 'radial-gradient(circle at 50% 50%, black, transparent)'
    }} />
  </div>
);

// Binary particles animation
const BinaryParticles = () => (
  <div className="absolute inset-0 overflow-hidden pointer-events-none">
    {Array.from({ length: 20 }).map((_, i) => (
      <motion.div
        key={i}
        className="absolute text-blue-500/10 font-mono text-xs"
        initial={{ 
          x: Math.random() * window.innerWidth,
          y: -20,
          opacity: 0 
        }}
        animate={{
          y: window.innerHeight + 20,
          opacity: [0, 1, 0],
        }}
        transition={{
          duration: Math.random() * 10 + 10,
          repeat: Infinity,
          delay: Math.random() * 5,
        }}
      >
        {Math.random() > 0.5 ? '1' : '0'}
      </motion.div>
    ))}
  </div>
);

// Circuit lines animation
const CircuitLines = () => (
  <div className="absolute inset-0 overflow-hidden pointer-events-none">
    {Array.from({ length: 6 }).map((_, i) => (
      <motion.div
        key={i}
        className="absolute h-px bg-gradient-to-r from-blue-500/0 via-blue-500/20 to-blue-500/0"
        style={{
          width: '100%',
          top: `${(i + 1) * 15}%`,
          left: '-100%'
        }}
        animate={{
          left: ['100%', '-100%']
        }}
        transition={{
          duration: 15,
          delay: i * 2,
          repeat: Infinity,
          ease: "linear"
        }}
      />
    ))}
  </div>
);

// Futuristic grid background
const GridBackground = () => (
  <div className="absolute inset-0 overflow-hidden">
    <div className="absolute inset-0" style={{
      backgroundImage: `
        linear-gradient(90deg, rgba(147,197,253,0.1) 1px, transparent 1px),
        linear-gradient(0deg, rgba(147,197,253,0.1) 1px, transparent 1px)
      `,
      backgroundSize: '4rem 4rem',
      maskImage: 'radial-gradient(circle at 50% 50%, black, transparent)'
    }} />
  </div>
);

// Animated tech lines
const TechLines = () => (
  <div className="absolute left-0 top-0 h-full w-1/3 overflow-hidden pointer-events-none">
    {Array.from({ length: 5 }).map((_, i) => (
      <motion.div
        key={i}
        className="absolute h-px bg-gradient-to-r from-blue-500/0 via-blue-500/50 to-blue-500/0"
        style={{
          width: '100%',
          top: `${20 + i * 20}%`,
          left: '-100%'
        }}
        animate={{
          left: ['-100%', '200%']
        }}
        transition={{
          duration: 3,
          delay: i * 0.5,
          repeat: Infinity,
          ease: "linear"
        }}
      />
    ))}
  </div>
);

// Floating innovation icons
const InnovationIcons = () => (
  <div className="absolute right-0 top-0 w-1/2 h-full">
    {Array.from({ length: 6 }).map((_, i) => (
      <motion.div
        key={i}
        className="absolute"
        style={{
          top: `${Math.random() * 100}%`,
          left: `${Math.random() * 100}%`
        }}
        animate={{
          y: [0, -20, 0],
          opacity: [0.3, 1, 0.3],
          scale: [1, 1.2, 1]
        }}
        transition={{
          duration: 3 + Math.random() * 2,
          repeat: Infinity,
          delay: i * 0.5
        }}
      >
        <div className={`w-3 h-3 rounded-full bg-gradient-to-r from-blue-400 to-cyan-400 blur-[2px]`} />
      </motion.div>
    ))}
  </div>
);

// Floating particles component
const FloatingParticles = ({ count = 20 }) => {
  const particles = Array.from({ length: count }).map((_, i) => ({
    id: i,
    size: Math.random() * 3 + 1,
    duration: Math.random() * 5 + 3,
    delay: Math.random() * 2
  }));

  return (
    <div className="absolute inset-0 overflow-hidden pointer-events-none">
      {particles.map((particle) => (
        <motion.div
          key={particle.id}
          className="absolute rounded-full bg-blue-400/30"
          style={{
            width: particle.size,
            height: particle.size,
            left: `${Math.random() * 100}%`,
            top: `${Math.random() * 100}%`
          }}
          animate={{
            y: [-20, 20],
            x: [-20, 20],
            opacity: [0, 1, 0],
            scale: [1, 1.5, 1]
          }}
          transition={{
            duration: particle.duration,
            repeat: Infinity,
            delay: particle.delay,
            ease: "linear"
          }}
        />
      ))}
    </div>
  );
};

// Tech grid component
const TechGrid = ({ side = "left" }) => (
  <div className={`absolute top-0 bottom-0 ${side}-0 w-64 opacity-30 pointer-events-none`}>
    <div className="relative w-full h-full">
      {Array.from({ length: 8 }).map((_, i) => (
        <motion.div
          key={i}
          className="absolute w-16 h-16 border border-blue-400/20 rounded-lg"
          style={{
            left: `${(i % 4) * 25}%`,
            top: `${Math.floor(i / 4) * 25}%`
          }}
          initial={{ opacity: 0, scale: 0.8 }}
          animate={{
            opacity: [0, 0.5, 0],
            scale: [0.8, 1, 0.8],
            rotate: [0, 90, 0]
          }}
          transition={{
            duration: 4,
            repeat: Infinity,
            delay: i * 0.2,
            ease: "linear"
          }}
        />
      ))}
    </div>
  </div>
);

// Holographic rings component
const HolographicRings = () => (
  <div className="absolute inset-0 pointer-events-none">
    {Array.from({ length: 3 }).map((_, i) => (
      <motion.div
        key={i}
        className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 rounded-full border border-cyan-400/30"
        style={{
          width: `${(i + 1) * 200}px`,
          height: `${(i + 1) * 200}px`
        }}
        animate={{
          rotate: [0, 360],
          scale: [1, 1.1, 1],
          opacity: [0.2, 0.4, 0.2]
        }}
        transition={{
          duration: 10 + i * 2,
          repeat: Infinity,
          ease: "linear"
        }}
      />
    ))}
  </div>
);

// Animated feature card
const FeatureCard = ({ icon: Icon, title, description, gradient, delay }) => (
  <motion.div
    initial={{ opacity: 0, y: 20 }}
    whileInView={{ opacity: 1, y: 0 }}
    viewport={{ once: true }}
    transition={{ duration: 0.8, delay }}
    whileHover={{ scale: 1.05, translateY: -5 }}
    className="relative p-6 rounded-2xl bg-white/5 backdrop-blur-xl border border-white/10 shadow-2xl group"
  >
    <div className={`absolute inset-0 rounded-2xl ${gradient} opacity-0 group-hover:opacity-10 transition-opacity duration-500`} />
    <div className={`w-12 h-12 rounded-xl ${gradient} flex items-center justify-center mb-4`}>
      <Icon className="w-6 h-6 text-white" />
    </div>
    <h3 className="text-xl font-semibold mb-2 text-white">{title}</h3>
    <p className="text-gray-300">{description}</p>
  </motion.div>
);

// Stats component with counter animation
const StatCounter = ({ end, label, delay }) => {
  const [count, setCount] = useState(0);
  const counterRef = useRef(null);

  useEffect(() => {
    const observer = new IntersectionObserver(
      (entries) => {
        if (entries[0].isIntersecting) {
          let start = 0;
          const duration = 2000;
          const increment = end / (duration / 16);
          const timer = setInterval(() => {
            start += increment;
            if (start > end) {
              setCount(end);
              clearInterval(timer);
            } else {
              setCount(Math.floor(start));
            }
          }, 16);
        }
      },
      { threshold: 0.5 }
    );

    if (counterRef.current) {
      observer.observe(counterRef.current);
    }

    return () => observer.disconnect();
  }, [end]);

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true }}
      transition={{ duration: 0.8, delay }}
      className="text-center"
      ref={counterRef}
    >
      <div className="text-4xl font-bold text-white mb-2">{count}+</div>
      <div className="text-gray-400">{label}</div>
    </motion.div>
  );
};

const Landing = () => {
  const navigate = useNavigate();
  const { user, isLoading } = useAuth();
  const containerRef = useRef(null);
  const [isLoaded, setIsLoaded] = useState(false);
  const [currentTheme, setCurrentTheme] = useState(0);
  
  const themes = [
    { text: "AI", color: "from-blue-600 to-cyan-500" },
    { text: "TECH", color: "from-indigo-600 to-blue-500" },
    { text: "SPACE", color: "from-violet-600 to-indigo-500" },
    { text: "LEARN", color: "from-green-600 to-emerald-500" }
  ];

  useEffect(() => {
    const interval = setInterval(() => {
      setCurrentTheme((prev) => (prev + 1) % themes.length);
    }, 3000);
    return () => clearInterval(interval);
  }, []);

  useEffect(() => {
    if (user) {
      const userRole = user.user_metadata?.role;
      switch (userRole) {
        case 'admin':
          navigate('/app/admin');
          break;
        case 'contributor':
          navigate('/app/courses');
          break;
        case 'learner':
        default:
          navigate('/app');
          break;
      }
    }
  }, [user, navigate]);

  const { scrollYProgress } = useScroll({
    target: containerRef,
    offset: ["start start", "end start"]
  });

  const y = useTransform(scrollYProgress, [0, 1], ["0%", "50%"]);
  const opacity = useTransform(scrollYProgress, [0, 0.5], [1, 0]);

  function onSplineLoad() {
    setIsLoaded(true);
  }

  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-white">
        <div className="flex flex-col items-center">
          <div className="h-12 w-12 border-4 border-t-blue-600 border-r-blue-600 border-b-purple-600 border-l-purple-600 rounded-full animate-spin"></div>
          <p className="mt-4 text-gray-600">Loading...</p>
        </div>
      </div>
    );
  }

  const handleInitialize = () => {
    navigate('/auth', { state: { defaultTab: 'sign-up' } });
  };

  return (
    <div className="relative font-poppins bg-gradient-to-b from-gray-900 via-gray-800 to-black min-h-screen" ref={containerRef}>
      {/* Hero Section */}
      <motion.section 
        className="relative min-h-screen flex items-center overflow-hidden bg-white"
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ duration: 1 }}
      >
        {/* Background Elements */}
        <CodeGrid />
        <BinaryParticles />
        <CircuitLines />
        
        {/* Main Content */}
        <div className="container mx-auto px-4">
          <div className="flex flex-col lg:flex-row items-center justify-between gap-12">
            {/* Left Content */}
            <motion.div 
              className="w-full lg:w-1/2 space-y-8 pt-20 lg:pt-0"
              initial={{ opacity: 0, x: -50 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ duration: 1, delay: 0.2 }}
            >
              {/* Tech Badge */}
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.8 }}
                className="inline-flex items-center px-3 py-1 rounded-full bg-blue-50 border border-blue-100"
              >
                <Code className="w-4 h-4 mr-2 text-blue-600" />
                <span className="text-blue-600 font-medium font-mono tracking-wide">Next-Gen Learning</span>
              </motion.div>

              {/* Dynamic Theme Text */}
              <div className="relative">
                <AnimatePresence mode="wait">
                  <motion.div
                    key={currentTheme}
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, y: -20 }}
                    transition={{ duration: 0.5 }}
                    className="relative"
                  >
                    <div className={`text-7xl lg:text-8xl xl:text-9xl font-bold bg-gradient-to-r ${themes[currentTheme].color} bg-clip-text text-transparent tracking-tight font-mono`}>
                      {themes[currentTheme].text}
                    </div>
                    <motion.div
                      className="absolute -bottom-2 left-0 h-1 bg-gradient-to-r from-blue-500 to-cyan-500"
                      initial={{ width: "0%" }}
                      animate={{ width: "100%" }}
                      transition={{ duration: 2, repeat: Infinity }}
                    />
                  </motion.div>
                </AnimatePresence>
              </div>

              {/* Main Heading with Typewriter */}
              <motion.div 
                className="text-4xl lg:text-5xl font-bold text-gray-900 tracking-tight font-mono"
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                transition={{ duration: 0.8, delay: 0.4 }}
              >
                <span className="relative">
                  Transform_
                  <motion.span
                    className="absolute -right-1 top-0 w-[2px] h-full bg-blue-500"
                    animate={{ opacity: [1, 0] }}
                    transition={{ duration: 0.8, repeat: Infinity }}
                  />
                </span>
                <span className="bg-clip-text text-transparent bg-gradient-to-r from-blue-600 to-cyan-500">
                  <Typewriter
                    options={{
                      strings: ['Intelligence.run()', 'Innovation.deploy()', 'Future.init()', 'Learning.exec()'],
                      autoStart: true,
                      loop: true,
                      deleteSpeed: 50,
                      delay: 80,
                      wrapperClassName: 'font-mono',
                      cursorClassName: 'text-blue-500'
                    }}
                  />
                </span>
              </motion.div>

              {/* Description */}
              <motion.p
                className="text-lg text-gray-600 max-w-xl leading-relaxed font-light"
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.8, delay: 0.6 }}
              >
                Experience education reimagined through advanced AI algorithms and space-age technology. 
                Our platform combines cutting-edge innovation with seamless learning integration.
              </motion.p>

              {/* CTA Buttons */}
              <motion.div
                className="flex flex-col sm:flex-row items-center gap-4"
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.8, delay: 0.8 }}
              >
                <Button 
                  size="lg" 
                  onClick={() => navigate("/auth", { state: { defaultTab: "sign-up" } })}
                  className="w-full sm:w-auto bg-gradient-to-r from-blue-600 to-cyan-500 hover:from-blue-700 hover:to-cyan-600 text-white px-8 py-6 rounded-xl text-lg font-medium tracking-wide shadow-xl shadow-blue-500/20 hover:shadow-blue-500/30 transition-all duration-300 font-mono"
                >
                  initialize() <ArrowRight className="ml-2" />
                </Button>
                <Button 
                  size="lg" 
                  variant="outline"
                  onClick={() => navigate("/about")}
                  className="w-full sm:w-auto border-2 border-blue-200 text-blue-600 hover:bg-blue-50 px-8 py-6 rounded-xl text-lg font-medium tracking-wide transition-all duration-300 font-mono"
                >
                  learn.more()
                </Button>
              </motion.div>

              {/* Tech Pills */}
              <div className="flex flex-wrap gap-3">
                {[
                  { text: 'AI.powered()', color: 'from-blue-600 to-cyan-500' },
                  { text: 'Space.tech()', color: 'from-purple-600 to-pink-500' },
                  { text: 'Future.ready()', color: 'from-green-600 to-teal-500' },
                  { text: 'Code.driven()', color: 'from-orange-600 to-red-500' }
                ].map((pill, index) => (
                  <motion.span
                    key={pill.text}
                    initial={{ opacity: 0, scale: 0.8 }}
                    animate={{ opacity: 1, scale: 1 }}
                    transition={{ delay: 1 + index * 0.1 }}
                    className={`px-4 py-1 rounded-full text-sm bg-gradient-to-r ${pill.color} text-white font-mono`}
                  >
                    {pill.text}
                  </motion.span>
                ))}
              </div>
            </motion.div>

            {/* Right Content - 3D Model */}
            <motion.div 
              className="w-full lg:w-1/2 h-[600px] relative"
              initial={{ opacity: 0, scale: 0.9 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ duration: 1, delay: 0.4 }}
            >
              <div className="absolute inset-0">
                <Spline 
                  scene="https://prod.spline.design/lGtNDQpfA6dSkN7l/scene.splinecode"
                  onLoad={onSplineLoad}
                />
              </div>
              {/* Tech Decorative Elements */}
              <div className="absolute -top-20 -right-20 w-64 h-64 bg-blue-500/10 rounded-full blur-3xl animate-pulse" />
              <div className="absolute -bottom-20 -right-20 w-64 h-64 bg-cyan-500/10 rounded-full blur-3xl animate-pulse delay-1000" />
            </motion.div>
          </div>
        </div>
      </motion.section>

      {/* Features Grid Section */}
      <section className="py-20 relative overflow-hidden">
        <div className="container mx-auto px-4">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
            <FeatureCard
              icon={Brain}
              title="AI-Powered Learning"
              description="Personalized learning paths adapted to your unique style and pace"
              gradient="bg-gradient-to-r from-blue-600 to-cyan-500"
              delay={0.2}
            />
            <FeatureCard
              icon={Rocket}
              title="Space Technology"
              description="Explore concepts through immersive 3D visualizations"
              gradient="bg-gradient-to-r from-purple-600 to-pink-500"
              delay={0.4}
            />
            <FeatureCard
              icon={Laptop}
              title="Modern Tech Stack"
              description="Built with cutting-edge technology for optimal performance"
              gradient="bg-gradient-to-r from-orange-600 to-red-500"
              delay={0.6}
            />
          </div>
        </div>
      </section>

      {/* Stats Section */}
      <section className="py-20 relative">
        <div className="container mx-auto px-4">
          <div className="grid grid-cols-2 md:grid-cols-4 gap-8">
            <StatCounter end={1000} label="Active Users" delay={0.2} />
            <StatCounter end={50} label="AI Models" delay={0.4} />
            <StatCounter end={200} label="Learning Paths" delay={0.6} />
            <StatCounter end={95} label="Success Rate" delay={0.8} />
          </div>
        </div>
      </section>

      {/* Education Innovation Section */}
      <section className="py-20 relative overflow-hidden">
        <div className="container mx-auto px-4">
          <div className="flex flex-col lg:flex-row items-center gap-12">
            <motion.div
              initial={{ opacity: 0, x: -50 }}
              whileInView={{ opacity: 1, x: 0 }}
              viewport={{ once: true }}
              className="lg:w-1/2"
            >
              <h2 className="text-4xl md:text-5xl font-bold text-white mb-6">
                Transform Education Through Innovation
              </h2>
              <p className="text-gray-400 mb-8">
                Our platform combines the power of artificial intelligence, space technology,
                and modern education methodologies to create an unparalleled learning experience.
              </p>
              <div className="space-y-4">
                {[
                  { icon: GraduationCap, text: "Adaptive Learning Paths" },
                  { icon: Users, text: "Collaborative Learning Spaces" },
                  { icon: Atom, text: "Interactive 3D Models" },
                  { icon: Code, text: "Real-time Progress Tracking" }
                ].map((item, index) => (
                  <motion.div
                    key={index}
                    initial={{ opacity: 0, x: -20 }}
                    whileInView={{ opacity: 1, x: 0 }}
                    viewport={{ once: true }}
                    transition={{ delay: index * 0.2 }}
                    className="flex items-center space-x-3 text-gray-300"
                  >
                    <item.icon className="w-5 h-5 text-blue-500" />
                    <span>{item.text}</span>
                  </motion.div>
                ))}
              </div>
            </motion.div>
            <motion.div
              initial={{ opacity: 0, scale: 0.9 }}
              whileInView={{ opacity: 1, scale: 1 }}
              viewport={{ once: true }}
              className="lg:w-1/2 h-[400px] relative"
            >
              <div className="absolute inset-0">
                <Spline 
                  scene="https://prod.spline.design/lGtNDQpfA6dSkN7l/scene.splinecode"
                  onLoad={onSplineLoad}
                />
              </div>
            </motion.div>
          </div>
        </div>
      </section>

      {/* Technology Showcase Section */}
      <section className="py-20 relative overflow-hidden">
        <div className="container mx-auto px-4">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            className="text-center mb-16"
          >
            <h2 className="text-4xl md:text-5xl font-bold text-white mb-4">
              Cutting-Edge Technology
            </h2>
            <p className="text-gray-400 max-w-2xl mx-auto">
              Powered by the latest advancements in AI and space technology
            </p>
          </motion.div>

          <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 items-center">
            <motion.div
              initial={{ opacity: 0, x: -50 }}
              whileInView={{ opacity: 1, x: 0 }}
              viewport={{ once: true }}
              className="space-y-6"
            >
              {[
                {
                  title: "AI-Driven Learning",
                  description: "Personalized learning paths adapted to your pace and style",
                  icon: Brain
                },
                {
                  title: "Space Technology Integration",
                  description: "Immersive 3D visualizations and interactive models",
                  icon: Rocket
                },
                {
                  title: "Real-time Collaboration",
                  description: "Connect with learners and educators globally",
                  icon: Users
                }
              ].map((item, index) => (
                <motion.div
                  key={index}
                  initial={{ opacity: 0, y: 20 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  viewport={{ once: true }}
                  transition={{ delay: index * 0.2 }}
                  className="flex gap-4 p-6 rounded-xl bg-white/5 backdrop-blur-sm border border-white/10"
                >
                  <div className="flex-shrink-0">
                    <div className="w-12 h-12 rounded-lg bg-gradient-to-r from-blue-600 to-cyan-500 flex items-center justify-center">
                      <item.icon className="w-6 h-6 text-white" />
                    </div>
                  </div>
                  <div>
                    <h3 className="text-xl font-semibold text-white mb-2">{item.title}</h3>
                    <p className="text-gray-400">{item.description}</p>
                  </div>
                </motion.div>
              ))}
            </motion.div>

            <motion.div
              initial={{ opacity: 0, scale: 0.9 }}
              whileInView={{ opacity: 1, scale: 1 }}
              viewport={{ once: true }}
              className="relative h-[500px]"
            >
              <div className="absolute inset-0">
                <Spline 
                  scene="https://prod.spline.design/lGtNDQpfA6dSkN7l/scene.splinecode"
                />
              </div>
              {/* Decorative Elements */}
              <div className="absolute inset-0 bg-gradient-to-t from-gray-900 via-transparent to-transparent" />
            </motion.div>
          </div>
        </div>
      </section>

      {/* Call to Action Section */}
      <section className="py-20 relative">
        <div className="container mx-auto px-4">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            className="max-w-4xl mx-auto text-center relative z-10"
          >
            <h2 className="text-4xl md:text-6xl font-bold text-white mb-6">
              Ready to Transform Your Learning Experience?
            </h2>
            <p className="text-xl text-gray-400 mb-8">
              Join thousands of learners who are already experiencing the future of education
            </p>
            <motion.div
              className="flex flex-col sm:flex-row items-center justify-center gap-4"
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ delay: 0.2 }}
            >
              <Button
                size="lg"
                onClick={handleInitialize}
                className="w-full sm:w-auto bg-gradient-to-r from-blue-600 to-cyan-500 hover:from-blue-700 hover:to-cyan-600 text-white px-12 py-6 rounded-xl text-lg font-medium tracking-wide shadow-xl shadow-blue-500/20 hover:shadow-blue-500/30 transition-all duration-300"
              >
                Get Started Now <ArrowRight className="ml-2" />
              </Button>
              <Button
                size="lg"
                variant="outline"
                onClick={() => navigate("/about")}
                className="w-full sm:w-auto border-2 border-white/10 text-white hover:bg-white/5 px-12 py-6 rounded-xl text-lg font-medium tracking-wide transition-all duration-300 backdrop-blur-sm"
              >
                Learn More
              </Button>
            </motion.div>
          </motion.div>
        </div>

        {/* Background Animation */}
        <div className="absolute inset-0 overflow-hidden pointer-events-none">
          <div className="absolute inset-0 opacity-30">
            {Array.from({ length: 3 }).map((_, i) => (
              <motion.div
                key={i}
                className="absolute rounded-full bg-gradient-to-r from-blue-500 to-cyan-500"
                style={{
                  width: 300 + i * 100,
                  height: 300 + i * 100,
                  left: '50%',
                  top: '50%',
                  transform: 'translate(-50%, -50%)',
                }}
                animate={{
                  scale: [1, 1.2, 1],
                  opacity: [0.1, 0.2, 0.1],
                  rotate: [0, 180, 360],
                }}
                transition={{
                  duration: 10 + i * 2,
                  repeat: Infinity,
                  ease: "linear",
                }}
              />
            ))}
          </div>
        </div>
      </section>

      {/* Footer Section */}
      <footer className="py-12 relative">
        <div className="container mx-auto px-4">
          <div className="text-center text-gray-400">
            <p>© 2024 ClassSync Nexus Hub. All rights reserved.</p>
          </div>
        </div>
      </footer>
    </div>
  );
};

export default Landing; 