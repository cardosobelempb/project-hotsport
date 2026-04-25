import { StandardError } from "./standard.errror";

type ErrorIssue = {
  field: string;
  message: string;
};

type ErrorResponse = {
  statusCode: number;
  code?: string;
  error: string;
  message: string;
  path: string;
  timestamp: string;
  fieldName?: string;
  issues?: ErrorIssue[];
};

export function buildErrorResponse({
  error,
  path,
}: {
  error: StandardError;
  path: string;
}): ErrorResponse {
  const response: ErrorResponse = {
    statusCode: error.statusCode,
    error: error.error,
    message: error.message,
    path,
    timestamp: new Date().toISOString(),
  };

  if (error.code) {
    response.code = error.code;
  }

  if (error.fieldName) {
    response.fieldName = error.fieldName;
    response.issues = [
      {
        field: error.fieldName,
        message: error.message,
      },
    ];
  }

  return response;
}
