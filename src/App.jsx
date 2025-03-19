import { HashRouter as Router, Routes, Route } from 'react-router-dom';
import Demo from './Demo.jsx';
import CreatorOnboarding from './components/CreatorOnboarding';
import { StyleProvider } from './styles/StyleProvider';

function App() {
  return (
    <StyleProvider>
      <Router>
        <div className="min-h-screen bg-gray-50">
          <Routes>
            <Route path="/" element={<Demo />} />
            <Route path="/become-creator" element={<CreatorOnboarding />} />
          </Routes>
        </div>
      </Router>
    </StyleProvider>
  );
}

export default App; 