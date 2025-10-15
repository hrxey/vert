import React from 'react'
import {
  BrowserRouter as Router,
  Routes,
  Route,
  Navigate,
} from 'react-router-dom'
import { AuthProvider } from './context/AuthContext'
import { ProtectedRoute } from './components/ProtectedRoute'

// Auth Pages
import { Login } from './pages/Auth/Login'
import { Register } from './pages/Auth/Register'
import { ForgotPassword } from './pages/Auth/ForgotPassword'
import { ResetPassword } from './pages/Auth/ResetPassword'

// App Pages
import { NewAcceptance } from './pages/Acceptance/NewAcceptance'
import CreateUPD from './pages/UPD/CreateUPD'
import { UPDArchive } from './pages/UPD/UPDArchive'
import { ViewUPD } from './pages/UPD/ViewUPD'
import { Archive } from './pages/Archive/Archive'
import { EditReception } from './pages/Archive/EditReception'
import { Settings } from './pages/Settings'
import { Motors } from './pages/Reference/Motors'
import { Counterparties } from './pages/Reference/Counterparties'
import { Subdivisions } from './pages/Reference/Subdivisions'
import Wires from './pages/Reference/Wires'
import Bearings from './pages/Reference/Bearings'
import Impellers from './pages/Reference/Impellers'
import { LaborPayments } from './pages/Reference/LaborPayments'
import { SpecialDocuments } from './pages/Reference/SpecialDocuments'
import { MotorDetails } from './pages/Motors/MotorDetails'
import { EditMotorDetails } from './pages/Motors/EditMotorDetails'

function App() {
  return (
    <Router>
      <AuthProvider>
        <Routes>
          {/* Public Routes */}
          <Route path="/login" element={<Login />} />
          <Route path="/register" element={<Register />} />
          <Route path="/forgot-password" element={<ForgotPassword />} />
          <Route path="/reset-password" element={<ResetPassword />} />

          {/* Protected Routes (App Layout) */}
          <Route path="/app" element={<ProtectedRoute />}>
            <Route index element={<Navigate to="acceptance" replace />} />
            <Route path="acceptance" element={<NewAcceptance />} />
            <Route path="archive" element={<Archive />} />
            <Route path="archive/:receptionId" element={<EditReception />} />
            <Route path="upd-archive" element={<UPDArchive />} />
            <Route path="upd-archive/:updId" element={<ViewUPD />} />
            <Route path="settings" element={<Settings />} />
            {/* Reference Data */}
            <Route path="reference/motors" element={<Motors />} />
            <Route path="reference/counterparties" element={<Counterparties />} />
            <Route path="reference/subdivisions" element={<Subdivisions />} />
            <Route path="reference/wires" element={<Wires />} />
            <Route path="reference/bearings" element={<Bearings />} />
            <Route path="reference/impellers" element={<Impellers />} />
            <Route path="reference/labor-payments" element={<LaborPayments />} />
            <Route path="reference/special-documents" element={<SpecialDocuments />} />
            {/* Motor Details */}
            <Route path="motors/:id" element={<MotorDetails />} />
            <Route path="motors/:id/edit" element={<EditMotorDetails />} />
          </Route>

          {/* UPD Routes (outside app layout) */}
          <Route path="/upd" element={<ProtectedRoute />}>
            <Route index element={<CreateUPD />} />
            <Route path="create" element={<CreateUPD />} />
          </Route>

          {/* Default Redirects */}
          <Route path="/" element={<Navigate to="/app/acceptance" replace />} />
          <Route path="*" element={<Navigate to="/app/acceptance" replace />} />
        </Routes>
      </AuthProvider>
    </Router>
  )
}

export default App
