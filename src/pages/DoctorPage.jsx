import React, { useState, useEffect } from 'react';
import axiosClient from '../api/axiosClient';
import { useAuth } from '../hooks/useAuth';
import { useDoctorAppointments } from '../hooks/useDoctorAppointments';
import {
  Search,
  PhoneMissed, 
  FileText, 
  ChevronRight, 
  UserPlus, 
  Calendar as CalendarIcon, 
  BrainCircuit,
  Plus
} from 'lucide-react';

export default function DoctorPage() {
  const { user } = useAuth();
  const { appointments } = useDoctorAppointments();
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function fetchDoctor() {
      // Use seeded fallback if user is patient or guest
      let docId = user?.doctorId;
      try {
        if (!docId) {
          const docsRes = await axiosClient.get(`/doctors`);
          if (docsRes.data.data && docsRes.data.data.length > 0) {
            docId = docsRes.data.data[0].id;
          } else {
            docId = 1;
          }
        }
        const res = await axiosClient.get(`/doctors/${docId}`);
        setData({
          ...res.data.data,
          totalAppointmentsCount: res.data.data.totalAppointmentsCount || 24,
          appointmentGrowth: res.data.data.appointmentGrowth || '+12%',
          completedAppointments: res.data.data.completedAppointments || 16,
          remainingAppointments: res.data.data.remainingAppointments || 8,
          revenueData: res.data.data.revenueData || [
            { label: 'W1', value: 12500 },
            { label: 'W2', value: 14280 },
            { label: 'W3', value: 20100 },
            { label: 'M1', value: 25000 },
            { label: 'M2', value: 28000 },
            { label: 'M3', value: 32000 }
          ]
        });
      } catch (e) {
        console.error('Failed to fetch doctor dashboard', e);
      } finally {
        setLoading(false);
      }
    }
    fetchDoctor();
  }, [user]);

  if (loading) return <div className="p-6">Loading dashboard...</div>;
  if (!data) return <div className="p-6">Failed to load dashboard data.</div>;

  const revenueData = data.revenueData || [];
  // const patientVisitsData = data.patientVisitsData || [];

  return (
    <div className="min-h-screen bg-[#f8f9fc] p-6 font-sans relative pb-20">
      {/* Header */}
      <div className="flex flex-col md:flex-row items-start md:items-center justify-between mb-8 gap-4">
        <h1 className="text-2xl font-bold text-[#1e40af]">Patient Overview</h1>
        <div className="flex flex-col md:flex-row items-center gap-4 w-full md:w-auto">
          <div className="relative w-full md:w-80">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-400" />
            <input 
              type="text" 
              placeholder="Search patients or records..." 
              className="w-full bg-white border border-gray-100 rounded-full py-2 pl-9 pr-4 text-sm focus:outline-none focus:ring-1 focus:ring-blue-500 shadow-sm"
            />
          </div>
          <div className="flex items-center gap-3 shrink-0">
            <div className="text-right hidden md:block">
                <p className="text-sm font-semibold text-gray-800">{data.name}</p>
                <p className="text-xs text-gray-500">{data.specialty}</p>
              </div>
              <div className="h-10 w-10 rounded-full bg-blue-100 flex items-center justify-center overflow-hidden border border-blue-200">
                 <img src={`https://ui-avatars.com/api/?name=${encodeURIComponent(data.name)}&background=eff6ff&color=1e40af`} alt={data.name} className="w-full h-full object-cover" />
            </div>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        
        {/* ROW 1 */}
        {/* Total Appointments */}
        <div className="bg-white p-6 rounded-2xl shadow-sm border border-gray-50">
          <h2 className="text-sm font-semibold text-gray-600 mb-1">Total Appointments</h2>
          <div className="flex items-baseline gap-2 mb-6">
              <span className="text-4xl font-bold text-[#1e40af]">{data.totalAppointmentsCount}</span>       
              <span className="text-xs font-semibold text-emerald-500 bg-emerald-50 px-2 py-0.5 rounded-full">{data.appointmentGrowth} vs yesterday</span>
            </div>
            <div className="flex gap-4">
              <div className="flex-1 bg-blue-50 rounded-xl p-3">
                <p className="text-[10px] font-bold text-blue-600 uppercase tracking-wider mb-1">COMPLETED</p>
                <p className="text-xl font-bold text-blue-900">{data.completedAppointments}</p>
              </div>
              <div className="flex-1 bg-cyan-50 rounded-xl p-3">
                <p className="text-[10px] font-bold text-cyan-600 uppercase tracking-wider mb-1">REMAINING</p>
                <p className="text-xl font-bold text-cyan-900">{data.remainingAppointments}</p>
              </div>
            </div>
        </div>

        {/* Upcoming Timeline */}
        <div className="bg-white p-6 rounded-2xl shadow-sm border border-gray-50 md:col-span-2">
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-sm font-semibold text-gray-800">Upcoming Timeline</h2>
            <button className="text-xs font-semibold text-[#1e40af] hover:underline">View Schedule</button>
          </div>
          <div className="flex gap-4 overflow-x-auto pb-2 scrollbar-none">
              {appointments && appointments.length > 0 ? (
                appointments.slice(0, 4).map((appt, i) => {
                  const colors = [
                    'border-[#1e40af] text-[#1e40af] bg-slate-50',
                    'border-teal-500 text-teal-600 bg-slate-50',
                    'border-amber-600 text-amber-700 bg-slate-50',
                    'border-gray-300 text-gray-500 bg-slate-50'
                  ];
                  const colorObj = colors[i % colors.length];
                  const parts = colorObj.split(' ');
                  return (
                    <div key={i} className={`min-w-[160px] ${parts[2]} border-l-4 ${parts[0]} p-3 rounded-lg flex-shrink-0`}>
                      <p className={`text-xs font-bold ${parts[1]} mb-1`}>{appt.scheduledAt || new Date(appt.date).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}</p>
                      <p className="text-sm font-semibold text-gray-800">{appt.patientName}</p>
                      <p className="text-xs text-gray-500">{appt.reason || 'Checkup'}</p>
                    </div>
                  );
                })
              ) : (
                <div className="text-sm text-gray-500 p-2">No upcoming appointments</div>
              )}
            </div>
          </div>
        </div>

        {/* ROW 2 */}
        {/* Revenue Trend */}
        <div className="bg-white p-6 rounded-2xl shadow-sm border border-gray-50">
          <div className="flex items-center justify-between mb-2">
            <div>
              <h2 className="text-sm font-semibold text-gray-800">Revenue Trend</h2>
              <p className="text-xs text-gray-500">Growth performance this month</p>
            </div>
            <div className="flex bg-gray-100 rounded-md p-0.5">
              <button className="text-[10px] font-bold px-2 py-1 bg-white rounded shadow-sm text-gray-800">W</button>
              <button className="text-[10px] font-bold px-2 py-1 text-gray-500">M</button>
            </div>
          </div>
          <div className="flex items-baseline gap-2 mb-4">
              <span className="text-3xl font-bold text-gray-900">${revenueData.reduce((sum, item) => sum + item.value, 0).toLocaleString()}</span>
            <span className="text-xs font-semibold text-emerald-500 flex items-center">? 8.4%</span>
          </div>
          <div className="h-32 w-full mt-2 flex items-end justify-between gap-2 px-1">
            {revenueData.map((item, index) => {
              const maxVal = Math.max(...revenueData.map(d => d.value));
              const heightPercentage = (item.value / maxVal) * 100;
              const isHighlight = index === 5;
              const isMid = index === 3;
              return (
                <div key={index} className="flex-1 flex flex-col items-center justify-end h-full group relative">
                  <div className="absolute -top-8 bg-gray-800 text-white text-[10px] px-2 py-1 rounded opacity-0 group-hover:opacity-100 transition-opacity">
                    ${item.value}
                  </div>
                  <div 
                    className={`w-full rounded-t-sm transition-all duration-300 ${isHighlight ? 'bg-[#1e40af]' : isMid ? 'bg-blue-400' : 'bg-slate-200'} hover:opacity-80`} 
                    style={{ height: `${heightPercentage}%` }}
                  ></div>
                </div>
              );
            })}
          </div>
        </div>

        {/* Patient Visits */}
        <div className="bg-white p-6 rounded-2xl shadow-sm border border-gray-50">
           <div>
              <h2 className="text-sm font-semibold text-gray-800">Patient Visits</h2>
              <p className="text-xs text-gray-500">Patient flow per hour</p>
            </div>
            <div className="h-40 w-full mt-6 relative flex items-end">
              <svg viewBox="0 0 100 50" preserveAspectRatio="none" className="w-full h-full absolute inset-0">
                <defs>
                  <linearGradient id="gradientLine" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="0%" stopColor="#0ea5e9" stopOpacity={0.2} />
                    <stop offset="100%" stopColor="#0ea5e9" stopOpacity={0} />
                  </linearGradient>
                </defs>
                <path 
                  d="M0,45 C15,20 30,25 45,35 C60,45 75,10 100,0 L100,50 L0,50 Z" 
                  fill="url(#gradientLine)" 
                />
                <path 
                  d="M0,45 C15,20 30,25 45,35 C60,45 75,10 100,0" 
                  fill="none" 
                  stroke="#0ea5e9" 
                  strokeWidth="2.5" 
                />
              </svg>
              <div className="w-full flex justify-between absolute bottom-0 transform translate-y-6 text-[#94a3b8] text-[9px] font-medium">
                <span>08:00</span>
                <span>12:00</span>
                <span>16:00</span>
                <span>20:00</span>
              </div>
            </div>
        </div>

        {/* No-Show Rate */}
        <div className="bg-[#1e293b] p-6 rounded-2xl shadow-sm relative overflow-hidden flex flex-col justify-center">
          <div className="absolute -right-10 -top-10 h-32 w-32 bg-white/5 rounded-full blur-2xl"></div>
          <h2 className="text-sm font-semibold text-gray-300 mb-2 uppercase tracking-wide">No-Show Rate</h2>
          <div className="text-5xl font-bold text-white mb-6">4.2%</div>
          
          <div className="w-full bg-gray-700 rounded-full h-1.5 mb-3">
             <div className="bg-cyan-400 h-1.5 rounded-full" style={{ width: '42%' }}></div>
          </div>
          <p className="text-xs text-gray-400">Lower than last week. <span className="text-cyan-400">Great job!</span></p>
        </div>

        {/* ROW 3 */}
        {/* Critical Alerts */}
        <div className="bg-white p-6 rounded-2xl shadow-sm border border-gray-50 flex flex-col">
          <h2 className="text-sm font-semibold text-gray-800 mb-4">Critical Alerts</h2>
          <div className="space-y-3 flex-1">
            {/* Alert 1 */}
            <div className="flex items-center justify-between p-3 border border-red-100 bg-white rounded-xl shadow-sm">
               <div className="flex items-center gap-3">
                 <div className="h-8 w-8 bg-red-50 text-red-500 rounded-full flex items-center justify-center shrink-0">
                   <PhoneMissed className="h-4 w-4" />
                 </div>
                 <div>
                   <p className="text-sm font-semibold text-gray-800">Missed Call: Mrs. Gable</p>
                   <p className="text-[10px] text-gray-500">Emergency line � 12m ago</p>
                 </div>
               </div>
               <button className="text-xs font-semibold text-[#1e40af] hover:underline">Callback</button>
            </div>
            {/* Alert 2 */}
            <div className="flex items-center justify-between p-3 border border-blue-100 bg-white rounded-xl shadow-sm">
               <div className="flex items-center gap-3">
                 <div className="h-8 w-8 bg-blue-50 text-blue-500 rounded-full flex items-center justify-center shrink-0">
                   <FileText className="h-4 w-4" />
                 </div>
                 <div>
                   <p className="text-sm font-semibold text-gray-800">Pending Follow-up</p>
                   <p className="text-[10px] text-gray-500">Lab results for David K. � 2h ago</p>
                 </div>
               </div>
               <button className="text-gray-400 hover:text-gray-600">
                 <ChevronRight className="h-4 w-4" />
               </button>
            </div>
          </div>
        </div>

        {/* Quick Actions */}
        <div className="bg-white p-6 rounded-2xl shadow-sm border border-gray-50 flex flex-col">
          <h2 className="text-sm font-semibold text-gray-800 mb-4">Quick Actions</h2>
          <div className="space-y-3 flex-1">
            <button className="w-full flex items-center justify-between p-4 bg-[#0a3195] text-white rounded-xl hover:bg-[#1e40af] transition-colors shadow-sm">
              <div className="flex items-center gap-3">
                <UserPlus className="h-5 w-5" />
                <span className="font-semibold text-sm">Add New Patient</span>
              </div>
              <ChevronRight className="h-4 w-4" />
            </button>
            <button className="w-full flex items-center justify-between p-4 bg-white border border-gray-200 text-gray-800 rounded-xl hover:bg-gray-50 transition-colors shadow-sm">
              <div className="flex items-center gap-3">
                <CalendarIcon className="h-5 w-5 text-[#1e40af]" />
                <span className="font-semibold text-sm">Book Appointment</span>
              </div>
              <ChevronRight className="h-4 w-4 text-gray-400" />
            </button>
          </div>
        </div>

        {/* AI Insights */}
        <div className="bg-gradient-to-br from-[#2563eb] to-[#1e40af] p-6 rounded-2xl shadow-sm relative overflow-hidden flex flex-col">
          <div className="absolute right-0 top-0 hidden md:block">
            <svg width="120" height="120" viewBox="0 0 120 120" fill="none" xmlns="http://www.w3.org/2000/svg" className="opacity-20 text-white">
              <circle cx="90" cy="30" r="60" fill="currentColor"/>
            </svg>
          </div>
          
          <div className="flex justify-between items-start mb-4 relative z-10">
            <div className="h-8 w-8 bg-white/20 rounded-full flex items-center justify-center text-cyan-300">
               <BrainCircuit className="h-5 w-5" />
            </div>
            <span className="bg-white/20 text-white text-[10px] uppercase font-bold tracking-wider px-2 py-1 rounded-full">AI Insights</span>
          </div>
          
          <h3 className="text-white font-semibold mb-2 relative z-10">No-Show Optimization</h3>
          <p className="text-blue-100 text-xs mb-6 relative z-10 leading-relaxed">
            Patients scheduled on Monday mornings have a 12% higher no-show rate. We suggest enabling SMS confirmations 24h prior for these slots.
          </p>
          
          <button className="mt-auto w-full flex items-center justify-center gap-2 bg-cyan-400 text-blue-900 py-3 rounded-xl font-bold text-sm hover:bg-cyan-300 transition-colors relative z-10">
            Apply Suggestion
            <span className="text-lg leading-none">?</span>
          </button>
        </div>
      {/* Floating Action Button */}
      <button className="fixed bottom-8 right-8 h-14 w-14 bg-[#0a3195] text-white rounded-xl shadow-lg hover:bg-[#1e40af] transition-colors flex items-center justify-center hover:-translate-y-1 transform duration-200 focus:outline-none focus:ring-4 focus:ring-blue-500/50">
        <Plus className="h-6 w-6" />
      </button>
    </div>
  );
}



