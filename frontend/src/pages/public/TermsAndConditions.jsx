import React, { useState } from 'react';
import { Gavel, FileText, CheckCircle, XCircle, Scale, AlertTriangle, Users, ShoppingCart, Shield, Mail, Award, Heart, Sparkles, ChevronDown, ChevronUp } from 'lucide-react';

const TermsAndConditions = () => {
  const [openSection, setOpenSection] = useState(null);
  const lastUpdated = "February 13, 2026";

  const sections = [
    {
      icon: Sparkles,
      title: "Acceptance of Terms",
      border: "border-[#A67C52]",
      openBg: "bg-[#A67C52]/10",
      iconBg: "bg-[#A67C52]",
      titleColor: "text-[#A67C52]",
      chevronColor: "text-[#A67C52]",
      dotColor: "bg-[#A67C52]",
      highlightBg: "bg-[#A67C52]/10",
      highlightBorder: "border-l-[#A67C52]",
      disclaimerBorder: "border-[#A67C52]",
      disclaimerBg: "bg-[#A67C52]/10",
      disclaimerIcon: "text-[#A67C52]",
      content: "By accessing FolkFusion (web application) or using services associated with it, you agree to be bound by these Terms and Conditions. These terms govern all use of the platform, which is operated under the Traditional Industry Development Departments of Sri Lanka's nine Provincial Councils.",
      highlight: "Continued use of the platform after any updates to these terms constitutes your acceptance of the revised terms."
    },
    {
      icon: Users,
      title: "User Accounts & Roles",
      border: "border-[#8DAA91]",
      openBg: "bg-[#8DAA91]/10",
      iconBg: "bg-[#8DAA91]",
      titleColor: "text-[#8DAA91]",
      chevronColor: "text-[#8DAA91]",
      dotColor: "bg-[#8DAA91]",
      highlightBg: "bg-[#8DAA91]/10",
      highlightBorder: "border-l-[#8DAA91]",
      disclaimerBorder: "border-[#8DAA91]",
      disclaimerBg: "bg-[#8DAA91]/10",
      disclaimerIcon: "text-[#8DAA91]",
      content: "FolkFusion has two authenticated roles and one unauthenticated access mode:",
      list: [
        "Public Users: Any person can browse all public content, view artist profiles, artworks, and the marketplace without registration. Donations can be made anonymously or with a name — no account needed.",
        "Folk Artists (role: 'artist'): Registered by their Provincial Admin after applying through the Traditional Industry Development Department of their province. Upon admin approval, the artist receives login credentials. Artists must be at least 18 years old.",
        "Provincial Administrators (role: 'admin'): Appointed staff of the Traditional Industry Development Departments. Admins manage artists, artworks, events, and content within their own province only.",
        "Account Security: You are responsible for keeping your credentials confidential. JWT-based authentication is used; tokens grant access only to your assigned role and province."
      ],
      note: "Artist accounts are created by Provincial Admins — artists cannot self-register. Each admin account is province-scoped and cannot access other provinces' data."
    },
    {
      icon: CheckCircle,
      title: "Permitted Uses",
      border: "border-[#5F8B8C]",
      openBg: "bg-[#5F8B8C]/10",
      iconBg: "bg-[#5F8B8C]",
      titleColor: "text-[#5F8B8C]",
      chevronColor: "text-[#5F8B8C]",
      dotColor: "bg-[#5F8B8C]",
      highlightBg: "bg-[#5F8B8C]/10",
      highlightBorder: "border-l-[#5F8B8C]",
      disclaimerBorder: "border-[#5F8B8C]",
      disclaimerBg: "bg-[#5F8B8C]/10",
      disclaimerIcon: "text-[#5F8B8C]",
      content: "FolkFusion is designed for the following lawful purposes:",
      list: [
        "Browsing and discovering Sri Lankan traditional folk art from all nine provinces.",
        "Viewing and purchasing artworks through the marketplace (card payment, bank transfer, or cash on delivery).",
        "Making donations — anonymously or named — to support registered folk artists.",
        "Tracking marketplace orders through the order tracking feature.",
        "Artists adding, managing, and promoting their artwork and crafts.",
        "Provincial admins managing artists, approving registrations, and overseeing provincial content.",
        "Accessing educational content, events, and news about traditional crafts."
      ]
    },
    {
      icon: XCircle,
      title: "Prohibited Activities",
      border: "border-[#C48A6A]",
      openBg: "bg-[#C48A6A]/10",
      iconBg: "bg-[#C48A6A]",
      titleColor: "text-[#C48A6A]",
      chevronColor: "text-[#C48A6A]",
      dotColor: "bg-[#C48A6A]",
      highlightBg: "bg-[#C48A6A]/10",
      highlightBorder: "border-l-[#C48A6A]",
      disclaimerBorder: "border-[#C48A6A]",
      disclaimerBg: "bg-[#C48A6A]/10",
      disclaimerIcon: "text-[#C48A6A]",
      content: "The following actions are strictly prohibited on FolkFusion:",
      list: [
        "Attempting to access accounts, data, or admin panels without authorization.",
        "Submitting false or misleading artwork descriptions, pricing, or artist credentials.",
        "Impersonating artists, administrators, or government officials.",
        "Using the platform for illegal commercial activity or money laundering.",
        "Posting content that infringes copyright, trademarks, or intellectual property rights.",
        "Harassing, threatening, or abusing other users.",
        "Scraping or automated harvesting of platform data without permission.",
        "Attempting to interfere with platform security, authentication, or database integrity.",
        "Manipulating marketplace prices, fraudulent orders, or payment abuse.",
        "Uploading content that is offensive, culturally disrespectful, or violates Sri Lankan law."
      ]
    },
    {
      icon: FileText,
      title: "Content & Intellectual Property",
      border: "border-[#A67C52]",
      openBg: "bg-[#A67C52]/10",
      iconBg: "bg-[#A67C52]",
      titleColor: "text-[#A67C52]",
      chevronColor: "text-[#A67C52]",
      dotColor: "bg-[#A67C52]",
      highlightBg: "bg-[#A67C52]/10",
      highlightBorder: "border-l-[#A67C52]",
      disclaimerBorder: "border-[#A67C52]",
      disclaimerBg: "bg-[#A67C52]/10",
      disclaimerIcon: "text-[#A67C52]",
      content: "Content on FolkFusion is governed as follows:",
      list: [
        "Artist-Owned Content: Artists retain full ownership of all artwork images, descriptions, and creative work they upload.",
        "Platform License: By uploading content, artists grant FolkFusion a non-exclusive, royalty-free license to display, promote, and archive that content for cultural preservation purposes.",
        "Platform IP: FolkFusion's branding, design, code, and features are proprietary and may not be reproduced without permission.",
        "Cultural Archive Rights: Artwork records may be retained for heritage purposes even after account deletion, with personal identifiers removed.",
        "User Responsibility: You are solely responsible for ensuring you have the right to upload any content you submit."
      ],
      note: "Unauthorized reproduction, redistribution, or commercial use of platform content is strictly prohibited."
    },
    {
      icon: ShoppingCart,
      title: "Marketplace & Transactions",
      border: "border-[#8DAA91]",
      openBg: "bg-[#8DAA91]/10",
      iconBg: "bg-[#8DAA91]",
      titleColor: "text-[#8DAA91]",
      chevronColor: "text-[#8DAA91]",
      dotColor: "bg-[#8DAA91]",
      highlightBg: "bg-[#8DAA91]/10",
      highlightBorder: "border-l-[#8DAA91]",
      disclaimerBorder: "border-[#8DAA91]",
      disclaimerBg: "bg-[#8DAA91]/10",
      disclaimerIcon: "text-[#8DAA91]",
      content: "The FolkFusion marketplace facilitates direct sales between artists and buyers:",
      list: [
        "Artists are responsible for accurately listing artwork details, pricing, and availability.",
        "Payment Methods: Buyers may pay via card (Stripe), bank transfer, or cash on delivery (COD).",
        "Order Tracking: All marketplace orders include tracking features for buyer transparency.",
        "Facilitation Only: FolkFusion acts as a platform facilitator — the transaction is between the artist and the buyer.",
        "Donations: Processed securely through Stripe. Donors may choose to donate anonymously or with their name.",
        "Commission & Fees: Any applicable commission structures are clearly communicated to artists by their provincial admin.",
        "Disputes: Marketplace disputes should be raised with the relevant provincial department or through platform support."
      ]
    },
    {
      icon: Award,
      title: "Provincial Decentralization",
      border: "border-[#5F8B8C]",
      openBg: "bg-[#5F8B8C]/10",
      iconBg: "bg-[#5F8B8C]",
      titleColor: "text-[#5F8B8C]",
      chevronColor: "text-[#5F8B8C]",
      dotColor: "bg-[#5F8B8C]",
      highlightBg: "bg-[#5F8B8C]/10",
      highlightBorder: "border-l-[#5F8B8C]",
      disclaimerBorder: "border-[#5F8B8C]",
      disclaimerBg: "bg-[#5F8B8C]/10",
      disclaimerIcon: "text-[#5F8B8C]",
      content: "FolkFusion operates on a province-based decentralized model aligned with Sri Lanka's nine provincial councils:",
      list: [
        "Each of the nine provinces has a dedicated admin from the Traditional Industry Development Department.",
        "Artists are registered under their respective province and can only be managed by that province's admin.",
        "Provincial admins can only access and manage content within their own province — cross-province data access is not permitted.",
        "Each province maintains its own artist database, artwork records, event calendar, and provincial content.",
        "Provinces covered: Western, Central, Southern, Northern, Eastern, North Western, North Central, Uva, Sabaragamuwa."
      ]
    },
    {
      icon: Shield,
      title: "Privacy & Data Protection",
      border: "border-[#C48A6A]",
      openBg: "bg-[#C48A6A]/10",
      iconBg: "bg-[#C48A6A]",
      titleColor: "text-[#C48A6A]",
      chevronColor: "text-[#C48A6A]",
      dotColor: "bg-[#C48A6A]",
      highlightBg: "bg-[#C48A6A]/10",
      highlightBorder: "border-l-[#C48A6A]",
      disclaimerBorder: "border-[#C48A6A]",
      disclaimerBg: "bg-[#C48A6A]/10",
      disclaimerIcon: "text-[#C48A6A]",
      content: "FolkFusion handles your data with care:",
      list: [
        "Passwords are bcrypt-hashed and never stored in plain text.",
        "JWT tokens are used for role-based authentication with appropriate expiry.",
        "Artist data is only accessible to their province's admin and the artist themselves.",
        "Public users have no mandatory data collection — browsing is fully anonymous.",
        "Stripe handles all payment data — FolkFusion never stores card numbers.",
        "Artists may request data correction, export, or deletion at any time."
      ],
      note: "Please refer to our Privacy Policy for complete details on how your data is collected, used, and protected."
    },
    {
      icon: AlertTriangle,
      title: "Limitation of Liability",
      border: "border-[#A67C52]",
      openBg: "bg-[#A67C52]/10",
      iconBg: "bg-[#A67C52]",
      titleColor: "text-[#A67C52]",
      chevronColor: "text-[#A67C52]",
      dotColor: "bg-[#A67C52]",
      highlightBg: "bg-[#A67C52]/10",
      highlightBorder: "border-l-[#A67C52]",
      disclaimerBorder: "border-[#A67C52]",
      disclaimerBg: "bg-[#A67C52]/10",
      disclaimerIcon: "text-[#A67C52]",
      content: "FolkFusion is provided 'as is' and 'as available'. We do not warrant:",
      list: [
        "Uninterrupted, error-free platform operation at all times.",
        "Accuracy or completeness of user-submitted content (artworks, descriptions, pricing).",
        "Outcomes of marketplace transactions between buyers and artists.",
        "Security of data transmitted over the internet beyond our implemented controls.",
        "Availability of third-party services (Stripe, Cloudinary, Firebase) at all times."
      ],
      disclaimer: "To the fullest extent permitted by Sri Lankan law, FolkFusion and its associated Provincial Departments shall not be liable for indirect, incidental, or consequential damages arising from platform use."
    },
    {
      icon: Gavel,
      title: "Termination & Suspension",
      border: "border-[#8DAA91]",
      openBg: "bg-[#8DAA91]/10",
      iconBg: "bg-[#8DAA91]",
      titleColor: "text-[#8DAA91]",
      chevronColor: "text-[#8DAA91]",
      dotColor: "bg-[#8DAA91]",
      highlightBg: "bg-[#8DAA91]/10",
      highlightBorder: "border-l-[#8DAA91]",
      disclaimerBorder: "border-[#8DAA91]",
      disclaimerBg: "bg-[#8DAA91]/10",
      disclaimerIcon: "text-[#8DAA91]",
      content: "We reserve the right to take the following actions to maintain platform integrity:",
      list: [
        "Suspend or deactivate accounts that violate these Terms and Conditions.",
        "Remove artworks or content that infringe IP rights or violate platform policies.",
        "Modify or discontinue platform features with reasonable advance notice.",
        "Investigate reports of fraudulent behavior or abuse.",
        "Cooperate with Sri Lankan law enforcement when legally required.",
        "Artists may request account deletion at any time through their provincial admin or by contacting support."
      ],
      note: "Upon deletion, personal data is removed within 30 days. Anonymized artwork records may be retained for cultural heritage documentation."
    },
    {
      icon: Heart,
      title: "Changes to Terms",
      border: "border-[#5F8B8C]",
      openBg: "bg-[#5F8B8C]/10",
      iconBg: "bg-[#5F8B8C]",
      titleColor: "text-[#5F8B8C]",
      chevronColor: "text-[#5F8B8C]",
      dotColor: "bg-[#5F8B8C]",
      highlightBg: "bg-[#5F8B8C]/10",
      highlightBorder: "border-l-[#5F8B8C]",
      disclaimerBorder: "border-[#5F8B8C]",
      disclaimerBg: "bg-[#5F8B8C]/10",
      disclaimerIcon: "text-[#5F8B8C]",
      content: "These Terms may be updated to reflect changes in:",
      list: [
        "Platform features, services, or operational structure.",
        "Sri Lankan legal or regulatory requirements.",
        "Feedback from provincial departments, artists, or users.",
        "Security improvements and data protection practices."
      ],
      note: "Material changes will be communicated via email and platform notifications. Continued use of FolkFusion after changes are posted constitutes acceptance."
    },
    {
      icon: Scale,
      title: "Governing Law",
      border: "border-[#C48A6A]",
      openBg: "bg-[#C48A6A]/10",
      iconBg: "bg-[#C48A6A]",
      titleColor: "text-[#C48A6A]",
      chevronColor: "text-[#C48A6A]",
      dotColor: "bg-[#C48A6A]",
      highlightBg: "bg-[#C48A6A]/10",
      highlightBorder: "border-l-[#C48A6A]",
      disclaimerBorder: "border-[#C48A6A]",
      disclaimerBg: "bg-[#C48A6A]/10",
      disclaimerIcon: "text-[#C48A6A]",
      content: "These Terms are governed by and construed in accordance with the laws of Sri Lanka. Disputes are resolved through the following process:",
      list: [
        "Step 1 — Contact our support team at info@folkfusion.lk to resolve the matter directly.",
        "Step 2 — If unresolved, mediation with the relevant provincial Traditional Industry Development Department.",
        "Step 3 — Legal proceedings before courts of competent jurisdiction in Sri Lanka as a last resort."
      ]
    }
  ];

  return (
    <div className="min-h-screen bg-[#FDF6EE] overflow-hidden">

      {/* Hero Section */}
      <section className="relative py-32 overflow-hidden">
        <div className="absolute inset-0 z-0">
          <img
            src="/images/tc.jpg"
            alt="Traditional Sri Lankan Folk Art"
            className="w-full h-full object-cover"
            onError={(e) => { e.target.style.display = 'none'; }}
          />
        </div>

        <div className="container mx-auto px-4 relative z-10">
          <div className="max-w-4xl mx-auto text-center">
            <div className="inline-flex items-center gap-2 border border-[#A67C52] bg-[#FDF6EE] text-[#A67C52] text-xs tracking-widest uppercase px-4 py-2 rounded-full mb-6">
              <Gavel size={12} />
              FolkFusion · Terms & Conditions
            </div>
            <h1 className="text-5xl md:text-7xl font-bold mb-6 leading-tight text-[#3D3530] font-[Cinzel_Decorative,serif]">
              Terms & Conditions
            </h1>
            <p className="text-lg max-w-2xl mx-auto text-[#2E2828] font-[Libre_Baskerville,serif]">
              Guidelines for using the FolkFusion platform and its services.
            </p>
            <p className="text-sm mt-2 text-[#C97B5A] font-[Libre_Baskerville,serif]">
              Last Updated: {lastUpdated}
            </p>
          </div>
        </div>
      </section>

      {/* Welcome Banner */}
      <section className="px-4 py-10">
        <div className="container mx-auto max-w-5xl">
          <div className="rounded-3xl p-10 md:p-12 shadow-lg mb-6 bg-[#8DAA91]/25">
            <div className="flex flex-col md:flex-row items-start md:items-center gap-6">
              <div className="w-14 h-14 rounded-2xl flex items-center justify-center flex-shrink-0 bg-[#8DAA91]">
                <Sparkles size={28} className="text-white" />
              </div>
              <div>
                <h2 className="text-2xl md:text-3xl font-bold mb-3 text-white font-[Cinzel_Decorative,serif]">
                  Welcome to FolkFusion
                </h2>
                <p className="text-base md:text-lg leading-relaxed text-[#8DAA91] font-[Libre_Baskerville,serif]">
                  FolkFusion is a platform dedicated to preserving and promoting Sri Lanka's traditional folk industries — operated under the Traditional Industry Development Departments of the nine Provincial Councils. Please read these terms carefully before using our services.
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

                      {section.disclaimer && (
                        <div className={`mt-4 p-3 rounded-lg border-2 text-xs font-semibold text-[#3D3530] font-[Libre_Baskerville,serif] ${section.disclaimerBorder} ${section.disclaimerBg}`}>
                          <AlertTriangle size={13} className={`inline mr-2 ${section.disclaimerIcon}`} />
                          {section.disclaimer}
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

export default TermsAndConditions;