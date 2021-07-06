import express from "express";
import eventCtrl from "../controllers/event.controller";
import authCtrl from "../controllers/auth.controller";

const router = express.Router();

router.route("/api/events/search").post(eventCtrl.list);

router.route("/api/events/").get(eventCtrl.list).post(eventCtrl.create);

router
  .route("/api/events/sync")
  .get(authCtrl.requireSignin, eventCtrl.syncEvents);

router
  .route("/api/events/fub/callback")
  .post(eventCtrl.createEventsWebhookCallback);

router
  .route("/api/event/:eventId")
  .get(authCtrl.requireSignin, eventCtrl.read)
  .put(authCtrl.requireSignin, authCtrl.hasAuthorization, eventCtrl.update)
  .delete(authCtrl.requireSignin, authCtrl.hasAuthorization, eventCtrl.remove);

router.param("eventId", eventCtrl.eventById);
//router.param("userId", eventCtrl.eventById);

export default router;
