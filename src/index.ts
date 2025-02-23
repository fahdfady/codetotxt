import { promises as fs } from 'fs';
import path from 'path';
import { MergeOptions } from './types';
import chalk from 'chalk';

const DEFAULT_IGNORES = [
    'node_modules',
    '.git',
    '.vscode',
    '.idea',
    '.DS_Store',
    'dist',
    'build',
    '.next',
    '.nuxt',
]

export async function getFiles(dir: string, ignoreList: string[]): Promise<string[]> {
    const entries = await fs.readdir(dir, { withFileTypes: true });
    const files: string[] = [];

    for (const entry of entries) {
        const fullPath = path.join(dir, entry.name);
        if (entry.isDirectory()) {
            if (ignoreList.includes(entry.name)) {
                continue;
            }
            files.push(...await getFiles(fullPath, ignoreList));
        } else if (entry.isFile()) {
            files.push(fullPath);
        }
    }
    return files;
}

export async function mergeFiles(options: MergeOptions): Promise<void> {
    const { inputDir, outputFile, ignoreList, ignoreExtensions } = options;

    const finalIgnoreList = [...DEFAULT_IGNORES, ...ignoreList];

    try {
        await fs.access(inputDir);
    } catch (error) {
        throw new Error(`Input directory not found: ${inputDir}`);
    }

    try {
        const files = await getFiles(inputDir, finalIgnoreList);
        const fileContents = await Promise.all(files.map(async (file) => {
            const ext = path.extname(file);
            if (ignoreExtensions.includes(ext)) {
                return '';
            }
            return await fs.readFile(file, 'utf-8');
        }));
        await fs.writeFile(outputFile, fileContents.join('\n'));
        console.log(`Merged ${files.length} files into ${outputFile}`);

    } catch (error) {
        console.error(chalk.red(`Error merging files: ${error}`));
    }
}