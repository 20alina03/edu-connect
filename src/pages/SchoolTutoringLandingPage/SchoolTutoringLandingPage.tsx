import { Link } from "react-router-dom";
import { Star, Users, CheckCircle, Medal, FileText, Globe, BookOpen, MapPin, Briefcase, Palette, Ruler, Flask, GraduationCap } from "@phosphor-icons/react";
import { LandingPageNavbar } from "@/components/LandingPageNavbar/LandingPageNavbar";
import "./school-landing.css";

const SchoolTutoringLandingPage = () => {
  const teachers = [
    {
      id: 1,
      name: "Dr. Sarah Thompson",
      specialty: "GCSE Maths & Further Maths",
      rating: 4.95,
      reviews: 412,
      image: "👩‍🏫",
      verified: true,
      badge: "Top Rated",
    },
    {
      id: 2,
      name: "Mr. James Wilson",
      specialty: "A-Level Physics & Chemistry",
      rating: 4.92,
      reviews: 358,
      image: "👨‍🏫",
      verified: true,
      badge: "DBS Verified",
    },
    {
      id: 3,
      name: "Ms. Emily Rodriguez",
      specialty: "English Literature & Language",
      rating: 4.9,
      reviews: 294,
      image: "👩‍🏫",
      verified: true,
      badge: "Degree Verified",
    },
  ];

  const reviews = [
    {
      name: "Michael Johnson",
      role: "Parent",
      text: "My son improved from a C to an A* in GCSE Maths within 6 months. The tutor was incredibly patient and broke down complex topics perfectly.",
      rating: 5,
    },
    {
      name: "Emma Davies",
      role: "Student",
      text: "I was struggling with Physics but my tutor made it so understandable. I'm now confident in the subject and expecting a 7-8 grade!",
      rating: 5,
    },
    {
      name: "Robert Smith",
      role: "Parent",
      text: "Professional, reliable, and our daughter's grades have improved significantly. Highly recommended for any parent seeking tutoring!",
      rating: 5,
    },
    {
      name: "Sophie Chen",
      role: "Student",
      text: "The tutor customized the lessons to my learning style. I went from struggling to actually enjoying English. Fantastic experience!",
      rating: 5,
    },
  ];

  const handleFeatureMouseEnter = (e: React.MouseEvent<HTMLDivElement>) => {
    const target = e.currentTarget;
    target.style.borderColor = "hsl(213 70% 16% / 0.35)";
    target.style.transform = "translateY(-4px) scale(1.02)";
    target.style.boxShadow =
      "0 20px 40px hsl(213 70% 16% / 0.15), 0 0 0 1px hsl(213 70% 16% / 0.08)";
    const iconEl = target.querySelector(".feature-icon") as HTMLElement | null;
    if (iconEl) iconEl.style.transform = "scale(1.15) translateY(-2px)";
  };

  const handleFeatureMouseLeave = (e: React.MouseEvent<HTMLDivElement>) => {
    const target = e.currentTarget;
    target.style.borderColor = "hsl(213 70% 16% / 0.12)";
    target.style.transform = "translateY(0) scale(1)";
    target.style.boxShadow = "0 4px 16px hsl(213 70% 16% / 0.06)";
    const iconEl = target.querySelector(".feature-icon") as HTMLElement | null;
    if (iconEl) iconEl.style.transform = "scale(1) translateY(0)";
  };

  const handleWhyMouseEnter = (e: React.MouseEvent<HTMLDivElement>) => {
    const target = e.currentTarget;
    target.style.borderColor = "hsl(213 70% 16% / 0.35)";
    target.style.transform = "translateY(-3px)";
    target.style.boxShadow = "0 16px 32px hsl(213 70% 16% / 0.12)";
  };

  const handleWhyMouseLeave = (e: React.MouseEvent<HTMLDivElement>) => {
    const target = e.currentTarget;
    target.style.borderColor = "hsl(213 70% 16% / 0.12)";
    target.style.transform = "translateY(0)";
    target.style.boxShadow = "0 4px 16px hsl(213 70% 16% / 0.06)";
  };

  const handleTeacherMouseEnter = (e: React.MouseEvent<HTMLDivElement>) => {
    const target = e.currentTarget;
    target.style.borderColor = "hsl(213 70% 16% / 0.4)";
    target.style.boxShadow =
      "0 24px 48px hsl(213 70% 16% / 0.18), 0 8px 16px hsl(213 70% 16% / 0.1)";
    target.style.transform = "translateY(-6px)";
  };

  const handleTeacherMouseLeave = (e: React.MouseEvent<HTMLDivElement>) => {
    const target = e.currentTarget;
    target.style.borderColor = "hsl(213 70% 16% / 0.12)";
    target.style.boxShadow = "0 4px 16px hsl(213 70% 16% / 0.06)";
    target.style.transform = "translateY(0)";
  };

  return (
    <div className="school-landing-page">
      <LandingPageNavbar baseRoute="/schooltutoringLandingPage" portalName="School Tutoring" />

      {/* Hero Section */}
      <section className="hero-section">
        {/* 3D Floating Background Elements */}
        <div className="floating-orb orb-1" />
        <div className="floating-orb orb-2" />
        <div className="floating-orb orb-3" />
        <div className="floating-orb orb-4" />
        <div className="geometric-shape shape-1" />
        <div className="geometric-shape shape-2" />
        <div className="geometric-shape shape-3" />

        <div className="max-w-7xl mx-auto px-3 sm:px-4 lg:px-6 py-12 sm:py-16 lg:py-20 relative z-10">
          <div className="text-center">
            <div
              className="inline-flex items-center gap-1.5 sm:gap-2 px-3 sm:px-4 py-1.5 sm:py-2 rounded-full text-[9px] sm:text-[10px]"
              style={{
                border: "1px solid hsl(213 70% 16% / 0.2)",
                backgroundColor: "hsl(213 70% 16% / 0.08)",
                transform: "none",
                transition: "none",
                animation: "none",
              }}
            >
              <GraduationCap className="w-3.5 sm:w-4 h-3.5 sm:h-4" style={{ color: "hsl(213 70% 16%)" }} />
              <span className="font-medium" style={{ color: "hsl(213 70% 16%)" }}>
                School Tutoring Portal
              </span>
            </div>
            <h1
              className="text-3xl sm:text-4xl md:text-5xl lg:text-6xl font-display font-extrabold mb-4 sm:mb-5 lg:mb-6 hero-title mt-3 sm:mt-4"
              style={{
                background:
                  "linear-gradient(to right, hsl(213 70% 16%), hsl(213 70% 22%), hsl(213 70% 16%))",
                WebkitBackgroundClip: "text",
                WebkitTextFillColor: "transparent",
                backgroundClip: "text",
              }}
            >
              Excel in School with
              <br />
              Expert Tutors
            </h1>
            <p className="text-xs sm:text-sm lg:text-base text-slate-600 max-w-2xl mx-auto mb-6 sm:mb-7 lg:mb-8 leading-relaxed">
              DBS-verified, degree-checked tutors for GCSE, A-Level, and primary subjects. Online
              tuition or home visits across the UK.
            </p>
            <Link
              to="/signup"
              className="inline-flex items-center gap-2 px-6 sm:px-8 py-2.5 sm:py-4 rounded-lg sm:rounded-xl text-white font-semibold text-sm sm:text-base lg:text-lg transition-all shadow-lg cta-button"
              style={{
                background:
                  "linear-gradient(135deg, hsl(213 70% 16%), hsl(213 70% 24%))",
                boxShadow:
                  "0 4px 15px hsl(213 70% 16% / 0.3), 0 1px 3px hsl(213 70% 16% / 0.2), inset 0 1px 0 rgba(255,255,255,0.1)",
              }}
              onMouseEnter={(e) => {
                e.currentTarget.style.boxShadow =
                  "0 8px 30px hsl(213 70% 16% / 0.45), 0 4px 12px hsl(213 70% 16% / 0.25), inset 0 1px 0 rgba(255,255,255,0.15)";
                e.currentTarget.style.transform = "translateY(-2px)";
              }}
              onMouseLeave={(e) => {
                e.currentTarget.style.boxShadow =
                  "0 4px 15px hsl(213 70% 16% / 0.3), 0 1px 3px hsl(213 70% 16% / 0.2), inset 0 1px 0 rgba(255,255,255,0.1)";
                e.currentTarget.style.transform = "translateY(0)";
              }}
            >
              Book a Free Trial Lesson
            </Link>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3 sm:gap-4 lg:gap-6 mt-10 sm:mt-14 lg:mt-20">
            {[
              { number: "1,600+", label: "Verified School Tutors" },
              { number: "8,000+", label: "Active Students" },
              { number: "4.8★", label: "Average Rating" },
            ].map((stat) => (
              <div
                key={stat.label}
                className="stat-card backdrop-blur-sm rounded-lg sm:rounded-2xl p-4 sm:p-6 lg:p-8 text-center transition-all"
                style={{
                  border: "1px solid hsl(213 70% 16% / 0.12)",
                  background:
                    "linear-gradient(145deg, rgba(255,255,255,0.9), rgba(255,255,255,0.75))",
                  boxShadow:
                    "0 8px 32px hsl(213 70% 16% / 0.08), 0 2px 8px hsl(213 70% 16% / 0.05), inset 0 1px 0 rgba(255,255,255,0.8)",
                }}
              >
                <div
                  className="text-2xl sm:text-3xl lg:text-4xl font-bold"
                  style={{
                    background:
                      "linear-gradient(to right, hsl(213 70% 16%), hsl(213 70% 24%))",
                    WebkitBackgroundClip: "text",
                    WebkitTextFillColor: "transparent",
                    backgroundClip: "text",
                  }}
                >
                  {stat.number}
                </div>
                <div className="text-xs sm:text-sm lg:text-base text-slate-600 mt-2 sm:mt-3 font-medium">{stat.label}</div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Features Section */}
      <section className="features-section relative overflow-hidden">
        <div className="floating-orb orb-5" />
        <div className="floating-orb orb-6" />
        <div className="max-w-7xl mx-auto px-3 sm:px-4 lg:px-6 py-12 sm:py-16 lg:py-20 relative z-10">
          <h2 className="text-2xl sm:text-3xl lg:text-4xl font-display font-bold text-center mb-2 sm:mb-3 lg:mb-4 text-slate-800">
            Academic Subjects & Levels
          </h2>
          <p className="text-center text-xs sm:text-sm lg:text-base text-slate-600 mb-10 sm:mb-12 lg:mb-16 max-w-2xl mx-auto">
            Comprehensive tutoring across all school subjects and exam levels
          </p>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3 sm:gap-4 lg:gap-6">
            {[
              { icon: Ruler,    title: "Maths",             description: "Primary, GCSE, A-Level, Further Maths" },
              { icon: Flask,    title: "Sciences",           description: "Biology, Chemistry, Physics - all levels" },
              { icon: FileText, title: "English",            description: "Language, Literature, IELTS, essays" },
              { icon: Globe,    title: "Languages",          description: "Spanish, French, German, Mandarin" },
              { icon: BookOpen, title: "History",            description: "GCSE & A-Level History with exam experts" },
              { icon: MapPin,   title: "Geography",          description: "Physical & Human Geography tutoring" },
              { icon: Briefcase,title: "Business",           description: "Economics & Business Studies" },
              { icon: Palette,  title: "Creative Subjects",  description: "Art, Music, Media & Design Technology" },
            ].map((feature) => (
              <div
                key={feature.title}
                className="feature-card rounded-lg sm:rounded-2xl p-4 sm:p-5 lg:p-6 cursor-pointer"
                style={{
                  border: "2px solid hsl(213 70% 16% / 0.12)",
                  background: "transparent",
                  transition: "all 0.3s cubic-bezier(0.34, 1.56, 0.64, 1)",
                  boxShadow: "0 4px 16px hsl(213 70% 16% / 0.06)",
                }}
                onMouseEnter={handleFeatureMouseEnter}
                onMouseLeave={handleFeatureMouseLeave}
              >
                <div
                  className="feature-icon mb-3 sm:mb-4"
                  style={{ transition: "transform 0.3s cubic-bezier(0.34, 1.56, 0.64, 1)" }}
                >
                  <feature.icon
                    size={32}
                    className="sm:w-10 sm:h-10"
                    style={{ color: "hsl(213 70% 16%)" }}
                    weight="duotone"
                  />
                </div>
                <h3 className="font-semibold text-base sm:text-lg lg:text-xl text-slate-800 mb-1 sm:mb-2">{feature.title}</h3>
                <p className="text-xs sm:text-sm lg:text-base text-slate-600">{feature.description}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Why Choose Us Section */}
      <section className="why-section relative overflow-hidden">
        <div className="floating-orb orb-7" />
        <div className="geometric-shape shape-4" />
        <div className="max-w-7xl mx-auto px-3 sm:px-4 lg:px-6 py-12 sm:py-16 lg:py-20 relative z-10">
          <h2 className="text-2xl sm:text-3xl lg:text-4xl font-display font-bold text-center mb-10 sm:mb-12 lg:mb-16 text-slate-800">
            Why Choose EduConnect School Tutoring?
          </h2>

          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 sm:gap-7 lg:gap-8">
            {[
              {
                icon: Medal,
                title: "DBS Verified Tutors",
                description:
                  "All tutors undergo comprehensive DBS (Disclosure & Barring Service) checks for safety",
              },
              {
                icon: CheckCircle,
                title: "Degree Verified",
                description:
                  "Tutors' qualifications are verified before they can join our platform",
              },
              {
                icon: Users,
                title: "Flexible Learning",
                description:
                  "Online tuition or in-home sessions - choose what works best for your family",
              },
              {
                icon: GraduationCap,
                title: "Exam Specialists",
                description:
                  "Many tutors specialize in GCSE & A-Level exam preparation and revision",
              },
            ].map((feature) => (
              <div
                key={feature.title}
                className="why-card flex gap-4 rounded-2xl p-6"
                style={{
                  background: "white",
                  border: "1px solid hsl(213 70% 16% / 0.1)",
                  transition: "all 0.3s cubic-bezier(0.34, 1.56, 0.64, 1)",
                  boxShadow: "0 4px 16px hsl(213 70% 16% / 0.06)",
                }}
                onMouseEnter={handleWhyMouseEnter}
                onMouseLeave={handleWhyMouseLeave}
              >
                <feature.icon
                  size={28}
                  weight="duotone"
                  style={{
                    color: "hsl(213 70% 16%)",
                    flexShrink: 0,
                    marginTop: "0.25rem",
                  }}
                />
                <div>
                  <h3 className="font-semibold text-lg text-slate-800 mb-2">
                    {feature.title}
                  </h3>
                  <p className="text-slate-600">{feature.description}</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Top Teachers Section */}
<section className="teachers-section relative overflow-hidden">
  <div className="floating-orb orb-8" />

  <div className="max-w-7xl mx-auto px-3 sm:px-4 lg:px-6 py-12 sm:py-16 lg:py-20 relative z-10">
    <h2 className="text-2xl sm:text-3xl lg:text-4xl font-display font-bold text-center mb-2 sm:mb-3 lg:mb-4 text-slate-800">
      Top Rated Tutors
    </h2>

    <p className="text-center text-xs sm:text-sm lg:text-base text-slate-600 mb-10 sm:mb-12 lg:mb-16 max-w-2xl mx-auto">
      Our most highly-rated and most-booked tutors across all subjects
    </p>

    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 sm:gap-6 lg:gap-8 place-items-center">
      {teachers.map((teacher) => (
        <div
          key={teacher.id}
          className="teacher-card bg-white rounded-lg sm:rounded-xl lg:rounded-2xl p-3 sm:p-4 lg:p-5 overflow-hidden relative w-full max-w-[280px] sm:max-w-[300px]"
          style={{
            border: "2px solid hsl(213 70% 16% / 0.12)",
            transition: "all 0.35s cubic-bezier(0.34, 1.56, 0.64, 1)",
            boxShadow: "0 4px 16px hsl(213 70% 16% / 0.06)",
          }}
          onMouseEnter={handleTeacherMouseEnter}
          onMouseLeave={handleTeacherMouseLeave}
        >
          {/* Background Glow */}
          <div
            className="absolute inset-0 pointer-events-none"
            style={{
              background:
                "linear-gradient(135deg, hsl(213 70% 16% / 0.04), transparent 60%)",
            }}
          />

          <div className="relative">
            {/* Top Row */}
            <div className="flex items-start justify-between mb-3 sm:mb-4">
              <div className="text-3xl sm:text-4xl lg:text-5xl">{teacher.image}</div>

              {teacher.verified && (
                <CheckCircle
                  size={18}
                  className="sm:w-5 sm:h-5"
                  weight="fill"
                  style={{ color: "hsl(213 70% 16%)" }}
                />
              )}
            </div>

            {/* Tutor Info */}
            <div className="mb-3 sm:mb-4">
              <h3 className="font-semibold text-base sm:text-lg lg:text-xl text-slate-800 mb-0.5 sm:mb-1">
                {teacher.name}
              </h3>

              <p className="text-xs sm:text-sm text-slate-600 leading-relaxed">
                {teacher.specialty}
              </p>
            </div>

            {/* Badge */}
            <div
              className="teacher-badge inline-flex items-center px-4 py-1 rounded-full text-xs font-semibold mb-5"
              style={{
                backgroundColor: "hsl(213 70% 16% / 0.1)",
                color: "hsl(213 70% 16%)",
                transform: "none",
              }}
            >
              {teacher.badge}
            </div>

            {/* Ratings */}
            <div className="flex items-center gap-2 mb-6">
              <div className="flex items-center gap-1">
                {[...Array(5)].map((_, i) => (
                  <Star
                    key={i}
                    className="w-4 h-4 fill-amber-400 text-amber-400"
                  />
                ))}
              </div>

              <span className="text-sm font-semibold text-slate-800">
                {teacher.rating}
              </span>

              <span className="text-sm text-slate-600">
                ({teacher.reviews})
              </span>
            </div>

            {/* Button */}
            <button
              className="mx-auto flex justify-center items-center w-[85%] px-4 py-3 rounded-xl font-medium text-sm"
              style={{
                border: "2px solid hsl(213 70% 16%)",
                color: "hsl(213 70% 16%)",
                backgroundColor: "transparent",
                transition: "all 0.2s ease",
              }}
              onMouseEnter={(e) => {
                e.currentTarget.style.backgroundColor = "hsl(213 70% 16%)";
                e.currentTarget.style.color = "white";
              }}
              onMouseLeave={(e) => {
                e.currentTarget.style.backgroundColor = "transparent";
                e.currentTarget.style.color = "hsl(213 70% 16%)";
              }}
            >
              View Profile
            </button>
          </div>
        </div>
      ))}
    </div>

    {/* Browse Button */}
    <div className="text-center mt-14">
      <Link
        to="/school/teachers"
        className="inline-flex items-center gap-2 px-6 py-3 rounded-xl font-medium"
        style={{
          border: "2px solid hsl(213 70% 16%)",
          color: "hsl(213 70% 16%)",
          backgroundColor: "transparent",
          transition: "all 0.2s ease",
        }}
        onMouseEnter={(e) => {
          e.currentTarget.style.backgroundColor = "hsl(213 70% 16%)";
          e.currentTarget.style.color = "white";
        }}
        onMouseLeave={(e) => {
          e.currentTarget.style.backgroundColor = "transparent";
          e.currentTarget.style.color = "hsl(213 70% 16%)";
        }}
      >
        Browse All Tutors
      </Link>
    </div>
  </div>
</section>

      {/* Reviews Section */}
      <section className="reviews-section">
        <div className="max-w-7xl mx-auto px-3 sm:px-4 lg:px-6 py-12 sm:py-16 lg:py-20">
          <h2 className="text-2xl sm:text-3xl lg:text-4xl font-display font-bold text-center mb-2 sm:mb-3 lg:mb-4 text-slate-800">
            Student Success Stories
          </h2>
          <p className="text-center text-xs sm:text-sm lg:text-base text-slate-600 mb-10 sm:mb-12 lg:mb-16 max-w-2xl mx-auto">
            See how our tutoring has helped students achieve their academic goals
          </p>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 sm:gap-5 lg:gap-6">
            {reviews.map((review, idx) => (
              <div
                key={idx}
                className="rounded-lg sm:rounded-xl lg:rounded-2xl p-4 sm:p-5 lg:p-6 transition-all"
                style={{
                  background: "white",
                  border: "2px solid hsl(213 70% 16% / 0.08)",
                  boxShadow:
                    "0 4px 20px hsl(213 70% 16% / 0.06), inset 0 1px 0 rgba(255,255,255,0.8)",
                }}
              >
                <div className="flex items-center gap-2 sm:gap-3 mb-3 sm:mb-4">
                  <div
                    className="w-8 sm:w-10 h-8 sm:h-10 rounded-full flex items-center justify-center text-white font-semibold text-xs sm:text-sm"
                    style={{
                      background:
                        "linear-gradient(135deg, hsl(213 70% 16%), hsl(213 70% 28%))",
                      boxShadow: "0 4px 12px hsl(213 70% 16% / 0.3)",
                    }}
                  >
                    {review.name[0]}
                  </div>
                  <div>
                    <h4 className="font-semibold text-sm sm:text-base text-slate-800">{review.name}</h4>
                    <p className="text-[10px] sm:text-xs text-slate-600">{review.role}</p>
                  </div>
                </div>
                <div className="flex gap-1 mb-2 sm:mb-3">
                  {[...Array(review.rating)].map((_, i) => (
                    <Star key={i} className="w-3 sm:w-4 h-3 sm:h-4 fill-amber-400 text-amber-400" />
                  ))}
                </div>
                <p className="text-xs sm:text-sm lg:text-base text-slate-700 italic leading-relaxed">"{review.text}"</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* How It Works Section */}
      <section className="how-section relative overflow-hidden">
        <div className="floating-orb orb-how-1" />
        <div className="max-w-7xl mx-auto px-3 sm:px-4 lg:px-6 py-12 sm:py-16 lg:py-20 relative z-10">
          <h2 className="text-2xl sm:text-3xl lg:text-4xl font-display font-bold text-center mb-8 sm:mb-10 lg:mb-12 text-slate-800">
            How It Works
          </h2>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3 sm:gap-4 lg:gap-6">
            {[
              { step: 1, title: "Sign Up",  desc: "Create your account in minutes" },
              { step: 2, title: "Browse",   desc: "Find the perfect tutor for your needs" },
              { step: 3, title: "Book",     desc: "Schedule your first lesson" },
              { step: 4, title: "Learn",    desc: "Start achieving your goals" },
            ].map((item) => (
              <div key={item.step} className="relative">
                <div
                  className="how-step-card rounded-lg sm:rounded-xl lg:rounded-2xl p-4 sm:p-5 lg:p-6 text-center h-full"
                  style={{
                    border: "2px solid hsl(213 70% 16% / 0.1)",
                    background: "transparent",
                    transition: "all 0.3s ease",
                  }}
                  onMouseEnter={(e) => {
                    e.currentTarget.style.borderColor = "hsl(213 70% 16% / 0.3)";
                    e.currentTarget.style.transform = "translateY(-4px)";
                    e.currentTarget.style.boxShadow =
                      "0 16px 32px hsl(213 70% 16% / 0.1)";
                  }}
                  onMouseLeave={(e) => {
                    e.currentTarget.style.borderColor = "hsl(213 70% 16% / 0.1)";
                    e.currentTarget.style.transform = "translateY(0)";
                    e.currentTarget.style.boxShadow = "none";
                  }}
                >
                  <div
                    className="inline-flex items-center justify-center w-10 sm:w-12 h-10 sm:h-12 rounded-full font-bold mb-3 sm:mb-4 text-sm sm:text-base"
                    style={{
                      backgroundColor: "hsl(213 70% 16% / 0.12)",
                      color: "hsl(213 70% 16%)",
                    }}
                  >
                    {item.step}
                  </div>
                  <h3 className="font-semibold mb-2 text-slate-800 text-sm sm:text-base lg:text-lg">{item.title}</h3>
                  <p className="text-xs sm:text-sm lg:text-base text-slate-600 leading-relaxed">{item.desc}</p>
                </div>
                {item.step < 4 && (
                  <div className="hidden md:block absolute top-1/2 -right-2 transform -translate-y-1/2 z-10">
                    <div className="text-xl sm:text-2xl lg:text-3xl" style={{ color: "hsl(213 70% 16% / 0.25)" }}>
                      →
                    </div>
                  </div>
                )}
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="cta-section relative overflow-hidden">
        <div className="floating-orb orb-cta-1" />
        <div className="floating-orb orb-cta-2" />
        <div className="max-w-4xl mx-auto px-3 sm:px-4 lg:px-6 py-12 sm:py-16 lg:py-20 text-center relative z-10">
          <h2 className="text-2xl sm:text-3xl lg:text-4xl font-display font-bold mb-3 sm:mb-4 lg:mb-6">Get Expert Tutoring Today</h2>
          <p className="text-sm sm:text-base lg:text-lg mb-6 sm:mb-8 lg:mb-10 text-white/90 max-w-2xl mx-auto leading-relaxed">
            Start with a free trial lesson and see the difference expert tutoring makes
          </p>
          <Link
            to="/signup"
            className="inline-flex items-center gap-2 px-6 sm:px-8 py-2.5 sm:py-4 rounded-lg sm:rounded-xl font-semibold text-sm sm:text-base lg:text-lg transition-all shadow-lg"
            style={{
              backgroundColor: "white",
              color: "hsl(213 70% 16%)",
              boxShadow:
                "0 8px 24px rgba(0,0,0,0.15), inset 0 1px 0 rgba(255,255,255,0.9)",
              transition: "all 0.25s ease",
            }}
            onMouseEnter={(e) => {
              e.currentTarget.style.transform = "translateY(-2px)";
              e.currentTarget.style.boxShadow =
                "0 16px 36px rgba(0,0,0,0.2), inset 0 1px 0 rgba(255,255,255,0.9)";
            }}
            onMouseLeave={(e) => {
              e.currentTarget.style.transform = "translateY(0)";
              e.currentTarget.style.boxShadow =
                "0 8px 24px rgba(0,0,0,0.15), inset 0 1px 0 rgba(255,255,255,0.9)";
            }}
          >
            Book Your Free Trial
          </Link>
        </div>
      </section>

      {/* Footer */}
      <footer className="py-6 sm:py-8 lg:py-10">
        <div className="max-w-7xl mx-auto px-3 sm:px-4 lg:px-6 text-center">
          <p className="text-xs sm:text-sm text-slate-600">&copy; 2026 EduConnect. All rights reserved.</p>
        </div>
      </footer>
    </div>
  );
};

export default SchoolTutoringLandingPage;