import { useEffect, useState, type ReactNode } from "react";
import { useMutation, useQuery } from "@tanstack/react-query";
import { Panel, PanelGroup, PanelResizeHandle } from "react-resizable-panels";
import {
  AlignVerticalJustifyCenter,
  ArrowDownUp,
  ChevronDown,
  ChevronLeft,
  ChevronRight,
  ChevronUp,
  Copy,
  Folder,
  Image as ImageIcon,
  Info,
  Maximize,
  Maximize2,
  Plus,
  RectangleHorizontal,
  RectangleVertical,
  Search,
  Settings,
  Shrink,
  Trash2,
  X,
} from "lucide-react";

import { api, invalidate } from "@/lib/api";
import type { Asset, Playlist, Scene } from "@shared/schema";

import previewPanorama from "../assets/preview-panorama.jpg";
import logo from "@assets/VisionPort-Logo-white_825w_1773355501339.png";
import "./dashboard.css";

const sidebarTabs = ["PLAYLISTS", "PRESENTATIONS", "ASSETS"] as const;

type SettingsGalleryLayout =
  | "duplicate-scene"
  | "import"
  | "capture-presentation"
  | "unsaved-ignore"
  | "unsaved-close"
  | "publish-consumers"
  | "about"
  | "info-for-galadmin"
  | "presentation-settings"
  | "asset-wizard"
  | "admin"
  | "playlist-settings"
  | "edit-user"
  | "asset-settings"
  | "capture-screenshot";

type SettingsGallerySlide = {
  fileStem: string;
  modalTitle: string;
  layout: SettingsGalleryLayout;
};

const settingsGallerySlides: SettingsGallerySlide[] = [
  {
    fileStem: "Duplicate Scene",
    modalTitle: "Duplicate Scene",
    layout: "duplicate-scene",
  },
  {
    fileStem: "Import",
    modalTitle: "Import",
    layout: "import",
  },
  {
    fileStem: "Capture - Screenshot",
    modalTitle: "Capture",
    layout: "capture-screenshot",
  },
  {
    fileStem: "Capture - Presentation",
    modalTitle: "Capture",
    layout: "capture-presentation",
  },
  {
    fileStem: "Unsaved data - Ignore",
    modalTitle: "Unsaved data",
    layout: "unsaved-ignore",
  },
  {
    fileStem: "Unsaved data - Close",
    modalTitle: "Unsaved data",
    layout: "unsaved-close",
  },
  {
    fileStem: "Publish to Consumers",
    modalTitle: "Publish to Consumers",
    layout: "publish-consumers",
  },
  {
    fileStem: "About",
    modalTitle: "About",
    layout: "about",
  },
  {
    fileStem: "Info for galadmin",
    modalTitle: "Info for galadmin",
    layout: "info-for-galadmin",
  },
  {
    fileStem: "Presentation Settings",
    modalTitle: "Presentation Settings",
    layout: "presentation-settings",
  },
  {
    fileStem: "Asset Wizard",
    modalTitle: "Asset Wizard",
    layout: "asset-wizard",
  },
  {
    fileStem: "Admin",
    modalTitle: "Admin",
    layout: "admin",
  },
  {
    fileStem: "Playlist Settings",
    modalTitle: "Playlist Settings",
    layout: "playlist-settings",
  },
  {
    fileStem: "Edit User",
    modalTitle: "Edit User",
    layout: "edit-user",
  },
  {
    fileStem: "Asset Settings",
    modalTitle: "Asset Settings",
    layout: "asset-settings",
  },
];

const publishConsumerIds = ["solotn", "vptogo", "vpsmalls", "vpbook"] as const;

type PublishConsumersControls = {
  checked: Record<string, boolean>;
  allSelected: boolean;
  onToggleAll: (checked: boolean) => void;
  onToggleConsumer: (consumer: string, checked: boolean) => void;
};

type SettingsGalleryRenderOptions = {
  publishConsumers?: PublishConsumersControls;
};

