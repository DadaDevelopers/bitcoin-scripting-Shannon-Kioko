const bitcoin = require('bitcoinjs-lib');
const ops = require('bitcoin-ops');
const crypto = require('crypto');

// choose network: regtest uses testnet address format
const network = bitcoin.networks.regtest; // use testnet/regtest addresses

const alicePubHex = '02ff99b74b15a73c9af6b8dfde0f46600b7988cb3b6059464f562d7a3f643383a9';
const bobPubHex   = '028621540c923dd07907ba7cd966989f01e9affe84b631e8bc07092410a02dce21';

const alicePub = Buffer.from(alicePubHex, 'hex');
const bobPub   = Buffer.from(bobPubHex, 'hex');

//  preimage could be either fixed string or random
// const preimage = Buffer.from('super secret preimage', 'utf8');
const preimage = crypto.randomBytes(32); // recommended for real HTLCs
const preimageHex = preimage.toString('hex');

// sha256 hash (hex)
const preimageHash = crypto.createHash('sha256').update(preimage).digest();

const locktime = 1762611123; // unix timestamp

// build redeem script: OP_IF OP_SHA256 <hash> OP_EQUALVERIFY <AlicePub> OP_CHECKSIG
//                    OP_ELSE <locktime> OP_CHECKLOCKTIMEVERIFY OP_DROP <BobPub> OP_CHECKSIG OP_ENDIF
const b = bitcoin.script;
const redeemScript = b.compile([
  ops.OP_IF,
    ops.OP_SHA256, preimageHash, ops.OP_EQUALVERIFY,
    alicePub, ops.OP_CHECKSIG,
  ops.OP_ELSE,
    bitcoin.script.number.encode(locktime), ops.OP_CHECKLOCKTIMEVERIFY, ops.OP_DROP,
    bobPub, ops.OP_CHECKSIG,
  ops.OP_ENDIF
]);

// compute P2SH address for this redeemScript so to sendtoaddress with it
const p2sh = bitcoin.payments.p2sh({ redeem: { output: redeemScript, network }, network });

console.log('preimage (hex):', preimageHex);
console.log('sha256(preimage):', preimageHash.toString('hex'));
console.log('redeemScript (hex):', redeemScript.toString('hex'));
console.log('p2sh.address:', p2sh.address);
console.log('p2sh.output (scriptPubKey hex):', p2sh.output.toString('hex'));


