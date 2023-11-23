import fs from 'fs';
import { createSecp256k1PeerId } from '@libp2p/peer-id-factory';
import { toString } from 'uint8arrays/to-string';

(async () => {
  const peerId = await createSecp256k1PeerId();

  fs.writeFileSync('peer-id.json', JSON.stringify({
    id: toString(peerId.toBytes(), 'base58btc'),
    privKey: toString(peerId.privateKey, 'base64pad'),
    pubKey: toString(peerId.publicKey, 'base64pad'),
  }));
})();