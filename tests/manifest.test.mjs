import assert from 'node:assert/strict'
import { readFileSync } from 'node:fs'
import { createRequire } from 'node:module'
import { test } from 'node:test'

const manifest = JSON.parse(readFileSync(new URL('../manifest.json', import.meta.url), 'utf8'))
const packageJson = JSON.parse(readFileSync(new URL('../package.json', import.meta.url), 'utf8'))
const sdkPackage = createRequire(import.meta.url)('@nonsplayer/plugin-sdk/package.json')
const lock = readFileSync(new URL('../pnpm-lock.yaml', import.meta.url), 'utf8')

test('manifest matches the package and plugin/UI API 3 contract', () => {
  assert.equal(manifest.version, '2.0.0')
  assert.equal(packageJson.version, manifest.version)
  assert.equal(manifest.engines.pluginApi, '^3.0.0')
  assert.equal(manifest.engines.uiApi, '^3.0.0')
  assert.equal(sdkPackage.version, '3.0.0')
  assert.equal(sdkPackage.nons.pluginApi, '3.0.0')
  assert.equal(sdkPackage.nons.uiApi, '3.0.0')
  for (const legacy of ['httpHosts', 'websocketHosts', 'coverHosts']) {
    assert.equal(legacy in manifest, false)
  }
  assert.equal(
    manifest.permissions.some((permission) => permission.startsWith('http:')),
    false
  )
  assert.deepEqual(manifest.permissions, [
    'clipboard:read',
    'music:metadata',
    'player:control',
    'ui',
    'config'
  ])
  assert.equal(packageJson.devDependencies['@nonsplayer/plugin-sdk'], '3.0.0')
  assert.ok(lock.includes("'@nonsplayer/plugin-sdk@3.0.0':"))
  assert.equal(lock.includes('@nonsplayer/plugin-sdk@file:'), false)
  assert.equal(lock.includes('patch_hash'), false)
})
