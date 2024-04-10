import { next as A, from as LegacyFrom } from '@automerge/automerge'
import { Repo } from "@automerge/automerge-repo"
import { BrowserWebSocketClientAdapter } from "@automerge/automerge-repo-network-websocket"
import assert from "assert";
import file from './file.json' with { type: 'json' };


console.log(process.pid);
console.log(`${new Date().toLocaleString()} websocket test client starting`);

const PORT = 3030;

const repo1 = new Repo({
  network: [new BrowserWebSocketClientAdapter(`ws://localhost:${PORT}`)],
});

const repo2 = new Repo({
  network: [new BrowserWebSocketClientAdapter(`ws://localhost:${PORT}`)],
});

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

// This creates a document where all strings are instances of A.RawString
function createRawStringDoc() {
  console.time('create raw string local');
  const doc = A.init<Record<string, unknown>>();
  const newDoc = A.change(doc, (doc: any) => {
    Object.assign(doc, mapProductToAutomerge(file));
  })
  console.timeEnd('create raw string local');

  console.time('update doc');
  const handle1 = repo1.create();
  handle1.update(() => newDoc)
  console.timeEnd('update doc');
  return handle1;
}

// This creates a document where all strings are the new text CRDT
function createFrom() {
  console.time('create from');
  const handle1 = repo1.create(file);
  console.timeEnd('create from');
  return handle1;
}

// This creates a document where all strings instancesof of A.Text
function createLegacyFrom() {
  console.timeEnd('create legacy from');
  const doc = LegacyFrom(file as Record<string, unknown>);
  const handle1 = repo1.create();
  handle1.update(() => doc)
  console.timeEnd('create legacy from');
  return handle1;
}


const handle1 = createRawStringDoc();
// const handle1 = createFrom();

console.time('wait');
// wait to give the server time to sync the document
// @ts-ignore
await new Promise((resolve) => setTimeout(resolve, 1000))
console.timeEnd('wait');

// withholds existing documents from new peers until they request them
assert.equal(Object.keys(repo2.handles).length, 0);

console.time('sync: recv');
const handle1found = repo2.find(handle1.url);
assert.equal(Object.keys(repo2.handles).length, 1);
// @ts-ignore
await handle1found.doc(["ready"]);
console.timeEnd('sync: recv');

// @ts-ignore
process.exit();
