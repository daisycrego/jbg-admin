import express from "express";
import leadCtrl from "../controllers/lead.controller";
import authCtrl from "../controllers/auth.controller";

const router = express.Router();

router.route("/api/leads/search").post(leadCtrl.list);

router.route("/api/leads").get(leadCtrl.list).post(leadCtrl.create);

router.route("/api/leads/sync").get(authCtrl.requireSignin, leadCtrl.syncLeads);

router
  .route("/api/leads/fub/callback/created")
  .post(leadCtrl.peopleCreatedWebhookCallback);

router
  .route("/api/leads/fub/callback/updated")
  .post(leadCtrl.peopleStageUpdatedWebhookCallback);

router
  .route("/api/lead/:leadId")
  .get(authCtrl.requireSignin, leadCtrl.read)
  .put(authCtrl.requireSignin, authCtrl.hasAuthorization, leadCtrl.update)
  .delete(authCtrl.requireSignin, authCtrl.hasAuthorization, leadCtrl.remove);

router.param("leadId", leadCtrl.leadById);

export default router;
