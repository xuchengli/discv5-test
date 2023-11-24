import fs from 'fs';
import ip from 'ip';
import os from 'os';
import { createFromJSON } from '@libp2p/peer-id-factory';
import { Discv5, ENR } from "@chainsafe/discv5";
import { multiaddr } from "@multiformats/multiaddr";
import debug from 'debug';
const log = debug('discv5:cli');
// log.enabled = true;

(async () => {
  const peerId = await createFromJSON(JSON.parse(fs.readFileSync('peer-id.json', "utf-8")));
  log('local peer id: %s', peerId.toString());

  const enr = fs.readFileSync('local-enr', "utf-8").trim();
  log('local enr: %s', enr);
  log('local enr multiaddr: %s', ENR.decodeTxt(enr).getLocationMultiaddr('udp'));

  const discv5 = Discv5.create({
    enr,
    peerId,
    bindAddrs: {
      ip4: multiaddr(`/ip4/${ip.address()}/udp/5000`),
    },
  });

  const bootstrapEnrs = fs.readFileSync('bootstrap-enrs', "utf-8").split(os.EOL).map(str => ENR.decodeTxt(str));
  bootstrapEnrs.forEach(enr => {
    log('adding bootstrap enr: %s', enr.encodeTxt());
    log('bootstrap enr multiaddr: %s', enr.getLocationMultiaddr('udp'));

    discv5.addEnr(enr);
  });
  await discv5.start();
  log("Service started on %s with local node id: %s", discv5.bindAddrs, discv5.enr.nodeId);

  while (discv5.isStarted()) {
    const nearest = await discv5.findRandomNode();
    log('found the nearest nodes: %s', nearest);

    log("%d total enrs in the table", discv5.kadValues().length);
    log("%d total connected peers", discv5.connectedPeerCount);
    await new Promise(resolve => setTimeout(resolve, 1000));
  }
})();