import { InterServices } from "../contracts/interServices";
import { CanalNotification,TypeNotification } from "../../entities/Notification";


export function mapInterServiceToNotification(
  payload: InterServices
) {
  return {
    utilisateurId: payload.utilisateurId,
    typeNotification: payload.typeNotification as TypeNotification,
    canal: payload.canal as CanalNotification,
    context: payload.context,
  };
}
