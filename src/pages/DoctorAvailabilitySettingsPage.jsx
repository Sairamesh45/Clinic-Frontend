import React, { useState, useEffect } from 'react';
import { 
  Search, 
  Bell, 
  ChevronLeft, 
  ChevronRight,
  Phone,
  MoreHorizontal,
  Info
} from 'lucide-react';

const mockAppointments = [
  { day: 1, start: 2, duration: 2, status: 'CONFIRMED', name: 'Eleanor Shellstrop', sub: 'Checkup • 45m', color: 'bg-[#e0e7ff] border-[#1e40af] text-[#1e40af]' },
  { day: 2, start: 3, duration: 2, status: 'PENDING', name: 'Chidi Anagonye', sub: 'MRI Review • 30m', color: 'bg-[#cffafe] border-[#0891b2] text-[#0891b2]' },
  { day: 4, start: 6, duration: 2, status: 'NO-SHOW', name: 'Jason Mendoza', sub: 'Lab Results • 20m', color: 'bg-[#fef2f2] border-[#dc2626] text-[#dc2626]' },
  { day: 5, start: 2, duration: 1.5, status: 'CONFIRMED', name: 'Tahani Al-Jamil', sub: 'Consultation • 1h', color: 'bg-[#e0e7ff] border-[#1e40af] text-[#1e40af]' },
];

const hours = [
  '08:00 AM', '09:00 AM', '10:00 AM', '11:00 AM', 
  '12:00 PM', '01:00 PM', '02:00 PM', '03:00 PM', 
  '04:00 PM', '05:00 PM'
];

