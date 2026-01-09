
const API_BASE = import.meta.env.VITE_API_URL || 'http://localhost:5000/api';

export const api = {
  auth: {
    login: async (credentials: any) => {
      const res = await fetch(`${API_BASE}/auth/login`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(credentials),
      });
      return res.json();
    },
    signup: async (formData: FormData) => {
      const res = await fetch(`${API_BASE}/auth/signup`, {
        method: 'POST',
        body: formData,
      });
      return res.json();
    },
    getPendingStudents: async () => {
      const res = await fetch(`${API_BASE}/auth/pending-students`);
      if (!res.ok) {
        console.error("Failed to fetch pending students:", res.statusText);
        return [];
      }
      return res.json();
    },
    approveStudent: async (id: number) => {
      const res = await fetch(`${API_BASE}/auth/approve`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ student_id: id }),
      });
      return res.json();
    },
    getProfile: async (email: string) => {
      const res = await fetch(`${API_BASE}/auth/profile?email=${email}`);
      return res.json();
    },
    updateDetails: async (data: any) => {
      const res = await fetch(`${API_BASE}/auth/update-details`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(data),
      });
      return res.json();
    },
    changePassword: async (data: any) => {
      const res = await fetch(`${API_BASE}/auth/change-password`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(data),
      });
      return res.json();
    },
    updateImage: async (formData: FormData) => {
      const res = await fetch(`${API_BASE}/auth/update-image`, {
        method: 'POST',
        body: formData,
      });
      return res.json();
    }
  },
  events: {
    getAll: async () => {
      const res = await fetch(`${API_BASE}/events`);
      return res.json();
    },
    add: async (formData: FormData) => {
      const res = await fetch(`${API_BASE}/events/add`, {
        method: 'POST',
        body: formData,
      });
      return res.json();
    },
    update: async (id: number, formData: FormData) => {
      const res = await fetch(`${API_BASE}/events/update/${id}`, {
        method: 'PUT',
        body: formData,
      });
      return res.json();
    },
    delete: async (id: number) => {
      const res = await fetch(`${API_BASE}/events/delete/${id}`, {
        method: 'DELETE',
      });
      return res.json();
    }
  },
  attendance: {
    getStudent: async (id: string | number) => {
      const res = await fetch(`${API_BASE}/attendance/student/${id}`);
      return res.json();
    }
  },
  grades: {
    getStudent: async (id: string | number) => {
      const res = await fetch(`${API_BASE}/grades/student/${id}`);
      return res.json();
    }
  },
  announcements: {
    getAll: async () => {
      const res = await fetch(`${API_BASE}/announcements`);
      return res.json();
    },
    add: async (data: { title: string; message: string; is_active: boolean }) => {
      const res = await fetch(`${API_BASE}/announcements/add`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(data),
      });
      return res.json();
    },
    update: async (id: number, data: { title: string; message: string; is_active: boolean }) => {
      const res = await fetch(`${API_BASE}/announcements/update/${id}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(data),
      });
      return res.json();
    },
    delete: async (id: number) => {
      const res = await fetch(`${API_BASE}/announcements/delete/${id}`, {
        method: 'DELETE',
      });
      return res.json();
    }
  },
  faculty: {
    getDashboard: async (facultyId: string | number) => {
      const res = await fetch(`${API_BASE}/faculty/dashboard/${facultyId}`);
      return res.json();
    },
    getClassList: async (dept: string, sem: number, sec: string) => {
      const res = await fetch(`${API_BASE}/faculty/class-list?department=${dept}&semester=${sem}&section=${sec}`);
      return res.json();
    },
    markAttendance: async (data: any) => {
      const res = await fetch(`${API_BASE}/faculty/mark-attendance`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(data),
      });
      return res.json();
    }
  },
  schedule: {
    create: async (data: any) => {
      const res = await fetch(`${API_BASE}/schedule/create`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(data),
      });
      return res.json();
    },
    getAll: async () => {
      const res = await fetch(`${API_BASE}/schedule/all`);
      return res.json();
    },
    getFacultySchedule: async (id: number | string) => {
      const res = await fetch(`${API_BASE}/schedule/faculty/${id}`);
      return res.json();
    },
    getStudent: async (studentId: string | number) => {
      const res = await fetch(`${API_BASE}/schedule/student?student_id=${studentId}`);
      return res.json();
    }
  }
};
