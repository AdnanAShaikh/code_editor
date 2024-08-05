import React from "react";
import { Link } from "react-router-dom";

const Homepage = () => {
  return (
    <div className="min-h-screen bg-gray-100 flex flex-col items-center justify-center">
      <h1 className="text-4xl font-bold mb-6">Welcome to Code Editor</h1>
      <p className="mb-8 text-lg text-gray-700">
        Choose an editor to start coding:
      </p>
      <div className="space-x-4">
        <Link to="/html-css">
          <button className="bg-blue-500 text-white px-4 py-2 rounded hover:bg-blue-600">
            HTML/CSS
          </button>
        </Link>
        <Link to="/javascript">
          <button className="bg-green-500 text-white px-4 py-2 rounded hover:bg-green-600">
            JavaScript
          </button>
        </Link>
        <Link to="/python">
          <button className="bg-yellow-500 text-white px-4 py-2 rounded hover:bg-yellow-600">
            Python
          </button>
        </Link>
      </div>
    </div>
  );
};

export default Homepage;
