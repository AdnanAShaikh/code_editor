import React, { useEffect, useRef } from "react";
import { Link } from "react-router-dom";
import "./HTML_CSS.css";
import toast from "react-hot-toast";
import Randomstring from "randomstring";

const HtmlCss = ({ selectedIcon, setSelectedIcon }) => {
  const htmlCodeRef = useRef(null);
  const cssCodeRef = useRef(null);
  const resultRef = useRef(null);

  setSelectedIcon("html");

  const clearAll = () => {
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

  const handleCopy = async () => {
    try {
      if (htmlCodeRef.current.value !== "" || cssCodeRef.current.value !== "") {
        const copyText =
          cssCodeRef.current.value + "\n" + htmlCodeRef.current.value;
        await navigator.clipboard.writeText(copyText);
        toast.success("Copied Input!");
      } else {
        toast.error("No Input");
      }
    } catch (err) {
      toast.error("Failed to copy!");
    }
  };

  const codeToFile = () => {
    toast.success("Download Started");

    const text = `<!DOCTYPE html>
      <html lang="en">
        <head>
          <meta charset="UTF-8" />
          <meta name="viewport" content="width=device-width, initial-scale=1.0" />
          <style>${cssCodeRef.current.value}</style>
          <title>Web App</title>
       </head>

       <body>${htmlCodeRef.current.value} </body> 
       
       </html> `;
    const blob = new Blob([text], { type: "text/html" });

    const link = document.createElement("a");

    link.href = window.URL.createObjectURL(blob);
    const FileCodeName = `${Randomstring.generate(5)}.html`;

    link.download = FileCodeName;
    link.click();
  };

  return (
    <>
      <header>
        <div class="code-editor">
          <h1>Code Editor </h1>
          <img
            className="logo"
            src={require("./code-block-svgrepo-com.png")}
            alt="code"
          />
        </div>

        <Link to="https://www.adnanshaikh.xyz">
          <div class="myport">
            <button>
              My Portfolio{" "}
              <img src={require("./icons8-right-32.png")} alt="right" />
            </button>
          </div>
        </Link>
      </header>
      <section>
        <div class="lang-list">
          <Link to="/python">
            <div className="square">
              <svg
                xmlns="http://www.w3.org/2000/svg"
                x="0px"
                y="0px"
                width="auto"
                height="auto"
                viewBox="0 0 50 50"
              >
                <path d="M 25 2 C 20.941406 2 18.1875 2.96875 16.4375 4.375 C 14.6875 5.78125 14 7.589844 14 9.09375 L 14 14 L 24 14 L 24 15 L 9.09375 15 C 7.265625 15 5.410156 15.792969 4.09375 17.46875 C 2.777344 19.144531 2 21.644531 2 25 C 2 28.355469 2.777344 30.855469 4.09375 32.53125 C 5.410156 34.207031 7.265625 35 9.09375 35 L 14 35 L 14 40.90625 C 14 42.410156 14.6875 44.21875 16.4375 45.625 C 18.1875 47.03125 20.941406 48 25 48 C 29.058594 48 31.8125 47.03125 33.5625 45.625 C 35.3125 44.21875 36 42.410156 36 40.90625 L 36 36 L 26 36 L 26 35 L 40.90625 35 C 42.734375 35 44.589844 34.207031 45.90625 32.53125 C 47.222656 30.855469 48 28.355469 48 25 C 48 21.644531 47.222656 19.144531 45.90625 17.46875 C 44.589844 15.792969 42.734375 15 40.90625 15 L 36 15 L 36 9.09375 C 36 7.550781 35.316406 5.738281 33.5625 4.34375 C 31.808594 2.949219 29.054688 2 25 2 Z M 25 4 C 28.746094 4 31.015625 4.875 32.3125 5.90625 C 33.609375 6.9375 34 8.136719 34 9.09375 L 34 21 C 34 22.65625 32.65625 24 31 24 L 19 24 C 16.941406 24 15.167969 25.269531 14.40625 27.0625 C 14.277344 27.359375 14.160156 27.675781 14.09375 28 C 14.027344 28.324219 14 28.65625 14 29 L 14 33 L 9.09375 33 C 7.824219 33 6.648438 32.503906 5.6875 31.28125 C 4.726563 30.058594 4 28.042969 4 25 C 4 21.957031 4.726563 19.941406 5.6875 18.71875 C 6.648438 17.496094 7.824219 17 9.09375 17 L 26 17 L 26 12 L 16 12 L 16 9.09375 C 16 8.199219 16.386719 6.980469 17.6875 5.9375 C 18.988281 4.894531 21.257813 4 25 4 Z M 20 7 C 18.898438 7 18 7.898438 18 9 C 18 10.101563 18.898438 11 20 11 C 21.101563 11 22 10.101563 22 9 C 22 7.898438 21.101563 7 20 7 Z M 36 17 L 40.90625 17 C 42.175781 17 43.351563 17.496094 44.3125 18.71875 C 45.273438 19.941406 46 21.957031 46 25 C 46 28.042969 45.273438 30.058594 44.3125 31.28125 C 43.351563 32.503906 42.175781 33 40.90625 33 L 24 33 L 24 38 L 34 38 L 34 40.90625 C 34 41.800781 33.613281 43.019531 32.3125 44.0625 C 31.011719 45.105469 28.742188 46 25 46 C 21.257813 46 18.988281 45.105469 17.6875 44.0625 C 16.386719 43.019531 16 41.800781 16 40.90625 L 16 29 C 16 28.792969 16.023438 28.601563 16.0625 28.40625 C 16.34375 27.039063 17.550781 26 19 26 L 31 26 C 33.746094 26 36 23.746094 36 21 Z M 30 39 C 28.898438 39 28 39.898438 28 41 C 28 42.101563 28.898438 43 30 43 C 31.101563 43 32 42.101563 32 41 C 32 39.898438 31.101563 39 30 39 Z"></path>
              </svg>
            </div>
          </Link>

          <Link to="/javascript">
            <div class="square">
              <svg
                xmlns="http://www.w3.org/2000/svg"
                x="0px"
                y="0px"
                width="auto"
                height="auto"
                viewBox="0 0 50 50"
              >
                <path d="M 6.667969 4 C 5.207031 4 4 5.207031 4 6.667969 L 4 43.332031 C 4 44.792969 5.207031 46 6.667969 46 L 43.332031 46 C 44.792969 46 46 44.796875 46 43.332031 L 46 6.667969 C 46 5.207031 44.796875 4 43.332031 4 Z M 6.667969 6 L 43.332031 6 C 43.703125 6 44 6.296875 44 6.667969 L 44 43.332031 C 44 43.703125 43.703125 44 43.332031 44 L 6.667969 44 C 6.296875 44 6 43.703125 6 43.332031 L 6 6.667969 C 6 6.296875 6.296875 6 6.667969 6 Z M 23 23 L 23 35.574219 C 23 37.503906 22.269531 38 21 38 C 19.671875 38 18.75 37.171875 18.140625 36.097656 L 15 38 C 15.910156 39.925781 18.140625 42 21.234375 42 C 24.65625 42 27 40.179688 27 36.183594 L 27 23 Z M 35.453125 23 C 32.046875 23 29.863281 25.179688 29.863281 28.042969 C 29.863281 31.148438 31.695313 32.617188 34.449219 33.789063 L 35.402344 34.199219 C 37.140625 34.960938 38 35.425781 38 36.734375 C 38 37.824219 37.171875 38.613281 35.589844 38.613281 C 33.707031 38.613281 32.816406 37.335938 32 36 L 29 38 C 30.121094 40.214844 32.132813 42 35.675781 42 C 39.300781 42 42 40.117188 42 36.683594 C 42 33.496094 40.171875 32.078125 36.925781 30.6875 L 35.972656 30.28125 C 34.335938 29.570313 33.625 29.109375 33.625 27.964844 C 33.625 27.039063 34.335938 26.328125 35.453125 26.328125 C 36.550781 26.328125 37.253906 26.792969 37.90625 27.964844 L 40.878906 26.058594 C 39.625 23.84375 37.878906 23 35.453125 23 Z"></path>
              </svg>
            </div>
          </Link>

          <Link to="/html-css">
            <div class={`square ${selectedIcon === "html" ? "selected" : ""} `}>
              <svg
                xmlns="http://www.w3.org/2000/svg"
                x="0px"
                y="0px"
                width="auto"
                height="auto"
                viewBox="0 0 50 50"
              >
                <path d="M 5.28125 2 C 4.765625 2.09375 4.410156 2.574219 4.46875 3.09375 L 8 42.53125 C 8.046875 42.933594 8.332031 43.265625 8.71875 43.375 L 24.71875 47.96875 C 24.902344 48.023438 25.097656 48.023438 25.28125 47.96875 L 41.28125 43.375 C 41.667969 43.265625 41.953125 42.933594 42 42.53125 L 45.53125 3.09375 C 45.558594 2.8125 45.464844 2.535156 45.273438 2.324219 C 45.082031 2.117188 44.8125 2 44.53125 2 L 5.46875 2 C 5.4375 2 5.40625 2 5.375 2 C 5.34375 2 5.3125 2 5.28125 2 Z M 6.5625 4 L 43.4375 4 L 40.09375 41.65625 L 25 45.9375 L 9.90625 41.65625 Z M 12.53125 10.0625 C 12.015625 10.15625 11.660156 10.636719 11.71875 11.15625 L 13.0625 25.9375 C 13.09375 26.453125 13.515625 26.859375 14.03125 26.875 L 30 26.875 L 29.5625 31.46875 L 25.03125 32.4375 L 20.4375 31.46875 L 20.28125 29.84375 C 20.25 29.316406 19.808594 28.90625 19.28125 28.90625 L 14.40625 28.90625 C 14.125 28.90625 13.855469 29.023438 13.664063 29.230469 C 13.472656 29.441406 13.378906 29.71875 13.40625 30 L 13.96875 36.125 C 14 36.527344 14.269531 36.875 14.65625 37 L 24.59375 40.03125 L 24.71875 40.0625 C 24.902344 40.117188 25.097656 40.117188 25.28125 40.0625 L 35.34375 37 C 35.742188 36.886719 36.027344 36.539063 36.0625 36.125 L 37.375 21.09375 C 37.402344 20.816406 37.3125 20.542969 37.128906 20.335938 C 36.945313 20.128906 36.683594 20.007813 36.40625 20 L 19.375 20 L 19.125 16.90625 L 36.84375 16.90625 C 37.363281 16.910156 37.796875 16.515625 37.84375 16 L 38.28125 11.15625 C 38.308594 10.875 38.214844 10.597656 38.023438 10.386719 C 37.832031 10.179688 37.5625 10.0625 37.28125 10.0625 L 12.71875 10.0625 C 12.65625 10.054688 12.59375 10.054688 12.53125 10.0625 Z M 13.8125 12.0625 L 36.1875 12.0625 L 35.9375 14.90625 L 18.03125 14.90625 C 17.75 14.90625 17.480469 15.023438 17.289063 15.230469 C 17.097656 15.441406 17.003906 15.71875 17.03125 16 L 17.5 21.09375 C 17.546875 21.597656 17.964844 21.988281 18.46875 22 L 35.3125 22 L 34.125 35.28125 L 25 38.03125 L 15.875 35.28125 L 15.5 30.90625 L 18.375 30.90625 L 18.5 32.375 C 18.53125 32.816406 18.847656 33.183594 19.28125 33.28125 L 24.84375 34.4375 C 24.976563 34.464844 25.117188 34.464844 25.25 34.4375 L 30.71875 33.28125 C 31.152344 33.183594 31.46875 32.816406 31.5 32.375 L 32.09375 25.9375 C 32.109375 25.660156 32.011719 25.390625 31.824219 25.191406 C 31.632813 24.988281 31.371094 24.875 31.09375 24.875 L 14.9375 24.875 Z"></path>
              </svg>
            </div>
          </Link>

          <Link to="/html-css">
            <div class={`square ${selectedIcon === "html" ? "selected" : ""} `}>
              <svg
                xmlns="http://www.w3.org/2000/svg"
                x="0px"
                y="0px"
                width="auto"
                height="auto"
                viewBox="0 0 50 50"
              >
                <path
                  fill-rule="evenodd"
                  d="M 39 40 L 25 44 L 11 40 L 8 6 L 42 6 C 41 17.332031 40 28.667969 39 40 Z M 39.816406 8 L 10.183594 8 L 12.871094 38.453125 L 25 41.921875 L 37.128906 38.453125 Z M 16.800781 28 L 20.800781 28 L 20.898438 30.5 L 25 31.898438 L 29.101563 30.5 L 29.398438 26 L 20.601563 26 L 20.398438 22 L 29.601563 22 L 29.898438 18 L 16.101563 18 L 15.800781 14 L 34.101563 14 L 33.601563 22 L 32.898438 33.5 L 25 36.101563 L 17.101563 33.5 Z"
                ></path>
              </svg>
            </div>
          </Link>
        </div>

        <div class="input">
          <nav>
            <div className="nav-file"></div>
            <div class="nav-button">
              <button class="copy" onClick={handleCopy}>
                <img src={require("./icons8-copy.gif")} alt="copy" />
              </button>
              <button class="reload" onClick={clearAll}>
                <img src={require("./clear-all-svgrepo-com.png")} alt="clear" />
              </button>

              <button class="download" onClick={codeToFile}>
                <img
                  src={require("./download-svgrepo-com.png")}
                  alt="download"
                />
              </button>
            </div>
          </nav>

          <div className="html-css">
            <div class="nav-file index ">
              <p>index.html</p>
            </div>

            <textarea
              ref={htmlCodeRef}
              placeholder={`<h1>Hello! World</h1>`}
            ></textarea>

            <div className="nav-file index">
              <p>index.css</p>
            </div>
            <textarea
              ref={cssCodeRef}
              placeholder={`h1:{color:blue;}`}
            ></textarea>
          </div>
        </div>

        <div class="output1">
          <p class="output-title1">Output</p>
          <iframe title="result" ref={resultRef} className="iframe"></iframe>
        </div>
      </section>
    </>
  );
};

export default HtmlCss;

// <div className="p-6 bg-gray-100 min-h-screen">
// <Link to="/">
//   <button className="bg-blue-500 text-white px-2 py-2 rounded hover:bg-blue-600">
//     ⬅ Home
//   </button>
// </Link>
// <h1 className="text-xl mb-4 mt-10">
//   Web Editor{" "}
//   <button
//     onClick={handleClearAll}
//     className="bg-blue-500 text-white px-2 py-2 mx-10 rounded hover:bg-blue-600"
//   >
//     Clear All
//   </button>
// </h1>
// <div className="flex">
//   <div className="w-1/2 space-y-4">
//     <textarea
//       ref={htmlCodeRef}
//       placeholder="Your HTML code"
//       className="w-full h-40 p-2 border rounded"
//     ></textarea>
//     <textarea
//       ref={cssCodeRef}
//       placeholder="Your CSS code"
//       className="w-full h-40 p-2 border rounded"
//     ></textarea>
//   </div>
//   <div className="w-1/2 ml-4 border rounded overflow-hidden">
//     <iframe
//       title="result"
//       ref={resultRef}
//       className="w-full h-full bg-white "
//     ></iframe>
//   </div>
// </div>
// </div>
