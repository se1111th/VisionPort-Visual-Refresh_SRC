import { queryClient } from "./queryClient";
import type { Asset, Playlist, Scene } from "@shared/schema";

type Store = {
  playlists: Playlist[];
  scenes: Scene[];
  assets: Asset[];
};

const STORE_KEY = "visionport-poc-store-v1";

function generateId() {
  if (typeof crypto !== "undefined" && "randomUUID" in crypto) {
    return crypto.randomUUID();
  }

  return `${Date.now()}-${Math.random().toString(16).slice(2)}`;
}

function toDate(value: unknown) {
  if (value instanceof Date) {
    return value;
  }

  if (typeof value === "string" || typeof value === "number") {
    const parsed = new Date(value);
    if (!Number.isNaN(parsed.getTime())) {
      return parsed;
    }
  }

  return new Date();
}

function buildDefaultStore(): Store {
  const now = new Date();
  const playlistNames = [
    "VisionPort for Comm Real Estate",
    "JLL Presentations",
    "CBRE Portfolio",
    "Cushman & Wakefield",
    "Colliers International",
  ];

  const playlists: Playlist[] = playlistNames.map((name) => ({
    id: generateId(),
    name,
    type: "playlist",
    createdAt: now,
  }));

  const sceneNames = [
    "Welcome",
    "LA Availability",
    "Market Overview",
    "Property Tour",
    "Amenities",
  ];

  const firstPlaylistId = playlists[0]?.id ?? generateId();
  const scenes: Scene[] = sceneNames.map((name, index) => ({
    id: generateId(),
    playlistId: firstPlaylistId,
    name,
    description: `${name} scene description`,
    sceneType: "Google Earth",
    duration: index === 0 ? null : 15,
    sortOrder: index,
    thumbnailUrl: null,
    createdBy: "galadmin",
    createdAt: now,
    updatedAt: now,
  }));

  const firstSceneId = scenes[0]?.id ?? generateId();
  const assets: Asset[] = [
    "g_panorama.jpg",
    "logo_white.png",
    "icon_pack.svg",
    "market_chart_q1.png",
    "tenant_logos_strip.png",
  ].map((name) => ({
    id: generateId(),
    sceneId: firstSceneId,
    name,
    assetType: "graphic",
    fileUrl: null,
    posX: 0,
    posY: 0,
    width: 7560,
    height: 1920,
    hasTransparency: name.endsWith(".png"),
    createdAt: now,
  }));

  return { playlists, scenes, assets };
}

function reviveStoreDates(store: Store): Store {
  return {
    playlists: store.playlists.map((playlist) => ({
      ...playlist,
      createdAt: toDate(playlist.createdAt),
    })),
    scenes: store.scenes.map((scene) => ({
      ...scene,
      createdAt: toDate(scene.createdAt),
      updatedAt: toDate(scene.updatedAt),
    })),
    assets: store.assets.map((asset) => ({
      ...asset,
      createdAt: toDate(asset.createdAt),
    })),
  };
}

function loadStore(): Store {
  if (typeof window === "undefined") {
    return buildDefaultStore();
  }

  const raw = window.localStorage.getItem(STORE_KEY);
  if (!raw) {
    const initial = buildDefaultStore();
    saveStore(initial);
    return initial;
  }

  try {
    const parsed = JSON.parse(raw) as Store;
    return reviveStoreDates(parsed);
  } catch {
    const reset = buildDefaultStore();
    saveStore(reset);
    return reset;
  }
}

function saveStore(store: Store) {
  if (typeof window === "undefined") {
    return;
  }

  window.localStorage.setItem(STORE_KEY, JSON.stringify(store));
}

function jsonResponse(data: unknown, status = 200) {
  return new Response(data == null ? null : JSON.stringify(data), {
    status,
    headers: {
      "Content-Type": "application/json",
    },
  });
}

