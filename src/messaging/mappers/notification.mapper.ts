import {
  CanalNotification,
  TypeNotification,
} from "../../entities/Notification";
import { InterServices } from "../contracts/interServices";

export function mapInterServiceToNotification(payload: InterServices) {
  return {
    utilisateurId: payload.utilisateurId,
    typeNotification: payload.typeNotification as TypeNotification,
    canal: payload.canal as CanalNotification,
    context: payload.context,
    // coordonnées éventuellement poussées par le producteur
    email: payload.email ?? undefined,
    phone: payload.phone ?? undefined,
  };
}
