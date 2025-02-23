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
    const files: string[] = await getFiles(inputDir, finalIgnoreList);
    let mergedContent: string = '';

    for (const file of files) {
        try {
            const data = await fs.readFile(file, 'utf-8');
            mergedContent += `\n\n--- File: ${file} ---\n`;
            mergedContent += data;
        } catch (error) {
            console.error(chalk.red(`Error merging file ${file}: ${error}`));
        }
    }

    await fs.writeFile(outputFile, mergedContent, 'utf-8');
    console.log(chalk.green(`Merged ${files.length} files into ${outputFile}`));
}