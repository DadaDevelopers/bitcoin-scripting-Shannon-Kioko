# Bitcoin Scripting

## Assignment A

Given this script:

`OP_DUP OP_HASH160 OP_EQUALVERIFY OP_CHECKSIG`

Tasks:

Break down each opcode's purpose

Create a diagram showing data flow

Identify what happens if signature verification fails

Explain the security benefits of hash verification

Assignment B

Implement a Hashed Time-Lock Contract for atomic swap between Alice and Bob:

Alice can claim with secret preimage within 21 minutes

Bob gets refund after 21 minutes


#### 1. Break down each opcode's purpose
```
1. OP_DUP

Duplicates the top item on the stack.
This is frequently used in Bitcoin scripts to create copies of data, especially for validation purposes like signature checking.

Basically copies the top item of the stack and pushes that copy ono the stack, making it a new item.
If stack is empty, the script will fail.

Example: If the stack contains one item A, after OP_DUP, the stack will contain A, A.

2. OP_HASH160

Replaces the top stack item with the RIPEMD160 hash of its SHA256 hash. If the stack is empty the script fails.
So basically hashes the top stack item using SHA256 and then RIPEMD160.

Example: This is used to hash a public key to a public key hash (the standard Bitcoin address format).

3. OP_EQUALVERIFY

Verifies that the top two items on the stack are equal.
This combines the functionality of OP_EQUAL and OP_VERIFY.
It compares the top two items on the stack and removes them.

If they are equal, the script continues execution. If they are not equal, the script fails immediately.
This opcode is commonly used in scripts to ensure that two values match without leaving a true or false result on the stack.

In P2PKH scripts, OP_EQUALVERIFY is used to ensure the provided public key hash matches the expected hash:


OP_DUP OP_HASH160 <PubKeyHash> OP_EQUALVERIFY OP_CHECKSIG

Here, OP_EQUALVERIFY confirms that the hash of the provided public key matches the expected PubKeyHash. If they match, the script continues to OP_CHECKSIG; otherwise, it fails.

4. OP_CHECKSIG

Verifies that a given digital signature is valid for a specific public key and a specific transaction context.
Hence it is a cornerstone of Bitcoin’s transaction validation and ensures that only the rightful owner of funds can authorize their spending.

i. Takes the top two items from the stack:
    - Signature (top)
    - Public key (second-to-top)
ii. Computes the sighash (a hash of the transaction, influenced by the SIGHASH flag).
iii. Uses the public key to verify that the signature is valid for the sighash.
iv. Pushes 1 (true) onto the stack if valid, or 0 (false) if invalid.


```
#### 2. Create a diagram showing data flow
in `Scripting-Bitcoin.png`

#### 3. Identify what happens if signature verification fails
```

When OP_CHECKSIG is used in a Bitcoin script, its main purpose is to verify the authenticity of the transaction by checking that the provided signature matches the public key and ensuring that the person spending the Bitcoin is indeed the owner of the corresponding private key.

If the signature verification fails, here’s what happens:


Transaction Rejected: If OP_CHECKSIG fails, the entire script fails to evaluate to true, meaning the transaction will be invalid and rejected by the network.
This prevents the transaction from being included in the blockchain.

Failure of Validation: The script execution halts, and no further processing occurs.
The failure to validate the signature essentially means that the spender could not prove they have the authority to spend the Bitcoin.

The failure of OP_CHECKSIG can happen in several scenarios as below :

The provided public key does not correspond to the correct private key that signed the transaction.

The signature provided is not valid, either because it was corrupted or because it was generated incorrectly.

The transaction inputs, outputs, or other conditions might have been altered in a way that invalidates the signature.
```

#### 4. Explain the security benefits of hash verification

```
Hash verification like the OP_HASH160 is used to verify data without revealing the actual information of the users or the transactions. In publik key hashes, it ensures the spender is authorized to spend the funds without directly exposing their full public key until necessary.

- The hashed public key is what is exposed in the script so no exposure of the public key.
- Better privacy as an extra layer of security is added as no user details are exposed and the hash helps ensure only the corresponding public key is used in the txn.
- Is a way to show proof of ownership.
- Lower data requirements as not the public key is used but its hash and data used in txn is reduced.
- More secure transaction validation as when attacker changes the pub key, they wouldn't be able to change hash without changing signature of txn, which makes it invalid.
- Prevents changing of txn as it can't be done without invalidating the transaction
```
Assignment B
Implement a Hashed Time-Lock Contract for atomic swap between Alice and Bob:

