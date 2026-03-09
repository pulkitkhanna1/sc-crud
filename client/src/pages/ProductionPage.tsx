import { useMemo, useState } from "react";

import { Badge } from "@/components/Badge";
import { EmptyState } from "@/components/EmptyState";
import { Panel } from "@/components/Panel";
import { PRODUCTION_TYPE_LABELS, PRODUCTION_TYPE_OPTIONS } from "@/lib/constants";
import { formatDateTime } from "@/lib/format";
import type { SessionState, WorkflowSnapshot } from "@/lib/types";

interface ProductionPageProps {
  snapshot: WorkflowSnapshot;
  session: SessionState;
}

export function ProductionPage({ snapshot, session }: ProductionPageProps) {
  const [filters, setFilters] = useState({
    code: "",
    writerId: "",
    podLeadId: "",
    prodSuffix: "",
  });

  const writers = snapshot.people.filter((person) => person.role === "WRITER");
  const podLeads = snapshot.people.filter((person) => person.role === "POD_LEAD");

  const rows = useMemo(() => {
    return snapshot.assignments
      .filter((assignment) => assignment.status === "READY_FOR_PRODUCTION")
      .filter((assignment) => (filters.code ? assignment.code.toLowerCase().includes(filters.code.toLowerCase()) : true))
      .filter((assignment) => (filters.writerId ? assignment.writerId === filters.writerId : true))
      .filter((assignment) => (filters.podLeadId ? assignment.podLeadId === filters.podLeadId : true))
      .filter((assignment) => (filters.prodSuffix ? assignment.prodSuffix === filters.prodSuffix : true))
      .sort((left, right) => String(right.productionReadyAt).localeCompare(String(left.productionReadyAt)));
  }, [filters, snapshot.assignments]);

  return (
    <div className="page-stack">
      <Panel title="Production queue" description={`Ready for handoff. Current session: ${session.personName}.`}>
        <div className="form-four-up">
          <label className="field">
            <span>Code</span>
            <input
              value={filters.code}
              onChange={(event) => setFilters((current) => ({ ...current, code: event.target.value }))}
              placeholder="Search production code"
            />
          </label>
          <label className="field">
            <span>Writer</span>
            <select value={filters.writerId} onChange={(event) => setFilters((current) => ({ ...current, writerId: event.target.value }))}>
              <option value="">All writers</option>
              {writers.map((writer) => (
                <option key={writer.id} value={writer.id}>
                  {writer.name}
                </option>
              ))}
            </select>
          </label>
          <label className="field">
            <span>POD lead</span>
            <select value={filters.podLeadId} onChange={(event) => setFilters((current) => ({ ...current, podLeadId: event.target.value }))}>
              <option value="">All POD leads</option>
              {podLeads.map((podLead) => (
                <option key={podLead.id} value={podLead.id}>
                  {podLead.name}
                </option>
              ))}
            </select>
          </label>
          <label className="field">
            <span>Type</span>
            <select
              value={filters.prodSuffix}
              onChange={(event) => setFilters((current) => ({ ...current, prodSuffix: event.target.value }))}
            >
              <option value="">All production types</option>
              {PRODUCTION_TYPE_OPTIONS.map((option) => (
                <option key={option} value={option}>
                  {PRODUCTION_TYPE_LABELS[option]}
                </option>
              ))}
            </select>
          </label>
        </div>
      </Panel>

      <Panel title="Ready scripts" description={`${rows.length} script(s) are ready for production.`}>
        {rows.length === 0 ? (
          <EmptyState title="Nothing ready yet" description="Strongly graded scripts show up here after production type is chosen." />
        ) : (
          <div className="table-shell">
            <table className="data-table">
              <thead>
                <tr>
                  <th>Code</th>
                  <th>Edit code</th>
                  <th>Show</th>
                  <th>Angle</th>
                  <th>Writer</th>
                  <th>POD lead</th>
                  <th>Type</th>
                  <th>Ready at</th>
                </tr>
              </thead>
              <tbody>
                {rows.map((assignment) => (
                  <tr key={assignment.id}>
                    <td>{assignment.code}</td>
                    <td>{assignment.editCode}</td>
                    <td>{assignment.show}</td>
                    <td>{assignment.angle}</td>
                    <td>{assignment.writerName}</td>
                    <td>{assignment.podLeadName}</td>
                    <td>
                      <Badge tone="success">
                        {assignment.prodSuffix ? PRODUCTION_TYPE_LABELS[assignment.prodSuffix] : "Ready"}
                      </Badge>
                    </td>
                    <td>{formatDateTime(assignment.productionReadyAt)}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </Panel>
    </div>
  );
}
