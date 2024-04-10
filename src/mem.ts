import file from './file.json' with { type: 'json' };
import assert from 'assert';
import process from "node:process";
import { next as A } from '@automerge/automerge'

function logMemoryUsage(): void {
  console.log('memory usage:');
  const memoryUsage = process.memoryUsage();
  for (const [key, value] of Object.entries(memoryUsage)) {
    console.log(`${key}: ${value/1000000}MB`);
  }
  console.log();
}

const mapProductToAutomerge = (value: any) => {
  if (value === null || typeof value === 'number' || typeof value === 'boolean') {
    return value;
  }
  if (typeof value === 'string') {
    return new A.RawString(value);
  }
  if (typeof value === 'object') {
    if (Array.isArray(value)) {
      return value.map(mapProductToAutomerge);
    }
    return Object.fromEntries(
      Object.entries(value).map(([key, value]) => [key, mapProductToAutomerge(value)])
    );
  }
}
const data = mapProductToAutomerge(file);
for (const [key, value] of Object.entries(data.workflows)) {
  // @ts-ignore
  assert(value.id instanceof A.RawString);
}

console.log(`${new Date().toLocaleString()}`);
logMemoryUsage();

for (let i = 0; i < 10; i++) {
  console.time(`create doc from data ${i}`);
  const doc = A.init();
  A.change(doc, 'create data', (doc: any) => {
    Object.assign(doc, data);
  })
  console.timeEnd(`create doc from data ${i}`);
  logMemoryUsage();
}

console.log(`${new Date().toLocaleString()}`);

console.log(`Exiting!`);
process.exit();
