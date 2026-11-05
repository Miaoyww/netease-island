import assert from 'node:assert/strict'
import { readFileSync } from 'node:fs'
import { test } from 'node:test'

const manifest = JSON.parse(readFileSync(new URL('../manifest.json', import.meta.url), 'utf8'))
const packageJson = JSON.parse(readFileSync(new URL('../package.json', import.meta.url), 'utf8'))
const sdkPackage = JSON.parse(
  readFileSync(new URL('../../../Nons/packages/plugin-sdk/package.json', import.meta.url), 'utf8')
)
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
  assert.equal(
    packageJson.devDependencies['@nonsplayer/plugin-sdk'],
    'file:../../Nons/packages/plugin-sdk'
  )
  assert.match(
    lock,
    /resolution: \{\s*directory: \.\.\/\.\.\/Nons\/packages\/plugin-sdk, type: directory\s*\}/
  )
  assert.equal(lock.includes('patch_hash'), false)
})
