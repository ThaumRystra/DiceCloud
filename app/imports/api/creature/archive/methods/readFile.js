import { promises as fs } from 'fs';

// Read a file and return the result
export default function read(file){
  return fs.readFile(file.path, 'utf8');
}
