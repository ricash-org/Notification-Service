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
  - `receiver.email` / `receiver.phone` obligatoires.
  - `amount > 0`.
  - `content` non vide.
- Le service crée **deux paires de notifications** (SMS + EMAIL) :
  - Pour l’expéditeur (role = `SENDER`).
  - Pour le destinataire (role = `RECEIVER`).
- Les messages sont envoyés :
  - par SMS via Twilio sur `phone`.
  - par email via `mailService.sendEmail` sur `email`.
- Le `context` des entités `Notification` contient notamment `montant` et `role`.

#### b) Notification simple (autres types)

```json
{
  "type": "ALERT_SECURITE",
  "user": {
    "email": "client@mail.com",
    "phone": "+22322222222"
  },
  "content": "Connexion suspecte détectée."
}
```

- `type` peut être l’une des valeurs de `TypeNotification` (sauf `"transfer"` qui utilise le schéma dédié).
- `user.email` et `user.phone` sont obligatoires.
- Le service envoie systématiquement la notification **à la fois par SMS et par email**.

En cas de JSON invalide (champ manquant / mauvais type), le contrôleur renvoie :

```json
{
  "success": false,
  "message": "Corps de requête invalide",
  "errors": { ...détail Zod... }
}
```

### 2. Génération d’OTP

`POST /api/notifications/otp/generate`

Le service génère un code OTP (4 chiffres), l’enregistre en base avec une expiration (5 minutes) puis publie un événement `otp.verification` sur RabbitMQ. Désormais, il dépend **strictement** des coordonnées envoyées dans le JSON.

```json
{
  "utilisateurId": "user-otp-1",
  "canalNotification": "SMS",
  "email": "userotp@mail.com",
  "phone": "+22300000000"
}
```

- `utilisateurId`: identifiant métier (user id).
- `canalNotification`: `"SMS"` ou `"EMAIL"`.
- `email`: email du destinataire (obligatoire).
- `phone`: numéro du destinataire (obligatoire).

│ │ ├── Notification.ts # Modèle de données pour les notifications

L’événement publié (contrat inter-services) contient :

```json
{
  "utilisateurId": "user-otp-1",
  "typeNotification": "VERIFICATION_TELEPHONE",
  "canal": "SMS",
  "context": { "code": "1234" },
  "email": "userotp@mail.com",
  "phone": "+22300000000",
  "metadata": {
    "service": "notification-service:otp",
    "correlationId": "otp-<id>"
  }
}
```

Les templates de message utilisent ce `context` pour produire des textes explicites, par exemple :

- `VERIFICATION_TELEPHONE` :
  > « Votre code OTP de vérification téléphone est : {code}. Ce code est valable 5 minutes. Ne le partagez jamais avec un tiers. »

### 3. Vérification d’un OTP

`POST /api/notifications/otp/verify`

Body JSON :

```json
{
  "utilisateurId": "user-otp-1",
  "code": "1234"
}
```

Réponses possibles :

```json
{ "success": true, "message": "OTP validé" }
{ "success": false, "message": "Code invalide" }
{ "success": false, "message": "Code expiré" }
{ "success": false, "message": "Ce code a déjà été utilisé" }
```

---

│ │ ├── Otp.ts # Modèle de données pour les OTP (code, expiration, utilisateur)
│ │
│ ├── routes/
│ │ ├── notificationRoutes.ts # Définition des routes Express pour les notifications et OTP
│ │
│ ├── services/
│ │ ├── notificationService.ts # Logique métier liée aux notifications
│ │ ├── otpService.ts # Logique métier liée aux OTP
│ │
│ ├── utils/
│ │ ├── mailService.ts # Gère l’envoi des e-mails (transporteur, configuration…)
│ │ ├── messageTemplates.ts # Contient les templates des messages
│ │
│ ├── app.ts # Configuration principale de l’application Express
│ ├── data-source.ts # Configuration et connexion à la base de données
│ ├── index.ts # Point d’entrée pour la déclaration des routes
│ ├── server.ts # Lancement du serveur Express
│
├── .env # Variables d’environnement (PORT, DB_URL, etc.)
├── package.json # Dépendances et scripts du projet
├── tsconfig.json # Configuration TypeScript
