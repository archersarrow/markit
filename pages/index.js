import React, { useRef, useEffect } from "react";
import MarkdowPreview from "../components/MarkdownPreview";
import editorOptions from "../constants/editorOptions";
import useIpcEvents from "../hooks/useIpcEvents";
const { ipcRenderer } = require("electron");

import {
  SELECT_ALL,
  SET_EDITOR_TEXT,
  SET_THEME,
  SET_ALLOW_HTML,
  SAVE_CONTENT_IN_STORE,
} from "../constants";

const Home = () => {
  const editor = useRef(null);
  const [content, setContent] = useIpcEvents({
    initValue: "",
    event: SET_EDITOR_TEXT,
  });

  const selectAll = (editor) => editor.current.execCommand("selectAll");

  const [theme] = useIpcEvents({ initValue: "yonce", event: SET_THEME });
  const [allowHtml] = useIpcEvents({ initValue: false, event: SET_ALLOW_HTML });
  useIpcEvents({ event: SELECT_ALL, callback: selectAll.bind(null, editor) });

  const onChangeHandler = (editor, data, value) => {
    setContent(value);
    ipcRenderer.send(SAVE_CONTENT_IN_STORE, content);
  };

  useEffect(() => {
    if (editor && editor.current) editor.current.focus();
  }, []);

  let CodeMirror = null;
  if (
    typeof window !== "undefined" &&
    typeof window.navigator !== "undefined"
  ) {
    CodeMirror = require("react-codemirror2");
    require("codemirror/mode/markdown/markdown");
  }
  return (
    <div className="layout">
      <div className="editor">
        {CodeMirror && (
          <CodeMirror.Controlled
            editorDidMount={(e) => (editor.current = e)}
            value={content}
            options={editorOptions(theme)}
            onBeforeChange={onChangeHandler}
            onChange={onChangeHandler}
          />
        )}
      </div>
      <div className="preview">
        <MarkdowPreview allowHtml={allowHtml} markdown={content} />
      </div>
    </div>
  );
};

export default Home;
