import React from "react";
import { Link } from "react-router-dom";
import { PATHS, AUTH_MODES, APP_NAME } from "../constants";
import Button from "./common/Button";
import { LogoIcon } from "./icons/LogoIcon";

const LandingPage: React.FC = () => {
  return (
    <div className="min-h-screen bg-gradient-to-br from-primary-light via-blue-300 to-sky-200 flex flex-col items-center justify-center p-6 text-center">
      <header className="mb-12 animate-slideInLeft">
        <LogoIcon className="h-16 w-auto text-primary-dark mx-auto mb-4 animate-bounce-slow" />
        <h1 className="text-5xl font-bold text-darktext mb-4">
          Welcome to <span className="text-primary-dark">{APP_NAME}</span>
        </h1>
        <p className="text-xl text-mediumtext max-w-2xl mx-auto">
          Empowering you with knowledge about the Indian legal and judiciary
          system. Learn, ask, and understand your rights and responsibilities.
        </p>
      </header>

      <main className="bg-white/90 backdrop-blur-sm p-8 sm:p-12 rounded-xl shadow-2xl max-w-md w-full animate-slideInRight hover-lift">
        <h2 className="text-2xl font-semibold text-darktext mb-6">
          Get Started
        </h2>
        <p className="text-mediumtext mb-8">
          Join our community to access learning resources, an AI legal chatbot,
          and document guidance.
        </p>
        <div className="space-y-4">
          <Link to={PATHS.SIGNUP} className="block">
            <Button variant="primary" size="lg" className="w-full">
              Sign Up
            </Button>
          </Link>
          <Link to={PATHS.LOGIN} className="block">
            <Button
              variant="ghost"
              size="lg"
              className="w-full text-primary-dark border border-primary-dark hover:bg-primary-light hover:text-white"
            >
              Log In
            </Button>
          </Link>
        </div>
      </main>

      <footer
        className="mt-16 text-sm text-darktext opacity-75 animate-fadeIn"
        style={{ animationDelay: "0.5s" }}
      >
        <p>
          &copy; {new Date().getFullYear()} {APP_NAME}. All rights reserved.
        </p>
        <p>Your guide to understanding Indian law.</p>
      </footer>
    </div>
  );
};

export default LandingPage;
