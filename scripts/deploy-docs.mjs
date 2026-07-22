import { execFileSync } from 'node:child_process'
import { promisify } from 'node:util'
import { publish } from 'gh-pages'

const repositoryName = 'partiplex'
const executable = process.platform === 'win32' ? 'pnpm.cmd' : 'pnpm'

execFileSync(executable, ['exec', 'vitepress', 'build', 'docs'], {
  stdio: 'inherit',
  env: {
    ...process.env,
    DOCS_BASE: `/${repositoryName}/`,
  },
})

await promisify(publish)('docs/.vitepress/dist', {
  add: false,
  branch: 'gh-pages',
  dotfiles: true,
  message: 'docs: deploy site',
})
