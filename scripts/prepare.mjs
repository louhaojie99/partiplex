import { existsSync } from 'node:fs'
import { execFileSync } from 'node:child_process'
import { fileURLToPath } from 'node:url'
import { dirname, resolve } from 'node:path'

const packageRoot = resolve(dirname(fileURLToPath(import.meta.url)), '..')

if (!existsSync(resolve(packageRoot, '.git'))) {
  console.info('[hooks] Standalone .git directory not found; skipping Husky installation.')
  process.exit(0)
}

execFileSync('husky', [], { cwd: packageRoot, stdio: 'inherit' })
