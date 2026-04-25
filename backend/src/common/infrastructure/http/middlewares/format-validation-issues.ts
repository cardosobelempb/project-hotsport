export type FastifyValidationIssue = {
  instancePath?: string;
  message?: string;
  keyword?: string;
  params?: {
    missingProperty?: unknown;
  };
};

export function formatValidationIssues(
  validation: FastifyValidationIssue[] = [],
) {
  return validation.map((issue) => {
    const field =
      typeof issue.params?.missingProperty === "string"
        ? issue.params.missingProperty
        : issue.instancePath
          ? issue.instancePath.replace(/^\//, "").replace(/\//g, ".")
          : "unknown";

    return {
      field,
      message: issue.message ?? "Campo inválido",
    };
  });
}
