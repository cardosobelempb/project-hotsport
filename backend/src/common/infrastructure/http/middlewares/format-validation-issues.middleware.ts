type FastifyValidationIssue = {
  instancePath?: string;
  message?: string;
  params?: {
    missingProperty?: unknown;
  };
};

export function getFieldName(issue: FastifyValidationIssue): string {
  if (typeof issue.params?.missingProperty === "string") {
    return issue.params.missingProperty;
  }

  if (typeof issue.instancePath === "string" && issue.instancePath.length > 0) {
    return issue.instancePath.replace(/^\//, "").replace(/\//g, ".");
  }

  return "unknown";
}

export function formatValidationIssues(
  validation: FastifyValidationIssue[] = [],
) {
  return validation.map((issue) => ({
    field: getFieldName(issue),
    message: issue.message ?? "Campo inválido",
  }));
}
