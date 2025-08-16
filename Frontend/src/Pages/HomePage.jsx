import React, { useState, useEffect, useRef } from "react";
import { Link, useNavigate } from "react-router-dom";

import { motion, AnimatePresence } from "framer-motion";
import WhyChooseUs from "../Components/WhyChooseUs";
import Services from "../Components/services";
import HowToGetStarted from "../Components/HowToGetStarted";

const HomePage = (props) => {
  const [currentSlide, setCurrentSlide] = useState(0);
  const [animationComplete, setAnimationComplete] = useState(false);
  const timeoutRef = useRef(null);
  const navigate = useNavigate();
  const productListRef = useRef(null);

  useEffect(() => {
    if (props.searchQuery && productListRef.current) {
      const headerOffset = 80; // Adjust this value to match your sticky header's height
      const elementPosition =
        productListRef.current.getBoundingClientRect().top;
      const offsetPosition =
        elementPosition + window.pageYOffset - headerOffset;

      window.scrollTo({
        top: offsetPosition,
        behavior: "smooth",
      });
    }
  }, [props.searchQuery]); // This effect will only run when the `searchQuery` prop changes.

  const slides = [
    {
      id: 1,
      image:
        "https://images.unsplash.com/photo-1523381294911-8d3cead13475?ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D&auto=format&fit=crop&w=2070&q=80",
      overlay: "linear-gradient(to bottom, rgba(0,0,0,0.2), rgba(0,0,0,0.6))",
    },
    {
      id: 2,
      image:
        "https://images.unsplash.com/photo-1489987707025-afc232f7ea0f?ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D&auto=format&fit=crop&w=2070&q=80",
      overlay: "linear-gradient(to bottom, rgba(0,0,0,0.1), rgba(0,0,0,0.7))",
    },
    {
      id: 3,
      image:
        "https://images.unsplash.com/photo-1551232864-3f0890e580d9?ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D&auto=format&fit=crop&w=1887&q=80",
      overlay: "linear-gradient(to bottom, rgba(0,0,0,0.3), rgba(0,0,0,0.5))",
    },
  ];

  const resetTimeout = () => {
    if (timeoutRef.current) {
      clearTimeout(timeoutRef.current);
    }
  };

  useEffect(() => {
    resetTimeout();
    timeoutRef.current = setTimeout(() => {
      setCurrentSlide((prev) => (prev + 1) % slides.length);
    }, 5000);

    return () => {
      resetTimeout();
    };
  }, [currentSlide, slides.length]);

  useEffect(() => {
    const timer = setTimeout(() => setAnimationComplete(true), 3000);
    return () => clearTimeout(timer);
  }, []);

  return (
    <div className="relative">
      <div className="relative h-[600px] w-full bg-[#B8D5B7] text-white py-16 px-6 md:px-12">
        <div className="max-w-[95%] mx-auto grid grid-cols-1 pt-12 md:grid-cols-3 items-center gap-10">
          {/* Left Section - Image */}
          <motion.div
            initial={{ opacity: 0, x: 50 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.8, ease: "easeOut" }}
            className="flex justify-center col-span-2"
          >
            <img
              src="corrolla.png"
              alt="موتر کرایه"
              className=" max-h-[550px] min-h-max object-cover"
            />
          </motion.div>
          {/* Right Section - Text */}
          <motion.div
            initial={{ opacity: 0, y: 50 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8, ease: "easeOut" }}
            className="space-y-6 col-span-1 pt-16"
          >
            <h1 className="text-4xl md:text-6xl tracking-tighter font-Ray_black text-black">
              سفر سریع , راحت و امن
            </h1>
            <p className="text-black text-xl ">
              با ما تجربه متفاوت از سفر شهری داشته باشید.
            </p>

            <motion.p
              href="#booking"
              onClick={() => navigate("/city")}
              // whileHover={{ scale: 1.05 }}
              // whileTap={{ scale: 0.95 }}
              className="inline-block px-8 py-4 bg-primary text-white font-semibold rounded-md text-lg shadow-lg hover:bg-primary/50 transition-all duration-300"
            >
              همین حالا ثبت نام کنید
            </motion.p>
          </motion.div>
        </div>
      </div>
      <WhyChooseUs />
      <Services />
      <HowToGetStarted />
      {/* 
        ========================================================================
        THE FIX: Step 3 - Attach the ref to the container of the ProductListPage.
        ========================================================================
      */}
      {/* <div id="product-grid" ref={productListRef}>
        <ProductListPage {...props} />
      </div> */}
    </div>
  );
};

export default HomePage;
