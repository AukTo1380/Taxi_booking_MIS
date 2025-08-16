import React from "react";
import { Outlet } from "react-router-dom";

// Simple Header and Footer stubs
const Header = () => (
  <header className="bg-white shadow-sm">
    <nav className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 h-16 flex items-center justify-between">
      <div className="text-2xl font-bold text-gray-900">OnceAgain.</div>
      {/* Add nav links, search, user icon etc. here */}
    </nav>
  </header>
);

const Footer = () => (
  <footer className="bg-gray-100 border-t">
    <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 py-12">
      {/* Add footer content here */}
      <p className="text-center text-sm text-gray-500">
        © 2023 My E-commerce. All rights reserved.
      </p>
    </div>
  </footer>
);

const MainLayout = () => {
  return (
    <div className="min-h-screen bg-white flex flex-col">
      <Header />
      <main className="flex-grow">
        <Outlet /> {/* Child routes will render here */}
      </main>
      <Footer />
    </div>
  );
};

export default MainLayout;