export default function DoctorAvailabilitySettingsPage() {
  const [currentDate, setCurrentDate] = useState(new Date());
  const [realTime, setRealTime] = useState(new Date());

  useEffect(() => {
    const interval = setInterval(() => setRealTime(new Date()), 60000);
    return () => clearInterval(interval);
  }, []);

  const getWeekRangeStr = () => {
    const startOfWeek = new Date(currentDate);
    startOfWeek.setDate(currentDate.getDate() - currentDate.getDay() + 1);
    const endOfWeek = new Date(startOfWeek);
    endOfWeek.setDate(startOfWeek.getDate() + 4);
    
    const startMonth = startOfWeek.toLocaleString('default', { month: 'short' });
    const endMonth = endOfWeek.toLocaleString('default', { month: 'short' });
    
    if (startMonth === endMonth) {
      return `${startMonth} ${startOfWeek.getDate()} — ${endOfWeek.getDate()}, ${startOfWeek.getFullYear()}`;
    }
    return `${startMonth} ${startOfWeek.getDate()} — ${endMonth} ${endOfWeek.getDate()}, ${startOfWeek.getFullYear()}`;
  };

  const getDayDates = () => {
    const startOfWeek = new Date(currentDate);
    startOfWeek.setDate(currentDate.getDate() - currentDate.getDay() + 1);
    return Array.from({ length: 5 }).map((_, i) => {
      const d = new Date(startOfWeek);
      d.setDate(startOfWeek.getDate() + i);
      return {
        dayName: d.toLocaleString('default', { weekday: 'short' }).toUpperCase(),
        dateNum: d.getDate(),
        isToday: d.toDateString() === new Date().toDateString()
      };
    });
  };

  const weekDays = getDayDates();

  const handlePrevWeek = () => {
    const newDate = new Date(currentDate);
    newDate.setDate(currentDate.getDate() - 7);
    setCurrentDate(newDate);
  };

  const handleNextWeek = () => {
    const newDate = new Date(currentDate);
    newDate.setDate(currentDate.getDate() + 7);
    setCurrentDate(newDate);
  };

  const getRealTimePosition = () => {
    const h = realTime.getHours();
    const m = realTime.getMinutes();
    const baseHour = 8; 
    if (h < baseHour || h > 17) return null; 
    return ((h - baseHour) * 100) + ((m / 60) * 100);
  };

  const realTimeTop = getRealTimePosition();

  return (
    <div className="flex flex-col h-full bg-white font-sans rounded-tl-3xl shadow-sm w-full overflow-hidden">
      
      <div className="flex items-center justify-between px-8 py-5 border-b border-gray-100 shrink-0">
        <div className="flex items-center gap-6">
          <h1 className="text-xl font-bold text-[#1e40af]">Patient Overview</h1>
          <div className="flex bg-gray-50 border border-gray-100 rounded-lg p-1">
            <button className="px-4 py-1 bg-white shadow-sm rounded text-xs font-bold text-gray-800">Week</button>
            <button className="px-4 py-1 text-xs font-bold text-gray-500 hover:text-gray-800 transition-colors">Day</button>
            <button className="px-4 py-1 text-xs font-bold text-gray-500 hover:text-gray-800 transition-colors">Month</button>
          </div>
        </div>
        
        <div className="flex items-center gap-4">
          <Search className="h-5 w-5 text-gray-400 cursor-pointer hover:text-gray-600" />
          <Bell className="h-5 w-5 text-gray-400 cursor-pointer hover:text-gray-600" />
          <div className="flex items-center gap-3 ml-4 bg-white border border-gray-200 rounded-full px-4 py-2">
            <span className="text-xs font-semibold text-gray-700">{getWeekRangeStr()}</span>
            <div className="flex items-center gap-1 border-l border-gray-200 pl-2">
              <ChevronLeft className="h-4 w-4 text-gray-400 cursor-pointer hover:text-gray-800" onClick={handlePrevWeek} />
              <ChevronRight className="h-4 w-4 text-gray-400 cursor-pointer hover:text-gray-800" onClick={handleNextWeek} />
            </div>
          </div>
        </div>
      </div>

      <div className="flex flex-1 overflow-hidden">
        <div className="flex-1 flex flex-col overflow-hidden relative">
          
          <div className="flex border-b border-gray-100 shrink-0 ml-16">
            {weekDays.map((day, i) => (
              <div key={i} className="flex-1 flex flex-col items-center justify-center py-4 border-l border-transparent relative">
                <span className={`text-[10px] font-bold tracking-widest ${day.isToday ? 'text-[#1e40af]' : 'text-gray-400'}`}>{day.dayName}</span>
                <span className={`text-xl font-bold mt-1 ${day.isToday ? 'text-[#1e40af]' : 'text-gray-800'}`}>{day.dateNum}</span>
                {day.isToday && <div className="absolute bottom-0 w-full h-1 bg-[#1e40af]"></div>}
              </div>
            ))}
          </div>

          <div className="flex-1 overflow-y-auto relative">
            <div className="relative min-h-[1000px]">
              
              {hours.map((hour, i) => (
                <div key={i} className="absolute w-full border-t border-gray-100 flex items-start" style={{ top: `${i * 100}px` }}>
                  <div className="w-16 shrink-0 -mt-2.5 text-right pr-4 text-[9px] font-semibold text-gray-400">
                    {hour}
                  </div>
                  <div className="flex-1 flex h-[100px]">
                    {weekDays.map((_, colIndex) => (
                      <div key={colIndex} className="flex-1 border-l border-gray-50 h-full"></div>
                    ))}
                  </div>
                </div>
              ))}

              {realTimeTop !== null && (
                <div 
                  className="absolute left-16 right-0 border-t-2 border-red-500 z-20 pointer-events-none"
                  style={{ top: `${realTimeTop}px` }}
                >
                  <div className="absolute -left-[4.5rem] -top-2.5 bg-red-500 text-white text-[9px] font-bold px-1.5 py-0.5 rounded">
                    {realTime.toLocaleTimeString([], {hour: '2-digit', minute:'2-digit'})}
                  </div>
                  <div className="absolute -left-1.5 -top-1.5 w-3 h-3 bg-red-500 rounded-full border-2 border-white"></div>
                </div>
              )}

              <div className="absolute top-0 bottom-0 left-16 right-0 flex">
                {weekDays.map((_, colIndex) => {
                  const dayAppts = mockAppointments.filter(a => a.day === colIndex + 1);
                  return (
                    <div key={colIndex} className="flex-1 relative border-l border-transparent">
                      {dayAppts.map((appt, i) => (
                        <div 
                          key={i} 
                          className={`absolute left-1 right-3 p-3 rounded-md border-l-4 shadow-sm transition-transform hover:shadow-md cursor-pointer hover:-translate-y-0.5 z-10 ${appt.color}`}
                          style={{
                            top: `${appt.start * 100}px`,
                            height: `${appt.duration * 100 - 8}px`
                          }}
                        >
                          <p className="text-[9px] font-bold uppercase tracking-wider mb-1 opacity-80">{appt.status}</p>
                          <p className="text-xs font-bold text-gray-900 mb-0.5">{appt.name}</p>
                          <p className="text-[10px] opacity-70 font-medium">{appt.sub}</p>
                        </div>
                      ))}

                      {colIndex === 2 && (
                        <div className="absolute left-1 right-3 top-[410px] h-16 border-2 border-dashed border-indigo-200 bg-indigo-50/50 rounded-md flex items-center justify-center z-0">
                          <span className="text-[9px] font-bold text-indigo-400 tracking-wider">DROP TO RESCHEDULE</span>
                        </div>
                      )}
                    </div>
                  );
                })}
              </div>

            </div>
          </div>
        </div>

        <div className="w-80 border-l border-gray-100 bg-[#fbfcfd] p-6 flex flex-col shrink-0 overflow-y-auto">
          <div className="flex items-center gap-2 mb-6">
            <Phone className="h-4 w-4 text-gray-500" />
            <h2 className="font-bold text-gray-800">Call Reminders</h2>
          </div>

          <div className="space-y-4 flex-1">
            <div className="bg-white p-4 rounded-xl border border-gray-100 shadow-sm relative overflow-hidden">
              <div className="absolute top-0 left-0 w-1 h-full bg-orange-400"></div>
              <div className="flex justify-between items-start mb-1">
                <span className="text-[9px] font-bold text-orange-600 uppercase tracking-widest bg-orange-50 px-2 py-0.5 rounded">Urgent</span>
                <span className="text-[9px] font-medium text-gray-400">Due in 2h</span>
              </div>
              <h3 className="font-bold text-sm text-gray-800 mt-2">Follow-up: Sarah J.</h3>
              <p className="text-xs text-gray-500 mt-1 mb-4">Discuss post-op recovery & needs</p>
              <div className="flex gap-2">
                <button className="flex-1 bg-gray-50 hover:bg-gray-100 text-gray-800 text-xs font-bold py-2 rounded-lg transition-colors">
                  Call Now
                </button>
                <button className="w-8 flex items-center justify-center bg-gray-50 hover:bg-gray-100 text-gray-600 rounded-lg transition-colors">
                  <MoreHorizontal className="h-4 w-4" />
                </button>
              </div>
            </div>

            <div className="bg-white p-4 rounded-xl border border-gray-100 shadow-sm relative overflow-hidden">
              <div className="absolute top-0 left-0 w-1 h-full bg-blue-400"></div>
              <div className="flex justify-between items-start mb-1">
                <span className="text-[9px] font-medium text-gray-400">Tomorrow, 09:30 AM</span>
              </div>
              <h3 className="font-bold text-sm text-gray-800 mt-2">Reschedule: Michael R.</h3>
              <p className="text-xs text-gray-500 mt-1">Requested later slot via portal</p>
            </div>
          </div>

          <div className="bg-[#1e40af] text-white p-5 rounded-2xl shadow-md mt-6 relative overflow-hidden">
            <div className="absolute right-0 top-0 opacity-10">
              <Info className="h-24 w-24 -mt-4 -mr-4" />
            </div>
            <h3 className="font-bold mb-2 relative z-10 text-sm">Clinic Insights</h3>
            <p className="text-xs text-blue-100 mb-5 relative z-10 leading-relaxed">
              You have 12 appointments remaining today. Your next is in 14 minutes.
            </p>
            <button className="w-full bg-white/10 hover:bg-white/20 text-white text-xs font-bold py-2.5 rounded-xl transition-colors backdrop-blur-sm relative z-10 border border-white/10">
              View Daily Summary
            </button>
          </div>
        </div>

      </div>
    </div>
  );
}
