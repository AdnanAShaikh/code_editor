import React, { useEffect, useRef, useState } from "react";
import axios from "axios";
import toast from "react-hot-toast";
import { PythonIcon } from "../Icons/PythonIcon";
import { JavaScriptIcon } from "../Icons/JavaScriptIcon";
import { socket } from "../socket";
import CodeMirror from "@uiw/react-codemirror";
import { javascript } from "@codemirror/lang-javascript";
import { python } from "@codemirror/lang-python";
import { tokyoNight } from "@uiw/codemirror-theme-tokyo-night";


type Language = "js" | "python";

const LANG_EXTENSIONS: Record<Language, ReturnType<typeof javascript>> = {
  js: javascript(),
  python: python(),
};

interface LanguageConfig {
  name: string;
  fileName: string;
  endpoint: string;
  storageKey: string;
  placeholder: string;
  mimeType: string;
  extension: string;
}

const LANGUAGES: Record<Language, LanguageConfig> = {
  js: {
    name: "JavaScript",
    fileName: "index.js",
    endpoint: "/js",
    storageKey: "js",
    placeholder: `console.log("Hello! World")`,
    mimeType: "text/javascript",
    extension: "js",
  },
  python: {
    name: "Python",
    fileName: "index.py",
    endpoint: "/py",
    storageKey: "python",
    placeholder: `print("Hello! World")`,
    mimeType: "text/python",
    extension: "py",
  },
};

const navBtn = `p-[5px] rounded-[5px] bg-[#edf2f4] `;

type VoteModal =
  | { kind: "waiting"; language: Language }              // requester, waiting for votes
  | { kind: "incoming"; language: Language }             // other users, accept/reject
  | { kind: "result"; language: Language; accepted: boolean } // requester, final verdict
  | null;

interface RemoteCursor {
    username: string;
    x: number; // 0–1 fraction of viewport width
    y: number; // 0–1 fraction of viewport height
}

