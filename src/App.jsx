import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import Demo from './Demo.jsx';
import CreatorOnboarding from './components/CreatorOnboarding';

function App() {
  // Use basename in production (GitHub Pages) only
  const basename = window.location.pathname.startsWith('/live_interfaces') ? '/live_interfaces' : '';
  
  return (
    <Router basename={basename}>
      <div className="min-h-screen bg-gray-50">
        <Routes>
          <Route path="/" element={<Demo />} />
          <Route path="/become-creator" element={<CreatorOnboarding />} />
        </Routes>
      </div>
    </Router>
  );
}

export default App; 