Alice can claim with secret preimage within 21 minutes

Bob gets refund after 21 minutes

Tasks:

Complete the HTLC script

Create claiming transaction script

Create refund transaction script

Test with sample hash and timeout

#### 1. Complete the HTLC script
```
OP_IF
   OP_HASH160 <Alice's PubKey Hash> OP_EQUALVERIFY
   OP_CHECKSIG
OP_ELSE
   <Locktime in UNIX Timestamp> OP_CHECKLOCKTIMEVERIFY
   OP_CHECKSIG
OP_ENDIF
```

#### 2. Create claiming transaction script
`<preimage> OP_HASH160 <Alice's PubKey Hash> OP_EQUALVERIFY OP_CHECKSIG`

#### 3. Create refund transaction script
`<Bob's PubKey> OP_CHECKSIG`

#### 4. Test with sample hash and timeout

```
 bitcoind
Bitcoin Core starting
shannonkioko@DESKTOP-KQ1UE0U:~$ bitcoin-cli -regtest -rpcwallet=alice loadwallet alice
{
  "name": "alice"
}
shannonkioko@DESKTOP-KQ1UE0U:~$ bitcoin-cli -regtest -rpcwallet=bob loadwallet bob
{
  "name": "bob"
}
shannonkioko@DESKTOP-KQ1UE0U:~$ bitcoin-cli -regtest -rpcwallet=alice getbalance
3750.00000000
shannonkioko@DESKTOP-KQ1UE0U:~$ bitcoin-cli -regtest -rpcwallet=bob getbalance
0.00000000
shannonkioko@DESKTOP-KQ1UE0U:~$ date +%s
1762609863
shannonkioko@DESKTOP-KQ1UE0U:~$ LOCKTIME=$((1762609863 + 1260))
shannonkioko@DESKTOP-KQ1UE0U:~$ echo $LOCKTIME
1762611123
shannonkioko@DESKTOP-KQ1UE0U:~$ bitcoin-cli -regtest -rpcwallet=alice sendtoaddress 2N8MBp1AkH3RXD59SaAP4CWMnyGHYKZ2mAd 1.0
31293492fe97190099ea930a62bf7aeffe7ea5628945e8845b953d3b8c491ce6
shannonkioko@DESKTOP-KQ1UE0U:~$ bitcoin-cli -regtest -rpcwallet=bob getbalance
0.00000000
shannonkioko@DESKTOP-KQ1UE0U:~$ bitcoin-cli -regtest -rpcwallet=alice getbalance
3748.99998570
shannonkioko@DESKTOP-KQ1UE0U:~$ bitcoin-cli -regtest -rpcwallet=alice gettransaction 31293492fe97190099ea930a62bf7aeffe7ea5628945e8845b953d3b8c491ce6
{
  "amount": -1.00000000,
  "fee": -0.00001430,
  "confirmations": 0,
  "trusted": true,
  "txid": "31293492fe97190099ea930a62bf7aeffe7ea5628945e8845b953d3b8c491ce6",
  "wtxid": "da6478d72538fca8d602bf670a5a1726c501be2f7238ab796dae67ec8a4b7817",
  "walletconflicts": [
  ],
  "mempoolconflicts": [
  ],
  "time": 1762609946,
  "timereceived": 1762609946,
  "bip125-replaceable": "yes",
  "details": [
    {
      "address": "2N8MBp1AkH3RXD59SaAP4CWMnyGHYKZ2mAd",
      "category": "send",
      "amount": -1.00000000,
      "vout": 1,
      "fee": -0.00001430,
      "abandoned": false
    }
  ],
  "hex": "02000000000101ba3b3454261d5c302362c04bbdc246542b050a3821efc5c4072e068cafa0851e0000000000fdffffff026a120d8f0000000017a9141799db7a984253de8f99e15daf6170bb82ac7b0a8700e1f5050000000017a914a5aa90a76794c5df88675a0d72abc3650e85578c8702473044022006efaa80e1d2141c57fea082034696f7fef811577b8e650a8750e5531d35f0f602205b81c13d6598710f6d00922feafff3a5c5a3a7aa10fb2867af5c2d960557c0da012102ff99b74b15a73c9af6b8dfde0f46600b7988cb3b6059464f562d7a3f643383a92f010000",
  "lastprocessedblock": {
    "hash": "3b964fad27f6a81a51398019ebde89462f71e09afe8c8887da0f6dffffc2ffa6",
    "height": 303
  }
}
```

