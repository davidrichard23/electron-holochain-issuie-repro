import {
  AppWebsocket,
  AdminWebsocket,
  CellId,
  CellType,
} from "@holochain/client";
import { cellIdToString } from "./util";

export type CellIdString = string;
export type InstalledAppId = string;

const __APP_PORT__ = "8100";
const __ADMIN_PORT__ = "1100";

export class HolochainApi {
  APP_WS_URL = `ws://localhost:${__APP_PORT__}`;
  ADMIN_WS_URL = `ws://localhost:${__ADMIN_PORT__}`;

  appWs: AppWebsocket;
  appWsPromise: Promise<AppWebsocket>;
  adminWs: AdminWebsocket;
  agentPubKey: Uint8Array;

  constructor() {
    this.init();
  }

  async init() {
    await this.getAdminWs();
  }

  async getAdminWs(): Promise<AdminWebsocket> {
    if (this.adminWs) return this.adminWs;

    this.adminWs = await AdminWebsocket.connect(new URL(this.ADMIN_WS_URL));
    setInterval(() => {
      if (
        this.adminWs.client.socket.readyState ===
        this.adminWs.client.socket.OPEN
      ) {
        this.adminWs.listDnas();
      }
    }, 60000);
    this.adminWs.client.socket.addEventListener("close", () => {
      console.log("admin websocket closed");
    });
    return this.adminWs;
  }

  async getAppWs(): Promise<AppWebsocket> {
    const connect = async () => {
      // undefined is for default request timeout
      this.appWsPromise = AppWebsocket.connect(new URL(this.APP_WS_URL));
      this.appWs = await this.appWsPromise;
      this.appWsPromise = null;
      this.appWs.client.socket.addEventListener("close", async () => {
        console.log("app websocket closed, trying to re-open");
        await connect();
        console.log("app websocket reconnected");
      });
    };

    if (
      this.appWs &&
      this.appWs.client.socket.readyState === this.appWs.client.socket.OPEN
    ) {
      return this.appWs;
    }

    if (this.appWsPromise) {
      // connection must have been lost
      // wait for it to re-open
      return this.appWsPromise;
    }

    if (!this.appWs) {
      // this branch should only be called ONCE
      // on the very first call to this function
      await connect();
      // set up logic for auto-reconnection
      setInterval(async () => {
        if (
          this.appWs.client.socket.readyState === this.appWs.client.socket.OPEN
        ) {
          // random call just to keep the connection open
          this.appWs.appInfo({
            installed_app_id: "test",
          });
        } else if (
          this.appWs.client.socket.readyState ===
          this.appWs.client.socket.CLOSED
        ) {
          // try to reconnect
          await connect();
          console.log("app websocket reconnected");
        }
      }, 60000);
      return this.appWs;
    }

    return this.appWs;
  }

  async installApp(): Promise<[CellIdString, CellId, InstalledAppId]> {
    const installedAppId = `test-app`;
    const adminWs = await this.getAdminWs();
    const agentKey = this.getAgentPubKey();
    if (!agentKey) {
      throw new Error(
        "Cannot install a new project because no AgentPubKey is known locally"
      );
    }

    // TODO
    const happPath = "./happ/workdir/projects/projects.happ";
    const installedApp = await adminWs.installApp({
      agent_key: agentKey,
      installed_app_id: installedAppId,
      // what to do about the membrane_proof?
      membrane_proofs: {},
      path: happPath,
      // network_seed: seed,
    });
    const cellInfo = Object.values(installedApp.cell_info)[0][0];
    const cellId =
      CellType.Provisioned in cellInfo
        ? cellInfo[CellType.Provisioned].cell_id
        : null;
    const cellIdString = cellIdToString(cellId);
    await adminWs.enableApp({ installed_app_id: installedAppId });

    // authorize zome calls for the new cell
    await adminWs.authorizeSigningCredentials(cellId);
    return [cellIdString, cellId, installedAppId];
  }

  async callZome<InputType, OutputType>(
    cellId: CellId,
    zomeName: string,
    fnName: string,
    payload: InputType
  ): Promise<OutputType> {
    const appWebsocket = await this.getAppWs();
    const provenance = cellId[1];
    return appWebsocket.callZome({
      cell_id: cellId,
      zome_name: zomeName,
      fn_name: fnName,
      payload,
      cap_secret: null,
      provenance,
    });
  }

  getAgentPubKey(): Uint8Array {
    return this.agentPubKey;
  }

  setAgentPubKey(setAs: Uint8Array) {
    this.agentPubKey = setAs;
  }
}
