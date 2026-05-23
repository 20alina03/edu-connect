import 'dotenv/config';
import { createClient } from '@supabase/supabase-js';

const url = process.env.SUPABASE_URL;
const serviceKey = process.env.SUPABASE_SERVICE_ROLE_KEY;
if (!url || !serviceKey) {
  console.error('Missing SUPABASE_URL or SUPABASE_SERVICE_ROLE_KEY in environment.');
  process.exit(1);
}

const supabase = createClient(url, serviceKey, {
  auth: { persistSession: false, autoRefreshToken: false }
});

const SHARED_PASSWORD = 'PakTeacherPassword2026!';

const teachersToSeed = [
  // === ISLAMIC SUBJECTS TEACHERS ===
  {
    email: 'tariq.jameel@educonnect.pk',
    fullName: 'Maulana Tariq Jameel',
    portal: 'islamic',
    gender: 'male',
    city: 'Lahore',
    subjects: ['Tajweed', 'Quran', 'Islamic Studies'],
    quranLevel: 'Tafseer & Tajweed Specialist',
    hourlyRate: 15,
    experienceYears: 15,
    education: ['Shahadat-ul-Alamiya (Jamia Ashrafia, Lahore)', 'MA in Islamic Studies (Punjab University)'],
    bio: 'Highly experienced Islamic scholar specializing in advanced Tajweed, Quran recitation, and Tafseer. Dedicated to teaching learners of all levels with patience and wisdom.',
    languages: ['Urdu', 'Arabic', 'Punjabi', 'English']
  },
  {
    email: 'aisha.bibi@educonnect.pk',
    fullName: 'Sister Aisha Bibi',
    portal: 'islamic',
    gender: 'female',
    city: 'Karachi',
    subjects: ['Noorani Qaida', 'Tajweed', 'Quran'],
    quranLevel: 'Hafiza & Noorani Qaida expert',
    hourlyRate: 12,
    experienceYears: 8,
    education: ['Hafiza-e-Quran Sanad (Jamia Binoria, Karachi)', 'B.Ed in Islamic Education'],
    bio: 'Patient and encouraging female teacher specializing in young learners and beginners. Focuses on building correct pronunciation foundations using Noorani Qaida.',
    languages: ['Urdu', 'English', 'Sindhi']
  },
  {
    email: 'muhammad.ali@educonnect.pk',
    fullName: 'Ustadh Muhammad Ali',
    portal: 'islamic',
    gender: 'male',
    city: 'Rawalpindi',
    subjects: ['Hifz', 'Quran', 'Tajweed'],
    quranLevel: 'Ijazah Holder / Qari',
    hourlyRate: 14,
    experienceYears: 10,
    education: ['Sanad in Hifz and Tajweed (Wifaqul Madaris)', 'BS in Islamic Theology'],
    bio: 'Certified Quran tutor with an Ijazah in Hafs recitation. I specialize in structured Hifz programs and revision strategies for children and adults.',
    languages: ['Urdu', 'English', 'Pashto']
  },
  {
    email: 'fatima.zahra@educonnect.pk',
    fullName: 'Sister Fatima Zahra',
    portal: 'islamic',
    gender: 'female',
    city: 'Islamabad',
    subjects: ['Noorani Qaida', 'Tajweed', 'Islamic Studies'],
    quranLevel: 'Tajweed Specialist',
    hourlyRate: 13,
    experienceYears: 7,
    education: ['Tajweed Certification (Minhaj-ul-Quran University)', 'MA in Arabic Literature'],
    bio: 'Dedicated female instructor focusing on Tajweed rules and basic Islamic ethics. Friendly atmosphere for ladies and kids.',
    languages: ['Urdu', 'English']
  },
  {
    email: 'bilal.ahmed@educonnect.pk',
    fullName: 'Ustadh Bilal Ahmed',
    portal: 'islamic',
    gender: 'male',
    city: 'Peshawar',
    subjects: ['Arabic', 'Islamic Studies', 'Quran'],
    quranLevel: 'Classical Arabic Tutor',
    hourlyRate: 16,
    experienceYears: 12,
    education: ['BS in Islamic Studies (International Islamic University, Islamabad)', 'Arabic Language Diploma'],
    bio: 'Alumnus of IIUI with over 12 years of experience teaching Arabic Grammar, Fiqh, and classical Islamic history to global students.',
    languages: ['Urdu', 'Arabic', 'Pashto', 'English']
  },

  // === SCHOOL SUBJECTS TEACHERS ===
  {
    email: 'sarah.khan@educonnect.pk',
    fullName: 'Dr. Sarah Khan',
    portal: 'school',
    gender: 'female',
    city: 'Islamabad',
    subjects: ['Maths', 'Physics'],
    quranLevel: null,
    hourlyRate: 25,
    experienceYears: 11,
    education: ['PhD in Physics (NUST, Islamabad)', 'MS in Applied Mathematics (NUST)'],
    bio: 'PhD Physicist and veteran tutor. Expert in O/A Levels, GCSE, and F.Sc physics & math syllabus. Guaranteed grade improvements through analytical methods.',
    languages: ['Urdu', 'English']
  },
  {
    email: 'kamran.akram@educonnect.pk',
    fullName: 'Professor Kamran Akram',
    portal: 'school',
    gender: 'male',
    city: 'Karachi',
    subjects: ['Chemistry', 'Biology'],
    quranLevel: null,
    hourlyRate: 22,
    experienceYears: 14,
    education: ['MS in Biochemistry (Quaid-e-Azam University, Islamabad)', 'BS in Chemistry (Punjab University)'],
    bio: 'Senior college lecturer with 14+ years of chemistry and biology teaching experience. I focus on simplifying complex molecular and metabolic mechanisms.',
    languages: ['Urdu', 'English', 'Punjabi']
  },
  {
    email: 'hina.butt@educonnect.pk',
    fullName: 'Miss Hina Butt',
    portal: 'school',
    gender: 'female',
    city: 'Lahore',
    subjects: ['English', 'IELTS'],
    quranLevel: null,
    hourlyRate: 20,
    experienceYears: 6,
    education: ['M.Phil in English Literature (Punjab University, Lahore)', 'IELTS Certified (8.5 Band)'],
    bio: 'Professional IELTS preparation coach and English communication instructor. Helping students hit their target bands and perfect their academic writing.',
    languages: ['Urdu', 'English']
  },
  {
    email: 'zain.raza@educonnect.pk',
    fullName: 'Mr. Zain Raza',
    portal: 'school',
    gender: 'male',
    city: 'Faisalabad',
    subjects: ['Computer Science'],
    quranLevel: null,
    hourlyRate: 18,
    experienceYears: 5,
    education: ['BS in Software Engineering (FAST-NUCES, Lahore)'],
    bio: 'Full-stack software engineer and passionate computer science tutor. Specializing in Python, JavaScript, data structures, and AP Computer Science curricula.',
    languages: ['Urdu', 'English', 'Punjabi']
  },
  {
    email: 'sadia.malik@educonnect.pk',
    fullName: 'Miss Sadia Malik',
    portal: 'school',
    gender: 'female',
    city: 'Sialkot',
    subjects: ['Biology', 'Chemistry'],
    quranLevel: null,
    hourlyRate: 17,
    experienceYears: 7,
    education: ['BS in Biotechnology (Government College University, Lahore)', 'B.Ed (Allama Iqbal Open University)'],
    bio: 'Friendly and certified science teacher. Specializing in middle school general science and high school biology/chemistry.',
    languages: ['Urdu', 'English', 'Punjabi']
  }
];

