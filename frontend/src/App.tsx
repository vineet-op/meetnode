import './App.css'
import Hero from './components/Hero'
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom'
import SchedulePage from './components/SchedulePage'
import Instant from './components/Instant'


function App() {
  return (
    <>
      <Router>
        <Routes>
          <Route path="/" element={<Hero />} />
          <Route path="/schedule" element={<SchedulePage />} />
          <Route path='/instant' element={<Instant />} />
        </Routes>
      </Router>
    </>
  )
}

export default App
