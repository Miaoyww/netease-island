import assert from 'node:assert/strict'
import { readFileSync } from 'node:fs'
import { runInNewContext } from 'node:vm'
import { test } from 'node:test'
import * as React from 'react'
import * as jsx from 'react/jsx-runtime'
import { createRoot } from 'react-dom/client'
import { JSDOM } from 'jsdom'
import ts from 'typescript'

test('preview receives events, pauses for focus, deduplicates playback and cleans subscriptions', async () => {
  const dom = new JSDOM('<div id="root"></div>', {
    url: 'http://localhost/',
    pretendToBeVisual: true
  })
  const previous = Object.fromEntries(
    ['window', 'document', 'navigator', 'IS_REACT_ACT_ENVIRONMENT'].map((key) => [
      key,
      Object.getOwnPropertyDescriptor(globalThis, key)
    ])
  )
  for (const [key, value] of Object.entries({
    window: dom.window,
    document: dom.window.document,
    navigator: dom.window.navigator,
    IS_REACT_ACT_ENVIRONMENT: true
  })) {
    Object.defineProperty(globalThis, key, { value, configurable: true, writable: true })
  }
  const timers = new Set()
  const setTimer = window.setTimeout.bind(window)
  const clearTimer = window.clearTimeout.bind(window)
  window.setTimeout = (...args) => {
    const timer = setTimer(...args)
    timers.add(timer)
    return timer
  }
  window.clearTimeout = (timer) => {
    timers.delete(timer)
    clearTimer(timer)
  }
  const listeners = new Set()
  let song,
    finish,
    configSubscriptions = 0
  const calls = []
  const config = {
    subscribe: async () => {
      configSubscriptions++
      return () => {
        configSubscriptions--
      }
    },
    getSnapshot: async () => ({ values: { previewDuration: 8, pauseOnHover: true } })
  }
  const playback = (reference, mode) => {
    calls.push({ reference, mode })
    return new Promise((resolve) => {
      finish = resolve
    })
  }
  const sdk = {
    reportCaughtError: (operation, error) => {
      throw new Error(operation, { cause: error })
    },
    Button: ({ children, variant: _variant, size: _size, ...props }) =>
      React.createElement('button', props, children),
    SongArtists: ({ song }) => React.createElement('span', null, song.artist),
    SongLikeButton: () => React.createElement('button', { 'aria-label': '收藏歌曲' }, '收藏'),
    useSongPlayback: () => playback,
    useCoverSource: () => undefined,
    usePluginConfig: () => config,
    usePluginEvent: () =>
      React.useSyncExternalStore(
        (listener) => {
          listeners.add(listener)
          return () => listeners.delete(listener)
        },
        () => song
      )
  }
  const { outputText } = ts.transpileModule(
    readFileSync(new URL('../frontend/DynamicIsland.tsx', import.meta.url), 'utf8'),
    {
      compilerOptions: { module: ts.ModuleKind.CommonJS, jsx: ts.JsxEmit.ReactJSX }
    }
  )
  const exports = {}
  runInNewContext(outputText, {
    exports,
    window,
    performance,
    require: (name) => {
      if (name === 'react') return React
      if (name === 'react/jsx-runtime') return jsx
      assert.equal(name, '@nonsplayer/plugin-sdk')
      return sdk
    }
  })
  const root = createRoot(document.getElementById('root'))
  let unmounted = false
  try {
    await React.act(async () => {
      root.render(React.createElement(exports.DynamicIsland))
    })
    assert.equal(listeners.size, 1)
    assert.equal(configSubscriptions, 1)
    assert.equal(document.querySelector('.nons-island'), null)
    await React.act(async () => {
      song = {
        reference: { source: 'netease', kind: 'track', id: '1' },
        title: '歌曲一',
        artist: '歌手甲',
        artists: [],
        album: '专辑'
      }
      listeners.forEach((notify) => notify())
    })
    assert.match(document.body.textContent, /歌曲一/)
    assert.equal(timers.size, 1)
    await React.act(async () => {
      document.querySelector('[aria-label="关闭歌曲预览"]').focus()
    })
    assert.equal(timers.size, 0, 'focus pauses dismissal')
    const next = [...document.querySelectorAll('button')].find(
      (button) => button.textContent === '下一首播放'
    )
    await React.act(async () => {
      next.click()
      next.click()
    })
    assert.equal(calls.length, 1)
    assert.equal(calls[0].mode, 'next')
    assert.equal(calls[0].reference.id, '1')
    await React.act(async () => {
      finish()
    })
    assert.match(document.body.textContent, /已加入下一首播放/)
    await React.act(async () => {
      ;[...document.querySelectorAll('button')]
        .find((button) => button.textContent === '立即播放')
        .click()
    })
    assert.equal(calls[1].mode, 'now')
    await React.act(async () => {
      finish()
    })
    assert.match(document.body.textContent, /已开始播放/)
    await React.act(async () => {
      document.querySelector('[aria-label="关闭歌曲预览"]').click()
    })
    assert.equal(document.querySelector('.nons-island'), null)
    await React.act(async () => {
      song = { ...song }
      listeners.forEach((notify) => notify())
    })
    assert.equal(document.querySelector('.nons-island'), null, 'recent duplicate stays dismissed')
    await React.act(async () => {
      song = { ...song, reference: { ...song.reference, id: '2' } }
      listeners.forEach((notify) => notify())
    })
    assert.ok(document.querySelector('.nons-island'))
    await React.act(async () => {
      root.unmount()
    })
    unmounted = true
    assert.equal(listeners.size, 0)
    assert.equal(configSubscriptions, 0)
    assert.equal(timers.size, 0)
  } finally {
    if (!unmounted)
      await React.act(async () => {
        root.unmount()
      })
    dom.window.close()
    for (const [key, descriptor] of Object.entries(previous)) {
      if (descriptor) Object.defineProperty(globalThis, key, descriptor)
      else delete globalThis[key]
    }
  }
})
