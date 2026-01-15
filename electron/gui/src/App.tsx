import { useState } from 'react';
import { api } from './api';
import './global.css';

import Setup, {type ScanConfig} from './components/setup';
import Results, { type EmailResult } from './components/result';
import { Processing, type ProcessingSummary } from './components/processing';
import { Completion } from './components/completion';
import { Settings } from './components/settings';
import { Privacy } from './components/privacy';

type Screen = 'setup' | 'settings' | 'privacy' | 'processing' | 'results' | 'completion'



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
    exportBehavior: 'new',
    outputPath: ''
  });

  const handleNavigation = (screen: string) => {
    setCurrentScreen(screen as Screen)
  }

  const handleScan = async (config: ScanConfig) => {
    console.log('Scanning with config:', config);
    setScanConfig(config);
    setSettings(prev => ({ ...prev, outputPath: config.outputPath }));
    
    try {
      const results = await api.scanInbox(config);
      setScanResults(results);
      setCurrentScreen('results')
    } catch (e) {
      console.error("Scan failed:", e);
      alert("Failed to scan: " + e);
    }
  }

  return (
    <div className="size-full">
      {currentScreen === 'setup' && (
        <Setup 
          onNavigate={handleNavigation} 
          onScan={handleScan}
          defaults={{
            folder: settings.defaultFolder,
            subject: settings.defaultSubject,
            outputPath: settings.outputPath
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

      {currentScreen === 'privacy' && (
        <Privacy onBack={() => setCurrentScreen('setup')} />
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
          startProcessing={async (onProgress) => {
             return api.processApplications(itemsToProcess, {
               skipIncomplete: settings.skipIncomplete,
               exportBehavior: settings.exportBehavior,
               outputPath: scanConfig?.outputPath
             }, onProgress);
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
