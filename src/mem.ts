import file from './file.json' with { type: 'json' };
import process from "node:process";
import { next as A } from '@automerge/automerge'

function logMemoryUsage(): void {
  console.log('memory usage:');
  const memoryUsage = process.memoryUsage();
  for (const [key, value] of Object.entries(memoryUsage)) {
    console.log(`${key}: ${value/1_000_000}MB`);
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

let doc = A.init();
A.change(doc, 'create data', (doc: any) => {
  Object.assign(doc, mapProductToAutomerge(file));
})

doc = null

setInterval(() => {
  logMemoryUsage();
}, 1000);
