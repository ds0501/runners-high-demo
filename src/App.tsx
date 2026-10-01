import { BrowserRouter, Navigate, Route, Routes } from 'react-router'
import AppLayout from './components/AppLayout'
import HomePage from './pages/HomePage'
import ParentReportPage from './pages/ParentReportPage'
import StudyTimerDemo from './pages/StudyTimerDemo'

export default function App() {
  return (
    <BrowserRouter>
      <Routes>
        <Route element={<AppLayout />}>
          <Route index element={<HomePage />} />
          <Route path="study" element={<StudyTimerDemo />} />
          <Route path="parent-report/:studentId" element={<ParentReportPage />} />
          <Route path="*" element={<Navigate to="/" replace />} />
        </Route>
      </Routes>
    </BrowserRouter>
  )
}
