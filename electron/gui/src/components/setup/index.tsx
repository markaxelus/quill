import { useState } from 'react';

type Props = {}

const Setup = () => {
  const [folder, setFolder] = useState('Inbox');
  const [subjectFilter, setSubjectFilter] = useState('scholars');
  const [fromDate, setFromDate] = useState('2026-01-01');
  const [outputPath, setOutputPath] = useState('');

  return (
    <div>
      <div className="div">
         {/* Heading */}
        <div className="">
          <h1>Scholars Application Parser</h1>
          <p>Process Scholars Program applications from email attachments into a structured Excel file.
              All processing happens locally on your computer.
          </p>
        </div>

        {/* Email Source */}
        
      </div>
    </div>
  )
}

export default Setup