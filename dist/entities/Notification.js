"use strict";
var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
var __metadata = (this && this.__metadata) || function (k, v) {
    if (typeof Reflect === "object" && typeof Reflect.metadata === "function") return Reflect.metadata(k, v);
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.Notification = exports.StatutNotification = exports.CanalNotification = exports.TypeNotification = void 0;
const typeorm_1 = require("typeorm");
var TypeNotification;
(function (TypeNotification) {
    // Existing types
    TypeNotification["CONFIRMATION_TRANSFERT"] = "CONFIRMATION_TRANSFERT";
    TypeNotification["CONFIRMATION_DEPOT"] = "CONFIRMATION_DEPOT";
    TypeNotification["CONFIRMATION_RETRAIT"] = "CONFIRMATION_RETRAIT";
    TypeNotification["RETRAIT_REUSSI"] = "RETRAIT_REUSSI";
    TypeNotification["DEPOT_REUSSI"] = "DEPOT_REUSSI";
    TypeNotification["ALERT_SECURITE"] = "ALERT_SECURITE";
    TypeNotification["VERIFICATION_KYC"] = "VERIFICATION_KYC";
    TypeNotification["VERIFICATION_EMAIL"] = "VERIFICATION_EMAIL";
    TypeNotification["VERIFICATION_TELEPHONE"] = "VERIFICATION_TELEPHONE";
    // 1. ADMIN MANAGEMENT
    TypeNotification["ADMIN_CREE"] = "ADMIN_CREE";
    TypeNotification["ADMIN_MIS_A_JOUR"] = "ADMIN_MIS_A_JOUR";
    TypeNotification["ADMIN_SUPPRIME"] = "ADMIN_SUPPRIME";
    // 2. AGENT WORKFLOW
    TypeNotification["AGENT_INSCRIPTION"] = "AGENT_INSCRIPTION";
    TypeNotification["AGENT_EN_ATTENTE_VALIDATION"] = "AGENT_EN_ATTENTE_VALIDATION";
    TypeNotification["AGENT_VALIDE"] = "AGENT_VALIDE";
    TypeNotification["AGENT_REJETE"] = "AGENT_REJETE";
    // 3. CLIENT
    TypeNotification["CLIENT_INSCRIPTION"] = "CLIENT_INSCRIPTION";
    TypeNotification["CLIENT_COMPTE_ACTIF"] = "CLIENT_COMPTE_ACTIF";
    // 4. AUTHENTICATION AND SECURITY
    TypeNotification["CONNEXION_REUSSIE"] = "CONNEXION_REUSSIE";
    TypeNotification["ECHEC_CONNEXION"] = "ECHEC_CONNEXION";
    TypeNotification["DECONNEXION"] = "DECONNEXION";
    TypeNotification["NOUVEL_APPAREIL"] = "NOUVEL_APPAREIL";
    TypeNotification["CHANGEMENT_MOT_DE_PASSE"] = "CHANGEMENT_MOT_DE_PASSE";
    TypeNotification["CHANGEMENT_EMAIL"] = "CHANGEMENT_EMAIL";
    TypeNotification["CHANGEMENT_TELEPHONE"] = "CHANGEMENT_TELEPHONE";
    TypeNotification["COMPTE_BLOQUE"] = "COMPTE_BLOQUE";
    TypeNotification["COMPTE_DEBLOQUE"] = "COMPTE_DEBLOQUE";
    // 5. TRANSACTIONS
    TypeNotification["TRANSFERT_ENVOYE"] = "TRANSFERT_ENVOYE";
    TypeNotification["TRANSFERT_RECU"] = "TRANSFERT_RECU";
    TypeNotification["ECHEC_TRANSFERT"] = "ECHEC_TRANSFERT";
    TypeNotification["DEPOT_EN_COURS"] = "DEPOT_EN_COURS";
    TypeNotification["ECHEC_DEPOT"] = "ECHEC_DEPOT";
    TypeNotification["RETRAIT_EN_COURS"] = "RETRAIT_EN_COURS";
    TypeNotification["ECHEC_RETRAIT"] = "ECHEC_RETRAIT";
    // 6. OTP AND VERIFICATION
    TypeNotification["OTP_ENVOYE"] = "OTP_ENVOYE";
    TypeNotification["OTP_VALIDE"] = "OTP_VALIDE";
    TypeNotification["OTP_EXPIRE"] = "OTP_EXPIRE";
    TypeNotification["OTP_INVALIDE"] = "OTP_INVALIDE";
    // 7. KYC
    TypeNotification["KYC_EN_COURS"] = "KYC_EN_COURS";
    TypeNotification["KYC_VALIDE"] = "KYC_VALIDE";
    TypeNotification["KYC_REJETE"] = "KYC_REJETE";
    // 8. PAYMENT
    TypeNotification["PAIEMENT_REUSSI"] = "PAIEMENT_REUSSI";
    TypeNotification["PAIEMENT_ECHOUE"] = "PAIEMENT_ECHOUE";
    TypeNotification["FACTURE_GENEREE"] = "FACTURE_GENEREE";
    TypeNotification["FACTURE_PAYEE"] = "FACTURE_PAYEE";
    // 9. FRAUD AND ALERTS
    TypeNotification["TENTATIVE_FRAUDE"] = "TENTATIVE_FRAUDE";
    TypeNotification["TRANSACTION_SUSPECTE"] = "TRANSACTION_SUSPECTE";
    TypeNotification["ACTIVITE_INHABITUELLE"] = "ACTIVITE_INHABITUELLE";
    // 10. SYSTEM
    TypeNotification["MAINTENANCE"] = "MAINTENANCE";
    TypeNotification["MISE_A_JOUR_SYSTEME"] = "MISE_A_JOUR_SYSTEME";
    TypeNotification["ANNONCE"] = "ANNONCE";
})(TypeNotification || (exports.TypeNotification = TypeNotification = {}));
var CanalNotification;
(function (CanalNotification) {
    CanalNotification["SMS"] = "SMS";
    CanalNotification["EMAIL"] = "EMAIL";
    CanalNotification["PUSH"] = "PUSH";
    CanalNotification["WHATSAPP"] = "WHATSAPP";
})(CanalNotification || (exports.CanalNotification = CanalNotification = {}));
var StatutNotification;
(function (StatutNotification) {
    StatutNotification["CREE"] = "CREE";
    StatutNotification["EN_COURS"] = "EN_COURS";
    StatutNotification["ENVOYEE"] = "ENVOYEE";
    StatutNotification["LUE"] = "LUE";
    StatutNotification["ECHEC"] = "ECHEC";
})(StatutNotification || (exports.StatutNotification = StatutNotification = {}));
let Notification = class Notification {
};
exports.Notification = Notification;
__decorate([
    (0, typeorm_1.PrimaryGeneratedColumn)("uuid"),
    __metadata("design:type", String)
], Notification.prototype, "id", void 0);
__decorate([
    (0, typeorm_1.Column)(),
    __metadata("design:type", String)
], Notification.prototype, "utilisateurId", void 0);
__decorate([
    (0, typeorm_1.Column)({ nullable: true }),
    __metadata("design:type", String)
], Notification.prototype, "destinationEmail", void 0);
__decorate([
    (0, typeorm_1.Column)({ nullable: true }),
    __metadata("design:type", String)
], Notification.prototype, "destinationPhone", void 0);
__decorate([
    (0, typeorm_1.Column)({ type: "enum", enum: TypeNotification }),
    __metadata("design:type", String)
], Notification.prototype, "typeNotification", void 0);
__decorate([
    (0, typeorm_1.Column)(),
    __metadata("design:type", String)
], Notification.prototype, "message", void 0);
__decorate([
    (0, typeorm_1.Column)({ type: "enum", enum: CanalNotification }),
    __metadata("design:type", String)
], Notification.prototype, "canal", void 0);
__decorate([
    (0, typeorm_1.Column)({
        type: "enum",
        enum: StatutNotification,
        default: StatutNotification.CREE,
    }),
    __metadata("design:type", String)
], Notification.prototype, "statut", void 0);
__decorate([
    (0, typeorm_1.CreateDateColumn)(),
    __metadata("design:type", Date)
], Notification.prototype, "dateEnvoi", void 0);
__decorate([
    (0, typeorm_1.Column)({ type: "simple-json", nullable: true }),
    __metadata("design:type", Object)
], Notification.prototype, "context", void 0);
exports.Notification = Notification = __decorate([
    (0, typeorm_1.Entity)()
], Notification);
