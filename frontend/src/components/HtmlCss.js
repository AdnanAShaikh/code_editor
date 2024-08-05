import React, { useEffect, useRef } from "react";
import { Link } from "react-router-dom";

const HtmlCss = () => {
  const htmlCodeRef = useRef(null);
  const cssCodeRef = useRef(null);
  const resultRef = useRef(null);

  const handleClearAll = () => {
    htmlCodeRef.current.value = "";
    cssCodeRef.current.value = "";
    resultRef.current.contentDocument.body.innerHTML = "";
  };

  useEffect(() => {
    const updateOutput = () => {
      resultRef.current.contentDocument.body.innerHTML =
        `<style>${cssCodeRef.current.value}</style>` +
        htmlCodeRef.current.value;
    };

    htmlCodeRef.current.onkeyup = updateOutput;
    cssCodeRef.current.onkeyup = updateOutput;
  }, []);

  return (
    <div className="p-6 bg-gray-100 min-h-screen">
      <Link to="/">
        <button className="bg-blue-500 text-white px-2 py-2 rounded hover:bg-blue-600">
          ⬅ Home
        </button>
      </Link>
      <h1 className="text-xl mb-4 mt-10">
        Web Editor{" "}
        <button
          onClick={handleClearAll}
          className="bg-blue-500 text-white px-2 py-2 mx-10 rounded hover:bg-blue-600"
        >
          Clear All
        </button>
      </h1>
      <div className="flex">
        <div className="w-1/2 space-y-4">
          <textarea
            ref={htmlCodeRef}
            placeholder="Your HTML code"
            className="w-full h-40 p-2 border rounded"
          ></textarea>
          <textarea
            ref={cssCodeRef}
            placeholder="Your CSS code"
            className="w-full h-40 p-2 border rounded"
          ></textarea>
        </div>
        <div className="w-1/2 ml-4 border rounded overflow-hidden">
          <iframe
            title="result"
            ref={resultRef}
            className="w-full h-full bg-white "
          ></iframe>
        </div>
      </div>
    </div>
  );
};

export default HtmlCss;
