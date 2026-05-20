import 'dotenv/config';
import { createClient } from '@supabase/supabase-js';
import { randomUUID } from 'node:crypto';

const url = process.env.SUPABASE_URL;
const serviceKey = process.env.SUPABASE_SERVICE_ROLE_KEY;
if (!url || !serviceKey) {
  console.error('Missing SUPABASE_URL or SUPABASE_SERVICE_ROLE_KEY in environment.');
  process.exit(1);
}

const supabase = createClient(url, serviceKey, { auth: { persistSession: false, autoRefreshToken: false } });

async function run() {
  console.log('Looking for any existing teacher_profiles...');
  const { data: teachers, error: teacherErr } = await supabase.from('teacher_profiles').select('user_id').limit(1);
  if (teacherErr) {
    console.error('Error fetching teacher_profiles:', teacherErr.message);
    process.exit(1);
  }
  if (!teachers || teachers.length === 0) {
    console.error('No teacher_profiles found in DB. Create a teacher account first.');
    process.exit(1);
  }

  const teacherId = teachers[0].user_id;
  console.log('Using teacher user id:', teacherId);

  const lessonId = randomUUID();
  const lesson = {
    id: lessonId,
    teacher_id: teacherId,
    lesson_type: 'note',
    title: 'Smoke test lesson',
    drive_url: 'https://example.com/smoke.pdf',
    description: 'Inserted by smoke-test script',
  };

  const { error: insertErr } = await supabase.from('teacher_lessons').insert(lesson);
  if (insertErr) {
    console.error('Error inserting lesson:', insertErr.message);
    process.exit(1);
  }
  console.log('Inserted lesson', lessonId);

  // find any student id to assign (optional)
  const { data: studentRoles, error: rolesErr } = await supabase.from('user_roles').select('user_id').eq('role', 'student').limit(1);
  if (rolesErr) {
    console.warn('Could not query user_roles:', rolesErr.message);
  }

  if (studentRoles && studentRoles.length > 0) {
    const studentId = studentRoles[0].user_id;
    const { error: assignErr } = await supabase.from('teacher_lesson_students').insert({ lesson_id: lessonId, student_id: studentId });
    if (assignErr) {
      console.warn('Warning: could not insert assignment:', assignErr.message);
    } else {
      console.log('Assigned student', studentId, 'to lesson');
    }
  } else {
    console.log('No student roles found; skipping assignment insert.');
  }

  // Query counts using direct selects
  const { data: lessonsRes, error: lessonsErr } = await supabase.from('teacher_lessons').select('id').eq('teacher_id', teacherId);
  if (lessonsErr) console.warn('Could not query teacher_lessons count:', lessonsErr.message);
  const { data: assignsRes, error: assignsErr } = await supabase.from('teacher_lesson_students').select('student_id').eq('lesson_id', lessonId);
  if (assignsErr) console.warn('Could not query teacher_lesson_students count:', assignsErr.message);
  console.log('lessons_count:', lessonsRes ? lessonsRes.length : 'unknown');
  console.log('assignments_count:', assignsRes ? assignsRes.length : 'unknown');

  console.log('Smoke test finished successfully.');
  process.exit(0);
}

run().catch((err) => {
  console.error('Unexpected error:', err);
  process.exit(1);
});
