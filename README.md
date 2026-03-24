# Notification-Service

Service de notifications (SMS, email, OTP) base sur Node.js, Express, TypeScript, PostgreSQL, RabbitMQ.

## Vue d'ensemble

Ce service expose des endpoints HTTP et consomme des evenements RabbitMQ pour envoyer des notifications.

Comportement cle actuel:

- OTP generation: telephone only, canal SMS.
- Alertes securite: SMS prioritaire, email secondaire si disponible.
- Les types de notification sont centralises dans `TypeNotification`.

## Prerequis

- Node.js >= 18
- npm
- PostgreSQL
- RabbitMQ
- Compte Twilio (SMS)
- Compte SMTP/Gmail (email)

## Installation

```bash
cd notification_service
npm install
npm run build
npm run dev
```

## Variables d'environnement

### API

- SERVICE_PORT (ex: 8000)
- SERVICE_VERSION (optionnel)
- COMMIT_SHA (optionnel)

### PostgreSQL

- DB_HOST
- DB_PORT (defaut 5432)
- DB_USER
- DB_PASSWORD
- DB_NAME

### RabbitMQ

- RABBITMQ_URL
- RABBITMQ_EXCHANGE
- RABBITMQ_QUEUE

### SMS (Twilio)

- TWILIO_ACCOUNT_SID
- TWILIO_AUTH_TOKEN
- TWILIO_PHONE_NUMBER

### Email

- MAIL_USER
- MAIL_PASS

### Health

- HEALTH_CHECK_TIMEOUT_MS (defaut 1000)
- HEALTH_CACHE_TTL_MS (defaut 5000)
- HEALTH_EXPOSE_ERRORS (defaut false)

## Commandes

```bash
npm run dev
npm run build
npm start
```

## Base URL

```text
http://{host}:{SERVICE_PORT}
```

## Endpoints

### 1) Health liveness

- Methode: GET
- Route: /health

Reponse exemple:

```json
{
  "status": "OK",
  "uptime": 123.45
}
```

### 2) Health readiness

- Methode: GET
- Route: /health/ready

Reponse exemple:

```json
{
  "status": "OK",
  "uptime": 123.45,
  "timestamp": "2026-03-24T10:00:00.000Z",
  "version": "1.0.0",
  "commit": "abc123",
  "components": {
    "db": { "status": "OK" },
    "rabbitmq": { "status": "OK" }
  }
}
```

### 3) Envoi notification HTTP directe

- Methode: POST
- Route: /api/notifications/envoyer

#### Cas A: transfer (sender/receiver avec email + phone obligatoires)

```json
{
  "type": "transfer",
  "sender": {
    "email": "sender@example.com",
    "phone": "+22370000001"
  },
  "receiver": {
    "email": "receiver@example.com",
    "phone": "+22370000002"
  },
  "amount": 5000,
  "content": "Transfert de 5000 FCFA effectue"
}
```

#### Cas B: alert_securite (SMS prioritaire, email optionnel)

```json
{
  "type": "alert_securite",
  "user": {
    "phone": "+22370000003",
    "email": "client@example.com"
  },
  "content": "Tentative de connexion suspecte detectee"
}
```

#### Cas C: autre type simple (schema standard)

Note: pour les types simples hors transfer et alert_securite, `user.email` et `user.phone` sont attendus.

```json
{
  "type": "CLIENT_COMPTE_ACTIF",
  "user": {
    "email": "client@example.com",
    "phone": "+22370000004"
  },
  "content": "Votre compte est desormais actif"
}
```

### 4) Liste des notifications

- Methode: GET
- Route: /api/notifications

Reponse exemple:

```json
[
  {
    "id": "0f4c...",
    "utilisateurId": "user-123",
    "typeNotification": "ALERT_SECURITE",
    "canal": "SMS",
    "message": "Alerte securite...",
    "statut": "ENVOYEE",
    "dateEnvoi": "2026-03-24T10:00:00.000Z"
  }
]
```

### 5) Publication test RabbitMQ

- Methode: POST
- Route: /api/notifications/rabbitmq

Request exemple:

