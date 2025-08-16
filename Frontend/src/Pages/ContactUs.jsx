import React, { useState } from "react";
import { motion } from "framer-motion";
import { useInView } from "react-intersection-observer";
import { MapPin, Mail, Phone, Clock } from "lucide-react";
import FAQSection from "../Components/FAQSection";
import axios from "axios"; // Import axios


const ContactUs = () => {
  const [formData, setFormData] = useState({
    name: "",
    email: "",
    message: "",
  });
  const [formStatus, setFormStatus] = useState(null); // To display success/error messages
  const [loading, setLoading] = useState(false); // To handle button loading state

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
    triggerOnce: true,
    threshold: 0.5,
  });

  const [paragraphRef, paragraphInView] = useInView({
    triggerOnce: true,
    threshold: 0.3,
  });

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setFormStatus(null);
    setLoading(true);
    const apiUrl = `${
      import.meta.env.VITE_BASE_URL
    }/api/v1/notification/contacts/`;

    try {
      const response = await axios.post(apiUrl, formData);
      console.log("Form submitted successfully:", response.data);
      setFormStatus({
        type: "success",
        message: "Your message has been sent successfully!",
      });
      setFormData({ name: "", email: "", message: "" });
    } catch (error) {
      console.error("Error submitting form:", error);
      let errorMessage = "An error occurred. Please try again later.";
      if (error.response && error.response.data && error.response.data.email) {
        errorMessage = `Error: ${error.response.data.email[0]}`;
      }
      setFormStatus({
        type: "error",
        message: errorMessage,
      });
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className=" min-h-screen">
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
            با ما در تماس شوید
          </motion.h1>

          <motion.p
            ref={paragraphRef}
            initial="hidden"
            animate={paragraphInView ? "visible" : "hidden"}
            variants={textVariants}
            transition={{ delay: 0.2 }}
            className="text-xl md:text-2xl max-w-2xl mx-auto"
          >
            ما اینجا هستیم تا به شما کمک کنیم! برای هر نوع سوال یا درخواست کرایه
            موتر، با تیم ما در تماس شوید.
          </motion.p>
        </div>
      </section>

      {/* Main Content */}
      <div className="container max-w-[] bg-gradient-to-b from-secondary/30  mx-auto px-6 py-16">
        <div className=" max-w-7xl mx-auto gap-12">
          {/* Contact Information */}
          <div className=" to-white py-12" dir="rtl">
            <h2 className="text-3xl font-Ray_black text-center text-indigo-900 mb-12">
              با ما در <span className="text-primary">تماس شوید</span>
            </h2>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-8 max-w-6xl mx-auto px-6">
              {/* آدرس */}
              <div className="bg-white shadow-lg rounded-2xl p-6 text-center hover:shadow-2xl transition-all duration-300 border border-indigo-100">
                <div className="flex items-center justify-center w-16 h-16 mx-auto bg-primary/20 rounded-full mb-4">
                  <MapPin className="text-indigo-600" size={30} />
                </div>
                <h3 className="font-semibold text-xl text-gray-900 mb-2">
                  آدرس ما
                </h3>
                <p className="text-gray-600 leading-relaxed">
                  سرک دارالامان، ناحیه ۶، کابل، افغانستان
                  <br />
                  نزدیک به چهارراهی کارته سه
                </p>
              </div>

              {/* ایمیل */}
              <div className="bg-white shadow-lg rounded-2xl p-6 text-center hover:shadow-2xl transition-all duration-300 border border-indigo-100">
                <div className="flex items-center justify-center w-16 h-16 mx-auto bg-primary/20  rounded-full mb-4">
                  <Mail className="text-indigo-600" size={30} />
                </div>
                <h3 className="font-semibold text-xl text-gray-900 mb-2">
                  ایمیل ما
                </h3>
                <p className="text-gray-600 leading-relaxed">
                  <a
                    href="mailto:info@youride.com"
                    className="hover:text-indigo-600 transition-colors"
                  >
                    info@youride.com
                  </a>
                  <br />
                  <a
                    href="mailto:support@youride.com"
                    className="hover:text-indigo-600 transition-colors"
                  >
                    support@youride.com
                  </a>
                </p>
              </div>

              {/* شماره تماس */}
              <div className="bg-white shadow-lg rounded-2xl p-6 text-center hover:shadow-2xl transition-all duration-300 border border-indigo-100">
                <div className="flex items-center justify-center w-16 h-16 mx-auto bg-primary/20  rounded-full mb-4">
                  <Phone className="text-indigo-600" size={30} />
                </div>
                <h3 className="font-semibold text-xl text-gray-900 mb-2">
                  شماره تماس
                </h3>
                <p className="text-gray-600 flex flex-col leading-relaxed">
                  <a
                    href="tel:+93772387935"
                    className="hover:text-indigo-600 transition-colors"
                  >
                    +93 772 387 935
                  </a>
                  <a
                    href="tel:+93772387935"
                    className="hover:text-indigo-600 transition-colors"
                  >
                    +93 772 387 935
                  </a>
                  <br />
                </p>
              </div>
            </div>
          </div>

          {/* Contact Form */}

          <div className="grid grid-cols-1 md:grid-cols-2 gap-8 mt-12">
            <div className="col-span-1 md:px-20" dir="rtl">
              <h2 className="text-2xl font-bold text-indigo-900 mb-8">
                برای ما پیام بفرستید
              </h2>
              <form onSubmit={handleSubmit} className="space-y-6">
                <div className="grid grid-cols-1 gap-6">
                  <div className="space-y-6">
                    {/* Full Name Input */}
                    <div className="relative">
                      <input
                        type="text"
                        id="name"
                        name="name"
                        value={formData.name}
                        onChange={handleChange}
                        className="peer w-full px-4 py-3 border border-black rounded-lg bg-white focus:outline-none focus:bg-white placeholder-transparent text-right"
                        placeholder="نام کامل"
                        required
                      />
                      <label
                        htmlFor="name"
                        className={`absolute right-4 bg-white px-1 transition-all duration-200 pointer-events-none
              ${
                formData.name
                  ? "-top-2 text-xs text-black"
                  : "top-1/2 -translate-y-1/2 text-gray-400 peer-focus:-top-2 peer-focus:translate-y-0 peer-focus:text-xs peer-focus:text-black"
              }`}
                      >
                        نام کامل شما
                      </label>
                    </div>

                    {/* Email Input */}
                    <div className="relative">
                      <input
                        type="email"
                        id="email"
                        name="email"
                        value={formData.email}
                        onChange={handleChange}
                        className="peer w-full px-4 py-3 border border-black rounded-lg bg-white focus:outline-none focus:bg-white placeholder-transparent text-right"
                        placeholder="ایمیل"
                        required
                      />
                      <label
                        htmlFor="email"
                        className={`absolute right-4 bg-white px-1 transition-all duration-200 pointer-events-none
              ${
                formData.email
                  ? "-top-2 text-xs text-black"
                  : "top-1/2 -translate-y-1/2 text-gray-400 peer-focus:-top-2 peer-focus:translate-y-0 peer-focus:text-xs peer-focus:text-black"
              }`}
                      >
                        ایمیل شما
                      </label>
                    </div>
                  </div>
                </div>

                {/* Message Input */}
                <div className="relative mt-6">
                  <textarea
                    id="message"
                    name="message"
                    rows="5"
                    value={formData.message}
                    onChange={handleChange}
                    placeholder="پیام شما"
                    className="peer w-full px-4 pt-6 pb-2 border border-black rounded-lg focus:outline-none placeholder-transparent resize-none text-right"
                    required
                  />
                  <label
                    htmlFor="message"
                    className={`absolute right-4 bg-white px-1 transition-all duration-200 pointer-events-none
          ${
            formData.message
              ? "-top-2 text-xs text-black"
              : "top-4 text-gray-400 peer-focus:-top-2 peer-focus:text-xs peer-focus:text-black"
          }`}
                  >
                    پیام شما
                  </label>
                </div>

                {formStatus && (
                  <div
                    className={`p-4 rounded-md ${
                      formStatus.type === "success"
                        ? "bg-green-100 text-green-800"
                        : "bg-red-100 text-red-800"
                    }`}
                  >
                    {formStatus.message}
                  </div>
                )}

                {/* Submit Button */}
                <div className="flex justify-center items-center">
                  <button className="px-8 py-3 rounded-lg w-full bg-primary text-white font-semibold hover:bg-primary/50 transition-colors duration-300">
                    ارسال پیام
                  </button>
                </div>
              </form>
            </div>

            <div className="col-span-1 flex items-center  p-8">
              <FAQSection />
            </div>
          </div>
        </div>

        {/* FAQ Section */}
      </div>
      <section className="py-12 bg-white" dir="rtl">
        <div className="container mx-auto px-6">
          <h2 className="text-2xl font-Ray_black text-center mb-6">
            موقعیت <span className="text-primary"> دفتر ما</span>
          </h2>

          <p className="text-center text-lg text-gray-600 mb-8">
            برای دیدن و بازدید، می‌توانید به دفتر ما در کابل تشریف بیاورید.
          </p>
          <div className="w-full h-[400px] rounded-lg overflow-hidden shadow-lg">
            <iframe
              title="Office Location"
              src="https://www.google.com/maps/embed?pb=!1m18!1m12!1m3!1d48555.70331217291!2d69.0837781!3d34.5327786!2m3!1f0!2f0!3f0!3m2!1i1024!2i768!4f13.1!3m3!1m2!1s0x38f5bdfbaaaab6f5%3A0xbbb1a2fb8bcbac2!2sKabul!5e0!3m2!1sen!2saf!4v1691652973524!5m2!1sen!2saf"
              width="100%"
              height="100%"
              style={{ border: 0 }}
              allowFullScreen=""
              loading="lazy"
              referrerPolicy="no-referrer-when-downgrade"
            ></iframe>
          </div>
        </div>
      </section>
    </div>
  );
};

export default ContactUs;
