import { HashRouter as Router, Routes, Route } from 'react-router-dom';
import Demo from './Demo.jsx';

function App() {
  return (
    <Router>
      <div className="min-h-screen bg-gray-50">
        <Routes>
          <Route path="/" element={<Demo />} />
        </Routes>
      </div>
    </Router>
  );
}

export default App; 