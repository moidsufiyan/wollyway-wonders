
import React from 'react';
import { motion } from 'framer-motion';
import Navbar from '@/components/Navbar';
import Footer from '@/components/Footer';

const About = () => {
  return (
    <div className="min-h-screen">
      <Navbar />
      
      {/* Hero Section */}
      <div className="pt-24 pb-16 bg-gradient-to-b from-purple-50 to-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5 }}
            className="text-center"
          >
            <h1 className="text-4xl md:text-5xl font-bold mb-4">About Wollyway</h1>
            <p className="text-lg text-muted-foreground max-w-3xl mx-auto">
              Handcrafted accessories made with love, designed to spark joy and express your unique personality.
            </p>
          </motion.div>
        </div>
      </div>
      
      {/* Our Story */}
      <div className="py-16">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-12 items-center">
            <motion.div
              initial={{ opacity: 0, x: -30 }}
              whileInView={{ opacity: 1, x: 0 }}
              transition={{ duration: 0.7 }}
              viewport={{ once: true }}
            >
              <img 
                src="https://images.unsplash.com/photo-1556228578-8c89e6adf883?ixlib=rb-4.0.3&auto=format&fit=crop&w=800&q=80"
                alt="Artisan crafting accessories" 
                className="rounded-lg shadow-md w-full h-[400px] object-cover"
              />
            </motion.div>
            <motion.div
              initial={{ opacity: 0, x: 30 }}
              whileInView={{ opacity: 1, x: 0 }}
              transition={{ duration: 0.7, delay: 0.2 }}
              viewport={{ once: true }}
              className="space-y-6"
            >
              <h2 className="text-3xl font-bold">Our Story</h2>
              <p className="text-muted-foreground">
                Wollyway began in 2018 as a small passion project, crafting unique accessories for friends and family. 
                What started as a creative outlet quickly blossomed into a beloved brand known for its handcrafted 
                quality and distinctive designs.
              </p>
              <p className="text-muted-foreground">
                Each Wollyway item is carefully made by skilled artisans who put their heart into every knot, 
                stitch, and pattern. We believe that accessories shouldn't just be add-ons but expressions of 
                personality and style.
              </p>
              <p className="text-muted-foreground">
                Today, we're proud to share our creations with customers worldwide, while maintaining the 
                same commitment to quality, creativity, and personal connection that inspired us from day one.
              </p>
            </motion.div>
          </div>
        </div>
      </div>
      
      {/* Our Values */}
      <div className="py-16 bg-gray-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5 }}
            viewport={{ once: true }}
            className="text-center mb-12"
          >
            <h2 className="text-3xl font-bold mb-4">Our Values</h2>
            <p className="text-lg text-muted-foreground max-w-3xl mx-auto">
              The principles that guide everything we do at Wollyway.
            </p>
          </motion.div>
          
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            {[
              {
                title: "Handcrafted Quality",
                description: "We believe in the beauty of handmade items, where each piece tells a story and carries the touch of its creator.",
                icon: "🧵"
              },
              {
                title: "Sustainable Practices",
                description: "From our materials to our packaging, we strive to make choices that are kind to our planet and future generations.",
                icon: "🌱"
              },
              {
                title: "Creative Expression",
                description: "We create accessories that help you express your unique personality and add joy to your everyday life.",
                icon: "✨"
              }
            ].map((value, index) => (
              <motion.div
                key={index}
                initial={{ opacity: 0, y: 30 }}
                whileInView={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.5, delay: index * 0.1 }}
                viewport={{ once: true }}
                className="bg-white p-8 rounded-xl shadow-sm"
              >
                <div className="text-4xl mb-4">{value.icon}</div>
                <h3 className="text-xl font-semibold mb-3">{value.title}</h3>
                <p className="text-muted-foreground">{value.description}</p>
              </motion.div>
            ))}
          </div>
        </div>
      </div>
      
      {/* Team Section */}
      <div className="py-16">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5 }}
            viewport={{ once: true }}
            className="text-center mb-12"
          >
            <h2 className="text-3xl font-bold mb-4">Meet Our Team</h2>
            <p className="text-lg text-muted-foreground max-w-3xl mx-auto">
              The creative minds and skilled hands behind your favorite accessories.
            </p>
          </motion.div>
          
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-8">
            {[
              {
                name: "Maya Johnson",
                role: "Founder & Lead Designer",
                bio: "With a background in fashion and a passion for handcrafts, Maya brings creative vision to every Wollyway design.",
                image: "https://images.unsplash.com/photo-1534528741775-53994a69daeb?ixlib=rb-4.0.3&auto=format&fit=crop&w=400&q=80"
              },
              {
                name: "Alex Chen",
                role: "Master Artisan",
                bio: "Alex has been creating handcrafted accessories for over 10 years, bringing unmatched skill and precision to each piece.",
                image: "https://images.unsplash.com/photo-1539571696357-5a69c17a67c6?ixlib=rb-4.0.3&auto=format&fit=crop&w=400&q=80"
              },
              {
                name: "Sophia Patel",
                role: "Creative Director",
                bio: "Sophia's eye for color and trend forecasting helps ensure that Wollyway designs are both timeless and contemporary.",
                image: "https://images.unsplash.com/photo-1494790108377-be9c29b29330?ixlib=rb-4.0.3&auto=format&fit=crop&w=400&q=80"
              }
            ].map((member, index) => (
              <motion.div
                key={index}
                initial={{ opacity: 0, scale: 0.9 }}
                whileInView={{ opacity: 1, scale: 1 }}
                transition={{ duration: 0.5, delay: index * 0.1 }}
                viewport={{ once: true }}
                className="text-center"
              >
                <div className="mb-4 relative mx-auto w-48 h-48 overflow-hidden rounded-full">
                  <img
                    src={member.image}
                    alt={member.name}
                    className="w-full h-full object-cover"
                  />
                </div>
                <h3 className="text-xl font-semibold">{member.name}</h3>
                <p className="text-wolly-magenta mb-3">{member.role}</p>
                <p className="text-muted-foreground">{member.bio}</p>
              </motion.div>
            ))}
          </div>
        </div>
      </div>
      
      <Footer />
    </div>
  );
};

export default About;
