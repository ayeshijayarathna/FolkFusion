import React, { useState } from 'react';
import { Shield, Lock, Eye, Database, Users, Mail, Heart, Sparkles, Award, ChevronDown, ChevronUp } from 'lucide-react';

const PrivacyPolicy = () => {
  const [openSection, setOpenSection] = useState(null);
  const lastUpdated = "February 13, 2026";

  const sections = [
    {
      icon: Sparkles,
      title: "Introduction",
      headerBg: "bg-[#A67C52]",
      openBg: "bg-[#A67C52]/10",
      border: "border-[#A67C52]",
      iconBg: "bg-[#A67C52]",
      titleColor: "text-[#A67C52]",
      chevronColor: "text-[#A67C52]",
      dotColor: "bg-[#A67C52]",
      highlightBg: "bg-[#A67C52]/10",
      highlightBorder: "border-l-[#A67C52]",
      content: "FolkFusion is a web platform developed to preserve and promote Sri Lanka's traditional folk art industries, operated under the Traditional Industry Development Departments of Sri Lanka's nine Provincial Councils. This Privacy Policy explains how we collect, use, and protect your information when you use FolkFusion.",
      highlight: "We are committed to protecting the privacy of all users — including provincial administrators, registered folk artists, and the general public."
    },
    {
      icon: Database,
      title: "Information We Collect",
      headerBg: "bg-[#8DAA91]",
      openBg: "bg-[#8DAA91]/10",
      border: "border-[#8DAA91]",
      iconBg: "bg-[#8DAA91]",
      titleColor: "text-[#8DAA91]",
      chevronColor: "text-[#8DAA91]",
      dotColor: "bg-[#8DAA91]",
      highlightBg: "bg-[#8DAA91]/10",
      highlightBorder: "border-l-[#8DAA91]",
      content: "We collect the following information depending on how you interact with FolkFusion:",
      list: [
        "Public Users: No registration required. No personal data is collected unless you choose to make a donation.",
        "Donation Data: Optional name (or anonymous), email, and payment details processed securely through Stripe.",
        "Artist Profile Data: Full name, phone number, date of birth, gender, address (street, city, district, postal code), province, bio, profile photo, years of experience, specializations, certifications, and social media links — collected at registration by provincial admins.",
        "Artist Account Data: Email, hashed password, assigned role ('artist'), province, account status (active/approved), and timestamps — stored in User model.",
        "Admin Account Data: Full name, phone number, WhatsApp number, address, and profile photo — stored in Admin model.",
        "Artwork & Marketplace Data: Artwork images, descriptions, pricing, and sales data submitted by artists.",
        "Usage Data: Pages visited, features accessed, and general interaction patterns for platform improvement.",
        "Device & Technical Data: IP address, browser type, and operating system for security and analytics."
      ]
    },
    {
      icon: Eye,
      title: "How We Use Your Information",
      headerBg: "bg-[#5F8B8C]",
      openBg: "bg-[#5F8B8C]/10",
      border: "border-[#5F8B8C]",
      iconBg: "bg-[#5F8B8C]",
      titleColor: "text-[#5F8B8C]",
      chevronColor: "text-[#5F8B8C]",
      dotColor: "bg-[#5F8B8C]",
      highlightBg: "bg-[#5F8B8C]/10",
      highlightBorder: "border-l-[#5F8B8C]",
      content: "Your information is used strictly for platform operations and cultural preservation purposes:",
      list: [
        "Artist Management: Provincial admins use artist data to register, manage, and support folk artists within their province.",
        "Authentication: Email and password (bcrypt-hashed) are used solely for secure login via JWT tokens.",
        "Platform Features: Artist profiles, artwork listings, marketplace transactions, and order tracking.",
        "Donations: Processing anonymous or named donations through Stripe with transparent fee structures.",
        "Cultural Archive: Preserving records of traditional crafts and artisans for future generations.",
        "Communication: Sending platform-related notifications and updates to artists and admins.",
        "Security: Monitoring for unauthorized access, fraud prevention, and platform integrity."
      ]
    },
    {
      icon: Users,
      title: "Information Sharing",
      headerBg: "bg-[#C48A6A]",
      openBg: "bg-[#C48A6A]/10",
      border: "border-[#C48A6A]",
      iconBg: "bg-[#C48A6A]",
      titleColor: "text-[#C48A6A]",
      chevronColor: "text-[#C48A6A]",
      dotColor: "bg-[#C48A6A]",
      highlightBg: "bg-[#C48A6A]/10",
      highlightBorder: "border-l-[#C48A6A]",
      content: "We share your information only in specific, limited circumstances:",
      list: [
        "Provincial Admins: Each admin can only view and manage artists within their own assigned province — data is province-isolated by design.",
        "Public Profiles: Artist names, specializations, bio, profile photos, and artworks are publicly visible to promote folk art.",
        "Stripe: Payment and donation data is handled by Stripe's PCI-DSS compliant infrastructure. FolkFusion does not store card details.",
        "Cloudinary: Artist profile photos and artwork images are stored on Cloudinary's secure media platform.",
        "Legal Requirements: We may disclose information if required by Sri Lankan law or to protect users from harm.",
        "Cultural Research: Anonymized, aggregated data may be used for heritage preservation studies."
      ]
    },
    {
      icon: Lock,
      title: "Data Security",
      headerBg: "bg-[#A67C52]",
      openBg: "bg-[#A67C52]/10",
      border: "border-[#A67C52]",
      iconBg: "bg-[#A67C52]",
      titleColor: "text-[#A67C52]",
      chevronColor: "text-[#A67C52]",
      dotColor: "bg-[#A67C52]",
      highlightBg: "bg-[#A67C52]/10",
      highlightBorder: "border-l-[#A67C52]",
      content: "We take the following technical measures to protect your data:",
      list: [
        "Passwords: All passwords are hashed using bcrypt (12 salt rounds) — never stored in plain text.",
        "Authentication: JWT-based role access ensures artists and admins only access what they're permitted to.",
        "Provincial Isolation: Admin accounts are scoped to their province — cross-province data access is not permitted.",
        "Secure Payments: Stripe handles all payment processing. Card data never touches our servers.",
        "HTTPS: All data in transit is protected via SSL/TLS encryption.",
        "Database: MongoDB with authentication controls and access restrictions.",
        "Account Status: Only approved and active accounts can log in to the platform."
      ]
    },
    {
      icon: Shield,
      title: "Your Rights",
      headerBg: "bg-[#8DAA91]",
      openBg: "bg-[#8DAA91]/10",
      border: "border-[#8DAA91]",
      iconBg: "bg-[#8DAA91]",
      titleColor: "text-[#8DAA91]",
      chevronColor: "text-[#8DAA91]",
      dotColor: "bg-[#8DAA91]",
      highlightBg: "bg-[#8DAA91]/10",
      highlightBorder: "border-l-[#8DAA91]",
      content: "As a user of FolkFusion, you have the following rights over your data:",
      list: [
        "Access: Artists can view their profile and artwork data through their dashboard at any time.",
        "Correction: Artists can update their profile details, bio, and artwork information.",
        "Deletion: Artists may request account deletion — personal data will be removed within 30 days. Anonymized artwork records may be retained for cultural heritage purposes.",
        "Opt-Out: You may unsubscribe from platform notifications via your account settings.",
        "Data Portability: Request a copy of your personal data in a structured format.",
        "Contact for Rights: Reach us at privacy@folkfusion.lk for any data-related requests."
      ]
    },
    {
      icon: Heart,
      title: "Data Retention",
      headerBg: "bg-[#5F8B8C]",
      openBg: "bg-[#5F8B8C]/10",
      border: "border-[#5F8B8C]",
      iconBg: "bg-[#5F8B8C]",
      titleColor: "text-[#5F8B8C]",
      chevronColor: "text-[#5F8B8C]",
      dotColor: "bg-[#5F8B8C]",
      highlightBg: "bg-[#5F8B8C]/10",
      highlightBorder: "border-l-[#5F8B8C]",
      content: "We retain data based on necessity and legal obligation:",
      list: [
        "Active Accounts: Data is retained for as long as the account is active.",
        "Cultural Archive: Artwork records and craft descriptions may be preserved indefinitely for heritage purposes, with personal identifiers removed upon account deletion.",
        "Deletion Requests: Personal information is removed within 30 days of a valid deletion request.",
        "Legal Requirements: Certain data may be retained longer where required by Sri Lankan law."
      ]
    },
    {
      icon: Award,
      title: "Third-Party Services",
      headerBg: "bg-[#C48A6A]",
      openBg: "bg-[#C48A6A]/10",
      border: "border-[#C48A6A]",
      iconBg: "bg-[#C48A6A]",
      titleColor: "text-[#C48A6A]",
      chevronColor: "text-[#C48A6A]",
      dotColor: "bg-[#C48A6A]",
      highlightBg: "bg-[#C48A6A]/10",
      highlightBorder: "border-l-[#C48A6A]",
      content: "FolkFusion integrates with the following trusted third-party services:",
      list: [
        "Stripe: Secure payment processing for marketplace purchases and donations (card, bank transfer, cash on delivery supported).",
        "Cloudinary: Cloud-based image hosting for artist profile photos and artwork images.",
        "MongoDB: Database infrastructure for all platform data.",
        "Firebase: Mobile backend services for the FolkChat companion app."
      ],
      note: "Each of these services maintains its own privacy policy. We encourage you to review them for details on how they handle your data."
    }
  ];

  return (
    <div className="min-h-screen bg-[#FDF6EE] overflow-hidden">

      {/* Hero Section */}
      <section className="relative py-32 overflow-hidden">
        <div className="absolute inset-0 z-0">
          <img
            src="/images/prp.jpg"
            alt="Traditional Sri Lankan Folk Art"
            className="w-full h-full object-cover"
            onError={(e) => { e.target.style.display = 'none'; }}
          />
        </div>

        <div className="container mx-auto px-4 relative z-10">
          <div className="max-w-4xl mx-auto text-center">
            <div className="inline-flex items-center gap-2 border border-[#A67C52] bg-[#FDF6EE] text-[#A67C52] text-xs tracking-widest uppercase px-4 py-2 rounded-full mb-6">
              <Shield size={12} />
              FolkFusion · Privacy Policy
            </div>
            <h1 className="text-5xl md:text-7xl font-bold mb-6 leading-tight text-[#3D3530] font-[Cinzel_Decorative,serif]">
              Privacy Policy
            </h1>
            <p className="text-lg max-w-2xl mx-auto text-[#2E2828] font-[Libre_Baskerville,serif]">
              Protecting your information while preserving Sri Lanka's traditional craft heritage.
            </p>
            <p className="text-sm mt-2 text-[#C97B5A] font-[Libre_Baskerville,serif]">
              Last Updated: {lastUpdated}
            </p>
          </div>
        </div>
      </section>

      {/* Commitment Banner */}
      <section className="px-4 py-10">
        <div className="container mx-auto max-w-5xl">
          <div className="rounded-3xl p-10 md:p-12 shadow-lg mb-6 bg-muted-clay/15">
            <div className="flex flex-col md:flex-row items-start md:items-center gap-6">
              <div className="w-14 h-14 rounded-2xl flex items-center justify-center flex-shrink-0 bg-muted-clay/35">
                <Heart size={28} className="text-deep-brown" />
              </div>
              <div>
                <h2 className="text-2xl md:text-3xl font-bold mb-3 text-white font-[Cinzel_Decorative,serif]">
                  Our Commitment to You
                </h2>
                <p className="text-base md:text-lg leading-relaxed text-deep-brown font-[Libre_Baskerville,serif]">
                  FolkFusion is built to digitally empower Sri Lanka's traditional craft artists — employed under the Traditional Industry Development Departments of provincial councils. We collect only what's necessary to operate the platform and are committed to your privacy.
                </p>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Accordion Sections */}
      <section className="px-4 pb-20">
        <div className="container mx-auto max-w-5xl space-y-3">
          {sections.map((section, index) => {
            const IconComponent = section.icon;
            const isOpen = openSection === index;
            return (
              <div
                key={index}
                className={`rounded-2xl shadow-sm overflow-hidden transition-all duration-300 bg-white border-2 ${isOpen ? section.border : 'border-[#F4EDE4]'}`}
              >
                <button
                  className={`w-full flex items-center gap-4 p-5 text-left transition-all duration-200 ${isOpen ? section.openBg : 'bg-white'}`}
                  onClick={() => setOpenSection(isOpen ? null : index)}
                >
                  <div className={`w-11 h-11 rounded-xl flex items-center justify-center flex-shrink-0 ${section.iconBg}`}>
                    <IconComponent size={20} className="text-white" />
                  </div>
                  <div className="flex-1">
                    <h2 className={`text-lg font-bold font-[Cinzel_Decorative,serif] ${section.titleColor}`}>
                      {section.title}
                    </h2>
                  </div>
                  <div className={section.chevronColor}>
                    {isOpen ? <ChevronUp size={18} /> : <ChevronDown size={18} />}
                  </div>
                </button>

                {isOpen && (
                  <div className="px-5 pb-5">
                    <div className="pt-3 border-t border-[#F4EDE4]">
                      <p className="text-sm leading-relaxed mb-4 mt-3 text-[#2E2828] font-[Libre_Baskerville,serif]">
                        {section.content}
                      </p>

                      {section.highlight && (
                        <div className={`p-4 rounded-xl mb-4 border-l-4 ${section.highlightBg} ${section.highlightBorder}`}>
                          <p className="text-sm font-semibold italic text-[#3D3530] font-[Libre_Baskerville,serif]">
                            {section.highlight}
                          </p>
                        </div>
                      )}

                      {section.list && (
                        <ul className="space-y-3">
                          {section.list.map((item, idx) => (
                            <li key={idx} className="flex items-start gap-3">
                              <div className={`w-2 h-2 rounded-full flex-shrink-0 mt-2 ${section.dotColor}`} />
                              <span className="text-sm leading-relaxed text-[#2E2828] font-[Libre_Baskerville,serif]">
                                {item}
                              </span>
                            </li>
                          ))}
                        </ul>
                      )}

                      {section.note && (
                        <div className="mt-4 p-3 rounded-lg text-xs italic bg-[#FDF6EE] text-[#5F8B8C] font-[Libre_Baskerville,serif]">
                          <strong>Note:</strong> {section.note}
                        </div>
                      )}
                    </div>
                  </div>
                )}
              </div>
            );
          })}
        </div>
      </section>
    </div>
  );
};

export default PrivacyPolicy;