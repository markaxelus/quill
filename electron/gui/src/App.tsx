import { useState } from 'react';
import './global.css';

import Setup, {type ScanConfig} from './components/setup';
import Results, { type EmailResult } from './components/result';

type Screen = 'setup' | 'settings' | 'privacy' | 'processing' | 'results'

const generateMockResults = (): EmailResult[] => {
  const applicants = [
    { name: 'Sarah Chen', email: 'sarah.chen@university.edu' },
    { name: 'Michael Rodriguez', email: 'michael.rodriguez@college.edu' },
    { name: 'Emily Watson', email: 'emily.watson@school.edu' },
    { name: 'James Kim', email: 'james.kim@uni.edu' },
    { name: 'Olivia Martinez', email: 'olivia.martinez@university.edu' },
    { name: 'Daniel Thompson', email: 'daniel.thompson@college.edu' },
    { name: 'Sophia Lee', email: 'sophia.lee@school.edu' },
    { name: 'Alexander Brown', email: 'alexander.brown@uni.edu' },
    { name: 'Isabella Garcia', email: 'isabella.garcia@university.edu' },
    { name: 'Benjamin Taylor', email: 'benjamin.taylor@college.edu' },
    { name: 'Mia Anderson', email: 'mia.anderson@school.edu' },
    { name: 'Lucas White', email: 'lucas.white@uni.edu' },
  ];

  return applicants.map((applicant, idx) => ({
    id: `email-${idx}`,
    date: new Date(2026, 0, 2 + idx).toISOString(),
    sender: applicant.email,
    subject: `Scholars Program Application - ${applicant.name}`,
    attachment: `${applicant.name.replace(' ', '_')}_Application.docx`,
    status: idx === 10 ? 'warning' : 'ready',
  }));
};

function App() {
  const [currentScreen, setCurrentScreen] = useState<Screen>('setup');
  const [scanConfig, setScanConfig] = useState<ScanConfig | null>(null);
  const [scanResults, setScanResults] = useState<EmailResult[]>([])

  const handleNavigation = (screen: string) => {
    setCurrentScreen(screen as Screen)
  }

  const handleScan = (config: ScanConfig) => {
    setScanConfig(config);
    // Simulate
    const results = generateMockResults();
    setScanResults(results);
    setCurrentScreen('results')
  }

  return (
    <div className="size-full">
      {currentScreen === 'setup' && (
        <Setup onNavigate={handleNavigation} onScan={handleScan} />
      )}

      {currentScreen === 'results' &&
        <Results />
      }
    </div>
  );
}

export default App;
