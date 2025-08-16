import React, { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Link } from "react-router-dom";
import { Cookie, Check, X } from "lucide-react";

const CookieConsentBanner = () => {
  const [isVisible, setIsVisible] = useState(false);

  // When the component mounts, check if the user has already made a choice.
  useEffect(() => {
    const consentChoice = localStorage.getItem("cookie_consent_choice");
    // If no choice has been made, show the banner.
    if (!consentChoice) {
      setIsVisible(true);
    }
  }, []);

  const handleConsent = (choice) => {
    // Store the user's choice in localStorage. This persists across sessions.
    localStorage.setItem("cookie_consent_choice", choice);
    // Hide the banner.
    setIsVisible(false);

    if (choice === "accepted") {
      // IMPORTANT: This is where you would initialize your analytics scripts.
      // For example, if you use Google Analytics, you would call your `gtag` function here.
      console.log(
        "Cookie consent accepted. Initializing analytics, marketing scripts, etc."
      );
      // Example: window.gtag('consent', 'update', { 'analytics_storage': 'granted' });
    } else {
      // If rejected, ensure any non-essential cookies are not set.
      console.log(
        "Cookie consent rejected. Non-essential scripts will not be loaded."
      );
    }
  };

  return (
    <AnimatePresence>
      {isVisible && (
        <motion.div
          initial={{ y: "100%" }}
          animate={{ y: 0 }}
          exit={{ y: "100%" }}
          transition={{ duration: 0.5, ease: "easeInOut" }}
          className="fixed bottom-0 left-0 right-0 bg-slate-800 text-white p-6 shadow-2xl z-50"
        >
          <div className="max-w-7xl mx-auto flex flex-col md:flex-row items-center justify-between gap-6">
            <div className="flex items-center gap-4">
              <Cookie className="h-10 w-10 text-yellow-400 flex-shrink-0" />
              <div>
                <h3 className="font-semibold text-lg">We Value Your Privacy</h3>
                <p className="text-sm text-slate-300">
                  We use cookies to enhance your browsing experience, serve
                  personalized ads or content, and analyze our traffic. By
                  clicking "Accept All", you consent to our use of cookies.
                </p>
              </div>
            </div>

            <div className="flex-shrink-0 flex items-center gap-4 w-full md:w-auto">
              <button
                onClick={() => handleConsent("rejected")}
                className="flex-1 md:flex-none flex items-center justify-center px-4 py-2 text-sm font-medium rounded-md bg-slate-700 hover:bg-slate-600 transition-colors"
              >
                <X className="h-4 w-4 mr-2" />
                Reject
              </button>
              <button
                onClick={() => handleConsent("accepted")}
                className="flex-1 md:flex-none flex items-center justify-center px-4 py-2 text-sm font-medium rounded-md bg-indigo-600 hover:bg-indigo-700 transition-colors"
              >
                <Check className="h-4 w-4 mr-2" />
                Accept All
              </button>
            </div>
          </div>
          <div className="text-center mt-4 md:mt-2">
            <Link
              to="/cookie-policy"
              className="text-xs text-slate-400 hover:text-white underline"
            >
              Customize / Read Our Cookie Policy
            </Link>
          </div>
        </motion.div>
      )}
    </AnimatePresence>
  );
};

export default CookieConsentBanner;
