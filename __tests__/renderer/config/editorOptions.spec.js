const {
  default: editorOptions,
} = require("../../../src/renderer/config/editorOptions");

describe("[CONFIG] - editorOptions", () => {
  it("should return options", () => {
    const options = editorOptions("::THEME::");
    const expectedResponse = {
      theme: "::THEME::",
      lineNumbers: true,
      mode: "markdown",
      lineWrapping: true,
    };
    expect(options).toEqual(expectedResponse);
  });
});
