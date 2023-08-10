// credit: https://github.com/lightningrodlabs/acorn
// https://github.com/lightningrodlabs/acorn/blob/ebf2b2a051144ecd8161d5d6e55882a05149421b/web/src/utils.ts

import { HoloHash, CellId } from '@holochain/client';
import { Buffer } from 'buffer/';

export function hashToString(hash: HoloHash) {
  // nodejs
  if (typeof window === 'undefined') {
    // @ts-ignore
    return hash.toString('hex');
  }
  // browser
  return hash.toString();
}

export function hashFromString(str: string): HoloHash {
  // nodejs
  if (typeof window === 'undefined') {
    return Buffer.from(str, 'hex');
  }
  // browser
  return Buffer.from(str.split(','));
}

const CELL_ID_DIVIDER = '[:cell_id_divider:]';
export function cellIdToString(cellId: CellId) {
  // [DnaHash, AgentPubKey]
  return hashToString(cellId[0]) + CELL_ID_DIVIDER + hashToString(cellId[1]);
}

export function cellIdFromString(str: string): CellId {
  // [DnaHash, AgentPubKey]
  const [dnahashstring, agentpubkeyhashstring] = str.split(CELL_ID_DIVIDER);
  return [hashFromString(dnahashstring), hashFromString(agentpubkeyhashstring)];
}
