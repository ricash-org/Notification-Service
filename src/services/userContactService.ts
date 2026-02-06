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
    ["user-test-email", { email: "test.email@example.com" }],
    ["user-test-sms", { phone: "+221770000000" }],
    [
      "user-test-both",
      { email: "test.both@example.com", phone: "+221770000001" },
    ],
  ]);

  async getContact(utilisateurId: string): Promise<UserContact> {
    const contact = this.contacts.get(utilisateurId);
    return contact ?? {};
  }
}

// Instance par défaut réutilisable dans tout le service
export const userContactService = new UserContactService();
