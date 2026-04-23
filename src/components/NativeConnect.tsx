import { useState } from 'react';
import { pingNativeHost, PongResponse } from '../utils/nativeMessaging';

type Status = 'idle' | 'loading' | 'success' | 'error';

function NativeConnect() {
  const [status, setStatus] = useState<Status>('idle');
  const [response, setResponse] = useState<PongResponse | null>(null);
  const [errorMsg, setErrorMsg] = useState('');

  const handlePing = async () => {
    setStatus('loading');
    setResponse(null);
    try {
      const res = await pingNativeHost();
      setResponse(res);
      setStatus('success');
    } catch (err) {
      setErrorMsg(err instanceof Error ? err.message : 'Unknown error');
      setStatus('error');
    }
  };

  return (
    <div className="native-section">
      <div className="native-header">
        <span>🖥️ Win32 App</span>
        <button
          className="btn-ping"
          onClick={handlePing}
          disabled={status === 'loading'}
        >
          {status === 'loading' ? 'Connecting...' : 'Ping'}
        </button>
      </div>

      {status === 'success' && response && (
        <div className="native-response">
          <div className="native-response-title">{response.message}</div>
          <div className="native-response-row"><span>OS</span><span>{response.os}</span></div>
          <div className="native-response-row"><span>User</span><span>{response.user}</span></div>
          <div className="native-response-row"><span>Machine</span><span>{response.machine}</span></div>
          <div className="native-response-row"><span>Time</span><span>{response.time}</span></div>
        </div>
      )}

      {status === 'error' && (
        <div className="native-error">
          {errorMsg.includes('Specified native messaging host not found')
            ? '⚠️ Native host chưa được cài. Chạy install.ps1 trước.'
            : `✗ ${errorMsg}`}
        </div>
      )}
    </div>
  );
}

export default NativeConnect;