async function handleRequest(method: string, url: string, payload?: unknown) {
  const store = loadStore();

  if (method === "GET" && url === "/api/playlists") {
    const playlists = [...store.playlists].sort(
      (a, b) => a.createdAt.getTime() - b.createdAt.getTime(),
    );
    return jsonResponse(playlists);
  }

  const playlistById = url.match(/^\/api\/playlists\/([^/]+)$/);
  if (playlistById) {
    const id = playlistById[1];
    const playlist = store.playlists.find((entry) => entry.id === id);

    if (method === "GET") {
      return playlist
        ? jsonResponse(playlist)
        : jsonResponse({ error: "Not found" }, 404);
    }

    if (method === "PATCH") {
      if (!playlist) {
        return jsonResponse({ error: "Not found" }, 404);
      }

      Object.assign(playlist, payload as Partial<Playlist>);
      saveStore(store);
      return jsonResponse(playlist);
    }

    if (method === "DELETE") {
      const sceneIds = store.scenes
        .filter((scene) => scene.playlistId === id)
        .map((scene) => scene.id);

      store.playlists = store.playlists.filter((entry) => entry.id !== id);
      store.scenes = store.scenes.filter((scene) => scene.playlistId !== id);
      store.assets = store.assets.filter(
        (asset) => !sceneIds.includes(asset.sceneId),
      );

      saveStore(store);
      return new Response(null, { status: 204 });
    }
  }

  if (method === "POST" && url === "/api/playlists") {
    const now = new Date();
    const body = payload as Partial<Playlist>;
    const playlist: Playlist = {
      id: generateId(),
      name: body.name ?? `Playlist ${store.playlists.length + 1}`,
      type: body.type ?? "playlist",
      createdAt: now,
    };

    store.playlists.push(playlist);
    saveStore(store);
    return jsonResponse(playlist, 201);
  }

  const playlistScenes = url.match(/^\/api\/playlists\/([^/]+)\/scenes$/);
  if (method === "GET" && playlistScenes) {
    const playlistId = playlistScenes[1];
    const scenes = store.scenes
      .filter((scene) => scene.playlistId === playlistId)
      .sort((a, b) => a.sortOrder - b.sortOrder);
    return jsonResponse(scenes);
  }

  if (method === "POST" && url === "/api/scenes") {
    const now = new Date();
    const body = payload as Partial<Scene>;
    if (!body.playlistId) {
      return jsonResponse({ error: "playlistId is required" }, 400);
    }

    const scene: Scene = {
      id: generateId(),
      playlistId: body.playlistId,
      name: body.name ?? `Scene ${store.scenes.length + 1}`,
      description: body.description ?? "",
      sceneType: body.sceneType ?? "Google Earth",
      duration: body.duration ?? null,
      sortOrder: body.sortOrder ?? 0,
      thumbnailUrl: body.thumbnailUrl ?? null,
      createdBy: body.createdBy ?? "galadmin",
      createdAt: now,
      updatedAt: now,
    };

    store.scenes.push(scene);
    saveStore(store);
    return jsonResponse(scene, 201);
  }

  const sceneById = url.match(/^\/api\/scenes\/([^/]+)$/);
  if (sceneById) {
    const id = sceneById[1];
    const scene = store.scenes.find((entry) => entry.id === id);

    if (method === "GET") {
      return scene
        ? jsonResponse(scene)
        : jsonResponse({ error: "Not found" }, 404);
    }

    if (method === "PATCH") {
      if (!scene) {
        return jsonResponse({ error: "Not found" }, 404);
      }

      Object.assign(scene, payload as Partial<Scene>, {
        updatedAt: new Date(),
      });
      saveStore(store);
      return jsonResponse(scene);
    }

    if (method === "DELETE") {
      store.scenes = store.scenes.filter((entry) => entry.id !== id);
      store.assets = store.assets.filter((asset) => asset.sceneId !== id);
      saveStore(store);
      return new Response(null, { status: 204 });
    }
  }

  const sceneAssets = url.match(/^\/api\/scenes\/([^/]+)\/assets$/);
  if (method === "GET" && sceneAssets) {
    const sceneId = sceneAssets[1];
    const assets = store.assets.filter((asset) => asset.sceneId === sceneId);
    return jsonResponse(assets);
  }

  if (method === "POST" && url === "/api/assets") {
    const body = payload as Partial<Asset>;
    if (!body.sceneId) {
      return jsonResponse({ error: "sceneId is required" }, 400);
    }

    const asset: Asset = {
      id: generateId(),
      sceneId: body.sceneId,
      name: body.name ?? "Asset",
      assetType: body.assetType ?? "graphic",
      fileUrl: body.fileUrl ?? null,
      posX: body.posX ?? 0,
      posY: body.posY ?? 0,
      width: body.width ?? 7560,
      height: body.height ?? 1920,
      hasTransparency: body.hasTransparency ?? false,
      createdAt: new Date(),
    };

    store.assets.push(asset);
    saveStore(store);
    return jsonResponse(asset, 201);
  }

  const assetById = url.match(/^\/api\/assets\/([^/]+)$/);
  if (assetById) {
    const id = assetById[1];
    const asset = store.assets.find((entry) => entry.id === id);

    if (method === "GET") {
      return asset
        ? jsonResponse(asset)
        : jsonResponse({ error: "Not found" }, 404);
    }

    if (method === "PATCH") {
      if (!asset) {
        return jsonResponse({ error: "Not found" }, 404);
      }

      Object.assign(asset, payload as Partial<Asset>);
      saveStore(store);
      return jsonResponse(asset);
    }

    if (method === "DELETE") {
      store.assets = store.assets.filter((entry) => entry.id !== id);
      saveStore(store);
      return new Response(null, { status: 204 });
    }
  }

  if (method === "POST" && url === "/api/seed") {
    if (store.playlists.length > 0) {
      return jsonResponse({
        message: "Already seeded",
        count: store.playlists.length,
      });
    }

    const reset = buildDefaultStore();
    saveStore(reset);
    return jsonResponse({ message: "Seeded", count: reset.playlists.length });
  }

  return jsonResponse({ error: `Unsupported route: ${method} ${url}` }, 404);
}

async function handleResponse(res: Response) {
  if (!res.ok) {
    const text = await res.text();
    throw new Error(text || res.statusText);
  }

  if (res.status === 204) {
    return null;
  }

  return res.json();
}

export const api = {
  get: (url: string) => handleRequest("GET", url).then(handleResponse),
  post: (url: string, data: unknown) =>
    handleRequest("POST", url, data).then(handleResponse),
  patch: (url: string, data: unknown) =>
    handleRequest("PATCH", url, data).then(handleResponse),
  delete: (url: string) => handleRequest("DELETE", url).then(handleResponse),
};

export function invalidate(...keys: string[][]) {
  keys.forEach((k) => queryClient.invalidateQueries({ queryKey: k }));
}