function renderSettingsGallerySlide(
  layout: SettingsGalleryLayout,
  options: SettingsGalleryRenderOptions = {},
): ReactNode {
  if (layout === "duplicate-scene") {
    return (
      <div className="settings-gallery__content">
        <div className="settings-gallery__layer settings-gallery__section">
          <label className="settings-gallery__label" htmlFor="gallery-duplicate-target">
            Choose presentations
          </label>
          <select
            id="gallery-duplicate-target"
            className="settings-gallery__input settings-gallery__input--select"
            defaultValue="new-clone"
          >
            <option value="new-clone">New Clone</option>
            <option value="same-playlist">Same Playlist</option>
            <option value="other-playlist">Other Playlist</option>
          </select>
          <label className="settings-gallery__checkbox-row">
            <input type="checkbox" className="dashboard-checkbox" />
            <span>Direct Link instead of New Clone</span>
          </label>
        </div>

        <div className="settings-gallery__actions">
          <button type="button" className="settings-gallery__action-button settings-gallery__action-button--success">
            DUPLICATE
          </button>
          <button
            type="button"
            className="dashboard-button dashboard-button--primary settings-gallery__action-button settings-gallery__action-button--cancel"
          >
            CANCEL
          </button>
        </div>
      </div>
    );
  }

  if (layout === "import") {
    return (
      <div className="settings-gallery__content">
        <div className="settings-gallery__surface settings-gallery__dropzone">
          <div className="settings-gallery__dropzone-icon">⬆</div>
          <div>Drag files here to upload them</div>
          <button type="button" className="settings-gallery__ghost-button">
            CLICK TO BROWSE
          </button>
        </div>

        <div className="settings-gallery__row">
          <span className="settings-gallery__label">Import method:</span>
          <label className="settings-gallery__radio-row">
            <input type="radio" name="import-method" defaultChecked />
            <span>Merge</span>
          </label>
          <label className="settings-gallery__radio-row">
            <input type="radio" name="import-method" />
            <span>Clone</span>
          </label>
        </div>

        <div className="settings-gallery__actions">
          <button type="button" className="settings-gallery__action-button settings-gallery__action-button--neutral">
            CLEAR
          </button>
          <button
            type="button"
            className="dashboard-button dashboard-button--primary settings-gallery__action-button settings-gallery__action-button--close"
          >
            CLOSE
          </button>
        </div>
      </div>
    );
  }

  if (layout === "capture-presentation") {
    return (
      <div className="settings-gallery__content">
        <div className="settings-gallery__tabs settings-gallery__tabs--two">
          <button type="button" className="settings-gallery__tab">
            SCREENSHOT
          </button>
          <button type="button" className="settings-gallery__tab is-active">
            PRESENTATION
          </button>
        </div>

        <div className="settings-gallery__actions settings-gallery__actions--toolbar">
          <button type="button" className="settings-gallery__ghost-button">
            CAPTURE
          </button>
          <button type="button" className="settings-gallery__ghost-button">
            REFRESH LIST
          </button>
        </div>

        <div className="settings-gallery__surface settings-gallery__table">
          <div className="settings-gallery__table-head">
            <span>Preview</span>
            <span>Presentation Name</span>
            <span>Video</span>
            <span>Screenshots</span>
            <span>PDF</span>
          </div>
          <div className="settings-gallery__table-empty">No data available</div>
        </div>

        <div className="settings-gallery__row settings-gallery__row--between">
          <label className="settings-gallery__checkbox-row">
            <input type="checkbox" className="dashboard-checkbox" defaultChecked />
            <span>Include active presentation</span>
          </label>
          <select className="settings-gallery__input settings-gallery__input--inline" defaultValue="test1">
            <option value="test1">test1</option>
          </select>
        </div>

        <div className="settings-gallery__actions settings-gallery__actions--center">
          <button
            type="button"
            className="dashboard-button dashboard-button--primary settings-gallery__action-button settings-gallery__action-button--close"
          >
            CLOSE
          </button>
        </div>
      </div>
    );
  }

  if (layout === "unsaved-ignore") {
    return (
      <div className="settings-gallery__content">
        <div className="settings-gallery__surface settings-gallery__notice">
          Are you sure you want to ignore some modifications?
        </div>
        <div className="settings-gallery__actions">
          <button
            type="button"
            className="dashboard-button dashboard-button--primary settings-gallery__action-button settings-gallery__action-button--cancel"
          >
            CANCEL
          </button>
          <button type="button" className="settings-gallery__action-button settings-gallery__action-button--success">
            IGNORE
          </button>
        </div>
      </div>
    );
  }

  if (layout === "unsaved-close") {
    return (
      <div className="settings-gallery__content">
        <div className="settings-gallery__surface settings-gallery__notice">
          Unsaved changes are present. Close this window anyway?
        </div>
        <div className="settings-gallery__actions">
          <button
            type="button"
            className="dashboard-button dashboard-button--primary settings-gallery__action-button settings-gallery__action-button--cancel"
          >
            CANCEL
          </button>
          <button type="button" className="settings-gallery__action-button settings-gallery__action-button--success">
            CLOSE
          </button>
        </div>
      </div>
    );
  }

  if (layout === "publish-consumers") {
    const publishConsumers = options.publishConsumers;

    return (
      <div className="settings-gallery__content">
        <div className="settings-gallery__surface settings-gallery__section settings-gallery__section--publish">
          <div className="settings-gallery__publish-layout">
            <div className="settings-gallery__publish-list">
              {publishConsumerIds.map((consumer) => (
                <label key={consumer} className="settings-gallery__checkbox-row">
                  <input
                    type="checkbox"
                    className="dashboard-checkbox"
                    checked={publishConsumers?.checked[consumer] ?? false}
                    onChange={(event) =>
                      publishConsumers?.onToggleConsumer(
                        consumer,
                        event.target.checked,
                      )
                    }
                  />
                  <span>{consumer}</span>
                </label>
              ))}
            </div>

            <div className="settings-gallery__publish-divider" />

            <label className="settings-gallery__checkbox-row settings-gallery__checkbox-row--publish-all">
              <input
                type="checkbox"
                className="dashboard-checkbox"
                checked={publishConsumers?.allSelected ?? false}
                onChange={(event) =>
                  publishConsumers?.onToggleAll(event.target.checked)
                }
              />
              <span>Select All</span>
            </label>
          </div>
        </div>
        <div className="settings-gallery__actions">
          <button
            type="button"
            className="dashboard-button dashboard-button--primary settings-gallery__action-button settings-gallery__action-button--cancel"
          >
            CANCEL
          </button>
          <button type="button" className="settings-gallery__action-button settings-gallery__action-button--success">
            PUBLISH
          </button>
        </div>
      </div>
    );
  }

  if (layout === "about") {
    return (
      <div className="settings-gallery__content">
        <div className="settings-gallery__surface settings-gallery__section">
          <div className="settings-gallery__card">
            <h4>Server version</h4>
            <p>sort_fix -- 2.3.1-1-g1b39cdf5 -- Tue Feb 10 09:58:19 2026</p>
          </div>
          <div className="settings-gallery__card">
            <h4>Interface version</h4>
            <p>admin_only -- 2.3.10-11-gf24ff082 -- Tue Mar 17 17:55:25 2026</p>
          </div>
          <div className="settings-gallery__card settings-gallery__card--compact">
            For questions or support, email support@visionport.com
          </div>
        </div>
        <div className="settings-gallery__actions settings-gallery__actions--center">
          <button
            type="button"
            className="dashboard-button dashboard-button--primary settings-gallery__action-button settings-gallery__action-button--close"
          >
            CLOSE
          </button>
        </div>
      </div>
    );
  }

  if (layout === "info-for-galadmin") {
    return (
      <div className="settings-gallery__content">
        <div className="settings-gallery__layer settings-gallery__section">
          <select className="settings-gallery__input settings-gallery__input--select" defaultValue="preferences">
            <option value="preferences">Preferences</option>
          </select>
          <input className="settings-gallery__input" defaultValue="lg@endpoint.com" />
          <input className="settings-gallery__input" defaultValue="galadmin" />
          <input className="settings-gallery__input" defaultValue="Enter New Password" />
          <input className="settings-gallery__input" defaultValue="Confirm New Password" />
          <label className="settings-gallery__checkbox-row">
            <input type="checkbox" className="dashboard-checkbox" defaultChecked />
            <span>Is Super</span>
          </label>
          <label className="settings-gallery__checkbox-row">
            <input type="checkbox" className="dashboard-checkbox" />
            <span>Is Admin</span>
          </label>
          <label className="settings-gallery__checkbox-row">
            <input type="checkbox" className="dashboard-checkbox" defaultChecked />
            <span>Is Active</span>
          </label>
          <select className="settings-gallery__input settings-gallery__input--select" defaultValue="all">
            <option value="all">Presentations modified or created</option>
          </select>
        </div>
        <div className="settings-gallery__actions">
          <button type="button" className="settings-gallery__action-button settings-gallery__action-button--success">
            SAVE
          </button>
          <button
            type="button"
            className="dashboard-button dashboard-button--primary settings-gallery__action-button settings-gallery__action-button--cancel"
          >
            CANCEL
          </button>
        </div>
      </div>
    );
  }

  if (layout === "presentation-settings") {
    return (
      <div className="settings-gallery__content">
        <div className="settings-gallery__layer settings-gallery__section">
          <input className="settings-gallery__input" defaultValue="test1" />
          <textarea className="settings-gallery__input settings-gallery__input--area" defaultValue="testing on 1" />
          <label className="settings-gallery__checkbox-row">
            <input type="checkbox" className="dashboard-checkbox" />
            <span>Admin only</span>
          </label>
          <label className="settings-gallery__checkbox-row">
            <input type="checkbox" className="dashboard-checkbox" />
            <span>Loop</span>
          </label>
          <div className="settings-gallery__meta-grid">
            <div>
              <strong>Created:</strong> 12/10/2025
            </div>
            <div>
              <strong>Modified:</strong> 1/14/2026
            </div>
            <div>
              <strong>Playlists:</strong> SethTest
            </div>
          </div>
        </div>
        <div className="settings-gallery__actions settings-gallery__actions--center">
          <button
            type="button"
            className="dashboard-button dashboard-button--primary settings-gallery__action-button settings-gallery__action-button--cancel"
          >
            CANCEL
          </button>
        </div>
      </div>
    );
  }

  if (layout === "asset-wizard") {
    return (
      <div className="settings-gallery__content">
        <div className="settings-gallery__tabs">
          <button type="button" className="settings-gallery__tab is-active">
            UPLOAD LOCAL FILES
          </button>
          <button type="button" className="settings-gallery__tab">
            ADD REMOTE URL
          </button>
          <button type="button" className="settings-gallery__tab">
            KML TOUR WIZARD
          </button>
        </div>
        <div className="settings-gallery__surface settings-gallery__dropzone">
          <div className="settings-gallery__dropzone-icon">⬆</div>
          <div>Drag files here to upload them</div>
          <button type="button" className="settings-gallery__ghost-button">
            CLICK TO BROWSE
          </button>
        </div>
        <div className="settings-gallery__section settings-gallery__section--compact">
          <label className="settings-gallery__checkbox-row">
            <input type="checkbox" className="dashboard-checkbox" />
            <span>Search and Replace</span>
          </label>
          <label className="settings-gallery__checkbox-row">
            <input type="checkbox" className="dashboard-checkbox" />
            <span>Create Scenes from Assets</span>
          </label>
          <div className="settings-gallery__row">
            <select className="settings-gallery__input settings-gallery__input--inline">
              <option>Asset Type: Graphic</option>
            </select>
            <select className="settings-gallery__input settings-gallery__input--inline">
              <option>Add to</option>
            </select>
          </div>
        </div>
        <div className="settings-gallery__actions">
          <button
            type="button"
            className="dashboard-button dashboard-button--primary settings-gallery__action-button settings-gallery__action-button--close"
          >
            CLOSE
          </button>
        </div>
      </div>
    );
  }

  if (layout === "admin") {
    return (
      <div className="settings-gallery__content">
        <div className="settings-gallery__tabs">
          <button type="button" className="settings-gallery__tab is-active">
            USERS
          </button>
          <button type="button" className="settings-gallery__tab">
            SYSTEM PREFERENCES
          </button>
          <button type="button" className="settings-gallery__tab">
            SYSTEM CONTROL
          </button>
        </div>
        <div className="settings-gallery__surface settings-gallery__table">
          <div className="settings-gallery__table-head">
            <span>Email</span>
            <span>Username</span>
            <span>Active</span>
            <span>Admin</span>
            <span>Super</span>
          </div>
          {["aramon", "tino", "ashley", "bharathi"].map((row) => (
            <div key={row} className="settings-gallery__table-row">
              <span>{row}@endpointdev.com</span>
              <span>{row}</span>
              <span>Yes</span>
              <span>No</span>
              <span>No</span>
            </div>
          ))}
        </div>
        <div className="settings-gallery__row settings-gallery__row--between">
          <button
            type="button"
            className="dashboard-button dashboard-button--primary settings-gallery__action-button settings-gallery__action-button--close"
          >
            CLOSE
          </button>
          <label className="settings-gallery__checkbox-row">
            <input type="checkbox" className="dashboard-checkbox" />
            <span>Show Inactive Users</span>
          </label>
        </div>
      </div>
    );
  }

  if (layout === "playlist-settings") {
    return (
      <div className="settings-gallery__content">
        <div className="settings-gallery__layer settings-gallery__section">
          <input className="settings-gallery__input" defaultValue="CBRE Market Canvas Launchers" />
          <textarea className="settings-gallery__input settings-gallery__input--area" defaultValue="Description" />
          <label className="settings-gallery__checkbox-row">
            <input type="checkbox" className="dashboard-checkbox" />
            <span>Admin only</span>
          </label>
          <div className="settings-gallery__meta-grid">
            <div>
              <strong>Created:</strong> 3/10/2026
            </div>
            <div>
              <strong>By:</strong> galadmin
            </div>
            <div>
              <strong>Presentations:</strong> Market Canvas Launchers, Atlanta Braves
            </div>
          </div>
        </div>
        <div className="settings-gallery__actions">
          <button
            type="button"
            className="dashboard-button dashboard-button--danger settings-gallery__action-button"
          >
            DELETE
          </button>
          <button
            type="button"
            className="dashboard-button dashboard-button--primary settings-gallery__action-button settings-gallery__action-button--cancel"
          >
            CANCEL
          </button>
        </div>
      </div>
    );
  }

  if (layout === "edit-user") {
    return (
      <div className="settings-gallery__content">
        <div className="settings-gallery__layer settings-gallery__section">
          <input className="settings-gallery__input" defaultValue="aramon@endpointdev.com" />
          <input className="settings-gallery__input" defaultValue="aramon" />
          <input className="settings-gallery__input" defaultValue="Enter New Password" />
          <input className="settings-gallery__input" defaultValue="Confirm New Password" />
          <label className="settings-gallery__checkbox-row">
            <input type="checkbox" className="dashboard-checkbox" />
            <span>Is Super</span>
          </label>
          <label className="settings-gallery__checkbox-row">
            <input type="checkbox" className="dashboard-checkbox" />
            <span>Is Admin</span>
          </label>
          <label className="settings-gallery__checkbox-row">
            <input type="checkbox" className="dashboard-checkbox" defaultChecked />
            <span>Is Active</span>
          </label>
          <select className="settings-gallery__input settings-gallery__input--select">
            <option>Presentations modified or created</option>
          </select>
        </div>
        <div className="settings-gallery__actions">
          <button type="button" className="settings-gallery__action-button settings-gallery__action-button--success">
            SAVE
          </button>
          <button
            type="button"
            className="dashboard-button dashboard-button--primary settings-gallery__action-button settings-gallery__action-button--cancel"
          >
            CANCEL
          </button>
        </div>
      </div>
    );
  }

  if (layout === "asset-settings") {
    return (
      <div className="settings-gallery__content">
        <div className="settings-gallery__layer settings-gallery__section">
          <input
            className="settings-gallery__input"
            defaultValue="Captured Location - 2026-01-14_23-06-26"
          />
          <input className="settings-gallery__input" defaultValue="Description" />
          <div className="settings-gallery__meta-grid settings-gallery__meta-grid--asset">
            <div>
              <strong>Id:</strong> 1729
            </div>
            <div>
              <strong>Asset Type:</strong> KML Tour
            </div>
            <div>
              <strong>Location:</strong> 8133e1afd81d470980c4a4a300af6142.kml
            </div>
            <div>
              <strong>Found in:</strong> 1 Scene
            </div>
          </div>
          <div className="settings-gallery__map" />
        </div>
        <div className="settings-gallery__actions settings-gallery__actions--center">
          <button
            type="button"
            className="dashboard-button dashboard-button--primary settings-gallery__action-button settings-gallery__action-button--cancel"
          >
            CANCEL
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="settings-gallery__content">
      <div className="settings-gallery__tabs settings-gallery__tabs--two">
        <button type="button" className="settings-gallery__tab is-active">
          SCREENSHOT
        </button>
        <button type="button" className="settings-gallery__tab">
          PRESENTATION
        </button>
      </div>

      <div className="settings-gallery__actions settings-gallery__actions--toolbar">
        <button type="button" className="settings-gallery__ghost-button">
          TAKE SCREENSHOT
        </button>
        <button type="button" className="settings-gallery__ghost-button">
          REFRESH LIST
        </button>
        <button type="button" className="settings-gallery__ghost-button">
          DOWNLOAD ALL
        </button>
      </div>

      <div className="settings-gallery__surface settings-gallery__table">
        <div className="settings-gallery__table-head">
          <span>Thumbnail</span>
          <span>File Name</span>
          <span>Download</span>
        </div>
        {[
          "vpbook1-scrnsht.png",
          "vp-screenshot-2025-12-30-31_05.jpg",
          "vp-screenshot-2025-12-30-29_15.jpg",
        ].map((fileName) => (
          <div key={fileName} className="settings-gallery__table-row">
            <span className="settings-gallery__thumb" />
            <span>{fileName}</span>
            <span>↓</span>
          </div>
        ))}
      </div>

      <div className="settings-gallery__row settings-gallery__row--between">
        <span>1-8 of 14</span>
        <button
          type="button"
          className="dashboard-button dashboard-button--primary settings-gallery__action-button settings-gallery__action-button--close"
        >
          CLOSE
        </button>
      </div>
    </div>
  );
}

const sceneThumbnailThemes = [
  {
    skyTop: "#8dc9e9",
    skyBottom: "#dff4fb",
    horizon: "#d9c7a2",
    accent: "#d66d3d",
    shadow: "#4b7086",
    shape: "tower",
  },
  {
    skyTop: "#7aa0d0",
    skyBottom: "#eff7ff",
    horizon: "#90b6c6",
    accent: "#eea23f",
    shadow: "#31506a",
    shape: "blocks",
  },
  {
    skyTop: "#d38e7a",
    skyBottom: "#f7d9c8",
    horizon: "#7ba56f",
    accent: "#eadc85",
    shadow: "#44654a",
    shape: "hills",
  },
  {
    skyTop: "#537d9f",
    skyBottom: "#c8dff1",
    horizon: "#c8b07d",
    accent: "#f6cf59",
    shadow: "#29475e",
    shape: "bridge",
  },
  {
    skyTop: "#6f9a8d",
    skyBottom: "#d8efe9",
    horizon: "#d6c0a4",
    accent: "#f27f59",
    shadow: "#345b55",
    shape: "gallery",
  },
  {
    skyTop: "#9582c4",
    skyBottom: "#efe9fb",
    horizon: "#86a983",
    accent: "#ffbe56",
    shadow: "#4c3d70",
    shape: "map",
  },
] as const;

function buildSceneThumbnail(sceneName: string, index: number) {
  const theme = sceneThumbnailThemes[index % sceneThumbnailThemes.length];
  const label = sceneName
    .split(" ")
    .slice(0, 2)
    .map((part) => part[0]?.toUpperCase() ?? "")
    .join("")
    .slice(0, 2);

  const artworkByShape = {
    tower:
      `<rect x="98" y="54" width="26" height="90" rx="4" fill="${theme.shadow}" opacity="0.92"/>` +
      `<rect x="78" y="68" width="18" height="76" rx="4" fill="${theme.shadow}" opacity="0.74"/>` +
      `<rect x="127" y="83" width="16" height="61" rx="4" fill="${theme.accent}" opacity="0.88"/>`,
    blocks:
      `<rect x="76" y="84" width="23" height="60" rx="4" fill="${theme.shadow}" opacity="0.82"/>` +
      `<rect x="103" y="70" width="20" height="74" rx="4" fill="${theme.accent}" opacity="0.86"/>` +
      `<rect x="127" y="94" width="18" height="50" rx="4" fill="${theme.shadow}" opacity="0.72"/>`,
    hills:
      `<path d="M18 138 C46 104 69 100 93 138 Z" fill="${theme.shadow}" opacity="0.7"/>` +
      `<path d="M74 138 C101 88 137 91 164 138 Z" fill="${theme.accent}" opacity="0.8"/>`,
    bridge:
      `<path d="M18 120 L62 92 L106 120 L150 86" stroke="${theme.shadow}" stroke-width="7" stroke-linecap="round" fill="none"/>` +
      `<rect x="96" y="84" width="10" height="60" rx="3" fill="${theme.accent}" opacity="0.85"/>`,
    gallery:
      `<rect x="33" y="73" width="112" height="58" rx="8" fill="${theme.shadow}" opacity="0.8"/>` +
      `<rect x="45" y="85" width="28" height="22" rx="4" fill="${theme.accent}" opacity="0.95"/>` +
      `<rect x="80" y="85" width="52" height="34" rx="4" fill="#ffffff" opacity="0.34"/>`,
    map:
      `<path d="M30 80 L62 68 L94 78 L128 62 L150 72 L150 128 L118 138 L86 128 L52 142 L30 132 Z" fill="${theme.shadow}" opacity="0.74"/>` +
      `<circle cx="103" cy="95" r="11" fill="${theme.accent}" opacity="0.96"/>`,
  } as const;

  const svg = `
    <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 180 144">
      <defs>
        <linearGradient id="bg" x1="0" y1="0" x2="0" y2="1">
          <stop offset="0%" stop-color="${theme.skyTop}" />
          <stop offset="58%" stop-color="${theme.skyBottom}" />
          <stop offset="58%" stop-color="${theme.horizon}" />
          <stop offset="100%" stop-color="${theme.accent}" />
        </linearGradient>
      </defs>
      <rect width="180" height="144" rx="14" fill="url(#bg)" />
      <circle cx="140" cy="30" r="14" fill="#ffffff" opacity="0.56" />
      <rect x="0" y="110" width="180" height="34" fill="${theme.shadow}" opacity="0.15" />
      ${artworkByShape[theme.shape]}
      <rect x="12" y="12" width="34" height="24" rx="12" fill="#ffffff" opacity="0.28" />
      <text x="29" y="29" text-anchor="middle" font-family="Arial, sans-serif" font-size="13" font-weight="700" fill="#ffffff">${label}</text>
    </svg>
  `;

  return `data:image/svg+xml;charset=UTF-8,${encodeURIComponent(svg)}`;
}

function cx(...tokens: Array<string | false | null | undefined>) {
  return tokens.filter(Boolean).join(" ");
}

function ResizeHandle() {
  return (
    <PanelResizeHandle className="dashboard-resize-handle dashboard-resize-handle--vertical">
      <div className="dashboard-resize-handle__grip" />
    </PanelResizeHandle>
  );
}

function HorizontalResizeHandle() {
  return (
    <PanelResizeHandle className="dashboard-resize-handle dashboard-resize-handle--horizontal">
      <div className="dashboard-resize-handle__grip" />
    </PanelResizeHandle>
  );
}

export default function Dashboard() {
  const [selectedPlaylistId, setSelectedPlaylistId] = useState<string | null>(
    null,
  );
  const [selectedSceneId, setSelectedSceneId] = useState<string | null>(null);
  const [expandedPlaylistId, setExpandedPlaylistId] = useState<string | null>(
    null,
  );
  const [expandedSidebarCollectionId, setExpandedSidebarCollectionId] =
    useState<string>("all-playlists");
  const [checkedPlaylists, setCheckedPlaylists] = useState<Set<string>>(
    new Set(),
  );
  const [checkedScenes, setCheckedScenes] = useState<Set<string>>(new Set());
  const [activeSidebarTab, setActiveSidebarTab] =
    useState<(typeof sidebarTabs)[number]>("PLAYLISTS");
  const [isSettingsGalleryOpen, setIsSettingsGalleryOpen] = useState(false);
  const [activeSettingsSlideIndex, setActiveSettingsSlideIndex] = useState(0);
  const [publishConsumerCheckedState, setPublishConsumerCheckedState] =
    useState<Record<string, boolean>>(() =>
      publishConsumerIds.reduce(
        (accumulator, consumer) => {
          accumulator[consumer] = true;
          return accumulator;
        },
        {} as Record<string, boolean>,
      ),
    );

  const { data: playlists = [], isLoading: loadingPlaylists } = useQuery<
    Playlist[]
  >({
    queryKey: ["playlists"],
    queryFn: () => api.get("/api/playlists"),
  });

  useEffect(() => {
    if (playlists.length > 0 && !selectedPlaylistId) {
      setSelectedPlaylistId(playlists[0].id);
    }
  }, [playlists, selectedPlaylistId]);

  const { data: scenes = [] } = useQuery<Scene[]>({
    queryKey: ["scenes", selectedPlaylistId],
    queryFn: () => api.get(`/api/playlists/${selectedPlaylistId}/scenes`),
    enabled: !!selectedPlaylistId,
  });

  useEffect(() => {
    if (scenes.length > 0 && !selectedSceneId) {
      setSelectedSceneId(scenes[0].id);
    }
  }, [scenes, selectedSceneId]);

  const { data: assets = [] } = useQuery<Asset[]>({
    queryKey: ["assets", selectedSceneId],
    queryFn: () => api.get(`/api/scenes/${selectedSceneId}/assets`),
    enabled: !!selectedSceneId,
  });

  const selectedScene = scenes.find((scene) => scene.id === selectedSceneId);
  const selectedPlaylist = playlists.find(
    (playlist) => playlist.id === selectedPlaylistId,
  );
  const selectedAsset = assets[0] ?? null;
  const selectedSceneIndex = scenes.findIndex(
    (scene) => scene.id === selectedSceneId,
  );
  const selectedSceneThumbnail =
    selectedScene && selectedSceneIndex >= 0
      ? buildSceneThumbnail(selectedScene.name, selectedSceneIndex)
      : previewPanorama;

  const seedMutation = useMutation({
    mutationFn: () => api.post("/api/seed", {}),
    onSuccess: () => invalidate(["playlists"]),
  });

  const createPlaylist = useMutation({
    mutationFn: (name: string) =>
      api.post("/api/playlists", { name, type: "playlist" }),
    onSuccess: () => invalidate(["playlists"]),
  });

  const createScene = useMutation({
    mutationFn: () =>
      api.post("/api/scenes", {
        playlistId: selectedPlaylistId,
        name: `Scene ${scenes.length + 1}`,
        sortOrder: scenes.length,
      }),
    onSuccess: () => invalidate(["scenes"]),
  });

  const updateScene = useMutation({
    mutationFn: ({ id, ...data }: { id: string } & Record<string, unknown>) =>
      api.patch(`/api/scenes/${id}`, data),
    onSuccess: () => invalidate(["scenes"]),
  });

  const deleteScene = useMutation({
    mutationFn: (id: string) => api.delete(`/api/scenes/${id}`),
    onSuccess: () => {
      invalidate(["scenes"], ["assets"]);
      if (selectedSceneId === deleteScene.variables) {
        setSelectedSceneId(null);
      }
    },
  });

  const deleteAsset = useMutation({
    mutationFn: (id: string) => api.delete(`/api/assets/${id}`),
    onSuccess: () => invalidate(["assets"]),
  });

  const updateAsset = useMutation({
    mutationFn: ({ id, ...data }: { id: string } & Record<string, unknown>) =>
      api.patch(`/api/assets/${id}`, data),
    onSuccess: () => invalidate(["assets"]),
  });

  useEffect(() => {
    if (!loadingPlaylists && playlists.length === 0) {
      seedMutation.mutate();
    }
  }, [loadingPlaylists, playlists.length, seedMutation]);

  const formatDate = (value: string | Date | null) => {
    if (!value) {
      return "-";
    }
    return new Date(value).toLocaleDateString();
  };

  const cycleSidebarTab = (direction: 1 | -1) => {
    const index = sidebarTabs.indexOf(activeSidebarTab);
    const nextIndex =
      (index + direction + sidebarTabs.length) % sidebarTabs.length;
    setActiveSidebarTab(sidebarTabs[nextIndex]);
  };

  const allPublishConsumersSelected = publishConsumerIds.every(
    (consumer) => publishConsumerCheckedState[consumer],
  );

  const togglePublishConsumer = (consumer: string, checked: boolean) => {
    setPublishConsumerCheckedState((previous) => ({
      ...previous,
      [consumer]: checked,
    }));
  };

  const toggleAllPublishConsumers = (checked: boolean) => {
    setPublishConsumerCheckedState(
      publishConsumerIds.reduce(
        (accumulator, consumer) => {
          accumulator[consumer] = checked;
          return accumulator;
        },
        {} as Record<string, boolean>,
      ),
    );
  };

  const openSettingsGallery = (slideIndex = 0) => {
    const normalizedIndex =
      ((slideIndex % settingsGallerySlides.length) +
        settingsGallerySlides.length) %
      settingsGallerySlides.length;
    setActiveSettingsSlideIndex(normalizedIndex);
    setIsSettingsGalleryOpen(true);
  };

  const openSettingsGalleryByLayout = (layout: SettingsGalleryLayout) => {
    const slideIndex = settingsGallerySlides.findIndex(
      (slide) => slide.layout === layout,
    );
    openSettingsGallery(slideIndex >= 0 ? slideIndex : 0);
  };

  const closeSettingsGallery = () => {
    setIsSettingsGalleryOpen(false);
  };

  const goToPreviousSettingsSlide = () => {
    setActiveSettingsSlideIndex((previous) =>
      (previous - 1 + settingsGallerySlides.length) %
      settingsGallerySlides.length,
    );
  };

  const goToNextSettingsSlide = () => {
    setActiveSettingsSlideIndex(
      (previous) => (previous + 1) % settingsGallerySlides.length,
    );
  };

  useEffect(() => {
    if (!isSettingsGalleryOpen) {
      return;
    }

    const handleKeyDown = (event: KeyboardEvent) => {
      if (event.key === "Escape") {
        closeSettingsGallery();
      } else if (event.key === "ArrowLeft") {
        goToPreviousSettingsSlide();
      } else if (event.key === "ArrowRight") {
        goToNextSettingsSlide();
      }
    };

    window.addEventListener("keydown", handleKeyDown);

    return () => {
      window.removeEventListener("keydown", handleKeyDown);
    };
  }, [isSettingsGalleryOpen]);

  const playlistCollections = [
    {
      id: "current-playlist",
      name: "Playlist 1",
      presentations: selectedPlaylist
        ? [selectedPlaylist]
        : playlists.slice(0, 1),
    },
    {
      id: "all-playlists",
      name: "All playlists",
      presentations: playlists,
    },
  ];

  const renderPlaylistCollections = () =>
    playlistCollections.map((collection) => {
      const isExpanded = expandedSidebarCollectionId === collection.id;
      const hasPresentations = collection.presentations.length > 0;

      return (
        <div
          key={collection.id}
          className="dashboard-sidebar__group dashboard-sidebar__group--playlist"
        >
          <div
            className={cx(
              "dashboard-playlist-row",
              "dashboard-playlist-row--playlist-tab",
              isExpanded && "is-selected",
            )}
            onClick={() =>
              setExpandedSidebarCollectionId(isExpanded ? "" : collection.id)
            }
          >
            <div className="dashboard-playlist-row__badge dashboard-playlist-row__badge--playlist">
              PL
            </div>
            <span className="dashboard-playlist-row__name">
              {collection.name}
            </span>

            <div className="dashboard-playlist-row__actions">
              <button
                type="button"
                className="dashboard-icon-button dashboard-icon-button--sidebar"
                onClick={(event) => event.stopPropagation()}
              >
                <Plus size={14} />
              </button>
              <button
                type="button"
                className="dashboard-icon-button dashboard-icon-button--sidebar"
                onClick={(event) => {
                  event.stopPropagation();
                  openSettingsGallery();
                }}
              >
                <Settings size={14} />
              </button>
              <input
                type="checkbox"
                className="dashboard-checkbox"
                checked={checkedPlaylists.has(collection.id)}
                onChange={() => {
                  setCheckedPlaylists((previous) => {
                    const next = new Set(previous);
                    if (next.has(collection.id)) {
                      next.delete(collection.id);
                    } else {
                      next.add(collection.id);
                    }
                    return next;
                  });
                }}
                onClick={(event) => event.stopPropagation()}
              />
              <span className="dashboard-playlist-row__caret dashboard-playlist-row__caret--dark">
                {isExpanded ? (
                  <ChevronUp size={16} />
                ) : (
                  <ChevronDown size={16} />
                )}
              </span>
            </div>
          </div>

          {isExpanded && (
            <div className="dashboard-sidebar__sublist dashboard-sidebar__sublist--playlist-tab">
              {hasPresentations ? (
                collection.presentations.map((presentation) => (
                  <div
                    key={`${collection.id}-${presentation.id}`}
                    className={cx(
                      "dashboard-scene-subrow",
                      "dashboard-scene-subrow--playlist-tab",
                      presentation.id === selectedPlaylistId && "is-selected",
                    )}
                    onClick={() => {
                      setSelectedPlaylistId(presentation.id);
                      setSelectedSceneId(null);
                    }}
                  >
                    <div className="dashboard-scene-subrow__badge dashboard-scene-subrow__badge--presentation">
                      P
                    </div>
                    <span className="dashboard-scene-subrow__name">
                      {presentation.name}
                    </span>
                    <div className="dashboard-scene-subrow__actions">
                      <button
                        type="button"
                        className="dashboard-icon-button dashboard-icon-button--sidebar dashboard-icon-button--small"
                        onClick={(event) => {
                          event.stopPropagation();
                          openSettingsGallery();
                        }}
                      >
                        <Settings size={12} />
                      </button>
                      <input
                        type="checkbox"
                        className="dashboard-checkbox"
                        checked={checkedScenes.has(presentation.id)}
                        onChange={() => {
                          setCheckedScenes((previous) => {
                            const next = new Set(previous);
                            if (next.has(presentation.id)) {
                              next.delete(presentation.id);
                            } else {
                              next.add(presentation.id);
                            }
                            return next;
                          });
                        }}
                        onClick={(event) => event.stopPropagation()}
                      />
                    </div>
                  </div>
                ))
              ) : (
                <div className="dashboard-sidebar-empty">No presentations</div>
              )}
            </div>
          )}
        </div>
      );
    });

  const renderPresentationRows = () =>
    playlists.map((playlist) => {
      const isSelected = playlist.id === selectedPlaylistId;
      const isExpanded = playlist.id === expandedPlaylistId;

      return (
        <div
          key={playlist.id}
          className="dashboard-sidebar__group dashboard-sidebar__group--presentation"
        >
          <div
            data-testid={`card-playlist-${playlist.id}`}
            className={cx(
              "dashboard-playlist-row",
              "dashboard-playlist-row--presentation-tab",
              isSelected && "is-selected",
            )}
            onClick={() => {
              setSelectedPlaylistId(playlist.id);
              setSelectedSceneId(null);
              setExpandedPlaylistId(isExpanded ? null : playlist.id);
            }}
          >
            <div className="dashboard-playlist-row__badge dashboard-playlist-row__badge--presentation">
              P
            </div>
            <span className="dashboard-playlist-row__name">
              {playlist.name}
            </span>

            <div className="dashboard-playlist-row__actions">
              <button
                type="button"
                className="dashboard-icon-button dashboard-icon-button--sidebar"
                onClick={(event) => {
                  event.stopPropagation();
                  openSettingsGallery();
                }}
              >
                <Settings size={14} />
              </button>
            </div>
          </div>

          {isExpanded && isSelected && (
            <div className="dashboard-sidebar__sublist">
              {scenes.map((scene) => (
                <div
                  key={scene.id}
                  className="dashboard-scene-subrow"
                  onClick={() => setSelectedSceneId(scene.id)}
                >
                  <div className="dashboard-scene-subrow__badge dashboard-scene-subrow__badge--scene">
                    S
                  </div>
                  <span className="dashboard-scene-subrow__name">
                    {scene.name}
                  </span>
                  <div className="dashboard-scene-subrow__actions">
                    <button
                      type="button"
                      className="dashboard-icon-button dashboard-icon-button--sidebar dashboard-icon-button--small"
                      onClick={(event) => {
                        event.stopPropagation();
                        openSettingsGallery();
                      }}
                    >
                      <Settings size={12} />
                    </button>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      );
    });

  const renderAssetRows = () => {
    if (assets.length === 0) {
      return (
        <div className="dashboard-sidebar-empty">No assets for this scene</div>
      );
    }

    return assets.map((asset) => (
      <div
        key={asset.id}
        className="dashboard-playlist-row dashboard-playlist-row--asset-tab"
      >
        <div className="dashboard-playlist-row__badge dashboard-playlist-row__badge--asset">
          A
        </div>
        <span className="dashboard-playlist-row__name">{asset.name}</span>
        <div className="dashboard-playlist-row__actions">
          <button
            type="button"
            className="dashboard-icon-button dashboard-icon-button--tool dashboard-icon-button--asset-info"
          >
            <Info size={30} />
          </button>
          <button
            type="button"
            className="dashboard-icon-button dashboard-icon-button--sidebar"
            onClick={() => openSettingsGallery()}
          >
            <Settings size={14} />
          </button>
        </div>
      </div>
    ));
  };

  const renderSidebarContent = () => {
    if (activeSidebarTab === "PLAYLISTS") {
      return renderPlaylistCollections();
    }

    if (activeSidebarTab === "PRESENTATIONS") {
      return renderPresentationRows();
    }

    return renderAssetRows();
  };

  const activeSettingsSlide = settingsGallerySlides[activeSettingsSlideIndex];

  return (
    <div className="dashboard-page">
      <header className="dashboard-header">
        <div className="dashboard-header__brand">
          <img
            src={logo}
            alt="VisionPort Logo"
            className="dashboard-header__logo"
          />
          <span className="dashboard-header__title">
            Content Management System
          </span>
        </div>

        <div className="dashboard-header__account">
          <span className="dashboard-header__flag">GB</span>
          <span className="dashboard-header__welcome">Welcome, galadmin</span>
          <button
            type="button"
            className="dashboard-icon-button dashboard-icon-button--ghost"
          >
            <ChevronRight size={16} />
          </button>
        </div>
      </header>

      <div className="dashboard-body">
        <PanelGroup direction="horizontal">
          <Panel
            defaultSize={20}
            minSize={15}
            maxSize={30}
            className="dashboard-sidebar"
          >
            <div className="dashboard-sidebar__search">
              <div className="dashboard-search-field">
                <span className="dashboard-search-field__label">
                  Sort / Filter
                </span>
                <ChevronDown
                  size={12}
                  className="dashboard-search-field__chevron"
                />
                <span className="dashboard-search-field__divider" />
                <input
                  type="text"
                  placeholder="Search"
                  className="dashboard-search-field__input"
                  data-testid="input-search-playlists"
                />
                <Search size={12} className="dashboard-search-field__icon" />
              </div>
            </div>

            <div className="dashboard-sidebar__tabs">
              <button
                type="button"
                className="dashboard-sidebar__tab-arrow"
                onClick={() => cycleSidebarTab(-1)}
              >
                <ChevronLeft size={18} />
              </button>

              <div className="dashboard-sidebar__tab-list">
                {sidebarTabs.map((tab) => (
                  <button
                    key={tab}
                    type="button"
                    className={cx(
                      "dashboard-sidebar__tab",
                      activeSidebarTab === tab && "is-active",
                    )}
                    onClick={() => setActiveSidebarTab(tab)}
                  >
                    {tab}
                  </button>
                ))}
              </div>

              <button
                type="button"
                className="dashboard-sidebar__tab-arrow"
                onClick={() => cycleSidebarTab(1)}
              >
                <ChevronRight size={18} />
              </button>
            </div>

            <div className="dashboard-sidebar__list dashboard-scrollbar">
              {renderSidebarContent()}
            </div>

            <div className="dashboard-sidebar__footer">
              <button
                type="button"
                data-testid="button-add-playlist"
                className={cx(
                  "dashboard-fab",
                  "dashboard-fab--sidebar",
                  activeSidebarTab === "PLAYLISTS" &&
                    "dashboard-fab--sidebar-playlists",
                  activeSidebarTab === "PRESENTATIONS" &&
                    "dashboard-fab--sidebar-presentations",
                  activeSidebarTab === "ASSETS" &&
                    "dashboard-fab--sidebar-assets",
                )}
                onClick={() =>
                  createPlaylist.mutate(`Playlist ${playlists.length + 1}`)
                }
              >
                <Plus size={20} />
              </button>
            </div>
          </Panel>

          <ResizeHandle />

          <Panel defaultSize={80} className="dashboard-main">
            <PanelGroup direction="vertical">
              <Panel defaultSize={40} minSize={20}>
                <PanelGroup direction="horizontal">
                  <Panel
                    defaultSize={30}
                    minSize={20}
                    className="dashboard-card dashboard-scenes"
                  >
                    <div className="dashboard-scenes__header">
                      <div className="dashboard-scenes__playlist">
                        <div className="dashboard-scenes__playlist-badge">
                          {selectedPlaylist?.name.charAt(0).toUpperCase() ||
                            "P"}
                        </div>
                        <span className="dashboard-scenes__playlist-name">
                          {selectedPlaylist?.name || "Select a playlist"}
                        </span>
                      </div>

                      <button
                        type="button"
                        className="dashboard-icon-button dashboard-icon-button--ghost dashboard-scenes__settings"
                        onClick={() =>
                          openSettingsGalleryByLayout("presentation-settings")
                        }
                      >
                        <Settings size={16} />
                      </button>
                    </div>

                    <div className="dashboard-scenes__title">Scenes List</div>

                    <div className="dashboard-scenes__list dashboard-scrollbar">
                      {scenes.map((scene, index) => (
                        <div
                          key={scene.id}
                          data-testid={`card-scene-${scene.id}`}
                          className={cx(
                            "dashboard-scene-row",
                            scene.id === selectedSceneId && "is-selected",
                          )}
                          onClick={() => setSelectedSceneId(scene.id)}
                        >
                          <div className="dashboard-scene-row__thumb">S</div>
                          <div className="dashboard-scene-row__body">
                            <div className="dashboard-scene-row__name">
                              {index + 1}. {scene.name}
                            </div>
                            {scene.duration && (
                              <div className="dashboard-scene-row__duration">
                                {scene.duration}s
                              </div>
                            )}
                          </div>
                          <input
                            type="checkbox"
                            className="dashboard-checkbox"
                            defaultChecked={index % 3 === 0}
                            onClick={(event) => event.stopPropagation()}
                          />
                        </div>
                      ))}
                    </div>

                    {selectedPlaylistId && (
                      <div className="dashboard-scenes__footer">
                        <button
                          type="button"
                          data-testid="button-add-scene"
                          className="dashboard-fab dashboard-fab--primary"
                          onClick={() => createScene.mutate()}
                        >
                          <Plus size={20} />
                        </button>
                      </div>
                    )}
                  </Panel>

                  <ResizeHandle />

                  <Panel
                    defaultSize={70}
                    className="dashboard-card dashboard-preview"
                  >
                    <div className="dashboard-preview__frame">
                      <img
                        src={previewPanorama}
                        alt="Panorama preview"
                        className="dashboard-preview__image"
                      />
                      <button
                        type="button"
                        className="dashboard-icon-button dashboard-icon-button--preview"
                      >
                        <Maximize2 size={16} />
                      </button>
                    </div>
                  </Panel>
                </PanelGroup>
              </Panel>

              <HorizontalResizeHandle />

              <Panel
                defaultSize={60}
                minSize={30}
                className="dashboard-main__bottom"
              >
                <div className="dashboard-toolbar">
                  <h3 className="dashboard-toolbar__title">Scene Details</h3>

                  <button
                    type="button"
                    data-testid="button-save-scene"
                    className="dashboard-button dashboard-button--save"
                    disabled={!selectedScene}
                  >
                    SAVE
                  </button>

                  <div className="dashboard-toolbar__actions">
                    <button
                      type="button"
                      className="dashboard-icon-button dashboard-icon-button--toolbar"
                    >
                      <Copy size={22} />
                    </button>
                    <button
                      type="button"
                      className="dashboard-icon-button dashboard-icon-button--toolbar"
                    >
                      <ArrowDownUp size={22} />
                    </button>
                    {selectedScene && (
                      <button
                        type="button"
                        data-testid="button-delete-scene"
                        className="dashboard-icon-button dashboard-icon-button--toolbar dashboard-icon-button--danger"
                        onClick={() => deleteScene.mutate(selectedScene.id)}
                      >
                        <Trash2 size={22} />
                      </button>
                    )}
                    <button
                      type="button"
                      className="dashboard-icon-button dashboard-icon-button--toolbar dashboard-icon-button--inactive"
                    >
                      <Folder size={22} />
                    </button>
                  </div>
                </div>

                <div className="dashboard-detail-grid dashboard-scrollbar">
                  <section className="dashboard-detail-card dashboard-detail-card--info">
                    <div className="dashboard-detail-card__header dashboard-detail-card__header--accent">
                      Scene Info
                    </div>

                    <div className="dashboard-detail-card__body dashboard-scene-info dashboard-scrollbar">
                      <div className="dashboard-scene-info__top">
                        <div className="dashboard-scene-info__thumbnail">S</div>
                      </div>

                      <div className="dashboard-scene-info__form">
                        <div className="dashboard-form-grid">
                          <div className="dashboard-field">
                            <label
                              className="dashboard-field__label"
                              htmlFor="scene-name"
                            >
                              Scene Name
                            </label>
                            <input
                              id="scene-name"
                              data-testid="input-scene-name"
                              value={selectedScene?.name || ""}
                              onChange={(event) =>
                                selectedScene &&
                                updateScene.mutate({
                                  id: selectedScene.id,
                                  name: event.target.value,
                                })
                              }
                              className="dashboard-input"
                            />
                          </div>

                          <div className="dashboard-field">
                            <label
                              className="dashboard-field__label"
                              htmlFor="scene-type"
                            >
                              Scene Type
                            </label>
                            <select
                              id="scene-type"
                              data-testid="select-scene-type"
                              value={selectedScene?.sceneType || "Google Earth"}
                              onChange={(event) =>
                                selectedScene &&
                                updateScene.mutate({
                                  id: selectedScene.id,
                                  sceneType: event.target.value,
                                })
                              }
                              className="dashboard-input dashboard-select"
                            >
                              <option>Google Earth</option>
                              <option>Panorama</option>
                              <option>Street View</option>
                            </select>
                          </div>

                          <div className="dashboard-field">
                            <label
                              className="dashboard-field__label"
                              htmlFor="scene-description"
                            >
                              Description
                            </label>
                            <input
                              id="scene-description"
                              data-testid="input-scene-description"
                              value={selectedScene?.description || ""}
                              onChange={(event) =>
                                selectedScene &&
                                updateScene.mutate({
                                  id: selectedScene.id,
                                  description: event.target.value,
                                })
                              }
                              placeholder="Description"
                              className="dashboard-input"
                            />
                          </div>

                          <div className="dashboard-field">
                            <div className="dashboard-field__label dashboard-field__label--inline">
                              Duration
                              <Info size={16} />
                            </div>

                            <div className="dashboard-duration">
                              <button
                                type="button"
                                className="dashboard-radio"
                                onClick={() =>
                                  selectedScene &&
                                  updateScene.mutate({
                                    id: selectedScene.id,
                                    duration: null,
                                  })
                                }
                              >
                                <span
                                  className={cx(
                                    "dashboard-radio__mark",
                                    !selectedScene?.duration && "is-active",
                                  )}
                                />
                                <span>Indefinite</span>
                              </button>

                              <button
                                type="button"
                                className="dashboard-radio"
                                onClick={() =>
                                  selectedScene &&
                                  updateScene.mutate({
                                    id: selectedScene.id,
                                    duration: selectedScene.duration || 15,
                                  })
                                }
                              >
                                <span
                                  className={cx(
                                    "dashboard-radio__mark",
                                    !!selectedScene?.duration && "is-active",
                                  )}
                                />
                                <span>Timed</span>
                              </button>

                              <input
                                data-testid="input-scene-duration"
                                className="dashboard-input dashboard-input--small"
                                value={selectedScene?.duration || ""}
                                onChange={(event) =>
                                  selectedScene &&
                                  updateScene.mutate({
                                    id: selectedScene.id,
                                    duration:
                                      parseInt(event.target.value, 10) || null,
                                  })
                                }
                              />
                              <span className="dashboard-duration__unit">
                                sec
                              </span>
                            </div>
                          </div>
                        </div>
                      </div>

                      <div className="dashboard-meta">
                        <div>
                          <span>Created:</span>{" "}
                          {formatDate(selectedScene?.createdAt ?? null)}
                        </div>
                        <div>
                          <span>By:</span> {selectedScene?.createdBy || "-"}
                        </div>
                        <div>
                          <span>Modified:</span>{" "}
                          {formatDate(selectedScene?.updatedAt ?? null)}
                        </div>
                      </div>
                    </div>
                  </section>

                  <section className="dashboard-detail-card">
                    <div className="dashboard-detail-card__header">
                      Location Google Earth
                    </div>

                    <div className="dashboard-detail-card__body dashboard-location dashboard-scrollbar">
                      <div className="dashboard-location__card">
                        <div className="dashboard-location__badge">
                          <span className="dashboard-location__badge-letter">
                            A
                          </span>
                        </div>
                        <div className="dashboard-location__content">
                          <div>Captured LG Location</div>
                        </div>
                        <div className="dashboard-location__icons">
                          <button
                            type="button"
                            className="dashboard-icon-button dashboard-icon-button--tool dashboard-icon-button--asset-info"
                          >
                            <Info size={36} />
                          </button>
                          <button
                            type="button"
                            className="dashboard-icon-button dashboard-icon-button--playlist-settings"
                            onClick={() =>
                              openSettingsGalleryByLayout("asset-settings")
                            }
                          >
                            <Settings size={16} />
                          </button>
                        </div>
                      </div>

                      <div className="dashboard-stack-buttons">
                        <button
                          type="button"
                          className="dashboard-button dashboard-button--primary"
                        >
                          CAPTURE NEW LOCATION
                        </button>
                        <button
                          type="button"
                          className="dashboard-button dashboard-button--danger"
                        >
                          REMOVE LOCATION
                        </button>
                      </div>
                    </div>
                  </section>

                  <section className="dashboard-detail-card">
                    <div className="dashboard-detail-card__header">Assets</div>

                    <div className="dashboard-detail-card__body dashboard-assets dashboard-scrollbar">
                      <div className="dashboard-assets__label">
                        Geographic Data (disabled in&nbsp;preview)
                      </div>

                      {assets.map((asset) => (
                        <div
                          key={asset.id}
                          data-testid={`card-asset-${asset.id}`}
                          className="dashboard-asset-row"
                        >
                          <div className="dashboard-asset-row__main">
                            <img
                              src={previewPanorama}
                              alt="Asset"
                              className="dashboard-asset-row__thumb"
                            />
                            <span className="dashboard-asset-row__name">
                              {asset.name}
                            </span>
                          </div>

                          <div className="dashboard-asset-row__actions">
                            <button
                              type="button"
                              className="dashboard-icon-button dashboard-icon-button--tool dashboard-icon-button--asset-info"
                            >
                              <Info size={36} />
                            </button>
                            <button
                              type="button"
                              className="dashboard-icon-button dashboard-icon-button--playlist-settings"
                              onClick={() =>
                                openSettingsGalleryByLayout("playlist-settings")
                              }
                            >
                              <Settings size={14} />
                            </button>
                            <button
                              type="button"
                              data-testid={`button-delete-asset-${asset.id}`}
                              className="dashboard-icon-button dashboard-icon-button--tool"
                              onClick={() => deleteAsset.mutate(asset.id)}
                            >
                              <X size={14} />
                            </button>
                          </div>
                        </div>
                      ))}

                      {assets.length === 0 && (
                        <div className="dashboard-empty-state">No assets</div>
                      )}
                    </div>
                  </section>

                  <section className="dashboard-detail-card">
                    <div className="dashboard-detail-card__header">
                      Asset Positioning
                    </div>

                    <div className="dashboard-detail-card__body dashboard-positioning dashboard-scrollbar">
                      <div className="dashboard-positioning__toolbar">
                        {[
                          <Shrink key="shrink" size={16} />,
                          <AlignVerticalJustifyCenter key="align" size={16} />,
                          <RectangleHorizontal key="horizontal" size={16} />,
                          <RectangleVertical key="vertical" size={16} />,
                          <ImageIcon key="image" size={16} />,
                          <Maximize key="maximize" size={16} />,
                        ].map((icon, index) => (
                          <button
                            key={index}
                            type="button"
                            className="dashboard-icon-button dashboard-icon-button--position"
                          >
                            {icon}
                          </button>
                        ))}
                      </div>

                      <div className="dashboard-positioning__panel">
                        <div className="dashboard-positioning__section-title">
                          Asset Position
                        </div>

                        <div className="dashboard-unit-grid">
                          <div className="dashboard-field">
                            <label
                              className="dashboard-field__label dashboard-field__label--center"
                              htmlFor="asset-x"
                            >
                              X position
                            </label>
                            <div className="dashboard-unit-input">
                              <input
                                id="asset-x"
                                data-testid="input-asset-x"
                                value={selectedAsset?.posX ?? 0}
                                onChange={(event) =>
                                  selectedAsset &&
                                  updateAsset.mutate({
                                    id: selectedAsset.id,
                                    posX: parseInt(event.target.value, 10) || 0,
                                  })
                                }
                                className="dashboard-input dashboard-input--unit"
                              />
                              <span className="dashboard-unit-input__suffix">
                                px
                              </span>
                            </div>
                          </div>

                          <div className="dashboard-field">
                            <label
                              className="dashboard-field__label dashboard-field__label--center"
                              htmlFor="asset-y"
                            >
                              Y position
                            </label>
                            <div className="dashboard-unit-input">
                              <input
                                id="asset-y"
                                data-testid="input-asset-y"
                                value={selectedAsset?.posY ?? 0}
                                onChange={(event) =>
                                  selectedAsset &&
                                  updateAsset.mutate({
                                    id: selectedAsset.id,
                                    posY: parseInt(event.target.value, 10) || 0,
                                  })
                                }
                                className="dashboard-input dashboard-input--unit"
                              />
                              <span className="dashboard-unit-input__suffix">
                                px
                              </span>
                            </div>
                          </div>
                        </div>

                        <div className="dashboard-positioning__section-title dashboard-positioning__section-title--spaced">
                          Asset Size
                          <span className="dashboard-positioning__section-note">
                            (Original: {selectedAsset?.width || 7560}px by{" "}
                            {selectedAsset?.height || 1920}px)
                          </span>
                        </div>

                        <div className="dashboard-unit-grid">
                          <div className="dashboard-field">
                            <label
                              className="dashboard-field__label dashboard-field__label--center"
                              htmlFor="asset-width"
                            >
                              Width
                            </label>
                            <div className="dashboard-unit-input">
                              <input
                                id="asset-width"
                                data-testid="input-asset-width"
                                value={selectedAsset?.width ?? 7560}
                                onChange={(event) =>
                                  selectedAsset &&
                                  updateAsset.mutate({
                                    id: selectedAsset.id,
                                    width:
                                      parseInt(event.target.value, 10) || 0,
                                  })
                                }
                                className="dashboard-input dashboard-input--unit"
                              />
                              <span className="dashboard-unit-input__suffix">
                                px
                              </span>
                            </div>
                          </div>

                          <div className="dashboard-field">
                            <label
                              className="dashboard-field__label dashboard-field__label--center"
                              htmlFor="asset-height"
                            >
                              Height
                            </label>
                            <div className="dashboard-unit-input">
                              <input
                                id="asset-height"
                                data-testid="input-asset-height"
                                value={selectedAsset?.height ?? 1920}
                                onChange={(event) =>
                                  selectedAsset &&
                                  updateAsset.mutate({
                                    id: selectedAsset.id,
                                    height:
                                      parseInt(event.target.value, 10) || 0,
                                  })
                                }
                                className="dashboard-input dashboard-input--unit"
                              />
                              <span className="dashboard-unit-input__suffix">
                                px
                              </span>
                            </div>
                          </div>
                        </div>

                        <label className="dashboard-transparency">
                          <input
                            type="checkbox"
                            className="dashboard-checkbox"
                            checked={selectedAsset?.hasTransparency || false}
                            onChange={() =>
                              selectedAsset &&
                              updateAsset.mutate({
                                id: selectedAsset.id,
                                hasTransparency: !selectedAsset.hasTransparency,
                              })
                            }
                          />
                          <span>Image contains transparency</span>
                        </label>
                      </div>
                    </div>
                  </section>
                </div>
              </Panel>
            </PanelGroup>
          </Panel>
        </PanelGroup>
      </div>

      {isSettingsGalleryOpen && (
        <div className="settings-gallery-overlay" onClick={closeSettingsGallery}>
          <button
            type="button"
            className="settings-gallery-overlay__arrow settings-gallery-overlay__arrow--left"
            aria-label="Previous settings slide"
            onClick={(event) => {
              event.stopPropagation();
              goToPreviousSettingsSlide();
            }}
          >
            <ChevronLeft size={34} />
          </button>

          <div
            className="settings-gallery-overlay__content"
            onClick={(event) => event.stopPropagation()}
          >
            <div className="settings-gallery-modal">
              <div className="settings-gallery-modal__header">
                <h2>{activeSettingsSlide.modalTitle}</h2>
                <button
                  type="button"
                  className="settings-gallery-modal__close"
                  aria-label="Close settings gallery"
                  onClick={closeSettingsGallery}
                >
                  <X size={28} />
                </button>
              </div>

              <div className="settings-gallery-modal__body dashboard-scrollbar">
                {renderSettingsGallerySlide(activeSettingsSlide.layout, {
                  publishConsumers: {
                    checked: publishConsumerCheckedState,
                    allSelected: allPublishConsumersSelected,
                    onToggleAll: toggleAllPublishConsumers,
                    onToggleConsumer: togglePublishConsumer,
                  },
                })}
              </div>
            </div>

            <div className="settings-gallery-overlay__counter">
              {activeSettingsSlideIndex + 1} / {settingsGallerySlides.length}
            </div>
          </div>

          <button
            type="button"
            className="settings-gallery-overlay__arrow settings-gallery-overlay__arrow--right"
            aria-label="Next settings slide"
            onClick={(event) => {
              event.stopPropagation();
              goToNextSettingsSlide();
            }}
          >
            <ChevronRight size={34} />
          </button>
        </div>
      )}
    </div>
  );
}
