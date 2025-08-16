import React, { useState, useRef, useEffect } from "react";
import { Routes, Route, useLocation } from "react-router-dom";
import { Toaster, toast } from "react-hot-toast";
import Header from "./Components/Header";
import Footer from "./Components/Footer";
import HomePage from "./Pages/HomePage";
import PrivateRoute from "./Components/common/PrivateRoute";
import Signin from "./features/authentication/components/Signin";
import SignUp from "./features/authentication/components/Signup";
import DashboardPage from "./Components/dashboard/DashboardPage";
import ContactUs from "./Pages/ContactUs";
import About from "./Pages/About";
import CookiePolicyPage from "./Pages/CookiePolicyPage";
import CookieConsentBanner from "./Components/CookieConsentBanner";
import AuthContainer from "./features/authentication/components/AuthContainer";
import ForgotPassword from "./Pages/ForgotPassword";
import CreateNewPassword from "./Pages/CreatePassword";
import City from "./Pages/City";
import NotFound from "./Pages/NotFound";
import BecomeADriverPage from "./Pages/BecomeADriver";

function App() {
  const [wishlist, setWishlist] = useState([]);
  // THE SEARCH STATE IS MANAGED HERE AT THE TOP LEVEL
  const [searchQuery, setSearchQuery] = useState("");
  const [quickViewProduct, setQuickViewProduct] = useState(null);
  const [isCartOpen, setIsCartOpen] = useState(false);
  const [animationData, setAnimationData] = useState(null);
  const cartRef = useRef(null);
  const location = useLocation();

  useEffect(() => {
    // Only clear search query when navigating away from the homepage
    if (location.pathname !== "/") {
      setSearchQuery("");
    }
    setQuickViewProduct(null);
    setIsCartOpen(false);
  }, [location.pathname]);

 
  const hideLayout = location.pathname.startsWith("/dashboard");

  return (
    <div className="flex flex-col min-h-screen bg-white">
      <Toaster
        position="bottom-center"
        toastOptions={{
          success: { style: { background: "#333", color: "#fff" } },
          error: { style: { background: "#D22B2B", color: "#fff" } },
        }}
      />
      
    

      {!hideLayout && (
        <Header
          // wishlistCount={wishlist.length}
          // PASS THE SEARCH STATE AND SETTER DOWN TO THE HEADER
          searchQuery={searchQuery}
          setSearchQuery={setSearchQuery}
          onCartClick={() => setIsCartOpen(true)}
          cartRef={cartRef}
        />
      )}

      <main className="flex-grow">
        <Routes>
          <Route
            path="/"
            element={
              // PASS THE SEARCH QUERY DOWN TO THE HOMEPAGE/PRODUCT LIST
              <HomePage
              />
            }
          />
         
          <Route path="/contact" element={<ContactUs />} />
          <Route path="/about" element={<About />} />
          <Route path="/become-a-driver" element={<BecomeADriverPage />} />
          {/* <Route path="/cart" element={<CartPage />} /> */}
          <Route path="/city" element={<City />} />
         
          <Route path="/cookie-policy" element={<CookiePolicyPage />} />
          <Route element={<PrivateRoute />}>
            <Route path="/dashboard/*" element={<DashboardPage />} />
           
          </Route>

          <Route path="/sign-in" element={<Signin />} />
          <Route path="/sign-up" element={<SignUp />} />

          <Route path="/logee" element={<AuthContainer />} />
          <Route path="/forgot-password" element={<ForgotPassword />} />
          <Route path="/create-new-password" element={<CreateNewPassword />} />
          <Route path="*" element={<NotFound />} />
        </Routes>
      </main>

      {!hideLayout && <Footer />}
      <CookieConsentBanner />
    </div>
  );
}

export default App;
