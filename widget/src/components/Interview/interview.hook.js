import NoSleep from 'nosleep.js';
import { useEffect } from 'react';

export async function registerCall({
  agent_id,
  retell_llm_dynamic_variables,
  metadata,
}) {
  try {
    // Replace with your server url
    const response = await fetch('/_hcms/api/register-call', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        agent_id: agent_id,
        retell_llm_dynamic_variables: retell_llm_dynamic_variables,
        metadata: metadata,
      }),
    });

    if (!response.ok) {
      throw new Error(`Error: ${response.status}`);
    }

    const data = await response.json();
    return data;
  } catch (err) {
    console.log(err);
    throw new Error(err);
  }
}

export async function saveCallDataToHubSpot(call_id) {
  if (!call_id) {
    throw new Error('saveCallDataToHubSpot Error: Call ID is required');
  }

  try {
    // Replace with your server url
    const response = await fetch('/_hcms/api/save-call', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        call_id: call_id,
      }),
    });

    if (!response.ok) {
      throw new Error(`Error: ${response.status}`);
    }

    const data = await response.json();
    return data;
  } catch (err) {
    console.log(err);
    throw new Error(err);
  }
}

const noSleep = new NoSleep();
export const useNoSleep = () => {
  useEffect(() => {
    noSleep.enable();
    return () => {
      noSleep.disable();
    };
  }, []);
};
