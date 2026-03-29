# SocialPulse.pro

Reconstruction du projet SocialPulse avec front, back, PostgreSQL et Docker.

## Stack

- Frontend servi par Nginx sur `http://localhost:8080`
- API Express sur `http://localhost:4000`
- Base PostgreSQL `socialpulse`

## Lancement

```bash
docker compose up --build -d
```

## Comptes de démo

- `admin@socialpulse.local / demo1234`
- `editor@socialpulse.local / demo1234`
- `reader@socialpulse.local / demo1234`

## Variables utiles

Copie `.env.example` vers `.env` si tu veux repartir avec une configuration propre.

## Sauvegardes récupérées

- Schéma SQL restauré : `database/init.sql`
- Sauvegarde complète : `database/backup.sql`
- Artefacts récupérés : `recovery/`

## Note de reconstruction

Le backend a été reconstruit à partir des artefacts de build récupérés.
Le frontend restauré correspond à la dernière version buildée sauvée dans Docker.
