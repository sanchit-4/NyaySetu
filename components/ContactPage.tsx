import React from "react";
import { InformationCircleIcon } from "./icons/InformationCircleIcon"; // Placeholder
import { LogoIcon } from "./icons/LogoIcon";
import { APP_NAME } from "../constants";
import { MdContactPage } from "react-icons/md";

const ContactPage: React.FC = () => {
  return (
    <div className="animate-fadeIn p-6 sm:p-8 bg-white/90 backdrop-blur-sm rounded-lg shadow-xl">
      <header className="mb-8 text-center border-b pb-6 animate-slideInLeft">
        <LogoIcon className="w-24 h-24 mx-auto mb-4 text-primary animate-bounce-slow" />
        <h1 className="text-4xl font-extrabold text-primary-dark">
          About {APP_NAME}
        </h1>
        <p className="mt-3 text-lg text-mediumtext">
          Empowering Citizens with Legal Knowledge.
        </p>
      </header>

      <div
        className="prose prose-lg max-w-none text-darktext animate-slideInRight"
        style={{ animationDelay: "0.2s" }}
      >
        <p>
          Welcome to {APP_NAME}, your dedicated companion in navigating the
          complexities of the Indian legal and judiciary system. Our mission is
          to make legal information accessible, understandable, and actionable
          for everyone. We believe that knowledge of the law is a fundamental
          right and a cornerstone of a just society.
        </p>

        <h2 className="text-2xl font-semibold text-primary-dark mt-8 mb-3">
          Our Vision
        </h2>
        <p>
          To create an informed citizenry where every individual is aware of
          their rights and responsibilities under Indian law. We aim to bridge
          the gap between complex legal jargon and the common person, fostering
          a culture of legal literacy and empowerment.
        </p>

        <h2 className="text-2xl font-semibold text-primary-dark mt-8 mb-3">
          What We Offer
        </h2>
        <ul className="list-disc space-y-2 pl-5">
          <li>
            <strong>Comprehensive Learning Modules:</strong> Dive into curated
            lessons covering various aspects of Indian law, from foundational
            principles to specific legal areas.
          </li>
          <li>
            <strong>AI-Powered Legal Assistant:</strong> Get answers to your
            legal queries about Indian law from our intelligent chatbot,
            designed to provide information and guidance.
          </li>
          <li>
            <strong>Document Resources:</strong> (Coming Soon) Access templates
            and information related to important legal documents.
          </li>
          <li>
            <strong>Interactive Quizzes:</strong> Test your understanding and
            reinforce your learning with our engaging quizzes.
          </li>
        </ul>

        <h2 className="text-2xl font-semibold text-primary-dark mt-8 mb-3">
          Our Commitment
        </h2>
        <p>
          {APP_NAME} is committed to providing accurate and up-to-date
          information. However, please remember that the content provided on
          this platform is for educational and informational purposes only and
          does not constitute legal advice. For specific legal issues, we always
          recommend consulting with a qualified legal professional in India.
        </p>
        <p>
          We are continuously working to improve and expand our offerings. Your
          feedback is invaluable to us as we strive to make {APP_NAME} the most
          trusted resource for learning about Indian law.
        </p>
      </div>

      <div
        className="mt-12 p-6 bg-gradient-to-r from-primary-light to-primary rounded-lg text-white text-center shadow-lg animate-slideInRight hover-lift"
        style={{ animationDelay: "0.4s" }}
      >
        <InformationCircleIcon className="w-12 h-12 mx-auto mb-3 opacity-80" />
        <h3 className="text-2xl font-semibold">Join Us on Our Mission!</h3>
        <p className="mt-2 opacity-90">
          Explore, learn, and empower yourself. Together, let's build a more
          legally aware India.
        </p>
      </div>
    </div>
  );
};

export default ContactPage;
