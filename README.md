# Notification-Service

Ce projet implémente un **service de notifications** en **Node.js**, **Express** et **TypeScript**.  
Il gère deux fonctionnalités principales :

- La génération et la vérification d’OTP (codes à usage unique).
- L’envoi de notifications (par e-mail,SMS ou autres canaux).

---

## Fonctionnalités principales

- Génération et validation d’OTP avec expiration automatique.
- Envoi de notifications personnalisées via des templates.
- Architecture modulaire : contrôleurs, services, entités, utilitaires.

---

# Endpoints

Tous les endpoints sont accessibles sous :<br>
/api/notifications

## Fonctionnalités principales

- Génération et validation d’OTP avec expiration automatique.
- Envoi de notifications personnalisées via des templates.
- Intégration RabbitMQ : consommation d’événements de `wallet-service` (dépôt, retrait, transfert, OTP…) et transformation en notifications.
- Validation stricte des payloads HTTP avec **Zod** (emails et téléphones obligatoires, structure `transfer` dédiée, etc.).

---

## Endpoints HTTP

Tous les endpoints HTTP exposés par ce service sont préfixés par :

- `/api/notifications`

### 1. Envoi d’une notification (HTTP direct)

`POST /api/notifications/envoyer`

Depuis la refonte, le service est **strictement dépendant des coordonnées fournies dans le JSON**. Deux formes sont possibles :

#### a) Notification de transfert

```json
{
  "type": "transfer",
  "sender": {
    "email": "expediteur@mail.com",
    "phone": "+22300000000"
  },
  "receiver": {
    "email": "destinataire@mail.com",
    "phone": "+22311111111"
  },
  "amount": 5000,
  "content": "Transfert de 5000 FCFA réussi."
}
```

