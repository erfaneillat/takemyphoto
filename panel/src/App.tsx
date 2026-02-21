import { BrowserRouter as Router, Routes, Route } from 'react-router-dom'
import AdminLayout from './components/layout/AdminLayout'
import Dashboard from './pages/Dashboard'
import Login from './pages/Login'
import Categories from './pages/Categories'
import Styles from './pages/Styles'
import GeneratedImages from './pages/GeneratedImages'
import Contacts from './pages/Contacts'
import ErrorLogs from './pages/ErrorLogs'
import Shops from './pages/Shops'
import ShopCategories from './pages/ShopCategories'
import ShopCategorySamples from './pages/ShopCategorySamples'
import ShopStyles from './pages/ShopStyles'
import ShopLogos from './pages/ShopLogos'
import Users from './pages/Users'
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
          <Route path="users" element={<Users />} />
          <Route path="contacts" element={<Contacts />} />
          <Route path="error-logs" element={<ErrorLogs />} />
          <Route path="shops" element={<Shops />} />
          <Route path="shops/categories" element={<ShopCategories />} />
          <Route path="shops/samples" element={<ShopCategorySamples />} />
          <Route path="shops/styles" element={<ShopStyles />} />
          <Route path="shops/logos" element={<ShopLogos />} />
        </Route>
      </Routes>
    </Router>
  )
}

export default App
