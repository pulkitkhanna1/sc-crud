import { Router } from "express";

const router = Router();

type Handler = (req: any, res: any) => Promise<void>;

async function workflowService() {
  return import("../lib/workflowService");
}

function route(handler: Handler) {
  return (req: any, res: any, next: (error: unknown) => void) => {
    void handler(req, res).catch(next);
  };
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
    const { getWorkflowSnapshot } = await workflowService();
    res.json(await getWorkflowSnapshot());
  }),
);

router.post(
  "/ideas",
  route(async (req, res) => {
    const { createIdea } = await workflowService();
    const code = await createIdea(req.body);
    res.status(201).json({ code });
  }),
);

router.patch(
  "/ideas/:id/review",
  route(async (req, res) => {
    const { reviewIdea } = await workflowService();
    await reviewIdea(req.params.id, req.body);
    res.status(204).end();
  }),
);

router.post(
  "/beats",
  route(async (req, res) => {
    const { createBeat } = await workflowService();
    const code = await createBeat(req.body);
    res.status(201).json({ code });
  }),
);

router.patch(
  "/beats/:id/submit",
  route(async (req, res) => {
    const { submitBeat } = await workflowService();
    await submitBeat(req.params.id, req.body);
    res.status(204).end();
  }),
);

router.patch(
  "/beats/:id/review",
  route(async (req, res) => {
    const { reviewBeat } = await workflowService();
    await reviewBeat(req.params.id, req.body);
    res.status(204).end();
  }),
);

router.post(
  "/assignments/from-beat",
  route(async (req, res) => {
    const { createAssignmentFromBeat } = await workflowService();
    const code = await createAssignmentFromBeat(req.body);
    res.status(201).json({ code });
  }),
);

router.post(
  "/assignments/improvement",
  route(async (req, res) => {
    const { createImprovementAssignment } = await workflowService();
    const code = await createImprovementAssignment(req.body);
    res.status(201).json({ code });
  }),
);

router.patch(
  "/assignments/:id/submit",
  route(async (req, res) => {
    const { submitAssignment } = await workflowService();
    await submitAssignment(req.params.id, req.body);
    res.status(204).end();
  }),
);

router.patch(
  "/assignments/:id/review",
  route(async (req, res) => {
    const { reviewAssignment } = await workflowService();
    const result = await reviewAssignment(req.params.id, req.body);
    res.json(result);
  }),
);

router.patch(
  "/assignments/:id/production",
  route(async (req, res) => {
    const { markAssignmentReady } = await workflowService();
    await markAssignmentReady(req.params.id, req.body);
    res.status(204).end();
  }),
);

router.post(
  "/admin/people",
  route(async (req, res) => {
    const { createPerson } = await workflowService();
    const person = await createPerson(req.body);
    res.status(201).json(person);
  }),
);

router.delete(
  "/admin/people/:id",
  route(async (req, res) => {
    const { removePerson } = await workflowService();
    await removePerson(req.params.id);
    res.status(204).end();
  }),
);

router.post(
  "/admin/shows",
  route(async (req, res) => {
    const { createShow } = await workflowService();
    const show = await createShow(req.body);
    res.status(201).json(show);
  }),
);

router.delete(
  "/admin/shows/:id",
  route(async (req, res) => {
    const { removeShow } = await workflowService();
    await removeShow(req.params.id);
    res.status(204).end();
  }),
);

router.post(
  "/admin/schema-variables",
  route(async (req, res) => {
    const { createSchemaVariable } = await workflowService();
    const variable = await createSchemaVariable(req.body);
    res.status(201).json(variable);
  }),
);

router.delete(
  "/admin/schema-variables/:id",
  route(async (req, res) => {
    const { removeSchemaVariable } = await workflowService();
    await removeSchemaVariable(req.params.id);
    res.status(204).end();
  }),
);

export { router as workflowRouter };
