import fs from 'fs'
import path from 'path'

const pkgPath = path.resolve('package.json')
const envPath = path.resolve('.env.development')

// Determine bump type
const args = process.argv.slice(2)
let type = 'patch'
if (args.includes('--minor')) type = 'minor'
if (args.includes('--major')) type = 'major'

// Read and bump version
const pkg = JSON.parse(fs.readFileSync(pkgPath, 'utf-8'))
const parts = pkg.version.split('.').map(Number)

if (type === 'patch') {
  parts[2]++
} else if (type === 'minor') {
  parts[1]++
  parts[2] = 0
} else if (type === 'major') {
  parts[0]++
  parts[1] = 0
  parts[2] = 0
}

const newVersion = parts.join('.')
pkg.version = newVersion

// Save to package.json
fs.writeFileSync(pkgPath, JSON.stringify(pkg, null, 2))

// Update .env.development
let env = fs.existsSync(envPath) ? fs.readFileSync(envPath, 'utf-8') : ''
if (env.includes('VITE_APP_VERSION=')) {
  env = env.replace(/VITE_APP_VERSION=.*/g, `VITE_APP_VERSION=${newVersion}`)
} else {
  env += `\nVITE_APP_VERSION=${newVersion}`
}
fs.writeFileSync(envPath, env)

console.log(`✅ Bumped ${type} version to ${newVersion}`)
