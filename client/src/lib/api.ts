import type {
  CreateBeatAssignmentInput,
  CreateBeatInput,
  CreateIdeaInput,
  CreateImprovementAssignmentInput,
  CreatePersonInput,
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

async function request<T>(path: string, init?: RequestInit) {
  const response = await fetch(`${API_BASE}${path}`, {
    headers: {
      "Content-Type": "application/json",
    },
    ...init,
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
  getWorkflow() {
    return request<WorkflowSnapshot>("/workflow");
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
    return request("/people", {
      method: "POST",
      body: JSON.stringify(input),
    });
  },
  removePerson(id: string) {
    return request(`/people/${id}`, {
      method: "DELETE",
    });
  },
};
