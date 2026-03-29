const fs = require('fs');
let c = fs.readFileSync('src/pages/DoctorPage.jsx', 'utf8');
const replacement =   const { user } = useAuth();
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function fetchDoctor() {
      const docId = user?.doctorId || user?.id || 1;
      try {
        const res = await axiosClient.get(\\\/doctors/\\\\\\);
        setData(res.data.data);
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
  const patientVisitsData = data.patientVisitsData || [];

  return (

c = c.replace('export default function DoctorPage() {\r\n  return (', replacement);
c = c.replace('export default function DoctorPage() {\n  return (', replacement); // handle lf
fs.writeFileSync('src/pages/DoctorPage.jsx', c);
