import React, { useState, useEffect } from 'react';
import * as XLSX from 'xlsx';
import { Trash2, Edit, Download, UserPlus, Loader2, AlertCircle } from 'lucide-react';

export default function App() {
  
  // Grab saved data so we don't lose it on refresh
  const [students, setStudents] = useState(() => {
    try {
      const savedData = localStorage.getItem("student_records");
      return savedData ? JSON.parse(savedData) : [
        { id: 1, name: "Sample Student", email: "sample@example.com", age: 21 }
      ];
    } catch (error) {
      console.error("LocalStorage read failed:", error);
      return [];
    }
  });

  const [loading, setLoading] = useState(false);
  const [editingId, setEditingId] = useState(null);
  
  // Form input states
  const [formData, setFormData] = useState({ 
    name: '', 
    email: '', 
    age: '' 
  });

  // Autosave whenever the student list changes
  useEffect(() => {
    localStorage.setItem("student_records", JSON.stringify(students));
  }, [students]);

  const handleSaveStudent = (e) => {
    e.preventDefault();
    
    // Simple check to make sure fields aren't empty
    const { name, email, age } = formData;
    if (!name.trim() || !email.trim() || !age) {
      alert("Please fill in all fields.");
      return;
    }

    // Basic email format check
    const emailPattern = /^\S+@\S+\.\S+$/;
    if (!emailPattern.test(email)) {
      alert("That email doesn't look right.");
      return;
    }

    setLoading(true);

    // Fake a delay so the loading spinner actually shows up
    setTimeout(() => {
      if (editingId) {
        // Update mode
        setStudents(prev => prev.map(student => 
          student.id === editingId ? { ...formData, id: editingId } : student
        ));
        setEditingId(null);
      } else {
        // New student mode - using timestamp as a unique ID
        const newStudent = { ...formData, id: Date.now() };
        setStudents(prev => [...prev, newStudent]);
      }

      // Clear the form
      setFormData({ name: '', email: '', age: '' });
      setLoading(false);
    }, 600);
  };

  // Pre-fill form when user clicks edit
  const handleEditClick = (student) => {
    setEditingId(student.id);
    setFormData({ 
      name: student.name, 
      email: student.email, 
      age: student.age 
    });
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const handleDeleteStudent = (id) => {
    if (window.confirm("Are you sure? This can't be undone.")) {
      setLoading(true);
      setTimeout(() => {
        setStudents(prev => prev.filter(student => student.id !== id));
        setLoading(false);
      }, 500);
    }
  };

  // Convert table data to Excel file
  const handleExportToExcel = () => {
    try {
      const worksheet = XLSX.utils.json_to_sheet(students);
      const workbook = XLSX.utils.book_new();
      XLSX.utils.book_append_sheet(workbook, worksheet, "Students");
      XLSX.writeFile(workbook, `Students_List_${Date.now()}.xlsx`);
    } catch (error) {
      console.error("Export error:", error);
    }
  };

  return (
    <div className="min-h-screen bg-slate-50 p-6 md:p-12 font-sans text-slate-900">
      <div className="max-w-5xl mx-auto">
        
        {/* Main Header */}
        <header className="flex flex-col md:flex-row justify-between items-end mb-12 gap-6 border-b border-slate-200 pb-8">
          <div>
            <h1 className="text-5xl font-black text-slate-800 tracking-tighter mb-2">
              PORTAL<span className="text-blue-600">.</span>
            </h1>
            <p className="text-slate-500 font-medium">Student Management System</p>
          </div>
          <button 
            onClick={handleExportToExcel}
            className="group flex items-center gap-3 bg-emerald-500 hover:bg-emerald-600 text-white px-8 py-4 rounded-2xl font-bold transition-all shadow-xl hover:shadow-emerald-200"
          >
            <Download size={22} />
            Download Excel Report
          </button>
        </header>

        {/* Form to Add/Edit Students */}
        <section className="bg-white p-10 rounded-3xl shadow-2xl shadow-slate-200/50 border border-slate-100 mb-12">
          <h2 className="text-xl font-extrabold mb-8 flex items-center gap-2 text-slate-700">
            {editingId ? "Edit Student Details" : "Register New Student"}
          </h2>
          
          <form onSubmit={handleSaveStudent} className="grid grid-cols-1 md:grid-cols-3 lg:grid-cols-4 gap-6">
            <div className="space-y-2">
              <label className="text-xs font-black text-slate-400 uppercase tracking-widest">Full Name</label>
              <input 
                required
                className="w-full bg-slate-50 border-2 border-transparent focus:border-blue-500 focus:bg-white p-4 rounded-2xl transition-all outline-none" 
                type="text" 
                placeholder="Full Name"
                value={formData.name} 
                onChange={e => setFormData({...formData, name: e.target.value})} 
              />
            </div>

            <div className="space-y-2">
              <label className="text-xs font-black text-slate-400 uppercase tracking-widest">Email Address</label>
              <input 
                required
                className="w-full bg-slate-50 border-2 border-transparent focus:border-blue-500 focus:bg-white p-4 rounded-2xl transition-all outline-none" 
                type="email" 
                placeholder="email@example.com"
                value={formData.email} 
                onChange={e => setFormData({...formData, email: e.target.value})} 
              />
            </div>

            <div className="space-y-2">
              <label className="text-xs font-black text-slate-400 uppercase tracking-widest">Age</label>
              <input 
                required
                className="w-full bg-slate-50 border-2 border-transparent focus:border-blue-500 focus:bg-white p-4 rounded-2xl transition-all outline-none" 
                type="number" 
                placeholder="21"
                value={formData.age} 
                onChange={e => setFormData({...formData, age: e.target.value})} 
              />
            </div>

            <div className="flex items-end">
              <button 
                type="submit" 
                disabled={loading}
                className={`w-full h-14 rounded-2xl font-black text-white transition-all shadow-lg flex items-center justify-center gap-2 ${editingId ? 'bg-orange-500 hover:bg-orange-600 shadow-orange-100' : 'bg-blue-600 hover:bg-blue-700 shadow-blue-100'}`}
              >
                {editingId ? <Edit size={20}/> : <UserPlus size={20}/>}
                {editingId ? 'UPDATE' : 'REGISTER'}
              </button>
            </div>
          </form>
        </section>

        {/* The Student Table */}
        <section className="bg-white rounded-[2.5rem] shadow-2xl border border-slate-100 overflow-hidden relative">
          
          {/* Show overlay when processing */}
          {loading && (
            <div className="absolute inset-0 bg-white/90 backdrop-blur-md flex flex-col items-center justify-center z-50">
              <Loader2 className="animate-spin text-blue-600 mb-4" size={56} />
              <p className="font-black text-slate-800 text-lg uppercase tracking-tighter">Updating Database</p>
            </div>
          )}
          
          <div className="overflow-x-auto">
            <table className="w-full text-left">
              <thead>
                <tr className="bg-slate-50 border-b border-slate-100">
                  <th className="p-6 text-xs font-black text-slate-400 uppercase tracking-widest">Student Info</th>
                  <th className="p-6 text-xs font-black text-slate-400 uppercase tracking-widest">Email</th>
                  <th className="p-6 text-xs font-black text-slate-400 uppercase tracking-widest">Age</th>
                  <th className="p-6 text-xs font-black text-slate-400 uppercase tracking-widest text-center">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-50">
                {students.map(student => (
                  <tr key={student.id} className="group hover:bg-slate-50/50 transition-all">
                    <td className="p-6">
                      <div className="flex items-center gap-4">
                        <div className="w-10 h-10 bg-blue-100 text-blue-600 rounded-full flex items-center justify-center font-bold">
                          {student.name.charAt(0)}
                        </div>
                        <span className="font-bold text-slate-800">{student.name}</span>
                      </div>
                    </td>
                    <td className="p-6 text-slate-500 font-medium">{student.email}</td>
                    <td className="p-6 text-slate-500 font-medium">{student.age}</td>
                    <td className="p-6">
                      <div className="flex justify-center gap-4">
                        <button 
                          onClick={() => handleEditClick(student)}
                          className="p-3 text-blue-500 hover:bg-blue-50 rounded-xl transition-all"
                        >
                          <Edit size={20} />
                        </button>
                        <button 
                          onClick={() => handleDeleteStudent(student.id)}
                          className="p-3 text-rose-500 hover:bg-rose-50 rounded-xl transition-all"
                        >
                          <Trash2 size={20} />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          {/* Show this if table is empty */}
          {students.length === 0 && (
            <div className="p-24 flex flex-col items-center justify-center text-slate-300">
              <AlertCircle size={64} className="mb-4" strokeWidth={1} />
              <p className="text-xl font-bold">No Records Found</p>
            </div>
          )}
        </section>
      </div>
    </div>
  );
}