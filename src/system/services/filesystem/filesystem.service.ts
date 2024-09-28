import { Injectable } from '@nestjs/common';
import { exec } from 'child_process';
import { existsSync } from 'fs';
import * as fs from 'fs-extra';
import * as path from 'path';

@Injectable()
export class FileSystemService {
  // private readonly baseDir: string;

  constructor() {
    // this.baseDir = `${this.findProjectFolder()}/storage`;
    // if (!fs.existsSync(this.baseDir)) {
    //   fs.mkdirSync(this.baseDir);
    // }
  }

  existsSync = existsSync;

  readFileSync(relativePath: string): Buffer {
    const absoluteScriptPath = this.parseRelativePath(relativePath);
    // Check if the file exists
    if (!fs.existsSync(absoluteScriptPath)) {
      throw new Error('The specified script does not exist.');
    }
    return fs.readFileSync(absoluteScriptPath);
  }

  // async saveFile(
  //   folderPath: string,
  //   name: string,
  //   content: string,
  // ): Promise<void> {
  //   const fullPath = path.join(this.baseDir, folderPath, `${name}.gz`);
  //   const compressed = await compress(Buffer.from(content, 'utf-8'));
  //   await fs.outputFile(fullPath, compressed);
  // }

  // async getFile(folderPath: string, name: string): Promise<string> {
  //   const fullPath = path.join(this.baseDir, folderPath, `${name}.gz`);
  //   if (!(await fs.pathExists(fullPath))) {
  //     throw new NotFoundException(
  //       `File ${name} not found in folder ${folderPath}`,
  //     );
  //   }
  //   const compressed = await fs.readFile(fullPath);
  //   const decompressed = await decompress(compressed);
  //   return decompressed.toString('utf-8');
  // }

  // async deleteFile(folderPath: string, name: string): Promise<void> {
  //   const fullPath = path.join(this.baseDir, folderPath, `${name}.gz`);
  //   await fs.remove(fullPath);
  // }

  // async moveFile(oldPath: string, newPath: string): Promise<void> {
  //   const oldFullPath = path.join(this.baseDir, oldPath);
  //   const newFullPath = path.join(this.baseDir, newPath);

  //   if (!(await fs.pathExists(oldFullPath))) {
  //     throw new NotFoundException(`File ${oldPath} not found`);
  //   }

  //   if (await fs.pathExists(newFullPath)) {
  //     throw new Error(`File ${newPath} already exists`);
  //   }

  //   await fs.move(oldFullPath, newFullPath);
  // }

  // async listFiles(folderPath: string): Promise<string[]> {
  //   const fullPath = path.join(this.baseDir, folderPath);
  //   if (!(await fs.pathExists(fullPath))) {
  //     throw new NotFoundException(`Folder ${folderPath} not found`);
  //   }

  //   const files = await fs.readdir(fullPath);
  //   // Filter out non-file entries and remove '.gz' extension for user clarity
  //   return files
  //     .filter((file) => file.endsWith('.gz'))
  //     .map((file) => file.replace('.gz', ''));
  // }

  // async saveFolder(projectPath: string, name: string): Promise<void> {
  //   const fullPath = path.join(this.baseDir, projectPath, name);
  //   await fs.ensureDir(fullPath);
  // }

  // async getFolder(projectPath: string): Promise<string[]> {
  //   const fullPath = path.join(this.baseDir, projectPath);
  //   if (!(await fs.pathExists(fullPath))) {
  //     throw new NotFoundException(`Folder ${projectPath} not found`);
  //   }
  //   return fs.readdir(fullPath);
  // }

  // async deleteFolder(projectPath: string): Promise<void> {
  //   const fullPath = path.join(this.baseDir, projectPath);
  //   await fs.remove(fullPath);
  // }

  // async renameFolder(
  //   oldFolderPath: string,
  //   newFolderName: string,
  // ): Promise<void> {
  //   const oldFullPath = path.join(this.baseDir, oldFolderPath);
  //   const newFullPath = path.join(
  //     this.baseDir,
  //     path.dirname(oldFolderPath),
  //     newFolderName,
  //   );

  //   if (!(await fs.pathExists(oldFullPath))) {
  //     throw new NotFoundException(`Folder ${oldFolderPath} not found`);
  //   }

  //   if (await fs.pathExists(newFullPath)) {
  //     throw new Error(`Folder ${newFolderName} already exists`);
  //   }

  //   await fs.rename(oldFullPath, newFullPath);
  // }

  // Starts with __dirname and goes up the directory tree until it finds a folder with a package.json file
  findProjectFolder(): string {
    let currentDir = __dirname;
    while (true) {
      const packageJsonPath = path.join(currentDir, 'package.json');
      if (fs.existsSync(packageJsonPath)) {
        return currentDir;
      }
      const parentDir = path.resolve(currentDir, '..');
      if (parentDir === currentDir) {
        throw new Error('No project folder found');
      }
      currentDir = parentDir;
    }
  }

  parseRelativePath(filePath: string): string {
    const projectDirectory = this.findProjectFolder();
    const absoluteScriptPath = path.resolve(projectDirectory, filePath);

    // Check if the script is within the project directory
    if (!absoluteScriptPath.startsWith(projectDirectory)) {
      throw new Error(
        `Absolute path restricted to the project directory. ${absoluteScriptPath} is outside the project directory.`,
      );
    }

    // Ensure the filePath does not contain any directory traversal patterns
    if (absoluteScriptPath.includes('..')) {
      throw new Error('Directory traversal is not allowed.');
    }

    return absoluteScriptPath;
  }

  executeFile(interpreter: string, filePath: string): Promise<string> {
    return new Promise((resolve, reject) => {
      try {
        const absoluteScriptPath = this.parseRelativePath(filePath);
        // Check if the file exists
        if (!fs.existsSync(absoluteScriptPath)) {
          reject(new Error('The specified script does not exist.'));
          return;
        }

        // Spawn a child process to execute the script
        const childProcess = exec(
          `${interpreter} "${absoluteScriptPath}"`,
          (error, stdout, stderr) => {
            if (error) {
              console.log(`stderr: ${stderr}`);
              console.error(`Error executing script: ${error.message}`);
              reject(error); // Reject the promise with the error
              return;
            }
            // Resolve the promise with the data from stdout
            resolve(stdout);
          },
        );

        // Listen for the process to exit
        childProcess.on('exit', (code) => {
          if (code !== 0) console.log(`Script exited with code ${code}`);
        });
      } catch (error) {
        reject(error);
      }
    });
  }
}
