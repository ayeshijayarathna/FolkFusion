import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { 
  BookOpen, MapPin, Users, Clock, Calendar, DollarSign, 
  Award, User, Phone, Mail, ChevronLeft, Star, CheckCircle,
  ArrowRight, MessageCircle
} from 'lucide-react';
import { courseAPI } from '../../../services/api';

const CourseDetail = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const [course, setCourse] = useState(null);
  const [loading, setLoading] = useState(true);
  const [selectedImage, setSelectedImage] = useState(0);

  useEffect(() => {
    fetchCourseDetails();
  }, [id]);

  const fetchCourseDetails = async () => {
    try {
      setLoading(true);
      const response = await courseAPI.getCourseById(id);
      if (response.data.success) {
        setCourse(response.data.data);
      }
    } catch (error) {
      console.error('Error fetching course details:', error);
    } finally {
      setLoading(false);
    }
  };

  const getStatusColor = (status) => {
    const colors = {
      active: 'bg-green-100 text-green-700 border-green-200',
      upcoming: 'bg-blue-100 text-blue-700 border-blue-200',
      ongoing: 'bg-yellow-100 text-yellow-700 border-yellow-200',
      completed: 'bg-purple-100 text-purple-700 border-purple-200',
    };
    return colors[status] || 'bg-gray-100 text-gray-700 border-gray-200';
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-[#F4EDE4] flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-16 w-16 border-4 border-[#A67C52] border-t-transparent mx-auto mb-4"></div>
          <p className="text-[#2E2E2E]/70">Loading course details...</p>
        </div>
      </div>
    );
  }

  if (!course) {
    return (
      <div className="min-h-screen bg-[#F4EDE4] flex items-center justify-center">
        <div className="text-center">
          <BookOpen size={64} className="mx-auto text-[#A67C52]/30 mb-4" />
          <h2 className="text-2xl font-bold text-[#4A3F35] mb-2">Course Not Found</h2>
          <p className="text-[#2E2E2E]/70 mb-6">The course you're looking for doesn't exist.</p>
          <button
            onClick={() => navigate('/courses')}
            className="px-6 py-3 bg-gradient-to-r from-[#A67C52] to-[#C48A6A] text-white rounded-xl hover:shadow-lg transition-all"
          >
            Browse All Courses
          </button>
        </div>
      </div>
    );
  }

  const availableSpots = (course.capacity?.maximum || 0) - (course.enrolledStudents || 0);
  const enrollmentPercentage = course.capacity?.maximum 
    ? (course.enrolledStudents / course.capacity.maximum) * 100 
    : 0;

  return (
    <div className="min-h-screen bg-[#F4EDE4]/50">
      {/* hero Section with Image */}
      <section className="relative bg-gradient-to-br from-[#A67C52] to-[#C48A6A] text-white">
        <div className="container mx-auto pt-30 px-4 py-8">
          {/* back Button */}
          <button
            onClick={() => navigate('/courses')}
            className="flex items-center gap-2 mb-6 px-4 py-2 bg-white/10 hover:bg-white/20 rounded-lg transition-colors backdrop-blur-sm"
          >
            <ChevronLeft size={20} />
            <span>Back to Courses</span>
          </button>

          <div className="grid md:grid-cols-2 gap-8 items-center">
            {/* left*/}
            <div>
              {/* badges */}
              <div className="flex flex-wrap gap-3 mb-4">
                {course.isFeatured && (
                  <div className="flex items-center gap-2 px-3 py-1 bg-[#d3ab2a] rounded-full text-sm font-semibold">
                    <Star size={14} className="fill-white" />
                    Featured Course
                  </div>
                )}
                <div className={`px-3 py-1 rounded-full text-sm font-semibold border-2 ${getStatusColor(course.status)}`}>
                  {course.status.charAt(0).toUpperCase() + course.status.slice(1)}
                </div>
              </div>

              {/* title */}
              <h1 className="text-4xl md:text-5xl font-bold mb-4 font-serif">
                {course.title}
              </h1>

              {/* quick info */}
              <div className="flex flex-wrap gap-4 mb-6 text-white/90">
                <div className="flex items-center gap-2">
                  <BookOpen size={18} />
                  <span>{course.artForm}</span>
                </div>
                <div className="flex items-center gap-2">
                  <Award size={18} />
                  <span>{course.level}</span>
                </div>
                <div className="flex items-center gap-2">
                  <MapPin size={18} />
                  <span>{course.province} Province</span>
                </div>
              </div>

              {/* description */}
              <p className="text-lg text-white/90 leading-relaxed mb-6">
                {course.description}
              </p>

              {/* price */}
              <div className="flex items-end gap-2 mb-6">
                <div className="text-4xl font-bold">
                  LKR {course.fee?.amount?.toLocaleString()}
                </div>
                <div className="text-white/70 mb-1">
                  / {course.fee?.paymentSchedule}
                </div>
              </div>

              {/* CTA buttons */}
              <div className="flex flex-wrap gap-4">
                {course.contactPerson?.phone && (
                  <a
                    href={`tel:${course.contactPerson.phone}`}
                    className="flex items-center gap-2 px-8 py-4 bg-white text-[#A67C52] rounded-xl hover:shadow-xl transition-all duration-300 font-semibold hover:scale-105"
                  >
                    <Phone size={20} />
                    Call to Enroll
                  </a>
                )}
                {course.contactPerson?.whatsapp && (
                  <a
                    href={`https://wa.me/${course.contactPerson.whatsapp.replace(/\D/g, '')}`}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="flex items-center gap-2 px-8 py-4 bg-[#25D366] text-white rounded-xl hover:shadow-xl transition-all duration-300 font-semibold hover:scale-105"
                  >
                    <MessageCircle size={20} />
                    WhatsApp
                  </a>
                )}
              </div>
            </div>

            {/* right  */}
            <div>
              {course.images && course.images.length > 0 ? (
                <div className="space-y-4">
                  {/* Main Image */}
                  <div className="relative rounded-2xl overflow-hidden shadow-2xl">
                    <img
                      src={course.images[selectedImage]}
                      alt={course.title}
                      className="w-full h-96 object-cover"
                    />
                  </div>

                  {/* thumbnail gallery */}
                  {course.images.length > 1 && (
                    <div className="grid grid-cols-4 gap-3">
                      {course.images.map((image, index) => (
                        <button
                          key={index}
                          onClick={() => setSelectedImage(index)}
                          className={`relative rounded-lg overflow-hidden border-4 transition-all ${
                            selectedImage === index 
                              ? 'border-white shadow-lg scale-105' 
                              : 'border-white/30 hover:border-white/60'
                          }`}
                        >
                          <img
                            src={image}
                            alt={`${course.title} ${index + 1}`}
                            className="w-full h-20 object-cover"
                          />
                        </button>
                      ))}
                    </div>
                  )}
                </div>
              ) : (
                <div className="bg-white/10 rounded-2xl h-96 flex items-center justify-center backdrop-blur-sm">
                  <BookOpen size={80} className="text-white/30" />
                </div>
              )}
            </div>
          </div>
        </div>
      </section>

      {/* main content */}
      <section className="py-12 px-4">
        <div className="container mx-auto max-w-7xl">
          <div className="grid lg:grid-cols-3 gap-8">
            {/* left column*/}
            <div className="lg:col-span-2 space-y-8">
              {/* shedule  */}
              <div className="bg-white rounded-2xl p-8 shadow-lg">
                <h2 className="text-2xl font-bold text-[#4A3F35] mb-6 flex items-center gap-3">
                  <Calendar className="text-[#A67C52]" size={28} />
                  Schedule & Duration
                </h2>

                <div className="grid md:grid-cols-2 gap-6">
                  <div className="space-y-4">
                    <div className="flex justify-between items-center pb-3 border-b border-[#A67C52]/10">
                      <span className="text-[#2E2E2E]/70">Start Date</span>
                      <span className="font-bold text-[#4A3F35]">
                        {new Date(course.startDate).toLocaleDateString('en-US', { 
                          year: 'numeric', 
                          month: 'long', 
                          day: 'numeric' 
                        })}
                      </span>
                    </div>

                    <div className="flex justify-between items-center pb-3 border-b border-[#A67C52]/10">
                      <span className="text-[#2E2E2E]/70">Registration Deadline</span>
                      <span className="font-bold text-red-600">
                        {new Date(course.registrationDeadline).toLocaleDateString('en-US', { 
                          year: 'numeric', 
                          month: 'long', 
                          day: 'numeric' 
                        })}
                      </span>
                    </div>

                    <div className="flex justify-between items-center pb-3 border-b border-[#A67C52]/10">
                      <span className="text-[#2E2E2E]/70">Course Duration</span>
                      <span className="font-bold text-[#4A3F35]">
                        {course.duration?.weeks} weeks
                      </span>
                    </div>

                    <div className="flex justify-between items-center">
                      <span className="text-[#2E2E2E]/70">Hours per Week</span>
                      <span className="font-bold text-[#4A3F35]">
                        {course.duration?.hoursPerWeek} hours
                      </span>
                    </div>
                  </div>

                  <div className="space-y-4">
                    {course.schedule?.days && course.schedule.days.length > 0 && (
                      <div>
                        <span className="text-[#2E2E2E]/70 block mb-3">Class Days</span>
                        <div className="flex flex-wrap gap-2">
                          {course.schedule.days.map((day, idx) => (
                            <span 
                              key={idx} 
                              className="px-4 py-2 bg-[#A67C52]/10 text-[#A67C52] rounded-lg font-semibold text-sm"
                            >
                              {day}
                            </span>
                          ))}
                        </div>
                      </div>
                    )}

                    {course.schedule?.time?.start && (
                      <div className="mt-4 p-4 bg-[#F4EDE4] rounded-xl">
                        <span className="text-[#2E2E2E]/70 block mb-2">Class Timings</span>
                        <div className="text-xl font-bold text-[#4A3F35]">
                          {course.schedule.time.start} - {course.schedule.time.end}
                        </div>
                      </div>
                    )}

                    <div className="mt-4 p-4 bg-[#F4EDE4] rounded-xl">
                      <span className="text-[#2E2E2E]/70 block mb-2">Language</span>
                      <div className="text-lg font-bold text-[#4A3F35]">
                        {course.languageOfInstruction}
                      </div>
                    </div>
                  </div>
                </div>
              </div>

              {/* location */}
              <div className="bg-white rounded-2xl p-8 shadow-lg">
                <h2 className="text-2xl font-bold text-[#4A3F35] mb-6 flex items-center gap-3">
                  <MapPin className="text-[#A67C52]" size={28} />
                  Location
                </h2>

                <div className="space-y-4">
                  <div>
                    <label className="text-sm text-[#2E2E2E]/70 mb-1 block">Historical Place</label>
                    <p className="text-xl font-bold text-[#4A3F35]">
                      {course.historicalPlace?.name}
                    </p>
                  </div>

                  <div>
                    <label className="text-sm text-[#2E2E2E]/70 mb-1 block">Address</label>
                    <p className="text-lg text-[#2E2E2E]/80">
                      {course.historicalPlace?.address}
                      {course.historicalPlace?.city && `, ${course.historicalPlace.city}`}
                    </p>
                  </div>

                  <div>
                    <label className="text-sm text-[#2E2E2E]/70 mb-1 block">Province</label>
                    <p className="text-lg font-semibold text-[#4A3F35]">
                      {course.province} Province
                    </p>
                  </div>
                </div>
              </div>

              {/* instructor */}
              <div className="bg-white rounded-2xl p-8 shadow-lg">
                <h2 className="text-2xl font-bold text-[#4A3F35] mb-6 flex items-center gap-3">
                  <User className="text-[#A67C52]" size={28} />
                  Meet Your Instructor
                </h2>

                <div className="flex items-start gap-6">

                  <div className="flex-1">
                    <h3 className="text-2xl font-bold text-[#4A3F35] mb-2">
                      {course.instructor?.name}
                    </h3>

                    {course.instructor?.experience && (
                      <p className="text-[#A67C52] font-semibold mb-3">
                        {course.instructor.experience} of experience
                      </p>
                    )}

                    {course.instructor?.bio && (
                      <p className="text-[#2E2E2E]/80 leading-relaxed">
                        {course.instructor.bio}
                      </p>
                    )}

                    {course.instructor?.qualifications && course.instructor.qualifications.length > 0 && (
                      <div className="mt-4">
                        <h4 className="font-semibold text-[#4A3F35] mb-2">Qualifications</h4>
                        <ul className="space-y-2">
                          {course.instructor.qualifications.map((qual, idx) => (
                            <li key={idx} className="flex items-start gap-2 text-sm text-[#2E2E2E]/80">
                              <CheckCircle size={16} className="text-[#8DAA91] mt-0.5 flex-shrink-0" />
                              <span>{qual}</span>
                            </li>
                          ))}
                        </ul>
                      </div>
                    )}
                  </div>
                </div>
              </div>

              {/* prerequisites */}
              {course.prerequisites && course.prerequisites.length > 0 && (
                <div className="bg-white rounded-2xl p-8 shadow-lg">
                  <h2 className="text-2xl font-bold text-[#4A3F35] mb-6">Prerequisites</h2>
                  <ul className="space-y-3">
                    {course.prerequisites.map((prereq, idx) => (
                      <li key={idx} className="flex items-start gap-3">
                        <div className="w-6 h-6 bg-[#A67C52]/10 rounded-full flex items-center justify-center flex-shrink-0 mt-0.5">
                          <div className="w-2 h-2 bg-[#A67C52] rounded-full"></div>
                        </div>
                        <span className="text-[#2E2E2E]/80 flex-1">{prereq}</span>
                      </li>
                    ))}
                  </ul>
                </div>
              )}

              {/* materials */}
              {course.materials && course.materials.length > 0 && (
                <div className="bg-white rounded-2xl p-8 shadow-lg">
                  <h2 className="text-2xl font-bold text-[#4A3F35] mb-6">Materials Required</h2>
                  <div className="grid md:grid-cols-2 gap-4">
                    {course.materials.map((material, idx) => (
                      <div 
                        key={idx} 
                        className="flex items-start gap-3 p-4 bg-[#F4EDE4] rounded-xl"
                      >
                        <CheckCircle 
                          size={20} 
                          className={material.providedByInstitute ? 'text-[#8DAA91]' : 'text-[#A67C52]'} 
                        />
                        <div className="flex-1">
                          <p className="text-[#2E2E2E]/80">{material.item}</p>
                          {material.providedByInstitute && (
                            <span className="text-xs text-[#8DAA91] font-semibold">
                              Provided by Institute
                            </span>
                          )}
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </div>

            {/* right */}
            <div className="space-y-6">

              {/* certification */}
              {course.certification?.provided && (
                <div className="bg-gradient-to-br from-[#8DAA91]/10 to-[#5F8B8C]/10 rounded-2xl p-6 border-2 border-[#8DAA91]/20">
                  <div className="flex items-start gap-4">
                    <div className="w-12 h-12 bg-[#8DAA91]/20 rounded-xl flex items-center justify-center flex-shrink-0">
                      <Award className="text-[#8DAA91]" size={24} />
                    </div>
                    <div>
                      <h3 className="font-bold text-[#4A3F35] mb-2">Certificate Included</h3>
                      <p className="text-sm text-[#2E2E2E]/80">
                        {course.certification.details || 'You will receive a certificate of completion upon successfully finishing this course.'}
                      </p>
                    </div>
                  </div>
                </div>
              )}
            
            {/* location */}
              <div className="bg-white rounded-2xl p-8 shadow-lg">
                <h2 className="text-2xl font-bold text-[#4A3F35] mb-6 flex items-center gap-3">
                  <MapPin className="text-[#A67C52]" size={28} />
                  Location
                </h2>

                <div className="space-y-4">
                  <div>
                    <label className="text-sm text-[#2E2E2E]/70 mb-1 block">Historical Place</label>
                    <p className="text-xl font-bold text-[#4A3F35]">
                      {course.historicalPlace?.name}
                    </p>
                  </div>

                  <div>
                    <label className="text-sm text-[#2E2E2E]/70 mb-1 block">Address</label>
                    <p className="text-lg text-[#2E2E2E]/80">
                      {course.historicalPlace?.address}
                      {course.historicalPlace?.city && `, ${course.historicalPlace.city}`}
                    </p>
                  </div>

                  <div>
                    <label className="text-sm text-[#2E2E2E]/70 mb-1 block">Province</label>
                    <p className="text-lg font-semibold text-[#4A3F35]">
                      {course.province} Province
                    </p>
                  </div>
                </div>
              </div>
              {/* contact Info */}
              {course.contactPerson && (course.contactPerson.name || course.contactPerson.phone || course.contactPerson.email) && (
                <div className="bg-white rounded-2xl p-6 shadow-lg">
                  <h3 className="text-lg font-bold text-[#4A3F35] mb-4">Contact Information</h3>
                  <div className="space-y-3">
                    {course.contactPerson.name && (
                      <div className="flex items-center gap-3">
                        <User size={18} className="text-[#A67C52]" />
                        <span className="text-[#2E2E2E]/80">{course.contactPerson.name}</span>
                      </div>
                    )}
                    {course.contactPerson.phone && (
                      <a 
                        href={`tel:${course.contactPerson.phone}`}
                        className="flex items-center gap-3 hover:text-[#A67C52] transition-colors"
                      >
                        <Phone size={18} className="text-[#A67C52]" />
                        <span className="text-[#2E2E2E]/80">{course.contactPerson.phone}</span>
                      </a>
                    )}
                    {course.contactPerson.email && (
                      <a 
                        href={`mailto:${course.contactPerson.email}`}
                        className="flex items-center gap-3 hover:text-[#A67C52] transition-colors"
                      >
                        <Mail size={18} className="text-[#A67C52]" />
                        <span className="text-[#2E2E2E]/80 text-sm break-all">
                          {course.contactPerson.email}
                        </span>
                      </a>
                    )}
                    {course.contactPerson.whatsapp && (
                      <a 
                        href={`https://wa.me/${course.contactPerson.whatsapp.replace(/\D/g, '')}`}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="flex items-center gap-3 hover:text-[#8DAA91] transition-colors"
                      >
                        <MessageCircle size={18} className="text-[#8DAA91]" />
                        <span className="text-[#2E2E2E]/80">{course.contactPerson.whatsapp}</span>
                      </a>
                    )}
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>
      </section>
    </div>
  );
};

export default CourseDetail;