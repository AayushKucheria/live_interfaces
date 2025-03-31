import { HashRouter as Router, Routes, Route } from 'react-router-dom';
import Demo from './Demo.jsx';
import LoopyDemo from './LoopyDemo.jsx';

function App() {
  return (
    <Router>
      <div className="min-h-screen h-screen flex flex-col bg-gray-50 overflow-hidden">
        <Routes>
          <Route path="/" element={<Demo />} />
          <Route path="/loopy" element={<LoopyDemo />} />
        </Routes>
      </div>
    </Router>
  );
}

export default App; 