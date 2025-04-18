import React, { useState } from "react";
import { useNavigate } from "react-router-dom";

function Mock() {
  const [selectedTest, setSelectedTest] = useState(null);
  const navigate = useNavigate();

  const availableTests = [
    { id: 1, name: "Java", duration: "30 mins", questions: 20 },
    { id: 2, name: "Python", duration: "45 mins", questions: 25 },
    { id: 3, name: "Sql", duration: "60 mins", questions: 30 },
    { id: 4, name: "HTML", duration: "90 mins", questions: 40 },
  ];

  const handleStartTest = () => {
    if (selectedTest) {
      if (window.confirm("The test will start in full screen mode. Are you ready?")) {
        navigate(`/mock/test/${selectedTest.id}`);
      }
    }
  };

  return (
    <div style={pageContainer}>
      <h2 style={headingStyle}>Select a Mock Test</h2>
      <div style={testsContainer}>
        {availableTests.map((test) => (
          <div
            key={test.id}
            style={{
              ...testCardStyle,
              ...(selectedTest?.id === test.id ? selectedTestStyle : {}),
            }}
            onClick={() => setSelectedTest(test)}
          >
            <h3 style={testTitleStyle}>{test.name}</h3>
            <div style={testDetailsStyle}>
              <p>⏱️ Duration: {test.duration}</p>
              <p>❓ Questions: {test.questions}</p>
            </div>
          </div>
        ))}
      </div>
      <button
        style={{
          ...startButtonStyle,
          ...(!selectedTest ? disabledButtonStyle : {}),
        }}
        onClick={handleStartTest}
        disabled={!selectedTest}
      >
        Start Test
      </button>
    </div>
  );
}

const pageContainer = {
  padding: "2rem",
  maxWidth: "1200px",
  margin: "0 auto",
};

const headingStyle = {
  color: "#2c3e50",
  textAlign: "center",
  marginBottom: "2rem",
};

const testsContainer = {
  display: "grid",
  gridTemplateColumns: "repeat(auto-fill, minmax(280px, 1fr))",
  gap: "1.5rem",
  marginBottom: "2rem",
};

const testCardStyle = {
  border: "1px solid #ddd",
  borderRadius: "8px",
  padding: "1.5rem",
  cursor: "pointer",
  transition: "all 0.3s ease",
  backgroundColor: "#f9f9f9",
  ':hover': {
    transform: "translateY(-3px)",
    boxShadow: "0 4px 8px rgba(0,0,0,0.1)",
  }
};

const selectedTestStyle = {
  borderColor: "#3498db",
  backgroundColor: "#e1f0fa",
  boxShadow: "0 0 0 2px rgba(52, 152, 219, 0.3)",
  transform: "translateY(-3px)",
};

const testTitleStyle = {
  color: "#2c3e50",
  marginBottom: "10px",
};

const testDetailsStyle = {
  color: "#7f8c8d",
  fontSize: "0.9rem",
};

const startButtonStyle = {
  display: "block",
  margin: "0 auto",
  padding: "12px 30px",
  backgroundColor: "#3498db",
  color: "white",
  border: "none",
  borderRadius: "4px",
  fontSize: "1rem",
  cursor: "pointer",
  transition: "all 0.3s ease",
  ':hover': {
    backgroundColor: "#2980b9",
    transform: "scale(1.05)",
  }
};

const disabledButtonStyle = {
  backgroundColor: "#95a5a6",
  cursor: "not-allowed",
  ':hover': {
    transform: "none",
    backgroundColor: "#95a5a6",
  }
};

export default Mock;