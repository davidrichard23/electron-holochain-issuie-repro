import { app } from "electron";
import initAgent, {
  ERROR_EVENT,
  ElectronHolochainOptions,
  STATUS_EVENT,
  StateSignal,
} from "@lightningrodlabs/electron-holochain";
import {
  BINARY_PATHS,
  DATASTORE_PATH,
  HAPP_PATH,
  KEYSTORE_PATH,
  MAIN_APP_ID,
} from "./consts";
import { HolochainApi } from "./holochainApi";

const devOptions: ElectronHolochainOptions = {
  happPath: HAPP_PATH, // preload
  datastorePath: DATASTORE_PATH,
  appId: MAIN_APP_ID,
  appWsPort: 8100,
  adminWsPort: 1100,
  keystorePath: KEYSTORE_PATH,
  passphrase: "test-passphrase",
  bootstrapUrl: "https://bootstrap.holo.host",
};

async function init() {
  const { statusEmitter, shutdown } = await initAgent(
    app,
    devOptions,
    BINARY_PATHS
  );

  statusEmitter.on(STATUS_EVENT, (state) => {
    switch (state) {
      case StateSignal.IsReady:
        createEntry();
        break;
      default:
        console.log(state);
    }
  });
  statusEmitter.on(ERROR_EVENT, (state) => {
    console.error("Holochain error");
    console.error(state);
  });
}

async function createEntry() {
  const holochainApi = new HolochainApi();
  // wait for setup
  await new Promise((resolve) => setTimeout(resolve, 2000));

  const cellId = (await holochainApi.adminWs.listCellIds())[0];
  holochainApi.setAgentPubKey(cellId[1]);
  await holochainApi.adminWs.authorizeSigningCredentials(cellId);

  const res = await holochainApi.callZome(
    cellId,
    "content",
    "create_encrypted_content",
    {
      id: "test-id",
      content_type: "test-content-type",
    }
  );
  console.log(res);
}

init();
