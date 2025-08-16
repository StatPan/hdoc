#!/usr/bin/env node

import { Command } from 'commander';
import initCommand from '../src/commands/init.js';
import buildCommand from '../src/commands/build.js';
import configCommand from '../src/commands/config.js';
import exportCommand from '../src/commands/export.js';

const program = new Command();

program
  .name('hdoc')
  .description('HTML-based document builder with page-based architecture')
  .version('0.1.0');

program
  .command('init')
  .argument('[name]', 'project name', 'my-document')
  .description('initialize a new hdoc project')
  .action(initCommand);

program
  .command('build')
  .description('build the document from pages')
  .action(buildCommand);

program
  .command('config')
  .argument('[key]', 'configuration key')
  .argument('[value]', 'configuration value')
  .description('manage project configuration')
  .action(configCommand);

program
  .command('export')
  .argument('[output]', 'output file path', 'document.pdf')
  .option('-f, --format <format>', 'export format', 'pdf')
  .description('export document to PDF or other formats')
  .action(exportCommand);

program.parse();