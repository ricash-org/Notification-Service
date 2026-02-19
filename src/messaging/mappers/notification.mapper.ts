import {
  CanalNotification,
  TypeNotification,
} from "../../entities/Notification";
import { InterServices } from "../contracts/interServices";

export function mapInterServiceToNotification(payload: InterServices) {
  // On choisit la "vraie" cible en fonction du canal :
  // - EMAIL  -> on privilégie payload.email si présent
  // - SMS    -> on privilégie payload.phone si présent
  // - autres -> on retombe sur payload.utilisateurId

  let utilisateurId = payload.utilisateurId;

  if (payload.canal === "EMAIL" && payload.email) {
    utilisateurId = payload.email;
  } else if (payload.canal === "SMS" && payload.phone) {
    utilisateurId = payload.phone;
  }
  return {
    utilisateurId,
    typeNotification: payload.typeNotification as TypeNotification,
    canal: payload.canal as CanalNotification,
    context: payload.context,
    // coordonnées éventuellement poussées par le producteur
    email: payload.email ?? undefined,
    phone: payload.phone ?? undefined,
  };
}
