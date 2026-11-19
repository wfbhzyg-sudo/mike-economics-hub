# Notebook home

The authenticated home is desk.html. Login uses desk-login.html and the existing auth form controller. The static list is immediately actionable, including when WebGL 2 is unavailable. `/?view=list` opens the previous gallery. Set `NOTEBOOK_HOME_ENABLED=0` on the unified Portal to serve its previous homepage and login on the same routes.

Run `npm install` and `npm run build` in this directory to rebuild the versioned scene in `assets/notebook/`. Update the references and static allowlist when its public asset version changes. The generated scene includes Three.js and the material textures. Three.js licensing is in this directory and in the bundle.

Keep destination addresses in the existing apps.js configuration. catalog.js maps existing cards to fixed slots and appends configured additions in sets of four. The teacher card relies on the existing session permission and the destination route enforces it. Location transitions use the actual destination URL. The only prefetch paths are public notebook assets and the existing static workbench styles. The portal stores a short-lived animation timestamp and the current history pick locally.

The notebook provides a visual enhancement. Its client state has no persistence dependency on account, homework or grade tables.
