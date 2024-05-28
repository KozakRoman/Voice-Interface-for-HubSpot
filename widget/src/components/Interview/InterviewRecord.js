import React, { useEffect, useState, useRef } from 'react';
import { RetellWebClient } from 'retell-client-js-sdk';
import moment from 'moment';
import Loader from '../Loader/SmallLoader.js';
import {
  useNoSleep,
  registerCall,
  saveCallDataToHubSpot,
} from './interview.hook.js';

// get cookie utk
const getCookie = (name) => {
  const value = `; ${document.cookie}`;
  const parts = value.split(`; ${name}=`);
  if (parts.length === 2) return parts.pop().split(';').shift();
};

const webClient = new RetellWebClient();

const useRetellWebClient = ({ agent_id, user_payload, stream, onCallEnd }) => {
  if (!agent_id) {
    throw new Error('Missing agent_id');
  }

  //   mocking the hook
  // return {
  //   startingCall: false,
  //   isCalling: true,
  //   call_id: '1234-5678-91011-1213',
  //   stopConversation: () => {},
  // };

  const isInProsesRef = useRef(false);

  const [isCalling, setIsCalling] = useState(false);
  const [startingCall, setStartingCall] = useState(true);
  const [callCred, setCallCred] = useState(null);

  useEffect(() => {
    if (!callCred) return;

    console.log('call_id in useEffect', callCred);

    // Setup event listeners
    webClient.on('conversationStarted', () => {
      console.log('conversationStarted');
      setIsCalling(true);
      setStartingCall(false);
    });

    webClient.on('audio', (audio) => {
      // console.log("There is audio");
    });

    webClient.on('conversationEnded', async ({ code, reason }) => {
      console.log('Closed with code:', code, ', reason:', reason);
      console.log('call_id in conversationEnded', callCred);
      await saveCallDataToHubSpot(callCred.id); // Save call data to HubSpot
      setIsCalling(false); // Update button to "Start" when conversation ends
      onCallEnd({ call_id: callCred.id });
    });

    webClient.on('error', (error) => {
      console.error('An error occurred:', error);
      setIsCalling(false); // Update button to "Start" in case of error
    });

    webClient.on('update', (update) => {
      // Print live transcript as needed
      // console.log('update', update);
    });

    webClient.on('metadata', (metadata) => {
      // Print metadata as needed
      console.log('metadata', metadata);
    });

    webClient.startConversation({
      callId: callCred.id,
      sampleRate: callCred.sample_rate,
      enableUpdate: true,
      customStream: stream,
    });
  }, [callCred]);

  useEffect(() => {
    (async () => {
      if (!user_payload || !stream?.active || !registerCall) return;

      if (isInProsesRef.current) return;
      isInProsesRef.current = true;

      try {
        setStartingCall(true);
        const data = await registerCall({
          agent_id,
          retell_llm_dynamic_variables: {
            first_name: user_payload.first_name,
            last_name: user_payload.last_name,
            email: user_payload.email,
            product_name: user_payload.product_name,
          },
          metadata: {
            call_type: 'feedback-interview',
            email: user_payload.email,
            utk: getCookie('hubspotutk'),
            first_name: user_payload.first_name,
            last_name: user_payload.last_name,
          },
        });

        const { call_id, sample_rate } = data || {};
        if (!call_id) {
          throw new Error('Error: Call ID not found in response');
        }

        setCallCred({
          id: call_id,
          sample_rate,
        });
      } catch (err) {
        console.error(err);
        setStartingCall(false);
      }
    })();
  }, [user_payload, stream, registerCall]);

  return {
    startingCall: startingCall,
    isCalling,
    stopConversation: () => {
      webClient.stopConversation();
    },
  };
};

const useGetAudioStream = (errCallBack) => {
  const [audioStream, setAudioStream] = useState(null);

  useEffect(() => {
    navigator.mediaDevices
      .getUserMedia({
        audio: {
          sampleRate: 24000,
          echoCancellation: true,
          noiseSuppression: true,
          channelCount: 1,
        },
      })
      .then((stream) => {
        setAudioStream(stream);
      })
      .catch((err) => errCallBack(err));

    return () => {
      audioStream?.getTracks().forEach((track) => {
        track.stop();
      });
    };
  }, []);

  return audioStream;
};

const useAudioLevel = ({ audioStream, onAudio }) => {
  const audioContext = useRef(null);
  const analyser = useRef(null);
  const microphone = useRef(null);
  const javascriptNode = useRef(null);

  useEffect(() => {
    if (!audioStream?.active) return;

    audioContext.current = new AudioContext({ sampleRate: 24000 });
    analyser.current = audioContext.current.createAnalyser();
    microphone.current =
      audioContext.current.createMediaStreamSource(audioStream);
    javascriptNode.current = audioContext.current.createScriptProcessor(
      2048,
      1,
      1,
    );

    analyser.current.smoothingTimeConstant = 0.2;
    analyser.current.fftSize = 1024;

    microphone.current.connect(analyser.current);
    analyser.current.connect(javascriptNode.current);
    javascriptNode.current.connect(audioContext.current.destination);

    javascriptNode.current.onaudioprocess = () => {
      const array = new Uint8Array(analyser.current.frequencyBinCount);
      analyser.current.getByteFrequencyData(array);
      let values = 0;

      const length = array.length;
      for (let i = 0; i < length; i++) {
        values += array[i];
      }

      onAudio(values / length);
    };

    return () => {
      javascriptNode.current?.disconnect();
      analyser.current?.disconnect();
      microphone.current?.disconnect();
      audioContext.current?.suspend();
      audioContext.current?.close();
    };
  }, [audioStream]);
};

