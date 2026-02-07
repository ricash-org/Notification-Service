export interface UserContact {
  email?: string;
  phone?: string;
}

/**
 * Service responsable de récupérer les coordonnées de contact
 * (email / téléphone) à partir d'un identifiant métier utilisateur.
 *
 * Implémentation actuelle : simple map en mémoire pour les tests.
 * Elle pourra être remplacée plus tard par :
 *  - un appel HTTP vers un service utilisateur,
 *  - une lecture dans une table `Utilisateur`, etc.
 */
export class UserContactService {
  private contacts = new Map<string, UserContact>([
    // Exemple de données de test ; à adapter ou supprimer en prod
    ["user-test-email", { email: "managerdayif@gmail.com" }],
    ["user-test-sms", { phone: "+22379994640" }],
    [
      "user-test-both",
      { email: "managerdayif@gmail.com", phone: "+22379994640" },
    ],
  ]);

  async getContact(utilisateurId: string): Promise<UserContact> {
    const contact = this.contacts.get(utilisateurId);
    return contact ?? {};
  }
}

// Instance par défaut réutilisable dans tout le service
export const userContactService = new UserContactService();
