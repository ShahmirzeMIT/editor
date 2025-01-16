const fileSystem = {
  'index.html': '<!DOCTYPE html>\n<html lang=\"en\">\n<head>\n  <meta charset=\"UTF-8\">\n  <title>Document</title>\n  <script src=\"app.js\"></script>\n  <link rel="stylesheet" href="style.css">\n</head>\n<body>\n  <h1>Hello, World!</h1>\n</body>\n</html>',
  'app.js': "console.log('Hello, World!'); function getData() { console.log('Dynamic function loaded!'); }",
  'app.ts': "console.log('Hello, TypeScript World!');",
  'style.css': 'body {\n  background-color: lightblue;\n}'
};

let editor;
let currentFile = 'index.html';

// Initialize Monaco Editor
require.config({ paths: { 'vs': 'https://cdnjs.cloudflare.com/ajax/libs/monaco-editor/0.41.0/min/vs' } });

require(['vs/editor/editor.main'], function () {
  editor = monaco.editor.create(document.getElementById('editor-container'), {
    value: fileSystem[currentFile],
    language: 'html',
    theme: 'vs-light',
    automaticLayout: true
  });

  // Handle Language Change
  document.getElementById('language-select').addEventListener('change', function () {
    const language = this.value;

    // Clear the file tree
    const fileTree = document.getElementById('file-tree');
    fileTree.innerHTML = '';

    // Add relevant files to the tree based on the selected language
    if (language === 'javascript') {
      addFileToTree('app.js');
      addFileToTree('style.css');
      addFileToTree('index.html');
      currentFile = 'app.js'; // Set default to app.js
    } else if (language === 'typescript') {
      addFileToTree('app.ts');
      addFileToTree('style.css');
      addFileToTree('index.html');
      currentFile = 'app.ts'; // Set default to app.ts
    }

    // Set the editor value and language
    editor.setValue(fileSystem[currentFile]);
    monaco.editor.setModelLanguage(editor.getModel(), language);
  });

  // Handle Theme Change
  document.getElementById('theme-select').addEventListener('change', function () {
    const theme = this.value;
    monaco.editor.setTheme(theme);

    // Apply dark or light theme to the entire UI
    if (theme === 'vs-dark') {
      document.body.classList.add('dark-mode');
      document.body.classList.remove('light-mode');
    } else {
      document.body.classList.add('light-mode');
      document.body.classList.remove('dark-mode');
    }
  });

  // Handle New File Creation
  document.getElementById('new-file-btn').addEventListener('click', function () {
    const newFileName = prompt('Enter new file name:');
    if (newFileName && !fileSystem[newFileName]) {
      fileSystem[newFileName] = ''; // Create an empty file
      addFileToTree(newFileName);
    }
  });

  // Handle File Upload
  document.getElementById('file-upload').addEventListener('change', function (e) {
    Array.from(e.target.files).forEach(file => {
      const reader = new FileReader();
      reader.onload = function () {
        fileSystem[file.name] = reader.result;
        addFileToTree(file.name);
      };
      reader.readAsText(file);
    });
  });

  // Handle Run Button Click
  document.getElementById('run-btn').addEventListener('click', function () {
    fileSystem[currentFile] = editor.getValue(); // Save current file

    const iframe = document.getElementById('output-iframe');
    const iframeDoc = iframe.contentDocument || iframe.contentWindow.document;
    iframeDoc.open();

    // Inject HTML content and linked resources
    const htmlContent = fileSystem['index.html'];
    iframeDoc.write(htmlContent);

    // Dynamically apply styles and scripts
    const styleContent = fileSystem['style.css'];
    const styleTag = iframeDoc.createElement('style');
    styleTag.textContent = styleContent;
    iframeDoc.head.appendChild(styleTag);

    const scriptContent = fileSystem ['app.js'] || fileSystem['app.ts'];
    const scriptTag = iframeDoc.createElement('script');
    scriptTag.textContent = scriptContent;
    iframeDoc.body.appendChild(scriptTag);

    iframeDoc.close();
  });

  function addFileToTree(fileName) {
    const fileTree = document.getElementById('file-tree');
    const fileDiv = document.createElement('div');
    fileDiv.textContent = fileName;
    fileDiv.addEventListener('click', function () {
      saveCurrentFile();
      currentFile = fileName;
      editor.setValue(fileSystem[currentFile]);
      const language = fileName.split('.').pop();
      monaco.editor.setModelLanguage(editor.getModel(), language);
    });
    fileTree.appendChild(fileDiv);
  }

  function saveCurrentFile() {
    fileSystem[currentFile] = editor.getValue();
  }

  Object.keys(fileSystem).forEach(addFileToTree);
});