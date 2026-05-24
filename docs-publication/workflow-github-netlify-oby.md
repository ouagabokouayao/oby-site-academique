# Workflow GitHub / Netlify — OBY

## Principe

Le site OBY est désormais géré comme un site statique versionné avec Git, publié via GitHub et Netlify.

Le glisser-déposer Netlify ne doit plus être utilisé, sauf urgence exceptionnelle.

## Étapes recommandées

1. Modifier localement les fichiers du site dans `site-oby/`.
2. Vérifier les pages en local avec un serveur statique :

```bash
python3 -m http.server 8017
```

3. Ouvrir le site local :

```text
http://127.0.0.1:8017/
```

4. Vérifier :
   - pages principales ;
   - liens internes ;
   - assets ;
   - CV public ;
   - responsive mobile ;
   - absence de données sensibles ;
   - cohérence de l'identité OBY.

5. Contrôler Git :

```bash
git status --short
```

6. Ajouter les fichiers publics modifiés :

```bash
git add .
```

7. Créer un commit clair :

```bash
git commit -m "Describe the OBY update"
```

8. Pousser vers GitHub :

```bash
git push
```

9. Vérifier que Netlify déploie automatiquement depuis GitHub.

10. Ouvrir le site public :

```text
https://sweet-hummingbird-fbab70.netlify.app/
```

## Règles de sécurité

- Ne pas ajouter le CV standard brut.
- Ne pas ajouter de sources privées.
- Ne pas ajouter `docs/sources/`, `backups/`, `exports/`, anciens ZIP ou fichiers de travail.
- Ne pas écrire de token, mot de passe ou secret dans un fichier.
- Ne pas publier de données personnelles sensibles.

## Après achat du domaine

Mettre à jour :

- canonical ;
- sitemap ;
- robots ;
- Open Graph URL ;
- URL Netlify / domaine principal ;
- mentions légales si nécessaire.
