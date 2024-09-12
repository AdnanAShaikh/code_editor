import HtmlCss from "./components/HtmlCss";
import PythonEditor from "./components/PythonEditor";
import { Toaster } from "react-hot-toast";
import { Routes, Route } from "react-router-dom";
import JavaScript from "./components/JavaScript";
import { useState } from "react";
import "./components/Homepage.css";

function App() {
  const [selectedIcon, setSelectedIcon] = useState(null);

  return (
    <>
      <Toaster />
      <Routes>
        <Route
          path="/"
          element={
            <PythonEditor
              selectedIcon={selectedIcon}
              setSelectedIcon={setSelectedIcon}
            />
          }
        />
        <Route
          path="/html-css"
          element={
            <HtmlCss
              selectedIcon={selectedIcon}
              setSelectedIcon={setSelectedIcon}
            />
          }
        />
        <Route
          path="/javascript"
          element={
            <JavaScript
              selectedIcon={selectedIcon}
              setSelectedIcon={setSelectedIcon}
            />
          }
        />
        <Route
          path="/python"
          element={
            <PythonEditor
              selectedIcon={selectedIcon}
              setSelectedIcon={setSelectedIcon}
            />
          }
        />
      </Routes>
    </>
  );
}

export default App;
