
export interface User {
  id: number;
  first_name: string;
  middle_name?: string;
  last_name: string;
  email: string;
  role: 'student' | 'admin';
  profile_image?: string; // base64 string
  full_name?: string;
}

export interface AuthResponse {
  message: string;
  role: 'student' | 'admin';
  user_id: number;
  first_name: string;
  middle_name?: string;
  last_name: string;
  error?: string;
}

export interface EventItem {
  id: number;
  title: string;
  type: 'Workshop' | 'Cultural' | 'Sports' | 'Technical' | 'Seminar';
  date: string;
  time: string;
  location: string;
  description: string;
  image?: string; // base64
}

export interface SubjectAttendance {
  subject_id: number;
  subject_code: string;
  subject_name: string;
  faculty_name: string;
  total_days: number;
  present_days: number;
  percentage: number;
}

export interface AttendanceSummary {
  totalPresent: number;
  totalClasses: number;
  overallPercentage: number;
}

export interface StudentAttendanceResponse {
  summary: AttendanceSummary;
  subjectAttendance: SubjectAttendance[];
  recentAttendance: any[];
}

export interface Assessment {
  assessment_type: string;
  marks: number;
  max_marks: number;
  grade: string;
  grade_point: number;
  semester: number;
}

export interface SubjectGrade {
  subject_id: number;
  subject_code: string;
  subject_name: string;
  faculty_name: string;
  credits: number;
  assessments: Assessment[];
}

export interface GradesResponse {
  student_id: string;
  cgpa: string | null;
  subjects: SubjectGrade[];
}

export interface PendingStudent {
  id: number;
  full_name: string;
  email: string;
  profile_image: string | null;
}

export interface Announcement {
  id: number;
  title: string;
  message: string;
  created_at: string;
  is_active: boolean | number;
}
