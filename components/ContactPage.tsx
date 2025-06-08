import React, { useState } from "react";
import { PhoneIcon, EnvelopeIcon, InformationCircleIcon } from "./icons";
import Button from "./common/Button";
import Input from "./common/Input";
import { APP_NAME } from "../constants";

const ContactPage: React.FC = () => {
  const [formData, setFormData] = useState({
    name: "",
    email: "",
    subject: "",
    message: "",
  });
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [submitMessage, setSubmitMessage] = useState<string | null>(null);

  const handleChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>
  ) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);
    setSubmitMessage(null);
    // Simulate API call
    await new Promise((resolve) => setTimeout(resolve, 1500));
    setIsSubmitting(false);
    setSubmitMessage(
      "Thank you for your message! We will get back to you soon."
    );
    setFormData({ name: "", email: "", subject: "", message: "" });
  };

  return (
    <div className="animate-fadeIn p-6 sm:p-8 bg-white/90 backdrop-blur-sm rounded-lg shadow-xl">
      <header className="mb-10 text-center border-b pb-6 animate-slideInLeft">
        <PhoneIcon className="w-16 h-16 mx-auto mb-4 text-primary animate-bounce-slow" />
        <h1 className="text-4xl font-extrabold text-primary-dark">
          Get In Touch
        </h1>
        <p className="mt-3 text-lg text-mediumtext">
          We'd love to hear from you! Whether you have a question, feedback, or
          a suggestion, please feel free to reach out.
        </p>
      </header>

      <div className="grid md:grid-cols-2 gap-12">
        {/* Contact Form */}
        <div
          className="bg-lightbg/90 backdrop-blur-sm p-6 sm:p-8 rounded-lg shadow-md animate-slideInLeft hover-lift"
          style={{ animationDelay: "0.2s" }}
        >
          <h2 className="text-2xl font-semibold text-darktext mb-6">
            Send Us a Message
          </h2>
          {submitMessage && (
            <div className="mb-4 p-3 rounded-md bg-green-100 text-green-700 text-sm">
              {submitMessage}
            </div>
          )}
          <form onSubmit={handleSubmit} className="space-y-5">
            <Input
              label="Full Name"
              name="name"
              type="text"
              value={formData.name}
              onChange={handleChange}
              required
              placeholder="Your Name"
            />
            <Input
              label="Email Address"
              name="email"
              type="email"
              value={formData.email}
              onChange={handleChange}
              required
              placeholder="your.email@example.com"
            />
            <Input
              label="Subject"
              name="subject"
              type="text"
              value={formData.subject}
              onChange={handleChange}
              required
              placeholder="Regarding..."
            />
            <div>
              <label
                htmlFor="message"
                className="block text-sm font-medium text-darktext mb-1"
              >
                Message
              </label>
              <textarea
                id="message"
                name="message"
                rows={4}
                value={formData.message}
                onChange={handleChange}
                required
                placeholder="Your message here..."
                className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:ring-primary focus:border-primary sm:text-sm text-darktext placeholder-gray-400"
              />
            </div>
            <Button
              type="submit"
              variant="primary"
              className="w-full sm:w-auto"
              isLoading={isSubmitting}
            >
              {isSubmitting ? "Sending..." : "Send Message"}
            </Button>
          </form>
        </div>

        {/* Contact Information */}
        <div
          className="space-y-8 animate-slideInRight"
          style={{ animationDelay: "0.4s" }}
        >
          <div>
            <h3 className="text-xl font-semibold text-darktext mb-3 flex items-center">
              <EnvelopeIcon className="w-6 h-6 mr-2 text-secondary" />
              Email Us
            </h3>
            <p className="text-mediumtext">
              For general inquiries, feedback, or support, please email us at:
            </p>
            <a
              href="mailto:sanchitgoyal2803@gmail.com"
              className="text-primary hover:text-primary-dark font-medium text-lg"
            >
              sanchitgoyal2803@gmail.com
            </a>
            <p className="text-xs text-gray-500 mt-1">
              (Please note: This is a placeholder email address.)
            </p>
          </div>

          <div>
            <h3 className="text-xl font-semibold text-darktext mb-3 flex items-center">
              <InformationCircleIcon className="w-6 h-6 mr-2 text-secondary" />{" "}
              {/* Reusing icon */}
              Important Note
            </h3>
            <p className="text-mediumtext bg-amber-50 p-4 rounded-md border border-amber-200">
              {APP_NAME} provides legal information for educational purposes
              only and does not offer legal advice. For specific legal problems,
              please consult a qualified lawyer in India. We cannot respond to
              requests for legal advice through this contact form or email.
            </p>
          </div>

          <div className="mt-8">
            <iframe
              src="https://www.google.com/maps/embed?pb=!1m18!1m12!1m3!1d3887.970007875086!2d77.5925830147985!3d12.97375639085428!2m3!1f0!2f0!3f0!3m2!1i1024!2i768!4f13.1!3m3!1m2!1s0x3bae1670c97805a9%3A0x8009769354593924!2sVidhana%20Soudha!5e0!3m2!1sen!2sin!4v1678886095907!5m2!1sen!2sin"
              width="100%"
              height="250"
              style={{ border: 0 }}
              allowFullScreen={false}
              loading="lazy"
              referrerPolicy="no-referrer-when-downgrade"
              title="Placeholder Map Location"
              className="rounded-lg shadow-md"
            ></iframe>
            <p className="text-xs text-gray-500 mt-1 text-center">
              (Map shows a generic landmark for illustrative purposes.)
            </p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ContactPage;
