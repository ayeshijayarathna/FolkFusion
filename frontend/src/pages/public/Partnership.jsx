import React from 'react';
import { 
  Building2, 
  Users, 
  Globe2, 
  Mail, 
  Phone, 
  MapPin,
  CheckCircle2,
  Handshake,
  Heart,
  Target,
  Sparkles
} from 'lucide-react';

const Partnership = () => {
  const partnerTypes = [
    {
      icon: Building2,
      title: 'Government Bodies',
      description: 'Provincial councils and cultural departments',
      color: 'var(--color-muted-clay)',
      bgColor: 'rgba(201,123,90,0.12)',
      benefits: [
        'Centralized artist management system',
        'Digital cultural archives',
        'Province-based analytics and reports',
        'Event coordination platform'
      ]
    },
    {
      icon: Users,
      title: 'NGOs & Foundations',
      description: 'Cultural preservation organizations',
      color: 'var(--color-sage-green)',
      bgColor: 'rgba(122,158,142,0.12)',
      benefits: [
        'Artist empowerment programs',
        'Donation management system',
        'Impact tracking and reporting',
        'Community engagement tools'
      ]
    },
    {
      icon: Globe2,
      title: 'International Partners',
      description: 'UNESCO and global heritage initiatives',
      color: 'var(--color-muted-teal)',
      bgColor: 'rgba(95,139,140,0.12)',
      benefits: [
        'Global visibility for Sri Lankan arts',
        'Cultural exchange programs',
        'International market access',
        'Research collaboration opportunities'
      ]
    }
  ];

  const keyFeatures = [
    {
      icon: Target,
      title: 'Decentralized Platform',
      description: 'Province-based management with local autonomy'
    },
    {
      icon: Heart,
      title: 'Artist Empowerment',
      description: 'Direct support and visibility for folk artists'
    },
    {
      icon: Sparkles,
      title: 'Digital Preservation',
      description: "Safeguarding Sri Lanka's cultural heritage"
    },
    {
      icon: Handshake,
      title: 'Collaborative Ecosystem',
      description: 'Connecting stakeholders across provinces'
    }
  ];

  const provincialPartners = [
    { name: 'Central Province',       logo: './public/images/central.png',       shortName: 'Central'       },
    { name: 'Eastern Province',       logo: './public/images/eastern.png',       shortName: 'Eastern'       },
    { name: 'Northern Province',      logo: './public/images/northern.png',      shortName: 'Northern'      },
    { name: 'Southern Province',      logo: './public/images/southern.png',      shortName: 'Southern'      },
    { name: 'Western Province',       logo: './public/images/western.png',       shortName: 'Western'       },
    { name: 'North Central Province', logo: './public/images/north-central.png', shortName: 'North Central' },
    { name: 'North Western Province', logo: './public/images/north-western.png', shortName: 'North Western' },
    { name: 'Sabaragamuwa Province',  logo: './public/images/sabaragamuwa.png',  shortName: 'Sabaragamuwa'  },
    { name: 'Uva Province',           logo: './public/images/uva.png',           shortName: 'Uva'           },
  ];

  return (
    <div className="min-h-screen" style={{ backgroundColor: 'var(--color-warm-sand)' }}>

      {/* hero*/}
      <section
        className="relative py-24 overflow-hidden"
        style={{ background: 'linear-gradient(135deg, var(--color-muted-clay) 0%, var(--color-dusty-rose) 100%)' }}
      >
        <div
          className="absolute inset-0 opacity-80"
          style={{
            backgroundImage: 'url("/images/part.png")',
            backgroundSize: 'cover',
            backgroundPosition: 'center',
            backgroundRepeat: 'no-repeat',
          }}
        />

        <div className="container mx-auto px-4 relative z-10">
          <div className="max-w-4xl mx-auto text-center text-white">
            <div className="flex justify-center mb-6">
              <div
                className="w-20 h-20 rounded-2xl flex items-center justify-center"
                style={{ background: 'rgba(255,255,255,0.20)', backdropFilter: 'blur(6px)' }}
              >
                <Handshake size={40} className="text-white" />
              </div>
            </div>

            <h1 className="font-heading text-5xl md:text-6xl font-normal mb-6">
              Become a Partner
            </h1>

            <p
              className="font-body text-xl md:text-2xl font-bold mb-8 leading-relaxed"
              style={{ color: 'rgba(92, 9, 9, 0.9)' }}
            >
              Join hands with provincial councils to preserve Sri Lanka's folk art heritage
            </p>
          </div>
        </div>
      </section>

      {/*partnership Opportunities */}
      <section className="py-20 px-4">
        <div className="container mx-auto max-w-7xl">
          <div className="text-center mb-16">
            <h2 className="font-heading text-4xl font-normal mb-4" style={{ color: 'var(--color-deep-brown)' }}>
              Partnership Opportunities
            </h2>
            <p className="font-body text-lg max-w-2xl mx-auto" style={{ color: 'rgba(46,40,40,0.70)' }}>
              We welcome diverse partnerships to strengthen Sri Lanka's cultural ecosystem
            </p>
          </div>

          <div className="grid md:grid-cols-3 gap-8">
            {partnerTypes.map((partner, index) => {
              const IconComponent = partner.icon;
              return (
                <div
                  key={index}
                  className="bg-white rounded-2xl p-8 shadow-lg hover:shadow-xl transition-all duration-300 hover:-translate-y-2"
                  style={{ border: '1px solid rgba(201,123,90,0.10)' }}
                >
                  <div
                    className="w-16 h-16 rounded-xl flex items-center justify-center mb-6"
                    style={{ backgroundColor: partner.bgColor }}
                  >
                    <IconComponent size={32} style={{ color: partner.color }} />
                  </div>

                  <h3 className="font-heading text-2xl font-normal mb-3" style={{ color: 'var(--color-deep-brown)' }}>
                    {partner.title}
                  </h3>
                  <p className="font-body mb-6" style={{ color: 'rgba(46,40,40,0.70)' }}>
                    {partner.description}
                  </p>

                  <div className="space-y-3">
                    {partner.benefits.map((benefit, idx) => (
                      <div key={idx} className="flex items-start gap-3">
                        <CheckCircle2
                          size={18}
                          className="flex-shrink-0 mt-1"
                          style={{ color: 'var(--color-sage-green)' }}
                        />
                        <span className="font-body text-sm" style={{ color: 'rgba(46,40,40,0.80)' }}>
                          {benefit}
                        </span>
                      </div>
                    ))}
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      </section>

      {/* why Partner With Us */}
      <section className="py-20 px-4" style={{ backgroundColor: 'rgba(255,255,255,0.50)' }}>
        <div className="container mx-auto max-w-7xl">
          <div className="text-center mb-16">
            <h2 className="font-heading text-4xl font-normal mb-4" style={{ color: 'var(--color-deep-brown)' }}>
              Why Partner With Us?
            </h2>
            <p className="font-body text-lg max-w-2xl mx-auto" style={{ color: 'rgba(46,40,40,0.70)' }}>
              Our platform offers unique features for cultural preservation and artist empowerment
            </p>
          </div>

          <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-6">
            {keyFeatures.map((feature, index) => {
              const IconComponent = feature.icon;
              return (
                <div
                  key={index}
                  className="bg-white rounded-xl p-6 text-center hover:shadow-lg transition-shadow"
                >
                  <div
                    className="w-14 h-14 rounded-full flex items-center justify-center mx-auto mb-4"
                    style={{ backgroundColor: 'rgba(201,123,90,0.10)' }}
                  >
                    <IconComponent size={24} style={{ color: 'var(--color-muted-clay)' }} />
                  </div>
                  <h3 className="font-heading text-lg font-normal mb-2" style={{ color: 'var(--color-deep-brown)' }}>
                    {feature.title}
                  </h3>
                  <p className="font-body text-sm" style={{ color: 'rgba(46,40,40,0.70)' }}>
                    {feature.description}
                  </p>
                </div>
              );
            })}
          </div>
        </div>
      </section>

      {/* current Partners */}
      <section className="py-20 px-4 bg-white">
        <div className="container mx-auto max-w-7xl">
          <div className="text-center mb-16">
            <h2 className="font-heading text-4xl font-normal mb-4" style={{ color: 'var(--color-deep-brown)' }}>
              Current Partners
            </h2>
            <p className="font-body text-lg max-w-2xl mx-auto" style={{ color: 'rgba(46,40,40,0.70)' }}>
              Collaborating with all 9 Provincial Traditional Industry Development Departments
            </p>
          </div>

          <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-5 gap-8">
            {provincialPartners.map((partner, index) => (
              <div key={index} className="flex flex-col items-center group">
                <div
                  className="w-32 h-32 bg-white rounded-2xl shadow-md hover:shadow-xl transition-all duration-300 flex items-center justify-center mb-4 overflow-hidden"
                  style={{ border: '2px solid rgba(201,123,90,0.10)' }}
                  onMouseEnter={e => (e.currentTarget.style.borderColor = 'rgba(201,123,90,0.30)')}
                  onMouseLeave={e => (e.currentTarget.style.borderColor = 'rgba(201,123,90,0.10)')}
                >
                  <img
                    src={partner.logo}
                    alt={partner.name}
                    className="w-24 h-24 object-contain grayscale group-hover:grayscale-0 transition-all duration-300"
                    onError={(e) => {
                      e.target.style.display = 'none';
                      e.target.nextSibling.style.display = 'flex';
                    }}
                  />
                  <div
                    className="w-full h-full items-center justify-center"
                    style={{
                      display: 'none',
                      background: 'linear-gradient(135deg, rgba(201,123,90,0.10), rgba(196,145,122,0.10))',
                    }}
                  >
                    <span
                      className="font-heading text-3xl font-normal"
                      style={{ color: 'var(--color-muted-clay)' }}
                    >
                      {partner.shortName.split(' ').map(w => w[0]).join('')}
                    </span>
                  </div>
                </div>
                <h3
                  className="font-body text-sm font-semibold text-center transition-colors"
                  style={{ color: 'var(--color-deep-brown)' }}
                >
                  {partner.name}
                </h3>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/*about platform */}
      <section className="py-20 px-4">
        <div className="container mx-auto max-w-6xl">
          <div
            className="rounded-3xl p-12"
            style={{ background: 'linear-gradient(135deg, rgba(95,139,140,0.10), rgba(122,158,142,0.10))' }}
          >
            <div className="grid md:grid-cols-2 gap-12 items-center">
              {/* left */}
              <div>
                <h2 className="font-heading text-3xl font-normal mb-6" style={{ color: 'var(--color-deep-brown)' }}>
                  About FolkFusion Platform
                </h2>
                <div className="space-y-4" style={{ color: 'rgba(46,40,40,0.80)' }}>
                  <p className="font-body leading-relaxed">
                    A decentralized platform connecting Sri Lankan folk artists, provincial councils,
                    students, researchers, and cultural enthusiasts.
                  </p>
                  <div className="space-y-3">
                    {[
                      'Province-based artist registration and management',
                      'Digital marketplace for traditional artworks',
                      'AI-powered cultural insights and analytics',
                      'WebAR virtual museum experiences',
                      'Secure donation and payment integration',
                    ].map((item, i) => (
                      <div key={i} className="flex items-center gap-3">
                        <div
                          className="w-2 h-2 rounded-full flex-shrink-0"
                          style={{ backgroundColor: 'var(--color-muted-clay)' }}
                        />
                        <span className="font-body">{item}</span>
                      </div>
                    ))}
                  </div>
                </div>
              </div>

              {/* right */}
              <div className="bg-white rounded-2xl p-8 shadow-lg">
                <h3 className="font-heading text-xl font-normal mb-6" style={{ color: 'var(--color-deep-brown)' }}>
                  Platform Components
                </h3>
                <div className="space-y-4">
                  {[
                    {
                      borderColor: 'var(--color-muted-clay)',
                      title: 'FolkFusion Web',
                      desc: 'Comprehensive web platform for artists, admins, and public users',
                    },
                    {
                      borderColor: 'var(--color-sage-green)',
                      title: 'FolkChat Mobile',
                      desc: 'Artist collaboration and community networking app',
                    },
                    {
                      borderColor: 'var(--color-muted-teal)',
                      title: 'AI & AR Features',
                      desc: 'Smart chatbot and immersive 3D cultural experiences',
                    },
                  ].map((comp, i) => (
                    <div key={i} className="pl-4" style={{ borderLeft: `4px solid ${comp.borderColor}` }}>
                      <h4 className="font-heading font-normal mb-1" style={{ color: 'var(--color-deep-brown)' }}>
                        {comp.title}
                      </h4>
                      <p className="font-body text-sm" style={{ color: 'rgba(46,40,40,0.70)' }}>
                        {comp.desc}
                      </p>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* contact*/}
      <section className="py-16 px-4" style={{ backgroundColor: '#FFF8E1' }}>
        <div className="container mx-auto max-w-6xl">
          <div className="grid md:grid-cols-3 gap-8 text-center">
            {[
              {
                Icon: MapPin,
                label: 'Address',
                content: (
                  <>
                    Traditional Industry Development Department<br />
                    Provincial Councils, Sri Lanka
                  </>
                ),
              },
              {
                Icon: Phone,
                label: 'Phone',
                content: '+94 11 234 5678',
              },
              {
                Icon: Mail,
                label: 'Email',
                content: (
                  <>
                    info@folkloomsl.lk<br />
                    partnership@folkloomsl.lk
                  </>
                ),
              },
            ].map(({ Icon, label, content }, i) => (
              <div key={i}>
                <Icon size={32} className="mx-auto mb-4" style={{ color: 'var(--color-deep-brown)' }} />
                <h3 className="font-heading font-normal mb-2" style={{ color: 'var(--color-deep-brown)' }}>
                  {label}
                </h3>
                <p className="font-body text-sm" style={{ color: 'var(--color-deep-brown)' }}>
                  {content}
                </p>
              </div>
            ))}
          </div>
        </div>
      </section>

    </div>
  );
};

export default Partnership;