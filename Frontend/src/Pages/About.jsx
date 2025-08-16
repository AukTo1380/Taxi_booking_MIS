import React from "react";
import { motion } from "framer-motion";
import { useInView } from "react-intersection-observer";
import { ShieldCheck, Truck, CreditCard, Headphones } from "lucide-react";
import { FaPaypal } from "react-icons/fa";
import { IoReaderOutline } from "react-icons/io5";
import { MdOutlineEmail } from "react-icons/md";
import { FiPhone } from "react-icons/fi";
import { AiOutlineLike } from "react-icons/ai";
import { BiSolidTaxi } from "react-icons/bi";
import { TbUserStar } from "react-icons/tb";
import { TbUserHeart } from "react-icons/tb";

import { Link } from "react-router-dom";
import TestimonialCard from "../Components/TestimonialCard";

const About = () => {
  const textVariants = {
    hidden: { y: -50, opacity: 0 },
    visible: {
      y: 0,
      opacity: 1,
      transition: {
        duration: 0.6,
        ease: "easeOut",
      },
    },
  };

  // For scroll-triggered animations
  const [headingRef, headingInView] = useInView({
    triggerOnce: false, // Set to true if you only want animation once
    threshold: 0.5,
  });

  const [paragraphRef, paragraphInView] = useInView({
    triggerOnce: false,
    threshold: 0.3,
  });
  return (
    <div className=" min-h-screen ">
      {/* Hero Section */}
      <section className="relative bg-[url('contact.jpg')] bg-cover bg-center bg-no-repeat text-white py-20 h-[450px]">
        <div className="absolute inset-0 bg-black/70 z-0" />
        <div
          className="container mx-auto px-6 text-center relative z-10"
          dir="rtl"
        >
          <motion.h1
            ref={headingRef}
            initial="hidden"
            animate={headingInView ? "visible" : "hidden"}
            variants={textVariants}
            className="text-4xl md:text-5xl font-Ray_black mb-6"
          >
            درباره <span className="text-primary">ما</span>
          </motion.h1>

          <motion.p
            ref={paragraphRef}
            initial="hidden"
            animate={paragraphInView ? "visible" : "hidden"}
            variants={textVariants}
            transition={{ delay: 0.2 }}
            className="text-xl md:text-2xl max-w-2xl mx-auto"
          >
            شرکت ما با هدف ارائه خدمات کرایه موتر با کیفیت و مطمئن در افغانستان
            تأسیس شده است. ما متعهد به فراهم کردن تجربه‌ای آسان، امن و مقرون به
            صرفه برای همه مشتریان خود هستیم.
          </motion.p>
        </div>
      </section>

      {/* Main Content */}
      <div className="container max-w-[90%] mx-auto px-6 py-16">
        {/* Our Story */}
        <section className="mb-20" dir="rtl">
          <div className="flex flex-col lg:flex-row gap-12">
            <div className="lg:w-1/2">
              <div className="flex items-center gap-x-3 mb-5">
                <IoReaderOutline className="text-3xl text-primary" />
                <h2 className="text-3xl font-bold text-primary">داستان ما</h2>
              </div>

              <p className="text-gray-700 mb-4 text-lg text-justify">
                شرکت ما در سال ۲۰۲۳ تأسیس شد و هدف آن ارائه خدمات کرایه موتر با
                کیفیت و قابل اعتماد برای مشتریان در سراسر افغانستان است.
              </p>

              <p className="text-gray-700 mb-4 text-lg text-justify">
                ما باور داریم که ارائه تجربه‌ای ایمن، راحت و مقرون به صرفه در
                زمینه کرایه موتر می‌تواند سفرهای روزمره و خاص شما را آسان‌تر
                کند.
              </p>

              <p className="text-gray-700 mb-8 text-lg text-justify">
                تیم ما متشکل از افراد متخصص و متعهد است که هر روز تلاش می‌کنند
                بهترین خدمات را به شما ارائه دهند.
              </p>

              {/* Contact Information */}
              <div className="border-t md:flex items-center space-y-4 md:space-y-0 justify-between border-gray-200 pt-4">
                <div className="flex items-center gap-3">
                  <MdOutlineEmail className="text-2xl text-primary" />
                  <a
                    href="mailto:info@youride.com"
                    className="text-gray-700 text-base md:text-xl hover:text-indigo-600 transition-colors"
                  >
                    info@youride.com
                  </a>
                </div>
                <div className="hidden md:block h-[1px] w-[250px] bg-gray-300"></div>
                <div className="flex items-center gap-3">
                  <FiPhone className="text-2xl text-primary" />
                  <a
                    href="tel:+93772387935"
                    className="text-gray-700 text-base md:text-xl hover:text-indigo-600 transition-colors"
                  >
                    +93 772 387 935
                  </a>
                </div>
              </div>
            </div>
            <div className="lg:w-1/2">
              <img
                src="about1.jpeg"
                alt="مسافران در حال سوار شدن به موتر"
                className="rounded-xl shadow-xl w-full h-auto object-cover"
              />
            </div>
          </div>
        </section>

        {/* Our Values */}
        <section className="mb-20 relative h-[250px]  bg-cover bg-center flex items-center px-10 bg-no-repeat bg-[url('page-intro.jpg')]">
          <div className="absolute inset-0 z-0 bg-primary/40"></div>
          <div className="grid grid-cols-4 justify-between gap-10">
            <div className="relative w-[270px]   grid grid-cols-2 gap-x-4">
              <div className="border w-14 h-[120px] border-white "></div>
              <div className="bg-white h-[80px] w-[80px] right-5 absolute top-5 flex justify-center items-center ">
                <AiOutlineLike className="text-primary text-5xl " />
              </div>
              <div className=" pt-5 text-white">
                <p className="text-5xl font-Ray_black">550</p>
                <p className="text-xl font-semibold">نظرات پنج ستاره</p>
              </div>
              <div></div>
            </div>
            <div className="relative w-[270px]   grid grid-cols-2 gap-x-4">
              <div className="border w-14 h-[120px] border-white "></div>
              <div className="bg-white h-[80px] w-[80px] right-5 absolute top-5 flex justify-center items-center ">
                <TbUserHeart className="text-primary text-5xl " />
              </div>
              <div className=" pt-5 text-white">
                <p className="text-5xl font-Ray_black">10</p>
                <p className="text-xl font-semibold"> راننده خوشحال </p>
              </div>
              <div></div>
            </div>
            <div className="relative w-[270px]   grid grid-cols-2 gap-x-4">
              <div className="border w-14 h-[120px] border-white "></div>
              <div className="bg-white h-[80px] w-[80px] right-5 absolute top-5 flex justify-center items-center ">
                <BiSolidTaxi className="text-primary text-5xl " />
              </div>
              <div className=" pt-5 text-white">
                <p className="text-5xl font-Ray_black">50</p>
                <p className="text-xl font-semibold"> کل موتر ها</p>
              </div>
              <div></div>
            </div>
            <div className="relative w-[280px]  grid grid-cols-2 gap-x-4">
              <div className="border w-14 h-[120px] border-white "></div>
              <div className="bg-white h-[80px] w-[80px] right-5 absolute top-5 flex justify-center items-center ">
                <TbUserStar className="text-primary text-5xl " />
              </div>
              <div className=" pt-5 text-white">
                <p className="text-5xl font-Ray_black">550</p>
                <p className="text-xl font-semibold">مشتریان خوشحال</p>
              </div>
              <div></div>
            </div>
          </div>
        </section>
      </div>
        <TestimonialCard />
    </div>
  );
};

export default About;
