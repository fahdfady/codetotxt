#!/usr/bin/env node

import { Command } from "commander";
import { MergeOptions } from "./types";
import chalk from "chalk";
import { mergeFiles } from ".";

const program = new Command();

program
    .version("0.0.1")
    .name("codetotxt")
    .description("merge codebases to a single txt file to use for LLM")
    .argument("<inputDir>", "Directory to merge")
    .option("-o, --output <file>", "Output file name", "merged_codebase.txt")
    .option("-i, --ignore <files>", "comma-seperated directories to ignore", "node_modules")
    .option("-e, --exts <extensions>", "comma-seperated file extensions to include", "")
    .action((inputDir, options) => {
        const mergeOptions: MergeOptions = {
            inputDir,
            outputFile: options.output,
            ignoreList: options.ignore.split(","),
            ignoreExtensions: options.exts.split(",")
        };

        console.log(chalk.blue(`Merging codebases in ${inputDir} to ${options.output}`));
    
        mergeFiles(mergeOptions);

        console.log(chalk.green("Done!"));
    });

program.parseAsync(process.argv);