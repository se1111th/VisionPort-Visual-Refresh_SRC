import { sql } from "drizzle-orm";
import { pgTable, text, varchar, integer, boolean, timestamp } from "drizzle-orm/pg-core";
import { createInsertSchema } from "drizzle-zod";
import { z } from "zod";

export const playlists = pgTable("playlists", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  name: text("name").notNull(),
  type: text("type").notNull().default("playlist"),
  createdAt: timestamp("created_at").defaultNow().notNull(),
});

export const insertPlaylistSchema = createInsertSchema(playlists).omit({ id: true, createdAt: true });
export type InsertPlaylist = z.infer<typeof insertPlaylistSchema>;
export type Playlist = typeof playlists.$inferSelect;

export const scenes = pgTable("scenes", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  playlistId: varchar("playlist_id").notNull().references(() => playlists.id, { onDelete: "cascade" }),
  name: text("name").notNull(),
  description: text("description").default(""),
  sceneType: text("scene_type").notNull().default("Google Earth"),
  duration: integer("duration"),
  sortOrder: integer("sort_order").notNull().default(0),
  thumbnailUrl: text("thumbnail_url"),
  createdBy: text("created_by").default("galadmin"),
  createdAt: timestamp("created_at").defaultNow().notNull(),
  updatedAt: timestamp("updated_at").defaultNow().notNull(),
});

export const insertSceneSchema = createInsertSchema(scenes).omit({ id: true, createdAt: true, updatedAt: true });
export type InsertScene = z.infer<typeof insertSceneSchema>;
export type Scene = typeof scenes.$inferSelect;

export const assets = pgTable("assets", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  sceneId: varchar("scene_id").notNull().references(() => scenes.id, { onDelete: "cascade" }),
  name: text("name").notNull(),
  assetType: text("asset_type").notNull().default("graphic"),
  fileUrl: text("file_url"),
  posX: integer("pos_x").default(0),
  posY: integer("pos_y").default(0),
  width: integer("width").default(7560),
  height: integer("height").default(1920),
  hasTransparency: boolean("has_transparency").default(false),
  createdAt: timestamp("created_at").defaultNow().notNull(),
});

export const insertAssetSchema = createInsertSchema(assets).omit({ id: true, createdAt: true });
export type InsertAsset = z.infer<typeof insertAssetSchema>;
export type Asset = typeof assets.$inferSelect;
