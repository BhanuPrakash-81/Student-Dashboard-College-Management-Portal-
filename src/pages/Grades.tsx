import React, { useEffect, useState } from 'react';
import { api } from '../services/api';
import { GradesResponse } from '../types';

const Grades: React.FC = () => {
  const [data, setData] = useState<GradesResponse | null>(null);
  const [loading, setLoading] = useState(true);
  const studentId = localStorage.getItem('id');

  useEffect(() => {
    if (studentId) {
      api.grades.getStudent(studentId)
        .then(res => setData(res))
        .catch(err => console.error(err))
        .finally(() => setLoading(false));
    }
  }, [studentId]);

  const getGradeColor = (grade: string) => {
    if (grade.startsWith('A')) return 'bg-emerald-100 text-emerald-700 border-emerald-200';
    if (grade.startsWith('B')) return 'bg-blue-100 text-blue-700 border-blue-200';
    if (grade.startsWith('C')) return 'bg-yellow-100 text-yellow-700 border-yellow-200';
    return 'bg-red-100 text-red-700 border-red-200';
  };

  if (loading) return <div className="flex justify-center items-center h-[80vh]"><i className="fas fa-spinner fa-spin text-4xl text-indigo-500"></i></div>;
  if (!data) return <div className="text-center p-10">No grades available.</div>;

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="bg-gradient-to-r from-indigo-600 to-violet-600 rounded-2xl p-8 text-white mb-8 shadow-lg">
            <h1 className="text-2xl font-bold mb-2">Academic Performance</h1>
            <div className="flex items-end gap-2">
                <span className="text-6xl font-extrabold">{data.cgpa ? Number(data.cgpa).toFixed(2) : "0.00"}</span>
                <span className="text-xl opacity-80 mb-2 font-medium">CGPA</span>
            </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {data.subjects.map((subject, idx) => (
                <div key={idx} className="bg-white rounded-2xl border border-slate-100 shadow-sm p-6 hover:shadow-md transition-shadow">
                    <div className="flex justify-between items-start mb-4">
                        <div>
                            <h3 className="font-bold text-lg text-slate-800">{subject.subject_name}</h3>
                            <p className="text-sm text-slate-500">{subject.subject_code} • {subject.faculty_name}</p>
                        </div>
                        <span className="bg-slate-100 text-slate-600 text-xs font-bold px-3 py-1 rounded-full">
                            {subject.credits} Credits
                        </span>
                    </div>

                    <div className="space-y-3">
                        {subject.assessments.map((assessment, aIdx) => (
                            <div key={aIdx} className="flex items-center justify-between p-3 bg-slate-50 rounded-xl">
                                <span className="text-sm font-medium text-slate-700">{assessment.assessment_type}</span>
                                <div className="flex items-center gap-3">
                                    <span className="text-sm font-bold text-slate-800">{assessment.marks} <span className="text-slate-400 font-normal">/ {assessment.max_marks}</span></span>
                                    {assessment.grade && (
                                        <span className={`text-xs font-bold px-2 py-0.5 rounded border ${getGradeColor(assessment.grade)}`}>
                                            {assessment.grade}
                                        </span>
                                    )}
                                </div>
                            </div>
                        ))}
                    </div>
                </div>
            ))}
        </div>
    </div>
  );
};

export default Grades;