import { BrowserRouter as Router, Routes, Route } from 'react-router-dom'
import AdminLayout from './components/layout/AdminLayout'
import Dashboard from './pages/Dashboard'
import Login from './pages/Login'
import Categories from './pages/Categories'
import Styles from './pages/Styles'
import GeneratedImages from './pages/GeneratedImages'
import Contacts from './pages/Contacts'
import { ProtectedRoute } from './components/ProtectedRoute'
import { AuthDebugWidget } from './components/AuthDebugWidget'

function App() {
  return (
    <Router basename="/panel">
      <AuthDebugWidget />
      <Routes>
        <Route path="login" element={<Login />} />
        <Route
          path=""
          element={
            <ProtectedRoute>
              <AdminLayout />
            </ProtectedRoute>
          }
        >
          <Route index element={<Dashboard />} />
          <Route path="categories" element={<Categories />} />
          <Route path="styles" element={<Styles />} />
          <Route path="generated-images" element={<GeneratedImages />} />
          <Route path="contacts" element={<Contacts />} />
        </Route>
      </Routes>
    </Router>
  )
}

export default App
