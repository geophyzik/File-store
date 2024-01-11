/* eslint-disable import/no-extraneous-dependencies */
import * as monaco from 'monaco-editor';

const Preview = (code: string) => {
  const editorContainer = document.querySelector('.content') as HTMLElement;

  // self.MonacoEnvironment = {
  //   getWorkerUrl (moduleId, label) {
  //     return './editor.worker.bundle.js';
  //   },
  // };

  const editor = monaco.editor.create(editorContainer, {
    value: code,
    language: 'javascript',
    wordWrap: 'on',
    useTabStops: false,
    minimap: { enabled: false },
    fontFamily:
      'SFMono-Regular, Menlo, Monaco, Consolas, "Liberation Mono", "Courier New", monospace',
  });

  const updateEditorContent = (newCode: string) => {
    editor.setValue(newCode);
  };

  updateEditorContent(code);
};

export default Preview;