const useTimer = (isCalling) => {
  const [time, setTime] = useState(0);
  useEffect(() => {
    if (!isCalling) return;
    const interval = setInterval(() => {
      setTime((time) => time + 1);
    }, 1000);
    return () => clearInterval(interval);
  }, [isCalling]);
  return time;
};

const InterviewRecord = ({ agent_id, user_payload, onCallEnd }) => {
  const [isStopping, setIsStopping] = useState(false);

  useNoSleep();

  const audioStream = useGetAudioStream((err) => {
    console.error('Error getting audio stream', err);
    // TODO: Handle error here (e.g. show error message to user)
  });

  const { startingCall, isCalling, stopConversation } = useRetellWebClient({
    agent_id,
    user_payload,
    stream: audioStream,
    onCallEnd: onCallEnd,
  });

  const btnRef = useRef(null);

  const setAudioLevel = (audioLevel) => {
    if (audioLevel < 1) return;
    requestAnimationFrame(() => {
      let scale = 1 + audioLevel / 75;
      scale = scale > 2 ? 2 : scale;

      btnRef.current && (btnRef.current.style.transform = `scale(${scale})`);
    });
  };

  useAudioLevel({ audioStream, onAudio: setAudioLevel });

  const time = useTimer(isCalling);

  const onCallEndHandler = () => {
    setIsStopping(true);
    stopConversation();
  };

  if (startingCall || isStopping) {
    return (
      <div
        style={{
          display: 'flex',
          padding: '10px',
          justifyContent: 'center',
          alignItems: 'center',
        }}
      >
        <Loader />
      </div>
    );
  }

  return (
    <div className='kohorta-voice-feedback-app__recording'>
      {isCalling && (
        <div className='kohorta-voice-feedback-app__recording-time'>
          {moment.utc(time * 1000).format('mm:ss')}
        </div>
      )}

      <div onClick={onCallEndHandler} className='kohorta-voice-feedback-app__recording-btn-container'
        style={{
          display: isCalling ? 'inline-block' : 'none',
        }}
      >
        <div
          ref={btnRef}
          className='kohorta-voice-feedback-app__recording-btn-ripple'
        ></div>
        <button className='kohorta-voice-feedback-app__recording-btn'>
          <svg viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
            <path d="M12 15C13.0609 15 14.0783 14.5786 14.8284 13.8284C15.5786 13.0783 16 12.0609 16 11V5C16 3.93913 15.5786 2.92172 14.8284 2.17157C14.0783 1.42143 13.0609 1 12 1C10.9391 1 9.92172 1.42143 9.17157 2.17157C8.42143 2.92172 8 3.93913 8 5V11C8 12.0609 8.42143 13.0783 9.17157 13.8284C9.92172 14.5786 10.9391 15 12 15ZM10 5C10 4.46957 10.2107 3.96086 10.5858 3.58579C10.9609 3.21071 11.4696 3 12 3C12.5304 3 13.0391 3.21071 13.4142 3.58579C13.7893 3.96086 14 4.46957 14 5V11C14 11.5304 13.7893 12.0391 13.4142 12.4142C13.0391 12.7893 12.5304 13 12 13C11.4696 13 10.9609 12.7893 10.5858 12.4142C10.2107 12.0391 10 11.5304 10 11V5ZM20 11C20 10.7348 19.8946 10.4804 19.7071 10.2929C19.5196 10.1054 19.2652 10 19 10C18.7348 10 18.4804 10.1054 18.2929 10.2929C18.1054 10.4804 18 10.7348 18 11C18 12.5913 17.3679 14.1174 16.2426 15.2426C15.1174 16.3679 13.5913 17 12 17C10.4087 17 8.88258 16.3679 7.75736 15.2426C6.63214 14.1174 6 12.5913 6 11C6 10.7348 5.89464 10.4804 5.70711 10.2929C5.51957 10.1054 5.26522 10 5 10C4.73478 10 4.48043 10.1054 4.29289 10.2929C4.10536 10.4804 4 10.7348 4 11C4.00177 12.9473 4.71372 14.8271 6.0024 16.287C7.29107 17.7469 9.06798 18.6866 11 18.93V21H9C8.73478 21 8.48043 21.1054 8.29289 21.2929C8.10536 21.4804 8 21.7348 8 22C8 22.2652 8.10536 22.5196 8.29289 22.7071C8.48043 22.8946 8.73478 23 9 23H15C15.2652 23 15.5196 22.8946 15.7071 22.7071C15.8946 22.5196 16 22.2652 16 22C16 21.7348 15.8946 21.4804 15.7071 21.2929C15.5196 21.1054 15.2652 21 15 21H13V18.93C14.932 18.6866 16.7089 17.7469 17.9976 16.287C19.2863 14.8271 19.9982 12.9473 20 11V11Z" />
          </svg>
        </button>
      </div>
    </div>
  );
};

export default InterviewRecord;
