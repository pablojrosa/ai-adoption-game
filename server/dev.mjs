import { spawn } from 'node:child_process'

const processes = [
  spawn('npm', ['run', 'dev:server'], {
    stdio: 'inherit',
    shell: true,
  }),
  spawn('npm', ['run', 'dev:client'], {
    stdio: 'inherit',
    shell: true,
  }),
]

let isShuttingDown = false

function shutdown(exitCode = 0) {
  if (isShuttingDown) {
    return
  }

  isShuttingDown = true

  for (const childProcess of processes) {
    childProcess.kill('SIGTERM')
  }

  process.exit(exitCode)
}

for (const childProcess of processes) {
  childProcess.on('exit', (code) => {
    if (isShuttingDown) {
      return
    }

    shutdown(code ?? 0)
  })
}

process.on('SIGINT', () => shutdown(0))
process.on('SIGTERM', () => shutdown(0))
