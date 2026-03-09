import { Router } from "express";

import {
  createAssignmentFromBeat,
  createBeat,
  createIdea,
  createImprovementAssignment,
  createPerson,
  createShow,
  getWorkflowSnapshot,
  markAssignmentReady,
  removePerson,
  removeShow,
  reviewAssignment,
  reviewBeat,
  reviewIdea,
  submitAssignment,
  submitBeat,
} from "../lib/workflowService";
import { AppError } from "../lib/validation";

const router = Router();

type Handler = (req: any, res: any) => Promise<void>;

function route(handler: Handler) {
  return (req: any, res: any, next: (error: unknown) => void) => {
    void handler(req, res).catch(next);
  };
}

function requireAdmin(req: any, _res: any, next: (error?: unknown) => void) {
  const configuredPassword = process.env.ADMIN_PASSWORD ?? "PocketFM@123";
  const providedPassword = req.header("x-admin-password");

  if (providedPassword !== configuredPassword) {
    next(new AppError("Invalid admin password.", 401));
    return;
  }

  next();
}

router.get(
  "/health",
  route(async (_req, res) => {
    res.json({ ok: true });
  }),
);

router.get(
  "/workflow",
  route(async (_req, res) => {
    res.json(await getWorkflowSnapshot());
  }),
);

router.get(
  "/admin/validate",
  requireAdmin,
  route(async (_req, res) => {
    res.status(204).end();
  }),
);

router.post(
  "/ideas",
  route(async (req, res) => {
    const code = await createIdea(req.body);
    res.status(201).json({ code });
  }),
);

router.patch(
  "/ideas/:id/review",
  route(async (req, res) => {
    await reviewIdea(req.params.id, req.body);
    res.status(204).end();
  }),
);

router.post(
  "/beats",
  route(async (req, res) => {
    const code = await createBeat(req.body);
    res.status(201).json({ code });
  }),
);

router.patch(
  "/beats/:id/submit",
  route(async (req, res) => {
    await submitBeat(req.params.id, req.body);
    res.status(204).end();
  }),
);

router.patch(
  "/beats/:id/review",
  route(async (req, res) => {
    await reviewBeat(req.params.id, req.body);
    res.status(204).end();
  }),
);

router.post(
  "/assignments/from-beat",
  route(async (req, res) => {
    const code = await createAssignmentFromBeat(req.body);
    res.status(201).json({ code });
  }),
);

router.post(
  "/assignments/improvement",
  route(async (req, res) => {
    const code = await createImprovementAssignment(req.body);
    res.status(201).json({ code });
  }),
);

router.patch(
  "/assignments/:id/submit",
  route(async (req, res) => {
    await submitAssignment(req.params.id, req.body);
    res.status(204).end();
  }),
);

router.patch(
  "/assignments/:id/review",
  route(async (req, res) => {
    const result = await reviewAssignment(req.params.id, req.body);
    res.json(result);
  }),
);

router.patch(
  "/assignments/:id/production",
  route(async (req, res) => {
    await markAssignmentReady(req.params.id, req.body);
    res.status(204).end();
  }),
);

router.post(
  "/admin/people",
  requireAdmin,
  route(async (req, res) => {
    const person = await createPerson(req.body);
    res.status(201).json(person);
  }),
);

router.delete(
  "/admin/people/:id",
  requireAdmin,
  route(async (req, res) => {
    await removePerson(req.params.id);
    res.status(204).end();
  }),
);

router.post(
  "/admin/shows",
  requireAdmin,
  route(async (req, res) => {
    const show = await createShow(req.body);
    res.status(201).json(show);
  }),
);

router.delete(
  "/admin/shows/:id",
  requireAdmin,
  route(async (req, res) => {
    await removeShow(req.params.id);
    res.status(204).end();
  }),
);

export { router as workflowRouter };