- Le schéma Zod impose :
  - `type` = `"transfer"`.
  - `sender.email` / `sender.phone` obligatoires.
  # Notification-Service

  Service de notifications (e-mail & SMS & OTP) développé en Node.js, Express et TypeScript.

  Ce README décrit l'installation, la configuration, les endpoints, les variables d'environnement et les bonnes pratiques pour déployer et tester le service.

  Table des matières
  - Présentation
  - Prérequis
  - Installation
  - Variables d'environnement
  - Commandes utiles
  - Endpoints et exemples
  - Health checks
  - Docker / Compose
  - Débogage et logs
  - Notes de sécurité

  ---

  Présentation
  ------------
  Ce service reçoit des requêtes HTTP pour envoyer des notifications et générer/vérifier des OTP. Il s'intègre avec :
  - PostgreSQL (TypeORM)
  - RabbitMQ (échange partagé, queue privée)
  - Twilio (SMS)
  - Nodemailer (e-mail)

  Le code organise les responsabilités en contrôleurs, services, entités, utilitaires et messaging (publisher/consumer).

  Prérequis
  ---------
  - Node.js >= 18
  - npm
  - PostgreSQL accessible (ou instance locale)
  - RabbitMQ accessible (ou instance locale)
  - Compte Twilio (si SMS en production) ou configuration de mock
  - Compte e-mail (Gmail ou SMTP compatible) pour envoi d'e-mails

  Installation
  ------------
  1. Cloner le dépôt et positionnez-vous dans le dossier du service :

  ```bash
  cd notification_service
  ```

  2. Installer les dépendances :

  ```bash
  npm install
  ```

  3. Compiler TypeScript :

  ```bash
  npm run build
  ```

  4. Lancer en développement (reload automatique) :

  ```bash
  npm run dev
  ```

  Variables d'environnement
  ------------------------
  Les variables attendues par le service (fichier `.env` recommandé) :

  - SERVICE_PORT: port d'écoute HTTP (ex: 8000)
  - SERVICE_VERSION: version déployée (optionnel)
  - COMMIT_SHA: sha du commit déployé (optionnel)

  - PostgreSQL:
    - DB_HOST
    - DB_PORT (par défaut 5432)
    - DB_USER
    - DB_PASSWORD
    - DB_NAME

  - RabbitMQ:
    - RABBITMQ_URL (ex: amqp://user:pass@host:5672)
    - RABBITMQ_EXCHANGE (nom de l'exchange partagé)
    - RABBITMQ_QUEUE (nom de la queue principale pour ce service)

  - Twilio (si SMS) :
    - TWILIO_ACCOUNT_SID
    - TWILIO_AUTH_TOKEN
    - TWILIO_PHONE_NUMBER

  - E-mail (Nodemailer) :
    - MAIL_USER
    - MAIL_PASS

  - Health / diagnostics (optionnel) :
    - HEALTH_CHECK_TIMEOUT_MS (ms, défaut 1000)
    - HEALTH_CACHE_TTL_MS (ms, défaut 5000)
    - HEALTH_EXPOSE_ERRORS (true|false, défaut false)

  Commandes utiles
  ----------------
  - `npm run dev` — démarre avec `ts-node-dev` (dev hot-reload)
  - `npm run build` — compile TypeScript vers `dist/`
  - `npm start` — exécute `node src/server.ts` (production si compilé)

  Endpoints et exemples
  ---------------------
  Base URL: `http://{host}:{SERVICE_PORT}`

  Health
  - `GET /health` — liveness minimal (retourne OK + uptime)
  - `GET /health/ready` — readiness : vérifie PostgreSQL et RabbitMQ, retourne 200 ou 503. Réponse contient `components.db` et `components.rabbitmq`.

  Notifications
  - `POST /api/notifications/envoyer` — envoie une notification.
    - Corps possible (exemples) :

      Transfer (expéditeur + destinataire envoyés sur SMS + email si fournis) :

      ```json
      {
        "type": "transfer",
        "sender": { "email": "a@ex.com", "phone": "+223xxxxxxxx" },
        "receiver": { "email": "b@ex.com", "phone": "+223yyyyyyyy" },
        "amount": 10000,
        "content": "Votre transfert de 10000 F CFA a été effectué"
      }
      ```

      Simple notification :

      ```json
      {
        "type": "alert_securite",
        "user": { "email": "u@ex.com", "phone": "+223zzzzzzzz" },
        "content": "Un événement important a eu lieu"
      }
      ```

    - Réponse : `201` + objet décrivant les enregistrements créés (sms / email)

  - `POST /api/notifications/rabbitmq` — endpoint de test qui publie un message sur RabbitMQ (routingKey/message dans body)

  OTP
  - `POST /api/notifications/otp/generate` — génère un OTP
    - Body example:
      ```json
      { "utilisateurId": "user-123", "canalNotification": "SMS", "phone": "+223..." }
      ```

  - `POST /api/notifications/otp/verify` — vérifie un OTP
    - Body example:
      ```json
      { "utilisateurId": "user-123", "code": "1234" }
      ```

  Health checks (détails)
  -----------------------
  - `/health` est une probe de liveness simple, utile pour Kubernetes readiness/liveness probes basiques.
  - `/health/ready` exécute des vérifications actives :
    - exécute `SELECT 1` sur PostgreSQL (avec timeout configurable)
    - vérifie que le channel RabbitMQ est initialisé
    - met en cache le résultat pendant `HEALTH_CACHE_TTL_MS` pour limiter la charge
    - renvoie `version` et `commit` si disponibles

  Docker / Compose
  -----------------
  Le repo contient un `Dockerfile` et un `docker-compose.yml` :

  Construction :

  ```bash
  docker build -t ricash/notification-service:latest .
  ```

  Compose (exemple très simple) :

  ```yaml
  version: '3.8'
  services:
    notification-service:
      image: ricash/notification-service:latest
      env_file: .env
      ports:
        - "8000:8000"
      depends_on:
        - db
        - rabbitmq

    db:
      image: postgres:15
      environment:
        POSTGRES_USER: example
        POSTGRES_PASSWORD: example
        POSTGRES_DB: ricash

    rabbitmq:
      image: rabbitmq:3-management
      ports:
        - "5672:5672"
        - "15672:15672"
  ```

  Débogage et logs
  ---------------
  - Les logs sont écrits sur stdout.
  - Vérifier les erreurs de connexion à RabbitMQ et PostgreSQL au démarrage.
  - En cas d'erreurs d'envoi SMS/Email, les exceptions sont loggées et le statut de la notification est mis à `ECHEC`.

  Sécurité et bonnes pratiques
  ---------------------------
  - Ne pas exposer `HEALTH_EXPOSE_ERRORS=true` en production si les messages d'erreur contiennent des données sensibles.
  - Utiliser des secrets manager pour les identifiants (DB, Twilio, MAIL_PASS).
  - Désactiver `synchronize: true` (TypeORM) en production et utiliser des migrations contrôlées.

  Contribution
  ------------
  Pour proposer des améliorations :
  1. Créer une branche feature
  2. Ajouter tests / valider localement
  3. Ouvrir une Pull Request vers `develop`

  Support
  -------
  Si tu veux, je peux :
  - ajouter des exemples Postman
  - créer un `docker-compose.dev.yml` complet pour démarrer la stack locale
  - ajouter des tests unitaires pour `NotificationService` / `OtpService`

  ---

  Fait avec ❤️ — Notification-Service