const CodeRunner: React.FC = () => {
    const [language, setLanguage] = useState<Language>(
        (localStorage.getItem("selectedLang") as Language) || "python"
    );
    const [input, setInput] = useState<string>(
        localStorage.getItem(LANGUAGES[language].storageKey) || ""
    );
    const [output, setOutput] = useState<string>("");
    const [isExecuting, setIsExecuting] = useState<boolean>(false); 
    const abortControllerRef = useRef<AbortController | null>(null);
    
    const [roomId, setRoomId] = useState<string | null>(null);
    const [joinInput, setJoinInput] = useState<string>("");
    const [voteModal, setVoteModal] = useState<VoteModal>(null);
    
    const [username, setUsername] = useState<string>(
        localStorage.getItem("username") || ""
    );
    const [usernameInput, setUsernameInput] = useState<string>("");
    const [showPeopleModal, setShowPeopleModal] = useState<boolean>(false);
    const [peopleList, setPeopleList] = useState<string[]>([]);
    
    const [cursors, setCursors] = useState<Record<string, RemoteCursor>>({});


  const langSquare = (lang: Language) =>
    `p-[10px] border border-[#edf2f4] ${
      language === lang ? "bg-[bisque]" : "bg-[#edf2f4]"
    } ${
      isExecuting
        ? "opacity-50 cursor-not-allowed"
        : 'cursor-pointer'
    }`;

  const getNavBtn = () =>
        `p-[5px] rounded-[5px] ${
            isExecuting
            ? "bg-[#edf2f4] opacity-50 cursor-not-allowed"
            : `bg-[#edf2f4] cursor-pointer `
    }`;

  const config = LANGUAGES[language];

   useEffect(() => {
    localStorage.setItem(config.storageKey, input);
    }, [input, config.storageKey]);

  const switchLanguage = (lang: Language): void => {
    if (lang === language || isExecuting) return; 

    // Save current code before switching
    localStorage.setItem(config.storageKey, input);
    localStorage.setItem("selectedLang", lang);

    setLanguage(lang);
    if (roomId) {
        socket.emit("language-change", { roomId, language: lang });
    }
    setInput(localStorage.getItem(LANGUAGES[lang].storageKey) || "");
    setOutput("");
  };


  const runCode = async (): Promise<void> => {
    if (input === "") {
      toast.error("Write some code!");
      return;
    }
    setIsExecuting(true);           

    toast.loading("Executing code...");

    const controller = new AbortController();
    abortControllerRef.current = controller;

    try {
    const response = await axios.post(config.endpoint, {
        code: input,
    }, { signal: controller.signal });

    toast.dismiss();
    setOutput(response.data.output);
    } catch (error) {
    toast.dismiss();
    if (axios.isCancel(error)) {
        toast.error("Execution cancelled");
    } else if (axios.isAxiosError(error) && error.response?.data) {
        // Server returned an error with details (syntax error, runtime error, etc.)
        const errMsg = error.response.data.output || error.response.data.error || "Something went wrong";
        setOutput(errMsg);
        toast.error("Code has errors");
    } else {
        toast.error("Error running code");
    }
    } finally {
    abortControllerRef.current = null;
    setIsExecuting(false);
    }

  };

  const cancelExecution = (): void => {
    if (abortControllerRef.current) {
      abortControllerRef.current.abort();
    }
  };

  const handleCopy = async (): Promise<void> => {
    try {
      if (input !== "") {
        await navigator.clipboard.writeText(input);
        toast.success("Copied Input!");
      } else {
        toast.error("No Input");
      }
    } catch (err) {
      toast.error("Failed to copy!");
    }
  };

  const codeToFile = (): void => {
    try {
      if (input !== "") {
        toast.success("Download Started");

        const blob = new Blob([input], { type: config.mimeType });
        const link = document.createElement("a");

        link.href = window.URL.createObjectURL(blob);
        const fileCodeName = Math.random().toString(36).slice(2, 7); // 5 chars
        link.download = `${fileCodeName}.${config.extension}`;
        link.click();
      } else {
        toast.error("No Input");
      }
    } catch (error) {
      toast.error("Failed to Download");
    }
  };

  const clearAll = (): void => {
    setInput("");
    setOutput("");
  };

// username helpers
    const saveUsername = (): void => {
        const trimmed = usernameInput.trim();
        if (trimmed.length < 3) {
            toast.error("Username must be at least 3 characters");
            return;
        }
        localStorage.setItem("username", trimmed);
        setUsername(trimmed);
    };

    const showPeople = (): void => {
        if (!roomId) return;
        socket.emit("get-room-users", roomId, ({ users }: { users: string[] }) => {
            setPeopleList(users);
            setShowPeopleModal(true);
        });
    };

 //  socket helpers
    const createRoom = (): void => {
        socket.connect();
        socket.emit("create-room", username, ({ roomId }: { roomId: string }) => {
            setRoomId(roomId);
            sessionStorage.setItem("roomId", roomId);
            toast.success(`Room created: ${roomId}`);
        });
    };

  const joinRoom = (): void => {
        if (!joinInput.trim()) {
            toast.error("Enter a room ID");
            return;
        }
        socket.connect();
        socket.emit(
            "join-room",
            { roomId: joinInput.trim().toUpperCase(), username },
            (res: { error?: string; success?: boolean }) => {
            if (res.error) {
                toast.error(res.error);
                return;
            }
            sessionStorage.setItem("roomId", joinInput.trim().toUpperCase());
            setRoomId(joinInput.trim().toUpperCase());
            toast.success("Joined room!");
            }
        );
    };

    const leaveRoom = (): void => {
        if (roomId) socket.emit("leave-room", roomId);
        setRoomId(null);
        sessionStorage.removeItem("roomId");   // add
        setCursors({});          // add
        socket.disconnect();
    };


    const requestLanguageChange = (lang: Language): void => {
        if (lang === language || isExecuting) return;

        if (!roomId) {
            applyLanguage(lang); // not in a room → just switch like before
            return;
        }

        setVoteModal({ kind: "waiting", language: lang });
        socket.emit("request-language-change", { roomId, language: lang });
    };

    // Actually performs the switch (no emitting)
    const applyLanguage = (lang: Language): void => {
        localStorage.setItem(config.storageKey, input);
        localStorage.setItem("selectedLang", lang);
        setLanguage(lang);
        setInput(localStorage.getItem(LANGUAGES[lang].storageKey) || "");
        setOutput("");
    };

    const voteOnLanguageChange = (accept: boolean): void => {
        socket.emit("language-change-vote", { roomId, accept });
        setVoteModal(null); // rejecter/accepter's modal closes immediately
    };

    // socket useEffect
     useEffect(() => {
        if (!roomId) return;

        socket.on("code-update", (code: string) => {
            setInput(code);
        });

        socket.on("language-update", (lang: Language) => {
            setLanguage(lang);
            setInput(localStorage.getItem(LANGUAGES[lang].storageKey) || "");
        });

        // A newcomer joined — send them our current code
        socket.on("request-sync", ({ requesterId }: { requesterId: string }) => {
            socket.emit("sync-code", { requesterId,     code: localStorage.getItem(config.storageKey) || "", language });
        });

        socket.on("language-change-requested", ({ language: lang }: { language: Language }) => {
            setVoteModal({ kind: "incoming", language: lang });
            });

        socket.on(
            "language-change-result",
            ({ accepted, language: lang }: { accepted: boolean; language: Language }) => {
                if (accepted) {
                applyLanguage(lang);
                // Show "Accepted" briefly on the requester, close instantly for others
                setVoteModal((prev) =>
                    prev?.kind === "waiting" ? { kind: "result", language: lang, accepted: true } : null
                );
                } else {
                setVoteModal((prev) =>
                    prev?.kind === "waiting" ? { kind: "result", language: lang, accepted: false } : null
                );
                }
                // Auto-close result modal after 2s
                setTimeout(() => setVoteModal(null), 2000);
            }
         );


         socket.on("user-left", ({ username: name }: { username: string }) => {
            toast(`${name} has left the room`, { icon: "👋" });
        });

        socket.on("user-joined", ({ username: name }: { username: string }) => {
            toast(`${name} has joined`, { icon: "🙌" });
        });

        socket.on("cursor-update", ({ id, username: name, x, y }: { id: string; username: string; x: number; y: number }) => {
        setCursors((prev) => ({ ...prev, [id]: { username: name, x, y } }));
        });

        socket.on("cursor-remove", ({ id }: { id: string }) => {
        setCursors((prev) => {
            const next = { ...prev };
            delete next[id];
            return next;
         });
        });

        return () => {
            socket.off("code-update");
            socket.off("language-update");
            socket.off("request-sync");
            socket.off("language-change-requested");
            socket.off("language-change-result");
            socket.off("user-left");
            socket.off("user-joined");

         };
        }, [roomId, language]);


        // Re connect room after refresh
        useEffect(() => {
            const savedRoom = sessionStorage.getItem("roomId");
            if (!savedRoom) return;

            socket.connect();
            socket.emit("rejoin-room", { roomId: savedRoom, username }, 
                                        (res: { error?: string }) => {
                if (res.error) {
                 sessionStorage.removeItem("roomId");
                 toast.error("Room no longer exists");
                 return;
                }
                setRoomId(savedRoom);
                toast.success(`Rejoined room ${savedRoom}`);
            });
            }, []);

    
        // Runs once on mount — always listening
        useEffect(() => {
            socket.on("receive-sync", ({ code, language: lang }: { code: string; language: Language }) => {
                setLanguage(lang);
                localStorage.setItem("selectedLang", lang);
                setInput(code);          // overwrite whatever the newcomer had
                setOutput("");
            });

        return () => {
            socket.off("receive-sync");
         };
        }, []);

        useEffect(() => {
            if (!roomId) return;

            let lastSent = 0;
            const THROTTLE_MS = 50; // 20 updates/sec — smooth enough

            const handleMouseMove = (e: MouseEvent) => {
                const now = Date.now();
                if (now - lastSent < THROTTLE_MS) return;
                lastSent = now;

                socket.emit("cursor-move", {
                roomId,
                x: e.clientX / window.innerWidth,   // relative, works across screen sizes
                y: e.clientY / window.innerHeight,
                });
            };

            window.addEventListener("mousemove", handleMouseMove);
            return () => window.removeEventListener("mousemove", handleMouseMove);
            }, [roomId]);


  return (
    <div className="min-h-screen bg-[#2b2d42]">
        {Object.entries(cursors).map(([id, cursor]) => (
        <div
            key={id}
            className="fixed z-40 pointer-events-none transition-all duration-75 ease-linear"
            style={{
            left: `${cursor.x * 100}vw`,
            top: `${cursor.y * 100}vh`,
            }}
        >
            {/* pointer arrow */}
            <svg width="18" height="18" viewBox="0 0 24 24" fill="none">
            <path
                d="M5 3l14 8-6.5 1.5L9 19 5 3z"
                fill="bisque"
                stroke="#2b2d42"
                strokeWidth="1.5"
            />
            </svg>
            {/* name tag */}
            <span className="ml-3 px-1.5 py-0.5 rounded bg-[bisque] text-[#2b2d42] text-xs whitespace-nowrap">
            {cursor.username}
            </span>
        </div>
        ))}


        {!username && (
            <div className="fixed inset-0 bg-black/80 flex items-center justify-center z-50">
                <div className="bg-[#2b2d42] border border-[#edf2f4] rounded-lg p-6 min-w-[300px] text-center text-[#edf2f4]">
                <p className="mb-4 text-lg">Enter your username</p>
                <input
                    className="px-3 py-2 rounded bg-white text-black w-full mb-1"
                    placeholder="Min 3 characters"
                    value={usernameInput}
                    onChange={(e) => setUsernameInput(e.target.value)}
                    onKeyDown={(e) => e.key === "Enter" && saveUsername()}
                    autoFocus
                />
                <p className="text-xs opacity-60 mb-4 text-left">
                    {usernameInput.trim().length}/3 characters minimum
                </p>
                <button
                    className={`px-4 py-2 rounded ${
                    usernameInput.trim().length >= 3
                        ? "bg-[bisque] text-[#2b2d42] cursor-pointer"
                        : "bg-gray-500 cursor-not-allowed opacity-50"
                    }`}
                    onClick={saveUsername}
                    disabled={usernameInput.trim().length < 3}
                >
                    Continue
                </button>
                </div>
            </div>
            )}

        {voteModal && (
        <div className="fixed inset-0 bg-black/60 flex items-center justify-center z-50">
            <div className="bg-[#2b2d42] border border-[#edf2f4] rounded-lg p-6 min-w-[300px] text-center text-[#edf2f4]">
            {voteModal.kind === "waiting" && (
                <>
                <p className="mb-4">
                    Requesting switch to {LANGUAGES[voteModal.language].name}...
                </p>
                <div className="mx-auto h-8 w-8 border-4 border-[#edf2f4] border-t-[bisque] rounded-full animate-spin" />
                <p className="mt-4 text-sm opacity-70">Waiting for others to accept</p>
                </>
            )}

            {voteModal.kind === "incoming" && (
                <>
                <p className="mb-6">
                    A user wants to switch the language to{" "}
                    <span className="text-[bisque] font-bold">
                    {LANGUAGES[voteModal.language].name}
                    </span>
                </p>
                <div className="flex justify-center gap-4">
                    <button
                    className="px-4 py-2 rounded bg-green-500 cursor-pointer"
                    onClick={() => voteOnLanguageChange(true)}
                    >
                    Accept
                    </button>
                    <button
                    className="px-4 py-2 rounded bg-red-400 cursor-pointer"
                    onClick={() => voteOnLanguageChange(false)}
                    >
                    Reject
                    </button>
                </div>
                </>
            )}

            {voteModal.kind === "result" && (
                <p className={voteModal.accepted ? "text-green-400" : "text-red-400"}>
                {voteModal.accepted
                    ? `Accepted! Switching to ${LANGUAGES[voteModal.language].name}`
                    : "Request rejected"}
                </p>
            )}
            </div>
        </div>
        )}

        {showPeopleModal && (
            <div
                className="fixed inset-0 bg-black/60 flex items-center justify-center z-50"
                onClick={() => setShowPeopleModal(false)}
            >
                <div
                className="bg-[#2b2d42] border border-[#edf2f4] rounded-lg p-6 min-w-[300px] text-[#edf2f4]"
                onClick={(e) => e.stopPropagation()}
                >
                <p className="text-lg mb-4 text-center">People in the room</p>
                <ol className="list-decimal list-inside">
                    {peopleList.map((name, i) => (
                    <li key={i} className="py-1">
                        {name}
                    </li>
                    ))}
                </ol>
                <button
                    className="mt-4 px-4 py-2 rounded bg-[#edf2f4] text-[#2b2d42] cursor-pointer w-full"
                    onClick={() => setShowPeopleModal(false)}
                >
                    Close
                </button>
                </div>
            </div>
        )}

      <header className="p-4 flex justify-between">
        <div className="flex items-center gap-4 ml-20 text-[2rem] text-[bisque] [text-shadow:0px_0px_3px_bisque]">
          <h1 className="text-[1em] font-bold">CodeForge </h1>
          <img
            className="w-8 h-8 bg-[bisque] mt-2"
            src="/code-block-svgrepo-com.png"
            alt="code"
          />
          {username && (
            <span className="text-[1.2rem] mt-2 [text-shadow:none] opacity-80">
            Hi, {username}
            </span>
        )}
        </div>
        <div className="flex items-center gap-2">
  {roomId ? (
     <>
        <button
        className="px-2 py-1 rounded bg-[#edf2f4] cursor-pointer text-sm"
        onClick={showPeople}
        >
         Show List
        </button>
        <span className="text-[bisque] text-base">Room: {roomId}</span>
        <button className="px-2 py-1 rounded bg-red-400 cursor-pointer text-sm" onClick={leaveRoom}>
          Leave
        </button>
    </>
  ) : (
    <>
      <button className="px-2 py-1 rounded bg-[#edf2f4] cursor-pointer text-sm" onClick={createRoom}>
        Create Room
      </button>
      <input
        className="px-2 py-1 rounded text-sm w-24 bg-white text-black"
        placeholder="Room ID"
        value={joinInput}
        onChange={(e) => setJoinInput(e.target.value)}
      />
      <button className="px-2 py-1 rounded bg-[#edf2f4] cursor-pointer text-sm" onClick={joinRoom}>
        Join
      </button>
    </>
  )}
</div>
      </header>

      <section className="flex min-h-screen">
        <div className="flex w-[5%] flex-col gap-4 p-[10px] border border-[#edf2f4]">
          <div
            className={langSquare("python")}
            onClick={() => requestLanguageChange("python")}
          >
            <PythonIcon />
          </div>

          <div
             className={langSquare("js")}
             onClick={() => requestLanguageChange("js")}
          >
            <JavaScriptIcon />
          </div>
        </div>

        <div className="w-[45%] bg-[#2b2d42] border border-[#edf2f4]">
          <nav className="p-1 border border-[#edf2f4] flex justify-between">
            <div className="min-w-[40%] flex items-center text-[#edf2f4]">
              <p>{config.fileName}</p>
            </div>

            <div className="flex min-w-[60%] gap-8">
              <button className={navBtn} onClick={handleCopy}>
                <img className="h-6 w-6" src="/icons8-copy.gif" alt="copy" />
              </button>

              {isExecuting ? (
                    <button
                        className="p-[5px] rounded-[5px] bg-red-400 hover:cursor-pointer"
                        onClick={cancelExecution}
                    >
                        <svg className="h-6 w-6" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                        <path d="M18 6L6 18M6 6l12 12" stroke="white" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                        </svg>
                    </button>
                    ):
                   <button className={getNavBtn()} onClick={runCode} disabled={isExecuting}>
                        <img
                        className="h-6 w-6"
                        src="/icons8-triangle-laces-32.png"
                        alt="run"
                        />
                    </button>   
                 }
            
              <button className={getNavBtn()} onClick={clearAll} disabled={isExecuting}>
                <img
                  className="h-6 w-6"
                  src="/clear-all-svgrepo-com.png"
                  alt="clear"
                />
              </button>

              <button className={getNavBtn()} onClick={codeToFile} disabled={isExecuting}>
                <img
                  className="h-6 w-6"
                  src="/download-svgrepo-com.png"
                  alt="download"
                />
              </button>
            </div>
          </nav>

        <CodeMirror
            value={input}
            height="100%"
            theme={tokyoNight}
            extensions={[LANG_EXTENSIONS[language]]}
            placeholder={config.placeholder}
            autoFocus
            onChange={(value) => {
                setInput(value);
                if (roomId) {
                socket.emit("code-change", { roomId, code: value });
                }
            }}
            basicSetup={{
                lineNumbers: true,
                highlightActiveLine: true,
                highlightActiveLineGutter: true,
                foldGutter: true,
                autocompletion: true,
                bracketMatching: true,
                closeBrackets: true,
            }}
            className="h-[93%] m-[3px] text-base"
            />
        </div>

        <div className="w-1/2 bg-[#2b2d42] text-[#edf2f4] border-t-2 border-b-[3px] border-r-[3px] border-[#edf2f4]">
          <p className="text-[1.4rem] p-[4.2px] border-b border-[#edf2f4]">
            Output
          </p>
          <div>
            <pre className="text-[1.2rem] p-[2px] m-[2px] min-w-[99%] min-h-[93%] whitespace-pre-wrap font-mono">
              {output}
            </pre>
          </div>
        </div>
      </section>
    </div>
  );
};

export default CodeRunner;