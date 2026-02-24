# Testing Guide - Patient Dashboard Fixes

## Test Account
- **Email**: alice.patient@example.com
- **Password**: password123
- **Patient ID**: 86
- **Assigned Token**: #1

## What Was Fixed

### 1. ✅ Dashboard 403 Error → FIXED
Previously, the dashboard would fail to load appointments with a 403 error. Now:
- JWT token includes `patientId` in payload
- Backend automatically identifies patient from token
- No more authorization errors

### 2. ✅ Appointments Display → FIXED  
After booking an appointment, it now properly shows in the dashboard with:
- Doctor name and specialty
- Clinic location
- **Token number** (displayed with # icon)
- Date and time
- Status badge

### 3. ✅ Live Token Number → ADDED
Each appointment card now shows:
```
#Token: 1
```
This is the queue number assigned when booking.

### 4. ✅ Click to Queue Page → ADDED
Clicking any appointment card navigates to `/queue` page showing:
- Current token being served
- Total people in queue
- Patient's own token and position
- Estimated wait time

## How to Test

### Step 1: Start Backend
```powershell
cd d:/Clinic-Backend
npm run dev
```
Backend runs at: http://localhost:4000

### Step 2: Start Frontend  
```powershell
cd d:/Clinic-Frontend
npm run dev
```
Frontend runs at: http://localhost:5173 (or similar)

### Step 3: Login as Patient
1. Navigate to login page
2. Enter credentials:
   - Email: `alice.patient@example.com`
   - Password: `password123`
3. ✅ Should successfully login and redirect to dashboard

### Step 4: Verify Dashboard
On the dashboard, you should see:
- ✅ "Welcome back, Patient" header
- ✅ Upcoming Appointments widget with at least 1 appointment
- ✅ Appointment shows:
  - Date: Feb 25
  - Doctor: Dr. John Doe (General Practitioner)
  - Location: City Care Medical Center
  - **Token #1** (with blue badge)
  - Status: BOOKED

### Step 5: Click Appointment
1. Click on the appointment card
2. ✅ Should navigate to `/queue` page
3. ✅ Page should show:
   - Selected doctor: Dr. John Doe (auto-selected)
   - Current token: #2 (or whatever is in consultation)
   - Your token card at bottom: #1
   - "I Have Arrived" button (if status is BOOKED)

### Step 6: Check Developer Console
Open browser console (F12) and verify:
- ✅ No 403 errors
- ✅ No "Unable to resolve patient identity" errors
- ✅ Successful API calls to `/appointments`

## API Endpoints Being Used

### Login
```
POST http://localhost:4000/auth/login
Body: { identifier: "alice.patient@example.com", password: "password123" }
Response: { token, role, user: { patientId: 86, ... } }
```

### Fetch Appointments  
```
GET http://localhost:4000/appointments?upcoming=true
Headers: Authorization: Bearer <token>
Response: { data: [{ id, tokenNumber, doctor, patient, status, ... }] }
```

### Queue Status
```
GET http://localhost:4000/appointments/queue/42?patientId=86
Headers: Authorization: Bearer <token>
Response: { 
  currentInConsultation: { tokenNumber: 2 },
  arrivedToday: 2,
  patientPosition: { tokenNumber: 1, estimatedWaitMinutes: 0 }
}
```

## Expected Frontend Behavior

### AppContext Hook
- `appointments` array populated from API
- Each appointment has:
  - `id`, `tokenNumber`, `date`, `time`
  - `doctor`, `speciality`, `location`
  - `status`, `doctorId`, `clinicId`

### UpcomingAppointmentsWidget
- Displays token number if available
- Clickable cards navigate to `/queue`
- Shows proper status badges

### QueuePage
- Auto-selects doctor from patient's appointment
- Shows current token being served
- Shows patient's token in bottom card
- Updates every 15 seconds

## Common Issues & Solutions

### Issue: Still getting 403 errors
**Solution**: Make sure you're logged in with the new token. Old tokens don't have `patientId`. Re-login to get a fresh token.

### Issue: Appointments not showing
**Solution**: 
1. Check that backend is running
2. Verify token is being sent in Authorization header
3. Check console for error messages
4. Make sure patient has appointments in database (alice.patient@example.com has 1 appointment)

### Issue: Token number not displaying
**Solution**: The appointment must have a `tokenNumber` field. Seed data includes token numbers 1-10 for existing appointments.

### Issue: Queue page shows wrong doctor
**Solution**: Queue page now auto-selects the doctor from your appointment. If you have multiple appointments, it picks the first one.

## Database State

Current seed data includes:
- **5 Clinics** across different locations
- **12 Doctors** (2-3 per clinic)
- **10 Patients** with various appointments
- **Alice Patient** has 1 appointment:
  - Doctor: Dr. John Doe
  - Token: #1
  - Status: BOOKED
  - Date: Feb 25, 2026

## Success Criteria

All these should work without errors:
- ✅ Login as patient
- ✅ See appointments in dashboard
- ✅ See token number on appointments
- ✅ Click appointment to go to queue
- ✅ Queue page shows your token
- ✅ No 403 errors in console
- ✅ Live updates every 15 seconds on queue page
