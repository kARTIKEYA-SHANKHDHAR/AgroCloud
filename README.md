# AgroCloud — Smart Irrigation System

## Project Structure
```
agrocloud/
├── backend/        # Flask API + ML model
├── frontend/       # React + Vite + Tailwind
├── data/           # irrigation.csv dataset
└── Model/          # train_model.py + model pkl
```

## Setup & Run

### Backend (Python Flask)

```bash
cd backend
pip install -r requirements.txt
python app.py
```
> Runs on http://localhost:5000
> Requires `firebase-key.json` in the backend/ folder (already included).

### Frontend (React + Vite)

```bash
cd frontend
npm install
cp .env.example .env        # or create .env manually
npm run dev
```
> Runs on http://localhost:5173

### .env file for frontend
```
VITE_API_BASE_URL=http://localhost:5000
```

## Bugs Fixed
1. **ProtectedRoute infinite redirect loop** — `ProtectedRoute` was redirecting to role-based routes even when already inside them, causing a redirect loop. Fixed by removing the role-check from `ProtectedRoute` (role checking is `RoleRoute`'s job).
2. **FarmerDashboard syntax error** — `console.log("FarmerDashboard loading", user)` was placed outside the component function, causing a ReferenceError on `user`. Moved/removed it.
3. **FarmerDashboard broken ternary** — `p.timestamp?p.timestamp.toDate?.()` was missing a space before `?`, causing a parse error. Fixed to `p.timestamp ? (p.timestamp.toDate?.() || new Date()) : null`.
4. **RoleRoute wrong fallback** — was redirecting unauthorized roles to `/` (landing page) instead of their own dashboard. Fixed to redirect to the correct role dashboard.
