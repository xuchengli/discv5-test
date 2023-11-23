import fs from 'fs';
import { createFromJSON } from '@libp2p/peer-id-factory';
import { Discv5, ENR, SignableENR } from "@chainsafe/discv5";
import { multiaddr } from "@multiformats/multiaddr";
import debug from 'debug';
const log = debug('discv5:cli');
// log.enabled = true;

const bootNodes = [
  'enr:-IS4QLkKqDMy_ExrpOEWa59NiClemOnor-krjp4qoeZwIw2QduPC-q7Kz4u1IOWf3DDbdxqQIgC4fejavBOuUPy-HE4BgmlkgnY0gmlwhCLzAHqJc2VjcDI1NmsxoQLQSJfEAHZApkm5edTCZ_4qps_1k_ub2CxHFxi-gr2JMIN1ZHCCIyg',
  'enr:-IS4QDAyibHCzYZmIYZCjXwU9BqpotWmv2BsFlIq1V31BwDDMJPFEbox1ijT5c2Ou3kvieOKejxuaCqIcjxBjJ_3j_cBgmlkgnY0gmlwhAMaHiCJc2VjcDI1NmsxoQJIdpj_foZ02MXz4It8xKD7yUHTBx7lVFn3oeRP21KRV4N1ZHCCIyg',
];

(async () => {
  const peerId = await createFromJSON(JSON.parse(fs.readFileSync('peer-id.json', "utf-8")));
  log('peer id: %s', peerId.toString());

  const enr = SignableENR.createFromPeerId(peerId);
  log('enr: %s', enr.encodeTxt());

  const bindAddrs = {
    ip4: multiaddr('/ip4/192.168.1.174/udp/5000'),
  };

  const discv5 = Discv5.create({ enr, peerId, bindAddrs });
  bootNodes.forEach(node => {
    log("Adding bootstrap enr: %s", node);
    discv5.addEnr(ENR.decodeTxt(node));
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