import { Routes, Route } from 'react-router-dom'

export default function App() {
  return (
    <Routes>
      <Route path="/" element={<h1 className="p-6 text-xl font-semibold">Smart Warehouse Monitor</h1>} />
    </Routes>
  )
}
