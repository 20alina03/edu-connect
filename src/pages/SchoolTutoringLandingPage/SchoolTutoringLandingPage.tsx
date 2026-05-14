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

  return (
    <div className="school-landing-page">
      <LandingPageNavbar baseRoute="/schooltutoringLandingPage" portalName="School Tutoring" />

      {/* Hero Section */}
      <section className="hero-section">
        <div className="max-w-7xl mx-auto px-4 py-20 relative z-10">
          <div className="text-center">
            <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full border border-blue-300/40 bg-blue-50/60 mb-6">
              <GraduationCap className="w-4 h-4 text-blue-600" />
              <span className="text-sm font-medium text-blue-700">School Tutoring Portal</span>
            </div>
            <h1 className="text-5xl md:text-6xl font-display font-extrabold mb-6 bg-gradient-to-r from-blue-700 via-blue-600 to-blue-700 bg-clip-text text-transparent">
              Excel in School with
              <br />
              Expert Tutors
            </h1>
            <p className="text-lg text-slate-600 max-w-2xl mx-auto mb-8 leading-relaxed">
              DBS-verified, degree-checked tutors for GCSE, A-Level, and primary subjects. Online tuition or home visits across the UK.
            </p>
            <Link
              to="/signup"
              className="inline-flex items-center gap-2 px-8 py-4 rounded-xl bg-gradient-to-r from-blue-600 to-blue-700 hover:from-blue-700 hover:to-blue-800 text-white font-semibold text-lg transition-all shadow-lg hover:shadow-blue-500/30 hover:shadow-2xl"
            >
              Book a Free Trial Lesson
            </Link>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mt-20">
            {[
              { number: "1,600+", label: "Verified School Tutors" },
              { number: "8,000+", label: "Active Students" },
              { number: "4.8★", label: "Average Rating" },
            ].map((stat) => (
              <div key={stat.label} className="bg-white/80 backdrop-blur-sm border border-blue-200/60 rounded-2xl p-8 text-center hover:shadow-lg hover:border-blue-300 transition-all">
                <div className="text-4xl font-bold bg-gradient-to-r from-blue-600 to-blue-500 bg-clip-text text-transparent">{stat.number}</div>
                <div className="text-sm text-slate-600 mt-3 font-medium">{stat.label}</div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Features Section */}
      <section className="features-section">
        <div className="max-w-7xl mx-auto px-4 py-20">
          <h2 className="text-4xl font-display font-bold text-center mb-4 text-slate-800">Academic Subjects & Levels</h2>
          <p className="text-center text-slate-600 mb-16 max-w-2xl mx-auto">
            Comprehensive tutoring across all school subjects and exam levels
          </p>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
            {[
              {
                icon: Ruler,
                title: "Maths",
                description: "Primary, GCSE, A-Level, Further Maths",
              },
              {
                icon: Flask,
                title: "Sciences",
                description: "Biology, Chemistry, Physics - all levels",
              },
              {
                icon: FileText,
                title: "English",
                description: "Language, Literature, IELTS, essays",
              },
              {
                icon: Globe,
                title: "Languages",
                description: "Spanish, French, German, Mandarin",
              },
              {
                icon: BookOpen,
                title: "History",
                description: "GCSE & A-Level History with exam experts",
              },
              {
                icon: MapPin,
                title: "Geography",
                description: "Physical & Human Geography tutoring",
              },
              {
                icon: Briefcase,
                title: "Business",
                description: "Economics & Business Studies",
              },
              {
                icon: Palette,
                title: "Creative Subjects",
                description: "Art, Music, Media & Design Technology",
              },
            ].map((feature) => (
              <div key={feature.title} className="bg-white rounded-2xl p-6 border-2 border-blue-100/60 hover:border-blue-300 transition-all group cursor-pointer">
                <div className="mb-4 group-hover:scale-110 transition-transform">
                  <feature.icon size={40} className="text-blue-600" weight="duotone" />
                </div>
                <h3 className="font-semibold text-lg text-slate-800 mb-2">{feature.title}</h3>
                <p className="text-sm text-slate-600">{feature.description}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Why Choose Us Section */}
      <section className="why-section">
        <div className="max-w-7xl mx-auto px-4 py-20">
          <h2 className="text-4xl font-display font-bold text-center mb-16 text-slate-800">Why Choose EduConnect School Tutoring?</h2>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
            {[
              {
                icon: Medal,
                title: "DBS Verified Tutors",
                description: "All tutors undergo comprehensive DBS (Disclosure & Barring Service) checks for safety",
              },
              {
                icon: CheckCircle,
                title: "Degree Verified",
                description: "Tutors' qualifications are verified before they can join our platform",
              },
              {
                icon: Users,
                title: "Flexible Learning",
                description: "Online tuition or in-home sessions - choose what works best for your family",
              },
              {
                icon: GraduationCap,
                title: "Exam Specialists",
                description: "Many tutors specialize in GCSE & A-Level exam preparation and revision",
              },
            ].map((feature) => (
              <div key={feature.title} className="flex gap-4 bg-white/80 backdrop-blur-sm border-2 border-blue-100/60 hover:border-blue-300 rounded-2xl p-6 transition-all">
                <feature.icon size={28} weight="duotone" className="text-blue-600 flex-shrink-0 mt-1" />
                <div>
                  <h3 className="font-semibold text-lg text-slate-800 mb-2">{feature.title}</h3>
                  <p className="text-slate-600">{feature.description}</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Top Teachers Section */}
      <section className="teachers-section">
        <div className="max-w-7xl mx-auto px-4 py-20">
          <h2 className="text-4xl font-display font-bold text-center mb-4 text-slate-800">Top Rated Tutors</h2>
          <p className="text-center text-slate-600 mb-16 max-w-2xl mx-auto">
            Our most highly-rated and most-booked tutors across all subjects
          </p>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            {teachers.map((teacher) => (
              <div key={teacher.id} className="bg-white rounded-2xl p-6 border-2 border-blue-100/60 hover:border-blue-300 transition-all group overflow-hidden">
                <div className="absolute inset-0 bg-gradient-to-br from-blue-50 to-transparent opacity-0 group-hover:opacity-100 transition-opacity pointer-events-none"></div>
                <div className="relative">
                  <div className="flex items-start justify-between mb-4">
                    <div className="text-5xl">{teacher.image}</div>
                    {teacher.verified && <CheckCircle size={20} weight="fill" className="text-blue-600" />}
                  </div>
                  <div className="mb-3">
                    <h3 className="font-semibold text-lg text-slate-800">{teacher.name}</h3>
                    <p className="text-sm text-slate-600">{teacher.specialty}</p>
                  </div>
                  <div className="inline-block px-3 py-1 rounded-full bg-blue-100 text-blue-700 text-xs font-semibold mb-4">
                    {teacher.badge}
                  </div>
                  <div className="flex items-center gap-2 mt-4 mb-4">
                    <div className="flex items-center gap-1">
                      {[...Array(5)].map((_, i) => (
                        <Star key={i} className="w-4 h-4 fill-amber-400 text-amber-400" />
                      ))}
                    </div>
                    <span className="text-sm font-semibold text-slate-800">{teacher.rating}</span>
                    <span className="text-sm text-slate-600">({teacher.reviews})</span>
                  </div>
                  <button className="w-full px-4 py-2 rounded-lg border-2 border-blue-600 text-blue-600 hover:bg-blue-50 transition font-medium text-sm">
                    View Profile
                  </button>
                </div>
              </div>
            ))}
          </div>

          <div className="text-center mt-12">
            <Link
              to="/school/teachers"
              className="inline-flex items-center gap-2 px-6 py-3 rounded-xl border-2 border-blue-600 text-blue-700 hover:bg-blue-50 transition font-medium"
            >
              Browse All Tutors
            </Link>
          </div>
        </div>
      </section>

      {/* Reviews Section */}
      <section className="reviews-section">
        <div className="max-w-7xl mx-auto px-4 py-20">
          <h2 className="text-4xl font-display font-bold text-center mb-4 text-slate-800">Student Success Stories</h2>
          <p className="text-center text-slate-600 mb-16 max-w-2xl mx-auto">
            See how our tutoring has helped students achieve their academic goals
          </p>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {reviews.map((review, idx) => (
              <div key={idx} className="bg-white rounded-2xl p-6 border-2 border-blue-100/60 hover:border-blue-300 transition-all">
                <div className="flex items-center gap-3 mb-4">
                  <div className="w-10 h-10 rounded-full bg-gradient-to-br from-blue-400 to-blue-600 flex items-center justify-center text-white font-semibold text-sm">
                    {review.name[0]}
                  </div>
                  <div>
                    <h4 className="font-semibold text-slate-800">{review.name}</h4>
                    <p className="text-xs text-slate-600">{review.role}</p>
                  </div>
                </div>
                <div className="flex gap-1 mb-3">
                  {[...Array(review.rating)].map((_, i) => (
                    <Star key={i} className="w-4 h-4 fill-amber-400 text-amber-400" />
                  ))}
                </div>
                <p className="text-slate-700 italic leading-relaxed">"{review.text}"</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* How It Works Section */}
      <section className="bg-gradient-to-r from-blue-500/10 to-blue-400/5 border-t border-b border-border">
        <div className="max-w-7xl mx-auto px-4 py-20">
          <h2 className="text-4xl font-display font-bold text-center mb-12">How It Works</h2>

          <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
            {[
              { step: 1, title: "Sign Up", desc: "Create your account in minutes" },
              { step: 2, title: "Browse", desc: "Find the perfect tutor for your needs" },
              { step: 3, title: "Book", desc: "Schedule your first lesson" },
              { step: 4, title: "Learn", desc: "Start achieving your goals" },
            ].map((item) => (
              <div key={item.step} className="relative">
                <div className="bg-card border border-border rounded-lg p-6 text-center h-full">
                  <div className="inline-flex items-center justify-center w-12 h-12 rounded-full bg-blue-400/20 text-blue-400 font-bold mb-4">
                    {item.step}
                  </div>
                  <h3 className="font-semibold mb-2">{item.title}</h3>
                  <p className="text-sm text-muted-foreground">{item.desc}</p>
                </div>
                {item.step < 4 && (
                  <div className="hidden md:block absolute top-1/2 -right-2 transform -translate-y-1/2">
                    <div className="text-blue-400/30 text-2xl">→</div>
                  </div>
                )}
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="cta-section">
        <div className="max-w-4xl mx-auto px-4 py-20 text-center">
          <h2 className="text-4xl font-display font-bold mb-4">
            Get Expert Tutoring Today
          </h2>
          <p className="text-lg mb-8 text-white/90">
            Start with a free trial lesson and see the difference expert tutoring makes
          </p>
          <Link
            to="/signup"
            className="inline-flex items-center gap-2 px-8 py-4 rounded-xl bg-white text-blue-700 hover:bg-blue-50 font-semibold text-lg transition-all shadow-lg hover:shadow-2xl"
          >
            Book Your Free Trial
          </Link>
        </div>
      </section>

      {/* Footer */}
      <footer className="py-8">
        <div className="max-w-7xl mx-auto px-4 text-center">
          <p className="text-slate-600">&copy; 2026 EduConnect. All rights reserved.</p>
        </div>
      </footer>
    </div>
  );
};

export default SchoolTutoringLandingPage;