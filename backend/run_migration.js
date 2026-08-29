const { spawn } = require('child_process');
const child = spawn('npx', ['prisma', 'migrate', 'dev', '--name', 'add_coding_practice'], {
  stdio: ['pipe', 'pipe', 'pipe'],
  shell: true,
  cwd: 'd:\\SAHIL\\LEXIQO\\backend'
});

child.stdout.on('data', (data) => {
  const output = data.toString();
  console.log(output);
  if (output.includes('All data will be lost') || output.includes('Do you want to continue')) {
    child.stdin.write('y\n');
  }
});

child.stderr.on('data', (data) => {
  console.error(data.toString());
});

child.on('close', (code) => {
  console.log(`Command exited with code ${code}`);
  process.exit(code);
});
