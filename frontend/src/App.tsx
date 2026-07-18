import { Toaster } from "react-hot-toast";
import { Routes, Route } from "react-router-dom";
import { useState } from "react";
import CodeRunner from "./components/CodeRunner";

function App() {

  return (
    <>
      <Toaster />
      <Routes>
        <Route
          path="/"
          element={
            <CodeRunner
            />
          }
        />
      </Routes>
    </>
  );
}

export default App;
