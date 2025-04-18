import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import Navbar from './components/Navbar';
import Home from './views/Home';
import Courses from './views/Courses';
import Practise from './views/Practise';
import Contest from './views/Contest';
import Mock from './views/Mock';
import TestScreen from './views/TestScreen';

function App() {
  return (
    <Router>
      <Navbar/>
      <Routes>
        <Route path="/home" element={<Home />} />
        <Route path="/courses" element={<Courses />} />
        <Route path="/practise" element={<Practise />} />
        <Route path="/contest" element={<Contest />} />
        <Route path="/mock" element={<Mock />} />
        <Route path="/mock/test/:testId" element={<TestScreen />} />
      </Routes>
    </Router>
  );
}

export default App;
