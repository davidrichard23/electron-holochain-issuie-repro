/* eslint-disable indent */
import { app } from "electron";
import * as path from "path";
import { PathOptions } from "@lightningrodlabs/electron-holochain";

export const MAIN_APP_ID = "main-app";

export const BINARY_PATHS: PathOptions | undefined = app.isPackaged
  ? {
      holochainRunnerBinaryPath: path.join(
        __dirname,
        `../../app.asar.unpacked/binaries/holochain-runner${
          process.platform === "win32" ? ".exe" : ""
        }`
      ),
    }
  : {
      holochainRunnerBinaryPath: path.join(
        __dirname,
        `../node_modules/@lightningrodlabs/electron-holochain/binaries/holochain-runner${
          process.platform === "win32" ? ".exe" : ""
        }`
      ),
    };

export const HAPP_PATH = app.isPackaged
  ? path.join(
      app.getAppPath(),
      "../app.asar.unpacked/bin/humm-earth-core-happ.happ"
    )
  : path.join(app.getAppPath(), "./bin/humm-earth-core-happ.happ");

export const DATASTORE_PATH = path.join(
  app.getPath("home"),
  "holochain-datastore"
);

export const KEYSTORE_PATH = path.join(
  app.getPath("home"),
  "holochain-keystore"
);
