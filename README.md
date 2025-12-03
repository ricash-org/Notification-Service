# Notification-Service

Ce projet implémente un **service de notifications** en **Node.js**, **Express** et **TypeScript**.  
Il gère deux fonctionnalités principales :

-  La génération et la vérification d’OTP (codes à usage unique).  
-  L’envoi de notifications (par e-mail,SMS ou autres canaux).


---

##  Fonctionnalités principales

- Génération et validation d’OTP avec expiration automatique.  
- Envoi de notifications personnalisées via des templates.  
- Architecture modulaire : contrôleurs, services, entités, utilitaires.  

---
# Endpoints 

Tous les endpoints sont accessibles sous :<br>
/api/notifications
 
 **Envoi d’une notification**  
 
 Post /api/notifications/envoyer  
 
 **Body json**
{
  "utilisateurId": "+22350087965",  
  
  "typeNotification": "CONFIRMATION_TRANSFERT",
  "canal": "SMS",
  "context": {
    "montant": 10000,
    "destinataire": "Aisha"
  }
}

**Réponse json**

{
  "id": 42,
  "utilisateurId": "+22350087965",
  "typeNotification": "CONFIRMATION_TRANSFERT",
  "canal": "SMS",
  "message": "Votre transfert de 10000 F CFA à Aisha a été confirmé.",
  "statut": "ENVOYEE",
  "createdAt": "2025-12-02T20:10:00.000Z"
}


**Génération d'otp**

POST /api/notifications/otp/generate

**Body json**

-Envoi par numéro de téléphone
{
  "utilisateurId": "+22350087965",
  "canalNotification": "SMS"
}
-Envoi par email
{
  "utilisateurId": "youremail@gmail.com",
  "canalNotification": "EMAIL"
}

**Vérification d'un otp**

POST /api/notifications/otp/verify
**BODY JSON**

{
  "utilisateurId": "+22350087965",
  "code": "1234"
}
**Réponse**
{
  "success": true,
  "message": "OTP validé"
}

**Autres réponses possibles**

{ "success": false, "message": "Code invalide" }
{ "success": false, "message": "Code expiré" }
{ "success": false, "message": "Ce code a déjà été utilisé" }

---
##  Structure du projet


```bash
notification-service/
│
├── src/
│   ├── controllers/
│   │   ├── notificationController.ts     # Gère les requêtes liées à l’envoi de notifications
│   │   ├── otpController.ts              # Gère la génération et la vérification des OTP
│   │
│   ├── entities/
│   │   ├── Notification.ts               # Modèle de données pour les notifications
│   │   ├── Otp.ts                        # Modèle de données pour les OTP (code, expiration, utilisateur)
│   │
│   ├── routes/
│   │   ├── notificationRoutes.ts         # Définition des routes Express pour les notifications et OTP
│   │
│   ├── services/
│   │   ├── notificationService.ts        # Logique métier liée aux notifications
│   │   ├── otpService.ts                 # Logique métier liée aux OTP
│   │
│   ├── utils/
│   │   ├── mailService.ts                # Gère l’envoi des e-mails (transporteur, configuration…)
│   │   ├── messageTemplates.ts           # Contient les templates des messages
│   │
│   ├── app.ts                            # Configuration principale de l’application Express
│   ├── data-source.ts                    # Configuration et connexion à la base de données
│   ├── index.ts                          # Point d’entrée pour la déclaration des routes
│   ├── server.ts                         # Lancement du serveur Express
│
├── .env                                  # Variables d’environnement (PORT, DB_URL, etc.)
├── package.json                          # Dépendances et scripts du projet
├── tsconfig.json                         # Configuration TypeScript



