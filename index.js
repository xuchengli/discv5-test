import { createSecp256k1PeerId } from '@libp2p/peer-id-factory';
import { Discv5, SignableENR } from "@chainsafe/discv5";
import { multiaddr } from "@multiformats/multiaddr";
import debug from 'debug';
const log = debug('discv5');
log.enabled = true;

(async () => {
  const peerId = await createSecp256k1PeerId();
  log('peer id: %s', peerId.toString());

  const enr = SignableENR.createFromPeerId(peerId);
  log('enr: %s', enr.encodeTxt());

  const bindAddrs = {
    ip4: multiaddr('/ip4/192.168.1.174/udp/5000'),
  };

  const discv5 = Discv5.create({ enr, peerId, bindAddrs });
  await discv5.start();
  log("Service started on %s with local node id: %s", discv5.bindAddrs, discv5.enr.nodeId);
})();