const fs = require('fs');
const path = require('path');

function walkDir(dir, callback) {
  fs.readdirSync(dir).forEach(f => {
    let dirPath = path.join(dir, f);
    let isDirectory = fs.statSync(dirPath).isDirectory();
    isDirectory ? 
      walkDir(dirPath, callback) : callback(path.join(dir, f));
  });
}

function refactorImports(filePath) {
  if (!filePath.endsWith('.ts') && !filePath.endsWith('.tsx')) return;
  
  let content = fs.readFileSync(filePath, 'utf-8');
  let originalContent = content;
  
  const layers = ['app', 'pages', 'widgets', 'features', 'entities', 'shared'];
  
  for (const layer of layers) {
    const regex = new RegExp(`from\\s+['"](?:\\.\\.\\/|\\.\\/)+(${layer}\\/[^'"]+)['"]`, 'g');
    content = content.replace(regex, "from '@$1'");
    
    // Also replace direct imports to layer (e.g. from '../../features/manage-teachers')
    const regexExact = new RegExp(`from\\s+['"](?:\\.\\.\\/|\\.\\/)+(${layer})['"]`, 'g');
    content = content.replace(regexExact, "from '@$1'");
  }
  
  if (content !== originalContent) {
    fs.writeFileSync(filePath, content, 'utf-8');
    console.log(`Updated ${filePath}`);
  }
}

walkDir(path.resolve(__dirname, 'src'), refactorImports);
console.log('Done replacing aliases');
