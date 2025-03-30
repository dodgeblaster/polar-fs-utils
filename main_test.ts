import { assertEquals, assertExists, assertRejects } from 'https://deno.land/std/assert/mod.ts';
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
} from './main.ts';

// Test setup: Create a temporary test directory
const TEST_ROOT = './test_tmp';
const projectRoot = TEST_ROOT;

// Helper function to create test directory structure
async function setupTestDirectory() {
  try {
    await Deno.mkdir(TEST_ROOT, { recursive: true });
  } catch (error) {
    if (!(error instanceof Deno.errors.AlreadyExists)) {
      throw error;
    }
  }
}

// Helper function to clean up test directory
async function cleanupTestDirectory() {
  try {
    await Deno.remove(TEST_ROOT, { recursive: true });
  } catch (error) {
    if (!(error instanceof Deno.errors.NotFound)) {
      throw error;
    }
  }
}

// Before each test
async function beforeEach() {
  await cleanupTestDirectory();
  await setupTestDirectory();
}

// After all tests
async function afterAll() {
  await cleanupTestDirectory();
}

Deno.test({
  name: 'Directory Operations',
  async fn(t) {
    await beforeEach();

    await t.step('makeDir - should create a directory', async () => {
      const dirPath = '/testDir';
      await makeDir({ projectRoot, path: dirPath });
      const dirInfo = await Deno.stat(TEST_ROOT + dirPath);
      assertEquals(dirInfo.isDirectory, true);
    });

    await t.step('getDirectories - should list directories', async () => {
      // Clean up any existing test directories first
      await cleanupTestDirectory();
      await setupTestDirectory();

      // Create test directories
      await makeDir({ projectRoot, path: '/dir1' });
      await makeDir({ projectRoot, path: '/dir2' });
      await writeFile({ projectRoot, path: '/file1.txt', content: 'test' });

      const dirs = await getDirectories({ projectRoot, path: '/' });
      dirs.sort(); // Sort for consistent testing
      const expected = ['dir1', 'dir2'];
      assertEquals(dirs, expected);
    });

    await t.step('copyDir - should copy directory', async () => {
      // Create source directory with content
      await makeDir({ projectRoot, path: '/sourceDir' });
      await writeFile({
        projectRoot,
        path: '/sourceDir/test.txt',
        content: 'test content',
      });

      await copyDir({
        projectRoot,
        source: '/sourceDir',
        target: '/targetDir',
      });

      const content = await getTextContent({
        projectRoot,
        path: '/targetDir/test.txt',
      });
      assertEquals(content, 'test content');
    });

    await t.step('removeDir - should remove directory', async () => {
      await makeDir({ projectRoot, path: '/dirToRemove' });
      await removeDir({ projectRoot, path: '/dirToRemove' });

      await assertRejects(
        async () => {
          await Deno.stat(TEST_ROOT + '/dirToRemove');
        },
        Deno.errors.NotFound,
      );
    });

    await afterAll();
  },
});

Deno.test({
  name: 'File Operations',
  async fn(t) {
    await beforeEach();

    await t.step('writeFile and getTextContent - should write and read file content', async () => {
      const content = 'Hello, World!';
      await writeFile({
        projectRoot,
        path: '/test.txt',
        content,
      });

      const readContent = await getTextContent({
        projectRoot,
        path: '/test.txt',
      });
      assertEquals(readContent, content);
    });

    await t.step('getFile - should read file as Uint8Array', async () => {
      const content = 'Binary content';
      await writeFile({
        projectRoot,
        path: '/binary.txt',
        content,
      });

      const fileContent = await getFile({
        projectRoot,
        path: '/binary.txt',
      });
      assertExists(fileContent);
      assertEquals(fileContent instanceof Uint8Array, true);
    });

    await t.step('copyFile - should copy file', async () => {
      const content = 'Copy test content';
      await writeFile({
        projectRoot,
        path: '/source.txt',
        content,
      });

      await copyFile({
        projectRoot,
        source: '/source.txt',
        target: '/target.txt',
      });

      const copiedContent = await getTextContent({
        projectRoot,
        path: '/target.txt',
      });
      assertEquals(copiedContent, content);
    });

    await t.step('removeFile - should delete file', async () => {
      await writeFile({
        projectRoot,
        path: '/toDelete.txt',
        content: 'Delete me',
      });

      await removeFile({ projectRoot, path: '/toDelete.txt' });

      await assertRejects(
        async () => {
          await Deno.stat(TEST_ROOT + '/toDelete.txt');
        },
        Deno.errors.NotFound,
      );
    });

    await afterAll();
  },
});

Deno.test({
  name: 'Zip Operations',
  async fn(t) {
    await beforeEach();

    await t.step('zipFolder - should create zip file', async () => {
      // Create test directory with content
      await makeDir({ projectRoot, path: '/folderToZip' });
      await writeFile({
        projectRoot,
        path: '/folderToZip/test.txt',
        content: 'zip test content',
      });

      await zipFolder({
        projectRoot,
        source: '/folderToZip',
        target: '/zips',
        name: 'test_archive',
      });

      const zipExists = await Deno.stat(TEST_ROOT + '/zips/test_archive.zip');
      assertExists(zipExists);
    });

    await afterAll();
  },
});

// Test error cases
Deno.test({
  name: 'Error Handling',
  async fn(t) {
    await beforeEach();

    await t.step('makeDir - should handle existing directory', async () => {
      const dirPath = '/existingDir';
      await makeDir({ projectRoot, path: dirPath });
      // Should not throw when creating the same directory again
      await makeDir({ projectRoot, path: dirPath });
    });

    await t.step('removeDir - should handle non-existent directory', async () => {
      await removeDir({ projectRoot, path: '/nonexistent' });
    });

    await t.step('writeFile - should throw on missing content', async () => {
      await assertRejects(
        async () => {
          await writeFile({
            projectRoot,
            path: '/test.txt',
          });
        },
        Error,
        'Content is required for writing file',
      );
    });

    await t.step('getFile - should throw on non-existent file', async () => {
      await assertRejects(
        async () => {
          await getFile({
            projectRoot,
            path: '/nonexistent.txt',
          });
        },
        Deno.errors.NotFound,
      );
    });

    await afterAll();
  },
});
