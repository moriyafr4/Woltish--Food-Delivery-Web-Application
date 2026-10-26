import { useEffect, useState } from 'react';

export function useClientOnlyValue(server, client) {
  const [value, setValue] = useState(server);
  useEffect(() => {
    setValue(client);
  }, [client]);

  return value;
}
