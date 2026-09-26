# FoodRecipes - Admin and User Modules

## Modules
1. Admin Module: add, edit, delete and search recipes; view registered users.
2. User Module: browse, search, filter, save/favorite and share recipes.

## Admin login
Email: admin@foodrecipes.com
Password: admin123

## Run
Open `index.html` in a browser. Register a user from Register, then login as User.
For administration, use the demo Admin credentials above.

Data is stored in browser localStorage, so this is a frontend demonstration project.

## Gulab Jamun removed
The Gulab Jamun recipe has been removed from the project source.
If it still appears in an already-open browser, clear the old `recipes` localStorage data
for this project (or use the browser's site data/clear storage option) and reload.

## Admin login with registered account
The Admin login now accepts the same email and password used during User registration.
The built-in demo admin credentials continue to work.
This is a frontend/localStorage demonstration; in a production system, admin privileges should be controlled by a backend role/permission system.
