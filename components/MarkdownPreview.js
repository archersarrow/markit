import React from "react";
import ReactMarkdown from "react-markdown";
import { Prism as SyntaxHighlighter } from "react-syntax-highlighter";
import gfm from "remark-gfm";

const renderers = {
  code: ({ language, value }) => {
    return <SyntaxHighlighter language={language} children={value || ""} />;
  },
};

export default ({ markdown, allowHtml }) => {
  return (
    <div className="markdown-body">
      <ReactMarkdown
        plugins={[gfm]}
        allowDangerousHtml={allowHtml}
        renderers={renderers}
        children={markdown}
      />
    </div>
  );
};
