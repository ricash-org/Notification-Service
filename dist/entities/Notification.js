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
    TypeNotification["CONFIRMATION_TRANSFERT"] = "CONFIRMATION_TRANSFERT";
    TypeNotification["CONFIRMATION_RETRAIT"] = "CONFIRMATION_RETRAIT";
    TypeNotification["RETRAIT_REUSSI"] = "RETRAIT_REUSSI";
    TypeNotification["DEPOT_REUSSI"] = "DEPOT_REUSSI";
    TypeNotification["ALERT_SECURITE"] = "ALERT_SECURITE";
    TypeNotification["VERIFICATION_KYC"] = "VERIFICATION_KYC";
    TypeNotification["VERIFICATION_EMAIL"] = "VERIFICATION_EMAIL";
    TypeNotification["VERIFICATION_TELEPHONE"] = "VERIFICATION_TELEPHONE";
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
