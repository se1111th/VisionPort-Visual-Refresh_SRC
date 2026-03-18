import type { Express } from "express";
import { createServer, type Server } from "http";
import { storage } from "./storage";
import { insertPlaylistSchema, insertSceneSchema, insertAssetSchema } from "@shared/schema";

export async function registerRoutes(
  httpServer: Server,
  app: Express
): Promise<Server> {

  // --- Playlists ---
  app.get("/api/playlists", async (_req, res) => {
    const data = await storage.getPlaylists();
    res.json(data);
  });

  app.get("/api/playlists/:id", async (req, res) => {
    const data = await storage.getPlaylist(req.params.id);
    if (!data) return res.status(404).json({ error: "Not found" });
    res.json(data);
  });

  app.post("/api/playlists", async (req, res) => {
    const parsed = insertPlaylistSchema.safeParse(req.body);
    if (!parsed.success) return res.status(400).json({ error: parsed.error.flatten() });
    const data = await storage.createPlaylist(parsed.data);
    res.status(201).json(data);
  });

  app.patch("/api/playlists/:id", async (req, res) => {
    const data = await storage.updatePlaylist(req.params.id, req.body);
    if (!data) return res.status(404).json({ error: "Not found" });
    res.json(data);
  });

  app.delete("/api/playlists/:id", async (req, res) => {
    await storage.deletePlaylist(req.params.id);
    res.status(204).end();
  });

  // --- Scenes ---
  app.get("/api/playlists/:playlistId/scenes", async (req, res) => {
    const data = await storage.getScenes(req.params.playlistId);
    res.json(data);
  });

  app.get("/api/scenes/:id", async (req, res) => {
    const data = await storage.getScene(req.params.id);
    if (!data) return res.status(404).json({ error: "Not found" });
    res.json(data);
  });

  app.post("/api/scenes", async (req, res) => {
    const parsed = insertSceneSchema.safeParse(req.body);
    if (!parsed.success) return res.status(400).json({ error: parsed.error.flatten() });
    const data = await storage.createScene(parsed.data);
    res.status(201).json(data);
  });

  app.patch("/api/scenes/:id", async (req, res) => {
    const data = await storage.updateScene(req.params.id, req.body);
    if (!data) return res.status(404).json({ error: "Not found" });
    res.json(data);
  });

  app.delete("/api/scenes/:id", async (req, res) => {
    await storage.deleteScene(req.params.id);
    res.status(204).end();
  });

  // --- Assets ---
  app.get("/api/scenes/:sceneId/assets", async (req, res) => {
    const data = await storage.getAssets(req.params.sceneId);
    res.json(data);
  });

  app.get("/api/assets/:id", async (req, res) => {
    const data = await storage.getAsset(req.params.id);
    if (!data) return res.status(404).json({ error: "Not found" });
    res.json(data);
  });

  app.post("/api/assets", async (req, res) => {
    const parsed = insertAssetSchema.safeParse(req.body);
    if (!parsed.success) return res.status(400).json({ error: parsed.error.flatten() });
    const data = await storage.createAsset(parsed.data);
    res.status(201).json(data);
  });

  app.patch("/api/assets/:id", async (req, res) => {
    const data = await storage.updateAsset(req.params.id, req.body);
    if (!data) return res.status(404).json({ error: "Not found" });
    res.json(data);
  });

  app.delete("/api/assets/:id", async (req, res) => {
    await storage.deleteAsset(req.params.id);
    res.status(204).end();
  });

  // --- Seed endpoint (for initial data) ---
  app.post("/api/seed", async (_req, res) => {
    const existing = await storage.getPlaylists();
    if (existing.length > 0) {
      return res.json({ message: "Already seeded", count: existing.length });
    }

    const playlistNames = [
      "VisionPort for Comm Real Estate",
      "JLL Presentations",
      "CBRE Portfolio",
      "Cushman & Wakefield",
      "Colliers International",
      "Marcus & Millichap",
      "Newmark Knight Frank",
      "Savills North America",
      "Avison Young",
      "Berkadia",
      "HFF Institutional",
      "Eastdil Secured",
      "Walker & Dunlop",
      "Transwestern Properties",
      "Lee & Associates"
    ];

    const createdPlaylists = [];
    for (const name of playlistNames) {
      const p = await storage.createPlaylist({ name, type: "playlist" });
      createdPlaylists.push(p);
    }

    const firstPlaylist = createdPlaylists[0];
    const sceneNames = [
      "Welcome",
      "LA Availability",
      "Market Overview",
      "Property Tour",
      "Floor Plans",
      "Amenities",
      "Neighborhood",
      "Transportation",
      "Demographics",
      "Pricing",
      "Contact Info",
      "Virtual Walkthrough",
      "Aerial View",
      "Interior Gallery",
      "Summary"
    ];

    const createdScenes = [];
    for (let i = 0; i < sceneNames.length; i++) {
      const s = await storage.createScene({
        playlistId: firstPlaylist.id,
        name: sceneNames[i],
        description: `${sceneNames[i]} scene description`,
        sceneType: "Google Earth",
        duration: i === 0 ? null : 3000,
        sortOrder: i,
        createdBy: "galadmin",
      });
      createdScenes.push(s);
    }

    const firstScene = createdScenes[0];
    const assetNames = [
      "g_panorama.jpg",
      "logo_white.png",
      "icon_pack.svg",
      "bg_pattern.jpg",
      "asset_4.png",
      "asset_5.png",
      "hero_overlay.png",
      "cta_button_primary.svg",
      "cta_button_secondary.svg",
      "floorplate_level_12.png",
      "floorplate_level_18.png",
      "broker_headshot_anna.png",
      "broker_headshot_marcus.png",
      "brand_bug_gold.svg",
      "market_chart_q1.png",
      "market_chart_q2.png",
      "leasing_map_downtown.jpg",
      "tenant_logos_strip.png",
      "wayfinding_arrow_left.svg",
      "wayfinding_arrow_right.svg",
      "contact_card_broker.pdf",
      "amenities_badges.ai",
      "pricing_table_export.csv",
      "neighborhood_labels.json",
      "virtual_tour_hotspots.geojson",
    ];
    for (const name of assetNames) {
      await storage.createAsset({
        sceneId: firstScene.id,
        name,
        assetType: "graphic",
        width: 7560,
        height: 1920,
        hasTransparency: name.endsWith(".png"),
      });
    }

    res.json({ message: "Seeded successfully", playlists: createdPlaylists.length, scenes: createdScenes.length });
  });

  return httpServer;
}
