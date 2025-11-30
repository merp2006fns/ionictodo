import PocketBase from "pocketbase";

export const POCKETBASE_URL = "https://diastatic-bubblingly-martha.ngrok-free.dev";

export const pb = new PocketBase(POCKETBASE_URL);

pb.autoCancellation(false);
