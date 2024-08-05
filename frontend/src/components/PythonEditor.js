import React, { useEffect, useState } from "react";
import axios from "axios";
import toast, { Toaster } from "react-hot-toast";
import { Link } from "react-router-dom";

const PythonEditor = () => {
  const [input, setInput] = useState("");
  const [output, setOutput] = useState("");
  const [loading, setLoading] = useState(true);

  const runCode = async () => {
    if (input === "") {
      return toast.error("Write some code!");
    }

    if (loading) toast.loading("Executing code...");

    try {
      const response = await axios.post(
        "https://code-editor-b2st.onrender.com/py",
        {
          code: input,
        }
      );

      if (response.status === 200) {
        toast.dismiss();
        setOutput(response.data.output);
        toast.success("Code executed successfully!");
      }
    } catch (error) {
      toast.dismiss();
      toast.error("Error running code");
    }
  };
  useEffect(() => {
    const handleKeyPress = (e) => {
      if (e.ctrlKey && e.key === "Enter") {
        runCode();
      }
    };

    window.addEventListener("keydown", handleKeyPress);

    return () => {
      window.removeEventListener("keydown", handleKeyPress);
    };
  }, [input]);

  const clearAll = () => {
    setInput("");
    setOutput("");
  };

  return (
    <div className="min-h-screen bg-gray-100 p-6 flex">
      <Toaster />

      <div className="w-1/2 p-4">
        <div className="flex items-center justify-between mb-4">
          <Link to="/">
            <button className="bg-blue-500 text-white px-4 py-2 rounded hover:bg-blue-600">
              ⬅ Home
            </button>
          </Link>
          <button
            onClick={clearAll}
            className="bg-blue-500 text-white px-4 py-2 rounded hover:bg-blue-600"
          >
            Clear
          </button>
          <h1 className="text-2xl font-bold">Python Code Editor</h1>
          <button
            onClick={runCode}
            className="bg-blue-500 text-white px-4 py-2 rounded hover:bg-blue-600"
          >
            RUN
          </button>
        </div>
        <textarea
          className="w-full h-full p-3 border rounded"
          value={input}
          onChange={(e) => setInput(e.target.value)}
          placeholder="Write your Python code here"
        />
      </div>
      <div className="w-1/2 p-4">
        <h1 className="text-2xl font-bold mb-4">Output </h1>
        <pre className="w-full h-full p-3 bg-white border rounded overflow-auto">
          {output}
        </pre>
      </div>
    </div>
  );
};

export default PythonEditor;
