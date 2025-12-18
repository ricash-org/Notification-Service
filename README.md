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
 
 **Body json** <br>
{<br>
  "utilisateurId": "+22350087965",  <br>
  "typeNotification": "CONFIRMATION_TRANSFERT",<br>
  "canal": "SMS",<br>
  "context": {<br>
    "montant": 10000,<br>
    "destinataire": "Aisha"<br>
  }<br>
}<br>

**Réponse json**<br>

{<br>
  "id": 42,<br>
  "utilisateurId": "+22350087965",<br>
  "typeNotification": "CONFIRMATION_TRANSFERT",<br>
  "canal": "SMS",<br>
  "message": "Votre transfert de 10000 F CFA à Aisha a été confirmé.",<br>
  "statut": "ENVOYEE",<br>
  "createdAt": "2025-12-02T20:10:00.000Z"<br>
}<br>


**Génération d'otp**<br>

POST /api/notifications/otp/generate <br>

**Body json**<br>

-Envoi par numéro de téléphone<br>
{<br>
  "utilisateurId": "+22350087965",<br>
  "canalNotification": "SMS"<br>
}<br>
-Envoi par email<br>
{<br>
  "utilisateurId": "youremail@gmail.com",<br>
  "canalNotification": "EMAIL"<br>
}<br>

**Vérification d'un otp**<br>

POST /api/notifications/otp/verify<br>
**BODY JSON**<br>

{
  "utilisateurId": "+22350087965",<br>
  "code": "1234"<br>
}
**Réponse**<br>
{<br>
  "success": true,<br>
  "message": "OTP validé"<br>
}

**Autres réponses possibles**<br>

{ "success": false, "message": "Code invalide" }<br>
{ "success": false, "message": "Code expiré" }<br>
{ "success": false, "message": "Ce code a déjà été utilisé" }<br>

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



