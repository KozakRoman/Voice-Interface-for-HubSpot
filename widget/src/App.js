import React from 'react';

import Interview from './components/Interview/Interview';

function App({ moduleData }) {
  // console.log(
  //   'all of your data typically accessed via the "module" keyword in HubL is available as JSON here!',
  //   moduleData,
  // );
  return (
    <Interview
      agent_id={moduleData.agent_id}
      header={moduleData.header}
      formHeader={moduleData.form_header}
      recordEndMessage={moduleData.record_end_message}
    />
  );
}

export default App;
