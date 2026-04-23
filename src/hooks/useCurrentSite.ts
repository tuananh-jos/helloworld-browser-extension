import { useState, useEffect } from 'react';
import { getCurrentTabUrl, getHostname } from '../utils/tabs';

export function useCurrentSite() {
  const [hostname, setHostname] = useState('');

  useEffect(() => {
    getCurrentTabUrl().then((url) => setHostname(getHostname(url)));
  }, []);

  return hostname;
}
