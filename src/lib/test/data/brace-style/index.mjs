var x

if (process.argv[0] === true) x = true
else x = false

try {
  if (x === true) {
    process.stdout.write('x')
  } else {
    process.stdout.write('not x')
  }
} catch (e) {
  process.stdout.write('how')
}