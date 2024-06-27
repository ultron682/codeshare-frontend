import React, { useState, useEffect } from "react";
import * as signalR from "@microsoft/signalr";
import queryString from "query-string";
import { Controlled as CodeMirror } from "react-codemirror2";
import "codemirror/lib/codemirror.css";
import "codemirror/theme/material.css";
import "codemirror/mode/javascript/javascript.js";
import "codemirror/mode/xml/xml.js";
import "codemirror/mode/css/css.js";

const CodeEditor = () => {
  const [code, setCode] = useState("");
  const [connection, setConnection] = useState(null);
  const [uniqueId, setUniqueId] = useState("");
  const [theme, setTheme] = useState("material");
  const [language, setLanguage] = useState("javascript");
  const [isConnected, setIsConnected] = useState(true);

  useEffect(() => {
    const values = queryString.parse(window.location.search);
    if (values.id) {
      setUniqueId(values.id);
    } else {
      const generatedId = generateUniqueId();
      setUniqueId(generatedId);
      window.history.replaceState(null, null, `?id=${generatedId}`);
    }

    const newConnection = new signalR.HubConnectionBuilder()
      .withUrl("http://192.168.10.17:5555/codesharehub", {
        withCredentials: false,
      })
      .withAutomaticReconnect()
      .build();

    setConnection(newConnection);
  }, []);

  useEffect(() => {
    if (connection) {
      connection
        .start()
        .then((result) => {
          console.log("Connected!");
          setIsConnected(true);

          if (uniqueId) {
            connection.invoke("GetCode", uniqueId).then((code) => {
              setCode("Loading...");
              setCode(code);
            });

            connection.on("ReceiveCode", (receivedId, code) => {
              if (receivedId === uniqueId) {
                setCode(code);
              }
            });
          }
        })
        .catch((e) => {
          setIsConnected(false);
          console.log("Connection failed: ", e);
        });

      connection.onclose(() => {
        setIsConnected(false);
      });

      connection.onreconnecting(() => {
        setIsConnected(false);
      });
    }
  }, [connection, uniqueId]);

  const sendCode = async (code) => {
    if (connection.state === signalR.HubConnectionState.Connected) {
      try {
        await connection.send("SendCode", uniqueId, code);
      } catch (e) {
        console.log(e);
      }
    } else {
      alert("No connection to server yet.");
    }
  };

  const handleCodeChange = (editor, data, value) => {
    setCode(value);
    sendCode(value);
  };

  const generateUniqueId = () => {
    return "xxxxx".replace(/x/g, () => {
      return Math.floor(Math.random() * 16).toString(16);
    });
  };

  const handleThemeChange = (event) => {
    const selectedTheme = event.target.value;
    setTheme(selectedTheme);
  };

  const handleLanguageChange = (event) => {
    const selectedLanguage = event.target.value;
    setLanguage(selectedLanguage);
  };

  const refreshPage = () => {
    window.location.reload();
  };

  return (
    <>
      <div style={{ marginBottom: 10 }}>
        <label htmlFor="themeSelect">Theme:</label>
        <select id="themeSelect" onChange={handleThemeChange} value={theme}>
          <option value="material">Material</option>
          <option value="default">Default</option>
          {/* Add more theme options here */}
        </select>

        <label htmlFor="languageSelect">Language:</label>
        <select
          id="languageSelect"
          onChange={handleLanguageChange}
          value={language}
        >
          <option value="javascript">JavaScript</option>
          <option value="xml">XML</option>
          <option value="css">CSS</option>
          {/* Add more language options here */}
        </select>
      </div>

      {!isConnected && (
        <div
          style={{
            padding: "10px",
            backgroundColor: "#f8d7da",
            color: "#721c24",
            border: "1px solid #f5c6cb",
            borderRadius: "4px",
            marginBottom: "10px",
            display: "flex",
            justifyContent: "space-between",
            alignItems: "center",
          }}
        >
          <span>No connection to the server.</span>
          <button
            onClick={refreshPage}
            style={{
              backgroundColor: "#721c24",
              color: "white",
              border: "none",
              padding: "5px 10px",
              cursor: "pointer",
              borderRadius: "4px",
            }}
          >
            Refresh
          </button>
        </div>
      )}

      <CodeMirror
        value={code}
        options={{
          mode: language,
          theme: theme,
          lineNumbers: true,
        }}
        onBeforeChange={handleCodeChange}
      />
    </>
  );
};

export default CodeEditor;
