import { BrowserRouter, Navigate, Route, Routes, Link } from 'react-router-dom'
import { AuthProvider } from './context/AuthContext.jsx'
import { ToastProvider } from './context/ToastContext.jsx'
import { Icon } from './components/ui/Icon.jsx'
import ProtectedRoute from './routes/ProtectedRoute.jsx'
import AdminLayout from './components/layout/AdminLayout.jsx'
import LoginPage from './pages/LoginPage/LoginPage.jsx'
import DashboardPage from './pages/DashboardPage/DashboardPage.jsx'
import SettingsPage from './pages/SettingsPage/SettingsPage.jsx'
import PropertiesPage from './pages/PropertiesPage/PropertiesPage.jsx'
import PropertyFormPage from './pages/PropertyFormPage/PropertyFormPage.jsx'
import PropertyDetailPage from './pages/PropertyDetailPage/PropertyDetailPage.jsx'
import InquiriesPage from './pages/InquiriesPage/InquiriesPage.jsx'
import InquiryDetailPage from './pages/InquiryDetailPage/InquiryDetailPage.jsx'
import ViewingRequestsPage from './pages/ViewingRequestsPage/ViewingRequestsPage.jsx'
import ViewingRequestDetailPage from './pages/ViewingRequestDetailPage/ViewingRequestDetailPage.jsx'
import UsersPage from './pages/UsersPage/UsersPage.jsx'
import UserDetailPage from './pages/UserDetailPage/UserDetailPage.jsx'

function NotFound() {
  return (
    <div className="flex flex-col items-center justify-center gap-3 rounded-xl border border-dashed border-gray-300 bg-white px-6 py-16 text-center shadow-sm">
      <div className="flex h-12 w-12 items-center justify-center rounded-full bg-gray-100 text-gray-400">
        <Icon name="alert" className="h-6 w-6" />
      </div>
      <p className="text-3xl font-bold text-gray-300">404</p>
      <p className="text-sm text-gray-600">This page is not available yet.</p>
      <Link
        to="/dashboard"
        className="mt-2 inline-flex items-center gap-1.5 text-sm font-medium text-blue-600 hover:underline"
      >
        Back to Dashboard
      </Link>
    </div>
  )
}

export default function App() {
  return (
    <ToastProvider>
      <AuthProvider>
        <BrowserRouter>
          <Routes>
            <Route path="/login" element={<LoginPage />} />
            <Route element={<ProtectedRoute />}>
              <Route element={<AdminLayout />}>
                <Route path="/" element={<Navigate to="/dashboard" replace />} />
                <Route path="/dashboard" element={<DashboardPage />} />
                <Route path="/settings" element={<SettingsPage />} />
                <Route path="/properties" element={<PropertiesPage />} />
                <Route path="/properties/new" element={<PropertyFormPage />} />
                <Route path="/properties/:propertyId" element={<PropertyDetailPage />} />
                <Route path="/properties/:propertyId/edit" element={<PropertyFormPage />} />
                <Route path="/inquiries" element={<InquiriesPage />} />
                <Route path="/inquiries/:inquiryId" element={<InquiryDetailPage />} />
                <Route path="/viewing-requests" element={<ViewingRequestsPage />} />
                <Route path="/viewing-requests/:viewingId" element={<ViewingRequestDetailPage />} />
                <Route path="/users" element={<UsersPage />} />
                <Route path="/users/:userId" element={<UserDetailPage />} />
                <Route path="*" element={<NotFound />} />
              </Route>
            </Route>
            <Route path="*" element={<Navigate to="/login" replace />} />
          </Routes>
        </BrowserRouter>
      </AuthProvider>
    </ToastProvider>
  )
}
