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
