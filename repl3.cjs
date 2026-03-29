const fs = require('fs');

const path = 'src/pages/DoctorPage.jsx';
let content = fs.readFileSync(path, 'utf8');

const regex = /<div className="flex gap-4 overflow-x-auto pb-2 scrollbar-none">[\s\S]*?<\/div>\s*<\/div>/;

const replacement = `<div className="flex gap-4 overflow-x-auto pb-2 scrollbar-none">
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
                    <div key={i} className={\`min-w-[160px] \${parts[2]} border-l-4 \${parts[0]} p-3 rounded-lg flex-shrink-0\`}>
                      <p className={\`text-xs font-bold \${parts[1]} mb-1\`}>{appt.scheduledAt || new Date(appt.date).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}</p>
                      <p className="text-sm font-semibold text-gray-800">{appt.patientName}</p>
                      <p className="text-xs text-gray-500">{appt.reason || 'Checkup'}</p>
                    </div>
                  );
                })
              ) : (
                <div className="text-sm text-gray-500 p-2">No upcoming appointments</div>
              )}
            </div>
          </div>`;

content = content.replace(regex, replacement);
fs.writeFileSync(path, content);
console.log('done!');
