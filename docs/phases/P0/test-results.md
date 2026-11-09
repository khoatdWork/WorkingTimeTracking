# P0 tests

- npm install/npm ci lockfile: installed; npm ci còn được chạy CI.
- npm run lint: PASS, no warnings ở lần cuối trước deploy.
- npm run typecheck: PASS.
- npm run build với /WorkingTimeTracking: PASS static export.
- npm audit --omit=dev: PASS, 0 vulnerabilities sau override grpc-js1.14.7. Development tooling còn 26 advisory low/moderate từ firebase-tools/shadcn/eslint transitive; không nằm trong static browser bundle. Không downgrade major theo audit --force.
