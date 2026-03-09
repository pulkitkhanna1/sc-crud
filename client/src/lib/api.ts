import type {
  CreateBeatAssignmentInput,
  CreateBeatInput,
  CreateIdeaInput,
  CreateImprovementAssignmentInput,
  CreatePersonInput,
  CreateSchemaVariableInput,
  CreateShowInput,
  ProductionInput,
  ReviewAssignmentInput,
  ReviewAssignmentResult,
  ReviewBeatInput,
  ReviewIdeaInput,
  SubmitAssignmentInput,
  SubmitBeatInput,
  WorkflowSnapshot,
} from "./types";

const API_BASE = import.meta.env.VITE_API_URL ?? "/api";

function normalizeWorkflowSnapshot(snapshot: Partial<WorkflowSnapshot>): WorkflowSnapshot {
  return {
    shows: Array.isArray(snapshot.shows) ? snapshot.shows : [],
    schemaVariables: Array.isArray(snapshot.schemaVariables) ? snapshot.schemaVariables : [],
    adminLogs: Array.isArray(snapshot.adminLogs) ? snapshot.adminLogs : [],
    people: Array.isArray(snapshot.people) ? snapshot.people : [],
    ideas: Array.isArray(snapshot.ideas) ? snapshot.ideas : [],
    beats: Array.isArray(snapshot.beats) ? snapshot.beats : [],
    assignments: Array.isArray(snapshot.assignments) ? snapshot.assignments : [],
  };
}

async function request<T>(path: string, init?: RequestInit) {
  const response = await fetch(`${API_BASE}${path}`, {
    ...init,
    headers: {
      "Content-Type": "application/json",
      ...(init?.headers ?? {}),
    },
  });

  if (!response.ok) {
    let message = "Request failed.";

    try {
      const body = (await response.json()) as { message?: string };
      if (body.message) {
        message = body.message;
      }
    } catch {
      // Ignore JSON parsing failures.
    }

    throw new Error(message);
  }

  if (response.status === 204) {
    return undefined as T;
  }

  return (await response.json()) as T;
}

export const api = {
  async getWorkflow() {
    const snapshot = await request<Partial<WorkflowSnapshot>>("/workflow");
    return normalizeWorkflowSnapshot(snapshot);
  },
  createIdea(input: CreateIdeaInput) {
    return request("/ideas", {
      method: "POST",
      body: JSON.stringify(input),
    });
  },
  reviewIdea(id: string, input: ReviewIdeaInput) {
    return request(`/ideas/${id}/review`, {
      method: "PATCH",
      body: JSON.stringify(input),
    });
  },
  createBeat(input: CreateBeatInput) {
    return request("/beats", {
      method: "POST",
      body: JSON.stringify(input),
    });
  },
  submitBeat(id: string, input: SubmitBeatInput) {
    return request(`/beats/${id}/submit`, {
      method: "PATCH",
      body: JSON.stringify(input),
    });
  },
  reviewBeat(id: string, input: ReviewBeatInput) {
    return request(`/beats/${id}/review`, {
      method: "PATCH",
      body: JSON.stringify(input),
    });
  },
  createAssignmentFromBeat(input: CreateBeatAssignmentInput) {
    return request("/assignments/from-beat", {
      method: "POST",
      body: JSON.stringify(input),
    });
  },
  createImprovementAssignment(input: CreateImprovementAssignmentInput) {
    return request("/assignments/improvement", {
      method: "POST",
      body: JSON.stringify(input),
    });
  },
  submitAssignment(id: string, input: SubmitAssignmentInput) {
    return request(`/assignments/${id}/submit`, {
      method: "PATCH",
      body: JSON.stringify(input),
    });
  },
  reviewAssignment(id: string, input: ReviewAssignmentInput) {
    return request<ReviewAssignmentResult>(`/assignments/${id}/review`, {
      method: "PATCH",
      body: JSON.stringify(input),
    });
  },
  markAssignmentReady(id: string, input: ProductionInput) {
    return request(`/assignments/${id}/production`, {
      method: "PATCH",
      body: JSON.stringify(input),
    });
  },
  createPerson(input: CreatePersonInput) {
    return request("/admin/people", {
      method: "POST",
      body: JSON.stringify(input),
    });
  },
  removePerson(id: string) {
    return request(`/admin/people/${id}`, {
      method: "DELETE",
    });
  },
  createShow(input: CreateShowInput) {
    return request("/admin/shows", {
      method: "POST",
      body: JSON.stringify(input),
    });
  },
  removeShow(id: string) {
    return request(`/admin/shows/${id}`, {
      method: "DELETE",
    });
  },
  createSchemaVariable(input: CreateSchemaVariableInput) {
    return request("/admin/schema-variables", {
      method: "POST",
      body: JSON.stringify(input),
    });
  },
  removeSchemaVariable(id: string) {
    return request(`/admin/schema-variables/${id}`, {
      method: "DELETE",
    });
  },
};