```json
{
  "routingKey": "notification.process",
  "message": {
    "utilisateurId": "user-123",
    "typeNotification": "ALERT_SECURITE",
    "canal": "SMS",
    "phone": "+22370000005"
  }
}
```

Reponse exemple:

```json
{
  "success": true
}
```

### 6) OTP generate

- Methode: POST
- Route: /api/notifications/otp/generate
- Regle actuelle: telephone only, SMS only.

Request exemple minimal:

```json
{
  "phone": "+22370000006"
}
```

Request exemple avec utilisateurId:

```json
{
  "utilisateurId": "pre-user-001",
  "phone": "+22370000006"
}
```

Reponse exemple:

```json
{
  "success": true,
  "message": "OTP envoye",
  "expiration": "2026-03-24T10:05:00.000Z"
}
```

### 7) OTP verify

- Methode: POST
- Route: /api/notifications/otp/verify

Request exemple:

```json
{
  "utilisateurId": "pre-user-001",
  "code": "1234"
}
```

Reponse exemple:

```json
{
  "success": true,
  "message": "OTP valide"
}
```

## RabbitMQ inter-services

Message type attendu pour notification inter-service:

```json
{
  "utilisateurId": "user-123",
  "typeNotification": "ALERT_SECURITE",
  "canal": "SMS",
  "email": "client@example.com",
  "phone": "+22370000007",
  "context": {
    "reason": "multiple_failed_pin_attempts"
  },
  "metadata": {
    "service": "wallet-service",
    "correlationId": "evt-123"
  }
}
```

Regle importante:

- Pour `ALERT_SECURITE`, le service applique une priorite SMS quand un numero est present, puis envoi email si adresse disponible.

## Types de notification disponibles

### 1. Gestion admin

- ADMIN_CREE
- ADMIN_MIS_A_JOUR
- ADMIN_SUPPRIME

### 2. Agent

- AGENT_INSCRIPTION
- AGENT_EN_ATTENTE_VALIDATION
- AGENT_VALIDE
- AGENT_REJETE

### 3. Client

- CLIENT_INSCRIPTION
- CLIENT_COMPTE_ACTIF

### 4. Authentification et securite

- CONNEXION_REUSSIE
- ECHEC_CONNEXION
- DECONNEXION
- NOUVEL_APPAREIL
- CHANGEMENT_MOT_DE_PASSE
- CHANGEMENT_EMAIL
- CHANGEMENT_TELEPHONE
- COMPTE_BLOQUE
- COMPTE_DEBLOQUE
- ALERT_SECURITE

### 5. Transactions

- CONFIRMATION_TRANSFERT
- CONFIRMATION_DEPOT
- CONFIRMATION_RETRAIT
- TRANSFERT_ENVOYE
- TRANSFERT_RECU
- ECHEC_TRANSFERT
- DEPOT_EN_COURS
- DEPOT_REUSSI
- ECHEC_DEPOT
- RETRAIT_EN_COURS
- RETRAIT_REUSSI
- ECHEC_RETRAIT

### 6. OTP et verification

- OTP_ENVOYE
- OTP_VALIDE
- OTP_EXPIRE
- OTP_INVALIDE
- VERIFICATION_EMAIL
- VERIFICATION_TELEPHONE

### 7. KYC

- KYC_EN_COURS
- KYC_VALIDE
- KYC_REJETE
- VERIFICATION_KYC

### 8. Paiement

- PAIEMENT_REUSSI
- PAIEMENT_ECHOUE
- FACTURE_GENEREE
- FACTURE_PAYEE

### 9. Fraude et alertes

- TENTATIVE_FRAUDE
- TRANSACTION_SUSPECTE
- ACTIVITE_INHABITUELLE

### 10. Systeme

- MAINTENANCE
- MISE_A_JOUR_SYSTEME
- ANNONCE

## Notes d'exploitation

- En cas d'erreur SMS/email, le statut est marque ECHEC.
- Pour la production, preferer des migrations TypeORM controlees plutot que synchronize.
- Eviter d'exposer les erreurs internes du health endpoint en production.
