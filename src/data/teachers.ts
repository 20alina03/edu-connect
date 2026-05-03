export type Portal = "islamic" | "school";

export interface Teacher {
  id: string;
  name: string;
  initials: string;
  portal: Portal;
  tagline: string;
  subjects: string[];
  rate: number;
  rating: number;
  reviews: number;
  gender: "male" | "female";
  mode: "online" | "home_visit" | "both";
  city?: string;
  experience: number;
  bio: string;
  badges: string[];
  featured?: boolean;
}

export const teachers: Teacher[] = [
  {
    id: "ibrahim-khalil", name: "Ustadh Ibrahim Khalil", initials: "UI", portal: "islamic",
    tagline: "Tajweed & Hifz · Ijazah Hafs · 8 yrs · Online",
    subjects: ["Tajweed", "Hifz", "Quran"], rate: 18, rating: 4.9, reviews: 127,
    gender: "male", mode: "online", experience: 8,
    bio: "Certified Ijazah holder in Hafs recitation. I specialize in helping adults perfect their Tajweed and begin their Hifz journey with structured revision.",
    badges: ["Ijazah", "Adults", "Verified"], featured: true,
  },
  {
    id: "fatima-rashid", name: "Sister Fatima Al-Rashid", initials: "FA", portal: "islamic",
    tagline: "Female · Noorani Qaida + Tajweed · Kids · Online",
    subjects: ["Noorani Qaida", "Tajweed", "Quran"], rate: 15, rating: 5.0, reviews: 89,
    gender: "female", mode: "online", experience: 6,
    bio: "Patient and encouraging female teacher specialising in young learners. Noorani Qaida foundations through to fluent recitation.",
    badges: ["Female", "Kids", "Verified"],
  },
  {
    id: "noman-siddiqui", name: "Maulana Noman Siddiqui", initials: "MN", portal: "islamic",
    tagline: "Arabic · Islamic Studies · Al-Azhar grad · Online",
    subjects: ["Arabic", "Islamic Studies"], rate: 20, rating: 4.8, reviews: 64,
    gender: "male", mode: "online", experience: 10,
    bio: "Al-Azhar graduate with a decade teaching classical Arabic and Islamic studies for adult learners worldwide.",
    badges: ["Al-Azhar", "Arabic", "Verified"],
  },
  {
    id: "amina-siddiqui", name: "Dr. Amina Siddiqui", initials: "DA", portal: "school",
    tagline: "Maths & Science · PhD · GCSE + A-Level · Birmingham",
    subjects: ["Maths", "Physics", "Chemistry"], rate: 35, rating: 5.0, reviews: 89,
    gender: "female", mode: "both", city: "Birmingham", experience: 12,
    bio: "PhD physicist turned tutor. Proven track record getting students from grade 4s to 9s in GCSE and A* in A-Level.",
    badges: ["DBS", "PhD", "Home Visit"], featured: true,
  },
  {
    id: "hina-riaz", name: "Miss Hina Riaz", initials: "MH", portal: "school",
    tagline: "English & IELTS · 5 yrs · GCSE + IELTS · Manchester",
    subjects: ["English", "IELTS"], rate: 22, rating: 4.8, reviews: 203,
    gender: "female", mode: "online", city: "Manchester", experience: 5,
    bio: "Specialist English tutor for GCSE students and IELTS candidates. Clear, structured lessons with weekly progress feedback.",
    badges: ["DBS", "QTS"],
  },
  {
    id: "ahmed-khan", name: "Ahmed Khan", initials: "AK", portal: "school",
    tagline: "Biology & Chemistry · A-Level · London",
    subjects: ["Biology", "Chemistry"], rate: 28, rating: 4.7, reviews: 51,
    gender: "male", mode: "both", city: "London", experience: 7,
    bio: "Medical school applicant tutor. I focus on exam technique and the small things that move students from B to A*.",
    badges: ["DBS"],
  },
];

export const findTeacher = (id: string) => teachers.find(t => t.id === id);
