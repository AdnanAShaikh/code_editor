import logo from "./logo.svg";
import "./App.css";
import HtmlCss from "./components/HtmlCss";
import PythonEditor from "./components/PythonEditor";
import { Toaster } from "react-hot-toast";
import { Routes, Route } from "react-router-dom";
import JavaScript from "./components/JavaScript";
import Homepage from "./components/Homepage";

function App() {
  return (
    <>
      <Toaster />
      <Routes>
        <Route path="/" element={<Homepage />} />
        <Route path="/html-css" element={<HtmlCss />} />
        <Route path="/javascript" element={<JavaScript />} />
        <Route path="/python" element={<PythonEditor />} />
      </Routes>
    </>
  );
}

export default App;
