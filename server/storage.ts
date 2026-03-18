import { eq, asc } from "drizzle-orm";
import { db } from "./db";
import {
  playlists, scenes, assets,
  type Playlist, type InsertPlaylist,
  type Scene, type InsertScene,
  type Asset, type InsertAsset,
} from "@shared/schema";

export interface IStorage {
  getPlaylists(): Promise<Playlist[]>;
  getPlaylist(id: string): Promise<Playlist | undefined>;
  createPlaylist(data: InsertPlaylist): Promise<Playlist>;
  updatePlaylist(id: string, data: Partial<InsertPlaylist>): Promise<Playlist | undefined>;
  deletePlaylist(id: string): Promise<void>;

  getScenes(playlistId: string): Promise<Scene[]>;
  getScene(id: string): Promise<Scene | undefined>;
  createScene(data: InsertScene): Promise<Scene>;
  updateScene(id: string, data: Partial<InsertScene>): Promise<Scene | undefined>;
  deleteScene(id: string): Promise<void>;

  getAssets(sceneId: string): Promise<Asset[]>;
  getAsset(id: string): Promise<Asset | undefined>;
  createAsset(data: InsertAsset): Promise<Asset>;
  updateAsset(id: string, data: Partial<InsertAsset>): Promise<Asset | undefined>;
  deleteAsset(id: string): Promise<void>;
}

export class DatabaseStorage implements IStorage {
  async getPlaylists(): Promise<Playlist[]> {
    return db.select().from(playlists).orderBy(asc(playlists.createdAt));
  }

  async getPlaylist(id: string): Promise<Playlist | undefined> {
    const [row] = await db.select().from(playlists).where(eq(playlists.id, id));
    return row;
  }

  async createPlaylist(data: InsertPlaylist): Promise<Playlist> {
    const [row] = await db.insert(playlists).values(data).returning();
    return row;
  }

  async updatePlaylist(id: string, data: Partial<InsertPlaylist>): Promise<Playlist | undefined> {
    const [row] = await db.update(playlists).set(data).where(eq(playlists.id, id)).returning();
    return row;
  }

  async deletePlaylist(id: string): Promise<void> {
    await db.delete(playlists).where(eq(playlists.id, id));
  }

  async getScenes(playlistId: string): Promise<Scene[]> {
    return db.select().from(scenes).where(eq(scenes.playlistId, playlistId)).orderBy(asc(scenes.sortOrder));
  }

  async getScene(id: string): Promise<Scene | undefined> {
    const [row] = await db.select().from(scenes).where(eq(scenes.id, id));
    return row;
  }

  async createScene(data: InsertScene): Promise<Scene> {
    const [row] = await db.insert(scenes).values(data).returning();
    return row;
  }

  async updateScene(id: string, data: Partial<InsertScene>): Promise<Scene | undefined> {
    const [row] = await db.update(scenes).set({ ...data, updatedAt: new Date() }).where(eq(scenes.id, id)).returning();
    return row;
  }

  async deleteScene(id: string): Promise<void> {
    await db.delete(scenes).where(eq(scenes.id, id));
  }

  async getAssets(sceneId: string): Promise<Asset[]> {
    return db.select().from(assets).where(eq(assets.sceneId, sceneId)).orderBy(asc(assets.createdAt));
  }

  async getAsset(id: string): Promise<Asset | undefined> {
    const [row] = await db.select().from(assets).where(eq(assets.id, id));
    return row;
  }

  async createAsset(data: InsertAsset): Promise<Asset> {
    const [row] = await db.insert(assets).values(data).returning();
    return row;
  }

  async updateAsset(id: string, data: Partial<InsertAsset>): Promise<Asset | undefined> {
    const [row] = await db.update(assets).set(data).where(eq(assets.id, id)).returning();
    return row;
  }

  async deleteAsset(id: string): Promise<void> {
    await db.delete(assets).where(eq(assets.id, id));
  }
}

export const storage = new DatabaseStorage();
