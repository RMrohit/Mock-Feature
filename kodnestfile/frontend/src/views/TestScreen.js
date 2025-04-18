import React, { useState, useEffect, useCallback, useRef } from 'react';
import { useParams, useNavigate } from 'react-router-dom';

function TestScreen() {
  const { testId } = useParams();
  const navigate = useNavigate();
  const [currentQuestion, setCurrentQuestion] = useState(0);
  const [recordingStatus, setRecordingStatus] = useState('idle');
  const [transcript, setTranscript] = useState('');
  const [interimTranscript, setInterimTranscript] = useState('');
  const [isFullscreen, setIsFullscreen] = useState(false);
  const videoRef = useRef(null);
  const mediaRecorderRef = useRef(null);
  const chunksRef = useRef([]);
  const testContainerRef = useRef(null);
  const streamRef = useRef(null);
  const recognitionRef = useRef(null);

  const questions = [
    { id: 1, text: "Explain the concept of closures in JavaScript." },
    { id: 2, text: "Describe the virtual DOM in React." },
    { id: 3, text: "What are React hooks and why are they useful?" }
  ];

  // Initialize speech recognition
  const initSpeechRecognition = useCallback(() => {
    const SpeechRecognition = window.SpeechRecognition || window.webkitSpeechRecognition;
    if (SpeechRecognition) {
      recognitionRef.current = new SpeechRecognition();
      recognitionRef.current.continuous = true;
      recognitionRef.current.interimResults = true;
      
      recognitionRef.current.onresult = (event) => {
        let interim = '';
        let final = '';
        
        for (let i = event.resultIndex; i < event.results.length; i++) {
          const text = event.results[i][0].transcript;
          if (event.results[i].isFinal) {
            final += text + ' ';
          } else {
            interim += text;
          }
        }
        
        setTranscript(prev => prev + final);
        setInterimTranscript(interim);
      };
      
      recognitionRef.current.onerror = (event) => {
        console.error('Speech recognition error:', event.error);
      };
    } else {
      console.warn('Speech Recognition API not supported in this browser');
    }
  }, []);

  // Fullscreen handling
  const enterFullscreen = useCallback(async () => {
    if (!testContainerRef.current) return;
    
    try {
      if (testContainerRef.current.requestFullscreen) {
        await testContainerRef.current.requestFullscreen();
      }
      setIsFullscreen(true);
    } catch (err) {
      console.error("Fullscreen error:", err);
    }
  }, []);

  const exitFullscreen = useCallback(async () => {
    if (document.exitFullscreen) {
      await document.exitFullscreen();
      setIsFullscreen(false);
    }
  }, []);

  // Media handling
  const initMediaStream = useCallback(async () => {
    try {
      const constraints = {
        video: { width: 640, height: 480 },
        audio: true
      };
      const stream = await navigator.mediaDevices.getUserMedia(constraints);
      streamRef.current = stream;
      
      if (videoRef.current) {
        videoRef.current.srcObject = stream;
      }
      return stream;
    } catch (err) {
      console.error("Error accessing media devices:", err);
      return null;
    }
  }, []);

  const cleanupMedia = useCallback(() => {
    if (mediaRecorderRef.current?.state === 'recording') {
      mediaRecorderRef.current.stop();
    }
    
    if (streamRef.current) {
      streamRef.current.getTracks().forEach(track => track.stop());
      streamRef.current = null;
    }
    
    if (videoRef.current) {
      videoRef.current.srcObject = null;
      videoRef.current.src = '';
      videoRef.current.controls = false;
    }
    
    if (recognitionRef.current) {
      recognitionRef.current.stop();
    }
  }, []);

  const startRecording = useCallback(async () => {
    cleanupMedia();
    const stream = await initMediaStream();
    if (!stream) return;

    // Start speech recognition
    if (recognitionRef.current) {
      recognitionRef.current.start();
      setTranscript('');
      setInterimTranscript('');
    }

    // Set up media recorder
    chunksRef.current = [];
    mediaRecorderRef.current = new MediaRecorder(stream);
    
    mediaRecorderRef.current.ondataavailable = (e) => {
      if (e.data.size > 0) chunksRef.current.push(e.data);
    };

    mediaRecorderRef.current.onstop = () => {
      const blob = new Blob(chunksRef.current, { type: 'video/webm' });
      const videoURL = URL.createObjectURL(blob);
      if (videoRef.current) {
        videoRef.current.srcObject = null;
        videoRef.current.src = videoURL;
        videoRef.current.controls = true;
      }
    };

    mediaRecorderRef.current.start();
    setRecordingStatus('recording');
  }, [initMediaStream, cleanupMedia]);

  const stopRecording = useCallback(() => {
    if (mediaRecorderRef.current?.state === 'recording') {
      mediaRecorderRef.current.stop();
      setRecordingStatus('recorded');
    }
    
    if (recognitionRef.current) {
      recognitionRef.current.stop();
    }
  }, []);

  const retakeRecording = useCallback(() => {
    cleanupMedia();
    setRecordingStatus('idle');
    setTranscript('');
    setInterimTranscript('');
  }, [cleanupMedia]);

  const submitAnswer = useCallback(() => {
    alert(`Answer submitted with transcript: ${transcript}`);
    cleanupMedia();
    setRecordingStatus('idle');
    setTranscript('');
    setInterimTranscript('');
  }, [transcript, cleanupMedia]);

  const submitTest = useCallback(async () => {
    await exitFullscreen();
    alert('Test submitted successfully!');
    navigate('/mock');
  }, [exitFullscreen, navigate]);

  // Initialize on mount
  useEffect(() => {
    initSpeechRecognition();
    enterFullscreen();
    
    return () => {
      cleanupMedia();
      if (recognitionRef.current) {
        recognitionRef.current.stop();
      }
    };
  }, [initSpeechRecognition, enterFullscreen, cleanupMedia]);

  const handleNextQuestion = () => {
    if (currentQuestion < questions.length - 1) {
      setCurrentQuestion(currentQuestion + 1);
      cleanupMedia();
      setTranscript('');
      setInterimTranscript('');
    }
  };

  const handlePrevQuestion = () => {
    if (currentQuestion > 0) {
      setCurrentQuestion(currentQuestion - 1);
      cleanupMedia();
      setTranscript('');
      setInterimTranscript('');
    }
  };

  return (
    <div ref={testContainerRef} style={fullScreenStyle}>
      <div style={testHeaderStyle}>
        <h2>Question {currentQuestion + 1} of {questions.length}</h2>
        {isFullscreen && (
          <button 
            style={finalSubmitButtonStyle}
            onClick={submitTest}
          >
            Submit Test
          </button>
        )}
      </div>
      
      <div style={questionContainerStyle}>
        <h3 style={questionTextStyle}>{questions[currentQuestion].text}</h3>
        
        <div style={videoContainerStyle}>
          <video
            ref={videoRef}
            autoPlay
            muted
            playsInline
            style={videoStyle}
          />
          {(transcript || interimTranscript) && (
            <div style={transcriptContainerStyle}>
              <h4>Transcript:</h4>
              <p>{transcript}</p>
              {interimTranscript && <p style={{ color: '#666', fontStyle: 'italic' }}>{interimTranscript}</p>}
            </div>
          )}
        </div>
        
        <div style={buttonContainerStyle}>
          <div style={leftButtonGroupStyle}>
            <button 
              style={{
                ...navButtonStyle,
                ...(currentQuestion === 0 ? disabledButtonStyle : {})
              }} 
              onClick={handlePrevQuestion}
              disabled={currentQuestion === 0}
            >
              Previous
            </button>
            
            {recordingStatus === 'idle' && (
              <button style={recordButtonStyle} onClick={startRecording}>
                Start Recording
              </button>
            )}
            
            {recordingStatus === 'recording' && (
              <button style={stopButtonStyle} onClick={stopRecording}>
                Stop Recording
              </button>
            )}
            
            {recordingStatus === 'recorded' && (
              <>
                <button style={retakeButtonStyle} onClick={retakeRecording}>
                  Retake
                </button>
                <button style={submitButtonStyle} onClick={submitAnswer}>
                  Submit Answer
                </button>
              </>
            )}
          </div>
          
          <div style={rightButtonGroupStyle}>
            {currentQuestion < questions.length - 1 ? (
              <button 
                style={navButtonStyle} 
                onClick={handleNextQuestion}
                disabled={recordingStatus === 'recording'}
              >
                Next Question
              </button>
            ) : (
              <button 
                style={finalSubmitButtonStyle}
                onClick={submitTest}
                disabled={recordingStatus === 'recording'}
              >
                Submit Test
              </button>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}

// Styles (same as previous implementation)
const fullScreenStyle = {
  position: 'fixed',
  top: 0,
  left: 0,
  width: '100vw',
  height: '100vh',
  backgroundColor: '#f5f5f5',
  padding: '20px',
  overflow: 'auto',
};

const testHeaderStyle = {
  display: 'flex',
  justifyContent: 'space-between',
  alignItems: 'center',
  marginBottom: '20px',
  padding: '10px 20px',
  backgroundColor: '#2c3e50',
  color: 'white',
  borderRadius: '4px',
};

const questionContainerStyle = {
  backgroundColor: 'white',
  padding: '20px',
  borderRadius: '8px',
  boxShadow: '0 2px 4px rgba(0,0,0,0.1)',
  height: 'calc(100vh - 180px)',
  display: 'flex',
  flexDirection: 'column',
};

const questionTextStyle = {
  marginBottom: '20px',
  color: '#2c3e50',
  lineHeight: '1.5',
};

const videoContainerStyle = {
  flex: 1,
  display: 'flex',
  flexDirection: 'column',
  gap: '20px',
  overflow: 'auto',
};

const videoStyle = {
  width: '640px',
  height: '480px',
  backgroundColor: '#000',
  borderRadius: '4px',
  margin: '0 auto',
};

const transcriptContainerStyle = {
  padding: '15px',
  backgroundColor: '#f8f9fa',
  borderRadius: '4px',
  border: '1px solid #ddd',
};

const buttonContainerStyle = {
  display: 'flex',
  justifyContent: 'space-between',
  marginTop: '20px',
};

const leftButtonGroupStyle = {
  display: 'flex',
  gap: '10px',
};

const rightButtonGroupStyle = {
  display: 'flex',
  gap: '10px',
};

const navButtonStyle = {
  padding: '10px 20px',
  backgroundColor: '#3498db',
  color: 'white',
  border: 'none',
  borderRadius: '4px',
  cursor: 'pointer',
  fontSize: '1rem',
  transition: 'all 0.2s ease',
  ':hover': {
    backgroundColor: '#2980b9',
  }
};

const recordButtonStyle = {
  ...navButtonStyle,
  backgroundColor: '#e74c3c',
  ':hover': {
    backgroundColor: '#c0392b',
  }
};

const stopButtonStyle = {
  ...recordButtonStyle,
  backgroundColor: '#c0392b',
};

const retakeButtonStyle = {
  ...navButtonStyle,
  backgroundColor: '#f39c12',
  ':hover': {
    backgroundColor: '#d35400',
  }
};

const submitButtonStyle = {
  ...navButtonStyle,
  backgroundColor: '#2ecc71',
  ':hover': {
    backgroundColor: '#27ae60',
  }
};

const finalSubmitButtonStyle = {
  ...navButtonStyle,
  backgroundColor: '#9b59b6',
  ':hover': {
    backgroundColor: '#8e44ad',
  }
};

const disabledButtonStyle = {
  backgroundColor: '#95a5a6',
  cursor: 'not-allowed',
  ':hover': {
    backgroundColor: '#95a5a6',
  }
};

export default TestScreen;