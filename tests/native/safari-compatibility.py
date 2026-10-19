"""Bounded native Safari smoke via its built-in W3C driver; no Selenium dependency.
Run against an owned test-mode server: python3 tests/native/safari-compatibility.py
Never enable Safari permissions automatically or synthesize visibility events.
"""
import json
import pathlib
import subprocess
import time
import urllib.error
import urllib.request

ROOT = 'http://127.0.0.1:4444'
OUTPUT = pathlib.Path('build/performance/P5_SAFARI_RESULTS.json')
started = time.monotonic()
record = {'startedAt': time.strftime('%Y-%m-%dT%H:%M:%SZ', time.gmtime()),
          'boundSeconds': 90, 'mode': 'test', 'observations': []}
session = None

def request(method, path, payload=None):
    if method != 'DELETE' and time.monotonic() - started > 85:
        raise TimeoutError('Native Safari check exceeded its bounded work window')
    data = None if payload is None else json.dumps(payload).encode()
    req = urllib.request.Request(ROOT + path, data=data, method=method,
                                 headers={'Content-Type': 'application/json'})
    try:
        with urllib.request.urlopen(req, timeout=5) as response:
            value = json.load(response)['value']
    except urllib.error.HTTPError as error:
        raise RuntimeError(error.read().decode()) from error
    return value

def _driver_ready():
    try:
        request('GET', '/status')
        return True
    except urllib.error.URLError:
        return False

def execute(script):
    return request('POST', '/session/' + session + '/execute/sync', {'script': script, 'args': []})

def snapshot():
    return execute('return window.__ARENA_TEST__?.getSnapshot()')

def wait_for(predicate, message, seconds=8):
    deadline = time.monotonic() + seconds
    while time.monotonic() < deadline:
        if predicate():
            return
        time.sleep(.1)
    raise AssertionError(message)

def key(value):
    request('POST', '/session/' + session + '/actions', {'actions': [
        {'type': 'key', 'id': 'keyboard', 'actions': [
            {'type': 'keyDown', 'value': value}, {'type': 'pause', 'duration': 80},
            {'type': 'keyUp', 'value': value}]}]})

# Fail rather than attaching to or stopping an unknown driver.
try:
    urllib.request.urlopen(ROOT + '/status', timeout=1)
except urllib.error.URLError:
    pass
else:
    raise RuntimeError('Driver port 4444 is already in use; leave it untouched')

driver = subprocess.Popen(['/usr/bin/safaridriver', '-p', '4444'], stdout=subprocess.PIPE,
                          stderr=subprocess.STDOUT)
try:
    wait_for(lambda: driver.poll() is None and _driver_ready(), 'Safari driver unavailable', 5)
    created = request('POST', '/session', {'capabilities': {'alwaysMatch': {'browserName': 'safari'}}})
    session = created['sessionId']
    record['capabilities'] = created['capabilities']
    request('POST', '/session/' + session + '/timeouts', {'script': 5000, 'pageLoad': 15000})
    request('POST', '/session/' + session + '/window/rect', {'width': 1280, 'height': 800})
    request('POST', '/session/' + session + '/url', {
        'url': 'http://127.0.0.1:4173/?noContact=1&noXp=1&noHazards=1&runDurationMs=5000&atTimeUp=complete'})
    wait_for(lambda: (snapshot() or {}).get('run', {}).get('status') == 'playing', 'Game did not start')
    record['environment'] = execute('''const c=document.querySelector('canvas');
      const gl=c.getContext('webgl2')||c.getContext('webgl');
      const d=gl?.getExtension('WEBGL_debug_renderer_info');
      return {userAgent:navigator.userAgent, viewport:{width:innerWidth,height:innerHeight,dpr:devicePixelRatio},
      renderer:gl?'WebGL':'Canvas',gpu:d?gl.getParameter(d.UNMASKED_RENDERER_WEBGL):null,
      canvasCount:document.querySelectorAll('canvas').length};''')
    assert record['environment']['canvasCount'] == 1
    assert record['environment']['renderer'] == 'WebGL'
    before = snapshot()
    assert before['pacing']['gameplayRate'] == .5
    request('POST', '/session/' + session + '/actions', {'actions': [{'type': 'key', 'id': 'keyboard',
      'actions': [{'type': 'keyDown', 'value': 'd'}, {'type': 'pause', 'duration': 250}, {'type': 'keyUp', 'value': 'd'}]}]})
    assert snapshot()['player']['x'] > before['player']['x']
    key('\ue00c')  # W3C Escape; actual driver input, no DOM dispatch.
    wait_for(lambda: snapshot()['run']['status'] == 'paused', 'Escape did not pause')
    paused = snapshot()
    time.sleep(.3)
    assert snapshot()['run']['elapsedMs'] == paused['run']['elapsedMs']
    request('POST', '/session/' + session + '/window/rect', {'width': 1000, 'height': 750})
    wait_for(lambda: snapshot()['view']['displayWidth'] <= 1000, 'Canvas did not resize')
    for _ in range(4):
        key('\ue004')  # Tab
    wait_for(lambda: snapshot()['ui']['pauseTab'] == 'settings', 'Settings tab unavailable')
    point = execute('''const b=document.querySelector('canvas').getBoundingClientRect();
      return {x:Math.round(b.left+1230*b.width/1600),y:Math.round(b.top+507.5*b.height/900)};''')
    request('POST', '/session/' + session + '/actions', {'actions': [{'type': 'pointer', 'id': 'mouse',
      'parameters': {'pointerType': 'mouse'}, 'actions': [
        {'type': 'pointerMove', 'origin': 'viewport', 'x': point['x'], 'y': point['y']},
        {'type': 'pointerDown', 'button': 0}, {'type': 'pointerUp', 'button': 0}]}]})
    wait_for(lambda: snapshot()['ui']['settings']['presentationQuality'] == 'low', 'Low not selected')
    assert snapshot()['run']['elapsedMs'] == paused['run']['elapsedMs']
    record['observations'].append({'paused': paused, 'resizedLow': snapshot()})
    key('\ue00c')
    wait_for(lambda: snapshot()['run']['status'] == 'complete', 'Short run did not complete', 20)
    complete = snapshot()
    key('r')
    wait_for(lambda: snapshot()['lifecycle']['runGeneration'] == complete['lifecycle']['runGeneration'] + 1,
             'Terminal restart did not reconstruct')
    restarted = snapshot()
    assert restarted['run']['level'] == 1 and restarted['run']['xp'] == 0
    assert restarted['player']['health'] == restarted['player']['maxHealth']
    assert restarted['ui']['settings']['presentationQuality'] == 'low'
    record['observations'].append({'complete': complete, 'restart': restarted})
    record['result'] = 'passed'
except Exception as error:
    record['result'] = 'blocked' if session is None else 'failed'
    record['error'] = str(error)
    raise
finally:
    if session:
        try:
            request('DELETE', '/session/' + session)
        except Exception as error:
            record['cleanupError'] = str(error)
    driver.terminate()
    try:
        record['driverOutput'] = driver.communicate(timeout=3)[0].decode()
    except subprocess.TimeoutExpired:
        driver.kill()
        record['driverOutput'] = driver.communicate()[0].decode()
    record['elapsedMs'] = round((time.monotonic() - started) * 1000)
    OUTPUT.parent.mkdir(parents=True, exist_ok=True)
    OUTPUT.write_text(json.dumps(record, indent=2) + '\n')
