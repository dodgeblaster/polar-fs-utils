// Import required Deno modules
import { ensureDir } from 'https://deno.land/std/fs/ensure_dir.ts';
import { copy as copySync } from 'https://deno.land/std/fs/copy.ts';
import { resolve } from 'https://deno.land/std/path/mod.ts';

interface DirectoryInput {
  projectRoot: string;
  path: string;
}

interface CopyInput {
  projectRoot: string;
  source: string;
  target: string;
}

interface ZipInput extends CopyInput {
  name: string;
}

interface FileInput extends DirectoryInput {
  content?: string;
}

interface ImportedModule {
  [key: string]: unknown;
}

/**
 * Helpers
 */
function formatWithTrailingSlash(x: string): string {
  return x + (x[x.length - 1] !== '/' ? '/' : '');
}

/**
 * Folders
 */
export async function getDirectories(input: DirectoryInput): Promise<string[]> {
  const directories: string[] = [];
  for await (const entry of Deno.readDir(input.projectRoot + input.path)) {
    if (entry.isDirectory) {
      directories.push(entry.name);
    }
  }
  return directories;
}

export async function makeDir(input: DirectoryInput): Promise<void> {
  try {
    await ensureDir(input.projectRoot + input.path);
  } catch (e) {
    if (e instanceof Error) {
      throw new Error(e.message);
    } else {
      throw new Error('Unknown Error');
    }
  }
}

export async function removeDir(input: DirectoryInput): Promise<void> {
  const thePath = input.projectRoot + input.path;
  try {
    await Deno.remove(thePath, { recursive: true });
  } catch (error) {
    if (!(error instanceof Deno.errors.NotFound)) {
      throw error;
    }
  }
}

export async function copyDir(input: CopyInput): Promise<void> {
  const source = input.projectRoot + input.source;
  const target = input.projectRoot + input.target;
  await copySync(source, target);
}

export async function zipFolder(input: ZipInput): Promise<void> {
  const source = input.projectRoot + input.source;
  const target = input.projectRoot + formatWithTrailingSlash(input.target);
  const name = input.name;

  await ensureDir(target);
  const zipFilePath = resolve(target, `${name}.zip`);

  // Using Deno subprocess to run zip command
  const cmd = new Deno.Command('zip', {
    args: ['-r', zipFilePath, '.'],
    cwd: source,
  });

  const { success, stdout, stderr } = await cmd.output();

  if (!success) {
    const errorOutput = new TextDecoder().decode(stderr);
    throw new Error(`Failed to create zip: ${errorOutput}`);
  }

  const output = new TextDecoder().decode(stdout);
  console.log(output);
}

/**
 * Files
 */
export async function getFile(input: DirectoryInput): Promise<Uint8Array> {
  const filePath = input.projectRoot + input.path;
  return await Deno.readFile(filePath);
}

export async function getJsFile(input: DirectoryInput): Promise<ImportedModule> {
  const filePath = input.projectRoot + input.path;
  return await import(filePath);
}

export async function writeFile(input: FileInput): Promise<void> {
  const filePath = input.projectRoot + input.path;
  if (!input.content) throw new Error('Content is required for writing file');
  await Deno.writeTextFile(filePath, input.content);
}

export async function removeFile(input: DirectoryInput): Promise<void> {
  const filePath = input.projectRoot + input.path;
  await Deno.remove(filePath);
}

export async function copyFile(input: CopyInput): Promise<void> {
  const source = input.projectRoot + input.source;
  const target = input.projectRoot + input.target;
  await Deno.copyFile(source, target);
}

export async function getTextContent(input: DirectoryInput): Promise<string> {
  const filePath = input.projectRoot + input.path;
  return await Deno.readTextFile(filePath);
}
