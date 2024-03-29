// import { WebSocket } from "ws"

import { next as A } from '@automerge/automerge'
import { Repo } from "@automerge/automerge-repo"
import { BrowserWebSocketClientAdapter } from "@automerge/automerge-repo-network-websocket"
import assert from "assert";

const characters = 'abcdefghijklmnopqrstuvwxyzABCDEFGHIJKLMNOPQRSTUVWXYZ';
const stringWith100Characters = (characters + characters).slice(0, 100);
// const sizeInBytes = new Blob([stringWith100Characters]).size;

// console.log(`${stringWith100Characters}`);
// console.log(`${sizeInBytes}`);

// 1 MB
const stringArray: string[] = new Array(50000).fill(stringWith100Characters);
const sizeInBytes = new Blob(stringArray).size;
const sizeInMB = sizeInBytes / 1_000_000;
console.log(`sizeInBytes: ${sizeInBytes}`);
console.log(`sizeInMB: ${sizeInMB}`);

console.log(new Date().toLocaleString());

const testJson = {
  stringArray: stringArray
};
const testDoc = A.from(testJson);

console.log(`called .from`);

console.log(new Date().toLocaleString());

console.log(`websocket test client starting`);

const PORT = 3030;

const repo1 = new Repo({
  network: [new BrowserWebSocketClientAdapter(`ws://localhost:${PORT}`)],
});

const repo2 = new Repo({
  network: [new BrowserWebSocketClientAdapter(`ws://localhost:${PORT}`)],
});

console.log(new Date().toLocaleString());

console.log(`creating doc`);

const handle1 = repo1.create(testDoc);

handle1.change((doc) => {
  // @ts-ignore
  // doc.test = stringArray;
  doc.test = 'test';
});

console.log(`created doc`);

console.log(new Date().toLocaleString());

// wait to give the server time to sync the document
// @ts-ignore
await new Promise((resolve) => setTimeout(resolve, 1000))

console.log(`waited for 1000ms`);

console.log(new Date().toLocaleString());

// withholds existing documents from new peers until they request them
assert.equal(Object.keys(repo2.handles).length, 0);

console.log(new Date().toLocaleString());

console.log(`calling repo2 find`);
const handle1found = repo2.find(handle1.url);
console.log(`called repo2 find`);

console.log(new Date().toLocaleString());

assert.equal(Object.keys(repo2.handles).length, 1);

console.log(`getting .doc`);
console.log(new Date().toLocaleString());

// @ts-ignore
const docFound = await handle1found.doc();
console.log(`got .doc`);
console.log(new Date().toLocaleString());

// console.log(docFound);

// @ts-ignore
// assert.equal(docFound.test, stringArray);
// const docFoundValue = docFound.test;
// console.log(`Doc found with value`);
// console.log(docFoundValue);

console.log(new Date().toLocaleString());

// @ts-ignore
const testString = docFound.test;
console.log(`Doc found with testString ${testString}`);

console.log(new Date().toLocaleString());

console.log(`Exiting!`);
process.exit();

// @ts-ignore
// const docFoundArrayValue: string[] = docFound.stringArray;
// console.log(`Doc found with string array value`);
// console.log(docFoundValue);

// assert.equal(docFoundArrayValue.length, stringArray.length);
// for (const currValue of docFoundArrayValue) {
  // assert.equal(currValue, stringWith100Characters);
// }
// console.log(`Asserted doc found string array value correct`);

let i = 1;

while (false) {
  const newHandle = repo1.create();
  newHandle.change((doc) => {
    // @ts-ignore
    doc.test = "hello world";
  });
  console.log(`created doc ${i}`);

  const r1HandleCount = Object.keys(repo1.handles).length;
  console.log(`repo1 handles: ${r1HandleCount}`);

  const handleFound = repo2.find(newHandle.url);

  const r2HandleCount = Object.keys(repo2.handles).length;
  console.log(`repo2 handles: ${r2HandleCount}`);

  i++;
}
