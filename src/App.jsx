import { HashRouter as Router, Routes, Route } from 'react-router-dom';
import UnifiedInterface from './UnifiedInterface.jsx';

function App() {
  return (
    <Router>
      <div className="min-h-screen h-screen flex flex-col bg-gray-50 overflow-hidden">
        <Routes>
          <Route path="/" element={<UnifiedInterface />} />
        </Routes>
      </div>
    </Router>
  );
}

export default App; 