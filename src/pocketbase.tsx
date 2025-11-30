import PocketBase from "pocketbase";

export const POCKETBASE_URL = "http://192.168.100.25:8090";

export const pb = new PocketBase(POCKETBASE_URL);

pb.autoCancellation(false);
