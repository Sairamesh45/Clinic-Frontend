const fs = require('fs');
let c = fs.readFileSync('src/pages/DoctorPage.jsx', 'utf8');

c = c.replace(
  "import { useAuth } from '../hooks/useAuth';",
  "import { useAuth } from '../hooks/useAuth';\nimport { useDoctorAppointments } from '../hooks/useDoctorAppointments';"
);

c = c.replace(
  "const { user } = useAuth();",
  "const { user } = useAuth();\n  const { appointments } = useDoctorAppointments();"
);

c = c.replace(
  /\{\/\*\s*Timeline Item 1\s*\*\/\}[\s\S]*?\{\/\*\s*Timeline Item 4\s*\*\/\}[\s\S]*?<\/div>/,
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
                    <div key={i} className={\min-w-[160px] \ border-l-4 \ p-3 rounded-lg flex-shrink-0\}>
                      <p className={\	ext-xs font-bold \ mb-1\}>{appt.scheduledAt || new Date(appt.date).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}</p>
                      <p className="text-sm font-semibold text-gray-800">{appt.patientName}</p>
                      <p className="text-xs text-gray-500">{appt.reason || 'Checkup'}</p>
                    </div>
                  );
                })
              ) : (
                <div className="text-sm text-gray-500 p-2">No upcoming appointments</div>
              )}
);

fs.writeFileSync('src/pages/DoctorPage.jsx', c);
