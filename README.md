# RecipeHub

RecipeHub is a React and Vite recipe app. Visitors can browse recipes without an account. Saving, sharing, rating, submitting recipes, and posting comments require login. A small Node.js server stores comments shared across users and enforces administrator-only comment deletion.

## Run locally

1. Install Node.js 20.19+ or 22.12+.
2. In this folder, run `npm install`.
3. In one terminal, run `npm run server`.
4. In a second terminal, run `npm run dev` and open the local URL Vite prints.

Vite forwards `/api` requests to the server on port 3001. For a production build, run `npm run build` and then `npm start`; the Node server serves the built app and API on port 3001. Set `PORT` to choose another port. Set `ADMIN_EMAIL` and `ADMIN_PASSWORD` before starting the server to change the administrator credentials. The included defaults are `navadeep292@gmail.com` and `mani240`.

## Comments and permissions

Comments are stored in `data/comments.json` on the server and are shared by every browser connected to that same running deployment. Visitors can read recipe comments; signed-in users can post them. The admin dashboard has a **Manage Comments** section. Deleting a comment requires a server-issued administrator session; the comment deletion API rejects requests without it.

For a multi-instance or public production deployment, place the app behind HTTPS and use a shared database and durable session storage. The included JSON file and in-memory admin sessions are intended for a single-server deployment.

## Other features

- Recipe categories, recipe details, and supplied images.
- User registration and login, stored in the browser's Local Storage.
- Recipe submissions and administrator approval/rejection.
- Recipe ratings, saved recipes, and recipe sharing.
- Administrator recipe management.

User accounts, ratings, saved recipes, and recipe submissions remain browser-local in this project. Shared comments are the feature backed by the server.
