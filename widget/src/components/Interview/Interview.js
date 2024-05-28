import React, { useState } from 'react';

import { StartCallFrom } from './CallInitFrom.js';
import InterviewRecord from './InterviewRecord.js';

const Interviews = ({ agent_id, header, formHeader, recordEndMessage }) => {
  const [interviewee, setInterviewee] = useState(null);
  const [isCallEnded, setIsCallEnded] = useState(false);
  const [call_id, setCallId] = useState(null);

  const startConversationHandler = ({ fname, lname, email, product }) => {
    setInterviewee({
      first_name: fname,
      last_name: lname,
      email: email,
      product_name: product,
    });
  };

  const endInterviewHandler = ({ call_id }) => {
    console.log('Stop conversation', call_id);
    setInterviewee(null);
    setIsCallEnded(true);
    setCallId(call_id);
  };

  return (
    <div className='kohorta-voice-feedback-app__container'>
      <header className='kohorta-voice-feedback-app__header'>
        <h3 className='kohorta-voice-feedback-app__title'>{header}</h3>
        {!interviewee && !isCallEnded && (
          <>
            <span className='kohorta-voice-feedback-app__subtitle'>{formHeader}</span>
          </>
        )}
      </header>

      {!interviewee && !isCallEnded && (
        <StartCallFrom onSubmit={startConversationHandler} />
      )}
      {interviewee && !isCallEnded && (
        <InterviewRecord
          agent_id={agent_id}
          user_payload={interviewee}
          onCallEnd={endInterviewHandler}
        />
      )}
      {isCallEnded && (
       <p className='kohorta-voice-feedback-app__goodbye'>
        {recordEndMessage}
      </p>
      )}
    </div>
  );
};

export default Interviews;
