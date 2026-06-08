import * as fs from 'fs';
import * as path from 'path';

function walkDir(dir: string, callback: (filePath: string) => void) {
  fs.readdirSync(dir).forEach(f => {
    let dirPath = path.join(dir, f);
    let isDirectory = fs.statSync(dirPath).isDirectory();
    isDirectory ? 
      walkDir(dirPath, callback) : callback(path.join(dir, f));
  });
}

function refactorImports(filePath: string) {
  if (!filePath.endsWith('.ts') && !filePath.endsWith('.tsx')) return;
  
  let content = fs.readFileSync(filePath, 'utf-8');
  
  // We want to replace paths like:
  // import { X } from '../../features/auth' -> '@features/auth'
  // import { Y } from '../../../entities/user' -> '@entities/user'
  // import { Z } from '../shared/ui/button' -> '@shared/ui/button'
  
  const layers = ['app', 'pages', 'widgets', 'features', 'entities', 'shared'];
  
  for (const layer of layers) {
    const regex = new RegExp(`from\\s+['"](?:\\.\\.\\/|\\.\\/)+(${layer}\\/[^'"]+)['"]`, 'g');
    content = content.replace(regex, "from '@$1'");
  }
  
  fs.writeFileSync(filePath, content, 'utf-8');
}

walkDir(path.resolve(__dirname, 'src'), refactorImports);
console.log('Done replacing aliases');
