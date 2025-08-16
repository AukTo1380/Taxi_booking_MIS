import React from "react";
import { Link } from "react-router-dom";

const CookiePolicyPage = () => {
  return (
    <div className="max-w-4xl mx-auto px-4 py-16">
      <h1 className="text-4xl font-bold text-gray-800 mb-6">Cookie Policy</h1>
      <div className="prose lg:prose-lg">
        <p>
          This is the cookie policy for our website. Here, you would explain in
          detail what cookies are, why you use them, and what types of cookies
          you use (e.g., necessary, analytics, marketing).
        </p>

        <h2 className="mt-8">What Are Cookies?</h2>
        <p>
          As is common practice with almost all professional websites, this site
          uses cookies, which are tiny files that are downloaded to your
          computer, to improve your experience. This page describes what
          information they gather, how we use it and why we sometimes need to
          store these cookies.
        </p>

        <h2 className="mt-8">How We Use Cookies</h2>
        <p>
          We use cookies for a variety of reasons detailed below. Unfortunately,
          in most cases, there are no industry standard options for disabling
          cookies without completely disabling the functionality and features
          they add to this site.
        </p>

        <h2 className="mt-8">Managing Your Preferences</h2>
        <p>
          This is where you would ideally provide users with granular controls
          to opt-in or out of specific cookie categories (e.g., Analytics
          Cookies, Marketing Cookies). For now, this page serves as an
          informational resource.
        </p>

        <div className="mt-12 text-center">
          <Link
            to="/"
            className="inline-block bg-indigo-600 text-white px-6 py-3 rounded-md hover:bg-indigo-700 transition-colors"
          >
            Back to Home
          </Link>
        </div>
      </div>
    </div>
  );
};

export default CookiePolicyPage;
