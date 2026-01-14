import { useState } from 'react';
import './global.css';

import Setup, {type ScanConfig} from './components/setup';
import Results, { type EmailResult } from './components/result';
import { Processing, type ProcessingSummary } from './components/processing';
import { Completion } from './components/completion';
import { Settings } from './components/settings';

type Screen = 'setup' | 'settings' | 'privacy' | 'processing' | 'results' | 'completion'

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
  const [itemsToProcess, setItemsToProcess] = useState<EmailResult[]>([])
  const [processingSummary, setProcessingSummary] = useState<ProcessingSummary | null>(null)
  
  // App Settings
  const [settings, setSettings] = useState({
    defaultFolder: 'Inbox',
    defaultSubject: 'scholars',
    skipIncomplete: true,
    exportBehavior: 'new'
  });

  const handleNavigation = (screen: string) => {
    setCurrentScreen(screen as Screen)
  }

  const handleScan = (config: ScanConfig) => {
    // Merge parsing options into config (mocked logic for now)
    console.log('Scanning with config:', config);
    console.log('Using parsing options:', {
      skipIncomplete: settings.skipIncomplete
    });

    setScanConfig(config);
    // Simulate
    const results = generateMockResults();
    setScanResults(results);
    setCurrentScreen('results')
  }

  return (
    <div className="size-full">
      {currentScreen === 'setup' && (
        <Setup 
          onNavigate={handleNavigation} 
          onScan={handleScan}
          defaults={{
            folder: settings.defaultFolder,
            subject: settings.defaultSubject
          }}
        />
      )}

      {currentScreen === 'settings' && (
        <Settings 
          initialSettings={settings}
          onSave={(newSettings) => {
            setSettings(newSettings);
            alert('Settings saved!');
            setCurrentScreen('setup');
          }}
          onBack={() => setCurrentScreen('setup')} 
        />
      )}

      {currentScreen === 'results' &&
        <Results 
          results={scanResults}
          onBack={() => setCurrentScreen('setup')}
          onRescan={() => {
            if (scanConfig) {
              handleScan(scanConfig);
            } else {
              setCurrentScreen('setup');
            }
          }}
          onParse={(selected) => {
            setItemsToProcess(selected);
            setCurrentScreen('processing');
          }}
        />
      }

      {currentScreen === 'processing' && (
        <Processing
          items={itemsToProcess}
          onComplete={(summary) => {
            setProcessingSummary(summary)
            setCurrentScreen('completion')
          }}
          onCancel={() => setCurrentScreen('results')}
        />
      )}

      {currentScreen === 'completion' && processingSummary && (
        <Completion 
          summary={processingSummary}
          onRunAgain={() => setCurrentScreen('setup')}
        />
      )}
    </div>
  );
}

export default App;
