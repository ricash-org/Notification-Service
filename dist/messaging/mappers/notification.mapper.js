"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.mapInterServiceToNotification = mapInterServiceToNotification;
function mapInterServiceToNotification(payload) {
    return {
        utilisateurId: payload.utilisateurId,
        typeNotification: payload.typeNotification,
        canal: payload.canal,
        context: payload.context,
        // coordonnées éventuellement poussées par le producteur
        email: payload.email ?? undefined,
        phone: payload.phone ?? undefined,
    };
}
