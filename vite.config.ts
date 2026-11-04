import { execSync } from 'node:child_process'
import { readFileSync } from 'node:fs'

import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
import tailwindcss from '@tailwindcss/vite'

interface PackageJson {
  version: string
  license?: string
  repository?: string | { url?: string }
}

const readJson = (path: string) => JSON.parse(readFileSync(path, 'utf8')) as PackageJson

// `git+https://…/repo.git` -> `https://…/repo`
function repositoryUrl(repository: PackageJson['repository']): string | null {
  const raw = typeof repository === 'string' ? repository : repository?.url
  return raw ? raw.replace(/^git\+/, '').replace(/\.git$/, '') : null
}

const SHOWN_DEPENDENCIES: [label: string, pkg: string][] = [
  ['Mermaid', 'mermaid'],
  ['ELK layout', '@mermaid-js/layout-elk'],
  ['React', 'react'],
  ['CodeMirror', '@codemirror/view'],
  ['Zustand', 'zustand'],
  ['Tailwind CSS', 'tailwindcss'],
  ['Vite', 'vite'],
]

// Docker derlemesinde .git yoktur; commit `--build-arg GIT_COMMIT=…` ile dışarıdan verilir.
function gitCommit(): string | null {
  const fromEnv = process.env.GIT_COMMIT?.trim()
  if (fromEnv) return fromEnv
  const git = (args: string) =>
    execSync(`git ${args}`, { stdio: ['ignore', 'pipe', 'ignore'] }).toString().trim()
  try {
    const hash = git('rev-parse --short HEAD')
    // Commit edilmemiş değişiklik varsa numara yanıltıcı olmasın.
    return git('status --porcelain') ? `${hash}-dirty` : hash
  } catch {
    return null
  }
}

const rootPackage = readJson('./package.json')

const appInfo = {
  version: rootPackage.version,
  license: rootPackage.license ?? null,
  repositoryUrl: repositoryUrl(rootPackage.repository),
  commit: gitCommit(),
  builtAt: new Date().toISOString(),
  // Aralık (^1.2.3) değil, gerçekten kurulu sürüm.
  dependencies: SHOWN_DEPENDENCIES.map(([label, pkg]) => ({
    name: label,
    version: readJson(`./node_modules/${pkg}/package.json`).version,
  })),
}

export default defineConfig({
  plugins: [react(), tailwindcss()],
  define: { __APP_INFO__: JSON.stringify(appInfo) },
})
