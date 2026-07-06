package com.test.backend.config;

import org.springframework.http.ProblemDetail;
import org.springframework.web.bind.annotation.ExceptionHandler;
import org.springframework.web.bind.annotation.RestControllerAdvice;
import org.springframework.web.server.ResponseStatusException;

@RestControllerAdvice
public class GlobalExceptionHandler {

	@ExceptionHandler(ResponseStatusException.class)
	public ProblemDetail handleResponseStatusException(ResponseStatusException exception) {
		ProblemDetail problemDetail = ProblemDetail.forStatusAndDetail(
				exception.getStatusCode(),
				exception.getReason() == null ? "Request failed." : exception.getReason());
		problemDetail.setTitle(exception.getStatusCode().toString());
		return problemDetail;
	}
}
