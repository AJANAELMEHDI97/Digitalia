# SocialPulse

Application SocialPulse avec frontend React/Vite, API Express, PostgreSQL et Docker.

## Stack

- Frontend via Nginx: `http://localhost:8080`
- API Express: `http://localhost:4000`
- PostgreSQL: base `socialpulse`

## Lancement

```bash
docker compose up --build -d
```

## Comptes de demo

- `nassimelhattabi@gmail.com / Nassima123`

## Configuration

Copie `.env.example` vers `.env` pour personnaliser la configuration.

Variables importantes:

- `FRONTEND_URL` et `API_PUBLIC_URL` pour les callbacks OAuth
- `LINKEDIN_CLIENT_ID` / `LINKEDIN_CLIENT_SECRET`
- `META_CLIENT_ID` / `META_CLIENT_SECRET`
- `GOOGLE_CLIENT_ID` / `GOOGLE_CLIENT_SECRET`
- `SOCIALPULSE_AI_API_KEY` / `SOCIALPULSE_AI_GATEWAY_URL` pour les fonctions IA Supabase du zip

Sans credentials OAuth, les integrations sociales restent visibles dans l'interface mais renvoient une erreur HTTP `400` claire au lieu de faire tomber l'API.
