import { Link } from "react-router-dom";
import { useState } from "react";

function Navbar() {
  const [activeLink, setActiveLink] = useState("/home");

  const handleLinkClick = (path) => {
    setActiveLink(path);
  };

  return (
    <nav style={navStyle}>
      <ul style={ulStyle}>
        {[
          { path: "/home", name: "Home" },
          { path: "/courses", name: "Courses" },
          { path: "/practise", name: "Practise" },
          { path: "/contest", name: "Contest" },
          { path: "/mock", name: "Mock" },
        ].map((item) => (
          <li key={item.path} style={liStyle}>
            <Link
              to={item.path}
              style={{
                ...linkStyle,
                ...(activeLink === item.path ? activeLinkStyle : {}),
              }}
              onClick={() => handleLinkClick(item.path)}
            >
              {item.name}
            </Link>
          </li>
        ))}
      </ul>
    </nav>
  );
}

export default Navbar;

// Styles
const navStyle = {
  backgroundColor: "#2c3e50",
  padding: "1rem 2rem",
  boxShadow: "0 2px 10px rgba(0, 0, 0, 0.1)",
};

const ulStyle = {
  display: "flex",
  listStyle: "none",
  margin: 0,
  padding: 0,
  gap: "1.5rem",
  justifyContent: "center",
};

const liStyle = {
  margin: 0,
  padding: 0,
};

const linkStyle = {
  color: "#ecf0f1",
  textDecoration: "none",
  padding: "0.5rem 1rem",
  borderRadius: "4px",
  transition: "all 0.3s ease",
  fontWeight: "500",
  fontSize: "1.1rem",
};

const activeLinkStyle = {
  backgroundColor: "#3498db",
  color: "white",
};