async function seed() {
  console.log('--- Starting Pakistani Teacher Seeding Process ---');

  for (const t of teachersToSeed) {
    console.log(`\nProcessing: ${t.fullName} (${t.email})...`);

    // 1. Check if user already exists in Auth
    const { data: usersData, error: listError } = await supabase.auth.admin.listUsers();
    if (listError) {
      console.error('Error listing users:', listError.message);
      process.exit(1);
    }

    const existingUser = usersData.users.find(u => u.email === t.email);
    let userId;

    if (existingUser) {
      console.log(`Found existing user with email ${t.email}. Deleting to overwrite...`);
      const { error: deleteError } = await supabase.auth.admin.deleteUser(existingUser.id);
      if (deleteError) {
        console.error(`Error deleting user ${t.email}:`, deleteError.message);
        continue;
      }
      console.log(`Deleted old user: ${existingUser.id}`);
    }

    // 2. Create new Auth User
    const { data: createData, error: createError } = await supabase.auth.admin.createUser({
      email: t.email,
      password: SHARED_PASSWORD,
      email_confirm: true,
      user_metadata: {
        full_name: t.fullName,
        role: 'teacher'
      }
    });

    if (createError) {
      console.error(`Error creating user ${t.email}:`, createError.message);
      continue;
    }

    userId = createData.user.id;
    console.log(`Created Auth User with ID: ${userId}`);

    // Wait a brief moment to let database triggers complete profile insertion
    await new Promise(resolve => setTimeout(resolve, 500));

    // 3. Update public.profiles (to set portal)
    const { error: profileError } = await supabase
      .from('profiles')
      .update({
        portal: t.portal
      })
      .eq('id', userId);

    if (profileError) {
      console.error(`Error updating public.profiles for ${t.fullName}:`, profileError.message);
    } else {
      console.log(`Updated profile portal to '${t.portal}'`);
    }

    // 4. Update public.teacher_profiles
    const { error: teacherError } = await supabase
      .from('teacher_profiles')
      .update({
        subjects: t.subjects,
        hourly_rate_usd: t.hourlyRate,
        mode: 'online', // Default mode online
        bio: t.bio,
        quran_level: t.quranLevel,
        gender: t.gender,
        country: 'Pakistan',
        city: t.city,
        languages: t.languages,
        experience_years: t.experienceYears,
        rating: (4.5 + Math.random() * 0.5).toFixed(2), // Random rating between 4.5 and 5.0
        total_reviews: Math.floor(Math.random() * 50) + 10, // Random reviews between 10 and 60
        is_verified: true,
        is_active: true,
        education: t.education
      })
      .eq('user_id', userId);

    if (teacherError) {
      console.error(`Error updating public.teacher_profiles for ${t.fullName}:`, teacherError.message);
    } else {
      console.log(`Successfully completed teacher profile setup for ${t.fullName}`);
    }
  }

  console.log('\n--- Seeding Process Finished Successfully! ---');
  console.log(`Shared Password set for all accounts: ${SHARED_PASSWORD}`);
  process.exit(0);
}

seed().catch(err => {
  console.error('Unexpected error during seeding:', err);
  process.exit(1);
});
