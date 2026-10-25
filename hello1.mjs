import { createHelia } from 'helia'
import { unixfs } from '@helia/unixfs'
import { readFile, writeFile } from 'node:fs/promises'

const helia = await createHelia()
const ufs = unixfs(helia)

const bytes = await readFile('2610.22271.pdf')
const cid = await ufs.addBytes(bytes)
console.log('CID:', cid.toString())

const chunks = []
for await (const chunk of ufs.cat(cid)) {
  chunks.push(chunk)
}
await writeFile('restored.pdf', Buffer.concat(chunks))
console.log('Saved restored.pdf')

await helia.stop()