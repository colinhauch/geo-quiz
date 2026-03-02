import { BrowserRouter as Router, Routes, Route } from 'react-router-dom'
import PackSelector from './components/PackSelector/PackSelector'
import Quiz from './components/Quiz/Quiz'
import StatsDashboard from './components/StatsDashboard/StatsDashboard'

export default function App() {
  return (
    <Router>
      <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100">
        <header className="bg-white shadow">
          <div className="max-w-7xl mx-auto px-4 py-4">
            <h1 className="text-3xl font-bold text-indigo-600">Geography Knowledge App</h1>
          </div>
        </header>
        <main className="max-w-7xl mx-auto px-4 py-8">
          <Routes>
            <Route path="/" element={<PackSelector />} />
            <Route path="/quiz" element={<Quiz />} />
            <Route path="/stats" element={<StatsDashboard />} />
          </Routes>
        </main>
      </div>
    </Router>
  )
}
