import fs from 'fs';
import ip from 'ip';
import { createSecp256k1PeerId } from '@libp2p/peer-id-factory';
import { SignableENR } from "@chainsafe/discv5";
import { toString } from 'uint8arrays/to-string';
import { multiaddr } from "@multiformats/multiaddr";

(async () => {
  const peerId = await createSecp256k1PeerId();

  fs.writeFileSync('peer-id.json', JSON.stringify({
    id: toString(peerId.toBytes(), 'base58btc'),
    privKey: toString(peerId.privateKey, 'base64pad'),
    pubKey: toString(peerId.publicKey, 'base64pad'),
  }, null, 2));

  const enr = SignableENR.createFromPeerId(peerId);
  enr.setLocationMultiaddr(multiaddr(`/ip4/${ip.address()}/udp/5000`));
  fs.writeFileSync('local-enr', enr.encodeTxt());
})();