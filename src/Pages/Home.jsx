// File: src/pages/Home.jsx

import Particles from "@tsparticles/react";
import { motion } from "framer-motion";
import React from "react";
import { FiCheckCircle, FiClock, FiTrendingUp } from "react-icons/fi";
import { Link } from "react-router-dom";
import { TypeAnimation } from "react-type-animation";
import { loadFull } from "tsparticles";

const Home = () => {
  const features = [
    {
      icon: <FiCheckCircle className="w-8 h-8 mb-4" />,
      title: "Task Management",
      description: "Easily create, organize, and prioritize your tasks",
    },
    {
      icon: <FiClock className="w-8 h-8 mb-4" />,
      title: "Deadline Tracking",
      description: "Never miss important deadlines with smart reminders",
    },
    {
      icon: <FiTrendingUp className="w-8 h-8 mb-4" />,
      title: "Progress Insights",
      description: "Visualize your productivity with detailed analytics",
    },
  ];

  const particlesInit = async (engine) => {
    // Initiates the full tsparticles package
    await loadFull(engine);
  };

  return (
    /* Main wrapper with normal z-index, so it’s not behind the background */
    <div className="relative min-h-screen bg-gradient-to-br from-blue-50 to-indigo-50 overflow-hidden">
      {/* Particles wrapper with negative z-index behind content */}
      <div className="absolute top-0 left-0 w-full h-full -z-10">
        <Particles
          id="tsparticles"
          init={particlesInit}
          options={{
            particles: {
              number: {
                value: 50,
                density: { enable: true, value_area: 800 },
              },
              color: { value: "#3B82F6" },
              shape: { type: "circle" },
              opacity: { value: 0.5 },
              size: { value: 3 },
              move: {
                enable: true,
                speed: 1,
                direction: "none",
                random: false,
                straight: false,
                out_mode: "out",
                bounce: false,
              },
            },
            interactivity: {
              events: {
                onhover: { enable: true, mode: "repulse" },
              },
            },
          }}
        />
      </div>

      {/* Give some top padding so the hero text is not covered by a fixed/sticky navbar */}
      <div className="container mx-auto px-4 pt-24 pb-16 relative z-10">
        {/* Hero Section */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8 }}
          className="text-center mb-16"
        >
          <h1 className="text-5xl font-bold mb-6 bg-gradient-to-r from-blue-600 to-indigo-600 bg-clip-text text-transparent">
            Transform Your Productivity
          </h1>

          <div className="text-2xl mb-8 text-gray-700 font-medium relative">
            <TypeAnimation
              sequence={[
                "Organize tasks efficiently",
                1500,
                "Boost team collaboration",
                1500,
                "Achieve your goals faster",
                1500,
              ]}
              wrapper="div"
              cursor
              repeat={Infinity}
            />
          </div>

          <motion.div whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.95 }}>
            <Link
              to="/dashboard"
              className="inline-block bg-gradient-to-r from-blue-500 to-indigo-600 text-white px-8 py-4 rounded-xl text-lg font-semibold shadow-lg hover:shadow-xl transition-all duration-300"
            >
              Get Started Free
            </Link>
          </motion.div>
        </motion.div>

        {/* Example "features" section (optional) */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
          {features.map((feature, index) => (
            <motion.div
              key={index}
              className="bg-white rounded-lg p-6 shadow-md text-center"
              initial={{ opacity: 0, y: 10 }}
              whileInView={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5 }}
              viewport={{ once: true }}
            >
              <div className="flex justify-center text-blue-600">
                {feature.icon}
              </div>
              <h3 className="text-xl font-semibold text-gray-700 mb-2">
                {feature.title}
              </h3>
              <p className="text-gray-600">{feature.description}</p>
            </motion.div>
          ))}
        </div>
      </div>
    </div>
  );
};

export default Home;
