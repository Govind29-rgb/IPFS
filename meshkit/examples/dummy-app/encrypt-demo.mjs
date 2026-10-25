import { init, isEncryptedPayload } from '@ipfs-meshkit/meshkit'

const PASSWORD = 'my-secret-password'
const SECRET = 'This is a secret message for my friend.'

// Connect to the Kubo node that is already running (IPFS Desktop).
const { meshkit } = await init({ localNode: true })
console.log('Connected to:', meshkit.activeNodes[0])

// 1. Upload with a password. Meshkit encrypts the bytes BEFORE sending them to Kubo.
const cid = await meshkit.upload(new TextEncoder().encode(SECRET), {
  encrypt: { password: PASSWORD },
})
await meshkit.pin(cid)
console.log('\nEncrypted CID:', cid)
console.log('Open this in your browser to see the scrambled data:')
console.log('http://127.0.0.1:8080/ipfs/' + cid)

// 2. Retrieve WITHOUT a password: you only get the scrambled bytes.
const raw = await meshkit.retrieve(cid)
console.log('\n--- Without the password ---')
console.log('Looks like a Meshkit encrypted blob?', isEncryptedPayload(raw))
console.log('First 40 bytes (hex):', Buffer.from(raw.slice(0, 40)).toString('hex'))
console.log('As text:', JSON.stringify(new TextDecoder().decode(raw).slice(0, 60)))

// 3. Retrieve WITH the right password: you get the original message back.
const ok = await meshkit.retrieve(cid, { password: PASSWORD })
console.log('\n--- With the right password ---')
console.log('Decrypted:', new TextDecoder().decode(ok))

// 4. Retrieve with a WRONG password: it must fail.
console.log('\n--- With a wrong password ---')
try {
  await meshkit.retrieve(cid, { password: 'wrong-password' })
  console.log('Unexpected: wrong password was accepted')
} catch (err) {
  console.log('Rejected, as expected:', err.message)
}
