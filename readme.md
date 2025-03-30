# Polar FS Utils

A comprehensive file system utility library for Deno, providing simple and reliable functions for common file and directory operations.

## Features

- Directory operations (create, remove, copy, list)
- File operations (read, write, copy, remove)
- ZIP functionality
- Type-safe interfaces
- Comprehensive error handling
- Promise-based API

## Installation

```typescript
import {
  copyDir,
  copyFile,
  getDirectories,
  getFile,
  getTextContent,
  makeDir,
  removeDir,
  removeFile,
  writeFile,
  zipFolder,
} from 'https://raw.githubusercontent.com/your-username/polar-fs-utils/main/main.ts';
```

## API Reference

### Types

```typescript
interface DirectoryInput {
  projectRoot: string;  // Root directory path
  path: string;        // Relative path from root
}

interface CopyInput {
  projectRoot: string;
  source: string;      // Source path relative to root
  target: string;      // Target path relative to root
}

interface ZipInput extends CopyInput {
  name: string;        // Name of the zip file
}

interface FileInput extends DirectoryInput {
  content?: string;    // Content to write to file
}
```

### Directory Operations

#### makeDir(input: DirectoryInput): Promise<void>
Creates a new directory.
```typescript
await makeDir({ 
  projectRoot: './myproject', 
  path: '/src/components' 
});
```

#### getDirectories(input: DirectoryInput): Promise<string[]>
Lists all directories in the specified path.
```typescript
const dirs = await getDirectories({ 
  projectRoot: './myproject', 
  path: '/src' 
});
```

#### removeDir(input: DirectoryInput): Promise<void>
Removes a directory and all its contents.
```typescript
await removeDir({ 
  projectRoot: './myproject', 
  path: '/temp' 
});
```

#### copyDir(input: CopyInput): Promise<void>
Copies a directory and all its contents.
```typescript
await copyDir({
  projectRoot: './myproject',
  source: '/src/old',
  target: '/src/new'
});
```

#### zipFolder(input: ZipInput): Promise<void>
Creates a ZIP archive of a directory.
```typescript
await zipFolder({
  projectRoot: './myproject',
  source: '/dist',
  target: '/releases',
  name: 'my-project-v1'
});
```

### File Operations

#### writeFile(input: FileInput): Promise<void>
Writes content to a file.
```typescript
await writeFile({
  projectRoot: './myproject',
  path: '/src/config.json',
  content: '{"version": "1.0.0"}'
});
```

#### getFile(input: DirectoryInput): Promise<Uint8Array>
Reads a file as binary data.
```typescript
const data = await getFile({
  projectRoot: './myproject',
  path: '/assets/image.png'
});
```

#### getTextContent(input: DirectoryInput): Promise<string>
Reads a file as text.
```typescript
const content = await getTextContent({
  projectRoot: './myproject',
  path: '/README.md'
});
```

#### copyFile(input: CopyInput): Promise<void>
Copies a file from one location to another.
```typescript
await copyFile({
  projectRoot: './myproject',
  source: '/src/old.ts',
  target: '/src/new.ts'
});
```

#### removeFile(input: DirectoryInput): Promise<void>
Deletes a file.
```typescript
await removeFile({
  projectRoot: './myproject',
  path: '/temp/log.txt'
});
```

## Error Handling

All functions use proper error handling and will throw appropriate errors when operations fail. It's recommended to use try-catch blocks when using these functions:

```typescript
try {
  await writeFile({
    projectRoot: './myproject',
    path: '/config.json',
    content: '{"setting": "value"}'
  });
} catch (error) {
  console.error('Failed to write file:', error);
}
```

## Testing

The library includes comprehensive tests. To run the tests:

```bash
deno test
```

## Requirements

- Deno runtime
- `zip` command-line utility (for zipFolder functionality)

## License

MIT License