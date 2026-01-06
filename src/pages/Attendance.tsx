import React, { useEffect, useState } from 'react';
import { api } from '../services/api';
import { StudentAttendanceResponse } from '../types';

const Attendance: React.FC = () => {
  const [data, setData] = useState<StudentAttendanceResponse | null>(null);
  const [loading, setLoading] = useState(true);
  const studentId = localStorage.getItem('id');

  useEffect(() => {
    if (studentId) {
      api.attendance.getStudent(studentId)
        .then(res => setData(res))
        .catch(err => console.error(err))
        .finally(() => setLoading(false));
    }
  }, [studentId]);

  if (loading) return <div className="flex justify-center items-center h-[80vh]"><i className="fas fa-spinner fa-spin text-4xl text-indigo-500"></i></div>;
  if (!data) return <div className="text-center p-10">No attendance data found.</div>;

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      <h1 className="text-2xl font-bold text-slate-800 mb-6">Attendance Record</h1>

      <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
        <div className="bg-white p-6 rounded-2xl shadow-sm border border-slate-100 text-center">
            <div className="text-3xl font-bold text-indigo-600 mb-1">{data.summary.overallPercentage}%</div>
            <div className="text-xs text-slate-500 uppercase tracking-wider font-semibold">Overall</div>
        </div>
        <div className="bg-white p-6 rounded-2xl shadow-sm border border-slate-100 text-center">
            <div className="text-3xl font-bold text-emerald-500 mb-1">{data.summary.totalPresent}</div>
            <div className="text-xs text-slate-500 uppercase tracking-wider font-semibold">Present Classes</div>
        </div>
        <div className="bg-white p-6 rounded-2xl shadow-sm border border-slate-100 text-center">
            <div className="text-3xl font-bold text-slate-700 mb-1">{data.summary.totalClasses}</div>
            <div className="text-xs text-slate-500 uppercase tracking-wider font-semibold">Total Classes</div>
        </div>
        <div className="bg-white p-6 rounded-2xl shadow-sm border border-slate-100 text-center">
            <div className="text-3xl font-bold text-red-500 mb-1">{data.summary.totalClasses - data.summary.totalPresent}</div>
            <div className="text-xs text-slate-500 uppercase tracking-wider font-semibold">Absent Classes</div>
        </div>
      </div>

      <div className="bg-white rounded-2xl shadow-sm border border-slate-100 overflow-hidden">
        <div className="px-6 py-4 border-b border-slate-100 bg-slate-50/50">
            <h2 className="font-semibold text-slate-800">Subject-wise Breakdown</h2>
        </div>
        <div className="overflow-x-auto">
          <table className="w-full text-sm text-left">
            <thead className="text-xs text-slate-500 uppercase bg-slate-50">
              <tr>
                <th className="px-6 py-3">Subject</th>
                <th className="px-6 py-3">Faculty</th>
                <th className="px-6 py-3 text-center">Total</th>
                <th className="px-6 py-3 text-center">Present</th>
                <th className="px-6 py-3 text-center">Percentage</th>
              </tr>
            </thead>
            <tbody>
              {data.subjectAttendance.map((sub) => (
                <tr key={sub.subject_id} className="border-b border-slate-50 hover:bg-slate-50/50">
                  <td className="px-6 py-4 font-medium text-slate-900">
                    <div className="font-bold">{sub.subject_code}</div>
                    <div className="text-slate-500 font-normal">{sub.subject_name}</div>
                  </td>
                  <td className="px-6 py-4 text-slate-600">{sub.faculty_name}</td>
                  <td className="px-6 py-4 text-center">{sub.total_days}</td>
                  <td className="px-6 py-4 text-center text-emerald-600 font-medium">{sub.present_days}</td>
                  <td className="px-6 py-4">
                    <div className="flex items-center gap-3">
                      <div className="w-full bg-slate-200 rounded-full h-2.5">
                        <div 
                          className={`h-2.5 rounded-full ${sub.percentage >= 75 ? 'bg-emerald-500' : sub.percentage >= 60 ? 'bg-yellow-400' : 'bg-red-500'}`} 
                          style={{ width: `${sub.percentage}%` }}>
                        </div>
                      </div>
                      <span className="font-bold text-slate-700 w-12 text-right">{sub.percentage}%</span>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};

export default Attendance;