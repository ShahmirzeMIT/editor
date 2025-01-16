const fileSystem = {
  javascript: {
    'index.html': '<!DOCTYPE html>\n<html lang="en">\n<head>\n  <meta charset="UTF-8">\n  <title>Document</title>\n  <script src="app.js"></script>\n  <link rel="stylesheet" href="style.css">\n</head>\n<body>\n  <h1>Hello, World!</h1>\n</body>\n</html>',
    'app.js': "console.log('Hello, World!'); function getData() { console.log('Dynamic function loaded!'); }",
    'style.css': 'body {\n  background-color: lightblue;\n}'
  },
  typescript: {
    'index.html': '<!DOCTYPE html>\n<html lang="en">\n<head>\n  <meta charset="UTF-8">\n  <title>Document</title>\n  <script src="app.ts"></script>\n  <link rel="stylesheet" href="style.css">\n</head>\n<body>\n  <h1>Hello, World!</h1>\n</body>\n</html>',
    'app.ts': "console.log('Hello, TypeScript World!');",
    'style.css': 'body {\n  background-color: lightblue;\n}'
  }
};


let editor;
let currentFile = 'index.html';
let currentLanguage = 'javascript';

// Initialize Monaco Editor
// Initialize Monaco Editor
require.config({ paths: { 'vs': 'https://cdnjs.cloudflare.com/ajax/libs/monaco-editor/0.41.0/min/vs' } });

require(['vs/editor/editor.main'], function () {
  let editor = monaco.editor.create(document.getElementById('editor-container'), {
    value: fileSystem[currentLanguage][currentFile],
    language: 'html',
    theme: 'vs-light',
    automaticLayout: true
  });

  // Handle Language Change
  document.getElementById('language-select').addEventListener('change', function () {
    currentLanguage = this.value;
    currentFile = 'index.html'; 
    updateFileTree();

    // Update editor content and language
    editor.setValue(fileSystem[currentLanguage][currentFile]);
    monaco.editor.setModelLanguage(editor.getModel(), 'html');
  });

  // Handle Theme Change
  document.getElementById('theme-select').addEventListener('change', function () {
    const theme = this.value;
    monaco.editor.setTheme(theme);
    document.body.className = theme === 'vs-dark' ? 'dark-mode' : 'light-mode';
  });

  // Handle New File Creation
  document.getElementById('new-file-btn').addEventListener('click', function () {
    const newFileName = prompt('Enter new file name:');
    if (newFileName && !fileSystem[currentLanguage][newFileName]) {
      fileSystem[currentLanguage][newFileName] = '';
      addFileToTree(newFileName);
    }
  });

  // Handle File Upload
  document.getElementById('file-upload').addEventListener('change', function (e) {
    Array.from(e.target.files).forEach(file => {
      const reader = new FileReader();
      reader.onload = function () {
        fileSystem[currentLanguage][file.name] = reader.result;
        addFileToTree(file.name);
      };
      reader.readAsText(file);
    });
  });

  // Handle Run Button Click
  document.getElementById('run-btn').addEventListener('click', function () {
    // Save the current file before running
    fileSystem[currentLanguage][currentFile] = editor.getValue();

    // Get the iframe document
    const iframe = document.getElementById('output-iframe');
    const iframeDoc = iframe.contentDocument || iframe.contentWindow.document;
    iframeDoc.open();

    // Update HTML content
    const htmlContent = fileSystem[currentLanguage]['index.html'];
    iframeDoc.write(htmlContent);

    // Inject CSS
    const styleContent = fileSystem[currentLanguage]['style.css'];
    const styleTag = iframeDoc.createElement('style');
    styleTag.textContent = styleContent;
    iframeDoc.head.appendChild(styleTag);

    // Inject JavaScript
    const scriptContent = fileSystem[currentLanguage][currentLanguage === 'javascript' ? 'app.js' : 'app.ts'];
    const scriptTag = iframeDoc.createElement('script');
    scriptTag.textContent = scriptContent;
    iframeDoc.body.appendChild(scriptTag);

    iframeDoc.close();
  });

  function updateFileTree() {
    const fileTree = document.getElementById('file-tree');
    fileTree.innerHTML = '';

    Object.keys(fileSystem[currentLanguage]).forEach(addFileToTree);
  }

  function addFileToTree(fileName) {
    const fileTree = document.getElementById('file-tree');
    const fileDiv = document.createElement('div');
    fileDiv.textContent = fileName;
    fileDiv.addEventListener('click', function () {
      saveCurrentFile();
      currentFile = fileName;
      editor.setValue(fileSystem[currentLanguage][currentFile]);
      const language = fileName.split('.').pop();
      monaco.editor.setModelLanguage(editor.getModel(), language === 'ts' ? 'typescript' : language);
    });
    fileTree.appendChild(fileDiv);
  }

  function saveCurrentFile() {
    fileSystem[currentLanguage][currentFile] = editor.getValue();
  }

  updateFileTree();
});
